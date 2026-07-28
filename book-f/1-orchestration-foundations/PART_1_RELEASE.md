# Book F · Part 1 — Orchestration Foundations — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 1 lays the **foundations of orchestration** — the laws, the model, and the canonical
pipeline that turn AdOS's six books into one managed process. It is a **design & architecture
specification**; every capability is tiered **✅ / 🔶 / ❌**. Documentation only.

> **Laws:** *No component executes outside the orchestration pipeline · orchestration is
> deterministic · every stage has one responsibility · the orchestrator never changes evidence ·
> the human gate is a first-class stage, not an exception · observable by design.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| F001 | [`AI_ORCHESTRATION_CONSTITUTION.md`](AI_ORCHESTRATION_CONSTITUTION.md) | The six governing laws of orchestration | governing |
| F002 | [`ORCHESTRATION_MODEL.md`](ORCHESTRATION_MODEL.md) | The two orchestrations, and the plan to unify them | ✅/🔶 |
| F003 | [`ORCHESTRATION_PIPELINE.md`](ORCHESTRATION_PIPELINE.md) | The canonical pipeline, stage by stage | 🔶/✅ |
| — | [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 1 establishes

- **The laws of orchestration:** one pipeline, deterministic, one job per stage, evidence
  immutable, the human gate a first-class stage, every run observable.
- **The two orchestrations:** a shipped manual, human-gated workflow, and a built-but-unwired
  governed 12-stage pipeline that the live app bypasses. Book F's job is to unify them.
- **The canonical pipeline:** Mission → Planner → Memory → Generation → Scoring → Explanation →
  Human Review → Revision → Approve — each stage mapped to the book that owns it and its tier.

## 3. Honest baseline

- The **First Law is not met today** — services are called directly and `LiveAIManager` bypasses
  the governed pipeline.
- The governed pipeline is **🔶 built-unwired** (tests only); the manual workflow and mission
  state machine are **✅ shipped**; the Planner is **❌ roadmap** (contract only).

## 4. Value contribution

A single deterministic, observable pipeline turns six disconnected capabilities into one
manageable process — cutting operational risk and rework (production time) and making AdOS an
enterprise-manageable platform an agency can scale on (revenue).

## 5. Governance

[`AI_ORCHESTRATION_CONSTITUTION.md`](AI_ORCHESTRATION_CONSTITUTION.md) governs this part and all
of Book F. Every addition must tier-tag each capability, trace ✅ claims to code, and re-run
[`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) before release.

**Status: ✅ Released — Orchestration Foundations v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
