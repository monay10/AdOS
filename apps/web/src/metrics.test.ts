import { describe, expect, it } from 'vitest';
import {
  emptyHistogram,
  LATENCY_BOUNDS_MS,
  mergeAll,
  mergeInto,
  observe,
  percentile,
  summarize,
  type Histogram,
} from './metrics.js';

function of(samples: number[]): Histogram {
  const h = emptyHistogram();
  for (const s of samples) observe(h, s);
  return h;
}

describe('histogram', () => {
  it('an empty histogram summarizes to all zeros (never a fabricated number)', () => {
    expect(summarize(emptyHistogram())).toEqual({ count: 0, min: 0, max: 0, mean: 0, p50: 0, p95: 0, p99: 0 });
  });

  it('records exact count, min, max, mean; clamps negatives to 0', () => {
    const h = of([10, 20, 30, -5]);
    const s = summarize(h);
    expect(s.count).toBe(4);
    expect(s.min).toBe(0); // the -5 clamped
    expect(s.max).toBe(30);
    expect(s.mean).toBe(Math.round((10 + 20 + 30 + 0) / 4)); // 15
  });

  it('has one more bucket than bounds (the overflow bucket) and counts big samples there', () => {
    const h = of([1_000_000]);
    expect(h.buckets).toHaveLength(LATENCY_BOUNDS_MS.length + 1);
    expect(h.buckets[LATENCY_BOUNDS_MS.length]).toBe(1); // overflow bucket
    expect(h.max).toBe(1_000_000);
  });

  it('percentiles fall within [min,max] and track the distribution', () => {
    // 100 samples: ninety at ~10ms, ten at ~1000ms → p50 low, p95/p99 high.
    const h = of([...Array(90).fill(10), ...Array(10).fill(1000)]);
    const s = summarize(h);
    expect(s.p50).toBeLessThanOrEqual(25);
    expect(s.p95).toBeGreaterThan(100);
    expect(s.p99).toBeGreaterThan(100);
    expect(s.p50).toBeGreaterThanOrEqual(s.min);
    expect(s.p99).toBeLessThanOrEqual(s.max);
  });

  it('a single-sample histogram reports that value for every percentile (clamped to max)', () => {
    const s = summarize(of([42]));
    expect(s.p50).toBe(42);
    expect(s.p95).toBe(42);
    expect(s.p99).toBe(42);
  });

  it('is additive: merged histograms equal one built from all samples combined', () => {
    const a = of([5, 15, 25]);
    const b = of([35, 45, 5000]);
    const merged = mergeAll([a, b]);
    const combined = of([5, 15, 25, 35, 45, 5000]);
    expect(merged.count).toBe(combined.count);
    expect(merged.sum).toBe(combined.sum);
    expect(merged.min).toBe(combined.min);
    expect(merged.max).toBe(combined.max);
    expect(merged.buckets).toEqual(combined.buckets);
  });

  it('merging an empty histogram is a no-op', () => {
    const a = of([10, 20]);
    const before = JSON.parse(JSON.stringify(a));
    mergeInto(a, emptyHistogram());
    expect(a).toEqual(before);
  });

  it('percentile of an empty histogram is 0, not NaN', () => {
    expect(percentile(emptyHistogram(), 95)).toBe(0);
  });
});
