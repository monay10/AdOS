# Book G · Part 3 — Performance Analytics

Analytics over the intelligence layers: how the platform's performance memory grows, how well
recommendations are grounded, and how often work is approved or revised — read back, never rewritten.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document:
> [`../1-execution-analytics/ANALYTICS_CONSTITUTION.md`](../1-execution-analytics/ANALYTICS_CONSTITUTION.md).
>
> **Laws:** *Analytics never influences execution directly · analytics never mutates · every
> metric has provenance · dashboard ≠ decision · same data, different views · analytics is
> immutable · every dashboard is derived · time is first-class · every visualization has data ·
> observability before optimization.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`PERFORMANCE_ANALYTICS.md`](PERFORMANCE_ANALYTICS.md) | Memory growth · evidence coverage · recommendation usage · approval rate · revision rate | ❌ (some 🔶) |
| [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_3_RELEASE.md`](PART_3_RELEASE.md) | Release summary | — |

## Reading order

1. **`PERFORMANCE_ANALYTICS.md`** — the five metrics over Book D's performance memory, each read-only,
   each tier-tagged honestly.

## The one thing to remember

The platform **writes** performance memory today but never **reads it back** — so performance
analytics is the most roadmap-heavy part of Book G, and it says so plainly. Where it does exist, it
only ever reports: it measures approval and revision *rates* and never prescribes them.
*Observability before optimization — the judgement stays with Book E and the human.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
