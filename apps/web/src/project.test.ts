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

async function onboard(c: ReturnType<typeof client>, company: string) {
  const tenantId = slugifyTenant(company);
  const asT = <T>(fn: () => Promise<T>): Promise<T> =>
    TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);
  await c.req('POST', '/login', { email: 'o@x.com', company });
  await c.req('POST', '/workspaces', { name: 'WS', currency: 'TRY', timezone: 'UTC' });
  const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/clients', { workspaceId: wsId, name: 'Client', industry: 'dental', email: 'c@x.com' });
  const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/brands', { clientId, name: 'BrightBrand', voice: 'warm', values: 'care' });
  const brandId = await asT(async () => (await app.brands.list()).find((b) => b.tenantId === tenantId)!.id.toString());
  await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'x', pricingModel: 'free', currency: 'TRY' });
  return { tenantId, asT, wsId, clientId, brandId };
}

describe('Phase 7 — Project Management (UI to persistence)', () => {
  it('creates a project, manages status/goals/members, owns a mission, and archives', async () => {
    const c = client();
    const { tenantId, asT, wsId, clientId, brandId } = await onboard(c, 'Project Demo Co');

    // Create a project via its brand.
    let r = await c.req('POST', '/projects', { brandId, name: 'Spring Launch', description: 'Q2 growth' });
    expect(r.status).toBe(303);
    const projectId = r.headers.get('location')!.replace('/projects/', '');
    expect(projectId).toBeTruthy();

    // Dashboard renders the sections.
    let dash = await (await c.req('GET', `/projects/${projectId}`)).text();
    expect(dash).toContain('Spring Launch');
    expect(dash).toContain('Goals');
    expect(dash).toContain('Members');
    expect(dash).toContain('Timeline');
    expect(dash).toContain('Project created');

    // Goals + members + status.
    await c.req('POST', `/projects/${projectId}/goal`, { description: 'Book consultations', metric: 'leads', target: '500' });
    await c.req('POST', `/projects/${projectId}/member`, { name: 'Ada Lovelace', email: 'ada@acme.com', role: 'manager' });
    r = await c.req('POST', `/projects/${projectId}/status`, { status: 'paused' });
    expect(r.status).toBe(303);

    await asT(async () => {
      const p = (await app.projects.list()).find((x) => x.name === 'Spring Launch')!;
      expect(p.goals).toHaveLength(1);
      expect(p.goals[0]!.target).toBe(500);
      expect(p.members).toHaveLength(1);
      expect(p.status).toBe('paused');
      expect(p.clientId).toBe(clientId);
      expect(p.brandId).toBe(brandId);
    });

    dash = await (await c.req('GET', `/projects/${projectId}`)).text();
    expect(dash).toContain('Book consultations');
    expect(dash).toContain('ada@acme.com');
    expect(dash).toContain('paused');

    // A mission assigned to the project is owned by it.
    r = await c.req('POST', '/missions', {
      workspaceId: wsId,
      clientId,
      projectId,
      objective: 'Acquire new dental patients for the spring launch',
      budget: '80000',
      currency: 'TRY',
      period: 'monthly',
    });
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe(`/projects/${projectId}`); // routed back to the project

    await asT(async () => {
      const missions = (await app.missions.list()).filter((m) => m.projectId === projectId);
      expect(missions).toHaveLength(1);
      expect(missions[0]!.brief).toContain('spring launch');
    });

    dash = await (await c.req('GET', `/projects/${projectId}`)).text();
    expect(dash).toContain('Acquire new dental patients for the spring launch');
    expect(dash).toContain('Mission started');

    // Events for the project lifecycle fired.
    const events = app.recentEvents(tenantId, 60).map((e) => e.eventName);
    for (const expected of ['project.created.v1', 'project.goal_added.v1', 'project.member_added.v1', 'project.status_changed.v1']) {
      expect(events).toContain(expected);
    }

    // Projects nav list shows it.
    const list = await (await c.req('GET', '/projects')).text();
    expect(list).toContain('Spring Launch');

    // Archive removes it from the active list.
    r = await c.req('POST', `/projects/${projectId}/archive`);
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/projects');
    await asT(async () => {
      expect((await app.projects.list()).some((p) => p.name === 'Spring Launch')).toBe(false);
      expect((await app.projects.get((await appProjectId(projectId)))).unwrap().status).toBe('archived');
    });
  });

  it('rejects a project with no brand selected', async () => {
    const c = client();
    await onboard(c, 'Project Reject Co');
    const r = await c.req('POST', '/projects', { brandId: '', name: 'X' });
    expect(r.status).toBe(400);
    expect(await r.text()).toContain('class="err"');
  });

  it('isolates projects by tenant', async () => {
    const c1 = client();
    const { brandId } = await onboard(c1, 'Project Tenant A');
    await c1.req('POST', '/projects', { brandId, name: 'A Project', description: '' });

    const c2 = client();
    await onboard(c2, 'Project Tenant B');
    const list = await (await c2.req('GET', '/projects')).text();
    expect(list).toContain('No projects yet');
  });
});

// Helper to build a ProjectId for a direct get() assertion.
async function appProjectId(id: string) {
  const { ProjectId } = await import('@ados/agency-os');
  return ProjectId.of(id);
}
