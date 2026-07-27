# Creative Intelligence Constitution

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. **This is the
> governing document of Book E** — every other Book E artifact is subordinate to the laws,
> boundaries, and truth model declared here.
>
> **Laws:** *Evidence ≠ judgement · judgement is reproducible · a score is never an LLM opinion
> · higher score does not guarantee better business outcome · Creative Intelligence ranks
> alternatives, humans choose direction.*

---

## 0. Preamble — what this document governs

This is the constitution of **Book E — Creative Intelligence**. It is the highest authority in
the book. Where any other Book E document appears to conflict with the text below, this document
controls, and the other document is to be corrected, not this one. The eleven content documents
of Book E — the scoring model, the comparison and transparency docs, the suggestion engine, the
quality model, the brand-and-policy fit doc, the two benchmarking docs, and the closing
synthesis — all derive their authority from the laws declared here.

AdOS is the **Enterprise AI Operating System for Advertising**. Book B established how the
system *produces* creative work. Book C established how the system *explains* why it recommended
what it recommended. Book D established the company's *Performance Memory* — the evidence. Book E
establishes something that sits on top of all of them and answers the sharpest client-facing
question an agency ever has to answer out loud:

> **"Which of these creatives is better, and how do you know?"**

A generic large-language-model tool answers that question with a shrug dressed up as a number:
"I'd go with option B." AdOS is built to do the opposite. Book E exists to make one sentence
literally true and defensible:

> "AdOS does not just have an opinion about a creative; it produces a **judgement** that is
> transparent, reproducible, and grounded in the company's own evidence."

Everything in Book E — every score, every dimension, every weight, every comparison, every
suggestion, every benchmark — is in service of that sentence. This constitution declares the
laws that make it enforceable, the honesty model that keeps it truthful, and the boundaries that
keep it safe.

---

## 1. The central boundary — Book D is Evidence, Book E is Judgement

The single most important idea in this book is a boundary, not a feature.

> **Book D = Evidence → Book E = Judgement.**
> **Book E NEVER produces new data. It only interprets, scores, ranks, and compares.**

Book D remembers what happened: "214 campaigns in the finance vertical produced an average CTR
of 5.2%." That is a fact about the past. It is descriptive. It does not, on its own, tell anyone
what to do next.

Book E takes that fact and turns it into a *judgement*: "this hook is the stronger of the two,
and here is the reasoning." That is not a fact about the past. It is an interpretation, an
opinion with structure — a claim that one thing is better than another *for a stated reason*.

The reason this boundary is drawn so hard is that the two activities have completely different
failure modes and completely different trust requirements. Evidence can be wrong only if the
data collection was wrong. Judgement can be wrong in a hundred subtle ways — a hidden bias, an
undocumented weight, a comparison between things that should never have been compared, a number
that changes every time you ask. Book E's entire job is to make judgement **safe to trust** by
making it transparent. It does that by never letting judgement masquerade as evidence, and by
never letting itself generate the data it then judges.

**Practical consequence, stated plainly:** if a number in Book E cannot be traced back to
evidence that Book D supplied, plus rules and heuristics that are written down, then that number
does not belong in Book E. Book E has no data source of its own. It is a lens, not an eye.

---

## 2. The governing laws

The following eight laws thread through every Book E document. Each is stated, given its
rationale, and paired with how it is (or will be) enforced. These are the laws every subordinate
document must obey.

### LAW 1 — Judgment Separation (Evidence ≠ Judgement)

**The law.** Evidence and judgement are different kinds of thing and must never be confused.
"214 campaigns → CTR 5.2%" is **evidence**. "This hook is better" is a **judgement**. Book E's
job is not to hide the leap from one to the other — it is to make *how* the judgement is produced
completely transparent.

**Rationale.** The moment a judgement is presented as if it were a fact, trust is quietly
broken, because the human can no longer inspect the reasoning. An agency defending its work to a
client must be able to say "we chose B *because* of these dimensions and this evidence," not "the
tool said B." Separation is what makes the reasoning inspectable.

**How it is enforced.** Every Book E score is decomposed (Law 4) and every comparison shows the
dimensions and the evidence that drove the verdict (`COMPARISON_TRANSPARENCY.md`, E004; grounded
in Book C's explanation style, [`../../book-c/1-why-contract/EXPLAINABILITY_MODEL.md`](../../book-c/1-why-contract/EXPLAINABILITY_MODEL.md)).
A bare verdict — a number with no visible derivation — is a constitutional violation.

### LAW 2 — Judgment is Reproducible (the most important law)

**The law.** **Same Evidence + Same Rules + Same Heuristics = Same Score.** A creative score is
deterministic. It is never random, and it never depends on a model's momentary mood.

**Rationale.** This is the law that everything else stands on. If the same creative could score
87 today and 79 tomorrow with nothing changed, then the score means nothing, no comparison built
on it means anything, and no client would ever accept it as a basis for a decision.
Reproducibility is what separates a *judgement* from a *guess*. It is the precondition for
Law 1 (you cannot make transparent a process whose output you cannot reproduce) and the reason
Law 3 exists (an LLM's freeform opinion is not reproducible).

**How it is enforced.** Book E's scoring is built exclusively from deterministic machinery.
The reusable primitives it draws on are all pure, repeatable math — an exponential moving
average, a weighted confidence formula, a pattern-rank sort, a Jaccard similarity — not
sampling from a language model. See §5 for each primitive, its tier, and its citation. Where a
score could in principle drift, the law requires that the drift come only from *new evidence*,
never from re-rolling the same evidence.

### LAW 3 — Score is never an LLM opinion

**The law.** Every score is built from **Evidence + Rules + Heuristics**. It is never "the model
thinks this is an 8 out of 10."

**Rationale.** An LLM opinion is the exact thing Book E exists to replace. It is unreproducible
(violates Law 2), unexplainable in structural terms (violates Law 1), and impossible to compose
transparently (violates Law 5). "The model likes it" is not a judgement an agency can defend; it
is the black box the agency was trying to escape when it bought an operating system instead of a
chatbot.

**How it is enforced.** The three inputs to any score are named and separable:
- **Evidence** — supplied by Book D (per-client and per-vertical performance history). Book E
  never invents it.
- **Rules** — explicit, written constraints (brand banned-words lists, policy/PII checks,
  confidence thresholds). Deterministic by construction.
- **Heuristics** — documented scoring formulas (pattern rank, evidence weighting, sample-size
  confidence). Pure math, versioned, inspectable.

If a proposed score cannot be expressed as a function of those three, it is not a Book E score.

### LAW 4 — Score is Multi-Dimensional

**The law.** There is no single, atomic "87/100." An Overall score always decomposes into named
dimensions, and each dimension is shown separately:

> `Overall → Brand Fit · Policy Fit · Clarity · Readability · Specificity · Persuasiveness ·
> Evidence Support · Confidence`

**Rationale.** A single number is a place to hide. "87" tells a creative director nothing about
*what* to change; it collapses eight different questions — is it on-brand? is it compliant? is it
clear? is it backed by evidence? — into one opaque figure. Decomposition is what turns a score
from a grade into a diagnostic. It is also what makes a suggestion possible at all: you cannot
suggest "raise Clarity" if Clarity was never a visible dimension.

**How it is enforced.** The scoring model (`CREATIVE_SCORING_MODEL.md`, E002) defines the Overall
as a composition over these named dimensions and requires each to be displayed. **Confidence** is
itself one of the dimensions — Book E always shows how sure it is, never just how high.

### LAW 5 — No Hidden Weights

**The law.** The weights that compose an Overall score are documented. No score is ever formed
from weights the human cannot see.

**Rationale.** A hidden weight is a hidden bias. If Brand Fit secretly counts for 40% of the
Overall, then the whole book's promise of transparency is a lie by omission — the human sees the
dimensions but not how they were combined, which is exactly the part that determines the verdict.
Documented weights are what let a client or a compliance reviewer say "I disagree that Brand Fit
should dominate here" — a conversation that is only possible when the weighting is on the table.

**How it is enforced.** Every composed score ships with its weight table. An illustrative example
(the real percentages may change; the principle never does):

| Dimension    | Example weight |
|--------------|:--------------:|
| Brand Fit    | 25% |
| Evidence     | 20% |
| Policy       | 20% |
| Clarity      | 15% |
| Readability  | 10% |
| Confidence   | 10% |

The numbers above are an example, not a mandate — a different vertical or client may justify a
different table. What is non-negotiable is that *whatever* the table is, it is written down and
shown. A score that forms from weights nobody can see does not exist in Book E.

### LAW 6 — Comparison Before Optimization

**The law.** The flow order is fixed:

> `Evidence → Score → Comparison → Optimization`

You understand how good the current creative is (Score), and how it stands against the
alternatives (Comparison), *before* you suggest changing it (Optimization).

**Rationale.** Optimization without comparison is guessing. A suggestion to "shorten the
headline" is only meaningful if you already know the headline scored low on a dimension that
shortening would help, and that a shorter alternative actually scored better. Reversing the order
— suggesting first, scoring later — produces confident advice with no basis, which is precisely
the failure Book E was built to eliminate. Comparison is the evidence *for* an optimization.

**How it is enforced.** Part 2 (comparative intelligence) is positioned in the book *before*
Part 3 (optimization suggestions), and the suggestion engine (`SUGGESTION_ENGINE.md`, E005) is
required to build every suggestion on a scored gap and a compared alternative — "change X → to Y
→ because Z," where Z traces to a score and a comparison, never to a hunch.

### LAW 7 — Suggestion ≠ Automatic Rewrite

**The law.** The AI suggests; the human decides; always. **AdOS never auto-rewrites a creative.**

**Rationale.** Creative direction is a human responsibility and a human liability. An automatic
rewrite quietly transfers authorship — and accountability — from the creative director to the
tool, which is unacceptable in an enterprise context where someone must be able to stand behind
the work. A suggestion preserves human sovereignty: it puts a proposal in front of a person who
remains free to accept, reject, or ignore it. This is the law that keeps AdOS a *decision-support*
system and not a content-replacement system.

**How it is enforced.** `SUGGESTION_NOT_REWRITE.md` (E006) carries this law centrally and routes
every suggestion through the shipped human gate (Book B [`../../book-b/4-optimization/HUMAN_REVIEW.md`](../../book-b/4-optimization/HUMAN_REVIEW.md)
and Book A's approval engine) rather than redesigning it. No Book E capability writes a revised
creative back into the system without a human acceptance step.

### LAW 8 — Benchmark Integrity

**The law.** Only same-class items are ever compared: Finance ↔ Finance, E-commerce ↔ E-commerce,
B2B ↔ B2B. Book E never compares directly across contexts.

**Rationale.** A CTR that is excellent for B2B lead-gen may be mediocre for e-commerce impulse
retail. Comparing across classes produces conclusions that are not just wrong but confidently
wrong, and confidently-wrong benchmarks are worse than no benchmark at all — they get quoted to
clients. Class-matching is what makes a benchmark *fair*, and fairness is the whole value of a
benchmark.

**How it is enforced.** The benchmarking docs (`INTERNAL_BENCHMARKING.md`, E009;
`EXTERNAL_BENCHMARKING_BOUNDARY.md`, E010) require the comparison set to be filtered to the same
vertical and format before any baseline is computed. The comparison doc (`CREATIVE_COMPARISON.md`,
E003) applies the same rule to A-vs-B creative comparison: same class, or no comparison.

---

## 3. The two invariant sentences

Two sentences are load-bearing for the entire book. They appear verbatim in every Book E content
document, and they are stated here, in the governing document, first.

> **Higher score does not guarantee better business outcome.**

A score is a structured judgement about a creative's *qualities*, not a prophecy about a market.
The strongest-scoring headline can still underperform because of timing, audience, budget, or
luck — variables Book E does not model and does not pretend to. The score is a defensible reason
to prefer one option; it is never a promise about revenue. Any Book E surface that implies "score
up ⇒ money up" is misreading its own outputs.

> **Creative Intelligence ranks alternatives; humans choose direction.**

This is Law 7 compressed into a sentence and elevated to a creed. Book E's ceiling is *ranking* —
putting the options in a defensible order with the reasoning attached. The choice of direction,
the decision about which creative actually ships, belongs to a human being, always. Book E hands
the human a better-informed decision; it never takes the decision away.

---

## 4. The three-tier truth model

Book E uses the same honesty spine as Books B, C, and D. Every capability named in this book is
tagged with exactly one tier, and nothing unbuilt is ever claimed as shipped.

- **✅ SHIPPED** — the capability runs in the live web app today. A shipped claim must cite a
  wired `path:line`.
- **🔶 BUILT (UNWIRED)** — the code and its tests exist, but no live path reaches it. A built
  claim cites `path:line` and states plainly that it is dormant.
- **❌ ROADMAP** — no implementation exists. A roadmap claim carries no code citation; inventing
  one would be a lie.

The tiers are not decoration. They are the mechanism that keeps this book from becoming the
marketing brochure it is meant to replace. A reader must be able to tell, at a glance, the
difference between "this runs" and "this is designed." Every capability paragraph in every Book E
document ends in one of these three tags.

### 4.1 The global truth — the LiveAIManager bypass

There is one fact about the current system that changes how nearly every capability in Book E
must be tagged, and honesty requires stating it up front rather than burying it.

The live web app constructs its AI through `createAIManager` → **`LiveAIManager`**
([`apps/web/src/ai-factory.ts:39`](../../apps/web/src/ai-factory.ts), wired at
[`apps/web/src/main.ts:43`](../../apps/web/src/main.ts)). `LiveAIManager` **bypasses the entire
runtime pipeline** — the `AIManager` path where all the scoring, safety, and constitution
machinery lives. That pipeline and its engines are instantiated **only in tests**. Nothing in the
live app's request flow ever reaches them.

The consequence for this book is direct and must be stated without softening: **every judgement
primitive Book E would use to score a creative is 🔶 relative to the live app.** The machinery
exists, it is tested, it is deterministic — and it is dormant, sitting behind the bypass. Book E
is honest that **almost nothing which judges a *creative* is built and running today.** What
exists is reusable *machinery*: the scoring and safety and confidence engines, all real, all
unwired. Book E's near-term work is largely the work of *wiring that machinery to a creative* and
routing the live app through it.

This is not a caveat to be read once and forgotten. It is the reason the tags in §5 look the way
they do, and it is the honest baseline every subordinate document inherits.

---

## 5. Honest grounding — what actually exists today

This section tags the concrete building blocks. Book E's laws are aspirational until this
machinery is wired; the tiers below say exactly how far along that is.

### 5.1 The creative artifact is copy-only — and has no score (❌ for scoring)

The thing Book E judges is a **creative**, and in AdOS a creative is copy. `CreativeContent` is
six copy outputs — `headline`, `adCopy`, `cta`, `socialPost`, `landingPage{headline,body,cta}`,
and `email{subject,body}` — defined at
[`domains/creative-studio/src/creative/creative-set.ts:43-50`](../../domains/creative-studio/src/creative/creative-set.ts).
The studio produces **copy only** ([`domains/creative-studio/src/creative/service.ts:26`](../../domains/creative-studio/src/creative/service.ts));
the studio service is live as `CreativeStudioService` at
[`apps/web/src/app.ts:85`](../../apps/web/src/app.ts). ✅ for producing copy.

Two facts follow, and both bound this whole book:

- **There is no visual, video, carousel, or image artifact anywhere in AdOS.** Scoring a Visual,
  a Video, or a Carousel is therefore **❌ against the copy-only boundary** — not merely unbuilt,
  but out of scope for what a creative *is* in this product. The user-facing scoring elements map
  onto copy: Headline → `headline`, Hook / Primary Text → `adCopy` / `socialPost`, CTA → `cta`,
  Landing Angle → `landingPage`, Offer → expressed within the copy. Visual / Video / Carousel are
  ❌ copy-only.
- **`CreativeSet` has no score field and no scoring method**
  ([`creative-set.ts:86`](../../domains/creative-studio/src/creative/creative-set.ts)). There is
  today no place on a creative to put a score. **Creative scoring is ❌ ROADMAP.** This is the
  most important honest fact in Book E: the book describes a scoring *architecture*; the scoring
  itself is not built.

### 5.2 The scoring machinery is real, deterministic, and dormant (🔶 BUILT-UNWIRED)

Book E's laws demand deterministic **Evidence + Rules + Heuristics**. That machinery exists —
pure, repeatable math — and it is exactly the raw material Law 2 and Law 3 require. Every piece
below is 🔶 BUILT (UNWIRED): built and tested, but sitting behind the LiveAIManager bypass (§4.1).

- **Pattern rank** — [`domains/company-brain/src/pattern-library.ts:35`](../../domains/company-brain/src/pattern-library.ts):
  `evidence.value * confidence + reuseCount * 0.1`, sorted descending. A deterministic ranking
  heuristic — the shape of a creative-scoring sort.
- **Confidence** — [`domains/executive-memory/src/reasoning.ts:82`](../../domains/executive-memory/src/reasoning.ts):
  `0.5*avgWeight + 0.2*breadth + 0.3*success`, yielding 0–100. This is Law 4's Confidence
  dimension in code. Sample-size confidence `confidenceFromSample`
  ([`reasoning.ts:101`](../../domains/executive-memory/src/reasoning.ts), `min(1, n/100)`) and
  evidence weighting ([`reasoning.ts:29-51`](../../domains/executive-memory/src/reasoning.ts))
  give Evidence Support its structure.
- **Learning EMA** — [`packages/ai-manager/src/runtime/learning.ts:49`](../../packages/ai-manager/src/runtime/learning.ts):
  `ema()`, with argmax selection `best()` at
  [`learning.ts:53`](../../packages/ai-manager/src/runtime/learning.ts). A deterministic
  smoothing-and-selection primitive.
- **Prompt EMA** — [`domains/prompt-registry/src/in-memory-prompt-registry.ts:73`](../../domains/prompt-registry/src/in-memory-prompt-registry.ts):
  `prior*0.8 + reward*0.2` per prompt version, with A/B winner selection `selectActive`
  ([`in-memory-prompt-registry.ts:79`](../../domains/prompt-registry/src/in-memory-prompt-registry.ts),
  highest score wins) — the deterministic core of "which alternative won."

Every one of these is pure deterministic math (satisfying Law 2) and every one is live-unwired
(behind the bypass of §4.1). They are the reusable Evidence + Rules + Heuristics of Book E's
future scores — machinery waiting to be pointed at a creative.

### 5.3 Brand Fit and Policy Fit — the dimensions that have code (🔶 BUILT-UNWIRED)

Two of Law 4's eight dimensions actually have implementing code today. Both are deterministic and
offline; both are unwired.

- **Brand-rule data** — [`domains/agency-os/src/brand/brand.ts:40`](../../domains/agency-os/src/brand/brand.ts):
  `bannedWords: string[]` (alongside `voice` and `dos`/`donts`). The data is stored, round-tripped,
  and seeded in the demo — but **no code reads it to check a creative.** It is BUILT-as-data,
  UNWIRED and unenforced.
- **`RegexSafetyEngine`** — [`packages/ai-manager/src/runtime/safety-engine.ts:32`](../../packages/ai-manager/src/runtime/safety-engine.ts):
  deterministic offline checks for input injection and secrets, and for output PII
  (email / phone / card / IBAN), secrets, and brand-forbidden words. It is invoked only inside the
  runtime pipeline; the live app's `LiveAIManager` makes **zero** safety calls. 🔶.
- **`ConstitutionChecker`** — [`domains/executive-memory/src/governance.ts:23`](../../domains/executive-memory/src/governance.ts):
  checks that evidence is present, that confidence clears a threshold (default 70), that no
  brand-forbidden word appears, and that risk is weighed against Company DNA, with approval gates.
  🔶 BUILT-UNWIRED.

These are the seeds of the Brand Fit and Policy Fit dimensions; wiring them to inspect a creative
is the build. `BRAND_AND_POLICY_FIT.md` (E008) documents them in depth. For the operational gates
that already exist in the production pipeline, cross-reference Book B — do not duplicate them.

### 5.4 Benchmarking — one live baseline, the rest dormant or absent

- **Per-client mean ROAS (✅ SHIPPED — the only live baseline in all of Book E).** The live app
  computes a client's own average ROAS from its history at
  [`apps/web/src/routes.ts:1461-1470`](../../apps/web/src/routes.ts) (`avgRoas = reduce(...) /
  roasValues.length`). This is the one place where a Book E-style judgement input actually runs in
  production. ✅.
- **Per-vertical baseline (🔶 BUILT-UNWIRED).** `brain.marketing(vertical)` returns
  ROAS / CTR / sample size, consumed by the evidence engine at
  [`reasoning.ts:25-33`](../../domains/executive-memory/src/reasoning.ts) — but the live app never
  calls `.marketing(`. 🔶.
- **Agency aggregate, sector average, global benchmark (❌ NONE).** No such data source exists.
  Any Book E benchmark beyond the agency's own data is ❌ ROADMAP.
- **External data ingestion (❌ NONE, and forbidden).** The `connector-hub` is events-only — a
  single event name `CONNECTOR_METRIC_INGESTED_V1` with no implementation
  ([`domains/connector-hub/src/events.ts:11`](../../domains/connector-hub/src/events.ts)). There
  is no fetch, no HTTP, no scraping anywhere. Sector and global benchmarking are ❌ ROADMAP and
  out of scope under the no-external-data boundary; only own-data comparison (You vs Agency) is
  feasible.

**Summary of the honest baseline:** creative scoring is ❌; the reusable scoring, confidence,
learning, safety, and constitution machinery is 🔶 BUILT-UNWIRED; the only Book E judgement input
running live today is per-client average ROAS (✅). Book E is a designed architecture standing on
one shipped foothold and a shelf of dormant, tested machinery.

---

## 6. The A–E chain and the four questions

Book E is the last book of the intelligence stack, and it only makes sense in the company of the
four books beneath it. Each book answers one question; together they answer the whole.

- **Book A — Agency workflow.** The operational surface beneath everything: how the agency runs.
- **Book B — Production.** *What to produce.* How the AI generates the creative work.
- **Book C — Explanation.** *Why.* How the AI justifies what it recommended, from its own memory.
- **Book D — Performance Memory.** *What happened before.* The evidence: the record of past
  outcomes.
- **Book E — Creative Intelligence.** *Which is better.* Transparent judgement — scoring,
  comparison, optimization-suggestion, quality, benchmarking — over Book D's evidence.

Once A through E exist, AdOS answers **the four questions** an agency actually asks:

> **What to produce (B) · Why (C) · What happened before (D) · Which is better (E).**

Book A is the workflow all four ride on. The shared spine that runs through B–E is always the
same: **evidence → judgement → human decision.** Book E owns the middle term — judgement — and it
is scrupulous never to trespass on the first (it produces no evidence; that is Book D) or to seize
the last (it makes no decision; that is the human). The closing document of the book,
`THE_FOUR_QUESTIONS.md` (E011), draws this synthesis together.

---

## 7. The boundary with Book B, Part 4

Book B already documents a set of **operational gates** that live in the production pipeline:
scoring, brand safety, tone checking, readability, compliance, AI suggestions, the revision
engine, human review, and optimization metrics
([`../../book-b/4-optimization/`](../../book-b/4-optimization/)). Those documents describe the
gates as they sit in the *production* flow.

Book E is not a second copy of those gates. It is the deeper **creative-intelligence layer** —
the judgement architecture that scores, compares, and benchmarks creatives as transparent
reasoning over evidence. Where Book B Part 4 says "a safety gate runs here in the pipeline," Book E
says "here is how a Brand Fit *dimension* is scored, weighted, and defended." The relationship is
strict:

> **Reference the Book B Part 4 documents; do not duplicate them.**

When a Book E document needs a production gate — the human-review gate, the brand-safety check,
the readability pass — it links to the Book B doc
([`../../book-b/4-optimization/SCORING.md`](../../book-b/4-optimization/SCORING.md),
[`BRAND_SAFETY.md`](../../book-b/4-optimization/BRAND_SAFETY.md),
[`READABILITY.md`](../../book-b/4-optimization/READABILITY.md),
[`HUMAN_REVIEW.md`](../../book-b/4-optimization/HUMAN_REVIEW.md), and the rest) rather than
re-describing it. Book B owns the pipeline gates. Book E owns the judgement model. Neither
redraws the other.

---

## 8. The boundaries that keep Book E safe

Book E inherits the product-wide boundaries and adds the ones specific to judgement. Every
subordinate document restates the relevant boundaries; the governing statements are here.

- **100% local, offline-first.** Book E runs entirely on the agency's own machine. There is no
  cloud, no API, no telemetry, no external connector, no external benchmark. A judgement is
  produced from data that never leaves the building.
- **Copy-only.** The creative Book E judges is copy — the six outputs of §5.1. Visual, video, and
  carousel scoring are ❌ against the copy-only boundary, not merely unbuilt.
- **No new data — ever.** Book E interprets, scores, ranks, and compares. It does not generate the
  evidence it judges; that is Book D's sole responsibility. A Book E number that cannot be traced
  to Book D evidence plus written rules and heuristics does not belong in Book E.
- **No external benchmarks.** Only the agency's own data is a valid baseline. Sector, global, and
  agency-aggregate benchmarks are ❌ ROADMAP and forbidden to acquire via connectors, telemetry,
  or scraping (§5.4).
- **Human-sovereign.** Book E suggests; it never auto-rewrites (Law 7). The human chooses
  direction; Book E only ranks the alternatives.

These boundaries are not limitations to apologize for. They are the product. An enterprise
advertising buyer chooses AdOS *because* its judgement is local, its evidence is its own, and its
authorship stays human. The boundaries are the moat.

---

## 9. Value contribution

Transparent, reproducible creative judgement is not an academic virtue; it is a revenue-and-time
lever, and this book treats it as one.

- **Revenue (the agency wins and keeps accounts).** An agency that can put two creatives in front
  of a client and say "we recommend B — here are the eight dimensions, here is the weight table,
  here is the evidence from your own campaigns that supports it, and here is how sure we are" has
  a defensible position no taste-based argument can match. Defensibility closes business and
  retains it. A reproducible judgement is one the agency can stand behind next quarter, not just
  in the meeting.
- **Production time (the agency decides faster).** Deciding between creative options by taste
  invites a debate with no end condition. A decomposed, weighted, evidence-grounded score gives
  the room a shared basis to pick the strongest option quickly and move on — the human still
  choosing direction, but choosing it informed and fast instead of by the loudest voice.

Both levers depend entirely on the laws in §2 being real. A judgement that is not reproducible
cannot be defended (no revenue) and only lengthens the debate (no time saved). This is why Law 2
is the most important law, and why this constitution guards it above all.

And both levers are governed, always, by the two sentences this book cannot violate:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
