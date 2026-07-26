import { describe, expect, it } from 'vitest';
import type { AIMessage } from '@ados/contracts';
import { FakeInferenceEngine } from '@ados/ai-manager';
import { LiveAIManager } from './ai-live.js';

const BRIEF = {
  objective: 'Generate 100 leads',
  targetAudience: 'Adults 25-45',
  positioning: 'The trusted local clinic',
  keyMessages: ['Fast', 'Painless'],
  recommendedChannels: ['meta'],
  budgetAllocation: [{ channel: 'meta', percentage: 100 }],
  kpis: [{ name: 'leads', target: 100, unit: 'count' }],
};

describe('LiveAIManager (local engine)', () => {
  it('parses a clean JSON reply into structured output with real provenance', async () => {
    const engine = new FakeInferenceEngine('ollama', () => JSON.stringify(BRIEF));
    const ai = new LiveAIManager(engine, { defaultModel: 'qwen2.5:7b' });

    const res = await ai.submit({
      capability: 'reasoning',
      submittedBy: 'test',
      promptRef: { key: 'marketing.brief', version: 1 },
      variables: { clientName: 'Acme' },
      responseSchema: { type: 'object' },
    });

    expect(res.output).toEqual(BRIEF);
    expect(res.model).toBe('qwen2.5:7b');
    expect(res.engine).toBe('ollama');
    expect(res.attempts).toEqual([{ model: 'qwen2.5:7b', ok: true }]);
    expect(res.usage.totalTokens).toBeGreaterThan(0);
  });

  it('strips markdown fences and surrounding prose from the reply', async () => {
    const reply = 'Sure, here you go:\n```json\n' + JSON.stringify(BRIEF) + '\n```\nHope that helps!';
    const engine = new FakeInferenceEngine('ollama', () => reply);
    const ai = new LiveAIManager(engine, { defaultModel: 'm' });

    const res = await ai.submit({ capability: 'reasoning', submittedBy: 't', responseSchema: { type: 'object' } });
    expect(res.output).toEqual(BRIEF);
  });

  it('retries once (self-repair) when the first reply is not JSON, then succeeds', async () => {
    let call = 0;
    const engine = new FakeInferenceEngine('ollama', () => (call++ === 0 ? 'I cannot do that.' : JSON.stringify(BRIEF)));
    const ai = new LiveAIManager(engine, { defaultModel: 'm' });

    const res = await ai.submit({ capability: 'reasoning', submittedBy: 't', responseSchema: { type: 'object' } });
    expect(res.output).toEqual(BRIEF);
    expect(res.attempts).toHaveLength(2);
    expect(res.attempts[0]!.ok).toBe(false);
    expect(res.attempts[1]!.ok).toBe(true);
  });

  it('throws after repair also fails, so the caller surfaces UnavailableError', async () => {
    const engine = new FakeInferenceEngine('ollama', () => 'never json');
    const ai = new LiveAIManager(engine, { defaultModel: 'm' });

    await expect(ai.submit({ capability: 'reasoning', submittedBy: 't' })).rejects.toThrow(/valid JSON/);
  });

  it('instructs the model to answer in the resolved language', async () => {
    let systemPrompt = '';
    const engine = new FakeInferenceEngine('ollama', (msgs: AIMessage[]) => {
      systemPrompt = msgs.find((m) => m.role === 'system')?.content ?? '';
      return JSON.stringify(BRIEF);
    });
    const ai = new LiveAIManager(engine, { defaultModel: 'm', resolveLanguage: () => 'Turkish' });

    await ai.submit({ capability: 'reasoning', submittedBy: 't', responseSchema: { type: 'object' } });
    expect(systemPrompt).toContain('Turkish');
  });

  it('honours per-capability model overrides and preferModel hints', async () => {
    const seen: string[] = [];
    const engine = new FakeInferenceEngine('ollama', (_m: AIMessage[], model: string) => {
      seen.push(model);
      return JSON.stringify(BRIEF);
    });
    const ai = new LiveAIManager(engine, { defaultModel: 'base', models: { code: 'coder:7b' } });

    await ai.submit({ capability: 'code', submittedBy: 't', responseSchema: { type: 'object' } });
    await ai.submit({ capability: 'reasoning', submittedBy: 't', hints: { preferModel: 'big:70b' }, responseSchema: { type: 'object' } });

    expect(seen).toEqual(['coder:7b', 'big:70b']);
  });
});
