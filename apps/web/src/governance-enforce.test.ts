import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { MissionId } from '@ados/agency-os';
import { App } from './app.js';
import { buildServer } from './server.js';
import { slugifyTenant } from './session.js';

const SECRET = 'test-secret';

// strategy_and_budget (the brief gate) is HARD-ENFORCED for this app instance.
let app: App;
let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  app = new App(undefined, undefined, undefined, undefined, undefined, undefined, {
    enforcedGates: new Set(['strategy_and_budget']),
  });
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

describe('Governance Enforced tier (Sprint 8 — hard block at an enforced gate)', () => {
  it('blocks approval of a flagged artifact even WITH acknowledgment; reject still works', async () => {
    const c = client();
    const company = 'Enforce Co';
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
    await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Acquire new dental patients', budget: '5000', currency: 'TRY', period: 'monthly' });
    const missionId = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());

    // First, ungrounded brief → governance flags no_evidence.
    await c.req('POST', `/missions/${missionId}/brief`);

    // The gate page shows the ENFORCED block, not the ack checkbox.
    const gateHtml = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(gateHtml).toContain('Governance blocked'); // enforced notice
    expect(gateHtml).not.toContain('acknowledge'); // no override checkbox at an enforced gate

    // Approving WITH acknowledgment is still refused server-side.
    await c.req('POST', `/missions/${missionId}/approve`, { acknowledge: 'governance' });
    const afterApprove = await asT(async () => await app.missions.get(MissionId.of(missionId)));
    expect(afterApprove.isErr).toBe(false);
    if (!afterApprove.isErr) expect(afterApprove.value.status).toBe('awaiting_approval'); // NOT approved

    // Reject (send back for revision) still works — the way forward is not blocked.
    await c.req('POST', `/missions/${missionId}/reject`);
    const afterReject = await asT(async () => await app.missions.get(MissionId.of(missionId)));
    if (!afterReject.isErr) expect(afterReject.value.status).toBe('planning'); // non-destructive revision
  });
});
