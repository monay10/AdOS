import type { Pool } from 'pg';
import type { UnitOfWorkContext } from '@ados/kernel';
import type { Database } from './database.js';

/**
 * Postgres-backed {@link Database} — the production adapter. Built on
 * node-postgres with a connection pool. The `pg` driver is imported lazily so
 * that merely importing this package (e.g. to use {@link SqliteDatabase} in
 * tests) never loads the driver.
 *
 * It runs the same SQL as the SQLite adapter; only the driver differs. Object
 * parameters are JSON-serialised for the `jsonb` `data` column, and `jsonb`
 * reads come back already parsed.
 */
/** Connection-pool tuning. Sensible production defaults; override per deployment. */
export interface PostgresPoolOptions {
  /** Max pooled connections (default 20 — matches config `database.maxConnections`). */
  readonly maxConnections?: number;
  /** Close idle clients after this many ms (default 30s). */
  readonly idleTimeoutMillis?: number;
  /** Fail a checkout that waits longer than this (default 10s). */
  readonly connectionTimeoutMillis?: number;
}

export class PostgresDatabase implements Database {
  readonly dialect = 'postgres' as const;

  private constructor(private readonly pool: Pool) {}

  static async connect(connectionString: string, options: PostgresPoolOptions = {}): Promise<PostgresDatabase> {
    const { default: pg } = await import('pg');
    // Explicitly size the pool (node-postgres defaults to max 10 with no
    // connection timeout) so throughput and back-pressure are tunable.
    return new PostgresDatabase(
      new pg.Pool({
        connectionString,
        max: options.maxConnections ?? 20,
        idleTimeoutMillis: options.idleTimeoutMillis ?? 30_000,
        connectionTimeoutMillis: options.connectionTimeoutMillis ?? 10_000,
      }),
    );
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.pool.query(sql, params.map(toParam));
    return result.rows as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ rowCount: number }> {
    const result = await this.pool.query(sql, params.map(toParam));
    return { rowCount: result.rowCount ?? 0 };
  }

  async ping(): Promise<boolean> {
    await this.pool.query('SELECT 1');
    return true;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async run<T>(work: (ctx: UnitOfWorkContext) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work({ tx: client });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

/** Serialise object params to JSON text; the `jsonb` column casts it on the way in. */
function toParam(p: unknown): unknown {
  if (p !== null && typeof p === 'object' && !(p instanceof Date)) return JSON.stringify(p);
  return p;
}
