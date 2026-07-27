# Winner Detection

**Owner:** Office of the Chief AI Architect
**Source of truth:** ../../PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Status:** Official
**Governing reference:** ../1-ai-foundations/AI_CONSTITUTION.md

> **Implementation status:** ❌ **ROADMAP** — no winner-detection engine exists. No
> code classifies any campaign or creative as a "winner." This document is a design
> specification, not a description of live behavior.

---

## 0. What this document is

Winner Detection is the capability that answers one question for the agency:
**"Which campaigns and which creatives actually worked — so we can do more of what
worked?"** It is the positive half of the Learning Engine's classification layer; its
mirror is the sibling `LOSER_DETECTION.md`, and its downstream consumer is the sibling
`PATTERN_DETECTION.md`, which mines confirmed winners into a reusable pattern library.

Per the AdOS three-tier honesty model, this topic is tagged **❌ ROADMAP**. There is
today **no detector, no threshold engine, and no winner classifier** anywhere in the
codebase. The word "winner" (and its cousins `bestHook` / `bestHeadline`) appears only
in three unrelated places, none of which classify campaigns or creatives (see §3). This
document therefore specifies the target design and states plainly what is absent.

A hard constraint frames the entire design: winner detection can only ever be as good
as its inputs, and **the inputs are hand-entered.** AdOS ingests no ad-platform data.
Campaign performance metrics arrive through a human-filled form (`routes.ts:1026-1048`),
and `PRODUCT_TRUTH.md §2.5` records this bluntly: *"Analytics metrics are hand-entered
via a form, not ingested."* Winner detection runs on human-entered performance data or
it does not run at all. This document never pretends otherwise.

### 0.1 Scope and non-goals

To keep the boundary sharp, Winner Detection **is not**:

| Non-goal | Belongs to |
|---|---|
| Deciding *why* a campaign lost | `LOSER_DETECTION.md` |
| Turning winners into reusable rules | `PATTERN_DETECTION.md` |
| Ingesting live ad-platform metrics | out of product scope (`PRODUCT_TRUTH.md §2.5`) |
| Launching / optimizing a live campaign | out of product scope (`PRODUCT_TRUTH.md §2.4`) |
| Generating copy or acting on the tag | Book B Part 2 (Creative Factory) |
| Reading memory back into generation | `../1-ai-foundations/MEMORY_INJECTION.md` (gap B-2) |

Winner Detection's single job is classification: given already-computed performance,
label the winners and hand them downstream. Everything else is a neighbor's job.

---

## 1. Ground truth: what a "winner" is measured against

A winner is not an opinion. It is a verdict over the **six deterministic KPIs** that
Book A already computes, plus the **ExecutiveReport verdict** that already summarizes a
mission's outcome. Winner Detection introduces **no new metric** — it is a
classification layer *on top of* Book A's existing, deterministic math.

### 1.1 The six KPIs (Book A — already shipped)

The KPI computation is real, pure, and deterministic
(`domains/analytics-engine/src/report/kpi.ts:39-50`; documented in
`../../book-a/AGENCY_REPORTING.md`). These six are the raw signal any winner threshold
is expressed against:

| KPI | Meaning | Winner direction |
|---|---|---|
| `ctr` | Click-through rate (%) | higher is better |
| `cpc` | Cost per click (minor units) | lower is better |
| `cpa` | Cost per acquisition (minor units) | lower is better |
| `cpl` | Cost per lead (minor units) | lower is better |
| `roas` | Return on ad spend (x) | higher is better |
| `roi` | Return on investment (%) | higher is better |

Note the mixed polarity: three KPIs are "higher-is-better" and three are
"lower-is-better." A winner detector must encode direction per KPI, not blindly compare
magnitudes.

### 1.2 The ExecutiveReport verdict (Book A — already shipped)

Every completed mission already carries a headline verdict on the CEO dashboard, drawn
from a fixed enum (`domains/executive-ai/src/dashboard/executive-report.ts:36,43,72`;
`service.ts:19-23`):

| `verdict` | Meaning | Winner relevance |
|---|---|---|
| `exceeded` | Mission beat its target | primary winner candidate |
| `on_track` | Mission met its target | conditional winner |
| `at_risk` | Mission missed its target | never a winner (→ `LOSER_DETECTION.md`) |

The verdict is a per-mission rollup. Winner Detection **reuses** it as the coarse gate
(only `exceeded` / `on_track` missions are eligible) and then refines the judgment at
the KPI and creative level. It never redefines the enum — that would contradict Book A.

---

## 2. Target design — the Winner Detector

The specified detector is a pure, deterministic function over already-recorded
performance data. It sits in the Learning Engine layer (Book B Part 3), downstream of
mission completion and upstream of Pattern Detection.

### 2.1 Pipeline position

```
Mission completes
  → CampaignReport (6 KPIs, deterministic)   [Book A, ✅ shipped]
  → ExecutiveReport (verdict)                [Book A, ✅ shipped]
  → Company Brain recording (write-only)     [✅ shipped, in-memory]
  → Winner Detector  ◄── THIS DOCUMENT       [❌ roadmap]
       → tags winning campaigns / creatives / patterns
       → feeds Pattern Detection library     [→ PATTERN_DETECTION.md]
```

### 2.2 Inputs (all human-entered or deterministically derived)

| Input | Origin | Tier |
|---|---|---|
| `ComputedKpi[]` (the six KPIs) | `kpi.ts:39-50` from hand-entered metrics | ✅ math shipped / ❌ input hand-entered |
| Mission `verdict` | `executive-report.ts:43` | ✅ shipped |
| CreativeSet's six copy fields | `creative-set.ts` (hook/headline/adCopy/CTA/socialPost/etc.) | ✅ shipped |
| Peer cohort (comparable missions) | Company Brain history | ✅ recorded / ❌ not read back |

### 2.3 Winner thresholds (specification)

A **campaign winner** is defined as a completed mission satisfying **all** gate
conditions below. Thresholds are configuration, shown here as illustrative defaults; the
engine must make them tunable per workspace.

| Rule | Condition (illustrative default) | Rationale |
|---|---|---|
| `R1` verdict gate | `verdict ∈ {exceeded, on_track}` | never promote an `at_risk` mission |
| `R2` ROAS floor | `roas ≥ 1.0` | the campaign at minimum paid for itself |
| `R3` primary-KPI lead | mission's primary KPI beats cohort median by ≥ X% (direction-aware) | outperformance, not just adequacy |
| `R4` sample sufficiency | `sampleSize ≥ N` | avoid crowning noise (see §2.5) |
| `R5` no red KPI | no single KPI in the `at_risk` band | a winner cannot hide a broken metric |

`R2`'s ROAS floor is deliberately conservative and echoes the only ROAS-aware branch in
today's stub (`ai.ts:161` splits advice at `roas >= 1`). Winner Detection promotes that
implicit line into an explicit, documented threshold.

To evaluate `R3` and `R5`, the detector needs **per-KPI bands** — a direction-aware
mapping from a KPI value (relative to its cohort) to a qualitative tier. These bands are
the shared vocabulary between Winner Detection and its mirror `LOSER_DETECTION.md`:

| Band | Higher-is-better KPI (`ctr`, `roas`, `roi`) | Lower-is-better KPI (`cpc`, `cpa`, `cpl`) | Winner meaning |
|---|---|---|---|
| `green` | ≥ cohort median × (1 + X) | ≤ cohort median × (1 − X) | outperformance — supports a winner |
| `neutral` | within ±X of cohort median | within ±X of cohort median | adequate — allowed but not sufficient |
| `at_risk` | ≤ cohort median × (1 − X) | ≥ cohort median × (1 + X) | red — blocks a winner (rule `R5`) |

The band edges (`X`) are workspace configuration, not hard-coded constants. Encoding the
direction *inside* the band table is what stops the classic bug of treating a low `cpa`
as a loss.

A **creative winner** is a copy asset attached to a winning campaign whose measured
contribution (CTR / conversion attribution over the hand-entered data) leads its peer
variants. Because AdOS emits all six copy fields in a single `creative.set` task and
does **not** run per-asset A/B measurement today (canon ledger: *Hook/Headline/Copy/CTA
generators* are ⚠️/❌), creative-level attribution is the most speculative part of this
design and depends on future per-asset instrumentation.

### 2.4 Worked example (illustrative — the mechanism, not live output)

Consider three completed missions in one cohort, all with hand-entered metrics run
through `kpi.ts`. Cohort medians: `roas = 2.0x`, `ctr = 2.0%`, `cpa = 4000` (minor
units). Band edge `X = 15%`.

| Mission | `verdict` | `roas` | `ctr` | `cpa` | `sampleSize` | Winner? |
|---|---|---|---|---|---|---|
| `M-101` | `exceeded` | 3.1x | 2.8% | 3200 | 9 | ✅ passes `R1`–`R5` |
| `M-102` | `on_track` | 2.0x | 2.1% | 3900 | 8 | ⚠️ fails `R3` (no clear lead over median) |
| `M-103` | `exceeded` | 3.4x | 3.0% | 3100 | 2 | ⚠️ fails `R4` (sample too thin) |

`M-101` clears every gate: it is `exceeded` (`R1`), pays for itself well above the
floor (`R2`), leads the cohort on its primary KPI by direction-aware margin (`R3`), rests
on a sufficient sample (`R4`), and carries no red KPI (`R5`). It becomes a
`campaignWinner`. `M-103` looks best on raw KPIs but is disqualified by `R4` — exactly the
sample-size trap §2.5 warns against; promoting it would crown noise. `M-102` is healthy
but ordinary, so it is *not* a winner (nor a loser). The example is illustrative: no such
detector runs today (§3).

### 2.5 Cohort assembly

`R3`, `R4`, and the band table all need a **cohort** — the set of comparable prior
missions. The specified cohort is assembled by reading completed missions back from the
Company Brain, filtered to comparable dimension(s) (same objective type / channel mix /
brand). This read-back is precisely the loop that is **not closed today**: the brain
records at mission completion (`routes.ts:1146-1170`, ✅ shipped) but nothing reads it
back into any engine (Book A gap **B-2**). `W3` in §4 owns building that reader; without
it, the detector has no cohort and degenerates to absolute thresholds only.

### 2.6 Outputs

The detector emits tags — it never mutates campaigns or launches anything (consistent
with `PRODUCT_TRUTH.md §2.4`, drafts-only):

| Output | Shape | Consumer |
|---|---|---|
| `campaignWinner` | `{ missionId, verdict, kpis, score, cohortRank }` | dashboard, Pattern Detection |
| `creativeWinner` | `{ assetId, field, metric, contribution }` | Pattern Detection, future generation |
| `winningPattern` | `{ dimension, value, evidence }` | `PATTERN_DETECTION.md` library |

### 2.7 Composite winner score and ranking

Passing the `R1`–`R5` gates makes a mission *eligible*; the agency also needs to know
**which** winners to prioritize when budget is finite. The specified detector therefore
attaches a scalar `score` used only for **ranking** eligible winners — never for
promotion (promotion is gate-based, §2.3). The score is a normalized, direction-aware,
weighted blend of the six KPIs relative to the cohort:

```
score = Σ  wᵢ · normalizedᵢ           (i over the six KPIs)
normalizedᵢ = direction-aware distance of KPIᵢ from cohort median, clipped to [0,1]
```

`wᵢ` weights the mission's primary KPI most heavily (a lead-gen mission weights `cpl` /
`ctr`; a sales mission weights `roas` / `roi`). The ranking style deliberately mirrors
the EMA-based `selectActive` sort (`prompt-registry.ts:79-84`): highest score wins, ties
break toward the more recent mission. That ranking code exists but is 🔶 unwired and
operates on prompt templates, not campaigns; `W7` in §4 adapts the *pattern*, it does not
reuse the code as-is.

### 2.8 Creative-winner detection (most speculative)

A campaign winner is a mission; a **creative winner** is a specific copy asset that drove
the win. This is harder and further out because AdOS emits all six CreativeSet copy
fields — hook, headline, adCopy, CTA, socialPost, landingPage — from a **single**
`creative.set` task (`creative/service.ts:42-55`; canon ledger marks per-asset generators
⚠️/❌). There is today **no per-asset measurement**, so no asset can be individually
credited. The target design requires two prerequisites that do not exist:

1. **Per-asset instrumentation** — attributing hand-entered performance to specific copy
   variants (needs variant tracking the pipeline does not emit today).
2. **A read-back cohort of assets** — the same B-2 loop the campaign path needs.

Until those exist, creative-winner output is limited to inheriting a campaign's winner
tag onto all its assets (coarse), explicitly flagged as unattributed. Honest creative
attribution is a downstream milestone, not a v1 deliverable.

### 2.9 Statistical honesty (the sample-size trap)

The one adjacent piece of real code — the Company Brain merge — encodes a lesson the
detector must respect. When two performance snapshots merge, the brain keeps the
qualitative "winners" **from the larger sample**
(`domains/company-brain/src/in-memory-company-brain.ts:110-113`):

```
// Keep the better-performing qualitative winners from the larger sample.
bestHook: next.sampleSize >= prev.sampleSize ? next.bestHook : prev.bestHook,
bestHeadline: next.sampleSize >= prev.sampleSize ? next.bestHeadline : prev.bestHeadline,
```

This is a **merge heuristic, not a classifier** — it picks which stored string survives
a merge, it does not decide that anything is a winner. But its instinct is correct and
becomes rule `R4`: never crown a winner on a thin sample. A single lucky mission is not
a pattern.

---

## 3. Today — what actually exists (❌ no detector)

There is **no winner-detection engine.** Nothing in `apps/web`, the domains, or the
packages classifies a campaign or creative as a winner. The concept surfaces only as
three partial, unrelated traces — none of which is a detector:

| # | Trace | Location | What it actually is | Why it is NOT winner detection |
|---|---|---|---|---|
| (a) | Prompt A/B `selectActive` | `prompt-registry.ts:79-84` | picks the highest-**scored** prompt *template* version | Selects a prompt, not a campaign/creative; and the registry is **🔶 BUILT (UNWIRED)** — no live path instantiates it |
| (b) | Brain merge `bestHook` / `bestHeadline` | `in-memory-company-brain.ts:110-113` | keeps the qualitative field from the **larger sample** on merge | A merge tiebreaker, not a classification of campaigns/creatives |
| (c) | Hardcoded advice strings | `apps/web/src/ai.ts:161-163` | branches on `roas >= 1` to emit canned recommendation text | Deterministic stub prose ("...against the current winner"); computes nothing, classifies nothing |

### 3.1 Detail on trace (a) — prompt scoring is not campaign scoring

`selectActive` (`prompt-registry.ts:79-84`) sorts prompt-template versions by an EMA
`score` and returns the top one. It is genuine ranking code — but it ranks **prompt
variants inside the registry**, and the registry has **zero workspace importers**
(`PRODUCT_TRUTH.md §5`). It never sees a campaign, a KPI, or a creative asset. Reusing
its ranking *style* for campaign winners is future wiring work, not existing behavior.

### 3.2 Detail on trace (c) — the "winner" in the stub is a word, not a verdict

The default `OfflineAIManager` emits, when `roas >= 1`, the literal string *"Test new
creative variants against the current winner"* (`ai.ts:161`). "Winner" here is
copywriting inside a canned array — the same deterministic template stub that
`PRODUCT_TRUTH.md §1.5` describes. No creative was measured; no campaign was ranked.

### 3.3 Detail on trace (b) — a merge tiebreaker, not a classifier

The Company Brain's `bestHook` / `bestHeadline` fields
(`in-memory-company-brain.ts:110-113`) are the closest thing in the repo to a stored
"winning creative." But they are populated by a **merge rule**, not a detector: when two
`CreativeInsight` snapshots combine, the field from the larger-sample snapshot survives.
Nothing ever *decided* that hook was a winner — it was simply the string that came in on
the bigger sample. There is no threshold, no cohort comparison, no verdict gate, and no
KPI evaluation. Treating these fields as a winner classification would misread a data
merge as a decision. Winner Detection would *produce* values like these deliberately;
today they are a side effect of aggregation.

### 3.4 Summary of the three traces

None of (a), (b), (c) reads a campaign's KPIs and returns "winner." (a) ranks prompt
templates in an unwired registry; (b) is a merge tiebreaker over stored strings; (c) is
canned advice prose. The honest tier is **❌ ROADMAP**: the detector, its thresholds, its
cohort reader, and its output tags all remain to be built.

### 3.5 The blocking gap

Even if a detector were written today, its signal would be limited by the input reality:
KPIs are **hand-entered** (`routes.ts:1026-1048`; `PRODUCT_TRUTH.md §2.5`), and the
Company Brain that stores history is **write-only relative to generation** — recorded at
completion but never read back (canon-aligned; `../1-ai-foundations/MEMORY_INJECTION.md`
covers the read-back gap, Book A walkthrough gap **B-2**). Winner Detection is a consumer
of exactly the loop B-2 leaves open.

---

## 4. To build — the winner-detection spec

All items below are **❌ ROADMAP** unless marked otherwise. None runs today.

### 4.1 Build ledger

| # | Work item | Tier | Depends on |
|---|---|---|---|
| `W1` | Pure `detectWinners(reports, cohort, thresholds)` function over the six KPIs + verdict | ❌ ROADMAP | Book A KPIs ✅, verdict ✅ |
| `W2` | Direction-aware KPI comparison (mixed polarity, §1.1) | ❌ ROADMAP | `kpi.ts` |
| `W3` | Cohort assembly — read completed missions back from Company Brain | ❌ ROADMAP | brain read-back (B-2) |
| `W4` | Sample-size guard `R4` | ❌ ROADMAP | brain `sampleSize` (exists) |
| `W5` | Creative-level attribution (per-asset contribution) | ❌ ROADMAP | per-asset instrumentation (not built) |
| `W6` | Emit `winningPattern` records into the pattern library | ❌ ROADMAP | `PATTERN_DETECTION.md` |
| `W7` | Optional: reuse EMA ranking style from `selectActive` for campaign scoring | ❌ ROADMAP | `prompt-registry.ts:79-84` (unwire→adapt) |

### 4.2 Design principles

- **Deterministic and pure.** Like `kpi.ts`, the detector takes data in and returns tags
  out — no model call, no side effects, unit-testable. Winner classification must be
  reproducible and auditable, not an LLM opinion.
- **Direction-aware.** Encode per-KPI polarity (§1.1). Never compare `cpa` as if higher
  were better.
- **Cohort-relative, sample-guarded.** A winner outperforms comparable peers on a
  sufficient sample (`R3` + `R4`), not an absolute magic number.
- **Verdict-consistent.** Gate on the Book A `verdict` enum; never invent a competing
  outcome label.
- **Input-honest.** Surface that the underlying KPIs were hand-entered; do not imply
  platform-measured certainty the data does not have.
- **Tag, never act.** Output labels for humans and for Pattern Detection; never launch,
  optimize, or mutate a campaign (`PRODUCT_TRUTH.md §2.4`).

### 4.3 Failure modes the detector must resist

| Failure mode | Cause | Guard |
|---|---|---|
| Crowning noise | thin sample looks great by luck | `R4` sample floor (§2.5) |
| Polarity inversion | comparing `cpa`/`cpc`/`cpl` as higher-is-better | direction-aware bands (§2.3) |
| Hidden red KPI | strong ROAS masks a broken `cpl` | `R5` no-red-KPI gate |
| Input laundering | hand-entered metrics implied as platform-measured | surface provenance; label the data source honestly |
| Verdict drift | inventing an outcome label outside Book A's enum | gate strictly on `exceeded`/`on_track`/`at_risk` |
| Winner inflation | thresholds set so loose that most missions "win" | cohort-relative `R3`, not absolute magic numbers |

### 4.4 Interaction with siblings

| Sibling | Relationship |
|---|---|
| `LOSER_DETECTION.md` | Mirror classifier; shares thresholds/cohort machinery, opposite verdict gate (`at_risk`) |
| `PATTERN_DETECTION.md` | Primary downstream consumer — turns confirmed winners into a ranked pattern library |
| `../1-ai-foundations/MEMORY_INJECTION.md` | Owns the read-back loop (B-2) that `W3` depends on |
| `../../book-a/AGENCY_REPORTING.md` | Defines the six KPIs this detector judges against |

---

## 5. Value contribution

**Revenue ↑ — double down on what wins.** Winner Detection is the mechanism by which the
agency stops guessing which campaigns and creatives to repeat. By turning already-computed
KPIs and verdicts into explicit, ranked winner tags, it lets teams **reallocate budget and
creative effort toward proven performers** and feed those patterns forward into the next
brief. The revenue lever is concentration: identifying the ~20% of campaigns and creatives
driving outsized ROAS and reproducing them deliberately, rather than by memory. It also
protects revenue indirectly by keeping "winner" an evidence-backed verdict over real KPIs
— never a stub string — so the agency scales what actually worked, not what merely
sounded good.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
