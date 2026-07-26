# AdOS — Administrator Guide

For operators who install, configure and run AdOS for their organization.
Complements `OPERATIONS_GUIDE.md` (day-2 ops) and `INSTALLATION_GUIDE.md` (setup).

## Deployment modes

| Mode | Auth | Data | AI | Use |
| --- | --- | --- | --- | --- |
| Dev | passwordless | in-memory | offline stub | local trials |
| Staging | `AUTH_MODE=password` | Postgres | local model | pre-prod |
| Production | `AUTH_MODE=password` + HTTPS | Postgres + backups | local model | live |

## First-time setup (production)

```bash
AUTH_MODE=password \
AUTH_SECURE_COOKIES=true \
SESSION_SECRET=$(openssl rand -hex 32) \
DATABASE_URL=postgres://…  DATABASE_MAX_CONNECTIONS=20 \
AI_ENGINE=ollama AI_MODEL=qwen2.5:7b \
node apps/web/dist/main.js
```

Run `worker.js` as a separate replica for background jobs. Front with HTTPS
(TLS terminating proxy). See `DEPLOYMENT.md` for the container stack.

## Tenancy

- A **tenant** is a company (slugified name). Data is isolated per tenant by
  `TenantContext` on every operation.
- Enforce **unique company names** at signup so two orgs can't collide on a slug.

## User & access management

- **Password mode** stores Argon2id credentials (`@node-rs/argon2`); users
  register, reset, and change passwords via the auth routes.
- **Roles/RBAC** are resolved into the session principal (`@ados/security`).
- **Brute-force protection** locks an `(ip, email)` pair after 5 failures / 15
  min (429 + Retry-After); success resets it. No configuration needed.

## Configuration

All via environment variables — see the table in `INSTALLATION_GUIDE.md`. Config
is validated at startup; an invalid or missing required value stops the process
before it reports ready.

## Backups & recovery

- Schedule backups via `ops.js` (`BackupService`) — see `BACKUP_GUIDE.md`.
- Rehearse restores; they self-validate (SHA-256).
- DR procedure, RTO/RPO: `DISASTER_RECOVERY.md`.

## Monitoring

- Prometheus `/metrics`; structured pino logs with `requestId` + `tenantId`.
- Alert on: error rate > 0, queue/DLQ growth, failed readiness, backup age.

## Security

Full posture in `SECURITY_GUIDE.md` / `SECURITY_REPORT.md`: CSP + security
headers on every response, tenant isolation, Argon2id, rate limiting, HTTPS/HSTS.
