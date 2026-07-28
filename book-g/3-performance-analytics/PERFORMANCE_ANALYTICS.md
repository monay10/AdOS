# Performance Analytics

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-execution-analytics/ANALYTICS_CONSTITUTION.md`](../1-execution-analytics/ANALYTICS_CONSTITUTION.md).
>
> **Laws:** *Analytics never influences execution directly · analytics never mutates · every
> metric has provenance · dashboard ≠ decision · same data, different views · analytics is
> immutable · every dashboard is derived · time is first-class · every visualization has data ·
> observability before optimization.*

---

## 1. What this document defines

This document defines the analytics that would sit **over the intelligence layers** — the
performance memory the platform records after each mission, and the recommendation, approval, and
revision behaviour that memory is supposed to inform. It specifies five metrics: **Memory Growth**,
**Evidence Coverage**, **Recommendation Usage**, **Approval Rate**, and **Revision Rate**. Each one
asks the same shape of question — *is the intelligence of the system accumulating, being used, and
being trusted over time?* — and each one answers it by **reading** what the core already recorded,
never by touching it.

It must be said plainly at the top: this is the most **roadmap-heavy** document in Book G. The
platform **writes** performance memory today — the learning flow at the end of a mission records a
campaign's outcome across the company's knowledge stores (`apps/web/src/routes.ts:1092`). But
nothing **reads that memory back** to compute how it is growing, how well recommendations are
backed by it, or how often the humans who see it approve or revise. The write side is real; the
**analytics side is not built**. Every metric below is therefore **❌ ROADMAP** unless a specific,
built record is cited, and the honest gap between "recorded" and "measured" is the subject of §11.

One sentence bounds everything this document specifies, and it is the reason performance analytics
can be defined at all without endangering the intelligence it observes:

> **Observability reveals reality; it never changes reality.**

A performance metric counts what the memory already holds. It does not add to the memory, weight it,
prune it, or feed a conclusion back into the layer that produced it. Measuring how often
recommendations are approved changes no recommendation. Measuring the revision rate revises nothing.
The entire document is a set of **read-only counts over records the core owns** — and where those
counts do not exist yet, it says so.

---

## 2. The material this document measures — and does not re-document

Performance analytics has no data of its own. Its raw material is produced by three other books,
each of which owns its subject and is referenced here **by link, never re-explained**:

- **Book D — Performance Memory.** The durable record of what campaigns did and what the company
  learned: campaign outcomes, discovered patterns, and the recommendation engine built on them. See
  [`../../book-d/README.md`](../../book-d/README.md). Book D **records**; this document would only
  count what it recorded.
- **Book C — Explainability.** The layer that grounds a recommendation in evidence and makes its
  reasoning inspectable. See [`../../book-c/README.md`](../../book-c/README.md). *Evidence Coverage*
  (§4) and *Recommendation Usage* (§5) measure the visible surface of what Book C produces; they do
  not redesign how a recommendation is grounded.
- **Book E — Optimization & Judgement.** The layer that scores, compares, and **suggests**. See
  [`../../book-e/README.md`](../../book-e/README.md). This is the critical boundary of the whole
  document: when the metrics below report an approval rate or a revision rate, they **report** it.
  The decision about what to *do* with that rate — whether to optimize, suggest a change, or act on
  a trend — belongs to Book E and to the human, never to this analytics layer (§9).

The five metrics this document specifies, and the honest tier each one carries, are:

| Metric | Question | Tier | Source that would feed it |
| --- | --- | --- | --- |
| **Memory Growth** (§3) | Is the memory getting bigger, per window? | ❌ ROADMAP | learning-flow write (`routes.ts:1092`); no read-back |
| **Evidence Coverage** (§4) | What share of recommendations are backed by ≥ N records? | ❌ ROADMAP | per-run `evidence` in the ExecutionTrace (🔶); no aggregation |
| **Recommendation Usage** (§5) | How often are grounded recommendations shown and taken? | ❌ ROADMAP | recommendations shown (`routes.ts:1080`); "taken" untracked |
| **Approval Rate** (§6) | What share of work is approved, per window? | ❌ ROADMAP | Final Outcome in the ExecutionTrace (🔶); no rate computed |
| **Revision Rate** (§7) | What share of work is revised, per window? | ❌ ROADMAP | Final Outcome in the ExecutionTrace (🔶); no rate computed |

The single fact that unifies these three is where the memory is **written**. At the close of a
mission, the learning flow (`routes.ts:1092`) records the campaign's outcome — its ROAS, ROI, and
CTR, its channel mix, and its vertical — across the Decision Journal, Executive Memory, and the
Company Brain's experience, pattern, and knowledge-graph stores. That write is genuine and shipped.
Everything this document specifies is analytics that would **read those same stores back** — and
that read-back is what does not exist yet.

---

## 3. Memory Growth — records accumulated over time (❌ ROADMAP)

**Memory Growth** asks the simplest performance question there is: *is the company's memory getting
bigger?* Concretely — how many campaign experiences, patterns, journal entries, and executive
memories has the system accumulated, and how fast is that count rising over a window (last 7 days,
last 30 days, this quarter, this year, lifetime)?

**What exists.** The write that would feed this metric is real. Every completed mission appends to
the memory: an experience record, a captured pattern, knowledge-graph nodes and relations, an
executive-memory entry, and a decision-journal entry (`routes.ts:1092`). Records genuinely
accumulate as missions complete.

**What is missing (❌).** Nothing counts them. There is no aggregation that reads the stores and
reports "N experiences, M patterns, up X% over the last 30 days." Two facts make this ❌ rather than
merely unbuilt-but-close:

- **No read-back exists.** The learning flow only ever *writes*. No analytics path lists the stores
  to size them, and no snapshot of the count over time is captured.
- **The stores are volatile and in-memory.** They are held in process, so today there is no durable
  history to bucket a growth curve against — a growth series needs points recorded *over time*, and
  the substrate that would retain those points across restarts is not in place.

Memory Growth is therefore a **contract**, not a chart: the shape of the metric (a monotonic count
per store, sampled per window) is defined here, but no code computes it. No citation is given,
because there is nothing built to cite.

---

## 4. Evidence Coverage — recommendations backed by ≥ N records (❌ ROADMAP; source record 🔶)

**Evidence Coverage** measures how well the intelligence is *grounded*: of the recommendations the
system makes, what share are backed by at least **N** underlying memory records — enough prior
campaigns, patterns, or evidence to make the recommendation more than a guess? A recommendation
standing on one data point and one standing on fifty are not equally trustworthy, and coverage is
the metric that would tell them apart, tracked across a window.

**What the source record looks like (🔶 BUILT (UNWIRED)).** The governed runtime already models the
evidence a run consulted. The **ExecutionTrace**, assembled by the **TraceBuilder**
(`packages/ai-manager/src/runtime/kernel.ts:124`, `:204`, `:241`), holds an `evidence` field — a
read-only reference record of which Book D evidence a run used. That is exactly the per-run input a
coverage metric needs: count the evidence references behind each recommendation, and coverage falls
out. But the trace is **🔶 BUILT (UNWIRED)** — it is never produced on a live run, because the web
app never drives the governed execution path that seals it. The record where coverage *would* be
read exists in code and in tests; it does not exist on the runs a user actually triggers.

**What is missing (❌).** Even where evidence is recorded, nothing aggregates it into a coverage
share. There is no computation that (a) enumerates recommendations, (b) counts the memory records
behind each, and (c) reports the fraction meeting a threshold over a window. The threshold **N**
itself is a policy this metric would *report against*, not decide. Evidence Coverage is **❌** live:
the grounding is designed (Book C), the per-run evidence reference is built-unwired (🔶), and the
aggregation that turns those into a coverage percentage is not built at all.

---

## 5. Recommendation Usage — how often grounded recommendations are shown and taken (❌ ROADMAP)

**Recommendation Usage** measures the *reach* of the intelligence: how often is an evidence-based
recommendation actually surfaced to a human, and how often, once surfaced, is it taken? A memory
that compounds but is never consulted is a cost with no return; usage is the metric that would show
whether the recommendation layer is earning its place.

**What exists.** Recommendations are produced and shown today — a mission's analytics report carries
narrative recommendations that flow into the mission surface (`routes.ts:1080`). So the *shown* half
of usage has a real, live source of events to draw on.

**What is missing (❌).** Nothing counts the shown-versus-taken relationship:

- **Shown is not tallied.** Recommendations render, but no metric accumulates *how many* were shown
  per window, per vertical, or per client.
- **Taken is not tracked at all.** There is no signal recording that a human acted on a specific
  recommendation. Without a "taken" event there is no ratio to compute, so the core of the
  metric — the take-rate — has no data behind it.

Recommendation Usage is **❌ ROADMAP**. Defining it here fixes its shape (shown count and take-rate,
per window); it does not imply either number is available.

---

## 6. Approval Rate — the share of work a human approves (❌ ROADMAP)

**Approval Rate** measures trust: of the outputs presented at the human gate, what share are
**approved** without change, over a window? A rising approval rate suggests the intelligence is
converging on what the human wants; a falling one is a signal worth a human's attention — but the
*signal* is all this metric produces.

**What the source record looks like (🔶 BUILT (UNWIRED)).** The governed run's sealed **Final
Outcome** distinguishes how a run ended — approved, revised, or failed — and that outcome is part of
the ExecutionTrace (`kernel.ts:124`, `:204`, `:241`). At the mission level, the mission state
machine likewise records approvals and failures. So the raw approve/revise/fail signal is modelled;
the run-level version is **🔶** (never produced live), and the mission-level version leaves only
individual outcomes, not a computed rate.

**What is missing (❌).** No code turns those individual outcomes into a rate over time. There is no
aggregation that reads the outcomes, buckets them per window, and reports "X% approved this
quarter." Approval Rate is **❌** live: outcomes are recorded per run or per mission, but the *rate*
— the whole point of the metric — is not computed anywhere. And, critically, this metric never
carries a target. It reports the approval rate; it never says the rate should be higher (§9).

---

## 7. Revision Rate — the share of work sent back for change (❌ ROADMAP)

**Revision Rate** is Approval Rate's complement: of the outputs presented at the human gate, what
share are **sent back for revision** rather than approved, over a window? It is the same underlying
outcome record read from the other side.

**What the source record looks like (🔶 BUILT (UNWIRED)).** The `revised` outcome is the same sealed
Final Outcome discussed in §6 — carried by the ExecutionTrace (`kernel.ts:124`, `:204`, `:241`,
🔶) at the run level and by the mission state machine at the mission level. The signal that a run
was revised exists in the model; it is not produced on live runs, and it is not aggregated.

**What is missing (❌).** As with approval, no computation reads revisions and reports a rate per
window. Revision Rate is **❌** live.

The discipline this metric demands is the sharpest test of the whole document. A revision rate is
exactly the kind of number a system is tempted to *act on* — "revisions are up, so revise earlier,"
"revisions are up, so lower the bar." This document does **neither**. It reports the revision rate
and stops. What a rising revision rate *means*, and what if anything to change because of it, is a
judgement — and judgement is Book E's and the human's, not this analytics layer's (§9). A revision
rate that triggered a change would be a revision rate that decided, and this layer does not decide.

---

## 8. Time is First-Class — every performance metric is a time-series (Law 7)

Not one of the five metrics above is a single number. Each is a **series over a window**, and the
window is part of the metric, never an afterthought.

> **LAW 7 — Time is First-Class.** Every metric MUST carry a time context — Last 7 Days / Last 30
> Days / Quarter / Year / Lifetime. No number is ever shown without its time window.

Applied here, the law reads directly off the metrics:

| Metric | The question time turns it into |
| --- | --- |
| **Memory Growth** | *How much did the memory grow over the last 7 / 30 days, quarter, year, lifetime?* |
| **Evidence Coverage** | *Is coverage rising or falling window over window?* |
| **Recommendation Usage** | *Is the take-rate trending up this quarter versus last?* |
| **Approval Rate** | *Is approval converging over the year, or is this month an outlier?* |
| **Revision Rate** | *Is the revision rate stable, or moving — and over what span?* |

Every one of these is a *growth* or *trend* question, and a growth question is meaningless without a
clock. A memory-growth figure with no window is not a metric; it is a number.

**Tier note (❌).** Live time-bucketing does not exist. Today's reports are per-campaign and
per-client snapshots, not series bucketed into 7d / 30d / quarter / year / lifetime windows, and the
volatile in-memory stores retain no durable history to bucket against (§3). So the time dimension
that Law 7 makes mandatory is, for every metric in this document, **❌ ROADMAP** — which is one more
reason none of these metrics can be presented as shipped: even if the counts existed, the windows to
place them in do not.

---

## 9. The law this document owns — Observability Before Optimization (Law 9)

Every content document in Book G answers to one law more than the others, and for performance
analytics it is Law 9. It is also the law this document is most in danger of breaking, because the
metrics it defines — approval, revision, coverage, usage — are precisely the numbers an ambitious
system would try to *improve automatically*.

> **LAW 9 — Observability Before Optimization.** Book G ONLY observes — it shows, measures,
> compares. It NEVER says "change this." Optimization suggestions remain Book E's domain.

The discipline in practice:

- **This layer reports rates; it never sets targets.** "Approval rate is 72% this quarter" is an
  observation and is allowed. "Approval rate should be 90%, approve faster" is a decision and is
  **forbidden here**. The number is offered; the goal is not.
- **This layer measures revision; it never prescribes it.** It will report that the revision rate
  moved. It will never conclude "revise more," "revise earlier," or "lower the review threshold."
  Those are optimizations, and optimization is out of scope by law.
- **The judgement belongs to Book E and the human.** When a trend in these metrics warrants an
  action, the action is decided by [`../../book-e/README.md`](../../book-e/README.md) — the layer
  that scores, compares, and suggests — and ratified by a human. This document hands Book E a clean
  measurement and stops at the boundary. It does not redesign Book E, and it does not borrow its
  authority to decide.

The reason the line is drawn exactly here is the invariant. A metric that told the intelligence
layer to change would be a metric that *changed reality* — it would close a loop from analytics back
into execution, and that loop is precisely what the foundational law forbids. Performance analytics
measures the intelligence layers **without deciding for them**.

> **Observability reveals reality; it never changes reality.**

---

## 10. Measuring the intelligence never mutates it (Law 1 / foundational)

Law 9 keeps this document from *prescribing*; Law 1 keeps it from *touching*.

> **LAW 1 — Analytics Never Mutates.** Analytics is read-only with respect to all core state —
> Mission, Evidence, Memory, Creative, Journal. Generating a report artifact is not mutating
> execution state.

For performance analytics this is unusually pointed, because the material being measured is the
**memory** and the **missions** themselves — the two things most sensitive to accidental change:

- **Counting the memory does not grow it.** Memory Growth (§3) would *read* the stores to size them.
  The only thing that ever writes to those stores is the learning flow at mission close
  (`routes.ts:1092`) — an execution-state write that sits **outside** analytics entirely. An
  analytics count adds no record; it observes the records the core wrote.
- **Measuring approval and revision does not change a mission.** Approval Rate (§6) and Revision
  Rate (§7) read the outcomes of missions; they never approve, revise, complete, or reopen one. A
  mission's state is changed only by the human at the gate and the flows the core owns — never by
  the act of tallying how those states came out.
- **Reading evidence coverage does not alter evidence.** Evidence Coverage (§4) counts references to
  Book D evidence; it never edits, reweights, or prunes the evidence it counts. The trace holds
  evidence as a read-only reference precisely so that observing it cannot change it.

The rule is absolute and it is the same rule the whole book runs on: **measuring approval or revision
rate never changes a mission or the memory.** The five metrics are a mirror held up to the
intelligence layers. A mirror reflects; it does not reach in.

---

## 11. The honest gap — the memory is written, never read back

This document owes the reader one plain statement, and here it is: **AdOS records performance memory
today, and reads none of it back for analytics.**

The write is real and shipped. The learning flow (`routes.ts:1092`) genuinely appends a campaign's
outcome — its ROAS, ROI, CTR, channels, and vertical — to the Decision Journal, Executive Memory,
and the Company Brain after each mission. Records accumulate. The company's memory does compound in
the narrow sense that more is written to it over time.

What does not exist is the entire **read** half:

- **No aggregation layer.** Nothing lists the stores, sizes them, or computes Memory Growth,
  Evidence Coverage, Recommendation Usage, Approval Rate, or Revision Rate. There is no code to cite
  for any of the five, which is why none of them carries a citation.
- **No durable history to trend against.** The stores are volatile and in-process, and the reports
  that render today are per-campaign and per-client snapshots, not time-bucketed series. Even the
  counts that could be taken cannot yet be placed on a 7d / 30d / quarter / year / lifetime axis
  (§8).
- **The richest source is unwired.** The record that would supply per-run evidence and per-run
  outcomes — the ExecutionTrace (`kernel.ts:124`, `:204`, `:241`) — is **🔶 BUILT (UNWIRED)** and
  never produced on a live run, so even the built machinery does not feed a live metric.

Naming this precisely is the design being honest about its status, not a weakness in it. Book D's
memory is a genuine, shipped write; Book C's grounding and Book E's judgement are real layers. What
Book G is missing at this part is the **read-back and aggregation** that turns a growing pile of
records into a measured performance story. Until that layer exists, the accurate statement is exactly
this one: **performance memory is recorded; performance analytics over it is roadmap.**

---

## 12. Boundaries — local, own-data-only, no vendor telemetry

Every metric this document specifies holds inside the platform's inherited boundaries, and on the
performance-analytics path they matter especially, because this is where a careless system would
ship its most revealing data off-device:

- **100% local, offline-first.** Any Memory Growth count, coverage share, usage ratio, or
  approval/revision rate would be computed on the local machine from the agency's own memory stores.
  Nothing about these metrics requires a network, and nothing about them reaches for one.
- **No vendor telemetry.** These are the sharpest metrics to keep home. An approval rate, a revision
  rate, or a memory-growth curve is a portrait of how an agency works and how much it trusts its own
  system. None of it is transmitted to a model provider, an analytics service, or any external
  endpoint. Analytics here is the opposite of telemetry: telemetry sends your performance to someone
  else; AdOS keeps the record of your performance entirely with you.
- **Own data only, copy-only, read-only.** Every metric reads the agency's own memory and its own
  mission outcomes, as read-only counts, and pulls in no external data to enrich them. Observing the
  memory neither writes to it nor reaches outside it (§10).
- **Human-sovereign.** These metrics inform; they never decide. Approval and revision are the
  human's calls, recorded — not the analytics layer's calls, made. What a trend means and what to do
  about it stays with the human and Book E (§9).

The one-line boundary: **performance analytics makes an agency's own intelligence visible to that
agency and to no one else.**

---

## 13. Value contribution

Performance analytics maps to both value levers — but honestly, because most of it is roadmap, the
contribution is stated as what the metrics *would* unlock and why the seam is worth building.

**It grows agency revenue by making the compounding of intelligence provable.** The core promise of
a Campaign Intelligence Engine is that it gets better as it runs — that the memory compounds and the
recommendations sharpen. An enterprise buyer does not take that on faith; they ask to see it.
Memory Growth, Evidence Coverage, and Recommendation Usage are the metrics that would *demonstrate*
the compounding — records rising, recommendations increasingly well-grounded, and grounded advice
actually being taken. A platform that can show its intelligence accumulating is a platform an agency
can sell its own clients on; one that merely asserts it is a slide.

**It cuts production time by turning trust into a number an agency can watch.** Approval Rate and
Revision Rate are, in effect, a measure of rework. A rising revision rate is production time being
spent twice; a rising approval rate is work that ships first time. Surfacing these as observed trends
— without prescribing a response — gives an agency the earliest possible signal that something in the
pipeline has drifted, so a human can investigate before the cost compounds across a book of missions.
The metric does not fix the drift; it makes the drift *visible* early enough that fixing it is cheap.

The through-line to both levers is the same discipline that makes the metrics safe to build at all:
they **report** the state of the intelligence layers and leave every decision to the layers that own
it. The write already exists (`routes.ts:1092`); the value is unlocked the day the read-back and
aggregation are built on top of it — a measurement seam that observes the compounding without ever
reaching into it.

> **Observability reveals reality; it never changes reality.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
