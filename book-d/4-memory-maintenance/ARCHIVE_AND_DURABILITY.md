# Archive & Durability — Does Performance Memory Survive a Restart?

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. What this document covers — and why it is the most important one in Book D

Everything else in Book D — recording a finished campaign, aggregating the history, forming
an evidence-based recommendation, ranking by freshness — assumes one thing that is **not
true today**: that the memory is still there tomorrow.

This document is about the memory that is supposed to *last*. It has two halves:

- **ARCHIVE** — retention and eviction of *old* memory. What happens to a Performance Record
  from three years ago? Is anything ever pruned, summarized, or moved to cold storage?
- **DURABILITY** — survival of memory across a process restart. If the web application is
  redeployed, rebooted, or crashes, does the accumulated Performance Memory come back?

Both halves are, for the company's derived Performance Memory, **❌ ROADMAP**. There is no
archive. There is no eviction. And — the honest, uncomfortable centre of this document — the
brain, the executive memory, and the Decision Journal are held in volatile in-memory stores
**in production**, so they are **lost on restart**. Only the campaign KPI *Reports* persist.

We state this plainly because it is the single biggest structural gap in Performance Memory
today. Until it is closed, none of Book D's other capabilities can deliver their promised
value, because the value of memory is that it *accumulates*, and a store that resets to empty
on every restart accumulates nothing.

```
Campaign → Performance Record → Pattern → Evidence → Recommendation → Human → Next Campaign
             ▲───────────────────────────────────────────────▲
             └── all of this must SURVIVE for the memory to compound.
                 Today, most of it does not. This document owns that gap.
```

This is a maintenance concern (Part 4 of Book D), but it is prior to every other maintenance
concern. Merge, versioning, decay, and freshness (the sibling documents) all operate on a
store that is assumed to exist between one campaign and the next. If the store is volatile,
they operate on sand.

---

## 2. Where this sits in the truth model

Following the three-tier spine used across the whole book:

- **✅ SHIPPED** — runs in the live web app; a real `path:line` is cited for a wired path.
- **🔶 BUILT (UNWIRED)** — code and tests exist, but no live path reaches it.
- **❌ ROADMAP** — no implementation; no code citation is given.

For archive and durability the tiers land as follows, and the table is deliberately stark:

| Capability | Tier | Reality |
| --- | --- | --- |
| Archive / retention of memory stores | ❌ ROADMAP | No archive of any kind exists. |
| Eviction / pruning of old memory | ❌ ROADMAP | Nothing is ever pruned. Stores grow unbounded. |
| Durable persistence of the derived memory | ❌ ROADMAP | Brain, exec memory, journal are in-memory only. |
| Durable persistence of campaign **Reports** | ✅ SHIPPED | Postgres-backed when a database is configured. |
| Dashboard activity feed cap (50 entries) | ✅ SHIPPED | A *display* buffer — **not** memory eviction. |

The one green row in the "does it survive" column belongs to Reports, not to the Performance
Memory derived from them. That distinction is the spine of this document.

---

## 3. ARCHIVE — there is none (❌ ROADMAP)

### 3.1 The plain statement

**No memory store in AdOS is ever archived, pruned, evicted, summarized, or aged out.** The
Decision Journal, the Experience Engine, the Pattern Library, and the Knowledge Graph all
grow without bound for as long as the process runs. Every recorded campaign adds rows and
never removes any. There is no retention policy, no size cap, no time-to-live, and no
cold-storage tier on any of these stores.

This is not a bug that has been hidden; it is a capability that has not been built. We tag it
**❌ ROADMAP** and give no code citation, because there is no code to cite.

### 3.2 The four unbounded stores

Each of these is written on every campaign completion and never trimmed:

- **Decision Journal** — one entry recorded per finished campaign. Grows one row per campaign,
  forever.
- **Experience Engine** — one experience recorded per finished campaign, indexed by vertical.
  Grows one row per campaign, forever.
- **Pattern Library** — one pattern captured per finished campaign. Grows one row per campaign,
  forever.
- **Knowledge Graph** — three nodes upserted and three relationships created per finished
  campaign. Node upserts merge properties when a key repeats, so node *count* can plateau, but
  relationship and property history accrue without any prune step.

None of these stores has an "old enough to remove" path. A campaign from 2019 sits in memory
with exactly the same weight and the same footprint as a campaign from last week — until the
process stops, at which point (see §4) it is gone entirely.

### 3.3 The one cap in the system is NOT memory eviction

There is exactly one bounded buffer in the live application, and it is a common source of
confusion, so we address it directly.

The **dashboard activity feed** is capped at **50 entries** (`apps/web/src/app.ts:67` sets the
cap; `apps/web/src/app.ts:127` enforces it as entries arrive). When a fifty-first activity
event is emitted, the oldest is dropped from the feed.

This cap is a **display buffer**, not memory eviction. Three facts make the distinction exact:

1. The feed holds **event notifications** ("PATTERN_CAPTURED", "MEMORY_UPDATED", and the like),
   not Performance Records. Dropping a feed entry drops a *notice that something happened*, never
   the recorded fact itself.
2. The events that populate the feed have **no subscriber that writes to any store**. The feed
   is a terminal sink for the dashboard's benefit; nothing downstream depends on its contents.
3. When the feed evicts its oldest entry, the corresponding Decision Journal entry, Experience,
   Pattern, and graph nodes are **untouched**. They remain in their stores in full.

So the 50-entry cap trims what the operator *sees scrolling by*, not what the company
*remembers*. Reading it as evidence of a retention policy would be a mistake. The memory
stores themselves have no cap at all.

### 3.4 Why "no archive" is a real problem, not a convenience

An unbounded store is not automatically a healthy store. Two problems compound over time:

- **Unbounded growth** — memory footprint rises monotonically with campaign count. For an
  in-memory store (see §4) this is also a rising *volatility* cost: the more you have
  accumulated, the more you lose on the next restart.
- **Stale evidence with equal weight** — with no aging path, a large pile of very old campaigns
  can dominate an aggregate purely by count. That directly threatens **Law 4 (Freshness Before
  Frequency)**: `2019: 500 campaigns` should not silently outweigh `Last 90 days: 43 campaigns`.
  The freshness *scoring* that would fix this is itself ❌ ROADMAP (its sibling document owns
  that gap), but archive is the other half of the same coin — freshness scoring re-weights old
  evidence, archive decides whether old evidence is even kept in hot memory at all.

Archive, done correctly, is therefore not "delete old stuff to save space." It is a
retention *policy* that keeps the memory both affordable and honest.

---

## 4. DURABILITY — the critical honest point (❌ ROADMAP for derived memory)

### 4.1 The plain statement

The company's derived Performance Memory is **volatile in production**. The three stores that
hold it are constructed as in-memory, non-swappable implementations at application start-up:

- `new InMemoryCompanyBrain()` — `apps/web/src/app.ts:89` (the brain: experience, patterns,
  graph, and the marketing/creative/sales/sop rollups).
- `new InMemoryExecutiveMemory()` — `apps/web/src/app.ts:90` (executive memory / recall).
- `new InMemoryDecisionJournal()` — `apps/web/src/app.ts:91` (the Decision Journal).

These are not test doubles that get swapped for a persistent variant in production. They are
the *production* stores. There is no configuration switch, no environment variable, and no
constructor branch that replaces them with a durable implementation. Whatever the process has
accumulated lives only in the heap of the running process.

**Consequence: when the process restarts, all of it is gone.** A redeploy, a reboot, a crash,
an out-of-memory kill, a routine infrastructure cycle — any of these returns every one of
these stores to empty. Every recorded Decision Journal entry, every Experience, every Pattern,
every graph node and relationship built up over months of campaigns: erased. The next campaign
starts against a blank memory, exactly as if the company had never run a campaign before.

We tag this **❌ ROADMAP** because the durable variant does not exist. It is the most important
missing piece in the entire book.

### 4.2 The contrast that proves it is fixable: Reports DO persist (✅ SHIPPED)

Durability is not an unsolved problem in AdOS in general. One class of record already survives
restarts today, and it shows the exact pattern the memory stores are missing.

Campaign **Reports** — the KPI record of a finished campaign — are persisted through a
repository abstraction that selects its backend at start-up:

- The `RepositoryBundle` chooses between `inMemoryRepositories()`
  (`apps/web/src/db/repositories.ts:201`) and `sqlRepositories(store)`
  (`apps/web/src/db/repositories.ts:221`).
- The choice is driven by whether a database is configured — `DATABASE_URL`
  (`apps/web/src/main.ts:52`).
- When a database is present, reports are stored through `SqlCampaignReportRepository`
  (`apps/web/src/db/repositories.ts:193`), backed by Postgres.

So a finished campaign's KPI Report is **durable**: shut the process down, bring it back up
with the same `DATABASE_URL`, and the Report is still there.

### 4.3 The asymmetry, stated exactly

Put the two facts side by side, because their combination is the whole point:

- The **KPI record of a finished campaign is durable** (Reports → Postgres, when configured).
- The **Performance Memory derived from that record is volatile** (brain, exec memory, journal
  → in-memory, always).

The recording pipeline runs on every completion and fans the Report out into the four derived
stores. The Report survives. The fan-out does not. So after a restart the company can still
show you *what a campaign's numbers were*, but it can no longer tell you *what the accumulated
history across campaigns implies* — because the accumulation is gone. The raw facts persist;
the organizational memory built from them evaporates.

This asymmetry is why durability is a Book D concern specifically. Book D is the write /
accumulate side. Accumulation that does not survive is not accumulation.

### 4.4 What this means for the whole book

Every downstream promise in Book D is gated on this one gap:

- Aggregations (Part 2) summarize *the history*. After a restart there is no history to
  summarize — the aggregates rebuild from zero and climb back up one campaign at a time.
- Recommendations from evidence (Part 3) carry a **Law 3 sample-size stamp**:
  `Sample Size: N campaigns`. After a restart, `N` collapses to whatever has been recorded
  since the last restart. The evidence stamp does not lie — but the number it reports is a
  fraction of the true history.
- Freshness and decay (Part 4 siblings) re-weight evidence over time. There is no "over time"
  for a store that resets on each deploy.

**Performance Memory cannot compound across restarts until the brain, journal, and executive
memory stores are made durable.** This is *the* foundational build item of Book D. It is the
prerequisite for everything else in the book actually delivering value. A recommendation that
says "Based on the results of the last 200 campaigns…" is only trustworthy if those 200
campaigns are still remembered — and today, one restart away, they are not.

---

## 5. The design (❌ ROADMAP)

Everything in this section is a target, not a description of current behaviour. No code is
cited because none exists. It is included so that the gap has a named, buildable shape.

### 5.1 Durable persistence for the memory stores

The pattern to follow already exists in the codebase for Reports: a repository abstraction
that selects an in-memory or a SQL-backed implementation at start-up based on `DATABASE_URL`.
The design goal is to give the three volatile stores the **same** treatment.

- A `Sql*` variant for each store — a durable Company Brain, a durable Executive Memory, and a
  durable Decision Journal — behind the same interface as their in-memory counterparts, so the
  live application can swap implementations without any change to the recording pipeline or the
  read paths.
- Selection driven by the same `DATABASE_URL` signal the Reports already use, so a single
  configuration decision makes the *entire* Performance Memory durable, not just the KPI layer.
- Backed by **local Postgres**. This is the same backend Reports already use. It is not a new
  external dependency and not a cloud service (see §7).

Wiring these would turn the four unbounded, volatile stores into durable stores that survive a
restart — which is the precondition for the archive policy below to be worth anything, and for
the sample-size stamp to reflect true history.

### 5.2 A retention / archive policy

Durability makes the memory survive; retention keeps it affordable and honest as it grows. The
target policy has two available shapes, and either must respect the invariant laws:

- **Cold-storage archive** — move very old records out of the hot store into a durable cold
  tier. Records are retained (never destroyed) but no longer loaded into working memory for
  every aggregation. The full detail remains retrievable.
- **Summarize-then-evict** — before removing old individual records from the hot store, roll
  them up into a retained summary aggregate (a sample-weighted average plus its sample size and
  date window), then evict the individual rows. The *contribution* of those campaigns to the
  aggregate is preserved even though the individual rows are gone.

Whichever shape is chosen, the policy must be **transparent about what it did**. Silently
dropping records is forbidden by the laws (see §6). If archiving changes the number of
individual records behind an aggregate, or shortens the window of detail available for
freshness scoring, that change must be recorded and surfaced, not hidden.

### 5.3 What the design explicitly does NOT do

- It does not delete evidence to make a recommendation look better. Retention is about cost and
  freshness, never about curating a flattering history.
- It does not introduce any cloud tier, external archive service, or off-device storage. Cold
  storage is local (see §7).
- It does not change how a recommendation is *formed* or *explained* — that is Part 3 and Book
  C respectively. Archive and durability are strictly about keeping the underlying facts
  available and trustworthy over time.

---

## 6. The invariant laws applied to archive & durability

The four governing laws are not optional here. Two of them bear directly on this document.

### 6.1 LAW 1 — Memory is Evidence, not Knowledge

Archiving and persisting **move FACTS around; they must never distort them.** A record moved
to cold storage, or rolled into a retained summary, is still the same evidence — the same
`CTR`, `ROAS`, `channel`, `vertical`, `at` timestamp — just stored differently. Persistence
and archive are storage operations. They must be lossless with respect to the facts they carry.

The forbidden failure mode is an archive step that "tidies" evidence into a conclusion — that
collapses a range of campaign results into a claim like *"video is always better"* and stores
*that* instead of the numbers. That is not archiving memory; it is fabricating knowledge and
discarding evidence. The archive layer stores facts, never interpretations. Interpretation
remains the job of the Recommendation Engine (Part 3) and Book C, downstream and separate.

### 6.2 LAW 4 — Freshness Before Frequency

Archival must **preserve enough recent detail for freshness scoring.** Law 4 says more recent
evidence is not automatically worth less than a larger pile of old evidence, and that ranking
uses sample size, recency, sector similarity, and campaign similarity — never raw frequency
alone. A retention policy that evicted or coarsened *recent* records would starve the very
signal Law 4 depends on.

The rule that follows: archive from the **old** end of the timeline, and keep recent
individual records at full detail — including their timestamps — so that recency-aware ranking
still has real data to work with. Summarizing the deep past is acceptable; blurring the recent
past is not. When a summary replaces individual old records, it must retain the date window it
covers, so freshness scoring can still tell how old that evidence is rather than treating a
2019 rollup as if it were current.

### 6.3 The other two laws, in one line each

- **LAW 2 (Raw → Aggregate → Recommendation)** — archive and durability operate on the *Raw*
  and *Aggregate* layers; they never let a Report skip straight to a Recommendation. Persisting
  a record does not turn it into advice.
- **LAW 3 (Sample-Size Rule)** — every recommendation carries `Sample Size: N · Confidence:
  <level> · Evidence Age: <window>`. Durability is what makes `N` and `<window>` *true across
  time*; archive is what keeps them honest as history deepens. If archiving changes `N`, the
  stamp must reflect the change.

---

## 7. Boundaries

The boundaries that govern all of AdOS apply here without exception:

- **100% local durable storage.** The durable backend is **local Postgres** — the same engine
  Reports already use. There is no cloud database, no managed persistence service, no
  off-device archive, and no external cold-storage tier. Memory that survives a restart does so
  on the company's own hardware.
- **Own-data only.** Archive and durability operate exclusively on the company's own recorded
  campaigns. No external benchmark, no shared corpus, no vendor dataset is retained, archived,
  or mixed in. The memory is the agency's, and only the agency's.
- **No telemetry.** Nothing about the memory — its size, its contents, its retention events —
  is reported to any external service. There is no phone-home on archive or eviction.
- **Copy-only and human-sovereign.** Persistence and archive change nothing about what AdOS is
  allowed to *do* with the memory: it produces copy and recommendations for a human to approve.
  A durable memory never becomes a mandate; it never auto-applies a past result to a new
  campaign. The human still decides.

---

## 8. Value contribution

Durable memory is what makes the compounding promise real. The value of Performance Memory is
that it *accumulates* — each campaign leaves the company a little smarter about its own
verticals, channels, and results, so the next campaign starts from evidence instead of a blank
page. That is the mechanism by which the agency wins and retains accounts (a provable,
compounding edge → **revenue**) and cuts production time (start from what worked, not from
zero → **reduced production time**).

Volatile memory resets that edge to zero on **every restart**. A store that forgets everything
on the next deploy cannot compound; the agency pays the full cost of recording each campaign
and receives none of the accumulating benefit, because the benefit is erased before it can be
drawn on. In hard terms: the recording pipeline runs, the Report persists, and the
organizational memory that was supposed to be the moat quietly evaporates.

This is why archive and durability are framed as the foundational build item of the whole
book, not a late-stage tidy-up. Making the memory stores durable is the difference between a
company that remembers every campaign and a company that merely records each one and then
forgets. Everything else in Book D — the aggregations, the recommendations, the sample-size
stamps, the freshness ranking — only pays off on top of a memory that is still there tomorrow.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
