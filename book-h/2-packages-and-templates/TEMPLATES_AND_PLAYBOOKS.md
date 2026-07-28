# Templates & Playbooks

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md).
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## 1. What this document defines

This document defines what a **template**, a **playbook**, and a **workflow package** are when they
are treated as packageable units of the ecosystem — and, just as importantly, what they are *not*
yet. It owns one idea that runs through all three: a packageable unit of process is a **declarative
definition — data, not executable code**. A template is a shape to be filled; a playbook is a
sequence to be followed; a workflow package is a set of steps to be run. None of them is a program
that reaches into the core and runs. They describe; the core executes. That distinction is the
whole reason such a package can be added to the platform safely at all, and it is the axis this
document turns on.

The subject is deliberately narrow, and the honesty is deliberately blunt. Two of the three
concepts here have **no code**: there is no template system and no packageable playbook mechanism
in the product today. The third — workflow packages — has a real, verifiable *shape* (a declarative
`Sop`) but no engine and no live path. This document does not dress any of that up. It grounds what
can be grounded, tags everything else **❌ ROADMAP** with no citation, and refuses to present a
design intention as a shipped feature. The sibling document
[`CONTENT_PACKAGES.md`](CONTENT_PACKAGES.md) covers the *content* categories — prompt packages,
model packages, brand and creative packages; this one covers the *process* units: the templates and
step-sequences that describe how work is shaped and carried out.

The whole exercise is bounded by one sentence, stated here in full because every claim that follows
is a consequence of it:

> **The ecosystem extends the core; it never rewrites the core.**

A template, a playbook, a workflow package — each may be *added* to the platform, and each adds
capability. None may *change* the platform. The reason a declarative definition can be added freely
is precisely that it cannot rewrite anything: it is inert data until the core chooses to read it.
That is not an incidental property. It is the property that lets this document claim the whole
category is safe to package, and it is the property the rest of these pages exist to draw out.

---

## 2. Templates — the packageable shape (❌ ROADMAP)

A **template**, in ecosystem terms, is a reusable shape for a piece of work: a campaign brief with
its fields laid out, a report skeleton with its sections named, a creative frame with its slots
marked. A template package would be an installable unit carrying one or more such shapes, so that an
agency could add "the SaaS launch brief" or "the quarterly performance report layout" the way it
would add any other package — and remove it just as cleanly (Law 2).

**This does not exist. There is no template system in the product today — ❌ ROADMAP.** No brief
template, no campaign template, no report template, and no creative template exists as a packageable
unit, because there is no template *registry*, *envelope*, or *definition type* for them to be
packaged as. This must be stated plainly, because it is easy to assume otherwise given that the
platform generates reports today.

It is worth being precise about what the platform *does* have, so the gap is unmistakable rather
than glossed. Report generation is a real, working capability — but it is **AI-driven, not
template-driven**. A campaign report is composed at generation time by the analytics and AI layers;
it is not stamped out of a stored template a user selected, edited, and could package for reuse.
There is no template the report is rendered *from*, and therefore nothing to extract, version,
install, or share. The output exists; the reusable, packageable *shape behind* the output does not.
The two are different things, and only the second is what this section is about.

So the honest posture is: templates are a coherent ❌ roadmap category with a clear home in the
package model, and **no code backs them**. What a template package *would* look like once built is
constrained by the same laws every other package obeys — it would be a declarative definition
(§5), it would carry the seven-field manifest of the Trust Boundary (Law 3), and it would only ever
*add* a shape, never rewrite how the core renders (Law 5). But "would" is the operative word. Under
Law 6 (Implementation Before Documentation), a template system cannot be promoted past ❌ until the
code exists and `PRODUCT_TRUTH.md` records it. Today it is design intent, and it is labelled as
such.

### 2.1 The four template kinds this category reserves (all ❌ ROADMAP)

The category names four kinds so the roadmap is legible, not because any is built:

- **Brief templates** — a structured shape for a campaign or project brief: objective, audience,
  constraints, deliverables, success measures. ❌ ROADMAP.
- **Campaign templates** — a shape for a whole campaign's plan: phases, channels, cadence, the
  slots a strategist fills. ❌ ROADMAP.
- **Report templates** — a named skeleton a report is rendered *into* (as distinct from today's
  AI-composed report, which has no such skeleton). ❌ ROADMAP.
- **Creative templates** — a frame for a creative deliverable: the fixed structure, the variable
  slots, the brand rules that apply. ❌ ROADMAP.

Each is a *shape to be filled*, which is exactly why each is a candidate for the declarative model
in §5. None carries a citation, because none has an implementation to cite.

---

## 3. Playbooks — narrative today, package tomorrow (❌ ROADMAP as code)

A **playbook** is a named sequence of steps for handling a recurring situation: how to onboard a new
client, how to respond when a campaign's performance drops, how to run a launch week. In the
ecosystem model, a playbook package would carry such a sequence as an installable, versioned,
removable unit — so that "the retention-recovery playbook" could be added to a platform, followed,
improved, and shared.

**As a packageable code concept, this does not exist — ❌ ROADMAP.** Playbooks live in the product's
world **only as narrative documents** today: prose that a human reads and applies by hand. A
narrative playbook is valuable, but it is not a package. It cannot be installed, it cannot be
versioned by the platform, it cannot be validated under the Trust Boundary, and — critically — it is
not a definition the system can read and act on. It is words for a person, not data for the core.
The distance between "a document describing a sequence" and "a declarative sequence the platform can
hold as a package" is the entire distance this section is honest about.

This is the sharpest illustration of Law 6 in Part 2. There is genuine process knowledge captured in
narrative form, and it would be easy to describe it as though the platform already understood it. It
does not. Turning a narrative playbook into a **packageable playbook** means giving it a declarative
form the core can read (§5) — and that form does not exist as code. Until it does, the playbook is a
document, the category is ❌ ROADMAP, and no citation is offered.

What *is* true, and worth naming precisely because it points at the nearest real shape, is that a
playbook and a workflow package are close cousins: both are ordered sequences of steps with owners
and outcomes. The next section grounds that cousin — the workflow package — in real, verifiable
types. A playbook is, in effect, a workflow package written for a recurring *situation* rather than
a departmental *procedure*; when the declarative workflow shape below is built into a real engine
and package, the packageable playbook rides the same rails. That is a roadmap statement, not a claim
of code.

---

## 4. Workflow packages — the declarative `Sop` shape (🔶 BUILT, UNWIRED)

Of the three concepts in this document, workflow packages are the only one with a real, inspectable
anchor in the codebase. It is not a shipped feature and it is not wired into anything — but it is
**code that exists**, and it is the nearest thing the platform has to a "packageable, declarative
workflow." This is the one section here that carries citations, and every one of them resolves to a
type or a port, not to a live path.

A **workflow package** would be an installable unit carrying one or more workflow definitions: an
ordered set of steps, each with an owner and a required output, versioned as a whole. The platform
already declares exactly that shape — as a **Standard Operating Procedure**, or `Sop`.

### 4.1 The `Sop` is a keyed, versioned, declarative definition (🔶)

The `Sop` interface (`domains/corporate-os/src/sop.ts:24`) is a plain data shape. It has a stable
`key` — e.g. `"marketing.create_campaign"` — a numeric `version` (`sop.ts:26`, and the source is
explicit that "every SOP is versioned"), a `title`, a `department`, and — at its heart — an ordered
`steps: SopStep[]` (`sop.ts:29`). It also carries the `successMetrics` the procedure is scored on
and an `active` flag. Read it as a document, because that is what it is: a declaration of *what the
procedure is*, containing no instruction for *how to execute* anything. There is no function body, no
callback, no embedded code in the shape — only named fields describing a process.

### 4.2 A step declares work; it does not perform it (🔶)

Each `SopStep` (`sop.ts:12`) is likewise pure description. A step has an `id` and a human `name`; an
`owner` — the department, role, or capability responsible; an optional `gate` that must pass before
the step advances; a `dependsOn` list that orders it against other steps; and a required `output`
with a `name` and optional `schema` — the measurable artifact the step must produce. Notice what is
absent: a step does not carry the code that does its work. It names an owner and an output and a
gate. It says *this must happen, produced by this role, and it isn't done until this output exists* —
and nothing about the mechanism. A step is a specification, not a subroutine. That is precisely what
makes a set of steps safe to package: shipping an `Sop` ships a description of a process, not a
program that runs inside the core.

### 4.3 There is a port to publish and run them — and no engine behind it (🔶 → ❌)

The platform declares an engine *interface* for these definitions: `SopEnginePort`
(`sop.ts:35`) exposes `get(key, version?)`, `list(department?)`, `publish(...)`, and
`start(...)`. Two of these matter most to the packaging story:

- **`publish(sop)`** (`sop.ts:38`) — takes an `Sop` (minus its `active` flag) and publishes it. This
  is the exact verb a workflow *package* needs: a defined, versioned way to introduce a new workflow
  definition into the platform. It is the shape of an install seam for declarative process.
- **`start({ key, subjectId, variables })`** (`sop.ts:40`) — begins a run of a published `Sop`
  against a subject (a mission, client, or campaign), returning a `runId`.

Here the tier must be exact. **`SopEnginePort` is a port — an interface, with no engine
implementation behind it, and it is not wired into the live application.** The `sop.ts` file itself
says the engine implementations "land in BOOK 5's pass"; in the shipped product there is no class
that fulfils this port and no path that reaches it. So the *definition shape* (`Sop`, `SopStep`) and
the *contract* (`SopEnginePort`, `publish`, `start`) are 🔶 BUILT (UNWIRED) — real, typed, and
inspectable. The *engine that would execute a published workflow* is ❌ ROADMAP — there is no code to
cite. A workflow package, as a genuinely installable-and-runnable unit, therefore sits on a real
declarative foundation (🔶) with an unbuilt execution floor (❌), and this document keeps those two
facts apart.

### 4.4 Why this shape, and not a plugin, is the right anchor

It matters that the nearest real "packageable workflow" is a *data shape* rather than a plugin or a
script. A plugin would be executable code that the core would have to run — and running foreign code
inside the core is the exact thing Law 4 forbids (§5). The `Sop` is the opposite: it is a
declaration the core would *read* and drive, step by named step. That the platform's closest thing to
a packageable workflow is a declarative definition, not an executable module, is not an accident of
where the code happens to be. It is the shape the laws would have demanded anyway. The next section
makes that argument directly.

---

## 5. The key principle — a package is a definition, not a program (ties to Law 4)

Everything in this document rests on a single distinction, and it is worth stating as sharply as
possible because it is the reason this whole category can exist safely:

**A template, a playbook, and a workflow package are all declarative definitions — data that
describes work — not executable plugin code that performs work.**

A declarative definition is inert on its own. A template is a shape with empty slots; it does nothing
until something fills it. A workflow `Sop` (`sop.ts:24`) is a list of named steps; it does nothing
until an engine reads it and drives the run. A playbook is a sequence of instructions for a
situation; it does nothing until a human or a defined engine follows it. In every case the *doing*
belongs to the core; the *describing* belongs to the package. The package carries knowledge, not
execution.

This is exactly what **Law 4 — No Hidden Execution** demands. Law 4 says no package may run hidden
code inside the core; a package may use only the defined extension points. A declarative definition
satisfies Law 4 not by being carefully sandboxed but by *having no code to run in the first place*.
There is nothing hidden in an `Sop` because there is nothing executable in an `Sop` — its `steps`
(`sop.ts:29`) are named descriptions, and each `SopStep` (`sop.ts:12`) is a specification of owner
and output, not a function. You cannot smuggle behaviour into a package that carries no behaviour.
Publishing a workflow through `publish()` (`sop.ts:38`) introduces a *definition* into the platform;
it does not introduce a *procedure the CPU will run on the package's behalf*. The core reads the
definition and remains the only thing executing.

Draw the consequence out fully, because it is the heart of the matter: **declarative definitions add
capability without running hidden code in the core.** This is what makes the whole template /
playbook / workflow category the *safe* part of the ecosystem to build first. An agency can add a
brief template, a launch playbook, a campaign workflow — and each one extends what the platform can
express *without ever handing the core a program to run*. The capability grows; the executing surface
does not. Compare the alternative: a package that shipped code would force the core to either run
foreign logic (violating Law 4) or build an elaborate cage to contain it. The declarative model
sidesteps that entirely. The definition is the payload; the core is the only engine; and because the
payload cannot execute, adding it cannot compromise the core. That is not a mitigation of a risk —
it is the *absence* of the risk by construction.

This is also why the honest tiers in this document are not a weakness of the design but a feature of
its discipline. The declarative shape that exists (`Sop`, 🔶) is exactly the shape the laws would
prescribe; the pieces that don't exist yet (the template system, the packageable playbook, the
execution engine — all ❌) are unbuilt *capabilities*, not unbuilt *safety*. When they are built,
they will be built as declarative definitions, because that is the only form that satisfies Law 4.

---

## 6. Only ADD, never rewrite — the boundary against the core (Law 5)

Law 4 governs *how* a package may act (as data, through defined seams, never as hidden code). **Law
5 — Ecosystem Never Rewrites Core** governs *what* a package may change: it may only ADD, and it may
never rewrite the Pipeline, the Memory, the Analytics, or the Evidence. The three concepts here are a
clean fit for Law 5, because each is purely additive by nature:

- A **template** adds a new shape to fill. It does not change how the core renders anything that
  exists; it offers one more skeleton the core can render *into*. Remove it and the core renders
  exactly as before.
- A **playbook** adds a new sequence to follow. It does not rewrite any existing procedure; it sits
  alongside them as one more named way to handle a situation.
- A **workflow package** adds a new `Sop` (`sop.ts:24`) through `publish()` (`sop.ts:38`). Publishing
  a workflow *introduces* a definition; it does not — and structurally cannot — reach into the
  Pipeline and alter how missions run, or into Memory and rewrite what the company knows, or into
  Analytics and change how a metric is derived. A published `Sop` is a new keyed, versioned entry. It
  is an addition to a set, never an edit of the core's contracts.

The additive-only property follows directly from the declarative one in §5. A definition that carries
no executable code has no mechanism to rewrite anything — the most it can do is *be there* as one more
description the core may read. The direction is one-way and the laws make it so: the core is fixed
(Books A–G, frozen), and the ecosystem depends on the core while leaving it exactly as specified. A
template, a playbook, a workflow package — each consumes the core's execution and extends the
vocabulary of process; none reaches back to alter the core. Restated as the invariant this whole
book turns on:

> **The ecosystem extends the core; it never rewrites the core.**

The frozen relationship is documented in [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) and in the
core specification; this document simply confirms that templates, playbooks, and workflow packages
honour it by construction — they are addable *because* they are declarative, and they are
non-rewriting *because* they carry no code to rewrite with.

---

### 6.1 The three concepts at a glance

The honest posture of this whole document reduces to one table. Every row is a declarative
definition (§5), additive-only (§6); the columns record what actually exists behind each:

| Concept | What it is | Nearest real anchor | Tier |
| --- | --- | --- | --- |
| **Templates** (brief / campaign / report / creative) | A reusable shape to fill. | None. Report generation ships, but it is AI-driven with no template or registry behind it. | ❌ ROADMAP |
| **Playbooks** | A named sequence for a recurring situation. | None as code. Playbooks exist only as narrative documents today. | ❌ ROADMAP |
| **Workflow packages** | An ordered, owned, versioned set of steps. | `Sop` / `SopStep` shape + `SopEnginePort` (`sop.ts:24`, `:12`, `:35`). Ports/types only; no engine; unwired. | 🔶 BUILT (UNWIRED) |
| Workflow *execution* engine | The code that would drive a published `Sop` run. | `SopEnginePort.start` (`sop.ts:40`) is a port with no implementation. | ❌ ROADMAP |

Read down the tier column and the discipline is visible: one real declarative shape, and three honest
gaps. Nothing here is presented as more built than it is, and the one thing that *is* built is the one
thing the laws would have prescribed anyway — a definition, not a program.

---

## 7. Boundaries — local, own-data, no hidden execution

The template / playbook / workflow category lives inside the same boundaries that hold across the
whole platform, and on this path they are not incidental — they are what make a packageable process
definition trustworthy:

- **100% local, offline-first.** A template, playbook, or workflow definition is a **local
  artifact**. It is held on the agency's own machine; adding one transmits nothing and fetches
  nothing. A declarative definition is data at rest, and that data stays on the device.
- **No hidden execution, no vendor telemetry.** Per §5, a definition carries no executable code, so
  there is no path by which installing a template or a workflow could run something the agency did
  not intend, phone home, or open a channel to a vendor. The declarative model is the *reason* the
  boundary holds: you cannot exfiltrate through a payload that cannot execute.
- **Core isolation — additive only.** Per §6, none of these packages modifies Books A–G. They add
  shapes and sequences; the core's contracts are untouched. Remove any of them and the core keeps
  running unchanged (Law 2, package independence).
- **Human-sovereign.** A template shapes work for a human to do; a playbook guides a human's
  judgement; a workflow `Sop` names owners and gates for humans and defined engines to satisfy. None
  of them decides on a human's behalf. A declarative definition informs and structures; it does not
  seize the decision.

The one-line boundary: **a process package is a local declaration — it describes work, holds no
executable code, and adds to the core without ever changing it.**

---

## 8. Value contribution

The value of this category is easy to name even though most of it is still ❌ roadmap, because the
value is the same value that makes any *reusable* asset worth building: it turns work done once into
work never repeated.

**It cuts production time by making process reusable instead of re-invented.** The hours an agency
loses to process are rarely spent doing the work — they are spent *re-deriving how to do it*:
rebuilding a brief from a blank page, reconstructing a campaign plan that a colleague already solved,
re-explaining a launch sequence that has run five times before. A template collapses "start from
nothing" into "fill in the shape." A workflow package collapses "remember every step and its owner"
into a declared `Sop` (`sop.ts:24`) whose steps, owners, gates, and outputs are already named
(`sop.ts:12`, `sop.ts:29`). A playbook collapses "recall how we handled this last time" into a
sequence anyone can follow. The saved time is the difference between a process an agency carries in
people's heads and one it carries as a versioned, shareable definition.

**It grows agency revenue by turning process expertise into a packageable asset.** An agency's hard-
won way of running a campaign — its brief structure, its launch playbook, its performance-recovery
workflow — is, today, tacit knowledge locked in its staff. As a packageable declarative definition,
that expertise becomes an *asset*: something that can be reused across every client, standardised so
quality does not depend on who is on the account, and — once the ecosystem's partner and marketplace
layers exist — potentially shared or sold. The version field on an `Sop` (`sop.ts:26`) is a small
sign of this: a process that is versioned is a process that can be improved deliberately and rolled
out as an asset, rather than drifting silently. An agency that packages its best process runs it the
same excellent way every time, and owns something reusable it previously only rented from memory.

Both levers are gated by Law 6: the value is real, and today it is mostly *potential* value, because
the template system and the packageable playbook are ❌ and the workflow engine behind the 🔶 `Sop`
shape is unbuilt. This document claims the design, not the delivery. What it claims *without*
qualification is the safety of the path to get there — because every unit in this category is a
declarative definition, the platform can build toward that value knowing that each addition extends
the core and none of it rewrites the core.

> **The ecosystem extends the core; it never rewrites the core.**

That sentence is also the value proposition compressed. A process an agency can package — a template,
a playbook, a workflow — is capability the platform gains for free of risk, because a definition
adds and never overwrites. The reusable asset grows; the trusted core stays exactly as specified.
That is the whole promise of packaging process as data.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
