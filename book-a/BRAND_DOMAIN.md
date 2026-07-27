# BOOK A — A003 · BRAND DOMAIN

> **Owner:** Office of the Chief Product Architect
> **Status:** Official — aligned to PRODUCT_TRUTH.md
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** ../PRODUCT_TRUTH.md
> **Governing reference:** BOOK_A_AGENCY_CONSTITUTION.md (Book A charter)

---

## 0. Purpose

The **Brand** is *"the single source of brand truth the Creative Studio and
reviewers consult"* (`domains/agency-os/src/brand/brand.ts`). It is the aggregate
that tells the AI Company **who a client's brand is** (profile), **how it looks**
(identity), **what it may and may not say** (rules), and **which files represent
it** (assets). Every downstream artifact — the marketing brief and the creative
set — is generated from a plain-DTO projection of the Brand, so brand fidelity is
decided here, once, at the source.

This document models the Brand domain **exactly as the code implements it**, and
separates every requested capability into **Implemented** (backed by code, with a
source path as evidence) and **⚠️ Roadmap** (a proposed v2 design that is *not* a
coded field today). Where the two conflict, PRODUCT_TRUTH.md wins.

**Primary evidence:** `domains/agency-os/src/brand/brand.ts`.

---

## 1. Position in the domain

Brand belongs to **Client**, under a **Workspace**, under a **Tenant**. It is a
DDD `AggregateRoot` with a typed `BrandId`, private props, a `create()` factory
returning `Result<Brand, ValidationError>`, `restore()`, `snapshot()`, and domain
events.

```
Tenant
 └─ Workspace (agency-os)
     └─ Client                         (owns the Brand — brand.clientId)
         ├─ Brand   ◀── this document  (profile / identity / rules / assets)
         ├─ Product                    (pricing/features — separate aggregate)
         ├─ Project (→ brandId)        (a project references one Brand)
         └─ Mission                    (pipeline consumes the Brand via DTOs)
```

| Relationship | Direction | Evidence |
|---|---|---|
| Brand → Client | `brand.clientId` (required, non-empty) | `brand.ts` `create()` `Guard.againstEmptyString(input.clientId,'clientId')` |
| Brand → Tenant | `brand.tenantId` (required, non-empty) | `brand.ts` `create()` guard + event metadata `{ tenantId }` |
| Project → Brand | Project carries `brandId` | `domains/agency-os/src/project/project.ts` |
| Asset → Brand | manual library `Asset` may reference `brandId?` | `domains/agency-os/src/asset/asset.ts` |
| Brand → MarketingBrief / CreativeSet | via `*Context` DTOs (§9) | `apps/web/src/routes.ts` |

Brand is a **passive** aggregate: it never imports another context. The routes
layer (`apps/web/src/routes.ts`) reads a Brand and assembles the DTOs the pipeline
consumes.

---

## 2. Aggregate shape (Implemented — exact)

`BrandProps` (`domains/agency-os/src/brand/brand.ts`):

| Field | Type | Notes | Evidence |
|---|---|---|---|
| `tenantId` | `string` | required, non-empty | `brand.ts` `BrandProps` |
| `clientId` | `string` | required, non-empty — the owning Client | `brand.ts` `BrandProps` |
| `name` | `string` | required, non-empty; trimmed on create | `brand.ts` `create()` |
| `profile` | `BrandProfile` | who the brand is + how it speaks (§3) | `brand.ts` `interface BrandProfile` |
| `identity` | `BrandIdentity` | the visual system (§5) | `brand.ts` `interface BrandIdentity` |
| `rules` | `BrandRules` | do/don't + banned words (§7) | `brand.ts` `interface BrandRules` |
| `assets` | `BrandAsset[]` | named files in storage (§8) | `brand.ts` `interface BrandAsset` |
| `status` | `'active' \| 'archived'` | lifecycle (§10) | `brand.ts` `type BrandStatus` |

`create()` requires only `tenantId`, `clientId`, and `name`; `profile`, `identity`,
and `rules` are optional `Partial<>` inputs merged over defaults, and `assets`
always starts `[]`. There is **no `logoUrl`/asset validation beyond non-empty
`name`/`url`** and no field beyond those listed — do not assume more.

---

## 3. Brand identity — profile (Implemented)

`BrandProfile` (`brand.ts`) — *"who the brand is and how it speaks."*

| Field | Type | Default | Evidence |
|---|---|---|---|
| `mission` | `string` | `''` | `brand.ts` `DEFAULT_PROFILE` |
| `values` | `string[]` | `[]` | `brand.ts` `DEFAULT_PROFILE` |
| `voice` | `string` | `'professional'` | `brand.ts` `DEFAULT_PROFILE` |
| `targetAudience` | `string` | `''` | `brand.ts` `DEFAULT_PROFILE` |

- **Brand identity (the "who")** = the whole `profile{}` block plus `name`. It is
  free text and string arrays — there is no controlled vocabulary or enum.
- **Tone of voice** = `profile.voice`, a single free-text string that **defaults
  to `'professional'`**. There is no tone taxonomy, no per-channel voice, and no
  multiple-voice support in code.
- **Audience** = `profile.targetAudience`, a single free-text string. There is no
  structured segment, persona, or demographic model (see §11 Roadmap).

`updateProfile(profile: Partial<BrandProfile>)` merges a partial over the current
profile and emits `brand.profile_updated.v1`. It calls `guardActive()` first — an
archived Brand cannot be updated (throws `ValidationError`).

---

## 4. Products relationship (Implemented — relationship only)

Products are a **separate aggregate** (`domains/agency-os/src/product/product.ts`),
owned by the same Client, carrying pricing and features. The **Brand does not embed
products**; `BrandProps` has no product field. In the live pipeline, product context
is passed alongside brand context to the generators (`app.briefs.generate({ … 
productName, productDescription })`, `apps/web/src/routes.ts`), not through the Brand.

> The Company Brain's brand *projection* does carry a `products: string[]` list
> (§10 memory linkage), but that is a denormalized reference list inside the
> in-memory learning store, **not** a field of the Brand aggregate.

---

## 5. Color palette & visual rules

### 5.1 Color palette (Implemented)

`BrandIdentity` (`brand.ts`) — *"the visual system."*

| Field | Type | Default | Evidence |
|---|---|---|---|
| `primaryColor` | `string` | `'#000000'` | `brand.ts` `DEFAULT_IDENTITY` |
| `secondaryColor` | `string` | `'#ffffff'` | `brand.ts` `DEFAULT_IDENTITY` |
| `logoUrl` | `string` (optional) | — (unset) | `brand.ts` `interface BrandIdentity` |
| `typography` | `string` | `'sans-serif'` | `brand.ts` `DEFAULT_IDENTITY` |

- **Color palette (real)** = exactly two color slots: `primaryColor` and
  `secondaryColor`. Values are free-text strings (hex by convention; **not
  validated** as colors). There is no N-color palette, no accent/neutral ramp, and
  no per-usage color roles in code.
- `updateIdentity(identity: Partial<BrandIdentity>)` merges and emits
  `brand.identity_updated.v1` (guards active).

### 5.2 Visual rules (Partial — typography/colors real; broader guidelines Roadmap)

| Aspect | State | Evidence |
|---|---|---|
| Typography directive | **Implemented** — `identity.typography` (one string, def `'sans-serif'`) | `brand.ts` |
| Primary/secondary color | **Implemented** — two color slots | `brand.ts` |
| Logo reference | **Implemented** — `identity.logoUrl?` and/or a `logo`-kind asset (§8) | `brand.ts` |
| Spacing, grid, imagery style, iconography, layout do/don'ts, usage examples | **⚠️ Roadmap** — no coded fields | — |

The Brand carries enough for a machine-readable *visual anchor* (two colors, one
type directive, a logo pointer). A full brand-style-guide model (imagery,
spacing, grids, motion, accessibility contrast rules) is **not** in code and is
proposed for v2.

---

## 6. Asset library (Implemented)

`BrandAsset` (`brand.ts`) — *"a named brand asset (logo, style guide, image) held
in storage."*

| Field | Type | Notes | Evidence |
|---|---|---|---|
| `id` | `string` | `randomUUID()` if not supplied | `brand.ts` `addAsset()` |
| `kind` | `'logo' \| 'image' \| 'document' \| 'font' \| 'other'` | fixed union | `brand.ts` `interface BrandAsset` |
| `name` | `string` | required, non-empty; trimmed | `brand.ts` `addAsset()` guard |
| `url` | `string` | required, non-empty; trimmed | `brand.ts` `addAsset()` guard |

- `addAsset({ kind, name, url, id? })` validates `name` and `url` are non-empty
  (`Guard.all`), appends to `assets[]`, emits `brand.asset_added.v1`, and returns
  `Result<BrandAsset, ValidationError>`. Guards active first.
- Assets are **append-only via this method** (there is no remove/update-asset
  method on the aggregate). The `url` is a pointer to external storage; the Brand
  stores no binary content.
- This on-Brand asset list is **distinct** from the standalone, versioned
  `Asset` library aggregate (`domains/agency-os/src/asset/asset.ts`), which is a
  manual, human-curated content library with immutable versions.

---

## 7. Restrictions — brand rules (Implemented, with one honest gap)

`BrandRules` (`brand.ts`) — *"do/don't constraints the AI Company must respect."*

| Field | Type | Default | Meaning | Evidence |
|---|---|---|---|---|
| `dos` | `string[]` | `[]` | encouraged directives | `brand.ts` `DEFAULT_RULES` |
| `donts` | `string[]` | `[]` | discouraged directives | `brand.ts` `DEFAULT_RULES` |
| `bannedWords` | `string[]` | `[]` | words the brand forbids | `brand.ts` `DEFAULT_RULES` |

- `updateRules(rules: Partial<BrandRules>)` merges and emits
  `brand.rules_updated.v1` (guards active).
- `snapshot()` deep-copies `dos`, `donts`, and `bannedWords`, so persisted state
  preserves the three lists independently.

### 7.1 ⚠️ `bannedWords` are STORED but NOT ENFORCED

This is the single most important honesty note in this domain and must not be
softened. `rules.bannedWords` **is persisted and round-trips through `snapshot()`
and `restore()`**, but **no code anywhere applies it against generated copy**.
There is:

- no filter, no post-generation validator, and no rejection path that reads
  `bannedWords` before, during, or after brief/creative generation;
- no wiring of `bannedWords` into the `MarketingBriefContext` or
  `CreativeSetContext` DTOs (§9) — those DTOs carry `brandVoice`/`brandValues`
  only, **not** banned words.

**Therefore: brand-safety enforcement of banned words is Roadmap.** Today the
field documents intent and is available for human reviewers to check manually at
the `creative_assets` gate (§9.3); it does **not** automatically constrain AI
output. Likewise `dos`/`donts` are stored guidance, not machine-enforced rules.

---

## 8. Domain events (Implemented)

| Event | Emitted by | Evidence |
|---|---|---|
| `brand.created.v1` | `create()` | `brand.ts` `class BrandCreated` |
| `brand.profile_updated.v1` | `updateProfile()` | `brand.ts` `class BrandProfileUpdated` |
| `brand.identity_updated.v1` | `updateIdentity()` | `brand.ts` `class BrandIdentityUpdated` |
| `brand.rules_updated.v1` | `updateRules()` | `brand.ts` `class BrandRulesUpdated` |
| `brand.asset_added.v1` | `addAsset()` | `brand.ts` `class BrandAssetAdded` |
| `brand.archived.v1` | `archive()` | `brand.ts` `class BrandArchived` |

All events carry `{ tenantId }` metadata, keeping brand changes tenant-attributed
on the event bus.

---

## 9. AI usage — how the Brand feeds generation (Implemented)

The Brand is not consumed directly by the AI domains. The **routes layer** reads a
Brand and projects a small subset of it into the immutable AI-artifact context
DTOs. The generators never see the Brand aggregate.

### 9.1 Marketing brief context

`MarketingBriefContext` (`domains/marketing-intelligence/src/brief/marketing-brief.ts`)
carries, among other fields:

| DTO field | Source on Brand | Evidence |
|---|---|---|
| `brandVoice: string` | `brand.profile.voice` | `apps/web/src/routes.ts` (`brandVoice: brand.profile.voice`) |
| `brandValues: string[]` | `[...brand.profile.values]` | `apps/web/src/routes.ts` (`brandValues: [...brand.profile.values]`) |

The service copies these straight through into the brief's stored `context`
(`domains/marketing-intelligence/src/brief/service.ts`), and the brief is immutable
with `provenance{taskId,capability,model,engine,latencyMs}`.

### 9.2 Creative set context

`CreativeSetContext` (`domains/creative-studio/src/creative/creative-set.ts`)
carries `brandVoice: string`, again sourced from `brand.profile.voice`
(`apps/web/src/routes.ts`, `domains/creative-studio/src/creative/service.ts`). The
creative set produces **copy only** (headline, adCopy, cta, socialPost, landingPage,
email) — no images.

### 9.3 What the AI actually receives from the Brand

| Brand field | Reaches the AI? | Via |
|---|---|---|
| `profile.voice` | **Yes** | `brandVoice` (brief + creative) |
| `profile.values` | **Yes** (brief only) | `brandValues` |
| `profile.mission`, `profile.targetAudience` | No — not projected into the AI DTOs | — |
| `identity.*` (colors/typography/logo) | No — copy-only pipeline, no visual generation | — |
| `rules.dos` / `rules.donts` / `rules.bannedWords` | **No** — not in any context DTO (§7.1) | — |
| `assets[]` | No | — |

**Consequence:** only `voice` and `values` currently steer generation. All other
brand governance (colors, rules, banned words) is **advisory metadata for human
reviewers**, checked — if at all — manually at the `creative_assets` approval gate.

---

## 10. Approval rules (Implemented — via the pipeline gate + generic Approval)

The Brand aggregate has **no approval field of its own**. Brand governance enters
the pipeline through two real, but separate, mechanisms:

1. **The `creative_assets` mission gate.** After a `CreativeSet` is generated, the
   pipeline requests approval on gate `creative_assets`; a human clicks approve
   before the mission proceeds (`apps/web/src/routes.ts`). This is where a reviewer
   is expected to confirm the copy honors the brand — including a *manual* check of
   `bannedWords`/`donts`, since the system does not enforce them (§7.1).
   > Honesty note: the mission's default `approvalGates` array is only
   > `['strategy_and_budget','campaign_launch']`, yet the pipeline always runs
   > `creative_assets` too. The gate array is **advisory metadata**; the gate
   > string is informational, not branch logic, and no tiered (T0–T4) authority
   > exists. See BOOK_A_AGENCY_CONSTITUTION.md.

2. **The generic `Approval` aggregate** (`domains/agency-os/src/approval/approval.ts`)
   — a standalone review object with statuses
   `draft \| in_review \| approved \| rejected \| revision_requested` and an
   **append-only** `timeline[]`. A brand review can be modeled as an `Approval`
   labeled for brand, but "Brand approval" as a *distinct type* is a **label**
   over this one mechanism, not a coded brand-specific workflow.

There is **no** brand-versioning-with-approval, no "publish brand" gate, and no
per-field brand sign-off in code.

---

## 11. Performance memory linkage (Implemented — Company Brain brand profile store)

The Company Brain keeps its **own** brand projection, separate from the agency-os
Brand aggregate, as the store the learning layer reads and enriches.

- Store: `brandStore = new Map<string, BrandProfile>()` with
  `brand(brandId)` / `setBrand(brand)` (`domains/company-brain/src/in-memory-company-brain.ts`).
- Type: `BrandProfile` (`packages/contracts/src/ai/company-brain.ts`):

| Field | Type | Evidence |
|---|---|---|
| `brandId` | `string` | `packages/contracts/src/ai/company-brain.ts` |
| `name` | `string` | " |
| `logoRef` | `string` (optional) | " |
| `toneOfVoice` | `string` | " |
| `forbiddenWords` | `string[]` | " |
| `targetAudience` | `string` | " |
| `colors` | `string[]` | " |
| `products` | `string[]` | " |
| `campaignHistoryRefs` | `string[]` | " |
| `approvedCreativeRefs` | `string[]` | " |

This projection is the **marketing-performance memory** of the brand — it links a
brand to its campaign history and approved-creative references so past performance
can inform future generation. Two honest caveats:

- It is **in-memory** (a global `Map`), **not tenant-scoped**, and durable storage
  is Roadmap (consistent with PRODUCT_TRUTH.md §2 / §6.2).
- Its `forbiddenWords`, like the aggregate's `bannedWords`, is a **stored** field;
  no enforcement path applies it to generated copy (§7.1).

> Note the shape differences from the source aggregate: the memory projection has
> an **N-color `colors[]`** list and a `products[]` list, whereas the source Brand
> aggregate (§3–§7) has exactly `primaryColor`/`secondaryColor` and no product
> field. Treat the Company Brain projection as a *denormalized learning view*, not
> the source of brand truth. The source of brand truth is the agency-os `Brand`.

---

## 12. ⚠️ ROADMAP — proposed v2 fields (NOT coded today)

The following are **frequently-requested brand concepts that do not exist as coded
fields**. They are presented here as a proposed v2 design, explicitly Roadmap, and
must never be described as shipped.

| Concept | Proposed v2 shape (design only) | Why it is Roadmap |
|---|---|---|
| **Personas** | `profile.personas[{ name, needs[], objections[], channels[] }]` | No persona field exists; audience is one free-text `targetAudience` string. |
| **Competitors** | `competitors[{ name, positioning, differentiators[] }]` | No competitor field in `BrandProps`. |
| **Offers** | `offers[{ name, hook, terms, validityWindow }]` | No offer field; Products carry pricing but not offer/promo structures. |
| **Seasonality** | `seasonality[{ label, window, emphasis }]` | No temporal/seasonal field exists anywhere on Brand. |
| **Enforced brand safety** | pre/post-generation validator that rejects copy containing `bannedWords`/violating `donts` | Fields are stored but **never enforced** (§7.1). |
| **Rich visual guidelines** | imagery style, spacing, grid, iconography, contrast/accessibility | Only two colors + one typography string exist (§5.2). |
| **Multi-voice / per-channel tone** | `voice` per channel or per persona | `voice` is a single string. |
| **Durable, tenant-scoped brand memory** | Postgres/graph-backed brand profile store | Company Brain brand store is a global in-memory `Map` (§11). |

Each of these is a **taxonomy/lens over the real single-Brand model**, not a change
to shipped behavior. Adopting any of them is a future decision.

---

## 13. Business & validation rules (Implemented — summary)

| Rule | Behavior | Evidence |
|---|---|---|
| Required on create | `tenantId`, `clientId`, `name` all non-empty | `brand.ts` `create()` `Guard.all` |
| Defaults applied | profile/identity/rules merged over `DEFAULT_*`; `assets: []`; `status: 'active'` | `brand.ts` `create()` |
| Name normalization | `name` trimmed | `brand.ts` `create()` |
| Asset validation | `addAsset` requires non-empty `name` and `url`; returns `Result` | `brand.ts` `addAsset()` |
| Archive guard | any mutation on an `archived` Brand throws `ValidationError` | `brand.ts` `guardActive()` |
| Archive idempotent | `archive()` on an already-archived Brand is a no-op | `brand.ts` `archive()` |
| Deep snapshot | `snapshot()` copies `values`, `identity`, all three rule lists, and `assets` | `brand.ts` `snapshot()` |
| Rehydration | `restore(id, props)` rebuilds without emitting events | `brand.ts` `restore()` |

**Status lifecycle:** `active → archived` (one-way; no un-archive method).

---

## 14. Value contribution

**Serves: production-time ↓ (primary) and revenue ↑ (secondary).**

- **Production time ↓.** Codifying voice and values once, at the Brand, and feeding
  them straight into every brief and creative set (§9) removes the per-mission
  re-briefing of tone and values. A single authoritative brand record cuts creative
  revisions caused by off-brand voice and speeds the `creative_assets` approval,
  because the reviewer checks copy against one known source of brand truth rather
  than reconstructing brand intent each time.
- **Revenue ↑.** Consistent, on-voice, value-aligned copy across the pipeline
  strengthens brand equity and reduces rejected creative that would otherwise delay
  campaign drafts — shortening the path from Mission to an approvable campaign.

The honest limiter (and the highest-leverage Roadmap item): because `bannedWords`
and the do/don't rules are **stored but not enforced** (§7.1), part of this value is
realized only through **manual reviewer diligence** today. Wiring enforcement into
generation (§12) would convert that manual safeguard into an automatic one — a
direct further cut in revision cycles and approval time.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
