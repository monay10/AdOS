import { describe, expect, it } from 'vitest';
import type { AIMessage } from '@ados/contracts';
import { FakeInferenceEngine, approxTokens, hashEmbedding } from './fake-engine.js';

const messages: AIMessage[] = [{ role: 'user', content: 'hello world' }];

describe('FakeInferenceEngine', () => {
  it('completes deterministically with token accounting', async () => {
    const engine = new FakeInferenceEngine('ollama', () => 'a reply here');
    const r1 = await engine.complete({ model: 'qwen3:32b', messages });
    const r2 = await engine.complete({ model: 'qwen3:32b', messages });
    expect(r1.text).toBe('a reply here');
    expect(r1).toEqual(r2); // reproducible (Rule #8)
    expect(r1.completionTokens).toBe(approxTokens('a reply here'));
  });

  it('streams chunks ending with done', async () => {
    const engine = new FakeInferenceEngine('ollama', () => 'one two');
    const chunks = [];
    for await (const c of engine.stream({ model: 'm', messages })) chunks.push(c);
    expect(chunks.at(-1)!.done).toBe(true);
    expect(chunks.map((c) => c.delta).join('')).toBe('one two');
  });

  it('respects an aborted signal', async () => {
    const engine = new FakeInferenceEngine();
    const ac = new AbortController();
    ac.abort();
    await expect(engine.complete({ model: 'm', messages, signal: ac.signal })).rejects.toThrow();
  });

  it('reports health', async () => {
    expect((await new FakeInferenceEngine().health()).ok).toBe(true);
    expect((await new FakeInferenceEngine('ollama', undefined, { healthy: false }).health()).ok).toBe(false);
  });

  it('produces stable, unit-normalized embeddings', () => {
    const a = hashEmbedding('dental clinic', 8);
    const b = hashEmbedding('dental clinic', 8);
    expect(a).toEqual(b);
    const norm = Math.sqrt(a.reduce((s, x) => s + x * x, 0));
    expect(norm).toBeCloseTo(1);
  });
});
