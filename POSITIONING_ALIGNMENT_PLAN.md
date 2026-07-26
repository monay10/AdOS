# AdOS — Positioning Alignment Plan

**Inputs:** `PRODUCT_TRUTH.md` (code truth) · `POSITIONING_GAP_ANALYSIS.md` (gaps
C1–C5, M1–M5, N1–N4, K1–K3).
**This plan groups the required changes by area and estimates risk, time, and review
effort. It edits nothing.**

---

## 0. Chosen direction

This plan executes **Option A — position to the code**: present AdOS as the
**autonomous AI advertising-agency operating system** it actually is (local,
offline-capable, human-gated brief→creative→campaign→report). Rationale: it is
truthful now, needs no engineering, and the advertising-family collateral (website,
presentation, README) is already ~aligned. **Option B — build to the marketing** (a
document Company Brain, Digital Employees, permission-aware AI, audit trail) is
sized in the appendix; it is a multi-quarter engineering program, not a
communications fix.

**Legend.** Risk = chance a change breaks something or misleads if done wrong (Low/
Med/High). Time = focused effort. Review = human sign-off needed (Low/Med/High:
bilingual + factual re-validation raises it).

---

## 1. Documentation — Sales Kit + Marketing (`sales/`, `marketing/`)

The heaviest area: these families assert the non-existent Enterprise-KM identity.

| Change | Gaps | Risk | Time | Review |
|---|---|---|---|---|
| Rewrite both **constitutions** (`SALES_KIT_CONSTITUTION.md`, `MARKETING_CONSTITUTION.md`) canonical facts: category → advertising-agency OS; redefine Company Brain as marketing-performance memory; drop "Digital Employees" pillar; downgrade permission-aware/audit claims to roadmap | C1–C4, M1, M2 | Low (docs) | 1–1.5 d | High |
| Propagate the new canon through Sales Kit (one-pager, brochure, FAQ, objection handling, case studies, proposal) — bilingual | C1–C4, M1, M2, N1 | Low | 2–3 d | High |
| Propagate through Marketing (website content, blog strategy, 20 articles, 156 LinkedIn posts, press kit, launch, assets) — bilingual; re-run assembly/validation | C1–C4, M5, N1–N3 | Low | 3–5 d | High |
| Update ROI calculator framing (it is generic already; align labels to advertising outcomes) | C1 | Low | 0.5 d | Med |
| Re-run `*_VALIDATION_REPORT.md` gates after edits | all | Low | 0.5 d | Med |

**Subtotal:** ~7–10 person-days · Risk **Low** · Review **High** (bilingual + claim
re-validation is the real cost, not the typing).

---

## 2. Website (`website/`)

Already advertising-accurate; only overstatements and the tagline mismatch remain.

| Change | Gaps | Risk | Time | Review |
|---|---|---|---|---|
| Soften "autonomous" → "AI-assisted, human-approved" | M3 | Low | 0.25 d | Low |
| "Run advertising campaigns" → "plans/drafts campaigns for human launch" | N2 | Low | 0.25 d | Low |
| Reconcile title/hero tagline with body (pick "Enterprise AI OS for advertising" or "AI ad-agency OS" consistently) | K2 | Low | 0.25 d | Med |
| Rebuild the static site if copy files change (`pnpm build`) and re-check lint | — | Low | 0.25 d | Low |

**Subtotal:** ~1 person-day · Risk **Low** · Review **Low–Med**.

---

## 3. Presentation (`presentation/`)

Mixed messaging: advertising slides are fine; the Company Brain / Digital Employees
slides assert the KM identity.

| Change | Gaps | Risk | Time | Review |
|---|---|---|---|---|
| Reframe Slide 10 (Company Brain → marketing-performance memory) | C2, K3 | Low | 0.5 d | Med |
| Rework/replace Slide 11 (Digital Employees → the human-gated AI pipeline, or mark roadmap) | C3 | Low | 0.5 d | Med |
| Soften "autonomous" language across narration/speaker notes | M3 | Low | 0.25 d | Low |
| Regenerate `.pptx` + `.pdf` from the build script and re-verify visually | — | Low | 0.25 d | Med |

**Subtotal:** ~1.5 person-days · Risk **Low** · Review **Med**.

---

## 4. Demo (`demo/`)

The largest single fix: the demo models a manufacturer KM product that the engine
cannot run.

| Change | Gaps | Risk | Time | Review |
|---|---|---|---|---|
| Redesign the demo world to the real domain model (Workspace→Client→Brand→Product→Mission→brief/creative/campaign/report) | C5 | Med | 2–3 d | High |
| Rewrite `demo/src/*.mjs` seeders/validators to the agency entities; drop T0–T4 tiers → fixed campaign gates | C5, M4 | Med | 1–2 d | High |
| Rewrite the demo docs (`DEMO_*.md`) to the advertising narrative | C5 | Low | 1 d | Med |
| Best: drive the demo through the **actual `apps/web` flows** (offline AI) so "demo == product" | C5, N1 | Med | 1–2 d | High |
| Re-run demo tests + determinism/reset checks | — | Low | 0.5 d | Med |

**Subtotal:** ~5–8 person-days · Risk **Med** (isolated to `demo/`) · Review **High**.

---

## 5. Application UI (`apps/web`)

The app is advertising-accurate; changes are honesty labels + the tagline decision.
Any edit here must keep **111/111 tests green**.

| Change | Gaps | Risk | Time | Review |
|---|---|---|---|---|
| Finalize the product tagline string (`i18n.ts` `app.tagline`, `login.subtitle`) to the chosen positioning | C1, K1 | Low | 0.25 d | Med |
| Add an honest "offline demo mode / connect a local engine for live AI" note in the UI where AI output is shown | N1 | Low | 0.5 d | Med |
| (Optional) surface that campaigns are drafts pending human launch | N2 | Low | 0.25 d | Low |
| Run typecheck + full web test suite after any string change | — | Low | 0.25 d | Low |

**Subtotal:** ~1–1.5 person-days · Risk **Low** (wording only; tests gate) · Review **Med**.

> Not in scope for Option A: enforcing RBAC, adding an audit store, DB RLS,
> connectors, agents — those are Option B (appendix), not alignment.

---

## 6. Repository (`README.md`, `ARCHITECTURE.md`, structure)

| Change | Gaps | Risk | Time | Review |
|---|---|---|---|---|
| Align README title + body to one positioning; correct feature claims to the audit | C1, K2 | Low | 0.5 d | Med |
| Update `ARCHITECTURE.md` opening + any KM/agent claims to match implemented domains | C1, C3 | Low | 0.5 d | Med |
| Decide the fate of orphaned domains (`agent-framework`, `autonomy`, `workflow-engine`, `knowledge-engine`, `organization`, `corporate-os`, `connector-hub`, `prompt-registry`): keep as clearly-labeled **roadmap scaffolding** in a ROADMAP, or remove | C3, M5 | Med (if removing code) | 0.5–1 d | Med |
| Correct the RLS comment in `packages/persistence/.../database.ts:8-10` (claims RLS that doesn't exist) | M2 | Low | 0.1 d | Low |

**Subtotal:** ~1.5–2 person-days · Risk **Low–Med** · Review **Med**.

---

## 7. Package Metadata (`package.json` files)

| Change | Gaps | Risk | Time | Review |
|---|---|---|---|---|
| Rewrite root `package.json:5` description to one non-contradictory line | K1 | Low | 0.1 d | Low |
| Add/keep concise descriptions on domain/package `package.json`s; mark placeholder domains as such | C3, M5 | Low | 0.5 d | Low |
| Confirm no build/publish metadata references the retired positioning | K1 | Low | 0.1 d | Low |

**Subtotal:** ~0.5–1 person-day · Risk **Low** · Review **Low**.

---

## 8. Rollup & sequencing (Option A)

| Area | Time | Risk | Review |
|---|---|---|---|
| 1 · Documentation (sales + marketing) | 7–10 d | Low | High |
| 2 · Website | ~1 d | Low | Low–Med |
| 3 · Presentation | ~1.5 d | Low | Med |
| 4 · Demo | 5–8 d | Med | High |
| 5 · Application UI | 1–1.5 d | Low | Med |
| 6 · Repository | 1.5–2 d | Low–Med | Med |
| 7 · Package metadata | 0.5–1 d | Low | Low |
| **Total** | **~18–25 person-days** | **Low–Med overall** | **High (bilingual re-validation dominates)** |

**Recommended order** (truth first, then radiate):
1. **Repository + Package metadata** (§6, §7) — cheap, sets the canonical one-liner.
2. **Documentation constitutions** (§1) — establish the new canon.
3. **Application UI tagline + honesty notes** (§5) — cheap, keeps app truthful.
4. **Website + Presentation** (§2, §3) — small edits to already-aligned assets.
5. **Propagate the canon through the rest of sales/marketing** (§1 remainder).
6. **Demo rebuild** (§4) — largest; do once the target positioning is locked.
7. Re-run every validation/assembly gate.

**Cross-cutting guardrails:** keep everything bilingual TR/EN; product terms in
English; no invented prices/customers/certifications; **run the web test suite after
any `apps/web` change** (must stay 111/111); keep GTM collateral isolated from app
code.

---

## Appendix — Option B (build to the marketing): high-level sizing

Only if the business wants the Enterprise-KM product to become real. Each item is a
*new engineering program*, not a doc edit:

| Capability to build | Rough size | Risk |
|---|---|---|
| Document Company Brain (ingest/chunk/embed/store + retrieval) with **citations** | 4–8 wks | High |
| Permission model actually enforced (wire `AccessControl` into routes + AI retrieval) | 2–4 wks | High |
| "Digital Employees" (real agent loop: tools, task queue, multi-step) | 6–12 wks | High |
| Immutable audit trail (append-only, tamper-evident store) | 1–2 wks | Med |
| DB-level RLS + tenant-scope `upsert`/`delete` + Company-Brain tenant scoping | 1–2 wks | Med |
| Real external connectors (ad platforms / storage / email) | 3–6 wks | High |
| Live campaign launch + metric ingestion | 3–6 wks | High |

**Option B total:** multiple quarters and material team investment, after which the
current sales/marketing/demo would become truthful. **This plan recommends Option
A** and treats Option B as a separate product-roadmap decision.

---

*No files were modified to produce this plan. All estimates are planning figures for
the user's decision; actuals depend on scope and reviewers.*
