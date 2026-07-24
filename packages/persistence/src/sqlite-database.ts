import { createRequire } from 'node:module';
import type { DatabaseSync as DatabaseSyncType, StatementSync } from 'node:sqlite';
import type { UnitOfWorkContext } from '@ados/kernel';
import type { Database } from './database.js';

// `node:sqlite` is a recent Node builtin that some bundlers do not yet recognise
// as external; loading it via createRequire keeps it a runtime require (never
// statically analysed) while preserving full types.
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');

/**
 * SQLite-backed {@link Database} — the development/embedded adapter the port
 * anticipates ("SQLite for development"), built on Node's stable `node:sqlite`.
 * It executes the exact same SQL as the Postgres adapter (parameter placeholders
 * are rewritten from `$n` to `?`, and object parameters are JSON-serialised for
 * the text `data` column), so repository behaviour is identical across both.
 */
export class SqliteDatabase implements Database {
  readonly dialect = 'sqlite' as const;
  private readonly db: DatabaseSyncType;
  /** Prepared-statement cache: repositories run the same SQL constantly, so
   * compiling each statement once (instead of on every call) is a measurable
   * win with identical behaviour. */
  private readonly stmts = new Map<string, StatementSync>();

  constructor(filename = ':memory:') {
    this.db = new DatabaseSync(filename);
  }

  private prepare(sql: string): StatementSync {
    const translated = translate(sql);
    let stmt = this.stmts.get(translated);
    if (!stmt) {
      stmt = this.db.prepare(translated);
      this.stmts.set(translated, stmt);
    }
    return stmt;
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.prepare(sql).all(...bind(params)) as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ rowCount: number }> {
    const info = this.prepare(sql).run(...bind(params));
    return { rowCount: Number(info.changes) };
  }

  async ping(): Promise<boolean> {
    this.prepare('SELECT 1').get();
    return true;
  }

  async close(): Promise<void> {
    this.db.close();
  }

  async run<T>(work: (ctx: UnitOfWorkContext) => Promise<T>): Promise<T> {
    this.db.exec('BEGIN');
    try {
      const result = await work({ tx: this });
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
}

/** `$1, $2, …` → `?` (SQLite positional). Placeholders are always written in
 * ascending order, so positional binding matches the params array. */
function translate(sql: string): string {
  return sql.replace(/\$\d+/g, '?');
}

/** SQLite binds only primitives; serialise object params (the JSON `data`). */
function bind(params: unknown[]): Array<string | number | bigint | null | Uint8Array> {
  return params.map((p) => {
    if (p === null || p === undefined) return null;
    if (typeof p === 'object' && !(p instanceof Uint8Array)) return JSON.stringify(p);
    if (typeof p === 'boolean') return p ? 1 : 0;
    return p as string | number | bigint | Uint8Array;
  });
}
