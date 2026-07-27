# AdOS Demo — Users

**~22 realistic users** for the demo agency **Vega Reklam Ajansı** (İstanbul),
the AdOS tenant that runs its clients' advertising objectives through the
human-approved campaign pipeline. **16 internal agency members** + **6 client-side
approvers** (one per client). Each user has: **Role**, **Function**,
**Responsibilities**, **Pipeline involvement**, **Typical daily tasks**, and
**AI usage**. Fictional; isolated to `demo/`. Source of truth: `src/data-model.mjs`
(`TEAM`, `CLIENT_APPROVER`).

**Roles are LABELS ONLY — honest per `PRODUCT_TRUTH.md` §2.6:**
- AdOS **defines** roles but **does not enforce per-user RBAC**. `AccessControl` /
  `authorize` / `permits` are called nowhere in app/route code. No user is
  permission-scoped, and the AI is not permission-scoped either.
- There are **no graded permission levels and no ranked approval authority** — no
  numbered access bands, no ₺ sign-off ceilings. A role here describes *what a person
  does*, not what the system will or won't let them touch.
- **Approvals are human clicks at fixed pipeline gates**, not authority levels. The
  three gates are `strategy_and_budget`, `creative_assets`, and `campaign_launch`
  (`routes.ts:743-753`). Any internal reviewer can advance a gate; **client-side
  approvers sign off on their own brand's campaigns**.
- **Nothing is launched.** The `campaign_launch` gate approves a **draft**; a human
  exports the budget split to run it in their own ad platform. AdOS never pushes to
  Meta/Google/etc. (`campaign-draft.ts:48-49`, connector-hub is a stub).

Login / email format for the demo: `ad.soyad@vega.ajans.tr`.

**The pipeline these people run** (human-gated, drafts only):
Mission → **MarketingBrief** *(gate: strategy_and_budget)* → **CreativeSet**
*(gate: creative_assets)* → **CampaignDraft** *(gate: campaign_launch)* →
**CampaignReport** → **ExecutiveReport**.

---

## Leadership

### Elif Demir — Agency Director · Leadership
- **Responsibilities:** overall agency performance, client relationships, portfolio
  strategy, executive reporting across all six clients.
- **Pipeline involvement:** reviews the **ExecutiveReport** per client; can act at
  any gate, most often a final internal sign-off on `strategy_and_budget`.
- **Daily tasks:** review Executive dashboards, steer priorities across accounts,
  meet client leads, unblock stalled missions.
- **AI usage:** Executive/CEO dashboard synthesis ("how are the six accounts doing?",
  portfolio ROAS/ROI summaries) — a single deterministic synthesis call.

### Hakan Çelik — Account Director · Leadership
- **Responsibilities:** the whole client book, account health, scope and budget
  framing, escalations between the agency and client leads.
- **Pipeline involvement:** frequent internal approver at `strategy_and_budget`;
  coordinates client-side sign-off at `campaign_launch`.
- **Daily tasks:** review missions in flight, align briefs to client objectives,
  arbitrate creative/media trade-offs, brief the Agency Director.
- **AI usage:** Executive dashboard and per-client CampaignReport summaries.

---

## Account Management

### Zeynep Şahin — Account Manager · Account
- **Responsibilities:** day-to-day owner for a set of clients; turns client
  objectives into missions and keeps them moving through the pipeline.
- **Pipeline involvement:** opens missions, shepherds each artifact to its gate,
  routes creative and drafts to the right internal and client approvers.
- **Daily tasks:** capture objectives, chase approvals, keep brand guardrails
  (voice / banned words) respected, report status to clients.
- **AI usage:** MarketingBrief generation; reviews AI-drafted briefs before the
  `strategy_and_budget` gate.

### Kerem Yılmaz — Account Manager · Account
- **Responsibilities:** day-to-day owner for the remaining clients; same remit as
  above across a different slice of the book.
- **Pipeline involvement:** opens missions, moves artifacts to their gates, requests
  client sign-off at `campaign_launch`.
- **Daily tasks:** intake objectives, coordinate strategy/creative/media, track
  pending missions, prep client review notes.
- **AI usage:** MarketingBrief generation and CampaignReport read-outs.

---

## Strategy

### Aslı Yıldırım — Strategy Lead · Strategy
- **Responsibilities:** campaign strategy, audience and channel logic, budget-split
  rationale that underpins each brief.
- **Pipeline involvement:** primary author/reviewer of the **MarketingBrief**;
  commonly the internal reviewer at the `strategy_and_budget` gate.
- **Daily tasks:** shape objectives into strategy, define KPIs to target, sanity-
  check budget allocation before it goes to a client.
- **AI usage:** MarketingBrief generation; Company Brain marketing insights (top
  channel, avg ROAS) to inform strategy.

### Efe Demir — Strategist · Strategy
- **Responsibilities:** supports strategy development, competitive and audience
  inputs, brief drafting.
- **Pipeline involvement:** contributes to the **MarketingBrief**; prepares material
  for the `strategy_and_budget` review.
- **Daily tasks:** research audiences, draft brief sections, pull past-campaign
  patterns for the lead's review.
- **AI usage:** MarketingBrief drafting; Company Brain pattern library.

---

## Creative

### Sibel Kaya — Creative Director · Creative
- **Responsibilities:** creative quality and brand fit across all accounts; owns the
  bar for headlines, ad copy, and concepts.
- **Pipeline involvement:** primary internal reviewer at the `creative_assets` gate;
  approves the **CreativeSet** before it can proceed to a campaign draft.
- **Daily tasks:** review creative sets against brand voice and banned words, direct
  copywriters and art direction, resolve creative escalations.
- **AI usage:** CreativeSet generation (copy only — headline / adCopy / CTA / social
  post / landing page / email); reviews AI drafts for brand compliance.

### Onur Kaplan — Art Director · Creative
- **Responsibilities:** visual direction and concept framing for creative sets.
- **Pipeline involvement:** contributes to the **CreativeSet**; supports the
  Creative Director at the `creative_assets` gate.
- **Daily tasks:** shape concepts, pair copy with art direction, ensure creative is
  on-brand and channel-appropriate.
- **AI usage:** CreativeSet generation (copy assets) as raw material for concepts.

### Deniz Acar — Copywriter · Creative
- **Responsibilities:** ad copy across headlines, CTAs, social posts, landing pages
  and email for assigned brands.
- **Pipeline involvement:** produces/edits copy inside the **CreativeSet**; submits
  for `creative_assets` review.
- **Daily tasks:** write and refine copy, honour each brand's voice and banned
  words, iterate on Creative Director feedback.
- **AI usage:** CreativeSet generation (copy only); never touches ad platforms.

### Ceren Işık — Copywriter · Creative
- **Responsibilities:** ad copy for the remaining brands, including English-language
  variants where a brand needs them.
- **Pipeline involvement:** produces/edits copy inside the **CreativeSet**; submits
  for `creative_assets` review.
- **Daily tasks:** draft copy, adapt tone per brand, run banned-word checks, revise
  to brief.
- **AI usage:** CreativeSet generation (copy only), with output-language selection
  (TR/EN).

---

## Media Planning

### Murat Şahin — Media Planner · Media
- **Responsibilities:** channel mix and budget split across Meta, Google Ads,
  YouTube, TikTok, LinkedIn and Display for assigned accounts.
- **Pipeline involvement:** builds the **CampaignDraft** (channels + ad sets +
  budget split); prepares it for the `campaign_launch` gate.
- **Daily tasks:** allocate budget across channels, define ad sets, align the draft
  to the approved brief and budget.
- **AI usage:** CampaignDraft assembly; the draft's status is always `draft` and is
  never launched by AdOS — a human exports it to their own ad platform.

### İpek Kara — Media Planner · Media
- **Responsibilities:** channel mix and budget split for the remaining accounts.
- **Pipeline involvement:** builds the **CampaignDraft**; readies it for
  `campaign_launch` sign-off.
- **Daily tasks:** plan channel budgets, structure ad sets, reconcile spend against
  the strategy-approved budget.
- **AI usage:** CampaignDraft assembly (drafts only, never pushed to platforms).

---

## Performance & Analytics

### Berk Aydın — Performance Analyst · Analytics
- **Responsibilities:** campaign performance reporting and KPI interpretation for
  assigned accounts.
- **Pipeline involvement:** owns the **CampaignReport** (post-`campaign_launch`);
  metrics are hand-entered via a form, then KPIs are recomputed deterministically.
- **Daily tasks:** enter impressions/clicks/spend/conversions/leads/revenue, review
  CTR/CPC/CPA/CPL/ROAS/ROI, flag under-performers.
- **AI usage:** CampaignReport KPIs (deterministic math); Company Brain performance
  insights.

### Gizem Ünal — Performance Analyst · Analytics
- **Responsibilities:** performance reporting for the remaining accounts; trend and
  benchmark analysis.
- **Pipeline involvement:** owns the **CampaignReport** for her book; feeds results
  into ExecutiveReport synthesis.
- **Daily tasks:** compile report metrics, compare against past campaigns, surface
  what to repeat or cut.
- **AI usage:** CampaignReport KPIs; Company Brain experience engine (past-campaign
  ROAS/ROI/outcome).

### Serkan Aydın — Data Analyst · Analytics
- **Responsibilities:** cross-account data quality, deterministic KPI validation,
  Company Brain knowledge-graph upkeep.
- **Pipeline involvement:** supports **CampaignReport** and **ExecutiveReport** with
  clean, validated data.
- **Daily tasks:** validate metric inputs, reconcile campaign → ad → lead → ROI
  graph nodes, prep data for executive synthesis.
- **AI usage:** Company Brain knowledge graph and pattern library.

---

## Delivery

### Pelin Ay — Project Coordinator · Delivery
- **Responsibilities:** keeps projects and missions on schedule; the connective
  tissue between account, strategy, creative, media and analytics.
- **Pipeline involvement:** tracks every mission's stage and pending gate; nudges
  the right approver (internal or client) when a gate is waiting.
- **Daily tasks:** maintain the mission board, watch for missions stuck at
  `pending`, coordinate hand-offs, log consequential actions to the activity feed.
- **AI usage:** reads pipeline status and CampaignReport summaries; no gate is
  auto-approved — every advance is a human click.

---

## Client-side approvers

Each client has **one marketing lead** who signs off on **their own brand's**
campaigns. They approve at pipeline gates (typically `campaign_launch`, and
`strategy_and_budget` where budget is theirs). They are approvers **by role label
only** — the product does not enforce that scope in code; the demo simply routes each
client's approvals to their lead (`CLIENT_APPROVER` in `src/data-model.mjs`).

### Levent Bozkurt — Client Marketing Lead · NovaMak Endüstri
- **Responsibilities:** approves campaigns for NovaMak Pro and NovaMak Parts;
  guards the industrial/B2B brand voice.
- **Pipeline involvement:** client sign-off at gates for NovaMak missions.
- **AI usage:** reviews AI-drafted briefs, creative sets and drafts before approving.

### Nalan Er — Client Marketing Lead · Derma Cosmetics
- **Responsibilities:** approves campaigns for Derma Glow and Derma Men; protects
  the dermatological tone and banned-word rules.
- **Pipeline involvement:** client sign-off at gates for Derma missions.
- **AI usage:** reviews AI-drafted artifacts before approving.

### Tuğçe Al — Client Marketing Lead · Fresh Foods
- **Responsibilities:** approves campaigns for Fresh Daily and Fresh Kids; keeps the
  friendly, wholesome FMCG voice.
- **Pipeline involvement:** client sign-off at gates for Fresh Foods missions.
- **AI usage:** reviews AI-drafted artifacts before approving.

### Canan Arslan — Client Marketing Lead · FinTR Katılım
- **Responsibilities:** approves campaigns for FinTR Invest and FinTR Pay; enforces
  compliant, no-guaranteed-return messaging.
- **Pipeline involvement:** client sign-off at gates for FinTR missions.
- **AI usage:** reviews AI-drafted artifacts for compliance before approving.

### Ozan Kurt — Client Marketing Lead · Evim Home
- **Responsibilities:** approves campaigns for Evim Living and Evim Garden; holds the
  cozy, aspirational retail voice.
- **Pipeline involvement:** client sign-off at gates for Evim missions.
- **AI usage:** reviews AI-drafted artifacts before approving.

### Derya Kılıç — Client Marketing Lead · Getaway Travel
- **Responsibilities:** approves campaigns for Getaway Sun and Getaway City; keeps
  the vivid, inviting travel voice.
- **Pipeline involvement:** client sign-off at gates for Getaway missions.
- **AI usage:** reviews AI-drafted artifacts before approving.

---

## Roster summary

| Function | Users |
| --- | --- |
| Leadership | 2 |
| Account Management | 2 |
| Strategy | 2 |
| Creative | 4 |
| Media Planning | 2 |
| Performance & Analytics | 3 |
| Delivery | 1 |
| **Internal subtotal** | **16** |
| Client-side approvers | 6 |
| **Total** | **22** |

All users are fixed and reconcile with `src/data-model.mjs` (`TEAM`,
`CLIENT_APPROVER`). Roles are labels; **RBAC is defined but not enforced**, there are
**no graded permission levels and no ranked approval authority**, and every gate
advance is a **human approval click** — internal for agency review, client-side for a
brand's own sign-off.
