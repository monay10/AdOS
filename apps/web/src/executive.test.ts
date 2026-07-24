import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { App } from './app.js';
import { buildServer } from './server.js';
import { slugifyTenant } from './session.js';

const SECRET = 'test-secret';

let app: App;
let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  app = new App();
  await app.start();
  const { server } = buildServer({ sessionSecret: SECRET, app });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise<void>((r) => server.close(() => r()));
});

afterAll(async () => {
  await close();
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

/** Onboard a tenant and drive a mission all the way to its analytics report. */
async function missionWithReport(c: ReturnType<typeof client>, company: string) {
  const tenantId = slugifyTenant(company);
  const asT = <T>(fn: () => Promise<T>): Promise<T> =>
    TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);
  await c.req('POST', '/login', { email: 'o@x.com', company });
  await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
  const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/clients', { workspaceId: wsId, name: 'Bright Dental', industry: 'dental', email: 'c@x.com' });
  const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/brands', { clientId, name: 'Bright', voice: 'warm', values: 'care' });
  await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'x', pricingModel: 'free', currency: 'TRY' });
  await c.req('POST', '/missions', {
    workspaceId: wsId,
    clientId,
    objective: 'Acquire new dental patients this quarter',
    budget: '80000',
    currency: 'TRY',
    period: 'monthly',
  });
  const id = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());

  // Pipeline: brief → approve → creative → approve → campaign → approve → analytics.
  await c.req('POST', `/missions/${id}/brief`);
  await c.req('POST', `/missions/${id}/approve`);
  await c.req('POST', `/missions/${id}/creative`);
  await c.req('POST', `/missions/${id}/creative/approve`);
  await c.req('POST', `/missions/${id}/campaign`);
  await c.req('POST', `/missions/${id}/campaign/approve`);
  await c.req('POST', `/missions/${id}/analytics`, {
    impressions: '100000', clicks: '2000', conversions: '100', leads: '130', spend: '1000', revenue: '3000', currency: 'TRY',
  });
  return { tenantId, asT, id };
}

describe('Phase 10 — CEO Dashboard (UI to persistence)', () => {
  it('generates the executive synthesis from an analytics report and persists it', async () => {
    const c = client();
    const { tenantId, asT, id } = await missionWithReport(c, 'Executive Demo Co');

    // The CEO Dashboard section is available (offered) once the report exists.
    let detail = await (await c.req('GET', `/missions/${id}`)).text();
    expect(detail).toContain('CEO Dashboard');
    expect(detail).toContain('Generate CEO Dashboard');

    // Generate it.
    const r = await c.req('POST', `/missions/${id}/executive`);
    expect(r.status).toBe(303);

    // Result on screen: verdict + headline + key results + decisions + next actions.
    detail = await (await c.req('GET', `/missions/${id}`)).text();
    expect(detail).toContain('exceeded'); // roas 3 → exceeded
    expect(detail).toContain('Bright Dental'); // client name in the headline
    expect(detail).toContain('Key results');
    expect(detail).toContain('Decisions');
    expect(detail).toContain('Next actions');

    // Persistence: an ExecutiveReport is stored for this mission with a verdict + provenance.
    await asT(async () => {
      const reports = await app.executive.list(id);
      expect(reports).toHaveLength(1);
      expect(reports[0]!.verdict).toBe('exceeded');
      expect(reports[0]!.content.keyResults.length).toBeGreaterThan(0);
      expect(reports[0]!.provenance.model).toBe('offline-deterministic');
    });

    // Event fired.
    const events = app.recentEvents(tenantId, 80).map((e) => e.eventName);
    expect(events).toContain('exec.dashboard.generated.v1');

    // Executive list screen shows it.
    const list = await (await c.req('GET', '/executive')).text();
    expect(list).toContain('Acquire new dental patients this quarter');
    expect(list).toContain('exceeded');
  });

  it('is idempotent — a second generate does not create a duplicate', async () => {
    const c = client();
    const { asT, id } = await missionWithReport(c, 'Executive Idem Co');
    await c.req('POST', `/missions/${id}/executive`);
    const r = await c.req('POST', `/missions/${id}/executive`);
    expect(r.status).toBe(303);
    await asT(async () => {
      expect(await app.executive.list(id)).toHaveLength(1);
    });
  });

  it('refuses to generate before an analytics report exists', async () => {
    const c = client();
    const tenantId = slugifyTenant('Executive Guard Co');
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);
    await c.req('POST', '/login', { email: 'o@x.com', company: 'Executive Guard Co' });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'C', industry: 'x', email: 'c@x.com' });
    const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Do a thing worth doing', budget: '1000', currency: 'TRY', period: 'monthly' });
    const id = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());

    const r = await c.req('POST', `/missions/${id}/executive`);
    expect(r.status).toBe(200);
    expect(await r.text()).toContain('Generate the analytics report before the CEO Dashboard');
    await asT(async () => {
      expect(await app.executive.list(id)).toHaveLength(0);
    });
  });

  it('isolates CEO Dashboards by tenant', async () => {
    const c1 = client();
    const { id } = await missionWithReport(c1, 'Executive Tenant A');
    await c1.req('POST', `/missions/${id}/executive`);

    const c2 = client();
    await c2.req('POST', '/login', { email: 'o@x.com', company: 'Executive Tenant B' });
    const list = await (await c2.req('GET', '/executive')).text();
    expect(list).toContain('No CEO Dashboards yet');
  });
});
