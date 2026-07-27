# AdOS — Operating Model

**Owner:** Office of the COO
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)

---

## 0. Purpose and scope

This document defines **how the AdOS company operates** — function by function — so
that ten departments can plan, decide, build, sell, support, and govern one product
line without ambiguity. It is a governance artifact for the *business*, one level
above the product. It does not describe or add product features.

The product this company builds and sells is fixed by [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md):
AdOS is an **Enterprise AI Operating System for Advertising** — an offline-first,
100% local-AI advertising-agency platform ("Agency OS"). It takes a client's
advertising objective (a **Mission**) through a **human-approved pipeline**
(marketing brief → creative ad copy → campaign **draft** → performance report →
executive dashboard) and remembers what works in a marketing-performance **Company
Brain**. It **drafts**; it never launches live ads. The deployment model is
**customer self-hosts** — there is no vendor cloud, no telemetry, no per-token
metering, and no standing vendor access into any customer instance.

This constraint shapes the entire operating model. Its most important consequence:
**the company cannot measure what happens inside a customer's instance.** Any metric
in this document that depends on customer-instance usage, adoption, or health is
therefore explicitly labelled **customer-reported** (customer-exported /
customer-attested). Metrics the company legitimately owns — its own CRM/pipeline,
finance ledger, headcount, code repository, and its own support-desk records — are
measured directly and are not so labelled.

**Governing references.** This model is subordinate to and consistent with:
- [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) — the single source of product truth.
- `BUSINESS_OPERATIONS_CONSTITUTION.md` — the in-repo governing reference for BizOps.
- `ADR_GUIDE.md` — decision-record format (ADR-NNNN).
- `RELEASE_GOVERNANCE.md` — release/version governance.
- Sibling GTM packages: [../customer-success/](../customer-success/),
  [../partner/](../partner/), [../sales/](../sales/), [../marketing/](../marketing/).

---

## 1. Operating principles

1. **Truth over narrative.** No department states, sells, or measures a capability the
   product does not ship (per [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)). Future
   capabilities live only under an explicit **Roadmap** label in
   [../ROADMAP.md](../ROADMAP.md), never as shipped and never as a company KPI today.
2. **Self-hosted reality.** The company operates as if it can see nothing inside a
   customer instance — because it can. Success signals come from customer-reported
   data, partner reports, and the company's own commercial and support records.
3. **Single accountable owner.** Every department and every decision has exactly one
   **Accountable** party (§4). Consultation is broad; accountability is singular.
4. **Reversible by default, deliberate when not.** Type 2 (reversible) decisions are
   delegated and fast; Type 1 (irreversible / high-impact) decisions are escalated,
   documented as ADRs, and made by the executive team (§4.2).
5. **One operating rhythm.** All functions plan and review on the same Weekly /
   Monthly / Quarterly / Annual cadence (§5) so the company moves as one system.

---

## 2. Departments

The company operates through **ten departments** (functions). Each has a single
accountable owner (C-level or lead). Four map directly to existing sibling packages:
Customer Success → [../customer-success/](../customer-success/), Partners →
[../partner/](../partner/), Sales → [../sales/](../sales/), Marketing →
[../marketing/](../marketing/).

| # | Department | Accountable owner |
|---|---|---|
| 1 | Executive Team | CEO |
| 2 | Engineering | VP Engineering / CTO |
| 3 | Product | Head of Product |
| 4 | Sales | VP Sales |
| 5 | Marketing | Head of Marketing |
| 6 | Customer Success | VP Customer Success |
| 7 | Partners (Partner / Channel) | Head of Partnerships |
| 8 | Finance | CFO |
| 9 | Legal | General Counsel |
| 10 | Operations (BizOps / People / IT) | COO |

Each section below states the department's **mission**, **responsibilities**, and
**success metrics**. Where a metric depends on customer-instance data it is marked
**(customer-reported)**.

### 2.1 Executive Team — Office of the CEO

**Mission.** Set company strategy, own the truthful product positioning, allocate
capital and headcount, and make Type 1 decisions. Guardian of the alignment between
what the company says and what [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) substantiates.

**Responsibilities.**
- Own annual strategy, the OKR tree, and the capital/headcount plan.
- Approve Type 1 (irreversible / high-impact) decisions and their ADRs (§4).
- Chair Quarterly Business Reviews and the Annual strategy/planning cycle (§5).
- Own the top-level risk register and the positioning integrity of the company
  (see [../POSITIONING_GAP_ANALYSIS.md](../POSITIONING_GAP_ANALYSIS.md),
  [../POSITIONING_ALIGNMENT_PLAN.md](../POSITIONING_ALIGNMENT_PLAN.md)).
- Final internal authority for executive-level customer/partner escalations.

**Success metrics.**
- Annual OKR attainment (company average score, 0.0–1.0; 0.7 = target).
- Net new bookings and gross margin vs annual plan (own finance records).
- Quarterly strategy commitments delivered (own tracker).
- Zero unresolved positioning-truth defects (claims vs [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)).
- Cash runway in months vs board threshold (own finance records).

### 2.2 Engineering — Office of the CTO / VP Engineering

**Mission.** Build, harden, and release the AdOS product line as a versioned,
self-hostable, offline-first build — on time, at quality, and truthful to what ships.

**Responsibilities.**
- Deliver the product roadmap items that graduate from [../ROADMAP.md](../ROADMAP.md)
  into shipped, tested software.
- Maintain the test suite, CI, and the build/release pipeline per
  `RELEASE_GOVERNANCE.md`; produce versioned artifacts + docs, not cloud deploys.
- Own product-side reliability engineering and the product DR/backup posture
  ([../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md), [../BACKUP_GUIDE.md](../BACKUP_GUIDE.md),
  [../RUNBOOK.md](../RUNBOOK.md)).
- Serve as Tier-2 escalation target for confirmed product defects raised by Support
  and Partners (§6).
- Author Architecture & Business Decision Records (ADRs) for technical Type 1 calls.

**Success metrics** (all measured on the company's own repository, CI, and issue
tracker — not from customer instances).
- On-time release rate vs the committed release calendar.
- Escaped-defect rate (defects found post-release ÷ releases).
- Test suite health: pass rate and coverage of critical paths in CI.
- Mean time from confirmed Sev 1/Sev 2 product defect (§6) to patched release.
- Security-finding remediation time vs [../SECURITY_GUIDE.md](../SECURITY_GUIDE.md) targets.

### 2.3 Product — Office of the Head of Product

**Mission.** Decide what the product should become, keep the roadmap and the truth
document in lockstep, and ensure every shipped capability is real, tested, and
honestly described.

**Responsibilities.**
- Own [../ROADMAP.md](../ROADMAP.md); maintain the boundary between shipped
  capabilities (§2 of [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)) and Roadmap-only
  items (the forbidden-as-present-tense list, e.g. document Q&A, autonomous agents,
  live ad launch, external connectors, enforced RBAC, immutable audit, cloud
  inference).
- Own release scope and the go/no-go decision jointly with Engineering per
  `RELEASE_GOVERNANCE.md`.
- Keep [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) and
  [../KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md) current after every release.
- Triage customer-reported and partner-reported feature requests into the backlog.

**Success metrics.**
- Roadmap commitments shipped per quarter vs plan (own tracker).
- Truth-alignment: zero shipped-vs-documented discrepancies at release gate.
- Requirement rework rate (specs changed after development start; own tracker).
- Adoption of released capabilities **(customer-reported)** via CS/partner reviews.
- Release-note accuracy: zero material corrections after publication
  ([../RELEASE_NOTES.md](../RELEASE_NOTES.md)).

### 2.4 Sales — Office of the VP Sales

**Mission.** Generate qualified pipeline and close license/subscription and direct
license deals for a self-hosted product, using only claims substantiated by
[../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md).

**Responsibilities.**
- Own the pipeline, forecast, and quota attainment; run the sales process end to end.
- Use approved collateral only ([../sales/BROCHURE.md](../sales/BROCHURE.md),
  [../sales/ONE_PAGER.md](../sales/ONE_PAGER.md),
  [../sales/PROPOSAL_TEMPLATE.md](../sales/PROPOSAL_TEMPLATE.md),
  [../sales/OBJECTION_HANDLING.md](../sales/OBJECTION_HANDLING.md),
  [../sales/SALES_FAQ.md](../sales/SALES_FAQ.md)).
- Sell the correct revenue streams (§3): license/subscription resale + direct
  license, implementation & services, support/managed services, referral fees —
  **no** consumption, per-seat-metered, or per-token billing (the product has no
  metering).
- Coordinate partner-sourced and partner-fulfilled deals with Partners (§2.7).
- Hand off closed-won accounts to Customer Success with a complete deal record.

**Success metrics** (own CRM / pipeline data).
- New bookings and net revenue vs quota.
- Qualified pipeline coverage ratio vs target.
- Win rate and average sales cycle length.
- Forecast accuracy (committed vs actual).
- Discount discipline: deals within approved discount tiers (illustrative baselines,
  per Finance §2.8 and [../partner/](../partner/) tiering).

### 2.5 Marketing — Office of the Head of Marketing

**Mission.** Build awareness and demand for the truthful AdOS category — "Enterprise
AI Operating System for Advertising" — and equip Sales and Partners with accurate,
on-message collateral.

**Responsibilities.**
- Own positioning, messaging, content, and campaigns within the truth guardrails of
  [../marketing/MARKETING_CONSTITUTION.md](../marketing/MARKETING_CONSTITUTION.md)
  and [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md).
- Never present Roadmap items (document Q&A, Digital Employees, live ad launch,
  connectors, permission-aware AI, immutable audit, cloud inference) as shipped.
- Produce and maintain public assets
  ([../marketing/WEBSITE_CONTENT.md](../marketing/WEBSITE_CONTENT.md),
  [../marketing/PRESS_KIT.md](../marketing/PRESS_KIT.md),
  [../marketing/BLOG_ARTICLES.md](../marketing/BLOG_ARTICLES.md),
  [../marketing/SEO_MASTER_PLAN.md](../marketing/SEO_MASTER_PLAN.md)).
- Run launch communications for each release as an alignment/communication step
  ([../marketing/MARKETING_RELEASE_NOTES.md](../marketing/MARKETING_RELEASE_NOTES.md)),
  not an auto-push.

**Success metrics** (own web/campaign analytics and CRM attribution).
- Marketing-qualified leads and pipeline contribution vs target.
- Cost per qualified lead.
- Campaign engagement (site, content, and event metrics the company owns).
- Message-integrity audits passed: zero unsupported-claim findings
  ([../marketing/MARKETING_VALIDATION_REPORT.md](../marketing/MARKETING_VALIDATION_REPORT.md)).

### 2.6 Customer Success — Office of the VP Customer Success

**Mission.** Ensure self-hosting customers deploy, adopt, and renew AdOS, and run the
vendor support function within the limits of a no-telemetry, no-remote-access product.

**Responsibilities.**
- Own onboarding, adoption enablement, renewals, and health for direct customers
  ([../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md),
  [../customer-success/CUSTOMER_HEALTH.md](../customer-success/CUSTOMER_HEALTH.md)).
- Run vendor support and the Sev 1–4 model
  ([../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md)),
  honoring that **SLAs are vendor RESPONSE targets, not remote-fix commitments** —
  the vendor has no standing access to any customer instance.
- Escalate confirmed product defects to Engineering (Tier-2) per §6.
- Deliver training and certification
  ([../customer-success/ADMINISTRATOR_TRAINING.md](../customer-success/ADMINISTRATOR_TRAINING.md),
  [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md),
  [../customer-success/CERTIFICATION_PROGRAM.md](../customer-success/CERTIFICATION_PROGRAM.md)).

**Success metrics.**
- Gross and net renewal / retention rate (own contract records).
- Support response-target adherence by severity — **vendor-side ticket records**
  (the one customer-touch dataset the vendor holds directly, because the ticket comes
  to the vendor).
- Time-to-first-value / onboarding completion **(customer-reported)** via
  customer-attested milestones.
- Product adoption and usage-health signals **(customer-reported)** — collected via
  customer-exported reports or attestation in reviews, never auto-collected.
- CSAT / relationship health **(customer-reported)** from surveys and QBRs.

### 2.7 Partners (Partner / Channel) — Office of the Head of Partnerships

**Mission.** Recruit, certify, and grow implementation and reseller partners who
deliver AdOS to customers, with partners fronting Tier-1 support and retaining
services revenue.

**Responsibilities.**
- Own partner recruitment, tiering, certification, and QBRs
  ([../partner/PARTNER_PROGRAM_CONSTITUTION.md](../partner/PARTNER_PROGRAM_CONSTITUTION.md),
  [../partner/PARTNER_OPERATIONS.md](../partner/PARTNER_OPERATIONS.md),
  [../partner/PARTNER_CERTIFICATION.md](../partner/PARTNER_CERTIFICATION.md)).
- Operate the Tier-1 (partner) / Tier-2 (vendor) support split: partners handle
  first-line customer support; product defects and other Tier-2 items escalate to the
  vendor and thence to Engineering (§6).
- Administer commercial terms — reseller discount tiers and referral fees as
  **illustrative baselines**; services revenue **100% partner-retained** where the
  partner delivers ([../partner/PARTNER_AGREEMENT_TEMPLATE.md](../partner/PARTNER_AGREEMENT_TEMPLATE.md)).
- Enforce the same no-telemetry / no-standing-access reality for partner instances.

**Success metrics.**
- Partner-sourced and partner-fulfilled bookings (own commercial records).
- Certified-partner count and certification currency (own records).
- Partner Tier-1 support quality **(partner-reported)** plus vendor-side Tier-2
  ticket records (severity mix and response adherence held directly by the vendor).
- Partner satisfaction and reference-ability **(partner-reported)** via QBRs.
- Compliance-attestation completion across active partners (partner-attested).

### 2.8 Finance — Office of the CFO

**Mission.** Steward capital, run planning and forecasting, and ensure the company's
economics reflect the true, non-metered revenue model.

**Responsibilities.**
- Own the P&L, budget, cash management, billing, and revenue recognition for the four
  revenue streams (§3): (a) license/subscription resale + direct license,
  (b) implementation & services, (c) support / managed services, (d) referral fees.
- Reject any construct implying consumption/usage/per-token/per-seat-metered revenue —
  the product has no metering; licensing is contractual.
- Run the Monthly business review scorecard and the Annual plan/budget (§5).
- Own the financial risk register and pricing governance jointly with the Executive
  Team (Type 1 pricing changes → ADR).

**Success metrics** (own finance systems).
- Revenue vs plan by stream; gross and net margin.
- Cash runway (months) and burn vs plan.
- Forecast accuracy (quarterly committed vs actual).
- Days sales outstanding and collections health.
- Contribution margin by partner vs direct channel.

### 2.9 Legal — Office of the General Counsel

**Mission.** Protect the company through sound contracts, licensing, compliance, and
IP practice, and keep the company's commitments consistent with what the product
actually does.

**Responsibilities.**
- Own license agreements, partner agreements, DPAs, and customer contracts
  ([../partner/PARTNER_AGREEMENT_TEMPLATE.md](../partner/PARTNER_AGREEMENT_TEMPLATE.md)).
- Ensure contractual claims match [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md); no
  contract may warrant a Roadmap-only capability as shipped.
- Advise that, because AdOS is self-hosted with no vendor telemetry or standing
  access, the customer is the data controller for their instance; the company cannot
  and does not collect customer-instance data.
- Own IP, trademark (including the TR label "Reklam için Kurumsal Yapay Zekâ İşletim
  Sistemi"), and regulatory compliance; support security/privacy attestations
  ([../SECURITY_GUIDE.md](../SECURITY_GUIDE.md)).

**Success metrics** (own legal records).
- Contract cycle time (turnaround from request to signature).
- Percentage of deals on standard (non-redlined) paper.
- Open legal/compliance issues and time-to-close.
- Zero contractual commitments inconsistent with [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md).
- Renewal/agreement lapse rate (avoidable expirations = 0 target).

### 2.10 Operations (BizOps / People / IT) — Office of the COO

**Mission.** Run the company's internal operating system — planning cadence, decision
governance, hiring, internal IT/security, and business continuity — so every other
function can execute.

**Responsibilities.**
- Own this Operating Model, the decision framework (§4), the operating rhythm (§5),
  the OKR process, the KPI catalog, and the company (business) continuity plan
  (distinct from product DR in [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md)).
- Own People operations: hiring, onboarding, and the major-hire approval process (§4.4).
- Own internal IT and corporate security posture (the company's own systems).
- Steward `BUSINESS_OPERATIONS_CONSTITUTION.md`, `ADR_GUIDE.md`, and
  `RELEASE_GOVERNANCE.md` as living governance references.

**Success metrics** (own operational records).
- Operating-cadence adherence (reviews held on schedule; §5).
- ADR coverage: Type 1 decisions with a recorded ADR ÷ Type 1 decisions (target 100%).
- Time-to-hire and offer-acceptance rate for approved roles.
- Company-continuity readiness: business-continuity test completed on cycle;
  RTO/RPO objectives validated for company operations.
- Internal security/compliance actions closed on time.

---

## 3. Revenue model (context for all financial metrics)

Every financial metric above respects the fixed revenue model. AdOS revenue comes
**only** from:

| Stream | Description | Metering? |
|---|---|---|
| (a) License / subscription resale + direct license | Commercial, contractual right to run the self-hosted product | None — contractual |
| (b) Implementation & services | Deployment, integration, configuration; partner-retained where a partner delivers | None |
| (c) Support / managed services | Vendor Tier-2 support and managed engagements | None |
| (d) Referral fees | Fees for referred, closed business (illustrative baselines) | None |

There is **no** cloud markup, per-token, per-seat-metered, or consumption billing —
the product has no metering. Discount tiers and referral fees are **illustrative
baselines**, set with Finance and consistent with [../partner/](../partner/).

---

## 4. Decision rights

### 4.1 RACI

Decision rights are expressed as **RACI**:
- **R — Responsible:** does the work to reach and implement the decision.
- **A — Accountable:** the single owner who is answerable for the outcome — **exactly
  one A per decision.**
- **C — Consulted:** provides input before the decision (two-way).
- **I — Informed:** told after the decision (one-way).

### 4.2 Decision classes: Type 1 vs Type 2

- **Type 1 — irreversible / high-impact.** Hard or impossible to reverse (pricing
  architecture, entering/exiting a market, a major product-direction change, a
  material contract, a major hire, a positioning/claims change). Requires **executive
  approval and a documented ADR** (`ADR_GUIDE.md`; ID format ADR-NNNN; statuses
  Proposed → Accepted → Superseded → Deprecated).
- **Type 2 — reversible.** Cheap to undo; **delegated to the accountable owner**,
  made quickly, no ADR required. If a Type 2 decision proves consequential, it is
  re-classified as Type 1 and documented retroactively.

The bias is toward Type 2 speed; the discipline is that anything crossing the
irreversible/high-impact line is treated as Type 1.

### 4.3 Cross-functional RACI matrix

Key recurring decisions and their RACI across the ten departments. Exactly one **A**
per row.

| Decision | Type | Executive | Engineering | Product | Sales | Marketing | Customer Success | Partners | Finance | Legal | Operations |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Product release (go/no-go) | 1 | A | R | R | I | I | C | C | I | C | I |
| Roadmap prioritization | 2 | C | C | A/R | C | I | C | C | I | I | I |
| Pricing change | 1 | A | I | C | C | I | I | C | R | C | I |
| New partner tier / tier change | 1 | A | I | I | C | I | C | R | C | C | I |
| Partner agreement (individual) | 2 | I | I | I | C | I | I | A/R | C | C | I |
| Major hire (leadership / budgeted senior role) | 1 | A | C | C | C | C | C | C | C | I | R |
| Customer escalation (executive level) | 1 | A | C | C | C | I | R | C | I | C | I |
| Marketing claim / positioning change | 1 | A | I | R | C | R | I | I | I | C | I |
| Standard sales discount (within tier) | 2 | I | I | I | A/R | I | I | C | C | I | I |
| Contract redline / non-standard terms | 1 | C | I | I | C | I | I | C | C | A/R | I |
| Annual budget & headcount plan | 1 | A | C | C | C | C | C | C | R | C | R |
| Company OKR set / quarterly grading | 2 | A | C | C | C | C | C | C | C | C | R |
| Business-continuity activation | 1 | A | C | I | I | I | C | C | C | C | R |

Reading notes. "A/R" means the same office is both Accountable and Responsible.
Product release is Accountable to the Executive Team but co-driven (Responsible) by
Engineering and Product per `RELEASE_GOVERNANCE.md`; a release is a versioned build +
docs + GTM alignment distributed to self-hosting customers/partners, never an
auto-push to customer instances.

---

## 5. Operating rhythm (meeting cadence)

The company runs on one fixed cadence. Reviews use the same KPI catalog and OKR tree
so signals reconcile across functions.

| Cadence | Forum | Chair (Accountable) | Core participants | Primary agenda | Key outputs |
|---|---|---|---|---|---|
| **Weekly** | Operational review | Each dept owner (own team); COO for cross-company sync | Department teams; leads for cross-sync | Metrics vs target, blockers, this-week actions | Action list with owners; escalations raised |
| **Monthly** | Business review | CEO (company); CFO co-leads finance scorecard | Executive Team + department owners | KPI catalog scorecard, OKR check-in, forecast | Updated forecast; corrective actions; risks flagged |
| **Quarterly** | QBR + OKR + risk | CEO | Executive Team + all department owners; partners for partner QBR | Set/score OKRs + retrospective; risk-register review; tier & partner reviews | Graded OKRs (0.0–1.0); next-quarter OKRs; risk actions; tier decisions |
| **Annual** | Strategy & planning | CEO | Executive Team + all departments; board as required | Strategy, annual OKRs, annual plan/budget, full risk review | Annual OKRs; approved budget & headcount; refreshed strategy and risk register |

Support and partner operations run their own recurring reviews inside this rhythm —
e.g. the quarterly support-quality and partner-tier reviews described in
[../customer-success/](../customer-success/) and
[../partner/PARTNER_OPERATIONS.md](../partner/PARTNER_OPERATIONS.md).

**OKR model.** Levels cascade **Annual → Quarterly → Department → Personal** (aligned
top-down, drafted bottom-up). Each Objective is qualitative with 3–5 measurable Key
Results, scored **0.0–1.0** where **0.7 = target** ("committed vs aspirational"),
graded at quarter close in the retrospective. OKRs are **not** individual performance
pay.

---

## 6. Escalation paths

Two escalation ladders operate: **support/product** (severity-driven) and
**partner/commercial** (tier-driven). Both respect that the product is self-hosted —
the vendor has no standing access and cannot remotely fix a customer instance; SLAs
are **vendor RESPONSE targets**, not remote-fix commitments.

### 6.1 Support and product escalation (Sev 1–4)

Severity, SLA, and escalation semantics are inherited from
[../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md).
Escalation adds specialists — it does **not** transfer ownership.

| Severity | Meaning | Vendor response target | Escalation path |
|---|---|---|---|
| **Sev 1 — Critical** | Production down / cannot log in / data-loss risk | 1 business hour | Engage Engineering immediately in parallel with triage; notify VP CS; executive-level customer escalation → Executive Team (§4.3) |
| **Sev 2 — High** | Major function impaired (a pipeline stage failing), no workaround | 4 business hours | Engage Solution Architect early (often environmental — engine reachability, persistence, resources); escalate to Engineering (Tier-2) if a defect is suspected |
| **Sev 3 — Normal** | Limited / partial impact, workaround exists | 1 business day | Escalate to Engineering only after a defect is confirmed; prioritize durable fix into a release |
| **Sev 4 — Low** | Question / cosmetic / how-to / enhancement idea | 2 business days | Normally Support-only; involve the CSM if it signals a broader account risk; route enhancements to Product backlog |

**Tier model.** In partner-led accounts, **Tier-1 = the partner's responsibility**
(the partner fronts the customer). **Tier-2 = the vendor**: confirmed product defects
and issues beyond Tier-1 escalate from the partner to the vendor, and from vendor
Support to **Engineering**. Vendor-side ticket records (severity mix and
response-target adherence for escalations raised to the vendor) are the one
customer-touch dataset the vendor holds directly, because the ticket comes to the
vendor. Tier-1 handling volumes and outcomes are **partner-reported**.

**RCA.** A root-cause analysis is required for every Sev 1 and every Sev 2 that
resulted in a patch, and on request for recurring Sev 3s, per
[../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md).

### 6.2 Partner and commercial escalation

| Trigger | First owner | Escalates to | Notes |
|---|---|---|---|
| Tier-1 support unresolved / product-defect suspected | Partner (Tier-1) | Vendor Support → Engineering (Tier-2) | Ownership stays with the raising party; vendor adds capability |
| Partner performance / tier dispute | Head of Partnerships | Executive Team (Type 1 if tier change) | Handled in partner QBR; tier change is Type 1 (§4.3) |
| Commercial dispute / non-standard terms | Head of Partnerships or VP Sales | Legal → Finance → Executive Team | Contract redlines are Type 1 (Legal Accountable, §4.3) |
| Compliance-attestation gap (partner) | Head of Partnerships | Legal; Executive Team if material | Attestation-based; vendor has no access to partner systems |

### 6.3 Internal / cross-functional escalation

Any blocker unresolved at the Weekly operational review escalates to the Monthly
business review; unresolved cross-functional conflicts escalate to the Executive
Team. Type 1 decisions surfaced anywhere in the ladder route to the Executive Team
for approval and an ADR (§4.2). Business-continuity events (vendor failure, partner
failure, key-person loss, comms outage) activate the company continuity plan owned by
Operations, distinct from the product DR in
[../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md) and [../RUNBOOK.md](../RUNBOOK.md).

---

## 7. Roadmap boundary (not company metrics today)

For completeness and to prevent metric drift: the following are **product-Roadmap**
items only ([../ROADMAP.md](../ROADMAP.md)) and must **never** appear as shipped
capabilities or as anything a company KPI/dashboard measures today — document Q&A /
cited answers; "Digital Employees" / autonomous agents; live ad launch or
optimization; external connectors/syncs (Meta / Google / CRM); enforced RBAC /
permission-aware AI; immutable audit trail; DB-level row-level security; cloud / SaaS
/ hosted inference; vision / speech / image / video AI; tiered T0–T4 approval
authority; and "real AI prose out of the box." No department may set an objective,
KPI, or contractual commitment premised on any of these.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
