# A005 — MISSION ENGINE

> **Owner:** Office of the Chief Product Architect
> **Status:** Official — aligned to PRODUCT_TRUTH.md
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)
> **Governing charter:** [BOOK_A_AGENCY_CONSTITUTION.md](BOOK_A_AGENCY_CONSTITUTION.md)

This document defines the internal **Mission model** — the primary product surface of
AdOS. A `Mission` is how a client states an advertising objective in natural language;
the human-gated pipeline (brief → creative → campaign draft → report → executive
dashboard) then runs against that mission.

The document is deliberately split into two parts that are **never mixed**:

- **PART 1 — Implemented (authoritative).** The mission model, state machine, wizard,
  fields, and approval gates exactly as the code implements them, with source-path
  evidence. This is the contract of record.
- **PART 2 — ⚠️ Roadmap (proposed v2 design).** A requested **mission-type taxonomy**
  (Creative / Research / Optimization / Analysis / Reporting / QA / Review). This does
  **not** exist in code today and is presented only as a design proposal — a *lens* over
  the single real mission and its phases.

Where a reader wants the shortest possible truth: **there is NO mission-type enum in the
codebase. Missions differ only by their free-text `brief`.** Everything in Part 2 that
implies typed missions, priorities, or auto-retry is Roadmap.

---

# PART 1 — IMPLEMENTED (AUTHORITATIVE)

## 1. What a Mission is

A `Mission` is a DDD `AggregateRoot` living in `domains/agency-os/src/mission/`. It owns:

1. the raw natural-language **objective** (`brief`),
2. optional structured constraints (`budget`, `targetMetric`, `deadline`),
3. an advisory `approvalGates` array,
4. a `status` driven by an explicit state machine, and
5. `createdBy` provenance plus an optional `failureReason`.

The mission is the *single* input surface. The downstream artifacts — `MarketingBrief`,
`CreativeSet`, `CampaignDraft`, `CampaignReport`, `ExecutiveReport` — all reference the
mission by id but are owned by their own contexts (see A004 CAMPAIGN_LIFECYCLE.md). The
`apps/web/src/routes.ts` layer assembles the DTOs and drives the sequence; the mission
aggregate itself is passive apart from its own lifecycle transitions.

**Evidence:** `domains/agency-os/src/mission/mission.ts`,
`packages/contracts/src/mission.ts`.

## 2. Mission fields (exact)

Fields as declared on `MissionProps` (`domains/agency-os/src/mission/mission.ts`) and the
contract interface (`packages/contracts/src/mission.ts`).

| Field | Type | Required | Rule / default | Evidence |
|---|---|---|---|---|
| `tenantId` | `string` | Yes | non-empty (`Guard.againstEmptyString`) | `mission.ts` `validateMission` |
| `workspaceId` | `string` | Yes | non-empty | `mission.ts` |
| `clientId` | `string` | Yes | non-empty | `mission.ts` |
| `projectId` | `string` | No | optional owning project | `mission.ts` `MissionProps` |
| `brief` | `string` | **Yes** | **min length 10** after `trim()`; the raw NL objective | `mission.ts` `Guard.minLength(...,10,'brief')` |
| `budget` | `MissionBudget` | No | if present, `amountMinor > 0`; carries `period` | `mission.ts` |
| `targetMetric` | `MissionTargetMetric` | No | if present, `target > 0` | `mission.ts` |
| `deadline` | `string` | No | free-form ISO-ish string, unvalidated | `mission.ts` |
| `approvalGates` | `MissionApprovalGate[]` | Yes | default `['strategy_and_budget','campaign_launch']` | `mission.ts` `submit()` |
| `status` | `MissionStatus` | Yes | set to `submitted` at creation | `mission.ts` |
| `createdBy` | `string` | Yes | non-empty | `mission.ts` |
| `failureReason` | `string` | No | set only by `fail(reason)` | `mission.ts` `fail()` |

### 2.1 `budget` shape — `MissionBudget`

| Sub-field | Type | Notes |
|---|---|---|
| `amountMinor` | `number` | minor units (`Money`); must be `> 0` if budget supplied |
| `currency` | `string` | ISO currency code (from `Money`) |
| `period` | `'daily' \| 'weekly' \| 'monthly' \| 'total'` | budgeting cadence |

### 2.2 `targetMetric` shape — `MissionTargetMetric`

| Sub-field | Type | Notes |
|---|---|---|
| `name` | `string` | e.g. `leads` |
| `target` | `number` | must be `> 0` if supplied |
| `unit` | `string` | e.g. `count` |

**Value note on validation:** the only *hard* content requirement is a 10-character
brief. Budget/target/deadline are all optional, so a client can launch a mission with a
single sentence — this is intentional: the lowest-friction path from intent to draft.

## 3. Mission state machine (exact)

Statuses are the union `MissionStatus` in `packages/contracts/src/mission.ts`:

`submitted | planning | awaiting_approval | executing | paused | completed | failed`

Transitions are implemented as guarded methods on `Mission`
(`domains/agency-os/src/mission/mission.ts`). Each returns `Result<void,ValidationError>`
and emits a domain event; an illegal transition returns an `invalidTransition` error and
does **not** mutate state.

| Method | Guard (from status) | To status | Event | Evidence |
|---|---|---|---|---|
| `submit()` | (factory) | `submitted` | `MissionSubmitted` (`mission.submitted.v1`) | `mission.ts` `submit()` |
| `plan()` | `submitted` | `planning` | `MissionPlanned` (`mission.planned.v1`) | `mission.ts` `plan()` |
| `requestApproval(gate)` | `planning` **or** `executing` | `awaiting_approval` | `MissionApprovalRequested` (`mission.approval.requested.v1`) | `mission.ts` `requestApproval()` |
| `approve(gate)` | `awaiting_approval` | **`planning`** | `MissionApproved` (`mission.approved.v1`) | `mission.ts` `approve()` |
| `startExecuting()` | `planning` | `executing` | `MissionExecuting` (`mission.executing.v1`) | `mission.ts` `startExecuting()` |
| `complete()` | `executing` | `completed` | `MissionCompleted` (`mission.completed.v1`) | `mission.ts` `complete()` |
| `fail(reason)` | any non-terminal (not `completed`/`failed`) | `failed` | `MissionFailed` (`mission.failed.v1`) | `mission.ts` `fail()` |

### 3.1 Two facts that surprise people — documented honestly

1. **`approve()` returns to `planning`, it does NOT jump forward.** Approving a gate
   moves the mission back to `planning`; it is the *next phase's generator* (in
   `routes.ts`) that subsequently advances the mission. Approval is a release valve, not
   a step forward. (`mission.ts` `approve()`.)

2. **`paused` is declared but never entered.** `paused` exists in the `MissionStatus`
   union (`packages/contracts/src/mission.ts`) but **no method transitions into it** —
   there is no `pause()`. It is dormant/reserved. Do not describe pause/resume as a
   shipped capability. (Evidence: no `pause` method in `mission.ts`.)

### 3.2 State diagram (ASCII)

```
                 submit()
                    │
                    ▼
              ┌────────────┐   plan()      ┌───────────┐
              │ submitted  │ ────────────▶ │ planning  │◀──────────────┐
              └────────────┘               └───────────┘               │
                                                 │  │                  │
                              startExecuting()   │  │ requestApproval  │
                                                 ▼  ▼                  │
                                          ┌───────────┐  ┌──────────────────┐
                                          │ executing │  │ awaiting_approval │
                                          └───────────┘  └──────────────────┘
                                            │   │              │ approve(gate)
                                  complete()│   │requestApproval(re-enter)  │
                                            ▼   └──────────────┘────────────┘
                                       ┌───────────┐
                                       │ completed │  (terminal)
                                       └───────────┘

  fail(reason) may be called from ANY non-terminal status ─────▶ ┌────────┐
                                                                 │ failed │ (terminal)
                                                                 └────────┘

  paused : declared in MissionStatus, NEVER entered (no transition). Dormant.
```

**Terminal states:** `completed`, `failed`. Both reject further transitions
(`fail()` refuses when already `completed` or `failed`).

## 4. The Mission Wizard

The wizard is an **immutable step-builder** that guides a client from raw context to a
validated `Mission.submit(...)` input. Every step returns a new wizard instance so a UI
can navigate freely. Implemented in `domains/agency-os/src/mission/wizard.ts` and driven
by `apps/web/src/routes.ts` (`MissionWizard.start(...)`, `withProject`, `withTarget`, …).

Ordered steps — `MissionWizardStep` / `MISSION_WIZARD_STEPS`:

| # | Step | Captures | Advances when | Evidence |
|---|---|---|---|---|
| 1 | `context` | `tenantId`, `workspaceId`, `clientId`, `createdBy` | all four present | `wizard.ts` `currentStep()` |
| 2 | `objective` | `brief` (the NL objective) | `brief.trim().length >= 10` | `wizard.ts` |
| 3 | `budget` | `budget` (`MissionBudget`) | `budget` set | `wizard.ts` |
| 4 | `target` | `targetMetric` (`MissionTargetMetric`) | `targetMetric` set | `wizard.ts` |
| 5 | `review` | final confirmation → `submit()` | reached once 1–4 complete | `wizard.ts` |

`currentStep()` returns the **first incomplete step**, so the wizard is resumable. Steps
3 (`budget`) and 4 (`target`) fill optional fields; the wizard still surfaces them so the
client can add constraints, but a mission is valid without them (only `context` +
`objective` are hard-required by `submit()`).

## 5. Approval gates (exact — including the honest discrepancy)

### 5.1 The gate union

`MissionApprovalGate` (`packages/contracts/src/mission.ts`) has **five** values:

| Gate string | Used in pipeline? | Notes |
|---|---|---|
| `strategy_and_budget` | **Yes** — brief phase | `routes.ts` `requestApproval` + `gateApprove` |
| `creative_assets` | **Yes** — creative phase | `routes.ts` |
| `campaign_launch` | **Yes** — campaign phase | `routes.ts` |
| `major_budget_change` | **No** | declared in the union, **never referenced** — reserved/Roadmap |
| `contract_or_spend` | **No** | declared in the union, **never referenced** — reserved/Roadmap |

### 5.2 The discrepancy, stated plainly

Three honest facts a reader must not miss:

1. **The default `approvalGates` array lists only two gates**
   (`['strategy_and_budget','campaign_launch']`), yet **the pipeline always runs the
   `creative_assets` gate too**. So the array is **advisory metadata** — it is not what
   decides which gates fire.

2. **Route handlers call `requestApproval(gate)` unconditionally** at each phase; they do
   not consult the `approvalGates` array to decide whether to gate. (Evidence:
   `routes.ts` calls `requestApproval(..., 'strategy_and_budget')`,
   `'creative_assets'`, `'campaign_launch'` at the brief/creative/campaign phases
   respectively.)

3. **Every gate maps to the same transition.** `gateApprove(...)` in `routes.ts` calls
   `mission.approve(gate)` for *every* gate string, and `approve()` performs the identical
   `awaiting_approval → planning` transition regardless of which gate it is. **The gate
   string is informational, not branch logic.**

**Therefore:** gates do **not** carry tiered authority. There is **no T0–T4 approval
model, no spend-limit tiers, no per-gate routing.** Any document that implies tiered
approval authority is describing Roadmap, not code. (See also A007 APPROVAL_ENGINE.md for
the separate generic `Approval` aggregate, which is a different mechanism.)

### 5.3 Gate-to-phase mapping (as wired in `routes.ts`)

| Pipeline phase | Artifact produced | Gate requested | Gate approved via |
|---|---|---|---|
| Brief | `MarketingBrief` | `strategy_and_budget` | `gateApprove(..., 'strategy_and_budget')` |
| Creative | `CreativeSet` | `creative_assets` | `gateApprove(..., 'creative_assets')` |
| Campaign | `CampaignDraft` | `campaign_launch` | `gateApprove(..., 'campaign_launch')` |
| Analytics | `CampaignReport` | *(no gate)* | KPIs from a manual spend/revenue form |
| Executive | `ExecutiveReport` | *(no gate)* | single AI synthesis call |

## 5A. Worked lifecycle scenarios (Implemented)

The following sequences use only the real transitions from §3 and the real gate calls
from §5.3. They illustrate how `routes.ts` drives an otherwise-passive mission.

**Scenario A — happy path through all three gates:**

| Step | Call | Status after |
|---|---|---|
| 1 | `submit()` (via wizard) | `submitted` |
| 2 | `plan()` | `planning` |
| 3 | `requestApproval('strategy_and_budget')` (brief ready) | `awaiting_approval` |
| 4 | `approve('strategy_and_budget')` | `planning` |
| 5 | `requestApproval('creative_assets')` (creative ready) | `awaiting_approval` |
| 6 | `approve('creative_assets')` | `planning` |
| 7 | `requestApproval('campaign_launch')` (campaign draft ready) | `awaiting_approval` |
| 8 | `approve('campaign_launch')` | `planning` |
| 9 | `startExecuting()` | `executing` |
| 10 | `complete()` | `completed` (terminal) |

Note how every `approve(...)` lands back on `planning` (§3.1) and the next phase's
generator re-advances the mission — approval never jumps the mission forward by itself.

**Scenario B — early failure:**

| Step | Call | Status after |
|---|---|---|
| 1 | `submit()` | `submitted` |
| 2 | `plan()` | `planning` |
| 3 | `fail('Cancelled by the customer')` | `failed` (terminal, `failureReason` set) |

`fail()` is legal from any non-terminal status, so a mission can be failed while
`submitted`, `planning`, `awaiting_approval`, or `executing`. The web layer wires two
entry points to it — an explicit failure and a customer-cancellation default reason
(`routes.ts`). There is no un-fail: `failed` is terminal.

## 5B. Business rules (Implemented)

| # | Rule | Source |
|---|---|---|
| BR-1 | `brief` must be at least 10 characters after `trim()` | `mission.ts` `validateMission` |
| BR-2 | `tenantId`, `workspaceId`, `clientId`, `createdBy` are non-empty | `mission.ts` `validateMission` |
| BR-3 | If `budget` supplied, `amountMinor` must be `> 0` | `mission.ts` `validateMission` |
| BR-4 | If `targetMetric` supplied, `target` must be `> 0` | `mission.ts` `validateMission` |
| BR-5 | Every transition is guarded; an illegal transition returns `ValidationError` and does not mutate state | `mission.ts` `invalidTransition` |
| BR-6 | `approve()` always transitions to `planning`, regardless of gate | `mission.ts` `approve()` |
| BR-7 | `completed` and `failed` are terminal; no method leaves them | `mission.ts` |
| BR-8 | `paused` is never entered (no transition targets it) | `packages/contracts/src/mission.ts`, `mission.ts` |
| BR-9 | Default `approvalGates` = `['strategy_and_budget','campaign_launch']`, but the array is advisory (§5.2) | `mission.ts` `submit()` |
| BR-10 | The mission emits an event on every successful transition | `mission.ts` (all methods) |

## 5C. Aggregate mechanics (Implemented)

`Mission` follows the Book A DDD conventions (see BOOK_A_AGENCY_CONSTITUTION.md §1.1):

- **Typed id:** `MissionId` (`Identifier`), minted via `MissionId.of(value?)`.
- **Factory:** `submit(input)` returns `Result<Mission, ValidationError>` (not a throwing
  constructor); the private constructor is unreachable from outside.
- **Rehydration:** `restore(id, props)` rebuilds a mission from persistence **without**
  emitting events — used by the repository layer.
- **Snapshot:** `snapshot()` returns a deep-ish copy of `MissionProps` (cloning `budget`,
  `targetMetric`, and the `approvalGates` array) for persistence.
- **Persistence:** `domains/agency-os/src/mission/repository.ts` defines the repository
  port; durable storage is opt-in (in-memory by default per PRODUCT_TRUTH.md §2.10).

## 6. Domain events emitted

All events are declared in `mission.ts` and keyed by `MISSION_EVENTS`
(`packages/contracts/src/mission.ts`):

| Event class | Event name | Payload |
|---|---|---|
| `MissionSubmitted` | `mission.submitted.v1` | `{ workspaceId, clientId, brief, tenantId }` |
| `MissionPlanned` | `mission.planned.v1` | `{}` |
| `MissionApprovalRequested` | `mission.approval.requested.v1` | `{ gate }` |
| `MissionApproved` | `mission.approved.v1` | `{ gate }` |
| `MissionExecuting` | `mission.executing.v1` | `{}` |
| `MissionCompleted` | `mission.completed.v1` | `{}` |
| `MissionFailed` | `mission.failed.v1` | `{ reason }` |

> Note: `MISSION_EVENTS.UPDATED` (`mission.updated.v1`) is declared for the
> `MissionUpdate` read-model but is **not** emitted by a `Mission` transition method.

## 7. The single-brief truth (restated)

**There is NO mission-type enum in code.** `Mission` has no `type`, `kind`, `category`,
or `priority` field. Two missions are distinguished *only* by the free text of their
`brief` (and their optional budget/target/deadline). The engine treats every mission
identically; the *content* of the brief is what varies. Everything typed, prioritized, or
auto-retried in Part 2 is a proposal, not a shipped behaviour.

## 8. Value contribution (Implemented)

**Production time ↓ (primary) and revenue ↑ (secondary).**

The Mission Engine is the **core throughput unit** of the agency OS: it compresses the
**brief → draft** cycle. A client states one objective; the human-gated pipeline turns it
into a marketing brief, ad copy, and a campaign draft without a strategist, a copywriter,
and a media planner each starting from a blank page.

- **Production time ↓:** one NL sentence (min 10 chars) replaces multi-day briefing and
  hand-offs; the wizard is resumable and low-friction; approvals are single clicks.
- **Revenue ↑:** faster brief→draft cycles mean an agency can carry more concurrent
  missions per operator, and the structured `targetMetric`/`budget` keep each mission
  anchored to a measurable commercial goal.

Every downstream throughput improvement in Book A ultimately hangs off the mission being
cheap to state and fast to advance.

---

# PART 2 — ⚠️ ROADMAP (PROPOSED v2 DESIGN — NOT SHIPPED)

> **READ THIS FIRST.** Nothing in Part 2 exists in the codebase. There is **no
> mission-type enum, no `priority` field, and no auto-retry** today. The taxonomy below
> is a **proposed lens** — a way to *classify* the one real single-brief mission by which
> phase(s) of the existing pipeline it exercises. It is offered for v2 planning only and
> must never be described as implemented. Cross-reference: [../ROADMAP.md](../ROADMAP.md),
> [../KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md).

## 9. Proposed mission-type taxonomy (a lens, not an enum)

The idea: keep the **one** real `Mission` aggregate and single free-text `brief`, but let
the UI *tag* a mission with a **type** that pre-selects which existing pipeline phases run
and which AI capability leads. Most proposed types are just **names for phases that
already exist**; two (Optimization, QA) would require capabilities that are themselves
Roadmap.

| Proposed type | Maps to real phase / artifact | New capability required? |
|---|---|---|
| **Research** | ≈ Brief phase → `MarketingBrief` (`marketing-intelligence`) | No — reuses existing brief generation |
| **Creative** | ≈ Creative phase → `CreativeSet` (`creative-studio`) | No — reuses existing copy generation |
| **Analysis** | ≈ Analytics phase → `CampaignReport` KPIs (`analytics-engine`) | No — reuses deterministic KPI math |
| **Reporting** | ≈ Analytics narrative + `PerformanceReport` snapshot (`agency-os/report`) | No — reuses existing report assembly |
| **Review** | ≈ Executive phase → `ExecutiveReport` verdict (`executive-ai`) | No — reuses existing exec synthesis |
| **Optimization** | *(none — no live ads to optimize; drafts only)* | **Yes — Roadmap** (would need live-ad telemetry, which does not exist) |
| **QA** | *(none — no automated brand/compliance enforcement)* | **Yes — Roadmap** (would need bannedWords enforcement + compliance checks, not implemented) |

> **Why Optimization and QA are doubly-Roadmap:** AdOS **drafts** campaigns and **never
> launches** them, so there is no live campaign to *optimize*. And `bannedWords` on a
> Brand are **stored but not enforced** against generated copy, so there is no automated
> *QA* gate. Both proposed types depend on capabilities that PRODUCT_TRUTH.md marks as
> absent. They are the *most* speculative entries in this taxonomy.

## 10. Proposed mission definitions

For each proposed type the table below specifies **Inputs, Outputs, Priority, Dependencies,
Owner, AI assistance, Status, Retry policy**. The two engine-wide caveats apply to every
row:

- **Priority — ⚠️ Roadmap.** There is **no `priority` field on `Mission` today.** All
  priorities shown are *proposed* defaults.
- **Retry policy — ⚠️ Roadmap.** `fail(reason)` exists and is terminal; **auto-retry does
  not exist.** All retry policies shown are *proposed*.

### 10.1 Research mission (proposed — ≈ Brief)

| Aspect | Proposed value |
|---|---|
| **Inputs** | Mission `brief`, client/brand context DTO, optional `budget`/`targetMetric` |
| **Outputs** | `MarketingBrief` content{objective, targetAudience, positioning, keyMessages[], recommendedChannels[], budgetAllocation[], kpis[]} |
| **Priority** | ⚠️ Roadmap — proposed *High* (upstream of everything) |
| **Dependencies** | None upstream; blocks Creative |
| **Owner** | Strategy / Planning (human) + `marketing-intelligence` domain |
| **AI assistance** | Brief generation (strategy & planning only — never ads/images) |
| **Status** | Real phase, reusable as-is; the *type label* is Roadmap |
| **Retry policy** | ⚠️ Roadmap — proposed re-generate brief; today: regenerate manually, `fail()` on abandonment |

### 10.2 Creative mission (proposed — ≈ Creative)

| Aspect | Proposed value |
|---|---|
| **Inputs** | `MarketingBrief` DTO, brand voice/rules DTO |
| **Outputs** | `CreativeSet` — six copy outputs: `headline`, `adCopy`, `cta`, `socialPost`, `landingPage{headline,body,cta}`, `email{subject,body}` (copy only, no images) |
| **Priority** | ⚠️ Roadmap — proposed *High* |
| **Dependencies** | Requires an approved brief (`creative_assets` gate) |
| **Owner** | Creative (human) + `creative-studio` domain |
| **AI assistance** | Ad-copy generation; never touches campaigns or ad platforms |
| **Status** | Real phase, reusable as-is; the *type label* is Roadmap |
| **Retry policy** | ⚠️ Roadmap — proposed regenerate variations; today: re-run generation + re-gate via `creative_assets` |

### 10.3 Analysis mission (proposed — ≈ Analytics/KPIs)

| Aspect | Proposed value |
|---|---|
| **Inputs** | `CampaignMetrics{impressions,clicks,conversions,leads,spend,revenue}` — **hand-entered via a form**, not ingested |
| **Outputs** | Deterministic KPIs: CTR, CPC, CPA, CPL, ROAS, ROI |
| **Priority** | ⚠️ Roadmap — proposed *Medium* |
| **Dependencies** | Requires a `CampaignDraft` + entered metrics |
| **Owner** | Analyst (human) + `analytics-engine` domain |
| **AI assistance** | None for the numbers (KPIs are pure math); AI only writes the narrative summary |
| **Status** | Real phase, reusable as-is; the *type label* is Roadmap |
| **Retry policy** | ⚠️ Roadmap — recomputation is deterministic; re-enter corrected metrics to recompute |

### 10.4 Reporting mission (proposed — ≈ Analytics narrative + snapshot)

| Aspect | Proposed value |
|---|---|
| **Inputs** | Computed KPIs + narrative context |
| **Outputs** | `CampaignReport` narrative{summary, highlights[], recommendations[]} and/or a saved `PerformanceReport` snapshot |
| **Priority** | ⚠️ Roadmap — proposed *Medium* |
| **Dependencies** | Requires Analysis outputs |
| **Owner** | Analyst / Account (human) + `analytics-engine` + `agency-os/report` |
| **AI assistance** | Narrative summary generation (KPIs remain deterministic) |
| **Status** | Real phase, reusable as-is; the *type label* is Roadmap |
| **Retry policy** | ⚠️ Roadmap — regenerate narrative; `PerformanceReport` is immutable, so a retry produces a new snapshot |

### 10.5 Review mission (proposed — ≈ Executive)

| Aspect | Proposed value |
|---|---|
| **Inputs** | `CampaignReport` + KPIs |
| **Outputs** | `ExecutiveReport` content{headline, executiveSummary, verdict, keyResults[], decisions[], nextActions[]} — verdict `exceeded \| on_track \| at_risk` |
| **Priority** | ⚠️ Roadmap — proposed *Low* (terminal synthesis) |
| **Dependencies** | Requires a report to synthesize |
| **Owner** | Executive / CEO Office (human) + `executive-ai` domain |
| **AI assistance** | Single LLM synthesis call (not an agent loop) |
| **Status** | Real phase, reusable as-is; the *type label* is Roadmap |
| **Retry policy** | ⚠️ Roadmap — re-synthesize on demand; no automated retry |

### 10.6 Optimization mission (proposed — NEW type, doubly-Roadmap)

| Aspect | Proposed value |
|---|---|
| **Inputs** | *(Would need)* live campaign telemetry — **does not exist**; AdOS never launches ads |
| **Outputs** | *(Would need)* budget/bid/creative adjustments against a running campaign |
| **Priority** | ⚠️ Roadmap — undefined (no `priority` field, no live campaigns) |
| **Dependencies** | Depends on live-ad launch + connectors — both absent |
| **Owner** | ⚠️ Roadmap — proposed Media/Growth + a future optimization engine |
| **AI assistance** | ⚠️ Roadmap — not implemented |
| **Status** | ⚠️ **Roadmap — no mapping to real code.** Blocked on capabilities AdOS does not have |
| **Retry policy** | ⚠️ Roadmap — n/a |

### 10.7 QA mission (proposed — NEW type, doubly-Roadmap)

| Aspect | Proposed value |
|---|---|
| **Inputs** | *(Would need)* generated copy + brand `bannedWords`/dos/donts |
| **Outputs** | *(Would need)* pass/fail compliance findings against brand rules |
| **Priority** | ⚠️ Roadmap — undefined |
| **Dependencies** | Depends on **`bannedWords` enforcement**, which is stored-but-not-enforced today |
| **Owner** | ⚠️ Roadmap — proposed Brand/Compliance + a future QA engine |
| **AI assistance** | ⚠️ Roadmap — not implemented |
| **Status** | ⚠️ **Roadmap — no mapping to real code.** Enforcement layer absent |
| **Retry policy** | ⚠️ Roadmap — n/a |

## 11. Proposed cross-cutting v2 fields (all Roadmap)

If the taxonomy above were adopted, these mission fields would be **added** — none exist
today:

| Proposed field | Purpose | Why it is Roadmap |
|---|---|---|
| `type` | the mission-type tag (Creative/Research/…) | **No mission-type enum in code** |
| `priority` | scheduling/queue ordering | **No `priority` field on `Mission`** |
| `retryPolicy` | auto-retry on `fail()` | **`fail()` is terminal; no auto-retry loop exists** |
| `dependsOn[]` | explicit mission-to-mission dependencies | Missions are independent today; sequencing is done by `routes.ts` phases |

## 12. Roadmap value contribution (if built)

The taxonomy's *intent* still serves the v2 value rule — **production time ↓ / revenue ↑**
— by letting an operator spin up a narrowly-scoped mission (e.g. a pure "Research" or
"Reporting" run) without walking the full pipeline, and by making Optimization/QA
first-class *if* the underlying live-ad and enforcement capabilities are ever built. Until
those capabilities exist, the value is hypothetical and the types remain Roadmap.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
