# The Performance Record

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`PERFORMANCE_MEMORY_CONSTITUTION.md`](PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. What a Performance Record IS

A **Performance Record** is the atomic fact of AdOS's Performance Memory. It is the single,
immutable observation that is captured the moment a campaign finishes: *this campaign, with
these characteristics, produced these results.* Nothing more. It is the smallest unit of
Historical Evidence — one campaign, one row, one fact.

Everything else in this book is built on top of the Performance Record. Aggregations
summarize many records. Recommendations interpret those aggregates. Maintenance keeps the
pile of records trustworthy over time. But the record itself is the foundation: if the fact
is not captured here, no later layer can recover it. The whole edifice of Campaign Memory
rests on the quality and completeness of this one object.

A Performance Record is **not** a conclusion. It does not say "video works best" or "Tuesdays
are cheaper." It says only what happened: a return on ad spend of `3.4`, a click-through rate
of `0.021`, a channel list of `["meta", "google"]`. The judgment — whether that is good, bad,
repeatable, or coincidental — belongs to layers that read many records later. This distinction
is the first governing law, and it lives here.

> **The AI never learns. The COMPANY accumulates memory.** A Performance Record is the
> company remembering one campaign. It never says "I learned"; it makes it possible to later
> say *"Based on the results of the last N campaigns…"*.

### The one-record view

Think of a Performance Record as a row in the company's permanent ledger of campaign
outcomes:

```
Performance Record
├── Identity      what campaign was this, and when did it finish
├── Descriptors   what were its characteristics (creative, audience, offer, platform, …)
├── Metrics       what results did it produce (CTR, ROAS, ROI, CPA, …)
└── Outcome       did it win, and what was chosen / concluded by the human
```

The desired shape is rich. The shipped shape is narrow. This document is honest about the gap
between the two, field by field, so that no reader mistakes the design for the reality.

### Why atomicity matters

The word "atomic" is doing real work here. A Performance Record is atomic in two senses. It is
the **smallest** thing the memory layer records — you cannot decompose one campaign's fact into
something more granular that still means anything. And it is **indivisible** as evidence — a
record is either captured whole and trustworthy, or it is not evidence at all. A half-recorded
campaign, with metrics but no descriptors, is not "partial evidence"; it is a metric with no
attributable cause, which is exactly the thing Law 1 warns against treating as knowledge.

This is why the field-by-field honesty of §2 is not pedantry. Each missing field is a piece of
the campaign's story the company will never be able to reconstruct. You cannot aggregate by a
dimension you did not record, and you cannot record a dimension retroactively for a campaign
that already finished. The record is a one-shot capture. What it misses at capture time is lost
to Performance Memory permanently, even though — as §3 explains — some of it survives inside the
per-campaign Report.

---

## 2. The desired field set — field by field, tier by tier

Below is the **complete** set of fields a Performance Record is designed to carry, each tagged
with its truth tier. Read this table as the contract between ambition and reality: the ✅ rows
are captured today; the ❌ rows are the design target that Part 1's recording pipeline must one
day fill.

### 2.1 Performance metrics (the numbers a finished campaign produced)

| Field | What it is | Tier | Where it lives today |
| --- | --- | --- | --- |
| **ROAS** | Return on ad spend | ✅ SHIPPED | Computed `kpi.ts:47`; carried to memory `routes.ts:1108` |
| **ROI** | Return on investment | ✅ SHIPPED | Computed `kpi.ts:48`; carried to memory `routes.ts:1110` |
| **CTR** | Click-through rate | ✅ SHIPPED | Computed `kpi.ts:43`; carried to memory `routes.ts:1109` |
| **Conversions / Leads** | Raw conversion & lead counts | ✅ SHIPPED (in Report) | Computed `kpi.ts:16-17`; persisted in the campaign Report, not carried into derived memory |
| **CPC** | Cost per click | 🔶 computed, not carried | Computed `kpi.ts:44`; never written to memory |
| **CPA** | Cost per acquisition | 🔶 computed, not carried | Computed `kpi.ts:45`; never written to memory |
| **CPM** | Cost per mille (thousand impressions) | ❌ ROADMAP | **Not computed anywhere.** No code produces this value. |

Two honest lines to underline from this table:

- **CPC and CPA are computed but abandoned.** `computeKpis` calculates both, and both live
  inside the persisted campaign Report — but the recording action that builds a Performance
  Record does not read them across. They exist as numbers the moment a report is generated,
  then are dropped from the memory layer.
- **CPM does not exist at all.** It is not a "captured elsewhere" case. No function anywhere in
  the system computes cost per mille. Any document, deck, or aggregation that references CPM
  today would be referencing a value that has never been produced.

### 2.2 Descriptors (the characteristics of the campaign that produced those numbers)

Descriptors are the *why* behind the numbers — the levers a future recommendation would want
to compare. Without them, a metric is a result with no attributable cause. This is where the
gap between design and reality is widest.

| Field | What it is | Tier | Where it lives today |
| --- | --- | --- | --- |
| **Platform / Channel** | Which channels the campaign ran on | ✅ SHIPPED (as free-text strings) | `channels = campaign.content.channels.map(c => c.channel)` `routes.ts:1111` — captured, but only as an unstructured string list, not a grouping key |
| **Vertical / Sector** | The client's industry | ✅ SHIPPED | `vertical = client.industry` `routes.ts:1106` (fallback `'general'`) |
| **Outcome** | Won / chosen / concluded strings | ✅ SHIPPED (as free-text) | Won/chosen/concluded strings captured `routes.ts:1116` alongside the `at` timestamp |
| **Creative** | The creative concept / asset used | ❌ ROADMAP | Not written to memory |
| **Audience** | The targeted audience segment | ❌ ROADMAP | Not written to memory |
| **Offer** | The offer / promotion presented | ❌ ROADMAP | Not written to memory |
| **Hook** | The opening hook of the creative | ❌ ROADMAP | Not written to memory (see §2.3) |
| **Headline** | The headline copy | ❌ ROADMAP | Not written to memory (see §2.3) |
| **CTA** | The call-to-action | ❌ ROADMAP | Not written to memory |
| **Season** | The season / time-of-year context | ❌ ROADMAP | Not written to memory |
| **Day** | Day-of-week the campaign ran | ❌ ROADMAP | Not written to memory (timestamps exist, but no day bucketing) |
| **Hour** | Hour-of-day the campaign ran | ❌ ROADMAP | Not written to memory (timestamps exist, but no hour bucketing) |
| **Budget** | The spend allocated to the campaign | ❌ ROADMAP | Not written to memory |

The lesson of this second table: **the company remembers its numbers but forgets its
reasons.** ROAS, ROI, and CTR are captured, but the creative, audience, offer, hook, headline,
CTA, season, timing, and budget that *caused* those numbers are not. A Performance Record today
is a result with almost no attributable descriptor beyond the client's industry and a
free-text list of channels.

### 2.3 A special case — descriptors that exist as TYPES but are never written

Some descriptor fields are more subtle than a plain "not built." They are present in the type
system — the code has a named slot for them — but no live path ever fills that slot. They are
**dead fields**: shaped, but never populated.

The clearest example is `bestHook` and `bestHeadline`. Both are referenced inside the
marketing rollup logic (`mergeMarketing` at
`domains/company-brain/src/in-memory-company-brain.ts:111-112`), where the merge is written to
carry the hook and headline from the larger sample forward. But the store those fields would be
read from is never populated, because the recording action never captures a hook or headline in
the first place. The merge faithfully carries forward a value that is always empty.

This matters for honesty: a reader scanning the code might see `bestHook` and conclude the
system remembers winning hooks. It does not. The field is a well-designed container waiting for
a supply line that does not yet exist. Tag it clearly: the *type* is 🔶 (present but unwired to
any writer); the *captured fact* is ❌ (no Performance Record ever carries a hook).

---

## 3. The KPI source of truth

Every metric a Performance Record could carry originates in one place: **`computeKpis`** at
`domains/analytics-engine/src/report/kpi.ts:39`. This is the single function that turns raw
campaign counters into rates and ratios.

| Metric | Computed at |
| --- | --- |
| CTR | `kpi.ts:43` |
| CPC | `kpi.ts:44` |
| CPA | `kpi.ts:45` |
| ROAS | `kpi.ts:47` |
| ROI | `kpi.ts:48` |
| Conversions / Leads (raw) | `kpi.ts:16-17` |

Two properties of this source of truth deserve emphasis.

**First: the Report persists; the derived memory does not.** When a campaign finishes, its
`CampaignReport` — carrying the full KPI set — is written to durable storage
(`SqlCampaignReportRepository`, chosen when a database is configured). That means every metric,
including the CPC and CPA that never reach the memory layer, is *durably recorded inside the
Report*. The Performance Record derived from it, by contrast, lands in volatile in-memory
stores that do not survive a restart. So the full KPI set is not lost forever — it is trapped
inside per-campaign Reports that no aggregation reads.

**Second: computation is not capture.** A metric being computed by `computeKpis` does not mean
it becomes part of Performance Memory. CPC and CPA prove this: computed at `kpi.ts:44-45`,
present in the Report, yet absent from every derived memory store. The path from "computed" to
"remembered" is a deliberate hand-off, and today that hand-off carries only ROAS, ROI, and CTR
across. Everything else stays behind in the Report.

This is why the KPI source of truth and the Performance Record are two different things. The
Report is the exhaustive receipt. The Performance Record is the thin slice of that receipt the
company actually files into its memory.

**Third: one computation, many possible records.** Because every metric flows from a single
function, the metric definitions are consistent across every campaign the company has ever run.
A `ROAS` recorded for a campaign last year and one recorded today were computed by the same
`kpi.ts:47` logic. This consistency is a quiet prerequisite for aggregation: you cannot
sample-weight an average of ROAS across 200 campaigns if "ROAS" meant something different in
different records. The single source of truth guarantees the metrics are comparable — which is
precisely why the *descriptor* gap (§2.2) is the binding constraint, not the metric gap. The
numbers are already consistent and computable; it is the reasons behind them that go unrecorded.

---

## 4. What is captured today — the shipped Performance Record

Stripped to what actually reaches Performance Memory when a campaign finishes, a shipped
Performance Record contains:

- **`roas`, `roi`, `ctr`** — the three carried metrics, read from `report.kpi(...)`
  (`routes.ts:1108-1110`).
- **`channels`** — the free-text channel string list
  (`campaign.content.channels.map(c => c.channel)`, `routes.ts:1111`).
- **`vertical`** — the client's industry (`client.industry`, `routes.ts:1106`, fallback
  `'general'`).
- **Identity and narrative** — the campaign name, the mission brief, the won / chosen /
  concluded strings, and the `at` timestamp (`routes.ts:1116`).

This capture is performed by the recording action (`recordLearning`, defined
`apps/web/src/routes.ts:1092`, wired live at `routes.ts:763`), which reads these fields at
record time (`routes.ts:1106-1116`). The *how* of that fan-out — which stores receive the
record, in what order, and with what durability — is the subject of the next document in this
part, [`RECORDING_PIPELINE.md`](RECORDING_PIPELINE.md). Here we care only about the *what*: the
fact object itself.

So the shipped Performance Record is real, live, and ✅ — but it is a **five-field fact**
(three metrics, one channel list, one vertical) wrapped in identity and narrative. Set the
shipped five-field record beside the ~20-field design in §2 and the shape of the roadmap
becomes obvious.

---

## 5. Law 1 lives here — Memory is Evidence, not Knowledge

> **LAW 1 — Memory is Evidence, not Knowledge.** Performance Memory stores FACTS, not
> conclusions.

The Performance Record is where this law is enforced at its most literal. A record is permitted
to hold only observations that are *true by measurement*:

- `ROAS = 3.4` is a fact — it was computed from real spend and revenue.
- `CTR = 0.021` is a fact — it was computed from real clicks and impressions.
- `channels = ["meta", "google"]` is a fact — the campaign really ran there.
- `vertical = "finance"` is a fact — that is the client's industry.

What a Performance Record is **forbidden** to hold is any of the following:

- *"Video is always better."*
- *"Finance clients prefer blue creative."*
- *"Tuesday is the cheapest day to launch."*

Those are **interpretations**. They are produced *later*, by the explanation side (Book C) or by
the Recommendation Engine (Part 3 of this book), and only ever by reading *many* records
together. The memory layer never asserts them. If a conclusion ever appears inside a single
Performance Record, the law has been broken and the record is corrupt.

The practical test: **could this value be wrong because a human judged badly, rather than
because a sensor mis-measured?** If yes, it is a conclusion and does not belong in the record.
ROAS cannot be "wrong opinion"; "video is better" can. That line is the boundary of the
Performance Record.

This is also why descriptors must be captured as *observed characteristics*, never as verdicts.
"Hook = 'Only 3 left'" is a fact about what the campaign said. "Scarcity hooks win" is a
conclusion about many campaigns. The roadmap in §7 captures the former precisely so that the
latter can be *derived*, with evidence, elsewhere.

The `Outcome` field deserves a note here, because it sits closest to the line. "Chosen" and
"won" are facts — a human really did select this direction, and the campaign really did meet its
goal. They are captured today as free-text strings (`routes.ts:1116`). What they must never
become is a *generalized* verdict: recording that a campaign "won" is a fact; recording that
"campaigns like this always win" is a conclusion the record may not hold. Outcome answers "what
happened to this one," never "what happens to this kind."

### Law 3, previewed — every record is a grain of sample size

> **LAW 3 — Sample Size Rule.** Every recommendation must carry an evidence stamp:
> *Sample Size: N campaigns · Confidence: <level> · Evidence Age: <window>.*

Each Performance Record is one unit of `N`. A record is not valuable in isolation — a single
campaign with a `5.0` ROAS proves nothing, and the memory layer must never let it masquerade as
a pattern. The value of a record is that it *increments the count* behind a future
recommendation. This is why the record must faithfully carry its `at` timestamp (for evidence
age) and, in the design, its full descriptor set (so that `N` can be counted *per hook, per
audience, per platform*, not just in aggregate). D002 captures the grain; Part 2 counts the
grains; Part 3 stamps the count. The Sample Size Rule is owned downstream, but it begins with
the discipline of recording one honest fact at a time.

---

## 6. Boundaries and invariants

The Performance Record obeys the same invariants as the rest of AdOS. They are not aspirations;
they are constraints on what a record may ever contain.

- **Own-data only.** A Performance Record is built exclusively from *this company's* finished
  campaigns. There is no notion of an industry-average CTR, a competitor's ROAS, or a
  third-party benchmark. Every fact in the record was measured on the company's own account.
- **100% local, offline-first.** Records are computed and stored on the company's own
  infrastructure. No cloud service, external API, telemetry pipeline, or connector is involved
  in producing or storing a Performance Record. If the network is unplugged, recording still
  works.
- **No external benchmarks.** A record never carries a "vs. industry" or "vs. peer" figure,
  because AdOS never fetches such figures. Comparison is always internal — this campaign
  against the company's own history — and that comparison happens in later layers, never inside
  the record.
- **Copy-only, human-sovereign.** The record describes what a human-approved campaign did. The
  memory layer records; it never launches, never spends, and never auto-approves. The record is
  a witness, not an actor.
- **Immutable fact.** Once written, a Performance Record describes a completed campaign at a
  fixed point in time. Corrections and merges are the concern of Part 4 (maintenance); the fact
  itself is not editorialized after the fact.

These boundaries are what make Performance Memory trustworthy. A record built only from
measured, local, own-account facts can be aggregated into evidence a human will actually stake
an account decision on. A record polluted with external estimates or premature conclusions
could not.

---

## 7. The design — a richer Performance Record (❌ ROADMAP)

Everything in this section is **❌ ROADMAP**. None of it is built. It is stated as the design
target so that the recording pipeline (D003) and the aggregation layer (D005) have a concrete
schema to aim at.

The gap is simple to state: **today the company remembers its scores but forgets the game it
played.** The roadmap closes that gap by capturing the full descriptor set alongside the
metrics, so that every finished campaign files a *complete* fact — not just "this scored 3.4x"
but "this Finance campaign, a 15-second UGC video, scarcity hook, blue tone, retargeting
audience, $5k budget, launched Tuesday morning in Q4, on Meta and Google, scored 3.4x and was
chosen."

The designed Performance Record schema captures, at minimum:

- **The full metric set carried into memory**, not just three. CPC and CPA are already computed
  (`kpi.ts:44-45`) — the roadmap simply carries them across instead of dropping them. CPM is a
  larger task: it must first be *computed* (it exists nowhere today) before it can be captured.
- **Structured descriptors, not free text.** Creative, Audience, Offer, Hook, Headline, CTA,
  Season, day, hour, and Budget captured as first-class fields — and Platform promoted from a
  free-text string list to a real, structured key.
- **Live population of the dead type fields.** The `bestHook` / `bestHeadline` slots that today
  sit empty (§2.3) would finally receive a supply line: a Hook and a Headline on every record.

The **point** of the richer schema is what it unlocks downstream. Aggregation is only possible
along dimensions the record actually carries. Because today's record carries only `vertical` (a
real grouping key) and a bag of channel strings (not a key), the company *cannot* ask "what is
our best hook?" or "which audience converts?" or "does Q4 lift finance ROAS?" — the data to
group by simply was never filed. Capture the descriptors, and every one of those questions
becomes an aggregation Part 2 can answer:

- group by **hook** → which openings drive CTR
- group by **audience** → which segments convert
- group by **offer** → which promotions lift ROAS
- group by **platform** → where spend works hardest
- group by **season / day / hour** → when to launch

Each of those is impossible until the corresponding field lands in the Performance Record
first. The record is the bottleneck; the roadmap widens it.

Crucially, the richer record is still **only facts**. A designed record with twenty descriptor
fields is still forbidden from holding a single conclusion (§5). Widening the record does not
weaken Law 1 — it *strengthens* it, by giving the interpretation layers a broader, honest
evidence base to reason over instead of forcing them to guess from three metrics and an
industry label.

---

## 8. Value contribution

A complete, honest Performance Record is where the compounding edge of AdOS starts to pay for
itself, on both sides of the value equation:

- **Revenue — win and retain accounts by proving a compounding edge.** An agency that can file
  every finished campaign as a structured fact can, in time, walk into a pitch and say "based on
  our own last 214 finance campaigns, here is what works" — a claim no blank-slate competitor
  can match. That proof is only as good as the records behind it. Rich, attributable records are
  the raw material of a durable, evidence-backed sales advantage.
- **Production time — start from evidence instead of a blank page.** Every campaign that begins
  by consulting what past campaigns actually did is a campaign that skips the guesswork. The
  Performance Record is the first link in that chain: no record, no history; no history, no
  head start. Capturing the fact once saves the cost of rediscovering it every quarter.

The record itself does not *deliver* either outcome — the aggregation, recommendation, and
attribution layers do. But none of those layers can deliver anything the record failed to
capture. This is why field-by-field completeness is not a cosmetic concern: **the ceiling on
every downstream value in Book D is set by what the Performance Record remembers.**

---

## 9. Summary — the record in one page

- A **Performance Record** is the atomic fact captured when a campaign finishes: this campaign,
  these characteristics, these results. It is the foundation every later layer reads.
- **Captured today (✅):** ROAS, ROI, CTR, a free-text channel list, the vertical, plus campaign
  identity, brief, won/chosen/concluded strings, and a timestamp. A five-field fact wrapped in
  narrative.
- **Computed but not carried (🔶):** CPC and CPA — real numbers that live in the persisted
  Report and never reach the memory layer.
- **Not computed at all (❌):** CPM — no code anywhere produces it.
- **Not captured (❌):** Creative, Audience, Offer, Hook, Headline, CTA, Season, day, hour,
  Budget — and Platform exists only as free text, not a grouping key. `bestHook` / `bestHeadline`
  are shaped in the type system but never written, so they sit permanently empty.
- **The law that lives here:** Memory is evidence, not knowledge. A record holds facts, never
  conclusions. Every record is one grain of a future recommendation's sample size.
- **The roadmap:** a richer schema that carries the full metric set and the structured
  descriptors, so aggregation by hook, audience, offer, platform, and season becomes possible —
  all of it own-data-only, 100% local, and free of external benchmarks.

The next document, [`RECORDING_PIPELINE.md`](RECORDING_PIPELINE.md), describes *how* the shipped
record is written across the memory stores, and where that write is durable versus volatile.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
