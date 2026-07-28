import { ForbiddenError, UnavailableError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import type { AIManagerPort, AITaskResult } from '@ados/contracts';
import { CreativeBlocked, CreativeSet, type CreativeContent, type CreativeContext } from './creative-set.js';
import type { CreativeSafetyGate } from './safety.js';
import type { CreativeSetRepository } from './repository.js';

/** JSON schema the AI Manager enforces on the creative set the model returns. */
const CREATIVE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['headline', 'adCopy', 'cta', 'socialPost', 'landingPage', 'email'],
  properties: {
    headline: { type: 'string' },
    adCopy: { type: 'string' },
    cta: { type: 'string' },
    socialPost: { type: 'string' },
    landingPage: { type: 'object', required: ['headline', 'body', 'cta'] },
    email: { type: 'object', required: ['subject', 'body'] },
  },
};

/**
 * Creative Studio Service — turns a Marketing Brief into publish-ready copy by
 * submitting a chat task to the AI Manager (never a model directly). Produces
 * copy ONLY; campaigns and ad platforms are out of scope. Every asset carries
 * provenance so it is reproducible.
 */
export class CreativeStudioService {
  private readonly tele: Telemetry = telemetry('creative-studio.creative');

  constructor(
    private readonly repo: CreativeSetRepository,
    private readonly bus: EventBus,
    private readonly ai: AIManagerPort,
    private readonly safety?: CreativeSafetyGate,
  ) {}

  async generate(context: CreativeContext): Promise<Result<CreativeSet, AppError>> {
    return this.tele.span('generate', async () => {
      let result: AITaskResult<CreativeContent>;
      try {
        result = await this.ai.submit<CreativeContent>({
          capability: 'chat',
          submittedBy: 'creative-studio.creative',
          promptRef: { key: 'creative.set', version: 1 },
          variables: {
            productName: context.productName,
            brandVoice: context.brandVoice,
            objective: context.objective,
            targetAudience: context.targetAudience,
            positioning: context.positioning,
            keyMessages: context.keyMessages,
          },
          responseSchema: CREATIVE_SCHEMA,
        });
      } catch (cause) {
        return err(
          new UnavailableError('AI Manager failed to generate the creative set', {
            details: { missionId: context.missionId, briefId: context.briefId },
            cause,
          }),
        );
      }

      const content = validateContent(result.output);
      if (content.isErr) return err(content.error);

      // Brand-safety gate — reject unsafe copy BEFORE it is ever persisted.
      if (this.safety) {
        const verdict = await this.safety.inspect(content.value, {
          brandId: context.brandId,
          bannedWords: context.bannedWords,
        });
        if (!verdict.safe) {
          await this.publishBlocked(context, verdict.issues);
          this.tele.count('blocked');
          this.tele.logger.warn(
            { missionId: context.missionId, issues: verdict.issues },
            'creative set blocked by brand safety',
          );
          return err(
            new ForbiddenError('Creative blocked by brand safety', {
              details: { missionId: context.missionId, issues: verdict.issues },
            }),
          );
        }
      }

      const set = CreativeSet.generate({
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

      const saved = await this.repo.save(set);
      if (saved.isErr) return err(saved.error);
      await this.publish(set);
      this.tele.count('generated');
      this.tele.logger.info(
        { creativeSetId: set.id.toString(), missionId: context.missionId, model: result.model },
        'creative set generated',
      );
      return ok(set);
    });
  }

  async list(missionId?: string): Promise<CreativeSet[]> {
    return this.tele.span('list', async () => this.repo.list(missionId));
  }

  private async publish(set: CreativeSet): Promise<void> {
    const events: DomainEvent[] = set.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }

  private async publishBlocked(context: CreativeContext, issues: string[]): Promise<void> {
    const event = new CreativeBlocked(
      context.missionId,
      {
        missionId: context.missionId,
        clientId: context.clientId,
        briefId: context.briefId,
        issues,
        tenantId: context.tenantId,
      },
      { tenantId: context.tenantId },
    );
    await this.bus.publish([event.toEnvelope()]);
  }
}

function validateContent(output: unknown): Result<CreativeContent, AppError> {
  const o = output as Partial<CreativeContent> | null;
  if (
    !o ||
    typeof o.headline !== 'string' ||
    typeof o.adCopy !== 'string' ||
    typeof o.cta !== 'string' ||
    typeof o.socialPost !== 'string' ||
    typeof o.landingPage !== 'object' ||
    o.landingPage === null ||
    typeof o.landingPage.headline !== 'string' ||
    typeof o.landingPage.body !== 'string' ||
    typeof o.landingPage.cta !== 'string' ||
    typeof o.email !== 'object' ||
    o.email === null ||
    typeof o.email.subject !== 'string' ||
    typeof o.email.body !== 'string'
  ) {
    return err(new UnavailableError('AI Manager returned a malformed creative set', { details: { output } }));
  }
  return ok(o as CreativeContent);
}
