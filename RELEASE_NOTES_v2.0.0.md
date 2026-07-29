# AdOS v2.0.0 — Release Notes

**Tag:** `v2.0.0` · **Line:** `release/2.0` · **Date:** 2026-07-29 · **Predecessor:** `v2.0.0-rc1`

> Written to the same discipline as [`PRODUCT_TRUTH.md`](PRODUCT_TRUTH.md): only capabilities backed
> by **wired code + passing tests** (or a live-app run) are listed as delivered. Everything else is
> under **Deferred / Known limitations**. No marketing language — verifiable statements only.
> 100% local — no cloud API, no external services, no telemetry.

## What v2.0.0 is

The reliability backbone of the founding architecture — *offline, governance-first, learning,
human-approval-centred* — is complete. v1 proved the concept; **v2.0 makes it durable, multi-tenant,
recoverable, and operable.**

Verification at release: **`pnpm typecheck` 57/57 packages · `pnpm test` 57/57 packages** (web app
244 tests), plus a live-app Release Readiness Audit (see below).

## Delivered in the Series 2 line

Each item is backed by tests and documented in PRODUCT_TRUTH; representative evidence in parentheses.

- **Durable learned state** — the whole Company Brain (marketing/creative/SOP/sales/DNA/brand +
  experience/pattern/knowledge-graph), Executive Memory, and the Decision Journal persist to a local
  SQLite file (`BRAIN_DB`) and restore at startup (`brain-persistence*.test.ts`,
  `executive-persistence.test.ts`).
- **Multi-tenant isolation** — every learned-state store is scoped per tenant; tenant A's data can
  never ground tenant B's output (`tenant-isolation.test.ts`). *Application-enforced* (DB-level RLS is
  deferred — see below).
- **Recommendation → Apply** — a recommendation becomes a governed, **queued** mission that stops at
  the human approval gate; never an autonomous launch (`recommendation-apply.e2e.test.ts`).
- **Async Queue Worker + durable Mission Queue** — idempotent enqueue, atomic claim + lease (no
  duplicate execution), exponential backoff, crash recovery/resume via lease expiry, graceful
  shutdown (`mission-queue.test.ts`, `queue-worker.test.ts`, `sql-mission-queue.test.ts`).
- **Runtime resilience** — retry, per-model circuit breaker, and fallback across the routed model
  chain, surfaced as an inference-resilience panel (`resilience-stats.test.ts`).
- **Governance maturity ladder** — Observe → Advisory → Required-review → **Enforced**, plus
  **Auto-Calibration**: a per-gate state machine (Observe → Candidate → Enforced → Observe) over the
  durable decision history, with a strict safety asymmetry — the system may only ever *auto-relax*
  enforcement; *tightening* a gate to Enforced is always an operator action
  (`governance-calibration*.test.ts`).
- **Storage / data lifecycle** — storage metrics, Decision-Journal compaction (Active → immutable
  Frozen archive), and VACUUM with reclaimed-bytes reporting (`maintenance*.test.ts`).

## Operational closure (RC → final)

`v2.0.0-rc1` was declared feature-complete; the following operational items were required to make it
**shippable** and were completed as Series 3 · Deployment Sprints 1–3, then folded into this release:

- **App-integrated Backup & Restore** — create a checksummed, auto-validated snapshot of the durable
  store, dry-run a restore (integrity / compatibility / checksums / consistency), and apply one behind
  an explicit confirmation; restore is transactional and rehydrates in-memory state (no restart). No
  more manual file copying (`backup-manager.test.ts`, `backup.e2e.test.ts`).
- **Versioned schema migration engine** — plan → apply-in-transaction → rollback-on-failure → verify,
  with a `schema_migrations` history ledger; ordered, idempotent, forward-only; auto-runs at startup
  and halts on a bad schema (`migration-engine.test.ts`, `migrations.test.ts`).
- **Verified operator guides** — [`docs/operator/`](docs/operator/) (Installation, Upgrade, Disaster
  Recovery, Runbook), produced by a Release Readiness Audit: every step was run against the live app
  and its result observed before being written. These supersede the unverified pre–Series-2 root
  guides.

**Live-app audit evidence (2026-07-29, Node 26.3.0):** startup auto-migration
`applied: [0001_initial_schema, 0002_performance_indexes], verified: true`; health `/livez` 200,
`/readyz` 200, `/healthz` pass; first backup produced an `*.ados-backup` archive with a validated
catalogue row; a restart applied no migrations and preserved data; a disaster-recovery round-trip
(corrupt → confirmed restore → reverted) succeeded.

## Deferred / Known limitations

Honest scope of this release:

- **Operational aggregate data** (clients, missions, briefs) is in-memory unless `DATABASE_URL`
  (Postgres) is set; **Backup/Restore covers the durable learned state on `BRAIN_DB`, not in-memory
  aggregate data.** A durable local aggregate store is a Series 3 concern.
- **DB-level Row-Level Security is not implemented.** Tenant isolation is application-enforced.
  Deliberately deferred to Series 3 · PostgreSQL (SQLite has no real RLS; an app-layer shim now would
  be discarded at the Postgres migration).
- **Governance Auto-Calibration is global-per-gate** (not per-tenant), recomputed on view/after each
  decision (no separate scheduler); production thresholds keep a fresh install in Observe until real
  history accrues.
- **Migrations are forward-only** (no down-migrations); rolling back a schema change means restoring a
  pre-migration backup. The per-store `CREATE IF NOT EXISTS` DDL is retained alongside the migration
  registry for the in-memory/test paths (schema in two places, transitionally).
- **Operator guides cover the local single-operator SQLite deployment.** Multi-user / Postgres install
  paths are Series 3.
- The **pre–Series-2 top-level guide docs** at the repo root are legacy and unverified; use
  `docs/operator/` and `PRODUCT_TRUTH.md`.

## Install / upgrade

See [`docs/operator/INSTALLATION.md`](docs/operator/INSTALLATION.md) and
[`docs/operator/UPGRADE.md`](docs/operator/UPGRADE.md). Requirements: Node ≥ 22.5 (for the built-in
`node:sqlite` used by `BRAIN_DB`), pnpm. Set `BRAIN_DB`, `SESSION_SECRET`, and `AUTH_MODE=password`
for a real deployment.

## Branch / support model

- **`release/2.0`** — this line. Accepts only bug fixes, security, performance, and documentation.
- **`main`** — Series 3 development (Observability → Multi-user → PostgreSQL + RLS). No Series 3
  features are backported to `release/2.0`.

## What's next (Series 3 — planning only, not in this release)

Observability (health/throughput/latency/DB-health dashboard), then Multi-user (authn/authz/orgs/
roles), then PostgreSQL (real RLS, advisory locks, LISTEN/NOTIFY, concurrent workers, online
migration).
