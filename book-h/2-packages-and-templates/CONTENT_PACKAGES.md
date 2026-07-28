# Content Packages

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

This document defines the **content package categories** — the kinds of content the ecosystem can
carry to a running installation of the core. A content package is not a feature bolted onto the
Pipeline; it is a unit of *content* — a prompt, a model descriptor, a set of brand rules, a
reusable creative angle, a benchmark dataset — shaped so that installing it **adds** something the
core can use, and removing it leaves the core exactly as it was. The categories below are the
answer to a single question: *what can an agency drop into AdOS to make it produce better work,
without anyone rewriting AdOS to do it?*

This document covers *content* packages; the sibling
[`TEMPLATES_AND_PLAYBOOKS.md`](TEMPLATES_AND_PLAYBOOKS.md) covers templates, playbooks, and
workflow packages, which are packaged the same way but carry structure rather than content.

Every category is measured against the same package model defined in Part 1
([`../1-ecosystem-foundations/PACKAGE_MODEL.md`](../1-ecosystem-foundations/PACKAGE_MODEL.md)):
each package is an installable, removable unit that carries a manifest and plugs in through a
defined extension point, never through hidden code. Two of the five categories — **prompt
packages** and **AI model packages** — already have a real *content shape* in the codebase: there
is code that stores, versions, scores, and registers exactly the kind of data these packages would
carry. Three — **brand**, **creative**, and **benchmark** packages — are contracts with no
implementation yet, and this document says so plainly rather than dressing intent as delivery.

One sentence bounds every category that follows, and it is stated here in full because it is the
boundary of the whole layer:

> **The ecosystem extends the core; it never rewrites the core.**

A content package adds a new prompt, a new model, a new brand voice, a new angle, a new benchmark.
It does not change how the Pipeline runs a mission, how Memory records an outcome, how Analytics
computes a KPI, or how Evidence proves what happened. Everything below is that principle made
concrete, category by category — Law 5 (Ecosystem Never Rewrites Core) read one package type at a
time.

---

## 2. Prompt packages (🔶 BUILT — UNWIRED)

A **prompt package** is a bundle of versioned, scorable prompt templates — the exact instructions
the AI Manager is handed for a given task, packaged so an agency can install a better set without
touching a line of business logic. This is the strongest content-package anchor in Book H, because
the shape a prompt package would carry already exists as real, tested code.

### 2.1 What it contains

A prompt package carries `PromptTemplate` records. Each template is already a self-describing,
versioned content unit in the contract (`packages/contracts/src/ai/prompt.ts:9`): a `key` (for
example `"creative.image"` or `"ceo.system"`), a numeric `version`, the `content` string with
`{{variable}}` placeholders, an optional A/B performance `score` (`prompt.ts:14`), free-form
`metadata` for routing and experiments, and an `active` flag. That is precisely the anatomy of a
packageable content unit: an identity, a version, a payload, and a quality signal — nothing about
it is bound to a particular customer or a particular run.

The contract's own header states the design rule the package category depends on: *"Prompts are
NEVER hardcoded in business logic; agents/capabilities reference them by key"*
(`prompt.ts:6`). Because a prompt is referenced by key and resolved from a registry, a package can
supply a *better version of the same key* and the code that consumes it does not change.

### 2.2 How it plugs in via the package model

The extension point a prompt package would install through is the **Prompt Registry**. The port
`PromptRegistryPort` (`prompt.ts:21`) defines the whole surface: `get` a template (optionally by
version), `list` all versions of a key, `render` a template with variables, `publish` a new
template (`prompt.ts:25`), and `score` an outcome (`prompt.ts:27`). Installing a prompt package is,
at the content level, a sequence of `publish` calls; removing it is dropping those keys — the
registry keeps serving whatever remains.

The in-memory adapter shows this is real, working machinery, not a sketch. `InMemoryPromptRegistry`
(`domains/prompt-registry/src/in-memory-prompt-registry.ts:18`) stores templates keyed by version,
and its behaviour is exactly what a package system needs from its host:

- **Versioning is native.** `publish` writes a template under its `key` and `version`, so multiple
  versions of one prompt coexist. A package can ship `creative.image` v27 alongside the v14 an
  earlier package installed, and both are retained.
- **Selection is by merit, not recency.** `get` without a version returns the *active* version via
  `selectActive` (`in-memory-prompt-registry.ts:52`), which picks the highest-scoring version and
  falls back to the latest only when nothing has been scored. A newly installed prompt package does
  not automatically win — it wins if and when it outperforms.
- **Rendering is deterministic substitution.** `interpolate`
  (`in-memory-prompt-registry.ts:57`) replaces `{{var}}` placeholders and leaves unknown ones
  untouched — the package's content is data filled in at render time, never executable code (Law 4,
  No Hidden Execution).
- **Quality is learned from outcomes.** `score` (`in-memory-prompt-registry.ts:66-73`) folds each
  reward into an exponential moving average (`prior * 0.8 + reward * 0.2`), so a package's prompts
  earn or lose their active status from real results rather than a publisher's claim.

Versioned, scored, publishable prompt content resolved by key through a port — that is a genuine
package shape, already built.

### 2.3 A worked example — a prompt package earning its keep

The mechanics are easy to assert and easy to trace. Suppose an installation already serves
`creative.image` v14 — published by an earlier package, scored `82` from real outcomes. An agency
installs a new prompt package that `publish`es `creative.image` v27 with sharper copy. What happens
next is entirely governed by the code above, not by the publisher's confidence:

1. **Both versions coexist.** After `publish` (`in-memory-prompt-registry.ts:24`), the registry
   holds v14 and v27 under the same key. Nothing is overwritten; `list` returns both.
2. **v27 does not win by arriving.** A freshly published template is unscored. `selectActive`
   (`in-memory-prompt-registry.ts:52`) ranks the scored v14 (`82`) above the unscored v27, so
   `get('creative.image')` still returns v14 — the installed package is *available*, not yet
   *trusted*.
3. **v27 wins only by outperforming.** As v27 is used and `score` (`in-memory-prompt-registry.ts:66-73`)
   folds its rewards into an EMA, its score climbs; the moment it passes v14, `selectActive` makes
   it the active version. Merit, measured locally, decides.
4. **Removing the package is safe.** Drop v27 and v14 is still there, still active, still scored —
   the core keeps running on whatever remains (Law 2).

That is a content package behaving exactly as the package model requires: additive on install,
earned into service by outcomes, and clean on removal — all of it real, tested code today. The only
missing piece is §2.4.

### 2.4 The honest tier — 🔶 BUILT (UNWIRED)

What is missing is the wire. The live web app does **not** consult the registry. The
`OfflineAIManager` that runs the pilot resolves prompts by a hardcoded switch on
`request.promptRef?.key` (`apps/web/src/ai.ts:38-50`) — `marketing.brief`, `creative.set`,
`campaign.draft`, `analytics.report`, `executive.dashboard` are branches in a function, not
lookups against `PromptRegistryPort`. So today an installed prompt package would sit in a registry
that the live path never reads. The content shape is real and tested; the connection from a
published package to a running mission is **❌ net-new work**. That is why prompt packages are
🔶 BUILT (UNWIRED), not ✅: the package *can be expressed in code that exists*, but no live path
reaches it.

Crucially, this category **adds** and never rewrites. A prompt package supplies new template keys
and versions; it does not change how the Pipeline sequences a mission or how the AI Manager is
invoked. Wiring the registry into the live path would let the core *consume* installed prompts — it
would not let a prompt package alter the core's contracts.

---

## 3. AI model packages (🔶 BUILT — UNWIRED)

An **AI model package** installs a new local inference model as *data the router can see* — a model
descriptor, not a code change. Like prompt packages, this category has a real content shape in the
codebase: models are already expressed as installable data with a runtime registration mechanism.

### 3.1 What it contains

A model package carries `ModelDescriptor` records. The inventory `INSTALLED_MODELS`
(`packages/ai-manager/src/model-registry.ts:10`) is the seed: twelve local models — Ollama and
ComfyUI engines — each a plain data row describing its `id`, engine, `capabilities` (chat,
reasoning, code, vision, embedding, image generation), VRAM footprint, context window, priority,
and quantization. The module comment states the intent directly: the inventory is *"expressed as
data (never hardcoded business logic)… swapping a model requires zero agent changes."* A model
package is one or more such descriptors — a manifest of "here is a model this machine can run, and
what it is good at."

Nothing in a descriptor is executable. It is a claim about a locally installed model's
capabilities that the router reads by capability — which is exactly why a model package can be
trusted as *content*, not code (Law 4).

### 3.2 How it plugs in via the package model

The extension point is the **Model Registry**. `InMemoryModelRegistry`
(`model-registry.ts:50`) holds descriptors keyed by `id` and exposes a runtime `register(model)`
method (`model-registry.ts:57`) that inserts or replaces a descriptor. Installing a model package
is, at the content level, calling `register` with the package's descriptors; the router then
consults the registry purely by capability and can route to the new model without any agent
knowing it exists.

The registry already behaves the way a package host should:

- **Registration is runtime and data-driven.** `register` (`model-registry.ts:57`) adds a model to
  a live registry — "add a model" is real code operating on data, not a redeploy.
- **Selection is by capability and priority.** `list` filters descriptors by capability and enabled
  state and sorts by priority, so an installed model competes on merit for the tasks it declares.
- **Enable/remove is first-class.** `setEnabled` toggles a model, and dropping a descriptor removes
  it — package independence (Law 2) at the content level.
- **Discovery is anticipated.** `detectInstalled` (`model-registry.ts:77`) is the seam where a
  production adapter would probe each engine (e.g. Ollama's `/api/tags`) and reconcile — the point
  where installed model packages would be discovered rather than declared by hand.

### 3.3 A worked example — a model package the router can see

Say an operator installs a locally-downloaded reasoning model and a package registers its
descriptor: `register({ id: 'new-reasoner:32b', engine: 'ollama', capabilities: ['reasoning',
'chat'], priority: 95, … })` (`model-registry.ts:57`). Immediately, `list({ capability:
'reasoning', enabledOnly: true })` includes it, sorted by priority above the seeded reasoning
models (`model-registry.ts:12` `deepseek-r1:32b`, priority `88`). No agent code changed; no prompt
changed. A router that selects by capability would now be able to route reasoning tasks to the new
model purely because a data row was added — and `setEnabled('new-reasoner:32b', false)` or dropping
the descriptor takes it back out just as cleanly. That is the whole promise of a model package: a
new capability arrives as content the registry holds, not as a change to how the core reasons.

### 3.4 The honest tier — 🔶 BUILT (UNWIRED)

The live app does not select its model through the registry. `createAIManager`
(`apps/web/src/ai-factory.ts:31`) picks the model from the `AI_MODEL` environment variable and
hands it to the live engine, bypassing `InMemoryModelRegistry` entirely. So a model registered as a
package would be visible to the router's data structures but not to the path the web app actually
takes to choose a model. The registration mechanism is real and works on data; the live wiring from
"registered package" to "model the running app uses" is **❌ net-new work**. That places AI model
packages at 🔶 BUILT (UNWIRED).

This category, too, only **adds**. A model package registers a new descriptor; it does not change
how the Pipeline runs, how Memory scores an outcome, or how Analytics computes a KPI. The core
gains a model to *consume*; its contracts are untouched.

---

## 4. Brand packages (❌ ROADMAP)

A **brand package** would carry an agency's or a client's brand rules as installable content: voice
and tone guidelines, banned and preferred phrasings, naming conventions, do-and-don't lists, the
constraints that make generated copy sound like *this* brand rather than a generic one. Installed,
a brand package would let the core produce on-brand output for a client; removed, the core would
fall back to its default voice — the client's brand leaving with the package (Law 2).

**Tier: ❌ ROADMAP.** There is no brand-package code, and this document cites none. There is no
type for a brand rule set, no store that holds one, no extension point that reads one on the
generation path. Brand governance as installable content is a contract and an intention, not an
implementation.

It is worth being precise about what would make this real rather than imagined: a brand package
would need a *content shape* (a typed, versioned rule set — the way `PromptTemplate` is a typed,
versioned prompt) and a *defined extension point* the generation path consults (the way a prompt
would be resolved through `PromptRegistryPort`). Neither exists for brand content today. It would
also carry the same manifest every package must — publisher, version, license, compatibility, and a
validation status — under the Trust Boundary (Law 3), so that a client's brand rules are never
silently trusted; but that trust machinery is itself roadmap
([`../1-ecosystem-foundations/PACKAGE_MODEL.md`](../1-ecosystem-foundations/PACKAGE_MODEL.md)). When it is
built, it must obey the same rule as everything above — a brand package **adds** constraints the
core can consume; it does not rewrite the Pipeline, Memory, Analytics, or Evidence. A brand voice
is content the core reads, never a change to how the core works.

---

## 5. Creative packages (❌ ROADMAP)

A **creative package** would bundle reusable creative assets and angles as installable content:
proven hooks, headline formulas, campaign angles, messaging frameworks, the reusable creative
patterns an agency accumulates and would want to carry from one client to the next. Installed, a
creative package would give the core a library of starting points to draw on; removed, that library
would leave with it.

**Tier: ❌ ROADMAP.** No creative-package code exists, and none is cited. There is no type for a
reusable creative angle, no library that stores one, no extension point that offers one to the
generation path.

Two boundaries sharpen what a creative package could ever be. First, the same content discipline as
above: it would need a typed, versioned content shape and a defined extension point — neither
exists. Second, and specific to this category, AdOS holds a **copy-only** boundary: the core
produces text, not rendered imagery or video. So a creative package's contents are constrained to
*text* — angles, hooks, headline patterns, messaging frameworks — not image or motion assets. A
creative package is a library of reusable *copy* patterns, and even that is roadmap: a contract for
content the core would consume, adding to what it can draw on and changing nothing about how it
draws.

---

## 6. Benchmark packages (❌ ROADMAP)

A **benchmark package** would carry marketing benchmark datasets as installable content: reference
figures an agency compares its results against — expected CTR by industry, typical ROAS bands,
cost-per-lead norms for a vertical — so a campaign's numbers can be read against a market baseline
rather than in isolation. Installed, a benchmark package would give Analytics a comparison set to
render alongside a KPI; removed, the comparison would disappear and the raw KPI would remain
exactly as computed.

**Tier: ❌ ROADMAP.** No marketing-benchmark code exists, and none is cited. There is no type for a
benchmark dataset, no store that holds one, and no extension point through which Analytics would
read one.

One disambiguation prevents a false anchor. A `packages/bench/` directory exists in the codebase,
but it is **engineering performance benchmarking** — measuring how fast the software runs — not
*marketing* benchmark data. It is named here only to rule it out: it is not evidence that marketing
benchmark packages exist, and it must not be cited as one. Marketing benchmark packages remain a
contract with no implementation.

As with every category, a benchmark package would **add** a comparison baseline the core can
consume next to a number it already computed. It would never change the number: `computeKpis`
stays the deterministic source of the KPI, and a benchmark is a reference shown beside it, not a
rewrite of the Analytics math. The core keeps computing exactly as specified; a benchmark package
only gives the human more context for reading the result.

---

## 7. The law this document owns — Law 5, one category at a time

Every category above is a reading of **Law 5 (Ecosystem Never Rewrites Core)**: *a package cannot
change the Pipeline, the Memory, the Analytics, or the Evidence; it may only ADD.* Read across the
five categories, the pattern is exact and deliberate:

| Category | Tier | What it ADDS | What it must never change |
| --- | --- | --- | --- |
| **Prompt packages** | 🔶 | A new prompt key/version (`prompt.ts:9`) served via `PromptRegistryPort` (`prompt.ts:21`) | How the Pipeline runs a mission or the AI Manager is invoked |
| **AI model packages** | 🔶 | A new `ModelDescriptor` via `register()` (`model-registry.ts:57`) | How Memory scores or the router's contract behaves |
| **Brand packages** | ❌ | A brand voice/rule set the generation path can consume | The Pipeline, or how output is produced |
| **Creative packages** | ❌ | A library of reusable copy angles (copy-only) | The generation contract |
| **Benchmark packages** | ❌ | A market baseline shown beside a KPI | The deterministic Analytics math or the Evidence |

Not one category, built or roadmap, touches the four core surfaces. A prompt package supplies text
resolved by key; a model package supplies a descriptor read by capability; brand, creative, and
benchmark packages — when built — supply constraints, angles, and baselines the core *consumes*.
Each is additive by construction. That is why the ecosystem can grow indefinitely without ever
destabilising the frozen A–G core: adding content is not the same operation as changing behaviour,
and the package model keeps the two separate.

This also binds the category work to **Law 6 (Implementation Before Documentation)**. The two 🔶
categories are documented as *built but unwired* precisely because their code exists and their
live wiring does not; the three ❌ categories carry no citation because no code backs them yet.
None is promoted a tier above its reality.

> **The ecosystem extends the core; it never rewrites the core.**

---

## 8. Boundaries — local, own-content-only, no telemetry, core-isolated

The content-package categories hold inside the same boundaries as the whole platform:

- **100% local, offline-first.** Both real anchors run entirely on-device: the prompt registry
  (`in-memory-prompt-registry.ts:18`) and the model registry (`model-registry.ts:50`) are in-memory
  local structures. A content package is a **local artifact** installed onto the operator's own
  machine — there is no remote fetch on the resolution path.
- **Own content only.** The prompts an agency publishes and the models it registers are its own,
  described by data it controls. Nothing in these categories reaches out to an external content
  source at run time.
- **No vendor telemetry.** Installing or using a content package transmits nothing off-device.
  Prompt scores (`in-memory-prompt-registry.ts:66-73`) accumulate locally; model descriptors stay
  in the local registry. A package is content that arrives; it is never a channel that reports back.
- **No hidden execution (Law 4).** Every category's payload is *data*, not code — a prompt is an
  interpolated template (`in-memory-prompt-registry.ts:57`), a model is a descriptor read by
  capability, and the roadmap categories are likewise defined as content, not plugins. A package
  uses only the defined extension point; it never runs code inside the core.
- **Core-isolated (Law 1 / Law 5).** Installing any content package leaves the Pipeline, Memory,
  Analytics, and Evidence exactly as the core specification defines them. The core does not depend
  on any package; the packages depend on the core and leave it untouched.

The one-line boundary: **a content package is local content the core may consume — never remote,
never executable, never a change to the core.**

---

## 9. Value contribution

The content-package categories map directly to both of the platform's value levers, because
content is the lever by which an agency turns a generic engine into *its* engine.

**They grow agency revenue by making quality portable and reusable.** A prompt package that lifts
creative quality, a model package that adds a capability, a brand package that keeps every client's
voice consistent, a creative package that carries a proven angle from one account to the next, a
benchmark package that lets an agency show a client its results against the market — each is
content an agency builds once and reuses across its whole book. Reusable quality is a moat: the
agency that has accumulated the best prompt sets, the best angles, and the sharpest benchmarks
produces better work on every new account without rebuilding from scratch, and better provable work
is what renews and wins accounts.

**They cut production time by turning improvement into installation.** With the wiring the 🔶
categories point toward, improving how the core generates becomes *publishing a prompt version* or
*registering a model* — data operations — rather than a code change and a redeploy. `publish`
(`prompt.ts:25`) and `register` (`model-registry.ts:57`) are the shape of that future: an operator
edits content, and the running system picks it up. The roadmap categories extend the same idea to
brand, creative, and benchmark content. The time an agency would spend re-teaching the system its
voice, re-deriving its angles, or re-establishing its baselines collapses into installing the
package that already holds them.

**They compound because each category is additive and independent.** Because every package only
adds — and because package independence (Law 2) means each installs and removes on its own — an
agency's content library grows without ever destabilising the core or entangling the packages with
one another. A prompt package, a model package, and a brand package can be mixed, matched, and
removed freely; the core keeps running unchanged beneath them. A library of independent,
additive content packages is worth more than a single customised fork, because the library
compounds and the fork rots.

> **The ecosystem extends the core; it never rewrites the core.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
