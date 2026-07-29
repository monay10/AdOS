import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { App } from './app.js';
import { buildServer } from './server.js';

const SECRET = 'test-secret';

function client(base: string) {
  let cookie = '';
  return async (method: string, path: string, body?: Record<string, string>) => {
    const headers: Record<string, string> = {};
    if (cookie) headers['cookie'] = cookie;
    let payload: string | undefined;
    if (body) {
      headers['content-type'] = 'application/x-www-form-urlencoded';
      payload = new URLSearchParams(body).toString();
    }
    const res = await fetch(`${base}${path}`, { method, headers, ...(payload ? { body: payload } : {}), redirect: 'manual' });
    const sc = res.headers.get('set-cookie');
    if (sc) cookie = sc.split(';')[0]!;
    return res;
  };
}

describe('Performance dashboard over HTTP (measured aggregates)', () => {
  let app: App;
  let base: string;
  let close: () => Promise<void>;

  beforeAll(async () => {
    app = new App();
    await app.start();
    // Fold 50 measured planner samples + one queue-wait sample, then persist.
    for (let i = 0; i < 50; i += 1) app.metrics.observe('planner_latency', 40 + i);
    app.metrics.observe('queue_wait', 8);
    await app.metrics.flush(Date.now());

    const { server } = buildServer({ sessionSecret: SECRET, app });
    await new Promise<void>((r) => server.listen(0, r));
    base = `http://localhost:${(server.address() as AddressInfo).port}`;
    close = () => new Promise<void>((r) => server.close(() => r()));
  });

  afterAll(async () => {
    await app.stop();
    await close();
  });

  it('renders percentiles for measured metrics and says "no samples" for empty ones', async () => {
    const c = client(base);
    await c('POST', '/login', { email: 'op@x.com', company: 'Perf Co' });
    const html = await (await c('GET', '/performance')).text();

    expect(html).toContain('Performance');
    expect(html).toContain('P95'); // percentile columns present
    expect(html).toContain('Planner'); // the measured planner metric label
    expect(html).toContain('Queue wait'); // the measured queue-wait metric label
    // Metrics with no samples honestly say so rather than showing a fabricated 0.
    expect(html).toContain('no samples');
    // The methodology note makes the histogram-estimate + separate-store facts explicit.
    expect(html).toContain('histograms');
  });

  it('the snapshot reports the exact measured sample count for the planner', async () => {
    const snap = await app.metrics.snapshot(Date.now());
    const planner = snap.metrics.find((m) => m.metric === 'planner_latency')!;
    expect(planner.lastHour.count).toBe(50); // exact, not estimated
    expect(planner.lastHour.p95).toBeGreaterThanOrEqual(planner.lastHour.p50);
    const governance = snap.metrics.find((m) => m.metric === 'governance_latency')!;
    expect(governance.lastHour.count).toBe(0); // untouched → zero, not invented
  });
});
