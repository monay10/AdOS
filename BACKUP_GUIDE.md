# AdOS — Backup Guide

AdOS ships encrypted, verifiable, incremental backups via `@ados/backup`, driven
through `ops.js`. This guide covers policy; mechanics are in `RECOVERY_REPORT.md`
and restore/DR in `DISASTER_RECOVERY.md`.

## What a backup contains

- Tenant-scoped database tables (via `DatabaseBackupSource`).
- Each archive is **gzip-compressed, AES-256-GCM encrypted, and SHA-256
  checksummed**. Backups are recorded in a repository with their metadata.

## Full vs incremental

- **Full** — a complete snapshot.
- **Incremental** — only changes since a parent, linked by a **parent chain**. A
  restore walks the chain and applies it in order.

## Taking a backup

```bash
# via the ops entry point (BackupService)
node apps/web/dist/ops.js backup --tenant <tenantId>          # full
node apps/web/dist/ops.js backup --tenant <tenantId> --incremental
```

Backups **auto-validate** on creation (checksum + structure), so a stored backup
is known-good.

## Restore

```bash
node apps/web/dist/ops.js restore --backup <backupId>
```

Restore **verifies then applies** (integrity checked before any write). See
`DISASTER_RECOVERY.md` for full-system recovery and RTO/RPO.

## Recommended policy

| Aspect | Recommendation |
| --- | --- |
| Full backup | daily |
| Incremental | hourly (or per significant change) |
| Retention | ≥ 30 days of fulls + chains |
| Encryption key | stored in your secrets manager, **not** with the archives |
| Restore drills | monthly — restore to a scratch env and verify |
| Offsite copy | replicate archives to a second location |

## Verify

Because backups self-validate and restores verify checksums, a successful
`restore` to a scratch environment is your proof of recoverability. Automate a
periodic drill and alert if the newest backup is older than your RPO.
