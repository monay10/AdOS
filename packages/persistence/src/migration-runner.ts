import type { Database, Migration } from './database.js';

export type SqlDialectName = 'postgres' | 'sqlite';

/**
 * The base schema every deployment needs: the generic aggregate store plus a
 * migrations ledger. DDL differs per dialect only in the JSON column type and
 * the auto-incrementing order column; the DML in {@link SqlAggregateStore} is
 * identical across both.
 */
const SCHEMA: Record<SqlDialectName, string[]> = {
  postgres: [
    `CREATE TABLE IF NOT EXISTS aggregates (
       kind text NOT NULL,
       id text NOT NULL,
       tenant_id text NOT NULL,
       data jsonb NOT NULL,
       seq bigint GENERATED ALWAYS AS IDENTITY,
       updated_at text NOT NULL,
       PRIMARY KEY (kind, id)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_aggregates_kind_tenant_seq ON aggregates (kind, tenant_id, seq)`,
  ],
  sqlite: [
    `CREATE TABLE IF NOT EXISTS aggregates (
       seq INTEGER PRIMARY KEY AUTOINCREMENT,
       kind text NOT NULL,
       id text NOT NULL,
       tenant_id text NOT NULL,
       data text NOT NULL,
       updated_at text NOT NULL,
       UNIQUE (kind, id)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_aggregates_kind_tenant_seq ON aggregates (kind, tenant_id, seq)`,
  ],
};

/** The forward-only base migration that creates the aggregate store. */
export function schemaMigration(dialect: SqlDialectName): Migration {
  return {
    id: '0001_aggregate_store',
    up: async (exec) => {
      for (const sql of SCHEMA[dialect]) await exec.execute(sql);
    },
  };
}

/**
 * Apply the base schema plus any extra migrations, once each, tracked in a
 * `schema_migrations` ledger. Forward-only and idempotent: re-running is a
 * no-op. This is the {@link MigrationRunner} the port anticipates.
 */
export async function runMigrations(
  db: Database & { readonly dialect: SqlDialectName },
  extra: Migration[] = [],
): Promise<{ applied: string[] }> {
  await db.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, applied_at text NOT NULL)`);
  const done = new Set((await db.query<{ id: string }>(`SELECT id FROM schema_migrations`)).map((r) => r.id));

  const applied: string[] = [];
  for (const migration of [schemaMigration(db.dialect), ...extra]) {
    if (done.has(migration.id)) continue;
    await migration.up(db);
    await db.execute(`INSERT INTO schema_migrations (id, applied_at) VALUES ($1, $2)`, [migration.id, new Date().toISOString()]);
    applied.push(migration.id);
  }
  return { applied };
}
