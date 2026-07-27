# AdOS Partner Operations

| | |
|---|---|
| **Owner** | Partner Operations |
| **Status** | Official — aligned to PRODUCT_TRUTH.md |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Source of truth** | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) |

AdOS is the **Enterprise AI Operating System for Advertising** — an offline-first,
100% local-AI platform that takes a client's advertising objective (a **Mission**)
through a human-approved pipeline (marketing brief → creative ad copy → campaign
**draft** → performance report → executive dashboard) and remembers what works in a
marketing-performance **Company Brain**. It **drafts**; it never launches live ads.

This document defines how Partner Operations runs the recurring management of the
AdOS partner ecosystem: reviews, metrics, compliance, audits, renewals, planning,
forecasting, support quality, and customer-success oversight. It governs *operational
cadence*; the program rules themselves live in
[PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md) and
[PARTNER_CERTIFICATION.md](PARTNER_CERTIFICATION.md).

---

## 0. The one non-negotiable operating premise: no telemetry, no standing access

**AdOS is customer self-hosted, offline-capable, and air-gap capable. It phones no
one home.** There is no vendor cloud, no per-token metering, no usage beacon, and no
standing vendor access into any partner or customer instance
([../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §1.5, §2.5, §2.8). The default engine is
the deterministic OfflineAIManager; even genuine model prose runs on a *local*
Ollama / OpenAI-compatible server the customer operates. The only outbound network
calls in the product target localhost AI engines.

**Therefore every metric in this document — partner performance, pipeline, bookings,
delivery quality, certification coverage, CSAT, compliance status, support quality,
customer adoption/health, and forecast — is PARTNER-REPORTED and/or
CUSTOMER-ATTESTED.** It is gathered in scheduled reviews from what the partner
submits and what the customer chooses to share (exports, screenshares, verbal
attestation). **None of it is auto-collected from partner or customer systems**,
because the product has no mechanism to do so. This premise is restated in every
section below because it changes what each number *is*: a self-reported, as-of
snapshot — never a live reading.

**Operating rules that follow directly from this premise:**

1. **Stamp every metric with an "as-of / data-shared" date** and its source
   (partner-submitted vs. customer-attested vs. vendor-side support record). A figure
   older than its review cycle is **stale**, not current.
2. **Attribute, never assert.** Write "the partner reports…" / "the customer shared…"
   — never "the system shows…". Vendor-side support ticket records are the *only*
   input Partner Operations holds directly, and only because the ticket was raised to
   the vendor (see [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md)).
3. **No coverage, no score.** If a partner or customer declines to share an input, the
   corresponding dimension is marked *Not Reported* and coverage is disclosed — it is
   never estimated from a customer instance.
4. Any future *automated* partner-metrics collection is **Roadmap only**, and even
   then strictly **opt-in / partner self-submitted** (see §12).

---

## 1. Scope, vocabulary, and how to read this document

**Partner types** (per [PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md)):
Referral Partner, Reseller Partner, Implementation (Delivery) Partner. *(Roadmap)*
Technology/ISV Partners are gated on connector APIs, which are Roadmap.

**Partner tiers (organizational, 4 levels):** Registered → Silver → Gold → Platinum.
Tier requirements reference individual certifications
(Associate → Professional → Administrator → Architect → Partner → Trainer) defined in
[../customer-success/CERTIFICATION_PROGRAM.md](../customer-success/CERTIFICATION_PROGRAM.md)
and enabled through [PARTNER_CERTIFICATION.md](PARTNER_CERTIFICATION.md).

**Delivery roles:** Engagement Lead, Solution Architect, Implementation Consultant,
Trainer, Support Engineer; customer-side Executive Sponsor and Admin/Champion.

**Partner revenue model** (per [PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md)):
(a) license/subscription **resale margin**, (b) **implementation & services** revenue
(100% retained by the partner), (c) **support / managed services**, (d) **referral
fees**. **There is no cloud markup and no consumption/usage metering** — AdOS has no
per-token or hosted billing. All commercial numbers below are *illustrative* baselines
subject to the executed agreement.

Every capability referenced in this document traces to
[../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md). Anything not implemented there appears only
under the **Roadmap** heading (§12).

---

## 2. Master operating cadence

| Cadence | Activity | Primary owner | Metric source |
|---|---|---|---|
| **On each opportunity** | Deal registration | Partner Account Manager (PAM) | Partner-submitted |
| **Monthly** | Pipeline sync + forecast refresh | PAM + Partner | Partner-submitted |
| **Quarterly** | **Quarterly Business Review (QBR)** | Partner Operations + PAM | Partner-reported + customer-attested |
| **Quarterly** | Support-quality review | Partner Support Lead | Vendor-side records + partner-reported |
| **Quarterly** | Customer-success / health review | Partner CSM liaison | **Customer-shared** |
| **Semi-annual / annual** | Compliance attestation + evidence audit | Partner Compliance Owner | Partner-submitted artifacts |
| **Annual** | Tier re-qualification + agreement renewal | Partner Operations | Partner-reported + customer-attested |
| **Annual** | Joint business plan refresh | Partner Operations + Partner exec | Partner-authored |

All reviews are **evidence-based conversations**, not automated readouts. Partner
Operations schedules them, sets the agenda, records what was shared (and the as-of
date), and tracks resulting actions.

---

## 3. Quarterly reviews — the QBR

**Cadence:** Quarterly (Silver+ mandatory; Registered on request). Platinum runs a
joint executive QBR.
**Owner:** Partner Operations, co-chaired by the Partner Account Manager; partner
Engagement Lead attends.

**Inputs**
- *Partner-reported:* pipeline and bookings for the quarter; delivery outcomes and
  reference wins; certification roster changes; services revenue delivered; open risks.
- *Customer-attested (where the customer participates or has shared):* satisfaction
  (CSAT), reference-ability, adoption highlights, escalations.
- *Vendor-side:* support ticket history for the partner's accounts (the one directly
  held record — see [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md)).

> **Metric provenance:** every pipeline, bookings, delivery-quality, CSAT, and
> cert-coverage figure in the QBR is **partner-reported and/or customer-attested and
> gathered in the meeting**. Nothing is pulled from a partner or customer AdOS
> instance — the product cannot do that.

**Standard QBR agenda**
1. **Since last QBR** — actions closed / carried; as-of dates on all data reviewed.
2. **Pipeline & bookings** — partner-submitted deal register, stage movement,
   win/loss (§4, §11).
3. **Delivery quality** — implementations delivered against the 10-phase methodology
   (Discovery → … → Closure), go-lives, hypercare exits, partner-reported quality
   signals and any customer-attested feedback (§4).
4. **Certification coverage** — certified-staff roster vs. tier minimums; partner-
   reported changes and planned exams (§4, §6).
5. **Customer success & health** — RAG bands and adoption for the partner's accounts,
   from **customer-shared** data only (§10).
6. **Support quality** — Sev mix and response-target adherence for the quarter (§9).
7. **Compliance status** — attestation currency, brand/legal, evidence gaps (§5, §6).
8. **Forecast** — next-quarter partner-submitted forecast, committed vs. best-case (§8).
9. **Joint plan** — progress against the annual joint business plan (§7).
10. **Actions & owners** — dated follow-ups.

**Outputs:** QBR minutes with every metric's as-of date and source label; updated
action log; tier-trajectory note; escalations routed; refreshed joint-plan status.

---

## 4. Performance metrics

**Cadence:** Assembled monthly (pipeline/bookings), reviewed each QBR; full roll-up at
annual tier review.
**Owner:** Partner Operations (definition & roll-up); PAM (collection from the partner).

**All performance metrics are partner-reported or customer-attested. There is no
telemetry.** Each is a self-submitted, as-of snapshot.

| Metric | What it measures | Source (never auto-collected) |
|---|---|---|
| **Pipeline** | Registered opportunities by stage/value | **Partner-submitted** deal register |
| **Bookings** | Closed license/subscription resale + services booked | **Partner-reported**, reconciled to signed orders |
| **Delivery quality** | Implementations completed vs. 10-phase methodology; go-live/hypercare outcomes; rework | **Partner-reported**; **customer-attested** acceptance sign-off |
| **Certification coverage** | Certified staff by level vs. tier minimums | **Partner-reported** roster; exam records via [PARTNER_CERTIFICATION.md](PARTNER_CERTIFICATION.md) |
| **CSAT** | Customer satisfaction with partner-led delivery/support | **Customer-attested** (survey/verbal shared in review) |
| **Reference coverage** | Referenceable production implementations | **Partner-reported**, **customer-confirmed** |

> Delivery quality is assessed against the **10-phase implementation methodology**
> (Discovery → Planning → Installation → Configuration → Migration → Training →
> Go-live → Hypercare → Acceptance → Closure), which maps to the real self-hosted
> setup ([../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md),
> [../DEPLOYMENT.md](../DEPLOYMENT.md)) and onboarding
> ([../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md)).
> The *evidence* that a phase completed is a partner-submitted artifact or a
> customer sign-off — not a system reading.

**Outputs:** partner scorecard (every cell stamped with source + as-of date); tier-
trajectory assessment; coverage disclosure where inputs were Not Reported.

---

## 5. Compliance

**Cadence:** Continuous obligation; formal attestation semi-annually, verified at
annual renewal.
**Owner:** Partner Compliance Owner (Partner Operations).

Compliance covers: signed agreement in force; code of conduct; brand/trademark usage
per program guidelines; correct product positioning ("Enterprise AI Operating System
for Advertising" — never "Advertising Operating System"); truthful capability claims
consistent with [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) (no promising document Q&A,
autonomous agents, live ad launch, connectors, enforced RBAC, or immutable audit as
shipped features); data-handling appropriate to a self-hosted deployment; and
certification currency.

**Inputs (all partner-submitted; none observed):** signed **compliance attestation**;
declared marketing/website assets for spot review; certification roster; sub-contractor
declarations. Because the vendor has no access to partner systems, compliance is
established by **partner attestation plus submitted evidence** (§6), not by inspection
of partner infrastructure.

**Outputs:** compliance register entry with attestation date; findings and remediation
actions with due dates; gate input to tier re-qualification and renewal (§8).

---

## 6. Audits — evidence-based, on submitted artifacts

**Cadence:** Annual for Gold/Platinum; risk-triggered for others (e.g., a
mispositioning finding or a customer complaint).
**Owner:** Partner Operations, with the Partner Compliance Owner.

**Audits are conducted strictly on artifacts the partner submits and evidence the
customer chooses to share.** Partner Operations has **no standing access to any partner
or customer AdOS instance** and does not connect to one during an audit. The auditor
reviews documents, not systems.

**Reviewed artifacts (partner-submitted / customer-shared):**
- Certification records and named-individual currency ([PARTNER_CERTIFICATION.md](PARTNER_CERTIFICATION.md)).
- Implementation evidence: phase deliverables, go-live checklists, acceptance sign-offs
  (customer-attested) against the 10-phase methodology.
- Marketing/positioning samples for claim accuracy vs.
  [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md).
- Support records for the partner's accounts (vendor-side tickets +
  partner-reported Tier-1 handling).
- Compliance attestations (§5) and deal-registration integrity.

> **Provenance note:** an audit *verifies submitted evidence*; it does not measure a
> live environment. Any finding is grounded in an artifact with an as-of date, mirroring
> the RCA discipline in [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md)
> (grounded strictly in what was shared).

**Outputs:** audit report; findings by severity; remediation plan with owners/dates;
escalation to tier action where material.

---

## 7. Joint planning

**Cadence:** Annual joint business plan (Silver+); refreshed and checkpointed at each QBR.
**Owner:** Partner Operations + partner executive sponsor; PAM facilitates.

**Inputs (partner-authored / jointly agreed):** partner's addressable market and target
verticals; pipeline-generation goals; certification/enablement plan to reach or hold a
tier; co-marketing commitments; delivery-capacity plan; reference-development targets.
No customer-instance data feeds the plan; where account context is used, it is
**customer-shared** and dated.

**Outputs:** signed joint business plan; enablement calendar; co-marketing plan;
quarterly checkpoints folded into the QBR (§3).

---

## 8. Business reviews (tier & program governance)

**Cadence:** Rolls up quarterly (QBR, §3); formal annual **tier & program review**.
**Owner:** Partner Operations.

The annual business review is where Partner Operations makes tier decisions and program
standing calls. **All inputs are partner-reported or customer-attested** and consolidated
from the year's reviews — nothing is drawn from telemetry.

**Inputs:** annual performance roll-up (§4); certification coverage vs. tier minimums;
CSAT and references (customer-attested); compliance and audit standing (§5–§6);
delivery quality; support quality (§9); customer-success/health summary (§10);
forecast accuracy (§8/§11). Tier requirements are the illustrative baselines in
[PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md):

| Tier | Illustrative requirement (see constitution) |
|---|---|
| **Registered** | Signed agreement; onboarding complete; ≥1 Associate certified; code of conduct accepted |
| **Silver** | ≥2 certified incl. ≥1 Administrator; 1 reference; meets CSAT baseline; annual joint plan |
| **Gold** | ≥4 certified incl. ≥1 Architect + ≥2 Administrator; 3 references; CSAT target; active co-marketing; deal-reg in good standing |
| **Platinum** | ≥8 certified incl. ≥2 Architect; 6 references; top CSAT; dedicated AdOS practice; joint business plan + QBRs |

**Outputs:** tier decision (maintain / promote / place on improvement plan / demote);
program-standing determination; renewal recommendation (§9 next).

---

## 9. Renewals — tier re-qualification + agreement renewal

**Cadence:** Annual, aligned to the agreement term.
**Owner:** Partner Operations, with legal for the agreement.

Renewal has **two tracks**:

1. **Tier re-qualification** — confirm the partner still meets its tier's illustrative
   requirements (§8). Inputs are **partner-reported** (certification roster, references,
   delivery) and **customer-attested** (CSAT, referenceability). A shortfall triggers a
   grace period with an improvement plan or a tier adjustment.
2. **Agreement renewal** — renew the commercial agreement (resale discount schedule,
   referral terms, deal-registration protection, services terms). Licensing is
   **commercial and contractual**, delivered through the partner agreement — **not** an
   in-product entitlement/enforcement server (the product has none). The agreement is a
   **template requiring qualified legal review**; it is not legal advice and not an
   executed contract until signed.

> Re-qualification evidence is the same partner-submitted/customer-attested material
> used all year (§4–§6). No renewal decision is based on data collected from a partner
> or customer instance.

**Outputs:** renewed (or amended) agreement; confirmed tier for the new term; updated
commercial schedule; any improvement plan.

---

## 10. Forecast — partner-submitted

**Cadence:** Refreshed monthly at the pipeline sync; committed each QBR.
**Owner:** PAM (collection); Partner Operations (consolidation).

**The forecast is entirely partner-submitted.** Partner Operations cannot see a
partner's CRM or a customer's environment; the number is what the partner commits in
the sync, with the vendor's role limited to challenge, categorize, and consolidate.

**Inputs (partner-submitted):** registered opportunities with stage, value, and close
date; committed vs. best-case vs. pipeline categories; renewal/expansion intent
(expansion signals are **customer-shared**, §11). Each submission is stamped with its
as-of date.

**Outputs:** consolidated partner forecast by category; forecast-accuracy tracking
(prior commit vs. actual booking, §4); pipeline-coverage view for joint planning (§7).

---

## 11. Support quality — Sev mix & response adherence

**Cadence:** Quarterly review; incidents handled continuously.
**Owner:** Partner Support Lead (Partner Operations).

The AdOS support model is self-hosted: **Tier-1 is the partner's responsibility** (they
front the customer); escalations for Tier-2/product defects go to the vendor. **SLAs are
vendor RESPONSE targets, not remote-fix commitments — the vendor has no standing access
to fix a customer instance remotely.** Severity and SLA definitions are inherited
verbatim from [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md):

| Severity | Meaning | Vendor response target |
|---|---|---|
| **Sev 1 — Critical** | Production down / cannot log in / data-loss risk | 1 business hour |
| **Sev 2 — High** | Major function impaired (a pipeline stage failing), no workaround | 4 business hours |
| **Sev 3 — Normal** | Limited/partial impact, workaround exists | 1 business day |
| **Sev 4 — Low** | Question / cosmetic / how-to / enhancement idea | 2 business days |

**Inputs:**
- *Vendor-side records (directly held):* ticket volume, **severity mix**, and
  **response-target adherence** for escalations the partner raised to the vendor — the
  one category of data the vendor holds directly, because the ticket came to us.
- *Partner-reported:* Tier-1 volume, first-response and resolution handling on tickets
  the partner resolved without escalating, and CSAT on support.

> The severity mix and adherence figures reflect **tickets exchanged with the vendor and
> what the partner reports** — never a reading pulled from a partner or customer system.

**Outputs:** quarterly support-quality summary (Sev mix, response adherence, recurring
issues, RCA follow-through per the playbook); coaching actions; escalation-pattern
input to customer-health (§10) and audits (§6).

---

## 12. Customer success — adoption / health via customer-shared data

**Cadence:** Quarterly (aligned to customer check-ins/EBRs).
**Owner:** Partner CSM liaison (Partner Operations), with the delivery partner's CSM.

Partner Operations oversees the health of the partner's customer base using the
**Customer Health Model** in
[../customer-success/CUSTOMER_HEALTH.md](../customer-success/CUSTOMER_HEALTH.md). That
model is explicit that **every input is customer-shared**: a composite 0–100 score and
RAG band (Green / Yellow / Red) derived from dimensions such as Adoption, Usage, AI
utilization, Campaign throughput, and Support — each **exported, screenshared, or
verbally attested by the customer** at check-ins. **The vendor and partner never observe
a customer instance.**

**Inputs (customer-shared):** onboarding/adoption roster (Workspaces → Clients → Brands
→ Products configured; users provisioned); Mission volume and activity read by the
admin; which AI engine is configured (deterministic OfflineAIManager by default vs. a
local Ollama / OpenAI-compatible engine); campaign **draft** and report throughput with
hand-entered KPIs; renewal/expansion intent. Support-ticket signals come from the
vendor-side record (§11). Adoption references the real onboarding model in
[../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §1–§3.

> **Every health score is a stale snapshot as of the last customer-shared export.**
> Partner Operations stamps each scorecard with an as-of/data-shared date and a coverage
> figure (how many dimensions had fresh customer-shared inputs). Where a customer shared
> nothing, the dimension is Not Reported — never inferred from their environment.

**Outputs:** per-account RAG summary with as-of dates and coverage; at-risk (Red/Yellow)
escalation and save plan; adoption/expansion signals fed to forecast (§10) and joint
planning (§7).

---

## 13. Roadmap — future automated / opt-in metrics (NOT available today)

> **Roadmap.** Everything in this callout is a **future direction**, not a current
> capability. Today, and in AdOS v1.0.0, **all partner-operations metrics are
> partner-reported and/or customer-attested and gathered manually in reviews.** AdOS is
> self-hosted and offline with **no vendor telemetry and no standing vendor access**, so
> none of the following exists yet.

Planned, and — critically — designed to remain **opt-in and partner/customer
self-submitted** even if built:

- **(Roadmap, opt-in) Partner-metrics portal intake.** A program **Partner Portal**
  (specified separately in `PARTNER_PORTAL_SPEC.md` as a *proposed* design, not a shipped
  system) into which partners could **voluntarily submit** pipeline, forecast, cert
  rosters, and delivery evidence. This automates *intake of self-reported data*, not
  collection from partner systems.
- **(Roadmap, opt-in) Customer-shared telemetry export.** A future capability for a
  customer to **choose to export** adoption/usage signals for their partner/CSM. Any such
  flow is customer-initiated and consent-based; the product still would not phone home.
- **(Roadmap) Automated compliance/evidence attestation workflow.** Digitized attestation
  and artifact submission — still partner-submitted, just structured.
- **(Roadmap) Product-side signals** that today do not exist and would be prerequisites
  for richer metrics: external connectors/integrations, enforced RBAC / permission-aware
  AI, and an immutable audit trail are all Roadmap per
  [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §4–§5 and would themselves have to ship
  before any automated, consent-based metric could derive from them.

No date is committed for any Roadmap item. Nothing here may be sold, promised, or
reported as available.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
