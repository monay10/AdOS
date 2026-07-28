import { UnavailableError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import type { AIManagerPort, AITaskResult } from '@ados/contracts';
import {
  MarketingBrief,
  type MarketingBriefContent,
  type MarketingContext,
} from './marketing-brief.js';
import type { MarketingBriefRepository } from './repository.js';

/** JSON schema the AI Manager enforces on the brief the model returns. */
const BRIEF_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['objective', 'targetAudience', 'positioning', 'keyMessages', 'recommendedChannels', 'budgetAllocation', 'kpis'],
  properties: {
    objective: { type: 'string' },
    targetAudience: { type: 'string' },
    positioning: { type: 'string' },
    keyMessages: { type: 'array', items: { type: 'string' } },
    recommendedChannels: { type: 'array', items: { type: 'string' } },
    budgetAllocation: { type: 'array', items: { type: 'object' } },
    kpis: { type: 'array', items: { type: 'object' } },
  },
};

/**
 * Marketing Brief Service — the first "thinking" step. Submits the mission
 * context to the AI Manager (never to a model directly) as a reasoning task and
 * turns the result into a reproducible Marketing Brief. This is where the system
 * first begins to think.
 */
export class MarketingBriefService {
  private readonly tele: Telemetry = telemetry('marketing-intelligence.brief');

  constructor(
    private readonly repo: MarketingBriefRepository,
    private readonly bus: EventBus,
    private readonly ai: AIManagerPort,
  ) {}

  async generate(context: MarketingContext): Promise<Result<MarketingBrief, AppError>> {
    return this.tele.span('generate', async () => {
      let result: AITaskResult<MarketingBriefContent>;
      try {
        result = await this.ai.submit<MarketingBriefContent>({
          capability: 'reasoning',
          submittedBy: 'marketing-intelligence.brief',
          promptRef: { key: 'marketing.brief', version: 1 },
          variables: {
            missionId: context.missionId,
            clientName: context.clientName,
            industry: context.industry,
            brandVoice: context.brandVoice,
            brandValues: context.brandValues,
            productName: context.productName,
            productDescription: context.productDescription,
            missionBrief: context.missionBrief,
            budget: context.budget,
            historicalPerformance: context.historicalPerformance,
          },
          responseSchema: BRIEF_SCHEMA,
        });
      } catch (cause) {
        return err(
          new UnavailableError('AI Manager failed to generate the marketing brief', {
            details: { missionId: context.missionId },
            cause,
          }),
        );
      }

      const content = validateContent(result.output);
      if (content.isErr) return err(content.error);

      const brief = MarketingBrief.generate({
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

      const saved = await this.repo.save(brief);
      if (saved.isErr) return err(saved.error);
      await this.publish(brief);
      this.tele.count('generated');
      this.tele.logger.info(
        { briefId: brief.id.toString(), missionId: context.missionId, model: result.model },
        'marketing brief generated',
      );
      return ok(brief);
    });
  }

  async list(missionId?: string): Promise<MarketingBrief[]> {
    return this.tele.span('list', async () => this.repo.list(missionId));
  }

  /** Discard every brief for a mission — used when a rejected brief is sent back for rework. */
  async discardForMission(missionId: string): Promise<void> {
    for (const brief of await this.repo.list(missionId)) await this.repo.delete(brief.id);
  }

  private async publish(brief: MarketingBrief): Promise<void> {
    const events: DomainEvent[] = brief.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}

function validateContent(output: unknown): Result<MarketingBriefContent, AppError> {
  const o = output as Partial<MarketingBriefContent> | null;
  if (
    !o ||
    typeof o.objective !== 'string' ||
    typeof o.targetAudience !== 'string' ||
    typeof o.positioning !== 'string' ||
    !Array.isArray(o.keyMessages) ||
    !Array.isArray(o.recommendedChannels) ||
    !Array.isArray(o.budgetAllocation) ||
    !Array.isArray(o.kpis)
  ) {
    return err(new UnavailableError('AI Manager returned a malformed marketing brief', { details: { output } }));
  }
  return ok(o as MarketingBriefContent);
}
