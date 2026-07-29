# Series 2 — Feature-Complete · v2.0.0 Release Candidate

> **Single source of truth:** [`PRODUCT_TRUTH.md`](PRODUCT_TRUTH.md). This document is the
> honest release-readiness ledger for Series 2. It follows the same discipline: every line
> is backed by **wired code + a passing test**, or it is marked ⚠️/❌ and scoped forward.
> It does **not** trust the pre–Series-2 top-level guide docs (they predate this discipline
> and have not been re-verified). 100% local — no API, no external services, no telemetry.

**Status:** Series 2 is **feature-complete**. From here the Series 2 line accepts only
**bug fixes, performance, security, and documentation** — no new features. New capability
work proceeds under **Series 3** (see below). This is the freeze.

**Verification snapshot (this commit):** `pnpm typecheck` → **57/57 packages**;
`pnpm test` → **57/57 packages**, web app **233 tests** passing.

---

## Release checklist — honest status

| # | Item | Status | Evidence / honest note |
|---|------|--------|------------------------|
| 1 | **Typecheck** | ✅ | `pnpm typecheck` — 57/57 packages, strict TS (`exactOptionalPropertyTypes`). |
| 2 | **Test** | ✅ | `pnpm test` — 57/57 packages; `apps/web` 233 tests. |
| 3 | **Recovery test** | ✅ | Queue crash-recovery `recoverStale` (`sql-mission-queue.test.ts`, `queue-worker.test.ts`); learned-state restore (`brain-persistence.test.ts`, `executive-persistence.test.ts`). |
| 4 | **Cold start** | ✅ | `brain-persistence.app.test.ts` — App restores durable state on `start()`; a default `new App()` stays pure in-memory (no accidental persistence). |
| 5 | **Restart** | ✅ | Cross-instance persistence over the SAME store proven for queue, brain, executive memory, decision journal, and governance calibration (`sql-*`, `*-persistence`, `governance-calibration.state.test.ts`). |
| 6 | **Tenant isolation** | ✅ | `tenant-isolation.test.ts` — two tenants' brain/recommendations/experience never cross; application-enforced via `TenantContext`. (DB-level RLS is Series 3 — see below.) |
| 7 | **Queue recovery** | ✅ | Atomic claim + lease, idempotent enqueue/processing, exponential backoff, graceful shutdown (`mission-queue.test.ts`, `queue-worker.test.ts`, `sql-mission-queue.test.ts`, `recommendation-apply.e2e.test.ts`). |
| 8 | **Governance recovery** | ✅ | Auto-Calibration state survives restart; enforcement recomputed at boot (`governance-calibration.state.test.ts` cross-instance; `App.start()` restore+recompute). |
| 9 | **Memory persistence** | ✅ | Company Brain + Executive Memory + Decision Journal durable + restored (`brain-persistence*.test.ts`, `executive-persistence.test.ts`). |
| 10 | **Storage lifecycle** | ✅ | Metrics + journal compaction (Frozen archive) + VACUUM with reclaimed-bytes (`maintenance.test.ts`, `maintenance.e2e.test.ts`). |
| 11 | **Documentation** | ✅ | `PRODUCT_TRUTH.md` (the honest ledger) + Books A–H design specs. |
| 12 | **Backup / Restore** | ✅ (Series 3 · Deployment · Sprint 1) | **Now app-integrated.** Operators create a checksummed, auto-validated snapshot of `BRAIN_DB`, dry-run a restore, and apply one behind a confirmation from `/backups`; restore is transactional + rehydrates in-memory state (no restart). `apps/web/src/backup-manager.ts` over `@ados/backup`; `backup-manager.test.ts` + `backup.e2e.test.ts`. No more manual file copying. |
| 13 | **Upgrade / migration** | ✅ (Series 3 · Deployment · Sprint 2) | **Now a versioned migration engine.** `MigrationEngine` runs at startup: plan → apply-in-transaction → rollback-on-failure → verify, with a `schema_migrations` history ledger; ordered, idempotent, forward-only. `packages/persistence/src/migration-engine.ts` + `apps/web/src/migrations.ts`; `migration-engine.test.ts` + `migrations.test.ts`. Newer versions install safely. |
| 14 | **Operator manual** | ✅ (Series 3 · Deployment · Sprint 3) | **Verified operator guides** in [`docs/operator/`](docs/operator/) — Installation, Upgrade, Disaster Recovery, Runbook — produced as a Release Readiness Audit: every step was **run against the live app** (or a passing test) and observed before being written. Each carries a "Verified against `bd35544` / 2026-07-29" header. Supersedes the pre–Series-2 root guides. |

**Read of the table:** the *execution + governance + persistence core* was v2.0-ready and
test-backed (items 1–11) at RC. The former ⚠️ items (12–14) — app-integrated Backup & Restore,
a versioned migration engine, and verified operator guides — are now **✅ done** (Series 3 ·
Deployment · Sprints 1–3). **All 14 checklist items are green**, so final `v2.0.0` is ready to
cut (see Tagging).

---

## Tagging

- **`v2.0.0-rc1`** — cut at this commit: Series 2 feature-complete, items 1–11 green.
- **`v2.0.0`** (final) — **ready to cut.** All 14 checklist items are green (Deployment Sprints
  1–3 resolved items 12–14). The Deployment work lives on `main`; cutting the final tag means
  merging it into `release/2.0` and tagging there (see Branch model), then publishing Release Notes.

Prior tags: `v1.0.0`, `v1.0.0-rc1`.

## Branch model (from v2.0.0-rc1 onward)

- **`release/2.0`** — the frozen Series 2 maintenance line. Accepts **only** bug fixes,
  security, performance, and documentation. The `v2.0.0-rc1` tag lives on this line; the
  eventual `v2.0.0` final tag is cut here.
- **`main`** — the Series 3 development line (Deployment, backup/restore integration,
  migration infrastructure, observability, and later PostgreSQL + RLS). New features land
  here, never on `release/2.0`.

`v2.0.0-rc1` is published to `origin` as a Release Candidate (not a final release) so the
team can test the exact same commit and track the `release/2.0` line.

---

## What Series 2 became

The founding architecture — **offline, governance-first, learning, human-approval-centred**
— gained its reliability backbone: durable persistence of all learned state, per-tenant
isolation, a durable fire-and-forget mission queue with crash recovery, a storage/data
lifecycle (compaction + VACUUM), and **adaptive governance** (the Auto-Calibration policy
engine, where a machine may only ever *relax* enforcement and only a human may *tighten* it).

## Series 3 — the next major line (planning only; no work started)

Not new agents — **enterprise maturity**:

1. **Observability** — health dashboard; queue throughput; worker / planner / governance
   latency; memory growth; DB health.
2. **Deployment** — real install / update / **backup / restore** / migration experience.
   *Progress: Sprint 1 (Backup & Restore) ✅ · Sprint 2 (versioned migration engine) ✅ ·
   Sprint 3 (verified operator guides — Release Readiness Audit) ✅. Deployment milestone COMPLETE →
   final v2.0.0 ready to cut on `release/2.0`.*
3. **Multi-user** — authentication, authorization, organizations, tenants, roles.
4. **PostgreSQL** — real Row-Level Security, advisory locks, LISTEN/NOTIFY, concurrent
   workers, online migration. **DB-level RLS lives here**, deliberately deferred from
   Series 2 (SQLite has no real RLS; an app-layer stand-in written now would be discarded
   at the Postgres migration).
