# AdOS Demo — Reset Strategy

A complete, one-command strategy to return the demo to a **pristine, identical
state** between sales demonstrations. Deterministic, non-destructive to anything
outside the demo, and validated. Fictional/demo-only; isolated to `demo/`.

**Why this matters:** a demo that starts in a slightly different state each time is
a demo you cannot trust in front of a customer. Reset makes every demonstration
begin from the same believable, consistent world — the **Vega Reklam Ajansı**
agency dataset (`src/data-model.mjs` + `src/seed.mjs`).

---

## 1. Goals

| Requirement | How it's met |
| --- | --- |
| **One-click / one-command reset** | `npm run reset` (or the demo UI "Reset demo" button) |
| **Deterministic** | Fixed seed (`20260727`); no wall-clock/randomness → identical output |
| **No data corruption** | Reset is atomic: build fresh, validate, then swap in |
| **Restore all demo data** | Full rebuild from the canonical model (`src/data-model.mjs`) |
| **Restore the pipeline** | Briefs, creative sets, campaign drafts, reports, executive reports re-seeded |
| **Restore AI memory** | Company Brain (marketing-performance memory) rebuilt from campaign results |
| **Restore dashboards** | Recomputed from the restored records (never stored stale) |
| **Restore reports** | Regenerated from the restored dataset |
| **Restore team** | ~22 role-labeled team members + client-side approvers, fixed ids |
| **Restore approval gates** | Human approval records re-seeded at every reached gate |
| **Reset duration target** | **≤ 10 seconds** on a demo laptop |
| **Validation** | Consistency checks run automatically after every reset |

---

## 2. Reset model — deterministic rebuild, not incremental undo

The demo does **not** try to "undo" changes made during a demo. It **rebuilds the
whole agency world from the model**, deterministically. This is simpler, safer, and
guaranteed identical every time.

```
reset:
  1. Load model  (src/data-model.mjs + src/seed.mjs, seed = 20260727)
  2. Set demo_today = today at 00:00 UTC (all dates computed relative to it)
  3. buildWorld(seed, demo_today) — all records generated in memory
     (clients … missions … pipeline artifacts … Company Brain … activity log)
  4. Recompute metrics + ad-KPIs from the records
  5. Validate the staged build (11 checks + determinism checksum)
  6. Atomic swap: write demo/data/.staging/world.json, verify it parses,
     keep the current world as demo/data/.previous.json, move staged into place
  7. Report: "Demo reset OK — <N> records — checksum <c> — <t>s"
```

Because step 5 validates the *staged* build before step 6 swaps it in, a failed
build never corrupts the live demo — the previous good state remains until a valid
new one exists.

---

## 3. What gets restored (complete list)

- **Workspace / tenant** — the single agency, Vega Reklam Ajansı (İstanbul).
- **6 clients** — NovaMak Endüstri, Derma Cosmetics, Fresh Foods, FinTR Katılım,
  Evim Home, Getaway Travel.
- **12 brands** (2 per client) — each with its **voice** and **banned words**.
- **24 products** (2 per brand) — each carrying a Turkish-lira price (`price_try`).
- **~22 projects** and **40 missions** (the primary product surface).
- **~22 team members** with role **labels only** (Agency Director, Account Manager,
  Creative Director, Copywriter, Media Planner, Performance Analyst, …) plus
  client-side approvers. Roles are labels — no permission enforcement.
- **Pipeline artifacts** — marketing briefs, creative sets (ad copy only), campaign
  drafts (status **always `draft`, never launched**), campaign reports (ad KPIs),
  executive reports.
- **Approvals (~118)** — a human approval at every reached gate
  (`strategy_and_budget`, `creative_assets`, `campaign_launch`).
- **Company Brain** — marketing-performance memory: CompanyDNA, per-brand profiles,
  insights, SOP performance, the campaign→ad→lead→ROI knowledge graph, the
  winning-ad pattern library, and the past-campaign experience engine.
- **Metrics / dashboards** — recomputed from records (so they always reconcile).
- **History (~1,200)** and **activity log (~324)** — regenerated deterministically.

Total ~**2,100 records**. Nothing is left over from a previous demo; nothing is
missing.

---

## 4. Determinism guarantees

- **Fixed seed:** all generated values derive from seed `20260727` via a seeded
  PRNG. No `Math.random`, no un-seeded time.
- **Relative dates:** all timestamps are computed as offsets from `demo_today`, so
  the world is always "fresh" (last 90 days) yet structurally identical.
- **Checksum:** the reset computes a checksum over the generated dataset; a rebuild
  from the same `(seed, demo_today)` produces the **same checksum**.
- **Idempotent:** running reset twice in a row yields the same state.

---

## 5. Validation procedure (runs after every reset)

The validator (`src/validate.mjs`) enforces the product model in
`PRODUCT_TRUTH.md`. A demo is only "ready" on `PASS`:

1. **Referential integrity** — every foreign key (brand→client, product→brand,
   mission→client/brand/product/project, artifact→mission, approval→approver)
   resolves.
2. **Pipeline order** — artifacts exist only for a contiguous prefix of stages
   (brief → creative → campaign draft → report → executive report).
3. **Human approval gates** — every reached gate has a human approval, and **every**
   approval is human.
4. **Drafts never launched** — every campaign draft has `status = draft`.
5. **Ad-KPI reconciliation** — every report's CTR/CPC/CPA/CPL/ROAS/ROI recomputes
   exactly from its raw impressions/clicks/spend/conversions/leads/revenue.
6. **Company Brain integrity** — knowledge-graph edges resolve to nodes, brand
   profiles cover every brand, experience entries map to real missions.
7. **Temporal window** — mission/approval/draft/log timestamps fall within
   `[demo_today − 90d, demo_today]`.
8. **Determinism** — a rebuild from the stored `(seed, demo_today)` matches the
   checksum.
9. **Activity-log completeness** — every mission and every approval is logged.
10. **No absent-capability data** — the world contains **no** citations, permission
    tiers, document visibility, RBAC, or immutable-audit fields (matches
    `PRODUCT_TRUTH.md`).
11. **Volumes** — seeded counts match spec (6 clients / 12 brands / 24 products /
    40 missions, plus draft/report/approval/log floors).

**Output:** `PASS` (with checksum + counts + duration) or `FAIL` (with the exact
failing check and offending record). A demo is only "ready" on `PASS`.

---

## 6. Interfaces

- **CLI:** `npm run reset` — one command; prints the validation summary.
- **Setup (first run):** `npm run setup` — installs nothing external; seeds + validates.
- **Verify only:** `npm run validate` — runs the checks against `demo/data/world.json`
  without re-seeding.
- **Tests:** `npm test` — the demo test suite.
- **Demo UI (optional):** a "Reset demo" button that calls the same routine, shown
  only in demo mode, with a confirm + progress + result toast.

`setup` and `reset` call the **same** deterministic rebuild routine
(`runReset` in `src/reset.mjs`) — there is exactly one code path, so they cannot
diverge.

---

## 7. Safety

- **Scope-locked:** reset only ever writes under `demo/data/`. It cannot touch the
  AdOS application, its packages, its tests, or any production system.
- **Atomic:** staged build + validate + swap; a crash mid-reset leaves the last
  good state intact.
- **No external calls:** fully local; works offline (consistent with the
  sovereignty message).
- **Reversible:** the previous world is kept as `demo/data/.previous.json` for one
  generation, so an operator can roll back instantly if needed.

---

## 8. Operating guidance

- **Before every demo:** run `npm run reset` (≤ 10s) so you start clean.
- **After an exploratory demo:** reset to remove any ad-hoc changes.
- **If validation ever fails:** the live demo is untouched; fix the model/seeder,
  re-run — never demo on a `FAIL`.
- **Scheduled refresh:** because dates are relative to `demo_today`, a daily reset
  keeps the world current with zero manual editing.

---

## Appendix — Reset guardrails
- One command, deterministic, atomic, validated, offline, ≤ 10s.
- Rebuilds from the single source of truth (`src/data-model.mjs` + `src/seed.mjs`)
  — no drift.
- Restores the agency dataset, pipeline artifacts, approvals, Company Brain,
  dashboards, and reports.
- Never corrupts data; never touches anything outside `demo/`.
