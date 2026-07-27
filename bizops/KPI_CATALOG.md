# AdOS — Official KPI Catalog

**Owner:** Office of the CFO
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

---

## 0. Purpose and scope

This catalog is the single, authoritative list of Key Performance Indicators (KPIs)
used to run the **AdOS company** — the organization that builds, licenses, and
supports AdOS. It governs the *business*, not the product. The product itself is
described only in [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md); this document never
promises a product capability that file does not substantiate.

Governance for how KPIs are defined, reviewed, and changed lives in the
`BUSINESS_OPERATIONS_CONSTITUTION.md`. This catalog implements the KPI schema
mandated there: **every** KPI row defines **all** of the following fields, with no
blanks:

> **Name · Formula / Definition · Frequency · Owner (department) · Target ·
> Warning threshold · Critical threshold · Source.**

KPIs are grouped by department: **Engineering, Sales, Marketing, Support, Customer
Success, Partner, Finance, Operations**, plus an **Executive rollup**. Related
company-operations documents in this package (planning cadence, OKR model, risk
register, release governance) reuse the same department names and the same metric
definitions given here.

### 0.1 The truth boundary — company data vs. customer-instance data

AdOS is **self-hosted, offline-capable, and has no phone-home**: there is no vendor
telemetry, no standing vendor access, and no metering inside a customer's instance
([`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md) §1.5, §2.8, §6.1;
[`../KNOWN_LIMITATIONS.md`](../KNOWN_LIMITATIONS.md)). This splits every KPI into two
classes, and the **Source** field makes the class explicit:

- **Company-internal KPIs** — measured directly from a system the company owns and
  operates (its own CRM, billing/ERP, git host and CI, its own support desk, HR/IT
  systems). These are legitimate to measure and are *not* vendor telemetry.
- **Customer-instance KPIs** — anything that depends on what happens *inside a
  customer's self-hosted AdOS* (their adoption, usage, active users, campaign volume,
  in-product health). The company **cannot auto-collect** these. Their **Source** is
  always **customer-reported / customer-exported / customer-attested** — obtained via
  onboarding questionnaires, QBR check-ins, CSM-logged conversations, support tickets,
  or a customer voluntarily exporting a report from their instance. Such rows below
  are marked with the tag **`[CUST]`** next to the KPI name.

Any dashboard or scorecard built from this catalog must preserve that distinction.
A `[CUST]` KPI is an *estimate assembled from customer disclosure*, never a
platform-observed fact, and it carries the coverage risk noted in §10.

### 0.2 Revenue model this catalog assumes

Finance KPIs reflect the **only** revenue model AdOS uses (per
[`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md) and the commercial vocabulary shared
across `../sales/*` and `../partner/*`):

1. **License resale + direct license** — margin on reselling / directly selling AdOS
   commercial licenses.
2. **Implementation & professional services** — installation, configuration,
   onboarding, integration-into-workflow engagements.
3. **Support & managed services** — annual support contracts and optional
   managed-operations retainers.
4. **Referral fees** — partner-sourced referral commissions.

There is **no** usage/consumption revenue, **no** per-token or per-seat metered
billing, and **no** cloud markup — the product has no metering and there is no vendor
cloud. No KPI in this catalog derives revenue from consumption. Licensing is
**commercial/contractual**, not an in-product entitlement server (that remains
Roadmap; see §11).

### 0.3 Threshold convention

All **Target / Warning / Critical** numbers are **illustrative baselines** for
v1.0.0 planning. They are directional, set for calibration in the first operating
year, and are re-baselined at the annual planning cycle. Read the direction from the
metric: for "higher is better" metrics, Warning/Critical sit *below* Target; for
"lower is better" metrics (defects, latency, churn), they sit *above* Target.

- **Target** — the committed operating level.
- **Warning** — trigger a review in the weekly/monthly operating rhythm.
- **Critical** — trigger escalation to the accountable owner and, for Executive
  rollup metrics, to the CEO office.

Frequencies use the fixed operating rhythm: **Weekly, Monthly, Quarterly, Annual.**

---

## 1. Engineering

Company-internal. Measured directly from the code host, CI/CD, issue tracker, and
release records. No customer-instance data is required for any Engineering KPI.

| # | Name | Formula / Definition | Frequency | Owner | Target | Warning | Critical | Source |
|---|------|----------------------|-----------|-------|--------|---------|----------|--------|
| ENG-01 | Test suite pass rate | Passing test cases ÷ total test cases on `main`, per CI run | Weekly | Engineering | ≥ 99% | 95–99% | < 95% | CI system (internal) |
| ENG-02 | Test suite size | Count of automated test cases maintained (baseline ~368 across ~64 files) | Monthly | Engineering | ≥ 368 | 330–367 | < 330 | Test runner / repo (internal) |
| ENG-03 | CI pipeline success rate | Green pipeline runs ÷ total pipeline runs | Weekly | Engineering | ≥ 90% | 80–89% | < 80% | CI system (internal) |
| ENG-04 | Mean CI duration | Avg wall-clock time from push to pipeline result | Weekly | Engineering | ≤ 10 min | 10–20 min | > 20 min | CI system (internal) |
| ENG-05 | Escaped defect count | Defects reported post-release that bypassed tests, per release | Monthly | Engineering | ≤ 2 | 3–5 | > 5 | Issue tracker (internal) |
| ENG-06 | Mean time to resolve (MTTR) critical bug | Avg hours from triage-as-critical to merged fix | Monthly | Engineering | ≤ 24 h | 24–72 h | > 72 h | Issue tracker (internal) |
| ENG-07 | PR review lead time | Median hours from PR open to merge | Weekly | Engineering | ≤ 24 h | 24–72 h | > 72 h | Code host (internal) |
| ENG-08 | Release cadence adherence | Releases shipped on the planned SemVer schedule ÷ planned releases | Quarterly | Engineering | ≥ 90% | 75–89% | < 75% | Release records (internal) |
| ENG-09 | Security-scan clean rate | Builds passing dependency + SAST scans with no High/Critical finding ÷ builds | Weekly | Engineering | ≥ 98% | 90–97% | < 90% | Security tooling (internal) |
| ENG-10 | Documentation currency | Shipped features whose docs updated same release ÷ shipped features | Quarterly | Engineering | 100% | 85–99% | < 85% | Repo docs review (internal) |
| ENG-11 | Offline/air-gap build verification | Release builds verified installable with zero network egress ÷ releases | Quarterly | Engineering | 100% | (any miss) | < 100% for 2 releases | Release QA (internal) |

| ENG-12 | Migration forward-only integrity | Releases whose DB migrations are forward-only and reversible-by-restore ÷ releases | Quarterly | Engineering | 100% | (any exception) | < 100% | Migration review (internal) |
| ENG-13 | Deterministic-default verification | Releases confirming the default AI path is deterministic (OfflineAIManager, no network) ÷ releases | Quarterly | Engineering | 100% | (any miss) | < 100% for 2 releases | Release QA (internal) |

**Notes.** ENG-11 and ENG-13 protect the core product promise (100% local,
air-gap capable, deterministic default — [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)
§6.1, §5.9). Engineering KPIs never measure a customer's running instance;
deployment-health of a *customer* environment is a Customer Success `[CUST]` metric
(see §5). Persistence and migration behavior referenced by ENG-12 is opt-in and
documented in [`../DEPLOYMENT.md`](../DEPLOYMENT.md) and
[`../UPGRADE_GUIDE.md`](../UPGRADE_GUIDE.md).

---

## 2. Sales

Company-internal. Measured from the company's own CRM and signed-contract records.
"Pipeline", "bookings", and "win rate" refer to the *company's* sales funnel, not any
customer-instance data.

| # | Name | Formula / Definition | Frequency | Owner | Target | Warning | Critical | Source |
|---|------|----------------------|-----------|-------|--------|---------|----------|--------|
| SAL-01 | New qualified pipeline created | Sum of new SQL opportunity value entering pipeline in period | Monthly | Sales | ≥ 3× quota gap | 2–3× | < 2× | CRM (internal) |
| SAL-02 | Pipeline coverage ratio | Open pipeline value ÷ period bookings target | Monthly | Sales | ≥ 3.0× | 2.0–2.9× | < 2.0× | CRM (internal) |
| SAL-03 | Win rate | Closed-won opps ÷ (closed-won + closed-lost) | Quarterly | Sales | ≥ 25% | 18–24% | < 18% | CRM (internal) |
| SAL-04 | New license bookings | Signed new license contract value (resale + direct) in period | Monthly | Sales | ≥ plan | 85–99% of plan | < 85% of plan | Signed contracts (internal) |
| SAL-05 | Services attach rate | New deals including an implementation/services SOW ÷ new deals | Quarterly | Sales | ≥ 70% | 50–69% | < 50% | CRM + SOW records (internal) |
| SAL-06 | Average deal size | Total new booking value ÷ number of new deals | Quarterly | Sales | ≥ baseline | 80–99% of baseline | < 80% of baseline | CRM (internal) |
| SAL-07 | Sales cycle length | Median days from SQL to closed-won | Quarterly | Sales | ≤ 90 days | 90–120 days | > 120 days | CRM (internal) |
| SAL-08 | Quota attainment (team) | Bookings ÷ assigned quota, team-weighted | Quarterly | Sales | ≥ 100% | 80–99% | < 80% | CRM (internal) |
| SAL-09 | Partner-sourced bookings share | Bookings from partner-referred deals ÷ total bookings | Quarterly | Sales | ≥ 30% | 15–29% | < 15% | CRM + partner records (internal) |
| SAL-10 | Forecast accuracy | 1 − |forecast − actual| ÷ actual, for the committed forecast | Monthly | Sales | ≥ 90% | 80–89% | < 80% | CRM forecast vs actuals (internal) |
| SAL-11 | Discount discipline | Deals within approved reseller discount band ÷ total deals | Quarterly | Sales | ≥ 90% | 75–89% | < 75% | CRM + pricing policy (internal) |

**Notes.** Discount bands referenced by SAL-11 are the **illustrative baseline**
reseller tiers defined in `../sales/*` and `../partner/*`; they are contractual, not
in-product entitlements. Sales does not measure whether a signed customer *uses* the
product — that is Customer Success (`[CUST]`, §5).

---

## 3. Marketing

Company-internal. Measured from the company's own website analytics, marketing
automation, ad accounts, and CRM. **Important:** these metrics describe the AdOS
company's *own* demand-generation activity. They must not be confused with the ad
KPIs the *product* computes for a customer's campaign (CTR/CPC/CPA/CPL/ROAS/ROI are a
product feature, hand-entered inside the customer's instance — not a company KPI).

| # | Name | Formula / Definition | Frequency | Owner | Target | Warning | Critical | Source |
|---|------|----------------------|-----------|-------|--------|---------|----------|--------|
| MKT-01 | Marketing qualified leads (MQLs) | Count of leads meeting the MQL scoring bar in period | Monthly | Marketing | ≥ plan | 80–99% of plan | < 80% of plan | Marketing automation (internal) |
| MKT-02 | MQL → SQL conversion | SQLs accepted ÷ MQLs delivered | Monthly | Marketing | ≥ 30% | 20–29% | < 20% | CRM (internal) |
| MKT-03 | Marketing-sourced pipeline | Pipeline value attributable to marketing-originated leads | Monthly | Marketing | ≥ 40% of new pipeline | 25–39% | < 25% | CRM attribution (internal) |
| MKT-04 | Cost per MQL | Marketing program spend ÷ MQLs generated | Monthly | Marketing | ≤ baseline | 100–130% of baseline | > 130% of baseline | Ad accounts + finance (internal) |
| MKT-05 | Website conversion rate | Demo/contact requests ÷ unique site visitors | Monthly | Marketing | ≥ 2.5% | 1.5–2.4% | < 1.5% | Web analytics (internal) |
| MKT-06 | Content engagement | Avg qualified content actions (download/watch) per campaign asset | Monthly | Marketing | ≥ baseline | 70–99% of baseline | < 70% of baseline | Web/marketing analytics (internal) |
| MKT-07 | Positioning-message consistency | Public assets using the approved truthful one-liner ÷ audited assets | Quarterly | Marketing | 100% | 90–99% | < 90% | Content audit vs PRODUCT_TRUTH.md (internal) |
| MKT-08 | Demand-gen ROI | Marketing-sourced closed-won ÷ marketing spend | Quarterly | Marketing | ≥ 5× | 3–4.9× | < 3× | CRM + finance (internal) |
| MKT-09 | Event/webinar pipeline yield | Pipeline value sourced from events ÷ event cost | Quarterly | Marketing | ≥ 4× | 2–3.9× | < 2× | CRM + finance (internal) |
| MKT-10 | Brand reach growth | QoQ growth in owned-channel reach (subscribers + followers) | Quarterly | Marketing | ≥ +10% | 0–9% | < 0% | Owned channels (internal) |
| MKT-11 | Pipeline velocity contribution | Marketing-influenced deals advancing ≥ 1 stage in period ÷ marketing-influenced open deals | Monthly | Marketing | ≥ 50% | 35–49% | < 35% | CRM (internal) |

**Notes.** MKT-07 directly enforces the positioning-truth requirement: marketing may
describe AdOS only as the offline-first, human-approved advertising-agency platform
that PRODUCT_TRUTH.md substantiates. Claims about Roadmap capabilities (see §11) are
non-conformant assets and lower this KPI. Audit basis:
[`../POSITIONING_GAP_ANALYSIS.md`](../POSITIONING_GAP_ANALYSIS.md) and
[`../POSITIONING_ALIGNMENT_PLAN.md`](../POSITIONING_ALIGNMENT_PLAN.md).

---

## 4. Support

Company-internal. Measured from the company's **own** support desk / ticketing
system. Tickets are raised *by* customers, but the desk that receives and resolves
them is company-operated, so these are internal metrics — with one explicit exception
(SUP-08) which reflects a customer-attested state and is tagged `[CUST]`.

| # | Name | Formula / Definition | Frequency | Owner | Target | Warning | Critical | Source |
|---|------|----------------------|-----------|-------|--------|---------|----------|--------|
| SUP-01 | First response time (P1) | Median time to first human response on Priority-1 tickets | Weekly | Support | ≤ 1 h | 1–4 h | > 4 h | Support desk (internal) |
| SUP-02 | First response time (standard) | Median time to first response on standard tickets | Weekly | Support | ≤ 8 business h | 8–24 h | > 24 h | Support desk (internal) |
| SUP-03 | Mean time to resolution (P1) | Median time from P1 open to resolved | Weekly | Support | ≤ 24 h | 24–48 h | > 48 h | Support desk (internal) |
| SUP-04 | SLA compliance | Tickets resolved within contracted SLA ÷ total tickets | Monthly | Support | ≥ 95% | 90–94% | < 90% | Support desk (internal) |
| SUP-05 | Ticket backlog age | Median age of open tickets | Weekly | Support | ≤ 3 days | 3–7 days | > 7 days | Support desk (internal) |
| SUP-06 | Reopen rate | Reopened tickets ÷ resolved tickets | Monthly | Support | ≤ 5% | 5–10% | > 10% | Support desk (internal) |
| SUP-07 | CSAT (support) | Avg post-resolution satisfaction score (1–5) | Monthly | Support | ≥ 4.5 | 4.0–4.4 | < 4.0 | Support survey (internal) |
| SUP-08 `[CUST]` | Self-resolution via docs | Share of surveyed customers who report resolving an issue via docs/runbook without a ticket | Quarterly | Support | ≥ 40% | 25–39% | < 25% | Customer-reported (survey) |
| SUP-09 | Escalation rate to Engineering | Tickets escalated to Engineering ÷ total tickets | Monthly | Support | ≤ 10% | 10–20% | > 20% | Support desk (internal) |
| SUP-10 | Knowledge-base coverage | Recurring ticket themes with a published KB/runbook article ÷ recurring themes | Quarterly | Support | ≥ 90% | 75–89% | < 75% | Support KB (internal) |
| SUP-11 | Ticket volume per customer | Total tickets ÷ live customers, per month (load indicator) | Monthly | Support | ≤ 3.0 | 3.0–5.0 | > 5.0 | Support desk (internal) |
| SUP-12 | Bilingual coverage | Tickets handled in the customer's requested language (TR/EN) ÷ tickets | Monthly | Support | 100% | 95–99% | < 95% | Support desk (internal) |

**Notes.** Deflection (SUP-08) depends on what happens on the customer's side and is
therefore **customer-reported**; it can only be estimated from surveys and QBR
input, never observed. KB coverage leans on the shipped product docs, including
[`../RUNBOOK.md`](../RUNBOOK.md) and [`../OPERATIONS_GUIDE.md`](../OPERATIONS_GUIDE.md).

---

## 5. Customer Success

**Almost entirely customer-instance dependent.** Because AdOS has no phone-home,
Customer Success cannot observe adoption, usage, or in-product health directly. Every
adoption/usage/health KPI here is **customer-reported / customer-exported /
customer-attested**, gathered through onboarding, scheduled QBRs, CSM-logged
conversations, and voluntary customer report exports — and is tagged `[CUST]`.
Commercial-outcome metrics that the company *can* see from its own contracts (renewal,
expansion, churn value) are internal. Aligns with `../customer-success/*`.

| # | Name | Formula / Definition | Frequency | Owner | Target | Warning | Critical | Source |
|---|------|----------------------|-----------|-------|--------|---------|----------|--------|
| CS-01 | Gross revenue retention (GRR) | Retained recurring revenue ÷ starting recurring revenue (excl. expansion) | Quarterly | Customer Success | ≥ 90% | 85–89% | < 85% | Billing/contracts (internal) |
| CS-02 | Net revenue retention (NRR) | (Start + expansion − contraction − churn) ÷ start recurring revenue | Quarterly | Customer Success | ≥ 105% | 95–104% | < 95% | Billing/contracts (internal) |
| CS-03 | Logo churn rate | Customers lost ÷ customers at period start | Quarterly | Customer Success | ≤ 8% annual | 8–12% | > 12% | Contracts (internal) |
| CS-04 | Renewal rate | Contracts renewed ÷ contracts up for renewal | Quarterly | Customer Success | ≥ 90% | 85–89% | < 85% | Contracts (internal) |
| CS-05 `[CUST]` | Onboarding completion | Customers self-attesting completed onboarding (workspace→client→brand→product→mission) within 30 days ÷ new customers | Monthly | Customer Success | ≥ 80% | 60–79% | < 60% | Customer-reported (onboarding survey) |
| CS-06 `[CUST]` | Time to first Mission | Median days from go-live to customer confirming their first completed Mission pipeline | Quarterly | Customer Success | ≤ 30 days | 30–60 days | > 60 days | Customer-reported (CSM-logged) |
| CS-07 `[CUST]` | Active-usage attestation | Customers reporting monthly active use in a QBR ÷ live customers | Quarterly | Customer Success | ≥ 75% | 50–74% | < 50% | Customer-reported (QBR) |
| CS-08 `[CUST]` | Feature adoption breadth | Avg count of pipeline stages a customer reports using (brief→creative→draft→report→dashboard, max 5) | Quarterly | Customer Success | ≥ 4.0 | 3.0–3.9 | < 3.0 | Customer-reported (QBR/export) |
| CS-09 `[CUST]` | Customer health score | Weighted composite of customer-reported adoption, sentiment, and support signals (0–100) | Monthly | Customer Success | ≥ 75 | 60–74 | < 60 | Customer-reported + internal support blend |
| CS-10 | Net Promoter Score (NPS) | % promoters − % detractors from relationship survey | Quarterly | Customer Success | ≥ +40 | +20 to +39 | < +20 | Relationship survey (internal-run) |
| CS-11 `[CUST]` | Expansion pipeline (CS-sourced) | Value of upsell/cross-sell opportunities surfaced from customer-reported needs | Quarterly | Customer Success | ≥ 15% of book | 8–14% | < 8% | Customer-reported → CRM (internal) |
| CS-12 | At-risk account coverage | At-risk accounts with a documented recovery plan ÷ at-risk accounts | Monthly | Customer Success | 100% | 80–99% | < 80% | CS system (internal) |
| CS-13 `[CUST]` | Upgrade currency | Live customers self-reporting they run the current supported AdOS version ÷ live customers | Quarterly | Customer Success | ≥ 70% | 50–69% | < 50% | Customer-reported (QBR/support) |
| CS-14 | QBR completion | Scheduled QBRs held on cadence ÷ scheduled QBRs | Quarterly | Customer Success | ≥ 90% | 75–89% | < 75% | CS system (internal) |

**Notes.** CS-09 (health score) is a *blend*: its adoption/usage inputs are
customer-reported, its support inputs are internal. Because it partly depends on
customer disclosure, the whole score is treated as `[CUST]` and inherits the coverage
risk in §10. There is deliberately **no** "auto-collected active users", "telemetry
adoption", or "platform-observed engagement" KPI here — AdOS does not report anything
back to the vendor ([`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md) §2.8, §6.1).

---

## 6. Partner

Company-internal. Measured from the company's own partner records, deal registration
in the CRM, and partner contracts. Reflects the referral-fee and reseller model. A
partner's *own* end-customer usage is not visible to the company; where a partner
relays customer state, it is customer/partner-reported and tagged `[CUST]`. Aligns
with `../partner/*`.

| # | Name | Formula / Definition | Frequency | Owner | Target | Warning | Critical | Source |
|---|------|----------------------|-----------|-------|--------|---------|----------|--------|
| PAR-01 | Active partners | Partners with ≥ 1 registered deal or delivery in trailing 2 quarters | Quarterly | Partner | ≥ plan | 80–99% of plan | < 80% of plan | Partner records (internal) |
| PAR-02 | Partner-sourced pipeline | Registered-deal pipeline value from partners | Monthly | Partner | ≥ 30% of pipeline | 15–29% | < 15% | CRM deal registration (internal) |
| PAR-03 | Partner-sourced bookings | Closed-won value from partner-registered deals | Quarterly | Partner | ≥ 30% of bookings | 15–29% | < 15% | Contracts (internal) |
| PAR-04 | Referral fees payable | Sum of earned referral commissions per the partner schedule | Quarterly | Partner | Within budget | 100–115% of budget | > 115% of budget | Partner contracts + finance (internal) |
| PAR-05 | Partner certification rate | Partners with ≥ 1 certified implementer ÷ active partners | Quarterly | Partner | ≥ 80% | 60–79% | < 60% | Enablement records (internal) |
| PAR-06 | Partner-delivered implementations | Implementations delivered by partners ÷ total implementations | Quarterly | Partner | ≥ 60% | 40–59% | < 40% | Delivery records (internal) |
| PAR-07 | Deal-registration approval time | Median days from deal registration to approval | Monthly | Partner | ≤ 3 days | 3–7 days | > 7 days | Partner portal/CRM (internal) |
| PAR-08 | Partner satisfaction | Avg partner survey score (1–5) | Quarterly | Partner | ≥ 4.2 | 3.5–4.1 | < 3.5 | Partner survey (internal) |
| PAR-09 `[CUST]` | Partner-relayed customer health | Share of partner-delivered accounts a partner attests as healthy in QBR | Quarterly | Partner | ≥ 75% | 55–74% | < 55% | Partner/customer-reported (QBR) |
| PAR-10 | New partner recruitment | New partners signed in period | Quarterly | Partner | ≥ plan | 60–99% of plan | < 60% of plan | Partner contracts (internal) |
| PAR-11 | Partner enablement currency | Active partners with enablement completed for the current AdOS version ÷ active partners | Quarterly | Partner | ≥ 80% | 60–79% | < 60% | Enablement records (internal) |

**Notes.** Per the shared commercial vocabulary, **services revenue is
100% partner-retained** where a partner delivers the implementation; the company's
partner-side revenue is the referral fee (PAR-04) plus the resold license margin, not
a cut of partner services. PAR-09 depends on partner/customer disclosure and is
therefore `[CUST]`.

---

## 7. Finance

Company-internal. Measured from the company's billing/ERP, general ledger, and signed
contracts. **Revenue is recognized only across the four legitimate streams** (license
resale + direct license, implementation/services, support/managed services, referral
fees). There is **no** usage, consumption, per-token, per-seat-metered, or cloud-markup
line anywhere — the product has no metering.

| # | Name | Formula / Definition | Frequency | Owner | Target | Warning | Critical | Source |
|---|------|----------------------|-----------|-------|--------|---------|----------|--------|
| FIN-01 | Total recognized revenue | Sum of recognized revenue across the four streams in period | Monthly | Finance | ≥ plan | 90–99% of plan | < 90% of plan | Billing/ERP + GL (internal) |
| FIN-02 | Recurring revenue (license + support) | Annualized recurring value from license subscriptions + support contracts | Monthly | Finance | ≥ plan | 90–99% of plan | < 90% of plan | Contracts + billing (internal) |
| FIN-03 | License resale gross margin | (License resale revenue − license COGS) ÷ license resale revenue | Quarterly | Finance | ≥ 35% | 25–34% | < 25% | GL (internal) |
| FIN-04 | Services gross margin | (Company-delivered services revenue − delivery cost) ÷ services revenue | Quarterly | Finance | ≥ 35% | 20–34% | < 20% | GL + project accounting (internal) |
| FIN-05 | Support/managed-services margin | (Support revenue − support delivery cost) ÷ support revenue | Quarterly | Finance | ≥ 60% | 45–59% | < 45% | GL (internal) |
| FIN-06 | Revenue mix balance | Recurring (license+support) share of total recognized revenue | Quarterly | Finance | 50–70% | 40–49% or 71–80% | < 40% or > 80% | GL (internal) |
| FIN-07 | Referral fee expense ratio | Referral fees paid ÷ partner-sourced revenue | Quarterly | Finance | ≤ 15% | 15–20% | > 20% | AP + partner contracts (internal) |
| FIN-08 | Gross margin (blended) | (Total revenue − total COGS) ÷ total revenue | Quarterly | Finance | ≥ 55% | 45–54% | < 45% | GL (internal) |
| FIN-09 | Operating cash flow | Net cash from operations in period | Monthly | Finance | ≥ 0 (plan) | −1 mo runway impact | negative 2 mo running | Cash ledger (internal) |
| FIN-10 | Cash runway | Cash on hand ÷ average monthly net burn | Monthly | Finance | ≥ 18 mo | 9–17 mo | < 9 mo | Treasury (internal) |
| FIN-11 | Days sales outstanding (DSO) | (Accounts receivable ÷ revenue) × days in period | Monthly | Finance | ≤ 45 days | 45–60 days | > 60 days | AR ledger (internal) |
| FIN-12 | Budget variance | |Actual − budget| ÷ budget, operating expense | Monthly | Finance | ≤ 5% | 5–10% | > 10% | GL vs budget (internal) |
| FIN-13 | CAC payback | Fully-loaded acquisition cost ÷ new recurring gross margin per month | Quarterly | Finance | ≤ 12 mo | 12–18 mo | > 18 mo | GL + CRM (internal) |
| FIN-14 | Revenue-model conformance | Recognized revenue traceable to one of the four approved streams ÷ total revenue | Quarterly | Finance | 100% | (any exception) | < 100% | GL classification review (internal) |
| FIN-15 | Deferred revenue balance | Unearned license + support balance carried on the balance sheet | Monthly | Finance | ≥ plan | 85–99% of plan | < 85% of plan | GL (internal) |
| FIN-16 | Services utilization | Billable delivery hours ÷ available delivery hours (company-delivered) | Monthly | Finance | ≥ 70% | 55–69% | < 55% | Project accounting (internal) |

**Notes.** FIN-14 is a control KPI: it must stay at 100% by construction. Any revenue
that cannot be classified into the four approved streams is a conformance exception
requiring CFO review — it is the guardrail against a metered/consumption line ever
appearing. License margin (FIN-03) is the resale spread; the company does not meter
customer usage to earn it.

---

## 8. Operations

Company-internal. Covers BizOps, People/HR, IT, and internal security/compliance —
the running of the company itself. Measured from HR, IT, and internal governance
systems. Product-side disaster recovery for a *customer's* deployment is documented
separately in [`../DISASTER_RECOVERY.md`](../DISASTER_RECOVERY.md) and
[`../RUNBOOK.md`](../RUNBOOK.md); the Operations KPIs here concern the **company's**
continuity and internal systems.

| # | Name | Formula / Definition | Frequency | Owner | Target | Warning | Critical | Source |
|---|------|----------------------|-----------|-------|--------|---------|----------|--------|
| OPS-01 | Employee attrition (voluntary) | Voluntary leavers ÷ average headcount, annualized | Quarterly | Operations | ≤ 10% | 10–15% | > 15% | HR system (internal) |
| OPS-02 | Time to hire | Median days from approved req to signed offer | Monthly | Operations | ≤ 45 days | 45–70 days | > 70 days | HR/ATS (internal) |
| OPS-03 | Hiring plan attainment | Roles filled ÷ roles planned for period | Quarterly | Operations | ≥ 90% | 75–89% | < 75% | HR system (internal) |
| OPS-04 | Employee engagement | Avg engagement pulse score (1–5) | Quarterly | Operations | ≥ 4.0 | 3.5–3.9 | < 3.5 | Engagement survey (internal) |
| OPS-05 | Security training completion | Staff completing mandatory security training ÷ staff | Quarterly | Operations | 100% | 90–99% | < 90% | LMS (internal) |
| OPS-06 | Access-review completion | Internal access reviews completed on schedule ÷ scheduled reviews | Quarterly | Operations | 100% | 90–99% | < 90% | IT/IdP records (internal) |
| OPS-07 | Internal security incidents | Count of confirmed internal (company IT) security incidents | Monthly | Operations | 0 | 1 | > 1 | Security/IT (internal) |
| OPS-08 | Vendor/tooling uptime | Weighted uptime of critical internal SaaS/tooling | Monthly | Operations | ≥ 99.5% | 99.0–99.4% | < 99.0% | IT monitoring (internal) |
| OPS-09 | Business-continuity test currency | BC/key-person continuity tests completed within cycle ÷ planned | Quarterly | Operations | 100% | 75–99% | < 75% | BC records (internal) |
| OPS-10 | Policy/governance review currency | Governance docs reviewed within their cycle ÷ total governance docs | Quarterly | Operations | 100% | 85–99% | < 85% | BizOps register (internal) |
| OPS-11 | Procurement cycle time | Median days from purchase request to PO | Monthly | Operations | ≤ 10 days | 10–20 days | > 20 days | Procurement system (internal) |
| OPS-12 | Key-person coverage | Critical roles with a documented, tested backup/succession ÷ critical roles | Quarterly | Operations | 100% | 80–99% | < 80% | BC register (internal) |
| OPS-13 | Onboarding ramp time | Median days for a new hire to reach role-defined productivity | Quarterly | Operations | ≤ 60 days | 60–90 days | > 90 days | HR system (internal) |

**Notes.** OPS-09/OPS-10 tie to the company-continuity and governance rhythm defined
in this package's constitution and continuity plans, which reuse RTO/RPO language from
[`../DISASTER_RECOVERY.md`](../DISASTER_RECOVERY.md) at organizational scope. No
Operations KPI reads a customer instance.

---

## 9. Executive (rollup)

Company-internal composite. The Executive rollup is the CEO office's monthly/quarterly
scorecard. Each rollup KPI is a **derived** view of department metrics above; it
introduces no new data source. Where a rollup inherits a customer-reported input
(notably NRR/GRR context and health), that lineage is noted and the coverage caveat
in §10 applies.

| # | Name | Formula / Definition | Frequency | Owner | Target | Warning | Critical | Source |
|---|------|----------------------|-----------|-------|--------|---------|----------|--------|
| EXE-01 | Recurring revenue growth | QoQ growth in recurring revenue (FIN-02) | Quarterly | Executive | ≥ +8% | +3 to +7% | < +3% | Rollup of FIN-02 (internal) |
| EXE-02 | Net revenue retention | Company NRR (from CS-02) | Quarterly | Executive | ≥ 105% | 95–104% | < 95% | Rollup of CS-02 (internal) |
| EXE-03 | Rule-of-40 proxy | Recurring-revenue growth % + operating margin % | Quarterly | Executive | ≥ 40 | 25–39 | < 25 | FIN + growth rollup (internal) |
| EXE-04 | Gross margin (blended) | Company blended gross margin (FIN-08) | Quarterly | Executive | ≥ 55% | 45–54% | < 45% | Rollup of FIN-08 (internal) |
| EXE-05 | Cash runway | Months of runway (FIN-10) | Monthly | Executive | ≥ 18 mo | 9–17 mo | < 9 mo | Rollup of FIN-10 (internal) |
| EXE-06 | Bookings vs plan | Total new bookings ÷ plan (SAL-04 + partner) | Monthly | Executive | ≥ 100% | 85–99% | < 85% | Rollup of Sales/Partner (internal) |
| EXE-07 | Logo + revenue retention | Blended GRR/logo retention (CS-01, CS-03) | Quarterly | Executive | ≥ 90% | 85–89% | < 85% | Rollup of CS (internal) |
| EXE-08 | Customer health index `[CUST-influenced]` | Portfolio-weighted customer health (CS-09) | Monthly | Executive | ≥ 75 | 60–74 | < 60 | Rollup of CS-09 (customer-reported inputs) |
| EXE-09 | Delivery quality index | Composite of ENG-01, ENG-05, SUP-04 | Monthly | Executive | ≥ 90 | 80–89 | < 80 | Rollup of Eng/Support (internal) |
| EXE-10 | Positioning-truth conformance | Composite of MKT-07 + FIN-14 (message + revenue-model integrity) | Quarterly | Executive | 100% | 95–99% | < 95% | Rollup of MKT/FIN (internal) |
| EXE-11 | OKR attainment | Average company OKR score at quarter close (0.0–1.0) | Quarterly | Executive | ≥ 0.7 | 0.5–0.69 | < 0.5 | OKR system (internal) |

**Notes.** EXE-10 is the executive-level truth guardrail: it fails the moment either
the public message drifts from PRODUCT_TRUTH.md (MKT-07) or revenue classification
strays from the four approved streams (FIN-14). EXE-08 is explicitly flagged as
influenced by customer-reported inputs; it is a management estimate, not a
platform-observed metric.

---

## 10. Cross-cutting data-integrity rules

1. **Source honesty is mandatory.** The **Source** field states where the number
   actually comes from. A `[CUST]` KPI may never be re-labeled "telemetry",
   "auto-collected", "observed", or "platform-reported". AdOS has no phone-home; there
   is nothing to observe from the vendor side
   ([`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md) §2.8, §6.1).
2. **Customer-reported coverage caveat.** Every `[CUST]` KPI is only as complete as
   customer disclosure. Report the **response/coverage rate** alongside the metric; a
   `[CUST]` value below 60% coverage is presented as *indicative only*. This is a
   known, accepted operational limitation (see the risk register in this package and
   [`../KNOWN_LIMITATIONS.md`](../KNOWN_LIMITATIONS.md)), not a data-quality defect to
   be "fixed" by adding telemetry.
3. **No metered-revenue KPI.** Finance metrics derive only from the four approved
   revenue streams. FIN-14 and EXE-10 enforce this; any consumption/per-token/per-seat
   line is a conformance exception, not a KPI.
4. **No Roadmap capability measured as shipped.** No KPI may treat a Roadmap product
   capability (see §11) as if it exists today — e.g. no KPI counts "documents
   answered with citations", "autonomous agent tasks completed", "live ad launches",
   "external connector syncs", "RBAC denials enforced", or "immutable audit entries".
   None of these are shipped product capabilities.
5. **Illustrative thresholds.** All Target/Warning/Critical values are illustrative
   v1.0.0 baselines and are re-baselined annually against actuals.
6. **One accountable owner per KPI.** The **Owner** column names the accountable
   department; cross-department rollups (EXE-*) are accountable to the Executive
   office even though inputs originate elsewhere.
7. **Product vs. company metrics are never conflated.** The advertising KPIs the
   *product* computes for a customer's campaign (CTR/CPC/CPA/CPL/ROAS/ROI) are a
   hand-entered product feature inside the customer's instance; they are **not**
   company KPIs and appear nowhere in this catalog. Company demand-generation
   performance (Marketing, §3) is measured only from systems the company owns.
8. **Self-hosted reality.** Because customers self-host and there is no vendor cloud,
   every "live customer" figure used as a denominator (e.g. SUP-11, CS-07) is derived
   from the company's own contract records, not from any observed running instance.

---

## 11. Roadmap boundary (NOT measured today)

The following are **product Roadmap** items only (see [`../ROADMAP.md`](../ROADMAP.md)).
They are listed here solely to make explicit that **no KPI in this catalog measures
them as current business outcomes**. They are neither shipped product capabilities nor
company metrics today:

- Document Q&A / cited answers over a customer's documents.
- "Digital Employees" / autonomous agents performing work.
- Live ad launch or campaign optimization (the product **drafts** only and never
  leaves `draft`).
- External connectors / syncs (Meta, Google, CRM, etc.).
- Enforced RBAC / permission-aware AI.
- Immutable audit trail and DB-level row-level security.
- Cloud / SaaS / hosted inference and any metered billing.
- Vision / speech / image / video AI.
- Tiered T0–T4 approval authority.
- Guaranteed "real AI prose out of the box" (default engine is the deterministic
  OfflineAIManager).

If and when any of these ship and are substantiated in
[`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md), this catalog will be revised — under the
change process in the `BUSINESS_OPERATIONS_CONSTITUTION.md` — to add corresponding
KPIs with truthful **Source** definitions.

---

## 12. Review and change control

- **Weekly** — operational KPIs (Warning/Critical breaches) reviewed in the operating
  cadence; owners bring corrective actions.
- **Monthly** — full scorecard review; forecast-linked KPIs reconciled.
- **Quarterly** — QBR: quarterly KPIs scored, thresholds sanity-checked, `[CUST]`
  coverage rates audited.
- **Annual** — thresholds re-baselined; catalog version incremented.

Changes to KPI definitions, owners, or thresholds are governed by the
`BUSINESS_OPERATIONS_CONSTITUTION.md` and recorded as decisions per the ADR process.
This catalog is a controlled document; its authoritative product reference is always
[`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md).

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
