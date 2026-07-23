import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import type { AIManagerPort, AIStreamChunk, AITaskRequest, AITaskResult } from '@ados/contracts';
import { InMemoryCampaignDraftRepository } from './repository.js';
import { CampaignDraftService } from './service.js';
import type { CampaignContext, CampaignDraftContent } from './campaign-draft.js';

const context: CampaignContext = {
  tenantId: 'acme',
  missionId: 'm1',
  clientId: 'c1',
  briefId: 'b1',
  creativeSetId: 'cs1',
  objective: 'Generate 120 qualified patient leads',
  targetAudience: 'Adults 25-45 valuing appearance',
  recommendedChannels: ['meta', 'google_ads'],
  budgetAllocation: [
    { channel: 'meta', percentage: 60 },
    { channel: 'google_ads', percentage: 40 },
  ],
  totalBudget: { amountMinor: 8_000_000, currency: 'TRY' },
  headline: 'A Brighter Smile in One Visit',
  adCopy: 'Professional whitening from dentists you can trust.',
  cta: 'Book your appointment',
};

const CONTENT: CampaignDraftContent = {
  name: 'Bright Smiles — Launch',
  objective: 'Lead generation',
  channels: [
    {
      channel: 'meta',
      budgetPercentage: 60,
      adSets: [
        {
          name: 'Meta — Local Adults',
          audience: 'Adults 25-45 within 10km',
          headline: 'A Brighter Smile in One Visit',
          primaryText: 'Professional whitening from dentists you can trust.',
          cta: 'Book your appointment',
        },
      ],
    },
    {
      channel: 'google_ads',
      budgetPercentage: 40,
      adSets: [
        {
          name: 'Search — Whitening Intent',
          audience: 'People searching teeth whitening near me',
          headline: 'Same-Day Teeth Whitening',
          primaryText: 'Board-certified dentists. Book today.',
          cta: 'Book now',
        },
      ],
    },
  ],
  schedule: { startHint: 'clinic opening week', durationDays: 30 },
};

class StubAIManager implements AIManagerPort {
  public lastRequest?: AITaskRequest;
  constructor(private readonly output: unknown = CONTENT, private readonly fail = false) {}
  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    this.lastRequest = request;
    if (this.fail) throw new Error('engine unavailable');
    return {
      taskId: 'task-campaign-1',
      capability: request.capability,
      model: 'qwen3:32b',
      engine: 'ollama',
      output: this.output as T,
      usage: { promptTokens: 150, completionTokens: 300, totalTokens: 450 },
      latencyMs: 70,
      cached: false,
      attempts: [{ model: 'qwen3:32b', ok: true }],
    };
  }
  async *stream(): AsyncIterable<AIStreamChunk> {}
}

function wire(ai: AIManagerPort) {
  const bus = new InMemoryEventBus();
  const repo = new InMemoryCampaignDraftRepository();
  const service = new CampaignDraftService(repo, bus, ai);
  return { bus, repo, service };
}

const tctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

describe('CampaignDraftService', () => {
  it('drafts a structured, unlaunched campaign from brief + creative', async () => {
    await TenantContext.run(tctx, async () => {
      const ai = new StubAIManager();
      const { bus, service } = wire(ai);
      const seen: string[] = [];
      await bus.subscribe('campaign.>', async (e) => { seen.push(e.eventName); });

      const r = await service.draft(context);
      expect(r.isOk).toBe(true);
      const draft = r.unwrap();

      expect(ai.lastRequest?.capability).toBe('reasoning');
      expect(ai.lastRequest?.promptRef).toEqual({ key: 'campaign.draft', version: 1 });
      expect(draft.status).toBe('draft'); // never launched
      expect(draft.content.channels).toHaveLength(2);
      expect(draft.totalBudget.amountMinor).toBe(8_000_000);
      expect(draft.provenance).toMatchObject({ taskId: 'task-campaign-1', model: 'qwen3:32b', engine: 'ollama' });

      expect(await service.list('m1')).toHaveLength(1);
      expect(seen).toEqual(['campaign.created.v1']);
    });
  });

  it('fails cleanly when the AI Manager is unavailable', async () => {
    await TenantContext.run(tctx, async () => {
      const { service } = wire(new StubAIManager(CONTENT, true));
      expect((await service.draft(context)).isErr).toBe(true);
    });
  });

  it('rejects a malformed draft with no channels', async () => {
    await TenantContext.run(tctx, async () => {
      const { service } = wire(new StubAIManager({ name: 'x', objective: 'y', channels: [], schedule: { startHint: 'a', durationDays: 1 } }));
      expect((await service.draft(context)).isErr).toBe(true);
    });
  });
});
