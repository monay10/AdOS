# The Pattern Library

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. What the Pattern Library IS

The **Pattern Library** is the first aggregation surface of AdOS's Performance Memory. Where a
Performance Record captures a single finished campaign as one immutable fact, a **Pattern**
captures the recurring *structure* that many such campaigns shared: an ordered recipe — for
example, `["15s video", "first 3s food", "CTA reservation"]` for restaurant clients — together
with the evidence that this structure produced results and a count of how often it has proven
out since.

A Pattern is therefore not a new observation. It is a **summary of observations** — an
aggregate. It sits in the middle layer of the mandatory pipeline: raw Performance Records feed
into it, and the recommendation layer reads out of it. This document describes that middle
layer as it exists in the code today, tier by tier, and describes the design that closes the
gap between what is captured and what is consulted.

Two truths govern everything below and must be stated at the outset:

1. **A Pattern is an aggregate, and an aggregate is still descriptive.** It records *"this
   structure appeared across N campaigns and averaged this metric value,"* never *"always use
   video."* The interpretive leap to "best" belongs to a later layer, not here.
2. **The library is written on every completed campaign but never read back into a live path.**
   It grows with every recording, yet no shipped code consults it. The store fills; the shelf
   is never browsed. That honesty frames the whole tier picture in §4.

> **The AI never learns. The COMPANY accumulates memory.** A captured Pattern is the company
> noticing that a shape recurred — not the AI claiming a lesson. The library never says "I
> learned"; it makes it possible for a later layer to say *"Based on the results of the last N
> campaigns in this sector…"*.

---

## 2. Where the Pattern Library sits in the pipeline

The full pipeline of Performance Memory runs:

```
Campaign → Performance Record → Pattern → Evidence → Recommendation → Human → Next Campaign
```

The Pattern Library owns the **Record → Pattern** step and hands off at **Pattern → Evidence**.
It is one node in the three mandatory layers of Law 2:

```
Campaign Records   →   Aggregations   →   Recommendations
   (Part 1, Raw)        (Part 2, THIS)        (Part 3)
```

The Pattern Library is a Part-2 aggregation surface. It never talks to a campaign directly to
produce advice, and it never emits a recommendation. It receives already-recorded facts, folds
them into a reusable shape, and holds them for a reader that has not yet been wired. The rule of
Law 2 — **never `Campaign → Recommendation` directly** — is enforced structurally here: the
Pattern Library is the layer that stands between them, and it produces aggregates, not verdicts.

This is the aggregation layer that the constitution calls one of AdOS's most important pieces of
intellectual property. The Pattern Library is one concrete instance of it: a store whose job is
to compress campaign history into reusable structure without ever crossing into interpretation.

---

## 3. The Pattern shape

A Pattern is a small, strict object. Its type is defined once and shared across the codebase:

```ts
interface Pattern {
  id: string;
  domain: string;        // vertical — the ONLY grouping dimension
  name: string;
  structure: string[];   // ordered steps, e.g. ["15s video", "first 3s food", "CTA reservation"]
  evidence: { sampleSize: number; metric: string; value: number };
  reuseCount: number;
}
```

Field by field:

- **`id`** — a generated identifier, assigned at capture time. Not supplied by the caller.
- **`domain`** — the **vertical** (sector) the pattern belongs to. This is the single grouping
  key the library supports; §5 develops why that matters and what it forecloses.
- **`name`** — a human-readable label for the structure.
- **`structure`** — the recipe itself: an ordered list of steps. This is the reusable payload —
  the "what worked" expressed as a sequence a future campaign could follow.
- **`evidence`** — a compact evidence triple: `sampleSize` (how many campaigns stand behind the
  pattern), `metric` (which KPI the value refers to), and `value` (the metric's level). This is
  the fact-content of the pattern, and it is exactly what keeps the object descriptive rather
  than conclusory.
- **`reuseCount`** — how many times this structure has been deliberately reused since capture.
  Assigned `0` at capture and incremented only by an explicit reuse signal.

Note what is **not** in a Pattern: there is no field for "best," no boolean "recommended," no
ranking baked into storage. A Pattern carries evidence and a reuse tally, and nothing that
asserts a conclusion. The shape itself is Law 1 made concrete.

The port that governs the shape declares four operations — `capture`, `bestFor`, `get`, and
`markReused`. The next section tags each against the three-tier truth model.

---

## 4. The honest tier picture

The Pattern Library is a textbook case of the split that runs through all of Book D: the
**write** side ships and runs live; the **read/rank** side is built and tested but reaches no
live path. State it plainly.

### 4.1 `capture` — ✅ SHIPPED (write)

`capture` (`domains/company-brain/src/pattern-library.ts:12`) is **✅ SHIPPED**. It runs in the
live web app. When a campaign is recorded, the recording action calls
`brain.patterns.capture` at `apps/web/src/routes.ts:1156`, inside the single synchronous
recording flow that fires the moment a campaign completes. `capture` generates an `id`, sets
`reuseCount` to `0`, and stores the pattern.

So every completed campaign that flows through the recording action contributes a captured
pattern. The library genuinely grows in production. This is a real write to a real store — not
a roadmap aspiration.

A capture also emits a `PATTERN_CAPTURED` event (`apps/web/src/routes.ts:1173-1177`). That event
feeds only the dashboard activity feed (`apps/web/src/app.ts:120`); no subscriber writes it back
into any store or reader. The event announces the capture; it does not wire the library to
anything.

### 4.2 `bestFor` and `rank` — 🔶 BUILT (UNWIRED) (read/rank)

`bestFor` (`domains/company-brain/src/pattern-library.ts:18`) together with its internal `rank`
helper (`pattern-library.ts:35`) is **🔶 BUILT (UNWIRED)**. The code exists, it is correct, and
it is exercised by tests — but **no live path calls it**. `bestFor` filters the stored patterns
to a requested `domain` and returns them sorted best-first by `rank`. Nothing in the shipped web
app ever asks for that list.

That is the central fact of this document: **the library is written on every completed campaign
(✅) but never read back into any live path (🔶).** Patterns accumulate; they are never
consulted. Wiring `bestFor` into a live recommendation path — so that a reader actually asks the
library "what structures have worked in this sector?" — is the concrete build work that turns
this store from a growing archive into an active memory.

### 4.3 `markReused` — 🔶 BUILT (UNWIRED)

`markReused` (`pattern-library.ts:28`) increments a pattern's `reuseCount`. It, too, is present
and correct but has no live caller: nothing in the shipped app signals that a pattern was
reused. Because `reuseCount` feeds the ranking formula (§6), the reuse term in that formula is,
in practice today, always `0` — no path ever raises it.

### 4.4 `get` — 🔶 BUILT (UNWIRED)

`get` (`pattern-library.ts:24`) fetches a single pattern by `id`. Built, tested, unwired.

### 4.5 Durability caveat

The store is in-memory and volatile even in production. The Company Brain that holds it is
constructed in memory in the live app (`apps/web/src/app.ts:89`), alongside the journal and
executive memory (`app.ts:90-91`). Only campaign *Reports* persist — to Postgres when a database
is configured (`apps/web/src/db/repositories.ts:193`). The derived Pattern memory does not
survive a restart. So even the ✅ write is a write into volatile store: the library grows within
a process lifetime, then resets. Durable persistence of derived memory is **❌ ROADMAP** and is
owned by Part 4's archive-and-durability work, not here.

The summary table:

| Operation | Role | Tier | Citation |
|-----------|------|------|----------|
| `capture` | write a pattern | ✅ SHIPPED (called live) | `pattern-library.ts:12`, wired `routes.ts:1156` |
| `bestFor` | read + rank by domain | 🔶 BUILT (UNWIRED) | `pattern-library.ts:18` |
| `rank` | scoring helper | 🔶 BUILT (UNWIRED) | `pattern-library.ts:35` |
| `markReused` | increment reuseCount | 🔶 BUILT (UNWIRED) | `pattern-library.ts:28` |
| `get` | fetch one by id | 🔶 BUILT (UNWIRED) | `pattern-library.ts:24` |

---

## 5. `domain` is the only grouping dimension

A Pattern is keyed by `domain`, which the type documents as the **vertical**. That is the single
axis on which patterns are grouped, and `bestFor(domain)` is the only retrieval the store
offers: give it a sector, get back that sector's patterns.

This is the Pattern Library's expression of the freshness-and-similarity law's **sector
similarity** clause: patterns are grouped and retrieved by the vertical they came from, so a
finance campaign is answered with finance evidence and a restaurant campaign with restaurant
evidence. Grouping by sector is exactly what the aggregation layer is supposed to do — collapse
many campaigns into a per-sector summary a future campaign in that sector can lean on.

But it is *only* sector. There is **no** grouping key inside a Pattern for platform or channel,
campaign type, audience, offer, hook, day, hour, or season. Those attributes are not stored as
keys anywhere the pattern reader can filter on; where such details appear at all in the recording
flow they are free text, not a queryable dimension. Adding grouping dimensions beyond vertical is
**❌ ROADMAP** — there are no keys in the shape to support them, and inventing "patterns by
audience" or "patterns by season" would require both new fields and new capture wiring that do
not exist. The library can answer *"what worked in finance?"*; it cannot answer *"what worked on
Meta in finance in Q4?"* because it has no key to slice by.

Stating that boundary honestly is part of Law 1's discipline: we do not claim a richer aggregate
than the data supports.

---

## 6. The ranking formula

`bestFor` orders its results with a small, deliberate scoring function
(`pattern-library.ts:35`):

```
rank(p) = p.evidence.value * min(1, p.evidence.sampleSize / 100) + p.reuseCount * 0.1
```

Read it as three ideas multiplied and added together:

1. **`evidence.value`** — the metric level itself. A pattern whose evidence value is higher
   starts from a higher score. This is the raw "how well did it do" term.
2. **`min(1, sampleSize / 100)`** — a **sample-size dampener**. It scales linearly from `0` up to
   `1` as the sample grows toward 100 campaigns, then flattens at `1`. A pattern backed by 5
   campaigns is multiplied by `0.05`; a pattern backed by 100 or more is multiplied by the full
   `1.0`. A high metric value on a thin sample is deliberately discounted; only a large sample
   earns the full weight of its value.
3. **`reuseCount * 0.1`** — a small **reuse nudge**. Each time a structure has been deliberately
   reused, it earns a `+0.1` bump. Reuse is treated as corroboration — a structure that keeps
   being chosen and keeps proving out ranks slightly higher — but the multiplier is small on
   purpose so that reuse tilts ties rather than overriding evidence.

### 6.1 The formula already lives the Sample Size Rule

This is worth dwelling on. The Sample Size Rule holds that a user must never mistake a single
lucky campaign for a generalization, and that evidence must be weighted by how much of it there
is. The ranking formula **already** encodes exactly that spirit: it does not rank by metric value
alone; it *blends* the metric value with a sample-size dampener and a reuse tally. A pattern with
a spectacular value but a sample of one is multiplied down to near-nothing; a pattern with a
solid value across a hundred campaigns keeps its full weight.

So the formula is, in miniature, the sample-size discipline applied to pattern ordering: **value
× sample-size dampening + reuse**. It captures the intent of the Sample Size Rule before any
recommendation is ever formed. What it does *not* yet carry is a recency term — the
freshness-before-frequency clause is not in this formula — which is why the design in §7 adds
freshness weighting on top of the dampening that already exists. And because this ranking lives
on the 🔶 unwired read path, its discipline is real in code but not yet exercised by any live
recommendation.

### 6.2 Ranking is ordering, not a verdict

Even fully wired, `rank` produces an **ordering** of aggregates, not a conclusion. Sorting
finance patterns best-first does not assert *"finance should always use video."* It says only
*"of the structures recorded for finance, these are the better-evidenced ones, in this order."*
The pattern at the top of that list is still an aggregate of facts. Turning "top of the list"
into "here is what you should do next" is the interpretive act that Part 3 owns — see
[`../3-recommendation-engine/RECOMMENDATION_ENGINE.md`](../3-recommendation-engine/RECOMMENDATION_ENGINE.md).
The Pattern Library ranks; it does not recommend.

---

## 7. Law 1 in force — aggregate, not conclusion

Law 1 says Performance Memory stores facts, not conclusions. The Pattern Library is where that
law is most tempting to break, because a ranked, sector-keyed list of "winning structures" reads
almost like advice. It is not, and the boundary must be held.

A captured Pattern is an **aggregate of facts**: a structure that recurred, an evidence triple
that quantifies how it did across a sample, and a reuse count. Each of those is descriptive and
checkable. None of them is a conclusion. The statement *"always use video"* is nowhere in the
library — there is no field to hold it, and no operation that produces it.

The interpretive claim — that one structure is *best*, that the company *should* reach for it
next — is manufactured downstream, by reading the aggregate and deciding what to make of it. That
is the recommendation layer's job, and keeping it out of the aggregate layer is precisely why
Law 2 forbids `Campaign → Recommendation` and inserts this middle layer. This document describes
the **aggregate layer**: the middle of `Campaign Records → Aggregations → Recommendations`. When
a reader wants to know how the aggregate becomes advice, it hands off to
[`../3-recommendation-engine/RECOMMENDATION_ENGINE.md`](../3-recommendation-engine/RECOMMENDATION_ENGINE.md).

Held together:

- **Part 1 (Raw)** records one campaign as one fact.
- **Part 2, here (Aggregate)** folds many facts into a reusable, sector-keyed structure with an
  evidence triple — still descriptive.
- **Part 3 (Recommendation)** reads the aggregate and forms advice, stamped with its sample size.

---

## 8. The design: what wiring the library looks like

The Pattern Library's build agenda is small and concrete, because the store and its ranking are
already written. The work is connection and enrichment, not invention.

### 8.1 Wire `bestFor` into a live recommendation path

The single highest-value step is to give `bestFor` a live caller. Today the aggregate is
computed on demand and consumed by no one. The design: when the recommendation layer assembles
evidence for a new campaign in a given sector, it calls `patterns.bestFor(vertical)` and folds
the top-ranked structures into its evidence set. This is the read that turns a growing archive
into an active memory. Until it exists, `bestFor` stays 🔶 BUILT (UNWIRED); the design does not
change its tier — shipping the caller does.

### 8.2 Wire `markReused` to a reuse signal

The reuse term in the ranking formula is inert until something calls `markReused` when a pattern
is actually reused in a new campaign. The design: when a recommended structure is carried into a
new brief and the human accepts it, signal the reuse so `reuseCount` climbs and the corroboration
term in `rank` begins to matter. Without this, the `+ reuseCount * 0.1` term is permanently zero.

### 8.3 Add freshness weighting to ranking

The current formula dampens by sample size but is blind to time. The design extends ranking along
the freshness-before-frequency law: a pattern's score should also reflect how recent its
supporting evidence is, so that a large pile of old campaigns does not automatically outrank a
smaller body of recent ones. Concretely, this means combining the existing **sample-size
dampening** with a **recency weight** — ranking by sample size *and* recency *and* sector
similarity, rather than by value and volume alone. The sector-similarity axis already exists
(the `domain` key); the recency axis is the addition. Operational freshness scoring is developed
in Part 4's decay-and-freshness work; here it is the acknowledged next term in `rank`.

### 8.4 What is NOT on the pattern agenda

More grouping dimensions than vertical are **❌ ROADMAP** and are deliberately *not* smuggled in
as a quiet enhancement: there are no keys in the Pattern shape for platform, audience, offer,
hook, or time, so "patterns by channel" or "patterns by season" would be new fields and new
capture wiring, not a tweak. Likewise, choosing a "best combination" and presenting it as a
recommendation is **not** pattern work — it is Part 3. The Pattern Library's job ends at a ranked
list of sector aggregates.

---

## 9. Boundaries and invariant laws

The Pattern Library operates strictly inside AdOS's constitutional boundaries.

- **Own-data only.** Every pattern is derived exclusively from the company's own completed
  campaigns. No external benchmark, no vendor dataset, no cross-company comparison ever enters
  the library. A pattern's evidence is the agency's own history and nothing else.
- **100% local.** The store lives in-process; capture, ranking, and retrieval are deterministic
  computation over local records. No cloud, no API call, no telemetry, no connector. The ranking
  formula is arithmetic, not a model call — no new AI is created here.
- **Human-sovereign.** Even fully wired, a ranked pattern list is advisory input to a
  recommendation a human reviews. The library never auto-applies a structure to a campaign and
  never approves anything.
- **Copy-only.** Patterns describe structure and evidence; they carry no spend authority and
  execute nothing.

The four invariant laws as they bind this document:

1. **Memory is Evidence, not Knowledge.** A Pattern stores facts (structure, evidence triple,
   reuse count), never the conclusion "best." §7.
2. **Raw → Aggregate → Recommendation.** The Pattern Library is the Aggregate layer; it never
   goes `Campaign → Recommendation`. §2.
3. **Sample Size Rule.** The ranking formula already dampens value by sample size, so thin
   evidence cannot masquerade as a generalization. §6.
4. **Freshness Before Frequency.** Ranking is designed to weight recency alongside sample size
   and sector similarity, so old volume does not automatically win. §8.3.

---

## 10. Value contribution

The Pattern Library increases agency revenue and reduces production time along the theme that
runs through all of Performance Memory. When `bestFor` is wired, a new campaign in a known sector
starts from the company's best-evidenced structures instead of a blank page — cutting production
time, because the team adapts a proven recipe rather than deriving one from scratch. And a library
of sector patterns, each carrying the sample size behind it, lets the agency *prove* a compounding
edge to clients — "here is the structure that has worked across N of your campaigns" — which wins
and retains accounts (revenue). The value is real only once the read side is wired and the
patterns are actually consulted; today the write side banks the raw material for that edge.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
