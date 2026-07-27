# Trend Analysis — Detecting Movement Across the Agency's Own Campaign History

**Owner:** Office of the Chief AI Architect
**Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Status:** Official — aligned to `PRODUCT_TRUTH.md`
**Governing reference:** [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md)

> **Implementation status:** ❌ **ROADMAP (ABSENT)** — no trend-analysis code exists.
> This is a clean design specification. Any trend analysis AdOS is designed to perform
> is over the **agency's own in-memory campaign history and hand-entered KPIs** — there
> is **no external market-data feed, no connectors, and no web data**. Internal-history
> trend analysis only.

---

## 0. What this document is (and is not)

This is the design specification for **Trend Analysis**: reading the agency's *own*
accumulated campaign history as a time series and reporting what is **rising** and what
is **declining** across campaigns, so that later recommendations can ride a winning
pattern while it is still climbing.

It is a **specification**, not a description of shipped behavior. Per the ledger this
book is governed by, Trend Analysis is **❌ ROADMAP** — **no code implements it today.**
A direct search of `domains/**` and `packages/**` returns **no time-series engine, no
trailing-window comparison, no rising/declining classifier, and no trend model** of any
kind. The `TrendAnalysis` concept has no runtime, no port, and no test.

Two hard boundaries frame everything below, and both are non-negotiable:

1. **Internal history only.** The raw material is the data AdOS already holds about its
   own past work — the Experience Engine, the Knowledge Graph, the Pattern Library, and
   the KPIs a human typed into the metrics form. Nothing else.
2. **No external market data — ever.** AdOS has **no market-trend ingestion, no
   connectors, no web scraping, and no third-party data feed.** `connector-hub` is an
   unwired scaffold with **zero importers** (`domains/connector-hub/src/events.ts:9-20`),
   and analytics numbers are **hand-entered via a form**, not ingested
   (`apps/web/src/routes.ts:1026-1048`). "Market trend ingestion" is **forbidden** and
   stays forbidden. This document describes trend detection over the agency's *own*
   history and nothing more.

Sibling design specs in this part carry the rest of the learning loop:
[`PATTERN_DETECTION.md`](PATTERN_DETECTION.md) captures *which* structures win;
[`RECOMMENDATION_ENGINE.md`](RECOMMENDATION_ENGINE.md) turns detected movement into a
next action. Trend Analysis sits between them: it adds the **time axis** that neither a
point-in-time pattern nor a single recommendation has on its own. For how finished KPIs
are surfaced to clients today, see Book A's
[`../../book-a/AGENCY_REPORTING.md`](../../book-a/AGENCY_REPORTING.md).

---

## 1. Target design

### 1.1 The one-sentence goal

> Read the agency's own campaign history in time order and report, per dimension, which
> patterns and KPIs are **rising**, **declining**, or **flat** — so the agency can
> double down on a rising winner before it fades, and retire a declining one before it
> costs another campaign.

A **point** answer ("this hook scored well") is what a pattern gives you. A **trend**
answer ("this hook has climbed across the last four campaigns, that one peaked two
campaigns ago and is sliding") requires ordering the history and comparing windows. That
time axis is the whole contribution of this component.

### 1.2 Inputs — strictly the agency's own history

Every input is data AdOS already generated about itself. No input originates outside the
workspace.

| Input | Source (today, in-memory) | What the trend reads from it |
|---|---|---|
| Past campaign experiences | `domains/company-brain/src/experience-engine.ts:13-35` (`InMemoryExperienceEngine`) | Ordered record of what was tried, in which vertical, with which context |
| Winning-pattern evidence | `domains/company-brain/src/pattern-library.ts:9-38` (`InMemoryPatternLibrary`) | Per-pattern `evidence.value` and `evidence.sampleSize` over time |
| Campaign → Ad → Lead → ROI graph | `domains/company-brain/src/knowledge-graph.ts:11-40` (`InMemoryKnowledgeGraph`) | Relationships that let a KPI be attributed back to a pattern |
| Hand-entered campaign KPIs | `apps/web/src/routes.ts:1026-1048` (metrics form) → `domains/analytics-engine/src/report/kpi.ts:39-50` | The six KPIs (`ctr`,`cpc`,`cpa`,`cpl`,`roas`,`roi`) per campaign report |

The six KPIs are exactly Book A's six — `ctr`, `cpc`, `cpa`, `cpl`, `roas`, `roi`
(`domains/analytics-engine/src/report/kpi.ts:39-50`). Trend Analysis introduces **no new
metric**; it introduces the **direction** of the ones the agency already computes.

> **Reminder:** these KPIs are *typed in by a human*, not fetched from an ad platform.
> AdOS launches nothing and reads nothing back from Meta/Google/TikTok. A trend is only
> as complete as the numbers the agency chose to record.

### 1.3 Output — a `TrendReport` (specification)

The target output is a deterministic, explainable object. Sketch of the intended shape
(design only — no such type exists in the codebase):

| Field | Meaning |
|---|---|
| `dimension` | What is being tracked: a KPI name, a pattern id, or a vertical |
| `direction` | `rising \| declining \| flat` — the verdict for this dimension |
| `slope` | Signed magnitude of movement across the compared windows |
| `window` | `{ recent: N campaigns, prior: N campaigns }` used for the comparison |
| `evidence` | `{ sampleSize, points[] }` — the ordered history the verdict rests on |
| `confidence` | Low when sample size is small; scales with history depth |

The `rising \| declining \| flat` vocabulary is intentionally small and mirrors the
"direction" idea already familiar from Book A's report verdict
`exceeded \| on_track \| at_risk`
([`../../book-a/AGENCY_REPORTING.md`](../../book-a/AGENCY_REPORTING.md)). Trend Analysis
does not reuse that verdict — a verdict judges one campaign against its target; a trend
judges the agency's *movement* across many campaigns — but it deliberately keeps the
same plain, three-way, explainable style.

### 1.4 Method — trailing-window comparison over ordered history

The intended method is deliberately simple, deterministic, and offline — matching the
house style of the existing in-memory engines, which are all "deliberately simple and
deterministic" (`domains/company-brain/src/experience-engine.ts:8-11`):

1. **Order** the relevant history by time (experiences already carry an `at` timestamp —
   `experience-engine.ts:19`).
2. **Window** it into a *recent* slice and a *prior* slice.
3. **Aggregate** the dimension (mean KPI, or `evidence.value` for a pattern) in each
   slice.
4. **Compare** the two aggregates to produce `slope` and thus `direction`.
5. **Weight** the result by sample size so a two-campaign "trend" cannot outrank a
   forty-campaign one — the same `Math.min(1, sampleSize / 100)` confidence discipline
   the Pattern Library already uses to rank evidence
   (`domains/company-brain/src/pattern-library.ts:35-37`).

No forecasting, no regression model, no smoothing library is required for v1; a signed
window delta plus a sample-size weight is enough to answer "rising or fading?" honestly.
Anything heavier is a later increment, not a launch requirement.

### 1.5 Where it sits in the learning loop

```
Pattern Detection ──► Trend Analysis ──► Recommendation Engine
(which structures win)  (are they rising    (ride the rising one,
                         or fading, and       retire the fading one)
                         how fast?)
```

- [`PATTERN_DETECTION.md`](PATTERN_DETECTION.md) supplies the *dimensions* to track
  (the captured winning structures).
- **Trend Analysis** (this doc) supplies the *direction and speed* of each dimension
  over the agency's own history.
- [`RECOMMENDATION_ENGINE.md`](RECOMMENDATION_ENGINE.md) consumes the directions and
  turns "rising, fast, high-confidence" into a concrete next-campaign suggestion.

All three are **❌ ROADMAP**; this diagram is the target relationship, not a running
pipeline.

### 1.6 The three dimensions a trend is tracked over

Trend Analysis is not one number; it is the same trailing-window method (§1.4) applied to
three distinct dimensions drawn from the agency's own history. Each answers a different
question.

| Dimension | Question it answers | Read from | Design note |
|---|---|---|---|
| **KPI trend** | Is `roas` (or any of the six) climbing or sliding across recent campaigns? | Per-report KPIs (`domains/analytics-engine/src/report/kpi.ts:39-50`) | Uses the six Book A KPIs unchanged; the trend is their *direction*, not a new metric |
| **Pattern trend** | Is a winning structure's evidence still strengthening, or has it peaked? | `evidence.value` / `sampleSize` over time (`domains/company-brain/src/pattern-library.ts:9-38`) | A pattern can be a strong *point* winner yet a *declining* trend — that gap is the whole point |
| **Vertical trend** | Within one industry vertical, what is the agency getting better or worse at? | Experience Engine, hard-filtered by `vertical` (`domains/company-brain/src/experience-engine.ts:29`) | Vertical is already a first-class hard filter in the history, so per-vertical trends are natural |

### 1.7 Worked example (illustrative — nothing runs)

Suppose the agency has completed six restaurant-vertical campaigns, and each recorded a
`roas` KPI into its report. Ordered by the experience `at` timestamp:

| Campaign order | `roas` recorded | Slice |
|---|---|---|
| 1 (oldest) | 2.1x | prior |
| 2 | 2.4x | prior |
| 3 | 2.6x | prior |
| 4 | 3.0x | recent |
| 5 | 3.3x | recent |
| 6 (newest) | 3.5x | recent |

A trailing-window comparison (recent mean ≈ 3.27x vs. prior mean ≈ 2.37x) yields a
positive `slope`, so `direction = rising`, and with six samples the `confidence` is
moderate (still shy of the sample-size ceiling in §1.4). The `TrendReport` for the
"restaurant · `roas`" dimension therefore reads *rising, moderate confidence, evidence =
these six points* — and [`RECOMMENDATION_ENGINE.md`](RECOMMENDATION_ENGINE.md) can act on
"still climbing" rather than merely "worked before."

Now suppose a specific winning hook pattern shows `evidence.value` of 0.9 → 0.8 → 0.6
across its last three captures. Its *point* rank (`pattern-library.ts:35-37`) may still
be high, but its *trend* is `declining` — the exact signal a point-in-time ranking cannot
express, and the reason the time axis earns its place.

Both numbers above are invented for illustration. No such computation exists in the code.

---

## 2. Today

### 2.1 Status: ❌ not built

**There is no trend-analysis code in AdOS.** Verified by source search across
`domains/**` and `packages/**`:

| Looked for | Result |
|---|---|
| A trend/time-series engine or port | **None** — no `TrendAnalysis`, no `trend-engine`, no time-series module anywhere |
| Trailing-window / period-over-period comparison | **None** — no windowed history comparison in any domain or package |
| A `rising \| declining \| flat` (or equivalent) classifier | **None** |
| Any market-data / external-trend feed | **None, and forbidden** — `connector-hub` is a stub with 0 importers (`domains/connector-hub/src/events.ts:9-20`) |

`TrendAnalysis` therefore has **no runtime, no interface, and no test.** It is not
shipped and not built-unwired — it is pure roadmap.

### 2.2 The raw material that *does* exist (recorded, not analyzed)

Trend Analysis is absent, but the **history it would read is already being written** at
mission completion. This is why the component is a genuine near-term build rather than a
distant idea — the substrate is real and in-memory today:

| Substrate | Status | Evidence |
|---|---|---|
| Experience Engine (records what was tried, with `at` timestamp + vertical) | ✅ recorded, in-memory | `domains/company-brain/src/experience-engine.ts:13-35` |
| Pattern Library (winning structures with `evidence.value` / `sampleSize`) | ✅ recorded, in-memory | `domains/company-brain/src/pattern-library.ts:9-38` |
| Knowledge Graph (Campaign→Ad→Lead→ROI relationships) | ✅ recorded, in-memory | `domains/company-brain/src/knowledge-graph.ts:11-40` |
| Six campaign KPIs, hand-entered per report | ✅ computed, deterministic | `apps/web/src/routes.ts:1026-1048`; `domains/analytics-engine/src/report/kpi.ts:39-50` |
| Recording happens at mission completion | ✅ shipped, write-only | `apps/web/src/routes.ts:1118-1177` |

**Crucial caveat — the material is write-only relative to analysis.** These stores are
populated but **nothing reads them back to compute a trend.** The Experience Engine
exposes `findSimilar` (nearest-neighbour retrieval — `experience-engine.ts:22-34`), and
the Pattern Library exposes `bestFor` (point-in-time ranking — `pattern-library.ts:18-22`).
**Neither is a time-series read.** There is no method that orders history into windows
and compares them. The data has a time axis (`at` timestamps exist); no code walks it.

This is the same shape as the broader open gap this book tracks — memory is **recorded
but not yet read back** into generation. Trend Analysis is the read-back specialized to
the **time** dimension.

### 2.3 What is emphatically *not* here

To keep the honesty sharp:

- **No external market data.** Nothing in AdOS ingests industry benchmarks, competitor
  activity, seasonality feeds, search-trend data, or any web source. The only outbound
  `fetch()` calls in the system target localhost AI engines. Market-trend ingestion is
  **forbidden** and is **not** part of this or any roadmap item.
- **No live ad-platform data.** KPIs are typed into a form
  (`apps/web/src/routes.ts:1026-1048`); campaigns never leave `draft` and nothing is
  read back from an ad account.
- **No forecasting or predictive model.** Not built, and not required for the v1 design
  in §1.4.

---

## 3. To build

All items below are **❌ ROADMAP** unless explicitly tagged otherwise. This is the
wiring/design plan; none of it exists today.

### 3.1 Build sequence

| # | Build step | Depends on | Tier |
|---|---|---|---|
| 1 | Define a `TrendReport` contract (§1.3) and a `TrendAnalysisPort` | — | ❌ ROADMAP |
| 2 | Add a **time-ordered read** over the Experience Engine (walk `at`, slice recent/prior) | Existing `experience-engine.ts` records | ❌ ROADMAP |
| 3 | Implement trailing-window comparison + sample-size weighting (§1.4) | Step 2 | ❌ ROADMAP |
| 4 | Track per-pattern `evidence.value` over time from the Pattern Library | `pattern-library.ts` captures | ❌ ROADMAP |
| 5 | Track per-KPI movement across campaign reports (the six KPIs) | `kpi.ts:39-50` outputs | ❌ ROADMAP |
| 6 | Emit `TrendReport`s into [`RECOMMENDATION_ENGINE.md`](RECOMMENDATION_ENGINE.md) as an input | Steps 3–5 | ❌ ROADMAP |
| 7 | Surface rising/declining callouts in agency reporting | Book A [`../../book-a/AGENCY_REPORTING.md`](../../book-a/AGENCY_REPORTING.md) | ❌ ROADMAP |

### 3.2 Design constraints (must hold)

- **Internal history only.** Every read is from the Experience Engine, Pattern Library,
  Knowledge Graph, or hand-entered KPIs. **No connector, no web fetch, no market feed** —
  no exceptions. If a future request asks for "market trends," the answer is that it is
  out of scope by product design, not a missing feature.
- **Deterministic and offline.** Same history in, same `TrendReport` out — matching the
  pure/deterministic discipline of the KPI math (`kpi.ts:33-50`) and the existing
  in-memory engines. No model call is needed to detect a trend; an LLM may later
  *narrate* a trend, but must never *invent* one.
- **Honest confidence.** A trend over two campaigns is a rumor, not a trend. Scale
  confidence by sample size exactly as the Pattern Library already does
  (`pattern-library.ts:35-37`), so thin history cannot masquerade as a strong signal.
- **Explainable.** Every `direction` must carry the ordered `points[]` it was derived
  from, so a human reviewer can see the movement, consistent with the human-approval
  posture the whole platform keeps (`domains/agency-os/src/approval/approval.ts`).

### 3.3 Relationship to the book-wide learning-read-back gap

Book A's walkthrough flags that the agency's memory is **recorded but not read back**
into later work (the learning read-back gap). Trend Analysis is one concrete face of
closing that gap — the face that adds **time**. The recording half is already shipped and
write-only (`apps/web/src/routes.ts:1118-1177`); the missing half is any component that
walks that history and turns it into a signal a future campaign can use. This document
specifies that missing half for the *movement-over-time* signal, while
[`PATTERN_DETECTION.md`](PATTERN_DETECTION.md) specifies it for the *which-structure-wins*
signal and [`RECOMMENDATION_ENGINE.md`](RECOMMENDATION_ENGINE.md) for the *what-to-do-next*
signal. None of the three is wired today; together they are the read-back the platform is
designed to grow into.

### 3.4 Explicitly out of scope (and staying that way)

| Tempting extension | Verdict |
|---|---|
| Ingesting industry benchmarks or seasonality feeds | **Forbidden** — external market data is not part of AdOS by product design |
| Competitor-activity trends | **Forbidden** — no external data source; `connector-hub` is an unwired stub (`domains/connector-hub/src/events.ts:9-20`) |
| Web / search-trend scraping | **Forbidden** — the only outbound `fetch()` targets localhost AI engines |
| Pulling live KPIs from an ad account | **Not possible by design** — campaigns never leave `draft`; KPIs are hand-entered (`apps/web/src/routes.ts:1026-1048`) |
| Predictive forecasting / regression modelling | ❌ ROADMAP, not v1 — the trailing-window method in §1.4 is sufficient to ship the first honest signal |

The first three rows are permanent boundaries, not backlog items. Trend Analysis is, and
remains, **internal-history only**.

### 3.5 Open questions for the spec

- **Window definition:** fixed campaign count, fixed time span, or per-vertical adaptive?
  (Leaning: campaign count, since KPIs arrive per completed campaign, not per day.)
- **Grouping:** trends per vertical (the Experience Engine already hard-filters by
  `vertical` — `experience-engine.ts:29`) vs. per brand vs. workspace-wide.
- **Flat threshold:** what `slope` magnitude counts as `flat` rather than a weak
  rising/declining signal.
- **Cold start:** how to behave when history is too thin to trend (design intent: emit
  `flat` with explicitly low `confidence` rather than a spurious direction — a thin
  history must never masquerade as a signal).
- **Attribution depth:** whether a KPI trend should be attributed back through the
  Knowledge Graph (`domains/company-brain/src/knowledge-graph.ts:11-40`) to the specific
  pattern that drove it, or tracked purely at the campaign level for v1.
- **Recency weighting:** whether newer campaigns in the recent slice should carry more
  weight than older ones, or remain evenly averaged for a first, maximally explainable
  cut.

### 3.6 Acceptance criteria for a shippable v1

A first version of Trend Analysis is only "done" when all of the following hold:

| Criterion | Why it matters |
|---|---|
| Reads **only** internal history (Experience Engine, Pattern Library, Knowledge Graph, hand-entered KPIs) | Enforces the internal-history-only boundary |
| Produces the same `TrendReport` for the same history every time | Matches the deterministic discipline of `kpi.ts:33-50` |
| Every `direction` carries the ordered `points[]` behind it | Keeps the signal explainable for human approval |
| `confidence` scales with sample size and stays low on thin history | Prevents rumors from ranking as trends |
| Makes **zero** network calls of any kind | Preserves the 100% local, air-gap-capable posture |

---

## 4. Value contribution

**Revenue ↑ — ride a rising pattern before it fades.**

A point-in-time pattern tells the agency what *has* worked. A trend tells it what is
*still gaining* versus what has *peaked and is sliding*. That timing is money:

- **Double down while climbing.** Re-investing in a pattern whose KPI trend is `rising`
  captures the upside before the pattern saturates — the same winner, sold again into
  more campaigns while it is still converting.
- **Retire before it drags.** Spotting a `declining` pattern early stops the agency
  spending another campaign's production effort on a fading structure.
- **Sharper recommendations.** Feeding `direction` and `slope` into
  [`RECOMMENDATION_ENGINE.md`](RECOMMENDATION_ENGINE.md) upgrades "this worked once" to
  "this is working *now and accelerating*" — a materially stronger basis for the next
  first draft, and therefore a better hit rate per campaign.

The lever is **revenue up** (better-timed bets on the agency's own proven winners), with
a secondary **production-time down** effect (less effort wasted on fading patterns). All
of it is realized strictly from the agency's own recorded history — no external data is
required, and none is permitted.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
