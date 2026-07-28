import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { InMemoryEventBus } from '@ados/event-bus';
import { runMigrations, SqlAggregateStore, SqliteDatabase } from '@ados/persistence';
import { Asset, Workspace } from '@ados/agency-os';
import { App } from '../app.js';
import { buildServer } from '../server.js';
import { slugifyTenant } from '../session.js';
import { sqlRepositories, type RepositoryBundle } from './repositories.js';

const AT = '2026-07-24T10:00:00.000Z';

/** A fresh, migrated in-memory SQLite database + SQL repository bundle. */
async function fresh(): Promise<{ db: SqliteDatabase; repos: RepositoryBundle }> {
  const db = new SqliteDatabase(':memory:');
  await runMigrations(db);
  return { db, repos: sqlRepositories(new SqlAggregateStore(db)) };
}

function ctx(tenantId: string): RequestContext {
  return { tenantId, correlationId: 't', actor: 'u', roles: [] };
}

// ── Direct repository parity (against a real embedded SQL engine) ──────────────
describe('SQL repositories — behaviour parity with in-memory', () => {
  it('workspace list returns only active workspaces, and round-trips through SQL', async () => {
    await TenantContext.run(ctx('ta'), async () => {
      const { repos } = await fresh();
      const active = Workspace.create({ tenantId: 'ta', name: 'Active' }).unwrap();
      const deleted = Workspace.create({ tenantId: 'ta', name: 'Deleted' }).unwrap();
      deleted.markDeleted();
      await repos.workspaces.save(active);
      await repos.workspaces.save(deleted);

      expect((await repos.workspaces.list()).map((w) => w.name)).toEqual(['Active']);
      const found = (await repos.workspaces.findById(active.id)).unwrap();
      expect(found?.name).toBe('Active');
      expect(found?.settings.currency).toBe('USD'); // full snapshot survived the JSON round-trip
      expect(await repos.workspaces.exists(active.id)).toBe(true);
      expect(await repos.workspaces.exists(deleted.id)).toBe(true); // exists ignores status, like in-memory
    });
  });

  it('asset list filters by client / brand / project exactly like in-memory', async () => {
    await TenantContext.run(ctx('ta'), async () => {
      const { repos } = await fresh();
      const mk = (name: string, brandId?: string, projectId?: string): Asset =>
        Asset.create({ tenantId: 'ta', clientId: 'c1', name, kind: 'copy', content: 'x', by: 'u', at: AT, ...(brandId ? { brandId } : {}), ...(projectId ? { projectId } : {}) }).unwrap();
      await repos.assets.save(mk('a1', 'b1', 'p1'));
      await repos.assets.save(mk('a2', 'b2'));
      await repos.assets.save(mk('a3', undefined, 'p1'));

      expect(await repos.assets.list({ clientId: 'c1' })).toHaveLength(3);
      expect((await repos.assets.list({ brandId: 'b1' })).map((a) => a.name)).toEqual(['a1']);
      expect((await repos.assets.list({ projectId: 'p1' })).map((a) => a.name)).toEqual(['a1', 'a3']);
      expect(await repos.assets.list({ clientId: 'other' })).toHaveLength(0);
    });
  });

  it('upsert replaces in place and preserves insertion order', async () => {
    await TenantContext.run(ctx('ta'), async () => {
      const { repos } = await fresh();
      const first = Workspace.create({ tenantId: 'ta', name: 'first' }).unwrap();
      await repos.workspaces.save(first);
      await repos.workspaces.save(Workspace.create({ tenantId: 'ta', name: 'second' }).unwrap());
      first.rename('first-renamed');
      await repos.workspaces.save(first); // same id → update, not insert

      const list = await repos.workspaces.list();
      expect(list).toHaveLength(2);
      expect(list.map((w) => w.name)).toEqual(['first-renamed', 'second']); // order kept
    });
  });

  it('isolates tenants: writes under one tenant are invisible to another', async () => {
    const { repos } = await fresh();
    await TenantContext.run(ctx('ta'), async () => {
      await repos.workspaces.save(Workspace.create({ tenantId: 'ta', name: 'A-only' }).unwrap());
      expect(await repos.workspaces.list()).toHaveLength(1);
    });
    await TenantContext.run(ctx('tb'), async () => {
      expect(await repos.workspaces.list()).toHaveLength(0);
    });
  });
});

// ── Full application journey on SQL persistence ───────────────────────────────
describe('The whole app running on SQL persistence', () => {
  let app: App;
  let db: SqliteDatabase;
  let base: string;
  let close: () => Promise<void>;

  beforeAll(async () => {
    const wired = await fresh();
    db = wired.db;
    app = new App(new InMemoryEventBus(), undefined, wired.repos);
    await app.start();
    const { server } = buildServer({ sessionSecret: 'test-secret', app });
    await new Promise<void>((r) => server.listen(0, r));
    base = `http://localhost:${(server.address() as AddressInfo).port}`;
    close = () => new Promise<void>((r) => server.close(() => r()));
  });

  afterAll(async () => {
    await close();
    await db.close();
  });

  function client() {
    let cookie = '';
    return {
      async req(method: string, path: string, body?: Record<string, string>) {
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
      },
    };
  }

  it('drives a full mission through the UI and persists every artifact to SQL', async () => {
    const company = 'SQL Pilot Co';
    const tenantId = slugifyTenant(company);
    const c = client();
    const asT = <T>(fn: () => Promise<T>): Promise<T> => TenantContext.run(ctx(tenantId), fn);

    await c.req('POST', '/login', { email: 'o@x.com', company });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const wsId = await asT(async () => (await app.workspaces.list())[0]!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'Bright Dental', industry: 'dental', email: 'c@x.com' });
    const clientId = await asT(async () => (await app.clients.list())[0]!.id.toString());
    await c.req('POST', '/brands', { clientId, name: 'Bright', voice: 'warm', values: 'care' });
    await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'x', pricingModel: 'free', currency: 'TRY' });
    await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Acquire new dental patients this quarter', budget: '80000', currency: 'TRY', period: 'monthly' });
    const missionId = await asT(async () => (await app.missions.list())[0]!.id.toString());

    for (const step of ['brief', 'approve', 'creative', 'creative/approve', 'campaign', 'campaign/approve']) {
      // Governance flags ungrounded output; approving requires the operator ack (Sprint 4.3B).
      await c.req('POST', `/missions/${missionId}/${step}`, step.endsWith('approve') ? { acknowledge: 'governance' } : undefined);
    }
    await c.req('POST', `/missions/${missionId}/analytics`, { impressions: '100000', clicks: '2000', conversions: '100', leads: '130', spend: '1000', revenue: '3000', currency: 'TRY' });
    await c.req('POST', `/missions/${missionId}/executive`);
    await c.req('POST', `/missions/${missionId}/learn`);

    // Persistence: read back through the SQL repositories (mission-scoped filters included).
    await asT(async () => {
      const mission = (await app.missions.list())[0]!;
      expect(mission.status).toBe('completed');
      expect(mission.clientId).toBe(clientId);
      expect(await app.missions.list('other')).toHaveLength(0); // clientId filter
      expect(await app.briefs.list(missionId)).toHaveLength(1);
      expect(await app.creative.list(missionId)).toHaveLength(1);
      expect(await app.campaigns.list(missionId)).toHaveLength(1);
      expect(await app.reports.list(missionId)).toHaveLength(1);
      const execs = await app.executive.list(missionId);
      expect(execs).toHaveLength(1);
      expect(execs[0]!.verdict).toBe('exceeded');
    });

    // Prove the data really lives in the SQL table (not memory).
    const kinds = (await db.query<{ kind: string }>('SELECT DISTINCT kind FROM aggregates ORDER BY kind')).map((r) => r.kind);
    for (const kind of ['workspace', 'client', 'brand', 'product', 'mission', 'marketing-brief', 'creative-set', 'campaign-draft', 'campaign-report', 'executive-report']) {
      expect(kinds).toContain(kind);
    }
    const rowCount = (await db.query<{ n: number }>("SELECT COUNT(*) AS n FROM aggregates WHERE kind = 'mission' AND tenant_id = $1", [tenantId]))[0]!.n;
    expect(Number(rowCount)).toBe(1);
  });

  it('keeps a project archive out of the active list (SQL <> filter)', async () => {
    const company = 'SQL Archive Co';
    const c = client();
    const asT = <T>(fn: () => Promise<T>): Promise<T> => TenantContext.run(ctx(slugifyTenant(company)), fn);
    await c.req('POST', '/login', { email: 'o@x.com', company });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const wsId = await asT(async () => (await app.workspaces.list())[0]!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'C', industry: 'x', email: 'c@x.com' });
    const clientId = await asT(async () => (await app.clients.list())[0]!.id.toString());
    await c.req('POST', '/brands', { clientId, name: 'B', voice: 'x', values: 'x' });
    const brandId = await asT(async () => (await app.brands.list())[0]!.id.toString());
    const loc = (await c.req('POST', '/projects', { brandId, name: 'Temp', description: '' })).headers.get('location')!;
    const projectId = loc.replace('/projects/', '');

    await asT(async () => expect(await app.projects.list()).toHaveLength(1));
    await c.req('POST', `/projects/${projectId}/archive`);
    await asT(async () => expect(await app.projects.list()).toHaveLength(0)); // archived → excluded
  });

  it('isolates tenants over the full HTTP surface on SQL', async () => {
    const other = client();
    await other.req('POST', '/login', { email: 'x@y.com', company: 'Totally Separate Co' });
    expect(await (await other.req('GET', '/clients')).text()).toContain('No clients yet');
    expect(await (await other.req('GET', '/missions')).text()).toContain('No missions yet');
  });
});
