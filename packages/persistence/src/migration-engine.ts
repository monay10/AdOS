import type { UnitOfWorkContext } from '@ados/kernel';
import type { Migration, QueryExecutor } from './database.js';

/**
 * Versioned schema migration ENGINE (Series 3 · Deployment · Sprint 2).
 *
 * Not a bare "run some SQL at startup" runner — a small, dialect-agnostic engine
 * with the full lifecycle:
 *
 *     current schema → plan pending chain → apply each in a transaction
 *                    → rollback on failure → verify → done
 *
 * Properties (each is exercised by a test):
 *  - **Ordered** — migrations apply in registry order, once each.
 *  - **Idempotent** — an already-applied migration is skipped; re-running is a no-op.
 *  - **Transactional** — every migration AND its ledger row commit together, so a
 *    failure leaves NO partial schema and NO ledger entry (clean rollback).
 *  - **History** — the `schema_migrations` ledger records what ran and when.
 *  - **Verified** — after applying, every registered migration's optional `verify`
 *    runs; a failure aborts loudly rather than serving on a bad schema.
 *
 * Dialect-agnostic: it uses only the `QueryExecutor` + a `run()` transaction, so
 * the same engine drives the local SQLite store today and Postgres later.
 */

export interface MigrationRecord {
  id: string;
  appliedAt: string;
}

export interface MigrationPlan {
  /** The latest applied migration id, or null on a fresh database. */
  current: string | null;
  applied: string[];
  pending: string[];
}

export interface MigrationOutcome {
  applied: string[];
  verified: boolean;
  issues: string[];
}

/** The minimal database surface the engine needs (SQLite + Postgres both satisfy it). */
export interface MigratableDatabase extends QueryExecutor {
  run<T>(work: (ctx: UnitOfWorkContext) => Promise<T>): Promise<T>;
}

const LEDGER = 'schema_migrations';

export class MigrationEngine {
  constructor(
    private readonly db: MigratableDatabase,
    private readonly registry: readonly Migration[],
    private readonly clock: () => number = () => Date.now(),
  ) {}

  /** Ensure the history ledger exists (idempotent). */
  async init(): Promise<void> {
    await this.db.execute(
      `CREATE TABLE IF NOT EXISTS ${LEDGER} (id text PRIMARY KEY, applied_at text NOT NULL)`,
    );
  }

  /** The applied-migration history, oldest first. */
  async history(): Promise<MigrationRecord[]> {
    await this.init();
    const rows = await this.db.query<{ id: string; applied_at: string }>(
      `SELECT id, applied_at FROM ${LEDGER} ORDER BY applied_at, id`,
    );
    return rows.map((r) => ({ id: r.id, appliedAt: r.applied_at }));
  }

  /** Read the current version and compute the ordered pending chain. */
  async plan(): Promise<MigrationPlan> {
    const applied = (await this.history()).map((r) => r.id);
    const appliedSet = new Set(applied);
    const pending = this.registry.filter((m) => !appliedSet.has(m.id)).map((m) => m.id);
    return { current: applied.length ? applied[applied.length - 1]! : null, applied, pending };
  }

  /**
   * Apply the pending chain, each migration + its ledger row in ONE transaction,
   * then verify. Throws (after a clean rollback) on the first failing migration,
   * or after applying if verification fails — startup should halt, never serve a
   * half-migrated schema.
   */
  async run(): Promise<MigrationOutcome> {
    const { pending } = await this.plan();
    const applied: string[] = [];
    for (const id of pending) {
      const migration = this.registry.find((m) => m.id === id)!;
      try {
        await this.db.run(async (ctx) => {
          const tx = ctx.tx as QueryExecutor;
          await migration.up(tx);
          await tx.execute(`INSERT INTO ${LEDGER} (id, applied_at) VALUES ($1, $2)`, [
            id,
            new Date(this.clock()).toISOString(),
          ]);
        });
      } catch (e) {
        // The transaction rolled back: this migration left no schema change and no
        // ledger row. Stop the chain and surface it — do not limp forward.
        throw new Error(
          `Migration "${id}" failed and was rolled back: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
      applied.push(id);
    }
    const { ok, issues } = await this.verify();
    if (!ok) throw new Error(`Schema verification failed after migration: ${issues.join('; ')}`);
    return { applied, verified: ok, issues };
  }

  /** Every registered migration is applied and passes its optional `verify`. */
  async verify(): Promise<{ ok: boolean; issues: string[] }> {
    const issues: string[] = [];
    const appliedSet = new Set((await this.history()).map((r) => r.id));
    for (const m of this.registry) {
      if (!appliedSet.has(m.id)) {
        issues.push(`migration ${m.id} not applied`);
        continue;
      }
      if (m.verify && !(await m.verify(this.db))) issues.push(`verification failed for ${m.id}`);
    }
    return { ok: issues.length === 0, issues };
  }
}
