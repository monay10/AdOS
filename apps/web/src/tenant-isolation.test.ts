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

const win = (roas: number): MarketingInsight => ({
  vertical: 'dental',
  ctr: 6,
  cpa: 15,
  roas,
  bestHook: 'h',
  bestHeadline: 'hl',
  bestOffer: 'o',
  bestFunnel: 'reservation',
  sampleSize: 6,
});

async function onboardDental(company: string) {
  const c = client();
  const tenantId = slugifyTenant(company);
  const asT = <T>(fn: () => Promise<T>): Promise<T> =>
    TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);
  await c.req('POST', '/login', { email: 'o@x.com', company });
  await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
  const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/clients', { workspaceId: wsId, name: 'Client', industry: 'dental', email: 'c@x.com' });
  return { c, tenantId, asT };
}

describe('Tenant isolation (Company Brain + Recommendations)', () => {
  it('one tenant never sees another tenant’s brain memory or recommendations', async () => {
    const acme = await onboardDental('Acme Dental');
    const globex = await onboardDental('Globex Dental');

    // Each tenant accumulates its OWN dental performance in the Company Brain.
    await acme.asT(() => app.brain.enrich({ kind: 'marketing', insight: win(5) })); // strong → "scale"
    await globex.asT(() => app.brain.enrich({ kind: 'marketing', insight: win(1) })); // weak → "revise"

    // The brain read is tenant-scoped.
    expect(await acme.asT(() => app.brain.marketing('dental'))).toMatchObject({ roas: 5 });
    expect(await globex.asT(() => app.brain.marketing('dental'))).toMatchObject({ roas: 1 });

    // Recommendations reflect only the requesting tenant's own data.
    const acmeRecs = await (await acme.c.req('GET', '/recommendations')).text();
    expect(acmeRecs).toContain('Scale dental'); // Acme's strong ROAS
    expect(acmeRecs).not.toContain('Revise dental'); // never Globex's weak ROAS

    const globexRecs = await (await globex.c.req('GET', '/recommendations')).text();
    expect(globexRecs).toContain('Revise dental'); // Globex's weak ROAS
    expect(globexRecs).not.toContain('Scale dental'); // never Acme's strong ROAS
  });

  it('a tenant’s experience sub-brain is invisible to another tenant', async () => {
    const a = await onboardDental('Alpha Co');
    const b = await onboardDental('Beta Co');
    await a.asT(() =>
      app.brain.experience.record({ tenantId: a.tenantId, vertical: 'dental', context: { format: 'video' }, action: 'A-ran', result: { ctr: 6 }, reason: 'r', learned: 'l', at: '2026-01-01T00:00:00.000Z' }),
    );
    const aSees = await a.asT(() => app.brain.experience.findSimilar({ vertical: 'dental', context: { format: 'video' }, k: 5 }));
    const bSees = await b.asT(() => app.brain.experience.findSimilar({ vertical: 'dental', context: { format: 'video' }, k: 5 }));
    expect(aSees).toHaveLength(1);
    expect(bSees).toHaveLength(0); // Beta cannot see Alpha's experience
  });
});
