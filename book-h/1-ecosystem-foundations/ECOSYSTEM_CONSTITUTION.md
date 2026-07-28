# Ecosystem Constitution

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. **This is the
> governing document of Book H** — every other Book H artifact is subordinate to the laws,
> boundaries, and truth model declared here.
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## 0. Preamble — what this document governs

This is the constitution of **Book H — Ecosystem Platform**. It is the highest authority in the
book. Where any other Book H document appears to conflict with the text below, this document
controls, and the other document is to be corrected, not this one. The ten content documents of
Book H — the package model, content packages, templates and playbooks, the trust boundary, the
core-extension model, partners and certification, the marketplace, the developer platform, and the
closing ecosystem-platform doc — all derive their authority from the six laws declared here.

Books A through G built, ran, and then *observed* the core operating system. Book A gave the agency
**workflow**. Book B gave AI **production**. Book C gave **explainability**. Book D gave
**performance memory** — the evidence layer. Book E gave **creative judgement**. Book F gave
**orchestration** — the managed, deterministic, human-gated process that runs the other five as one
system. Book G gave **observability** — the read-only lens that reports what the core did without
ever changing it. Together, Books A through G are the **AdOS Core Operating System, v1.0 —
frozen.** They decide, they learn, they optimize, they act on the agency's behalf under a human
gate, and they report themselves faithfully.

Book H is the **final book**. It does none of the core's work and it changes none of the core's
work. Book H is the **Ecosystem Layer** that grows value *around* the frozen A–G core: packages,
templates, prompt libraries, brand and creative kits, playbooks, benchmark sets, AI models,
workflow definitions, report templates, training content, and certified partner content — the whole
economy of reusable, installable, shareable material an agency and its partners can build on top of
a stable center. It is emphatically **not "a marketplace."** A marketplace is one small subset of
the ecosystem — the distribution surface — and it is only one of ten documents here. The ecosystem
is the larger thing: everything that can be packaged, trusted, installed, removed, extended, and
shared without ever touching the core that makes it all trustworthy.

The value of the ecosystem grows in one direction, outward from a fixed center:

**Core → Packages → Templates → Partners → Marketplace → Community → Developers.**

That direction is the spine of the entire book, and it is stated as an invariant that every Book H
document repeats verbatim:

> **The ecosystem extends the core; it never rewrites the core.**

Read that sentence as the first principle from which every law below is derived. If a proposed
ecosystem behaviour would require Book H to *change* the Pipeline, the Memory, the Analytics, the
Evidence, or the responsibilities of any core book — to *rewrite* what A through G specify rather
than *add alongside* them — that behaviour is unconstitutional. Book H may *consume* the core's
contracts, *observe* the records the core produces, and *extend* the core through defined seams; it
may never *alter* the core's contracts. An ecosystem that could silently rewrite the core it
attaches to would not be an ecosystem at all; it would be a second, ungoverned core, and it would
collapse the trust the seven core books were built to earn.

---

## 1. The central principle — extend the core, never rewrite it

Book H adds **no new core authority and no new core intelligence** to AdOS. This is the sibling of
Book G's "no new decisions, only observation," Book F's "no new intelligence," and Book E's "no new
data": where Book G promised to *observe* the system without altering it, Book H promises to *grow
around* the system without altering it. The core is finished. Book H does not finish it again; it
builds on it.

Concretely, Book H:

- **Adds material, never authority.** A package may add a new template, a new prompt, a new
  workflow definition, a new benchmark, a new playbook, or a new local model entry. It may never
  add a new way to decide a campaign's fate, score a creative, gather evidence, advance a mission,
  or rewrite what the core already decided. The ecosystem is additive by construction.
- **Consumes and extends contracts; it never mutates them.** The responsibilities of Books A, B,
  C, D, E, F, and G are fixed. Book H reads them, plugs into their defined extension points, and
  leaves them exactly as specified. It holds no power to change a single contract of the frozen
  core.
- **Is removable without consequence.** If you uninstall every package Book H ever describes, the
  core still runs, still decides, still learns, still reports — unchanged. What disappears is the
  *added* material, never any core capability. An ecosystem whose removal broke the core would have
  been rewriting the core all along, in disguise.

Because Book H creates no core authority, it also carries no power to change what the core is. It
consumes the core's outputs, extends the core through defined seams, and packages reusable material
around it. That restraint is what makes the ecosystem trustworthy: an ecosystem layer that could
silently replace the Pipeline, edit the Memory, or bypass the human gate would be an agency's worst
nightmare — an "add-on" that changes the thing it attaches to. Book H is forbidden from being that
layer.

---

## 2. The layer flow and the final architecture

Book H completes AdOS by adding exactly one outward-growing layer on top of the frozen core, and
the value in that layer grows in **one direction only**:

```
Core → Packages → Templates → Partners → Marketplace → Community → Developers
```

Each stage builds on the stage before it and never reaches back to rewrite the center it grows from:

| Stage | Owns | Book H's role |
|-------|------|---------------|
| **Core** | the frozen A–G operating system | consumed and extended only — never authored here |
| **Packages** | installable/removable units of reusable material | define the unit; add, never mutate the core |
| **Templates** | reusable briefs, campaigns, reports, creatives, playbooks | package definitions, not executable code |
| **Partners** | publishers and certified content providers | participate under the trust boundary |
| **Marketplace** | catalog, listing, discovery, distribution | one subset — distribute what already satisfies trust |
| **Community** | ratings, reviews, contributions | grow shared knowledge around the packages |
| **Developers** | builders of new packages and extensions | build to defined extension points, never hidden code |

The rule is directional and absolute: **the core enables packages; packages enable templates;
templates, partners, and the marketplace enable distribution; distribution and community enable
developers — and never the reverse.** No stage downstream of the core may reach back and rewrite
the core. The marketplace may not change the Pipeline; a package may not edit the Memory; a partner
may not bypass the human gate. This one-way growth is what makes the ecosystem safe: every added
artifact can be traced back to a package that satisfied the trust boundary and used only defined
extension points, and nothing in the outer layers can contaminate the frozen center.

This is the final architecture that Book H completes:

```
AdOS
├── Core Operating System        (frozen — AdOS Core Specification v1.0 + G)
│   ├── A Workflow   ├── B Production   ├── C Explainability   ├── D Performance Memory
│   ├── E Creative Judgement   ├── F Orchestration   └── G Observability
└── Ecosystem Platform           (this book — builds around, never changes the core)
    ├── Packages   ├── Templates   ├── Partners   ├── Marketplace   ├── Community   └── Developers
```

The top half is done, frozen, and specified elsewhere. The bottom half is what Book H specifies —
as a design and architecture, honestly tiered, built on the few real anchors that exist today and
the roadmap that does not yet.

---

## 3. The three-tier truth model

Book H uses the same truth model as Books B, C, D, E, F, and G. Every capability named anywhere in
this book carries exactly one tier tag, and nothing unbuilt is ever presented as shipped:

- **✅ SHIPPED** — runs in the live web app today; cited with a wired `path:line`.
- **🔶 BUILT (UNWIRED)** — code and tests exist, but no live path reaches it; cited with a
  `path:line` that resolves only inside tests or package internals.
- **❌ ROADMAP** — a contract or an intention with no implementation; no code citation is
  permitted, and none is given.

The tier tags are not decoration. They are the mechanism that keeps this book honest about the gap
between the *design* of a full ecosystem platform and the *current state* of the codebase. Book H
is unusual among the books in the direction of that gap: where Book G had a strong ✅
Business-Analytics baseline, Book H has **no ✅ ecosystem feature at all.** Its strongest tier is
🔶 — a handful of registries and declarative shapes that model what a "package" could be, but that
no live path installs, removes, trusts, or distributes. The truth model is how this book says both
facts out loud at once: the ecosystem it designs is coherent and grounded in real shapes, and the
ecosystem it ships is nothing yet — named, not disguised.

---

## 4. The honest headline — no shipped ecosystem feature exists

The defining fact of Book H, from which every law inherits its honesty, is this: **no ✅ ecosystem
feature is wired into the live app today.** Book H is, almost in its entirety, a design and
architecture specification. It is built on a small set of 🔶 BUILT (UNWIRED) anchors that model
what packages could become, and a large body of ❌ ROADMAP that has no implementation. This section
states that plainly, so that no reader mistakes a versioned registry for a shipped marketplace.

### 4.1 The strongest anchors are 🔶 BUILT (UNWIRED)

Three real, tested shapes are the closest thing AdOS has to "the ecosystem." None of them is on a
live path; each models a piece of the package idea:

- **The prompt registry** — the model for "prompt packages" and for versioned, publishable content
  units. The `PromptRegistryPort` contract
  (`packages/contracts/src/ai/prompt.ts:21`) defines a versioned `PromptTemplate` with an optional
  `score?` (`prompt.ts:9`, `:14`), a `publish()` operation (`prompt.ts:25`), a `score()` operation
  (`prompt.ts:27`), and a DI symbol `PROMPT_REGISTRY` (`prompt.ts:30`), under the header "Prompts
  are NEVER hardcoded" (`prompt.ts:6`). The adapter `InMemoryPromptRegistry`
  (`domains/prompt-registry/src/in-memory-prompt-registry.ts:18`) implements A/B `selectActive`
  (`:52`), `{{var}}` `interpolate` (`:57`), and an EMA `score` update (`:66-73`). This is a real,
  versioned, publishable, scorable content unit — exactly the shape a "prompt package" needs — and
  it is **unwired**: the live `OfflineAIManager` switches on hardcoded `request.promptRef?.key`
  strings (`apps/web/src/ai.ts:38-50`), so the live path never consults the registry. 🔶
- **The AI model registry** — the model for "AI models" packages and for the `register()` extension
  mechanism. `INSTALLED_MODELS` seeds twelve local models as pure data
  (`packages/ai-manager/src/model-registry.ts:10`); `InMemoryModelRegistry` (`model-registry.ts:50`)
  exposes a runtime `register(model)` (`model-registry.ts:57`) and a `detectInstalled()` stub
  (`model-registry.ts:77`). "Add a model" is real, data-driven code. It is **unwired**: apps/web
  picks a model via the `AI_MODEL` env variable (`apps/web/src/ai-factory.ts:31`), bypassing the
  registry entirely. 🔶
- **The declarative workflow / playbook shape** — the model for "workflow packages" and
  "playbooks." The `Sop` interface (`domains/corporate-os/src/sop.ts:24`) is keyed, carries a
  `version` (`sop.ts:26`) and `steps: SopStep[]` (`sop.ts:29`), with a `SopStep` type
  (`sop.ts:12`) and a `SopEnginePort` exposing `get/list/publish/start` (`sop.ts:35`) including a
  `publish()` (`sop.ts:38`). These are **ports and types only** — a declarative, versioned,
  publishable workflow definition — with no engine behind them and nothing wired. 🔶

These three are the honest floor of Book H: real shapes that prove the *idea* of a versioned,
publishable, installable unit is expressible in the codebase. They are not an ecosystem; they are
the seed of one.

### 4.2 Everything else is ❌ ROADMAP

The rest of what "ecosystem platform" means has **no implementation** and gets **no citation**:

- **Installable packages** — the manifest, the envelope, the install-and-remove lifecycle, and the
  content-versioning envelope do not exist as code. ❌
- **Partners and marketplace** — publishers, catalog, store, listing, discovery, and distribution
  do not exist as code. Design documents exist under `partner/*.md`; they are **design intent, not
  implementation**, and are never cited as code. ❌
- **Trust, signing, and licensing** — signature, compatibility, hash-validation, and license
  enforcement for ecosystem content do not exist. The nearest primitive in the codebase is backup
  integrity hashing (`sha256()` at `packages/backup/src/archive.ts:18-19`, per-entry `checksum` at
  `:38`, verify-on-restore at `:108`) — but that is **backup integrity, not content trust.** AdOS
  has a sha256 primitive for backups; ecosystem signing and validation must be built. ❌
- **Templates as packageable units** — report, brief, and creative templates as installable
  artifacts do not exist as code. ❌
- **The extension-point framework** — a first-class composition-root plugin seam does not exist.
  The app's composition root takes only `bus`, `ai`, and `repos` (`apps/web/src/app.ts:69-72`) —
  no plugin array, no `register(...)` hook. The one place a package could attach today is the
  wildcard event subscription (`app.ts:120`, `subscribe('>')`), which is a weak seam, not an
  extension framework. A real, safe extension-point framework is net-new work. ❌
- **Community** — ratings, reviews, and contributions do not exist as code. ❌

Two further shells exist as **namespace only**, not infrastructure: `domains/connector-hub/src/events.ts`
and `domains/workflow-engine/src/events.ts` define event names with zero implementation and no
wiring. They are reserved namespaces, not a plugin system, and they do not raise the tier of
anything.

The significance is decisive: because there is no shipped ecosystem feature (§4.2) and the
strongest real code is a set of unwired registries (§4.1), **Book H is a specification, not a
shipped platform.** This book does not describe a running ecosystem; it describes the ecosystem
AdOS intends to grow — grounded honestly in the few shapes that exist — and it names, plainly,
everything that does not exist yet.

---

## 5. The six governing laws

Below are the six laws that govern every Book H document. Each is stated, justified, and given an
enforcement mechanism, with an honest tier status. Where a law is partially modeled by real code,
its status cites the 🔶 anchor; where a law describes a discipline the code does not yet
implement, the gap is named as ❌ ROADMAP without a citation.

### LAW 1 — Core Isolation Law

**Statement.** No ecosystem package may modify the Core Specification. The responsibilities of
Books A, B, C, D, E, F, and G cannot be changed by any package — they can only be *extended*. The
core is authored, frozen, and closed to modification from the ecosystem.

**Rationale.** This is the law from which every other law inherits. The core (A–G) is where
decisions, learning, optimization, action under a human gate, and read-only observation live. If an
ecosystem package could reach in and change a core contract — rewrite the Pipeline, alter a
Mission's structure, redefine Evidence — then the core's guarantees would become unverifiable,
because there would always be a second, ungoverned way to change the system: through an installed
package. An ecosystem that can move the core it attaches to is not an ecosystem; it is a fork. This
law is what makes the entire A–G/H separation trustworthy: the core is fixed; the ecosystem grows
around it.

**Enforcement.** The directional design of Book H: the core does not depend on the ecosystem, and
every added artifact is an *addition* alongside the core, never a replacement of it. The three real
anchors demonstrate the shape — a `PromptTemplate` (`prompt.ts:9`), an `INSTALLED_MODELS` entry
(`model-registry.ts:10`), and a `Sop` (`sop.ts:24`) each *add* material without changing a core
contract. H006 (`CORE_EXTENSION_MODEL.md`) owns the full treatment of how the core is extended
without being modified.

**Honest status.** 🔶/❌. The *principle* is expressed by the additive shape of the real anchors,
but there is **no enforcement mechanism in code** — no manifest, no isolation boundary, no
extension-point framework — that would prevent a package from reaching into the core. Isolation is
architecturally intended and honestly unbuilt. The one weak attach seam that exists today
(`app.ts:120`, the wildcard event subscription) is not an isolation boundary. ❌ for enforcement
machinery.

### LAW 2 — Package Independence

**Statement.** Every package must be installable **and** removable on its own. When a package is
removed, the core keeps running unchanged. No package may make itself indispensable, and no package
may leave the core broken when it leaves.

**Rationale.** Independence is what makes the ecosystem safe to grow. If installing a package could
entangle it with the core such that removing it broke the Pipeline or the Memory, then packages
would accrete into a second, load-bearing layer the core could not live without — and Law 1 would
be violated in practice even if it held on paper. Requiring every package to be cleanly removable
guarantees the core stays the only load-bearing layer: the ecosystem is always optional, always
additive, always reversible.

**Enforcement.** The real anchors model the independence shape: a `PromptTemplate` is a
self-contained, versioned unit (`prompt.ts:9`); an `INSTALLED_MODELS` entry is pure data added to a
registry (`model-registry.ts:10`) with a runtime `register(model)` (`model-registry.ts:57`); a
`Sop` is a keyed, versioned definition (`sop.ts:24`). Each is conceptually a standalone unit that
could be added or dropped without touching core logic. H002 (`PACKAGE_MODEL.md`) owns the
installable/removable unit definition.

**Honest status.** 🔶/❌. The *unit* is modeled by the versioned registries and the declarative
`Sop`, but the **install-and-remove lifecycle itself does not exist** — there is no manifest, no
install step, no removal step, no dependency resolution. Package independence is designed against
real shapes and honestly unimplemented as a lifecycle. ❌ for the lifecycle.

### LAW 3 — Trust Boundary

**Statement.** No content from the marketplace is automatically trusted. Every package MUST carry:
**Publisher · Version · Signature · Compatibility · License · Hash · Validation Status.** Nothing
installs on faith; everything installs on evidence.

**Rationale.** The moment the ecosystem admits content from outside the agency, it inherits the
oldest problem of every package system: how do you install someone else's material without
inheriting their risk? Auto-trust is how supply chains are poisoned. The seven-field manifest is
the answer — it makes every package carry, in its own metadata, the proof of who published it, what
version it is, whether its signature verifies, whether it is compatible, under what license it may
be used, whether its hash matches, and whether it passed validation. Trust becomes a checked
property, not an assumption. This is what lets an agency install a partner's package without
handing the partner the keys to the core.

**Enforcement.** The trust boundary is a checked precondition of installation: no package satisfies
the package model (H002) until all seven fields are present and validated. The marketplace (H008)
distributes only packages that already satisfy this boundary. H005 (`TRUST_BOUNDARY.md`) owns Law 3
in full and specifies each of the seven fields.

**Honest status.** ❌ ROADMAP. **No ecosystem signing, licensing, compatibility check, or
hash-validation exists in code.** The nearest primitive is backup integrity hashing
(`sha256()` at `packages/backup/src/archive.ts:18-19`, per-entry `checksum` at `:38`,
verify-on-restore at `:108`) — but that is **backup integrity, not content trust**, and it does
not validate ecosystem packages. Content trust must be built from scratch. No citation is given for
the trust boundary itself, because none exists.

### LAW 4 — No Hidden Execution

**Statement.** No package may run hidden code inside the core. A package may use **only** the
defined extension points. There is no path by which installing a package silently executes
package-authored logic inside the core's runtime.

**Rationale.** This is the law that keeps "installing a package" from meaning "granting arbitrary
code execution inside the operating system." A package that could run hidden code would defeat every
other law at once — it could modify the core (Law 1), make itself irremovable (Law 2), and bypass
the trust boundary (Law 3) — because it would be executing outside the checked, defined surface.
Restricting packages to *defined extension points* means the core always knows exactly where package
material can attach and what it can do there. A declarative template or a versioned prompt is *data*
the core reads; it is not a plugin the core runs. That distinction — data added at defined points,
never code executed at hidden ones — is what keeps the ecosystem auditable.

**Enforcement.** The safe shape is declarative: a `PromptTemplate` (`prompt.ts:9`) is interpolated
data, not executable code; an `INSTALLED_MODELS` entry (`model-registry.ts:10`) is a data
descriptor; a `Sop` (`sop.ts:24`) is a *definition* of steps, not a runnable plugin. Each is
consumed by the core as data at a known point, not executed as hidden logic. H006
(`CORE_EXTENSION_MODEL.md`) owns the definition of what a defined extension point is and why
declarative material is safe.

**Honest status.** 🔶/❌. The real anchors are declarative-by-construction, which is the right
shape, but there is **no first-class extension-point framework** to enforce "defined points only."
The composition root takes just `bus`, `ai`, and `repos` (`apps/web/src/app.ts:69-72`); the only
attach seam is the wildcard event subscription (`app.ts:120`), which is not a governed extension
point. A safe extension-point framework is net-new work. ❌ for the framework.

### LAW 5 — Ecosystem Never Rewrites Core

**Statement.** A package cannot change the Pipeline, the Memory, the Analytics, or the Evidence. It
may only **ADD**: a new template, a new workflow, a new prompt, a new benchmark, a new playbook.
The direction is fixed — the ecosystem contributes material; it never edits the machine.

**Rationale.** This is Law 1's operational twin. Law 1 says the core's *contracts* cannot be
modified; Law 5 says the core's *running state and machinery* — the Pipeline that executes, the
Memory that remembers, the Analytics that reports, the Evidence that proves — cannot be rewritten
by any package either. The carve-out matters and must be understood precisely: *adding* a new
template, prompt, workflow, benchmark, or playbook is exactly what the ecosystem is for; *changing*
how the Pipeline runs, what the Memory holds, how the Analytics derives, or what the Evidence
records is forbidden. The line is between *adding material* (allowed) and *rewriting machinery*
(forbidden). This is the invariant sentence expressed as a law.

**Enforcement.** Every package category defined in Book H is additive: prompt packages add prompts,
model packages add model entries, workflow packages add `Sop` definitions, template packages add
templates, benchmark packages add benchmark sets. None edits a core repository, a pipeline stage,
or an evidence record. The additive shape of the real anchors (`prompt.ts:9`, `model-registry.ts:10`,
`sop.ts:24`) demonstrates the discipline. H006 (`CORE_EXTENSION_MODEL.md`) owns Laws 1, 4, and 5
together.

**Honest status.** 🔶/❌. The *intended* discipline is expressed by the additive anchors, but with
no manifest, no lifecycle, and no extension-point framework, there is **no code that enforces
"add-only."** The discipline is designed and honestly unenforced. This law is the fixed constraint
every future package surface must satisfy: add material, never rewrite machinery.

### LAW 6 — Implementation Before Documentation

**Statement.** No roadmap capability may be promoted to shipped documentation until the
implementation exists and `PRODUCT_TRUTH.md` has been updated. Reality first, then documentation,
then marketing — always in that order, never reversed.

**Rationale.** This is the law that makes the entire truth model of the series (✅/🔶/❌)
constitutional rather than merely conventional. Every prior book carries the tier tags as a
discipline; Law 6 makes the *promotion* between tiers a governed act. A capability may not move from
❌ to 🔶 until code and tests exist; it may not move from 🔶 to ✅ until a live path reaches it and
`PRODUCT_TRUTH.md` records the fact. This forbids the most tempting failure mode of a design book —
writing the documentation for a feature as though the writing made it real. It binds the whole A–H
series going forward, not just Book H: it is the "Series 2" discipline — a feature is first
*implemented*, then *verified*, then `PRODUCT_TRUTH.md` is updated, and only then are the relevant
book's 🔶/❌ sections revised up to ✅. Documentation follows reality; it never leads it.

**Enforcement.** The single source of truth is [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md).
Every tier tag in every Book H document must be reconcilable against it: a ✅ claim must correspond
to a wired `path:line`; a 🔶 claim must correspond to code that resolves only in tests or package
internals; a ❌ claim must carry no citation. Any document that promotes a tier ahead of the code
is in violation of this law and is corrected — not the code.

**Honest status.** 🔶 **CONSTITUTIONAL DISCIPLINE, already practiced.** Book H itself is written
under this law: it claims no ✅ ecosystem feature (because none is wired), it cites only real
`path:line` anchors for its 🔶 claims, and it gives no citation for any ❌ roadmap item. The law is
honored by the very document that declares it. H010 (`THE_ECOSYSTEM_PLATFORM.md`) owns the forward
statement of this discipline as the closing posture of the whole series.

---

## 6. The three-tier truth model, applied to Book H's scope

This section states plainly which ecosystem capability is built-unwired and which is roadmap — so
that no reader mistakes a set of registries for a shipped ecosystem platform. There is no ✅ tier
in this section, because there is no shipped ecosystem feature.

### 6.1 ✅ SHIPPED — none

There is **no ✅ ecosystem feature** wired into the live app today. This is stated first and
without hedging: the ecosystem platform does not ship. Book H is a specification.

### 6.2 🔶 BUILT (UNWIRED) — the anchors that model a package

- **The prompt registry** — versioned, publishable, scorable content units: `PromptRegistryPort`
  (`packages/contracts/src/ai/prompt.ts:21`), `PromptTemplate` with `score?` (`prompt.ts:9`,
  `:14`), `publish()` (`prompt.ts:25`), and the `InMemoryPromptRegistry` adapter with A/B
  `selectActive` and `{{var}}` interpolation (`domains/prompt-registry/src/in-memory-prompt-registry.ts:18`,
  `:52`, `:57`). Unwired: the live path switches on hardcoded prompt keys (`apps/web/src/ai.ts:38-50`).
- **The AI model registry** — data-driven model entries and a runtime extension hook:
  `INSTALLED_MODELS` (`packages/ai-manager/src/model-registry.ts:10`), `InMemoryModelRegistry`
  (`:50`), `register(model)` (`:57`). Unwired: the live app selects a model by env
  (`apps/web/src/ai-factory.ts:31`).
- **The declarative workflow / playbook shape** — a keyed, versioned, publishable definition:
  `Sop` (`domains/corporate-os/src/sop.ts:24`), `version` (`:26`), `steps` (`:29`), `SopEnginePort`
  (`:35`), `publish()` (`:38`). Ports and types only; no engine, not wired.

These three are the entire honest floor of the ecosystem: they model what a package *is* without
being an ecosystem.

### 6.3 ❌ ROADMAP — the ecosystem with no implementation

- **Installable packages** — manifest, envelope, install-and-remove lifecycle, versioning envelope.
- **The trust boundary** — signature, compatibility, license, hash-validation, validation status
  for ecosystem content. (Nearest primitive is backup sha256 at `archive.ts:18` — backup
  integrity, not content trust.)
- **Templates as packages** — brief, campaign, report, and creative templates as installable units.
- **Playbooks** — only documents today; no packageable playbook code.
- **Partners and certification** — publishers, certified content, training content; only
  `partner/*.md` design docs exist, which are design intent, not code.
- **The marketplace** — catalog, listing, discovery, distribution, store.
- **The extension-point framework** — a first-class composition-root plugin seam and developer SDK.
- **Community** — ratings, reviews, contributions.

Nothing in §6.3 is presented as shipped anywhere in this book. Each is named as the roadmap it is,
and none carries a code citation.

---

## 7. The A–G core operating system, and Book H around it

Book H is not an eighth core book. Books A through G are the **AdOS Core Operating System, v1.0 —
frozen**, and they constitute one managed enterprise platform:

- **Book A — Workflow.** The agency's process and mission structure.
- **Book B — Production.** AI drafting of briefs, creative, and campaigns.
- **Book C — Explainability.** Rationale for every AI output.
- **Book D — Performance Memory.** The immutable evidence layer.
- **Book E — Creative Judgement.** Reproducible scoring of alternatives.
- **Book F — Orchestration.** The managed, deterministic, human-gated pipeline that runs the above
  and emits an observable record of every run.
- **Book G — Observability.** The read-only analytics lens that reports what the core did without
  changing it.

These seven are the **core**. Book H builds **around** the frozen core and must never change it.
The relationship is exactly three verbs, and never a fourth:

- **Consume.** Book H reads the core's contracts and outputs — a prompt reference, a model
  descriptor, a workflow definition — and packages reusable material against them. It takes what the
  core exposes; it does not reach past it.
- **Observe.** Book H may read the observability records Book G already produces, the same way any
  outer layer reads a published surface. It watches; it does not write back.
- **Extend.** Book H adds material at defined extension points — a new template, prompt, workflow,
  benchmark, or playbook — leaving every core contract exactly as specified.

There is no fourth verb. Book H may never **change** the core. This is the code-level expression of
the capstone principle that governs the whole series: later books may only *consume, observe, or
extend* the core "without altering their contracts." The rule is directional and constitutional:
**the core does not depend on Book H, and Book H must not modify the core.** The core is authored,
frozen, and specified in [`../../ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md);
Book H references that specification and the seven core books by link, and never re-documents,
re-specifies, or redesigns them. Where a Book H document needs a detail of A through G, it links to
that book and states the tier; it never restates the core's design as if it were Book H's own.

---

## 8. Boundaries of the platform — local, copy-only, and human-sovereign

Book H inherits, and must never weaken, the operating boundaries of AdOS. The ecosystem is the
layer most tempted to relax them — a marketplace naturally wants a cloud, a partner naturally wants
telemetry, a package naturally wants to run code — and so this book is the one that must guard them
hardest.

- **100% local, offline-first.** Every package, template, and model entry is a **local artifact**.
  Installing a package adds material to the user's machine; it does not open a network connection, a
  cloud backend, or a vendor API. The ecosystem adds reusable material, not connectivity.
- **No vendor telemetry — own data only.** No ecosystem feature emits anything off-device. A
  marketplace, a partner catalog, or a package installer may never phone home. The agency's use of
  its packages stays with the agency. Where a conventional package ecosystem would report installs,
  usage, and behaviour to a vendor, Book H is architecturally forbidden from doing so.
- **Copy-only.** The ecosystem produces material for human use — templates, prompts, playbooks,
  reports — and never executes an external action on the world. A package cannot buy ads, publish,
  or send; neither can anything it contributes.
- **Core-isolated.** By Laws 1 and 5, no package writes the Pipeline, Memory, Analytics, or
  Evidence. The ecosystem derives its safety from the core's isolation: it grows around the core
  without reaching into it.
- **Human-sovereign.** Installing, trusting, and using a package are human acts. No package may
  install itself silently, trust itself automatically (Law 3), or run hidden code (Law 4). The
  ecosystem is not an autonomous agent; it is a body of material a human chooses to add.

These boundaries are constitutional. No Book H document, and no future ecosystem feature, may relax
them in the name of reach, convenience, or automation. The **trust boundary** (Law 3) and **no
hidden execution** (Law 4) exist precisely to *protect* these boundaries: they are the mechanisms
that guarantee adding a package never breaks the local, sovereign, auditable guarantees of the
core. An ecosystem that phoned home, wrote back to the core, or ran hidden code would have traded
away the exact properties that make AdOS worth building an ecosystem around.

---

## 9. Value contribution

Book H's value is not a new core capability — it is the *multiplication* of the seven capabilities
that already exist. A stable, frozen core with a safe ecosystem around it turns a system an agency
*runs* into a system an agency, its partners, and a community can *build on*. That yields value on
both axes AdOS is measured by:

- **Reduces production time.** A prompt package, a campaign template, a report template, or a
  playbook is reusable material an agency does not have to author from scratch each time. The
  versioned, scorable prompt unit (`prompt.ts:9`) and the declarative workflow definition
  (`sop.ts:24`) model exactly this: capture the best version of a repeated task once, then reuse it
  everywhere. An ecosystem of shared, trusted, installable material is production time saved at
  scale — every agency inherits every other agency's best work, safely.
- **Increases agency revenue.** An enterprise buys a platform it can *grow with*. A marketplace of
  certified partner content, brand and creative kits, benchmark sets, and training content is a
  surface an agency uses to deliver more, faster, and to differentiate on the strength of the
  packages it brings. A partner ecosystem turns AdOS from a tool an agency uses into a platform an
  agency and its partners *invest in* — and platforms that others build on are worth more than tools
  that stand alone. The ecosystem is how the value of the frozen core compounds.

The through-line: **the ecosystem extends the core; it never rewrites the core** — and by
extending it safely, locally, and under a human's hand, Book H turns a finished operating system
into a platform an agency can grow, share, and build a business on, without ever putting the core
that makes it trustworthy at risk.

---

## 10. What this constitution binds

Every Book H content document — H002 through H010 — is subordinate to this text:

- **H002 `PACKAGE_MODEL.md`** — what a "package" *is*: the installable/removable unit (Law 2) and
  its required seven-field manifest (Law 3). Grounds the packageable-unit concept to the versioned
  `PromptTemplate` (🔶 `prompt.ts:9`/`:14`), the data-driven `INSTALLED_MODELS` + `register()`
  (🔶 `model-registry.ts:10`/`:57`), and the versioned `Sop` (🔶 `sop.ts:24`/`:26`); honest that
  the installable envelope, manifest, and install-remove lifecycle are ❌.
- **H003 `CONTENT_PACKAGES.md`** — the content package categories: prompt packages
  (🔶 prompt-registry), AI model packages (🔶 model-registry), and brand/creative/benchmark
  packages (❌). Each: what it contains, how it plugs in via the package model, honest tier.
- **H004 `TEMPLATES_AND_PLAYBOOKS.md`** — templates (brief/campaign/report/creative = ❌),
  playbooks (❌ — only documents today), and workflow packages (🔶 the declarative `Sop` shape,
  `sop.ts:24`). Owns the "definition, not code" principle that makes a workflow packageable safely,
  tied to Law 4 (a declarative `Sop` is data, not executable plugin code).
- **H005 `TRUST_BOUNDARY.md`** — owner of Law 3. No auto-trust; the seven-field manifest
  (Publisher · Version · Signature · Compatibility · License · Hash · Validation Status), each
  field explained. Honest that ecosystem signing/licensing/hash-validation is ❌; the nearest
  primitive is backup sha256 (`archive.ts:18`), which is backup integrity, not content trust.
- **H006 `CORE_EXTENSION_MODEL.md`** — owner of Laws 1, 4, and 5. How the core is *extended*
  (isolation is the consequence, not the subject): the core is unchangeable, packages use only
  defined extension points, and no package rewrites Pipeline/Memory/Analytics/Evidence. Honest that
  no first-class extension point exists — the composition root takes only `bus`/`ai`/`repos`
  (`app.ts:69`) and the only attach seam is the wildcard event bus (`app.ts:120`); a safe
  extension-point framework is ❌.
- **H007 `PARTNERS_AND_CERTIFICATION.md`** — partners, publishers, certified partner content,
  training content, agencies as participants. Honest ❌ ROADMAP — design docs exist under
  `partner/*.md` (design intent, not code); certification ties to Law 3 (Validation Status).
- **H008 `THE_MARKETPLACE.md`** — the marketplace as **one subset** of the ecosystem: catalog,
  listing, discovery, distribution. Honest ❌ (no catalog/listing/store code). Applies the trust
  boundary (Law 3) to every listing and distributes only packages that already satisfy the package
  model (H002) and trust boundary (H005).
- **H009 `DEVELOPER_PLATFORM.md`** — developers who build packages: extension points, the
  `register()` mechanisms as the seed of a developer surface (🔶 `model-registry.ts:57`), an SDK /
  defined extension-point contract (❌), and the community layer (❌). How a developer stays inside
  Laws 1, 4, and 5.
- **H010 `THE_ECOSYSTEM_PLATFORM.md`** — the closing synthesis: the A–H whole, Book H's honest tier
  posture (no ✅ live; 🔶 prompt/model/Sop anchors; the rest ❌), the series declared **complete at
  Book H**, and **Series 2 = real code only** positioned as the forward discipline. Ends the entire
  A–H series.

Where any of these conflicts with the six laws above, the law controls and the document is
corrected.

> **The ecosystem extends the core; it never rewrites the core.**

---

## 11. The invariant, restated

Because it is the spine of the entire book, the invariant is restated here in full, and it is the
sentence against which every Book H document, every package, every template, and every marketplace
listing is measured:

> **The ecosystem extends the core; it never rewrites the core.**

Book H adds. It does not decide, it does not learn, it does not optimize, it does not observe on
the core's behalf, and above all it does not rewrite the core. It consumes the frozen core's
contracts, observes the records the core produces, and extends the core through defined seams —
locally, copy-only, under a human who remains sovereign over every install, every trust decision,
and every use. That is the whole of what Book H is permitted to be — and, kept honestly, it is
exactly what an enterprise needs the final layer to be: the place where a finished operating system
becomes a platform an agency can build a business on, with the core that makes it trustworthy left
exactly as specified.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
