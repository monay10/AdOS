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

describe('Performance Memory read-back (Company Brain is no longer write-only)', () => {
  it('injects a completed campaign\'s past performance into a NEW campaign\'s brief', async () => {
    const c = client();
    const company = 'Memory Read-back Co';
    const tenantId = slugifyTenant(company);
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);

    // Onboard one client in the "dental" vertical.
    await c.req('POST', '/login', { email: 'o@x.com', company });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'Client', industry: 'dental', email: 'c@x.com' });
    const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/brands', { clientId, name: 'Brand', voice: 'warm', values: 'care' });
    await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'In-clinic whitening', pricingModel: 'one_time', price: '129', currency: 'TRY' });

    // ── Mission 1: the FIRST campaign. Its own brief has NO history yet. ──
    await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Acquire new dental patients this month', budget: '5000', currency: 'TRY', period: 'monthly' });
    const missionId1 = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());

    await c.req('POST', `/missions/${missionId1}/brief`);
    const brief1 = await (await c.req('GET', `/missions/${missionId1}`)).text();
    expect(brief1).not.toContain('Historical context'); // brain empty on the first campaign

    // Complete mission 1 → its outcome is written to the per-vertical Marketing memory.
    await c.req('POST', `/missions/${missionId1}/approve`, { acknowledge: 'governance' });
    await c.req('POST', `/missions/${missionId1}/creative`);
    await c.req('POST', `/missions/${missionId1}/creative/approve`, { acknowledge: 'governance' });
    await c.req('POST', `/missions/${missionId1}/campaign`);
    await c.req('POST', `/missions/${missionId1}/campaign/approve`, { acknowledge: 'governance' });
    await c.req('POST', `/missions/${missionId1}/analytics`, {
      impressions: '100000', clicks: '2000', conversions: '100', leads: '130', spend: '1000', revenue: '3000', currency: 'TRY',
    });
    await c.req('POST', `/missions/${missionId1}/learn`);

    await asT(async () => {
      // The Company Brain now holds an aggregate for "dental".
      const insight = await app.brain.marketing('dental');
      expect(insight).not.toBeNull();
      expect(insight!.roas).toBe(3);
      expect(insight!.sampleSize).toBe(1);
    });

    // ── Mission 2: a NEW campaign for the same client. Its brief READS the history. ──
    await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Promote a new dental whitening offer next month', budget: '5000', currency: 'TRY', period: 'monthly' });
    const missionId2 = await asT(async () => {
      const ids = (await app.missions.list()).filter((m) => m.tenantId === tenantId).map((m) => m.id.toString());
      return ids.find((x) => x !== missionId1)!;
    });

    await c.req('POST', `/missions/${missionId2}/brief`);
    const brief2 = await (await c.req('GET', `/missions/${missionId2}`)).text();

    // The new brief was generated WITH the organization's past performance as context.
    expect(brief2).toContain('Historical context');
    expect(brief2).toContain('dental');
    expect(brief2).toContain('3.0x'); // average ROAS carried forward
    expect(brief2).toContain('2.0% CTR');
  });
});
