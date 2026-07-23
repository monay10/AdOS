import { describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from './tenant-context.js';

const ctx = (tenantId: string): RequestContext => ({
  tenantId,
  correlationId: `corr-${tenantId}`,
  actor: 'user',
  roles: ['owner'],
});

describe('TenantContext (tenant isolation core)', () => {
  it('has no ambient context outside a run scope', () => {
    expect(TenantContext.current()).toBeUndefined();
    expect(() => TenantContext.require()).toThrow(/No tenant context/);
  });

  it('binds a context for the whole synchronous + async lifetime', async () => {
    const value = await TenantContext.run(ctx('acme'), async () => {
      expect(TenantContext.current()?.tenantId).toBe('acme');
      expect(TenantContext.tenantId()).toBe('acme');
      await Promise.resolve();
      // survives an await boundary
      return TenantContext.require().tenantId;
    });
    expect(value).toBe('acme');
    // and is torn down afterwards
    expect(TenantContext.current()).toBeUndefined();
  });

  it('isolates concurrent tenants — no cross-tenant bleed', async () => {
    const seen: string[] = [];
    await Promise.all([
      TenantContext.run(ctx('t1'), async () => {
        await new Promise((r) => setTimeout(r, 5));
        seen.push(TenantContext.tenantId());
      }),
      TenantContext.run(ctx('t2'), async () => {
        seen.push(TenantContext.tenantId());
      }),
    ]);
    expect(seen.sort()).toEqual(['t1', 't2']);
  });

  it('nests child scopes without leaking back to the parent', () => {
    TenantContext.run(ctx('parent'), () => {
      TenantContext.run(ctx('child'), () => {
        expect(TenantContext.tenantId()).toBe('child');
      });
      expect(TenantContext.tenantId()).toBe('parent');
    });
  });

  it('forks a child context preserving correlation but overriding tenant', () => {
    TenantContext.run(ctx('acme'), () => {
      const forked = TenantContext.fork({ tenantId: 'acme-sub', actor: 'agent-7' });
      expect(forked.tenantId).toBe('acme-sub');
      expect(forked.correlationId).toBe('corr-acme'); // preserved
      expect(forked.actor).toBe('agent-7');
    });
  });

  it('forks a safe default context at bootstrap (no ambient scope)', () => {
    const forked = TenantContext.fork({});
    expect(forked.tenantId).toBe('public');
    expect(forked.correlationId).toBeTruthy();
    expect(forked.roles).toEqual([]);
  });
});
