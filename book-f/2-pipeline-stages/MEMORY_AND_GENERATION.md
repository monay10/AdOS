# Memory and Generation

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

This document defines two adjacent stages of the canonical pipeline: **Memory** and
**Generation**. They sit back-to-back in the fixed order —

```
Mission → Planner → Memory → Generation → Scoring → Explanation → Human Review → Revision → Approve
```

— and together they are the seam where the platform stops *reading* what it already knows and
starts *drafting* what it will propose. Memory's one job is to **read** the context and evidence
a piece of work needs; Generation's one job is to **produce a draft** from that context and
evidence. The hand-off between them is the most consequential in the pipeline, because it is the
moment the agency's own memory becomes the raw material of a new artifact.

Neither stage owns its intelligence. Memory's intelligence is **Book D**'s — the Company Brain,
Executive Memory, and performance aggregates that make up the agency's performance memory.
Generation's intelligence is **Book B**'s — the production engine that turns a prompt and
context into a brief, a creative set, a campaign draft. This document does **not** re-derive
either book. It documents the orchestration *around* them: what Memory reads and hands forward,
what Generation consumes and produces, and the two laws that hold the seam together. For the
intelligence itself, see [Book D](../../book-d/README.md) (memory / evidence) and
[Book B](../../book-b/README.md) (production).

One sentence governs everything here, and it is the boundary of the entire exercise:

> **Orchestration coordinates intelligence; it does not create intelligence.**

The orchestrator does not invent the evidence Memory reads, and it does not write the draft
Generation produces. It reads Book D's memory into the pipeline, hands it to Book B's generation,
and collects the result. It wires two capabilities together in a fixed order — nothing more.

---

## 2. The two stages at a glance

| Stage | Its ONE responsibility | Owning book | Tier today |
|-------|------------------------|-------------|------------|
| **Memory** | Read context + evidence for the work at hand (never write it) | Book D (performance memory / evidence) | 🔶 BUILT (UNWIRED) |
| **Generation** | Produce a draft artifact from context + evidence | Book B (production) | ✅ SHIPPED / 🔶 governed |

Two facts about this row are the spine of the document:

1. **Memory is built but unwired.** The governed pipeline reads context and evidence in two
   ordered steps that exist and are tested, but run **only** inside the governed runtime — which
   is not yet wired into the live app. So the live app today generates **without a Memory
   stage**. That is the honest status, and §3.3 is explicit about it.
2. **Generation has two realizations at two tiers.** The shipped one (✅) is Book B's single-shot
   production, reached through the live services — this is what actually runs today. The governed
   one (🔶) is the runtime's inference-plus-repair step — built, tested, unwired. §5 documents
   both.

Read together, the seam is half-wired: Generation ships, Memory does not, and the design of Book
F is to put the built-unwired Memory stage in front of the shipped Generation stage so that
drafts are grounded in the agency's own evidence rather than generated cold.

---

## 3. The Memory stage

### 3.1 Two ordered steps: context, then evidence

In the governed runtime, Memory is not one call but two ordered steps, each with a single
responsibility, run in sequence inside `AIManager.runExecute`
(`packages/ai-manager/src/runtime/manager.ts:156`, reached through `submit()` at
`manager.ts:92`; the header names the whole thing "the single AI Pipeline" at `manager.ts:71`):

- **Context build (🔶 BUILT, UNWIRED)** — `context.build` at
  `packages/ai-manager/src/runtime/manager.ts:179`. Its one job is to assemble the *context* for
  the work at hand: the relevant slices of the Company Brain, the Executive Memory, and the
  performance aggregates that describe how similar work has performed before. It reads the
  agency's memory and shapes it into the frame the draft will be generated against.
- **Evidence gather (🔶 BUILT, UNWIRED)** — `evidence.gather` at `manager.ts:203`. Its one job is
  to collect the *evidence* the work should be grounded in — the concrete performance facts and
  records the downstream stages will point to. Evidence is distinct from context: context is the
  frame, evidence is the citable ground truth. Both are read from Book D.

These are two steps of one stage because they share one responsibility — **reading** what the
agency already knows — and they differ only in what they read: context shapes the prompt,
evidence grounds the claims. The runtime runs them in fixed order (context at `:179`, then
evidence at `:203`), and a confidence assessment (`confidence.assess` at `manager.ts:209`)
immediately consumes what they produced — but that assessment belongs to the Scoring band, not to
Memory, and is documented in `SCORING_AND_EXPLANATION.md`.

### 3.2 What Memory reads — Book D, read into the pipeline

Everything Memory reads originates in Book D. The Company Brain, the Executive Memory, and the
performance aggregates are Book D's capabilities; the orchestrator does not build them, own them,
or change them. It **reads** them into the pipeline so that Generation has something to draft
against.

The intended shape of that reading is documented in the canonical end-to-end sequence carried in
the header of the governed pipeline's walking-skeleton test:

```
Mission → Company Brain → Executive Memory → Context → local model →
Validation → Constitution → Decision Journal → Event Bus → CompanyBrain.enrich()
```

Memory is the `Company Brain → Executive Memory → Context` span of that sequence: a mission draws
on the company's accumulated memory to build the context the draft will be generated against.
This is precisely the boundary Book F holds — the orchestrator engages Book D at the right moment
and reads its memory forward. **It does not re-document Book D.** For how the Company Brain,
Executive Memory, and performance aggregates are built and maintained, see
[Book D](../../book-d/README.md); here, they are an input the orchestrator reads.

The steps consume their inputs through ports the runtime declares —
`ContextBuilderPort` and the `EvidenceEnginePort` contract among the orchestrator ports in
`packages/ai-manager/src/ports.ts` (imported at `manager.ts:12-33`). Those governance
dependencies are optional on the manager (`AIManagerDeps`, `manager.ts:55-66`) and are wired
**only in tests** (`walking-skeleton.test.ts:94`, `integration.test.ts:27`) — which is exactly
why the whole Memory stage sits at 🔶 rather than ✅.

### 3.3 The honest status — the live app has no Memory stage

The Memory stage runs **only** in the governed pipeline, which is instantiated only in tests. The
live application bypasses it entirely.

Every service in the live app receives a single `AIManagerPort`, built at
`apps/web/src/ai-factory.ts:23` and injected into every service by the composition root (`App`
at `apps/web/src/app.ts:71`, wired across `app.ts:84-88`). In production that port is
`LiveAIManager` (`ai-factory.ts:39`), whose `submit` (`apps/web/src/ai-live.ts:34`) does exactly
one thing: build messages → `engine.complete` → `extractJson` → one repair turn
(`ai-live.ts:49-67`). It reads **no** context and gathers **no** evidence. There is no
`context.build`, no `evidence.gather`, no Company Brain read, no Executive Memory read on the
live path. `LiveAIManager` supplies **no memory context** to generation — it drafts cold.

So the honest reading is: Memory is **built and tested but unwired**, and the live app generates
without it. Book F's design is to make the governed pipeline the engine behind the live workflow
so that the built Memory stage actually runs in front of the shipped Generation stage. Until then,
the seam this document describes is realized only in the governed runtime. `SEQUENCING_AND_STATE.md`
and `PLATFORM_ORCHESTRATION.md` carry that wiring throughline.

---

## 4. Law — the Orchestrator Never Changes Evidence

This is the law the Memory stage exists to honour, and this document owns it.

> **The orchestrator may READ, ROUTE, and SEQUENCE evidence — but never EDIT it. Evidence from
> Book D is immutable input to every stage downstream of Memory.**

Memory reads evidence (`evidence.gather`, `manager.ts:203`) and passes it forward. It does not
adjust a number, reweight a record, drop an inconvenient fact, or synthesize a missing one. What
Book D produced is what Generation, Scoring, and Explanation receive — byte for byte. The
orchestrator's only verbs on evidence are **read**, **route**, and **sequence**:

- **Read** — Memory pulls the evidence Book D holds.
- **Route** — the pipeline hands that same evidence to Generation (to draft against), to Scoring
  (to evaluate against), and to Explanation (to cite).
- **Sequence** — the pipeline decides *when* each downstream stage sees the evidence, never
  *what* the evidence says.

**Why this matters.** Evidence is the trust layer of the whole platform. A reviewer approving a
draft, and an auditor reasoning about a run after the fact, both rely on the evidence being an
untouched record of what actually happened — Book D's facts, not the orchestrator's edited version
of them. The instant an orchestration stage could rewrite evidence on its way through the
pipeline, the evidence would stop being evidence and become opinion. Keeping evidence immutable is
what lets the agency trust that the ground beneath a decision is real.

This law also draws Book F's boundary sharply. Editing evidence would be *creating intelligence* —
manufacturing a new claim about performance that Book D never made. That is forbidden by the
founding sentence:

> **Orchestration coordinates intelligence; it does not create intelligence.**

**How the design enforces it.** Evidence enters the pipeline exactly once, at `evidence.gather`,
and travels through every subsequent stage as a read-only input. The downstream stages consume it
through their own ports (`packages/ai-manager/src/ports.ts`); none is handed a writable handle
back into Book D's stores. Structurally, a stage physically cannot edit evidence it was given only
to read. The governed runtime carries this evidence forward into its frozen execution record
unchanged — the immutability is a property of the whole run, not a courtesy of one stage.

---

## 5. The Generation stage

Generation's one job is to **produce a draft artifact** from the context and evidence Memory
supplied — a brief, a creative set, a campaign draft. It does not gather its own evidence, and it
does not score its own output; it drafts, and hands the draft forward. The stage has two
realizations at two tiers.

### 5.1 Shipped generation — Book B single-shot (✅ SHIPPED)

This is what runs live today. Every live service that produces an artifact does so by calling the
injected `AIManagerPort`, and in production that is `LiveAIManager.submit`
(`apps/web/src/ai-live.ts:34`): build the messages, call `engine.complete`, extract the JSON
result (`extractJson` at `ai-live.ts:179`), and — if the first result does not parse — take one
repair turn (`ai-live.ts:49-67`). It is **single-shot** production: one governed generation
call per artifact, with a single self-repair attempt. The intelligence is Book B's; the
orchestrator merely invokes it through the port and collects the draft.

The live services reach this through the mission workflow — for example brief generation runs
`generateBrief` (`apps/web/src/routes.ts:899`) → `app.briefs.generate` (`routes.ts:921`), and the
creative and campaign services generate the same way. In every case the service asks the injected
`AIManagerPort` to produce the artifact; Book F's contribution is the *sequencing* of those
generation calls inside the mission, not the generation itself.

There is also a fully offline realization: `OfflineAIManager` (`ai-factory.ts:27`), whose `submit`
(`apps/web/src/ai.ts:16`) returns deterministic canned JSON (`ai.ts:36-54`) with no model call at
all. It is the deterministic stub — the same mission produces the same bytes every time — and it
is the anchor for the determinism law in §7.

**What ships, honestly:** Generation is real and wired. What it lacks live is the Memory stage in
front of it (§3.3) — the shipped generation drafts from the prompt the service builds, not from a
`context.build` / `evidence.gather` read of Book D.

### 5.2 Governed generation — inference plus validate/repair (🔶 BUILT, UNWIRED)

The governed alternative lives inside the runtime pipeline: the inference step at
`packages/ai-manager/src/runtime/manager.ts:229-253`. Its one job is the same — produce a draft —
but it wraps the inference in a **validate-and-repair** loop: the runtime runs the local model,
validates the result, and if validation fails, repairs and retries up to `maxValidationRetries`
(default `1` at `manager.ts:89`). It is preceded by a routing step (`router.route` at
`manager.ts:216`) that selects the engine, and followed by the safety/constitution checks — but
those belong to the Scoring band and are documented in `SCORING_AND_EXPLANATION.md`. Generation
proper is the inference-plus-repair span at `:229-253`.

This realization is **built and tested but unwired** — it runs only inside the governed pipeline,
instantiated only in tests (`walking-skeleton.test.ts:94`, `integration.test.ts:27`). No live
path executes it, which is why it is 🔶 while the single-shot path is ✅. The design difference
that matters: the governed generation runs *after* a real Memory stage (context + evidence),
whereas the shipped single-shot path runs without one.

Both realizations run a **local** model. Neither calls a cloud service, an external API, or a
vendor endpoint. Generation, in either form, is production the agency runs on its own machine.

---

## 6. Law — Every Stage Has One Responsibility

Memory and Generation are the clearest illustration of the law that each stage does exactly one
job and no stage takes another's.

- **Memory provides context and evidence. It does not generate.** `context.build` and
  `evidence.gather` read Book D and hand forward; they draft nothing. Memory holds no model.
- **Generation produces a draft. It does not gather evidence.** The inference step consumes the
  context and evidence it was given; it does not reach back into Book D to collect more, and it
  does not read the Company Brain itself. Generation holds no memory.

The boundary is not tidiness for its own sake — it is what keeps the seam observable and
debuggable. When a draft is grounded in the wrong facts, the fault is in Memory's read; when the
facts are right but the draft is wrong, the fault is in Generation. Because each stage does one
job, exactly one stage is wrong, and its input and output are both inspectable. A stage that both
gathered evidence *and* generated from it would blur that line and, worse, would let generation
quietly shape the evidence it drafts against — a step toward *creating* intelligence rather than
coordinating it.

The governed runtime is built to this law structurally: `context.build` (`:179`),
`evidence.gather` (`:203`), and the inference step (`:229-253`) are separate calls through
separate ports (`packages/ai-manager/src/ports.ts`), so one physically cannot execute another's
logic. Memory reads; Generation drafts; the hand-off between them is a typed input, not a shared
mutable workspace.

---

## 7. Law — Orchestration is Deterministic

The seam is designed to be deterministic in its orchestration:

> **Same Mission + same Context + same Memory → same Generation inputs.**

Given the same mission, the same context built by `context.build`, and the same evidence gathered
by `evidence.gather`, the pipeline hands Generation exactly the same inputs, in the same order,
every time. The orchestrator never self-selects a different Memory read or a different generation
path at runtime — Memory always runs before Generation, context always before evidence, and the
inputs to Generation are a fixed function of what Memory read.

Two honest distinctions keep this claim precise:

- **The offline stub is fully deterministic.** `OfflineAIManager.submit` (`apps/web/src/ai.ts:16`)
  returns canned JSON (`ai.ts:36-54`): identical inputs produce byte-identical output, always. On
  the offline path, the whole seam — Memory inputs and Generation output alike — is reproducible
  end to end.
- **Live generation is model-driven; the orchestration around it is deterministic.** When
  `LiveAIManager` runs a real local model (`engine.complete`), the *content* of the draft is a
  property of the model, and a model may not be bit-for-bit reproducible. What Book F guarantees
  is not that the model returns the same tokens — that is Book B's concern — but that the
  *orchestration* is deterministic: the same stages in the same order, the same inputs assembled
  and handed to Generation, the same single repair turn on a parse failure (`ai-live.ts:49-67`),
  the same validate/repair bound in the governed path (`maxValidationRetries` default `1`,
  `manager.ts:89`). The pipeline's shape does not vary at runtime, even when the model's output
  does.

Determinism of orchestration is what makes the seam trustworthy: a reviewer who has seen one run
has seen the shape of every run, and an auditor can reason about *what was fed to Generation*
because the feeding is a fixed function of Memory, not a runtime choice.

---

## 8. No new intelligence

It is worth stating plainly what this seam is *not*. Memory is not the Company Brain — it reads
it. Generation is not the production engine — it invokes it. Between them the orchestrator holds
no intelligence of its own:

- Memory's intelligence is **Book D**'s — the Company Brain, Executive Memory, and performance
  aggregates. The orchestrator reads them (`context.build`, `evidence.gather`); it does not build,
  own, or edit them.
- Generation's intelligence is **Book B**'s — the production engine. The orchestrator invokes it
  (`LiveAIManager.submit` live; the runtime inference step in the governed pipeline); it does not
  define how a draft is produced.

Book F's whole contribution across this seam is **wiring**: it reads Book D's memory into Book B's
generation, in a fixed order, with evidence kept immutable. It manufactures no evidence and writes
no draft. When a capability behind a stage is unbuilt or unwired, the orchestrator does not fill
the gap with an improvised heuristic — it names the stage, holds its place, and marks its tier
honestly (Memory 🔶, governed Generation 🔶).

> **Orchestration coordinates intelligence; it does not create intelligence.**

This is the sibling of the boundary the other books draw. Where Book E adds "no new data," Book F
adds "no new intelligence, only orchestration." The seam's entire value is in running Book D's
memory into Book B's generation at the right moment, in a fixed and observable order — it
originates neither the memory nor the draft.

---

## 9. Boundaries

Memory and Generation run entirely within the platform's standing boundaries:

- **100% local, offline-first.** Both Generation realizations run a local model; Memory reads the
  agency's own performance memory. No stage calls a cloud service, external API, or connector.
- **Copy only, no external data.** Memory reads the agency's own Company Brain, Executive Memory,
  and performance aggregates; Generation drafts from them. Neither ingests third-party data or
  emits vendor telemetry.
- **Evidence is read-only.** Memory reads Book D's evidence and the pipeline routes it onward
  unchanged (§4). No stage edits evidence.
- **Orchestrates, does not redesign.** This document references [Book D](../../book-d/README.md)
  for memory/evidence and [Book B](../../book-b/README.md) for production. It does not
  re-document or redesign them; it sequences them.
- **Human-sovereign.** Nothing at this seam finalizes anything. A generated draft is exactly that
  — a draft — awaiting the Scoring, Explanation, and Human Review stages that follow. Generation
  never auto-approves its own output.

---

## 10. Value contribution

Grounding generation in the agency's own memory is a direct lever on both axes an agency measures.

- **Reduces production time.** A draft generated against the Company Brain, Executive Memory, and
  performance aggregates (Memory) starts closer to right than a draft generated cold. Less rework,
  fewer review cycles, faster throughput — the agency's accumulated knowledge is applied
  automatically instead of being re-supplied by hand on every job. The single-responsibility split
  (Memory reads, Generation drafts) also means a wrong draft has exactly one inspectable cause,
  cutting debugging time.
- **Increases agency revenue.** A draft that is evidence-grounded and produced by a deterministic,
  observable orchestration is one a reviewer can trust and an auditor can reason about. That trust
  — evidence kept immutable, generation reproducible in shape — is what makes AdOS an
  enterprise-manageable platform an agency can scale on. The agency's memory becomes a compounding
  asset: every past result quietly improves the next draft.

The honest status keeps the promise measurable: Generation ships today (✅), Memory is built and
waiting (🔶), and the design is to run the one in front of the other. Wiring the built Memory
stage ahead of the shipped Generation stage is the single highest-leverage move at this seam —
it turns cold generation into evidence-grounded production without adding any new intelligence,
only orchestration.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
