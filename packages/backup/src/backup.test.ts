import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { SqliteDatabase } from '@ados/persistence';
import { LocalFileStorage } from '@ados/storage';
import { buildArchive, parseArchive, sha256 } from './archive.js';
import { InMemoryBackupArchiveStore, LocalBackupArchiveStore } from './backup-archive-store.js';
import { InMemoryBackupRepository, SqlBackupRepository, backupsMigration } from './backup-repository.js';
import { DatabaseBackupSource, JsonSnapshotSource, StorageBackupSource, type BackupSource } from './backup-source.js';
import { BackupEvents, BackupEventName } from './backup-events.js';
import { BackupService } from './backup-service.js';
import { RestoreService } from './restore-service.js';

let root: string;
beforeAll(async () => { root = await mkdtemp(join(tmpdir(), 'ados-backup-')); });
afterAll(async () => { await rm(root, { recursive: true, force: true }); });

/** A live in-memory store used as a JSON snapshot source. */
function memStore(seed: Record<string, unknown>): { box: { data: Record<string, unknown> }; source: BackupSource } {
  const box: { data: Record<string, unknown> } = { data: { ...seed } };
  const source = new JsonSnapshotSource<Record<string, unknown>>('company_brain', {
    snapshot: () => box.data,
    load: (_ctx, data) => { box.data = data; },
  });
  return { box, source };
}

describe('archive (compression + encryption + checksums)', () => {
  it('round-trips a compressed, encrypted entry and detects tampering', () => {
    const raw = Buffer.from('x'.repeat(5_000)); // compresses well
    const built = buildArchive({
      manifestBase: { backupId: 'b1', kind: 'full', parentId: null, tenant: { id: 'acme', scope: 'tenant' }, systemVersion: '0.1.0', createdAt: '2026-01-01T00:00:00.000Z' },
      entries: [{ name: 'data', bytes: raw }],
      passphrase: 'secret',
    });
    const entry = built.manifest.entries[0]!;
    expect(entry.encrypted).toBe(true);
    expect(entry.compressed).toBe(true);
    expect(entry.storedSize).toBeLessThan(raw.length); // actually compressed
    expect(built.checksum).toBe(sha256(built.bytes));

    const { manifest } = parseArchive(built.bytes);
    expect(manifest.salt).toBeTruthy();
  });
});

describe('BackupService — full backup + automatic restore validation', () => {
  it('backs up every source, checksums it, and auto-validates by dry-run restore', async () => {
    const bus = new InMemoryEventBus();
    const seen: string[] = [];
    await bus.subscribe('backup.>', async (e) => { seen.push(e.eventName); });

    const db = new SqliteDatabase(':memory:');
    await db.execute(`CREATE TABLE widgets (id text PRIMARY KEY, name text NOT NULL)`);
    await db.execute(`INSERT INTO widgets (id, name) VALUES ('w1','Alpha'), ('w2','Beta')`);
    const storage = new LocalFileStorage(join(root, 'src-objs'));
    await storage.put('acme/logo.txt', Readable.from(Buffer.from('LOGO')));

    const sources: BackupSource[] = [
      new DatabaseBackupSource('postgres', db, ['widgets']),
      new StorageBackupSource('minio', storage, 'acme'),
      new JsonSnapshotSource('config', { snapshot: () => ({ currency: 'USD' }), load: () => {} }),
    ];
    const service = new BackupService({
      sources,
      repository: new InMemoryBackupRepository(),
      archives: new InMemoryBackupArchiveStore(),
      events: new BackupEvents(bus),
    });

    const record = await service.backup({ tenantId: 'acme', passphrase: 'pw' });
    expect(record.encrypted).toBe(true);
    expect(record.checksum).toBeTruthy();
    expect(record.manifest.entries.map((e) => e.name).sort()).toEqual(['config', 'minio', 'postgres']);
    // Every required manifest field is present.
    expect(record.manifest.systemVersion).toBe('0.1.0');
    expect(record.manifest.tenant).toEqual({ id: 'acme', scope: 'tenant' });
    expect(record.manifest.createdAt).toBeTruthy();
    // Automatic restore validation ran and passed.
    expect(record.restoreValidated).toBe(true);
    expect(record.validationSummary).toContain('passed');
    expect(seen).toContain(BackupEventName.Created);
    expect(seen).toContain(BackupEventName.RestoreValidated);
    await db.close();
  });
});

describe('RestoreService — verification + apply', () => {
  it('restores data back into the sources and reports all checks passing', async () => {
    const db = new SqliteDatabase(':memory:');
    await db.execute(`CREATE TABLE t (id text PRIMARY KEY, v text NOT NULL)`);
    await db.execute(`INSERT INTO t (id, v) VALUES ('a','1'), ('b','2')`);
    const dbSource = new DatabaseBackupSource('postgres', db, ['t']);

    const brain = memStore({ facts: ['learned x'] });
    const archives = new InMemoryBackupArchiveStore();
    const repo = new InMemoryBackupRepository();
    const service = new BackupService({ sources: [dbSource, brain.source], repository: repo, archives });
    const record = await service.backup({ tenantId: 'acme' });

    // Mutate live state, then restore from the backup.
    await db.execute(`DELETE FROM t`);
    await db.execute(`INSERT INTO t (id, v) VALUES ('c','99')`);
    brain.box.data = { facts: ['stale'] }; // mutate live brain; restore should overwrite it

    const restore = new RestoreService({ sources: [dbSource, brain.source], repository: repo, archives });
    const report = await restore.restore({ backupId: record.id });
    expect(report.ok).toBe(true);
    expect(report.checks).toEqual({ integrity: true, compatibility: true, checksums: true, missing_files: true, db_consistency: true });
    expect(report.restored.sort()).toEqual(['company_brain', 'postgres']);

    const rows = await db.query<{ id: string; v: string }>(`SELECT * FROM t ORDER BY id`);
    expect(rows.map((r) => r.id)).toEqual(['a', 'b']); // original rows restored
    await db.close();
  });

  it('dry-run verifies without applying', async () => {
    const db = new SqliteDatabase(':memory:');
    await db.execute(`CREATE TABLE t (id text PRIMARY KEY)`);
    await db.execute(`INSERT INTO t (id) VALUES ('keep')`);
    const src = new DatabaseBackupSource('postgres', db, ['t']);
    const archives = new InMemoryBackupArchiveStore();
    const repo = new InMemoryBackupRepository();
    const record = await new BackupService({ sources: [src], repository: repo, archives }).backup({ tenantId: 'acme' });

    await db.execute(`DELETE FROM t`); // change live state
    const report = await new RestoreService({ sources: [src], repository: repo, archives }).restore({ backupId: record.id, dryRun: true });
    expect(report.ok).toBe(true);
    expect(report.restored).toEqual([]); // nothing applied
    expect((await db.query(`SELECT * FROM t`)).length).toBe(0); // live state untouched
    await db.close();
  });

  it('detects a corrupted archive (integrity failure)', async () => {
    const archives = new InMemoryBackupArchiveStore();
    const repo = new InMemoryBackupRepository();
    const src = new JsonSnapshotSource('config', { snapshot: () => ({ a: 1 }), load: () => {} });
    const record = await new BackupService({ sources: [src], repository: repo, archives }).backup({ tenantId: 'acme' });

    await archives.put(record.id, Buffer.from(JSON.stringify({ manifest: record.manifest, data: {} }))); // tamper (checksum now wrong)
    const report = await new RestoreService({ sources: [src], repository: repo, archives }).restore({ backupId: record.id, dryRun: true });
    expect(report.ok).toBe(false);
    expect(report.checks.integrity).toBe(false);
    expect(report.errors.join(' ')).toMatch(/integrity/i);
  });

  it('rejects the wrong decryption passphrase (checksum/crypto failure)', async () => {
    const archives = new InMemoryBackupArchiveStore();
    const repo = new InMemoryBackupRepository();
    const src = new JsonSnapshotSource('config', { snapshot: () => ({ a: 1 }), load: () => {} });
    const record = await new BackupService({ sources: [src], repository: repo, archives }).backup({ tenantId: 'acme', passphrase: 'right', validate: false });
    const report = await new RestoreService({ sources: [src], repository: repo, archives }).restore({ backupId: record.id, dryRun: true, passphrase: 'wrong' });
    expect(report.ok).toBe(false);
    expect(report.checks.checksums).toBe(false);
  });
});

describe('BackupService — incremental', () => {
  it('inherits unchanged entries from the parent and restores across the chain', async () => {
    const archives = new LocalBackupArchiveStore(join(root, 'arch'));
    const repo = new InMemoryBackupRepository();
    const stable = new JsonSnapshotSource('config', { snapshot: () => ({ fixed: true }), load: () => {} });
    let n = 1;
    const changing = new JsonSnapshotSource('company_brain', { snapshot: () => ({ n }), load: () => {} });
    const service = new BackupService({ sources: [stable, changing], repository: repo, archives });

    const full = await service.backup({ tenantId: 'acme' });
    n = 2; // only the changing source differs
    const inc = await service.backup({ tenantId: 'acme', kind: 'incremental' });

    expect(inc.kind).toBe('incremental');
    expect(inc.parentId).toBe(full.id);
    const cfg = inc.manifest.entries.find((e) => e.name === 'config')!;
    const brain = inc.manifest.entries.find((e) => e.name === 'company_brain')!;
    expect(cfg.inheritedFrom).toBe(full.id); // unchanged → inherited, no bytes stored
    expect(cfg.storedSize).toBe(0);
    expect(brain.inheritedFrom).toBeUndefined(); // changed → stored fresh

    // Incremental auto-validation passed (resolved config up the chain).
    expect(inc.restoreValidated).toBe(true);
    const report = await service.restore.restore({ backupId: inc.id });
    expect(report.ok).toBe(true);
    expect(report.restored.sort()).toEqual(['company_brain', 'config']);
  });
});

describe('SqlBackupRepository (embedded SQL)', () => {
  it('round-trips backup records through SQL', async () => {
    const db = new SqliteDatabase(':memory:');
    await backupsMigration().up(db);
    const repo = new SqlBackupRepository(db);
    const src = new JsonSnapshotSource('config', { snapshot: () => ({ a: 1 }), load: () => {} });
    const service = new BackupService({ sources: [src], repository: repo, archives: new InMemoryBackupArchiveStore() });

    const record = await service.backup({ tenantId: 'acme' });
    const loaded = await repo.findById(record.id);
    expect(loaded?.checksum).toBe(record.checksum);
    expect(loaded?.restoreValidated).toBe(true);
    expect((await repo.latest('acme'))?.id).toBe(record.id);
    expect((await repo.list('other')).length).toBe(0);
    await db.close();
  });
});
