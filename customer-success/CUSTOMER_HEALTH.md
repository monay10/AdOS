# AdOS — Customer Health Model

**Owner:** Customer Success Analytics
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)

> **Product framing (verbatim):** AdOS is the **Enterprise AI Operating System for
> Advertising** — an offline-first, 100% local-AI platform that takes a client's
> advertising objective (a **Mission**) through a **human-approved pipeline**
> (marketing brief → creative/ad copy → campaign **draft** → performance report →
> executive dashboard) and remembers what works in a marketing-performance
> **Company Brain**. It **drafts**; it never launches live ads.

---

## 0. THE constraint you must read first — there is NO vendor telemetry

**AdOS is self-hosted, offline, and has NO phone-home telemetry.** The product
does not report usage back to the vendor. There is **no vendor-side dashboard that
auto-populates from customer instances**, and the Customer Success team **cannot
auto-collect** any customer's usage data.

Consequently, **every input to this health model is CUSTOMER-SHARED.** The
customer's own admin exports or reports the figures — mission counts,
campaign-draft throughput, KPI reports, Company Brain growth, active users,
training/certification completion, EBR attendance — from **their own instance**,
during scheduled check-ins and Executive Business Reviews (EBRs). The signals are
real and they live inside the product (the admin can see them in the activity log,
the reports, and the Company Brain); what does not exist is any automatic pipe that
sends them to us.

Practically, this means:

- A health score is only as fresh as the **last customer-shared export**. Between
  check-ins, the score is a **stale snapshot**, not a live reading. Always stamp
  every scorecard with an **"as-of / data-shared" date**.
- The CSM is responsible for **collecting** the inputs (asking, templating, and
  recording them), not for **querying** a customer instance we cannot reach.
- Any statement in this document that reads like "we observe usage" means "the
  customer shared these figures with us." We never observe a customer instance
  directly.

A future, **opt-in, customer-controlled** export helper is described under
[§8 Roadmap](#8-roadmap) — and only there. It is not shipped and must never be
described as shipped.

---

## 1. What the health model is for

The Customer Health Model produces a single **composite health score (0–100)** and
a **RAG band** (Green / Yellow / Red) per customer account, from **ten weighted
dimensions**. It exists to:

1. Tell the CSM, in one number and one color, whether an account is thriving,
   drifting, or at risk — using the shared vocabulary in `CUSTOMER_SUCCESS_CONSTITUTION.md`.
2. Trigger the correct **intervention playbook** for the band (expand, intervene,
   escalate) — tied to the risk model in `CUSTOMER_SUCCESS_CONSTITUTION.md` and the
   severity model in `SUPPORT_PLAYBOOK.md`.
3. Feed the **renewal and expansion forecast** with an evidence-based, not
   anecdotal, read of the relationship.

The ten dimensions are the canonical set from `CUSTOMER_SUCCESS_CONSTITUTION.md`: Adoption, Usage,
AI utilization, Campaign throughput, Knowledge growth (Company Brain), Support
tickets, Training completion, Executive engagement, Renewal probability, Expansion
opportunity.

---

## 2. The ten health dimensions

Each dimension maps to a **real, in-product signal** from `PRODUCT_TRUTH.md`. The
**Collection method** column is the load-bearing column: it states exactly how the
figure reaches the CSM, and it is **always customer-shared** (see §0).

| # | Dimension | What good looks like | How it is measured (real product signal) | COLLECTION METHOD — customer-shared / how | Weight |
|---|---|---|---|---|---|
| 1 | **Adoption** | Multiple workspaces/clients/brands configured; the intended users are onboarded and logging in | Count of Workspaces → Clients → Brands → Products configured (onboarding wizard model) and named users provisioned (`PRODUCT_TRUTH` §1.2, §3) | Admin **exports/screenshares the onboarding & user roster** during onboarding calls and monthly check-ins | 15% |
| 2 | **Usage** | Missions run routinely; steady logins week over week | Count of **Missions** created/run and login activity, read from the **in-product activity log** the admin can see (bounded in-memory ring of 50 in the web feed; structured logs — `PRODUCT_TRUTH` §2.7, `CUSTOMER_SUCCESS_CONSTITUTION.md`) | Admin **reports mission counts and reads the activity feed / structured logs** on the check-in call | 15% |
| 3 | **AI utilization** | Pipeline stages actively generating drafts; ideally a **local model engine configured** for genuine prose | Count of AI generations (briefs, creative sets, campaign drafts, reports). Note the **default is the deterministic OfflineAIManager** (templates, no server); genuine model prose requires a configured **local Ollama / OpenAI-compatible** engine (`PRODUCT_TRUTH` §1.5, §3) | Admin **states which engine is configured** and shares generation volume; Solution Architect confirms engine config during technical review | 10% |
| 4 | **Campaign throughput** | A steady flow of campaign **drafts** and performance **reports** produced and approved | Count of **CampaignDrafts** assembled (channels/ad sets/budget split — never launched) and **CampaignReports** produced (`PRODUCT_TRUTH` §1.3–1.4, §3). KPIs (CTR/CPC/CPA/CPL/ROAS/ROI) are **hand-entered via a form**, not ingested | Admin **exports/shares draft + report counts and the KPI reports** at check-ins and EBRs | 10% |
| 5 | **Knowledge growth (Company Brain)** | Company Brain accumulating brand profiles, insights, and win-patterns over time | Growth in **Company Brain** contents: CompanyDNA, BrandProfiles, Marketing/Creative/Sales insights, SOP performance, the campaign→ad→lead→ROI knowledge graph, the winning-ad **pattern library**, the experience engine (`PRODUCT_TRUTH` §1.10; **marketing-performance memory**, not a document KB) | Admin **reports Company Brain growth** (profile/insight/pattern counts) at monthly check-ins and EBRs | 10% |
| 6 | **Support tickets** | Low volume; healthy severity mix; no recurring Sev 1/Sev 2 | Ticket **volume and severity mix** per `SUPPORT_PLAYBOOK.md` / `CUSTOMER_SUCCESS_CONSTITUTION.md` (Sev 1 Critical → Sev 4 Low). Self-hosted: SLA is vendor **response**, not remote fix | **Vendor-side** support records (the one input the vendor holds directly, because the customer raised the ticket to us) — reconciled with the customer at check-ins | 10% |
| 7 | **Training completion** | Team members trained; at least one certified admin | Completion of enablement + **certification** levels (Associate → Professional → Administrator → Architect → Partner → Trainer — `CUSTOMER_SUCCESS_CONSTITUTION.md`) | Trainer records completion from **customer-attended** sessions; admin **confirms internal training** status | 10% |
| 8 | **Executive engagement** | Executive Sponsor attends EBRs; champion identified and active | **EBR attendance** and cadence adherence (quarterly EBR — `CUSTOMER_SUCCESS_CONSTITUTION.md`); presence of an Executive Sponsor + Champion (`CUSTOMER_SUCCESS_CONSTITUTION.md`) | CSM **records attendance and sponsor/champion participation** at each EBR | 8% |
| 9 | **Renewal probability** | Clear intent to renew subscription + support; budget confirmed | CSM's evidence-based judgment blending dimensions 1–8, contract timeline, and stated intent — mapped to the risk model in `CUSTOMER_SUCCESS_CONSTITUTION.md` | CSM assessment from **customer-shared** signals + renewal conversations | 7% |
| 10 | **Expansion opportunity** | Demand for more seats, brands/clients, or scale (M3→M5 maturity) | Signals of scaling: more users, more Clients/Brands, local engine + persistence + verified backups enabled, Company Brain reuse (maturity M3–M5 — `CUSTOMER_SUCCESS_CONSTITUTION.md`) | CSM/Solution Architect capture expansion signals **from customer conversations** and shared config | 5% |

**Weights sum to 100%.** Adoption and Usage carry the most weight because, for a
self-hosted product with no vendor telemetry, *are the right people actually running
Missions* is the single most predictive fact we can obtain.

---

## 3. Composite scoring formula

Each dimension is scored **0–100** against its "what good looks like" rubric (a
simple, documented 0/25/50/75/100 ladder the CSM applies from the shared data), then
combined by weight.

```
Health = 0.15·Adoption
       + 0.15·Usage
       + 0.10·AI_utilization
       + 0.10·Campaign_throughput
       + 0.10·Knowledge_growth
       + 0.10·Support_tickets
       + 0.10·Training_completion
       + 0.08·Executive_engagement
       + 0.07·Renewal_probability
       + 0.05·Expansion_opportunity
```

Result is a single **0–100 composite**. Two mandatory annotations travel with every
score:

- **As-of / data-shared date** — the date the customer last shared the underlying
  figures. A score older than one check-in cycle is flagged **stale** (see §0).
- **Coverage** — how many of the ten dimensions had fresh customer-shared inputs. If
  a dimension was **not shared**, score it against the last known value and mark it
  *carried-forward*; if never shared, mark it *unknown* and **do not silently
  substitute a full-marks default** — an unknown dimension caps the account's band
  at **Yellow** until the input is collected.

### Critical-signal override

Regardless of the composite, an account is **forced to Red** if any of the
following customer-shared/vendor-held facts are true:

- An **open Sev 1** (production down / cannot log in / data-loss risk —
  `CUSTOMER_SUCCESS_CONSTITUTION.md`) that is past its response/workaround target.
- **Renewal probability scored ≤ 25** with the contract inside its renewal window.
- **Usage collapsed to near-zero** (no Missions run since the prior check-in) — the
  clearest churn precursor for a self-hosted deployment.

---

## 4. RAG bands

| Band | Score | Meaning | Maturity signal (`CUSTOMER_SUCCESS_CONSTITUTION.md`) |
|---|---|---|---|
| 🟢 **Green** | **≥ 80** | Healthy — adopting and realizing value; renewal likely; expansion candidate | Typically M3–M5 |
| 🟡 **Yellow** | **60–79** | At watch — drifting, uneven adoption, or an unknown/unshared dimension | Typically M2–M3 |
| 🔴 **Red** | **< 60** | At risk — low usage, stalled adoption, escalating support, or a critical-signal override | Typically M1–M2 |

Bands mirror the risk tiers in `CUSTOMER_SUCCESS_CONSTITUTION.md` (Green = low risk,
Yellow = elevated risk, Red = high/at-risk). A stale or low-coverage score is
treated **one band more cautiously** than its raw number until refreshed.

---

## 5. Per-band intervention playbooks

Each band drives a defined motion. These tie to the account risk model in
`CUSTOMER_SUCCESS_CONSTITUTION.md` and, where support is involved, to the severity
and SLA model in `SUPPORT_PLAYBOOK.md`.

### 🟢 Green — Expand & Advocate
- **Owner:** CSM (with Solution Architect for scale).
- **Motions:**
  - Pursue **expansion** (dimension 10): more seats, more Clients/Brands, advance
    maturity toward **M5 — Transforming** (`CUSTOMER_SUCCESS_CONSTITUTION.md`).
  - Deepen **Company Brain** reuse — turn accumulated win-patterns into new Missions
    (dimension 5).
  - Develop advocacy: certified **Administrator/Architect** champions
    (`CUSTOMER_SUCCESS_CONSTITUTION.md`), reference stories, EBR case studies.
  - Confirm and **secure the renewal** early.
- **Cadence:** standard monthly check-in + quarterly EBR.

### 🟡 Yellow — Intervene
- **Owner:** CSM leads; Solution Architect and Trainer as needed.
- **Motions:**
  - Diagnose the **weakest weighted dimension(s)** and any **unknown/unshared**
    dimension first — often the Yellow is a *data-collection gap*, not a real
    decline. Get the missing customer-shared export.
  - If **Usage/Adoption** is soft: re-run onboarding motions, targeted enablement,
    revisit the first-value Mission.
  - If **AI utilization** is low and only the deterministic default is in use, have
    the Solution Architect help configure a **local Ollama / OpenAI-compatible**
    engine (`PRODUCT_TRUTH` §1.5).
  - Build a **written 30–60 day success plan** with the champion; raise check-in
    frequency toward weekly (`CUSTOMER_SUCCESS_CONSTITUTION.md`).
  - Register the account at **elevated risk** per
    `CUSTOMER_SUCCESS_CONSTITUTION.md`.
- **Cadence:** weekly until back to Green.

### 🔴 Red — Escalate & Save
- **Owner:** CSM + CS leadership; Executive Sponsor engaged both sides.
- **Motions:**
  - Open a formal **save plan** under the at-risk process in
    `CUSTOMER_SUCCESS_CONSTITUTION.md`.
  - If Red is driven by an **open Sev 1/Sev 2**, drive it through
    `SUPPORT_PLAYBOOK.md` (Sev 1 response 1 business hour, workaround target 4h;
    Sev 2 response 4 business hours) and reconcile once resolved. Remember support
    SLA is vendor **response**, not remote fix — the deployment is on customer
    infrastructure and the vendor has no standing access (`CUSTOMER_SUCCESS_CONSTITUTION.md`).
  - Re-establish **Executive engagement**: schedule an urgent EBR/exec alignment;
    reconfirm value against the customer's original objectives.
  - Rebuild **Usage** from a concrete next Mission; verify persistence + backups if
    a data-loss scare is involved (`PRODUCT_TRUTH` §3 backup/recovery).
  - Explicit **renewal risk decision** with a dated recovery milestone.
- **Cadence:** weekly or twice-weekly with leadership visibility until out of Red.

---

## 6. Health-review cadence

Cadence follows the lifecycle stages and cadence in `CUSTOMER_SUCCESS_CONSTITUTION.md` (`CUSTOMER_SUCCESS_CONSTITUTION.md`,
§4.7). **Every review depends on a customer-shared data pull** — schedule the export
request *before* the meeting.

| Review | Frequency | Lifecycle stage | Inputs collected (all customer-shared) | Output |
|---|---|---|---|---|
| **Onboarding health touch** | Weekly | Onboard (Day 0 → Month 1) | Install/config progress, first Mission, user provisioning | Adoption/Usage read; unblock go-live |
| **Monthly check-in** | Monthly | Adopt → Mature | Mission counts, draft/report counts, Company Brain growth, activity log, training status | Refreshed composite + band |
| **Quarterly EBR** | Quarterly | Realize Value → Renew | Full 10-dimension pull, KPI reports, exec attendance, expansion signals | Full scorecard + forward plan |
| **Annual renewal review** | Annual | Renew & Expand | Renewal intent, expansion scope, certification status | Renewal decision + expansion proposal |
| **Ad-hoc (event-driven)** | On trigger | Any | Whatever the trigger needs (e.g. Sev 1, usage drop) | Re-score; critical-signal override check |

Between reviews the score is **frozen at last-shared** — this is a direct
consequence of the no-vendor-telemetry constraint in §0, not an oversight.

---

## 7. Worked example scorecard

**Account:** "Northwind Media" (fictional) · **As-of / data-shared:** 2026-07-20
(shared by customer admin at July monthly check-in) · **Coverage:** 10/10 fresh.

| # | Dimension | Score (0–100) | Weight | Weighted | Notes (from customer-shared data) |
|---|---|---|---|---|---|
| 1 | Adoption | 85 | 0.15 | 12.75 | 1 workspace, 3 Clients, 6 Brands configured; 9 of 12 intended users onboarded |
| 2 | Usage | 80 | 0.15 | 12.00 | 22 Missions run last month; logins steady across the team (per activity log) |
| 3 | AI utilization | 70 | 0.10 | 7.00 | Local Ollama engine configured; generation volume healthy, not yet on every stage |
| 4 | Campaign throughput | 75 | 0.10 | 7.50 | 18 campaign **drafts** + 15 **reports**; KPIs hand-entered and shared |
| 5 | Knowledge growth | 65 | 0.10 | 6.50 | Company Brain: 6 brand profiles, ~40 insights, pattern library beginning to fill |
| 6 | Support tickets | 90 | 0.10 | 9.00 | 2 tickets this quarter, both Sev 3, resolved within SLA response |
| 7 | Training completion | 60 | 0.10 | 6.00 | 5 Associate-certified; 1 Administrator in progress |
| 8 | Executive engagement | 80 | 0.08 | 6.40 | Sponsor attended Q2 EBR; active champion identified |
| 9 | Renewal probability | 75 | 0.07 | 5.25 | Verbal intent to renew; budget under confirmation |
| 10 | Expansion opportunity | 70 | 0.05 | 3.50 | Discussing +6 seats and a 4th Client for next quarter (M3→M4) |
| | **Composite** | | **1.00** | **75.40** | |

**Result: 75.4 → 🟡 Yellow.** No critical-signal override triggered.

**Interpretation & action:** A fundamentally strong account held out of Green by
**Training completion (60)** and **Knowledge growth (65)**. Per the Yellow playbook
(§5): Trainer drives the in-progress **Administrator** certification and schedules
Professional-level enablement; Solution Architect coaches Company Brain reuse to
convert early patterns into new Missions. With those two dimensions lifted into the
80s, the composite crosses into Green and the **expansion** conversation (dimension
10) becomes the primary motion. Next data pull scheduled for the August check-in.

---

## 8. Roadmap

The following is **NOT shipped** and must never be presented as a current
capability. It is a planned, explicitly optional future direction.

- **Opt-in, customer-controlled telemetry export helper (Planned).** A future,
  **customer-installed and customer-controlled** utility that would let a customer's
  admin **choose to export** a standard health snapshot (mission counts, draft/report
  throughput, Company Brain growth, active users, training status) as a file to share
  with their CSM — reducing manual copy-out at check-ins. It would remain
  **opt-in, on customer infrastructure, and initiated by the customer**; it would
  **not** phone home, and there would be **no vendor-side auto-collection**. Until and
  unless this ships, **all** health inputs remain manually customer-shared exactly as
  described in §0–§7.

This Roadmap item is the *only* place in this document where anything resembling
automated collection is mentioned. Consistent with `PRODUCT_TRUTH.md` §2.8 and
`CUSTOMER_SUCCESS_CONSTITUTION.md`, AdOS ships with **no phone-home telemetry** and there is **no
vendor-side dashboard that auto-populates from customer instances**.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
