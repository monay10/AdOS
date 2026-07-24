import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { WorkspaceId } from '@ados/agency-os';
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
  await c.req('POST', '/workspaces', { name: 'Original WS', currency: 'TRY', timezone: 'UTC' });
  const wsId = await asT(async () => (await app.workspaces.list()).find((w) => w.tenantId === tenantId)!.id.toString());
  return { tenantId, asT, wsId };
}

describe('Phase 11 — Settings (UI to persistence)', () => {
  it('shows current settings and persists an update', async () => {
    const c = client();
    const { tenantId, asT, wsId } = await onboard(c, 'Settings Demo Co');

    // Settings screen shows the current workspace values.
    let page = await (await c.req('GET', '/settings')).text();
    expect(page).toContain('Original WS');
    expect(page).toContain('value="TRY"');
    expect(page).toContain('Tenant: settings-demo-co');

    // Update name + currency + timezone + locale.
    let r = await c.req('POST', '/settings', {
      workspaceId: wsId,
      name: 'Renamed WS',
      currency: 'EUR',
      timezone: 'Europe/Istanbul',
      locale: 'tr',
    });
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe(`/settings?workspaceId=${encodeURIComponent(wsId)}&saved=1`);

    // Result on screen: saved banner + new values.
    page = await (await c.req('GET', `/settings?workspaceId=${wsId}&saved=1`)).text();
    expect(page).toContain('Settings saved');
    expect(page).toContain('Renamed WS');
    expect(page).toContain('value="EUR"');
    expect(page).toContain('value="Europe/Istanbul"');
    expect(page).toContain('value="tr"');

    // Persistence: the workspace aggregate holds the new values.
    await asT(async () => {
      const ws = (await app.workspaces.get(WorkspaceId.of(wsId))).unwrap();
      expect(ws.name).toBe('Renamed WS');
      expect(ws.settings.currency).toBe('EUR');
      expect(ws.settings.timezone).toBe('Europe/Istanbul');
      expect(ws.settings.locale).toBe('tr');
    });

    // Events: rename + settings change both fired.
    const events = app.recentEvents(tenantId, 40).map((e) => e.eventName);
    expect(events).toContain('workspace.settings_changed.v1');
    expect(events).toContain('workspace.updated.v1');
  });

  it('changes only settings (no rename) without a rename event', async () => {
    const c = client();
    const { tenantId, asT, wsId } = await onboard(c, 'Settings NoRename Co');
    const r = await c.req('POST', '/settings', { workspaceId: wsId, name: 'Original WS', currency: 'USD', timezone: 'UTC', locale: 'en' });
    expect(r.status).toBe(303);
    await asT(async () => {
      const ws = (await app.workspaces.get(WorkspaceId.of(wsId))).unwrap();
      expect(ws.settings.currency).toBe('USD');
      expect(ws.name).toBe('Original WS');
    });
    const events = app.recentEvents(tenantId, 40).map((e) => e.eventName);
    expect(events).toContain('workspace.settings_changed.v1');
    expect(events).not.toContain('workspace.updated.v1'); // name unchanged → no rename
  });

  it('rejects blank required fields', async () => {
    const c = client();
    const { wsId } = await onboard(c, 'Settings Validate Co');
    const r = await c.req('POST', '/settings', { workspaceId: wsId, name: 'X', currency: '', timezone: 'UTC', locale: 'en' });
    expect(r.status).toBe(400);
    expect(await r.text()).toContain('class="err"');
  });

  it('isolates settings by tenant', async () => {
    const c1 = client();
    const { wsId: ws1 } = await onboard(c1, 'Settings Tenant A');
    await c1.req('POST', '/settings', { workspaceId: ws1, name: 'A Workspace', currency: 'GBP', timezone: 'UTC', locale: 'en' });

    const c2 = client();
    await onboard(c2, 'Settings Tenant B');
    const page = await (await c2.req('GET', '/settings')).text();
    expect(page).toContain('Original WS'); // B's own workspace
    expect(page).not.toContain('A Workspace'); // not A's
    expect(page).not.toContain('value="GBP"');
  });
});
