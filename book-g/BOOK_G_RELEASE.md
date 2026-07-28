# BOOK G — Analytics Platform — Release (the observability layer)

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — all 5 parts validated PASS, aligned to `../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Builds on AdOS Core Specification v1.0
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

Book G is the **observability** layer — the metrics, dashboards, reports, and exports that let an
agency **see** what the frozen A–F core did. It consumes the core's records and renders them; it
adds no intelligence and makes no decision.

> **Book G only shows. It does not decide, learn, optimize, or mutate.** With A–G, AdOS's
> **core operating system and its observability** are complete.

Book G is **documentation only** and scrupulously honest: every capability is tagged **✅
SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing unbuilt is claimed as shipped.

---

## 1. The one sentence

> **Observability reveals reality; it never changes reality.**

## 2. The foundational law + nine governing laws

| Law | Statement |
|---|---|
| **Foundational** | Analytics never influences execution directly. |
| **1 — Never Mutates** | Read-only w.r.t. Mission, Evidence, Memory, Creative, Journal. |
| **2 — Provenance** | Every metric answers "from which records was this computed?" |
| **3 — Dashboard ≠ Decision** | Dashboards visualize; humans + B/C/D/E decide. |
| **4 — Same Data, Different Views** | CEO / Manager / Operator / Customer, one truth beneath. |
| **5 — Immutable** | Events → Metrics → Reports, never Reports → Events. |
| **6 — Every Dashboard is Derived** | A dashboard holds no data of its own. |
| **7 — Time is First-Class** | Every metric carries a window (7d / 30d / quarter / year / lifetime). |
| **8 — Every Visualization Has Data** | Every chart answers "which metrics produced this?" |
| **9 — Observability Before Optimization** | Book G observes; optimization stays Book E's domain. |

**The one-way flow:** Run Records / Events → Metrics → Dashboards → Reports → Exports.

## 3. The three tiers (the spine)

| Tier | Meaning |
|---|---|
| **✅ SHIPPED** | Runs in the live app today; cited to wired code. |
| **🔶 BUILT (UNWIRED)** | Code exists and is unit-tested, but no running path reaches it. |
| **❌ ROADMAP** | No implementation; pure specification. |

## 4. The five parts

| Part | Directory | Content docs | Focus | Tier posture |
|---|---|---|---|---|
| 1 · Execution Analytics | [`1-execution-analytics/`](1-execution-analytics/) | 2 (incl. constitution) | Laws; observing the pipeline run | governing · 🔶/❌ |
| 2 · Business Analytics | [`2-business-analytics/`](2-business-analytics/) | 2 | Campaign/ROAS/CTR/ROI; metric provenance | **✅ strongest** |
| 3 · Performance Analytics | [`3-performance-analytics/`](3-performance-analytics/) | 1 | Analytics over the memory layer | ❌ mostly |
| 4 · Operational Analytics | [`4-operational-analytics/`](4-operational-analytics/) | 1 | Per-layer operational health | 🔶/❌ |
| 5 · Executive Dashboard | [`5-executive-dashboard/`](5-executive-dashboard/) | 2 | Role-based views; A–G synthesis | ✅/❌ |

**8 content documents + 5 part-validations + 5 part-releases + 6 READMEs = 24 documents.** Each
part carries its own validation (all **PASS**) and release.

## 5. What is ✅ SHIPPED today (the honest baseline)

- **The deterministic KPI engine** — `computeKpis` computes CTR/CPC/CPA/CPL/ROAS/ROI as pure math
  over explicit input metrics ([kpi.ts:39](../domains/analytics-engine/src/report/kpi.ts#L39)).
- **Campaign reports** render at `/analytics`
  ([routes.ts:625](../apps/web/src/routes.ts#L625)); the narrative is the only AI part
  ([service.ts:24](../domains/analytics-engine/src/report/service.ts#L24)).
- **The executive verdict dashboard** (`exceeded | on_track | at_risk`) renders at `/executive`
  ([routes.ts:707](../apps/web/src/routes.ts#L707)).
- **The per-client ROAS rollup** renders at `/reports`
  ([routes.ts:1470](../apps/web/src/routes.ts#L1470)).
- **The live dashboard** — entity counts, a bounded 50-entry activity feed, and an audit trail
  ([app.ts:118](../apps/web/src/app.ts#L118)).
- **Two laws already hold in code:** *Every Metric Has Provenance* (reports retain their source
  metrics, [campaign-report.ts:34](../domains/analytics-engine/src/report/campaign-report.ts#L34))
  and *Analytics Never Mutates* (the analytics path is pure read; the one execution-state write,
  `recordLearning`, [routes.ts:1092](../apps/web/src/routes.ts#L1092), is outside it).

## 6. The 🔶 machinery Book G would consume (already coded, dormant)

The rich `ExecutionTrace` / `TraceBuilder`
([kernel.ts:204](../packages/ai-manager/src/runtime/kernel.ts#L204)) that would feed execution
analytics, and the `MonitoringPort.recordInference` hook
([ports.ts:160](../packages/ai-manager/src/ports.ts#L160)) that would feed operational analytics —
both real, tested, and **never produced live** because the app bypasses the governed pipeline.

## 7. What is ❌ ROADMAP

Live execution/operational analytics (need the trace wired); performance analytics (the memory
layer is written but never aggregated); **role-based dashboards** (RBAC is *declared but
unenforced* — [roles.ts:6](../apps/web/src/auth/roles.ts#L6) — so every user sees the same page);
**exports** (CSV/PDF/JSON); and **live time-window selection** (today's views are per-campaign /
per-client snapshots, not time-bucketed).

## 8. Value contribution

An observable platform is what an enterprise agency can **standardise, audit, and scale on**.
Business analytics already turns raw campaign metrics into decision-ready KPIs and verdicts —
cutting the production time of reporting to a render. The full observability design extends that
to every layer while keeping the sharpest boundary intact: **no vendor telemetry** — the agency's
record stays with the agency. A platform whose every number is provenanced, time-bounded, and
local is one an agency can put in front of its own clients — the difference between a tool and an
operating system.

## 9. Validation

All five part-validation reports record **PASS** across the ten laws, three-tier discipline,
code-citation accuracy, the invariant sentence, boundary discipline, and documentation-only
hygiene. Every cross-reference across the 24 documents resolves; the forbidden legacy label
"Advertising Operating System" appears nowhere as a product name; PRODUCT_TRUTH.md was not
modified.

## 10. What comes next

Book G is the blueprint for the observability layer; **building it is engineering work governed by
`../PRODUCT_TRUTH.md`.** The throughline: wire Book F's governed pipeline so the `ExecutionTrace`
is produced live → aggregate the performance-memory stores → enforce roles into persona views →
add the export surface → make the time window a first-class control on every metric. With A–G,
AdOS's core and its observability are specified. **Book H (Marketplace)** — the ecosystem layer —
then builds around the core per [`../ADOS_CORE_SPECIFICATION.md`](../ADOS_CORE_SPECIFICATION.md),
and must not change it.

---

## 11. Governance

[`1-execution-analytics/ANALYTICS_CONSTITUTION.md`](1-execution-analytics/ANALYTICS_CONSTITUTION.md)
is binding on every Book G artifact. Any addition must tier-tag each capability, trace ✅ claims to
code, and re-run the relevant part validation before release.

**Status: ✅ Released — Analytics Platform v1.0.0. With A–G, the AdOS core operating system and its
observability layer are specified.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
