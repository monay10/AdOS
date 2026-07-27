# Business Operations Constitution

> **Owner:** Office of the COO · **Status:** Official — aligned to PRODUCT_TRUTH.md · **Version 1.0.0** · **Aligned to AdOS v1.0.0** · **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

This document is the **governing charter for operating the AdOS business**. Every other
Business Operations (BizOps) document — planning, decision, KPI, OKR, risk, release, and
continuity docs in this package — conforms to it. Where any BizOps document conflicts with
this Constitution, this Constitution prevails. Where this Constitution conflicts with
[`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md) on any statement about the **product**,
`PRODUCT_TRUTH.md` prevails without exception.

This is a **company/business** governance document. It operates one level above the product:
the product is AdOS; this Constitution governs the organization that builds, sells, supports,
and partners around it. It is not product documentation and is not a product feature.

---

## 1. Purpose & Scope

### 1.1 Purpose

The Business Operations Constitution exists to make the way AdOS is run **predictable,
truthful, and repeatable**. It fixes: how the company is organized, how it decides, how it
plans and reviews, how it governs risk and change, and how each business function (product,
finance, sales, marketing, customer, partner, documentation, release) is held to a single,
consistent standard.

### 1.2 Scope

| In scope | Out of scope |
|---|---|
| Company operating principles, decision rights, org philosophy | Product feature specification (see product docs) |
| Planning cadence, reviews, OKRs, KPIs (governed here, defined in sibling docs) | Day-to-day engineering task management |
| Governance of product, finance, sales, marketing, customer, partner functions | Individual compensation and performance pay |
| Risk, change, release, and continuity **of the business** | Product disaster recovery (see [`../DISASTER_RECOVERY.md`](../DISASTER_RECOVERY.md), [`../RUNBOOK.md`](../RUNBOOK.md)) |

### 1.3 The one non-negotiable

Everything the company says about the product externally or internally must trace to
[`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Any capability not present there is **not shipped**
and may appear only under an explicit **Roadmap** label, cross-referenced to
[`../ROADMAP.md`](../ROADMAP.md). No KPI, dashboard, OKR, or commitment may measure or promise a
capability the product does not have today.

---

## 2. The Product We Govern (truthful framing)

The business exists to build and sell one product. Stated verbatim for consistency across all
BizOps docs:

> **AdOS — Enterprise AI Operating System for Advertising** (an offline-first, 100% local-AI
> advertising-agency platform / "Agency OS"). It takes a client's advertising objective (a
> **Mission**) through a **human-approved pipeline** — marketing brief → creative (ad copy) →
> campaign **draft** → performance report → executive dashboard — and remembers what works in a
> marketing-performance **Company Brain**. It **drafts**; it never launches live ads.

### 2.1 What is true today (may be stated as shipped)

- **100% local / offline-capable AI.** No cloud, no API keys, no per-token billing, air-gap
  capable. Default engine is the deterministic OfflineAIManager (no model server); optional
  local Ollama or OpenAI-compatible local server for genuine model prose.
- **Human-approved pipeline.** Every stage needs a human approval click. Gates:
  `strategy_and_budget`, `creative_assets`, `campaign_launch`.
- **Creative = ad copy only.** The campaign draft carries channels / ad sets / budget split and
  **never leaves `draft`**. Deterministic ad KPIs (CTR/CPC/CPA/CPL/ROAS/ROI), **hand-entered**
  (no ad-platform ingestion).
- **Company Brain** = marketing-performance memory. Not a document library.
- **Application-level multi-tenant isolation.** Real auth (Argon2id, HMAC sessions, CSRF,
  brute-force lockout, CSP/HSTS). Optional SQLite/Postgres persistence (opt-in via
  `DATABASE_URL`; in-memory default). Backup / recovery / deploy / monitoring packages exist and
  are tested. Activity log + per-approval timeline (not an immutable audit trail). Bilingual TR/EN.
- **Deployment model = customer self-hosts** (own infra / on-prem / private). There is no vendor
  cloud.

### 2.2 Roadmap-only — never stated as shipped, never measured as a company metric

The following are **product-Roadmap** items (see [`../ROADMAP.md`](../ROADMAP.md)) and appear in
BizOps material only under an explicit Roadmap label. They are **forbidden** as present-tense
product capability and may never be the subject of a company KPI or dashboard today:

document Q&A / cited answers; "Digital Employees" / autonomous agents; live ad launch or
optimization; external connectors/syncs (Meta/Google/CRM); enforced RBAC / permission-aware AI;
immutable audit trail; DB-level row-level security; cloud/SaaS/hosted inference;
vision/speech/image/video AI; tiered T0–T4 approval authority; "real AI prose out of the box."

### 2.3 The self-hosting consequence (binding on all metrics)

Because AdOS is self-hosted and offline, the company has **no vendor telemetry, no phone-home,
and no standing access** to any customer's running instance. Therefore every KPI, health metric,
dashboard, or OKR that depends on **customer-instance** data must be labelled
**customer-reported / customer-exported / customer-attested** — never "auto-collected",
"telemetry", "we observe", or "the platform reports back." Company-internal data the company
legitimately owns (its own CRM/pipeline, finance, HR, code repository, its own support desk) may
be measured directly and is not vendor telemetry.

---

## 3. Company Operating Principles

These principles are the tie-breakers when documents, teams, or trade-offs disagree.

1. **Truth over narrative.** Every external and internal claim traces to
   [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Aspirations are labelled Roadmap. We do not sell,
   market, or plan against capabilities we have not shipped.
2. **One Accountable per decision.** Ambiguous ownership is a defect. Every decision names exactly
   one Accountable owner (see §5).
3. **Reversible fast, irreversible slow.** Type 2 (reversible) decisions are delegated and made
   quickly; Type 1 (irreversible) decisions are deliberate, documented, and escalated (see §5.2).
4. **Customer sovereignty.** The customer owns their instance and their data. We design the
   business around a product that does not depend on reaching into customer environments.
5. **Cadence over heroics.** The business runs on a fixed operating rhythm (§7). Predictable
   reviews beat ad-hoc firefighting.
6. **Written decisions.** Type 1 decisions and material changes are recorded as ADRs
   (Architecture & Business Decision Records) so the reasoning survives the people.
7. **Partner-respecting economics.** Where a partner delivers, services revenue is partner-retained
   (§10). We do not compete with our channel on the work we asked them to do.
8. **No metering, no surprise billing.** The product has no consumption meter; the business model
   never invents one. Pricing is contractual and transparent (§10).
9. **Consistency across functions.** Sales, Marketing, Customer Success, and Partners speak with one
   voice, anchored to the same product truth and the same vocabulary defined here.
10. **Improve the system, not just the outcome.** Retrospectives feed the cadence; recurring issues
    become process or Roadmap changes, not repeated exceptions.

---

## 4. Organizational Philosophy & Departments

### 4.1 Philosophy

AdOS is organized as a **small number of clearly-accountable functions** rather than a deep
hierarchy. Each function has a single accountable owner (C-level or lead), a defined mandate, and a
seat in the operating rhythm. Strategy is aligned **top-down** (annual → quarterly → department →
personal OKRs) and drafted **bottom-up**. Functions coordinate through the cadence in §7 and the
decision framework in §5, not through standing cross-functional committees.

### 4.2 The ten departments this Constitution governs

| # | Department / function | Single accountable owner | Primary mandate |
|---|---|---|---|
| 1 | **Executive** (CEO office) | CEO | Strategy, capital, final Type 1 authority, company OKRs |
| 2 | **Engineering** | Eng lead / CTO | Builds and maintains AdOS; release engineering |
| 3 | **Product** | Product lead / CPO | Product truth, roadmap discipline, prioritization |
| 4 | **Sales** | Sales lead | Pipeline, licensing/resale deals, forecast |
| 5 | **Marketing** | Marketing lead | Positioning, demand, truthful messaging |
| 6 | **Customer Success** | CS lead | Onboarding, adoption, support, retention |
| 7 | **Partners** (Partner/Channel) | Partner lead | Reseller & implementation channel, certification |
| 8 | **Finance** | CFO / Finance lead | Revenue, budget, forecast, financial controls |
| 9 | **Legal** | Legal lead | Contracts, licensing terms, compliance, IP |
| 10 | **Operations** (BizOps/People/IT) | COO / Ops lead | Cadence, decisions, risk, people, internal IT |

Each department owns its own KPI rows in the shared KPI catalog (grouped by department, with an
Executive rollup) and its own risks in the risk register. Existing function packages this
Constitution governs:
[`../sales/SALES_KIT_CONSTITUTION.md`](../sales/SALES_KIT_CONSTITUTION.md),
[`../marketing/MARKETING_CONSTITUTION.md`](../marketing/MARKETING_CONSTITUTION.md),
[`../customer-success/CUSTOMER_SUCCESS_CONSTITUTION.md`](../customer-success/CUSTOMER_SUCCESS_CONSTITUTION.md),
[`../partner/PARTNER_PROGRAM_CONSTITUTION.md`](../partner/PARTNER_PROGRAM_CONSTITUTION.md).

---

## 5. Decision Making

### 5.1 Decision rights — RACI

Every significant decision is expressed with a **RACI** assignment. There is **exactly one
Accountable** per decision; Responsible may be several; Consulted and Informed are explicit.

| Role | Meaning | Rule |
|---|---|---|
| **R — Responsible** | Does the work to reach and execute the decision | One or more people |
| **A — Accountable** | Owns the outcome; the final yes/no | **Exactly one** — never zero, never two |
| **C — Consulted** | Provides input before the decision | Two-way, before |
| **I — Informed** | Told of the decision and outcome | One-way, after |

Illustrative RACI for common decisions:

| Decision | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Ship a product release | Engineering | Product lead | CS, Sales, Marketing | All departments |
| Change public product positioning | Marketing | Marketing lead | Product, Legal, Sales | Executive, Partners |
| Sign a reseller/partner agreement | Partners | Partner lead | Legal, Finance | Executive |
| Set quarterly price/discount baselines | Finance | CFO | Sales, Partners | Executive |
| Accept/close a company risk | Risk owner | COO | Affected dept lead | Executive |
| Approve annual budget | Finance | CEO | All dept leads | All departments |

### 5.2 Decision classes — Type 1 vs Type 2

| Attribute | **Type 1 — irreversible / high-impact** | **Type 2 — reversible** |
|---|---|---|
| Reversibility | Hard or costly to undo | Cheap to undo |
| Examples | Pricing model, brand/positioning change, major partner terms, capital commitments, product-truth changes | Copy edits, experiment choices, tactical campaign changes, internal tooling |
| Authority | Executive; documented as an **ADR** | Delegated to the Accountable owner |
| Speed | Deliberate; slow is fine | Fast; bias to action |
| Record | Mandatory ADR (`ADR-NNNN`) | Lightweight note; ADR optional |

Misclassifying a Type 2 as Type 1 wastes time; misclassifying a Type 1 as Type 2 creates risk. When
unsure, treat the decision as Type 1.

### 5.3 Architecture & Business Decision Records (ADR)

Type 1 decisions and material business changes are recorded as ADRs. ID format **ADR-NNNN**;
lifecycle **Proposed → Accepted → Superseded → Deprecated**. The ADR format and index are defined in
the sibling `ADR_GUIDE.md` in this package. An ADR captures context, the decision, alternatives
considered, and consequences.

---

## 6. Business Lifecycle

The business runs a repeating lifecycle that the cadence in §7 keeps in motion:

| Stage | What happens | Primary owners | Governing artifact |
|---|---|---|---|
| **1. Strategy** | Annual direction, market thesis, capital plan | Executive, Finance | Annual plan + annual OKRs |
| **2. Plan** | Translate strategy into quarterly/department OKRs and budget | All departments | Quarterly OKRs, KPI catalog |
| **3. Build** | Engineering & Product ship against Roadmap discipline | Engineering, Product | [`../ROADMAP.md`](../ROADMAP.md), release governance |
| **4. Release** | Versioned build + docs + GTM alignment to self-hosting customers/partners | Product, Eng, Marketing | Release governance (§16) |
| **5. Sell** | Licensing/resale, services, support, referral | Sales, Partners | Sales & partner packages |
| **6. Serve** | Onboarding, adoption, support, retention | Customer Success, Partners | CS package |
| **7. Measure** | KPI scorecard, OKR scoring, forecast | Finance, all departments | KPI catalog, OKR docs |
| **8. Improve** | Retrospectives feed strategy, risk, and Roadmap | All departments | Reviews (§8), risk register (§9) |

Each turn of the lifecycle produces evidence (KPI results, OKR scores, ADRs, risk updates) that
feeds the next.

---

## 7. Planning Cadence & Operating Rhythm

The business runs on a **fixed** four-tier rhythm. Every department participates at every tier.

| Cadence | Focus | Owner of the forum | Primary output |
|---|---|---|---|
| **Weekly** | Operational review | Ops (COO) | This-week actions, unblocked items |
| **Monthly** | Business review | Finance + department leads | KPI scorecard, OKR check-in, forecast |
| **Quarterly** | QBR + OKRs + risk | Executive | Scored OKRs, next-quarter OKRs, risk review |
| **Annual** | Strategy + plan + budget | CEO | Strategy, annual OKRs, budget, full risk review |

### 7.1 OKR model (governs all OKR docs in this package)

- Levels: **Annual → Quarterly → Department → Personal** (aligned top-down, drafted bottom-up).
- Each Objective is qualitative with **3–5 measurable Key Results**.
- Scoring **0.0–1.0**; **0.7 = target** (committed vs aspirational); graded at quarter close in the
  retrospective. OKRs are **not** individual performance pay.

### 7.2 KPI catalog schema (governs the KPI catalog doc)

Every KPI row carries all of: **Name · Formula/Definition · Frequency · Owner (department) ·
Target · Warning threshold · Critical threshold · Source.** Where a KPI relies on customer-instance
data, **Source = customer-reported** (§2.3). KPIs are grouped by department (§4.2) with an Executive
rollup.

---

## 8. Reviews (what each covers)

### 8.1 Weekly review — operational

- **Covers:** current-week metrics vs target, blockers, this-week commitments, incident follow-ups.
- **Horizon:** the week. **Output:** a short list of owned, dated actions.
- **Rule:** operational only; strategy and Type 1 decisions are escalated, not resolved here.

### 8.2 Monthly review — business

- **Covers:** the full KPI catalog scorecard, OKR check-in (are we on pace for 0.7?), rolling
  financial forecast, pipeline and retention trends (customer-reported where applicable).
- **Horizon:** the quarter-to-date. **Output:** corrective actions, forecast update, escalations.

### 8.3 Quarterly review — QBR

- **Covers:** scoring the closing quarter's OKRs and running the retrospective; setting next
  quarter's OKRs; **risk-register review** (§9); reseller/partner tier reviews; customer-health
  review (customer-reported).
- **Horizon:** the year-to-date and next quarter. **Output:** scored OKRs, new OKRs, updated risk
  register, tier/partner decisions.

### 8.4 Annual planning

- **Covers:** company strategy, annual OKRs, annual operating plan and budget, and a **full** risk
  review. Confirms product Roadmap direction with Product/Engineering (against
  [`../ROADMAP.md`](../ROADMAP.md)).
- **Horizon:** the coming year (with a multi-year thesis). **Output:** strategy narrative, annual
  OKRs, approved budget, refreshed risk register, and any Type 1 ADRs the plan requires.

---

## 9. Risk Governance

Company risk is governed through a single **risk register** (the sibling `RISK_REGISTER.md` in this
package). It is reviewed every quarter (§8.3) and fully refreshed annually (§8.4).

### 9.1 Risk register schema

Every risk row carries: **ID (RISK-NNNN) · Category · Description · Probability (Low/Med/High or
1–5) · Impact (Low/Med/High or 1–5) · Score · Mitigation · Owner · Status
(Open/Mitigating/Accepted/Closed) · Review cycle.**

### 9.2 Categories

**Strategic · Financial · Operational · Technical · Security · Legal · Market · Competition.**

### 9.3 Product-shape risks stated truthfully

Because the product is offline and self-hosted, some business risks follow directly from the product
model and must be recorded honestly rather than wished away. Examples:

| Example risk | Category | Why it is real |
|---|---|---|
| No vendor telemetry limits early warning on churn/health | Operational | Customer-instance data is customer-reported only (§2.3) |
| Adoption inside a customer instance is unobservable to us | Operational / Market | Self-hosted; we rely on customer attestation |
| GTM materials may overstate Roadmap items as shipped | Strategic / Legal | Truth discipline (§3.1) is a control, not a guarantee |
| No consumption billing limits expansion-revenue signals | Financial | Revenue is contractual, not metered (§10) |

Risk owners are named per §4.2; accepting or closing a risk is a decision with a RACI (§5.1) and, if
Type 1, an ADR.

---

## 10. Financial Governance

### 10.1 Revenue model

AdOS revenue comes from **four streams only**:

| Stream | Description |
|---|---|
| **(a) License / subscription resale + direct license** | Commercial, contractual licensing — direct or via resellers |
| **(b) Implementation & services** | Deployment, configuration, training, integration work |
| **(c) Support / managed services** | Ongoing support and managed-service agreements |
| **(d) Referral fees** | Fees for referred, closed business |

**There is no cloud markup, no per-token, no per-seat-metered, and no consumption billing** — the
product has no metering. Licensing is **commercial/contractual**, not an in-product
entitlement/enforcement server (that capability is Roadmap-only; see §2.2). Any financial KPI must
respect this: no "usage revenue," no "consumption ARR."

### 10.2 Commercial baselines

Reseller discount tiers and referral-fee levels are **illustrative baselines** and must be marked as
such in commercial documents. Where a partner delivers services, services revenue is **100%
partner-retained** (§4.7 vocabulary; consistent with the partner and sales packages).

### 10.3 Financial controls

Finance owns the budget (approved annually, §8.4), the rolling forecast (updated monthly, §8.2), and
revenue recognition consistent with the contractual model above. Capital commitments and pricing-model
changes are **Type 1** decisions requiring an ADR (§5.2).

---

## 11. Product Governance

Product governance protects the single source of truth.

- The product is the **Enterprise AI Operating System for Advertising** as defined in §2 and
  [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Product lead is Accountable for keeping every
  business statement about the product aligned to it.
- **Roadmap discipline:** any capability on the forbidden/Roadmap list (§2.2) may be discussed only
  under an explicit Roadmap label and traced to [`../ROADMAP.md`](../ROADMAP.md). It may never be
  represented as shipped, and never measured as a current company metric.
- Changes to product truth (what the product *is*) are **Type 1** and require an ADR plus downstream
  reconciliation across Sales, Marketing, Customer Success, and Partner materials.
- Prioritization runs through the cadence (§7); Product presents Roadmap status at monthly and
  quarterly reviews.

---

## 12. Sales Governance

- Governs the sales package: [`../sales/SALES_KIT_CONSTITUTION.md`](../sales/SALES_KIT_CONSTITUTION.md)
  and its assets (brochure, one-pager, proposal template, ROI calculator, FAQ, objection handling).
- **Truthful selling:** sales materials describe only shipped capability (§2.1). ROI and value claims
  must not rely on Roadmap items or on data the company cannot see in a self-hosted instance; any
  outcome figures are **customer-reported** (§2.3).
- **Commercial consistency:** deals use the four-stream revenue model (§10) and the illustrative
  baselines; no consumption/metered pricing may be quoted.
- **Forecast** is reviewed monthly (§8.2); pipeline is company-owned CRM data (directly measurable).

---

## 13. Marketing Governance

- Governs the marketing package:
  [`../marketing/MARKETING_CONSTITUTION.md`](../marketing/MARKETING_CONSTITUTION.md) and its assets
  (website, blog, press kit, launch campaign, LinkedIn, SEO).
- **Positioning is anchored** to the verbatim product framing (§2) and to
  [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). The prohibited phrasing "Advertising Operating
  System" / "Reklam İşletim Sistemi" is used **only** inside an explicit do-not-say clause.
- **No overstatement:** Roadmap capabilities (§2.2) appear only under a Roadmap label; no messaging
  implies telemetry, cloud, live ad launch, document Q&A, Digital Employees, or enforced RBAC as
  shipped.
- Positioning changes are **Type 1** (ADR) and must be reconciled with Sales, Partners, and Product.

---

## 14. Customer Governance

- Governs the customer-success package:
  [`../customer-success/CUSTOMER_SUCCESS_CONSTITUTION.md`](../customer-success/CUSTOMER_SUCCESS_CONSTITUTION.md),
  including onboarding, support, training, and
  [`../customer-success/CUSTOMER_HEALTH.md`](../customer-success/CUSTOMER_HEALTH.md).
- **Self-hosted reality:** the company cannot auto-observe a customer's instance. Health, adoption,
  and usage signals are **customer-reported / customer-exported / customer-attested** (§2.3) — never
  described as telemetry or auto-collected.
- The company's own support desk, ticket queue, and CS pipeline are company-internal data and may be
  measured directly.
- Customer-health and retention are reviewed monthly (trend) and quarterly (in depth, §8.3).

---

## 15. Partner Governance

- Governs the partner package:
  [`../partner/PARTNER_PROGRAM_CONSTITUTION.md`](../partner/PARTNER_PROGRAM_CONSTITUTION.md) and
  [`../partner/PARTNER_OPERATIONS.md`](../partner/PARTNER_OPERATIONS.md), including certification,
  agreements, and toolkit.
- **Economics:** reseller discount and referral baselines are illustrative (§10.2); where a partner
  delivers services, services revenue is **100% partner-retained**.
- **Consistency:** partners represent the product using the same truthful framing (§2); partner
  materials are subject to the same Roadmap discipline (§2.2).
- Partner tiers and agreements are reviewed quarterly (§8.3); signing/altering partner terms is a
  **Type 1** decision (ADR, RACI in §5.1).

---

## 16. Release Governance

- Governs product and documentation releases; detailed procedure lives in the sibling
  `RELEASE_GOVERNANCE.md` in this package.
- **Versioning:** Semantic Versioning (MAJOR.MINOR.PATCH). Current product line = **AdOS v1.0.0**.
- **What a release is:** a **versioned build + docs + GTM alignment**, distributed to self-hosting
  customers and partners. It is **not** a cloud deploy that reaches customers automatically. Customer
  and partner notification (email/changelog) is a **communication** step, not an auto-push.
- **Truthful release notes:** release notes describe only what shipped; Roadmap items are labelled as
  such. Docs, Sales, Marketing, Partner, and Customer materials are aligned as part of the release,
  not after it.
- **Gates & rollback:** branch model, approval gates, release checklist, rollback, hotfix, and
  emergency-release procedures are defined in the release-governance sibling doc.

---

## 17. Documentation Governance

- **Traceability:** every business document that states something about the product traces to
  [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Documents that cannot trace a claim must relabel it as
  Roadmap or remove it.
- **Roadmap discipline:** forbidden/Roadmap capabilities (§2.2) appear only under a Roadmap heading,
  referenced to [`../ROADMAP.md`](../ROADMAP.md).
- **Consistency:** all BizOps docs use the shared vocabulary defined in this Constitution
  (departments §4.2, cadence §7, decisions §5, KPI schema §7.2, risk schema §9.1, revenue §10). If a
  doc and this Constitution disagree, this Constitution governs.
- **Cross-references** use exact relative paths to real repo files. Documents that describe business
  continuity reuse the existing product-side continuity docs where relevant
  ([`../DISASTER_RECOVERY.md`](../DISASTER_RECOVERY.md), [`../RUNBOOK.md`](../RUNBOOK.md)) but keep
  the **business**-continuity scope (vendor/partner/key-person/comms) distinct from product DR.

---

## 18. Change Management

Change management keeps the company consistent when something material changes (a product-truth
change, a pricing change, a positioning change, a partner-terms change, a reorg).

| Step | Action | Owner |
|---|---|---|
| **1. Classify** | Type 1 or Type 2 (§5.2)? Who is Accountable (§5.1)? | Proposer |
| **2. Record** | Type 1 → ADR (`ADR-NNNN`, Proposed) | Accountable |
| **3. Assess** | Impact on risk register (§9), KPIs, and dependent docs | Risk owner + affected leads |
| **4. Decide** | Accept/reject; ADR → Accepted | Accountable |
| **5. Reconcile** | Update every dependent document (Sales, Marketing, CS, Partner, Product, Docs) | Affected department leads |
| **6. Communicate** | Inform per RACI; notify customers/partners where relevant (communication, not auto-push) | Owning department |
| **7. Verify** | Confirm reconciliation complete at the next review (§8) | COO |

Product-truth changes trigger a **full reconciliation sweep** across all GTM and BizOps documents,
because the source of truth has moved.

---

## 19. Governance of this Constitution

- **Owner:** Office of the COO. **Reviewed:** at least annually (§8.4) and whenever a Type 1 change
  affects company operating principles, decision rights, or governance.
- **Amendment:** changes to this Constitution are **Type 1** decisions requiring an ADR; version is
  bumped per Semantic Versioning.
- **Precedence:** on the product, [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md) always wins; on
  business operating rules, this Constitution wins over other BizOps docs.
- **Alignment:** this version is aligned to **AdOS v1.0.0**.

---

*Documentation only. No application code, packages, domains, or tests were modified. Aligned to PRODUCT_TRUTH.md.*
