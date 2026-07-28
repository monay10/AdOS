# Book G · Part 3 — Performance Analytics — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 3 defines the analytics that would sit **over the intelligence layers** — how the platform's
performance memory grows, how well recommendations are grounded, and how often work is approved or
revised. It is a **design & architecture specification**; every capability is tiered **✅ / 🔶 / ❌**.
Documentation only.

> **Laws:** *Analytics never influences execution directly · analytics never mutates · every
> metric has provenance · dashboard ≠ decision · same data, different views · analytics is
> immutable · every dashboard is derived · time is first-class · every visualization has data ·
> observability before optimization.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| G005 | [`PERFORMANCE_ANALYTICS.md`](PERFORMANCE_ANALYTICS.md) | Memory growth · evidence coverage · recommendation usage · approval rate · revision rate | ❌ (some 🔶) |
| — | [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 3 establishes

- **Five performance metrics, one shape:** Memory Growth, Evidence Coverage, Recommendation Usage,
  Approval Rate, and Revision Rate each ask whether the intelligence of the system is accumulating,
  being used, and being trusted over time — and each answers by **reading** what the core recorded,
  never by touching it.
- **A clean measurement seam over Book D's memory:** every metric reads the memory Book D writes,
  the grounding Book C produces, and the outcomes the mission layer records — referenced by link,
  never re-documented.
- **The optimization boundary, held:** the part reports approval and revision **rates** and never
  prescribes them. What a trend *means* and what to do about it belongs to
  [`../../book-e/README.md`](../../book-e/README.md) and the human — never to analytics.

## 3. Honest limitations

- **This is the most roadmap-heavy part of Book G.** All five metrics are **❌ ROADMAP**.
- **The memory is write-only today.** The learning flow ([routes.ts:1092](../../apps/web/src/routes.ts#L1092))
  genuinely writes a campaign's outcome across the company's knowledge stores (✅), but **nothing
  reads it back** or aggregates it — there is no code to cite for any of the five metrics.
- **The richest source is unwired.** Per-run evidence and per-run outcomes would come from the
  `ExecutionTrace` 🔶 ([kernel.ts:204](../../packages/ai-manager/src/runtime/kernel.ts#L204)),
  never produced on a live run.
- **No durable history to trend against.** The stores are volatile and in-memory, and today's
  reports are per-campaign / per-client snapshots, not time-bucketed series — so even the counts
  that exist cannot yet be placed on a 7d / 30d / quarter / year / lifetime axis.

## 4. Value contribution

Performance analytics maps to both levers — stated honestly as what the seam *would* unlock. It
**grows agency revenue** by making the compounding of intelligence **provable**: an enterprise buyer
does not take "it gets better as it runs" on faith, and Memory Growth, Evidence Coverage, and
Recommendation Usage are the metrics that would demonstrate it. It **cuts production time** by turning
trust into a number an agency can watch: Approval Rate and Revision Rate are, in effect, a measure of
rework, surfaced as observed trends so a human sees drift early — without the metric ever prescribing
a fix. The write already exists; the value is unlocked the day the read-back and aggregation are
built on top of it.

## 5. Governance

[`../1-execution-analytics/ANALYTICS_CONSTITUTION.md`](../1-execution-analytics/ANALYTICS_CONSTITUTION.md)
governs this part; releases are themselves governed by
[`../../bizops/RELEASE_GOVERNANCE.md`](../../bizops/RELEASE_GOVERNANCE.md). Every addition must
tier-tag each capability, give ✅/🔶 claims a real citation and ❌ claims none, honor Observability
Before Optimization, and re-run [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) before release.

**Status: ✅ Released — Performance Analytics v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
