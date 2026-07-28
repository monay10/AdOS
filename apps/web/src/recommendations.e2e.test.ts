import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
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

describe('Recommendations page (Sprint 10)', () => {
  it('surfaces a grounded "scale" recommendation from accumulated brain history', async () => {
    const c = client();
    const company = 'Rec Co';
    const tenantId = slugifyTenant(company);
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);

    await c.req('POST', '/login', { email: 'o@x.com', company });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'Client', industry: 'dental', email: 'c@x.com' });

    // Seed the Company Brain with strong dental history (the compounding asset).
    await asT(() => app.brain.enrich({ kind: 'marketing', insight: dentalWin }));

    const html = await (await c.req('GET', '/recommendations')).text();
    expect(html).toContain('Scale dental'); // the ranked recommendation
    expect(html).toContain('4× ROAS'); // grounded in the real accumulated ROAS
    expect(html).toContain('first 3s smile'); // names the proven winning hook
  });

  it('shows the empty state before any history exists', async () => {
    const c = client();
    const company = 'Fresh Co';
    await c.req('POST', '/login', { email: 'o2@x.com', company });
    await c.req('POST', '/workspaces', { name: 'WS2', currency: 'TRY', timezone: 'UTC' });
    const html = await (await c.req('GET', '/recommendations')).text();
    expect(html).toContain('No recommendations yet'); // honest empty state
  });
});
