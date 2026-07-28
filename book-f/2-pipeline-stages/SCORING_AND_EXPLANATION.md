# Scoring and Explanation

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

This document defines the two consecutive stages that sit at the middle of the pipeline, after a
draft has been generated and before a human is asked to decide:

```
… → Generation → Scoring → Explanation → Human Review → …
```

**Scoring** takes the draft produced by the Generation stage and *evaluates* it — it asks how
good the draft is against the dimensions of creative judgement. **Explanation** takes that draft,
its evidence, and its score and *renders the rationale* — it assembles the human-readable account
of why the work is what it is and why it should be trusted.

These two stages are where the platform's *intelligence about quality* enters the run. But the
intelligence itself does not live here. Scoring is the work of **Book E — Creative Judgement**;
Explanation is the work of **Book C — The Trust Layer**. This document is the layer above both:
given a scoring capability and an explanation capability, **in what fixed order does the
orchestrator run them, what does each read, and what does each hand to the next?** It does not
re-derive how a score is computed or how an explanation is composed — those belong to their own
books and are referenced, not duplicated.

> **Orchestration coordinates intelligence; it does not create intelligence.**

The orchestrator **invokes** Scoring and Explanation; it does not define the score and it does
not author the explanation. It sequences them, hands each the inputs it is owed, and forwards
their outputs to the human gate. Nothing in this document computes a creative judgement or writes
a rationale — every such capability is supplied by Book E or Book C and is tagged with the tier
at which it exists today.

---

## 2. The two stages in one sentence each

- **Scoring — evaluate the draft.** Read the draft and its evidence; produce a multi-dimensional
  creative judgement (Book E). The orchestrator runs this stage; Book E decides the number.
- **Explanation — explain the rationale.** Read the draft, its evidence, and its score; produce
  the human-readable account of *why* (Book C). The orchestrator runs this stage; Book C decides
  the words.

The order is fixed: **score, then explain.** You cannot render a rationale that includes the
score before the score exists. Section 8 states this ordering as a determinism obligation.

---

## 3. The Scoring stage — evaluate with Book E

### 3.1 What the stage is for

The Scoring stage answers a single question: *how good is this draft?* It does not generate the
draft (that was the previous stage), it does not explain the draft (that is the next stage), and
it does not decide whether the draft is accepted (that is the human gate). It **evaluates** — it
turns a draft plus its evidence into a structured, multi-dimensional judgement of creative
quality.

The judgement itself is the subject of **Book E — Creative Judgement**. See
[`../../book-e/README.md`](../../book-e/README.md) for the dimensions, the rubric, and the
reproducibility guarantees. Book F does not re-open any of that. Book F's concern is narrow:
the Scoring stage is a slot in the pipeline that **invokes** Book E at a fixed point, hands it
the draft and the upstream evidence, and receives a score back. **The orchestrator invokes
scoring; it does not define the score.**

### 3.2 What exists today, by tier

In the governed runtime pipeline (`AIManager.runExecute`,
[`packages/ai-manager/src/runtime/manager.ts:156`](../../packages/ai-manager/src/runtime/manager.ts)),
the stages nearest to "evaluate the draft" are the two post-generation gate checks that run after
inference:

- **safety-out** — `manager.ts:256`. A rule/gate check applied to the generated output.
  **🔶 BUILT (UNWIRED)** — the code and tests exist; there is no live path that runs it.
- **constitution** — `manager.ts:261`. A governance check that **throws if `!verdict.passed`**,
  stopping the run when the output violates the constitution. **🔶 BUILT (UNWIRED)** — code and
  tests exist; no live path.

These two are *rule/gate* evaluations: they answer "is this output allowed?" with a pass/fail
verdict. They are the built, concrete evaluation the pipeline performs today, and they are the
nearest thing in the running code to a Scoring stage.

Full **creative** scoring — the multi-dimensional aesthetic and strategic judgement of Book E —
is a different and richer thing than a pass/fail gate. In the pipeline it ranges from
**🔶 BUILT (UNWIRED)** where Book E capability exists as code without a live path, to
**❌ ROADMAP** where the scoring dimension is designed but not yet implemented. The Scoring
stage is the fixed point at which that judgement, at whatever tier it reaches, is invoked; it is
not the judgement.

| Sub-capability | Tier | Reference |
| --- | --- | --- |
| safety-out gate check on the generated output | 🔶 BUILT (UNWIRED) | `manager.ts:256` |
| constitution check (throws if `!verdict.passed`) | 🔶 BUILT (UNWIRED) | `manager.ts:261` |
| full multi-dimensional creative scoring | 🔶 / ❌ | Book E |

### 3.3 What the stage reads and what it produces

**Reads:** the draft handed down by the Generation stage, and the evidence gathered upstream at
the Memory stage (`evidence.gather`, `manager.ts:203`). Scoring is an evaluation *of a draft
against evidence* — it needs both.

**Produces:** a structured judgement. For the built gate checks that is a `verdict` with a
`passed` flag (`manager.ts:261`); for full Book E scoring it is the multi-dimensional score
object Book E defines. Either way the output is a *reading* of the draft, not a new draft and not
a decision. It is handed forward to the Explanation stage.

The Scoring stage never mutates the draft and never mutates the evidence. It interprets them.
Section 6 makes this a law.

---

## 4. The Explanation stage — explain with Book C

### 4.1 What the stage is for

The Explanation stage answers a different single question: *why is this draft what it is, and why
should it be trusted?* It does not evaluate the draft (that was the previous stage) — it takes the
score as given and renders the rationale around it. It turns a draft, its evidence, and its score
into the human-readable account that will accompany the work to the human gate.

The explanation itself is the subject of **Book C — The Trust Layer**. See
[`../../book-c/README.md`](../../book-c/README.md) for how trust is constructed, what an
explanation contains, and how evidence and confidence are surfaced to the human. Book F does not
re-open any of that. The Explanation stage is a slot in the pipeline that **invokes** Book C at a
fixed point, hands it the draft, the evidence, the confidence, and the score, and receives a
rendered rationale back. The orchestrator invokes explanation; it does not author the words.

### 4.2 What exists today, by tier

In the governed runtime pipeline the two stages that produce the raw material an explanation
renders are the evidence and confidence stages that run *before* generation:

- **evidence.gather** — `manager.ts:203`. Assembles the evidence used for the run.
  **🔶 BUILT (UNWIRED)** — code and tests exist; no live path.
- **confidence.assess** — `manager.ts:209`. Assesses confidence in the run.
  **🔶 BUILT (UNWIRED)** — code and tests exist; no live path.

Together these produce the *evidence + confidence* that a trust-layer explanation renders into a
human-readable rationale. They are 🔶 today: built, unwired, present only when the governed
pipeline is instantiated (which happens only in tests).

The full explanation *reaching the human* — the rendered rationale attached to the work at the
review gate — ranges from **🔶 BUILT (UNWIRED)** where Book C capability exists as code without a
live path, to **❌ ROADMAP** where the surfacing is designed but not yet implemented. The
Explanation stage is the fixed point at which the evidence and confidence produced upstream are
turned into that rationale; it is not the rationale.

| Sub-capability | Tier | Reference |
| --- | --- | --- |
| evidence.gather (the evidence an explanation renders) | 🔶 BUILT (UNWIRED) | `manager.ts:203` |
| confidence.assess (the confidence an explanation renders) | 🔶 BUILT (UNWIRED) | `manager.ts:209` |
| rendered explanation reaching the human | 🔶 / ❌ | Book C |

### 4.3 What the stage reads and what it produces

**Reads:** the draft, the evidence gathered upstream (`evidence.gather`, `manager.ts:203`), the
confidence assessed upstream (`confidence.assess`, `manager.ts:209`), and the score produced by
the Scoring stage. An explanation that omitted the score would not explain the judgement; an
explanation that recomputed the evidence would no longer be trustworthy.

**Produces:** a rendered, human-readable rationale — the trust-layer artifact that travels with
the draft into Human Review. It is a *rendering* of inputs that already exist. It creates no new
evidence, no new score, and no new draft. Section 6 makes that a law.

---

## 5. The handoff between the two stages

Scoring and Explanation are consecutive, and the boundary between them is a clean, one-directional
handoff. It is worth stating precisely, because a sloppy boundary is exactly how the
one-responsibility law (Section 7) gets broken in practice.

**What Scoring hands to Explanation:** the score — a structured judgement of the draft. Nothing
more. Scoring does not hand forward a partly-written rationale, a recommendation about what to
tell the human, or an edited copy of the evidence. It hands a reading of the draft.

**What Explanation is *not* allowed to hand back:** anything. The handoff is one-directional.
Explanation never asks Scoring to re-evaluate, never revises the score to make the rationale read
better, and never edits the evidence its rationale points at. If the explanation would only be
convincing with a different score, that is not a signal to change the score — it is a signal the
score is what it is, and the rationale must be honest about it.

**What both stages share as read-only inputs:** the draft (from Generation), the evidence
(`evidence.gather`, `manager.ts:203`), and the confidence (`confidence.assess`, `manager.ts:209`).
Both read the same immutable upstream material. Only the score flows *between* them, and it flows
one way.

This boundary is what lets the pipeline be reasoned about one stage at a time. The Scoring stage
can be verified against Book E's rubric without knowing anything about how the rationale will
read; the Explanation stage can be verified against Book C's trust contract taking the score as a
fixed given. Neither stage has to reach into the other.

---

## 6. Law — the orchestrator never changes evidence

**LAW: The orchestrator never changes evidence.** Evidence produced upstream — by Book D through
the Memory stage, gathered at `evidence.gather` (`manager.ts:203`) and assessed at
`confidence.assess` (`manager.ts:209`) — is immutable to everything downstream. The orchestrator
may **read**, **route**, and **sequence** evidence; it may never **edit** it.

Scoring and Explanation are the two stages most tempted to break this law, because both consume
evidence directly. Both are held to it:

- **Scoring reads the evidence; it does not edit it.** The score *interprets* the evidence —
  it turns evidence about a draft into a judgement of the draft. Interpreting evidence is not
  changing it. A run scored twice against the same immutable evidence yields the same
  interpretation.
- **Explanation reads the evidence; it does not edit it.** The explanation *renders* the
  evidence — it turns evidence and confidence into human-readable form. Rendering evidence is not
  changing it. The rationale points at the evidence; it never rewrites it.

Neither stage mutates the evidence, and neither stage mutates the other's output-in-progress.
This is what makes the trust layer trustworthy: the same evidence that justified a draft is the
same evidence the human sees explained. If Scoring or Explanation could quietly edit evidence to
make a draft look better, no score and no rationale downstream could be believed. The law keeps
evidence a fixed spine that these stages consult but never touch.

The score interprets evidence; the explanation renders it — **neither mutates it.**

---

## 7. Law — every stage has one responsibility

**LAW: Every stage has one responsibility.** No stage takes another stage's job. For this pair:

- **Scoring = evaluate.** Its one job is to judge the draft. It does **not** explain — it does
  not compose the human-readable rationale, and it does not decide what the human is told.
- **Explanation = explain.** Its one job is to render the rationale. It does **not** score — it
  does not compute or revise the judgement; it takes the score as an input and explains around it.

The two responsibilities are cleanly separated and must stay that way. Scoring does not explain;
Explanation does not score. The separation mirrors the books each stage invokes: Scoring mirrors
**Book E** (creative judgement — the evaluation), Explanation mirrors **Book C** (the trust layer
— the rationale). Keeping the stages as clean as the books keeps two very different concerns from
bleeding into one another:

- If Scoring began explaining, the judgement would start being shaped by what is easy to justify
  rather than by what is true — the score would bend toward a good story.
- If Explanation began scoring, the rationale would start re-deciding quality instead of
  reporting it — the human would be shown a judgement that no evaluation stage ever made.

One stage, one responsibility. The Scoring stage evaluates and hands a score forward; the
Explanation stage explains and hands a rationale forward. Each does exactly one thing, and does
it once.

---

## 8. Law — deterministic, and the order is fixed

**LAW: Orchestration is deterministic.** Same Mission + Same Context + Same Memory → same
pipeline, same stage order. Two facts follow for this pair.

**Scoring is deterministic.** The evaluation is reproducible: the same draft against the same
immutable evidence yields the same score. This is Book E's reproducibility guarantee (see
[`../../book-e/README.md`](../../book-e/README.md)); the Scoring stage inherits it by invoking
Book E rather than inventing a judgement of its own. A judgement that changed run to run against
identical inputs would make the human gate meaningless — the same work could be scored high on
Monday and low on Tuesday. Determinism is what lets a score mean something.

**The order — score THEN explain — is fixed.** The orchestrator does not self-select whether to
explain before it scores, and it does not skip scoring on some runs and not others. The sequence
is a fixed property of the pipeline, not a runtime choice:

1. **Score** — evaluate the draft against evidence (Book E).
2. **Explain** — render the rationale, *including the score*, from draft + evidence + confidence
   (Book C).

Explanation depends on the score as an input, so score-then-explain is also the only order that
type-checks: you cannot render a rationale that reports a judgement that has not been made. The
determinism law and the data dependency point the same way, and the orchestrator never reorders
them at runtime.

---

## 9. Honest status — today the live app does neither

Both stages described here are the **design**. The honest tier is that today the live application
performs **neither** creative scoring nor a trust-layer explanation on its live path.

The live app injects a single AI manager into every service; in production that manager is
`LiveAIManager` (`apps/web/src/ai-factory.ts:39`). `LiveAIManager.submit`
(`apps/web/src/ai-live.ts:34`) builds messages, calls the engine, extracts JSON, and takes at
most one repair turn — **and runs zero governed stages.** It does not gather evidence, it does not
assess confidence, it does not run the safety-out or constitution checks, and it does not invoke
Book E scoring or Book C explanation. The governed pipeline that contains all of those stages is
instantiated **only in tests**; the live app bypasses it entirely.

So the honest status is:

- **Scoring on the live path:** none. The safety-out (`manager.ts:256`) and constitution
  (`manager.ts:261`) gate checks are 🔶 BUILT (UNWIRED); full creative scoring is 🔶 / ❌; no
  creative scoring reaches the live path today.
- **Explanation on the live path:** none. The evidence (`manager.ts:203`) and confidence
  (`manager.ts:209`) stages that an explanation renders are 🔶 BUILT (UNWIRED); the explanation
  reaching the human is 🔶 / ❌; no trust-layer rationale reaches the live path today.

There is no contradiction between "this is the design" and "the live app does neither." Both
stages exist as built, unwired capability behind the governed pipeline. **Wiring the governed
pipeline as the live engine is what lights them up** — it is the single change that moves Scoring
and Explanation from 🔶 behind the tests to ✅ on the live path. Until then, this document
describes the target, and says so plainly.

---

## 10. No new intelligence

Orchestration **sequences** Book E scoring and Book C explanation; it **creates neither.** The
Scoring stage does not know how to judge creative quality — Book E does, and the stage invokes it.
The Explanation stage does not know how to construct trust — Book C does, and the stage invokes
it. The orchestrator's entire contribution is to run the right book at the right point, hand it
the right inputs, and forward its output; the judgement and the rationale are supplied, never
authored, by the orchestration layer.

This is the Book F sibling of Book E's "no new data" and Book D's immutable-evidence discipline:
Book F adds **no new intelligence, only orchestration.** A score the orchestrator did not compute
and a rationale the orchestrator did not write are exactly the point — if orchestration started
inventing scores or explanations, it would stop being a coordinator and start being an
uncontrolled, unaccountable source of judgement.

> **Orchestration coordinates intelligence; it does not create intelligence.**

---

## 11. Boundaries

These stages honour the same boundaries as the rest of AdOS:

- **100% local, offline-first.** Scoring and Explanation run entirely on local capability. No
  cloud service is called to score a draft or to explain one.
- **Copy only.** These stages read the draft, the evidence, the confidence, and the score, and
  produce an interpretation and a rendering — they move and transform copy; they reach no external
  system.
- **No external data.** The evidence a score interprets and an explanation renders is the evidence
  gathered upstream from local memory; nothing is fetched from outside the workspace.
- **No vendor telemetry.** No score, no rationale, and no evidence is emitted to any third party.
  What is produced here stays in the run and goes to the human.
- **Human-sovereign.** Scoring and Explanation *inform* the human gate; they do not replace it. A
  high score never auto-approves, and a confident explanation never decides. The score and the
  rationale exist to let a person judge; the person still judges. The human gate is a first-class
  stage, never an automatic pass.

- **Book boundaries.** This document references Book E and Book C; it does not re-document or
  redesign either. Scoring's judgement is defined in [`../../book-e/README.md`](../../book-e/README.md);
  Explanation's rationale is defined in [`../../book-c/README.md`](../../book-c/README.md).
  Book F orchestrates them and adds no intelligence of its own.

---

## 12. Value contribution

A draft that is generated but never evaluated and never explained is a liability: a person must
read it cold, judge it unaided, and take it on faith. Scoring and Explanation are what turn a raw
draft into a **reviewable** one.

- **Reduces production time.** A deterministic score tells a reviewer *where* to look and *how
  good* the work is before they read a word; a rendered rationale tells them *why* it is what it
  is and *why* the evidence supports it. The reviewer spends their time deciding, not
  reconstructing the work's justification from scratch. Rework drops because a low score is caught
  and explained before the work goes further down the pipeline.
- **Increases agency revenue.** A score a client can trust and a rationale a person can stand
  behind are what make AI creative *defensible* — the difference between "the machine made this"
  and "here is the judgement, here is the evidence, here is why." That defensibility is what lets
  an agency put AdOS in front of enterprise clients and scale on it. A single deterministic,
  observable, human-gated evaluation-and-explanation step turns two disconnected capabilities into
  one manageable stage of a trustworthy process.

Both gains come from *sequencing* existing intelligence into a fixed, reproducible order — not
from adding any. The orchestrator's value here is the reliability of the process, not the content
of the judgement.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
