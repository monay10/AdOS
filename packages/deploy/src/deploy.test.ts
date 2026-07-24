import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HealthAggregator } from './health.js';
import { DeploymentVerifier, type Dependency } from './verifier.js';
import { containerDiagnostics, renderContainerStartupReport } from './diagnostics.js';

const REPO_ROOT = join(process.cwd(), '..', '..');
const readRepo = (rel: string): string => readFileSync(join(REPO_ROOT, rel), 'utf8');

describe('HealthAggregator', () => {
  it('liveness passes with no probes; readiness fails when a dependency fails', async () => {
    const agg = new HealthAggregator()
      .add({ name: 'db', kind: 'readiness', check: () => ({ state: 'pass' }) })
      .add({ name: 'nats', kind: 'readiness', check: () => ({ state: 'fail', detail: 'down' }) });
    expect((await agg.liveness()).status).toBe('pass');
    const ready = await agg.readiness();
    expect(ready.status).toBe('fail');
    expect(ready.checks).toHaveLength(2);
  });

  it('reduces to the worst state and treats a throwing probe as fail', async () => {
    const agg = new HealthAggregator([
      { name: 'a', check: () => ({ state: 'pass' }) },
      { name: 'b', check: () => ({ state: 'warn' }) },
      { name: 'c', check: () => { throw new Error('boom'); } },
    ]);
    const snap = await agg.health();
    expect(snap.status).toBe('fail');
    expect(snap.checks.find((c) => c.name === 'c')?.detail).toBe('boom');
  });
});

describe('DeploymentVerifier', () => {
  it('is ready only when all critical dependencies pass', async () => {
    const deps: Dependency[] = [
      { name: 'postgres', verify: () => ({ name: 'postgres', state: 'pass' }) },
      { name: 'minio', verify: () => ({ name: 'minio', state: 'pass' }) },
      { name: 'grafana', critical: false, verify: () => ({ name: 'grafana', state: 'fail' }) }, // non-critical
    ];
    expect((await new DeploymentVerifier(deps).verify()).ready).toBe(true);

    const withCriticalDown: Dependency[] = [...deps, { name: 'nats', verify: () => ({ name: 'nats', state: 'fail' }) }];
    const report = await new DeploymentVerifier(withCriticalDown).verify();
    expect(report.ready).toBe(false);
    expect(report.dependencies).toHaveLength(4);
  });
});

describe('diagnostics + startup report', () => {
  it('reports runtime diagnostics and renders a startup report', async () => {
    const diag = containerDiagnostics('ados-web');
    expect(diag.service).toBe('ados-web');
    expect(diag.memory.rssMb).toBeGreaterThan(0);
    const deployment = await new DeploymentVerifier([{ name: 'postgres', verify: () => ({ name: 'postgres', state: 'pass' }) }]).verify();
    const health = await new HealthAggregator().health();
    const report = renderContainerStartupReport(diag, deployment, health);
    expect(report).toContain('READY');
    expect(report).toContain('postgres');
  });
});

describe('deployment artifacts', () => {
  const compose = readRepo('deploy/docker-compose.production.yml');

  it('defines every required service', () => {
    for (const svc of ['web:', 'workers:', 'postgres:', 'minio:', 'nats:', 'ollama:', 'prometheus:', 'grafana:', 'jaeger:']) {
      expect(compose).toContain(svc);
    }
  });

  it('gives every long-running container a healthcheck, and app+data resource limits + restart', () => {
    expect((compose.match(/healthcheck:/g) ?? []).length).toBeGreaterThanOrEqual(8);
    expect(compose).toContain('limits:');
    expect(compose).toContain('restart: unless-stopped');
    expect(compose).toContain('stop_grace_period'); // graceful shutdown
  });

  it('enforces startup ordering via service_healthy and persists volumes', () => {
    expect(compose).toContain('condition: service_healthy');
    for (const vol of ['pgdata:', 'miniodata:', 'natsdata:', 'ollamadata:']) expect(compose).toContain(vol);
  });

  it('ships the supporting deployment files', () => {
    expect(readRepo('deploy/Dockerfile')).toContain('AS runtime');
    expect(readRepo('deploy/entrypoint.sh')).toContain('exec "$@"');
    expect(readRepo('deploy/prometheus.production.yml')).toContain('ados-web');
    expect(readRepo('deploy/grafana/provisioning/datasources/datasources.yml')).toContain('prometheus');
    expect(readRepo('DEPLOYMENT_REPORT.md')).toContain('Deployment');
  });
});
