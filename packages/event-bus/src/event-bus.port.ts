import type { DomainEventEnvelope } from '@ados/kernel';

/**
 * EventBus — the platform's asynchronous backbone (hexagonal port).
 *
 * Bounded contexts publish domain events here after committing state; other
 * contexts and agents subscribe. Adapters (in-memory for tests, NATS JetStream
 * for production) implement this contract. No context ever imports another
 * context's code — they integrate exclusively through these envelopes.
 */
export interface EventHandler<TPayload = unknown> {
  (envelope: DomainEventEnvelope<TPayload>): Promise<void>;
}

export interface Subscription {
  readonly id: string;
  unsubscribe(): Promise<void>;
}

export interface SubscribeOptions {
  /** Durable consumer name — enables at-least-once redelivery across restarts. */
  durable?: string;
  /** Optional consumer group; one member of the group receives each event. */
  queueGroup?: string;
  /** Max delivery attempts before routing to the dead-letter stream. */
  maxDeliver?: number;
}

export interface EventBus {
  /** Publish one or more events. Subject is derived from `eventName`. */
  publish(events: DomainEventEnvelope | DomainEventEnvelope[]): Promise<void>;

  /**
   * Subscribe to events by name. Supports exact ("campaign.launched.v1") and
   * wildcard ("campaign.*", "campaign.>") patterns.
   */
  subscribe<TPayload = unknown>(
    pattern: string,
    handler: EventHandler<TPayload>,
    options?: SubscribeOptions,
  ): Promise<Subscription>;

  /** Flush in-flight publishes and close connections. */
  close(): Promise<void>;
}

export const EVENT_BUS = Symbol.for('ados.EventBus');
