import type { DomainEventEnvelope } from '@ados/kernel';
import type { EventBus } from './event-bus.port.js';

/**
 * Transactional Outbox — guarantees that domain events are published if and
 * only if the state change that produced them committed.
 *
 * Aggregate persistence writes events into an outbox table in the SAME
 * transaction. A relay then reads unpublished rows, publishes them to the
 * EventBus, and marks them sent. This store port is implemented by the
 * persistence adapter (Postgres/SQLite).
 */
export interface OutboxRecord {
  id: string;
  envelope: DomainEventEnvelope;
  createdAt: string;
  publishedAt: string | null;
  attempts: number;
}

export interface OutboxStore {
  /** Fetch a batch of unpublished records, oldest first. */
  fetchUnpublished(limit: number): Promise<OutboxRecord[]>;
  markPublished(ids: string[]): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}

/** Relays outbox records to the bus. Run on an interval or triggered by NOTIFY. */
export class OutboxRelay {
  constructor(
    private readonly store: OutboxStore,
    private readonly bus: EventBus,
    private readonly batchSize = 100,
  ) {}

  /** Drain one batch. Returns the number of events published. */
  async drainOnce(): Promise<number> {
    const records = await this.store.fetchUnpublished(this.batchSize);
    if (records.length === 0) return 0;

    const published: string[] = [];
    for (const record of records) {
      try {
        await this.bus.publish(record.envelope);
        published.push(record.id);
      } catch (e) {
        await this.store.markFailed(record.id, e instanceof Error ? e.message : String(e));
      }
    }
    if (published.length > 0) await this.store.markPublished(published);
    return published.length;
  }
}
