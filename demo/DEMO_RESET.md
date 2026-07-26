# AdOS Demo — Reset Strategy

A complete, one-command strategy to return the demo to a **pristine, identical
state** between sales demonstrations. Deterministic, non-destructive to anything
outside the demo, and validated. Fictional/demo-only; isolated to `demo/`.

**Why this matters:** a demo that starts in a slightly different state each time is
a demo you cannot trust in front of a customer. Reset makes every demonstration
begin from the same believable, consistent world (`DEMO_DATASET_SPEC.md`).

---

## 1. Goals

| Requirement | How it's met |
| --- | --- |
| **One-click / one-command reset** | `npm run reset` (or the demo UI "Reset demo" button) |
| **Deterministic** | Fixed seed (`20260726`); no wall-clock/randomness → identical output |
| **No data corruption** | Reset is atomic: build fresh, validate, then swap in |
| **Restore all demo data** | Full re-seed from `DEMO_DATASET_SPEC.md` |
| **Restore workflows** | Workflow definitions + instances + steps re-seeded |
| **Restore AI memory** | Company Brain + seeded AI conversations restored |
| **Restore dashboards** | Recomputed from the restored records (never stored stale) |
| **Restore reports** | Regenerated from the restored dataset |
| **Restore users** | 42 users re-seeded with fixed ids |
| **Restore permissions** | Permission tiers/roles re-applied from `DEMO_USERS.md` |
| **Reset duration target** | **≤ 10 seconds** on a demo laptop |
| **Validation** | Consistency checks run automatically after every reset |

---

## 2. Reset model — deterministic rebuild, not incremental undo

The demo does **not** try to "undo" changes made during a demo. It **rebuilds the
whole demo world from the specification**, deterministically. This is simpler,
safer, and guaranteed identical every time.

```
reset:
  1. Load spec  (DEMO_DATASET_SPEC.md → generator, seed = 20260726)
  2. Set DEMO_TODAY = today (dates computed relative to it)
  3. Generate all datasets in memory (employees … audit)
  4. Recompute dashboards + reports from records
  5. Validate (all §16 checks + determinism checksum)
  6. Atomic swap: write to demo/data/.staging, verify, then move to demo/data/
  7. Report: "Demo reset OK — <checksum>, <N> records, <t>s"
```

Because step 5 validates the *staged* build before step 6 swaps it in, a failed
build never corrupts the live demo — the previous good state remains until a valid
new one exists.

---

## 3. What gets restored (complete list)

- **Users (42)** — ids, names, emails, titles, departments, managers, tiers.
- **Permissions** — tiers, roles, document visibility, workflow authority.
- **Departments / sites / business units.**
- **Documents (~120)** — the Company Brain, with metadata, tags, relationships.
- **AI memory** — Company Brain contents + ~80 seeded conversations (including the
  scripted demo conversations, verbatim).
- **Workflows** — 25 definitions + ~180 instances with step history and audit.
- **Tickets / approvals / tasks / meetings.**
- **Analytics / metrics** — recomputed from records (so they always reconcile).
- **Dashboards** — recomputed views (never persisted stale).
- **Reports** — regenerated from the restored dataset.
- **History (~1,500)** and **Audit (~3,000)** — regenerated deterministically.

Nothing is left over from a previous demo; nothing is missing.

---

## 4. Determinism guarantees

- **Fixed seed:** all generated values derive from seed `20260726` via a seeded
  PRNG. No `Math.random`, no un-seeded time.
- **Relative dates:** all timestamps are computed as offsets from `DEMO_TODAY`, so
  the world is always "fresh" (last 90 days) yet structurally identical.
- **Checksum:** the reset computes a checksum over the generated dataset; two
  resets on the same day produce the **same checksum** (dates aside, structure is
  identical; a structure-only checksum is date-independent).
- **Idempotent:** running reset twice in a row yields the same state.

---

## 5. Validation procedure (runs after every reset)

The validator (implemented in `demo/`) enforces `DEMO_DATASET_SPEC.md §16`:

1. **Referential integrity** — every foreign key resolves.
2. **Authority** — every approval respects `KB-POL-004` limits or escalates.
3. **Citations** — every AI conversation cites an existing, visible document.
4. **KPI reconciliation** — every dashboard metric equals its record aggregate.
5. **Visibility** — no restricted document leaks into a non-entitled view/answer.
6. **Temporal** — timestamps within `[DEMO_TODAY − 90d, DEMO_TODAY]`; history
   monotonic.
7. **Determinism** — structure checksum matches the expected baseline.
8. **Audit completeness** — every state-changing action has an audit record.
9. **Volumes** — seeded counts match `DEMO_DATASET_SPEC.md §15`.

**Output:** `PASS` (with checksum + counts + duration) or `FAIL` (with the exact
failing check and offending record). A demo is only "ready" on `PASS`.

---

## 6. Interfaces

- **CLI:** `npm run reset` — one command; prints the validation summary.
- **Setup (first run):** `npm run setup` — installs nothing external; seeds + validates.
- **Verify only:** `npm run validate` — runs the checks without re-seeding.
- **Demo UI (optional):** a "Reset demo" button that calls the same routine, shown
  only in demo mode, with a confirm + progress + result toast.

All interfaces call the **same** deterministic rebuild routine — there is exactly
one code path, so they cannot diverge.

---

## 7. Safety

- **Scope-locked:** reset only ever writes under `demo/data/`. It cannot touch the
  AdOS application, its packages, its tests, or any production system.
- **Atomic:** staged build + validate + swap; a crash mid-reset leaves the last
  good state intact.
- **No external calls:** fully local; works offline (consistent with the
  sovereignty message).
- **Reversible:** the previous `demo/data/` is kept as `demo/data/.previous` for
  one generation, so an operator can roll back instantly if needed.

---

## 8. Operating guidance

- **Before every demo:** run `npm run reset` (≤ 10s) so you start clean.
- **After an exploratory demo:** reset to remove any ad-hoc changes.
- **If validation ever fails:** the live demo is untouched; fix the spec/seeder,
  re-run — never demo on a `FAIL`.
- **Scheduled refresh:** because dates are relative to `DEMO_TODAY`, a daily reset
  keeps the world current with zero manual editing.

---

## Appendix — Reset guardrails
- One command, deterministic, atomic, validated, offline, ≤ 10s.
- Rebuilds from the single source of truth (`DEMO_DATASET_SPEC.md`) — no drift.
- Restores users, permissions, data, workflows, AI memory, dashboards, reports.
- Never corrupts data; never touches anything outside `demo/`.
