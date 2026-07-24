import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { PerformanceReportId } from '@ados/agency-os';
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

/** Onboard and drive one mission all the way to its analytics report. */
async function clientWithResults(c: ReturnType<typeof client>, company: string) {
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
    workspaceId: wsId, clientId, objective: 'Acquire new dental patients', budget: '80000', currency: 'TRY', period: 'monthly',
  });
  const id = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());
  await c.req('POST', `/missions/${id}/brief`);
  await c.req('POST', `/missions/${id}/approve`);
  await c.req('POST', `/missions/${id}/creative`);
  await c.req('POST', `/missions/${id}/creative/approve`);
  await c.req('POST', `/missions/${id}/campaign`);
  await c.req('POST', `/missions/${id}/campaign/approve`);
  await c.req('POST', `/missions/${id}/analytics`, {
    impressions: '100000', clicks: '2000', conversions: '100', leads: '130', spend: '1000', revenue: '3000', currency: 'TRY',
  });
  await c.req('POST', `/missions/${id}/executive`);
  return { tenantId, asT, clientId };
}

describe('Phase 13 — Reports (UI to persistence)', () => {
  it('generates a saved performance report snapshot from a client’s work', async () => {
    const c = client();
    const { tenantId, asT, clientId } = await clientWithResults(c, 'Report Demo Co');

    // The form is reachable and pre-lists the client.
    const form = await (await c.req('GET', '/reports/new')).text();
    expect(form).toContain('Generate a performance report');

    // Generate the report.
    const r = await c.req('POST', '/reports', { clientId, title: 'Q3 review', period: 'Q3 2026' });
    expect(r.status).toBe(303);
    const id = r.headers.get('location')!.replace('/reports/', '');
    expect(id).toBeTruthy();

    // Detail shows the aggregated snapshot.
    const detail = await (await c.req('GET', `/reports/${id}`)).text();
    expect(detail).toContain('Q3 review');
    expect(detail).toContain('Bright Dental');
    expect(detail).toContain('Q3 2026');
    expect(detail).toContain('Missions');
    expect(detail).toContain('Avg ROAS');
    expect(detail).toContain('3x'); // roas 3 → avg 3x
    expect(detail).toContain('80,000 TRY'); // total budget
    expect(detail).toContain('exceeded'); // CEO verdict rollup
    expect(detail).toContain('Bright Dental ran 1 mission'); // deterministic summary

    // Persistence: the snapshot is stored immutably with its metrics.
    await asT(async () => {
      const reports = await app.performance.list(clientId);
      expect(reports).toHaveLength(1);
      const rep = reports[0]!;
      expect(rep.title).toBe('Q3 review');
      expect(rep.period).toBe('Q3 2026');
      expect(rep.metrics.find((m) => m.label === 'Missions')!.value).toBe('1');
      expect(rep.metrics.find((m) => m.label === 'Avg ROAS')!.value).toBe('3x');
    });

    // Event fired.
    const events = app.recentEvents(tenantId, 80).map((e) => e.eventName);
    expect(events).toContain('performance.report.generated.v1');

    // List screen shows it.
    const list = await (await c.req('GET', '/reports')).text();
    expect(list).toContain('Q3 review');
    expect(list).toContain('Bright Dental');
  });

  it('reports an empty scope honestly', async () => {
    const c = client();
    const tenantId = slugifyTenant('Report Empty Co');
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);
    await c.req('POST', '/login', { email: 'o@x.com', company: 'Report Empty Co' });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'Quiet Co', industry: 'x', email: 'c@x.com' });
    const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());

    const r = await c.req('POST', '/reports', { clientId, title: 'Nothing yet', period: '' });
    expect(r.status).toBe(303);
    const detail = await (await c.req('GET', r.headers.get('location')!)).text();
    expect(detail).toContain('All time'); // empty period → default
    expect(detail).toContain('has no missions in this scope yet');
  });

  it('requires a client and a title', async () => {
    const c = client();
    await clientWithResults(c, 'Report Validate Co');
    const noClient = await c.req('POST', '/reports', { clientId: '', title: 'X' });
    expect(noClient.status).toBe(400);
    expect(await noClient.text()).toContain('class="err"');
  });

  it('isolates reports by tenant', async () => {
    const c1 = client();
    const { clientId } = await clientWithResults(c1, 'Report Tenant A');
    await c1.req('POST', '/reports', { clientId, title: 'A report', period: '' });

    const c2 = client();
    await c2.req('POST', '/login', { email: 'o@x.com', company: 'Report Tenant B' });
    const list = await (await c2.req('GET', '/reports')).text();
    expect(list).toContain('No reports yet');
  });
});
