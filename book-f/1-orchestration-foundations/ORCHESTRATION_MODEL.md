# The Orchestration Model

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`AI_ORCHESTRATION_CONSTITUTION.md`](AI_ORCHESTRATION_CONSTITUTION.md).
>
> **Laws:** *No component executes outside the orchestration pipeline · orchestration is
> deterministic · every stage has one responsibility · the orchestrator never changes evidence ·
> the human gate is a first-class stage, not an exception · observable by design.*

---

## 1. What this document answers

The governing document declares the laws. This document answers a narrower, more concrete
question: **what does "orchestration" actually mean inside AdOS today, and what is the model we
are building toward?**

AdOS — the Enterprise AI Operating System for Advertising — is assembled from five capability
layers. Book B produces creative. Book C explains it. Book D remembers what performed. Book E
judges quality. Book A frames the workflow. Each is real. None of them, on its own, *runs* the
others. Orchestration is the layer that runs them: the managed process that engages the right
capability at the right moment, in a fixed order, under human control.

The single most important fact to hold while reading this document is that **AdOS has two
orchestrations, and they are disconnected.** One is shipped and drives the live product but is
coarse and manual. The other is a governed engine, fully built, but wired only in tests. Book F
is the design that unifies them. This document is where that split is described in full, because
every other document in Book F builds on understanding it.

> **Orchestration coordinates intelligence; it does not create intelligence.**

That sentence is the invariant. The orchestration layer selects, sequences, and gates the
intelligence that Books B/C/D/E already provide. It never invents a new capability, never
substitutes its own judgement for theirs, and never edits their output. When we say "unify the
two orchestrations," we mean *rewire coordination* — not add a sixth kind of intelligence.

---

## 2. Two orchestrations, one product

Below is the whole of it, stated plainly before we go deep. Everything else in this document
expands these two rows.

| | Live mission workflow | Governed runtime pipeline |
|---|---|---|
| **Tier** | ✅ SHIPPED | 🔶 BUILT (UNWIRED) |
| **What drives it** | A human clicking each action | A single engine running stages in order |
| **Sequencing** | Procedural — guards in route handlers | Ordered — one method, fixed stage list |
| **Governance stages** | None | Safety, evidence, confidence, constitution, journal, learning |
| **Output record** | Thin per-artifact provenance | A frozen `ExecutionTrace` |
| **Where it runs** | `apps/web` (the real product) | Tests only |

Both are, honestly, *orchestration*. The first sequences real work end to end. The second
sequences governed AI execution stage by stage. They do not know about each other. The goal of
Book F is to make the second the engine that lives *behind* the first.

---

## 3. Orchestration #1 — the manual mission workflow (✅ SHIPPED)

This is the orchestration that ships in the product today. It is real, it works, and it runs a
genuine end-to-end advertising process. It is also coarse and entirely human-driven.

### 3.1 The shape of it

Every mission action arrives at a single dispatch point (✅) — `apps/web/src/routes.ts:732-768`,
where the action is read from the URL segment (`action = seg[1]`). The actions, in pipeline
order, are:

- **brief** (`routes.ts:742`) → `generateBrief` (`routes.ts:899`) → `app.briefs.generate`
  (`routes.ts:921`) → `missions.plan` then `requestApproval('strategy_and_budget')`
  (`routes.ts:939-940`).
- **approve** (`routes.ts:743`) → `gateApprove`.
- **reject** (`routes.ts:744`) → `gateReject` (`routes.ts:885`) → `missions.fail`.
- **creative** (`routes.ts:747`) → `generateCreative` (`routes.ts:946`) →
  `app.creative.generate` → `requestApproval('creative_assets')` (`routes.ts:975`).
- **campaign** (`routes.ts:752`) → `generateCampaign` (`routes.ts:981`) → `app.campaigns.draft`
  → `requestApproval('campaign_launch')` (`routes.ts:1011`).
- **analytics** (`routes.ts:757`) → `generateReport` (`routes.ts:1016`).
- **executive** (`routes.ts:760`) → `generateExecutive` (`routes.ts:1055`), idempotent
  (`routes.ts:1064`).
- **learn** (`routes.ts:763`) → `recordLearning` (`routes.ts:1092`) → journal / executive
  memory / brain (`routes.ts:1118-1170`) → `startExecuting` then `complete`
  (`routes.ts:1180-1181`).
- **cancel** (`routes.ts:766`) → `cancelMission` → `missions.fail`.

Read that list as the human sees it: brief → approve → creative → approve → campaign → approve →
report → executive → learn. It is a full agency mission, and it is orchestration in the truest
practical sense — each capability is engaged in the correct order and nothing runs before its
prerequisites exist.

### 3.2 Why it is "procedural," not "engine-driven"

The critical property of this orchestration is *how* the order is enforced. There is no engine
that reads a plan and drives the sequence. Instead, **each handler reloads the mission and guards
on status and prior artifacts** before it will act (`routes.ts:952,988,1022`). The `creative`
handler refuses to run until a brief exists and the strategy gate is approved; the `campaign`
handler refuses until creative exists; and so on. The order is real, but it is enforced *one
handler at a time*, defensively, by preconditions.

The consequence: **the sequencing lives in the human's clicks.** A person advances the mission by
choosing the next action. The route guards prevent illegal moves, but they do not *drive*
forward motion. There is no component whose job is "decide and execute the next stage." This is
why we call it procedural orchestration — coarse-grained, manual, and correct.

### 3.3 The state machine underneath (✅ SHIPPED)

The workflow stands on a real state machine — `Mission` (`domains/agency-os/src/mission/mission.ts:79`).
Its states run submitted → planning → awaiting_approval → executing → completed | failed, with
transitions `plan()` (`mission.ts:172`), `requestApproval(gate)` (`mission.ts:179`),
`approve(gate)` (`mission.ts:188`), `startExecuting()` (`mission.ts:195`), `complete()`
(`mission.ts:202`), and `fail(reason)` (`mission.ts:209`, destructive and terminal — no reopen);
invalid transitions are rejected (`mission.ts:218`). Approval gates default to
`['strategy_and_budget','campaign_launch']` (`mission.ts:110`); the live workflow uses three (it
adds `creative_assets`). Lifecycle events are emitted at `mission.ts:51-71`.

This machine is what makes the human gates first-class in practice: the mission cannot slip from
`awaiting_approval` to `executing` without an explicit `approve`. The human is sovereign at every
gate. (One honesty note carried forward from the governing document: today gate reject and cancel
both route to the destructive `fail()` at `routes.ts:886,893`, modelling a human *revision*
request as a terminal *failure*. That is a known law violation, owned and fixed elsewhere in
Book F; the mission machine and gates themselves are shipped and sound.)

---

## 4. Orchestration #2 — the governed runtime pipeline (🔶 BUILT-UNWIRED)

The second orchestration is a different thing entirely: a single engine that runs a governed,
ordered sequence of stages for one AI execution and produces a sealed record of everything it
did. It is fully built. It is instantiated only in tests. The live product never calls it.

### 4.1 The engine and its stages

The engine is `AIManager.runExecute` (`packages/ai-manager/src/runtime/manager.ts:156`). The
header calls it "the single AI Pipeline" (`manager.ts:71`). Its stages run in a fixed order, each
performing exactly one responsibility:

1. **safety-in** (`manager.ts:172`) — screen the request.
2. **context build** (`manager.ts:179`, `context.build`) — assemble Book D context.
3. **tool validation** (`manager.ts:184`).
4. **evidence** (`manager.ts:203`, `evidence.gather`) — pull Book D performance evidence.
5. **confidence** (`manager.ts:209`, `confidence.assess`).
6. **route** (`manager.ts:216`, `router.route`) — select the model path.
7. **inference + validate/repair** (`manager.ts:229-253`) — generate, then repair up to
   `maxValidationRetries` (default 1 at `manager.ts:89`).
8. **safety-out** (`manager.ts:256`).
9. **constitution** (`manager.ts:261`) — throws if `!verdict.passed`.
10. **response** (`manager.ts:276`).
11. **decision journal** (`manager.ts:290`, `decisions.record`).
12. **monitoring + events + learning** (`manager.ts:304-317`, `learning.observe`), then **brain
    enrich** (`manager.ts:320`, `brain.experience.record`, only when a `vertical` is present).

Submission enters at `submit()` (`manager.ts:92`). The intended end-to-end sequence is documented
in the walking-skeleton test header (Mission → Company Brain → Executive Memory → Context → local
model → Validation → Constitution → Decision Journal → Event Bus → CompanyBrain.enrich()).

Every one of those governance stages is a coordination step over an *existing* book — Book D
evidence and context, Book C/E-adjacent safety and constitution checks, Book D learning and
brain enrichment. The engine adds no new intelligence; it engages the intelligence that already
exists, in order, and records the result.

### 4.2 The frozen record

The pipeline's output is a rich `ExecutionTrace`, built by `TraceBuilder`
(`packages/ai-manager/src/runtime/kernel.ts:204`). Its fields (`kernel.ts:136-145`) include
`contextRefs`, `evidence`, `confidence`, `decisionJournalId`, `eventsProduced`,
`knowledgeEnriched`, and `steps[]`, alongside prompt, temperature, mission, session, and
capability. The trace is `seal()`-ed to a frozen object and returned from `execute()`
(`manager.ts:334`). This is the shape of a fully observable run — and it is never produced in the
live product, because the app never calls `manager.execute`. That makes it 🔶.

### 4.3 Instantiated only in tests

The engine's governance dependencies are optional (`AIManagerDeps`, `manager.ts:55-66`), and the
engine is instantiated only in tests — `packages/ai-manager/src/runtime/walking-skeleton.test.ts:94`
and `packages/ai-manager/src/runtime/integration.test.ts:27`. The runtime's own lifecycle events
`ai.task.submitted/completed/failed.v1` (`manager.ts:168/308/338`) are subscribed to only by the
walking-skeleton test. The pipeline is proven correct by tests and unreachable by users. That is
the precise meaning of BUILT (UNWIRED).

---

## 5. The bypass — how the live app avoids the pipeline (✅ SHIPPED)

If the live workflow does not use the governed pipeline, what *does* it use for AI? The bypass is
shipped and worth naming exactly, because it is the concrete proof that the First Law is not yet
met.

**FIRST LAW — No component executes outside the orchestration pipeline.**

Today that law is violated. Startup wires AI through a factory: `apps/web/src/main.ts:43` calls
`createAIManager` (`apps/web/src/ai-factory.ts:23`), which returns either `OfflineAIManager`
(`ai-factory.ts:27`) or `LiveAIManager` (`ai-factory.ts:39`). The composition root injects this
single `AIManagerPort` into every service (`apps/web/src/app.ts:71,84-88`).

Neither of those managers runs a governed stage. `LiveAIManager.submit`
(`apps/web/src/ai-live.ts:34`) builds messages, calls `engine.complete`, runs `extractJson`, and
takes one repair turn if needed (`ai-live.ts:49-67`) — a single-shot generation with **zero**
governed stages: no context build, no evidence, no confidence, no safety, no constitution, no
decision journal, no learning. `OfflineAIManager.submit` (`apps/web/src/ai.ts:16`) returns
deterministic canned JSON (`ai.ts:36-54`) and does even less.

So the live product generates content through a path that skips every governance stage the
governed pipeline was built to enforce. The mission workflow (Orchestration #1) calls services,
and those services call this bypass — never `manager.ts:156`. The two orchestrations run in the
same repository and never meet.

---

## 6. The composition root — where the two could be joined

The two orchestrations already share a spine, which is why unifying them is a wiring problem and
not a rewrite. That spine is the composition root.

`App` (`apps/web/src/app.ts:45`) is the composition root (✅). It constructs every service over one
shared `EventBus` and one shared `RepositoryBundle` (`app.ts:69-92`); `main.ts` injects the SQL
repositories and the AI manager in production. Every service in the product is built here, over
the same event bus and the same repositories, and every one receives the same single
`AIManagerPort`. There is exactly one seam through which AI flows into the whole application.

That single seam is the leverage point. Today it is filled by `LiveAIManager` / `OfflineAIManager`
(the bypass). The governed pipeline exposes a matching contract: it consumes a set of orchestrator
ports — `packages/ai-manager/src/ports.ts` (`ModelRouterPort`, `ContextBuilderPort`,
`SafetyEnginePort`, `ValidationEnginePort`, `LearningEnginePort`, `AiEventPublisherPort`,
`MonitoringPort`, and more) plus the contracts imported at `manager.ts:12-33` (`EvidenceEnginePort`,
`ConfidenceEnginePort`, `AIConstitutionCheckerPort`, `DecisionMemoryPort`, `CompanyBrainPort`).
These ports are wired **only in tests** (🔶). Providing live implementations for them and
constructing the governed `AIManager` at the composition root — so the single injected
`AIManagerPort` *is* the governed pipeline — is the core Book F build.

Stated as a design intent: the mission workflow keeps its shape (the human still gates every
step), but every AI action it triggers runs *through* `manager.ts:156` instead of around it. When
that is true, the First Law holds: no component executes outside the orchestration pipeline.

---

## 7. The goal — unify them into one governed engine

The heart of Book F is this: **make the governed pipeline the engine behind the mission
workflow.** Neither orchestration is discarded.

- The **mission workflow** (✅) keeps human sovereignty and the end-to-end shape: brief → approve
  → creative → approve → campaign → approve → report → executive → learn, on the shipped mission
  state machine.
- The **governed pipeline** (🔶) becomes the mechanism that executes each AI action *within* that
  shape — every generation passing through safety, context, evidence, confidence, routing,
  constitution, journalling, and learning, and emitting a frozen `ExecutionTrace`.

The value of doing this is direct. A single deterministic, observable, human-gated pipeline turns
six disconnected capabilities into one manageable process. It removes the class of risk that comes
from ungoverned single-shot generation, cuts the rework that comes from unexplained or
unvalidated output (production time), and makes AdOS an enterprise-manageable platform an agency
can trust and scale on (revenue). Coordination — not new intelligence — is what produces that
value.

Two boundaries govern the whole effort. Orchestration coordinates B/C/D/E; **it adds no new
intelligence** — it does not generate creative, does not score, does not explain, does not
remember. And the whole platform stays 100% local, offline-first, copy-only, and human-sovereign:
no cloud, no external API, no telemetry, no connectors, and a human gate that is first-class and
never auto-approves.

---

## 8. Determinism as a property of a fixed pipeline

**LAW 2 — Orchestration is Deterministic.** Same Mission + Same Context + Same Memory → Same
Pipeline, same stage order. This law is not an aspiration bolted onto the design; it is a
*consequence* of the shape both orchestrations already have.

The governed pipeline runs a **fixed, ordered stage list** — the twelve stages of §4.1, in one
method (`manager.ts:156`), always in the same sequence. There is no branch where the engine
inspects intermediate output and chooses a *different* sequence of stages. Because the order is
fixed in code rather than decided at runtime, the same inputs traverse the same path every time.
A fixed pipeline is inherently reproducible.

This is the deliberate contrast at the centre of Book F's identity:

- An **autonomous agent** decides its own next step. It observes state, reasons about what to do,
  and self-selects a path that can differ run to run. Its trajectory is emergent.
- A **deterministic orchestrator** never self-selects. The path is declared once. Routing *within*
  a stage (for example, `router.route` at `manager.ts:216` choosing a model) selects a *provider
  for a fixed step* — it does not reorder or skip stages.

**Book F is deterministic orchestration, not an autonomous agent.** This is a chosen constraint,
and it is what makes the platform enterprise-trustworthy: an agency can predict, reproduce, and
audit exactly what happened, because the process cannot quietly reshape itself.

The shipped workflow already exhibits the same determinism at the coarse level. The mission
machine (`mission.ts:79`) permits only declared transitions and rejects everything else
(`mission.ts:218`); the route guards (`routes.ts:952,988,1022`) admit only the legal next action.
No handler improvises a different order. Unification carries this determinism down from the
mission granularity into each AI execution.

A note on a planner. A component that could compute the sequence exists as a contract only —
`decompose(goal, context): Promise<Plan>` (`packages/cognitive-core/src/engines.ts:18`),
`ExecutionPlannerPort` (`engines.ts:57`), `CognitiveCore` (`engines.ts:76`) — but it is never
imported in `apps/web`, so it is ❌ ROADMAP. The dashboard's `nextStep()` (`routes.ts:74`) is a
static UI hint, not a planner. Determinism today comes from the *fixed* pipeline, not from a
planner that reasons about order. Even when a planner arrives, Law 2 requires that the same inputs
yield the same plan — determinism is preserved, never traded away for autonomy.

---

## 9. The "no new intelligence" principle

This deserves its own statement because it is the boundary that keeps Book F honest and keeps it
from bloating into a redesign of the books it coordinates.

> **Orchestration coordinates intelligence; it does not create intelligence.**

Concretely, each governed stage is a *coordination* of an existing capability:

- context build and evidence (`manager.ts:179,203`) **read** Book D's memory — they do not
  compute new performance data.
- routing (`manager.ts:216`) **selects** among existing model paths — it does not invent a model.
- constitution and safety (`manager.ts:256,261`) **check** against existing rules — they do not
  author judgement.
- decision journal, learning, and brain enrich (`manager.ts:290,304-317,320`) **record and feed
  back** — they do not manufacture insight.

This is the sibling to Book E's "no new data." Book F's rule is "no new intelligence, only
orchestration." The orchestrator's value is entirely in *when* and *in what order* it engages the
intelligence layers, and in the fact that it never lets any of them run unobserved or ungoverned.

A companion boundary, from Law 4 (the orchestrator never changes evidence): the pipeline may read,
route, and sequence Book D evidence, but it never edits it. Coordination is read-and-arrange, not
rewrite. That is what preserves the trust layer while the pipeline moves data between stages.

---

## 10. Book boundaries

To keep this model precise, the following stay outside it:

- **Books B/C/D/E** own their intelligence. Book F references them and engages them in order; it
  does not re-document or redesign them. Production, explanation, performance memory, and creative
  judgement are theirs.
- **Book A** owns the human-facing workflow framing; Book F provides the engine that runs it.
- **Books G and H** (Analytics — "shows, does not decide"; Marketplace — "ecosystem, not core")
  build *on top of* the A–F core and must not change it. The observable records Book F produces
  are what Book G later consumes; Book F does not do analytics itself.

Within Book F, this document owns the *model* — the two orchestrations and the goal of unifying
them. It does not define the canonical stage-by-stage pipeline (that is F003), nor the individual
stages (Part 2), nor sequencing/state enforcement (F008), nor observability (F010). It sets the
frame every one of those builds on.

---

## 11. Value contribution

The orchestration model earns its place by turning six independent capabilities into one
manageable process. Concretely: replacing the ungoverned single-shot bypass (`ai-live.ts:34`)
with a governed, deterministic, observable pipeline removes the operational risk of unvalidated,
unexplained AI output and cuts the rework it causes — a direct **production-time** reduction. And
a platform whose every AI action is ordered, gated by a sovereign human, and recorded as a frozen
trace is one an enterprise agency can audit, trust, and scale on — a direct **revenue** enabler.
The intelligence already exists in Books B/C/D/E; orchestration is what makes it sellable as a
platform rather than a bag of parts.

---

## 12. Summary

- AdOS has **two orchestrations**. The ✅ manual mission workflow (`routes.ts:732-768`) drives the
  live product through human clicks, sequenced procedurally by route guards
  (`routes.ts:952,988,1022`) over a real state machine (`mission.ts:79`).
- The 🔶 governed 12-stage pipeline (`manager.ts:156`, "the single AI Pipeline" at `manager.ts:71`)
  runs full governance and seals an `ExecutionTrace` (`kernel.ts:204`) — but is instantiated only
  in tests (`walking-skeleton.test.ts:94`).
- The live app runs the **bypass** — `LiveAIManager`/`OfflineAIManager` (`ai-factory.ts:39,27`,
  `ai-live.ts:34`, `ai.ts:16`) — skipping every governed stage. This is why the **First Law — No
  component executes outside the orchestration pipeline** — is not yet met.
- They already **share a spine**: the composition root `App` (`app.ts:45`) injects one
  `AIManagerPort` over one `EventBus` and one `RepositoryBundle`. The governed pipeline's ports
  (`ports.ts`, `manager.ts:12-33`) are wired only in tests (🔶).
- **The goal** is to fill that single seam with the governed pipeline, so every AI action in the
  mission workflow runs through it. That is the core Book F build.
- Book F is **deterministic orchestration, not an autonomous agent** (Law 2): a fixed pipeline is
  inherently reproducible; the orchestrator never self-selects a different path.
- And throughout: **Orchestration coordinates intelligence; it does not create intelligence.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
