import { describe, expect, it } from 'vitest';
import { InMemoryMetricsStore, TIER_MS } from './metrics-store.js';
import { MetricsRecorder, DEFAULT_RETENTION } from './metrics-recorder.js';

const T0 = 1_700_000_000_000; // a fixed epoch ms; no wall clock in tests

describe('MetricsRecorder', () => {
  it('observe folds into memory only — nothing persists until flush', async () => {
    const store = new InMemoryMetricsStore();
    const rec = new MetricsRecorder(store);
    rec.observe('planner_latency', 30);
    rec.observe('planner_latency', 90);
    expect(await store.read('planner_latency', 'minute', 0, Number.MAX_SAFE_INTEGER)).toEqual([]);

    await rec.flush(T0);
    const rows = await store.read('planner_latency', 'minute', 0, Number.MAX_SAFE_INTEGER);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.hist.count).toBe(2);
  });

  it('flush writes the same samples into all three tiers', async () => {
    const store = new InMemoryMetricsStore();
    const rec = new MetricsRecorder(store);
    rec.observe('queue_wait', 500);
    await rec.flush(T0);
    for (const tier of ['minute', 'hour', 'day'] as const) {
      const rows = await store.read('queue_wait', tier, 0, Number.MAX_SAFE_INTEGER);
      expect(rows, tier).toHaveLength(1);
      expect(rows[0]!.hist.count, tier).toBe(1);
    }
  });

  it('does not double-count: a sample counted once across flush + snapshot', async () => {
    const store = new InMemoryMetricsStore();
    const rec = new MetricsRecorder(store);
    rec.observe('worker_execution', 100);
    await rec.flush(T0); // buffer → store, buffer cleared
    rec.observe('worker_execution', 200); // new, still buffered
    const snap = await rec.snapshot(T0);
    const view = snap.metrics.find((m) => m.metric === 'worker_execution')!;
    expect(view.lastHour.count).toBe(2); // 1 persisted + 1 buffered, no overlap
  });

  it('snapshot merges persisted rows and the live buffer without writing', async () => {
    const store = new InMemoryMetricsStore();
    const rec = new MetricsRecorder(store);
    rec.observe('planner_latency', 40);
    const snap = await rec.snapshot(T0); // reads, includes buffer, must NOT persist
    expect(snap.metrics.find((m) => m.metric === 'planner_latency')!.lastHour.count).toBe(1);
    // The buffer was not flushed by snapshot — the store is still empty.
    expect(await store.read('planner_latency', 'minute', 0, Number.MAX_SAFE_INTEGER)).toEqual([]);
  });

  it('always reports all four metrics, with empty windows reading zero (not fabricated)', async () => {
    const rec = new MetricsRecorder(new InMemoryMetricsStore());
    const snap = await rec.snapshot(T0);
    expect(snap.metrics.map((m) => m.metric).sort()).toEqual(
      ['governance_latency', 'planner_latency', 'queue_wait', 'worker_execution'],
    );
    for (const m of snap.metrics) {
      expect(m.lastHour.count).toBe(0);
      expect(m.last30d.p95).toBe(0);
    }
  });

  it('maintain prunes each tier at its retention horizon', async () => {
    const store = new InMemoryMetricsStore();
    const rec = new MetricsRecorder(store);
    // A minute-tier sample well outside the minute retention (2h) but the day-tier
    // copy is inside the day retention, so it survives in the day tier.
    rec.observe('governance_latency', 12);
    await rec.flush(T0);
    const later = T0 + DEFAULT_RETENTION.minute + TIER_MS.hour; // > minute horizon, << day horizon
    await rec.maintain(later);
    expect(await store.read('governance_latency', 'minute', 0, Number.MAX_SAFE_INTEGER)).toEqual([]);
    expect(await store.read('governance_latency', 'day', 0, Number.MAX_SAFE_INTEGER)).toHaveLength(1);
  });

  it('clear wipes buffers and the durable store (operational metrics are disposable)', async () => {
    const store = new InMemoryMetricsStore();
    const rec = new MetricsRecorder(store);
    rec.observe('queue_wait', 10);
    await rec.flush(T0);
    rec.observe('queue_wait', 20); // buffered
    await rec.clear();
    const snap = await rec.snapshot(T0);
    expect(snap.metrics.find((m) => m.metric === 'queue_wait')!.last30d.count).toBe(0);
  });
});
