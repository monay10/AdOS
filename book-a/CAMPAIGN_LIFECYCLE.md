# CAMPAIGN LIFECYCLE — Book A / A004

**Owner:** Office of the Chief Product Architect
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** ../PRODUCT_TRUTH.md
**Governing reference:** BOOK_A_AGENCY_CONSTITUTION.md

---

## 0. Purpose and scope

This document models the **campaign lifecycle** exactly as the AdOS code implements
it — an offline-first, 100% local-AI advertising-agency platform ("Agency OS"). A
client states an advertising objective as a **Mission** in natural language; AdOS
runs it through a **human-gated pipeline** and produces a **campaign draft**, a
performance report, and an executive verdict. It **drafts**; it **never launches live
ads**.

The lifecycle is presented as nine business stages:

```
Idea → Brief → Research → Creative → Review → Approval → Draft → Reporting → Archive
```

These nine stages are a **business-facing lens** over the real, wired pipeline in
`apps/web/src/routes.ts` and the real domain aggregates. Where a stage groups more
than one code artifact (e.g. Brief and Research both resolve to the single
`MarketingBrief`), this document says so plainly rather than inventing new states.

Underneath every stage runs the single **Mission state machine**
(`domains/agency-os/src/mission/mission.ts`). Section 1 fixes that machine so each
stage table can reference it precisely; Sections 2–10 define each stage with **Entry,
Exit, Owner, AI role, Artifacts, KPIs**; Section 11 collects the KPI definitions;
Section 12 separates Implemented from Roadmap.

> **Truth guardrail.** A CampaignDraft never leaves `draft`. There is no launch
> method and no ad-platform integration. "Live launch" and everything downstream of a
> live ad are **Roadmap only** and are labelled as such wherever they appear.

---

## 1. The Mission state machine underneath every stage

Every lifecycle stage is a projection of the Mission aggregate and its transitions.
The Mission is the **primary product surface**: a raw natural-language `brief` string
(min length 10), optional `budget`, optional `targetMetric`, optional `deadline`, an
advisory `approvalGates[]` array, `createdBy`, and `failureReason?`. **There is no
mission-type enum** — missions differ only by free-text brief.

### 1.1 States and transitions (exact)

| Transition | From → To | Trigger |
|---|---|---|
| `submit()` | (new) → `submitted` | Mission created from the Wizard / raw brief |
| `plan()` | `submitted` → `planning` | Orchestrator begins a phase |
| `requestApproval(gate)` | `planning` \| `executing` → `awaiting_approval` | A phase produces an artifact needing sign-off |
| `approve(gate)` | `awaiting_approval` → `planning` | Human approves — returns to `planning`, does **not** jump forward |
| `startExecuting()` | `planning` → `executing` | Learning phase begins execution |
| `complete()` | `executing` → `completed` | Terminal success |
| `fail(reason)` | any non-terminal → `failed` | Terminal failure; sets `failureReason` |

`paused` is declared in the Mission status type but is **never entered** — it is
dormant/reserved. Source: `domains/agency-os/src/mission/mission.ts`.

> **Key mechanic.** `approve(gate)` always returns the Mission to `planning`; the
> **next phase's generator** is what advances the work. Approval is a release valve,
> not a forward jump.

### 1.2 Approval gates (advisory, not tiered)

The contract union `MissionApprovalGate` declares five values —
`strategy_and_budget`, `creative_assets`, `campaign_launch`, `major_budget_change`,
`contract_or_spend` — but the wired pipeline uses **three**:

| Gate | Applied at stage | Pipeline phase |
|---|---|---|
| `strategy_and_budget` | Brief / Research | Phase 2 (brief) |
| `creative_assets` | Creative | Phase 3 (creative) |
| `campaign_launch` | Approval → Draft | Phase 4 (campaign) |

`major_budget_change` and `contract_or_spend` exist in the type but are **never
used** → reserved/Roadmap. The Mission's **default** `approvalGates` array is only
`['strategy_and_budget','campaign_launch']`, yet the pipeline always runs
`creative_assets` too. The gate array is therefore **advisory metadata**: route
handlers call `requestApproval(gate)` unconditionally and `gateApprove` maps **every**
gate to the same `mission.approve()` transition. **There is no tiered T0–T4 approval
authority** — the gate string is informational, not branch logic. Source:
`apps/web/src/routes.ts`, `domains/agency-os/src/mission/mission.ts`.

### 1.3 Stage → phase → Mission-state map

| # | Stage | Wired phase (`routes.ts`) | Primary artifact | Gate | Mission states touched |
|---|---|---|---|---|---|
| 1 | Idea | Mission intake (Wizard) | Mission (raw `brief`) | — | `submitted` |
| 2 | Brief | Phase 2 — brief | `MarketingBrief` | `strategy_and_budget` | `planning` → `awaiting_approval` |
| 3 | Research | Phase 2 — brief (same artifact) | `MarketingBrief` | `strategy_and_budget` | `awaiting_approval` ↔ `planning` |
| 4 | Creative | Phase 3 — creative | `CreativeSet` | `creative_assets` | `planning` → `awaiting_approval` |
| 5 | Review | Mission gates + Approval aggregate | `Approval` timeline | (per gate) | `awaiting_approval` |
| 6 | Approval | `approve(gate)` for each gate | Mission gate approvals | `campaign_launch` | `awaiting_approval` → `planning` |
| 7 | Draft | Phase 4 — campaign | `CampaignDraft` (`draft`) | `campaign_launch` | `planning` → `awaiting_approval` → `planning` |
| 8 | Reporting | Phase 5 analytics + Phase 10 executive | `CampaignReport`, `ExecutiveReport` | — (no gate) | `planning` → `executing` → `completed` |
| 9 | Archive | Project archive / snapshot | Project `archived`, `PerformanceReport` | — | `completed` (terminal) |

Phase 6 (learn) sits between Reporting sub-steps: it writes the Decision Journal,
Executive Memory, and Company Brain, then calls `startExecuting()` + `complete()`.

### 1.4 Lifecycle flow (business stages over the real pipeline)

```
        HUMAN                    AI (local, offline-first)              MISSION STATE
        ─────                    ─────────────────────────             ─────────────
 (1) Idea      ── Wizard ─────────────────────────────────────────▶   submitted
                    │ plan()
                    ▼
 (2) Brief     ◀── MarketingBrief generation ─────────────────────▶   planning → awaiting_approval
 (3) Research  ◀── (same artifact: audience/positioning/channels)     [gate strategy_and_budget]
                    │ approve(strategy_and_budget)  → planning
                    ▼
 (4) Creative  ◀── CreativeSet (6 copy outputs, copy only) ───────▶   planning → awaiting_approval
                    │                                                  [gate creative_assets]
 (5) Review    ── human accept / revise / reject ─────────────────    awaiting_approval
 (6) Approval  ── approve(creative_assets) → planning                 awaiting_approval → planning
                    ▼
 (7) Draft     ◀── CampaignDraft (status='draft', TERMINAL) ──────▶   planning → awaiting_approval → planning
                    │                                                  [gate campaign_launch]
                    ▼  (no launch — metrics hand-entered)
 (8) Reporting ◀── CampaignReport (6 KPIs, deterministic) ────────▶   startExecuting() → executing
               ◀── ExecutiveReport (verdict) ────────────────────▶   complete() → completed
                    ▼
 (9) Archive   ── Project archive() + PerformanceReport snapshot ─    completed (terminal)
```

The single-headed arrow into "Idea" and out of "Archive" marks the human boundary; AI
only ever **drafts** artifacts, and **every** artifact passes a human gate before the
next generator runs. Nothing crosses from Draft into a live-ad state.

---

## 2. Stage 1 — Idea

**What it is.** The raw Mission brief. A client (or an agency operator on their
behalf) states an advertising objective in natural language through the Mission
**Wizard** (`context → objective → budget → target → review`). This is the seed of
the entire lifecycle; "Idea" = the `brief` string before any AI artifact exists.

| Aspect | Definition |
|---|---|
| **Entry** | A Client, Brand, and Project exist (onboarding complete); operator opens the Mission Wizard. |
| **Exit** | Mission is created and `submit()` fires → status `submitted`; a raw `brief` (min length 10) is stored, with optional `budget`, `targetMetric`, `deadline`. |
| **Owner** | Client / Agency operator (human) — authors the objective. |
| **AI role** | **None yet.** The Idea is pure human input. No AI artifact is generated at this stage. |
| **Artifacts** | Mission aggregate: `brief` (raw NL), optional `budget{amountMinor,currency,period}`, optional `targetMetric{name,target,unit}`, `approvalGates[]` (advisory), `createdBy`. Source: `domains/agency-os/src/mission/mission.ts`, `domains/agency-os/src/mission/wizard.ts`. |
| **KPIs** | Process KPIs: `intake_cycle_time` (Wizard start → `submitted`); `brief_completeness` (proportion of optional fields supplied). No advertising KPIs yet. |

**Value contribution — production time ↓.** A structured five-step Wizard turns a
loose objective into a machine-actionable Mission in one sitting, removing the manual
back-and-forth an agency normally spends scoping a request before any work starts.

---

## 3. Stage 2 — Brief

**What it is.** The Mission is planned and the first AI artifact — the
**MarketingBrief** — is generated. This is the **strategy & planning** layer only:
objective, audience, positioning, key messages, recommended channels, budget
allocation, and target KPIs. It **never** produces ads, images, or live campaigns.

| Aspect | Definition |
|---|---|
| **Entry** | Mission `submitted`; orchestrator calls `plan()` → `planning`; Phase 2 runs the brief generator. |
| **Exit** | An immutable `MarketingBrief` is produced and `requestApproval('strategy_and_budget')` fires → Mission `awaiting_approval`. |
| **Owner** | Strategy lead (human) owns acceptance; AI drafts. |
| **AI role** | **Generator.** A single local-AI synthesis call produces the brief `content`, carrying `provenance{taskId,capability,model,engine,latencyMs}`. Default engine is the deterministic `OfflineAIManager`; a locally-run engine (Ollama / OpenAI-compatible) yields genuine model output. |
| **Artifacts** | `MarketingBrief` (→ `missionId`), immutable, `content{objective,targetAudience,positioning,keyMessages[],recommendedChannels[],budgetAllocation[{channel,percentage}],kpis[{name,target,unit}]}`. Rule: "strategy & planning ONLY — never ads/images/live campaigns." Source: `domains/marketing-intelligence/src/brief/marketing-brief.ts`, `domains/marketing-intelligence/src/brief/service.ts`. |
| **KPIs** | Process KPIs: `brief_cycle_time` (`planning` → `awaiting_approval`); `brief_revisions` (regenerations before acceptance); target-KPI **coverage** (how many of the six ad KPIs the brief sets targets for). The six advertising KPIs (`CTR`/`CPC`/`CPA`/`CPL`/`ROAS`/`ROI`) are **defined as targets** here but **measured** only at Reporting. |

**Value contribution — production time ↓.** The AI compresses hours of strategic
desk research and slide-building into one deterministic pass, so the agency reaches an
approvable strategy faster and spends billable time on judgement, not first drafts.

---

## 4. Stage 3 — Research

**What it is.** In the shipped code, **Research is not a separate artifact** — the
audience, positioning, and channel-mix reasoning live **inside the same
`MarketingBrief`** produced in Stage 2. This stage names the analytical content of the
brief and the memory that informs it, so the lifecycle stays honest about where
"research" actually happens.

| Aspect | Definition |
|---|---|
| **Entry** | Same as Brief — Phase 2. Research and Brief share one generation pass and one gate. |
| **Exit** | Shared with Brief: `requestApproval('strategy_and_budget')` → `awaiting_approval`. Approval returns the Mission to `planning`, from which Creative advances. |
| **Owner** | Strategy / research lead (human) reviews; AI supplies the analysis. |
| **AI role** | **Analyst (within the brief).** The brief's `targetAudience`, `positioning`, `recommendedChannels[]`, and `budgetAllocation[]` are the research output. The **Company Brain** (marketing-performance memory: graph + experience + patterns + DNA/brand stores) can `enrich()` these with sample-weighted averages from past campaigns. |
| **Artifacts** | `MarketingBrief` fields above; plus read-only reference to Company Brain (`domains/company-brain/src/in-memory-company-brain.ts`). **No** standalone research document, and **no** document knowledge base or cited answers — the Company Brain is a **marketing-performance** memory, not a document library. |
| **KPIs** | Process KPIs: `research_depth` (count of `recommendedChannels[]` + `keyMessages[]`); `insight_reuse` (whether Company Brain enrichment was applied). Advertising KPIs remain **targets only** at this point. |

**Value contribution — revenue ↑.** Grounding audience and channel choices in the
Company Brain's record of what has actually performed raises the expected return of
the resulting campaign, tilting spend toward channels with demonstrated `ROAS`/`ROI`.

> **Roadmap.** Durable memory (LanceDB/FAISS + Postgres + graph store), external
> market/connector data, and document Q&A are **not** in the shipped code — the
> learning layer is functional but **in-memory**. See ../ROADMAP.md.

---

## 5. Stage 4 — Creative

**What it is.** Generation of the **CreativeSet** — advertising **copy only**. Six
text outputs are produced; **no images** are generated, and the stage never touches
campaigns or ad platforms.

| Aspect | Definition |
|---|---|
| **Entry** | `strategy_and_budget` approved → Mission back in `planning`; Phase 3 runs the creative generator, consuming the accepted brief. |
| **Exit** | A `CreativeSet` is produced and `requestApproval('creative_assets')` fires → `awaiting_approval`. |
| **Owner** | Creative lead / copywriter (human) owns acceptance; AI drafts copy. |
| **AI role** | **Copy generator.** One local-AI call produces all six copy outputs. Rule (enforced by design intent in code): "**copy ONLY**; never touches campaigns or ad platforms." |
| **Artifacts** | `CreativeSet` (→ `missionId`, `briefId`), `content` = six outputs: `headline`, `adCopy`, `cta`, `socialPost`, `landingPage{headline,body,cta}`, `email{subject,body}`. Source: `domains/creative-studio/src/creative/creative-set.ts`, `domains/creative-studio/src/creative/service.ts`. |
| **KPIs** | Process KPIs: `creative_cycle_time` (`planning` → `awaiting_approval`); `creative_revisions` (regenerations via the `creative_assets` gate); `output_completeness` (all six copy fields populated). |

**Value contribution — production time ↓.** One pass yields a full copy kit —
headline, body, CTA, social post, landing page, and email — that a copy team would
otherwise draft over days, so the agency can service more briefs per creative hour.

> **Discrepancy (documented honestly).** Brand `bannedWords[]` are **stored but not
> enforced** against generated copy anywhere in code — banned-word enforcement is
> **Roadmap**. Image/vision generation is **Roadmap**. See BOOK_A_AGENCY_CONSTITUTION.md
> and A006 CREATIVE_WORKFLOW.md.

---

## 6. Stage 5 — Review

**What it is.** Human review of each generated artifact before its gate is approved.
Review is expressed through **two real mechanisms**: (a) the Mission `awaiting_approval`
state a phase enters via `requestApproval(gate)`, and (b) the **separate generic
`Approval` aggregate** with its append-only timeline. Review is where a human accepts,
rejects, or asks for a revision.

| Aspect | Definition |
|---|---|
| **Entry** | Any phase has fired `requestApproval(gate)`; Mission is `awaiting_approval`. An `Approval` record may be opened for structured sign-off. |
| **Exit** | Reviewer decides. Accept → proceed to Stage 6 (Approval). Revision → regenerate the artifact (re-enters the producing stage). Reject → operator may `fail(reason)` the Mission. |
| **Owner** | Reviewer (human) — creative / strategy / client-side, modelled as a **label** on the same mechanism (distinct Legal/Brand/Client authorities are Roadmap). |
| **AI role** | **None (advisory only).** Review is a human act. The AI does not self-approve; there is no autonomous agent making the call. |
| **Artifacts** | `Approval` aggregate: `title`, `description`, `requestedBy`, `projectId?`, `status` `draft`\|`in_review`\|`approved`\|`rejected`\|`revision_requested`, and an **append-only** `timeline[{action,from,to,note,actor,at}]`. Source: `domains/agency-os/src/approval/approval.ts`. |
| **KPIs** | Process KPIs: `review_turnaround` (time in `awaiting_approval` / `in_review`); `revision_rate` (share of artifacts returned as `revision_requested`); `first_pass_yield` (share approved without revision). |

**Value contribution — revenue ↑ (risk down).** A mandatory human checkpoint at each
gate keeps off-brand or off-strategy work from reaching a client, protecting the
agency's reputation and retention — the revenue that repeat business depends on.

> **Discrepancy (documented honestly).** The `Approval` timeline is a **real
> append-only in-memory list**, which is genuine review history — but it is **not** an
> immutable / tamper-evident audit store. A true immutable audit trail is **Roadmap**.
> See A007 APPROVAL_ENGINE.md.

---

## 7. Stage 6 — Approval

**What it is.** The act that releases a reviewed artifact. For each gate the operator
calls `mission.approve(gate)`, moving the Mission from `awaiting_approval` back to
`planning`, from which the next phase's generator advances the work. The final gate in
the generation sequence is `campaign_launch`, which precedes assembly of the campaign
**draft**.

| Aspect | Definition |
|---|---|
| **Entry** | Mission `awaiting_approval`; a reviewer in Stage 5 has accepted the artifact. |
| **Exit** | `approve(gate)` → Mission `planning`. Whichever gate is approved maps to the **same** transition; the gate string is informational. |
| **Owner** | Approver (human operator). No tiered authority — any approver clears any gate. |
| **AI role** | **None.** Approval is exclusively human; the AI holds no approval authority. |
| **Artifacts** | Mission gate approvals (`strategy_and_budget`, `creative_assets`, `campaign_launch`); optional linked `Approval` record set to `approved`. Source: `domains/agency-os/src/mission/mission.ts`, `apps/web/src/routes.ts` (`gateApprove`). |
| **KPIs** | Process KPIs: `approval_latency` (`awaiting_approval` → `planning`); `approvals_per_mission` (three in the wired pipeline); `rejection_rate` (approvals that instead ended in `fail()`). |

**Value contribution — production time ↓.** A single, uniform approve action clears
each gate and immediately unblocks the next generator, so approved work flows straight
into the following stage without hand-offs or ceremony.

> **Discrepancy (documented honestly).** `approvalGates[]` on the Mission is
> **advisory metadata** — the pipeline requests and approves gates unconditionally
> regardless of the array, and there is **no** T0–T4 tiered authority. The reserved
> gates `major_budget_change` and `contract_or_spend` are never used. See §1.2.

---

## 8. Stage 7 — Draft (terminal by design)

**What it is.** Assembly of the **CampaignDraft** — channels, budget split, ad sets,
and schedule hints. **This is the end of the build.** The draft's `status` is the
single value `draft`; there is **no other state, no launch method, and no ad-platform
integration**. A draft is **never launched**.

| Aspect | Definition |
|---|---|
| **Entry** | `campaign_launch` approved → Mission `planning`; Phase 4 runs the campaign generator, consuming the accepted brief and creative set. |
| **Exit** | A `CampaignDraft` (`status = 'draft'`) is produced. This is **terminal for the build**: the artifact is not promoted to any "live" state. The Mission proceeds to Reporting (Phase 5) on hand-entered metrics — **not** by launching anything. |
| **Owner** | Campaign manager (human) owns the assembled draft; AI drafts. |
| **AI role** | **Draft assembler.** One local-AI call assembles channels, budget percentages, ad sets, and schedule hints from the upstream artifacts. It does **not** publish, launch, or optimize. |
| **Artifacts** | `CampaignDraft` (→ `missionId`, `briefId`, `creativeSetId`), `content{name,objective,channels[{channel,budgetPercentage,adSets[{name,audience,headline,primaryText,cta}]}],schedule{startHint,durationDays}}`, `totalBudget:Money`, `status: 'draft'`. Source: `domains/campaign-engine/src/draft/campaign-draft.ts`, `domains/campaign-engine/src/draft/service.ts`. |
| **KPIs** | Process KPIs: `draft_cycle_time` (`planning` → draft produced); `channel_count` and `adset_count` (assembled breadth); `budget_split_validity` (percentages sum correctly). The six advertising KPIs are **projected/target** here and **measured** only in Reporting. |

**Value contribution — production time ↓.** A ready-to-hand-off media plan — channels,
budget split, ad sets, schedule — is assembled in one pass from work already approved,
collapsing what is normally a separate planning cycle into a single artifact.

> **Terminal-by-design (documented honestly).** *"A draft is NEVER launched here."*
> AdOS produces **drafts only**; there is no Meta/Google/TikTok/LinkedIn Ads client
> anywhere in the code. **Live launch, live ad delivery, and live optimization are
> Roadmap only.** See ../ROADMAP.md and ../KNOWN_LIMITATIONS.md.

---

## 9. Stage 8 — Reporting

**What it is.** Two artifacts, in order. First the **CampaignReport**: campaign
metrics are **hand-entered via a form** (not ingested), then `computeKpis()`
**deterministically** produces the six advertising KPIs; only the narrative is
AI-written. Then the **ExecutiveReport**: a final AI synthesis with a
`verdict`. Between them, Phase 6 (learn) writes the Decision Journal, Executive Memory,
and Company Brain, then calls `startExecuting()` + `complete()`.

| Aspect | Definition |
|---|---|
| **Entry** | CampaignDraft exists; operator opens the analytics form (Phase 5 — **no gate**) and enters `impressions`, `clicks`, `conversions`, `leads`, `spend`, `revenue`. |
| **Exit** | `CampaignReport` computed; Phase 6 learning writes memory and drives `startExecuting()` → `executing`; Phase 10 produces the `ExecutiveReport`; `complete()` → Mission `completed`. |
| **Owner** | Analyst (human) enters metrics; AI writes narrative and executive synthesis; CEO/executive reads the verdict. |
| **AI role** | **Narrator + synthesizer (deterministic KPIs are not AI).** KPIs are pure math. AI writes the report `narrative{summary,highlights[],recommendations[]}` and the whole `ExecutiveReport` synthesis. |
| **Artifacts** | `CampaignReport` (→ `missionId`, `campaignDraftId`): input `CampaignMetrics{impressions,clicks,conversions,leads,spend:Money,revenue:Money}`; deterministic `computeKpis()`; AI `narrative`. Then `ExecutiveReport` (→ `missionId`, `reportId`): `content{headline,executiveSummary,verdict,keyResults[{metric,value,unit,verdict}],decisions[],nextActions[]}`, `verdict` ∈ `exceeded`\|`on_track`\|`at_risk`. Sources: `domains/analytics-engine/src/report/campaign-report.ts`, `domains/analytics-engine/src/report/kpi.ts`, `domains/executive-ai/src/dashboard/executive-report.ts`. |
| **KPIs** | The **six deterministic advertising KPIs** — measured here for the first time: `CTR` = clicks/impr × 100 (%); `CPC` = spend/clicks; `CPA` = spend/conv; `CPL` = spend/leads; `ROAS` = revenue/spend (x); `ROI` = (revenue − spend)/spend × 100 (%). Plus the executive `verdict` (`exceeded`/`on_track`/`at_risk`). |

**Value contribution — revenue ↑.** Deterministic `ROAS`/`ROI` plus a plain-English
executive verdict give the agency a defensible, repeatable performance story to bring
back to the client — the evidence that wins renewal and upsell conversations.

> **Discrepancy (documented honestly).** Metrics are **hand-entered via a form**, not
> ingested from any ad platform or connector — `connector-hub` is an unwired stub.
> Automated metric ingestion is **Roadmap**. KPIs themselves are exact and pure.

---

## 10. Stage 9 — Archive

**What it is.** Closing out a completed Mission's project and preserving a
client-facing snapshot. Two real code moves: the **Project** is moved to `archived`,
and a **PerformanceReport** snapshot is saved.

| Aspect | Definition |
|---|---|
| **Entry** | Mission `completed` (Reporting finished; `ExecutiveReport` exists). |
| **Exit** | Project `archive()` → `archived`; a `PerformanceReport` snapshot is saved. Company Brain / Executive Memory retain the learned performance for future missions. |
| **Owner** | Account manager (human) archives; AI has no role in archival. |
| **AI role** | **None.** Archival is a human/administrative act. Learning was already captured in Phase 6. |
| **Artifacts** | Project status `archived` (reachable **only** via `archive()`, not `changeStatus()`); `PerformanceReport` (→ `clientId`, `projectId?`): `title`, `period` (default 'All time'), `metrics[{label,value}]`, `summary` — assembled by the caller, immutable. Sources: `domains/agency-os/src/project/project.ts`, `domains/agency-os/src/report/report.ts`. |
| **KPIs** | Process KPIs: `time_to_archive` (`completed` → archived); `snapshot_completeness` (metrics captured in the `PerformanceReport`). The six advertising KPIs are carried **as recorded values** in the snapshot, not recomputed. |

**Value contribution — revenue ↑ and production time ↓.** A saved snapshot plus
retained Company Brain memory turns a finished campaign into reusable evidence and
priors — future briefs start smarter (time ↓) and better-targeted (revenue ↑).

---

## 11. KPI reference

### 11.1 The six deterministic advertising KPIs (measured at Reporting)

| KPI | Formula | Unit | Source |
|---|---|---|---|
| `CTR` | clicks / impressions × 100 | % | `domains/analytics-engine/src/report/kpi.ts` |
| `CPC` | spend / clicks | currency | `domains/analytics-engine/src/report/kpi.ts` |
| `CPA` | spend / conversions | currency | `domains/analytics-engine/src/report/kpi.ts` |
| `CPL` | spend / leads | currency | `domains/analytics-engine/src/report/kpi.ts` |
| `ROAS` | revenue / spend | x (ratio) | `domains/analytics-engine/src/report/kpi.ts` |
| `ROI` | (revenue − spend) / spend × 100 | % | `domains/analytics-engine/src/report/kpi.ts` |

Inputs (`impressions`, `clicks`, `conversions`, `leads`, `spend`, `revenue`) are
**hand-entered via a form**. The math is **deterministic and pure** — no AI is
involved in the numbers.

### 11.2 Process KPIs (earlier stages) and the value rule

Stages before Reporting have no advertising outcome to measure, so they use **process
KPIs** tied directly to the **AdOS v2 value rule** — every capability must **increase
revenue** or **reduce production time**.

| Stage | Process KPIs | Value axis |
|---|---|---|
| Idea | `intake_cycle_time`, `brief_completeness` | production time ↓ |
| Brief | `brief_cycle_time`, `brief_revisions`, target coverage | production time ↓ |
| Research | `research_depth`, `insight_reuse` | revenue ↑ |
| Creative | `creative_cycle_time`, `creative_revisions`, `output_completeness` | production time ↓ |
| Review | `review_turnaround`, `revision_rate`, `first_pass_yield` | revenue ↑ (risk ↓) |
| Approval | `approval_latency`, `approvals_per_mission`, `rejection_rate` | production time ↓ |
| Draft | `draft_cycle_time`, `channel_count`, `adset_count`, `budget_split_validity` | production time ↓ |
| Reporting | the six advertising KPIs + `verdict` | revenue ↑ |
| Archive | `time_to_archive`, `snapshot_completeness` | revenue ↑ / time ↓ |

**Cycle time** and **revisions** are the two universal cross-stage process meters:
lower cycle time reduces production cost; higher first-pass yield (fewer revisions)
frees creative capacity for more billable work.

---

## 12. Implemented vs Roadmap

### 12.1 Implemented (shipped, wired, tested)

- Mission intake via the five-step Wizard; single NL `brief`; state machine
  `submitted → planning ⇄ awaiting_approval → executing → completed` / `failed`.
- MarketingBrief generation (strategy only) behind `strategy_and_budget`.
- CreativeSet generation (six copy outputs, copy only) behind `creative_assets`.
- Human Review via Mission gates and the append-only `Approval` timeline.
- Uniform gate Approval via `mission.approve(gate)`.
- CampaignDraft assembly — `status: 'draft'`, **terminal by design**.
- CampaignReport with the six **deterministic** KPIs from **hand-entered** metrics;
  AI narrative.
- ExecutiveReport synthesis with `verdict` ∈ `exceeded`/`on_track`/`at_risk`.
- Archive: Project `archived` + saved `PerformanceReport` snapshot; in-memory Company
  Brain / Executive Memory retention.

### 12.2 Roadmap (NOT shipped — labelled everywhere above)

- **Live ad launch, delivery, and optimization** (drafts only; no ad-platform client).
- **Automated metric ingestion / external connectors** (metrics are hand-entered;
  `connector-hub` is an unwired stub).
- **Banned-word enforcement** against generated copy (`bannedWords[]` stored, not
  enforced).
- **Tiered T0–T4 approval authority** and the reserved gates `major_budget_change` /
  `contract_or_spend`; the dormant Mission `paused` state.
- **Document knowledge base / cited answers / autonomous "Digital Employees."**
- **Durable learning store** (LanceDB/FAISS + Postgres + graph); learning is in-memory.
- **Immutable / tamper-evident audit trail** (the Approval timeline is real but
  in-memory, not tamper-evident); DB-level RLS; cloud/hosted inference;
  vision/speech/image AI.

See ../ROADMAP.md and ../KNOWN_LIMITATIONS.md for the full Roadmap register.

---

## 13. Cross-stage business rules

These invariants hold across the whole lifecycle and bind every stage table above.

| # | Rule | Basis |
|---|---|---|
| R1 | **Drafts only — nothing launches.** A `CampaignDraft` has exactly one status, `draft`; there is no launch method and no ad-platform integration. | `domains/campaign-engine/src/draft/campaign-draft.ts` |
| R2 | **Every generated artifact is human-gated.** Brief, Creative, and Campaign each fire `requestApproval(gate)` and require a human `approve(gate)` before the next generator runs. | `apps/web/src/routes.ts`, `domains/agency-os/src/mission/mission.ts` |
| R3 | **Approval never jumps forward.** `approve(gate)` returns the Mission to `planning`; only the next phase's generator advances the work. | `domains/agency-os/src/mission/mission.ts` |
| R4 | **Gates are advisory, not tiered.** `approvalGates[]` is metadata; every gate maps to the same `approve()` transition; no T0–T4 authority. | §1.2 |
| R5 | **KPIs are deterministic; inputs are hand-entered.** `computeKpis()` is pure math over form-entered `CampaignMetrics`; AI writes only narrative. | `domains/analytics-engine/src/report/kpi.ts` |
| R6 | **AI drafts, humans decide.** No autonomous agent approves, launches, or optimizes; the default AI is the deterministic `OfflineAIManager`. | ../PRODUCT_TRUTH.md |
| R7 | **Copy only at Creative.** The `CreativeSet` is six text outputs; no images, no campaign or ad-platform contact. | `domains/creative-studio/src/creative/creative-set.ts` |
| R8 | **Strategy only at Brief.** The `MarketingBrief` is planning content; it never produces ads, images, or live campaigns. | `domains/marketing-intelligence/src/brief/marketing-brief.ts` |
| R9 | **Archive is reached deliberately.** Project `archived` is reachable only via `archive()`, never `changeStatus()`; the `PerformanceReport` snapshot is immutable. | `domains/agency-os/src/project/project.ts`, `domains/agency-os/src/report/report.ts` |
| R10 | **Every stage serves the value rule.** Each stage must increase revenue or reduce production time; see the per-stage Value contribution notes and §11.2. | BOOK_A_AGENCY_CONSTITUTION.md |

### 13.1 Lifecycle-level value summary

| Value axis | Where the lifecycle delivers it |
|---|---|
| **Production time ↓** | Wizard intake, one-pass brief, one-pass copy kit, one-pass media-plan draft, uniform approvals — each collapses a normally multi-day agency step into a single generated artifact. |
| **Revenue ↑** | Company-Brain-grounded research, mandatory human review (reputation/retention protection), and deterministic `ROAS`/`ROI` reporting with an executive verdict — the evidence that wins renewals and upsell. |

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
