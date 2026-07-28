# Book H · Part 3 — Trust & Isolation — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 3 is the **safety heart** of Book H: the two documents that own four of the six governing laws —
the Trust Boundary (Law 3) that decides *whether* third-party content may be honoured, and the Core
Extension Model (Laws 1, 4, 5) that decides *what* an admitted package may do. It is a **design &
architecture specification**; every capability is tiered **✅ / 🔶 / ❌**, and this part is the most
honest place in the book about the distance between the mandate and the code. Documentation only.

> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| H005 | [`TRUST_BOUNDARY.md`](TRUST_BOUNDARY.md) | Owns Law 3 · nothing auto-trusted · the seven-field manifest (Publisher · Version · Signature · Compatibility · License · Hash · Validation Status) | ❌ |
| H006 | [`CORE_EXTENSION_MODEL.md`](CORE_EXTENSION_MODEL.md) | Owns Laws 1 / 4 / 5 · how the core is extended · isolation as the consequence | ❌ |
| — | [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 3 establishes

- **A default-deny trust boundary (❌ specified):** nothing that arrives from the marketplace is
  trusted because it arrived. A package sits outside the boundary by default and is admitted only when
  a fixed manifest answers, field by field, what it is. The default is what makes the boundary a
  boundary; the manifest is what makes it crossable.
- **The seven-field manifest (❌ specified):** Publisher · Version · Signature · Compatibility ·
  License · Hash · Validation Status — each defined by *what it asserts* and *why the boundary is
  unsafe without it*, composing into a single admission gate that holds **no** the moment any one
  field fails to answer. Validation Status carries the boundary's own verdict — `pending · verified ·
  certified · revoked` — the field that makes trust revisable rather than permanent.
- **The core extension model (❌ specified):** the frozen core (A–G) is extended only at declared,
  declaration-carrying seams (Law 4) and only by adding the five additive shapes — template, workflow,
  prompt, benchmark, playbook — never by touching the four untouchables — Pipeline, Memory, Analytics,
  Evidence (Law 5). Isolation (Law 1) is derived as the *consequence* of that discipline, traced
  step-by-step, not asserted as a separate wall.
- **The one real primitive, correctly bounded (🔶 / honest):** AdOS computes sha256 digests for
  **backup integrity** — `sha256` (`archive.ts:18-19`), per-entry checksum (`archive.ts:38`),
  verify-on-restore that throws on mismatch (`archive.ts:108`). Part 3 names this exactly and fences
  it off: it is the lowest-level ingredient of the Hash field and *nothing more* — not a signature,
  not content trust, and never to be cited as evidence the Trust Boundary is anything but ❌ ROADMAP.

## 3. Honest limitations

This is the part where honesty carries the most weight, because almost none of what it specifies is
built. Stated plainly:

- **The entire trust machinery is ❌ ROADMAP.** There is no ecosystem package manifest, no installer,
  no default-deny gate, no package signing, no key management, no license enforcement, no compatibility
  checking, and no validation-status lifecycle anywhere in the code. Law 3 is a **design mandate**;
  the gap between the mandate and today's code is total, and it is named, not hidden.
- **There is no first-class extension point.** The composition root is *closed* — the `App` constructor
  takes only `bus` / `ai` / `repos` (`app.ts:69-72`), with no plugin parameter and no `register` hook.
  The only live seam is a read-only wildcard event subscription (`app.ts:120`) — a package could
  *watch* the system through it, but watching is all it could do; you cannot extend a system by
  watching it. The registration *shape* exists but is unwired: the model registry's `register()`
  (`model-registry.ts:57`, 🔶 BUILT, UNWIRED) is real, data-driven code that no live app path reaches.
  A safe, validated socket a package attaches through is **net-new work that does not exist today**.
- **Isolation today rests on a shut door, not a guarded doorway.** The core is isolated right now only
  because nothing may attach — the closed constructor gives isolation for free. The hard engineering,
  and the whole burden of the roadmap, is to *admit* packages through a guarded seam while preserving
  the exact isolation a shut door gives by admitting nothing.

## 4. Value contribution

Part 3 contributes value the way a foundation does — it is the constraint that makes everything above
it safe to build. **It grows agency revenue** by converting third-party content from a risk an agency
avoids into an asset it can acquire: a package with a known Publisher, a valid Signature, a matching
Compatibility, a clear License, an intact Hash, and a `certified` status is one an agency can put in
front of a client without inheriting an unknown — the difference between a marketplace agencies browse
nervously and one they buy from. It equally **protects the revenue the core already earns** — a single
trusted-by-default bad package would discredit the local/sovereign/auditable guarantees the product
*is*, for every agency at once; explicit, revocable trust ensures the ecosystem can only add to that
proposition, never quietly subtract from it. The extension model adds the second lever: it **cuts
production time** by letting proven work — a refined workflow, a tuned prompt, a trusted benchmark —
be *installed beside* the core rather than rebuilt in every workspace, because adding a unit is a data
operation, not an engineering project.

## 5. Governance

[`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md)
governs this part; the ecosystem layer is itself governed by
[`../../bizops/RELEASE_GOVERNANCE.md`](../../bizops/RELEASE_GOVERNANCE.md). Because Part 3 is almost
entirely ❌ ROADMAP, Law 6 (Implementation Before Documentation) governs its future with unusual
force: no field of the manifest and no extension-point guarantee may be promoted from ❌ to a shipped
claim until the implementation exists and `../../PRODUCT_TRUTH.md` records it. Every addition must
tier-tag each capability, cite code only for ✅/🔶 claims and none for ❌, keep the backup sha256
primitive quarantined from content-trust claims, and re-run
[`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) before release.

> **The ecosystem extends the core; it never rewrites the core.**

**Status: ✅ Released — Trust & Isolation v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
