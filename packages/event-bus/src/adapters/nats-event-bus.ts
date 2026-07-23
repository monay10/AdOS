import { randomUUID } from 'node:crypto';
import {
  connect,
  JSONCodec,
  type NatsConnection,
  type JetStreamClient,
  type JetStreamManager,
} from 'nats';
import type { DomainEventEnvelope } from '@ados/kernel';
import type {
  EventBus,
  EventHandler,
  SubscribeOptions,
  Subscription,
} from '../event-bus.port.js';

const codec = JSONCodec<DomainEventEnvelope>();

export interface NatsEventBusOptions {
  url: string;
  stream: string;
  /** Subject prefix; final subject is `${prefix}.${eventName}`. */
  subjectPrefix?: string;
}

/**
 * Production EventBus backed by NATS JetStream — durable, at-least-once,
 * replayable (event sourcing friendly). Events are stored in a JetStream
 * stream so consumers can be added, replayed, or recovered after downtime.
 */
export class NatsEventBus implements EventBus {
  private nc!: NatsConnection;
  private js!: JetStreamClient;
  private jsm!: JetStreamManager;
  private readonly prefix: string;
  private readonly subscriptions = new Set<{ stop: () => Promise<void> }>();

  private constructor(private readonly options: NatsEventBusOptions) {
    this.prefix = options.subjectPrefix ?? 'ados';
  }

  static async connect(options: NatsEventBusOptions): Promise<NatsEventBus> {
    const bus = new NatsEventBus(options);
    bus.nc = await connect({ servers: options.url, name: 'ados-event-bus', reconnect: true });
    bus.js = bus.nc.jetstream();
    bus.jsm = await bus.nc.jetstreamManager();
    await bus.ensureStream();
    return bus;
  }

  private async ensureStream(): Promise<void> {
    const subjects = [`${this.prefix}.>`];
    try {
      await this.jsm.streams.info(this.options.stream);
    } catch {
      await this.jsm.streams.add({ name: this.options.stream, subjects });
    }
  }

  async publish(events: DomainEventEnvelope | DomainEventEnvelope[]): Promise<void> {
    const list = Array.isArray(events) ? events : [events];
    await Promise.all(
      list.map((envelope) =>
        this.js.publish(`${this.prefix}.${envelope.eventName}`, codec.encode(envelope), {
          // Dedupe window uses the event id as the JetStream msg id.
          msgID: envelope.metadata.eventId,
        }),
      ),
    );
  }

  async subscribe<TPayload = unknown>(
    pattern: string,
    handler: EventHandler<TPayload>,
    options: SubscribeOptions = {},
  ): Promise<Subscription> {
    const subject = `${this.prefix}.${pattern}`;
    const durable = options.durable ?? `c-${pattern.replace(/[.*>]/g, '_')}`;
    const sub = await this.js.subscribe(subject, {
      ...(options.queueGroup ? { queue: options.queueGroup } : {}),
      config: {
        durable_name: durable,
        max_deliver: options.maxDeliver ?? 5,
        ack_wait: 30_000_000_000, // 30s in ns
      },
    });

    const id = randomUUID();
    let running = true;
    const pump = (async () => {
      for await (const msg of sub) {
        if (!running) break;
        try {
          await handler(codec.decode(msg.data) as DomainEventEnvelope<TPayload>);
          msg.ack();
        } catch {
          // Negative-ack: JetStream redelivers up to max_deliver, then DLQs.
          msg.nak();
        }
      }
    })();

    const entry = {
      stop: async () => {
        running = false;
        await sub.drain();
        await pump;
      },
    };
    this.subscriptions.add(entry);

    return {
      id,
      unsubscribe: async () => {
        await entry.stop();
        this.subscriptions.delete(entry);
      },
    };
  }

  async close(): Promise<void> {
    await Promise.all([...this.subscriptions].map((s) => s.stop()));
    this.subscriptions.clear();
    await this.nc.drain();
  }
}
