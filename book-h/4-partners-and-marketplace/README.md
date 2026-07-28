# Book H · Part 4 — Partners & Marketplace

The outer ring of the ecosystem: the **participants** who supply content beyond the agency itself —
partners, publishers, and agencies-as-contributors — the **certification** that earns their content
trust, and the **marketplace** that distributes it. This is the book's most forward-looking part:
every capability here is **❌ ROADMAP**, designed in detail and built not at all.

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
| [`PARTNERS_AND_CERTIFICATION.md`](PARTNERS_AND_CERTIFICATION.md) | Partners / publishers / agencies-as-contributors · certified partner content · training content · certification lifecycle (Validation Status) | ❌ |
| [`THE_MARKETPLACE.md`](THE_MARKETPLACE.md) | The marketplace as one subset of the ecosystem — catalog · listing · discovery · distribution — every listing carrying the seven-field manifest | ❌ |
| [`PART_4_VALIDATION.md`](PART_4_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_4_RELEASE.md`](PART_4_RELEASE.md) | Release summary | — |

## Reading order

1. **`PARTNERS_AND_CERTIFICATION.md`** — *who* supplies the ecosystem and *how their content earns
   trust*: the three participant roles, the two delivery categories (certified partner content and
   training content), and the certification lifecycle that sets the manifest's seventh field,
   **Validation Status** — the one field no publisher can write truthfully about itself.
2. **`THE_MARKETPLACE.md`** — *where* that certified content becomes findable and obtainable: the
   catalog, listing, discovery, and distribution surface. Read it second because the marketplace is
   downstream — it distributes what partners have already produced and certification has already
   trusted; it defines none of it.

## The one thing to remember

**The marketplace is a subset of the ecosystem, not the whole of it.** The ecosystem is the
participants and the content they produce — packages, templates, partners, community, developers.
The marketplace is only the storefront in front of them: four verbs — catalog, discover, list,
distribute — and nothing more. Naming the whole book after the storefront would be naming a city
after its one market square. A listing earns no trust from the shelf it sits on; it is trusted, or
not, on exactly the seven-field manifest it carries. Everything that gives a package meaning happens
*upstream* of the marketplace — which is the clearest proof that distribution is the last step, never
the definition.

> **The ecosystem extends the core; it never rewrites the core.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
