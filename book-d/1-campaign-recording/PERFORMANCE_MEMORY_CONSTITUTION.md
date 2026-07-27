# Performance Memory Constitution

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. **This is the
> governing document of Book D — Performance Memory.** Every other Book D artifact is
> subordinate to the four laws, the boundaries, and the truth model declared here; where any
> other Book D document appears to conflict with this text, this document controls.
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 0. Preamble — what this document governs

This is the constitution of **Book D — Performance Memory**. It is the highest authority in
the book. Book B established how the system *produces* advertising work. Book C established
how the system *explains why* it recommended what it recommended. Book D establishes the
half neither book owns: **how the company records what actually happened, aggregates that
history, forms evidence-based recommendations from the aggregate, and keeps that memory
trustworthy over time.**

AdOS is the **Enterprise AI Operating System for Advertising**. A generic large-language
model tool answers each question from a blank slate; the thousandth campaign it touches is
no wiser than the first. AdOS is built to be the opposite. Book D is the machinery that lets
an agency's own campaign results become a durable, queryable, attributable asset — so the
organization gets measurably better the longer it runs, and can prove it.

The sentence this entire book exists to make literally true, once its capabilities ship, is
narrow and testable:

> "AdOS remembers every campaign, and every recommendation it makes is grounded in the
> recorded results of the campaigns that came before it."

Everything in Book D — every recorded field, every aggregation, every evidence stamp, every
retention rule — is in service of that sentence. This constitution declares the four laws
that make it enforceable, the honesty model that keeps it truthful, and the boundaries that
keep it safe. Much of what follows is not yet live; this document says so plainly, capability
by capability, because a memory system that lies about its own state is the one thing Book D
cannot ship.

---

## 1. The central framing — the AI never learns; the company accumulates memory

Book D rests on a distinction that must never blur:

> **The AI never learns. The COMPANY accumulates memory.**

There is no model being fine-tuned, no weights being updated, no private intelligence the
system carries from one client to the next. What accumulates is **the organization's own
record of its own results** — a growing body of Historical Evidence that belongs to the
agency, sits on the agency's infrastructure, and describes only the agency's campaigns.

This has a linguistic consequence that this book enforces everywhere. The system never says
**"I learned that video works."** It says:

> **"Based on the results of the last N campaigns, video outperformed static by X% in this
> sector."**

The first phrasing claims a private, transferable intelligence the product does not have and
must never imply. The second attributes a fact to a countable, reviewable, sector-specific
Evidence Base the human can inspect and overrule. The first is a black box; the second is an
operating system for organizational knowledge. Book D exists to make only the second kind of
sentence sayable.

### 1.1 Vocabulary law (binding on every Book D document)

To keep the framing above intact, Book D **minimizes the word "Learning."** The preferred
vocabulary is: **Performance Memory · Campaign Memory · Historical Evidence · Historical
Performance · Evidence Base · Campaign History · Organizational Knowledge · Performance
Record.**

The only permitted exceptions are real code identifiers — the `recordLearning` route action,
the `'learn'` request action, and any `Learning*` engine class — which are named *as code*,
never as the product's concept. Throughout this book the `recordLearning` route is described
as **"the recording action."** A document that leans on "the AI learned" language is not
merely off-brand; it has violated Law 1 (below) by implying the system holds knowledge rather
than evidence.

---

## 2. The four governing laws

These four laws thread through every part of Book D. This section declares them formally.
Each law is stated, justified, and given its enforcement mechanism. Every subordinate Book D
document inherits them.

### LAW 1 — Memory is Evidence, not Knowledge

**Statement.** Performance Memory stores **facts**, never **conclusions**. A Performance
Record may state that a campaign's `CTR` was 2.1%, its `ROAS` was 4.3, its `Hook` was a given
string, and it ran on a given `Day`. Those are facts: real, measured, recorded. The sentence
**"Video is always better"** is **not** a fact and is never stored as memory. It is an
*interpretation* — and interpretation is produced **later**, by Book C (which explains a
recommendation) or by the Book D Recommendation Engine (which forms one from the aggregate).
The memory layer itself never asserts a conclusion.

**Rationale.** The moment a memory system stores conclusions instead of measurements, it
becomes unfalsifiable. "Video is always better" cannot be checked, dated, or overturned by
new results; a `ROAS` of 4.3 on a specific campaign can be. Storing facts keeps the entire
edifice auditable: any recommendation can be walked back to the individual measured campaigns
that produced it, and any human can dispute the *interpretation* without corrupting the
*record*. It also keeps the layers honestly separated — the thing that records is not allowed
to also decide.

**How it is enforced.** The recording path writes only measured quantities and identifiers.
Today the ✅ SHIPPED recording action derives `roas`, `roi`, and `ctr` from `report.kpi(...)`
(`apps/web/src/routes.ts:1108-1110`), plus channel strings (`routes.ts:1111`) and the client
`vertical` (`routes.ts:1106`) — all facts, no verdicts. The KPI facts themselves come from
`computeKpis` (`domains/analytics-engine/src/report/kpi.ts:39`), a deterministic calculation
over campaign results. No component on the write path emits a claim like "X is best"; the
stores hold values and counts, not rulings. **D002 (`PERFORMANCE_RECORD.md`) anchors this law
field by field** — every stored field is a measurement, and the desired-but-absent fields are
measurements too, never conclusions.

### LAW 2 — Raw → Aggregate → Recommendation

**Statement.** There are **three mandatory layers**, always in this order:

> **Campaign Records → Aggregations → Recommendations.**

A recommendation may **never** be formed directly from a single campaign. The path
`Campaign → Recommendation` is forbidden. Something must first summarize *many* records into
an aggregate, and only the aggregate may be interpreted.

**Rationale.** The **aggregation layer** — the middle step — is one of AdOS's most important
pieces of intellectual property. Anyone can look at one campaign and draw a conclusion; that
is exactly the error Law 3 exists to prevent. The value of an operating system for
organizational memory is that it summarizes *the whole history* — counts, sample-weighted
averages, sample sizes, recency — before anyone interprets anything. Skipping the aggregate
turns memory back into anecdote. Enforcing the aggregate is what turns a pile of campaign
reports into an asset.

**How it maps to this book.** The three layers are the spine of Book D's five parts:

| Layer (Law 2)     | Book D Part                          | What it owns |
|-------------------|--------------------------------------|--------------|
| **Raw**           | **Part 1 — Campaign Recording**      | Record every finished campaign as facts (D001–D003). |
| **Aggregate**     | **Part 2 — Pattern Discovery**       | Summarize the history into per-dimension aggregates (D004–D005). |
| **Recommendation**| **Part 3 — Recommendation Engine**   | Interpret the aggregate into an advisory recommendation (D006–D007). |
| *(cross-cutting)* | **Part 4 — Memory Maintenance**      | Keep the aggregate trustworthy over time — merge, version, decay, archive, durability (D008–D010). |
| *(cross-cutting)* | **Part 5 — Performance Intelligence**| Attributable answers and memory-health metrics over the whole stack (D011–D013). |

**How it is enforced.** The write layer and the recommendation layer are physically distinct.
Raw recording fans out into the stores (Part 1). Aggregation is a separate operation:
`mergeMarketing` (`domains/company-brain/src/in-memory-company-brain.ts:100`) performs the
sample-weighted rollup that is Law 2's middle layer. Recommendation is a third operation:
`BrainEvidenceEngine.gather` (`domains/executive-memory/src/reasoning.ts:14`) reads *the
aggregate* — `brain.marketing` plus `patterns.bestFor` plus `experience.findSimilar` — never
raw single campaigns, to assemble evidence. **Honest status:** the aggregation and evidence
layers are 🔶 BUILT (UNWIRED) today (`enrich`/`mergeMarketing` has no non-test caller;
`reasoning.ts:14` is not on any live path). The *architecture* enforces the ordering; the
*wiring* is roadmap. **D005 (`PERFORMANCE_AGGREGATIONS.md`) owns the aggregation layer in
full.**

### LAW 3 — The Sample Size Rule

**Statement.** Every recommendation Book D produces **must** carry an evidence stamp:

> **`Sample Size: N campaigns · Confidence: <level> · Evidence Age: <window>`**

No recommendation is ever presented without it.

**Rationale.** A single lucky campaign and a durable, replicated pattern look identical once
you strip away the count. The stamp makes them impossible to confuse. It tells the human, at
a glance, whether "video outperformed static" rests on 3 campaigns or 300, how confident the
system is, and how old the evidence is. This is Book D's public contract — the exact analogue
of Book C's Explainability Contract — and it is what keeps the Recommendation Engine honest:
a recommendation with `Sample Size: 1` is allowed to exist, but it is *labeled* as the anecdote
it is, and the human decides accordingly.

**How it is enforced.** Every rollup in the aggregation layer already carries a sample size,
so the stamp is computable rather than invented: `mergeMarketing`
(`in-memory-company-brain.ts:100`) is sample-weighted and keeps a running count, and the
pattern ranking formula (`domains/company-brain/src/pattern-library.ts:35`) explicitly damps
value by `min(1, sampleSize/100)` so that low-evidence patterns cannot dominate. The
confidence dimension is produced by `HeuristicConfidenceEngine.assess`
(`reasoning.ts:62`). **Honest status:** these components are 🔶 BUILT (UNWIRED); the stamp is
not yet rendered on any live recommendation because no live recommendation path exists.
**D006 (`RECOMMENDATION_ENGINE.md`) and D011 (`EVIDENCE_ATTRIBUTION.md`) carry this law
operationally** — no output leaves either without the stamp.

### LAW 4 — Freshness Before Frequency

**Statement.** More recent evidence is **not** automatically worth less than a larger pile of
older evidence. Ranking must weigh **sample size + recency + sector similarity + campaign
similarity** — never raw frequency alone.

**Rationale.** Consider `2019: 500 campaigns` versus `Last 90 days: 43 campaigns`. Pure
frequency says the 2019 pile wins by more than ten to one. But platforms, creative norms,
costs, and audiences move; the 43 recent campaigns may describe the world the agency actually
operates in today, and the 500 may describe a world that no longer exists. A memory system
that always defers to the bigger pile will confidently recommend stale tactics. Freshness
Before Frequency is what keeps accumulated memory an advantage rather than an anchor — and it
is the **foundation for Book E's** creative-optimization layer, which builds on this ranking
(Book D provides the ranking; Book E optimizes production on top of it — Book D does not
design E's optimizer).

**How it is enforced.** The raw material for recency ranking already exists: timestamps are
stored on every relevant record — `ExecutiveMemoryEntry.createdAt`
(`domains/executive-memory/src/memory.ts:21`), `Experience.at`
(`domains/company-brain/src/experience-engine.ts:19`), and the recording action's `at`
(`routes.ts:1116`) — and the decision journal's `history` already sorts by `at` descending
(`memory.ts:71`). Recency *decay* mechanics exist as an exponential moving average
(`packages/ai-manager/src/runtime/learning.ts:49`). **Honest status:** the data is ✅ present,
but freshness *scoring* is ❌ ROADMAP — the live `recall` ranks by importance and keyword
relevance only and ignores `createdAt` (`memory.ts:35`). **D009 (`DECAY_AND_FRESHNESS.md`)
owns this law operationally.**

### 2.1 The full pipeline

The four laws describe one loop. State it whole:

> **Campaign → Performance Record → Pattern → Evidence → Recommendation → Human → Next
> Campaign.**

A finished **Campaign** becomes a **Performance Record** (Law 1 — facts only, Part 1). Many
records are summarized into a **Pattern** / aggregate (Law 2 middle layer, Part 2). The
aggregate is read as **Evidence** carrying its sample size (Law 3, Parts 2–3). Evidence,
ranked with freshness in mind (Law 4), is interpreted into a **Recommendation** (Part 3). The
recommendation is advisory: a **Human** reviews it, and the human — never the system — decides
what feeds the **Next Campaign**. The loop then closes and repeats, and the Evidence Base is
one campaign richer. Nothing in this pipeline auto-applies; the human is sovereign at the one
step that matters (Part 3, D007).

---

## 3. No new AI in Book D

Book D creates **no new artificial intelligence.** Recording, aggregation, ranking, and
maintenance are **deterministic and statistical operations over stored records** — sums,
sample-weighted averages, counts, timestamp comparisons, version gates. There is no new
model, no new inference, no new generative behavior introduced anywhere in this book.

Local AI (Book B's producer, Book C's explainer) is permitted only to **phrase** facts it is
handed — the same rule Book C enforces. It never invents a fact and never invents a
conclusion. When a recommendation is rendered into readable English, the numbers, the sample
size, and the evidence age were all computed deterministically by Book D's machinery; the
model only puts them into a sentence. This is what makes the system's claims checkable: strip
the phrasing away and a countable aggregate remains.

This principle protects every other law. If Book D were allowed to introduce a model that
"knows" things, Law 1 collapses (the model would assert conclusions), Law 3 collapses (a model
does not carry a sample size), and the central framing collapses (the AI would, in fact, be
"learning"). No new AI is not a limitation of Book D — it is the mechanism of Book D's
honesty.

---

## 4. The honesty model — three tiers of truth

Book D uses the same three-tier truth model as Books B and C. **Every capability named in
this book is tagged.** Nothing unbuilt is ever described as shipped.

- **✅ SHIPPED** — runs in the live web application; cited with a `path:line` for a wired
  path.
- **🔶 BUILT (UNWIRED)** — the code and its tests exist, but no live path reaches it; cited
  with a `path:line`.
- **❌ ROADMAP** — no implementation exists; never carries a code citation.

### 4.1 The global truth every Book D document inherits

The live application constructs its brain, executive memory, and decision journal **in-memory
and volatile — even in production** (`apps/web/src/app.ts:89-91`). Only campaign **Reports**
are durable: the app selects `inMemoryRepositories()`
(`apps/web/src/db/repositories.ts:201`) or `sqlRepositories(store)` (`repositories.ts:221`)
based on `DATABASE_URL` (`apps/web/src/main.ts:52`), and the report repository is
`SqlCampaignReportRepository` (`repositories.ts:193`). **Reports persist; the derived memory
does not.** And critically: **nothing accumulated flows back into a live generation path
today.** The Evidence Base is written (Part 1 is real) but not yet read by anything that
produces the next campaign. Book D is, as of this writing, a **memory that records but does
not yet remember out loud.** This constitution says so on purpose.

### 4.2 Honest state of Book D, capability by capability

**✅ SHIPPED — the write fan-out (Part 1).** The recording action `recordLearning` is defined
at `apps/web/src/routes.ts:1092` and wired live at `routes.ts:763` (it runs when
`action === 'learn'` on a `POST`); it is idempotent and returns early if already completed
(`routes.ts:1096`). In one synchronous flow it writes to the decision journal
(`journal.record`, `routes.ts:1118`), executive memory (`execMemory.remember`,
`routes.ts:1136`), the experience engine (`brain.experience.record`, `routes.ts:1146`), the
pattern library (`brain.patterns.capture`, `routes.ts:1156`), and the knowledge graph — three
`upsertNode` calls (`routes.ts:1165-1167`) and three `relate` calls (`routes.ts:1168-1170`,
`planned_by`/`ran`/`produced`). The graph's `upsertNode` performs a genuine live property
merge (`domains/company-brain/src/knowledge-graph.ts:17`). It emits five events
(`routes.ts:1173-1177`) that feed only the dashboard activity feed (`apps/web/src/app.ts:120`)
— no subscriber writes to any store. The fields captured are facts only: `roas`/`roi`/`ctr`
via `report.kpi(...)` (`routes.ts:1108-1110`), channel strings (`routes.ts:1111`), the client
`vertical` (`routes.ts:1106`, defaulting to `'general'`), and identifiers plus an `at`
timestamp (`routes.ts:1116`). **D003 (`RECORDING_PIPELINE.md`) owns this fan-out.**

**🔶 BUILT (UNWIRED) — the aggregate and the evidence engines (Parts 2–3).** The aggregation
rollup `mergeMarketing` (`in-memory-company-brain.ts:100`, sample-weighted averaging of
ctr/cpa/roas, keeping `bestHook`/`bestHeadline` from the larger sample at `:111-112`) exists
behind the brain facade (`in-memory-company-brain.ts:27`) but its `enrich` entry point **has
no non-test caller anywhere** — the aggregate is never populated live, so the `bestHook`
fields are dead. The read/rank side of the pattern library (`bestFor` `pattern-library.ts:18`,
`rank` `pattern-library.ts:35`) and of the experience engine (`findSimilar`
`experience-engine.ts:22`, hard `vertical` filter `experience-engine.ts:30`) are built but
unwired. The evidence and confidence engines — `BrainEvidenceEngine.gather`
(`reasoning.ts:14`) and `HeuristicConfidenceEngine.assess` (`reasoning.ts:62`) — are built but
unwired; the context assembler `ExecutiveContextBuilder.build`
(`domains/executive-memory/src/context-builder.ts:37`) is consumed only by
`AIRuntimeManager` (`packages/ai-manager/src/runtime/manager.ts`), which is **never
instantiated in production.**

**❌ ROADMAP — the layers with no implementation.** There is **no history-aggregating
"best-X" discovery engine** and no composite "best combination" recommendation — forming one
is roadmap (Part 3, D006). **Freshness scoring** is roadmap: timestamps are stored, but no
ranker consumes them (`recall` ignores `createdAt`, `memory.ts:35`; Part 4, D009).
**Archiving / eviction** is absent — the stores grow unbounded (Part 4, D010). **Durable
persistence** of the derived memory is absent (`app.ts:89-91`; Part 4, D010).
**Memory-health metrics** — recording coverage, evidence density, grouping coverage,
grounding rate — are roadmap (Part 5, D012). And the **product value-proposition upgrade**
(Section 8 below) is roadmap.

Every subordinate Book D document tags its own capabilities against this model and cites only
paths that genuinely exist. A capability with no citation is ❌ ROADMAP by definition.

---

## 5. Book boundaries — B, C, D, E

Book D sits inside a four-book system and must not cross into its neighbors. The boundaries
are strict.

- **Book B — how the AI *produces*.** B is the producer: it makes the campaign. Book D never
  redesigns production; it records what production yielded.
- **Book C — how the AI *explains why it recommended*.** C is the read/explain side of the
  trust layer. It already documents `BrainEvidenceEngine` / `HeuristicConfidenceEngine` / the
  Decision Journal **as explanation** — the mechanics by which the system justifies a
  recommendation it has already made.
- **Book D — how the COMPANY *records, aggregates, maintains* memory and *forms*
  recommendations from the aggregate.** This is the write/accumulate side. *(This book.)*
- **Book E — how the AI *produces better*.** E optimizes creative combinations. Book D's
  freshness-and-similarity ranking (Law 4) is the **foundation** for E, but Book D does not
  design E's optimizer.

The sharpest boundary is **C versus D**, because they touch the same engines from opposite
directions. Book C **explains an existing recommendation** — given a recommendation, why is it
justified? Book D Part 3 **forms a recommendation from the aggregate** — given the whole
history, what does the evidence advise? The same `BrainEvidenceEngine.gather`
(`reasoning.ts:14`) can serve both: C reads it to *explain*, D reads it to *form*. Keeping this
distinction crisp is a governing obligation of this book. And Book D closes the **write half
of gap B-2**; Book C closed the read/explain half.

---

## 6. The product boundaries — local, sovereign, copy-only

These boundaries are inherited from the product and are non-negotiable in Book D. They apply
to every capability, shipped or roadmap.

- **100% local, offline-first.** All Performance Memory lives on the agency's own
  infrastructure. There is no cloud dependency, no external API call, and no vendor service in
  the recording, aggregation, recommendation, or maintenance paths.
- **No external data, no external benchmarks.** The Evidence Base is built **only** from the
  agency's own campaigns. Book D never blends in third-party benchmarks, industry datasets, or
  any other organization's results. "Based on the last N campaigns" always means *your* N
  campaigns.
- **No telemetry.** Book D emits no vendor telemetry. The events on the write path
  (`routes.ts:1173-1177`) feed only the local dashboard activity feed (`app.ts:120`); nothing
  is reported outward. This extends to Part 5's memory-health metrics — they measure the
  agency's own memory using the agency's own data, never phone home.
- **Copy-only.** Book D governs advertising *copy and creative direction*. It records and
  reasons over campaign performance; it does not act on external systems, place media, or move
  budgets.
- **Human-sovereign — never auto-applies.** A recommendation is **advisory.** The system
  never applies its own advice to the next campaign. The human reviews the recommendation
  (with its Law 3 sample-size stamp), decides, and only the human's chosen direction feeds the
  next brief. This is the load-bearing safety property of the entire pipeline and is owned
  operationally by **D007 (`RECOMMENDATION_TO_NEXT_CAMPAIGN.md`).** Book D does not redesign
  Book A/B approval; it references it.

---

## 7. Value contribution

Book D's value to the agency is concrete and reduces to two levers: **it wins and retains
revenue, and it cuts production time.**

**Revenue.** Accumulated, attributable memory is a compounding competitive edge the agency
can *prove*. When an agency can say — with a countable sample size and a dated Evidence Base —
"across your sector's last 214 campaigns, this direction outperformed the alternative," it
wins pitches and retains accounts that a blank-slate competitor cannot. The memory is an asset
that appreciates: every finished campaign makes the next recommendation better-grounded, and
that trajectory is itself sellable.

**Production time.** Every campaign that starts from evidence instead of a blank page starts
faster. Instead of re-deriving what works in a sector from scratch, the team begins from the
aggregate of what has already worked — a summarized, sample-sized starting point. The
aggregation layer (Law 2's middle) is precisely the machinery that turns a scattered archive
of reports into a fast, reusable starting position.

The value of Performance Memory compounds only through **accumulated, attributable, and
reviewable campaign evidence** — which is exactly what the four laws exist to guarantee.

---

## 8. The deferred value-proposition upgrade — ❌ ROADMAP

This section documents a **future target, gated on real implementation.** It is **not yet
true**, and this constitution states that plainly.

`PRODUCT_TRUTH.md` today states the product's value proposition as **"the Enterprise AI
Operating System for Advertising."** Once Book D's capabilities actually ship — that is, once
recording feeds a live aggregate, the aggregate feeds a live recommendation, every
recommendation carries its sample-size stamp, and the derived memory persists durably — the
value proposition **may** be upgraded to:

> "The Enterprise AI Operating System that remembers every campaign, explains every
> recommendation, and continuously improves future campaigns using organizational performance
> memory."

This upgrade is **❌ ROADMAP.** It is documented here so the target is unambiguous, and it is
governed by one rule: **reality first, then marketing.** The value proposition changes only
*after* the capability that makes it literally true is live and cited — never before. This
constitution does **not** edit `PRODUCT_TRUTH.md`, and no Book D document may present the
upgraded sentence as the current value proposition. The only other document permitted to
restate this target is **D013 (`THE_COMPOUNDING_PROMISE.md`).** Until then, the honest claim
Book D can make today is Section 4.1's: the system records every campaign, and the rest is a
roadmap the code is being built toward — in that order.

---

## 9. How this constitution governs the rest of Book D

Every Book D document is subordinate to this one and inherits, without restating in full, the
four laws, the three-tier truth model, the book boundaries, the product boundaries, and the
vocabulary law. The map:

- **Part 1 — Campaign Recording (Raw).** D001 (this document); D002
  (`PERFORMANCE_RECORD.md`) — the Performance Record field set, tier-tagged field by field,
  anchoring Law 1; D003 (`RECORDING_PIPELINE.md`) — the ✅ SHIPPED write fan-out and its honest
  durability caveat.
- **Part 2 — Pattern Discovery (Aggregate).** D004 (`PATTERN_LIBRARY.md`) — the ✅-write /
  🔶-read pattern library; D005 (`PERFORMANCE_AGGREGATIONS.md`) — the aggregation layer, Law
  2's middle and AdOS's core IP, carrying Laws 3 and 4.
- **Part 3 — Recommendation Engine (Recommendation).** D006 (`RECOMMENDATION_ENGINE.md`) —
  forming a recommendation from the aggregate, distinct from Book C; D007
  (`RECOMMENDATION_TO_NEXT_CAMPAIGN.md`) — closing the loop through a sovereign human.
- **Part 4 — Memory Maintenance.** D008 (`MERGE_AND_VERSIONING.md`); D009
  (`DECAY_AND_FRESHNESS.md`) — Law 4 operationally; D010 (`ARCHIVE_AND_DURABILITY.md`).
- **Part 5 — Performance Intelligence.** D011 (`EVIDENCE_ATTRIBUTION.md`) — Law 3 in full;
  D012 (`PERFORMANCE_MEMORY_METRICS.md`); D013 (`THE_COMPOUNDING_PROMISE.md`) — the payoff and
  the Section 8 target.

Where any of these conflicts with the text above, the other document is corrected — not this
one.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
