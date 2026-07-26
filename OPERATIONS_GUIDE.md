# AdOS — Operations Guide

Day-2 operations for running AdOS in production. Complements `RUNBOOK.md`
(incident playbooks) and `DEPLOYMENT_REPORT.md` (container topology).

## Processes

| Process | Entry | Role |
| --- | --- | --- |
| Web | `apps/web/dist/main.js` | HTTP UI + API, session auth, request handling |
| Worker | `apps/web/dist/worker.js` | Drains the durable job queue |
| Ops | `apps/web/dist/ops.js` | Backup / restore / recovery tasks |

Run web and worker as separate replicas; size the Postgres pool so
`(web + worker replicas) × DATABASE_MAX_CONNECTIONS ≤ Postgres max_connections`.

## Health & readiness

- **Liveness/readiness** gated by dependency verification at startup (config →
  DB → migrations). A failed dependency prevents the process from reporting ready.
- **Metrics:** Prometheus at `/metrics` (request rate/latency, worker
  throughput, queue depth, backup timing). Scrape and alert on error rate > 0 and
  queue depth growth.
- **Logs:** structured JSON via pino; set `LOG_PRETTY=true` for humans,
  `LOG_LEVEL` to control verbosity. Every request carries a `requestId`; domain
  events carry `tenantId` + `correlationId`.

## Routine tasks

- **Backups:** schedule full + incremental (`ops.js`, `BackupService`) — see
  `BACKUP_GUIDE.md`. Verify restores periodically (self-validating).
- **Queue:** monitor DLQ depth; a growing DLQ means a handler is failing
  repeatedly — inspect, fix, re-drive.
- **Sessions:** set a stable `SESSION_SECRET` so sessions survive restarts.

## Scaling

- **Web** is stateless (session in a signed cookie) — scale horizontally.
- **Workers** claim jobs with a guarded atomic update — scale horizontally; a
  crashed worker's in-flight jobs are re-driven on lease expiry.
- **Database:** raise `DATABASE_MAX_CONNECTIONS` with Postgres capacity.

## Security operations

- `AUTH_MODE=password` (Argon2id), `AUTH_SECURE_COOKIES=true`, HTTPS in front.
- Brute-force lockout (5 fails / 15 min → 429 + Retry-After) is automatic.
- Security headers/CSP applied to every response. See `SECURITY_REPORT.md`.

## Disaster recovery

RTO/RPO, backup restore, and the `RecoveryManager` steps are in
`DISASTER_RECOVERY.md` and `RECOVERY_REPORT.md`.
