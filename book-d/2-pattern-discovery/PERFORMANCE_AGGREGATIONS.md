# Performance Aggregations — the summarization layer

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. What "aggregation" means here

An **aggregation** is a per-dimension summary of many Performance Records. Where a Performance
Record answers "what did *this one* campaign do?", an aggregation answers "what did *all* our
campaigns in this group do, together?" It takes a pile of raw facts sharing some characteristic
— all the finance campaigns, all the campaigns on a given creative format — and collapses them
into a single compact object: a **count**, one or more **sample-weighted averages**, the
**sample size** that stands behind those averages, and a **recency window** describing how
fresh the underlying evidence is.

That is the whole job of this layer, and it is deliberately narrow. An aggregation:

- **counts** how many records fall into a group (`N` finance campaigns);
- **averages** their metrics, weighting each contribution by the sample it came from, so a
  200-campaign rollup is not overwritten by a fresh 3-campaign batch;
- **carries the sample size** forward so no downstream reader can mistake a lucky one-off for a
  trend;
- **carries a recency window** so the age of the evidence travels with the number.

A finished aggregation reads like this: *"In finance, 214 campaigns averaged a 2.1% CTR and a
3.4x ROAS."* It is a sentence made entirely of facts about the company's own history. It is
**not** *"finance should use video"* — that is a conclusion, and conclusions are forbidden
here (§9). This layer summarizes; it does not decide.

### The layer between Raw and Recommendation

Aggregation is the middle of a three-layer stack, and it only exists to sit there:

```
Part 1 — RAW              Part 2 — AGGREGATE            Part 3 — RECOMMENDATION
Performance Records   →   per-dimension summaries   →   evidence-based advice
"this campaign did X"     "N campaigns averaged X"      "based on N campaigns, consider Y"
```

Everything upstream (Part 1) files individual facts. Everything downstream (Part 3) reads a
summary and forms advice from it. This layer is the hinge: it is the only place where "many
records" becomes "one number with a count and an age attached." Remove it and there is nothing
for a recommendation to be *based on* except a raw heap of individual campaigns — which is
exactly the shortcut the next section forbids.

This layer is described, across AdOS's design, as one of its most important pieces of
intellectual property. The reason is plain: raw campaign results are scattered and
un-actionable; a competitor with the same campaigns but no aggregation layer has data and no
memory. The aggregation is what turns a scatter of outcomes into reusable, countable,
age-stamped evidence. §11 returns to why that matters commercially.

---

## 2. Law 2 — Raw → Aggregate → Recommendation

> **LAW 2 — Raw → Aggregate → Recommendation.** Three mandatory layers:
> *Campaign Records → Aggregations → Recommendations.* Never *Campaign → Recommendation*
> directly.

This document owns the middle term of that law, and it is worth stating the law's force
plainly: **the arrow from Campaign straight to Recommendation is forbidden.** A recommendation
may never be formed by looking at one campaign, or at a raw list of campaigns, and reasoning
directly to advice. It must pass through an aggregate first.

Why the aggregation step is not optional:

- **A single campaign is not evidence of anything.** One finance campaign at 5.0x ROAS is
  noise until it is counted alongside the other finance campaigns. Skipping the aggregate lets a
  single lucky result masquerade as a pattern — the precise failure Law 3 exists to prevent.
- **"Based on N campaigns" requires an N.** The Sample-Size stamp that every recommendation
  must carry (Law 3) is *produced* by aggregation. There is no `N` to cite if the count was
  never taken. Campaign → Recommendation has no place to attach a sample size, so it structurally
  cannot honor Law 3.
- **Interpretation belongs to Part 3, and only Part 3.** By forcing every recommendation
  through an aggregate, the law keeps the summarization (a neutral, deterministic roll-up) cleanly
  separated from the judgment (which group is "best," what to advise). The aggregate is
  described evidence; the recommendation is what someone decides to do about it.

So the forbidden path is `Campaign → Recommendation`. The mandatory path is
`Campaign → Performance Record → Aggregation → Recommendation`. This document is the third
arrow's precondition: without an honest aggregate, the Recommendation Engine (Part 3) has
nothing legitimate to read.

A note on scope, so the boundary with Part 3 is unmistakable: this layer **does not pick a
winner.** It was once mis-named "best performers," and the rename to *Performance
Aggregations* is the point. Selecting a "best" — the best hook, the best format, the best
audience — is an act of interpretation, and interpretation is the Recommendation Engine's job.
This layer only produces the counts and averages that a later layer can rank. If a document,
function, or deck claims this layer "chooses the best X," it has crossed the line Law 2 draws.

---

## 3. Anatomy of an aggregate

Every aggregate this layer produces — shipped, unwired, or roadmap — carries the same four
components. They are the contract of the layer.

| Component | What it is | Why it must be present |
| --- | --- | --- |
| **Count** | How many records fall in the group | It *is* the sample size; the evidence for the whole group |
| **Sample-weighted average(s)** | The group's metric means, each weighted by its source sample | A fair summary that big, established rollups are not overrun by tiny fresh batches |
| **Sample size** | The `N` behind the averages, carried on the object | So no downstream reader treats a 3-campaign average like a 300-campaign one |
| **Recency window** | The age/spread of the underlying evidence | So the *freshness* of the number travels with the number (Law 4) |

The mathematically load-bearing piece is the **sample-weighted average**. When two aggregates
are merged — an existing rollup of 200 campaigns and a new batch of 10 — the combined average is
not a naive mean of the two averages. Each side is weighted by its own sample size, so the
200-campaign history dominates proportionally and the 10-campaign batch nudges it rather than
replacing it. This is what makes an aggregate *stable*: it accumulates, it does not lurch.

The shipped implementation of exactly this weighting exists in code today, in the marketing and
SOP rollups, and §4 walks through it. What no aggregate carries today is a *freshness weight* on
top of the sample weight — §7 covers why that is the layer's most important roadmap item.

---

## 4. The aggregation code that exists — 🔶 BUILT (UNWIRED)

AdOS already contains a real, tested implementation of sample-weighted aggregation. It lives in
the **Company Brain** rollups (facade `domains/company-brain/src/in-memory-company-brain.ts:27`).
It is genuine aggregation logic — not a stub. Its tier is **🔶 BUILT (UNWIRED)** for one reason
made explicit in §5: nothing in the live application ever calls it.

### 4.1 The marketing rollup — `mergeMarketing`

The marketing rollup is the clearest worked example of this layer. Records are folded in through
`enrich({ kind: 'marketing' })` (`in-memory-company-brain.ts:71`), which routes to the
`mergeMarketing` merge. That merge:

- computes a **sample-weighted average** — `wavg` — of the group's `ctr`, `cpa`, and `roas`
  (`in-memory-company-brain.ts:100`). Each incoming batch is weighted by its own sample size, so
  the merged average is the accumulation described in §3, not a naive mean;
- keeps the **`bestHook` and `bestHeadline`** from the *larger* of the two samples being merged
  (`in-memory-company-brain.ts:111-112`) — carrying forward the descriptor that stands on more
  evidence rather than the more recent one.

The result is read back per group with `marketing(vertical)`
(`in-memory-company-brain.ts:50`) — that is, the aggregate is keyed by **vertical/sector** (§6).
Ask it "what does finance look like across our history?" and it returns the sample-weighted
CTR/CPA/ROAS for finance, with the sample size behind them.

An honesty note on `bestHook`/`bestHeadline`: the *merge* faithfully carries them, but the store
they would be read from is never populated with a hook or headline, because the recording layer
never captures one (see [`../1-campaign-recording/PERFORMANCE_RECORD.md`](../1-campaign-recording/PERFORMANCE_RECORD.md)).
So the container is real and the merge logic is real, but the value flowing through it is empty
today. The *type* is 🔶; the *captured fact* is ❌. Note also the word "best" in these two field
names: it means "from the larger sample," a mechanical tie-break inside a merge — not a
recommendation. Selecting a genuinely best hook remains Part 3's job.

### 4.2 The SOP rollup — `mergeSop`

The same shape repeats for standard-operating-procedure evidence. `enrich({ kind: 'sop' })`
(`in-memory-company-brain.ts:90`) routes to `mergeSop` (`in-memory-company-brain.ts:116`), which
sample-weights a `successRate` and is **version-gated** (`in-memory-company-brain.ts:117`): a
merge only applies within a matching version, so evidence from an older procedure version does
not silently contaminate the aggregate for a newer one. It is read back with `sop(sopKey)`
(`in-memory-company-brain.ts:59`), keyed by SOP key plus version. Tier: **🔶 BUILT (UNWIRED)**.

### 4.3 The other rollups

Two further rollups share the same `enrich` → merge → read structure, each **🔶 BUILT
(UNWIRED)**:

- **creative** — `enrich({ kind: 'creative' })` (`in-memory-company-brain.ts:78`), read with
  `creative(format)` (`in-memory-company-brain.ts:53`), keyed by **creative format**;
- **sales** — `enrich({ kind: 'sales' })` (`in-memory-company-brain.ts:86`), read with `sales()`
  (`in-memory-company-brain.ts:56`).

The Company Brain also holds `setDna`/`dna()` (`in-memory-company-brain.ts:64,44`) and
`setBrand`/`brand()` (`in-memory-company-brain.ts:67,47`) — context slots rather than
sample-weighted rollups, and both **🔶 BUILT (UNWIRED)**.

Taken together, the rollups are a **built aggregation layer**: real merge mathematics, real
sample weighting, real version gating, real per-group read-back. The machinery of Law 2's middle
term exists. What is missing is the wiring.

---

## 5. The unwired truth — `enrich` is never called live

This must be stated without softening: **`enrich` has no non-test caller anywhere in the live
application.** The aggregation layer described in §4 is built and tested, but in the running web
app it is never *populated* and never *read*. No finished campaign's Performance Record flows
into `mergeMarketing`; no recommendation path reads `marketing(vertical)`. The rollups sit at
their empty initial state for the life of the process.

Two consequences follow, and both matter for honesty:

- **The aggregates are empty, not just unread.** Because `enrich` is never called, there is no
  data inside the marketing, creative, sales, or SOP rollups to read even if something tried to
  read them. The layer is not "built and idle"; it is "built and unfed."
- **The recording layer writes elsewhere.** When a campaign finishes, its facts are fanned out
  to the journal, executive memory, experience store, pattern library, and knowledge graph — a
  live path. But **none of those writes reach the `enrich` rollups.** The write side and the
  aggregation side are not connected. This is why the layer is 🔶 and not ✅: the code exists,
  the tests pass, and no live path reaches it.

**Wiring this layer is the core Book D build.** The single highest-leverage change this book
describes is connecting the recording fan-out to `enrich`, so that every finished campaign
updates the sample-weighted rollups, and connecting a read path so the Recommendation Engine
(Part 3) consults `marketing(vertical)` and its siblings. Until that connection exists, Law 2's
middle term is a specification with a working reference implementation and no traffic.

Nothing in this section is a claim of breakage. The rollups do exactly what their tests say. The
honest tier is simply **🔶 BUILT (UNWIRED)**: a real aggregation engine that the live app has not
yet been pointed at.

---

## 6. The grouping-key reality — be honest about what can be aggregated

An aggregation can only be computed along a dimension the records are actually **keyed by**. You
cannot summarize "by hook" if no record carries a hook as a grouping key. So the reach of this
layer is bounded, exactly and unforgivingly, by the grouping keys that exist in code. Here is the
complete, honest inventory.

### 6.1 The keys that exist

- **Vertical / sector — the one real grouping key.** It is the spine of the layer. It appears as
  the key on marketing aggregates read via `marketing(vertical)`
  (`in-memory-company-brain.ts:50`); as the hard filter on the experience store's `findSimilar`
  (`domains/company-brain/src/experience-engine.ts:30`); and as `Pattern.domain` in the pattern
  library. Wherever aggregation is possible today, it is possible *by vertical*.
- **Creative format** — a real key, but on a 🔶 unwired store: `creative(format)`
  (`in-memory-company-brain.ts:53`).
- **SOP key (+ version)** — a real key, likewise on a 🔶 unwired store: `sop(sopKey)`
  (`in-memory-company-brain.ts:59`), with the version gate at `in-memory-company-brain.ts:117`.

### 6.2 The keys that do NOT exist

There is **❌ no grouping key** for any of the following, so aggregating along them is not
computable today at any tier:

| Desired grouping | Status | Why it cannot be aggregated today |
| --- | --- | --- |
| **Audience** | ❌ no key | Never captured as a keyed field |
| **Offer** | ❌ no key | Never captured as a keyed field |
| **Hook** | ❌ no key | Referenced only as a carried value in a merge, never a key |
| **Day of week** | ❌ no key | Timestamps exist, but there is no time bucketing |
| **Hour of day** | ❌ no key | Timestamps exist, but there is no time bucketing |
| **Season** | ❌ no key | Never captured as a keyed field |
| **Campaign type** | ❌ no key | Never captured as a keyed field |
| **Platform / channel** | ❌ no key | Stored only as free-text strings, never a structured key |

The practical meaning is blunt: **"aggregate by hook," "aggregate by day-of-week," or "aggregate
by audience" cannot be computed today** — not because the merge math is missing (§4 proves it is
present), but because the records were never filed with a key to group on. The bottleneck is
upstream. Aggregation is downstream of recording, and it can only ever summarize along dimensions
the Performance Record actually carries.

This is why the honest reach of the layer today is: **sample-weighted rollups by vertical
(readable path but unfed), plus creative-format and SOP-key rollups on unwired stores.**
Everything richer waits on a richer record.

---

## 7. Law 4 — freshness before frequency (and what is missing)

> **LAW 4 — Freshness Before Frequency.** More recent evidence is not automatically worth less
> than a larger pile of old evidence.

Law 4 is the aggregation layer's sharpest design tension, because today's merge honors only half
of it. The canonical example: **`2019: 500 campaigns` versus `Last 90 days: 43 campaigns`.** Raw
frequency says the 500 win. Law 4 says the 43 recent campaigns may matter more, because the market
they describe is the one the company is actually operating in now.

Here is the honest state of the layer against that law:

- **What the merge does today (🔶):** the `wavg` in `mergeMarketing`
  (`in-memory-company-brain.ts:100`) and the weighted `successRate` in `mergeSop` are weighted by
  **sample size only.** A bigger pile pulls the average harder — full stop. By that rule alone,
  the 500 stale 2019 campaigns would dominate the 43 recent ones. That is exactly the outcome Law
  4 warns against.
- **What is missing (❌ ROADMAP):** a **recency weight** applied *on top of* the sample weight, so
  that a recent aggregate can outweigh a larger but stale one. The timestamps needed to compute
  such a weight are already stored — `Experience.at`
  (`domains/company-brain/src/experience-engine.ts:19`),
  `ExecutiveMemoryEntry.createdAt` (`domains/executive-memory/src/memory.ts:21`), and the
  recording action's `at` (`apps/web/src/routes.ts:1116`) — and the journal already sorts its
  history by `at` descending (`domains/executive-memory/src/memory.ts:71`). So the *data* for a
  recency window exists (✅). What does not exist is a merge that *scores by it*: the current
  aggregation reads no timestamp when weighting. Freshness weighting is **❌ to add**.

So the aggregate carries a recency window (§3) as a design commitment, but the shipped/unwired
merge does not yet *use* recency to weight. Making the merge freshness-aware — rank by **sample
size + recency**, never raw frequency alone — is the roadmap work that turns Law 4 from a
principle into a computation. The full operational treatment of decay and recency scoring belongs
to Part 4 (memory maintenance); this layer's obligation is to accept a freshness weight into the
merge once one exists.

---

## 8. Law 3 — sample size is native to every aggregate

> **LAW 3 — Sample Size Rule.** Every recommendation must carry an evidence stamp:
> *Sample Size: N campaigns · Confidence: <level> · Evidence Age: <window>.*

Law 3 is not bolted onto this layer — it is *produced* by it. The count an aggregation takes **is**
the sample size. Every rollup that §4 describes carries its `N` on the object, and that `N` is the
raw material of the Sample-Size stamp that Part 3 must attach to every recommendation.

The discipline this enforces:

- **A small sample is a weak aggregate.** An aggregate over 3 campaigns and an aggregate over 300
  are not interchangeable, and the layer must never let them look interchangeable. Carrying the
  count is what keeps a 3-campaign average honest — it travels with the warning built in.
- **The stamp cannot be reconstructed later.** If the aggregation does not carry the count, no
  downstream layer can invent it. Law 3 is only satisfiable because this layer counts as it
  summarizes. This is the structural reason Law 2 forbids `Campaign → Recommendation`: that
  shortcut skips the counting, and a recommendation with no count cannot honor Law 3.

The related pattern-library rank (a sibling of this layer, detailed in the Pattern Library
document) already encodes the same instinct in code: its rank formula is
`evidence.value * min(1, sampleSize / 100) + reuseCount * 0.1`
(`domains/company-brain/src/pattern-library.ts:35`, 🔶). The `min(1, sampleSize / 100)` term is
Law 3 made arithmetic — evidence below 100 samples is discounted proportionally, and only a
sample of 100+ earns full weight. That is the same conviction this layer enforces by carrying its
count: sample size gates trust.

---

## 9. Law 1 — an aggregate is still evidence, not knowledge

> **LAW 1 — Memory is Evidence, not Knowledge.** Performance Memory stores facts, not
> conclusions.

It would be easy to assume that once you aggregate, you have earned the right to conclude. You
have not. An aggregation is still, strictly, **descriptive evidence.** *"In finance, 214 campaigns
averaged a 2.1% CTR"* is a fact about the company's own history — a bigger fact than a single
record, but a fact nonetheless. It describes what happened; it does not prescribe what to do.

The line the layer must never cross:

- **Allowed (fact):** *"In finance, N campaigns averaged X% CTR and Y ROAS, over this recency
  window."* Descriptive. Countable. Age-stamped.
- **Forbidden (conclusion):** *"Finance should use video,"* *"video is always better,"*
  *"scarcity hooks win."* Prescriptive. These are interpretations, and they are produced *later* —
  by the Recommendation Engine (Part 3) or the explanation side — never asserted by the aggregate
  itself.

This is the same law that governs the raw record, holding one layer up. The record holds one
fact; the aggregate holds a summary of many facts; **neither holds a verdict.** The moment an
aggregate is phrased as advice, it has stopped being memory and started being a recommendation —
and recommendations live in Part 3, carrying a sample-size stamp, subject to a human's final
call. An aggregate that says "should" is a corrupt aggregate.

---

## 10. Boundaries and invariants

The aggregation layer inherits Book D's invariants without exception. They constrain what an
aggregate may ever contain and how it may ever be computed.

- **Own-data only.** Every aggregate is computed exclusively from *this company's* finished
  campaigns. "In finance, 214 campaigns averaged 2.1% CTR" means *our* 214 finance campaigns.
  There is no industry-average row, no peer comparison, no third-party figure — because none is
  ever fetched.
- **No external benchmarks.** An aggregate never carries a "vs. industry" or "vs. competitor"
  number. All comparison is internal: this group of the company's campaigns against another group
  of the company's campaigns. The layer has no concept of an outside baseline.
- **100% local, offline-first.** The rollups are in-memory structures computed on the company's
  own infrastructure. No cloud service, external API, telemetry pipeline, or connector
  participates in producing or reading an aggregate. Unplug the network and aggregation still
  works — it just has nothing external to reach for, by design.
- **Copy-only, human-sovereign.** The aggregation layer summarizes; it never launches, never
  spends, and never approves. It hands a summary to a human-facing recommendation; it takes no
  action of its own.
- **Descriptive, never prescriptive (Law 1).** Restated as an invariant because it is one: an
  aggregate is a described count of facts, never a verdict.

A further honesty invariant specific to this layer: **an unfed aggregate is an empty aggregate.**
Because the live app never calls `enrich` (§5), the rollups hold no data in production. Any claim
that "the company's aggregated finance performance shows X" is, today, a claim about an empty
structure. The invariant is that the layer never *pretends* to a sample size it has not
accumulated — which is precisely why wiring `enrich` is the build that makes this layer real.

---

## 11. Value contribution

Aggregation is where scattered results become a reusable asset — and it is, by design, one of
AdOS's core pieces of intellectual property for a concrete commercial reason.

- **Revenue — win and retain accounts by proving a compounding edge.** A pile of raw campaign
  outcomes proves nothing to a prospect; a summary does. The sentence *"across our own 214 finance
  campaigns, here is what performs"* is a claim no blank-slate competitor can make, and it is
  manufactured entirely by this layer — the count, the sample-weighted average, the recency
  window are the proof. An agency with the same campaigns but no aggregation layer has data and no
  memory, and cannot make the claim. The aggregation *is* the compounding edge made legible.
- **Production time — start from evidence, not a blank page.** A new campaign that begins by
  reading the aggregate for its vertical skips the guesswork. The rediscovery cost — re-learning
  each quarter what past campaigns already demonstrated — is paid once, at aggregation time,
  instead of repeatedly at planning time. The scattered results are collapsed into a summary a
  planner can consult in seconds.

The layer does not *deliver* either outcome on its own — the recommendation and attribution
layers turn a summary into advice and a pitch. But those layers have nothing to work with until
this one has summarized. Aggregation is the IP that converts a heap of finished campaigns into
countable, attributable, reusable evidence — which is exactly why wiring it (§5) is the pivotal
build of this book.

---

## 12. Summary — the aggregation layer in one page

- An **aggregation** turns many Performance Records into a per-dimension summary: a **count**, one
  or more **sample-weighted averages**, the **sample size** behind them, and a **recency window**.
- It is **Law 2's middle term**: `Campaign Records → Aggregations → Recommendations`. The shortcut
  `Campaign → Recommendation` is **forbidden** — a recommendation must pass through an aggregate,
  because that is the only place a sample size is produced.
- It **does not pick "best."** Selecting a winner is interpretation, and interpretation is the
  Recommendation Engine's job (Part 3). This layer summarizes; it does not decide. The rename from
  "best performers" to *Performance Aggregations* is that boundary.
- **Built, unwired (🔶):** real sample-weighted merges exist — `mergeMarketing` (`wavg` of
  CTR/CPA/ROAS at `in-memory-company-brain.ts:100`; keeps `bestHook`/`bestHeadline` from the larger
  sample at `:111-112`), `mergeSop` (version-gated at `:117`), plus creative and sales rollups —
  fed by `enrich` (`:71`) and read via `marketing(vertical)` (`:50`) and siblings.
- **The critical honesty:** `enrich` has **no live caller**. The aggregation engine is built and
  tested but never populated or read in the running app. **Wiring it is the core Book D build.**
- **Law 3 is native:** every aggregate carries its sample size; a small sample is a weak
  aggregate.
- **Law 4 is half-done:** the merge is **sample-weighted only**; a **recency weight** so a fresh
  aggregate can outweigh a larger stale one is **❌ to add** (the timestamps to compute it are
  already stored).
- **Grouping-key reality:** the only real grouping key is **vertical/sector**; creative-format and
  SOP-key exist on unwired stores; there is **❌ no key** for audience, offer, hook, day, hour,
  season, or campaign-type — so those aggregations cannot be computed until the richer Performance
  Record ([`../1-campaign-recording/PERFORMANCE_RECORD.md`](../1-campaign-recording/PERFORMANCE_RECORD.md))
  supplies the keys.
- **Law 1 holds:** an aggregate is descriptive evidence ("N campaigns averaged X"), never a
  conclusion ("finance should use video").
- **Boundaries:** own-data only, no external benchmarks, 100% local, copy-only, human-sovereign —
  and an unfed aggregate is an empty one.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
