# Merge & Versioning — Keeping Performance Memory Coherent as It Grows

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. What this document covers

Performance Memory is not a pile that only ever grows wider. As campaigns finish, the company
accumulates many records that describe the **same thing** — the same vertical, the same
knowledge-graph node, the same standard operating procedure, the same prior decision whose
result is now known. Left untended, those would fan out into duplicate, contradictory
fragments. **Merge** and **Version** are the two maintenance operations that keep the evidence
base coherent while it scales.

- **Merge** — combining two or more records that share a key into one aggregate, without
  losing the sample size behind either. This is how "43 campaigns say ROAS 3.1" and "500
  campaigns say ROAS 2.4" become a single, honestly-weighted fact rather than two rumors.
- **Version** — evolving the definition of a record over time (a prompt template, a
  procedure) so that a new revision does not silently corrupt the aggregate built under the
  old one. Merging only happens **within** a version; crossing versions is a replacement, not
  an average.

This document sits in Part 4 of the full pipeline:

```
Campaign → Performance Record → Pattern → Evidence → Recommendation → Human → Next Campaign
                                    ▲
                       Part 4 keeps THIS accumulated middle coherent over time
```

The sibling document [`./DECAY_AND_FRESHNESS.md`](./DECAY_AND_FRESHNESS.md) owns the *time*
axis (recency weighting, decay). This document owns the *identity* axis: how two records for
the same key become one, and how a key's definition evolves. The two intersect at exactly one
place — whether a merge should weight by recency — and that intersection is flagged as
❌ ROADMAP in §7 below.

**A merge is never an interpretation.** It combines facts (CTR, CPA, ROAS, success rate,
graph properties) into a larger-sample fact. It never produces a conclusion such as "video is
better." That is Law 1, and it is the invariant that lets every merge in this document stay
honest: the output of a merge is still evidence, never knowledge.

---

## 2. The honest tier picture (read this first)

There is exactly **one** merge running on a live path in the shipped web application today.
Everything else described here is real, tested code that no production caller reaches. We
state that up front so the rest of the document can go deep without ever implying more than is
true.

| Capability | What it merges / versions | Tier |
| --- | --- | --- |
| Knowledge-graph `upsertNode` property-merge | Node props for the same node id | **✅ SHIPPED** |
| `mergeMarketing` sample-weighted rollup | CTR / CPA / ROAS per vertical | **🔶 BUILT (UNWIRED)** |
| `mergeSop` sample-weighted rollup | Success rate per procedure, version-gated | **🔶 BUILT (UNWIRED)** |
| Decision Journal `attachOutcome` | Real result onto a prior decision entry | **🔶 BUILT (UNWIRED)** |
| Prompt Registry `publish` / `get` / `selectActive` | Prompt-template versions | **🔶 BUILT (UNWIRED)** |
| SOP `version` gate inside `mergeSop` | Prevents cross-version averaging | **🔶 BUILT (UNWIRED)** |
| Recency-weighted merge | Blend sample size with freshness | **❌ ROADMAP** |

The single ✅ live merge is the graph property-merge, which runs every time a campaign is
recorded. The sample-weighted rollup merges, the outcome attachment, and prompt versioning are
all built and unit-tested but sit behind no live caller. **Wiring them is the build** — the
mechanics exist; what is missing is a production path that invokes them. Nothing in this
document should be read as claiming otherwise.

---

## 3. Merge — combining records for the same key

### 3.1 Why merge at all

Law 3 (Sample Size) requires that every recommendation carry an evidence stamp:
`Sample Size: N campaigns · Confidence: <level> · Evidence Age: <window>`. That number `N`
only means anything if records for the same key are **combined**, not counted twice and not
overwritten. Merge is the operation that lets a hundred marketing records for the finance
vertical collapse into one `MarketingInsight` whose `sampleSize` is honestly `100` — so a
reader can trust the count, not just the average.

The design rule for every merge in AdOS is the same: **combine, preserve the sample size, and
never fabricate.** Two records that disagree do not vote one another out of existence; they
average, weighted by how much evidence each carries.

### 3.2 The live merge — knowledge-graph `upsertNode` (✅ SHIPPED)

The knowledge graph is the one store whose merge runs in production. When a campaign is
recorded, the recording action writes three graph nodes and three edges as part of its
synchronous fan-out (`apps/web/src/routes.ts:1165-1170`). Each node write goes through
`upsertNode` (`domains/company-brain/src/knowledge-graph.ts:15`), and that method performs a
**property-merge** rather than a blind overwrite (`knowledge-graph.ts:17`):

```
existing ? { ...existing, ...node, props: { ...existing.props, ...node.props } } : node
```

The semantics are precise and worth stating plainly:

- If the node id is new, it is inserted as-is.
- If the node id already exists, the incoming node's top-level fields replace the old ones,
  **and the `props` bag is shallow-merged** — old properties survive unless the new write
  supplies a key of the same name, in which case the new value wins.

This is a genuine, live, per-node merge: recording the same entity across many campaigns
accumulates its properties rather than discarding history on every write. It is the only place
in Book D where "the memory got coherent by merging" is a true statement about the running
system today. **✅ SHIPPED**, called at record time (`routes.ts:1165`).

Two honest caveats keep this from being oversold:

1. The merge is a **last-write-wins per property**, not a sample-weighted average. It keeps
   the most recent value of each property; it does not blend numeric properties by how many
   campaigns contributed. It is coherence-by-accumulation, not statistical rollup.
2. The read side of the graph — `neighbors` (`knowledge-graph.ts:25`) and `query`
   (`knowledge-graph.ts:32`) — is **🔶 UNWIRED**. The merged node data is written live but is
   not yet read back into any generation path. The merge keeps the store coherent; nothing
   downstream consumes it live yet.

### 3.3 The marketing rollup — `mergeMarketing` (🔶 BUILT-UNWIRED)

`mergeMarketing` (`domains/company-brain/src/in-memory-company-brain.ts:100`) is the
canonical **sample-weighted** merge. It combines two `MarketingInsight` records for the same
vertical into one. When there is no prior insight it returns the incoming one unchanged
(`:101`); otherwise it computes a weighted average:

```
total = prev.sampleSize + next.sampleSize
wavg(a, b) = (a * prev.sampleSize + b * next.sampleSize) / total
```

and applies it to the three numeric performance fields — `ctr`, `cpa`, `roas` (`:106-108`) —
while summing the sample sizes into `sampleSize: total` (`:109`). The qualitative winners,
`bestHook` and `bestHeadline`, are **taken from whichever record carried the larger sample**
(`:111-112`): the bigger pile of evidence keeps its named winner; a small new batch does not
overwrite it. The intent, per the code's own comment, is that long-run averages dominate
single data points.

This is exactly the behaviour Law 3 wants: a merged aggregate is honestly weighted by how much
evidence stands behind each side, and the combined `sampleSize` travels with it so the
downstream evidence stamp reads the true `N`.

**Tier: 🔶 BUILT (UNWIRED).** `mergeMarketing` runs only through
`enrich({kind: 'marketing'})` (`in-memory-company-brain.ts:71`), and **`enrich` has no
non-test caller anywhere in the application.** The recording pipeline writes to the graph,
experience, and pattern stores, but it never calls `enrich`, so this rollup never fires on a
live path. Two further honesty notes:

- The `bestHook` / `bestHeadline` fields it preserves are never populated by the live
  recording path in the first place — those result fields exist as types but are not written
  when a campaign is recorded. So even if `mergeMarketing` ran, those two branches would be
  merging empty values. The numeric wavg is the substantive part.
- The read side, `marketing(vertical)` (`in-memory-company-brain.ts:50`), is also 🔶.

### 3.4 The procedure rollup — `mergeSop` (🔶 BUILT-UNWIRED)

`mergeSop` (`in-memory-company-brain.ts:116`) applies the same sample-weighted principle to a
`SopPerformance` record — the success rate of a standard operating procedure. It weights
`successRate` by sample size and sums the counts (`:118-122`), identically in spirit to
`mergeMarketing`.

Its one distinguishing feature is a **version gate** (`:117`):

```
if (!prev || prev.version !== next.version) return next;
```

If there is no prior record, or the prior record's `version` differs from the incoming one,
`mergeSop` does **not** average — it returns the new record and drops the old aggregate. This
is the merge-side enforcement of versioning, covered in full in §5. It is what prevents the
success rate of "SOP v1" from being silently blended into the success rate of "SOP v2," which
would be a category error: they are different procedures wearing the same key.

**Tier: 🔶 BUILT (UNWIRED).** Like `mergeMarketing`, `mergeSop` runs only through
`enrich({kind: 'sop'})` (`in-memory-company-brain.ts:90`), which has no live caller. Read side
`sop(sopKey)` (`in-memory-company-brain.ts:59`) is also 🔶.

### 3.5 Attaching an outcome — Decision Journal `attachOutcome` (🔶 BUILT-UNWIRED)

Not every merge combines aggregates. A different, equally important merge combines a **prior
decision** with its **later result**. `attachOutcome`
(`domains/executive-memory/src/memory.ts:75`) takes a decision id and an outcome record, finds
the existing journal entry, and upserts the real outcome onto it (`memory.ts:78`):

```
this.journal.set(id, { ...entry, outcome });
```

This is the "close the loop" merge: a decision was recorded when it was made, carrying its
rationale; when the campaign later finishes and its true result is known, `attachOutcome`
folds that result back onto the same entry. If the id is unknown it throws rather than
inventing a new entry (`memory.ts:77`), which keeps the operation honest — it can only enrich
a decision that was genuinely made, never fabricate one.

This matters for Law 1: a decision entry becomes *evidence about what actually happened* only
once its real outcome is attached. Before that, it is an intention; after, it is a fact that a
later aggregate can weigh.

**Tier: 🔶 BUILT (UNWIRED).** The method and its guard are tested, but no live path calls
`attachOutcome`. The recording action writes fresh journal entries (`routes.ts:1118`); it does
not reach back to attach outcomes onto earlier decisions. Wiring the completion of a campaign
to `attachOutcome` on its originating decision is part of the Part 4 build.

---

## 4. What every merge holds invariant

Across all four merges above — the one live, the three unwired — the same laws hold, and
stating them is the point of this section.

**Law 1 — Merge combines facts; it never fabricates a conclusion.** `mergeMarketing` outputs a
weighted CTR, not "CTR is good." `mergeSop` outputs a success rate, not "this procedure
works." The graph merge accumulates properties, not verdicts. `attachOutcome` records what
happened, not what it means. Interpretation is the job of Part 3's Recommendation Engine and of
Book C's explanation layer — never the merge.

**Law 3 — A merged aggregate carries the summed sample size.** This is the single most
important structural property of the sample-weighted merges. Because `sampleSize: total`
(`in-memory-company-brain.ts:109`) sums the two inputs, the merged record's count is the true
number of campaigns behind it. A recommendation reading off a merged aggregate can therefore
stamp an honest `N`. Merging is what makes Law 3's evidence stamp meaningful rather than
decorative — without it, `N` would be either double-counted or reset to the latest batch.

**Sample-weighting, not simple averaging.** Neither rollup takes a naive mean of two numbers.
Each weights by the sample size behind each side, so a 5-campaign batch cannot swing a
200-campaign aggregate by more than its 5/205 share. This is deliberately conservative: it
protects the evidence base from a single lucky (or unlucky) run, exactly as Law 3 intends.

**Boundaries.** Every merge here is 100% local and in-process. No merge consults an external
benchmark, an industry average, a vendor dataset, or any network resource — the only inputs are
the company's own records. A merge is a copy-only, offline computation over memory the company
already owns. And a merge is never a recommendation: it produces a coherent fact, and a human
still decides what to do with it (human-sovereign; nothing here auto-approves anything).

---

## 5. Version — evolving memory and prompt definitions

Merging assumes the two records mean the same thing. Versioning is what makes that assumption
safe: it lets a record's *definition* change over time without corrupting the aggregate built
under the previous definition.

### 5.1 Prompt Registry versioning (🔶 BUILT-UNWIRED)

The Prompt Registry (`domains/prompt-registry/src/in-memory-prompt-registry.ts`) is the
clearest worked example of versioned memory. It stores templates keyed by name **and** integer
version.

- **`publish`** (`in-memory-prompt-registry.ts:24`) writes a template under its `key` and
  `version`, stamping it `active: true` and a `createdAt` timestamp. Publishing a new version
  does not overwrite the old one — both coexist in the per-key version map, so history is
  preserved and any prior version remains retrievable.
- **`get`** (`in-memory-prompt-registry.ts:40`) fetches a template. Given an explicit version
  it returns that exact revision; given no version it returns the **active selection** (`:52`).
- **`selectActive`** (`in-memory-prompt-registry.ts:79`) is the selection rule: **highest
  `score` wins**, and ties (or unscored templates) fall back to the **latest version**
  (`:80-83`). Version is the tiebreaker beneath score, so a newer revision is preferred only
  when the evidence has not yet spoken.

The important design property is that versioning here is **non-destructive**. A new prompt
revision is added alongside the old; the score accumulated against the old version stays
attached to the old version. This is exactly why a version boundary is the right place to stop
a merge — the two versions are separate records with separate evidence, and blending them would
mix two different definitions.

**Tier: 🔶 BUILT (UNWIRED).** The registry is not instantiated in the web application; no live
path publishes, selects, or renders a versioned prompt. The versioning machinery is real and
tested, but the production app does not construct a registry. (The `score` update it relies on,
an exponential moving average, is documented on the freshness side —
[`./DECAY_AND_FRESHNESS.md`](./DECAY_AND_FRESHNESS.md) — and is likewise 🔶.)

### 5.2 The SOP version gate (🔶 BUILT-UNWIRED)

The second, sharper form of versioning is the gate already shown in §3.4. Inside `mergeSop`
(`in-memory-company-brain.ts:117`), the very first check is whether `prev.version` equals
`next.version`. A merge only proceeds **within a single version**:

- Same version → sample-weighted average of the success rates.
- Different version → the new record replaces the aggregate; the old version's success rate is
  not carried forward.

This encodes a real maintenance principle: when a procedure is revised, its historical success
rate under the old wording is no longer evidence about the new wording. The gate refuses to let
stale evidence from a superseded version pollute the current aggregate. It is the merge and the
version rule working together — the version decides *whether* the merge is even legitimate.

**Tier: 🔶 BUILT (UNWIRED)**, inheriting `mergeSop`'s status: the gate is correct and tested,
but nothing calls `enrich({kind: 'sop'})` on a live path.

### 5.3 The general rule

Put the two together and the versioning contract for Performance Memory is:

> **Merge within a version. Replace across versions. Never blend definitions.**

Prompt templates realise this by keeping every version as a distinct scored record and
selecting among them; SOP performance realises it by gating the average on a matching version.
Both keep the evidence base honest as its *definitions*, not just its *counts*, change over
time.

---

## 6. Where merge and freshness collide — Law 4 (❌ ROADMAP)

Law 3 (Sample Size) is well served by the merges above: they are sample-weighted, so a merged
aggregate carries the summed sample size and weights each side by its evidence. That is good,
and it is real.

**Law 4 (Freshness Before Frequency) is not yet served by any merge.** Today, `mergeMarketing`
and `mergeSop` weight **by sample size only** — nowhere do they consult a timestamp. The
consequence is concrete and important to state honestly:

> A large old sample can dominate a small fresh one. `wavg` gives a 500-campaign batch from
> years ago 500/543 of the weight against a 43-campaign batch from the last 90 days — even
> when the recent batch is the one that reflects the current market.

That is precisely the failure Law 4 warns against: *more recent evidence is not automatically
worth less than a larger pile of old evidence.* The current merges, being frequency-weighted
only, can violate the law they are meant to eventually enforce.

**Adding freshness weighting to the merge is ❌ ROADMAP.** The design target is a merge whose
weight is a function of **sample size *and* recency** (and, further out, sector and campaign
similarity), so that a fresh, relevant batch is not steamrolled by a large stale one. The
timestamps needed to do this already exist on the underlying records — the data is present; the
*weighting* is not. The operational design of that recency axis belongs to the sibling document
[`./DECAY_AND_FRESHNESS.md`](./DECAY_AND_FRESHNESS.md), which owns Law 4; this document simply
flags that until that weighting lands, merge is frequency-fair but not freshness-fair.

---

## 7. Boundaries and invariant laws

Restating the guarantees that govern everything above, so no reader has to infer them:

- **Memory is evidence, not knowledge (Law 1).** Every merge produces a combined *fact*
  (a weighted metric, an accumulated property, an attached outcome). No merge and no version
  selection produces a conclusion. Interpretation lives in Part 3 and Book C, never here.
- **Raw → Aggregate → Recommendation (Law 2).** Merge is an operation *inside the aggregate
  layer*. It combines records into aggregates; it never jumps a raw record straight to a
  recommendation.
- **Every aggregate carries its sample size (Law 3).** `sampleSize: total` is the load-bearing
  line of the rollup merges; it is what makes the downstream evidence stamp truthful.
- **Freshness before frequency (Law 4).** Acknowledged as **not yet enforced by merge**
  (§6, ❌ ROADMAP). Today merges are sample-weighted only.
- **100% local, copy-only, no external data.** Every merge and version operation runs
  in-process over the company's own records. No benchmark, no vendor dataset, no telemetry, no
  network. The company's memory is merged using only the company's memory.
- **Human-sovereign.** Merging and versioning keep the evidence coherent; they never decide
  anything. A merged aggregate or a selected prompt version is input to a human, never an
  auto-applied action.

---

## 8. Value contribution

Clean merges are what let the evidence base stay **trustworthy as it scales**. Without merge, a
thousand finished campaigns would be a thousand loose fragments — impossible to stamp with an
honest sample size, easy to double-count, trivially skewed by a single lucky run. With
sample-weighted merge, that same thousand collapses into a small set of aggregates a human can
actually trust, each carrying the true `N` behind it. Versioning protects that trust over time:
a revised procedure or prompt does not silently corrupt the record built under its predecessor.

For the agency, that trustworthiness is directly what turns accumulated history into a
compounding edge. An evidence base that stays coherent as it grows lets the agency **prove** a
compounding advantage when winning and retaining accounts (revenue), and lets each new campaign
**start from a merged, honest aggregate instead of a blank page** (reduced production time). A
memory that fragments as it grows proves nothing and saves no one time — merge and versioning
are what keep the promise real as the record count climbs.

The single ✅ live merge (the graph property-merge) already keeps the recorded graph coherent
on every campaign. The remaining value is gated on wiring the 🔶 rollups, `attachOutcome`, and
prompt versioning into live paths, and on adding the ❌ freshness weighting — at which point the
merged aggregate becomes a trustworthy, recency-aware foundation the Recommendation Engine can
stand on.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
