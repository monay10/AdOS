import { describe, expect, it } from 'vitest';
import { SqliteDatabase } from './sqlite-database.js';
import { MigrationEngine } from './migration-engine.js';
import type { Migration } from './database.js';

const FIXED = () => Date.parse('2026-07-29T00:00:00.000Z');

const createT = (id: string, table: string): Migration => ({
  id,
  up: async (exec) => {
    await exec.execute(`CREATE TABLE ${table} (a TEXT)`);
  },
  verify: async (exec) => {
    const rows = await exec.query<{ n: number }>(
      "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name=$1",
      [table],
    );
    return Number(rows[0]?.n ?? 0) === 1;
  },
});

const tableExists = async (db: SqliteDatabase, name: string): Promise<boolean> =>
  Number(
    (await db.query<{ n: number }>("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name=$1", [name]))[0]
      ?.n ?? 0,
  ) === 1;

describe('MigrationEngine', () => {
  it('plans the pending chain from the current version, then applies + verifies it', async () => {
    const db = new SqliteDatabase(':memory:');
    const engine = new MigrationEngine(db, [createT('0001_a', 'a'), createT('0002_b', 'b')], FIXED);

    const before = await engine.plan();
    expect(before.current).toBeNull();
    expect(before.pending).toEqual(['0001_a', '0002_b']);

    const outcome = await engine.run();
    expect(outcome.applied).toEqual(['0001_a', '0002_b']);
    expect(outcome.verified).toBe(true);
    expect(await tableExists(db, 'a')).toBe(true);
    expect(await tableExists(db, 'b')).toBe(true);
    expect((await engine.history()).map((r) => r.id)).toEqual(['0001_a', '0002_b']);
  });

  it('is idempotent — re-running applies nothing', async () => {
    const db = new SqliteDatabase(':memory:');
    const engine = new MigrationEngine(db, [createT('0001_a', 'a')], FIXED);
    await engine.run();
    const again = await engine.run();
    expect(again.applied).toEqual([]);
    expect((await engine.plan()).pending).toEqual([]);
  });

  it('applies only the NEW migrations when the registry grows', async () => {
    const db = new SqliteDatabase(':memory:');
    await new MigrationEngine(db, [createT('0001_a', 'a')], FIXED).run();
    // A later release ships one more migration.
    const outcome = await new MigrationEngine(db, [createT('0001_a', 'a'), createT('0002_b', 'b')], FIXED).run();
    expect(outcome.applied).toEqual(['0002_b']);
    expect(await tableExists(db, 'b')).toBe(true);
  });

  it('rolls a failing migration back cleanly and stops the chain', async () => {
    const db = new SqliteDatabase(':memory:');
    const bad: Migration = {
      id: '0002_bad',
      up: async (exec) => {
        await exec.execute('CREATE TABLE half (a TEXT)'); // partial work inside the tx
        throw new Error('boom');
      },
    };
    const engine = new MigrationEngine(db, [createT('0001_a', 'a'), bad, createT('0003_c', 'c')], FIXED);

    await expect(engine.run()).rejects.toThrow(/0002_bad.*rolled back/);
    // 0001 committed; the failing migration left NO table and NO ledger row; 0003 never ran.
    expect(await tableExists(db, 'a')).toBe(true);
    expect(await tableExists(db, 'half')).toBe(false); // rolled back
    expect(await tableExists(db, 'c')).toBe(false); // chain stopped
    expect((await engine.history()).map((r) => r.id)).toEqual(['0001_a']);
  });

  it('fails loudly when a migration applies but its verification does not pass', async () => {
    const db = new SqliteDatabase(':memory:');
    const liar: Migration = {
      id: '0001_liar',
      up: async () => {
        /* claims success but creates nothing */
      },
      verify: async () => false,
    };
    const engine = new MigrationEngine(db, [liar], FIXED);
    await expect(engine.run()).rejects.toThrow(/verification failed/i);
  });
});
