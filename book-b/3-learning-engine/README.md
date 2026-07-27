# Book B · Part 3 — Learning Engine

The system meant to make AdOS *differentiate*: **"each campaign learns from the last."**
This is the flagship's core idea — and the most honest part of the book. **AdOS records
every campaign today (✅, in-memory), but the loop is open: nothing is read back into
generation.** Part 3 is the blueprint that closes it.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is
> a **design & architecture specification**. Every capability is tagged **✅ SHIPPED**,
> **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Read
> [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) for
> the tier model, and [`../1-ai-foundations/MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md)
> for the read-back gap (B-2).
>
> **Boundaries:** learning is over the agency's **own** in-memory history + **hand-entered**
> KPIs. No vendor telemetry, no external/market data, no connectors.

---

## Contents

| Doc | Capability | Tier |
|---|---|---|
| [`CAMPAIGN_MEMORY.md`](CAMPAIGN_MEMORY.md) | The recording foundation | ✅ record / ❌ read-back |
| [`PATTERN_DETECTION.md`](PATTERN_DETECTION.md) | Recurring winning patterns | ⚠️/🔶 |
| [`BEST_PRACTICES.md`](BEST_PRACTICES.md) | Patterns → guidance | ❌ |
| [`WINNER_DETECTION.md`](WINNER_DETECTION.md) | Identify winners | ❌ |
| [`LOSER_DETECTION.md`](LOSER_DETECTION.md) | Identify losers | ❌ |
| [`TREND_ANALYSIS.md`](TREND_ANALYSIS.md) | Internal-history trends | ❌ |
| [`RECOMMENDATION_ENGINE.md`](RECOMMENDATION_ENGINE.md) | Insight → next action | ❌ / ⚠️ |
| [`BRIEF_IMPROVEMENT.md`](BRIEF_IMPROVEMENT.md) | Better next brief — **closes B-2** | ❌ |
| [`LEARNING_METRICS.md`](LEARNING_METRICS.md) | Proof of learning | ❌ |
| [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_3_RELEASE.md`](PART_3_RELEASE.md) | Release summary | — |

## Reading order

1. `CAMPAIGN_MEMORY.md` — what is recorded today (and that it isn't read back).
2. Detection: `PATTERN_DETECTION.md` → `BEST_PRACTICES.md` → `WINNER_DETECTION.md` → `LOSER_DETECTION.md` → `TREND_ANALYSIS.md`.
3. Acting on it: `RECOMMENDATION_ENGINE.md` → `BRIEF_IMPROVEMENT.md` (the loop closes here) → `LEARNING_METRICS.md`.

## The one thing to remember

AdOS already has the memory; what it lacks is the **read-back**. Close that one path and
every capability in this part — patterns, best practices, winners, losers, trends,
recommendations, better briefs — comes to life on the agency's own data, entirely local.
That is the compounding advantage the flagship is built to deliver.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
