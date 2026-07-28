# Mission and Planning

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

This document covers the **first two stages** of the orchestration pipeline: **Mission** — the
entry point that holds one unit of work and its lifecycle — and **Planner** — the stage that
decides, once, the ordered sequence of steps that unit of work will travel. They are the front
door and the itinerary. Everything downstream (Memory, Generation, Scoring, Explanation, Human
Review, Revision, Approve) is what the plan sequences; nothing runs until a mission exists and a
plan orders its steps.

The two stages sit at very different tiers, and this document is honest about the gap from the
first line:

- **Mission is ✅ SHIPPED.** It is a real state machine that already ships in the live app. It is
  the backbone that sequences today's workflow — the one piece of true orchestration AdOS
  already runs.
- **Planner is ❌ ROADMAP.** There is no planner in the running system. A contract exists, but it
  is never wired. Today the *human* is the planner: a person clicks each step, and the ordering
  lives procedurally in route handlers and in the mission state machine's own guards.

One sentence bounds the whole exercise, and it is stated in full here because these two stages are
where the temptation to break it is greatest — a "planner" is exactly the kind of component that,
built wrong, would start *deciding* rather than *ordering*:

> **Orchestration coordinates intelligence; it does not create intelligence.**

Mission holds work and state. Planner orders steps. **Neither generates, scores, explains, nor
decides.** Both are Book A workflow, sequenced by Book F. This document draws each stage's single
responsibility, cites exactly what is built, and specifies — with unusual emphasis — that a
planner in AdOS is **deterministic step-ordering, not an autonomous agent that improvises.**

---

## 2. The Mission stage (✅ SHIPPED)

### 2.1 What a mission is

A **mission** is the orchestration's unit of work. It is one managed job — one advertising
outcome the agency is pursuing — with a stable identity and a lifecycle. Everything the pipeline
does, it does *to* a mission: the plan orders a mission's steps, Memory reads context for a
mission, Generation drafts a mission's artifacts, the human gates a mission's outcome. If the
pipeline is a production line, the mission is the item on the belt.

The mission is a real, shipped state machine — `Mission` at
`domains/agency-os/src/mission/mission.ts:79`. Its **one responsibility** is to *hold intent and
state*: to know what unit of work it is and where that work has got to. It does not draft, does
not score, does not explain, does not choose the next step. It records where the work stands and
enforces which move is legal next. That single responsibility is what makes it a clean stage
rather than a god-object — it is the pipeline's memory of *where we are*, and nothing else.

### 2.2 The state machine

The mission moves through six states in a fixed lifecycle:

```
submitted → planning → awaiting_approval → executing → completed | failed
```

Read in order:

- **submitted** — a mission has been created; the unit of work exists but nothing has been
  planned.
- **planning** — the mission's steps are being decided (today, procedurally; see §3).
- **awaiting_approval** — the mission is holding at a human gate, waiting for a person to decide.
  This is the pipeline's human-sovereign heartbeat: the mission *stops here* until a human acts.
- **executing** — an approved mission is carrying out its committed work.
- **completed** — the work finished and was recorded. Terminal, successful.
- **failed** — the work stopped and will not resume. Terminal, unsuccessful, no reopen.

The two terminal states, `completed` and `failed`, are the only exits. Everything else is a
station the mission passes through, and — critically — a mission can loop through
`awaiting_approval` more than once, because the live workflow has multiple gates (§2.4).

### 2.3 The transitions

Each state change is a named, guarded transition on the aggregate. These are the only legal moves;
any other attempted move is rejected as an invalid transition (`mission.ts:218`). The transition
methods (all ✅ SHIPPED):

| Transition | Method | Citation | Effect |
|-----------|--------|----------|--------|
| Begin planning | `plan()` | `mission.ts:172` | `submitted → planning` |
| Reach a gate | `requestApproval(gate)` | `mission.ts:179` | `planning → awaiting_approval`, holding at the named gate |
| Pass a gate | `approve(gate)` | `mission.ts:188` | clears the named gate |
| Commit to work | `startExecuting()` | `mission.ts:195` | `→ executing` |
| Finish | `complete()` | `mission.ts:202` | `→ completed` (terminal) |
| Stop | `fail(reason)` | `mission.ts:209` | `→ failed` (terminal, **destructive**, no reopen) |

The aggregate emits lifecycle events on these moves (`mission.ts:51-71`), so every transition is
observable — a fact Part 4's `PROVENANCE_AND_OBSERVABILITY.md` builds on for Law 6.

Two transitions deserve emphasis:

- **`requestApproval(gate)` / `approve(gate)` are the human-gate machinery.** They are how the
  mission stops for, and resumes after, a human decision. Because they are *transitions of the
  mission itself* — not a side channel — the human gate is structurally a **first-class stage**,
  not an exception bolted onto the flow (§2.4, previewed further in §5.3).

- **`fail(reason)` is destructive and terminal.** Once a mission fails, it moves to `failed` and
  cannot be reopened. This matters for a specific honesty point developed in §5.3: today the live
  app routes a human's *rejection* at a gate into `fail()`, which models "please revise this" as a
  terminal failure. That is a known law-violation the design corrects; it is flagged here because
  `fail()` is a Mission transition, but the *fix* belongs to Part 2's
  [`REVIEW_REVISION_APPROVAL.md`](./REVIEW_REVISION_APPROVAL.md).

### 2.4 Approval gates

A mission's gates are the points at which it must stop and wait for a human. The aggregate's
**default** gate set is two gates — `['strategy_and_budget', 'campaign_launch']`
(`mission.ts:110`). The **live** workflow uses **three**: it adds `creative_assets` between them,
so the shipped sequence gates strategy/budget → creative assets → campaign launch.

The gates are ordinary states of the mission, reached by ordinary transitions
(`requestApproval` in, `approve` out). They are not error states, not interrupts, not exceptions —
they are stations on the same track as every other state. This is the mission stage embodying the
law that *the human gate is a first-class stage, not an exception*: a mission that is
`awaiting_approval` is not in trouble; it is doing exactly what a human-sovereign pipeline is
supposed to do — **waiting for a person.** §5.3 states the law; `REVIEW_REVISION_APPROVAL.md`
owns it.

### 2.5 Why the Mission stage is the ✅ backbone

The single most important fact about Book F's *shipped* status is this: **the mission state
machine is already sequencing the live workflow.** The order of the whole live pipeline — brief,
then gate, then creative, then gate, then campaign, then gate, then report, then executive, then
learn — is expressed as, and enforced by, the mission's states and guarded transitions. A brief
cannot be approved before it is generated; a campaign cannot launch before its gate clears; a
mission cannot complete before it executes. The state machine is what makes those "cannot"s true.

So while most of the pipeline's *middle* is built-but-unwired or roadmap, its *spine* is real. The
Mission stage is the one place where AdOS already does genuine orchestration: it holds the unit of
work and enforces the legal order of moves on it. Everything else Book F designs is, in a sense,
about giving this backbone a proper engine — a planner to order the steps and a governed pipeline
to run them — rather than the procedural, human-clicked sequencing that drives it today (§3).

---

## 3. The Planner stage (❌ ROADMAP)

### 3.1 There is no planner today

State it plainly: **AdOS has no planner.** No component in the running system takes a mission goal
and produces an ordered plan of pipeline steps. The Planner stage of the canonical pipeline is
named and holds its place, but its occupant does not exist in the live path. It is ❌ ROADMAP.

What *does* order the steps today is not a planner but a combination of two procedural mechanisms:

1. **Hardcoded sequencing in route handlers.** The live dispatch at
   `apps/web/src/routes.ts:732-768` maps each user action (brief, approve, creative, campaign,
   analytics, executive, learn, cancel) to a handler. The *order* those actions may fire in is not
   computed — it is baked into the handlers procedurally: each handler reloads the mission and
   guards on its status and prior artifacts, so an out-of-order action is simply rejected. The
   sequence lives in code, distributed across handlers, not in any planning component.

2. **The mission state machine's own guards** (§2). The legal-transition rules of `Mission`
   (`mission.ts:79`) are the other half of the ordering: the state machine will not let the
   mission move except forward through its lifecycle. Between them, the route handlers and the
   state machine *are* the "plan" today — a plan that is fixed in code and advanced by a human
   clicking each step, not decided by a planning stage.

There is, in other words, no engine that drives the sequence. **The human is the planner.** The
order is correct, but it is enforced by convention and guards rather than produced by a stage that
owns planning as its one responsibility.

### 3.2 The contract that exists — and is unwired

A planner *contract* does exist in the codebase, which is why the stage is worth naming precisely
rather than hand-waving. In the cognitive core there is:

- `decompose(goal, context): Promise<Plan>` at `packages/cognitive-core/src/engines.ts:18` — the
  shape of a planner: take a goal and a context, return a plan.
- `ExecutionPlannerPort` at `packages/cognitive-core/src/engines.ts:57` — the port a planner would
  be injected behind.
- `CognitiveCore` at `packages/cognitive-core/src/engines.ts:76` — the surrounding container.

But this contract is **never imported in `apps/web`.** No live path constructs it, injects it, or
calls it. It is a shape with no implementation on the wire — which is exactly the definition of a
roadmap stage: the intent is expressed as a contract, the behaviour is absent from the running
system. Because it is unwired in the app, the Planner stage is ❌ ROADMAP, not 🔶 — there is no
built engine sitting behind the port waiting to be connected; there is only the port.

### 3.3 What `nextStep()` is — and is not

There is one thing in the live app that *looks* like it might be a planner and is not. The
dashboard computes a `nextStep()` hint (`apps/web/src/routes.ts:74`). It is tempting to read this
as "the system deciding what to do next" — but it is a **static UI hint**, not a planner. It
inspects the mission's current state and tells the *human* which button is likely next; it does
not decide, order, or drive the pipeline. It is a convenience for the person who is doing the
planning, not a planner itself. Naming it here closes off the misreading: the presence of a
"next step" label in the UI is not evidence of a planning stage.

### 3.4 The design — a deterministic planner

The Planner stage's target design is a **deterministic planner**: a stage whose one job is to take
a mission and its context and produce the *ordered sequence of pipeline steps* that mission will
run — the same steps that route handlers and state-machine guards hardcode today, but produced by
one component that owns ordering, rather than smeared across handlers.

Its single responsibility is **ordering, and only ordering.** It decides *which steps, in what
order*. It does not:

- **generate** anything (that is Generation, Book B),
- **score** anything (that is Scoring, Book E),
- **read evidence** (that is Memory, Book D),
- **decide the outcome** (that is the human, at the gates).

Its output is a plan — an ordered list of stages for this mission — and nothing more. Handed that
plan, the rest of the pipeline executes it in order. `SEQUENCING_AND_STATE.md` (Part 3) develops
how a plan would be enforced against the state machine; this document establishes only *what the
Planner stage is for* and *what it must never become*.

---

## 4. The most important law here — Orchestration is Deterministic

A planner is the single component in Book F most at risk of quietly violating the platform's
founding boundary, so this law is stated here with more force than anywhere else in the book.

**A planner in AdOS is deterministic step-ordering. It is NOT an autonomous agent that
improvises.**

### 4.1 What deterministic means for the planner

Determinism is Law 2: *same Mission + same Context + same Memory → same plan, same stage order.*
Applied to the Planner stage:

- Given the same mission and the same context, the planner produces the **same plan every time.**
  There is no run in which it orders the steps differently because it "felt" a different path was
  better.
- The planner does **not self-select a path at runtime.** It does not branch on a model's opinion,
  does not consult an LLM to choose its actions, does not decide mid-run to skip a stage or invent
  a new one. The set of steps and their order are a deterministic function of the mission and its
  context.
- The only branch the pipeline admits is the **human** one at the gates — Approve or Revise — and
  even that is a declared, fixed-shape branch, not a planner improvisation.

### 4.2 What the planner is emphatically NOT

Because "planner" and "agent" are words that travel together in the wider industry, the
distinction is worth drawing sharply. In AdOS, the Planner stage is **not**:

- **not** an LLM agent that reads a goal and chooses its own actions,
- **not** a component that decides at runtime to call a tool, spawn a step, or re-order the
  pipeline,
- **not** a source of new capability, heuristic, or judgement,
- **not** allowed to make the pipeline non-reproducible.

An autonomous, improvising agent would be *creating intelligence* — inventing a path — and that is
precisely what the invariant forbids. The planner sequences steps that already exist; it originates
no decision of its own. Its determinism is not a limitation to be relaxed later; it is the property
that makes the whole pipeline trustworthy, auditable, and reproducible. An agency that has seen one
run of a mission has seen the shape of every run — and that is only true if the planner never
improvises.

### 4.3 Why this matters most at the planning stage

Determinism could, in principle, be compromised at any stage, but the Planner is where it would be
*lost* — because the planner is the stage that decides order, and order is the thing determinism
protects. A non-deterministic generator produces a different draft; a non-deterministic *planner*
produces a different *pipeline*. The first is a content difference the human reviews; the second
is a structural difference that breaks reproducibility and auditability at the root. That is why
the planner, above all stages, must be deterministic step-ordering and nothing more.

---

## 5. The laws, applied to these two stages

### 5.1 Every Stage Has One Responsibility

Mission and Planner each do exactly one job, and the boundary between them is clean:

- **Mission = hold the unit of work and its state.** It records what the work is and where it has
  got to; it enforces the legal next move. It does not generate, score, explain, plan, or decide.
- **Planner = decide the ordered steps.** It produces the sequence the mission will run. It does
  not generate, score, explain, hold state, or decide the outcome.

Neither stage does generation or scoring. Neither reaches into the other's job: the Mission does
not order steps (it holds state and enforces legality); the Planner does not hold the unit of work
(it reads a mission and emits a plan). This is Law 3 — one responsibility per stage — drawn
exactly at the Mission/Planner seam. The clarity is what keeps both stages debuggable: if the work
is in the wrong state, look at Mission; if the steps are in the wrong order, look at the Planner.

### 5.2 Orchestration is Deterministic

Covered in full in §4. In short: the Mission's transitions are already deterministic — the state
machine only permits legal, forward moves (`mission.ts:172`–`209`, invalid moves rejected at
`mission.ts:218`) — and the Planner *must* be built deterministic, producing the same plan for the
same mission and context. Determinism is a property of a fixed pipeline, and these two stages are
where the fixed pipeline begins.

### 5.3 The Human Gate is first-class

The mission's approval gates (§2.4) are **normal stages, not exceptions.** A mission at
`awaiting_approval` is running the pipeline correctly, not erroring. The `requestApproval` /
`approve` transitions are ordinary moves of the mission; the gates are ordinary states. This is
the human-gate law appearing at the Mission stage, where the gate machinery physically lives.

Honesty, previewed here and owned by [`REVIEW_REVISION_APPROVAL.md`](./REVIEW_REVISION_APPROVAL.md):
today the live app routes a human *rejection* at a gate into the destructive `fail()`
(`mission.ts:209`), driving the mission to a terminal `failed` state. That models "please revise
this" as a terminal failure — a violation of the human-gate law, whose design fix is a normal
`Review → { Approved | Revision }` branch. The transition (`fail()`) is a Mission transition, which
is why it is named here; the correction is developed in Part 2's review document.

### 5.4 No new intelligence

Neither stage adds any intelligence to the platform. The Mission holds state — a bookkeeping job,
not an inference. The Planner *sequences existing components* — it orders Memory, Generation,
Scoring, Explanation, and the human gates into a plan, but it invents none of them and adds no new
capability of its own. When the Planner is built, it will decide *order*; it will not decide
*content*, *score*, or *outcome*. That boundary is the invariant, stated once more because these
two stages are exactly where a designer might be tempted to cross it:

> **Orchestration coordinates intelligence; it does not create intelligence.**

The Planner, in particular, must resist the pull toward becoming an agent that "figures out" the
work. It figures out *nothing*. It orders steps that already exist. This is the sibling boundary
the platform draws throughout: no new intelligence, only orchestration.

---

## 6. Boundaries

Both stages run entirely within the platform's standing boundaries:

- **100% local, offline-first.** The mission state machine and any planner run on the local
  machine. Neither calls a cloud service, external API, or connector. The planner, when built,
  plans from the mission and local context only.
- **Copy only, no external data.** These stages move the agency's own unit of work and the order
  of its steps. They ingest no third-party data and emit no vendor telemetry.
- **Human-sovereign.** The mission's gates never auto-approve. A mission holds at
  `awaiting_approval` until a person decides; no planner, and no automation, may clear a human
  gate. The human is the planner today, and remains the sole approver even once a deterministic
  planner exists.
- **Deterministic, never improvising.** The planner is deterministic step-ordering, not an
  autonomous agent. It never self-selects a path at runtime (§4).
- **Orchestrates, does not redesign.** These stages are Book A workflow, sequenced by Book F. The
  steps a planner orders belong to Books B/C/D/E; Book F references them and sequences them, it
  does not re-document or redesign them.

---

## 7. Where these stages sit — status summary

| Stage | Responsibility | Tier | Anchor |
|-------|----------------|------|--------|
| **Mission** | Hold the unit of work + its state | ✅ SHIPPED | `domains/agency-os/src/mission/mission.ts:79` |
| **Planner** | Decide the ordered steps | ❌ ROADMAP | contract only: `packages/cognitive-core/src/engines.ts:18` (unwired) |

The Mission stage is the shipped backbone: a real state machine that already sequences the live
workflow through guarded, deterministic transitions. The Planner stage is a named, placed, unbuilt
target: a deterministic step-orderer whose contract exists but is never wired, standing in for the
procedural, human-driven sequencing that orders the pipeline today. The edge of the pipeline is
real; its planner is design.

The next stages in the pipeline — Memory (read context and evidence) and Generation (produce a
draft) — are covered in [`MEMORY_AND_GENERATION.md`](./MEMORY_AND_GENERATION.md). The human stages
these two set up — Review, Revision, Approve — are covered in
[`REVIEW_REVISION_APPROVAL.md`](./REVIEW_REVISION_APPROVAL.md).

---

## 8. Value contribution

A mission that holds work in a real, guarded state machine, plus a deterministic planner that
orders its steps, is what turns a pile of ad-hoc service calls into one managed process — and the
value lands on both axes an agency measures:

- **Reduces production time.** The Mission backbone already removes a class of rework by making
  illegal orderings impossible: a mission cannot skip a gate, complete before it executes, or
  approve a draft that was never generated. A deterministic planner extends that saving by putting
  the whole sequence on rails owned by one stage rather than smeared across route handlers — fewer
  coordination mistakes, less re-doing, faster throughput. There is one place the order can be
  wrong, and it is inspectable.
- **Increases agency revenue.** A unit of work with a stable identity, a legal lifecycle, and a
  deterministic plan is what makes AdOS an enterprise-manageable platform an agency can trust and
  scale on. Every mission runs the same shape; every gate holds for a human; every plan is
  reproducible. That predictability — a mission you can point to, a plan you can audit, a human who
  always holds the gate — is what a growing agency buys and builds on.

Mission and Planner are the front of the line. Get the unit of work and its ordering right —
shipped for Mission, deterministic-by-design for Planner — and every stage after them inherits a
sequence it can trust.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
