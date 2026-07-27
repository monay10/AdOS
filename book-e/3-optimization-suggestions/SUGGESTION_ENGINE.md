# Suggestion Engine

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md`](../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md).
>
> **Laws:** *Evidence ≠ judgement · judgement is reproducible · a score is never an LLM opinion
> · higher score does not guarantee better business outcome · Creative Intelligence ranks
> alternatives, humans choose direction.*

---

## 1. What this document defines

This document defines **how AdOS produces an improvement suggestion** for a creative — the fourth
and final station of Creative Intelligence. A suggestion is a single, grounded proposal in a
fixed shape:

> **Change X → to Y → because Z.**

- **X** — *what* to change: a specific element of the creative (the headline, the CTA, the
  opening line of the ad copy).
- **Y** — the *proposed direction*: not a rewrite, but a direction of travel ("shorten it,"
  "make it more concrete," "lead with the number").
- **Z** — the *evidence-based reason*: why this change is worth making, grounded in real
  performance memory and in the creative's own score gaps.

A worked example makes the shape concrete:

> **Change** the headline (X) → **to** under eight words (Y) → **because** in Finance the last
> forty campaigns' short headlines averaged a higher click-through rate, and this creative's
> Clarity dimension scored below its peers (Z).

Every part of that sentence is doing a specific job. X names a real, editable element. Y states a
direction a human can act on. Z is the load-bearing part: it is **never** an opinion ("this reads
better to me") and **never** an invention. Z always resolves to two things the earlier stations
already produced — **Book D evidence** (the performance memory) and the **Part 1 score gaps** (the
dimensions where this creative scored lowest). This document is about producing that sentence
well, and being honest that today no engine produces it.

This document does **not** cover the difference between suggesting and rewriting — that is the
subject of E006, [`./SUGGESTION_NOT_REWRITE.md`](./SUGGESTION_NOT_REWRITE.md), and it carries the
"AI suggests; the human decides" law most centrally. Here we stay strictly on **generating** the
suggestion. §7 previews the boundary; E006 owns it.

Two sentences govern everything below, and they are stated in full here because they bound the
whole exercise:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

A suggestion is decision *support*. It points at the weakest dimension and proposes a direction
grounded in evidence. It does not choose for the strategist, and a strategist may rationally
ignore a suggestion for a reason the score cannot see.

---

## 2. A suggestion produces no new data — it is derived, not invented

Book E is the **judgement** layer. It interprets, scores, ranks, and suggests. It **never
produces new data.** Every fact a suggestion rests on was created upstream: the performance
numbers by Book D, the scores by Part 1, the head-to-head deltas by Part 2.

The suggestion engine is the last reader in the chain, and it is a *pure reader*:

- It **invents no evidence.** "Short headlines do better in Finance" is not a claim the engine
  makes up; it is a fact it *reads* from Book D's per-vertical memory. If the memory does not
  support the claim, the suggestion is not generated.
- It **generates no creative.** It proposes a direction (Y); it does not author the replacement
  copy. Producing new copy is Book B's job, and applying it is a human's decision (§7, E006).
- It **writes back no dataset.** A suggestion is a derived view over existing scores and
  evidence. It is not a new source of truth; the scores and the Book D memory remain the truth.

This is why the "because Z" can be trusted: it is **traceable**, not creative. Follow any Z
backwards and it terminates in a Book D aggregate and a Part 1 score gap — never in a language
model's momentary preference. A suggestion is a *conclusion drawn from* data, not *new* data. If
you cannot point at the evidence and the gap, there is no suggestion to make.

---

## 3. The anatomy of a suggestion: X → Y → because Z

The three parts are not decoration. Each is a separate discipline, and a suggestion that drops
any one of them is not a valid AdOS suggestion.

### 3.1 X — what to change is a real, editable element

X must name one of the six copy fields, because those are the only creative artifacts that exist.
The creative is copy-only: `CreativeContent` is exactly six outputs — `headline`, `adCopy`,
`cta`, `socialPost`, `landingPage{headline,body,cta}`, `email{subject,body}`
(`domains/creative-studio/src/creative/creative-set.ts:43-50`), and the studio "produces copy
ONLY" (`domains/creative-studio/src/creative/service.ts:26`).

So X is always something like *the headline*, *the CTA verb*, *the opening line of the ad copy*.
It is **never** "the visual," "the thumbnail," or "the video hook": there is no visual, video, or
carousel artifact anywhere in the product, so suggesting a change to one is **❌ against the
copy-only boundary**, not a pending feature. X points at a field a human can actually edit.

### 3.2 Y — the direction is actionable, not a rewrite

Y is a *direction of travel*, phrased so a human knows what to do without being handed finished
words. "Shorten to under eight words." "Lead with the concrete number." "Replace the abstract
verb with a specific action." Y is deliberately a proposal, not a product:

- A direction respects human sovereignty. It tells the strategist *where* to steer and leaves
  the wording to them (or to a fresh Book B generation they choose to run).
- A direction is auditable against the score gap. "Shorten the headline" maps to a low Clarity or
  Readability dimension; "add a concrete claim" maps to a low Specificity dimension. Y is always
  the *remedy shape* for the gap X sits in.

Crucially, **Y is not the rewritten creative.** The engine never emits the replacement headline
as the "answer." That distinction is the whole of §7 and E006.

### 3.3 Z — the reason is evidence-based, always

Z is where a suggestion earns the right to exist. It fuses the two upstream products:

1. **The Part 1 score gap.** Optimization targets the *lowest-scoring dimensions* of the
   multi-dimensional score (§4). Z names which dimension fell short — "Clarity scored below the
   creative's peers" — so the human knows the suggestion is aimed at a real weakness, not a whim.
2. **The Book D evidence.** Z then grounds the proposed direction in performance memory: "in
   Finance the last forty comparable campaigns' short headlines averaged a higher click-through
   rate." This is same-class evidence (Finance ↔ Finance) read from Book D, never an external
   benchmark and never an average the engine invented.

A Z that cites only a gap ("Clarity is low, so shorten it") is weaker than a Z that also cites
the evidence for the direction ("...and short headlines outperform in this vertical"). A complete
Z answers both *which dimension* and *why this direction fixes it, per the data*. **No evidence,
no Z; no Z, no suggestion.**

```
   X (what)              Y (direction)            Z (because)
 ┌───────────┐         ┌────────────────┐       ┌───────────────────────────────┐
 │ headline  │  ──▶    │ under 8 words  │  ──▶   │ Clarity gap (Part 1 score) +  │
 │ (a real   │         │ (a remedy, not │       │ short-headline CTR lift in    │
 │ copy field│         │  a rewrite)    │       │ Finance (Book D, same-class)  │
 └───────────┘         └────────────────┘       └───────────────────────────────┘
   editable             actionable               traceable — never invented
```

---

## 4. LAW — Comparison Before Optimization

> **Law — Comparison Before Optimization.** The flow order is fixed:
> **Evidence → Score → Comparison → Optimization.** Understand how good a creative already is —
> and where it stands relative to the alternatives — before suggesting any change.

This document sits at the **fourth and final station** of that pipeline. A suggestion is generated
*after* scoring and *after* comparison, never before.

```
   Book D              Part 1             Part 2              Part 3 (this doc)
 ┌──────────┐      ┌────────────┐     ┌──────────────┐    ┌────────────────┐
 │ EVIDENCE │ ──▶  │   SCORE    │ ──▶ │  COMPARISON  │──▶ │  OPTIMIZATION  │
 │ (memory) │      │ multi-dim  │     │ A vs B, deltas│    │  suggestions   │
 └──────────┘      └────────────┘     └──────────────┘    └────────────────┘
   produces          interprets         ranks, exposes       suggests, never
   the facts         the facts          the gaps             auto-rewrites
```

### 4.1 Optimization targets the lowest-scoring dimensions

The suggestion engine does not touch a creative at random. It reads the **multi-dimensional
score** from Part 1 — the Overall decomposes into named dimensions shown separately: Brand Fit ·
Policy Fit · Clarity · Readability · Specificity · Persuasiveness · Evidence Support · Confidence
(see [`../1-creative-scoring/CREATIVE_SCORING_MODEL.md`](../1-creative-scoring/CREATIVE_SCORING_MODEL.md)
for how each dimension is built) — and it aims at the **lowest** ones. The gap *is* the target.

This is why comparison must come first. Part 2 establishes not only how good a creative is in
isolation but **where exactly it falls short of the alternative**
([`../2-comparative-intelligence/CREATIVE_COMPARISON.md`](../2-comparative-intelligence/CREATIVE_COMPARISON.md)).
If a comparison shows Creative A trailing B on Specificity (63 vs 81) and Persuasiveness (70 vs
72), those two dimensions — and no others — are what a suggestion addresses. Optimizing a
dimension that was already the winning one would be waste; optimizing the wrong creative would be
worse. **The score gap chooses the target; the engine does not.**

### 4.2 Why a suggestion cannot precede the score

An optimization suggestion answers "change X → to Y → **because Z**." The *because* is impossible
to state honestly before scoring and comparison have run, because Z is literally built from the
score gap and the comparison delta. Suggesting first would mean inventing a reason — exactly the
opinion-based judgement Book E exists to eliminate. So the ordering is fixed and
one-directional: **Evidence → Score → Comparison → Optimization.** No station may be skipped, and
optimization always runs last.

---

## 5. LAW — Judgement is Reproducible

> **Law — Judgement is reproducible.** Same Evidence + Same Rules + Same Heuristics = Same
> Result. A judgement is deterministic — never random, never dependent on a model's momentary
> mood.

Applied to suggestions, the law reads: **the same score gaps plus the same evidence produce the
same suggestions.** Feed the engine the identical multi-dimensional score and the identical Book D
memory twice, and it returns the identical set of "change X → to Y → because Z" proposals — same
targets, same directions, same reasons, every time, on every machine.

```
suggest(scoreGaps, evidence, rules, heuristics) → {X→Y because Z, ...}
suggest(scoreGaps, evidence, rules, heuristics) → {X→Y because Z, ...}   // always identical
```

### 5.1 Why this holds by construction

A suggestion is doubly determined. First, it only **reads** upstream products (§2) — it produces
no new data that could drift. Second, its inputs are themselves reproducible: the Part 1 score is
deterministic arithmetic, and the Book D evidence is a stable aggregate. If the target-selection
rule ("aim at the lowest dimensions") and the direction-mapping rule ("low Clarity → shorten")
are documented and fixed, then identical inputs yield identical suggestions **necessarily**. No
temperature, no sampling, no wall-clock, no model call sits between the gap and the proposal.

A suggestion *should* change only when an **input** changes — a new campaign lands in Book D and
moves the evidence behind a direction, or a re-score moves which dimension is now lowest. When it
shifts, the shift is explainable by pointing at exactly which input moved. That is the difference
between a system that drifts and one that improves transparently.

### 5.2 Why an agency needs reproducible suggestions

- **Defensibility (revenue).** "We shortened the headline because short headlines lifted CTR
  across your last forty Finance campaigns, and Clarity was this creative's weakest dimension" is
  a recommendation that reproduces under a client's scrutiny. "The AI suggested it" does not.
- **Consistency (production time).** Re-running the engine next week on the same creative does not
  silently propose a different edit. The team is not re-litigating yesterday's advice.
- **No mood dependence.** The suggestion never depends on how a generative model happened to
  sample. It is the same evidence-grounded proposal, always. This is why a suggestion, like a
  score, is **never an LLM opinion** — it is Evidence + the score gap + a documented direction
  rule.

---

## 6. Honest tier: no creative suggestion engine exists

Book E is honest about what runs today. For creative suggestions, the honest answer is blunt:

> **A creative optimization / suggestion engine is ❌ ROADMAP.**

There is **no code path anywhere in the product** that reads a creative's score gaps and its Book
D evidence and emits a "change X → to Y → because Z" proposal. This follows directly from Part 1:
a `CreativeSet` has no score field and no scoring method
(`domains/creative-studio/src/creative/creative-set.ts:86`), so there are no multi-dimensional
score gaps for a suggester to target in the first place. No score, no gap; no gap, no grounded
suggestion. There is no `path:line` to cite for "suggest a creative edit," because no such code
exists.

### 6.1 The nearest primitive is `learning.suggest()` — and it is not a creative suggester

The closest thing the codebase has to a "suggest" function is `learning.suggest()`
(`packages/ai-manager/src/runtime/learning.ts:38`). It is important to be precise about what it
does, because the name is misleading in this context.

`learning.suggest(promptKey)` returns the best `{ model, promptVersion }` for a given prompt key
— the model and prompt-template version with the highest exponential-moving-average reward. It is
built from the same deterministic machinery the rest of Book E reuses: an EMA update
(`packages/ai-manager/src/runtime/learning.ts:49`) and an argmax "pick the best key"
(`packages/ai-manager/src/runtime/learning.ts:53`). As infrastructure it is sound and tested.

But it suggests the **wrong kind of thing**, and it is **not wired**:

- **It is infrastructure ROUTING, not a creative edit.** What `suggest()` chooses is *which model
  to call* and *which prompt-template version to use* — a plumbing decision about how to run the
  AI. It says nothing about *the copy*. It never touches a headline, a CTA, or an ad-copy line. It
  has no concept of the eight creative dimensions, and it produces no "change X → to Y → because
  Z" sentence. Routing the pipeline is a categorically different act from proposing a creative
  improvement.
- **It returns a selection, not a grounded reason.** Its output is a `{model, promptVersion}`
  pair — a choice, with no "because Z" attached to a creative weakness. It is an argmax over
  reward, not an evidence-plus-gap rationale about copy.
- **It is 🔶 BUILT (UNWIRED).** The code and its tests exist, but no live path reaches it. It sits
  behind the same bypass described in §6.2.

So `learning.suggest()` is a **routing** primitive that happens to share a verb with what this
document describes. It is not a creative suggester, and this document does not claim it as one.

### 6.2 Why the machinery is unwired: the LiveAIManager bypass

The primitives above are tagged 🔶 and not ✅ for one structural reason that runs through all of
Book E. The live web app builds its AI through `createAIManager` → `LiveAIManager`
(`apps/web/src/ai-factory.ts:39`, `apps/web/src/main.ts:43`). `LiveAIManager` **bypasses the
entire runtime pipeline** — the pipeline where the learning, scoring, and reasoning machinery is
instantiated. That pipeline and its engines are wired up **only in tests**.

The practical consequence: `learning.suggest()` and the deterministic scoring/confidence
primitives a real suggester would reuse all run in the test suite, but **not** when a user opens
AdOS. The 🔶 tag is honest — the arithmetic exists and is tested; it is simply dormant behind the
bypass, unreachable from the live product.

> **Tier summary:** a creative suggestion engine is **❌ ROADMAP**; the nearest primitive,
> `learning.suggest()` (🔶 `packages/ai-manager/src/runtime/learning.ts:38`), is infrastructure
> *routing*, not creative editing — and it is unwired.

### 6.3 Relationship to Book B Part 4 (reference, do not duplicate)

Book B's production pipeline already documents two optimization docs as **roadmap designs with no
backing code**: `AI_SUGGESTIONS.md` and `REVISION_ENGINE.md`
([`../../book-b/4-optimization/AI_SUGGESTIONS.md`](../../book-b/4-optimization/AI_SUGGESTIONS.md),
[`../../book-b/4-optimization/REVISION_ENGINE.md`](../../book-b/4-optimization/REVISION_ENGINE.md)).
Those docs describe optimization *inside the production pipeline*. Book E is the deeper creative-
**intelligence** layer: it defines the *judgement* shape of a suggestion — X → Y → because Z,
grounded in the multi-dimensional score gap and Book D evidence. The two views do not duplicate:
Book B frames the operational gate; this document frames the evidence-grounded reasoning. Where
Book B's suggestion/revision mechanics are relevant, **reference those docs — do not restate
them here.**

---

## 7. Boundary preview: a suggestion is a proposal, never an applied change

This is the single most important boundary of Part 3, and it is stated here as a preview because
E006 owns it in full ([`./SUGGESTION_NOT_REWRITE.md`](./SUGGESTION_NOT_REWRITE.md)).

**A suggestion is a PROPOSAL. It never rewrites the creative itself.**

The engine described here *generates* "change X → to Y → because Z." It stops there. It does not:

- edit the `headline` field, or any of the six copy fields, in place;
- author the replacement wording and substitute it for the original;
- act on its own proposal in any way.

The output of this station is a **sentence a human reads**, not a **mutated creative**. A
suggestion sits next to the creative as advice; the creative is unchanged until a human, having
read the proposal and its evidence, decides to act — at which point a fresh generation or a human
edit produces new copy, under the human's direction. The wall between *generating a suggestion*
(this document) and *applying it* (never automatic; E006's law) is deliberate and absolute.
Keeping the two apart is what makes AdOS human-sovereign: the AI suggests; the human decides;
always.

This document is therefore scoped to **generating** the proposal. E006 carries the
suggestion-versus-rewrite law and the shipped human gate. Do not read this document as licensing
any auto-edit — none exists, and none is intended.

---

## 8. Boundaries

The suggestion engine lives inside AdOS's product boundaries and does not stretch them:

- **100% local, offline-first.** A suggestion is arithmetic over already-computed scores and
  already-aggregated evidence, on-device. No cloud, no API call, no telemetry, no external
  benchmark feed. A suggestion is computable with the network cable pulled.
- **Copy-only.** X can only name one of the six copy fields (headline, adCopy, cta, socialPost,
  landingPage, email). There is no visual/video/carousel artifact to suggest a change to —
  proposing one is ❌ against the copy-only boundary, not a pending feature.
- **No new data.** The engine reads score gaps and Book D evidence; it invents no evidence,
  generates no creative, and writes back no dataset (§2). Book E interprets; it never produces new
  performance data.
- **Evidence-grounded only.** Every Z terminates in a Book D aggregate and a Part 1 score gap. A
  suggestion whose reason cannot be traced to real, same-class evidence is not generated. No
  external, sector, or global benchmark is ever used — none exists, and connectors are forbidden.
- **Human-sovereign.** A suggestion proposes a direction and exposes its reason; it never decides,
  never auto-acts, and never auto-rewrites the creative (§7). It surfaces the proposal and stops.
  The strategist chooses direction.

---

## 9. Value contribution

Evidence-grounded suggestions change two numbers an agency cares about:

- **Revenue.** A suggestion that carries its own evidence — "shorten the headline because short
  headlines lifted CTR across your last forty Finance campaigns, and Clarity was this creative's
  weakest dimension" — raises creative quality *and* is defensible in front of the client. The
  agency improves the work and can show *why* the change was made, backed by the client's own
  performance memory. Defensible improvement protects and grows the account.
- **Production time.** Suggestions that point precisely at the lowest-scoring dimension, with a
  ready direction, **cut revision cycles.** Instead of a room guessing which of six copy fields to
  rework and arguing by taste, the engine names the target, the direction, and the reason in one
  sentence. Fewer wasted rewrites, fewer rounds of debate, a faster path to the strongest option.

Both gains are bounded by the same discipline: the engine ranks weaknesses and proposes
directions; a human chooses whether and how to act — every time.

---

## 10. Summary

- A suggestion has a fixed shape: **change X → to Y → because Z** — X names a real, editable copy
  field; Y is an actionable direction, not a rewrite; Z is an evidence-based reason built from
  **Book D evidence + the Part 1 score gap**. This book produces no new data (§2).
- Suggestions obey **Comparison Before Optimization**: they are generated *after* scoring and
  comparison, and target the **lowest-scoring dimensions** of the multi-dimensional score
  (Evidence → Score → Comparison → Optimization). See
  [`../1-creative-scoring/CREATIVE_SCORING_MODEL.md`](../1-creative-scoring/CREATIVE_SCORING_MODEL.md)
  and [`../2-comparative-intelligence/CREATIVE_COMPARISON.md`](../2-comparative-intelligence/CREATIVE_COMPARISON.md).
- Suggestions are **reproducible**: the same score gaps plus the same evidence produce the same
  suggestions — deterministic, never an LLM opinion.
- A creative suggestion engine is **❌ ROADMAP**. The nearest primitive, `learning.suggest()`
  (🔶 `packages/ai-manager/src/runtime/learning.ts:38`), returns a best `{model, promptVersion}`
  — infrastructure **routing**, not creative editing — and is unwired behind the `LiveAIManager`
  bypass. Book B's `AI_SUGGESTIONS.md` and `REVISION_ENGINE.md` are roadmap docs referenced, not
  duplicated (§6.3).
- A suggestion is a **proposal, never an applied change** — it never rewrites the creative (§7).
  Generating the proposal is this document; the suggestion-versus-rewrite law and the human gate
  are E006, [`./SUGGESTION_NOT_REWRITE.md`](./SUGGESTION_NOT_REWRITE.md).

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
