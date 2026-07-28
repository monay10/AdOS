# Book G · Part 2 — Business Analytics — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 2 is the **strongest shipped tier** of the analytics platform: the campaign, ROAS, CTR, ROI,
executive, and per-client views a user generates and reads in the live web app today, and the
provenance contract that makes every one of those numbers defensible. It is a **design &
architecture specification**; every capability is tiered **✅ / 🔶 / ❌**. Documentation only.

> **Laws:** *Analytics never influences execution directly · analytics never mutates · every
> metric has provenance · dashboard ≠ decision · same data, different views · analytics is
> immutable · every dashboard is derived · time is first-class · every visualization has data ·
> observability before optimization.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| G003 | [`BUSINESS_ANALYTICS.md`](BUSINESS_ANALYTICS.md) | Campaign / ROAS / CTR / ROI / executive / per-client analytics that render today | ✅ |
| G004 | [`METRIC_PROVENANCE.md`](METRIC_PROVENANCE.md) | Every Metric Has Provenance · Analytics is Immutable · Time is First-Class | ✅ |
| — | [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 2 establishes

- **A deterministic KPI engine (✅):** `computeKpis` (`kpi.ts:39`) turns one explicit
  `CampaignMetrics` into six standard KPIs — CTR, CPC, CPA, CPL, ROAS, ROI (`kpi.ts:43-48`) — as
  pure, reproducible math: no model in the path, no division by zero, no float drift on money. The
  same inputs always produce the same numbers.
- **The numbers keep their source; only the prose is AI (✅):** a `CampaignReport`
  (`campaign-report.ts:55`) retains the raw metrics beside the KPIs they produced
  (`campaign-report.ts:34-35`), so provenance is a field of the report, not a log. The one AI part
  is the narrative, stamped with its own `AIProvenance` (`service.ts:24`, `:82-84`).
- **Three live views (✅):** campaign KPIs at `/analytics` (`routes.ts:625-645`), the executive
  verdict `exceeded | on_track | at_risk` at `/executive` (`executive-report.ts:40`,
  `routes.ts:707-728`), and the per-client `avgRoas` rollup at `/reports` (`routes.ts:1470`,
  `:685-696`) — three summaries of one mission truth, consistent by construction.
- **Provenance and immutability, proven not asserted (✅):** every KPI traces to named source
  records; derivation runs one way (Events → Metrics → Reports), recomputing from source and never
  rewriting it; the analytics path is a pure read, with the one execution-state write
  (`recordLearning`, `routes.ts:1092`) held deliberately outside it.

## 3. Honest limitations

- **Live time-window selection is ❌ ROADMAP.** There is no 7d / 30d / quarter / year / lifetime
  control. Today's views are per-campaign, per-mission, and per-client **snapshots**, not
  time-bucketed series — no date-range selector, no trend line, no period-over-period comparison.
  Law 7 (Time is First-Class) is a mandate these snapshots point toward, not one they yet meet; the
  gap is a missing *control*, not a missing foundation — the pure KPI engine is already ready to sit
  under a window when one is built.
- The raw metrics are **hand-entered** for the agency's own campaigns; there is no live ad-network
  feed, which is correct for the local, own-data-only boundary.

## 4. Value contribution

Business analytics maps directly to both value levers, and unusually concretely, because a KPI is
literally a measurement of the money. **It grows agency revenue** by making campaign performance
provable to a client: a ROAS an agency can defend line-by-line back to the spend and revenue it was
computed from is a number a client renews on, not one that asks for trust. **It cuts production
time** by turning the client report — KPIs, narrative, executive synthesis, and rollup — into the
click of a button over records the run already produced, and by collapsing "prove this number" from
an investigation into reading a retained field.

## 5. Governance

[`../1-execution-analytics/ANALYTICS_CONSTITUTION.md`](../1-execution-analytics/ANALYTICS_CONSTITUTION.md)
governs this part; the analytics layer is itself governed by
[`../../bizops/RELEASE_GOVERNANCE.md`](../../bizops/RELEASE_GOVERNANCE.md). Every addition must
tier-tag each capability, trace ✅ claims to code, and re-run
[`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) before release.

> **Observability reveals reality; it never changes reality.**

**Status: ✅ Released — Business Analytics v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
