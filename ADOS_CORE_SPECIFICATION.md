# AdOS Core Specification v1.0

> **Books A–F define the Core Operating System. No subsequent book may redefine their
> responsibilities; later books may only consume, observe, or extend them without altering their
> contracts.**

> **Single source of truth:** [`PRODUCT_TRUTH.md`](PRODUCT_TRUTH.md). This document is an **index
> and a freeze declaration**, not a new specification. It adds no capability and changes no book.
> Every capability inside the six core books is tagged **✅ SHIPPED**, **🔶 BUILT (UNWIRED)**, or
> **❌ ROADMAP**; nothing unbuilt is claimed as shipped.

---

## 0. What this document is

This is the **freeze declaration** for the core of AdOS. Books A through F are no longer a series
of evolving design drafts — together they are **one technical specification**, versioned **v1.0**,
that later work builds upon and must not alter. This document does three things and nothing more:

1. It **names** the six core books and the single responsibility each one owns.
2. It **freezes** them as `AdOS Core Specification v1.0` — a contract, not a draft.
3. It **states the directional rule** that governs everything built after: later books consume,
   observe, or extend the core; they never redefine it.

It introduces no new law, no new capability, and no new claim. Where a detail is needed, it links
to the owning book; it never restates that book's design as if it were its own.

---

## 1. The freeze principle

> **Books A–F define the Core Operating System. No subsequent book may redefine their
> responsibilities; later books may only consume, observe, or extend them without altering their
> contracts.**

Read the principle as a one-way rule. The core does **not** depend on anything built on top of it.
Everything built on top — Book G (Observability), Book H (Ecosystem), and any future layer —
depends on the core and must leave it exactly as specified. A later book may:

- **Consume** what a core book produces (read its outputs, its records, its evidence);
- **Observe** what a core book does (render, measure, and compare its activity);
- **Extend** the platform *around* the core (add value beside it);

and it may **never**:

- redefine a core book's responsibility,
- change a core contract, interface, or law,
- reach into a core book to alter how it decides.

This is what makes the core trustworthy at enterprise scale: a foundation that later layers cannot
silently move.

---

## 2. The six core books

Each core book owns exactly one responsibility. Together they are the AdOS Core Operating System.

| Book | Layer | Owns | Location |
|---|---|---|---|
| **A — Agency** | Workflow | The agency domain and the human-gated mission lifecycle | [`book-a/`](book-a/) |
| **B — AI Campaign Factory** | Production | AI drafting of briefs, creative, and campaigns | [`book-b/`](book-b/) |
| **C — Campaign Intelligence** | Explainability | The rationale behind every AI recommendation | [`book-c/`](book-c/) |
| **D — Performance Memory** | Performance memory | The immutable, accumulated campaign evidence base | [`book-d/`](book-d/) |
| **E — Creative Intelligence** | Creative judgement | Reproducible scoring and comparison of alternatives | [`book-e/`](book-e/) |
| **F — AI Orchestration** | Orchestration | The managed pipeline that runs A–E in one deterministic, observable, human-gated process | [`book-f/`](book-f/) |

The order is not arbitrary. A gives the workflow; B produces inside it; C explains what B
produces; D remembers what happened; E judges alternatives against that memory; F runs all of them
in the right order under one human gate. **There was nothing to orchestrate until B–E existed —
which is why F is the last core book.**

---

## 3. The shared principle across the core

Every core book obeys the same order of operations, stated across the books as a single discipline:

> **First data → then evidence → then judgement → then human decision.**

No book skips a step forward. Production (B) does not decide; it drafts. Explanation (C) does not
invent; it grounds. Memory (D) stores facts, never conclusions. Judgement (E) ranks alternatives;
it never chooses direction. Orchestration (F) coordinates; it creates no intelligence of its own.
And at the end of every path stands a human gate that the machine may inform but never replace.

Each book carries its own invariant sentence, and together they describe one honest system:

- **C:** *Evidence is descriptive, not prescriptive.*
- **D:** *The value of Performance Memory compounds only through accumulated, attributable, and reviewable campaign evidence.*
- **E:** *Higher score does not guarantee better business outcome.* · *Creative Intelligence ranks alternatives; humans choose direction.*
- **F:** *Orchestration coordinates intelligence; it does not create intelligence.*

---

## 4. The honest baseline — one truth model across the core

All six books use the same three-tier truth model, and none of them claims unbuilt work as
shipped:

- **✅ SHIPPED** — runs in the live web app today; cited to wired code.
- **🔶 BUILT (UNWIRED)** — code and tests exist, but no live path reaches it.
- **❌ ROADMAP** — a contract or intention with no implementation.

The core is a **specification of the target platform**, honestly tiered against the current code.
Its central, repeatedly-stated truth is that AdOS ships a real, human-gated agency workflow with
real AI production and real reporting (✅), while much of the governed intelligence pipeline —
the evidence read-back, the creative-judgement engine, the governed orchestration runtime, the
observable run record — is **built-but-unwired or roadmap** (🔶/❌). The core books say this
plainly, book by book. The freeze is a freeze of the **specification and its contracts**, not a
claim that every contract is yet met in code.

---

## 5. What builds on the core — and must not change it

| Layer | Book | Relationship to the core |
|---|---|---|
| **Observability** | **G — Analytics Platform** | **Consumes and observes.** Reads the core's records and renders them. *Analytics never influences execution directly.* |
| **Ecosystem** | **H — Marketplace** | **Extends.** Adds an ecosystem around the platform. Additive; the core remains the trusted foundation. |

The seam between the core and everything above it is **one-way**: Book F's observable run record
(Mission ID · Pipeline Version · Stages Executed · Duration · Evidence Used · Human Decisions ·
Final Outcome) is the raw material Book G consumes. The core writes it; the layers above read it;
neither reaches across to alter the other.

---

## 6. Inviolable boundaries (held across the entire core)

- **100% local, offline-first** — no cloud, no external API, no per-token billing, no data leaving
  the device.
- **Copy-only** — AdOS produces copy and drafts for human use; it never executes actions on the
  world.
- **No external data · no vendor telemetry** — the platform works on the agency's own data and
  emits nothing off-device.
- **Human-sovereign** — the human gate is first-class; AdOS never auto-approves.
- **Not an autonomous agent** — deterministic, fixed pipeline order, no self-improvised paths.

No book — core or later — may weaken these. They are constitutional to AdOS.

---

## 7. Version

**`AdOS Core Specification v1.0`** — Books A–F, frozen. Aligned to
[`PRODUCT_TRUTH.md`](PRODUCT_TRUTH.md). Later books (G Observability, H Ecosystem) are versioned
separately and build on this core without changing it.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
