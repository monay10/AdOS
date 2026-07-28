# Book H · Part 1 — Ecosystem Foundations

Establishing the law of the ecosystem and its first concrete noun: the constitution that governs the
whole book, and the package — the installable, removable unit that grows value around the frozen core
without ever changing it.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`ECOSYSTEM_CONSTITUTION.md`](ECOSYSTEM_CONSTITUTION.md).
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`ECOSYSTEM_CONSTITUTION.md`](ECOSYSTEM_CONSTITUTION.md) | The governing law of Book H — the central principle, the six laws, the one-way layer flow, and the honest headline that no shipped ecosystem feature exists | — |
| [`PACKAGE_MODEL.md`](PACKAGE_MODEL.md) | The installable/removable unit (Law 2) and the seven-field manifest (Law 3), grounded in the real versioned, publishable content shapes | 🔶/❌ |
| [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_1_RELEASE.md`](PART_1_RELEASE.md) | Release summary | — |

## Reading order

1. **`ECOSYSTEM_CONSTITUTION.md`** — read this first. It is the supreme Book H document: it declares
   the central principle — *extend the core, never rewrite it* — the six governing laws (including Law 6
   Implementation Before Documentation, which makes the truth model constitutional), the three-tier
   truth model, the one-way layer flow (Core → Packages → Templates → Partners → Marketplace →
   Community → Developers), and the honest headline that **no ✅ ecosystem feature is wired into the
   live app today.**
2. **`PACKAGE_MODEL.md`** — what a "package" *is*: the installable/removable unit (Law 2) and the
   seven-field manifest (Law 3), honest about the split between the versioned, publishable content
   shapes that already exist in the codebase (🔶 the prompt template, the model registry, the
   declarative Sop) and the envelope, manifest, and install-remove lifecycle that do not (❌).

## The one thing to remember

The ecosystem is a layer that grows *around* the core, never a change made *to* it. Every package can
only add material — a prompt, a model, a workflow, a template — and every package must be removable to
nothing, leaving the frozen A–G core running exactly as before. Part 1 grounds that promise in the few
real shapes that model a package today and says plainly that the envelope which would turn them into
installable, trusted packages is not built yet.
*The ecosystem extends the core; it never rewrites the core.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
