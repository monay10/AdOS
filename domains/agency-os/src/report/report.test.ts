import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { PerformanceReport, PerformanceReportId } from './report.js';
import { InMemoryPerformanceReportRepository } from './repository.js';
import { PerformanceReportService } from './service.js';

const AT = '2026-07-24T10:00:00.000Z';

const base = {
  tenantId: 'acme',
  clientId: 'c1',
  title: '  Q3 performance  ',
  period: '',
  metrics: [{ label: 'Missions', value: '3' }],
  summary: '  Bright ran 3 missions.  ',
  generatedBy: 'owner',
  generatedAt: AT,
} as const;

// ── Unit tests: domain model ──────────────────────────────────────────────────
describe('PerformanceReport (domain)', () => {
  it('generates an immutable snapshot with defaults and a generation event', () => {
    const r = PerformanceReport.generate({ ...base });
    expect(r.isOk).toBe(true);
    if (r.isOk) {
      const rep = r.value;
      expect(rep.title).toBe('Q3 performance');
      expect(rep.period).toBe('All time'); // empty → default
      expect(rep.summary).toBe('Bright ran 3 missions.');
      expect(rep.metrics).toEqual([{ label: 'Missions', value: '3' }]);
      expect(rep.generatedAt).toBe(AT);
      expect(rep.pullDomainEvents()[0]!.eventName).toBe('performance.report.generated.v1');
    }
  });

  it('rejects missing tenant, client, title or author', () => {
    expect(PerformanceReport.generate({ ...base, tenantId: '' }).isErr).toBe(true);
    expect(PerformanceReport.generate({ ...base, clientId: '' }).isErr).toBe(true);
    expect(PerformanceReport.generate({ ...base, title: '' }).isErr).toBe(true);
    expect(PerformanceReport.generate({ ...base, generatedBy: '' }).isErr).toBe(true);
  });

  it('keeps the snapshot isolated from the input arrays', () => {
    const metrics = [{ label: 'Missions', value: '3' }];
    const rep = PerformanceReport.generate({ ...base, metrics }).unwrap();
    metrics.push({ label: 'Injected', value: 'x' });
    expect(rep.metrics).toHaveLength(1);
  });
});

// ── Integration tests: service + repository + event bus ───────────────────────
describe('PerformanceReportService (integration)', () => {
  const ctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

  function wire() {
    const bus = new InMemoryEventBus();
    const repo = new InMemoryPerformanceReportRepository();
    const service = new PerformanceReportService(repo, bus);
    return { bus, repo, service };
  }

  it('generates, lists (by client) and gets a report end to end', async () => {
    await TenantContext.run(ctx, async () => {
      const { bus, service } = wire();
      const seen: string[] = [];
      await bus.subscribe('performance.>', async (e) => { seen.push(e.eventName); });

      const created = await service.generate({ ...base, projectId: 'p1' });
      const id = created.unwrap().id;

      const got = (await service.get(id)).unwrap();
      expect(got.title).toBe('Q3 performance');
      expect(got.projectId).toBe('p1');

      expect(await service.list('c1')).toHaveLength(1);
      expect(await service.list('other')).toHaveLength(0);
      expect(seen).toEqual(['performance.report.generated.v1']);
    });
  });

  it('isolates reports by tenant', async () => {
    const { service } = wire();
    await TenantContext.run(ctx, async () => {
      await service.generate({ ...base });
      expect(await service.list()).toHaveLength(1);
    });
    await TenantContext.run({ ...ctx, tenantId: 'other' }, async () => {
      expect(await service.list()).toHaveLength(0);
    });
  });

  it('returns NotFound for a missing report', async () => {
    await TenantContext.run(ctx, async () => {
      const { service } = wire();
      expect((await service.get(PerformanceReportId.of('missing'))).isErr).toBe(true);
    });
  });
});
