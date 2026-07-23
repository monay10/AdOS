import { UnavailableError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import type { AIManagerPort, AITaskResult } from '@ados/contracts';
import { CampaignReport, type ReportNarrative } from './campaign-report.js';
import { computeKpis, type CampaignMetrics } from './kpi.js';
import type { CampaignReportRepository } from './repository.js';

/** JSON schema the AI Manager enforces on the narrative the model returns. */
const NARRATIVE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['summary', 'highlights', 'recommendations'],
  properties: {
    summary: { type: 'string' },
    highlights: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
  },
};

/**
 * Campaign Report Service — computes deterministic KPIs from raw metrics, then
 * asks the AI Manager (reasoning task, promptRef, never a model directly) for a
 * narrative and recommendations grounded in those numbers. The KPIs are pure
 * math; only the narrative is AI-generated, and it carries provenance.
 */
export class CampaignReportService {
  private readonly tele: Telemetry = telemetry('analytics-engine.report');

  constructor(
    private readonly repo: CampaignReportRepository,
    private readonly bus: EventBus,
    private readonly ai: AIManagerPort,
  ) {}

  async generate(metrics: CampaignMetrics): Promise<Result<CampaignReport, AppError>> {
    return this.tele.span('generate', async () => {
      const kpis = computeKpis(metrics);

      let result: AITaskResult<ReportNarrative>;
      try {
        result = await this.ai.submit<ReportNarrative>({
          capability: 'reasoning',
          submittedBy: 'analytics-engine.report',
          promptRef: { key: 'analytics.report', version: 1 },
          variables: {
            kpis,
            impressions: metrics.impressions,
            clicks: metrics.clicks,
            conversions: metrics.conversions,
            leads: metrics.leads,
            spend: metrics.spend,
            revenue: metrics.revenue,
          },
          responseSchema: NARRATIVE_SCHEMA,
        });
      } catch (cause) {
        return err(
          new UnavailableError('AI Manager failed to generate the report narrative', {
            details: { missionId: metrics.missionId, campaignDraftId: metrics.campaignDraftId },
            cause,
          }),
        );
      }

      const narrative = validateNarrative(result.output);
      if (narrative.isErr) return err(narrative.error);

      const report = CampaignReport.generate({
        metrics,
        kpis,
        narrative: narrative.value,
        provenance: {
          taskId: result.taskId,
          capability: result.capability,
          model: result.model,
          engine: result.engine,
          latencyMs: result.latencyMs,
        },
      });

      const saved = await this.repo.save(report);
      if (saved.isErr) return err(saved.error);
      await this.publish(report);
      this.tele.count('generated');
      this.tele.logger.info(
        { reportId: report.id.toString(), missionId: metrics.missionId, roas: report.kpi('roas') },
        'campaign report generated',
      );
      return ok(report);
    });
  }

  async list(missionId?: string): Promise<CampaignReport[]> {
    return this.tele.span('list', async () => this.repo.list(missionId));
  }

  private async publish(report: CampaignReport): Promise<void> {
    const events: DomainEvent[] = report.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}

function validateNarrative(output: unknown): Result<ReportNarrative, AppError> {
  const o = output as Partial<ReportNarrative> | null;
  if (!o || typeof o.summary !== 'string' || !Array.isArray(o.highlights) || !Array.isArray(o.recommendations)) {
    return err(new UnavailableError('AI Manager returned a malformed report narrative', { details: { output } }));
  }
  return ok(o as ReportNarrative);
}
