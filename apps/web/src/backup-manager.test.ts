import { describe, expect, it } from 'vitest';
import { SqliteDatabase } from '@ados/persistence';
import { InMemoryBackupArchiveStore, SqlBackupRepository } from '@ados/backup';
import { BackupManager } from './backup-manager.js';

async function seeded(): Promise<{ db: SqliteDatabase; mgr: BackupManager; rehydrated: () => number }> {
  const db = new SqliteDatabase(':memory:');
  await db.execute('CREATE TABLE demo (id INTEGER PRIMARY KEY, v TEXT)');
  await db.execute('INSERT INTO demo (id, v) VALUES (1, $1)', ['original']);
  let count = 0;
  // Durable catalogue in the same file (as in production), archives in memory.
  const mgr = new BackupManager(db, new SqlBackupRepository(db), new InMemoryBackupArchiveStore());
  mgr.setOnRestore(async () => {
    count += 1;
  });
  await mgr.init();
  return { db, mgr, rehydrated: () => count };
}

const v = async (db: SqliteDatabase): Promise<string> =>
  (await db.query<{ v: string }>('SELECT v FROM demo WHERE id = 1'))[0]!.v;

describe('BackupManager', () => {
  it('creates a checksummed, auto-validated backup and catalogues it', async () => {
    const { mgr } = await seeded();
    const rec = await mgr.createBackup();
    expect(rec.checksum).toMatch(/^[0-9a-f]{64}$/);
    expect(rec.sizeBytes).toBeGreaterThan(0);
    expect(rec.restoreValidated).toBe(true); // auto dry-run restore passed
    expect((await mgr.listBackups()).map((b) => b.id)).toEqual([rec.id]);
  });

  it('restores the durable store and rehydrates the app (round-trip)', async () => {
    const { db, mgr, rehydrated } = await seeded();
    const rec = await mgr.createBackup();

    await db.execute('UPDATE demo SET v = $1 WHERE id = 1', ['changed']);
    const report = await mgr.restore(rec.id);

    expect(report.ok).toBe(true);
    expect(report.dryRun).toBe(false);
    expect(report.restored).toContain('learned_state');
    expect(await v(db)).toBe('original'); // data replaced with the backup
    expect(rehydrated()).toBe(1); // in-memory state reloaded after restore
  });

  it('dry-run verify checks integrity WITHOUT touching the store or rehydrating', async () => {
    const { db, mgr, rehydrated } = await seeded();
    const rec = await mgr.createBackup();
    await db.execute('UPDATE demo SET v = $1 WHERE id = 1', ['changed']);

    const report = await mgr.verify(rec.id);
    expect(report.ok).toBe(true);
    expect(report.dryRun).toBe(true);
    expect(report.checks.integrity).toBe(true);
    expect(await v(db)).toBe('changed'); // untouched by a dry run
    expect(rehydrated()).toBe(0); // no rehydrate on a dry run
  });

  it('reports a missing backup honestly rather than throwing', async () => {
    const { mgr } = await seeded();
    const report = await mgr.verify('does-not-exist');
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toMatch(/not found/i);
  });

  it('never includes its own catalogue table in a backup', async () => {
    const { db, mgr } = await seeded();
    const rec = await mgr.createBackup();
    // The catalogue row exists after backup; restoring must not wipe/replace it.
    await mgr.restore(rec.id);
    const cat = await db.query<{ n: number }>('SELECT COUNT(*) AS n FROM backups');
    expect(Number(cat[0]!.n)).toBe(1); // catalogue survived the restore
  });
});
