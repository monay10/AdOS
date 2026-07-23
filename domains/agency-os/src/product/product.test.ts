import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { Product, ProductId } from './product.js';
import { InMemoryProductRepository } from './repository.js';
import { ProductService } from './service.js';

// ── Unit tests: domain model ──────────────────────────────────────────────────
describe('Product (domain)', () => {
  it('creates a product with defaults, deduped categories and a creation event', () => {
    const r = Product.create({
      tenantId: 'acme',
      clientId: 'c1',
      name: '  Whitening Kit  ',
      categories: ['dental', 'dental', ' care '],
    });
    expect(r.isOk).toBe(true);
    if (r.isOk) {
      expect(r.value.name).toBe('Whitening Kit');
      expect(r.value.categories).toEqual(['dental', 'care']);
      expect(r.value.pricing.model).toBe('free');
      expect(r.value.features).toEqual([]);
      expect(r.value.pullDomainEvents()[0]!.eventName).toBe('product.created.v1');
    }
  });

  it('rejects missing fields and invalid subscription pricing', () => {
    expect(Product.create({ tenantId: '', clientId: 'c1', name: 'x' }).isErr).toBe(true);
    expect(Product.create({ tenantId: 'acme', clientId: '', name: 'x' }).isErr).toBe(true);
    expect(Product.create({ tenantId: 'acme', clientId: 'c1', name: '' }).isErr).toBe(true);
    const bad = Product.create({
      tenantId: 'acme',
      clientId: 'c1',
      name: 'Plan',
      pricing: { model: 'subscription', amount: { amountMinor: 999, currency: 'USD' } },
    });
    expect(bad.isErr).toBe(true); // subscription needs a period
  });

  it('adds features and changes pricing, emitting events', () => {
    const p = Product.create({ tenantId: 'acme', clientId: 'c1', name: 'Kit' }).unwrap();
    p.pullDomainEvents();
    expect(p.addFeature({ name: 'Fast', description: 'Works in 7 days' }).isOk).toBe(true);
    expect(p.addFeature({ name: '', description: 'x' }).isErr).toBe(true);
    expect(
      p.changePricing({ model: 'subscription', amount: { amountMinor: 4999, currency: 'TRY' }, period: 'monthly' }).isOk,
    ).toBe(true);
    expect(p.features).toHaveLength(1);
    expect(p.pricing.model).toBe('subscription');
    expect(p.pricing.amount.currency).toBe('TRY');
    expect(p.pullDomainEvents().map((e) => e.eventName)).toEqual([
      'product.feature_added.v1',
      'product.pricing_changed.v1',
    ]);
  });

  it('refuses mutation after archiving', () => {
    const p = Product.create({ tenantId: 'acme', clientId: 'c1', name: 'Kit' }).unwrap();
    p.archive();
    expect(p.status).toBe('archived');
    expect(() => p.addFeature({ name: 'x', description: 'y' })).toThrow();
  });
});

// ── Integration tests: service + repository + event bus ───────────────────────
describe('ProductService (integration)', () => {
  const ctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

  function wire() {
    const bus = new InMemoryEventBus();
    const repo = new InMemoryProductRepository();
    const service = new ProductService(repo, bus);
    return { bus, repo, service };
  }

  it('creates, enriches, lists, and archives a product end to end', async () => {
    await TenantContext.run(ctx, async () => {
      const { bus, service } = wire();
      const seen: string[] = [];
      await bus.subscribe('product.>', async (e) => { seen.push(e.eventName); });

      const created = await service.create({ tenantId: 'acme', clientId: 'c1', name: 'Kit', categories: ['dental'] });
      const id = created.unwrap().id;

      await service.update(id, { description: 'Pro whitening' });
      await service.addFeature(id, { name: 'Fast', description: '7 days' });
      await service.changePricing(id, { model: 'one_time', amount: { amountMinor: 12900, currency: 'TRY' } });

      const got = (await service.get(id)).unwrap();
      expect(got.description).toBe('Pro whitening');
      expect(got.features).toHaveLength(1);
      expect(got.pricing.amount.amountMinor).toBe(12900);

      expect(await service.list('c1')).toHaveLength(1);
      await service.archive(id);
      expect(await service.list('c1')).toHaveLength(0);

      expect(seen).toEqual([
        'product.created.v1',
        'product.updated.v1',
        'product.feature_added.v1',
        'product.pricing_changed.v1',
        'product.archived.v1',
      ]);
    });
  });

  it('scopes products by client and isolates tenants', async () => {
    const { service } = wire();
    await TenantContext.run(ctx, async () => {
      await service.create({ tenantId: 'acme', clientId: 'c1', name: 'A' });
      await service.create({ tenantId: 'acme', clientId: 'c2', name: 'B' });
      expect((await service.list('c1')).map((p) => p.name)).toEqual(['A']);
      expect(await service.list()).toHaveLength(2);
    });
    await TenantContext.run({ ...ctx, tenantId: 'other' }, async () => {
      expect(await service.list()).toHaveLength(0);
    });
  });

  it('returns NotFound for a missing product', async () => {
    await TenantContext.run(ctx, async () => {
      const { service } = wire();
      expect((await service.get(ProductId.of('missing'))).isErr).toBe(true);
    });
  });
});
