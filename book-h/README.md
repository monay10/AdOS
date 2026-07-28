# BOOK H — AdOS Ecosystem Platform (the Ecosystem Layer)

The layer that grows value **around** the core. Books A–G are the frozen core operating system and
its observability — the [**AdOS Core Specification v1.0**](../ADOS_CORE_SPECIFICATION.md) plus G.
**Book H is everything an agency, a partner, or a developer can build on top of it** — packages,
templates, models, prompt packs, workflow packs, brand/creative packs, benchmarks, partners, a
marketplace, a community, and a developer platform — without ever changing the core.

> **The ecosystem extends the core; it never rewrites the core.** A Marketplace is only one small
> subset of this layer, which is why the book is the **Ecosystem Platform**, not a marketplace.

> **Single source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Book H is a **design &
> architecture specification**, not a claim of shipped capability. Every capability is tagged
> **✅ SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing unbuilt is claimed as shipped.
>
> **Start here:**
> [`1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md)
> — the six governing laws.

---

## The one sentence to remember

> **The ecosystem extends the core; it never rewrites the core.**

## The layer flow

```
Core → Packages → Templates → Partners → Marketplace → Community → Developers
```

Value grows outward from a fixed center. The core does not depend on the ecosystem; the ecosystem
depends on the core and leaves it exactly as specified.

## The six governing laws

1. **Core Isolation Law** — no ecosystem package may modify the Core Specification (A–G).
2. **Package Independence** — every package installs *and* removes on its own; remove it and the
   core keeps running.
3. **Trust Boundary** — nothing from the marketplace is auto-trusted; every package carries
   Publisher · Version · Signature · Compatibility · License · Hash · Validation Status.
4. **No Hidden Execution** — no package runs hidden code in the core; only defined extension points.
5. **Ecosystem Never Rewrites Core** — a package may only *add* a template / workflow / prompt /
   benchmark / playbook; never change Pipeline / Memory / Analytics / Evidence.
6. **Implementation Before Documentation** — no roadmap capability is promoted to shipped
   documentation until the implementation exists and PRODUCT_TRUTH.md has been updated.

## The five parts

| Part | What it covers | Tier posture |
|---|---|---|
| [`1-ecosystem-foundations/`](1-ecosystem-foundations/) | The constitution; the package model & manifest | governing · 🔶/❌ |
| [`2-packages-and-templates/`](2-packages-and-templates/) | Content packages; templates & playbooks | 🔶/❌ |
| [`3-trust-and-isolation/`](3-trust-and-isolation/) | The trust boundary; the core extension model | ❌ |
| [`4-partners-and-marketplace/`](4-partners-and-marketplace/) | Partners & certification; the marketplace (a subset) | ❌ |
| [`5-community-and-developers/`](5-community-and-developers/) | The developer platform; the A–H synthesis | 🔶/❌ |

Each part has its own `README.md`, a validation report (all **✅ PASS**), and a release. The
flagship summary is [`BOOK_H_RELEASE.md`](BOOK_H_RELEASE.md).

## The honest baseline

**No ecosystem feature is wired into the live app today.** Book H is almost entirely a
specification. Its strongest real anchors are **🔶 BUILT (UNWIRED)**: the versioned, scored,
publishable **prompt registry**
([in-memory-prompt-registry.ts:18](../domains/prompt-registry/src/in-memory-prompt-registry.ts#L18)),
the data-driven **model registry** with a runtime `register()`
([model-registry.ts:57](../packages/ai-manager/src/model-registry.ts#L57)), and the declarative
**`Sop`** workflow shape ([sop.ts:24](../domains/corporate-os/src/sop.ts#L24)) — real code+tests,
none reached by the live app. Everything else — the installable-package envelope, trust/signing/
licensing, partners, the marketplace, a first-class extension point, the developer SDK, and the
community layer — is **❌ ROADMAP**. Book H says so on every page. That honesty is Law 6 in action.

## Inviolable boundaries

**100% local** · **copy-only** · **no external data** · **no vendor telemetry** · **human-sovereign**
· **not an autonomous agent**. The ecosystem must never weaken these: the Trust Boundary and
No-Hidden-Execution laws exist precisely so that adding third-party packages keeps the platform
local, sovereign, and auditable.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
