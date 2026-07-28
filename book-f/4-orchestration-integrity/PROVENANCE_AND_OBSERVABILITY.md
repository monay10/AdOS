# Provenance and Observability

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

This document defines how an orchestration run is made **observable** — how the fact of a run, the
work it did, the evidence it consulted, the decisions a human made, and the outcome it reached are
**recorded** so that any run can be reconstructed after the fact. It owns one law of the
constitution, **Observable by Design**, and it does exactly one thing with it: turns "every run
must be observable" from an aspiration into a concrete, minimum **run-record contract** — a fixed
list of fields every orchestration run is required to produce.

The document draws a hard, honest line down the middle of the product, because observability in
AdOS is split cleanly across the two tiers:

- **What ships today** is *thin but real* provenance: a small provenance stamp on each generated
  artifact (✅), and a live event bus feeding a bounded activity feed and dashboard (✅). A user
  can see, right now, which capability and model produced a piece of work, and a running feed of
  what the system has been doing.
- **What is built but unwired** is *rich, full-pipeline* observability: a sealed, frozen
  **ExecutionTrace** that captures the entire governed run — every stage, the evidence it used, the
  confidence it assessed, the decisions it journalled, the events it produced (🔶). This is real,
  tested code. It is also **never produced live**, because the web app never invokes the governed
  execution path that emits it.

The organising principle is a law about *shape*, not cleverness. Observability records a run; it
does not judge one, improve one, or add anything to it. A trace is a photograph of what happened,
sealed the moment it happened, never edited afterward. One sentence bounds the entire exercise, and
it is stated here in full because it is the boundary of everything that follows:

> **Orchestration coordinates intelligence; it does not create intelligence.**

Recording a run creates no new capability. The trace does not make the pipeline smarter; it makes
the pipeline *legible*. Every fact in the record was produced by a stage that already existed —
Book B drafted, Book D supplied evidence, Book E judged, Book C explained, a human decided. The
observability layer only writes down what those stages did. It is one hundred percent local, one
hundred percent deterministic in what it records, and adds **no new intelligence** of its own.

---

## 2. The governing law — Observable by Design

> **LAW 6 — Observable by Design.** Every orchestration run MUST produce, at minimum, a record
> containing: **Mission ID · Pipeline Version · Stages Executed · Duration · Evidence Used ·
> Human Decisions · Final Outcome.** A run that produces less than this is not an acceptable run.
> Book G (Analytics) consumes these records; it does not generate them and it does not decide with
> them.

This is not a logging convenience. It is a **contract**: the seven fields are the irreducible
minimum an orchestration run owes to the rest of the platform. A run that completes its work but
cannot say which mission it served, which stages it ran, how long it took, which evidence it
consulted, what a human decided, or how it ended is — by this law — incomplete, no matter how good
its output was. Observability is a property the run must *produce*, on the same footing as the
output itself.

Read the seven fields as a contract and each one earns its place:

| Required field | What it answers | Why it is mandatory |
| --- | --- | --- |
| **Mission ID** | *Which mission did this run serve?* | Ties the run to the business work it advanced; without it a run is orphaned. |
| **Pipeline Version** | *Which version of the pipeline ran?* | Two runs are only comparable if they ran the same pipeline; the version makes determinism auditable. |
| **Stages Executed** | *Which stages ran, in what order?* | Proves the run followed the governed sequence — the First Law's evidence. |
| **Duration** | *How long did it take?* | The raw material of every performance and cost view Book G builds. |
| **Evidence Used** | *Which Book D evidence did it consult?* | Makes the trust chain visible — and, by Law 4, records evidence *as a reference*, never a copy it can alter. |
| **Human Decisions** | *What did the human gate decide?* | Human decisions are first-class events, not side-notes; the record must carry them. |
| **Final Outcome** | *How did the run end — approved, revised, failed?* | Closes the record with the result the whole run existed to reach. |

The law is deliberately a **minimum**, not a ceiling. A run may record far more — and, as §3 shows,
the built-but-unwired trace records a great deal more. But it may never record *less* than these
seven. Everything in the rest of this document measures the shipped and built product against this
contract: what already satisfies it live (§4, §5, partially), what satisfies it in full but only in
tests (§3), and the honest gap between the two (§6).

---

## 3. The required record mapped to the ExecutionTrace (🔶 BUILT (UNWIRED))

The governed runtime already contains a structure that satisfies the run-record contract in full —
and then exceeds it. It is the **ExecutionTrace**, assembled by a **TraceBuilder**
(`packages/ai-manager/src/runtime/kernel.ts:204`) as the governed pipeline runs, sealed at the end,
and returned from the run. This section maps the seven required fields onto it and then shows how
much further it goes.

### 3.1 The TraceBuilder captures the whole run

As `AIManager.runExecute` (`packages/ai-manager/src/runtime/manager.ts:156`) moves through its
ordered stages, the TraceBuilder accumulates the record of what each stage did. Its fields
(`kernel.ts:136-145`) are:

- **`contextRefs`** — references to the context the run was built on.
- **`evidence`** — the Book D evidence the run consulted, held as a **reference record**, not a
  mutable copy (this is Law 4; see §7).
- **`confidence`** — the confidence the run assessed for its work.
- **`decisionJournalId`** — the identifier of the decision-journal entry the run recorded, tying the
  trace to the durable decision record.
- **`eventsProduced`** — the events the run emitted onto the bus.
- **`knowledgeEnriched`** — whether the run enriched durable knowledge (the company-brain step).
- **`steps[]`** — the per-stage breakdown: which stages ran, in order.
- plus **prompt**, **temperature**, **mission**, **session**, and **capability** — the identifying
  and reproducibility context of the run.

When the run ends, the builder **seals** the trace — it is frozen, made immutable — and the frozen
trace is **returned from `execute()`** (`manager.ts:334`). Sealing matters: a trace is a photograph
of a run, and a photograph you can edit afterward is not evidence of anything. Once sealed, the
record of what happened is fixed. Nothing downstream — no analytics view, no later run — can reach
back and rewrite it.

### 3.2 Mapping the seven required fields

Every field the Observable-by-Design contract (§2) requires is present in the sealed trace:

| Required field (Law 6) | ExecutionTrace field (`kernel.ts:136-145`) |
| --- | --- |
| **Mission ID** | `mission` |
| **Pipeline Version** | run identity + `steps[]` (the stage sequence that ran) |
| **Stages Executed** | `steps[]` |
| **Duration** | run timing captured across the sealed run |
| **Evidence Used** | `evidence` + `contextRefs` (reference records; see §7) |
| **Human Decisions** | `decisionJournalId` (link to the journalled decision) |
| **Final Outcome** | the sealed result returned from `execute()` (`manager.ts:334`) |

The trace does not merely *meet* the contract — it *surrounds* it. Beyond the seven required fields
it also records `confidence`, `eventsProduced`, `knowledgeEnriched`, the exact `prompt` and
`temperature`, the `session`, and the `capability`. This is the richest observability in the
platform, and it is the design target for what every orchestration run should produce.

### 3.3 The honest tier — rich, real, and not produced live

> **Tier note.** The ExecutionTrace is **🔶 BUILT (UNWIRED)**. The TraceBuilder is real code, the
> fields are real fields, and the seal-and-return path is real and tested. But the trace is
> **never produced live**, for one blunt reason: the web app **never calls `manager.execute`**.
> The governed execution path that assembles and returns the trace is instantiated only in the
> walking-skeleton test that drives the whole governed pipeline end to end. Full-pipeline
> observability is therefore **🔶** — it exists, it is exercised in tests, and it is not the
> observability a user gets when they click a button today.

This is the central honesty of the document, and §6 states it in full. The rich record exists; it
is simply not yet wired to the runs users actually trigger. Book F's design is to make the governed
pipeline the engine behind the live workflow — at which point the ExecutionTrace becomes the
shipped run record, and Law 6 is satisfied in full on every live run rather than only in a test.

---

## 4. What ships today — the thin AIProvenance stamp (✅ SHIPPED)

The observability that reaches a user today is thinner than the ExecutionTrace, but it is **real**,
**live**, and honest about its scope. The only provenance produced on the live path is a small
stamp attached to each generated artifact: the **AIProvenance** record on a creative set
(`domains/creative-studio/src/creative/creative-set.ts:53-59`).

Its fields are exactly five:

- **`taskId`** — which task produced this artifact.
- **`capability`** — which capability was invoked (e.g. which kind of generation).
- **`model`** — which local model produced the output.
- **`engine`** — which engine ran the model.
- **`latencyMs`** — how long the call took.

That is the whole of the live provenance, and it is worth being precise about what it is and is not:

- **It is per-artifact, not per-run.** The stamp lives on the generated artifact. It records the
  provenance of *that piece of work* — the capability, model, engine, and latency that produced it —
  not the whole orchestration run around it.
- **It is a genuine subset of the run-record contract.** `capability` and the stage it represents
  contribute to *Stages Executed*; `latencyMs` is a *Duration* at the artifact granularity;
  `taskId` links toward *Mission ID*. It does **not**, on its own, carry *Pipeline Version*,
  *Evidence Used*, *Human Decisions*, or a run-level *Final Outcome*. It is a real fragment of the
  contract, not the whole of it.
- **It is the only live provenance there is.** No richer trace is written on the live path today.
  When this document says the ExecutionTrace is not produced live (§3.3, §6), the AIProvenance stamp
  is what is produced instead — small, honest, and shipped.

The honest reading: AdOS ships provenance you can point at today — every generated creative artifact
can tell you which model and capability made it and how long it took — and it ships the *design* for
the far richer run-level trace that supersedes it once the governed pipeline is wired.

---

## 5. What ships today — the event bus and activity feed (✅ SHIPPED)

The second half of live observability is not a stored record on an artifact but a **running stream**
of what the system is doing. AdOS ships a live event bus, a bounded activity feed, and a dashboard
that reads from it — all wired, all real.

### 5.1 One shared event bus (✅ SHIPPED)

The composition root constructs a single `InMemoryEventBus` (`apps/web/src/app.ts:70`) and shares it
across every service in the application. One bus, one stream: everything that publishes an event
publishes onto the same bus, so there is a single place where the system's activity converges. This
is the substrate observability is built on — a shared, in-process channel of what happened, when.

### 5.2 The wildcard subscription and the bounded activity feed (✅ SHIPPED)

A **wildcard `'>'` subscription** listens to *every* event on the bus and feeds a **bounded,
fifty-entry activity feed** plus an audit trail (`app.ts:119-129`). Two design choices in that
sentence are load-bearing:

- **Wildcard.** The feed does not subscribe to a hand-picked list of event types; it subscribes to
  *all* of them. Whatever a service emits shows up. This is observability by default — a new event
  type is visible in the feed the moment it is published, with no extra wiring.
- **Bounded to fifty.** The feed keeps the most recent fifty entries and no more. This is a
  deliberate boundary, not a limitation to apologise for: a local, offline-first activity feed is a
  *recent-activity* view, not an unbounded log that grows without limit on the user's machine. Fifty
  entries is a window onto what the system has just been doing, kept small on purpose.

### 5.3 The dashboard reads recent events (✅ SHIPPED)

The dashboard surfaces this stream to the user through `recentEvents()` (`app.ts:133`), which reads
the bounded feed and presents it. A user looking at AdOS today can see a live account of what the
system has recently done — the shipped, human-facing face of observability. It is not the seven-field
run record of Law 6, but it is genuine, wired visibility into the running system.

### 5.4 The runtime's own pipeline events are unwired (🔶 BUILT (UNWIRED))

The governed runtime emits its own well-typed pipeline events — `ai.task.submitted`,
`ai.task.completed`, and `ai.task.failed` (`manager.ts:168`, `manager.ts:308`, `manager.ts:338`) —
that mark a governed run beginning, ending in success, and ending in failure. These are exactly the
events a full run record needs to bracket a run. But they are **🔶 BUILT (UNWIRED)**: the only
subscriber to them today is the walking-skeleton test that exercises the governed pipeline. The
**live** activity feed of §5.2 is fed by the events the shipped services actually publish; the
runtime's own submitted/completed/failed events do not reach it, because the runtime that emits them
does not run live.

So the picture is split cleanly once more: the event *infrastructure* is shipped and wired (one bus,
wildcard feed, dashboard — ✅), and the governed pipeline's *own run-lifecycle events* are built and
tested but not yet flowing into it (🔶). Wiring the governed pipeline as the live engine is what
connects the second to the first.

---

## 6. The honest gap — full-pipeline observability is not live yet

This document owes the reader one plain statement, and here it is: **AdOS cannot, today, produce the
complete Law 6 run record on a live run.** The seven-field contract is fully satisfied by the
ExecutionTrace — but the ExecutionTrace is never produced live, because the web app never calls
`manager.execute` (§3.3). What ships is the *fragments*: the per-artifact AIProvenance stamp (§4, ✅)
and the live event stream (§5, ✅). What does not ship is the *whole*: a single sealed record per run
carrying all seven required fields together.

It is worth being exact about the boundary:

- **Satisfied in tests, not live.** The full run-record contract is met — genuinely, in real code —
  only when the governed pipeline runs, and the governed pipeline runs only in the walking-skeleton
  test. Full-pipeline observability is therefore **🔶**, wired only in that test.
- **Satisfied in fragments, live.** On the path users actually trigger, observability is the
  AIProvenance stamp plus the activity feed — real, shipped, and a true subset of the contract, but
  not the assembled seven-field record.
- **The gap is a wiring gap, not a missing capability.** The record structure exists (`kernel.ts`),
  the events exist (`manager.ts`), the bus and feed exist (`app.ts`). What is missing is the single
  connection that makes the live workflow run *through* the governed pipeline, so that its trace and
  its events are produced on real runs. This is the same throughline as the rest of Book F: the
  governed pipeline is built; it is not yet the live engine.

Naming this precisely is not a weakness of the design — it is the design being honest about its own
status. The observability is not vapour: it is built, tested, and one wiring step away from being
live. Until that step is taken, the accurate statement is exactly this one: **the rich run record
exists and is not yet produced on live runs; the thin provenance and the event feed are what ship.**

---

## 7. Observability records evidence — it does not change it (Law 4)

Observability sits directly on top of a second constitutional law, and the two must not be confused.

> **LAW 4 — The orchestrator never changes evidence.** Evidence from Book D is immutable. The
> orchestrator may **read**, **route**, and **sequence** evidence, and it may **record which
> evidence a run used** — but it never edits it.

Recording is not touching. When the ExecutionTrace captures **Evidence Used**, it does so through its
`evidence` and `contextRefs` fields (`kernel.ts:136-145`) as **read-only reference records** — a note
that *this run consulted that evidence*, not a copy of the evidence the trace could later mutate. The
distinction is the whole point of the trust layer:

- The trace holds a **reference** to the evidence a run used, so the run is auditable back to its
  sources.
- The trace does **not** hold an editable copy the observability layer could alter, drift, or
  "improve." The evidence remains what Book D made it; the trace only points at it.

This is reinforced by the seal (§3.1): once the trace is frozen, even its *references* to evidence
cannot be rewritten. The record of what evidence a run used is as immutable as the evidence itself.
Observability, in other words, strengthens Law 4 rather than straining it: it makes the use of
evidence **visible and provable** precisely because it records evidence as an unchangeable reference,
never as a mutable payload. The orchestrator writes down *which* evidence it used; it never writes
*over* the evidence it used.

---

## 8. Determinism and reproducibility — same inputs, same trace

An observable run and a deterministic run are two halves of one property. The constitution's Law 2
(*orchestration is deterministic*) says: **same Mission + same Context + same Memory → same
pipeline, same stage order.** Observability is what makes that guarantee *checkable*.

Determinism without a record is an unverifiable claim. If two identical runs are supposed to behave
identically but neither leaves a trace, there is no way to confirm they did — the guarantee is a
promise no one can audit. The run record closes that loop:

- Because the trace records **Pipeline Version** and **Stages Executed** (§3.2), two runs of the same
  input can be compared stage-for-stage. If the pipeline is deterministic, the two traces match; if
  they diverge, the trace is the evidence that something non-deterministic crept in.
- Because the trace records the **prompt** and **temperature** (`kernel.ts:136-145`), the exact
  conditions of a run are captured — the reproducibility context that lets a run be re-created rather
  than merely re-described.
- Because the trace is **sealed** (§3.1), the record of a run cannot drift after the fact. The
  photograph of run A stays a photograph of run A, so a later comparison against run B is meaningful.

This is why observability belongs in the *integrity* part of Book F, alongside determinism. A
deterministic pipeline that is also observable is an **auditable** pipeline: same inputs produce not
only the same behaviour but the same recorded trace, and the trace is what lets anyone prove it. The
offline deterministic path makes this vivid — a deterministic execution that is also recorded is one
whose repeatability can be demonstrated on demand, not just asserted.

Observability does not *create* determinism; the fixed pipeline does that. Observability makes
determinism **legible** — it turns "this pipeline is deterministic" from a design claim into a
recorded, comparable fact.

---

## 9. Book G consumes these run records — it shows, it does not decide

The run record is not the end of a chain; it is the **raw material** for the next book. Book G
(Analytics) is defined by one boundary — **Analytics shows, it does not decide** — and this document
states the relationship precisely, without designing Book G here.

- **The run record is Book G's input.** Every performance view, cost view, throughput view, and
  quality trend Book G will build is computed *from* orchestration run records — the seven required
  fields and the richer trace around them. **Duration** feeds latency and throughput; **Stages
  Executed** feeds stage-level breakdowns; **Evidence Used** feeds evidence-utilisation views;
  **Human Decisions** and **Final Outcome** feed approval and revision analytics. Book F produces the
  record; Book G reads it.
- **Analytics shows; it does not decide.** Book G presents what the records say. It does **not** feed
  a decision back into the pipeline, re-route a run, or override a human gate. The direction of the
  arrow is fixed and one-way: orchestration → record → analytics. A view that *decided* would be a
  view that orchestrated, and orchestration is Book F's job, not Book G's.
- **This document does not design Book G.** It defines the *contract* Book G depends on — the
  run-record shape — and stops there. How Book G aggregates, visualises, or trends these records is
  Book G's concern. The obligation Book F carries is only to *produce a record worth consuming*: one
  that is complete (Law 6), immutable (§3.1, §7), and reproducible (§8).

Stating the dependency this way protects both boundaries at once. Book F is not tempted to build
analytics into the orchestration layer, and Book G is not tempted to build decisions into the
analytics layer. The run record is the clean seam between them: Book F writes it, Book G reads it,
and neither reaches across.

---

## 10. Boundaries — local, own-data-only, no vendor telemetry

Everything in this document holds inside the same boundaries that hold across the whole platform, and
on the observability path they are non-negotiable — because observability is exactly the place where
a careless system leaks:

- **100% local.** Every observability mechanism — the AIProvenance stamp
  (`creative-set.ts:53-59`), the event bus (`app.ts:70`), the bounded activity feed
  (`app.ts:119-129`), the dashboard's `recentEvents()` (`app.ts:133`), and the sealed ExecutionTrace
  (`kernel.ts:204`) — runs entirely on the local machine. The `InMemoryEventBus` is in-process; the
  activity feed is a bounded in-memory window; the trace is a local object. No run record is shipped
  anywhere.
- **No vendor telemetry.** This is the sharpest boundary of the section. AdOS records runs **for the
  agency's own eyes**, never for a vendor's. No provenance stamp, no event, no trace, no activity-feed
  entry is transmitted to Anthropic, to a model provider, to an analytics service, or to any external
  endpoint. Observability here is the opposite of telemetry: telemetry sends *your* activity to
  *someone else*; AdOS keeps the record of your activity entirely with you.
- **Own data only, copy-only.** The record references the mission's own context and its own Book D
  evidence (§7) — as read-only references — and pulls in no external data to enrich the record. The
  trace describes the run; it does not reach outside the run to decorate itself.
- **Human-sovereign.** Human decisions are a **required field** of the run record (Law 6), not an
  optional annotation. Observability records what the human decided at the gate; it never records a
  decision the human did not make, and it never auto-approves to keep the record tidy. The human's
  decision is captured *because* it is sovereign, not overridden to simplify the trace.

The one-line boundary: **observability makes a run visible to its owner and to no one else.** It is
the record an agency keeps of its own system, held locally, shared with nothing.

---

## 11. No new intelligence

Observability, like every part of the orchestration layer, creates no intelligence of its own. This
is worth stating precisely, because "capturing confidence" and "recording decisions" can sound like
the system forming judgements. It is the exact opposite:

- **The AIProvenance stamp** (§4) computes nothing. It records the `capability`, `model`, `engine`,
  and `latencyMs` that a generation *already* used. The intelligence is the model's; the stamp only
  writes down which model it was.
- **The event feed** (§5) judges nothing. It observes events that services already published and
  keeps the most recent fifty. It routes visibility; it does not think.
- **The ExecutionTrace** (§3) invents nothing. Every field it holds — the evidence, the confidence,
  the decision-journal id, the events produced — was produced by a stage that already ran. The trace
  is a photograph of that work, not a re-analysis of it. It records `confidence`; it does not
  *assess* confidence — the confidence stage did that.
- **The run record** as a whole decides nothing. It carries the human's decision; it does not make
  one. It records the final outcome; it does not choose one.

Every fact in a run record was produced elsewhere: the draft by Book B, its evidence by Book D, its
judgement by Book E, its rationale by Book C, its approval or rejection by a human. The
observability layer's entire contribution is to **write those facts down, together, immutably, so the
run can be reconstructed.** That is coordination — recording the run — and it creates nothing.

> **Orchestration coordinates intelligence; it does not create intelligence.**

This is why the observability gap in §6 is an **orchestration** defect, not an intelligence defect.
Nothing is wrong with how AdOS generates, scores, or explains a run's work, and nothing is wrong with
the trace's design. What is missing is only the **wiring** that produces the rich record on live runs
— a matter of routing execution through the governed pipeline, the orchestrator's own job, touching
no model.

---

## 12. Value contribution

Observability maps directly to both value levers, and the map is unusually concrete because a run
record is, quite literally, a measurement.

**It reduces production time and rework.** A recorded run is a diagnosable run. The AIProvenance
stamp (§4) and the activity feed (§5) already let a user see which capability and model produced a
piece of work and what the system has recently done — so when something looks wrong, the answer is on
the screen rather than in a re-run. The full run record extends this from a fragment to a complete
account: **Stages Executed**, **Duration**, and **Evidence Used** turn "why did this run behave this
way?" from an investigation into a lookup. Across a book of missions, the difference between a
recorded run and an opaque one is the difference between diagnosing an issue in a glance and
reproducing it by hand.

**It grows revenue by making AdOS auditable at enterprise scale.** An enterprise agency does not buy
a system it cannot inspect. The single fact an enterprise buyer audits for is whether the system can
*show its work* — which run served which mission, which evidence it used, what a human decided, how
it ended. Law 6's seven-field record is that audit surface, and the no-vendor-telemetry boundary
(§10) is what makes it *trustworthy*: the agency's runs are visible to the agency and to no one else.
A platform whose every run is observable, immutable, and local is a platform an agency can govern,
prove, and stand behind in front of its own clients — and that is the difference between a tool and
an enterprise operating system.

A single, deterministic, observable pipeline — where every run produces a complete, immutable,
local record of what it did — turns six disconnected capabilities into one manageable, auditable
process a business can build on.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
