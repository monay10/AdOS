# Book G · Part 5 — Executive Dashboard

The reader-facing close of Book G: one body of truth shown to four kinds of reader, and the A–G
core drawn together into a single observability platform.

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
| [`ROLE_BASED_DASHBOARDS.md`](ROLE_BASED_DASHBOARDS.md) | One truth, four lenses — CEO / Manager / Operator / Customer (owns Same Data, Different Views + Every Dashboard is Derived) | ✅/❌ |
| [`OBSERVABILITY_PLATFORM.md`](OBSERVABILITY_PLATFORM.md) | A–G synthesised into one observable platform — the closing document of Book G | ❌ mostly |
| [`PART_5_VALIDATION.md`](PART_5_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_5_RELEASE.md`](PART_5_RELEASE.md) | Release summary — closes Book G | — |

## Reading order

1. **`ROLE_BASED_DASHBOARDS.md`** — how one set of metrics is projected into four persona lenses:
   the executive report and the live operational dashboard ship (✅), while role differentiation is
   declared but unenforced (❌).
2. **`OBSERVABILITY_PLATFORM.md`** — the closing synthesis: A–F rendered observable through the
   one-way flow *Records → Metrics → Dashboards → Reports → Exports*, with exports the missing last
   hop (❌), and Book H positioned as the ecosystem layer above A–G.

## The one thing to remember

A dashboard is the surface that sees the most and can change the least. Four personas are four
lenses on one derived record, so no two readers can ever be shown contradictory numbers — and the
whole platform stays trustworthy because the observability layer is thin, read-only, and derived.
*Observability reveals reality; it never changes reality.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
