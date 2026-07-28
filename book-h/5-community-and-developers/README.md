# Book H · Part 5 — Community & Developers

The outermost ring of the ecosystem, and the close of Book H and the whole A–H series: the developer
surface where packages are authored, and the final synthesis that draws A–H together and hands the
future to Series 2.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document:
> [`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md).
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`DEVELOPER_PLATFORM.md`](DEVELOPER_PLATFORM.md) | The developer surface — extension points, the `register()` seed, the package SDK, the extension-point contract, and the community layer | 🔶/❌ |
| [`THE_ECOSYSTEM_PLATFORM.md`](THE_ECOSYSTEM_PLATFORM.md) | A–H synthesis and the close of the series — the official `The AdOS Architecture` reference diagram and Series 2 | ❌ mostly |
| [`PART_5_VALIDATION.md`](PART_5_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_5_RELEASE.md`](PART_5_RELEASE.md) | Release summary — closes Book H and the A–H series | — |

## Reading order

1. **[`DEVELOPER_PLATFORM.md`](DEVELOPER_PLATFORM.md)** — the people who *build* packages and what the
   platform owes them. A developer surface, fully built, would provide three things: defined extension
   points, a package SDK, and a published contract. The codebase already contains the *registration
   shape* those seams would use — a family of `register()` methods in the AI Manager
   ([`model-registry.ts:57`](../../packages/ai-manager/src/model-registry.ts#L57), plus the sibling
   capability and tool registries) — as **🔶 BUILT (UNWIRED)**. The SDK, the contract, and the
   community layer of ratings, reviews, and contributions are **❌ ROADMAP**. Read this to see the
   outermost ring of the ecosystem: the largest number of hands adding to the platform, held to Laws
   1/4/5 so not one of them can reach the core.
2. **[`THE_ECOSYSTEM_PLATFORM.md`](THE_ECOSYSTEM_PLATFORM.md)** — the closing synthesis. It draws A–H
   into one picture: a frozen A–G core, an ecosystem ring that extends it beside three real 🔶 anchors
   (prompt content, the model registry, the declarative `Sop` shape) with the rest ❌, and the official
   `## The AdOS Architecture` reference diagram for the entire series. It declares the A–H series
   **complete at H010**, and positions **Series 2 = Implementation Before Documentation** as the forward
   discipline: reality first, then documentation, then marketing. This is the last document of the last
   book.

## The one thing to remember

The ecosystem is a ring around a fixed center, not a change to it. A developer platform is the most
dangerous surface — it hands outsiders a keyboard — which is exactly why the six laws exist: the
largest possible number of hands may add to the platform, and not one of them can rewrite the core.
The series closes not by claiming an ecosystem ships, but by drawing the full map, marking the
territory honestly, and handing the future to a discipline that builds the code before it writes the
sentence. *The ecosystem extends the core; it never rewrites the core.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
