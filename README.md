# AdOS — Enterprise AI Operating System for Advertising

> An **offline-first, AI advertising agency** platform. You don't operate agents —
> you run an **AI Company**. State a business objective and the platform, on
> locally-installed models, drafts the marketing brief, creative, and campaign
> plan — surfacing results and gating **every** step on your approval.
>
> **Honest scope (see [`PRODUCT_TRUTH.md`](PRODUCT_TRUTH.md), a source-of-code
> audit):** AdOS produces human-approved campaign **drafts**; it does not yet
> launch or optimize live campaigns on ad platforms, and several domains
> (agents/autonomy/workflow/connectors) are roadmap scaffolding. The default AI is
> a deterministic offline mode; connect a local engine (Ollama/vLLM) for live model
> output.

```
"Launch a patient-acquisition operation for a new dental clinic,
 80.000 TRY/month."
        └─► CEO approves ─► PMO plans ─► Marketing researches ─►
            Creative produces ─► Performance launches ─► Analytics watches ─►
            Strategy optimizes ─► CEO reports back to you.
```

## Principles (the Product Constitution)
1. **Offline-first** — works with no internet; no paid cloud AI ever *required*.
2. **AI Manager is the only thing that talks to models** — agents submit `AITask`s.
3. **Cognitive Core is the only thing that decides how to think** — agents delegate reasoning.
4. **Everything integrates through events** — no context imports another.
5. **Replaceable · configurable · multi-tenant · observable · testable** — the wired advertising pipeline is placeholder-free; some future domains (agent-framework, autonomy, workflow-engine, knowledge-engine, connector-hub) are event-contract scaffolding pending implementation.

Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full layered stack and
[`ROADMAP.md`](ROADMAP.md) for the build order. Current state is in
[`STATUS.md`](STATUS.md).

## Tech (all self-hostable)
- **Runtime:** TypeScript (strict) · Node ≥ 20 · NestJS · pnpm + Turborepo monorepo
- **Inference (local):** Ollama · vLLM · llama.cpp · SGLang · LM Studio · ComfyUI (FLUX/SD) · Whisper · Piper/XTTS
- **Data:** PostgreSQL / SQLite · LanceDB / FAISS (vectors) · Redis · NATS JetStream (events) · MinIO (storage)
- **Observability:** OpenTelemetry · Prometheus · Grafana · Jaeger · pino

## Repository layout
```
packages/            platform foundation (built)
  kernel/            DDD building blocks, Result, errors, CQRS ports
  config/            zod-validated configuration
  tenancy/           multi-tenant AsyncLocalStorage context
  observability/     pino + OpenTelemetry + Prometheus
  event-bus/         EventBus port + in-memory & NATS adapters + outbox
  contracts/         shared types, AITask, Cognitive Core, Mission contracts
  ai-manager/        AI Manager ports + Model Registry + capability Router
  cognitive-core/    AI Brain engine ports
domains/             bounded contexts (scaffolded: event contracts defined)
  corporate-os/ organization/ executive-ai/ agent-framework/
  marketing-intelligence/ creative-studio/ campaign-engine/ analytics-engine/
  workflow-engine/ connector-hub/ knowledge-engine/ agency-os/ autonomy/
docs/                architecture support, event map, otel/prometheus config
scripts/             tooling (domain topology generator)
```

## Getting started
```bash
# 1. Install a package manager if needed
npm i -g pnpm

# 2. Install workspace dependencies
pnpm install

# 3. Start local infrastructure (Postgres, Redis, NATS, MinIO, Ollama, observability)
pnpm infra:up

# 4. Pull local models (examples; match your inventory)
ollama pull qwen3:32b && ollama pull deepseek-r1:32b && ollama pull bge-m3

# 5. Build & test the foundation
cp .env.example .env
pnpm build && pnpm test
```

## Next
The foundation is complete. **Book 2 (AI Manager)** is the recommended next
pass — real Ollama/vLLM adapters + the `submit()`/`stream()` composition that
proves the golden rule end-to-end. Say **"build Book 2"** to proceed.
