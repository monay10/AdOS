# AdOS — Release Governance

> **Owner:** Office of the CTO · **Status:** Official — aligned to PRODUCT_TRUTH.md ·
> **Version 1.0.0 · Aligned to AdOS v1.0.0** · **Source of truth:** `../PRODUCT_TRUTH.md`

Governing BizOps reference: `BUSINESS_OPERATIONS_CONSTITUTION.md`. This document
defines how AdOS versions, approves, ships, communicates, and rolls back releases.
It is a *business/company* governance document — it governs the organization that
builds and sells AdOS, not the product's runtime behavior.

---

## 0. Scope and the one fact that shapes everything

AdOS is an **offline-first, 100% local-AI advertising-agency platform** that a
customer **self-hosts on their own infrastructure** (on-prem / private / air-gap
capable). There is **no vendor cloud, no phone-home, no standing vendor access**
(`../PRODUCT_TRUTH.md` §1.5, §2.8). This single fact defines what a "release" is and
is not:

- A **release** is a **versioned build + aligned documentation + GTM alignment**,
  **packaged and distributed** to self-hosting customers and delivery partners.
- A release is **NOT** a cloud deploy that automatically reaches customers. Nothing
  the company does at release time changes a customer's running instance. The
  customer (or their partner) chooses when to pull, verify, back up, and upgrade —
  per `../UPGRADE_GUIDE.md`.
- **Customer and partner notification is a communication step** (changelog entry +
  email + portal post), **never an auto-push** and never telemetry. The company does
  not observe whether or when a customer upgraded; adoption of a release is
  **customer-reported / customer-attested**, not measured from the product.

Every release is also a **truth checkpoint**: before anything ships, the company
re-verifies that no document, marketing, sales, partner, or customer-success claim
exceeds `../PRODUCT_TRUTH.md`, and that any not-yet-shipped capability stays under an
explicit **Roadmap** label (see §11 and `../ROADMAP.md`).

---

## 1. Version policy (Semantic Versioning)

AdOS uses **Semantic Versioning** — **MAJOR.MINOR.PATCH**. The current product line
is **AdOS v1.0.0**. The first tagged artifact in the line is the release candidate
`1.0.0-rc1` (`../CHANGELOG.md`, `../RELEASE_NOTES.md`), which progresses to the
`1.0.0` final with doc/polish deltas only.

| Segment | Bump when… | Examples (truthful to product scope) | Customer action implied |
|---|---|---|---|
| **MAJOR** (`X.0.0`) | A backward-incompatible change: a breaking API/contract change, a data-migration that is not automatically reversible, removal of a supported config flag, or a change requiring manual steps to upgrade. | Removing/renaming an `AI_ENGINE` value; a schema change that requires a restore to undo; changing a documented `apps/web` route contract. | Read `../UPGRADE_GUIDE.md` migration notes; back up first; plan a maintenance window. |
| **MINOR** (`1.Y.0`) | Backward-compatible new capability, added **behind a config flag defaulting to prior behavior**, so upgrading is safe before opt-in. | A new local inference engine option; a new opt-in persistence adapter; additive, non-breaking route or report. | Optional. Upgrade is safe with no behavior change until the flag is set. |
| **PATCH** (`1.0.Z`) | Backward-compatible bug fix, security hardening, performance tuning, or documentation-only correction. No new capability, no schema break. | Statement-cache tuning; a CSP/header fix; a copy correction re-aligning a doc to `../PRODUCT_TRUTH.md`. | Recommended, especially for security patches. Low risk. |

Rules:

- **Pre-1.0 / RC suffixes** (`-rc1`, `-rc2`) are pinned explicitly and are not the
  stable line; expect only doc/polish deltas from the last RC to the `.0` final.
- **Config-gated by default.** New infrastructure/capability ships behind an
  environment flag and defaults to previous behavior (`../UPGRADE_GUIDE.md`). This is
  what keeps most upgrades MINOR/PATCH rather than MAJOR.
- **Migrations are forward-only and idempotent**, applied at startup when
  `DATABASE_URL` is set. A change that cannot be undone by re-running forward is a
  MAJOR change and must document the restore path.
- **Truthful scope only.** Version notes describe **what shipped** per
  `../PRODUCT_TRUTH.md` §2–§3. Nothing on the Roadmap list (§11) may be described as
  shipped in a release note, changelog, or version bump rationale.
- **One version, everywhere.** The tag, `../CHANGELOG.md`, `../RELEASE_NOTES.md`,
  `package.json`, and the distributed artifact name carry the **same** version
  string.

---

### 1.1 Release types at a glance

| Type | Version effect | Typical trigger | Gates | Authorization |
|---|---|---|---|---|
| **Standard** | MINOR or PATCH | Planned scope from `main`. | All applicable (G1–G8). | Office of the CTO. |
| **Major** | MAJOR | Breaking change / non-reversible migration. | All (G1–G8), full. | Office of the CTO **+ Executive**. |
| **Hotfix** (§7) | PATCH | Defect in a shipped version. | G3 + G5 mandatory; others fast-track. | Engineering lead. |
| **Emergency** (§8) | PATCH (usually) | Active security / data-integrity issue. | G3 + G5 never waived; rest minimal. | Office of the CTO **+ Executive**. |

### 1.2 Distribution and artifact packaging

Because customers self-host, the **artifact is the release**. Each release produces a
retrievable set the company keeps available indefinitely so any self-hoster can adopt
or roll back to it:

- The **immutable git tag** `vX.Y.Z` (the checkout reference in `../UPGRADE_GUIDE.md`).
- The **built distributable** (per `../DEPLOYMENT.md` / `../INSTALLATION_GUIDE.md`),
  with **published checksums** so a self-hoster can verify integrity offline.
- The **aligned documentation set** (release trio + operational docs, §9).
- The **recovery/backup package** for that version (§6, `../BACKUP_GUIDE.md`).

No artifact is deleted or overwritten after distribution; superseding a release adds
a new version, it does not replace the old one. This is what makes customer-side
rollback (§6) possible without any vendor involvement.

## 2. Branch policy

| Branch | Purpose | Who writes | Protection |
|---|---|---|---|
| `main` | Always-releasable trunk. Every commit is green and truthful. | PRs only | Protected: PR review + green CI required; no direct pushes. |
| `feat/*`, `fix/*`, `chore/*`, `docs/*` | Short-lived working branches off `main`. | Any engineer | Merge to `main` via PR after review + green CI. |
| `release/x.y.z` | Cut from `main` to stabilize a specific release; only stabilization commits (version bump, changelog, doc alignment, blocking fixes). | Release owner + Eng | Protected; feeds the tag. |
| `hotfix/x.y.z` | Emergency fix branched from the affected **release tag**, not `main` (see §8). | Eng lead | Protected; cherry-picked back to `main`. |

Rules:

- **`main` is always releasable.** If tests are not green on `main`, releasing is
  blocked (§4, §5).
- Every branch merges via a **reviewed pull request**; no direct pushes to protected
  branches.
- A release is **tagged** (`vX.Y.Z`) on the `release/*` (or `hotfix/*`) branch after
  all gates pass. The tag is the immutable reference customers/partners check out
  (`git checkout <new-tag>`, `../UPGRADE_GUIDE.md`).
- **No GTM/business collateral** (`../marketing`, `../sales`, `../partner`,
  `../customer-success`, `bizops/`) is a release blocker for the *product build*, but
  collateral **alignment** is a release gate (§4, §9, §10) — collateral must not
  claim beyond the version actually shipping.

---

## 3. Roles and decision rights

Decision rights follow the BizOps decision framework (RACI; exactly one Accountable).
The **release decision** (ship / hold) is a **Type 1** decision — documented, and
owned by the Office of the CTO / Engineering with Executive sign-off for MAJOR and
emergency releases.

| Function | Role in a release |
|---|---|
| **Engineering** (Accountable for the build) | Owns branch/tag mechanics, CI, migration safety, and the ship/hold call. |
| **Product** | Confirms scope matches intent and that notes describe only shipped capability. |
| **QA / Test** | Confirms the suite is green (§4 gate G3) and acceptance workflows pass. |
| **Documentation** (Office of the CTO) | Confirms all docs re-align to `../PRODUCT_TRUTH.md`; owns changelog/notes/upgrade artifacts. |
| **Security** | Confirms no new exposure; signs off hardening/security patches. |
| **Marketing / Sales / Partners / Customer Success** | Confirm their collateral does not exceed the shipped version (alignment gates §9–§10). |
| **Operations** (BizOps/IT) | Owns artifact distribution channel, checksums, and post-release verification. |
| **Executive** (CEO office) | Sign-off for MAJOR and Emergency releases (Type 1). |

### 3.1 RACI by release activity

Exactly one **A**ccountable per activity. **R** = Responsible, **C** = Consulted,
**I** = Informed.

| Activity | Eng | Product | QA | Docs | Security | GTM (Mktg/Sales/Partners/CS) | Ops | Exec |
|---|---|---|---|---|---|---|---|---|
| Cut release branch & bump version | **A/R** | C | I | I | I | I | I | I |
| Confirm scope = shipped only | C | **A/R** | I | C | I | C | I | I |
| Verify tests green (G3) | C | I | **A/R** | I | I | I | I | I |
| Align documentation to PRODUCT_TRUTH.md | C | C | I | **A/R** | C | C | I | I |
| Security review | C | I | C | I | **A/R** | I | I | I |
| Rollback / recovery readiness | **A/R** | I | I | C | C | I | C | I |
| GTM collateral alignment | I | C | I | C | I | **A/R** | I | I |
| Release authorization (Type 1) | C | C | C | C | C | C | C | **A** (MAJOR/Emergency) / **I** (else) |
| Tag, build, distribute artifact | **A/R** | I | I | I | I | I | R | I |
| Send customer/partner notification | I | I | I | C | I | **A/R** | I | I |

---

## 4. Approval gates

A release advances **only** when every applicable gate is signed off. Gates are
sequential; a failed gate **blocks the release**. Sign-off is recorded (name + date)
against the `release/*` branch.

| Gate | Name | Owner (Accountable) | Pass criteria | Blocks release? |
|---|---|---|---|---|
| **G1** | Engineering ready | Engineering | Code merged to `main`; `release/*` cut; version bumped consistently everywhere (§1). | Yes |
| **G2** | Product scope | Product | Scope matches intent; every capability in notes traces to `../PRODUCT_TRUTH.md` §2–§3; Roadmap items labelled Roadmap. | Yes |
| **G3** | Tests green (QA) | QA / Test | Full build + test green in CI — web app suite and full monorepo tasks (`../ACCEPTANCE_REPORT.md`, `../TRACEABILITY_MATRIX.md`). **No red, no skipped-as-green.** | Yes — hard gate |
| **G4** | Documentation aligned | Documentation (Office of the CTO) | `../CHANGELOG.md`, `../RELEASE_NOTES.md`, `../UPGRADE_GUIDE.md` updated; all product docs re-verified against `../PRODUCT_TRUTH.md`; `../KNOWN_LIMITATIONS.md` current. | Yes |
| **G5** | Security review | Security | No new exposure; dependency/security posture reviewed; `../SECURITY_GUIDE.md` consistent. For security patches, fix verified. | Yes |
| **G6** | Continuity / rollback ready | Engineering + Operations | Backup/restore path verified; versioned artifact + recovery package publishable (`../BACKUP_GUIDE.md`, `../DISASTER_RECOVERY.md`, `../RUNBOOK.md`). | Yes |
| **G7** | GTM alignment | Marketing · Sales · Partners · Customer Success | No collateral claim exceeds the shipped version or `../PRODUCT_TRUTH.md`; notification drafts ready (§9–§10). | Yes (for external-facing releases) |
| **G8** | Release authorization | Office of the CTO (+ Executive for MAJOR/Emergency) | All above green; tag + distribution authorized. Type 1 decision recorded. | Yes |

**Hard rule — tests must be green before release.** G3 cannot be waived, deferred, or
overridden. A release with red or skipped-and-counted-as-passing tests does not ship.

---

## 5. Release checklist

Run top to bottom. Every item maps to a gate (§4). Record owner + date per item.

| # | Step | Owner | Gate | Done-when |
|---|---|---|---|---|
| 1 | Confirm `main` green and all intended PRs merged. | Engineering | G1 | CI green on `main`. |
| 2 | Cut `release/x.y.z` from `main`. | Engineering | G1 | Branch exists, protected. |
| 3 | Bump version consistently (tag target, `package.json`, changelog, notes, artifact name). | Engineering | G1 | One version string everywhere. |
| 4 | Confirm scope = shipped capability only; no Roadmap item stated as shipped. | Product | G2 | Scope signed. |
| 5 | Run full build + test; capture results. | QA / Test | G3 | **All green**; acceptance workflows pass. |
| 6 | Update `../CHANGELOG.md` (Added/Changed/Fixed/Notes). | Documentation | G4 | Entry merged. |
| 7 | Update `../RELEASE_NOTES.md` (highlights, quality, getting started, known limitations, upgrade pointer). | Documentation | G4 | Notes merged. |
| 8 | Update `../UPGRADE_GUIDE.md` (from-version steps, flags, migration/rollback notes). | Documentation | G4 | Guide merged. |
| 9 | **Truth re-verification pass**: every product doc re-checked against `../PRODUCT_TRUTH.md`; refresh `../KNOWN_LIMITATIONS.md`. | Documentation | G4 | No doc claim exceeds §2–§3. |
| 10 | Security review of the diff and dependencies. | Security | G5 | Sign-off; `../SECURITY_GUIDE.md` consistent. |
| 11 | Verify backup/restore + recovery package for this version. | Engineering + Operations | G6 | Restore rehearsed per `../DISASTER_RECOVERY.md`. |
| 12 | GTM alignment sweep of `../marketing`, `../sales`, `../partner`, `../customer-success`. | Marketing/Sales/Partners/CS | G7 | No collateral exceeds shipped version. |
| 13 | Draft customer + partner notification (changelog link + email/portal). | CS + Partners | G7 | Drafts ready to send (communication, not auto-push). |
| 14 | Release authorization (Type 1 recorded). | Office of the CTO (+ Exec if MAJOR/Emergency) | G8 | Authorized. |
| 15 | Tag `vX.Y.Z`; build the distributable artifact(s). | Engineering | G8 | Tag pushed; artifact built. |
| 16 | Publish artifact + docs to the customer/partner distribution channel. | Operations + Partners | G8 | Available to self-hosters. |
| 17 | **Send** notifications (email + changelog + partner/CS portal). | CS + Partners | G8 | Communicated — not pushed to instances. |
| 18 | Post-release verification: distribution links resolve; artifact checksums match. | Operations | G8 | Verified. |

---

## 6. Rollback (self-hosted model)

Because customers self-host, **the company does not roll anything back on a
customer's behalf** — there is no fleet the company controls. Rollback is a
**procedure the customer or their delivery partner runs on their own instance**,
using the **versioned artifacts** the company distributes plus their **backup /
recovery packages**.

**What the company owns for rollback:**

- Keep **every released tag and artifact retrievable** so any customer can return to
  a prior version (`git checkout <previous-tag>`, rebuild, restart —
  `../UPGRADE_GUIDE.md`).
- Ship a **verified backup/restore path** and a recovery package with each release
  (`../BACKUP_GUIDE.md`, `../DISASTER_RECOVERY.md`, `../RUNBOOK.md`).
- Document, per release, whether rollback needs only a re-checkout or also a **data
  restore** (required whenever a forward-only migration changed data).

**Customer/partner rollback procedure (documented, not executed by the vendor):**

| Step | Action | Reference |
|---|---|---|
| 1 | If a migration changed data, restore the pre-upgrade backup. | `RestoreService`, `../DISASTER_RECOVERY.md`, `../BACKUP_GUIDE.md` |
| 2 | `git checkout <previous-tag>`, `pnpm install`, rebuild. | `../UPGRADE_GUIDE.md` |
| 3 | Restart; migrations are forward-only, so schema undo requires the restore from step 1, not a down-migration. | `../UPGRADE_GUIDE.md`, `../RUNBOOK.md` |
| 4 | Verify the instance and confirm data integrity. | `../RUNBOOK.md` |

The company's obligation at release time (gate **G6**) is to make sure these steps
are **possible and documented** for the version being shipped — that is what
"rollback ready" means for a self-hosted product.

---

## 7. Hotfix

A **hotfix** corrects a defect in an already-released version without pulling in
unrelated `main` changes.

- Branch **`hotfix/x.y.z` from the affected release tag** (not from `main`), so
  self-hosters can adopt only the fix.
- Almost always a **PATCH** bump (`1.0.Z → 1.0.(Z+1)`).
- Gates: **G3 (tests green) and G5 (security) are mandatory**; G2/G4 run in
  fast-track form (scope + changelog/notes/upgrade delta). G1, G6, G8 apply.
- **Cherry-pick the fix back to `main`** so the next regular release includes it.
- Distribute the hotfix artifact and **communicate** it (changelog + targeted email
  to affected customers/partners). It remains a communication step — customers choose
  when to apply it.

## 8. Emergency release

An **emergency release** addresses an active security or data-integrity issue and
compresses the timeline while preserving the non-negotiable gates.

| Aspect | Emergency handling |
|---|---|
| Trigger | Confirmed security vulnerability or data-loss/integrity defect in a shipped version. |
| Authorization | **Executive (CEO office) + Office of the CTO**, recorded as a Type 1 decision. |
| Non-negotiable gates | **G3 (tests green)** and **G5 (security)** — never waived. |
| Compressed gates | G2/G4/G7 run in minimal form: scope note, changelog/notes/upgrade delta, and a short customer/partner security advisory. |
| Branch | `hotfix/x.y.z` from the affected tag (§7). |
| Rollback readiness | G6 confirmed before distribution (§6). |
| Communication | Security advisory + changelog + direct email/portal notice, describing severity and the customer action required. Still **notification, not auto-push** — the company cannot and does not reach into customer instances. |
| Follow-up | Post-incident review; fix cherry-picked to `main`; advisory logged. |

Even under emergency timing, **no release ships with red or skipped-as-passing
tests**, and **no advisory may claim a capability beyond `../PRODUCT_TRUTH.md`**.

---

## 9. Documentation updates (re-align to PRODUCT_TRUTH.md)

Documentation is a **first-class release deliverable**, not an afterthought. Gate
**G4** is blocking.

Per-release documentation must:

- Update the release trio — `../CHANGELOG.md`, `../RELEASE_NOTES.md`,
  `../UPGRADE_GUIDE.md` — with the same version string and truthful scope.
- Refresh `../KNOWN_LIMITATIONS.md` so limitations remain accurate for the shipped
  build.
- Run a **truth re-verification pass**: every product-facing document is re-checked
  against `../PRODUCT_TRUTH.md`. Any statement that exceeds §2–§3 is corrected or
  removed before the release is authorized.
- Keep **Roadmap items visibly labelled Roadmap** (§11), consistent with
  `../ROADMAP.md` and `../POSITIONING_GAP_ANALYSIS.md` — never restated as shipped.
- Keep operational docs (`../DEPLOYMENT.md`, `../INSTALLATION_GUIDE.md`,
  `../RUNBOOK.md`, `../SECURITY_GUIDE.md`, `../DISASTER_RECOVERY.md`,
  `../BACKUP_GUIDE.md`) consistent with the version's actual behavior.

A release with documentation that overstates the product **does not pass G4** and
does not ship.

## 10. Marketing and Sales alignment

Every external-facing release re-verifies that **no marketing or sales claim exceeds
`../PRODUCT_TRUTH.md`** (gate G7).

| Area | What to re-verify at release | Reference |
|---|---|---|
| **Marketing** | Website/press/blog/social copy describes only shipped capability; product one-liner stays truthful; no forbidden capability stated as present-tense. | `../marketing/MARKETING_CONSTITUTION.md`, `../marketing/WEBSITE_CONTENT.md`, `../marketing/PRESS_KIT.md`, `../marketing/MARKETING_RELEASE_NOTES.md` |
| **Sales** | Brochure, one-pager, FAQ, proposal, ROI framing claim nothing beyond the shipped version; no consumption/per-token/per-seat-metered billing language. | `../sales/SALES_KIT_CONSTITUTION.md`, `../sales/BROCHURE.md`, `../sales/ONE_PAGER.md`, `../sales/SALES_FAQ.md`, `../sales/PROPOSAL_TEMPLATE.md` |

Rules:

- The **product is offline/self-hosted with no vendor cloud**; collateral must not
  imply a hosted service, telemetry, or automatic updates.
- Any future capability referenced in collateral must be **explicitly labelled
  Roadmap** and clearly not-yet-shipped.
- Collateral is aligned to the version being shipped **before** the release is
  authorized (G7), and revalidated against its own constitution documents.

## 11. Roadmap discipline

A release is a truth boundary. The following remain **product Roadmap items** and may
appear in release/GTM materials **only under an explicit Roadmap label**, never as
shipped, and never as something a release "delivers" (`../PRODUCT_TRUTH.md` §4–§6,
`../ROADMAP.md`):

- Document Q&A / cited answers over documents
- "Digital Employees" / autonomous agents doing real work
- Live ad launch / campaign optimization (product ships **drafts only**)
- External connectors / syncs (Meta/Google/CRM)
- Enforced RBAC / permission-aware AI
- Immutable audit trail; DB-level Row-Level Security
- Cloud / SaaS / hosted inference; in-product license metering/entitlement server
- Vision / speech / image / video AI
- Tiered T0–T4 approval authority
- "Real AI prose out of the box" (default is the deterministic OfflineAIManager)

If a release would move any of these from Roadmap to shipped, that is (at minimum) a
**MINOR** bump, requires updating `../PRODUCT_TRUTH.md` **first**, and only then may
collateral and docs describe it as shipped.

## 12. Partner and Customer notification

Notification is the **communication** half of a release. It is how self-hosters learn
a new version exists — it is **never** a push into their instances and **never**
telemetry back to the company. Whether a customer or partner adopts a release is
**customer-reported / customer-attested**, not observed by the vendor.

| Audience | Channel | Content | Reference |
|---|---|---|---|
| **Partners** (Partner/Channel) | Partner portal post + partner email; toolkit/release note update. | New version, changes, upgrade + rollback guidance for the instances they operate on customers' behalf, and any collateral deltas. | `../partner/PARTNER_RELEASE.md`, `../partner/PARTNER_OPERATIONS.md`, `../partner/PARTNER_TOOLKIT.md` |
| **Customers** (via Customer Success) | Release email + changelog link + CS portal note. | Highlights, upgrade steps (`../UPGRADE_GUIDE.md`), rollback path, known limitations, and any required action for security/emergency releases. | `../customer-success/CUSTOMER_SUCCESS_RELEASE.md`, `../customer-success/OPERATIONS_RUNBOOK.md`, `../customer-success/SUPPORT_PLAYBOOK.md` |

Notification rules:

- **Communicate, don't push.** The company distributes artifacts + docs and sends
  notices; the customer/partner decides when to verify, back up, and upgrade.
- **No vendor telemetry.** Notifications must not claim the company can see whether a
  customer upgraded, their usage, or their instance health. Adoption reporting, if
  any, is customer-attested.
- **Security/emergency releases** (§8) get a distinct, higher-priority advisory
  stating severity and the customer action required.
- Notification content is bound by the same truth rule (§9–§11): it must not exceed
  `../PRODUCT_TRUTH.md`, and Roadmap stays labelled Roadmap.

---

## 13. Cadence and release health (company-internal only)

Release planning follows the BizOps operating rhythm and is reviewed in the standard
cadence. All measures below are **company-internal** (own repo, own CI, own release
log) and are safe to measure directly — **none depend on customer-instance data**, so
none are telemetry.

| Cadence | Release governance activity |
|---|---|
| **Weekly** | `main` health check; open blockers to the next release; review any hotfix candidates. |
| **Monthly** | Release-log review: what shipped, doc-alignment exceptions found and closed, hotfix/emergency count. |
| **Quarterly** | Version-line planning; Roadmap-to-shipped candidates reviewed against `../PRODUCT_TRUTH.md` and `../ROADMAP.md`. |
| **Annual** | Release-governance review; update this document if the process changes. |

**Release-health measures (company-internal, not vendor telemetry):**

| Measure | Definition | Source |
|---|---|---|
| Green-CI-at-release | Every release passed G3 with zero red/skipped-as-passing tests. | Own CI |
| Doc-alignment exceptions | Claims found exceeding `../PRODUCT_TRUTH.md` during a release, and time-to-correct. | Own release log |
| Hotfix / emergency rate | Count and cause of unplanned releases per period. | Own release log |
| Rollback-readiness | Releases shipped with a verified backup/recovery package (G6). | Own release log |

Adoption of a release by customers is **customer-reported / customer-attested**, never
measured from the product — the company has no visibility into self-hosted instances.

## 14. Release governance summary

| Principle | Statement |
|---|---|
| Versioning | SemVer MAJOR.MINOR.PATCH; current line **AdOS v1.0.0**. |
| What a release is | Versioned build + aligned docs + GTM alignment, **distributed** to self-hosters. |
| What a release is not | A cloud deploy that reaches customers automatically. |
| Notification | A **communication** step (changelog/email/portal), never an auto-push, never telemetry. |
| Hard gate | **Tests must be green** (G3) — never waived, even in emergencies. |
| Truth boundary | Every release re-verifies no doc/marketing/sales/partner/customer claim exceeds `../PRODUCT_TRUTH.md`; Roadmap stays labelled Roadmap. |
| Rollback | Customer/partner rolls back **their own instance** using versioned artifacts + backup/recovery packages. |
| Authorization | Type 1 decision; Office of the CTO, with Executive sign-off for MAJOR and Emergency. |

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
