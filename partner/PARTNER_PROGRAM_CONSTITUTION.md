# AdOS Partner Program Constitution

> **Owner:** Office of the Chief Partner Officer (CPO)
> **Status:** Official — binding on every partner artifact; aligned to `../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** `../PRODUCT_TRUTH.md`

This Constitution is the **governing charter** of the AdOS partner ecosystem. It
defines, authoritatively, the program's vision, governance, partner types, tiers,
revenue model, and rules of engagement. Every other partner document — the Partner
Guide, Partner Certification, Partner Portal Specification, Partner Agreement
Template, and any playbook or one-pager — is **subordinate to this charter** and
must reference it. Where a sibling partner document and this Constitution disagree,
this Constitution wins. Where this Constitution and `../PRODUCT_TRUTH.md` disagree,
**`../PRODUCT_TRUTH.md` wins.**

**Product framing (use verbatim).** AdOS is the **Enterprise AI Operating System
for Advertising** (TR: *"Reklam için Kurumsal Yapay Zekâ İşletim Sistemi"*). It is an
offline-first, 100% local-AI platform that takes a client's advertising objective
(a **Mission**) through a **human-approved pipeline** — marketing brief → creative
(ad copy) → campaign **draft** → performance report → executive dashboard — and
remembers what works in a marketing-performance **Company Brain**. **AdOS drafts; it
never launches live ads.** The phrase "Advertising Operating System" must appear
nowhere in partner collateral.

---

## Article I — Vision

AdOS partners bring an offline-first, self-hosted, 100% local-AI advertising
platform to organizations that cannot or will not send their marketing data to a
cloud. Our vision is a **certified, trusted delivery network** that installs,
configures, trains, and supports AdOS **on the customer's own infrastructure**, so
that every deployment reflects the truthful capabilities of the product and every
customer succeeds with the human-approved pipeline.

We win when a partner can stand up AdOS in an air-gapped or private environment,
migrate the customer onto it, train their team, and hand over a running instance the
customer fully owns — with the partner earning durable services and support revenue
for the value they deliver.

---

## Article II — Objectives

1. **Truthful market coverage.** Extend AdOS reach through partners whose claims
   trace, without exception, to `../PRODUCT_TRUTH.md`.
2. **Delivery quality.** Ensure every implementation follows the 10-phase
   methodology (Article XI) and is staffed by individually certified people.
3. **Customer success.** Tie partner standing to customer outcomes measured through
   **partner-reported and customer-shared** signals — never through vendor
   telemetry, because AdOS is self-hosted and does not phone home.
4. **Durable partner economics.** Reward partners through the four legitimate
   revenue streams (Article V) — resale margin, implementation/services, support/
   managed services, and referral fees — and never through cloud, usage, or
   per-token metering, which AdOS does not have.
5. **Ecosystem trust.** Enforce a single code of conduct (Article XV) and a single
   compliance baseline (Article XIV) so that the AdOS name means the same thing in
   every territory.
6. **Governed growth.** Grow the network at a pace the certification pipeline and
   support model can sustain, governed by the councils and cadence in Article IV.

---

## Article III — Partner Philosophy

- **Truth over hype.** A partner may promise only what the product does today.
  Everything else is labeled **Roadmap** (Article XVI). A single unsupported claim
  ("it launches your ads," "it answers from your documents with citations") is a
  material breach of this charter.
- **The customer owns the instance.** AdOS is deployed on the customer's own
  infrastructure. The partner operates it *for* the customer, not *over* the
  customer. There is no vendor cloud and no standing vendor access.
- **Local, private, offline by default.** Partners lead with air-gap capability, no
  cloud dependency, no API keys, and no per-token billing — the product's genuine
  differentiators.
- **Human-in-the-loop is a feature, not a limitation.** Every pipeline stage
  requires an explicit human approval click. Partners sell governance and
  approval discipline, not "autonomous AI."
- **Services are where partners win.** The largest, most durable partner margin is
  implementation, training, and support — work partners retain in full.
- **One truth, many voices.** Partners may differentiate on industry, geography, and
  service depth, but never on the product's factual capabilities.

---

## Article IV — Governance

### IV.1 Roles

| Role | Side | Responsibility |
|---|---|---|
| **Chief Partner Officer (CPO)** | AdOS | Owns this Constitution; final authority on tiers, exceptions, and termination. |
| **Partner Program Office (PPO)** | AdOS | Day-to-day administration: onboarding, tier reviews, deal registration, QBRs. |
| **Partner Success Manager (PSM)** | AdOS | Named contact for a portfolio of partners; runs the QBR cadence. |
| **Vendor Support / Escalation Lead** | AdOS | Owns Tier-2 escalation per `../customer-success/SUPPORT_PLAYBOOK.md`. |
| **Partner Principal / Sponsor** | Partner | Executive owner of the AdOS practice; signs the joint business plan. |
| **Partner Program Manager** | Partner | Partner-side counterpart to the PPO; maintains certifications and registrations. |
| **Delivery roles** | Partner | Engagement Lead, Solution Architect, Implementation Consultant, Trainer, Support Engineer (Article XI.3). |

### IV.2 Councils

- **Partner Advisory Council (PAC).** A rotating group of Gold and Platinum partners
  that advises the CPO on program policy, the product Roadmap (Article XVI), and
  commercial defaults. Meets quarterly; advisory only.
- **Partner Governance Board (PGB).** Chaired by the CPO with the PPO and Vendor
  Support Lead. Approves tier promotions/demotions, deal-registration disputes,
  exceptions to commercial defaults, and code-of-conduct actions. Decisions are
  binding.
- **Joint Delivery Review (per engagement).** Partner Engagement Lead + AdOS PSM
  review active implementations against the 10-phase methodology.

### IV.3 Cadence

Deal registration on each opportunity → **monthly pipeline sync** → **quarterly
business review (QBR)** → **annual tier review + agreement renewal**. The QBR is the
governing checkpoint for tier standing, KPI review (Article XVII), and joint
planning.

### IV.4 RACI (program operations)

| Activity | CPO | PPO | PSM | Partner |
|---|---|---|---|---|
| Approve/deny tier promotion | **A** | R | C | I |
| Maintain certifications | I | C | I | **A/R** |
| Deal registration approval | I | **A/R** | C | I (submits) |
| QBR execution | I | C | **A/R** | R |
| Escalation to vendor Tier-2 | I | I | C | **A/R** (raises) |
| Code-of-conduct enforcement | **A** | R | C | I |
| Joint marketing approval | I | **A/R** | C | R |
| Roadmap communication control | **A** | R | C | I |

*A = Accountable, R = Responsible, C = Consulted, I = Informed.*

---

## Article V — Revenue Model (Authoritative)

AdOS partner revenue comes from **exactly four legitimate streams**. AdOS is
**self-hosted / offline** with **no cloud, no API keys, and no per-token or usage
metering** — therefore **no partner revenue may ever be described as a cloud markup,
consumption charge, or usage/per-seat-metering of the software's operation.**

| # | Stream | What it is | Who keeps it |
|---|---|---|---|
| 1 | **License / subscription resale margin** | Reseller Partner resells AdOS licenses/subscriptions at a tier discount off list. | Partner keeps the margin (list − discount). |
| 2 | **Implementation & services** | The 10-phase delivery (install, configure, migrate, train, go-live). | **100% retained by the partner.** |
| 3 | **Support / managed services** | Partner-fronted Tier-1 support and optional managed operation of the customer's self-hosted instance. | 100% retained by the partner. |
| 4 | **Referral fees** | Referral Partner refers a qualified lead AdOS or a Reseller closes. | Referral fee paid to the partner. |

### V.1 Illustrative reseller discounts by tier

*Illustrative baselines set by the PGB; actuals are fixed in the executed
`PARTNER_AGREEMENT_TEMPLATE.md` and its rate schedule.*

| Tier | Illustrative reseller discount (off list) |
|---|---|
| Registered | 10% |
| Silver | 15% |
| Gold | 20% |
| Platinum | 25% |

### V.2 Illustrative referral fee

- **Referral fee:** e.g. **10% of first-year license value** — *illustrative*.
- Services revenue: **100% retained by the partner** in all cases.

### V.3 What partner revenue is NOT

- **Not** a cloud/hosting markup — AdOS has no vendor cloud; the customer self-hosts.
- **Not** per-token, per-inference, or consumption metering — inference is local and
  unmetered (default engine is a deterministic OfflineAIManager; optional local
  Ollama / OpenAI-compatible servers run on the customer's own hardware).
- **Not** a data or telemetry revenue share — AdOS collects no vendor telemetry.

Licensing is **commercial and contractual**, delivered through the Partner Agreement.
It is **not** enforced by an in-product license/entitlement server (the product has
none). Any such automation is **Roadmap** (Article XVI).

---

## Article VI — Territory Policy

- AdOS operates a **non-exclusive** territory model by default. A territory is
  defined by geography, industry vertical, and/or named-account list in the Partner
  Agreement.
- **No standing exclusivity** is granted by tier. Platinum partners may be granted
  **preferred** status (first right to co-sell, priority lead routing) in a named
  segment by PGB decision — reviewed annually at the tier review.
- Because AdOS is self-hosted with no vendor telemetry, territory performance is
  measured from **partner-reported pipeline and customer-shared outcomes**, not from
  instance monitoring.
- Cross-territory delivery is permitted where the customer requires a partner's
  specific certification or language capability (e.g. bilingual TR/EN delivery),
  subject to PPO notification and deal registration.

---

## Article VII — Deal Registration

Deal registration is the mechanism that protects a partner's investment in an
opportunity and prevents channel conflict.

- **Who registers.** Any Reseller or Implementation Partner in good standing may
  register a qualified opportunity through the Partner Program Office (and, when
  available, the Partner Portal — see `PARTNER_PORTAL_SPEC.md`, a specification, not a
  shipped system).
- **Protection window.** An approved registration grants an **illustrative 90-day
  protection window**, **renewable** on demonstrated progress, during which the
  registering partner has priority on that opportunity.
- **Approval SLA.** The PPO reviews registrations within the monthly pipeline cadence
  or sooner; approval, clarification, or denial is returned in writing.
- **Conflict rules.**
  1. **First qualified, first protected.** The earliest complete, qualified
     registration prevails.
  2. **No overlap.** A second registration for the same customer + opportunity is
     held pending, not approved in parallel.
  3. **Active-engagement precedence.** A partner already delivering the 10-phase
     methodology at that customer has precedence for adjacent expansion.
  4. **Lapse.** If the window expires without renewal or progress, protection lapses
     and the opportunity reopens.
  5. **Disputes** escalate to the Partner Governance Board (Article IV.2), whose
     decision is binding.

---

## Article VIII — Lead Sharing

- **Vendor → partner.** Inbound leads AdOS cannot serve directly are routed to
  partners by fit (territory, vertical, certification, tier, capacity). Higher tiers
  receive **priority routing**; they do not receive exclusivity.
- **Partner → vendor.** Referral Partners submit leads through the registration
  process (Article VII) to earn a referral fee (Article V.2).
- **Data handling.** Shared lead data is customer-provided or customer-shared and is
  handled under Article XIV (Compliance). AdOS does **not** harvest leads from
  deployed instances — there is no telemetry or standing access to do so.
- **Quality bar.** A shared lead must include the customer need, decision context,
  and consent to be contacted. Unqualified or duplicate leads are returned.

---

## Article IX — Joint Marketing

- **Message control.** All joint marketing must use the truthful product framing
  (top of this charter) and may reference only capabilities present in
  `../PRODUCT_TRUTH.md`. Roadmap items must carry a visible **Roadmap** label
  (Article XVI). The PPO reviews and approves partner-produced AdOS materials.
- **Brand use.** Partners use AdOS marks per the Partner Agreement and the tier badge
  they have earned. Certified individuals may display their certification badges
  (Article XI / `../customer-success/CERTIFICATION_PROGRAM.md`).
- **Eligibility & funding.** Co-marketing activity is expected at Gold and required
  at Platinum. Market-development funds, where offered, are governed by the annual
  joint business plan and approved by the PGB.
- **Prohibited claims.** No partner marketing may state or imply live ad launch,
  document Q&A / cited answers, Digital Employees / autonomous agents, external
  connectors, enforced RBAC, immutable audit, cloud inference, or vision/speech AI as
  shipped capabilities. These are forbidden present-tense claims.

---

## Article X — Joint Selling

- **Co-sell motion.** For qualifying opportunities, the AdOS PSM and the partner
  Engagement Lead run a joint pursuit: AdOS provides product truth, deal support, and
  Tier-2 escalation confidence; the partner owns the customer relationship and
  delivery commitment.
- **Roles in the deal.** Reseller Partner carries the license commercial;
  Implementation Partner carries the services statement of work; a Referral Partner's
  role ends at qualified handoff.
- **Truthful scoping.** Joint proposals scope the **human-approved pipeline** and
  **self-hosted deployment** accurately, including that campaign outputs are
  **drafts** the customer approves and exports — AdOS does not push ads to any
  platform.
- **Handoff to delivery.** A won deal enters the 10-phase methodology (Article XI)
  with a Joint Delivery Review scheduled at Discovery.

---

## Article XI — Certification Requirements

Partner **organizational tiers** are earned; **individual certifications** feed them.
The individual certification levels are defined authoritatively in
`../customer-success/CERTIFICATION_PROGRAM.md`; partner-specific enablement and exam
content lives in `PARTNER_CERTIFICATION.md` and reuses those same level names.

### XI.1 Individual certification levels (feed the tiers)

**Associate → Professional → Administrator → Architect → Partner → Trainer**
(AdOS Certified Associate/Professional/Administrator/Architect/Partner/Trainer). See
`../customer-success/CERTIFICATION_PROGRAM.md` for syllabus, exams, and validity.

### XI.2 Partner types

| Type | Role |
|---|---|
| **Referral Partner** | Refers qualified leads; earns a referral fee. Does not resell or deliver. |
| **Reseller Partner** | Resells licenses/subscriptions at a tier discount. |
| **Implementation (Delivery) Partner** | Installs, configures, migrates, trains, and supports AdOS on the customer's infrastructure. |
| **(Roadmap) Technology / ISV Partner** | Builds integrations against connector APIs — gated on connectors, which are Roadmap. See Article XVI. |

### XI.3 Delivery roles (Implementation Partners)

**Engagement Lead** (partner PM/owner), **Solution Architect**, **Implementation
Consultant**, **Trainer**, **Support Engineer**; on the customer side, an
**Executive Sponsor** and an **Admin/Champion**.

### XI.4 Organizational tiers — requirements

**Registered → Silver → Gold → Platinum.** Requirements below are **illustrative
baselines** set by the PGB; the certification level names reference
`../customer-success/CERTIFICATION_PROGRAM.md`.

| Tier | Certified staff (illustrative) | References | CSAT / other (illustrative) |
|---|---|---|---|
| **Registered** | ≥1 **Associate**; signed agreement; onboarding complete; accepts code of conduct | — | — |
| **Silver** | ≥2 certified incl. ≥1 **Administrator** | 1 reference implementation | Meets CSAT baseline; annual joint plan |
| **Gold** | ≥4 certified incl. ≥1 **Architect** + ≥2 **Administrator** | 3 reference implementations | CSAT target; active co-marketing; deal registration in good standing |
| **Platinum** | ≥8 certified incl. ≥2 **Architect** | 6 references | Top CSAT; dedicated AdOS practice; joint business plan + QBRs |

CSAT and reference counts are **partner-reported and customer-shared** (Article XVII).
Tier changes are decided at the annual tier review and ratified by the PGB.

---

## Article XII — Implementation Methodology

Every AdOS implementation follows a **fixed 10-phase methodology**, in order:

**Discovery → Planning → Installation → Configuration → Migration → Training →
Go-live → Hypercare → Acceptance → Closure.**

| Phase | Purpose | Maps to |
|---|---|---|
| 1. Discovery | Objectives, environment, stakeholders, success criteria | — |
| 2. Planning | Scope, plan, roles, entry/exit criteria, risks | — |
| 3. Installation | Stand up the self-hosted instance | `../INSTALLATION_GUIDE.md`, `../DEPLOYMENT.md` |
| 4. Configuration | Tenancy, auth, local AI engine, workspaces | `../DEPLOYMENT.md`, `../ADMIN_GUIDE.md` |
| 5. Migration | Load workspace/client/brand data; optional SQLite/Postgres persistence | `../INSTALLATION_GUIDE.md` |
| 6. Training | Admin + end-user enablement | `../customer-success/ADMINISTRATOR_TRAINING.md`, `../customer-success/END_USER_TRAINING.md` |
| 7. Go-live | Cut over to production use | `../customer-success/ONBOARDING_PLAYBOOK.md` |
| 8. Hypercare | Intensive early-life support | `../customer-success/ONBOARDING_PLAYBOOK.md`, `../customer-success/SUPPORT_PLAYBOOK.md` |
| 9. Acceptance | Formal sign-off against criteria | `../customer-success/ONBOARDING_PLAYBOOK.md` |
| 10. Closure | Handover, lessons learned, transition to run/support | `../customer-success/OPERATIONS_RUNBOOK.md` |

Each phase carries objectives, deliverables, roles, entry/exit criteria, and risks.
Installation and Configuration map to the **real self-hosted setup** on the
customer's infrastructure — there is no vendor cloud to provision.

---

## Article XIII — Escalation & Support

AdOS is self-hosted; **Tier-1 support is the partner's responsibility** (the partner
fronts the customer). Partners escalate to the **vendor for Tier-2 / product
defects**. The vendor has **no standing access** to customer instances; SLAs are
**vendor response targets, not remote-fix times.** The severity model and SLAs below
are governed by `../customer-success/SUPPORT_PLAYBOOK.md`.

| Severity | Meaning | Vendor response target (illustrative, per SUPPORT_PLAYBOOK) |
|---|---|---|
| **Sev 1 — Critical** | Production down / cannot log in / data-loss risk | 1 business hour |
| **Sev 2 — High** | Major function impaired (a pipeline stage failing), no workaround | 4 business hours |
| **Sev 3 — Normal** | Limited/partial impact, workaround exists | 1 business day |
| **Sev 4 — Low** | Question / cosmetic / how-to / enhancement idea | 2 business days |

**Escalation path.** Customer → Partner Tier-1 → (if product defect/unresolved)
Partner Support Engineer raises to AdOS Vendor Support (Tier-2) → Engineering for
confirmed defects. Expectation-gaps on non-shipped capabilities are handled as
**Sev 4** per the playbook, never as a defect. Disaster-recovery scenarios follow
`../DISASTER_RECOVERY.md` and `../BACKUP_GUIDE.md`.

---

## Article XIV — Compliance

- **Truthful representation.** Every partner claim must trace to
  `../PRODUCT_TRUTH.md`. Misrepresenting product capability is the gravest compliance
  breach.
- **Data protection.** Customer and lead data is handled per the Partner Agreement
  and applicable law. Because AdOS is self-hosted and air-gap capable with **no
  vendor telemetry**, the customer retains full custody of their data; partners must
  not exfiltrate customer data from the instance.
- **Licensing integrity.** Partners resell only validly licensed AdOS entitlements
  under the executed agreement. Licensing is contractual, not product-enforced.
- **Security.** Partners deploy AdOS using its real security controls (Argon2id
  password hashing, HMAC HttpOnly sessions, per-session CSRF, brute-force lockout,
  CSP/HSTS headers) per `../SECURITY_GUIDE.md`. Partners must not claim security
  capabilities the product does not have (e.g. enforced RBAC, immutable audit,
  DB-level row-level security — see Article XVI).
- **Certification currency.** Tier standing requires current individual
  certifications per `../customer-success/CERTIFICATION_PROGRAM.md`.
- **Audit of standing.** The PPO may request evidence (certifications, references,
  customer-shared CSAT) to verify tier standing at the annual review.

---

## Article XV — Code of Conduct

Every partner, as a condition of the program, agrees to:

1. **Tell the truth about the product.** Never promise a forbidden capability as
   shipped. Label all future capability as **Roadmap**.
2. **Put the customer's ownership first.** Respect that the customer owns and hosts
   their instance; take no standing access the customer has not granted.
3. **Compete fairly.** Honor deal registration and territory rules; do not poach a
   protected opportunity or disparage another partner.
4. **Protect data.** Safeguard customer and lead data; never exfiltrate it from a
   deployed instance.
5. **Deliver to standard.** Staff engagements with certified people and follow the
   10-phase methodology.
6. **Support honestly.** Own Tier-1; escalate real defects; classify
   expectation-gaps truthfully.
7. **Represent the brand with integrity.** Use marks and badges only as earned and
   approved.

Violations are reviewed by the Partner Governance Board and may result in remediation,
tier demotion, suspension, or termination per the Partner Agreement.

---

## Article XVI — Roadmap (Future-Only)

**Everything in this Article is future direction, not a current AdOS capability.**
None of it may be sold, marketed, or scoped as shipped. It is listed here so partners
can plan and so that no one mistakes a roadmap idea for a present feature.

- **Technology / ISV Partner type and connector APIs.** A future ISV program gated on
  **external connector APIs** (to ad platforms, CRMs, data warehouses). Today
  `connector-hub` is an unwired stub; metrics are hand-entered.
- **In-product licensing / entitlement automation.** A future license/entitlement
  server enforcing entitlements in-product. Today licensing is purely contractual.
- **Partner Portal automation.** `PARTNER_PORTAL_SPEC.md` describes a *proposed*
  program portal (a specification, "shall/should"), not a shipped system.
- **Document knowledge base & cited answers** ("ask your documents"). Not present.
- **Digital Employees / autonomous agents** doing work without human approval. Not
  present; the pipeline is human-gated at every stage.
- **Live ad launch & optimization** / pushing ads to Meta/Google/TikTok/LinkedIn.
  Not present; outputs are **drafts** the customer exports.
- **Enforced RBAC / permission-aware AI.** Roles exist but are never enforced today.
- **Immutable / tamper-evident audit trail.** Only an activity log + per-approval
  timeline exist today.
- **DB-level row-level security.** Isolation today is application-level only.
- **Cloud / hosted inference.** No cloud inference; the flag is never read.
- **Vision / speech / image / video AI.** Declared in a type enum, no engine.

---

## Article XVII — Success KPIs

Partner performance is measured through **partner-reported and customer-shared**
signals. **AdOS collects no vendor telemetry and has no standing access to customer
instances**, so none of the following is auto-collected from a deployed system.

| KPI | Source | Cadence |
|---|---|---|
| Certified staff by level | Partner-reported, verified vs `../customer-success/CERTIFICATION_PROGRAM.md` | QBR / annual |
| Reference implementations | Partner-reported + customer-shared | QBR |
| Registered pipeline & win rate | Partner-reported (deal registration) | Monthly |
| License resale bookings | Contractual (order records) | QBR |
| Services revenue delivered | Partner-reported | QBR |
| Customer CSAT | **Customer-shared** survey results | QBR |
| Customer health / renewals | Customer-shared; see `../customer-success/CUSTOMER_HEALTH.md` | QBR |
| Support responsiveness (Tier-1) | Partner-reported vs Sev model | QBR |
| Co-marketing activity | Partner-reported + PPO records | QBR |

Forecasts and customer-health indicators are likewise **partner-reported /
customer-shared** — never inferred from instance monitoring, which does not exist.

---

## Precedence & Amendment

- **Precedence.** `../PRODUCT_TRUTH.md` > this Constitution > all other partner
  documents. No sibling document may expand product claims beyond
  `../PRODUCT_TRUTH.md`.
- **Amendment.** Only the Office of the Chief Partner Officer may amend this
  Constitution, with Partner Governance Board ratification. Amendments increment the
  version and re-confirm alignment to the then-current AdOS release.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
