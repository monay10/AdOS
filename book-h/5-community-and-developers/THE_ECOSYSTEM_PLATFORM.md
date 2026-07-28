# The Ecosystem Platform — A–H, and the Close of the Series

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md).
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## 0. What this document is

This is the closing document of Book H, and it is the closing document of the entire A–H series. The
nine documents before it defined the ecosystem one part at a time: the constitution and its six laws,
the package model, content packages and templates, the trust boundary and the core-extension model,
partners and the marketplace, and the developer platform. This document adds no new part. It performs
the synthesis — for Book H, and then for the whole series that Book H completes.

It holds two things at once, without blurring them. The first is the **design**: an ecosystem of
installable, removable, trust-carrying components that grow *around* the frozen A–G core and add value
beside it. The second is the **status**: that almost none of that ecosystem is built yet. This is the
document where "AdOS has an ecosystem" is most tempting to say as though it were shipped — and it is
exactly the sentence this document refuses to let stand unqualified. Book H is, honestly, a
specification. It is grounded on a small set of real 🔶 anchors and is otherwise ❌ roadmap, and it is
written that way on purpose: the ecosystem is designed in full and built in part, and the two are never
confused.

> **The ecosystem extends the core; it never rewrites the core.**

That sentence has appeared in every content document of Book H. It appears here for the last time, and
it is the reason this synthesis is honest. Book H does not make the core *different* by adding an
ecosystem. It adds no generation, no evidence, no judgement, no orchestration, and no analytics. It
surrounds a fixed center with components that can be added and removed without the center ever moving.
That — not a new capability inside the core — is what turns an operating system into a **platform**.

---

## 1. The synthesis — an ecosystem around a frozen core

A–G are the platform, frozen. Books A through F are **AdOS Core Specification v1.0** — the workflow,
the production, the explanation, the evidence, the judgement, and the orchestration that runs them in
order. Book G is the observability layer laid over that core: it reads the core's records and renders
their reality, and it never changes them. Together, A–G are the operating system and its mirror. They
are complete as a design, and honestly uneven as a shipped reality — a strong human-gated workflow and
business-analytics surface run live, while much of the governed pipeline and its observability are
built-but-unwired or roadmap. All of that is fixed. Book H does not touch it.

Book H is the layer that grows *outward* from that fixed center. Where Book G's directional rule is
*consume and observe*, Book H's rule is *extend*: add value beside the core without reaching into it.
The relationship is one-way and inherited directly from the freeze principle of
[`../../ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md) — the core does **not** depend on
the ecosystem; the ecosystem depends on the core and leaves it exactly as specified. A package may
consume what the core produces, observe what it does, and add a new template, prompt, workflow,
benchmark, or model beside it. A package may **never** redefine a core responsibility, change a core
contract, or reach in to alter how the core decides.

Value grows in one direction, outward from a fixed center:

```
Core  →  Packages  →  Templates  →  Partners  →  Marketplace  →  Community  →  Developers
(frozen A–G)                       (built around the core; the core never changes)
```

Read that flow left to right and Book H's contribution is concrete and bounded: it is a **ring around
the platform**, not a change to the platform. Each stage adds something beside the core — a unit of
content, a template, a publisher, a catalog, a community, a developer surface — and none of them adds
anything *inside* it. The marketplace, which the outside world often mistakes for the whole of an
"ecosystem," is exactly one stage of seven here: a distribution surface for packages that already
satisfy the package model and the trust boundary, and nothing more.

The honesty of the synthesis is in the *unevenness* of what the ecosystem extends. Walk the seven
frozen layers one at a time, and for each, name what a package may add beside it and how far that
addition exists in code today:

- **A — Workflow.** The core owns the human-gated mission lifecycle. A package may add beside it a
  workflow definition — a declarative playbook the human runs — but never a change to the gate itself.
  The nearest real shape is the `Sop` (`sop.ts:24`): a keyed, versioned, step-defined workflow that is
  *data*, not code. It is **🔶** — ports and types only, no engine, unwired.

- **B — Production.** The core drafts briefs, creative, and campaigns. A package may add beside it a
  prompt pack or a template that shapes what B drafts, never a change to how B drafts it. The prompt
  registry (`prompt.ts:9`, `in-memory-prompt-registry.ts:18`) is the proven pattern: versioned,
  scorable, publishable prompt content. **🔶** — the live path uses hardcoded keys
  (`apps/web/src/ai.ts:38-50`), not the registry.

- **C — Explainability.** The core produces the rationale behind each artifact. A package may add
  content that *carries* explanation (a template whose fields prompt for rationale), never a change to
  how C grounds a recommendation. This is **❌** as an ecosystem surface — no packaged explanation
  content exists.

- **D — Performance Memory.** The core records what has worked, immutably. A package may add a benchmark
  pack beside the memory — a reference set to compare against — but never a write into the evidence
  base. Benchmarks-as-packages are **❌**.

- **E — Creative Judgement.** The core scores and applies taste. A package may add a model beside it —
  a new local model the registry can select — never a change to how E judges. The model registry
  (`model-registry.ts:10`/`:57`) is the proven `register()` pattern. **🔶** — apps/web selects by env
  (`ai-factory.ts:31`), bypassing the registry.

- **F — Orchestration.** The core runs A–E in order under one gate. A package may add a workflow pack
  the orchestrator can run, never a change to the pipeline order or the gate. This rides the same `Sop`
  shape as layer A and is **🔶** for the same reason.

- **G — Observability.** The core renders its own reality, read-only. A package may add a report
  template or a benchmark view beside the analytics, never a change to how a metric derives. Packaged
  report templates are **❌**.

Read that list top to bottom and the pattern is the point: the ecosystem is designed to extend all
seven layers, and it exists in code beside three of them — B's prompt content, E's model registry, and
the A/F workflow shape — as **🔶** patterns, with the rest **❌**. The ring is specified in full and
built in part, and the two are never confused.

**No new intelligence, and no new decision.** This is the load-bearing constraint of the whole
synthesis, and it is the same constraint that governed Book G one layer down. Book H invents no
generation (that is Book B), no explanation (Book C), no evidence (Book D), no judgement (Book E), no
workflow (Book A), no orchestration (Book F), and no analytics (Book G). If a proposed ecosystem
behaviour would require a package to *change* a mission, an evidence item, a creative, a score, an
order of a run, or the derivation of a metric, that behaviour is out of bounds by law. The ecosystem
adds reach; it never adds authority over the core. The platform is trustworthy precisely because the
ecosystem layer is additive, removable, and trust-gated — not because it is large.

---

## 2. The six laws, recapped

The ecosystem is the six governing laws, working together, around the platform the seven books beneath
it produce. Each is declared in full in the constitution
([`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md));
recapped here at the close:

- **Law 1 — Core Isolation.** No ecosystem package may modify the Core Specification. The
  responsibilities of Books A–G cannot be changed by any package — only extended.
- **Law 2 — Package Independence.** Every package must be installable **and** removable on its own.
  When a package is removed, the core keeps running unchanged.
- **Law 3 — Trust Boundary.** No content from the marketplace is automatically trusted. Every package
  must carry seven fields: **Publisher · Version · Signature · Compatibility · License · Hash ·
  Validation Status.**
- **Law 4 — No Hidden Execution.** No package may run hidden code inside the core. A package may use
  only the defined extension points.
- **Law 5 — Ecosystem Never Rewrites Core.** A package cannot change the Pipeline, the Memory, the
  Analytics, or the Evidence. It may only **add** — a new template, a new workflow, a new prompt, a new
  benchmark, a new playbook.
- **Law 6 — Implementation Before Documentation.** No roadmap capability may be promoted to shipped
  documentation until the implementation exists and PRODUCT_TRUTH.md has been updated.

The first five laws describe *how the ecosystem relates to the core* — isolation, independence, trust,
no hidden execution, no rewrite. The sixth law describes *how the series relates to reality*, and it is
the one that reaches past Book H to bind everything that comes after it. It is the subject of §5.

> **The ecosystem extends the core; it never rewrites the core.**

---

## 3. Book H's honest tier posture

Book H is candid about status, because the whole point of the three-tier model is that nothing unbuilt
is presented as shipped. Stated plainly and up front:

**No ✅ ecosystem feature is wired into the live app today.** There is no installable-package
mechanism, no trust or signing pipeline, no partner or marketplace code, no community layer, and no
developer SDK running in the live web app. Book H is almost entirely a design and architecture
specification. What it *does* have is a small set of real, tested **🔶 BUILT (UNWIRED)** shapes that
prove the ecosystem's core patterns already exist in code — versioned content, a data-driven
registry, and a declarative workflow definition — even though no live path yet treats them as
packages. Everything else is **❌ ROADMAP**.

### The 🔶 anchors — the ecosystem's patterns already in code

- **Prompt registry** — the model for a "prompt package": a versioned, publishable, scorable unit of
  content. The contract `PromptRegistryPort`
  (`packages/contracts/src/ai/prompt.ts:21`) defines a versioned `PromptTemplate`
  (`prompt.ts:9`, with an optional `score?` at `prompt.ts:14`), a `publish()` method
  (`prompt.ts:25`), and a `score()` method (`prompt.ts:27`), behind the DI symbol `PROMPT_REGISTRY`
  (`prompt.ts:30`) under the header "Prompts are NEVER hardcoded" (`prompt.ts:6`). The adapter
  `InMemoryPromptRegistry` (`domains/prompt-registry/src/in-memory-prompt-registry.ts:18`) implements
  A/B selection (`selectActive`, `:52`), `{{var}}` interpolation (`:57`), and EMA scoring
  (`:66-73`). This is a real, working publish-and-version content unit. It is **🔶**: the live
  `OfflineAIManager` switches on hardcoded `request.promptRef?.key` strings
  (`apps/web/src/ai.ts:38-50`), so the live path never consults the registry.

- **AI model registry** — the model for a "model package" and for the `register()` extension mechanism
  a package would use. `INSTALLED_MODELS` seeds twelve local models as **data**
  (`packages/ai-manager/src/model-registry.ts:10`); `InMemoryModelRegistry` (`model-registry.ts:50`)
  exposes a runtime `register(model)` (`model-registry.ts:57`) and a `detectInstalled()` stub
  (`model-registry.ts:77`). "Add a model" is genuine data-driven code, not a hardcoded switch. It is
  **🔶**: apps/web selects a model via the `AI_MODEL` env var (`apps/web/src/ai-factory.ts:31`),
  bypassing the registry — nothing on the live path installs a model *through* it.

- **Declarative workflow / playbook shape** — the model for a "workflow package" that is data, not
  code (which is what makes it safe under Law 4). The `Sop` interface
  (`domains/corporate-os/src/sop.ts:24`) is keyed, carries a `version` (`sop.ts:26`) and
  `steps: SopStep[]` (`sop.ts:29`) built from `SopStep` (`sop.ts:12`), and is served by a
  `SopEnginePort` with `get/list/publish/start` (`sop.ts:35`) including a `publish()` method
  (`sop.ts:38`). It is **🔶** — and the weakest of the three anchors: ports and types only, with no
  engine and no wiring. A declarative Sop is a definition, not an executable plugin; that is exactly
  the property Law 4 requires of a packageable workflow.

Two further shells are namespace-only and should not be mistaken for infrastructure:
`domains/connector-hub/src/events.ts` and `domains/workflow-engine/src/events.ts` reserve event names
with zero implementation and no wiring. They are reserved namespaces, not a plugin system.

### The ❌ roadmap — the ecosystem proper, not yet built

Everything that makes these anchors into an *ecosystem* is roadmap, and carries no code citation
because there is no code to cite:

- The **installable package** itself — the manifest / envelope / install-and-remove lifecycle / content
  versioning envelope that Law 2 requires. The 🔶 anchors are versioned *content*; the installable
  *unit* around them does not exist.
- The **trust boundary** in code — signing, licensing, compatibility checks, and hash-validation for
  ecosystem content (Law 3). The nearest real primitive is backup integrity hashing — `sha256()`
  (`packages/backup/src/archive.ts:18-19`), per-entry `checksum` (`archive.ts:38`), verify-on-restore
  (`archive.ts:108`) — and it is worth naming precisely so it is not overclaimed: that is **backup
  integrity, not content trust.** AdOS has a sha256 primitive for backups; ecosystem signing,
  validation, and licensing must still be built.
- **Templates and playbooks** as packageable units — brief, campaign, report, and creative templates,
  and playbooks (only design docs exist today, not code).
- **Partners and certification** — publishers, certified partner content, and training delivery. Design
  docs exist under `partner/*.md` as design intent; no partner or publisher code exists.
- **The marketplace** — catalog, listing, discovery, and distribution. One subset of the ecosystem,
  and entirely roadmap.
- **The extension-point framework** — a first-class, safe seam a package could attach to. Today the
  composition root takes only `bus`, `ai`, and `repos` (`apps/web/src/app.ts:69-72`); the sole attach
  seam is the wildcard event subscription (`app.ts:120`, `subscribe('>')`). A real extension-point
  framework is net-new work.
- **The community layer** — ratings, reviews, and contributions.
- **The developer SDK** — a published surface for building packages against defined extension points.

The honest headline, stated once more so it cannot be missed: **Book H is a design for an ecosystem,
built on three 🔶 patterns and otherwise ❌ roadmap. No ecosystem feature ships in the live app
today.** The ledger:

| Ecosystem surface | Tier | Grounding |
|---|---|---|
| Versioned, publishable prompt content unit | 🔶 | `prompt.ts:9`/`:14`/`:25`/`:27`; `in-memory-prompt-registry.ts:18`, `:52`, `:57`, `:66-73` |
| Data-driven model registry + `register()` | 🔶 | `model-registry.ts:10`/`:50`/`:57`/`:77` |
| Declarative workflow (`Sop`) shape (ports/types) | 🔶 | `sop.ts:24`/`:26`/`:29`/`:35`/`:38` |
| Installable-package manifest / install-remove lifecycle | ❌ | — |
| Trust: signing / licensing / compatibility / hash-validation | ❌ | — (backup sha256 exists but is *backup integrity*, not content trust) |
| Templates & playbooks as packages | ❌ | — |
| Partners / certification / training content | ❌ | — |
| Marketplace: catalog / listing / discovery / distribution | ❌ | — |
| First-class extension-point framework / SDK | ❌ | — |
| Community: ratings / reviews / contributions | ❌ | — |

So **"AdOS has an ecosystem" is the design Book H specifies — not a capability AdOS has today.** The
shipped reality is three proven content-and-registry patterns; the rest is specification, honestly
tiered against the current code.

---

## The AdOS Architecture

This is the official one-page final reference diagram for the entire A–H series. Three tiers, connected
in one downward direction — the frozen Core Operating System, the Ecosystem Platform that grows around
it, and Series 2, the forward discipline that governs everything after. Every layer reads the one above
it and changes none of it.

```
┌───────────────────────────────────────────────────────────────────────────┐
│  TIER 1 — Core Operating System                    (frozen: A–G, v1.0)      │
│                                                                             │
│    Book A     Book B     Book C     Book D     Book E     Book F     Book G  │
│  (Workflow) (Production)(Explain.) (Memory) (Judgement)(Orchestr.)(Observ.) │
└───────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  TIER 2 — Ecosystem Platform                (Book H: extends, never rewrites)│
│                                                                             │
│    Packages     Templates     Models     Prompt Packs     Workflow Packs    │
│    Brand Packs     Creative Packs     Benchmarks                            │
│    Partners     Marketplace     Community     Developers                    │
└───────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  TIER 3 — Series 2                                                           │
│                                                                             │
│                    Implementation Before Documentation                      │
└───────────────────────────────────────────────────────────────────────────┘
```

This diagram is the **official reference for the entire series.** Tier 1 is the frozen core and its
observability — the seven books that do the work and render it. Tier 2 is the ecosystem that grows
around Tier 1 without reaching into it. Tier 3 is not a book; it is the discipline that governs every
change from here forward. Read the arrows in one direction only: the ecosystem depends on the core, and
Series 2's discipline governs how both move. Nothing flows back up. The core never depends on the ring
around it, and the ring never rewrites the core.

---

## 4. The series is complete at H010

With this document, the A–H book series is **complete.** Eight books, from the agency workflow to the
ecosystem that surrounds the whole platform, are written and honestly tiered. There is no Book I, and
there is no Part 6. The design surface of AdOS — what the platform is, what each layer owns, and what
each layer may and may not do — is fully specified, and the specification is closed.

Closed does not mean built. The series is complete as a *specification*; it is not complete as a
*shipped product*, and it never claimed to be. That gap — between a full design and a partial
implementation — is not a defect to hide at the close. It is the precise thing the three-tier model
exists to measure, book by book, so that at no point does the map get mistaken for the territory. The
series ends with the map drawn in full and the territory honestly marked: here is what runs, here is
what is built-but-unwired, here is what is still only a contract.

This is also why Book H is the *right* place to close. There was nothing to build an ecosystem around
until the core was complete and frozen, and nothing to render an ecosystem *against* until Book G made
the core observable. The order of the series is its own argument: A gives the workflow, B–E fill it, F
runs them, G renders them, and only then — with a whole, frozen, observable platform — is there
something an ecosystem can extend without redefining. H could not have come earlier, and nothing
coherent comes after it as a *design*. The map is complete.

What ends at H010 is the *writing of design books.* The forward motion of AdOS does not end here — it
changes discipline.

---

## 5. Series 2 = real code only — the forward discipline

Law 6 — Implementation Before Documentation — is the law that reaches past Book H. The first five laws
govern how the ecosystem relates to the core; Law 6 governs how the *series* relates to reality, and it
binds everything that comes after H. Its practice has a name: **Series 2 = real code only.**

The rule is a strict order of operations, and it reverses the temptation that every design series
carries — the temptation to write the shipped-sounding sentence before the shipping code exists. After
Book H, that order is fixed:

1. **Implement.** A capability is written as real code with real tests. Not specified — built.
2. **Verify.** The implementation is exercised on a live path and confirmed to run.
3. **Update PRODUCT_TRUTH.md.** The single source of truth is revised to record the new reality — the
   citation, the wired path, the tier change.
4. **Then, and only then, revise the book.** The relevant book's 🔶 or ❌ sections are promoted **up**
   to ✅ — never before the code and the truth file agree.

Nothing in that sequence lets documentation move ahead of implementation. A book section may only be
promoted *up* a tier after the code exists, has been verified, and PRODUCT_TRUTH.md already reflects it.
This is the code-level expression of the discipline the whole series has held: **reality first, then
documentation, then marketing.** It is why the tier tags in this book are trustworthy — every ✅ in the
series is earned in code before it is earned in prose, and the 🔶 and ❌ tags are promises the code has
not yet kept, marked as such.

To make the discipline concrete, take the strongest 🔶 anchor in Book H — the prompt registry — and
trace its promotion. Today it is **🔶**: the versioned, scorable content unit is real
(`prompt.ts:9`, `in-memory-prompt-registry.ts:18`), but the live `OfflineAIManager` switches on
hardcoded keys (`apps/web/src/ai.ts:38-50`) and never consults it. Under Series 2, promoting it to ✅ is
not a documentation edit. It is: (1) **implement** the wire — route the live path through
`PROMPT_REGISTRY` instead of the hardcoded switch; (2) **verify** it on a live run — confirm a published
template is actually selected and interpolated in the running app; (3) **update PRODUCT_TRUTH.md** to
record the newly wired path and citation; and only then (4) **revise** the relevant book section from
🔶 up to ✅. If any step is skipped — if the book is edited before the wire exists — Law 6 is broken and
the tag is a lie. The order is the guarantee.

Series 2 is therefore not a new book to write. It is a discipline to keep. The productive work after
H010 is not more chapters; it is wiring the 🔶 anchors onto live paths and building the ❌ roadmap into
code — and each time one lands, the flow above turns a tier tag from a promise into a fact. The freeze
principle of [`../../ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md) guarantees this can
happen safely: because the core is frozen, ecosystem work can proceed without the foundation shifting
underneath it, and each promotion up a tier is a local, verifiable change against a fixed contract.

---

## 6. Boundaries (unchanged, and reaffirmed at the close)

The ecosystem does not relax a single boundary of the series. It inherits every one of them, and the
trust laws exist precisely to keep them intact as packages are added:

- **100% local, offline-first.** An installable package is a **local artifact.** Adding a package pulls
  no cloud dependency and opens no external connection; the platform runs on the agency's own machine,
  package or no package.
- **Copy-only, no external data, no vendor telemetry.** A package adds content and definitions beside
  the core; it emits nothing off-device. The ecosystem sends no data to any vendor, and installing a
  package changes that not at all.
- **Human-sovereign.** No package auto-approves anything. The human gate is the core's, and the
  ecosystem holds no authority to cross it.
- **Not an autonomous agent.** Law 4 (No Hidden Execution) is what keeps this true under an ecosystem: a
  package uses only defined extension points and runs no hidden code inside the core. A declarative
  workflow package is *data*, not an improvised path.
- **Core isolation.** Law 1 and Law 5 together mean adding a package never changes how the core decides.
  Remove every package and the core runs exactly as specified — which is the whole point of Law 2.

The trust boundary (Law 3) and no-hidden-execution (Law 4) are not overhead on top of these boundaries;
they are how the boundaries survive an ecosystem. They exist so that adding packages never weakens the
local, sovereign, auditable guarantees of the core.

---

## 7. Value contribution

A frozen, trustworthy core plus an independently-growing ecosystem is what makes AdOS a durable
platform an agency can build a business on. The value lands on both sides of the ledger, and it is the
*combination* that delivers it — neither half alone.

**It reduces production time.** An agency that can install a proven prompt package, a benchmarked
workflow, or a tested campaign template does not rebuild that work from scratch. The versioned,
scorable content unit already proven in the prompt registry (`prompt.ts:9`) is the seed of exactly this
saving: a unit of proven work, published once and reused across missions, rather than re-authored each
time. When the installable envelope and the marketplace are built onto that seed, the saving compounds —
best-practice content arrives as a package instead of as a project.

**It increases agency revenue.** A platform whose core cannot silently move is a platform an agency can
standardize on and stake growth on. That is the deeper value of the freeze: an agency invests in
building on AdOS *because* the foundation is contractually fixed and the ecosystem around it can grow
without threatening that foundation. A partner can publish; a developer can extend; a marketplace can
distribute — and none of it can reach in and change how the core runs, because the laws forbid it. An
agency can therefore build durable, saleable capability on top of AdOS without betting on a foundation
that might shift. A trustworthy core is what makes the ecosystem safe to grow; an independently-growing
ecosystem is what makes the trustworthy core worth building on. Each makes the other valuable, and
together they make AdOS a platform rather than a tool.

The point of the whole synthesis, stated once more: Book H adds no new intelligence and no new decision
to the core. It surrounds a fixed center with components that can be added and removed without the
center ever moving. That — not a change to the core — is what turns a complete operating system into a
platform an enterprise agency can build a business on.

> **The ecosystem extends the core; it never rewrites the core.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
