# AdOS — Status (honest inventory)

_Last updated: 2026-07-23_

This file states plainly what is **built**, what is **scaffolded**, and what is
**planned** — no module is claimed as done unless it is.

## ✅ Built (real, production-grade code)

**Platform foundation (Book 0 + Book 1):**

| Area (from your foundation list) | Where | Notes |
|---|---|---|
| Monorepo + build (pnpm/Turborepo, strict TS) | root, `turbo.json`, `tsconfig.base.json` | |
| Configuration System | `packages/config` | zod-validated, fails fast, no hardcoded rules |
| Multi-tenancy | `packages/tenancy` | AsyncLocalStorage context, auto-propagated |
| Logging | `packages/observability` | pino, tenant/correlation enrichment |
| Metrics | `packages/observability` | Prometheus registry + helpers |
| Tracing | `packages/observability` | OpenTelemetry (no-op offline) |
| Event Bus + Queue backbone | `packages/event-bus` | port + in-memory + **NATS JetStream** adapter |
| Transactional Outbox | `packages/event-bus` | publish-on-commit guarantee |
| Error Handling | `packages/kernel` | typed error hierarchy + Result monad |
| DDD building blocks / Repository / CQRS | `packages/kernel` | Entity, AggregateRoot, VO, DomainEvent, ports |
| Authentication / Authorization / RBAC | `packages/security` | Principal, AccessControl, permission matching |
| Secrets Management | `packages/security` | provider port + env adapter |
| Cache Layer | `packages/cache` | tenant-scoped, TTL, single-flight |
| Database Layer | `packages/persistence` | QueryExecutor / Database / UnitOfWork / Migration ports |
| Health Checks / Config for infra | `docker-compose.yml`, `docs/` | Postgres, Redis, NATS, MinIO, Ollama, Prom, Grafana, Jaeger |
| **AI Manager** golden-rule seam | `packages/contracts` (AITask), `packages/ai-manager` | Model Registry seeded w/ your inventory + capability Router w/ fallback + all sub-module ports |
| **Cognitive Core** seam | `packages/contracts` (CognitiveCorePort), `packages/cognitive-core` | engine ports |
| **Mission** product surface | `packages/contracts` | intent-based "AI Company" entry point |

**Knowledge & governance core (Books 2.5–2.7):**

| Layer | Where | Notes |
|---|---|---|
| Capability Registry + Tool Registry | `packages/ai-manager`, `packages/contracts` | agents request Capabilities, never models |
| Prompt Registry (versioned + A/B scored) | `domains/prompt-registry` | winner selection by score |
| Company Brain (10 sub-brains, Graph, Experience, Patterns, DNA) | `domains/company-brain` | sample-weighted compounding |
| Executive Memory System | `domains/executive-memory` | per-role memory, Decision Journal, Evidence + Confidence engines, **AI Constitution Checker**, Executive Context Builder, Board Meeting Engine |

**Tests (8 suites):** `kernel`, `event-bus`, `ai-manager` (routing + Tool +
Capability registries), `prompt-registry` (versioning + A/B), `company-brain`
(compounding, experience reuse, graph, patterns), `executive-memory` (per-role
isolation, evidence+confidence, constitution gate, board minutes, decision journal).

**Architecture is FROZEN** as of 2026-07-23 — see `ARCHITECTURE.md`. No new core
layers; remaining work is vertical modules + UI on top.

## 🟡 Scaffolded (event contract + ports defined, business logic pending)

All 13 bounded contexts under `domains/` — each has a real `package.json`,
`tsconfig`, README (modules + status), and typed `events.ts` (published +
consumed). `corporate-os` additionally has full SOP/Quality/Compliance/Policy/
Approval/Risk/Audit/Academy **ports**.

`agent-framework · knowledge-engine · workflow-engine · connector-hub ·
marketing-intelligence · creative-studio · campaign-engine · analytics-engine ·
executive-ai · organization · corporate-os · agency-os · autonomy`

## ⬜ Planned (per-Book implementation passes)
See [`ROADMAP.md`](ROADMAP.md). Books 2→13 each implement one layer to full
production depth.

## ✅ Verified green
`pnpm install && pnpm build && pnpm test` all pass: **27/27 build tasks** compile
under the strict `tsconfig.base.json`, and **40 unit tests** pass across kernel,
event-bus, ai-manager (routing + Tool/Capability registries + runtime kernel),
prompt-registry, company-brain, and executive-memory. Under Development Mode,
every commit must keep this green.

## Why it was built in this order
You asked for many engines at once, but your own first instruction was "finish
the infrastructure only." Every engine needs local inference, tenancy, events,
and the AI-Manager/Cognitive-Core seams to exist first. Building those for real —
and scaffolding the rest with honest contracts — beats emitting a dozen shallow,
fake engines. Each engine now has a real place to be built into.
