import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { AssetId } from '@ados/agency-os';
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
  return { tenantId, asT, wsId, clientId };
}

describe('Phase 9 — Asset Library (UI to persistence)', () => {
  it('adds an asset, tags it, versions it, previews it and searches for it', async () => {
    const c = client();
    const { tenantId, asT, clientId } = await onboard(c, 'Asset Demo Co');

    // Add a copy asset with tags.
    let r = await c.req('POST', '/assets', {
      clientId,
      name: 'Spring headline',
      kind: 'copy',
      content: 'Whiten your smile this spring',
      tags: 'hero, spring',
    });
    expect(r.status).toBe(303);
    const id = r.headers.get('location')!.replace('/assets/', '');
    expect(id).toBeTruthy();

    // Detail previews the content (v1) and shows tags.
    let detail = await (await c.req('GET', `/assets/${id}`)).text();
    expect(detail).toContain('Spring headline');
    expect(detail).toContain('Whiten your smile this spring');
    expect(detail).toContain('v1');
    expect(detail).toContain('hero');
    expect(detail).toContain('spring');

    // Add a tag and a new version.
    await c.req('POST', `/assets/${id}/tag`, { tag: 'Evergreen' });
    r = await c.req('POST', `/assets/${id}/version`, { content: 'Brighten your smile this spring', note: 'stronger verb' });
    expect(r.status).toBe(303);

    detail = await (await c.req('GET', `/assets/${id}`)).text();
    expect(detail).toContain('v2');
    expect(detail).toContain('Brighten your smile this spring'); // current preview
    expect(detail).toContain('stronger verb');
    expect(detail).toContain('evergreen'); // tag normalized to lowercase

    // Persistence: version history retained, tags normalized + deduped.
    await asT(async () => {
      const a = (await app.assets.get(AssetId.of(id))).unwrap();
      expect(a.currentVersion).toBe(2);
      expect(a.currentContent).toBe('Brighten your smile this spring');
      expect(a.versions[0]!.content).toBe('Whiten your smile this spring');
      expect(a.tags).toEqual(['hero', 'spring', 'evergreen']);
      expect(a.clientId).toBe(clientId);
    });

    // A second asset, then search by name and by tag.
    await c.req('POST', '/assets', { clientId, name: 'Logo mark', kind: 'link', content: 'https://cdn/logo.svg', tags: 'brand' });

    let list = await (await c.req('GET', '/assets?q=headline')).text();
    expect(list).toContain('Spring headline');
    expect(list).not.toContain('Logo mark');

    list = await (await c.req('GET', '/assets?tag=brand')).text();
    expect(list).toContain('Logo mark');
    expect(list).not.toContain('Spring headline');

    list = await (await c.req('GET', '/assets?q=nothingmatches')).text();
    expect(list).toContain('No assets match your search');

    // Events fired for every change.
    const events = app.recentEvents(tenantId, 60).map((e) => e.eventName);
    for (const expected of ['asset.created.v1', 'asset.tag_added.v1', 'asset.version_added.v1']) {
      expect(events).toContain(expected);
    }
  });

  it('renders an image preview only for a safe URL', async () => {
    const c = client();
    const { clientId } = await onboard(c, 'Asset Image Co');
    const r = await c.req('POST', '/assets', { clientId, name: 'Banner', kind: 'image', content: 'https://cdn/banner.png', tags: '' });
    const id = r.headers.get('location')!.replace('/assets/', '');
    const detail = await (await c.req('GET', `/assets/${id}`)).text();
    expect(detail).toContain('<img src="https://cdn/banner.png"');
  });

  it('rejects an asset with no name or content', async () => {
    const c = client();
    const { clientId } = await onboard(c, 'Asset Validate Co');
    const r = await c.req('POST', '/assets', { clientId, name: '', kind: 'copy', content: 'x' });
    expect(r.status).toBe(400);
    expect(await r.text()).toContain('class="err"');
  });

  it('isolates assets by tenant', async () => {
    const c1 = client();
    const { clientId } = await onboard(c1, 'Asset Tenant A');
    await c1.req('POST', '/assets', { clientId, name: 'A-only asset', kind: 'copy', content: 'x' });

    const c2 = client();
    await onboard(c2, 'Asset Tenant B');
    const list = await (await c2.req('GET', '/assets')).text();
    expect(list).toContain('No assets yet');
  });
});
