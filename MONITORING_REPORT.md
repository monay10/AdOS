# AdOS — Monitoring & Observability Report

AdOS uses one observability spine — [`@ados/observability`](packages/observability/):
`telemetry(component)` bundles **structured logging** (pino), **tracing** (OpenTelemetry
spans, exported to Jaeger when `OTEL_EXPORTER_OTLP_ENDPOINT` is set, no-op offline),
and **metrics** (prom-client on a shared registry scraped at `/metrics`). Every
subsystem instruments through it, so instrumentation is consistent and never
duplicated. This item verified coverage and filled the one real gap — the HTTP
layer.

## What changed (missing instrumentation only)

- **HTTP layer** (`apps/web/src/server.ts`): every request now runs inside a
  `web.server.request` span (traces cover HTTP), carries a generated **request id**,
  and emits `web_http_requests_total{method,status}`, `web_http_errors_total{method}`
  and the `web_http_request_duration_ms` histogram, plus a structured completion log.
  No business module was touched.
- **Grafana dashboards** (`deploy/grafana/provisioning/dashboards/json/`): ten
  provisioned dashboards — System, Application, AI, Workers, Storage, Database,
  Events, Authentication, Backup, Business KPIs.

## Signal coverage

| Concern            | Where it comes from                                                        | Status |
| ------------------ | -------------------------------------------------------------------------- | ------ |
| Structured logging | `telemetry().logger` (pino) in every component                             | ✅ live |
| Tracing            | `telemetry().span` — HTTP, AI, event bus, storage, workers, backup, config | ✅ live (Jaeger when OTLP set) |
| Metrics            | `telemetry().count/observe` + prom-client defaults at `/metrics`           | ✅ live |
| Correlation IDs    | `RequestContext.correlationId` bound per session; propagated onto every event + job | ✅ live |
| Tenant IDs         | `TenantContext.tenantId` on every log, event, job and query scope          | ✅ live |
| Request IDs        | generated per HTTP request in `server.ts`                                  | ✅ live |
| Worker IDs         | `WorkerHost.id` on job audit + heartbeat                                   | ✅ live |
| Mission / Campaign IDs | domain events carry aggregate ids + tenant (activity feed + logs)      | ✅ live |
| AI requests        | boundary-wired when a real engine is attached (offline `OfflineAIManager` today) | ⚠️ boundary |
| Storage operations | `StorageMetrics` + `StorageEvents` + `StorageAudit`                         | ✅ live |
| Database operations| migrations logged; query latency wired when a real DB adapter is attached  | ⚠️ boundary |
| Event bus          | events published + subscribed (activity feed); counters boundary-wired      | ⚠️ boundary |
| Background jobs    | `JobMetrics` + `WorkerEvents` + `JobAudit` (enqueue→dead, duration)         | ✅ live |
| Authentication     | `loggerAudit` → `web_auth_*` counters + per-event audit log                 | ✅ live |
| Backups            | `BackupMetrics` + `BackupEvents` + `BackupAudit`                            | ✅ live |

⚠️ boundary = the instrumentation helper exists and the dashboard panel is ready;
the counter populates once the real engine/DB/bus adapter is wired at the app
boundary (they run in-memory/offline in the current build). No business module is
modified to light these up — they attach at the boundary like the AI Manager.

## Exported metrics (verified)

Live and asserted by `apps/web/src/monitoring.test.ts`:

- **System** — `process_cpu_seconds_total`, `process_resident_memory_bytes`,
  `nodejs_heap_size_used_bytes`, `nodejs_eventloop_lag_seconds` (prom-client defaults).
- **HTTP** — `web_http_requests_total`, `web_http_errors_total`,
  `web_http_request_duration_ms` (count/latency/errors).
- **Storage** — `storage_object_uploaded_total`, `storage_object_downloaded_total`,
  `storage_object_bytes`, `storage_object_scan_flagged_total`.
- **Workers** — `workers_started_total`, `workers_succeeded_total`,
  `workers_dead_total`, `workers_retried_total`, `workers_duration_ms`.
- **Backup** — `backup_backup_completed_total`, `backup_backup_size_bytes`,
  `backup_restore_validated_ok_total`, `backup_restore_completed_total`.
- **Auth** — `web_auth_auth_login_succeeded_total`, `web_auth_auth_login_failed_total`,
  `web_auth_auth_reset_completed_total`.
- **Config** — `config_loaded_ok_total`, `config_configured_subsystems`.

Metric taxonomy checklist (CPU, Memory, Disk, Queue Length, Worker Count, Worker
Failures, HTTP Requests, HTTP Errors, Latency, DB/Storage/AI Latency, Mission /
Campaign / Backup / Restore Duration) is mapped across the dashboards above; the
boundary-marked ones populate when their adapter is attached.

## Traces

`telemetry().span` wraps: HTTP requests (`web.server.request`), storage operations
(`StorageTracing`), background jobs (`JobTracing`), backup/restore (`BackupTracing`),
config load (`ConfigurationTracing`), and — via `getNodeAutoInstrumentations` in
`initTracing` — the AI Manager, event bus, database and outbound calls. Offline,
spans are a no-op and never block; with `OTEL_EXPORTER_OTLP_ENDPOINT` set they export
to Jaeger (`:16686`).

## Verification

`apps/web/src/monitoring.test.ts` asserts the HTTP metrics + process defaults are
exported at `/metrics`, that the subsystem metric taxonomy (storage/workers/backup/
auth/config) is correctly named and exported, that tracing spans execute, and that
all ten dashboards are valid and reference exported metrics.
