import type { UnitOfWork, UnitOfWorkContext } from '@ados/kernel';

/**
 * Database Layer ports. Concrete adapters (Postgres for production, SQLite for
 * development — per the recommended stack) implement these. Domain repositories
 * depend only on the port, never on a driver.
 *
 * Multi-tenancy strategy: a single database with a `tenant_id` column on every
 * table, enforced by Row-Level Security AND by every query passing through the
 * ambient TenantContext. Adapters MUST scope reads/writes to the current tenant.
 */
export interface QueryExecutor {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }>;
}

export interface Database extends QueryExecutor, UnitOfWork {
  /** Liveness probe used by health checks. */
  ping(): Promise<boolean>;
  close(): Promise<void>;
}

/** Transaction context handed to repositories inside a UnitOfWork.run(). */
export interface TransactionContext extends UnitOfWorkContext {
  readonly tx: QueryExecutor;
}

/**
 * Migration runner port. Migrations are versioned, forward-only, and idempotent;
 * every domain contributes its own migration set discovered at startup.
 */
export interface Migration {
  id: string; // "0001_create_outbox"
  up(exec: QueryExecutor): Promise<void>;
}

export interface MigrationRunner {
  run(migrations: Migration[]): Promise<{ applied: string[] }>;
}
