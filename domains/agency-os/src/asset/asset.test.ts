import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { Asset, AssetId } from './asset.js';
import { InMemoryAssetRepository } from './repository.js';
import { AssetService } from './service.js';

const AT = '2026-07-24T10:00:00.000Z';

// ── Unit tests: domain model ──────────────────────────────────────────────────
describe('Asset (domain)', () => {
  it('creates an asset with a first version and a creation event', () => {
    const r = Asset.create({
      tenantId: 'acme',
      clientId: 'c1',
      name: '  Hero banner  ',
      kind: 'image',
      content: 'https://cdn/hero.png',
      tags: ['Hero', 'hero', 'Q2'],
      by: 'u',
      at: AT,
    });
    expect(r.isOk).toBe(true);
    if (r.isOk) {
      const a = r.value;
      expect(a.name).toBe('Hero banner');
      expect(a.kind).toBe('image');
      expect(a.currentVersion).toBe(1);
      expect(a.currentContent).toBe('https://cdn/hero.png');
      expect(a.tags).toEqual(['hero', 'q2']); // normalized + deduped
      expect(a.pullDomainEvents()[0]!.eventName).toBe('asset.created.v1');
    }
  });

  it('rejects missing tenant, client, name, content or an invalid kind', () => {
    const base = { tenantId: 'acme', clientId: 'c1', name: 'n', content: 'x', by: 'u', at: AT } as const;
    expect(Asset.create({ ...base, tenantId: '', kind: 'image' }).isErr).toBe(true);
    expect(Asset.create({ ...base, clientId: '', kind: 'image' }).isErr).toBe(true);
    expect(Asset.create({ ...base, name: '', kind: 'image' }).isErr).toBe(true);
    expect(Asset.create({ ...base, content: '', kind: 'image' }).isErr).toBe(true);
    expect(Asset.create({ ...base, kind: 'gif' as never }).isErr).toBe(true);
  });

  it('adds versions keeping history, and dedupes tags', () => {
    const a = Asset.create({ tenantId: 'acme', clientId: 'c1', name: 'Copy', kind: 'copy', content: 'v1 text', by: 'u', at: AT }).unwrap();
    a.pullDomainEvents();

    expect(a.addVersion({ content: 'v2 text', note: 'tighter', by: 'u', at: AT }).isOk).toBe(true);
    expect(a.currentVersion).toBe(2);
    expect(a.currentContent).toBe('v2 text');
    expect(a.versions[0]!.content).toBe('v1 text'); // history retained

    expect(a.addTag('Launch').isOk).toBe(true);
    expect(a.addTag('launch').isOk).toBe(true); // duplicate → no-op
    expect(a.tags).toEqual(['launch']);
    expect(a.addVersion({ content: '', by: 'u', at: AT }).isErr).toBe(true); // empty content

    expect(a.pullDomainEvents().map((e) => e.eventName)).toEqual([
      'asset.version_added.v1',
      'asset.tag_added.v1',
    ]);
  });
});

// ── Integration tests: service + repository + event bus ───────────────────────
describe('AssetService (integration)', () => {
  const ctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

  function wire() {
    const bus = new InMemoryEventBus();
    const repo = new InMemoryAssetRepository();
    const service = new AssetService(repo, bus);
    return { bus, repo, service };
  }

  it('creates, versions, tags, filters and lists an asset end to end', async () => {
    await TenantContext.run(ctx, async () => {
      const { bus, service } = wire();
      const seen: string[] = [];
      await bus.subscribe('asset.>', async (e) => { seen.push(e.eventName); });

      const created = await service.create({
        tenantId: 'acme', clientId: 'c1', brandId: 'b1', projectId: 'p1',
        name: 'Hero', kind: 'image', content: 'https://cdn/1.png', by: 'u', at: AT,
      });
      const id = created.unwrap().id;

      await service.addVersion(id, { content: 'https://cdn/2.png', note: 'retouched', by: 'u', at: AT });
      await service.addTag(id, 'spring');

      const got = (await service.get(id)).unwrap();
      expect(got.currentVersion).toBe(2);
      expect(got.tags).toEqual(['spring']);
      expect(got.projectId).toBe('p1');

      expect(await service.list({ clientId: 'c1' })).toHaveLength(1);
      expect(await service.list({ projectId: 'p1' })).toHaveLength(1);
      expect(await service.list({ projectId: 'other' })).toHaveLength(0);
      expect(seen).toEqual(['asset.created.v1', 'asset.version_added.v1', 'asset.tag_added.v1']);
    });
  });

  it('isolates assets by tenant', async () => {
    const { service } = wire();
    await TenantContext.run(ctx, async () => {
      await service.create({ tenantId: 'acme', clientId: 'c1', name: 'A', kind: 'copy', content: 'x', by: 'u', at: AT });
      expect(await service.list()).toHaveLength(1);
    });
    await TenantContext.run({ ...ctx, tenantId: 'other' }, async () => {
      expect(await service.list()).toHaveLength(0);
    });
  });

  it('returns NotFound for a missing asset', async () => {
    await TenantContext.run(ctx, async () => {
      const { service } = wire();
      expect((await service.get(AssetId.of('missing'))).isErr).toBe(true);
    });
  });
});
