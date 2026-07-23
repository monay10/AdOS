# AdOS — Build Roadmap

AdOS is built as an ordered series of "Books". Each Book is a focused,
production-grade pass that is fully completed — tests, docs, logging, metrics,
config, error handling — before the next begins. This ordering is deliberate:
every Book depends on the ones above it.

Legend: ✅ built · 🟡 scaffolded (contracts/ports + events defined, logic pending) · ⬜ planned

| Book | Layer | Package(s) | Status |
|---|---|---|---|
| **0** | Product Constitution | `ARCHITECTURE.md` (rules), `docs/` | ✅ |
| **1** | Platform Foundation | `kernel`, `config`, `tenancy`, `observability`, `event-bus`, `contracts`, infra (`docker-compose`) | ✅ |
| **2** | AI Manager (offline runtime) | `ai-manager` (ports + Model Registry + Router) | 🟡 → next |
| **2.5** | Company Brain (what the company knows) | `domains/company-brain`, `domains/prompt-registry` | ✅ in-memory adapters + tests |
| **2.7** | Executive Memory System (per-exec memory + governance) | `domains/executive-memory` | ✅ in-memory adapters + tests |
| **3** | Cognitive Core (AI Brain) | `cognitive-core` (engine ports) | 🟡 |
| **4** | Organization Layer (Digital Company) | `domains/organization`, `domains/executive-ai`, `domains/agent-framework` | 🟡 |
| **5** | Corporate Operating System (SOPs) | `domains/corporate-os` | 🟡 |
| **6** | Marketing Intelligence Platform | `domains/marketing-intelligence`, `domains/knowledge-engine` | 🟡 |
| **7** | Creative Studio | `domains/creative-studio` | 🟡 |
| **8** | Campaign Engine | `domains/campaign-engine` | 🟡 |
| **9** | Analytics Engine | `domains/analytics-engine` | 🟡 |
| **10** | Workflow Engine | `domains/workflow-engine` | 🟡 |
| **11** | Connector Hub | `domains/connector-hub` | 🟡 |
| **12** | Agency OS (client-facing business) | `domains/agency-os` | 🟡 |
| **13** | Autonomy Layer (self-*) | `domains/autonomy` | 🟡 |

## What "built" means for a Book
A Book is only ✅ when its packages ship with: hexagonal ports + at least one
real adapter, aggregates/domain events where applicable, unit tests, structured
logging, Prometheus metrics, OpenTelemetry spans, typed config, Result-based
error handling, retry/fallback policies, and a README.

## Book 2 — AI Manager (revised structure)

Following the Capability-Primacy revision, the AI Manager composes these
sub-modules (ports already defined in `@ados/ai-manager` + `@ados/contracts`):

```
Model Registry · Capability Registry · Tool Registry · Prompt Registry* ·
Memory Registry · Context Builder · Resource Scheduler · Queue Manager ·
Inference Engine · Validation Engine · Safety Engine · Response Formatter ·
Learning Engine · Monitoring · Metrics · Cost Analyzer (offline) · Cache ·
Retry · Event Publisher · AI Session · AI Task Graph (DAG) · Decision Memory
        (*Prompt Registry is a separate bounded context: domains/prompt-registry)
```

Already built in this revision: **Capability Registry**, **Tool Registry**
(real + tested), **Prompt Registry** adapter (real + tested), and all sub-module
ports. Book 2 fills in the engine adapters and the composition:

1. `InferenceEnginePort` adapters — **Ollama** first (real HTTP client), then
   vLLM / llama.cpp / LM Studio / ComfyUI; each with health checks, timeouts,
   retries, and streaming.
2. The `AIManager` composition wiring Capability → Router → Resource Scheduler →
   Prompt → Context → Tools → Inference → Validation → Safety → Formatter →
   Monitoring/Cost → Event Publisher around `submit()`/`stream()`, with the
   fallback chain, cache, and retry.
3. Resource Scheduler that downgrades models to the machine's hardware profile
   (Qwen 32B on a 4090, but 14B on an M4 Air) transparently to agents.

### Book 2 acceptance criteria
- [ ] AI Manager runs **fully offline**.
- [ ] **Ollama** adapter ready; **vLLM** adapter ready (optional, auto-disabled if not installed).
- [ ] AI Task lifecycle works end to end.
- [ ] Model Router selects the correct model (by capability, honoring fallbacks).
- [ ] Capability Registry works (agents request a Capability, never a model).
- [ ] Tool Registry works (engine-independent tool invocation).
- [ ] Prompt Registry does versioning (+ A/B scoring).
- [ ] Context Builder merges multiple sources.
- [ ] Validation Engine validates against schema.
- [ ] Safety Engine performs baseline checks.
- [ ] Monitoring + metrics are published.
- [ ] Executive Memory System works (private per-role memory). *(engines built; wiring in Book 2)*
- [ ] Executive Context Builder works (assembles Prompt→Mission→Brain→ExecMemory→Decision→Experience→Prompt Registry). *(built)*
- [ ] Decision Journal creates records. *(built)*
- [ ] Evidence Engine attaches evidence to every recommendation. *(built)*
- [ ] Confidence Engine scores every output. *(built)*
- [ ] AI Constitution Checker runs before every AI output. *(built)*
- [ ] Company Brain + Executive Memory jointly feed the Context Builder. *(built)*
- [ ] **Full end-to-end flow:**
      `Mission → Company Brain → Executive Memory → Cognitive Core → AI Manager →
       local model → Validation → Constitution Check → Decision Journal →
       Event Bus → Memory Enrichment.`

Components marked *(built)* already have real, tested in-memory implementations
(Books 2.5 + 2.7). Book 2 wires them into the AI Manager `submit()` pipeline and
adds the engine adapters.

> Tell me **"build Book 2"** (or any Book) and I'll implement it to full
> production depth in a focused pass.
