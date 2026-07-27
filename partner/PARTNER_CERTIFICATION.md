# AdOS Partner Certification (Organizational Tiering)

**Owner:** Partner Certification
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)

> **Product framing (verbatim).** AdOS is the **Enterprise AI Operating System for
> Advertising** — an offline-first, 100% local-AI platform that takes a client's
> advertising objective (a **Mission**) through a **human-approved pipeline**
> (marketing brief → creative ad copy → campaign **draft** → performance report →
> executive dashboard) and remembers what works in a marketing-performance
> **Company Brain**. It **drafts**; it never launches live ads.
> TR: **"Reklam için Kurumsal Yapay Zekâ İşletim Sistemi"**.
> The phrase "Advertising Operating System" appears nowhere in this program.

---

## 0. Purpose & scope

This document is the official specification for **AdOS Partner Certification**, the
**organizational** tiering of the AdOS partner ecosystem. It defines four partner
levels — **Registered → Silver → Gold → Platinum** — and, for each, the
requirements, training, partner competency exam, reference-project evidence rules,
customer-satisfaction thresholds, annual renewal, and commercial benefits.

**Relationship to the individual certifications.** This program does **not** redefine
the six *individual* AdOS credentials. Those — **Associate (ACA) → Professional
(ACP) → Administrator (ACAD) → Architect (ACAR) → Partner (ACPT) → Trainer (ACT)** —
are specified in
[../customer-success/CERTIFICATION_PROGRAM.md](../customer-success/CERTIFICATION_PROGRAM.md).
The organizational tiers below are earned by an organization through **counts of
individuals holding those individual credentials**, plus validated reference
projects and customer-attested satisfaction. Where a tier says "≥2 Administrators,"
it means two people each holding a current **ACAD** as defined in that program.

**Governing consistency.** Tier requirements, partner types, methodology, and
commercial defaults here are kept consistent with
[./PARTNER_PROGRAM_CONSTITUTION.md](./PARTNER_PROGRAM_CONSTITUTION.md). Where this
document and PRODUCT_TRUTH.md ever disagree, **PRODUCT_TRUTH.md wins**.

**Self-hosted, offline, no vendor telemetry.** AdOS is customer self-hosted, runs
offline, and phones nothing home. Therefore **every** metric in this program —
reference projects, certified-staff counts, deal/revenue figures, and CSAT — is
**partner-submitted and/or customer-attested**, never collected from a customer's
running instance. There is no cloud metering and no consumption billing anywhere in
this program.

**Foundational constraint — real behavior only.** Partner competency exams and
reference projects test **only** shipped AdOS behavior: the human-approved pipeline
(with the three approval gates `strategy_and_budget`, `creative_assets`,
`campaign_launch`); local AI engines (deterministic OfflineAIManager default, or a
local Ollama / OpenAI-compatible server); real authentication (Argon2id, HMAC
sessions, CSRF, brute-force lockout, CSP/HSTS); optional SQLite/Postgres persistence
with backup/restore; application-level multi-tenant isolation; the **Company
Brain** as a marketing-performance memory; deterministic ad KPIs (CTR/CPC/CPA/CPL/
ROAS/ROI, hand-entered); and bilingual **TR/EN**. Anything not shipped lives only in
the clearly-labeled **[§9 Roadmap](#9-roadmap--future-certification-capability)** and
is **never** exam or reference-project content.

---

## 1. Partner types & how tiers apply

The organizational tiers apply across all partner types defined in the program
constitution:

- **Referral Partner** — refers leads; earns a referral fee.
- **Reseller Partner** — resells licenses/subscriptions at a tier discount.
- **Implementation (Delivery) Partner** — installs, configures, migrates, trains,
  and supports AdOS on the customer's own infrastructure.
- **(Roadmap) Technology/ISV Partner** — builds integrations; gated on connector
  APIs, which are Roadmap (see [§9](#9-roadmap--future-certification-capability)).

A single organization may hold more than one partner type. Tier requirements that
reference certified staff, reference projects, and CSAT apply to any partner that
delivers or operates AdOS. Referral-only partners qualify at **Registered** and may
advance if they also meet the certified-staff and reference-project thresholds.

Delivery follows the fixed **10-phase implementation methodology** (Discovery →
Planning → Installation → Configuration → Migration → Training → Go-live →
Hypercare → Acceptance → Closure) defined in
[./PARTNER_PROGRAM_CONSTITUTION.md](./PARTNER_PROGRAM_CONSTITUTION.md), which maps to
the real self-hosted setup in [../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md)
and [../DEPLOYMENT.md](../DEPLOYMENT.md), training in
[../customer-success/ADMINISTRATOR_TRAINING.md](../customer-success/ADMINISTRATOR_TRAINING.md)
and [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md),
and go-live/support in
[../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md)
and [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md).

> **All numbers below are illustrative baselines.** Certified-staff counts,
> reference-project counts, deal/revenue thresholds, discounts, and CSAT targets are
> illustrative defaults for calibration; the governing values are set in
> [./PARTNER_PROGRAM_CONSTITUTION.md](./PARTNER_PROGRAM_CONSTITUTION.md) and the
> executed partner agreement.

---

## 2. Level 1 — Registered

**Purpose.** Entry level. Establishes the relationship and confirms the partner can
represent AdOS truthfully.

**Requirements.**
- Signed partner agreement; partner onboarding complete; accepts the code of conduct.
- **≥1 individual holding a current ACA (Associate)** — see
  [../customer-success/CERTIFICATION_PROGRAM.md](../customer-success/CERTIFICATION_PROGRAM.md).
- Deal/revenue threshold: none (illustrative — entry level).
- Reference projects: none required.

**Training.** AdOS partner onboarding + the foundational enablement track
([../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md));
at least one staff member completes the **ACA** pathway.

**Exam (partner competency assessment).** Registered-level **truthful-positioning
check** (see [§6](#6-partner-competency-exam-blueprint)): the nominated
representative must correctly describe AdOS as the human-approved, **drafts-only**,
offline local-AI pipeline and correctly separate shipped capability from Roadmap. Any
forbidden claim (live ad launch, document Q&A, autonomous "Digital Employees",
external connectors, enforced RBAC, immutable audit) is a fail until corrected.

**Reference projects.** None required at this level.

**Customer satisfaction (CSAT).** No threshold; partners are expected to adopt the
customer-attested CSAT process before advancing.

**Renewal.** Annual re-qualification: agreement in good standing, code of conduct
re-accepted, and at least one **current** ACA on staff.

**Benefits.**
- Reseller discount: **10% off list** (illustrative).
- Referral fee: **10% of first-year license** (illustrative); services revenue
  **100% retained** by the partner.
- Access to partner onboarding materials and product documentation.
- Deal registration eligibility (90-day protection window, renewable — illustrative).
- Listing eligibility upon reaching Silver (no public directory listing at
  Registered).

---

## 3. Level 2 — Silver

**Purpose.** A partner that has delivered AdOS at least once and can operate a secure,
persistent, local-AI deployment.

**Requirements.**
- **≥2 certified staff, including ≥1 ACAD (Administrator).**
- **1 reference implementation** (delivered and customer-attested).
- Deal/revenue threshold: closed first-year license revenue at or above the Silver
  baseline (illustrative).
- An **annual joint plan** with AdOS.
- Meets the Silver CSAT baseline.

**Training.** Foundational + administrator enablement
([../customer-success/ADMINISTRATOR_TRAINING.md](../customer-success/ADMINISTRATOR_TRAINING.md));
staff hold **ACA** and at least one **ACAD**.

**Exam (partner competency assessment).** Silver partner-org assessment over **real
delivery**: perform a secure self-hosted install with optional persistence
(`DATABASE_URL`, SQLite/Postgres) and verified backup/restore; configure a local
engine (offline default or local Ollama/OpenAI-compatible) with no cloud endpoint and
no API key; demonstrate application-level tenant isolation; and run a Mission through
every pipeline stage and approval gate. Plus the truthful-positioning check. Passing
bar per assessed individual is **80%** (consistent with ACAD/ACPT in the individual
program).

**Reference projects.** **1** validated reference implementation. Evidence must be
partner-submitted and customer-attested per [§7](#7-reference-project-evidence-rules):
deployment runbook, redacted config, backup/restore evidence, and a customer
attestation letter. No vendor inspection of the live instance occurs.

**Customer satisfaction (CSAT).** **≥ 4.0 / 5.0** across attested engagements
(illustrative baseline), collected via customer-signed satisfaction attestations —
never auto-collected.

**Renewal.** Annual re-qualification: maintain **≥2 certified staff incl. ≥1 current
ACAD**, keep the reference implementation attestation current or replace it, sustain
the CSAT baseline, and refresh the joint plan.

**Benefits.**
- Reseller discount: **15% off list** (illustrative).
- Referral fee: **10% of first-year license** (illustrative); services revenue
  **100% retained**.
- **Public partner directory listing** while current.
- Qualified **lead sharing** from AdOS within the partner's region/segment.
- Access to co-branded marketing templates.
- Tier-2 vendor support escalation (partner fronts Tier-1; see support model in
  [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md)).

---

## 4. Level 3 — Gold

**Purpose.** A proven delivery partner with architecture capability and an active
co-marketing relationship.

**Requirements.**
- **≥4 certified staff, including ≥1 ACAR (Architect) and ≥2 ACAD (Administrator).**
- **3 reference implementations** (delivered and customer-attested).
- Deal/revenue threshold: cumulative first-year license revenue at or above the Gold
  baseline (illustrative).
- **Active co-marketing** and **deal registration in good standing**.
- Meets the Gold CSAT target.

**Training.** Foundational + administrator + architect enablement; staff hold **ACA**,
**≥2 ACAD**, and **≥1 ACAR**. At least one **ACP (Professional)** on staff is
recommended to lead end-user enablement.

**Exam (partner competency assessment).** Gold partner-org assessment adds
**architecture and enablement delivery** to the Silver scope: defend a reference
deployment design that uses only shipped capabilities (engine choice, persistence
adapter + migration plan, application-level tenancy layout, backup/DR, and the
**manual export boundary** to downstream ad platforms — AdOS has no connectors and
never launches ads); and demonstrate delivering onboarding for operators and admins.
Plus the truthful-positioning check. **80%** per assessed individual, plus a passing
design defense (mirrors the ACAR design-defense component).

**Reference projects.** **3** validated references spanning at least two distinct
customers, each with the full evidence pack of [§7](#7-reference-project-evidence-rules)
and a customer attestation.

**Customer satisfaction (CSAT).** **≥ 4.3 / 5.0** across attested engagements
(illustrative target), customer-signed.

**Renewal.** Annual re-qualification: maintain **≥4 certified staff incl. ≥1 current
ACAR + ≥2 current ACAD**, keep **3** current reference attestations, sustain the CSAT
target, keep deal registration in good standing, and execute at least one joint
co-marketing activity per year.

**Benefits.**
- Reseller discount: **20% off list** (illustrative).
- Referral fee: **10% of first-year license** (illustrative); services revenue
  **100% retained**.
- **Featured** partner directory listing and co-marketing (joint content, events).
- **Priority** qualified-lead sharing.
- Market-development funds eligibility (illustrative; commercial, not usage-based).
- Priority Tier-2 vendor support escalation and a named partner-program contact.
- Quarterly business reviews (QBRs) with AdOS.

---

## 5. Level 4 — Platinum

**Purpose.** A strategic partner with a dedicated AdOS practice and top customer
outcomes.

**Requirements.**
- **≥8 certified staff, including ≥2 ACAR (Architect)** (and, illustratively,
  **≥4 ACAD**).
- **6 reference implementations** (delivered and customer-attested).
- Deal/revenue threshold: cumulative first-year license revenue at or above the
  Platinum baseline (illustrative).
- A **dedicated AdOS practice**, a **joint business plan**, and regular **QBRs**.
- Achieves the top CSAT band.

**Training.** Full enablement stack; staff hold **ACA**, **≥4 ACAD**, and **≥2 ACAR**.
Holding one or more **ACT (Trainer)** is recommended so the partner can run its own
proctored enablement for Tiers 1–3 (Trainer proctoring rights are defined in the
individual program).

**Exam (partner competency assessment).** Platinum partner-org assessment covers the
full Gold scope at scale plus **repeatable delivery quality**: demonstrate a
standardized, documented delivery methodology (the fixed 10 phases), multi-tenant
operations, and DR grounded in the shipped backup/recovery/deploy/observability
packages ([../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md)). Plus the
truthful-positioning check. **80%** per assessed individual, plus passing design
defenses; a candid statement of what AdOS does **not** do is mandatory.

**Reference projects.** **6** validated references spanning multiple customers and at
least two of {install/configure, migration, multi-tenant, backup/DR}, each with the
full evidence pack and customer attestation.

**Customer satisfaction (CSAT).** **≥ 4.6 / 5.0** across attested engagements
(illustrative top band), customer-signed.

**Renewal.** Annual re-qualification: maintain **≥8 certified staff incl. ≥2 current
ACAR**, keep **6** current reference attestations, sustain top-band CSAT, and refresh
the joint business plan with QBRs on cadence.

**Benefits.**
- Reseller discount: **25% off list** (illustrative).
- Referral fee: **10% of first-year license** (illustrative); services revenue
  **100% retained**.
- **Top-tier** directory placement and joint go-to-market planning.
- **First-priority** qualified-lead sharing and executive sponsorship.
- Largest market-development funds eligibility (illustrative; commercial only).
- Highest-priority Tier-2 vendor escalation, named technical contact, and early
  access to release notes/roadmap briefings.
- Influence into the product roadmap via QBRs.

---

## 6. Partner competency exam blueprint

All partner-org assessments combine a **truthful-positioning check** with
**delivery-competency** components that grow by tier. Every item tests shipped
behavior on the partner's own (or a customer-representative) local instance —
consistent with the self-hosted, no-telemetry model.

| Domain | Registered | Silver | Gold | Platinum |
|---|---:|---:|---:|---:|
| Truthful positioning & scope discipline (no forbidden claims) | 100% | 25% | 20% | 15% |
| Secure, persistent local delivery (install, `DATABASE_URL`, backup/restore, auth) | — | 35% | 25% | 25% |
| Human-approved pipeline & approval gates (real Mission run) | — | 20% | 15% | 15% |
| Application-level tenancy & local-engine configuration | — | 20% | 15% | 15% |
| Architecture design defense (shipped-only topology; export boundary) | — | — | 15% | 20% |
| Enablement & onboarding delivery | — | — | 10% | — |
| Repeatable methodology, multi-tenant ops & DR at scale | — | — | — | 10% |

**Passing bar.** Registered = pass/fail positioning check. Silver/Gold/Platinum =
**80%** per assessed individual (matching the ACAD/ACAR/ACPT individual bars), plus —
at Gold and Platinum — a passing **design defense**. Any forbidden claim asserted as
a present-tense capability is an automatic fail until corrected.

**What exams test (real behavior only).** The offline-first, human-in-the-loop
pipeline and its three approval gates; drafts-only campaign output (channels/ad
sets/budget split that never leaves `draft`); deterministic ad KPIs
(CTR/CPC/CPA/CPL/ROAS/ROI), hand-entered; local engine setup with no cloud endpoint
and no API key; real auth and security hardening; optional SQLite/Postgres with
backup/restore; application-level multi-tenant isolation; the **Company Brain** as a
marketing-performance memory; and bilingual TR/EN. **Exams never test** any Roadmap
item in [§9](#9-roadmap--future-certification-capability).

---

## 7. Reference-project evidence rules

Because AdOS emits no vendor telemetry, a reference project is proven by
**partner-submitted artifacts plus a customer attestation**, never by inspecting a
live customer instance.

**A valid reference project must include:**
1. **Customer attestation** — a signed statement from the customer confirming the
   engagement was delivered and that they consent to it counting as a reference
   (named or anonymized).
2. **Scope summary** — the delivered scope mapped to the 10-phase methodology
   (Discovery → … → Closure).
3. **Deployment runbook** — how AdOS was installed and configured on the customer's
   infrastructure ([../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md),
   [../DEPLOYMENT.md](../DEPLOYMENT.md)), with **secrets redacted**.
4. **Persistence & backup evidence** — proof of opt-in SQLite/Postgres persistence
   and a verified backup/restore ([../BACKUP_GUIDE.md](../BACKUP_GUIDE.md)).
5. **Security evidence** — confirmation of real auth and security headers
   (Argon2id/CSRF/lockout/CSP-HSTS) and application-level tenant isolation.
6. **Truthful-positioning attestation** — the partner confirms the customer was
   positioned only on shipped capability; no forbidden claim was made.

**Rules.**
- Each reference counts for **one** organization tier at a time; the same engagement
  may not be double-counted across two customers.
- References must be **current**: refreshed at renewal, replaced if the attestation
  lapses or the customer withdraws consent.
- Fabricated or non-consented evidence is an integrity violation and grounds for tier
  revocation.
- Nothing in a reference project may cite a capability outside PRODUCT_TRUTH.md.

---

## 8. Tier-comparison matrix

| Requirement / Benefit | Registered | Silver | Gold | Platinum |
|---|---|---|---|---|
| Signed agreement + code of conduct | Yes | Yes | Yes | Yes |
| Certified staff (min) | ≥1 total | ≥2 total | ≥4 total | ≥8 total |
| — includes ACAD (Administrator) | — | ≥1 | ≥2 | ≥4* |
| — includes ACAR (Architect) | — | — | ≥1 | ≥2 |
| — includes ACA (Associate) | ≥1 | ≥1 | ≥1 | ≥1 |
| Reference implementations | 0 | 1 | 3 | 6 |
| Deal/revenue threshold (illustrative) | none | Silver baseline | Gold baseline | Platinum baseline |
| CSAT threshold (customer-attested, illustrative) | — | ≥4.0 | ≥4.3 | ≥4.6 |
| Partner competency exam | Positioning check | 80%/person | 80%/person + design defense | 80%/person + design defenses |
| Joint plan / QBRs | — | Annual joint plan | Co-marketing + QBRs | Joint business plan + QBRs |
| Reseller discount (illustrative) | 10% | 15% | 20% | 25% |
| Referral fee (illustrative) | 10% | 10% | 10% | 10% |
| Services revenue retained | 100% | 100% | 100% | 100% |
| Directory listing | — | Listed | Featured | Top-tier |
| Lead sharing | — | Regional | Priority | First-priority |
| Vendor support escalation | Docs only | Tier-2 | Priority Tier-2 | Highest-priority Tier-2 |
| Renewal | Annual | Annual | Annual | Annual |

\* ACAD count at Platinum is illustrative; the binding minimum is **≥2 ACAR** plus
the ≥8 total. All numeric values are illustrative baselines calibrated in
[./PARTNER_PROGRAM_CONSTITUTION.md](./PARTNER_PROGRAM_CONSTITUTION.md).

---

## 9. Renewal & annual re-qualification

- All tiers re-qualify **annually**. Renewal verifies that certified-staff counts,
  reference-project attestations, CSAT, and (where applicable) revenue thresholds
  are **currently** met — using the same partner-submitted / customer-attested
  evidence as initial qualification.
- Individual credentials must be **current** at renewal; an ACAD/ACAR whose
  credential has lapsed does not count until recertified per
  [../customer-success/CERTIFICATION_PROGRAM.md](../customer-success/CERTIFICATION_PROGRAM.md).
- If a partner no longer meets a tier's minimums, it is **re-leveled** to the highest
  tier it does meet, following a **60-day** cure period (illustrative) to restore
  staffing, references, or CSAT.
- Renewal cadence aligns to the program cycle: deal registration on opportunity →
  monthly pipeline sync → quarterly business review (QBR, Gold/Platinum) → annual
  tier review + renewal.

---

## 10. Audit & evidence process

Because the vendor has no standing access to customer instances, tier audits are
**evidence-based and partner-cooperative**:

1. **Submission.** The partner submits a tier dossier: certified-staff roster with
   individual credential IDs (`ADOS-<LEVEL>-<YYYY>-<serial>`), reference-project
   evidence packs ([§7](#7-reference-project-evidence-rules)), customer CSAT
   attestations, and — for reseller/referral tiers — the illustrative deal/revenue
   summary the partner reports.
2. **Verification.** AdOS Partner Certification verifies each credential ID against
   the certification registry (active/expired/revoked), confirms each reference pack
   is complete and customer-attested, and confirms CSAT attestations are
   customer-signed. No customer instance is inspected.
3. **Positioning review.** A sample of the partner's customer-facing materials is
   reviewed for scope discipline against [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md);
   any forbidden claim must be corrected before the tier is granted or renewed.
4. **Decision & record.** The tier is granted, renewed, re-leveled, or revoked, and
   the decision + evidence references are recorded by Partner Certification.
5. **Integrity & appeals.** Fabricated evidence, non-consented references, or
   forbidden-claim marketing are integrity violations that can revoke a tier.
   A partner may appeal a decision within **30 days** to Partner Certification.

The audit consumes only what the partner and its customers choose to share; there is
no vendor-side data collection and no cloud metering.

---

## 11. Roadmap — future certification capability

> **Roadmap (not shipped; never exam, reference-project, or renewal content).** The
> items below are potential **future** additions, gathered here so the program has a
> single, clearly-labeled place for future direction. No current exam, reference
> project, tier requirement, or benefit depends on any of them. None is a
> present-tense AdOS capability.

- **Partner Portal automation (Planned).** A proposed program portal
  (self-service dossier submission, credential-count roll-up, deal registration,
  CSAT intake) — a *specification*, not a shipped system, and not an AdOS product
  feature.
- **Automated credential/tier verification page (Planned).** A hosted lookup for
  partner tier and credential status. Today, verification is registry-based and never
  touches a customer instance.
- **Technology/ISV Partner track (Planned).** A certification track for partners who
  build integrations — gated on **external connector APIs**, which are Roadmap
  (connector-hub is an unwired stub today).
- **Certification tracks for future product capabilities (Planned).** *If and only if*
  these ship would corresponding partner competencies follow: document knowledge base
  / cited answers over documents; autonomous agents ("Digital Employees"); live ad
  launch & campaign optimization; external connectors/syncs to ad platforms and CRMs;
  enforced RBAC / permission-aware AI; immutable audit trail; DB-level Row-Level
  Security; cloud inference; vision/speech/image AI; and tiered approval authority
  (spend limits). *All Roadmap — none exist today; none are certifiable now.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
