# Brief Analysis — Reading the Brief Before the Factory Runs

**Owner:** Office of the Chief AI Architect
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [../../PRODUCT_TRUTH.md](../../PRODUCT_TRUTH.md)
**Governing reference:** [../1-ai-foundations/AI_CONSTITUTION.md](../1-ai-foundations/AI_CONSTITUTION.md)

> **Implementation status:** ❌ **ROADMAP.** Single-shot brief **generation** is
> ✅ shipped (`domains/marketing-intelligence/src/brief/service.ts:43-96`), but a
> **brief analyzer** — a stage that reads a brief, scores its clarity, and reports
> its gaps *before* anything is generated — **does not exist in the codebase
> today.** This document is a clean design specification, not a description of live
> behavior.

---

## 0. Where this document sits

This is the **first stage** of **Part 2 — the Creative Factory**. Everything in
Part 2 rests on one observation about the live system:

> **Today the entire creative act is a single shot.** One `creative.set` task
> emits every copy field at once (`domains/creative-studio/src/creative/service.ts:38-89`),
> and one `marketing.brief` task emits the whole strategy document at once
> (`domains/marketing-intelligence/src/brief/service.ts:43-96`). There is no stage
> that *inspects* its own input before spending a generation cycle.

The Creative Factory is the design that **decomposes that single shot into
specialized stages** — analyze → plan → generate → check → revise — each of which
does one job well and hands a richer object to the next. **Brief Analysis is
stage zero:** before the factory generates anything, it reads the incoming brief,
decides whether the brief is *good enough to build on*, and hands a structured,
gap-annotated object to the [Context Engine](../1-ai-foundations/CONTEXT_ENGINE.md)
that assembles the generation prompt.

A weak brief that slips through un-inspected costs a full generation cycle —
possibly the full brief → creative → campaign → report chain — before a human
notices the objective was vague or the audience was missing. Brief Analysis is the
cheap gate that catches that at the front door.

This document is **design-and-specification only**. Nothing here claims a shipped
capability. The one thing that *is* shipped — single-shot brief generation — is
described precisely and separated from the target design.

---

## 1. Vocabulary — analysis vs. generation

Two words that sound alike do opposite things. Book B keeps them strictly apart.

| Term | Direction | Status | What it means |
|---|---|---|---|
| Brief **generation** | Mission context → brief | ✅ SHIPPED | The AI *writes* a `MarketingBrief` from mission fields. Exists today. |
| Brief **analysis** | Brief → assessment | ❌ ROADMAP | The AI *reads* a brief and reports clarity, gaps, feasibility. Does not exist. |
| Brief **improvement** | Assessment → better brief | ❌ ROADMAP | A re-analysis loop that repairs a weak brief. Does not exist. |

The live system does the **first row only**. It *produces* briefs; it never
*evaluates* them. This document specifies the **second row** and gestures at the
third; brief improvement gets its own future document.

> Note on the source object: the shipped pipeline generates the brief *from* the
> mission's `missionBrief` free-text field (`marketing-brief.ts:28`) plus brand and
> product context. In the target design, the incoming object the analyzer reads
> is either that raw mission context **or** the generated `MarketingBrief` itself —
> the analyzer sits at the boundary and can grade both. §4 specifies both intake
> modes.

---

## 2. Target design — what Brief Analysis extracts

Brief Analysis is a **read-only reasoning stage**. It never rewrites the brief and
never generates a campaign asset. Its single output is a structured
**`BriefAssessment`** object that answers one question: *is this brief strong enough
to generate against, and if not, what is missing?*

The assessment is built from five extraction axes.

### 2.1 The five extraction axes

| # | Axis | Question it answers | Signal produced |
|---|---|---|---|
| 1 | **Objective clarity** | Is there one measurable business objective, or a vague wish? | `objectiveClarity: 0..1` + rationale |
| 2 | **Audience definition** | Is the target audience specific enough to write copy for? | `audienceSpecificity: 0..1` + extracted segments |
| 3 | **Constraints** | What hard limits (budget, banned words, channels, timing) bound generation? | `constraints[]` (typed) |
| 4 | **Missing inputs** | Which fields required by downstream stages are absent or empty? | `gaps[]` (each blocking or advisory) |
| 5 | **Feasibility signals** | Do the objective, budget, and channels form a plausible plan? | `feasibility: green\|amber\|red` + reasons |

### 2.2 The `BriefAssessment` object (proposed shape)

The analyzer emits a plain DTO — it carries provenance exactly like every other AI
artifact in AdOS (`taskId`, `capability`, `model`, `engine`, `latencyMs` — the
same envelope shipped on the brief today, `marketing-brief.ts:55-61`).

```
BriefAssessment {
  missionId:          string
  briefId?:           string          // set when grading an existing MarketingBrief
  objectiveClarity:   number          // 0..1
  audienceSpecificity:number          // 0..1
  constraints:        Constraint[]    // { kind, value, source }
  gaps:               Gap[]           // { field, severity: 'blocking'|'advisory', hint }
  feasibility:        'green' | 'amber' | 'red'
  feasibilityReasons: string[]
  overallScore:       number          // 0..1 rollup
  recommendation:     'proceed' | 'proceed_with_notes' | 'return_to_human'
  provenance:         AIProvenance    // taskId, capability, model, engine, latencyMs
}
```

### 2.3 Field-level gap detection

The `gaps[]` array is the heart of the stage. Every field that a downstream Creative
Factory stage will *require* is checked for presence and substance. The check maps
directly onto the fields the shipped brief already carries
(`marketing-brief.ts:40-48`), so the analyzer knows exactly what "complete" looks
like:

| Brief field (shipped shape) | Consumed by | Gap if… | Default severity |
|---|---|---|---|
| `objective` | All stages | empty or non-measurable | `blocking` |
| `targetAudience` | Creative generation | missing or generic ("everyone") | `blocking` |
| `positioning` | Creative generation | absent | `advisory` |
| `keyMessages[]` | Creative generation | empty array | `blocking` |
| `recommendedChannels[]` | Campaign draft | empty array | `advisory` |
| `budgetAllocation[]` | Campaign draft | absent or sums ≠ 100% | `advisory` |
| `kpis[]` | Analytics report | empty array | `advisory` |

A **blocking** gap sets `recommendation: 'return_to_human'`; only advisory gaps
yield `proceed_with_notes`. A clean brief yields `proceed`.

### 2.4 How the assessment feeds the Context Engine

Brief Analysis is not a dead-end report. Its output is an **input to the
[Context Engine](../1-ai-foundations/CONTEXT_ENGINE.md)** — the 🔶 built-but-unwired
component that assembles everything the model sees before generation
(`domains/executive-memory/src/context-builder.ts:37-86`). The wiring the Creative
Factory specifies:

- On `proceed` / `proceed_with_notes`, the `BriefAssessment` — its extracted
  constraints, audience segments, and advisory notes — is handed to the Context
  Engine, which folds them into the generation prompt so the generator builds
  *with* the brief's constraints rather than rediscovering them.
- On `return_to_human`, the pipeline **halts before generation** and surfaces the
  `gaps[]` to a human via the existing approval surface — no generation cycle is
  spent.

This is the value hinge: analysis is cheap, generation is expensive, and the
assessment decides whether to spend the expensive step.

---

## 3. Today — what the code actually does

**Implementation status for this section: ✅ SHIPPED (generation) · ❌ ABSENT
(analysis).**

### 3.1 ✅ Single-shot brief GENERATION exists

The `MarketingBriefService.generate(...)` method
(`domains/marketing-intelligence/src/brief/service.ts:43-96`) is fully wired into
the live mission pipeline. It:

1. Flattens the mission context into prompt variables — `clientName`, `industry`,
   `brandVoice`, `brandValues`, `productName`, `productDescription`, `missionBrief`,
   `budget` (`service.ts:51-60`). This is **Mission Injection**, documented in
   [../1-ai-foundations/MISSION_INJECTION.md](../1-ai-foundations/MISSION_INJECTION.md).
2. Submits **one** `reasoning` task to the AI Manager with a `responseSchema`
   (`service.ts:47-62`). The schema is passed as prompt *text*, not enforced —
   see the Validation Pipeline note below.
3. Structurally validates the returned object with a hand-written type guard
   (`validateContent`, `service.ts:109-124`) — this checks that the seven required
   fields are the right JSON *types* (string / array). It is a **shape check, not a
   quality analysis**: it never scores clarity, never detects a vague objective,
   never flags a generic audience, never reports gaps.
4. Wraps the result as a `MarketingBrief` aggregate with full provenance
   (`service.ts:75-85`; `marketing-brief.ts:91-118`) and persists it.

The brief is **produced once and moves on.** That is the shipped reality, and the
Brief/Research stages of the campaign lifecycle describe it from the agency-process
side — see [../../book-a/CAMPAIGN_LIFECYCLE.md](../../book-a/CAMPAIGN_LIFECYCLE.md).

### 3.2 ❌ No analyzer exists

To be unambiguous about the boundary:

| Thing | Present in code? | Evidence |
|---|---|---|
| Brief *generation* service | ✅ Yes, wired | `brief/service.ts:43-96` |
| Structural type guard on output | ✅ Yes (shape only) | `brief/service.ts:109-124` |
| Brief *scoring* (clarity/specificity) | ❌ No | no scoring code anywhere |
| Gap / missing-input detection | ❌ No | validation is presence-of-type, not gap analysis |
| Feasibility signal | ❌ No | no such computation |
| `BriefAssessment` object | ❌ No | type does not exist |
| Brief *improvement* / re-analysis loop | ❌ No | no re-analysis path exists |
| Persona / opportunity extraction | ❌ No | only event-name seeds exist (`marketing-intelligence/src/events.ts:10-11`) — `INTEL_PERSONA_BUILT_V1`, `INTEL_OPPORTUNITY_DETECTED_V1` publish from nothing |

The `intel.persona.built.v1` and `intel.opportunity.detected.v1` event names in
`domains/marketing-intelligence/src/events.ts:10-11` are contract seeds with **no
publisher** — they are named, not built. They do not constitute a brief analyzer.

### 3.3 The gap this leaves (Book A cross-reference)

Because generation is single-shot and un-inspected, a weak brief propagates
silently: the generator will happily turn "grow the business" into a full creative
set. This is the same class of problem the Book A walkthrough raises — the pipeline
produces first drafts without a stage that reads its own inputs critically
([../../book-a/BOOK_A_WALKTHROUGH.md](../../book-a/BOOK_A_WALKTHROUGH.md)). Brief
Analysis is the front-door fix.

---

## 4. To build — the analysis stage as design

**Implementation status for this section: ❌ ROADMAP.** Everything below is a
specification for work not yet started. It introduces **no** new engine type
forbidden by the AI Constitution — Brief Analysis is a text-in / structured-JSON-out
`reasoning` task, the exact capability the shipped brief service already uses
(`service.ts:48`). No vision, no new runtime.

### 4.1 Intake modes

The analyzer sits at the mission→brief boundary and supports two intake modes:

| Mode | Input | When it runs | Purpose |
|---|---|---|---|
| **Pre-generation** | raw `MarketingContext` (`marketing-brief.ts:18-30`) | before `generate(...)` | Catch a thin mission before spending a generation cycle |
| **Post-generation** | the produced `MarketingBrief` | after `generate(...)`, before creative | Grade the strategy the model wrote before the factory builds on it |

Both modes emit the same `BriefAssessment` (§2.2). The Creative Factory's default
wiring runs **post-generation** first — it grades the brief the shipped service
already produces — because that path requires no change to the mission intake and
delivers the value fastest.

### 4.2 The analysis task

Brief Analysis is one AI Manager submission, shaped like the shipped brief call:

```
ai.submit<BriefAssessment>({
  capability:  'reasoning',              // same capability shipped today
  submittedBy: 'creative-factory.brief-analysis',
  promptRef:   { key: 'creative.brief-analysis', version: 1 },
  variables:   { ...briefFields, ...missionContext },
  responseSchema: BRIEF_ASSESSMENT_SCHEMA,
})
```

Design constraints, per the [AI Constitution](../1-ai-foundations/AI_CONSTITUTION.md):

- **Local-only.** The task runs on the same local engines as everything else —
  Ollama or an OpenAI-compatible local server — or against the deterministic
  `OfflineAIManager` default. No cloud, no API key, no per-token billing.
- **Deterministic fallback.** Under the offline default, the analyzer must return a
  deterministic assessment computed from **rule checks** (field presence, budget
  sum, audience-token count) rather than model prose — so the stage is useful even
  with no model server running. The scoring axes degrade to boolean/heuristic
  signals, never to a crash.
- **Provenance-carrying.** The `BriefAssessment` carries the standard
  `AIProvenance` envelope so an assessment is reproducible and auditable.
- **Read-only.** The analyzer never mutates the brief. Repair is a separate
  (roadmap) Brief Improvement stage.

### 4.3 Scoring model (rule + reasoning hybrid)

Each axis is computed twice and reconciled, so the stage never depends on a model
being present:

| Axis | Deterministic rule (offline default) | Model reasoning (live engine) |
|---|---|---|
| Objective clarity | contains a measurable verb + metric? | rates specificity 0..1 with rationale |
| Audience specificity | audience string token-count / segment markers | extracts named segments, rates 0..1 |
| Constraints | parse budget, channels, banned-word list from brand | infers implicit constraints |
| Gaps | required-field presence table (§2.3) | flags weak-but-present fields |
| Feasibility | budget > 0 ∧ channels ≥ 1 ∧ kpis ≥ 1 | narrative plausibility of objective vs. budget |

The rollup `overallScore` is a weighted mean of the five axes; the `recommendation`
is derived from gap severities (§2.3), not from the score alone — a single
`blocking` gap forces `return_to_human` regardless of score.

### 4.4 Pipeline placement and gating

```
Mission ──▶ [Brief Generation ✅] ──▶ [Brief Analysis ❌] ──▶ decision
                                                              │
                    proceed / proceed_with_notes ────────────┤──▶ Context Engine ──▶ Creative Factory
                                                              │
                    return_to_human ──────────────────────────▶ halt + surface gaps (approval surface)
```

- On `return_to_human`, the pipeline stops **before** the Creative Factory spends a
  cycle. Gaps surface through the existing human approval workflow
  (`domains/agency-os/src/approval/approval.ts`; `apps/web/src/routes.ts:478-481`) —
  the analyzer adds a reason, it does not add a new gate type. Book A's gates
  (`strategy_and_budget`, `creative_assets`, `campaign_launch`) are unchanged.
- On proceed, the assessment flows into the Context Engine (§2.4), which is itself
  🔶 built-but-unwired — so Brief Analysis and Context Engine wiring land together.

### 4.5 Build ledger

| Work item | Tier | Note |
|---|---|---|
| `BriefAssessment` DTO + schema | ❌ ROADMAP | new type; mirror `marketing-brief.ts` provenance |
| Deterministic rule analyzer (offline) | ❌ ROADMAP | field-presence + budget-sum + token heuristics |
| `reasoning` task + prompt (`creative.brief-analysis`) | ❌ ROADMAP | same submission shape as `service.ts:47-62` |
| Gap → recommendation mapping | ❌ ROADMAP | blocking forces `return_to_human` |
| Wire assessment into Context Engine | 🔶 depends | Context Engine itself is 🔶 (`context-builder.ts:37-86`) |
| Halt-before-generation on blocking gaps | ❌ ROADMAP | reuse existing approval surface, no new gate |

No item above is claimed as present. Every ✅ in this document is confined to §3.1.

### 4.6 Worked example (illustrative — not live output)

To make the stage concrete, consider two briefs the shipped generator could
produce today. The analyzer's job is to tell them apart *before* the factory runs.

**Brief A — thin.** Mission `missionBrief`: *"We want to grow."* The generated
brief comes back with `objective: "Increase growth"`, `targetAudience: "everyone"`,
empty `keyMessages[]`, `budgetAllocation[]` summing to 70%.

```
BriefAssessment(A) {
  objectiveClarity:   0.2      // no metric, no verb of consequence
  audienceSpecificity:0.1      // "everyone" is the anti-audience
  gaps: [
    { field:'objective',     severity:'blocking', hint:'add a measurable target' },
    { field:'targetAudience',severity:'blocking', hint:'name a segment' },
    { field:'keyMessages',   severity:'blocking', hint:'array is empty' },
    { field:'budgetAllocation',severity:'advisory',hint:'allocations sum to 70%' },
  ]
  feasibility:   'red'
  overallScore:  0.18
  recommendation:'return_to_human'   // halts before the factory spends a cycle
}
```

**Brief B — strong.** Objective *"Lift trial signups 20% in Q3 among SMB owners
in TR"*, a named audience, three key messages, channels and KPIs present.

```
BriefAssessment(B) {
  objectiveClarity:   0.9
  audienceSpecificity:0.85
  gaps: [ { field:'positioning', severity:'advisory', hint:'implicit only' } ]
  feasibility:   'green'
  overallScore:  0.88
  recommendation:'proceed_with_notes'  // one advisory note rides into the prompt
}
```

Brief A is stopped at the door; Brief B flows to the Context Engine carrying its one
advisory note. The expensive generation cycle is spent only on B. These objects are
**illustrations of the target design** — the analyzer that produces them is not
built.

---

## 5. Value contribution

**Production-time ↓ (primary).** Generation is the expensive step; brief inspection
is cheap. A single `reasoning` pass that flags a vague objective or a missing
audience **before** the factory runs avoids a wasted brief → creative → campaign →
report cycle — and the human rework that follows a bad first draft. Catching a weak
brief at stage zero is the difference between one cheap analysis call and a full
chain of discarded generations.

**Revenue ↑ (secondary).** Fewer discarded cycles per mission means each installed
agency runs **more missions in the same time** — throughput the local, no-per-token
model converts directly into agency capacity. A brief graded before build also
raises first-draft acceptance, shortening the path from objective to human-approved
campaign.

The stage serves the AdOS v2 value rule squarely: it reduces production time and
lifts throughput, and it does so with a capability class (`reasoning`, local-only)
that already ships — no new engine, no cloud dependency.

---

## 6. Cross-references

| Document | Relationship |
|---|---|
| [../../PRODUCT_TRUTH.md](../../PRODUCT_TRUTH.md) | Source of truth — brief generation is shipped; no analyzer exists |
| [../1-ai-foundations/AI_CONSTITUTION.md](../1-ai-foundations/AI_CONSTITUTION.md) | Governing reference — local-only, provenance, tiers |
| [../1-ai-foundations/CONTEXT_ENGINE.md](../1-ai-foundations/CONTEXT_ENGINE.md) | Consumes the `BriefAssessment` before prompt assembly |
| [../1-ai-foundations/MISSION_INJECTION.md](../1-ai-foundations/MISSION_INJECTION.md) | Shipped flattening of mission fields the analyzer reads |
| [../../book-a/CAMPAIGN_LIFECYCLE.md](../../book-a/CAMPAIGN_LIFECYCLE.md) | Brief / Research stages from the agency-process side |
| [../../book-a/BOOK_A_WALKTHROUGH.md](../../book-a/BOOK_A_WALKTHROUGH.md) | Motivating gap — un-inspected first drafts |

---

*Documentation only. No application code, packages, domains, or tests were
modified. Aligned to PRODUCT_TRUTH.md.*
