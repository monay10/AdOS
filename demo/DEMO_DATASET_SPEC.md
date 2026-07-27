# AdOS Demo — Dataset Specification

The **single source of truth** for the demo data. Everything the demo shows is
built deterministically from the canonical model (`src/data-model.mjs`) by the
seeder (`src/seed.mjs`) and checked by the validator (`src/validate.mjs`). The
world is **internally consistent** by construction: every reference resolves,
every KPI reconciles, and a reset reproduces it byte-for-byte. Fictional;
isolated to `demo/`. A reader of this file can predict exactly what
`npm run validate` checks.

The demo tenant is an **advertising agency — "Vega Reklam Ajansı"** (İstanbul) —
running AdOS to take its clients' advertising objectives through the
**human-approved campaign pipeline** (brief → creative → campaign draft → report
→ executive report). This mirrors the real product model (`PRODUCT_TRUTH.md §1`):
Workspace → Client → Brand → Product → Project → Mission → Approval → Asset.

**Design invariants (must always hold):**
1. Every foreign key resolves (no dangling references).
2. Pipeline artifacts exist only for a **contiguous prefix** of the ordered
   stages (brief → creative → campaign draft → report → executive).
3. Every gate stage a mission reaches carries a **human** approval; every
   approval is `human: true`.
4. Every campaign draft stays `status: 'draft'` — **never launched**.
5. Every CampaignReport's KPIs recompute exactly from its raw ad numbers.
6. All mission/approval/draft/activity timestamps fall in the demo window ending
   `demo_today`.
7. Determinism: same `(seed, demo_today)` → byte-identical world (checksum match).

**Determinism:** a fixed integer **seed = 20260727** and a fixed
`demo_today = 2026-07-27` drive all generated values through a seeded mulberry32
PRNG (`src/prng.mjs`) — no `Math.random`, no wall-clock. Dates are computed as
`back(days)` offsets from `demo_today`, so the world never looks stale. Rebuilding
with the same `(seed, demo_today)` yields an identical SHA-256 checksum over a
stable, sorted-key serialization (`checksum()` in `src/seed.mjs`).

---

## 1. Workspace / tenant (`workspace`)
- **Count:** 1. `{ id, name, type, city, locale }`.
- **Value:** `ws-vega`, "Vega Reklam Ajansı", `agency`, İstanbul, `tr`.

## 2. Clients (`clients`)
- **Count:** 6. `{ id, name, sector }`.
- **Values:** NovaMak Endüstri (manufacturing), Derma Cosmetics (beauty),
  Fresh Foods (fmcg), FinTR Katılım (finance), Evim Home (retail),
  Getaway Travel (travel). *(NovaMak is now a CLIENT of the agency.)*

## 3. Brands (`brands`)
- **Count:** 12 (2 per client). `{ id, client_id, name, voice, banned_words[] }`.
- **Consistency:** `client_id` resolves to §2. `voice` and `banned_words[]` are
  the brand guardrails (e.g. NovaMak Pro bans `ucuz`/`bedava`/`garanti`).

## 4. Products (`products`)
- **Count:** 24 (2 per brand). `{ id, brand_id, name, price_try }`.
- **Consistency:** `brand_id` resolves to §3. `price_try` carries pricing (₺);
  finance products (funds/wallets) are priced 0.

## 5. Team (`team`)
- **Count:** 22 — 16 internal agency members + 6 client-side approvers.
  `{ id, name, role, kind, email, active, locale }`.
- **`kind`:** `internal` (agency) or `client` (approver). `email` is a slugged
  `ad.soyad@vega.ajans.tr`; `active: true`; `locale: 'tr'`.
- **Roles are LABELS ONLY** (Agency Director, Account Manager, Creative Director,
  Copywriter, Media Planner, Performance Analyst, …). There is **no permission
  enforcement** — only human approval. A `CLIENT_APPROVER` map links each client
  to its one client-side approver.

## 6. Projects (`projects`)
- **Count:** ~22 (1–2 per brand, chosen by a seeded coin flip).
  `{ id, brand_id, client_id, name, created_at }`.
- **`name`:** `<brand> <Yıllık Plan|Lansman|Performans|Sezon>`.
- **Consistency:** `brand_id`/`client_id` resolve to §3/§2. `created_at` is
  120–400 days back — projects are **not** bound by the §14 temporal window.

## 7. Missions (`missions`)
- **Count:** 40. `{ id, workspace_id, client_id, brand_id, product_id, project_id,
  objective, stage, status, created_at, budget_try }`.
- **`objective`:** `<brand>: <natural-language objective>` (from `OBJECTIVES`).
- **`stage` / `status`:** if the mission ran the full pipeline, `stage: 'closed'`,
  `status: 'closed'`; otherwise `stage` = the last reached stage key and
  `status: 'in_progress'`.
- **Progress:** each mission advances to a seeded stage count in `1..5` (biased
  toward completed). Reached stages are the **first N** of the ordered pipeline.
- **`budget_try`:** 50 000 + k·12 500 ₺. `created_at` is 2–88 days back.

## 8. Pipeline artifacts (one per reached stage)
The pipeline is fixed, ordered, and human-gated
(`PIPELINE_STAGES` in `src/data-model.mjs`):

| Stage key | Artifact | Gate |
|---|---|---|
| `brief` | MarketingBrief | `strategy_and_budget` |
| `creative` | CreativeSet | `creative_assets` |
| `campaign_draft` | CampaignDraft | `campaign_launch` |
| `report` | CampaignReport | — |
| `executive` | ExecutiveReport | — |

- **Briefs (`briefs`):** `{ id: brf-<mid>, mission_id, objective, audience,
  key_message, budget_try, channels_suggested[], provenance: 'ai-offline', at }`.
- **Creative sets (`creative_sets`):** `{ id: crv-<mid>, mission_id, brand_id,
  headline, ad_copy, cta, social_post, landing_page, email,
  banned_words_respected: true, copy_only: true, at }` — **copy only; never
  touches ad platforms.**
- **Campaign drafts (`campaign_drafts`):** `{ id: cmp-<mid>, mission_id,
  status: 'draft', total_budget_try, channels: [{ channel, budget_try, ad_sets }],
  at }`. `channels` allocate the budget across 2–4 of Meta / Google Ads / YouTube
  / TikTok / LinkedIn / Display. **`status` is ALWAYS `draft` — never launched.**
- **Campaign reports (`campaign_reports`):** `{ id: rpt-<mid>, mission_id,
  impressions, clicks, spend_try, conversions, leads, revenue_try,
  ctr, cpc, cpa, cpl, roas, roi, at }`. Raw ad numbers are seeded, then the six
  KPIs are recomputed deterministically (`computeKpis`, mirrors
  analytics-engine `kpi.ts:39-50`).
- **Executive reports (`executive_reports`):** `{ id: exec-<mid>, mission_id,
  summary, roas, recommendation, at }` where `recommendation` ∈
  `scale | iterate | revise` per the report's ROAS.
- **AI drafts (`ai_drafts`):** one per reached stage — `{ id: draft-<mid>-<stage>,
  mission_id, stage, engine: 'offline-deterministic', assistant: 'AdOS pipeline',
  outcome: 'drafted', human_reviewed: true, at }`. The offline deterministic AI
  drafts each stage; **no document Q&A, no citations, no autonomous agents.**

## 9. Approvals (`approvals`)
- **Count:** ~118 (≥40) — one per **gate** stage a mission reaches (brief,
  creative, campaign draft). `{ id: apr-<mid>-<gate>, mission_id, gate, approver_user_id,
  decision, human: true, at }`.
- **Approver:** the `campaign_launch` gate is signed by the brand's client-side
  approver; earlier gates by an internal agency member.
- **`decision`:** `approved`, except a fraction of **frontier** gates (the last
  reached stage of a not-yet-closed mission) sit at `pending`.

## 10. Company Brain (`company_brain`)
A **marketing-performance** memory — **not** a document knowledge base and with
**no citations**. Object shape:
- **`company_dna`:** single record `{ id, mission, positioning, tone, north_star }`.
- **`brand_profiles[]`:** one per brand (12) — `{ brand_id, voice, banned_words,
  top_channel, campaigns_run, avg_roas }`.
- **`marketing_insights[]`:** up to 5, top brands by ROAS —
  `{ id, brand_id, kind: 'marketing', detail }`.
- **`creative_insights[]`:** 4 winning-ad patterns —
  `{ id, kind: 'creative', detail }`.
- **`sales_insights[]`:** up to 4 ROAS-positive campaigns —
  `{ id, kind: 'sales', detail }`.
- **`sop_performance[]`:** one per pipeline stage (5) —
  `{ stage, artifact, runs, approval_rate }`.
- **`knowledge_graph`:** `{ nodes[], edges[] }`. Per CampaignReport, 4 nodes
  (`campaign → ad → lead → roi`) and 3 edges (`uses` / `generated` /
  `contributed`).
- **`pattern_library[]`:** 6 seeds — `{ id, pattern, avg_lift_pct, uses }`.
- **`experience_engine[]`:** one per CampaignReport —
  `{ mission_id, brand_id, objective, roas, roi, outcome }`.

## 11. Metrics (`metrics`)
- **Count:** 11 headline KPIs — `{ id, name, unit, value }`, each **computed from
  the seeded records** (clients, brands, products, missions, closed missions,
  drafts, reports, approvals, pending approvals, average ROAS, ROAS-positive
  count). No standalone, unreconciled numbers.

## 12. History (`history`)
- **Count:** 1 200 back-history change records — `{ entity_type, entity_id, field,
  old, new, at, actor_user_id }`, `at` 1–90 days back. Populates trend density;
  not bound by the strict §14 temporal check.

## 13. Activity log (`activity_log`)
- **Purpose:** an ordered, tenant-scoped log of consequential actions.
  **NOT an immutable audit trail** (that is Roadmap).
- **Count:** ~324 (≥100) — one entry per AI draft + per approval + per mission.
  `{ id: log-#####, at, actor_user_id, action, object_type, object_id,
  workspace_id, result: 'ok' }`.
- **Actions:** `pipeline.<stage>.drafted` (object = mission),
  `approval.<decision>` (object = approval), `mission.created` (object = mission).

## 14. Meta (`meta`)
`{ seed, demo_today, generated_records }`. `generated_records` is the sum of all
seeded record arrays (~2 100). The **temporal window** for validation is
`[demo_today − 91d, demo_today + 1d]` and applies to missions, approvals, AI
drafts, and the activity log.

---

## 15. Volumes (seeded, checked)

| Dataset | Count | Validator gate |
| --- | --- | --- |
| Workspace | 1 | — |
| Clients | 6 | `=== 6` |
| Brands | 12 | `=== 12` |
| Products | 24 | `=== 24` |
| Team | 22 (16 + 6) | — |
| Projects | ~22 | — |
| Missions | 40 | `=== 40` |
| Campaign drafts | ~38 | `>= 20` |
| Campaign reports | ~29 | `>= 15` |
| Executive reports | ~19 | — |
| Approvals | ~118 | `>= 40` |
| AI drafts | ~166 (one per reached stage) | — |
| Metrics | 11 | — |
| History | 1 200 | — |
| Activity log | ~324 | `>= 100` |

Counts vary within the seeded ranges but reproduce **exactly** for a given
`(seed, demo_today)`.

---

## 16. Validation checks (`npm run validate`)

The validator loads `demo/data/world.json`, runs these 11 checks, and prints
PASS/FAIL with the checksum and counts. A demo is only "ready" on PASS:

1. **Referential integrity** — every `client_id`/`brand_id`/`product_id`/
   `project_id`/`mission_id` and every approver `approver_user_id` resolves.
2. **Pipeline order** — for each mission the present artifacts (brief → creative
   → campaign draft → report → executive) form a **contiguous prefix**; none
   appears after a gap.
3. **Human approval at every reached gate** — a mission with a creative set has a
   `strategy_and_budget` approval; with a campaign draft, a `creative_assets`
   approval; and **every** approval is `human: true`.
4. **Campaign drafts never launched** — every draft has `status: 'draft'`.
5. **Ad-KPI reconciliation** — each report's `ctr, cpc, cpa, cpl, roas, roi`
   recompute exactly from `impressions/clicks/spend_try/conversions/leads/
   revenue_try`.
6. **Company Brain integrity** — every knowledge-graph edge's endpoints exist;
   `brand_profiles` cover all brands; every `experience_engine.mission_id` exists.
7. **Temporal window** — every mission/approval/AI-draft/activity timestamp lies
   in `[demo_today − 91d, demo_today + 1d]`.
8. **Determinism** — rebuilding from `meta.seed` + `meta.demo_today` yields an
   identical checksum.
9. **Activity-log completeness** — every approval id and every mission id appears
   as an `object_id` in the activity log.
10. **No absent-capability data (guardrail)** — the serialized world contains
    **none** of the keys `cited_doc_ids`, `citation`, `permission_tier`,
    `visibility`, `rbac`, `immutable`. AdOS has no document citations, no
    permission tiers / RBAC enforcement, no restricted-visibility data, and no
    immutable-audit store — so this data must never appear.
11. **Volumes match spec** — the §15 validator gates all hold.

Failure of any check exits non-zero and blocks the demo.

---

## Appendix — Dataset guardrails
- One source of truth: the canonical model + seeder + validator; the doc, data,
  and app never drift.
- Deterministic (seed = 20260727; dates relative to `demo_today`); rebuilt via
  `npm run reset` (deterministic rebuild + atomic swap) and re-checked with
  `npm run validate`. `npm run setup` seeds and validates; `npm test` runs the
  suite. Data lives at `demo/data/world.json` (gitignored).
- Models **only what the product actually does**: an offline, human-gated
  campaign pipeline that drafts (never launches) campaigns. No documents, no
  cited answers, no permission tiers, no restricted-visibility data, no immutable
  audit, no launched/optimized live campaigns, no external connectors — the
  validator (§16.10) fails if any such data appears.
- Fictional, isolated to `demo/`, never touching production or the app's tests.
