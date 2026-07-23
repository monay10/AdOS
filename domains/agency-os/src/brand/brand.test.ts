import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { Brand, BrandId } from './brand.js';
import { InMemoryBrandRepository } from './repository.js';
import { BrandService } from './service.js';

// ── Unit tests: domain model ──────────────────────────────────────────────────
describe('Brand (domain)', () => {
  it('creates a brand with sane defaults and a creation event', () => {
    const r = Brand.create({ tenantId: 'acme', clientId: 'c1', name: '  Nova  ' });
    expect(r.isOk).toBe(true);
    if (r.isOk) {
      expect(r.value.name).toBe('Nova');
      expect(r.value.profile.voice).toBe('professional');
      expect(r.value.identity.primaryColor).toBe('#000000');
      expect(r.value.rules.bannedWords).toEqual([]);
      expect(r.value.assets).toEqual([]);
      expect(r.value.pullDomainEvents()[0]!.eventName).toBe('brand.created.v1');
    }
  });

  it('rejects missing tenant, client or name', () => {
    expect(Brand.create({ tenantId: '', clientId: 'c1', name: 'x' }).isErr).toBe(true);
    expect(Brand.create({ tenantId: 'acme', clientId: '', name: 'x' }).isErr).toBe(true);
    expect(Brand.create({ tenantId: 'acme', clientId: 'c1', name: '' }).isErr).toBe(true);
  });

  it('updates profile, identity and rules, emitting one event each', () => {
    const b = Brand.create({ tenantId: 'acme', clientId: 'c1', name: 'Nova' }).unwrap();
    b.pullDomainEvents();
    b.updateProfile({ voice: 'bold', values: ['trust'] });
    b.updateIdentity({ primaryColor: '#ff0000' });
    b.updateRules({ bannedWords: ['cheap'] });
    expect(b.profile.voice).toBe('bold');
    expect(b.identity.primaryColor).toBe('#ff0000');
    expect(b.rules.bannedWords).toEqual(['cheap']);
    expect(b.pullDomainEvents().map((e) => e.eventName)).toEqual([
      'brand.profile_updated.v1',
      'brand.identity_updated.v1',
      'brand.rules_updated.v1',
    ]);
  });

  it('adds an asset and rejects an empty asset', () => {
    const b = Brand.create({ tenantId: 'acme', clientId: 'c1', name: 'Nova' }).unwrap();
    b.pullDomainEvents();
    const ok = b.addAsset({ kind: 'logo', name: 'Logo', url: 'minio://logo.png' });
    expect(ok.isOk).toBe(true);
    expect(b.assets).toHaveLength(1);
    expect(b.addAsset({ kind: 'logo', name: '', url: '' }).isErr).toBe(true);
    expect(b.pullDomainEvents().map((e) => e.eventName)).toEqual(['brand.asset_added.v1']);
  });

  it('refuses mutation after archiving', () => {
    const b = Brand.create({ tenantId: 'acme', clientId: 'c1', name: 'Nova' }).unwrap();
    b.archive();
    expect(b.status).toBe('archived');
    expect(() => b.updateProfile({ voice: 'x' })).toThrow();
  });
});

// ── Integration tests: service + repository + event bus ───────────────────────
describe('BrandService (integration)', () => {
  const ctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

  function wire() {
    const bus = new InMemoryEventBus();
    const repo = new InMemoryBrandRepository();
    const service = new BrandService(repo, bus);
    return { bus, repo, service };
  }

  it('creates, enriches, lists, and archives a brand end to end', async () => {
    await TenantContext.run(ctx, async () => {
      const { bus, service } = wire();
      const seen: string[] = [];
      await bus.subscribe('brand.>', async (e) => { seen.push(e.eventName); });

      const created = await service.create({ tenantId: 'acme', clientId: 'c1', name: 'Nova' });
      const id = created.unwrap().id;

      await service.updateProfile(id, { targetAudience: 'young professionals' });
      await service.updateIdentity(id, { primaryColor: '#123456' });
      await service.updateRules(id, { dos: ['be warm'] });
      await service.addAsset(id, { kind: 'logo', name: 'Logo', url: 'minio://logo.png' });

      const got = (await service.get(id)).unwrap();
      expect(got.profile.targetAudience).toBe('young professionals');
      expect(got.identity.primaryColor).toBe('#123456');
      expect(got.rules.dos).toEqual(['be warm']);
      expect(got.assets).toHaveLength(1);

      expect(await service.list('c1')).toHaveLength(1);
      await service.archive(id);
      expect(await service.list('c1')).toHaveLength(0);

      expect(seen).toEqual([
        'brand.created.v1',
        'brand.profile_updated.v1',
        'brand.identity_updated.v1',
        'brand.rules_updated.v1',
        'brand.asset_added.v1',
        'brand.archived.v1',
      ]);
    });
  });

  it('scopes brands by client and isolates tenants', async () => {
    const { service } = wire();
    await TenantContext.run(ctx, async () => {
      await service.create({ tenantId: 'acme', clientId: 'c1', name: 'A' });
      await service.create({ tenantId: 'acme', clientId: 'c2', name: 'B' });
      expect((await service.list('c1')).map((b) => b.name)).toEqual(['A']);
      expect(await service.list()).toHaveLength(2);
    });
    await TenantContext.run({ ...ctx, tenantId: 'other' }, async () => {
      expect(await service.list()).toHaveLength(0);
    });
  });

  it('returns NotFound for a missing brand', async () => {
    await TenantContext.run(ctx, async () => {
      const { service } = wire();
      expect((await service.get(BrandId.of('missing'))).isErr).toBe(true);
    });
  });
});
