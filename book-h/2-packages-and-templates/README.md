# Book H · Part 2 — Packages & Templates

What an agency can actually drop into the ecosystem — the content it carries and the process it
shapes — measured honestly against the code that exists. The two 🔶 registries here (prompt and
model) are the strongest real anchors in Book H; everything else in this part is stated as ❌
roadmap rather than dressed as delivery.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md).
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`CONTENT_PACKAGES.md`](CONTENT_PACKAGES.md) | Prompt · AI model · brand · creative · benchmark content packages | 🔶 / ❌ |
| [`TEMPLATES_AND_PLAYBOOKS.md`](TEMPLATES_AND_PLAYBOOKS.md) | Templates · playbooks · workflow packages; declarative-not-executable principle | 🔶 / ❌ |
| [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_2_RELEASE.md`](PART_2_RELEASE.md) | Release summary | — |

## Reading order

1. **`CONTENT_PACKAGES.md`** (H003) — the five *content* categories. Two carry a real content shape:
   prompt packages ground to the versioned/scored prompt registry (🔶), AI model packages to the
   data-driven `INSTALLED_MODELS` + `register()` mechanism (🔶). Brand, creative, and benchmark
   packages are contracts with no implementation (❌), and the doc says so plainly.
2. **`TEMPLATES_AND_PLAYBOOKS.md`** (H004) — the *process* units. Templates and packageable playbooks
   have no code today (❌); workflow packages have a real declarative shape in the versioned `Sop`
   (🔶) with an unbuilt execution engine beneath it (❌). Its spine is one principle: a packageable
   process is a **declarative definition — data, not executable code** — which is exactly what lets
   it satisfy No Hidden Execution.

## The one thing to remember

A package **adds** content or a shape the core can read; it never hands the core a program to run.
That is why the honest anchors here are *registries and definitions*, not plugins: the prompt
registry versions and scores content by key, the model registry registers descriptors read by
capability, and a workflow `Sop` is a list of named steps with no function body. Each is data the
core consumes, so adding it cannot rewrite how the Pipeline runs, how Memory records, how Analytics
computes, or how Evidence proves. The two 🔶 registries prove the shape is real; the ❌ categories
are named as unbuilt capability, never as shipped safety.

> **The ecosystem extends the core; it never rewrites the core.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
