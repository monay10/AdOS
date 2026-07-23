import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { App } from './app.js';
import { buildServer } from './server.js';
import { slugifyTenant } from './session.js';

const SECRET = 'test-secret';
const company = 'Bright Smiles Dental';
const tenantId = slugifyTenant(company);

let app: App;
let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  app = new App();
  await app.start();
  const { server } = buildServer({ sessionSecret: SECRET, app });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as AddressInfo).port;
  base = `http://localhost:${port}`;
  close = () => new Promise<void>((r) => server.close(() => r()));
});

afterAll(async () => {
  await close();
});

/** A cookie-aware HTTP client that does NOT auto-follow redirects. */
function client() {
  let cookie = '';
  return {
    get cookie() {
      return cookie;
    },
    async req(method: string, path: string, body?: Record<string, string>) {
      const headers: Record<string, string> = {};
      if (cookie) headers['cookie'] = cookie;
      let payload: string | undefined;
      if (body) {
        headers['content-type'] = 'application/x-www-form-urlencoded';
        payload = new URLSearchParams(body).toString();
      }
      const res = await fetch(`${base}${path}`, { method, headers, ...(payload ? { body: payload } : {}), redirect: 'manual' });
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) cookie = setCookie.split(';')[0]!;
      return res;
    },
  };
}

function runAs<T>(fn: () => Promise<T>): Promise<T> {
  const ctx: RequestContext = { tenantId, correlationId: 'test', actor: 'owner@bright.com', roles: [] };
  return TenantContext.run(ctx, fn);
}

describe('Phase 1 — Customer Onboarding (UI to persistence)', () => {
  it('rejects an unauthenticated visitor', async () => {
    const c = client();
    const r = await c.req('GET', '/dashboard');
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/login');
  });

  it('re-renders the workspace form with an error on invalid input', async () => {
    const c = client();
    await c.req('POST', '/login', { email: 'owner@bright.com', company });
    const r = await c.req('POST', '/workspaces', { name: '' });
    expect(r.status).toBe(400);
    const html = await r.text();
    expect(html).toContain('class="err"');
  });

  it('walks the whole flow: login → workspace → client → brand → product → mission', async () => {
    const c = client();

    // 1) Login
    let r = await c.req('POST', '/login', { email: 'owner@bright.com', company });
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/dashboard');
    expect(c.cookie).toContain('ados_session=');

    // 2) Workspace → routes onward to the client step
    r = await c.req('POST', '/workspaces', { name: 'Bright Workspace', currency: 'TRY', timezone: 'Europe/Istanbul' });
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/clients/new');
    const wsId = await runAs(async () => (await app.workspaces.list())[0]!.id.toString());

    // 3) Client
    r = await c.req('POST', '/clients', {
      workspaceId: wsId,
      name: 'Bright Smiles Dental',
      industry: 'healthcare',
      email: 'owner@brightsmiles.com',
    });
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/brands/new');
    const clientId = await runAs(async () => (await app.clients.list())[0]!.id.toString());

    // 4) Brand
    r = await c.req('POST', '/brands', {
      clientId,
      name: 'Bright Smiles',
      voice: 'warm and trustworthy',
      targetAudience: 'local families',
      values: 'care, expertise',
    });
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/products/new');

    // 5) Product
    r = await c.req('POST', '/products', {
      clientId,
      name: 'Whitening Treatment',
      description: 'Professional in-clinic teeth whitening',
      categories: 'dental, cosmetic',
      pricingModel: 'one_time',
      price: '129',
      currency: 'TRY',
    });
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/missions/new');

    // 6) Mission
    r = await c.req('POST', '/missions', {
      workspaceId: wsId,
      clientId,
      objective: 'Acquire new patients for a dental clinic opening next month',
      budget: '80000',
      currency: 'TRY',
      period: 'monthly',
      metricName: 'leads',
      metricTarget: '120',
      metricUnit: 'count',
    });
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/dashboard');

    // ── Persistence: every entity was saved, tenant-scoped ──
    await runAs(async () => {
      expect(await app.workspaces.list()).toHaveLength(1);
      expect(await app.clients.list()).toHaveLength(1);
      expect(await app.brands.list()).toHaveLength(1);
      expect(await app.products.list()).toHaveLength(1);
      const missions = await app.missions.list();
      expect(missions).toHaveLength(1);
      expect(missions[0]!.brief).toContain('dental clinic');
      expect(missions[0]!.status).toBe('submitted');
    });

    // ── Events: the whole chain fired ──
    const events = app.recentEvents(tenantId, 20).map((e) => e.eventName);
    for (const expected of [
      'workspace.created.v1',
      'client.created.v1',
      'brand.created.v1',
      'product.created.v1',
      'mission.submitted.v1',
    ]) {
      expect(events).toContain(expected);
    }

    // ── Result on screen: dashboard shows completion + the event ──
    const dash = await (await c.req('GET', '/dashboard')).text();
    expect(dash).toContain('Onboarding complete');
    expect(dash).toContain('mission.submitted.v1');
  });

  it('isolates a different tenant — no cross-tenant data bleed', async () => {
    const other = client();
    await other.req('POST', '/login', { email: 'someone@acme.com', company: 'Acme Co' });
    const html = await (await other.req('GET', '/clients')).text();
    expect(html).toContain('No clients yet');
  });
});
