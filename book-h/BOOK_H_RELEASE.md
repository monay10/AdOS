# BOOK H — AdOS Ecosystem Platform — Release (the ecosystem layer)

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — all 5 parts validated PASS, aligned to `../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Builds on AdOS Core Specification v1.0 + Book G
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

Book H is the **ecosystem** layer — everything an agency, a partner, or a developer builds *around*
the frozen A–G core: packages, templates, models, prompt/workflow/brand/creative packs, benchmarks,
partners, a marketplace, a community, and a developer platform. It extends the core; it never
changes it. **A Marketplace is only one small subset of this layer** — which is why the book is the
Ecosystem Platform, not a marketplace.

> **The ecosystem extends the core; it never rewrites the core.**

Book H is **documentation only** and scrupulously honest: every capability is tagged **✅ SHIPPED**,
**🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing unbuilt is claimed as shipped — and here that
matters most, because **no ecosystem feature ships today.**

---

## 1. The six governing laws

| Law | Statement |
|---|---|
| **1 — Core Isolation** | No ecosystem package may modify the Core Specification (A–G). |
| **2 — Package Independence** | Every package installs *and* removes standalone; the core runs without it. |
| **3 — Trust Boundary** | Nothing is auto-trusted; every package carries Publisher · Version · Signature · Compatibility · License · Hash · Validation Status. |
| **4 — No Hidden Execution** | No package runs hidden code in the core; defined extension points only. |
| **5 — Ecosystem Never Rewrites Core** | A package may only *add* a template / workflow / prompt / benchmark / playbook. |
| **6 — Implementation Before Documentation** | No roadmap capability is promoted to shipped documentation until the implementation exists and PRODUCT_TRUTH.md is updated. |

**The layer flow:** Core → Packages → Templates → Partners → Marketplace → Community → Developers.

## 2. The three tiers (the spine)

| Tier | Meaning |
|---|---|
| **✅ SHIPPED** | Runs in the live app today; cited to wired code. |
| **🔶 BUILT (UNWIRED)** | Code exists and is unit-tested, but no running path reaches it. |
| **❌ ROADMAP** | No implementation; pure specification. |

## 3. The five parts

| Part | Directory | Content docs | Focus | Tier posture |
|---|---|---|---|---|
| 1 · Ecosystem Foundations | [`1-ecosystem-foundations/`](1-ecosystem-foundations/) | 2 (incl. constitution) | Six laws; the package model & manifest | governing · 🔶/❌ |
| 2 · Packages & Templates | [`2-packages-and-templates/`](2-packages-and-templates/) | 2 | Content packages; templates & playbooks | 🔶/❌ |
| 3 · Trust & Isolation | [`3-trust-and-isolation/`](3-trust-and-isolation/) | 2 | Trust boundary; the core extension model | ❌ |
| 4 · Partners & Marketplace | [`4-partners-and-marketplace/`](4-partners-and-marketplace/) | 2 | Partners & certification; the marketplace | ❌ |
| 5 · Community & Developers | [`5-community-and-developers/`](5-community-and-developers/) | 2 | The developer platform; the A–H synthesis | 🔶/❌ |

**10 content documents + 5 part-validations + 5 part-releases + 6 READMEs = 26 documents.** Each
part carries its own validation (all **PASS**) and release.

## 4. The honest baseline — no ecosystem feature ships today

Book H is almost entirely a specification. This is stated plainly on every page and is Law 6 in
action. There is **no ✅ SHIPPED ecosystem capability.**

## 5. The 🔶 anchors Book H builds on (already coded, dormant)

- **Prompt registry** — versioned, scored, publishable prompt content units
  ([in-memory-prompt-registry.ts:18](../domains/prompt-registry/src/in-memory-prompt-registry.ts#L18),
  `PromptRegistryPort` [prompt.ts:21](../packages/contracts/src/ai/prompt.ts#L21)). The live path
  bypasses it ([ai.ts:38](../apps/web/src/ai.ts#L38)).
- **Model registry** — data-driven `INSTALLED_MODELS` + a runtime `register()`
  ([model-registry.ts:57](../packages/ai-manager/src/model-registry.ts#L57)); the app selects by env
  instead ([ai-factory.ts:31](../apps/web/src/ai-factory.ts#L31)).
- **Declarative workflow shape** — the versioned `Sop`
  ([sop.ts:24](../domains/corporate-os/src/sop.ts#L24)), ports/types only, no engine.
- **A registration *shape*** — sibling `register()` methods in capability/tool registries — the seed
  of a developer surface, all unwired.

## 6. What is ❌ ROADMAP

The installable-package envelope, manifest, and install/remove lifecycle; ecosystem
trust/signing/licensing/hash-validation (the only hash primitive is backup integrity,
[archive.ts:18](../packages/backup/src/archive.ts#L18) — *not* content trust); brand/creative/
benchmark packages; report/brief/creative templates; playbooks-as-code; partners, certification,
training content; the marketplace catalog/listing/distribution; a first-class composition-root
extension point (the constructor takes only bus/ai/repos,
[app.ts:69](../apps/web/src/app.ts#L69)); the developer SDK; and the community layer.

## 7. Value contribution

A frozen, trustworthy core plus an ecosystem that grows independently around it is what turns AdOS
from a product into a **platform an agency can build a business on**. Packages and templates cut
production time (reuse instead of rebuild); a certified partner and developer ecosystem multiplies
content supply and reach (revenue) — all without ever putting the core's local, sovereign,
auditable guarantees at risk, because the Trust Boundary and No-Hidden-Execution laws hold the line.

## 8. Validation

All five part-validation reports record **PASS** across the six laws, three-tier discipline,
code-citation accuracy, the invariant sentence, boundary discipline, and documentation-only
hygiene. Every cross-reference across the 26 documents resolves; the forbidden legacy label
"Advertising Operating System" appears nowhere as a product name; PRODUCT_TRUTH.md was not modified.

## 9. The A–H series is complete — and what comes next

**Book H closes the A–H series at H010.** With A–H, AdOS has a full specification: a frozen core
operating system (A–F), its observability layer (G), and its ecosystem layer (H). The official
one-page reference is **`## The AdOS Architecture`** in
[`5-community-and-developers/THE_ECOSYSTEM_PLATFORM.md`](5-community-and-developers/THE_ECOSYSTEM_PLATFORM.md).

From here, the discipline changes — this is **Series 2 = real code only**, and it is now
constitutional (Law 6): a feature is first **implemented**, then **verified**, then
**PRODUCT_TRUTH.md is updated** — and only then are the relevant book's 🔶/❌ sections revised up to
✅. No new design books. Reality first, then documentation, then marketing.

---

## 10. Governance

[`1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md)
is binding on every Book H artifact; the core it extends is frozen by
[`../ADOS_CORE_SPECIFICATION.md`](../ADOS_CORE_SPECIFICATION.md). Any addition must tier-tag each
capability, trace ✅ claims to code, and — per Law 6 — never promote a roadmap capability to shipped
documentation before the implementation and PRODUCT_TRUTH.md exist.

**Status: ✅ Released — AdOS Ecosystem Platform v1.0.0. The A–H series is complete.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
