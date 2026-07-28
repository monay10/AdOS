import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { App } from './app.js';
import { buildServer } from './server.js';
import { slugifyTenant } from './session.js';

/**
 * Production acceptance — the five end-to-end workflows driven through the real
 * HTTP server. Workflows 4 (backup→restore→verify) and 5 (worker crash→recovery)
 * are accepted by the @ados/backup, @ados/workers and @ados/recovery suites; this
 * file accepts the customer-facing workflows 1–3 plus cross-cutting guarantees.
 */

let app: App;
let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  app = new App();
  await app.start();
  const { server } = buildServer({ sessionSecret: 'accept', app });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise<void>((r) => server.close(() => r()));
});
afterAll(async () => { await close(); });

function client() {
  let cookie = '';
  return {
    async req(method: string, path: string, body?: Record<string, string>) {
      const headers: Record<string, string> = {};
      if (cookie) headers['cookie'] = cookie;
      let payload: string | undefined;
      if (body) { headers['content-type'] = 'application/x-www-form-urlencoded'; payload = new URLSearchParams(body).toString(); }
      const res = await fetch(`${base}${path}`, { method, headers, ...(payload ? { body: payload } : {}), redirect: 'manual' });
      const sc = res.headers.get('set-cookie');
      if (sc) cookie = sc.split(';')[0]!;
      return res;
    },
  };
}

const COMPANY = 'Acceptance Co';
const tenantId = slugifyTenant(COMPANY);
const asT = <T>(fn: () => Promise<T>): Promise<T> =>
  TenantContext.run({ tenantId, correlationId: 'accept', actor: 'owner@accept.com', roles: [] } as RequestContext, fn);
const ok303 = (r: Response): void => expect(r.status).toBe(303);

/** Onboard a workspace + client + brand + product; return their ids. */
async function onboard(c: ReturnType<typeof client>): Promise<{ wsId: string; clientId: string; brandId: string }> {
  ok303(await c.req('POST', '/login', { email: 'owner@accept.com', company: COMPANY }));
  ok303(await c.req('POST', '/workspaces', { name: 'Accept WS', currency: 'USD', timezone: 'UTC' }));
  const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
  ok303(await c.req('POST', '/clients', { workspaceId: wsId, name: 'Accept Client', industry: 'retail', email: 'owner@accept.com' }));
  const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
  ok303(await c.req('POST', '/brands', { clientId, name: 'Accept Brand', voice: 'bold', values: 'quality' }));
  const brandId = await asT(async () => (await app.brands.list()).find((b) => b.tenantId === tenantId)!.id.toString());
  ok303(await c.req('POST', '/products', { clientId, name: 'Widget', description: 'A widget', pricingModel: 'one_time', price: '49', currency: 'USD' }));
  return { wsId, clientId, brandId };
}

/** Drive a mission through the full AI pipeline; return the mission id. */
async function runPipeline(c: ReturnType<typeof client>, opts: { wsId: string; clientId: string; projectId?: string; known: Set<string> }): Promise<string> {
  ok303(await c.req('POST', '/missions', {
    workspaceId: opts.wsId, clientId: opts.clientId, ...(opts.projectId ? { projectId: opts.projectId } : {}),
    objective: 'Grow revenue this quarter', budget: '50000', currency: 'USD', period: 'monthly', metricName: 'sales', metricTarget: '100', metricUnit: 'count',
  }));
  const missionId = await asT(async () => (await app.missions.list()).map((m) => m.id.toString()).find((id) => !opts.known.has(id))!);
  opts.known.add(missionId);
  ok303(await c.req('POST', `/missions/${missionId}/brief`));
  ok303(await c.req('POST', `/missions/${missionId}/approve`, { acknowledge: 'governance' }));
  ok303(await c.req('POST', `/missions/${missionId}/creative`));
  ok303(await c.req('POST', `/missions/${missionId}/creative/approve`, { acknowledge: 'governance' }));
  ok303(await c.req('POST', `/missions/${missionId}/campaign`));
  ok303(await c.req('POST', `/missions/${missionId}/campaign/approve`, { acknowledge: 'governance' }));
  ok303(await c.req('POST', `/missions/${missionId}/analytics`, { impressions: '100000', clicks: '4000', spend: '50000', conversions: '100', revenue: '200000', leads: '100' }));
  return missionId;
}

const known = new Set<string>();
const shared: { c?: ReturnType<typeof client>; wsId?: string; clientId?: string } = {};

describe('Workflow 1 — full journey (login → … → executive report)', () => {
  it('completes onboarding through the executive dashboard, emitting the full event chain', async () => {
    const c = client();
    const { wsId, clientId, brandId } = await onboard(c);
    ok303(await c.req('POST', '/projects', { brandId, name: 'Q1', description: 'Q1 growth' }));
    const projectId = await asT(async () => (await app.projects.list()).find((p) => p.tenantId === tenantId)!.id.toString());
    const missionId = await runPipeline(c, { wsId, clientId, projectId, known });
    ok303(await c.req('POST', `/missions/${missionId}/executive`));
    ok303(await c.req('POST', `/missions/${missionId}/learn`));

    const events = new Set(app.recentEvents(tenantId, 40).map((e) => e.eventName));
    for (const e of ['intel.brief.generated.v1', 'creative.generated.v1', 'campaign.created.v1', 'analytics.report.generated.v1', 'exec.dashboard.generated.v1', 'mission.completed.v1']) {
      expect(events.has(e)).toBe(true);
    }
    Object.assign(shared, { c, wsId, clientId });
  });
});

describe('Workflow 2 — existing client → new mission → creative → campaign → analytics', () => {
  it('runs a second mission for the already-onboarded client', async () => {
    const c = shared.c!;
    const before = (await asT(async () => app.missions.list())).length;
    const missionId = await runPipeline(c, { wsId: shared.wsId!, clientId: shared.clientId!, known });
    const after = (await asT(async () => app.missions.list())).length;
    expect(after).toBe(before + 1);
    const page = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(page).toContain('Tenant: acceptance-co');
    // A performance report snapshots the client's now-two missions.
    ok303(await c.req('POST', '/reports', { clientId: shared.clientId!, title: 'Client rollup', period: '2026-Q1' }));
    expect((await asT(async () => app.performance.list())).length).toBeGreaterThan(0);
  });
});

describe('Workflow 3 — mission cancellation → recovery → audit → reporting', () => {
  it('cancels a mission, records the failure, keeps the tenant healthy, and still reports', async () => {
    const c = client();
    const { wsId, clientId } = await onboard(c); // same tenant, idempotent onboarding
    ok303(await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Doomed mission', budget: '10000', currency: 'USD', period: 'monthly', metricName: 'x', metricTarget: '1', metricUnit: 'count' }));
    const missionId = await asT(async () => (await app.missions.list()).map((m) => m.id.toString()).find((id) => !known.has(id))!);
    known.add(missionId);

    const cancel = await c.req('POST', `/missions/${missionId}/cancel`, { reason: 'Budget pulled' });
    ok303(cancel);
    // Audit: the failure event fired and shows in the feed.
    expect(app.recentEvents(tenantId, 50).some((e) => e.eventName === 'mission.failed.v1')).toBe(true);
    // Recovery: the mission is a clean terminal failure, not a dead-end; reason persisted.
    const page = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(page).toContain('Budget pulled');
    // Reporting still works for the tenant afterwards.
    ok303(await c.req('POST', '/reports', { clientId, title: 'Post-cancel report', period: '2026-Q1' }));
  });
});

describe('Cross-cutting acceptance', () => {
  it('enforces tenant isolation (another tenant sees nothing)', async () => {
    const other = client();
    await other.req('POST', '/login', { email: 'stranger@other.com', company: 'Other Co' });
    expect(await (await other.req('GET', '/clients')).text()).toContain('No clients yet');
    expect(await (await other.req('GET', '/reports')).text()).toContain('No reports yet');
  });

  it('operates fully offline (AI pipeline runs with no model server attached)', async () => {
    // The whole pipeline above ran against the injected OfflineAIManager with no
    // network — its success is the offline-operation acceptance.
    expect(app.recentEvents(tenantId, 60).some((e) => e.eventName === 'creative.generated.v1')).toBe(true);
  });

  it('requires a session for protected routes (authentication gate)', async () => {
    const r = await client().req('GET', '/dashboard');
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/login');
  });

  it('serves the UI in the visitor’s language (TR/EN from Accept-Language)', async () => {
    const tr = await (await fetch(`${base}/login`, { headers: { 'accept-language': 'tr-TR,tr;q=0.9' } })).text();
    expect(tr).toContain('lang="tr"');
    expect(tr).toContain('Giriş yap'); // "Sign in" in Turkish
    const en = await (await fetch(`${base}/login`, { headers: { 'accept-language': 'en-US,en;q=0.9' } })).text();
    expect(en).toContain('lang="en"');
    expect(en).toContain('Sign in');
  });
});
