# Human Review, Revision, and Approval

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md`](../1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md).
>
> **Laws:** *No component executes outside the orchestration pipeline · orchestration is
> deterministic · every stage has one responsibility · the orchestrator never changes evidence ·
> the human gate is a first-class stage, not an exception · observable by design.*

---

## 1. What this document defines

This document defines the **human stages of the orchestration pipeline** — the three stages
where a person, not a model, holds the decision: **Human Review → {Approved | Revision}**. It is
the part of the pipeline that makes AdOS a system an agency principal can put their name against,
because at the moments that matter the machine stops and waits for a human to say *yes*, *no*, or
*change this*.

These three stages sit at the end of the canonical pipeline:

```
Mission → Planner → Memory → Generation → Scoring → Explanation → Human Review → Revision → Approve
                                                     └──────────── this document ────────────┘
```

Everything upstream produces a *candidate* — a brief, a creative set, a campaign draft, each
carrying its evidence and its rationale. Nothing upstream is authorised to act on the world. The
human stages are where a candidate becomes a *decision*. This document owns the law that governs
those stages, and it is honest about the one place where the shipped product breaks that law
today.

One sentence bounds the entire exercise, and it is stated here in full because it is the boundary
of everything that follows:

> **Orchestration coordinates intelligence; it does not create intelligence.**

The human stages invent nothing. They run no model, compute no score, write no rationale. They
**coordinate the human's decision** — presenting the candidate with its evidence, capturing the
verdict, and routing the pipeline accordingly. The intelligence was produced upstream by Books B,
C, D, and E. The judgement is supplied by the person. Review, Revision, and Approve are the
coordination between the two. They are the strongest human-sovereign guarantee in the platform,
and they add **no new intelligence** of their own.

---

## 2. The governing law — the human gate is a first-class stage

> **LAW — The Human Gate is a first-class stage, not an exception.** Human approval is a
> **normal** part of the pipeline. The flow is `Human Review → Approved | Revision`, and **both
> branches are normal flow** — not error handling, not an interrupt, not an exception path.
> Human intervention must never be modelled as an error.

This law is the difference between software that *assists* a person and software that *reports to*
one. In an assistive tool, the machine runs to completion and a human may optionally intervene —
intervention is an exception to the happy path. In AdOS the ordering is inverted: the machine
runs **up to** a human decision and then **stops**, by design, every time. The human is not an
exception handler bolted onto an autonomous system. The human is a **stage of the pipeline**,
with a fixed position, a defined input (a candidate plus its evidence and rationale), and two
defined outputs (approve, revise). The pipeline is *supposed* to pause here. Pausing here is
success, not failure.

Two consequences follow, and both are load-bearing:

1. **Approval is not the only first-class outcome.** "Send it back for changes" is not a fault
   the system fell into; it is one of the two ways the Review stage is meant to complete. A
   pipeline that can only *approve* or *fail* has modelled the human as a rubber stamp with an
   error case. A pipeline that can *approve* or *revise* has modelled the human as a decision
   maker. Book F requires the second.

2. **Human intervention is never an "exception".** No human decision — including *no* — may be
   represented in the system as a crash, an error, a thrown failure, or a terminal fault. The
   moment "the human said no" is encoded the same way as "the model returned malformed JSON," the
   product has told the human that their considered judgement is a *bug*. That is the exact
   inversion this law forbids.

The rest of this document measures the shipped product against this law: where it holds
(§3, Review and Approve), and the one place it is violated today (§4, reject-as-failure), with
the design that closes the gap (§5, the Revision branch).

---

## 3. Human Review and Approve — first-class today (✅ SHIPPED)

AdOS ships genuine, first-class human gates. This is not a roadmap aspiration — it is the
strongest human-sovereign guarantee in the platform, live in the web app today.

### 3.1 The gate mechanism

The Mission state machine (`domains/agency-os/src/mission/mission.ts:79`) makes the human gate a
formal state, not a UI convention. A mission moves `submitted → planning → awaiting_approval →
executing → completed`, and the `awaiting_approval` state is a real stop: the machine will not
advance itself out of it. Two transitions define the gate:

- **`requestApproval(gate)`** (`mission.ts:179`) — the pipeline *raises* a gate. Having produced
  a candidate, the orchestration puts the mission into `awaiting_approval` against a named gate
  and waits. It does not proceed. It cannot proceed. This is the pipeline **stopping on purpose**.
- **`approve(gate)`** (`mission.ts:188`) — a human *clears* a gate. This is the only transition
  that advances the mission past `awaiting_approval`, and it exists only to be driven by a human
  action.

There is no code path in which the system calls `approve()` on its own behalf. **AdOS never
auto-approves.** The advance transition is reachable only through a human action, which is what
makes the gate sovereign rather than decorative.

### 3.2 Three live gates, driven from the routes

The gates are wired live. The route dispatcher runs the manual, human-gated mission workflow, and
approval is a first-class action within it: the `approve` action resolves to `gateApprove`
(`apps/web/src/routes.ts:743`), which loads the mission and clears the pending gate. The pipeline
raises three named gates in order, one after each generative stage:

| Gate | Raised after | Citation |
| --- | --- | --- |
| `strategy_and_budget` | the brief is generated | `requestApproval('strategy_and_budget')` (`routes.ts:939-940`) |
| `creative_assets` | the creative set is generated | `requestApproval('creative_assets')` (`routes.ts:975`) |
| `campaign_launch` | the campaign is drafted | `requestApproval('campaign_launch')` (`routes.ts:1011`) |

The state machine's default gate set is `['strategy_and_budget','campaign_launch']`
(`mission.ts:110`); the live workflow uses all three, adding `creative_assets`. The effect is
that **nothing consequential happens without a human clearing a gate first**: no creative is
produced until strategy and budget are approved; no campaign is drafted until creative is
approved; nothing launches until launch is approved. Each generative step is fenced by a human
decision on both sides.

### 3.3 Review = await the human decision; Approve = advance (Law 3)

These two stages honour the *every stage has one responsibility* law precisely:

- **Human Review** does exactly one thing: it **awaits the human decision**. It presents the
  candidate that upstream stages produced, together with the evidence and rationale attached to
  it, and it holds the mission in `awaiting_approval`. It computes nothing. It decides nothing. It
  waits. Its whole job is to be the point at which the pipeline yields control to a person.
- **Approve** does exactly one thing: it **advances the mission**. `approve(gate)` (`mission.ts:188`)
  clears the named gate and permits the mission to move toward `startExecuting()`
  (`mission.ts:195`) and eventually `complete()` (`mission.ts:202`). It carries no judgement of
  its own — it records that a human's judgement was *yes* and lets the pipeline continue.

Neither stage borrows another stage's job. Review does not generate; Approve does not score. The
decision belongs entirely to the human, and the ordering — review before approve, approve before
execute — is fixed and deterministic. Same mission, same gate, same human verdict yields the same
transition every time.

The workflow itself remains **procedural**: the human clicks each step, and each route handler
reloads the mission and guards on its status before acting. No engine drives the sequence today —
Book F's broader design (the governed pipeline as the live engine) is the target state, addressed
in the sequencing and foundations documents. What matters here is narrower and already true:
**where the human gate exists, it is real, and it is first-class.**

### 3.4 A mission through the gates (walkthrough)

To make the "stop on purpose" character concrete, trace a mission through the shipped happy path.
Every arrow labelled *human* is a point where the pipeline has stopped and cannot move until a
person acts:

1. The mission is submitted and planned; the brief is generated. The pipeline raises the first
   gate — `requestApproval('strategy_and_budget')` (`routes.ts:939-940`) — and the mission enters
   `awaiting_approval`. **It stops.**
2. *human* — a principal reviews the brief with its evidence and clears the gate via `gateApprove`
   (`routes.ts:743`), which calls `approve(gate)` (`mission.ts:188`). Only now may the creative
   stage run.
3. The creative set is generated; the pipeline raises `requestApproval('creative_assets')`
   (`routes.ts:975`). **It stops.**
4. *human* — the creative is reviewed and the gate cleared. Only now may the campaign be drafted.
5. The campaign is drafted; the pipeline raises `requestApproval('campaign_launch')`
   (`routes.ts:1011`). **It stops.**
6. *human* — launch is reviewed and the gate cleared. Only now does the mission move through
   `startExecuting()` (`mission.ts:195`) toward `complete()` (`mission.ts:202`).

Three deliberate stops, three human clearances, before anything reaches the world. At no point
does the machine advance itself past a gate. The pauses are not latency or waiting on a job — they
are the pipeline handing control to a person by design, which is exactly what a first-class human
gate is.

---

## 4. The honest violation — reject is destructive today (✅ SHIPPED, but wrong)

Here the shipped product breaks the governing law, and Book F says so plainly.

The Review stage today has two exits, but only one of them is modelled as normal flow. Approve is
first-class (§3). **Reject is not — reject is destructive.**

When a human declines a gate, the `reject` action resolves to `gateReject`
(`apps/web/src/routes.ts:885`), which calls `missions.fail()`. The `cancel` action does the same:
`cancelMission` also routes to `missions.fail()`. Both destructive calls land at `routes.ts:886`
and `routes.ts:893`, and both invoke the state machine's terminal transition:

- **`fail(reason)`** (`mission.ts:209`) sets the mission's status to `failed`. This state is
  **terminal**. There is no reopen transition, no retry transition, no path back to
  `awaiting_approval` or to any earlier stage. Once a mission is `failed`, it is over. Any attempt
  to act on it afterward hits the invalid-transition guard (`mission.ts:218`).

The problem is not that `fail()` exists — a mission genuinely *can* fail (a model that never
returns valid output, an unrecoverable error). The problem is **what gets routed into it**. Today,
"the human reviewed this candidate and wants changes" is encoded with the identical mechanism as
"this mission is dead." Human rejection is modelled as a **terminal failure**.

Two distinct human intents collapse into that one terminal transition, and only one of them
belongs there:

- **Cancel** — "abandon this mission entirely." Routing cancel to `fail()` is defensible: the
  human genuinely wants the mission ended. `cancelMission` (`routes.ts:893`) reaching `fail()` is
  a reasonable, if bluntly named, encoding of an intentional stop.
- **Reject at a gate** — "not this candidate; change it." Routing *this* to `fail()`
  (`gateReject`, `routes.ts:885`, at `routes.ts:886`) is the violation. The human did not ask to
  end the mission. They asked to steer it. The system ends it anyway.

The terminal `failed` state has no way back — `mission.ts:218` guards every subsequent transition
as invalid — so the two intents become indistinguishable after the fact and equally irreversible.
A reviewer who merely wanted a warmer headline has, from the state machine's point of view, done
the same thing as a reviewer who killed the project.

That is precisely the inversion §2 forbids. It represents a considered human decision — one of the
two *normal* outcomes of Review — as an exception, an error, an end state. It tells the human that
saying "no, revise this" is the same category of event as the system crashing. It throws away the
mission and all its accumulated work at the exact moment the human is trying to *steer* it. A
human who wants a different headline should not have to destroy the mission and start over from a
blank brief to get one.

**This violates the law that the human gate is a first-class stage, not an exception.** It is
tagged ✅ SHIPPED because the destructive behaviour is genuinely live — but "shipped" here marks a
defect against the constitution, not a feature. Book F is honest about it rather than papering
over it.

The fix is not to make `fail()` less terminal, and it is not to redesign how a human's revision
request is turned into new creative — that intelligence already lives in other books. The fix is
to stop routing rejection into `fail()` at all, and to route it instead into a **normal Revision
branch** that returns the pipeline to an earlier stage under human control. The revision
capability that branch calls is Book B's non-destructive revision — see
[`../../book-b/4-optimization/REVISION_ENGINE.md`](../../book-b/4-optimization/REVISION_ENGINE.md)
— gated by the same human-sovereign approval discipline described in Book A's approval engine, see
[`../../book-a/APPROVAL_ENGINE.md`](../../book-a/APPROVAL_ENGINE.md). Book F does not redesign
either; it **orchestrates** them into the pipeline. The next section defines that branch.

---

## 5. The Revision stage — the first-class "needs changes" branch (❌ ROADMAP)

Revision is the second normal exit from Human Review. When a human's verdict is "not this — change
it," the pipeline must **loop back**, carrying the human's direction, to an earlier stage that can
act on it — Generation to re-draft, or Scoring to re-evaluate. This is not error handling. It is
the pipeline doing exactly what a first-class human gate is supposed to do: **let the human steer
without destroying the work.**

Today this branch does not exist as first-class flow. Its place in the pipeline is named and
fixed, but the occupant is a roadmap contract: today, "reject" collapses into `fail()` (§4). The
Revision stage is therefore tagged **❌ ROADMAP** — there is no shipped code path that returns a
mission from `awaiting_approval` to Generation or Scoring under human direction. What follows is
the design that the pipeline requires, not a description of running code.

### 5.1 The contract of the Revision stage (Law 3)

The Revision stage has exactly **one responsibility**: **route the pipeline back to an earlier
stage, carrying the human's direction.** It does not generate the new candidate — Generation does
that. It does not re-score — Scoring does that. It does not decide *what* to change — the human
does that. Revision is pure coordination: it takes the human's instruction and the current
candidate, and it re-enters the pipeline at the correct upstream stage with both attached.

Concretely, the design replaces the destructive reject with a non-terminal transition. Instead of
`awaiting_approval → failed`, a "needs changes" verdict moves the mission back toward an earlier
generative stage — the mission is not ended, its history is preserved, and it re-enters the loop
`Generation → Scoring → Explanation → Human Review` with the human's note as new context.
Non-destructive revision — preserving the prior candidate and its provenance rather than deleting
them — is Book B's discipline
([`../../book-b/4-optimization/REVISION_ENGINE.md`](../../book-b/4-optimization/REVISION_ENGINE.md));
the Revision stage's job is only to *invoke* it at the right point in the sequence.

### 5.2 The human decides — Revision is direction, not rewrite

A critical boundary governs this branch: **the human supplies direction; the human does not have
the pipeline rewrite for them.** When a reviewer sends a candidate back, they are stating a
*direction* ("warmer tone," "lead with the offer," "drop the third variant") — they are not
handing authorship to the machine and they are not being handed a finished rewrite to accept
blindly. The Revision stage carries the direction to Generation, Generation produces a new
candidate under that direction, and the new candidate returns to Human Review to be judged again.
The human stays in the loop at every turn.

This is the same principle Book E draws for creative optimisation — a suggestion is not a rewrite,
and the human decides — see
[`../../book-e/3-optimization-suggestions/SUGGESTION_NOT_REWRITE.md`](../../book-e/3-optimization-suggestions/SUGGESTION_NOT_REWRITE.md).
Book F applies that principle at the orchestration layer: the pipeline never treats "needs
changes" as authority to act autonomously. It treats it as a **human instruction to re-run an
earlier stage**, and the result of that re-run comes back to the same human gate. Revision is a
loop the human commands, not an automation the human triggers.

### 5.3 Why Revision must be normal flow, not an exception

Modelling Revision as a first-class branch rather than a failure changes the character of the
whole system:

- **The mission survives.** Work accumulated across Planner, Memory, Generation, Scoring, and
  Explanation is not thrown away when the human wants a change. Only the candidate is re-drafted;
  the mission and its evidence trail continue.
- **The human's "no" is legible.** A revision request records *what* the human wanted changed and
  *why*, as pipeline history — not as a crash reason. This is the human-decision signal that the
  observability law (Book F's Law 6) expects a run to carry.
- **The loop is bounded and deterministic.** Each pass through
  `Generation → Scoring → Explanation → Human Review` is the same fixed sequence; the only thing
  that changes between passes is the human's direction. There is no self-selected alternate path
  and no autonomous escape from the gate.

Until this branch is built and wired, the honest status stands: reject is destructive, and the law
is violated. The Revision stage is the design that makes `Human Review → {Approved | Revision}`
true in fact rather than only on paper.

---

## 6. Human-sovereign boundaries

The human stages are where AdOS's human-sovereignty guarantee is most concrete. The boundaries
that hold across the whole platform hold here in their strongest form:

- **The system never auto-approves.** The advance transition `approve(gate)` (`mission.ts:188`) is
  reachable only through a human action. No timer, no confidence threshold, no model verdict can
  clear a gate. Silence is not consent; an un-cleared gate holds the mission forever rather than
  advancing on its own.
- **The human gate is first-class, never an interrupt.** Both outcomes of Review — approve and
  revise — are normal flow. Neither is an exception the system recovers from.
- **The decision belongs to the person, the coordination to the pipeline.** The stages present the
  candidate, its evidence, and its rationale; the human weighs them; the pipeline records and
  routes the verdict. AdOS supplies the material for the decision and executes its consequences —
  it does not make the decision.
- **100% local, copy-only, no external dependency.** The gate mechanism is a local state machine.
  No approval leaves the machine, no decision is sent to a vendor, no telemetry reports what a
  human approved or rejected. There is no cloud approval service, no external workflow connector,
  no API in the path. The human's judgement stays on the human's machine.

These boundaries are not features layered on top of the pipeline; they *are* the pipeline's
contract at its human stages. Removing any of them would turn a human-sovereign operating system
back into an autonomous tool that occasionally asks permission.

---

## 7. No new intelligence

Review, Revision, and Approve create no intelligence. This is worth stating precisely because it
is easy to mistake "the stage where decisions happen" for "the stage that is smart." It is the
opposite:

- **Review** runs no model. It presents what upstream produced and awaits a human.
- **Approve** runs no model. It records a *yes* and advances a state machine.
- **Revision** runs no model. It routes a human's direction to an earlier stage and lets that
  stage — Book B's generation — do the work.

Every ounce of intelligence these stages coordinate was produced elsewhere: the candidate by Book
B, its evidence by Book D, its score by Book E, its rationale by Book C. The judgement is the
human's. The human stages are the **coordination** between produced intelligence and human
judgement, and coordination is all they are.

> **Orchestration coordinates intelligence; it does not create intelligence.**

This is why the honest violation in §4 is an *orchestration* defect, not an intelligence defect.
Nothing is wrong with how AdOS generates or scores a candidate when a human rejects it. What is
wrong is how the pipeline *routes* the rejection — it sequences a normal decision into a terminal
failure. Fixing it is a matter of routing and sequencing (§5), the orchestrator's own job, and
touches no model.

---

## 8. Value contribution

A first-class human gate is where an agency's trust in AdOS is won or lost, and it maps directly
to both value levers.

**It reduces production time and rework.** The destructive-reject behaviour (§4) is pure waste:
every time a principal wants a change, the current design forces the mission to be failed and
rebuilt from a blank brief, discarding the strategy, evidence, and prior drafts that were already
correct. A first-class Revision branch (§5) turns "change this headline" from a full restart into
a single bounded loop back through Generation — the ninety percent of the work that was already
right is kept. Across a book of missions, that is the difference between revision costing minutes
and revision costing a re-do.

**It grows revenue by making AdOS trustworthy at enterprise scale.** An agency will only put its
name — and its clients' budgets — behind a system whose consequential actions are fenced by human
approval that the system cannot bypass. The three live gates (§3) mean no strategy, no creative,
and no launch happens without a named human clearing it, and the never-auto-approve guarantee (§6)
means that fence cannot be quietly removed. That is what makes AdOS an operating system an agency
can *govern* rather than merely *use* — and a governable system is one an agency can safely scale
its client base on.

A single, deterministic, human-gated pipeline — where the human gate is first-class in both of its
outcomes — turns six disconnected capabilities into one manageable process a business can stand
behind.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
