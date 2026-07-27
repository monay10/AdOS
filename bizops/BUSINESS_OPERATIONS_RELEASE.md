# AdOS Business Operations (BizOps) — Release

> **Owner:** Office of the COO
> **Status:** ✅ Released — validated, aligned to `../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

This release publishes the complete **Business Operations (BizOps)** package for AdOS
— the **Enterprise AI Operating System for Advertising**. It is the governance layer
for **running the company** that builds and sells AdOS: how it plans, decides,
measures, releases, and manages risk. It is **documentation only** and promises
nothing the product does not implement today; future product capabilities are carried
under explicit **Roadmap** labels.

---

## 1. Deliverables

| # | Document | Purpose |
|---|---|---|
| 069 | [`BUSINESS_OPERATIONS_CONSTITUTION.md`](BUSINESS_OPERATIONS_CONSTITUTION.md) | Governing charter: operating principles, decision making, cadence, and all governance domains (risk, change, product, financial, sales, marketing, customer, partner, documentation, release) |
| 070 | [`OPERATING_MODEL.md`](OPERATING_MODEL.md) | How the company operates — the 10 functions, decision rights, RACI, cadence, escalation, success metrics |
| 071 | [`OKR_FRAMEWORK.md`](OKR_FRAMEWORK.md) | Annual → Quarterly → Department → Personal OKRs; scoring, review, retrospectives, templates |
| 072 | [`KPI_CATALOG.md`](KPI_CATALOG.md) | Official KPI catalog by department; each KPI defines formula, frequency, owner, target, warning, critical, source |
| 073 | [`RISK_REGISTER.md`](RISK_REGISTER.md) | Enterprise risk register across 8 categories, scored, owned, review-cycled |
| 074 | [`ADR_GUIDE.md`](ADR_GUIDE.md) | Architecture & Business Decision Record system — template, workflow, lifecycle, indexing |
| 075 | [`RELEASE_GOVERNANCE.md`](RELEASE_GOVERNANCE.md) | Version/branch policy, approval gates, checklist, rollback, hotfix, GTM alignment, notification |
| 076 | [`EXECUTIVE_DASHBOARD.md`](EXECUTIVE_DASHBOARD.md) | Executive/board dashboard definition — 12 panels, metrics, sources, refresh |
| 077 | [`BUSINESS_CONTINUITY.md`](BUSINESS_CONTINUITY.md) | Business continuity plan for the company (distinct from product DR) |
| 078 | [`BUSINESS_OPERATIONS_VALIDATION.md`](BUSINESS_OPERATIONS_VALIDATION.md) | Validation report — **PASS** |
| — | [`README.md`](README.md) | Package index and reading order |

---

## 2. Statistics

| Metric | Value |
|---|---|
| Content documents (069–077) | 9 |
| Total documents (incl. validation, release, README) | 12 |
| Approx. content lines | ~3,995 |
| Departments / functions governed | 10 |
| Risk categories | 8 |
| Executive dashboard panels | 12 |
| OKR levels | 4 (Annual → Personal) |
| Validation result | ✅ PASS |

## 3. What this package governs

- **Operating rhythm:** Weekly → Monthly → Quarterly → Annual, defined once and reused.
- **Decision making:** RACI + Type 1 (irreversible) / Type 2 (reversible), one
  Accountable per decision, recorded as ADRs for Type 1.
- **Measurement:** a single KPI catalog and OKR framework feeding one executive
  dashboard, with the risk register reviewed on the quarterly cadence.
- **Release + continuity:** truthful release governance for a **self-hosted, offline**
  product and a business-continuity plan layered above the product's own DR.

## 4. Truth boundaries honored (the hard part of a company-ops package)

- **No cloud/usage metering.** Company economics are license resale + services +
  support + referral only; the product has no metering, so no financial artifact
  books usage/consumption/per-token revenue.
- **No vendor telemetry / no standing access.** Every customer-instance metric across
  the KPI catalog, OKRs, and dashboard is **customer-reported / customer-attested** —
  the company cannot auto-collect from self-hosted instances. The resulting
  early-warning limitation is carried as an explicit operational risk, not hidden.
- **Company vs product roadmap kept separate.** Forbidden/future product capabilities
  (document Q&A, autonomous agents, live ad launch, connectors, enforced RBAC,
  immutable audit, DB-level RLS, cloud inference, vision/speech AI, tiered approval
  authority) appear only under labelled Roadmap sections and are never measured as
  shipped. Product roadmap is owned by `../PRODUCT_TRUTH.md` and `../ROADMAP.md`.
- **Release ≠ auto-deploy.** For a self-hosted product a "release" is a versioned
  build + docs + GTM alignment distributed to self-hosters; customer/partner
  notification is a communication step, never a push.

## 5. Validation

`BUSINESS_OPERATIONS_VALIDATION.md` records a full **PASS** across cross references,
governance consistency, department consistency, terminology, product-truth alignment,
revenue-model truth, the no-vendor-telemetry constraint, Roadmap labels, and
documentation-only hygiene.

## 6. Known limitations

- The dashboards and KPIs are **definitions**, not a built BI system; populating them
  depends on company-owned systems plus customer-reported inputs.
- Because AdOS has **no telemetry**, customer-adoption/health signals are only as
  timely as customers choose to share them.
- The ADR guide, OKR framework, and release governance are **process definitions**;
  adoption discipline is a management responsibility, not enforced by tooling.

## 7. Roadmap (process)

Clearly labelled as **not yet in place** at the process level: an opt-in / self-
submitted customer-metrics intake to reduce reporting latency, and any tooling to
automate the KPI/OKR/dashboard pipeline. These are **company-process** roadmap items
and add **no product capability**; product-level roadmap remains owned by
`../PRODUCT_TRUTH.md` and `../ROADMAP.md`.

---

## 8. Governance

`BUSINESS_OPERATIONS_CONSTITUTION.md` is binding on every artifact here. Any future
addition must trace each product-capability claim to `../PRODUCT_TRUTH.md` or carry it
under an explicit Roadmap label — and must re-run the validation in
`BUSINESS_OPERATIONS_VALIDATION.md` before release.

**Status: ✅ Released — Business Operations v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
