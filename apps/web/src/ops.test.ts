import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HealthAggregator } from '@ados/deploy';
import { App } from './app.js';
import { buildServer } from './server.js';

let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  const app = new App();
  await app.start();
  // Readiness has one passing and one failing dependency; liveness is process-up.
  const health = new HealthAggregator()
    .add({ name: 'database', kind: 'readiness', check: () => ({ state: 'pass', detail: 'ok' }) })
    .add({ name: 'nats', kind: 'readiness', check: () => ({ state: 'fail', detail: 'unreachable' }) });
  const { server } = buildServer({ sessionSecret: 'ops-secret', app, ops: { health, service: 'ados-web' } });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise<void>((r) => server.close(() => r()));
});
afterAll(async () => { await close(); });

describe('Container ops endpoints', () => {
  it('liveness is 200 (process is up)', async () => {
    const r = await fetch(`${base}/livez`);
    expect(r.status).toBe(200);
    expect((await r.json()).status).toBe('pass');
  });

  it('readiness is 503 when a dependency is unreachable', async () => {
    const r = await fetch(`${base}/readyz`);
    expect(r.status).toBe(503);
    const body = await r.json();
    expect(body.status).toBe('fail');
    expect(body.checks.find((c: { name: string }) => c.name === 'nats').state).toBe('fail');
  });

  it('exposes Prometheus metrics', async () => {
    const r = await fetch(`${base}/metrics`);
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toContain('text/plain');
    expect(await r.text()).toContain('# HELP');
  });

  it('reports container diagnostics', async () => {
    const r = await fetch(`${base}/diagnostics`);
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.service).toBe('ados-web');
    expect(typeof d.uptimeSeconds).toBe('number');
  });

  it('does not shadow application routes', async () => {
    const r = await fetch(`${base}/dashboard`, { redirect: 'manual' });
    expect(r.status).toBe(303); // still redirects to login — ops did not intercept
  });
});
