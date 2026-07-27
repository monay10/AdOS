# AdOS — Business Continuity Plan (BCP)

**Owner:** Office of the COO
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)
**Governing reference:** `BUSINESS_OPERATIONS_CONSTITUTION.md` (BizOps constitution)

---

## 0. Purpose & scope

This is the **Business Continuity Plan for the AdOS *company***: how the organization
that builds, licenses, and supports AdOS keeps operating through interruption —
office loss, systems loss, key-person unavailability, vendor failure, and partner
failure — and how it communicates and recovers.

It sits **one level above** the product's technical recovery. The AdOS product
already has its own operator-facing disaster recovery, documented in
[../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md) and
[../RUNBOOK.md](../RUNBOOK.md). **This BCP does not duplicate those**; it references
them and governs the *business* around them.

**Critical product-shape fact that drives this plan.** AdOS is a **100% local,
offline-capable, customer-self-hosted** product — there is **no vendor cloud, no
phone-home, and no standing vendor access to any customer instance**
(see [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §1.5, §2.8). The company does not run
customer production systems. Consequently:

- **Each customer runs their own disaster recovery on their own infrastructure.**
  The vendor **cannot** recover, restart, restore, or fail over a customer instance
  remotely. The vendor's role in a customer outage is **advisory** — provide the
  runbook, guidance, and (contracted) remote assistance — not hands-on-keyboard
  recovery of the customer's environment.
- The company's own continuity concern is therefore its **own** systems (CRM,
  finance, code repository, support desk, build/release pipeline, corporate comms)
  and its **people, partners, and communications** — not a fleet of hosted tenants
  it does not possess.

### 0.1 Scope boundary (what this plan does / does not cover)

| In scope (this BCP) | Out of scope (covered elsewhere) |
| --- | --- |
| Company office / facilities loss | Product/app technical recovery → [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md) |
| Company internal systems (CRM, finance, repo, support desk) | Operator restore/restart procedures → [../RUNBOOK.md](../RUNBOOK.md) |
| Key-person unavailability & succession | A **customer's** self-hosted instance recovery → the customer runs it on their infra using the two docs above |
| Vendor / supplier / tool failure | Product roadmap items → [../ROADMAP.md](../ROADMAP.md) |
| Implementation-partner failure affecting a customer | Deployment topology → [../DEPLOYMENT.md](../DEPLOYMENT.md) |
| Customer & internal crisis communication | Security incident deep-dive → [../SECURITY_GUIDE.md](../SECURITY_GUIDE.md) |

---

## 1. Continuity principles

1. **Truth first.** Continuity messaging respects [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md).
   The company never claims it can remotely observe, monitor, or auto-recover a
   customer instance, because it cannot — there is no telemetry or phone-home.
2. **People over heroics.** Every critical function has a **named deputy**; no
   function depends on a single individual being reachable.
3. **Documented, rehearsed, reversible.** Invocation, roles, and comms are written
   down and drilled (§8). Continuity decisions follow the RACI / decision-rights
   model in §7 and the BizOps constitution.
4. **Offline-first mirrors our product.** Because AdOS itself is offline-capable and
   self-hosted, the company deliberately keeps **local / offline-recoverable copies**
   of what it needs to keep running (release artifacts, docs, runbooks, contacts).
5. **Separation of product recovery from business recovery.** A product outage at a
   customer is handled by the customer per the product DR docs; the company's job is
   communication, guidance, and its own operational continuity.

---

## 2. Business interruption scenarios

Interruptions to the **company's own** ability to operate. Each maps to a recovery
priority tier (§6) and a decision owner (§7).

### 2.1 Office / facilities unavailability

Loss of physical premises (fire, flood, utility outage, denied access).

- The company operates **location-independent**: work, code, docs, and comms are
  cloud/SaaS-and-repo based, not premises-locked.
- **Response:** invoke remote-work mode; confirm all staff safe (roll call via the
  comms tree, §5); redirect any physical mail/shipping; verify access to systems from
  alternate locations.
- **Recovery target:** business functions continue remotely within **4 hours**;
  physical-premises restoration is a facilities matter, not a business-stopping one.

### 2.2 Company systems unavailability

Loss of an internal system the *company* depends on (its own CRM, finance, code
repository/build pipeline, support desk, corporate email/chat). Handled as **vendor
failure** where a SaaS tool is the cause (§4) and as **DR for company systems**
where it is our own hosted tooling (§3).

### 2.3 Key-person unavailability

A single accountable owner (a C-level or department lead, §7) becomes unreachable —
illness, departure, travel, incapacity.

- Every department has **one accountable owner and one named deputy**. On
  unavailability, the deputy assumes decision rights for the interruption window.
- **Response:** deputy is activated by the Continuity Lead (§7); credentials and
  access are recovered via the shared secrets/break-glass procedure (§3.3); knowledge
  gaps are closed from documented runbooks and ADRs.
- **Recovery target:** decision continuity within **2 hours**; no single decision
  should be blocked longer than one business day for want of an owner.

### 2.4 Key-person succession map

| Function (accountable owner) | Primary | Deputy (assumes on unavailability) |
| --- | --- | --- |
| Executive (CEO office) | CEO | COO |
| Engineering | VP/Head of Engineering | Lead Engineer |
| Product | Head of Product | Senior PM |
| Sales | Head of Sales | Senior AE |
| Marketing | Head of Marketing | Marketing Lead |
| Customer Success | Head of CS | Senior CSM |
| Partners (Partner/Channel) | Head of Partners | Partner Manager |
| Finance | CFO / Finance Lead | Controller |
| Legal | Legal Counsel | External counsel (retained) |
| Operations (BizOps/People/IT) | COO | Ops/IT Lead |

---

## 3. Disaster recovery — company systems

This section covers the **company's own** systems. For the **product**, defer to the
existing docs; do not duplicate them here.

### 3.1 Product recovery — pointer, not duplication

- **Self-hosted product recovery is the customer's operation, on the customer's
  infrastructure.** The authoritative procedures are
  [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md) (recovery model, scenario
  coverage, RTO/RPO, restart modes) and [../RUNBOOK.md](../RUNBOOK.md) (operator
  commands). The vendor **cannot execute these remotely** on a customer instance —
  there is no standing access and no phone-home.
- **The company's obligation** in a customer product outage is: make the runbook and
  DR docs available; provide advisory/remote support per the support contract; and
  communicate clearly (§4 for supplier root-cause, §5 for messaging). It is **not**
  to log in and recover the customer's environment (which it cannot).
- Where the company runs its **own internal, non-production AdOS instance** (e.g. for
  demos, internal dogfooding, partner enablement), that instance is recovered by the
  company using the exact same product DR docs — it is just another self-hosted
  operator.

### 3.2 Company IT systems inventory & DR posture

| Company system | Function it serves | DR approach | Notes |
| --- | --- | --- | --- |
| Code repository + build/release pipeline | Engineering, Product, Release | Vendor-hosted with local mirror of latest release artifacts & docs | Aligns with offline-first principle (§1.4) |
| CRM | Sales, Marketing, Partners | SaaS vendor DR + periodic company-owned export | Company legitimately owns this data |
| Finance / billing system | Finance | SaaS vendor DR + monthly export | Licensing is contractual; no consumption metering to reconstruct |
| Support desk / ticket queue | Customer Success, Support | SaaS vendor DR + export | Company's own queue, not customer telemetry |
| Corporate email / chat | All (comms tree, §5) | Vendor DR + secondary channel fallback (§5.3) | Never single-channel dependent |
| Secrets / password manager | All | Vendor DR + offline break-glass (§3.3) | Gates key-person recovery |
| Docs / knowledge base | All | Repo-backed; docs live in-repo where possible | Runbooks recoverable offline |

### 3.3 Break-glass & credential recovery

- A sealed, offline **break-glass** record of critical company credentials and
  recovery contacts is maintained by the COO office and the CEO, refreshed
  quarterly (§9).
- On key-person unavailability (§2.3) the deputy uses break-glass to regain system
  access without waiting on the absent owner.

---

## 4. Vendor failure (a company supplier/tool fails)

A third-party **supplier or SaaS tool the company depends on** degrades or fails
(e.g. CRM outage, email provider outage, CI/build provider outage, payment
processor outage).

- **Detection:** owning department (§4.1 of the BizOps constitution's department map)
  notices via its weekly operational review or a live alert.
- **Response:**
  1. Owning department lead confirms scope and declares severity.
  2. Switch to the **documented fallback** for that tool class (secondary comms
     channel, manual process, or alternate provider).
  3. Finance/Legal assess contractual remedies (SLA credits, breach) for material
     vendors.
  4. Communicate internally (§5.2); communicate to customers **only if** the vendor
     failure affects the company's ability to support or deliver (§5.1).
- **Standing mitigations:**
  - No business-critical function is **single-vendor** without a defined fallback.
  - Company-owned **exports** of CRM/finance/support data (§3.2) mean a vendor's loss
    is not the company's data loss.
  - Vendor concentration risk is tracked in the risk register (RISK category:
    Operational) and reviewed quarterly.

> **Truth note:** A company-tool outage never affects a customer's running AdOS
> instance — AdOS is self-hosted and does not depend on the vendor's SaaS stack.
> Vendor-failure customer comms are about **support availability**, not product uptime.

---

## 5. Communication

### 5.1 Customer communication

Because AdOS is self-hosted, the company communicates **to** customers; it does not
observe their instances. Customer comms during a continuity event are **honest,
timely, and channel-redundant**.

| Trigger | Audience | Owner (accountable) | Channel | Target time-to-first-message |
| --- | --- | --- | --- | --- |
| Company support/service interruption | All active customers & partners | Head of Customer Success | Email + status page/changelog | ≤ 4 hours |
| Security incident touching customer data the company holds | Affected customers | Legal + CEO | Direct email (Legal-reviewed) | Per contract / legal obligation |
| Supplier failure affecting our support ability | Affected customers | Head of CS | Email | ≤ 4 hours |
| A customer's own AdOS instance is down | That customer | Head of CS (advisory) | Support channel; point to [../RUNBOOK.md](../RUNBOOK.md) | Per support-tier SLA |

- Customer messaging **must not** claim the company can see, monitor, or remotely fix
  a customer instance. For instance outages, the company **advises** and points to the
  product DR/runbook; the customer executes recovery on their infra.
- Partner-delivered accounts are communicated **with** the partner (§6 of the partner
  operations doc, [../partner/PARTNER_OPERATIONS.md](../partner/PARTNER_OPERATIONS.md)).

### 5.2 Internal communication

| Level | Purpose | Owner | Primary channel | Fallback channel |
| --- | --- | --- | --- | --- |
| All-hands notice | Company-wide awareness | COO | Corporate chat broadcast | Email → SMS phone tree |
| Continuity command | Coordinate the response | Continuity Lead (§7) | Dedicated incident channel/bridge | Phone bridge |
| Department stand-up | Function-level actions | Department lead | Department channel | Direct call |
| Executive brief | Decisions & external posture | CEO office | Executive channel | Phone |

### 5.3 Communication tree & channel redundancy

- **Primary → fallback ladder:** corporate chat → email → SMS/phone tree. No
  continuity event relies on a single channel (guards against §4 comms-vendor
  failure).
- **Call tree:** Continuity Lead → department leads → their deputies → their teams.
  Each leg confirms receipt upward.
- Up-to-date contact roster (with personal-fallback numbers) is held in the
  break-glass record (§3.3) and refreshed quarterly.

---

## 6. Recovery priorities (RTO / RPO for business functions)

**RTO** = target time to restore the *business function*; **RPO** = maximum
acceptable loss of that function's *company-owned* data. (RPO applies to company
data the company legitimately owns — CRM, finance, repo, support desk — **not** to
customer-instance data, which the company does not hold; see
[../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) §2.5, §2.8.)

| Tier | Business function | RTO | RPO (company-owned data) | Accountable owner |
| --- | --- | --- | --- | --- |
| **P0 — Critical** | Crisis command & communications (comms tree, decision authority) | ≤ 1 hour | ~0 (contacts held offline) | COO / Continuity Lead |
| **P0 — Critical** | Customer & partner support intake | ≤ 4 hours | ≤ 24 h (support-desk export) | Head of Customer Success |
| **P0 — Critical** | Security & legal response capability | ≤ 4 hours | Per contract/law | Legal + CEO |
| **P1 — High** | Release/build pipeline & release artifacts | ≤ 1 business day | ≤ 24 h; latest release mirrored offline | Head of Engineering |
| **P1 — High** | Finance: payroll & critical payments | ≤ 1 business day | ≤ 24 h (finance export) | CFO / Finance Lead |
| **P1 — High** | Sales pipeline / CRM access | ≤ 1 business day | ≤ 24 h (CRM export) | Head of Sales |
| **P2 — Medium** | Marketing & partner enablement operations | ≤ 3 business days | ≤ 1 week | Head of Marketing / Head of Partners |
| **P2 — Medium** | Internal knowledge base / docs | ≤ 3 business days | ~0 (repo-backed) | COO (Operations) |
| **P3 — Low** | Non-critical internal tooling & analytics | ≤ 5 business days | Best-effort | Ops/IT Lead |

**Reading the tiers:** P0 functions keep the company able to *decide and communicate*
in a crisis and to *support* customers/partners; P1 keeps the company able to *ship
and get paid*; P2/P3 restore normal operating rhythm.

---

## 7. Decision authority (who invokes & leads continuity)

Continuity decisions follow the company **decision-rights (RACI)** model and the
Type 1 / Type 2 decision classes defined in the BizOps constitution.

### 7.1 Roles

- **Continuity Lead** — the **COO** (Office of the COO owns this plan). Invokes the
  BCP, chairs the response, and is the single **Accountable** owner for the
  continuity event. On COO unavailability, the CEO or the designated Ops/IT Lead
  deputizes (§2.4).
- **Executive sponsor** — the **CEO**, accountable for company-wide posture and any
  Type 1 (irreversible / high-impact) continuity decision, recorded as an ADR.
- **Department leads** — Responsible for restoring their own function to its RTO;
  Consulted on cross-function trade-offs.

### 7.2 Invocation & decision RACI

| Decision / action | R | A | C | I |
| --- | --- | --- | --- | --- |
| Declare a continuity event & invoke BCP | COO | COO (Continuity Lead) | Affected dept leads | All staff |
| Activate a key-person deputy (§2.3) | Continuity Lead | COO | Affected dept lead | Executive |
| Type 1 continuity decision (irreversible/high-impact) | COO | **CEO** | Legal, Finance, affected leads | All staff |
| Type 2 continuity decision (reversible) | Dept lead | Dept lead | Continuity Lead | Continuity Lead |
| Approve external customer statement | Head of CS | CEO (+ Legal if incident) | Legal, Marketing | Affected customers |
| Declare event resolved & stand down | Continuity Lead | COO | Dept leads | All staff |

- **Type 1** continuity decisions are documented as an **ADR** (ID `ADR-NNNN`) per the
  BizOps decision framework.
- Exactly **one Accountable** per row — no shared accountability.

---

## 8. Vendor & partner failure summary + exercises

### 8.1 Partner failure (an implementation partner fails a customer)

When an implementation/delivery **partner** cannot meet its obligations to a customer
(insolvency, capacity loss, quality failure, abandonment), the customer's live AdOS
instance is unaffected at the product level (self-hosted), but delivery/support
continuity is at risk.

- **Governed by** the partner program: [../partner/PARTNER_OPERATIONS.md](../partner/PARTNER_OPERATIONS.md),
  [../partner/IMPLEMENTATION_METHODOLOGY.md](../partner/IMPLEMENTATION_METHODOLOGY.md),
  and [../partner/PARTNER_PROGRAM_CONSTITUTION.md](../partner/PARTNER_PROGRAM_CONSTITUTION.md).
- **Response:**
  1. Head of Partners confirms the partner failure and the affected customer(s).
  2. Customer Success is engaged to reassure and stabilize the account (§5.1).
  3. A **certified backup partner** is engaged, or the company provides bridging
     services, per the partner operations doc.
  4. Deliverables/IP are recovered via the partner agreement's exit/handover terms
     (template: [../partner/PARTNER_AGREEMENT_TEMPLATE.md](../partner/PARTNER_AGREEMENT_TEMPLATE.md)).
- **Standing mitigation:** maintain **more than one certified partner** per region/
  segment so no customer is single-partner-dependent; partner health is reviewed at
  the quarterly partner review.

### 8.2 Continuity RACI at a glance (by scenario)

| Scenario | Continuity Lead | Front-line owner | Customer-facing owner |
| --- | --- | --- | --- |
| Office/facilities loss (§2.1) | COO | Ops/IT Lead | — (unless support affected) |
| Company system loss (§2.2/§3) | COO | Ops/IT Lead | Head of CS (if support affected) |
| Key-person unavailability (§2.3) | COO | Affected dept deputy | — |
| Vendor/tool failure (§4) | COO | Owning dept lead | Head of CS (if support affected) |
| Partner failure (§8.1) | COO | Head of Partners | Head of CS |
| Customer instance outage | COO (advisory only) | Head of CS (advisory) | Head of CS → points to [../RUNBOOK.md](../RUNBOOK.md) |

### 8.3 Exercises (tabletop / drill cadence)

Continuity readiness is proven, not assumed.

| Exercise | Cadence | Owner | Objective |
| --- | --- | --- | --- |
| **Comms-tree call test** | Quarterly | COO | Verify the call tree & channel fallback (§5.3) reach every staff member |
| **Key-person / deputy drill** | Quarterly | COO | Rehearse deputy activation & break-glass access (§2.3, §3.3) |
| **Tabletop: vendor failure** | Semi-annual | Owning dept lead | Walk a CRM/email/CI outage through fallback (§4) |
| **Tabletop: partner failure** | Semi-annual | Head of Partners | Rehearse backup-partner engagement (§8.1) |
| **Full continuity tabletop** | Annual | COO + CEO | End-to-end invocation, decision RACI, comms, stand-down |
| **Product DR familiarization** | Annual | Head of Engineering | Confirm internal fluency with [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md) & [../RUNBOOK.md](../RUNBOOK.md) so support can advise customers |

Each exercise produces a short after-action note with findings and follow-up actions;
material findings feed the risk register and the next review (§9).

---

## 9. Review cycle

This plan is a living document, reviewed on the fixed BizOps operating rhythm:

| Review | Cadence | Owner | What is reviewed |
| --- | --- | --- | --- |
| Contact/roster & break-glass refresh | **Quarterly** | COO | Comms tree, deputies, break-glass record (§3.3, §5.3) |
| Risk-register alignment | **Quarterly** | COO | Continuity risks (vendor concentration, key-person, partner) |
| Full BCP review | **Annual** | COO + CEO | Whole plan: scenarios, RTO/RPO, RACI, exercise findings |
| Alignment re-check vs product truth | **Annual** (and on any AdOS release) | COO | Confirm every product statement still matches [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) |

- **Quarterly** and **annual** reviews follow the BizOps planning cadence defined in
  the BizOps constitution; the annual review coincides with the annual strategy /
  risk cycle.
- Any change to the product's deployment model (still self-hosted / offline as of
  AdOS v1.0.0) triggers an out-of-cycle review of §0–§4, since the whole plan rests
  on the self-hosted, no-vendor-cloud fact.
- Version bumps follow Semantic Versioning, consistent with the release governance
  referenced by the BizOps constitution.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
