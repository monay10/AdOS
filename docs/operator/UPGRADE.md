# Upgrade Guide

> **Verified against** — Version: `v2.0.0-rc1` lineage + Deployment Sprints 1–2 · Commit: `bd35544` ·
> Last verified: **2026-07-29** · Verification: **manual (live app run) + automated tests**

How to install a newer build over an existing `BRAIN_DB` without losing durable state. The schema
migration engine makes this safe: pending migrations apply automatically at startup, already-applied
ones are skipped, and a failure halts startup rather than serving a bad schema.

## Procedure

1. **Back up first** (always — see [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md)):
   `POST /backups/create`, or the **Backups** page. Confirm the new row shows `validated`.
2. **Stop** the running app.
3. **Update the code** and rebuild:
   ```bash
   git pull                       # or unpack the new release
   pnpm install
   pnpm --filter @ados/web build
   ```
4. **Start** the new build with the **same `BRAIN_DB`** and env as before.

## What happens at startup (verified)

The new build runs the migration engine against the existing file **before** serving:

- **If the new version added migrations** → they apply in order, each in a transaction, then the
  schema is verified. *Verified on a fresh file: `applied: [0001_initial_schema,
  0002_performance_indexes] · verified: true`.*
- **If nothing is pending** → nothing is applied. *Verified on a restart over the same file:*
  ```
  BRAIN_DB schema migrations applied · applied: [] · verified: true
  ```
- **If a migration fails** → it is rolled back cleanly (no partial schema, no ledger row) and
  **startup halts** with an error, so the app never serves on a half-migrated schema. (Rollback is
  covered by `migration-engine.test.ts`; see [RUNBOOK.md](RUNBOOK.md) → "A migration fails".)

## Data is preserved (verified)

Across the restart onto the new build over the same `BRAIN_DB`:

- **Durable learned state** — Company Brain, Executive Memory, Decision Journal, and the backup
  catalogue survive. *Verified:* the backup created before the restart was still present afterward
  (`backups` count unchanged).
- **Mission queue** — durable; a job interrupted by the restart is resumed. At startup the queue
  runs `recoverStale`, returning any `running` job whose lease expired to `pending` so the worker
  picks it up again (covered by `sql-mission-queue.test.ts` / `queue-worker.test.ts`).
- **Governance calibration** — durable; gate states are restored and recomputed at startup, so any
  Enforced→Observe auto-relax is applied before the first approval is served (covered by
  `governance-calibration.state.test.ts`).

## After the upgrade

```bash
curl -s http://localhost:4000/healthz     # → {"status":"pass",...}
```

Then confirm the durable pages render as expected (`/maintenance`, `/backups`, `/traces`).

## Rollback of an upgrade

If a new build misbehaves, stop it, restore the pre-upgrade backup
([DISASTER_RECOVERY.md](DISASTER_RECOVERY.md)), and start the previous build. Because migrations are
**forward-only** (no down-migrations), rolling *back* a schema change means restoring a backup taken
before that migration ran — which is why step 1 (back up first) is mandatory.
