import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import type { AIManagerPort, AIStreamChunk, AITaskRequest, AITaskResult } from '@ados/contracts';
import { InMemoryMarketingBriefRepository } from './repository.js';
import { MarketingBriefService } from './service.js';
import type { MarketingBriefContent, MarketingContext } from './marketing-brief.js';

const context: MarketingContext = {
  tenantId: 'acme',
  missionId: 'm1',
  clientId: 'c1',
  clientName: 'Bright Smiles Dental',
  industry: 'healthcare',
  brandVoice: 'warm and trustworthy',
  brandValues: ['care', 'expertise'],
  productName: 'Whitening Treatment',
  productDescription: 'Professional in-clinic teeth whitening',
  missionBrief: 'Acquire new patients for a dental clinic opening next month',
  budget: { amountMinor: 8_000_000, currency: 'TRY', period: 'monthly' },
};

const CONTENT: MarketingBriefContent = {
  objective: 'Generate 120 qualified patient leads in the first month',
  targetAudience: 'Adults 25-45 within 10km valuing appearance and health',
  positioning: 'The trusted neighborhood clinic for a confident smile',
  keyMessages: ['Painless whitening', 'Same-day results', 'Board-certified dentists'],
  recommendedChannels: ['meta', 'google_ads'],
  budgetAllocation: [
    { channel: 'meta', percentage: 60 },
    { channel: 'google_ads', percentage: 40 },
  ],
  kpis: [{ name: 'leads', target: 120, unit: 'count' }],
};

/** Deterministic, offline stub of the AI Manager for tests. */
class StubAIManager implements AIManagerPort {
  public lastRequest?: AITaskRequest;
  constructor(private readonly output: unknown = CONTENT, private readonly fail = false) {}

  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    this.lastRequest = request;
    if (this.fail) throw new Error('engine unavailable');
    return {
      taskId: 'task-123',
      capability: request.capability,
      model: 'qwen3:32b',
      engine: 'ollama',
      output: this.output as T,
      usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
      latencyMs: 42,
      cached: false,
      attempts: [{ model: 'qwen3:32b', ok: true }],
    };
  }

  async *stream(): AsyncIterable<AIStreamChunk> {
    // not used in these tests
  }
}

function wire(ai: AIManagerPort) {
  const bus = new InMemoryEventBus();
  const repo = new InMemoryMarketingBriefRepository();
  const service = new MarketingBriefService(repo, bus, ai);
  return { bus, repo, service };
}

const tctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

describe('MarketingBriefService', () => {
  it('submits a reasoning task and generates a reproducible brief', async () => {
    await TenantContext.run(tctx, async () => {
      const ai = new StubAIManager();
      const { bus, service } = wire(ai);
      const seen: string[] = [];
      await bus.subscribe('intel.>', async (e) => { seen.push(e.eventName); });

      const r = await service.generate(context);
      expect(r.isOk).toBe(true);
      const brief = r.unwrap();

      expect(ai.lastRequest?.capability).toBe('reasoning');
      expect(ai.lastRequest?.promptRef).toEqual({ key: 'marketing.brief', version: 1 });
      expect(ai.lastRequest?.variables?.['missionBrief']).toBe(context.missionBrief);

      expect(brief.content.objective).toContain('120');
      expect(brief.content.recommendedChannels).toEqual(['meta', 'google_ads']);
      // AI Determinism: provenance is recorded.
      expect(brief.provenance).toMatchObject({ taskId: 'task-123', model: 'qwen3:32b', engine: 'ollama', capability: 'reasoning' });

      expect(await service.list('m1')).toHaveLength(1);
      expect(seen).toEqual(['intel.brief.generated.v1']);
    });
  });

  it('fails cleanly when the AI Manager is unavailable', async () => {
    await TenantContext.run(tctx, async () => {
      const { service } = wire(new StubAIManager(CONTENT, true));
      const r = await service.generate(context);
      expect(r.isErr).toBe(true);
    });
  });

  it('rejects malformed AI output', async () => {
    await TenantContext.run(tctx, async () => {
      const { service } = wire(new StubAIManager({ objective: 'x' }));
      const r = await service.generate(context);
      expect(r.isErr).toBe(true);
    });
  });
});
