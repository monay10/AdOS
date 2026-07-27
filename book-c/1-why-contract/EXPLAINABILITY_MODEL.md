# The Explainability Model — Anatomy of an Explanation

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. The governing
> document is [`CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. What this document defines

The Constitution declares *that* AdOS must explain itself. This document defines *what an
explanation is made of* — its anatomy. It is the reference shape that every other document
in this book refines: the evidence engine fills one organ, the confidence model fills
another, the decision journal is the surface that already stores them all.

An explanation in AdOS is not prose. It is not a paragraph the AI writes to sound
convincing. It is a **structured record** with named parts, each of which can be inspected,
questioned, and — critically — traced back to something the system actually observed. A
paragraph can be fluent and wrong. A structured explanation exposes exactly where it would
have to be wrong, and lets a human check that place directly.

So the anatomy has two jobs:

1. **Define the chain** — the ordered organs of a single explanation, from the thing
   recommended to what actually happened.
2. **Define the contract** — the fixed set of fields that every AI output in the product
   must one day render, so that "explained" means the same thing on every screen.

The chain is the biology. The contract is the standard that makes the biology visible in the
UI. This document specifies both, tags every part by what ships today, and maps each part to
the exact place it already lives — because, remarkably, the skeleton of this model is already
running in the live application.

---

## 2. The explanation chain

Every AdOS recommendation, when fully explained, moves through six organs in order:

```
Recommendation → Evidence → Confidence → Alternatives → Decision → Outcome
```

Read it as a sentence: *"Here is what I recommend (Recommendation); here is what I observed
that supports it (Evidence); here is how sure I am (Confidence); here is what else I weighed
and set aside (Alternatives); here is what was chosen (Decision); and here is what actually
happened (Outcome)."*

The order is not decorative. It encodes the first governing law — **Evidence First**. The
recommendation is stated, but it is never allowed to stand alone: the very next organ is the
evidence that earns it. A recommendation with no evidence organ is, by law, not a
recommendation at all — it is a guess wearing a recommendation's clothes. The chain makes
that structurally impossible to hide.

### 2.1 The six organs

**Recommendation.** The proposed action or answer — "increase budget on this campaign",
"use this creative direction", "target this segment". It is a claim about what *should*
happen. On its own it carries no authority.

**Evidence.** The observations that support the recommendation — the campaigns, metrics, and
patterns the system actually saw. This is the organ that answers "based on *what*?" It is
descriptive: it reports what the data showed. It does not, by itself, dictate the action.
This is the load-bearing distinction of the whole book: *Evidence is descriptive, not
prescriptive.* Past data informs the recommendation; it never forces it. A campaign that
performed well in 400 past cases is a strong prior, not a command.

**Confidence.** How sure the system is in the recommendation, expressed as a score plus the
reason for that score. Confidence is a statement about the *system's* certainty — not about
reality. This organ is where the second governing law lives (see §6): the system's
confidence and the eventual truth of the recommendation are two different things, and the
chain keeps them in separate organs precisely so no one confuses them.

**Alternatives.** What else was considered and set aside — the options weighed against the
chosen one, and why they lost. An explanation that shows only the winner hides the shape of
the decision. Showing the rejected paths is what turns a verdict into a rationale: it proves
the system looked at more than one door.

**Decision.** What was actually chosen — the resolution of the recommendation-plus-
alternatives into a committed action, together with what was explicitly rejected. This is the
moment the system (or the human acting on it) commits.

**Outcome.** What actually happened after the decision ran — the real-world result, attached
*after the fact*. This organ is what makes the chain honest over time. It is where a
95%-confidence recommendation gets to be recorded as a failure, and a 40%-confidence one as a
win. Without the Outcome organ, confidence could never be checked against reality; with it,
every past explanation becomes a labelled example the system can be measured against later.

### 2.2 Why "Outcome" extends the law's five-step shape

The Evidence First Law mandates the shape `Recommendation → Evidence → Confidence →
Alternatives → Decision`. This document appends one more organ — **Outcome** — because an
explanation is not complete the instant a decision is made. The decision is a *prediction*;
the outcome is the *grade*. The five-step shape is the law's minimum for presenting a
recommendation responsibly. The six-organ chain is the full lifecycle of an explanation from
proposal to result. Closing the loop between Confidence and Outcome — learning from the gap —
is explicitly **not** this book's job (see §6); but *recording* the outcome so that loop can
one day exist absolutely is, and the organ already ships.

---

## 3. The chain is already running (the shipped skeleton)

The remarkable thing about this model is that its skeleton is not a proposal. It ships today,
in the live web app, as the **Decision Journal**. The journal stores a record whose fields
map almost one-for-one onto the six organs of the chain.

**✅ SHIPPED — Decision Journal record.** When the app records a decision, it writes a
structured entry of the shape:

```
record({ decision, evidence, alternatives, chosen, rejected, confidence, outcome })
```

The write happens on the live campaign route at `apps/web/src/routes.ts:1118`. The store
behind it is `InMemoryDecisionJournal` at `domains/executive-memory/src/memory.ts:54-80`,
which exposes `record`, `history`, and `attachOutcome`. It is instantiated in the live app at
`apps/web/src/app.ts:91`. The entry is read back on the mission route via
`journal.history({ subjectId, k: 1 })` at `apps/web/src/routes.ts:832`, mapped to a display
view at `apps/web/src/routes.ts:833-841`, and rendered on the mission detail page by
`renderLearning` at `apps/web/src/views/pages.ts:294-297`.

### 3.1 Organ-to-record mapping

| Chain organ    | Journal field(s)        | Tier | Where |
|----------------|-------------------------|------|-------|
| Recommendation | `decision`              | ✅ SHIPPED | `apps/web/src/routes.ts:1118` |
| Evidence       | `evidence`              | ✅ SHIPPED (literal) / 🔶 (engine) | `apps/web/src/routes.ts:1123-1130` |
| Confidence     | `confidence`            | ✅ SHIPPED (literal) / 🔶 (engine) | `apps/web/src/routes.ts:1130`, displayed `routes.ts:837` |
| Alternatives   | `alternatives`          | ✅ SHIPPED | `apps/web/src/routes.ts:1118` |
| Decision       | `chosen` / `rejected`   | ✅ SHIPPED | `apps/web/src/routes.ts:1118` |
| Outcome        | `outcome` / `attachOutcome` | ✅ SHIPPED (surface) | `domains/executive-memory/src/memory.ts:54-80` |

Every organ of the chain has a home in the record. The *shape* is real and reachable from a
live route. That is the foundation this entire book builds on: AdOS does not have to invent an
explainability data model — it has one, running, and this book's work is to enrich each organ
and to surface the whole thing as a first-class, standardized UI contract.

### 3.2 The honest caveat

Two limits must be stated plainly, because claiming otherwise would violate the first law at
the level of this very document.

**The store is in-memory.** `InMemoryDecisionJournal` holds records per-process. The live app
wires it (and its sibling memory stores) as in-memory instances at `apps/web/src/app.ts:89-91`.
So even this ✅ SHIPPED surface is not durably persisted — a restart clears it. Durable
explanation history is not yet a shipped property; artifacts persist through a separate
repository layer, but the journal itself does not. This is a real gap, and it is named here
rather than papered over.

**The evidence and confidence are hand-rolled, not engine-derived.** The `evidence[]` array
and the `confidence{ score, reason, basis }` object written at
`apps/web/src/routes.ts:1123-1130` are constructed inline on the route — the reason string is
literally `"Based on ${roas}x ROAS"`. This is the *correct shape* filled by hand. It is not
yet fed by the grounded reasoning engines that will make the evidence rich and the confidence
principled. Those engines exist (see §5) but are not wired into the live app. The skeleton is
real; several of its organs are currently stubbed with honest, hand-written values.

---

## 4. The Explainability Contract (Law 3) — the eight-field standard

The chain is the internal anatomy. The **Explainability Contract** is the external standard:
the fixed set of fields that every AI output in the product must eventually render in the UI,
so that "the AI explained this" means the same thing everywhere. It is the third governing
law of this book.

Where the chain has six organs, the contract has **eight fields**. The contract expands the
chain in two ways: it splits "why" into an explicit human-readable *Why?* alongside the raw
*Evidence*, and it adds two organs the chain implies but does not name — the **brand rules**
that were checked, and the **memory** that was consulted. It also renames "Decision + Outcome"
into the forward-looking **Human action required**, because the contract is a UI standard: its
job is to tell a *person* what to do next.

### 4.1 The eight fields

1. **Recommendation** — what the AI proposes.
2. **Why?** — the plain-language rationale, one sentence a reviewer can read.
3. **Evidence** — the concrete observations behind the *Why?* (campaigns, metrics, patterns).
4. **Confidence** — the score and the reason for it.
5. **Alternative considered** — what else was weighed, and why it was set aside.
6. **Brand rules checked** — which guardrails and brand constraints were verified.
7. **Memory consulted** — which parts of the system's own history informed this.
8. **Human action required** — what the reviewer must decide, approve, or reject.

### 4.2 Contract field tiers (what ships today)

| # | Contract field | Tier | Grounding |
|---|----------------|------|-----------|
| 1 | Recommendation | ✅ SHIPPED | `decision` field, `apps/web/src/routes.ts:1118` |
| 2 | Why? | 🔶 BUILT (UNWIRED) | deterministic reason string, `domains/executive-memory/src/reasoning.ts:91` |
| 3 | Evidence | ✅ SHIPPED shape (literal) `apps/web/src/routes.ts:1123-1130` · 🔶 real engine `domains/executive-memory/src/reasoning.ts:14` |
| 4 | Confidence | ✅ SHIPPED shape (literal) `apps/web/src/routes.ts:1130` · 🔶 real engine `domains/executive-memory/src/reasoning.ts:62` |
| 5 | Alternative considered | ✅ SHIPPED (stored) | `alternatives` / `chosen` / `rejected`, `apps/web/src/routes.ts:1118` |
| 6 | Brand rules checked | ❌ ROADMAP | no contract-field surface today |
| 7 | Memory consulted | ❌ ROADMAP | no contract-field surface today |
| 8 | Human action required | ❌ ROADMAP | no contract-field surface today |

Read the table honestly. **Three fields ship in real form** (Recommendation, and the
stored Alternatives/Decision split of chosen-vs-rejected). **Two fields ship as the right
shape but with hand-rolled contents** and have a real engine waiting to be wired behind them
(Evidence, Confidence). **One field is built but unwired** (Why?, as a deterministic reason
string). **Three fields do not exist as first-class contract fields at all** (Brand rules
checked, Memory consulted, Human action required) — they are pure roadmap.

### 4.3 Reading the tiers carefully

A word on why fields 6 and 7 are ❌ and not 🔶. Brand-rule checking and memory read-back are
not *absent* from the system as mechanisms — the book will describe a constitution checker
and a context-building read-back stack elsewhere. But as **contract fields** — as named,
rendered, per-output surfaces that tell a reviewer "these specific brand rules were checked
for *this* recommendation" and "these specific memories were consulted for *this* one" — they
do not exist. The mechanism existing somewhere in the codebase does not make the *contract
field* shipped. The contract is a UI standard; a field is only real when the output renders
it. Tagging these ❌ keeps the distinction between "capability exists" and "explanation surface
exists" scrupulously clean, which is exactly what the first law demands of this document.

Field 8, Human action required, is ❌ for the same reason: the app has approval flows, but the
contract's promise is that *every AI output* declares, in a standard slot, what the human must
do. That standardized declaration is not yet a rendered field.

---

## 5. The engines waiting behind the contract

Two fields — Evidence and Confidence — ship as the correct shape filled by hand. The
components that will fill them properly already exist as **🔶 BUILT (UNWIRED)** code: unit-
tested, but not reachable from any live route. Wiring them is core build work for this book;
naming them here shows the contract is not aspirational hand-waving but a socket waiting for a
known plug.

**Evidence — `BrainEvidenceEngine` (🔶).** At `domains/executive-memory/src/reasoning.ts:14`,
`gather()` returns weighted `EvidenceRef[]` drawn from the company brain's marketing metrics,
observed patterns, and prior experience. It emits evidence text of the form seen at
`reasoning.ts:30` — "ROAS …, CTR … over N campaigns". Its own comment states the principle
this book is built on: *no recommendation is ever "the LLM said so."* Today it is consumed
only by an unwired runtime and by tests; the live route uses the hand-rolled literal instead.

**Confidence — `HeuristicConfidenceEngine` (🔶).** At
`domains/executive-memory/src/reasoning.ts:62`, `assess()` computes a confidence score by
blending evidence strength, breadth, and prior success (the blend at `reasoning.ts:82`), and
produces a reason string like "Based on 382 campaigns, ROAS 5.8" (`reasoning.ts:91`). This is
the principled replacement for the literal `"Based on ${roas}x ROAS"` on the live route — same
field, real derivation.

The contract's design intent is that field 3 renders `BrainEvidenceEngine` output and field 4
renders `HeuristicConfidenceEngine` output. That both engines already exist, tested, is why
these two fields are 🔶 (a wiring job) rather than ❌ (a design job).

Note the global architectural truth that makes this a *wiring* problem: the live app builds
its AI through a manager path that does **not** run the rich grounded-reasoning pipeline —
that pipeline is instantiated only in tests. So the evidence and confidence engines are not
broken; they are simply not on the path the live route takes. The contract is where they come
online.

---

## 6. Honoring Law 1 and Law 2 at the model level

This document is not just a data shape. It is where two of the four governing laws are
built into the anatomy so they cannot be evaded.

### 6.1 Law 1 — Evidence First, enforced by ordering

The chain places **Evidence** as the second organ, immediately after Recommendation and
*before* anything else. That ordering is the enforcement mechanism. A recommendation cannot be
rendered as a recommendation without its evidence organ present; the contract's field 3 is not
optional. This is what it means to make the law structural rather than aspirational: the
absence of evidence is not a missing paragraph, it is a malformed record. And the evidence
organ is bound to its defining invariant, stated here in context and verbatim: *Evidence is
descriptive, not prescriptive.* The evidence organ **describes** what the system saw. It does
not, on its own, **prescribe** the action. The recommendation is a separate organ precisely so
that a human — reading the evidence — can agree that the same facts support the same action,
or decide they do not. Past data informs; it never forces.

### 6.2 Law 2 — Confidence ≠ Truth, enforced by separation

The chain keeps **Confidence** and **Outcome** in two different organs, at two different times.
Confidence is written when the recommendation is made; Outcome is attached after reality
answers. This separation *is* the second law made physical. Confidence is the system's estimate
of its own certainty. Truth is whether the recommendation turned out right. A 95%-confidence
campaign can fail; a 40%-confidence one can be the best performer — and because the two organs
are distinct, the record can hold both facts at once without contradiction: high confidence,
poor outcome, both true, both stored.

What this document deliberately does **not** do is close the gap between them. Measuring
confidence against outcome and adjusting the system so its confidence gets *better calibrated*
over time — the learning loop — is **Book D's** job, not this book's. This book's
responsibility ends at making sure the two organs are separate, both recorded, and both
inspectable, so that the loop Book D builds has honest labelled data to learn from. Where a
reader expects "and then the system learns" — that is the next book, by design. Here we
guarantee the raw material; there it becomes learning.

---

## 7. Why the contract must be one shape everywhere

The point of fixing eight fields is not tidiness. It is that **"explained" must mean the same
thing on every screen**. If the budget recommendation renders evidence and confidence, but the
creative recommendation renders only a paragraph, and the targeting recommendation renders
nothing, then the product has not earned the word "explainable" — it has earned "sometimes
explainable", which a reviewer learns not to trust. Trust is built by consistency: a reviewer
who sees the same eight-field frame under *every* AI output stops asking "will this one show
its work?" because the answer is always yes.

So the contract becomes the **standard render shape** for every AI output in AdOS. A new
capability is not "done" when it produces an answer; it is done when its answer arrives wearing
all eight fields — even if some fields, honestly, read "none consulted" or "no alternatives
weighed". A field that says "no memory consulted" is still an explanation; it tells the
reviewer exactly how thin the ground is. The contract does not force every output to be
well-supported. It forces every output to *disclose* how well-supported it is. That disclosure,
uniform across the product, is the difference between a tool a reviewer supervises and a tool a
reviewer merely hopes about.

This is also why the contract is the right home for the third law rather than a loose
convention: a convention is followed when convenient, a contract is the shape the UI *requires*.
Making it law is what turns "we should explain our outputs" into "an output that does not carry
these fields is not shippable."

---

## 8. Boundaries this model holds

The anatomy respects every product boundary of AdOS, and states them because an explanation
model that quietly reached outside them would be dishonest.

- **100% local.** Every organ is filled from the system's own observations and its own
  reasoning code. No field of the contract is populated by a cloud call, an external model
  API, or a per-token service. The confidence reason is computed locally; the evidence is
  gathered from the local company brain.
- **Copy only.** The explanation is text and structured metrics. No organ carries an image, a
  vision result, or a speech artifact. Explainability here is about *why a recommendation was
  made*, expressed in copy and numbers.
- **No external data.** Evidence is drawn from campaigns AdOS itself ran and recorded — never
  from a connector, a crawler, or an ingested third-party feed. The "N campaigns" behind any
  evidence line are the agency's own.
- **No vendor telemetry.** The Outcome organ records the agency's own results. Nothing about
  the explanation model reports usage to a vendor or depends on external analytics.
- **Human-sovereign.** The contract's eighth field — Human action required — exists so the
  model never presumes to act. The explanation informs a human decision; it never replaces it,
  and no organ of the chain auto-approves anything.

---

## 9. Value contribution

Explainability is not documentation overhead; it is a commercial asset, and the model above
is where that asset is manufactured.

**It grows agency revenue by building trust.** An agency whose AI can show — under every
output, in the same eight-field frame — the evidence, the confidence, the alternatives, and
the memory behind a recommendation is selling something a generic LLM tool cannot: a machine
that shows its work. That is the difference that wins a pitch against "we also use AI" and
retains an account through the first recommendation a client is tempted to doubt. Structured
explanation is the product's defensible edge, and this model is its blueprint.

**It cuts reviewer decision time.** A reviewer who is handed a bare recommendation must
re-derive the entire question themselves — "do I believe this, and on what basis?" — before
they can approve it. A reviewer handed the same recommendation *with* its evidence and
confidence already attached is doing a far cheaper job: checking a shown rationale rather than
reconstructing an absent one. Faster approvals mean more campaigns shipped per reviewer-hour,
which is production time reclaimed directly. The chain and the contract are what put the
rationale on the screen so the reviewer never has to rebuild it.

Both effects compound with consistency, which is exactly why the contract is a fixed shape:
the trust and the time-savings only accrue if *every* output explains itself the same way.

---

## 10. Where each organ is developed next

This document defines the anatomy; the rest of the book fills each organ in depth:

- **Evidence** — the grounded evidence engine and how `EvidenceRef` weights are computed:
  [`EVIDENCE_ENGINE.md`](EVIDENCE_ENGINE.md).
- **Confidence** — how the score and its reason are derived, and why Confidence ≠ Truth:
  [`CONFIDENCE_MODEL.md`](CONFIDENCE_MODEL.md).
- **Decision + Outcome** — the shipped journal surface in full, with the in-memory caveat:
  [`../2-grounded-recommendation/DECISION_JOURNAL.md`](../2-grounded-recommendation/DECISION_JOURNAL.md).
- **Alternatives** — surfacing chosen-vs-rejected as a first-class trade-off:
  [`../2-grounded-recommendation/ALTERNATIVES_AND_TRADEOFFS.md`](../2-grounded-recommendation/ALTERNATIVES_AND_TRADEOFFS.md).
- **Brand rules checked** — the confidence/evidence gate that enforces the guardrail:
  [`../3-provenance-and-trust/CONSTITUTION_CHECKER.md`](../3-provenance-and-trust/CONSTITUTION_CHECKER.md).
- **Memory consulted** and **provenance** — lineage of what produced an output:
  [`../3-provenance-and-trust/PROVENANCE_AND_LINEAGE.md`](../3-provenance-and-trust/PROVENANCE_AND_LINEAGE.md).

The governing frame for all of it — the four laws, the tier model, the Trust Layer positioning
— is set by [`CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
