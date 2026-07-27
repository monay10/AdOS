# AdOS Partner Portal — SPECIFICATION

| Field | Value |
|---|---|
| **Document** | Partner Portal Specification |
| **Owner** | Partner Portal / Product |
| **Status** | Official SPEC — aligned to `../PRODUCT_TRUTH.md` |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Source of truth** | [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md) |
| **Product one-liner** | AdOS — **Enterprise AI Operating System for Advertising** |

> ## ⚠️ This is a specification. The portal is NOT yet built.
> This document describes a **proposed** partner-program portal as a design
> specification. **No partner portal exists today**; nothing here is shipped,
> deployed, or purchasable. Requirements are written in specification language
> ("The portal **SHALL** / **SHOULD** / **MAY** …"). What gets built, and in what
> order, is governed by the **[Build Roadmap](#12-build-roadmap--phasing)** at the
> end of this document.
>
> **The portal is program infrastructure for AdOS partners. It is NOT an AdOS
> product feature and it does NOT add, change, or extend any AdOS product
> capability.** Every AdOS product reference in this spec is constrained by
> `../PRODUCT_TRUTH.md`; product capabilities that do not exist there appear here
> only under an explicit **Roadmap** label.

---

## 1. Purpose & scope

### 1.1 Purpose

The Partner Portal SHALL be the single self-service web property through which
AdOS partners — **Referral**, **Reseller**, and **Implementation (Delivery)**
partners — enable their staff, obtain sales and marketing collateral, deliver
customer implementations, manage commercial licensing/orders, and receive
support. It exists to operationalise the AdOS partner program; it is a
**program tool**, not part of the AdOS product that partners resell and deploy.

### 1.2 In scope

- Partner enablement (training, certification tracking).
- Distribution of the vendor's existing repo collateral (sales, marketing,
  customer-success, product documentation).
- A knowledge base and reference-story library for the partner community.
- Commercial licensing/order/renewal visibility as a **portal function**.
- Partner-facing support intake and escalation to the vendor.
- A partner community forum.

### 1.3 Out of scope (hard boundaries)

- **The portal SHALL NOT add or modify any AdOS product capability.** AdOS
  remains a self-hosted, offline-first, 100% local-AI advertising platform that
  **drafts** (never launches) campaigns, per `../PRODUCT_TRUTH.md`.
- **The portal SHALL NOT ingest data from customer AdOS instances.** AdOS is
  self-hosted with no vendor telemetry, no phone-home, and no standing vendor
  access. All partner performance, pipeline, CSAT, and customer-health figures
  in the portal are **partner-reported or customer-shared**, never
  auto-collected from deployed instances.
- **The portal SHALL NOT act as an in-product license-enforcement or entitlement
  server.** AdOS has no such server. Licensing in the portal is a
  **commercial/contractual record-keeping** function only (see §11).
- **No cloud/SaaS AdOS, no usage metering, no per-token billing** is implied,
  created, or reported anywhere in the portal.

### 1.4 Truthful AdOS product framing (binding on all portal copy)

Any AdOS product statement rendered by the portal — in Training, Knowledge Base,
Sales Kit, etc. — SHALL trace to `../PRODUCT_TRUTH.md`. In particular the portal
SHALL present AdOS as:

- Self-hosted / on-prem / air-gap capable; **no cloud, no API keys, no metered
  billing**. Default engine is the deterministic OfflineAIManager; genuine model
  prose requires a **local** Ollama / OpenAI-compatible server.
- A **human-approved pipeline** (Mission → marketing brief → creative ad copy →
  campaign **draft** → performance report → executive dashboard); **every stage
  needs a human approval click**. Gates: `strategy_and_budget`,
  `creative_assets`, `campaign_launch`.
- **Company Brain = marketing-performance memory** (CompanyDNA, brand profiles,
  insights, campaign→ad→lead→ROI graph, winning-ad pattern library, experience
  engine) — **not** a document library and **not** document Q&A.
- Application-level multi-tenant isolation; real auth (Argon2id, HMAC sessions,
  CSRF, brute-force lockout, CSP/HSTS); optional SQLite/Postgres persistence;
  bilingual TR/EN.

The portal SHALL NOT present as present-tense AdOS capability any of: document
Q&A / cited answers; "Digital Employees" / autonomous agents; live ad
launch/optimization; external connectors/syncs; enforced RBAC / permission-aware
AI; immutable audit trail; DB-level RLS; cloud/hosted inference; vision/speech AI;
tiered T0–T4 approval authority. These are **Roadmap-only** for the product and
must be labelled as such wherever mentioned.

---

## 2. Portal roles & access model

> These roles govern the **portal**. They are **not** the AdOS product's roles,
> and they do **not** imply the AdOS product enforces RBAC — per
> `../PRODUCT_TRUTH.md`, product roles are defined but not enforced. Portal
> access control is a property of this proposed portal only.

### 2.1 Portal role definitions

| Role | Belongs to | Purpose (within the portal) |
|---|---|---|
| **Portal Administrator** | Vendor (AdOS) | Full portal administration; manages partner orgs, content, tiers, licensing records. |
| **Program Manager** | Vendor (AdOS) | Manages enablement, certification approvals, deal registration, QBR cadence. |
| **Partner Org Admin** | Partner | Manages their own org's members, sees org-wide licensing/orders, deal registration, and tier status. |
| **Partner Member** | Partner | Individual partner staff; consumes training, downloads, KB, forum; raises support tickets. |
| **Certified Individual** | Partner | A Partner Member holding one or more certifications; unlocks role-gated enablement and delivery content. |
| **Guest / Prospective Partner** | External | Read-only access to public program overview and application form only. |

### 2.2 Access model requirements

- The portal **SHALL** scope all partner-org data (licensing records, deal
  registrations, org members, support tickets) to the owning partner
  organization; a Partner Member SHALL NOT see another organization's data.
- The portal **SHALL** map individual certifications
  (Associate → Professional → Administrator → Architect → Partner → Trainer,
  defined in [`../customer-success/CERTIFICATION_PROGRAM.md`](../customer-success/CERTIFICATION_PROGRAM.md))
  to content-visibility rules for Certified Individuals.
- The portal **SHALL** reflect organizational partner tiers
  (**Registered → Silver → Gold → Platinum**) and MAY gate premium collateral,
  margins, and co-marketing modules by tier.
- Role and tier data in the portal are administrative program records; they
  **SHALL NOT** be synchronised into, or derived from, any customer AdOS
  instance.

---

## 3. Information architecture overview

### 3.1 Top-level navigation

The portal **SHALL** present the following top-level areas, each specified in
§4–§13:

```
AdOS Partner Portal
├── Dashboard ............ tier status, tasks, announcements, QBR/renewal dates
├── Enablement
│   ├── Training ......... §4
│   ├── Certification .... §5
│   └── Knowledge Base ... §9
├── Resources
│   ├── Downloads ........ §6  (product docs & installers reference)
│   ├── Sales Kit ........ §7  (../sales)
│   └── Marketing Kit .... §8  (../marketing)
├── Delivery
│   ├── Cases ............ §10 (reference stories)
│   └── Support .......... §11
├── Commercial
│   └── Licensing ........ §12 (orders / entitlements / renewals — portal function)
├── Community
│   └── Forum ............ §14
└── Roadmap .............. §13 (program & product roadmap, clearly labelled)
```

### 3.2 Cross-cutting requirements

- Every content module **SHALL** declare a **content source** that is either
  authored in the portal or **sourced from existing repo collateral** by exact
  relative path. The portal is a distribution surface; the repo remains the
  system of record for collateral.
- All modules **SHALL** be available in **Turkish and English** (§13.2).
- Content that references the AdOS product **SHALL** be validated against
  `../PRODUCT_TRUTH.md` before publication (§13.1, §13.5).

---

## 4. Module: Training

**Purpose.** Provide structured, role-based enablement so partner staff can
sell, position, deploy, and support AdOS accurately.

**Key functions.** The portal **SHALL**:
- Offer learning paths aligned to the delivery roles (Engagement Lead, Solution
  Architect, Implementation Consultant, Trainer, Support Engineer) and to the
  three partner types (Referral, Reseller, Implementation).
- Track per-user progress, completion, and prerequisites.
- Present the **10-phase implementation methodology** — Discovery → Planning →
  Installation → Configuration → Migration → Training → Go-live → Hypercare →
  Acceptance → Closure — as the delivery-training backbone.
- Surface product-accurate module content (self-hosted install/deploy, the
  human-approved pipeline, Company Brain as marketing-performance memory).

**Roles/permissions.** Partner Members consume; Partner Org Admin sees org-wide
completion; Program Manager curates paths; Portal Administrator publishes.

**Content source.**
- Product/technical training references [`../INSTALLATION_GUIDE.md`](../INSTALLATION_GUIDE.md),
  [`../DEPLOYMENT.md`](../DEPLOYMENT.md), [`../ADMIN_GUIDE.md`](../ADMIN_GUIDE.md),
  [`../USER_GUIDE.md`](../USER_GUIDE.md), [`../AI_GUIDE.md`](../AI_GUIDE.md).
- Role/end-user training references
  [`../customer-success/ADMINISTRATOR_TRAINING.md`](../customer-success/ADMINISTRATOR_TRAINING.md)
  and [`../customer-success/END_USER_TRAINING.md`](../customer-success/END_USER_TRAINING.md).

**Acceptance criteria.**
- AC-T1: A Partner Member can view a role-based path and resume at their last
  incomplete unit.
- AC-T2: Every product claim in a training unit traces to `../PRODUCT_TRUTH.md`;
  no unit presents a forbidden capability as shipped.
- AC-T3: Completion state is scoped to the member's own organization.
- AC-T4: All units render in TR and EN.

---

## 5. Module: Certification

**Purpose.** Verify individual competency and feed the organizational partner
tier requirements.

**Key functions.** The portal **SHALL**:
- Track individual certification levels
  (Associate → Professional → Administrator → Architect → Partner → Trainer) as
  defined in [`../customer-success/CERTIFICATION_PROGRAM.md`](../customer-success/CERTIFICATION_PROGRAM.md).
- Deliver partner-specific exam/enablement content and record pass/fail,
  issue-date, and expiry.
- Roll individual certifications up to org-tier eligibility
  (Registered/Silver/Gold/Platinum), showing gaps to next tier.
- Issue verifiable certificates/badges scoped to the individual.

**Roles/permissions.** Certified Individuals hold credentials; Partner Org Admin
sees org roster and tier gap; Program Manager approves/revokes; Portal
Administrator configures exams.

**Content source.** Certification framework and level names from
[`../customer-success/CERTIFICATION_PROGRAM.md`](../customer-success/CERTIFICATION_PROGRAM.md);
partner-specific exam content authored in-portal (a companion
`PARTNER_CERTIFICATION.md`, when published, is the intended home for exam blueprints).

**Acceptance criteria.**
- AC-C1: Passing an exam updates the individual's level and recomputes org-tier
  eligibility.
- AC-C2: Tier requirements shown match the certification level names in the CS
  program document.
- AC-C3: Expiry triggers a renewal reminder; lapsed certs no longer count toward
  tier.
- AC-C4: Certificate verification does not expose any other partner's data.

---

## 6. Module: Downloads

**Purpose.** Give partners a single place to obtain the current, product-accurate
AdOS documentation set and self-hosted install artifacts they need to deploy for
customers.

**Key functions.** The portal **SHALL**:
- Publish versioned links to the official product documentation
  (installation, deployment, admin, security, backup, disaster recovery,
  upgrade, known limitations, release notes).
- Clearly version each artifact against the AdOS release it matches (v1.0.0).
- Reflect that AdOS is **self-hosted**: downloads support on-prem/air-gap install,
  not access to any vendor cloud.

**Roles/permissions.** Partner Members download; Portal Administrator manages the
catalog and versions.

**Content source.** The real repo product docs, including
[`../INSTALLATION_GUIDE.md`](../INSTALLATION_GUIDE.md),
[`../DEPLOYMENT.md`](../DEPLOYMENT.md),
[`../ADMIN_GUIDE.md`](../ADMIN_GUIDE.md),
[`../SECURITY_GUIDE.md`](../SECURITY_GUIDE.md),
[`../BACKUP_GUIDE.md`](../BACKUP_GUIDE.md),
[`../DISASTER_RECOVERY.md`](../DISASTER_RECOVERY.md),
[`../UPGRADE_GUIDE.md`](../UPGRADE_GUIDE.md),
[`../KNOWN_LIMITATIONS.md`](../KNOWN_LIMITATIONS.md),
[`../RELEASE_NOTES.md`](../RELEASE_NOTES.md).

**Acceptance criteria.**
- AC-D1: Each download states its AdOS version and matches the repo source.
- AC-D2: No download description implies cloud delivery, telemetry, or metered
  usage.
- AC-D3: Access is authenticated; Guests cannot download partner-only artifacts.

---

## 7. Module: Sales Kit

**Purpose.** Equip Referral and Reseller partners to position and sell AdOS
accurately.

**Key functions.** The portal **SHALL**:
- Distribute the vendor sales collateral (brochure, one-pager, proposal template,
  objection handling, sales FAQ, ROI calculator spec, case studies).
- Present the truthful category label **"Enterprise AI Operating System for
  Advertising"** and never "Advertising Operating System".
- Provide deal-registration entry and reseller-margin/referral-fee reference
  (illustrative figures, marked illustrative — Reseller discount by tier, referral
  fee on first-year license, 90-day deal-reg window; services revenue 100%
  retained by the partner).

**Roles/permissions.** Partner Members view/download; Reseller/Referral partners
register deals; Program Manager administers deal registration.

**Content source.** The real repo sales collateral:
[`../sales/BROCHURE.md`](../sales/BROCHURE.md),
[`../sales/ONE_PAGER.md`](../sales/ONE_PAGER.md),
[`../sales/PROPOSAL_TEMPLATE.md`](../sales/PROPOSAL_TEMPLATE.md),
[`../sales/OBJECTION_HANDLING.md`](../sales/OBJECTION_HANDLING.md),
[`../sales/SALES_FAQ.md`](../sales/SALES_FAQ.md),
[`../sales/ROI_CALCULATOR_SPEC.md`](../sales/ROI_CALCULATOR_SPEC.md),
[`../sales/CASE_STUDIES.md`](../sales/CASE_STUDIES.md).

**Acceptance criteria.**
- AC-SK1: All sales assets link to the repo `../sales` source; no divergent copy
  is authored in the portal.
- AC-SK2: Portal-rendered positioning uses "Enterprise AI Operating System for
  Advertising" and contains no forbidden product claim.
- AC-SK3: Commercial figures are labelled "illustrative" and describe
  margin/referral/services revenue — never cloud markup or consumption billing.

---

## 8. Module: Marketing Kit

**Purpose.** Enable partner-led and co-branded demand generation with
brand-consistent, product-accurate assets.

**Key functions.** The portal **SHALL**:
- Distribute marketing assets (messaging, website copy, blog/LinkedIn content,
  press kit, launch campaign, SEO plan, brand assets).
- Enforce brand and positioning rules (correct category label; correct Turkish
  wording **"Reklam için Kurumsal Yapay Zekâ İşletim Sistemi"**; never "Reklam
  İşletim Sistemi").
- Provide co-marketing request/approval workflow gated by partner tier.

**Roles/permissions.** Partner Members download; Gold/Platinum unlock co-marketing
requests; Program Manager approves co-marketing.

**Content source.** The real repo marketing collateral:
[`../marketing/MARKETING_ASSETS.md`](../marketing/MARKETING_ASSETS.md),
[`../marketing/WEBSITE_CONTENT.md`](../marketing/WEBSITE_CONTENT.md),
[`../marketing/BLOG_ARTICLES.md`](../marketing/BLOG_ARTICLES.md),
[`../marketing/LINKEDIN_CONTENT.md`](../marketing/LINKEDIN_CONTENT.md),
[`../marketing/PRESS_KIT.md`](../marketing/PRESS_KIT.md),
[`../marketing/LAUNCH_CAMPAIGN.md`](../marketing/LAUNCH_CAMPAIGN.md),
[`../marketing/SEO_MASTER_PLAN.md`](../marketing/SEO_MASTER_PLAN.md).

**Acceptance criteria.**
- AC-MK1: Assets link to `../marketing` source; brand rules are enforced on any
  co-branded output.
- AC-MK2: TR/EN parity with correct Turkish diacritics on positioning strings.
- AC-MK3: No asset claims a forbidden product capability as shipped.

---

## 9. Module: Knowledge Base

**Purpose.** Provide searchable how-to, positioning, deployment, and
troubleshooting reference for partner staff.

> This is a **portal content library** curated by the vendor. It is **not** the
> AdOS product's Company Brain, and it must not be described as document Q&A or
> cited-answer search — the AdOS product has neither (`../PRODUCT_TRUTH.md`).

**Key functions.** The portal **SHALL**:
- Organise articles by topic (positioning, install/deploy, security, delivery
  methodology, support) with keyword search and tagging.
- Cross-link to the authoritative repo docs rather than duplicating them.
- Version articles and flag any that reference a specific AdOS release.

**Roles/permissions.** Partner Members read; Program Manager/Portal Administrator
author and publish; Certified Individuals may see role-gated advanced articles.

**Content source.** Repo product and operations docs, e.g.
[`../ARCHITECTURE.md`](../ARCHITECTURE.md),
[`../SECURITY_GUIDE.md`](../SECURITY_GUIDE.md),
[`../OPERATIONS_GUIDE.md`](../OPERATIONS_GUIDE.md),
[`../RUNBOOK.md`](../RUNBOOK.md),
[`../KNOWN_LIMITATIONS.md`](../KNOWN_LIMITATIONS.md), and the CS playbooks under
[`../customer-success/`](../customer-success/).

**Acceptance criteria.**
- AC-KB1: Search returns relevant articles by keyword/tag.
- AC-KB2: No article describes the KB (or the product Company Brain) as document
  Q&A or cited answers.
- AC-KB3: Articles referencing product behaviour trace to `../PRODUCT_TRUTH.md`.

---

## 10. Module: Cases (reference stories)

**Purpose.** Give partners approved reference stories to support sales and
delivery conversations.

**Key functions.** The portal **SHALL**:
- Host approved reference implementations and outcome stories, tagged by
  industry, partner type, and delivery phase coverage.
- Present outcome metrics as **partner-reported / customer-shared**, with a
  visible provenance note — never as figures auto-collected from a customer's
  self-hosted AdOS instance.
- Support a submission → vendor-review → publish workflow for new stories.

**Roles/permissions.** Partner Members read approved stories; Partner Org Admin
submits; Program Manager reviews/approves; Portal Administrator publishes.

**Content source.** [`../sales/CASE_STUDIES.md`](../sales/CASE_STUDIES.md) and
partner-submitted stories curated by the vendor.

**Acceptance criteria.**
- AC-CS1: Every published metric carries a "partner-reported / customer-shared"
  provenance note.
- AC-CS2: No story implies vendor telemetry, live ad launch, or any forbidden
  capability.
- AC-CS3: Only vendor-approved stories are publicly visible in the portal.

---

## 11. Module: Support

**Purpose.** Provide partner-facing support intake and structured escalation to
the vendor within the self-hosted support model.

**Key functions.** The portal **SHALL**:
- Let partners raise and track tickets using severities **Sev 1–4** consistent
  with [`../customer-success/SUPPORT_PLAYBOOK.md`](../customer-success/SUPPORT_PLAYBOOK.md).
- Reflect the self-hosted support model: **Tier-1 is the partner's
  responsibility** (they front the customer); the portal is used to **escalate
  Tier-2 / product defects** to the vendor.
- Express SLAs as vendor **response** targets, not remote-fix or uptime
  guarantees; the vendor has **no standing access** to customer instances.
- Require partners to attach the diagnostic detail they collect on-site, since
  the portal cannot pull anything from a customer instance.

**Roles/permissions.** Partner Members raise/track their org's tickets; Partner
Org Admin sees all org tickets; Program Manager/Portal Administrator triage and
respond.

**Content source.** [`../customer-success/SUPPORT_PLAYBOOK.md`](../customer-success/SUPPORT_PLAYBOOK.md);
operational references [`../customer-success/OPERATIONS_RUNBOOK.md`](../customer-success/OPERATIONS_RUNBOOK.md),
[`../DISASTER_RECOVERY.md`](../DISASTER_RECOVERY.md).

**Acceptance criteria.**
- AC-SP1: Tickets use Sev 1–4 matching the CS support playbook.
- AC-SP2: SLA copy states response targets and "no standing vendor access"; it
  never promises remote fix or ingestion from customer instances.
- AC-SP3: Ticket visibility is scoped to the raising organization.

---

## 12. Module: Licensing

> **Licensing here is a commercial / contractual PORTAL function** — a record of
> orders, entitlements, and renewals negotiated under the partner agreement. It
> is **NOT** an in-product license-enforcement or entitlement server: the AdOS
> product has none (`../PRODUCT_TRUTH.md`). The portal does **not** validate,
> activate, meter, or enforce licenses inside any AdOS deployment, and there is
> **no usage or per-token metering** anywhere.

**Purpose.** Give partners visibility into their commercial orders, customer
license entitlements (as contractual records), and upcoming renewals.

**Key functions.** The portal **SHALL**:
- Display the partner's **orders** (what was purchased/resold) as commercial
  records.
- Display **entitlement records** — the contractual license terms per customer
  (edition, seats/scope, term dates) — sourced from the executed agreement and
  vendor order records, **not** from any deployed instance.
- Track **renewals** and surface upcoming renewal/QBR dates and reseller margin
  by tier (illustrative).
- Show deal-registration status feeding these orders.

The portal **SHALL NOT**: issue product license keys that gate runtime,
phone-home to validate a license, meter usage, or read anything from a customer's
AdOS instance. Any such automation is **Roadmap** (see §13).

**Roles/permissions.** Partner Org Admin sees all org orders/entitlements/renewals;
Partner Members see records they are entitled to; Program Manager/Portal
Administrator maintain order and entitlement records.

**Content source.** Vendor order/entitlement records keyed to the executed partner
agreement (a companion `PARTNER_AGREEMENT_TEMPLATE.md`, when published, is the
contractual basis). Commercial terms/margins are illustrative and marked as such.

**Acceptance criteria.**
- AC-L1: Entitlement records are presented as contractual terms with no claim of
  in-product enforcement or activation.
- AC-L2: No screen shows usage counts, token counts, or metered consumption.
- AC-L3: Renewal reminders fire on term dates from the commercial record, not from
  instance data.
- AC-L4: Order/entitlement visibility is scoped to the owning partner org.

---

## 13. Non-functional requirements

### 13.1 Content governance & product-truth alignment

- Any module rendering an AdOS product claim **SHALL** validate it against
  `../PRODUCT_TRUTH.md` before publication. Forbidden capabilities appear only
  under a **Roadmap** label.
- The portal **SHALL** carry a review gate (Program Manager / Portal
  Administrator) that blocks publication of copy conflicting with product truth.

### 13.2 Internationalization (TR/EN)

- The portal **SHALL** provide full **Turkish and English** parity across
  navigation, module content, and system messages, matching the product's own
  bilingual TR/EN posture.
- Turkish content **SHALL** use correct diacritics (İ/ı/ş/ğ/ç/ö/ü) and the
  approved category label **"Reklam için Kurumsal Yapay Zekâ İşletim Sistemi"**;
  it **SHALL NOT** emit "Reklam İşletim Sistemi".
- Users **SHOULD** be able to switch language per session; certificates and legal
  records **SHOULD** record the language of issue.

### 13.3 Security

- The portal **SHALL** authenticate all non-public access and enforce
  organization-scoped authorization for all partner data (licensing, tickets,
  deal registration, certification rosters).
- The portal **SHOULD** apply the same class of protections the product
  demonstrates — strong password hashing, signed sessions, CSRF protection,
  brute-force lockout, and CSP/HSTS security headers (ref
  [`../SECURITY_GUIDE.md`](../SECURITY_GUIDE.md)).
- The portal **SHALL NOT** store, request, or transit any data pulled from a
  customer AdOS instance; partner-reported figures are entered by partners.
- The portal **SHALL** keep an administrative activity log of portal actions.
  (This is a portal operations log; it does not imply the product has an
  immutable audit trail — it does not, per `../PRODUCT_TRUTH.md`.)

### 13.4 Availability & operations

- The portal **SHOULD** target a defined availability objective (e.g. 99.5%
  monthly, illustrative) with scheduled-maintenance windows communicated in
  advance.
- Portal outages **SHALL** have **no effect** on any deployed AdOS instance —
  AdOS runs self-hosted and offline-capable and does not depend on the portal.
- The portal **SHOULD** support backup/restore and disaster-recovery procedures
  consistent with the vendor's operational practices
  ([`../BACKUP_GUIDE.md`](../BACKUP_GUIDE.md),
  [`../DISASTER_RECOVERY.md`](../DISASTER_RECOVERY.md)).

### 13.5 Accessibility & compatibility

- The portal **SHOULD** meet WCAG 2.1 AA and function on current evergreen
  browsers, responsive to desktop and mobile.

---

## 14. Module: Forum

**Purpose.** Provide a moderated community space for partner staff to exchange
delivery experience, positioning tips, and program questions.

**Key functions.** The portal **SHALL**:
- Offer topic categories (positioning, delivery/methodology, technical/self-hosted
  deployment, program/commercial), threaded discussion, search, and reactions.
- Provide vendor moderation, a code-of-conduct gate, and the ability to promote a
  vetted answer into the Knowledge Base (§9).
- Label unofficial community content clearly so it is not mistaken for
  authoritative product truth.

**Roles/permissions.** Partner Members post/reply; Certified Individuals may
access advanced/delivery categories; Program Manager/Portal Administrator moderate.

**Content source.** Partner-authored community content (user-generated), curated
and moderated by the vendor; promoted answers flow into `../` KB sources under
review.

**Acceptance criteria.**
- AC-F1: Community posts are visually distinguished from official/vendor content.
- AC-F2: Moderation can remove posts that state forbidden product capabilities as
  fact.
- AC-F3: Access requires an authenticated partner account with accepted code of
  conduct.

---

## 15. Build Roadmap & phasing

> The portal **does not exist yet**. This section defines the **proposed** build
> order. It also lists **product** Roadmap items that partner-facing content must
> keep clearly labelled as future (never shipped). Phase dates/figures are
> illustrative.

### 15.1 Portal build phases (proposed)

| Phase | Theme | Modules delivered | Exit criteria |
|---|---|---|---|
| **P0** | Foundation | Auth, portal roles/tiers (§2), IA (§3), TR/EN framework, content-governance gate (§13.1) | Partner org can be created; roles enforced; TR/EN shell live |
| **P1** | Enablement | Training (§4), Certification (§5), Knowledge Base (§9) | A member completes a path and earns a certification that rolls up to tier |
| **P2** | Resources | Downloads (§6), Sales Kit (§7), Marketing Kit (§8) | All assets sourced from `../sales`, `../marketing`, and product docs; brand rules enforced |
| **P3** | Delivery & Commercial | Cases (§10), Support (§11), Licensing (§12) | Sev 1–4 tickets flow; licensing shows orders/entitlements/renewals as commercial records |
| **P4** | Community | Forum (§14) | Moderated forum live; promote-to-KB working |
| **P5** | Hardening | Availability/DR (§13.4), accessibility (§13.5), full validation | NFR targets met; product-truth validation clean |

### 15.2 Product Roadmap items (labelled — NOT shipped, NOT portal features)

These are **AdOS product** future directions per `../PRODUCT_TRUTH.md` §4–§5 and
`../ROADMAP.md`. Partner-facing content **SHALL** present them only as Roadmap:

- Document knowledge base / cited answers over documents.
- Autonomous agents / "Digital Employees".
- Live ad launch & campaign optimization; ad-platform connectors/syncs.
- Enforced RBAC / permission-aware AI.
- Immutable audit trail; DB-level Row-Level Security.
- Cloud/hosted inference; vision/speech/image AI.
- Tiered T0–T4 approval authority.
- **(Roadmap) Technology/ISV partner track** — gated on the connector APIs above,
  which are Roadmap.
- **(Roadmap) Portal↔product licensing automation** — any activation/entitlement
  automation touching a deployed instance is future-only; today licensing is a
  commercial/contractual portal record (§12).

Reference: [`../ROADMAP.md`](../ROADMAP.md),
[`../KNOWN_LIMITATIONS.md`](../KNOWN_LIMITATIONS.md).

---

## 16. Open questions

- Final hosting/operating model for the portal (vendor-operated program tool).
- Whether individual certification records integrate directly with the CS program
  system of record or mirror it.
- Definitive illustrative→contractual figures (margins, referral %, deal-reg
  window) pending the executed partner agreement.

---

*Documentation only. No application code, packages, domains, or tests were
modified. Aligned to PRODUCT_TRUTH.md.*
