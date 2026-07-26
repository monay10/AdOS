# AdOS — Architecture

**AdOS (Enterprise AI Operating System)** is an offline-first, autonomous AI advertising agency: an operating system of AI agents organized like a real company, capable of planning, creating, launching, and optimizing advertising campaigns without human intervention except final approvals.

This document is the single canonical reference for how the system is layered and what rules every module obeys.

> **🧊 ARCHITECTURE FROZEN (2026-07-23).** The core is complete: Product
> Constitution · Foundation · AI Manager · Company Brain · Executive Memory
> System · Cognitive Core · Corporate OS · Organization Layer · Capability /
> Tool / Prompt Registries · Experience Engine · Decision Journal · Evidence
> Engine · Constitution Checker. No new layers. From here, energy goes into
> building the vertical modules (Campaign, Creative, Analytics, Workflow,
> Connectors) and the UI on top of this stable core.

---

## Product Constitution (non-negotiable rules)

1. **Offline-first.** The platform works fully offline. No feature depends on internet connectivity. No paid cloud service — OpenAI, Anthropic, Gemini, Azure AI — is ever *required*. Every AI capability runs on locally installed models.
2. **The AI Manager is the only component that talks to models.** No agent, engine, or department ever calls Ollama, vLLM, llama.cpp, SGLang, LM Studio, ComfyUI, Whisper, or Piper directly. They submit an **AITask**; the AI Manager routes, builds context, enforces safety, validates, remembers, and meters.
3. **The Cognitive Core is the only component that decides how to think.** Agents delegate planning, reasoning, decisions, evaluation, and policy to the Brain — they never hand-roll reasoning. The Core itself never touches an engine; it delegates inference to the AI Manager.
4. **Everything integrates through events.** Bounded contexts never import each other's code. The only cross-context coupling is domain events on the bus.
5. **Everything is replaceable, configurable, multi-tenant, observable, and testable.** No hardcoded business rules. No placeholders. No fake implementations.
6. **Capability Primacy.** Every intelligence capability is represented as a **Capability**, never a specific model, engine, or tool. Models are replaceable. Tools are replaceable. **Capabilities are permanent.** Agents request Capabilities → Capabilities orchestrate Tools → the AI Manager selects the implementation. Business logic must never depend on a specific AI model, inference engine, or tool.
7. **The Compounding Company.** AdOS is not an AI orchestration framework — it is a **living digital company**. Knowledge is more valuable than models; experience more valuable than prompts; capabilities more valuable than implementations. **Every completed task enriches the Company Brain**, every decision the Decision Brain, every campaign the Marketing Brain, every creative the Creative Brain. The company continuously becomes more intelligent through accumulated knowledge and experience — a competitive advantage no model swap can replicate.
8. **AI Determinism.** The platform must never behave like a black-box chatbot. Every AI output must be **reproducible** and **replayable**, and every AI task must produce a complete **execution trace** exposing: Mission · Context · Evidence · Capabilities · Tools · Model · Prompt Version · Temperature · Parameters · Confidence · Decision Journal entry · Events produced · Knowledge enriched. **Nothing is allowed to happen silently** — every execution is observable, every decision auditable, every response explainable.

---

## The canonical stack

```
┌──────────────────────────────────────────────────────────────────────┐
│  🎯 PRODUCT SURFACE  AI COMPANY — the user submits a MISSION            │
│     ("acquire patients for a new dental clinic, 80.000 TRY/month").    │
│     The company self-executes; the user sees only results + approval   │
│     gates. Agents are a backend detail, never the interface.           │
├──────────────────────────────────────────────────────────────────────┤
│  BUSINESS            Agency OS  (CRM · Portal · Billing · Support…)     │
├──────────────────────────────────────────────────────────────────────┤
│  📋 GOVERNANCE       Corporate Operating System (COS)                   │
│     SOP Engine + Library · Quality · Compliance · Policy · Approval ·  │
│     Risk · Audit + Decision Log · Continuous Improvement ·             │
│     Best Practice · Corporate Knowledge · AI Academy                   │
│     → No department acts without a documented, versioned SOP.          │
├──────────────────────────────────────────────────────────────────────┤
│  ORGANIZATION        Digital Company                                   │
│                      CEO Office · CMO/COO/CTO · PMO · HR · Legal ·      │
│                      Finance · Marketing · Creative · Sales · Analytics │
│                      · Customer Success · R&D · QA                      │
│                      (each: mission, goals, KPIs, memory, policies,     │
│                       processes, escalation & approval rules)           │
├──────────────────────────────────────────────────────────────────────┤
│  EXECUTIVES          CEO · CMO · Creative/Sales/Finance/Legal/Support   │
│                      Directors  (goals · delegate · review · approve)   │
├──────────────────────────────────────────────────────────────────────┤
│  AGENTS              Agent Framework                                    │
│                      Registry · Runtime · Lifecycle · State Machine ·   │
│                      Supervisor · Hierarchy (CEO→Manager→Worker) ·      │
│                      Sandbox · Permissions · Retry · Scheduler          │
├──────────────────────────────────────────────────────────────────────┤
│  DOMAIN ENGINES      Marketing Intelligence · Creative Studio ·         │
│                      Campaign Engine · Analytics Engine                 │
├──────────────────────────────────────────────────────────────────────┤
│  ORCHESTRATION       Workflow Engine   │   INTEGRATION  Connector Hub   │
├──────────────────────────────────────────────────────────────────────┤
│  🧩 CAPABILITY & TOOL REGISTRY — what the company can DO (permanent)    │
│     Capabilities (SEO · Ads · Copywriting · OCR · STT/TTS · Brand …)   │
│     orchestrate Tools (Crawler · PDF · OCR · Browser · Git · SQLite …) │
│     Agents request a Capability, never a model.                        │
├──────────────────────────────────────────────────────────────────────┤
│  🧠 COMPANY BRAIN — what the company KNOWS (compounds over time)        │
│     Brand · Marketing · Sales · Creative · Finance · Legal · SOP ·     │
│     Learning · Decision Brains · Knowledge Graph                       │
│     + Experience Engine · Pattern Library · Company DNA               │
│     → agents know nothing; they ASK the brain.                         │
├──────────────────────────────────────────────────────────────────────┤
│  👔 EXECUTIVE MEMORY SYSTEM — what each EXECUTIVE knows + governance     │
│     CEO/CMO/COO/Creative/Sales/Finance/Legal/PMO Memory ·             │
│     Decision Journal · Evidence Engine · Confidence Engine ·          │
│     AI Constitution Checker · Executive Context Builder · Board Meeting │
│     → every output: evidenced, confidence-scored, constitution-checked │
├──────────────────────────────────────────────────────────────────────┤
│  🧠 COGNITIVE CORE (AI Brain) — how to THINK                            │
│     Planning · Reasoning · Decision · Strategy · Reflection ·          │
│     Evaluation · Goal Manager · Policy · Execution Planner · Learning   │
├──────────────────────────────────────────────────────────────────────┤
│  ⚙️  AI MANAGER — how to RUN (selects the implementation)              │
│     Model Registry · Capability Registry · Tool Registry ·            │
│     Prompt Registry* · Memory Registry · Context Builder ·            │
│     Resource Scheduler · Queue · Inference Engine · Validation ·      │
│     Safety · Response Formatter · Learning · Monitoring · Metrics ·   │
│     Cost Analyzer (offline) · Cache · Retry · Event Publisher          │
│     AI Session · AI Task Graph (DAG) · Decision Memory                 │
│     (*Prompt Registry is its own bounded context: domains/prompt-registry) │
├──────────────────────────────────────────────────────────────────────┤
│  KNOWLEDGE           Knowledge Engine (Vector DB · Graph · RAG · OCR)   │
├──────────────────────────────────────────────────────────────────────┤
│  PLATFORM FOUNDATION Kernel · Config · Tenancy · Event Bus · Outbox ·   │
│                      Observability · Persistence · Cache · Secrets      │
├──────────────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE (self-hosted)                                          │
│     Ollama · vLLM · llama.cpp · SGLang · ComfyUI (FLUX/SD) · Whisper · │
│     Piper/XTTS · LanceDB/FAISS · Postgres/SQLite · Redis · NATS · MinIO │
└──────────────────────────────────────────────────────────────────────┘
```

A request flows **down** the layers (an executive sets a goal → the Brain plans → agents execute → domain engines act → the AI Manager runs local models) and results flow **back up** as events.

---

## Architectural patterns

- **Hexagonal (Ports & Adapters):** domain logic depends only on interfaces (`Repository`, `EventBus`, `AIManagerPort`, `InferenceEnginePort`…). Adapters (Postgres, NATS, Ollama, Google Ads) live at the edges and are swappable.
- **DDD:** each engine is a bounded context with aggregates, value objects, and domain events built on `@ados/kernel`.
- **CQRS:** commands mutate via aggregates; queries read from projections. See `@ados/kernel` `CommandHandler`/`QueryHandler`.
- **Event Sourcing where it pays:** the NATS JetStream backbone stores events durably and replayably; the transactional **Outbox** guarantees publish-on-commit.
- **Clean Architecture:** dependencies point inward — kernel and contracts depend on nothing; domains depend on contracts; adapters depend on domains.
- **Message Bus:** `@ados/event-bus` (in-memory for tests, NATS JetStream for production).
- **Multi-tenancy:** `TenantContext` (AsyncLocalStorage) threads tenant + correlation through every async boundary so isolation is never a forgettable parameter.

---

## Foundation packages (built — this pass)

| Package | Responsibility |
|---|---|
| `@ados/kernel` | Result, Entity, AggregateRoot, ValueObject, DomainEvent, Identifier, Guard, Repository/UoW ports, CQRS, typed error hierarchy |
| `@ados/config` | Zod-validated, layered configuration; fails fast on invalid env |
| `@ados/tenancy` | Ambient multi-tenant + correlation context |
| `@ados/observability` | pino structured logging, OpenTelemetry tracing, Prometheus metrics |
| `@ados/event-bus` | EventBus port + in-memory & NATS JetStream adapters + transactional Outbox relay |
| `@ados/contracts` | Shared value types + the **AITask**, **Capability**, **Tool**, **Prompt Registry**, **AI Session / Task Graph / Decision Memory**, **Cognitive Core** and **Mission** contracts |
| `@ados/ai-manager` | AI Manager sub-module **ports** (revised Book 2 structure) + Model Registry (seeded), capability Router w/ fallback, **Tool Registry** + **Capability Registry** (real, tested) |
| `@ados/cognitive-core` | Cognitive Core engine **ports** |
| `@ados/prompt-registry` (domain) | Versioned + scored prompt registry with A/B winner selection (real, tested) |
| `@ados/company-brain` (domain) | Company Brain: unified knowledge API, 10 sub-brains, Knowledge Graph, Experience Engine, Pattern Library, Company DNA — real in-memory adapter with sample-weighted compounding (real, tested) |
| `@ados/executive-memory` (domain) | Executive Memory System: per-role memory, Decision Journal, Evidence + Confidence engines, AI Constitution Checker, Executive Context Builder, Board Meeting Engine (real, tested) |

## Domain packages (scaffolded — event contracts defined, logic pending)

`agent-framework · knowledge-engine · workflow-engine · connector-hub · marketing-intelligence · creative-studio · campaign-engine · analytics-engine · executive-ai · organization · agency-os · autonomy`

Each has a real `package.json`, `tsconfig`, README, and a typed `events.ts` declaring what it publishes and consumes. See each `domains/<name>/README.md`.

---

## Local model inventory → capability map

Routing is by **capability**, never by hardcoded model name — swap a model by editing the registry, with zero agent changes.

| Capability | Primary | Fallbacks |
|---|---|---|
| reasoning | `deepseek-r1:32b` | `qwen3:32b` |
| chat | `qwen3:32b` | `gemma3:27b`, `phi4`, `mistral`, `llama3` |
| code | `qwen2.5-coder:32b` | `deepseek-coder:33b`, `qwen3:32b` |
| embedding | `bge-m3` | `nomic-embed-text` |
| vision | `gemma3:27b` | — |
| image_generation | `flux` (ComfyUI) | `stable-diffusion` |
| transcription | `whisper` | — |
| speech | `piper` | `xtts` |

If a model fails, the Router's fallback chain keeps the platform working (resilience mandate).

See [`docs/EVENT-MAP.md`](docs/EVENT-MAP.md) for the cross-domain event flow and [`ROADMAP.md`](ROADMAP.md) for the build order.
