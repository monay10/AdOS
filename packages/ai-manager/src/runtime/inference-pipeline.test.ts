import { describe, expect, it } from 'vitest';
import { UnavailableError } from '@ados/kernel';
import type { AIMessage, AIStreamChunk } from '@ados/contracts';
import type { InferenceEngineId, InferenceEnginePort, ModelDescriptor, RoutingDecision } from '../ports.js';
import { InferencePipeline } from './inference-pipeline.js';
import { InMemoryResourceScheduler } from './resource-scheduler.js';

const messages: AIMessage[] = [{ role: 'user', content: 'hi' }];

function model(id: string, engine: InferenceEngineId, vramGb = 0): ModelDescriptor {
  return { id, engine, capabilities: ['chat'], vramGb, contextWindow: 8192, priority: 50, enabled: true };
}

/** Scriptable engine: each call shifts a behavior off the queue. */
function engine(id: InferenceEngineId, behaviors: Array<'ok' | 'fail' | 'flaky'>): InferenceEnginePort {
  let i = 0;
  return {
    id,
    async health() {
      return { ok: true };
    },
    async complete() {
      const b = behaviors[Math.min(i++, behaviors.length - 1)];
      if (b === 'fail') throw new UnavailableError('down'); // retryable
      if (b === 'flaky' && i === 1) throw new UnavailableError('blip');
      return { text: `from ${id}`, promptTokens: 1, completionTokens: 2 };
    },
    async *stream(): AsyncIterable<AIStreamChunk> {
      yield { taskId: id, delta: `from ${id}`, done: true };
    },
  };
}

const fitAll = new InMemoryResourceScheduler({ gpu: true, vramTotalGb: 100, ramTotalGb: 64, cpuCores: 8, maxModelVramGb: 100 }, 4);
const noSleep = { sleep: async () => {}, now: () => 0 };

describe('InferencePipeline', () => {
  it('returns the primary result when it succeeds', async () => {
    const engines = new Map([['ollama' as const, engine('ollama', ['ok'])]]);
    const pipe = new InferencePipeline(engines, fitAll, noSleep);
    const decision: RoutingDecision = { primary: model('a', 'ollama'), fallbacks: [] };
    const out = await pipe.run(decision, messages);
    expect(out.model).toBe('a');
    expect(out.attempts).toEqual([{ model: 'a', ok: true, tries: 1 }]);
  });

  it('retries transient failures then succeeds (flaky)', async () => {
    const engines = new Map([['ollama' as const, engine('ollama', ['flaky', 'ok'])]]);
    const pipe = new InferencePipeline(engines, fitAll, noSleep);
    const out = await pipe.run({ primary: model('a', 'ollama'), fallbacks: [] }, messages);
    expect(out.text).toBe('from ollama');
    expect(out.attempts).toEqual([{ model: 'a', ok: true, tries: 2 }]); // one retry recorded
  });

  it('falls back to the next model when the primary keeps failing', async () => {
    const engines = new Map<InferenceEngineId, InferenceEnginePort>([
      ['ollama', engine('ollama', ['fail', 'fail', 'fail'])],
      ['vllm', engine('vllm', ['ok'])],
    ]);
    const pipe = new InferencePipeline(engines, fitAll, { ...noSleep, maxRetries: 1 });
    const out = await pipe.run({ primary: model('a', 'ollama'), fallbacks: [model('b', 'vllm')] }, messages);
    expect(out.model).toBe('b');
    expect(out.attempts).toEqual([{ model: 'a', ok: false, error: 'down', tries: 2 }, { model: 'b', ok: true, tries: 1 }]);
  });

  it('skips a model that does not fit the machine', async () => {
    const tiny = new InMemoryResourceScheduler({ gpu: false, vramTotalGb: 0, ramTotalGb: 8, cpuCores: 4, maxModelVramGb: 8 }, 2);
    const engines = new Map<InferenceEngineId, InferenceEnginePort>([['ollama', engine('ollama', ['ok'])]]);
    const pipe = new InferencePipeline(engines, tiny, noSleep);
    const out = await pipe.run({ primary: model('big', 'ollama', 24), fallbacks: [model('small', 'ollama', 4)] }, messages);
    expect(out.model).toBe('small');
    expect(out.attempts[0]).toEqual({ model: 'big', ok: false, error: 'does_not_fit', tries: 0 });
  });

  it('throws when every model fails', async () => {
    const engines = new Map([['ollama' as const, engine('ollama', ['fail', 'fail', 'fail'])]]);
    const pipe = new InferencePipeline(engines, fitAll, { ...noSleep, maxRetries: 0 });
    await expect(pipe.run({ primary: model('a', 'ollama'), fallbacks: [] }, messages)).rejects.toThrow(UnavailableError);
  });

  it('streams from the first fitting model', async () => {
    const engines = new Map([['ollama' as const, engine('ollama', ['ok'])]]);
    const pipe = new InferencePipeline(engines, fitAll, noSleep);
    const chunks: string[] = [];
    for await (const c of pipe.stream({ primary: model('a', 'ollama'), fallbacks: [] }, messages)) chunks.push(c.delta);
    expect(chunks.join('')).toBe('from ollama');
  });
});
