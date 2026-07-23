import type { AggregateRoot } from './aggregate-root.js';
import type { Identifier } from '../identifiers/identifier.js';
import type { Result } from '../result/result.js';
import type { AppError } from '../errors/domain-error.js';

/**
 * Repository port (hexagonal). Domain depends on this interface only; concrete
 * persistence adapters live in the infrastructure layer. All operations are
 * tenant-scoped implicitly via the ambient tenant context.
 */
export interface Repository<TAggregate extends AggregateRoot<TId>, TId extends Identifier = Identifier> {
  findById(id: TId): Promise<Result<TAggregate | null, AppError>>;
  save(aggregate: TAggregate): Promise<Result<void, AppError>>;
  delete(id: TId): Promise<Result<void, AppError>>;
  exists(id: TId): Promise<boolean>;
}

/**
 * Unit of Work — brackets a transactional operation so that aggregate
 * persistence and outbox writes commit atomically.
 */
export interface UnitOfWork {
  run<T>(work: (ctx: UnitOfWorkContext) => Promise<T>): Promise<T>;
}

export interface UnitOfWorkContext {
  /** Opaque transaction handle passed to repository adapters. */
  readonly tx: unknown;
}
