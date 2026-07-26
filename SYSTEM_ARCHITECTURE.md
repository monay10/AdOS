# AdOS — System Architecture (runtime view)

Design/module architecture lives in `ARCHITECTURE.md`. This document is the
**runtime** view — processes, boundaries, and data flow for operators.

## Monorepo shape

pnpm workspaces + Turborepo, strict TypeScript (ESM/NodeNext, composite project
references). 35 workspaces in three tiers:

- **`packages/*`** — infrastructure ports & adapters (kernel, contracts,
  persistence, storage, workers, backup, security, observability, event-bus,
  tenancy, ai-manager, config, cache, recovery, deploy, bench).
- **`domains/*`** — business modules (agency-os, marketing-intelligence,
  creative-studio, campaign-engine, analytics-engine, executive-ai,
  company-brain, executive-memory, …). **Frozen; never modified by infra work.**
- **`apps/*`** — `web` (UI + API), plus demo.

## Processes & boundaries

```
        Browser ──HTTP──►  apps/web (main.ts)
                            │  session auth · TenantContext · i18n locale
                            ▼
                     domain services  ──events──►  event bus
                            │                          │
                     AIManagerPort               subscribers (feed, audit)
                            │
             ┌──────────────┴───────────────┐
     OfflineAIManager                 LiveAIManager
     (deterministic)            local engine (Ollama/vLLM/…)  ← only code
                                  localhost, no cloud            reaching a model

  apps/web/worker.js ──► durable job queue (guarded claim, lease recovery)
  apps/web/ops.js    ──► backup / restore / recovery
  Persistence: SqliteDatabase (dev) | PostgresDatabase (prod), one QueryExecutor port
  Storage:     LocalFileStorage (dev) | object storage adapter (prod)
```

## Key invariants

- **Tenant isolation** — `TenantContext` (AsyncLocalStorage) scopes every query,
  event, job and storage key. Set at the HTTP boundary from the session.
- **Request locale** — resolved from `Accept-Language` at the boundary and held
  ambient (AsyncLocalStorage), so UI + AI share one language per request.
- **AI Constitution** — no agent talks to an inference engine directly; all AI
  work goes through `AIManagerPort`, which is the only model-facing code.
- **Config-gated infra** — every production capability is wired at the app
  boundary behind an env flag and defaults to prior behavior.

## Data flow (a Mission)

1. User submits a Mission (objective + budget + target metric).
2. Marketing Intelligence generates a Brief via `AIManagerPort` → human approves.
3. Creative Studio → Campaign Engine → Analytics Engine, each gated by approval.
4. Executive AI synthesizes a CEO dashboard; Company Brain records the learning.
5. Every step emits a domain event (audit + activity feed), tenant-scoped.

See `API_REFERENCE.md` for the HTTP surface and `DEPLOYMENT_REPORT.md` for the
container topology.
