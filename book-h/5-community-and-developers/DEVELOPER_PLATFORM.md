# The Developer Platform

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

This document defines the **developer surface** of the ecosystem: the place where the people who
*build* packages meet the platform they build against. Everything else in Book H describes what a
package *is* (H002), what it may *contain* (H003–H004), how it earns *trust* (H005), how it *extends*
the core (H006), and where it is *distributed* (H007–H008). This document is about the other side of
all of that — the developer who authors a package, and the community that grows around the developers.
A package does not appear from nowhere. Someone writes it. This document is about what that someone
needs, what the platform owes them, and — honestly — how little of that platform exists as code today.

A developer surface, fully built, would provide three things: **defined extension points** (the exact,
named seams a package is allowed to attach to), a **package SDK** (a toolkit a developer builds
against, so authoring a package is a supported act and not a reverse-engineering exercise), and a
**contract** (a stable, published promise about what the platform will accept and how it will treat
what a developer ships). None of those three exists as a shipped, wired feature today. What exists is a
*shape* — a small family of `register()` mechanisms deep inside the AI Manager that show, in real code,
what registering an extension would look like. They are the seed of a developer surface, not the
surface itself. This document draws that line precisely and refuses to blur it.

The one sentence that governs every line below, the boundary a developer platform exists to enforce
rather than escape:

> **The ecosystem extends the core; it never rewrites the core.**

A developer platform is the most dangerous surface in the ecosystem, because it is the one that hands
outsiders a keyboard. Everything in this document — every law, every constraint, every deliberately
narrow extension point — exists so that handing a developer that keyboard never lets them reach the
core and change it. The developer builds *around* the frozen A–G core, against defined seams, shipping
additive content. The moment a developer surface let a package rewrite the Pipeline, the Memory, the
Analytics, or the Evidence, it would stop being a developer platform and start being a way to fork the
product one install at a time. This document is about building the first, never the second.

---

## 2. Who builds packages, and what they need

The ecosystem's content — prompt packages, model packages, workflow packages, templates, playbooks,
benchmarks — is authored by **developers**. Some are internal to the agency running AdOS; some are
partners (H007); over time, some are an open **community** of contributors who neither work for the
agency nor for the platform vendor, but who publish content others install. The layer flow of Book H
ends with these people for a reason: *Core → Packages → Templates → Partners → Marketplace → Community
→ Developers.* Developers are the outermost ring, the furthest from the frozen center, and the ones
who most need a disciplined boundary between what they may touch and what they may not.

A developer building a package needs answers to three questions, and a real developer platform is
exactly the set of answers:

- **"Where am I allowed to plug in?"** — the **extension points**. Not "anywhere in the code," but a
  named, finite, documented set of seams. A developer should never have to guess which internal
  function is safe to attach to; the platform should tell them, and refuse everything else.
- **"What do I build with?"** — the **package SDK**. The types, the manifest schema, the validation
  harness, the local test fixtures — the toolkit that turns "author a package" from an act of
  reverse-engineering into a supported workflow with a happy path.
- **"What will the platform promise me in return?"** — the **contract**. A stable, versioned
  guarantee: *these* extension points exist, *this* manifest is required, *these* compatibility rules
  hold, and a package that satisfies them will keep working across core versions that honour the
  contract. Without a contract, every core update is a coin-flip for every package.

Hold those three needs in mind through the rest of this document, because the honest status of the
platform is best stated as a scorecard against them: the *shape* of an extension point exists in real
code (🔶); a package SDK does not (❌); a published extension-point contract does not (❌); and the
community layer that would sit on top of all three does not (❌).

---

## 3. The `register()` mechanisms — the seed of a developer surface (🔶 BUILT, UNWIRED)

The strongest real thing this document can point at is a family of `register()` methods inside the AI
Manager. They are not a developer platform. But they are the clearest existing evidence of what a
developer platform's core act — *registering an extension with the running system* — would look like in
this codebase, written as real, tested code rather than as prose. They show a genuine **registration
shape**.

The AI model registry is the anchor. The locally-installed model inventory is expressed as **data, not
hardcoded logic** — `INSTALLED_MODELS` (`packages/ai-manager/src/model-registry.ts:10`) is a seed
array of twelve local model descriptors, each declaring its engine, capabilities, VRAM, context window,
and priority. The registry that holds them, `InMemoryModelRegistry`, exposes a runtime
`register(model)` method (`packages/ai-manager/src/model-registry.ts:57`) that takes a single model
descriptor and inserts it into the live map. Read that method as a miniature of the whole ecosystem
idea: a new capability arrives from outside as *data conforming to a known type*, and a single defined
call adds it to the running system without touching any of the logic around it. "Add a model" is not a
code change; it is a `register()` call against a typed descriptor. That is exactly the motion a package
install would make.

The pattern is not a one-off. Two sibling registries in the same package repeat the identical shape:

- **The capability registry.** `InMemoryCapabilityRegistry` exposes `register(def)`
  (`packages/ai-manager/src/capability-registry.ts:37`), which inserts a `CapabilityDefinition` into
  the live capability map. A capability is invoked by id, never by naming a model — so registering a
  new capability adds a new named unit of work the system can perform, again as typed data through a
  single defined method.
- **The tool registry.** `InMemoryToolRegistry` exposes `register(tool)`
  (`packages/ai-manager/src/tool-registry.ts:26`), inserting a `ToolDefinition` — an
  engine-independent function — into the live tool map, so a registered tool becomes invocable without
  the registry knowing anything about the tool's internals in advance.

Three registries, three `register()` methods, one shape: *a typed unit of extension is added to a
running collection through a single, named, defined call.* This is the seed. It is what makes the
developer-platform idea concrete rather than aspirational — the codebase already contains, in real
tested code, the exact gesture that installing a package would need to make.

But it is a **seed, not a surface**, and the honesty of the tier tag is the whole point. These
`register()` methods are **🔶 BUILT (UNWIRED)**: the code exists and is exercised inside the package,
but *no live application path reaches them to register anything at runtime.* The live web app does not
call `register()` to add a model — it selects a model by reading an environment variable, bypassing the
registry's runtime extension path entirely. So `register()` is a mechanism the app owns but does not
use as an extension point. It demonstrates the shape of registration; it does not yet function as a
seam a developer can build against. A developer today cannot ship a package that calls these methods,
because nothing wires an outside package into the composition that constructs these registries.

Three things separate this seed from a developer surface, and all three are net-new work:

- **The `register()` methods are internal, not exposed.** They are constructor-seeded and
  runtime-callable *within* the AI Manager package. There is no path by which an installed, external
  package presents itself and gets registered. The gesture exists; the doorway that lets an outsider
  make the gesture does not.
- **There is no manifest, no validation, no trust at the boundary.** `register()` takes a typed
  descriptor and trusts it completely — it inserts whatever it is handed. That is safe for a seed
  array authored inside the repo. It is not safe for content authored by an unknown community
  developer, which is precisely why Law 3's trust boundary (H005) must sit *in front of* any real
  registration path before an outsider is allowed to call it.
- **There is no contract that promises these seams will persist.** `register()` is an implementation
  detail of an in-memory adapter explicitly described as swappable for a database-backed one. A
  developer platform needs a *contract* that outlives the adapter; today there is only the adapter.

So the accurate sentence is: **the registration shape is real and 🔶; the developer surface built on
top of it is ❌.** The seed shows the platform is buildable. It does not show the platform is built.

---

## 4. Where a package could attach today — the composition root

If a developer platform's job is to define *where* a package plugs in, the honest place to look is the
composition root: the single point where the running application is assembled. In AdOS that is the
application constructor, and what it accepts tells you exactly how much of an extension point exists.

The application is constructed from only three inputs — the event bus, the AI manager, and the
repositories (`apps/web/src/app.ts:69-72`). There is **no plugin array, no `register(...)` hook, no
extension-point parameter** in that signature. A package, however well-formed, has nowhere in this
constructor to introduce itself. The composition root assembles a fixed core and hands back a running
app; it does not assemble a core *plus whatever packages are installed.* That absence is the honest
measure of the developer platform: the front door where packages would enter has not been cut.

The one seam that does exist is weak and was not built to be an extension point. The application
subscribes to the wildcard event topic — `subscribe('>')` (`apps/web/src/app.ts:120`) — which means
every event on the bus flows through a single handler. In principle an ecosystem package could observe
the system by listening on that same bus. But *observing* events is a world away from *extending* the
core: a wildcard subscriber can watch what happens; it cannot add a capability, register a model,
contribute a workflow, or install a template. Using the event bus as the attach point would give a
package a read-only window onto activity, not a defined seat at the table. A first-class extension
point — one a package attaches to in order to *add* behaviour, under trust, without touching core
logic — is **❌ net-new work**. The composition root does not have one, and the event bus is not a
substitute for one.

This is why the developer platform's real subject is not "which existing hook do we document" but "the
extension model that must be built." The extension model itself — what a defined extension point is,
what it may add, and why that yields core isolation — is owned by
[`../3-trust-and-isolation/CORE_EXTENSION_MODEL.md`](../3-trust-and-isolation/CORE_EXTENSION_MODEL.md).
This document depends on that one: a developer surface is only as safe as the extension model beneath
it, and today that model is a specification, not a seam.

---

## 5. The package SDK — a supported way to build (❌ ROADMAP)

A **package SDK** is the toolkit a developer builds against so that authoring a package is a supported
workflow with a happy path, rather than an exercise in inferring undocumented internals. It is what
turns "the `register()` shape exists somewhere in the AI Manager" into "here is the typed manifest, the
validation harness, the local fixtures, and the command that scaffolds a new package." No such SDK
exists. It is **❌ ROADMAP**, and this document carries no code citation for it, because there is no
code to cite.

Naming what an SDK would provide is still worth doing, because it fixes the shape of the missing thing:

- **Typed extension interfaces.** A published set of types a package implements — the descriptor for a
  model package, the definition for a capability, the shape of a workflow package — so a developer
  codes against a stable surface rather than copying an internal adapter's private types. The seed
  shapes of §3 (`ModelDescriptor`, `CapabilityDefinition`, `ToolDefinition`) hint at what these
  interfaces would formalise, but a hint inside a package is not a published SDK.
- **A manifest builder and validator.** A toolkit that produces the seven-field manifest Law 3
  requires — Publisher · Version · Signature · Compatibility · License · Hash · Validation Status —
  and validates a package against it *before* the developer ships. Today there is no manifest, no
  builder, and no validator; the nearest primitive anywhere in the codebase is a backup-integrity
  sha256 hash, which is backup infrastructure, not content signing, and cannot stand in for one.
- **A local test harness.** Fixtures and a runner that let a developer prove a package behaves —
  installs cleanly, removes cleanly (Law 2), and adds only what it claims — on their own machine,
  offline, before it ever reaches a marketplace. This is the practical face of Law 6: an SDK's test
  harness is how a developer makes a package's *claims* match its *behaviour* before documenting them.

Without an SDK, package authoring is undefined. There is no supported path, which is the same as saying
there is no developer platform yet — only the raw material one could be built from.

---

## 6. The published extension-point contract (❌ ROADMAP)

Even with an SDK, a developer platform is incomplete without a **contract**: a stable, versioned,
public promise about which extension points exist and what the platform guarantees about them. The
contract is what lets a developer invest in a package and trust that it will not be silently broken by
the next core release. It is **❌ ROADMAP** — no such published contract exists.

The distinction between the §3 seed and a contract is the distinction between an *implementation detail*
and a *promise*. The `register()` methods live inside an in-memory adapter that is explicitly described
as swappable for a database-backed one; they are how *this* adapter happens to work, not a guarantee
that registration will always be available or always look this way. A contract inverts that: it says
"these seams exist and will keep existing for every core version that honours contract vN," and it
makes the *core* responsible for preserving them rather than leaving them at the mercy of an adapter
swap. A published contract would specify, at minimum: the exact list of extension points; the manifest
and compatibility rules a package must satisfy to use them; the versioning policy that says when the
contract may change and how; and the guarantee that a conforming package keeps working across
compatible core versions.

Until that contract is published, a developer has nothing durable to build against — only internal
shapes that the platform is free to change without notice. That is not a platform a serious developer
can commit to, which is exactly why the contract is a required piece of the surface, not an optional
polish on top of it.

---

## 7. The community layer (❌ ROADMAP)

Above the developers sits the **community** — the social layer that makes a developer surface into a
developer *ecosystem*: ratings, reviews, contributions, and reputation. It is the final ring of the
Book H layer flow, and it is entirely **❌ ROADMAP**. No ratings, no reviews, no contribution model, no
reputation system exists in code, and this document cites none.

The community layer is worth defining even at zero implementation, because it is what compounds a
developer platform into something self-sustaining:

- **Ratings and reviews** let installers signal which packages are worth trusting, turning a flat
  catalogue into a ranked, community-curated one. They sit downstream of the marketplace (H008) and
  depend on the trust boundary (H005): a review is only meaningful attached to a package whose
  identity — publisher, version, hash — is verified.
- **Contributions** let the community *add* to the ecosystem's content supply, not merely consume it —
  a community developer publishing a prompt package or a benchmark that others install. This is the
  supply engine of the whole book: every contributed package is more content the platform did not have
  to author itself.
- **Reputation** binds the two together, giving publishers a durable identity that accrues trust across
  the packages they ship, so that "who built this" becomes a signal an installer can weigh.

None of it can be built before the layers beneath it — a real extension point, an SDK, a contract, a
trust boundary, a marketplace — because the community layer *curates and rewards* packages that those
lower layers must first make possible. It is honest to call it what it is: the roadmap's furthest
horizon, valuable to specify, not present to cite.

---

## 8. How a developer stays inside the laws

A developer platform is not a licence to do anything; it is a disciplined way to do a *bounded* set of
things. The six governing laws (declared in full by the
[`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md))
are the boundary, and a package author lives inside them. Four laws bear most directly on the developer,
and one — Law 6 — binds the developer's *documentation* as tightly as their code.

> **LAW 1 — Core Isolation.** No ecosystem package may modify the Core Specification. The
> responsibilities of Books A–G cannot be changed by any package — only extended.

For a developer this is the first commandment: **you never modify the core.** A package author does not
edit the Pipeline, patch the Memory, or alter the Analytics. The `register()` shape of §3 embodies this
correctly — it *adds* a model, a capability, a tool to a collection; it does not rewrite the logic that
consumes them. A developer who found themselves needing to change core behaviour to make a package work
has, by definition, left the developer platform and entered a fork. Law 1 says: build beside the core,
never inside it.

> **LAW 4 — No Hidden Execution.** No package may run hidden code inside the core. A package may use
> ONLY the defined extension points.

This is why the whole question of §4 — *where can a package attach* — is not a convenience but a safety
boundary. A developer may attach only at defined extension points, in the open. There is no back door,
no side-loaded script, no undeclared hook. The reason a first-class extension point must be built (§4)
rather than improvised out of the wildcard event bus is Law 4: a *defined* seam is auditable and
bounded; an improvised one is neither. A developer stays inside Law 4 by using only the seams the
contract publishes — and by never reaching for an internal function the contract does not name.

> **LAW 5 — Ecosystem Never Rewrites Core.** A package cannot change the Pipeline, the Memory, the
> Analytics, or the Evidence. It may only ADD: a new template, a new workflow, a new prompt, a new
> benchmark, a new playbook.

Law 5 tells the developer the *shape* of what they may ship: **additions, never rewrites.** A package's
entire value must be expressible as new content of a known kind — a prompt package, a workflow package,
a template, a benchmark, a playbook. This is the deep reason the §3 registration shape is the right
seed: registering a `ModelDescriptor` or a `CapabilityDefinition` is a pure *addition* to a collection.
A developer who can express their package as "here is a new unit of additive content, registered
through a defined seam" is inside Law 5 by construction. A developer who cannot — whose package only
works by changing how the core behaves — has nothing this platform can safely install.

> **LAW 3 — Trust Boundary.** No content is automatically trusted. Every package MUST carry:
> Publisher · Version · Signature · Compatibility · License · Hash · Validation Status.

The developer's obligation under Law 3 is to **ship a signed, validated manifest.** The platform will
not trust a package on the developer's say-so; the developer must hand over identity and integrity
metadata the platform can verify. The seven-field manifest is the developer's side of the trust bargain,
and it is precisely what the missing SDK (§5) would help them produce. Law 3 is owned in full by
[`../3-trust-and-isolation/CORE_EXTENSION_MODEL.md`](../3-trust-and-isolation/CORE_EXTENSION_MODEL.md)'s
sibling on trust; here it is the developer's entry ticket.

> **LAW 6 — Implementation Before Documentation.** No roadmap capability may be promoted to shipped
> documentation until the implementation exists and PRODUCT_TRUTH.md has been updated.

Law 6 binds the developer's *claims* to their *behaviour*. A package's documentation may describe only
what the package actually does. A package that advertises a capability its code does not perform
violates Law 6 exactly as a book chapter that claimed an unbuilt feature would. This is why a package
SDK's test harness (§5) matters as more than convenience: it is how a developer *earns* the right to
document a claim — by demonstrating the behaviour first. Reality first, then documentation. The
developer platform must enforce, at the boundary, that a package's manifest and description never run
ahead of what the package can prove it does.

Read together, the laws describe a disciplined developer: builds beside the core (1), through defined
seams only (4), shipping additions not rewrites (5), carrying a signed manifest (3), documenting only
what the code does (6). That is the whole citizenship of the ecosystem, and the developer platform
exists to make that citizenship the path of least resistance.

---

## 9. Boundaries — local, own-data-only, no vendor telemetry

A developer platform is the surface most tempted to open a channel to the outside world — to phone home
with usage, to fetch a package from a remote registry, to report what developers install. Every one of
those temptations is forbidden. The ecosystem's inherited boundaries are inviolable, and a developer
surface must *strengthen* them, never weaken them.

- **100% local, offline-first.** A package is a *local artifact*. It installs onto the local machine,
  runs on the local machine, and reaches no external service. The `register()` shape of §3 is already
  local by construction — it mutates an in-memory collection in-process, touching no network. A real
  developer platform must preserve exactly that: installing a package is a local act, and a package
  that required a live external dependency to function would violate offline-first before it violated
  anything else.
- **No vendor telemetry.** This is the sharpest line. The platform does not report to a vendor which
  packages a developer authored, which an agency installed, or how any of them are used. A developer
  surface that collected install analytics for a vendor would turn the ecosystem into a surveillance
  channel; the trust boundary (Law 3) exists so packages can be trusted *without* a vendor watching, not
  so a vendor can watch.
- **Own data only, copy-only.** A package adds content — prompts, models, workflows, templates — it
  does not pull in external data to decorate itself or exfiltrate the agency's data to enrich itself.
  What a package brings, it brings as a self-contained local artifact.
- **Human-sovereign, no hidden execution.** A package is not an autonomous agent that acts on its own.
  It adds capability a human invokes; it never runs hidden code (Law 4) or reaches back to act. The
  developer platform hands a developer a keyboard — and Law 4 is the guarantee that the keyboard is
  wired only to defined, auditable seams, never to a back door.

The one-line boundary: **a package extends one local machine's own capabilities, for that machine's own
operator, and tells no one on the outside anything.**

---

## 10. Value contribution

The developer platform maps to both value levers, and it maps to them more powerfully than any other
surface in Book H — because a developer platform does not add value once; it adds a *mechanism that
compounds* value over time.

**A developer community compounds the platform's content supply, which grows agency revenue.** Every
package in the ecosystem is content — a prompt package, a model package, a workflow, a template, a
benchmark. Content is what an agency sells the results of, and more content means more the agency can
produce, package, and charge for. If the agency had to author every prompt, workflow, and template
itself, the ecosystem's content supply would grow only as fast as one team could write it. A developer
platform breaks that ceiling: it lets *other people* author content the agency can install. The
community layer (§7) compounds this further — ratings and reputation surface the best contributions, so
the supply is not just larger but *curated*. The `register()` seed of §3 is the smallest possible
picture of this economics: "add a model" as a single typed call means the platform's capability grows
by addition, not by the agency's own labour. Scale that motion to a community of authors, and content
supply — the raw material of agency revenue — grows on a curve the agency did not have to draw alone.

**Standard, defined extension points cut integration time, which cuts production time.** Every hour a
developer spends reverse-engineering internals to figure out where and how to plug a package in is an
hour not spent building the package's actual value — and every such package is fragile, breaking on the
next core change because it attached to something it was never promised. A published extension-point
contract (§6) and a package SDK (§5) replace that guesswork with a happy path: a developer builds
against stable, named seams, validates locally, and ships. Integration stops being bespoke archaeology
and becomes a supported workflow. That is production time saved twice — once when the package is first
built against a known contract instead of unknown internals, and again on every core update the
contract carries the package safely across. A defined extension point is, in the end, an agreement that
nobody has to rediscover the boundary; and an agreement that holds is the difference between a package
that ships in a day and one that is debugged for a week.

The developer platform's honest status keeps both of these levers on the roadmap, not on the ledger:
the registration *shape* is real (🔶), but the SDK, the contract, and the community that would turn it
into compounding value are ❌. Yet the direction is exactly the one the whole book points toward — the
outermost ring of the ecosystem, where other people's work becomes the agency's supply, built against a
boundary that never lets any of that work reach in and rewrite the core.

> **The ecosystem extends the core; it never rewrites the core.**

A developer platform is that sentence made operational: it is the machinery that lets the largest
possible number of hands add to the platform while guaranteeing that not one of those hands can change
the thing at the center. Build the seams, publish the contract, ship the SDK, grow the community — and
every one of them extends outward from a core that stays exactly as A–G specified it.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
