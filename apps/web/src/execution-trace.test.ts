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

describe('ExecutionTrace goes live (Sprint 4.1 — every AI task is auditable)', () => {
  it('records a sealed ExecutionTrace for each AI task without changing generation', async () => {
    const c = client();
    const company = 'Trace Co';
    const tenantId = slugifyTenant(company);
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);

    // Onboard one client and run a mission end-to-end.
    await c.req('POST', '/login', { email: 'o@x.com', company });
    await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
    const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/clients', { workspaceId: wsId, name: 'Client', industry: 'dental', email: 'c@x.com' });
    const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
    await c.req('POST', '/brands', { clientId, name: 'Brand', voice: 'warm', values: 'care' });
    await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'In-clinic whitening', pricingModel: 'one_time', price: '129', currency: 'TRY' });

    await c.req('POST', '/missions', { workspaceId: wsId, clientId, objective: 'Acquire new dental patients', budget: '5000', currency: 'TRY', period: 'monthly' });
    const missionId = await asT(async () => (await app.missions.list()).find((m) => m.tenantId === tenantId)!.id.toString());

    // No AI has run yet → no traces.
    expect(app.traces.count(tenantId)).toBe(0);

    // Generate a brief. Its rendered output must be unchanged (still names the product).
    await c.req('POST', `/missions/${missionId}/brief`);
    const briefHtml = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(briefHtml).toContain('Whitening');

    // A trace now exists for the brief task — recording only what actually ran.
    const afterBrief = app.traces.list(tenantId);
    expect(afterBrief.length).toBe(1);
    const briefTrace = afterBrief[0]!;
    expect(briefTrace.capability).toBe('reasoning');
    expect(briefTrace.promptKey).toBe('marketing.brief');
    expect(briefTrace.model).toBe('offline-deterministic');
    expect(briefTrace.engine).toBe('ollama');
    expect(briefTrace.missionId).toBe(missionId);
    expect(briefTrace.latencyMs).toBeGreaterThanOrEqual(0);
    // Sprint 4.2: a real ordered Stage Engine runs around generation, each stage
    // recorded as its own trace step. Generation itself is the `inference` step.
    expect(briefTrace.steps.map((s) => s.name)).toEqual([
      'plan',
      'safety.input',
      'route',
      'inference',
      'safety.output',
      'completed',
    ]);
    expect(briefTrace.finishedAt).toBeDefined();

    // Each stage genuinely ran and left a real, honest record.
    const step = (name: string) => briefTrace.steps.find((s) => s.name === name)!;
    expect(step('plan').detail).toMatchObject({ placeholder: true, capability: 'reasoning', missionId });
    expect(step('safety.input').detail).toMatchObject({ ok: true }); // clean input, observe-only
    // Routing DECISION is recorded (a real reasoning-capable local model), while
    // generation was served by the wrapped manager (recorded separately below).
    expect(step('route').detail?.['decidedModel']).toBeTruthy();
    expect(step('safety.output').detail).toMatchObject({ ok: true });
    // The served model is the wrapped manager's, NOT the routing decision.
    expect(briefTrace.model).toBe('offline-deterministic');

    // Governed stages are NOT wired yet — the trace never fabricates them.
    expect(briefTrace.evidence).toEqual([]);
    expect(briefTrace.confidence).toBeUndefined();
    expect(briefTrace.steps.map((s) => s.name)).not.toContain('constitution');

    // Run the rest of the mission → each AI task adds a trace.
    await c.req('POST', `/missions/${missionId}/approve`);
    await c.req('POST', `/missions/${missionId}/creative`);
    await c.req('POST', `/missions/${missionId}/creative/approve`);
    await c.req('POST', `/missions/${missionId}/campaign`);

    const promptKeys = app.traces.list(tenantId).map((tr) => tr.promptKey);
    expect(promptKeys).toContain('marketing.brief');
    expect(promptKeys).toContain('creative.set');
    expect(promptKeys).toContain('campaign.draft');

    // The /traces view surfaces the live audit trail.
    const tracesHtml = await (await c.req('GET', '/traces')).text();
    expect(tracesHtml).toContain('AI Execution Traces');
    expect(tracesHtml).toContain('offline-deterministic');
    expect(tracesHtml).toContain('marketing.brief');
    expect(tracesHtml).toContain('inference');
  });
});
