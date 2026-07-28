# BOOK G — Analytics Platform (the Observability Layer)

The layer that lets you **see** the core. Books A–F are the frozen
[**AdOS Core Specification v1.0**](../ADOS_CORE_SPECIFICATION.md) — Workflow, Production,
Explainability, Performance Memory, Creative Judgement, Orchestration. **Book G is how an agency
observes all of it**: the metrics, dashboards, reports, and exports that render what the core did.

> **Book G only shows. It does not decide, learn, optimize, or mutate.** It reads what the core
> produces and reveals it. With A–G, AdOS's **core + its observability** are complete.

> **Single source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Book G is a **design &
> architecture specification**, not a claim of shipped capability. Every capability is tagged
> **✅ SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing unbuilt is claimed as shipped.
>
> **Start here:**
> [`1-execution-analytics/ANALYTICS_CONSTITUTION.md`](1-execution-analytics/ANALYTICS_CONSTITUTION.md)
> — the foundational law and the nine governing laws.

---

## The one sentence to remember

> **Observability reveals reality; it never changes reality.**

## Where Book G sits

| Layer | Book | Relationship to the core |
|---|---|---|
| Core Operating System | **A–F** | The frozen platform (v1.0) |
| **Observability** | **G — Analytics** *(this book)* | **Consumes & observes** — reads the core's records and renders them |
| Ecosystem | H — Marketplace | Extends — builds around the core |

Book G builds **on** the frozen core and never changes it. Its raw material is Book F's observable
run record; its rule is one-way: **core → record → analytics.**

## The one-way flow

```
Run Records / Events → Metrics → Dashboards → Reports → Exports
```

Never the reverse. Analytics may *recompute* a metric from its source; it never *rewrites* history.

## The foundational law + nine governing laws

- **Foundational — Analytics never influences execution directly.**
1. **Analytics Never Mutates** — read-only w.r.t. all core state.
2. **Every Metric Has Provenance** — every number answers "from which records was this computed?"
3. **Dashboard ≠ Decision** — dashboards visualize; humans + B/C/D/E decide.
4. **Same Data, Different Views** — CEO / Manager / Operator / Customer, one truth beneath.
5. **Analytics is Immutable** — Events → Metrics → Reports, never Reports → Events.
6. **Every Dashboard is Derived** — a dashboard holds no data of its own.
7. **Time is First-Class** — every metric carries a window (7d / 30d / quarter / year / lifetime).
8. **Every Visualization Has Data** — every chart answers "which metrics produced this?"
9. **Observability Before Optimization** — Book G observes; optimization stays Book E's domain.

## The five parts

| Part | What it covers | Tier posture |
|---|---|---|
| [`1-execution-analytics/`](1-execution-analytics/) | The constitution; observing the pipeline run | governing · 🔶/❌ |
| [`2-business-analytics/`](2-business-analytics/) | Campaign/ROAS/CTR/ROI/executive analytics; metric provenance | **✅ strongest** |
| [`3-performance-analytics/`](3-performance-analytics/) | Analytics over the performance-memory layer | ❌ mostly |
| [`4-operational-analytics/`](4-operational-analytics/) | Per-layer operational health of the core | 🔶/❌ |
| [`5-executive-dashboard/`](5-executive-dashboard/) | Role-based views; the closing A–G synthesis | ✅/❌ |

Each part has its own `README.md`, a validation report (all **✅ PASS**), and a release. The
flagship summary is [`BOOK_G_RELEASE.md`](BOOK_G_RELEASE.md).

## The honest baseline

**Business Analytics already ships.** A deterministic KPI engine computes CTR/CPC/CPA/CPL/ROAS/ROI
as pure math over explicit metrics ([kpi.ts:39](../domains/analytics-engine/src/report/kpi.ts#L39));
campaign reports render at `/analytics`, the executive verdict dashboard at `/executive`, and a
per-client ROAS rollup at `/reports`. Two laws are **already true in code**: *Every Metric Has
Provenance* (KPIs retain their source metrics,
[campaign-report.ts:34](../domains/analytics-engine/src/report/campaign-report.ts#L34)) and
*Analytics Never Mutates* (the analytics path is pure read; the one execution-state write,
`recordLearning`, sits outside it).

**The honest gaps.** Execution and operational analytics depend on Book F's `ExecutionTrace`
(🔶, never produced live); performance analytics reads a memory layer that is written but never
aggregated (❌); role-based dashboards are ❌ (RBAC is *declared but unenforced* — every user sees
the same page); exports (CSV/PDF/JSON) and live time-window selection are ❌. Book G says so on
every page.

## Inviolable boundaries

**100% local** · **copy-only** · **no external data** · **no vendor telemetry** — analytics is the
opposite of telemetry: it keeps the record with the agency and sends nothing off-device ·
**human-sovereign** (dashboards inform; humans decide) · **not an autonomous agent**.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
