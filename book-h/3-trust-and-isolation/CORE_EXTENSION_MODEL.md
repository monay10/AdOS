# The Core Extension Model

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

This document defines **how the core is extended** — and, by defining that precisely, defines what an
ecosystem package is allowed to do to the platform it attaches to. The subject here is the *extension
model*: the discipline that says a package may add value beside the core at declared seams, in
declared shapes, and by no other route. Isolation — the guarantee that the frozen core cannot be
rewritten by anything the ecosystem installs — is not a separate feature bolted on for safety. It is
the **consequence** of the extension model being disciplined. Confine extension to declared,
declarative seams and isolation follows for free; leave extension undisciplined and no amount of
sandboxing recovers it after the fact.

The document owns three of the six governing laws, and they are one idea told three ways. It owns
**LAW 1 — Core Isolation**, the rule that no package may modify the Core Specification: the
responsibilities of Books A through G cannot be changed by anything the ecosystem adds, only extended.
It owns **LAW 4 — No Hidden Execution**, the mechanism that makes Law 1 enforceable rather than
aspirational: a package may attach *only* at defined extension points and may never run hidden code
inside the core. And it owns **LAW 5 — Ecosystem Never Rewrites Core**, the guarantee those two laws
buy: a package cannot change the Pipeline, the Memory, the Analytics, or the Evidence — it may only
*add* a new template, workflow, prompt, benchmark, or playbook.

One sentence governs the whole exercise, and it is the boundary of everything that follows:

> **The ecosystem extends the core; it never rewrites the core.**

The word *extends* is doing exact work. To extend is to add capability *beside* a thing while leaving
the thing itself untouched. It is the opposite of *rewrite*, which reaches in and changes how the
thing decides. This document is the clearest home in Book H for that sentence, because the extension
model is precisely the machinery that makes "extends, never rewrites" a structural fact rather than a
promise. Everything below is an unfolding of that one line.

---

## 2. LAW 1 — the core is frozen, and freeze is the premise

> **LAW 1 — Core Isolation.** No ecosystem package may modify the Core Specification. The
> responsibilities of Books A, B, C, D, E, F, and G cannot be changed by any package — only extended.

The extension model begins from a fact it does not get to negotiate: the core is already frozen. The
[`../../ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md) is the **freeze declaration**
for Books A through G — it names them a single locked contract, `AdOS Core Specification v1.0`, and it
states the directional rule that governs everything built afterward. In its own words, later work
*"may only consume, observe, or extend [the core] without altering their contracts."* That is not
Book H's rule; it is the core's own rule, declared before Book H existed, and Book H inherits it whole.

Read the freeze principle as three permissions and two prohibitions, because the extension model is
built exactly inside the gap between them. A later layer — and the ecosystem is the outermost later
layer — may:

- **Consume** what a core book produces: read its outputs, its records, its evidence.
- **Observe** what a core book does: render, measure, and compare its activity.
- **Extend** the platform *around* the core: add value beside it.

And a later layer may **never**:

- **Change a core contract, interface, or law.**
- **Reach into a core book to alter how it decides.**

The extension model lives entirely in the third permission — *extend around* — and exists to keep the
ecosystem from ever drifting into the two prohibitions. This is why isolation is a consequence and not
a subject: the core does not need the ecosystem to isolate it, because the core froze itself first.
What the ecosystem must supply is a way to add value that *cannot* cross the freeze line even by
accident. That way is the extension model, and Laws 4 and 5 are its two halves.

A note on direction, because it is the load-bearing asymmetry of the entire book. The dependency runs
one way only: the core does not depend on the ecosystem; the ecosystem depends on the core and leaves
it exactly as specified. Unplug every ecosystem package and the core runs unchanged — that is Law 2
(Package Independence), and it is only *possible* because Law 1 froze the core the packages hang off.
A frozen center is what lets the edge be freely added to and freely removed.

---

## 3. LAW 4 — what a defined extension point is

> **LAW 4 — No Hidden Execution.** No package may run hidden code inside the core. A package may use
> **only** the defined extension points.

Law 1 says the core may not be modified. Law 4 says *how that is made true*: by allowing a package to
attach only at points the platform has declared in advance, and by forbidding every other route in. A
**defined extension point** is a seam the core publishes on purpose — a named, documented place where
the ecosystem is invited to attach a declared kind of content, under the platform's own terms. Its
defining properties are what make it safe:

- **It is declared, not discovered.** An extension point exists because the platform published it. A
  package may not invent an attach site, monkey-patch a module, or reach into a core book's internals
  to find a foothold. If the platform did not declare the seam, the seam is not available — full stop.
- **It accepts data, not hidden behaviour.** What flows through a defined extension point is a
  *declaration* — a template, a workflow definition, a prompt, a benchmark, a playbook — content the
  core interprets under its own rules. It is not a channel for a package to smuggle executable code
  that runs *as if* it were the core. This is the literal meaning of "No Hidden Execution": the core
  never finds itself running behaviour it did not author, on a path it did not open.
- **It is one-directional and observable.** An extension point lets the ecosystem *add to* or
  *observe* the core; it never lets a package *reach back* and rewrite how the core decides. And
  because it is declared, every attachment through it is visible — auditable at the seam, not buried
  inside a book's private logic.

The contrast Law 4 rules out is the *hidden* execution path: a package that, once installed, quietly
runs its own code inside the Pipeline, mutates a Memory record, or intercepts an Analytics
computation. That is the failure mode every plugin system risks and the one the extension model exists
to make impossible. A defined extension point is the antidote: because the only way in is a declared
seam that carries declared data, there is no in-road for hidden behaviour to travel. The core executes
only what the core authored; the ecosystem contributes only what the seam accepts.

The declarative discipline is the deep point, and it ties back to how packages stay safe (developed in
[`../2-packages-and-templates/TEMPLATES_AND_PLAYBOOKS.md`](../2-packages-and-templates/TEMPLATES_AND_PLAYBOOKS.md)):
a workflow expressed as *data* — a keyed, versioned definition the engine reads — is not executable
plugin code. It cannot do anything the engine does not already know how to do. That is what makes it
packageable without violating Law 4. A defined extension point accepts definitions of that kind, and a
definition, by construction, cannot run hidden.

The distinction is easiest to see by contrast. Consider two ways a package might "add a workflow." In
the first, the package ships a definition — a keyed, versioned sequence of steps the core's engine
reads and runs under its own rules. The engine does the executing; the definition merely *describes*.
Nothing new runs; something already-known runs over new data. In the second, the package ships a
module and asks the core to load and call it — arbitrary behaviour the core did not author, executing
on a path the core opened blindly. The first is extension. The second is hidden execution, and Law 4
forbids it precisely because the core cannot know what the second one will do. A defined extension
point is the seam that accepts the first and has no shape that could accept the second: it takes a
declaration and hands it to the core's own interpreter, and there is no parameter down which raw
behaviour could travel. That is the whole safety property — the seam is typed to *data*, not to *code*.

---

## 4. LAW 5 — what may be added, and what never may

> **LAW 5 — Ecosystem Never Rewrites Core.** A package cannot change the Pipeline, the Memory, the
> Analytics, or the Evidence. It may only **add**: a new template, a new workflow, a new prompt, a new
> benchmark, a new playbook.

If Law 4 is the *how* of extension — attach only at declared seams — Law 5 is the *what* — add only
declared kinds, and never touch the four things that are the core's own. It draws a bright line with
two sides, and the whole model depends on the line staying bright.

**What a package may ADD — the five declared shapes.** These are the units the ecosystem is invited to
contribute, and each is additive by nature: it sits beside the core as new content the core can draw
on, never as a replacement for how the core works.

| The addable shape | What it contributes | Why it is safe to add |
| --- | --- | --- |
| **Template** | A reusable structure — a brief, campaign, report, or creative scaffold | It is a form the core fills in; it changes what is produced, never how production runs. |
| **Workflow** | A declarative sequence of steps the engine reads and runs | It is a *definition*, data the engine interprets, not executable code that runs as the core. |
| **Prompt** | A versioned, scorable instruction the AI layer can select | It joins a registry the core consults; it never rewrites how the AI layer decides. |
| **Benchmark** | A comparison standard for scoring or evaluation | It supplies a yardstick the core measures against; it does not change the measuring. |
| **Playbook** | A reusable operating procedure — a keyed, versioned sequence | It is a stored *definition* an operator can run; it adds a procedure, not a new engine. |

**What a package may NEVER change — the four untouchables.** These are the core's own, and they are
named precisely so no package can claim ambiguity later:

- **The Pipeline** — how a mission moves through the platform. A package adds content that flows
  *through* the pipeline; it never re-plumbs the pipeline itself.
- **The Memory** — the record of what happened. A package may read memory and contribute new
  material; it may never mutate a memory record or change how memory stores facts.
- **The Analytics** — how the core measures and renders its own activity. A package may add a
  benchmark to measure *against*; it may never alter the derivation of a metric.
- **The Evidence** — the provenance and audit chain. A package may add content whose provenance is
  recorded; it may never reach into the evidence chain to rewrite what was recorded.

The relationship between the two sides is the whole of Law 5: *add to the left column, never touch the
right*. Every one of the five addable shapes is a way to make the core do *more of what it already
knows how to do*; none of them is a way to change what the core does. Prompt packages give the AI
layer more prompts to select from — they do not rewrite selection. Workflow packages give the engine
more sequences to run — they do not rewrite the engine. That asymmetry, held rigidly, is why an
ecosystem can grow without bound while the core stays exactly one thing.

---

## 5. The honest tier — there is no first-class extension point today (❌ ROADMAP)

Here is the blunt part, stated the way this book states every hard truth: **AdOS has no first-class
extension-point framework today.** The extension model of §3 and §4 is a *specification* — a design
for how packages should attach — not a shipped mechanism they attach through. Nothing in the live app
takes a package, registers it, and runs it at a declared seam. A reader who wants to see the extension
model working will not find it, because it is not built. The honest tier for the extension-point
framework is **❌ ROADMAP**, and the code makes the reason exact.

**The composition root takes only three things, and none of them is a plugin surface.** The web
application is assembled in one place — the `App` constructor — and that constructor accepts exactly
`bus`, `ai`, and `repos` (`apps/web/src/app.ts:69-72`): an event bus, an AI manager, and a repository
bundle. There is no fourth parameter for packages, no plugin array, no `register(...)` hook at the app
level. Every service the app runs is hard-wired inside that constructor, one `new` at a time
(`app.ts:74-91`). The composition root is a *fixed assembly*, not an *open socket*. An ecosystem
package has no declared parameter to arrive through, because the constructor declares none.

**The one place a package could attach today is a read-only observation seam, not an extension
framework.** When the app starts, it subscribes to *every* domain event with a wildcard —
`subscribe('>')` (`apps/web/src/app.ts:120`) — and uses that firehose to build an activity feed and an
audit log. This is the closest thing to an attach point the live app has: a package that wanted to
*watch* the system could, in principle, hang off the same event stream. But watch is all it could do.
The wildcard subscription is an **observation seam** — it lets you see what the core did; it gives you
no way to add a template, register a workflow, or contribute a prompt the core will use. It is
faithful to the freeze principle's "observe" permission and to nothing more. Calling it an extension
point would be dishonest: you cannot extend a system by watching it.

**The registration *shape* exists in a package, but it is unwired to the app (🔶 BUILT, UNWIRED).**
There is real code that shows what a registration mechanism looks like. The AI manager's model
registry exposes a runtime `register(model)` method (`packages/ai-manager/src/model-registry.ts:57`)
that adds a model descriptor to an in-memory map — a genuine, data-driven "add a unit at runtime"
operation, the exact *shape* an extension point would want. But it is **built and unwired**: the live
app does not reach it. The web app selects its model by environment variable, bypassing the registry
entirely, so `register()` is real code that no live path calls. It is a 🔶 anchor — proof that the
*idea* of a registration seam is coherent and partly implemented — but it is wired to nothing at the
app level, and a shape that nothing calls is not an extension point yet.

Put the three facts together and the picture is unambiguous. The composition root is closed
(`app.ts:69-72`). The only live seam is read-only observation (`app.ts:120`). The one registration
mechanism that exists is unwired (`model-registry.ts:57`). A real, safe, first-class extension-point
framework — a declared socket where a package attaches, is validated, and adds a template / workflow /
prompt / benchmark / playbook the core will actually use — is **net-new work that does not exist
today**. This document specifies what that framework must guarantee. It does not pretend the framework
is here.

The honest ledger of attach seams, stated plainly so nothing reads as further along than it is:

| Seam | Where | What it actually is | Tier |
| --- | --- | --- | --- |
| Composition root | `apps/web/src/app.ts:69-72` | A closed constructor taking `bus`/`ai`/`repos` — no plugin parameter, no `register` hook | closed, not a seam |
| Wildcard event subscription | `apps/web/src/app.ts:120` | A read-only observation seam — watch every event, add nothing | ✅ live, observe-only |
| Model registry `register()` | `packages/ai-manager/src/model-registry.ts:57` | The *shape* of a registration mechanism — real, but no live app path reaches it | 🔶 BUILT (UNWIRED) |
| Extension-point framework | — | A declared, validated socket packages attach through | ❌ ROADMAP (net-new) |

The table is the section in one glance: one closed door, one window you can only look through, one
unwired mechanism that shows the right shape, and the actual framework still to be built. There is no
row that is a safe, live extension point, because there is no such thing yet.

---

## 6. Why the extension model *yields* isolation

The payoff of §§2–4 is the reason the framing of this document insists that isolation is a consequence
and not a subject. Isolation is not something you add to the extension model to make it safe. Isolation
is what you *get*, automatically, once extension is confined to declared, declarative seams. The
implication runs in one direction and it is worth tracing exactly:

- **Because a package may attach only at a declared extension point** (Law 4), there is no undeclared
  route by which it could reach a core internal. A package with no in-road cannot rewrite what it
  cannot reach.
- **Because what flows through that point is a declaration, not hidden behaviour** (Law 4 again), the
  core never runs code it did not author. A core that executes only its own logic cannot be
  hijacked by an installed package.
- **Because the only things a package may add are the five additive shapes** (Law 5), and none of
  them is the Pipeline, the Memory, the Analytics, or the Evidence, the four untouchables stay
  untouched by construction — not by vigilance, by *construction*.
- **Therefore the core cannot be rewritten by a package.** Which is Law 1. Which is isolation.

Read that chain backwards and the point sharpens. Isolation — "the core cannot be rewritten by a
package" — is not a wall the platform builds around the core after the fact. It is the *shadow* the
extension model casts. Confine extension tightly enough and there is simply nowhere for a rewrite to
happen. This is why the honest tier of §5 matters so much: today the confinement is specified but not
enforced by a framework, so today's isolation rests on the composition root being *closed*
(`app.ts:69-72`) — nothing can attach because nothing may — rather than on a framework that safely
mediates attachment. The core is isolated today because the door is shut, not because there is a
guarded doorway. The extension-point framework is the work of turning a shut door into a guarded one:
a way to *let packages in* that preserves the same isolation a closed constructor gives for free.

There is a subtlety worth naming, because it is where the framework's difficulty actually lives. A
closed door and a guarded doorway give the *same* isolation but they are not the same engineering. A
closed door is easy: refuse everything and nothing gets in. A guarded doorway is hard: admit the right
things and reject the wrong ones, at a seam, every time, without a gap. The extension-point framework
is the second thing, and its whole burden is to preserve — while *admitting* packages — the exact
isolation that the closed constructor gives by *admitting nothing*. That is why this document's tier is
honestly ❌ and not a soft "partly there": the easy isolation exists today, and the hard isolation, the
kind that survives being opened, is the net-new work. The specification above is the contract that work
must meet — declared seams (Law 4), additive shapes only (Law 5), the four untouchables untouched
(Law 5), the frozen core unaltered (Law 1). Build to that contract and the guarded doorway isolates as
completely as the closed door did; deviate from it and the opening becomes the rewrite path the whole
model exists to forbid.

This is the companion truth to the freeze principle. The core froze *itself* (§2); the extension model
is how the ecosystem grows without unfreezing it. A frozen center and a disciplined edge are the same
guarantee seen from two sides — and the sentence that names it belongs here more than anywhere else in
Book H:

> **The ecosystem extends the core; it never rewrites the core.**

---

## 7. The laws this document owns

This document is the owner of Laws 1, 4, and 5, and owning them together is deliberate, because apart
they are incomplete:

- **Law 1 — Core Isolation** is the *premise*: the core is frozen and its responsibilities cannot be
  changed, only extended. It comes first because everything else is built to keep it true.
- **Law 4 — No Hidden Execution** is the *mechanism*: extension happens only at declared points that
  carry declarations, never hidden code. It is what makes Law 1 enforceable instead of hopeful.
- **Law 5 — Ecosystem Never Rewrites Core** is the *guarantee*: the four untouchables stay untouched,
  and only the five additive shapes may be added. It is what Laws 1 and 4 deliver.

Read them as premise → mechanism → guarantee and the extension model is their sum: *because the core
is frozen (1) and packages attach only at declared, declaration-carrying seams (4), no package can
rewrite the Pipeline, Memory, Analytics, or Evidence (5).* Remove any one and the other two weaken.
Remove Law 1 and there is no frozen thing to protect. Remove Law 4 and Law 5 becomes an unenforceable
wish, because a package with a hidden execution path can touch anything. Remove Law 5 and Law 4's
carefully bounded seam has no bounded *purpose*. Held together, they are the extension model, and the
extension model is isolation.

The two neighbouring laws this document does not own still bear on it, and belong here as context. Law
3 (Trust Boundary), owned by [`TRUST_BOUNDARY.md`](TRUST_BOUNDARY.md), governs *whether* a package's
content may be trusted before it is ever allowed near an extension point — the seven-field manifest
that must accompany anything installable. The extension model assumes trust has already been
established: a defined extension point accepts a *validated* declaration, not any declaration. And Law
2 (Package Independence) is the mirror image of isolation: because packages attach only additively at
declared seams, any package can be removed and the core keeps running unchanged. Isolation and
independence are the same discipline read in two directions — nothing a package adds can rewrite the
core, and nothing a package's removal takes away can break it.

---

## 8. Boundaries — local, own-data-only, no hidden execution

The extension model holds inside the platform's inviolable boundaries, and on the extension path those
boundaries are not incidental — they are part of *why* the extension model is shaped the way it is.

- **100% local.** An extension point is a local socket, not a remote one. A package that attaches is a
  local artifact adding local content; nothing about extension opens a channel off the device. The
  composition root assembles the app entirely in-process (`apps/web/src/app.ts:69-92`), and any future
  extension seam inherits that locality — a package extends a machine, not a cloud.
- **No hidden execution — the boundary that is also a law.** "No Hidden Execution" (Law 4) is both a
  governing law and a boundary, and it is the sharpest one here. A package may never run behaviour the
  core did not author on a path the core did not open. This is what keeps the platform auditable: if
  the only things that execute are the core's own logic and the declarations flowing through declared
  seams, then everything that runs is accountable. Hidden execution is exactly what would make an
  installed package a telemetry vector or a covert mutation — and the extension model forbids it at
  the root.
- **Own data only, copy-only.** What flows through an extension point is a declaration a package
  brings — a template, a workflow, a prompt — added *beside* the agency's own data, never reaching in
  to exfiltrate or overwrite it. Extension adds material; it does not siphon the record.
- **Human-sovereign.** An extension point never lets a package act autonomously inside the core. It
  lets a package *offer* content that a human, and the core's own logic, may then use. The ecosystem
  contributes; the human and the frozen core still decide.

The one-line boundary: **an extension point is a local, declared, declaration-only seam — it adds
content beside the core and can never run hidden behaviour inside it.**

---

## 9. Value contribution

The extension model maps to both value levers, and it does so precisely because a disciplined seam is
what makes an ecosystem *safe enough to open*.

**It grows agency revenue by making the platform extensible without making it fragile.** An operating
system an agency can add to is worth more than a closed tool, because its value compounds: every
template, workflow, prompt, benchmark, and playbook a package contributes is capability the agency
gets without rebuilding the core. But extensibility is only an asset if it is *safe* — an agency will
not install third-party content into a system that runs client work if that content might quietly
rewrite how the system decides. The extension model is what turns "extensible" from a risk into a
selling point: because Law 4 confines attachment to declared, declaration-carrying seams and Law 5
forbids touching the Pipeline, Memory, Analytics, and Evidence, an agency can grow its platform's
capability by installing packages *without* betting the integrity of its core on each one. A platform
you can safely open to an ecosystem is a platform whose value grows with every package added — that is
the revenue case, and it rests entirely on the isolation the extension model yields.

**It cuts production time by letting proven work be added, not rebuilt.** The five additive shapes are
each a way to *reuse* rather than *recreate*. A workflow that took a month to refine, a prompt tuned
across a hundred campaigns, a benchmark an agency trusts — the extension model is how those become
installable units that drop into the platform beside the core, ready to run, instead of being rebuilt
from scratch in every workspace. The registration *shape* that already exists (🔶
`packages/ai-manager/src/model-registry.ts:57`) hints at the saving: adding a unit is a data
operation, not an engineering project. When the extension-point framework this document specifies is
built, that saving generalises — the time an agency spends re-deriving what someone already proved
collapses to the time it takes to install it. Reuse at the seam is production time not spent.

The synthesis is the same one the invariant sentence carries: an ecosystem that extends the core
without rewriting it is an ecosystem that can grow without limit while the core stays exactly one
trusted thing. Confine extension to declared, declarative seams, and you get an isolation you never
have to police — and an extensibility an agency can safely build a business on.

> **The ecosystem extends the core; it never rewrites the core.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
