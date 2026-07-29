/**
 * Metrics recorder — the Measure → Aggregate → Persist-aggregate path (Series 3 ·
 * Observability · Sprint 2).
 *
 *   Request → observe(ms)      // in-memory fold, no I/O on the hot path
 *           → flush(now)       // persist the buffered histogram into all tiers
 *           → maintain(now)    // flush + prune each tier at its retention horizon
 *
 * `observe` never touches disk: it folds the sample into an in-memory per-metric
 * histogram. A periodic `maintain` (and a final flush on shutdown) persists those
 * buffers into the durable {@link MetricsStore}, then prunes. `snapshot` reads the
 * persisted tiers and merges the still-buffered samples in memory, so the
 * dashboard reflects live traffic without a write on every page view.
 *
 * The invariant that keeps counts exact: a metric's buffer holds only
 * not-yet-persisted samples; `flush` moves the buffer into the store and clears
 * it. So a snapshot = persisted rows + buffer never double-counts a sample.
 */
import { emptyHistogram, mergeAll, mergeInto, observe, summarize, PERF_METRICS, type Histogram, type MetricSummary, type PerfMetric } from './metrics.js';
import { bucketStart, TIER_MS, type MetricsStore, type MetricTier } from './metrics-store.js';

/** How long each tier is retained (ms). Coarser tiers are kept longer; growth stays bounded. */
export interface RetentionConfig {
  minute: number;
  hour: number;
  day: number;
}

/** Minute → 2h, hour → 14d, day → 400d. Enough recent resolution; bounded long-term size. */
export const DEFAULT_RETENTION: RetentionConfig = {
  minute: 2 * TIER_MS.hour,
  hour: 14 * TIER_MS.day,
  day: 400 * TIER_MS.day,
};

/** The dashboard windows, each read from the tier whose resolution fits it. */
const WINDOWS = [
  { key: 'lastHour', tier: 'minute' as MetricTier, span: TIER_MS.hour },
  { key: 'last24h', tier: 'hour' as MetricTier, span: 24 * TIER_MS.hour },
  { key: 'last30d', tier: 'day' as MetricTier, span: 30 * TIER_MS.day },
] as const;

/** Per-metric summaries across the three windows. */
export interface PerfMetricView {
  metric: PerfMetric;
  lastHour: MetricSummary;
  last24h: MetricSummary;
  last30d: MetricSummary;
}

/** A read-only performance snapshot: every number derived from measured, stored aggregates. */
export interface PerformanceSnapshot {
  generatedAt: string;
  metrics: PerfMetricView[];
}

/** The minimal surface the instrumented code paths depend on (keeps them decoupled + testable). */
export interface MetricsRecorderPort {
  observe(metric: PerfMetric, ms: number): void;
}

/** A do-nothing recorder — the default in code paths where no metrics store is wired. */
export const NOOP_RECORDER: MetricsRecorderPort = { observe() {} };

export class MetricsRecorder implements MetricsRecorderPort {
  private readonly buffers = new Map<PerfMetric, Histogram>();

  constructor(
    private readonly store: MetricsStore,
    private readonly retention: RetentionConfig = DEFAULT_RETENTION,
  ) {}

  /** Prepare the durable store (no-op for the in-memory one). */
  async init(): Promise<void> {
    if (this.store.init) await this.store.init();
  }

  /** Fold one measured latency into the in-memory buffer (no I/O). */
  observe(metric: PerfMetric, ms: number): void {
    let h = this.buffers.get(metric);
    if (!h) {
      h = emptyHistogram();
      this.buffers.set(metric, h);
    }
    observe(h, ms);
  }

  /**
   * Persist every buffered metric into all three tiers' current buckets, then
   * clear the buffers. Additive, so persisting into the same bucket across flushes
   * simply accumulates.
   */
  async flush(now: number): Promise<void> {
    for (const [metric, h] of this.buffers) {
      if (h.count === 0) continue;
      await this.store.record(metric, 'minute', bucketStart('minute', now), h);
      await this.store.record(metric, 'hour', bucketStart('hour', now), h);
      await this.store.record(metric, 'day', bucketStart('day', now), h);
    }
    this.buffers.clear();
  }

  /** Flush buffered samples, then prune each tier beyond its retention horizon. */
  async maintain(now: number): Promise<void> {
    await this.flush(now);
    await this.store.prune('minute', now - this.retention.minute);
    await this.store.prune('hour', now - this.retention.hour);
    await this.store.prune('day', now - this.retention.day);
  }

  /**
   * A read-only snapshot for the dashboard: for each metric and each window, merge
   * the persisted tier rows and the live (un-flushed) buffer, then summarize.
   * Reads only — never writes — so a page view has no persistence side effect.
   */
  async snapshot(now: number): Promise<PerformanceSnapshot> {
    const metrics: PerfMetricView[] = [];
    for (const metric of PERF_METRICS) {
      const buffered = this.buffers.get(metric);
      const windows: Partial<Record<'lastHour' | 'last24h' | 'last30d', MetricSummary>> = {};
      for (const w of WINDOWS) {
        const rows = await this.store.read(metric, w.tier, now - w.span, now + 1);
        const merged = mergeAll(rows.map((r) => r.hist));
        // The buffer holds current, not-yet-persisted samples — they belong to
        // every window that reaches "now", so fold them into each.
        if (buffered && buffered.count > 0) mergeInto(merged, buffered);
        windows[w.key] = summarize(merged);
      }
      metrics.push({
        metric,
        lastHour: windows.lastHour ?? summarize(emptyHistogram()),
        last24h: windows.last24h ?? summarize(emptyHistogram()),
        last30d: windows.last30d ?? summarize(emptyHistogram()),
      });
    }
    return { generatedAt: new Date(now).toISOString(), metrics };
  }

  /** Wipe all operational metrics (buffers + durable store). Business data untouched. */
  async clear(): Promise<void> {
    this.buffers.clear();
    await this.store.clearAll();
  }
}
