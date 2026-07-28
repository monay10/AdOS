# The Package Model

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`ECOSYSTEM_CONSTITUTION.md`](ECOSYSTEM_CONSTITUTION.md).
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## 1. What this document defines

This document defines what a **package** is. It is the first concrete noun in the ecosystem
vocabulary: the unit that an agency can install, and just as importantly remove, without touching the
frozen core underneath. Everything else the ecosystem talks about — content packages, templates,
playbooks, models, partner catalogues, a marketplace — is a *kind of* package, distributed and
governed the same way. Define the package and you define the shape every ecosystem artifact must
take. This document owns **LAW 2 (Package Independence)** — a package installs and removes on its own,
and when it is gone the core keeps running exactly as before — and it introduces the required
**manifest** that **LAW 3 (Trust Boundary)** puts on every package: the seven fields **Publisher ·
Version · Signature · Compatibility · License · Hash · Validation Status**. The manifest is only
introduced here; the trust machinery that reads and enforces it is the subject of
[`../3-trust-and-isolation/TRUST_BOUNDARY.md`](../3-trust-and-isolation/TRUST_BOUNDARY.md).

The whole of the package model is a consequence of one sentence, stated here in full because every
rule that follows is derived from it:

> **The ecosystem extends the core; it never rewrites the core.**

A package is the physical embodiment of that sentence. It is an *additive* artifact by construction:
it can only add a new prompt, a new model, a new workflow, a new template — never edit the Pipeline,
the Memory, the Analytics, or the Evidence that Books A–G froze. That is why "installable and
removable on its own" is not merely a convenience feature but the load-bearing property of the entire
layer. If installing a package could change the core, removal could not restore it, and the core would
no longer be frozen. Independence is what keeps the core a fixed centre while value grows around it.

A note on honesty, stated once and carried through every section. The strongest tier anywhere in Book
H is **🔶 BUILT (UNWIRED)**: there is **no ✅ SHIPPED ecosystem feature** wired into the live app
today. The installable *envelope* — the manifest, the install-and-remove lifecycle, the versioning
container that turns content into a distributable package — is **❌ ROADMAP**. What already exists in
the codebase are the *packageable content units*: versioned, publishable, scorable shapes that prove
AdOS already models content the way a package model needs. Those are real, and they are cited. The
container around them is not built, and it is never cited.

---

## 2. The package as a unit — LAW 2 (Package Independence)

> **LAW 2 — Package Independence.** Every package must be installable AND removable on its own. When a
> package is removed, the core keeps running unchanged.

A package is a **unit**: a single, self-contained artifact that goes in as one thing and comes out as
one thing. It is not a patch, not a fork, not a code change threaded through the core. Two operations
define it completely, and a package is only a package if it supports both:

- **Install.** The package is added to a running AdOS instance as a discrete artifact. It brings its
  own content — a prompt, a model descriptor, a workflow definition, a template — and it attaches only
  through defined extension points, never by editing core code.
- **Remove.** The package is taken back out as the same discrete artifact. After removal, the core is
  in the state it would have been in had the package never been installed. Nothing it added lingers;
  nothing it touched is left altered.

The test of independence is the removal, not the install. Anything can *add* to a system; the
discipline is whether the system can shed the addition and be unchanged. LAW 2 makes that the
acceptance criterion for every ecosystem artifact: **remove the package and the core keeps running,
unchanged.** A package that cannot be cleanly removed is not independent, and an artifact that is not
independent is not a package — it is a modification, which LAW 1 and LAW 5 forbid outright.

Independence is what lets an agency treat the ecosystem as *optional surface area*. It can install a
benchmark package for one client and not another, trial a prompt package and back it out if the scores
disappoint, run a workflow package for a season and retire it — each decision reversible, none of them
able to destabilise the operating system underneath. The core does not depend on any package; packages
depend on the core. The arrow points one way, and removal is the proof that it does.

Independence also has to hold *between* packages, not only between a package and the core. If installing
package B could break package A, or removing A could strand B, then packages would depend on each other
and the reversibility that LAW 2 promises would be conditional — true only for the last package in, never
for the ones beneath it. The package model therefore treats each unit as independent of every other:
packages attach to the core through defined extension points, not to one another, so any one can be
removed without disturbing the rest. This is what lets an agency's installed set grow and shrink freely,
one decision at a time, instead of becoming a tangle that must be reasoned about as a whole. A set of
independent units is manageable; a web of interdependent ones is the modification problem in disguise.

### 2.1 Honest status — the install/remove lifecycle is not built (❌ ROADMAP)

The lifecycle itself — an installer, a remover, a registry of what is currently installed, the
guarantee-enforcement that a removal truly restores the prior state — is **❌ ROADMAP**. No code
performs it today. There is no install command, no package store, no uninstall path. LAW 2 is a
**design mandate** that the ecosystem commits to meeting, stated plainly here so the gap between the
mandate and the code is never blurred. What *does* exist are the content units a lifecycle would move —
units already shaped for versioning and publishing (§4). The mover is roadmap; the moved is real.

The nearest thing to an attachment seam in the running app is weak and worth naming honestly. The
composition root — the object that wires the whole application together — takes only a bus, an AI
manager, and repositories in its constructor; it exposes no plugin array and no registration hook. The
one place an ecosystem package could attach to a live instance today is the wildcard event
subscription, and subscribing to an event stream is a long way from a governed install-and-remove
lifecycle. A first-class extension point is net-new work, owned as a design subject by
[`../3-trust-and-isolation/CORE_EXTENSION_MODEL.md`](../3-trust-and-isolation/CORE_EXTENSION_MODEL.md).
Here it is enough to say: the *unit* is well-modelled; the *lifecycle that installs and removes it* is
❌.

---

## 3. The required manifest — LAW 3's seven fields

> **LAW 3 — Trust Boundary.** No content from the marketplace is automatically trusted. Every package
> MUST carry: **Publisher · Version · Signature · Compatibility · License · Hash · Validation Status.**

A package is a unit of *content*; the manifest is the unit of *identity and trust* that must travel
with it. Where §2 says a package can be installed and removed, this section says a package may not even
be *considered* for installation unless it declares who made it, what it is, and what has been verified
about it. The manifest is that declaration. It is introduced here because it is inseparable from the
definition of a package — an artifact without a manifest is not an untrusted package, it is not a
package at all — and it is examined in depth, field by field with enforcement, in
[`../3-trust-and-isolation/TRUST_BOUNDARY.md`](../3-trust-and-isolation/TRUST_BOUNDARY.md), which owns
LAW 3.

The manifest carries exactly seven required fields. Each answers one question the core must be able to
ask of any artifact before it is allowed to attach:

| Field | The question it answers | Why the package model requires it |
| --- | --- | --- |
| **Publisher** | *Who made this?* | Every package has a named, attributable origin. Anonymous content cannot be governed, certified, or held accountable. Publisher is the anchor the rest of the trust chain hangs from. |
| **Version** | *Which revision is this?* | A package is a versioned artifact. Two installs of "the same" package can differ; the version names precisely which one is present, so installs, upgrades, and rollbacks are unambiguous. |
| **Signature** | *Is this really from that publisher, unaltered?* | A cryptographic signature binds the content to the Publisher. It is what makes the Publisher field a claim that can be *checked* rather than merely asserted. |
| **Compatibility** | *Which core does this fit?* | A package is written against a specific core contract (a specific version of the AdOS Core Specification + the frozen A–G surface). Compatibility declares which core versions it may attach to, so an install can be refused before it can do harm. |
| **License** | *On what terms may this be used?* | Every package carries explicit usage terms. An agency must know what it is permitted to do with a package — and a partner ecosystem cannot exist without licensing being a first-class field. |
| **Hash** | *Is the content intact?* | A content hash lets the receiver confirm the bytes were not corrupted or tampered with in transit — integrity, independent of authorship. The hash proves *what*; the signature proves *who*. |
| **Validation Status** | *Has this passed AdOS's checks?* | The verdict of the platform's own validation and (where applicable) certification. It is the field that says whether the package has been examined against the ecosystem's rules, distinct from whoever published it. |

Read together, the seven fields separate cleanly into three jobs. **Publisher, Signature, and Hash**
establish *provenance and integrity* — who made it, that it is genuinely theirs, and that it arrived
intact. **Version and Compatibility** establish *fit* — exactly which artifact this is and which cores
it belongs on. **License and Validation Status** establish *terms and standing* — what an agency may do
with it and whether the platform has vouched for it. A package that cannot fill all seven is a package
the trust boundary will not admit.

The manifest travels *with* the package but is *about* the package — a sidecar of identity that the
core reads before it reads a single byte of content. That ordering matters. The whole point of a trust
boundary is that nothing is inspected, executed, or attached until its manifest has cleared: the core
does not open a package to decide whether to trust it, it consults the manifest to decide whether to
open it. Two of the fields are *self-checking* — the Signature can be verified against the Publisher's
key and the Hash against the content bytes, entirely on the receiving machine, with no external call —
which is what keeps the trust boundary compatible with the platform's offline, no-telemetry stance.
Trust is established locally, from the artifact and its manifest alone, or it is not established at all.

Two fields deserve emphasis because they are what make a package model *safe over time* rather than
merely at the moment of install. **Compatibility** is the field that keeps a frozen core frozen: a
package declares the core contract it was written against, and a core that has moved on can refuse a
package that would not fit — an install prevented is a rewrite prevented. **Validation Status** is the
field that separates "published" from "vouched for": a Publisher can publish anything, but only the
platform's own checks can set Validation Status, so the field records the *ecosystem's* verdict rather
than the *author's* claim. Together they are why the manifest is not bureaucratic overhead but the
minimum an additive-only, human-sovereign ecosystem needs to admit content without lowering its guard.

The invariant governs the manifest too. The manifest exists precisely so that adding a package can
never quietly become rewriting the core: it is the gate at which an *additive* artifact proves it is
additive, attributable, and intact before the core will let it attach. **The ecosystem extends the
core; it never rewrites the core** — and the manifest is how the core stays sure of that with every
package it admits.

### 3.1 Honest status — the manifest and its enforcement are not built (❌ ROADMAP)

There is no manifest type in the codebase, no signing, no hash-validation of ecosystem content, no
licence field, no validation-status pipeline. All of it is **❌ ROADMAP** — introduced here as the
required shape, built nowhere. It would be dishonest to imply otherwise, so no field above carries a
code citation.

One adjacent primitive deserves a precise, non-inflating mention. AdOS already computes SHA-256 hashes
— but for *backup integrity*, verifying that a restored archive matches what was backed up. That is not
ecosystem content trust: it hashes the platform's own backups, not third-party packages, and it does no
signing, licensing, or validation. It is named here only to be clear about the boundary: AdOS has a
hashing primitive in one internal context; the manifest's **Hash** and **Signature** fields for
ecosystem packages are a separate, unbuilt capability. The nearest primitive is not the feature.

---

## 4. Grounding the packageable unit — the real shapes (🔶 BUILT, UNWIRED)

The envelope is roadmap, but the *content that would go inside it* is not hypothetical. AdOS already
models several kinds of content the exact way a package model needs them modelled: as **versioned,
publishable, independently-addressable units**. These are the anchors that make the package model
credible rather than aspirational — they prove the platform's contracts already think in the nouns the
ecosystem will distribute. Every one of them is **🔶 BUILT (UNWIRED)**: the shape exists in code, but
no live path in the running web app reaches it. The unit is real; the wiring is not.

Three properties recur across all three anchors, and it is their recurrence — the same discipline
appearing independently in the prompt contract, the model registry, and the SOP contract — that makes
the package model a description of how AdOS already thinks rather than a shape imposed on it from
outside:

| Anchor | Package concept it models | Versioned? | Publishable / registerable? | Comparable / scored? |
| --- | --- | --- | --- | --- |
| `PromptTemplate` (`prompt.ts:9`) | Prompt package | `version` (`prompt.ts:9`) | `publish()` (`prompt.ts:25`) | `score?` (`prompt.ts:14`) |
| `INSTALLED_MODELS` + registry (`model-registry.ts:10`) | AI model package | descriptor list, data-driven | `register()` (`model-registry.ts:57`) | `priority` ordering |
| `Sop` (`sop.ts:24`) | Workflow package / playbook | `version` (`sop.ts:26`) | `publish()` (`SopEnginePort`) | `successMetrics` |

The shared verbs are the tell. *Version*, *publish*, and *register* are the exact operations a package
lifecycle needs, and they are already the vocabulary of these contracts. The package model does not
introduce a new way of thinking about content; it names the way three separate bounded contexts already
model it and generalises it into one unit.

### 4.1 The versioned, scored PromptTemplate (🔶)

The clearest packageable unit already in the codebase is the **`PromptTemplate`**
(`packages/contracts/src/ai/prompt.ts:9`). It carries exactly the fields a distributable content unit
needs: a stable `key`, a numeric `version`, the `content` itself, and an `active` flag — a versioned,
addressable artifact by construction. It also carries a `score?` field (`prompt.ts:14`), an A/B
performance score (0..100) accumulated over time, so a prompt is not merely versioned but *comparable
across versions* — "creative.image v14 → score 91" against "v27". And the registry contract exposes a
`publish()` method (`prompt.ts:25`) that takes a template and makes it available. Versioned, scored,
publishable: that is the anatomy of a content package, already expressed as a contract. A "prompt
package" in the ecosystem is this shape, wrapped in the manifest of §3.

The contract even states the principle the package model depends on: prompts are *never hardcoded in
business logic* — agents reference them by key (`prompt.ts:6`). That is exactly the indirection a
package model requires: content addressed by key and version, swappable underneath, rather than baked
into code.

### 4.2 The data-driven model inventory with runtime register() (🔶)

The second anchor is the **model registry**, the shape behind an "AI models" package. The installed
inventory is expressed as *data*, not logic: `INSTALLED_MODELS`
(`packages/ai-manager/src/model-registry.ts:10`) is a plain list of model descriptors — twelve local
models, each declaring its engine, capabilities, and priority. Adding a model is editing data, not
writing code. More tellingly, the registry exposes a runtime `register(model)` method
(`model-registry.ts:57`) that inserts a new descriptor into a live registry. That is the essential
*extension mechanism* a package model needs: a defined call that adds a unit of content to a running
system without altering the system's logic. "Install a model package" is, at the shape level, a
`register()` of a descriptor. The registry even sketches a `detectInstalled()` step
(`model-registry.ts:77`) — today a stub returning the current inventory — as the seam where a
production adapter would reconcile what is actually present. The mechanism to add a unit at runtime is
real code; the packaging around it is not.

### 4.3 The versioned Sop — a declarative workflow unit (🔶)

The third anchor is the **`Sop`** (Standard Operating Procedure) shape
(`domains/corporate-os/src/sop.ts:24`), the model behind "workflow packages" and "playbooks". An `Sop`
is a keyed, `version`ed (`sop.ts:26`) definition: a title, a department, and an ordered list of
`steps`, each step naming its owner, its gate, its dependencies, and its measurable output. Crucially it
is *declarative* — a definition of a procedure, data describing what should happen, not executable code
that does it. That is precisely what makes a workflow *packageable safely*: a versioned data definition
can be distributed and installed without ever running hidden code inside the core (the deeper tie to
LAW 4 No Hidden Execution is developed in
[`../2-packages-and-templates/TEMPLATES_AND_PLAYBOOKS.md`](../2-packages-and-templates/TEMPLATES_AND_PLAYBOOKS.md)).
The `SopEnginePort` contract even exposes a `publish()` method — the same publish verb as the prompt
registry — for making an SOP version available. These are **ports and types only**; there is no engine
behind them and nothing is wired. A versioned, publishable, declarative unit: the third proof that
AdOS already models content the way a package model requires.

### 4.4 Why these are 🔶 and not ✅ — the live path bypasses the registries

It would be easy to over-read the anchors as shipped features. They are not, and the reason is precise:
**the live web app does not consult these registries.** Two facts pin this down.

- **The prompt registry is bypassed.** In the running app, the offline AI manager selects its behaviour
  by switching on hardcoded `promptRef.key` strings (`apps/web/src/ai.ts:38-50`) — `'marketing.brief'`,
  `'creative.set'`, `'campaign.draft'`, and so on — a fixed `if`/`else` ladder. It never asks the
  `PromptRegistryPort` for a versioned, scored template. The registry's versioning and A/B scoring exist
  in the contract; the live path routes around them.
- **The model is chosen by environment variable.** The running app picks its model from an env variable
  (`apps/web/src/ai-factory.ts:31`, `AI_MODEL`), not from the registry's capability-based selection. The
  `register()` mechanism and the twelve-model inventory are real code; the live path does not read them
  to decide anything.

So the anchors are genuinely built — the types, the registries, the register/publish/score methods all
compile and are exercised inside their packages and tests — but they are **unwired**: no user action in
the shipped app flows through them. That is the definition of 🔶, and it is why this document claims the
package model is *grounded* in real shapes without ever claiming it is *shipped*. The shapes prove the
concept; the wiring that would make them live is future work, and the envelope that would make them
packages is ❌.

### 4.5 From unit to package — what exists and what is missing

It is worth stating the gap in one place, precisely, so the boundary between 🔶 and ❌ is never
ambiguous. A *unit* — a versioned, publishable, addressable piece of content — exists (§4.1–§4.3). A
*package* — that unit wrapped in a manifest, moved by an install-and-remove lifecycle, and admitted
through a governed extension point — does not. Everything below the line is real code; everything above
it is roadmap:

- **Built (🔶):** the versioned/scored prompt template; the data-driven model inventory and its runtime
  `register()`; the versioned declarative SOP; the `publish()`/`register()`/`score()` verbs on their
  respective contracts. Content shaped for packaging.
- **Not built (❌):** the manifest type and its seven fields; signing, hashing, licensing, and validation
  of ecosystem content; the installer and remover; the record of what is installed; the guarantee that a
  removal restores the prior state; a first-class extension point to attach through. The container and
  the lifecycle.

The distance between the two lists is exactly the work Book H specifies and Series 2 will build. Naming
it plainly is the point of this document: the package model is credible *because* the units already
exist, and honest *because* the envelope does not. Neither half is overstated. The content is real; the
package around it is a design commitment, not a shipped feature.

---

## 5. The law this document owns — Package Independence

This document owns **LAW 2 (Package Independence)** and introduces the manifest that **LAW 3 (Trust
Boundary)** requires. The two laws meet in the definition of a package:

- **LAW 2** fixes the *shape of the lifecycle*: a package is a unit that installs on its own and removes
  on its own, and when it is removed the core keeps running unchanged. Independence — reversibility — is
  the acceptance test. Status: the content units are 🔶 (§4); the install/remove lifecycle is ❌ (§2.1).
- **LAW 3** fixes the *shape of trust*: no package is admitted without a manifest carrying Publisher ·
  Version · Signature · Compatibility · License · Hash · Validation Status. Introduced here (§3); owned
  and enforced in [`../3-trust-and-isolation/TRUST_BOUNDARY.md`](../3-trust-and-isolation/TRUST_BOUNDARY.md).
  Status: ❌ — no manifest, signing, or validation exists.

Both laws are consequences of the same parent rule. **LAW 1 (Core Isolation)** and **LAW 5 (Ecosystem
Never Rewrites Core)** say the core is fixed and additive-only; independence is *how* a package stays
additive (it can be removed to nothing) and the manifest is *how* the core stays sure a package is
additive before admitting it (attributable, intact, compatible, validated). A package that could not be
removed would violate LAW 1 the moment it was installed; a package admitted without a manifest would put
LAW 3's trust boundary on trust. The package model exists so that the invariant holds mechanically:
**the ecosystem extends the core; it never rewrites the core.**

---

## 6. Boundaries — local, sovereign, additive-only

The package model inherits the platform's boundaries, and on the ecosystem path they are not incidental
— they are exactly what "install a package" must never weaken:

- **100% local, offline-first.** A package is a **local artifact**. Installing one adds content to the
  agency's own machine; it does not open a connection, phone home, or fetch at runtime. The ecosystem
  grows the local system; it does not turn it into a networked one.
- **No vendor telemetry.** A package neither carries telemetry in nor sends usage out. The manifest's
  Publisher and Signature fields exist to *attribute* a package, not to instrument the agency that runs
  it. Adding packages must leave the "no vendor telemetry" guarantee exactly as strong as it was.
- **Core isolation — additive only.** A package may add a new prompt, model, workflow, template,
  benchmark, or playbook, and nothing else. It may not modify the Pipeline, the Memory, the Analytics,
  or the Evidence. This is why "no hidden execution" and "trust boundary" are foundational rather than
  optional: they are the mechanisms that keep an installable package from ever becoming an edit to the
  core. Removability (§2) is the final backstop — if a package can always be removed to nothing, it can
  never have rewritten the thing it attached to.
- **Human-sovereign.** Installing and removing a package is a human decision, deliberately taken. The
  package model gives the operator reversible, attributable control over their own instance; it is not a
  channel through which the platform changes itself.

The one-line boundary: **a package is a local, attributable, additive artifact that a human installs and
can always remove — leaving the core exactly as it was.**

---

## 7. Value contribution

The package model maps to both value levers, and it does so structurally: by making capability into an
inventory an agency can add to and subtract from at will, rather than a fixed set it is stuck with.

**It grows agency revenue by turning the platform into an extensible asset.** An operating system whose
capabilities can only ship from one source grows at one source's pace. A package model lets an agency —
or a partner, or a specialist — extend the system with a new prompt pack tuned to a vertical, a
benchmark package for a client's category, a workflow package encoding a winning process. Each is a new
capability the agency can put to work, and in a partner ecosystem each is a thing that can be published,
licensed, and sold. The manifest's **License** and **Publisher** fields are revenue infrastructure: they
are what let content be distributed on terms, attributed to a maker, and paid for. The package is the
unit of that economy.

**It cuts production time by making capability reusable and reversible.** Without a package model, a
good prompt, a proven workflow, or a well-tuned model lives trapped inside the one instance where it was
built — re-created by hand for the next client, the next campaign, the next agency. Packaging turns that
work into a unit that installs once and runs everywhere it is wanted, and removes cleanly when it is not.
The versioned, scored `PromptTemplate` (`prompt.ts:9`), the data-driven model inventory with runtime
`register()` (`model-registry.ts:57`), and the versioned declarative `Sop` (`sop.ts:24`) already show
the shape: content built once, versioned, and reused — not rebuilt each time. Reuse is time returned;
reversibility is risk removed, because a package that disappoints can be backed out without a trace. The
package model is how an agency's best work stops being re-done and starts being re-installed.

> **The ecosystem extends the core; it never rewrites the core.**

That sentence is the value proposition compressed. A package is capability an agency can *add* to a fixed,
trustworthy centre and *remove* without residue. The centre stays frozen and dependable; the surface
around it grows with every unit installed. That is what an operating system with an ecosystem is worth
that one without an ecosystem is not — and the package is the unit that makes the difference real.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
