# Business Analytics

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

This document defines the part of the analytics layer that is **most fully shipped**: the
campaign, ROAS, CTR, ROI, mission, and client-rollup views a user can generate and read in the
live web application **today**. Where the rest of Book G describes machinery that is built but not
yet wired, or contracts with no implementation yet, this document is where the ✅ story lives —
and it tells that story concretely, citing the exact code that runs when a user clicks a button.

The organising idea of business analytics is a clean separation the code already enforces: **the
numbers are deterministic math, and only the prose around them is AI.** A campaign's KPIs —
click-through rate, cost per click, cost per acquisition, cost per lead, return on ad spend,
return on investment — are computed by pure functions over the raw metrics a user enters. There is
no model in that path, no randomness, no "estimate." The AI Manager is asked afterward, for one
thing only: a narrative that reads the numbers back in plain language. That boundary is what makes
these views trustworthy, and it is the reason business analytics is the strongest tier in the
book.

One sentence bounds everything that follows, and it is stated here in full because it is the
boundary of the whole layer:

> **Observability reveals reality; it never changes reality.**

Business analytics computes KPIs from metrics a run produced and renders them. It does not change a
mission, adjust a budget, rewrite a creative, or feed a number back into the pipeline. It reads the
record and shows it. Everything below is that principle made concrete.

---

## 2. The deterministic KPI engine — `computeKpis` (✅ SHIPPED)

At the centre of business analytics is a single pure function: `computeKpis`
(`domains/analytics-engine/src/report/kpi.ts:39`). It takes one `CampaignMetrics` input —
impressions, clicks, conversions, leads, spend, and revenue — and returns the six standard
advertising KPIs. It is **pure, deterministic domain math**: the same inputs always produce the
same KPIs, with no model, no clock, and no hidden state involved.

The six KPIs are computed in one place (`kpi.ts:43-48`):

| KPI | Meaning | Formula (as coded) | Unit |
| --- | --- | --- | --- |
| **CTR** | Click-through rate | `clicks ÷ impressions × 100` | `%` |
| **CPC** | Cost per click | `spend ÷ clicks` | currency minor units |
| **CPA** | Cost per acquisition | `spend ÷ conversions` | currency minor units |
| **CPL** | Cost per lead | `spend ÷ leads` | currency minor units |
| **ROAS** | Return on ad spend | `revenue ÷ spend` | `x` |
| **ROI** | Return on investment | `(revenue − spend) ÷ spend × 100` | `%` |

Three design choices make this engine dependable, and each is visible in the code:

- **No division by zero.** Every ratio runs through a `safeDiv` helper (`kpi.ts:33`) that returns
  `0` when the denominator is `0`. A campaign with no impressions yields a CTR of `0`, not a crash
  or a `NaN`. There is no code path where a missing input poisons the whole report.
- **No float drift on money.** Spend and revenue arrive as `Money` in **minor units**
  (`kpi.ts:40-41`) — the smallest currency unit — so the arithmetic stays in integers where it
  matters and never accumulates the rounding error floating-point currency math is prone to.
- **Deterministic rounding.** Every value is passed through a fixed `round` helper (`kpi.ts:27-30`)
  to two decimal places. The output is stable and comparable: the same metrics always render the
  same numbers, to the same precision.

This is the purest expression of the layer's honesty. A KPI here is not an opinion the system
formed; it is arithmetic anyone can check by hand from the metrics that were entered. That is what
lets the rest of the product — and an auditor — trust the number without trusting a model.

### 2.1 A worked example — the determinism made visible

Determinism is easy to assert and easy to check. Take a single campaign's entered metrics:
`120,000` impressions, `3,600` clicks, `180` conversions, `240` leads, `450,000` minor units of
spend, and `1,350,000` minor units of revenue. `computeKpis` returns, every single time:

| KPI | Computation | Result |
| --- | --- | --- |
| CTR | `3,600 ÷ 120,000 × 100` | `3%` |
| CPC | `450,000 ÷ 3,600` | `125` minor units |
| CPA | `450,000 ÷ 180` | `2,500` minor units |
| CPL | `450,000 ÷ 240` | `1,875` minor units |
| ROAS | `1,350,000 ÷ 450,000` | `3x` |
| ROI | `(1,350,000 − 450,000) ÷ 450,000 × 100` | `200%` |

Run the same inputs a thousand times, on any machine, and you get the same six rows. Now zero out
the impressions: CTR does not throw and does not become `NaN` — `safeDiv` returns `0` and the other
five KPIs are unaffected. This is why the number on the screen is a fact and not a forecast: there
is exactly one function between the metrics and the KPI, and it has no room to disagree with
itself.

---

## 3. `CampaignReport` — the numbers keep their source; only the narrative is AI (✅ SHIPPED)

The KPI engine produces numbers; the **`CampaignReport`** aggregate
(`domains/analytics-engine/src/report/campaign-report.ts:55`) is what packages those numbers into a
durable, readable report — and it does so in a way that keeps every KPI traceable back to the exact
metrics it came from.

### 3.1 The report retains its own source metrics

The report's props hold both the computed KPIs **and** the raw `CampaignMetrics` they were derived
from, side by side (`campaign-report.ts:34-35`). This is provenance built into the type: a
`CampaignReport` never carries a floating ROAS with no lineage — it carries the ROAS *and* the
spend and revenue that produced it. Given a report, you can always answer "from which numbers was
this computed?" without leaving the object. That is Law 2 (Every Metric Has Provenance) satisfied
at the level of the data structure, not by a convention someone has to remember to follow.

### 3.2 The narrative is the only AI part

A `CampaignReport` also carries a `ReportNarrative` (`campaign-report.ts:14`) — a summary,
highlights, and recommendations — and this is the **only** AI-generated content in the entire
report. The report service is explicit about the split in its own words: *"The KPIs are pure math;
only the narrative is AI-generated, and it carries provenance"*
(`domains/analytics-engine/src/report/service.ts:24`).

The service (`service.ts:36`) computes the KPIs deterministically first, then submits them to the
AI Manager as a reasoning task — through a `promptRef`, never touching a model directly — asking
only for prose grounded in numbers that were already fixed. The model reads the KPIs; it does not
compute them and it cannot change them. If the narrative call fails, the failure is contained; the
KPIs it was asked to describe were never in doubt.

### 3.3 The narrative carries provenance

Because the narrative is AI-generated, it is stamped with an **`AIProvenance`** record when the
report is assembled (`service.ts:73-79`) — the `taskId`, `capability`, `model`, `engine`, and
`latencyMs` behind the prose. So the one AI element of the report can always say which model wrote
it and how long it took. The deterministic KPIs need no such stamp — they are reproducible by
formula — but the generated sentence next to them is fully accountable. The report, taken whole, is
a number you can recompute and a paragraph you can attribute.

When a report is generated it also emits a `ReportGenerated` domain event carrying the mission,
client, campaign, and the ROAS value (`campaign-report.ts:40-48`) — a fact published onto the bus,
not a decision fed back into anything. The event announces *that a report exists*; nothing
subscribes to it in order to change a mission. This is the shape of the whole layer in one detail:
analytics emits, it does not command.

### 3.4 The one-way flow, end to end

Reading §2 and §3 together, the derivation runs strictly downhill and never back up:

```
hand-entered metrics  →  computeKpis (pure math)  →  CampaignReport (KPIs + retained metrics
                                                     + AI narrative + provenance)  →  rendered views
```

Each arrow points one way. Metrics produce KPIs; KPIs and their source metrics are fixed into a
report; the report is rendered. No view reaches back to edit a metric, and no report rewrites the
run that produced it. When a figure needs to be current, the layer re-runs the arrows from the
source — it never patches the far end. That one-directional shape is Law 5, and it is the reason a
`CampaignReport` can be trusted as a stable record rather than a mutable scratchpad.

---

## 4. Rendered live — the `/analytics` view (✅ SHIPPED)

None of this is theoretical: it runs on a live route. When a user submits a campaign's results, the
web app's `generateReport` handler (`apps/web/src/routes.ts:1016`) takes over. It confirms the
mission's campaign has been approved, then reads the **raw performance metrics the user
hand-entered** — impressions, clicks, conversions, leads, spend, revenue
(`routes.ts:1042-1047`) — and passes them to the report service (`routes.ts:1037`), which runs
exactly the deterministic pipeline of §2 and §3.

That the metrics are **hand-entered** is worth stating plainly rather than hiding: business
analytics today observes the results a human records for a campaign. There is no live ad-network
feed. This is honest and it is also correct for the boundary the product holds (§9) — the numbers
come from the agency's own record of its own campaign, entered by the agency, and never fetched
from an external endpoint.

The handler is also careful about *when* a report may be produced. Before it computes anything, it
checks that the mission has a campaign and that its campaign has been **approved**
(`routes.ts:1021-1024`); a report cannot be generated for work a human has not signed off. And the
entered figures are parsed defensively — non-negative integers for the count fields, valid numeric
minor units for spend and revenue — so a stray input is rejected at the door rather than flowing
into the KPI math. Observability begins with clean, approved inputs; it does not paper over bad
ones.

The generated reports are then rendered at **`/analytics`** (`routes.ts:625-645`) as a list, one
row per report, surfacing the headline KPIs directly:

- **ROAS** (`rep.kpi('roas')`), shown as `…x` and linked back to its mission,
- **ROI** (`rep.kpi('roi')`), shown as `…%`,
- **CTR** (`rep.kpi('ctr')`), shown as `…%`,
- and the AI narrative's **summary** line.

Every cell on that page is a value `computeKpis` produced (or the narrative it grounded), read
straight off the stored report. The view holds no numbers of its own; unplug the reports and the
page is empty — Law 6 (Every Dashboard is Derived) in miniature. It shows ROAS, ROI, and CTR; it
never annotates them with "spend more here" (Law 9; see §8).

---

## 5. Executive verdicts — the `/executive` view (✅ SHIPPED)

One level up from a single campaign's KPIs sits the **executive** synthesis: a CEO-facing read of a
whole mission. Its defining element is a **verdict** — a single, plain judgement of how the mission
did — typed as exactly three values, `exceeded | on_track | at_risk`
(`domains/executive-ai/src/dashboard/executive-report.ts:30`), and carried on the executive
report's `DashboardContent` (`executive-report.ts:40`) alongside a headline, key results, and an
executive summary.

The executive report is generated by `generateExecutive` (`routes.ts:1055`), which requires an
analytics report to already exist — it synthesises *over* the KPIs, it does not invent new ones —
and is **idempotent**: if an executive report has already been produced for the mission, the
handler simply redirects rather than generating a second one. It is rendered at **`/executive`**
(`routes.ts:707-728`). Each row shows the mission objective, the verdict as a badge
(`routes.ts:710`, where an `exceeded` verdict is highlighted), the AI headline, and the model that
produced it.

The verdict does not stand alone: the `DashboardContent` also carries an executive summary, a set
of **key results** — each a metric with its own value, unit, and per-result verdict
(`executive-report.ts:32-37`) — and the decisions and next actions the mission recorded. The
executive view is therefore the same underlying mission data as the campaign report, summarised for
a different reader. That is Law 4 (Same Data, Different Views) at work: the CEO row and the
`/analytics` row are two summaries of one truth, not two competing truths.

The verdict is the sharp edge of Law 3 (Dashboard ≠ Decision) and Law 9 (Observability Before
Optimization). "At risk" is an **observation** about a mission's recorded results — it is the
dashboard telling the human where to look. It is not an instruction, not an automatic action, and
not a change to the mission. A human reads `at_risk` and decides what, if anything, to do. The
executive view compresses the truth for a busy reader; it never makes the call the reader exists to
make.

---

## 6. Per-client rollup — `avgRoas` across a client's missions (✅ SHIPPED)

The third live view widens the lens again, from one mission to **one client**. The
`buildReportSnapshot` helper (`routes.ts:1436-1488`) assembles a client-level performance snapshot
by reading — read-only — every mission for that client, and for each mission its campaigns, its
analytics reports, and its executive reports.

From those records it derives a small set of rollup metrics (`routes.ts:1473-1480`):

- **Missions** and **Completed** — counts of the client's missions and how many finished.
- **Campaigns** — total campaigns across those missions.
- **Total budget** — the client's committed spend, summed in minor units and formatted once.
- **Avg ROAS** — the average of every campaign report's ROAS for the client (`routes.ts:1470`),
  computed by collecting each report's `kpi('roas')` and averaging with the same fixed
  two-decimal rounding the KPI engine uses.
- **CEO verdicts** — a tally of how many of the client's missions landed `exceeded`, `on_track`,
  and `at_risk`.

Alongside the metrics, the snapshot composes a one-line **summary** in plain language
(`routes.ts:1482-1485`) — "*{client} ran N missions (M completed) across K campaigns on a total
budget of …, averaging N.Nx ROAS*" — assembled entirely from the counts just derived, with a
distinct wording when the client has no missions in scope yet. It is generated text in the sense of
string composition, not a model call: the rollup carries no AI at all, only arithmetic and a
sentence built from it.

The result renders at **`/reports`** (`routes.ts:648-669`, generated via the POST handler at
`routes.ts:685-696`) as the client's performance report. Note what `avgRoas` is and is not: it is a
**recomputation from source** — each mission's stored ROAS, re-read and averaged on demand. It is
never a separate stored number that could drift from the reports beneath it. Change a campaign
report and rebuild the snapshot, and the average moves with it, because the average was only ever
derived from the reports. This is Law 5 (Analytics is Immutable) in practice: analytics *recomputes*
from the source, it never *rewrites* the source (see §8).

---

## 7. Time is First-Class — what today's views carry, and what they don't (Law 7)

Law 7 requires that every metric carry a time context, and this document must be honest about how
far the shipped views meet it.

**What is true today:** each business-analytics view is a **snapshot** with a clear, if implicit,
scope. A `CampaignReport` is the record of *one campaign's* results as entered. An executive report
is the read of *one mission*. A client rollup is the state of *one client's* missions *at the moment
the snapshot was built* — `buildReportSnapshot` reads the current records each time it runs. Every
number is bounded; none is a floating figure with no context at all.

**What is not shipped:** a **live time-window control** — the ability to ask for the last 7 days,
last 30 days, this quarter, this year, or lifetime, and have every metric rebucket to that window.
That does not exist. Today's reports are **per-campaign and per-client snapshots, not
time-bucketed series**. There is no date-range selector on `/analytics`, no trend line, no
period-over-period comparison. Selectable time windows as a live control are **❌ ROADMAP**, and no
code is cited for them because none implements them.

The distinction is precise and worth holding: the shipped views are *scoped* (to a campaign, a
mission, a client) but not *windowed* (to a span of time you can choose). Law 7's full form — no
number shown without its chosen time window — is a target these views point toward, not one they
yet reach. Naming that keeps the ✅ tier honest: everything else in this document renders today;
time-window selection does not.

When time-bucketing does arrive, nothing about §2–§6 has to change to accommodate it. The KPI
engine is already a pure function of a metric set; a windowed view is the same engine run over the
metrics that fall inside a chosen span. The gap in Law 7 is a missing *control*, not a missing
foundation — the deterministic, provenance-carrying core the window would sit on is already
shipped.

---

## 8. The laws this document honors

Business analytics is where several of the book's laws are most visibly *already true* in shipped
code.

### Law 2 — Every Metric Has Provenance
Every KPI on every shipped view traces to its source. `computeKpis` takes explicit input metrics
(`kpi.ts:39`) and the `CampaignReport` **retains those metrics** next to the KPIs it produced
(`campaign-report.ts:34-35`). There are no magic numbers: given any ROAS on `/analytics`, you can
follow it to the revenue and spend it came from, without leaving the report. The client rollup's
`avgRoas` (`routes.ts:1470`) traces one level further — to the set of mission ROAS values it
averaged. Provenance here is structural, not documentary.

### Law 5 — Analytics is Immutable (Events → Metrics → Reports, one way)
Derivation flows in exactly one direction. Raw metrics are entered (`routes.ts:1042-1047`);
`computeKpis` turns them into KPIs; a `CampaignReport` fixes those KPIs with their source
(`campaign-report.ts:34-35`); the rollup averages across reports (`routes.ts:1470`). At no point
does a report flow *back* to rewrite the metrics, and no view mutates a mission. When numbers need
refreshing, the layer **recomputes from source** — as `buildReportSnapshot` does on every call — it
never reverses the arrow. Reports are derived from events; events are never edited by reports.

### Law 9 — Observability Before Optimization
Business analytics **shows** ROAS, CTR, ROI, and a mission verdict. It never says *"spend more
here"* or *"shift budget there."* The `/analytics` view lists the numbers; the executive view labels
a mission `at_risk`; neither prescribes an action. Even the AI narrative is scoped to describing the
results, and it is the only generated content in an otherwise arithmetic report (§3.2). Optimization
— the "change this" — is Book E's domain and the human's decision. This layer measures and compares;
it does not instruct.

Together these three laws are the reason business analytics can be the strongest ✅ tier without
overreaching: it presents trustworthy, traceable, one-directional numbers, and stops exactly at the
line where showing would become deciding.

---

## 9. Boundaries — local, own-data-only, no vendor telemetry

The business-analytics views hold inside the same boundaries as the whole platform, and on the
analytics path they are non-negotiable:

- **100% local, offline-first.** The KPI math (`kpi.ts:39`), the report aggregate
  (`campaign-report.ts:55`), the report service (`service.ts:36`), and every render route
  (`routes.ts:625-645`, `:707-728`, `:648-669`) run entirely on the local machine. No metric is
  computed off-device.
- **Own data only.** The raw metrics are the agency's own, hand-entered for its own campaigns
  (`routes.ts:1042-1047`). Nothing is fetched from an ad network, an analytics vendor, or any
  external source. The reports describe the agency's record of its own work.
- **No vendor telemetry.** This is the sharpest boundary. Analytics here is the **opposite** of
  telemetry: telemetry sends your activity to someone else; this layer keeps every KPI, report, and
  rollup with the agency and transmits nothing off-device. Even the AI narrative runs through the
  local AI Manager, and its only trace of the model is a provenance stamp kept in the report
  (`service.ts:73-79`), not a call phoning home.
- **Read-only w.r.t. execution state (Law 1).** Generating and rendering these reports reads
  missions, campaigns, and reports (`.list` / `.get`); it never writes back to a mission, a
  creative, or a budget. Producing a report artifact is not mutating execution state.
- **Human-sovereign.** Every view informs; the human decides. The verdict is a label for a person to
  read, not a trigger.

The one-line boundary: **these numbers are the agency's own record, computed locally, shared with
no one.**

---

## 10. Value contribution

Business analytics maps directly to both of the platform's value levers, and unusually concretely,
because a KPI is quite literally a measurement of the money.

**It grows agency revenue by making campaign performance provable to a client.** ROAS, ROI, and CTR
are the numbers an agency reports upward to justify a budget and win the next one. Because
`computeKpis` is deterministic and the `CampaignReport` retains the metrics behind every KPI, the
agency can put a ROAS in front of a client *and show the spend and revenue it came from* — a claim
that survives scrutiny rather than one that asks for trust. The executive verdict and the per-client
rollup turn that from a per-campaign fact into a per-client story: "across your missions this
period, average ROAS was N.Nx." A performance number a client can audit is a performance number that
renews an account.

**It cuts production time by making the report the click of a button.** The KPIs, the AI narrative,
the executive synthesis, and the client rollup are all generated from records the run already
produced — no analyst rebuilding a spreadsheet, no manual ROAS arithmetic, no reconciling numbers by
hand. `generateReport` (`routes.ts:1016`) turns entered results into a rendered, narrated,
provenance-stamped report in one submission, and `buildReportSnapshot` (`routes.ts:1436-1488`) rolls
a client's whole book up on demand. The time that used to go into assembling a client report goes
instead into the work the report is about.

**It compounds across the agency's book.** Because the same deterministic engine feeds the campaign
view, the executive verdict, and the client rollup, the three tiers are consistent by construction:
the ROAS a client sees on their performance report is an average of the very ROAS figures on the
individual campaign reports, which are the very numbers `computeKpis` produced from the entered
metrics. There is no reconciliation step where the "summary" and the "detail" can drift apart,
because the summary is only ever a recomputation of the detail. A single source of KPI truth,
rendered at three altitudes, is worth more than three dashboards that happen to agree.

A deterministic KPI engine, a report that keeps its own provenance, and a rollup that recomputes
from source — shown, never decided upon — is what turns raw campaign results into an account an
agency can stand behind in front of its own clients.

> **Observability reveals reality; it never changes reality.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
