# Book B · Part 3 — Learning Engine — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 3 specifies the **Learning Engine** — the system that is meant to make AdOS
*differentiate*: **"each campaign learns from the last."** It is a **design & architecture
specification**, and it is the most honest part of the book: AdOS **records** every
campaign today (✅, in-memory), but the **loop is open** — nothing is read back into
generation, and winner/loser detection, trend analysis, recommendation, brief improvement,
and learning metrics are **not built**. Part 3 is the blueprint that closes the loop.
Documentation only; every capability tiered **✅ / 🔶 / ❌**.

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| B3-01 | [`CAMPAIGN_MEMORY.md`](CAMPAIGN_MEMORY.md) | The memory that records each campaign | ✅ record / ❌ read-back |
| B3-02 | [`PATTERN_DETECTION.md`](PATTERN_DETECTION.md) | Recurring winning patterns | ⚠️/🔶 |
| B3-03 | [`BEST_PRACTICES.md`](BEST_PRACTICES.md) | Patterns → reusable guidance | ❌ |
| B3-04 | [`WINNER_DETECTION.md`](WINNER_DETECTION.md) | Identify winners over the real KPIs | ❌ |
| B3-05 | [`LOSER_DETECTION.md`](LOSER_DETECTION.md) | Identify losers to stop & learn from | ❌ |
| B3-06 | [`TREND_ANALYSIS.md`](TREND_ANALYSIS.md) | Trends over the agency's own history | ❌ |
| B3-07 | [`RECOMMENDATION_ENGINE.md`](RECOMMENDATION_ENGINE.md) | Insight → next action | ❌ engine / ⚠️ |
| B3-08 | [`BRIEF_IMPROVEMENT.md`](BRIEF_IMPROVEMENT.md) | Learnings → a better next brief (closes B-2) | ❌ |
| B3-09 | [`LEARNING_METRICS.md`](LEARNING_METRICS.md) | Proof the system is learning | ❌ |
| — | [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) | Validation report — **PASS** |
| — | [`README.md`](README.md) | Part index & reading order |

---

## 2. Statistics

| Metric | Value |
|---|---|
| Content documents | 9 |
| Total documents (incl. validation, release, README) | 12 |
| Approx. content lines | ~3,370 |
| Shipped anchor | in-memory campaign recording (B3-01) |
| Unwired primitives referenced | `pattern-library.rank`, `learning.ts` EMA, `reasoning.ts` |
| Validation result | ✅ PASS |

## 3. What Part 3 establishes

- **The recording foundation is real and in-memory** — the Company Brain, Executive
  Memory, and Decision Journal capture every completed campaign.
- **The loop is open** — nothing is read back into generation (Book A gap B-2). Part 3
  designs the read-back path and everything that rides on it: pattern read-back,
  best-practice curation, winner/loser detection over the real KPIs, internal-history
  trend analysis, a recommendation engine, brief improvement, and learning metrics.
- **The differentiator is a design, not a claim** — "each campaign learns from the last"
  is stated as aspirational-until-wired, made concrete in `BRIEF_IMPROVEMENT.md`.

## 4. Known limitations (documented honestly)

- **The learning loop is open**: memory is write-only relative to generation.
- **In-memory only**: durable persistence of the brain/memory is roadmap.
- **No winner/loser/trend/recommendation engines** exist; "recommendations" are only
  output fields of a single AI call today.
- **No learning-metrics surface**; the only scoring primitive (EMA over prompts/models)
  is built-but-unwired.
- **No external data**: trend/competitor reasoning is over internal history / user-supplied
  input only — no connectors, crawlers, or market feeds.

## 5. Roadmap (Part 3 scope)

Close the loop: wire memory read-back (with Part 1's Context Engine), add pattern→best-
practice curation, winner/loser detection over hand-entered KPIs, internal-history trend
analysis, a recommendation engine that turns signals into the next mission, brief
improvement, and a learning-metrics surface — all local, all over the agency's own data.
This is the compounding-advantage core of AdOS.

---

## 6. Governance

`../1-ai-foundations/AI_CONSTITUTION.md` governs this part. Every addition must tier-tag
each capability, trace ✅ claims to code, and re-run `PART_3_VALIDATION.md` before release.

**Status: ✅ Released — Learning Engine v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
