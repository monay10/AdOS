# AI Constitution — The Governing Document of Book B

> **Book B — AI Campaign Factory · Part 1: AI Foundations**

| | |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Status** | Official — aligned to `PRODUCT_TRUTH.md` |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |

**Implementation status (this document governs all of Book B):** ✅ SHIPPED facts +
🔶 BUILT (UNWIRED) architecture + ❌ ROADMAP design — rigorously separated. This
document is a **design & architecture specification**, not a claim of shipped
capability.

---

## 0. Preamble — what this document is and is not

This is the **AI Constitution** for AdOS. It is the single governing reference for
every document in **Book B — AI Campaign Factory** (Parts 1–4). Every other Book B
doc inherits its rules, its vocabulary, and above all its **honesty discipline** from
this file.

Book B describes an **AI-agent pipeline** — the target architecture for how AdOS
turns a campaign objective into human-approved creative and campaign drafts. A large
part of that pipeline **is not yet running in the live app.** Some of it exists in the
codebase but is not wired in. Some of it does not exist at all. This Constitution
exists so that no reader — engineer, executive, auditor, or customer — can ever
mistake a design drawing for a shipped feature.

Three commitments bind this document and every document beneath it:

1. **Book B is a specification, not a press release.** It documents both what the code
   does today **and** the target agent architecture. It **never** claims an unbuilt
   capability as shipped.
2. **`PRODUCT_TRUTH.md` wins.** Where any Book B statement and
   [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) disagree, the audit in
   `PRODUCT_TRUTH.md` is authoritative and this document is wrong.
3. **Every capability is tier-tagged and traced.** No capability appears in Book B
   without exactly one of the three status tiers defined in §2, and every ✅ SHIPPED
   claim is traced to wired source code by `path:line`.

> This document is documentation only. It describes code; it does not change it.

---

## 1. The differentiator — pipeline, not a prompt box

The market is full of tools whose entire architecture is one hop:

```
Prompt → LLM → Output
```

A user types a prompt, a model answers, the answer is shown. There is no memory of
what worked last time, no brand enforcement, no research step, no quality gate — the
"intelligence" is entirely inside a general model the vendor rents by the token.

**AdOS is designed differently.** The target architecture is a small **AI-agent
pipeline** in which each stage does one job and hands structured work to the next:

```
Campaign Brief
    → Planning
    → Research
    → Memory            (read the agency's corporate memory)
    → Brand             (voice, rules, banned words)
    → Prompt Orchestrator
    → Generation        (local model)
    → Quality           (score the draft)
    → Brand Safety      (enforce banned words / rules)
    → Revision          (non-destructively improve)
    → Approval          (human gate)
    → Learning          (record what worked)
    → Optimization      (feed the next campaign)
```

This is the **TARGET architecture** that Book B specifies. It is the organizing spine
of all four Parts:

- **Part 1 — AI Foundations** (this Part): the law, the tiers, the two stacks.
- **Part 2 — Creative Factory**: Brief → Brand → Orchestrator → Generation → Quality
  → Brand Safety → Revision.
- **Part 3 — Learning Engine**: Memory → Learning → Pattern detection → the closed
  loop.
- **Part 4 — Optimization**: winner/loser, trend, recommendation, compounding
  intelligence.

**Crucial honesty note:** presenting the pipeline as the target does **not** mean the
pipeline runs today. Today, five services each make a **single** model call (see §5).
The multi-stage agent pipeline above is the destination Book B is designed toward —
tier by tier, stage by stage, each labeled truthfully below.

### 1.1 The pipeline, stage by stage, by tier

This table is the master map of the differentiator against the three-tier model. It is
the reference every Book B Part returns to. No stage may be described more optimistically
than its tier here allows.

| Pipeline stage | Tier today | What exists | Where it lives / lands |
|---|---|---|---|
| **Campaign Brief** | ✅ SHIPPED | Single-shot AI brief with mission injection + provenance | `domains/marketing-intelligence/.../brief/service.ts:43-96` |
| **Planning** | ❌ ROADMAP | No planner; the pipeline is a fixed linear route | Part 1 design |
| **Research** | ❌ ROADMAP | No research step, no external ingestion (`connector-hub` is a stub) | Part 1 / Part 4 design |
| **Memory (read)** | 🔶 / ❌ | Readers exist unwired; generation-time wiring absent | `domains/executive-memory/**`; Part 3 |
| **Brand** | 🔶 / ⚠️ | Flat `brandVoice` var is injected ✅; rule/safety injection is unwired | `domains/executive-memory/src/governance.ts:49-54`; Part 2 |
| **Prompt Orchestrator** | ⚠️ PARTIAL ✅ | Hardcoded roles + `buildMessages`; versioned registry is unwired | `apps/web/src/ai-live.ts:123-154`; `domains/prompt-registry/**` |
| **Generation** | ✅ SHIPPED | Local single-shot model call | `apps/web/src/ai-live.ts:26` |
| **Quality** | ❌ ROADMAP | No scoring code | Part 2 design |
| **Brand Safety** | 🔶 BUILT (UNWIRED) | Banned-words enforcement engine exists, not on live path (gap B-1) | `packages/ai-manager/src/runtime/safety-engine.ts:57-64`; Part 2 |
| **Revision** | ❌ ROADMAP | Human, destructive revision only (gap B-3) | Part 2 design |
| **Approval** | ✅ SHIPPED | Human gates at every stage | `domains/agency-os/src/approval/approval.ts` |
| **Learning** | ✅ (write-only) / 🔶 | Recording ships; EMA learning engine exists unwired (gap B-2) | `apps/web/src/routes.ts:1118-1177`; `packages/ai-manager/src/runtime/learning.ts:18-46`; Part 3 |
| **Optimization** | ❌ ROADMAP | No winner/loser, trend, or recommendation engine | Part 4 design |

Read the table honestly: **three** of thirteen stages ship (Brief, Generation,
Approval), two ship partially (Orchestrator, Brand voice), several exist unwired, and
the rest are design. The pipeline is a **target**, and Book B is the map from here to
there.

---

## 2. The three-tier status model (the heart of Book B)

Every capability named anywhere in Book B **MUST** carry exactly one of these three
tiers. This model is not decoration; it is the mechanism that keeps the whole book
honest. Use the exact labels and glyphs.

| Tier | Label | Definition | How to write it |
|---|---|---|---|
| ✅ | **SHIPPED** | Runs in the live app path today. A wired code path executes it. | Present tense. Cite the wired code by `path:line`. Safe to describe as real behavior. |
| 🔶 | **BUILT (UNWIRED)** | Code **exists** in the repo and is unit-tested, but **no running app path instantiates it.** | "The architecture already exists in the codebase as `<path>`; wiring it into the live pipeline is Book B build work." Always state it is **not yet on the live path.** Never "shipped." |
| ❌ | **ROADMAP (ABSENT)** | No implementation exists. Pure design / specification. | Never present tense as a product behavior. Say plainly "not implemented today." Design spec framing only. |

### 2.1 Reading the tiers correctly

- **🔶 is not vaporware and it is not shipped.** It is designed-and-coded-but-inactive.
  This is the most important and most easily abused tier. The honest power of Book B
  is that *much of the agent architecture is already 🔶* — written, tested, dormant —
  so wiring it is a build task, not a research project. But an unwired engine changes
  nothing a customer experiences until it is on the live path. Every 🔶 mention must
  say so.
- **✅ requires a wired citation.** If you cannot cite the code path that executes in
  the live app, it is not ✅. Downgrade it.
- **❌ is a clean design canvas.** It must never borrow the present tense.

### 2.2 The governance rule for every Book B document

> Every document tier-tags **every** capability it mentions. Every ✅ traces to wired
> code. Tiers are **never** blurred — ✅ material and 🔶/❌ material are kept in
> visibly separate subsections (a **Today** subsection for what runs, a **To build**
> subsection for the spec). A doc that mixes a shipped fact and a roadmap wish in one
> unlabeled sentence is out of compliance with this Constitution.

### 2.3 Writing the tiers — a worked example

Because the 🔶 tier is the one most easily abused, here is the discipline in concrete
form. The subject is banned-words brand safety (gap B-1).

- **❌ Wrong (claims unwired code as live):**
  *"AdOS enforces your brand's banned-words list, blocking any non-compliant copy."*
  This is false: the enforcement engine is not on the live path.

- **❌ Wrong (blurs tiers in one sentence):**
  *"AdOS generates on-brand copy and validates it against your banned-words list."*
  Generation is ✅; validation is 🔶. The unlabeled "and" smuggles a design goal in
  behind a shipped fact.

- **✅ Right (tiered and traced):**
  *"Today the shipped path injects brand voice as a prompt variable (✅
  `apps/web/src/ai-live.ts`) but does **not** enforce banned words against the output.
  A banned-words enforcement engine already exists in the codebase (🔶
  `packages/ai-manager/src/runtime/safety-engine.ts:57-64`) but is **not on the live
  path**; wiring it is Book B build work (Part 2, gap B-1)."*

Every Book B doc is expected to read like the third bullet.

---

## 3. The two-stack reality

There is exactly one reason the tier model is unavoidable: **AdOS today contains two
AI stacks, and only one of them runs.** Every engineer working in Book B must hold
both in mind.

### 3.1 The WIRED stack (executes today) — ✅ SHIPPED

The live app path is deliberately small and single-shot.

```
apps/web  →  ai-factory.ts  →  ┌─ OfflineAIManager   (DEFAULT, deterministic)
                               └─ LiveAIManager       (local engines only)
                                        ▲
              five services each call ai.submit(...)
```

- **`OfflineAIManager`** is the **default**. It returns deterministic string-template
  output with `model: 'offline-deterministic'` and **zero token usage** — no model
  server required (`apps/web/src/ai.ts:13`). Genuine model prose requires a locally
  run engine.
- **`LiveAIManager`** is the opt-in real path (`apps/web/src/ai-live.ts:26`). It calls
  a **local** inference engine only, builds messages from hardcoded roles, injects
  language and schema-as-text, extracts JSON, and performs **one** self-repair retry
  (the `for (let attempt = 0; attempt < 2; attempt++)` loop at
  `apps/web/src/ai-live.ts:49`). No failover, no second model.
- **Five services** — brief, creative, campaign, report, executive — each make **one**
  `ai.submit(...)` call. That is the whole live AI surface.

### 3.2 The UNWIRED stack (built, tested, dormant) — 🔶 BUILT (UNWIRED)

A second, much richer stack **already exists in the repository**, is unit-tested, and
is imported **only** by `packages/ai-manager` internals and by tests. **`apps/web`
never instantiates any of it.** This is the agent architecture awaiting wiring.

| Unwired module (exists in repo) | What it is |
|---|---|
| `packages/ai-manager/src/runtime/**` | `InferencePipeline`, `SchemaValidationEngine`, `RegexSafetyEngine`, `InMemoryLearningEngine`, capability / model / tool registries |
| `domains/executive-memory/**` | `ExecutiveContextBuilder`, `BrainEvidenceEngine`, `HeuristicConfidenceEngine`, `ConstitutionChecker`, `BoardMeetingEngine` |
| `domains/prompt-registry/**` | Versioned prompt registry with render + A/B scoring |

Evidence that these are dormant, not live:
`PRODUCT_TRUTH.md` §5 lists `prompt-registry` as *"implemented but orphaned (0
workspace importers)"* and the generation services take **no** `CompanyBrainPort`
(`domains/marketing-intelligence/.../brief/service.ts:47-62`).

> **This is why the tiers exist.** A newcomer reading `packages/ai-manager/src/runtime/`
> will find a validation engine, a safety engine, and a learning engine and could
> honestly believe AdOS validates, enforces, and learns. It does not — not on the live
> path. The 🔶 tier is the guardrail against exactly that mistake.

### 3.3 The seam that makes wiring possible — ✅ SHIPPED

The two stacks are not destined to stay apart. The live app talks to AI through a
single stable interface, the `AIManagerPort`. `OfflineAIManager` is written explicitly
as *"a drop-in `AIManagerPort`, so nothing downstream changes when the real manager is
swapped in"* (`apps/web/src/ai.ts`). `LiveAIManager` implements the same port
(`apps/web/src/ai-live.ts:26`), and `ai-factory.ts` chooses between them.

This is a deliberate, shipped design decision and it is the reason the 🔶 stack can be
activated as a **wiring** task rather than a rewrite: the richer runtime — validation,
safety, learning, context — can be composed **behind** the same `AIManagerPort` seam
without touching the five calling services. Book B's build work is therefore mostly
**assembly and wiring at this seam**, not green-field engine construction. That is the
practical payoff of the two-stack reality: the hard parts are already coded and
tested; they are simply not yet plugged into the seam that runs.

> Caution for authors: the *existence* of the seam is ✅, but plugging any specific
> engine into it is still 🔶/❌ until the wiring is written and running. Do not let the
> elegance of the seam tempt a present-tense claim about the engines behind it.

---

## 4. The AI Law — 100% local, inviolable

This is the one clause of the Constitution that **admits no tier and no exception.**
It is ✅ SHIPPED and it is **law.**

> **AdOS AI runs 100% locally. No cloud. No API key. No per-token billing. Air-gap
> capable.**

- Engine selection is local-only: **Ollama** (`packages/ai-manager/src/runtime/engines/ollama-engine.ts`,
  `localhost:11434`) or any **OpenAI-compatible local server** — vLLM / LM Studio /
  llama.cpp / SGLang (`packages/ai-manager/src/runtime/engines/openai-compatible-engine.ts`,
  `localhost:8000`).
- No cloud endpoint and no API key are passed anywhere in the factory
  (`apps/web/src/ai-factory.ts:23-57`).
- The `enableCloudInference` config flag exists but is **never read**
  (`packages/config/src/schema.ts:58-59`) — cloud inference is ❌ ROADMAP and, per
  this law, will remain gated behind an explicit, local-first design decision.
- The only outbound `fetch()` calls in the system target localhost AI engines.

**Consequence for Book B authors:** no document may describe a capability in a way
that implies a hosted model, a vendor API, telemetry egress, or metered tokens. If a
proposed design requires the cloud, it violates the AI Law and must be redesigned to
run locally. This is what makes the entire pipeline safe for air-gapped and regulated
agencies — a permanent competitive moat, not a limitation.

---

## 5. How AI works TODAY — ✅ SHIPPED

This section is the definitive statement of the **live** AI behavior. Everything here
is ✅ SHIPPED and cited to wired code. Nothing else may be described as live.

| Live capability | Tier | Evidence |
|---|---|---|
| Local-only inference (Ollama + OpenAI-compatible), no cloud, no key | ✅ | `apps/web/src/ai-factory.ts:23-57` |
| Offline deterministic stub is the **default** (zero tokens) | ✅ | `apps/web/src/ai.ts:13` |
| Single-shot generation of five artifacts | ✅ | one `ai.submit` per service |
| Mission injection (mission fields → prompt variables) | ✅ | `domains/marketing-intelligence/.../brief/service.ts:47-62` |
| Language injection (TR/EN) | ✅ | `apps/web/src/ai-live.ts:139-141` |
| Schema injection **as prompt text** (not enforced) | ⚠️ PARTIAL ✅ | `apps/web/src/ai-live.ts:142-144` |
| Basic prompt orchestration (hardcoded roles + `buildMessages`) | ⚠️ PARTIAL ✅ | `apps/web/src/ai-live.ts:123-154` |
| JSON extraction from model output | ✅ | `apps/web/src/ai-live.ts:179-198` |
| **One** self-repair retry (no failover) | ✅ | `apps/web/src/ai-live.ts:49-67` |
| Provenance on every artifact | ✅ | `{taskId, capability, model, engine, latencyMs}` |
| In-memory recording to Company Brain / Executive Memory at completion | ✅ (write-only) | `apps/web/src/routes.ts:1118-1177` |
| Human approval workflow | ✅ | `domains/agency-os/src/approval/approval.ts`, `apps/web/src/routes.ts:478-481` |

### 5.1 The live path in one paragraph

A mission is submitted. Each of the five services flattens the relevant mission fields
into prompt variables (**mission injection**), the orchestrator builds messages from a
**hardcoded** role table and injects the output **language** and the target **schema
as descriptive text**, the local engine generates once, AdOS **extracts JSON** from
the response, and if that JSON is malformed it asks the model to repair it **once**.
The resulting artifact carries **provenance**. At mission completion the outputs are
**recorded** into the in-memory Company Brain and Executive Memory. A human must
**approve** at each gate. That is the entire shipped AI system.

### 5.2 The two honest caveats inside "today"

- **Schema is injected, not enforced.** The schema is text in the prompt
  (`apps/web/src/ai-live.ts:142-144`); nothing validates the model's output against it
  on the live path. Enforcement code exists but is unwired (§6).
- **Recording is write-only relative to generation.** The brain is written at
  completion but **no generator reads it back** (§7, gap B-2). Today's AI does not
  yet get smarter from yesterday's campaign at generation time.

---

## 6. What is BUILT but UNWIRED — 🔶

The following engines **already exist in the codebase** and are unit-tested. **None is
instantiated by `apps/web`.** Each is a Book B build task: describe the existing code,
state that it is unwired, and specify the wiring. **None may be described as live
behavior.**

| Built-unwired engine | What exists today | Evidence (real code) |
|---|---|---|
| **Schema Validation Engine** | Full schema-enforced validation of model output | `packages/ai-manager/src/runtime/validation-engine.ts:62-118` |
| **Prompt Registry** | Versioned prompts, render, A/B scoring | `domains/prompt-registry/src/in-memory-prompt-registry.ts:55-92` |
| **Context Engine** | Builds Prompt→Mission→Brain→Memory→Experience context | `domains/executive-memory/src/context-builder.ts:37-86` |
| **Retry / Inference Pipeline** | Full failover + schema-repair loop | `InferencePipeline` in `packages/ai-manager/src/runtime/**` (live path has only 1 retry) |
| **Safety / Brand-Safety Engine** | Banned-words enforcement vs copy | `packages/ai-manager/src/runtime/safety-engine.ts:57-64` |
| **Constitution / Governance checks** | Rule gating of AI output | `domains/executive-memory/src/governance.ts:37-72` |
| **Evidence / Confidence reasoning** | Grounds claims in stored metrics; confidence scoring | `domains/executive-memory/src/reasoning.ts:14-99` |
| **Learning Engine** | EMA reward tracking + suggestion | `packages/ai-manager/src/runtime/learning.ts:18-46` |
| **Pattern detection** | Capture + rank winning patterns | `domains/company-brain/src/pattern-library.ts:9-38` (captured at completion, never read into generation) |

> **Every 🔶 sentence in Book B must end, in effect, with:** "…exists unwired at
> `<path>`; wiring it into the live pipeline is Book B build work." That is the entire
> value proposition of Part 2 and Part 3 — not to invent these engines, but to
> **activate** them.

---

## 7. What is ROADMAP — ❌

No implementation exists for the following. Book B documents them as **design
specifications** only, always stating "not implemented today." They must never appear
in the present tense as product behavior.

| Roadmap capability | Reality | Evidence / note |
|---|---|---|
| Vision / image-generation / speech / OCR / video | Declared in the type; **no engine** | `packages/contracts/.../ai-task.ts:14-24` |
| AI quality scoring | No quality/score code | — |
| AI revision / rewrite (non-destructive) | Human revision only | `approvals.requestRevision` is human-only |
| Brief analysis / brief improvement | Brief is generated once; no analyzer | — |
| Tone checker / readability / compliance analysis | No code | — |
| Persona builder | Event constant only | `domains/marketing-intelligence/src/events.ts:10` |
| Competitor analyzer | Capability seed only | `capability.ts:83` |
| Per-asset generators (hook / headline / copy / CTA) | Single `creative.set` task emits all fields at once | `domains/creative-studio/.../creative/service.ts:42-55` |
| Creative QA | No QA/scoring of output | — |
| Winner / loser detection | No detector (`bestHook`/`bestHeadline` are stored merge fields only) | — |
| Trend analysis | No code | — |
| Recommendation engine | Recs are output array fields only | `apps/web/src/ai.ts:160-164` |

### 7.1 The headline roadmap goal — closing the learning loop

**Today the brain is WRITE-ONLY relative to generation.** State this plainly wherever
it is relevant. AdOS records what happened (§5, `apps/web/src/routes.ts:1118-1177`),
but **no generator reads that memory back at generation time** — the generation
services take no `CompanyBrainPort`
(`domains/marketing-intelligence/.../brief/service.ts:47-62`). The product promise —

> *"AdOS uses the agency's corporate memory to produce human-approved first drafts and
> improves each campaign by learning from the last."*

— is therefore **half-true today**: the memory is written but not yet read into
generation. **Closing this loop is the single headline design goal of Book B.**

It is a hybrid tier and must be labeled precisely: the **readers exist unwired** in
`domains/executive-memory/**` (🔶), but the **generation-time wiring does not exist**
(❌). Book B never states the loop is closed. Part 3 (Learning Engine) is the plan to
close it.

---

## 8. Governance rules for Book B

Binding on every document in Parts 1–4.

1. **Tier-tag every capability.** Exactly one of ✅ / 🔶 / ❌. No untagged capability
   claims.
2. **Trace every ✅ to wired code** by `path:line`. If you cannot cite the live path,
   it is not ✅.
3. **Never blur tiers.** Keep a **Today** subsection (what runs, ✅) visibly separate
   from a **To build** subsection (the spec, 🔶/❌). Never let a shipped fact and a
   roadmap wish share an unlabeled sentence.
4. **`PRODUCT_TRUTH.md` is supreme.** On any conflict,
   [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) wins.
5. **Obey the AI Law (§4).** No cloud / API-key / telemetry / per-token framing, ever.
6. **Stay consistent with Book A (§9).** Reuse its vocabulary exactly; never
   contradict it.
7. **Carry the standard doc shape:** the header block, a one-line Implementation-status
   banner near the top, a target-design section, a **Today** section, a **To build**
   section, a **Value contribution** note, and the standard footer.
8. **No exaggeration.** When unsure whether a file exists, describe the capability
   generically rather than inventing a path.

### 8.1 The motivating problems — Book A walkthrough gaps

Book B exists to solve three concrete gaps surfaced by the Book A walkthrough
([`../../book-a/BOOK_A_WALKTHROUGH.md`](../../book-a/BOOK_A_WALKTHROUGH.md)). Every
Book B Part traces back to one of them:

| Gap | Problem | Owning tier today | Book B Part |
|---|---|---|---|
| **B-1** | **Banned-words are not enforced** against generated copy. Brand safety is injected as text, not enforced. | 🔶 (engine exists unwired: `safety-engine.ts:57-64`) | Part 2 — Creative Factory |
| **B-2** | **Learning is not read back.** The brain is written but never consulted at generation time. | 🔶 readers / ❌ wiring | Part 3 — Learning Engine |
| **B-3** | **Revision is destructive / human-only.** No AI, non-destructive rewrite path. | ❌ ROADMAP | Part 2 — Creative Factory |

These three gaps are the reason Book B is a build plan and not a victory lap.

---

## 9. Consistency with Book A

Book B reuses Book A's vocabulary **exactly** and never contradicts it. In particular:

- **Mission states** and the approval gates
  `strategy_and_budget` / `creative_assets` / `campaign_launch`
  ([`../../book-a/APPROVAL_ENGINE.md`](../../book-a/APPROVAL_ENGINE.md)).
- **The six KPIs** — CTR / CPC / CPA / CPL / ROAS / ROI
  ([`../../book-a/AGENCY_REPORTING.md`](../../book-a/AGENCY_REPORTING.md)).
- **Report verdicts** — `exceeded` | `on_track` | `at_risk`.
- **The CreativeSet's six copy fields** — headline / adCopy / CTA / socialPost /
  landingPage / email
  ([`../../book-a/CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md)).
- **Provenance** on every artifact.

The Book A Constitution
([`../../book-a/BOOK_A_AGENCY_CONSTITUTION.md`](../../book-a/BOOK_A_AGENCY_CONSTITUTION.md))
governs the agency domain; this AI Constitution governs the AI system. They are
siblings and must never disagree.

---

## 10. Value contribution

Per the AdOS value rule, every capability must **increase the agency's revenue** or
**reduce its production time** — and this Constitution is what keeps that promise
credible.

- **Production time ↓ (today, ✅).** The shipped single-shot pipeline turns a natural
  language objective into human-approved **first drafts** of brief, creative, campaign
  and report — collapsing hours of blank-page drafting into a review-and-approve loop,
  entirely on local hardware at **zero per-token cost** (§4).
- **Revenue ↑ (the Book B build, 🔶 → ✅).** Wiring the dormant engines — brand-safety
  enforcement (B-1), learning read-back (B-2), non-destructive AI revision (B-3) —
  makes each campaign draft cleaner, on-brand, and informed by what won last time. A
  factory that **compounds** on its own corporate memory produces better creative per
  hour of human review, which is where agency margin is made.
- **The moat (permanent).** Because every stage obeys the 100%-local AI Law, AdOS
  delivers this to regulated and air-gapped agencies that **cannot** send client data
  to a hosted model — a market competitors architected on `Prompt → cloud LLM → Output`
  structurally cannot serve.

The honesty of the tier model is itself a value: it lets the agency invest in wiring
work with a precise map of what already exists (🔶) versus what must be designed (❌),
instead of rediscovering half-built engines by accident.

---

## 11. Quick reference — the Constitution in one screen

For an engineer opening any Book B doc, the whole governing model compresses to this:

| Question | Answer |
|---|---|
| Does AdOS ship a multi-stage AI agent pipeline? | **No — that is the target (§1).** Today: five single-shot calls (§5). |
| What actually runs? | Local-only inference, offline deterministic default, mission/language/schema-text injection, JSON extraction, one self-repair retry, provenance, in-memory recording, human approval (§5). |
| What exists in code but is dormant? | Validation, safety, learning, context, prompt-registry, reasoning, governance engines — `packages/ai-manager/src/runtime/**`, `domains/executive-memory/**`, `domains/prompt-registry/**` (§6). |
| What has no code at all? | Vision/speech, quality scoring, AI revision, per-asset generators, winner/loser, trend, recommendation, persona, competitor (§7). |
| Is the learning loop closed? | **No.** The brain is write-only relative to generation. Closing it is the headline goal (§7.1). |
| Can AdOS use the cloud? | **No — inviolable law (§4).** 100% local, no key, no per-token cost, air-gap capable. |
| What are the motivating problems? | B-1 banned-words enforcement, B-2 learning read-back, B-3 non-destructive revision (§8.1). |
| Which document wins on conflict? | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md), always (§0). |

**The one rule beneath all rules:** if you cannot cite the wired code, it is not ✅.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to `PRODUCT_TRUTH.md`.*
