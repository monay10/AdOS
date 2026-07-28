# Failure and Recovery

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

This document defines how the orchestration pipeline behaves when something goes **wrong** — and,
just as importantly, what it does **not** do when a human simply wants something **different**. It
covers three mechanisms that are already live, one that is partial, one clean failure signal, and
one honest gap:

- **Self-repair / retry** — a stage that produces malformed output gets a bounded, deterministic
  second chance to correct itself before the pipeline gives up.
- **Idempotency** — replaying a step that has already completed is safe; it does not double-write
  or corrupt state.
- **The failure path** — when a stage genuinely cannot succeed, the pipeline emits a clean,
  observable failure signal rather than hanging or improvising.
- **The recovery gap** — once a mission has failed, there is today **no way back**. That is the
  single largest weakness in the control layer, and this document is honest about it.

The organising principle is a law about *shape*, not cleverness. Recovery in AdOS is bounded and
deterministic: a stage either succeeds, repairs itself within a fixed limit, or fails cleanly.
There is no open-ended retry, no self-improvised recovery, no stage that reinvents a new strategy
to save itself. Recovery is coordination — the orchestrator routing a known, finite set of
outcomes — not intelligence.

One sentence bounds the entire exercise, and it is stated here in full because it is the boundary
of everything that follows:

> **Orchestration coordinates intelligence; it does not create intelligence.**

When a stage repairs its own output, the orchestrator is not making the stage *smarter*. It is
re-running the same stage, under the same rules, one more time — the coordination of a retry, not
the creation of a new capability. When a mission fails, the orchestrator is not judging the work;
it is routing a terminal outcome. Recovery is one hundred percent local, one hundred percent
deterministic, and adds **no new intelligence** of its own.

---

## 2. The governing law — deterministic recovery

> **LAW — Recovery is deterministic and bounded.** Retries are fixed in count and deterministic
> in behaviour, never open-ended. A stage either **succeeds**, **repairs itself within its
> bound**, or **fails cleanly**. There are no infinite loops, no self-improvised recovery paths,
> and no stage that self-selects a novel strategy to rescue itself at runtime.

This law is the failure-handling face of the pipeline's determinism (Law 2 of the constitution:
*orchestration is deterministic*). Same Mission + Same Context + Same Memory must yield the same
pipeline behaviour — and that guarantee has to hold on the unhappy path too, or it is worthless.
A system that retries a fixed number of times behaves identically on every replay of the same
input. A system that retries "until it works" does not: its behaviour depends on timing, on the
model's mood, on how many attempts it happened to take today. The first is auditable. The second
is not.

Three consequences follow, and all three are load-bearing:

1. **Retries have a fixed ceiling.** Every self-repair path in AdOS has a hard, small, numeric
   bound — one repair turn, one validation retry. The bound is a constant, not a function of how
   badly the output is failing. When the bound is exhausted, the pipeline stops trying and reports.

2. **Repair re-runs the same stage; it does not invent a new one.** A repair attempt is the same
   stage, with the same responsibility, given the same job again — nudged with the reason it
   failed. It is not the orchestrator switching to a different model, a different route, or a
   different plan to escape the problem. The pipeline never self-selects an alternate path to
   recover (this is the deterministic-sequencing discipline; see the companion control document on
   sequencing and state).

3. **Failure is clean, not silent.** When recovery is exhausted, the outcome is an explicit,
   observable failure signal — a state transition and an event — not a hung process, a swallowed
   exception, or a partial write left behind. A stage that cannot succeed says so, loudly and once.

The remainder of this document measures the shipped product against this law: where it holds
(§3 self-repair, §4 idempotency, §5 the failure path), and the one place recovery is genuinely
missing today (§6, the destructive-`fail()` gap).

---

## 3. Self-repair and retry (✅ SHIPPED — both live paths)

AdOS ships bounded, deterministic self-repair today, on **both** of the AI execution paths that
run in the product. This is not a roadmap aspiration; a malformed model response gets exactly one
disciplined correction attempt before the pipeline gives up. Both paths obey the same shape: **one
attempt, one bounded repair, then stop.**

### 3.1 The live path — one repair turn (`LiveAIManager`)

The live web application executes AI work through `LiveAIManager.submit`
(`apps/web/src/ai-live.ts:34`). Its flow is: build the prompt messages, call the local model
engine (`engine.complete`), and extract structured JSON from the model's text. Local models do not
always return clean, parseable JSON on the first try — a stray sentence of preamble, a trailing
comment, a missing brace. `LiveAIManager` handles this with a single, bounded self-repair turn
(`ai-live.ts:49-67`):

- **First attempt.** The model is called and its output is passed to `extractJson`
  (`ai-live.ts:179`), which attempts to pull a valid JSON object out of the response text.
- **One repair turn.** If extraction fails, the manager does **not** give up, and it does **not**
  loop forever. It makes exactly **one** additional attempt — a repair turn — re-prompting the
  model to correct its output, then extracts again.
- **Then stop.** If the repair turn still does not yield extractable JSON, the attempt ends. There
  is no third try, no escalating series of attempts, no fallback to a different model.

This is bounded self-repair in its simplest live form: **first attempt + one repair = at most two
model calls**, a fixed ceiling. The behaviour is deterministic in structure — the same failing
output triggers the same single repair turn every time. It absorbs the most common local-model
imperfection (nearly-valid JSON) without ever risking an unbounded loop.

### 3.2 The governed path — the validate/repair loop (`AIManager` runtime)

The governed 12-stage runtime pipeline carries the same discipline in a more formal shape, inside
its inference stage. `AIManager.runExecute` (`packages/ai-manager/src/runtime/manager.ts:156`)
runs inference followed by a **validate-and-repair loop** (`manager.ts:229-253`):

- The stage runs inference to produce a candidate.
- The candidate is **validated**. If it passes, the stage completes.
- If it fails validation, the stage **repairs** — re-running with the validation failure as
  context — and validates again.
- The loop is bounded by **`maxValidationRetries`**, whose default value is **1**
  (`manager.ts:89`). One repair pass, then the loop terminates.

The number is deliberately small and deliberately a constant. `maxValidationRetries` is a fixed
ceiling, not a target the pipeline climbs toward adaptively. Set to its default of `1`, the stage
attempts at most one correction; when that is exhausted, the loop exits and the pipeline proceeds
to its verdict rather than trying indefinitely. Critically, what the loop does on each pass is
**re-run the same stage with the same responsibility** — generate, then validate — not switch to a
new strategy. The repair is coordination of a retry, exactly as the law requires.

> **Tier note.** This governed runtime is **🔶 BUILT (UNWIRED)** — it is instantiated only in
> tests, and the live app does not route through it. The validate/repair loop is real, tested
> code, but it is not the code that runs when a user clicks a button today. The **live** self-repair
> that ships to users is the `LiveAIManager` repair turn of §3.1 (✅ SHIPPED). Both are documented
> here because Book F's design is to make the governed pipeline the engine behind the live
> workflow — at which point §3.2 becomes the shipped self-repair mechanism.

### 3.3 The offline path — deterministic, no retry (`OfflineAIManager`)

The third execution path is the deterministic offline manager. `OfflineAIManager.submit`
(`apps/web/src/ai.ts:16`) returns canned, deterministic JSON (`ai.ts:36-54`) and performs **no
retry at all** — because it needs none. It is not calling a probabilistic model whose output might
be malformed; it returns a fixed, known-good structure every time. There is nothing to repair, so
there is no repair path.

This is worth stating explicitly, because "no retry" here is not a gap — it is the correct design.
Self-repair exists to absorb the imperfection of a probabilistic local model; where there is no
probabilistic model, there is no imperfection to absorb. The offline manager is the most
deterministic path of the three: same input, same output, first try, every time.

### 3.4 The shared property — bounded, deterministic self-repair already ships

Across all three paths, the same guarantee holds:

| Path | Tier | Retry behaviour | Ceiling |
| --- | --- | --- | --- |
| `LiveAIManager` (`ai-live.ts:34`) | ✅ SHIPPED | first attempt + one repair turn (`ai-live.ts:49-67`) | 1 repair |
| `AIManager` runtime (`manager.ts:156`) | 🔶 BUILT (UNWIRED) | inference + validate/repair loop (`manager.ts:229-253`) | `maxValidationRetries`, default 1 (`manager.ts:89`) |
| `OfflineAIManager` (`ai.ts:16`) | ✅ SHIPPED | none — deterministic canned output (`ai.ts:36-54`) | 0 |

No path retries more than once. No path loops until success. No path escapes to a different
strategy to save itself. The ceiling is a small constant in every case. This is precisely the
shape the deterministic-recovery law (§2) demands, and it is **already shipped** on the live path —
not a promise, but the behaviour a user experiences today when a local model returns almost-valid
JSON.

The intelligence in a repair turn belongs entirely to the model producing the output — the same
model, doing the same job, one more time. The orchestrator's contribution is only the *decision to
retry once and then stop*. That decision is coordination, and it creates nothing.

---

## 4. Idempotency (✅ partial — safe replay of completed steps)

Retry is only safe if replaying a step cannot corrupt state. If clicking "generate" twice, or
replaying a completed action, double-writes a record or advances a mission twice, then bounded
retry stops being a safety feature and becomes a hazard. AdOS ships **partial idempotency** today:
the two steps most exposed to accidental replay guard themselves with an early return, so replaying
a **completed** step is safe.

### 4.1 Learning is idempotent once the mission is complete (✅ SHIPPED)

The final stage of the live workflow records what was learned from the mission. `recordLearning`
(`apps/web/src/routes.ts:1092`) guards its own entry: if the mission is already **completed**, it
**returns early** (`routes.ts:1096`) rather than recording the learning a second time. The learning
write — into the decision journal, executive memory, and company brain — happens once. A replay of
the learn action against an already-completed mission is a no-op, not a duplicate.

This matters because learning is the step that mutates the durable memory other missions will read
from. Double-recording it would inflate the evidence base with phantom duplicates — exactly the
kind of corruption the performance-memory layer's coherence discipline is built to prevent. The
early-return guard keeps the write exactly-once at the point where it counts most.

### 4.2 Executive generation is idempotent once a view exists (✅ SHIPPED)

The executive-summary stage carries the same guard. `generateExecutive`
(`apps/web/src/routes.ts:1055`) returns early if an executive view **already exists**
(`routes.ts:1064`). Requesting the executive summary a second time returns the existing one rather
than generating and storing a duplicate. Replay is safe: the second call observes that the work is
already done and declines to redo it.

### 4.3 The runtime uses `idempotencyKey` as a session id, not for dedupe (🔶 / honest note)

The governed runtime carries an `idempotencyKey`, but it is honest to note what that key does — and
does not — do today. In `AIManager` the key is used as a **session identifier** (`manager.ts:163`):
it labels and correlates a run. It is **not** used as a **deduplication key** — the runtime does not
consult it to detect "I have already executed this exact request, return the prior result." The
name promises full request-level idempotency; the current behaviour is session labelling. This is a
🔶 detail of the unwired runtime, called out so the name is not mistaken for a capability that is
not there yet.

### 4.4 Full cross-stage idempotency is ❌ ROADMAP

What ships today is **step-level, completion-guarded** idempotency: two specific late stages refuse
to redo work that is already done. What does **not** ship is **full cross-stage idempotency** — a
general guarantee that *any* stage, replayed with the same inputs at *any* point in the mission,
produces the same effect exactly once. That would require every stage to be keyed and deduplicated
uniformly (the `idempotencyKey` promise of §4.3, actually enforced), so that a retried or
re-dispatched stage anywhere in the pipeline is provably safe. That general guarantee is **❌
ROADMAP** — no implementation exists for it today.

The honest summary: **replaying a completed step is safe** (§4.1, §4.2, ✅), and that is the
property bounded retry most needs. **Uniform, keyed, cross-stage exactly-once** is a design goal,
not a shipped fact. Idempotency in AdOS is real but partial, and the boundary between the two is
exactly where this section draws it.

---

## 5. The failure path — a clean, observable failure signal (🔶 / ✅)

When recovery is exhausted — the repair turn did not help, the input is genuinely unprocessable — a
stage must **fail cleanly**. The deterministic-recovery law forbids the two bad alternatives: a hung
process that never resolves, and a silent swallow that lets the pipeline proceed as if nothing went
wrong. AdOS instead produces an explicit failure signal on both the pipeline and the mission.

### 5.1 The governed pipeline emits a `task-failed` event (🔶 BUILT (UNWIRED))

On an unrecoverable error, the governed runtime emits a failure event. `AIManager` publishes
`ai.task.failed.v1` (`manager.ts:338`) when execution cannot complete — a clean, typed, observable
failure signal that mirrors its success and submission events (`ai.task.submitted` /
`ai.task.completed`). The pipeline does not hang and does not pretend success. It announces the
failure onto the event bus, where an observer can see that a run began, and that it ended in
failure rather than completion.

This is the observability law (Law 6) meeting the recovery law: a failure is not just handled, it
is **recorded as an event**. The event is a first-class artefact of the run, carrying the fact of
the failure into the observable record that Book G (Analytics) is designed to consume. As with the
rest of the governed runtime, this path is **🔶 BUILT (UNWIRED)** — only the runtime's own tests
subscribe to the failure event today — but the mechanism is real and tested.

### 5.2 The mission can transition to `failed` (✅ SHIPPED)

At the workflow level, the Mission state machine (`domains/agency-os/src/mission/mission.ts:79`)
has a genuine failure state. Its `fail(reason)` transition (`mission.ts:209`) moves a mission to
`failed`, carrying a reason. This is the shipped, live representation of "this mission cannot
proceed." A mission that a model could never satisfy, or that hits an unrecoverable error, has a
legitimate place to land: the `failed` state, reached through an explicit transition, not a silent
stall.

So far, so correct: a failure path *should* exist, and a clean transition to `failed` is the right
mechanism for a genuine failure. The problem is not that `fail()` exists. The problem — the subject
of the next section — is **what else gets routed into it**, and the fact that there is **no way back
out**.

---

## 6. The recovery gap — `fail()` is destructive and terminal (❌ ROADMAP recovery)

Here is the single largest weakness in the control layer, and Book F states it plainly rather than
papering over it. AdOS can **fail** a mission cleanly. AdOS **cannot recover** one. There is no
reopen, no retry-from-failed, no path back.

### 6.1 `fail()` is a one-way door

The `fail(reason)` transition (`mission.ts:209`) is **destructive** and **terminal**:

- **Destructive** — it abandons the mission's forward progress. The mission stops advancing; the
  work in flight is not resumed.
- **Terminal** — `failed` has **no reverse transition**. There is no `reopen()`, no `retry()`, no
  path from `failed` back to `awaiting_approval` or to any earlier stage. Once a mission is
  `failed`, it is over. Every subsequent attempt to act on it hits the state machine's
  invalid-transition guard (`mission.ts:218`).

For a *genuine* failure — a mission that truly cannot be completed — a terminal state is
defensible. The trouble is that the terminal door is the **only** door, and more than genuine
failures are being pushed through it.

### 6.2 Human rejection is routed into the same terminal door

The live workflow routes a human's **gate rejection** into `fail()`. When a reviewer declines a
gate, `gateReject` calls `missions.fail()` (`apps/web/src/routes.ts:886`). This means a mission can
reach the terminal `failed` state by two very different routes:

- an actual, unrecoverable **failure** of the work, and
- a human saying **"not this — change it."**

Both land in the same destructive, terminal state, from which §6.1 establishes there is no return.
The consequence is stark: **a failure or a human rejection cannot be recovered without starting
over from scratch.** A reviewer who merely wanted a warmer headline has, from the state machine's
point of view, done the same irreversible thing as a mission that genuinely died — and the only way
forward for either is a brand-new mission from a blank brief, discarding all the strategy, evidence,
and drafts that were already correct.

This is the **biggest recovery gap** in the platform. It is a gap in two dimensions at once: there
is no way to recover a genuinely failed mission (no reopen/retry transition exists), and there is no
way to recover a merely-rejected one (rejection was routed into the terminal state to begin with).

### 6.3 Two laws intersect here — and the fix respects both

This gap sits at the intersection of two constitutional laws, and it is important to keep them
distinct:

- **Deterministic recovery (§2)** says failure must be *clean* — which today it is. The mission
  transition to `failed` is explicit and observable. What the law does **not** grant is *recovery*
  from that clean failure. Bounded self-repair (§3) recovers a bad **stage output**; nothing
  recovers a failed **mission**.
- **The human gate is a first-class stage, not an exception (Law 5)** says a human's "needs
  changes" is a **normal outcome of review, not a failure**. Routing rejection into `fail()`
  (§6.2) violates this law directly: it encodes a considered human decision as a terminal fault.

The two laws point at the same fix from different sides. A human's **"needs changes" must be kept
entirely out of the failure path.** It is not a failure, it must not be modelled as one, and it must
not be routed into the terminal `failed` state. Where a genuine failure needs a *recovery* path that
does not exist yet, a human rejection needs to *never enter the failure path at all*.

### 6.4 The design — a non-destructive Revision / retry path (❌ ROADMAP)

The fix is not to make `fail()` less terminal, and it is not to invent new intelligence to rescue a
mission. It is to add a **non-destructive** path — a way to move a mission backward under control
without destroying it:

- **For human rejection**, the pipeline routes "needs changes" into a **normal Revision branch**
  that returns the mission to an earlier stage carrying the human's direction, preserving the
  mission and its accumulated work. This is the human-gate document's design, and this document
  defers to it rather than duplicating it — see
  [`../2-pipeline-stages/REVIEW_REVISION_APPROVAL.md`](../2-pipeline-stages/REVIEW_REVISION_APPROVAL.md).
- **For a genuine failure**, the design adds a bounded, non-destructive **retry** transition — a way
  to re-enter the pipeline from the point of failure rather than obligating a full restart — under
  the same fixed, deterministic bounds as every other retry in §3.

Both share one discipline: **non-destructive** progress. The prior candidate, its evidence, and its
provenance are preserved rather than deleted — the same non-destructive, versioned framing the
performance-memory layer applies to its own records, see
[`../../book-d/4-memory-maintenance/MERGE_AND_VERSIONING.md`](../../book-d/4-memory-maintenance/MERGE_AND_VERSIONING.md).
Nothing about this path is a new model or a new intelligence; it is purely **routing and state** —
the orchestrator's own job — moving a mission to a recoverable position instead of an irreversible
one.

This recovery path is **❌ ROADMAP**. No shipped code returns a mission from `failed`, and no shipped
code routes rejection anywhere but into `fail()`. Until it is built and wired, the honest status
stands: **failure is clean but unrecoverable, and human rejection is wrongly modelled as failure.**
Naming the gap precisely is the first step to closing it.

---

## 7. Boundaries — recovery is local, deterministic, and adds no intelligence

Everything in this document holds inside the same boundaries that hold across the whole platform,
and on the failure path they matter more, not less:

- **100% local.** Every recovery mechanism — the repair turn (`ai-live.ts:49-67`), the validate/
  repair loop (`manager.ts:229-253`), the idempotency guards (`routes.ts:1096`, `routes.ts:1064`),
  the failure transition (`mission.ts:209`) — runs entirely on the local machine. No retry calls a
  cloud service, no failure is reported to a vendor, no telemetry leaves the box when a stage
  repairs or a mission fails. There is no external recovery orchestrator, no remote retry queue, no
  API in the failure path.

- **Copy-only, no external data.** A repair turn re-prompts the same local model with the same
  context; it pulls in no new external data to rescue a failing stage. Recovery works with what the
  mission already has.

- **Deterministic and bounded.** Every retry has a fixed, small ceiling (§2, §3). There is no
  open-ended loop and no adaptive escalation. The same failing input produces the same bounded
  recovery behaviour on every replay — the property that makes the failure path auditable.

- **Human-sovereign.** Recovery never auto-approves and never advances a mission past a human gate
  to escape a problem. A human's "needs changes" is never treated as a failure to be automatically
  recovered from; it is a decision to be honoured (§6.3). The pipeline recovers *stage output*
  automatically; it never recovers *human judgement* automatically, because human judgement is not
  a failure to recover from.

- **No new intelligence.** Recovery is coordination — retry, dedupe, route, transition. It creates
  no capability the stages did not already have. This is the boundary the next section states in
  full.

---

## 8. No new intelligence

Failure handling and recovery, like every part of the orchestration layer, create no intelligence
of their own. It is worth stating precisely, because "self-repair" can sound like the system
getting *smarter* under pressure. It is the opposite:

- **A repair turn** runs no new model and no new strategy. It re-runs the **same** stage — the same
  model doing the same job — one more time, bounded (§3). The intelligence is the stage's; the
  orchestrator only decides to retry once and then stop.
- **An idempotency guard** computes nothing. It observes that work is already done and declines to
  redo it (§4). It routes; it does not think.
- **A failure transition** judges nothing. It records that a stage could not succeed and moves the
  mission to a clean terminal state (§5). The verdict that the work failed came from the stage, not
  the orchestrator.
- **A recovery / revision path** (❌ ROADMAP, §6) invents no new capability. It moves a mission to a
  recoverable position and re-invokes existing stages. The re-drafting is Book B's; the human's
  direction is the human's. Recovery is pure routing and state.

Every ounce of intelligence involved when something goes wrong was produced elsewhere: the draft by
Book B, its evidence by Book D, its judgement by Book E, its rationale by Book C. The orchestrator's
job on the failure path is exactly what it is on the happy path — to sequence, route, and record —
and nothing more.

> **Orchestration coordinates intelligence; it does not create intelligence.**

This is why the recovery gap in §6 is an **orchestration** defect, not an intelligence defect.
Nothing is wrong with how AdOS generates, scores, or explains a candidate when a mission is failed
or a human rejects one. What is wrong is how the pipeline **routes** those outcomes — it sequences a
recoverable situation into an irreversible state. Fixing it is a matter of routing and state
transitions, the orchestrator's own job, and touches no model.

---

## 9. Value contribution

Failure and recovery map directly to both value levers, and the recovery gap is where the mapping
is sharpest.

**It reduces production time and rework.** Bounded self-repair (§3) is already saving time on every
run: a local model that returns almost-valid JSON is corrected automatically in one repair turn
rather than surfacing as an error a human has to diagnose and re-trigger. Idempotency (§4) prevents
the rework of duplicate learning writes and duplicate executive summaries corrupting the record. But
the largest lever is the one still on the roadmap: the destructive-`fail()` gap (§6) turns every
human "change this" into a full restart from a blank brief, discarding strategy, evidence, and
drafts that were already correct. A non-destructive Revision/retry path turns that restart into a
single bounded loop — the ninety percent of the work that was already right is kept. Across a book
of missions, that is the difference between a revision costing minutes and a revision costing a
re-do.

**It grows revenue by making AdOS trustworthy at enterprise scale.** An agency will only build its
business on a system whose failures are **clean, bounded, and observable** — a system that says
"this failed, here is the signal" (§5) rather than one that hangs, silently swallows errors, or
loops forever. Deterministic, bounded recovery (§2) is what makes the platform's behaviour
predictable on the unhappy path, and predictability on the unhappy path is what an enterprise buyer
audits for. Closing the recovery gap (§6) removes the one place where the platform destroys work it
should have preserved — the difference between a system an agency can *govern and scale on* and one
that punishes every change of mind with a restart.

A single, deterministic, observable pipeline — where recovery is bounded, replay is safe, failure is
clean, and human judgement is never mistaken for a fault — turns six disconnected capabilities into
one manageable process a business can stand behind.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
