# Operational Analytics

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

This document defines **operational analytics** — the view that treats each **layer** of the core
operating system as a component with its own operational health, and reports three vital signs for
each of them: **throughput** (how many units of work the layer handled), **latency** (how long the
layer took per unit), and **failure rate** (how often the layer's work did not complete cleanly). The
layers are the six moving parts of the governed pipeline — **Planner**, **Generation**, **Scoring**,
**Explanation**, **Review**, and **Orchestration** — and operational analytics asks of each one the
same maintenance-engineer question: *how is this component performing, right now, across every run it
participated in?*

It is worth stating at the outset that this is a **layer-health** view, not a run view. A single
mission run passes through several layers; a single layer participates in many runs. Operational
analytics slices the second way. It does not follow one run from start to finish; it holds one layer
still and asks how it is behaving in aggregate — the way you would monitor an engine part across
thousands of journeys rather than narrate a single trip. That framing is what separates this document
from its sibling in Part 1 (§2), and it is the frame every section below inherits.

Operational analytics is a member of the Observability Layer, and it is bound by the same sentence
that bounds every document in Book G:

> **Observability reveals reality; it never changes reality.**

Measuring how fast Generation runs does not make Generation faster. Counting Scoring's failures does
not repair one. Reporting Orchestration's throughput does not re-route a single run. This document
describes instruments that *read* the layers of the core and render what they read. The layers
themselves — the intelligence that drafts, judges, explains, and coordinates — belong to the frozen
A–F core, and operational analytics may never reach into any of them. It watches; it does not touch.

---

## 2. Operational analytics vs. pipeline analytics — the load-bearing distinction

Book G contains two documents that both look at the orchestration machinery, and they must not be
confused, because they slice the same records along **different axes**. This section states the
difference plainly so the two never overlap.

**Pipeline analytics** — [`../1-execution-analytics/PIPELINE_ANALYTICS.md`](../1-execution-analytics/PIPELINE_ANALYTICS.md)
(G002) — observes the **run as a whole**. Its unit of analysis is one orchestration run: the sequence
of stages that run executed, the run's total duration, the retries inside it, the human approval it
received, and how it ended — approved, revised, or failed. Read a G002 view and you are reading the
biography of a run: *this mission went through these stages, took this long, was approved here, and
ended like this.*

**Operational analytics** — this document (G006) — observes **each layer as a component**. Its unit
of analysis is one layer across *all* runs: not "how did run #412 go?" but "how is **Generation**
performing as a part — across every run it has ever served?" Read a G006 view and you are reading the
health chart of a component: *Generation handled this many units, averaged this latency, failed this
often, in this time window.*

The distinction is exactly the difference between a **trip log** and an **engine diagnostic**:

| | **G002 — Pipeline Analytics** | **G006 — Operational Analytics** |
| --- | --- | --- |
| **Unit of analysis** | One run (a mission's pass through the pipeline) | One layer (a component, across all runs) |
| **Question answered** | *How did this run go?* | *How is this layer performing?* |
| **Axis of the slice** | Along the run — stage sequence, run duration, run outcome | Across the runs — one layer's throughput / latency / failure rate |
| **Natural artifact** | A run's stage-by-stage timeline | A layer's operational health chart |
| **Grain** | Per run | Per layer, aggregated over a time window |

Both draw from the **same underlying records** — this is Law 4 (*same data, different views*) in
action: the run records the core produces feed G002 and G006 alike; the two documents summarise that
one truth differently. Neither owns a private data source. And crucially, both share the same honest
posture: the rich per-run and per-layer records exist in built-but-unwired form and are **not produced
on live runs today** (§4, §5). G002 is honest about that for the run; this document is honest about it
for the layer.

Keep the axes straight and the two documents never collide: G002 follows a run down the pipeline;
G006 holds a layer still and watches it work.

A concrete example makes the boundary unmistakable. Suppose the Scoring layer begins timing out. In
G002, that surfaces *inside individual runs* — a scattering of runs each show a slow or failed Scoring
stage in their timeline, and you would have to read many run biographies to notice the pattern. In
G006, the same fact surfaces as *one line on one chart*: Scoring's failure rate for the window rises,
attributed to the layer, across every run at once. Same records, same truth — but only the per-layer
slice makes the degrading component legible as a single reading. That is the value of holding the
layer still, and it is why the two views are complementary rather than redundant.

---

## 3. The six layers and the books that own them

Operational analytics does not invent the layers it measures. They are the components of the governed
pipeline defined by the frozen core, and each maps to a book that owns its intelligence. This document
**references** those books; it never re-documents or redesigns them. The layer is the subject of the
measurement; the book is where the subject lives.

| Layer | What it does in a run | Owning book | Layer status |
| --- | --- | --- | --- |
| **Planner** | Decomposes a mission into the tasks the pipeline will execute | Contract only — see [`../../book-f/`](../../book-f/) | ❌ (contract) |
| **Generation** | Drafts the creative work | [`../../book-b/`](../../book-b/) | core-owned |
| **Scoring** | Judges the work's quality / confidence | [`../../book-e/`](../../book-e/) | core-owned |
| **Explanation** | Produces the rationale for the work | [`../../book-c/`](../../book-c/) | core-owned |
| **Review** | The human gate + performance memory around it | [`../../book-d/`](../../book-d/) | core-owned |
| **Orchestration** | Sequences the layers and produces the run record | [`../../book-f/`](../../book-f/) | core-owned |

Two clarifications this table earns:

- **Planner is a contract, not a shipped layer.** It appears in the pipeline's design as the
  decomposition step, but there is no implemented Planner component to measure. Its operational
  metrics are therefore **❌ ROADMAP** with nothing behind them yet — and because it is unbuilt, this
  document assigns it **no citation**, per the tier rules.
- **Review is a human layer.** Its "operational" character is unlike the others: its latency is a
  human's deliberation time and its "failure rate" is really a revision rate. Its rates are the domain
  of Part 3 ([`../3-performance-analytics/PERFORMANCE_ANALYTICS.md`](../3-performance-analytics/PERFORMANCE_ANALYTICS.md));
  operational analytics counts the Review layer's *participation* (did the run reach the gate, and how
  long did it wait there), not the wisdom of what the human decided.

The layers are the frozen core's; the measurement of their operational health is this document's. The
line between them is the whole point of the next two sections.

---

## 4. The built-unwired hook — `MonitoringPort.recordInference` (🔶 BUILT (UNWIRED))

There is exactly one place in the codebase built to be the operational sink for per-inference layer
work, and it is real, tested code: the **`MonitoringPort`**. Its single method,
`recordInference` (`packages/ai-manager/src/ports.ts:160-161`), is the seam through which a layer's
operational sample is meant to flow — one sample per inference, carrying precisely the fields an
operational view needs.

### 4.1 The sample the hook is designed to record

The `recordInference` sample is shaped like an operational measurement, field for field
(`ports.ts:161`):

- **`capability`** — *which layer's work this was.* This is the field that makes the sink
  layer-aware: a sample tagged with the Generation capability is a Generation sample, one tagged with
  the Scoring capability is a Scoring sample. Grouped by `capability`, the samples become per-layer
  metrics.
- **`latencyMs`** — *how long that unit of work took.* The raw material of the **latency** vital sign.
- **`ok`** — *did it complete cleanly?* The raw material of the **failure rate** vital sign.
- **`model`**, **`engine`** — which local model and engine served the work, so latency can be read
  against the component that produced it.
- **`promptTokens`**, **`completionTokens`**, **`cached`** — the token and cache context of the call.

Each recorded sample is, in effect, one tick of one layer's operational heartbeat.

### 4.2 The aggregator behind the hook

The sink is not an empty interface. `InMemoryMonitoring`
(`packages/ai-manager/src/runtime/monitoring.ts:31-39`) implements the port and already aggregates
what it receives: it counts total inferences, sums latency, tracks failures and cache hits, and — the
part that matters most for this document — keeps a **per-model breakdown** (`perModel`) so latency and
failures can be attributed to the component that produced them. It is the always-available,
dependency-free operational aggregator the AI Manager is designed to report from. Throughput (a count
of samples), latency (a sum divided by that count), and failure rate (failures over count) are all
computable from what it already accumulates.

### 4.3 The hook is invoked — but only inside the governed runtime

`recordInference` is not dead code. It **is** called: the AI Manager invokes it as step 11 of a
governed execution (`packages/ai-manager/src/runtime/manager.ts:304`), recording a sample the moment a
layer completes its inference. The wiring from layer-work to operational-sink exists and runs.

The catch — and it is the whole catch — is **where** that invocation lives.

> **Tier note.** `MonitoringPort.recordInference` is **🔶 BUILT (UNWIRED)**. The port is real
> (`ports.ts:160-161`), the aggregator is real (`monitoring.ts:31-39`), and the call site is real
> (`manager.ts:304`). But that call site sits inside the governed execution path — the path the live
> web app **does not invoke**. The sample is recorded only when the governed pipeline runs, and the
> governed pipeline runs only in the walking-skeleton test that drives it end to end. The operational
> sink therefore **never receives a live sample**. It is the intended per-inference operational sink,
> built and wired to the runtime — and never produced live.

Everything this document promises as an operational view is computable from `recordInference` samples.
The reason those views are not live is not a missing metric or a missing aggregator. It is that the
samples themselves are never produced on the runs users trigger — which §5 states in full.

---

## 5. Per-layer live metrics are ❌ ROADMAP — the honest gap

This document owes the reader the same plain statement its sibling owes about the run, restated for
the layer: **there is no live path that records a layer's operational latency, throughput, or failure
rate today.** Not one of the six layers reports a live operational metric, and the reason is singular
and structural.

The per-inference sample that would feed every per-layer view is emitted by `recordInference`
(`manager.ts:304`), and that call fires **only inside the governed pipeline**. The live web app does
not run the governed pipeline — it bypasses it. So the sink that would hold Generation's latency,
Scoring's throughput, and Orchestration's failure rate stays empty on every real run, because the code
that would fill it is never on the live path. The instrument is built, mounted, and wired to an engine
that does not turn over when a user clicks a button.

Be exact about what this does and does not mean:

- **The aggregator is not the gap.** `InMemoryMonitoring` (`monitoring.ts:31-39`) can already compute
  per-model throughput, latency, and failure counts. Point live samples at it and per-layer
  operational views follow directly. What is missing is upstream of it: the samples.
- **The per-layer grain is designed, not delivered.** The sample carries `capability`
  (`ports.ts:161`), which is exactly the discriminator that turns a stream of samples into
  *per-layer* metrics. The grain this document needs is present in the record's shape. It is simply
  never populated live.
- **The gap is a wiring gap, not a missing capability.** Nothing needs to be invented. The port
  exists, the aggregator exists, the call site exists. What is absent is the single connection that
  routes the live workflow *through* the governed pipeline, so that `recordInference` fires on real
  runs and the operational sink fills with real samples. This is the same throughline the whole
  Observability Layer inherits from the core: the governed pipeline is built; it is not yet the live
  engine.
- **Planner has no metric at any tier.** Even once the pipeline is wired, the Planner layer (§3) has
  no implementation to sample, so its operational metrics remain **❌** with nothing behind them —
  and, being unbuilt, they carry no citation.

So the honest operational picture is this: **the per-layer operational sink is built, wired to the
governed runtime, and never fed on live runs.** Until the live workflow runs through the governed
pipeline, the accurate statement is exactly that one. Operational analytics does not claim a live
latency chart it cannot draw; it names precisely why the chart is empty and precisely what fills it.

---

## 6. Time is First-Class — every operational metric is time-windowed (Law 7)

An operational metric with no time context is a meaningless number, and Law 7 forbids it.

> **LAW 7 — Time is First-Class.** Every metric MUST carry a time context — Last 7 Days / Last 30
> Days / Quarter / Year / Lifetime. No number is ever shown without its time window.

Operational analytics feels this law more sharply than most of Book G, because layer health is
*intrinsically* a rate over time. "Generation's failure rate is 3%" is unanswerable until you say *3%
over what window* — this week, this quarter, or lifetime. A latency of 800ms averaged over a layer's
entire history hides a regression that a Last-7-Days window would expose the instant it began. Every
vital sign this document defines is a rate, and a rate is only legible inside a window:

- **Throughput** is a *count per window* — units of work a layer handled in the last 7 days is a
  different, more actionable number than its lifetime total.
- **Latency** is an *average over a window* — a layer's mean latency this quarter, compared against
  last quarter, is where a slowdown becomes visible; a lifetime average smears it away.
- **Failure rate** is a *ratio over a window* — failures over units in the last 30 days is what tells
  an operator whether a layer is degrading now, not whether it ever failed.

Honest tier note for this law: the underlying aggregator (`monitoring.ts:31-39`) accumulates
**lifetime** totals in-process; it does not yet bucket its samples into 7d / 30d / quarter / year
windows, and no live time-window control exists (**❌ ROADMAP**). Time-bucketed operational metrics
are therefore part of the same roadmap as the live samples that would fill them: when the governed
pipeline is wired and samples flow, windowing those samples into Law-7 time contexts is the shape the
views must take. This document fixes the requirement — *no operational number without its window* — so
that the live implementation, when it lands, is born compliant.

---

## 7. Observability before optimization — this document reports health, it never tunes a layer (Law 9)

Operational analytics is the part of Book G most tempted to cross the line from watching to acting,
because a latency chart *seems* to invite a fix. Law 9 draws that line and forbids the crossing.

> **LAW 9 — Observability Before Optimization.** Book G ONLY observes — it shows, measures, compares.
> It NEVER says "change this." Optimization suggestions remain Book E's domain.

Operational analytics *reports* a layer's health. It says: Generation averaged this latency, Scoring
failed this often, Orchestration handled this throughput, in this window. It stops there. It does
**not**:

- **auto-tune a layer** — it never adjusts a model, a temperature, a routing choice, or a timeout to
  "improve" a metric it just reported;
- **re-route work** — a high failure rate on one layer does not make operational analytics send that
  layer's work elsewhere;
- **recommend a change** — reporting that Scoring is slow is not the same as saying "make Scoring
  faster." The recommendation to optimize, if there is to be one, is the intelligence layer's job
  ([`../../book-e/`](../../book-e/)), decided by the human. Operational analytics hands over the
  reading and goes no further.

This is Law 9 and the foundational law working together. Book G observes *before* optimization and
*without* it: a layer's health chart informs a human who may then decide to act, through the core, on
the layer — but the chart itself never acts. The instrument that measures the engine does not also
turn the wrench.

---

## 8. The foundational law — measuring a layer never changes it

Beneath Law 9 sits the law that makes operational analytics safe to build at all.

> **FOUNDATIONAL LAW — Analytics never influences execution directly.** Analytics can never change
> the pipeline, a mission, evidence, memory, or a creative. It only observes.

For a per-layer view this reduces to one guarantee stated as plainly as possible: **measuring a layer
never changes it.** The instruments this document describes are strictly one-directional. A sample
flows *out* of a layer into the operational sink (`recordInference`, `manager.ts:304`); nothing flows
*back* from the sink into the layer. Reading Generation's latency does not touch Generation. Counting
Scoring's failures does not alter Scoring's next judgement. The aggregator (`monitoring.ts:31-39`)
holds numbers derived from the layers; it holds no handle that could reach back and modify one.

This is why the operational sink is architecturally allowed to sit *inside* the governed runtime
(§4.3) without violating the read-only posture of Book G: `recordInference` is a write into an
**analytics record**, not a write into **execution state**. It records that a layer did work; it does
not change the work, re-run it, or influence the next unit. The direction of the arrow is fixed and
one-way — layer → sample → aggregate → view — and it never reverses. Operational analytics is a
mirror held up to the layers, and a mirror changes nothing it reflects.

> **Observability reveals reality; it never changes reality.**

---

## 9. Boundaries — local, own-data-only, no vendor telemetry

Operational analytics holds inside the same boundaries as the whole platform, and on the operational
path one of them is especially sharp — because per-component performance data is exactly the kind of
thing lesser systems ship off-device.

- **100% local.** The operational sink and its aggregator (`monitoring.ts:31-39`) are in-process
  objects on the user's machine. Every sample, every count, every per-layer average lives and dies in
  local memory. No operational metric is stored or computed anywhere but on the device.
- **No vendor telemetry.** This is the boundary operational analytics exists to honour, not to
  violate. Per-layer latency and failure counts are performance telemetry in the literal sense — and
  AdOS keeps them **entirely with the agency**. Not one operational sample, per-layer latency, or
  failure count is transmitted to Anthropic, to a model provider, to an APM service, or to any
  external endpoint. Operational analytics is the *opposite* of vendor telemetry: telemetry sends your
  component metrics to someone else; this keeps the health of your own engine on your own machine.
- **Own data only.** The samples describe the agency's own runs on the agency's own layers. Operational
  analytics pulls in no external benchmark, no fleet comparison, no outside baseline to decorate its
  numbers. A layer's health is measured against its own history, offline.
- **Read-only w.r.t. execution.** Per Law 1 and §8, recording an operational sample is not mutating
  execution state. The operational path reads the layers and writes only analytics records; it never
  writes back into a mission, an evidence store, a memory, or a creative.

The one-line boundary: **operational analytics tells the agency how its own engine is running, on its
own machine, and tells no one else.**

---

## 10. Value contribution

Operational analytics maps to both value levers, and it maps most directly to the one about time —
because a per-layer health view is, precisely, a way to find the slow part before it costs a day.

**It cuts production time by making the bottleneck locatable.** When a book of missions is running
slower than it should, the difference between a system with per-layer operational metrics and one
without is the difference between *knowing which layer is slow* and *guessing*. A latency chart that
attributes the slowdown to Generation rather than Scoring turns a diffuse "the system feels slow" into
a single, actionable reading — and a failure-rate chart that isolates the failing layer turns a
mystery into a lookup. Across many runs, the layer that quietly degrades is invisible to a per-run view
(G002) and obvious to a per-layer one (G006): operational analytics is how a slow component is caught
while it is still one metric on a chart, not yet a missed deadline.

**It grows revenue by making the core operationally accountable at enterprise scale.** An enterprise
agency running an operating system on its own machines needs to answer, credibly, "is this thing
healthy?" — component by component, not just run by run. Per-layer throughput, latency, and failure
rate — kept local, kept with the agency (§9) — are the operational dashboard that answer requires. A
platform whose every layer can report its own health, on the agency's own hardware, with nothing sent
to a vendor, is a platform an operations team can stand behind and a platform an enterprise can adopt
without surrendering its performance data to anyone. That accountability, honestly scoped, is part of
what separates an operating system a business can run from a tool it merely uses.

Both levers rest on the same honest footing this document has carried throughout: the per-layer sink
is built and wired to the governed runtime, and the metrics go live the moment the live workflow runs
through that runtime. Operational analytics defines the health view the agency will read; it names,
without flinching, exactly why the view is not populated yet and exactly what populates it.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
