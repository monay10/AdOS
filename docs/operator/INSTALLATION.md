# Installation Guide

> **Verified against** — Version: `v2.0.0-rc1` lineage + Deployment Sprints 1–2 · Commit: `bd35544` ·
> Last verified: **2026-07-29** · Verification: **manual (live app run) + automated tests**

A clean-machine install of the AdOS web app. 100% local — no cloud API, no external services.

## 1. Prerequisites (verified)

- **Node.js ≥ 22.5** for the durable store (`BRAIN_DB` uses the built-in `node:sqlite`). Node ≥ 20
  works only for the in-memory dev mode. *Verified on Node 26.3.0.*
- **pnpm** (workspace manager). *Verified on pnpm 9.15.9.*
- No database server, no message broker, no object store are required for the local deployment.

## 2. Build

```bash
pnpm install
pnpm --filter @ados/web build     # compiles the app + its workspace deps
```

*Verified:* the build completes with `tsc` and produces `apps/web/dist/main.js`.

## 3. First run

Pick a directory for the durable store and start the app. The durable learned state lives in one
local SQLite file named by `BRAIN_DB`.

```bash
BRAIN_DB="$HOME/ados/ados.sqlite" \
PORT=4000 \
SESSION_SECRET="$(openssl rand -hex 32)" \
node apps/web/dist/main.js
```

*Verified startup log:*

```
BRAIN_DB schema migrations applied · applied: [0001_initial_schema, 0002_performance_indexes] · verified: true
durable learned state enabled (Company Brain + Executive Memory + Decision Journal + Mission Queue + Governance Calibration, SQLite)
AdOS web app listening · port 4000
```

### What the first run does (all verified)

1. **Runs the schema migrations** against the fresh `BRAIN_DB` file — `0001_initial_schema` (all
   durable tables) then `0002_performance_indexes` — inside transactions, and **verifies** the
   schema before serving. A migration failure halts startup rather than serving a bad schema.
2. Enables the durable learned state (Brain / Executive Memory / Decision Journal / Mission Queue /
   Governance Calibration) on that file.
3. Starts the background queue worker and begins listening.

> **Note (honest scope):** without `DATABASE_URL`, the *operational aggregate* data (clients,
> missions, briefs) is in-memory. `BRAIN_DB` makes the *durable learned state* survive restarts; a
> durable aggregate store (Postgres) is a Series 3 · PostgreSQL concern. The startup log says so:
> `DATABASE_URL not set — using in-memory persistence`.

## 4. First health check (verified)

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4000/livez    # → 200 (process alive)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4000/readyz   # → 200 (ready for traffic)
curl -s http://localhost:4000/healthz                                    # → {"status":"pass",...}
```

`GET /metrics` exposes Prometheus metrics (always on).

## 5. First backup (verified)

Log in (dev passwordless mode when `AUTH_MODE` is unset) and create a backup:

```bash
# dev login → session cookie
curl -s -c ck.txt -X POST http://localhost:4000/login --data 'email=op@example.com&company=Acme'
# create a validated backup
curl -s -b ck.txt -X POST http://localhost:4000/backups/create   # → 303
```

*Verified result:* an `*.ados-backup` archive file appears under `"$HOME/ados/ados.sqlite.backups/"`,
and the catalogue row records `restore_validated = 1` (every backup is auto-validated by a dry-run
restore at creation). You can also create/inspect backups from the **Backups** page in the UI
(`/backups`). See [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md) for restore.

## 6. Key environment variables

| Var | Purpose | Verified default / note |
|-----|---------|-------------------------|
| `BRAIN_DB` | Path to the durable SQLite store | Unset → in-memory (not durable) |
| `PORT` | Listen port | `4000` |
| `SESSION_SECRET` | HMAC for session cookies | Random if unset (set it so sessions survive restart) |
| `BACKUP_DIR` | Where backup archives are written | `<BRAIN_DB>.backups` |
| `AUTH_MODE` | `password` for real auth; else dev passwordless | Unset → dev login (not for production) |
| `DATABASE_URL` | Postgres for aggregate data | Unset → in-memory aggregate |
| `LOG_PRETTY` | `true` for human-readable logs | JSON logs otherwise |

## Production notes (honest)

- Set `SESSION_SECRET` and `AUTH_MODE=password` for a real deployment; the dev passwordless login
  logs a warning and must not be used in production.
- The durable store is a single local file — see [RUNBOOK.md](RUNBOOK.md) for backups and
  maintenance, and [UPGRADE.md](UPGRADE.md) for installing a newer build over it.
