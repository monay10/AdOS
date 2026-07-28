# Book G · Part 4 — Operational Analytics

The per-**layer** health of the core: throughput, latency, and failure rate for each moving part of
the governed pipeline — Planner, Generation, Scoring, Explanation, Review, and Orchestration.

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
| [`OPERATIONAL_ANALYTICS.md`](OPERATIONAL_ANALYTICS.md) | Per-layer operational health — throughput / latency / failure per layer | 🔶/❌ |
| [`PART_4_VALIDATION.md`](PART_4_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_4_RELEASE.md`](PART_4_RELEASE.md) | Release summary | — |

## Reading order

1. **`OPERATIONAL_ANALYTICS.md`** — how each layer of the core reports its own operational health,
   and why those per-layer views are not populated on live runs yet.

## The distinction from Part 1

Part 4 is **not** a second run view. Part 1's pipeline analytics
([`../1-execution-analytics/PIPELINE_ANALYTICS.md`](../1-execution-analytics/PIPELINE_ANALYTICS.md))
observes the **run as a whole** — one mission's pass through the pipeline, its stages, duration, and
outcome. Part 4 holds one **layer** still and watches it work **across all runs** — Generation's
throughput, Scoring's failure rate, Orchestration's latency. Same underlying records (Law 4, *same
data, different views*), sliced along a different axis: G002 is the trip log, G006 is the engine
diagnostic.

## The one thing to remember

Operational health is a per-layer view, and it is built but not yet live: the operational sink —
`MonitoringPort.recordInference` — is real code, wired to the governed runtime, but the governed
runtime is not the live engine, so no layer reports a live metric today. The instrument is mounted;
the engine it measures does not turn over when a user clicks a button.
*Observability reveals reality; it never changes reality.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
