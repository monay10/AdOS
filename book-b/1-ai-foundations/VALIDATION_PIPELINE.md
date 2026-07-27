# Validation Pipeline — Making Model Output Safe to Become an Artifact

| | |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ⚠️ **PARTIAL** — JSON *extraction* is shipped and live
> (✅); JSON-**Schema enforcement** with automatic repair is **built but unwired**
> (🔶) at `packages/ai-manager/src/runtime/validation-engine.ts`. Manual per-service
> shape checks stand in for enforcement on the live path today.

---

## 1. Why this document exists

A local language model does not return a data structure. It returns *text* — usually
the JSON we asked for, sometimes wrapped in ```` ```json ```` fences, sometimes with a
sentence of prose in front, occasionally with a missing field or a value of the wrong
type. Before that text can become a **MarketingBrief**, a **CreativeSet**, a
**CampaignDraft**, a **CampaignReport**, or an **ExecutiveReport** — the five artifacts
of the AdOS pipeline — it must be turned into a trustworthy, correctly-shaped object.

The **Validation Pipeline** is the stage that does this: it stands between raw model
output and the domain artifact, and it is the last automated line of defense before a
human reviewer sees a first draft. Everything downstream — the approval gates
`strategy_and_budget`, `creative_assets`, `campaign_launch`; the persisted aggregate;
the KPI math — assumes the object it receives is well-formed. This document defines the
target design for that guarantee, states exactly what the code does **today**, describes
the **built-but-unwired** validator that already exists in the repo, and specifies the
work to wire it into the live path.

---

## 2. Target design — extract → schema-validate → repair → accept

The target Validation Pipeline is a four-step gate applied to every structured AI task.
Each step has a single responsibility and a defined failure behavior.

| Step | Responsibility | On success | On failure |
|---|---|---|---|
| **1. Extract** | Recover a JSON value from chatty model text (strip fences, take the balanced object/array) | Pass the parsed value to step 2 | Repair turn: ask the model to resend JSON only |
| **2. Schema-validate** | Check the value against the task's `responseSchema` (types, `required`, `enum`, bounds, nesting) | Pass the validated value to step 3 | Emit a precise, path-scoped error list |
| **3. Repair** | Feed the validation error back to the model as a corrective instruction and re-run | Loop to step 1 with the new output | After N attempts, surface a typed failure |
| **4. Accept** | Hand the validated object to the domain service as the artifact `content` | Artifact is created; provenance attached | — |

The design intent is that **no malformed object ever reaches a human reviewer or the
persistence layer**. A field that is missing, mistyped, or out of range is caught by
step 2 and either repaired by step 3 or rejected as a typed error — never silently
accepted. The pipeline is schema-*driven*: the same task can declare any
`responseSchema` and the validator adapts, rather than each artifact hand-coding its own
checks.

```
   model text
       │
   ┌───▼────┐   fences / prose stripped, outermost {…} taken
   │ EXTRACT│──────────────── no JSON ────────────┐
   └───┬────┘                                      │
       │ parsed value                              │
   ┌───▼──────────┐  responseSchema: type,         │  repair turn
   │ SCHEMA-VALIDATE│ required, enum, min/max…     │  (resend JSON only)
   └───┬──────────┘──── errors ──┐                 │
       │ valid                    │ repairInstruction
   ┌───▼────┐                     ▼                 │
   │ ACCEPT │            re-run model  ◄────────────┘
   └───┬────┘            (bounded attempts)
       │ artifact.content
       ▼
   domain service → human approval gate
```

This composes with two neighboring concerns documented elsewhere in Book B: the
**Retry Engine** (model failover and the repair loop budget) and the **Prompt
Orchestrator** (which assembles the schema-carrying prompt in the first place). The
Validation Pipeline is the *acceptance test*; the Retry Engine is the *control loop*
that keeps re-attempting until the acceptance test passes or the budget is spent.

### 2.1 Design principle — the schema is the contract

The pipeline's discipline rests on one rule: **the `responseSchema` attached to an AI
task is the single, machine-checkable contract for that task's output.** The same schema
must (a) instruct the model, (b) validate the reply, and (c) drive the repair. When those
three uses share one artifact, they cannot drift. When they are split — a prompt string
here, a hand-coded `typeof` check there — they drift silently, which is precisely the
condition the live path is in today (§3). The target design collapses all three onto the
one `responseSchema` the task already carries.

### 2.2 What "acceptable" means, precisely

Acceptance is layered, and each layer is strictly stronger than the one below it:

| Layer | Question answered | Guarantees |
|---|---|---|
| **Parses** | Is the text a JSON value at all? | It is syntactically JSON |
| **Is an object** | Is it a non-array object? | It has named fields |
| **Shape** | Are the required fields present with the right JS types? | Top-level structure holds |
| **Schema** | Do `enum`, bounds, `minLength`, and *nested* items also hold? | The value is semantically in-contract |

Today the live path reaches the **Shape** layer (via hand-coded checks); the target
design reaches the **Schema** layer (via the built validator). The gap between those two
rows is the entire subject of this document.

---

## 3. Today — what the live path actually does (⚠️ PARTIAL ✅)

On the running app path, "validation" is two shipped pieces plus a manual per-service
check. There is **no schema enforcement** in this path — the schema is sent to the model
as *advice*, not checked against the reply.

### 3.1 Schema is injected as prompt text, not enforced ✅ (as injection) / not enforced

`LiveAIManager` builds the system prompt by serializing the task's `responseSchema` into
a plain instruction to the model:

- `apps/web/src/ai-live.ts:142-144` — if a `responseSchema` is present, it is
  `JSON.stringify`-ed into the system message: *"Return ONLY a single JSON object that
  satisfies this JSON Schema (no prose, no markdown fences): …"*.

The schema travels to the model as **text**. Nothing in the live path later compares the
reply *against* that schema. This is the `⚠️ PARTIAL ✅` line item in the AI
Constitution ledger: schema-injection is shipped; schema-*enforcement* is not.

### 3.2 JSON extraction ✅ SHIPPED

After the model replies, the live path extracts a JSON object from the text:

- `apps/web/src/ai-live.ts:179-198` — `extractJson()` strips ```` ```json ```` and
  ```` ``` ```` fences, `.trim()`s, then tries `JSON.parse` on the whole stripped text
  and, failing that, on the **outermost `{…}` span** (`indexOf('{')` …
  `lastIndexOf('}')`). It accepts only a non-array object; otherwise it returns
  `{ ok: false, error: 'no JSON object found in reply' }`.

This is genuine, shipped robustness — it is what lets a chatty local model still produce
usable structured output. But extraction only proves the text **parses as an object**.
It does **not** prove the object has the right fields or the right types.

**Worked example — where extraction succeeds but the object is still wrong.** Suppose a
local model, asked for a marketing brief, replies:

```
Sure! Here is the brief:
```json
{ "objective": "Grow trial signups", "targetAudience": 42, "keyMessages": "fast setup" }
```
Hope this helps.
```

`extractJson` strips the fences and the prose, takes the outermost `{…}`, and parses it
into an object — **extraction succeeds**. Yet `targetAudience` is a number (should be a
string) and `keyMessages` is a string (should be an array), and three required fields are
missing entirely. Extraction is content-blind; it cannot catch any of this. Only a schema
check can — and on the live path that job falls to the hand-coded per-service checks
described in §3.4, not to a schema.

### 3.3 One self-repair retry ✅ SHIPPED

If extraction fails, the live path performs exactly one corrective retry:

- `apps/web/src/ai-live.ts:49-67` — a `for (attempt = 0; attempt < 2; attempt++)` loop.
  Attempt 0 is the normal prompt; attempt 1 appends `repairTurn(lastError)`
  (`ai-live.ts:164-172`), which tells the model its previous reply *"was not a valid
  JSON object"* and to reply with JSON only. If both attempts fail to yield a JSON
  object, the manager throws so the calling service returns its own typed error
  (`ai-live.ts:69-73`).

Note the trigger: this repair fires on **extraction failure only** (non-parseable /
non-object text). It does **not** fire on a *schema* mismatch, because the live path
never runs a schema check. A reply that parses into an object with the wrong fields sails
straight through extraction.

### 3.4 Manual shape checks, per service ✅ SHIPPED (but hand-coded)

Because the live path enforces no schema, each business service re-checks the shape of
the extracted object **by hand** before constructing its artifact:

- **Marketing brief** — `domains/marketing-intelligence/src/brief/service.ts:109-124`:
  `validateContent()` casts the output and manually asserts `typeof o.objective ===
  'string'`, `typeof o.targetAudience === 'string'`, `typeof o.positioning ===
  'string'`, and `Array.isArray(...)` on `keyMessages`, `recommendedChannels`,
  `budgetAllocation`, `kpis`. Any miss returns `UnavailableError('AI Manager returned a
  malformed marketing brief')`.
- **Creative set** — `domains/creative-studio/src/creative/service.ts:102-123`:
  `validateContent()` manually asserts `headline`, `adCopy`, `cta`, `socialPost` are
  strings, and that the nested `landingPage` (`headline`/`body`/`cta`) and `email`
  (`subject`/`body`) objects each have their string fields. Any miss returns
  `UnavailableError('AI Manager returned a malformed creative set')`.

These checks are correct but they are the **problem this document targets**:

| Limitation of the hand-coded checks | Consequence |
|---|---|
| Duplicated in every service | Five artifacts → five bespoke validators to maintain |
| Shallow — presence + `typeof` only | No `enum`, no length/range bounds, no deep item validation |
| No repair path | A malformed object becomes a hard `UnavailableError`, not a re-attempt |
| Drift from the schema | The prompt's `responseSchema` and the hand check can diverge silently |

The result: the *object* is guaranteed to parse, and its *top-level shape* is
hand-checked, but the **schema is not enforced and there is no automatic schema-repair**.
A value that is the right type but the wrong content (e.g. a `verdict` outside
`exceeded|on_track|at_risk`, a negative budget, an empty required string) is not caught
here.

---

## 4. Built-unwired — the SchemaValidationEngine already in the repo (🔶)

The enforcement half of the target design **already exists in the codebase** as a real,
unit-tested JSON-Schema validator. It is not vaporware and it is not on the live path —
it is consumed only by the dormant `AIManagerRuntime` and its tests. The architecture
already exists in the codebase; **wiring it into the live pipeline is Book B build
work.**

### 4.1 What is built

At `packages/ai-manager/src/runtime/validation-engine.ts`:

| Component | Location | What it does |
|---|---|---|
| `SchemaValidationEngine.validate` | `validation-engine.ts:62-68` | Validates an already-parsed value against `request.responseSchema`; returns `{ ok, value }` or `{ ok:false, error }` with a joined error list |
| `validateAgainstSchema` | `validation-engine.ts:76-118` | Dependency-free recursive validator: `type`, `enum`, `minLength`, numeric `minimum`/`maximum`, object `required` + `properties`, array `items` — each error path-scoped (`$.field`, `$[i]`) |
| `repairInstruction` | `validation-engine.ts:71-73` | Builds a corrective retry instruction embedding the error **and** the schema: *"Your previous response was invalid: … Respond ONLY with JSON matching this schema: …"* |
| `JsonResponseFormatter.format` | `validation-engine.ts:48-55` | The extraction counterpart: recovers the first balanced object/array from raw text via `extractJson` (`validation-engine.ts:9-41`) |

Crucially, `validateAgainstSchema` is **deeper** than any hand check: it enforces
`enum` membership (`validation-engine.ts:85-87`), string `minLength`
(`:89-92`), numeric bounds (`:94-99`), and it recurses into nested objects and array
`items` (`:101-115`) with human-readable, path-scoped errors. This is exactly the
step-2 enforcement the live path lacks.

Run against the malformed brief from §3.2's worked example, the built validator would not
merely say "malformed" — it would return a precise, actionable error list such as:

```
$.targetAudience: expected string, got number;
$.keyMessages: expected array, got string;
$.objective: … (and any missing $.required fields)
```

That specificity is what makes automated repair viable: the exact violated path and the
schema can be handed straight back to the model. Contrast the live path's generic *"was
not a valid JSON object"* repair (`ai-live.ts:164-172`), which carries no information
about *which* field is wrong because the live path never ran a schema check to find out.

There is also a second, subtly different extractor here worth noting for anyone wiring
these together:

| Extractor | Location | Recovery strategy |
|---|---|---|
| Live path `extractJson` | `ai-live.ts:179-198` | Strip fences, then outermost `{…}` span; **objects only** |
| Runtime `extractJson` | `validation-engine.ts:9-41` | Regex fence match, then **balanced** brace/bracket scan; objects **or arrays** |

Both are shipped code; they differ in that the runtime extractor does a true
depth-counted balanced scan (`validation-engine.ts:16-39`) and accepts top-level arrays.
When wiring, the two extraction behaviors should be reconciled to a single implementation
so the live path and the runtime agree on what "extractable" means.

### 4.2 It is wired only into the dormant runtime

The validator is orchestrated by the unwired `AIManagerRuntime`, which already
implements the full target sequence — **format → validate → repair loop**:

- `packages/ai-manager/src/runtime/manager.ts:238-252` — after inference it calls
  `formatter.format(...)` (extract), then `validation.validate(...)` (schema check); on
  `validated.ok` it accepts and records `validate.ok`; on failure it either throws a
  `ValidationError` at the retry ceiling or appends a repair turn built from
  `repairInstruction(...)` (`manager.ts:358`) and re-runs. The documented pipeline order
  is stated in the runtime's own header comment: *"format → validate(+repair) →
  safety(out) → constitution → decision journal"* (`manager.ts:75`).

**But `apps/web` never instantiates `AIManagerRuntime`.** The live app path uses
`LiveAIManager` / `OfflineAIManager` via `ai-factory.ts`, not the runtime. So the
`SchemaValidationEngine`, `repairInstruction`, and the format→validate→repair loop are
**built, tested, and dormant** — reachable only from `packages/ai-manager` internals and
its test suite (e.g. the `validation-safety` and `integration` tests). This is the
`🔶 BUILT (UNWIRED)` tier.

---

## 5. To build — wire the validator into the live path (🔶 → ✅)

The build work is *activation and composition*, not green-field design: the validator
exists; it must be inserted into the path that actually runs. Two viable shapes:

**Option A — inline the engine into `LiveAIManager`.** Add a schema-validation step
inside the existing loop at `ai-live.ts:49-67`, immediately after `extractJson`
succeeds (`ai-live.ts:59-64`), by calling `SchemaValidationEngine.validate(parsed.value,
request)`. On failure, replace the extraction-only `repairTurn` with one built from
`repairInstruction(error, request.responseSchema)` so the repair carries the schema, not
just "resend JSON". This is the smallest change and keeps the live manager as the single
generation surface.

**Option B — route the live services through `AIManagerRuntime`.** Longer term, have
`ai-factory.ts` construct the already-complete `AIManagerRuntime`
(`manager.ts:215-252`) so the five services inherit the full
format→validate→repair sequence for free, along with the neighboring safety and
constitution steps documented elsewhere in Book B.

### 5.1 How it composes with the Retry Engine

The Validation Pipeline supplies the **accept/reject verdict**; the **Retry Engine**
owns the **loop and budget**. They compose cleanly:

| Concern | Owner | Today | Target |
|---|---|---|---|
| "Is this output acceptable?" | Validation Pipeline | extraction + manual shape only | extract **+ schema-validate** |
| "Try again, and how many times?" | Retry Engine | 1 self-repair, extraction-triggered (`ai-live.ts:49`) | N attempts, **schema-triggered** repair |
| "What do we tell the model on retry?" | `repairInstruction` | generic "resend JSON" (`ai-live.ts:164-172`) | error **+ schema** (`validation-engine.ts:71-73`) |
| "Give up cleanly" | both | throw → service `UnavailableError` | `ValidationError` at retry ceiling (`manager.ts:250`) |

The key change is the **retry trigger**: today a retry fires only when text won't parse;
in the target, a retry also fires when a parsed object *fails its schema*, and the repair
message hands the model the exact schema and the exact violated path. That is the
difference between "the model eventually emits some object" and "the model emits **the
object we specified**."

### 5.2 Sequencing note

- The hand-coded per-service `validateContent` checks (`brief/service.ts:109-124`,
  `creative/service.ts:102-123`) should be **kept as a backstop** during migration and
  only retired once every artifact carries a `responseSchema` rich enough to subsume
  them. They must never be removed ahead of enforcement being live — that would remove
  the only shape guarantee currently on the path.
- Wiring must preserve existing behavior: a total failure still surfaces as the
  service's typed `UnavailableError`, so no route or test contract changes.

### 5.3 Failure modes the wired pipeline must handle

Wiring enforcement onto a local-model path introduces failure modes the extraction-only
path never had to reason about. The design must handle each explicitly:

| Failure mode | Cause | Required pipeline behavior |
|---|---|---|
| **Repair oscillation** | Model fixes field A, breaks field B, repeats | Bounded attempts (`manager.ts:250` retry ceiling → typed `ValidationError`) |
| **Under-specified schema** | Schema omits a constraint the artifact needs | Keep the per-service backstop (§5.2) until schemas are complete |
| **Over-strict schema** | Schema demands more than any local model reliably emits | Tune `minLength`/bounds to reality; enforcement must not become a denial-of-service on valid work |
| **Latency inflation** | Each repair is another full local inference | Budget repairs against the task `timeoutMs` already threaded through (`ai-live.ts:55`) |
| **Extractor disagreement** | Live and runtime extractors differ (§4.1) | Reconcile to one extractor before enforcement goes live |

The governing constraint from the AI Constitution applies throughout: enforcement must
**fail closed to a typed error, never fail open to a malformed artifact**. A pipeline that
silently downgrades an invalid object to "good enough" would defeat its own purpose and
push the defect onto the human reviewer — the exact cost this stage exists to remove.

### 5.4 Acceptance criteria for calling this ✅ SHIPPED

The topic graduates from ⚠️ PARTIAL to ✅ only when **all** hold on the live path:

1. Every structured AI task submits a `responseSchema` rich enough to describe its
   artifact (types, `required`, and any `enum`/bounds the artifact relies on).
2. The live manager calls `SchemaValidationEngine.validate` on the extracted object.
3. On a schema failure, the repair turn is built from `repairInstruction` (schema +
   error), not the generic JSON-only nudge.
4. Total failure still surfaces as the service's existing typed `UnavailableError`, so no
   route or test contract changes.
5. The hand-coded `validateContent` backstops are retired only after 1–4 are proven for
   that artifact.

### 5.5 Status ledger for this document's topic

| Capability | Tier | Evidence |
|---|---|---|
| JSON extraction from model text | ✅ SHIPPED | `apps/web/src/ai-live.ts:179-198` |
| Schema injected as prompt text | ⚠️ PARTIAL ✅ | `apps/web/src/ai-live.ts:142-144` (advice, not enforced) |
| One self-repair retry (extraction-triggered) | ✅ SHIPPED | `apps/web/src/ai-live.ts:49-67` |
| Manual per-service shape check | ✅ SHIPPED (hand-coded) | `brief/service.ts:109-124`, `creative/service.ts:102-123` |
| JSON-Schema **enforcement** validator | 🔶 BUILT (UNWIRED) | `validation-engine.ts:62-118` |
| Schema-aware repair instruction | 🔶 BUILT (UNWIRED) | `validation-engine.ts:71-73` |
| format → validate → repair loop | 🔶 BUILT (UNWIRED) | `manager.ts:238-252` (runtime not instantiated by `apps/web`) |
| Wiring the validator into the live path | ❌ ROADMAP | this document's build spec |

---

## 6. Value contribution

**Production time ↓.** Schema enforcement with schema-aware repair converts a class of
malformed outputs from *human problems* into *automated re-attempts*. Today a subtly
wrong brief (wrong field type, out-of-range value) either becomes a hard
`UnavailableError` the operator must re-run, or — worse, if it slips past the shallow
hand check — a defective first draft a reviewer must read, reject, and regenerate.
Enforcement moves the correction upstream of the human, so the reviewer's time is spent
on judgment, not on catching machine formatting errors.

**Revenue ↑ via reliability.** The five artifacts are the agency's product. Every draft
that reaches a client-facing reviewer well-formed on the first pass is throughput the
agency can bill; every malformed draft is rework that erodes it. A schema-enforced
pipeline raises the proportion of first-pass-valid outputs, which compounds directly into
more campaigns moved through the approval gates per unit of human effort — the core
reliability promise the platform is sold on.

---

## 7. Cross-references

- Governing reference: [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md)
- Source of truth: [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)
- Known limits: [`../../KNOWN_LIMITATIONS.md`](../../KNOWN_LIMITATIONS.md) ·
  Roadmap: [`../../ROADMAP.md`](../../ROADMAP.md)
- Book A (motivating gap **B-1**, bannedWords/shape enforcement at review time):
  [`../../book-a/BOOK_A_AGENCY_CONSTITUTION.md`](../../book-a/BOOK_A_AGENCY_CONSTITUTION.md)

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
