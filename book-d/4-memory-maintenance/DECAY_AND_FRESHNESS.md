# Decay & Freshness — making recent evidence count

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. What this document owns

This document owns **Law 4 — Freshness Before Frequency** operationally: how the Performance
Memory should let *recent* evidence carry the weight it deserves, so that a company's memory
tracks the market as the market actually is, not as it was three years ago.

Two related mechanics live here:

- **Decay** — recency weighting. When a store folds many observations into one running number,
  the newest observations should move that number more than the oldest ones. Decay is the
  arithmetic of "recent counts for more."
- **Freshness** — the age of the evidence, carried and *scored*. A record has a timestamp;
  freshness is what a reader does with that timestamp when it ranks or selects evidence.

The two are complementary. Decay shapes a value *as it is written and merged over time*.
Freshness shapes *which evidence is chosen and how it is ranked at read time*. A trustworthy
memory needs both, and — as this document is careful to show — AdOS today has fragments of
each, but no wired, time-aware ranking path. The honest state is a split one, and the split is
the point.

**Boundary, stated up front.** Everything here operates on the company's **own** recorded
campaign data, **100% locally**, offline-first, copy-only. There is no external benchmark, no
vendor telemetry, no cloud model of "what's fresh in the industry." Freshness means *fresh in
your own history*. Decay means *your own newer results outweigh your own older results*. The
human stays sovereign throughout: decay and freshness change how evidence is *weighted and
presented*, never what gets approved or shipped.

---

## 2. Law 4 in full — Freshness Before Frequency

> **LAW 4 — Freshness Before Frequency.** More recent evidence is NOT automatically worth less
> than a larger pile of old evidence. Ranking uses **sample size + recency + sector similarity
> + campaign similarity**, never raw frequency alone.

The naive way to rank evidence is by count: whichever group has the most campaigns behind it
wins. Law 4 forbids that shortcut, because count and relevance are not the same thing. A large
count can be a large count of *stale* campaigns — campaigns run under a pricing model, a
platform, an audience, or a creative fashion that no longer exists. Frequency measures how much
you did; it does not measure how much of it still applies.

### 2.1 The canonical example

Consider two bodies of evidence for the same question ("how do our finance campaigns tend to
perform, and what tends to work?"):

| Body of evidence | Campaigns | Age |
|---|---|---|
| **2019 archive** | 500 campaigns | ~6–7 years old |
| **Last 90 days** | 43 campaigns | current quarter |

Raw frequency says the 2019 archive wins by more than ten to one. Law 4 says: **not so fast.**
The 43 recent campaigns may be the more valuable body of evidence, because they were run in the
market you are actually selling into *now* — the current platforms, the current cost curves, the
current audience behavior. The 500 old campaigns describe a market that has moved on. They are
not worthless; they are simply not automatically *weightier* because they are more numerous.

This does **not** mean "newest wins." It means neither dimension gets to dominate by itself:

- **Frequency alone** would crown the 500 stale campaigns.
- **Recency alone** would crown any three campaigns from last week, however flukish.

Law 4's answer is a **composite**: combine how much evidence there is (sample size), how recent
it is (recency), whether it comes from the same sector (sector similarity), and whether it comes
from comparable campaigns (campaign similarity). No single one of those four is allowed to be
the whole ranking. That composite is the operational heart of this document, specified in §6.

### 2.2 Why this matters to the company

A memory that ranks by frequency ages into a liability: the longer the company operates, the
more its recommendations are dominated by its oldest campaigns, precisely when the market has
had the most time to change. A memory that honors Law 4 does the opposite — it stays anchored to
what is currently true, so a five-year-old agency is *more* useful than a one-year-old agency
rather than more encrusted. Freshness is what keeps accumulated memory an asset instead of
sediment.

---

## 3. Decay — recency weighting (🔶 BUILT-UNWIRED, in fragments)

Decay is the mechanism by which a single running value gives newer observations more pull than
older ones. AdOS contains two real, working implementations of this idea — and neither is on a
live path today.

### 3.1 The exponential moving average (🔶 BUILT-UNWIRED)

An **exponential moving average (EMA)** updates a stored value toward each new observation by a
fixed fraction:

```
new = prior * 0.8 + reward * 0.2
```

This appears at [`packages/ai-manager/src/runtime/learning.ts:49`](../../packages/ai-manager/src/runtime/learning.ts). Each new
`reward` moves the stored number by 20% of the distance toward it; the existing value retains
80% of its weight. The consequence is exactly recency weighting: the most recent observation has
the largest single influence, and each older observation's influence decays geometrically the
further back it sits. An observation from ten updates ago contributes `0.8¹⁰ ≈ 11%` of what a
brand-new observation contributes. That geometric fade *is* decay.

The prompt-registry `score()` method at
[`domains/prompt-registry/src/in-memory-prompt-registry.ts:73`](../../domains/prompt-registry/src/in-memory-prompt-registry.ts)
is the same shape of arithmetic: a running score that newer outcomes move more than older ones.
It, too, is a form of recency-weighting.

**Tier — both 🔶 BUILT (UNWIRED).** The EMA lives inside the runtime pipeline. The live web app
uses `OfflineAIManager` / `LiveAIManager`, not the runtime pipeline (`AIRuntimeManager` is
test-only and is never instantiated in production). The prompt registry is likewise not
instantiated in the web app. So the code exists, is tested, and is correct — but no live path
reaches it. Recency weighting is *built* in AdOS; it is not yet *wired*.

### 3.2 What decay does NOT touch today

There is a second, sharper honesty here. Even where decay code exists, **no time-based decay is
applied to the company's actual memory stores** — the Company Brain, the Decision Journal, or
Executive Memory. The EMA weights observations by their *order of arrival*, not by their
*calendar age*, and it lives in a subsystem those stores never call. So:

- The Brain's marketing / SOP rollups merge by **sample weight**, not by age. A merge folds a
  fresh batch into a prior average in proportion to sample size — older campaigns are diluted
  only by being outnumbered, never by being old. (That sample-weighted merge is the subject of
  the sibling document [`MERGE_AND_VERSIONING.md`](MERGE_AND_VERSIONING.md).)
- The Journal, Executive Memory, and Experience stores **keep every entry indefinitely** with no
  age-based down-weighting and no eviction. (Unbounded growth and durability are the subject of
  [`ARCHIVE_AND_DURABILITY.md`](ARCHIVE_AND_DURABILITY.md).)

The takeaway: AdOS has *the arithmetic of decay* (🔶) sitting in an unwired subsystem, and **no
time-based decay at all** (❌) on the stores that hold the company's memory. Do not conflate the
two. Owning Law 4 honestly means stating exactly that gap.

---

## 4. Freshness — the data exists, the scoring does not

Freshness splits cleanly into two questions, and AdOS answers them differently. The precision of
this split is the single most important thing this document has to get right.

### 4.1 Is the freshness DATA there? — ✅ YES

Every store that holds campaign memory stamps its entries with a timestamp when they are
written:

- **Executive Memory** — `ExecutiveMemoryEntry.createdAt`
  ([`domains/executive-memory/src/memory.ts:21`](../../domains/executive-memory/src/memory.ts)).
- **Experience** — `Experience.at`
  ([`domains/company-brain/src/experience-engine.ts:19`](../../domains/company-brain/src/experience-engine.ts)).
- **Decision Journal** — `DecisionJournalEntry.at`, populated at record time
  ([`apps/web/src/routes.ts:1116`](../../apps/web/src/routes.ts)).

These timestamps are written on the ✅ SHIPPED recording path, so the freshness *data* genuinely
accumulates in production. Furthermore, one read path already *uses* the timestamp for ordering:
the Journal's `history` method sorts entries by `at` descending
([`domains/executive-memory/src/memory.ts:71`](../../domains/executive-memory/src/memory.ts)) —
newest first. This ordering is what feeds the live, display-only mission-detail read-back
([`apps/web/src/routes.ts:832`](../../apps/web/src/routes.ts)). So freshness-as-ordering exists
for one display surface.

**Tier — freshness data ✅ SHIPPED.** The timestamps are stored, in production, on a wired path.

### 4.2 Is freshness SCORED when memory is read? — ❌ NO

Storing a timestamp is not the same as *using* it to decide which evidence counts. The critical
read method — Executive Memory's `recall`
([`domains/executive-memory/src/memory.ts:35`](../../domains/executive-memory/src/memory.ts)) —
ranks candidate entries by **importance plus keyword relevance only**. It does **not** consult
`createdAt`. A memory written today and a memory written three years ago, equal in importance and
equal in keyword overlap, rank *identically*. The freshness field is present in the object and
ignored by the ranking.

**Tier — freshness scoring ❌ ROADMAP.** There is no code that weights a memory read by the age
of its evidence. `recall` is age-blind, and there is no decay function over reads to cite.

### 4.3 The split, stated precisely

Put the two halves together, because getting them backward would misrepresent the product:

| Question | Answer | Tier | Evidence |
|---|---|---|---|
| Are timestamps stored? | Yes | ✅ SHIPPED | `createdAt` / `at` on every entry |
| Is one read *ordered* by time? | Yes, Journal `history` (display only) | ✅ SHIPPED | sorts by `at` desc |
| Is *ranked recall* age-aware? | No | ❌ ROADMAP | `recall` ranks importance + keywords only |
| Is there a recency-decay function over reads? | No | ❌ ROADMAP | none exists to cite |

The data is there. The scoring is not. Freshness in AdOS is a **stored fact awaiting a ranker**,
not a shipped ranking behavior. Ordering one display feed by time is real; letting age *change
which evidence wins a recommendation* is not built.

---

## 5. Sector similarity — the one composite ingredient that already exists

Law 4's composite has four ingredients: sample size, recency, sector similarity, campaign
similarity. Three of them are ❌ ROADMAP as *ranking inputs*. One has a real, if unwired,
foothold, and it is worth naming precisely so the design in §6 is not building on air.

**Sector similarity — 🔶 BUILT (UNWIRED).** The Experience store's `findSimilar`
([`domains/company-brain/src/experience-engine.ts:22`](../../domains/company-brain/src/experience-engine.ts))
retrieves prior experiences through a **hard `vertical` filter**
([`domains/company-brain/src/experience-engine.ts:30`](../../domains/company-brain/src/experience-engine.ts)):
only experiences in the same vertical (the sector, derived at record time from the client's
industry) are considered similar. That is a real, coded expression of "same sector." It is
binary rather than graded — same vertical or not — and, like the rest of the Brain read side, it
is unwired: no live generation path calls it.

The other three ingredients:

- **Sample size** — computed and carried on the rollups (sample-weighted averages track the `N`
  behind them), but not yet used as a *ranking* input across bodies of evidence. See Law 3, §7.
- **Recency** — the timestamps of §4 exist, but no ranker consumes them. ❌ as a ranking input.
- **Campaign similarity** — comparing *this* campaign to *past* campaigns on more than the
  sector (creative, offer, audience, objective) requires grouping keys that do not exist; the
  only real grouping key today is the vertical. ❌ ROADMAP.

So the composite is *one graded-down foothold (sector, 🔶) and three gaps*. Honest ownership of
Law 4 means describing the target composite while flagging that it is, today, mostly a design.

---

## 6. The design — a recency-aware composite ranking (❌ ROADMAP)

This section specifies the *target* behavior that would make Law 4 operational. It is design, not
description: nearly all of it is ❌ ROADMAP, with the single 🔶 foothold noted in §5. It is
written so a future implementer knows what "done" means, without claiming any of it ships today.

### 6.1 A recency-decay function over reads (❌)

The first missing piece is a function that turns an entry's age into a weight at read time — the
read-side counterpart to §3's write-side EMA. Given a memory with timestamp `t` and a read
happening at `now`, a recency weight would fall off smoothly with age, for example an
exponential half-life:

```
recencyWeight(entry, now) = 0.5 ^ ( age(entry, now) / halfLife )
```

where `age` is `now − entry.createdAt` (or `entry.at`) and `halfLife` is a tunable window — a
campaign at one half-life counts half as much as a campaign recorded today. The half-life is a
*policy dial*, not a fixed law: a fast-moving sector wants a short half-life (recent quarters
dominate), a slow-moving one a long half-life. Crucially, this weight down-ranks old evidence;
it never deletes it. Law 4 is about weighting, not forgetting — forgetting (archival, eviction)
is a different concern owned by [`ARCHIVE_AND_DURABILITY.md`](ARCHIVE_AND_DURABILITY.md).

The natural insertion point is `recall`
([`domains/executive-memory/src/memory.ts:35`](../../domains/executive-memory/src/memory.ts)),
whose score would gain a recency term alongside its existing importance and keyword-relevance
terms — turning the age-blind ranker of §4.2 into an age-aware one.

### 6.2 The four-factor composite (❌, except sector 🔶)

The recency weight is one of four factors. The target ranking score for a body of evidence
against a candidate campaign combines all four, none dominating:

```
score = f( sampleSize, recency, sectorSimilarity, campaignSimilarity )
```

- **sampleSize** — how many campaigns stand behind the evidence. Diminishing returns, so that a
  huge count cannot simply steamroll (the existing rollups already dampen this with
  `min(1, sampleSize/100)`-style saturation).
- **recency** — the §6.1 weight; recent evidence counts for more, old evidence for less.
- **sectorSimilarity** — same-vertical relevance; the 🔶 `findSimilar` `vertical` filter
  ([`experience-engine.ts:30`](../../domains/company-brain/src/experience-engine.ts)) is the
  seed, graded up from binary to a similarity score over time.
- **campaignSimilarity** — how comparable the *specific* campaigns are (objective, creative,
  offer, audience). This depends on grouping keys AdOS does not yet record, so it is the
  furthest-out factor.

The canonical example of §2.1 is exactly what this composite must get right: the 43 recent
campaigns win over the 500 stale ones **when** their recency and similarity advantage outweighs
the 500's sample-size advantage — and lose when it does not. The composite is what lets that
judgment be made by arithmetic rather than by a frequency shortcut.

### 6.3 This is the foundation Book E builds on — not designed here

The recency-and-similarity ranking specified above is the **foundation for Book E's optimization
layer**. Book E is how the AI *produces better* — combining creative directions that the
evidence supports. It consumes a ranked, freshness-aware, similarity-aware evidence base; it does
not re-derive one. This document's job is to specify that base and stop at the boundary. **The
optimization that sits on top of the ranking is Book E's to design, not this document's.** Named
here only so the dependency is legible; not built, not designed here.

---

## 7. Law 3 interplay — freshness never overrides sample-size honesty

Freshness and sample size are two different truths about a body of evidence, and Law 4 must not
let one silence the other. **LAW 3 — the Sample Size Rule** — requires every recommendation to
carry an evidence stamp:

```
Sample Size: N campaigns · Confidence: <level> · Evidence Age: <window>
```

Law 4 makes recent evidence count *more*; Law 3 insists that a *small* body of recent evidence
still be flagged as small. These do not conflict — they travel together. A fresh signal built on
**3 campaigns** may well rank highly on recency, but it is *still a 3-campaign signal*, and its
stamp must say so:

```
Sample Size: 3 campaigns · Confidence: low · Evidence Age: last 30 days
```

The recency lift does not launder the thin sample. A user reading that stamp sees both facts at
once — it is fresh, and it is thin — and can weigh them. This is the guardrail that stops Law 4
from turning a lucky recent fluke into a false generalization. **Both stamps travel together:**
the freshness (Evidence Age) and the sample size sit in the *same* evidence stamp, and neither
one is allowed to hide the other. A recommendation is never "fresh, therefore trustworthy"; it is
"fresh *and* built on N, judge accordingly."

Note the current tiers here too: the freshness data feeding "Evidence Age" is ✅ stored, and the
sample size feeding "Sample Size" is ✅ carried on the rollups — but a wired engine that emits the
combined stamp on a live recommendation is ❌ ROADMAP (the recommendation-forming layer itself is
🔶/❌; see [`../3-recommendation-engine/RECOMMENDATION_ENGINE.md`](../3-recommendation-engine/RECOMMENDATION_ENGINE.md)).

---

## 8. Law 1 interplay — decay and freshness weight FACTS, not conclusions

**LAW 1 — Memory is Evidence, not Knowledge.** The Performance Memory stores facts — `CTR`,
`ROAS`, timestamps, sample counts — never conclusions. Decay and freshness are operations *on
those facts*, and they must stay on that side of the line.

- A recency weight changes *how much a recorded CTR counts* toward a ranking. It does not invent
  a claim like "video always wins now." It re-weights evidence; it does not manufacture
  conclusions.
- A freshness score changes *which recorded experiences surface first*. It does not decide that
  the surfaced experience is a rule. Any "therefore, do X" is an interpretation formed *later* by
  the recommendation layer (Part 3) or explained by Book C — never by the act of decaying or
  freshness-ranking a number.

So decay and freshness are firmly in the fact-weighting business. They make *recent facts* count
appropriately; they never cross into asserting what those facts *mean*. If a design here ever
reads as "the memory concluded that…," it has violated Law 1 and must be rewritten as "the memory
ranked this evidence higher, for the human/recommendation layer to interpret."

And Book B/C/D/E stay distinct: Book D **records / aggregates / maintains** (this weighting is
maintenance of the aggregate); Book C **explains** an existing recommendation; Book D Part 3
**forms** one from the aggregate. Weighting evidence by freshness is a Book D maintenance
concern, upstream of both explanation and formation.

---

## 9. Invariant boundaries (restated, binding)

Every capability and design in this document sits inside these non-negotiable boundaries:

- **Own data only.** Freshness and decay operate exclusively on the company's own recorded
  campaigns. There is no external benchmark, no "industry freshness," no comparison to other
  companies' data.
- **100% local, offline-first, copy-only.** No cloud, no API, no telemetry, no connectors. The
  timestamps are local records; the ranking, when built, runs locally on local memory.
- **Human-sovereign.** Decay and freshness change how evidence is *weighted and ordered* for the
  human to consider. They never approve, never auto-apply, never ship a campaign. The human
  decides; recency ranking only informs.
- **The AI never learns; the company accumulates memory.** Recency weighting is not the AI
  "getting smarter." It is the memory keeping its *facts* current so that recommendations phrased
  from those facts stay relevant. The product voice remains **"Based on the results of the last N
  campaigns…,"** never "I learned."
- **No conclusions.** Per Law 1, weighting facts is not asserting knowledge.

---

## 10. Value contribution

Freshness weighting is what keeps accumulated Performance Memory *relevant as the market shifts*.
An agency that ranks evidence by frequency slowly becomes a museum of its oldest campaigns; an
agency that honors Law 4 always recommends from what is currently working in its own history.

- **Revenue.** Recommendations grounded in current, sector-matched evidence are ones the agency
  can defend to a client — "here is what your category is doing *now*, from our last quarter, not
  our 2019 archive." That defensibility wins and retains accounts, and it compounds: the longer
  the agency runs, the *fresher* and richer its edge, rather than the more encrusted.
- **Production time.** Starting each campaign from correctly-weighted recent evidence — instead
  of from a blank page or from stale averages — cuts the time spent re-litigating what still
  works. Fresh evidence is a shortcut to a relevant starting point.

Freshness, in short, is the mechanism that lets memory *compound in value* rather than merely
accumulate in volume. Reality first: today AdOS stores the freshness data (✅) and has the
arithmetic of decay (🔶) but not the wired, age-aware ranking (❌) — and this document names that
gap exactly so the value claim stays honest.

---

## 11. Tier summary

| Capability | Tier | Evidence |
|---|---|---|
| EMA recency weighting (`prior*0.8 + reward*0.2`) | 🔶 BUILT-UNWIRED | `learning.ts:49` (runtime pipeline, not live) |
| Prompt-registry `score()` recency weighting | 🔶 BUILT-UNWIRED | `in-memory-prompt-registry.ts:73` (registry not instantiated live) |
| Time-based decay on Brain / Journal / Executive Memory | ❌ ROADMAP | none — no age decay on the memory stores |
| Freshness timestamps stored (`createdAt` / `at`) | ✅ SHIPPED | `memory.ts:21`, `experience-engine.ts:19`, `routes.ts:1116` |
| Journal `history` ordered by `at` desc (display only) | ✅ SHIPPED | `memory.ts:71`, read at `routes.ts:832` |
| Freshness *scoring* on `recall` (age-aware ranking) | ❌ ROADMAP | `recall` ranks importance + keywords only, `memory.ts:35` |
| Sector similarity via `vertical` filter | 🔶 BUILT-UNWIRED | `findSimilar` `experience-engine.ts:22`, filter `:30` |
| Recency-decay function over reads | ❌ ROADMAP | none to cite |
| Four-factor composite ranking | ❌ ROADMAP | sector foothold 🔶; sampleSize/recency/campaign-similarity ❌ |

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
