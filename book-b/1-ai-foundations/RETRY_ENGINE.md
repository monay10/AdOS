# Retry Engine — Self-Repair When Generation Fails

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ⚠️ **PARTIAL.** Exactly **one** self-repair retry ships on
> the live path today (✅ — `apps/web/src/ai-live.ts:49-67`); a fuller schema-driven
> repair-and-failover loop already exists in the codebase but is **unwired** (🔶 —
> `packages/ai-manager/src/runtime/`); schema-driven repair on the live path and
> failover among local engines are **still to build** (🔶/❌). No cloud fallback exists
> or is planned — failover stays **100% local**.

---

## 1. Why a Retry Engine exists

Local models are imperfect narrators. Asked for a strict JSON object, a locally-run
model (Ollama or an OpenAI-compatible server — `apps/web/src/ai-factory.ts:23-57`) will
sometimes wrap its answer in ` ```json ` fences, prepend a sentence of prose, truncate a
field, or emit a value that violates the requested shape. When that happens, the naive
outcome is a hard failure surfaced to the human operator, who must re-run the stage by
hand.

The **Retry Engine** is the AI system's self-repair reflex: instead of failing on the
first malformed reply, it feeds the error back to the model and asks it to correct
itself. Every re-run the machine absorbs is a re-run a human never has to trigger. That
is the whole economic argument for this component, and it is why the Retry Engine sits in
Part 1 (AI Foundations) rather than being treated as an afterthought.

This document draws the line between what self-repair does **today** and the fuller
design that is **coded-but-dormant** or **still to build** — using the tier labels
defined in [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md). It never claims an unbuilt
capability as shipped.

### Tier legend

| Tier | Meaning |
|---|---|
| ✅ **SHIPPED** | Runs in the live app path today; cite the wired code. |
| 🔶 **BUILT (UNWIRED)** | Code exists and is unit-tested, but no running app path instantiates it. |
| ❌ **ROADMAP (ABSENT)** | No implementation; pure design specification. |

---

## 2. Target design — the full self-repair ladder

The target Retry Engine is a **bounded, tiered ladder**. When a generation attempt fails,
the failure is classified, matched to a repair strategy, and retried under a global
attempt budget with backoff. Failure never escalates off the local machine.

```
generate ──► classify failure ──┬─ extract-fail  ──► repair-turn      ──► re-generate
                                 ├─ schema-fail   ──► schema-repair    ──► re-generate
                                 └─ engine-fail   ──► failover (LOCAL) ──► re-generate
                                          │
                                          └──► bounded attempts + backoff ──► give up cleanly
```

### 2.1 Failure classes and their repairs

| Failure class | Symptom | Repair strategy | Target tier |
|---|---|---|---|
| **Extract-fail** | Reply is not a parseable JSON object (prose, fences, truncation) | Append a **repair turn** quoting the parse error; re-generate | ✅ shipped (one retry) |
| **Schema-fail** | JSON parses but violates the requested `responseSchema` | Append a **schema-repair** instruction quoting the exact violation + schema; re-generate | 🔶 built-unwired |
| **Engine-fail** | The engine is unreachable, times out, or its circuit is open | **Failover** to the next healthy **local** engine/model | 🔶 built-unwired |

Each rung is strictly more expensive and more capable than the one above it. A well-formed
JSON object that already satisfies the schema needs **zero** rungs; a fenced-but-valid
reply is recovered by extraction with **zero** re-generation; only genuine failures climb
the ladder. The engine spends effort in proportion to how badly the model missed.

### 2.2 Governing invariants

- **Bounded attempts.** Every ladder runs under a hard attempt ceiling. Self-repair is a
  reflex, not an infinite loop; a model that cannot recover in a small, fixed number of
  tries fails cleanly and predictably.
- **Backoff.** Engine-level retries space themselves out (exponential backoff) so a
  struggling local server is not hammered.
- **Failover stays 100% local.** Failover means "try the next model or engine **on this
  machine**." AdOS calls **no cloud endpoint and passes no API key anywhere**
  (`apps/web/src/ai-factory.ts:10`, `apps/web/src/ai-live.ts:17`,
  `apps/web/src/main.ts:42`). There is no cloud fallback in the design, and adding one
  is explicitly out of scope. See [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) §2.8.
- **Deterministic default is exempt.** The default `OfflineAIManager`
  (`apps/web/src/ai.ts:13`) emits templated JSON deterministically and never malforms, so
  it never needs repair. Self-repair only matters once a genuine local model is in the
  loop (`apps/web/src/ai-live.ts:26`).

---

## 3. Today (✅ SHIPPED) — exactly one self-repair retry

**Tier: ✅ SHIPPED.** The live path implements the **extract-fail** rung of the ladder,
and **only that rung**, with a budget of **one** repair attempt. There is **no model
failover** and **no schema-driven repair** on the live path.

### 3.1 The loop

`LiveAIManager.submit` wraps generation in a two-iteration loop
(`apps/web/src/ai-live.ts:49-67`):

```ts
// First attempt + a single self-repair attempt if the model returns
// something that is not a JSON object matching the request.
for (let attempt = 0; attempt < 2; attempt++) {
  const res = await this.engine.complete({
    model,
    messages: attempt === 0 ? messages : [...messages, ...repairTurn(lastError)],
    ...
  });
  const parsed = extractJson(res.text);
  if (parsed.ok) { output = parsed.value; attempts.push({ model, ok: true }); break; }
  lastError = parsed.error;
  attempts.push({ model, ok: false, error: parsed.error });
}
```

Read precisely:

- `attempt === 0` is the **first, ordinary** generation. `attempt === 1` is the **single
  self-repair** re-generation. The loop condition `attempt < 2` caps the total at **two
  engine calls: one original plus one repair**. There is no third try.
- On the repair iteration the original `messages` are re-sent **with a repair turn
  appended** (`[...messages, ...repairTurn(lastError)]`, `ai-live.ts:52`). The model sees
  its own failing context plus a correction request.
- Success is decided by `extractJson` (`ai-live.ts:179-198`), which strips ` ``` ` /
  ` ```json ` fences, then tries a direct parse, then falls back to the outermost
  `{ ... }` span, and accepts the result only if it is a non-array object.

### 3.2 The repair turn

The correction is a single appended user turn (`apps/web/src/ai-live.ts:165-172`):

```ts
/** The follow-up turn that asks the model to repair non-JSON output. */
function repairTurn(error: string): AIMessage[] {
  return [{
    role: 'user',
    content: `Your previous response was not a valid JSON object (${error}). ` +
             `Reply again with ONLY the JSON object, no prose and no markdown fences.`,
  }];
}
```

The repair turn quotes the **parse** error (e.g. `no JSON object found in reply`) and
restates the format demand. It is a **formatting** correction, not a schema correction: it
knows the reply was not a JSON object, but it carries **no `responseSchema`** and cannot
tell the model *which fields* were wrong or missing.

### 3.3 What happens when both attempts fail

If neither the original nor the repair yields a JSON object, `output` stays `undefined`
and the manager throws (`apps/web/src/ai-live.ts:69-73`):

```ts
throw new Error(`local model did not return a valid JSON object: ${lastError}`);
```

The calling service (brief, creative, campaign, report, or executive) converts that into
its own `UnavailableError`, and the stage surfaces cleanly to the operator — behaviour
that is unchanged from the no-retry baseline, only now with one automatic recovery
attempt in front of it.

### 3.4 Exactly what ships — and what does not

| Aspect | Live-path reality | Cite |
|---|---|---|
| Self-repair retries | **One** (loop `attempt < 2`) | `ai-live.ts:49` |
| Repair mechanism | Append one repair turn on non-JSON | `ai-live.ts:52,165-172` |
| Success test | JSON extraction only | `ai-live.ts:59,179-198` |
| Failure classes handled | **Extract-fail only** | `ai-live.ts:65` |
| Schema-driven repair | ❌ **Not on the live path** | — |
| Model / engine failover | ❌ **Not on the live path** (single `model`) | `ai-live.ts:49-67` |
| Backoff between attempts | ❌ None (immediate re-generate) | `ai-live.ts:49-56` |
| Cloud fallback | ❌ None — and never planned | `ai-factory.ts:10` |

The provenance record still counts every try: each iteration pushes an entry into
`attempts` (`ai-live.ts:62,66`), so the `provenance` on every artifact reflects whether a
repair was needed. This is the honest, minimal form of the target ladder: **one rung,
one retry, formatting only, no failover.**

### 3.5 Worked example — the one retry in motion

Consider a local model asked to produce a marketing brief. The two possible traces make
the shipped budget concrete.

**Trace A — repair succeeds (the common good case).**

| Step | Event | Outcome |
|---|---|---|
| `attempt = 0` | Model replies ` ```json\n{ "audience": ... }\n``` ` | `extractJson` strips fences, parses → **ok**; loop breaks (`ai-live.ts:60-63`) |

Here the fenced reply is recovered by extraction alone — no repair turn is even needed.

**Trace B — repair is required, then succeeds.**

| Step | Event | Outcome |
|---|---|---|
| `attempt = 0` | Model replies `Sure! Here is the brief: ...` (prose, no object) | `extractJson` finds no `{...}` span → **fail**; `lastError` set (`ai-live.ts:65`) |
| `attempt = 1` | `repairTurn(lastError)` appended; model re-generates | Model returns a bare JSON object → **ok**; loop breaks |

**Trace C — repair also fails (clean give-up).**

| Step | Event | Outcome |
|---|---|---|
| `attempt = 0` | Non-JSON reply | fail |
| `attempt = 1` | Repair turn appended; model still emits prose | fail; `output` stays `undefined` |
| — | Loop exits at `attempt < 2` | Throw `local model did not return a valid JSON object` (`ai-live.ts:69-73`) → service `UnavailableError` |

Trace C is the boundary the budget enforces: **the machine tries twice and then stops.**
It does not spiral, and it does not reach for a different model or a network. The operator
gets a clean, predictable failure — the same one they would have gotten with no retry at
all, only now preceded by one free recovery attempt.

---

## 4. Built-unwired (🔶) — the schema-repair instruction

**Tier: 🔶 BUILT (UNWIRED).** The next rung of the ladder — **schema-fail repair** —
already exists in the codebase as tested code, but **no running app path instantiates
it**. Wiring it into the live pipeline is Book B build work.

### 4.1 Schema validation exists

`SchemaValidationEngine` validates output against a request's `responseSchema` — a
JSON-Schema subset covering `type`, `properties`, `required`, `items`, `enum`, and
`min/max`/`minLength` — and returns human-readable errors
(`packages/ai-manager/src/runtime/validation-engine.ts:62-118`). Where the live path only
asks "is this a JSON object?", this engine asks "is this the **right** JSON object?".

### 4.2 A schema-aware repair instruction exists

Paired with it is a corrective instruction that, unlike the shipped `repairTurn`, carries
the **exact violation and the schema itself**
(`packages/ai-manager/src/runtime/validation-engine.ts:71-73`):

```ts
/** Build a corrective instruction the runtime can append on a retry. */
export function repairInstruction(error: string, schema: Record<string, unknown>): string {
  return `Your previous response was invalid: ${error}. ` +
         `Respond ONLY with JSON matching this schema: ${JSON.stringify(schema)}`;
}
```

### 4.3 A fuller repair loop composes them — but is dormant

The unwired AI-manager kernel already composes validation and repair into a bounded loop
that re-generates while quoting each schema violation
(`packages/ai-manager/src/runtime/manager.ts:229-252`): it runs inference, formats the
output, calls `validation.validate(...)`, and on failure appends
`repairInstruction(error, schema)` as the next turn and re-runs — up to a configured
`maxValidationRetries` ceiling, after which it throws a clean `ValidationError`.

Beneath that, the unwired `InferencePipeline` supplies the **engine-fail** rung: it walks
`[primary, ...fallbacks]`, skipping models that do not fit or whose circuit breaker is
open, and per model retries with **exponential backoff**
(`packages/ai-manager/src/runtime/inference-pipeline.ts:94-127,157-175`). Every model in
that list is a **local** engine descriptor; the failover is machine-local by construction.

**Status caveat (do not misread):** none of §4 runs in the app. `apps/web` never
instantiates the AI-manager runtime — it wires `OfflineAIManager` or `LiveAIManager`
directly (`apps/web/src/ai-factory.ts`). These classes are imported only by
`packages/ai-manager` internals and their tests. This is the same two-stack split
described in [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md): a **WIRED** stack that executes
and an **UNWIRED** stack that is built, tested, and dormant.

### 4.4 Shipped vs built-unwired, side by side

| Capability | Live path (✅) | Unwired runtime (🔶) |
|---|---|---|
| Retry on malformed output | ✅ one retry (`ai-live.ts:49`) | ✅ bounded loop (`manager.ts:229`) |
| Repair message | Format-only (`ai-live.ts:165-172`) | Schema-aware (`validation-engine.ts:71-73`) |
| Schema validation | ❌ none | ✅ `validation-engine.ts:62-118` |
| Model/engine failover | ❌ none | ✅ local list (`inference-pipeline.ts:94-127`) |
| Exponential backoff | ❌ none | ✅ `inference-pipeline.ts:175` |
| Circuit breaker | ❌ none | ✅ `inference-pipeline.ts:99-103` |
| Instantiated by `apps/web` | ✅ yes | ❌ no |

---

## 5. To build (🔶/❌) — wiring the full ladder

The gap between §3 and §4 is the Retry Engine's Book B roadmap. Two build items close it,
in order.

### 5.1 Wire schema-driven repair into the live path — 🔶

**Goal.** Upgrade the live self-repair from **extract-fail only** to **extract-fail +
schema-fail**, reusing the code that already exists in §4.

**Shape.**

1. Give the five generation services a `responseSchema` per capability (the artifact
   shapes are already fixed — brief, `CreativeSet`'s six copy fields, campaign draft,
   report, executive; see [`../../book-a/BOOK_A_AGENCY_CONSTITUTION.md`](../../book-a/BOOK_A_AGENCY_CONSTITUTION.md)).
2. After `extractJson` succeeds on the live path, run
   `SchemaValidationEngine.validate(...)`
   (`packages/ai-manager/src/runtime/validation-engine.ts:62-67`).
3. On a schema violation, append `repairInstruction(error, schema)`
   (`validation-engine.ts:71-73`) instead of the format-only `repairTurn`, and re-generate
   within the same bounded budget.

**Constraint.** Keep the attempt ceiling small and explicit — this is a reflex, not a
solver. This item is 🔶 because both halves (validator and repair instruction) already
exist and are tested; the work is wiring, not invention.

**Ordering within a single stage.** Extraction and schema-repair compose as two rungs of
one budget, not two independent budgets: a re-generation triggered by a schema violation
must still pass extraction, and vice versa. The cleanest implementation runs
`extractJson` → `validate` in sequence inside the existing loop, choosing `repairTurn`
(format error) or `repairInstruction` (schema error) as the appended turn depending on
which check failed. The total attempt count stays bounded across *both* rungs so a model
cannot burn the budget bouncing between a parse error and a schema error.

### 5.2 Engine failover among LOCAL engines — 🔶/❌

**Goal.** When the selected local engine is unreachable, times out, or its circuit is
open, fail over to the **next healthy local engine/model** rather than surfacing an
`UnavailableError` immediately.

**Shape.** Adopt the unwired `InferencePipeline` failover walk
(`packages/ai-manager/src/runtime/inference-pipeline.ts:94-127`) — the primary-plus-
fallbacks list, the fit check, the circuit breaker, and the exponential backoff
(`:157-175`) — on the live path, or route the live path through the AI-manager runtime
that already contains it.

**Hard constraint — failover is 100% local.** The fallback list contains **only local
engine descriptors** (Ollama, OpenAI-compatible local servers). There is **no cloud
engine to fall over to**, the `enableCloudInference` flag is loaded but never read
(`packages/config/src/schema.ts:58-59`), and this item must **never** introduce one. A
"failover" that reached a hosted API would violate the product's defining promise —
**100% local, no cloud, no API keys, air-gap capable**
([`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) §6.1). If every local candidate fails,
the correct behaviour is the current one: throw a clean `UnavailableError` and let the
human retry.

### 5.3 Build ledger

| Ladder rung | Today | Target tier | Evidence / dependency |
|---|---|---|---|
| Extract-fail → repair turn → re-generate | ✅ one retry | ✅ | `ai-live.ts:49-67,165-172` |
| Schema-fail → schema-repair → re-generate | ❌ not on live path | 🔶 wire it | `validation-engine.ts:62-73`, `manager.ts:229-252` |
| Engine-fail → failover (LOCAL only) | ❌ not on live path | 🔶/❌ wire/adopt | `inference-pipeline.ts:94-127` |
| Bounded attempts | ✅ (cap = 2 calls) | ✅ | `ai-live.ts:49` |
| Backoff between attempts | ❌ none | 🔶 | `inference-pipeline.ts:175` |
| Cloud fallback | ❌ absent | ❌ **out of scope forever** | `config/schema.ts:58-59` |

This connects to the Book A walkthrough gap **B-2** (learning read-back) only indirectly —
the Retry Engine's own scope is reliability, not learning. Its direct neighbours are the
Prompt Orchestrator (which builds the messages a retry re-sends) and the Validation
Pipeline (which supplies the schema a schema-repair quotes); see
[`AI_CONSTITUTION.md`](AI_CONSTITUTION.md) for how those wire together.

---

## 6. Value contribution

**Production-time ↓ (primary).** Every malformed generation that self-repair rescues is a
manual re-run the operator never performs. Today's single retry already converts a class
of "model returned prose, stage failed" incidents into silent recoveries
(`apps/web/src/ai-live.ts:49-67`); wiring the schema-repair rung (§5.1) extends that from
*format* failures to *shape* failures, absorbing the more common and more frustrating
class of near-miss outputs. Fewer human re-runs per campaign means shorter time from
mission to human-approved first draft — the exact production-time metric AdOS optimizes.

**Revenue ↑ (secondary, via reliability/uptime).** An AI pipeline that visibly recovers
from its own stumbles is one an agency trusts to run more campaigns without babysitting.
Higher effective uptime of the generation path — bounded, local, and predictable — is
what lets the platform carry more mission volume per operator, which is the lever from
reliability to revenue. Because failover stays 100% local, that reliability is bought with
**zero** per-token cost and **zero** cloud dependency, so improved uptime never turns into
a variable bill.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
