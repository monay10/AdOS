# Sequencing and State

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

This document defines **how the pipeline is sequenced and how its state is managed** — and,
because those two things are where the platform's founding discipline is either enforced or lost,
it **owns the enforcement of two laws**: the First Law (*no component executes outside the
orchestration pipeline*) and Law 2 (*orchestration is deterministic*).

Sequencing is the question of *what runs next, and who says so*. State is the question of *where
the work has got to, and which move is legal from here*. Together they are the control layer of
Book F: not a new capability, but the discipline that turns a set of capabilities into a managed
process. Everything the other books produce — briefs, creative, campaigns, evidence, scores,
rationales — is only as trustworthy as the order in which it runs and the record of where it
stands.

This document is unusually honest, because the two laws it owns are in two very different
conditions today:

- **The state backbone is ✅ SHIPPED.** The Mission state machine
  (`domains/agency-os/src/mission/mission.ts:79`) is real, live, and already enforces a legal
  ordering on the running workflow. This is the one piece of genuine, shipped orchestration control
  in AdOS.
- **The First Law is NOT enforced today.** Sequencing is *procedural* — each route handler drives
  its own step, services are called directly, and the governed pipeline is bypassed entirely. The
  First Law is the target the design specifies; it is not the running reality.

One sentence bounds the entire exercise, and it is stated in full here because sequencing is the
layer most easily mistaken for intelligence — it *decides what runs* without ever *deciding what
to say*:

> **Orchestration coordinates intelligence; it does not create intelligence.**

Sequencing orders steps that already exist. State records where the work stands. Neither
generates, scores, explains, nor decides an outcome. This document specifies how a single
orchestrator would enforce the First Law and Law 2 on top of the state backbone that already
ships — and it is precise about the gap between that design and today.

---

## 2. The First Law — no component executes outside the orchestration pipeline

> **FIRST LAW — No component executes outside the orchestration pipeline.** Every AI action —
> generation, scoring, explanation, evidence lookup — runs *through* one managed pipeline. The
> intelligence layers (Books B, C, D, E) stop being independent modules called ad hoc; nothing
> calls a service directly. Every stage runs *through* the orchestrator.

This is the constitutional promise of Book F, and this document owns its enforcement. The law is
simple to state and demanding to keep: there is exactly **one way in** to any AI capability, and
it is the pipeline. No route handler, no service, no factory reaches past the orchestrator to call
a model, gather evidence, or run a score on its own authority. If a component wants intelligence,
it asks the pipeline, and the pipeline sequences the request through its governed stages. The law
is what makes AdOS a *governed* system rather than a collection of independently invokable tools.

### 2.1 The honest reality — the First Law is not enforced today

Book F does not claim this law is met. Today it is **violated**, and the violation is structural,
not incidental. Three facts establish it:

1. **Sequencing is procedural, not orchestrated.** The live workflow is driven by a route
   dispatcher (`apps/web/src/routes.ts:732-768`) that maps each user action — brief, approve,
   creative, campaign, analytics, executive, learn, cancel — to a handler. There is no engine that
   drives the sequence. Each handler reloads the mission and guards on its status and prior
   artifacts (`routes.ts:952`, `routes.ts:988`, `routes.ts:1022`), then does its own step. The
   *order* is enforced by convention and by guards distributed across handlers, not produced by an
   orchestrator that owns sequencing as its single job.

2. **Services are called directly.** Inside those handlers, the intelligence layers are invoked
   straight: `generateBrief` (`routes.ts:899`) calls `app.briefs.generate` (`routes.ts:921`);
   `generateCreative` (`routes.ts:946`) calls the creative service; `generateCampaign`
   (`routes.ts:981`) calls the campaign service. These are direct service calls, not stages routed
   through a governed pipeline. The handler is the caller; there is no orchestrator between it and
   the service.

3. **The governed pipeline is bypassed.** The one component that *is* a governed pipeline — the
   runtime `AIManager` (`packages/ai-manager/src/runtime/manager.ts:156`) — is not what the live
   app runs. The app constructs its AI port through `createAIManager` (`apps/web/src/main.ts:43` →
   `apps/web/src/ai-factory.ts:23`), which yields `OfflineAIManager` (`ai-factory.ts:27`) or
   `LiveAIManager` (`ai-factory.ts:39`). `LiveAIManager.submit` (`apps/web/src/ai-live.ts:34`)
   builds messages, calls the engine, extracts JSON, and does one repair turn
   (`ai-live.ts:49-67`) — and runs **zero** governed stages: no evidence, no context, no safety, no
   constitution, no journal, no learning. That single port is injected into every service
   (`apps/web/src/app.ts:71`, `app.ts:84-88`), so every service reaches its model by bypassing the
   governed pipeline entirely.

The conclusion is plain: **components execute outside the orchestration pipeline today.** The
First Law is a target state, not a shipped guarantee, and Book F says so rather than papering over
it.

### 2.2 How a single orchestrator would enforce the First Law

The enforcement design is not to add new intelligence — the intelligence already exists in Books
B/C/D/E and in the governed runtime. The enforcement design is to **remove every path that
reaches a capability except through the orchestrator.** Concretely:

- **One entry point.** Every AI action enters through the governed pipeline's submission surface
  (`AIManager.submit` / `runExecute`, `manager.ts:92`, `manager.ts:156`). A service that wants a
  draft, a score, or an explanation does not call a model; it hands a request to the orchestrator,
  which sequences it through the governed stages. There is no second door.

- **Services hold no direct model handle.** Today the composition root injects the raw AI port
  into every service (`app.ts:71`, `app.ts:84-88`). The enforcement design inverts this: services
  are given the *orchestrator*, not a model port, so that "call the model directly" is not a
  capability any service possesses. The bypass path (`ai-factory.ts:39`, `ai-live.ts:34`) is
  removed from the live wire, not merely discouraged.

- **The route handler becomes a driver, not a caller.** The procedural handlers
  (`routes.ts:732-768`) stop calling `app.briefs.generate` and its siblings directly. Instead they
  advance the mission through its states and let the orchestrator run the corresponding stage. The
  handler says *"this mission is ready for its brief stage"*; the orchestrator runs the stage
  through the pipeline. Ordering stops being smeared across handlers and becomes a property of the
  one component that owns it.

- **The pipeline is the only place governance runs.** Because every action flows through the
  governed stages — safety-in (`manager.ts:172`), context (`manager.ts:179`), evidence
  (`manager.ts:203`), confidence (`manager.ts:209`), routing (`manager.ts:216`),
  inference/repair (`manager.ts:229-253`), safety-out (`manager.ts:256`), constitution
  (`manager.ts:261`), decision journal (`manager.ts:290`), learning (`manager.ts:304-317`) — there
  is no execution that escapes them. The First Law is enforced not by a rule that says "please use
  the pipeline" but by an architecture in which the pipeline is the *only* way through.

The orchestrator ports the governed pipeline depends on already exist
(`packages/ai-manager/src/ports.ts`, imported at `manager.ts:12-33`); today they are wired only in
tests, which is why the governed pipeline is 🔶 BUILT (UNWIRED). Enforcing the First Law is, in
essence, wiring that pipeline as the live engine behind the mission workflow and deleting the
paths that go around it.

---

## 3. The state backbone — the Mission state machine (✅ SHIPPED)

> **Addendum (Storage Lifecycle — durable state has a lifecycle, ✅ SHIPPED).** State is not only
> *where the work has got to*; over a long-running install it is also *how much of it has piled up*.
> The durable stores (`BRAIN_DB`) accumulate: the Decision Journal — the append-only audit record
> this document treats as canonical state — was rewritten *whole* on every `record`, so its hot blob
> and the restart-time restore both grew without bound, and repeated blob rewrites left SQLite
> freelist pages behind. A **Storage Lifecycle / Maintenance service** (`apps/web/src/maintenance.ts`)
> now gives that state a managed lifecycle without weakening the record: **it measures** whole-database
> size, reclaimable bytes, and per-table + Active/Frozen journal counts; **it compacts** the Decision
> Journal by keeping the most recent N entries per tenant *hot* (Active) and folding older ones into an
> **immutable, append-only Frozen archive** (`decision_journal_archive`) — archive-*before*-prune and
> `ON CONFLICT DO NOTHING` make it crash-safe and idempotent, so **no entry is ever lost**, only moved
> off the hot path (history stays queryable via `journal.archive`); and **it reclaims** page bloat with
> `VACUUM`/`ANALYZE`/`PRAGMA optimize`, reporting the bytes actually freed. This is the state-management
> discipline of §3 extended across *time*: the legal-move guarantee is unchanged, but the record that
> backs it now stays bounded and fast. Operator-triggered on a `/maintenance` page; 100% local. Proven
> by `maintenance.test.ts` + `maintenance.e2e.test.ts`. **Not yet:** Company-Brain snapshot compaction
> (experiences are not pruned/summarized), and no scheduled/threshold auto-run.

The First Law is unmet, but the *foundation* the orchestrator builds on is real and shipped. The
Mission state machine is the ordering guarantee that already exists, and it is the reason
sequencing is not chaos even while it is procedural.

### 3.1 What the state machine is

`Mission` (`domains/agency-os/src/mission/mission.ts:79`) is a real aggregate whose one
responsibility is to *hold the unit of work and its state* — to know what job this is and where it
has got to, and to enforce which move is legal next. It moves through a fixed lifecycle:

```
submitted → planning → awaiting_approval → executing → completed | failed
```

- **submitted** — the unit of work exists; nothing planned yet.
- **planning** — the mission's steps are being decided (today, procedurally; §5).
- **awaiting_approval** — the mission is holding at a human gate. It *stops here* until a person
  acts. It cannot advance itself.
- **executing** — an approved mission is carrying out committed work.
- **completed** — finished and recorded. Terminal, successful.
- **failed** — stopped, no reopen. Terminal, unsuccessful.

### 3.2 The transitions are the ordering guarantee

Each state change is a named, guarded transition, and these are the **only** legal moves. Any move
outside them is rejected as an invalid transition (`mission.ts:218`) — the single most important
fact about the backbone, because it is what makes illegal orderings *impossible* rather than
merely discouraged.

| Transition | Method | Citation | Effect |
|-----------|--------|----------|--------|
| Begin planning | `plan()` | `mission.ts:172` | `submitted → planning` |
| Reach a gate | `requestApproval(gate)` | `mission.ts:179` | `planning → awaiting_approval` at the named gate |
| Pass a gate | `approve(gate)` | `mission.ts:188` | clears the named gate |
| Commit to work | `startExecuting()` | `mission.ts:195` | `→ executing` |
| Finish | `complete()` | `mission.ts:202` | `→ completed` (terminal) |
| Stop | `fail(reason)` | `mission.ts:209` | `→ failed` (terminal, **destructive**, no reopen) |

The default gate set is `['strategy_and_budget', 'campaign_launch']` (`mission.ts:110`); the live
workflow uses three, adding `creative_assets`. The aggregate emits lifecycle events on every move
(`mission.ts:51-71`), so each transition is observable — a fact Part 4's provenance document builds
on for Law 6.

### 3.3 Why this is the ✅ ordering guarantee the orchestrator builds on

The state machine already enforces a legal order on the live workflow: a brief cannot be approved
before it is generated, a campaign cannot launch before its gate clears, a mission cannot complete
before it executes. Those "cannot"s are true because the invalid-transition guard
(`mission.ts:218`) makes every out-of-order move illegal at the aggregate. This is genuine,
shipped sequencing control — the spine of the pipeline.

What the state machine does **not** do is *drive* the sequence. It rejects wrong moves; it does not
initiate right ones. Today a human clicks each step and each route handler makes the corresponding
transition. The orchestrator design of §2.2 does not replace this backbone — it *builds on it*.
The governed pipeline becomes the engine that advances the mission through these same states, so
that the ordering the state machine *permits* is also the ordering an orchestrator *drives*, rather
than one a human clicks through by hand.

---

## 4. Law 2 — Orchestration is Deterministic

> **LAW — Orchestration is Deterministic (the most important law).** Same Mission + Same Context +
> Same Memory → Same Pipeline, same stage order. The orchestrator never self-selects a different
> path at runtime.

This document owns the enforcement of determinism at the sequencing layer. Determinism here has a
precise meaning: **the stage order is fixed and reproducible.** Handed the same mission, the same
context, and the same memory, the orchestrator runs the same stages in the same order every time.
It does not consult a model to decide which stage to run next; it does not branch on an opinion; it
does not, on some runs, take a different path because a different path "seemed better." The
sequence is a fixed function of the inputs, not a runtime choice.

### 4.1 The orchestrator never self-selects a path

The load-bearing clause is *never self-selects*. A deterministic orchestrator has no discretion
over order. The only branch the pipeline admits is the **human** one at the gates — Approve or
Revise — and even that is a declared, fixed-shape branch, not an orchestrator improvisation. Every
other transition is forced by the state machine's legal-move rules (§3) and by a fixed stage
sequence. There is no run in which the orchestrator invents a new stage, skips a governed one, or
re-orders the pipeline on its own judgement. If two runs of the same mission differ in *which
stages ran and in what order*, determinism has been broken — and the architecture is built so that
cannot happen.

### 4.2 AdOS is not an autonomous agent

This is the sharpest distinction Book F draws, and the sequencing layer is where it is decided.

- An **autonomous agent** reads a goal and *chooses its own actions at runtime*. It decides, mid
  run, to call this tool, skip that step, spawn a new one, or re-plan. Its path is emergent and, by
  design, not reproducible: run it twice and it may do two different things. That variability is
  sold as intelligence.
- The **AdOS orchestrator** runs a **fixed ordered sequence.** It selects nothing at runtime. The
  stages and their order are the same on every run of the same mission. Its predictability is the
  product: an agency that has seen one run of a mission has seen the shape of every run.

An orchestrator that self-selected its path would be *creating intelligence* — inventing a
sequence — and that is precisely what the invariant forbids. AdOS sequences steps that already
exist; it originates no path of its own. Determinism is not a limitation to be relaxed once the
system is "smart enough." It is the property that makes the whole pipeline auditable and
reproducible, and it is non-negotiable.

### 4.3 The governed runtime is the deterministic model

The reference implementation of a fixed ordered sequence already exists in the codebase, and it is
what the design points to as the model of determinism. `AIManager.runExecute`
(`packages/ai-manager/src/runtime/manager.ts:156`) runs a fixed, ordered chain of stages — each
one appearing in the same position on every execution:

1. safety-in (`manager.ts:172`)
2. context build (`manager.ts:179`)
3. tool validation (`manager.ts:184`)
4. evidence gather (`manager.ts:203`)
5. confidence assess (`manager.ts:209`)
6. route (`manager.ts:216`)
7. inference + validate/repair (`manager.ts:229-253`)
8. safety-out (`manager.ts:256`)
9. constitution check (`manager.ts:261`)
10. response (`manager.ts:276`)
11. decision journal (`manager.ts:290`)
12. monitoring + events + learning (`manager.ts:304-317`), then brain enrich (`manager.ts:320`)

This order is not chosen at runtime; it is the structure of the method. The pipeline does not
consult a model to decide whether context should come before or after evidence — the order is
fixed, and the header names it "the single AI Pipeline" (`manager.ts:71`). That is the shape a
deterministic sequence takes: a straight ordered chain, reproducible by construction. Today this
runtime is instantiated only in tests (`walking-skeleton.test.ts:94`, `integration.test.ts:27`),
which is why it is 🔶 BUILT (UNWIRED) — but it is the concrete model of the determinism the
sequencing design enforces. Same Mission + Same Context + Same Memory → this same sequence, every
time.

---

## 5. Sequencing design — executing a plan as a fixed ordered pipeline

With the First Law's enforcement (§2) and Law 2's determinism (§4) established, the sequencing
design is how they combine into a running pipeline: a plan is produced once, then executed as a
fixed ordered sequence whose progression is gated by state transitions.

### 5.1 From plan to fixed ordered execution

The Planner stage — ❌ ROADMAP, a contract only (`packages/cognitive-core/src/engines.ts:18`),
covered in [`../2-pipeline-stages/MISSION_AND_PLANNING.md`](../2-pipeline-stages/MISSION_AND_PLANNING.md)
— produces, once, the ordered sequence of steps a mission will run. Sequencing's job begins where
planning ends: **take that ordered plan and execute it, in order, without deviation.** The plan is
decided once and then honoured. The orchestrator does not re-plan mid-run, does not reorder, does
not skip. Because the plan is a deterministic function of the mission and its context (Law 2
applied at the Planner, §4), and because the orchestrator executes it faithfully, the whole run is
reproducible from end to end. Planning is deterministic in *what order*; sequencing is faithful in
*running that order*.

Today there is no planner and no engine driving execution — the order is hardcoded across route
handlers (`routes.ts:732-768`) and enforced by the state machine's guards (§3). The design replaces
the smeared, human-clicked sequence with one orchestrator that executes a produced plan as a fixed
ordered pipeline. The steps do not change; who owns their ordering does.

### 5.2 State transitions gate progression

Sequencing does not advance on a timer or on the orchestrator's say-so alone — it advances only
through legal state transitions. This is the coupling between §3 (state) and §4 (determinism): the
state machine is what *gates* progression from one stage to the next.

- A stage may run only when the mission is in the state that permits it. The invalid-transition
  guard (`mission.ts:218`) makes any attempt to run a stage out of order illegal at the aggregate,
  so the orchestrator physically cannot advance the pipeline into a stage the mission is not ready
  for.
- Each generative stage, on completing, moves the mission to the next legal state —
  `requestApproval(gate)` (`mission.ts:179`) to hold at a gate, `startExecuting()`
  (`mission.ts:195`) to commit, `complete()` (`mission.ts:202`) to finish. The pipeline progresses
  by walking the mission through its states, never by side-stepping them.
- The live workflow already demonstrates this coupling: `missions.plan` and
  `requestApproval('strategy_and_budget')` fire together after the brief (`routes.ts:939-940`);
  `requestApproval('creative_assets')` after the creative (`routes.ts:975`);
  `requestApproval('campaign_launch')` after the campaign draft (`routes.ts:1011`); and the learn
  step ends with `startExecuting()` + `complete()` (`routes.ts:1180-1181`). The transitions are
  what gate each hand-off; the design keeps that coupling and puts an engine behind it.

### 5.3 Where the human stages fit

Progression is gated not only by state but, at the decisive moments, by a **person**. The human
stages — Review, Revision, Approve — are covered in
[`../2-pipeline-stages/REVIEW_REVISION_APPROVAL.md`](../2-pipeline-stages/REVIEW_REVISION_APPROVAL.md);
here they matter as the one legitimate branch in an otherwise fixed sequence. When the pipeline
reaches a gate it enters `awaiting_approval` and **stops** — the orchestrator cannot advance past
a gate on its own, because `approve(gate)` (`mission.ts:188`) is reachable only through a human
action, and the system never auto-approves. The human decision (Approve or Revise) is the only
runtime branch the deterministic sequence admits, and it is a declared, fixed-shape branch, not an
orchestrator improvisation. The human is a *stage of the pipeline* with a fixed position — the
sequence is *supposed* to pause there, and pausing is success, not an exception. Determinism and
human sovereignty are not in tension: the sequence is fixed, and the one place it yields, it yields
to a person, by design.

---

## 6. Idempotency of sequencing (✅ partial)

A sequenced pipeline must be safe to *replay* — running a step again, after a reload or a
double-click, must not corrupt the mission or double its work. AdOS ships this safety **partially**,
and Book F is precise about how far it reaches.

Two steps in the live workflow are genuinely idempotent today, and both are ✅ SHIPPED:

- **`recordLearning` early-returns if the mission is already completed** (`routes.ts:1096`). The
  learn step — which writes to the journal, executive memory, and the company brain
  (`routes.ts:1118-1170`) before `startExecuting()` + `complete()` (`routes.ts:1180-1181`) — checks
  first whether the mission is already done and returns early if so. Replaying it on a completed
  mission is a no-op, not a second round of learning.
- **`generateExecutive` early-returns if the executive summary already exists**
  (`routes.ts:1064`). Re-invoking the executive step does not regenerate or overwrite; it detects
  the existing artifact and returns. Replaying it is safe.

More broadly, each route handler reloads the mission and guards on its status and prior artifacts
(`routes.ts:952`, `routes.ts:988`, `routes.ts:1022`) before acting, so a step fired against a
mission that has moved past it is rejected rather than re-run. Between the early-returns and the
guards, replaying an individual step is safe on the paths that have it.

But **full idempotency across all stages is ❌ ROADMAP.** Not every stage carries an early-return;
the safety is per-handler, not a property of the sequence as a whole. The governed runtime treats
its `idempotencyKey` as a session identifier (`manager.ts:163`), not as a dedupe key — so it does
not, by itself, guarantee that submitting the same request twice runs the stages once. A pipeline
that is idempotent by construction — where replaying *any* stage is provably safe because the
orchestrator owns dedupe — is part of the same design that enforces the First Law: once every stage
runs through one orchestrator, idempotency becomes a property the orchestrator enforces uniformly,
rather than a courtesy each handler implements by hand. Today the courtesy exists on two steps;
the uniform guarantee does not.

---

## 7. No new intelligence

Sequencing and state add no intelligence to the platform. This bears stating precisely, because
"the layer that decides what runs next" is easy to mistake for "the layer that is smart." It is
the opposite:

- **The state machine** runs no model. It records where the work stands and enforces which move is
  legal. That is bookkeeping, not inference.
- **Sequencing** runs no model. It executes a produced plan in order and advances the mission
  through legal transitions. It orders steps that already exist; it originates none of them.
- **Idempotency** runs no model. It detects that a step has already happened and declines to repeat
  it.

Every ounce of intelligence the pipeline coordinates was produced elsewhere: the brief, creative,
and campaign by Book B; the evidence by Book D; the score by Book E; the rationale by Book C; the
decision by the human. Sequencing and state are the **coordination** that runs those in the right
order and remembers where they are — and coordination is all they are.

> **Orchestration coordinates intelligence; it does not create intelligence.**

This is why the First Law violation (§2) and the partial idempotency (§6) are *orchestration* gaps,
not intelligence gaps. Nothing is wrong with how AdOS generates a brief when a service calls it
directly — what is wrong is that the call bypasses the pipeline. Fixing it is a matter of routing
and sequencing, the orchestrator's own job, and it touches no model. The determinism of the
sequence (§4) is likewise a coordination property: it is *how the steps are ordered*, never *what
the steps decide*.

---

## 8. Boundaries

Sequencing and state run entirely within the platform's standing boundaries:

- **100% local, offline-first.** The state machine and any orchestrator run on the local machine.
  Sequencing consults the mission and local context only — no cloud scheduler, no external workflow
  service, no connector drives the pipeline.
- **Copy only, no external data.** These mechanisms move the agency's own unit of work and the
  order of its steps. They ingest no third-party data and emit no vendor telemetry.
- **Human-sovereign.** The sequence never auto-approves. A mission holds at `awaiting_approval`
  (`mission.ts:179`) until a person clears the gate via `approve(gate)` (`mission.ts:188`); no
  timer, threshold, or model verdict may advance it. The one runtime branch the deterministic
  sequence admits is the human one.
- **Deterministic, never improvising.** The orchestrator runs a fixed ordered sequence and never
  self-selects a different path at runtime (§4). AdOS is not an autonomous agent.
- **Orchestrates, does not redesign.** The steps sequenced belong to Books B/C/D/E; the state
  backbone is Book A workflow. Book F references and sequences them — it does not re-document or
  redesign them. The orchestrator may read, route, and sequence evidence, but never edits it.

These boundaries are not features layered on top of the sequencing layer; they *are* its contract.
Removing any of them would turn a governed, human-sovereign pipeline back into a set of tools that
run in whatever order they are called.

---

## 9. Status summary

| Capability | Responsibility | Tier | Anchor |
|-----------|----------------|------|--------|
| Mission state machine | Hold the unit of work + enforce legal ordering | ✅ SHIPPED | `domains/agency-os/src/mission/mission.ts:79` |
| Procedural sequencing | Order steps via route handlers + state guards | ✅ SHIPPED (procedural) | `apps/web/src/routes.ts:732-768` |
| Per-step idempotency | Safe replay of learn / executive steps | ✅ SHIPPED (partial) | `routes.ts:1096`, `routes.ts:1064` |
| Deterministic ordered pipeline (model) | Fixed ordered stage sequence | 🔶 BUILT (UNWIRED) | `packages/ai-manager/src/runtime/manager.ts:156` |
| First-Law enforcement (single orchestrator) | Every stage runs through one pipeline | ❌ ROADMAP | design — no live engine today |
| Full cross-stage idempotency | Replay-safe by construction | ❌ ROADMAP | design |

The backbone is real: a shipped state machine already enforces a legal order on the live workflow.
The determinism model is built but unwired. The First Law — the promise that nothing executes
outside the pipeline — is the design this document specifies, and it is honestly unmet today
because sequencing is procedural, services are called directly, and the governed pipeline is
bypassed.

---

## 10. Value contribution

A single deterministic sequence, running on a real state backbone with replay-safe steps, is what
turns a pile of ad-hoc service calls into one managed process — and the value lands on both axes an
agency measures.

**It reduces production time and rework.** The shipped state machine already removes a class of
rework by making illegal orderings impossible (`mission.ts:218`): a mission cannot skip a gate,
complete before it executes, or approve a draft that was never generated. Idempotent steps
(`routes.ts:1096`, `routes.ts:1064`) mean a reload or a double-click does not re-run work or
corrupt a mission. Enforcing the First Law — one orchestrator, one ordered path — extends that
saving across the whole pipeline: there is one place the sequence can be wrong, and it is
inspectable, rather than a dozen handlers each ordering their own calls. Fewer coordination
mistakes, less re-doing, faster throughput.

**It grows revenue by making AdOS enterprise-manageable.** Determinism is what an agency buys when
it commits its clients' budgets to a system: every mission runs the same shape, every gate holds
for a human, every run is reproducible and auditable. An orchestrator that never self-selects a
path — that sequences but never improvises — is one an agency can *govern* rather than merely
*use*, and a governable pipeline is one a growing agency can safely scale its client base on. A
single deterministic, human-gated, replay-safe pipeline is what turns six disconnected
capabilities into one manageable process a business can stand behind.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
