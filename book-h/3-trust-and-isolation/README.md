# Book H · Part 3 — Trust & Isolation

The safety heart of Book H. Two documents own four of the ecosystem's six governing laws — the
line third-party content must cross before the core will honour it (Law 3), and the model by which
the core is extended without ever being rewritten (Laws 1, 4, 5). This is where the ecosystem's
guarantees are made structural, and where the book is most scrupulous that the machinery is
specified, not shipped.

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
| [`TRUST_BOUNDARY.md`](TRUST_BOUNDARY.md) | Owns Law 3 · nothing auto-trusted · the seven-field manifest (Publisher · Version · Signature · Compatibility · License · Hash · Validation Status) | ❌ |
| [`CORE_EXTENSION_MODEL.md`](CORE_EXTENSION_MODEL.md) | Owns Laws 1 / 4 / 5 · how the core is extended · isolation as the consequence of a disciplined extension model | ❌ |
| [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_3_RELEASE.md`](PART_3_RELEASE.md) | Release summary | — |

## Reading order

1. **`TRUST_BOUNDARY.md`** — the admission decision. *May* a package be trusted? Nothing that arrives
   from the marketplace is trusted because it arrived; a package sits outside the boundary by default
   and is admitted only when a fixed seven-field manifest answers, field by field, what it is. Read
   this first: trust is decided before a package is ever allowed near an extension point.
2. **`CORE_EXTENSION_MODEL.md`** — what an *admitted* package may do. The core (A–G) is frozen; a
   package attaches only at declared, declaration-carrying seams (Law 4) and may only *add* the five
   additive shapes, never touch the Pipeline, Memory, Analytics, or Evidence (Law 5). Isolation
   (Law 1) is the consequence of holding that discipline, not a wall bolted on afterward.

Read together they answer the two halves of one question — *is this package safe?* — *may it be
trusted* (the boundary) and *what may it do once trusted* (the extension model).

## The one thing to remember

This part is the book's safety heart, and it is honest about being a mandate rather than a mechanism.
**No ecosystem trust machinery and no first-class extension point exist in AdOS today.** There is no
package signing, no license enforcement, no hash validation of third-party content, no validated
socket a package attaches through — those are **❌ ROADMAP**. The nearest real primitive is a sha256
digest used for *backup integrity* ([`archive.ts:18`](../../packages/backup/src/archive.ts#L18)),
and it is emphatically *not* content trust: it proves a backup survived storage, never that a package
should be believed. The core is isolated today only because the composition root is *closed*
([`app.ts:69-72`](../../apps/web/src/app.ts#L69)) — a shut door, not a guarded doorway. The work this
part specifies is turning a shut door into a guarded one without losing the isolation the shut door
gives for free.

> **The ecosystem extends the core; it never rewrites the core.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
