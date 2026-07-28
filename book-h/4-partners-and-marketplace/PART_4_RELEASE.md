# Book H · Part 4 — Partners & Marketplace — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 4 is the **outer ring of the ecosystem**: the participants who supply content beyond the agency
itself, the certification that earns their content trust, and the marketplace that distributes it. It
is the book's most forward-looking part and its most honest — **every capability here is ❌ ROADMAP**,
specified in detail and built not at all. It is a **design & architecture specification**; every
capability is tiered **✅ / 🔶 / ❌**. Documentation only.

> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| H007 | [`PARTNERS_AND_CERTIFICATION.md`](PARTNERS_AND_CERTIFICATION.md) | Partners / publishers / agencies-as-contributors · certified partner content · training content · certification lifecycle setting Validation Status | ❌ |
| H008 | [`THE_MARKETPLACE.md`](THE_MARKETPLACE.md) | The marketplace as one subset of the ecosystem — catalog · listing · discovery · distribution; every listing carries the seven-field manifest | ❌ |
| — | [`PART_4_VALIDATION.md`](PART_4_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 4 establishes

- **The participants of the ecosystem (❌):** three roles defined as contracts — the **partner** who
  packages expertise for other agencies, the **publisher** who signs and releases it as the accountable
  origin in the manifest's Publisher field, and the **agency-as-contributor**, the operator who wears a
  second hat and publishes its own proven content back. This is the mechanism by which the ecosystem
  compounds: the best operators become suppliers. None exists in code.
- **The two delivery categories (❌):** **certified partner content** — a quality-gated supply of
  ready-to-run, installable expertise — and **training content** — the enablement that teaches an agency
  to run that expertise well. Both are named, shaped, and placed in the architecture with no line of
  implementation behind either.
- **Certification as trust that scales (❌):** the pending → verified → certified lifecycle, with
  **revoked** as the load-bearing escape hatch that makes granting trust safe in the first place.
  Certification *sets* the Law 3 manifest's seventh field, **Validation Status** — the one field no
  publisher can write truthfully about itself, because it records a judgement made *about* the package,
  not *by* its author. One certification, relied on by many consumers, is how the ecosystem scales trust
  beyond self-attestation.
- **The marketplace, sized correctly (❌):** the marketplace is *one subset* of the ecosystem — a
  storefront of four verbs (catalog, discover, list, distribute) over the participants and their
  content, never the ecosystem itself. Every listing carries the same seven-field manifest, and **a
  listing is not trusted because it is listed** — trust travels with the package, not with the shelf.
- **Distribution is downstream (❌):** the marketplace is step five of the layer flow, the last step and
  never the definition. A package is a package because of the package model (H002) and the trust boundary
  (H005), whether or not any marketplace ever lists it — delete the marketplace and both stand untouched.

## 3. Honest limitations

- **The entire part is ❌ ROADMAP.** There is no partner or publisher entity, no contribution path, no
  certification mechanism, no `ValidationStatus` computed anywhere, and no store where a package's status
  lives. There is no catalog, no listing schema, no discovery or search index, and no distribution
  mechanism. Neither document carries a wired code citation, because there is nothing built to cite —
  which is the correct, honest state of the ecosystem's outer ring.
- **The layers beneath it are unbuilt too.** Partners publish *packages* and the marketplace distributes
  them, but the installable package envelope, manifest, and install/remove lifecycle are themselves ❌
  under Parts 1–3. A partner and marketplace layer cannot ship before the package model and trust
  boundary it rides on do. The ordering is not negotiable: package model first, trust boundary next,
  partners and marketplace last.
- **`partner/*.md` is design intent, not code.** Prior specifications describing a partner program exist
  as written design documents; they are consumed here as intent placed under Book H's laws, never
  presented as an implementation. The platform's only hashing primitive (`sha256`) serves backup
  integrity, not content signing — it cannot stand in for an ecosystem trust mechanism that does not
  exist.

## 4. Value contribution

The partner and marketplace layer maps hard to the **revenue lever**, and honestly — because it is all
roadmap, the value is stated as what a trusted outer ring *would* unlock. A single agency is limited to
the expertise it builds itself; an agency plugged into an ecosystem of certified partner content can
reach into verticals, formats, and channels it has no in-house depth in, and take on work it could not
credibly have pitched before — reach that once required hiring specialists becomes reach an agency
installs. The marketplace turns those isolated packages into a **network**: each new listing raises the
catalog's value to every participant, and each new participant raises the value of every listing. But
the entire value is contingent on trust — a distribution surface that shortcut the trust boundary would
create a liability, not a network. Certification is what converts *more contributors* into *more trusted
capability* rather than *more risk*: one validated status, relied on by many, is what lets an agency
install a partner's package with the confidence it has in a first-party one. **More reach × more supply
× trust that scales = more work an agency can win and deliver** — a value deferred entirely to Series 2,
whose shape is exactly why this layer sits at the outer edge, extending the core's reach without ever
reaching into the core.

## 5. Governance

[`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md)
governs this part; the ecosystem layer is itself governed by
[`../../bizops/RELEASE_GOVERNANCE.md`](../../bizops/RELEASE_GOVERNANCE.md). Because the whole part is
❌ ROADMAP, Law 6 — Implementation Before Documentation — binds it tightest of all: no partner,
certification, or marketplace capability may be promoted from ❌ to a shipped tier until the
implementation exists and `../../PRODUCT_TRUTH.md` has been updated. Every addition must tier-tag each
capability, refuse to attach a code citation to anything unbuilt, and re-run
[`PART_4_VALIDATION.md`](PART_4_VALIDATION.md) before release.

> **The ecosystem extends the core; it never rewrites the core.**

**Status: ✅ Released — Partners & Marketplace v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
