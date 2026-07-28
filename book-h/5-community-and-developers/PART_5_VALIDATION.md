# Book H · Part 5 — Community & Developers — Validation

> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). Governing document:
> [`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md).
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

Validation of Part 5 — the developer platform and the ecosystem-platform synthesis that closes Book H
and the entire A–H series. Result: **✅ PASS**.

---

## 1. Scope validated

| # | Document | Purpose | Tier focus |
|---|---|---|---|
| H009 | [`DEVELOPER_PLATFORM.md`](DEVELOPER_PLATFORM.md) | The developer surface — extension points, the `register()` seed, SDK, contract, community layer | 🔶/❌ |
| H010 | [`THE_ECOSYSTEM_PLATFORM.md`](THE_ECOSYSTEM_PLATFORM.md) | A–H synthesis and the close of the series — the official architecture diagram and Series 2 | ❌ mostly |

## 2. Checks

| Check | Result | Notes |
|---|---|---|
| `register()` seed grounded 🔶 | ✅ PASS | The registration shape is real and unwired: `register(model)` ([model-registry.ts:57](../../packages/ai-manager/src/model-registry.ts#L57)) on the data-driven `INSTALLED_MODELS` seed ([model-registry.ts:10](../../packages/ai-manager/src/model-registry.ts#L10)), with sibling `register(def)` ([capability-registry.ts:37](../../packages/ai-manager/src/capability-registry.ts#L37)) and `register(tool)` ([tool-registry.ts:26](../../packages/ai-manager/src/tool-registry.ts#L26)). No live path reaches them — apps/web selects a model by env ([ai-factory.ts:31](../../apps/web/src/ai-factory.ts#L31)). |
| Extension point honest ❌ | ✅ PASS | The composition root takes only `bus`, `ai`, `repos` ([app.ts:69](../../apps/web/src/app.ts#L69)); no plugin array, no `register(...)` hook. The sole attach seam is the wildcard subscription `subscribe('>')` ([app.ts:120](../../apps/web/src/app.ts#L120)) — read-only observation, not a first-class extension point. A real one is ❌ net-new; no code cited for it. |
| SDK / contract / community honest ❌ | ✅ PASS | Package SDK, published extension-point contract, and the community layer (ratings, reviews, contributions) are ❌ ROADMAP; each is defined but carries no code citation because none exists. |
| Developer stays inside the laws | ✅ PASS | H009 §8 maps the author's obligations to Laws 1/4/5 (builds beside the core, through defined seams only, additions not rewrites) plus Law 3 (signed manifest) and Law 6 (documents only what the code does). |
| Architecture diagram present | ✅ PASS | H010 contains a section titled exactly `## The AdOS Architecture` with the one-page final reference diagram — Core Operating System (A–G) → Ecosystem Platform → Series 2, downward arrows only, every label preserved. Declared the official reference for the whole series. |
| Six laws honored | ✅ PASS | Both docs list the six laws via the header strip; H010 §2 recaps all six in full and H009 §8 applies the developer-facing subset. No law is contradicted or weakened; Law 6 is bound to Series 2. |
| Series 2 positioned | ✅ PASS | H010 §5 states Series 2 = Implementation Before Documentation as the forward discipline (implement → verify → update PRODUCT_TRUTH.md → then promote a book tier up), traced against the prompt-registry anchor. Framed as a discipline, not a new book. |
| Honest tier posture | ✅ PASS | H010 §3 states plainly no ✅ ecosystem feature is wired live; three 🔶 anchors (prompt registry, model registry, `Sop` shape) with real citations, everything else ❌ with none. The ledger table matches the tier model. |
| Core isolation preserved | ✅ PASS | Both docs affirm the one-way rule: the core does not depend on the ecosystem; the ecosystem depends on the core and leaves it exactly as specified. Ties to [`../../ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md). No package adds new intelligence or decision. |
| Series closed at H010 | ✅ PASS | H010 §4 declares the A–H series complete at H010 — no Book I, no Part 6 — as a specification, with the implementation gap marked, not hidden. |
| Value contribution | ✅ PASS | H009 §10 ties a developer community to compounding content supply (revenue) and defined extension points to cut integration time (production time); H010 §7 ties the frozen-core-plus-growing-ecosystem combination to both levers. |
| Boundaries preserved | ✅ PASS | Both docs reaffirm 100% local, offline-first, copy-only, no external data, no vendor telemetry, human-sovereign, not an autonomous agent; a package is a local artifact and the developer surface strengthens the boundaries rather than opening a channel out. |
| Citation accuracy / cross-refs | ✅ PASS | All 🔶 claims carry a real `path:line`; every ❌ carries none; all cross-book and cross-part links resolve. |
| Documentation-only hygiene | ✅ PASS | Only `book-h/5-community-and-developers/` files added; no app code, packages, domains, or tests touched. |
| Invariant sentence | ✅ PASS | *The ecosystem extends the core; it never rewrites the core.* present verbatim and prominent in both docs. |
| Forbidden legacy label | ✅ PASS | "Advertising Operating System" absent. |

## 3. Verdict

**✅ PASS.** Part 5 delivers the outermost ring of the ecosystem honestly: the `register()` registration
shape is real and cited (🔶), the extension point, SDK, contract, and community layer are named and left
uncited as ❌, and the developer is bound to Laws 1/3/4/5/6 by construction. The closing synthesis draws
A–H into one picture, carries the official `The AdOS Architecture` reference diagram, declares the series
complete at H010, and positions Series 2 — Implementation Before Documentation — as the forward
discipline. The map is drawn in full and the territory is marked without softening a single ❌.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
