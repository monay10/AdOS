import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { MissionId } from '@ados/agency-os';
import type { MarketingInsight } from '@ados/contracts';
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

const dentalWin: MarketingInsight = {
  vertical: 'dental',
  ctr: 6,
  cpa: 15,
  roas: 4,
  bestHook: 'first 3s smile',
  bestHeadline: 'Book your whitening',
  bestOffer: '2-for-1',
  bestFunnel: 'reservation',
  sampleSize: 6,
};

describe('Recommendation → Apply (safe application)', () => {
  it('applies a recommendation: agent creates + generates a mission, queued, stopped at the human gate', async () => {
    const c = client();
    const company = 'Apply Co';
    const tenantId = slugifyTenant(company);
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);

    await c.req('POST', '/login', { email: 'o@x.com', company });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'Client', industry: 'dental', email: 'c@x.com' });
    const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/brands', { clientId, name: 'Brand', voice: 'warm', values: 'care' });
    await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'In-clinic whitening', pricingModel: 'one_time', price: '129', currency: 'TRY' });

    // Seed strong dental history → a "scale" recommendation with an Apply button.
    await asT(() => app.brain.enrich({ kind: 'marketing', insight: dentalWin }));
    const recsHtml = await (await c.req('GET', '/recommendations')).text();
    expect(recsHtml).toContain('Scale dental');
    expect(recsHtml).toContain('/recommendations/apply'); // the Apply control

    // Apply it.
    const applyRes = await c.req('POST', '/recommendations/apply', { vertical: 'dental', kind: 'scale' });
    expect(applyRes.status).toBe(303); // redirected to the created mission
    const missionPath = applyRes.headers.get('location')!;
    const missionId = missionPath.split('/').pop()!;

    // The agent generated the brief through the governed pipeline and STOPPED at
    // the human gate — the mission awaits approval, a brief exists, and it was
    // grounded by the seeded history.
    const mission = await asT(() => app.missions.get(MissionId.of(missionId)));
    expect(mission.isErr).toBe(false);
    if (!mission.isErr) expect(mission.value.status).toBe('awaiting_approval');
    expect(await asT(async () => (await app.briefs.list(missionId)).length)).toBe(1);

    // It shows in the Mission Queue as awaiting approval.
    const queueHtml = await (await c.req('GET', '/recommendations')).text();
    expect(queueHtml).toContain('Mission queue');
    expect(queueHtml).toContain('awaiting approval');

    // The human still holds the decision — the governed gate is present on the mission.
    const missionHtml = await (await c.req('GET', missionPath)).text();
    expect(missionHtml).toContain('Governance'); // the governance verdict at the gate
    expect(missionHtml).toContain(`/missions/${missionId}/approve`); // human approval control
  });

  it('refuses to apply when the vertical has no client with a brand + product', async () => {
    const c = client();
    const company = 'Empty Co';
    await c.req('POST', '/login', { email: 'e@x.com', company });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const res = await c.req('POST', '/recommendations/apply', { vertical: 'dental', kind: 'scale' });
    expect(res.status).toBe(400);
    const html = await res.text();
    expect(html).toContain('No client with a brand');
  });
});
