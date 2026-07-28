import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { UnavailableError } from '@ados/kernel';
import { MissionId } from '@ados/agency-os';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import type { AITaskRequest, AITaskResult, AIStreamChunk, AIManagerPort } from '@ados/contracts';
import { App } from './app.js';
import { createOfflineGovernedManager } from './governed-inference.js';
import { buildServer } from './server.js';
import { slugifyTenant } from './session.js';

const SECRET = 'test-secret';

/**
 * Wraps the offline governed manager and, while `broken`, throws the same
 * UnavailableError the resilient pipeline raises when every routed model fails —
 * so we can drive the graceful-degrade path through the real HTTP flow, then
 * "recover" the engine and prove a retry succeeds with the mission intact.
 */
class ToggleAI implements AIManagerPort {
  broken = true;
  private readonly inner = createOfflineGovernedManager();
  submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    if (this.broken) throw new UnavailableError('All routed models failed', { details: { attempts: [] } });
    return this.inner.submit<T>(request);
  }
  stream(request: AITaskRequest): AsyncIterable<AIStreamChunk> {
    return this.inner.stream(request);
  }
}

let app: App;
let ai: ToggleAI;
let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  ai = new ToggleAI();
  app = new App(undefined, ai);
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

describe('Graceful degrade when the AI is unavailable (Sprint 7 — recovery)', () => {
  it('shows a retryable banner, keeps the mission intact, and recovers on retry', async () => {
    const c = client();
    const company = 'Degrade Co';
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

    // ── AI is down: generating the brief degrades gracefully. ──
    const downHtml = await (await c.req('POST', `/missions/${missionId}/brief`)).text();
    expect(downHtml).toContain('temporarily unavailable'); // the graceful banner, not a raw stack/500
    expect(downHtml).not.toContain('All routed models failed'); // the technical cause is not leaked
    // The mission is intact — no brief was created, status is not 'failed'
    // (reads are tenant-scoped, so run them inside the tenant context).
    expect(await asT(async () => (await app.briefs.list(missionId)).length)).toBe(0);
    const statusWhileDown = await asT(async () => (await app.missions.get(MissionId.of(missionId))));
    expect(statusWhileDown.isErr).toBe(false);
    if (!statusWhileDown.isErr) expect(statusWhileDown.value.status).not.toBe('failed');
    // A failed ExecutionTrace was recorded — the failure is measured, not swallowed.
    expect(app.traces.list(tenantId).some((tr) => tr.steps.some((s) => s.name === 'failed'))).toBe(true);

    // ── Engine recovers: the same action now succeeds, mission unchanged. ──
    ai.broken = false;
    await c.req('POST', `/missions/${missionId}/brief`);
    const briefHtml = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(briefHtml).toContain('Whitening'); // the brief generated on retry
    expect(await asT(async () => (await app.briefs.list(missionId)).length)).toBe(1);
  });
});
