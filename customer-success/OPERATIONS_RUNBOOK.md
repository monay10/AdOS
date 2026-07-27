# AdOS — Operations Runbook

> **Owner:** Operations Enablement / Customer Success
> **Status:** Official — aligned to PRODUCT_TRUTH.md
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)

AdOS is the **Enterprise AI Operating System for Advertising** — an offline-first,
100% local-AI platform that takes a client's advertising objective (a **Mission**)
through a **human-approved pipeline** (marketing brief → creative copy → campaign
**draft** → performance report → executive dashboard) and remembers what works in a
marketing-performance **Company Brain**. It **drafts**; it never launches live ads.

## How to read this runbook

- **AdOS is self-hosted and offline.** Your instance runs on **your own
  infrastructure**, with **no phone-home telemetry** and **no cloud dependency**.
  **Your admin team runs every procedure here.** The vendor has **no standing
  access** to your instance and cannot see your usage, health, or data unless you
  export and share it (see [SUPPORT_PLAYBOOK.md](SUPPORT_PLAYBOOK.md) and
  `CUSTOMER_HEALTH.md`).
- **Persistence is optional.** Out of the box AdOS uses in-memory repositories;
  durable storage engages only when `DATABASE_URL` is set (SQLite or Postgres).
  **Backup, restore, and recovery procedures apply only when persistence is
  enabled.** With in-memory mode, a restart is a clean slate — there is nothing to
  back up and nothing to restore.
- **AI is local.** The default engine is the deterministic **OfflineAIManager** (no
  model server, no network). Genuine model prose requires a **locally-run** engine —
  Ollama or any OpenAI-compatible local server (vLLM / LM Studio / llama.cpp /
  SGLang). "AI model updates" throughout this runbook means **you** updating **your
  local** model or engine — never a cloud push from the vendor.
- **Monitoring here means:** the in-app **activity log**, the **per-approval
  timeline**, **structured logs** (pino JSON), Prometheus **metrics** at `/metrics`,
  and **health checks** (`/livez`, `/readyz`, `/healthz`). This is **not** an
  immutable audit trail (see the Roadmap callout).
- Each section below is an **actionable checklist** with **Owner**, **Cadence**,
  **Expected result**, and an **Escalation trigger**. Escalation follows the
  severity model in [SUPPORT_PLAYBOOK.md](SUPPORT_PLAYBOOK.md).

---

## Reference: health & entry points

Commands run from the repo root; production uses
`deploy/docker-compose.production.yml`. The three process roles are:

| Process | Entry | Role |
| --- | --- | --- |
| Web | `apps/web/dist/main.js` | HTTP UI + API, session auth, request handling |
| Worker | `apps/web/dist/worker.js` | Drains the durable job queue |
| Ops | `apps/web/dist/ops.js` | Backup / restore / recovery tasks |

```bash
curl -fsS http://<web>:4000/livez     # process alive
curl -fsS http://<web>:4000/readyz    # dependencies reachable (503 until ready)
curl -fsS http://<web>:4000/healthz   # full snapshot
curl -fsS http://<web>:4000/metrics   # Prometheus metrics
docker compose -f deploy/docker-compose.production.yml ps   # container health
```

Optional observability back-ends (only if you deploy them): Grafana `:3001`
(ten provisioned dashboards), Jaeger `:16686` (traces, active only when
`OTEL_EXPORTER_OTLP_ENDPOINT` is set — a no-op offline).

---

## 1. Daily operations

**Owner:** Support Engineer (customer-side admin) · **Cadence:** Every business day

| # | Check | Expected result |
| --- | --- | --- |
| 1 | `GET /livez` and `GET /readyz` on every web replica | Both 200; `/readyz` never stuck at 503 |
| 2 | `docker compose ... ps` | All containers `healthy`; none restarting in a loop |
| 3 | Scan structured logs for `error`/`fatal` (filter by `requestId` / `tenantId`) | No unexplained error spikes since yesterday |
| 4 | Dead-letter queue (DLQ) depth via metrics (`workers_dead_total`) | Flat; a growing DLQ means a handler is failing repeatedly |
| 5 | Login works and the in-app **activity feed** is advancing | Users can authenticate; new Missions/approvals appear |
| 6 | **If persistence enabled:** confirm the scheduled backup ran | Newest backup is within your RPO window (see §6) |
| 7 | **If a local AI engine is attached:** engine endpoint reachable | Pipeline stages produce model prose (not the offline fallback) |

**Escalation trigger:** `/readyz` stuck at 503 after a restart, a container in a
restart loop, DLQ climbing without draining, or users unable to log in →
raise a ticket per [SUPPORT_PLAYBOOK.md](SUPPORT_PLAYBOOK.md) (**Sev 1** if
production is down or logins fail; **Sev 2** if a pipeline stage is failing with no
workaround).

---

## 2. Weekly operations

**Owner:** Support Engineer + Solution Architect (customer-side) · **Cadence:** Weekly

- [ ] Review the week's `web_http_errors_total` and `web_http_request_duration_ms`
      trend on the HTTP/Application dashboards — **Expected:** error rate at/near 0,
      p95 latency stable.
- [ ] Review worker metrics (`workers_started/succeeded/dead/retried_total`,
      `workers_duration_ms`) — **Expected:** success ≫ dead; no growing retry backlog.
- [ ] Inspect the DLQ; requeue anything transient (`deadLetters.list()` →
      `deadLetters.requeue(id)`) and file a defect for anything recurring.
- [ ] Confirm auth health via `web_auth_auth_login_failed_total` vs `_succeeded_total`
      — **Expected:** no sustained failed-login spike (brute-force lockout is
      automatic: 5 fails / 15 min → 429 + Retry-After).
- [ ] Confirm a stable `SESSION_SECRET` is set so sessions survive restarts.
- [ ] **If persistence enabled:** confirm backups completed all week and the newest
      is validated (`backup_restore_validated_ok_total` advancing, no
      `..._fail_total`).
- [ ] Spot-check the **per-approval timeline** on a recent Mission — **Expected:**
      every stage shows an explicit human approval (`strategy_and_budget`,
      `creative_assets`, `campaign_launch`).

**Escalation trigger:** a persistent p95 latency regression, a recurring DLQ handler
failure, or a **backup validation failure** (`backup_restore_validated_fail_total`
> 0) → **Sev 2/Sev 3** per [SUPPORT_PLAYBOOK.md](SUPPORT_PLAYBOOK.md). Never rely on
an unvalidated backup — take a fresh one immediately.

---

## 3. Monthly operations

**Owner:** Solution Architect (customer-side) + CSM · **Cadence:** Monthly

- [ ] **Restore drill** (see §7) — restore the newest backup into a scratch
      environment and validate. **Expected:** clean restore, consistency checks pass.
- [ ] **Capacity review** (see §9) — compare memory/CPU/queue-depth/connection-pool
      headroom against growth in users, brands, and Mission volume.
- [ ] **Performance review** (see §8) — re-check latency/throughput against the
      baseline in `../PERFORMANCE_REPORT.md`.
- [ ] Review retention: confirm ≥ 30 days of full backups + incremental chains, and
      that an offsite copy exists.
- [ ] Rotate/verify secrets policy: `SESSION_SECRET`, DB credentials, and the
      **backup encryption key** are held in your secrets manager — **not** stored
      with the archives.
- [ ] Review the **Company Brain** growth with the CSM (mission counts, KPI reports,
      pattern-library additions) — this is **customer-shared** evidence for health
      scoring, exported by your team; the vendor does not auto-collect it.
- [ ] Check for a new AdOS release; plan the upgrade window per `../UPGRADE_GUIDE.md`.

**Escalation trigger:** a failed restore drill, capacity headroom below your
threshold, or a performance regression beyond your tolerance → **Sev 2/Sev 3** and
loop in the Solution Architect.

---

## 4. Quarterly operations

**Owner:** CSM + Executive Sponsor (customer-side) + Solution Architect
· **Cadence:** Quarterly (aligns with the EBR cadence)

- [ ] **Executive Business Review (EBR):** review adoption maturity (M1–M5), campaign
      throughput, and Company Brain growth using **exported** data your team shares —
      not vendor telemetry (see `CUSTOMER_HEALTH.md`).
- [ ] **Full disaster-recovery rehearsal:** run a complete `RecoveryManager` recovery
      into a scratch environment and record measured RTO/RPO from the
      `RecoveryReport` (see `../DISASTER_RECOVERY.md`).
- [ ] **Security review:** confirm `AUTH_MODE=password` (Argon2id),
      `AUTH_SECURE_COOKIES=true`, HTTPS termination in front, and that CSP/HSTS
      headers are applied (see `../SECURITY_REPORT.md` if present).
- [ ] **Local AI model review** (see §10): decide whether to refresh your local
      model/engine; validate any change in a non-production instance first.
- [ ] **Capacity & scaling plan:** project the next quarter's web/worker replica
      count and Postgres `max_connections` budget.
- [ ] Review certification coverage of your admins (Associate → Trainer) so at least
      one certified Administrator owns this runbook.

**Escalation trigger:** DR rehearsal misses your RTO/RPO objectives, a security
control is found disabled, or capacity projection exceeds provisioned headroom →
schedule remediation with the Solution Architect; open a ticket per severity.

---

## 5. Incident response

**Owner:** Support Engineer (triage) → Solution Architect (fix)
· **Cadence:** On demand · **Severity model:**
[SUPPORT_PLAYBOOK.md](SUPPORT_PLAYBOOK.md)

1. **Classify** using the shared severity model:
   - **Sev 1 — Critical:** production down / cannot log in / data-loss risk.
   - **Sev 2 — High:** a pipeline stage failing, no workaround.
   - **Sev 3 — Normal:** limited/partial impact, workaround exists.
   - **Sev 4 — Low:** question / cosmetic / how-to / enhancement idea.
2. **Stabilize** with the matching scenario in `../RUNBOOK.md`:
   - App crash / restart / power loss → containers auto-restart
     (`restart: unless-stopped`); confirm `/readyz` 200. *RTO 1–2 min, RPO 0.*
   - Worker crash / queue corruption → lease expiry re-queues in-flight jobs
     (`WorkerHost.recover` / `JobStore.recoverStale`); inspect DLQ. *RPO 0.*
   - Database loss **(persistence only)** → provision fresh DB (auto-migrates),
     restore latest backup (`RestoreService.restore`). *RPO = last backup.*
   - Config / secret corruption → startup **fails fast** (`assertStartup`
     → `ConfigurationError`); fix `deploy/.env.production`, redeploy. *No data loss.*
   - Interrupted migration → forward-only + idempotent; simply restart. *RPO 0.*
3. **Capture evidence:** `requestId`, `tenantId`, `correlationId` from structured
   logs; the per-approval timeline; relevant `/metrics` and (if deployed) Grafana
   panels / Jaeger traces.
4. **Communicate & close** per SLA response targets in
   [SUPPORT_PLAYBOOK.md](SUPPORT_PLAYBOOK.md). Note: SLA is the **vendor's response
   time**, not a remote fix — your team executes the recovery.

**Escalation trigger:** any Sev 1, or a Sev 2 you cannot stabilize with the RUNBOOK
scenarios, → engage vendor support immediately (see "When to escalate to vendor
support").

---

## 6. Backup verification

**Owner:** Solution Architect (customer-side) · **Cadence:** Daily automated +
weekly manual check · **Applies only when persistence is enabled (`DATABASE_URL`
set).**

Each backup archive is **gzip-compressed, AES-256-GCM encrypted, and SHA-256
checksummed**, and **auto-validates on creation** (checksum + structure), so a
stored backup is known-good.

```bash
node apps/web/dist/ops.js backup --tenant <tenantId>               # full
node apps/web/dist/ops.js backup --tenant <tenantId> --incremental # incremental
```

- [ ] **Schedule:** full daily, incremental hourly (or per significant change).
- [ ] **Verify creation:** `backup_backup_completed_total` and
      `backup_restore_validated_ok_total` advance; `backup_backup_size_bytes` is
      non-zero and plausible.
- [ ] **Freshness alert:** alert if the newest backup is older than your RPO.
- [ ] **Retention:** ≥ 30 days of fulls + chains; keep an **offsite** replica.
- [ ] **Key hygiene:** encryption key lives in your secrets manager, **not** with
      the archives.

**Expected result:** a current, validated, offsite-replicated backup set within RPO.

**Escalation trigger:** `backup_restore_validated_fail_total` > 0, missing scheduled
backups, or newest backup older than RPO → **Sev 2**; take a fresh full backup and
do not trust the failed archive.

---

## 7. Restore verification (rehearsal)

**Owner:** Solution Architect (customer-side) · **Cadence:** Monthly (restore drill)
+ Quarterly (full DR rehearsal) · **Applies only when persistence is enabled.**

Restore **verifies then applies** — integrity, checksum, and compatibility are
checked before any write.

```bash
# 1) Dry-run against a SCRATCH environment (verify only, no writes)
node apps/web/dist/ops.js restore --backup <backupId>   # RestoreService dry-run first
```

- [ ] Pick a point-in-time backup (catalogue `createdAt` + parent chain).
- [ ] Run the restore with `dryRun: true` to verify, then without to apply — **into a
      scratch environment, never production**.
- [ ] Validate consistency (`RecoveryValidation` gates tenant + knowledge
      consistency); confirm `/readyz` returns 200 on the restored instance.
- [ ] For the quarterly rehearsal, run the full ordered recovery (`configStep` →
      `dependencyStep` → `migrationStep` → `backupRestoreStep` → `queueRecoveryStep`
      → `consistencyStep`) and record measured **RTO** (`report.rtoMs`) and **RPO**
      (`report.rpoMs`).

**Expected result:** clean restore, consistency checks pass, measured RTO/RPO within
objectives. A successful scratch restore **is** your proof of recoverability.

**Escalation trigger:** restore fails verification, consistency checks fail, or
measured RTO/RPO miss objectives → **Sev 2**; engage the Solution Architect and
vendor support.

---

## 8. Performance review

**Owner:** Solution Architect (customer-side) · **Cadence:** Monthly (light) +
Quarterly (full)

Baselines are in `../PERFORMANCE_REPORT.md` (comparative, in-process figures — not
absolute SLAs; establish your own SLAs from your hardware).

- [ ] Compare current `web_http_request_duration_ms` (p50/p95/p99) and
      `web_http_requests_total` / `web_http_errors_total` against your rolling
      baseline — **Expected:** error rate at/near 0; latency stable under normal load.
- [ ] Compare worker throughput (`workers_duration_ms`, `workers_succeeded_total`)
      and queue depth against baseline.
- [ ] **If Postgres:** confirm the pool is sized (`DATABASE_MAX_CONNECTIONS`, default
      20) and that `(web + worker replicas) × DATABASE_MAX_CONNECTIONS ≤ Postgres
      max_connections`.
- [ ] Review system metrics (CPU seconds, resident memory, event-loop lag) for
      saturation.
- [ ] Note that offline AI stages are deterministic and fast; a **local model
      engine** adds latency proportional to your model/hardware — measure it after
      any model change (see §10).

**Expected result:** performance within your established SLAs with headroom.

**Escalation trigger:** sustained latency regression, rising error rate, or event-loop
lag indicating saturation → **Sev 3** (or **Sev 2** if user-visible), and move to
the capacity review.

---

## 9. Capacity review

**Owner:** Solution Architect (customer-side) · **Cadence:** Monthly review +
Quarterly plan

- [ ] **Web** is stateless (session in a signed cookie) — scale replicas
      horizontally behind `/readyz`.
- [ ] **Workers** claim jobs with a guarded atomic update — scale horizontally; a
      crashed worker's in-flight jobs are re-driven on lease expiry.
- [ ] **Database (Postgres):** raise `DATABASE_MAX_CONNECTIONS` with Postgres
      capacity, keeping `(web + workers) × max_connections ≤ Postgres max_connections`.
- [ ] Track growth drivers: number of workspaces/clients/brands, active users,
      Missions per week, backup size and duration, and Company Brain growth.
- [ ] Confirm storage headroom for backups and their offsite replica.
- [ ] Project the next quarter's replica counts and connection budget from the trend.

**Expected result:** provisioned headroom comfortably exceeds projected demand.

**Escalation trigger:** projected demand within one quarter of a hard limit (pool
exhaustion, memory pressure, storage) → plan scale-out with the Solution Architect
before it becomes an incident.

---

## 10. AI model updates (local engine / model management)

**Owner:** Solution Architect (customer-side) · **Cadence:** Quarterly review, or on
demand

**All AI is local. There is no cloud model and no vendor push.** "AI model updates"
means **you** managing **your own** local engine and model. AdOS default is the
deterministic **OfflineAIManager** (no server, no network); to get genuine model
prose you attach a **local** engine via `AI_ENGINE` — Ollama or any
OpenAI-compatible local server (vLLM / LM Studio / llama.cpp / SGLang). No cloud
endpoint or API key is ever used.

- [ ] **Decide the engine:** stay on `OfflineAIManager` (deterministic, air-gap) or
      attach a local engine. `AI_ENGINE` is **off by default**; no change unless set.
- [ ] **Update the local model** on **your** engine host (e.g. pull/replace the model
      in Ollama, or update the model your OpenAI-compatible local server loads).
- [ ] **Validate in a non-production instance first:** run a full pipeline (brief →
      creative → campaign draft → report → executive dashboard) and confirm output
      quality, TR/EN language behavior, and that JSON/schema handling still passes.
- [ ] **Measure latency** after the change (see §8) — a larger model changes
      per-stage timing.
- [ ] **Confirm offline posture:** the engine endpoint is on your network; no
      outbound cloud calls (only localhost AI `fetch` exists in AdOS).
- [ ] **Roll forward** to production during a maintenance window; keep the previous
      model available to roll back.

**Expected result:** the chosen local model serves the pipeline with acceptable
quality and latency, fully offline.

**Escalation trigger:** pipeline stages fail schema/JSON validation, produce wrong
language output, or regress latency badly after a model change → revert to the prior
model/`OfflineAIManager` and open a **Sev 3** with the Solution Architect.

---

## 11. Health checks

**Owner:** Support Engineer (customer-side) · **Cadence:** Continuous (probes) +
daily glance

- [ ] Container readiness probe wired to `/readyz` (and, where used,
      `RecoveryHealthCheck` — config + dependency + backup-verify dry-run +
      consistency) so a node that cannot prove its own recoverability never accepts
      traffic.
- [ ] `/livez` for liveness, `/healthz` for a full snapshot on demand.
- [ ] `/metrics` scraped by Prometheus; alert on error rate > 0 and on queue-depth
      growth.
- [ ] Startup is **dependency-gated** (config → DB → migrations); a failed dependency
      keeps the process from reporting ready — treat a stuck `/readyz` as a real
      dependency fault, not a flaky probe.
- [ ] Structured logs (pino JSON) flowing; `LOG_LEVEL` set appropriately,
      `LOG_PRETTY=true` only for human debugging.

**Expected result:** all probes green; unready nodes are held out of rotation
automatically.

**Escalation trigger:** `/readyz` red after startup verification, or health checks
flapping → follow §5 Incident response.

---

## 12. Troubleshooting (symptom → checks → fixes)

**Owner:** Support Engineer (customer-side) · **Cadence:** On demand

| Symptom | Checks | Fix |
| --- | --- | --- |
| `/readyz` stuck at 503 | `/healthz` snapshot; startup logs for config/DB/migration failure | Fix the failing dependency (config/secret/DB). Config errors **fail fast** by design — correct `deploy/.env.production` and redeploy. |
| App container restart loop | `docker compose ... ps`; container logs | Usually a bad config/secret (`assertStartup`) or unreachable DB. Fix and redeploy; volumes persist. |
| Users cannot log in | Auth metrics (`web_auth_auth_login_failed_total`); lockout state | Brute-force lockout is automatic (5 fails / 15 min → 429 + Retry-After) — wait out `Retry-After` or clear the source. Confirm `SESSION_SECRET` is stable. |
| Sessions dropped after restart | Whether `SESSION_SECRET` is stable across replicas/restarts | Set a fixed `SESSION_SECRET`; signed-cookie sessions then survive restarts. |
| DLQ growing / jobs failing | `workers_dead_total`, `deadLetters.list()` | Inspect the failing handler; fix root cause; `deadLetters.requeue(id)` transient items. |
| In-flight jobs lost on worker crash | Worker logs; lease/heartbeat | None needed — lease expiry re-queues via `recoverStale`. Confirm recovery, not manual replay. |
| Pipeline stage produces canned/template text | Whether `AI_ENGINE` is set and the local engine endpoint is reachable | Default `OfflineAIManager` is deterministic templates by design. Attach/repair the **local** engine for model prose (see §10). |
| Migration interrupted | `schema_migrations` ledger; startup logs | Restart — the runner is forward-only + idempotent and re-applies only what's missing. |
| Backup won't validate | `backup_restore_validated_fail_total`; ops logs | Do **not** trust it; take a fresh full backup; verify encryption key + storage health. |
| Restore fails verification | Checksum/compatibility errors from `RestoreService` | Choose another point-in-time backup in the parent chain; escalate if none validate. |
| Latency spike under load | HTTP latency histogram; event-loop lag; DB pool waits | Scale web/workers; size Postgres pool (`DATABASE_MAX_CONNECTIONS`); see §8/§9. |
| Traces/dashboards empty | Whether `OTEL_EXPORTER_OTLP_ENDPOINT` is set; Grafana/Jaeger deployed | Optional back-ends; offline they are no-ops. Deploy/point them if you want traces. |
| "Missing" audit history | Activity feed is a bounded in-memory ring of 50 | By design — use structured logs + per-approval timeline for history; see the Roadmap callout for immutable audit. |

**Escalation trigger:** any symptom you cannot resolve with the fix column, or that
recurs after a fix, → open a ticket per [SUPPORT_PLAYBOOK.md](SUPPORT_PLAYBOOK.md)
severity.

---

## When to escalate to vendor support

Because AdOS is **self-hosted on your infrastructure**, your admin team performs all
operations above and the **vendor has no standing access** to your instance.
Escalate to vendor support when:

- You hit a **Sev 1** (production down, cannot log in, data-loss risk) or a **Sev 2**
  you cannot stabilize with the `../RUNBOOK.md` scenarios.
- A **backup will not validate** or a **restore/DR rehearsal fails**, and no backup
  in the chain validates.
- You suspect a **product defect** (a pipeline stage, migration, or recovery step
  behaving against its documented contract).
- You need **guidance, a patch, or an upgrade** (`../UPGRADE_GUIDE.md`), or planning
  help for capacity/scale from the Solution Architect.

What to include (there is no vendor-side telemetry, so **you** provide the evidence):
the severity, affected process/tenant, `requestId` / `tenantId` / `correlationId`
from logs, relevant `/metrics` or dashboard panels, and the steps already tried.
The vendor delivers **guidance, patches, and remote assistance where you permit it**;
the SLA is the vendor's **response** time, not a remote fix — your team executes the
change. See [SUPPORT_PLAYBOOK.md](SUPPORT_PLAYBOOK.md).

---

## Roadmap — not available today

> The following are **future directions only** and are **not** capabilities of AdOS
> v1.0.0. Do not build operational procedures that depend on them today.
>
> - **Immutable / tamper-evident audit trail.** Today AdOS provides structured logs,
>   a per-approval timeline, and a bounded in-memory activity ring (50 entries) —
>   **not** an append-only audit store.
> - **Enforced RBAC / permission-aware AI.** Roles are defined but **not enforced**;
>   the AI is not permission-scoped. Governance today is the human approval gate at
>   every pipeline stage.
> - **Vendor-side monitoring / phone-home telemetry / auto-populating health
>   dashboards.** There is none. Health and adoption data are **exported and shared
>   by your team**, never collected by the vendor.
> - **External connectors / syncs** to ad platforms, CRMs, or data warehouses.
>   connector-hub is an unwired scaffold; analytics are entered by hand.
> - **Cloud / hosted AI inference.** All inference is local; the cloud-inference flag
>   is never read.
> - **DB-level Row-Level Security.** Isolation today is **application-level**.
> - **Autonomous agents / "Digital Employees"** doing operational work, and **live ad
>   launch/optimization.** AdOS is human-in-the-loop and drafts-only.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
