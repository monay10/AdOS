import type { AddressInfo } from 'node:net';
import { performance } from 'node:perf_hooks';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { App } from './app.js';
import { buildServer } from './server.js';
import { slugifyTenant } from './session.js';

let app: App;
let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  app = new App();
  await app.start();
  const { server } = buildServer({ sessionSecret: 'perf', app });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise<void>((r) => server.close(() => r()));
});
afterAll(async () => { await close(); });

const pct = (arr: number[], p: number): number => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return Math.round((s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))] ?? 0) * 100) / 100;
};

function jar() {
  let cookie = '';
  return {
    async req(method: string, path: string, body?: Record<string, string>): Promise<Response> {
      const headers: Record<string, string> = {};
      if (cookie) headers['cookie'] = cookie;
      let payload: string | undefined;
      if (body) { headers['content-type'] = 'application/x-www-form-urlencoded'; payload = new URLSearchParams(body).toString(); }
      const res = await fetch(`${base}${path}`, { method, headers, ...(payload ? { body: payload } : {}), redirect: 'manual' });
      const sc = res.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0]!;
      return res;
    },
  };
}

/** One full customer journey for an isolated tenant; returns per-step timings. */
async function journey(company: string): Promise<Record<string, number>> {
  const tenantId = slugifyTenant(company);
  const asT = <T>(fn: () => Promise<T>): Promise<T> =>
    TenantContext.run({ tenantId, correlationId: 'perf', actor: 'u@perf.com', roles: [] } as RequestContext, fn);
  const c = jar();
  const t: Record<string, number> = {};
  const timed = async (name: string, fn: () => Promise<unknown>): Promise<void> => { const s = performance.now(); await fn(); t[name] = Math.round((performance.now() - s) * 100) / 100; };

  const find = async <T extends { tenantId: string; id: { toString(): string } }>(list: () => Promise<T[]>): Promise<string> =>
    asT(async () => (await list()).find((x) => x.tenantId === tenantId)!.id.toString());

  await timed('login', () => c.req('POST', '/login', { email: 'u@perf.com', company }));
  await timed('workspace', () => c.req('POST', '/workspaces', { name: 'WS', currency: 'USD', timezone: 'UTC' }));
  const wsId = await find(() => app.workspaces.list());
  await timed('client', () => c.req('POST', '/clients', { workspaceId: wsId, name: 'C', industry: 'retail', email: 'u@perf.com' }));
  const clientId = await find(() => app.clients.list());
  await c.req('POST', '/brands', { clientId, name: 'B', voice: 'bold', values: 'quality' });
  const brandId = await find(() => app.brands.list());
  const projRes = await c.req('POST', '/projects', { brandId, name: 'Perf Project', description: 'perf journey project' });
  const projectId = (projRes.headers.get('location') ?? '').replace('/projects/', '');
  await timed('mission', () => c.req('POST', '/missions', { workspaceId: wsId, clientId, projectId, objective: 'Grow quarterly revenue via a new campaign', budget: '50000', currency: 'USD', period: 'monthly', metricName: 'sales', metricTarget: '100', metricUnit: 'count' }));
  const missionId = await asT(async () => (await app.missions.list()).find((m) => m.projectId === projectId)!.id.toString());
  await timed('brief', () => c.req('POST', `/missions/${missionId}/brief`));
  await c.req('POST', `/missions/${missionId}/approve`, { acknowledge: 'governance' });
  await timed('creative', () => c.req('POST', `/missions/${missionId}/creative`));
  await c.req('POST', `/missions/${missionId}/creative/approve`, { acknowledge: 'governance' });
  await timed('campaign', () => c.req('POST', `/missions/${missionId}/campaign`));
  await c.req('POST', `/missions/${missionId}/campaign/approve`, { acknowledge: 'governance' });
  await timed('analytics', () => c.req('POST', `/missions/${missionId}/analytics`, { impressions: '100000', clicks: '4000', spend: '50000', conversions: '100', revenue: '200000', leads: '100' }));
  await timed('executive', () => c.req('POST', `/missions/${missionId}/executive`));
  await c.req('POST', '/logout');
  return t;
}

describe('Startup time', () => {
  it('measures cold and warm startup', async () => {
    const c0 = performance.now(); const a = new App(); await a.start(); const cold = Math.round((performance.now() - c0) * 100) / 100;
    const w0 = performance.now(); const b = new App(); await b.start(); const warm = Math.round((performance.now() - w0) * 100) / 100;
    // eslint-disable-next-line no-console
    console.log(`startup: cold ${cold}ms, warm ${warm}ms`);
    expect(cold).toBeLessThan(2_000); // App boots well under a second in-process
    expect(warm).toBeLessThanOrEqual(cold + 50);
  });
});

describe('Business-flow latency (single journey breakdown)', () => {
  it('measures each pipeline stage', async () => {
    const t = await journey('SoloCo');
    // eslint-disable-next-line no-console
    console.log('journey stage latency (ms):', t);
    // Offline AI pipeline stages complete quickly (no model server).
    for (const stage of ['brief', 'creative', 'campaign', 'analytics', 'executive']) expect(t[stage]).toBeLessThan(500);
  });
});

describe('Scenario A — concurrent full journeys', () => {
  it('runs many isolated journeys concurrently with low error rate', async () => {
    const K = 25; // scaled in-process; pure-HTTP 100/500/1000 concurrency is in load.test.ts
    const results = await Promise.allSettled(Array.from({ length: K }, (_v, i) => {
      const start = performance.now();
      return journey(`PerfCo${i}`).then(() => performance.now() - start);
    }));
    const durations = results.filter((r): r is PromiseFulfilledResult<number> => r.status === 'fulfilled').map((r) => r.value);
    const errors = results.length - durations.length;
    // eslint-disable-next-line no-console
    console.log(`scenario A: ${durations.length}/${K} journeys ok, errors ${errors}, p50 ${pct(durations, 50)}ms p95 ${pct(durations, 95)}ms p99 ${pct(durations, 99)}ms`);
    expect(errors).toBe(0); // zero-error under concurrent full journeys
    expect(durations.length).toBe(K);
  });
});
