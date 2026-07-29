/**
 * Operational metrics — the pure histogram core (Series 3 · Observability ·
 * Sprint 2, Performance).
 *
 * The design constraint (operator-set): this is NOT a second trace system. Raw
 * events never touch disk. Instead every latency sample is folded, at the moment
 * it is measured, into a fixed-bucket **histogram** — count / min / max / sum plus
 * a bounded bucket vector. From that summary we derive P50 / P95 / P99 by a
 * defined, explainable interpolation. So:
 *
 *   - The stored inputs (count, min, max, sum, buckets) are exactly measured.
 *   - The percentiles are *computed* from those inputs, not guessed — bounded by
 *     the bucket width, and honestly labelled as histogram estimates in the UI.
 *   - min and max are exact (not bucketed), so the tails are never understated.
 *
 * Histograms are additive: two histograms over the same fixed bounds merge by
 * summing their buckets. That property is what lets a per-minute summary roll up
 * into per-hour / per-day windows losslessly, and lets a dashboard window merge
 * many rows into one before reading a percentile.
 */

/**
 * Fixed latency histogram bucket upper-bounds, in milliseconds (a log-ish scale
 * spanning sub-ms stage checks up to multi-second local generation). A sample of
 * `ms` lands in the first bucket whose bound is `>= ms`; anything larger than the
 * last bound lands in the overflow bucket. Changing these bounds changes how new
 * samples are classified — treat them as a stable schema.
 */
export const LATENCY_BOUNDS_MS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000] as const;

/** The four latencies this sprint measures end-to-end. */
export const PERF_METRICS = ['planner_latency', 'governance_latency', 'queue_wait', 'worker_execution'] as const;
export type PerfMetric = (typeof PERF_METRICS)[number];

/**
 * A measured latency distribution over {@link LATENCY_BOUNDS_MS}. `buckets` has
 * one more entry than there are bounds: `buckets[i]` counts samples `<= BOUNDS[i]`,
 * and the final entry counts the overflow (`> last bound`). `min`/`max` are 0 when
 * `count` is 0.
 */
export interface Histogram {
  count: number;
  min: number;
  max: number;
  sum: number;
  buckets: number[];
}

/** A fresh, all-zero histogram sized to the fixed bounds. */
export function emptyHistogram(): Histogram {
  return { count: 0, min: 0, max: 0, sum: 0, buckets: new Array(LATENCY_BOUNDS_MS.length + 1).fill(0) };
}

/** The bucket index a value falls into (the overflow index for values above the last bound). */
function bucketIndex(ms: number): number {
  for (let i = 0; i < LATENCY_BOUNDS_MS.length; i += 1) {
    if (ms <= LATENCY_BOUNDS_MS[i]!) return i;
  }
  return LATENCY_BOUNDS_MS.length; // overflow
}

/** Fold one measured sample into `h` (mutates). Negative inputs are clamped to 0. */
export function observe(h: Histogram, ms: number): void {
  const v = ms < 0 ? 0 : ms;
  const bi = bucketIndex(v);
  h.buckets[bi] = (h.buckets[bi] ?? 0) + 1;
  h.min = h.count === 0 ? v : Math.min(h.min, v);
  h.max = h.count === 0 ? v : Math.max(h.max, v);
  h.sum += v;
  h.count += 1;
}

/** Merge `src` into `target` (mutates target). Both must share the fixed bounds. */
export function mergeInto(target: Histogram, src: Histogram): void {
  if (src.count === 0) return;
  target.min = target.count === 0 ? src.min : Math.min(target.min, src.min);
  target.max = target.count === 0 ? src.max : Math.max(target.max, src.max);
  target.sum += src.sum;
  target.count += src.count;
  for (let i = 0; i < target.buckets.length; i += 1) target.buckets[i] = (target.buckets[i] ?? 0) + (src.buckets[i] ?? 0);
}

/** Merge many histograms into a fresh one (additive; empty when the list is empty). */
export function mergeAll(hs: Histogram[]): Histogram {
  const out = emptyHistogram();
  for (const h of hs) mergeInto(out, h);
  return out;
}

/**
 * The p-th percentile (0..100) in ms, estimated from the histogram by linear
 * interpolation within the containing bucket. Exactly measured `min`/`max` clamp
 * the result so the estimate never falls outside the observed range. Returns 0
 * for an empty histogram.
 */
export function percentile(h: Histogram, p: number): number {
  if (h.count === 0) return 0;
  const target = (p / 100) * h.count;
  let cumBefore = 0;
  for (let i = 0; i < h.buckets.length; i += 1) {
    const c = h.buckets[i]!;
    if (c === 0) continue;
    if (cumBefore + c >= target) {
      const lower = i === 0 ? 0 : LATENCY_BOUNDS_MS[i - 1]!;
      // The overflow bucket has no fixed upper bound — use the exact observed max.
      const upper = i < LATENCY_BOUNDS_MS.length ? LATENCY_BOUNDS_MS[i]! : h.max;
      const within = (target - cumBefore) / c; // 0..1 into this bucket
      const value = lower + (upper - lower) * within;
      return Math.round(Math.min(Math.max(value, h.min), h.max));
    }
    cumBefore += c;
  }
  return h.max;
}

/** A rolled-up, human-facing view of a histogram: exact aggregates + estimated percentiles. */
export interface MetricSummary {
  count: number;
  min: number;
  max: number;
  mean: number;
  p50: number;
  p95: number;
  p99: number;
}

/** Summarize a histogram (exact count/min/max/mean; p50/p95/p99 from the buckets). */
export function summarize(h: Histogram): MetricSummary {
  return {
    count: h.count,
    min: h.count === 0 ? 0 : h.min,
    max: h.max,
    mean: h.count === 0 ? 0 : Math.round(h.sum / h.count),
    p50: percentile(h, 50),
    p95: percentile(h, 95),
    p99: percentile(h, 99),
  };
}
