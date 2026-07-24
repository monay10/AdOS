import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { Approval, ApprovalId } from './approval.js';
import { InMemoryApprovalRepository } from './repository.js';
import { ApprovalService } from './service.js';

const AT = '2026-07-24T10:00:00.000Z';

// ── Unit tests: domain model ──────────────────────────────────────────────────
describe('Approval (domain)', () => {
  it('creates a draft with a seeded timeline entry and a creation event', () => {
    const r = Approval.create({ tenantId: 'acme', title: '  Launch budget  ', requestedBy: 'lead@acme.com', at: AT });
    expect(r.isOk).toBe(true);
    if (r.isOk) {
      const a = r.value;
      expect(a.title).toBe('Launch budget');
      expect(a.status).toBe('draft');
      expect(a.timeline).toHaveLength(1);
      expect(a.timeline[0]!.action).toBe('created');
      expect(a.timeline[0]!.to).toBe('draft');
      expect(a.pullDomainEvents()[0]!.eventName).toBe('approval.created.v1');
    }
  });

  it('rejects missing tenant, title or requester', () => {
    expect(Approval.create({ tenantId: '', title: 't', requestedBy: 'u', at: AT }).isErr).toBe(true);
    expect(Approval.create({ tenantId: 'acme', title: '', requestedBy: 'u', at: AT }).isErr).toBe(true);
    expect(Approval.create({ tenantId: 'acme', title: 't', requestedBy: '', at: AT }).isErr).toBe(true);
  });

  it('walks draft → in_review → revision_requested → in_review → approved, timelining each step', () => {
    const a = Approval.create({ tenantId: 'acme', title: 'T', requestedBy: 'u', at: AT }).unwrap();
    a.pullDomainEvents();

    expect(a.submit({ actor: 'u', at: AT }).isOk).toBe(true);
    expect(a.status).toBe('in_review');
    expect(a.requestRevision({ actor: 'exec', at: AT, note: 'tighten the budget' }).isOk).toBe(true);
    expect(a.status).toBe('revision_requested');
    expect(a.submit({ actor: 'u', at: AT }).isOk).toBe(true); // resubmit
    expect(a.status).toBe('in_review');
    expect(a.approve({ actor: 'exec', at: AT, note: 'looks good' }).isOk).toBe(true);
    expect(a.status).toBe('approved');

    expect(a.timeline.map((t) => t.action)).toEqual([
      'created',
      'submitted',
      'revision_requested',
      'submitted',
      'approved',
    ]);
    const last = a.timeline[a.timeline.length - 1]!;
    expect(last.note).toBe('looks good');
    expect(last.from).toBe('in_review');
    expect(a.pullDomainEvents().map((e) => e.eventName)).toEqual([
      'approval.submitted.v1',
      'approval.revision_requested.v1',
      'approval.submitted.v1',
      'approval.approved.v1',
    ]);
  });

  it('enforces the state machine: cannot approve a draft or submit an approved request', () => {
    const a = Approval.create({ tenantId: 'acme', title: 'T', requestedBy: 'u', at: AT }).unwrap();
    expect(a.approve({ actor: 'x', at: AT }).isErr).toBe(true); // still a draft
    expect(a.reject({ actor: 'x', at: AT }).isErr).toBe(true);
    a.submit({ actor: 'u', at: AT });
    a.approve({ actor: 'x', at: AT });
    expect(a.submit({ actor: 'u', at: AT }).isErr).toBe(true); // approved is terminal
    expect(a.status).toBe('approved');
  });
});

// ── Integration tests: service + repository + event bus ───────────────────────
describe('ApprovalService (integration)', () => {
  const ctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

  function wire() {
    const bus = new InMemoryEventBus();
    const repo = new InMemoryApprovalRepository();
    const service = new ApprovalService(repo, bus);
    return { bus, repo, service };
  }

  it('creates, submits, rejects and lists an approval end to end', async () => {
    await TenantContext.run(ctx, async () => {
      const { bus, service } = wire();
      const seen: string[] = [];
      await bus.subscribe('approval.>', async (e) => { seen.push(e.eventName); });

      const created = await service.create({ tenantId: 'acme', title: 'Q2 plan', requestedBy: 'lead', projectId: 'p1', at: AT });
      const id = created.unwrap().id;

      await service.submit(id, { actor: 'lead', at: AT });
      await service.reject(id, { actor: 'exec', at: AT, note: 'over budget' });

      const got = (await service.get(id)).unwrap();
      expect(got.status).toBe('rejected');
      expect(got.timeline).toHaveLength(3);
      expect(got.projectId).toBe('p1');

      expect(await service.list('p1')).toHaveLength(1);
      expect(await service.list('other')).toHaveLength(0);
      expect(seen).toEqual(['approval.created.v1', 'approval.submitted.v1', 'approval.rejected.v1']);
    });
  });

  it('isolates approvals by tenant', async () => {
    const { service } = wire();
    await TenantContext.run(ctx, async () => {
      await service.create({ tenantId: 'acme', title: 'A', requestedBy: 'u', at: AT });
      expect(await service.list()).toHaveLength(1);
    });
    await TenantContext.run({ ...ctx, tenantId: 'other' }, async () => {
      expect(await service.list()).toHaveLength(0);
    });
  });

  it('returns NotFound for a missing approval', async () => {
    await TenantContext.run(ctx, async () => {
      const { service } = wire();
      expect((await service.get(ApprovalId.of('missing'))).isErr).toBe(true);
    });
  });
});
