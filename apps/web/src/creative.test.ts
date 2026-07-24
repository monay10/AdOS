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

/** Onboard + generate & approve a brief, leaving the mission ready for creative. */
async function readyForCreative(c: ReturnType<typeof client>, company: string): Promise<{ missionId: string; tenantId: string }> {
  const tenantId = slugifyTenant(company);
  const asT = <T>(fn: () => Promise<T>): Promise<T> =>
    TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);

  await c.req('POST', '/login', { email: 'o@x.com', company });
  await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
  const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/clients', { workspaceId: wsId, name: 'Client', industry: 'healthcare', email: 'c@x.com' });
  const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/brands', { clientId, name: 'Brand', voice: 'warm and trustworthy', values: 'care, expertise' });
  await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'In-clinic whitening', pricingModel: 'one_time', price: '129', currency: 'TRY' });
  await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Acquire new dental patients next month', budget: '80000', currency: 'TRY', period: 'monthly' });
  const missionId = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());

  await c.req('POST', `/missions/${missionId}/brief`);
  await c.req('POST', `/missions/${missionId}/approve`);
  return { missionId, tenantId };
}

describe('Phase 3 — Creative (Brief → Creative Studio → Creative Review → Dashboard)', () => {
  it('unlocks creative only after brief approval, generates the set, and reviews it', async () => {
    const c = client();
    const { missionId, tenantId } = await readyForCreative(c, 'Bright Creative Co');
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);

    // Brief approved → the Creative Studio section offers generation.
    const detail = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(detail).toContain('Brief approved by executive');
    expect(detail).toContain('Generate Creative');

    // Generate creative → all six outputs render; mission moves to review.
    let r = await c.req('POST', `/missions/${missionId}/creative`);
    expect(r.status).toBe(303);

    await asT(async () => {
      const sets = await app.creative.list(missionId);
      expect(sets).toHaveLength(1);
      const content = sets[0]!.content;
      expect(content.headline).toBeTruthy();
      expect(content.cta).toBeTruthy();
      expect(content.landingPage.headline).toBeTruthy();
      expect(content.email.subject).toBeTruthy();
      expect(sets[0]!.provenance.taskId).toBeTruthy();
      expect((await app.missions.list()).find((m) => m.tenantId === tenantId)!.status).toBe('awaiting_approval');
    });

    const afterGen = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(afterGen).toContain('Creative Studio');
    expect(afterGen).toContain('Approve creative');
    expect(afterGen).toContain('Landing page');

    // Executive approves the creative.
    r = await c.req('POST', `/missions/${missionId}/creative/approve`);
    expect(r.status).toBe(303);
    await asT(async () => {
      expect((await app.missions.list()).find((m) => m.tenantId === tenantId)!.status).toBe('planning');
    });

    const approved = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(approved).toContain('Creative approved by executive');

    // Events: the creative chain fired.
    const events = app.recentEvents(tenantId, 40).map((e) => e.eventName);
    expect(events).toContain('creative.generated.v1');
    expect(events.filter((e) => e === 'mission.approval.requested.v1').length).toBeGreaterThanOrEqual(2);
    expect(events.filter((e) => e === 'mission.approved.v1').length).toBeGreaterThanOrEqual(2);

    // Creative Studio list screen shows it.
    const creativeScreen = await (await c.req('GET', '/creative')).text();
    expect(creativeScreen).toContain('Creative Studio');
    expect(creativeScreen).toContain(`/missions/${missionId}`);
  });

  it('supports creative rejection', async () => {
    const c = client();
    const { missionId, tenantId } = await readyForCreative(c, 'Reject Creative Co');
    await c.req('POST', `/missions/${missionId}/creative`);
    const r = await c.req('POST', `/missions/${missionId}/creative/reject`);
    expect(r.status).toBe(303);
    const rejected = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(rejected).toContain('Creative rejected by executive');
    // Brief still reads as approved even though the creative was rejected.
    expect(rejected).toContain('Brief approved by executive');
    expect(app.recentEvents(tenantId, 40).map((e) => e.eventName)).toContain('mission.failed.v1');
  });

  it('does not offer creative generation before the brief is approved', async () => {
    const c = client();
    const company = 'Gate Creative Co';
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

    await c.req('POST', `/missions/${missionId}/brief`); // brief generated but NOT approved
    const detail = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(detail).not.toContain('Generate Creative');

    // A direct POST is rejected by the gate — no creative is created.
    await c.req('POST', `/missions/${missionId}/creative`);
    await asT(async () => expect(await app.creative.list(missionId)).toHaveLength(0));
  });
});
