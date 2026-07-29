# AdOS Operator Guides (verified)

> **Verified against** — Version: `v2.0.0-rc1` lineage + Deployment Sprints 1–2 · Commit: `bd35544` ·
> Last verified: **2026-07-29** · Verification: **manual (live app run) + automated tests**

These are the **authoritative, verified** operator guides for AdOS. They were produced as a
**Release Readiness Audit**, not as prose: every documented step was **run against the live
application** (or a passing automated test) and its expected result **observed** before the step
was written down. Any step that could not be verified is not here.

> **Discipline (Series 2/3):** documentation conforms to the code, never the reverse — the same
> rule that governs [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md).
>
> **These supersede the pre–Series-2 top-level guides** (`INSTALLATION_GUIDE.md`, `UPGRADE_GUIDE.md`,
> `DISASTER_RECOVERY.md`, `RUNBOOK.md`, `ADMIN_GUIDE.md`, …) at the repo root, which predate this
> discipline and have **not** been re-verified against the current app. Prefer the guides here.

## Guides

| Guide | What it covers | Verified |
|-------|----------------|----------|
| [INSTALLATION.md](INSTALLATION.md) | Clean-machine install → first run → first migration → first backup → health check | ✅ live run |
| [UPGRADE.md](UPGRADE.md) | New build over an existing `BRAIN_DB`: automatic migration, data / queue / calibration preserved | ✅ live run |
| [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md) | Backup → corruption → restore → rehydrate → verify | ✅ live run |
| [RUNBOOK.md](RUNBOOK.md) | Daily / weekly maintenance, restore procedure, disk-full, migration-failure | ✅ mixed (live + tests) |

## What "verified" means here

For each line, the audit ran the step and observed the result. The concrete evidence captured on
2026-07-29 (Node 26.3.0, offline AI engine, `BRAIN_DB` on a local SQLite file):

- **Startup migration** — logs `BRAIN_DB schema migrations applied · applied: [0001_initial_schema,
  0002_performance_indexes] · verified: true`.
- **Health** — `GET /livez` → 200, `GET /readyz` → 200, `GET /healthz` → `{"status":"pass"}`.
- **First backup** — `POST /backups/create` → 303; an `*.ados-backup` archive file appears under
  `<BRAIN_DB>.backups/`; the catalogue row has `restore_validated = 1`.
- **Restart idempotency** — a second start over the same file logs `applied: []`, and the backup
  catalogue survives (data preserved).
- **Disaster recovery** — corrupting `governance_calibration` then `POST /backups/restore` (confirmed)
  reverted the durable state to the backup.
