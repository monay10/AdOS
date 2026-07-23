import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { Workspace, WorkspaceId } from './workspace.js';
import { InMemoryWorkspaceRepository } from './repository.js';
import { WorkspaceService } from './service.js';

// ── Unit tests: domain model ──────────────────────────────────────────────────
describe('Workspace (domain)', () => {
  it('creates a valid workspace with defaults and a creation event', () => {
    const r = Workspace.create({ tenantId: 'acme', name: '  Acme Marketing  ' });
    expect(r.isOk).toBe(true);
    if (r.isOk) {
      expect(r.value.name).toBe('Acme Marketing');
      expect(r.value.settings).toEqual({ locale: 'en', timezone: 'UTC', currency: 'USD' });
      expect(r.value.status).toBe('active');
      const events = r.value.pullDomainEvents();
      expect(events[0]!.eventName).toBe('workspace.created.v1');
    }
  });

  it('rejects an empty name or tenant', () => {
    expect(Workspace.create({ tenantId: 'acme', name: '' }).isErr).toBe(true);
    expect(Workspace.create({ tenantId: '', name: 'x' }).isErr).toBe(true);
  });

  it('renames, updates settings and configures, emitting events', () => {
    const w = Workspace.create({ tenantId: 'acme', name: 'Old' }).unwrap();
    w.pullDomainEvents();
    w.rename('New');
    w.updateSettings({ currency: 'TRY' });
    w.configure({ betaCreative: true });
    expect(w.name).toBe('New');
    expect(w.settings.currency).toBe('TRY');
    expect(w.configuration.features['betaCreative']).toBe(true);
    expect(w.pullDomainEvents().map((e) => e.eventName)).toEqual([
      'workspace.updated.v1',
      'workspace.settings_changed.v1',
      'workspace.updated.v1',
    ]);
  });

  it('refuses mutation after deletion', () => {
    const w = Workspace.create({ tenantId: 'acme', name: 'X' }).unwrap();
    w.markDeleted();
    expect(w.status).toBe('deleted');
    expect(() => w.updateSettings({ locale: 'tr' })).toThrow();
  });
});

// ── Integration tests: service + repository + event bus ───────────────────────
describe('WorkspaceService (integration)', () => {
  const ctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

  function wire() {
    const bus = new InMemoryEventBus();
    const published: string[] = [];
    const repo = new InMemoryWorkspaceRepository();
    const service = new WorkspaceService(repo, bus);
    return { bus, published, repo, service };
  }

  it('creates, lists, renames, and soft-deletes a workspace end to end', async () => {
    await TenantContext.run(ctx, async () => {
      const { bus, service } = wire();
      const seen: string[] = [];
      await bus.subscribe('workspace.>', async (e) => { seen.push(e.eventName); });

      const created = await service.create({ tenantId: 'acme', name: 'Acme' });
      expect(created.isOk).toBe(true);
      const id = created.unwrap().id;

      expect((await service.list())).toHaveLength(1);

      const renamed = await service.rename(id, 'Acme Global');
      expect(renamed.unwrap().name).toBe('Acme Global');

      await service.updateSettings(id, { currency: 'TRY' });
      expect((await service.get(id)).unwrap().settings.currency).toBe('TRY');

      const del = await service.delete(id);
      expect(del.isOk).toBe(true);
      expect((await service.list())).toHaveLength(0); // soft-deleted, excluded from list

      expect(seen).toEqual([
        'workspace.created.v1',
        'workspace.updated.v1',
        'workspace.settings_changed.v1',
        'workspace.deleted.v1',
      ]);
    });
  });

  it('isolates workspaces by tenant', async () => {
    const bus = new InMemoryEventBus();
    const repo = new InMemoryWorkspaceRepository();
    const service = new WorkspaceService(repo, bus);

    await TenantContext.run({ ...ctx, tenantId: 't1' }, () => service.create({ tenantId: 't1', name: 'One' }));
    await TenantContext.run({ ...ctx, tenantId: 't2' }, () => service.create({ tenantId: 't2', name: 'Two' }));

    const t1 = await TenantContext.run({ ...ctx, tenantId: 't1' }, () => service.list());
    const t2 = await TenantContext.run({ ...ctx, tenantId: 't2' }, () => service.list());
    expect(t1.map((w) => w.name)).toEqual(['One']);
    expect(t2.map((w) => w.name)).toEqual(['Two']);
  });

  it('returns NotFound for a missing workspace', async () => {
    await TenantContext.run(ctx, async () => {
      const { service } = wire();
      const r = await service.get(WorkspaceId.of('missing'));
      expect(r.isErr).toBe(true);
    });
  });
});
