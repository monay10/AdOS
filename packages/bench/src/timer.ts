import { performance } from 'node:perf_hooks';

export interface BenchResult {
  readonly name: string;
  readonly iterations: number;
  readonly totalMs: number;
  readonly opsPerSec: number;
  readonly meanMs: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
}

function percentile(sortedMs: number[], p: number): number {
  if (sortedMs.length === 0) return 0;
  const idx = Math.min(sortedMs.length - 1, Math.floor((p / 100) * sortedMs.length));
  return sortedMs[idx]!;
}

export function summarize(name: string, samplesMs: number[]): BenchResult {
  const total = samplesMs.reduce((a, b) => a + b, 0);
  const sorted = [...samplesMs].sort((a, b) => a - b);
  const n = samplesMs.length || 1;
  return {
    name,
    iterations: samplesMs.length,
    totalMs: round(total),
    opsPerSec: round((samplesMs.length / total) * 1000),
    meanMs: round(total / n),
    p50Ms: round(percentile(sorted, 50)),
    p95Ms: round(percentile(sorted, 95)),
  };
}

/** Time each of `iterations` invocations individually (gives p50/p95 latency). */
export async function timeEach(name: string, iterations: number, fn: (i: number) => Promise<void> | void): Promise<BenchResult> {
  const samples: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const t = performance.now();
    await fn(i);
    samples.push(performance.now() - t);
  }
  return summarize(name, samples);
}

/** Time a single block doing `count` units of work (gives throughput). */
export async function timeBlock(name: string, count: number, fn: () => Promise<void> | void): Promise<BenchResult> {
  const t = performance.now();
  await fn();
  const totalMs = performance.now() - t;
  const meanMs = totalMs / (count || 1);
  return { name, iterations: count, totalMs: round(totalMs), opsPerSec: round((count / totalMs) * 1000), meanMs: round(meanMs), p50Ms: round(meanMs), p95Ms: round(meanMs) };
}

export function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function renderTable(results: BenchResult[]): string {
  const head = 'scenario'.padEnd(34) + 'ops/s'.padStart(12) + 'mean ms'.padStart(12) + 'p95 ms'.padStart(12);
  const rows = results.map((r) => r.name.padEnd(34) + String(r.opsPerSec).padStart(12) + String(r.meanMs).padStart(12) + String(r.p95Ms).padStart(12));
  return [head, '─'.repeat(70), ...rows].join('\n');
}
