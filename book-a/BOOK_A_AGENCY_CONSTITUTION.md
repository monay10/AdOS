# BOOK A · A001 — Agency Constitution

> **The governing charter of the AdOS advertising-agency domain.**
> Every other Book A document (A002–A010) conforms to this file. Where a Book A
> document and this Constitution disagree, this Constitution governs; where this
> Constitution and `../PRODUCT_TRUTH.md` disagree, `../PRODUCT_TRUTH.md` wins.

| | |
|---|---|
| **Owner** | Office of the Chief Product Architect |
| **Status** | Official — aligned to PRODUCT_TRUTH.md |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Source of truth** | `../PRODUCT_TRUTH.md` |
| **Governs** | `book-a/` A002–A010 |

---

## 0. Preamble — what AdOS is

AdOS is an **offline-first, 100% local-AI advertising-agency operating system**
("Agency OS"). A client states an advertising objective in natural language as a
**Mission**; AdOS runs that Mission through a **linear, human-gated pipeline** —
marketing brief → creative (ad copy) → campaign **draft** → performance report →
executive dashboard — and remembers what worked in a marketing-performance
**Company Brain**.

AdOS **drafts**; it **never launches live ads**. There is no ad-platform
integration, no external connector, no autonomous agent doing knowledge work, and
no enforced role-based access control. These are stated plainly here and are held
to the same standard in every downstream Book A document.

Three properties are constitutional and non-negotiable:

1. **Offline-first, local-only inference.** The default AI is a deterministic
   `OfflineAIManager` that needs no model server (`apps/web/src/ai.ts`,
   `apps/web/src/ai-factory.ts`). Genuine model output requires a locally-run
   engine — Ollama (`packages/ai-manager/src/runtime/engines/ollama-engine.ts`)
   or any OpenAI-compatible local server
   (`.../engines/openai-compatible-engine.ts`). No cloud endpoint and no API key
   is used anywhere.
2. **Human-gated, not autonomous.** Every value-producing stage of the pipeline
   requires an explicit human approval click. Autonomy is aspirational; the shipped
   behaviour is a machine-assisted pipeline with mandatory human gates.
3. **Routes orchestrate, domains are passive.** The domain packages are pure DDD
   aggregates that never call one another. The **routes layer**
   (`apps/web/src/routes.ts`) assembles plain DTOs and drives the sequence. A
   domain never reaches into another domain's aggregate.

> **AdOS v2 Value Rule (binding on every Book A doc).** Every capability described
> must **directly increase the agency's revenue** OR **reduce its production
> time**. Each lifecycle and entity carries a **Value contribution** note stating
> which of the two it serves. See §12.

---

## 1. Agency operating model

### 1.1 The offline-first, local-AI principle

| Property | Reality in code | Evidence |
|---|---|---|
| Default AI | Deterministic template generation (`OfflineAIManager`) — no network, no model server | `apps/web/src/ai.ts`, `apps/web/src/ai-factory.ts` |
| Live AI (opt-in) | Local engines only — Ollama / OpenAI-compatible (vLLM, LM Studio, llama.cpp, SGLang) | `.../engines/ollama-engine.ts`, `.../engines/openai-compatible-engine.ts` |
| Cloud inference | **Not wired** — `enableCloudInference` flag is loaded but never read | `packages/config/src/schema.ts` |
| Determinism | KPI math and offline generation are pure functions | `domains/analytics-engine/.../kpi.ts`, `apps/web/src/ai.ts` |
| Persistence | In-memory by default; SQLite / Postgres only when `DATABASE_URL` is set | `apps/web/src/app.ts`, `apps/web/src/db/repositories.ts` |

### 1.2 The human-gated pipeline

The pipeline is **linear** and **gated**. Each stage produces one immutable AI
artifact (or, at the analytics stage, a deterministic computation over a
hand-entered form), and each value-producing stage is fronted by a human approval
click. Stages never run themselves; the routes layer advances them one at a time.

```
Mission (natural-language objective)
   │  Phase 2  ── gate: strategy_and_budget
   ▼
MarketingBrief        [marketing-intelligence]
   │  Phase 3  ── gate: creative_assets
   ▼
CreativeSet (ad copy) [creative-studio]
   │  Phase 4  ── gate: campaign_launch
   ▼
CampaignDraft         [campaign-engine]   ← TERMINAL: never launched
   │  Phase 5  ── no gate; KPIs from a manual spend/revenue form
   ▼
CampaignReport (6 KPIs) [analytics-engine]
   │  Phase 6  ── learn: Company Brain + Executive Memory + Decision Journal
   ▼
ExecutiveReport / CEO dashboard [executive-ai]
```

Wiring reference: `apps/web/src/routes.ts` (pipeline phases), plus each domain's
`service.ts`. Phase numbers reflect the route handlers as wired; the analytics
phase (Phase 5) has **no approval gate** because its input is a human-entered form.

### 1.3 Routes orchestrate; domains stay passive

Every context (`brief`, `creative`, `campaign`, `report`, `executive`) accepts a
plain DTO — a `*Context` object — and returns an artifact. No context imports
another context's aggregate. This cross-context isolation is what makes the domains
passive and the routes layer the sole orchestrator:

- The domain builds and validates the artifact.
- The routes layer (`apps/web/src/routes.ts`) reads the previous artifact, shapes
  the next `*Context` DTO, calls the next domain service, and persists the result.
- Human approval is requested and recorded by the routes layer, not the domain.

**Value contribution.** The operating model itself serves **production time ↓**:
offline determinism removes cloud latency and per-token cost, and the single-driver
routes layer keeps the pipeline reproducible. It serves **revenue ↑** indirectly by
making the agency's output volume predictable.

---

## 2. Entity relationships — the aggregate hierarchy

Every entity below is a DDD `AggregateRoot`: a typed id, private props, a
`create` / `submit` / `generate` factory returning `Result<T, ValidationError>`
(AI artifacts return a plain object), plus `restore()`, `snapshot()`, and domain
events. Money is always stored in minor units as `{ amountMinor, currency }`.

```
Tenant
 └─ Workspace                        (agency-os)
     └─ Client
         ├─ Brand      (profile / identity / rules[bannedWords] / assets)
         ├─ Product    (pricing, features)
         ├─ Project    (→ brandId; goals, members)
         └─ Mission    (→ workspaceId, clientId, projectId?; approvalGates[])
             ├─ MarketingBrief   (→ missionId)                          [marketing-intelligence]
             ├─ CreativeSet      (→ missionId, briefId)                 [creative-studio]
             ├─ CampaignDraft    (→ missionId, briefId, creativeSetId)  [campaign-engine]
             ├─ CampaignReport   (→ missionId, campaignDraftId; KPIs)   [analytics-engine]
             └─ ExecutiveReport  (→ missionId, reportId; verdict)       [executive-ai]

Standalone aggregates:
  Approval          (→ projectId?)                  generic review record
  Asset             (→ clientId, brandId?, projectId?)   manual library asset
  PerformanceReport (→ clientId, projectId?)        saved client snapshot
```

Reference: `domains/agency-os/src/{workspace,client,brand,product,project,mission,approval,asset,report}/`,
`domains/marketing-intelligence/`, `domains/creative-studio/`,
`domains/campaign-engine/`, `domains/analytics-engine/`, `domains/executive-ai/`.

The three **standalone** aggregates are deliberately outside the Mission tree.
`Approval` is a generic review record (§7.1) — it is **not** the Mission's approval
gates. `Asset` is a manually-curated library asset, distinct from the AI-generated
`CreativeSet`. `PerformanceReport` is a saved, client-facing snapshot assembled by
the caller.

---

## 3. Terminology — glossary of real terms

Every term below names a real construct in the code. Use these terms exactly;
do not introduce synonyms.

| Term | Meaning | Reference |
|---|---|---|
| **Workspace** | The agency tenant's top-level container; holds settings and a feature map | `agency-os/src/workspace/workspace.ts` |
| **Client** | An advertising client of the agency | `agency-os/src/client/client.ts` |
| **Brand** | A client's brand: profile, identity, rules (`bannedWords`), assets | `agency-os/src/brand/brand.ts` |
| **Product** | A client offering with pricing (`one_time` / `subscription` / `usage` / `free`) | `agency-os/src/product/product.ts` |
| **Project** | A unit of work under a Client, tied to a Brand; carries goals and members | `agency-os/src/project/project.ts` |
| **Mission** | The primary surface: a natural-language advertising objective run through the pipeline | `agency-os/src/mission/mission.ts` |
| **MarketingBrief** | AI artifact — strategy and planning only; objective, audience, positioning, channels, KPIs | `marketing-intelligence/.../marketing-brief.ts` |
| **CreativeSet** | AI artifact — ad **copy only**: six outputs, no images | `creative-studio/.../creative-set.ts` |
| **CampaignDraft** | AI artifact — channels, ad sets, budget split; status is only `draft`, never launched | `campaign-engine/.../campaign-draft.ts` |
| **CampaignReport** | Deterministic KPI computation over a hand-entered metrics form, plus an AI narrative | `analytics-engine/.../report/` |
| **ExecutiveReport** | AI artifact — final synthesis with a `verdict` | `executive-ai/.../executive-report.ts` |
| **Approval** | Standalone generic review aggregate with an append-only timeline | `agency-os/src/approval/approval.ts` |
| **Asset** | Manual library asset; versions are appended, never overwritten | `agency-os/src/asset/asset.ts` |
| **PerformanceReport** | Saved, immutable client-facing snapshot | `agency-os/src/report/report.ts` |
| **Company Brain** | In-memory marketing-performance memory (graph / patterns / experience / DNA) | `domains/company-brain/src/in-memory-company-brain.ts` |
| **approval gate** | A string marking a pipeline checkpoint; **advisory metadata**, no tiered authority (§6) | `mission.ts`, `routes.ts` |
| **provenance** | Metadata on every AI artifact: `taskId`, `capability`, `model`, `engine`, `latencyMs` | `marketing-intelligence/.../marketing-brief.ts` |

> **Note on "Company Brain."** It is a **marketing-performance** brain — a store of
> campaign metrics, winning-ad patterns, and past-campaign experience. It is **not**
> a document knowledge base; there is no document ingestion, chunking, embedding, or
> cited Q&A over documents anywhere in the code.

---

## 4. Entity facts (authoritative)

Fields, defaults, and rules below are exact. Do not add fields or states.

### 4.1 Workspace — `agency-os/src/workspace/workspace.ts`

| Field | Notes |
|---|---|
| `tenantId`, `name` | required |
| `settings` | `{ locale, timezone, currency }` |
| `configuration` | `{ features: Record<string, boolean> }` |
| `status` | `active` \| `deleted` |

`create()` → `active`; `markDeleted()` → `deleted` (idempotent); mutations are
guarded when the workspace is `deleted`.

### 4.2 Client — `agency-os/src/client/client.ts`

| Field | Notes |
|---|---|
| `tenantId`, `workspaceId`, `name` | required |
| `industry` | default `'general'` |
| `contact` | `{ email (required), phone?, website? }` |
| `status` | `active` \| `archived` |

`archive()` is idempotent.

### 4.3 Brand — `agency-os/src/brand/brand.ts`

| Field | Notes |
|---|---|
| `profile` | `{ mission, values[], voice (default 'professional'), targetAudience }` |
| `identity` | `{ primaryColor, secondaryColor, logoUrl?, typography }` |
| `rules` | `{ dos[], donts[], bannedWords[] }` |
| `assets` | `[{ id, kind: logo\|image\|document\|font\|other, name, url }]` |
| `status` | `active` \| `archived` |

> ⚠️ **`bannedWords` is stored but NOT enforced** against generated copy anywhere.
> Enforcement is **Roadmap** (§11).

### 4.4 Product — `agency-os/src/product/product.ts`

| Field | Notes |
|---|---|
| `name`, `description` | |
| `categories[]`, `features[]` | `features` = `[{ name, description }]` |
| `pricing` | `{ model: one_time\|subscription\|usage\|free, amount: Money, period?: monthly\|yearly }` |
| `status` | `active` \| `archived` |

Rules: `subscription` **requires** a `period`; `amountMinor` in
`[0, MAX_SAFE_INTEGER]`; `currency` non-empty. Default pricing is `free` / 0 USD.

### 4.5 Project — `agency-os/src/project/project.ts`

| Field | Notes |
|---|---|
| `clientId`, `brandId` | required links |
| `goals` | `[{ description, metric, target }]` |
| `members` | `[{ name, email, role (default 'member') }]` |
| `status` | `active` \| `paused` \| `completed` \| `archived` |

State machine in §5.3.

### 4.6 Mission — `agency-os/src/mission/mission.ts` (PRIMARY SURFACE)

| Field | Notes |
|---|---|
| `brief` | raw natural language, **min length 10** |
| `budget?` | `{ amountMinor, currency, period: daily\|weekly\|monthly\|total }` |
| `targetMetric?` | `{ name, target, unit }` |
| `deadline?` | |
| `approvalGates[]` | advisory (§6); default `['strategy_and_budget','campaign_launch']` |
| `status`, `createdBy`, `failureReason?` | |

**No mission-type enum exists.** Missions differ only by their free-text `brief`.
The Mission **Wizard** steps are `context → objective → budget → target → review`.
State machine in §5.1.

### 4.7 AI artifacts

All AI artifacts are **immutable** and carry
`provenance{ taskId, capability, model, engine, latencyMs }`.

| Artifact | Content (exact) | Rule |
|---|---|---|
| **MarketingBrief** (`marketing-intelligence`) | `{ objective, targetAudience, positioning, keyMessages[], recommendedChannels[], budgetAllocation[{channel,percentage}], kpis[{name,target,unit}] }` | "Strategy & planning ONLY — never ads/images/live campaigns" |
| **CreativeSet** (`creative-studio`) | Six outputs: `headline`, `adCopy`, `cta`, `socialPost`, `landingPage{headline,body,cta}`, `email{subject,body}` | "**Copy ONLY**; never touches campaigns or ad platforms." No images |
| **CampaignDraft** (`campaign-engine`) | `{ name, objective, channels[{channel,budgetPercentage,adSets[{name,audience,headline,primaryText,cta}]}], schedule{startHint,durationDays} }`, `totalBudget: Money` | Status is the single value `draft`; **never launched**; no launch method |
| **CampaignReport** (`analytics-engine`) | input `CampaignMetrics{impressions,clicks,conversions,leads,spend,revenue}`; narrative `{summary,highlights[],recommendations[]}` | KPIs deterministic (§5.5); narrative is AI-generated |
| **ExecutiveReport** (`executive-ai`) | `{ headline, executiveSummary, verdict, keyResults[{metric,value,unit,verdict}], decisions[], nextActions[] }` | `verdict` enum = `exceeded` \| `on_track` \| `at_risk` |

### 4.8 Standalone aggregates

| Aggregate | Fields | Rule |
|---|---|---|
| **Approval** (`agency-os/src/approval/approval.ts`) | `title, description, requestedBy, projectId?, status, timeline[{action,from,to,note,actor,at}]` | Timeline is **append-only**. State machine §5.2 |
| **Asset** (`agency-os/src/asset/asset.ts`) | `kind: image\|copy\|document\|link, tags[] (lowercased, deduped), versions[{version,content,note,by,at}]` | Content **never overwritten** — new version appended. No status enum |
| **PerformanceReport** (`agency-os/src/report/report.ts`) | `title, period (default 'All time'), metrics[{label,value}], summary` | Immutable; assembled by the caller |

---

## 5. State machines

### 5.1 Mission state machine — `agency-os/src/mission/mission.ts`

| Transition | From | To |
|---|---|---|
| `submit()` | (initial) | `submitted` |
| `plan()` | `submitted` | `planning` |
| `requestApproval(gate)` | `planning` \| `executing` | `awaiting_approval` |
| `approve(gate)` | `awaiting_approval` | **`planning`** |
| `startExecuting()` | `planning` | `executing` |
| `complete()` | `executing` | `completed` |
| `fail(reason)` | any non-terminal | `failed` |

```
submitted → planning ⇄ awaiting_approval
                │
                └→ executing → completed
     (any non-terminal) ──fail(reason)──→ failed
```

Two constitutional truths about this machine:

1. **`approve()` returns the Mission to `planning` — it does NOT jump forward.**
   Approval clears the gate; the *next phase's generator* is what advances the
   Mission. Approval is a release, not a promotion.
2. **`paused` is declared in the status type but is never entered.** It is dormant
   / reserved. No code transitions a Mission into `paused`. See Roadmap (§11).

### 5.2 Approval aggregate state machine — `agency-os/src/approval/approval.ts`

This is the **standalone** `Approval` review record — distinct from Mission gates.

| Status | Meaning |
|---|---|
| `draft` | created, not yet in review |
| `in_review` | submitted for review |
| `approved` | terminal — accepted |
| `rejected` | terminal — declined |
| `revision_requested` | sent back for changes |

```
draft → in_review → approved
                 ├→ rejected
                 └→ revision_requested → (back to in_review)
```

Every transition appends a `{ action, from, to, note, actor, at }` entry to the
**append-only** `timeline`. The timeline is a real append-only in-memory list; it
is **not** an immutable / tamper-evident audit store (§11).

### 5.3 Project state machine — `agency-os/src/project/project.ts`

| Method | Allowed target states |
|---|---|
| `changeStatus()` | `active` \| `paused` \| `completed` |
| `archive()` | `archived` (the **only** path to `archived`) |

```
active ⇄ paused
active → completed
(any) ──archive()──→ archived
```

`archived` is reachable **only** through `archive()` — `changeStatus()` will not
set it.

### 5.4 KPI computation (deterministic) — `analytics-engine/.../report/`

The analytics phase has **no approval gate**. Its input, `CampaignMetrics`, is
**hand-entered via a form** (not ingested from any external source). `computeKpis()`
is a pure, deterministic function:

| KPI | Formula | Unit |
|---|---|---|
| `CTR` | `clicks / impressions × 100` | % |
| `CPC` | `spend / clicks` | Money |
| `CPA` | `spend / conversions` | Money |
| `CPL` | `spend / leads` | Money |
| `ROAS` | `revenue / spend` | x |
| `ROI` | `(revenue − spend) / spend × 100` | % |

Only the report **narrative** (`summary`, `highlights[]`, `recommendations[]`) is
AI-generated; the KPIs themselves are deterministic and reproducible.

---

## 6. Approval-gate mechanics — the honest discrepancy

Mission approval **gates** are separate from the standalone `Approval` aggregate
(§5.2). They are strings attached to the Mission, and they must be documented
honestly.

**The gate contract union** `MissionApprovalGate` has **five** values:

| Gate string | Used by pipeline? |
|---|---|
| `strategy_and_budget` | ✅ Phase 2 (brief) |
| `creative_assets` | ✅ Phase 3 (creative) |
| `campaign_launch` | ✅ Phase 4 (campaign) |
| `major_budget_change` | ❌ declared, **never used** — dormant / Roadmap |
| `contract_or_spend` | ❌ declared, **never used** — dormant / Roadmap |

**The discrepancy, stated plainly:**

1. The Mission's **default** `approvalGates` array is only
   `['strategy_and_budget', 'campaign_launch']` — yet the pipeline **always** runs
   the `creative_assets` gate too. The array does not control the pipeline.
2. Therefore the `approvalGates` array is **advisory metadata**. Route handlers call
   `requestApproval(gate)` **unconditionally** at each phase, regardless of the
   array's contents.
3. `gateApprove` maps **every** gate string to the **same** `mission.approve()`
   transition. The gate string is **informational**, not branch logic.

**There is NO tiered approval authority.** There is no T0–T4 model, no spend
threshold, no role-scoped signing power. Every gate is the same click that returns
the Mission to `planning`. Any tiered-authority model is **Roadmap** (§11).

Reference: `agency-os/src/mission/mission.ts`, `apps/web/src/routes.ts`.

---

## 7. Lifecycles (summary + pointers)

Each lifecycle is summarised here and specified in full in its dedicated Book A
document. This Constitution governs all of them.

### 7.1 Client lifecycle

`create` → `active` → `archive()` → `archived` (idempotent). A Client owns Brands,
Products, Projects, and Missions. There is no CRM, communication log, health score,
or retention engine in code — those are Roadmap.
→ **`BOOK_A_CLIENT_DOMAIN.md` (A002)**.

### 7.2 Brand lifecycle

`create` → `active` → `archived`. A Brand carries profile, identity, rules
(`dos` / `donts` / `bannedWords`) and library assets. `bannedWords` is stored but
not enforced. Personas, competitors, offers, and seasonality are Roadmap.
→ **`BOOK_A_BRAND_DOMAIN.md` (A003)**.

### 7.3 Campaign lifecycle

The advertising campaign moves Idea → Brief → Research → Creative → Review →
Approval → **Draft** → Reporting → Archive, mapped onto the real pipeline phases
(§1.2). **`Draft` is terminal — it is never launched.** "Archive" maps to a
Project set `archived` and/or a saved `PerformanceReport`.
→ **`BOOK_A_CAMPAIGN_LIFECYCLE.md` (A004)**.

### 7.4 Mission lifecycle

The Mission is the primary surface. It follows the state machine in §5.1, is
authored through the five-step Wizard (§4.6), and is fronted by the advisory gates
in §6. There is **no mission-type enum**; missions differ only by free-text `brief`.
→ **`BOOK_A_MISSION_ENGINE.md` (A005)**.

### 7.5 Creative lifecycle

The `CreativeSet` produces **copy only** — six outputs, no images. Re-generation
plus the `creative_assets` gate provide the "variation" and "revision" steps.
Image generation is Roadmap.
→ **`BOOK_A_CREATIVE_WORKFLOW.md` (A006)**.

### 7.6 Approval lifecycle

Two mechanisms: the standalone `Approval` aggregate (§5.2, append-only timeline)
and the Mission gates (§6). Creative / Legal / Brand / Client approvals are
**categories over the same mechanism**, not distinct engines. Escalation and
tiered authority are Roadmap.
→ **`BOOK_A_APPROVAL_ENGINE.md` (A007)**.

### 7.7 Reporting lifecycle

Three real report surfaces: `ExecutiveReport` (verdict
`exceeded`/`on_track`/`at_risk`), `CampaignReport` (the six deterministic KPIs), and
`PerformanceReport` (a saved client snapshot). Profit / Creative / AI / Mission
dashboards are Roadmap views over the same real data.
→ **`BOOK_A_AGENCY_REPORTING.md` (A008)**.

---

## 8. Business rules (constitutional)

These rules bind every Book A document. They restate the code's actual behaviour.

| # | Rule | Reference |
|---|---|---|
| BR-1 | **A `CampaignDraft` is never launched.** Its status is the single value `draft`; there is no launch method and no ad-platform integration. | `campaign-engine/.../campaign-draft.ts` |
| BR-2 | **Creative is copy only.** `CreativeSet` produces six text outputs; it never generates images and never touches campaigns or ad platforms. | `creative-studio/.../creative-set.ts` |
| BR-3 | **A Mission `brief` must be ≥ 10 characters.** | `agency-os/src/mission/mission.ts` |
| BR-4 | **`subscription` pricing requires a `period`.** `amountMinor` must be in `[0, MAX_SAFE_INTEGER]`; `currency` non-empty. | `agency-os/src/product/product.ts` |
| BR-5 | **`bannedWords` is stored but NOT enforced** against generated copy. Enforcement is Roadmap. | `agency-os/src/brand/brand.ts` |
| BR-6 | **KPIs are deterministic and computed from hand-entered inputs.** `CampaignMetrics` is entered via a form; `computeKpis()` is pure. | `analytics-engine/.../kpi.ts` |
| BR-7 | **`approve()` returns the Mission to `planning`** — it does not advance the Mission. The next phase's generator advances it. | `agency-os/src/mission/mission.ts` |
| BR-8 | **The `approvalGates` array is advisory.** Gates carry no tiered authority; every gate maps to the same `approve()` transition. | `agency-os/src/mission/mission.ts`, `apps/web/src/routes.ts` |
| BR-9 | **AI artifacts are immutable and carry `provenance`.** Brief, creative, campaign, and executive artifacts cannot be edited after generation. | `marketing-intelligence/.../marketing-brief.ts` |
| BR-10 | **`Asset` versions are append-only.** Content is never overwritten; a new version is appended. | `agency-os/src/asset/asset.ts` |
| BR-11 | **The `Approval` timeline is append-only** — but it is not an immutable/tamper-evident audit store. | `agency-os/src/approval/approval.ts` |
| BR-12 | **Money is minor units** `{ amountMinor, currency }` everywhere. | domain sources |
| BR-13 | **Domains are passive; the routes layer orchestrates.** No context imports another context's aggregate. | `apps/web/src/routes.ts` |

---

## 9. Honest discrepancies (carry into every Book A doc)

The following are true of the shipped code and must never be smoothed over:

- **Advisory gate array** — the default `approvalGates` disagrees with the pipeline
  that always runs `creative_assets`; the array is metadata (§6).
- **No tiered authority** — no T0–T4, no thresholds; all gates are the same click.
- **`bannedWords` not enforced** (BR-5).
- **Dormant states** — Mission `paused`, gates `major_budget_change` and
  `contract_or_spend` are declared but never entered/used.
- **In-memory learning** — Company Brain and Executive Memory are functional but
  in-memory; the durable store is Roadmap (§11).
- **Manual KPI input** — analytics inputs are hand-entered, not ingested.
- **No mission-type enum** — missions differ only by free-text `brief`.

---

## 10. Implemented (shipped and wired)

The following are implemented, wired into `apps/web`, and tested. State them freely
in the present tense.

| Capability | Reference |
|---|---|
| Onboarding wizard (workspace → client → brand → product → mission) | `apps/web/src/routes.ts`, `onboarding.test.ts` |
| Mission lifecycle + advisory approval gates | `agency-os/src/mission/mission.ts`, `approval.test.ts` |
| Marketing brief generation (AI, provenance) | `marketing-intelligence/.../service.ts` |
| Creative set generation (copy only, gated) | `creative-studio/.../service.ts` |
| Campaign draft assembly (channels/budget, gated, never launched) | `campaign-engine/.../service.ts` |
| Deterministic ad-KPI math (CTR/CPC/CPA/CPL/ROAS/ROI) | `analytics-engine/.../kpi.ts` |
| Executive / CEO dashboard synthesis (single AI call) | `executive-ai/.../service.ts` |
| Local inference: Ollama + OpenAI-compatible | `.../ollama-engine.ts`, `.../openai-compatible-engine.ts` |
| Offline deterministic AI (default, no network) | `apps/web/src/ai.ts` |
| Multi-tenant isolation (application-level) | `packages/tenancy/src/tenant-context.ts` |
| Auth: Argon2id, sessions, CSRF, brute-force lockout, security headers | `apps/web/src/auth/`, `packages/security/` |
| Persistence: SQLite + Postgres (opt-in) | `packages/persistence/` |
| Company Brain (marketing metrics / graph / patterns / experience) | `company-brain/src/in-memory-company-brain.ts` |
| Bilingual TR/EN UI + AI output language | `apps/web/src/i18n.ts` |

---

## 11. Roadmap (NOT shipped — never present as present-tense)

The following are **not implemented** or exist only as inert scaffolding. Any Book A
document mentioning them must place them under a clearly-labelled Roadmap heading.

| Roadmap item | Current reality |
|---|---|
| **Live ad launch / campaign optimization** | Drafts only; no launch method, no ad-platform client |
| **External connectors** (Meta / Google / TikTok / CRM syncs) | `connector-hub` is event-name constants only, 0 importers |
| **Enforced RBAC / permission-aware AI** | Roles defined but never enforced; AI is not permission-scoped |
| **Immutable / tamper-evident audit trail** | Append-only in-memory timeline + logger lines only |
| **Document Q&A / cited answers over documents** | No document ingestion, chunking, embedding, or citations |
| **"Digital Employees" / autonomous agents doing work** | `agent-framework`, `autonomy` are event-name stubs, 0 importers |
| **Mission-type enums** | Missions differ only by free-text `brief` |
| **Image / vision / speech AI** | Declared in the AI-task type; no engine implementation |
| **Cloud / hosted inference** | `enableCloudInference` flag loaded but never read |
| **Durable learning store** (LanceDB/FAISS + Postgres + graph store) | Company Brain / Executive Memory are in-memory |
| **Dormant states** — Mission `paused`, gates `major_budget_change`, `contract_or_spend` | Declared in types, never entered/used |

See `../ROADMAP.md` and `../KNOWN_LIMITATIONS.md` for the program-level view, and
`../PRODUCT_TRUTH.md` §4–§5 for the source-of-code audit of these gaps.

---

## 12. Success metrics — the value contribution

Per the AdOS v2 Value Rule, every capability must serve **revenue ↑** or
**production time ↓**. The agency domain is measured against exactly these two axes.

| Metric axis | What AdOS does to move it | Measured via |
|---|---|---|
| **Production time ↓** | The gated pipeline turns a free-text objective into a brief, ad copy, a campaign draft, and an executive verdict without hand-authoring each artifact. Offline determinism removes cloud round-trips and per-token latency. | Time from Mission `submit()` to `ExecutiveReport`; number of manual authoring steps eliminated |
| **Revenue ↑** | Deterministic KPIs (ROAS, ROI, CPA, CPL) and the Company Brain's winning-ad patterns make the agency's recommendations measurable and repeatable, so more campaigns clear review and reach clients. | `ROAS`, `ROI` on `CampaignReport`; `ExecutiveReport.verdict` distribution (`exceeded` / `on_track` / `at_risk`) |

**Value contribution (domain-level).** The advertising-agency domain serves
**both** axes: it compresses the produce-a-campaign workflow (**production time ↓**)
and it grounds every recommendation in deterministic, reusable performance data
(**revenue ↑**). Any capability that serves neither axis does not belong in Book A.

---

## 13. Cross-references

| Document | Role |
|---|---|
| `../PRODUCT_TRUTH.md` | **Source of truth** — the source-of-code audit; wins any conflict |
| `../ARCHITECTURE.md` | System architecture |
| `../ROADMAP.md` | Program-level roadmap |
| `../KNOWN_LIMITATIONS.md` | Known limitations register |
| `BOOK_A_CLIENT_DOMAIN.md` (A002) | Client domain |
| `BOOK_A_BRAND_DOMAIN.md` (A003) | Brand domain |
| `BOOK_A_CAMPAIGN_LIFECYCLE.md` (A004) | Campaign lifecycle |
| `BOOK_A_MISSION_ENGINE.md` (A005) | Mission engine |
| `BOOK_A_CREATIVE_WORKFLOW.md` (A006) | Creative workflow |
| `BOOK_A_APPROVAL_ENGINE.md` (A007) | Approval engine |
| `BOOK_A_AGENCY_REPORTING.md` (A008) | Agency reporting |

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
