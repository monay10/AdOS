# The Recommendation Engine — interpreting the aggregate

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. What a recommendation is here

A **recommendation** is the third and final layer of Performance Memory. Where the recording
layer stores raw facts and the aggregation layer collapses those facts into per-group summaries,
the recommendation layer does one thing the layers beneath it are forbidden to do: it **reads
the aggregate and interprets it into a concrete suggestion.**

Concretely, a recommendation reads a set of aggregations — the finance rollup, the format
rollup, the similar-campaign set — and turns them into a sentence a planner can act on:

> *"For a finance client, the evidence points to a short-form video, roughly 15 seconds, in a
> UGC style, leaning on a cool blue tone."*
>
> Compressed: **Finance → Video → 15s → UGC → blue tone.**

That single arrow-chain is the deliverable of this book's third part. It is where the word
**"best"** is finally allowed to be spoken. The aggregation layer (documented in
[`../2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md`](../2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md))
deliberately refuses to pick a winner — it only reports *"in finance, 214 campaigns averaged a
3.4x ROAS."* The recommendation layer is the place that reads those numbers, compares them, and
says *"therefore, prefer video."* **D005 aggregates; D006 interprets and selects.**

Two properties make this a recommendation rather than an opinion:

- It is **built entirely from stored facts.** Nothing is invented; every element of the chain
  traces back to a number that many recorded campaigns actually produced.
- It **carries its evidence stamp.** A recommendation is never emitted bare. It always arrives
  with the sample size, confidence, and evidence age that stand behind it (§7). A suggestion
  without its evidence stamp is not a recommendation — it is a guess, and this layer does not
  emit guesses.

### The division of labour, in one line

> **The aggregation layer summarizes. The recommendation layer decides. The human approves.**

Each layer has exactly one job, and none reaches past its own boundary. That separation is what
lets a recommendation stay honest: because the facts were frozen one layer down, the
interpretation here can be argued with, re-ranked, or overridden without ever corrupting the
underlying evidence.

---

## 2. The Raw → Aggregate → Recommendation law (hard rule)

The single most important rule in this part is a rule about **what a recommendation is allowed
to stand on.**

> **A recommendation MUST be built on an aggregate. NEVER on one campaign.**

There are three mandatory layers, and they run in strict order:

```
Campaign Records  →  Aggregations  →  Recommendation
   (raw facts)        (summaries)      (interpretation)
```

The forbidden path is `Campaign → Recommendation` — reading a single finished campaign and
suggesting the next one imitate it. That path is banned without exception, and the reason is not
stylistic. A single campaign is an anecdote. It might have won because of its creative, or
because of a holiday, a lucky audience, a competitor's outage, or pure variance. Promoting one
result straight into advice is exactly how an organization mistakes a coincidence for a rule.

The aggregate is the firewall against that mistake. By the time evidence reaches this layer it
has already been pooled across many records, sample-weighted, and stamped with a count. The
recommendation layer is therefore *structurally incapable* of over-fitting to a single campaign,
because a single campaign never reaches it directly — it only ever arrives as one contribution
inside an aggregate of size `N`.

This is **Law 2** made operational. The aggregation layer is described elsewhere as one of the
most important pieces of the platform's intellectual property; the reason it matters *here* is
that it is the only legal input to a recommendation. If an aggregate for some dimension does not
exist, then a recommendation along that dimension cannot be formed — full stop. The engine does
not fall back to reading raw campaigns; it declines.

---

## 3. Law 1 — a recommendation is interpretation layered on top of evidence

Performance Memory stores **facts, not conclusions.** `CTR`, `ROAS`, sample size, evidence age —
these are real, recorded, descriptive. *"Video is always better"* is **not** a fact and is never
stored as one; it is an interpretation, produced here, at the top of the stack.

The recommendation layer is exactly that interpretation layer, and it must wear the label
plainly:

- **The evidence stays factual.** The aggregate says *"finance video: 3.4x ROAS across 214
  campaigns."* That statement is descriptive and remains untouched. The recommendation never
  edits it, never rounds it into a slogan, never launders a number into a certainty.
- **The interpretation is clearly marked as interpretation.** *"Therefore prefer video"* is a
  reading of the evidence, and it is presented as advice, not as a discovered law of the market.
  The distinction is visible in the output: the fact and the suggestion are two separate things,
  and the suggestion is always the advisory one.
- **It is advisory, never binding.** The engine proposes; it does not decide the campaign. A
  human reads both the fact and the interpretation and chooses (§9).

Keeping these two registers distinct is the whole discipline of this part. When the fact and the
interpretation blur together, you get "the AI knows video is best" — a claim the platform must
never make. When they stay distinct, you get "*based on the results of 214 campaigns*, the
evidence leans toward video" — which is all that can honestly be said, and all this layer says.

---

## 4. The grounding code (🔶 BUILT — UNWIRED)

A real, tested skeleton for this layer exists in the codebase. It is **built but unwired**: the
code and its tests are present, but no live path in the running web app reaches it. Every claim
below is tagged accordingly, and nothing here is presented as shipped.

The live application runs `OfflineAIManager` / `LiveAIManager`. It does **not** run the runtime
pipeline that would consume the components below; that pipeline (`AIRuntimeManager`) is never
instantiated in production. So the machinery in this section is a specification of *how a
recommendation would be assembled from the aggregate* — grounded in code that exists — rather
than a description of something a user can trigger today.

### 4.1 Gathering evidence — `BrainEvidenceEngine.gather` (🔶)

`BrainEvidenceEngine.gather` (`domains/executive-memory/src/reasoning.ts:14`) is the component
that reads the aggregate. It pulls from three stores and folds them into a single weighted list:

- **`brain.marketing`** — the sector rollup, read via `marketing(vertical)`
  (`domains/company-brain/src/in-memory-company-brain.ts:50`): the sample-weighted CTR / CPA /
  ROAS averages for a vertical.
- **`patterns.bestFor`** (`domains/company-brain/src/pattern-library.ts:18`) — the ranked
  patterns for a group, ordered by the library's `rank` formula
  (`pattern-library.ts:35`): `evidence.value * min(1, sampleSize / 100) + reuseCount * 0.1`.
  Note that the ranking already **discounts small samples** (the `min(1, sampleSize/100)` term)
  — Law 3 is baked into the arithmetic, not bolted on afterward.
- **`experience.findSimilar`** (`domains/company-brain/src/experience-engine.ts:22`) — prior
  campaigns resembling the one being planned, behind a hard `vertical` filter
  (`experience-engine.ts:30`) so evidence from an unrelated sector cannot leak in.

The output is a weighted `EvidenceRef[]` — a bundle of references to real aggregated facts, each
carrying the weight it earned. This is the raw material of a recommendation: not a conclusion
yet, just the assembled, sample-aware evidence the interpretation will be read off of.

### 4.2 Scoring confidence — `HeuristicConfidenceEngine.assess` (🔶)

`HeuristicConfidenceEngine.assess` (`domains/executive-memory/src/reasoning.ts:62`) takes that
evidence bundle and scores how much trust it deserves. Its verdict becomes the **Confidence**
field of the evidence stamp (§7). Confidence here is a heuristic read of the evidence's weight
and consistency — deterministic, inspectable, and derived only from stored numbers. It is not a
model's self-reported certainty; it is a function of how much evidence there is and how well it
agrees.

### 4.3 Assembling the context — `ExecutiveContextBuilder.build` (🔶)

`ExecutiveContextBuilder.build` (`domains/executive-memory/src/context-builder.ts:37`) is the
component that assembles everything into one structure a recommendation can be phrased from. It
composes Prompt → Mission → Brain → executive-memory recall → Decisions → Experience into a
single context object.

Its status is the crux of this section's honesty: the builder is **consumed only by**
`AIRuntimeManager` (`packages/ai-manager/src/runtime/manager.ts`), which is **never instantiated
in production.** The assembled context therefore never reaches a live recommendation. The
skeleton is real; the wire to the running app is absent. 🔶 **BUILT — UNWIRED.**

### 4.4 What this adds up to

`gather` → `assess` → `build` is a complete, tested *description* of forming a single-dimension,
evidence-based recommendation from the aggregate — sector rollup in, weighted evidence out,
confidence scored, context assembled. What it is missing is the last mile: a live path that
invokes it on a real planning request. Until that wire exists, the recommendation layer is a
specification with a working skeleton behind it, not a feature in the product.

---

## 5. The composite "best combination" — ❌ ROADMAP

The headline example — **Finance → Video → 15s → UGC → blue tone** — is a *composite*
recommendation. It selects a best value across several independent dimensions at once: a hook
**and** a format **and** a length **and** a tone, all coherent, all evidence-backed, all for the
same brief.

**No engine composes a recommendation across dimensions today. This is ❌ ROADMAP.**

There is no code citation for it, because there is no code. Two things are missing, and the
second is the deeper one:

1. **No cross-dimension composer exists.** The built skeleton (§4) forms a *single* evidence
   bundle for a vertical; nothing joins a format verdict to a length verdict to a tone verdict
   and checks they cohere. Composing across dimensions — and reconciling the tension when the
   best format and the best length were rarely used together — is unbuilt.
2. **The grouping keys for most of those dimensions do not exist.** A recommendation along a
   dimension requires an aggregate along that dimension, and an aggregate requires a grouping
   key. Today the only real grouping key is **vertical / sector**. There is **no** grouping key
   for platform / channel, campaign type, audience, offer, hook, day, hour, or season — those
   attributes are either stored only as free text or not recorded at all. The grouping-key
   reality is documented in full in
   [`../2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md`](../2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md).

So of the five arrows in **Finance → Video → 15s → UGC → blue tone**, only the first —
*Finance* — corresponds to an aggregate that can exist today. *Video*, *15s*, *UGC*, and *blue
tone* have no grouping key to aggregate over, and therefore no aggregate to recommend from, and
therefore (by the hard rule in §2) no legal way to be recommended at all. The composite is a
target for the platform to grow into, not a claim about what it does. Reality first, then the
headline.

---

## 6. The boundary with Book C — D forms, C explains, the human decides

This is the most important boundary in the book to get right, because the two sides look similar
and are not the same.

> **Book C EXPLAINS a recommendation that already exists (the *why*).
> Book D Part 3 FORMS the recommendation from aggregated history (the *what*).**

Read in sequence:

- **Book D (this part) forms.** It reads the aggregate and produces the suggestion:
  *"the evidence leans toward video."* This is a construction step — it did not exist before, and
  now it does, built from pooled facts.
- **Book C explains.** Given a recommendation, it answers *"why was this recommended?"* — surfacing
  the evidence, the confidence, and the decision trail behind it. Book C already documents that
  explanation mechanic in
  [`../../book-c/1-why-contract/EVIDENCE_ENGINE.md`](../../book-c/1-why-contract/EVIDENCE_ENGINE.md),
  and this document does **not** re-document it. If you want to know how an existing suggestion
  is justified to a user, that is Book C's contract, and the reference above is the pointer to it.

The same underlying components appear in both books, which is why the boundary must be drawn by
*role*, not by code. `BrainEvidenceEngine` and `HeuristicConfidenceEngine` are read by Book C as
**explanation** — the material that justifies a decision after the fact. Here in Book D they are
read as **formation** — the material a decision is built out of in the first place. Same stones,
two different walls.

Put the whole loop together and the responsibilities are clean:

> **Book D forms the recommendation. Book C explains it. The human decides.**

None of the three collapses into the others. The formation stays honest because it is built on
aggregates; the explanation stays honest because it points back at the same facts; the decision
stays sovereign because a person makes it (§9).

---

## 7. Law 3 — the mandatory evidence stamp (the required output shape)

Every recommendation this layer emits **MUST** carry an evidence stamp. This is not decoration
and it is not optional; it is the layer's contract, the analogue of Book C's explainability
contract. A recommendation without its stamp is malformed and must not be shown.

The required shape:

```
Recommendation:  <the interpreted suggestion>
Evidence stamp:  Sample Size: N campaigns · Confidence: <level> · Evidence Age: <window>
```

Worked example:

```
Recommendation:  For a finance client, prefer short-form video (~15s).
Evidence stamp:  Sample Size: 214 campaigns · Confidence: High · Evidence Age: last 18 months
```

Each field earns its place:

- **Sample Size: N campaigns** — how many records stand behind the suggestion, so a single lucky
  campaign can never be mistaken for a generalization. This number comes straight from the
  aggregate; the recommendation cannot invent it.
- **Confidence: `<level>`** — the heuristic trust score from
  `HeuristicConfidenceEngine.assess` (`reasoning.ts:62`, §4.2), derived from the weight and
  agreement of the evidence.
- **Evidence Age: `<window>`** — the recency window of the underlying records, so the reader
  knows whether the advice rests on last quarter or on the last decade.

The stamp is what makes a recommendation falsifiable and reviewable. *"Prefer video"* alone is a
slogan. *"Prefer video — 214 campaigns, high confidence, last 18 months"* is a claim a human can
weigh, challenge, or reject on its own terms. This layer only ever emits the second form.

---

## 8. Law 4 — freshness before frequency

When more than one option could be recommended, the engine must **rank** them, and the ranking
rule is fixed:

> Rank by **sample size + recency + sector similarity + campaign similarity** — **never by raw
> frequency alone.**

Raw frequency — "this appeared the most times, so recommend it" — is explicitly rejected. A pile
of 500 campaigns from 2019 is not automatically worth more than 43 campaigns from the last 90
days; often the fresher, smaller, more-similar evidence is the better guide to the next campaign.
Selection therefore weighs four things together:

- **Sample size** — more evidence is more trustworthy (and small samples are already discounted
  inside `patterns.rank`'s `min(1, sampleSize/100)` term, §4.1).
- **Recency** — recent evidence can outweigh a larger pile of stale evidence.
- **Sector similarity** — evidence from the same vertical counts for more. This is enforced
  concretely by the hard `vertical` filter in `experience.findSimilar`
  (`experience-engine.ts:30`, §4.1), which keeps unrelated sectors out of the pool entirely.
- **Campaign similarity** — evidence from campaigns resembling the one being planned is weighted
  up, via `experience.findSimilar` (`experience-engine.ts:22`).

A caveat, kept honest: of these four, sector and campaign similarity have a concrete mechanism in
the built skeleton (the vertical filter and `findSimilar`), while **recency scoring is ❌
ROADMAP**. Timestamps are recorded — the data exists — but the retrieval paths do not yet rank on
them. So Law 4 is stated here as the governing rule this layer answers to; its recency term is a
target, not a shipped behavior. The full mechanics of freshness live in
[`../4-memory-maintenance/DECAY_AND_FRESHNESS.md`](../4-memory-maintenance/DECAY_AND_FRESHNESS.md).

---

## 9. No new AI · human-sovereign · never auto-applies

The recommendation layer creates **no new AI.** Every element of a recommendation is *assembled*
from aggregated facts — read out of stores, weighted, ranked, and stamped. There is no model
here inventing which format is best; the "best" falls out of the arithmetic on the company's own
records. A local model may only **phrase** a recommendation it has already been handed — turning
*"finance / video / 3.4x / N=214"* into a readable sentence — exactly as the platform's phrasing
rule permits. It never invents a fact, never manufactures a conclusion, never adds a number that
was not in the evidence.

And the layer **never applies its own advice.** A recommendation is advisory, full stop:

- It is **proposed, not executed.** Forming a suggestion does not start a campaign, edit a brief,
  or change any store.
- It is **human-sovereign.** A person reads the recommendation *and* its evidence stamp *and*, if
  they wish, Book C's explanation of it — and then decides. The engine has no authority to
  approve anything.
- It **never auto-applies.** There is no path by which a recommendation silently becomes the next
  campaign. The hand-off to the human, and from the human to the next brief, is the subject of
  [`RECOMMENDATION_TO_NEXT_CAMPAIGN.md`](RECOMMENDATION_TO_NEXT_CAMPAIGN.md).

This is what keeps the layer safe to build aggressively: because it can only ever *suggest*, a
wrong suggestion costs a rejected recommendation, never a mis-run campaign.

---

## 10. Boundaries and invariant laws

The recommendation layer inherits every boundary of Performance Memory:

- **100% local, offline-first.** Recommendations are formed on the company's own machine from the
  company's own history. No cloud, no API, no telemetry, no connectors.
- **Own data only — no external benchmarks.** "Best" always means best *within this
  organization's recorded evidence*, never against an outside dataset or an industry average.
- **Copy-only, human-sovereign.** The engine proposes; the human disposes. Nothing is
  auto-approved or auto-applied (§9).
- **Evidence over conclusions (Law 1).** The stored facts stay factual; the interpretation is
  labeled as advisory (§3).
- **Aggregate-grounded (Law 2).** A recommendation stands on an aggregate, never on a single
  campaign (§2).
- **Sample-stamped (Law 3).** Every output carries `Sample Size · Confidence · Evidence Age`
  (§7).
- **Freshness before frequency (Law 4).** Ranking weighs sample size, recency, and similarity —
  not raw counts (§8).

Honest status summary, so nothing reads as more finished than it is:

| Capability | Status |
| --- | --- |
| Evidence gathering from the aggregate (`gather`, `reasoning.ts:14`) | 🔶 BUILT — UNWIRED |
| Confidence scoring (`assess`, `reasoning.ts:62`) | 🔶 BUILT — UNWIRED |
| Context assembly (`build`, `context-builder.ts:37`) | 🔶 BUILT — UNWIRED |
| Pattern ranking input (`bestFor` / `rank`, `pattern-library.ts:18,35`) | 🔶 BUILT — UNWIRED |
| Similar-campaign retrieval (`findSimilar`, `experience-engine.ts:22`) | 🔶 BUILT — UNWIRED |
| Composite multi-dimension recommendation | ❌ ROADMAP |
| Recency scoring in the ranking | ❌ ROADMAP |

The one thing that reaches the live app in this neighborhood is a **display-only** read:
`journal.history` on the mission-detail screen (`apps/web/src/routes.ts:832`), which shows a
mission's own recorded trail and is **not** fed into any recommendation. Everything that would
*form* a recommendation is 🔶 or ❌.

---

## 11. Value contribution

A recommendation layer that reads the company's own aggregated history changes the economics of
starting a campaign, on both sides of the ledger.

- **It grows agency revenue.** An agency that can say *"based on 214 of your comparable
  campaigns, the evidence points to short-form video"* — with the sample size, confidence, and
  evidence age attached — is selling a compounding, defensible edge. That is a pitch a competitor
  starting from a blank page cannot match, and it is what wins and retains accounts.
- **It cuts production time.** Every campaign that begins from an evidence-backed direction
  instead of a blank brief skips a round of guessing. The recommendation is a warm start: a
  concrete, defensible first draft of the plan, drawn from what already worked.

The engine never removes the human from that decision — it removes the blank page. The person
still chooses; they just choose from evidence instead of from scratch. That is the whole return
of this layer, and it compounds with every campaign the organization records.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
