# The Managed Platform — A–F as One Operating System

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md`](../1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md).
>
> **Laws:** *No component executes outside the orchestration pipeline · orchestration is
> deterministic · every stage has one responsibility · the orchestrator never changes evidence ·
> the human gate is a first-class stage, not an exception · observable by design.*

---

## 0. What this document is

This is the closing document of Book F, and it is the closing document of the A–F core. The ten
documents before it defined orchestration one part at a time: the constitution and the model, the
pipeline and its stages, sequencing and state, failure and recovery, provenance and observability.
This document does not add a new part. It performs the synthesis. It states plainly what the six
books are **together** — one managed operating system — and it states, just as plainly, how much
of that system runs live today and how much is the design the six books specify.

The distinction matters more here than anywhere else in the series, because "AdOS is an operating
system" is precisely the kind of sentence that sounds like a shipped claim and is not one. So this
document holds two things at once, without blurring them: the **design** — the six books composed
into a single deterministic, observable, human-gated platform — and the **status** — that the
unified pipeline does not yet run live. Read both. Neither is complete without the other.

> **Orchestration coordinates intelligence; it does not create intelligence.**

That sentence has appeared in every content document of Book F. It appears here for the last time,
and it is the reason this synthesis is honest: Book F does not make AdOS into an operating system
by adding a new capability. There is no new intelligence in Book F. What Book F adds is the layer
that runs the other five in the right order under one process — and *running the right component
in the right order* is what turns a set of tools into a platform.

---

## 1. The synthesis — six books, one core operating system

AdOS is not six products. It is one operating system with six subsystems, each of which is the
subject of one book. Read in isolation, each book is a body of capability. Read together, they are
the layers of a single machine:

| Layer | Book | What it owns | Reference |
|-------|------|--------------|-----------|
| **A — Workflow** | Book A | the agency's way of working; the shape of a mission | [`../../book-a/README.md`](../../book-a/README.md) |
| **B — Production** | Book B | AI generation of briefs, creative, campaigns | [`../../book-b/README.md`](../../book-b/README.md) |
| **C — Explanation** | Book C | the rationale behind every generated artifact | [`../../book-c/README.md`](../../book-c/README.md) |
| **D — Performance Memory** | Book D | evidence — what has worked, immutable | [`../../book-d/README.md`](../../book-d/README.md) |
| **E — Creative Judgement** | Book E | scoring and taste applied to production | [`../../book-e/README.md`](../../book-e/README.md) |
| **F — Orchestration** | Book F | the managed process that runs A–E in order | this book |

Books A through E each answer a *what*: what work, what production, what explanation, what
evidence, what judgement. None of them answers *when*, *in what order*, *under whose approval*, or
*with what record*. Five subsystems with no conductor is not an operating system — it is a bundle
of tools that a human must wire together by hand, one call at a time, remembering the order,
carrying the evidence forward, and hoping nothing was skipped.

Book F is the layer that turns those six independent books into **one** managed, enterprise-scale
platform. It is the sixth subsystem, and it is the only one whose job is the other five. It does
not compete with A–E for the work; it sequences them. This is why Book F is the layer that makes
the phrase "operating system" mean something: an operating system is not defined by having
capabilities, but by having *one managed process* that schedules them, records them, and gates
them. Book F is that process.

**No new intelligence.** This bears repeating because it is the load-bearing constraint of the
whole synthesis. Book F invents no generation (that is Book B), no explanation (Book C), no
evidence (Book D), no judgement (Book E), and no workflow shape (Book A). If a proposed
orchestration behaviour would require Book F to *make* a decision that one of the other books
owns, that behaviour is out of bounds. Book F **coordinates**; it does not create. The platform is
powerful precisely because the orchestration layer is thin, deterministic, and observable — not
because it is clever.

---

## 2. How orchestration makes AdOS enterprise-manageable

An agency cannot run a business on five subsystems it must wire together by hand. Every hand-wired
call is a place where the order can be wrong, the evidence can be dropped, the human gate can be
skipped, and the run can go unrecorded. Enterprise-manageability is not a feature you add; it is a
property you get when every AI action flows through one process that is deterministic, observable,
and human-gated. That process is what Book F specifies. Here is how each of the six laws
contributes to it.

**One deterministic, observable, human-gated pipeline (the whole point).** The managed platform is
a single pipeline that every component runs through, that records every run, that keeps evidence
immutable, and that treats the human gate as a normal stage. The six laws are the guarantees that
make that pipeline trustworthy at enterprise scale:

- **First Law — no component executes outside the pipeline.** This is what makes AdOS a *platform*
  rather than a set of independently-callable services. When B, C, D, and E stop being modules
  called ad hoc and become stages inside one managed process, the agency gets a single place where
  everything happens, a single order that always holds, and a single record of what occurred. This
  is the foundation of manageability — and it is the law that is **not met today** (see §4).

- **Law 2 — orchestration is deterministic.** Same Mission + Same Context + Same Memory → the same
  pipeline, the same stage order, every time. An enterprise can only trust a process it can
  reproduce. Determinism is what lets an agency stake its reputation on a run: the machine did not
  quietly choose a different path.

- **Law 3 — every stage has one responsibility.** Each stage does exactly one job and never takes
  another stage's job. This is what makes the platform auditable: when something is wrong, there is
  exactly one stage responsible for it, and the boundaries between subsystems stay clean.

- **Law 4 — the orchestrator never changes evidence.** Evidence from Book D is immutable; the
  orchestrator may read, route, and sequence it, but never edit it. This is the trust layer. An
  agency scaling on AdOS is scaling on the promise that the record of what worked cannot be
  rewritten by the process that consumes it.

- **Law 5 — the human gate is a first-class stage, not an exception.** Human approval is a normal
  part of the pipeline (`Human Review → Approved | Revision`), not an error path. This is what
  keeps AdOS **human-sovereign** at platform scale: the machine never crosses a gate on its own,
  and rejection is normal flow, not a failure.

- **Law 6 — observable by design.** Every run produces at least a Mission ID, Pipeline Version,
  Stages Executed, Duration, Evidence Used, Human Decisions, and Final Outcome. This is what makes
  the platform *manageable* rather than merely *runnable*: an operator can see every run, and Book
  G (Analytics) can consume the record without the core having to change.

Take the six laws together and you have the definition of an enterprise platform: one process,
reproducible, single-responsibility, evidence-safe, human-gated, and fully recorded. That is the
managed platform Book F specifies. It is not a bigger pile of features than a bundle of tools; it
is the *same* capabilities, run through a process an enterprise can trust.

**The pipeline is the books in order.** The canonical pipeline — Mission → Planner → Memory →
Generation → Scoring → Explanation → Human Review → Revision → Approve — is not a new invention
layered over the books; it *is* the books, arranged in sequence. Each stage is owned by a book, and
Book F owns only the arrows between them:

| Pipeline stage | Owned by | What runs |
|----------------|----------|-----------|
| Mission | Book A workflow | the mission's shape and entry (✅ `mission.ts:79`) |
| Planner | roadmap contract | decompose the goal into a plan (❌ `engines.ts:18`) |
| Memory | Book D evidence | read immutable context and evidence (🔶) |
| Generation | Book B production | draft the brief, creative, campaign (✅ / 🔶 engine) |
| Scoring | Book E judgement | evaluate the draft (🔶 / ❌) |
| Explanation | Book C explanation | produce the rationale (🔶) |
| Human Review → Revision / Approve | Book A + the human | the gate (✅ `requestApproval` / `approve`) |

Read that table and the synthesis is concrete: orchestration is the ordering of the six books, and
nothing more. Book F contributes the sequence, the determinism, the record, and the gate discipline
— the columns are entirely owned by A–E. This is what "no new intelligence" means in practice: the
value of the pipeline is *which book runs, and when*, and that is the only thing Book F decides.

---

## 3. Unifying the two orchestrations — the concrete throughline

The synthesis is not abstract. AdOS today contains **two** orchestrations, and they are
disconnected. The managed platform is what you get when they become one. This is the single most
important concrete fact in Book F, so it is stated here without softening.

**The shipped orchestration (✅).** There is a real, manual, route-driven, human-gated mission
workflow. A dispatcher (`apps/web/src/routes.ts:732-768`) routes actions in pipeline order —
brief → approve → creative → approve → campaign → approve → analytics → executive → learn — over a
real Mission state machine (`domains/agency-os/src/mission/mission.ts:79`). Each handler reloads
the mission and guards on its status and prior artifacts. This works. It is what runs in the live
app. But its sequencing is **procedural**: a human clicks each step, and there is no engine driving
the order. The workflow is a sequence of independent service calls that a person walks through by
hand.

**The governed orchestration (🔶).** There is also a governed runtime pipeline —
`AIManager.runExecute` (`packages/ai-manager/src/runtime/manager.ts:156`) — whose header names it
"the single AI Pipeline" (`manager.ts:71`). It runs an ordered sequence of single-responsibility
stages: safety-in (`manager.ts:172`), context build (`manager.ts:179`), tool validation
(`manager.ts:184`), evidence gather (`manager.ts:203`), confidence assess (`manager.ts:209`),
route (`manager.ts:216`), inference with validate/repair (`manager.ts:229-253`), safety-out
(`manager.ts:256`), constitution (`manager.ts:261`, which throws if the verdict does not pass),
response (`manager.ts:276`), decision journal (`manager.ts:290`), monitoring/events/learning
(`manager.ts:304-317`), and brain enrichment (`manager.ts:320`). It seals a frozen
`ExecutionTrace` and returns it (`manager.ts:334`). This is the pipeline the First Law describes.
But it is instantiated **only in tests** (`walking-skeleton.test.ts:94`,
`integration.test.ts:27`). Its intended end-to-end sequence — the canonical walking-skeleton
sequence of Mission → Company Brain → Executive Memory → Context → local model → Validation →
Constitution → Decision Journal → Event Bus → CompanyBrain.enrich() — is documented in the
walking-skeleton test header. No live path calls it.

**The bypass (✅ — and this is the honest confirmation the First Law is unmet).** The live app does
not run the governed pipeline. `createAIManager` (`apps/web/src/ai-factory.ts:23`) builds either an
`OfflineAIManager` (`ai-factory.ts:27`) or a `LiveAIManager` (`ai-factory.ts:39`), and `App`
injects that single manager into every service (`apps/web/src/app.ts:71`). `LiveAIManager.submit`
(`apps/web/src/ai-live.ts:34`) builds messages, calls the engine, extracts JSON, and takes one
repair turn (`ai-live.ts:49-67`) — with **zero** governed stages. No evidence, no context, no
safety, no constitution, no journal, no learning. The governed pipeline exists; the live app
routes around it.

**The unification.** The managed platform is exactly this: make the governed `AIManager` pipeline
(`manager.ts:156`, the walking-skeleton canonical sequence) the **engine** behind the shipped
mission workflow (`routes.ts:732-768`), replacing the `LiveAIManager` bypass (`ai-factory.ts:39`).
The orchestrator ports the governed pipeline depends on — the router, context builder, safety,
validation, learning, event publisher, monitoring, and the evidence, confidence, constitution,
decision-memory, and company-brain contracts (`packages/ai-manager/src/ports.ts`, wired only in
tests → 🔶) — get wired for real through the composition root, `App` (`apps/web/src/app.ts:45`),
which already constructs every service over one shared event bus and repository bundle. When those
ports are satisfied in production and the mission workflow calls the governed pipeline instead of
the bypass, the two orchestrations become one, and the First Law is met.

That is the whole platform in one sentence: the manual workflow supplies the *shape* and the human
gates; the governed pipeline supplies the *engine*; the composition root wires them together.
Today they are two things. The managed platform is when they are one.

---

## 4. Honest status — this is the design, not a current capability

This document is a synthesis of what the six books specify, and it is a **design**, not a shipped
claim. The candid status must be stated in full, because everything above describes a platform that
does not yet run end-to-end.

**The unified pipeline does not run live today.** Concretely:

- **The First Law is unmet.** Components do not all execute inside one pipeline. Services are
  called directly from routes, and `LiveAIManager` (`ai-factory.ts:39`, `ai-live.ts:34`) bypasses
  every governed stage. "No component executes outside the orchestration pipeline" is the target
  state, not the current one.
- **The governed pipeline is unwired.** `AIManager.runExecute` (`manager.ts:156`) is real and
  tested, but it is instantiated only in tests (`walking-skeleton.test.ts:94`,
  `integration.test.ts:27`). Its ports (`ports.ts`) are satisfied only in tests. The rich
  `ExecutionTrace` (`kernel.ts:136-145`) it seals is never produced live because the app never
  calls `manager.execute`.
- **The Planner is roadmap.** There is a contract — `decompose(goal, context): Promise<Plan>`
  (`packages/cognitive-core/src/engines.ts:18`) and `ExecutionPlannerPort` (`engines.ts:57`) — but
  it is never imported in `apps/web`. Sequencing today is procedural: a human drives the order.
  The dashboard's `nextStep()` (`routes.ts:74`) is a static UI hint, not a planner. ❌ ROADMAP.
- **Recovery is destructive.** Gate rejection and cancellation call `mission.fail()`
  (`mission.ts:209`) via `gateReject` (`routes.ts:885`) and `cancelMission` (`routes.ts:766`),
  moving the mission to a terminal `failed` state with no reopen. Human rejection — which Law 5
  says is normal flow — is modelled today as a terminal failure, which violates Law 5.

So **"A–F as one managed platform" is the design the six books specify — not a capability AdOS has
today.** The shipped reality is a manual human-gated workflow that works, running alongside a
governed pipeline that is fully built and fully tested but wired only in tests. The synthesis is
real as a specification and honest as a status.

**The wiring throughline (the build order, stated honestly).** The path from what ships today to
the managed platform is a sequence, and the order matters:

1. **Wire the governed pipeline as the live engine.** Satisfy the orchestrator ports
   (`ports.ts`) through the composition root (`app.ts:45`) in production and make the mission
   workflow (`routes.ts:732-768`) call `AIManager.runExecute` (`manager.ts:156`) instead of the
   `LiveAIManager` bypass (`ai-factory.ts:39`). This is the step that meets the First Law and turns
   two orchestrations into one. It comes first because nothing else matters until every component
   runs inside the pipeline.
2. **Add the planner.** Import and wire the `ExecutionPlannerPort` contract (`engines.ts:57`) so
   the pipeline's order is produced by a planning stage rather than by a human clicking each step.
   Until step 1 is done there is no pipeline for a planner to plan, which is why it is second.
3. **Make recovery non-destructive.** Replace the gate-reject → `mission.fail()` path
   (`routes.ts:885` → `mission.ts:209`) with a normal `Review → {Approved | Revision}` branch, so
   human rejection is normal flow and not a terminal failure. This makes the human gate a
   first-class stage in fact, not just in design (Law 5).
4. **Surface the run-record.** Produce and expose the frozen `ExecutionTrace` (`kernel.ts:136-145`)
   from live runs — Mission ID, Pipeline Version, Stages Executed, Duration, Evidence Used, Human
   Decisions, Final Outcome — so every run is observable in fact (Law 6) and Book G can consume it.

Each step is discrete, local, and offline. None of them adds new intelligence; each of them wires
existing capability into the one managed process.

---

## 5. Governance — what the platform builds on, and what builds on it

Orchestration is not the top of the stack, and it is not the bottom. It sits inside a governance
frame and beneath an ecosystem, and the managed platform is defined as much by those boundaries as
by its own pipeline.

**Orchestration builds ON, and is governed BY, the bizops governance layer.** The pipeline runs
inside a release and operational governance frame that is not part of Book F and that Book F does
not own. How a change to the core is proposed, reviewed, released, and rolled back is the subject
of the business-operations governance layer — see
[`../../bizops/RELEASE_GOVERNANCE.md`](../../bizops/RELEASE_GOVERNANCE.md). Orchestration is a
governed subsystem: it executes under that layer's rules, and the wiring throughline in §4 is
itself a set of changes that must move through that governance, not around it.

**Book G (Analytics) and Book H (Marketplace) build ON TOP of the A–F core and must not change
it.** The managed platform is the A–F core operating system. Two further books build on it, and
their boundaries are strict:

- **Book G — Analytics.** Analytics **shows, it does not decide.** It consumes the observable run
  record that Law 6 requires — Mission ID, Pipeline Version, Stages Executed, Duration, Evidence
  Used, Human Decisions, Final Outcome — and turns it into insight. It reads the record; it never
  changes a stage, a gate, or an evidence item. Analytics is a consumer of the core, downstream of
  the pipeline, and it holds no decision authority.
- **Book H — Marketplace.** The Marketplace is **ecosystem, not core.** It extends AdOS with an
  ecosystem of components around the operating system; it does not modify A–F. Nothing in the
  marketplace may reach into the core pipeline and change how a stage runs, how evidence is kept,
  or how the human gate behaves.

The principle underneath both boundaries is that the A–F core is fixed. G and H are additive:
Analytics observes it and Marketplace surrounds it, but neither reaches in. This is what keeps the
operating system stable enough for an agency to build a business on — the core does not shift under
the layers built on top of it.

---

## 6. The core boundary principle the whole series shares

Every book in this series shares one ordering principle, and Book F completes it. The principle is:

> **First data, then evidence, then judgement, then human decision.**

Book D turns data into **evidence** — immutable, the trust layer. Book E turns production into
**judgement** — scoring and taste. Book C makes the judgement **explainable**. Book A shapes the
work, and Book B produces it. And across all of them, the **human decision** is terminal: the
machine proposes, the person disposes, and no gate is ever crossed automatically. Data does not
skip ahead of evidence; evidence does not skip ahead of judgement; judgement does not skip ahead of
the human.

Book F adds exactly one clause to that shared principle, and it is the clause that makes the others
a *system* rather than a list:

> **…and run the right component in the right order.**

That clause is the whole contribution of Book F. It invents nothing new — no data, no evidence, no
judgement, no decision. It sequences what the other books already own, under one process, with one
record and one gate. First data, then evidence, then judgement, then human decision — *run in the
right order, by the right component, every time.* That is orchestration, and it is the last clause
the series needed.

---

## 7. Boundaries (unchanged, and reaffirmed at the close)

The managed platform does not relax a single boundary of the series. It reaffirms them:

- **100% local, offline-first.** The platform runs on the agency's own machine. No cloud, no API,
  no telemetry, no connectors. The unification in §3 wires local components to local components;
  it opens no network path.
- **Copy only, no external data.** Orchestration moves and sequences the agency's own artifacts. It
  ingests no external data and it emits no vendor telemetry. Book F adds no new source of data,
  because it adds no new intelligence.
- **Human-sovereign.** The human gate is a first-class stage that never auto-approves (Law 5). The
  platform never crosses a gate on its own. Even fully wired, the operating system proposes and
  records; the person decides.
- **Evidence immutable.** The orchestrator reads, routes, and sequences evidence but never edits it
  (Law 4). The trust layer is preserved through every stage of the pipeline.
- **No new intelligence.** Book F orchestrates B/C/D/E. It coordinates; it does not create. There
  is no capability in Book F that does not already live in another book.

---

## 8. The six laws, recapped

The managed platform is the six laws, working together, over the six books:

1. **First Law — no component executes outside the orchestration pipeline.** (Target state; unmet
   today — the bypass at `ai-factory.ts:39` confirms it.)
2. **Law 2 — orchestration is deterministic.** Same Mission + Same Context + Same Memory → the same
   pipeline, the same order.
3. **Law 3 — every stage has one responsibility.** One job per stage; no stage takes another's.
4. **Law 4 — the orchestrator never changes evidence.** Read, route, sequence — never edit.
5. **Law 5 — the human gate is a first-class stage, not an exception.** `Review → {Approved |
   Revision}`, both normal flow. (Violated today by the destructive `fail()` recovery path.)
6. **Law 6 — observable by design.** Every run produces its record; Book G consumes it.

And beneath all six, the invariant that closes Book F as it opened it:

> **Orchestration coordinates intelligence; it does not create intelligence.**

---

## 9. Value contribution

A single deterministic, observable, human-gated pipeline turns six disconnected capabilities into
one manageable process. That is the value, and it lands on both sides of the ledger.

**It reduces production time.** Every hand-wired call between subsystems is a place where the order
can be wrong, evidence can be dropped, a gate can be skipped, and a run can go unrecorded — and
every one of those is rework. A single managed pipeline that runs the right component in the right
order, keeps evidence immutable, and records every run removes that class of error and the rework
that follows it. The operational risk of running five subsystems by hand becomes the operational
routine of running one process.

**It increases agency revenue.** An orchestrated core operating system is what makes AdOS a
**manageable enterprise platform** rather than a bundle of tools. An agency can trust a platform it
can reproduce, audit, and see — and can scale a business on it. A bundle of tools is bought once; a
platform an enterprise can build on is what an agency stakes its growth on. The synthesis of A–F
into one managed operating system is the difference between the two, and Book F is the layer that
makes the difference.

The point of the whole synthesis, stated once more: Book F adds no new intelligence. It makes the
five intelligences into one platform. That — not a new capability — is what turns AdOS from a set
of tools into the Enterprise AI Operating System for Advertising.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
