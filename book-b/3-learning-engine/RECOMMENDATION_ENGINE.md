# Recommendation Engine — From Learnings to the Next Action

**Owner:** Office of the Chief AI Architect
**Source of truth:** ../../PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Status:** Official
**Governing reference:** ../1-ai-foundations/AI_CONSTITUTION.md

> **Implementation status:** the recommendation **engine** is ❌ ROADMAP (no engine
> exists); "recommendations" ship today only as ⚠️ **output array fields** produced by a
> single AI call (or the offline stub's `if/else`); the closest reusable primitives —
> evidence/confidence reasoning and reward-based `suggest()` — are 🔶 BUILT (UNWIRED).

---

## 0. What this document covers

This document specifies the **Recommendation Engine**: the component that turns learning
signals — Winner, Loser, Pattern, and Trend detections plus corporate memory — into a
**ranked, evidence-backed list of next actions** ("scale channel X", "pause ad set Y",
"generate a variant of the winning hook", "re-brief around audience Z"), and hands the
top action forward as a candidate **next Mission**.

It sits at the **end of the learning loop** and at the **start of the next production
cycle**. Its inputs are the outputs of the sibling detectors; its output is an actionable
instruction the agency can approve and run. It is the component that makes the promise
"AdOS improves each campaign by learning from the last" concrete — by naming *what to do
next* rather than only *what happened*.

**Scope boundary.** This engine decides **what to do next**. It does not detect winners
(see `WINNER_DETECTION.md`), losers (`LOSER_DETECTION.md`), or trends
(`TREND_ANALYSIS.md`); it *consumes* those. It does not itself rewrite a brief — it may
*recommend* a brief improvement, which `BRIEF_IMPROVEMENT.md` then performs.

---

## 1. Target design

### 1.0 Design principles

Four principles constrain the engine and separate it from a prompt that merely asks a
model "what should we do next?":

1. **Every recommendation is grounded.** No action is "the LLM said so." Each carries
   `EvidenceRef[]` drawn from the Company Brain — marketing insight, proven patterns,
   similar past experiences — exactly as the Evidence Engine already produces them. An
   action with no evidence is rendered at low confidence, never hidden.
2. **The core is deterministic.** Candidate generation (§1.3) and ranking (§1.4) are pure
   functions of the inputs, so the same signals always yield the same ranked set. Only an
   optional prose `rationale` may be model-written. This is what makes the engine testable
   and its decisions auditable offline.
3. **It proposes; humans dispose.** The engine's output is a proposal set. Every action it
   spawns still passes the Book A approval gates. It has no authority to launch, spend, or
   pause anything itself.
4. **It serves the value rule.** A recommendation that neither raises revenue nor cuts
   production time does not belong in the set; ranking weights both explicitly (§1.4).

### 1.1 Position in the AI-agent pipeline

The AI Constitution frames AdOS as an agent pipeline rather than a single
`Prompt → LLM → Output` call. The Recommendation Engine is the pipeline's **decision
stage** — the bridge from *Learning* back to *Planning*:

```
Winner/Loser/Trend signals  ┐
Pattern Library (proven)     ├─▶  Recommendation Engine  ─▶  ranked NextAction[]  ─▶  next Mission
Company Brain / Memory       ┘        (evidence + confidence + rank)                  (human-approved)
```

It is **not** a generator of prose. It is a *selector and ranker* of concrete moves,
each carrying the evidence that justifies it and a confidence score, so a human approver
sees *why* an action is recommended, not just *that* it is.

### 1.2 The `Recommendation` record (target shape)

| Field | Type | Meaning |
|---|---|---|
| `id` | id | Stable identity, addressable by the next Mission |
| `kind` | enum | `scale` \| `pause` \| `reallocate` \| `generate_variant` \| `rebrief` \| `hold` |
| `title` | string | Human-readable instruction ("Generate a variant of the winning hook") |
| `target` | ref | What it acts on (channel, ad set, hook, headline, brand, mission) |
| `rationale` | string | Grounded reason ("hook A drove ROAS 5.8 over 42 campaigns") |
| `evidence` | `EvidenceRef[]` | Cited marketing insight / proven patterns / similar experiences |
| `confidence` | 0–100 | Score + human-readable basis |
| `rank` | number | Priority within the recommendation set |
| `sourceSignals` | ref[] | The Winner/Loser/Trend detections that produced it |
| `proposedMission` | draft | Optional pre-filled Mission the agency can approve to execute |

### 1.3 Signal → recommendation mapping (target)

The engine is defined by a small, auditable rule surface over detector outputs. Each row
is a **motivated** move, not a free-text suggestion:

| Input signal (from sibling detector) | Recommended `kind` | Example `title` |
|---|---|---|
| **Winner** — a hook/headline/channel beats the field | `generate_variant` | "Produce 3 variants of the winning hook for the next flight" |
| **Winner** — a channel returns ROAS ≥ target | `scale` | "Scale the winning channel budget by 20%" |
| **Loser** — an ad set underperforms | `pause` / `reallocate` | "Pause the weakest ad set; move its budget to the winner" |
| **Trend** — CTR decays over N flights (creative fatigue) | `generate_variant` | "Refresh creative; the current set is fatiguing" |
| **Trend** — a segment rises across missions | `rebrief` | "Re-brief around the rising audience segment" |
| **Verdict `at_risk`** (ROAS < 1) | `rebrief` / `hold` | "Rework the offer before scaling; hold spend" |
| **Verdict `exceeded`** (ROAS ≥ 2) | `scale` + `generate_variant` | "Scale the winner and test a variant against it" |

`kind`, `target`, and the three verdicts `exceeded | on_track | at_risk` reuse Book A
vocabulary exactly; the six copy fields a `generate_variant` recommendation targets are
the CreativeSet fields (headline / adCopy / CTA / socialPost / landingPage / email).

### 1.4 Ranking

Recommendations are ranked, not dumped. The target ranking is a blend of:

1. **Confidence** — evidence strength × breadth of sources × prior success rate.
2. **Expected value-rule impact** — revenue ↑ (scale a proven winner) or production-time
   ↓ (generate a variant instead of re-briefing from scratch) weighted higher.
3. **Reversibility** — low-risk, reversible moves (test a variant) rank above
   irreversible ones (kill a channel) at equal confidence.

The top-ranked recommendation becomes the **proposed next Mission**; the rest are shown
as alternatives. Nothing executes without the standard human approval click.

### 1.5 Target port sketch

The engine is a single port with a pure core and two injected 🔶 collaborators. It reads
signals + memory and returns a ranked set; it never writes or launches anything itself.

| Member | Signature (shape) | Role |
|---|---|---|
| `recommend` | `(input: { signals, verdict, vertical, context }) → Recommendation[]` | Generate → ground → rank |
| *(injected)* `evidence` | `EvidenceEnginePort` | `gather()` per candidate (🔶 `reasoning.ts:14-56`) |
| *(injected)* `confidence` | `ConfidenceEnginePort` | `assess()` per candidate (🔶 `reasoning.ts:62-99`) |
| *(injected)* `learning?` | `LearningEnginePort` | `suggest()` to bias ranking by prior reward (🔶 `learning.ts:38-46`) |

The `EvidenceEnginePort` and `ConfidenceEnginePort` contracts already exist in
`@ados/contracts` and are implemented by the unwired engines in `executive-memory` — so
the target port composes coded, tested pieces behind one new deterministic ranker.

### 1.6 Worked example (target behaviour)

A mission for a fitness brand returns `at_risk` at `0.8x` ROAS, but Winner Detection flags
that **hook A** out-clicked the set 3:1 on the one channel that broke even. The engine
would emit, ranked:

| Rank | `kind` | `title` | `evidence` (grounded) | `confidence` |
|---|---|---|---|---|
| 1 | `generate_variant` | "Produce 3 variants of hook A for the next flight" | pattern: hook A, CTR 4.2 over 42 campaigns | 88 |
| 2 | `reallocate` | "Move budget from the two losing ad sets to the break-even channel" | experience: similar reallocation recovered ROAS | 71 |
| 3 | `rebrief` | "Rework the offer; ROAS is below break-even" | marketing brain: vertical ROAS 1.4 baseline | 63 |

Rank 1 carries a `proposedMission` pre-filled from hook A's copy fields; approving it
spawns a variant Mission linked to this one. The template output that ships today (§2.2)
would instead have printed three fixed strings with **no evidence, no ranking, and no way
to act on them** — the difference this engine makes.

---

## 2. Today

### 2.1 There is no recommendation engine — ❌ ROADMAP

No component in the codebase ranks signals into actions, ties a verdict to a next
Mission, or carries a `Recommendation` record. There is no detector feeding it (Winner,
Loser, and Trend detection are themselves ❌ ROADMAP — see the sibling docs). The engine
described in §1 does not exist.

What *does* exist is the **word** "recommendations" in two places, both of which are
**output fields of a single AI call**, not an engine.

### 2.2 "Recommendations" as report output fields — ⚠️ PARTIAL

The campaign report asks the AI Manager for a narrative that *includes* a
`recommendations` array, enforced only as a **schema hint in the prompt text**, not as a
ranked, evidence-backed decision:

- `domains/analytics-engine/src/report/service.ts:42-56` submits a single `reasoning`
  task with `promptRef { key: 'analytics.report', version: 1 }`; the requested shape
  `{ summary, highlights, recommendations }` is declared in `NARRATIVE_SCHEMA`
  (`service.ts:11-19`).
- The returned `recommendations` are validated only for **presence and array-ness**
  (`service.ts:104-109`) — never for correctness, ranking, or evidence.

When the **default offline deterministic AI** is in use (`apps/web/src/ai.ts:13`), those
"recommendations" are not model reasoning at all — they are a fixed `if/else` on ROAS:

```
recommendations:
  roas >= 1
    ? ['Scale the best-performing channel by 20%', 'Reallocate budget away from the
       weakest ad set', 'Test new creative variants against the current winner']
    : ['Pause the weakest channel', 'Tighten targeting to the highest-intent audience',
       'Revise the offer and creative before scaling']
```
— `apps/web/src/ai.ts:160-164`.

The executive dashboard repeats the pattern: its `nextActions` are simply the report's
recommendations passed through (`ai.ts:179`, `ai.ts:196`), with a canned fallback. So the
strings *look like* the §1.3 mapping, but they are **template output, not a decision made
by an engine over real signals**.

### 2.3 The "recommendation made" event is a label, not an engine — ⚠️

The domain publishes `ANALYTICS_RECOMMENDATION_MADE_V1`
(`domains/analytics-engine/src/events.ts:13`). This is an **event-name constant**. It
marks that a report (containing a `recommendations` field) was produced; it does **not**
imply any engine ranked or grounded anything. Treat the event as a *label on the report*,
never as evidence that a recommendation engine ran.

### 2.4 The closest reusable primitives — 🔶 BUILT (UNWIRED)

Two pieces of the target engine already exist in the repository, unit-tested, but are
**not on any live app path**. They are the natural spine of the engine to build:

| Primitive | What it does | Path | Wired? |
|---|---|---|---|
| **Evidence Engine** | Grounds a claim in the Company Brain — marketing insight, proven patterns, similar past experiences, each with a weight | `domains/executive-memory/src/reasoning.ts:14-56` | 🔶 no |
| **Confidence Engine** | Turns evidence into a 0–100 score + human-readable basis ("94% — based on 382 campaigns, ROAS 5.8") | `domains/executive-memory/src/reasoning.ts:62-99` | 🔶 no |
| **Learning `suggest()`** | Returns the best-performing model/prompt for a key from accumulated EMA reward | `packages/ai-manager/src/runtime/learning.ts:38-46` | 🔶 no |

`BrainEvidenceEngine.gather()` already produces exactly the `evidence` array the
`Recommendation` record needs (§1.2), and `HeuristicConfidenceEngine.assess()` already
produces the `confidence` score + basis. **What is missing is the engine that turns
detector signals into candidate actions and calls these two to rank and justify them** —
plus wiring any of it into the live app. `apps/web` never instantiates
`reasoning.ts` or `learning.ts`.

### 2.5 Today at a glance

| Concept | Tier | Evidence |
|---|---|---|
| Recommendation **engine** (rank signals → actions) | ❌ ROADMAP | no code |
| `recommendations` array in report narrative | ⚠️ output field, schema-as-text only | `analytics-engine/src/report/service.ts:11-19,42-56` |
| Offline `recommendations` (`if/else` on ROAS) | ⚠️ deterministic template | `apps/web/src/ai.ts:160-164` |
| `nextActions` in executive dashboard | ⚠️ pass-through of the above | `apps/web/src/ai.ts:179,196` |
| `ANALYTICS_RECOMMENDATION_MADE_V1` | label, not an engine | `analytics-engine/src/events.ts:13` |
| Evidence + Confidence reasoning | 🔶 BUILT (UNWIRED) | `executive-memory/src/reasoning.ts:14-99` |
| Reward-based `suggest()` | 🔶 BUILT (UNWIRED) | `ai-manager/src/runtime/learning.ts:38-46` |
| Winner / Loser / Trend inputs | ❌ ROADMAP | see sibling docs |

---

## 3. To build

The engine closes a gap Book A's walkthrough made explicit. In Scenario 3 the mission
returns `at_risk`, the `ExecutiveReport` renders a verdict and `nextActions[]` — **and
nothing consumes them**: "`at_risk` is a dead end… there is no mechanism to turn a
recommended next action into a new mission" (Book A walkthrough, Gap 4). Backlog item
**B-7** ("Verdict → `nextActions` → new variant/optimization mission") is the closed loop
this engine delivers. See ../../book-a/BOOK_A_WALKTHROUGH.md.

### 3.1 Build order

1. **Consume detector outputs (❌ → depends on siblings).** Define the `Signal` contract
   the engine reads from Winner/Loser/Trend detection, plus the Pattern Library
   (`pattern-library.ts`) and Company Brain. Until the detectors exist, the engine can be
   built against the verdict alone (`exceeded | on_track | at_risk`), which already ships.

2. **Candidate generation (❌).** Implement the §1.3 mapping: each incoming signal (or the
   verdict) expands into one or more candidate `Recommendation` records with a `kind`,
   `target`, and `sourceSignals`. This is the deterministic, auditable rule surface —
   pure functions, unit-testable, no LLM required.

3. **Grounding & ranking (🔶 wire the existing primitives).** For each candidate, call
   `BrainEvidenceEngine.gather()` to attach `evidence` and
   `HeuristicConfidenceEngine.assess()` to attach `confidence`
   (`executive-memory/src/reasoning.ts:14-99`). Rank per §1.4. This reuses coded,
   tested logic — the work is instantiation and wiring, not new reasoning code.

4. **`generate_variant` handoff (❌).** For a `generate_variant` recommendation, pre-fill
   a CreativeSet-shaped brief that references the winning field(s), so approving the
   recommendation feeds `BRIEF_IMPROVEMENT.md` / the creative stage directly. This is
   where "generate a variant of X" becomes a real production instruction.

5. **Verdict → Mission (❌, closes B-7).** Attach a `proposedMission` draft to the
   top-ranked recommendation and surface an approval action on the executive dashboard.
   Approving it spawns a **variant/optimization Mission** linked to the mission it
   improves — the loop Book A's Gap 3 and Gap 4 call for.

6. **Feed the learning signal (🔶).** When a recommendation's resulting mission completes,
   emit its outcome as a reward so `InMemoryLearningEngine.observe()`
   (`learning.ts:18-36`) updates the EMA and `suggest()` (`learning.ts:38-46`) begins to
   favour recommendation shapes that historically paid off. This makes the engine itself
   improve — the recommendation policy learns which recommendations work.

### 3.2 What each stage costs and returns

| Stage | Tier | New code vs wiring | Value-rule tie |
|---|---|---|---|
| Signal contract | ❌ | new (small) | enables the rest |
| Candidate generation (§1.3 rules) | ❌ | new (deterministic) | Time ↓ (auto next-step) |
| Evidence + confidence grounding | 🔶 | wire `reasoning.ts` | trust → adoption |
| Ranking (§1.4) | ❌ | new (small) | Revenue ↑ (best move first) |
| `generate_variant` handoff | ❌ | new | Time ↓ (no blank-page rebrief) |
| Verdict → Mission (B-7) | ❌ | new | Revenue ↑ + Time ↓ (closed loop) |
| Recommendation reward → learning | 🔶 | wire `learning.ts` | Revenue ↑ (policy compounds) |

### 3.3 Interaction with the sibling learning components

The Recommendation Engine is the **consumer of record** for the rest of Part 3. It does
not duplicate their work; it composes it:

| Sibling | Provides | Recommendation Engine uses it to… |
|---|---|---|
| `WINNER_DETECTION.md` | winning hook / headline / channel signals | emit `scale` and `generate_variant` |
| `LOSER_DETECTION.md` | under-performing ad-set / channel signals | emit `pause` and `reallocate` |
| `TREND_ANALYSIS.md` | fatigue / rising-segment trends across missions | emit `generate_variant` and `rebrief` |
| `BRIEF_IMPROVEMENT.md` | the mechanism that rewrites a brief | receive a `rebrief` / `generate_variant` handoff and execute it |

Because all four siblings are ❌ ROADMAP today, the engine is best built **verdict-first**
(step 1 of §3.1) so it delivers the B-7 closed loop from the shipped
`exceeded | on_track | at_risk` verdict alone, then gains richer inputs as each detector
lands. This keeps the build incremental and each increment independently valuable.

### 3.4 Guardrails

- **Human approval is preserved.** A recommendation is a *proposal*; the standard
  approval gates (`strategy_and_budget` / `creative_assets` / `campaign_launch`) still
  govern anything it spawns. The engine never launches, and — consistent with
  PRODUCT_TRUTH.md — AdOS still never launches live ads; a `scale`/`pause` recommendation
  is an instruction to the human, not an ad-platform action.
- **No claim without evidence.** Per the AI Constitution, a recommendation with empty
  `evidence` must render its low-confidence basis honestly (the Confidence Engine already
  returns score `15`, "No supporting evidence found" for that case —
  `reasoning.ts:69-74`), never as a confident directive.
- **Deterministic core.** Candidate generation and ranking are pure functions; only the
  optional prose rationale may come from a model. This keeps the engine testable and its
  decisions auditable, matching the offline-first posture.
- **Idempotent proposals.** Re-running the engine on the same signals yields the same
  ranked set and the same `proposedMission` draft; approving a recommendation is what
  creates state, so the engine can be re-invoked safely without spawning duplicate
  missions.
- **Graceful degradation.** With no detector signals available (the verdict-first phase),
  the engine still produces a small, correctly-grounded set from the verdict and the
  Company Brain baseline — never an empty result presented as "nothing to do."

### 3.5 Definition of done

The engine is complete for a given phase when: (a) candidate generation covers every row
of the §1.3 mapping reachable from that phase's inputs; (b) each emitted `Recommendation`
carries non-empty `evidence` or an explicit low-confidence basis; (c) the top-ranked
recommendation renders an approvable `proposedMission` on the executive dashboard; and
(d) an approved recommendation's outcome is emitted as a learning reward. Item (c) alone
closes Book A gap B-7 and is the minimum shippable increment.

---

## 4. Value contribution

**Revenue ↑ and production-time ↓ — by turning insight into the next action
automatically.**

- **Revenue ↑.** Today a report ends with three template sentences no system acts on; an
  `at_risk` mission is a dead end. The engine converts a verdict into the *right* next
  move — scale the proven winner, kill the proven loser, refresh fatiguing creative —
  ranked by grounded confidence. Acting on the best move first, every cycle, is the
  mechanism behind "improves each campaign by learning from the last."
- **Production-time ↓.** A `generate_variant` recommendation pre-fills the next brief
  from the winning asset, so the team starts the next flight from a proven baseline
  instead of a blank page; approving a `proposedMission` spawns the corrective campaign in
  one click instead of a manual re-scoping session.
- **Compounding.** Feeding recommendation outcomes back into the learning reward
  (§3.1 step 6) makes the recommendation policy itself improve — the agency's next-action
  instinct gets sharper the longer AdOS runs.

**Why the template output today does not deliver this value.** The shipped
`recommendations` strings (§2.2) are the same three sentences for every winning campaign
and the same three for every losing one; they carry no target, no evidence, and no
consumer. They *describe* generic best practice; they do not *decide* this agency's next
move from this campaign's signals, and nothing downstream reads them. The value above is
unlocked only when a real engine ranks grounded actions and hands the top one forward as
an approvable Mission — which is precisely the B-7 gap this document specifies.

---

## 5. Cross-references

- **Governing reference:** ../1-ai-foundations/AI_CONSTITUTION.md
- **Source of truth:** ../../PRODUCT_TRUTH.md · **Roadmap:** ../../ROADMAP.md ·
  **Known limits:** ../../KNOWN_LIMITATIONS.md
- **Book A:** ../../book-a/BOOK_A_WALKTHROUGH.md (Scenario 3 gaps; backlog B-7)
- **Siblings (same part):** WINNER_DETECTION.md · LOSER_DETECTION.md · TREND_ANALYSIS.md ·
  BRIEF_IMPROVEMENT.md

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
