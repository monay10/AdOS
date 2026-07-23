import { Entity } from './entity.js';
import type { DomainEvent } from './domain-event.js';
import { Identifier } from '../identifiers/identifier.js';

/**
 * AggregateRoot — the consistency boundary and transactional unit of the domain.
 *
 * State changes are recorded as domain events on the aggregate. The application
 * layer pulls these via `pullDomainEvents()` after persistence and hands them to
 * the event bus (transactional outbox). Aggregates never publish directly.
 */
export abstract class AggregateRoot<TId extends Identifier = Identifier> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = [];
  private _version = 0;

  /** Optimistic-concurrency version, incremented per applied event. */
  get version(): number {
    return this._version;
  }

  get domainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
    this._version += 1;
  }

  /** Drain recorded events for publication; leaves the aggregate clean. */
  pullDomainEvents(): DomainEvent[] {
    const events = this._domainEvents;
    this._domainEvents = [];
    return events;
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
