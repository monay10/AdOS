# Book H · Part 5 — Community & Developers — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 5 draws Book H — and the entire A–H series — to its close: the developer surface where packages are
authored, and the final synthesis that draws A–H together and hands the future to Series 2. It is a
**design & architecture specification**; every capability is tiered **✅ / 🔶 / ❌**. Documentation only.

> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| H009 | [`DEVELOPER_PLATFORM.md`](DEVELOPER_PLATFORM.md) | The developer surface — extension points, the `register()` seed, the package SDK, the extension-point contract, and the community layer | 🔶/❌ |
| H010 | [`THE_ECOSYSTEM_PLATFORM.md`](THE_ECOSYSTEM_PLATFORM.md) | A–H synthesis and the close of the series — the official `The AdOS Architecture` diagram and Series 2 | ❌ mostly |
| — | [`PART_5_VALIDATION.md`](PART_5_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 5 establishes

- **The developer surface, named in full.** A developer platform, fully built, provides three things:
  **defined extension points** (the named, finite seams a package may attach to), a **package SDK** (the
  types, manifest schema, validation harness, and fixtures that make authoring a supported workflow), and
  a **published contract** (a stable, versioned promise the platform keeps across core versions). H009
  fixes the shape of all three and refuses to blur what exists into what does not.
- **The registration shape is real (🔶).** The codebase already contains the exact gesture a package
  install would make: a family of `register()` methods in the AI Manager — `register(model)` on the
  data-driven `INSTALLED_MODELS` seed, plus the sibling capability and tool registries — where a typed
  unit of extension is added to a running collection through a single defined call. It is the seed of a
  developer surface, written as real tested code, not the surface itself.
- **The developer is a disciplined citizen.** H009 maps the package author to the laws by construction:
  builds beside the core (Law 1), through defined seams only (Law 4), shipping additions not rewrites
  (Law 5), carrying a signed manifest (Law 3), and documenting only what the code does (Law 6). The
  developer platform exists to make that citizenship the path of least resistance.
- **The A–H synthesis, and the official architecture.** H010 draws the whole series into one picture — a
  frozen A–G core, an ecosystem ring that extends it beside three real 🔶 anchors with the rest ❌ — and
  carries the section titled exactly `## The AdOS Architecture`: the one-page final reference diagram
  (Core Operating System → Ecosystem Platform → Series 2) that becomes the official reference for the
  entire series. **This closes Book H and the A–H series.**

## 3. Honest limitations

- **A first-class extension point is ❌.** The composition root takes only `bus`, `ai`, and `repos`; there
  is no plugin array and no `register(...)` hook. The one seam that exists — the wildcard event
  subscription `subscribe('>')` — gives a package a read-only window onto activity, not a seat at the
  table. A real, safe extension point is net-new work, and the `register()` methods are internal, trust
  the descriptor they are handed completely, and carry no contract promising they will persist.
- **The package SDK is ❌.** No typed extension interfaces published as an SDK, no manifest builder or
  validator, no local test harness. Without it, package authoring is undefined — the raw material exists,
  the supported path does not.
- **The extension-point contract is ❌.** No stable, versioned, public promise about which seams exist and
  what the platform guarantees. The §3 seed lives inside an in-memory adapter explicitly described as
  swappable; an implementation detail is not a contract a serious developer can commit to.
- **The community layer is ❌.** Ratings, reviews, contributions, and reputation — the social layer that
  turns a developer surface into a developer *ecosystem* — do not exist in code and are cited nowhere.
  They are the roadmap's furthest horizon, valuable to specify, not present to claim.
- **No ✅ ecosystem feature ships in the live app.** Book H is a design built on three 🔶 patterns (prompt
  content, the model registry, the declarative `Sop` shape) and is otherwise ❌ roadmap. The synthesis
  states this plainly rather than letting "AdOS has an ecosystem" stand as though it were shipped.

## 4. Value contribution

The developer platform maps to both value levers, and it maps to them more powerfully than any other
surface in Book H, because it adds a *mechanism that compounds*. A developer community lets other people
author content the agency can install — prompt packages, model packages, workflows, templates,
benchmarks — so the content supply that is the raw material of agency **revenue** grows on a curve the
agency does not have to draw alone, and the community layer curates the best of it. Defined extension
points and a published contract replace reverse-engineering internals with a happy path, cutting
integration and **production time** twice: once when a package is first built against a known contract,
and again on every core update the contract carries it safely across. A frozen core plus an
independently-growing ecosystem is what an enterprise agency builds a business on rather than a bundle of
tools it merely uses — each half makes the other valuable.

## 5. Governance

[`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md)
governs this part; the directional rule that the ecosystem *extends* the core but never rewrites it is
fixed by [`../../ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md) and, going forward, by Law
6. Every addition must tier-tag each capability, trace 🔶 claims to code, leave ❌ claims uncited, and
re-run [`PART_5_VALIDATION.md`](PART_5_VALIDATION.md) before release. The invariant holds throughout:

> **The ecosystem extends the core; it never rewrites the core.**

## 6. Book H complete — the A–H series closed — the flagship follows

With Part 5 released, **Book H — AdOS Ecosystem Platform is complete**, and with it the **A–H book series
is officially closed at H010**. There is no Book I and no Part 6. The design surface of AdOS — what the
platform is, what each layer owns, and what each layer may and may not do — is fully specified, honestly
tiered, and closed. Closed does not mean built: the series ends as a specification with the
implementation gap marked, not hidden, which is exactly what the three-tier model exists to measure.

What ends at H010 is the *writing of design books.* The forward motion changes discipline to **Series 2 =
Implementation Before Documentation** — implement, verify, update PRODUCT_TRUTH.md, and only then promote
a book's 🔶 or ❌ section up to ✅. The next milestone is the **flagship ecosystem-platform release** that
publishes Book H as a whole and marks the close of the entire A–H series — reality first, then
documentation, then marketing.

**Status: ✅ Released — Community & Developers v1.0.0. Book H closed. The A–H series closed at H010.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
