# Book G · Part 2 — Business Analytics

The strongest tier in the book: campaign, ROAS, CTR, ROI, executive, and per-client analytics
that render in the live web app **today** — and the provenance contract that keeps every one of
those numbers honest.

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
| [`BUSINESS_ANALYTICS.md`](BUSINESS_ANALYTICS.md) | Campaign / ROAS / CTR / ROI / executive / per-client analytics that render today | ✅ |
| [`METRIC_PROVENANCE.md`](METRIC_PROVENANCE.md) | Every Metric Has Provenance · Analytics is Immutable · Time is First-Class | ✅ |
| [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_2_RELEASE.md`](PART_2_RELEASE.md) | Release summary | — |

## Reading order

1. **`BUSINESS_ANALYTICS.md`** — the deterministic KPI engine, the campaign report, and the three
   live views (`/analytics`, `/executive`, `/reports`) a user reads today.
2. **`METRIC_PROVENANCE.md`** — the contract beneath those views: how each number names its source
   records, why the derivation only ever runs forward, and why a metric still needs a time window.

## The one thing to remember

The numbers are deterministic math; only the prose around them is AI. Because every shipped KPI is
a pure function of named source metrics and the report keeps those metrics beside the result, each
figure can name where it came from — provenance is structural, not a convention. What today's views
still lack is a *chosen time window*: they are scoped to a campaign, a mission, or a client, but not
yet bucketed to a span you can select (❌).

*Observability reveals reality; it never changes reality.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
