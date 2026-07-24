import type { DeploymentReport } from './verifier.js';
import type { HealthSnapshot } from './health.js';

export interface ContainerDiagnostics {
  readonly service: string;
  readonly pid: number;
  readonly nodeVersion: string;
  readonly platform: string;
  readonly uptimeSeconds: number;
  readonly memory: { readonly rssMb: number; readonly heapUsedMb: number };
  readonly checkedAt: string;
}

/** A point-in-time snapshot of the running container (for /diagnostics + logs). */
export function containerDiagnostics(service: string): ContainerDiagnostics {
  const mem = process.memoryUsage();
  return {
    service,
    pid: process.pid,
    nodeVersion: process.version,
    platform: `${process.platform}/${process.arch}`,
    uptimeSeconds: Math.round(process.uptime()),
    memory: { rssMb: Math.round(mem.rss / 1_048_576), heapUsedMb: Math.round(mem.heapUsed / 1_048_576) },
    checkedAt: new Date().toISOString(),
  };
}

/** Human-readable startup report a container prints once its deps are verified. */
export function renderContainerStartupReport(diag: ContainerDiagnostics, deployment: DeploymentReport, health: HealthSnapshot): string {
  const lines: string[] = [];
  lines.push(`AdOS container "${diag.service}" — ${deployment.ready ? 'READY' : 'NOT READY'}`);
  lines.push(`  node ${diag.nodeVersion} on ${diag.platform}, pid ${diag.pid}, rss ${diag.memory.rssMb}MB`);
  lines.push('  dependencies:');
  for (const d of deployment.dependencies) lines.push(`    ${mark(d.state)} ${d.name.padEnd(12)} ${d.detail ?? ''}`.trimEnd());
  lines.push(`  health: ${health.status.toUpperCase()}`);
  for (const c of health.checks) lines.push(`    ${mark(c.state)} ${c.name.padEnd(12)} ${c.detail ?? ''}`.trimEnd());
  return lines.join('\n');
}

function mark(state: string): string {
  return state === 'pass' ? '✓' : state === 'warn' ? '!' : '✗';
}
