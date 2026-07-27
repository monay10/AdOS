# Book D · Part 2 — Pattern Discovery

The **Aggregate** layer of Performance Memory: turning many raw Performance Records into
reusable, per-dimension evidence — the layer that must sit between a campaign and any
recommendation.

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
| [`PATTERN_LIBRARY.md`](PATTERN_LIBRARY.md) | Captured patterns and their ranking formula | ✅/🔶 |
| [`PERFORMANCE_AGGREGATIONS.md`](PERFORMANCE_AGGREGATIONS.md) | The aggregation layer — AdOS's core IP | 🔶/❌ |
| [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_2_RELEASE.md`](PART_2_RELEASE.md) | Release summary | — |

## Reading order

1. **`PATTERN_LIBRARY.md`** — the patterns captured from every finished campaign.
2. **`PERFORMANCE_AGGREGATIONS.md`** — how raw records become reusable, sample-sized evidence.

## The one thing to remember

This layer **aggregates**, it does not judge. It says "in finance, N campaigns averaged X%
CTR" — never "video is best". The verdict is Part 3's job. Keeping that line clean is what
keeps the architecture — and the product's credibility — honest.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
