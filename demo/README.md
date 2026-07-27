# AdOS Official Sales Demo Environment

The official AdOS sales demonstration environment — the fictional advertising
agency **Vega Reklam Ajansı** (İstanbul) seeded as a complete, internally
consistent, repeatable demo world. It runs its six clients' advertising
objectives through the human-approved campaign pipeline. **Not**
sample/test/production data.

- **Isolated** — everything under `demo/`; never touches the AdOS application, its
  packages, or its tests. **No production data.**
- **Deterministic** — fixed seed (`20260727`); same input → identical world
  (checksum-verified).
- **Repeatable** — one command to set up, one to reset (≤ 10s target; ~0.04s in
  practice).
- **No dependencies, offline** — pure Node.js (ESM); nothing to install; the AI is
  an offline deterministic engine.

## Commands

```bash
cd demo
npm run setup     # first run: seed the world + validate  → demo/data/world.json
npm run reset     # deterministic one-command reset (rebuild → validate → swap)
npm run validate  # run the consistency checks on the current world
npm test          # run the test suite (node:test)
```

## What it seeds (from the specs)

1 agency workspace (tenant) · 6 clients · 12 brands (voice + banned words) ·
24 products (with pricing) · ~22 projects · 40 missions · ~22 team members
(16 agency staff + 6 client-side approvers) · marketing briefs · creative sets ·
~38 campaign drafts (always `draft`, never launched) · ~29 campaign reports
(reconciled ad KPIs) · executive reports · 118 human approvals · a
marketing-performance Company Brain (DNA, brand profiles, insights, knowledge
graph, pattern library, experience engine) · metrics · ~1,200 history records ·
~324 activity-log entries — **~2,100 records total**, all reconciling.

## The pipeline

Every mission runs the fixed, ordered, human-gated pipeline:

```
Mission → MarketingBrief → CreativeSet → CampaignDraft → CampaignReport → ExecutiveReport
              [gate: strategy_and_budget]  [gate: creative_assets]  [gate: campaign_launch]
```

Each stage produces one artifact; gate stages stop for a human approval before the
next begins. Creative sets are ad copy only (they never touch an ad platform);
campaign drafts allocate a channel/budget split but stay `draft` — **AdOS never
launches or optimizes a live ad**. The AI drafts each stage with an offline
deterministic engine and every draft is human-reviewed.

## Specifications (source of truth)

`DEMO_CONSTITUTION.md` · `DEMO_COMPANY.md` · `DEMO_USERS.md` ·
`DEMO_COMPANY_BRAIN.md` · `DEMO_WORKFLOWS.md` · `DEMO_AI_PIPELINE.md` ·
`DEMO_DASHBOARDS.md` · `DEMO_DATASET_SPEC.md` · `DEMO_RESET.md`.

> Renamed from earlier versions: `DEMO_KNOWLEDGE_BASE.md` → `DEMO_COMPANY_BRAIN.md`
> (a marketing-performance memory, not a document store); `DEMO_AI_AGENTS.md` →
> `DEMO_AI_PIPELINE.md` (AI-assisted pipeline stages, not autonomous agents).

## Validation contract

Every setup/reset validates (blocks on failure): referential integrity; contiguous
pipeline order (brief → executive); a human approval at every reached gate;
campaign drafts never launched; ad-KPI reconciliation (CTR/CPC/CPA/CPL/ROAS/ROI);
Company Brain integrity; temporal window (activity ≤ 90 days); determinism (rebuild
checksum); activity-log completeness; a guardrail that the world contains **no
citations, no permission tiers, and no tamper-evident audit-store data**; and volumes. A demo
is only "ready" on **PASS**.

## Layout

```
demo/
  src/
    data-model.mjs   canonical entities (workspace, clients, brands, products, team, pipeline, channels)
    prng.mjs         seeded PRNG (deterministic)
    seed.mjs         builds the full world (pipeline + approvals + Company Brain + checksum)
    validate.mjs     the consistency checks (DEMO_DATASET_SPEC §16)
    reset.mjs        deterministic rebuild → validate → atomic swap
    setup.mjs        first-run entry
  test/demo.test.mjs tests (determinism, pipeline order, gates, KPI reconciliation)
  data/              generated world.json (gitignored; regenerate via npm run setup)
```

Generated data (`demo/data/`) is gitignored — it is fully reproducible from the
seed with `npm run setup`.
