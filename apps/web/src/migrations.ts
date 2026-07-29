import type { Migration, QueryExecutor } from '@ados/persistence';

/**
 * The versioned schema for the durable local store (`BRAIN_DB`), applied by the
 * {@link MigrationEngine} at startup (Series 3 · Deployment · Sprint 2).
 *
 * This is the AUTHORITATIVE schema for a fresh deployment. The individual stores
 * still run `CREATE TABLE IF NOT EXISTS` in their own `init()` (idempotent, kept
 * for the in-memory/test paths that construct a store without the engine), so
 * the two coexist safely; forward schema evolution (new tables, indexes, columns)
 * now belongs here as new, ordered migrations rather than scattered ad-hoc DDL.
 */

/** True when a table/index of the given name exists (SQLite catalogue). */
async function exists(exec: QueryExecutor, type: 'table' | 'index', name: string): Promise<boolean> {
  const rows = await exec.query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM sqlite_master WHERE type = $1 AND name = $2",
    [type, name],
  );
  return Number(rows[0]?.n ?? 0) > 0;
}

const DURABLE_TABLES = [
  'brain_state',
  'exec_memory',
  'decision_journal',
  'decision_journal_archive',
  'mission_queue',
  'governance_decisions',
  'governance_calibration',
  'maintenance_log',
] as const;

const initialSchema: Migration = {
  id: '0001_initial_schema',
  async up(exec) {
    await exec.execute('CREATE TABLE IF NOT EXISTS brain_state (k TEXT PRIMARY KEY, data TEXT NOT NULL)');
    await exec.execute('CREATE TABLE IF NOT EXISTS exec_memory (k TEXT PRIMARY KEY, data TEXT NOT NULL)');
    await exec.execute('CREATE TABLE IF NOT EXISTS decision_journal (k TEXT PRIMARY KEY, data TEXT NOT NULL)');
    await exec.execute(
      'CREATE TABLE IF NOT EXISTS decision_journal_archive (id TEXT PRIMARY KEY, tenant_id TEXT, at TEXT, data TEXT NOT NULL)',
    );
    await exec.execute(`CREATE TABLE IF NOT EXISTS mission_queue (
      mission_id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      vertical TEXT NOT NULL,
      kind TEXT NOT NULL,
      objective TEXT NOT NULL,
      status TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL,
      next_attempt_at INTEGER NOT NULL DEFAULT 0,
      lease_expires_at INTEGER,
      last_error TEXT,
      enqueued_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`);
    await exec.execute(
      'CREATE TABLE IF NOT EXISTS governance_decisions (id INTEGER PRIMARY KEY AUTOINCREMENT, tenant_id TEXT, gate TEXT, flagged INTEGER, acknowledged INTEGER, review_ms INTEGER, capability TEXT, at TEXT)',
    );
    await exec.execute(
      'CREATE TABLE IF NOT EXISTS governance_calibration (gate TEXT PRIMARY KEY, state TEXT NOT NULL, since TEXT NOT NULL, reason TEXT, updated_at TEXT NOT NULL)',
    );
    await exec.execute(
      'CREATE TABLE IF NOT EXISTS maintenance_log (at TEXT NOT NULL, kind TEXT NOT NULL, reclaimed_bytes INTEGER NOT NULL DEFAULT 0, detail TEXT)',
    );
  },
  async verify(exec) {
    for (const t of DURABLE_TABLES) if (!(await exists(exec, 'table', t))) return false;
    return true;
  },
};

/**
 * Real forward schema evolution the stores do NOT do: indexes for the two hottest
 * lookups — the Auto-Calibration engine's `recentByGate` (governance_decisions by
 * gate, newest first) and the queue's claim (`mission_queue` by status + due time).
 * Demonstrates the engine applying an ordered change beyond the baseline.
 */
const performanceIndexes: Migration = {
  id: '0002_performance_indexes',
  async up(exec) {
    await exec.execute(
      'CREATE INDEX IF NOT EXISTS ix_gov_decisions_gate_at ON governance_decisions (gate, at)',
    );
    await exec.execute(
      'CREATE INDEX IF NOT EXISTS ix_mission_queue_status_due ON mission_queue (status, next_attempt_at)',
    );
  },
  async verify(exec) {
    return (
      (await exists(exec, 'index', 'ix_gov_decisions_gate_at')) &&
      (await exists(exec, 'index', 'ix_mission_queue_status_due'))
    );
  },
};

/** The ordered BRAIN_DB migration registry. Append new migrations; never edit past ones. */
export const BRAIN_DB_MIGRATIONS: readonly Migration[] = [initialSchema, performanceIndexes];
