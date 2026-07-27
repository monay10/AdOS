# AdOS OKR Framework

**Owner:** Office of the CEO
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** `../PRODUCT_TRUTH.md`

---

## 0. Purpose and scope

This document defines the official Objectives & Key Results (OKR) framework for the
**AdOS company** — the organization that builds and sells AdOS. It governs how the
company sets direction, cascades it, measures progress, and reflects at quarter
close. It is a **BizOps governance artifact**, one level above the product; it is not
product documentation and not a product feature.

OKRs here express **company ambition**, not product claims. Where an Objective or Key
Result touches product capability, it must trace to a shipped fact in
`../PRODUCT_TRUTH.md`. Any capability that is not yet shipped appears **only** under an
explicit **Roadmap** label and is cross-referenced to `../ROADMAP.md`; it is never
written as a present-tense company metric.

This framework is binding alongside its sibling governance documents. The in-repo
governing reference for BizOps as a whole is `BUSINESS_OPERATIONS_CONSTITUTION.md`;
the planning cadence, department list, and decision rights referenced below are the
company-standard definitions shared across the BizOps package.

### 0.1 Two data worlds (read before writing any Key Result)

Every Key Result draws on one of two kinds of data, and the distinction is
non-negotiable:

| Data world | Examples | May a KR measure it directly? |
|---|---|---|
| **Company-internal data the company owns** | Own CRM/pipeline, financials, headcount, engineering repo metrics, own support-desk queue, own website analytics | **Yes** — measure freely |
| **Customer-instance data** (inside a customer's self-hosted AdOS) | A customer's usage, adoption, feature engagement, in-app health | **Only if customer-reported** — see §0.2 |

### 0.2 The customer-reported rule

AdOS is **self-hosted, offline-capable, and has no vendor telemetry, no phone-home,
and no standing vendor access** (`../PRODUCT_TRUTH.md` §1.5, §2.8, §6.1). The company
**cannot** auto-observe what happens inside a customer's instance. Therefore any Key
Result that depends on customer-instance behaviour MUST be sourced as
**customer-reported / customer-exported / customer-attested** — gathered through
QBRs, surveys, customer-shared exports, or success-plan check-ins. The words
"telemetry", "auto-collected", "we observe", and "the platform reports back" are
prohibited in any KR. This is a truth constraint, not a stylistic preference.

---

## 1. Model at a glance

- **Levels:** Annual → Quarterly → Department → Personal.
- **Alignment:** set **top-down** (each level aligns to the one above), **drafted
  bottom-up** (the people accountable draft their own KRs, then reconcile upward).
- **Structure:** each Objective is **qualitative and inspirational**; each carries
  **3–5 measurable Key Results**.
- **Scoring:** every KR scores **0.0–1.0**, where **0.7 is the target** for a
  well-set OKR. KRs are typed **committed** or **aspirational**.
- **Not compensation:** OKRs are a focus-and-alignment tool. They are **not**
  individual performance pay, and OKR scores must not be used as the mechanical
  input to bonus or ranking. Performance management is a separate process.

### 1.1 The four levels

| Level | Horizon | Set by | Accountable owner | Aligns to | Count guideline |
|---|---|---|---|---|---|
| **Annual** | 1 year | CEO + executive team | Office of the CEO | Company strategy | 3–5 objectives |
| **Quarterly** | 1 quarter | Executive team | Office of the CEO | Annual OKRs | 3–5 objectives |
| **Department** | 1 quarter | Department lead + team | Department owner (§4.1 role) | Quarterly OKRs | 2–4 per department |
| **Personal** | 1 quarter | Individual + manager | The individual | Department OKRs | 1–3 per person |

The ten departments are the company-standard set: **Executive** (CEO office),
**Engineering**, **Product**, **Sales**, **Marketing**, **Customer Success**,
**Partners**, **Finance**, **Legal**, and **Operations**. Each has a single
accountable owner. Sales, Marketing, Customer Success, and Partners map to the
existing `../sales/*`, `../marketing/*`, `../customer-success/*`, and `../partner/*`
collateral.

---

## 2. How each level is set and cascades

### 2.1 Annual OKRs

- **When:** set in the **annual** planning cycle alongside the strategy, annual plan,
  and budget.
- **Who:** the CEO and executive team, ratified by the Office of the CEO.
- **What they express:** the 3–5 company-level shifts that matter most for the year —
  positioning, revenue foundation, product truth-alignment, partner ecosystem, and
  organizational maturity.
- **Cascade:** annual OKRs are the parent for every quarterly OKR. They are reviewed
  and re-scored at the annual cycle; they are **not** silently rewritten mid-year (a
  material change is a documented executive decision).

### 2.2 Quarterly OKRs

- **When:** set at the **Quarterly Business Review (QBR)** for the coming quarter.
- **Who:** the executive team, each objective owned by one executive.
- **What they express:** the quarter's contribution to the annual OKRs — concrete
  enough to grade in 13 weeks.
- **Cascade:** each quarterly OKR names its parent annual OKR. Departments draft
  against these before the quarter starts.

### 2.3 Department OKRs

- **When:** drafted in the two weeks around the QBR, finalized by the first week of
  the quarter.
- **Who:** each department lead with their team (**bottom-up draft**), reconciled with
  the executive owner of the parent quarterly OKR (**top-down alignment**).
- **What they express:** what the department will deliver this quarter, in its own
  measurable terms, that rolls up to a quarterly OKR.
- **Cascade:** every department OKR references a parent quarterly OKR. Cross-department
  KRs (e.g. Sales needing a Product deliverable) are made explicit as shared KRs with
  one accountable owner each.

### 2.4 Personal OKRs

- **When:** drafted by each individual with their manager at quarter start.
- **Who:** the individual (they draft; they own).
- **What they express:** the person's 1–3 priorities that advance a department OKR.
- **Cascade:** each personal OKR references a parent department OKR.
- **Boundary:** personal OKRs are for **focus and alignment**, explicitly **not** an
  individual performance-pay instrument (§1, §6).

---

## 3. Review process (operating rhythm)

The OKR review rhythm rides on the company-standard planning cadence.

| Cadence | Forum | OKR activity | Output |
|---|---|---|---|
| **Weekly** | Team / department check-in | Confidence update per KR; surface blockers; agree this-week actions | Updated confidence, blocker list |
| **Monthly** | Business review | OKR check-in against KPI scorecard; forecast end-of-quarter score; correct course | Monthly OKR check-in note |
| **Quarterly** | QBR | Grade the quarter (final KR scores); run the retrospective; set next quarter | Scored OKRs + retrospective |
| **Annual** | Annual planning | Score annual OKRs; set next year's annual OKRs | Annual OKR scorecard |

### 3.1 Weekly check-in

A lightweight per-KR confidence signal, not a re-grade. Each KR owner marks a
confidence band — **on track / at risk / off track** — and names the single most
important blocker and the next action. The weekly is where reality meets the plan;
scores are not changed weekly.

### 3.2 Monthly review

A structured mid-flight read: each department reports OKR progress against the KPI
catalog scorecard and forecasts the likely quarter-end score. Course corrections are
agreed here so nothing waits for the QBR. Customer-instance signals used in this
review must be **customer-reported** (§0.2).

### 3.3 Quarterly grade

At the QBR each KR receives its final numeric score (§4). Objective scores are the
average of their KRs. The quarter's OKRs are then closed and the retrospective (§5)
is run before the next quarter's OKRs are committed.

---

## 4. Scoring

### 4.1 The 0.0–1.0 scale

| Score band | Meaning |
|---|---|
| **1.0** | Fully delivered — often a sign the KR was set too low (for aspirational KRs, exceptional) |
| **0.7** | **Target.** A well-set OKR is expected to land near here |
| **0.4–0.6** | Real progress, short of target |
| **0.1–0.3** | Little progress |
| **0.0** | No progress |

The score for a numeric KR is normally **actual ÷ target**, capped at 1.0, unless the
KR defines a different scoring rule at set-time. Objective score = mean of its KR
scores. Scores are a conversation starter, not a verdict.

### 4.2 Committed vs aspirational

| Type | Intent | Expected landing | If missed |
|---|---|---|---|
| **Committed** | A promise the team fully intends to hit | ~1.0 | A miss is a serious signal; discuss why in the retro |
| **Aspirational** | A stretch that may not be fully reachable | ~0.7 or lower is healthy | A partial score is the expected outcome, not a failure |

Every KR is labelled **Committed** or **Aspirational** when it is set, so its score is
read correctly at quarter close. Roadmap-linked product KRs are typically
**aspirational** and are always framed against `../ROADMAP.md`.

### 4.3 What scores do NOT do

OKR scores do **not** flow mechanically into individual compensation, bonus
multipliers, or stack ranking. Tying pay to OKR scores corrupts target-setting
(people sandbag). Performance and reward are handled by the People process in
Operations, informed by — but not computed from — OKRs.

---

## 5. Retrospectives (quarter-close)

Every department runs a quarter-close retrospective at (or immediately after) the QBR,
before next-quarter OKRs are committed. The retro is blameless and produces written
outputs.

**Standard agenda:**
1. **Score review** — final KR/Objective scores, committed vs aspirational read.
2. **What we learned** — what the scores reveal about the plan, not the people.
3. **Kept / dropped** — which objectives carry forward, which retire.
4. **Set-quality check** — were KRs measurable, honestly sourced, and truth-aligned?
   Were any customer-instance KRs sourced as customer-reported (§0.2)? Did any product
   KR drift from `../PRODUCT_TRUTH.md`?
5. **Actions into next quarter** — concrete changes, each with an owner.

**Retro output block (copy-ready):**

```
Quarter: ____   Department: ____   Owner: ____
Objective scores: O1 __  O2 __  O3 __
Top 3 learnings:
  1. ____
  2. ____
  3. ____
Carried forward: ____        Retired: ____
Set-quality flags (measurability / sourcing / truth-alignment): ____
Actions next quarter (owner):
  - ____ (____)
```

---

## 6. Truth guardrails for Key Results (mandatory checklist)

Before any KR is committed it must pass every line below:

- [ ] The KR is **measurable** with a defined source and a numeric target.
- [ ] If it uses customer-instance data, the source reads **customer-reported /
      -exported / -attested** (§0.2) — never telemetry/auto-collected.
- [ ] It implies **no cloud, per-token, per-seat-metered, or consumption revenue** —
      the product has no metering; revenue = license/subscription resale + direct
      license, implementation/services, support/managed services, referral fees.
- [ ] It does not present a **forbidden/unshipped product capability as shipped**:
      document Q&A / cited answers, "Digital Employees" / autonomous agents, live ad
      launch or optimization, external connectors/syncs, enforced RBAC /
      permission-aware AI, immutable audit trail, DB-level RLS, cloud/hosted
      inference, vision/speech/image/video AI, tiered T0–T4 approval authority, or
      "real AI prose out of the box." Any of these belongs under a **Roadmap** label,
      tied to `../ROADMAP.md`, and is never a today-metric.
- [ ] Every shipped-product reference traces to `../PRODUCT_TRUTH.md`.

---

## 7. Examples by department

Illustrative OKRs for one quarter. Every KR below respects §6. KRs marked **[CR]** use
**customer-reported** data. KRs marked **[Roadmap]** describe a company delivery goal
*about advancing a roadmap item* (e.g. shipping documentation or a build milestone) —
they never claim the underlying product capability as already shipped.

### 7.1 Executive (Office of the CEO)

**Objective (aspirational):** Make AdOS the credible, truthfully-positioned Enterprise
AI Operating System for Advertising.

| # | Key Result | Type | Target | Source |
|---|---|---|---|---|
| KR1 | Ship v1.0.0 with company docs, GTM, and product truth fully reconciled (positioning gap items closed) | Committed | 100% of tracked items | `../POSITIONING_GAP_ANALYSIS.md`, internal tracker |
| KR2 | Reach signed annual contract value of $X across resale + direct license | Committed | $X | Company CRM (owned) |
| KR3 | Sign N reseller/implementation partners to active status | Aspirational | N partners | Partner records (owned) |
| KR4 | Achieve reference-able customer logos willing to be named | Aspirational | 5 references | Customer Success attestation [CR] |

### 7.2 Engineering

**Objective (committed):** Harden the self-hosted product so customers deploy with
confidence.

| # | Key Result | Type | Target | Source |
|---|---|---|---|---|
| KR1 | Keep test suite green and grow coverage of critical paths | Committed | ≥ 368 cases passing, +40 new | CI (owned repo) |
| KR2 | Cut median clean-install time on reference hardware | Committed | ≤ 15 min | Internal install benchmark (owned) |
| KR3 | Close all Critical/High issues in the security backlog | Committed | 0 open Critical/High | `../SECURITY_REPORT.md`, issue tracker |
| KR4 | **[Roadmap]** Land Book-2 Ollama inference-engine adapter milestone (real HTTP client, health checks, retries) | Aspirational | Milestone accepted | `../ROADMAP.md` (Book 2) |

### 7.3 Product

**Objective (aspirational):** Sharpen the human-approved advertising pipeline so it is
obviously valuable end-to-end.

| # | Key Result | Type | Target | Source |
|---|---|---|---|---|
| KR1 | Onboarding wizard completion in ≤ N steps validated with M design-partner walkthroughs | Committed | M ≥ 8 walkthroughs | Design-partner sessions [CR] |
| KR2 | Publish decision docs (ADRs) for the quarter's pipeline changes | Committed | 100% of Type-1 changes | ADR register |
| KR3 | Customers rate brief→creative→draft→report flow ≥ 4/5 usefulness | Aspirational | ≥ 4.0 avg | QBR/survey [CR] |
| KR4 | **[Roadmap]** Publish scoped spec + acceptance criteria for a future connector-hub integration | Aspirational | Spec accepted | `../ROADMAP.md` (Book 11), `../KNOWN_LIMITATIONS.md` |

### 7.4 Sales

**Objective (committed):** Build a repeatable pipeline for the self-hosted license +
services model.

| # | Key Result | Type | Target | Source |
|---|---|---|---|---|
| KR1 | Generate $X in qualified pipeline (license + implementation) | Committed | $X | Company CRM (owned) |
| KR2 | Close N new license/subscription deals | Committed | N deals | Company CRM (owned) |
| KR3 | Achieve win rate on qualified opportunities | Aspirational | ≥ 25% | Company CRM (owned) |
| KR4 | Maintain average sales cycle length under T days | Aspirational | ≤ T days | Company CRM (owned) |

*Note: revenue KRs are license/subscription and services only — no consumption,
per-token, or per-seat-metered revenue exists to sell (§6).*

### 7.5 Marketing

**Objective (aspirational):** Make the truthful "Enterprise AI Operating System for
Advertising" positioning land with the right buyers.

| # | Key Result | Type | Target | Source |
|---|---|---|---|---|
| KR1 | Drive N marketing-qualified leads aligned to ICP | Committed | N MQLs | Own web + marketing analytics (owned) |
| KR2 | Publish P positioning-aligned assets (all passing the product-truth review) | Committed | P assets, 100% reviewed | Content tracker, `../POSITIONING_ALIGNMENT_PLAN.md` |
| KR3 | Grow qualified organic sessions on the company site | Aspirational | +X% | Own web analytics (owned) |
| KR4 | Zero published claims contradicting `../PRODUCT_TRUTH.md` (truth-review pass rate) | Committed | 100% pass | Marketing review log |

### 7.6 Customer Success

**Objective (committed):** Ensure self-hosting customers reach value and renew.

| # | Key Result | Type | Target | Source |
|---|---|---|---|---|
| KR1 | Gross logo retention across renewing accounts | Committed | ≥ 90% | Renewal contracts (owned) |
| KR2 | Customers reporting first successful mission-to-dashboard run within onboarding window | Aspirational | ≥ 80% of new accounts | Onboarding attestation [CR] |
| KR3 | Median company-side support first-response time | Committed | ≤ 1 business day | Own support desk (owned) |
| KR4 | Customer-reported health/adoption check-ins completed per active account | Committed | ≥ 1 per quarter | Success-plan check-in [CR] |

*Note: adoption/health inside a customer instance is customer-reported; there is no
vendor telemetry (§0.2). Support-desk metrics are company-owned and measured
directly.*

### 7.7 Partners (Partner / Channel)

**Objective (aspirational):** Stand up a partner channel that delivers implementation
and support at quality.

| # | Key Result | Type | Target | Source |
|---|---|---|---|---|
| KR1 | Recruit and enable N partners to certified status | Committed | N partners | Partner records (owned) |
| KR2 | Partner-sourced pipeline as a share of total pipeline | Aspirational | ≥ 20% | Company CRM (owned) |
| KR3 | Partners completing enablement/certification | Committed | 100% of active partners | Enablement tracker (owned) |
| KR4 | Partner-delivered implementations with customer-attested successful go-live | Aspirational | M go-lives | Partner + customer attestation [CR] |

*Note: services revenue is partner-retained where a partner delivers; discount/referral
baselines are illustrative and contractual, not metered (§6).*

### 7.8 Finance

**Objective (committed):** Put the company on a predictable, well-controlled financial
footing.

| # | Key Result | Type | Target | Source |
|---|---|---|---|---|
| KR1 | Recognized revenue across license, services, support, referral streams | Committed | $X | Finance ledger (owned) |
| KR2 | Gross margin on the license + services mix | Committed | ≥ M% | Finance ledger (owned) |
| KR3 | Cash runway maintained | Committed | ≥ K months | Finance model (owned) |
| KR4 | Monthly close completed by working-day W | Aspirational | ≤ WD5 | Finance close log (owned) |

*Note: no line item assumes cloud markup, per-token, or consumption billing — none
exists (§6).*

### 7.9 Legal

**Objective (committed):** Make contracting fast and low-risk for a self-hosted,
license-based product.

| # | Key Result | Type | Target | Source |
|---|---|---|---|---|
| KR1 | Standard license + services agreement templates finalized and in use | Committed | 100% of new deals on standard paper | Contract repository (owned) |
| KR2 | Median contract turnaround time | Aspirational | ≤ T days | Legal intake log (owned) |
| KR3 | Data-handling terms accurately reflect self-hosted / no-vendor-telemetry reality | Committed | 100% of agreements reviewed | Legal review log, `../PRODUCT_TRUTH.md` |
| KR4 | Open compliance/IP risk items closed or mitigated | Committed | 0 open High | Risk register (owned) |

### 7.10 Operations (BizOps / People / IT)

**Objective (aspirational):** Run a company that scales cleanly and stays resilient.

| # | Key Result | Type | Target | Source |
|---|---|---|---|---|
| KR1 | Complete quarterly business-continuity review (company-scope, distinct from product DR) | Committed | Review completed + actions logged | Continuity review; cross-ref `../DISASTER_RECOVERY.md`, `../RUNBOOK.md` |
| KR2 | Fill priority open roles | Committed | N hires | HR/ATS (owned) |
| KR3 | New-hire time-to-productivity | Aspirational | ≤ T weeks | Onboarding tracker (owned) |
| KR4 | OKR + KPI cadence adhered to across all 10 departments | Committed | 100% cadence compliance | BizOps operating log (owned) |

---

## 8. Templates (copy-ready)

### 8.1 OKR block

```
Level:        [ Annual | Quarterly | Department | Personal ]
Period:       [ FY____ | Q_-____ ]
Owner:        [ single accountable person ]
Parent OKR:   [ id/title of the level above — required for Q/Dept/Personal ]

OBJECTIVE (qualitative, inspirational):
  ____________________________________________________________

KEY RESULTS (3–5, each measurable):
  KR1  [Committed|Aspirational]  ______________________  Target: ____  Source: ____
  KR2  [Committed|Aspirational]  ______________________  Target: ____  Source: ____
  KR3  [Committed|Aspirational]  ______________________  Target: ____  Source: ____
  KR4  [Committed|Aspirational]  ______________________  Target: ____  Source: ____
  KR5  [Committed|Aspirational]  ______________________  Target: ____  Source: ____

TRUTH CHECK (all must be true before commit):
  [ ] Measurable with defined source + numeric target
  [ ] Customer-instance data is customer-reported (not telemetry)   [n/a if company-owned]
  [ ] No cloud / per-token / per-seat-metered / consumption revenue implied
  [ ] No forbidden/unshipped product capability stated as shipped ( → Roadmap if so )
  [ ] Every shipped-product reference traces to ../PRODUCT_TRUTH.md
```

### 8.2 Weekly check-in line (per KR)

```
KR: ____   Confidence: [ On track | At risk | Off track ]
Top blocker: ____        Next action (owner): ____
```

### 8.3 Quarterly grade row (per KR)

```
KR: ____   Type: [Committed|Aspirational]   Actual: ____   Target: ____   Score (0.0–1.0): ____
Read (why this score): ____
```

---

## 9. Cross-references

- `../PRODUCT_TRUTH.md` — source of truth for what the product does and does not do.
- `../ROADMAP.md` — the only place future product capabilities are committed; all
  **[Roadmap]** KRs trace here.
- `../KNOWN_LIMITATIONS.md` — current product limits (informs honest KR framing).
- `../POSITIONING_GAP_ANALYSIS.md`, `../POSITIONING_ALIGNMENT_PLAN.md` — positioning
  reconciliation referenced by Executive and Marketing OKRs.
- `../DISASTER_RECOVERY.md`, `../RUNBOOK.md` — product DR/continuity, referenced by
  the company-scope continuity OKR in Operations.
- `../sales/*`, `../marketing/*`, `../customer-success/*`, `../partner/*` — the
  department collateral these OKRs roll up to.
- Sibling BizOps documents (planning cadence, KPI catalog, decision rights, risk
  register, release governance) — the shared governance context; the in-repo
  governing reference is `BUSINESS_OPERATIONS_CONSTITUTION.md`.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
