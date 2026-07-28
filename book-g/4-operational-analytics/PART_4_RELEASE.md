# Book G · Part 4 — Operational Analytics — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 4 makes each **layer** of the core observable as a component with its own operational health:
throughput, latency, and failure rate for the Planner, Generation, Scoring, Explanation, Review, and
Orchestration layers. It is a **design & architecture specification**; every capability is tiered
**✅ / 🔶 / ❌**. Documentation only.

> **Laws:** *Analytics never influences execution directly · analytics never mutates · every
> metric has provenance · dashboard ≠ decision · same data, different views · analytics is
> immutable · every dashboard is derived · time is first-class · every visualization has data ·
> observability before optimization.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| G006 | [`OPERATIONAL_ANALYTICS.md`](OPERATIONAL_ANALYTICS.md) | Per-layer operational health — throughput / latency / failure per layer | 🔶/❌ |
| — | [`PART_4_VALIDATION.md`](PART_4_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 4 establishes

- **The layer-health view:** each of the six layers of the governed pipeline is a component with its
  own three vital signs — throughput (units handled), latency (time per unit), failure rate (how
  often work did not complete cleanly) — measured across every run the layer served.
- **The load-bearing distinction from Part 1:** G002 observes the **run as a whole**; G006 holds one
  **layer** still and watches it across all runs. Same records, different axis (Law 4) — a trip log
  versus an engine diagnostic. This is the reason both documents can exist without overlapping, and a
  degrading component is legible as one line on a G006 chart where G002 would scatter it across many
  run biographies.
- **The built-unwired operational sink:** `MonitoringPort.recordInference` (🔶) is the intended
  per-inference operational hook — a real port ([ports.ts:160-161](../../packages/ai-manager/src/ports.ts#L160)),
  a real aggregator with a per-model breakdown ([monitoring.ts:31-39](../../packages/ai-manager/src/runtime/monitoring.ts#L31)),
  and a real call site inside a governed execution ([manager.ts:304](../../packages/ai-manager/src/runtime/manager.ts#L304)).
  Throughput, latency, and failure rate are all computable from the samples it is built to record.

## 3. Honest limitations

- **Per-layer live metrics are ❌.** No live path records any layer's operational latency, throughput,
  or failure rate today. `recordInference` fires only inside the governed pipeline, and the live web
  app bypasses that pipeline — so the sink is never fed on a real run. The gap is a **wiring gap**,
  not a missing capability: the port, the aggregator, and the call site all exist.
- **Time-windowing is ❌ ROADMAP.** The aggregator holds lifetime totals in-process; it does not
  bucket samples into 7d / 30d / quarter / year, and no live time-window control exists. Part 4 fixes
  the Law-7 requirement so the live implementation is born compliant.
- **Planner has no metric at any tier.** It is a contract, not a shipped layer; there is nothing to
  sample, so it stays **❌** with no citation even once the pipeline is wired.

## 4. Value contribution

Per-layer operational health **cuts production time** by making the bottleneck locatable — a latency
chart that attributes a slowdown to Generation rather than Scoring turns "the system feels slow" into
a single actionable reading, and catches a quietly degrading component while it is still one metric on
a chart rather than a missed deadline. It **grows revenue** by making the core operationally
accountable at enterprise scale: a platform whose every layer reports its own health, on the agency's
own hardware, with nothing sent to a vendor, is one an operations team can stand behind and an
enterprise can adopt without surrendering its performance data.

## 5. Governance

[`../1-execution-analytics/ANALYTICS_CONSTITUTION.md`](../1-execution-analytics/ANALYTICS_CONSTITUTION.md)
governs this part; the core it observes is itself governed by
[`../../bizops/RELEASE_GOVERNANCE.md`](../../bizops/RELEASE_GOVERNANCE.md). Every addition must
tier-tag each capability, trace ✅/🔶 claims to code, cite no path for ❌ items, and re-run
[`PART_4_VALIDATION.md`](PART_4_VALIDATION.md) before release. Operational analytics observes the
layers of the frozen A–F core; it may never change them.

> **Observability reveals reality; it never changes reality.**

**Status: ✅ Released — Operational Analytics v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
