import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteDatabase } from '@ados/persistence';
import { InMemoryBackupArchiveStore, InMemoryBackupRepository } from '@ados/backup';
import { App } from './app.js';
import { BackupManager } from './backup-manager.js';
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

describe('Backup & Restore over HTTP (durable store)', () => {
  let app: App;
  let db: SqliteDatabase;
  let base: string;
  let close: () => Promise<void>;

  beforeAll(async () => {
    db = new SqliteDatabase(':memory:');
    await db.execute('CREATE TABLE demo (id INTEGER PRIMARY KEY, v TEXT)');
    await db.execute('INSERT INTO demo (id, v) VALUES (1, $1)', ['original']);
    const backups = new BackupManager(db, new InMemoryBackupRepository(), new InMemoryBackupArchiveStore());
    // params 1–10 default; backups is the 11th.
    app = new App(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, backups);
    await app.start();
    const { server } = buildServer({ sessionSecret: SECRET, app });
    await new Promise<void>((r) => server.listen(0, r));
    base = `http://localhost:${(server.address() as AddressInfo).port}`;
    close = () => new Promise<void>((r) => server.close(() => r()));
  });

  afterAll(async () => {
    await app.stop();
    await close();
  });

  it('creates a backup from the page and lists it as validated', async () => {
    const c = client(base);
    await c('POST', '/login', { email: 'o@x.com', company: 'Backup Co' });
    expect((await c('POST', '/backups/create')).status).toBe(303);
    const html = await (await c('GET', '/backups')).text();
    expect(html).toContain('Backup &amp; Restore');
    expect(html).toContain('validated');
  });

  it('dry-run verify passes every check, then a confirmed restore replaces live data', async () => {
    const c = client(base);
    await c('POST', '/login', { email: 'o@x.com', company: 'Backup Co' });
    const id = (await app.backups!.listBackups())[0]!.id;

    // Mutate live data, then verify the backup (dry-run — must not touch it).
    await db.execute('UPDATE demo SET v = $1 WHERE id = 1', ['changed']);
    const verifyHtml = await (await c('POST', '/backups/verify', { id })).text();
    expect(verifyHtml).toContain('safe to restore');
    expect((await db.query<{ v: string }>('SELECT v FROM demo WHERE id = 1'))[0]!.v).toBe('changed');

    // Restore WITHOUT confirmation → just re-shows the check, changes nothing.
    await c('POST', '/backups/restore', { id });
    expect((await db.query<{ v: string }>('SELECT v FROM demo WHERE id = 1'))[0]!.v).toBe('changed');

    // Confirmed restore → live data reverts to the backup.
    const restoredHtml = await (await c('POST', '/backups/restore', { id, confirm: 'yes' })).text();
    expect(restoredHtml).toContain('Restore complete');
    expect((await db.query<{ v: string }>('SELECT v FROM demo WHERE id = 1'))[0]!.v).toBe('original');
  });
});

describe('Backup (in-memory): honestly unavailable', () => {
  it('says backups need the durable store when running in-memory', async () => {
    const app = new App();
    await app.start();
    const { server } = buildServer({ sessionSecret: SECRET, app });
    await new Promise<void>((r) => server.listen(0, r));
    const base = `http://localhost:${(server.address() as AddressInfo).port}`;
    const c = client(base);
    await c('POST', '/login', { email: 'm@x.com', company: 'Mem Co' });
    const html = await (await c('GET', '/backups')).text();
    expect(html).toContain('durable local store');
    await app.stop();
    await new Promise<void>((r) => server.close(() => r()));
  });
});
