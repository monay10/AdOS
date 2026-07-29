import { describe, expect, it } from 'vitest';
import { SqliteDatabase, MigrationEngine } from '@ados/persistence';
import { BRAIN_DB_MIGRATIONS } from './migrations.js';

const has = async (db: SqliteDatabase, type: 'table' | 'index', name: string): Promise<boolean> =>
  Number(
    (await db.query<{ n: number }>('SELECT COUNT(*) AS n FROM sqlite_master WHERE type=$1 AND name=$2', [type, name]))[0]
      ?.n ?? 0,
  ) > 0;

describe('BRAIN_DB migrations', () => {
  it('builds the whole durable schema (tables + perf indexes) and verifies it', async () => {
    const db = new SqliteDatabase(':memory:');
    const outcome = await new MigrationEngine(db, BRAIN_DB_MIGRATIONS).run();

    expect(outcome.applied).toEqual(['0001_initial_schema', '0002_performance_indexes']);
    expect(outcome.verified).toBe(true);

    for (const t of [
      'brain_state',
      'exec_memory',
      'decision_journal',
      'decision_journal_archive',
      'mission_queue',
      'governance_decisions',
      'governance_calibration',
      'maintenance_log',
    ]) {
      expect(await has(db, 'table', t)).toBe(true);
    }
    expect(await has(db, 'index', 'ix_gov_decisions_gate_at')).toBe(true);
    expect(await has(db, 'index', 'ix_mission_queue_status_due')).toBe(true);
  });

  it('is idempotent on an already-migrated database', async () => {
    const db = new SqliteDatabase(':memory:');
    await new MigrationEngine(db, BRAIN_DB_MIGRATIONS).run();
    const again = await new MigrationEngine(db, BRAIN_DB_MIGRATIONS).run();
    expect(again.applied).toEqual([]);
    expect(again.verified).toBe(true);
  });

  it('coexists with a store that also creates its tables (IF NOT EXISTS)', async () => {
    const db = new SqliteDatabase(':memory:');
    // A store created its table before the engine ran (the current reality).
    await db.execute('CREATE TABLE IF NOT EXISTS brain_state (k TEXT PRIMARY KEY, data TEXT NOT NULL)');
    const outcome = await new MigrationEngine(db, BRAIN_DB_MIGRATIONS).run();
    expect(outcome.verified).toBe(true); // no conflict — IF NOT EXISTS
  });
});
