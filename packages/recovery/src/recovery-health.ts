import type { RecoveryReport } from './recovery.js';

export interface RecoveryHealthReport {
  readonly healthy: boolean;
  readonly steps: { name: string; ok: boolean }[];
  readonly rtoMs: number;
  readonly checkedAt: string;
}

/**
 * RecoveryHealthCheck — automatic startup verification. Runs a read-only
 * recovery manager (config + dependency + backup-verify + consistency steps in
 * dry-run) and reports whether the system could recover. Wire it into the
 * container readiness gate so a node that cannot verify its own recoverability
 * never accepts traffic.
 */
export class RecoveryHealthCheck {
  constructor(private readonly manager: { recover(): Promise<RecoveryReport> }) {}

  async check(): Promise<RecoveryHealthReport> {
    const report = await this.manager.recover();
    return {
      healthy: report.recovered,
      steps: report.steps.map((s) => ({ name: s.name, ok: s.ok })),
      rtoMs: report.rtoMs,
      checkedAt: new Date().toISOString(),
    };
  }
}
