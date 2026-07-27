# AdOS — Demo Constitution

**Document type:** Specification for the **official AdOS sales demonstration
environment**. This is **not** sample data, **not** test data, and **not**
production data. It is a deliberately designed, internally consistent, repeatable
demonstration world used in every AdOS sales engagement.
**Owner:** Chief Demo Experience Architect.
**Status:** v2.0 — canonical source of truth for the demo.
**Isolation:** everything lives under `demo/`. The demo environment never touches
production data or the AdOS application's own tests.

**The demo world in one line:** a realistic İstanbul advertising agency —
**Vega Reklam Ajansı** — running AdOS to take its clients' advertising objectives
through the human-approved campaign pipeline, entirely on its own infrastructure.

**The golden rule of the demo:** *every screen must feel like a real agency on a
normal working day.* No "Lorem ipsum," no "test_user_1," no empty states in the
happy path. If a prospect clicks anywhere reasonable, they find believable,
consistent data.

---

## 1. Demo philosophy

- **Believability over breadth.** A smaller world that feels completely real beats
  a large world full of placeholders. Every name, brief and number is plausible
  and consistent.
- **Show the outcome, not the plumbing.** The demo proves business value — a
  campaign taken from objective to reportable results, with humans in control —
  not technical features.
- **Sovereignty is always visible.** Every scenario reinforces the core message:
  this runs on the agency's own infrastructure; nothing leaves the building.
- **The customer sees themselves.** The demo agency mirrors the prospect's own
  structure (clients, brands, briefs, approvals), so they picture their own
  organization.
- **Deterministic and repeatable.** The same click path produces the same result
  every time. A demo that surprises the presenter is a failed demo.
- **Honest.** The AI drafts each pipeline stage with an offline deterministic
  engine and every draft is marked human-reviewed; the demo never fakes
  intelligence, autonomy or integrations it doesn't have.

---

## 2. Demo objectives

1. **Prove the pipeline:** a client objective becomes a marketing brief, a creative
   set, a campaign draft, a performance report and an executive summary — each a
   real artifact.
2. **Prove human control:** every consequential stage stops at a human approval
   gate (strategy & budget, creative assets, campaign launch) before the next
   begins.
3. **Prove the Company Brain:** a marketing-performance memory surfaces a past
   winning campaign or pattern that shapes the next brief.
4. **Prove sovereignty & security:** show it running locally, with tenant
   isolation, and state plainly that no data leaves and no live ad is ever pushed.
5. **Prove advertising-native depth:** brands with voice and banned words, products
   with pricing, channel/budget splits, and standard ad KPIs (CTR/CPC/CPA/CPL/
   ROAS/ROI) that reconcile.
6. **Enable a confident presenter:** a scripted, reliable path that always works.

**Success = the prospect asks "can we run this on our own clients?" —** the cue to
move to a pilot.

---

## 3. Demo audience

The demo serves the same executive and operational buyers as the presentation,
plus hands-on evaluators:

| Audience | What the demo must show them |
| --- | --- |
| Agency owner / GM | Business outcomes, faster campaign production, one platform |
| CIO / IT | On-prem operation, control, isolation, no lock-in |
| CTO | Real, governed AI drafting grounded in brand rules |
| CISO / Security | Isolation, activity logging, no data egress |
| Account & creative leads | Their own daily work, made faster |
| Public institutions / OIZ | Multi-tenant potential, Turkish UI |
| Clients | An agency that produces on-brand work, on their own terms |

The demo is delivered **bilingually (TR/EN)**; for OIZ and public-sector
audiences it runs primarily in Turkish.

---

## 4. Demo scenarios

Each scenario is a short, scripted story (2–5 minutes) with a fixed click path.
Detailed steps live in `DEMO_WORKFLOWS.md`; the canonical demo scenarios are:

1. **"State an objective, get a brief."** An account manager enters a client's
   objective in natural language; AdOS drafts a marketing brief with audience,
   key message and suggested channels. *(Proves the pipeline start.)*
2. **"Approve strategy & budget."** The brief stops at the `strategy_and_budget`
   gate; a human reviews and approves before any creative work begins. *(Proves
   human-gated workflow.)*
3. **"Draft a creative set."** The AI produces ad copy only — headline, ad copy,
   CTA, social post, landing page, email — respecting the brand's voice and banned
   words; it never touches an ad platform. *(Proves creative generation, gated.)*
4. **"Draft the campaign, never launch it."** AdOS assembles channels, ad sets and
   a budget split as a **draft** the human exports to run in their own platform;
   the status stays `draft`. *(Proves advertising depth + honesty.)*
5. **"See the results and learn."** A campaign report shows reconciled KPIs; the
   Company Brain surfaces a past winning pattern that will shape the next brief.
   *(Proves the marketing-performance memory.)*
6. **"See it all from the top."** The Executive Report summarizes campaign results
   and a recommendation across the agency. *(Proves the platform value.)*

Every scenario ends by restating: *"and none of this left the building — and no
live ad was ever launched."*

---

## 5. Demo personas

Personas the presenter can "log in as." Full roster in `DEMO_USERS.md`; the
headline demo personas are:

- **Elif Demir — Agency Director.** Sees the Executive Report; asks strategic
  questions.
- **Hakan Çelik — Account Director.** Owns client relationships and approvals.
- **Zeynep Şahin — Account Manager.** Enters client objectives; drives missions
  through the pipeline.
- **Sibel Kaya — Creative Director.** Reviews and approves creative sets.
- **Murat Şahin — Media Planner.** Reviews channel and budget splits on drafts.
- **Berk Aydın — Performance Analyst.** Reads campaign reports and KPIs.
- **Canan Arslan — Client Marketing Lead (FinTR).** A client-side approver who
  signs off on their own brand's campaign launch.

Roles are labels used to tell a believable story; the demo does not simulate
permission enforcement (see §9).

---

## 6. Demo agency

**Vega Reklam Ajansı** — a fictional but realistic full-service advertising
agency headquartered in İstanbul, running six clients' brands on AdOS. Full
profile in `DEMO_COMPANY.md`. An agency is chosen because it naturally exercises
**every** part of the real product — clients, brands, products, briefs, creative,
campaigns and reporting — and mirrors the enterprise and OIZ prospects AdOS
targets.

---

## 7. Demo clients & brands

The demo models **6 clients**, each with **2 brands** (**12 brands**) and each
brand with **2 products** (**24 products**):
NovaMak Endüstri (manufacturing) · Derma Cosmetics (beauty) · Fresh Foods (fmcg) ·
FinTR Katılım (finance) · Evim Home (retail) · Getaway Travel (travel).

Each brand carries a **voice** and a **banned-words** list (brand guardrails); each
product carries a **price**. Work is organized into **projects** (about 22) and
**40 missions** that run the pipeline.

---

## 8. Demo team

Approximately **22 people** — **16 agency staff** (Agency Director, Account
Directors/Managers, Strategists, Creative Director, Art Director, Copywriters,
Media Planners, Performance Analysts, Data Analyst, Project Coordinator) plus
**6 client-side marketing leads** who approve their own brand's campaigns. Each
has a name, role label and reporting context. Defined in `DEMO_USERS.md`. People
are realistic Turkish names with plausible titles that match the org in
`DEMO_COMPANY.md`.

---

## 9. Demo roles & control

Control in the demo is by **human approval gates**, not enforced permissions.

- **Role labels.** Each person has a role label (Agency Director, Account Manager,
  Creative Director, client lead…) used to tell a believable story — nothing more.
- **Approval gates.** The real control is human sign-off at three gates:
  `strategy_and_budget`, `creative_assets`, `campaign_launch`. Every gate a mission
  reaches has a recorded human approval; some frontier missions sit at `pending`.
- **No enforced RBAC.** The product defines roles but does not enforce them, and
  neither does the demo — it never simulates restricting what a user may see.
- **Tenant isolation (for the OIZ story).** The workspace is a single tenant; the
  demo can show Vega's data isolated from any other tenant, with strict separation.

Control is deterministic and documented in `DEMO_USERS.md` and
`DEMO_DATASET_SPEC.md`.

---

## 10. Demo pipeline

The single, fixed, ordered, human-gated campaign pipeline every mission follows:
**Mission → MarketingBrief → CreativeSet → CampaignDraft → CampaignReport →
ExecutiveReport.** Each stage produces exactly one artifact and, at a gate stage,
stops for a human approval before the next stage may begin. A mission's artifacts
always form a contiguous prefix of the stages (the validator enforces this).
Campaign drafts always stay `status = draft` — **never launched**. Defined in
`DEMO_WORKFLOWS.md`.

---

## 11. Demo AI interactions

Every AI interaction in the demo is:
- **Pipeline-scoped** — the AI drafts one pipeline stage (brief, creative set,
  campaign draft, report, executive summary); it does no free-text document Q&A.
- **Offline & deterministic** — the default engine is `offline-deterministic`, so
  the same world produces byte-identical drafts; genuine model output would require
  a locally-run engine (Ollama / OpenAI-compatible).
- **Human-reviewed** — every draft is marked reviewed by a human before the mission
  advances; the AI never approves its own work.
- **Brand-safe** — creative respects the brand's voice and banned-words list.
- **Bilingual** — output in the user's language (TR/EN).

Representative interactions are scripted per scenario (§4) and per pipeline stage
(`DEMO_AI_PIPELINE.md`).

---

## 12. Demo Company Brain

The Company Brain is Vega's living **marketing-performance memory**: CompanyDNA
(mission, positioning, tone, north-star), a BrandProfile per brand (voice, banned
words, top channel, average ROAS), MarketingInsight / CreativeInsight /
SalesInsight derived from campaign results, SopPerformance per pipeline stage, a
campaign → ad → lead → ROI knowledge graph, a winning-ad pattern library, and a
past-campaign experience engine. Fully specified in `DEMO_COMPANY_BRAIN.md`. It
visibly grows as campaigns run and always stays inside Vega's perimeter. It holds
**no documents and produces no citations** — only marketing metrics and patterns.

---

## 13. Demo AI pipeline

A single, ordered set of AI-assisted pipeline stages — brief, creative, campaign
draft, report and executive summary — each with defined inputs, output artifact,
gate and human review. There are no autonomous agents doing work on their own:
each stage is a discrete draft that a human reviews and approves. Defined in
`DEMO_AI_PIPELINE.md`.

---

## 14. Demo dashboards

Role-relevant dashboards: Executive, Pipeline, Client/Brand, Creative, Media and
Performance/Analytics. Each defines its widgets, KPIs, charts, filters, refresh
policy and drill-downs. Defined in `DEMO_DASHBOARDS.md`. Dashboards are populated
with the same consistent dataset so numbers reconcile across views.

---

## 15. Demo reports

Pre-built, believable reports the presenter can open on cue: a campaign
performance report (CTR/CPC/CPA/CPL/ROAS/ROI per campaign), a brand performance
summary, a pipeline throughput report, a pending-approvals report, a Company Brain
insight digest, and an executive summary. Each is generated from the demo dataset
and is internally consistent with the dashboards.

---

## 16. Demo artifacts

A realistic corpus of pipeline artifacts — marketing briefs, creative sets
(headline / ad copy / CTA / social post / landing page / email), campaign drafts
(channels, ad sets, budget split), campaign reports and executive reports —
enough to make the pipeline convincing, curated so every mission tells a coherent
story. Specified in `DEMO_DATASET_SPEC.md` with fields, relationships and volumes.

---

## 17. Demo analytics

The demo shows analytics that reconcile with the underlying data: pipeline
throughput (missions per stage, closed vs in-progress), approval activity (gates
reached, approved vs pending), campaign performance (impressions, clicks, spend,
conversions, leads, revenue → CTR/CPC/CPA/CPL/ROAS/ROI), and Company Brain signals
(average ROAS, ROAS-positive campaigns, winning patterns). Defined across
`DEMO_DASHBOARDS.md` and `DEMO_DATASET_SPEC.md`.

---

## 18. Demo KPIs

Headline demo KPIs (illustrative but internally consistent):
- **Pipeline:** missions in progress vs closed, artifacts per stage.
- **Approvals:** human approvals recorded, pending approvals, approval rate per
  stage.
- **Advertising performance:** CTR, CPC, CPA, CPL, ROAS, ROI per campaign report,
  each recomputed deterministically from raw numbers.
- **Portfolio:** average ROAS, ROAS-positive campaigns, top channel per brand.
- **Adoption:** clients, brands, products and missions live in the world.

All KPI values are derived from the dataset so every dashboard and report agrees —
the validator recomputes and reconciles them.

---

## 19. Demo success criteria

A demo is successful when:
- Every scripted scenario runs end-to-end without an empty state or error.
- Every pipeline is a contiguous, human-gated sequence and no campaign is launched.
- Every ad KPI recomputes from raw numbers; dashboards and reports reconcile.
- The sovereignty message lands (the prospect understands nothing leaves and no
  live ad is pushed).
- The prospect asks about running it on their own clients (the pilot cue).

---

## 20. Reset strategy

The demo must return to a pristine, identical state on demand.
- **One-click / one-command reset** restores all clients, brands, products,
  missions, pipeline artifacts, approvals, Company Brain and metrics to the
  canonical baseline.
- **Deterministic:** the reset always yields byte-for-byte the same demo world
  (same seed → same checksum).
- **Fast:** target a short, predictable reset window between demos.
- **Safe:** reset never corrupts data and never touches anything outside the demo.
- Full design in `DEMO_RESET.md`; the seed and validation in the `demo/`
  implementation.

---

## 21. Demo maintenance

- **Single source of truth:** the demo dataset is defined once
  (`DEMO_DATASET_SPEC.md`) and seeded programmatically; docs and data never drift.
- **Versioned:** the demo world is versioned with AdOS releases; when the product
  changes, the demo is re-validated.
- **Validated:** an automated consistency check confirms the dataset is internally
  coherent (referential integrity, contiguous pipeline order, a human approval at
  every reached gate, drafts never launched, KPIs reconcile, determinism holds)
  before a demo is trusted.
- **Owned:** the Demo Experience Architect owns changes; additions must preserve
  believability, determinism and the sovereignty message.
- **Refreshed deliberately:** dates and figures are advanced on a schedule so the
  world never looks stale, always via the single source of truth.

---

## Appendix — Demo guardrails
- Not sample/test/production data — a designed, consistent demonstration world.
- Everything under `demo/`; never touches production or the app's tests.
- Believable, deterministic, human-gated, bilingual, sovereignty-forward.
- One agency (Vega), six clients, one consistent dataset, many views.
- No documents, no citations, no permission tiers, no autonomous agents, no live
  ad launch — the world models only what the product actually does.
- Every asset traces to this constitution and to `DEMO_DATASET_SPEC.md`.
