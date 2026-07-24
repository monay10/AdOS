import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { Project, ProjectId } from './project.js';
import { InMemoryProjectRepository } from './repository.js';
import { ProjectService } from './service.js';

// ── Unit tests: domain model ──────────────────────────────────────────────────
describe('Project (domain)', () => {
  it('creates a project belonging to a client + brand with a creation event', () => {
    const r = Project.create({ tenantId: 'acme', clientId: 'c1', brandId: 'b1', name: '  Spring Launch  ' });
    expect(r.isOk).toBe(true);
    if (r.isOk) {
      expect(r.value.name).toBe('Spring Launch');
      expect(r.value.clientId).toBe('c1');
      expect(r.value.brandId).toBe('b1');
      expect(r.value.status).toBe('active');
      expect(r.value.goals).toEqual([]);
      expect(r.value.members).toEqual([]);
      expect(r.value.pullDomainEvents()[0]!.eventName).toBe('project.created.v1');
    }
  });

  it('rejects missing tenant, client, brand or name', () => {
    expect(Project.create({ tenantId: '', clientId: 'c1', brandId: 'b1', name: 'x' }).isErr).toBe(true);
    expect(Project.create({ tenantId: 'acme', clientId: '', brandId: 'b1', name: 'x' }).isErr).toBe(true);
    expect(Project.create({ tenantId: 'acme', clientId: 'c1', brandId: '', name: 'x' }).isErr).toBe(true);
    expect(Project.create({ tenantId: 'acme', clientId: 'c1', brandId: 'b1', name: '' }).isErr).toBe(true);
  });

  it('updates, changes status, adds goals and members, emitting events', () => {
    const p = Project.create({ tenantId: 'acme', clientId: 'c1', brandId: 'b1', name: 'P' }).unwrap();
    p.pullDomainEvents();
    expect(p.update({ description: 'Q2 growth' }).isOk).toBe(true);
    expect(p.changeStatus('paused').isOk).toBe(true);
    expect(p.addGoal({ description: 'Leads', metric: 'leads', target: 500 }).isOk).toBe(true);
    expect(p.addMember({ name: 'Ada', email: 'ada@acme.com', role: 'manager' }).isOk).toBe(true);
    expect(p.description).toBe('Q2 growth');
    expect(p.status).toBe('paused');
    expect(p.goals).toHaveLength(1);
    expect(p.members).toHaveLength(1);
    expect(p.pullDomainEvents().map((e) => e.eventName)).toEqual([
      'project.updated.v1',
      'project.status_changed.v1',
      'project.goal_added.v1',
      'project.member_added.v1',
    ]);
  });

  it('rejects an invalid status and empty goal/member', () => {
    const p = Project.create({ tenantId: 'acme', clientId: 'c1', brandId: 'b1', name: 'P' }).unwrap();
    expect(p.changeStatus('archived').isErr).toBe(true); // archive is via archive()
    expect(p.addGoal({ description: '', metric: 'x', target: 1 }).isErr).toBe(true);
    expect(p.addMember({ name: 'x', email: '', role: '' }).isErr).toBe(true);
  });

  it('refuses mutation after archiving', () => {
    const p = Project.create({ tenantId: 'acme', clientId: 'c1', brandId: 'b1', name: 'P' }).unwrap();
    p.archive();
    expect(p.status).toBe('archived');
    expect(() => p.update({ name: 'Y' })).toThrow();
  });
});

// ── Integration tests: service + repository + event bus ───────────────────────
describe('ProjectService (integration)', () => {
  const ctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

  function wire() {
    const bus = new InMemoryEventBus();
    const repo = new InMemoryProjectRepository();
    const service = new ProjectService(repo, bus);
    return { bus, repo, service };
  }

  it('creates, enriches, lists and archives a project end to end', async () => {
    await TenantContext.run(ctx, async () => {
      const { bus, service } = wire();
      const seen: string[] = [];
      await bus.subscribe('project.>', async (e) => { seen.push(e.eventName); });

      const created = await service.create({ tenantId: 'acme', clientId: 'c1', brandId: 'b1', name: 'Launch' });
      const id = created.unwrap().id;

      await service.update(id, { description: 'Q2' });
      await service.addGoal(id, { description: 'Leads', metric: 'leads', target: 500 });
      await service.addMember(id, { name: 'Ada', email: 'ada@acme.com', role: 'manager' });
      await service.changeStatus(id, 'paused');

      const got = (await service.get(id)).unwrap();
      expect(got.description).toBe('Q2');
      expect(got.goals).toHaveLength(1);
      expect(got.members).toHaveLength(1);
      expect(got.status).toBe('paused');

      expect(await service.list('c1')).toHaveLength(1);
      await service.archive(id);
      expect(await service.list('c1')).toHaveLength(0); // archived, excluded

      expect(seen).toEqual([
        'project.created.v1',
        'project.updated.v1',
        'project.goal_added.v1',
        'project.member_added.v1',
        'project.status_changed.v1',
        'project.archived.v1',
      ]);
    });
  });

  it('scopes projects by client and isolates tenants', async () => {
    const { service } = wire();
    await TenantContext.run(ctx, async () => {
      await service.create({ tenantId: 'acme', clientId: 'c1', brandId: 'b1', name: 'A' });
      await service.create({ tenantId: 'acme', clientId: 'c2', brandId: 'b2', name: 'B' });
      expect((await service.list('c1')).map((p) => p.name)).toEqual(['A']);
      expect(await service.list()).toHaveLength(2);
    });
    await TenantContext.run({ ...ctx, tenantId: 'other' }, async () => {
      expect(await service.list()).toHaveLength(0);
    });
  });

  it('returns NotFound for a missing project', async () => {
    await TenantContext.run(ctx, async () => {
      const { service } = wire();
      expect((await service.get(ProjectId.of('missing'))).isErr).toBe(true);
    });
  });
});
