# Analytics Constitution

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. **This is the
> governing document of Book G** — every other Book G artifact is subordinate to the laws,
> boundaries, and truth model declared here.
>
> **Laws:** *Analytics never influences execution directly · analytics never mutates · every
> metric has provenance · dashboard ≠ decision · same data, different views · analytics is
> immutable · every dashboard is derived · time is first-class · every visualization has data ·
> observability before optimization.*

---

## 0. Preamble — what this document governs

This is the constitution of **Book G — Analytics Platform**. It is the highest authority in the
book. Where any other Book G document appears to conflict with the text below, this document
controls, and the other document is to be corrected, not this one. The seven content documents of
Book G — pipeline analytics, business analytics, metric provenance, performance analytics,
operational analytics, role-based dashboards, and the closing observability-platform doc — all
derive their authority from the laws declared here.

Books A through F built and then *ran* the core operating system. Book A gave the agency
**workflow**. Book B gave AI **production**. Book C gave **explainability**. Book D gave
**performance memory** — the evidence layer. Book E gave **creative judgement**. Book F gave
**orchestration** — the managed, deterministic, human-gated process that runs the other five as
one system, and that emits an observable record of every run. Together, Books A through F are the
**AdOS Core Operating System, v1.0 — frozen.** They decide, they learn, they optimize, they act
on the agency's behalf under a human gate.

Book G does none of those things. Book G is the **Observability Layer** that sits *on top of* the
frozen A–F core. It takes the run records and reports the core already produces, computes metrics
from them, and renders those metrics as dashboards and reports. It is the clean, one-way seam:
**core → record → analytics.** It reads; it never writes back. It shows; it never decides. This
distinction is the spine of the entire book, and it is stated as an invariant that every Book G
document repeats verbatim:

> **Observability reveals reality; it never changes reality.**

Read that sentence as the first principle from which every law below is derived. If a proposed
analytics behaviour would require Book G to *change* the pipeline, a mission, an evidence record,
a memory entry, or a creative — to *decide* something the core did not already decide, or to
*learn* or *optimize* on the core's behalf — that behaviour is unconstitutional. Book G may
*observe* the layer that owns the decision; it may never *make* the decision, and it may never
alter what it observes. An observer that could silently rewrite what it watches would not be an
observer at all; it would be a second, ungoverned execution path, and it would collapse the trust
the six core books were built to earn.

---

## 1. The central principle — no new decisions, only observation

Book G adds **no new intelligence and no new authority** to AdOS. This is the sibling of Book F's
"no new intelligence," Book E's "no new data," and Book D's evidence discipline: where Book F
promised to *coordinate* layers without inventing reasoning, Book G promises to *observe* the
system without inventing — or altering — anything at all.

Concretely, Book G:

- **Shows what already happened.** Run records, reports, KPIs, verdicts, entity counts, and
  activity feeds are computed from data the core produced. Book G presents them; it does not
  originate them.
- **Owns presentation, not cognition and not state.** Aggregation, summarization, framing,
  time-windowing, and view selection are Book G's domain. Deciding a campaign's fate, scoring a
  creative, gathering evidence, writing a learning, or advancing a mission are *never* Book G's
  domain — those belong to Books B, C, D, E, and F.
- **Produces nothing the underlying record could not already tell you.** If you remove Book G,
  the core still runs, still decides, still learns; what disappears is the *visible, summarized,
  human-legible* view of what it did. Analytics is a lens on reality, never a lever on it.

Because Book G creates no decisions, it also carries no authority to change what the core decided.
It reads the core's outputs, computes derived numbers from them, and renders them. That restraint
is what makes the observability layer trustworthy: an analytics layer that could silently mutate a
mission, edit an evidence record, or write a learning back into memory would be a coordinator's
worst nightmare — a reporting surface that changes the thing it reports. Book G is forbidden from
being that surface.

---

## 2. The one-way flow Book G manages

Book G manages exactly one canonical flow of derivation, and it runs in **one direction only**:

```
Run Records / Events → Metrics → Dashboards → Reports → Exports
```

Each hop is a pure derivation from the hop before it, and no hop is ever allowed to run backwards:

| Stage | Owns | Book G's role |
|-------|------|---------------|
| **Run Records / Events** | the raw truth the core emitted | read only — never authored here |
| **Metrics** | numbers computed from records | pure math over explicit inputs |
| **Dashboards** | a visual arrangement of metrics | derive and render; hold no data of their own |
| **Reports** | a durable summary artifact | assemble; retain the source metrics |
| **Exports** | a portable copy of a report | copy out; never a new source of truth |

The rule is absolute: **records produce metrics; metrics produce dashboards and reports; reports
produce exports — and never the reverse.** A dashboard may never write a metric. A report may
never edit a record. An export may never become an input the core reads back. Book G may
*recompute* a metric from its source records at any time — recomputation is re-deriving forward
from the same truth — but it may never *rewrite* a record, and it may never reverse the direction
of derivation. This one-way flow is what makes analytics auditable: every number on every screen
can be traced back, hop by hop, to the records the core produced, and nothing downstream can
contaminate the truth upstream.

---

## 3. The three-tier truth model

Book G uses the same truth model as Books B, C, D, E, and F. Every capability named anywhere in
this book carries exactly one tier tag, and nothing unbuilt is ever presented as shipped:

- **✅ SHIPPED** — runs in the live web app today; cited with a wired `path:line`.
- **🔶 BUILT (UNWIRED)** — code and tests exist, but no live path reaches it; cited with a
  `path:line` that resolves only inside tests.
- **❌ ROADMAP** — a contract or an intention with no implementation; no code citation is
  permitted, and none is given.

The tier tags are not decoration. They are the mechanism that keeps this book honest about the gap
between the *design* of a full observability platform and the *current state* of the codebase.
Book G is unusual among the books in that its **strongest** tier is Business Analytics: a
deterministic KPI engine, campaign reports, executive verdicts, a live dashboard, and per-client
rollups all render today. But its **execution, performance, and operational** analytics — the
parts that would observe the governed runtime and the performance memory — are largely ❌ or 🔶,
because the run records they would consume are never produced live. The truth model is how this
book says both facts out loud at once: the observability that ships is real, and the observability
that does not ship is named, not disguised.

---

## 4. The central truth — the shipped analytics path is already read-only

The defining fact of Book G, from which its foundational law inherits its honesty, is this: **the
analytics that ships today is already a pure read.** Unlike Book F, whose First Law describes a
target state the code does not yet meet, Book G's foundational law and its First Law are **already
honored by the shipped analytics path.** This section proves it.

### 4.1 The shipped analytics surfaces are pure reads ✅ SHIPPED

Every analytics, dashboard, executive, and report surface the user actually reaches is built from
`.list`/`.get` reads and pure computation over them — no write to any execution state occurs
inside the analytics path:

- **The KPI engine is pure math.** `computeKpis` (`domains/analytics-engine/src/report/kpi.ts:39`)
  takes explicit input metrics and computes six deterministic KPIs — CTR, CPC, CPA, CPL, ROAS, ROI
  (`kpi.ts:43-48`). It reads its inputs and returns numbers; it mutates nothing. ✅
- **The `/analytics` surface renders derived numbers.** The analytics page reads and renders
  computed reports (`apps/web/src/routes.ts:625-645`). It is a view over derived metrics, not an
  authoring surface. ✅
- **The `/executive` surface renders a verdict.** The executive report page reads and renders the
  executive summary and its verdict (`apps/web/src/routes.ts:707-728`). It presents; it does not
  decide. ✅
- **The `/reports` surface renders a per-client rollup.** `buildReportSnapshot`
  (`apps/web/src/routes.ts:1436-1488`) assembles a per-client snapshot, including the average ROAS
  rollup `avgRoas` (`routes.ts:1470`), from records already in the repositories. It aggregates
  reads; it writes nothing back. ✅

Every one of these paths ends in a rendered number. None of them advances a mission, edits an
evidence record, scores a creative, or writes a memory entry. The analytics path is, by
construction, a lens.

### 4.2 The one execution-state write sits OUTSIDE the analytics path ✅ SHIPPED

There is exactly one place where the live app writes execution state that analytics is adjacent
to: `recordLearning` (`apps/web/src/routes.ts:1092`), which writes performance data (roas / roi /
ctr / channels / vertical) into Book D's memory as part of the *core's* learn step. This is a
**core** action — Book D's performance memory being written by the mission workflow — and it sits
**outside** the analytics path entirely. Book G does not call it, does not depend on it, and never
initiates it. The learn step is the core learning; it is not analytics observing.

The significance is decisive: because every shipped analytics surface is a pure read (§4.1) and
the sole execution-state write (`recordLearning`) is a core action outside the analytics path,
**Law 1 (Analytics Never Mutates) and the Foundational Law are ALREADY honored by the shipped
analytics path.** ✅ This book does not describe a target state for its central discipline; it
describes a discipline the code already keeps, and it specifies how to keep it as observability
grows.

### 4.3 Metric provenance is already true for shipped KPIs ✅ SHIPPED

Law 2 (Every Metric Has Provenance) is likewise **already satisfied** for the shipped path. Two
facts establish it:

- **`computeKpis` takes explicit metrics.** The KPI engine does not conjure numbers from an
  opaque model; it receives explicit input metrics and computes over them
  (`domains/analytics-engine/src/report/kpi.ts:39`). Every KPI traces to the inputs it was given.
- **`CampaignReport` retains its source metrics.** The campaign report type keeps the source
  metrics from which its KPIs were derived (`domains/analytics-engine/src/report/campaign-report.ts:34-35`).
  The provenance lives *in the type* — the report carries, alongside each derived number, the
  source it came from.

So for every shipped KPI, the question "from which records was this computed?" already has an
answer encoded in the code. Provenance is not a promise Book G is making about the future; it is a
property the shipped analytics engine already has. ✅

### 4.4 What is honestly not yet observed

The read-only discipline is kept, but the *breadth* of observation is not yet complete. The
governed runtime pipeline that Book F specifies produces a rich `ExecutionTrace`
(`packages/ai-manager/src/runtime/kernel.ts:124`) — but the app never calls the governed execute
path, so that trace is **never produced live** (🔶). Book D's performance memory is *written* by
`recordLearning` but is **never read back or aggregated** for analytics (❌). Consequently
execution analytics, performance analytics, and operational analytics are largely ❌ or 🔶 today.
Section 6 and Section 11 name exactly which observability ships and which does not. The honesty is
the point: the read-only law is met; the observability surface is partial, and this book says so.

---

## 5. The foundational law and the nine governing laws

Below is the foundational law that governs the entire book, followed by the nine laws that govern
every Book G document. Each is stated, justified, and given an enforcement mechanism. Where a law
is already honored by the shipped code, its status cites the shipped path; where a law describes an
observation the code does not yet make, the gap is named honestly.

### FOUNDATIONAL LAW — Analytics never influences execution directly

**Statement.** Analytics can never change the pipeline, a mission, an evidence record, a memory
entry, or a creative. It only observes. There is no path from a dashboard, a report, a metric, or
an export back into execution state. Whatever Book G computes, it computes *about* the core; it
never acts *on* the core.

**Rationale.** This is the law from which every other law inherits. The core (A–F) is where
decisions, learning, and optimization live, all under a human gate. If the observability layer
could reach back and change execution — nudge a mission, edit evidence, rewrite a learning — then
the core's guarantees would become unverifiable, because there would always be a second,
ungoverned way to mutate state: through the reporting surface. An observer that can move the thing
it observes is not an observer. This law is what makes the entire A–F/G separation trustworthy:
the core decides; Book G watches.

**Enforcement.** The shipped analytics surfaces are constructed as pure reads (`.list`/`.get`) and
pure computation over them — the KPI engine (`domains/analytics-engine/src/report/kpi.ts:39`), the
`/analytics` render (`apps/web/src/routes.ts:625-645`), the `/executive` render
(`routes.ts:707-728`), and the per-client rollup (`buildReportSnapshot`, `routes.ts:1436-1488`).
None writes execution state. The one execution-state write in the vicinity, `recordLearning`
(`routes.ts:1092`), is a **core** learn action outside the analytics path.

**Honest status.** ✅ **ALREADY HONORED by the shipped analytics path.** The analytics path does
not mutate execution state, and the sole nearby write is a core action Book G neither owns nor
invokes. As observability grows to consume the governed run record, this law is the fixed
constraint every new surface must satisfy: read, compute, render — never write back.

### LAW 1 — Analytics Never Mutates

**Statement.** Book G is read-only with respect to all core state — Mission, Evidence, Memory,
Creative, and the decision Journal. Generating a report artifact is **not** mutating execution
state: a report is a derived, downstream copy, not a change to the mission or its records.

**Rationale.** This is the operational form of the Foundational Law. The core's state is the
system of record; if analytics could edit it, the record would no longer be authoritative. The
carve-out matters and must be understood precisely: producing a `CampaignReport` or an executive
summary is *creating a derived artifact from reads*, which is exactly what an observability layer
is for. Writing a new value back into a Mission, an Evidence entry, a Memory record, or a Creative
would be mutation, and it is forbidden. The line is between *deriving downstream* (allowed) and
*writing upstream* (forbidden).

**Enforcement.** Report generation reads source records and assembles a report object; the
`/analytics`, `/executive`, and `/reports` surfaces render those objects (`routes.ts:625-645`,
`707-728`, `1436-1488`). None issues a write to Mission, Evidence, Memory, or Creative
repositories. The composition of these surfaces from read repositories is the enforcement point:
the analytics code is handed read access, and it derives forward from it.

**Honest status.** ✅ **ALREADY HONORED for the shipped analytics path.** Every shipped analytics
surface is a pure read plus derivation; the sole execution-state write, `recordLearning`
(`routes.ts:1092`), sits outside the analytics path as a core learn action.

### LAW 2 — Every Metric Has Provenance

**Statement.** Every metric answers the question "from which records was this computed?" There are
no magic numbers. Each number Book G shows traces to the source records it was derived from.

**Rationale.** A number without provenance is an assertion, not an observation. The entire value of
an observability layer rests on the audience being able to trust that what they see is a faithful
derivation of what the core actually did — not a figure the reporting layer invented. Provenance is
what converts a displayed number from "trust me" into "here is where this came from." It is also
what makes Law 5 (immutability) meaningful: you can only prove a metric was re-derived rather than
rewritten if you can point to the records it was derived from.

**Enforcement.** The KPI engine takes explicit input metrics and computes deterministically over
them (`domains/analytics-engine/src/report/kpi.ts:39`); there is no hidden state and no
model-conjured figure in a shipped KPI. The `CampaignReport` type **retains its source metrics**
alongside its derived KPIs (`domains/analytics-engine/src/report/campaign-report.ts:34-35`), so the
provenance is carried in the artifact itself: the report holds both the answer and its source.

**Honest status.** ✅ **ALREADY TRUE for shipped KPIs.** `computeKpis` derives from explicit inputs
and `CampaignReport` retains those inputs; every shipped KPI already traces to its source. The
provenance of metrics computed over records the core does not yet produce live (execution,
performance, operational) is 🔶/❌ accordingly — a metric cannot have provenance until its source
record exists. G004 owns the full provenance treatment.

### LAW 3 — Dashboard ≠ Decision

**Statement.** A dashboard visualizes; it does not decide. Decisions stay with the Human and with
the core intelligence layers (Books B, C, D, E) under Book F's human gate. A dashboard never
selects an action, approves a mission, or chooses a creative.

**Rationale.** The most dangerous failure mode of an analytics layer is that a compelling
visualization quietly becomes the decision-maker — the number turns red, and the number decides.
AdOS is human-sovereign: a person decides, the machine proposes. A dashboard that decided would
have crossed from observation into authority, violating the Foundational Law. Keeping "dashboard"
and "decision" strictly separate is what preserves human sovereignty at the reporting surface, not
just at the execution surface.

**Enforcement.** The shipped dashboards and reports render numbers and verdicts and stop there. The
executive verdict (`exceeded | on_track | at_risk`) is rendered at `/executive`
(`routes.ts:707-728`) as *information for a human*, not as an instruction that triggers execution.
No shipped analytics surface issues an execution action as a consequence of what it displays. G007
owns the dashboard-as-derived-view design.

**Honest status.** ✅ Honored on the shipped surfaces — every dashboard and report renders and
stops; none decides. The verdict shown at `/executive` informs; it does not act.

### LAW 4 — Same Data, Different Views

**Statement.** CEO, Manager, Operator, and Customer see the **same** underlying data, summarized
differently. Views differ; the truth beneath them is one. No persona is shown a *different truth* —
only a different summary of the one truth.

**Rationale.** An observability layer that let each audience see a *different reality* would
fracture the single system of record into as many realities as there are viewers, and reconcile
none of them. The discipline "same data, different views" guarantees that when the CEO's summary
and the Operator's detail disagree, they disagree only in *granularity*, never in *fact* — because
both are derived from the same records. This is what lets an executive summary and an operator's
feed both be trusted at once.

**Enforcement.** All shipped views derive from the same repositories and the same computed reports:
the live dashboard, `/analytics`, `/executive`, and `/reports` all read the one set of records and
present different summaries of it. There is a single derivation chain feeding every surface.

**Honest status.** 🔶/❌ for role differentiation. The *principle* holds for the shipped views
(they all derive from one truth), but **role-based** views do not exist: RBAC is **declared but not
enforced** — a role model exists (`packages/.../roles.ts:6-13`), sessions carry a role
(`session.ts:15-16`), and the auth service references it (`auth-service.ts:145-147`), but a comment
states no new permission gate is added, and every user sees the same page. There are no
persona-specific summaries today; CEO/Manager/Operator/Customer views are ❌ ROADMAP. G007 owns
this. The law's *floor* — one truth beneath every view — is already met; its *ceiling* — distinct
persona summaries — is not built.

### LAW 5 — Analytics is Immutable

**Statement.** Derivation flows one way: Events → Metrics → Reports, and **never** Reports →
Events. Analytics may *recompute* a metric from its source records; it never *rewrites* history and
never reverses the direction of derivation.

**Rationale.** This is Law 2's twin: provenance says every number has a source; immutability says
the source is never edited by the thing derived from it. If a report could write back to the
records it summarized, the records would drift toward whatever the report claimed, and the audit
trail would eat its own tail. Recomputation must be sharply distinguished from rewriting:
recomputing re-derives *forward* from unchanged source records (always allowed); rewriting changes
the source (never allowed). The one-way flow of Section 2 is exactly this law expressed as an
architecture.

**Enforcement.** The shipped path derives strictly forward: records → `computeKpis` → report →
render. No shipped analytics surface writes back to the events or records it read. Recomputing a
report re-runs the pure `computeKpis` over the same explicit inputs (`kpi.ts:39`), producing the
same result without touching the source.

**Honest status.** ✅ Honored — the shipped derivation is one-way and no report writes back to a
record. G004 owns the immutability and recompute-not-rewrite treatment in full.

### LAW 6 — Every Dashboard is Derived

**Statement.** A dashboard holds no data of its own. Its content is derived (Events → Metrics →
Dashboard); it is never a separate "truth source." Unplug the metrics, and the dashboard is empty.

**Rationale.** A dashboard that cached its own copy of the truth would become a *second* system of
record — one that could disagree with the core and could not be reconciled, because it answered to
nothing upstream. Requiring every dashboard to be a pure function of its metrics guarantees there is
exactly one truth (the records) and that every screen is a transparent window onto it. It is what
lets you trust that fixing a number at the source fixes it everywhere it appears.

**Enforcement.** The live dashboard computes its contents from the repositories at render time —
entity counts and activity are derived from the current records, not stored as an independent
dataset. The `/analytics`, `/executive`, and `/reports` surfaces likewise render derived reports
(`routes.ts:625-645`, `707-728`, `1436-1488`); each is a projection of records, holding no
authoritative state of its own.

**Honest status.** ✅ Honored — the shipped dashboards and report surfaces are projections of the
records, holding no data of their own. G007 owns the derived-dashboard design.

### LAW 7 — Time is First-Class

**Statement.** Every metric MUST carry a time context — Last 7 Days / Last 30 Days / Quarter /
Year / Lifetime. No number is ever shown without its time window.

**Rationale.** A number without a window is ambiguous to the point of being misleading: a ROAS of
3.0 means something entirely different over seven days than over a lifetime, and a viewer who does
not know which is which cannot act responsibly on it. Time is not a filter bolted onto analytics;
it is part of what a metric *means*. An observability layer that showed windowless numbers would be
reporting a reality no one could locate in time.

**Enforcement.** In the target state, every metric surface presents its time window as a
first-class part of the number, and the window is a live control the viewer can set.

**Honest status.** ❌ ROADMAP for live time-windowing. Today's shipped reports are
per-campaign / per-client **snapshots**, not time-bucketed series, and there is no live
7d/30d/quarter/year/lifetime control. The law states the target every metric surface must reach;
the shipped snapshots do not yet reach it, and this book says so. G004 owns the time-context
framing.

### LAW 8 — Every Visualization Has Data

**Statement.** Every chart, meter, and figure must answer "which metrics produced this?" Visuals
never precede data; there is no decorative number and no chart without a metric behind it.

**Rationale.** This is Law 6 applied to the individual visual: just as a dashboard must be derived,
so must every element on it. A chart drawn from nothing — a placeholder, a mock, a number chosen to
look good — is worse than no chart, because it wears the authority of data while carrying none. The
discipline forbids the reporting layer from ever showing a shape that is not a faithful rendering
of a real metric.

**Enforcement.** Shipped visual surfaces render values computed by the KPI engine and the report
builders (`kpi.ts:39`, `buildReportSnapshot routes.ts:1436-1488`); the numbers on screen are the
numbers those functions returned. No shipped surface renders a figure without a computed metric
behind it.

**Honest status.** ✅ Honored for the shipped surfaces — every number rendered is a computed metric,
not a decorative placeholder. As richer visualizations are added, this law is the constraint each
must satisfy: a visual ships only once the metric behind it does.

### LAW 9 — Observability Before Optimization

**Statement.** Book G ONLY observes — it shows, measures, and compares. It **never** says "change
this." Optimization suggestions remain Book E's domain (and action remains the human's, under Book
F's gate).

**Rationale.** This is the boundary that keeps Book G an observability layer rather than a shadow
optimizer. The moment analytics tells the system "revise more" or "spend here," it has crossed from
observing reality into steering it — a direct violation of the Foundational Law, and a usurpation of
Book E's creative judgement and the human's authority. Observability *before* optimization means the
reporting layer's job ends at making reality legible; deciding what to do about that reality belongs
to the intelligence layers and the human. Book G can report an approval rate or a revision rate; it
must never conclude "therefore revise differently."

**Enforcement.** No shipped analytics surface emits an optimization instruction. The executive
verdict (`exceeded | on_track | at_risk`, `routes.ts:707-728`) is a *description of status*, not a
recommendation to act; it names where things stand and stops. Performance analytics (G005), when
built, will report rates — approval rate, revision rate, evidence coverage — without ever
prescribing a change to them.

**Honest status.** ✅ Honored — the shipped surfaces observe and describe; none prescribes. The
verdict at `/executive` reports status; it does not recommend an action. G005 owns the
observe-don't-optimize treatment for the intelligence layers.

---

## 6. The three-tier truth model, applied to Book G's scope

This section states plainly which observability ships, which is built but unwired, and which is
roadmap — so that no reader mistakes the strong Business-Analytics baseline for a complete
observability platform.

### 6.1 ✅ SHIPPED — the Business-Analytics baseline

- **Deterministic KPI engine** — `computeKpis` (`domains/analytics-engine/src/report/kpi.ts:39`)
  computing CTR / CPC / CPA / CPL / ROAS / ROI (`kpi.ts:43-48`) as pure math over explicit inputs.
- **CampaignReport with retained provenance** — the report type retains its source metrics
  (`domains/analytics-engine/src/report/campaign-report.ts:34-35`).
- **The `/analytics` render** — computed reports rendered read-only (`routes.ts:625-645`).
- **The `/executive` render** — executive summary and verdict rendered read-only
  (`routes.ts:707-728`).
- **The `/reports` per-client rollup** — `buildReportSnapshot` with `avgRoas`
  (`routes.ts:1436-1488`, `1470`).
- **The live dashboard** — entity counts and a bounded activity feed derived from the current
  records at render time.

All six are pure reads plus derivation; none mutates execution state.

### 6.2 🔶 BUILT (UNWIRED) — machinery for execution and operational analytics

- **ExecutionTrace / TraceBuilder** — the governed runtime seals a rich, frozen record of a run
  (`packages/ai-manager/src/runtime/kernel.ts:124`). It is real, tested code, but the app never
  calls the governed execute path, so the trace is **never produced live.** Execution analytics
  (G002) and operational analytics (G006) would consume it; today they cannot, because it does not
  flow.

### 6.3 ❌ ROADMAP — observation with no live source record

- **Execution analytics as a live feature** — stage durations, retries, and failures over time.
  Only mission-state approvals/failures are visible today; the run record is not wired.
- **Performance analytics** — memory growth, evidence coverage, recommendation usage, approval
  rate, revision rate. Book D memory is *written* by `recordLearning` (`routes.ts:1092`) but never
  read back or aggregated.
- **Operational per-layer metrics** — Planner / Generation / Scoring / Explanation / Review /
  Orchestration throughput, latency, and failure rates.
- **Role-based dashboards** — CEO / Manager / Operator / Customer persona views; RBAC is declared
  but unenforced.
- **Exports** — CSV / PDF / JSON; none exist.
- **Live time-window selection** — 7d / 30d / quarter / year / lifetime as a control; today's
  reports are snapshots, not time-bucketed series.

Nothing in §6.3 is presented as shipped anywhere in this book. Each is named as the roadmap it is.

---

## 7. The A–F core operating system, and Book G on top

Book G is not a seventh core book. Books A through F are the **AdOS Core Operating System, v1.0 —
frozen**, and they constitute one managed enterprise platform:

- **Book A — Workflow.** The agency's process and mission structure.
- **Book B — Production.** AI drafting of briefs, creative, and campaigns.
- **Book C — Explainability.** Rationale for every AI output.
- **Book D — Performance Memory.** The immutable evidence layer.
- **Book E — Creative Judgement.** Reproducible scoring of alternatives.
- **Book F — Orchestration.** The managed, deterministic, human-gated pipeline that runs the above
  and emits an observable record of every run.

These six are the **core**. They decide, learn, optimize, and act under a human gate. Book G builds
**on top of** the frozen core and must never change it:

- **Book G — Analytics** ("shows, does not decide"). Book G consumes the observability records the
  core produces — Book F's Law-6 run record chief among them — and presents them. Book F's Law 6
  mandates that every orchestration run produce a record of **Mission ID · Pipeline Version · Stages
  Executed · Duration · Evidence Used · Human Decisions · Final Outcome.** That record is Book G's
  **raw material**: the events and run records at the head of the one-way flow (Section 2) are
  precisely what Law 6 obliges the core to emit. Book G reads it; it does not alter the pipeline
  that produced it, and it holds no authority to decide anything the core did not already decide.

The rule is directional and constitutional: **the core does not depend on Book G, and Book G must
not modify the core.** The core is authored, frozen, and specified in
[`ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md); Book G references that
specification and the six core books by link, and never re-documents, re-specifies, or redesigns
them. Where a Book G document needs a detail of A through F, it links to that book and states the
tier; it never restates the core's design as if it were Book G's own. Book F's observability
contract (Law 6) is the clean, one-way seam that lets Analytics build on the core without reaching
into it.

---

## 8. Boundaries of the platform — local, copy-only, and human-sovereign

Book G inherits, and must never weaken, the operating boundaries of AdOS. Analytics is, in a
precise sense, the **opposite of telemetry**: telemetry ships a system's data *off* to a vendor;
Book G keeps the record *with the agency* and sends nothing off the device.

- **100% local, offline-first.** Every metric, dashboard, and report is computed and rendered
  entirely on the user's machine. There is no cloud analytics backend, no external API, no vendor
  connector, and no data leaving the device. Observability adds a lens, not connectivity.
- **No vendor telemetry — own data only.** Book G emits nothing off-device. The records it reads
  and the reports it derives stay local to the agency. Where a conventional analytics product would
  phone home, Book G is architecturally forbidden from doing so: it is the agency's own view of its
  own data, held by the agency alone.
- **Copy-only.** Book G produces copy — reports, summaries, rendered numbers — for human reading.
  It never executes an external action on the world (no ad buys, no publishing, no sends), and
  neither does anything it reports.
- **Read-only with respect to the core.** By the Foundational Law and Law 1, Book G never writes
  Mission, Evidence, Memory, Creative, or Journal state. It derives forward; it never writes back.
- **Human-sovereign.** Dashboards inform; humans decide (Law 3, Law 9). No metric threshold, no red
  number, no verdict may ever substitute for a human's judgement or trigger an execution action.
  Book G is not an autonomous agent; it is a window.

These boundaries are constitutional. No Book G document, and no future analytics feature, may relax
them in the name of insight, convenience, or automation. Making the core more legible is Book G's
mandate; phoning home, writing back to the core, or acting on the world is expressly outside it.

---

## 9. Value contribution

Book G's value is not a new core capability — it is the *legibility* of the six capabilities that
already exist. A single, honest, read-only observability layer turns a system that *runs* into a
system an agency can *see itself running*. That yields value on both axes AdOS is measured by:

- **Reduces production time.** An operator who can see, at a glance, which campaigns are performing,
  which missions are awaiting a human, and what the executive verdict is spends less time hunting
  for that state and less time reconstructing what happened. Provenance (Law 2) means a questioned
  number is traced in seconds, not re-derived by hand. A derived dashboard (Law 6) means fixing a
  number at the source fixes it everywhere, eliminating reconciliation work. Legibility is time
  saved.
- **Increases agency revenue.** An enterprise buys a platform it can *account for*. KPIs it can
  trust, campaign reports it can show a client, and an executive summary it can put in front of a
  CEO are what let an agency demonstrate the value it delivered — and win the next mandate on the
  strength of it. Business analytics that renders today (§6.1) is directly the surface an agency
  uses to prove ROAS and ROI to the people who pay for them. Observability is the difference between
  doing good work and being able to *show* that the work was good.

The through-line: **observability reveals reality; it never changes reality** — and by revealing it
faithfully, read-only and local, Book G converts a running core into a platform an agency can see,
trust, account for, and grow on.

---

## 10. What this constitution binds

Every Book G content document — G002 through G008 — is subordinate to this text:

- **G002 `PIPELINE_ANALYTICS.md`** — observing the orchestration pipeline: stage durations,
  retries, failures, approvals. Grounds to the built-unwired ExecutionTrace/TraceBuilder and the
  monitoring hook; honest that full pipeline analytics is ❌ live because the trace is never
  produced live, and only mission-state approvals/failures are visible today.
- **G003 `BUSINESS_ANALYTICS.md`** — the ✅ heart of the book: campaign / ROAS / CTR / ROI /
  mission / customer analytics that render today. Grounds to `computeKpis`, `CampaignReport`, the
  `/analytics` render, the executive verdicts, and the per-client `avgRoas` rollup.
- **G004 `METRIC_PROVENANCE.md`** — owner of Law 2 (Every Metric Has Provenance) and Law 5
  (Analytics is Immutable), and the "no magic numbers" and time-context (Law 7) framing.
- **G005 `PERFORMANCE_ANALYTICS.md`** — analytics over Book D's performance memory and the
  intelligence layers (memory growth, evidence coverage, recommendation usage, approval and
  revision rates); owner in practice of Law 9 (Observability Before Optimization).
- **G006 `OPERATIONAL_ANALYTICS.md`** — per-layer operational health of the core
  (Planner / Generation / Scoring / Explanation / Review / Orchestration): throughput, latency,
  failure rates; grounds to the built-unwired monitoring hook.
- **G007 `ROLE_BASED_DASHBOARDS.md`** — owner of Law 4 (Same Data, Different Views) and Law 6
  (Every Dashboard is Derived): CEO / Manager / Operator / Customer, one truth summarized many
  ways; honest that role differentiation is ❌ because RBAC is declared but unenforced.
- **G008 `OBSERVABILITY_PLATFORM.md`** — the closing synthesis: the A–G whole, the
  Dashboards → Reports → Exports surface, and how Book H builds on A–G without changing it.

Where any of these conflicts with the laws above, the law controls and the document is corrected.

> **Observability reveals reality; it never changes reality.**

---

## 11. The invariant, restated

Because it is the spine of the entire book, the invariant is restated here in full, and it is the
sentence against which every Book G document, every metric, every dashboard, and every export is
measured:

> **Observability reveals reality; it never changes reality.**

Book G shows. It does not decide, it does not learn, it does not optimize, and it does not mutate.
It reads the frozen core's records, derives metrics from them one way only, and renders them,
locally, for a human who remains sovereign over every decision. That is the whole of what Book G is
permitted to be — and, kept honestly, it is exactly what an enterprise needs it to be.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
