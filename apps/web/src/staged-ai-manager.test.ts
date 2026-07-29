import { describe, expect, it } from 'vitest';
import type { AIManagerPort, AITaskRequest, AITaskResult } from '@ados/contracts';
import { StagedAIManager } from './staged-ai-manager.js';
import { InMemoryExecutionTraceStore } from './execution-trace-store.js';
import type { StageEngine } from './stage-engine.js';
import type { PerfMetric } from './metrics.js';

// A stage engine that runs no stages — this test isolates the metrics wiring, not
// the (separately tested) stage behaviour.
const noopEngine = { runPre: async () => {}, runPost: async () => {} } as unknown as StageEngine;

function innerReturning(): AIManagerPort {
  return {
    async submit<T>() {
      return {
        output: {} as T,
        model: 'stub',
        engine: 'offline',
        attempts: 1,
        usage: { inputTokens: 0, outputTokens: 0 },
        latencyMs: 1,
        cached: false,
      } as unknown as AITaskResult<T>;
    },
    stream() {
      throw new Error('unused');
    },
  } as unknown as AIManagerPort;
}

describe('StagedAIManager — metrics wiring', () => {
  it('records planner_latency (generation) and governance_latency (stages) on success', async () => {
    const observed: PerfMetric[] = [];
    const mgr = new StagedAIManager(innerReturning(), new InMemoryExecutionTraceStore(), noopEngine, undefined, {
      observe: (m) => observed.push(m),
    });
    await mgr.submit({ capability: 'brief.generate' } as unknown as AITaskRequest);
    expect(observed).toContain('planner_latency');
    expect(observed).toContain('governance_latency');
  });

  it('records nothing when generation throws (failure metrics are a later sprint)', async () => {
    const inner = {
      async submit() {
        throw new Error('AI unavailable');
      },
      stream() {
        throw new Error('unused');
      },
    } as unknown as AIManagerPort;
    const observed: PerfMetric[] = [];
    const mgr = new StagedAIManager(inner, new InMemoryExecutionTraceStore(), noopEngine, undefined, {
      observe: (m) => observed.push(m),
    });
    await expect(mgr.submit({ capability: 'brief.generate' } as unknown as AITaskRequest)).rejects.toThrow('AI unavailable');
    expect(observed).toEqual([]);
  });
});
