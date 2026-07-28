# AdOS — Product Truth (Source-of-Code Audit)

**Author:** Chief Product Architect / Product Marketing Auditor
**Method:** source code, tests, and implementation-tied comments **only**. No
marketing, sales, website, presentation, or demo document was used as evidence.
Every statement below cites `path:line`.
**Scope audited:** `apps/web`, all 16 `domains/`, all 17 `packages/`, ~263 source
files, ~64 test files (~368 test cases).
**Date:** 2026-07-27 (Series 2 updates appended as shipped; 2026-07-28 —
brand-safety enforcement on generated creative; non-destructive gate revision;
Performance Memory read-back into new-campaign briefs; ExecutionTrace goes live —
every AI task now leaves an auditable, observable trace; a real Stage Engine runs
observable orchestration stages around generation without changing output; real
governance — evidence/confidence/constitution — now runs live in OBSERVE mode,
recorded into the trace but not yet enforcing; the constitution verdict is surfaced
at the human approval gate as ADVISORY — it informs the decision, it never blocks).

> **Governance maturity vocabulary (Series 2).** A governance capability moves through
> honest states, and this document tags which one each is in:
> **Observed** — runs and records, but has no consequence.
> **Advisory** — runs and is surfaced to the human decision, but never auto-acts.
> **Enforced / Required** — runs and changes system behavior (blocks, rejects, or gates
> progress). Today the grounding + constitution chain is **Observed**, and the
> constitution verdict is additionally **Advisory** at the approval gate. Nothing is
> **Enforced** yet — that is the remaining observe→enforce ladder.

> **One-sentence truth:** AdOS is an **autonomous AI marketing/advertising agency
> operating system** ("Agency OS") that runs local, offline-capable AI to take a
> client's campaign objective through a human-approved pipeline
> (brief → creative → campaign draft → report → executive dashboard) — **it does
> not launch real ads, has no document knowledge base, no "Digital Employees," and
> no enforced permissions.**

---

## 1. What AdOS IS

1. **An AI marketing-agency platform ("Agency OS").** The primary product surface
   is a **Mission**: *"A client states a business objective in natural language and
   the AI Company runs it autonomously."* — `domains/agency-os/src/mission/mission.ts:73-79`.
2. **A fixed agency domain model:** Workspace → Client → Brand → Product → Project →
   Mission → Approval → Asset → PerformanceReport —
   `domains/agency-os/src/{workspace,client,brand,product,project,mission,approval,asset,report}/`.
   Brands carry voice/rules/banned words (`brand/brand.ts:20-42`); Products carry
   pricing (`product/product.ts:30`). Banned words are **enforced** on generated
   creative — the brand-safety gate blocks copy containing them before it is saved
   (`creative-studio/.../service.ts:70-90`, `apps/web/src/safety.ts`).
3. **A linear, human-gated campaign pipeline**, orchestrated in
   `apps/web/src/routes.ts:731-1184`:
   Mission → **MarketingBrief** (`domains/marketing-intelligence/.../brief/service.ts:43-96`)
   → **CreativeSet** (`domains/creative-studio/.../creative/service.ts:38-89`)
   → **CampaignDraft** (`domains/campaign-engine/.../draft/service.ts:36-90`)
   → **CampaignReport** (`domains/analytics-engine/.../report/service.ts:36-91`)
   → **ExecutiveReport / CEO dashboard** (`domains/executive-ai/.../dashboard/service.ts:48-64`).
   Every stage requires an explicit human approval click; gates default to
   `['strategy_and_budget','campaign_launch']` (`mission.ts:110`, `routes.ts:743-753`).
4. **Advertising-native throughout:** channels + ad sets + budget split
   (`campaign-engine/.../campaign-draft.ts:34-55`), ad copy (headline/adCopy/CTA/
   socialPost/landingPage/email — `creative-studio/.../creative-set.ts:43-50`), and
   standard ad KPIs CTR/CPC/CPA/CPL/ROAS/ROI (`analytics-engine/.../kpi.ts:39-50`).
   Advertising vocabulary density in domain code: `campaign` ×306, `creative` ×202.
5. **100% local, offline-capable AI.** Engine selection is local-only: Ollama
   (`packages/ai-manager/src/runtime/engines/ollama-engine.ts:10`) or any
   OpenAI-compatible local server — vLLM/LM Studio/llama.cpp/SGLang —
   (`openai-compatible-engine.ts:10`; *"Still 100% local — no cloud, no API key
   required"* `:8`). The web app default is a deterministic **OfflineAIManager**
   needing no model server (`apps/web/src/ai.ts:13`, `ai-factory.ts:24-27`). No
   cloud endpoint or API key is used anywhere (`ai-factory.ts:10`, `ai-live.ts:17`,
   `main.ts:42`).
6. **Real multi-tenant isolation** (application-level): ambient `TenantContext`
   over AsyncLocalStorage (`packages/tenancy/src/tenant-context.ts:19-55`) with
   every repository filtering by `tenant_id` (`packages/persistence/src/aggregate-store.ts:36-47`;
   `domains/agency-os/src/workspace/repository.ts:26`), proven by tests
   (`packages/tenancy/src/tenant-context.test.ts:30-42`,
   `apps/web/src/db/repositories.test.ts:76-85`).
7. **Real authentication:** Argon2id hashing (`apps/web/src/auth/password.ts:9-22`),
   HMAC-signed HttpOnly sessions + per-session CSRF (`session.ts:51-95`), brute-force
   lockout (`packages/security/src/rate-limit.ts`, tested `security.test.ts:64-73`),
   CSP/HSTS headers (`security.ts:10-43`).
8. **Real persistence** (optional): SQLite (`node:sqlite`) and Postgres (`pg`)
   adapters storing each aggregate as a row (`packages/persistence/src/aggregate-store.ts`),
   forward-only migrations (`migration-runner.ts:53-68`), verified on real SQLite
   (`db/repositories.test.ts:130-175`).
9. **A real, substantial test suite:** ~64 test files, ~368 cases; HTTP-driven
   integration tests that boot the server and assert persistence, events, and
   rendered HTML (`onboarding.test.ts`, `mission-processing.test.ts`,
   `campaign.test.ts`, `approval.test.ts`, `db/repositories.test.ts`, …).
10. **A "Company Brain" — of marketing performance.** It stores CompanyDNA,
    BrandProfile, MarketingInsight, CreativeInsight, SalesInsight, SopPerformance,
    a campaign/ad/lead/ROI knowledge graph, a winning-ad pattern library, and a
    past-campaign experience engine — `domains/company-brain/src/in-memory-company-brain.ts:32-37`,
    `knowledge-graph.ts:4-6`, `pattern-library.ts:4-6`, `experience-engine.ts:6-11`. Since Series 2,
    the per-vertical `MarketingInsight` is not only written on completion (`routes.ts:1215`,
    sample-weighted-merged) but **read back** into new-campaign brief generation as context
    (`routes.ts:946`): **AdOS uses an organization's historical campaign performance to provide
    contextual information during the creation of new campaigns.** It reads history and builds
    context — it does not learn, optimize, or recommend.
11. **Bilingual TR/EN** UI and AI output-language injection
    (`apps/web/src/i18n.ts`, `ai-live.ts:139-141`).

---

## 2. What AdOS IS NOT

1. **Not a generic enterprise knowledge-management / document-Q&A system.** There is
   **no document ingestion, no chunking, no embedding of arbitrary documents, and no
   free-text document Q&A** in any domain (audited company-brain, knowledge-engine,
   executive-memory). The "knowledge" types are all advertising metrics
   (`in-memory-company-brain.ts:1-13`).
2. **Does not produce cited answers over documents.** The strings `citation`/`cite`/
   `cited` appear **0 times** in domain/package code. The only evidence layer cites
   *marketing metrics and patterns*, e.g. `detail: 'ROAS x, CTR y over N campaigns'`
   — `domains/executive-memory/src/reasoning.ts:24-52`. Not documents.
3. **Has no "Digital Employees."** The string `Digital Employee` appears **0 times**
   in the codebase. `agent-framework` and `autonomy` are event-name stubs
   (*"engine implementations land later"* — `domains/agent-framework/src/events.ts:9-15`,
   `autonomy/src/events.ts:9-15`) imported by nobody. There is no agent loop, tool
   use, or task queue; `executive-ai` is a **single** LLM synthesis call, not an
   agent (`dashboard/service.ts:48-64`).
4. **Does not launch or optimize live advertising.** Campaigns never leave `draft`
   status (`campaign.test.ts:86-87`); *"A draft is NEVER launched here"*
   (`campaign-draft.ts:48-49`); *"produces copy ONLY; it never touches campaigns or
   ad platforms"* (`creative-set.ts:16-17`). No Meta/Google/TikTok/LinkedIn Ads
   client exists (grep: none).
5. **Has no real external integrations.** `connector-hub` is an unwired scaffold —
   only event-name constants, **0 importers** — `domains/connector-hub/src/events.ts:9-20`.
   Analytics metrics are **hand-entered via a form**, not ingested
   (`routes.ts:1026-1048`). The only outbound `fetch()` calls target localhost AI
   engines.
6. **Does not enforce permissions (no RBAC).** Roles are defined
   (`apps/web/src/auth/roles.ts:10-14`, `packages/security/src/rbac.ts`) but
   `AccessControl`/`authorize`/`permits` are **called nowhere** in app/route code;
   the code comments say so: *"no new permission gate is added to any route"*
   (`roles.ts:6-9`, `routes.ts:56`). The AI is **not** permission-scoped; the
   Company Brain has no tenant scoping at all (global `Map`s —
   `in-memory-company-brain.ts:32-37`).
7. **Has no immutable audit trail.** No append-only/tamper-evident store exists; the
   audit hooks (`AuthAudit`, `ConfigAudit`, `RecoveryAudit`) are logger wrappers, and
   the web activity feed is a bounded in-memory ring of 50 (`app.ts:66-67,126-127`).
8. **Is not cloud/SaaS and does not call any external AI.** No cloud endpoint, no
   API key in use; the `enableCloudInference` flag is loaded but **never read**
   (`packages/config/src/schema.ts:58-59`).
9. **Does not, by default, produce real AI output.** The default AI is deterministic
   template generation (`OfflineAIManager`, `ai.ts:13`); genuine model output
   requires a locally-run engine (`ai-live.ts:26`).
10. **Does not persist by default.** Out of the box it uses in-memory repositories;
    durable storage only engages when `DATABASE_URL` is set
    (`app.ts:72`, `db/repositories.ts:220-238`).

---

## 3. Supported capabilities (implemented + tested)

| Capability | Evidence |
|---|---|
| Onboarding wizard (workspace→client→brand→product→mission) | `onboarding.test.ts:75-168` |
| Mission lifecycle state machine + approval gates | `mission.ts:172-216`, `approval.ts:187`, `approval.test.ts` |
| Marketing brief generation (AI, provenance) | `marketing-intelligence/.../service.ts:43-96`, `mission-processing.test.ts:76-127` |
| Creative set generation (copy only, gated) | `creative-studio/.../service.ts:38-89`, `creative.test.ts` |
| Brand-safety enforcement on generated creative — banned words + PII/secret scan, **blocks before persist**, emits `creative.blocked.v1` | gate `creative-studio/.../service.ts:70-90`, adapter `apps/web/src/safety.ts:18`, reused engine `ai-manager/.../safety-engine.ts:48`, `safety.test.ts`, `creative.test.ts` (block case) |
| Non-destructive gate revision — rejecting a brief/creative/campaign returns the mission to **rework** (not a terminal fail), records revision history, emits `mission.revision.requested.v1`; the rejected draft is discarded and regenerated under the same mission | `mission/mission.ts:225` (`requestRevision`), `mission/service.ts:51`, route `apps/web/src/routes.ts:893-916` (`gateReject`→`discardRejectedDraft`), `mission.test.ts` (revision unit), `creative.test.ts`/`campaign.test.ts`/`mission-processing.test.ts` (loop + non-destructive) |
| Performance Memory **read-back** — a completed campaign's KPIs are aggregated per vertical in the Company Brain and injected as **descriptive context** into a new campaign's brief generation (reads history / builds context; does NOT learn/optimize/recommend) | write `routes.ts:1215` (`brain.enrich` marketing, sample-weighted `in-memory-company-brain.ts:100`), read+inject `routes.ts:946`, brief prompt `marketing-intelligence/.../brief/service.ts:60`, `performance-memory.test.ts` (e2e) |
| **ExecutionTrace on the live path** — every AI task (brief/creative/campaign/analytics/executive) leaves a sealed, tenant-scoped `ExecutionTrace` (capability, prompt ref, model/engine, token usage, latency, mission, honest step list), surfaced at `/traces`. `StagedAIManager` wraps the AI Manager; **generation output is byte-for-byte unchanged** | manager `apps/web/src/staged-ai-manager.ts`, store `apps/web/src/execution-trace-store.ts`, wired `apps/web/src/app.ts:78`, view `views/pages.ts` (`tracesPage`) + route `routes.ts` (`/traces`), trace type/builder `ai-manager/.../runtime/kernel.ts:124`, `execution-trace.test.ts` (e2e) |
| **Stage Engine around generation** — a real ordered pipeline runs live: `plan` (placeholder) → `safety.input` (RegexSafetyEngine inspection) → `route` (CapabilityRouter decision + fallback chain) → `inference` (still the wrapped LiveAIManager/offline manager — same prompt/model/output) → `safety.output` (inspection) → `governance.observe`. Each stage records its own trace step; stages are **observe-only** (inspect + record, never block or replace generation) | engine `apps/web/src/stage-engine.ts`, run by `staged-ai-manager.ts`, real components `ai-manager/.../safety-engine.ts:33` + `capability-router.ts:11` + `model-registry.ts:50`, `execution-trace.test.ts` asserts per-stage records + byte-for-byte output |
| **Governance, OBSERVED** — the real grounding + governance chain now runs live on every AI task in **observe mode**: `evidence` (`BrainEvidenceEngine` reads the Company Brain's per-vertical marketing memory — the same store Sprint 3 writes) → `confidence` (`HeuristicConfidenceEngine`) → `constitution` (`ConstitutionChecker`). Genuine findings are recorded into the trace (`evidence`, `confidence`, and a `constitution` step with `passed`/`violations`/`requiresApproval`, tagged `observed:true, enforced:false`). A grounded campaign shows real evidence + higher confidence; a first, ungrounded campaign honestly records `no_evidence` — **nothing is fabricated, and nothing is blocked** | stage `apps/web/src/stage-engine.ts` (`governanceObserveStage`), components `executive-memory/.../reasoning.ts:14,62` + `governance.ts:23`, wired `apps/web/src/app.ts` (brain → `defaultStageEngine`), `execution-trace.test.ts` asserts both the ungrounded (`no_evidence`, non-blocking) and grounded (`marketing_brain` evidence, confidence > floor) paths. **Still ❌ (later observe→enforce mini-sprints):** any **enforcement** (constitution rejecting an output, safety/route deciding); governed `execute()` as the actual generation engine |
| **Governance verdict at the approval gate (ADVISORY)** — when a mission is awaiting human approval, the latest AI artifact's constitution verdict (pass/fail + violations + confidence) is surfaced right above the approve/reject controls. It **informs the human decision but never auto-blocks** — the approve control is always present. This gives the observed verdict a real consequence (a human can reject an ungrounded output) while staying non-destructive and matching AdOS's human-in-the-loop design | route `apps/web/src/routes.ts` (`spreadGovernance`, reads latest `constitution` trace step), view `views/pages.ts` (`governanceAdvisory` in `reviewControls`), `execution-trace.test.ts` asserts the advisory + `no_evidence` show at the gate AND the approve control remains. **Still ❌:** hard enforcement (auto-reject); evidence-required / confidence-threshold gating (later rungs) |
| Campaign draft assembly (channels/budget, gated, never launched) | `campaign-engine/.../service.ts:36-90`, `campaign.test.ts:86-87` |
| Deterministic ad-KPI math (CTR/CPC/CPA/CPL/ROAS/ROI) | `analytics-engine/.../kpi.ts:39-50`, `campaign-report.test.ts:31-45` |
| Executive/CEO dashboard synthesis (single AI call) | `executive-ai/.../service.ts:48-64` |
| Local inference: Ollama + OpenAI-compatible | `ollama-engine.ts:10`, `openai-compatible-engine.ts:10` |
| Offline deterministic AI (default, no network) | `ai.ts:13`, `ai-factory.ts:24-27` |
| AI robustness: self-repair, JSON extraction, schema injection, language, streaming, embeddings | `ai-live.ts:34-198`, `validation-engine.ts:62` |
| Multi-tenant isolation (app-level) | `tenant-context.ts:19-55`, `aggregate-store.ts:36-47` |
| Auth: Argon2id, sessions, CSRF, brute-force, security headers | `auth/password.ts:9-22`, `session.ts:51-95`, `security.ts:10-43` |
| Persistence: SQLite + Postgres (opt-in) | `sqlite-database.ts`, `postgres-database.ts`, `db/repositories.test.ts:130-175` |
| Company Brain (marketing metrics/graph/patterns/experience) | `in-memory-company-brain.ts:32-114` |
| Bilingual TR/EN UI + AI language | `i18n.ts`, `ai-live.ts:139-141` |
| Backup / recovery / deploy / observability packages | `packages/{backup,recovery,deploy,observability}` (tested) |

---

## 4. Unsupported capabilities (absent or stubbed)

| Claimed capability | Reality | Evidence |
|---|---|---|
| Document knowledge base / document Q&A | Absent — no ingestion/chunking/embedding of docs | audited company-brain, knowledge-engine |
| Cited answers over documents | Absent — 0 citations; only campaign-metric evidence | `reasoning.ts:24-52`; grep `cite`=0 in domains |
| "Digital Employees" / AI agents doing work | Absent — event-name stubs, 0 importers | `agent-framework/src/events.ts:9-15`, `autonomy/src/events.ts` |
| Live ad launch / campaign optimization | Absent — drafts only, no ad-platform client | `campaign-draft.ts:48-49`, `creative-set.ts:16-17` |
| External integrations / connectors | Stub — event names only, 0 importers | `connector-hub/src/events.ts:9-20` |
| RBAC / permission-aware AI | Defined, never enforced | `roles.ts:6-14`, `routes.ts:56` |
| Immutable audit trail | Absent — logger lines + bounded ring only | `app.ts:66-67`, audit hooks |
| DB-level Row-Level Security | Absent — claimed in a comment only | `database.ts:8-10` vs `migration-runner.ts:11-36` |
| Image/vision/speech/transcription AI | Declared in the type, no engine impl | `contracts/.../ai-task.ts:14-24` |
| Cloud inference | Flag exists, never wired | `config/schema.ts:58-59` |

---

## 5. Implemented features vs future placeholders

**Implemented and wired into the app** (`apps/web` imports them):
`agency-os`, `company-brain`, `executive-ai`, `executive-memory`,
`marketing-intelligence`, `creative-studio`, `campaign-engine`,
`analytics-engine`, `ai-manager`, `tenancy`, `persistence`, `security`,
`observability`, `deploy`, `backup`, `recovery`, `workers`, `event-bus`,
`contracts`, `config`.

**Future placeholders — event-contract / interface scaffolding, 0 importers:**
| Module | State | Evidence |
|---|---|---|
| `domains/agent-framework` | event names only | `events.ts:9-15` |
| `domains/autonomy` | event names only | `events.ts:9-15` |
| `domains/workflow-engine` | event names only | `events.ts:9-15` |
| `domains/knowledge-engine` | event names only | `events.ts:9-20` |
| `domains/organization` | event names only | `events.ts:9-13` |
| `domains/corporate-os` | interfaces/ports only (*"engine implementations land in BOOK 5"*) | `sop.ts:8,37-42` |
| `domains/prompt-registry` | implemented but orphaned (0 workspace importers) | `in-memory-prompt-registry.ts:19-50` |
| `domains/connector-hub` | event names only, no connectors | `events.ts:9-20` |
| RBAC (`packages/security/rbac`) | implemented but never called | `rbac.ts`, `roles.ts:6-9` |
| Cloud inference | config flag, ungated | `config/schema.ts:58-59` |

---

## 6. Marketing claims — supported / partial / unsupported

### 6.1 Fully supported by code
- **"100% local AI; runs on your own infrastructure; no cloud, no API keys; works
  offline / air-gap capable."** — `ai-factory.ts:24-57`, `ollama-engine.ts:10`,
  `openai-compatible-engine.ts:8`, `ai.ts:8-13`.
- **"No per-token billing."** Inference is local; no metered API is called —
  only localhost `fetch` exists.
- **"Deterministic."** OfflineAIManager and KPI math are pure/deterministic —
  `ai.ts:19-30`, `kpi.ts:33-50`.
- **"Bilingual TR/EN."** — `i18n.ts`, `ai-live.ts:139-141`.
- **"Multi-tenant"** (as application-level isolation) — `tenant-context.ts`,
  `aggregate-store.ts:36-47`.
- **"Human-approved campaign workflow"** — `mission.ts:110`, `approval.ts`,
  `campaign.test.ts:86-87`.

### 6.2 Partially supported (real thing exists, but weaker/different than claimed)
- **"Company Brain."** Exists — but as a **marketing-performance brain**, not the
  marketed permission-aware **document** knowledge base with citations
  (`in-memory-company-brain.ts:32-37`).
- **"Strict tenant isolation."** Real but **application-enforced only** — no DB RLS
  (`database.ts:8-10` claim vs none in `migration-runner.ts`); `upsert`/`delete`
  omit `tenant_id` (`aggregate-store.ts:49-61`); Company Brain is unscoped.
- **"Auditable / audit trail."** Structured logging, per-approval timelines, and an
  event stream exist — but **no immutable audit log** (`app.ts:66-67`).
- **"Autonomous AI."** The pipeline is automated, but the default AI is **offline
  canned generation** and **every** step needs a human approval click — autonomy is
  aspirational (`ai.ts:13`, `routes.ts:743-753`).
- **"Workflows & Approvals with tiered authority."** Approval **gates** exist
  (`strategy_and_budget`/`creative_assets`/`campaign_launch`), but there is **no
  tiered approval-authority model** (no T0–T4 limits) — `routes.ts:743-753`.

### 6.3 Unsupported by code
- **"Enterprise AI Operating System for organizational knowledge & operations"** (a
  generic KM platform, e.g. a manufacturer's documents) — the product is an
  **advertising-agency OS**, not generic enterprise KM. (§1, §2.1)
- **"Digital Employees that do real knowledge work."** — Not implemented (§2.3).
- **"Company Brain answers from your documents and cites its sources; citations are
  permission-scoped."** — No document Q&A, no citations, no permission scoping
  (§2.1, §2.2, §2.6).
- **"Permission-aware AI — the model can never surface what a user may not see."**
  — RBAC is never enforced and the AI is not permission-scoped (§2.6).
- **"Immutable audit trail."** — Absent (§2.7).
- **Real integrations to external systems.** — connector-hub is a stub (§2.5).
- **Actually running/optimizing advertising campaigns.** — Drafts only; nothing is
  launched (§2.4).

---

## 7. Repository-metadata note

`package.json:5` describes AdOS as *"Enterprise AI Operating System. Autonomous AI
advertising platform."* — a two-identity description. The **code substantiates the
second half** ("AI advertising platform," human-gated, drafts-only) far more than
the first ("Enterprise AI Operating System" in the generic-KM sense the GTM
materials use). See `POSITIONING_GAP_ANALYSIS.md`.

---

*This audit reflects the code as of 2026-07-27. It cites source only; no marketing
document informed any statement above. No files were modified to produce it.*
