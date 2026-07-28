# Book H · Part 2 — Packages & Templates — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 2 defines what an agency can carry into the ecosystem: the *content* it installs and the
*process* it shapes. It holds Book H's two strongest real anchors — the versioned/scored prompt
registry and the data-driven model registry, both 🔶 BUILT (UNWIRED) — and it names every other
category ❌ ROADMAP rather than dressing intent as delivery. It is a **design & architecture
specification**; every capability is tiered **✅ / 🔶 / ❌**. Documentation only.

> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| H003 | [`CONTENT_PACKAGES.md`](CONTENT_PACKAGES.md) | Prompt · AI model · brand · creative · benchmark content packages | 🔶 / ❌ |
| H004 | [`TEMPLATES_AND_PLAYBOOKS.md`](TEMPLATES_AND_PLAYBOOKS.md) | Templates · playbooks · workflow packages; declarative-not-executable principle | 🔶 / ❌ |
| — | [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 2 establishes

- **Prompt packages have a real content shape (🔶):** a `PromptTemplate` is already a versioned,
  scorable content unit (`prompt.ts:9`, `score?` `:14`) served through `PromptRegistryPort`
  (`prompt.ts:21`) with `publish` (`:25`) and `score` (`:27`); the adapter
  `InMemoryPromptRegistry` (`in-memory-prompt-registry.ts:18`) versions natively, selects the
  active version by merit (`selectActive` `:52`), interpolates `{{var}}` as data (`:57`), and
  learns quality from outcomes via an EMA (`:66-73`). Installing a package is a sequence of
  `publish` calls; removing it drops keys and the registry serves the rest.
- **AI model packages have a real content shape (🔶):** models are expressed as data —
  `INSTALLED_MODELS` (`model-registry.ts:10`) — and installed at runtime through `register(model)`
  on `InMemoryModelRegistry` (`:50`, `:57`), where a descriptor is read by capability, not run as
  code. "Add a model" is a data operation, and `detectInstalled` (`:77`) is the seam a production
  adapter would fill.
- **Workflow packages have a real declarative shape (🔶):** a `Sop` (`sop.ts:24`, versioned `:26`)
  is an ordered set of `SopStep`s (`:12`) with owners, gates, and outputs — a specification, not a
  subroutine — publishable through `SopEnginePort.publish` (`sop.ts:38`). The shape and contract are
  built; the engine that would run them is not.
- **The declarative-not-executable principle (the spine of H004):** a template, a playbook, and a
  workflow package are all *definitions — data that describes work* — never plugin code that
  performs it. Because a definition carries no code, it satisfies **No Hidden Execution (Law 4)** by
  the absence of anything to run, and it can only **ADD (Law 5)** because it has no mechanism to
  rewrite. This is what makes packaging content and process the *safe* part of the ecosystem to
  build first.

## 3. Honest limitations

- **No ecosystem feature is live.** Both 🔶 anchors are BUILT (UNWIRED): the live app never reads
  the prompt registry — `OfflineAIManager` switches on a hardcoded `request.promptRef?.key`
  (`ai.ts:38-50`) — and never selects a model through the model registry — `createAIManager` reads
  the `AI_MODEL` env var (`ai-factory.ts:31`). The content shapes are real; the wiring from a
  published package to a running mission is **❌ net-new work**.
- **Brand, creative, and benchmark packages are ❌ ROADMAP.** No code, no citation. Creative content
  is bounded to copy-only text by the platform's boundary; the `packages/bench/` directory is
  engineering performance benchmarking, explicitly *not* marketing benchmark data, and must not be
  cited as an anchor.
- **Templates and packageable playbooks are ❌ ROADMAP.** There is no template system — today's
  report generation is AI-driven, with no stored, packageable shape behind it — and playbooks exist
  only as narrative documents, not as installable, versionable definitions.
- **The workflow execution engine is ❌ ROADMAP.** `SopEnginePort` (`sop.ts:35`) is a port with no
  implementation behind it and no live path; a genuinely installable-and-runnable workflow package
  sits on a real declarative foundation (🔶) with an unbuilt execution floor (❌).

## 4. Value contribution

Both documents map to the two value levers, honestly qualified as mostly *potential* value under Law
6. **They grow agency revenue by making quality and expertise portable:** a prompt set, a model
capability, a brand voice, a proven angle, a market benchmark, a launch playbook, a campaign
workflow — each is content or process an agency builds once and reuses across its whole book, and a
reusable, provable asset is a moat a fork can never be. **They cut production time by turning
improvement into installation:** with the wiring the 🔶 categories point toward, improving how the
core generates becomes *publishing a prompt version* or *registering a model* rather than a code
change and a redeploy, and a packaged process collapses "re-derive how to do it" into "fill the
shape / follow the declared `Sop`." The levers compound because every unit is additive and
independent (Law 2): the library grows without ever destabilising the core.

## 5. Governance

[`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md)
governs this part; the ecosystem layer is itself governed by
[`../../bizops/RELEASE_GOVERNANCE.md`](../../bizops/RELEASE_GOVERNANCE.md). Every addition must
tier-tag each capability, cite code for ✅/🔶 claims and none for ❌, keep the declarative-not-
executable line intact, and re-run
[`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) before release. Under Law 6, no category may be
promoted a tier until the implementation exists and `PRODUCT_TRUTH.md` records it.

> **The ecosystem extends the core; it never rewrites the core.**

**Status: ✅ Released — Packages & Templates v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
