import { readFileSync, readdirSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { metricsText, telemetry } from '@ados/observability';
import { App } from './app.js';
import { buildServer } from './server.js';

const REPO_ROOT = join(process.cwd(), '..', '..');
const DASH_DIR = join(REPO_ROOT, 'deploy', 'grafana', 'provisioning', 'dashboards', 'json');

let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  const app = new App();
  await app.start();
  const { server } = buildServer({ sessionSecret: 'mon-secret', app });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise<void>((r) => server.close(() => r()));
});
afterAll(async () => { await close(); });

describe('HTTP instrumentation is exported', () => {
  it('emits request count, duration histogram and process metrics', async () => {
    await fetch(`${base}/livez`);
    await fetch(`${base}/dashboard`, { redirect: 'manual' });
    const metrics = await metricsText();

    expect(metrics).toContain('# TYPE web_http_requests_total counter');
    expect(metrics).toContain('web_http_requests_total{'); // has samples after traffic
    expect(metrics).toContain('web_http_request_duration_ms_bucket');
    expect(metrics).toContain('# TYPE web_http_errors_total counter');
    // Default process/runtime metrics (System dashboard).
    expect(metrics).toContain('process_cpu_seconds_total');
    expect(metrics).toContain('nodejs_heap_size_used_bytes');
  });
});

describe('Subsystem metric taxonomy', () => {
  it('exports correctly-named metrics for every instrumented subsystem', async () => {
    // These are the exact calls StorageMetrics / JobMetrics / BackupMetrics /
    // loggerAudit make through telemetry(component).count(...).
    telemetry('storage').count('object_uploaded');
    telemetry('workers').count('started');
    telemetry('workers').count('succeeded');
    telemetry('backup').count('backup_completed');
    telemetry('web.auth').count('auth_login_succeeded');
    telemetry('config').count('loaded_ok');

    const metrics = await metricsText();
    for (const name of [
      'storage_object_uploaded_total',
      'workers_started_total',
      'workers_succeeded_total',
      'backup_backup_completed_total',
      'web_auth_auth_login_succeeded_total',
      'config_loaded_ok_total',
    ]) {
      expect(metrics).toContain(name);
    }
  });

  it('tracing spans execute (no-op tracer offline) and return the wrapped value', async () => {
    const result = await telemetry('verify').span('unit', async () => 42);
    expect(result).toBe(42);
  });
});

describe('Production dashboards', () => {
  const expected = ['system', 'application', 'ai', 'workers', 'storage', 'database', 'events', 'authentication', 'backup', 'business-kpis'];

  it('ships a dashboard for every required domain', () => {
    const files = readdirSync(DASH_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')).sort();
    expect(files).toEqual([...expected].sort());
  });

  it('every dashboard is valid and its panels carry Prometheus queries', () => {
    for (const name of expected) {
      const model = JSON.parse(readFileSync(join(DASH_DIR, `${name}.json`), 'utf8'));
      expect(model.title).toContain('AdOS');
      expect(model.uid).toBe(`ados-${name}`);
      expect(Array.isArray(model.panels) && model.panels.length).toBeTruthy();
      for (const p of model.panels) {
        expect(p.title).toBeTruthy();
        expect(p.targets[0].expr).toBeTruthy();
      }
    }
  });

  it('the live dashboards reference metrics that are actually exported', () => {
    const app = readFileSync(join(DASH_DIR, 'application.json'), 'utf8');
    expect(app).toContain('web_http_requests_total');
    expect(app).toContain('web_http_request_duration_ms_bucket');
    const sys = readFileSync(join(DASH_DIR, 'system.json'), 'utf8');
    expect(sys).toContain('process_cpu_seconds_total');
  });
});
