import { UnavailableError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import type { AIManagerPort, AITaskResult } from '@ados/contracts';
import { CampaignDraft, type CampaignContext, type CampaignDraftContent } from './campaign-draft.js';
import type { CampaignDraftRepository } from './repository.js';

/** JSON schema the AI Manager enforces on the campaign plan the model returns. */
const DRAFT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['name', 'objective', 'channels', 'schedule'],
  properties: {
    name: { type: 'string' },
    objective: { type: 'string' },
    channels: { type: 'array', items: { type: 'object' } },
    schedule: { type: 'object', required: ['startHint', 'durationDays'] },
  },
};

/**
 * Campaign Draft Service — assembles the Marketing Brief and Creative Set into a
 * structured, approval-ready campaign plan via the AI Manager (reasoning task,
 * promptRef, never a model directly). The output is a DRAFT; launching to any ad
 * platform is a separate, human-gated step this service never performs.
 */
export class CampaignDraftService {
  private readonly tele: Telemetry = telemetry('campaign-engine.draft');

  constructor(
    private readonly repo: CampaignDraftRepository,
    private readonly bus: EventBus,
    private readonly ai: AIManagerPort,
  ) {}

  async draft(context: CampaignContext): Promise<Result<CampaignDraft, AppError>> {
    return this.tele.span('draft', async () => {
      let result: AITaskResult<CampaignDraftContent>;
      try {
        result = await this.ai.submit<CampaignDraftContent>({
          capability: 'reasoning',
          submittedBy: 'campaign-engine.draft',
          promptRef: { key: 'campaign.draft', version: 1 },
          variables: {
            objective: context.objective,
            targetAudience: context.targetAudience,
            recommendedChannels: context.recommendedChannels,
            budgetAllocation: context.budgetAllocation,
            totalBudget: context.totalBudget,
            headline: context.headline,
            adCopy: context.adCopy,
            cta: context.cta,
          },
          responseSchema: DRAFT_SCHEMA,
        });
      } catch (cause) {
        return err(
          new UnavailableError('AI Manager failed to draft the campaign', {
            details: { missionId: context.missionId, briefId: context.briefId },
            cause,
          }),
        );
      }

      const content = validateContent(result.output);
      if (content.isErr) return err(content.error);

      const draft = CampaignDraft.create({
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

      const saved = await this.repo.save(draft);
      if (saved.isErr) return err(saved.error);
      await this.publish(draft);
      this.tele.count('drafted');
      this.tele.logger.info(
        { campaignDraftId: draft.id.toString(), missionId: context.missionId, model: result.model },
        'campaign draft created',
      );
      return ok(draft);
    });
  }

  async list(missionId?: string): Promise<CampaignDraft[]> {
    return this.tele.span('list', async () => this.repo.list(missionId));
  }

  /** Discard every campaign draft for a mission — used when a rejected campaign is sent back for rework. */
  async discardForMission(missionId: string): Promise<void> {
    for (const draft of await this.repo.list(missionId)) await this.repo.delete(draft.id);
  }

  private async publish(draft: CampaignDraft): Promise<void> {
    const events: DomainEvent[] = draft.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}

function validateContent(output: unknown): Result<CampaignDraftContent, AppError> {
  const o = output as Partial<CampaignDraftContent> | null;
  if (
    !o ||
    typeof o.name !== 'string' ||
    typeof o.objective !== 'string' ||
    !Array.isArray(o.channels) ||
    o.channels.length === 0 ||
    typeof o.schedule !== 'object' ||
    o.schedule === null ||
    typeof o.schedule.startHint !== 'string' ||
    typeof o.schedule.durationDays !== 'number'
  ) {
    return err(new UnavailableError('AI Manager returned a malformed campaign draft', { details: { output } }));
  }
  return ok(o as CampaignDraftContent);
}
