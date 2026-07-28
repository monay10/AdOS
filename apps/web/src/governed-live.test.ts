import { describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { UnavailableError } from '@ados/kernel';
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

/** Engine whose behaviour depends on which model is asked, to drive the fallback
 * chain: it fails for the primary model and succeeds for the fallback. */
class PerModelEngine implements InferenceEnginePort {
  readonly id: InferenceEngineId = 'ollama';
  constructor(private readonly behaviour: (model: string) => string) {}
  async health(): Promise<{ ok: boolean }> {
    return { ok: true };
  }
  async complete(input: { model: string; messages: AIMessage[] }): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
    return { text: this.behaviour(input.model), promptTokens: 0, completionTokens: 0 };
  }
  async *stream(): AsyncIterable<never> {}
}

describe('Governed live runtime — resilience (Sprint 7: retry / recovery / fallback)', () => {
  it('falls back to the next routed model when the primary fails, recording both attempts', async () => {
    // reasoning override 'reasoner' is the primary; the default 'base' is the fallback.
    const engine = new PerModelEngine((model) => {
      if (model === 'reasoner') throw new Error('primary model unavailable'); // non-retryable → immediate fallback
      return '{"ok":true}';
    });
    const ai = createLiveGovernedManager(engine, { defaultModel: 'base', models: { reasoning: 'reasoner' } });

    const res = await run(() => ai.submit(req({ capability: 'reasoning' })));

    expect(res.output).toEqual({ ok: true }); // recovered — the mission did not fail
    expect(res.model).toBe('base'); // served by the fallback
    expect(res.attempts).toEqual([
      { model: 'reasoner', ok: false, error: expect.any(String), tries: 1 }, // non-retryable → one call, no retry
      { model: 'base', ok: true, tries: 1 },
    ]);
  });

  it('retries a transient (retryable) failure on the same model and recovers', async () => {
    let calls = 0;
    const engine = new PerModelEngine(() => {
      calls += 1;
      if (calls === 1) throw new UnavailableError('temporarily overloaded'); // retryable → same-model retry
      return '{"ok":true}';
    });
    const ai = createLiveGovernedManager(engine, { defaultModel: 'm' });

    const res = await run(() => ai.submit(req()));

    expect(res.output).toEqual({ ok: true });
    expect(calls).toBe(2); // failed once, retried once, succeeded
    // One model, recovered via retry — the tries count records the retry.
    expect(res.attempts).toEqual([{ model: 'm', ok: true, tries: 2 }]);
  });

  it('honors a configured maxRetries of 0 — a transient failure is not retried', async () => {
    let calls = 0;
    const engine = new PerModelEngine(() => {
      calls += 1;
      throw new UnavailableError('temporarily overloaded'); // retryable, but retries are disabled
    });
    const ai = createLiveGovernedManager(engine, { defaultModel: 'm', resilience: { maxRetries: 0 } });

    await expect(run(() => ai.submit(req()))).rejects.toThrow();
    expect(calls).toBe(1); // config honored — a single attempt, no retry (default would be 3)
  });
});
