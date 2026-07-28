# The Trust Boundary

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

This document defines the line a third party's content must cross before the core will honour it,
and the price of admission at that line. It owns one of the ecosystem's governing laws — **LAW 3,
the Trust Boundary** — and states its single organizing idea plainly: **nothing that arrives from
the marketplace is trusted because it arrived.** Trust is not a property content carries in from
outside; it is a property AdOS grants, per package, explicitly, on evidence, or does not grant at
all. A package sits *outside* the boundary by default. It is moved inside only when it proves, field
by field, that it is what it claims to be — and even then it is admitted to do only what a package is
permitted to do, never to become part of the core it extends.

The boundary exists because the ecosystem's whole purpose is to let value grow *around* a frozen
center without that value ever leaking *into* the center on trust it has not earned. This is the
capstone principle of Book H stated as a security property:

> **The ecosystem extends the core; it never rewrites the core.**

A package that were trusted automatically would be a package that could rewrite the core the moment
it was installed — and every guarantee the core makes to an agency (100% local, no hidden execution,
human-sovereign, auditable) would then be only as strong as the least careful thing in a
marketplace. The Trust Boundary is what keeps those guarantees intact when third-party content
enters. It is not a feature bolted onto the marketplace; it is the property that makes a marketplace
*safe to have at all*, rather than a second, unvetted source of behaviour competing with the core.

The subject here is narrow and it is honest. This is not a shipped subsystem. **No ecosystem trust
machinery exists in AdOS today** — no package signing, no license enforcement, no hash validation of
third-party content, no compatibility gate. This document specifies the boundary that Book H commits
to build, names the seven fields every package must one day carry, explains why each field is
load-bearing, and is scrupulous about the single real primitive AdOS *does* have (a sha256 hash used
for backup integrity) so that it is never mistaken for the content-trust machinery that has yet to be
written. The honesty is the point: LAW 3 is a **design mandate**, and the gap between the mandate and
today's code is stated, not dressed up.

---

## 2. Nothing is automatically trusted — LAW 3 (the Trust Boundary)

> **LAW 3 — Trust Boundary.** No content from the marketplace is automatically trusted. Every
> package MUST carry: **Publisher · Version · Signature · Compatibility · License · Hash ·
> Validation Status.**

Read the law as two claims joined at the hip. The first is a *default*: the answer to "should the
core trust this package?" begins at **no**, for every package, always, and stays there until
something changes it. The second is the *mechanism* that can change it: a seven-field manifest that
each package must carry, every field of which is a question the boundary asks and refuses to admit
the package without an answer to. The default is what makes the boundary a boundary; the manifest is
what makes it crossable. Neither works without the other. A default with no crossing is a wall; a
manifest with no default is a formality.

It is worth naming what "automatically trusted" would look like, so the law's teeth are visible. It
would be a package whose author is taken on the say-so of a filename; a package installed without
knowing which release you got or whether the bytes on disk are the bytes the author shipped; a
package that runs against a core version it was never tested for; a package whose licence terms an
agency discovers only in a lawyer's letter; a package AdOS has never examined but the UI presents as
though it had. Each is a trust granted for free — granted because the content showed up, not because
it proved anything. LAW 3 forbids all of them by the same move: it makes trust a thing that is
*established*, per package, on the strength of a manifest, and never a thing that is *assumed*.

The law is deliberately worded as an obligation on the *package* ("every package MUST carry…") rather
than a courtesy of the platform. That places the burden in the right place. The boundary does not go
looking for reasons to distrust; it requires the package to supply the reasons to trust, in a fixed
and inspectable form, and treats their absence as disqualifying. A package that omits a field has not
failed a check — it has declined to make a claim the boundary requires, and an unmade claim is
indistinguishable, at the boundary, from a false one.

**Tier, stated plainly (❌ ROADMAP).** None of this is built. There is no manifest type for
ecosystem packages, no field the installer validates, no default-deny gate, because there is no
installer and no package envelope in the code today — those are themselves ❌ ROADMAP, owned upstream
by the package model. This section describes the boundary AdOS commits to; it cites no code, because
none implements it.

---

## 3. The seven-field manifest

The manifest is the boundary made concrete. It is the fixed set of questions a package must answer
before the core will honour it, and its power is that the set is *fixed*: a package cannot decline a
field, cannot substitute its own, cannot argue that a field does not apply to it. Seven questions,
asked of everything, answered before admission. What follows takes each field in turn — what it
asserts, and, more importantly, *why the boundary would be unsafe without it*.

All seven are **❌ ROADMAP**. No field below is validated by any code in AdOS today. They are
specified here as the contract the ecosystem must satisfy, not as behaviour that ships.

### 3.1 Publisher — who authored this

**What it asserts.** The identity of the party responsible for the package: the agency, partner, or
developer who authored it and stands behind it.

**Why it matters.** Trust is ultimately trust *in someone*. A package cannot be evaluated in a
vacuum; an agency's decision to install it is, at bottom, a decision about whether to accept work
from the party that made it. Without a Publisher field, every package is anonymous, and anonymous
content cannot accrue or lose reputation — a bad actor pays no cost, a good one earns no standing.
Publisher is the field that lets the later layers of the ecosystem exist at all: certification
(H007) certifies *a publisher's* content; the marketplace (H008) lists *a publisher's* catalogue;
the community layer rates *a publisher's* track record. Strip Publisher away and none of those have a
subject. Note the field names *who*; it does not by itself *prove* who — that is the Signature's job
(§3.3). Publisher is the claim of authorship; Signature is the evidence for it.

### 3.2 Version — which release this is

**What it asserts.** The specific release of the package, so that "this package" always means a
single, identifiable set of bytes and behaviour, not a moving target.

**Why it matters.** A package is not a thing; it is a sequence of things over time. Bugs are fixed,
behaviour changes, fields are added. If an agency cannot name *which* version it installed, it cannot
reproduce a result, cannot report a fault precisely, and cannot reason about whether an update
changed anything. Version is what makes a package *auditable across time*: it lets a certification
(H007) attach to a specific release rather than to a name that may mean something different tomorrow,
and it lets the trust boundary treat "version 1.2.0, verified" and "version 1.3.0, pending" as the
distinct trust states they are. This mirrors a shape the core already understands internally —
content units the core treats as first-class carry a version so they can be reasoned about across
change — but for ecosystem packages the versioned envelope is not built; it is ❌ ROADMAP.

### 3.3 Signature — cryptographic proof of authorship and integrity

**What it asserts.** A cryptographic signature binding the package's contents to its Publisher: proof
that the named author really produced *these* bytes, and that no one has altered them since.

**Why it matters.** Publisher (§3.1) is a *claim* of authorship; Signature is the *proof*. Without
it, the Publisher field is a label anyone can type — a malicious package could name a trusted agency
as its author and the boundary would have no way to catch the lie. A signature closes that gap in two
directions at once. It authenticates: only the holder of the Publisher's private key could have
produced a signature that verifies against their public key, so a forged Publisher name fails the
check. And it protects integrity: a signature verifies against the exact content it was made over, so
any tampering — a single byte changed after signing — breaks it. Signature is therefore the field
that turns Publisher from a suggestion into a fact and makes the Hash's integrity guarantee
*attributable* rather than merely detectable. It is also the field with the least existing support in
AdOS: **there is no signing, no key management, and no signature verification for ecosystem content
anywhere in the code (❌ ROADMAP).** See §4 for the one hashing primitive AdOS does have, and why it
is emphatically *not* this.

### 3.4 Compatibility — which core version this targets

**What it asserts.** The version of the frozen core the package was built and tested against — the
declared contract of "this package expects Core Specification vX."

**Why it matters.** LAW 1 (Core Isolation) freezes the core's contracts precisely so that packages
can depend on them. Compatibility is the field that *uses* that guarantee. A package written against
one version of the core's extension points may be meaningless — or unsafe — against another; the
Compatibility field lets the boundary refuse a package that targets a core AdOS is not running,
rather than admit it and let it fail in some unpredictable place inside the extension surface. This
field is the manifest's direct tie to the **frozen Core Specification**: it only has meaning because
the core's contracts are stable and versioned, and it is the mechanism by which "the ecosystem
extends the core" becomes checkable — a package must name the core it extends, and the boundary must
be able to say yes or no to that pairing. Compatibility checking is ❌ ROADMAP: there is no core
version negotiation for packages, because there is no package installer to negotiate on their behalf.

### 3.5 License — the terms of use

**What it asserts.** The legal terms under which the package may be used, redistributed, and built
upon.

**Why it matters.** Trust is not only technical. An agency adopting third-party content is taking on
a legal position as much as a technical one, and a package whose licence is unknown is a liability an
agency cannot price. License is the field that makes adoption a decision an agency can make with open
eyes: whether the content may be used commercially, whether client deliverables built on it inherit
obligations, whether a partner's benchmark pack may be redistributed inside a report. The boundary's
job here is not to interpret law but to *refuse ambiguity* — to make the terms a required, declared,
inspectable field rather than something discovered after the work is delivered. Without License in the
manifest, "safe to adopt" would be answerable only technically, and an agency would be one audit away
from a nasty surprise. License enforcement is ❌ ROADMAP; no code today reads, records, or gates on a
package's terms.

### 3.6 Hash — content integrity and tamper-evidence

**What it asserts.** A cryptographic digest of the package's content, so that the bytes on disk can be
checked, at any time, against the bytes the manifest describes.

**Why it matters.** Hash answers a question distinct from Signature's. Signature asks "did the named
author make this, and has it changed since *they* signed?"; Hash asks, more locally and more often,
"are the bytes I am about to use the bytes I was given?" It is the field that makes tampering
*evident* — a mismatch between the recomputed digest and the manifest's digest is proof that the
content is not what it was, whether through corruption, a botched update, or interference. Hash is
what lets the boundary re-verify a package cheaply on every use, not only at install time, and it is
what makes a Signature's guarantee re-checkable without re-running the full signature verification.
The two compose: Hash detects change; Signature attributes the unchanged content to its author.

This is the field for which AdOS has the *nearest* real primitive — and it is essential to be exact
about what that primitive is and is not. AdOS computes sha256 digests today, but only for **backup
integrity**, an internal concern that has nothing to do with vetting third-party content. §4 treats
this in full, because it is the single place where an honest reader might over-read the code, and the
boundary must not be credited with machinery it does not have.

### 3.7 Validation Status — has AdOS verified this

**What it asserts.** Where the package stands in AdOS's own verification lifecycle, as one of a small
set of explicit states — **pending · verified · certified · revoked.**

**Why it matters.** The other six fields are claims the *package* makes about itself. Validation
Status is the one field that records what *AdOS* has concluded about those claims — it is the
boundary's own verdict, made explicit and carried with the package. `pending` means the package has
entered but AdOS has not yet checked it; nothing may rely on it. `verified` means the technical
checks passed — the signature validates, the hash matches, the compatibility fits. `certified` means
a partner-level review (H007) has been completed, a stronger and human-attested state. `revoked` is
the field's most important value: it is how trust, once granted, is *withdrawn* — a package found to
be harmful after admission can be marked revoked, and the boundary must then treat it as untrusted
again regardless of its other fields. Validation Status is therefore the field that makes trust
*revisable rather than permanent*, which is what distinguishes a living trust boundary from a one-time
gate. It is the manifest's forward hook into certification: H007 is, in large part, the story of how a
package moves from `verified` to `certified`, and how `revoked` is applied. All four states are ❌
ROADMAP — there is no validation lifecycle, no state field, and no code that transitions a package
between these values today.

### 3.8 The seven as one gate

The fields are not a checklist of independent niceties; they compose into a single admission
decision. **Publisher** names the responsible party and **Signature** proves it; **Version** fixes
*which* artifact is in question and **Hash** proves the bytes are that artifact unaltered;
**Compatibility** confirms the artifact fits the core it claims to extend; **License** confirms the
agency may lawfully use it; and **Validation Status** records AdOS's own standing verdict over all of
the above. Miss any one and the picture has a hole a bad package can hide in: a signed package with no
compatibility is trusted code aimed at the wrong core; a compatible package with no signature is the
right shape from an unproven hand; a fully-formed package marked `revoked` is a thing that *was* trust
and no longer is. The boundary admits a package only when all seven answer, together, and it holds the
default — **no** — the moment any one of them does not.

---

## 4. The nearest primitive — backup integrity is not content trust

Honesty requires naming the one place in AdOS where a hashing primitive already exists, precisely so
that it is never mistaken for the ecosystem trust machinery specified above. AdOS has a sha256
function. It is used for **backup integrity**. It is **not** content trust, and the distance between
the two is the distance between a building block and a building.

**What exists (a real primitive).** The backup subsystem computes sha256 digests to protect archives
against corruption:

- `sha256(buf)` (`packages/backup/src/archive.ts:18-19`) is a thin wrapper over Node's `createHash`,
  returning the hex digest of a buffer.
- When an archive is built, each entry is hashed and the digest recorded in the manifest, and the
  whole archive envelope is hashed into a top-level `checksum` (`archive.ts:38`, computed at
  `archive.ts:99`).
- On restore, each entry is recovered and its recomputed digest is compared against the manifest's;
  a mismatch throws `Checksum mismatch` and the restore fails (`archive.ts:108`, verified at
  `archive.ts:131-132`).

This is genuine, working, verify-on-restore integrity checking. It proves AdOS possesses a sha256
building block and knows how to use it to make tamper- and corruption-evidence a structural property
of a stored artifact.

**What it is not.** It is *backup* integrity, and every part of its purpose is internal:

- It protects **AdOS's own backups** — the agency's local data snapshots — not third-party content
  arriving from a marketplace. The bytes it hashes are bytes AdOS itself produced.
- It answers "did *this backup* survive storage intact?" It does not answer any of the seven manifest
  questions: it does not name a Publisher, does not carry a cryptographic Signature (a keyed proof of
  *authorship* — a digest is not a signature; anyone can recompute a digest, only a key-holder can
  produce a signature), does not check Compatibility against a core version, does not record a
  License, and has no Validation Status lifecycle.
- It has no notion of *trust* at all. A checksum match means the bytes are unchanged; it says nothing
  about whether the bytes should be *trusted* — a perfectly intact malicious package would pass a
  checksum comparison exactly as a benign one would. Integrity is necessary for trust and nowhere
  near sufficient for it.

**The honest conclusion.** The correct claim is narrow: *AdOS has a sha256 primitive for backups; the
ecosystem's Hash field could one day be built on the same primitive, but package signing, license
enforcement, compatibility checking, and the validation lifecycle do not exist and must be built.*
The backup checksum demonstrates one thing only — that the lowest-level ingredient of the Hash field
is already in the codebase. It demonstrates nothing about the Signature, Publisher, Compatibility,
License, or Validation Status fields, and it must never be cited as evidence that the Trust Boundary
is anything other than **❌ ROADMAP**. To read `archive.ts` as ecosystem content-trust would be to
overclaim by a wide margin, and this document declines to.

---

## 5. The boundary is what keeps the core's guarantees intact

The Trust Boundary is not an isolated security feature; it is the guardian of every promise the core
makes to an agency. Those promises — **100% local, offline-first, copy-only, no external data, no
vendor telemetry, human-sovereign, not an autonomous agent** — are guarantees about the core's
*behaviour*. The moment third-party content can influence that behaviour, the guarantees are only as
strong as the boundary that content had to cross. LAW 3 is what keeps them from being weakened by the
very thing meant to add value around them.

- **Local stays local.** An installable package is a *local artifact* — it enters the agency's own
  environment. The boundary's job is to ensure that a package, once local, does not smuggle in
  behaviour that reaches *out*: no package should be admitted that would phone home, exfiltrate the
  agency's data, or introduce a vendor telemetry channel the core forbids. "No external data" and "no
  vendor telemetry" survive the arrival of packages only because an untrusted package is not permitted
  to act, and a trusted one is admitted only after its provenance and terms are known.
- **No hidden execution stays true.** The Trust Boundary decides *whether* to admit a package;
  **No Hidden Execution (LAW 4, owned by H006)** decides *what an admitted package may do* — and the
  answer is: only what the defined extension points allow, never arbitrary code inside the core. The
  two laws are a matched pair. Trust without an execution boundary would admit vetted content that
  could still do anything; an execution boundary without trust would constrain content whose origin
  and integrity were unknown. Together they mean: *a package must prove what it is before it is
  admitted, and even once admitted it may only extend, never execute hidden behaviour inside the
  core.*
- **Sovereignty is preserved.** Because trust is granted explicitly and per package, the human running
  AdOS stays sovereign over what their system will honour. Nothing gains the core's trust silently;
  every grant is a decision, and every decision is revisable through Validation Status (§3.7). An
  agency is never in the position of running content it did not choose to trust.

Stated as the boundary's core commitment: **an untrusted package must never silently gain the core's
trust.** That single sentence is what stands between "a marketplace that grows an agency's
capabilities" and "a marketplace that erodes the guarantees the agency adopted AdOS for." The Trust
Boundary exists so the ecosystem can grow without the core's promises shrinking.

---

## 6. Forward to certification and no hidden execution

This document owns the *boundary*; two sibling documents own what stands on either side of it, and
LAW 3 is written to hand off to both cleanly.

- **Forward to certification — H007 (Validation Status).** The seventh manifest field, Validation
  Status, is where the Trust Boundary meets the partner and certification layer. `verified` is a
  technical verdict the boundary can reach on its own; `certified` is a stronger, human-attested state
  that [`../4-partners-and-marketplace/PARTNERS_AND_CERTIFICATION.md`](../4-partners-and-marketplace/PARTNERS_AND_CERTIFICATION.md)
  defines — how a publisher's content earns certification, and how `revoked` withdraws it. The
  boundary produces the states; certification gives the two highest states their meaning. A reader who
  wants to know *how a package becomes trusted enough to certify* should follow the manifest's seventh
  field there.
- **Forward to no hidden execution — H006.** As §5 set out, the Trust Boundary and No Hidden Execution
  are a matched pair. [`CORE_EXTENSION_MODEL.md`](CORE_EXTENSION_MODEL.md) owns LAWS 1, 4, and 5 — the
  extension model that governs what an *admitted* package may do. This document stops at the boundary;
  that one takes over the moment a package crosses it. Read together, they answer the two halves of the
  single question "is this package safe?": *may it be trusted* (here) and *what may it do once trusted*
  (there).

The handoffs are deliberate. The Trust Boundary does not try to own certification or the extension
model; it owns exactly the admission decision, defines the fields that decision rests on, and points
to where the answers it produces are used.

---

## 7. Boundaries — local, own-content-only, default-deny

The Trust Boundary lives inside the same inherited boundaries that hold across the whole platform,
and on the trust path they are not incidental — they are what the boundary exists to protect:

- **100% local, offline-first.** A package is a local artifact and its trust is decided locally.
  Establishing trust does not require contacting a remote authority, and — consistent with "no vendor
  telemetry" — verifying a package must never become a channel that reports the agency's activity to a
  vendor. The boundary is a local gate, not a phone line.
- **Own content only — the opposite of telemetry.** The boundary governs what may *enter* an agency's
  local environment; it never sends the agency's own data *out*. Nothing about vetting a package
  transmits the agency's campaigns, memory, or reports anywhere. A package is inspected where it
  arrives, by the agency that received it.
- **Core isolation, always.** The Trust Boundary can admit content, but admission is never permission
  to modify the core. Even a `certified` package extends the core through defined points (H006); it
  does not, and cannot, rewrite the Pipeline, the Memory, the Analytics, or the Evidence. Trust is
  permission to *participate*, never permission to *alter*.
- **Human-sovereign, default-deny.** The boundary begins at *no* and requires evidence to move. The
  human running AdOS is never asked to trust content by default; every grant of trust is an explicit,
  revisable decision made in their own environment. Default-deny is what keeps sovereignty real rather
  than nominal.

The one-line boundary: **a package is untrusted until it proves otherwise, is judged locally, and
never earns the right to change the core.**

---

## 8. Value contribution

The Trust Boundary is, at first glance, a constraint — and it is precisely the constraint that lets
the ecosystem create value at all. Its contribution runs directly to the agency-revenue lever,
because trust is the thing that makes third-party adoption *possible* rather than reckless.

**It grows agency revenue by making third-party content safe to adopt.** An ecosystem's value to an
agency is the leverage of not building everything itself — a partner's benchmark pack, a specialist's
prompt package, a certified workflow that would have taken weeks to author in-house. But an agency
cannot responsibly adopt content it cannot vet, and content it cannot vet is content it will
(rightly) refuse. The Trust Boundary is what converts "third-party content" from a risk an agency
avoids into an asset an agency acquires. A package with a known Publisher, a valid Signature, a
matching Compatibility, a clear License, an intact Hash, and a `certified` Validation Status is a
package an agency can put in front of a client without inheriting an unknown. That is the difference
between a marketplace an agency browses nervously and one it buys from — and a marketplace agencies
buy from is the ecosystem growing, which is revenue, for the publishers who supply it and the agencies
who compound their own offering on top of it.

**It protects the revenue the core already earns.** An agency adopts AdOS for guarantees — local,
sovereign, auditable, no hidden execution. A single trusted-by-default bad package that violated one
of those guarantees would not just harm one agency; it would discredit the guarantees for all of them,
and the guarantees are the product. The Trust Boundary is the insurance on that reputation. By making
trust explicit and revocable, it ensures the ecosystem can only ever *add* to the value proposition an
agency bought — never quietly subtract from it. Growth that comes at the cost of the core's promises
is not growth; it is erosion wearing a marketplace's clothes, and the boundary is what forbids it.

> **The ecosystem extends the core; it never rewrites the core.**

That sentence is the value proposition compressed to a single line. An agency will adopt third-party
content exactly as far as it trusts that the content extends what it has without touching what it
depends on. The Trust Boundary is the mechanism that earns that trust, one package and seven fields at
a time — and an ecosystem an agency trusts is the only kind of ecosystem an agency will grow.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
