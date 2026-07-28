import { describe, expect, it } from 'vitest';
import type { ExecutionTrace } from '@ados/ai-manager';
import { resilienceStats } from './resilience-stats.js';

type Attempt = { model: string; ok: boolean; error?: string; tries?: number };

/** A trace whose inference step carries the given attempts (a successful task). */
function inferTrace(attempts: Attempt[]): ExecutionTrace {
  return {
    jobId: 'j',
    tools: [],
    contextRefs: [],
    evidence: [],
    eventsProduced: [],
    knowledgeEnriched: [],
    steps: [{ name: 'inference', at: 't', detail: { attempts } }],
    startedAt: 't',
  } as ExecutionTrace;
}

/** A trace that failed outright (a `failed` step, no inference). */
function failedTrace(): ExecutionTrace {
  return {
    jobId: 'j',
    tools: [],
    contextRefs: [],
    evidence: [],
    eventsProduced: [],
    knowledgeEnriched: [],
    steps: [{ name: 'failed', at: 't', detail: { error: 'All routed models failed' } }],
    startedAt: 't',
  } as ExecutionTrace;
}

describe('resilienceStats', () => {
  it('returns zeros for no traces', () => {
    expect(resilienceStats([])).toEqual({
      aiTasks: 0,
      cleanFirstTry: 0,
      recoveredViaFallback: 0,
      failed: 0,
      retriedTasks: 0,
      totalRetries: 0,
      fallbackRatePct: 0,
      retryRatePct: 0,
      failureRatePct: 0,
      modelHealth: [],
    });
  });

  it('counts a clean first-try inference', () => {
    const r = resilienceStats([inferTrace([{ model: 'qwen', ok: true }])]);
    expect(r.aiTasks).toBe(1);
    expect(r.cleanFirstTry).toBe(1);
    expect(r.recoveredViaFallback).toBe(0);
    expect(r.fallbackRatePct).toBe(0);
    expect(r.modelHealth).toEqual([{ model: 'qwen', attempts: 1, failures: 0 }]);
  });

  it('counts a fallback recovery and tallies the failed primary', () => {
    const r = resilienceStats([
      inferTrace([
        { model: 'primary', ok: false, error: 'boom' },
        { model: 'fallback', ok: true },
      ]),
    ]);
    expect(r.recoveredViaFallback).toBe(1);
    expect(r.cleanFirstTry).toBe(0);
    expect(r.fallbackRatePct).toBe(100); // 1 of 1 successful inferences fell back
    expect(r.modelHealth).toEqual([
      { model: 'primary', attempts: 1, failures: 1 }, // least healthy first
      { model: 'fallback', attempts: 1, failures: 0 },
    ]);
  });

  it('counts outright failures and computes the failure rate', () => {
    const r = resilienceStats([
      inferTrace([{ model: 'm', ok: true }]),
      inferTrace([{ model: 'm', ok: true }]),
      inferTrace([{ model: 'm', ok: true }]),
      failedTrace(),
    ]);
    expect(r.aiTasks).toBe(4);
    expect(r.cleanFirstTry).toBe(3);
    expect(r.failed).toBe(1);
    expect(r.failureRatePct).toBe(25); // 1 of 4
    expect(r.fallbackRatePct).toBe(0); // none of the 3 successes fell back
  });

  it('counts retries from the per-model tries count', () => {
    const r = resilienceStats([
      inferTrace([{ model: 'm', ok: true, tries: 3 }]), // 2 retries before success
      inferTrace([{ model: 'm', ok: true, tries: 1 }]), // clean
      inferTrace([
        { model: 'a', ok: false, tries: 2, error: 'x' }, // retried then gave up → fell back
        { model: 'b', ok: true, tries: 1 },
      ]),
    ]);
    expect(r.aiTasks).toBe(3);
    expect(r.retriedTasks).toBe(2); // first task + the fallback task both retried a model
    expect(r.totalRetries).toBe(3); // (3-1) + 0 + (2-1) + 0
    expect(r.retryRatePct).toBe(66.7); // 2 of 3
  });

  it('treats a missing tries as a single try (no retry)', () => {
    const r = resilienceStats([inferTrace([{ model: 'm', ok: true }])]);
    expect(r.retriedTasks).toBe(0);
    expect(r.totalRetries).toBe(0);
  });

  it('aggregates model health across traces, least healthy first', () => {
    const r = resilienceStats([
      inferTrace([
        { model: 'flaky', ok: false, error: 'x' },
        { model: 'solid', ok: true },
      ]),
      inferTrace([
        { model: 'flaky', ok: false, error: 'x' },
        { model: 'solid', ok: true },
      ]),
    ]);
    expect(r.modelHealth).toEqual([
      { model: 'flaky', attempts: 2, failures: 2 },
      { model: 'solid', attempts: 2, failures: 0 },
    ]);
  });
});
