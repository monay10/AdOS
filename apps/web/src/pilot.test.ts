import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { App } from './app.js';
import { buildServer } from './server.js';
import { slugifyTenant } from './session.js';

/**
 * Phase 12 — First Live Pilot.
 *
 * The whole product in one customer session, driven through the real HTTP server
 * exactly as a person would click it: onboarding → project → mission → brief →
 * creative → campaign → analytics → CEO dashboard → learning, plus the asset
 * library, an approval and settings. Proves the end-to-end journey works from UI
 * to persistence, produces the full event chain, and stays tenant-isolated.
 */

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

describe('Phase 12 — First Live Pilot (whole product, one session)', () => {
  it('runs a real customer from sign-in to a compounding, learned company', async () => {
    const company = 'Pilot Dental Group';
    const tenantId = slugifyTenant(company);
    const c = client();
    const asT = <T>(fn: () => Promise<T>): Promise<T> =>
      TenantContext.run({ tenantId, correlationId: 'pilot', actor: 'owner@pilot.com', roles: [] } as RequestContext, fn);
    const ok303 = (r: Response): void => expect(r.status).toBe(303);

    // ── 1. Onboarding: login → workspace → client → brand → product ──
    ok303(await c.req('POST', '/login', { email: 'owner@pilot.com', company }));
    ok303(await c.req('POST', '/workspaces', { name: 'Pilot Workspace', currency: 'TRY', timezone: 'Europe/Istanbul' }));
    const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
    ok303(await c.req('POST', '/clients', { workspaceId: wsId, name: 'Pilot Dental', industry: 'healthcare', email: 'owner@pilot.com' }));
    const clientId = await asT(async () => (await app.clients.list()).find((cl) => cl.tenantId === tenantId)!.id.toString());
    ok303(await c.req('POST', '/brands', { clientId, name: 'Pilot Smiles', voice: 'warm and trustworthy', values: 'care, expertise' }));
    const brandId = await asT(async () => (await app.brands.list()).find((b) => b.tenantId === tenantId)!.id.toString());
    ok303(await c.req('POST', '/products', { clientId, name: 'Whitening', description: 'In-clinic whitening', pricingModel: 'one_time', price: '129', currency: 'TRY' }));

    // ── 2. Project (owns the work) ──
    let r = await c.req('POST', '/projects', { brandId, name: 'Q3 Growth', description: 'Acquire new patients in Q3' });
    ok303(r);
    const projectId = r.headers.get('location')!.replace('/projects/', '');

    // ── 3. Mission assigned to the project → routes back to the project ──
    r = await c.req('POST', '/missions', {
      workspaceId: wsId, clientId, projectId,
      objective: 'Acquire new patients for the Q3 whitening push',
      budget: '80000', currency: 'TRY', period: 'monthly', metricName: 'leads', metricTarget: '120', metricUnit: 'count',
    });
    ok303(r);
    expect(r.headers.get('location')).toBe(`/projects/${projectId}`);
    const missionId = await asT(async () => (await app.missions.list()).find((m) => m.projectId === projectId)!.id.toString());

    // ── 4. The AI pipeline: brief → approve → creative → approve → campaign → approve → analytics ──
    ok303(await c.req('POST', `/missions/${missionId}/brief`));
    ok303(await c.req('POST', `/missions/${missionId}/approve`, { acknowledge: 'governance' }));
    ok303(await c.req('POST', `/missions/${missionId}/creative`));
    ok303(await c.req('POST', `/missions/${missionId}/creative/approve`, { acknowledge: 'governance' }));
    ok303(await c.req('POST', `/missions/${missionId}/campaign`));
    ok303(await c.req('POST', `/missions/${missionId}/campaign/approve`, { acknowledge: 'governance' }));
    ok303(await c.req('POST', `/missions/${missionId}/analytics`, {
      impressions: '100000', clicks: '2000', conversions: '100', leads: '130', spend: '1000', revenue: '3000', currency: 'TRY',
    }));

    // ── 5. CEO Dashboard (executive synthesis) ──
    ok303(await c.req('POST', `/missions/${missionId}/executive`));

    // ── 6. Record learning to the Company Brain → mission completes ──
    ok303(await c.req('POST', `/missions/${missionId}/learn`));

    // The mission screen now shows the executive verdict AND the recorded learning.
    const missionPage = await (await c.req('GET', `/missions/${missionId}`)).text();
    expect(missionPage).toContain('CEO Dashboard');
    expect(missionPage).toContain('exceeded'); // roas 3 → exceeded
    expect(missionPage).toContain('Company Brain — Learning');
    expect(missionPage).toContain('recorded');
    expect(missionPage).toContain('completed');

    // ── 7. Asset library: add → tag → version ──
    r = await c.req('POST', '/assets', { clientId, name: 'Q3 hero headline', kind: 'copy', content: 'Brighten your smile this season', tags: 'hero, q3' });
    ok303(r);
    const assetId = r.headers.get('location')!.replace('/assets/', '');
    ok303(await c.req('POST', `/assets/${assetId}/tag`, { tag: 'evergreen' }));
    ok303(await c.req('POST', `/assets/${assetId}/version`, { content: 'Brighten your smile this Q3', note: 'seasonal tweak' }));

    // ── 8. Approval workflow: create → submit → approve ──
    r = await c.req('POST', '/approvals', { title: 'Q3 budget sign-off', description: 'Approve the 80k spend', projectId });
    ok303(r);
    const approvalId = r.headers.get('location')!.replace('/approvals/', '');
    ok303(await c.req('POST', `/approvals/${approvalId}/submit`));
    ok303(await c.req('POST', `/approvals/${approvalId}/approve`, { note: 'approved for launch' }));

    // ── 9. Settings: change the workspace currency ──
    ok303(await c.req('POST', '/settings', { workspaceId: wsId, name: 'Pilot Workspace', currency: 'EUR', timezone: 'Europe/Istanbul', locale: 'tr' }));

    // ── Persistence: every context holds the pilot's data ──
    await asT(async () => {
      expect((await app.workspaces.list())[0]!.settings.currency).toBe('EUR');
      expect(await app.clients.list()).toHaveLength(1);
      expect(await app.brands.list()).toHaveLength(1);
      expect(await app.products.list()).toHaveLength(1);
      expect(await app.projects.list()).toHaveLength(1);

      const mission = (await app.missions.list()).find((m) => m.id.toString() === missionId)!;
      expect(mission.status).toBe('completed');
      expect(mission.projectId).toBe(projectId);

      expect(await app.briefs.list(missionId)).toHaveLength(1);
      expect(await app.creative.list(missionId)).toHaveLength(1);
      expect(await app.campaigns.list(missionId)).toHaveLength(1);
      expect(await app.reports.list(missionId)).toHaveLength(1);

      const execReports = await app.executive.list(missionId);
      expect(execReports).toHaveLength(1);
      expect(execReports[0]!.verdict).toBe('exceeded');

      const journal = await app.journal.history({ subjectId: missionId, k: 5 });
      expect(journal.length).toBeGreaterThan(0);

      const assets = await app.assets.list();
      expect(assets).toHaveLength(1);
      expect(assets[0]!.currentVersion).toBe(2);
      expect(assets[0]!.tags).toEqual(['hero', 'q3', 'evergreen']);

      const approvals = await app.approvals.list();
      expect(approvals).toHaveLength(1);
      expect(approvals[0]!.status).toBe('approved');
    });

    // ── Events: the whole chain fired on the bus ──
    const events = app.recentEvents(tenantId, 200).map((e) => e.eventName);
    for (const expected of [
      'workspace.created.v1', 'client.created.v1', 'brand.created.v1', 'product.created.v1',
      'project.created.v1', 'mission.submitted.v1',
      'intel.brief.generated.v1', 'creative.generated.v1', 'campaign.created.v1', 'analytics.report.generated.v1',
      'exec.dashboard.generated.v1',
      'asset.created.v1', 'asset.tag_added.v1', 'asset.version_added.v1',
      'approval.created.v1', 'approval.submitted.v1', 'approval.approved.v1',
      'workspace.settings_changed.v1',
    ]) {
      expect(events, `missing event ${expected}`).toContain(expected);
    }

    // ── Result on screen: the project dashboard tells the whole story ──
    const projectPage = await (await c.req('GET', `/projects/${projectId}`)).text();
    expect(projectPage).toContain('Acquire new patients for the Q3 whitening push');
    expect(projectPage).toContain('Marketing brief generated');
    expect(projectPage).toContain('Campaign drafted');
    expect(projectPage).toContain('Analytics report generated');
    expect(projectPage).toContain('Learning recorded · mission completed');

    // ── Result on screen: the dashboard shows the whole company at a glance ──
    const dash = await (await c.req('GET', '/dashboard')).text();
    expect(dash).toContain('Brain Learnings');
    expect(dash).toContain('CEO Dashboards');
    expect(dash).toContain('Approvals');
    expect(dash).toContain('Assets');

    // ── Tenant isolation: a brand-new company sees a clean slate ──
    const other = client();
    await other.req('POST', '/login', { email: 'someone@other.com', company: 'Other Co' });
    expect(await (await other.req('GET', '/clients')).text()).toContain('No clients yet');
    expect(await (await other.req('GET', '/assets')).text()).toContain('No assets yet');
    expect(await (await other.req('GET', '/approvals')).text()).toContain('No approvals yet');
    expect(await (await other.req('GET', '/executive')).text()).toContain('No CEO Dashboards yet');
  });
});
