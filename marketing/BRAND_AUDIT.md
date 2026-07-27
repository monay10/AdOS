# AdOS Brand Consistency Audit

**Role:** AdOS Brand Guardian
**Status:** ✅ AUDITED — legacy category term eradicated; package on-brand
**Scope:** the marketing package + brand-surface files repo-wide (README,
ARCHITECTURE, package.json, `website/`, `presentation/`, app UI strings)
**Reference:** `MARKETING_CONSTITUTION.md` (§4 voice, §19 visual, §20 CTA),
`SALES_KIT_CONSTITUTION.md` §20.1 (canonical terminology)

---

## 0. Headline result

- **Legacy category term "Advertising-OS (legacy)" / "Reklam İşletim
  Sistemi" — ERADICATED repo-wide.** Replaced everywhere with **"Enterprise AI
  Operating System" / "Kurumsal Yapay Zekâ İşletim Sistemi"**, including the core
  app UI strings, after confirming no test asserts the tagline. Repo-wide grep now
  returns **0** occurrences (outside the audit/validation reports that necessarily
  quote it).
- **App safety gate: PASSED.** After editing the app tagline strings, the web app
  typechecks cleanly and **all 111 tests pass**. Wording changed; no logic, API,
  or test changed.
- **Marketing package brand hygiene: strong.** The apparent naming variants
  resolve to legitimate, context-correct usage (details in §3). One trivial label
  ("Airgap") was normalized to "Air-gap".

---

## 1. Auto-fixed inconsistencies (documentation)

| # | Fix | Files |
|---|---|---|
| 1 | `Advertising-OS (legacy)` → `Enterprise AI Operating System` | `README.md`, `ARCHITECTURE.md`, `package.json`, `website/*.md` (4), `website/index.html`, `website/src/i18n/content.ts`, `presentation/*.md` (4), `apps/web/src/i18n.ts`, `apps/web/src/auth/pages.ts` |
| 2 | `the legacy Turkish category label` → `Kurumsal Yapay Zekâ İşletim Sistemi` (incl. combining-dot Unicode forms) | `website/*` (3), `apps/web/src/i18n.ts`, `presentation/PRESENTATION_CONTENT.md` |
| 3 | Asset label `Airgap` → `Air-gap` | `marketing/MARKETING_ASSETS.md` |

All fixes are **wording-only**; no meaning was changed.

---

## 2. Brand-element audit (requested dimensions)

| Element | Standard | Finding |
|---|---|---|
| **Logo naming** | `AdOS` wordmark; clear space; never recolor/distort (Press Kit) | ✅ Consistent; Press Kit defines usage. |
| **Product naming** | `AdOS` (never ADOS/Ados/adOS) | ✅ Only `ADOS/Ados` hits are rule-listing lines forbidding them. |
| **Company Brain** | Title Case; English in both languages | ✅ Consistent (lowercase hits are SEO keyword cells — see §3). |
| **AI-assisted campaign pipeline** | Title Case; English in both languages | ✅ Consistent (one lowercase hit is an SEO keyword cell). |
| **Local AI** | "Local AI" / "local AI" | ✅ Consistent. |
| **On-Prem / On-Premise** | hyphenated | ✅ `on-prem`/`on-premise` hyphenated throughout; capitalization follows sentence position (normal). |
| **Offline AI** | "offline-first" (adj.), "offline" | ✅ `offline-first` dominant and hyphenated; "Offline AI" used as a labeled concept. |
| **Enterprise AI Operating System** | the sole valid category term | ✅ Present across the package; legacy term gone (§0). |
| **Security messaging** | "data never leaves the premises", air-gap, human-approved, audit trail | ✅ Consistent and canon-aligned. |
| **Typography** | one modern sans; dark-first (design system) | ✅ Governed by `website/WEBSITE_DESIGN_SYSTEM.md`; assets reference it. |
| **Capitalization** | product terms Title Case; canon terms lower mid-sentence | ✅ Consistent; variants are sentence-position, not errors. |
| **Hyphenation** | `on-prem`, `air-gap` (adj.), `air gap` (noun), `human-approved`, `per-token` | ✅ Dominant forms hyphenated; see §3 for legitimate exceptions. |
| **Color naming** | tokens in the design system | ✅ Centralized in the design system; no ad-hoc color names in copy. |
| **Navigation wording** | IA labels (Platform, Solutions, Security, Pricing, …) | ✅ Consistent with `WEBSITE_CONTENT.md` page set. |
| **Button wording (CTA)** | canonical labels only (§20) | ✅ Request a Demo / See the Platform / Calculate Your ROI / Read the Guide / Talk to Sales; no off-brand CTAs. |

---

## 3. Reviewed variants — legitimate, not defects

| Pattern | Why it is correct |
|---|---|
| `company brain` lowercase (SEO keyword cells) | Conventionally lowercase in keyword cells — not product-name references in prose. *(Prior "digital employees" keyword references were retired in the PRODUCT_TRUTH alignment.)* |
| `air gap` (two words) vs `air-gapped` | Correct English: **noun** "air gap", **adjective** "air-gapped" / "air-gap capable". |
| `#AirGap` (camelCase) | Standard **hashtag** casing in LinkedIn content — intentional. |
| `On-prem` / `On-Prem` at sentence start | Sentence-position capitalization of the hyphenated term — normal. |

---

## 4. Primary strategic finding (requires your decision)

**Product-identity divergence between the application and the go-to-market
materials.** The **core application** (`apps/web`, `domains/`, `packages/`) and
its original docs (`README.md`, `ARCHITECTURE.md`, parts of `website/` and
`presentation/`) describe AdOS as an **autonomous AI advertising agency /
platform** (campaigns, ad sets, etc.). The **recent go-to-market work** (this
marketing package, the sales kit, and the NovaMak demo) describes AdOS as an
**Enterprise AI Operating System** for knowledge and operations (Company Brain,
AI-assisted campaign pipeline, Workflows & Approvals) — with **no advertising**.

- **What this audit changed:** only the **category term** (the explicit
  instruction) — so the brand now consistently *labels* AdOS an "Enterprise AI
  Operating System" everywhere.
- **What it deliberately did NOT change:** the deeper **advertising
  product-description copy** in `website/`, `presentation/`, `README.md`,
  `ARCHITECTURE.md`, and the app. Rewriting it would change meaning and could
  misdescribe what the underlying product actually does — a call only you can make.
- **Recommendation:** decide the single canonical product definition, then
  commission a focused follow-up to reconcile the app + website + presentation
  body copy to it. Until then, `package.json` and a few identity lines carry both
  the new category label and legacy "advertising platform" descriptors — noted
  here rather than silently rewritten.

---

## 5. Conclusion

The AdOS brand is **consistent across the marketing package**, and the legacy
"Advertising-OS (legacy)" category term has been **eliminated repo-wide**
(app tests green). The remaining divergence is strategic, not typographic, and is
escalated in §4 for your decision.

**Status: ✅ AUDITED — package on-brand; one strategic decision flagged.**

*Isolated reporting in `marketing/`; the wording fixes touch brand-surface files
and two app UI strings (verified: 111/111 tests pass) — no application logic,
API, or test was modified.*
