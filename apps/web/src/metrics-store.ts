/**
 * Metrics store — the durable home for *aggregated* operational metrics (Series 3
 * · Observability · Sprint 2).
 *
 * Two operator-set principles shape this store:
 *
 *   1. **Aggregate, never raw.** Rows are time-bucketed histograms
 *      (`metric × tier × bucket_start → count/min/max/sum/buckets`), not events.
 *      No request id, trace id, payload, or per-user latency is ever stored.
 *      Growth is bounded by retention, not by traffic.
 *
 *   2. **Operational metrics are not business data.** In production this store
 *      lives in a *separate* SQLite file from the Company Brain / Decision Journal
 *      / Queue / Backup (see `main.ts`). It can be deleted wholesale — {@link
 *      MetricsStore.clearAll} — without touching any business data, and it is
 *      never part of a Brain backup.
 *
 * Three tiers hold the same samples at three resolutions so a dashboard can show
 * "last hour" (minute tier), "last 24h" (hour tier) and "last 30 days" (day tier)
 * while each tier is pruned at its own horizon. Because histograms are additive,
 * a sample is simply folded into all three tiers' current buckets at flush time —
 * there is no lossy roll-up step and no double-counting.
 */
import type { QueryExecutor } from '@ados/persistence';
import { emptyHistogram, mergeInto, type Histogram, type PerfMetric } from './metrics.js';

/** Aggregation resolutions, coarsest window last. */
export type MetricTier = 'minute' | 'hour' | 'day';

/** The wall-clock span of one bucket in each tier (ms). */
export const TIER_MS: Record<MetricTier, number> = { minute: 60_000, hour: 3_600_000, day: 86_400_000 };

/** Floor `nowMs` to the start of its bucket in `tier`. */
export function bucketStart(tier: MetricTier, nowMs: number): number {
  const span = TIER_MS[tier];
  return Math.floor(nowMs / span) * span;
}

/** One stored aggregate row: a histogram for `metric` over `[bucketStart, bucketStart+TIER_MS[tier])`. */
export interface MetricRow {
  metric: PerfMetric;
  tier: MetricTier;
  bucketStart: number;
  hist: Histogram;
}

/**
 * The durable-aggregate port. Async so the in-memory and SQLite implementations
 * are interchangeable (the SQLite one is the production, local-file store).
 */
export interface MetricsStore {
  /** Create the backing table if needed (SQL impl only). */
  init?(): Promise<void>;
  /** Fold `hist` into the aggregate at `(metric, tier, bucketStart)` — additive upsert. */
  record(metric: PerfMetric, tier: MetricTier, bucketStart: number, hist: Histogram): Promise<void>;
  /** Rows for `metric` in `tier` whose bucketStart is in `[fromMs, toMs)`. */
  read(metric: PerfMetric, tier: MetricTier, fromMs: number, toMs: number): Promise<MetricRow[]>;
  /** Delete `tier` rows older than `olderThanMs`. Returns the number removed. */
  prune(tier: MetricTier, olderThanMs: number): Promise<number>;
  /** Drop every metric — operational data only, safe to wipe. */
  clearAll(): Promise<void>;
}

// ── In-memory (dev/tests) ─────────────────────────────────────────────────────

/** A `metric|tier|bucketStart` key for the in-memory map. */
function key(metric: string, tier: string, bucket: number): string {
  return `${metric}|${tier}|${bucket}`;
}

export class InMemoryMetricsStore implements MetricsStore {
  private readonly rows = new Map<string, MetricRow>();

  async record(metric: PerfMetric, tier: MetricTier, bucket: number, hist: Histogram): Promise<void> {
    if (hist.count === 0) return;
    const k = key(metric, tier, bucket);
    const existing = this.rows.get(k);
    if (existing) {
      mergeInto(existing.hist, hist);
    } else {
      const h = emptyHistogram();
      mergeInto(h, hist);
      this.rows.set(k, { metric, tier, bucketStart: bucket, hist: h });
    }
  }

  async read(metric: PerfMetric, tier: MetricTier, fromMs: number, toMs: number): Promise<MetricRow[]> {
    return [...this.rows.values()]
      .filter((r) => r.metric === metric && r.tier === tier && r.bucketStart >= fromMs && r.bucketStart < toMs)
      .sort((a, b) => a.bucketStart - b.bucketStart)
      .map((r) => ({ ...r, hist: cloneHist(r.hist) }));
  }

  async prune(tier: MetricTier, olderThanMs: number): Promise<number> {
    let n = 0;
    for (const [k, r] of this.rows) {
      if (r.tier === tier && r.bucketStart < olderThanMs) {
        this.rows.delete(k);
        n += 1;
      }
    }
    return n;
  }

  async clearAll(): Promise<void> {
    this.rows.clear();
  }
}

function cloneHist(h: Histogram): Histogram {
  return { count: h.count, min: h.min, max: h.max, sum: h.sum, buckets: [...h.buckets] };
}

// ── SQLite/Postgres-backed (durable) ──────────────────────────────────────────

interface StoreRow {
  metric: string;
  tier: string;
  bucket_start: number;
  count: number;
  min: number;
  max: number;
  sum: number;
  buckets: string;
}

function rowToHist(r: StoreRow): Histogram {
  const buckets = JSON.parse(r.buckets) as number[];
  return { count: Number(r.count), min: Number(r.min), max: Number(r.max), sum: Number(r.sum), buckets };
}

/**
 * {@link MetricsStore} over the SQLite/Postgres {@link QueryExecutor} port. In
 * production this runs against a *separate* local SQLite file (`*.metrics`) so
 * operational metrics never mingle with — or get backed up alongside — business
 * data.
 */
export class SqlMetricsStore implements MetricsStore {
  constructor(private readonly db: QueryExecutor) {}

  async init(): Promise<void> {
    await this.db.execute(`CREATE TABLE IF NOT EXISTS metrics_rollup (
      metric TEXT NOT NULL,
      tier TEXT NOT NULL,
      bucket_start INTEGER NOT NULL,
      count INTEGER NOT NULL,
      min INTEGER NOT NULL,
      max INTEGER NOT NULL,
      sum INTEGER NOT NULL,
      buckets TEXT NOT NULL,
      PRIMARY KEY (metric, tier, bucket_start)
    )`);
  }

  async record(metric: PerfMetric, tier: MetricTier, bucket: number, hist: Histogram): Promise<void> {
    if (hist.count === 0) return;
    // Read-modify-write the additive merge in JS — cross-dialect and correct for
    // the bucket vector (a single recorder flushes, so there is no write race).
    const existing = await this.db.query<StoreRow>(
      `SELECT * FROM metrics_rollup WHERE metric = $1 AND tier = $2 AND bucket_start = $3`,
      [metric, tier, bucket],
    );
    const merged = emptyHistogram();
    if (existing[0]) mergeInto(merged, rowToHist(existing[0]));
    mergeInto(merged, hist);
    const buckets = JSON.stringify(merged.buckets);
    // Explicit UPDATE-or-INSERT (not ON CONFLICT): the positional `$n → ?` rewrite
    // cannot reuse a placeholder, and DO UPDATE would need to reference $4..$8 twice.
    if (existing[0]) {
      await this.db.execute(
        `UPDATE metrics_rollup SET count = $1, min = $2, max = $3, sum = $4, buckets = $5 WHERE metric = $6 AND tier = $7 AND bucket_start = $8`,
        [merged.count, merged.min, merged.max, merged.sum, buckets, metric, tier, bucket],
      );
    } else {
      await this.db.execute(
        `INSERT INTO metrics_rollup (metric, tier, bucket_start, count, min, max, sum, buckets) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [metric, tier, bucket, merged.count, merged.min, merged.max, merged.sum, buckets],
      );
    }
  }

  async read(metric: PerfMetric, tier: MetricTier, fromMs: number, toMs: number): Promise<MetricRow[]> {
    const rows = await this.db.query<StoreRow>(
      `SELECT * FROM metrics_rollup WHERE metric = $1 AND tier = $2 AND bucket_start >= $3 AND bucket_start < $4 ORDER BY bucket_start ASC`,
      [metric, tier, fromMs, toMs],
    );
    return rows.map((r) => ({ metric, tier, bucketStart: Number(r.bucket_start), hist: rowToHist(r) }));
  }

  async prune(tier: MetricTier, olderThanMs: number): Promise<number> {
    const res = await this.db.execute(`DELETE FROM metrics_rollup WHERE tier = $1 AND bucket_start < $2`, [tier, olderThanMs]);
    return res.rowCount;
  }

  async clearAll(): Promise<void> {
    await this.db.execute('DELETE FROM metrics_rollup');
  }
}
