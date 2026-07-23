import { UnavailableError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import type { AIManagerPort, AITaskResult } from '@ados/contracts';
import {
  ExecutiveReport,
  type DashboardContent,
  type ExecutiveContext,
  type MissionVerdict,
} from './executive-report.js';
import type { ExecutiveReportRepository } from './repository.js';

const VERDICTS: readonly MissionVerdict[] = ['exceeded', 'on_track', 'at_risk'];

/** JSON schema the AI Manager enforces on the dashboard the model returns. */
const DASHBOARD_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['headline', 'executiveSummary', 'verdict', 'keyResults', 'decisions', 'nextActions'],
  properties: {
    headline: { type: 'string' },
    executiveSummary: { type: 'string' },
    verdict: { type: 'string', enum: VERDICTS },
    keyResults: { type: 'array', items: { type: 'object' } },
    decisions: { type: 'array', items: { type: 'string' } },
    nextActions: { type: 'array', items: { type: 'string' } },
  },
};

/**
 * Executive Report Service — the CEO's synthesis and final step of the demo
 * flow. Submits the whole mission picture (brief objective + campaign report
 * KPIs) to the AI Manager (reasoning task, promptRef, never a model directly)
 * and produces a CEO Dashboard with a headline verdict, key results, decisions
 * and next actions, carrying provenance so it is reproducible.
 */
export class ExecutiveReportService {
  private readonly tele: Telemetry = telemetry('executive-ai.dashboard');

  constructor(
    private readonly repo: ExecutiveReportRepository,
    private readonly bus: EventBus,
    private readonly ai: AIManagerPort,
  ) {}

  async generate(context: ExecutiveContext): Promise<Result<ExecutiveReport, AppError>> {
    return this.tele.span('generate', async () => {
      let result: AITaskResult<DashboardContent>;
      try {
        result = await this.ai.submit<DashboardContent>({
          capability: 'reasoning',
          submittedBy: 'executive-ai.dashboard',
          promptRef: { key: 'executive.dashboard', version: 1 },
          variables: {
            clientName: context.clientName,
            missionBrief: context.missionBrief,
            objective: context.objective,
            kpis: context.kpis,
            reportSummary: context.reportSummary,
            reportRecommendations: context.reportRecommendations,
          },
          responseSchema: DASHBOARD_SCHEMA,
        });
      } catch (cause) {
        return err(
          new UnavailableError('AI Manager failed to generate the CEO dashboard', {
            details: { missionId: context.missionId, reportId: context.reportId },
            cause,
          }),
        );
      }

      const content = validateContent(result.output);
      if (content.isErr) return err(content.error);

      const report = ExecutiveReport.generate({
        context,
        content: content.value,
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
        { reportId: report.id.toString(), missionId: context.missionId, verdict: report.verdict },
        'executive dashboard generated',
      );
      return ok(report);
    });
  }

  async list(missionId?: string): Promise<ExecutiveReport[]> {
    return this.tele.span('list', async () => this.repo.list(missionId));
  }

  private async publish(report: ExecutiveReport): Promise<void> {
    const events: DomainEvent[] = report.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}

function validateContent(output: unknown): Result<DashboardContent, AppError> {
  const o = output as Partial<DashboardContent> | null;
  if (
    !o ||
    typeof o.headline !== 'string' ||
    typeof o.executiveSummary !== 'string' ||
    typeof o.verdict !== 'string' ||
    !VERDICTS.includes(o.verdict as MissionVerdict) ||
    !Array.isArray(o.keyResults) ||
    !Array.isArray(o.decisions) ||
    !Array.isArray(o.nextActions)
  ) {
    return err(new UnavailableError('AI Manager returned a malformed CEO dashboard', { details: { output } }));
  }
  return ok(o as DashboardContent);
}
