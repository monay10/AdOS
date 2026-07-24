# AdOS — Production Deployment Report

Complete, self-hosted, offline-capable production deployment. Everything runs on
one machine (or one cluster) with no paid cloud dependency. Artifacts live under
[`deploy/`](deploy/); the health/verification code is [`@ados/deploy`](packages/deploy/).

## How to deploy

```bash
cp deploy/.env.production.example deploy/.env.production   # fill in secrets
docker compose --env-file deploy/.env.production -f deploy/docker-compose.production.yml up -d
```

The web app is served at `:4000`, Prometheus at `:9090`, Grafana at `:3001`,
Jaeger at `:16686`.

## Containers

| Container    | Image                         | Health endpoint / check          | Limits        | Restart |
| ------------ | ----------------------------- | -------------------------------- | ------------- | ------- |
| **web**      | built from `deploy/Dockerfile`| `GET /readyz` (503 until ready)  | 2 CPU / 1 GB  | unless-stopped |
| **workers**  | built from `deploy/Dockerfile`| `GET /livez` on `:9465`          | 2 CPU / 1 GB  | unless-stopped |
| **postgres** | `postgres:16-alpine`          | `pg_isready`                     | 2 CPU / 1 GB  | unless-stopped |
| **redis**    | `redis:7-alpine`              | `redis-cli ping`                 | 0.5 CPU / 256 MB | unless-stopped |
| **nats**     | `nats:2.10-alpine`            | `/healthz` (monitoring port)     | 1 CPU / 512 MB | unless-stopped |
| **minio**    | `minio/minio`                 | `mc ready local`                 | 1 CPU / 512 MB | unless-stopped |
| **ollama**   | `ollama/ollama`               | `ollama list`                    | 8 GB          | unless-stopped |
| **prometheus** | `prom/prometheus`           | `/-/healthy`                     | —             | unless-stopped |
| **grafana**  | `grafana/grafana`             | `/api/health`                    | —             | unless-stopped |
| **jaeger**   | `jaegertracing/all-in-one`    | HTTP root                        | —             | unless-stopped |

## Guarantees

- **Startup ordering** — `web` and `workers` declare `depends_on: { condition: service_healthy }`
  for Postgres, NATS, MinIO (and Redis), so the app tier never boots before its
  dependencies are ready.
- **Readiness gating** — every dependency is validated before a container reports
  ready. `web`/`workers` expose `/readyz`, which returns **503** until all critical
  dependencies (`@ados/deploy` `DeploymentVerifier`) pass. Load balancers gate on this.
- **Liveness** — `/livez` answers as long as the process is alive; a failing check
  triggers a restart under the `unless-stopped` policy.
- **Automatic database migration** — migrations run at process startup
  (`main.ts` / `worker.ts` call `runMigrations`), no manual step.
- **Automatic worker startup** — the `workers` container runs `worker.ts`, which
  boots the `WorkerHost` on the persistent queue and drains gracefully on SIGTERM.
- **Dependency validation** — Ollama, MinIO, NATS (and Postgres, Redis) are probed
  by `DeploymentVerifier` (TCP/HTTP) before readiness.
- **Persistent volumes** — `pgdata`, `redisdata`, `natsdata`, `miniodata`,
  `ollamadata`, `promdata`, `grafanadata` survive container recreation.
- **Graceful shutdown** — `stop_grace_period: 30s`; the app/worker drain in-flight
  work; queued jobs resume on the next start (nothing is lost).
- **Resource limits & restart policies** — every container is bounded and
  self-healing.
- **Environment separation** — the profile is set by `ADOS_PROFILE`; production
  requires real infrastructure and fails fast via `@ados/config`.
- **Secrets** — supplied through `deploy/.env.production` and read only via
  `@ados/config`; never hardcoded in the compose file.

## Health & operations endpoints (every app container)

| Endpoint        | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `GET /livez`    | Liveness — process is alive                         |
| `GET /readyz`   | Readiness — all dependencies reachable (gate traffic)|
| `GET /healthz`  | Full health snapshot                                |
| `GET /diagnostics` | Runtime/container diagnostics (pid, node, memory)|
| `GET /metrics`  | Prometheus exposition (scraped by Prometheus)       |

## Verification

`packages/deploy/src/deploy.test.ts` verifies the health aggregation, the
deployment verifier's readiness logic, the container diagnostics + startup report,
and that the compose stack defines every required service with healthchecks,
resource limits, restart policies, `service_healthy` ordering and persistent
volumes. `apps/web/src/ops.test.ts` verifies the live `/livez`, `/readyz` (503 on a
down dependency), `/metrics` and `/diagnostics` endpoints over HTTP.
