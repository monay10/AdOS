# AdOS — Operations Runbook

Operator procedures for failure scenarios. All commands run from the repo root;
production uses `deploy/docker-compose.production.yml`. Recovery is orchestrated by
`@ados/recovery` (see [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md)).

## Health & status

```bash
curl -fsS http://<web>:4000/livez     # process alive
curl -fsS http://<web>:4000/readyz    # dependencies reachable (503 until ready)
curl -fsS http://<web>:4000/healthz   # full snapshot
curl -fsS http://<web>:4000/metrics   # Prometheus metrics
docker compose -f deploy/docker-compose.production.yml ps   # container health
```

## Scenario procedures

### Application crash / server restart / power failure
1. Containers auto-restart (`restart: unless-stopped`).
2. On boot: dependencies are gated (`depends_on: service_healthy`), migrations run
   automatically, and startup verification gates readiness.
3. Confirm: `GET /readyz` returns 200; check `/healthz`.
   *RPO 0 (committed data), RTO 1–2 min.*

### Worker crash / queue corruption
1. In-flight jobs are recovered automatically when their lease expires
   (`WorkerHost.recover` / `JobStore.recoverStale`).
2. Inspect the dead-letter queue; requeue if appropriate:
   `deadLetters.list()` → `deadLetters.requeue(id)`.
   *RPO 0 (jobs are persisted before running), RTO seconds.*

### Database loss
1. Provision a fresh Postgres (volume `pgdata`); the app auto-runs migrations.
2. Restore the latest backup:
   `RestoreService.restore({ backupId })` (integrity + checksum + compatibility
   verified first). Or run a full `RecoveryManager` recovery.
3. Validate consistency (`RecoveryValidation`), confirm `/readyz`.
   *RTO minutes, RPO = last backup.*

### Storage (MinIO) loss
1. Recreate the bucket (auto-created on first use).
2. Restore objects from backup (`StorageBackupSource` via `RestoreService`).
   *RTO minutes, RPO = last backup.*

### Configuration / secret corruption
1. Startup **fails fast** (`@ados/config` `assertStartup` → `ConfigurationError`) —
   the app refuses to run rather than serve broken.
2. Fix `deploy/.env.production` / config; redeploy. Verify with the startup report.
   *No data loss; the guard prevents a bad-config launch.*

### Interrupted migration
1. Migrations are forward-only + idempotent; simply restart — the runner re-applies
   only what's missing (`schema_migrations` ledger).
   *RTO seconds, RPO 0.*

### Backup restore (planned / drill)
1. Pick a backup (point-in-time via the catalogue's `createdAt` + parent chain).
2. `RestoreService.restore({ backupId, dryRun: true })` to verify, then without
   `dryRun` to apply. Backups self-validate restorability at creation time.

## Restart modes
- **Cold start:** `docker compose ... up -d` — ordered, migrated, verified.
- **Warm restart:** `docker compose ... restart web workers` — queue resumes.
- **Rolling restart:** cycle replicas one at a time behind `/readyz`.
- **Graceful shutdown:** `docker compose ... stop` (honours `stop_grace_period`;
  in-flight work drains, queued work resumes on next start).

## Escalation
- Metrics/dashboards: Grafana `:3001` (Workers, Backup, System dashboards).
- Traces: Jaeger `:16686`.
- Backups not validating → check `backup_restore_validated_fail_total`; do not rely
  on an unvalidated backup — take a fresh one.
