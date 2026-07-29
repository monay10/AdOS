# Disaster Recovery

> **Verified against** — Version: `v2.0.0-rc1` lineage + Deployment Sprints 1–2 · Commit: `bd35544` ·
> Last verified: **2026-07-29** · Verification: **manual (live app run) + automated tests**

Recovering the durable local store from a backup. The full round-trip below was **run against the
live app** on 2026-07-29 and the result observed at each step.

## Scope (honest)

- Covers the **durable learned state** on `BRAIN_DB` (Company Brain, Executive Memory, Decision
  Journal + archive, Mission Queue, Governance Decisions + Calibration, Maintenance log).
- Does **not** cover in-memory aggregate data (clients / missions / briefs) — that needs a durable
  aggregate store (`DATABASE_URL`, Series 3 · PostgreSQL).
- Backups exclude their own catalogue table, so a restore never overwrites the live, newer catalogue.

## 1. Create a backup

UI: **Backups** page → *Create backup now*. CLI:

```bash
curl -s -b ck.txt -X POST http://localhost:4000/backups/create   # → 303
```

Every backup is **auto-validated** at creation by a dry-run restore; the catalogue row shows
`validated`. *Verified:* an `*.ados-backup` archive appears under `<BRAIN_DB>.backups/` with
`restore_validated = 1`.

## 2. Verify a backup before trusting it (dry run)

UI: **Backups** → *Verify / Restore…*. CLI:

```bash
curl -s -b ck.txt -X POST http://localhost:4000/backups/verify --data "id=<BACKUP_ID>"
```

The dry run checks **integrity, compatibility, checksums, no-missing-files, and consistency** and
touches nothing. *Verified:* a good backup reports "safe to restore" and the live data was unchanged
by the dry run.

## 3. Restore (behind explicit confirmation)

Restore **replaces** all current durable data with the backup — it is gated on an explicit
confirmation.

UI: after a passing verify, click *Confirm restore — replace current data*. CLI:

```bash
curl -s -b ck.txt -X POST http://localhost:4000/backups/restore --data "id=<BACKUP_ID>&confirm=yes"
```

*Verified round-trip (live app, 2026-07-29):*

1. Backup created — captured `governance_calibration` = 3 gates in `observe`.
2. **Corruption injected** — `strategy_and_budget` forced to `enforced` in the SQLite file.
3. **Restore** (`confirm=yes`) → HTTP 200.
4. **Result** — all three gates back to `observe`; the corruption was gone.

### How the restore stays safe (verified by test + code)

- **Transactional** — the restore replaces table contents inside one transaction on the live
  connection, so a crash mid-restore rolls back rather than leaving a half-restored store.
- **Rehydrate, no restart** — after a successful restore the app reloads its in-memory state
  (`App.rehydrate`: brain / executive memory / journal restore + queue recover + calibration
  recompute), so the running app immediately reflects the restored data (covered by
  `backup.e2e.test.ts`).
- **Without confirmation** — a restore POST without `confirm=yes` only re-shows the dry-run check and
  changes nothing (*verified:* live data stayed corrupted until the confirmed call).

## 4. Post-restore checks

```bash
curl -s http://localhost:4000/healthz     # → {"status":"pass",...}
```

Confirm the restored durable state on `/traces` (calibration), `/maintenance` (storage), and any
mission data. If the file itself is lost, re-create `BRAIN_DB` by starting the app (migrations rebuild
the schema), then restore the most recent good archive from `<BRAIN_DB>.backups/`.

## 5. If a backup fails verification

Do **not** restore it — the dry-run check exists precisely so a bad backup is caught before it can
replace good data. Use the most recent backup that reports `validated` / "safe to restore".
