# Role-Based Dashboards

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

This document defines how one body of truth is shown to four different kinds of reader. An agency is
not a single audience: a **CEO** wants outcomes and verdicts, a **Manager** wants throughput and
approvals, an **Operator** wants run health, and a **Customer** wants the results of their own
campaign. They ask different questions of the same system — and the promise of this book is that when
they get their answers, those answers can never contradict one another, because they are all drawn
from a single set of metrics.

The document owns two of the ten laws. It owns **LAW 4 — Same Data, Different Views**, the guarantee
that the CEO and the Operator are looking at the same reality summarised two ways, never at two rival
realities. And it owns **LAW 6 — Every Dashboard is Derived**, the structural fact that makes that
guarantee possible: a dashboard is not a data store. It holds nothing of its own. It is a projection
of the metric layer beneath it, and if you unplug that layer the dashboard goes blank.

The line down the middle of this document is the honest one this book draws everywhere:

- **What ships today** is *real, shared dashboards.* The executive report renders live at
  `/executive` with a verdict on every mission (✅), and the operational dashboard renders live at
  `/dashboard` with entity counts drawn from a single stats pass (✅). Both are genuine, wired
  surfaces a user sees when they log in.
- **What does not ship** is *the differentiation between personas.* There is no CEO view distinct
  from an Operator view. Role-based access control is **declared** in the codebase but **not
  enforced** on any route, and no persona-specific page exists. Every user, whatever their role,
  sees the same page (❌).

One sentence governs the whole exercise, and it is the boundary of everything that follows:

> **Observability reveals reality; it never changes reality.**

A dashboard summarises what happened; it does not decide what happens next, and it does not become a
second source of truth by summarising. The four personas are four lenses on one record. The lenses
differ. The record does not.

---

## 2. LAW 6 — Every Dashboard is Derived

> **LAW 6 — Every Dashboard is Derived.** A dashboard holds no data of its own. Its content is
> computed one way — **Events → Metrics → Dashboard** — and it is never a separate truth source.
> Unplug the metrics and the dashboard is empty.

This is the structural law, and it must be stated before Law 4 because Law 4 depends on it. A
dashboard, in Book G, is not a place where numbers live. It is a place where numbers are *shown*. The
numbers live one layer down, in the metric set, which itself was derived from the run records and
events the core produced. The dashboard is the last, thinnest link in a one-way chain:

**Run Records / Events → Metrics → Dashboards.**

Read that chain as a hard constraint on what a dashboard is allowed to be:

- **A dashboard originates no number.** Nothing on the page is typed into the dashboard, computed
  for the first time on the dashboard, or stored only on the dashboard. Every figure it renders was
  already a metric before the page asked for it.
- **A dashboard is stateless with respect to truth.** It can hold layout, a selected time window, a
  chosen persona lens — presentation state. It cannot hold *facts*. If the page were thrown away and
  rebuilt from the metric layer, it would come back identical, because it never held anything the
  metric layer did not already have.
- **Unplug the metrics and the dashboard is empty.** This is the operational test of the law. A
  dashboard that still shows numbers after its metric source is removed is, by definition, holding
  data of its own — and that is exactly what Law 6 forbids. A compliant dashboard goes blank.

The live surfaces obey this literally. The operational dashboard's counts are not stored on the
dashboard; they are produced by a single derivation pass, `collectStats`
(`apps/web/src/routes.ts:1516-1546`), which reads every entity list — workspaces, clients, brands,
products, missions, briefs, creatives, campaigns, reports, approvals, assets, executives — and
returns their counts. The `/dashboard` route (`routes.ts:148-155`) calls `collectStats`, reads the
recent-events feed, and renders. It stores nothing. Remove the entity stores and `collectStats`
returns zeros; the dashboard renders an empty shell. That is Law 6 made concrete: the page is a
window, and the room behind it is the metric layer.

The consequence for this document's subject is the important one: **the persona views are different
projections of one metric set, not four separate data stores.** When this book eventually renders a
CEO view and an Operator view, they will not each carry their own numbers. They will each *select and
summarise* from the same metrics `collectStats` and the report engine already produce. There is no
world in which a persona view is a place to keep a private version of the truth. Law 6 makes that
architecturally impossible before Law 4 makes it a promise.

---

## 3. LAW 4 — Same Data, Different Views

> **LAW 4 — Same Data, Different Views.** The CEO, the Manager, the Operator, and the Customer see
> the **same underlying data**, summarised differently. The views differ; the truth beneath them is
> one. The guarantee is that no two personas can ever see contradictory numbers.

Law 6 says a dashboard is derived. Law 4 says *what that buys you*: because every persona view draws
from the same metric source, two personas can never be shown numbers that disagree. The CEO's
"campaign exceeded target" and the Operator's "run health nominal" and the Customer's "your ROAS was
2.4x" are three summaries of one dataset. They can differ in *emphasis* — the CEO sees a verdict, the
Operator sees run health — but they cannot differ in *fact*, because there is exactly one fact
beneath all three.

This is a stronger promise than it first sounds, and it is worth being precise about what it rules
out:

- **It rules out drift.** In a system where each dashboard maintained its own copy of the numbers, a
  CEO report generated Monday and an Operator report generated Tuesday could quietly disagree — one
  stale, one fresh. Law 4 forbids the copies that make drift possible. There is one metric set;
  every view reads it; a view is as fresh as the metrics it read.
- **It rules out contradiction by construction.** The guarantee is not "we check that the views
  agree." It is "the views cannot disagree, because there is nothing for them to disagree *with*."
  Two projections of one dataset are consistent for the same reason two photographs of one object
  from two angles show the same object: they share a subject.
- **It rules out the private dashboard.** A persona view that decided to compute its own headline
  figure — its own ROAS, its own approval count — would break Law 4 the instant its private figure
  diverged from the shared metric. Law 6 is what prevents this: a view has no data of its own to
  diverge with.

So Law 4 and Law 6 are one idea seen twice. Law 6 is the mechanism — *dashboards derive, they do not
store*. Law 4 is the guarantee that mechanism delivers — *therefore personas cannot contradict each
other*. Remove Law 6 and Law 4 becomes an unenforceable hope; keep Law 6 and Law 4 is automatic.

---

## 4. The four personas — one truth, four lenses

The four personas are not four products. They are four questions asked of one dataset. Each persona
is a *summary posture* — which slice of the metric set to foreground and which to leave in the
background — over the identical underlying record.

| Persona | The question they ask | What the view foregrounds | Same source, drawn from |
| --- | --- | --- | --- |
| **CEO** | *Did it work?* | Outcomes and verdicts — did the mission exceed, stay on track, or fall at risk? | The executive report's verdict and headline. |
| **Manager** | *Is the shop moving?* | Throughput and approvals — how many missions, briefs, campaigns, and approvals are flowing, and what is awaiting a human. | The entity counts and the awaiting-approval slice. |
| **Operator** | *Is it healthy?* | Run health — what the system has recently done, what is in flight, what needs attention now. | The recent-events feed and pending queue. |
| **Customer** | *How did* my *campaign do?* | Their campaign results — the outcome of the work done for that one client. | Their own campaign's metrics and report. |

Read down the last column: every persona's material is drawn from the same place. The CEO's verdict
and the Customer's result are two reads of the report layer. The Manager's throughput and the
Operator's run health are two reads of the same stats-and-events pass. Nothing in the CEO column is
computed from a different dataset than the Customer column. The lens changes; the light behind it is
one source.

This is why the four personas belong in a document that owns Law 4 and Law 6 together. The *idea* of
four personas is only safe because of Law 6: since no view holds its own data, adding a persona adds a
lens, not a data store. And it is only *valuable* because of Law 4: since all lenses read one source,
the CEO and the Customer are guaranteed to be told the same truth about the same campaign, differently
framed. Four lenses, one record — that is the whole design.

---

## 5. What ships today — the executive report (✅ SHIPPED)

The persona this book serves most completely today is the **CEO**. The executive report is a real,
shipped, live surface: a per-mission executive synthesis that renders a verdict.

The report's content type is the **DashboardContent** (`domains/executive-ai/.../executive-report.ts`),
and its load-bearing field is the **verdict** (`executive-report.ts:40`). A verdict is one of exactly
three values — **`exceeded` | `on_track` | `at_risk`** (`executive-report.ts:30`) — the CEO's answer
to *did it work?* compressed into a single, unambiguous outcome. Alongside it the report carries a
headline, an executive summary, key results, decisions, and next actions: the outcome-and-verdict
posture the CEO persona wants.

This report renders live. The `/executive` route (`apps/web/src/routes.ts:707-728`) lists every
executive report, resolves each one back to the mission it summarises, and renders the verdict as a
badge next to the mission objective, the report headline, and the model that produced it. A user
looking at `/executive` today sees the outcome view: a row per mission, each stamped with
`exceeded`, `on track`, or `at risk`. This is the CEO lens, shipped.

Two honesties belong here. First, the verdict is a *summary of the mission's own record* — it derives
from the mission and report the core produced; the executive layer does not invent an outcome, it
renders the one the mission reached. That is Law 6: the report is derived, not originated. Second,
this is a real dashboard for one persona — but it is shown to *every* user, not gated to CEOs (§7).
The executive view exists; the *restriction* of it to a CEO persona does not.

---

## 6. What ships today — the live operational dashboard (✅ SHIPPED)

The second shipped surface serves the **Manager** and **Operator** questions: *is the shop moving?*
and *is it healthy?* The operational dashboard at `/dashboard` (`routes.ts:148-155`) renders three
things, all derived, all live.

- **Entity counts — throughput at a glance (the Manager lens).** The dashboard's counts come from a
  single derivation pass, `collectStats` (`routes.ts:1516-1546`), which reads every entity list in
  the application and returns their sizes: workspaces, clients, brands, products, missions, briefs,
  creatives, campaigns, reports, approvals, assets, and executives. It also computes a derived count —
  `learnings`, the number of missions in the `completed` state (`routes.ts:1543`). This is the
  throughput posture: how much of each thing exists and is flowing.
- **The pending queue — what awaits a human (the Manager/Operator overlap).** The route filters
  missions to those `awaiting_approval` and surfaces them as a pending list (`routes.ts:151-153`).
  This is the approvals view: the work sitting at the human gate right now.
- **The recent-events feed — run health (the Operator lens).** The route reads a bounded
  recent-events feed (`routes.ts:150`) and renders it. This is the run-health posture: a live account
  of what the system has just been doing.

Every one of these is derived, not stored. The counts are computed from the entity stores at render
time; the pending list is a filter over the mission store; the feed is a read of the event stream.
None of it lives on the dashboard. This is `/dashboard` obeying Law 6 in the plainest possible way —
a page that would go blank the moment its sources were removed.

And it obeys Law 4 with the executive report: the `missions` count on `/dashboard` and the mission
rows on `/executive` are reads of the same mission store. There is no arrangement in which the
dashboard says one thing about how many missions exist and the executive page implies another. One
store, two views, no contradiction — which is exactly the guarantee this document owns.

---

## 7. What does not ship — role differentiation (❌ ROADMAP)

Here is the blunt part, and this book does not soften it: **there are no persona-specific views
today. Every user sees the same page.** The four personas of §4 are a design intention, not a shipped
reality. The CEO does not get a different `/executive` than the Operator; the Customer does not get a
scoped view of only their campaign. Whatever role a user holds, they are routed to the same dashboard
and the same reports as everyone else.

The reason is precise, and it is worth stating exactly, because the codebase makes it look further
along than it is. **Role-based access control is declared but not enforced.**

- **Roles exist as data.** A default role catalogue is defined in `apps/web/src/auth/roles.ts`, and
  a session can carry roles — the session type declares an optional `roles?: string[]` field
  (`apps/web/src/session.ts:15-16`), populated at login. So the *vocabulary* of roles is present: a
  user can be an owner, an admin, a member.
- **Roles are resolved into a principal.** The auth service resolves an authenticated user into an
  RBAC principal carrying those roles — `principalOf` returns `{ id, tenantId, kind, roles }`
  (`apps/web/src/auth/auth-service.ts:145-147`). The plumbing to *know* a user's role at request
  time exists.
- **But no route reads the role to change what is shown or allowed.** The role catalogue's own
  documentation says so in as many words: it states that the web app's existing authorization
  (tenant-scoped access) is unchanged, and that **no new permission gate is added to any route**, so
  behaviour is preserved (`apps/web/src/auth/roles.ts:6-13`). The roles are resolved and then, for
  the purpose of what a user sees, ignored.

Put the three facts together and the picture is unambiguous: **the roles exist as data but drive no
view.** A user's role is known, carried on the session, and resolved into a principal — and then no
dashboard branches on it, no route gates on it, and no persona-scoped page is rendered from it. The
scaffolding for role differentiation is real; the differentiation is not.

So the honest tier tag on *role-based dashboards* is **❌ ROADMAP**. Not because the idea is vague —
§4 defines the four personas precisely — but because no code path turns a role into a distinct view.
There is no CEO page and Operator page to cite, because there is one page for both. Declaring RBAC is
not enforcing it, and enforcing access is not the same as rendering a persona lens; today the product
does neither for these dashboards.

---

## 8. The honest gap — one page, four intended readers

The gap between §5–§6 and §7 is the whole story of this document, and it is a clean one to state.

- **Shipped: real dashboards, shared.** The executive report (✅) and the operational dashboard (✅)
  are genuine, wired, live surfaces. They are not mockups. A user sees outcomes, verdicts,
  throughput, approvals, and run health today.
- **Not shipped: the persona boundary.** What is missing is the *differentiation* — the routing that
  gives the CEO the outcome lens, the Operator the health lens, and the Customer a view scoped to
  their own campaign. Every reader is currently handed the same two surfaces.
- **The gap is a differentiation gap, not a data gap.** This matters for how the gap gets closed.
  The metric layer that four persona views would draw from already exists and already renders — one
  stats pass, one report engine, one event feed. What is absent is the *projection* layer: the code
  that selects, for a given role, which slice of the shared metrics to foreground. Because of Law 6,
  that future code adds lenses over existing metrics; it does not add new data stores. Because of
  Law 4, those lenses will be guaranteed-consistent the day they ship, for the same reason the
  executive page and the dashboard are consistent today.

Naming this precisely is the design being honest about its own status. The persona views are not
built and hidden; they are simply not built. But the foundation they require — a single derived
metric source that every view must read — is exactly what is shipped. The four lenses are a
projection away, not a rebuild away.

---

## 9. Time is First-Class in every persona view (Law 7)

Whatever lens a persona looks through, the numbers it foregrounds carry a time context — because a
verdict, a throughput, or a run-health reading is meaningless without the window it describes.

> **LAW 7 — Time is First-Class.** Every metric MUST carry a time context — Last 7 Days / Last 30
> Days / Quarter / Year / Lifetime. No number is shown without its window.

The four personas each imply a natural window, and the law is what keeps those windows explicit
rather than assumed:

- The **CEO** reads a verdict *for a mission* — `exceeded` against what target, over what period.
  The verdict is only legible with the window it judges.
- The **Manager** reads throughput — *how many* missions and approvals, over *which* span. "Forty
  missions" is a different fact this week than this year.
- The **Operator** reads run health *now* — the recent-events feed is itself a time window, the most
  recent activity, bounded on purpose.
- The **Customer** reads their campaign's results *for its flight* — the outcome over the campaign's
  own period, not an all-time blur.

An honest note on tier: live, user-selectable time-window controls (7d / 30d / quarter / year /
lifetime) are **❌ ROADMAP** across Book G — today's surfaces are per-mission and per-entity
snapshots, not time-bucketed views the reader can re-window. But the *law* binds the persona design
regardless: when a persona view foregrounds a number, that number must arrive with its window
attached. A persona lens that showed a bare figure with no time context would be a lens that lies by
omission, and Law 7 forbids it before it is built.

---

## 10. Dashboards inform personas — they never decide for them

A persona view exists to tell a reader what happened, so the reader can decide what to do. It does
not decide *for* them. This is the one boundary that keeps a dashboard a dashboard.

> **LAW 3 — Dashboard ≠ Decision.** A dashboard visualises; decisions stay with the human and the
> core intelligence. A dashboard never decides.

The distinction is sharpest exactly where a persona view is most persuasive:

- The CEO's verdict badge says `at_risk`. It does **not** cancel the campaign, reallocate budget, or
  escalate anything. It informs a person who may choose to. The badge reports; the CEO decides.
- The Manager's pending queue shows missions `awaiting_approval`. It does **not** approve or reject
  them. It surfaces them to a human whose approval is a sovereign act. The queue reveals the choice;
  it does not make it.
- The Operator's run-health feed shows what happened. It does **not** retry, halt, or re-route a run.
  It is a mirror of the system's activity, not a lever on it.

This is the invariant restated in the language of personas:

> **Observability reveals reality; it never changes reality.**

A persona lens changes *what a reader sees first*; it never changes *what the system does next*.
Differentiating the view for a CEO versus an Operator is a presentation choice — which is precisely
why it is safe to build. No persona view, however tailored, is permitted to reach back and act. It
informs its reader and stops there. This is the companion to Law 9 (*Observability Before
Optimization*): a dashboard may show a persona that a campaign is at risk, but it may never itself
say "change this" — the reading is the dashboard's job; the deciding and the optimising are the
human's and Book E's.

---

## 11. Boundaries — local, own-data-only, no vendor telemetry

Every persona view holds inside the platform's inviolable boundaries, and on the dashboard path they
are non-negotiable — because a dashboard is the surface most tempted to phone home.

- **100% local.** The executive report render (`routes.ts:707-728`), the operational dashboard
  (`routes.ts:148-155`), and the stats pass behind it (`routes.ts:1516-1546`) run entirely on the
  local machine. Every count, verdict, and feed entry is computed in-process from local stores. No
  persona view fetches from, or reports to, any external endpoint.
- **No vendor telemetry.** This is the sharpest line. A persona dashboard is built for the agency's
  own eyes, never for a vendor's. Nothing a CEO, Manager, Operator, or Customer sees — no verdict,
  no throughput count, no run-health entry — is transmitted off-device. Observability here is the
  opposite of telemetry: telemetry sends *your* activity to someone else; these dashboards keep the
  record of your activity entirely with you.
- **Own data only, copy-only.** Every persona view is a projection of the agency's own run records
  and metrics. It pulls in no external data to decorate a lens. The Customer's view, when it ships,
  will scope *down* to one client's own data — never up or out to anyone else's.
- **Human-sovereign.** Dashboards inform; humans decide (§10). Every persona lens exists to put a
  clear reading in front of a person who holds the decision. It never auto-acts to keep a view tidy.

The one-line boundary: **a persona view makes the agency's own work visible to the agency and to no
one else.**

---

## 12. Value contribution

Role-based dashboards map to both value levers, and the map is concrete because a lens that fits its
reader is a lens that saves that reader time.

**They cut production time by answering each reader in their own terms.** A CEO who must decode an
operational feed to find a verdict, or an Operator who must wade through executive prose to find run
health, is a reader paying a translation tax on every glance. The shipped surfaces already remove some
of that tax — the executive report compresses a whole mission into one verdict (✅), and the dashboard
compresses the whole system into counts, a pending queue, and a feed (✅). Differentiating those views
by persona extends the saving: each reader lands on the slice they came for, with no scanning past the
slices they did not. Across a book of missions and a roomful of readers, the difference between a
fitted lens and a shared page is the difference between a glance and a hunt.

**They grow revenue by making the platform legible to every stakeholder at once.** An agency sells its
clients confidence, and confidence is a function of who can see what, clearly. A Customer who can open
a view scoped to *their* campaign's results — and trust, by Law 4, that it can never contradict what
the agency's own CEO view says — is a client who can be shown the work rather than told about it. The
same single metric source that guarantees the CEO and the Operator never disagree is what lets the
agency put a client-facing lens in front of a customer without fear of two stories. One derived truth,
many honest lenses, is a platform an agency can open to its own clients — and that openness is the
difference between a tool the agency uses and an operating system the agency's clients can see into.

A single metric source, projected into as many lenses as there are readers, and guaranteed by
construction never to contradict itself — that is how one record becomes four trustworthy dashboards
without ever becoming four rival truths.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
