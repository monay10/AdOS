# AdOS — Executive Dashboard (Board / CEO Review Specification)

**Owner:** Office of the CEO
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)

---

## 0. Purpose & scope

This document **specifies the executive dashboards** that the AdOS leadership team
(CEO, C-suite) and the Board review on a fixed cadence. It is a **management
artifact** — a definition of the panels, the KPIs each panel carries, where the
numbers come from, and how often they refresh.

**What this is NOT:**

- It is **not a product feature.** It has nothing to do with the in-product
  **CEO / Executive dashboard** that AdOS synthesizes for a *client's* campaign
  (the `executive-ai` single-LLM synthesis described in
  [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §1.3 and §3). That is a customer-facing
  product surface. This document governs how *our company's* leadership reviews
  *our company's* performance.
- It is **not telemetry.** AdOS is offline-first and self-hosted; there is no
  vendor phone-home. This dashboard **aggregates company-owned operational data**
  (our CRM, finance ledger, code repository, our own support desk, HR system)
  **plus customer-reported / customer-exported inputs** for anything that lives
  inside a customer instance.

**Governing references (in-repo):**

- Governance framework: [BUSINESS_OPERATIONS_CONSTITUTION.md](BUSINESS_OPERATIONS_CONSTITUTION.md)
- KPI definitions, formulas, thresholds: [KPI_CATALOG.md](KPI_CATALOG.md)
- Objectives & Key Results model: [OKR_FRAMEWORK.md](OKR_FRAMEWORK.md)
- Product ground truth: [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)
- Product-Roadmap items (labelled as Roadmap only): [../ROADMAP.md](../ROADMAP.md)
- Known product limits: [../KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md)

Every KPI named here is defined authoritatively in
[KPI_CATALOG.md](KPI_CATALOG.md) (Name · Formula · Frequency · Owner · Target ·
Warning · Critical · Source). This dashboard **shows** those KPIs; it does not
redefine them. Where a formula and this panel ever disagree, the KPI Catalog wins.

---

## 1. The data-honesty rule (read before trusting any panel)

AdOS ships as an **offline, self-hosted product with no vendor telemetry, no
phone-home, and no standing vendor access** into customer environments
([../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §1.5, §2.8; the vendor cannot see
inside a customer's instance). This forces a hard line down every panel below:

| Data class | Can leadership see it directly? | How it enters this dashboard |
|---|---|---|
| **Company-owned operational data** — our CRM/pipeline, our finance ledger, our Git repo & CI, our own support desk, our HR/People system, our marketing platforms | **Yes** — the company owns these systems and measures them freely | Direct system export / API into the reporting layer |
| **Customer-instance data** — a customer's usage, adoption, feature uptake, health *inside their self-hosted AdOS* | **No** — there is no telemetry; we cannot auto-collect it | **Customer-reported / customer-exported / customer-attested** only — via QBRs, success check-ins, surveys, and customer-run exports |

Any panel or row whose truth depends on what happens **inside a customer's
deployment** is explicitly tagged **[Customer-reported]**. Those numbers are as
timely and complete as customers choose to share; leadership must read them as
*attested inputs*, not observed facts. This limitation is itself tracked as an
operational risk in the risk register (per the Constitution's risk model:
"no vendor telemetry limits early-warning on churn").

Legend used in every panel below:

- **[Company-owned]** — measured directly from a system the company owns.
- **[Customer-reported]** — customer-exported / attested; no telemetry involved.
- **[Roadmap]** — a *product*-Roadmap item shown for planning context only; it is
  **not shipped** and is **not** a company performance metric today.

---

## 2. Dashboard structure & review cadence

The executive dashboard is one logical board with **twelve panels**. Different
panels refresh at different rhythms, matching the company operating cadence
defined in [BUSINESS_OPERATIONS_CONSTITUTION.md](BUSINESS_OPERATIONS_CONSTITUTION.md):

| Cadence | Forum | What is reviewed |
|---|---|---|
| **Weekly** | Exec operational review | Pipeline, Engineering, Quality, Support live tiles vs target |
| **Monthly** | Business review | Full KPI scorecard, all panels, forecast, OKR check-in |
| **Quarterly** | QBR + Board pack | OKR score/reset, Customers & Partners deep-dive, strategy |
| **Annual** | Board / strategy | Financial health, strategic objectives, full-year OKRs |

"Refresh cadence" on each panel below is the **maximum staleness** of the data
shown, not the meeting cadence. A weekly-refresh KPI is still *reviewed* monthly
in the business review; it is simply never more than a week old.

---

## 3. Panel 1 — Revenue

Reflects the **real AdOS revenue model** only: (a) license / subscription resale
+ direct license, (b) implementation & services, (c) support / managed services,
(d) referral fees. **There is no cloud markup, no per-token, no per-seat-metered,
and no consumption/usage revenue — the product has no metering**
([../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §6.1; licensing is commercial /
contractual, not an in-product entitlement server).

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Total Recognized Revenue (contractual) | Finance ledger / ERP **[Company-owned]** | Monthly |
| ARR — contracted (license + support recurring) | CRM + contracts **[Company-owned]** | Monthly |
| Revenue by stream: License resale / Direct license / Services / Support / Referral | Finance ledger **[Company-owned]** | Monthly |
| New vs Expansion vs Renewal revenue | CRM + contracts **[Company-owned]** | Monthly |
| Net & Gross Revenue Retention (contract-based) | Finance + CRM **[Company-owned]** | Quarterly |
| Referral fees earned / paid | Partner ledger **[Company-owned]** | Monthly |

Notes: all revenue is derived from **signed contracts and invoices we own** — no
figure here is inferred from customer product usage. Services revenue delivered by
a partner is **100% partner-retained** and is *not* booked as company revenue
(consistent with the Partner and Sales references and the Constitution's revenue
vocabulary).

---

## 4. Panel 2 — Pipeline

Sales pipeline is **company-owned data** (our CRM) — legitimately measured
directly, not telemetry.

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Total Pipeline Value (weighted & unweighted) | CRM **[Company-owned]** | Weekly |
| Qualified Pipeline Coverage (× of quota) | CRM **[Company-owned]** | Weekly |
| Pipeline by stage (SQL → Proposal → Contract → Closed) | CRM **[Company-owned]** | Weekly |
| Win Rate | CRM **[Company-owned]** | Monthly |
| Average Sales Cycle (days) | CRM **[Company-owned]** | Monthly |
| Average Contract Value (ACV) | CRM **[Company-owned]** | Monthly |
| Partner-sourced vs Direct pipeline split | CRM + partner deal-reg **[Company-owned]** | Weekly |

Notes: pipeline reflects **license/services/support contracts** (the real revenue
streams). There is no "usage-based upsell" line because the product has no
metering to upsell against.

---

## 5. Panel 3 — Customers

> **⚠ Data-honesty:** Every metric on this panel that describes what happens
> **inside a customer's self-hosted AdOS is customer-reported / customer-exported
> / customer-attested.** AdOS has **no phone-home telemetry**; leadership **cannot
> auto-see inside customer instances** ([../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)
> §1.5, §2.8). Adoption, health, and usage numbers here arrive only via QBRs,
> success check-ins, surveys, and customer-run exports — never observed.

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Active Customer Accounts (contracted) | CRM / contracts **[Company-owned]** | Monthly |
| Logo Retention / Logo Churn | CRM + renewals **[Company-owned]** | Quarterly |
| Customer Health Score | Success check-ins / QBR **[Customer-reported]** | Quarterly |
| Adoption / feature-uptake (missions run, pipeline stages used) | Customer-exported usage attestation **[Customer-reported]** | Quarterly |
| Net Promoter Score (NPS) | Survey **[Customer-reported]** | Quarterly |
| Time-to-First-Value (onboarding → first mission) | Success records + customer attestation **[Customer-reported]** | Quarterly |
| Executive Sponsor Engagement | Success CRM notes **[Company-owned]** | Quarterly |
| Renewal Forecast (next 2 quarters) | CRM + success signals **[Company-owned]** blended with **[Customer-reported]** health | Monthly |

Notes: because health/adoption are **attested, not observed**, the panel shows a
**coverage indicator** — the % of active accounts that have submitted a current
attestation — so the Board can judge how complete the picture is. A green health
score from 40% coverage is weaker evidence than the same score at 90% coverage.
Renewal forecasting therefore leans first on **company-owned** contract signals
and treats customer-reported health as a modifier.

---

## 6. Panel 4 — Partners

Partner/channel program data is **company-owned** (our partner ledger, deal
registration, enablement records). Services revenue a partner delivers is
**partner-retained**; reseller discount tiers and referral fees are
**illustrative baselines** governed contractually.

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Active Partners by tier | Partner system **[Company-owned]** | Monthly |
| Partner-sourced Pipeline & Revenue | Partner deal-reg + finance **[Company-owned]** | Monthly |
| Partner-influenced Revenue | CRM attribution **[Company-owned]** | Quarterly |
| Certified Partner Practitioners (enablement) | Enablement / LMS **[Company-owned]** | Quarterly |
| Referral fees paid to partners | Partner ledger **[Company-owned]** | Monthly |
| Partner-delivered Implementations (count, satisfaction) | Partner records + **[Customer-reported]** CSAT | Quarterly |
| Partner Health / Tier movement | Partner reviews **[Company-owned]** | Quarterly |

Notes: implementation *quality* signals from customers are **[Customer-reported]**
(we do not observe delivery inside the customer's environment). Cross-references:
`../partner/*` program docs.

---

## 7. Panel 5 — Product

Tracks the **real product** — the **Enterprise AI Operating System for
Advertising** (offline-first, 100% local-AI advertising-agency platform / "Agency
OS"). It takes a client's Mission through a **human-approved pipeline** (marketing
brief → creative ad copy → campaign **draft** → performance report → executive
dashboard) and remembers what works in a marketing-performance **Company Brain**.
**It drafts; it never launches live ads.** All shipped facts trace to
[../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §2–§3.

**Shipped product KPIs (measurable today):**

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Release cadence / version shipped (SemVer, currently v1.0.0) | Release records **[Company-owned]** | Per release |
| Documentation alignment to PRODUCT_TRUTH.md (audit status) | Doc governance **[Company-owned]** | Monthly |
| Roadmap delivery vs plan (Books/features shipped) | [../ROADMAP.md](../ROADMAP.md) tracking **[Company-owned]** | Monthly |
| Feature adoption (which pipeline stages customers use) | Customer-exported attestation **[Customer-reported]** | Quarterly |
| Reported defects by severity (from customers) | Support desk **[Company-owned]** intake of **[Customer-reported]** issues | Monthly |
| Bilingual (TR/EN) coverage of shipped surfaces | Product/QA **[Company-owned]** | Per release |

**Roadmap context (NOT shipped, NOT a company metric — shown for planning only):**

The following appear on the Product panel **strictly under a Roadmap label** and
are called out so leadership never mistakes them for current capability. Each is a
**[Roadmap]** product item per [../ROADMAP.md](../ROADMAP.md) and the "unsupported /
future" sections of [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §4–§5 and
[../KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md):

| Item | Status | Where truth is documented |
|---|---|---|
| Document Q&A / cited answers over documents | **[Roadmap]** — absent today | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §2.1–§2.2 |
| "Digital Employees" / autonomous agents doing work | **[Roadmap]** — event-name stubs only | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §2.3 |
| Live ad launch / campaign optimization | **[Roadmap]** — drafts only, nothing launches | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §2.4 |
| External connectors (Meta/Google/CRM sync) | **[Roadmap]** — connector-hub is a stub | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §2.5 |
| Enforced RBAC / permission-aware AI | **[Roadmap]** — defined, never enforced | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §2.6 |
| Immutable audit trail / DB-level RLS | **[Roadmap]** — not implemented | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §2.7 |
| Cloud / hosted inference | **[Roadmap]** — flag exists, unwired | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §4 |

Notes: the Product panel's **adoption** rows are **[Customer-reported]** for the
same telemetry reason as Panel 3 — we cannot observe which features run inside a
self-hosted instance.

---

## 8. Panel 6 — Engineering

Engineering delivery data comes entirely from **company-owned** systems (our Git
repository, CI/CD, issue tracker). No customer data is involved.

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Deployment / Release Frequency | Release records + CI **[Company-owned]** | Weekly |
| Lead Time for Change | Git + CI **[Company-owned]** | Weekly |
| Change Failure Rate | CI + incident log **[Company-owned]** | Weekly |
| Mean Time to Restore (product build/CI) | Incident log **[Company-owned]** | Monthly |
| Test suite health (~64 test files / ~368 cases) & pass rate | CI **[Company-owned]** | Weekly |
| Open vs Closed engineering issues | Issue tracker **[Company-owned]** | Weekly |
| Roadmap Book/feature burn-down | [../ROADMAP.md](../ROADMAP.md) + tracker **[Company-owned]** | Monthly |

Notes: the DORA-style metrics measure **our own delivery pipeline**, distinct from
the product's campaign pipeline. Test-suite scale references
[../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §1.9.

---

## 9. Panel 7 — Quality

Quality blends **company-owned** engineering signals with **customer-reported**
field defects. Only the field-defect rows depend on customers.

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Test Pass Rate & Coverage | CI **[Company-owned]** | Weekly |
| Escaped Defects (found in the field) | Support desk intake **[Customer-reported]** issues logged **[Company-owned]** | Monthly |
| Defect density by severity (Sev1–Sev4) | Issue tracker **[Company-owned]** | Monthly |
| Regression rate release-over-release | CI + tracker **[Company-owned]** | Per release |
| Documentation-accuracy defects (claims vs PRODUCT_TRUTH.md) | Doc governance audit **[Company-owned]** | Monthly |
| Security findings open/closed | [../SECURITY_GUIDE.md](../SECURITY_GUIDE.md) process **[Company-owned]** | Monthly |

Notes: **escaped defects are reported by customers**, not detected by telemetry —
their timeliness depends on customers filing tickets. "Documentation-accuracy
defects" is a first-class quality metric here because product truthfulness (no
claiming Roadmap items as shipped) is a governed quality bar.

---

## 10. Panel 8 — Support

Support runs on **our own support desk** — company-owned — even though the tickets
originate from customers. The *ticket queue we operate* is not telemetry; the
*root-cause context inside a customer instance* is customer-reported.

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Ticket Volume (new / open / closed) | Support desk **[Company-owned]** | Weekly |
| First Response Time vs SLA | Support desk **[Company-owned]** | Weekly |
| Time to Resolution vs SLA | Support desk **[Company-owned]** | Weekly |
| SLA Attainment % | Support desk **[Company-owned]** | Monthly |
| CSAT (support interaction) | Post-ticket survey **[Customer-reported]** | Monthly |
| Escalation Rate | Support desk **[Company-owned]** | Monthly |
| Backlog age | Support desk **[Company-owned]** | Weekly |

Notes: because the product is **self-hosted and offline**, support relies on
**customer-supplied logs/exports** for diagnosis; there is no remote session or
vendor access by default. This is a support constraint, not a defect. Cross-ref:
`../customer-success/*`, [../RUNBOOK.md](../RUNBOOK.md).

---

## 11. Panel 9 — Marketing

Marketing operates entirely on **company-owned** platforms (our website analytics,
campaign tools, MAP, CRM). No customer-instance data is involved.

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Marketing Qualified Leads (MQL) | MAP / CRM **[Company-owned]** | Weekly |
| MQL → SQL Conversion | CRM **[Company-owned]** | Monthly |
| Pipeline Sourced by Marketing | CRM attribution **[Company-owned]** | Monthly |
| Cost per Lead / Cost per Opportunity | Marketing finance **[Company-owned]** | Monthly |
| Website traffic & conversion | Web analytics **[Company-owned]** | Weekly |
| Content / positioning alignment to PRODUCT_TRUTH.md | Marketing governance **[Company-owned]** | Monthly |

Notes: a dedicated **positioning-alignment** row exists because marketing must
describe the product as the **Enterprise AI Operating System for Advertising**
(the truthful framing) and must **never** claim Roadmap capabilities as shipped.
Cross-refs: `../marketing/*`, [../POSITIONING_ALIGNMENT_PLAN.md](../POSITIONING_ALIGNMENT_PLAN.md),
[../POSITIONING_GAP_ANALYSIS.md](../POSITIONING_GAP_ANALYSIS.md).

---

## 12. Panel 10 — Operations

Company operations (BizOps / People / IT) — all **company-owned**.

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Headcount vs Plan (by department) | HR system **[Company-owned]** | Monthly |
| Attrition (voluntary / regretted) | HR system **[Company-owned]** | Quarterly |
| Time-to-Hire / Open Reqs | ATS **[Company-owned]** | Monthly |
| Employee Engagement (eNPS) | Internal survey **[Company-owned]** | Quarterly |
| Business Continuity readiness (drills passed) | Continuity program **[Company-owned]** | Quarterly |
| Vendor / key-person / partner-failure risk register status | Risk register **[Company-owned]** | Quarterly |
| Release-governance gate compliance | Release process **[Company-owned]** | Per release |

Notes: continuity here is the **company/business** continuity scope (interruption,
vendor failure, partner failure, key-person, comms) — distinct from, but reusing
RTO/RPO language from, the product-side continuity docs
[../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md) and [../RUNBOOK.md](../RUNBOOK.md).

---

## 13. Panel 11 — Financial health

Financials are **company-owned** ledger/ERP data, reflecting the **real revenue
model only** — license resale + direct license, services, support, referral. **No
usage/consumption/per-token line exists anywhere** because the product has no
metering ([../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §6.1).

| KPI (see [KPI_CATALOG.md](KPI_CATALOG.md)) | Source | Refresh |
|---|---|---|
| Cash Balance & Runway (months) | Finance / ERP **[Company-owned]** | Monthly |
| Gross Margin (by stream: license / services / support) | Finance **[Company-owned]** | Monthly |
| Net Burn / Burn Multiple | Finance **[Company-owned]** | Monthly |
| Budget vs Actual (by department) | Finance **[Company-owned]** | Monthly |
| CAC & CAC Payback (contract-based) | Finance + CRM **[Company-owned]** | Quarterly |
| LTV : CAC (contract LTV, not usage) | Finance + CRM **[Company-owned]** | Quarterly |
| DSO / AR aging | Finance **[Company-owned]** | Monthly |

Notes: LTV is computed from **contractual license + support + services value**,
never from projected product usage. Referral fees flow through as a distinct
expense/revenue line consistent with Panel 1.

---

## 14. Panel 12 — Strategic objectives (OKRs)

Tracks company OKRs per the model in [OKR_FRAMEWORK.md](OKR_FRAMEWORK.md):
levels **Annual → Quarterly → Department → Personal**; Objective qualitative with
3–5 measurable Key Results; scoring **0.0–1.0** with **0.7 = target (committed vs
aspirational)**; graded at quarter close in the retrospective. OKRs are **not**
individual performance pay.

| Element shown | Source | Refresh |
|---|---|---|
| Annual Objectives & current score | [OKR_FRAMEWORK.md](OKR_FRAMEWORK.md) tracking **[Company-owned]** | Quarterly (check-in monthly) |
| Quarterly Objectives & KR progress | OKR tracker **[Company-owned]** | Monthly |
| Department OKR rollup (10 functions) | OKR tracker **[Company-owned]** | Monthly |
| KR confidence (on-track / at-risk / off-track) | Owner attestation **[Company-owned]** | Monthly |
| Cross-functional dependency / blocker flags | Exec review **[Company-owned]** | Weekly |

The ten departments rolled up here are the fixed functions from
[BUSINESS_OPERATIONS_CONSTITUTION.md](BUSINESS_OPERATIONS_CONSTITUTION.md):
Executive, Engineering, Product, Sales, Marketing, Customer Success, Partners,
Finance, Legal, Operations. Each Objective has **exactly one Accountable owner**
(RACI). Where a Key Result depends on customer-instance outcomes (e.g. an adoption
target), its data is **[Customer-reported]** and inherits the coverage caveat from
Panel 3 — it is graded on attested inputs, not observed telemetry.

---

## 15. Panel-to-cadence summary

| # | Panel | Primary data class | Fastest refresh | Deep-dive forum |
|---|---|---|---|---|
| 1 | Revenue | Company-owned | Monthly | Monthly business review |
| 2 | Pipeline | Company-owned | Weekly | Weekly exec review |
| 3 | Customers | **Customer-reported** (+ owned contract) | Monthly / Quarterly | Quarterly QBR |
| 4 | Partners | Company-owned (+ reported CSAT) | Monthly | Quarterly QBR |
| 5 | Product | Company-owned (+ reported adoption) | Per release | Monthly business review |
| 6 | Engineering | Company-owned | Weekly | Weekly exec review |
| 7 | Quality | Company-owned (+ reported defects) | Weekly / Monthly | Monthly business review |
| 8 | Support | Company-owned (+ reported CSAT) | Weekly | Weekly exec review |
| 9 | Marketing | Company-owned | Weekly | Monthly business review |
| 10 | Operations | Company-owned | Monthly | Quarterly QBR |
| 11 | Financial health | Company-owned | Monthly | Monthly + Board |
| 12 | Strategic objectives (OKRs) | Company-owned (+ reported KRs) | Monthly | Quarterly + Annual |

---

## 16. Governance of this dashboard

- **Owner / Accountable:** Office of the CEO (RACI Accountable). Panel data owners
  are the respective department heads (Consulted); the Board is Informed.
- **Definitions authority:** every KPI traces to [KPI_CATALOG.md](KPI_CATALOG.md);
  every OKR to [OKR_FRAMEWORK.md](OKR_FRAMEWORK.md). This dashboard displays them
  and must not restate a formula, target, or threshold that differs from those
  files. Conflicts resolve in favor of the KPI Catalog / OKR Framework, which in
  turn resolve in favor of [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md).
- **Change control:** changes to panel composition follow the decision framework in
  [BUSINESS_OPERATIONS_CONSTITUTION.md](BUSINESS_OPERATIONS_CONSTITUTION.md)
  (Type 1 vs Type 2; ADR where irreversible).
- **Truth guardrails (non-negotiable):**
  1. No panel may present a **[Customer-reported]** number as observed/telemetry.
  2. No **[Roadmap]** product item may be shown as shipped or as a live company
     metric.
  3. No financial line may imply usage/consumption/per-token revenue.
  4. The "Product" panel always distinguishes shipped capability from Roadmap.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
