# Book G · Part 5 — Executive Dashboard — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 5 draws Book G to its close: one body of truth shown to four kinds of reader, and the A–G core
synthesised into a single observability platform. It is a **design & architecture specification**;
every capability is tiered **✅ / 🔶 / ❌**. Documentation only.

> **Laws:** *Analytics never influences execution directly · analytics never mutates · every
> metric has provenance · dashboard ≠ decision · same data, different views · analytics is
> immutable · every dashboard is derived · time is first-class · every visualization has data ·
> observability before optimization.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| G007 | [`ROLE_BASED_DASHBOARDS.md`](ROLE_BASED_DASHBOARDS.md) | One truth, four lenses — CEO / Manager / Operator / Customer | ✅/❌ |
| G008 | [`OBSERVABILITY_PLATFORM.md`](OBSERVABILITY_PLATFORM.md) | A–G made observable — the closing synthesis of Book G | ❌ mostly |
| — | [`PART_5_VALIDATION.md`](PART_5_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 5 establishes

- **One truth, four lenses.** CEO, Manager, Operator, and Customer are four questions asked of one
  metric set, not four data stores. **Law 4 (Same Data, Different Views)** guarantees the lenses
  cannot contradict one another; **Law 6 (Every Dashboard is Derived)** is the mechanism that makes
  the guarantee automatic — a dashboard holds no data of its own, so a persona view adds a lens, not
  a private version of the truth.
- **The shipped surfaces are real and shared.** The executive report renders a per-mission verdict
  (`exceeded | on_track | at_risk`) live at `/executive` (✅), and the operational dashboard renders
  entity counts, a pending-approval queue, and the recent-events feed live at `/dashboard` (✅). Both
  are wired surfaces a user sees on login — derived, not stored.
- **The one-way flow, end to end.** *Run Records → Metrics → Dashboards → Reports → Exports* runs in
  one direction only. Reports render today; the export step off the device is the missing last hop.
- **The A–G synthesis.** The frozen A–F core, rendered observable, plus Book G's own layer — one
  read-only mirror over six books, complete as a design and live across a strong slice of business
  analytics. **This closes Book G.**

## 3. Honest limitations

- **Role differentiation is ❌.** RBAC is *declared but unenforced* — roles are carried on the
  session and resolved into a principal, but no route reads a role to change what is shown; every
  user sees the same page. The four persona *views* do not exist yet. The gap is a differentiation
  gap, not a data gap: the single derived metric source those views would read is what already ships.
- **Exports are ❌.** Reports render on screen; CSV / PDF / JSON emission out of the app — the last
  hop of the one-way flow — does not exist.
- **Time-window selection is ❌.** Today's surfaces are per-mission / per-entity snapshots, not
  reader-selectable windowed series; Law 7 nonetheless binds every persona number to its window.
- **The full observability platform is the design, not the shipped state.** A strong,
  provenance-carrying business-analytics slice runs live; execution, operational, and performance
  analytics, role-based views, and exports are specified and, in part, built-but-unwired.

## 4. Value contribution

A lens that fits its reader saves that reader time: each persona lands on the slice they came for
instead of decoding a shared page (production time). And a single derived truth, projected into as
many honest lenses as there are readers — including a client-facing view that Law 4 guarantees can
never contradict the agency's own — is what an enterprise can standardise on and open to its clients
(revenue). An observable operating system is what an agency builds a business on, rather than a
bundle of tools it merely uses.

## 5. Governance

[`../1-execution-analytics/ANALYTICS_CONSTITUTION.md`](../1-execution-analytics/ANALYTICS_CONSTITUTION.md)
governs this part; the directional rule that observability *consumes and observes* the core but never
redefines it is fixed by [`../../ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md). Every
addition must tier-tag each capability, trace ✅/🔶 claims to code, leave ❌ claims uncited, and re-run
[`PART_5_VALIDATION.md`](PART_5_VALIDATION.md) before release.

## 6. Book G complete — the flagship follows

With Part 5 released, **Book G — Analytics Platform is complete.** The observability layer over the
frozen A–F core is specified end to end, with a live business-analytics spine and an honest tier
ledger for everything still to be wired. The next milestone is the **flagship analytics-platform
release** that publishes Book G as a whole, ahead of Book H — the ecosystem layer that will extend
A–G additively and never reach into it.

**Status: ✅ Released — Executive Dashboard v1.0.0. Book G closed.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
