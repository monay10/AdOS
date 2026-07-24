import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { Mission, MissionId } from './mission.js';
import { MissionWizard } from './wizard.js';
import { InMemoryMissionRepository } from './repository.js';
import { MissionService } from './service.js';

const context = { tenantId: 'acme', workspaceId: 'ws1', clientId: 'c1', createdBy: 'user@acme' };

// ── Unit tests: wizard + domain model ─────────────────────────────────────────
describe('MissionWizard (domain)', () => {
  it('walks steps and builds a submitted mission', () => {
    const wizard = MissionWizard.start(context).withObjective(
      'Acquire new patients for a dental clinic opening next month',
    );
    expect(wizard.currentStep()).toBe('budget');
    const ready = wizard
      .withBudget({ amountMinor: 8_000_000, currency: 'TRY', period: 'monthly' })
      .withTarget({ name: 'leads', target: 120, unit: 'count' });
    expect(ready.currentStep()).toBe('review');
    expect(ready.validate().isOk).toBe(true);

    const built = ready.build();
    expect(built.isOk).toBe(true);
    if (built.isOk) {
      expect(built.value.status).toBe('submitted');
      expect(built.value.budget?.amountMinor).toBe(8_000_000);
      expect(built.value.pullDomainEvents()[0]!.eventName).toBe('mission.submitted.v1');
    }
  });

  it('rejects too-short briefs and non-positive budgets', () => {
    expect(MissionWizard.start(context).withObjective('short').validate().isErr).toBe(true);
    const bad = MissionWizard.start(context)
      .withObjective('A perfectly long and valid objective statement')
      .withBudget({ amountMinor: 0, currency: 'TRY', period: 'monthly' });
    expect(bad.build().isErr).toBe(true);
  });

  it('reports context as the first incomplete step when nothing is set', () => {
    const wizard = MissionWizard.start({ tenantId: '', workspaceId: '', clientId: '', createdBy: '' });
    expect(wizard.currentStep()).toBe('context');
    expect(wizard.validate().isErr).toBe(true);
  });

  it('optionally associates the mission with an owning project', () => {
    const m = MissionWizard.start(context)
      .withObjective('Acquire new patients for a dental clinic opening next month')
      .withProject('proj-1')
      .build();
    expect(m.isOk).toBe(true);
    if (m.isOk) expect(m.value.projectId).toBe('proj-1');
  });
});

describe('Mission (domain lifecycle)', () => {
  function submitted(): Mission {
    return Mission.submit({
      ...context,
      brief: 'Acquire new patients for a dental clinic opening next month',
    }).unwrap();
  }

  it('drives the happy-path lifecycle and emits events in order', () => {
    const m = submitted();
    m.pullDomainEvents();
    expect(m.plan().isOk).toBe(true);
    expect(m.requestApproval('strategy_and_budget').isOk).toBe(true);
    expect(m.approve('strategy_and_budget').isOk).toBe(true);
    expect(m.startExecuting().isOk).toBe(true);
    expect(m.complete().isOk).toBe(true);
    expect(m.status).toBe('completed');
    expect(m.pullDomainEvents().map((e) => e.eventName)).toEqual([
      'mission.planned.v1',
      'mission.approval.requested.v1',
      'mission.approved.v1',
      'mission.executing.v1',
      'mission.completed.v1',
    ]);
  });

  it('rejects invalid transitions', () => {
    const m = submitted();
    expect(m.complete().isErr).toBe(true); // can't complete a submitted mission
    expect(m.approve('campaign_launch').isErr).toBe(true); // not awaiting approval
  });

  it('fails with a persisted reason and refuses to fail twice', () => {
    const m = submitted();
    m.pullDomainEvents();
    expect(m.fail('Cancelled by the customer').isOk).toBe(true);
    expect(m.status).toBe('failed');
    expect(m.failureReason).toBe('Cancelled by the customer');
    expect(m.snapshot().failureReason).toBe('Cancelled by the customer'); // survives persistence
    const failed = m.pullDomainEvents();
    expect(failed[0]!.eventName).toBe('mission.failed.v1');
    expect(m.fail('again').isErr).toBe(true); // already terminal
  });
});

// ── Integration tests: service + repository + event bus ───────────────────────
describe('MissionService (integration)', () => {
  const ctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

  function wire() {
    const bus = new InMemoryEventBus();
    const repo = new InMemoryMissionRepository();
    const service = new MissionService(repo, bus);
    return { bus, repo, service };
  }

  it('submits and runs a mission end to end', async () => {
    await TenantContext.run(ctx, async () => {
      const { bus, service } = wire();
      const seen: string[] = [];
      await bus.subscribe('mission.>', async (e) => { seen.push(e.eventName); });

      const wizard = MissionWizard.start(context)
        .withObjective('Acquire new patients for a dental clinic opening next month')
        .withBudget({ amountMinor: 8_000_000, currency: 'TRY', period: 'monthly' });

      const submitted = await service.submit(wizard);
      expect(submitted.isOk).toBe(true);
      const id = submitted.unwrap().id;

      expect(await service.list('c1')).toHaveLength(1);

      await service.plan(id);
      await service.requestApproval(id, 'strategy_and_budget');
      await service.approve(id, 'strategy_and_budget');
      await service.startExecuting(id);
      await service.complete(id);

      expect((await service.get(id)).unwrap().status).toBe('completed');
      expect(seen).toEqual([
        'mission.submitted.v1',
        'mission.planned.v1',
        'mission.approval.requested.v1',
        'mission.approved.v1',
        'mission.executing.v1',
        'mission.completed.v1',
      ]);
    });
  });

  it('isolates missions by tenant and returns NotFound for a missing mission', async () => {
    const { service } = wire();
    await TenantContext.run(ctx, async () => {
      const w = MissionWizard.start(context).withObjective('Acquire new patients for a dental clinic soon');
      await service.submit(w);
      expect(await service.list()).toHaveLength(1);
      expect((await service.get(MissionId.of('missing'))).isErr).toBe(true);
    });
    await TenantContext.run({ ...ctx, tenantId: 'other' }, async () => {
      expect(await service.list()).toHaveLength(0);
    });
  });
});
