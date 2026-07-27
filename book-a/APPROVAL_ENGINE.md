# A007 — Approval Engine

> **Owner:** Office of the Chief Product Architect
> **Status:** Official — aligned to `PRODUCT_TRUTH.md`
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** `../PRODUCT_TRUTH.md`

---

## 1. Purpose & scope

This document is the definitive description of **how approvals actually work in AdOS**.
AdOS is an offline-first, 100% local-AI advertising-agency platform ("Agency OS"): a
client states an advertising objective as a Mission in natural language, and AdOS runs
it through a **human-gated pipeline** — marketing brief → creative (ad copy) → campaign
**draft** → performance report → executive dashboard. Every stage that produces
client-facing or budget-bearing work stops for an explicit human approval click. That
gating discipline is the subject of this document.

There are exactly **two real approval mechanisms** in the code, and this document models
approvals on both — nothing more. Where the requested feature set asks for something the
code does not implement (distinct Legal/Brand/Client approval **types**, escalation
chains, tiered approval authority, an immutable/tamper-evident audit trail), it is
presented under a clearly labelled **Roadmap** heading and **never** as shipped.

This doc conforms to the charter in `BOOK_A_AGENCY_CONSTITUTION.md` (A001) and shares its
terminology, state machines, and entity map. Related lifecycles:
`CAMPAIGN_LIFECYCLE.md` (A004), `CREATIVE_WORKFLOW.md` (A006), `AGENCY_REPORTING.md`
(A008).

### 1.1 The two real mechanisms at a glance

| # | Mechanism | Source | What it governs | Nature |
|---|---|---|---|---|
| 1 | **Approval aggregate** | `domains/agency-os/src/approval/approval.ts` | A first-class, standalone review request with its own explicit state machine and append-only timeline | Generic — any item can be routed through it |
| 2 | **Mission approval gates** | `domains/agency-os/src/mission/mission.ts`, `apps/web/src/routes.ts` | The pipeline stops (`strategy_and_budget`, `creative_assets`, `campaign_launch`) that gate a Mission's progression | Advisory gate metadata + a single `approve()` transition |

> **Critical honesty rule, stated up front:** these two mechanisms are **not** a tiered
> authority hierarchy. There is **no T0–T4 model**, no per-role spend ceiling, and no
> branching logic keyed on who approves. Any document, deck, or diagram implying tiered
> approval authority is describing a Roadmap idea, not the product. See §4.3 and §7.

---

## 2. Mechanism 1 — the Approval aggregate (REAL)

The `Approval` aggregate (`domains/agency-os/src/approval/approval.ts`) is a
DDD `AggregateRoot` with a strongly-typed `ApprovalId`, private props, factory methods
returning `Result<T, ValidationError>`, a `restore()` rehydrator, a `snapshot()`, and
domain events on every transition. It is **separate from** the Mission gates — a Mission
does not create an `Approval` to advance; this aggregate is a general-purpose review
record.

### 2.1 Fields

| Field | Type | Notes |
|---|---|---|
| `tenantId` | `string` | Required; enforces application-level tenant isolation |
| `title` | `string` | Required, trimmed |
| `description` | `string` | Optional on input; defaults to `''` |
| `requestedBy` | `string` | Required; also recorded as the actor of the `created` timeline entry |
| `projectId` | `string?` | Optional link to a `Project` |
| `status` | `ApprovalStatus` | See §2.2 |
| `timeline` | `ApprovalTimelineEntry[]` | **Append-only** history of transitions — see §2.4 |

Each `ApprovalTimelineEntry` has the exact shape
`{ action, from, to, note, actor, at }`
(`domains/agency-os/src/approval/approval.ts`), where `from`/`to` are `ApprovalStatus`
values (`from` may be the sentinel `'none'` for the creation entry).

### 2.2 State machine

`ApprovalStatus` is exactly:
`draft` · `in_review` · `approved` · `rejected` · `revision_requested`.

| Transition | Method | From | To | Guard |
|---|---|---|---|---|
| Submit for review | `submit()` | `draft` **or** `revision_requested` | `in_review` | Rejected from any other status |
| Approve | `approve()` | `in_review` | `approved` | Only from `in_review` |
| Reject | `reject()` | `in_review` | `rejected` | Only from `in_review` |
| Request revision | `requestRevision()` | `in_review` | `revision_requested` | Only from `in_review` |

```
                 submit()
   draft ───────────────────────────►┐
                                      │
   revision_requested ───────────────┤──► in_review ──approve()──────► approved
        ▲          submit()           │        │
        │                             │        ├──reject()───────────► rejected
        └───────requestRevision()─────┘        │
                                               └──requestRevision()──► revision_requested
```

`approved`, `rejected` are terminal. `revision_requested` is a **loop-back** state: a
revised item can be re-submitted (`submit()`) back into `in_review`, which is what makes
the revision cycle possible (§5.3). Every transition validates a non-empty `actor`
before it is applied.

### 2.3 Transitions and the events they emit

Every successful transition appends one timeline entry **and** emits exactly one domain
event (`domains/agency-os/src/approval/approval.ts`):

| Action | Timeline `action` | Domain event class | Event name |
|---|---|---|---|
| Create | `created` | `ApprovalCreated` | `approval.created.v1` |
| Submit | `submitted` | `ApprovalSubmitted` | `approval.submitted.v1` |
| Approve | `approved` | `ApprovalApproved` | `approval.approved.v1` |
| Reject | `rejected` | `ApprovalRejected` | `approval.rejected.v1` |
| Request revision | `revision_requested` | `ApprovalRevisionRequested` | `approval.revision_requested.v1` |

Each event carries `{ from, to, note }` (the `created` event carries
`{ title, requestedBy, tenantId, projectId? }`) and tenant metadata, so other contexts
can react without reaching into the aggregate. The route
`apps/web/src/routes.ts` drives these transitions (e.g. `app.approvals.approve(...)`).

### 2.4 The append-only timeline (REAL)

The `timeline` array is genuinely **append-only within the aggregate**: the private
`transition()` method builds a new entry and returns
`timeline: [...this.props.timeline, entry]` — it never mutates or removes prior entries,
and `snapshot()` deep-copies each entry. This is the real, in-memory history record for
an approval, and it is honest and complete **for what it is**.

> **What it is NOT:** the append-only timeline is an in-memory (or, when persistence is
> enabled, per-aggregate stored) list. It is **not** a tamper-evident, cryptographically
> chained, system-wide immutable audit log. AdOS ships no such store (see §5.6 and §7,
> and `../PRODUCT_TRUTH.md` §2.7). Do not describe the timeline as an "immutable audit
> trail."

### 2.5 Worked example — a revision cycle on the `Approval` aggregate

The following illustrates the exact `timeline[]` an `Approval` accumulates across a
create → submit → request-revision → resubmit → approve cycle. Every row is one appended
entry; none is ever mutated or removed.

| # | `action` | `from` | `to` | `actor` | Event emitted |
|---|---|---|---|---|---|
| 1 | `created` | `none` | `draft` | `requestedBy` | `approval.created.v1` |
| 2 | `submitted` | `draft` | `in_review` | reviewer requester | `approval.submitted.v1` |
| 3 | `revision_requested` | `in_review` | `revision_requested` | approver | `approval.revision_requested.v1` |
| 4 | `submitted` | `revision_requested` | `in_review` | requester | `approval.submitted.v1` |
| 5 | `approved` | `in_review` | `approved` | approver | `approval.approved.v1` |

After row 5 the approval is terminal (`approved`); a further `approve()`/`reject()`/
`requestRevision()` would be rejected by the status guards (§2.2), each producing a
`ValidationError` of the form `Cannot <action> an approval that is "approved"`.

---

## 3. Mechanism 2 — Mission approval gates (REAL, with an honest discrepancy)

The second mechanism is the set of **approval gates** on a Mission
(`domains/agency-os/src/mission/mission.ts`). These are what stop the pipeline for a
human click between phases.

### 3.1 The gate union

The contract union `MissionApprovalGate` (`packages/contracts/src/mission.ts`) has
**five** values, of which the wired pipeline uses **three**:

| Gate | Status | Used at | Evidence |
|---|---|---|---|
| `strategy_and_budget` | **Active** | Brief phase (Phase 2) | `apps/web/src/routes.ts` |
| `creative_assets` | **Active** | Creative phase (Phase 3) | `apps/web/src/routes.ts` |
| `campaign_launch` | **Active** | Campaign draft phase (Phase 4) | `apps/web/src/routes.ts` |
| `major_budget_change` | **Reserved / unused** | — (never referenced by the pipeline) | `packages/contracts/src/mission.ts` |
| `contract_or_spend` | **Reserved / unused** | — (never referenced by the pipeline) | `packages/contracts/src/mission.ts` |

`major_budget_change` and `contract_or_spend` exist in the type only; nothing calls
them. They are **Roadmap** (§7).

### 3.2 The Mission state machine around approval

Approval interacts with the Mission lifecycle
(`domains/agency-os/src/mission/mission.ts`) as follows:

| Method | From | To | Event |
|---|---|---|---|
| `requestApproval(gate)` | `planning` \| `executing` | `awaiting_approval` | `MissionApprovalRequested { gate }` |
| `approve(gate)` | `awaiting_approval` | `planning` | `MissionApproved { gate }` |

The key behavioural fact: **`approve(gate)` returns the mission to `planning`** — it does
**not** jump the mission forward to the next phase. The next phase's generator (brief →
creative → campaign) is what advances the work; approval merely unblocks it. (`paused`
is declared in `MissionStatus` but is never entered — dormant/reserved.)

### 3.3 The honest discrepancy — gates are advisory metadata

Three facts must be stated plainly, because they contradict how "approval gates" are
often imagined:

1. **The `approvalGates[]` array is advisory, not authoritative.** A Mission's default
   `approvalGates` is only `['strategy_and_budget', 'campaign_launch']`
   (`domains/agency-os/src/mission/mission.ts`), yet the pipeline **always** runs the
   `creative_assets` gate too. The route handlers call `requestApproval(gate)`
   **unconditionally** per phase; they do not consult the array to decide whether to
   gate. So the array is informational metadata about intent, not branch logic.

2. **`gateApprove` maps EVERY gate to the same transition.** In `apps/web/src/routes.ts`
   the single helper `gateApprove(app, session, res, id, gate)` calls
   `app.missions.approve(MissionId.of(id), gate)` for all three gates. The gate string is
   passed through to the `MissionApproved { gate }` event for traceability, but it does
   **not** select different logic, different approvers, or different limits. All three
   phase approvals are the same `mission.approve()` transition with a different label.

3. **There is NO tiered approval authority.** There is no T0–T4 model, no per-tier spend
   ceiling, no role-gated approval, and no enforced RBAC anywhere in the approval path
   (`../PRODUCT_TRUTH.md` §2.6, §6.2). Any actor who can reach the route can approve. Do
   not document, diagram, or imply tiered authority.

| Phase | Route action | Gate requested | Approval call |
|---|---|---|---|
| 2 · Brief | `approve` | `strategy_and_budget` | `gateApprove(...)` → `missions.approve()` |
| 3 · Creative | `creative/approve` | `creative_assets` | `gateApprove(...)` → `missions.approve()` |
| 4 · Campaign | `campaign/approve` | `campaign_launch` | `gateApprove(...)` → `missions.approve()` |

> Note that "campaign_launch" is a **gate label**, not an ad launch. AdOS produces a
> campaign **draft** and never launches live ads (`../PRODUCT_TRUTH.md` §2.4). The
> `campaign_launch` gate approves the *draft*, not any real ad delivery.

### 3.4 Worked example — one Mission gate

Tracing the `creative_assets` gate end to end shows how thin and label-driven the gate
path is:

| Step | Actor | Call | Mission status after |
|---|---|---|---|
| 1 | Pipeline (creative phase) | `requestApproval('creative_assets')` | `awaiting_approval` |
| 2 | — | emits `MissionApprovalRequested { gate: 'creative_assets' }` | `awaiting_approval` |
| 3 | Human (route click) | `gateApprove(..., 'creative_assets')` → `mission.approve('creative_assets')` | `planning` |
| 4 | — | emits `MissionApproved { gate: 'creative_assets' }` | `planning` |
| 5 | Pipeline (campaign phase) | next generator runs; eventually `requestApproval('campaign_launch')` | `awaiting_approval` |

Swap `creative_assets` for `strategy_and_budget` or `campaign_launch` and the steps are
**identical** — same methods, same transitions, only the label in the event payload
differs (§3.3). This is the concrete meaning of "gates are advisory metadata, not branch
logic."

---

## 4. Approval categories — requested sections

The requested taxonomy (Creative / Legal / Brand / Client approval) maps onto the two
real mechanisms as follows. Only **Creative approval** exists as a distinct coded
mechanism; the others are **proposed category labels** over the same generic `Approval`
aggregate.

### 4.1 Creative approval — REAL

**Creative approval is real** and corresponds exactly to the `creative_assets` Mission
gate (§3, Phase 3). When the `CreativeSet` (six copy outputs — headline, adCopy, cta,
socialPost, landingPage, email; copy only, no images) is generated, the pipeline calls
`requestApproval('creative_assets')`, moving the Mission to `awaiting_approval`. A human
click routes to `gateApprove(..., 'creative_assets')` → `mission.approve('creative_assets')`,
returning the Mission to `planning` so the campaign phase can proceed. See
`CREATIVE_WORKFLOW.md` (A006) for the creative lifecycle this gate closes.

### 4.2 Legal / Brand / Client approval — ⚠️ ROADMAP (as distinct types)

**Today these are not distinct approval types.** There is a single generic `Approval`
aggregate (§2). One could route a legal, brand, or client sign-off **through that same
mechanism** by putting a category word in the `title`/`description` — but the code has
**no** `category`/`type` field on `Approval`, no per-category routing, no per-category
approver rules, and no distinct state machines. Presenting Legal, Brand, and Client
approval as separate first-class types is therefore a **proposed categorization**, not a
shipped feature.

| Requested type | Today (REAL) | Proposed (ROADMAP) |
|---|---|---|
| **Creative approval** | The `creative_assets` Mission gate | (already real) |
| **Legal approval** | Generic `Approval` used with a "legal" label in free text | A distinct approval category with its own routing/reviewers |
| **Brand approval** | Generic `Approval` used with a "brand" label; note `Brand.rules.bannedWords` is **stored but not enforced** against generated copy | A distinct category that enforces brand rules (incl. bannedWords) at approval time |
| **Client approval** | Generic `Approval` used with a "client" label | A distinct client-facing sign-off category |

> The bannedWords non-enforcement is a real, documented gap (`../PRODUCT_TRUTH.md`,
> `../KNOWN_LIMITATIONS.md`; see `BRAND_DOMAIN.md` A003). A brand-approval type that
> actually blocks banned terms is Roadmap.

### 4.3 No tiered authority — restated

None of these categories, real or proposed, carry approval **authority tiers**. There is
no T0–T4 hierarchy and no enforced role check. This is restated here so the category
table in §4.2 is not misread as an authority ladder. (`../PRODUCT_TRUTH.md` §6.2.)

---

## 5. Revision · Escalation · History · Audit

### 5.1 Summary

| Concept | Status | Backed by |
|---|---|---|
| Revision | **REAL** | `revision_requested` state + `requestRevision()` / re-`submit()` loop |
| Escalation | ⚠️ **ROADMAP** | No escalation logic exists in code |
| History | **REAL** | The append-only `timeline[]` on `Approval` |
| Audit (per-approval timeline) | **REAL** | The append-only `timeline[]` (in-memory / per-aggregate) |
| Audit (immutable, tamper-evident, system-wide) | ⚠️ **ROADMAP** | No such store ships |

### 5.2 Revision — REAL

Revision is a fully coded transition. From `in_review`, `requestRevision(input)` moves
the approval to `revision_requested`, appends a `revision_requested` timeline entry, and
emits `ApprovalRevisionRequested`. The item can then be revised and re-submitted:
`submit()` accepts `revision_requested` as a valid `from` state and returns it to
`in_review`. This is the real revision loop.

At the pipeline level, "revision" of creative work is achieved by **re-generating** the
`CreativeSet` and passing back through the `creative_assets` gate (see A006) — there is
no in-place edit-and-diff of an artifact; regeneration is the mechanism.

### 5.3 Escalation — ⚠️ ROADMAP

**No escalation logic exists.** There is no timeout, no auto-reassignment, no
"escalate to a higher approver," and — consistent with §3.3 and §4.3 — no higher tier to
escalate *to*. An approval that sits in `in_review` stays there until a human acts.
Escalation (SLA timers, reassignment, notification chains) is **Roadmap**.

### 5.4 History — REAL

History is the append-only `timeline[]` on each `Approval` (§2.4): every transition since
`created` is retained in order, with `action`, `from`, `to`, `note`, `actor`, and `at`.
This is a real, queryable per-approval history and is safe to describe as such.

For Mission-gate approvals, the equivalent "history" is the sequence of emitted domain
events (`MissionApprovalRequested`, `MissionApproved`, …) on the event bus, plus the
Mission's own status trail.

### 5.5 Audit — the important distinction

There are two very different things, and only the first is real:

- **REAL — per-approval timeline.** The `Approval.timeline[]` is a genuine append-only
  record within the aggregate boundary. Within a running process (or the aggregate's
  stored snapshot when persistence is enabled) it is not rewritten in the normal flow.

- **ROADMAP — a true immutable / tamper-evident audit trail.** AdOS has **no**
  append-only, tamper-evident, cross-cutting audit store. The platform's audit hooks are
  logger wrappers and the web activity feed is a bounded in-memory ring of 50 entries
  (`../PRODUCT_TRUTH.md` §2.7). The timeline lives in the same store as the aggregate; it
  offers no cryptographic chaining and no independent immutability guarantee. Calling it
  an "immutable audit trail" would be false.

> **State it plainly:** AdOS today provides approval **history** (real) but not an
> **immutable audit trail** (Roadmap).

### 5.6 Audit distinction table

| Property | Approval `timeline[]` (REAL) | Immutable audit trail (ROADMAP) |
|---|---|---|
| Append-only in normal flow | Yes | Yes (by definition) |
| Independent, tamper-evident store | No — same store as the aggregate | Yes |
| Cryptographic chaining / hashing | No | Yes |
| System-wide (all entities) | No — per `Approval` only | Yes |
| Ships today | **Yes** | **No** |

---

## 6. Value contribution

Structured approvals serve **both** AdOS value levers — they **reduce production time**
and **protect revenue** — which is why the approval engine earns its place in the
platform.

- **Production time ↓.** A single, explicit approval state per phase (`in_review` →
  `approved`) removes the ambiguity of "is this signed off?" that stalls agency work.
  The `revision_requested` loop turns rework into a first-class, resumable transition
  instead of an out-of-band email thread, and the append-only timeline means no one
  re-litigates a decision that was already made — every phase gate has a recorded actor
  and note. Faster, unambiguous sign-off shortens brief → creative → campaign turnaround.
- **Revenue ↑ / risk ↓.** Gating creative and campaign work behind a human click protects
  brand and legal risk *before* copy or a campaign draft goes out — mistakes that, once
  client-facing, cost real revenue (lost accounts, remediation, brand damage). The
  `creative_assets` and `campaign_launch` gates are where an agency catches an off-brand
  headline or an unapproved budget assumption while it is still cheap to fix.

Net: the approval engine converts sign-off from a source of delay and risk into a
recorded, resumable, low-latency step — directly serving production-time reduction and
revenue protection.

---

## 7. Roadmap labels (dedicated section)

Everything in this section is **Roadmap / proposed** — **not** shipped. Nothing here may
be described as a present-tense capability.

| # | Roadmap item | Why it is Roadmap | Reference |
|---|---|---|---|
| R1 | **Tiered approval authority (T0–T4)** | No tier model, spend ceiling, or role-gated approval exists; every gate maps to one `approve()` | `../PRODUCT_TRUTH.md` §6.2 |
| R2 | **Distinct Legal / Brand / Client approval types** | `Approval` has no `category`/`type` field or per-category routing; today they are one generic mechanism with a label | §4.2 |
| R3 | **Brand-rule enforcement at approval** (e.g. bannedWords) | `Brand.rules.bannedWords` is stored but never enforced against generated copy | `../KNOWN_LIMITATIONS.md`; A003 |
| R4 | **Escalation** (SLA timers, reassignment, notification chains) | No timeout/reassignment/escalation logic in code | §5.3 |
| R5 | **Immutable / tamper-evident audit trail** | No append-only, chained, system-wide audit store; only per-aggregate timeline + logger lines + a 50-entry ring | §5.5; `../PRODUCT_TRUTH.md` §2.7 |
| R6 | **Reserved gates `major_budget_change`, `contract_or_spend`** | Present in the `MissionApprovalGate` union but referenced by nothing | §3.1 |
| R7 | **Enforced RBAC on approval actions** | Roles are defined but never enforced; the approval path performs no authorization | `../PRODUCT_TRUTH.md` §2.6 |
| R8 | **Durable, cross-context approval store** | Approval history is in-memory by default; SQLite/Postgres is opt-in and still per-aggregate | `../PRODUCT_TRUTH.md` §2.10; `../ARCHITECTURE.md` |

---

## 8. Cross-references

- `BOOK_A_AGENCY_CONSTITUTION.md` (A001) — governing charter: full state machines,
  entity-relationship map, terminology.
- `CAMPAIGN_LIFECYCLE.md` (A004) — where the three gates sit in the campaign pipeline.
- `CREATIVE_WORKFLOW.md` (A006) — the creative lifecycle the `creative_assets` gate closes.
- `AGENCY_REPORTING.md` (A008) — how approved outputs surface in reporting.
- `../PRODUCT_TRUTH.md` — single source of truth (audit of code).
- `../ROADMAP.md`, `../KNOWN_LIMITATIONS.md`, `../ARCHITECTURE.md` — Roadmap and gaps.

Evidence source paths cited in this document:
`domains/agency-os/src/approval/approval.ts`,
`domains/agency-os/src/mission/mission.ts`,
`packages/contracts/src/mission.ts`,
`apps/web/src/routes.ts`.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
