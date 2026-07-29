import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteDatabase } from '@ados/persistence';
import type { DecisionJournalEntry } from '@ados/contracts';
import { InMemoryDecisionJournal } from '@ados/executive-memory';
import { App } from './app.js';
import { PersistentDecisionJournal, SqlExecutiveStore } from './executive-persistence.js';
import { MaintenanceService } from './maintenance.js';
import { buildServer } from './server.js';

const SECRET = 'test-secret';

const entry = (at: string): Omit<DecisionJournalEntry, 'id'> => ({
  tenantId: 'acme',
  role: 'cmo',
  subjectId: 's',
  decision: 'd',
  evidence: [],
  alternatives: [],
  chosen: 'a',
  rejected: [],
  confidence: { score: 70, reason: 'r', basis: { sampleSize: 3 } },
  at,
});

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

describe('Maintenance (durable store): metrics + compaction + vacuum over HTTP', () => {
  let app: App;
  let journal: PersistentDecisionJournal;
  let base: string;
  let close: () => Promise<void>;

  beforeAll(async () => {
    const db = new SqliteDatabase(':memory:');
    journal = new PersistentDecisionJournal(new InMemoryDecisionJournal(), new SqlExecutiveStore(db));
    const maintenance = new MaintenanceService(db, journal);
    app = new App(undefined, undefined, undefined, undefined, undefined, journal, undefined, undefined, maintenance);
    await app.start();
    // Seed real journal history so there is something to compact.
    for (let i = 1; i <= 6; i++) await journal.record(entry(`2026-05-0${i}T00:00:00.000Z`));
    const { server } = buildServer({ sessionSecret: SECRET, app });
    await new Promise<void>((r) => server.listen(0, r));
    base = `http://localhost:${(server.address() as AddressInfo).port}`;
    close = () => new Promise<void>((r) => server.close(() => r()));
  });

  afterAll(async () => {
    await app.stop();
    await close();
  });

  it('shows whole-database storage metrics on the maintenance page', async () => {
    const c = client(base);
    await c('POST', '/login', { email: 'o@x.com', company: 'Maint Co' });
    const html = await (await c('GET', '/maintenance')).text();
    expect(html).toContain('Storage &amp; Maintenance');
    expect(html).toContain('decision_journal'); // per-table row
    expect(html).toContain('Total size');
  });

  it('compacts the journal from the page: older entries freeze, the hot set shrinks', async () => {
    const c = client(base);
    await c('POST', '/login', { email: 'o@x.com', company: 'Maint Co' });

    expect((await journal.history({ tenantId: 'acme', k: 100 })).length).toBe(6);

    const res = await c('POST', '/maintenance/compact', { retain: '2' });
    expect(res.status).toBe(303);

    // The hot Active set shrank to the 2 most recent; the rest are frozen, not lost.
    expect((await journal.history({ tenantId: 'acme', k: 100 })).length).toBe(2);
    expect((await journal.archive({ tenantId: 'acme' })).length).toBe(4);

    const html = await (await c('GET', '/maintenance')).text();
    expect(html).toContain('compact'); // a recent-maintenance row
  });

  it('runs VACUUM from the page without error', async () => {
    const c = client(base);
    await c('POST', '/login', { email: 'o@x.com', company: 'Maint Co' });
    const res = await c('POST', '/maintenance/vacuum');
    expect(res.status).toBe(303);
    const html = await (await c('GET', '/maintenance')).text();
    expect(html).toContain('vacuum');
  });
});

describe('Maintenance (in-memory): honestly unavailable', () => {
  it('says maintenance needs the durable store when running in-memory', async () => {
    const app = new App(); // default: no durable store, no maintenance service
    await app.start();
    const { server } = buildServer({ sessionSecret: SECRET, app });
    await new Promise<void>((r) => server.listen(0, r));
    const base = `http://localhost:${(server.address() as AddressInfo).port}`;
    const c = client(base);
    await c('POST', '/login', { email: 'o@x.com', company: 'Mem Co' });
    const html = await (await c('GET', '/maintenance')).text();
    expect(html).toContain('durable local store');
    await app.stop();
    await new Promise<void>((r) => server.close(() => r()));
  });
});
