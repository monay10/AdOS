# AdOS — Business Operations (BizOps)

The governance layer for **running the AdOS business** — how the company that builds
and sells **AdOS, the Enterprise AI Operating System for Advertising**, plans,
decides, measures, releases, and manages risk. This package governs the *organization*,
one level above the *product*.

> **Single source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). No
> document here promises a capability AdOS does not implement today; future product
> capabilities appear only under explicit **Roadmap** labels.
>
> **The product shape that governs everything here:** AdOS is **self-hosted,
> offline-first, and 100% local-AI** with **no cloud, no API keys, no per-token
> billing, and no phone-home telemetry**. So company economics are **license resale +
> services + support + referral — never cloud/usage metering**, and every
> customer-instance metric is **customer-reported**, never auto-collected. Company-
> internal data (own CRM, finance, engineering, support desk) is measured directly and
> is *not* telemetry.

---

## Contents

| Doc | What it is |
|---|---|
| [`BUSINESS_OPERATIONS_CONSTITUTION.md`](BUSINESS_OPERATIONS_CONSTITUTION.md) | **Start here.** The governing charter — principles, decision making, cadence, and every governance domain |
| [`OPERATING_MODEL.md`](OPERATING_MODEL.md) | The 10 functions, decision rights, RACI, cadence, escalation, success metrics |
| [`OKR_FRAMEWORK.md`](OKR_FRAMEWORK.md) | Annual → Quarterly → Department → Personal OKRs; scoring, review, templates |
| [`KPI_CATALOG.md`](KPI_CATALOG.md) | KPI catalog by department; formula/frequency/owner/target/warning/critical/source |
| [`RISK_REGISTER.md`](RISK_REGISTER.md) | Enterprise risk register — 8 categories, scored, owned |
| [`ADR_GUIDE.md`](ADR_GUIDE.md) | Architecture & Business Decision Record system |
| [`RELEASE_GOVERNANCE.md`](RELEASE_GOVERNANCE.md) | Version/branch policy, gates, checklist, rollback, GTM alignment |
| [`EXECUTIVE_DASHBOARD.md`](EXECUTIVE_DASHBOARD.md) | Executive/board dashboard definition — 12 panels |
| [`BUSINESS_CONTINUITY.md`](BUSINESS_CONTINUITY.md) | Business continuity plan for the company |
| [`BUSINESS_OPERATIONS_VALIDATION.md`](BUSINESS_OPERATIONS_VALIDATION.md) | Validation report — ✅ PASS |
| [`BUSINESS_OPERATIONS_RELEASE.md`](BUSINESS_OPERATIONS_RELEASE.md) | Release summary, statistics, known limitations, roadmap |

## Reading order

1. **Everyone:** `BUSINESS_OPERATIONS_CONSTITUTION.md` (principles, cadence, decision rights).
2. **Leads / managers:** `OPERATING_MODEL.md` → `OKR_FRAMEWORK.md` → `KPI_CATALOG.md`.
3. **Executives / board:** `EXECUTIVE_DASHBOARD.md` → `RISK_REGISTER.md`.
4. **Engineering / product:** `ADR_GUIDE.md` → `RELEASE_GOVERNANCE.md`.
5. **Continuity owners:** `BUSINESS_CONTINUITY.md` (with the product-side
   `../DISASTER_RECOVERY.md` and `../RUNBOOK.md`).

## Shared vocabulary (defined authoritatively in the Constitution)

- **Functions (10):** Executive · Engineering · Product · Sales · Marketing · Customer
  Success · Partners · Finance · Legal · Operations.
- **Operating rhythm:** Weekly (operational) → Monthly (business review) → Quarterly
  (QBR + OKR score + risk review) → Annual (strategy + OKRs + plan/budget).
- **Decision making:** RACI, one Accountable per decision; **Type 1** (irreversible,
  ADR-recorded) vs **Type 2** (reversible, delegated).
- **OKRs:** scoring 0.0–1.0, **0.7 = target**; not individual performance pay.
- **Revenue:** license resale margin · services (partner-retained where applicable) ·
  support/managed services · referral fees. **No cloud/usage metering.**

## Relationship to the rest of the repo

BizOps governs the functions delivered by the **Customer Success**
([`../customer-success/`](../customer-success/)), **Partner**
([`../partner/`](../partner/)), **Sales** ([`../sales/`](../sales/)), and **Marketing**
([`../marketing/`](../marketing/)) packages, and defers product recovery to
[`../DISASTER_RECOVERY.md`](../DISASTER_RECOVERY.md) and
[`../RUNBOOK.md`](../RUNBOOK.md). All of it is governed by
[`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md).

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
