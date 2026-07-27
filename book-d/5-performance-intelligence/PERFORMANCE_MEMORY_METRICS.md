# Performance Memory Metrics — How Do We Know the Memory Is Healthy and Growing More Valuable?

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. What this document covers — and the honest headline

Performance Memory is only worth building if it gets **more valuable over time**. A memory that
records nothing, aggregates nothing, and forgets everything on restart is not an asset; it is a
liability dressed up as one. So the question this document answers is deliberately blunt:

> **How would the agency *know* — with numbers, from its own data — that its Performance Memory
> is healthy and compounding, rather than thin, stale, or quietly decaying?**

The answer, stated plainly up front so nothing here is mistaken for a shipped feature:

**Every metric in this document is ❌ ROADMAP.** Not one of them is computed anywhere in the
live application today. There is no metrics store, no coverage counter, no density gauge, no
freshness score, no grounding-rate report. What *does* exist is the **raw material** — the
records, the sample-size fields, the timestamps — from which these metrics could one day be
derived. This document's job is to describe each metric, tie it honestly to the raw material
that already exists, and mark clearly where the raw material is missing too.

This is a health-and-value scorecard for the memory itself. It is the meta-layer above the
pipeline: Part 1 records, Part 2 aggregates, Part 3 recommends, Part 4 maintains — and this
document measures whether all of that is actually accumulating into something an agency owner
would pay a premium to keep.

### 1.1 The one rule that governs every metric here

Before any individual metric: **all of these metrics are computed over the agency's OWN data.**

- **No vendor telemetry.** The software does not phone home. There is no counter of "how many
  agencies use feature X," no anonymised aggregate shipped to a vendor, no product analytics.
- **No usage tracking.** These metrics measure the *agency's memory*, not the *agency's clicks*.
  Nobody is watching which buttons the operators press.
- **No external benchmarks.** A metric never compares the agency to an industry average, a
  cohort, or another agency. "Healthy" is defined relative to the agency's own history and its
  own configured thresholds — never relative to anyone else's numbers.
- **100% local, offline-first, copy-only.** Every number is derived from records the agency
  itself produced, on the agency's own instance, and never leaves it.

This is not a footnote; it is repeated deliberately in each metric family below, because it is
the property that makes the whole scorecard trustworthy. A memory-health metric that depended
on outside data would defeat the purpose of a memory the agency owns.

---

## 2. The metric families at a glance

Six families, one honest tier each. All ❌ ROADMAP as *metrics*; the middle column records
whether the **raw material** for the metric exists yet.

| # | Metric family | Question it answers | Raw material today | Metric tier |
|---|---------------|---------------------|--------------------|-------------|
| 1 | Recording Coverage | Are finished campaigns actually being recorded? | ✅ recording action exists | ❌ ROADMAP |
| 2 | Evidence Density | How much evidence sits behind each number? | ✅ `sampleSize` fields exist | ❌ ROADMAP |
| 3 | Grouping Coverage | How many dimensions can we aggregate by? | 🔶 one real key (`vertical`) | ❌ ROADMAP |
| 4 | Freshness | How much evidence is recent? | ✅ timestamps stored | ❌ ROADMAP |
| 5 | Recommendation Grounding Rate | What share of advice is backed by enough evidence? | ❌ no grounded recommender live | ❌ ROADMAP |
| 6 | Durability / Retention Health | Does memory survive and stay bounded? | ❌ volatile, unpruned | ❌ ROADMAP |

Read the table as a maturity ladder. Families 1, 2 and 4 have the raw material in hand — the
metrics are "just" the counting layer that was never built. Families 3, 5 and 6 are thinner
still: the thing being measured barely exists yet, so the metric would mostly report a gap.

Each family below follows the same shape: **what it measures**, **the raw material that exists
(honestly tiered)**, **why the metric is ❌**, and **what "healthy" would look like**.

---

## 3. Family 1 — RECORDING COVERAGE

### 3.1 What it measures

Recording Coverage is the percentage of **completed campaigns that produced a full Performance
Record**. It is the first metric that matters, because every other number in Book D is worthless
if campaigns finish without being recorded. A memory with 20% coverage is not a memory; it is an
anecdote.

Formally, the ❌ ROADMAP metric would be:

```
Recording Coverage = (completed campaigns with a Performance Record)
                     ÷ (completed campaigns)          × 100%
```

### 3.2 The raw material — ✅ exists

The recording action itself is real. When a campaign completes, the recording action fires and
writes a Performance Record across the memory stores (`apps/web/src/routes.ts:1092`, wired live
at `apps/web/src/routes.ts:763`). It is idempotent — a campaign already recorded returns early
rather than double-counting (`apps/web/src/routes.ts:1096`). So the *event* whose coverage we
would measure genuinely occurs, and it occurs exactly once per campaign.

That idempotency is quietly important for a coverage metric: it means the denominator (completed
campaigns) and the numerator (recorded campaigns) can never drift apart through duplicates. A
recorded campaign is recorded once.

### 3.3 Why the metric is ❌ ROADMAP

Nothing counts the ratio. The recording action writes records; it does not tally how many
completed campaigns *reached* it versus how many slipped through uncorded. There is no coverage
counter, no "recorded / completed" gauge, no report surfacing campaigns that finished without a
Performance Record. The raw event is ✅; the coverage metric over it is ❌.

There is also a durability caveat that makes coverage harder than a naive count (see Family 6):
because most derived memory is volatile, a "record" that existed before a restart may be gone
after one, so a truthful coverage metric has to be computed against *persisted* records, not
whatever happens to be in memory at the moment.

### 3.4 What "healthy" looks like

Healthy coverage trends toward 100% and stays there. The value of the whole edifice is a direct
function of this number: at 100% coverage every completed campaign becomes evidence; at 60% the
memory is a biased sample of whichever campaigns someone remembered to close out. A coverage
metric's most useful output is not the headline percentage but the **list of the missing** — the
completed campaigns with no record — so a human can go close the gap. That is Law 1 in action:
the metric reports a fact (this campaign has no record), not a conclusion.

---

## 4. Family 2 — EVIDENCE DENSITY

### 4.1 What it measures

Evidence Density is the **average sample size behind an aggregate or a recommendation**. Coverage
asks "are we recording?"; density asks "how much is each summarised number actually standing on?"
An aggregate computed from 3 campaigns and an aggregate computed from 300 campaigns can look
identical on screen — same ROAS, same shape — but they are not the same evidence. Density is the
metric that keeps that difference visible.

### 4.2 The raw material — ✅ exists

The sample-size field is real and is carried on the very objects that would be measured:

- **`MarketingInsight.sampleSize`** — the marketing rollup keeps a sample count alongside its
  sample-weighted averages of CTR, CPA and ROAS (`domains/company-brain/src/in-memory-company-brain.ts:100`).
- **`Pattern.sampleSize`** — the Pattern Library's ranking formula multiplies an evidence value
  by `min(1, sampleSize / 100)`, so the pattern's own sample size is stored and already shapes
  its rank (`domains/company-brain/src/pattern-library.ts:18`).

So the input to a density metric — a per-aggregate sample count — is present in the data model
today. The number the metric would average already exists on each object.

### 4.3 Why the metric is ❌ ROADMAP

There is no computation that reads those `sampleSize` fields *across* aggregates and reports an
average, a distribution, or a "thin evidence" list. Each aggregate knows its own sample size; no
metric rolls those up into a density figure for the memory as a whole. And the honest caveat from
Book D's aggregation layer applies: the marketing rollup that carries `sampleSize` is itself 🔶
BUILT (UNWIRED) — its populating path has no live caller — so today the field would mostly be
measured over aggregates that are not being fed. Data present, metric absent, and the substrate
partly unwired. The tier is ❌.

### 4.4 What "healthy" looks like

Healthy density rises as the memory matures and rarely sits near the floor. The single most
valuable output is the **thin-evidence list**: the aggregates whose sample size is below the
threshold at which anyone should generalise from them. This is the operational partner of **Law 3
— the Sample-Size Rule**: every recommendation must carry `Sample Size: N campaigns · Confidence:
<level> · Evidence Age: <window>`, and a density metric is how the agency spots, in advance,
which corners of its memory cannot yet support that stamp honestly. Density does not *hide* thin
evidence; it *surfaces* it so a human can decide whether to trust it or gather more.

---

## 5. Family 3 — GROUPING COVERAGE

### 5.1 What it measures

Grouping Coverage is the count of **dimensions the memory can aggregate by**. Law 2 (Raw →
Aggregate → Recommendation) lives or dies on the aggregation layer, and an aggregation layer is
only as expressive as the keys it can group on. If the memory can slice history by *vertical* but
not by *audience*, *offer*, *hook*, *day*, or *season*, then most of the interesting questions an
agency would ask ("what works for finance clients on a 15-second hook?") simply have no aggregate
to answer them.

### 5.2 The honest reality — 🔶 one real key

This is where honesty matters most, so it is stated flatly: **the only real grouping key that
exists today is `vertical` (sector).** It is carried as `MarketingInsight.vertical`, filtered as
`Experience.vertical`, and read back via the marketing rollup keyed on vertical
(`domains/company-brain/src/in-memory-company-brain.ts:50`). Two further keys exist only on
**🔶 BUILT (UNWIRED)** stores — a creative-format key (`creative(format)`,
`domains/company-brain/src/in-memory-company-brain.ts:53`) and an SOP key with a version gate —
neither of which is fed by a live path.

Everything else an operator would want to group by — platform/channel, campaign type, audience,
offer, hook, day, hour, season — has **❌ no grouping key at all**. Channel is stored only as
free text on the experience and pattern records, not as an aggregatable dimension. Timestamps are
stored, but there is no time bucketing to group them into recency windows. The reality of which
keys exist, and why free-text channel is not a grouping key, is documented in full in the
aggregation layer: [`../2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md`](../2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md).

### 5.3 Why the metric is ❌ ROADMAP

Even measuring grouping coverage is ❌: nothing enumerates the available grouping keys and reports
"we can aggregate by 1 of the N dimensions a full Performance Record would support." A Grouping
Coverage metric would, today, mostly report the *absence* — and that is precisely why it would be
valuable, because it would make the gap between the recorded field set and the aggregatable field
set impossible to ignore.

### 5.4 What "healthy" looks like

Healthy grouping coverage grows as new grouping keys are added and back-filled — each new
dimension turning a category of question from unanswerable into answerable. The metric's honest
job for a long time will be to say "1 real key today," and to hold that number in front of the
people deciding what to build next. Growth in this metric is growth in the memory's *reach*.

---

## 6. Family 4 — FRESHNESS

### 6.1 What it measures

Freshness is the **share of evidence that falls within a recency window** — for example, "what
fraction of the aggregate behind this recommendation is from the last 90 days?" It is the metric
form of **Law 4 — Freshness Before Frequency**: a larger pile of old evidence is not automatically
worth more than a smaller pile of recent evidence, so the agency needs to *see* how recent its
evidence actually is rather than assume that a big sample size means a current one.

### 6.2 The raw material — ✅ timestamps exist

The timestamps are stored. Every entry that would feed a freshness metric carries a time:
`ExecutiveMemoryEntry.createdAt` (`domains/executive-memory/src/memory.ts:21`) and `Experience.at`
(`domains/company-brain/src/experience-engine.ts:19`). So the input to a freshness metric — a
per-record timestamp — is present across the memory stores.

### 6.3 Why the metric is ❌ ROADMAP

Storing a timestamp is not the same as scoring by it. No computation counts the share of evidence
inside a recency window, and — tellingly — the one place that *could* rank by recency does not:
memory recall ranks by importance and keyword relevance only, ignoring `createdAt` entirely. The
timestamps are ✅ stored; the freshness *scoring and share metric* over them are ❌. The full
operational treatment of Law 4 — how ranking would eventually combine sample size, recency, sector
similarity and campaign similarity — belongs to
[`../4-memory-maintenance/DECAY_AND_FRESHNESS.md`](../4-memory-maintenance/DECAY_AND_FRESHNESS.md);
this document only measures *how fresh the memory currently is*, not how to rank by it.

### 6.4 What "healthy" looks like

Healthy freshness means a meaningful share of the evidence behind any live recommendation is
recent, and stale corners are flagged rather than silently trusted. The metric's most useful
output is the **stale-aggregate list**: aggregates whose evidence is overwhelmingly old, so a
human knows the "N campaigns" behind a stamp are mostly from years ago. Combined with the
Sample-Size Rule stamp's `Evidence Age: <window>` field, freshness is what stops a big-but-ancient
sample from masquerading as a strong one.

---

## 7. Family 5 — RECOMMENDATION GROUNDING RATE

### 7.1 What it measures

Recommendation Grounding Rate is the **percentage of recommendations that are backed by an
aggregate above a minimum sample size**. It is the direct enforcement metric for **Law 3**: if a
recommendation cannot point to enough evidence to earn its `Sample Size: N` stamp honestly, it is
not grounded, and the grounding rate is the number that says how often that happens.

Formally, the ❌ ROADMAP metric would be:

```
Grounding Rate = (recommendations backed by an aggregate with sampleSize ≥ threshold)
                ÷ (recommendations issued)          × 100%
```

### 7.2 The raw material — ❌ mostly absent

This family is thinner than the first four, and the reason is structural. There is **no
history-aggregating "best X" recommendation engine live** to grade. The evidence-gathering and
confidence-assessment pieces that a grounding metric would inspect exist only as **🔶 BUILT
(UNWIRED)** code, and the composite "best combination" recommendation is **❌ ROADMAP** outright.
You cannot measure the grounding rate of recommendations that are not being produced. So both the
thing measured *and* the metric are unbuilt.

Crucially, this metric must respect the Book D boundary: it grades whether a recommendation is
**formed from a sufficiently large aggregate** (Law 2's middle layer), not whether it was well
*explained*. Explanation is a separate concern handled elsewhere in the platform; grounding rate
is strictly about evidence sufficiency behind the recommendation.

### 7.3 Why the metric is ❌ ROADMAP

With no grounded recommender to observe and no metrics layer above it, there is nothing to
compute. When a recommendation engine does form advice from aggregates, the grounding rate becomes
the single most important quality gate on it: a recommender that issues confident advice from
three-campaign aggregates would post a low grounding rate and be caught before it ever misleads a
human. Until then, the tier is ❌.

### 7.4 What "healthy" looks like

Healthy grounding rate trends toward 100% — nearly every recommendation standing on an aggregate
big enough to generalise from — and, critically, the ungrounded remainder is **labelled as such**
rather than dropped. Law 2 forbids the shortcut `Campaign → Recommendation`; a grounding-rate
metric is how the agency proves, quantitatively, that it never took that shortcut.

---

## 8. Family 6 — DURABILITY / RETENTION HEALTH

### 8.1 What it measures

Durability / Retention Health asks two linked questions: **is memory persisted so it survives a
restart, and is it pruned so it does not grow without bound?** Every metric above assumes the
records it counts are still there tomorrow. This family measures whether that assumption holds.

### 8.2 The honest reality — ❌ volatile and unpruned

This is the uncomfortable centre, stated flatly. The derived memory is held in **volatile
in-memory stores in production** — the brain, the executive memory, and the Decision Journal all
live in non-swappable in-memory holders (`apps/web/src/app.ts:89-91`). On a redeploy, reboot, or
crash, that accumulated memory is **lost**. Only the campaign KPI *Reports* persist. And there is
no archive or eviction: the stores grow unbounded, with nothing pruned, summarised, or moved to
cold storage. The full treatment of both halves — the durability problem and the missing archive —
lives in
[`../4-memory-maintenance/ARCHIVE_AND_DURABILITY.md`](../4-memory-maintenance/ARCHIVE_AND_DURABILITY.md).

### 8.3 Why the metric is ❌ ROADMAP

There is no persistence-health check and no retention gauge. Nothing measures "what fraction of
the memory would survive a restart" (today: only the persisted Reports) or "how large has the
memory grown against a bound" (today: no bound). Because the substrate is volatile, this family is
also the *precondition* for trusting every other metric — a coverage figure computed over volatile
memory is only true until the next restart. The metric is ❌; the reality it would report is worse
than the others, because the thing being measured is actively at risk.

### 8.4 What "healthy" looks like

Healthy durability means the derived memory persists across restarts on the same footing as the
Reports do, and healthy retention means the memory stays bounded through a deliberate archive
rather than growing until it degrades. Until persistence and archival ship, this metric would
honestly report the biggest risk to the entire Performance Memory: that it is one restart away
from empty.

---

## 9. The invariant laws, restated as metric contracts

Every metric family above is an instrument for one of Book D's four laws. Stated as invariants
that hold regardless of tier:

- **Law 1 — Memory is Evidence, not Knowledge.** Metrics report *facts about the memory* (this
  campaign has no record; this aggregate rests on 4 campaigns; this evidence is 3 years old).
  They never emit conclusions and never tune anything — a metric that said "video is always
  better" would be inventing knowledge, which the memory layer must never do.
- **Law 2 — Raw → Aggregate → Recommendation.** Grouping Coverage measures the aggregate layer's
  reach; Grounding Rate measures that recommendations were formed *from* aggregates and never
  short-cut straight from a single campaign.
- **Law 3 — Sample-Size Rule.** Evidence Density and Grounding Rate are the metrics that make the
  `Sample Size: N · Confidence · Evidence Age` stamp enforceable rather than decorative.
- **Law 4 — Freshness Before Frequency.** The Freshness family measures recency share so a large
  pile of old evidence can never quietly outweigh a smaller pile of current evidence.

And two boundaries that hold across all six families without exception:

- **Human-sovereign.** Every metric here *informs the humans running the agency*. Not one of them
  auto-tunes, auto-prunes, auto-approves, or changes a recommendation. A low freshness score
  raises a flag for a person; it never silently down-weights anything on its own. The metrics are
  a dashboard, not a controller.
- **Own-data-only.** Restated once more because it governs the whole scorecard: every number is
  computed over the agency's own records, on the agency's own instance — **no vendor telemetry, no
  usage tracking, no external benchmarks, 100% local.**

---

## 10. Value contribution — why measuring the memory pays for itself

These metrics are **❌ ROADMAP**, but their business case is exactly why they belong on the
roadmap rather than in the bin. Book D's whole promise is a *compounding edge*: an agency that
records, aggregates, and reuses its own performance history wins and retains accounts a
blank-page competitor cannot. Memory metrics are how that promise becomes **provable**.

- **They prove the compounding edge is real (revenue).** "We have recorded 214 finished
  campaigns, at 96% coverage, and 71% of the evidence behind our recommendations is from the last
  year" is a sentence an agency can say to a prospect — and it is a sentence only these metrics
  can make true and defensible. That provable, owned, attributable memory is what justifies
  **premium positioning**: the agency is not selling opinions, it is selling an evidence base no
  one else has.
- **They focus attention on thin and stale evidence (reduced production time and lower risk).**
  The density and freshness families point operators straight at the aggregates that cannot yet
  support a confident recommendation — so effort goes to gathering the evidence that matters
  instead of to guessing, and every campaign starts from a *measured* evidence base rather than a
  blank page.

Both effects — proving the edge and directing effort — depend on the metrics being computed over
the agency's own data. A borrowed benchmark could never prove *this* agency's compounding memory;
only its own numbers can.

---

## 11. Where this sits, and the honest bottom line

This document is the scorecard that sits above the whole of Book D. It does not record, aggregate,
recommend, or maintain — the other documents own those. It measures whether all of that is
working: whether campaigns are recorded (Family 1), whether the numbers rest on enough evidence
(Family 2), whether the memory can slice history usefully (Family 3), whether that evidence is
current (Family 4), whether recommendations are grounded (Family 5), and whether any of it will
survive tomorrow (Family 6).

The bottom line, unhedged: **today the scorecard would be almost entirely blank, because none of
these metrics are computed and some of the things they measure barely exist.** The raw material —
the recording action, the sample-size fields, the timestamps — is real and honestly tiered above.
The measurement layer over it is **❌ ROADMAP**. Naming these metrics now, precisely and against
the raw material that exists, is what turns "the memory feels valuable" into "the memory is
measured, and here is the proof." Reality first, then the marketing.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
