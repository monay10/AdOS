import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import type { AIManagerPort, AIStreamChunk, AITaskRequest, AITaskResult } from '@ados/contracts';
import { InMemoryCreativeSetRepository } from './repository.js';
import { CreativeStudioService } from './service.js';
import type { CreativeContent, CreativeContext } from './creative-set.js';

const context: CreativeContext = {
  tenantId: 'acme',
  missionId: 'm1',
  clientId: 'c1',
  briefId: 'b1',
  productName: 'Whitening Treatment',
  brandVoice: 'warm and trustworthy',
  objective: 'Generate 120 qualified patient leads',
  targetAudience: 'Adults 25-45 valuing appearance',
  positioning: 'The trusted neighborhood clinic for a confident smile',
  keyMessages: ['Painless whitening', 'Same-day results'],
};

const CONTENT: CreativeContent = {
  headline: 'A Brighter Smile in One Visit',
  adCopy: 'Professional whitening from dentists you can trust. Book today.',
  cta: 'Book your appointment',
  socialPost: 'Say hello to your brightest smile ✨ Same-day whitening now available!',
  landingPage: {
    headline: 'Confident Smiles, Same Day',
    body: 'Our board-certified dentists deliver painless, professional whitening.',
    cta: 'Reserve your slot',
  },
  email: { subject: 'Your brighter smile is one visit away', body: 'Book your same-day whitening today.' },
};

class StubAIManager implements AIManagerPort {
  public lastRequest?: AITaskRequest;
  constructor(private readonly output: unknown = CONTENT, private readonly fail = false) {}
  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    this.lastRequest = request;
    if (this.fail) throw new Error('engine unavailable');
    return {
      taskId: 'task-creative-1',
      capability: request.capability,
      model: 'gemma3:27b',
      engine: 'ollama',
      output: this.output as T,
      usage: { promptTokens: 120, completionTokens: 260, totalTokens: 380 },
      latencyMs: 55,
      cached: false,
      attempts: [{ model: 'gemma3:27b', ok: true }],
    };
  }
  async *stream(): AsyncIterable<AIStreamChunk> {}
}

function wire(ai: AIManagerPort) {
  const bus = new InMemoryEventBus();
  const repo = new InMemoryCreativeSetRepository();
  const service = new CreativeStudioService(repo, bus, ai);
  return { bus, repo, service };
}

const tctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

describe('CreativeStudioService', () => {
  it('generates the full creative set from the brief context', async () => {
    await TenantContext.run(tctx, async () => {
      const ai = new StubAIManager();
      const { bus, service } = wire(ai);
      const seen: string[] = [];
      await bus.subscribe('creative.>', async (e) => { seen.push(e.eventName); });

      const r = await service.generate(context);
      expect(r.isOk).toBe(true);
      const set = r.unwrap();

      expect(ai.lastRequest?.capability).toBe('chat');
      expect(ai.lastRequest?.promptRef).toEqual({ key: 'creative.set', version: 1 });
      expect(set.content.headline).toBe(CONTENT.headline);
      expect(set.content.landingPage.cta).toBe('Reserve your slot');
      expect(set.content.email.subject).toContain('brighter smile');
      expect(set.provenance).toMatchObject({ taskId: 'task-creative-1', model: 'gemma3:27b', engine: 'ollama', capability: 'chat' });

      expect(await service.list('m1')).toHaveLength(1);
      expect(seen).toEqual(['creative.generated.v1']);
    });
  });

  it('fails cleanly when the AI Manager is unavailable', async () => {
    await TenantContext.run(tctx, async () => {
      const { service } = wire(new StubAIManager(CONTENT, true));
      expect((await service.generate(context)).isErr).toBe(true);
    });
  });

  it('rejects malformed AI output', async () => {
    await TenantContext.run(tctx, async () => {
      const { service } = wire(new StubAIManager({ headline: 'x', adCopy: 'y' }));
      expect((await service.generate(context)).isErr).toBe(true);
    });
  });
});
