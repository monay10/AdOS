# The Observability Platform — A–F Made Visible

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

## 0. What this document is

This is the closing document of Book G, and it is the document that completes the observability
layer of the A–F core. The seven documents before it defined observability one part at a time: the
constitution and its laws, pipeline and business analytics, metric provenance, performance and
operational analytics, and role-based dashboards. This document does not add a new part. It performs
the synthesis. It states plainly what Book G is **on top of** the six books beneath it — one
observability platform — and it states, just as plainly, how much of that platform renders live
today and how much is the design Book G specifies.

The distinction matters most here, because "AdOS is observable" is exactly the kind of sentence that
sounds like a shipped claim and mostly is not one yet. So this document holds two things at once,
without blurring them: the **design** — the A–F core rendered as one auditable, read-only surface —
and the **status** — that a strong slice of business analytics ships today while execution,
operational, and performance analytics, role-based views, and exports do not. Read both. Neither is
complete without the other.

> **Observability reveals reality; it never changes reality.**

That sentence has appeared in every content document of Book G. It appears here for the last time,
and it is the reason this synthesis is honest: Book G does not make AdOS *smarter* by adding a new
capability. There is no new intelligence in Book G, and there is no new decision. What Book G adds is
the layer that *renders* what the other six books already do — and rendering the truth of a run,
without touching it, is what turns an operating system into an **observable** operating system.

---

## 1. The synthesis — the frozen core, made observable

A–F are **AdOS Core Specification v1.0**, frozen. They are the operating system: the work, its
production, its explanation, its evidence, its judgement, and the process that runs them in order.
Read on their own, the six books *do* the work. What they do not do is *show* the work — turn a run
into a number, a number into a chart, a chart into a report an executive can read. That is the one
job of Book G, and it is the only job Book G has.

Book G is a layer laid over a fixed foundation. It reads the records and reports the core produces
and renders their reality. Walk the layers, and the seam is clean in one direction only:

| Layer | Book | What it *does* (the core) | What Book G *reveals* |
|-------|------|---------------------------|-----------------------|
| **A — Workflow** | Book A | shapes the mission; owns the human gate | mission counts, approvals, activity feed (✅ partial) |
| **B — Production** | Book B | generates briefs, creative, campaigns | campaign KPIs, ROAS/CTR/ROI over the output (✅) |
| **C — Explainability** | Book C | produces the rationale behind each artifact | *(observed indirectly; explanation coverage is ❌ live)* |
| **D — Performance Memory** | Book D | records what has worked, immutable | memory growth, evidence coverage (❌ — written, not read back) |
| **E — Creative Judgement** | Book E | scores and applies taste to production | approval / revision rates (❌ live; Book E keeps the decision) |
| **F — Orchestration** | Book F | runs A–E in order; seals the run record | pipeline durations, stages, retries (🔶 — the trace is the source) |

Read the right column top to bottom and Book G's contribution is concrete: it is a **mirror**, not a
motor. Each row names a thing the core already does; Book G renders that thing and nothing else. The
core does not depend on G, and G may never change the core. This is the directional rule that governs
every layer above the frozen specification — see [`../../ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md):
G **consumes** and **observes** the core; it never redefines it.

Walk the layers one at a time, because the honesty of the synthesis is in the *unevenness* of that
right column — some layers Book G renders today, and some it only specifies:

- **A — Workflow.** The core shapes the mission and owns the human gate. Book G renders the shape of
  that work as counts and motion: entity counts through `collectStats` (`routes.ts:1516-1546`), and
  the activity feed and audit trail (`app.ts:118-129`) that show missions moving and approvals
  landing. This is live, and it is *partial* — it shows mission-state transitions, not the internal
  stages of a governed run. ✅ for what it renders; the deeper record waits on F's trace.

- **B — Production.** The core generates the briefs, creative, and campaigns. Book G renders the
  performance of that output — the KPI surface over campaigns (`kpi.ts:39`), the campaign reports
  (`campaign-report.ts:55`), the ROAS rollup (`routes.ts:1470`). This is the layer Book G renders
  most fully and most honestly, and it is why business analytics is the book's ✅ spine.

- **C — Explainability.** The core produces the rationale behind each artifact. Book G's window onto
  it — explanation coverage as an aggregate, "how many artifacts carry a rationale" — is ❌ live;
  there is no aggregation surface reading Book C's output back. The rationale exists per-artifact in
  the core; Book G does not yet render it in the aggregate.

- **D — Performance Memory.** The core records what has worked, immutably. Book G's intended window —
  memory growth, evidence coverage over time — is ❌: `recordLearning` (`routes.ts:1092`) *writes*
  the memory, but nothing reads it back to aggregate it, and the store is volatile in-memory. Book G
  would render the memory's shape; today it cannot, because the read-back path does not exist.

- **E — Creative Judgement.** The core scores and applies taste. Book G's window — approval and
  revision *rates* — is ❌ live, and this is the layer where Law 9 (Observability Before
  Optimization) bites hardest: even fully rendered, Book G would report the rates and never say
  "revise more." The decision stays with Book E; Book G only ever counts.

- **F — Orchestration.** The core runs A–E in order and seals the run record. Book G's window —
  stage durations, retries, failures over time — has a *built* source in the `ExecutionTrace` /
  `TraceBuilder` (`kernel.ts:124` / `:204` / `:241`), but that source is 🔶: never produced live,
  because the app never calls the governed execute path. Pipeline analytics is exactly one wiring
  step away, and not a step further.

The pattern is the point: Book G is complete as a *design* across all six layers, and live across
one and a half of them. The mirror is real; it is not yet held up to every layer.

**No new intelligence, and no new decision.** This bears repeating because it is the load-bearing
constraint of the whole synthesis. Book G invents no generation (that is Book B), no explanation
(Book C), no evidence (Book D), no judgement (Book E), no workflow (Book A), and no orchestration
(Book F). If a proposed analytics behaviour would require Book G to *change* a mission, an evidence
item, a creative, a score, or the order of a run, that behaviour is out of bounds. Book G reveals; it
does not decide. The platform is trustworthy precisely because the observability layer is thin,
read-only, and derived — not because it is clever. An observability layer that could act would not be
an observability layer; it would be a second, ungoverned pipeline.

---

## 2. The one-way flow — Records → Metrics → Dashboards → Reports → Exports

The whole of Book G is a single pipe, and it runs in one direction only. Nothing ever flows back up
it. This is not a diagram of a wish; it is the derivation order that Law 5 (Analytics is Immutable)
and Law 6 (Every Dashboard is Derived) require. Each stage reads the stage before it and writes
nothing to the stages behind it.

```
Run Records / Events  →  Metrics  →  Dashboards  →  Reports  →  Exports
      (core)            (derived)   (visualized)   (composed)   (emitted)
        ✅ / 🔶             ✅            ✅            ✅            ❌
```

Stage by stage, with its honest tier:

**Run Records / Events → the source.** The core emits what analytics reads. Today the live source is
the mission event feed and audit trail (wildcard `'>'` subscription, 50-entry cap, at
`apps/web/src/app.ts:118-129`; `recentEvents` at `app.ts:132-135`) and the raw campaign metrics that
are hand-entered on generation (`apps/web/src/routes.ts:1042-1047`). That is a real, live source
(✅), but it is a *partial* one: the rich sealed run record — Book F's Law-6 `ExecutionTrace`
(`packages/ai-manager/src/runtime/kernel.ts:124`, built by the `TraceBuilder` at `:204`/`:241`) — is
**built but never produced live** (🔶), because the app never calls the governed execute path.
Execution and operational analytics wait on that record.

**Metrics → the derivation.** Metrics are computed *from* records, by pure math. The deterministic
KPI engine `computeKpis` (`domains/analytics-engine/src/report/kpi.ts:39`) derives six KPIs —
CTR, CPC, CPA, CPL, ROAS, ROI (`kpi.ts:43-48`) — from explicit input metrics. It invents no number;
each output is a function of its inputs. This is ✅, and it is the strongest guarantee in the book.

**Dashboards → the visualization.** Metrics are rendered, and a dashboard holds no data of its own
(Law 6). The live dashboard renders entity counts via `collectStats` (`routes.ts:1516-1546`) and the
activity feed at `routes.ts:148-155`; the `/analytics` view renders at `routes.ts:625-645`. Unplug
the metrics and the dashboard is empty — which is exactly what a derived surface should be. ✅.

**Reports → the composition.** Metrics and dashboards are composed into reports a human reads. The
`CampaignReport` (`domains/analytics-engine/src/report/campaign-report.ts:55`) *retains its source
metrics* (`campaign-report.ts:34-35`) — provenance carried in the type — and its narrative is the
one AI part, explicitly separated: "KPIs are pure math; only the narrative is AI-generated"
(`domains/analytics-engine/src/report/service.ts:24`; the narrative at `service.ts:36`, its
`AIProvenance` at `service.ts:82-84`). The executive report renders a verdict of
`exceeded | on_track | at_risk` (`domains/executive-ai/.../executive-report.ts:40`) at `/executive`
(`routes.ts:707-728`), and the per-client rollup renders at `/reports` (`buildReportSnapshot`
`routes.ts:1436-1488`; `avgRoas` at `routes.ts:1470`). Campaign and executive reports render today.
✅.

**Exports → the emission.** This is the missing step at the end of the pipe. Reports render on the
screen; the surface that *emits* them out of the app — **CSV / PDF / JSON exports** — does not exist.
There is no export path, no file writer, no download endpoint. Exports are **❌ ROADMAP**. The honest
shape of the gap is precise: the *reports* are real and render (✅); the *export out of them* is the
piece that is not built. An executive can read the executive report in the app today; they cannot yet
take a PDF of it into a board deck or a CSV of the KPI table into a spreadsheet. That last hop off the
device is the roadmap.

The flow is one-way at every seam. Reports never write Metrics; Metrics never write Records; Exports
never write anything back at all (Law 5). Analytics may **recompute** a metric from its source; it
never **rewrites** history, and it never reverses the arrow.

---

## 3. The closing guarantees — the foundational law and Law 3

Two laws close the book, and they are the two that make everything above safe to build on.

**FOUNDATIONAL LAW — Analytics never influences execution directly.** This is the guarantee that the
one-way pipe of §2 is *actually* one-way. Analytics can never change the pipeline, a mission,
evidence, memory, or a creative. It only observes. The proof is in the code path, not the promise:
the analytics, dashboard, executive, and reports routes are pure reads — `.list` / `.get` — and the
one write that touches execution state, `recordLearning` (`routes.ts:1092`), sits **outside** the
analytics path entirely. Book G reads; the record it reads is written by the core, on the core's own
terms, before analytics ever sees it. There is no route by which a chart, a KPI, or a report reaches
back and moves a mission. That is the foundational guarantee, and it is ✅ by construction: the reason
analytics *cannot* influence execution is that there is no wire from analytics to execution.

**LAW 3 — Dashboard ≠ Decision.** This is the guarantee that observability does not quietly become
authority. A dashboard visualizes; it never decides. Decisions stay with the Human and with the core
intelligence — Book B's production, Book C's explanation, Book D's evidence, Book E's judgement. When
the executive report shows `at_risk`, that is a *rendering of a verdict already computed*, not a
command to act; the choice of what to do about it is the human's, made with the core's intelligence,
never with the dashboard's. A dashboard that decided would be an optimizer, and optimization is Book
E's domain, not Book G's (Law 9: Observability Before Optimization). Book G shows, measures, and
compares. It never says "change this."

The read-only guarantee is worth stating as a proof, not a preference, because "read-only" is another
phrase that is easy to claim and hard to earn. Book G earns it in three ways at once. First, in the
**call shape**: every analytics, dashboard, executive, and reports handler reaches the repositories
through `.list` and `.get` — query verbs, never mutation verbs. Second, in the **topology**: the one
call that writes execution state, `recordLearning` (`routes.ts:1092`), is not on the analytics path;
it is the core's own learning write, reached before analytics ever reads. There is no code path that
starts in a chart and ends in a mission. Third, in the **derivation direction** (Law 5): even a
*recompute* — re-deriving a KPI from its source metrics — reads the source and writes only a fresh
metric; it never edits the source and never reverses the arrow. A metric can be recomputed a thousand
times and the records behind it are untouched every time.

Take the two laws together and the close of Book G is exactly this: the observability layer can see
everything and touch nothing. It reveals the reality of every run without acquiring the power to
alter one. That is what makes it safe to render an enterprise's entire operation through it — the
surface that sees the most is the surface that can change the least.

> **Observability reveals reality; it never changes reality.**

---

## 4. Honest tier summary of Book G

This document is a synthesis of what Book G specifies, and it is candid about status because the
whole point of the tier model is that nothing unbuilt is presented as shipped. Book G is uneven by
design: one slice is genuinely strong, and the rest is specification. Stated in full:

**Business Analytics is the strong ✅.** The campaign-analytics slice runs live and runs honestly.
The deterministic KPI engine (`kpi.ts:39`) derives six KPIs by pure math; the `CampaignReport`
(`campaign-report.ts:55`) retains its source metrics; the `/analytics`, `/executive`, and `/reports`
views render (`routes.ts:625-645`, `:707-728`, `:685-696`); the per-client ROAS rollup computes
(`routes.ts:1470`). This is a real, shipped, provenance-carrying business-analytics surface. It is
the book's spine and its proof of concept.

**Execution, Operational, and Performance analytics are 🔶 / ❌.** The machinery for execution
analytics exists but is unwired: the `ExecutionTrace` / `TraceBuilder` (`kernel.ts:124` / `:204` /
`:241`) and the `MonitoringPort` (`packages/ai-manager/src/ports.ts:160-161`; `recordInference`
invoked at `manager.ts:304`; `InMemoryMonitoring` at `monitoring.ts:31-39`) are built and tested but
never produced live (🔶). Full pipeline analytics — stage durations, retries, failures over time —
is ❌ live, because the trace is never produced live; only mission-state approvals and failures are
visible today. Per-layer operational metrics (Planner / Generation / Scoring / Explanation / Review /
Orchestration) are ❌ live for the same reason. And performance analytics over Book D memory — memory
growth, evidence coverage, recommendation usage, approval and revision rates — is ❌: Book D memory is
*written* (`recordLearning` `routes.ts:1092`) but never read back or aggregated, and the stores are
volatile in-memory.

**Role-based dashboards are ❌.** CEO / Manager / Operator / Customer views are declared, not
enforced. RBAC is **declared but unenforced** (`session.ts:15-16`, `auth-service.ts:145-147`,
`roles.ts:6-13`, whose comment states no new permission gate is added); every user sees the same
page. Law 4 (Same Data, Different Views) is satisfied in principle — there is one truth beneath any
view — but the persona-specific *views* do not exist yet.

**Exports are ❌.** As §2 states: reports render, but CSV / PDF / JSON emission out of them does not
exist.

**The analytics path is read-only ✅.** This is the cross-cutting guarantee, and it holds today. The
analytics, dashboard, executive, and reports routes are pure reads; the single execution-state write
(`recordLearning` `routes.ts:1092`) sits outside the analytics path. The foundational law is met by
construction.

**Metric provenance is ✅ for shipped KPIs.** Every number that ships today traces to its source. The
KPI engine takes explicit input metrics; the `CampaignReport` retains those source metrics in its type
(`campaign-report.ts:34-35`). No magic numbers (Law 2). Where Law 7 (Time is First-Class) is
concerned, the honest note is that today's reports are per-campaign / per-client *snapshots*, not
time-bucketed series; live window selection (7d / 30d / quarter / year / lifetime) is ❌.

The same summary, as a ledger — one tag per capability, nothing unbuilt shown as shipped:

| Surface | Tier | Grounding |
|---------|------|-----------|
| Deterministic KPI engine (CTR/CPC/CPA/CPL/ROAS/ROI) | ✅ | `kpi.ts:39`, `:43-48` |
| Campaign report with retained source metrics | ✅ | `campaign-report.ts:55`, `:34-35` |
| AI narrative (separated from the pure-math KPIs) | ✅ | `service.ts:24`, `:36`, `:82-84` |
| `/analytics`, `/executive`, `/reports` rendering | ✅ | `routes.ts:625-645`, `:707-728`, `:685-696` |
| Live dashboard: entity counts + activity feed | ✅ | `routes.ts:1516-1546`, `app.ts:118-129` |
| Per-client ROAS rollup | ✅ | `routes.ts:1436-1488`, `:1470` |
| Analytics path read-only | ✅ | pure `.list`/`.get`; write `routes.ts:1092` sits outside |
| Metric provenance for shipped KPIs | ✅ | `kpi.ts:39` inputs; `campaign-report.ts:34-35` |
| Execution trace as a source (built, unwired) | 🔶 | `kernel.ts:124`/`:204`/`:241` |
| Monitoring hook `recordInference` (built, unwired) | 🔶 | `ports.ts:160-161`, `manager.ts:304`, `monitoring.ts:31-39` |
| Live pipeline analytics (durations/retries/failures) | ❌ | — |
| Per-layer operational metrics | ❌ | — |
| Performance analytics over Book D memory | ❌ | — |
| Role-based dashboards (CEO/Manager/Operator/Customer) | ❌ | — |
| Exports (CSV / PDF / JSON) | ❌ | — |
| Live time-window selection (7d/30d/quarter/year/lifetime) | ❌ | — |

So **"AdOS is fully observable" is the design Book G specifies — not a capability AdOS has today.**
The shipped reality is a strong, provenance-carrying business-analytics surface running live, with the
execution, operational, performance, role-based, export, and time-window surfaces specified and, in
part, built-but-unwired. The synthesis is real as a specification and honest as a status.

**The wiring throughline (the build order, stated honestly).** The path from what renders today to the
full observability platform is a sequence, and each step is discrete, local, and offline — none of
them adds intelligence or a decision; each wires an existing read-back into the one-way pipe:

1. **Surface the live run record.** Produce Book F's `ExecutionTrace` (`kernel.ts:124`) from live runs
   so the Records stage of §2 is complete, not partial. Nothing downstream of it can render until the
   record it derives from exists.
2. **Wire execution and operational analytics.** Aggregate the trace and the `recordInference` hook
   (`manager.ts:304`) into stage-duration, retry, failure, and per-layer metrics. This is the 🔶 → ✅
   step for pipeline and operational analytics.
3. **Read Book D memory back.** Aggregate what `recordLearning` (`routes.ts:1092`) writes into memory
   growth, evidence coverage, and approval/revision rates — reporting the rates, never prescribing
   them (Law 9).
4. **Add time-bucketing and role views.** Turn per-campaign snapshots into windowed series (Law 7) and
   enforce the declared roles (`roles.ts:6-13`) into persona views over the *same* data (Law 4).
5. **Emit exports.** Add the CSV / PDF / JSON writer at the end of the pipe so a rendered report can
   leave the app as a file — the last hop of §2, and still one-way.

---

## 5. What builds on this — Book H, the ecosystem layer

Observability is not the top of the stack. With Book G in place, the A–F **core** and its
**observability** are complete: the operating system does the work, and the layer above it renders the
work's reality. One layer remains, and it sits above G, not inside the core.

**Book H — Marketplace / Ecosystem Layer.** Book H is the next layer, and it builds **on** A–G exactly
as G builds on A–F: additively, from above, never reaching in. Where the directional rule for G is
*consume and observe*, the rule for H is *extend* — an ecosystem of components around the operating
system. The invariant across both is the same, and it is the invariant the frozen specification fixes
(see [`../../ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md)): the A–G core plus
observability is fixed, and each layer above it may **consume, observe, or extend** it — **never
redefine** it. Nothing in the marketplace may reach into the core pipeline and change how a stage
runs, how evidence is kept, or how the human gate behaves; and nothing in the ecosystem may change how
analytics derives a metric, either. H surrounds; it does not rewrite.

The principle underneath is that the stack grows only upward. Book D turned data into evidence; Book E
into judgement; Book C made it explainable; Book F ran it in order; Book G rendered its reality — and
Book H will surround it with an ecosystem. Each layer reads the one below and changes none of them.
This is what keeps the operating system stable enough for an agency to build a business on: the core
does not shift under the layers built on top of it, and observability does not shift under the
ecosystem built on top of *it*. With A–G, the core and its observability are done. Only the ecosystem
layer remains.

---

## 6. Boundaries (unchanged, and reaffirmed at the close)

The observability platform does not relax a single boundary of the series. It reaffirms them, and one
of them it embodies more sharply than any book before it:

- **100% local, offline-first.** Analytics runs on the agency's own machine. No cloud, no API, no
  connectors. Every metric in §2 is derived from local records by local code.
- **Copy only, no external data. No vendor telemetry.** This is the boundary Book G *inverts* the
  usual industry meaning of. Analytics here is the **opposite of telemetry**: it keeps the record with
  the agency and sends nothing off-device. The agency observes itself; no vendor observes the agency.
- **Read-only w.r.t. the core.** Analytics never mutates Mission, Evidence, Memory, Creative, or
  Journal (Law 1). Generating a report artifact is not mutating execution state; the analytics path is
  pure read, and the one execution-state write sits outside it (`routes.ts:1092`).
- **Human-sovereign.** Dashboards inform; humans decide (Law 3). The platform never crosses a decision
  on its own, because it holds no decision authority to cross.
- **No new intelligence, no new decision.** Book G renders A–F. It observes; it does not create and it
  does not choose. There is no capability in Book G that acts on the core.

---

## 7. The laws, recapped

The observability platform is the ten laws, working together, over the record the six books produce:

- **FOUNDATIONAL — Analytics never influences execution directly.** ✅ by construction; there is no
  wire from analytics to execution.
- **Law 1 — Analytics Never Mutates.** Read-only w.r.t. all core state.
- **Law 2 — Every Metric Has Provenance.** ✅ for shipped KPIs; no magic numbers.
- **Law 3 — Dashboard ≠ Decision.** Dashboards visualize; the human and the core decide.
- **Law 4 — Same Data, Different Views.** One truth beneath every view (views themselves ❌ today).
- **Law 5 — Analytics is Immutable.** Events → Metrics → Reports, never the reverse.
- **Law 6 — Every Dashboard is Derived.** Unplug the metrics and the dashboard is empty.
- **Law 7 — Time is First-Class.** Every metric carries a window (live selection ❌ today).
- **Law 8 — Every Visualization Has Data.** No decorative number; every chart names its metrics.
- **Law 9 — Observability Before Optimization.** Book G shows; it never says "change this."

And beneath all ten, the invariant that closes Book G as it opened it:

> **Observability reveals reality; it never changes reality.**

---

## 8. Value contribution

An observable platform is what an enterprise agency can standardize and scale on. That is the value,
and it lands on both sides of the ledger.

**It reduces production time.** An agency that cannot see its own runs is an agency that reconstructs
them by hand — pulling numbers out of scattered artifacts, re-deriving a KPI because no one recorded
its source, re-explaining a campaign's performance from memory. A read-only, provenance-carrying
analytics surface removes that class of work: the KPI is computed once, from a recorded source, and
rendered on demand. When the execution and export surfaces are wired, that saving compounds — every
run auditable without reconstruction, every report emitted without re-typing.

**It increases agency revenue.** An observable, auditable platform is what turns AdOS from a tool an
agency *uses* into a system an agency can *standardize on*. An enterprise cannot scale a business on a
process it cannot see. It can scale on one where every number traces to its source, every run is
recorded, and every report reads the same truth for every reader. A platform an agency can audit and
show a client — reproducibly, from its own local records, with nothing sent off-device — is a platform
an agency stakes its growth on. The strong business-analytics slice that ships today is the first proof
of that; the rest of Book G is the design that completes it.

The point of the whole synthesis, stated once more: Book G adds no new intelligence and no new
decision. It makes the frozen A–F core **visible**. That — not a new capability — is what turns a
managed operating system into an *observable* one, and an observable operating system is what an
enterprise agency can build on.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
