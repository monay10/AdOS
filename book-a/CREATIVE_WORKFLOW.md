# A006 — Creative Workflow

> **Owner:** Office of the Chief Product Architect
> **Status:** Official — aligned to PRODUCT_TRUTH.md
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** ../PRODUCT_TRUTH.md
> **Governing charter:** BOOK_A_AGENCY_CONSTITUTION.md (Book A · A001)

---

## 0. Purpose and scope

This document models the AdOS **Creative Workflow** — the path a Mission's copy
travels from a natural-language brief to an approved, versioned creative set —
through eleven named stages:

`Brief → Concept → Headline → Copy → Creative → Variation → Review → Approval →
Revision → Ready → Archive`

It is a **lens** over what the code actually ships. The Creative Studio is a
single AI artifact — the **`CreativeSet`** — assembled by
`domains/creative-studio/src/creative/service.ts` and materialised by
`domains/creative-studio/src/creative/creative-set.ts`. Several stage names below
(`Concept`, `Creative`, `Variation`) are **editorial phases of producing that one
copy set**, not separate engines. Where a stage implies a capability the code does
not have — most importantly **image / visual creative** — it is labelled
**⚠️ Roadmap** and never described as shipped.

### 0.1 The one rule that governs this whole workflow

> **The Creative Studio produces COPY ONLY. It never touches campaigns or ad
> platforms, and it generates NO images.**

This is asserted in source, not marketing:
`domains/creative-studio/src/creative/creative-set.ts` — *"The Creative Studio
produces copy ONLY; it never touches campaigns or ad platforms."*
`domains/creative-studio/src/creative/service.ts` — *"Produces copy ONLY;
campaigns and ad platforms are out of scope."*

Despite the field names `landingPage` and the folder name `creative-studio`, and
despite this document's stage name **"Creative"**, **every output is a string of
copy.** There is no image, video, audio, or layout generation anywhere in the
domain. `AITaskCapability` declares vision/image/speech types, but no engine
implements them (`packages/contracts/.../ai-task.ts`; see PRODUCT_TRUTH.md §4).

### 0.2 The real output: the six-field `CreativeSet`

The `CreativeSet` `content` (`CreativeContent`) is exactly **six outputs**, all
string copy (`domains/creative-studio/src/creative/creative-set.ts`):

| # | Field | Type | Notes |
|---|---|---|---|
| 1 | `headline` | `string` | The primary hook. |
| 2 | `adCopy` | `string` | Body ad copy. |
| 3 | `cta` | `string` | Call-to-action line. |
| 4 | `socialPost` | `string` | Social channel post copy. |
| 5 | `landingPage` | `{ headline, body, cta }` | Landing-page **copy** — no layout, no image. |
| 6 | `email` | `{ subject, body }` | Email **copy** — subject + body. |

The AI Manager enforces these six via the `CREATIVE_SCHEMA` JSON schema, and the
service re-validates every field in `validateContent()`
(`domains/creative-studio/src/creative/service.ts`). A malformed set is rejected
with `UnavailableError` — it is never saved.

### 0.3 Provenance is mandatory

Every AI artifact carries `provenance{ taskId, capability, model, engine,
latencyMs }` (`AIProvenance` in
`domains/creative-studio/src/creative/creative-set.ts`). The service copies these
straight from the `AITaskResult` returned by the AI Manager. This makes every
creative set **reproducible and auditable** — you can always answer "which model,
which engine, how long" for any line of copy.

**Default AI is deterministic.** The web app's default is the `OfflineAIManager`
(`apps/web/src/ai.ts`), which returns well-formed, schema-valid copy from the task
variables with `model: 'offline-deterministic'` — **no model server, no network.**
Genuine generative prose requires wiring a **local** engine (Ollama or an
OpenAI-compatible local server — vLLM / LM Studio / llama.cpp / SGLang) via the
real `@ados/ai-manager`. There is **no cloud path and no API key** anywhere
(PRODUCT_TRUTH.md §1.5, §6.1).

### 0.4 How the eleven stages map to real mechanisms

| Workflow stage | Real mechanism | Status |
|---|---|---|
| Brief | `MarketingBrief` handed to Creative Studio as a `CreativeContext` DTO | Implemented |
| Concept | Internal framing of the `CreativeContext` (objective / positioning / key messages) before generation | Implemented (editorial) |
| Headline | `content.headline` (+ `landingPage.headline`) field of the set | Implemented |
| Copy | `content.adCopy`, `cta`, `socialPost`, `landingPage.body`, `email` fields | Implemented |
| Creative | Generating the whole six-field copy set via `CreativeStudioService.generate()` | Implemented (copy only) |
| Creative — visual/image | Image / layout / video generation | ⚠️ Roadmap (no image AI) |
| Variation | Re-running `generate()` to produce a fresh set / candidate | Implemented via re-generation |
| Review | `creative_assets` Mission gate + generic `Approval` `in_review` | Implemented |
| Approval | `Approval` → `approved`; Mission gate approved; set becomes canonical | Implemented |
| Revision | `Approval` → `revision_requested` → re-generate | Implemented |
| Ready | An `approved` `CreativeSet` feeding the campaign draft | Implemented |
| Archive | Superseded via `Asset` versioning (append-only) / Project `archive()` | Implemented |

---

## 1. Actors, systems, and states referenced

**Owners referenced below**

- **Creative Lead / Account owner** — the human who requests, reviews, and approves.
- **Creative Studio (AI)** — `CreativeStudioService` + AI Manager, copy only.
- **Mission engine** — `domains/agency-os/src/mission/mission.ts`, drives gates.
- **Approval engine** — `domains/agency-os/src/approval/approval.ts`, generic review.
- **Asset library** — `domains/agency-os/src/asset/asset.ts`, versioned storage.

**Two independent review mechanisms** (both real; do not conflate)

1. **Mission approval gate** `creative_assets` — the pipeline calls
   `requestApproval('creative_assets')` and `gateApprove(..., 'creative_assets')`
   in `apps/web/src/routes.ts` (Phase 3). Per the charter, the gate **string is
   informational**: every gate maps to the same `mission.approve()` transition;
   the gate array is advisory metadata. There is **no tiered T0–T4 authority.**
2. **Generic `Approval` aggregate** — `draft → in_review → approved | rejected |
   revision_requested`, with an **append-only** `timeline[]`
   (`domains/agency-os/src/approval/approval.ts`). Used to model
   Creative / Brand / Client sign-off as **labels over one mechanism** (distinct
   Legal/Brand approval *types* are Roadmap — see A007).

**Approval status vocabulary** (`ApprovalStatus`): `draft`, `in_review`,
`approved`, `rejected`, `revision_requested`. A `revision_requested` request goes
back to `in_review` when resubmitted (`approval.ts`).

---

## 2. Workflow sequence and hand-offs

The eleven stages resolve to a compact real sequence: one AI generation, a human
gate, and append-only history. Stages 1–2 prepare inputs, 3–5 are one generation,
6 loops on demand, 7–9 are review, and 10–11 close out.

```
 [1] Brief ─────► [2] Concept ─────► [3] Headline ┐
 (MarketingBrief   (frame the        [4] Copy       ├─► [5] Creative
  → CreativeContext) variables)      (six fields)   │   (generate() → CreativeSet
                                                     ┘    + provenance + event)
                                                              │
                              ┌───────────────────────────────┘
                              ▼
 [6] Variation ◄──── re-generate ──── [7] Review ──► [8] Approval ──► [10] Ready
 (new CreativeSet,                    (creative_assets  (approved →     (feeds
  append-only)                         gate / Approval   canonical)      CampaignDraft,
       ▲                               in_review)            │            still draft)
       │                                   │                 │                │
       └──── [9] Revision ◄────────────────┘                 ▼                ▼
             (revision_requested → note → re-generate)   [11] Archive (Asset versioning
                                                          / Project archive, append-only)
```

**Hand-off contracts**

| From → To | What passes | Mechanism |
|---|---|---|
| Brief → Concept | Approved brief content | `CreativeContext` DTO |
| Concept → Creative | Framed variables | `ai.submit({ variables, responseSchema })` |
| Creative → Review | A valid `CreativeSet` + event | `CreativeGenerated` + `repo.save()` |
| Review → Revision | Change request + note | `Approval.requestRevision()` |
| Approval → Ready | Canonical set id | `CampaignDraft.creativeSetId` |
| Ready → Archive | Superseded copy | `Asset` append-only `versions[]` |

---

## 3. The eleven stages

Each stage lists **Owner**, **AI**, **Human review**, **Checklist**, and
**Acceptance criteria**. Roadmap items are labelled inline.

### Stage 1 — Brief

The Marketing Brief (approved at the `strategy_and_budget` gate) is handed to the
Creative Studio as a plain `CreativeContext` DTO. This context is the sole input
to generation; the Creative Studio never imports the brief aggregate directly
(`domains/creative-studio/src/creative/creative-set.ts` — `CreativeContext`).

| Aspect | Detail |
|---|---|
| **Owner** | Creative Lead (receives the brief); Mission engine (state) |
| **AI** | None at this stage — the brief is already generated by `marketing-intelligence`; Creative Studio only *consumes* it |
| **Human review** | Confirm the brief was approved at gate `strategy_and_budget`; confirm objective/audience/positioning are usable |
| **Checklist** | `context.objective` present · `context.targetAudience` present · `context.positioning` present · `context.keyMessages[]` non-empty · `context.brandVoice` set · `context.productName` set · `briefId` linked |
| **Acceptance criteria** | A `CreativeContext` can be assembled with all required fields; the parent Mission is in `planning` (post-`strategy_and_budget` approval); `missionId`, `clientId`, `briefId`, `tenantId` all resolve |

**Roadmap:** enforcing `brand.rules.bannedWords[]` against the brief inputs.
`bannedWords` is stored on the Brand but **not enforced** against generated copy
anywhere (`domains/agency-os/src/brand/brand.ts`).

### Stage 2 — Concept

"Concept" is the **editorial framing** of the `CreativeContext` before the model
runs: which positioning line leads, which key messages dominate, what the brand
voice implies. In code this is not a separate aggregate — it is the shape of the
`variables` object the service sends to the AI Manager
(`domains/creative-studio/src/creative/service.ts`: `productName`, `brandVoice`,
`objective`, `targetAudience`, `positioning`, `keyMessages`).

| Aspect | Detail |
|---|---|
| **Owner** | Creative Lead |
| **AI** | Indirect — the framed variables become the prompt (`promptRef { key: 'creative.set', version: 1 }`) |
| **Human review** | Sanity-check the framing before spending a generation: does the concept honour the brand voice and objective? |
| **Checklist** | Positioning angle chosen · Key messages prioritised · Brand voice restated · `promptRef` version confirmed (`creative.set` v1) · Output language decided (TR/EN) |
| **Acceptance criteria** | The `variables` payload is complete and maps 1:1 to `CreativeContext`; no field is empty; the concept implies all six outputs are producible from it |

**Roadmap:** multiple named concept **territories** / mood directions as first-class
objects. Not modelled — there is one generation path per call.

### Stage 3 — Headline

The headline is a **real field** of the set. Generation produces
`content.headline` (the primary hook) and `content.landingPage.headline` (the
landing-page hook). Both are validated as `string` by `validateContent()` and
required by `CREATIVE_SCHEMA` (`domains/creative-studio/src/creative/service.ts`).

| Aspect | Detail |
|---|---|
| **Owner** | Creative Lead |
| **AI** | Creative Studio generates `content.headline` and `content.landingPage.headline` |
| **Human review** | Read both headlines against objective + brand voice; check length/tone; check for banned words **manually** (not enforced by code) |
| **Checklist** | `content.headline` is a non-empty `string` · `content.landingPage.headline` is a non-empty `string` · Tone matches `context.brandVoice` · Reflects `context.objective` · No banned words (manual check) |
| **Acceptance criteria** | Both headline fields pass `validateContent()`; the `CreativeGenerated` event carries the `headline` in its payload; provenance is attached |

### Stage 4 — Copy

The remaining body copy: `content.adCopy`, `content.cta`, `content.socialPost`,
`content.landingPage.body`, `content.landingPage.cta`, and
`content.email{ subject, body }`. All strings; all schema-required and
re-validated in `validateContent()`.

| Aspect | Detail |
|---|---|
| **Owner** | Creative Lead |
| **AI** | Creative Studio generates all body copy fields in the same `generate()` call |
| **Human review** | Read every field for accuracy, tone, claims; verify `cta` is actionable; verify `email.subject` is present |
| **Checklist** | `adCopy` non-empty · `cta` non-empty · `socialPost` non-empty · `landingPage.body` non-empty · `landingPage.cta` non-empty · `email.subject` non-empty · `email.body` non-empty |
| **Acceptance criteria** | All six outputs (incl. nested `landingPage` and `email`) pass `validateContent()`; a malformed set is rejected with `UnavailableError` and never saved |

**Note:** there is **no image, no visual asset, and no layout** — `landingPage` is
copy only (`{ headline, body, cta }`), not a page build.

### Stage 5 — Creative

"Creative" is the **act of generating the whole six-field set** —
`CreativeStudioService.generate(context)`. It submits a single `chat` task to the
AI Manager (never a model directly), validates the result, constructs the
`CreativeSet` via `CreativeSet.generate()`, saves it through the repository,
publishes the `CreativeGenerated` event, and records telemetry
(`domains/creative-studio/src/creative/service.ts`).

| Aspect | Detail |
|---|---|
| **Owner** | Creative Studio (AI); Creative Lead triggers it (Phase 3 route) |
| **AI** | Full six-field generation via `ai.submit<CreativeContent>({ capability: 'chat', ... responseSchema: CREATIVE_SCHEMA })` |
| **Human review** | Confirm a set was produced and persisted; confirm provenance is attached before reviewing content |
| **Checklist** | Task `capability` = `chat` · `responseSchema` = `CREATIVE_SCHEMA` · Six outputs returned · `provenance{taskId,capability,model,engine,latencyMs}` populated · Repository `save()` succeeded · `CreativeGenerated` event published |
| **Acceptance criteria** | A `CreativeSet` aggregate exists with all six outputs, full provenance, linked `missionId`/`briefId`/`clientId`/`tenantId`; on AI failure the service returns `UnavailableError` and **no** set is saved |

**⚠️ Roadmap — visual creative:** image, video, layout, or thumbnail generation.
The `creative-studio` domain has **no image engine**; the naming ("creative",
"landingPage") is copy, not pixels. Image AI is declared in contracts but
unimplemented (PRODUCT_TRUTH.md §4).

### Stage 6 — Variation

A "variation" is a **fresh generation** — calling `generate()` again to produce
another candidate `CreativeSet`. Because the default AI is deterministic
(`OfflineAIManager`), variation with meaningfully different prose requires a
**local generative engine**; deterministic mode reproduces the same output for the
same variables. Sets are **never overwritten** — each generation is a new
aggregate; the repository can `list(missionId)` all of them.

| Aspect | Detail |
|---|---|
| **Owner** | Creative Lead (chooses to re-generate) |
| **AI** | Re-runs `generate()`; a local engine yields genuinely different prose, the offline default is reproducible |
| **Human review** | Compare candidate sets side by side; select a leading candidate for review |
| **Checklist** | Prior set retained (not overwritten) · New set passes `validateContent()` · Each candidate carries its own provenance · Candidates enumerable via `creative.list(missionId)` |
| **Acceptance criteria** | Multiple valid `CreativeSet`s can coexist for one Mission; each is independently valid and provenance-stamped; a leading candidate is selectable for Review |

**⚠️ Roadmap:** A/B **experiment tracking**, variant scoring, or automatic
winner selection. No variant-labelling or experiment field exists in the model.

### Stage 7 — Review

Review is where a candidate set is put in front of a human. Two real mechanisms
apply: the Mission **`creative_assets` gate** (Phase 3 in `apps/web/src/routes.ts`
calls `requestApproval('creative_assets')`, moving the Mission to
`awaiting_approval`) and the generic **`Approval`** aggregate, which enters
`in_review` when submitted (`domains/agency-os/src/approval/approval.ts`).

| Aspect | Detail |
|---|---|
| **Owner** | Creative Lead / Account owner (reviewer) |
| **AI** | None — review is human. AI provenance is *surfaced* to the reviewer, not acted on |
| **Human review** | Read all six outputs; check against brief objective, brand voice, and banned words (manual); decide approve / reject / request revision |
| **Checklist** | Mission at `awaiting_approval` for `creative_assets` (or `Approval` in `in_review`) · All six fields read · Provenance visible (`model`, `engine`) · Brand voice honoured · No banned words (manual) · Claims accurate |
| **Acceptance criteria** | A decision is recorded — either the Mission gate is approved/rejected (`gateApprove` / `gateReject`) or the `Approval` transitions out of `in_review`; the `Approval` `timeline[]` gains an append-only entry |

**Roadmap:** distinct **Legal / Brand / Client** review *types*. Today these are
**categories/labels** over the one `Approval` mechanism; there is no separate
legal or brand approval engine (A007).

### Stage 8 — Approval

Approval finalises the set as canonical. On the generic `Approval`, `approve()` is
valid only from `in_review` and transitions to `approved`
(`domains/agency-os/src/approval/approval.ts`). On the Mission, `gateApprove(...,
'creative_assets')` maps to `mission.approve()`, returning the Mission to
`planning` — it does **not** jump the pipeline forward; the next phase's generator
(campaign) advances it.

| Aspect | Detail |
|---|---|
| **Owner** | Account owner / approver |
| **AI** | None |
| **Human review** | Final confirmation that the chosen set is the one to carry forward to the campaign draft |
| **Checklist** | `Approval` in `in_review` before `approve()` · Gate `creative_assets` requested before `gateApprove` · Approver identity recorded in `timeline[]` (`actor`) · Mission returns to `planning` after gate approval |
| **Acceptance criteria** | `Approval.status` = `approved` **or** the `creative_assets` gate is approved; the `Approval` `timeline[]` has an appended `approved` action; the selected `CreativeSet` is the input for the CampaignDraft (`creativeSetId`) |

**Honest note:** the gate string carries **no tiered authority**. Every gate maps
to the same `mission.approve()` transition; `creative_assets` is not even in the
Mission's *default* `approvalGates` array yet the pipeline always runs it — the
array is advisory (charter §1.4). Do not represent gates as authority tiers.

### Stage 9 — Revision

Revision is the explicit `revision_requested` path. `requestRevision()` is valid
only from `in_review` and moves the `Approval` to `revision_requested`; a
`revision_requested` request returns to `in_review` when resubmitted
(`domains/agency-os/src/approval/approval.ts`). The corrective action is to
**re-generate** the set (Stage 6 Variation) with adjusted concept inputs. On the
Mission side, `gateReject` records a rejection.

| Aspect | Detail |
|---|---|
| **Owner** | Reviewer requests; Creative Lead + Creative Studio act |
| **AI** | Re-generation via `generate()` after concept inputs are adjusted |
| **Human review** | Capture the revision `note`; confirm the requested changes are addressed in the new set |
| **Checklist** | `Approval` transitioned to `revision_requested` from `in_review` · Revision `note` recorded in `timeline[]` · New `CreativeSet` generated · Prior set retained (append-only history) · Resubmission returns `Approval` to `in_review` |
| **Acceptance criteria** | The revision is captured in the append-only `timeline[]`; a corrected `CreativeSet` exists and re-enters Review; no content was overwritten |

**⚠️ Roadmap:** **escalation** logic (auto-routing a stalled revision to a higher
authority). No escalation exists (A007). `revision_requested` is a status, not a
workflow router.

### Stage 10 — Ready

"Ready" is an **`approved` `CreativeSet` that feeds the campaign draft.** There is
no separate "ready" status flag on the `CreativeSet` (it has no status enum);
readiness is expressed by (a) an `approved` `Approval` / approved `creative_assets`
gate and (b) the set being referenced as `creativeSetId` by a `CampaignDraft`
(`domains/campaign-engine/.../campaign-draft.ts`).

| Aspect | Detail |
|---|---|
| **Owner** | Account owner |
| **AI** | Downstream only — the campaign engine consumes the approved copy (still no live launch) |
| **Human review** | Confirm the approved set is the one linked to the campaign draft; confirm nothing further is pending |
| **Checklist** | Set approved (Stage 8) · Provenance intact · Six outputs complete · Referenced by a `CampaignDraft.creativeSetId` · Mission progressing toward `campaign_launch` gate |
| **Acceptance criteria** | The approved `CreativeSet` is the sole creative input to the `CampaignDraft`; the draft assembles ad sets from this copy; **the campaign remains a `draft` — it is never launched** (charter §1.2; PRODUCT_TRUTH.md §2.4) |

### Stage 11 — Archive

Archive covers superseded copy and closed work. Two real mechanisms:

1. **`Asset` versioning** — a `CreativeSet` chosen for the manual library is stored
   as an `Asset` of `kind: 'copy'`, whose `versions[{version,content,note,by,at}]`
   is **append-only: content is never overwritten; a new version is appended**
   (`domains/agency-os/src/asset/asset.ts`). Superseding copy adds a version; it
   never destroys the prior one.
2. **Project archive** — `Project.archive()` moves a project to `archived`,
   reachable **only** via `archive()` (not `changeStatus()`)
   (`domains/agency-os/src/project/project.ts`).

| Aspect | Detail |
|---|---|
| **Owner** | Account owner / librarian |
| **AI** | None |
| **Human review** | Confirm the canonical version, add an archival `note`, confirm the project close-out is intended |
| **Checklist** | Superseding copy appended as a **new** `Asset` version (not overwrite) · Version `note` + `by` + `at` recorded · Tags lowercased/deduped · Project `archive()` used for close-out (not `changeStatus`) |
| **Acceptance criteria** | Historical copy is preserved (append-only `versions[]`); the latest version is retrievable; an archived project cannot be mutated back through `changeStatus()` |

**⚠️ Roadmap:** an **immutable / tamper-evident** archive store. The `Asset`
version list and `Approval` timeline are genuine append-only **in-memory** lists,
but that is **not** a cryptographically immutable audit trail (PRODUCT_TRUTH.md
§2.7; charter §2). Durable storage is opt-in (SQLite/Postgres), in-memory by
default.

---

## 4. Provenance and determinism across every stage

| Concern | Reality | Evidence |
|---|---|---|
| Provenance fields | `taskId`, `capability`, `model`, `engine`, `latencyMs` on every set | `creative-set.ts` (`AIProvenance`) |
| Where set | Copied from `AITaskResult` in `generate()` | `service.ts` |
| Default engine | `OfflineAIManager`, `model: 'offline-deterministic'`, no network | `apps/web/src/ai.ts` |
| Genuine prose | Requires a **local** engine (Ollama / OpenAI-compatible local server) | PRODUCT_TRUTH.md §1.5 |
| Cloud AI | None — no endpoint, no API key | PRODUCT_TRUTH.md §2.8 |
| Schema guard | `CREATIVE_SCHEMA` at the AI Manager + `validateContent()` in service | `service.ts` |
| Failure mode | `UnavailableError`; malformed set never saved | `service.ts` |

---

## 5. Implemented vs Roadmap (summary)

**Implemented (shipped, tested)**

- Six-field `CreativeSet` generation, copy only, schema-guarded, provenance-stamped
  (`domains/creative-studio/src/creative/{creative-set,service}.ts`).
- Re-generation to produce candidate variations; multiple sets per Mission.
- `creative_assets` Mission gate (Phase 3) + generic `Approval`
  (`draft → in_review → approved | rejected | revision_requested`) with append-only
  `timeline[]`.
- `Asset` append-only versioning; `Project.archive()`.
- Deterministic offline default AI; local generative engines optional.

**⚠️ Roadmap (not shipped; do not represent as present-tense)**

- Image / video / layout / visual creative generation (no image AI).
- Distinct Legal / Brand / Client approval **types** (today: labels over one
  `Approval`).
- Escalation logic; tiered T0–T4 approval authority.
- `bannedWords` enforcement against generated copy (stored, not enforced).
- A/B experiment tracking / automatic winner selection.
- Immutable / tamper-evident audit archive; durable-by-default storage.

---

## 6. Value contribution

**Serves: production-time ↓ (primary), revenue ↑ (secondary).**

- **Production-time ↓ (biggest win).** AI **first-draft copy** collapses the
  slowest part of the creative sprint: a single `generate()` call produces all six
  outputs (`headline`, `adCopy`, `cta`, `socialPost`, `landingPage`, `email`)
  schema-valid in one pass, so the human starts from an edit, not a blank page.
- **Production-time ↓ (fewer loops).** **Codified acceptance criteria** — the
  per-stage checklists above, `CREATIVE_SCHEMA`, and `validateContent()` — reject
  malformed sets before review and give reviewers an explicit pass/fail bar,
  cutting the number of `revision_requested` round-trips.
- **Revenue ↑ (indirectly).** Faster, on-brand, provenance-traceable copy lets the
  agency turn more Missions per period and feed campaign drafts sooner. AdOS
  **drafts** the copy; it does **not** launch ads, so revenue impact is via agency
  throughput, not media buying.

Both effects satisfy the AdOS value rule: every capability here reduces the
agency's production time and, through throughput, supports revenue.

---

*Documentation only. No application code, packages, domains, or tests were
modified. Aligned to PRODUCT_TRUTH.md.*
