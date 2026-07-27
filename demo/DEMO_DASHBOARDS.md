# AdOS Demo — Dashboards / Panolar

**10 role-specific dashboards** for **Vega Reklam Ajansı** (İstanbul) — the agency
workspace running AdOS to take its clients' advertising objectives through the
**human-approved campaign pipeline** (brief → creative → campaign draft → report →
executive report). Each dashboard defines **Widgets**, **KPIs**, **Charts**,
**Filters**, **Audience**, **Refresh policy**, and **Drill-down**. Every view draws
from the single deterministic world (`src/seed.mjs` + `data/world.json`), so numbers
reconcile everywhere and the validator checks it. Fictional; isolated to `demo/`.
Bilingual labels (TR/EN).

**Global rules:**
- **One world, many views** — a metric shows the same value everywhere it appears;
  all figures recompute from records (KPI reconciliation is validated).
- **Role labels, not enforcement** — a dashboard's Audience is a role **label** only.
  AdOS defines roles but **does not enforce RBAC** — the demo is honest about this.
- **Drill-down everywhere** — every KPI/chart resolves to a real seeded record
  (mission, brief, creative set, campaign draft, campaign report, approval).
- **Deterministic & offline** — the world is fixed for a demo (same seed → identical
  numbers); a **local-AI indicator** shows the offline deterministic engine is
  running with no cloud and no egress.

**World at a glance (from `metrics`):** 6 clients · 12 brands · 24 products ·
22 projects · 40 missions (19 closed) · 38 campaign drafts · 29 campaign reports ·
118 human approvals (4 pending) · **average ROAS 2.61x** · 26 ROAS-positive campaigns.

---

## D1 — Agency Overview / Ajans Genel Bakış
- **Audience:** Agency Director (Elif Demir); Account Director. Whole-workspace view.
- **Widgets:** workspace health tiles; missions by stage; pending approvals;
  average ROAS; ROAS-positive campaign count; local-AI status ("offline, no egress").
- **KPIs:** total missions (40), closed missions (19), campaign drafts (38),
  campaign reports (29), average ROAS (2.61x), ROAS-positive campaigns (26).
- **Charts:** funnel (missions by pipeline stage); gauge (average ROAS); donut
  (closed vs in-progress missions); bar (approvals by decision).
- **Filters:** client, brand, sector, time range.
- **Refresh:** hourly (demo: fixed deterministic snapshot, "as of today").
- **Drill-down:** each tile → the pipeline, client-rollup, or performance dashboard.

## D2 — Pipeline Dashboard / Pipeline Panosu
- **Audience:** Account Managers; Account Director; Project Coordinator.
- **Widgets:** missions by stage (brief / creative / campaign draft / report /
  executive / closed); pending approvals (mine/all); frontier missions awaiting a
  human gate; budget-in-flight by stage.
- **KPIs:** in-progress missions (21), by stage — creative 2, campaign draft 9,
  report 10, closed 19; pending approvals (4).
- **Charts:** funnel (stage progression, brief→executive); bar (missions per stage);
  list (pending-approval missions with approver).
- **Filters:** client, brand, stage, approver, time range.
- **Refresh:** every 15 min (demo: fixed).
- **Drill-down:** mission → its artifacts per reached stage + approval timeline.

## D3 — Campaign Performance / Kampanya Performansı
- **Audience:** Performance Analyst (Berk Aydın, Gizem Ünal); Account Director.
- **Widgets:** KPI board across campaign reports; spend vs revenue; ROAS
  distribution; top/bottom campaigns by ROAS.
- **KPIs:** **CTR, CPC, CPA, CPL, ROAS, ROI** (recomputed deterministically per
  report from impressions/clicks/spend/conversions/leads/revenue), average ROAS
  (2.61x), ROAS-positive campaigns (26 of 29 reported).
- **Charts:** bar (ROAS by campaign); scatter (spend vs revenue); line (CPC/CPA
  bands); histogram (ROAS distribution across 29 reports).
- **Filters:** client, brand, channel, ROAS band (positive/negative), time range.
- **Refresh:** hourly.
- **Drill-down:** campaign → its CampaignReport (raw numbers + all six KPIs).

## D4 — Approvals Dashboard / Onaylar Panosu
- **Audience:** Account Director; client-side Marketing Leads (own brand only).
- **Widgets:** approvals by gate (`strategy_and_budget`, `creative_assets`,
  `campaign_launch`); pending vs approved; approver workload; every approval is
  **human** (no auto-approval).
- **KPIs:** total human approvals (118), pending (4), approval rate per gate stage,
  gates cleared per mission.
- **Charts:** bar (approvals by gate); donut (approved vs pending); list (pending
  approvals with approver and mission).
- **Filters:** gate, approver, internal/client-side, decision, time range.
- **Refresh:** every 15 min.
- **Drill-down:** approval → mission + the artifact being signed off (human click).

## D5 — Company Brain / Şirket Beyni
- **Audience:** Strategy Lead (Aslı Yıldırım); Creative Director; Agency Director.
- **Widgets:** winning-ad pattern library (uses + avg lift); brand profiles
  (voice, banned words, top channel, avg ROAS); marketing/creative/sales insights;
  SOP performance per pipeline stage; campaign→ad→lead→ROI knowledge graph.
- **KPIs:** patterns tracked (6), brand profiles (12), top brand avg ROAS,
  SOP approval-rate per stage. *(Marketing-performance memory — no documents, no
  cited answers, no autonomous agents.)*
- **Charts:** bar (pattern avg lift %, e.g. local proof +22%, UGC hook +18%);
  ranked list (brands by avg ROAS); node graph (campaign→ad→lead→ROI); table (SOP
  runs + approval rate).
- **Filters:** brand, pattern, insight kind, stage.
- **Refresh:** hourly.
- **Drill-down:** pattern → past campaigns that used it (experience engine); brand
  → its profile + campaign history.

## D6 — Client Rollup / Müşteri Kırılımı
- **Audience:** Account Managers; Account Director; Agency Director.
- **Widgets:** per-client rollup across the 6 clients — active/closed missions,
  campaign drafts, reports, blended ROAS, budget in flight.
- **KPIs:** missions per client, closed per client, average ROAS per client,
  ROAS-positive campaigns per client.
- **Charts:** bar (missions by client); grouped bar (ROAS by client); stacked bar
  (missions by stage per client); table (client scorecard).
- **Filters:** client, sector, stage, time range.
- **Refresh:** hourly.
- **Drill-down:** client → its brands (D7), then missions and reports.

## D7 — Brand Rollup / Marka Kırılımı
- **Audience:** Creative Director; Account Managers; client Marketing Leads.
- **Widgets:** per-brand view across 12 brands — voice + banned words (brand
  guardrails), top channel, campaigns run, avg ROAS, creative sets produced.
- **KPIs:** brand avg ROAS, campaigns run per brand, banned-words respected rate
  (creative sets honor brand guardrails), missions per brand.
- **Charts:** ranked bar (brand avg ROAS); chips (voice/banned words per brand);
  bar (creative sets per brand); table (brand scorecard).
- **Filters:** client, brand, channel, time range.
- **Refresh:** hourly.
- **Drill-down:** brand → its creative sets, campaign drafts, and reports.

## D8 — Creative Dashboard / Kreatif Panosu
- **Audience:** Creative Director (Sibel Kaya); Art Director; Copywriters.
- **Widgets:** creative sets by brand; ad-copy fields drafted (headline / ad copy /
  CTA / social post / landing page / email); brand-guardrail compliance
  (banned-words respected); **copy-only** flag (never touches ad platforms).
- **KPIs:** creative sets produced, banned-words-respected rate, sets awaiting the
  `creative_assets` gate, sets approved.
- **Charts:** bar (creative sets by brand); donut (drafted vs approved); list
  (creative sets pending the human creative gate).
- **Filters:** brand, gate status, channel intent, time range.
- **Refresh:** every 15 min.
- **Drill-down:** creative set → its mission, brief, and creative-gate approval.

## D9 — Media / Channel Dashboard / Medya-Kanal Panosu
- **Audience:** Media Planner (Murat Şahin, İpek Kara); Account Director.
- **Widgets:** budget split across channels (Meta, Google Ads, YouTube, TikTok,
  LinkedIn, Display); ad sets per channel; drafted budget in flight; **export-to-run**
  note (a human exports the split to their own ad platform — AdOS never pushes).
- **KPIs:** total drafted budget (₺), budget per channel, ad sets per draft,
  channels per draft, average ROAS by channel (from reports).
- **Charts:** stacked bar (budget by channel); bar (ad sets per channel); treemap
  (budget allocation); table (channel scorecard).
- **Filters:** client, brand, channel, budget band, time range.
- **Refresh:** every 15 min.
- **Drill-down:** channel allocation → CampaignDraft (status always `draft`, never
  launched) → its CampaignReport.

## D10 — Analytics Dashboard / Analitik Panosu
- **Audience:** Performance Analyst; Data Analyst; Agency Director (summary).
- **Widgets:** cross-cut analytics — ROAS vs spend; stage throughput; pattern lift
  vs outcome; client/brand comparison; ROAS-positive rate over the pipeline.
- **KPIs:** average ROAS (2.61x), ROAS-positive rate (26/29), pipeline conversion
  (missions reaching report/closed), approval rate by gate.
- **Charts:** multi-line (ROAS trend by client); scatter (spend vs revenue); bar
  (client/brand comparison); funnel (mission → report → closed). All reconcile to
  the seeded world.
- **Filters:** metric, client, brand, channel, ROAS band, time range.
- **Refresh:** hourly.
- **Drill-down:** any point → the underlying dashboard (D3/D5/D6) records.

---

## Dashboard index

| # | Dashboard | Primary audience | Refresh | Key drill-down |
| --- | --- | --- | --- | --- |
| D1 | Agency Overview | Agency Director, Account Director | hourly | pipeline / rollups |
| D2 | Pipeline | Account Managers, Coordinator | 15 min | mission artifacts |
| D3 | Campaign Performance | Performance Analysts | hourly | campaign reports |
| D4 | Approvals | Account Director, client leads | 15 min | approval + artifact |
| D5 | Company Brain | Strategy Lead, Creative Director | hourly | patterns / brand history |
| D6 | Client Rollup | Account Managers | hourly | client → brands |
| D7 | Brand Rollup | Creative Director, client leads | hourly | brand → creatives/reports |
| D8 | Creative | Creative Director, Copywriters | 15 min | creative set + gate |
| D9 | Media / Channel | Media Planners | 15 min | campaign draft |
| D10 | Analytics | Analysts, Agency Director | hourly | source dashboards |

## Consistency contract
- Every metric is defined once (the `metrics` array in `src/seed.mjs`) and shown
  identically wherever it appears; all six ad-KPIs (CTR/CPC/CPA/CPL/ROAS/ROI)
  recompute deterministically from each report's raw numbers.
- Every drill-down resolves to a real seeded record (mission, brief, creative set,
  campaign draft, campaign report, approval, experience entry).
- Audience is a role **label** only — AdOS does not enforce RBAC; the demo models
  human approval, not permission enforcement.
- No dashboard surfaces absent capabilities: no documents, no cited answers, no
  permission tiers, no immutable-audit claim, and no launched/live campaigns
  (drafts stay `draft`). The validator fails if any such data appears.
- Every dashboard shows the **local-AI indicator** — offline deterministic engine,
  no cloud, no egress — reinforcing the core message.
