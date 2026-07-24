# AdOS — Disaster Recovery

Disaster recovery is orchestrated by [`@ados/recovery`](packages/recovery/), which
composes the infrastructure already built: `@ados/config` (validation), `@ados/deploy`
(dependency verification), `@ados/persistence` (idempotent migrations), `@ados/backup`
(restore + verification), and `@ados/workers` (queue recovery). Nothing here modifies
a business module.

## Model

A recovery is an ordered sequence of **steps**; the `RecoveryManager` runs them,
timing each, and produces a `RecoveryReport` with measured **RTO** (total recovery
time) and **RPO** (age of the backup recovered from). A failing *critical* step fails
the recovery, but every step still runs so the report is complete.

Standard steps: `configStep` → `dependencyStep` → `migrationStep` →
`backupRestoreStep` → `queueRecoveryStep` → `consistencyStep`. `RecoveryValidation`
gates tenant + knowledge consistency; `RecoveryHealthCheck` runs a read-only
(verify/dry-run) manager for automatic startup verification.

## Scenario coverage

| Disaster | Recovery mechanism | RTO | RPO |
| --- | --- | --- | --- |
| **Database loss** | restore latest backup (DatabaseBackupSource) + idempotent migrations | minutes | last backup |
| **Storage loss** | restore objects from backup (StorageBackupSource) | minutes | last backup |
| **Worker crash** | lease expiry → `recoverStale` re-queues in-flight jobs | seconds | 0 (persisted) |
| **Application crash** | container restart (restart policy) + startup verification | seconds | 0 |
| **Server restart** | compose ordering + `depends_on: service_healthy` + auto-migrate | 1–2 min | 0 |
| **Power failure** | persistent volumes + graceful/again-verified startup | 1–2 min | last commit |
| **Backup restore** | `RestoreService` with integrity/checksum/compatibility verification | minutes | chosen backup |
| **Configuration corruption** | `configStep` fail-fast → refuse startup until fixed | n/a | n/a |
| **Secret corruption** | config validation flags missing/short secrets → fail-fast | n/a | n/a |
| **Queue corruption** | `recoverStale` re-queues expired-lease jobs; DLQ preserves the rest | seconds | 0 |
| **Interrupted migration** | forward-only + idempotent runner; re-run is a no-op | seconds | 0 |

## RTO / RPO

- **RTO** — measured per recovery run (`report.rtoMs`). Dominated by restore size and
  dependency start time; the app + queue paths are sub-second.
- **RPO** — equals the age of the backup restored (`report.rpoMs`). Drive it down with
  the scheduled/incremental backups from Item 5 (`BackupService`), which validate
  their own restorability at creation time.

## Restart & shutdown modes (verified)

- **Cold start** — full stack from volumes; ordering enforced, migrations auto-run,
  startup verification gates readiness.
- **Warm restart** — app/worker restart; queued jobs resume, in-flight jobs recovered
  by lease expiry.
- **Rolling restart** — replicas cycle behind the readiness gate; no dropped traffic.
- **Graceful shutdown/startup** — `stop_grace_period` drains in-flight work; startup
  re-verifies dependencies before serving.

## Automatic verification

`RecoveryHealthCheck` runs config + dependency + backup-verify (dry-run) + consistency
steps and reports healthy/not. Wire it into the container readiness probe so a node
that cannot prove its own recoverability never accepts traffic.

See [RUNBOOK.md](RUNBOOK.md) for operator procedures and [RECOVERY_REPORT.md](RECOVERY_REPORT.md)
for the verification results.
