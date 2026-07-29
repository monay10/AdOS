import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteDatabase, MigrationEngine } from '@ados/persistence';
import { InMemoryBackupArchiveStore, SqlBackupRepository } from '@ados/backup';
import { App } from './app.js';
import { BackupManager } from './backup-manager.js';
import { MaintenanceService } from './maintenance.js';
import { SqlMissionQueue } from './mission-queue.js';
import { BRAIN_DB_MIGRATIONS } from './migrations.js';
import { buildServer } from './server.js';

const SECRET = 'test-secret';

function client(base: string) {
  let cookie = '';
  return async (method: string, path: string, body?: Record<string, string>) => {
    const headers: Record<string, string> = {};
    if (cookie) headers['cookie'] = cookie;
    let payload: string | undefined;
    if (body) {
      headers['content-type'] = 'application/x-www-form-urlencoded';
      payload = new URLSearchParams(body).toString();
    }
    const res = await fetch(`${base}${path}`, { method, headers, ...(payload ? { body: payload } : {}), redirect: 'manual' });
    const sc = res.headers.get('set-cookie');
    if (sc) cookie = sc.split(';')[0]!;
    return res;
  };
}

describe('Runtime Health over HTTP (durable, migrated store)', () => {
  let app: App;
  let base: string;
  let close: () => Promise<void>;

  beforeAll(async () => {
    const db = new SqliteDatabase(':memory:');
    await new MigrationEngine(db, BRAIN_DB_MIGRATIONS).run(); // schema + version present
    const queue = new SqlMissionQueue(db);
    const maintenance = new MaintenanceService(db, undefined);
    const backups = new BackupManager(db, new SqlBackupRepository(db), new InMemoryBackupArchiveStore());
    // params: bus, ai, repos, brain, execMemory, journal, governance, queue, maintenance, calibrationDeps, backups
    app = new App(undefined, undefined, undefined, undefined, undefined, undefined, undefined, queue, maintenance, undefined, backups);
    await app.start();
    app.startWorker(); // worker running → healthy
    const { server } = buildServer({ sessionSecret: SECRET, app });
    await new Promise<void>((r) => server.listen(0, r));
    base = `http://localhost:${(server.address() as AddressInfo).port}`;
    close = () => new Promise<void>((r) => server.close(() => r()));
  });

  afterAll(async () => {
    await app.stop();
    await close();
  });

  it('reports a healthy system with measured values (schema version, worker, durable store)', async () => {
    const c = client(base);
    await c('POST', '/login', { email: 'op@x.com', company: 'Health Co' });
    const health = await app.health();
    expect(health.system.status).toBe('pass');
    expect(health.worker.running).toBe(true);
    expect(health.database).toEqual({ durable: true, reachable: true, sizeBytes: expect.any(Number) });
    expect(health.migration.version).toBe('0002_performance_indexes');
    expect(health.migration.applied).toBe(2);

    const html = await (await c('GET', '/health')).text();
    expect(html).toContain('Runtime Health');
    expect(html).toContain('Healthy');
    expect(html).toContain('0002_performance_indexes'); // measured schema version on the page
    expect(html).toContain('Schema version');
  });
});

describe('Runtime Health (in-memory): honest, not "unreachable"', () => {
  it('renders with an in-memory durable store and does not falsely degrade the DB', async () => {
    const app = new App();
    await app.start();
    app.startWorker();
    const { server } = buildServer({ sessionSecret: SECRET, app });
    await new Promise<void>((r) => server.listen(0, r));
    const base = `http://localhost:${(server.address() as AddressInfo).port}`;
    const c = client(base);
    await c('POST', '/login', { email: 'm@x.com', company: 'Mem Co' });

    const health = await app.health();
    expect(health.database.durable).toBe(false);
    expect(health.system.status).toBe('pass'); // in-memory is a valid mode, not a failure
    const html = await (await c('GET', '/health')).text();
    expect(html).toContain('in-memory');

    await app.stop();
    await new Promise<void>((r) => server.close(() => r()));
  });
});
