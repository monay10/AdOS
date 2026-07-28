# Partners & Certification

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

This document defines the **participants** of the ecosystem beyond the agency itself — **partners**,
**publishers**, and **agencies acting as contributors** — and the mechanism by which the content they
bring earns trust: **certification**. It answers two questions. First, *who else contributes to the
ecosystem, and what do they contribute?* The answer is a set of people and organizations who supply
**certified partner content** and **training content** on top of the core. Second, *how does the
platform decide whether to trust what they bring?* The answer is a **Validation Status** — the
seventh field of the Trust Boundary's manifest (Law 3) — that a partner or a package earns by moving
through a certification lifecycle rather than by asserting its own quality.

It must be said at the very top, plainly and without softening: **this entire document is ❌
ROADMAP.** There is no partner code, no publisher code, no certification code, and no Validation
Status computed anywhere in the platform today. Prior design intent for a partner program exists as
written specifications under `partner/*.md` — a partner constitution, a certification design, a
validation design, portal and operations specs — and this document consumes that intent and places
it inside Book H's law and tier discipline. But those are **documents describing an intended
program, not an implementation of one.** Nothing in this document carries a code citation, because
there is nothing built to cite. Where the canon of Books B–G tags a capability ✅ or 🔶 against a
wired or built-unwired `path:line`, this part has neither, and that absence is the honest, correct
state of the ecosystem's partner layer.

One sentence bounds everything a partner may ever do, and it is the reason a partner ecosystem can be
defined at all without endangering the frozen core it grows around:

> **The ecosystem extends the core; it never rewrites the core.**

A partner adds a template, a prompt package, a benchmark, a playbook, a training module. A partner
never edits the Pipeline, the Memory, the Analytics, or the Evidence. Certification exists precisely
so that opening the ecosystem to outside contributors does not open the core to outside change: it is
the gate that lets trusted content in while keeping the core exactly as Books A–G specified it.

---

## 2. The material this document depends on — and does not re-document

The partner layer is the outermost ring of the ecosystem, and it sits on top of everything the
earlier parts of Book H define. It re-explains none of them; it references each **by link**:

- **The Ecosystem Constitution** — the six governing laws, the three-tier truth model, and the
  one-directional layer flow (Core → Packages → Templates → Partners → Marketplace → Community →
  Developers). See [`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md).
  Partners are the fourth stop on that flow; they consume everything to their left and never reach
  back into the core at the center.
- **The Trust Boundary (Law 3)** — the seven-field manifest that every package must carry:
  Publisher · Version · Signature · Compatibility · License · Hash · **Validation Status**. See
  [`../3-trust-and-isolation/TRUST_BOUNDARY.md`](../3-trust-and-isolation/TRUST_BOUNDARY.md).
  Certification, the subject of this document, is the process that *sets* that seventh field. This
  document does not redesign the manifest; it explains how one of its fields comes to hold a value.
- **The Marketplace** — the catalog and distribution surface where certified content is discovered
  and installed. See [`THE_MARKETPLACE.md`](THE_MARKETPLACE.md). Partners are *who* supplies the
  marketplace; the marketplace is *where* their certified content is listed. The two are siblings:
  this document owns the participants and their certification, the marketplace owns distribution.

None of these three is implemented. The links point to specifications, and this document is another
specification consistent with them. The value of stating the dependency is not to borrow the weight
of shipped code — there is none — but to fix the partner layer's place in the architecture so that
when Series 2 begins to build it, it is built in the right order: manifest and trust first, partners
and certification on top.

---

## 3. Participants of the ecosystem (❌ ROADMAP)

The ecosystem has one participant that already exists — the **agency**, the sovereign operator of the
core — and three roles that do not exist in code at all. Each is defined here as a contract, not a
capability.

**The partner (❌).** A partner is an organization that builds content *for* the ecosystem: a
specialist that packages its expertise into installable units — brand packages, creative packages,
benchmark packages, playbooks, workflow packages — for other agencies to install. A partner is
external to any single agency and contributes across many. There is no partner entity, no partner
identity, and no partner record in the platform today.

**The publisher (❌).** A publisher is the party that *signs and releases* a package into the
ecosystem — the named, accountable origin recorded in the manifest's Publisher field. Every partner
that ships content acts as a publisher; a publisher is the trust-bearing identity behind a package,
the answer to "who stands behind this?" There is no publisher registry, no signing identity, and no
release pipeline in code.

**The agency-as-contributor (❌).** The most important participant to name precisely is the agency
itself, wearing a second hat. An agency is first a *consumer* of the ecosystem — it installs packages
to run its campaigns. But an agency that has built a strong prompt package, a proven playbook, or a
vertical-specific benchmark may **contribute** it back, becoming a publisher of its own content. This
is the mechanism by which the ecosystem compounds: the best operators become suppliers. There is no
contribution path, no "publish my package" flow, and no contributor identity in code.

**What participants bring.** Whatever the role, the ecosystem cares about the *content* a participant
supplies, and this document is concerned with two delivery categories in particular:

- **Certified partner content** — packages (templates, prompt packs, playbooks, benchmarks, brand and
  creative packs) that a partner has published and that have passed certification. "Certified" is not
  a marketing adjective here; it is a specific Validation Status (§5) that the package has earned.
- **Training content** — material that teaches an agency how to operate the platform and its packages
  well: courses, guided playbooks, worked examples, enablement modules. Training content is how the
  ecosystem transfers *know-how*, not just *artifacts*.

Both categories are **delivery categories with no code today**. There is no content type for
"training module," no packaging for "certified content," and no store of either. They are named here
so the partner program has a defined surface to build toward — not because any part of that surface
exists.

---

## 4. The two delivery categories, defined (❌ ROADMAP)

Certified partner content and training content are the two things a partner delivers into the
ecosystem. Both are ❌; both are defined here as contracts.

**Certified partner content (❌).** This is the ecosystem's supply of ready-to-run expertise. A
partner who specializes in, say, performance-retail campaigns packages that specialization — the
prompts that work, the creative templates that convert, the benchmarks that set realistic targets —
into installable units, publishes them, and takes them through certification. Once certified, that
content carries a Validation Status other agencies can rely on without re-vetting it themselves. The
category is a *quality-gated supply of installable expertise*. Nothing implements it: there is no
partner package type, no certification result attached to content, and no installable envelope for it
to travel in (the installable envelope itself is ❌ under Part 1–2).

**Training content (❌).** Where certified partner content delivers *artifacts an agency runs*,
training content delivers *the ability to run them well*. It is enablement: how to configure a
package, when to reach for a given playbook, what a benchmark means in context, how to keep inside the
platform's boundaries. Training content is the difference between an agency that installs a package
and an agency that gets full value from it. As a delivery category it needs a content type, a way to
associate a module with the package it teaches, and a way to surface it — none of which exist. There
is no training content type, no course structure, and no enablement surface in code.

The honest summary of this section is one sentence: **both delivery categories are named, shaped, and
placed in the architecture, and neither has a single line of implementation.**

---

## 5. Certification — how content earns a Validation Status (❌ ROADMAP)

Certification is the heart of this document. It is the process that lets the ecosystem trust content
from someone other than the agency running it — the process that scales trust **beyond
self-attestation**.

**Why self-attestation is not enough.** The naïve model of an open ecosystem is that a publisher
declares its own content good and the platform believes it. That is self-attestation, and it does not
scale: a manifest a publisher fills in about its own package is a claim, not a verification. The Trust
Boundary (Law 3) already refuses to auto-trust content for exactly this reason — *no content from the
marketplace is automatically trusted.* Certification is the answer to the question that refusal
raises: **if nothing is auto-trusted, how does anything come to be trusted at all?** The answer is a
gated lifecycle that ends in a status the platform, not the publisher, assigns.

**Where the status lives.** Certification does not invent a new field. It *sets* the seventh field of
the Law 3 manifest — **Validation Status** — the one field in the seven that no publisher can write
truthfully about itself, because it records a judgement made *about* the package by the certification
process, not *by* the package's author. The other six fields describe the package (who published it,
its version, its signature, its compatibility, its license, its hash); the seventh describes **how
far the ecosystem trusts it**, and certification is what moves that field.

**The lifecycle (❌).** A package — and, by extension, the partner who publishes it — moves through a
sequence of Validation Statuses. The intended levels are:

| Status | Meaning | What it permits |
| --- | --- | --- |
| **pending** | Submitted, not yet validated. The manifest is present; the claims are unverified. | Nothing trusted. Held at the boundary. |
| **verified** | Automated and structural checks passed — signature valid, hash matches, compatibility declared, license present. | The package is *what it claims to be*, but not yet *known to be good*. |
| **certified** | Passed the full certification review — the ecosystem vouches for it. | Listable as certified partner content; trusted for install under the boundary. |
| **revoked** | Trust withdrawn after the fact — a defect, a boundary violation, or a compromised publisher. | Blocked. A previously trusted package is untrusted again. |

The lifecycle is directional but not one-way forever: **pending → verified → certified** is the path
trust is earned, and **revoked** is the escape hatch that makes the whole model safe — trust granted
can be taken back. A status is a *fact about a specific version* of a package; a new version starts
the lifecycle again, because a manifest's Version and Hash change and the thing being trusted is no
longer the thing that was certified.

**None of this exists in code.** There is no `ValidationStatus` value computed anywhere, no
certification review, no verified/certified/revoked state machine, and no place a package's status is
stored or read. Prior design intent for exactly this lifecycle exists as written specification under
`partner/*.md` — a validation design and a certification design among them — and this section is
consistent with that intent. But that intent is documentation of a program to be built, **not an
implementation of one**, and it is cited here only as evidence that the design has been thought
through before, never as code. The nearest primitive in the platform is the backup subsystem's
`sha256` hashing, which secures backup archives — that is *backup integrity*, not content signing or
validation, and it does not participate in certification. Ecosystem signing, verification, and
certification must be built from nothing.

---

## 6. Certification is how trust scales (❌ ROADMAP)

The reason certification matters is worth stating on its own, because it is the argument for building
it at all.

An ecosystem with one contributor needs no certification — the agency trusts itself. An ecosystem
with *many* contributors cannot function on self-attestation, because every consuming agency would
have to independently vet every package from every publisher, which is exactly the cost the ecosystem
was supposed to remove. Certification collapses that cost: **one certification, trusted by many
consumers.** A package certified once carries its Validation Status to every agency that considers it,
so no agency re-does the work of establishing trust. That is what "scaling trust" means concretely —
trust established once and consumed many times, rather than re-established per consumer.

This is also why the **revoked** status is not an afterthought but a load-bearing part of the model.
A trust system that can only grant trust and never withdraw it is brittle: the first compromised
publisher or defective package that slips through certification would poison confidence in every
certified package. Revocation makes certification *survivable* — the ecosystem can admit that it got
one judgement wrong, withdraw that one status, and leave every other certification standing. Trust
that can be revoked is trust that can be safely extended in the first place.

The plain tier statement: **certification is the mechanism by which the ecosystem would scale trust
beyond self-attestation — and it is entirely unbuilt.** The argument for it is sound; the
implementation is Series 2 work.

---

## 7. The laws this document answers to (Law 1 / Law 5, and Law 3)

Three of the six governing laws bear directly on partners and certification. This document does not
own Law 3 — [`../3-trust-and-isolation/TRUST_BOUNDARY.md`](../3-trust-and-isolation/TRUST_BOUNDARY.md)
does — but it depends on it, and it is bound tightly by Laws 1 and 5.

> **LAW 1 — Core Isolation Law.** No ecosystem package may modify the Core Specification. The
> responsibilities of Books A, B, C, D, E, F, G cannot be changed by any package — only extended.

A partner is the ecosystem participant furthest from the core, and Law 1 draws the line no partner may
cross. A partner may publish content that *extends* what an agency can do — a new template, a new
playbook, a new benchmark — but no partner content may touch the responsibilities the core owns. A
certified partner package cannot redefine how the Pipeline runs, how Memory is written, how Analytics
are derived, or how Evidence is grounded. Certification does not grant a partner deeper access; it
grants trust *within the boundary Law 1 fixes*, never past it.

> **LAW 5 — Ecosystem Never Rewrites Core.** A package cannot change the Pipeline, the Memory, the
> Analytics, or the Evidence. It may only ADD: a new template, a new workflow, a new prompt, a new
> benchmark, a new playbook.

Law 5 is Law 1 stated as a rule about content, and it is the exact rule partner content lives under.
The most successful partner in the ecosystem, publishing the most widely certified packages, still
operates entirely in the "may only ADD" column. This is the point of the invariant, applied to
partners: their reach can grow without limit while their access to the core stays fixed at zero. A
certified package that tried to *rewrite* rather than *add* would fail certification by definition —
because certification vouches for content that stays inside Laws 1 and 5, and content that violates
them is not certifiable content at all.

> **LAW 3 — Trust Boundary.** No content from the marketplace is automatically trusted. Every package
> MUST carry: Publisher · Version · Signature · Compatibility · License · Hash · **Validation Status.**

Certification is the process behind Law 3's seventh field. This document explains how Validation
Status comes to hold a value; the Trust Boundary document explains what the whole manifest is and why
each field matters. Together they close the loop: Law 3 says nothing is auto-trusted and requires a
Validation Status on every package; certification (this document) is how that status is earned.

The through-line across all three laws: **partners extend the ecosystem; no partner content may
change the core.** Certification is the gate that enforces exactly that, and it is unbuilt.

> **The ecosystem extends the core; it never rewrites the core.**

---

## 8. Boundaries — local, own-data-only, no vendor telemetry

Opening the ecosystem to outside partners is the moment a careless platform would compromise its
guarantees — reaching to a partner's server to fetch content, phoning home to check a certification,
shipping an agency's usage to a partner's analytics. The partner layer inherits the platform's
boundaries without exception, and they matter here more than anywhere:

- **100% local, offline-first.** A certified partner package, once installed, is a **local artifact**
  on the agency's machine, exactly like a first-party package. Installing partner content does not
  make the platform dependent on a partner's uptime, and running it requires no network. Certification
  is a property recorded *about* an installed artifact, not a live call to a partner to re-check it on
  every use.
- **No vendor telemetry.** A partner never learns how an agency uses its content. Installing a
  certified package does not open a channel back to the publisher; no usage, no performance, no
  campaign data flows to a partner, a marketplace, or any external endpoint. The partner supplies
  content and learns nothing about how it is run — the opposite of a telemetry relationship.
- **Own data only, copy-only.** Partner content is copied in as a local artifact; it brings no
  external data source with it and pulls none in at runtime. A certified benchmark package ships the
  benchmarks as data, not a live feed. An agency's own data never leaves to enrich a partner's model.
- **Human-sovereign, not an autonomous agent.** Certification informs a human's install decision; it
  never makes it. A certified status is a recommendation to a human operator, who remains the one who
  chooses to install, keep, or remove any package (Law 2 — package independence: installable and
  removable standalone). No partner content installs itself, runs hidden code (Law 4 — no hidden
  execution), or acts without the human's hand.

The one-line boundary: **partners supply content into a local, sovereign platform, and gain no window
into how that content is used.** Certification exists to make outside content *safe to trust*, not to
make the platform *dependent on outsiders*.

---

## 9. The honest gap — a partner program on paper, not in code

This document owes the reader one plain statement, and here it is: **AdOS has a designed partner
program and no implemented one.**

The design is real as *design*. Prior specification under `partner/*.md` sets out a partner
constitution, a certification path, a validation model, portal and operations and release process,
and a partner agreement — a thorough articulation of how a partner program *should* work. This
document is consistent with that intent and places it under Book H's laws and tier model.

What does not exist is the entire *implementation*:

- **No partner or publisher entity.** There is no partner record, no publisher identity, no
  contributor path. The three participant roles of §3 exist as contracts in this document and nowhere
  in code.
- **No certification mechanism.** There is no `ValidationStatus` computed, no verified/certified/
  revoked lifecycle, no certification review, and no store where a package's status lives. The
  seventh manifest field has no producer.
- **No delivery categories.** Certified partner content and training content have no content types,
  no packaging, and no surface. They are delivery categories with nothing to deliver through.
- **No installable envelope beneath them.** Partners publish *packages*, and the installable package
  envelope, manifest, and install/remove lifecycle are themselves ❌ under Parts 1–2. A partner layer
  cannot ship before the package model it rides on does.

Naming this precisely is the design being honest about its status, not a weakness in it. The partner
program is arguably the ecosystem's most valuable extension — the thing that turns a single-agency
tool into a compounding marketplace of expertise — and it is exactly the kind of capability the sixth
law protects against overclaiming:

> **LAW 6 — Implementation Before Documentation.** No roadmap capability may be promoted to shipped
> documentation until the implementation exists and PRODUCT_TRUTH.md has been updated.

Until that implementation exists, the accurate statement is this one: **the partner and certification
layer is designed in detail and built not at all.**

---

## 10. Value contribution

The partner layer maps hard to the revenue lever, but honestly — because all of it is roadmap, the
contribution is stated as what a certified partner ecosystem *would* unlock and why the seam is worth
building.

**A certified partner ecosystem multiplies agency reach.** A single agency is limited to the expertise
it builds itself. An agency plugged into an ecosystem of certified partner content can reach into
verticals, formats, and channels it has no in-house depth in — installing a certified performance-retail
package, a certified creative playbook, a certified benchmark set — and take on work it could not have
credibly pitched before. Reach that once required hiring specialists becomes reach an agency installs.
Every certified package a partner publishes is a new capability every agency in the ecosystem can put
in front of a client.

**A certified partner ecosystem multiplies content supply.** The supply of ready-to-run expertise no
longer depends on what one agency or one vendor can produce. Partners and agencies-as-contributors
both feed the supply, and the best operators become publishers — so the ecosystem's content pool grows
faster than any single team could grow it. Training content compounds this again: it does not just add
artifacts, it raises how well every agency runs the artifacts it has. More supply, better used, is more
billable output per agency.

**Certification is what makes both multipliers safe to trust.** Reach and supply are worth nothing if
an agency cannot trust what it installs. Self-attestation does not scale; certification does — one
validated status, relied on by every consumer, is what lets an agency install a partner's package with
the same confidence it has in a first-party one. Certification is the difference between an open
ecosystem that is a liability and one that is an asset: it is the mechanism that converts *more
contributors* into *more trusted capability* rather than *more risk*.

The through-line to revenue is direct: **more reach × more supply × trust that scales = more work an
agency can win and deliver.** The write of that value is deferred entirely to Series 2 — none of the
partner, certification, or delivery machinery exists — but the shape of the value is exactly why the
partner layer sits at the outer edge of the ecosystem architecture, extending the core's reach without
ever reaching into the core.

> **The ecosystem extends the core; it never rewrites the core.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
