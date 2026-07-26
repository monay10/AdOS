# AdOS — Deployment

Concise deploy guide. Container topology and the verification behind it are in
`DEPLOYMENT_REPORT.md`; day-2 operations in `OPERATIONS_GUIDE.md`.

## Topology

```
        HTTPS proxy (TLS, HSTS)
                │
        ┌───────┴────────┐
        ▼                ▼
   web replica ×N    web replica
        │  (stateless: session in signed cookie)
        ├──────────────┬─────────────┐
        ▼              ▼             ▼
    PostgreSQL     local model    object storage
                   (Ollama/…)
        ▲
   worker replica ×N  (drains the durable job queue)
   ops (backup/restore/recovery, scheduled)
```

## Container stack

```bash
pnpm turbo run build
docker compose up -d        # web + workers + Postgres + observability
```

## Production process invocation

```bash
AUTH_MODE=password AUTH_SECURE_COOKIES=true \
SESSION_SECRET=… DATABASE_URL=… DATABASE_MAX_CONNECTIONS=20 \
AI_ENGINE=ollama AI_MODEL=qwen2.5:7b \
node apps/web/dist/main.js      # web
node apps/web/dist/worker.js    # worker (separate replica)
```

## Pre-flight

- [ ] `pnpm turbo run build test` green.
- [ ] `DATABASE_URL` set (migrations run at startup, forward-only, idempotent).
- [ ] `SESSION_SECRET` stable and secret.
- [ ] Pool math: `(web + worker replicas) × DATABASE_MAX_CONNECTIONS ≤ Postgres
      max_connections`.
- [ ] Local inference engine reachable and a model pulled.
- [ ] Backups scheduled (`BACKUP_GUIDE.md`); a restore drill has passed.
- [ ] `/metrics` scraped; alerts wired.

## Zero-downtime upgrade

Deploy the new version alongside the old (migrations are idempotent), shift
traffic, retire the old instance. Rollback via backup restore + previous tag —
see `UPGRADE_GUIDE.md`.

## Readiness

Startup verifies config → DB → migrations before reporting ready; a failed
dependency keeps the instance out of the load balancer.
