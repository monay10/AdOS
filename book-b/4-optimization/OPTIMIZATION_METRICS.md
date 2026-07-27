# Optimization Metrics — Proving the Optimization Loop Improves Output Quality Over Time

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ❌ **ROADMAP — own-data only, no telemetry; no metrics
> surface today.** No optimization-metrics surface exists in the product: there is no
> page, no widget, no computed output-quality KPI anywhere on the live app path. The
> checkers whose outputs these metrics would aggregate — quality scoring, tone,
> readability, and (enforced) brand safety — are themselves unbuilt or unwired
> (PRODUCT_TRUTH.md §4). Every metric specified here is computed from the agency's **own**
> data: in-memory campaign history, hand-entered KPIs, human approval outcomes, and QA-check
> outputs once those checkers exist. **No vendor telemetry, nothing auto-collected
> externally** — AdOS is 100% local, self-hosted, air-gap capable (PRODUCT_TRUTH.md §6.1).
> This document is a design specification, not a description of a shipped feature.

---

## 0. The one-paragraph truth

AdOS is designed as an agent pipeline whose tail end is an **optimization loop**:
`Generation → Quality → Brand Safety → Revision → Approval → Optimization`. The promise of
that loop is that each pass makes the *output* cleaner — fewer brand-safety escapes, fewer
revision cycles, higher quality scores — so the agency ships better first drafts with less
human rework over time. **That improvement is invisible today because nothing measures it.**
There is no output-quality scoreboard, no catch-rate counter, no revision-cycle trend on any
screen. This document specifies the optimization-metrics surface: the handful of numbers that
would let an agency principal look at AdOS and answer, honestly, *"the drafts it produces are
getting better and cheaper to approve — here is the proof."* Everything below the **Today**
section is ❌ ROADMAP.

**This is not the learning scoreboard.** Its sibling [`../3-learning-engine/LEARNING_METRICS.md`](../3-learning-engine/LEARNING_METRICS.md)
proves **learning ROI** — is the *system* getting smarter as memory accumulates (pattern-reuse,
win-rate, memory coverage). This document proves **output-quality / optimization ROI** — is each
*draft* cleaner and cheaper to approve as the QA-and-revision loop tightens. The two share raw
material (the agency's own recorded history) but answer different questions: *is the brain
compounding?* vs *is the product coming off the line better?* Where they touch, this document
cross-references rather than duplicates.

**The hard constraint, stated up front (it governs every metric here):** AdOS has **no vendor
telemetry, no external analytics, no auto-collected usage data**. Every metric below is computed
from the agency's **own** signals — in-memory campaign history and outcomes recorded at mission
completion (`apps/web/src/routes.ts:1118-1177`), hand-entered KPIs (`routes.ts:1026-1048`),
human approval decisions (`domains/agency-os/src/approval/approval.ts`, `routes.ts:478-481`), and
the outputs of the Part 4 checkers once they exist. None of it is collected from anywhere
external; there is no cloud endpoint, no per-token meter, no phone-home. If the agency did not
run the campaign, type the results, and click approve/reject, the metric is empty. That is the
design, not a gap.

---

## 1. Target design — the metrics that prove optimization ROI

The optimization-metrics surface is a small, honest quality scoreboard. Its single job: show
whether the drafts AdOS produces are **measurably cleaner and cheaper to approve this quarter
than last**, and attribute that to the optimization loop rather than luck. Six metrics carry
that weight. Each is defined below with a formula, a source, and its tier. **All six are ❌
ROADMAP** — none is computed anywhere in the code today, because the checkers that feed them are
themselves unbuilt or unwired.

### 1.1 The six headline metrics

| # | Metric | One-line meaning | Direction | Tier |
|---|---|---|---|---|
| 1 | **Brand-safety catch rate** | share of drafts where banned/off-brand terms were caught *before* a human saw them | ↑ good | ❌ ROADMAP |
| 2 | **Tone / readability pass rate** | fraction of drafts that clear the tone + readability bar on first generation | ↑ good | ❌ ROADMAP |
| 3 | **Revision-cycles-per-approval** | average human revision loops before a stage is approved | ↓ good | ❌ ROADMAP |
| 4 | **Variant-lift** | quality-score gap between the chosen variant and the baseline single-shot draft | ↑ good | ❌ ROADMAP |
| 5 | **Human-override rate** | fraction of AI drafts a human rejects or rewrites rather than approves as-is | ↓ good | ❌ ROADMAP |
| 6 | **Quality-score trend** | is the average draft quality score rising over rolling windows? | ↑ good | ❌ ROADMAP |

Below, each metric is specified in full. Formula symbols use `code font`; every source is a real
in-repo store, an explicitly unwired engine, or a roadmap surface named as such.

### 1.2 Metric 1 — Brand-safety catch rate `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "Is the loop catching off-brand and banned terms before a human has to?" |
| **Formula** | `catchRate = draftsWithViolationCaughtByEngine / draftsContainingAnyViolation` |
| **Supporting signal** | `escapeRate = violationsFoundByHumanAfterApproval / totalViolations` (the inverse failure signal) |
| **Source** | The **unwired** `RegexSafetyEngine` (`packages/ai-manager/src/runtime/safety-engine.ts:57-64`) checked against each Brand's `bannedWords` / voice rules (`domains/agency-os/src/brand/brand.ts:20-42`); human catches come from approval decisions (`approval.ts`, `routes.ts:478-481`). |
| **Why it proves optimization** | The whole point of an automated brand-safety stage is to move violation-catching *upstream* of the human. A rising catch rate means the machine, not the reviewer, is doing the guarding. |
| **Blocking dependency** | This is the **B-1 gap** — `bannedWords` are stored but never enforced on the live path; the enforcement engine exists only as unwired code (PRODUCT_TRUTH.md §4, canon B-1). Until it runs at generation, the numerator is structurally zero. See [`../1-ai-foundations/AI_QUALITY_RULES.md`](../1-ai-foundations/AI_QUALITY_RULES.md) and sibling [`./SCORING.md`](./SCORING.md). |
| **Tier** | ❌ ROADMAP — no catch is computed on any app path; the checker is 🔶 BUILT (UNWIRED). |

### 1.3 Metric 2 — Tone / readability pass rate `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "How often does a first-generation draft already read on-brand and at the right reading level?" |
| **Formula** | `passRate = draftsPassingToneAndReadability / totalDraftsGenerated`, reported per copy field where applicable |
| **Source** | The Part 4 tone checker and readability scorer — **no code exists today** (Tone Checker / Readability are ❌ ROADMAP, PRODUCT_TRUTH.md §4). Brand voice to check against comes from the Brand aggregate (`brand/brand.ts:20-42`); the copy fields checked are the CreativeSet's six (`domains/creative-studio/.../creative-set.ts:43-50`). |
| **Why it proves optimization** | A pass rate that climbs means the generator, tuned by the loop, needs the tone/readability stage to *correct* it less often — the drafts arrive closer to shippable. |
| **Blocking dependency** | Requires the tone + readability checkers to be built (sibling [`./SCORING.md`](./SCORING.md)); there is no analyzer of generated copy today. |
| **Tier** | ❌ ROADMAP — no tone/readability check runs anywhere; nothing computes a pass rate. |

### 1.4 Metric 3 — Revision-cycles-per-approval `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "How many human revision loops does a stage take to reach approval, and is that falling?" |
| **Formula** | `revCycles(stage) = Σ requestRevision events for stage / approvals for stage`, plotted per rolling window; report the **slope** |
| **Source** | Human revision requests (`approvals.requestRevision`) and approvals in the approval workflow (`domains/agency-os/src/approval/approval.ts`, `routes.ts:478-481`), across the gates `strategy_and_budget / creative_assets / campaign_launch`. |
| **Why it proves optimization** | Revision cycles are the direct cost of a bad first draft. Fewer cycles per approval is the cleanest evidence that the loop is producing drafts the human accepts sooner — it is optimization ROI paid in the reviewer's time. |
| **Honesty guard** | Today revision is **human-only and destructive** (the **B-3 gap** — no non-destructive AI revision path exists, canon B-3). The metric measures the *human* revision burden; it does not imply the machine is revising. Small samples per stage render "insufficient evidence". |
| **Tier** | ❌ ROADMAP — the events exist as approval-workflow primitives, but nothing aggregates a per-approval cycle count or trend. See sibling [`./HUMAN_REVIEW.md`](./HUMAN_REVIEW.md). |

### 1.5 Metric 4 — Variant-lift `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "When the loop produces several candidates and picks one, is the chosen variant actually better than a plain single-shot draft?" |
| **Formula** | `variantLift = score(chosenVariant) − score(baselineSingleShot)`, averaged; report `% of stages with positive lift` |
| **Source** | Requires a per-asset / multi-variant generation path **and** a quality scorer — neither exists. Today a single `creative.set` task emits all six copy fields at once (`domains/creative-studio/.../creative/service.ts:42-55`); there are no per-asset variant generators (Hook/Headline/Copy/CTA generators are ❌ ROADMAP, canon). |
| **Why it proves optimization** | This is the sharpest A/B of the optimization stage itself: same brief, best-of-N vs one-shot. Positive lift is unambiguous evidence that generating-and-selecting beats generating-once. |
| **Blocking dependency** | Requires (a) variant generation and (b) a quality score (sibling [`./SCORING.md`](./SCORING.md)); no scoring code exists today (PRODUCT_TRUTH.md §4). |
| **Tier** | ❌ ROADMAP — no variants, no scorer, no lift. |

### 1.6 Metric 5 — Human-override rate `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "How often does a human reject or rewrite the AI's draft instead of approving it as generated?" |
| **Formula** | `overrideRate = (rejections + revisionRequests) / totalDraftsReviewed`, split by stage/gate |
| **Source** | Approval decisions and revision requests in the approval workflow (`approval.ts`, `routes.ts:478-481`); every AI artifact carries `provenance{taskId,capability,model,engine,latencyMs}` to attribute the override to a model/prompt. |
| **Why it proves optimization** | Override rate is the market's verdict on draft quality, cast by the one human who must own the output. A falling override rate means the loop is earning trust: the human increasingly ships what the machine wrote. |
| **Honesty guard** | Override is confounded by reviewer strictness and client difficulty; the surface must show `n` and never read a trend from a handful of reviews. Human override is a *healthy* control, not a defect — the metric tracks its *decline as quality rises*, not its elimination. |
| **Tier** | ❌ ROADMAP — approve/reject/revision are recorded workflow events, but nothing computes or renders an override rate. See sibling [`./HUMAN_REVIEW.md`](./HUMAN_REVIEW.md). |

### 1.7 Metric 6 — Quality-score trend `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "Is the average quality of what we generate rising over time?" |
| **Formula** | `qualityTrend = slope of mean(qualityScore) per rolling window`, where `qualityScore` is the composite of the QA checks (safety, tone, readability, schema-validity) |
| **Source** | The composite emitted by the Part 4 checkers (sibling [`./SCORING.md`](./SCORING.md)); schema-validity would come from the **unwired** `SchemaValidationEngine` (`packages/ai-manager/src/runtime/validation-engine.ts:62-118`). No quality/scoring code exists on any path today (PRODUCT_TRUTH.md §4). |
| **Why it proves optimization** | It is the summary line of the loop: one number that should rise if all the upstream checks and revisions are net-improving the draft. A flat trend with everything else moving flags a scoring or weighting problem. |
| **Blocking dependency** | Requires the full checker suite (§3, step 1) — the score has no inputs until the checkers run. |
| **Tier** | ❌ ROADMAP — no quality score is computed anywhere; the trend has nothing to plot. |

### 1.8 How the six compose into one claim

The surface's single job is to let a principal say **"AdOS's drafts are getting better and
cheaper to approve"** with evidence. The metrics form a causal chain the surface should present
in this order:

`brand-safety catch rate ↑` + `tone/readability pass rate ↑` → `quality-score trend ↑` →
`variant-lift > 0` → `revision-cycles-per-approval ↓` → `human-override rate ↓`.

Read left to right it is a diagnosis (cleaner inputs → higher scores → fewer human corrections);
read right to left it is an explanation (the human overrides less *because* the drafts score
higher *because* the checks catch more upstream). All six are ❌ ROADMAP.

### 1.9 A worked example (illustrative — not live data)

To make the intended surface concrete, here is how the six metrics would read for a single tenant
across two rolling quarters, computed **entirely from that agency's own recorded outcomes and
checker outputs**. The numbers are illustrative fabrications to show shape and interpretation,
not output of any running system.

| Metric | Q1 (n=12) | Q2 (n=18) | Reading |
|---|---|---|---|
| Brand-safety catch rate | `6/9 = 67%` | `11/12 = 92%` | the engine now catches almost every violation before the human |
| Tone / readability pass rate | `41%` | `70%` | first drafts arrive on-voice more often |
| Quality-score trend (slope) | `flat` | `+ positive` | the composite is rising, not just one input |
| Variant-lift | `+0.03 avg` | `+0.12 avg` | best-of-N is beating single-shot by a widening margin |
| Revision-cycles-per-approval | `2.4` | `1.3` | reviewers reach approval in roughly half the loops |
| Human-override rate | `55%` | `28%` | humans increasingly ship the draft as written |

The story the row order tells: catches and pass rates rose first (the checkers got wired and
tuned), which lifted the quality score and variant-lift, which in turn cut revision cycles and
override rate — the agency's reviewers spend less time fixing drafts. A principal reading this
top-to-bottom sees not just *that* output quality improved but *why*. If instead catch rate were
high yet override rate flat, the surface would point at tone/readability (the checks humans
actually act on) as the stuck link. **None of this renders today; it is the target the surface is
built to produce.**

### 1.10 Measurement cadence and windows

| Choice | Specification | Rationale |
|---|---|---|
| **Window** | rolling by draft/approval count (e.g. last 20) AND by calendar quarter | count-windows are stable for low-volume agencies; date-windows read naturally in reviews |
| **Refresh** | computed on demand from stored history + checker outputs — no background job, no cache | keeps the surface deterministic and telemetry-free (§3.2) |
| **Minimum n** | metrics below a per-metric floor render as "insufficient evidence" | prevents a three-draft coincidence from reading as a trend |
| **Per-tenant** | every figure scoped to one `tenant_id` | Company Brain stores are global, unscoped `Map`s (PRODUCT_TRUTH.md §2.6) and must be scoped first |

---

## 2. Today — what actually exists

**Bottom line: there is no optimization-metrics surface of any kind, and no checker whose output
it could read.** Not a page, not a widget, not a logged aggregate. The items below are the *only*
optimization-adjacent code in the repo — and none of it computes a metric, most of it is unwired,
and the quality checks the metrics depend on do not exist at all.

### 2.1 What is recorded (but not measured) `✅ SHIPPED (write-only)`

At mission completion the app records outcomes into the Company Brain, Executive Memory, and
Decision Journal (`apps/web/src/routes.ts:1118-1177`); campaign KPIs (CTR/CPC/CPA/CPL/ROAS/ROI)
are hand-entered via a form (`routes.ts:1026-1048`); and every approve/reject/revision decision
flows through the human approval workflow (`domains/agency-os/src/approval/approval.ts`,
`routes.ts:478-481`). This is the **raw human-outcome material** several metrics in §1 would read
— but it is written, never aggregated into a catch rate, override rate, or cycle trend.

### 2.2 The unwired brand-safety engine `🔶 BUILT (UNWIRED)`

`RegexSafetyEngine` (`packages/ai-manager/src/runtime/safety-engine.ts:57-64`) can match a
Brand's `bannedWords` against generated copy — but it is instantiated by nobody on the app path.
Because it never runs at generation, no violation is ever *caught by the machine*, so the
brand-safety catch rate (§1.2) reads a structural zero. This is the **B-1 gap**: `bannedWords`
are stored (`brand/brand.ts:20-42`) and displayed but never enforced.

### 2.3 The unwired schema-validation engine `🔶 BUILT (UNWIRED)`

`SchemaValidationEngine` (`packages/ai-manager/src/runtime/validation-engine.ts:62-118`) can
enforce that model output matches its declared schema — but on the live path schema is injected as
*prompt text only*, not enforced (`apps/web/src/ai-live.ts:142-144`). Schema-validity is one
intended input to the quality score (§1.7); today it produces no per-draft pass/fail signal on any
app path.

### 2.4 What does not exist at all `❌ ROADMAP`

There is **no quality scorer, no tone checker, no readability scorer, no variant generation, and no
compliance analyzer** anywhere in the codebase (PRODUCT_TRUTH.md §4; canon ledger). The creative
stage emits all six copy fields in a single `creative.set` call (`creative/service.ts:42-55`) with
no per-asset variants and no post-generation QA. Revision is human-only and destructive (**B-3
gap**). None of the six metrics has a live input.

### 2.5 Today, in one table

| Thing | Exists? | Tier | Cite |
|---|---|---|---|
| Optimization-metrics dashboard / page | **No** | ❌ ROADMAP | — (grep: none) |
| Any computed output-quality KPI on the app path | **No** | ❌ ROADMAP | — |
| Quality score / tone check / readability check | **No** | ❌ ROADMAP | PRODUCT_TRUTH.md §4 |
| Variant generation (best-of-N) | **No** | ❌ ROADMAP | `creative/service.ts:42-55` (single task) |
| Brand-safety enforcement (bannedWords vs copy) | Code only, unwired | 🔶 BUILT (UNWIRED) | `safety-engine.ts:57-64` |
| Schema-enforced validation | Code only, unwired | 🔶 BUILT (UNWIRED) | `validation-engine.ts:62-118` |
| Human approve / reject / revision events | Yes, recorded | ✅ SHIPPED | `approval.ts`, `routes.ts:478-481` |
| Outcome recording (brain/memory/journal) | Yes, write-only | ✅ SHIPPED | `routes.ts:1118-1177` |
| Hand-entered KPIs | Yes | ✅ SHIPPED | `routes.ts:1026-1048` |

---

## 3. To build — the optimization-metrics surface once the checkers exist

The metrics surface cannot lead; it can only follow the checkers. Its prerequisites are the other
Part 4 build items, in order:

1. **Build and wire the QA checkers** — quality scorer, tone checker, readability scorer, and
   enforced brand safety (closing **B-1**). Until these run and emit per-draft outputs, five of
   the six metrics have no numerator. Specified in sibling [`./SCORING.md`](./SCORING.md) and
   [`../1-ai-foundations/AI_QUALITY_RULES.md`](../1-ai-foundations/AI_QUALITY_RULES.md).
2. **Add variant generation** — a best-of-N (or per-asset) path so variant-lift (§1.5) has a
   baseline and a chosen variant to compare.
3. **Instrument the human review loop** — count approve / reject / `requestRevision` per stage so
   override rate and revision-cycles read real values; close **B-3** (non-destructive revision) so
   revision cost is attributable. Specified in sibling [`./HUMAN_REVIEW.md`](./HUMAN_REVIEW.md).
4. **Persist checker outputs per draft** — write each draft's safety/tone/readability/schema result
   alongside the outcome record (`routes.ts:1118-1177`) so trends aggregate deterministically.

Presented as a dependency ladder — each metric lights up only when its prerequisites land:

| Metric | Unblocked by | Earliest it can read non-zero |
|---|---|---|
| Human-override rate | step 3 | as soon as approve/reject/revision are counted per draft |
| Revision-cycles-per-approval | step 3 | once revision events are tallied per stage |
| Brand-safety catch rate | steps 1 (B-1) + 4 | once the safety engine runs at generation and its catches are logged |
| Tone / readability pass rate | steps 1 + 4 | once the tone/readability checkers emit per-draft results |
| Quality-score trend | steps 1 + 4 | once the composite score is computed per draft |
| Variant-lift | steps 1 + 2 | once variants are generated and each is scored |

The ordering matters for honest reporting: shipping the *surface* before the *checkers* would
render six zeros and read as failure. The surface should ship last, or ship progressively —
revealing each metric only once its checker is wired and it can read a real value.

### 3.1 The metrics component (design)

An `OptimizationMetricsService` (❌ ROADMAP — to build) that reads the stored checker outputs and
human-review events and computes the six metrics on demand. It owns **no new data**; it only
aggregates what steps 1–4 record, per tenant. Sketch of its read surface:

| Method | Reads from | Returns |
|---|---|---|
| `safetyCatchRate(window)` | logged safety-engine catches vs post-hoc human catches | catch rate + `escapeRate` |
| `tonePassRate(window)` | per-draft tone + readability check results | pass rate per field |
| `revisionCycles(window, stage)` | approval-workflow revision events | cycles-per-approval + slope + `n` |
| `variantLift(window)` | per-variant quality scores | avg lift + `% positive` |
| `overrideRate(window, stage)` | approve / reject / revision events | rate per stage |
| `qualityTrend(window)` | composite quality scores per draft | series + slope + `n` per bucket |

### 3.2 Design constraints (binding)

- **No external telemetry, ever.** The service reads only in-memory agency history, hand-entered
  KPIs, human decisions, and locally-computed checker outputs. It must not introduce any network
  call, phone-home, or per-token meter — that would break the 100%-local, air-gap-capable guarantee
  (PRODUCT_TRUTH.md §6.1).
- **Per-tenant isolation.** The Company Brain stores are currently global, unscoped `Map`s
  (PRODUCT_TRUTH.md §2.6). Metrics MUST be computed per `tenant_id` or they will aggregate across
  agencies. A hard precondition, not a nicety.
- **Sample-honest.** Every trend renders its `n` and suppresses claims below a threshold. The
  surface must never imply "getting better" from three drafts.
- **Deterministic.** Like the KPI math (PRODUCT_TRUTH.md §6.1), metric computation is pure and
  reproducible from stored inputs — no randomness, no wall-clock dependence beyond window edges.

### 3.3 The output-quality signal vs the learning signal (design boundary)

Both scoreboards ultimately read the same recorded history, so the boundary must be explicit to
avoid double-counting the same improvement as two wins:

| Signal | Owned by | Question | Primary inputs |
|---|---|---|---|
| **Output-quality / optimization ROI** | *this* document | "Is each draft cleaner and cheaper to approve?" | checker outputs (safety/tone/readability/quality), human approve/reject/revision |
| **Learning ROI** | [`../3-learning-engine/LEARNING_METRICS.md`](../3-learning-engine/LEARNING_METRICS.md) | "Is the system compounding from memory?" | pattern-reuse, win-rate trend, memory coverage, recommendation adoption |

The verdict vocabulary (`exceeded | on_track | at_risk`), the six KPIs
(`domains/analytics-engine/.../kpi.ts:39-50`), the gate names, and the CreativeSet's six copy fields
are Book A's exactly and are shared across both surfaces. Where a number could belong to either
scoreboard (e.g. a rising win-rate), it lives in the learning surface; this surface stops at the
draft's quality and its approval cost.

### 3.4 What this surface is NOT

It is not vendor analytics, not a usage tracker, not a live ad-performance monitor (AdOS launches no
ads — PRODUCT_TRUTH.md §2.4). It measures the *quality of the drafts the agency produces* and the
*cost of approving them*, from the agency's *own* checker outputs and review decisions. It renders
alongside, and reuses the vocabulary of, the agency-level reporting in
[`../../book-a/AGENCY_REPORTING.md`](../../book-a/AGENCY_REPORTING.md).

### 3.5 Acceptance criteria (definition of done)

The optimization-metrics surface is considered built when all of the following hold:

1. Each of the six metrics computes a real, per-tenant value from stored checker outputs and human
   decisions — no placeholder, no zero-because-unwired.
2. Every trend renders its `n` and honours the minimum-sample floor (§1.10).
3. No metric introduces any network call; the whole surface runs air-gapped (§3.2).
4. The output-quality/learning boundary (§3.3) holds — no improvement is counted on both
   scoreboards.
5. The worked-example story (§1.9) is reproducible: feeding a known draft-and-review history yields
   the expected metric values deterministically, provable in a unit test.

Until criteria 1–5 are met, this document remains a specification, and the product surface remains
❌ ROADMAP.

---

## 4. Cross-references

| Concern | Document |
|---|---|
| Governing AI principles | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| Quality checks & scoring the metrics aggregate | [`./SCORING.md`](./SCORING.md) |
| Human review, override & revision instrumentation | [`./HUMAN_REVIEW.md`](./HUMAN_REVIEW.md) |
| Brand-safety / quality rules (B-1) | [`../1-ai-foundations/AI_QUALITY_RULES.md`](../1-ai-foundations/AI_QUALITY_RULES.md) |
| Learning ROI (the sibling scoreboard) | [`../3-learning-engine/LEARNING_METRICS.md`](../3-learning-engine/LEARNING_METRICS.md) |
| Agency-level reporting these metrics sit beside | [`../../book-a/AGENCY_REPORTING.md`](../../book-a/AGENCY_REPORTING.md) |
| Source of truth | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |

---

## 5. Value contribution

**Revenue ↑ and production-time ↓ — this surface is how the optimization loop is *proven and
steered*.** AdOS's commercial claim at the output layer is that it ships better first drafts with
less human rework. A claim that cannot be measured cannot be sold, priced, or trusted at renewal.
The optimization-metrics surface converts that promise into numbers a principal can watch move —
brand-safety catch rate climbing, quality-score trend rising, revision-cycles and human-override
rate falling. **Production-time ↓** is the most direct payoff: every revision cycle removed and
every override avoided is reviewer hours the agency stops spending, which is capacity to take on
more clients without more headcount. **Revenue ↑** follows two ways: cleaner drafts justify premium
positioning and defend against churn ("why keep paying? because the drafts need less fixing every
quarter, and here is the line"), and freed reviewer capacity is billable capacity. Equally, the
surface **steers** the loop: a low catch rate says wire brand safety (B-1); a flat quality trend
with high pass rates says the scoring weights are wrong; a stubborn override rate says the tone the
checkers pass is not the tone humans accept. Without this surface, the optimization loop improves in
the dark and the agency has no evidence its output is getting cheaper to approve. With it,
"better drafts, less rework, every quarter" stops being a slogan and becomes an auditable, sellable
fact — driven entirely by the agency's own checker outputs and review decisions, with zero external
telemetry.

---

*Documentation only. No application code, packages, domains, or tests were modified. Aligned to
PRODUCT_TRUTH.md.*
