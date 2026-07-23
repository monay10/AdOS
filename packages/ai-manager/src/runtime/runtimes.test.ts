import { describe, expect, it } from 'vitest';
import type { AITaskGraph, AITaskResult, CapabilityInvocation, CapabilityRegistryPort } from '@ados/contracts';
import type { InferenceEngineId, InferenceEnginePort } from '../ports.js';
import { InMemoryQueueManager, TopologicalTaskGraph } from './queue-manager.js';
import { InMemoryMemoryRegistry, SessionWorkingMemory } from './memory-runtime.js';
import { CapabilityCache, CapabilityChain, stableHash } from './capability-runtime.js';
import { ModelHealthMonitor } from './model-health.js';
import { InMemoryModelRegistry } from '../model-registry.js';

describe('Queue Manager', () => {
  it('enqueues FIFO and reports depth', async () => {
    const q = new InMemoryQueueManager();
    await q.enqueue({ capability: 'chat', submittedBy: 'a', idempotencyKey: 't1' });
    await q.enqueue({ capability: 'chat', submittedBy: 'b', idempotencyKey: 't2' });
    expect(await q.depth()).toBe(2);
    expect(q.dequeue()!.taskId).toBe('t1');
    expect(await q.depth()).toBe(1);
  });
});

describe('Task Graph', () => {
  const graph: AITaskGraph = {
    id: 'g', sessionId: 's',
    nodes: [
      { id: 'research', capability: 'competitor.analysis', input: {}, dependsOn: [] },
      { id: 'persona', capability: 'brand.analysis', input: {}, dependsOn: ['research'] },
      { id: 'creative', capability: 'creative.image', input: {}, dependsOn: ['persona'] },
    ],
  };
  it('returns a topological order for a valid DAG', () => {
    const r = new TopologicalTaskGraph().validate(graph);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.order).toEqual(['research', 'persona', 'creative']);
  });
  it('detects a cycle', () => {
    const cyclic: AITaskGraph = { id: 'g', sessionId: 's', nodes: [
      { id: 'a', capability: 'chat', input: {}, dependsOn: ['b'] },
      { id: 'b', capability: 'chat', input: {}, dependsOn: ['a'] },
    ] };
    const r = new TopologicalTaskGraph().validate(cyclic);
    expect(r.ok).toBe(false);
  });
});

describe('Memory Runtime', () => {
  it('recalls tenant/owner-scoped memory by relevance', async () => {
    const mem = new InMemoryMemoryRegistry(() => '2026-01-01T00:00:00.000Z');
    await mem.remember({ scope: 'campaign', ownerId: 'c1', content: 'dental hook worked well' });
    await mem.remember({ scope: 'campaign', ownerId: 'c1', content: 'restaurant video' });
    const hits = await mem.recall({ scope: 'campaign', ownerId: 'c1', query: 'dental', k: 1 });
    expect(hits[0]!.content).toContain('dental');
  });

  it('working memory is bounded per session', () => {
    const wm = new SessionWorkingMemory(2);
    wm.note('s', 'a'); wm.note('s', 'b'); wm.note('s', 'c');
    expect(wm.read('s')).toEqual(['b', 'c']);
  });
});

describe('Capability Runtime', () => {
  it('caches by capability + input', () => {
    const cache = new CapabilityCache();
    const inv: CapabilityInvocation = { capability: 'seo.analysis', submittedBy: 't', input: { url: 'x' } };
    const result = { taskId: 'r1' } as AITaskResult;
    expect(cache.get(inv)).toBeUndefined();
    cache.set(inv, result);
    expect(cache.get({ ...inv, input: { url: 'x' } })).toBe(result); // same input ⇒ hit
    expect(stableHash({ a: 1, b: 2 })).toBe(stableHash({ b: 2, a: 1 })); // order-independent
  });

  it('chains capabilities threading previous output', async () => {
    const calls: CapabilityInvocation[] = [];
    const registry = {
      invoke: async (inv: CapabilityInvocation) => {
        calls.push(inv);
        return { taskId: inv.capability, output: `out:${inv.capability}` } as AITaskResult;
      },
    } as unknown as CapabilityRegistryPort;
    const results = await new CapabilityChain(registry).run([
      { capability: 'competitor.analysis', submittedBy: 't', input: {} },
      { capability: 'copywriting', submittedBy: 't', input: {} },
    ]);
    expect(results).toHaveLength(2);
    expect((calls[1]!.input as { previous: string }).previous).toBe('out:competitor.analysis');
  });
});

describe('Model Health Monitor', () => {
  function engine(id: InferenceEngineId, ok: boolean): InferenceEnginePort {
    return { id, async health() { return { ok }; }, async complete() { return { text: '', promptTokens: 0, completionTokens: 0 }; }, async *stream() {} };
  }
  it('disables models whose engine is down and records benchmarks', async () => {
    const registry = new InMemoryModelRegistry();
    const monitor = new ModelHealthMonitor(registry, new Map([['ollama', engine('ollama', false)], ['comfyui', engine('comfyui', true)]]));
    monitor.benchmark('qwen3:32b', 500);
    const report = await monitor.check();
    const qwen = report.find((r) => r.modelId === 'qwen3:32b')!;
    expect(qwen.available).toBe(false);
    expect(registry.get('qwen3:32b')!.enabled).toBe(false); // reconciled
    expect(qwen.avgLatencyMs).toBe(500);
    // comfyui healthy ⇒ flux stays available
    expect(report.find((r) => r.modelId === 'flux')!.available).toBe(true);
  });
});
