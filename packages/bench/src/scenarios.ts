import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { InMemoryEventBus } from '@ados/event-bus';
import { SqliteDatabase, SqlAggregateStore, runMigrations } from '@ados/persistence';
import { LocalFileStorage } from '@ados/storage';
import { InMemoryJobStore, WorkerHost, WorkerRegistry } from '@ados/workers';
import { BackupService, DatabaseBackupSource, InMemoryBackupArchiveStore, InMemoryBackupRepository, RestoreService } from '@ados/backup';
import { timeBlock, timeEach, type BenchResult } from './timer.js';

const sqlite = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');

/**
 * Prepared-statement cache: before (re-prepare every call) vs after (cached).
 * Demonstrates the persistence optimisation with identical results.
 */
export async function benchSqliteStatementCache(iterations: number): Promise<{ cached: BenchResult; uncached: BenchResult; speedup: number }> {
  const raw = new sqlite.DatabaseSync(':memory:');
  raw.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, v TEXT)');
  for (let i = 0; i < 500; i++) raw.prepare('INSERT INTO t (v) VALUES (?)').run(`row-${i}`);
  const sql = 'SELECT * FROM t WHERE v = ?';

  const uncached = await timeEach('sqlite: re-prepare each call', iterations, () => {
    raw.prepare(sql).all('row-250');
  });
  const cachedStmt = raw.prepare(sql);
  const cached = await timeEach('sqlite: cached statement', iterations, () => {
    cachedStmt.all('row-250');
  });
  raw.close();
  return { cached, uncached, speedup: uncached.meanMs > 0 ? round(uncached.meanMs / cached.meanMs) : 1 };
}

/** Repository read/write throughput over the real aggregate store on SQLite. */
export async function benchRepository(iterations: number): Promise<{ write: BenchResult; read: BenchResult }> {
  const db = new SqliteDatabase(':memory:');
  await runMigrations(db);
  const store = new SqlAggregateStore(db);
  const write = await timeEach('repo: upsert', iterations, async (i) => {
    await store.upsert('widget', `w-${i}`, 'public', { i, name: `Widget ${i}` });
  });
  const read = await timeEach('repo: findById', iterations, async (i) => {
    await store.findById('widget', `w-${i}`);
  });
  await db.close();
  return { write, read };
}

/** Background-worker throughput: enqueue N no-op jobs and drain them. */
export async function benchWorkerThroughput(count: number): Promise<BenchResult> {
  const store = new InMemoryJobStore();
  const registry = new WorkerRegistry().register({ type: 'noop', handle: async () => {} });
  const host = new WorkerHost({ store, registry, concurrency: 16 });
  for (let i = 0; i < count; i++) await host.enqueue({ type: 'noop' });
  return timeBlock('workers: drain jobs', count, async () => {
    let drained = 0;
    while (drained < count) drained += await host.tick();
  });
}

/** Storage upload/download latency over the real streaming Local adapter. */
export async function benchStorage(iterations: number): Promise<{ upload: BenchResult; download: BenchResult }> {
  const dir = await mkdtemp(join(tmpdir(), 'ados-bench-'));
  const adapter = new LocalFileStorage(dir);
  const payload = Buffer.from('x'.repeat(4096));
  const keys: string[] = [];
  const upload = await timeEach('storage: upload 4KB', iterations, async (i) => {
    const key = `public/o-${i}/v1/f.bin`;
    keys.push(key);
    await adapter.put(key, Readable.from(payload));
  });
  const download = await timeEach('storage: download 4KB', iterations, async (i) => {
    const stream = await adapter.get(keys[i % keys.length]!);
    for await (const _c of stream) void _c;
  });
  await rm(dir, { recursive: true, force: true });
  return { upload, download };
}

/** Event-bus dispatch throughput (in-memory adapter). */
export async function benchEventBus(count: number): Promise<BenchResult> {
  const bus = new InMemoryEventBus();
  let received = 0;
  await bus.subscribe('bench.>', async () => { received++; });
  const result = await timeBlock('eventbus: publish+dispatch', count, async () => {
    for (let i = 0; i < count; i++) {
      await bus.publish({
        eventName: 'bench.ping.v1',
        aggregateId: `a-${i}`,
        payload: { i },
        metadata: { eventId: randomUUID(), occurredAt: new Date().toISOString(), tenantId: 'public', correlationId: 'c', causationId: undefined, actor: undefined },
      });
    }
  });
  void received;
  return result;
}

/** JSON serialize/parse micro-benchmark (the hot path for aggregate + job payloads). */
export async function benchJson(iterations: number): Promise<{ stringify: BenchResult; parse: BenchResult }> {
  const sample = { id: randomUUID(), tenantId: 'acme', nested: { a: 1, b: [1, 2, 3], c: 'text'.repeat(20) }, list: Array.from({ length: 20 }, (_v, i) => ({ i, v: `item-${i}` })) };
  const json = JSON.stringify(sample);
  const stringify = await timeEach('json: stringify', iterations, () => { JSON.stringify(sample); });
  const parse = await timeEach('json: parse', iterations, () => { JSON.parse(json); });
  return { stringify, parse };
}

/** Backup (full + auto-validate) and restore duration over the real services. */
export async function benchBackup(iterations: number): Promise<{ backup: BenchResult; restore: BenchResult }> {
  const db = new SqliteDatabase(':memory:');
  await db.execute('CREATE TABLE items (id text PRIMARY KEY, v text NOT NULL)');
  for (let i = 0; i < 200; i++) await db.execute('INSERT INTO items (id, v) VALUES ($1, $2)', [`i${i}`, `value-${i}`]);
  const sources = [new DatabaseBackupSource('db', db, ['items'])];
  const repository = new InMemoryBackupRepository();
  const archives = new InMemoryBackupArchiveStore();
  const service = new BackupService({ sources, repository, archives });
  const restorer = new RestoreService({ sources, repository, archives });

  const ids: string[] = [];
  const backup = await timeEach('backup: full + auto-validate', iterations, async () => {
    ids.push((await service.backup({ tenantId: 'acme' })).id);
  });
  const restore = await timeEach('restore: verify + apply', iterations, async (i) => {
    await restorer.restore({ backupId: ids[i % ids.length]! });
  });
  await db.close();
  return { backup, restore };
}

export function memorySnapshot(): { rssMb: number; heapUsedMb: number } {
  const m = process.memoryUsage();
  return { rssMb: Math.round(m.rss / 1_048_576), heapUsedMb: Math.round(m.heapUsed / 1_048_576) };
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
