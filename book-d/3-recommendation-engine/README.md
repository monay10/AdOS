# Book D · Part 3 — Recommendation Engine

The **Recommendation** layer of Performance Memory: interpreting the aggregate into a
concrete, evidence-stamped suggestion — then handing the decision to the human.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document:
> [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`RECOMMENDATION_ENGINE.md`](RECOMMENDATION_ENGINE.md) | Forming a recommendation from aggregated history | 🔶/❌ |
| [`RECOMMENDATION_TO_NEXT_CAMPAIGN.md`](RECOMMENDATION_TO_NEXT_CAMPAIGN.md) | Recommendation → Human → Next Campaign | ❌/✅ |
| [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_3_RELEASE.md`](PART_3_RELEASE.md) | Release summary | — |

## Reading order

1. **`RECOMMENDATION_ENGINE.md`** — how the aggregate becomes a concrete, evidence-stamped suggestion.
2. **`RECOMMENDATION_TO_NEXT_CAMPAIGN.md`** — how that suggestion reaches, and waits on, the human.

## The one thing to remember

Book D **forms** the recommendation; Book C **explains** it; the **human** decides. A
recommendation is an interpretation layered on descriptive evidence — always advisory, always
stamped with its sample size, never auto-applied.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
