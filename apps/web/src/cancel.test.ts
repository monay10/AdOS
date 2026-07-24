import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { MissionId } from '@ados/agency-os';
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

async function missionFor(c: ReturnType<typeof client>, company: string) {
  const tenantId = slugifyTenant(company);
  const asT = <T>(fn: () => Promise<T>): Promise<T> =>
    TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);
  await c.req('POST', '/login', { email: 'o@x.com', company });
  await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
  const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/clients', { workspaceId: wsId, name: 'Bright Dental', industry: 'dental', email: 'c@x.com' });
  const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Acquire new dental patients this quarter', budget: '80000', currency: 'TRY', period: 'monthly' });
  const id = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());
  return { tenantId, asT, id };
}

describe('Mission cancellation (UI to persistence)', () => {
  it('offers cancel on an active mission, then cancels it with a reason', async () => {
    const c = client();
    const { tenantId, asT, id } = await missionFor(c, 'Cancel Demo Co');

    // The active mission offers a cancel control.
    let detail = await (await c.req('GET', `/missions/${id}`)).text();
    expect(detail).toContain('Cancel mission');
    expect(detail).not.toContain('Mission failed');

    // Cancel with a reason.
    const r = await c.req('POST', `/missions/${id}/cancel`, { reason: 'Client paused the budget' });
    expect(r.status).toBe(303);

    // Result on screen: failed banner + the reason; cancel control gone.
    detail = await (await c.req('GET', `/missions/${id}`)).text();
    expect(detail).toContain('Mission failed — Client paused the budget');
    expect(detail).not.toContain('Cancel mission');

    // Persistence: status failed + reason stored on the aggregate.
    await asT(async () => {
      const m = (await app.missions.get(MissionId.of(id))).unwrap();
      expect(m.status).toBe('failed');
      expect(m.failureReason).toBe('Client paused the budget');
    });

    // Event fired.
    expect(app.recentEvents(tenantId, 30).map((e) => e.eventName)).toContain('mission.failed.v1');
  });

  it('defaults the reason when none is given', async () => {
    const c = client();
    const { asT, id } = await missionFor(c, 'Cancel Default Co');
    const r = await c.req('POST', `/missions/${id}/cancel`, {});
    expect(r.status).toBe(303);
    await asT(async () => {
      expect((await app.missions.get(MissionId.of(id))).unwrap().failureReason).toBe('Cancelled by the customer');
    });
  });

  it('cannot cancel an already-failed mission', async () => {
    const c = client();
    const { id } = await missionFor(c, 'Cancel Twice Co');
    await c.req('POST', `/missions/${id}/cancel`, { reason: 'first' });
    const r = await c.req('POST', `/missions/${id}/cancel`, { reason: 'second' });
    // The domain refuses the second transition; the detail re-renders with the error.
    expect(r.status).toBe(200);
    const detail = await c.req('GET', `/missions/${id}`);
    expect(await detail.text()).toContain('Mission failed — first'); // unchanged
  });
});
