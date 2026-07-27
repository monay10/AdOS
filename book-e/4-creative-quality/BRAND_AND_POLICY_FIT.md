# Brand Fit and Policy Fit

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md`](../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md).
>
> **Laws:** *Evidence ≠ judgement · judgement is reproducible · a score is never an LLM opinion
> · higher score does not guarantee better business outcome · Creative Intelligence ranks
> alternatives, humans choose direction.*

---

## 1. What this document defines

This document covers the **two Creative Score dimensions that already have real, deterministic
code** behind them: **Brand Fit** and **Policy Fit**.

Every other quality dimension in Book E — Clarity, Readability, Specificity, Persuasiveness — is
❌ ROADMAP: no code computes it today (see the sibling document
[`CREATIVE_QUALITY_MODEL.md`](CREATIVE_QUALITY_MODEL.md)). Brand Fit and Policy Fit are different.
They are the **most grounded** part of Book E, because the machinery that would enforce them is
**already written, already tested, and already offline** — it is simply not wired into the live
app yet. That makes them the clearest **🔶 BUILT (UNWIRED)** story in the whole book, and the
single most shippable capability Book E describes.

Both dimensions share one defining property that makes them ideal citizens of Creative
Intelligence: they are **rule and regex checks, not model opinions**. A banned word is present or
it is not. A PII pattern matches or it does not. There is no sampling, no temperature, no "the
model thinks this is off-brand." That property is exactly what the governing laws demand, and it
is why these two dimensions can be defended in front of a client with a straight face.

Two sentences bound everything that follows, and they are stated in full because they are the
boundary of the exercise:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

A brand flag or a policy flag is **decision-support**. It surfaces a fact — "this copy contains a
banned word," "this copy leaks an email address" — and hands it to a human. It never makes the
call.

---

## 2. One discipline, two dimensions

Brand Fit and Policy Fit answer different questions but obey the same mechanics.

| Dimension | The question it answers | Built from | Deterministic? |
|---|---|---|---|
| **Brand Fit** | Does this copy honour *this* brand's voice, dos/donts, and banned words? | Brand rules data + a forbidden-words scan | Yes — string matching |
| **Policy Fit** | Does this copy pass offline safety and governance screening (PII, secrets, forbidden words, evidence/confidence gates)? | Regex safety engine + constitution rules | Yes — regex + rule checks |

Neither dimension asks a language model to judge. Both are pure, offline, reproducible checks
over the copy artifact and the brand's own stored rules. Same copy + same rules = same result,
every time, on every machine. That is **Law 2 (Judgement is Reproducible)** satisfied by
construction, and it is why these two dimensions are the ideal examples of **Law 3 (a Score is
never an LLM opinion)**.

The rest of this document walks each dimension: what data and code exist, what is wired, what is
not, and what the build is.

---

## 3. Brand Fit

Brand Fit measures whether a piece of copy sounds like — and stays inside the rules of — the
specific brand it was written for. The raw material for that judgement already exists in the
product as **stored brand data**.

### 3.1 The brand rules data exists (stored, not enforced)

Every brand carries a `BrandRules` record with three fields relevant here:

- **`bannedWords: string[]`** — words the brand must never use
  (`domains/agency-os/src/brand/brand.ts:40`).
- **`dos` / `donts`** — positive and negative style constraints
  (`domains/agency-os/src/brand/brand.ts:66`).
- **`voice`** — the brand's tone descriptor, e.g. "professional"
  (`domains/agency-os/src/brand/brand.ts:24`).

This data is real. It is **stored and round-tripped** through the brand aggregate
(`domains/agency-os/src/brand/brand.ts:172`), and it is **seeded in the demo** so that a live
brand actually carries a populated `bannedWords` list, a `voice`, and dos/donts.

But here is the honest tier:

> **No code reads `bannedWords` to check a creative.** The list is stored as data and faithfully
> persisted, yet nothing in the product loads a generated headline or ad copy and scans it against
> the brand's banned words.

So Brand Fit's core data is **🔶 BUILT (as data), UNWIRED / UNENFORCED**. The rules are captured;
the enforcement is missing. There is a citation for *storing* the banned words
(`brand.ts:40`, `brand.ts:172`) but there is **no citation for a checker that uses them against
creative copy**, because no such checker exists yet.

### 3.2 This is the highest-value wiring in Book E

The gap in §3.1 is not a large engineering task — it is a small, high-leverage one. A brand
already knows its banned words. Copy is already generated as six text fields
(headline, adCopy, cta, socialPost, landingPage, email). The build is:

1. Load the brand's `bannedWords` (`brand.ts:40`) for the client the creative belongs to.
2. Scan each of the six copy fields for any banned word (case-insensitive substring, the same
   deterministic technique the safety engine already uses — see §3.3).
3. Emit a Brand Fit result: a pass/flag plus the list of offending words and where they appeared.

That is the entire wiring. It is deterministic, offline, and reproducible. It turns dormant data
into an enforced dimension. Of everything Book E describes, **enforcing `bannedWords` against
generated copy is the single most shippable capability** — small in code, large in value (§10).

### 3.3 A separate enforcement primitive already exists: the RegexSafetyEngine

The product already contains a working forbidden-words checker — just aimed at a *different* list
and living behind a different door.

`RegexSafetyEngine` (`packages/ai-manager/src/runtime/safety-engine.ts:32`) inspects generated
output and, when a `brandId` is supplied, **checks the copy against brand-forbidden words**
(`packages/ai-manager/src/runtime/safety-engine.ts:61`). The check is a deterministic,
case-insensitive scan: for each forbidden word, if the lower-cased output contains it, an issue is
raised. This is exactly the mechanism §3.2 describes — already implemented, already tested,
already offline.

**Tier:** 🔶 BUILT (UNWIRED). The engine is real and deterministic, but it is invoked only inside
the runtime pipeline, which the live app bypasses (see §5).

### 3.4 Two distinct forbidden-word lists — a real subtlety

There is an important detail that Brand Fit wiring must not paper over: **the product has two
different forbidden-word lists**, in two different domains, populated independently.

| List | Where it lives | Read by |
|---|---|---|
| `bannedWords` | `domains/agency-os/src/brand/brand.ts:40` (the agency-os brand aggregate) | **Nothing** — stored only |
| `forbiddenWords` | Company Brain brand record | `RegexSafetyEngine` (`safety-engine.ts:61`), `ConstitutionChecker` (`governance.ts:49-54`) |

The `RegexSafetyEngine` reads Company Brain **`forbiddenWords`**. The agency-os **`bannedWords`**
is the list the account team actually edits in the brand rules. **These are not the same list.**
Wiring Brand Fit honestly means deciding which list is authoritative — or reconciling the two —
so that the words a strategist types into the brand's banned-words field are the words that
actually get enforced against copy. Documenting the gap is part of keeping Book E honest: today,
the enforced list and the edited list are different objects.

### 3.5 Tone and voice: stored, but no checker exists

Brand Fit as a *human* thinks of it includes tone: does this read as "professional," "playful,"
"authoritative" — whatever the brand's `voice` says? The `voice` field is **stored**
(`brand.ts:24`) and round-tripped like the rest of the brand rules.

But there is **no tone or voice checker anywhere in the product**. No code compares generated copy
against the stored `voice` descriptor. There is no `path:line` for it because no such code exists.

> **Tone / voice checking is ❌ ROADMAP.** The Book B `TONE_CHECKER.md`
> ([`../../book-b/4-optimization/TONE_CHECKER.md`](../../book-b/4-optimization/TONE_CHECKER.md))
> is a design document, not a running check. Book E does not claim tone scoring as built.

So Brand Fit decomposes into two very different tiers: the **banned-words / dos-donts** portion is
🔶 (data and enforcement primitive both exist, wiring pending), while the **tone / voice** portion
is ❌ (no measurement code at all). Book E keeps them separate rather than blurring both into a
single optimistic "Brand Fit is built."

---

## 4. Policy Fit

Policy Fit measures whether a piece of copy passes the agency's **offline safety and governance
screening** before it goes near a client. Unlike tone, this dimension is backed by two real,
deterministic engines.

### 4.1 The RegexSafetyEngine — PII, secrets, injection

`RegexSafetyEngine` (`packages/ai-manager/src/runtime/safety-engine.ts:32`) is a fully offline,
deterministic screen with two halves:

**Input screening** — before a request runs, it scans for prompt-injection phrases and for leaked
secrets (`packages/ai-manager/src/runtime/safety-engine.ts:35-45`).

**Output screening** — after copy is produced, it scans the output for
(`packages/ai-manager/src/runtime/safety-engine.ts:48-66`):

- **PII** — email addresses, phone numbers, credit-card numbers, and IBANs.
- **Secrets** — API-key / password-shaped strings.
- **Brand-forbidden words** — the Company Brain `forbiddenWords` scan described in §3.3
  (`safety-engine.ts:61`).

Every one of these is a **regex or substring match**. There is no model in the loop, no network
call, no randomness. Feed it the same text and the same brand and it returns the same verdict.

**Tier:** 🔶 BUILT (UNWIRED). The engine and its tests exist; it runs only inside the runtime
pipeline (§5).

### 4.2 The ConstitutionChecker — evidence, confidence, brand, risk, approval

`ConstitutionChecker` (`domains/executive-memory/src/governance.ts:23`) is the second Policy Fit
engine. It applies five documented governance rules to a proposed action and its content, and
returns a verdict listing every violation:

1. **Evidence mandate** — the decision must carry supporting evidence; an empty evidence set is a
   violation.
2. **Confidence mandate** — confidence must be at least `minConfidence` (**default 70**); below
   that is a violation.
3. **Brand forbidden-words** — the content is scanned against the brand's forbidden words, and any
   hit is recorded as `brand_rule:${hit}` (`domains/executive-memory/src/governance.ts:49-54`).
4. **Risk policy** — a high-risk action is checked against the Company DNA's risk appetite; a
   high-risk action against a low-appetite brand is a violation
   (`domains/executive-memory/src/governance.ts:58`).
5. **Approval gates** — certain actions require a named human approver
   (`domains/executive-memory/src/governance.ts:63-64`).

Every check here is a **rule evaluation** — a threshold comparison, a set membership test, a
substring scan. It is deterministic and offline, exactly like the safety engine.

**Tier:** 🔶 BUILT (UNWIRED). The checker and its tests exist; nothing in the live app calls it.

### 4.3 Advisory screening — not legal advice

One boundary must be stated plainly, because it is easy to over-claim:

> **Policy Fit is advisory screening, not legal or regulatory advice.** The regex and rule checks
> catch obvious, mechanical problems — a visible email address, a banned word, a missing approval
> — and surface them for a human. They do **not** constitute a compliance sign-off, a legal
> review, or a guarantee that copy meets any statute or platform policy.

A clean Policy Fit result means "no mechanical red flags were found by these specific
deterministic checks." It does not mean "this copy is legally cleared." The human reviewer, and
where required a qualified compliance or legal professional, remains responsible for the actual
decision. Book E's screening reduces the volume a human must eyeball; it does not replace the
human's judgement or their accountability. For the operational compliance workflow this feeds,
see Book B's [`COMPLIANCE.md`](../../book-b/4-optimization/COMPLIANCE.md) and
[`BRAND_SAFETY.md`](../../book-b/4-optimization/BRAND_SAFETY.md) — referenced, not duplicated here.

---

## 5. Why both dimensions are 🔶: the LiveAIManager bypass

Brand Fit's enforcement primitive and both Policy Fit engines are real, deterministic, tested
code. They are tagged **🔶 BUILT (UNWIRED)** rather than ✅ SHIPPED for one structural reason.

Both engines are invoked **only inside the runtime pipeline** — the `AIManager` orchestration in
`manager.ts`. But the live web app does **not** use that pipeline. It builds its AI through
`createAIManager` → `LiveAIManager` (`apps/web/src/ai-factory.ts:39`), and `LiveAIManager` makes
**zero safety calls** and runs **zero constitution checks**. The safety engine and the
constitution checker are instantiated and exercised in the test suite, never on the path a real
user's copy travels.

The practical consequence:

> When a strategist generates copy in the live app today, **nothing scans it for banned words, PII,
> secrets, or governance violations.** The machinery to do so exists and passes its tests — it is
> simply not on the live path.

This is why Brand Fit and Policy Fit are the **strongest 🔶 story in Book E**. Unlike the roadmap
dimensions, there is no algorithm to invent and no data to model. The deterministic checks are
already written. The build is **wiring**: route the six copy fields through `RegexSafetyEngine`
and `ConstitutionChecker` (and add the `bannedWords` scan of §3.2), then surface the results as
Brand Fit and Policy Fit dimensions on the Creative Score. Small in code, large in value.

---

## 6. The laws these dimensions embody

Brand Fit and Policy Fit are not just built — they are the **cleanest demonstrations** of Book E's
governing laws.

### 6.1 Judgement is Reproducible (Law 2)

Every check in this document is deterministic. A banned-word scan, a PII regex, a confidence
threshold, an approval-gate set membership — each returns the identical result for the identical
input, forever, on any machine, offline.

```
policyFit(copy, brandRules) → verdict
policyFit(copy, brandRules) → verdict   // always identical, byte-for-byte
```

There is no re-run drift, because there is no sampling and no clock. **Same copy + same rules =
same result.** This is Law 2 not as an aspiration but as a mechanical fact of regex-and-rule code.

### 6.2 A Score is never an LLM opinion (Law 3)

These two dimensions are the *ideal examples* of Law 3. At no point does a language model rate the
copy. Brand Fit is a string scan against a stored word list. Policy Fit is a battery of regex
matches and rule evaluations. The model's job — elsewhere in the product — is to *produce* copy;
**judging that copy for brand and policy is a separate, transparent, arithmetic activity.** If any
dimension in AdOS proves that a Creative Score is built from Evidence + Rules + Heuristics rather
than model mood, it is these two.

### 6.3 No Hidden Weights (Law 5)

Brand Fit and Policy Fit are not standalone verdicts that quietly veto in the dark — they are
**named dimensions that contribute documented weights** to the Overall Creative Score. In the
example weight table, Brand Fit and Policy Fit each carry a published percentage, visible on the
page like every other coefficient. For the full multi-dimensional model and the documented weight
table, see [`../1-creative-scoring/CREATIVE_SCORING_MODEL.md`](../1-creative-scoring/CREATIVE_SCORING_MODEL.md).

One documented refinement lives there and is worth repeating: **Policy Fit acts as a gate, not
merely a weight.** A creative that trips a PII or banned-word rule cannot be rescued by a high
score elsewhere. The gate is itself a written rule — it is transparent, not hidden — so it honours
Law 5 rather than breaking it.

---

## 7. Human-sovereign: a flag is advisory, never automatic

The most important boundary for these two dimensions is what they are **not** allowed to do.

> A Brand Fit or Policy Fit flag is **advisory input to a human**. It never auto-rejects a
> creative, and it never auto-rewrites one.

When the banned-words scan finds a hit, or the safety engine flags a leaked email, or the
constitution checker records `insufficient_confidence`, the system's job is to **surface the fact**
and stop. It presents: *here is the copy, here is the flag, here is exactly which word or pattern
or rule triggered it.* The strategist then decides — override, revise, or reject. AdOS does not
silently delete the creative, and it does not silently rewrite the offending line.

This is **Law 7 (Suggestion ≠ Automatic Rewrite)** applied to screening. Even a hard, deterministic
policy signal is routed to a human gate rather than acted on autonomously. The shipped human review
gate that receives these flags is documented in Book B — see
[`HUMAN_REVIEW.md`](../../book-b/4-optimization/HUMAN_REVIEW.md),
[`BRAND_SAFETY.md`](../../book-b/4-optimization/BRAND_SAFETY.md), and
[`COMPLIANCE.md`](../../book-b/4-optimization/COMPLIANCE.md) — and Book E references it rather than
redesigning it.

Keeping the flag advisory is not a limitation to be engineered away; it is the point. It is what
lets an agency trust the screen without fearing that a false positive will quietly discard good
work.

---

## 8. Book E produces no new data

Brand Fit and Policy Fit **read**; they do not write a new dataset.

- Brand Fit reads the brand's stored `bannedWords`, `voice`, and dos/donts
  (`brand.ts:40`, `brand.ts:24`, `brand.ts:66`) — data the agency already captured. It produces a
  *judgement* (a flag, a dimension score), not a new stored performance record.
- Policy Fit reads the copy artifact and the brand's forbidden words, and returns a verdict. The
  verdict is decision-support, not a new corpus of evidence.

> **Book D = Evidence → Book E = Judgement. Book E NEVER produces new data.**

The banned-word list, the voice descriptor, the confidence value that the constitution checker
compares against its threshold — all of these are **inputs** produced elsewhere (Book D's evidence
and confidence, the brand aggregate's rules). Book E interprets them into a Brand Fit and a Policy
Fit result. It creates no new performance data in the process.

---

## 9. Boundaries

Brand Fit and Policy Fit live entirely inside AdOS's product boundaries:

- **100% local, offline-first.** Every check is regex or string matching on-device. No cloud, no
  API, no telemetry, no external policy service. Both dimensions are computable with the network
  cable pulled.
- **Copy-only.** The artifact screened is the six copy fields. There is no visual, video, or
  carousel content to check — brand/policy screening of imagery is ❌ against the copy-only
  boundary, not a pending feature.
- **No new data.** These dimensions read brand rules and copy; they never produce a new stored
  dataset (§8).
- **Advisory, not authoritative.** Policy Fit is screening, not legal or compliance sign-off
  (§4.3). A clean result flags "no mechanical red flags," never "legally cleared."
- **Human-sovereign.** A flag is surfaced to a human; it never auto-rejects or auto-rewrites (§7).

---

## 10. Value contribution

Wiring Brand Fit and Policy Fit changes two numbers an agency cares about, and it is the most
concrete near-term win in Book E.

- **Revenue — protect the client relationship.** Automatic brand and policy screening catches an
  off-brand word or a leaked email address *before* it reaches the client, not after. A single
  banned word in a headline that ships to a regulated client can cost an account; a deterministic
  scan that flags it first protects the relationship the agency is paid to keep. And because the
  check is reproducible and inspectable — "this was flagged because it contains the banned word
  *X*" — the agency can defend both its process and its overrides.
- **Production time — cut manual review.** Today a human eyeballs every creative for banned words,
  PII, and obvious policy issues. A deterministic screen does that pass in an instant and hands the
  reviewer a short, specific list of flags instead of a blank page to scan. The human still decides,
  but on a filtered, annotated set — hours of line-by-line checking collapse into confirming a
  handful of flags.

Both gains are bounded by the same discipline that runs through this entire book: the screen
**ranks and flags; a human chooses direction.** That is why, of everything Book E describes,
enforcing the brand's own banned-words list against generated copy — a small piece of wiring over
code that already exists and already passes its tests — is the **single most shippable capability**.

---

## 11. Summary

- Brand Fit and Policy Fit are the **two Creative Score dimensions with real, deterministic code**
  behind them — the most grounded, cleanest **🔶** part of Book E.
- **Brand Fit data exists** (`bannedWords` `brand.ts:40`, `voice` `brand.ts:24`, dos/donts
  `brand.ts:66`), is stored and round-tripped (`brand.ts:172`) and seeded — but **no code checks a
  creative against it** (🔶 BUILT-as-data, UNWIRED/UNENFORCED). Enforcing it is the highest-value
  wiring in the book.
- A **forbidden-words enforcement primitive already exists** — `RegexSafetyEngine`
  (`safety-engine.ts:32`, scan at `safety-engine.ts:61`) — but reads Company Brain
  `forbiddenWords`, a **different list** from agency-os `bannedWords`. 🔶.
- **Tone / voice checking is ❌ ROADMAP** — `voice` is stored, but no tone checker exists.
- **Policy Fit** is backed by `RegexSafetyEngine` (input injection+secrets `safety-engine.ts:35-45`;
  output PII+secrets `safety-engine.ts:48-66`) and `ConstitutionChecker` (`governance.ts:23`:
  evidence, confidence ≥ 70, brand forbidden-words `governance.ts:49-54`, risk `governance.ts:58`,
  approval gates `governance.ts:63-64`). Both 🔶 BUILT (UNWIRED). Both are **advisory screening, not
  legal advice**.
- Both are 🔶 because the engines run only inside the runtime pipeline, and the live app's
  `LiveAIManager` (`apps/web/src/ai-factory.ts:39`) makes **zero safety calls**. **Wiring them is
  the build.**
- They embody the laws: **reproducible** (Law 2), **never an LLM opinion** (Law 3, their ideal
  example), and **documented weights, no hidden weights** (Law 5 — see
  [`../1-creative-scoring/CREATIVE_SCORING_MODEL.md`](../1-creative-scoring/CREATIVE_SCORING_MODEL.md)).
- A flag is **advisory** — it never auto-rejects or auto-rewrites; the human decides (Law 7, Book B
  [`HUMAN_REVIEW.md`](../../book-b/4-optimization/HUMAN_REVIEW.md)).
- Book E produces **no new data**; these dimensions read brand rules and copy and return a
  judgement.

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
