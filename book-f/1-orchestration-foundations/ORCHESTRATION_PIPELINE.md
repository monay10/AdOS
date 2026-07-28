# Orchestration Pipeline

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`./AI_ORCHESTRATION_CONSTITUTION.md`](./AI_ORCHESTRATION_CONSTITUTION.md).
>
> **Laws:** *No component executes outside the orchestration pipeline · orchestration is
> deterministic · every stage has one responsibility · the orchestrator never changes evidence ·
> the human gate is a first-class stage, not an exception · observable by design.*

---

## 1. What this document defines

This document defines **the canonical orchestration pipeline** — the fixed, ordered sequence of
stages that every AI action in AdOS is meant to travel through, from a stated Mission to an
approved outcome. It names each stage, assigns each stage exactly one responsibility, and maps
each stage to the book that supplies its intelligence and to the tier at which that intelligence
exists today.

The pipeline is the backbone of the whole platform. Everything else in Book F either feeds a
stage, sequences the stages, or observes them. This document is deliberately narrow: it draws
the pipeline, states the two laws that make it a pipeline rather than a pile of services
(*every stage has one responsibility*, *orchestration is deterministic*), and specifies the
contract each stage honours at its boundary. It does **not** re-derive how any single stage
computes its result — Generation lives in Book B, Explanation in Book C, Memory/Evidence in
Book D, Scoring in Book E. This document is the layer above them: given those capabilities,
**in what fixed order are they run, and what does each hand to the next?**

One sentence governs everything that follows, and it is stated here in full because it is the
boundary of the entire exercise:

> **Orchestration coordinates intelligence; it does not create intelligence.**

The pipeline invents no new model, no new score, no new rationale. It engages capabilities that
already exist and puts them in order. Where a stage's intelligence has not been built, the stage
is still named and still holds its place in the sequence — the order is canonical even where the
occupant is a roadmap contract.

---

## 2. The canonical pipeline

The pipeline is nine stages, always in this order:

```
Mission → Planner → Memory → Generation → Scoring → Explanation → Human Review → Revision → Approve
```

Each stage has **one** responsibility, is **owned** by exactly one book (the book that supplies
its intelligence), and exists today at exactly **one** tier. The table below is the master
index for the rest of this document.

| # | Stage | Its ONE responsibility | Owning book | Tier today |
|---|-------|------------------------|-------------|------------|
| 1 | **Mission** | Hold the intent and lifecycle state of one unit of work | Book A (workflow) | ✅ SHIPPED |
| 2 | **Planner** | Decompose the mission goal into an ordered plan | Book A (workflow) | ❌ ROADMAP |
| 3 | **Memory** | Read context and evidence for the work at hand | Book D (performance memory) | 🔶 BUILT (UNWIRED) |
| 4 | **Generation** | Produce a draft artifact | Book B (production) | ✅ SHIPPED / 🔶 governed |
| 5 | **Scoring** | Evaluate and rank the draft | Book E (creative judgement) | 🔶 / ❌ ROADMAP |
| 6 | **Explanation** | Attach a rationale to the draft and its score | Book C (explanation) | 🔶 BUILT (UNWIRED) |
| 7 | **Human Review** | Await a human decision on the drafted work | Book A (workflow) | ✅ SHIPPED |
| 8 | **Revision** | Re-enter the draft with the human's changes | Book A / Book B | ❌ design / ✅ human |
| 9 | **Approve** | Record the human's approval and advance the mission | Book A (workflow) | ✅ SHIPPED |

Read down the tier column and the central fact of Book F is visible at a glance: the pipeline's
**edges** are shipped and wired (Mission is a real state machine; Human Review and Approve are
real gates), while its **middle** — the governed intelligence stages of Memory, Scoring, and
Explanation — is built but unwired, and one stage (Planner) is contract-only. The order is
canonical. The occupancy is honest.

### 2.1 Stage-by-stage, with citations

**1 · Mission (✅ SHIPPED).** A mission is a single unit of managed work with a real lifecycle.
It is a state machine — `Mission` at `domains/agency-os/src/mission/mission.ts:79` — moving
`submitted → planning → awaiting_approval → executing → completed | failed`. Its one job is to
**hold intent and state**; it does not generate, score, or explain anything. Owned by Book A
(workflow). Detailed in Part 2's `MISSION_AND_PLANNING.md`.

**2 · Planner (❌ ROADMAP).** The planner's one job is to **decompose** a mission goal into an
ordered plan of stages. The contract exists — `decompose(goal, context): Promise<Plan>` at
`packages/cognitive-core/src/engines.ts:18`, behind `ExecutionPlannerPort` (`engines.ts:57`) —
but it is **never imported in `apps/web`**, so no planner drives the live sequence. Today the
human is the planner: they click each step in order. That makes Planner a roadmap stage — named,
placed, unbuilt in the live path. Owned by Book A.

**3 · Memory (🔶 BUILT, UNWIRED).** Memory's one job is to **read** the context and evidence the
work needs — never to write it. In the governed runtime this is two ordered steps: context build
(`context.build`) at `packages/ai-manager/src/runtime/manager.ts:179` and evidence gather
(`evidence.gather`) at `manager.ts:203`. The intelligence is Book D's (performance memory /
evidence). The stage only **reads** Book D — it obeys the law that the orchestrator never
changes evidence. Both steps exist and are tested but run only inside the governed pipeline,
which is not yet wired live → 🔶. Detailed in Part 2's `MEMORY_AND_GENERATION.md`.

**4 · Generation (✅ SHIPPED / 🔶 governed).** Generation's one job is to **produce a draft**.
This stage has two realizations. The shipped one is Book B's single-shot production, reached
through the live services (brief/creative/campaign generation). The governed one is the runtime
inference-plus-repair step at `manager.ts:229-253` (validate and repair up to
`maxValidationRetries`, default `1` at `manager.ts:89`) — built, tested, unwired → 🔶. Owned by
Book B (production).

**5 · Scoring (🔶 / ❌ ROADMAP).** Scoring's one job is to **evaluate and rank** the draft —
never to choose. The intelligence is Book E's creative judgement. In the governed runtime the
adjacent governance checks — confidence assessment (`confidence.assess`) at `manager.ts:209` and
the safety/constitution checks (`manager.ts:256`, `manager.ts:261`) — occupy this evaluative
band, and they are built-unwired (🔶); the full Book E scoring composite is roadmap where it has
no live path (❌). Owned by Book E. Detailed in Part 2's `SCORING_AND_EXPLANATION.md`.

**6 · Explanation (🔶 BUILT, UNWIRED).** Explanation's one job is to **attach a rationale** to
the draft and its score — it explains, it does not decide. The intelligence is Book C's. The
runtime carries the material for this in its frozen `ExecutionTrace` (context refs, evidence,
confidence, decision-journal id) but that trace is produced only inside the governed pipeline →
🔶. Owned by Book C. Also detailed in `SCORING_AND_EXPLANATION.md`.

**7 · Human Review (✅ SHIPPED).** Review's one job is to **await a human decision**. It is a
real gate: `requestApproval(gate)` at `mission.ts:179` moves the mission to `awaiting_approval`
and holds there. This is a **first-class stage**, not an exception — §8 develops this. Owned by
Book A (workflow).

**8 · Revision (❌ design / ✅ human).** Revision's one job is to **re-enter the draft** carrying
the human's requested changes — the non-terminal branch of Review. The human side is real (a
human can send work back), but the *non-destructive re-entry* — Review → Revision → Generation
again, without failing the mission — is a design target, not shipped behaviour. Today the reject
path calls the destructive `mission.fail()` (`mission.ts:209`) instead of looping back. So:
❌ for the non-destructive design, ✅ for the human act. Owned by Book A / Book B. Detailed in
Part 2's `REVIEW_REVISION_APPROVAL.md`.

**9 · Approve (✅ SHIPPED).** Approve's one job is to **record the human's approval** and advance
the mission. It is a real gate: `approve(gate)` at `mission.ts:188`, followed by
`startExecuting()` (`mission.ts:195`) and eventually `complete()` (`mission.ts:202`). Owned by
Book A (workflow).

---

## 3. Law — Every Stage Has One Responsibility

The most structural law of the pipeline is that **each stage does exactly one job and passes to
the next; no stage takes another stage's job.**

- Planner **plans** — it does not generate.
- Memory **reads context** — it does not draft.
- Generation **drafts** — it does not score its own work.
- Scoring **evaluates** — it does not write the rationale.
- Explanation **explains** — it does not decide.
- Review **awaits the human** — it does not auto-approve.

This is not tidiness for its own sake. Single responsibility is what makes the pipeline
*observable* and *debuggable*: when a run is wrong, exactly one stage is wrong, and its input and
output are both inspectable. It is also what keeps Book F honest about its own boundary — a stage
that both generated and scored would be *creating* intelligence (an opinion about its own
output), and this platform's founding sentence forbids that:

> **Orchestration coordinates intelligence; it does not create intelligence.**

The governed runtime is built to this law: its ordered steps each carry one verb — safety-in,
context build, evidence gather, confidence assess, route, infer, safety-out, constitution,
respond, journal, learn, enrich (see §6). None reaches into another's responsibility. Where the
live path violates single-responsibility today (for example, a route handler that both generates
and decides sequencing), Book F's design is to pull those jobs back into their own stages.

**Enforcement.** A stage boundary is a contract (§5): one typed input in, one typed output out,
no side effects into another stage's data. The clearest current enforcement of the law is
structural — the runtime's stages are separate calls through separate ports
(`packages/ai-manager/src/ports.ts`), so one stage physically cannot execute another's logic.

---

## 4. Law — Orchestration is Deterministic

The second law that makes this a pipeline is that **the stage ORDER is fixed.** Same Mission +
same Context + same Memory → same pipeline, same stage order. The orchestrator never
self-selects a different path at runtime.

The order in §2 is not a suggested flow or a common case; it is *the* sequence. There is no
runtime branch in which Scoring precedes Generation, or Explanation precedes Scoring, or Review
is skipped. The only branch the pipeline admits is the human one at Review — Approve or
Revision — and even that branch is fixed in shape (§8): both outcomes are declared, neither is a
surprise.

Determinism is what lets an agency **trust** the pipeline. A reviewer who has seen one run has
seen the shape of every run. An auditor can reason about what happened because the order of what
*could* happen is not a runtime decision. It is also what makes the pipeline reproducible: replay
the same mission with the same context and memory and the same stages fire in the same order.

Determinism is a property Book F designs *into* the orchestrator, not a claim about today's live
path. The live path is procedural: the human, not an engine, advances the sequence step by step
(§7). That is still deterministic in order — the steps only go forward, guarded — but it is
human-driven rather than engine-driven. `SEQUENCING_AND_STATE.md` in Part 3 develops how the
fixed order is enforced.

---

## 5. The stage contract

Every stage honours the same shape of contract at its boundary: **one input, one output, one
responsibility, and no reach into a neighbour's data.** The pipeline is the composition of these
contracts.

| Stage | Consumes (input) | Produces (output) |
|-------|------------------|-------------------|
| Mission | A submitted intent | A mission in a known lifecycle state |
| Planner | Mission goal + context | An ordered plan of stages |
| Memory | The plan / current step | Context + read-only evidence for the step |
| Generation | Context + evidence | A draft artifact |
| Scoring | Draft + evidence | An evaluation / ranking of the draft |
| Explanation | Draft + score + evidence | A rationale attached to the draft |
| Human Review | Draft + score + rationale | A pending human decision |
| Revision | Draft + human's requested changes | A re-entered draft (back to Generation) |
| Approve | An approved draft | An advanced mission (executing → complete) |

Two properties of this table are load-bearing:

1. **Each output is the next stage's input, and only that.** Memory's evidence flows to
   Generation and Scoring as *read-only* — the orchestrator may read, route, and sequence
   evidence but never edit it. This is the law that the orchestrator never changes evidence,
   expressed at the contract level: evidence enters the pipeline once, from Book D, and travels
   through it immutably.

2. **Human Review and Approve are on this table like any other stage.** They consume a typed
   input (the drafted, scored, explained work) and produce a typed output (a decision, an
   advance). They are **first-class stages, not exceptions** — the pipeline is not "the automated
   part plus some human gates bolted on." The human stages are *in* the sequence, with contracts,
   exactly like Generation. §8 makes this explicit; `REVIEW_REVISION_APPROVAL.md` owns it in full.

Because every boundary is one-in/one-out, a run is a chain of well-typed hand-offs — which is
precisely what makes the whole pipeline observable (Law 6) and each stage independently testable.

---

## 6. Mapping to the governed runtime's ordered stages

The canonical pipeline of §2 is the *conceptual* sequence. AdOS also contains a concrete,
built-but-unwired realization of it: the governed runtime pipeline in the AI manager, whose
header names it "the single AI Pipeline" (`packages/ai-manager/src/runtime/manager.ts:71`). Its
entry point is `AIManager.runExecute` (`manager.ts:156`), reached through `submit()`
(`manager.ts:92`). Every stage below is 🔶 BUILT (UNWIRED) — the runtime is instantiated **only
in tests** (`walking-skeleton.test.ts:94`, `integration.test.ts:27`); no live path executes it.

The runtime's ordered steps, each carrying exactly one responsibility (Law 3):

| # | Runtime step | Citation | Maps to canonical stage |
|---|--------------|----------|-------------------------|
| 1 | safety-in | `manager.ts:172` | (pre-Memory guard) |
| 2 | context build (`context.build`) | `manager.ts:179` | Memory |
| 3 | evidence gather (`evidence.gather`) | `manager.ts:203` | Memory |
| 4 | confidence assess (`confidence.assess`) | `manager.ts:209` | Scoring |
| 5 | route (`router.route`) | `manager.ts:216` | (Generation setup) |
| 6 | inference + validate/repair | `manager.ts:229-253` | Generation |
| 7 | safety-out | `manager.ts:256` | Scoring |
| 8 | constitution (throws if `!verdict.passed`) | `manager.ts:261` | Scoring |
| 9 | response | `manager.ts:276` | (Generation output) |
| 10 | decision journal (`decisions.record`) | `manager.ts:290` | (Observability) |
| 11 | learning (`learning.observe`) | `manager.ts:304-317` | (post-Approve learning) |
| 12 | brain enrich (`brain.experience.record`, only if `vertical`) | `manager.ts:320` | (post-Approve learning) |

The repair step at `manager.ts:229-253` retries validation up to `maxValidationRetries` (default
`1` at `manager.ts:89`). The governance dependencies the pipeline consumes are optional
(`AIManagerDeps`, `manager.ts:55-66`) and are declared as ports in
`packages/ai-manager/src/ports.ts` — wired only in tests, which is precisely why the whole
runtime is 🔶.

### 6.1 The canonical intended end-to-end sequence

The runtime's stage list is the *mechanism*; the **intended** end-to-end sequence — the mission's
journey through the platform — is documented in the header of `walking-skeleton.test.ts`:

```
Mission → Company Brain → Executive Memory → Context → local model →
Validation → Constitution → Decision Journal → Event Bus → CompanyBrain.enrich()
```

This is the walking skeleton of the canonical pipeline: a mission draws on the company's memory
(Company Brain, Executive Memory) to build context, runs a **local** model, is validated and
checked against the constitution, is journalled and published on the event bus, and finally
enriches the company's memory. It is the same shape as §2 — read, generate, evaluate, record —
expressed in runtime terms. That it lives in a test, and only a test, is the honest status of
the governed pipeline: the sequence is designed and demonstrated, not yet wired into the app.

---

## 7. Contrast — today's live pipeline

The pipeline that actually ships is **not** the governed runtime. It is a manual, route-driven,
human-gated sequence, and it is the ✅ SHIPPED realization of the canonical pipeline — real, but
**coarse**.

**The live sequence.** Dispatch happens at `apps/web/src/routes.ts:732-768` (`action = seg[1]`).
In pipeline order the actions are:

- **brief** (`routes.ts:742`) → `generateBrief` (`routes.ts:899`) → `app.briefs.generate`
  (`routes.ts:921`) → `missions.plan` + `requestApproval('strategy_and_budget')`
  (`routes.ts:939-940`).
- **approve** (`routes.ts:743`, `gateApprove`) / **reject** (`routes.ts:744`, `gateReject`
  `routes.ts:885` → `missions.fail`).
- **creative** (`routes.ts:747`) → `generateCreative` (`routes.ts:946`) → `app.creative.generate`
  → `requestApproval('creative_assets')` (`routes.ts:975`).
- **campaign** (`routes.ts:752`) → `generateCampaign` (`routes.ts:981`) → `app.campaigns.draft`
  → `requestApproval('campaign_launch')` (`routes.ts:1011`).
- **analytics** (`routes.ts:757`) → `generateReport` (`routes.ts:1016`).
- **executive** (`routes.ts:760`) → `generateExecutive` (`routes.ts:1055`, idempotent
  `routes.ts:1064`).
- **learn** (`routes.ts:763`) → `recordLearning` (`routes.ts:1092`) →
  `startExecuting()` + `complete()` (`routes.ts:1180-1181`).
- **cancel** (`routes.ts:766`) → `cancelMission` → `missions.fail`.

Each handler reloads the mission and guards on status and prior artifact (`routes.ts:952`, `988`,
`1022`). This maps cleanly onto §2's edges: Mission, Human Review, and Approve are all real here.
But the **middle is bypassed.** The live sequence has **no evidence stage, no scoring stage, no
explanation stage** — it goes brief → approve → creative → approve → campaign → approve → report
→ executive → learn without ever gathering evidence, scoring a draft, or attaching a rationale.

**Why the middle is missing — the bypass.** Every service receives a single `AIManagerPort`
built at `apps/web/src/ai-factory.ts:23` — either `OfflineAIManager` (`ai-factory.ts:27`) or
`LiveAIManager` (`ai-factory.ts:39`). `LiveAIManager.submit` (`apps/web/src/ai-live.ts:34`) does
exactly one thing: build messages → `engine.complete` → `extractJson` → one repair turn
(`ai-live.ts:49-67`). It runs **zero governed stages** — no context, no evidence, no confidence,
no safety, no constitution, no journal, no learning. `OfflineAIManager.submit`
(`apps/web/src/ai.ts:16`) returns deterministic canned JSON (`ai.ts:36-54`). So the live app
generates and gates, but the evidence/scoring/explanation band of the canonical pipeline is
short-circuited at the manager boundary.

**The honest reading.** The order is right and the human gates are real — the live pipeline is a
faithful, *coarse* projection of the canonical one. What it lacks is the governed middle. Book F
is the design to close that gap: make the governed pipeline (§6) the engine behind the live
mission workflow, so Memory, Scoring, and Explanation stop being bypassed. Sequencing today is
**procedural** — the human clicks each step; no engine drives it — which is why the two laws of
this document (single responsibility, fixed order) are met in *shape* but enforced by convention
rather than by an orchestrator. `SEQUENCING_AND_STATE.md` and `PLATFORM_ORCHESTRATION.md` carry
the wiring throughline.

---

## 8. Human Review and Approve are first-class stages

The pipeline does not end at Explanation and then "hand off to a human" as an afterthought. Human
Review, Revision, and Approve are **stages** — numbered, contracted (§5), and in the fixed order
(§4) like every other stage.

- **Human Review** consumes the drafted, scored, explained work and produces a pending decision.
  It is `requestApproval(gate)` (`mission.ts:179`), holding the mission at `awaiting_approval`.
- **Approve** records the decision and advances: `approve(gate)` (`mission.ts:188`).
- **Revision** is the non-terminal branch: send the work back for another pass, re-entering
  Generation with the human's changes.

Modelling the human as a first-class stage has a concrete consequence: **the pipeline has two
normal outcomes at Review — Approved and Revision — and neither is an error.** A human sending
work back is normal flow, not a failure of the run.

This is where today's live path is honestly short of the design. The reject and cancel actions
route to the **destructive** `mission.fail()` (`routes.ts:886`, `routes.ts:893`;
`mission.ts:209`), which drives the mission to a terminal `failed` state with no reopen. That
models a human's "revise this" as a *terminal failure* of the mission — the opposite of a
first-class Revision branch. The canonical design is Review → { Approved | Revision }, both
normal. `REVIEW_REVISION_APPROVAL.md` (Part 2) owns this stage and this correction in full; it is
previewed here so the pipeline's shape is complete: nine stages, the last three of them human.

The human gate **never auto-approves.** Human sovereignty is a property of the pipeline itself,
built into the order: no stage after Explanation runs without a human decision.

---

## 9. No new intelligence — the pipeline coordinates, it invents nothing

It is worth stating plainly what the pipeline is *not*. It is not a model. It is not a scorer. It
is not an explainer. It holds none of its own intelligence. Every stage's intelligence belongs to
a book that already documents it:

- Generation's intelligence is **Book B**'s production engine.
- Memory's intelligence is **Book D**'s performance memory and evidence.
- Scoring's intelligence is **Book E**'s creative judgement.
- Explanation's intelligence is **Book C**'s rationale.
- Mission, Planner, Review, Revision, and Approve are **Book A** workflow, sequenced by Book F.

Book F's contribution is the *order* and the *hand-offs* — the coordination — and nothing more:

> **Orchestration coordinates intelligence; it does not create intelligence.**

This is the sibling of the boundary the other books draw for themselves. Where Book E adds "no
new data," Book F adds "no new intelligence, only orchestration." When a stage's engine does not
yet exist (Planner, ❌), the pipeline does not fill the gap with an improvised heuristic — it
names the stage, holds its place, and marks it roadmap. The pipeline's value is entirely in
running existing capabilities in a fixed, observable, human-gated order. It engages the right
intelligence layer at the right time; it originates no intelligence of its own.

---

## 10. Boundaries

The pipeline runs entirely within the platform's standing boundaries:

- **100% local, offline-first.** Every stage runs on the local machine. Generation runs a local
  model (§6.1); Memory reads the agency's own performance memory; no stage calls a cloud service,
  external API, or connector.
- **Copy only, no external data.** The pipeline moves the agency's own artifacts and evidence. It
  ingests no third-party data and emits no vendor telemetry.
- **Human-sovereign.** Human Review and Approve are first-class stages that never auto-approve
  (§8). No outcome is finalized without a human decision.
- **Orchestrates, does not redesign.** Book F references Books B/C/D/E for the intelligence in
  Memory, Generation, Scoring, and Explanation. It does not re-document or redesign those books;
  it sequences them.
- **Evidence is read-only.** The Memory stage reads Book D's evidence and the pipeline routes it
  onward unchanged. No stage edits evidence.

---

## 11. Value contribution

A single deterministic, observable, human-gated pipeline is what turns AdOS from a set of capable
but disconnected engines into one manageable process. The value is direct on both axes an agency
measures:

- **Reduces production time.** A fixed order with one responsibility per stage removes the
  coordination overhead and rework that come from ad-hoc, service-by-service execution. Work
  flows Mission → … → Approve on rails; there is one place a run can be wrong, and it is
  inspectable. Fewer handoffs, less re-doing, faster throughput.
- **Increases agency revenue.** A deterministic, human-gated, observable pipeline is what makes
  AdOS an enterprise-manageable platform an agency can trust and scale on. Reviewers see the same
  shape every run; auditors can reason about what happened; the human always holds the gate. That
  trust is what a growing agency buys and builds on.

The canonical pipeline is the mechanism by which six books become one platform. Naming it,
fixing its order, and giving each stage one job is the foundation everything else in Book F
sequences, controls, and observes.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
