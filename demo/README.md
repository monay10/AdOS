# AdOS Official Enterprise Demo Environment

The official AdOS sales demonstration environment — the fictional enterprise
**NovaMak Endüstri A.Ş.** seeded as a complete, internally consistent, repeatable
demo world. **Not** sample/test/production data.

- **Isolated** — everything under `demo/`; never touches the AdOS application, its
  packages, or its tests. **No production data.**
- **Deterministic** — fixed seed (`20260726`); same input → identical world.
- **Repeatable** — one command to set up, one to reset (≤ 10s target; ~0.04s in
  practice).
- **No dependencies, offline** — pure Node.js (ESM); nothing to install.

## Commands

```bash
cd demo
npm run setup     # first run: seed the world + validate  → demo/data/world.json
npm run reset     # deterministic one-command reset (rebuild → validate → swap)
npm run validate  # run the consistency checks on the current world
npm test          # run the test suite (node:test)
```

## What it seeds (from the specs)

42 users · 16 departments · 6 sites · 4 business units · ~40 assets · ~114
documents (Company Brain) · 25 workflow definitions · 180 workflow instances ·
96 approvals · 60 tickets · 150 tasks · 20 meetings · 12 AI agents · 80 AI
conversations · KPIs/metrics · 1,500 history + 3,000 audit records —
**5,779 records total**, all reconciling.

## Specifications (source of truth)

`DEMO_CONSTITUTION.md` · `DEMO_COMPANY.md` · `DEMO_USERS.md` ·
`DEMO_KNOWLEDGE_BASE.md` · `DEMO_WORKFLOWS.md` · `DEMO_AI_AGENTS.md` ·
`DEMO_DASHBOARDS.md` · `DEMO_DATASET_SPEC.md` · `DEMO_RESET.md`.

## Validation contract

Every setup/reset validates (blocks on failure): referential integrity, approval
authority (KB-POL-004), AI citations exist + permission-visible, KPI
reconciliation, temporal window, determinism (rebuild checksum), audit
completeness, and volumes. A demo is only "ready" on **PASS**.

## Layout

```
demo/
  src/
    data-model.mjs   canonical entities (users, depts, sites, workflows, doc categories)
    prng.mjs         seeded PRNG (deterministic)
    seed.mjs         builds the full world + permission model + checksum
    validate.mjs     the consistency checks (DEMO_DATASET_SPEC §16)
    reset.mjs        deterministic rebuild → validate → atomic swap
    setup.mjs        first-run entry
  test/demo.test.mjs tests (determinism, consistency, permissions)
  data/              generated world.json (gitignored; regenerate via npm run setup)
```

Generated data (`demo/data/`) is gitignored — it is fully reproducible from the
seed with `npm run setup`.
