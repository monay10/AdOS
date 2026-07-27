# Learning Metrics — Proving the Learning System Actually Works (Is AdOS Getting Better?)

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ❌ **ROADMAP.** No learning-metrics surface exists in the
> product — there is no dashboard, no report, no computed learning KPI anywhere on the
> live app path. The *only* related primitive is the **UNWIRED** learning engine's EMA
> reward per `(promptKey, model)` and per prompt version
> (`packages/ai-manager/src/runtime/learning.ts:18-46`) plus prompt-registry A/B scoring
> (`domains/prompt-registry/src/in-memory-prompt-registry.ts:66-84`) — both
> 🔶 **BUILT (UNWIRED)**, on no live path, and neither surfaces a single metric to any
> user. This document specifies the metrics surface to build once the learning loop is
> wired; it does not describe a shipped feature.

---

## 0. The one-paragraph truth

The headline promise of AdOS is that it **improves each campaign by learning from the
last**. A promise like that is worthless unless the agency can *see* it happening — a
number that goes up as the system accumulates experience. **That number does not exist
today.** AdOS has no learning-metrics dashboard, no win-rate trend, no pattern-reuse
counter surfaced to any human. The learning engine that *would* produce the raw signal
is coded and unit-tested but instantiated by nobody on the app path
(`packages/ai-manager/src/runtime/learning.ts`), and the generation-time read-back it
depends on is itself unbuilt (the **B-2 gap** — see [`MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md)).
This document is the **design specification** for the learning-metrics surface: the
handful of metrics that would let an agency principal look at AdOS and answer, honestly,
"yes, it is getting better — and here is the proof." Everything below the **Today**
section is ❌ ROADMAP.

**One hard truth, stated up front (and repeated because it governs every metric here):**
AdOS has **no vendor telemetry, no external analytics, no auto-collected usage data**.
Every metric in this document is computed from the agency's **own in-memory campaign
history** (Company Brain, Executive Memory, Decision Journal — recorded at mission
completion, `apps/web/src/routes.ts:1118-1177`) and its **hand-entered KPIs**
(`apps/web/src/routes.ts:1026-1048`). None of it is collected from anywhere external.
There is no cloud endpoint, no per-token meter, no phone-home. If the agency did not run
the campaigns and type in the results, the metric is empty. This is a feature, not a gap:
the learning signal is 100% the agency's own operating record.

---

## 1. Target design — the metrics that prove learning ROI

The learning-metrics surface is a small, honest scoreboard. Its job is singular: show
whether AdOS's output is **measurably better this quarter than last**, and attribute that
improvement to the learning loop rather than luck. Five metrics carry that weight. Each is
defined below with a formula, a source, and its tier. **All five are ❌ ROADMAP** — none is
computed anywhere in the code today.

### 1.1 The five headline metrics

| # | Metric | One-line meaning | Tier |
|---|---|---|---|
| 1 | **Pattern-reuse rate** | share of new campaigns that reused a proven pattern | ❌ ROADMAP |
| 2 | **Win-rate trend** | is the fraction of campaigns rated `exceeded`/`on_track` rising over time? | ❌ ROADMAP |
| 3 | **Brief-improvement lift** | do re-generated briefs score higher than their first draft? | ❌ ROADMAP |
| 4 | **Recommendation-adoption rate** | how often humans accept AI suggestions (prompt/model/pattern)? | ❌ ROADMAP |
| 5 | **Memory coverage** | what fraction of relevant history is actually available to inform a new campaign? | ❌ ROADMAP |

Below, each metric is specified in full. Formula symbols use `code font`; every source is a
real in-repo store or an explicitly roadmap surface.

### 1.2 Metric 1 — Pattern-reuse rate `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "Is AdOS standing on its own shoulders, or starting from scratch each time?" |
| **Formula** | `patternReuseRate = campaignsThatReusedAPattern / totalCampaignsInWindow` |
| **Supporting signal** | `avgReuseCount = Σ pattern.reuseCount / patternCount` (breadth of reuse) |
| **Source** | `Pattern.reuseCount` and `markReused()` in `domains/company-brain/src/pattern-library.ts:9-32`; ranking already weights proven reuse (`rank()` at `pattern-library.ts:34-38`) |
| **Why it proves learning** | A pattern library that is *captured but never reused* is dead weight. A rising reuse rate is the most direct evidence that yesterday's winners are shaping today's drafts. |
| **Blocking dependency** | `markReused()` is only meaningful once a generator actually pulls patterns at generation time — see [`PATTERN_DETECTION.md`](./PATTERN_DETECTION.md). Today nothing calls `markReused()` on the live path, so this metric would read a constant zero. |
| **Tier** | ❌ ROADMAP — no code computes this; the underlying `reuseCount` field exists but is never incremented on any app path. |

### 1.3 Metric 2 — Win-rate trend `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "Are our campaigns landing better as we accumulate experience?" |
| **Formula** | `winRate(window) = count(verdict ∈ {exceeded, on_track}) / count(allCampaigns in window)` then plot `winRate` per rolling window and report the **slope** |
| **Source** | Campaign verdicts `exceeded | on_track | at_risk` from the analytics report (`domains/analytics-engine/.../report/service.ts:36-91`), recorded into Executive Memory / Decision Journal at completion (`apps/web/src/routes.ts:1118-1177`). KPIs themselves are **hand-entered** (`routes.ts:1026-1048`). |
| **Why it proves learning** | It is the outcome metric the whole loop exists to move. A flat or declining slope means the learning loop is not paying off, whatever the internal reward numbers say. |
| **Honesty guard** | Win-rate is confounded by client mix, budget, and season. The surface MUST show `n` per window and label small samples "insufficient evidence" rather than imply a trend. Verdict provenance is the agency's own entered KPIs, not measured ad performance — AdOS never launches or measures live ads (PRODUCT_TRUTH.md §2.4). |
| **Tier** | ❌ ROADMAP — verdicts are recorded, but nothing aggregates them into a trend or renders it. |

### 1.4 Metric 3 — Brief-improvement lift `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "When AdOS re-works a brief using memory, is the second draft actually better?" |
| **Formula** | `briefLift = score(improvedBrief) − score(firstBrief)`, averaged; report `% of briefs with positive lift` |
| **Source** | Depends on a brief scorer and a re-generation path, both specified in the sibling [`BRIEF_IMPROVEMENT.md`](./BRIEF_IMPROVEMENT.md). The prompt-version EMA in `learning.ts:28-35` is the closest existing reward primitive, but it scores *prompt versions*, not *individual briefs*. |
| **Why it proves learning** | This is the cleanest A/B of the loop: same input, brief-before vs brief-after-memory. Positive lift is unambiguous evidence the memory read-back adds value. |
| **Blocking dependency** | Requires (a) memory read-back into generation (B-2, [`MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md)) and (b) a quality score — no quality/scoring code exists today (PRODUCT_TRUTH.md §4). |
| **Tier** | ❌ ROADMAP — the brief is generated exactly once today (`marketing-intelligence/.../brief/service.ts:43-96`); there is no re-analysis, no scorer, no lift. |

### 1.5 Metric 4 — Recommendation-adoption rate `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "Do humans trust the AI's suggestions enough to act on them?" |
| **Formula** | `adoptionRate = acceptedSuggestions / totalSuggestionsShown`, split by suggestion type (`model`, `promptVersion`, `pattern`) |
| **Source** | The learning engine already computes a `suggest(promptKey)` returning the best model / prompt version (`learning.ts:38-46`) — but it is **unwired**, surfaces nothing, and no code records whether a human accepted it. Adoption also ties to the human approval workflow (`domains/agency-os/src/approval/approval.ts`, `routes.ts:478-481`). |
| **Why it proves learning** | A learning system whose advice is ignored is not learning in production. Adoption is the bridge between "the model has an opinion" and "the agency acts on it." |
| **Tier** | ❌ ROADMAP — `suggest()` exists (🔶 unwired), but nothing displays a suggestion or logs an accept/reject event. |

### 1.6 Metric 5 — Memory coverage `❌ ROADMAP`

| Aspect | Specification |
|---|---|
| **Question answered** | "Does the system actually have enough remembered experience to help with *this* campaign?" |
| **Formula** | `coverage = campaignsWithMatchingExperience / totalCampaignsAttempted`, where a match = `experienceEngine.findSimilar({vertical, context, k}).length > 0` |
| **Source** | `InMemoryExperienceEngine.findSimilar()` (`domains/company-brain/src/experience-engine.ts` — same-vertical hard filter, Jaccard overlap) and `bestFor(domain)` in the pattern library (`pattern-library.ts:18-22`). |
| **Why it proves learning** | Coverage is the leading indicator: win-rate and reuse can only rise once memory is dense enough to match new work. Low coverage explains a flat learning curve without implying the loop is broken. |
| **Caveat** | The Company Brain stores are global in-memory `Map`s with **no tenant scoping** (PRODUCT_TRUTH.md §2.6); a real coverage metric must be computed per-tenant once scoping lands, or it will leak cross-agency counts. |
| **Tier** | ❌ ROADMAP — `findSimilar()` exists but is unwired at generation; nothing aggregates a coverage figure. |

### 1.7 How the five compose into one claim

The surface's single job is to let a principal say **"AdOS is compounding"** with evidence.
The metrics form a causal chain the dashboard should present in this order:

`memory coverage ↑` → `pattern-reuse rate ↑` → `brief-improvement lift > 0` →
`win-rate trend slope > 0`, with `recommendation-adoption` as the human-trust gate that
lets the chain operate at all. Read left to right, it is a diagnosis; read right to left, it
is an explanation. All five are ❌ ROADMAP.

### 1.8 A worked example (illustrative — not live data)

To make the intended surface concrete, here is how the five metrics would read for a single
tenant across two rolling quarters, computed **entirely from that agency's own recorded
history**. The numbers are illustrative fabrications to show shape and interpretation, not
output of any running system.

| Metric | Q1 (n=12) | Q2 (n=18) | Reading |
|---|---|---|---|
| Memory coverage | `4/12 = 33%` | `13/18 = 72%` | history is now dense enough to match most new work |
| Pattern-reuse rate | `2/12 = 17%` | `9/18 = 50%` | proven structures are being pulled forward |
| Brief-improvement lift | `+0.02 avg` | `+0.11 avg` | re-worked briefs now clear their first drafts |
| Recommendation-adoption | `40%` | `68%` | humans increasingly trust the suggestions |
| Win-rate trend (slope) | `flat` | `+ positive` | the outcome the loop exists to move is moving |

The story the row order tells: coverage rose first (the agency fed in more finished campaigns),
which enabled reuse, which produced positive brief-lift, which — once humans adopted the
suggestions — showed up as a rising win-rate. A principal reading this top-to-bottom sees not
just *that* AdOS improved but *why*. If instead coverage were high yet reuse flat, the surface
would point straight at the read-back wiring (B-2) as the stuck link. **None of this renders
today; it is the target the surface is built to produce.**

### 1.9 Measurement cadence and windows

| Choice | Specification | Rationale |
|---|---|---|
| **Window** | rolling by campaign count (e.g. last 12) AND by calendar quarter | count-windows are stable for low-volume agencies; date-windows read naturally for review meetings |
| **Refresh** | computed on demand from stored history — no background job, no cache invalidation | keeps the surface deterministic and telemetry-free (§3.2) |
| **Minimum n** | metrics below a per-metric floor render as "insufficient evidence" | prevents a three-campaign coincidence from reading as a trend |
| **Per-tenant** | every figure scoped to one `tenant_id` | global `Map`s must be scoped first (§3.2) |

---

## 2. Today — what actually exists

**Bottom line: there is no learning-metrics surface of any kind.** Not a page, not a widget,
not a logged aggregate. The two items below are the *only* learning-related code in the repo,
and **both are 🔶 BUILT (UNWIRED)** — instantiated by nobody on the app path (`apps/web`
never constructs them; they are imported only by `packages/ai-manager` internals and tests).

### 2.1 The unwired learning engine `🔶 BUILT (UNWIRED)`

`InMemoryLearningEngine` (`packages/ai-manager/src/runtime/learning.ts:10-47`) maintains two
reward tables and updates them with an exponential moving average:

| Element | Detail | Cite |
|---|---|---|
| Reward per `(promptKey, model)` | `modelRewards: Map<key, Map<model, ema>>` | `learning.ts:12`, `24-26` |
| Reward per `(promptKey, version)` | `promptRewards: Map<key, Map<version, ema>>` | `learning.ts:14`, `28-32` |
| Update rule | `ema = prior === undefined ? reward : prior*0.8 + reward*0.2` | `learning.ts:49-51` |
| Suggestion | `suggest()` returns the best-scoring `model` / `promptVersion` for a key | `learning.ts:38-46` |
| Registry feed | on a scored version it calls `prompts.score(...)` | `learning.ts:33-34` |

This is a real, tested reward accumulator — but it produces **no user-facing metric**. It has
no method that emits a rate, a trend, or a coverage figure; `suggest()` is the richest output
and it is surfaced nowhere. Nothing on the live path ever calls `observe()`, so even the raw
tables are empty in the running product.

### 2.2 The unwired prompt-registry scoring `🔶 BUILT (UNWIRED)`

`InMemoryPromptRegistry.score()` (`domains/prompt-registry/src/in-memory-prompt-registry.ts:66-84`)
accumulates a per-version reward with the same `prior*0.8 + reward*0.2` EMA and lets
`selectActive()` pick the highest-scoring prompt version as the A/B winner
(`in-memory-prompt-registry.ts:78-84`). The registry is **implemented but orphaned** — zero
workspace importers (PRODUCT_TRUTH.md §5). It, too, exposes no metric surface; a "winning
prompt version" is selectable in code but shown to no one.

### 2.3 What is recorded (but not measured) `✅ SHIPPED (write-only)`

At mission completion the app records outcomes into the Company Brain, Executive Memory, and
Decision Journal (`apps/web/src/routes.ts:1118-1177`), and campaign KPIs are hand-entered via
a form (`routes.ts:1026-1048`). This is the **raw material** every metric in §1 would read —
but it is written, never read back for measurement. There is no aggregation job, no scorer,
no rendered figure. Recording is shipped; **measuring is not**.

### 2.4 Today, in one table

| Thing | Exists? | Tier | Cite |
|---|---|---|---|
| Learning-metrics dashboard / page | **No** | ❌ ROADMAP | — (grep: none) |
| Any computed learning KPI on the app path | **No** | ❌ ROADMAP | — |
| EMA reward per `(promptKey, model)` / version | Code only, unwired | 🔶 BUILT (UNWIRED) | `learning.ts:18-46` |
| Prompt-version A/B scoring | Code only, orphaned | 🔶 BUILT (UNWIRED) | `in-memory-prompt-registry.ts:66-84` |
| `suggest()` best model/version | Code only, unsurfaced | 🔶 BUILT (UNWIRED) | `learning.ts:38-46` |
| Pattern `reuseCount` field | Field exists, never incremented on app path | 🔶/❌ | `pattern-library.ts:9-32` |
| Outcome recording (brain/memory/journal) | Yes, write-only | ✅ SHIPPED | `routes.ts:1118-1177` |
| Hand-entered KPIs | Yes | ✅ SHIPPED | `routes.ts:1026-1048` |

---

## 3. To build — the learning-metrics surface once the loop is wired

The metrics surface cannot lead; it can only follow the loop. Its prerequisites are the other
Book B build items, in order:

1. **Wire outcome → learning-engine** — call `learningEngine.observe({promptKey, model,
   reward, metadata:{promptVersion}})` at mission completion, deriving `reward` from the
   `exceeded/on_track/at_risk` verdict. Until this runs, every reward table is empty.
2. **Wire memory read-back at generation (B-2)** — without it, pattern-reuse, brief-lift, and
   coverage have nothing to measure. See [`MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md).
3. **Add a quality scorer** — required for brief-improvement lift (§1.4). No scoring code
   exists today (PRODUCT_TRUTH.md §4); it is specified in [`BRIEF_IMPROVEMENT.md`](./BRIEF_IMPROVEMENT.md).
4. **Instrument reuse & adoption** — increment `markReused()` on the live path
   ([`PATTERN_DETECTION.md`](./PATTERN_DETECTION.md)) and log accept/reject on every surfaced
   `suggest()`.

Presented as a dependency ladder — each metric lights up only when its prerequisites land:

| Metric | Unblocked by | Earliest it can read non-zero |
|---|---|---|
| Recommendation-adoption | steps 1 + 4 | after suggestions are surfaced and accept/reject logged |
| Memory coverage | step 2 | as soon as `findSimilar` runs at generation |
| Pattern-reuse rate | steps 2 + 4 | once `markReused()` fires on the live path |
| Win-rate trend | step 1 | after enough completed missions to fill a window |
| Brief-improvement lift | steps 2 + 3 | once briefs are re-generated and scored |

The ordering matters for honest reporting: shipping the *surface* before the *loop* would
render five zeros and read as failure. The surface should ship last, or ship progressively —
revealing each metric only once its prerequisite is wired and it can read a real value.

### 3.1 The metrics component (design)

A `LearningMetricsService` (❌ ROADMAP — to build) that reads the existing in-memory stores and
computes the five metrics on demand. It owns **no new data**; it only aggregates what §2.3
already records, per tenant. Sketch of its read surface:

| Method | Reads from | Returns |
|---|---|---|
| `patternReuse(window)` | pattern library (`pattern-library.ts`) | rate + `avgReuseCount` |
| `winRateTrend(window, bucket)` | verdicts in Executive Memory / Decision Journal | series + slope + `n` per bucket |
| `briefLift(window)` | brief scorer + re-gen records | avg lift + `% positive` |
| `adoption(window)` | suggestion + accept/reject log | rate per suggestion type |
| `memoryCoverage(window)` | experience engine `findSimilar` | coverage fraction |

### 3.2 Design constraints (binding)

- **No external telemetry, ever.** The service reads only in-memory agency history and
  hand-entered KPIs. It must not introduce any network call, phone-home, or per-token meter —
  that would break the 100%-local, air-gap-capable guarantee (PRODUCT_TRUTH.md §6.1).
- **Per-tenant isolation.** The Company Brain stores are currently global, unscoped `Map`s
  (PRODUCT_TRUTH.md §2.6). Metrics MUST be computed per `tenant_id` or they will aggregate
  across agencies. This is a hard precondition, not a nicety.
- **Sample-honest.** Every trend renders its `n` and suppresses claims below a threshold. The
  surface must never imply "getting better" from three campaigns.
- **Deterministic.** Like the KPI math (PRODUCT_TRUTH.md §6.1), metric computation is pure and
  reproducible from the stored history — no randomness, no wall-clock dependence beyond the
  window boundaries.

### 3.3 Deriving the reward signal (design)

Every metric ultimately traces to a single numeric `reward` per campaign, fed to
`observe()`. The design maps the agency's own verdict onto that reward deterministically:

| Verdict (from the report) | Reward | Note |
|---|---|---|
| `exceeded` | `1.0` | full positive signal |
| `on_track` | `0.6` | net positive |
| `at_risk` | `0.0` | no reward; the EMA decays the associated prompt/model/pattern |

The verdict vocabulary is Book A's exactly (`exceeded | on_track | at_risk`), and the mapping
is the only place a judgment call lives — it belongs in the AI Constitution's governance, not
hidden in a metric. The `reward` then drives the same `prior*0.8 + reward*0.2` EMA already coded
in `learning.ts:49-51`, so the metrics surface and the (once-wired) suggestion engine share one
consistent notion of "good outcome." This mapping is ❌ ROADMAP — nothing computes it today.

### 3.4 What this surface is NOT

It is not vendor analytics, not a usage tracker, not a live ad-performance monitor (AdOS
launches no ads — PRODUCT_TRUTH.md §2.4). It measures the *agency's own learning*, from the
agency's *own* recorded outcomes. It renders alongside, and reuses the verdict vocabulary of,
the agency-level reporting in [`../../book-a/AGENCY_REPORTING.md`](../../book-a/AGENCY_REPORTING.md).

---

### 3.5 Acceptance criteria (definition of done)

The learning-metrics surface is considered built when all of the following hold:

1. Each of the five metrics computes a real, per-tenant value from stored history — no
   placeholder, no zero-because-unwired.
2. Every trend renders its `n` and honours the minimum-sample floor (§1.9).
3. No metric introduces any network call; the whole surface runs air-gapped (§3.2).
4. The reward mapping (§3.3) is the single source of the `reward` signal shared with the
   suggestion engine — the scoreboard and the recommender never disagree on "good."
5. The worked-example story (§1.8) is reproducible: feeding a known campaign history yields
   the expected metric values deterministically, provable in a unit test.

Until criteria 1–5 are met, this document remains a specification, and the product surface
remains ❌ ROADMAP.

## 4. Cross-references

| Concern | Document |
|---|---|
| Governing AI principles | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| Closing the read-back loop (B-2) | [`../1-ai-foundations/MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md) |
| Brief re-analysis & the lift metric's scorer | [`BRIEF_IMPROVEMENT.md`](./BRIEF_IMPROVEMENT.md) |
| Pattern capture & reuse instrumentation | [`PATTERN_DETECTION.md`](./PATTERN_DETECTION.md) |
| Agency-level reporting these metrics sit beside | [`../../book-a/AGENCY_REPORTING.md`](../../book-a/AGENCY_REPORTING.md) |
| Source of truth | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |

---

## 5. Value contribution

**Revenue ↑ — this surface is how the compounding-learning advantage is *proven and steered*.**
AdOS's core commercial claim is that it gets better every campaign. A claim that cannot be
measured cannot be sold, priced, or trusted at renewal. The learning-metrics surface converts
the abstract promise into a number a principal can watch rise — pattern-reuse climbing,
win-rate trending up, brief-lift positive — which is what justifies premium positioning and
defends against churn ("why keep paying? because the line goes up, and here it is"). Equally,
it **steers** the loop: low memory coverage tells the agency to feed more history; low adoption
tells it the suggestions aren't trusted yet; flat brief-lift flags that the read-back isn't
adding value. Without this surface, the learning engine improves in the dark and the agency has
no evidence the investment compounds. With it, "AdOS improves each campaign by learning from the
last" stops being a slogan and becomes an auditable, sellable fact — driven entirely by the
agency's own operating record, with zero external telemetry.

---

*Documentation only. No application code, packages, domains, or tests were modified. Aligned to
PRODUCT_TRUTH.md.*
