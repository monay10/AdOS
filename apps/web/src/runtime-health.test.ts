import { describe, expect, it } from 'vitest';
import { assembleHealth, type RuntimeHealthInput } from './runtime-health.js';

const base: RuntimeHealthInput = {
  now: Date.parse('2026-07-29T12:00:00.000Z'),
  uptimeSeconds: 120,
  workerRunning: true,
  queue: { pending: 1, running: 0, awaiting_approval: 2, failed: 0, total: 3 },
  database: { durable: true, reachable: true, sizeBytes: 40960 },
  migration: { version: '0002_performance_indexes', applied: 2 },
  backup: { count: 1, lastAt: '2026-07-29T11:00:00.000Z', lastValidated: true },
  maintenance: { lastAt: '2026-07-29T10:00:00.000Z', lastKind: 'vacuum' },
};

describe('assembleHealth', () => {
  it('is healthy when the durable DB is reachable, the worker runs, and no jobs failed', () => {
    const h = assembleHealth(base);
    expect(h.system.status).toBe('pass');
    expect(h.system.reasons).toEqual([]);
    expect(h.system.uptimeSeconds).toBe(120);
    expect(h.migration.version).toBe('0002_performance_indexes');
  });

  it('degrades with a concrete reason when the queue worker is stopped', () => {
    const h = assembleHealth({ ...base, workerRunning: false });
    expect(h.system.status).toBe('degraded');
    expect(h.system.reasons).toContain('queue worker not running');
  });

  it('degrades when the durable database is unreachable', () => {
    const h = assembleHealth({ ...base, database: { durable: true, reachable: false, sizeBytes: 0 } });
    expect(h.system.status).toBe('degraded');
    expect(h.system.reasons).toContain('durable database unreachable');
  });

  it('degrades — with the count — when queue jobs have failed', () => {
    const h = assembleHealth({ ...base, queue: { ...base.queue, failed: 3, total: 6 } });
    expect(h.system.status).toBe('degraded');
    expect(h.system.reasons).toContain('3 failed queue job(s)');
  });

  it('does NOT treat an in-memory (non-durable) store as unreachable', () => {
    const h = assembleHealth({ ...base, database: { durable: false, reachable: false, sizeBytes: 0 } });
    expect(h.system.status).toBe('pass'); // in-memory is a valid dev mode, not a failure
  });
});
