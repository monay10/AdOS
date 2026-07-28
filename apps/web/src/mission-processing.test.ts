import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { App } from './app.js';
import { buildServer } from './server.js';
import { slugifyTenant } from './session.js';

const SECRET = 'test-secret';
const company = 'Bright Smiles Dental';
const tenantId = slugifyTenant(company);

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

function runAs<T>(fn: () => Promise<T>): Promise<T> {
  const ctx: RequestContext = { tenantId, correlationId: 'test', actor: 'owner@bright.com', roles: [] };
  return TenantContext.run(ctx, fn);
}

/** Drive Phase-1 onboarding to leave a submitted Mission, returning its id. */
async function onboard(c: ReturnType<typeof client>): Promise<string> {
  await c.req('POST', '/login', { email: 'owner@bright.com', company });
  await c.req('POST', '/workspaces', { name: 'Bright Workspace', currency: 'TRY', timezone: 'UTC' });
  const wsId = await runAs(async () => (await app.workspaces.list())[0]!.id.toString());
  await c.req('POST', '/clients', { workspaceId: wsId, name: 'Bright Smiles Dental', industry: 'healthcare', email: 'o@b.com' });
  const clientId = await runAs(async () => (await app.clients.list())[0]!.id.toString());
  await c.req('POST', '/brands', { clientId, name: 'Bright Smiles', voice: 'warm and trustworthy', values: 'care, expertise' });
  await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'In-clinic whitening', pricingModel: 'one_time', price: '129', currency: 'TRY' });
  await c.req('POST', '/missions', {
    workspaceId: wsId,
    clientId,
    objective: 'Acquire new patients for a dental clinic opening next month',
    budget: '80000',
    currency: 'TRY',
    period: 'monthly',
    metricName: 'leads',
    metricTarget: '120',
    metricUnit: 'count',
  });
  return runAs(async () => (await app.missions.list())[0]!.id.toString());
}

describe('Phase 2 — Mission Processing (Mission → Brief → Executive Approval → Dashboard)', () => {
  it('generates a Marketing Brief, moves to approval, and approves — end to end', async () => {
    const c = client();
    const missionId = await onboard(c);

    // Mission detail offers brief generation.
    const detail = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(detail).toContain('Generate Marketing Brief');

    // Generate the brief → Marketing Intelligence runs, mission moves to approval.
    let r = await c.req('POST', `/missions/${missionId}/brief`);
    expect(r.status).toBe(303);

    await runAs(async () => {
      const briefs = await app.briefs.list(missionId);
      expect(briefs).toHaveLength(1);
      expect(briefs[0]!.content.recommendedChannels.length).toBeGreaterThan(0);
      expect(briefs[0]!.provenance.taskId).toBeTruthy(); // AI provenance recorded
      const mission = (await app.missions.list())[0]!;
      expect(mission.status).toBe('awaiting_approval');
    });

    // The brief + approval controls now render, and the dashboard lists it as pending.
    const afterGen = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(afterGen).toContain('Marketing Brief');
    expect(afterGen).toContain('Approve brief');
    const dash1 = await (await c.req('GET', '/dashboard')).text();
    expect(dash1).toContain('Pending executive approvals');

    // Executive approves.
    r = await c.req('POST', `/missions/${missionId}/approve`);
    expect(r.status).toBe(303);
    await runAs(async () => {
      expect((await app.missions.list())[0]!.status).toBe('planning'); // approved gate returns to planning
    });

    // Approved state shows on screen; no longer pending on the dashboard.
    const approved = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(approved).toContain('Brief approved by executive');
    const dash2 = await (await c.req('GET', '/dashboard')).text();
    expect(dash2).not.toContain('Pending executive approvals');

    // Events: the whole processing chain fired.
    const events = app.recentEvents(tenantId, 30).map((e) => e.eventName);
    for (const expected of ['intel.brief.generated.v1', 'mission.planned.v1', 'mission.approval.requested.v1', 'mission.approved.v1']) {
      expect(events).toContain(expected);
    }

    // The Marketing Brief screen lists it.
    const briefScreen = await (await c.req('GET', '/brief')).text();
    expect(briefScreen).toContain('meta');
  });

  it('supports executive rejection', async () => {
    const c = client();
    // fresh tenant to keep this isolated
    await c.req('POST', '/login', { email: 'x@acme.com', company: 'Acme Reject Co' });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const t = slugifyTenant('Acme Reject Co');
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId: t, correlationId: 'r', actor: 'x@acme.com', roles: [] }, fn);
    const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === t)!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'Acme', industry: 'retail', email: 'a@a.com' });
    const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === t)!.id.toString());
    await c.req('POST', '/brands', { clientId, name: 'Acme Brand', voice: 'bold' });
    await c.req('POST', '/products', { clientId, name: 'Widget', description: 'A widget', pricingModel: 'free', currency: 'TRY' });
    await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Sell more widgets this quarter', budget: '5000', currency: 'TRY', period: 'monthly' });
    const missionId = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === t)!.id.toString());

    await c.req('POST', `/missions/${missionId}/brief`);
    const r = await c.req('POST', `/missions/${missionId}/reject`);
    expect(r.status).toBe(303);

    // Non-destructive: the mission is sent back for revision, not failed.
    const rejected = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(rejected).toContain('Generate Marketing Brief'); // brief discarded → re-offered for rework
    await asT(async () => {
      const mission = (await app.missions.list()).find((m) => m.tenantId === t)!;
      expect(mission.status).toBe('planning');
      expect(mission.revisionCount).toBe(1);
      expect(await app.briefs.list(missionId)).toHaveLength(0);
    });
    const events = app.recentEvents(t, 20).map((e) => e.eventName);
    expect(events).toContain('mission.revision.requested.v1');
    expect(events).not.toContain('mission.failed.v1');
  });

  it('blocks brief generation until a brand and product exist', async () => {
    const c = client();
    await c.req('POST', '/login', { email: 'z@noprereq.com', company: 'NoPrereq Co' });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const t = slugifyTenant('NoPrereq Co');
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId: t, correlationId: 'n', actor: 'z@noprereq.com', roles: [] }, fn);
    const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === t)!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'Solo', industry: 'x', email: 's@s.com' });
    const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === t)!.id.toString());
    // No brand, no product — go straight to a mission.
    await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Do something meaningful for the brand', budget: '1000', currency: 'TRY', period: 'monthly' });
    const missionId = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === t)!.id.toString());

    const html = await (await c.req('POST', `/missions/${missionId}/brief`)).text();
    expect(html).toContain('Add a brand and a product');
    await asT(async () => expect(await app.briefs.list(missionId)).toHaveLength(0));
  });
});
