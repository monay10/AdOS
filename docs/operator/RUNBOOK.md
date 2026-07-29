# Operator Runbook

> **Verified against** — Version: `v2.0.0-rc1` lineage + Deployment Sprints 1–2 · Commit: `bd35544` ·
> Last verified: **2026-07-29** · Verification: **manual (live app run) + automated tests**

Day-to-day operation of a local AdOS deployment. Every surface referenced here was confirmed to
render/behave on the live app on 2026-07-29.

## Daily

- **Health** — `GET /livez` (alive), `GET /readyz` (ready), `GET /healthz` (snapshot). *Verified:*
  200 / 200 / `{"status":"pass"}`. Wire `/readyz` into any process supervisor to gate traffic and
  `/livez` to trigger a restart on 503.
- **Backup** — create one from the **Backups** page (or `POST /backups/create`). Confirm the new row
  shows `validated`. Keep the `<BRAIN_DB>.backups/` directory on separate storage if you can.

## Weekly

- **Maintenance** — open **Maintenance** (`/maintenance`). It shows whole-database size, reclaimable
  bytes, per-table sizes, and Active/Frozen journal counts. *Verified:* the page renders these
  metrics on the live app.
  - **Compact the Decision Journal** — folds old entries into the immutable Frozen archive, keeping
    the hot blob (and restart time) bounded. Nothing is lost.
  - **Run VACUUM** — reclaims SQLite page bloat and reports the bytes freed
    (VACUUM + ANALYZE + PRAGMA optimize).
- **Verify a recent backup** — dry-run restore one backup (see
  [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md) §2) so you know your backups are restorable, not just
  present.

## Procedures

### Restore from a backup

See [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md). Summary: **Backups → Verify** (dry run) → if it
reports "safe to restore", **Confirm restore**. The app rehydrates in place; no restart needed.

### Disk is filling up

1. Open **Maintenance** and read *Reclaimable* bytes.
2. **Compact journal** (bounds the largest growing blob), then **Run VACUUM** (reclaims freelist
   pages); the page reports the space freed and logs it under *Recent maintenance*.
3. Prune old archives in `<BRAIN_DB>.backups/` (keep the most recent `validated` ones).
4. The durable store is a single file — moving `BRAIN_DB` to a larger volume is a stop-and-copy while
   the app is stopped (then start with the new path).

### A migration fails on startup

By design (and verified by `migration-engine.test.ts`): a failing migration is **rolled back
cleanly** — no partial schema, no ledger row — and **startup halts** with an error naming the
migration. The app never serves on a half-migrated schema.

1. Read the startup error: `Migration "<id>" failed and was rolled back: <reason>`.
2. The `BRAIN_DB` file is unchanged for that migration (rolled back). Do not hand-edit the schema.
3. Fix the migration (or the environment cause), rebuild, and restart — the engine re-attempts the
   pending chain from where it stopped.
4. If you cannot fix forward, **restore the pre-upgrade backup** and start the previous build (see
   [UPGRADE.md](UPGRADE.md) → "Rollback of an upgrade").

### The queue seems stuck / a job was interrupted

The mission queue is durable and self-recovering: at startup `recoverStale` returns any `running`
job whose lease expired to `pending`, and the worker resumes it (covered by
`sql-mission-queue.test.ts`). A restart is a safe recovery action; no job is lost or double-run.

### Governance enforcement changed unexpectedly

Enforcement is driven by the Auto-Calibration state machine (**AI Traces** → `/traces`). The system
only ever **auto-relaxes** (Enforced → Observe when the override rate rises); **tightening** a gate to
Enforced is always an explicit operator action. Review each gate's state, confidence, and per-signal
reasons on that page.

## Reference

- Environment variables: [INSTALLATION.md](INSTALLATION.md) §6.
- Health/metrics: `/livez`, `/readyz`, `/healthz`, `/metrics`.
- Durable file: `BRAIN_DB`; archives: `<BRAIN_DB>.backups/` (or `BACKUP_DIR`).
- Source of truth for what is and isn't shipped: [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md).
