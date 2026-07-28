# Pipeline Analytics

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`ANALYTICS_CONSTITUTION.md`](ANALYTICS_CONSTITUTION.md).
>
> **Laws:** *Analytics never influences execution directly · analytics never mutates · every
> metric has provenance · dashboard ≠ decision · same data, different views · analytics is
> immutable · every dashboard is derived · time is first-class · every visualization has data ·
> observability before optimization.*

---

## 1. What this document defines

This document defines how the **orchestration pipeline** is made observable *as a process over
time* — how the stages a run executed, how long each took, how often stages retried, how often
runs failed, and how often a human approved, are read back from the record the core produces and
turned into pipeline metrics. It is Part 1 of Book G's execution-analytics stream, and it answers
one family of questions: *is the pipeline healthy, and is it getting slower, flakier, or more
often blocked at the human gate than it used to be?*

Pipeline analytics does exactly one thing with the pipeline: it **watches** it. It reads the run
record; it renders stage durations, retry counts, failure rates, and approval rates; and it
stops. It never re-routes a run, never retries a failed stage, never adjusts a timeout, never
approves anything to keep a chart tidy. The pipeline is Book F's engine; this document is a
window onto that engine, cut from the outside, that lets no light back in. One sentence bounds
the entire exercise, and it is stated here in full because it is the boundary of everything that
follows:

> **Observability reveals reality; it never changes reality.**

A pipeline metric is a reading taken off a run that already happened. The reading changes nothing
about the run it read — a run that took nine seconds took nine seconds whether or not anyone ever
charts it, and charting it does not make the next run faster. This document draws a hard, honest
line down the middle of the product, because pipeline observability in this platform is split
cleanly across tiers: a **rich, full-pipeline record exists but is never produced live**, and a
**thin band of pipeline signal is visible live today** through the event feed. Both halves are
stated precisely, and the gap between them is named rather than hidden.

---

## 2. The raw material — Book F's ExecutionTrace / TraceBuilder (🔶 BUILT (UNWIRED))

Pipeline analytics has exactly one ideal input: the run record Book F is designed to produce.
That record is the **ExecutionTrace**, assembled by a **TraceBuilder** as the governed pipeline
runs, sealed at the end, and returned from the run. Its machinery is real, tested code —
`packages/ai-manager/src/runtime/kernel.ts:124` (the trace shape),
`packages/ai-manager/src/runtime/kernel.ts:204` (the builder that accumulates the run), and
`packages/ai-manager/src/runtime/kernel.ts:241` (the seal that freezes it). It is precisely the
substrate a pipeline-analytics view wants, because it records the three things pipeline analytics
is made of:

- **Stages executed, in order.** The per-stage breakdown is what turns a run from an opaque
  success/failure into a sequence a stage-level view can walk. *Which stages ran?* is answered
  by the trace, not guessed.
- **Evidence used.** The Book D evidence the run consulted, held as a reference record. Pipeline
  analytics does not re-open the evidence; it counts *that* the stage consulted it.
- **Duration.** The raw material of every latency, throughput, and stage-timing view this
  document would build. A pipeline metric that says "the scoring stage is trending slower" is a
  statement about durations, and durations live in the trace.

The trace is **sealed** the moment the run ends (`kernel.ts:241`): frozen, made immutable, and
returned. This matters to analytics more than anywhere else, because it is the guarantee that
reading the record cannot rewrite it. A pipeline metric computed from a sealed trace is a
photograph of a photograph — the reading cannot reach back and alter the run it read. Analytics
recomputes *from* the sealed record; it never edits the record, and the seal is what makes that
structural rather than merely polite.

It is worth being precise about *how* each pipeline question would map onto the trace, because the
mapping is what makes the ❌-live claims below exact rather than vague. A stage-duration view reads
the per-stage timing captured in the trace's step breakdown (`kernel.ts:124`); a stage-sequence
view reads the ordered steps directly; an evidence-utilisation view reads the evidence references
the run recorded; and a failure/approval view reads the run's final outcome and the human decision
it journalled. None of these is a computation the analytics layer would have to invent — each is a
field the trace already holds, waiting to be read. That is exactly why the honest bottleneck is not
the analytics layer's design but the fact that the record itself is never produced live: the reader
is ready; the record is missing.

> **Tier note.** The ExecutionTrace is **🔶 BUILT (UNWIRED)**. The TraceBuilder is real code
> (`kernel.ts:204`), the fields are real fields (`kernel.ts:124`), and the seal-and-return path
> is real and tested (`kernel.ts:241`). But the trace is **never produced live**, for one blunt
> reason: the web app never calls the governed execute path that assembles and returns it. That
> path runs only inside the walking-skeleton test that drives the whole governed pipeline end to
> end. So the record that would make *full* pipeline analytics possible exists, is exercised in
> tests, and is not produced on the runs a user actually triggers.

The consequence for this document is exact and unavoidable: **stage durations and retry counts
are ❌ live**, because the only place they are recorded is a trace that is never produced live.
This is not a missing capability in the analytics layer — the analytics layer would read
durations and retries straight off the trace the moment the trace were produced. It is a wiring
gap upstream, in Book F, and it is named here rather than papered over. The rich pipeline record
is built; it is not yet the live record.

> **Series 2 · Sprint 4.1 update (2026-07-28) — the trace is now produced live (partial ✅).**
> A `TracingAIManager` decorator (`apps/web/src/ai-tracing.ts`) now wraps the AI Manager at the
> composition root (`app.ts:78`), so **every** live AI task — brief, creative, campaign,
> analytics, executive — seals a real `ExecutionTrace` into a tenant-scoped store
> (`execution-trace-store.ts`), surfaced at **`/traces`** (`views/pages.ts` `tracesPage`) and
> covered by `execution-trace.test.ts`. What is **now ✅ live:** *that a trace exists per task*,
> its capability, prompt ref, model/engine, token usage, **latency**, mission correlation, and an
> honest step list (`received → inference → completed`/`failed`). What is **still ❌ live:** the
> governed multi-stage internals — per-stage durations across evidence/confidence/route/validate/
> constitution, retry counts, and the decision-journal id — because those stages only run inside
> the governed `execute()` path, which is **still not the live engine**. Slice 4.1 deliberately
> changed nothing about generation; wiring the governed pipeline as the engine (so those inner
> stages populate the trace) is **Sprint 4.3**. The rows in §5 that read "trace not produced live"
> are, as of 4.1, produced live for the *outer* record; the *inner governed stages* remain 🔶/❌.

> **Series 2 · Sprint 4.2 update (2026-07-28) — a real Stage Engine now runs live (partial ✅).**
> `StagedAIManager` (`apps/web/src/staged-ai-manager.ts`) drives a real ordered `StageEngine`
> (`apps/web/src/stage-engine.ts`) around every live AI task: **`plan`** (placeholder) →
> **`safety.input`** (the real `RegexSafetyEngine`, `safety-engine.ts:33`) → **`route`** (the real
> `CapabilityRouter`, `capability-router.ts:11`, over the seeded `InMemoryModelRegistry`) →
> **`inference`** (still the wrapped LiveAIManager/offline manager) → **`safety.output`** (real
> inspection). Each stage records its **own** trace step, so **"which stages ran, in what order"**
> is **now ✅ live** for this subset, and **stage-level failures are recorded** (an inspection stage
> that throws is caught and written as `{ ok:false, error }` — it can never break generation). What
> is **still ❌ live:** the *governed* inner stages (evidence, confidence, constitution, decision
> journal), per-stage **durations** and **retry counts** inside the governed inference loop, and any
> **enforcement** — the safety and route stages here are **observe-only** (they inspect and record;
> they do not block, and the `route` decision is recorded but the request is still served by the
> wrapped manager). Generation stayed byte-for-byte unchanged in 4.2 by construction. Turning these
> observe-only stages into the deciding, enforcing governed engine is **Sprint 4.3**.

> **Series 2 · Sprint 5 (first live analytics) update (2026-07-28) — governance metrics over live traces.**
> The AI Traces view (`/traces`) now leads with **aggregate governance analytics computed purely from
> the live `ExecutionTrace`s** (`apps/web/src/governance-metrics.ts` → `governanceMetrics`): evidence
> coverage %, no-evidence rate %, constitution pass rate %, mean confidence, a 20-point confidence
> histogram, mean latency, and warnings ranked by capability. This is the **first serious 🔶→✅** for
> this book's analytics tier — real questions ("how often is output ungrounded? what is the confidence
> distribution?") answered from data the pipeline actually produced, not from tests. It is deliberately
> **measurement before enforcement**: these numbers are the inputs the later evidence-required /
> confidence-threshold rungs must set their cutoffs from. Still ❌ here: **stage-duration** and
> **retry** analytics inside a multi-model inference *loop* (the offline path serves in one call, so no
> retries yet), and dedicated dashboards (revision/approval funnels, execution timeline) — later slices.

> **Series 2 · Sprint 5 (completion) update (2026-07-28) — the four remaining dashboards land.**
> The `/traces` view now carries four more analytics, all computed from data the pipeline actually
> produced: **(1) approval/override funnel** (`governance-decisions.ts` → `approvalFunnel`) — approvals,
> flagged, overrides, override rate %, the direct signal that gates the hard-enforcement rungs;
> **(2) review duration** (`reviewStats`) — mean/P50/P95 and per-capability review latency, captured at
> `gateApprove` as the real wall-clock gap from the reviewed artifact's trace `finishedAt` to approval
> (unmatched decisions honestly excluded, not zero-filled); **(3) revision funnel** (`revision-funnel.ts`
> → `revisionFunnel`) — created → needed-revision → total revisions → completed + revision rate %, read
> from each mission's `revisionCount`/`status` (the Sprint 2 non-destructive loop's real state);
> **(4) stage latency / execution timeline** (`stage-latency.ts` → `stageLatency`) — per-stage mean as the
> gap between consecutive trace-step timestamps, kept in execution order, so the §5 rows "which stages
> ran, in what order?" and "how long did each stage take?" move **🔶→✅** for the *outer* record.
> **Honest note:** on the offline/deterministic path the whole pipeline runs sub-millisecond, so latency
> and review-duration read near-zero — truthfully; the identical computation yields real numbers on the
> live (local-model) path where inference dominates. Still ❌: **retry-rate** analytics (needs a
> multi-model inference *loop* that actually retries — no retries on the offline path yet).

> **Series 2 · Sprint 4.3 (observe ladder) update (2026-07-28) — governance now runs live, observed.**
> The stage engine's post-generation `governance.observe` stage (`apps/web/src/stage-engine.ts`)
> now runs the REAL grounding + governance chain on every live AI task: **`evidence`** (the real
> `BrainEvidenceEngine`, `executive-memory/.../reasoning.ts:14`, reading the Company Brain's
> per-vertical marketing memory — the same store Sprint 3 writes) → **`confidence`** (the real
> `HeuristicConfidenceEngine`, `reasoning.ts:62`) → **`constitution`** (the real
> `ConstitutionChecker`, `governance.ts:23`). So **"was the output grounded? how confident? would it
> pass the constitution?"** is **now ✅ live** as a *recorded* fact: the trace carries real
> `evidence`, a real `confidence`, and a `constitution` step with `passed`/`violations`, tagged
> `observed:true, enforced:false`. A grounded campaign shows real `marketing_brain` evidence and a
> higher score; a first ungrounded campaign honestly records `no_evidence`. What is **still ❌ live:**
> any **enforcement** — the constitution verdict is recorded, never acted on; a failing verdict does
> not block. Per-stage **durations** and **retries** inside a governed inference *loop* remain ❌
> (generation is still the single wrapped call, not the multi-model governed loop). Flipping each
> observed stage to enforce is a separate mini-sprint on the observe→enforce ladder.

---

## 3. The operational monitoring hook — MonitoringPort.recordInference (🔶 BUILT (UNWIRED))

Alongside the trace, the governed runtime carries a second, narrower observability seam meant for
operational readings off the pipeline: the **MonitoringPort**. Its contract declares a
`recordInference` capability (`packages/ai-manager/src/ports.ts:160-161`) — the hook a run calls
to record that an inference happened and what it cost operationally. It is invoked from the
manager's execute path at `packages/ai-manager/src/runtime/manager.ts:304`, and a working
implementation exists as `InMemoryMonitoring` (`packages/ai-manager/src/runtime/monitoring.ts:31-39`).

Where the ExecutionTrace is the *whole-run* record, the MonitoringPort is the *per-inference*
signal — the fine-grained operational pulse a pipeline-health view would sample to answer "how is
the pipeline performing right now, call by call?" The two are complementary: the trace tells the
story of one run end to end; the monitoring hook emits a stream of operational readings as the
run proceeds.

> **Tier note.** The MonitoringPort is **🔶 BUILT (UNWIRED)**. The port is a real contract
> (`ports.ts:160-161`), the call site is real (`manager.ts:304`), and the in-memory recorder is
> real and tested (`monitoring.ts:31-39`). But like the trace, it is fed **only** by the governed
> execute path, and the web app never calls that path. So `recordInference` fires only in tests.
> The operational pulse it would give pipeline analytics is real machinery producing no live
> readings.

The honest reading of §2 and §3 together: the platform contains *both* the whole-run record and
the per-inference operational stream a mature pipeline-analytics surface would need — and neither
is produced live, because both hang off the same governed execute path the live app does not
call. The design target is complete; the live feed is empty.

The two hooks are not redundant, and it is worth saying why pipeline analytics would want both.
The trace answers *retrospective, whole-run* questions — "how did run #4127 unfold, stage by
stage, and how long did each stage take?" — and it answers them once, at the end, from a single
sealed object. The MonitoringPort answers *continuous, per-call* questions — "across the last
hundred inferences, what is the operational shape of the pipeline right now?" — and it answers
them as a stream, one reading per inference, accumulating in the recorder (`monitoring.ts:31-39`).
A stage-duration histogram is a trace question; a live throughput pulse is a monitoring question.
A complete pipeline-analytics surface reads both seams, which is why this document names both even
though today both are dark on the live path.

---

## 4. What IS visible today — approvals and failures through the live event feed (partial ✅)

Not all pipeline signal is dark. A genuine, live, wired band of it reaches a user today — not
through the trace and not through the monitoring hook, but through the running **event / activity
feed** the application actually ships.

A wildcard `'>'` subscription listens to *every* event the running system publishes and feeds a
bounded, **fifty-entry** activity feed plus an audit trail
(`apps/web/src/app.ts:118-129`); the dashboard surfaces this stream through `recentEvents`
(`apps/web/src/app.ts:132-135`). Two properties of that feed carry the live pipeline signal:

- **It is wildcard.** The feed does not subscribe to a hand-picked list; it takes *all* events
  the shipped services emit. So whenever the live workflow moves a mission through its state
  machine — a mission advancing, a decision being taken at the human gate, a step ending in
  failure — that transition appears in the feed with no extra wiring. Mission-state **approvals**
  and **failures** are therefore observable today: the moment they happen, they show up.
- **It is bounded to fifty.** The feed keeps the most recent fifty entries and no more. On a
  local, offline-first machine this is a deliberate *recent-activity window*, not a limitation to
  apologise for — it is what the pipeline has just been doing, kept small on purpose.

So the live tier of pipeline analytics is real but partial (**partial ✅**): a user can see, right
now, that missions are being approved and that steps are failing, because those transitions flow
through the shipped feed (`app.ts:118-129`, `app.ts:132-135`). What a user *cannot* see live is
everything that requires the trace:

- **Stage durations — ❌ live.** How long each stage took is recorded only in the ExecutionTrace
  (`kernel.ts`), which is never produced live (§2). The event feed marks *that* a transition
  happened, not *how long* the stage that caused it ran.
- **Retries — ❌ live.** Retry counts per stage are, again, a trace-level fact. The feed shows a
  failure when it surfaces; it does not carry a per-stage retry tally, because that tally lives in
  a record no live run produces.
- **Rates over time — ❌ live.** The feed is a fifty-entry window of *recent* events, not a
  time-bucketed history. It can show that a failure just happened; it cannot, on its own, tell you
  the failure rate over the last thirty days (see §6).

The picture is split cleanly: **approvals and failures are visible live** as they occur through
the shipped feed (partial ✅), and **stage durations, retries, and time-bucketed rates are not**
(❌ live), because they depend on the trace and the monitoring hook that no live run produces.

---

## 5. The four pipeline questions, tier by tier

Pipeline analytics is, in the end, four questions asked of the run record. Stating each one with
its honest tier is the clearest summary this document can give:

| Pipeline question | Ideal source | Live today? | Tier |
| --- | --- | --- | --- |
| **Which stages ran, in what order?** | ExecutionTrace `steps` (`kernel.ts:124`) | **Yes** — Stage Engine produces the trace live; `stageLatency` reads it in order (Sprint 4.1 + 5) | ✅ |
| **How long did each stage take?** (stage durations) | ExecutionTrace step timestamps (`kernel.ts:124`) | **Yes** — `stage-latency.ts` computes per-stage mean from consecutive step gaps (Sprint 5); near-zero on the sub-ms offline path, real on live | ✅ (outer record) |
| **How often did stages retry?** (retry rate) | ExecutionTrace + MonitoringPort (`ports.ts:160-161`) | No — needs a multi-model inference loop that retries (offline serves in one call) | 🔶 built / ❌ live |
| **How often did runs fail?** (failure rate) | ExecutionTrace outcome; live *events* via feed | Partly — failures visible as events (`app.ts:118-129`); rate-over-time not | partial ✅ / ❌ rate |
| **How often did a human approve?** (approval rate) | ExecutionTrace decisions; live *events* via feed | Partly — approvals visible as events (`app.ts:118-129`); rate-over-time not | partial ✅ / ❌ rate |

Two honest patterns fall out of the table. First, **every rich, per-stage, time-series pipeline
metric is 🔶/❌** — built as machinery, not produced live — because it needs a record no live run
emits. Second, the **discrete transitions that a human cares about most — an approval, a failure —
are partly ✅**, because they ride the shipped event feed even without the trace. The occurrence is
live; the *rate* is not. A user can see that a failure happened today; the platform cannot yet
show that failures are trending up across the quarter, because that requires the trace *and* a
time window (§6).

The distinction between an **occurrence** and a **rate** is the single most important honesty in
this document, so it is worth isolating. An occurrence is a discrete fact — *this run was
approved*, *this step failed* — and the shipped event feed carries occurrences live, because a
transition publishes an event the instant it happens (`app.ts:118-129`). A rate is an aggregate
over a population of runs across a window — *42% of runs this month were approved on first pass*,
*the failure rate rose from 3% to 7% this quarter*. A rate cannot be read off a fifty-entry
recent-activity window; it needs a timestamped history of runs to aggregate, and that history is
the trace, produced per run and never produced live (§2). This is why the same phenomenon —
approval, failure — sits in two tiers at once in the table: its *occurrence* is partial ✅, its
*rate over time* is ❌. Pipeline analytics never blurs the two, and never lets the visible
occurrence stand in for the absent rate.

---

## 6. Time is First-Class — pipeline metrics need a window (Law 7)

This document owns a share of one governing law more sharply than any other Book G doc, because
every pipeline metric it describes is a rate or a trend, and a rate without a window is a number
with no meaning.

> **LAW 7 — Time is First-Class.** Every metric MUST carry a time context — Last 7 Days /
> Last 30 Days / Quarter / Year / Lifetime. No number is ever shown without its time window.

A pipeline metric obeys this law by construction. "The scoring stage takes nine seconds" is not a
metric until it is "the scoring stage's median duration *over the last 30 days* is nine seconds."
"Failures are up" is not a metric until it is "the failure rate *this quarter* is higher than the
failure rate *last quarter*." The window is not decoration on the number; it is half the number.
Every pipeline reading this document describes — stage duration, retry rate, failure rate,
approval rate — is meaningless the instant it is stripped of its window, because "slower,"
"flakier," and "more often blocked" are all comparisons across time.

The honest tier here is unambiguous:

- **Live time-bucketing is ❌.** There is no live control that buckets pipeline metrics into
  7d / 30d / quarter / year / lifetime, because there is no live time-series of runs to bucket —
  the trace that would supply each run's timestamped record is never produced live (§2), and the
  event feed is a fifty-entry *recent* window (`app.ts:118-129`), not a time-partitioned history
  (§4). A window control over pipeline metrics has nothing to window.
- **The window is a first-class field of the design, not an afterthought.** When the governed
  pipeline is wired and traces are produced live, each sealed trace carries the run's timing, and
  those timings partition cleanly into the five standard windows. Time-first pipeline analytics is
  the design; it is simply gated behind the same wiring gap as the trace itself.

Law 7 is therefore satisfied *in intent and in shape* — every pipeline metric this document names
is defined with its window attached — and **not yet satisfied live**, because the timestamped run
history the windows partition does not exist on live runs. The document states the window
requirement in full precisely so that no pipeline number is ever presented, now or later, as a
bare figure floating free of the time it belongs to.

---

## 7. Observability Before Optimization — this doc reports, it never prescribes (Law 9)

The second law this document leans on hardest is the one that keeps pipeline analytics honest
about its own job.

> **LAW 9 — Observability Before Optimization.** Book G ONLY observes — it shows, measures,
> compares. It NEVER says "change this." Optimization suggestions remain Book E's domain.

Pipeline analytics is the place this law is easiest to violate, because a failure rate and a retry
count read like a to-do list. They are not. This document reports the failure rate and the retry
rate; it never says *reduce the retries*, never says *fix the flaky stage*, never says *tighten
the timeout*. The distinction is exact and it is the whole discipline of the layer:

- **What this document does.** It measures how often stages retry, how often runs fail, how long
  stages take, and how often humans approve, and it compares those readings across time windows
  (§6). It surfaces "the review stage failed eleven times this month." That is observation.
- **What this document never does.** It never renders a "the review stage should be reworked"
  banner, never recommends a config change, never ranks stages by "what to fix first." The moment
  a pipeline view said "fix this," it would have crossed from showing into deciding — and deciding
  what to change about the pipeline is optimization, which belongs to Book E and to the human, not
  to a chart.

A failure-rate chart that also told you what to do would be doing two jobs, and the second job is
not analytics'. Pipeline analytics hands the human a clear, honest reading of how the pipeline is
behaving and stops at the edge of the recommendation. The human — informed by the reading, and by
Book E's intelligence — decides what, if anything, to change. Observation first; optimization is
someone else's book.

The ordering the law names is deliberate: observability comes *before* optimization not merely in
priority but in sequence. You cannot responsibly optimize a pipeline you have not measured, so the
first obligation is to make the pipeline honestly visible — durations, retries, failures,
approvals, each with its window — and only then does the question of what to change even become
answerable. Pipeline analytics discharges the first obligation and refuses the second. It is the
instrument, not the hand on the dial. By keeping the reading scrupulously free of prescription, it
also keeps itself trustworthy: a measurement that quietly advocated for an outcome would be a
measurement you could no longer take at face value, and the whole value of a pipeline metric is
that it can be taken at face value.

---

## 8. Reading the pipeline record never influences the pipeline (the foundational law)

Everything in §§2–7 rests on one law, and pipeline analytics is the sharpest test of it, because
this is the one Book G surface that stares directly at the execution engine.

> **FOUNDATIONAL LAW — Analytics never influences execution directly.** Analytics can never change
> the pipeline, a mission, evidence, memory, or a creative. It only observes.

The direction of the arrow is fixed and one-way: **pipeline → record → analytics.** A run produces
a trace; analytics reads the trace; and nothing flows back. There is no path by which a pipeline
metric re-enters the pipeline — no view that retries a stage, no chart that re-routes a run, no
dashboard that adjusts a timeout, no reading that approves a mission. The trace is sealed the
instant the run ends (`kernel.ts:241`), so even the *record* analytics reads is beyond analytics'
reach to alter, let alone the run itself.

This is why the built-but-unwired status of the trace (§2) and the monitoring hook (§3) is, for
this document, a *safety* as much as a limitation. Because pipeline analytics reads a sealed record
produced by a path it cannot invoke, there is structurally no way for the act of measuring the
pipeline to perturb it. A run that took nine seconds took nine seconds; measuring it, charting it,
comparing it against last quarter's runs — none of that reaches back into the run or forward into
the next one. The pipeline runs; the record is sealed; analytics reads. The reading is inert with
respect to the thing it reads.

> **Observability reveals reality; it never changes reality.**

---

## 9. Boundaries — local, own-data-only, no vendor telemetry, read-only

Pipeline analytics holds inside the same boundaries as the whole platform, and on the pipeline
path they are non-negotiable, because pipeline records are exactly the kind of operational data a
careless system would ship off-device:

- **100% local.** Every mechanism this document touches runs on the local machine: the
  ExecutionTrace is a local object sealed in-process (`kernel.ts:241`), the MonitoringPort's
  recorder is an in-memory implementation (`monitoring.ts:31-39`), and the live event feed is a
  bounded in-memory window (`app.ts:118-129`). No run record, no stage timing, no failure count
  leaves the device.
- **No vendor telemetry.** This is the sharpest boundary of the section, and the reason it is
  worth stating loudly: pipeline analytics is the *opposite* of telemetry. Telemetry ships your
  operational data — your run durations, your failure rates, your retry counts — to a vendor.
  Pipeline analytics keeps that record with the agency and sends nothing off-device. No stage
  duration, no failure rate, no approval count is transmitted to any external endpoint. The agency
  measures its own pipeline for its own eyes.
- **Own data only, copy-only.** Pipeline metrics are computed from the agency's own run records
  and nothing else. No external benchmark, no third-party data is pulled in to decorate a chart.
  The pipeline view describes the pipeline; it does not reach outside it.
- **Read-only with respect to execution.** Every operation in this document is a pure read of a
  sealed record or a bounded feed. Pipeline analytics has no write path into the pipeline, a
  mission, evidence, or memory. Generating a pipeline-metric view is not mutating execution state
  (Law 1); it is reading state that another book produced and rendering it.
- **Human-sovereign.** Pipeline analytics informs; the human decides. A failure rate is shown to a
  person, not acted on by the system. The dashboard reveals how the pipeline is behaving; whether
  to change anything about it stays with the human and Book E (§7).

The one-line boundary: **pipeline analytics makes a run's process visible to its owner and to no
one else** — a record the agency keeps of its own engine, held locally, shared with nothing.

---

## 10. Value contribution

Pipeline analytics maps to both value levers, and the map is concrete because a stage duration is,
quite literally, a measurement of production time.

**It cuts production time by making the pipeline diagnosable.** Today, a user can already see live
that a mission was approved or that a step failed, because those transitions ride the shipped event
feed (`app.ts:118-129`, `app.ts:132-135`) — so when a run stalls at the human gate or a step
fails, the fact is on the screen rather than buried. Once the governed pipeline is wired and the
trace is produced live (§2), that fragment becomes a full account: **stage durations** turn "why
is this slow?" from an investigation into a lookup, and **retry and failure rates over time** (§6)
turn "is the pipeline getting flakier?" from a hunch into a reading. Across a book of missions, the
difference between a pipeline you can chart and one you cannot is the difference between diagnosing
a slow stage in a glance and reproducing the problem by hand — production time saved directly.

**It grows revenue by making the pipeline auditable at enterprise scale.** An enterprise agency
does not buy a production engine it cannot inspect. The single thing an enterprise buyer audits for
is whether the system can show how its work actually ran — which stages executed, how long they
took, how often they failed, and where a human approved. Pipeline analytics is that audit surface,
and the no-vendor-telemetry boundary (§9) is what makes it trustworthy: the agency's pipeline
health is visible to the agency and to no one else. A pipeline whose every run is observable,
sealed, and local is a pipeline an agency can govern, prove, and stand behind in front of its own
clients — the difference between a production tool and an operating system an enterprise can
commit to.

And it delivers that value without ever touching the thing it measures. Pipeline analytics makes
the engine legible; it leaves the engine exactly as it found it.

> **Observability reveals reality; it never changes reality.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
