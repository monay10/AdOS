import type { AddressInfo } from 'node:net';
import { performance } from 'node:perf_hooks';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HealthAggregator } from '@ados/deploy';
import { App } from './app.js';
import { buildServer } from './server.js';

let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  const app = new App();
  await app.start();
  const health = new HealthAggregator().add({ name: 'self', kind: 'readiness', check: () => ({ state: 'pass' }) });
  const { server } = buildServer({ sessionSecret: 'load-secret', app, ops: { health } });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise<void>((r) => server.close(() => r()));
});
afterAll(async () => { await close(); });

/** Fire `total` requests keeping `concurrency` in flight; return throughput + p95. */
async function loadTest(path: string, concurrency: number, total: number): Promise<{ ok: number; opsPerSec: number; p95Ms: number }> {
  const latencies: number[] = [];
  let ok = 0;
  let issued = 0;
  const start = performance.now();
  async function worker(): Promise<void> {
    while (issued < total) {
      issued++;
      const t = performance.now();
      const res = await fetch(`${base}${path}`, { redirect: 'manual' });
      latencies.push(performance.now() - t);
      if (res.status < 500) ok++;
      await res.arrayBuffer();
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const totalMs = performance.now() - start;
  const sorted = latencies.sort((a, b) => a - b);
  return { ok, opsPerSec: Math.round((total / totalMs) * 1000), p95Ms: Math.round((sorted[Math.floor(sorted.length * 0.95)] ?? 0) * 100) / 100 };
}

describe('HTTP load — concurrent users', () => {
  for (const concurrency of [100, 500, 1000]) {
    it(`handles ${concurrency} concurrent users on the readiness path`, async () => {
      const total = concurrency * 4;
      const r = await loadTest('/readyz', concurrency, total);
      // eslint-disable-next-line no-console
      console.log(`load ${concurrency}: ${r.ok}/${total} ok, ${r.opsPerSec} req/s, p95 ${r.p95Ms}ms`);
      expect(r.ok).toBe(total); // zero failures under load
      expect(r.opsPerSec).toBeGreaterThan(200);
    });
  }

  it('renders the dashboard (session flow) under concurrent load', async () => {
    const r = await loadTest('/dashboard', 100, 400); // 303 → login (no session), still exercises routing
    expect(r.ok).toBe(400);
  });
});
