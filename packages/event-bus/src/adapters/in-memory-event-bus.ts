import { randomUUID } from 'node:crypto';
import type { DomainEventEnvelope } from '@ados/kernel';
import type {
  EventBus,
  EventHandler,
  SubscribeOptions,
  Subscription,
} from '../event-bus.port.js';

interface Registration {
  id: string;
  pattern: string;
  handler: EventHandler;
}

/**
 * In-process EventBus for tests and single-node development. Delivery is
 * asynchronous (next microtask) to mirror real bus semantics; handler errors
 * are captured and surfaced via the optional onError sink instead of crashing
 * the publisher.
 */
export class InMemoryEventBus implements EventBus {
  private readonly registrations = new Map<string, Registration>();

  constructor(private readonly onError: (err: unknown, envelope: DomainEventEnvelope) => void = () => {}) {}

  async publish(events: DomainEventEnvelope | DomainEventEnvelope[]): Promise<void> {
    const list = Array.isArray(events) ? events : [events];
    for (const envelope of list) {
      for (const reg of this.registrations.values()) {
        if (!matches(reg.pattern, envelope.eventName)) continue;
        await Promise.resolve().then(() => reg.handler(envelope)).catch((e) => this.onError(e, envelope));
      }
    }
  }

  async subscribe<TPayload = unknown>(
    pattern: string,
    handler: EventHandler<TPayload>,
    _options?: SubscribeOptions,
  ): Promise<Subscription> {
    const id = randomUUID();
    this.registrations.set(id, { id, pattern, handler: handler as EventHandler });
    return {
      id,
      unsubscribe: async () => {
        this.registrations.delete(id);
      },
    };
  }

  async close(): Promise<void> {
    this.registrations.clear();
  }
}

/** NATS-style subject matching: "*" one token, ">" one-or-more trailing tokens. */
export function matches(pattern: string, subject: string): boolean {
  if (pattern === subject) return true;
  const p = pattern.split('.');
  const s = subject.split('.');
  for (let i = 0; i < p.length; i++) {
    const token = p[i]!;
    if (token === '>') return true;
    if (i >= s.length) return false;
    if (token === '*') continue;
    if (token !== s[i]) return false;
  }
  return p.length === s.length;
}
