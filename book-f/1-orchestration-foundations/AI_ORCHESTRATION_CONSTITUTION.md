# AI Orchestration Constitution

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. **This is the
> governing document of Book F** — every other Book F artifact is subordinate to the laws,
> boundaries, and truth model declared here.
>
> **Laws:** *No component executes outside the orchestration pipeline · orchestration is
> deterministic · every stage has one responsibility · the orchestrator never changes evidence ·
> the human gate is a first-class stage, not an exception · observable by design.*

---

## 0. Preamble — what this document governs

This is the constitution of **Book F — AI Orchestration Platform**. It is the highest authority
in the book. Where any other Book F document appears to conflict with the text below, this
document controls, and the other document is to be corrected, not this one. The eleven content
documents of Book F — the orchestration model, the pipeline definition, the per-stage
specifications, the sequencing and failure-recovery docs, the provenance and observability
doc, and the closing platform doc — all derive their authority from the laws declared here.

Books A through E built the capabilities of AdOS. Book A gave the agency **workflow**. Book B
gave AI **production**. Book C gave **explainability**. Book D gave **performance memory** — the
evidence layer. Book E gave **creative judgement**. Each is a real, tested body of capability.
But there was no single system to *run* them in the right order, at the right time, under one
managed process with one human gate and one observable record. Book F is that system.

Book F is the **orchestration** layer. It is the managed process that runs all the other books
in sequence. It is not a sixth intelligence sitting alongside the other five — it is the
conductor that decides which of the five plays, and when. This distinction is the spine of the
entire book, and it is stated as an invariant that every Book F document repeats verbatim:

> **Orchestration coordinates intelligence; it does not create intelligence.**

Read that sentence as the first principle from which every law below is derived. If a proposed
orchestration behaviour would require Book F to *invent* a judgement, a score, a piece of
evidence, or a creative decision of its own, that behaviour is unconstitutional. Book F may
*route* to the layer that owns the decision; it may never *make* the decision itself.

---

## 1. The central principle — no new intelligence

Book F adds **no new intelligence** to AdOS. This is the sibling of Book E's "no new data" and
Book D's evidence discipline: where Book E promised to *rank* alternatives without inventing
outcomes, Book F promises to *coordinate* layers without inventing reasoning.

Concretely, Book F:

- **Engages the right intelligence layer at the right time.** Production (Book B), Explanation
  (Book C), Performance Memory / evidence (Book D), and Creative Judgement (Book E) are the
  intelligence. Book F selects among them and sequences them.
- **Owns process, not cognition.** Ordering, gating, state, retries, idempotency, provenance,
  and the human handoff are Book F's domain. Drafting copy, scoring creative, gathering
  evidence, and producing rationale are *never* Book F's domain.
- **Produces nothing an underlying book could not already produce.** If you remove Book F, the
  five capabilities still exist; what disappears is the *managed, deterministic, observable,
  human-gated* way of running them together.

Because Book F creates no intelligence, it also carries no independent authority to change what
the other books decided. It reads their outputs, routes between them, and sequences them. That
restraint is what makes the orchestration layer trustworthy: a coordinator that could silently
rewrite a score or an evidence record would collapse the trust the other five books were built
to earn.

---

## 2. The pipeline Book F manages

Book F manages exactly one canonical pipeline. Every managed AI action in AdOS is a traversal
of this ordered sequence:

```
Mission → Planner → Memory → Generation → Scoring → Explanation → Human Review → Revision → Approve
```

Each stage maps to a book and to a single responsibility (Law 3 formalises this):

| Stage | Owns | Book | Book F's role |
|-------|------|------|---------------|
| **Mission** | the unit of work + its state | Book A / this book | entry + state machine |
| **Planner** | decompose goal into ordered steps | (contract only) | sequence the pipeline |
| **Memory** | supply context + evidence | Book D | read + route evidence |
| **Generation** | draft the artifact | Book B | invoke production |
| **Scoring** | evaluate the draft | Book E | invoke judgement |
| **Explanation** | produce rationale | Book C | invoke explanation |
| **Human Review** | await a human decision | this book | present + gate |
| **Revision** | route an unapproved artifact back | this book | loop, not fail |
| **Approve** | record the human's acceptance | this book | advance the mission |

The pipeline is defined in full by F003; the individual stages are specified in Part 2 (F004–
F007). This constitution establishes only that there **is** one canonical pipeline and that no
component may run outside it (Law 1).

---

## 3. The three-tier truth model

Book F uses the same truth model as Books B, C, D, and E. Every capability named anywhere in
this book carries exactly one tier tag, and nothing unbuilt is ever presented as shipped:

- **✅ SHIPPED** — runs in the live web app today; cited with a wired `path:line`.
- **🔶 BUILT (UNWIRED)** — code and tests exist, but no live path reaches it; cited with a
  `path:line` that resolves only inside tests.
- **❌ ROADMAP** — a contract or an intention with no implementation; no code citation is
  permitted, and none is given.

The tier tags are not decoration. They are the mechanism that keeps this book honest about the
gap between the *design* of a governed orchestration platform and the *current state* of the
codebase. As Section 4 makes plain, the most important laws of this book describe a **target
state** that today's code does not yet satisfy — and the truth model is how we say so out loud.

---

## 4. The central truth — AdOS has two disconnected orchestrations

The defining fact of Book F, from which several laws inherit their honesty, is this: **AdOS
already contains two orchestrations, and they are disconnected from each other.**

### 4.1 The live, manual orchestration ✅ SHIPPED

The application the user actually runs is orchestrated **procedurally, by the human, one click
at a time.** A dispatch layer (`apps/web/src/routes.ts:732-768`) maps each action to a handler
in pipeline order: `brief → approve → creative → approve → campaign → approve → report →
executive → learn`, with `reject`/`cancel` as exits. Each handler reloads the mission and guards
on status and prior artifact (`routes.ts:952,988,1022`) before running. Under it sits a **real
Mission state machine** ✅ (`domains/agency-os/src/mission/mission.ts:79`) advancing through
`submitted → planning → awaiting_approval → executing → completed | failed`.

This orchestration is genuinely shipped, genuinely human-gated, and genuinely stateful. But its
sequencing is **procedural** — the human clicks each step; **no engine drives it**. There is no
component that, given a mission, executes the pipeline autonomously.

### 4.2 The governed runtime pipeline 🔶 BUILT (UNWIRED)

Separately, the codebase contains a **governed, twelve-stage runtime pipeline** — the
`AIManager.runExecute` engine (`packages/ai-manager/src/runtime/manager.ts:156`). Its header
names it "the single AI Pipeline" (`manager.ts:71`). It runs an ordered, governed sequence in
which every stage is one responsibility: safety-in → context build → tool validation → evidence
→ confidence → route → inference with validate/repair → safety-out → constitution → response →
decision journal → monitoring/events/learning → brain enrich. It seals a frozen `ExecutionTrace`
of everything it did.

This engine is **instantiated only in tests** (`packages/ai-manager/src/runtime/walking-
skeleton.test.ts:94`). Its governance dependencies are optional, and **no live path in
`apps/web` ever calls it.** It is real, tested code — and it is unwired. 🔶

### 4.3 The bypass ✅ SHIPPED — proof the First Law is unmet

The live app does not use the governed engine. It uses a bypass. The AI factory
(`apps/web/src/ai-factory.ts:39`) constructs a `LiveAIManager` (or an `OfflineAIManager` for the
canned path), and `LiveAIManager.submit` (`apps/web/src/ai-live.ts:34`) does nothing but build
messages, call the engine, extract JSON, and take **one** repair turn. It runs **zero** governed
stages — no evidence, no context, no safety, no constitution, no journal, no learning. Every
service in the app is handed this single bypassing manager.

So the honest picture is: the **stages** exist (governed pipeline 🔶), the **workflow** exists
(manual route-driven, human-gated ✅), and **they do not meet.** The live workflow bypasses the
governed engine entirely.

### 4.4 Book F is the design to unify them

Book F is the specification that makes the governed pipeline the **engine behind the mission
workflow** — so that the human-gated workflow the user already trusts runs *through* the
governed, observable, deterministic stages instead of around them. The First Law (Section 5) is
that goal. Today the goal is not met; this book says so plainly and specifies the target.

---

## 5. The governing laws

The six laws below govern every Book F document. Each is stated, justified, and given an
enforcement mechanism. Where a law describes a target state the code does not yet meet, the gap
is named honestly with its citation.

### FIRST LAW — No component executes outside the orchestration pipeline

**Statement.** Every AI action in AdOS runs *inside* one managed pipeline. Books B, C, D, and E
stop being independent modules invoked ad hoc; there is no path to production, scoring,
evidence, or explanation except through the orchestrator.

**Rationale.** A capability called directly from a route is a capability with no guaranteed
context, no guaranteed evidence, no guaranteed safety or constitution check, and no guaranteed
record. The moment even one path bypasses the pipeline, none of the other laws can be relied on,
because there is always an ungoverned way in. The First Law is what makes determinism (Law 2),
evidence integrity (Law 4), and observability (Law 6) *enforceable* rather than merely
aspirational.

**Enforcement.** In the target state, services never receive a raw model port; they receive a
handle that can only reach a model *through* the governed pipeline (`AIManager.runExecute`,
`manager.ts:156` — 🔶). The composition root (`apps/web/src/app.ts:45`) is the single place
where this wiring is enforced: it constructs every service over one shared `EventBus` and
repository bundle, so it is also the correct place to guarantee that the one injected AI handle
is the governed one.

**Honest status.** Today this law is **VIOLATED.** Services are called directly from routes, and
the live app injects a bypassing `LiveAIManager` (`ai-factory.ts:39`, `ai-live.ts:34`) into
every service instead of the governed engine. The First Law is the **target state**, not the
current state. F008 owns the enforcement design; this constitution owns the mandate.

### LAW 2 — Orchestration is deterministic (the most important law)

**Statement.** **Same Mission + Same Context + Same Memory → Same Pipeline**, in the same stage
order. Given identical inputs, the orchestrator traverses identical stages in an identical
sequence. The orchestrator **never self-selects a different path at runtime.**

**Rationale.** This is the most important law in the book because every other guarantee depends
on it. An observable record (Law 6) is only meaningful if the sequence it records is
reproducible. A human gate (Law 5) is only trustworthy if the same review presents the same
artifact produced the same way. Evidence integrity (Law 4) is only auditable if the evidence was
gathered at a fixed, known point in a fixed sequence. A self-modifying orchestrator — one that
reorders or skips stages based on its own runtime judgement — would be a *new intelligence*,
which the central principle forbids. Determinism is the operational form of
"orchestration coordinates intelligence; it does not create intelligence."

**Enforcement.** The pipeline is a **fixed** ordered sequence, not a dynamic plan the
orchestrator rewrites. The governed engine encodes exactly this: a fixed ordered stage list
(`manager.ts:156`) with no branch where the manager chooses a *different* stage order. Routing
*within* a stage (which model answers) is delegated to a router port and is itself a defined
step, not a re-ordering of the pipeline. Determinism is verified by the walking-skeleton and
integration tests that assert the canonical sequence (`walking-skeleton.test.ts:94`).

**Honest status.** The governed engine is deterministic by construction (🔶). The *live* path is
deterministic only in its procedural sequence (the human clicks fixed steps ✅) and in the canned
`OfflineAIManager` output; making the live path run the deterministic governed sequence is the
unification goal (Section 4.4).

### LAW 3 — Every stage has one responsibility

**Statement.** Each pipeline stage does exactly one job and no other: **Planner → plan; Memory →
context; Generation → draft; Scoring → evaluate; Explanation → rationale; Review → await the
human decision.** No stage takes another stage's job.

**Rationale.** Single responsibility is what makes the pipeline auditable and what makes each
book's boundary defensible. If Generation could also score, or Scoring could also gather
evidence, the ownership boundaries between Books B, C, D, and E would dissolve inside the
orchestrator, and no one could say which book was accountable for a given output. One
responsibility per stage keeps the orchestrator a *coordinator* and keeps each book the sole
author of its own kind of intelligence.

**Enforcement.** The governed engine is built as a chain of single-purpose stages (🔶): context
build (`manager.ts:179`), evidence gather (`manager.ts:203`), confidence assess
(`manager.ts:209`), route (`manager.ts:216`), inference (`manager.ts:229-253`), safety-out
(`manager.ts:256`), constitution (`manager.ts:261`), decision journal (`manager.ts:290`),
learning (`manager.ts:304-317`). Each is a distinct, named step with its own port; none reaches
into another's concern. F003 formalises the mapping of pipeline stage to responsibility to book.

### LAW 4 — The orchestrator never changes evidence

**Statement.** Evidence from Book D is **immutable** to the orchestrator. Book F may **read,
route, and sequence** evidence; it may **never edit** it.

**Rationale.** Book D is the trust layer — the performance memory that grounds every AI claim in
recorded fact. If the orchestrator could alter evidence in flight, the entire evidentiary basis
of AdOS would become unverifiable, because the coordinator would be a silent editor between the
record and the decision. Immutability is what lets a human at the gate, or an auditor later,
trust that the evidence a decision rested on is the evidence Book D actually holds. This law is
the evidence-specific expression of "no new intelligence": inventing or amending evidence would
be creating intelligence.

**Enforcement.** In the governed pipeline the evidence stage is a **gather** operation
(`evidence.gather`, `manager.ts:203`) — a read that feeds later stages — not a write.
Downstream stages consume the gathered evidence read-only; the frozen `ExecutionTrace` records
which evidence was *used* (`kernel.ts:136-145`, 🔶) without granting any stage the ability to
mutate the source. Book D remains the sole author and owner of evidence; Book F is a consumer.

### LAW 5 — The human gate is a first-class stage, not an exception

**Statement.** Human approval is a **normal** part of the pipeline: `Human Review → Approved |
Revision`. **Both branches are normal flow.** Human intervention must never be modelled as an
error, an exception, or a failure.

**Rationale.** AdOS is human-sovereign: a person decides, the machine proposes. If a human
declining to approve is modelled as a *failure*, the architecture is quietly telling the human
that the correct, expected behaviour is to approve — and that saying "revise this" is a fault.
That inverts the sovereignty the product is built on. A first-class gate says the opposite:
approval and revision are equally valid, equally expected outcomes of a stage whose entire
purpose is to *await a human decision*. Revision is a loop, not a dead end.

**Enforcement.** The gate is a real stage with two normal transitions. The shipped state machine
models both branches: the *approval* branch (`requestApproval` / `approve`, `mission.ts:179,
188` ✅) and, since Series 2, the *revision* branch — `requestRevision` (`mission.ts:225` ✅) returns
the mission to `planning` for rework, advancing its revision history rather than destroying it.

**Honest status.** ✅ **SHIPPED (Series 2 · 2026-07-28) — this law now HOLDS on the reject path.**
Gate reject calls the **non-destructive** `mission.requestRevision(gate, reason)` (`mission.ts:225`,
via `routes.ts:893`): the mission returns to `planning`, the rejection is appended to its
`revisionHistory` (never lost), a `mission.revision.requested.v1` event is emitted, and the rejected
draft is discarded so the stage is regenerated under the **same** mission — a real `Human Review →
{Approved | Revision}` branch. A human's "revise this" is now a first-class revision, not a terminal
failure. **Customer cancellation** still calls the terminal `mission.fail()` (`mission.ts:209`,
`routes.ts:894`) — correctly, because a cancellation *is* an end state, not a revision. What remains
🔶/❌ is AI-*assisted* revision (auto re-generation from the feedback) — the loop is human-driven
today; see [`../../book-b/4-optimization/REVISION_ENGINE.md`](../../book-b/4-optimization/REVISION_ENGINE.md).

### LAW 6 — Observable by design

**Statement.** Every orchestration run produces, at minimum, a record containing: **Mission ID ·
Pipeline Version · Stages Executed · Duration · Evidence Used · Human Decisions · Final
Outcome.**

**Rationale.** Orchestration that cannot be observed cannot be governed, audited, improved, or
trusted at enterprise scale. The required fields are the minimum needed to answer, after the
fact: *what work was this, which version of the pipeline ran it, what did it actually do, how
long did it take, what facts did it rest on, what did the human decide, and how did it end?* Book
G (Analytics) exists to *consume* these records — and, per its own boundary, to *show* them, not
to decide. Observability is therefore the seam between the A–F core and everything built on top.

**Enforcement.** The governed engine already builds a rich, frozen `ExecutionTrace` via a
`TraceBuilder` (`kernel.ts:204`) whose fields map directly onto the required record:
`contextRefs`, `evidence`, `confidence`, `decisionJournalId`, `eventsProduced`,
`knowledgeEnriched`, `steps[]`, plus mission and session identity (`kernel.ts:136-145`, 🔶). The
live app additionally records a **thin** `AIProvenance` = `{taskId, capability, model, engine,
latencyMs}` on each artifact (`domains/creative-studio/src/creative/creative-set.ts:53-59` ✅) and
a bounded in-memory activity feed over the event bus (`apps/web/src/app.ts:119` ✅). F010 owns the
mapping of the required record onto these mechanisms.

**Honest status.** The rich trace is **never produced live** — the app never calls the governed
`execute` path — so today the full required record exists only in tests (🔶). The thin provenance
and the activity feed ship (✅) and cover part of the record. Closing the gap is F010's charge.

---

## 6. The A–F core operating system, and what builds on top

Book F is the sixth and final book of the **core operating system**. Books A through F together
constitute one managed enterprise platform:

- **Book A — Workflow.** The agency's process and mission structure.
- **Book B — Production.** AI drafting of briefs, creative, and campaigns.
- **Book C — Explainability.** Rationale for every AI output.
- **Book D — Performance Memory.** The immutable evidence layer.
- **Book E — Creative Judgement.** Reproducible scoring of alternatives.
- **Book F — Orchestration.** The managed process that runs all of the above in one
  deterministic, observable, human-gated pipeline.

These six are the **core**. They may reference one another, but the later books never redesign
the earlier ones. Book F is the layer that finally makes the other five *manageable as one
system* — which is precisely why it is the last core book: there was nothing to orchestrate
until B–E existed.

Two further books build **on top of** the A–F core and must never change it:

- **Book G — Analytics** ("shows, does not decide"). Book G consumes the observability records
  mandated by Law 6 and presents them. It reads the orchestration record; it does not alter the
  pipeline, and it holds no authority to decide anything the core did not already decide.
- **Book H — Marketplace** ("ecosystem, not core"). Book H extends AdOS with an ecosystem around
  the platform. It is additive; the six core books remain the trusted, governed foundation.

The rule is directional: **the core does not depend on G or H, and G and H must not modify the
core.** Book F's observability contract (Law 6) is the clean, one-way seam that lets Analytics
and the Marketplace build on the core without reaching into it.

---

## 7. Boundaries with Books B–E — reference, do not redesign

Book F **orchestrates** Books B, C, D, and E. It does **not** re-document, re-specify, or
redesign them. This boundary is strict and is enforced throughout the book:

- **Generation** is Book B. Book F invokes production and sequences it; it does not define how a
  draft is produced. (Live single-shot generation ✅; the governed inference/repair stage 🔶.)
- **Scoring** is Book E. Book F invokes judgement and places it in the pipeline; it does not
  define the scoring model. (Governed safety/constitution stages 🔶; Book E judgement 🔶/❌ per E.)
- **Explanation** is Book C. Book F invokes explanation as a stage; it does not define how
  rationale is produced. (🔶)
- **Memory / Evidence** is Book D. Book F reads and routes evidence and never edits it (Law 4);
  it does not define how evidence is recorded. (Context build `manager.ts:179`, evidence gather
  `manager.ts:203` — 🔶.)

Where a Book F document needs a detail of B, C, D, or E, it **links** to that book and states the
tier; it never restates the other book's design as if it were Book F's own. The **Planner** stage
is the one piece the pipeline needs that no other book owns — and today it is **❌ ROADMAP**: a
decomposition contract exists (`packages/cognitive-core/src/engines.ts:18`,
`decompose(goal, context): Promise<Plan>`) but is never imported in `apps/web`, and the
dashboard's `nextStep()` (`routes.ts:74`) is a static UI hint, not a planner.

---

## 8. Boundaries of the platform — local and human-sovereign

Book F inherits, and must never weaken, the operating boundaries of AdOS:

- **100% local, offline-first.** The orchestration pipeline runs entirely on the user's machine.
  There is no cloud, no external API, no telemetry, no vendor connector, no data leaving the
  device. Orchestration adds coordination, not connectivity.
- **Copy-only.** AdOS produces copy and drafts for human use; the pipeline never executes
  external actions on the world (no ad buys, no publishing, no sends).
- **No external data.** The pipeline consumes only the evidence Book D already holds. Book F
  introduces no new data source — the sibling of "no new intelligence."
- **No vendor telemetry.** The observability records mandated by Law 6 are local records for
  local Analytics (Book G). They are never emitted off-device.
- **Human-sovereign.** The human gate is a **first-class stage** (Law 5). The pipeline **never
  auto-approves.** A human decision is a required, normal stage of every mission that reaches it;
  the machine proposes and the person disposes. No orchestration convenience — no confidence
  threshold, no "high score," no retry success — may ever substitute for the human's approval.

These boundaries are constitutional. No Book F document, and no future orchestration feature, may
relax them in the name of automation. Coordinating six books more smoothly is Book F's mandate;
removing the human, phoning home, or acting on the world is expressly outside it.

---

## 9. Value contribution

Book F's value is not a new capability — it is the *manageability* of the five capabilities that
already exist. A single deterministic, observable, human-gated pipeline turns six disconnected
books into one managed process. That yields value on both axes AdOS is measured by:

- **Reduces production time.** Determinism (Law 2) and single-responsibility stages (Law 3)
  eliminate the rework and rerun cost of ad-hoc, ungoverned calls. Idempotent, recoverable
  stages mean a mission does not restart from zero when one step needs another turn. One managed
  sequence replaces a scatter of hand-wired service calls, cutting the operational overhead of
  running an AI-heavy agency.
- **Increases agency revenue.** An enterprise buys a platform it can trust and scale on. A
  pipeline that is deterministic, that never changes evidence, that gates on a human by design,
  and that emits a complete observable record of every run is an *enterprise-manageable* system.
  That trust is what lets an agency adopt AdOS as core infrastructure rather than a novelty — and
  what lets it grow on the platform. Orchestration is the difference between six clever tools and
  one platform an agency can build a business on.

The through-line: **orchestration coordinates intelligence; it does not create intelligence** —
and by coordinating it well, it converts capability into a manageable, trustworthy, scalable
enterprise platform.

---

## 10. What this constitution binds

Every Book F document — F002 through F011 — is subordinate to this text:

- **F002 `ORCHESTRATION_MODEL.md`** — what orchestration means here; the two orchestrations and
  the goal of unifying them; the composition root and ports; determinism as a property.
- **F003 `ORCHESTRATION_PIPELINE.md`** — the canonical pipeline defined stage by stage, mapped to
  books, tiers, and the governed runtime sequence; Law 3 formalised.
- **F004–F007** — the pipeline stages: Mission & Planning; Memory & Generation; Scoring &
  Explanation; Review, Revision & Approval (owner of Law 5).
- **F008–F009** — orchestration control: sequencing & state (owner of Laws 1 and 2); failure &
  recovery.
- **F010** — provenance & observability (owner of Law 6).
- **F011** — the closing platform document: A–F as one managed core, the unification throughline,
  and how G and H build on top.

Where any of these conflicts with the laws above, the law controls and the document is corrected.

> **Orchestration coordinates intelligence; it does not create intelligence.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
