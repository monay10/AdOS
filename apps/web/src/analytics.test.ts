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

/** Onboard + run brief/creative/campaign to approval, leaving mission ready for analytics. */
async function readyForAnalytics(c: ReturnType<typeof client>, company: string): Promise<{ missionId: string; tenantId: string; asT: <T>(fn: () => Promise<T>) => Promise<T> }> {
  const tenantId = slugifyTenant(company);
  const asT = <T>(fn: () => Promise<T>): Promise<T> =>
    TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);

  await c.req('POST', '/login', { email: 'o@x.com', company });
  await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
  const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/clients', { workspaceId: wsId, name: 'Client', industry: 'healthcare', email: 'c@x.com' });
  const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/brands', { clientId, name: 'Brand', voice: 'warm', values: 'care' });
  await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'In-clinic whitening', pricingModel: 'one_time', price: '129', currency: 'TRY' });
  await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Acquire new dental patients next month', budget: '80000', currency: 'TRY', period: 'monthly' });
  const missionId = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());

  await c.req('POST', `/missions/${missionId}/brief`);
  await c.req('POST', `/missions/${missionId}/approve`);
  await c.req('POST', `/missions/${missionId}/creative`);
  await c.req('POST', `/missions/${missionId}/creative/approve`);
  await c.req('POST', `/missions/${missionId}/campaign`);
  await c.req('POST', `/missions/${missionId}/campaign/approve`);
  return { missionId, tenantId, asT };
}

describe('Phase 5 — Analytics (Campaign → KPIs → Summary → Recommendations → Dashboard)', () => {
  it('computes KPIs, charts, summary and recommendations from entered results', async () => {
    const c = client();
    const { missionId, tenantId, asT } = await readyForAnalytics(c, 'Analytics Demo Co');

    // Campaign approved → the Analytics metrics form is offered.
    const detail = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(detail).toContain('Campaign approved by executive');
    expect(detail).toContain('Generate Analytics Report');

    // Submit results → deterministic KPIs + AI summary.
    const r = await c.req('POST', `/missions/${missionId}/analytics`, {
      impressions: '100000',
      clicks: '2000',
      conversions: '100',
      leads: '130',
      spend: '80000',
      revenue: '240000',
      currency: 'TRY',
    });
    expect(r.status).toBe(303);

    await asT(async () => {
      const reports = await app.reports.list(missionId);
      expect(reports).toHaveLength(1);
      const rep = reports[0]!;
      expect(rep.kpi('ctr')).toBe(2); // 2000/100000
      expect(rep.kpi('roas')).toBe(3); // 240000/80000
      expect(rep.kpi('roi')).toBe(200); // (240k-80k)/80k
      expect(rep.narrative.recommendations.length).toBeGreaterThan(0);
      expect(rep.provenance.taskId).toBeTruthy();
    });

    // The report renders: KPI cards, bar charts, summary, recommendations.
    const withReport = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(withReport).toContain('Analytics Report');
    expect(withReport).toContain('ROAS');
    expect(withReport).toContain('Executive summary');
    expect(withReport).toContain('Recommendations');
    expect(withReport).toContain('class="fill"'); // a chart bar

    // Events + dashboard.
    expect(app.recentEvents(tenantId, 80).map((e) => e.eventName)).toContain('analytics.report.generated.v1');
    const dash = await (await c.req('GET', '/dashboard')).text();
    expect(dash).toContain('Reports');

    // Analytics list screen shows it.
    const analyticsScreen = await (await c.req('GET', '/analytics')).text();
    expect(analyticsScreen).toContain('Analytics');
    expect(analyticsScreen).toContain(`/missions/${missionId}`);
  });

  it('never divides by zero on empty results', async () => {
    const c = client();
    const { missionId, asT } = await readyForAnalytics(c, 'Analytics Zero Co');
    const r = await c.req('POST', `/missions/${missionId}/analytics`, {
      impressions: '0',
      clicks: '0',
      conversions: '0',
      leads: '0',
      spend: '0',
      revenue: '0',
      currency: 'TRY',
    });
    expect(r.status).toBe(303);
    await asT(async () => {
      const rep = (await app.reports.list(missionId))[0]!;
      for (const k of rep.kpis) expect(Number.isFinite(k.value)).toBe(true);
    });
  });

  it('does not offer analytics before the campaign is approved', async () => {
    const c = client();
    const company = 'Analytics Gate Co';
    const tenantId = slugifyTenant(company);
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);
    await c.req('POST', '/login', { email: 'o@x.com', company });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'Client', industry: 'x', email: 'c@x.com' });
    const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/brands', { clientId, name: 'Brand', voice: 'bold' });
    await c.req('POST', '/products', { clientId, name: 'Widget', description: 'A widget', pricingModel: 'free', currency: 'TRY' });
    await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Grow the widget brand this quarter', budget: '1000', currency: 'TRY', period: 'monthly' });
    const missionId = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());

    await c.req('POST', `/missions/${missionId}/brief`);
    await c.req('POST', `/missions/${missionId}/approve`);
    await c.req('POST', `/missions/${missionId}/creative`);
    await c.req('POST', `/missions/${missionId}/creative/approve`);
    await c.req('POST', `/missions/${missionId}/campaign`); // campaign generated but NOT approved
    const detail = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(detail).not.toContain('Generate Analytics Report');

    // Direct POST is blocked — no report created.
    await c.req('POST', `/missions/${missionId}/analytics`, { impressions: '1', clicks: '1', conversions: '1', leads: '1', spend: '1', revenue: '1', currency: 'TRY' });
    await asT(async () => expect(await app.reports.list(missionId)).toHaveLength(0));
  });
});
