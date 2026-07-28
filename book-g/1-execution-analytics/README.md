# Book G · Part 1 — Execution Analytics

Establishing the law of observability and the first analytics stream: the constitution that governs
the whole book, and the pipeline record read back as stage durations, retries, failures, and
approvals.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`ANALYTICS_CONSTITUTION.md`](ANALYTICS_CONSTITUTION.md).
>
> **Laws:** *Analytics never influences execution directly · analytics never mutates · every
> metric has provenance · dashboard ≠ decision · same data, different views · analytics is
> immutable · every dashboard is derived · time is first-class · every visualization has data ·
> observability before optimization.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`ANALYTICS_CONSTITUTION.md`](ANALYTICS_CONSTITUTION.md) | The governing law of Book G — the foundational law, the nine laws, the one-way flow, and the read-only proof | — |
| [`PIPELINE_ANALYTICS.md`](PIPELINE_ANALYTICS.md) | The orchestration pipeline observed over time: stage durations, retries, failures, approvals | 🔶/❌ |
| [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_1_RELEASE.md`](PART_1_RELEASE.md) | Release summary | — |

## Reading order

1. **`ANALYTICS_CONSTITUTION.md`** — read this first. It is the supreme Book G document: it
   declares the foundational law, the nine governing laws, the three-tier truth model, and the
   one-way flow (Records → Metrics → Dashboards → Reports → Exports) that every later document
   obeys.
2. **`PIPELINE_ANALYTICS.md`** — how the orchestration pipeline is made observable as a process
   over time, honest about the split between the rich record that exists but is never produced live
   (🔶) and the thin band of approval/failure signal that reaches a user today through the event
   feed (partial ✅).

## The one thing to remember

Observability is a lens on the core, never a lever on it. The analytics that ships today is already
a pure read — it shows what the core did without ever changing it — and the pipeline record that
would make *full* execution analytics possible is built but not yet produced live, and Part 1 says
so out loud.
*Observability reveals reality; it never changes reality.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
