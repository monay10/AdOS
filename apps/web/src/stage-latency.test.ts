import { describe, expect, it } from 'vitest';
import type { ExecutionTrace } from '@ados/ai-manager';
import { stageLatency } from './stage-latency.js';

/** Build a minimal trace from (stage name, ISO timestamp) pairs. */
function trace(steps: Array<[string, string]>): ExecutionTrace {
  return {
    jobId: 'j',
    tools: [],
    contextRefs: [],
    evidence: [],
    eventsProduced: [],
    knowledgeEnriched: [],
    steps: steps.map(([name, at]) => ({ name, at })),
    startedAt: steps[0]?.[1] ?? 't',
  } as ExecutionTrace;
}

describe('stageLatency', () => {
  it('returns nothing for no traces', () => {
    expect(stageLatency([])).toEqual([]);
  });

  it('measures each stage as the gap to the next stage, in execution order', () => {
    const t = stageLatency([
      trace([
        ['plan', '2026-07-28T10:00:00.000Z'],
        ['route', '2026-07-28T10:00:00.020Z'], // plan took 20ms
        ['inference', '2026-07-28T10:00:00.520Z'], // route took 500ms
        ['completed', '2026-07-28T10:00:00.540Z'], // inference took 20ms
      ]),
    ]);
    expect(t).toEqual([
      { name: 'plan', meanMs: 20, count: 1 },
      { name: 'route', meanMs: 500, count: 1 },
      { name: 'inference', meanMs: 20, count: 1 },
    ]);
  });

  it('averages a stage across multiple traces', () => {
    const t = stageLatency([
      trace([
        ['plan', '2026-07-28T10:00:00.000Z'],
        ['route', '2026-07-28T10:00:00.100Z'], // 100ms
      ]),
      trace([
        ['plan', '2026-07-28T10:00:00.000Z'],
        ['route', '2026-07-28T10:00:00.300Z'], // 300ms
      ]),
    ]);
    expect(t).toEqual([{ name: 'plan', meanMs: 200, count: 2 }]); // (100+300)/2
  });

  it('skips unparseable or negative gaps rather than fabricating latency', () => {
    const t = stageLatency([
      trace([
        ['plan', 'not-a-date'],
        ['route', '2026-07-28T10:00:00.100Z'],
        ['inference', '2026-07-28T10:00:00.050Z'], // earlier than route → negative, skipped
      ]),
    ]);
    expect(t).toEqual([]); // plan gap NaN, route gap negative → nothing recorded
  });
});
