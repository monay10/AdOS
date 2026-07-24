import type { RecoveryStep } from './recovery.js';

/**
 * Standard recovery steps, structurally typed so they compose the existing
 * infrastructure (config, deploy verifier, persistence migrations, backup
 * restore, worker queue) without importing any of it directly.
 */

/** Config corruption recovery: refuse to proceed unless configuration is valid. */
export function configStep(validate: () => { ok: boolean; errors: string[] }): RecoveryStep {
  return {
    name: 'config',
    critical: true,
    run: async () => {
      const r = validate();
      return { ok: r.ok, detail: r.ok ? 'configuration valid' : r.errors.join('; ') };
    },
  };
}

interface VerifierLike {
  verify(): Promise<{ ready: boolean; dependencies: { name: string; state: string }[] }>;
}

/** Dependency verification: every critical dependency must be reachable. */
export function dependencyStep(verifier: VerifierLike): RecoveryStep {
  return {
    name: 'dependencies',
    critical: true,
    run: async () => {
      const r = await verifier.verify();
      const down = r.dependencies.filter((d) => d.state === 'fail').map((d) => d.name);
      return { ok: r.ready, detail: r.ready ? `${r.dependencies.length} dependencies up` : `down: ${down.join(', ')}` };
    },
  };
}

/** Interrupted-migration recovery: migrations are forward-only + idempotent. */
export function migrationStep(run: () => Promise<{ applied: string[] }>): RecoveryStep {
  return {
    name: 'migrations',
    critical: true,
    run: async () => {
      const { applied } = await run();
      return { ok: true, detail: applied.length ? `applied ${applied.join(', ')}` : 'up to date (idempotent)' };
    },
  };
}

interface RestoreLike {
  restore(req: { backupId: string; dryRun?: boolean; passphrase?: string }): Promise<{ ok: boolean; restored: string[] }>;
}

/** Database/storage/knowledge recovery: restore (or verify) from a backup. */
export function backupRestoreStep(
  restore: RestoreLike,
  opts: { backupId: string; createdAt: string; dryRun?: boolean; passphrase?: string; now?: () => number },
): RecoveryStep {
  const now = opts.now ?? (() => Date.now());
  return {
    name: opts.dryRun ? 'backup-verify' : 'backup-restore',
    critical: true,
    run: async () => {
      const report = await restore.restore({
        backupId: opts.backupId,
        ...(opts.dryRun ? { dryRun: true } : {}),
        ...(opts.passphrase !== undefined ? { passphrase: opts.passphrase } : {}),
      });
      // RPO = how old the backup we recovered from is.
      const rpoMs = Math.max(0, now() - Date.parse(opts.createdAt));
      return { ok: report.ok, detail: report.ok ? (opts.dryRun ? 'backup verified' : `restored ${report.restored.join(', ') || '—'}`) : 'restore verification failed', rpoMs };
    },
  };
}

interface QueueLike {
  recoverStale(now: number): Promise<number>;
}

/** Queue-corruption / worker-crash recovery: re-queue jobs with an expired lease. */
export function queueRecoveryStep(store: QueueLike, now: () => number = () => Date.now()): RecoveryStep {
  return {
    name: 'queue-recovery',
    critical: false,
    run: async () => {
      const n = await store.recoverStale(now());
      return { ok: true, detail: `re-queued ${n} stale job(s)` };
    },
  };
}

export interface ConsistencyCheck {
  readonly name: string;
  check(): Promise<boolean> | boolean;
}

/** Post-recovery consistency gate (tenant + knowledge + data integrity). */
export function consistencyStep(name: string, checks: ConsistencyCheck[]): RecoveryStep {
  return {
    name,
    critical: true,
    run: async () => {
      const failed: string[] = [];
      for (const c of checks) if (!(await c.check())) failed.push(c.name);
      return { ok: failed.length === 0, detail: failed.length ? `inconsistent: ${failed.join(', ')}` : `${checks.length} consistency checks passed` };
    },
  };
}
