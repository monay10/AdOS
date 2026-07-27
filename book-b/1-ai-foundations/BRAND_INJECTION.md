# Brand Injection — Putting the Brand into Generation

> **Owner:** Office of the Chief AI Architect
> **Source of truth:** ../../PRODUCT_TRUTH.md
> **Governing reference:** AI_CONSTITUTION.md (this part)
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Status:** Official

**Implementation status:** ⚠️ **PARTIAL ✅** — brand *voice* and *values* reach the
model today, but only as **flat prompt variables**; injecting and **enforcing** brand
*rules* (`dos`/`donts`/`bannedWords`) is **🔶 BUILT (UNWIRED) / ❌ ROADMAP** — the
enforcement code exists in the repo but is **not on the live generation path**.

---

## 0. What "Brand Injection" means

Brand Injection is the discipline of making every AI-generated artifact *sound like the
client's brand and obey the client's rules* — before a human ever reviews it. In the AdOS
agent pipeline (Campaign Brief → Planning → Research → Memory → **Brand** → Prompt
Orchestrator → Generation → Quality → Brand Safety → …) Brand is the stage that turns a
stored `Brand` aggregate into constraints the generator must honour.

A brand in AdOS is a first-class aggregate with three distinct facets
(`domains/agency-os/src/brand/brand.ts:20-41`):

| Facet | Type | Fields | Purpose |
|---|---|---|---|
| **Profile** | `BrandProfile` | `mission`, `values[]`, `voice`, `targetAudience` | *How the brand speaks* |
| **Identity** | `BrandIdentity` | `primaryColor`, `secondaryColor`, `logoUrl?`, `typography` | *How the brand looks* |
| **Rules** | `BrandRules` | `dos[]`, `donts[]`, `bannedWords[]` | *What the brand forbids* |

The aggregate's own doc-comment names the intent precisely: *"Holds the profile
(voice/values), identity (visual system), rules (do/don't constraints the AI Company must
obey) and assets. The single source of brand truth the Creative Studio and reviewers
consult."* (`domains/agency-os/src/brand/brand.ts:88-92`).

This document covers the **injection** side — getting brand data *into* the prompt. The
**enforcement** side — hard-blocking output that violates `bannedWords` — is specified in
Part 4, cross-referenced as ../4-optimization/BRAND_SAFETY.md.

---

## 1. Target design — full brand context assembly

The target architecture treats the brand as a structured contribution to the **Context
Engine** (specified in the AI Constitution's two-stack model; the builder itself exists
unwired at `domains/executive-memory/src/context-builder.ts:37-86`). Brand contributes in
two layers:

### 1.1 Soft layer — voice & values (steer the model)

Voice, values, mission and audience are *stylistic* signals. They shape tone but do not
gate output. They belong in the prompt as descriptive variables the model reads and
imitates.

### 1.2 Hard layer — rules (constrain the model, then verify)

`dos`/`donts`/`bannedWords` are *contractual* constraints. The target design injects them
**twice**, on both sides of generation:

```
Brand aggregate
   ├─ profile.voice / profile.values ──▶ [soft]  prompt variables (steer)
   ├─ rules.dos / rules.donts ─────────▶ [hard-in]  prompt directives ("MUST / MUST NOT")
   └─ rules.bannedWords ───────────────▶ [hard-in]  prompt directives
                                         [hard-out]  pre-approval guard scans output,
                                                     blocks on any banned term
```

| Layer | Brand field | Injection point | Failure mode if a violation slips through |
|---|---|---|---|
| Soft | `profile.voice`, `profile.values` | Prompt variable | Off-brand tone; a revision loop |
| Hard-in | `rules.dos`, `rules.donts` | Prompt directive block | Model ignores; caught by hard-out |
| Hard-in | `rules.bannedWords` | Prompt directive block | Model ignores; caught by hard-out |
| Hard-out | `rules.bannedWords` | Pre-approval guard | **Blocked** — copy never reaches the human reviewer |

The design principle: **never trust the model to obey a rule you can verify
deterministically.** Soft signals steer; hard rules are *both* stated in the prompt *and*
checked against the returned text. This is why banned-word handling is design-split
between this doc (state it in-prompt) and BRAND_SAFETY (verify it post-generation).

### 1.3 Scope — which artifacts brand must reach

Brand injection is not a single-stage concern. The creative set alone emits six copy
fields that must all carry the brand (Book A's `CreativeSet` vocabulary): `headline`,
`adCopy`, `cta`, `socialPost`, `landingPage`, `email`
(`domains/creative-studio/src/creative/creative-set.ts`). Every one of those is a surface
a `bannedWord` could appear on and a surface a `voice` should shape. The target design
therefore injects the brand at each generative stage that produces client-facing prose —
brief, creative, and any future per-asset generator — not only at the first stage that
happens to read `brand.profile` today.

### 1.4 The visual identity gap (❌ ROADMAP)

`BrandIdentity` (`brand.ts:28-34`: `primaryColor`, `secondaryColor`, `logoUrl?`,
`typography`) is captured on the aggregate but is **irrelevant to text generation and
unused by it** — AdOS produces copy only, never rendered visuals (PRODUCT_TRUTH.md §2.4;
image/vision capabilities are declared with no engine, PRODUCT_TRUTH.md §4). Visual brand
injection (logo lockups, palette-constrained imagery) is ❌ ROADMAP and out of scope for
this doc, which concerns the *textual* brand only. It is noted here so the reader does not
mistake stored identity fields for an active injection path.

---

## 2. Today — what actually ships (⚠️ PARTIAL ✅)

### 2.1 Voice and values reach the model — as flat variables

Today only the **soft layer** is live, and only partially. When a mission generates its
marketing brief, the route reads the brand aggregate and flattens the *profile* into the
generation context (`apps/web/src/routes.ts:927-928`):

```ts
brandVoice: brand.profile.voice,
brandValues: [...brand.profile.values],
```

The Marketing Intelligence service forwards those two fields verbatim into the AI task's
`variables` (`domains/marketing-intelligence/src/brief/service.ts:54-55`):

```ts
variables: {
  clientName: context.clientName,
  industry: context.industry,
  brandVoice: context.brandVoice,     // ← the only brand signals
  brandValues: context.brandValues,   //   that reach the model
  productName: context.productName,
  ...
}
```

The `MarketingContext` DTO carries exactly these two brand fields and no others
(`domains/marketing-intelligence/src/brief/marketing-brief.ts:24-25`). The Creative Studio
stage is even thinner — it passes `brandVoice` alone
(`apps/web/src/routes.ts:967`; `domains/creative-studio/src/creative/service.ts:48`); it
does not receive `brandValues` at all.

### 2.2 The shipped brand-injection surface

| Stage | Brand fields injected | Cite | Tier |
|---|---|---|---|
| Marketing brief | `voice`, `values` | `routes.ts:927-928`, `brief/service.ts:54-55` | ⚠️ PARTIAL ✅ |
| Creative set | `voice` only | `routes.ts:967`, `creative/service.ts:48` | ⚠️ PARTIAL ✅ |
| Campaign draft | none | — | — |
| Report / executive | none | — | — |

### 2.3 What "flat variable" means, precisely

`brandVoice` is a single string (default `'professional'` —
`brand.ts:64`) and `brandValues` a string array. They are dropped into the prompt-variable
bag the Prompt Orchestrator renders (the hardcoded `ROLES` + `buildMessages` path,
described in the AI Constitution). There is **no** structured brand block, **no**
directive framing ("you MUST NOT…"), and **no** post-generation check that the model
actually honoured the voice. It is steer-only, best-effort, unverified.

### 2.4 Explicitly NOT shipped today

- **`rules.dos` / `rules.donts` are never injected.** No route or service reads
  `brand.rules`; a grep for brand-rule fields across the live path returns only the
  `voice`/`values` hits above. The dos/donts a client painstakingly enters are stored on
  the aggregate (`brand.ts:190-194`, `updateRules`) and **go nowhere near generation.**
- **`rules.bannedWords` are STORED but NOT ENFORCED against generated copy.** They persist
  on the `BrandRules` value object (`brand.ts:40`) and survive `snapshot()`
  (`brand.ts:169-173`), but nothing on the live path compares generated headlines, ad
  copy, CTAs, social posts, landing pages or emails against them. This is exactly **Book A
  walkthrough gap B-1** (see §5).

### 2.5 End-to-end trace of a brand field today

Following `voice` from capture to model makes the shipped path — and its ceiling —
concrete:

| Step | Where | What happens to `voice` |
|---|---|---|
| 1. Capture | Onboarding / `updateProfile` (`brand.ts:178-182`) | Stored on `BrandProfile.voice` |
| 2. Persist | `snapshot()` (`brand.ts:164-176`) | Round-trips through persistence intact |
| 3. Read | `routes.ts:927` | `brand.profile.voice` read at the route boundary |
| 4. Flatten | `MarketingContext.brandVoice` (`marketing-brief.ts:24`) | Copied into a flat DTO field |
| 5. Submit | `brief/service.ts:54` | Passed as a `variables.brandVoice` string |
| 6. Render | Prompt Orchestrator (`buildMessages`) | Interpolated into prompt text |
| 7. Verify | — | **Nothing** — no check the output honoured it |

Every `rules.*` field's trace stops at **step 2**: captured and persisted, then dropped.
No step 3 reads it, so there is no step 4–7. That truncation is the whole of gap B-1.

---

## 3. Built-unwired & roadmap — rule injection and enforcement (🔶 / ❌)

The rule-handling machinery is **not vaporware**. Two independent enforcement
implementations already exist in the repository — both fully coded, both **unwired**: no
running app path instantiates either against campaign copy.

### 3.1 🔶 Governance forbidden-word check (executive-memory)

The `ConstitutionChecker` performs a brand forbidden-word check as part of its verdict
(`domains/executive-memory/src/governance.ts:48-54`):

```ts
// 3. Brand rules — forbidden words.
if (input.content && input.brandId) {
  const brand = await this.brain.brand(input.brandId);
  const text = input.content.toLowerCase();
  const hit = brand?.forbiddenWords.find((w) => text.includes(w.toLowerCase()));
  if (hit) violations.push(`brand_rule:${hit}`);
}
```

This is the shape of hard-out enforcement: take the generated `content`, resolve the
brand, and flag a `brand_rule:<word>` violation on any hit. It works — it is unit-tested
inside `executive-memory` — but **`apps/web` never constructs a `ConstitutionChecker` and
never calls `check()` on generated copy.** The architecture already exists in the codebase
at `domains/executive-memory/src/governance.ts:37-72`; wiring it into the live pipeline is
Book B build work.

### 3.2 🔶 Regex Safety Engine brand-word scan (ai-manager runtime)

A second, more thorough implementation lives in the unwired AI-manager runtime stack. The
`RegexSafetyEngine.inspectOutput` scans returned text for PII, secrets **and**
brand-forbidden words (`packages/ai-manager/src/runtime/safety-engine.ts:57-64`):

```ts
const brandId = (request.input?.['brandId'] ?? request.variables?.['brandId']) as string | undefined;
if (this.brain && brandId) {
  const brand = await this.brain.brand(brandId);
  const lower = text.toLowerCase();
  for (const word of brand?.forbiddenWords ?? []) {
    if (lower.includes(word.toLowerCase()))
      issues.push({ kind: 'permission', detail: `brand-forbidden word: "${word}"` });
  }
}
```

Its own doc-comment states the intent: *"Detects prompt injection and leaked secrets on
input; PII, secrets and brand-forbidden words on output. A brand check uses the Company
Brain when a brandId is supplied."* (`safety-engine.ts:26-30`). This engine belongs to the
**UNWIRED stack** described in the AI Constitution (`packages/ai-manager/src/runtime/**`):
imported only by ai-manager internals and its tests; `apps/web` never instantiates it and
never routes campaign output through it.

### 3.3 Status ledger for brand rule handling

| Capability | Tier | Evidence |
|---|---|---|
| Voice/values as flat prompt variables | ⚠️ PARTIAL ✅ | `routes.ts:927-928`, `brief/service.ts:54-55` |
| `dos`/`donts` injected as prompt directives | ❌ ROADMAP | no reader of `brand.rules` on live path |
| `bannedWords` injected as prompt directives | ❌ ROADMAP | not passed to any `ai.submit` |
| `bannedWords` enforced against output (governance) | 🔶 BUILT (UNWIRED) | `governance.ts:48-54` |
| `bannedWords` enforced against output (safety engine) | 🔶 BUILT (UNWIRED) | `safety-engine.ts:57-64` |
| Structured brand block in the Context Engine | 🔶 BUILT (UNWIRED) | `context-builder.ts:37-86` |
| Voice-adherence / tone verification of output | ❌ ROADMAP | no scorer exists |

**Do not describe §3.1–§3.2 as live behaviour.** Both are designed-and-coded-but-inactive.
The forbidden-word logic *would* work the moment it is wired; today it protects nothing
because no live caller passes generated copy to it.

### 3.4 Why two implementations exist — and which to wire

That the same brand-word check appears twice (governance and safety engine) reflects the
two-stack reality the AI Constitution describes: the WIRED stack (`apps/web` →
`ai-factory` → `OfflineAIManager`/`LiveAIManager`) never touches either, while the UNWIRED
stack coded both — the governance checker as part of a broader constitution verdict
(evidence, confidence, brand, risk, approval — `governance.ts:37-72`) and the safety
engine as a focused input/output scanner. For brand injection, the **safety engine is the
better wiring target**: it is purpose-built for output inspection, already redacts what it
reports (`safety-engine.ts:84-88`), already resolves `brandId` from the task
(`safety-engine.ts:57`), and returns a clean `SafetyVerdict` the approval flow can gate on
— whereas the governance checker couples the brand check to evidence and confidence
mandates that are themselves unwired. The recommendation in §4.2 reflects this.

---

## 4. To build — wiring brand into the live path

Closing the gap is two concrete pieces of build work, in order.

### 4.1 Inject the hard layer — brand rules into the Context Engine

**Goal:** carry `dos`/`donts`/`bannedWords` from the `Brand` aggregate into every
generation prompt, framed as directives, not steer.

1. **Extend the generation DTOs.** Add `brandRules: BrandRules` alongside the existing
   `brandVoice`/`brandValues` on `MarketingContext`
   (`domains/marketing-intelligence/src/brief/marketing-brief.ts:24-25`) and the creative
   context (`domains/creative-studio/src/creative/creative-set.ts:24`).
2. **Populate it at the route boundary.** Where the route already reads
   `brand.profile.voice` (`apps/web/src/routes.ts:927`), also read `brand.rules` and pass
   it through — the aggregate already exposes it via its `rules` getter
   (`brand.ts:154-156`) and preserves it through `snapshot()` (`brand.ts:169-173`).
3. **Render a structured brand block.** In the Prompt Orchestrator, render `dos` as
   "The brand REQUIRES:", `donts` as "The brand FORBIDS:", and `bannedWords` as "Never use
   these words:". This is the Context Engine's Brand stage, using the unwired builder at
   `domains/executive-memory/src/context-builder.ts:37-86` rather than the flat variable
   bag shipped today.

### 4.2 Add a pre-generation / pre-approval brand guard

**Goal:** never let banned copy reach a human reviewer. Prompt directives are best-effort;
the guard is the deterministic backstop.

1. **Wire one of the two existing engines.** Route each generated artifact's text through
   `RegexSafetyEngine.inspectOutput` (`safety-engine.ts:48-66`) or the
   `ConstitutionChecker` forbidden-word check (`governance.ts:48-54`) — no new detection
   logic is needed; both are written and tested.
2. **Supply `brandId` in the task.** The safety engine already looks for `brandId` on
   `request.input`/`request.variables` (`safety-engine.ts:57`); the live services must
   include it so the scan can resolve the brand's banned list.
3. **Gate on the verdict.** On any `brand_rule:<word>` / `permission` issue, block the
   artifact from advancing to the human approval gate
   (`domains/agency-os/src/approval/approval.ts`, `apps/web/src/routes.ts:478-481`) and
   flag it for automatic revision. The *enforcement policy* — block vs. warn, and the
   revision loop — is specified in ../4-optimization/BRAND_SAFETY.md; this doc's
   responsibility ends at getting the brand's rules *into* the prompt and *to* the guard.

### 4.3 Worked example — before and after

Take a brand whose rules are `dos: ['lead with the guarantee']`, `donts: ['no medical
claims']`, `bannedWords: ['cheap', 'miracle']`.

**Today (⚠️ PARTIAL ✅).** The prompt the model sees carries only:

```
brandVoice: "warm and trustworthy"
brandValues: ["care", "expertise"]
```

The model is free to emit *"Our miracle formula is cheap and cures anything"* — off-voice
*and* triple-violating — and that copy advances straight to the human approval gate. The
reviewer is the first and only line of defence (gap B-1).

**After §4 (target).** The prompt gains a directive block:

```
The brand REQUIRES: lead with the guarantee
The brand FORBIDS: no medical claims
Never use these words: cheap, miracle
Voice: warm and trustworthy · Values: care, expertise
```

…and the returned text is scanned by the wired guard (`safety-engine.ts:48-66`). If the
model still emits `miracle`, the guard raises `permission: brand-forbidden word:
"miracle"`, the artifact is blocked before the approval gate, and it is routed for
automatic revision instead of consuming a human review cycle.

### 4.4 Sequencing

`§4.1` (inject) and `§4.2` (guard) are complementary and should ship together: injection
without a guard is unverified, and a guard without injection wastes the model's chance to
self-comply. Both depend on the same DTO extension in `§4.1.1`. Neither adds a network
dependency: both the governance check and the safety engine are offline, deterministic,
and consistent with AdOS's 100%-local, no-cloud, no-API-key posture
(PRODUCT_TRUTH.md §6.1).

---

## 5. Reference — Book A walkthrough gap B-1

This document is the injection half of **Book A walkthrough gap B-1** (see
../../book-a/BOOK_A_WALKTHROUGH.md): *brand `bannedWords` are captured from the client but
never enforced against generated copy.* The walkthrough traces a client entering banned
terms during onboarding, those terms persisting on the `Brand` aggregate, and generated ad
copy that is free to use them anyway — because no live path reads `brand.rules` into
generation (§2.4) and no live path scans output against them (§3). B-1 is one of Book B's
three motivating problems, alongside B-2 (learning read-back) and B-3 (non-destructive
revision). §4 is its concrete remedy; hard enforcement policy is completed in Part 4.

---

## 6. Value contribution

**Revenue ↑ — brand consistency and risk avoidance.** Consistent voice across every
headline, post and landing page is what lets an agency defend a premium retainer; a single
banned term in delivered copy (a competitor's name, a regulated claim, a discontinued
slogan) is a client-trust and legal-exposure event. Wiring §4 converts the brand's stored
rules from decorative data into an enforced guarantee — a sellable assurance that AdOS
output is on-brand by construction.

**Production-time ↓ — fewer brand-revision loops.** Today's steer-only injection (§2) means
off-brand drafts are caught, if at all, by a human reviewer who bounces the work back for
manual rewrite. Injecting the hard layer (§4.1) raises first-draft brand-fitness, and the
pre-approval guard (§4.2) catches the residual violations *before* a human spends a review
cycle on them — collapsing the "generate → human catches off-brand term → revise →
re-review" loop that gap B-1 makes routine today.

---

## 7. Summary — at a glance

| Brand facet | Field | Today | Target |
|---|---|---|---|
| Profile (soft) | `voice` | ⚠️ flat variable, brief + creative | Structured voice line, all copy stages |
| Profile (soft) | `values` | ⚠️ flat variable, brief only | Structured values line, all copy stages |
| Rules (hard-in) | `dos` | ❌ not injected | Prompt directive ("REQUIRES") |
| Rules (hard-in) | `donts` | ❌ not injected | Prompt directive ("FORBIDS") |
| Rules (hard-in) | `bannedWords` | ❌ not injected | Prompt directive ("Never use") |
| Rules (hard-out) | `bannedWords` | 🔶 enforcement coded, unwired | Wired pre-approval guard (see BRAND_SAFETY) |
| Identity (visual) | colors, logo, type | ❌ unused (copy-only product) | ❌ ROADMAP, out of scope |

**One-line truth:** the brand's *voice* whispers to the model today; the brand's *rules*
are written down and ignored. Book B's job is to make the rules speak — in the prompt — and
then make them stick — at the guard.

The design split is deliberate: **this document injects; ../4-optimization/BRAND_SAFETY.md
enforces.** Both cite the same unwired code (`governance.ts:48-54`,
`safety-engine.ts:57-64`); neither claims it as shipped.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
