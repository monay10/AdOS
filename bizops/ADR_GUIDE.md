# ADR Guide — Architecture & Business Decision Records

**Owner:** Office of the CTO
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

> This guide defines the **Architecture & Business Decision Record (ADR)** system for
> AdOS — how significant, hard-to-reverse decisions (technical *and* commercial) are
> proposed, reviewed, decided, recorded, indexed, superseded, and retired. It is a
> BizOps governance artifact: it governs how the **company** decides, not a product
> feature. The governing framework for BizOps decision rights (RACI, Type 1 / Type 2
> classes) is [`./BUSINESS_OPERATIONS_CONSTITUTION.md`](./BUSINESS_OPERATIONS_CONSTITUTION.md);
> this guide operationalizes ADRs within that framework.

---

## 1. Purpose & scope

An ADR captures **one decision** and its reasoning at the moment it is made, so that
future readers understand *why* the organization chose a path — not just *what* it
chose. ADRs are the durable memory of the company's architecture and business
direction.

**In scope (an ADR is required or recommended):**
- Architecture and platform choices with long-lived consequences (persistence model,
  AI runtime strategy, tenancy approach, security posture).
- Product-direction decisions that commit or defer a capability (what ships in
  AdOS v1.0.0 vs what is deferred to [`../ROADMAP.md`](../ROADMAP.md)).
- Commercial / operating decisions that are costly to unwind (revenue-model shape,
  packaging, partner-model structure, standard contract posture).
- Any decision classified **Type 1** (see §3) — an ADR is **mandatory**.

**Out of scope (no ADR needed):**
- Reversible, low-blast-radius choices owned by a single accountable owner
  (**Type 2**) — record in the normal work tracker, not here.
- Routine operational actions already governed by a runbook or checklist
  (e.g. release mechanics in [`./RELEASE_GOVERNANCE.md`](./RELEASE_GOVERNANCE.md),
  recovery steps in [`../DISASTER_RECOVERY.md`](../DISASTER_RECOVERY.md) and
  [`../RUNBOOK.md`](../RUNBOOK.md)).

**Truthfulness rule.** Every ADR that references a product capability must trace to a
fact stated in [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Capabilities that are
absent or stubbed today (document Q&A, autonomous "Digital Employees", live ad launch,
external connectors, enforced RBAC, immutable audit, cloud inference) may appear in an
ADR **only** as a decision to *defer them to Roadmap* — never as a shipped decision.
See also [`../KNOWN_LIMITATIONS.md`](../KNOWN_LIMITATIONS.md).

---

## 2. ADR identity & format

- **ID format:** `ADR-NNNN` — a zero-padded four-digit sequence, assigned in strict
  monotonic order (`ADR-0001`, `ADR-0002`, …). IDs are never reused, even after an
  ADR is superseded or deprecated.
- **File naming:** `bizops/adr/ADR-NNNN-short-slug.md` (kebab-case slug from the
  title). One decision per file. The file is created at **Proposed** and edited in
  place through its lifecycle.
- **One decision per ADR.** If a proposal contains two separable decisions, split it
  into two ADRs and cross-link them.

### 2.1 Statuses

ADRs move through exactly these statuses:

| Status | Meaning | Who sets it |
|---|---|---|
| **Proposed** | Drafted and under review; not yet binding. | Author |
| **Accepted** | Decided and in force; the organization is committed. | The Accountable (per §5) |
| **Superseded** | Replaced by a newer ADR; kept for history, no longer in force. | The Accountable of the superseding ADR |
| **Deprecated** | No longer applicable (context dissolved) but **not** replaced. | The Accountable / decision owner |

Legal status transitions:

```
Proposed ──accept──► Accepted ──superseded-by──► Superseded
   │                    │
   │                    └────retire (no replacement)────► Deprecated
   └──reject/withdraw──► (closed; ID retained, status "Proposed — Withdrawn")
```

A **Proposed** ADR that is rejected or withdrawn is retained (never deleted) and
marked in the log as withdrawn; its ID is not reissued.

---

## 3. Decision classes — Type 1 vs Type 2

AdOS BizOps classifies decisions by reversibility, following the shared framework in
[`./BUSINESS_OPERATIONS_CONSTITUTION.md`](./BUSINESS_OPERATIONS_CONSTITUTION.md).

| | **Type 1** | **Type 2** |
|---|---|---|
| **Nature** | Irreversible / high-impact ("one-way door") | Reversible / low-impact ("two-way door") |
| **Examples** | AI runtime strategy, persistence model, revenue-model shape, deferring a capability to Roadmap | Copy tweaks, config defaults, internal tooling choices, experiment parameters |
| **Authority** | Executive + **documented ADR required** | Delegated to the single accountable owner |
| **ADR needed?** | **Yes — mandatory** | Optional; usually recorded in the work tracker instead |
| **Review depth** | Full review cycle (§4), Consulted parties engaged | Owner's discretion |

**Rule:** every **Type 1** decision **must** have an Accepted ADR before it takes
effect. Type 2 decisions do not require an ADR, but an owner may raise one voluntarily
when a decision is likely to be questioned later or sets a precedent.

Each ADR names its class explicitly in the **Type** field. If reviewers disagree on
class, it is treated as **Type 1** until the Accountable rules otherwise.

---

## 4. Workflow — draft → review → decide

```
   ┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
   │  DRAFT  │ ──► │  REVIEW  │ ──► │ DECIDE  │ ──► │  RECORD  │
   │(Proposed)│     │(Consulted)│    │(Account.)│    │ (Index)  │
   └─────────┘     └──────────┘     └─────────┘     └──────────┘
```

1. **Draft (Proposed).**
   - The author (Responsible party) creates `ADR-NNNN` from the template in §7,
     status **Proposed**, and fills Context, Decision, Consequences, Alternatives.
   - The author classifies the decision **Type 1** or **Type 2** and names the single
     **Accountable** owner and the **Consulted** / **Informed** parties (RACI, §5).
   - The author adds the row to the **ADR Index** (§9) as *Proposed*.

2. **Review (Consulted).**
   - Consulted parties review within the standard window (**5 business days** for
     Type 1; shorter at owner discretion for Type 2).
   - Review checks: correctness, alternatives genuinely weighed, consequences honest,
     and — mandatory — **product-truth alignment** against
     [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Any product claim not traceable to
     it blocks acceptance.
   - Comments are captured in the ADR's **Links** or an inline "Review notes" section.

3. **Decide (Accountable).**
   - The single **Accountable** owner accepts, rejects, or returns the ADR for rework.
   - On acceptance: status → **Accepted**, **Date** set to the decision date,
     **Deciders** finalized. The decision is now in force.
   - On rejection/withdrawal: status → *Proposed — Withdrawn*; the ID is retained and
     the Index updated.

4. **Record (Index).**
   - The Index row (§9) is updated to the final status.
   - **Informed** parties are notified (this is a communication step — changelog note,
     internal announcement — not any automated push).

Decision cadence follows the operating rhythm in
[`./BUSINESS_OPERATIONS_CONSTITUTION.md`](./BUSINESS_OPERATIONS_CONSTITUTION.md):
Type 1 ADRs are ordinarily ratified at the weekly operational review or, for
strategic scope, at the quarterly business review.

---

## 5. Approval & decision rights (RACI)

Approval authority is expressed through **RACI**, with **exactly one Accountable per
decision**.

| RACI role | In an ADR | Rule |
|---|---|---|
| **Responsible** | The author who drafts and drives the ADR | One or more |
| **Accountable** | The owner who **accepts** the ADR and owns the outcome | **Exactly one** |
| **Consulted** | Parties whose input is sought before the decision | Two-way dialogue |
| **Informed** | Parties told after the decision | One-way notification |

**Who is Accountable, by decision domain** (single accountable owner per §4.1 of the
BizOps framework):

| Decision domain | Accountable (Office) |
|---|---|
| Architecture, AI runtime, persistence, security posture | Office of the CTO / Engineering |
| Product scope, ship-vs-defer, Roadmap placement | Office of the CTO / Product |
| Revenue model, pricing posture, packaging | Office of the CEO with Finance |
| Partner / channel model | Office of the CEO / Partners |
| Legal / contract posture | Office of the CEO / Legal |
| Company operations, security & compliance governance | Office of the COO |

An ADR cannot be **Accepted** by its own sole author unless that author is also the
designated Accountable for the decision domain. Cross-domain Type 1 decisions name the
Accountable from the most-impacted domain and list the others as Consulted.

---

## 6. Versioning, ownership, retention, review

### 6.1 Versioning
- **The ADR record itself is immutable in intent once Accepted.** The decision as
  taken is not rewritten. Corrections of typos/links are allowed; a change of
  *substance* is not an edit — it requires a **new ADR that supersedes** the old one
  (§10).
- Each ADR carries a small **Change log** at its foot (date · editor · nature of
  edit) so any post-acceptance touch is transparent.
- This **guide** is versioned with Semantic Versioning and tracks the AdOS product
  line (currently **v1.0.0**), consistent with
  [`./RELEASE_GOVERNANCE.md`](./RELEASE_GOVERNANCE.md).

### 6.2 Ownership
- **System owner:** Office of the CTO owns the ADR system, this guide, and the Index.
- **Record owner:** the **Accountable** named on each ADR owns that record for its
  lifetime, including initiating supersession or deprecation.
- The **Operations** function (BizOps) maintains the Index mechanics and the periodic
  review.

### 6.3 Retention
- ADRs are **retained permanently**. Superseded and Deprecated records are never
  deleted — they are the historical record of *why* past choices were made.
- Retention lives in version control (repo history) plus the Index. Deletion of an ADR
  is prohibited; retirement is expressed only through status.

### 6.4 Review
- **Quarterly:** Operations + the CTO office review all Accepted ADRs for continued
  validity; any whose context has dissolved is marked **Deprecated**, any replaced is
  marked **Superseded**.
- **On material change:** whenever [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md) or the
  Roadmap shifts, affected ADRs are re-examined for truth alignment.
- The review outcome is minuted; no product code, packages, domains, or tests are
  touched by this governance activity.

---

## 7. ADR template (copy-ready)

Copy the block below into `bizops/adr/ADR-NNNN-short-slug.md` and fill every field.

```markdown
# ADR-NNNN — <Concise decision title>

- **ID:** ADR-NNNN
- **Status:** Proposed | Accepted | Superseded | Deprecated
- **Date:** YYYY-MM-DD   (date of the decision, set at Accepted)
- **Type:** Type 1 (irreversible — ADR required) | Type 2 (reversible)
- **Deciders:**
  - Accountable: <exactly one name / office>
  - Responsible: <author(s)>
  - Consulted: <parties consulted>
  - Informed: <parties informed>

## Context
<The forces at play: the problem, constraints, and what makes this decision
necessary now. State any product facts with a trace to ../PRODUCT_TRUTH.md.>

## Decision
<The decision, in the active voice: "We will …". One decision per ADR.>

## Consequences
<What becomes easier and what becomes harder. Positive, negative, and neutral
outcomes. Include operational, cost, and truth-alignment consequences.>

## Alternatives considered
<Each option genuinely weighed, and why it was not chosen. Include "do nothing".>

## Links
- Supersedes: <ADR-NNNN | none>
- Superseded by: <ADR-NNNN | none>
- Related ADRs: <ADR-NNNN, …>
- References: <../PRODUCT_TRUTH.md#…, ../ROADMAP.md, ../KNOWN_LIMITATIONS.md, …>

## Change log
- YYYY-MM-DD — <editor> — <created | accepted | non-substantive edit | status change>
```

---

## 8. Authoring rules

- **One decision per ADR.** Split compound proposals.
- **Write for a future reader** who lacks today's context; capture the *why*.
- **Be honest about consequences** — a decision with only upsides was not analyzed.
- **Trace every product claim** to [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md).
  Absent/stubbed capabilities may appear **only** as a decision to defer to
  [`../ROADMAP.md`](../ROADMAP.md).
- **Name exactly one Accountable.** No shared accountability.
- **Never present a forbidden/absent capability as shipped.** No live ad launch,
  document Q&A, autonomous agents, external connectors, enforced RBAC, immutable
  audit, or cloud inference as present-tense product decisions.

---

## 9. ADR Index / decision log

The **Index** is the canonical register of every ADR. It lives at
`bizops/adr/README.md` and is updated on every status change. It is the first stop for
anyone asking "what has been decided, and is it still in force?"

**Index columns:** ID · Title · Status · Type · Date · Accountable · Supersedes ·
Superseded by.

| ID | Title | Status | Type | Date | Accountable | Supersedes | Superseded by |
|---|---|---|---|---|---|---|---|
| ADR-0001 | Adopt offline-first local AI; no cloud inference | Accepted | Type 1 | 2026-05-04 | Office of the CTO | — | — |
| ADR-0002 | Defer connector-hub external integrations to Roadmap | Accepted | Type 1 | 2026-05-18 | Office of the CTO / Product | — | — |

Conventions:
- Rows are appended in ID order and never removed.
- Status in the Index always matches the ADR file; the quarterly review (§6.4)
  reconciles any drift.
- Superseded rows keep their original data and gain a *Superseded by* link (§10).

---

## 10. Superseded & deprecated decisions

Supersession is how AdOS changes a past **Type 1** decision without erasing history.

**To supersede a decision:**
1. Author a **new** ADR (`ADR-MMMM`) that states the new decision and, in its
   **Context**, why the earlier decision no longer holds.
2. In the new ADR's **Links**, set `Supersedes: ADR-NNNN`.
3. In the **old** ADR (`ADR-NNNN`): change **Status** to **Superseded**, add
   `Superseded by: ADR-MMMM` to its Links, and add a Change-log line.
4. Update both rows in the Index (§9): the old row's *Superseded by* and the new
   row's *Supersedes*.

The link is always **bidirectional** — a Superseded ADR must point forward, and its
successor must point back. A reader arriving at either can reconstruct the full chain.

**Deprecation (no replacement):** when a decision's context simply dissolves and
nothing replaces it, set the ADR to **Deprecated**, add a Change-log line explaining
why it no longer applies, and update the Index. Deprecated ADRs have no *Superseded
by* link.

Neither Superseded nor Deprecated records are ever deleted (see Retention, §6.3).

---

## 11. Example ADRs

The two examples below are **illustrative** and are truthful against
[`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md).

### Example A

```markdown
# ADR-0001 — Adopt offline-first local AI; no cloud inference

- **ID:** ADR-0001
- **Status:** Accepted
- **Date:** 2026-05-04
- **Type:** Type 1 (irreversible — ADR required)
- **Deciders:**
  - Accountable: Office of the CTO
  - Responsible: Engineering (AI runtime)
  - Consulted: Product, Security, Legal
  - Informed: Sales, Marketing, Partners, Customer Success

## Context
AdOS is sold as a self-hosted platform that customers run on their own
infrastructure. Customers in our target segment require air-gap capability and
have no appetite for per-token cloud billing. The codebase already ships a
deterministic offline default and optional local engines
(../PRODUCT_TRUTH.md §1.5, §6.1); a cloud-inference config flag exists but is
never wired (../PRODUCT_TRUTH.md §4). We must decide the AI runtime posture for
AdOS v1.0.0.

## Decision
We will keep AdOS **100% local / offline-capable**: the default is the
deterministic OfflineAIManager (no model server), with optional locally-run
Ollama or OpenAI-compatible engines for genuine model prose. **No cloud endpoint
or API key is used anywhere.** The dormant cloud-inference flag stays unwired and
is treated as Roadmap-only, never as a shipped capability.

## Consequences
- Positive: air-gap deployments supported; no per-token or metered billing; no
  vendor telemetry or standing access; strong data-residency story.
- Negative: no out-of-the-box hosted convenience; genuine model prose requires the
  customer to run a local engine; heavier models need customer hardware.
- Truth alignment: matches ../PRODUCT_TRUTH.md §1.5 and §6.1 exactly.

## Alternatives considered
- Cloud / hosted inference — rejected: breaks self-hosting, air-gap, and the
  no-per-token commitment; remains a Roadmap-only flag.
- Hybrid (local default + optional cloud fallback) — rejected for v1.0.0: adds key
  management, egress, and telemetry surface inconsistent with our positioning.

## Links
- Supersedes: none
- Superseded by: none
- Related ADRs: ADR-0002
- References: ../PRODUCT_TRUTH.md §1.5, §4, §6.1; ../ROADMAP.md

## Change log
- 2026-05-02 — Engineering — created (Proposed)
- 2026-05-04 — Office of the CTO — Accepted
```

### Example B

```markdown
# ADR-0002 — Defer connector-hub external integrations to Roadmap

- **ID:** ADR-0002
- **Status:** Accepted
- **Date:** 2026-05-18
- **Type:** Type 1 (irreversible — ADR required)
- **Deciders:**
  - Accountable: Office of the CTO / Product
  - Responsible: Product
  - Consulted: Engineering, Sales, Partners
  - Informed: Marketing, Customer Success, Finance

## Context
GTM interest exists in connecting AdOS to external ad and CRM systems. In the
codebase, connector-hub is an unwired scaffold — event-name constants only, with
zero importers — and analytics metrics are hand-entered via a form, not ingested
(../PRODUCT_TRUTH.md §2.5, §4). We must decide whether external connectors are in
scope for AdOS v1.0.0.

## Decision
We will **not** ship external connectors in AdOS v1.0.0. connector-hub remains a
future placeholder, and any connector capability is positioned strictly as a
**Roadmap** item. All product, sales, and partner collateral must describe
analytics input as **hand-entered / customer-provided**, never as ingested or
auto-synced.

## Consequences
- Positive: keeps v1.0.0 truthful and shippable; no half-built integration surface;
  no implied live ad-platform access.
- Negative: no automated metric ingestion at launch; customers enter performance
  data manually; connector demand is a Roadmap commitment, not a current feature.
- Truth alignment: matches ../PRODUCT_TRUTH.md §2.5 and §4; recorded in
  ../KNOWN_LIMITATIONS.md.

## Alternatives considered
- Ship a minimal connector now — rejected: would misrepresent a stub as a shipped
  capability and violate product truth.
- Remove connector-hub entirely — rejected: retaining the scaffold preserves a clean
  Roadmap path without implying present availability.

## Links
- Supersedes: none
- Superseded by: none
- Related ADRs: ADR-0001
- References: ../PRODUCT_TRUTH.md §2.5, §4; ../ROADMAP.md; ../KNOWN_LIMITATIONS.md

## Change log
- 2026-05-15 — Product — created (Proposed)
- 2026-05-18 — Office of the CTO / Product — Accepted
```

---

## 12. Quick reference

| Question | Answer |
|---|---|
| ID format? | `ADR-NNNN`, monotonic, never reused |
| Statuses? | Proposed → Accepted → Superseded → Deprecated |
| When is an ADR mandatory? | Every **Type 1** (irreversible) decision |
| Who accepts? | Exactly one **Accountable** per RACI (§5) |
| How to change a past decision? | New ADR that **supersedes** it; link both ways |
| Are ADRs ever deleted? | No — retained permanently (§6.3) |
| Where is the log? | ADR Index at `bizops/adr/README.md` (§9) |
| Product-claim rule? | Must trace to `../PRODUCT_TRUTH.md`; absent capabilities are Roadmap-only |

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
