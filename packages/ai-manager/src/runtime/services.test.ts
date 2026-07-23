import { describe, expect, it, vi } from 'vitest';
import type { AIMessage, AITaskRequest, ExecutiveContextBuilderPort, PromptRegistryPort } from '@ados/contracts';
import { InMemoryEventBus } from '@ados/event-bus';
import type { ModelDescriptor } from '../ports.js';
import { DelegatingContextBuilder } from './context-builder.js';
import { InMemoryMonitoring, OfflineCostAnalyzer } from './monitoring.js';
import { InMemoryLearningEngine } from './learning.js';
import { BusEventPublisher } from './event-publisher.js';

describe('DelegatingContextBuilder', () => {
  it('maps the task request to an executive context request and appends messages', async () => {
    const captured: unknown[] = [];
    const executive: ExecutiveContextBuilderPort = {
      async build(req) {
        captured.push(req);
        return [{ role: 'system', content: '[CTX]' }] as AIMessage[];
      },
    };
    const builder = new DelegatingContextBuilder(executive, 'cmo');
    const request: AITaskRequest = {
      capability: 'chat',
      submittedBy: 'cmo-agent',
      promptRef: { key: 'cmo.system' },
      variables: { vertical: 'dental', brandId: 'b1' },
      messages: [{ role: 'user', content: 'draft copy' }],
    };
    const msgs = await builder.build(request);
    expect(captured[0]).toMatchObject({ role: 'cmo', promptKey: 'cmo.system', vertical: 'dental', brandId: 'b1' });
    expect(msgs.map((m) => m.content)).toEqual(['[CTX]', 'draft copy']);
  });
});

describe('InMemoryMonitoring + OfflineCostAnalyzer', () => {
  it('aggregates inference samples', () => {
    const mon = new InMemoryMonitoring();
    mon.recordInference({ model: 'qwen3:32b', engine: 'ollama', capability: 'chat', latencyMs: 100, promptTokens: 10, completionTokens: 20, cached: false, ok: true });
    mon.recordInference({ model: 'qwen3:32b', engine: 'ollama', capability: 'chat', latencyMs: 300, promptTokens: 5, completionTokens: 5, cached: true, ok: false });
    const s = mon.snapshot();
    expect(s.totalInferences).toBe(2);
    expect(s.failures).toBe(1);
    expect(s.cacheHits).toBe(1);
    expect(s.totalTokens).toBe(40);
    expect(s.avgLatencyMs).toBe(200);
    expect(s.perModel['qwen3:32b']!.count).toBe(2);
  });

  it('estimates offline compute cost (no dollars)', async () => {
    const cost = new OfflineCostAnalyzer();
    const model: ModelDescriptor = { id: 'q', engine: 'ollama', capabilities: ['chat'], vramGb: 24, contextWindow: 8192, priority: 90, enabled: true };
    const est = await cost.estimate({ capability: 'chat', submittedBy: 't', hints: { maxTokens: 500 } }, model);
    expect(est.gpuSeconds).toBeGreaterThan(0);
    expect(est.energyWh).toBeGreaterThan(0);
  });
});

describe('InMemoryLearningEngine', () => {
  it('suggests the best model and feeds prompt scores', async () => {
    const score = vi.fn(async () => {});
    const prompts = { score } as unknown as PromptRegistryPort;
    const learning = new InMemoryLearningEngine(prompts);
    await learning.observe({ promptKey: 'creative.image', model: 'qwen3:32b', reward: 0.9, metadata: { promptVersion: 14 } });
    await learning.observe({ promptKey: 'creative.image', model: 'gemma3:27b', reward: 0.2, metadata: { promptVersion: 27 } });
    const suggestion = await learning.suggest('creative.image');
    expect(suggestion?.model).toBe('qwen3:32b');
    expect(suggestion?.promptVersion).toBe(14);
    expect(score).toHaveBeenCalledWith('creative.image', 14, 0.9);
  });

  it('returns null when nothing has been observed', async () => {
    expect(await new InMemoryLearningEngine().suggest('unknown')).toBeNull();
  });
});

describe('BusEventPublisher', () => {
  it('publishes lifecycle events onto the bus', async () => {
    const bus = new InMemoryEventBus();
    const seen: string[] = [];
    await bus.subscribe('ai.>', async (e) => {
      seen.push(e.eventName);
    });
    const pub = new BusEventPublisher(bus, () => '2026-01-01T00:00:00.000Z');
    await pub.taskSubmitted('task-1', { capability: 'reasoning', submittedBy: 'ceo' });
    await pub.taskCompleted({ taskId: 'task-1', capability: 'reasoning', model: 'qwen3:32b', engine: 'ollama', output: {}, usage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 }, latencyMs: 50, cached: false, attempts: [] });
    expect(seen).toEqual(['ai.task.submitted.v1', 'ai.task.completed.v1']);
  });
});
