import type { ExecutionTrace } from '@ados/ai-manager';

/**
 * Stage latency + execution timeline (Sprint 5, slice 3).
 *
 * Every sealed ExecutionTrace records each stage with a wall-clock timestamp, so
 * the time spent in each stage is the gap to the next stage's timestamp. Averaged
 * across traces this gives the per-stage latency AND the ordered execution
 * timeline of a task (plan → route → inference → safety → governance …).
 *
 * Honest note: on the offline/deterministic path the whole pipeline runs in well
 * under a millisecond, so these read near-zero — truthfully. The same computation
 * yields real numbers on the live (local-model) path where inference dominates.
 */

export interface StageTiming {
  name: string;
  meanMs: number;
  count: number;
}

/** Mean per-stage latency across traces, in trace (execution) order. */
export function stageLatency(traces: readonly ExecutionTrace[]): StageTiming[] {
  const sum = new Map<string, number>();
  const count = new Map<string, number>();

  for (const trace of traces) {
    const steps = trace.steps;
    for (let i = 0; i < steps.length - 1; i++) {
      const from = steps[i]!;
      const to = steps[i + 1]!;
      const ms = Date.parse(to.at) - Date.parse(from.at);
      if (Number.isNaN(ms) || ms < 0) continue;
      sum.set(from.name, (sum.get(from.name) ?? 0) + ms);
      count.set(from.name, (count.get(from.name) ?? 0) + 1);
    }
  }

  const timings: StageTiming[] = [];
  for (const [name, n] of count) {
    timings.push({ name, meanMs: Math.round(((sum.get(name) ?? 0) / n) * 10) / 10, count: n });
  }
  return timings;
}
