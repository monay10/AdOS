# Book H · Part 2 — Packages & Templates — Validation

> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). Governing document:
> [`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md).
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

Validation of Part 2 — the part that carries Book H's two strongest anchors. The check here is not
"does it ship" (no ecosystem feature does) but "is every tier honest": the prompt and model
registries are genuine 🔶 BUILT (UNWIRED) shapes with real citations, and everything else is named
❌ ROADMAP with no citation. On that standard — reality stated exactly — the result is **✅ PASS**.

---

## 1. Scope validated

| # | Document | Purpose | Tier focus |
|---|---|---|---|
| H003 | [`CONTENT_PACKAGES.md`](CONTENT_PACKAGES.md) | Prompt · AI model · brand · creative · benchmark content packages | 🔶 / ❌ |
| H004 | [`TEMPLATES_AND_PLAYBOOKS.md`](TEMPLATES_AND_PLAYBOOKS.md) | Templates · playbooks · workflow packages; declarative-not-executable principle | 🔶 / ❌ |

## 2. Checks

| Check | Result | Notes |
|---|---|---|
| Prompt packages grounded as 🔶 | ✅ PASS | Content shape is real: versioned/scored `PromptTemplate` (`prompt.ts:9`, `score?` `:14`) served through `PromptRegistryPort` (`prompt.ts:21`), with `publish` `:25` / `score` `:27`; adapter `InMemoryPromptRegistry` (`in-memory-prompt-registry.ts:18`), `selectActive` `:52`, `interpolate` `:57`, EMA `score` `:66-73`. Tagged 🔶, not ✅. |
| Prompt-package UNWIRED gap named | ✅ PASS | Doc states the live path never reads the registry — `OfflineAIManager` switches on a hardcoded `request.promptRef?.key` (`ai.ts:38-50`); wiring is called out as ❌ net-new. No ✅ claim. |
| AI model packages grounded as 🔶 | ✅ PASS | `INSTALLED_MODELS` seed-as-data (`model-registry.ts:10`), `InMemoryModelRegistry` (`:50`), runtime `register(model)` (`:57`), `detectInstalled` seam (`:77`). Descriptors are data read by capability, not code. Tagged 🔶. |
| AI-model UNWIRED gap named | ✅ PASS | Doc states the live app selects a model via the `AI_MODEL` env var in `createAIManager` (`ai-factory.ts:31`), bypassing the registry; live wiring is ❌ net-new. No ✅ claim. |
| Brand / creative / benchmark = ❌ | ✅ PASS | Each tagged ❌ ROADMAP with **no citation**. Creative correctly bounded to copy-only text; the `packages/bench/` directory is explicitly ruled out as engineering (not marketing) benchmarking so it cannot be mis-cited as an anchor. |
| Templates = ❌ | ✅ PASS | No template system; the doc distinguishes today's AI-driven report generation from a stored, packageable template shape and cites nothing. Four kinds (brief/campaign/report/creative) reserved as ❌ only. |
| Playbooks = ❌ as code | ✅ PASS | Playbooks named as narrative documents only; not installable/versionable/validatable; ❌ ROADMAP with no citation. |
| Workflow packages = 🔶, engine = ❌ | ✅ PASS | Declarative `Sop` (`sop.ts:24`, versioned `:26`, `steps` `:29`), `SopStep` (`:12`), `SopEnginePort` (`:35`, `publish` `:38`, `start` `:40`) are 🔶 ports/types; the doc keeps the *execution engine* separate as ❌ ROADMAP (no implementation behind the port). Two facts held apart, not merged. |
| No Hidden Execution (Law 4) satisfied by construction | ✅ PASS | Both docs establish the core principle: package payloads are **data, not executable code** — a prompt is an interpolated template (`in-memory-prompt-registry.ts:57`), a model is a descriptor, an `Sop` is named steps with no function body (`sop.ts:12`/`:29`). Declarative packaging has no code to run, so it satisfies Law 4 by absence of risk, not by sandboxing. |
| Ecosystem Never Rewrites Core (Law 5) | ✅ PASS | Every category is shown additive-only via the per-doc tables: prompt/model packages ADD a key or a descriptor; brand/creative/benchmark/template/playbook/workflow ADD a constraint, angle, baseline, shape, or step — none touches Pipeline / Memory / Analytics / Evidence. |
| Package Independence (Law 2) | ✅ PASS | Install-then-remove is traced in real code for the 🔶 anchors (drop a prompt version and the registry serves what remains; `setEnabled`/drop a descriptor removes a model cleanly) and asserted for the ❌ categories. |
| Implementation Before Documentation (Law 6) | ✅ PASS | No category is promoted above its reality: 🔶 only where code exists and wiring does not; ❌ carries no citation. Value sections claim design/potential, not delivery. |
| Boundaries | ✅ PASS | 100% local, own-content-only, no vendor telemetry, core-isolated — anchored to in-memory local registries; a package is a local artifact, never a remote fetch or a callback channel. |
| Invariant sentence | ✅ PASS | "The ecosystem extends the core; it never rewrites the core." present verbatim and prominent in both docs (multiple times each). |
| Citation accuracy / cross-refs | ✅ PASS | All cited `path:line` references resolve to types, ports, or adapters (not live paths); ❌ items carry none; cross-doc, package-model, and governing-doc links resolve. |
| Documentation-only hygiene | ✅ PASS | Only `book-h/2-packages-and-templates/` files added; no app code, packages, domains, or tests modified. |
| Forbidden legacy label | ✅ PASS | "Advertising Operating System" appears nowhere. |

## 3. Verdict

**✅ PASS.** Part 2 is honest at every tier. Its two 🔶 anchors — the versioned/scored prompt
registry and the data-driven model registry — are real, tested shapes cited to code, and both are
openly marked UNWIRED because the live path bypasses them. Every other concept (brand, creative,
benchmark, templates, playbooks, and the workflow execution engine) is tagged ❌ ROADMAP with no
citation. The declarative-not-executable principle is not a slogan but the reason the whole category
satisfies **No Hidden Execution** by construction: a package that carries no code has nothing hidden
to run. Nothing is presented as more built than it is, which is exactly the standard this validation
enforces.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
