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

/** Onboard, then generate+approve brief and creative, leaving mission ready for a campaign. */
async function readyForCampaign(c: ReturnType<typeof client>, company: string): Promise<{ missionId: string; tenantId: string; asT: <T>(fn: () => Promise<T>) => Promise<T> }> {
  const tenantId = slugifyTenant(company);
  const asT = <T>(fn: () => Promise<T>): Promise<T> =>
    TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);

  await c.req('POST', '/login', { email: 'o@x.com', company });
  await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
  const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/clients', { workspaceId: wsId, name: 'Client', industry: 'healthcare', email: 'c@x.com' });
  const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/brands', { clientId, name: 'Brand', voice: 'warm', values: 'care, expertise' });
  await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'In-clinic whitening', pricingModel: 'one_time', price: '129', currency: 'TRY' });
  await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Acquire new dental patients next month', budget: '80000', currency: 'TRY', period: 'monthly' });
  const missionId = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());

  await c.req('POST', `/missions/${missionId}/brief`);
  await c.req('POST', `/missions/${missionId}/approve`);
  await c.req('POST', `/missions/${missionId}/creative`);
  await c.req('POST', `/missions/${missionId}/creative/approve`);
  return { missionId, tenantId, asT };
}

describe('Phase 4 — Campaign (Creative → Campaign Draft → Approval → Dashboard)', () => {
  it('builds a campaign draft with budget/audience/schedule and approves it', async () => {
    const c = client();
    const { missionId, tenantId, asT } = await readyForCampaign(c, 'Campaign Demo Co');

    // Creative approved → Campaign Builder is offered.
    const detail = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(detail).toContain('Creative approved by executive');
    expect(detail).toContain('Generate Campaign Draft');

    // Generate campaign draft → renders budget/audience/schedule; mission moves to launch review.
    let r = await c.req('POST', `/missions/${missionId}/campaign`);
    expect(r.status).toBe(303);

    await asT(async () => {
      const drafts = await app.campaigns.list(missionId);
      expect(drafts).toHaveLength(1);
      expect(drafts[0]!.status).toBe('draft'); // never launched
      expect(drafts[0]!.content.channels.length).toBeGreaterThan(0);
      expect(drafts[0]!.totalBudget.amountMinor).toBe(80000 * 100);
      expect(drafts[0]!.provenance.taskId).toBeTruthy();
      expect((await app.missions.list()).find((m) => m.tenantId === tenantId)!.status).toBe('awaiting_approval');
    });

    const afterGen = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(afterGen).toContain('Campaign Draft');
    expect(afterGen).toContain('Budget &amp; Audience');
    expect(afterGen).toContain('Schedule');
    expect(afterGen).toContain('Approve campaign');

    // Executive approves the launch.
    r = await c.req('POST', `/missions/${missionId}/campaign/approve`);
    expect(r.status).toBe(303);
    await asT(async () => {
      expect((await app.missions.list()).find((m) => m.tenantId === tenantId)!.status).toBe('planning');
    });

    const approved = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(approved).toContain('Campaign approved by executive');
    // Earlier stages still read as approved.
    expect(approved).toContain('Brief approved by executive');
    expect(approved).toContain('Creative approved by executive');

    // Events: the campaign chain fired.
    const events = app.recentEvents(tenantId, 60).map((e) => e.eventName);
    expect(events).toContain('campaign.created.v1');
    expect(events.filter((e) => e === 'mission.approval.requested.v1').length).toBeGreaterThanOrEqual(3);
    expect(events.filter((e) => e === 'mission.approved.v1').length).toBeGreaterThanOrEqual(3);

    // Campaigns list screen shows it.
    const campaignScreen = await (await c.req('GET', '/campaigns')).text();
    expect(campaignScreen).toContain('Campaigns');
    expect(campaignScreen).toContain(`/missions/${missionId}`);
  });

  it('supports campaign rejection', async () => {
    const c = client();
    const { missionId, tenantId } = await readyForCampaign(c, 'Campaign Reject Co');
    await c.req('POST', `/missions/${missionId}/campaign`);
    const r = await c.req('POST', `/missions/${missionId}/campaign/reject`);
    expect(r.status).toBe(303);
    const rejected = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(rejected).toContain('Campaign rejected by executive');
    expect(app.recentEvents(tenantId, 60).map((e) => e.eventName)).toContain('mission.failed.v1');
  });

  it('does not offer campaign generation before the creative is approved', async () => {
    const c = client();
    const company = 'Campaign Gate Co';
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
    await c.req('POST', `/missions/${missionId}/creative`); // creative generated but NOT approved
    const detail = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(detail).not.toContain('Generate Campaign Draft');

    // Direct POST is blocked by the gate — no campaign created.
    await c.req('POST', `/missions/${missionId}/campaign`);
    await asT(async () => expect(await app.campaigns.list(missionId)).toHaveLength(0));
  });
});
