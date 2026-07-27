# Internal Benchmarking — You vs the Agency

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md`](../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md).
>
> **Laws:** *Evidence ≠ judgement · judgement is reproducible · a score is never an LLM opinion
> · higher score does not guarantee better business outcome · Creative Intelligence ranks
> alternatives, humans choose direction.*

---

## 1. What this document defines

A **benchmark** answers one question: *compared to what?* A Creative Score on its own is a
number. A benchmark gives that number a reference point — "this campaign's ROAS is 3.1× against
a baseline of 2.4×" — and a reference point is what turns a score into an argument you can make
in front of a client.

This document covers the **feasible half** of benchmarking: comparing a creative or a campaign
against the agency's **own** baselines. Two reference points are available, and only two, because
they are the only two the agency already holds in its own data:

1. **The client's own history** — how this client has performed in the past. *You vs your own
   past.*
2. **The agency's per-vertical baseline** — how the agency's book of work performs in this
   client's sector. *You vs the agency's aggregate in your sector.*

Both are built entirely from data the agency already owns. Neither touches the outside world.
The other half of benchmarking — comparing against a **sector average** or a **global**
industry figure — requires data the agency does **not** hold and is not permitted to fetch.
That boundary is the subject of the next document,
[`./EXTERNAL_BENCHMARKING_BOUNDARY.md`](./EXTERNAL_BENCHMARKING_BOUNDARY.md), and this document
stays deliberately inside the own-data line. Everything here is **100% local, offline, and
copy-only**.

Two sentences bound everything that follows. They are stated in full because a benchmark is one
of the most persuasive artifacts Creative Intelligence produces, and persuasion is exactly where
the boundary must be loudest:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

A benchmark surfaces a fact — "this campaign beats the baseline you set" — and hands it to a
human. It never decides that the campaign should therefore ship, scale, or repeat. It ranks the
alternative against a reference and stops there.

---

## 2. Book E reads; it never measures

Before any baseline is described, one boundary has to be nailed down, because benchmarking is
the place where it is most tempting to break it.

**Book E produces no new data.** It does not run campaigns, it does not record impressions, it
does not compute a ROAS from raw spend and revenue. Every number a benchmark uses was already
measured and stored by the **Performance Memory** layer — Book D. Book E's job is **judgement**:
it takes Book D's aggregates and the shipped per-client rollup, arranges them into a comparison,
and presents the comparison honestly. That is the whole of it.

- **Book D = evidence.** "This client's last 12 campaigns averaged ROAS 2.4×" is a *measurement*.
- **Book E = judgement.** "This new campaign at ROAS 3.1× is above your own baseline" is a
  *comparison* over that measurement.

This is **Law 1 (Judgement Separation)** applied to benchmarking. The baseline is evidence; the
verdict "above" or "below" is judgement. Keeping the two apart is what lets a benchmark be
defended: the evidence is auditable in Book D, and the judgement is a single arithmetic step on
top of it.

The two documents Book E leans on directly here are:

- [`../../book-d/2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md`](../../book-d/2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md)
  — how Book D groups and aggregates performance into per-vertical figures. This is where a
  baseline comes from.
- [`../../book-d/5-performance-intelligence/EVIDENCE_ATTRIBUTION.md`](../../book-d/5-performance-intelligence/EVIDENCE_ATTRIBUTION.md)
  — how Book D attaches a sample size and confidence to any aggregate, so that a benchmark can
  carry its own evidential weight.

Book E never duplicates that machinery. It reads it.

---

## 3. The two internal baselines, honestly tiered

There are exactly two own-data baselines, and they sit at **different tiers of reality**. One is
live and shipping today. The other is written and tested but not yet reachable from the live app.
The table states the truth before the prose explains it.

| Baseline | The question it answers | Tier | Source |
|---|---|---|---|
| **Client's own history** | Is this campaign above or below *this client's* past average? | ✅ **SHIPPED** | Per-client mean ROAS, `apps/web/src/routes.ts:1461-1470` |
| **Agency per-vertical baseline** | Is this campaign above or below the *agency's* aggregate *in this client's sector*? | 🔶 **BUILT (UNWIRED)** | `brain.marketing(vertical)` → ROAS / CTR / sampleSize, consumed by `BrainEvidenceEngine`, `domains/executive-memory/src/reasoning.ts:25-33` |
| Agency-wide single number, sector average, global benchmark | How does this campaign compare to the whole industry? | ❌ **ROADMAP / out of scope** | No such data source exists; see the boundary document |

### 3.1 Client's own history — ✅ SHIPPED (the only live baseline)

This is the one benchmark in all of Book E that **runs in the live web app today**.

For a given client, the app collects that client's recorded ROAS values and computes their mean:
`avgRoas = reduce(...) / roasValues.length`, at `apps/web/src/routes.ts:1461-1470`. The result
is a single, honest number: **this client's own average return on ad spend across its own
history.** Nothing more, nothing less. It is arithmetic over data the agency already recorded for
that one client.

That makes it a real, shipping **"you vs your own past"** benchmark. When a new campaign for that
client lands, its ROAS can be set beside this mean, and the comparison is immediate and true:

- New campaign ROAS **above** the client's mean → this campaign is beating the client's own track
  record.
- New campaign ROAS **below** the client's mean → this campaign is under the client's own track
  record, and that is a flag worth a human's attention.

Because the baseline is *the client's own history*, it is automatically **same-class** in the
strongest possible sense — a client is only ever compared to itself. There is no risk of
comparing a finance advertiser to an e-commerce one, because the reference is that single
client's past. (Same-class comparison is the subject of §4; the per-client baseline satisfies it
for free.)

The value of this baseline is that it needs no new build to be useful. It is the concrete floor
under everything else in this document: the agency can already tell a client, from live data,
whether the latest work is above or below where that client has historically been.

### 3.2 Agency per-vertical baseline — 🔶 BUILT (UNWIRED)

The second baseline is more ambitious and one tier less real.

The Company Brain can produce a **per-vertical** performance summary: given a vertical
(the client's sector), `brain.marketing(vertical)` returns aggregate **ROAS**, **CTR**, and a
**sampleSize** — the number of campaigns that formed that aggregate. This is consumed by the
`BrainEvidenceEngine` at `domains/executive-memory/src/reasoning.ts:25-33`, which reads exactly
those three fields (ROAS, CTR, sample size) as evidence.

Wired to a client, this baseline answers a sharper question than §3.1 can: not just "how does
this campaign compare to *this client's* past," but **"how does this campaign compare to the
agency's aggregate performance across *all* its work in this client's sector?"** That is a
genuine **You vs Agency** benchmark — the campaign measured against the agency's own accumulated
book of work in the same vertical.

The honesty tag matters. This is **🔶 BUILT (UNWIRED)**: the aggregation exists, the evidence
engine that reads it exists, the sample-size field exists — but **`apps/web` never calls
`.marketing(`**. No live route reaches it. The machinery is written and dormant, exactly like the
rest of Book E's judgement primitives, which sit behind the live app's `LiveAIManager` path that
bypasses the runtime pipeline where this reasoning lives. Wiring `brain.marketing(vertical)` into
a benchmark route is the build. Until that wiring exists, this baseline is a design that is one
integration away, not a shipping feature — and this document will not pretend otherwise.

### 3.3 What does not exist

There is deliberately no row above these two that reads "the agency, as a single number" or
"the industry." No agency-wide aggregate across all verticals is offered, and no sector or global
average exists in the data at all. Those are **❌ ROADMAP / out of scope**, and the reason is not
laziness — it is the no-external-data boundary, covered in §7 and fully in the boundary document.
A benchmark is only as honest as the baseline behind it, and the only honest baselines the agency
owns are these two.

---

## 4. LAW — Benchmark Integrity: only same-class items compare

**Law 8 (Benchmark Integrity)** is the load-bearing law of this document:

> Only same-class items are compared. Finance ↔ Finance. E-commerce ↔ E-commerce. B2B ↔ B2B.
> A benchmark across different classes is **forbidden**.

The reason is that ROAS, CTR, and every other performance number carry the fingerprint of their
context. A 2.0× ROAS may be excellent in one sector and mediocre in another; a 1.5% CTR may be
strong for B2B and weak for consumer retail. Comparing a finance campaign's ROAS to an
e-commerce baseline is not a strict comparison — it is a category error dressed up as a number.
It produces a verdict that *looks* rigorous and *is* meaningless. Creative Intelligence must
never manufacture that kind of false confidence, because a false benchmark is worse than no
benchmark: it gives a client a number they will act on.

**The only real grouping key is the vertical.** That is not an arbitrary choice — it is the
grouping key Book D actually aggregates on. The per-vertical baseline of §3.2 is keyed on
vertical precisely because that is the axis along which Book D's performance data is grouped and
summarised. For the mechanics of that grouping — how campaigns are bucketed into a vertical and
aggregated into one figure — this document defers to
[`../../book-d/2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md`](../../book-d/2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md).
Book E does not invent a grouping; it consumes Book D's.

Concretely, Benchmark Integrity constrains both baselines:

- **Client's own history (§3.1)** satisfies the law trivially: a client is compared only to
  itself, which is the same class by definition.
- **Per-vertical baseline (§3.2)** satisfies the law by construction: `brain.marketing(vertical)`
  is *called with the client's own vertical*, so a finance client is measured against the
  agency's **finance** aggregate, never against its e-commerce or B2B aggregate. The vertical
  argument is what enforces same-class.

Any benchmark that would cross verticals — a finance client held up against an e-commerce
baseline "because it looked strong" — is **forbidden by law**, not merely discouraged. The
correct response when a same-vertical baseline does not exist is to **withhold the benchmark**,
not to substitute a different vertical's numbers.

---

## 5. LAW — Sample Size / Evidence: a benchmark carries its sample size

A baseline is only as trustworthy as the amount of history behind it. An "agency average ROAS"
computed from **3** campaigns is not the same claim as one computed from **300**, and a benchmark
that hides the difference is dishonest.

Therefore, **every benchmark carries its sample size** — how many campaigns formed the baseline —
and a **thin baseline is flagged**, never silently presented as authoritative.

This is not an aspiration bolted on by Book E; the plumbing is already present in the data:

- The per-vertical baseline returns **sampleSize** alongside ROAS and CTR
  (`domains/executive-memory/src/reasoning.ts:25-33`). The count travels with the numbers by
  design.
- Book D turns that count into a confidence weight. Evidence weighting and the sample-size
  discount live at `domains/executive-memory/src/reasoning.ts:29-51`, and
  `confidenceFromSample` at `domains/executive-memory/src/reasoning.ts:101` computes exactly
  this — `min(1, n / 100)`. A baseline built from fewer than 100 campaigns is scaled **down**
  toward zero confidence; only at 100+ does it reach full weight. A baseline of 3 campaigns
  carries roughly 3% of full confidence — mathematically flagged as thin, automatically.

So a benchmark is never just "you: 3.1×, agency: 2.4×." Honestly stated, it is "you: 3.1×,
agency: 2.4× **across 87 campaigns in this vertical**," and if that count were 4 instead of 87,
the benchmark would arrive **flagged as low-evidence** rather than presented as settled fact.

For the full treatment of how a sample size becomes a confidence signal and how evidence is
attributed to an aggregate, this document cross-references
[`../../book-d/5-performance-intelligence/EVIDENCE_ATTRIBUTION.md`](../../book-d/5-performance-intelligence/EVIDENCE_ATTRIBUTION.md).
The confidence rollup that would surface alongside a benchmark is itself deterministic —
`0.5·avgWeight + 0.2·breadth + 0.3·success` on a 0–100 scale
(`domains/executive-memory/src/reasoning.ts:82`) — so the *strength* of a benchmark is as
reproducible as the benchmark itself.

Tier note: the sample-size discipline is **🔶 BUILT (UNWIRED)**, riding on the same
`reasoning.ts` machinery as the per-vertical baseline it protects. The ✅ shipped per-client mean
of §3.1 carries an implicit sample size too — the length of that client's own ROAS history,
`roasValues.length` — which is visible in the same reduction that computes the mean.

---

## 6. LAW — Judgement is reproducible; a score is never an LLM opinion

Everything in this document is **arithmetic**. That is the point, and it is what makes a
benchmark defensible.

- The client's own baseline is a **mean**: `reduce(...) / roasValues.length`
  (`apps/web/src/routes.ts:1461-1470`). Sum the client's ROAS values, divide by their count.
  Given the same history, every machine produces the same number, every time.
- The per-vertical baseline is a **sample-weighted aggregate** of ROAS and CTR with an explicit
  count (`domains/executive-memory/src/reasoning.ts:25-33`), discounted by a fixed sample-size
  function (`reasoning.ts:101`).
- The verdict "above" or "below" is a single **comparison** of two numbers.

No language model is asked whether a campaign "feels" above baseline. There is no sampling, no
temperature, no momentary mood. This is **Law 2 (Judgement is Reproducible)** — *same evidence +
same rules + same heuristics = same result* — satisfied by construction, and it is the cleanest
possible illustration of **Law 3 (a score is never an LLM opinion)**. A benchmark is not an
opinion about performance; it is two averages and a comparison operator.

This reproducibility is exactly what lets the benchmark survive a client challenge. When a client
asks "how did you decide our campaign beat the baseline?", the answer is not "the model judged
it." The answer is: "here is your history, here is its mean, here is this campaign's ROAS, here
is the subtraction — and you can recompute all of it yourself." A benchmark you can hand over and
have the client reproduce is a benchmark that builds trust rather than spending it.

---

## 7. Boundaries — own data only

This document draws a hard line and stays inside it. The benchmarks described here use **the
agency's own data and nothing else**:

- **No vendor telemetry.** No usage data flows to or from any provider. The mean at
  `routes.ts:1461-1470` and the aggregate at `reasoning.ts:25-33` are computed locally from
  locally-held records.
- **No external benchmarks.** No sector average, no global industry figure, no third-party
  performance dataset is fetched, because none exists in the system and none may be ingested.
  External ingestion is not merely absent — it is forbidden by boundary: the `connector-hub` is
  events-only, exposing an event name (`domains/connector-hub/src/events.ts:11`) with no
  implementation behind it. There is no fetch, no HTTP, no scrape anywhere in the platform.
- **100% local, offline, copy-only.** A benchmark reads stored numbers on the machine it runs on.
  It never leaves the machine.

The consequence is deliberate: the agency can benchmark **You vs your own past** (✅) and, once
wired, **You vs the agency's own aggregate in your vertical** (🔶). It **cannot** benchmark
**You vs the industry**, because the industry's numbers are not the agency's data and cannot be
fetched. That is not a gap this document papers over — it is the whole reason the feasible half
of benchmarking is *this* half.

The full argument for that boundary — why sector and global benchmarking are ❌ ROADMAP / out of
scope, and the narrow conditions under which own-supplied data could ever change that — is the
subject of the sibling document
[`./EXTERNAL_BENCHMARKING_BOUNDARY.md`](./EXTERNAL_BENCHMARKING_BOUNDARY.md). This document ends
where the agency's own data ends.

---

## 8. A worked benchmark, end to end

To make the two baselines concrete, here is how a single campaign would be benchmarked with only
own data. Every number below is illustrative; every *step* is real arithmetic over the cited
sources.

A finance client, "Client A," has a new campaign that recorded a ROAS of **3.1×**.

**Step 1 — the client's own baseline (✅ SHIPPED).**
The app takes Client A's recorded ROAS history — say `[2.0, 2.4, 2.8, 2.4]` — and computes the
mean at `routes.ts:1461-1470`: `(2.0 + 2.4 + 2.8 + 2.4) / 4 = 2.4×`. The benchmark:
**this campaign at 3.1× is above Client A's own average of 2.4×**, across 4 prior campaigns.

**Step 2 — the agency's per-vertical baseline (🔶 BUILT-UNWIRED).**
If wired, `brain.marketing("finance")` returns the agency's finance aggregate — say ROAS **2.6×**
over a **sampleSize of 87** campaigns (`reasoning.ts:25-33`). The benchmark: **this campaign at
3.1× is above the agency's finance-wide average of 2.6×**, and the baseline is well-evidenced —
`confidenceFromSample(87) = min(1, 87/100) = 0.87` (`reasoning.ts:101`), so the comparison is
presented as strong, not tentative.

**Step 3 — Benchmark Integrity check (Law 8).**
Both baselines are finance baselines. Client A is finance. Same class. The comparison is
permitted. Had `brain.marketing` been called with a different vertical, the benchmark would be
**withheld**, not fudged.

**Step 4 — the honest presentation.**
"Client A's new campaign: ROAS 3.1×. Above your own history (2.4×, 4 campaigns). Above the
agency's finance baseline (2.6×, 87 campaigns, high confidence)." Two reference points, each
carrying its sample size, each recomputable by the client. No verdict beyond the comparison; the
human decides what to do with it.

Note what step 4 does **not** say: it does not say "therefore scale this campaign," and it does
not say "3.1× is good by industry standards" — the second because no industry figure exists, the
first because that is a human's call. The benchmark ranks the campaign against two own-data
references and stops.

---

## 9. Value contribution

Internal benchmarking is one of the most direct revenue and retention instruments in Book E,
and it is largely built on the one ✅ shipped baseline plus one 🔶 wiring step.

- **Retention (revenue defended).** Showing a client, from their own live data, that their latest
  work **beats their own historical average** is a concrete argument to keep the account. It is
  not a taste claim — it is the client's own numbers, recomputable by the client, demonstrating
  that the relationship is producing above the client's own track record. A benchmark the client
  can reproduce is a renewal conversation that defends itself.
- **Upsell (revenue grown).** Showing a client that their campaign **beats the agency's aggregate
  in their sector** — you are outperforming the agency's whole book of finance work — is a
  concrete upsell argument for more budget or more scope, backed by a sample-sized, same-class
  baseline rather than a sales pitch.
- **Production time (cost reduced).** A benchmark settles "is this good?" with two averages and a
  comparison instead of a meeting. The team stops debating performance by feel and reads it off a
  reproducible reference point, which is faster and does not burn the client's trust on a
  subjective claim.

Every one of these arguments is only as strong as its honesty. That is why the sample size
travels with the baseline (§5), why the class is enforced (§4), and why the whole thing is
arithmetic the client can redo (§6). A benchmark that a client can reproduce and cannot refute is
worth more than a flattering number they have to take on faith — and it is worth nothing at all
if it quietly crosses a vertical or leans on a baseline of three campaigns.

And the two sentences that bound the entire exercise apply hardest exactly here, at the moment a
benchmark is most persuasive:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

Beating a baseline is evidence, not destiny. A campaign above the agency's finance average may
still be the wrong direction for this client's next quarter, and that judgement belongs to a
human who can see what the numbers cannot. The benchmark ranks the campaign against the agency's
own past. The human decides where to go next.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
