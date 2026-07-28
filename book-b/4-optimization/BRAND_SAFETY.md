# Brand Safety — Enforcing Banned Words Against Generated Copy

| | |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status.** ✅ **SHIPPED (Series 2 · 2026-07-28)** — the Brand-Safety
> Gate is now **wired into live creative generation**. `CreativeStudioService.generate`
> runs the gate after generation and **before persistence**; generated copy that
> contains a Brand `bannedWords` term (or leaks PII / a secret) is **blocked** — no
> `CreativeSet` is saved, the mission never advances to the review gate, and a
> `creative.blocked.v1` event is emitted. The gate reuses the deterministic
> `RegexSafetyEngine` for PII/secret scanning
> (`packages/ai-manager/src/runtime/safety-engine.ts:48`) plus the operator's Brand
> `bannedWords` (`domains/agency-os/src/brand/brand.ts:37`), composed at the
> composition root (`apps/web/src/safety.ts`, wired `apps/web/src/app.ts:85`) behind a
> domain-local port (`domains/creative-studio/src/creative/safety.ts`); enforced in
> `domains/creative-studio/src/creative/service.ts:70-90`; tested in
> `apps/web/src/safety.test.ts` and `apps/web/src/creative.test.ts` (block case).
> **Book A gap B-1 is CLOSED for creative generation.**
>
> **Still 🔶 / ❌ (honest remainder).** The `ConstitutionChecker` governance path
> (`domains/executive-memory/src/governance.ts`) remains **🔶 BUILT (UNWIRED)**; the
> gate covers **creative generation only** (briefs, campaign drafts, and reports are
> not yet gated); and it blocks/passes (no "warn" tier yet). The sections below specify
> that fuller target design.

---

## 0. Why this is the highest-value document in the book

The Book A walkthrough ([`../../book-a/BOOK_A_WALKTHROUGH.md`](../../book-a/BOOK_A_WALKTHROUGH.md),
Scenario 2) puts a financial-services client into the pipeline. Their brand's
`bannedWords` include `"guaranteed"` and `"risk-free"`. The first creative round
generates ad copy containing *"guaranteed returns"*. Nothing in the running system
stops it. The only thing standing between that phrase and a client's approval queue is
a **human compliance reviewer noticing it** (step 3 of the scenario). If the reviewer
blinks, forbidden language ships.

Book A files this as **gap B-1** and calls it *"the single most valuable Book B
candidate."* It is the motivating problem for this document:

> **B-1** — Enforce Brand `bannedWords` / forbidden words as a pre-approval creative
> lint. **Revenue ↑** (avoids brand/legal/compliance risk that costs real money) +
> **Production-time ↓** (auto-catch before a human ever looks).

The uncomfortable truth is that AdOS **already contains the code to do this.** Two
independent, unit-tested engines can scan generated text for brand-forbidden words.
Neither is on the live path. This document (1) specifies the target Brand-Safety Gate,
(2) states honestly what exists today and what does not, and (3) defines the wiring
that turns the dormant code into an enforced gate.

---

## 1. Target design — the Brand-Safety Gate

The Brand-Safety Gate is a **deterministic lint** that runs on every generated
`CreativeSet` **after generation and before human review**. It has no LLM in the hot
path — it is a pure text scan, so it is fast, offline, and reproducible, consistent
with the AdOS 100%-local posture (no cloud, no API keys, no per-token billing).

### 1.1 Position in the pipeline

```
Mission → Brief → Creative Generation ──► [ BRAND-SAFETY GATE ] ──► Human Review (creative_assets)
                                               │                          ▲
                                               │ block                    │ pass / warn
                                               ▼                          │
                                          Revision Engine ────────────────┘
```

The gate sits between `creative-studio` producing a `CreativeSet` and the
`creative_assets` approval gate defined in Book A. It never launches anything and never
mutates campaigns — it inspects copy only, exactly matching the creative-studio
contract that it *"produces copy ONLY."*

### 1.2 What it inspects

The gate lints the six copy fields of a `CreativeSet` (the same fields Book A
documents): `headline`, `adCopy`, `cta`, `socialPost`, `landingPage`, `email`.

For each field, it checks the concatenated text against **two forbidden-word sources**:

| Source | Type field | Stored at | Meaning |
|---|---|---|---|
| Brand rules | `bannedWords: string[]` | `domains/agency-os/src/brand/brand.ts:40` | Per-brand banned terms authored during onboarding |
| Company Brain brand profile | `forbiddenWords: string[]` | `packages/contracts/src/ai/company-brain.ts:38` | AI-facing brand memory of terms to avoid |

Matching is **case-insensitive substring** matching, mirroring exactly what the
existing engines already do (`lower.includes(word.toLowerCase())`). A future revision
MAY add word-boundary and diacritic-folded matching for TR/EN; v1.0.0 specifies the
substring behavior the built code already implements so the gate ships without
re-designing the matcher.

### 1.3 Verdict shape

The gate emits a structured verdict per `CreativeSet`:

| Field | Type | Meaning |
|---|---|---|
| `safe` | `boolean` | `true` when zero violations |
| `violations[]` | `{ field, word, source, severity }` | One entry per forbidden hit |
| `field` | copy-field name | Which of the six fields matched |
| `word` | `string` | The banned/forbidden term that matched |
| `source` | `'brand.bannedWords' \| 'brain.forbiddenWords'` | Which list flagged it |
| `severity` | `'block' \| 'warn'` | Policy outcome (see §1.5) |

This is intentionally shaped like the existing `SafetyVerdict`
(`{ safe, issues[] }`) emitted by `RegexSafetyEngine` so the wiring reuses, not
replaces, the built type.

### 1.4 Worked example — the Scenario 2 set

Take the exact `CreativeSet` from Book A Scenario 2, generated for the financial
client whose `bannedWords = ["guaranteed", "risk-free"]`:

| Copy field | Generated text | Gate result |
|---|---|---|
| `headline` | *"Risk-free returns, every quarter"* | ❌ `risk-free` → `block` |
| `adCopy` | *"Guaranteed returns with zero downside"* | ❌ `guaranteed` → `block` |
| `cta` | *"Start investing today"* | ✅ clean |
| `socialPost` | *"Your money, working harder"* | ✅ clean |
| `landingPage` | *"…a guaranteed path to growth…"* | ❌ `guaranteed` → `block` |
| `email` | *"See how our members grow their savings"* | ✅ clean |

**Verdict:** `safe: false`, three `block` violations across three fields. Today (§2)
this set flows untouched to a human reviewer. Under the target gate it is blocked and
handed to revision (§1.6) **before any human is paged** — which is exactly the outcome
B-1 demands.

### 1.5 Block vs warn policy

Not every forbidden term is a compliance landmine. The gate resolves each violation to
a **policy severity**, and the brand (or workspace default) owns the mapping:

| Policy | Behavior | When to use |
|---|---|---|
| `block` | The `CreativeSet` is **rejected before human review**; it auto-triggers a revision (§1.6). A blocked set never reaches the `creative_assets` approval queue. | Regulated-client compliance terms (e.g. `"guaranteed"`, `"risk-free"`). |
| `warn` | The `CreativeSet` **proceeds** to human review but carries a visible warning annotation on the offending field. | Soft brand-preference terms where a human should decide. |

A `block` is the compliance safety net; a `warn` is an editorial nudge. The two-level
model exists so the gate is not a blunt instrument: a regulated term is stopped cold,
while a merely off-brand term informs the human without halting the pipeline. The
severity is resolved per term, so one `CreativeSet` can carry both a hard block on
`"guaranteed"` and a soft warning on an off-tone word in the same pass.

The **default** for any term appearing in Brand `bannedWords` or Company Brain
`forbiddenWords` is `block` — banned means banned. `warn` is an explicit downgrade a
workspace configures for softer style lists. This keeps the safe default aligned with
the B-1 intent: forbidden language should not reach a human at all.

Every gate decision is recorded on the mission timeline (pass, warn, or block with the
specific terms), so the audit story matches Book A's approval-timeline model.

### 1.6 Auto-trigger revision on block

A `block` verdict does not fail the mission. Book A gap B-3 is explicit that *a
revision should be a loop, not a death* — a brand-safety block must **not** call
`mission.fail()`. Instead the gate hands the violation list to the **Revision Engine**
(see the sibling [`./REVISION_ENGINE.md`](./REVISION_ENGINE.md)), which requests a
non-destructive re-generation with the forbidden terms injected as negative constraints
(*"do not use: guaranteed, risk-free"*). The corrected `CreativeSet` re-enters the gate.
Only a clean (or `warn`-only) set advances to `creative_assets` human review.

This closes the loop Scenario 2 walks by hand: steps 3–8 (human spots term → request
revision → regenerate → resubmit) collapse into an automatic block-and-revise before a
human is ever paged.

---

## 2. Today — what the code actually does

### 2.1 The stores exist (✅ SHIPPED, but inert)

Both forbidden-word lists are real, persisted brand data on the live path:

| Data | Path | State |
|---|---|---|
| Brand `bannedWords` | `domains/agency-os/src/brand/brand.ts:40` | ✅ Stored, editable at onboarding |
| Company Brain `forbiddenWords` | `packages/contracts/src/ai/company-brain.ts:38` | ✅ Stored in the brand profile |

They are captured, persisted, and tenant-isolated. They are also, at generation time,
**completely ignored.** Nothing reads them to check output.

### 2.2 Generation performs no safety check (❌ the B-1 gap)

`creative-studio` generates a `CreativeSet` with a single `ai.submit(...)` call
(`domains/creative-studio/src/creative/service.ts:38-89`). It passes
`variables` (product name, brand voice, objective, audience, positioning, key
messages) and a `responseSchema` — and returns the result **directly**. There is no
post-generation scan of the six copy fields against `bannedWords` or `forbiddenWords`.
No creative or brief service in the live app checks generated output against a banned
list. The generated copy flows straight to the `creative_assets` approval gate.

> **This is gap B-1 in one sentence:** the banned-word lists are stored, the generator
> ignores them, and brand safety rests entirely on a human catching the term.

### 2.3 The enforcement engines exist — unwired (🔶 BUILT (UNWIRED))

Two independent engines already implement the check this document specifies. Both are
unit-tested. **Neither is instantiated by any `apps/web` path.**

#### (a) `RegexSafetyEngine` — output inspection

`packages/ai-manager/src/runtime/safety-engine.ts` implements `inspectOutput()`
(`:48-66`). After scanning for PII and secrets, it performs the exact brand check this
gate needs (`:57-64`):

```ts
const brandId = (request.input?.['brandId'] ?? request.variables?.['brandId']) as string | undefined;
if (this.brain && brandId) {
  const brand = await this.brain.brand(brandId);
  const lower = text.toLowerCase();
  for (const word of brand?.forbiddenWords ?? []) {
    if (lower.includes(word.toLowerCase())) issues.push({ kind: 'permission', detail: `brand-forbidden word: "${word}"` });
  }
}
```

This is a working, case-insensitive scan of generated text against the brand's
forbidden words, producing a `SafetyVerdict`. It runs against **no live output** —
`RegexSafetyEngine` lives in the unwired `ai-manager` runtime stack that `apps/web`
never constructs. It also needs a `brandId` threaded into the request `input`/
`variables`; the live creative call (§2.2) does not pass one.

#### (b) `ConstitutionChecker` — governance gate

`domains/executive-memory/src/governance.ts` implements a `check()` that, among other
mandates, performs the forbidden-word check (`:49-54`):

```ts
// 3. Brand rules — forbidden words.
if (input.content && input.brandId) {
  const brand = await this.brain.brand(input.brandId);
  const text = input.content.toLowerCase();
  const hit = brand?.forbiddenWords.find((w) => text.includes(w.toLowerCase()));
  if (hit) violations.push(`brand_rule:${hit}`);
}
```

A `brand_rule:<word>` violation makes the verdict `passed: false`. The class comment
describes it as *"the mandatory gate every AI output passes before it becomes an
action."* In reality it is mandatory **nowhere** — `ConstitutionChecker` is part of the
dormant `executive-memory` stack that no running service calls before showing copy to a
human.

### 2.4 Status summary

| Capability | Tier | Evidence |
|---|---|---|
| `bannedWords` stored per brand | ✅ SHIPPED | `brand.ts:40` |
| `forbiddenWords` stored in brand profile | ✅ SHIPPED | `company-brain.ts:38` |
| Output-scan against forbidden words (regex) | 🔶 BUILT (UNWIRED) | `safety-engine.ts:57-64` |
| Governance forbidden-word check | 🔶 BUILT (UNWIRED) | `governance.ts:49-54` |
| Enforcement on the live creative path | ❌ NOT IMPLEMENTED | `creative/service.ts:38-89` (no check) |
| Auto-trigger revision on violation | ❌ ROADMAP | depends on Revision Engine |

The line is precise: **the checker exists, the data exists, the wiring does not.**

### 2.5 Which engine to wire?

Two engines can enforce the check. They differ in scope, and the wiring decision
matters:

| Aspect | `RegexSafetyEngine` (`safety-engine.ts`) | `ConstitutionChecker` (`governance.ts`) |
|---|---|---|
| Primary job | Text-level safety scan (PII, secrets, injection, brand-forbidden words) | Governance gate (evidence, confidence, brand rules, risk, approvals) |
| Forbidden-word check | `inspectOutput` `:57-64` | `check` step 3, `:49-54` |
| Input needed | `brandId` in request `input`/`variables` + a `CompanyBrainPort` | `brandId` + `content` + an evidence/confidence bundle |
| Extra preconditions | None beyond `brandId` | Requires `evidence` and `confidence` or it fails on other mandates first |
| Verdict | `SafetyVerdict { safe, issues[] }` | `ConstitutionVerdict { passed, violations[], requiresApproval }` |
| Best fit for B-1 | ✅ **Yes** — narrow, no extra grounding needed, ships fastest | Later — richer gate, but pulls in confidence/evidence wiring not required to close B-1 |

**Recommendation:** wire `RegexSafetyEngine.inspectOutput` (or a `BrandSafetyGate`
wrapper over it) to close B-1, because it needs only a `brandId` and a Company Brain —
no evidence/confidence bundle. The `ConstitutionChecker` forbidden-word check remains
the right home once the full governance gate is wired (a later Book B step), at which
point brand safety becomes one clause of a broader constitution check rather than a
standalone lint. The two are not in conflict: the standalone gate is the fast path to
closing B-1; the constitution check is where it eventually consolidates.

### 2.6 Matcher behavior and edge cases (as-built)

The wiring inherits the built matcher exactly, so its limits are documented honestly
rather than assumed away:

| Case | As-built behavior | Note |
|---|---|---|
| Case variation (`Guaranteed`, `GUARANTEED`) | ✅ Caught — both sides lower-cased | `lower.includes(word.toLowerCase())` |
| Substring inside a larger word (`guaranteeing`, `unguaranteed`) | ⚠️ Caught as a match | Substring matching over-catches; acceptable-safe for v1.0.0 (false positives lean toward blocking) |
| Term split across fields | ✅ Handled — each of the six fields scanned independently | Concatenation is per-field |
| Diacritics / TR characters (`garanti` vs `garantı`) | ⚠️ Not folded | Word list must include the exact spellings; folding is a later revision |
| Empty / missing list | ✅ No-op (`?? []`) | Brands without lists simply pass |

The v1.0.0 posture is deliberate: an over-catching substring matcher is a **safe**
default for a compliance gate — a false positive routes to a cheap auto-revision, while
a false negative ships forbidden copy. Precision improvements (word boundaries,
diacritic folding) are a scoped later revision, not a blocker for closing B-1.

---

## 3. To build — wiring the gate onto the live path

The build is not "write a brand-safety engine" — that code is written. The build is
**instantiate it, feed it, and enforce its verdict.** Four pieces of work.

### 3.1 Instantiate a safety engine in the live AI path

Construct a `RegexSafetyEngine` (or a thin `BrandSafetyGate` wrapper over its
`inspectOutput`) with a `CompanyBrainPort` so it can resolve a brand's `forbiddenWords`
/ `bannedWords`. Today the constructor accepts an optional `brain`
(`safety-engine.ts:32-33`); the wiring supplies the live Company Brain instance that
`apps/web` already builds. Merge both lists — Brand `bannedWords` **and** Brain
`forbiddenWords` — into one forbidden set so neither source is dropped.

### 3.2 Thread `brandId` into the creative request

The built check keys off `brandId` in the request (`safety-engine.ts:57`). The live
creative call (`creative/service.ts:38-89`) does not pass one. Add `brandId` to the
creative context and request `variables`/`input` so the gate can resolve the correct
brand's lists under the active tenant.

**Caveat to carry honestly:** Brand `bannedWords` are tenant-isolated (they live on the
`agency-os` brand aggregate, which filters by `tenant_id`), but the Company Brain is
today an unscoped in-memory store. The gate's brand resolution must therefore key
strictly on the resolved `brandId` — never a workspace-wide sweep of Brain lists — so a
cross-tenant `forbiddenWords` entry can never leak into another tenant's lint. This is a
correctness constraint on the wiring, not a new store to build.

### 3.3 Enforce the verdict between generation and review

After `creative-studio` returns a `CreativeSet`, run each of the six copy fields
through the gate **before** the mission advances to the `creative_assets` approval
gate:

| Verdict | Action |
|---|---|
| `safe` | Advance to `creative_assets` human review unchanged. |
| `warn` only | Advance with warning annotations on flagged fields. |
| any `block` | Do **not** advance. Record violations on the timeline; hand off to revision (§3.4). Never call `mission.fail()`. |

This is the single behavioral change that closes B-1: a forbidden term is caught by the
machine, before a human, every time — deterministically.

The enforcement contract, expressed as the wiring the creative flow gains (illustrative,
not shipped):

```
set = creativeStudio.generate(context)        // existing: creative/service.ts
verdict = brandSafetyGate.inspect(set, brandId) // NEW: reuses safety-engine.ts:57-64
timeline.record(missionId, verdict)             // NEW: audit every decision

if verdict.hasBlock:
    revisionEngine.reviseWith(set, verdict.blockedTerms)  // NEW: §3.4, non-destructive
    // do NOT advance; do NOT mission.fail()
else:
    mission.advanceTo('creative_assets')        // existing human review, now trustworthy
```

Every line marked `existing` is on the live path today; every line marked `NEW` is the
wiring this document specifies. Nothing here invents a new engine — `inspect` delegates
to the already-built `RegexSafetyEngine.inspectOutput`.

### 3.4 Feed the Revision Engine

A `block` verdict emits its `violations[]` to the Revision Engine
([`./REVISION_ENGINE.md`](./REVISION_ENGINE.md)) as **negative constraints** for a
non-destructive re-generation. The regenerated `CreativeSet` re-enters §3.3. This is
the loop Book A gap B-3 asks for — revision, not death — and it makes the gate
self-healing rather than merely obstructive.

### 3.5 Policy & configuration

| Item | v1.0.0 spec |
|---|---|
| Default severity | `block` for every `bannedWords` / `forbiddenWords` hit |
| `warn` list | Optional per-brand downgrade list |
| Matcher | Case-insensitive substring (matches built code); word-boundary matching is a later revision |
| Scope | Six `CreativeSet` copy fields; extend to other generated artifacts later |
| Audit | Every verdict (pass/warn/block + terms) written to the mission timeline |
| Locale | TR/EN aware; forbidden lists may hold terms in either language |

### 3.6 Relationship to neighboring engines

- **Brand Injection** ([`../1-ai-foundations/BRAND_INJECTION.md`](../1-ai-foundations/BRAND_INJECTION.md))
  is the *preventive* half — it pushes brand voice and rules **into** the prompt so the
  model is less likely to generate forbidden copy. Brand Safety is the *enforcement*
  half — it verifies the output **after** the fact. Injection reduces violations;
  the gate guarantees none slip through. They are complementary, not redundant.
- **Creative QA** ([`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md))
  scores creative *quality*; Brand Safety enforces *compliance*. QA asks "is this good?";
  the gate asks "is this allowed?". A set can be high-quality and still blocked.
- **Revision Engine** ([`./REVISION_ENGINE.md`](./REVISION_ENGINE.md)) is the remediation
  path a `block` triggers.
- The **AI Constitution** ([`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md))
  is the governing reference: the Brand-Safety Gate is one concrete enforcement of the
  Constitution's mandate that no AI output becomes an action until it passes the
  brand-rule check.

---

## 4. Acceptance criteria (definition of "B-1 closed")

The gap is closed only when **all** of the following hold on the live path:

1. Generating a `CreativeSet` whose copy contains a Brand `bannedWords` term produces a
   `block` verdict **without a human in the loop**.
2. A blocked set never appears in the `creative_assets` approval queue.
3. A blocked set auto-triggers a non-destructive revision; the mission does **not** enter
   `failed`.
4. Company Brain `forbiddenWords` are enforced identically to Brand `bannedWords`.
5. Every verdict is recorded on the mission timeline with the offending term(s) and
   source list.
6. A clean or `warn`-only set advances to human review unchanged.

Until these hold, the honest status remains **🔶 built, unwired; ❌ not enforced.**

---

## 5. Value contribution

| Lever | How this document delivers it |
|---|---|
| **Revenue ↑** | Prevents brand/legal/compliance-violating language (e.g. a financial client's `"guaranteed returns"`) from ever reaching a client's approval queue. A single missed forbidden term can trigger regulatory penalties, client loss, or reputational damage — real money. Deterministic enforcement removes the human-error surface entirely. |
| **Production-time ↓** | Moves the banned-word catch from a manual compliance review (Scenario 2, steps 3–8) to an automatic machine gate. Reviewers stop hunting for forbidden strings; violations are blocked and auto-revised before a human is paged. Fewer review cycles, faster approvals. |

Brand Safety is the clearest expression of the AdOS value rule: it both **protects
revenue** (risk avoided) and **compresses production time** (humans freed from a
mechanical check) — while reusing code the repository already contains.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
