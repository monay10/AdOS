# The Marketplace

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md).
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

---

## 1. What this document defines

This document defines the **marketplace** — and its first job is to define the marketplace *down to
its correct size*. The marketplace is not the ecosystem. It is one surface over the ecosystem: the
**discovery-and-distribution** layer that lets a person find a package, read what it is, and obtain
it. Everything the marketplace lists was already made real somewhere else — by the package model
that says what a package *is* (H002) and the trust boundary that says what a package must *carry*
(H005). The marketplace adds a catalog, a search, and a way to hand a package across. It adds
nothing to what a package means.

That distinction is the whole reason the book that contains this document is named an *ecosystem
platform* and not a *marketplace*. An ecosystem is Packages, Templates, Partners, Community, and
Developers — a set of participants and the content they produce. A marketplace is the storefront in
front of that set. Naming the whole after the storefront would be naming a city after its one
market square. This document keeps the square in its place: important, but a subset.

One sentence bounds everything the marketplace is permitted to do, and it is the invariant the whole
book runs on:

> **The ecosystem extends the core; it never rewrites the core.**

A marketplace *distributes* extensions; it never *is* one, and it never touches the core. It moves
packages that already obey the six laws from a publisher to an installer, and it presents, for each,
the same seven-field manifest that any package must carry no matter where it came from. A listing on
a shelf earns no trust from the shelf. It is trusted — or not — on exactly the evidence it carries,
and that evidence is defined not here but in the trust boundary this document depends on (§4).

It must be said at the very top, as plainly as possible: **no marketplace exists.** There is no
catalog, no listing store, no discovery service, no search index, no distribution mechanism anywhere
in the platform. This document is a **❌ ROADMAP** specification end to end. It defines the shape of
a surface that has not been built, and it carries **no code citation**, because there is no code to
cite. Where the mirror books can point at a wired path, this one points at nothing — honestly, and
on purpose.

---

## 2. The marketplace is one subset of the ecosystem — not the whole of it

The single most important claim in this document is a claim about scope. Read the ecosystem as a set
of *participants and the content they produce*:

- **Packages** — the installable units: prompt packages, model packages, workflow packages,
  brand/creative/benchmark packages.
- **Templates** — briefs, campaigns, reports, creatives, and playbooks as reusable definitions.
- **Partners** — the publishers, agencies, and certified contributors who produce content, described
  in the sibling [`PARTNERS_AND_CERTIFICATION.md`](PARTNERS_AND_CERTIFICATION.md).
- **Community** — ratings, reviews, and shared contributions.
- **Developers** — the people who build packages against defined extension points.

The **marketplace** is none of those five things. It is the surface *over* them — the place where the
content those participants produce becomes **findable and obtainable**. Concretely, the marketplace
is four verbs and nothing more:

| Verb | What it does | What it does NOT do |
| --- | --- | --- |
| **Catalog** | Holds a listing per package | Author the package, or vouch for it |
| **Discover / Search** | Lets a person find a listing by name, category, publisher | Rank by trust the shelf invented |
| **List** | Presents a package's manifest and description | Confer trust by the act of listing |
| **Distribute** | Hands a package across to an installer | Install it into the core, or execute it |

Everything to the *left* of the marketplace — what a package is, what it must carry, how it is
certified — is defined by other documents. The marketplace consumes those definitions; it does not
get to redefine them. That is why the layer flow of the whole book points **inward-out** and in one
direction:

```
Core → Packages → Templates → Partners → Marketplace → Community → Developers
```

The marketplace sits late in that flow for a reason. By the time a thing is on a shelf, it must
*already* be a package (H002) and it must *already* carry its manifest (H005). The shelf is where
distribution happens — the last step — not where the ecosystem is defined. A book that mistook the
shelf for the ecosystem would put distribution first and let the storefront dictate what a package
is. This one refuses that inversion. The marketplace is downstream (§6), and it stays downstream.

---

## 3. What a marketplace is — catalog, listing, discovery, distribution (❌ ROADMAP)

Strip away the framing and the marketplace is a familiar, well-understood surface. It is worth
specifying its parts precisely, because precision is what lets us tag each part honestly as unbuilt.

**A catalog (❌).** A catalog is a collection of **listings**, one per published package. It is an
index, not a warehouse of trust — it records *that* a package is available and *what it declares*,
and nothing more. There is no catalog structure, no listing schema, and no store anywhere in the
platform. **❌ ROADMAP.**

**A listing (❌).** A listing is the marketplace's view of a single package: its name, its category
(prompt package, model package, workflow package, template, and so on), its description, and — this
is the part the marketplace may never omit — its **seven-field manifest** (§4). A listing is a
*presentation* of a package, not a second source of truth about it. Nothing renders a listing today;
there is no listing type, no listing page, no listing renderer. **❌ ROADMAP.**

**Discovery and search (❌).** Discovery is how a person moves from "I need a benchmark package for
CPG retail" to a specific listing — by browsing categories, filtering by publisher, or searching by
name and capability. No search index, no query surface, and no browse experience exists. **❌
ROADMAP.**

**Distribution (❌).** Distribution is the hand-off: the mechanism by which a chosen package moves
from a publisher, through the catalog, to an installer on a local machine — as a **local artifact**,
consistent with the platform's offline-first boundary (§7). There is no packaging format to
distribute, no transport, and no install endpoint on the receiving side. **❌ ROADMAP.**

Every one of these parts is a **contract, not a component**. This section fixes the *shape* of a
marketplace — what a catalog holds, what a listing shows, how discovery narrows, how distribution
hands across — so that when it is built it is built to the trust boundary and the package model, not
around them. But shape is all it fixes. There is no code behind any of the four verbs, so there is
**no citation** for any of them, and this document never pretends otherwise.

---

## 4. A listing is not trusted because it is listed (Law 3)

This is the sentence that keeps a marketplace from becoming a liability: **a listing is not trusted
because it is listed.** The shelf confers nothing. A package on the catalog is exactly as
trustworthy as the evidence it carries — no more — and that evidence is the manifest defined by the
trust boundary in [`../3-trust-and-isolation/TRUST_BOUNDARY.md`](../3-trust-and-isolation/TRUST_BOUNDARY.md).

> **LAW 3 — Trust Boundary.** No content from the marketplace is automatically trusted. Every package
> MUST carry: **Publisher · Version · Signature · Compatibility · License · Hash · Validation Status.**

The marketplace is the surface where Law 3 is *most* tempting to break, because a storefront's whole
instinct is to make listing feel like endorsement. It is not. Every listing the marketplace presents
carries the same seven fields, and the marketplace's job is to **display them, never to substitute
for them**:

- **Publisher** — who produced the package. The marketplace shows the publisher; it does not become
  the publisher by hosting the listing.
- **Version** — which revision of the package this listing distributes. A catalog holds versions; it
  does not collapse them into "latest is fine."
- **Signature** — the cryptographic proof that the package is what the publisher signed. The
  marketplace transports the signature; it never waives the check.
- **Compatibility** — which core versions the package declares it fits. Discovery may filter on it;
  discovery may not fake it.
- **License** — the terms under which the package may be used. A listing states the license; listing
  a package grants no rights the license withholds.
- **Hash** — the content fingerprint that lets an installer verify nothing changed in transit. The
  marketplace distributes the hash alongside the bytes; the *installer* verifies. The platform has a
  `sha256` primitive today, but it is used for **backup integrity**, not content signing — ecosystem
  hash-validation is not built, and the marketplace cannot borrow the backup hasher to pretend it is.
- **Validation Status** — whether the package passed the checks a partner or certification process
  applies (see the sibling [`PARTNERS_AND_CERTIFICATION.md`](PARTNERS_AND_CERTIFICATION.md)). The
  marketplace *reports* validation status; it never *invents* it. A listing marked unvalidated is
  listed exactly as truthfully as one marked validated.

The discipline is a single rule: **trust travels with the package, not with the shelf.** A
marketplace that trusted a listing because it was listed would have replaced the manifest with its
own reputation — and that is precisely the auto-trust Law 3 forbids. The catalog is a display case
for manifests. It reads them, presents them, and lets discovery filter on them. It does not issue
them, and it never overrides them.

**Tier (❌).** None of this manifest handling exists. There is no signing, no signature check, no
compatibility gate, no license enforcement, no content hash-validation, and no validation-status
field anywhere in ecosystem code. The seven fields are a **contract the marketplace must honor**, not
a mechanism it has. **❌ ROADMAP**, no citation.

---

## 5. Every listing installs and removes independently (Law 2)

A marketplace makes a second promise, quieter than trust but just as binding: everything on the shelf
is a **standalone unit**. You can take one thing without taking the rest, and you can put it back
without breaking anything.

> **LAW 2 — Package Independence.** Every package must be installable AND removable on its own. When a
> package is removed, the core keeps running unchanged.

For the marketplace, Law 2 is what makes a *catalog* coherent at all. A catalog is a list of things
that can each be obtained on their own; if listings were entangled — install this benchmark package
and you are silently forced to install three others, or removing a template leaves the core broken —
then the catalog would be a list of traps, not a list of choices. Independence is the property that
lets a marketplace present each package as a genuine, reversible decision:

- **Install is per-listing.** Obtaining a package from the catalog installs *that* package as a local
  artifact and nothing else. The marketplace distributes one unit at a time; it does not smuggle a
  dependency graph into a single click.
- **Removal is clean and local.** A package obtained from the marketplace can be removed, and when it
  is, the frozen core (Books A–G) keeps running exactly as before. The marketplace distributes things
  that are safe to *un*-distribute.
- **The core is never a marketplace dependency.** Installing from the catalog extends the core; it
  never modifies it. Removing every package ever obtained from the marketplace returns the machine to
  a working core. Distribution adds; it never subtracts from what was already there.

This is the point where the marketplace connects back to the package model in
[`../1-ecosystem-foundations/PACKAGE_MODEL.md`](../1-ecosystem-foundations/PACKAGE_MODEL.md). The
marketplace does not define independence — the package model does. The marketplace merely refuses to
list anything that violates it. A listing *is* an installable/removable unit; if a thing cannot be
installed and removed on its own, it is not a package, and a non-package has no business on the shelf.

**Tier (❌).** The install/remove lifecycle the marketplace would distribute against does not exist —
there is no installable envelope, no install step, and no remove step in ecosystem code. Law 2 is the
property every listing must have; it is not a property anything in the platform can perform yet. **❌
ROADMAP**, no citation.

---

## 6. The marketplace is downstream — distribution is the last step, not the definition

Return to the layer flow one more time, because it is the spine of this whole document:

```
Core → Packages → Templates → Partners → Marketplace → Community → Developers
```

Read left to right, the marketplace is **downstream of the package model and the trust boundary**.
Everything that gives a package its meaning happens *before* it reaches a shelf:

1. The **core** (A–G) is frozen and defines the extension points a package may use.
2. The **package model** (H002) defines what an installable/removable unit *is*.
3. The **trust boundary** (H005) defines the seven-field manifest a unit *must carry*.
4. **Partners** (H007) produce and certify the units.
5. Only *then* does the **marketplace** catalog, present, and distribute them.

Distribution is step five. It is the **last** step, not the first, and certainly not the definition.
This ordering is not a stylistic choice; it is the safeguard that keeps the marketplace from becoming
the tail that wags the ecosystem. If distribution came first — if "getting it on the shelf" were the
goal a package was built toward — then the storefront would dictate what a package is, and the trust
boundary would degrade into whatever the catalog found convenient to check. Putting the marketplace
downstream inverts that pressure: the shelf can only distribute what the package model and the trust
boundary have already made legitimate. **The marketplace inherits the rules; it does not write them.**

Said the other way around: **the definition of the ecosystem is upstream of the marketplace, and the
marketplace is downstream of the definition.** A package is a package because of H002 and H005,
whether or not any marketplace ever lists it. Delete the marketplace from the roadmap entirely and
the package model and trust boundary stand untouched — which is the clearest possible proof that the
marketplace is a subset, not the substance. The substance is the packages, the templates, the
partners, the community, and the developers. The marketplace is only how one finds them.

To make the ordering concrete, trace a single package onto the shelf — noting, at each step, that the
marketplace does none of the work that gives the package meaning:

1. A developer builds a benchmark package against the core's defined extension points (H006). The
   marketplace is not involved; the package's *legitimacy* is decided by the extension model, not the
   shelf.
2. The package is shaped as an installable/removable unit per the package model (H002). Its
   independence (§5) is a property it *has* before any catalog sees it.
3. A publisher signs it and attaches the seven-field manifest per the trust boundary (H005). Its
   *trustworthiness* travels with it, not with the shelf it will later sit on.
4. A partner or certification process sets its Validation Status (H007). The marketplace will
   *report* that status; it did not *decide* it.
5. **Only now** does the marketplace catalog it, present its manifest, let discovery find it, and
   distribute it to an installer as a local artifact.

Steps one through four are the ecosystem. Step five is the marketplace. Four-fifths of a package's
existence happens before it is ever listed — which is exactly why the marketplace is a subset of the
ecosystem and never the reverse.

> **The ecosystem extends the core; it never rewrites the core.**

---

## 7. Boundaries — a listed package is a local, sovereign artifact

The marketplace is the ecosystem's one outward-facing surface, which makes it the exact place where a
careless design would leak the platform's guarantees. It does not, because every inherited boundary
applies to a listing as strictly as to anything else:

- **100% local, offline-first, copy-only.** A package obtained from the marketplace is a **local
  artifact**. The catalog distributes content to a machine; it never turns the machine into a client
  of a remote runtime. Whatever a package does, it does locally, under the core's boundaries — the
  marketplace changes the *provenance* of a package, never its locality.
- **No hidden execution — the shelf never runs code (Law 4).** Distributing a package is a
  hand-off of an artifact, not an invitation to execute. A package installed from the marketplace may
  use ONLY the core's defined extension points; the marketplace confers no execution privilege by the
  act of distribution. The trust boundary exists precisely so that obtaining content from a shelf
  never becomes a way to run unvetted code inside the core.
- **No vendor telemetry.** A marketplace is the classic place to phone home — to report what an agency
  browsed, installed, or searched for. This one does not. Discovery, listing, and distribution, when
  built, run without shipping an agency's catalog activity to any external endpoint. The marketplace
  distributes packages *to* the agency; it does not report the agency's behavior *to* a vendor.
- **Human-sovereign, core-isolated.** Nothing enters the core because it was listed. A human chooses
  to obtain a package, a human chooses to install it, and the frozen core (A–G) is never altered by
  any of it — a listed package extends the core and never rewrites it. Removing every marketplace
  package returns a clean, working core (§5).

The one-line boundary: **a package on the shelf is a local, sovereign, reversible artifact — the
marketplace changes where it came from, never what the core is.**

---

## 8. Honest status — the whole surface is roadmap

This document owes the reader the same blunt statement it opened with, restated as a status, because
the marketplace is the part of Book H it is most tempting to describe as further along than it is:

**No marketplace code exists — not a catalog, not a listing, not discovery, not search, not
distribution.**

- **No catalog or listing store.** Nothing holds listings, and there is no listing schema. There is
  no code to cite, which is why this document carries none.
- **No discovery or search.** There is no index, no query surface, and no browse experience over
  ecosystem content.
- **No distribution mechanism.** There is no packaging format to distribute and no install endpoint to
  distribute to — the install/remove lifecycle a marketplace would move packages through is itself
  unbuilt (§5, and H002).
- **No listing-level trust.** Signing, signature verification, compatibility gating, license
  enforcement, content hash-validation, and validation status are all absent (§4, and H005). The
  platform's only hashing primitive serves backup integrity, not content trust — it cannot stand in
  for a marketplace that does not exist.
- **Design intent, not code.** Design documents describing partners and distribution exist as *design
  intent*; they are not implementations, and this document does not present them as running code.

Naming this precisely is the design being honest, not a weakness in it. The marketplace is a coherent,
well-shaped surface — its four verbs are clear, its dependence on the package model and trust boundary
is exact, and its downstream position is deliberate. What it is not, today, is **built**. The accurate
statement is the plain one: **the marketplace is fully specified and entirely roadmap.** It becomes
real only after the package model and the trust boundary it sits on top of are real first — which is
the same ordering §6 insists on, applied to time instead of layers.

---

## 9. Value contribution

The marketplace maps to the revenue lever, and it must be stated honestly, because the entire surface
is roadmap: the value here is the value a trusted distribution surface *would* unlock, and why it is
worth building **after** the layers beneath it, never before.

**It grows agency revenue by turning isolated packages into a network.** A single package that only
its author can install is a private tool. The same package, listed on a trusted marketplace, becomes
something an entire field of agencies can find, obtain, and rely on — and something its author can be
recognized (and, under its license, rewarded) for. That is the difference between a workshop and a
market: distribution is what turns individual, isolated work into a **network** where a benchmark
package built for one vertical compounds across every agency that needs it, and a certified partner's
templates reach the whole field instead of one client. The compounding is real revenue — each new
listing raises the value of the catalog to every participant, and each new participant raises the
value of every listing. The marketplace is the surface that makes that network effect *possible*.

**But the value is contingent on trust, which is why the ordering is not negotiable.** A distribution
surface that shortcut the trust boundary would not create a network; it would create a liability — a
channel for unvetted content to reach every agency at once. The marketplace's revenue contribution
depends entirely on the property that a listing is trusted on its manifest and nothing else (§4), and
that a listing is a clean, reversible unit (§5). A network of *trusted* packages is an asset; a
network of *unchecked* ones is a breach waiting to scale. So the value is unlocked in exactly one
order: the package model first, the trust boundary next, and the marketplace last — distribution over
a foundation that already makes distribution safe.

The through-line to the lever is the same discipline that keeps the whole surface honest: the
marketplace **distributes** what the ecosystem already made legitimate, and it never becomes the
legitimacy itself. Its value is entirely roadmap today, and it stays roadmap until the layers beneath
it exist — because a shelf is only worth building once there is something trustworthy to put on it.

> **The ecosystem extends the core; it never rewrites the core.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
