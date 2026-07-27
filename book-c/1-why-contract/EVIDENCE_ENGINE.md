# C003 — The Evidence Engine

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. The governing
> document is [`CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. What this document operationalizes

The Constitution declares the **Evidence First Law**: no output may be presented to a human
*as a recommendation* unless it can show the evidence behind it. That is a principle. This
document is about the machinery that makes the principle real — the component that turns "the
system suggests X" into "the system suggests X, and here is exactly why, drawn from campaigns
this agency has actually run."

That machinery is the **Evidence Engine**. Its job is narrow and non-negotiable: for any
recommendation the system is about to make, gather the concrete, human-readable facts that
support it, attach a source and a weight to each one, and hand back a structured bundle that
travels with the recommendation from that point forward. If the bundle is empty, the thing
being proposed is not a recommendation. It is a guess, and it must not be dressed up as
anything more.

The law this engine enforces has a one-line summary written directly into the code that
implements it:

> No recommendation is ever "the LLM said so."

Everything below explains how that sentence becomes a working guarantee rather than a slogan.

**Value contribution.** Evidence is what converts a model's output into something a reviewer
or a client will sign off on. A reviewer who is handed "increase spend on the finance
creative — here is the ROAS and CTR history across the campaigns we've run in that sector"
approves in seconds; a reviewer handed a bare instruction has to re-derive trust from
scratch, or reject it to be safe. Faster, more confident approvals cut production time on
every campaign. And the ability to *explain* every recommendation from the agency's own
memory is precisely what separates AdOS from a generic chat tool a competitor could open in a
browser — it wins accounts and retains them. This engine is where that differentiation is
manufactured.

---

## 2. The BrainEvidenceEngine

### 2.1 What it is — 🔶 BUILT (UNWIRED)

The engine exists in code today as `BrainEvidenceEngine`
(`domains/executive-memory/src/reasoning.ts:14-56`). It is written, unit-tested, and behaves
exactly as this document describes. It is **not yet wired into the live web application** —
the app reaches it through no live route or screen. That gap is real, and Section 5 states it
plainly and describes the work to close it. Wiring it is Book C build work.

The engine's single public operation is `gather()`. Conceptually:

> **Input:** the subject of a pending recommendation — the campaign, vertical, or decision the
> system is about to advise on, plus enough context to know *what* to look up.
>
> **Output:** an ordered list of `EvidenceRef` — the individual, sourced, weighted facts that
> justify the recommendation.

Nothing about `gather()` invents a fact. It does not reason toward a conclusion, it does not
call a language model, and it does not decide what the recommendation *should be*. It reads
what the agency's own memory already knows and reports it. That separation is the entire
point: the recommendation and the evidence for it are produced by different mechanisms, so the
evidence can be examined independently of whatever proposed the recommendation.

### 2.2 The embodied comment

At the top of the engine sits the comment quoted in Section 1 — *"No recommendation is ever
'the LLM said so.'"* This is not decoration. It is the literal embodiment of the Evidence
First Law at the exact point in the codebase where a recommendation acquires its
justification. The comment marks the boundary the law draws: on one side, model output; on the
other, evidence gathered from stored performance. The engine's job is to make sure nothing
crosses from the first side to a human reviewer without something from the second side
attached.

---

## 3. What an EvidenceRef is

An `EvidenceRef` is one atomic unit of justification. It has three properties that matter,
and every one of them is required for the reference to be usable:

1. **Source** — where this fact came from. Not "a model," but a named store inside the
   Company Brain: the marketing-performance rollups, the learned patterns, or the accumulated
   experience. The source is what makes the fact *auditable* — a human can, in principle, go
   back to that store and confirm the number.

2. **Weight** — how much this fact should count. A performance figure computed over hundreds
   of campaigns carries more weight than one drawn from a handful. Weight is how the engine
   expresses that not all evidence is equal without ever throwing away the weaker evidence.

3. **Human-readable text** — a plain-language sentence a person can read and understand
   without decoding a data structure. The engine emits text such as (`reasoning.ts:30`):

   > "ROAS …, CTR … over ${sampleSize} campaigns"

   That is the shape of a real evidence line: a concrete metric, a second concrete metric, and
   the size of the sample the metrics were computed over. A reviewer reads that sentence and
   immediately knows both *what* the system observed and *how much history* stands behind it.

The three together are the contract of an `EvidenceRef`: a fact you can trace (source), a fact
you can rank (weight), and a fact you can *read* (text). Strip any one of them and the
reference stops doing its job — an untraceable fact can't be audited, an unweighted fact can't
be compared, and an unreadable fact can't be reviewed.

It is worth being precise about what the text field is *not*. It is not a rationale, a
narrative, or a persuasive paragraph. It is a factual line — a metric and its sample. The
difference matters because a rationale can be written to justify any conclusion, while a
factual line can only report what the store contains. The engine deliberately traffics in the
second kind. When prose *is* wanted — a readable paragraph a client can absorb — that is a
separate, downstream concern handled by the decision-explanation surface described in
[`../2-grounded-recommendation/DECISION_EXPLANATION.md`](../2-grounded-recommendation/DECISION_EXPLANATION.md),
and even there the prose explains the *existing* decision's evidence rather than inventing new
justification. The Evidence Engine stays upstream of all of that, producing the raw facts the
rest of the chain is allowed to build on.

---

## 4. Where evidence comes from, and how weighting works

### 4.1 The brain stores — 🔶 BUILT (UNWIRED)

`gather()` pulls its evidence from three stores held inside the Company Brain. Each answers a
different question about the agency's own history:

- **Marketing performance** — "What have campaigns in this vertical actually delivered?" This
  is the source of the CTR / CPA / ROAS-over-N figures. The underlying primitive is a
  per-vertical rollup (`domains/company-brain/src/in-memory-company-brain.ts:50`,
  `marketing(vertical)` → `MarketingInsight{ctr,cpa,roas,sampleSize}`), which accumulates a
  sample-weighted CTR/ROAS and a running `sampleSize` across every campaign recorded in that
  vertical (`in-memory-company-brain.ts:100-114`, `mergeMarketing`). This is the exact "N
  campaigns in sector X" primitive that lets an evidence line say "over 183 campaigns" rather
  than "over some campaigns." (The mechanics of populating and querying that rollup are the
  subject of a companion document,
  [`../2-grounded-recommendation/PERFORMANCE_ROLLUPS.md`](../2-grounded-recommendation/PERFORMANCE_ROLLUPS.md);
  here it matters only as a *source* of evidence.)

- **Patterns** — the regularities the agency has learned across its work. Where marketing
  performance is a raw aggregate, a pattern is a shape the aggregate has revealed. Patterns
  let evidence say "campaigns like this one tend to behave this way," grounded in prior runs.

- **Experience** — the accumulated record of specific decisions and how they turned out. This
  is the store that lets evidence reflect *prior success*: not just "the numbers say X" but
  "when we did something similar, here is what happened."

All three stores are **agency-held**. None of them contains a single row that did not come out
of this agency's own campaigns. That boundary is absolute and is the subject of Section 7.

### 4.2 How weighting works, conceptually

Weight is the engine's way of saying "trust this fact this much." The intuition is simple and
defensible:

- **Sample size raises weight.** A ROAS computed over 382 campaigns is a stronger fact than
  one computed over 4. The rollups carry `sampleSize` precisely so that weight can reflect it.
- **Directness raises weight.** A fact drawn straight from performance in the *same* vertical
  outranks a fact borrowed from an adjacent one.
- **Corroboration raises weight.** A conclusion supported by marketing performance *and* a
  learned pattern *and* prior experience is worth more than the same conclusion resting on a
  single store.

Crucially, weight **ranks** evidence; it never **suppresses** it. Weak evidence is still
returned, still visible, still readable — it simply sits lower in the ordered list. The
reviewer sees the whole picture and decides. This is the engine refusing, by design, to make
the human's judgment for them.

A worked illustration makes the ordering concrete. Suppose the system is about to recommend a
particular creative direction for a finance-sector campaign. `gather()` might return, in
weight order: first, a marketing-performance line drawn from hundreds of same-vertical
campaigns — high sample size, same sector, so highest weight; next, a learned pattern that
matches this brief's structure — corroborating, but a shape rather than a raw aggregate; and
last, a single prior experience where a similar direction succeeded — directly relevant but
resting on one data point, so lightest. All three appear. A reviewer scanning top-to-bottom
reads the strongest justification first and the weakest last, and can see at a glance whether
the recommendation rests on a mountain of history or a single lucky campaign. That visibility
is the entire value of returning weak evidence rather than hiding it: the reviewer can tell the
difference between "well-supported" and "plausible but thin," and nothing in the engine makes
that call for them.

The scores that ride alongside this evidence — turning "here are the facts" into "here is how
sure the system is" — are computed by a separate component and are the subject of
[`CONFIDENCE_MODEL.md`](CONFIDENCE_MODEL.md). The Evidence Engine's responsibility ends at the
evidence itself. It gathers; it does not conclude.

---

## 5. The honest tier picture

This is the part of the document that must be scrupulously accurate, because the temptation to
overstate is highest here. There are two things in the codebase that both look like "evidence,"
and only one of them is the engine.

### 5.1 What actually ships today — ✅ SHIPPED (shape only)

The live web application does present evidence to users. But it does not gather that evidence —
it **hand-writes** it. At `apps/web/src/routes.ts:1123-1130`, the running app constructs an
`evidence[]` array as a literal, alongside a confidence object, at the moment a recommendation
is recorded. The reason string is composed inline — for example `reason: "Based on ${roas}x
ROAS"`. This is real, it ships, and users see it.

What is shipped here is the **shape**: the app knows a recommendation should carry an evidence
list, and it produces one in the right form. What is *not* shipped is the **engine behind the
shape**. The evidence in that literal is authored by the route that happens to be running, from
whatever values are in scope at that line. It is not the product of a query against the
agency's memory. It is a well-formed placeholder standing in the spot the real engine will
occupy.

Being honest about this matters. "The app shows evidence" is true. "The app gathers evidence
from campaign memory" is not yet true on any live path. The first is the shape; the second is
the engine.

### 5.2 What the real engine reaches today — 🔶 BUILT (UNWIRED)

The genuine `BrainEvidenceEngine` (`reasoning.ts:14-56`) is consumed in exactly two places,
and neither is a live app path:

- The **unwired runtime manager** (`packages/ai-manager/src/runtime/manager.ts:203-213`),
  which calls the engine and records the gathered evidence onto a decision trace
  (`trace.set({evidence})`). This is the pipeline the *real* grounded-reasoning flow runs
  through — but the live application does not run that pipeline. The app builds its AI through
  `createAIManager()` and the offline/live managers, which do not instantiate this runtime.
- The **unit tests**, which exercise the engine in isolation and prove it does what this
  document says.

So the engine is built and correct, and it is reached only by a runtime the shipping app never
enters, plus its tests. That is the definition of 🔶 BUILT (UNWIRED).

### 5.3 The wiring work

Closing the gap is a specific, bounded task: **route recommendation generation through
`BrainEvidenceEngine` so that evidence is gathered, not authored.** Concretely, the spot at
`routes.ts:1123-1130` that today writes an `evidence[]` literal should instead call
`gather()` and record what the engine returns. When that change lands:

- The evidence a user sees becomes a real query against the agency's marketing, pattern, and
  experience stores.
- The "over N campaigns" figures become live counts from the rollups rather than values that
  happened to be in scope.
- The embodied comment — "No recommendation is ever 'the LLM said so'" — becomes an enforced
  property of the live product, not a property of a runtime only the tests exercise.

That is the whole of Book C's build ambition for this component: not to write a new engine, but
to connect the one that already exists to the surface where humans actually read
recommendations.

### 5.4 A necessary caveat on persistence

The stores the engine reads are **in-memory** in the live app (`apps/web/src/app.ts:89-91`).
That means the evidence base is per-process: it accumulates while the app runs and is not
durably persisted across restarts the way finished artifacts are. When evaluating "how much
history stands behind this evidence," that limit is part of the honest picture and should not
be glossed over. Durable, growing campaign memory is the foundation the "N campaigns"
narrative ultimately needs, and it is not fully in place today.

---

## 6. The Evidence First Law in operation

The Constitution mandates a fixed shape for anything presented as a recommendation:

> **Recommendation → Evidence → Confidence → Alternatives → Decision**

The Evidence Engine owns the second link, and the second link is load-bearing for the whole
chain. Walk the sequence:

1. **Recommendation.** The system forms a proposal — do X rather than Y.
2. **Evidence.** The engine's `gather()` runs and returns an ordered `EvidenceRef[]`: the
   sourced, weighted, readable facts from the agency's own campaigns that bear on X.
3. **Confidence.** A separate component reads that evidence — its strength, its breadth, the
   prior success behind it — and derives how sure the system is. Confidence is *computed from*
   the evidence; it is not asserted independently of it. (See
   [`CONFIDENCE_MODEL.md`](CONFIDENCE_MODEL.md).)
4. **Alternatives.** The options considered and set aside are carried alongside, so the human
   can see not just what was chosen but what was rejected and why. (See
   [`../2-grounded-recommendation/ALTERNATIVES_AND_TRADEOFFS.md`](../2-grounded-recommendation/ALTERNATIVES_AND_TRADEOFFS.md).)
5. **Decision.** A human acts. The system never auto-approves; it presents, and a person
   decides.

The property this chain guarantees is stated once and applies everywhere:

> **A recommendation with zero evidence is not presentable as a recommendation.**

If `gather()` returns nothing, the Evidence First Law has not been satisfied, and the correct
behavior is not to fabricate justification to fill the gap — it is to decline to present the
proposal *as a recommendation* at all. It may still be shown to a human as an open question, an
idea, a thing to investigate. But it may not borrow the authority of the word "recommendation,"
because that word, in this system, is a promise that evidence exists. The engine is what keeps
the promise honest.

---

## 7. The invariant — evidence informs, it never forces

Everything in this document has led to one sentence, and the sentence must be read exactly as
written:

> **Evidence is descriptive, not prescriptive.**

The engine gathers what the past *did*. It reports that ROAS ran at a certain level over a
certain number of campaigns; that a pattern held; that a prior decision succeeded. Every one of
those is a *description* of what happened. None of them is an *instruction* about what must
happen next.

This is not a hedge. It is both scientifically and commercially correct, and getting it wrong
in either direction is dangerous:

- **Scientifically**, past performance is a sample, not a law. A metric averaged over 183
  campaigns describes those 183 campaigns; it does not bind the 184th. Markets shift, briefs
  differ, audiences move. Treating a strong historical figure as a mandate is exactly the error
  that produces confident, well-evidenced, wrong decisions — which is why the companion law
  Confidence ≠ Truth exists and is owned by [`CONFIDENCE_MODEL.md`](CONFIDENCE_MODEL.md).

- **Commercially**, an agency's value is judgment. If the evidence *forced* the decision, the
  human reviewer would be redundant and the client would be buying a lookup table. Because the
  evidence only *informs*, the reviewer remains sovereign: they see the strongest facts the
  agency's memory can offer, and they choose. The engine makes that choice better-informed; it
  never makes it for them.

So the ordered evidence list is a brief handed to a decision-maker, not a verdict handed down
to one. Weight tells the reviewer where to look first. It does not tell them what to conclude.
The moment evidence is allowed to *force* a decision, the system has stopped being a trust layer
and started being an oracle — and an oracle is the one thing this book exists to refuse to be.

Evidence is descriptive, not prescriptive. The engine's entire design is an argument for that
sentence.

---

## 8. Boundaries

The Evidence Engine operates under the same hard boundaries as the rest of AdOS, and two of
them constrain it directly.

**Evidence is over agency-held data only.** Every `EvidenceRef` the engine returns is sourced
from the Company Brain's own stores — marketing performance, patterns, experience — and every
row in those stores came out of a campaign this agency ran. The engine has **no external data,
no connectors, no crawlers, no ingestion pipeline**, and no path to any of them. It cannot
cite an industry benchmark it read somewhere, because it has nowhere to read one from. When an
evidence line says "over 183 campaigns," those are 183 of *this agency's* campaigns. That
constraint is a feature: it is what makes the evidence defensible to a client, because the
client's own work is the only thing standing behind it.

**Everything is 100% local.** The engine runs in-process. It makes no network call, invokes no
cloud service, emits no telemetry, and sends nothing about a recommendation or its evidence
anywhere off the machine. Gathering evidence is a local read against local memory. There is no
per-token cost, no vendor round-trip, and no third party that ever sees what the agency's
campaigns achieved.

**The engine does not learn.** Reading the stores to justify a recommendation is a Book C
concern. *Growing* those stores — turning finished campaigns into new marketing rollups,
patterns, and experience so that tomorrow's evidence is richer than today's — is the
write/learn side, and it belongs to Book D. This document deliberately does not design that
loop. The Evidence Engine reads; it does not write back.

**Copy only.** The evidence this engine handles is metrics and text about campaign
performance. It reasons over numbers and words, never over images, vision, or audio. That is a
whole-product boundary, and the engine sits comfortably inside it.

---

## 9. Summary of tiered claims

| Capability | Tier | Anchor |
| --- | --- | --- |
| `BrainEvidenceEngine.gather()` returning sourced, weighted `EvidenceRef[]` | 🔶 BUILT (UNWIRED) | `domains/executive-memory/src/reasoning.ts:14-56` |
| Embodied law comment — "No recommendation is ever 'the LLM said so.'" | 🔶 BUILT (UNWIRED) | `reasoning.ts` (engine header) |
| Evidence text "ROAS …, CTR … over ${sampleSize} campaigns" | 🔶 BUILT (UNWIRED) | `reasoning.ts:30` |
| Per-vertical marketing rollup (the "N campaigns" primitive) | 🔶 BUILT (UNWIRED) | `in-memory-company-brain.ts:50`, `:100-114` |
| Engine consumed by the runtime manager (unwired pipeline) | 🔶 BUILT (UNWIRED) | `packages/ai-manager/src/runtime/manager.ts:203-213` |
| Live app presents an evidence list (shape only, hand-rolled) | ✅ SHIPPED | `apps/web/src/routes.ts:1123-1130` |
| Live memory stores are in-memory / per-process | ✅ SHIPPED (caveat) | `apps/web/src/app.ts:89-91` |
| Live recommendations gathered *through* the engine | ❌ ROADMAP | wiring work (Section 5.3) |

The one sentence to carry out of this document: today the shipping app has the *shape* of
evidence; the *engine* that would fill that shape from the agency's own campaign memory is
built, correct, and waiting to be wired. And whether hand-rolled or engine-gathered, the rule
never changes — evidence is descriptive, not prescriptive.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
