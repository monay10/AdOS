import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import type { AIManagerPort, AIStreamChunk, AITaskRequest, AITaskResult } from '@ados/contracts';
import { computeKpis, type CampaignMetrics } from './kpi.js';
import { InMemoryCampaignReportRepository } from './repository.js';
import { CampaignReportService } from './service.js';
import type { ReportNarrative } from './campaign-report.js';

const metrics: CampaignMetrics = {
  tenantId: 'acme',
  missionId: 'm1',
  clientId: 'c1',
  campaignDraftId: 'cd1',
  impressions: 100_000,
  clicks: 2_000,
  conversions: 100,
  leads: 120,
  spend: { amountMinor: 8_000_000, currency: 'TRY' }, // 80,000 TRY
  revenue: { amountMinor: 24_000_000, currency: 'TRY' }, // 240,000 TRY
};

const NARRATIVE: ReportNarrative = {
  summary: 'The campaign delivered a 3x return with strong lead volume.',
  highlights: ['ROAS of 3x', 'CTR above 2%'],
  recommendations: ['Scale Meta budget by 20%', 'Test new search keywords'],
};

// ── Unit: deterministic KPI math ──────────────────────────────────────────────
describe('computeKpis (deterministic)', () => {
  it('computes CTR/CPC/CPA/CPL/ROAS/ROI correctly', () => {
    const kpis = computeKpis(metrics);
    const byName = Object.fromEntries(kpis.map((k) => [k.name, k.value]));
    expect(byName['ctr']).toBe(2); // 2000/100000 = 2%
    expect(byName['cpc']).toBe(4000); // 8,000,000 / 2000
    expect(byName['cpa']).toBe(80000); // 8,000,000 / 100
    expect(byName['cpl']).toBe(66666.67); // 8,000,000 / 120
    expect(byName['roas']).toBe(3); // 24M / 8M
    expect(byName['roi']).toBe(200); // (24M-8M)/8M = 200%
  });

  it('never divides by zero', () => {
    const zero = computeKpis({ ...metrics, impressions: 0, clicks: 0, conversions: 0, leads: 0, spend: { amountMinor: 0, currency: 'TRY' } });
    for (const k of zero) expect(Number.isFinite(k.value)).toBe(true);
  });
});

class StubAIManager implements AIManagerPort {
  public lastRequest?: AITaskRequest;
  constructor(private readonly output: unknown = NARRATIVE, private readonly fail = false) {}
  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    this.lastRequest = request;
    if (this.fail) throw new Error('engine unavailable');
    return {
      taskId: 'task-report-1',
      capability: request.capability,
      model: 'deepseek-r1:32b',
      engine: 'ollama',
      output: this.output as T,
      usage: { promptTokens: 200, completionTokens: 250, totalTokens: 450 },
      latencyMs: 88,
      cached: false,
      attempts: [{ model: 'deepseek-r1:32b', ok: true }],
    };
  }
  async *stream(): AsyncIterable<AIStreamChunk> {}
}

function wire(ai: AIManagerPort) {
  const bus = new InMemoryEventBus();
  const repo = new InMemoryCampaignReportRepository();
  const service = new CampaignReportService(repo, bus, ai);
  return { bus, repo, service };
}

const tctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

// ── Integration: report generation ────────────────────────────────────────────
describe('CampaignReportService', () => {
  it('computes KPIs and layers an AI narrative on top', async () => {
    await TenantContext.run(tctx, async () => {
      const ai = new StubAIManager();
      const { bus, service } = wire(ai);
      const seen: string[] = [];
      await bus.subscribe('analytics.>', async (e) => { seen.push(e.eventName); });

      const r = await service.generate(metrics);
      expect(r.isOk).toBe(true);
      const report = r.unwrap();

      expect(ai.lastRequest?.capability).toBe('reasoning');
      expect(ai.lastRequest?.promptRef).toEqual({ key: 'analytics.report', version: 1 });
      expect(report.kpi('roas')).toBe(3);
      expect(report.narrative.recommendations).toHaveLength(2);
      expect(report.provenance).toMatchObject({ taskId: 'task-report-1', model: 'deepseek-r1:32b', engine: 'ollama' });

      expect(await service.list('m1')).toHaveLength(1);
      expect(seen).toEqual(['analytics.report.generated.v1']);
    });
  });

  it('fails cleanly when the AI Manager is unavailable', async () => {
    await TenantContext.run(tctx, async () => {
      const { service } = wire(new StubAIManager(NARRATIVE, true));
      expect((await service.generate(metrics)).isErr).toBe(true);
    });
  });

  it('rejects a malformed narrative', async () => {
    await TenantContext.run(tctx, async () => {
      const { service } = wire(new StubAIManager({ summary: 'x' }));
      expect((await service.generate(metrics)).isErr).toBe(true);
    });
  });
});
