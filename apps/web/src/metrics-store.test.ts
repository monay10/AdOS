import { describe, expect, it } from 'vitest';
import { SqliteDatabase } from '@ados/persistence';
import { emptyHistogram, observe, summarize, type Histogram } from './metrics.js';
import { bucketStart, InMemoryMetricsStore, SqlMetricsStore, TIER_MS, type MetricsStore } from './metrics-store.js';

function of(samples: number[]): Histogram {
  const h = emptyHistogram();
  for (const s of samples) observe(h, s);
  return h;
}

async function sqlStore(): Promise<MetricsStore> {
  const s = new SqlMetricsStore(new SqliteDatabase(':memory:'));
  await s.init();
  return s;
}

// Run the same behavioural contract against both implementations.
describe.each<[string, () => Promise<MetricsStore>]>([
  ['InMemoryMetricsStore', async () => new InMemoryMetricsStore()],
  ['SqlMetricsStore', sqlStore],
])('%s', (_name, make) => {
  it('record folds additively into a bucket (upsert-merge, not replace)', async () => {
    const store = await make();
    const bucket = bucketStart('minute', 1_700_000_000_000);
    await store.record('planner_latency', 'minute', bucket, of([10, 20]));
    await store.record('planner_latency', 'minute', bucket, of([30]));
    const rows = await store.read('planner_latency', 'minute', bucket, bucket + 1);
    expect(rows).toHaveLength(1);
    const s = summarize(rows[0]!.hist);
    expect(s.count).toBe(3);
    expect(s.min).toBe(10);
    expect(s.max).toBe(30);
  });

  it('recording an empty histogram writes nothing', async () => {
    const store = await make();
    await store.record('queue_wait', 'minute', bucketStart('minute', 0), emptyHistogram());
    expect(await store.read('queue_wait', 'minute', 0, Number.MAX_SAFE_INTEGER)).toEqual([]);
  });

  it('read is scoped to metric + tier + [from,to)', async () => {
    const store = await make();
    const now = 1_700_000_000_000;
    await store.record('planner_latency', 'minute', bucketStart('minute', now), of([5]));
    await store.record('governance_latency', 'minute', bucketStart('minute', now), of([5])); // other metric
    await store.record('planner_latency', 'hour', bucketStart('hour', now), of([5])); // other tier
    const rows = await store.read('planner_latency', 'minute', now - TIER_MS.hour, now + 1);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.metric).toBe('planner_latency');
    expect(rows[0]!.tier).toBe('minute');
  });

  it('prune removes only rows older than the cutoff, in the given tier', async () => {
    const store = await make();
    const old = bucketStart('minute', 1_000_000_000_000);
    const recent = bucketStart('minute', 2_000_000_000_000);
    await store.record('worker_execution', 'minute', old, of([1]));
    await store.record('worker_execution', 'minute', recent, of([1]));
    await store.record('worker_execution', 'hour', bucketStart('hour', old), of([1])); // different tier, untouched
    const removed = await store.prune('minute', recent);
    expect(removed).toBe(1);
    expect(await store.read('worker_execution', 'minute', 0, Number.MAX_SAFE_INTEGER)).toHaveLength(1);
    expect(await store.read('worker_execution', 'hour', 0, Number.MAX_SAFE_INTEGER)).toHaveLength(1);
  });

  it('clearAll wipes every operational metric', async () => {
    const store = await make();
    await store.record('planner_latency', 'day', bucketStart('day', 0), of([1]));
    await store.clearAll();
    expect(await store.read('planner_latency', 'day', 0, Number.MAX_SAFE_INTEGER)).toEqual([]);
  });
});
