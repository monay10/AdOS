import { randomUUID } from 'node:crypto';

/**
 * DomainEvent — an immutable fact that happened in the domain.
 *
 * Events are the ONLY sanctioned way for bounded contexts to react to each
 * other (event-driven mandate). Every event is tenant-scoped and carries the
 * correlation/causation metadata needed for tracing and event sourcing.
 */
export interface DomainEventMetadata {
  readonly eventId: string;
  readonly occurredAt: string; // ISO-8601
  readonly tenantId: string;
  readonly correlationId: string;
  readonly causationId: string | undefined;
  readonly actor: string | undefined; // user/agent id that caused it
}

export abstract class DomainEvent<TPayload = unknown> {
  /** Stable, versioned event name, e.g. "campaign.launched.v1". */
  abstract readonly eventName: string;

  readonly metadata: DomainEventMetadata;

  constructor(
    readonly aggregateId: string,
    readonly payload: TPayload,
    metadata: Partial<DomainEventMetadata> & Pick<DomainEventMetadata, 'tenantId'>,
  ) {
    this.metadata = {
      eventId: metadata.eventId ?? randomUUID(),
      occurredAt: metadata.occurredAt ?? isoNow(),
      tenantId: metadata.tenantId,
      correlationId: metadata.correlationId ?? metadata.eventId ?? randomUUID(),
      causationId: metadata.causationId,
      actor: metadata.actor,
    };
  }

  toEnvelope(): DomainEventEnvelope<TPayload> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      payload: this.payload,
      metadata: this.metadata,
    };
  }
}

export interface DomainEventEnvelope<TPayload = unknown> {
  eventName: string;
  aggregateId: string;
  payload: TPayload;
  metadata: DomainEventMetadata;
}

/**
 * Injectable clock — callers may override for deterministic tests. Uses a
 * lazy indirection so the kernel stays dependency-free.
 */
let clock: () => string = () => new Date().toISOString();
export function setClock(fn: () => string): void {
  clock = fn;
}
function isoNow(): string {
  return clock();
}
