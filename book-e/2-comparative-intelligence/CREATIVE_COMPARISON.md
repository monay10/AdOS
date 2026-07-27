# Creative Comparison

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

This document defines **how AdOS compares two (or more) creatives** — Creative A against
Creative B — so that a human can see not only *which* one leads, but **where** it leads and
**why**. Comparison is the second stage of Creative Intelligence: after each creative has been
scored, and before anyone suggests changing it.

The core discipline is simple to state and easy to violate: **comparison never collapses to a
single number.** It would be trivial to print "A: 84, B: 79 — A wins" and move on. That answer
is useless to a strategist defending a media decision, because it hides the reason. AdOS
compares creatives the way it scores them — **dimension by dimension** — so the output is not a
verdict but an explanation with a verdict attached.

Two sentences govern everything below, and they are stated in full here because they are the
boundary of the whole exercise:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

A comparison orders options and exposes its reasoning. It never makes the call. When AdOS says
"A leads B on six of eight dimensions," that is decision *support* — the account lead still
chooses direction, and may rationally pick B for a reason the score cannot see.

This document does **not** re-derive how each dimension is measured (that is Part 1 and Part 4),
and it does **not** cover how to *present* the reason narrative to a human (that is E004,
[`./COMPARISON_TRANSPARENCY.md`](./COMPARISON_TRANSPARENCY.md)). It defines the comparison
operation itself: its inputs, its ordering in the pipeline, its integrity rule, and its honest
build status.

---

## 2. Comparison reads scores — it produces no new data

Book E is the **judgement** layer. It interprets, scores, ranks, and compares. It **never
produces new data.** Every fact a comparison uses was created and aggregated upstream by Book D
(Performance Memory) and turned into scores by Part 1.

Comparison is the purest expression of this rule. It **generates no creatives, computes no new
evidence, and writes back no dataset.** It reads two already-computed multi-dimensional scores,
lines them up, and reports the differences. That is all. If Creative A and Creative B did not
already have scores, there is nothing to compare — comparison is a *reader*, not a *producer*.

- It does not call a language model to author a new variant.
- It does not fetch external data (there is no network path; see §9).
- It does not store a "comparison result" as a new source of truth. The scores remain the
  source of truth; the comparison is a derived view over them.

This matters for reproducibility (§7) and for the honest tier (§5): because comparison only
reads, its correctness reduces entirely to the correctness and stability of the scores it reads.

---

## 3. Comparison works on the multi-dimensional score

A comparison inherits its shape from the score. Part 1 defines the Creative Score as an
**Overall that decomposes into eight named dimensions**, each shown separately — never a single
"87/100." See [`../1-creative-scoring/CREATIVE_SCORING_MODEL.md`](../1-creative-scoring/CREATIVE_SCORING_MODEL.md)
for how each dimension is built from Evidence + Rules + Heuristics.

Comparison therefore operates **on all eight axes at once**, not on the Overall alone:

```
                Creative A     Creative B     Leader     Margin
Brand Fit           82             71            A         +11
Policy Fit          PASS          PASS           =          —
Clarity             77             80            B          +3
Readability         74             69            A          +5
Specificity         63             81            B         +18
Persuasiveness      70             72            B          +2
Evidence Support    88             54            A         +34
Confidence          79             41            A         +38
                ─────────────────────────────────────────────
Overall (roll-up)   ~80           ~68           A (—)   see §3.2
```

### 3.1 Dimension by dimension, so a human sees WHERE and WHY

The value of the table above is not the bottom line. It is the middle. Read it and the story is
immediate: **A wins the argument, but not everywhere.** B is actually the more *specific* and
slightly more *persuasive* piece of copy — B's headline makes concrete claims. A wins overall
because it is far better *supported*: 88 vs 54 on Evidence Support and 79 vs 41 on Confidence
mean many more comparable campaigns back A's angle, and back it more reliably.

That is a sentence an account lead can say to a client: *"We are recommending A because the
evidence behind its angle is deeper — but B's copy is more specific, so we are lifting B's
concrete phrasing into A."* A single "A: 80, B: 68" can produce none of that. **The
decomposition is the point** — it shows the reader *where* one creative leads and *why*, dimension
by dimension, including the dimensions where the "loser" actually wins.

The eight dimensions compared are exactly the eight Part 1 defines:

| Dimension | What the comparison exposes |
|---|---|
| **Brand Fit** | Which creative sounds more like *this* brand's voice and honours its dos/donts |
| **Policy Fit** | Whether either creative trips an offline safety/compliance gate (a gate, not a gradient — see §3.3) |
| **Clarity** | Which states one idea more cleanly |
| **Readability** | Which the target audience can read more effortlessly |
| **Specificity** | Which makes the more concrete, numeric claims vs vague filler |
| **Persuasiveness** | Which structure carries hook, value, and ask more completely |
| **Evidence Support** | Which angle more real performance data backs (Book D) |
| **Confidence** | Which score to trust more, given sample size and breadth (Book D) |

### 3.2 The Overall is a tiebreak convenience, never the comparison

Comparison *may* report the Overall roll-up as a single ordering hint — "A leads" — but that
number is a convenience for sorting, never a substitute for the eight-axis view. Under Part 1's
**No Hidden Weights** law, the Overall is a documented weighted combination of the dimensions;
the comparison never invents a private weighting of its own. If two creatives tie on Overall,
the dimensions break the tie transparently. If they differ on Overall, the dimensions explain
the difference. Either way, **the eight axes are always shown alongside any single-number
leader.**

### 3.3 Policy Fit is a gate in comparison too

Part 1 makes Policy Fit a documented **gate**: a creative that trips a banned-word, PII, or
secrets rule has its Overall capped. In comparison, this means a creative that **fails** Policy
Fit does not "lose narrowly on one axis" — it is disqualified from leading regardless of how
strong it is elsewhere. A dazzling, highly-persuasive variant that leaks an email address does
not beat a clean, modest one. The gate is a documented rule, stated in the open, so it does not
violate transparency — it *is* the transparency.

---

## 4. LAW — Comparison Before Optimization

> **Law — Comparison Before Optimization.** The flow order is fixed:
> **Evidence → Score → Comparison → Optimization.** Understand how good the current creatives
> are, and how they stand relative to each other, before suggesting any change.

This is not a stylistic preference. It is a governing law of Book E, and this document sits at
the third station of that pipeline.

```
   Book D                Part 1              Part 2 (this doc)        Part 3
 ┌──────────┐        ┌──────────────┐      ┌──────────────────┐   ┌──────────────┐
 │ EVIDENCE │  ───▶  │    SCORE     │ ───▶ │    COMPARISON    │──▶│ OPTIMIZATION │
 │ (memory) │        │ multi-dim'l  │      │  A vs B, per-dim │   │  suggestions │
 └──────────┘        └──────────────┘      └──────────────────┘   └──────────────┘
   produces            interprets            ranks alternatives      suggests, never
   the facts           the facts             (no new data)           auto-rewrites
```

### 4.1 Why comparison must come before optimization

An optimization suggestion answers "change X → to Y → because Z." You cannot responsibly say
*because Z* until you know **how good the creatives already are and where exactly one falls short
of the other.** Optimizing before comparing is guessing: you might "improve" a dimension that was
already the winning one, or rewrite the wrong creative entirely.

Comparison supplies the *because*. In the §3 example, comparison establishes that A's weakness
relative to B is **Specificity (63 vs 81)** and **Persuasiveness (70 vs 72)**. Only *then* can
Part 3 make a grounded suggestion: "lift B's concrete phrasing into A." Without the comparison
step, an optimizer has no evidence for which dimension to touch.

### 4.2 Why comparison must come after scoring

Symmetrically, comparison cannot precede scoring, because **a comparison of unscored creatives is
just taste.** The entire point of Book E is to replace "I like A better" with "A leads B on
Evidence Support by 34 points, backed by N comparable campaigns." That substitution is only
possible once both creatives carry multi-dimensional scores. So Part 1 runs first, always. This
document assumes its inputs already exist as scores; it does not compute them.

**The ordering is fixed and one-directional: Evidence → Score → Comparison → Optimization.** No
station may be skipped, and none may run out of turn.

---

## 5. Honest tier: creative A-vs-B comparison does not exist yet

Book E is honest about what runs today. For creative comparison, the honest answer is blunt:

> **Creative A-vs-B comparison is ❌ ROADMAP.**

There is **no code path anywhere in the product** that takes two `CreativeSet`s and returns a
per-dimension comparison. This follows directly from Part 1: a `CreativeSet` has no score field
and no scoring method, so there are no multi-dimensional scores for a comparator to line up in
the first place. No score, no comparison. Book E does not pretend otherwise, and there is no
`path:line` to cite for "compare two creatives," because no such code exists.

### 5.1 The nearest existing primitive: prompt-VARIANT selection

The closest thing the codebase has to an A-vs-B chooser is **prompt-variant selection**, and it
is important to be precise about what it does and does not do.

`selectActive` picks the winning **prompt version** on a "highest score wins" basis
(`domains/prompt-registry/src/in-memory-prompt-registry.ts:79`). Each prompt version carries an
exponential-moving-average score, `prior * 0.8 + reward * 0.2`
(`domains/prompt-registry/src/in-memory-prompt-registry.ts:73`), and `selectActive` returns the
version with the highest such score. This is genuinely an A/B winner-picker.

But it ranks the **wrong objects**, and it is **not wired**:

- **It ranks prompt versions, not creatives.** The "A" and "B" it chooses between are two
  versions of a *prompt template* used to generate copy — not two finished creatives being
  judged for a client. It compares a single scalar EMA per prompt version; it has no concept of
  the eight creative dimensions (Brand Fit, Policy Fit, Clarity, and the rest).
- **It is a single number, not a decomposition.** "Highest score wins" is precisely the
  collapse this document forbids for creatives. As a prompt-routing heuristic that is fine; as a
  creative comparison it would violate the multi-dimensional law.
- **It is 🔶 BUILT (UNWIRED).** The code and its tests exist, but no live path reaches it — it
  sits behind the same bypass described in §6.

So `selectActive` is the nearest *primitive*, not a creative comparator. It proves the pattern
("rank alternatives, highest wins") exists and is tested; it does not compare creatives.

### 5.2 The deterministic ranking and similarity primitives a comparator would reuse

A real same-class creative comparator would not be written from scratch. It would assemble
deterministic primitives that already exist and are already tested — all **🔶 BUILT (UNWIRED)**:

| Primitive | What it does | Citation | Tier |
|---|---|---|---|
| Prompt EMA + `selectActive` | scalar score per version, highest wins | `domains/prompt-registry/src/in-memory-prompt-registry.ts:73` / `:79` | 🔶 |
| Pattern rank | `evidence.value*confidence + reuseCount*0.1`, sort desc — orders alternatives by evidence | `domains/company-brain/src/pattern-library.ts:35` | 🔶 |
| Experience similarity | Jaccard overlap + sort — tells whether two items are *comparable* | `domains/company-brain/src/experience-engine.ts:30` | 🔶 |
| Confidence | `0.5*avgWeight + 0.2*breadth + 0.3*success` → 0–100 | `domains/executive-memory/src/reasoning.ts:82` | 🔶 |

The **pattern-rank** primitive (`domains/company-brain/src/pattern-library.ts:35`) is a
deterministic descending sort of alternatives by an evidence-weighted score — exactly the
ranking backbone a per-dimension comparator needs. The **Jaccard similarity** primitive
(`domains/company-brain/src/experience-engine.ts:30`) is what a comparator would use to decide
whether A and B are even the *same class* and thus eligible to be compared (§8) — Jaccard
overlap measures how alike two items' feature sets are.

Each is pure deterministic math (satisfying the reproducibility law, §7) and each is already
covered by tests. **What is missing is the assembler**: a comparator that reads two creatives'
eight-dimensional scores, checks they are same-class, computes the per-dimension deltas, and
returns the decomposed A-vs-B view. That assembler is the build.

> **Tier summary:** creative A-vs-B comparison is **❌ ROADMAP**; the ranking, selection, and
> similarity *machinery* it would reuse is **🔶 BUILT (UNWIRED)**.

---

## 6. Why the machinery is UNWIRED: the LiveAIManager bypass

The primitives in §5.2 are tagged 🔶 and not ✅ for one structural reason, the same reason that
runs through all of Book E.

The live web app builds its AI through `createAIManager` → `LiveAIManager`
(`apps/web/src/ai-factory.ts:39`, `apps/web/src/main.ts:43`). `LiveAIManager` **bypasses the
entire runtime pipeline** — the pipeline where the scoring, ranking, selection, and reasoning
machinery is instantiated. That pipeline and its engines are wired up **only in tests**.

The practical consequence: every comparison-relevant primitive above runs in the test suite, but
**not** when a user opens AdOS. So there is nothing dishonest in the 🔶 tag — the arithmetic
exists and is tested; it is simply dormant behind the bypass, unreachable from the live product.
This is why the comparison build is *small in code and large in value*: the ranking and
similarity math already exists, and the work is to route two scored creatives through it and
surface the decomposed comparison.

---

## 7. LAW — Judgement is Reproducible

> **Law — Judgement is reproducible.** Same Evidence + Same Rules + Same Heuristics = Same
> Result. A judgement is deterministic — never random, never dependent on a model's momentary
> mood.

Applied to comparison, the law reads: **the same two creatives, with the same evidence, the same
rules, and the same heuristics, always compare the same way.** Feed the comparator Creative A and
Creative B twice and it returns the identical per-dimension table and the identical leader, every
time, on every machine — no sampling, no temperature, no wall-clock, no network, no hidden model
call.

```
compare(A, B, evidence, rules, heuristics) → table
compare(A, B, evidence, rules, heuristics) → table   // always, byte-for-byte
```

### 7.1 Why this holds by construction

Comparison is doubly deterministic. First, it only **reads** scores (§2) — it produces no new
data that could drift. Second, every primitive it would reuse is pure arithmetic: the pattern-rank
sort, the Jaccard overlap, the EMA, the confidence formula. None calls a model; none reads a
random source or the clock. If the two scores are stable, their comparison is stable, necessarily.

The comparison result *should* change only when an **input** changes — a new campaign lands in
Book D and moves a creative's Evidence Support, or a documented rule is edited. When that happens,
the shift is explainable by pointing at exactly which input moved. That is the difference between
a system that drifts and one that learns transparently.

### 7.2 Why an agency needs a reproducible comparison

- **Defensibility (revenue).** "A leads B on Evidence Support by 34 points" is a claim that
  reproduces under audit. "The AI liked A more today" is not.
- **Consistency (production time).** Re-comparing the same two variants next week does not
  silently flip the ranking. The team is not re-litigating yesterday's A/B call.
- **No mood dependence.** The comparison never depends on which way a generative model happened
  to sample. It is the same arithmetic verdict, always. This is why a comparison — like a score —
  is **never an LLM opinion**.

---

## 8. LAW — Benchmark / Comparison Integrity: same-class only

> **Law — Comparison Integrity.** Only same-class items are compared
> (Finance ↔ Finance, E-commerce ↔ E-commerce, B2B ↔ B2B; same vertical/format). Comparing
> across contexts is forbidden — it produces misleading conclusions.

This is the single most important rule of comparison, because violating it silently manufactures
false conclusions that *look* rigorous. A comparison is only meaningful when both creatives are
answering the same brief in the same context.

### 8.1 Why cross-context comparison is forbidden

Evidence Support and Confidence draw on Book D's per-context performance memory. A Finance
creative's angle is backed by Finance campaigns; an E-commerce creative's angle is backed by
E-commerce campaigns. Put them on the same scale and the numbers are **incommensurable**: a
Finance headline scoring 88 on Evidence Support and an E-commerce headline scoring 54 are not
"88 beats 54" — they are two different questions wearing the same units. Declaring the Finance
piece the "winner" would be a misleading conclusion dressed up as a measurement. The same holds
across formats: a landing-page angle and a one-line social post are not judged on the same
evidence base. **Comparison compares like with like, or it does not compare at all.**

### 8.2 "Same-class" is grounded in the vertical grouping key

In practice, "same-class" is not an abstract ideal — it must resolve to a concrete grouping key
that actually exists in the data. In AdOS that key is the **vertical** (Book D's real grouping
dimension). Book D aggregates performance **by vertical**: it exposes per-vertical baselines
(ROAS/CTR/sample size) and the pattern/evidence layer keys off the vertical. For exactly how
Book D groups performance evidence — and why vertical is the grouping reality the whole judgement
stack rests on — see
[`../../book-d/2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md`](../../book-d/2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md).

So the operational definition of "same-class" for comparison is: **A and B belong to the same
vertical** (and, where format matters, the same format). Finance ↔ Finance, E-commerce ↔
E-commerce, B2B ↔ B2B are vertical matches. This grounding keeps the integrity rule honest — it
names the real key the evidence is grouped by, rather than inventing class labels the data cannot
support.

The per-vertical baseline that would supply the comparable evidence base is itself **🔶 BUILT
(UNWIRED)**: `brain.marketing(vertical)` yields ROAS/CTR/sample size consumed by the reasoning
layer (`domains/executive-memory/src/reasoning.ts:82` for the confidence formula over that
evidence), but the live app never calls it — the same bypass as §6. Sector, agency-aggregate, and
global comparisons do **not** exist at all (❌ ROADMAP / out of scope under the no-external-data
boundary); a comparison can only stand on the agency's own, same-vertical evidence.

### 8.3 How a comparator would enforce same-class

Before computing any per-dimension delta, a comparator must first confirm A and B are same-class,
and **refuse** the comparison otherwise rather than return a misleading number. The similarity
primitive is the natural gate: Jaccard overlap over the creatives' context features
(`domains/company-brain/src/experience-engine.ts:30`) measures whether two items are alike enough
to compare, and a documented threshold turns that into an eligibility rule. A cross-vertical pair
fails the gate and is never scored head-to-head. **Refusing an invalid comparison is a feature,
not a limitation** — it is the integrity law doing its job.

---

## 9. Boundaries

Comparison lives inside AdOS's product boundaries and does not stretch them:

- **100% local, offline-first.** Comparison is arithmetic over already-computed scores, on-device.
  No cloud, no API call, no telemetry, no external benchmark feed. A comparison is computable with
  the network cable pulled.
- **Copy-only.** The creatives compared are the six copy fields (headline, adCopy, cta, socialPost,
  landingPage, email). There is no visual/video/carousel artifact to compare — comparing those is
  ❌ against the copy-only boundary, not a pending feature.
- **No new data.** Comparison reads scores and evidence; it generates no creatives and writes back
  no dataset (§2). Book E interprets; it never produces new performance data.
- **Same-class only.** Cross-vertical and cross-format comparisons are forbidden by the integrity
  law (§8); external/sector/global benchmarks do not exist and are out of scope.
- **Human-sovereign.** A comparison ranks alternatives and exposes the reasoning; it never decides,
  never auto-acts, never auto-rewrites the losing creative. It surfaces the per-dimension table and
  stops. The strategist chooses direction.

---

## 10. Value contribution

Transparent, reproducible comparison changes two numbers an agency cares about:

- **Revenue.** A per-dimension A-vs-B view is defensible in front of a client. "We recommend A:
  it leads on Evidence Support by 34 points and Confidence by 38, backed by comparable campaigns
  in your vertical — while B's copy is more specific, which is why we are lifting its phrasing
  into A" wins a pitch that "we think A is stronger" loses. A defensible A/B choice protects and
  grows the account.
- **Production time.** A reproducible, same-class comparison lets a team pick the strongest option
  **fast**, and cuts internal debate time: instead of a room arguing by taste, the eight-axis
  table shows exactly where each creative leads and by how much. Same inputs, same ranking, no
  re-litigation. Hours of opinion-trading collapse into a glance at the deltas.

Both gains are bounded by the same discipline: the comparison ranks alternatives, and a human
chooses direction — every time.

---

## 11. Summary

- Comparison is the **third station** of Book E's fixed pipeline:
  **Evidence → Score → Comparison → Optimization** (Comparison Before Optimization). It runs
  after scoring and before any suggestion.
- It works on the **multi-dimensional score** from Part 1: A and B are compared **dimension by
  dimension** — Brand Fit · Policy Fit · Clarity · Readability · Specificity · Persuasiveness ·
  Evidence Support · Confidence — so a human sees *where* and *why* one leads, not just a single
  number. Policy Fit acts as a documented gate; the Overall is only a tiebreak convenience.
- It **produces no new data** — it reads already-computed scores and evidence, and generates no
  creatives.
- It obeys **Comparison Integrity**: only **same-class** items compare, grounded in Book D's real
  grouping key, the **vertical**. Cross-context comparison is forbidden because it manufactures
  misleading conclusions.
- It is **reproducible**: the same two creatives with the same evidence, rules, and heuristics
  always compare the same way — deterministic arithmetic, never an LLM opinion.
- **Creative A-vs-B comparison is ❌ ROADMAP** today: no `CreativeSet` scores exist to compare.
  The nearest primitive is prompt-**variant** selection `selectActive`
  (🔶 `domains/prompt-registry/src/in-memory-prompt-registry.ts:79`, "highest score wins") — which
  ranks *prompt versions, not creatives*, and is unwired — plus the deterministic ranking
  (`domains/company-brain/src/pattern-library.ts:35`) and Jaccard similarity
  (`domains/company-brain/src/experience-engine.ts:30`) primitives a comparator would reuse
  (🔶 BUILT-UNWIRED, dormant behind the `LiveAIManager` bypass).

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
