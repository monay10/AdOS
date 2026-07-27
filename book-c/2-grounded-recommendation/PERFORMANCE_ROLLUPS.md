# C006 — Performance Rollups

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. The governing
> document is [`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. What this document is about

Every other document in this book talks about evidence in the abstract — that a recommendation
must carry it, that it must be sourced and weighted, that a human reads it and decides. This
document is about the one thing that turns all of that from a shape into a number. It is about
the quantified backbone.

When the system is able to say

> **"+18% CTR in finance over the last 183 campaigns"**

that sentence is not prose a model wrote. It is the readout of a *performance rollup*: a
running aggregate of how the agency's own campaigns in a given vertical have actually
performed, carried alongside a count of how many campaigns went into the figure. The "+18%
CTR" is the aggregate. The "183 campaigns" is the count. Neither means anything without the
other — a lift figure with no sample behind it is a rumor, and a sample size with no metric is
a headcount. A rollup is the primitive that binds them together so that an evidence line can be
*both* specific and honest at once.

This document explains the rollup primitive that already exists in the codebase, states
plainly that it is not yet reached by the live application, describes the coarser rollup that
*does* ship today, and lays out the design for populating and querying rollups by sector,
industry, or channel — the work that would make the "183 campaigns in finance" sentence real on
a live screen. Throughout, one rule governs every number: a rollup describes what happened; it
never dictates what must happen next.

**Value contribution.** A rollup is where trust becomes quantitative. A reviewer who is shown
"+18% CTR in finance over 183 campaigns" can size the claim in a second — the metric tells them
the direction, the sample size tells them how much to believe it — and approves faster than a
reviewer handed a bare instruction they must re-derive confidence in from scratch. That is
reduced production time on every campaign the rollup touches. And the ability to ground a
recommendation in the agency's *own* measured history, rather than a generic benchmark a
competitor could pull from a browser, is exactly what wins and retains accounts: the client's
own campaigns are the only thing standing behind the number, and nobody else can reproduce
that.

---

## 2. The per-vertical rollup primitive — 🔶 BUILT (UNWIRED)

### 2.1 What exists in code

The primitive that makes "N campaigns in sector X had Y% CTR" possible is already written. It
lives in the Company Brain as a per-vertical marketing lookup
(`domains/company-brain/src/in-memory-company-brain.ts:50`). Its signature is small and exact:

> `marketing(vertical)` → `MarketingInsight{ctr, cpa, roas, sampleSize}`

Ask it about a vertical — "finance," say — and it returns four numbers: the click-through rate,
the cost per acquisition, the return on ad spend, and, critically, the **sample size** those
three metrics were computed over. That fourth field is the whole point. It is what lets the
system distinguish "+18% CTR over 183 campaigns" from "+18% CTR over 2 campaigns," and treat
the two very differently even though the headline figure is identical.

This is 🔶 **BUILT (UNWIRED)**: the code exists, it is unit-tested, and it behaves exactly as
described — but no live route or screen in the web application reaches it. Section 4 states that
gap without softening it. Wiring it is Book C build work.

### 2.2 How a rollup accumulates — `mergeMarketing`

A `MarketingInsight` is not stored per campaign; it is *merged*. The accumulation logic lives
at `in-memory-company-brain.ts:100-114` in a routine called `mergeMarketing`, and understanding
it is understanding the primitive.

When a new campaign's marketing performance is folded into a vertical's rollup, `mergeMarketing`
does two things:

1. **It raises `sampleSize`.** The count of campaigns behind the vertical's figures grows by
   one. This is the "183" in "183 campaigns" — a running total, not a snapshot.

2. **It updates CTR and ROAS as a sample-weighted blend.** The new campaign does not simply
   overwrite the old average, nor is it given equal footing regardless of how much history
   preceded it. Instead the aggregate is re-computed so that the existing rollup — which already
   represents however many campaigns came before — carries weight proportional to that history,
   and the incoming campaign carries its own. A vertical with 182 campaigns behind it barely
   moves when the 183rd lands; a vertical with 2 campaigns behind it swings hard when the 3rd
   arrives. That is sample-weighting doing exactly what it should: the more history a figure
   already rests on, the more inertia it has, and the harder a single new campaign has to work
   to shift it.

The consequence is that the CTR and ROAS a vertical reports are always *representative of the
whole run*, weighted by how much of that run each campaign is. And because `sampleSize` rides
alongside, the figure is never presented without the context needed to judge it. This is the
mechanical heart of the "N campaigns in sector X had Y% performance" concept — the same concept
every evidence line in this book ultimately draws on.

### 2.3 The metrics a rollup carries

Four fields make up a `MarketingInsight`, and each answers a different question a reviewer
would ask:

- **`ctr`** — click-through rate. How well the creative earned attention. This is the field
  behind a "+18% CTR" claim.
- **`cpa`** — cost per acquisition. How efficiently spend converted into outcomes.
- **`roas`** — return on ad spend. The headline efficiency figure — revenue returned per unit
  spent — and the one the shipping per-client rollup (Section 5) also tracks.
- **`sampleSize`** — the number of campaigns the other three were computed over. Not a metric of
  performance but a metric of *how much to trust the performance figures*. It is the field this
  entire document keeps returning to, because it is the field that keeps the others honest.

---

## 3. From a rollup to an evidence line

A rollup is not the end product. It is a *source* — the raw aggregate that an evidence line and
a context read draw on. Two places in the codebase already turn a `MarketingInsight` into
something a human can read.

### 3.1 As evidence text — 🔶 BUILT (UNWIRED)

The Evidence Engine emits a human-readable line that quotes the rollup directly
(`domains/executive-memory/src/reasoning.ts:30`):

> "ROAS …, CTR … over ${sampleSize} campaigns"

Read that shape carefully, because it is the exact grammar of a defensible evidence line: a
concrete efficiency metric, a concrete attention metric, and — the part most tools omit — the
size of the sample the metrics were computed over. "over 183 campaigns" is `sampleSize`
rendered into English. The engine does not have to invent that number or estimate it; it reads
it straight from the rollup the campaigns themselves produced. (The engine that consumes this
line is the subject of
[`../1-why-contract/EVIDENCE_ENGINE.md`](../1-why-contract/EVIDENCE_ENGINE.md); here the rollup
matters as the *thing the line quotes*.)

### 3.2 As executive context — 🔶 BUILT (UNWIRED)

The same rollup surfaces a second time, in the read-back stack that assembles context before a
recommendation is formed. The Executive Context Builder folds the marketing rollup into the
context it builds (`domains/executive-memory/src/context-builder.ts:61`), rendering it with the
same sample-anchored phrasing:

> "… over ${m.sampleSize} campaigns"

The context builder's ordered read-back stack — prompt, then mission, then Company Brain, then
executive and decision memory, then experience
(`domains/executive-memory/src/context-builder.ts:53-82`, order documented at
`context-builder.ts:18-24`) — is itself 🔶 BUILT (UNWIRED): it is instantiated only in the
walking-skeleton test (`walking-skeleton.test.ts:72`), not in the live app. The point for this
document is narrower: the marketing rollup is one of the stores that stack reads, and when it
reads it, it carries the sample size forward. Whether the rollup is being turned into evidence
*for* a recommendation or into context *before* one, the campaign count travels with the metric.
That consistency is not an accident — it is the primitive refusing to let a performance figure
be quoted without the sample behind it.

---

## 4. The critical honesty — built, and dormant

This is the section that must be exactly true, because it is the one most tempting to blur.

The per-vertical rollup is real code. It merges correctly, it weights by sample size, it feeds
evidence text and context text. Everything in Sections 2 and 3 is accurate. And yet **in the
live web application, this rollup is never populated and never read.**

The reason is a single missing call. A `MarketingInsight` only exists once campaign performance
has been fed into the brain through its enrichment entry point — `enrich({kind:'marketing'})`.
That call is **never made anywhere in `apps/web`.** No live route folds a finished campaign's
CTR/CPA/ROAS into a vertical's rollup. And because nothing populates the rollup, nothing has a
non-empty rollup to read, either. The primitive sits in the codebase fully formed and entirely
idle: built, correct, and dormant.

So the honest statement is precise and two-sided:

- **The "183 campaigns in finance" primitive exists.** The data structure, the sample-weighted
  merge, the sample-size field, the evidence and context renderings — all present, all tested.
- **Nothing in the live app populates or reads it.** No campaign completion writes into it; no
  recommendation queries it. On every live path, `marketing(finance)` would answer from an empty
  or absent rollup, because nothing ever filled one.

That is the definition of 🔶 BUILT (UNWIRED), stated at its sharpest. The gap here is not that
the primitive is wrong; it is that the two ends of its lifecycle — *write on completion* and
*read at recommendation time* — are unconnected in the shipping product.

### 4.1 The wiring work

Closing the gap is a bounded, two-part task, and naming it precisely is more useful than
gesturing at it:

1. **Populate at campaign completion.** When a campaign finishes and its report is available,
   fold its KPIs into the vertical's rollup — the `enrich({kind:'marketing'})` call that today is
   never made. Each completed campaign raises `sampleSize` by one and re-blends CTR/ROAS through
   `mergeMarketing`. Over time, the rollup for "finance" *becomes* "183 campaigns," one
   completion at a time.

2. **Query at recommendation time.** When the system is forming a recommendation for a
   finance-sector brief, read `marketing(finance)` and let the returned `MarketingInsight` become
   the evidence line the reviewer sees — the real "+18% CTR over 183 campaigns," sourced from the
   rollup rather than hand-composed.

Neither step invents a new mechanism. Both connect existing code — the merge primitive, the
evidence rendering, the context stack — to the live surfaces where campaigns complete and
recommendations are read. That is the whole of this document's build ambition.

### 4.2 A caveat on persistence

Even once wired, one honest limit remains. The Company Brain's stores are **in-memory** in the
live app (`apps/web/src/app.ts:89-91`). A rollup accumulated in memory grows while the process
runs and does not durably persist across restarts the way finished artifacts do. So "183
campaigns" would, in the current storage model, mean 183 campaigns *this process has seen* —
not 183 campaigns retained across the machine's whole lifetime. Durable, growing campaign memory
is the foundation the "N campaigns" narrative ultimately needs, and it is not fully in place
today. Saying so is part of quoting the number honestly.

---

## 5. What actually ships today — the coarse per-client rollup ✅ SHIPPED

The live application is not devoid of rollups. It ships one — but it is coarser than the
per-vertical primitive, and the difference is exactly the difference this document exists to
draw.

At `apps/web/src/routes.ts:1461-1470`, the running app computes, for a given client, an average
ROAS across all of that client's missions, together with a count of how many campaigns went into
the average. It is rendered to the user at `routes.ts:1473-1485`. This is real, it ships, and it
is genuinely a performance aggregate with a sample count — the same two ingredients the
per-vertical primitive has.

What it is **not** is grouped by attribute. The shipped rollup answers "how has this *client*
performed on average," and only that. It does **not** group by sector, by industry, or by
channel. It cannot answer "how has finance performed," because it does not partition a client's
campaigns by vertical at all — every one of the client's missions lands in a single undifferentiated
average. So the shipping product can say "this client's campaigns returned an average ROAS of X
over N campaigns," but it cannot yet say "+18% CTR in *finance* over 183 campaigns," because the
attribute grouping that the second sentence requires is precisely the thing the coarse rollup
lacks.

Stating the contrast as a table makes the boundary unmistakable:

| | Per-client rollup | Per-vertical rollup |
| --- | --- | --- |
| Tier | ✅ SHIPPED | 🔶 BUILT (UNWIRED) |
| Grouping | one average per client | per vertical (sector) |
| Metrics | `avgRoas` + campaign count | `ctr`, `cpa`, `roas`, `sampleSize` |
| Populated live? | yes | no — `enrich({kind:'marketing'})` never called |
| Answers "how is finance doing?" | no | yes (once wired) |
| Anchor | `routes.ts:1461-1470`, rendered `:1473-1485` | `in-memory-company-brain.ts:50`, `:100-114` |

The shipped rollup proves the agency *cares* about grounding recommendations in measured
history — it already does so at the client level. The per-vertical primitive is what would make
that grounding *specific*: not "this client on average," but "this attribute, across this many
campaigns." The gap between the two columns is the gap Book C's wiring work closes.

---

## 6. The design — grouping by sector, industry, and channel

Everything below is design. Where a step corresponds to existing code it is tagged 🔶; where it
is pure specification it is tagged ❌ and carries no code citation, because inventing one would
violate the honesty this book is built on.

### 6.1 Populating a rollup from a campaign report — 🔶 primitive, ❌ live wiring

When a campaign finishes, it produces a report carrying its measured KPIs — click-through rate,
cost per click, cost per acquisition, cost per lead, return on ad spend, return on investment.
These are the raw numbers a rollup is built from. The population step is: for each attribute the
campaign can be grouped by — its sector, its industry, its channel — fold the campaign's KPIs
into the rollup keyed by that attribute value.

The merge itself is the primitive that already exists (`mergeMarketing`,
`in-memory-company-brain.ts:100-114`) — 🔶 BUILT (UNWIRED). What is not present today is the
**live call that feeds it on completion** — the `enrich({kind:'marketing'})` invocation that
`apps/web` never makes. That call is ❌ ROADMAP: the mechanism to receive it exists; the wiring
that fires it does not.

A single finished campaign can raise several rollups at once. A finance-sector, lead-generation,
paid-search campaign contributes to the "finance" sector rollup, the corresponding industry
rollup, and the "paid-search" channel rollup simultaneously — each rollup's `sampleSize`
incrementing by one, each re-blending its metrics. This is how the same completed work becomes
evidence answerable from several angles: "how does finance perform," "how does paid-search
perform," "how does this industry perform," all served from rollups the one campaign helped
build.

### 6.2 Querying a rollup by attribute — 🔶 primitive, ❌ live grouping

The read side has the same shape. The lookup primitive exists: `marketing(vertical)` returns the
`MarketingInsight` for a vertical (`in-memory-company-brain.ts:50`) — 🔶 BUILT (UNWIRED). What is
❌ ROADMAP is the **generalized attribute-grouped query** on a live path: given a brief's sector,
industry, or channel, retrieve the matching rollup and hand its metrics-plus-sample-size to the
recommendation being formed.

It bears repeating plainly, because it is the crux of this section: **attribute-grouped querying
is not present in the live app today.** The shipped app groups by client and only by client
(Section 5). The per-vertical lookup that would let it group by sector exists in the brain but is
never reached from a live route. The design describes connecting the existing lookup to a live
query surface; it does not describe a new capability the app secretly already has.

### 6.3 What a wired rollup query returns

Once populated and queried, a rollup answers a recommendation-time question with a fully formed
evidence line. For a finance brief, `marketing(finance)` returns a `MarketingInsight` whose
fields render — through the evidence text at `reasoning.ts:30` and the context at
`context-builder.ts:61` — into exactly the sentence this document opened with: "+18% CTR in
finance over 183 campaigns." The metric comes from the blended `ctr`; the "183" comes from
`sampleSize`; and the sentence is *read*, not authored. That is the target state. Everything
between here and there is the two-part wiring of Section 4.1.

---

## 7. Sample size, and the honesty of a small N

The most important field in a `MarketingInsight` is the one that measures nothing about
performance. `sampleSize` measures *how much the performance figures can be trusted*, and no
rollup should ever be read without it.

The reason is that the same headline number means wildly different things at different sample
sizes:

- **"+18% CTR over 183 campaigns"** is a strong claim. The figure rests on a large run; a single
  anomalous campaign could not have produced it; the sample-weighting in `mergeMarketing` has had
  182 prior campaigns' worth of inertia to smooth out noise. A reviewer can lean on this.
- **"+18% CTR over 3 campaigns"** is a weak claim wearing the same headline. Three campaigns is a
  rounding error away from luck. The identical "+18%" here describes almost nothing durable, and
  the sample-weighting has had almost no history to stabilize it — the next campaign could swing
  it hard. A reviewer must treat this as a hint, not a finding.

The discipline this document insists on is therefore simple: **a small `sampleSize` is weak
evidence, and must be presented as weak evidence.** The rollup never hides its N to make a figure
look stronger than it is. It carries the count into every rendering precisely so that a reviewer
can tell the difference between a mountain of history and a single lucky week — and so that the
system never lets a thin sample borrow the authority of a thick one.

This connects directly to the two neighboring laws. That a rollup can be *strong* — high sample
size, tight figure — and still be *wrong* about the next campaign is the domain of **Confidence ≠
Truth**, owned by [`../1-why-contract/CONFIDENCE_MODEL.md`](../1-why-contract/CONFIDENCE_MODEL.md).
And *narrowing* the gap between a rollup's historical figure and the outcome it predicts — making
tomorrow's rollups better calibrated than today's — is a learning concern that belongs to a later
book, not to this one. This document's job ends at reporting the sample honestly. Judging it, and
improving it, are somebody else's.

---

## 8. The invariant — a rollup describes, it never decides

Everything in this document converges on one sentence, and the sentence must be read exactly as
written:

> **Evidence is descriptive, not prescriptive.**

A rollup that reads "+18% CTR in finance over the last 183 campaigns" is a *description* of what
183 finance campaigns did. It is a fact about the past, quantified and sample-anchored. It is
not, and must never be treated as, an instruction that the 184th finance campaign must use the
same creative, the same channel, the same approach. The rollup *informs* the recommendation; it
does not *force* it.

This distinction is both scientifically and commercially correct, and collapsing it in either
direction is a real failure mode:

- **Scientifically**, an average over 183 campaigns describes those 183 campaigns. It does not
  bind the 184th. Audiences move, briefs differ, a channel that carried finance for two years
  saturates. A rollup that *forced* the next decision would be a machine for repeating yesterday's
  campaign until the day it stops working — and it would look most confident right up to that day,
  because its `sampleSize` would be enormous. Sample size is a measure of how much history stands
  behind a figure; it is not a promise that the future will match it.
- **Commercially**, an agency's value is judgment. If the rollup dictated the creative decision,
  the reviewer would be a rubber stamp and the client would be buying a lookup table. Because the
  rollup only *informs*, the reviewer stays sovereign: they see the strongest measured evidence
  the agency's own campaigns can offer — metric and sample size both — and they choose. A rollup
  showing a big lift in finance is a powerful argument to bring into that choice. It is never a
  substitute for making it.

So a rollup is a brief handed to a decision-maker, not a verdict handed down to one. The sample
size tells the reviewer how hard to lean on the figure. It never tells them what to conclude. The
moment a rollup is allowed to *force* a creative decision, the system has stopped being a trust
layer and started being an oracle — and the whole book exists to refuse that.

Evidence is descriptive, not prescriptive. A rollup is the most quantified form that sentence
takes, and it is bound by it most tightly of all.

---

## 9. Boundaries

The rollup primitive operates under the same hard boundaries as the rest of AdOS, and three of
them bear on it directly.

**Rollups are over the agency's own campaign data only.** Every figure a rollup carries — every
CTR, every ROAS, every increment of `sampleSize` — comes out of a campaign *this agency ran*.
There is **no vendor telemetry, no external benchmark, no connector, no crawler, no ingestion
pipeline**, and no path to any of them. When a rollup says "over 183 campaigns," those are 183 of
the agency's own campaigns, not an industry sample bought or scraped from elsewhere. This is not
a limitation to apologize for — it is the source of the evidence's defensibility. A client cannot
dispute their own measured history, and a competitor cannot reproduce it, because it is built
entirely from work only this agency did.

**Everything is 100% local.** A rollup is accumulated and queried in-process. Populating one is a
local write to local memory; reading one is a local read. There is no network call, no cloud
service, no per-token cost, and no third party that ever sees what the agency's campaigns
achieved in a sector. The "183 campaigns in finance" figure never leaves the machine.

**Rollups aggregate; they do not learn.** Merging a completed campaign into a vertical's rollup is
bookkeeping — a Book C read/write of measured facts. *Learning* from the accumulated rollups —
detecting that a pattern has shifted, that a channel is decaying, that a figure's predictive power
is changing — is the write/learn side, and it belongs to a later book. This document deliberately
does not design that loop. A rollup records what happened; it does not draw conclusions about what
that means for the model.

**Copy only.** A rollup is metrics and counts about campaign performance — numbers and the text
that renders them. It reasons over figures and words, never over images, vision, or audio. That is
a whole-product boundary, and the rollup sits well inside it.

---

## 10. Summary of tiered claims

| Capability | Tier | Anchor |
| --- | --- | --- |
| Per-vertical lookup `marketing(vertical)` → `MarketingInsight{ctr,cpa,roas,sampleSize}` | 🔶 BUILT (UNWIRED) | `domains/company-brain/src/in-memory-company-brain.ts:50` |
| `mergeMarketing` — sample-weighted CTR/ROAS blend + `sampleSize` accumulation | 🔶 BUILT (UNWIRED) | `in-memory-company-brain.ts:100-114` |
| Rollup rendered as evidence text "ROAS …, CTR … over ${sampleSize} campaigns" | 🔶 BUILT (UNWIRED) | `domains/executive-memory/src/reasoning.ts:30` |
| Rollup folded into executive context "… over ${sampleSize} campaigns" | 🔶 BUILT (UNWIRED) | `domains/executive-memory/src/context-builder.ts:61` |
| Context read-back stack that reads the rollup | 🔶 BUILT (UNWIRED) | `context-builder.ts:53-82`, order `:18-24` (only `walking-skeleton.test.ts:72`) |
| Rollup populated live via `enrich({kind:'marketing'})` | ❌ ROADMAP | never called in `apps/web` |
| Rollup queried at recommendation time on a live path | ❌ ROADMAP | wiring work (Section 4.1) |
| Coarse per-client ROAS rollup (`avgRoas` + campaign count) | ✅ SHIPPED | `apps/web/src/routes.ts:1461-1470`, rendered `:1473-1485` |
| Per-client rollup grouped by sector / industry / channel | ❌ ROADMAP | attribute grouping not present live (Section 6) |
| Live Company Brain stores are in-memory / per-process | ✅ SHIPPED (caveat) | `apps/web/src/app.ts:89-91` |

The one sentence to carry out of this document: the primitive that would make "+18% CTR in
finance over 183 campaigns" real is built, sample-weighted, and correct — and it sits dormant,
never populated and never read on any live path, waiting for two calls to connect it to the
surfaces where campaigns finish and recommendations are read. And whether the number rests on 3
campaigns or 183, the rule never changes: a rollup is evidence, and evidence is descriptive, not
prescriptive.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
