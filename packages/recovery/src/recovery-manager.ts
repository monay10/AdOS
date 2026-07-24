import type { RecoveryReport, RecoveryStep, RecoveryStepResult } from './recovery.js';
import { loggerRecoveryAudit, RecoveryMetrics, RecoveryTracing, type RecoveryAudit } from './recovery-observability.js';

export interface RecoveryManagerDeps {
  readonly audit?: RecoveryAudit;
  readonly metrics?: RecoveryMetrics;
  readonly tracing?: RecoveryTracing;
  readonly now?: () => number;
}

/**
 * RecoveryManager — runs the recovery sequence and produces an auditable report
 * with measured RTO (total recovery time) and RPO (worst data-age recovered
 * from). Steps run in order; a failing critical step fails the recovery but the
 * remaining steps still run so the report is complete. Every step is timed,
 * audited, traced and counted.
 */
export class RecoveryManager {
  private readonly audit: RecoveryAudit;
  private readonly metrics: RecoveryMetrics;
  private readonly tracing: RecoveryTracing;
  private readonly now: () => number;

  constructor(
    private readonly steps: RecoveryStep[],
    deps: RecoveryManagerDeps = {},
  ) {
    this.audit = deps.audit ?? loggerRecoveryAudit();
    this.metrics = deps.metrics ?? new RecoveryMetrics();
    this.tracing = deps.tracing ?? new RecoveryTracing();
    this.now = deps.now ?? (() => Date.now());
  }

  async recover(): Promise<RecoveryReport> {
    return this.tracing.span('recover', () => this.execute());
  }

  private async execute(): Promise<RecoveryReport> {
    const startedAt = new Date().toISOString();
    const t0 = this.now();
    this.audit.record('recovery.started', {});

    const results: RecoveryStepResult[] = [];
    const rpos: number[] = [];
    for (const step of this.steps) {
      const critical = step.critical ?? true;
      const s0 = this.now();
      let ok = false;
      let detail = '';
      try {
        const outcome = await step.run();
        ok = outcome.ok;
        detail = outcome.detail ?? '';
        if (typeof outcome.rpoMs === 'number') {
          rpos.push(outcome.rpoMs);
          this.metrics.rpo(outcome.rpoMs);
        }
      } catch (e) {
        ok = false;
        detail = e instanceof Error ? e.message : String(e);
      }
      const durationMs = this.now() - s0;
      results.push({ name: step.name, ok, critical, detail, durationMs });
      this.metrics.step(ok);
      this.audit.record('recovery.step', { step: step.name, ok, ...(ok ? {} : { reason: detail }) });
    }

    const rtoMs = this.now() - t0;
    const recovered = results.every((r) => !r.critical || r.ok);
    const rpoMs = rpos.length ? Math.max(...rpos) : null;
    this.metrics.completed(recovered, rtoMs);
    this.audit.record(recovered ? 'recovery.completed' : 'recovery.failed', { rtoMs, rpoMs });

    return { recovered, steps: results, rtoMs, rpoMs, startedAt, finishedAt: new Date().toISOString() };
  }
}

/** Render a recovery report as a human-readable RECOVERY_REPORT body. */
export function renderRecoveryReport(report: RecoveryReport): string {
  const lines: string[] = [];
  lines.push(`Recovery ${report.recovered ? 'SUCCEEDED' : 'FAILED'} — RTO ${report.rtoMs}ms, RPO ${report.rpoMs ?? 'n/a'}ms`);
  lines.push(`started ${report.startedAt} → finished ${report.finishedAt}`);
  lines.push('─'.repeat(60));
  for (const s of report.steps) {
    lines.push(`  ${s.ok ? '✓' : '✗'} ${s.name.padEnd(22)} ${s.durationMs}ms ${s.detail}`.trimEnd());
  }
  return lines.join('\n');
}
