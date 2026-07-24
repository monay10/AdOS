/**
 * Disaster-recovery model. A recovery is an ordered sequence of steps; each step
 * verifies or restores one part of the system (config, dependencies, migrations,
 * data, queue, consistency). A step may report an RPO contribution (how much data
 * age it recovered from). The manager measures the overall RTO.
 */
export interface StepOutcome {
  readonly ok: boolean;
  readonly detail?: string;
  /** Data-loss window this step recovered from (ms); used to compute RPO. */
  readonly rpoMs?: number;
}

export interface RecoveryStep {
  readonly name: string;
  /** A failing critical step means recovery did not succeed (default true). */
  readonly critical?: boolean;
  run(): Promise<StepOutcome>;
}

export interface RecoveryStepResult {
  readonly name: string;
  readonly ok: boolean;
  readonly critical: boolean;
  readonly detail: string;
  readonly durationMs: number;
}

export interface RecoveryReport {
  readonly recovered: boolean;
  readonly steps: RecoveryStepResult[];
  /** Recovery Time Objective actual: total wall-clock of the recovery. */
  readonly rtoMs: number;
  /** Recovery Point Objective actual: the worst data-age recovered from (ms), or null. */
  readonly rpoMs: number | null;
  readonly startedAt: string;
  readonly finishedAt: string;
}
