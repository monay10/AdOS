# Metric Provenance

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

This document defines where a number comes from. It owns the rule that a metric is never allowed
to appear from nowhere — that every value shown to a user answers, on demand, the single question
**"from which records was this computed?"** It owns three of the platform's governing laws and
holds them together as one idea: **LAW 2 (Every Metric Has Provenance)**, **LAW 5 (Analytics is
Immutable)**, and the framing of **LAW 7 (Time is First-Class)**. Provenance says a number traces
to its source; immutability says the derivation runs one way and is never reversed; time-context
says the number is meaningless until it is scoped to a window. The three are the same discipline
viewed from three sides: a metric is *sourced*, *derived-forward-only*, and *time-bounded*, or it
is not a metric this platform will show.

The subject matter is deliberately narrow. This is not the catalogue of business metrics — that is
the sibling document [`BUSINESS_ANALYTICS.md`](BUSINESS_ANALYTICS.md), which lays out the campaign,
ROAS, CTR, ROI, and executive views that render today. This document is about the *contract beneath*
those views: the guarantee that each of them is honest about its own origin. It is the difference
between a dashboard that displays a ROAS of 4.2x and a dashboard that can, for that same 4.2x, name
the revenue and spend records it divided, the pure function that divided them, and the report
artifact that carried the result to the screen.

The whole exercise is bounded by one sentence, stated here in full because every claim that follows
is a consequence of it:

> **Observability reveals reality; it never changes reality.**

Provenance is the mechanism by which observability keeps that promise. A metric that can be traced
to its sources is a metric that only *reveals* what those sources already say. A metric that could
not be traced — a "magic number" — would be a number the analytics layer invented, and an invented
number changes reality rather than revealing it. Provenance is therefore not a feature layered on
top of analytics; it is the property that makes analytics *observability* at all rather than a
second, competing source of truth.

---

## 2. No magic numbers — LAW 2 (Every Metric Has Provenance)

> **LAW 2 — Every Metric Has Provenance.** Every metric answers "from which records was this
> computed?" No magic numbers; each number traces to its source records.

A magic number is a value on a screen that cannot explain itself — a figure whose derivation is
lost, whose inputs are unnamed, and which the user must simply trust. LAW 2 forbids them
categorically. Not "logs them," not "usually shows a tooltip" — forbids them. If a number cannot
name the records it was computed from, it is not a metric this platform is permitted to display.

This is not an aspiration awaiting implementation. It is **already true of every KPI that ships
today** (✅), and it is true because of two concrete, structural facts in the analytics engine.

It is worth naming what a magic number would look like, so the law's teeth are visible. A magic
number is a ROAS that is stored but not the numbers it was divided from; a "blended" figure whose
components were averaged away and discarded; a KPI copied from one report into another with its
lineage severed; a total that no longer names its addends. Each is a value that has outlived its
provenance. The analytics engine makes all four impossible by construction rather than by policy:
it never divides without retaining the dividend and divisor, never blends into a report that drops
its inputs, and never lets a KPI travel without the `metrics` beside it. The law is enforced by the
*shape of the data*, which is the only place a law like this can actually be enforced.

### 2.1 The KPI function takes explicit inputs (✅ SHIPPED)

The deterministic KPI engine, `computeKpis`
(`domains/analytics-engine/src/report/kpi.ts:39`), does not reach out for its inputs. It receives
them. Its entire signature is a single explicit `CampaignMetrics` argument — impressions, clicks,
conversions, leads, spend, revenue (`kpi.ts:8-19`) — and it returns six KPIs computed purely from
those named fields: CTR, CPC, CPA, CPL, ROAS, ROI (`kpi.ts:43-48`). There is no hidden state, no
ambient lookup, no fetch. Every KPI is a **pure function of named source metrics**:

- ROAS is `revenue ÷ spend` (`kpi.ts:47`) — nothing else.
- CTR is `clicks ÷ impressions × 100` (`kpi.ts:43`) — nothing else.
- ROI is `(revenue − spend) ÷ spend × 100` (`kpi.ts:48`) — nothing else.

Because the function is pure and its inputs are explicit, the provenance question has a mechanical
answer: *from which records was this ROAS computed?* From the `revenue` and `spend` fields of the
exact `CampaignMetrics` passed in. The number cannot have come from anywhere else, because the
function has nowhere else to look. Purity is not just a testing convenience here — it is what makes
LAW 2 *provable* rather than merely asserted. A pure function's output is a total, traceable
consequence of its named inputs.

### 2.2 The report retains its source metrics (✅ SHIPPED)

Purity at the moment of computation would not be enough on its own — the inputs could still be
discarded once the KPI was produced, leaving the number orphaned from its origin. The analytics
engine closes that gap. The `CampaignReport` aggregate **retains the source metrics inside its own
type**: its props hold both `metrics: CampaignMetrics` and `kpis: ComputedKpi[]` side by side
(`domains/analytics-engine/src/report/campaign-report.ts:34-35`), and the report is assembled from
both together (`campaign-report.ts:55`, generated at `:60-92`). Provenance is not a log line kept
somewhere adjacent to the report; it is a **field of the report**. The raw metrics travel with the
KPIs they produced.

The consequence is that a shipped report is self-describing. Given a `CampaignReport`, you do not
have to reconstruct where its ROAS came from — the report still carries the `revenue` and `spend`
it was computed from, in the same object. The KPI and its sources are inseparable by construction.
The `kpi(name)` accessor (`campaign-report.ts:118-120`) reads a value out; the retained `metrics`
field is always there beside it to answer for that value. This is the structural heart of LAW 2:
**the KPI never appears from nowhere; it is a pure function of named source metrics, and the report
keeps both the function's output and its inputs.**

### 2.3 What is AI, and what is not (✅ SHIPPED)

One clarification protects the law from a natural worry. A campaign report contains an
AI-generated `ReportNarrative` — a summary, highlights, and recommendations
(`campaign-report.ts:14-18`). Does that make the numbers themselves AI-generated, and therefore
un-provenanced? No, and the separation is explicit in the code: **the KPIs are pure math; only the
narrative is AI-generated** (`domains/analytics-engine/src/report/service.ts:24`). The six KPIs come
from `computeKpis`, a deterministic function; the prose *about* them comes from a model, and that
prose carries its own `AIProvenance` stamp — taskId, capability, model, engine, latencyMs
(`campaign-report.ts:20-27`, assembled `service.ts:82-84`). The number and the sentence have
different origins, and the report is honest about both: the number traces to source records, the
sentence traces to the model that wrote it. Neither is a magic number. This separation is also what
keeps the KPI trustworthy even as the narrative around it is AI-authored — a reader can trust the
4.2x precisely because its provenance is arithmetic, not prose, and the two are never conflated.

---

## 3. The provenance chain — source records to dashboard cell

LAW 2 is satisfied not at one point but along a chain. A number that reaches a user's eye has
passed through four links, and provenance means every link is traceable back to the one before it:

| Link | What it is | Where it lives (✅) |
| --- | --- | --- |
| **Source metrics** | The raw, named records: impressions, clicks, conversions, leads, spend, revenue. | `CampaignMetrics` (`kpi.ts:8-19`); entered on the analytics form and read at `apps/web/src/routes.ts:1042-1047`. |
| **KPI function** | The pure, deterministic math that turns source metrics into KPIs. | `computeKpis` (`kpi.ts:39`), six KPIs at `kpi.ts:43-48`. |
| **Report artifact** | The sealed report that carries KPIs *and* their source metrics together. | `CampaignReport` (`campaign-report.ts:55`), retaining `metrics` + `kpis` (`campaign-report.ts:34-35`); generated at `routes.ts:1037`. |
| **Dashboard cell** | The rendered value a user reads — a KPI on the `/analytics` page or a per-client rollup on `/reports`. | Rendered at `routes.ts:625-645`; per-client `avgRoas` at `routes.ts:1470`, rendered `/reports`. |

Read the chain forwards and it is a pipeline: raw records become KPIs become a report becomes a cell
on a page. Read it *backwards* and it is provenance: point at any cell and walk the arrows in
reverse until you arrive at the source records it was computed from. The `/analytics` page's ROAS
cell walks back to the report's retained `metrics`, which walk back to the numbers hand-entered on
the generation form (`routes.ts:1042-1047`). The `/reports` page's per-client **Avg ROAS**
(`routes.ts:1470`) walks back further still — it is the mean of each report's `roas` KPI
(`routes.ts:1462`), each of which walks back to its own report's source metrics. No cell is a
terminus with nothing behind it. Every cell has a path home.

This is what "each cell must be traceable back to its source records" means concretely: not that a
UI tooltip happens to exist, but that the *data structures themselves* preserve the chain, so the
trace is always reconstructable from what the system stored, not from what someone remembered to
log.

### 3.1 A traced number, end to end (✅ SHIPPED)

Make the chain concrete with one value. Suppose the `/analytics` page shows a ROAS of **4.20x** for
a campaign. Walk the arrows backwards:

1. **The cell.** The rendered ROAS on `/analytics` (`routes.ts:625-645`) is read straight off a
   `CampaignReport`; it holds no number of its own. Unplug the report and the cell is empty. So the
   cell's origin is the report.
2. **The report.** The `CampaignReport`'s `roas` KPI is `report.kpi('roas')`
   (`campaign-report.ts:118-120`), a plain read of a value already stored in `kpis`
   (`campaign-report.ts:35`). The report did not compute it at render time; it *retained* it,
   alongside the `metrics` it came from (`campaign-report.ts:34`). So the report's origin is the
   computation that filled those fields.
3. **The function.** That `roas` value was produced by `computeKpis` as `revenue ÷ spend`
   (`kpi.ts:47`). Given the retained `metrics`, the 4.20x is not a claim — it is arithmetic anyone
   can redo. So the function's origin is its explicit `CampaignMetrics` input.
4. **The source records.** Those `revenue` and `spend` figures are the values entered on the report
   generation form and read at `routes.ts:1042-1047`. That is the floor of the trace: the agency's
   own hand-entered campaign numbers. There is nothing behind them because they *are* the source.

Four links, four resolvable references, one number that can name every place it has been. That is
provenance as a structural property, not a courtesy.

---

## 4. Analytics is Immutable — LAW 5 (recompute, never rewrite)

> **LAW 5 — Analytics is Immutable.** Derivation flows one way: Events → Metrics → Reports, and
> NEVER Reports → Events. Analytics may *recompute* a metric from source; it never *rewrites*
> history or reverses the direction of derivation.

Provenance would be worthless if the chain in §3 could run backwards. If a report could reach back
and edit the source records it was derived from, the "source" would no longer be a source — it would
be whatever the latest report decided it should be, and the trace home would lead to a fiction. LAW
5 forbids the reverse arrow. Derivation is one-directional: **Events → Metrics → Reports**, and
never **Reports → Events**.

### 4.1 Recompute is allowed; rewrite is forbidden

The distinction that makes LAW 5 livable is the difference between *recomputing* a metric and
*rewriting* history. They sound similar and are opposites:

- **Recompute (allowed).** Run the pure function again over the same or corrected source metrics
  and produce a fresh result. Because `computeKpis` (`kpi.ts:39`) is pure and deterministic — "the
  same inputs always produce the same KPIs" (`kpi.ts:35-38`) — recomputing is safe by construction:
  the same source records yield the same KPI, every time, forever. If a source metric was entered
  wrong and corrected, recomputation produces a new, correctly-derived number. Nothing about the
  past is falsified; a new derivation is run forward over corrected inputs.
- **Rewrite (forbidden).** Reach backwards from a computed report and alter the events or source
  records the derivation depended on, so that history now "agrees" with a number someone wanted.
  This reverses the arrow. It makes the report the author of its own inputs. It is precisely the
  move LAW 5 exists to forbid, because it turns provenance into a loop and observability into
  invention.

Recomputation re-runs the function. Rewriting edits the past. The first keeps the derivation
one-way; the second reverses it. The whole of LAW 5 is: you may do the first as often as you like,
and you may never do the second.

A quiet property of the shipped engine makes recomputation trustworthy: because `computeKpis` is
pure, a recompute over unchanged source metrics is a *no-op in meaning* — it returns the identical
KPI it returned before. There is no drift, no accumulation, no "each run nudges the number." A
recomputed metric is either identical to the last (inputs unchanged) or a clean forward derivation
over corrected inputs (inputs changed). At no point does recomputation reach backward. This is why
the platform can offer recomputation freely without opening a door to rewriting: the function's
purity guarantees that re-running it can only ever move information *forward* along the chain.

### 4.2 The read-only proof (✅ SHIPPED)

LAW 5 is not only a rule; in the shipped product it is a *demonstrated property*. The analytics
paths — the `/analytics` render (`routes.ts:625-645`), the executive view, and the per-client
`/reports` rollup (`buildReportSnapshot`, `routes.ts:1436-1488`) — are **pure reads**. They
enumerate and fetch existing state (`.list`/`.get`) and compute views from it. They write nothing
back into the execution state they observe. The direction of the arrow is enforced by the simple
fact that the reading code has no writing to do.

There is exactly one write that touches execution-state knowledge on the mission path, and it is
instructive precisely because it sits **outside** analytics: `recordLearning`
(`apps/web/src/routes.ts:1092`). That flow reads a completed mission's report and records its
outcome into the company's knowledge stores (`routes.ts:1092-1109`). It is a *learning* step, not an
*analytics* step — it belongs to the intelligence layer that compounds what the company knows, not
to the observability layer that shows what happened. The boundary is clean: everything the analytics
surface does is read; the one write lives elsewhere. That separation is the read-only proof. It is
what lets this document claim, and not merely assert, that **analytics reveals reality and never
changes it** — the analytics code literally cannot change execution state, because it never writes
to it.

---

## 5. Time is First-Class — LAW 7 (the window on every metric)

> **LAW 7 — Time is First-Class.** Every metric MUST carry a time context — Last 7 Days /
> Last 30 Days / Quarter / Year / Lifetime. No number is ever shown without its time window.

The third law this document frames is about a different kind of provenance: not *which records* but
*over what span*. A ROAS of 4.2x is not a fact until you know 4.2x **over what period**. Last week?
This quarter? The campaign's lifetime? The same source records aggregated over different windows
produce different, equally-valid numbers, and a value quoted without its window is not precise — it
is ambiguous. LAW 7 states the consequence bluntly: **a number without a window is meaningless**, and
so no number may be shown without one.

Time context is therefore part of provenance, not a separate concern. The full provenance question
is two-part: *from which records* (LAW 2) *over which window* (LAW 7). A metric answers both or it
answers neither honestly. This is why time is "first-class" — the window is not a filter applied
after the fact to a pre-existing number; it is a defining input of the number, on the same footing
as the source records themselves.

### 5.1 The honest tier — live time-window selection is not built (❌ ROADMAP)

Here the document must be exact about status. Live, user-selectable time windows —
7d / 30d / quarter / year / lifetime as a control the user can switch between — are **❌ ROADMAP**.
They are not implemented. What ships today are **snapshots**: a `CampaignReport` is a per-campaign
snapshot of the metrics entered for that campaign, and the per-client `/reports` rollup
(`buildReportSnapshot`, `routes.ts:1436-1488`) is a per-client snapshot aggregated across that
client's missions. Neither is time-bucketed. There is no control that re-scopes a metric to "the
last 30 days," because reports are not stored against a time axis that such a control could slice.

This is stated without dressing it up, because LAW 7 is a **design mandate** the shipped snapshots do
not yet meet, and honesty about that gap is the point. What the platform commits to is unambiguous:
when time-window selection is built, the window becomes a required part of every metric — the same
way source records are required today under LAW 2. A metric will not be displayable without its
window any more than a KPI is computable without its inputs. The design does not treat time as a
future nicety; it treats today's window-less snapshots as an *incomplete* satisfaction of a law
already on the books, and it names the completion that LAW 7 requires.

### 5.2 The window as a fifth link in the chain

Framed against §3, LAW 7 adds a cross-cutting requirement to the whole provenance chain: every cell
must also declare the window it covers. A fully-provenanced metric answers three questions at once —
*from which records* (LAW 2), *derived which way* (LAW 5), and *over which window* (LAW 7). Today's
snapshots answer the first two and leave the third implicit — a `CampaignReport` covers "this
campaign as entered," and the `/reports` rollup covers "this client, all missions to date"
(`routes.ts:1436-1488`). Those are *implicit* windows, and an implicit window is exactly what LAW 7
forbids: it must be *stated*, so that two numbers are never silently compared across mismatched
spans. The important honesty is directional. The mandate is not "add a date picker someday"; it is
that the window is a *property of the metric*, and until it is carried explicitly on every metric,
the provenance a metric offers is one field short of complete. The completion is named; the control
is ❌; the law stands.

---

## 6. The three laws as one discipline

This document owns three laws because they are, in practice, a single discipline enforced at three
moments in a metric's life:

- **At computation (LAW 2)** — the number is derived by a pure function from explicit, named source
  records (`computeKpis`, `kpi.ts:39`), and those records are retained beside the result
  (`campaign-report.ts:34-35`). The number can name its origin.
- **Across time and correction (LAW 5)** — the derivation runs one way, Events → Metrics → Reports.
  A metric may be recomputed forward from source; the source is never rewritten backward from the
  metric. The read-only analytics path, with the one write held outside it
  (`recordLearning`, `routes.ts:1092`), is the proof.
- **At display (LAW 7)** — the number is scoped to a window, because a number without a span is not
  yet a fact. Live window selection is ❌ today; the mandate stands regardless.

Together they define what it means for a value in this platform to *be a metric* rather than a
decoration: sourced, forward-derived, and time-bounded. A value that fails any one of the three is
not a metric the platform will vouch for. LAW 2 gives it an origin; LAW 5 keeps that origin true
over time; LAW 7 makes it precise. Strip any one away and the number stops being observability and
starts being assertion.

---

## 7. Boundaries — local, own-data-only, read-only

Provenance lives inside the same boundaries that hold across the whole platform, and on the
provenance path they are not incidental — they are what make the trace trustworthy:

- **100% local, offline-first.** Every link in the provenance chain — the `CampaignMetrics` inputs,
  the `computeKpis` math, the retained `CampaignReport`, the rendered cell — is computed and held on
  the local machine. A metric's sources are the agency's own records; the trace home never leaves the
  device.
- **Own data only — the opposite of telemetry.** The source records a metric traces to are the
  agency's own campaign numbers, entered by the agency (`routes.ts:1042-1047`). No metric is derived
  from external data, and no metric, source record, or report is transmitted to a vendor, a model
  provider, or any external endpoint. Analytics here is the inverse of telemetry: telemetry ships
  *your* numbers to *someone else*; this platform keeps the record — and its full provenance — with
  the agency. Provenance you cannot see because it was sent away is no provenance at all; provenance
  that stays local is provenance you can always walk.
- **Read-only with respect to execution state.** Per §4, the analytics surface only reads. It derives
  reports from state; it never writes back into the mission, evidence, memory, or creative state it
  observes. The single learning write (`recordLearning`, `routes.ts:1092`) is deliberately outside
  the analytics path.
- **Human-sovereign.** A provenanced metric informs a human; it never decides. Making a number
  traceable is precisely what lets a human *interrogate* it rather than obey it — provenance serves
  the human's judgement, it does not replace it.

The one-line boundary: **a metric's origin is visible to its owner, held locally, and sent nowhere.**

---

## 8. Value contribution

Provenance maps to both value levers, and it does so more directly than most capabilities because a
traceable number is, itself, a unit of trust an agency can sell and act on.

**It grows agency revenue by making every number defensible to a client.** An agency's product is,
in the end, its credibility — a client pays for numbers it can rely on. A ROAS an agency can defend,
line by line, back to the revenue and spend it was computed from is a ROAS a client will trust; a
number no one can explain is a number a sharp client will discount. Because every shipped KPI is a
pure function of named source metrics (`kpi.ts:39`) and every report retains those metrics beside
its results (`campaign-report.ts:34-35`), an agency using this platform can answer "where did that
figure come from?" in the meeting, from the artifact, rather than in a scramble afterwards. That is
the difference between reporting a client tolerates and reporting a client renews on — and renewal
is revenue.

**It cuts production time by turning reconciliation into a lookup.** The hours a reporting analyst
loses are rarely spent computing — they are spent *reconciling*: chasing a number back through
spreadsheets to prove it is right, re-deriving a KPI because no one recorded which inputs produced it,
rebuilding a report because the source rows drifted. Provenance deletes that work at the root. The
source metrics are retained with the KPIs (`campaign-report.ts:34-35`); the derivation is a pure,
re-runnable function (`kpi.ts:39`); the immutability of the one-way chain (§4) means a metric never
silently disagrees with its own sources. "Prove this number" collapses from an investigation into
reading a field. Across a book of clients, the difference between provenanced metrics and orphaned
ones is the difference between a report you can stand behind at a glance and one you must reassemble
by hand.

> **Observability reveals reality; it never changes reality.**

That sentence is the value proposition compressed. A metric that reveals — sourced, forward-derived,
time-bounded — is a metric an agency can build a business on. A metric that changes reality — a magic
number, a rewritten history, a window-less figure — is a liability waiting to be caught. Provenance
is what keeps every number in the platform on the first side of that line.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
