# Creative Quality Model

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

This document defines the **evaluation model for creative quality** — not a checklist of nice
qualities, but a *measurement model*: for each quality dimension, **what is measured** and **how it
would be measured deterministically**, as a documented rules-and-heuristics function over copy text.

It answers a single question, dimension by dimension: *given a piece of copy and nothing else, how
do you turn "is this good writing?" into a reproducible number that anyone can recompute by hand and
audit?*

It deliberately does **not** decide how those dimension numbers roll up into an Overall Creative
Score — that assembly lives in Part 1
([`../1-creative-scoring/CREATIVE_SCORING_MODEL.md`](../1-creative-scoring/CREATIVE_SCORING_MODEL.md)).
It also does **not** cover Brand Fit or Policy Fit; those are the two dimensions that already have
deterministic offline code, and they get their own document
([`./BRAND_AND_POLICY_FIT.md`](./BRAND_AND_POLICY_FIT.md)). This document is about the *copy-quality*
dimensions: Readability, Clarity, Emotion, Urgency, Trust, Specificity, Length, Originality.

Two sentences govern everything that follows, and they are stated here in full because they bound
the whole exercise:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

A quality metric orders copy and exposes exactly why. It never decides which copy ships.

---

## 2. The governing law for quality: Judgement is Reproducible

> **Law — Judgement is Reproducible.** Same Evidence + Same Rules + Same Heuristics = Same Score. A
> score is deterministic — never random, never dependent on a model's momentary mood.

Creative quality is where the temptation to "just ask the model" is strongest. It feels natural to
paste a headline into a language model and ask "how emotional is this, out of 10?" **AdOS does not
do that, by law.** Every quality dimension in this document is defined as a **deterministic function
over the copy text** — syllable counts, word counts, lexicon lookups, concrete-noun density — and
never as a model's opinion.

The reason is the same one that governs the whole book: a rating an agency cannot reproduce and
cannot inspect cannot be defended to a client. A generative model asked to rate copy will:

1. **Not reproduce** — sample "7" one minute and "8" the next.
2. **Not inspect** — answer "why?" only with "the model said so."
3. **Not separate taste from measurement** — fold style bias into one opaque digit.

A counting rule passes all three. `syllables / sentences` returns the same value on every machine,
forever; you can point at the exact formula that produced it; and it measures a text property, not a
preference. That is why every dimension below is specified as arithmetic, not a prompt.

> **Law — Score is never an LLM opinion.** Every score is built from Evidence + Rules + Heuristics —
> never "the model thinks it's an 8/10." This applies to quality dimensions with no exceptions.

**Tier for this whole model:** none of the quality metrics below are computed anywhere in the
product today. Every one is **❌ ROADMAP**. This document specifies the *design* of deterministic
metrics; §11 states the honest status without softening it.

---

## 3. The eight quality dimensions — a measurement model

Each dimension is specified the same way: **the property it captures**, **a deterministic
measurement approach** (the rule or heuristic), and the **inputs** it reads. Every dimension reads
only the copy text (and, where noted, the agency's own prior copy). None invents new data. Every one
is **❌ ROADMAP** — no code computes it and there is no `path:line` to cite, precisely because the
implementation does not exist.

The design contract for all eight: a metric is a **pure function** `metric(text) → number in a fixed
range`, with the range and the formula written down. Feed the same text and you get the same number.

### 3.1 Readability — can the audience read it effortlessly? ❌ ROADMAP

**Property.** The reading effort a piece of copy demands. Short words and short sentences read
easily; long words and long sentences do not.

**Deterministic approach.** Classic readability formulas that operate purely on countable text
features — no comprehension model required:

- Count total **words**, total **sentences** (split on terminal punctuation), and total
  **syllables** (a deterministic vowel-group heuristic per word).
- Compute a grade-level style index, e.g. a Flesch-style reading-ease of the form
  `206.835 − 1.015·(words/sentences) − 84.6·(syllables/words)`, or an
  average-sentence-length + long-word-percentage index. The exact coefficients are a documented
  choice; the point is that they are fixed and published.
- Map the raw index onto a bounded 0–100 quality score with a documented piecewise mapping (e.g. a
  target reading grade band scores highest; far above or below it scores lower).

**Inputs.** Copy text only. **Reproducible:** identical text → identical syllable and sentence counts
→ identical score.

> A doc-only design for readability already exists in the production-pipeline docs —
> [`../../book-b/4-optimization/READABILITY.md`](../../book-b/4-optimization/READABILITY.md). It is
> **doc-only, no code**. This document does not duplicate it; it treats readability as one dimension
> of the broader quality model and points there for the pipeline-gate framing.

### 3.2 Clarity — one idea, cleanly stated? ❌ ROADMAP

**Property.** Whether the copy states a single, unambiguous idea rather than hedging or piling up
clauses. Distinct from Readability: a sentence can be easy to read yet say two things at once.

**Deterministic approach.** Structural counting rules, all lexicon- and punctuation-based:

- **Sentence-complexity signal:** average clauses per sentence (approximated by counting
  conjunctions and subordinators from a fixed list), and average sentence length.
- **Hedge/filler density:** occurrences of a documented hedge lexicon ("maybe", "sort of", "we
  think", "arguably") per 100 words — higher density lowers Clarity.
- **Idea-count signal:** number of distinct top-level assertions per field (approximated by
  sentence and connective counts); a single-claim headline scores higher than a three-claim one.

Combine these into a bounded 0–100 score with documented weights. **Reproducible:** every input is a
count against a fixed word list or a fixed punctuation rule.

### 3.3 Emotion — does it carry affective charge? ❌ ROADMAP

**Property.** How much emotional weight the copy pulls — the presence of affective language rather
than flat, neutral description.

**Deterministic approach.** A **lexicon-based affect count**, not sentiment inferred by a model:

- Maintain a documented, versioned emotion lexicon (positive-affect words, negative-affect words,
  high-arousal words). The lexicon is data the reader can inspect.
- Count matches per 100 words to get an **affect density**; optionally split into
  positive/negative/arousal sub-scores.
- Map density onto a bounded 0–100 score with a documented curve (too flat scores low; overwrought
  wall-to-wall affect also scores low — a documented target band).

**Inputs.** Copy text + the published lexicon. **Reproducible:** lexicon lookups are exact string
matches; no interpretation.

### 3.4 Urgency — does it create a reason to act now? ❌ ROADMAP

**Property.** Whether the copy supplies a time or scarcity reason to act rather than deferring the
decision.

**Deterministic approach.** A **time-and-scarcity cue lexicon**:

- A documented list of urgency cues in two buckets: **time cues** ("today", "now", "ends tonight",
  "24 hours", "last chance", "deadline") and **scarcity cues** ("only 3 left", "limited",
  "while supplies last", "selling out").
- Count cue occurrences (and detect numeric-deadline patterns like "48h", "ends 5/1" with a fixed
  regex) to get an **urgency-cue density**.
- Map onto a bounded 0–100 score; a documented cap prevents "spammy" over-stacking of cues from
  scoring higher than a clean single call.

**Inputs.** Copy text + the published cue lexicon. **Reproducible:** exact lexicon and regex
matches.

### 3.5 Trust — does it read as credible, not hype? ❌ ROADMAP

**Property.** Whether the copy signals credibility — proof, specifics, guarantees — versus unbacked
superlatives that erode trust.

**Deterministic approach.** A **two-sided lexicon-and-pattern count**:

- **Trust-positive signals:** proof words ("guaranteed", "certified", "refund", "trusted by"),
  numeric evidence patterns ("4.8/5", "10,000 customers"), and citation-style phrasing — each from a
  documented list or regex. These raise the score.
- **Trust-negative signals:** unbacked superlatives and hype ("best ever", "miracle", "#1"
  without a source), excessive exclamation, ALL-CAPS runs — each from a documented list or rule.
  These lower the score.
- Net the two densities into a bounded 0–100 score with documented weights.

**Inputs.** Copy text + published lexicons. **Reproducible:** deterministic string and regex counts.
Trust is a measurement of *signals present in the text*, never a judgement of whether a claim is
actually true — truthfulness is a human and Policy-Fit matter, not a quality-lexicon matter.

### 3.6 Specificity — concrete claims vs vague filler? ❌ ROADMAP

**Property.** How concrete the copy is — real nouns, numbers, and named things versus abstract
filler ("solutions", "value", "quality").

**Deterministic approach.** A **concrete-density heuristic**:

- **Number density:** count of numerals, percentages, prices, and dates per 100 words (fixed
  regex). Numbers are the strongest specificity signal.
- **Concrete-noun density:** matches against a documented concrete-noun list (or, minimally, a
  documented abstract-noun *stoplist* whose members *lower* the score).
- **Named-entity-style patterns:** capitalised multi-word runs, units, and product-name patterns
  via fixed rules.
- Combine into a bounded 0–100 score with documented weights.

**Inputs.** Copy text + published lists. **Reproducible:** counting and regex only. Specificity is
one of the four dimensions that feeds directly into the Part 1 score (§4).

### 3.7 Length — is the copy the right size for its field? ❌ ROADMAP

**Property.** Whether each copy field sits in a sensible size band for its role — a headline is not a
paragraph; an email body is not three words.

**Deterministic approach.** The simplest possible metric, and the honest anchor of this whole
document: **count**.

- **`wordCount`** and **`charCount`** per field (whitespace-split word count, string-length
  character count).
- Compare against a documented per-field target band (headline, adCopy, cta, socialPost,
  landingPage, email each have their own band).
- Map distance-from-band onto a bounded 0–100 score.

This is arithmetic a spreadsheet does. It is called out first among the "trivial" metrics for a
reason stated bluntly in §11: **even this is not computed anywhere today.** There is no `wordCount`
or `charCount` on the copy artifact. Length is the floor of the measurement model and the floor is
still empty.

**Inputs.** Copy text + documented per-field bands. **Reproducible:** counting.

### 3.8 Originality — is this fresh, or a template rerun? ❌ ROADMAP

**Property.** How distinct a piece of copy is from the agency's own prior copy — is it a fresh angle
or the same headline the team has shipped twenty times?

**Deterministic approach.** A **similarity heuristic against the agency's own history**, mirroring
the deterministic similarity math already used elsewhere in the product:

- Tokenise the new copy and each prior piece into word/shingle sets.
- Compute a set-overlap similarity (a Jaccard-style ratio) against the corpus of prior copy — the
  same deterministic similarity family the experience engine uses for recall.
- **Originality = 1 − max-similarity**, mapped onto a bounded 0–100 score. High overlap with an
  existing piece scores low; a genuinely novel angle scores high.

**Inputs.** Copy text + the agency's own prior copy (read-only). This is the one dimension that
consults more than the single artifact — and it consults only the agency's *own* data, never an
external corpus (§9). **Reproducible:** set overlap is exact arithmetic; same corpus + same text →
same ratio.

---

## 4. Relationship to the Part 1 multi-dimensional score

These quality dimensions are not free-floating. They are the **raw material** for the
multi-dimensional Overall defined in Part 1
([`../1-creative-scoring/CREATIVE_SCORING_MODEL.md`](../1-creative-scoring/CREATIVE_SCORING_MODEL.md)).
The Overall decomposes into named dimensions:

```
Overall → Brand Fit · Policy Fit · Clarity · Readability · Specificity · Persuasiveness ·
          Evidence Support · Confidence
```

Four of those score dimensions are quality metrics from this document, used directly:

| Part 1 score dimension | Source in this document |
|---|---|
| **Clarity** | §3.2 — clarity metric |
| **Readability** | §3.1 — readability formula |
| **Specificity** | §3.6 — concrete-density heuristic |
| **Persuasiveness** | composed from §3.3 Emotion + §3.4 Urgency + §3.5 Trust (see below) |

### 4.1 Persuasiveness is composed from quality signals

**Persuasiveness** is a Part 1 score dimension, but it is not measured with its own single metric.
It is **composed** from three quality signals in this document — **Emotion (§3.3)**, **Urgency
(§3.4)**, and **Trust (§3.5)** — combined with documented weights. Structurally: does the copy carry
affective pull (Emotion), a reason to act now (Urgency), and credibility (Trust)? A creative strong
on all three reads as persuasive; one that is flat, timeless, and hype-heavy does not. Because the
composition is documented and each input is a deterministic count, Persuasiveness inherits
reproducibility straight through.

### 4.2 What this document does not decide

The remaining quality dimensions here — **Length (§3.7)** and **Originality (§3.8)** — are diagnostic
metrics that may or may not enter the Part 1 Overall in a shipped configuration; whichever it is, the
Part 1 **published weight table** is the authority, not this document. This document *defines the
measurements*; Part 1 *decides the roll-up*. The split keeps each concern in one place.

### 4.3 Brand Fit and Policy Fit are elsewhere

Two of the eight Part 1 dimensions — **Brand Fit** and **Policy Fit** — are **not** quality-lexicon
metrics and are **not** covered here. They are the only two dimensions with real deterministic code
today, and they have their own document:
[`./BRAND_AND_POLICY_FIT.md`](./BRAND_AND_POLICY_FIT.md). This document is copy-quality; that one is
brand/safety enforcement.

---

## 5. No hidden weights — how the dimensions combine

> **Law — No Hidden Weights.** The weights that compose a score are documented. Real percentages may
> change; the principle never does — no score forms from hidden weights.

Two layers of combination appear in this document, and both are documented in the open:

1. **Inside a dimension.** Where a dimension nets multiple signals — Clarity from complexity +
   hedge-density + idea-count; Trust from positive minus negative signals; Persuasiveness from
   Emotion + Urgency + Trust — the sub-weights are written down next to the formula. There is no step
   where an unpublished coefficient shapes a dimension.
2. **Across dimensions.** How the quality dimensions feed the Part 1 Overall is governed by the
   Part 1 published weight table, not by anything hidden here.

The rule is not "these exact numbers forever." Real coefficients may be re-tuned. The rule is:
**whatever the numbers are, they are on the page**, and anyone can recompute a dimension score by
hand from the copy and the published lexicon. That is what makes a quality score defensible rather
than merely produced.

---

## 6. Every dimension is a documented, deterministic function

Pulling §2, §3, and §5 together, the model has a single shape:

```
qualityDimension(text)                → number in [0, 100]   // pure, documented, reproducible
persuasiveness(emotion, urgency, trust) → number in [0, 100]  // documented composition
```

- **Documented** — the formula, the lexicon, and the range are published, not buried.
- **Deterministic** — counts, formulas, lexicon lookups, and set overlaps only. No sampling, no
  clock, no network, no model call.
- **Reproducible** — same copy (and, for Originality, same prior-copy corpus) → the same number on
  every machine, forever.

This is the whole point of a *model* rather than a *list*: a list names qualities; a model says
precisely how each becomes a number you can stand behind.

---

## 7. Grounding in the existing deterministic machinery

None of the quality metrics is implemented, but they are not fantasy math. The product already ships
a family of **pure deterministic heuristics** that the quality metrics would reuse or mirror — all
**🔶 BUILT (UNWIRED)**, all satisfying the reproducibility law:

| Reusable pattern | Formula | Citation | Tier |
|---|---|---|---|
| Set-overlap similarity (for Originality, §3.8) | Jaccard + sort | `domains/company-brain/src/experience-engine.ts:30` | 🔶 |
| Pattern rank (documented weighted heuristic shape) | `evidence.value*confidence + reuseCount*0.1`, sort desc | `domains/company-brain/src/pattern-library.ts:35` | 🔶 |
| Confidence roll-up (documented weighted composition) | `0.5*avgWeight + 0.2*breadth + 0.3*success` → 0–100 | `domains/executive-memory/src/reasoning.ts:82` | 🔶 |

These show the house style a quality metric would follow: fixed arithmetic, bounded output, no model
call. They are tagged **🔶** — the code and its tests exist, but no live path reaches them, because
the live app builds AI via `createAIManager` → `LiveAIManager`
(`apps/web/src/ai-factory.ts:39`, `apps/web/src/main.ts:43`), which **bypasses the entire runtime
pipeline** where such machinery is instantiated. That pipeline runs only in tests. The quality
metrics themselves remain **❌ ROADMAP** — even the machinery they would lean on is dormant behind the
bypass.

---

## 8. Copy-only: quality is measured on six fields, nothing else

Quality is measured on a **real artifact**, and in AdOS that artifact is **copy only**.

The creative artifact is `CreativeContent` — six copy outputs of a sprint:
`headline, adCopy, cta, socialPost, landingPage{headline,body,cta}, email{subject,body}`
(`domains/creative-studio/src/creative/creative-set.ts:43-50`). The producing service is explicit:
it **"Produces copy ONLY"** (`domains/creative-studio/src/creative/service.ts:26`). Every quality
metric in §3 runs over these six text fields and nothing else.

There is therefore **no visual, video, carousel, or image quality** in this model — not because it
is unbuilt, but because **no visual/video/image artifact exists anywhere in the product**. Measuring
image contrast, thumbnail stopping-power, or video pacing is **❌ against the copy-only boundary**, a
design boundary rather than a backlog item. A metric cannot measure an object the system does not
produce.

Each of the six fields carries its own targets — a headline's Length band, Readability target, and
Clarity expectation differ from an email body's. The model is per-field, then rolled up per Part 1.

---

## 9. Book E produces no new data — quality metrics only read

> **Book D = Evidence → Book E = Judgement. Book E NEVER produces new data.**

The quality model is pure judgement. It **reads** and computes; it never writes back a new dataset.

- Seven of the eight dimensions (Readability, Clarity, Emotion, Urgency, Trust, Specificity, Length)
  read **only the copy text** of the artifact. They consult published lexicons and bands — reference
  data, not performance data — and emit a number.
- **Originality (§3.8)** additionally reads the agency's **own prior copy**, read-only. That corpus
  is the agency's existing artifacts, not a new store this model creates, and never an external
  corpus.
- Where a quality dimension contributes to the Part 1 Overall alongside **Evidence Support** and
  **Confidence**, those two *evidence* dimensions draw on Book D's Performance Memory — computed by
  Book D, consumed read-only by Book E (see
  [`../1-creative-scoring/CREATIVE_SCORING_MODEL.md`](../1-creative-scoring/CREATIVE_SCORING_MODEL.md)).

Quality measurement is a read over the copy plus Book D's already-aggregated evidence. It produces a
score, not a dataset.

---

## 10. Prior doc-only designs in the production pipeline

Two quality-adjacent designs already exist as **doc-only, no code** in the Book B production
pipeline. This document is the deeper creative-intelligence view of the same properties and does not
duplicate them:

- **Readability** (§3.1) — the pipeline-gate framing lives in
  [`../../book-b/4-optimization/READABILITY.md`](../../book-b/4-optimization/READABILITY.md).
- **Tone / voice checking** — the closest pipeline design to Emotion/Trust lives in
  [`../../book-b/4-optimization/TONE_CHECKER.md`](../../book-b/4-optimization/TONE_CHECKER.md).

Both are documented designs with **no implementation** behind them today. They are referenced, not
restated. Tone and voice are stored on the brand record but there is **no tone/voice checker** in
code — consistent with the honest tier below.

---

## 11. Honest tier: none of this is computed today

The tier for the entire quality model is uniform and stated without hedging:

> **Every quality dimension in this document is ❌ ROADMAP. None is computed anywhere in the product
> today.**

The clearest proof is the trivial end of the scale. **Length is not measured.** There is no
`wordCount` and no `charCount` on the copy — the copy artifact carries no measurement fields at all,
and `CreativeSet` has **no score field and no scoring method**
(`domains/creative-studio/src/creative/creative-set.ts:86`). If the simplest conceivable metric —
counting words — is absent, then Readability formulas, affect lexicons, urgency cues, concrete-noun
density, and originality similarity are all the more clearly unbuilt.

There is no `path:line` to cite for any quality metric, because there is no code. This document is a
**design specification** for how these metrics *would* be measured deterministically — it is
architecture, not an inventory of shipped features. The value of writing it down now is that when the
metrics are built, they are built as reproducible arithmetic from day one, never as a model prompt.

---

## 12. Boundaries

The quality model lives inside AdOS's product boundaries and does not stretch them:

- **Deterministic only.** Every dimension is a counting/formula/lexicon function. No dimension asks a
  model for an opinion (Law 2, Law 3).
- **100% local, offline-first.** Every metric is computable on-device with the network cable pulled —
  lexicons are local reference data, not a remote service.
- **Copy-only.** The six copy fields are the whole surface (§8). Visual/video/image quality is **❌
  against the copy-only boundary**, not a pending feature.
- **No new data.** Quality metrics read copy (and, for Originality, the agency's own prior copy) and
  Book D evidence; they produce a score, never a new dataset (§9).
- **No external data.** Originality compares against the agency's **own** history only — never an
  external corpus, benchmark, or scraped source.
- **Human-sovereign.** A quality score ranks and explains; it never decides which copy ships and
  never auto-rewrites. The strategist chooses.

---

## 13. Value contribution

Objective, reproducible quality dimensions change two numbers an agency cares about:

- **Revenue.** Objective quality dimensions **replace taste-based debate with defensible measurement**
  and **catch weak copy before a client ever sees it.** "This headline scores low on Specificity —
  zero numbers, three abstract nouns — and low on Trust, two unbacked superlatives" is a note a team
  can act on and a client can respect. A quality gate that flags forgettable copy internally protects
  the account and the agency's reputation.
- **Production time.** A reproducible per-dimension read lets a team pick the strongest draft **fast**
  instead of re-arguing by feel every review. Same copy, same scores, no re-litigation — hours of
  opinion-trading collapse into a glance at eight numbers.

Both gains hold only under the same discipline that governs the whole book: quality metrics rank
alternatives, and a human chooses direction — every time.

---

## 14. Summary

- The quality model defines, dimension by dimension, **how creative quality is measured
  deterministically** — a measurement model, not a list.
- Eight copy-quality dimensions — **Readability, Clarity, Emotion, Urgency, Trust, Specificity,
  Length, Originality** — each a documented pure function over copy text (Length via word/char count;
  Readability via syllable/sentence formulas; Emotion/Urgency/Trust via published lexicons;
  Specificity via number/concrete-noun density; Originality via set-overlap similarity).
- Every dimension is **deterministic and reproducible** (Law 2), **never a model opinion** (Law 3),
  with **documented weights and no hidden coefficients** (Law 5).
- Four dimensions feed the Part 1 Overall directly — **Clarity, Readability, Specificity** — and
  **Persuasiveness** is composed from **Emotion + Urgency + Trust**; the roll-up authority is Part 1's
  published weight table.
- **Brand Fit and Policy Fit** — the two dimensions that *do* have code — are covered separately in
  [`./BRAND_AND_POLICY_FIT.md`](./BRAND_AND_POLICY_FIT.md).
- Quality is measured on the **six copy fields only** (`creative-set.ts:43-50`); visual/video/image
  quality is **❌ against the copy-only boundary** (`service.ts:26`).
- **Every quality metric is ❌ ROADMAP** — none is computed today; even copy length is not measured
  (`CreativeSet` has no score field, `creative-set.ts:86`).
- Book E **produces no new data**: quality metrics read the copy plus Book D evidence and emit a
  score.

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
