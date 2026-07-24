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

/** Onboard + run the whole pipeline to an analytics report, ready for learning. */
async function readyForLearning(c: ReturnType<typeof client>, company: string): Promise<{ missionId: string; tenantId: string; clientId: string; asT: <T>(fn: () => Promise<T>) => Promise<T> }> {
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
  await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Acquire new dental patients next month', budget: '80000', currency: 'TRY', period: 'monthly' });
  const missionId = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());

  await c.req('POST', `/missions/${missionId}/brief`);
  await c.req('POST', `/missions/${missionId}/approve`);
  await c.req('POST', `/missions/${missionId}/creative`);
  await c.req('POST', `/missions/${missionId}/creative/approve`);
  await c.req('POST', `/missions/${missionId}/campaign`);
  await c.req('POST', `/missions/${missionId}/campaign/approve`);
  await c.req('POST', `/missions/${missionId}/analytics`, { impressions: '100000', clicks: '2000', conversions: '100', leads: '130', spend: '80000', revenue: '240000', currency: 'TRY' });
  return { missionId, tenantId, clientId, asT };
}

describe('Phase 6 — Company Brain Learning (Analytics → Journal → Memory → Brain → Pattern → Graph)', () => {
  it('records the outcome across every knowledge store and completes the mission', async () => {
    const c = client();
    const { missionId, tenantId, asT } = await readyForLearning(c, 'Learning Demo Co');

    // Report present → the learning action is offered.
    const detail = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(detail).toContain('Company Brain — Learning');
    expect(detail).toContain('Record learning to Company Brain');

    // Record learning.
    const r = await c.req('POST', `/missions/${missionId}/learn`);
    expect(r.status).toBe(303);

    await asT(async () => {
      // Mission completed.
      expect((await app.missions.list()).find((m) => m.tenantId === tenantId)!.status).toBe('completed');
      // Decision Journal — the entry for this mission.
      const journal = await app.journal.history({ subjectId: missionId, k: 5 });
      expect(journal).toHaveLength(1);
      expect(journal[0]!.outcome?.['roas']).toBe(3);
      expect(journal[0]!.confidence.score).toBeGreaterThan(0);
      // Executive Memory — a CMO campaign memory for this tenant.
      const memory = await app.execMemory.recall({ tenantId, role: 'cmo', category: 'campaign', k: 5 });
      expect(memory.some((m) => String(m.metadata?.['missionId']) === missionId)).toBe(true);
      // Company Brain — experience, pattern, knowledge graph.
      const experiences = await app.brain.experience.findSimilar({ vertical: 'dental', k: 5 });
      expect(experiences.length).toBeGreaterThan(0);
      const patterns = await app.brain.patterns.bestFor('dental');
      expect(patterns.length).toBeGreaterThan(0);
      const graphNodes = await app.brain.graph.neighbors(`mission:${missionId}`, 'ran');
      expect(graphNodes.length).toBeGreaterThan(0);
    });

    // The learning renders on screen.
    const learned = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(learned).toContain('recorded');
    expect(learned).toContain('Pattern Library');
    expect(learned).toContain('Knowledge Graph');

    // Events for the whole learning flow fired.
    const events = app.recentEvents(tenantId, 100).map((e) => e.eventName);
    for (const expected of ['exec.decision.journaled.v1', 'exec.memory.updated.v1', 'brain.experience.recorded.v1', 'brain.pattern.captured.v1', 'brain.enriched.v1', 'mission.completed.v1']) {
      expect(events).toContain(expected);
    }

    // Dashboard reflects the learning.
    const dash = await (await c.req('GET', '/dashboard')).text();
    expect(dash).toContain('Brain Learnings');
  });

  it('is idempotent — a second learn does not duplicate or error', async () => {
    const c = client();
    const { missionId, tenantId, asT } = await readyForLearning(c, 'Learning Idem Co');
    await c.req('POST', `/missions/${missionId}/learn`);
    const r = await c.req('POST', `/missions/${missionId}/learn`);
    expect(r.status).toBe(303);
    await asT(async () => {
      expect(await app.journal.history({ subjectId: missionId, k: 5 })).toHaveLength(1);
      expect((await app.missions.list()).find((m) => m.tenantId === tenantId)!.status).toBe('completed');
    });
  });

  it('does not offer learning before the analytics report exists', async () => {
    const c = client();
    const company = 'Learning Gate Co';
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
    const detail = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(detail).not.toContain('Record learning to Company Brain');

    // Direct POST is blocked — mission not completed, nothing journaled.
    await c.req('POST', `/missions/${missionId}/learn`);
    await asT(async () => {
      expect(await app.journal.history({ subjectId: missionId, k: 5 })).toHaveLength(0);
      expect((await app.missions.list()).find((m) => m.tenantId === tenantId)!.status).not.toBe('completed');
    });
  });
});
