# Campaign Intelligence Constitution

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. **This is the
> governing document of Book C** — every other Book C artifact is subordinate to the laws,
> boundaries, and truth model declared here.
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 0. Preamble — what this document governs

This is the constitution of **Book C — Campaign Intelligence**. It is the highest authority
in the book. Where any other Book C document appears to conflict with the text below, this
document controls, and the other document is to be corrected, not this one.

AdOS is the **Enterprise AI Operating System for Advertising**. Book B established how the
system *produces* work. Book C establishes something narrower and, for an enterprise buyer,
often more decisive: **how the system explains why it recommended what it recommended.**

A generic large-language-model tool produces an answer and asks you to trust it. AdOS is
built to do the opposite. The value-proposition sentence that this entire book exists to
make literally true is:

> "AdOS does not just produce recommendations; it can explain every recommendation using
> its own campaign memory."

Everything in Book C — every engine, every journal entry, every confidence score, every
provenance badge — is in service of that one sentence. This constitution declares the four
laws that make it enforceable, the honesty model that keeps it truthful, and the boundaries
that keep it safe.

---

## 1. The Trust Layer — Book C's single question

Book C is the **Trust Layer** of AdOS. It answers exactly one question, and it answers it
about work the system has already produced:

> **"Why did the AI recommend this?"**

Not "what should I do next" (that is production). Not "how does the system get better over
time" (that is learning). Only: *given this recommendation, show me the reasoning, the
evidence, the confidence, the alternatives that were weighed, and the decision that was
recorded — so that a human can judge it.*

The Trust Layer is where an enterprise account is won or lost. A media agency does not buy
a black box. It buys something it can defend to a client, to a compliance reviewer, and to
its own creative directors. The Trust Layer is the surface where AdOS becomes defensible.

To be precise about scope, the Trust Layer is also defined by what it is *not*. It is not a
second opinion generated after the fact — it does not invent a new justification to make an
answer look reasonable. It reads back the reasoning that was actually recorded when the
recommendation was made, and presents that. An explanation that was manufactured
independently of the decision would be a rationalization, not an explanation, and it would
break the trust the layer exists to build. The Trust Layer explains the decision that
happened; it never dresses up a decision that didn't.

### 1.1 Value contribution

Explainability is not decoration; it is a revenue-and-time lever, and this document treats
it as one.

- **Revenue (agency wins and retains accounts).** Trust is the deciding factor in
  enterprise advertising software. A tool that can show its work differentiates itself
  permanently from "we asked an LLM." Reviewers, clients, and legal teams approve work they
  can see justified; they walk away from work they cannot. Explainability is how AdOS turns
  a recommendation into a *defensible* recommendation, and defensibility is what closes and
  renews contracts.
- **Production time (reduced reviewer decision time).** A reviewer who is handed a
  recommendation *and* its evidence and confidence approves faster than a reviewer forced to
  privately re-derive "do I actually believe this?" from scratch. The Trust Layer collapses
  that re-derivation. Every downstream Book C document must state its own concrete
  contribution to one or both of these outcomes; this constitution establishes the theme.

---

## 2. The book boundary — B, C, D, E

Book C holds a deliberately strict boundary. The four books of the AI story do not overlap,
and this constitution forbids any Book C document from reaching across the lines below.

| Book | Question it answers | Status |
| --- | --- | --- |
| **Book B** | How the AI *produces* work. | done |
| **Book C** | How the AI *explains why it recommended* something. | **this book** |
| **Book D** | How the AI *learns* (Memory → Knowledge → Pattern → Recommendation loop). | later |
| **Book E** | How the AI *produces better* (creative combinations). | later |

Two consequences of this boundary are binding on the whole of Book C:

1. **Book C is the read/explain side of gap B-2 only.** Book B produces; Book C reads that
   production back and explains it. Book D will build the *write/learn* side of the same
   gap. Book C therefore describes how to surface and justify a recommendation that already
   exists — it does **not** design the learning loop, and it does **not** design
   creative-combination learning. Those belong to Book D and Book E respectively.
2. **When a Book C topic naturally pulls toward learning, it stops at the boundary and says
   so.** The clearest example is Law 2 below: the gap between confidence and truth is real,
   but *narrowing that gap over time is Book D's job, not Book C's.* Book C's duty is to
   present the gap honestly, never to close it.

Book C is the explanation of the present. It reads what was produced, and it tells the human
why.

---

## 3. The four governing laws

Book C rests on four laws. This constitution declares all four formally; individual
downstream documents operationalize the law that is theirs to build. No Book C document may
contradict a law here.

### LAW 1 — The Evidence First Law

**Declaration.** No output may be presented *as a recommendation* unless it can show the
evidence behind it. A recommendation without evidence is not a recommendation; it is an
assertion, and AdOS does not ship assertions dressed as advice.

Every genuine recommendation must be expressible in this mandated shape:

```
Recommendation → Evidence → Confidence → Alternatives → Decision
```

- **Recommendation** — the thing being advised.
- **Evidence** — the concrete, inspectable basis for it (performance history, patterns,
  prior outcomes).
- **Confidence** — how strongly the system holds the recommendation (see Law 2).
- **Alternatives** — what else was considered, and why it was not chosen.
- **Decision** — what was actually recorded, and what the human is asked to do.

**Rationale.** The first thing that distinguishes AdOS from a chat window is that it refuses
to say "the LLM said so." An enterprise reviewer cannot act on "the LLM said so," cannot
defend it to a client, and cannot be held accountable for it. Evidence-first output is what
makes a recommendation *auditable* — and auditability is the whole product.

**How it is enforced.** The chain is grounded, not aspirational. Today the live app already
records a decision together with its evidence, alternatives, chosen and rejected options,
and confidence into the Decision Journal on write
(`apps/web/src/routes.ts:1118`), building `evidence[]` and a
`confidence{score,reason,basis}` object from real campaign figures — for example
`reason: "Based on ${roas}x ROAS"` at `apps/web/src/routes.ts:1123-1130`. That shipping
shape is hand-rolled. The engine designed to *generate* evidence rigorously — the
`BrainEvidenceEngine` at `domains/executive-memory/src/reasoning.ts:14` — carries the law in
its own source comment ("No recommendation is ever 'the LLM said so'"), but it is 🔶 BUILT
(UNWIRED): it is unit-tested and consumed only by the unwired runtime, not by any live
route. Law 1 is therefore **partly shipped in shape, and fully specified in engine**; C003
(`../2-grounded-recommendation/EVIDENCE_ENGINE.md`) operationalizes the engine.

### LAW 2 — Confidence ≠ Truth

**Declaration.** Confidence and truth are two different things, and AdOS must never let a
user confuse them.

- **Confidence** = the system's own belief in the recommendation — how strongly it holds
  its advice given what it knows.
- **Truth** = whether the recommendation actually turns out right in reality.

These are not the same quantity. **A 95%-confidence campaign can fail. A 40%-confidence
campaign can be the single best performer.** Confidence is a statement about the system's
internal state; truth is a statement about the world. Presenting a confidence number as if
it were a probability of success would be a lie, and this constitution forbids it.

**Rationale.** Confidence is honest exactly when it is understood as belief and not as
guarantee. A reviewer who reads "95%" as "this will work" has been misled; a reviewer who
reads "95%" as "the system holds this strongly, and here is why" has been informed. The
distinction is both scientifically correct and commercially correct: it protects the client
relationship from the one failure mode that destroys trust permanently — a confident promise
that did not come true and was never hedged.

**How it is enforced.** Confidence is always presented *with* its basis, never as a bare
verdict. The live app already displays a confidence score alongside its reason
(`apps/web/src/routes.ts:837`), and the `HeuristicConfidenceEngine`
(`domains/executive-memory/src/reasoning.ts:62`, 🔶 BUILT-UNWIRED) is designed to compute
that score by blending evidence strength, breadth, and prior success
(`domains/executive-memory/src/reasoning.ts:82`) into an inspectable reason string such as
"Based on 382 campaigns, ROAS 5.8" (`domains/executive-memory/src/reasoning.ts:91`).
Crucially, **narrowing the gap between confidence and truth over time is Book D's job, not
Book C's.** Book C's obligation is to *show* the gap; Book D will build the learning that
calibrates it. C004 (`../2-grounded-recommendation/CONFIDENCE_MODEL.md`) owns this law and
restates the Book D boundary in full.

### LAW 3 — The Explainability Contract

**Declaration.** Every AI output must one day be able to answer, in full, an eight-field
minimum. This set of eight fields is the **Explainability Contract**, and it is destined to
become the standard shape of the AdOS user interface — the fixed frame that every
recommendation is rendered into.

The eight fields:

1. **Recommendation** — what the system advises.
2. **Why?** — the reasoning in one human sentence.
3. **Evidence** — the concrete data behind the reasoning.
4. **Confidence** — the system's belief, with its basis (per Law 2).
5. **Alternative considered** — what else was weighed, and why it lost.
6. **Brand rules checked** — which guardrails were verified.
7. **Memory consulted** — which campaign memory informed the answer.
8. **Human action required** — what the human must now decide or approve.

**Rationale.** A contract is stronger than a convention. By fixing eight fields as the
*minimum* any output must support, AdOS makes explainability a structural property of the
product rather than a best effort. The contract also encodes the human-sovereign promise
directly into the interface: field 8 exists in every output because a human always acts, and
field 6 exists because brand rules are always checked. The contract is the shape of trust
made visible.

**How it is enforced.** Today the contract is *partially* materialized. The Decision Journal
already stores fields 1, 3, 4, and 5 (recommendation, evidence, confidence, alternatives) at
`apps/web/src/routes.ts:1118` and renders a "why did it decide this" surface on the mission
detail page (`apps/web/src/views/pages.ts:294-297`). Fields 6 (brand rules checked), 7
(memory consulted), and 8 (human action required) are 🔶 BUILT (UNWIRED) or ❌ ROADMAP: the
governance gate that would satisfy field 6 exists at
`domains/executive-memory/src/governance.ts:41` but is unwired, and the read-back stack that
would satisfy field 7 exists at `domains/executive-memory/src/context-builder.ts:53` but is
instantiated only in tests. The full eight-field standard is therefore a specification with
real anchors, not a claim of completion. C002
([`EXPLAINABILITY_MODEL.md`](EXPLAINABILITY_MODEL.md)) owns and details the contract as the
future UI standard.

### LAW 4 — The invariant sentence

**Declaration.** One sentence is binding across the entire book, verbatim and unchanged, in
every Book C content document:

> **Evidence is descriptive, not prescriptive.**

**Rationale.** This is the hinge of the whole Trust Layer. Past data *informs* the system;
it never *forces* the same decision. A rollup that says "finance campaigns averaged strong
CTR over many samples" describes what happened — it does not command that the next finance
campaign must be built the same way. To treat evidence as prescriptive would be to overfit
the past onto a future it cannot see, and to strip the human of the judgment that Law 3's
eighth field reserves for them. The sentence is both scientifically correct (correlation in
history is not causation in the future) and commercially correct (a client's context is
never identical to the aggregate). It must be quoted exactly, never paraphrased.

Stated once more here, in the context this constitution gives it: the system's memory is a
witness, not a ruler. **Evidence is descriptive, not prescriptive.**

---

## 4. The honesty spine — the three-tier truth model

The four laws are only worth anything if the book that declares them is itself honest about
what is built. Book C therefore inherits, without modification, the same three-tier truth
model that governs Book B. It is the honesty spine of every document: **every capability
carries exactly one tier tag, and nothing unbuilt is ever claimed as shipped.**

- **✅ SHIPPED** — runs in the live web app today, reachable from a live route or UI. Cited
  with a real `path:line` for the wired path.
- **🔶 BUILT (UNWIRED)** — the code exists and is unit-tested, but no live path reaches it;
  it is referenced only by tests. Wiring it is Book C build work. Cited with `path:line`.
- **❌ ROADMAP** — no implementation exists. Pure specification. No code citation is
  permitted, because there is nothing to cite.

This model is not bureaucracy; it is the credibility of the Trust Layer applied to the Trust
Layer's own documentation. A book about explaining recommendations forfeits its authority
the moment it inflates its own status. The rule is absolute: if a claim has no honest
citation, it is ❌ ROADMAP, and it says so.

### 4.1 The global architectural truth

Two facts about how the live application is actually assembled must be stated plainly,
because they set the ceiling on what any Book C document may honestly claim as ✅ SHIPPED.

1. **The live app does not run the rich runtime pipeline.** The web application in
   `apps/web` builds its AI through `createAIManager()`, which yields an `OfflineAIManager`
   or a `LiveAIManager`. It does **not** instantiate the grounded-reasoning runtime pipeline
   in `packages/ai-manager/src/runtime/manager.ts` — that pipeline is wired up only inside
   the walking-skeleton test. Consequently, most of the grounded-reasoning engine
   code — the evidence engine, the confidence engine, the governance gate, the context
   builder — is **🔶 BUILT (UNWIRED)**. It is real, it is tested, and it is not yet reachable
   from a live screen.
2. **Live memory stores are in-memory.** The decision journal and the other live stores are
   held in process memory (instantiated at `apps/web/src/app.ts:91`). This means that even a
   **✅ SHIPPED** journal read or write is per-process and is not durably persisted; it does
   not survive a restart. Durable persistence today is limited to artifacts via the
   repository layer. This caveat must be repeated wherever the journal is described as
   shipped, so that "shipped" is never mistaken for "durable."

Neither fact diminishes the design. They define, honestly, the line between what runs and
what is ready to be wired — which is exactly the line the Trust Layer exists to keep clear.

---

## 5. The anchor — what is actually shipped

Against that honest ceiling, Book C has one genuine, load-bearing **✅ SHIPPED** anchor: the
**Decision Journal**. It is the clearest real "why did it decide this" surface running in
the product today, and it is the proof that the value-proposition sentence is not a promise
but a direction already begun.

- **The store.** `InMemoryDecisionJournal` at
  `domains/executive-memory/src/memory.ts:54-80` provides `record`, `history`, and
  `attachOutcome`. It is in-memory only.
- **Instantiated live.** It is created in the running app at `apps/web/src/app.ts:91`.
- **Write.** On decision, the app records
  `{decision, evidence, alternatives, chosen, rejected, confidence, outcome}` at
  `apps/web/src/routes.ts:1118` — the mandated shape of Law 1, materialized.
- **Read back.** The history is read at `apps/web/src/routes.ts:832` via
  `journal.history({subjectId, k:1})` and mapped into a `LearningView` at
  `apps/web/src/routes.ts:833-841`.
- **Displayed.** It is rendered on the mission detail page by `renderLearning` at
  `apps/web/src/views/pages.ts:294-297`.

This single surface already carries the recommendation, its evidence, its confidence, and
the alternatives chosen and rejected — Law 1's chain, shipping today, subject only to the
in-memory caveat above. C005
(`../2-grounded-recommendation/DECISION_JOURNAL.md`) documents it in full.

### 5.1 What is built but not yet wired

The reasoning machinery that would deepen the anchor exists and is tested, but is not yet
reachable from a live route. All of the following are **🔶 BUILT (UNWIRED)**:

- **`BrainEvidenceEngine`** — `domains/executive-memory/src/reasoning.ts:14`. Gathers
  weighted evidence references from marketing, pattern, and experience memory. The heart of
  Law 1; carries the "never the LLM said so" comment in source.
- **`HeuristicConfidenceEngine`** — `domains/executive-memory/src/reasoning.ts:62`. Computes
  a confidence score and an inspectable reason by blending evidence strength, breadth, and
  prior success. The home of Law 2.
- **`ConstitutionChecker`** — `domains/executive-memory/src/governance.ts:41`. Blocks or
  flags recommendations against confidence and evidence thresholds, tying explainability to
  the human-sovereign guardrail. It is advisory; it never auto-approves.

These three are the build queue of Book C: the law is declared here, the code is written,
and the work that remains is wiring them into a live path. Naming them honestly as
🔶 BUILT-UNWIRED is itself an act of the honesty spine.

---

## 6. The product boundaries — non-negotiable

The Trust Layer operates inside a set of hard boundaries that AdOS holds absolutely. They
are not features to be traded away for capability; they are the terms on which an enterprise
advertiser can adopt the system at all. Every Book C document inherits them.

- **100% local.** All intelligence runs on the customer's own machine. There is no cloud
  dependency, no external API, and no per-token cost. Explainability that depended on a
  remote service would not be trustworthy, because it could not be inspected or guaranteed
  offline.
- **Human-sovereign.** The system never auto-approves and never acts on its own authority.
  It recommends, it explains, and it hands the decision to a human — which is precisely why
  the Explainability Contract's eighth field, *Human action required*, is mandatory in every
  output.
- **Copy-only.** AdOS works with text. It does not perform image, vision, or speech
  generation. The evidence it shows and the recommendations it explains are textual and
  inspectable by design.
- **No external data.** There are no connectors, no crawlers, and no ingestion pipelines
  pulling in outside data. The system reasons only over the customer's own campaign memory.
- **No vendor telemetry.** AdOS measures explanation quality against the customer's own data
  only. It does not phone home, and it does not report usage to any vendor. When Book C
  later measures its own intelligence, it does so on owned data exclusively.

These boundaries are why the value-proposition sentence can be honest: AdOS explains "using
its own campaign memory" — local, owned, and inspectable — and nothing else.

A boundary held is also a value delivered. Because everything runs locally and reasons only
over the customer's own memory, the explanations the Trust Layer produces are the
customer's own — free of per-token cost, free of external dependency, and free of any risk
that a client's campaign data left the building. For an enterprise buyer with compliance
obligations, "the reasoning never leaves your machine" is itself a reason to sign, and a
reason to renew.

---

## 7. How the laws bind the rest of Book C

This constitution governs; the following documents operationalize. The mapping below is
authoritative and fixes each downstream document's obligation. Every one of them inherits
the four laws, the three-tier truth model, the boundaries of §6, and the invariant sentence
of Law 4.

**Part 1 — The Why Contract** (`../1-why-contract/`)

- **C001 — this document.** Declares the four laws, the truth model, the boundaries, the
  Trust Layer positioning, and the book boundary. Governs everything below.
- **C002 — [`EXPLAINABILITY_MODEL.md`](EXPLAINABILITY_MODEL.md).** Owns Law 3. Defines the
  anatomy of an explanation and the full eight-field Explainability Contract as the future
  UI standard.
- **C003 — [`EVIDENCE_ENGINE.md`](EVIDENCE_ENGINE.md).** Operationalizes Law 1 through the
  `BrainEvidenceEngine` (🔶), contrasted with today's hand-rolled evidence shape (✅).
- **C004 — [`CONFIDENCE_MODEL.md`](CONFIDENCE_MODEL.md).** Owns Law 2 through the
  `HeuristicConfidenceEngine` (🔶), and restates that closing the confidence–truth gap is
  Book D's job.

**Part 2 — The Because** (`../2-grounded-recommendation/`)

- **C005 — `DECISION_JOURNAL.md`.** The ✅ SHIPPED anchor, with its honest in-memory caveat.
- **C006 — `PERFORMANCE_ROLLUPS.md`.** The per-vertical performance primitive (🔶), with the
  strongest emphasis on *descriptive, not prescriptive.*
- **C007 — `ALTERNATIVES_AND_TRADEOFFS.md`.** Why this, not that — feeding contract field 5.
- **C008 — `DECISION_EXPLANATION.md`.** Explaining the *existing* decision, deterministic
  first, local prose only.

**Part 3 — Provenance & Trust** (`../3-provenance-and-trust/`)

- **C009 — `PROVENANCE_AND_LINEAGE.md`.** What produced this output — shallow provenance (✅)
  and the missing linkage (❌).
- **C010 — `CONSTITUTION_CHECKER.md`.** The advisory gate (🔶) that enforces the
  human-sovereign guardrail through explainability.
- **C011 — `INTELLIGENCE_METRICS.md`.** Measuring explanation coverage and calibration (❌),
  on owned data only.

Any document that finds itself needing to break a law, cross the book boundary, or claim an
unbuilt capability as shipped is not to break this constitution — it is to escalate the
conflict back to this document.

---

## 8. Ratification clauses — the standing rules of Book C

The following clauses are the concise, standing form of everything above. They are binding
on every Book C document.

1. **Evidence First.** Nothing is presented as a recommendation without evidence, in the
   shape Recommendation → Evidence → Confidence → Alternatives → Decision. Never "the LLM
   said so."
2. **Confidence is belief, not truth.** Confidence is always shown with its basis and never
   as a guarantee. Calibrating it is Book D's work.
3. **The Explainability Contract is the standard.** Every output aims at the eight
   fields — Recommendation, Why?, Evidence, Confidence, Alternative considered, Brand rules
   checked, Memory consulted, Human action required.
4. **Evidence is descriptive, not prescriptive.** Verbatim, in every document, in context.
5. **One tier per capability.** ✅ SHIPPED, 🔶 BUILT (UNWIRED), or ❌ ROADMAP — honestly, with
   a real citation only where one truly exists.
6. **Book C explains; it does not learn or produce.** It is the read/explain side of gap
   B-2, and it stops at the boundary of Books B, D, and E.
7. **The boundaries hold.** 100% local, human-sovereign, copy-only, no external data, no
   vendor telemetry — always.
8. **Value is the test.** Every document states how its capability raises agency revenue or
   cuts production time.

This is the Campaign Intelligence Constitution. It exists so that AdOS does not just produce
recommendations; it can explain every recommendation using its own campaign memory — and so
that every explanation it gives remains, always, descriptive and never prescriptive.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
