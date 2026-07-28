import { describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import type { AIMessage, AITaskRequest } from '@ados/contracts';
import type { InferenceEngineId, InferenceEnginePort } from '@ados/ai-manager';
import { createLiveGovernedManager } from './governed-inference.js';

/**
 * The LIVE (local-model) path has no model server in CI, so we drive the governed
 * live runtime with an in-process fake engine — proving the composed path
 * (prompt build → routing → resilient pipeline → format → validate/repair)
 * behaves like the former LiveAIManager, plus the added schema-repair loop.
 */
class FakeEngine implements InferenceEnginePort {
  readonly id: InferenceEngineId = 'ollama';
  lastMessages: AIMessage[] = [];
  lastModel = '';
  calls = 0;
  constructor(private readonly reply: (call: number) => string) {}
  async health(): Promise<{ ok: boolean }> {
    return { ok: true };
  }
  async complete(input: { model: string; messages: AIMessage[] }): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
    this.calls += 1;
    this.lastMessages = input.messages;
    this.lastModel = input.model;
    return { text: this.reply(this.calls), promptTokens: 0, completionTokens: 0 };
  }
  async *stream(): AsyncIterable<never> {}
}

const req = (over: Partial<AITaskRequest> = {}): AITaskRequest => ({
  capability: 'reasoning',
  submittedBy: 'test',
  promptRef: { key: 'marketing.brief', version: 1 },
  variables: { productName: 'Whitening', clientName: 'Acme' },
  responseSchema: { type: 'object', required: ['ok'], properties: { ok: { type: 'boolean' } } },
  ...over,
});

const run = <T>(fn: () => Promise<T>): Promise<T> =>
  TenantContext.run({ tenantId: 'acme', correlationId: 'c', actor: 'x', roles: [] } as RequestContext, fn);

describe('Governed live runtime (Sprint 4.4b — live path on the governed pipeline)', () => {
  it('reproduces the live prompt, routes to the configured model, returns extracted JSON', async () => {
    const engine = new FakeEngine(() => '{"ok":true}');
    const ai = createLiveGovernedManager(engine, { defaultModel: 'qwen2.5:7b' });

    const res = await run(() => ai.submit(req()));

    expect(res.output).toEqual({ ok: true });
    expect(res.model).toBe('qwen2.5:7b'); // routed to the configured default
    expect(res.engine).toBe('ollama');
    // The prompt is the exact buildMessages output: prompt-specific system role + variables block.
    const system = engine.lastMessages.find((m) => m.role === 'system')!.content;
    expect(system).toContain('marketing strategist'); // ROLES['marketing.brief']
    const user = engine.lastMessages.find((m) => m.role === 'user')!.content;
    expect(user).toContain('Whitening'); // request variable carried into the prompt
  });

  it('honors per-capability model overrides via the router', async () => {
    const engine = new FakeEngine(() => '{"ok":true}');
    const ai = createLiveGovernedManager(engine, { defaultModel: 'base', models: { reasoning: 'reasoner:32b' } });

    const res = await run(() => ai.submit(req({ capability: 'reasoning' })));

    expect(res.model).toBe('reasoner:32b');
    expect(engine.lastModel).toBe('reasoner:32b');
  });

  it('runs the schema validate/repair loop: bad JSON first, valid on the repair turn', async () => {
    const engine = new FakeEngine((call) => (call === 1 ? 'sorry, here you go' : '{"ok":true}'));
    const ai = createLiveGovernedManager(engine, { defaultModel: 'm' });

    const res = await run(() => ai.submit(req()));

    expect(res.output).toEqual({ ok: true });
    expect(engine.calls).toBe(2); // first output was not JSON → one repair turn recovered it
  });

  it('carries the resolved answer language into the prompt', async () => {
    const engine = new FakeEngine(() => '{"ok":true}');
    const ai = createLiveGovernedManager(engine, { defaultModel: 'm', resolveLanguage: () => 'Turkish' });

    await run(() => ai.submit(req()));

    const system = engine.lastMessages.find((m) => m.role === 'system')!.content;
    expect(system).toContain('Turkish');
  });
});
