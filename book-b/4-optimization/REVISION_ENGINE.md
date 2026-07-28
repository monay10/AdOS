# Revision Engine — Non-Destructive, AI-Assisted Creative Revision

**Owner:** Office of the Chief AI Architect
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** ../../PRODUCT_TRUTH.md
**Governing reference:** ../1-ai-foundations/AI_CONSTITUTION.md

> **Implementation status:** ✅ **SHIPPED (Series 2 · 2026-07-28)** for *human, non-destructive* mission-gate revision — **Book A gap B-3 is CLOSED.** Rejecting a brief/creative/campaign at its gate now calls `Mission.requestRevision(gate, reason)` (`domains/agency-os/src/mission/mission.ts:225`, via `apps/web/src/routes.ts:893`): the mission returns to `planning`, the rejection is appended to its `revisionHistory` (never lost), a `mission.revision.requested.v1` event fires, and the rejected draft is discarded so the stage regenerates under the **same** mission. The mission gate's old destructive `fail()` is reserved for customer *cancellation* only. Still ❌ **ROADMAP:** *AI-driven* revision — auto re-generation/rewrite from the reviewer's feedback (the loop is human-driven; the operator clicks "Generate" again). This aligns the mission gate with Book F Law 5 (see [`../../book-f/1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md`](../../book-f/1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md)).

---

## 0. Why a Revision Engine

A first draft is rarely the final draft. In an agency, the normal shape of work is:
produce a draft, put it in front of a reviewer, receive targeted feedback ("tighten
the headline," "drop the banned word," "make the CTA punchier"), and turn that feedback
into a **second draft** without discarding the first. AdOS today generates the five
campaign artifacts — brief → creative → campaign → report → executive (see
../2-creative-factory/COPY_GENERATOR.md) — as **single-shot** outputs. There is no
mechanism to *revise* an artifact from reviewer feedback: the AI produces once and
stops.

Two revision behaviors exist in the codebase, and **they disagree**. This is the exact
tension Book A flagged as **gap B-3** (../../book-a/BOOK_A_WALKTHROUGH.md):

1. The generic **Approval aggregate** has a graceful, non-destructive revision loop:
   `revision_requested → in_review → approved`. Nothing is destroyed; the request
   simply cycles back for another pass
   (`domains/agency-os/src/approval/approval.ts`).
2. A **Mission gate REJECT** is destructive: it calls `mission.fail()`, which
   terminates the mission with `status: 'failed'` and no documented path back
   (`domains/agency-os/src/mission/mission.ts:209-216`,
   `apps/web/src/routes.ts:744-754`, `:885-889`).

The result: a single reviewer tweak at a mission gate can **end the entire mission**,
while the very same reviewer, acting on a standalone Approval, gets an orderly revision
cycle. This document designs the target Revision Engine that (a) adds AI-assisted
regeneration of *targeted fields* from reviewer feedback, (b) preserves every prior
draft as an append-only **Asset version**, and (c) reconciles the two approval models
so a mission is **never lost to a tweak**.

---

## 1. Target design

### 1.1 The revision loop (target)

```
              reviewer feedback (free text + targeted fields)
                              │
   ┌──────────────┐   revise  ▼   ┌───────────────────────┐
   │  in_review   │ ───────────▶  │  revision_in_progress │
   └──────────────┘               └───────────┬───────────┘
          ▲                                    │  AI-assisted regeneration
          │ resubmit (new Asset version)       │  (targeted fields only)
          │                                    ▼
   ┌──────┴───────────────┐         ┌────────────────────────┐
   │  revision_requested  │ ◀────── │  new draft = Asset vN+1 │
   └──────────────────────┘         └────────────────────────┘
                              (prior versions preserved, never overwritten)
```

Every revision produces a **new draft** while the previous draft is retained. No
transition in this loop is destructive. A mission gate rejection routes into the **same**
loop rather than into `mission.fail()`.

### 1.2 Design principles

| Principle | Statement |
|---|---|
| **Non-destructive** | A revision NEVER overwrites or discards a prior draft. Each becomes an immutable `AssetVersion` in an append-only history (`domains/agency-os/src/asset/asset.ts:59-60`, `:157-163`). |
| **Targeted** | The reviewer names the fields to change (e.g. `headline`, `cta`); regeneration touches only those, leaving approved fields untouched. |
| **Grounded** | Regeneration is conditioned on the reviewer's feedback **plus** brand voice/rules/banned words and campaign memory — the same context the Context Engine assembles (../1-ai-foundations/CONTEXT_ENGINE.md). |
| **Reversible** | Because prior versions are preserved, a reviewer can roll back to any earlier draft; nothing is lost. |
| **Never terminal on a tweak** | A gate REJECT that is really "please revise" must route to the revision loop, not to `mission.fail()`. `fail()` is reserved for genuine termination (executive kill, customer cancellation). |

### 1.3 Target component map

| Component | Responsibility | Tier |
|---|---|---|
| `Approval.requestRevision` | Move `in_review → revision_requested`, record feedback on the timeline | ✅ SHIPPED (`approval.ts:182-185`) |
| `Approval.submit` (resubmit) | Move `revision_requested → in_review` after a new draft | ✅ SHIPPED (`approval.ts:165-170`) |
| `Asset.addVersion` | Append the revised draft as version N+1, prior versions kept | ✅ SHIPPED (`asset.ts:157-163`) |
| **Revision Orchestrator** | Read feedback + targeted fields, assemble a revision prompt, call `ai.submit`, write result as a new Asset version | ❌ ROADMAP |
| **Field-diff selector** | Regenerate only reviewer-named fields; carry approved fields forward verbatim | ❌ ROADMAP |
| **Gate reconciliation** | Route a gate REJECT-for-revision into the Approval revision loop instead of `mission.fail()` | ❌ ROADMAP |

---

## 2. Today — what the code actually does

### 2.1 ✅ SHIPPED — human revision via the Approval aggregate

The Approval aggregate is a first-class review workflow with an explicit,
non-destructive revision path. Its lifecycle is
(`domains/agency-os/src/approval/approval.ts:20-25`):

```
draft → in_review → approved | rejected | revision_requested
        (revision_requested → in_review when resubmitted)
```

`requestRevision` is a guarded transition that only fires from `in_review` and moves
the request to `revision_requested` while appending a timeline entry — **it does not
destroy anything** (`approval.ts:182-185`):

```ts
requestRevision(input: TransitionInput): Result<void, ValidationError> {
  if (this.props.status !== 'in_review') return err(this.invalid('request revision on'));
  return this.transition('revision_requested', 'revision_requested', input);
}
```

Resubmission is symmetric: `submit` accepts both `draft` **and** `revision_requested`
as valid source states, so a revised request cycles cleanly back into review
(`approval.ts:165-170`). Every transition appends to an **append-only timeline**
(`approval.ts:31-38`, `:192-193`) and emits a domain event
(`ApprovalRevisionRequested`, `approval.ts:63-65`), giving each decision an auditable
record.

This loop is **wired into the live app**. The route handler exposes it at
`apps/web/src/routes.ts:481`:

```ts
if (action === 'revise' && method === 'POST')
  return mutateApproval(app, session, res, id, (aid) => app.approvals.requestRevision(aid, input));
```

alongside `submit`, `approve`, and `reject` (`routes.ts:478-481`). The reviewer's note
is captured and passed through as `input.note` (`routes.ts:476`). This is the ✅
**human** revision capability referenced in ../../book-a/APPROVAL_ENGINE.md — it is
real, tested, and non-destructive.

| Fact | Tier | Evidence |
|---|---|---|
| `revision_requested` state exists | ✅ SHIPPED | `approval.ts:25` |
| `requestRevision` transition (from `in_review`) | ✅ SHIPPED | `approval.ts:182-185` |
| Resubmit `revision_requested → in_review` | ✅ SHIPPED | `approval.ts:165-170` |
| Append-only auditable timeline | ✅ SHIPPED | `approval.ts:31-38`, `:192-193` |
| Revision event emitted | ✅ SHIPPED | `approval.ts:63-65` |
| Wired into the live route | ✅ SHIPPED | `routes.ts:481` |

### 2.2 ✅ SHIPPED — append-only Asset versioning (the non-destructive substrate)

The Asset aggregate already gives us the storage primitive a non-destructive revision
loop needs. Its own doc-comment states the contract
(`domains/agency-os/src/asset/asset.ts:59-60`):

> *"…its append-only version history: content is never overwritten, a new version is
> added instead."*

`addVersion` appends a new immutable `AssetVersion` and keeps every prior one
(`asset.ts:157-163`):

```ts
addVersion(input: { content: string; note?: string; by: string; at: string }): Result<void, ValidationError> {
  const version = this.props.versions.length + 1;
  const entry: AssetVersion = { version, content: input.content.trim(), note: input.note?.trim() ?? '', by: input.by, at: input.at };
  this.props = { ...this.props, versions: [...this.props.versions, entry] };
  this.addDomainEvent(new AssetVersionAdded(this.id.toString(), { version }, { tenantId: this.props.tenantId }));
```

`currentVersion` is simply the highest version number and previews the latest content
(`asset.ts:141-145`). Each `AssetVersion` is "one immutable version of an asset's
content" (`asset.ts:25-27`). **This is exactly the substrate a non-destructive revision
loop requires** — but note the gap: nothing in the generation pipeline writes revised
drafts here today (see §2.4).

| Fact | Tier | Evidence |
|---|---|---|
| Immutable per-version content | ✅ SHIPPED | `asset.ts:25-27` |
| `addVersion` appends, never overwrites | ✅ SHIPPED | `asset.ts:59-60`, `:157-163` |
| `currentVersion` = latest | ✅ SHIPPED | `asset.ts:141-145` |
| `AssetVersionAdded` event | ✅ SHIPPED | `asset.ts:49-50`, `:163` |

### 2.3 ❌ The destructive `fail()` problem at mission gates (gap B-3)

The mission pipeline does **not** use the Approval aggregate's revision loop. When a
reviewer rejects at a mission gate — `strategy_and_budget`, creative, or campaign — the
route calls `gateReject`, which invokes `mission.fail()`
(`apps/web/src/routes.ts:744`, `:749`, `:754`, `:885-889`):

```ts
async function gateReject(app: App, session: Session, res: Res, id: string, reason: string): Promise<void> {
  const r = await app.missions.fail(MissionId.of(id), reason);
  ...
}
```

And `mission.fail()` is **terminal** (`domains/agency-os/src/mission/mission.ts:209-216`):

```ts
fail(reason: string): Result<void, ValidationError> {
  if (this.props.status === 'completed' || this.props.status === 'failed') {
    return this.invalidTransition('fail');
  }
  this.props = { ...this.props, status: 'failed', failureReason: reason };
  this.addDomainEvent(new MissionFailed(this.id.toString(), { reason }, ...));
```

Once a mission is `failed`, there is **no documented transition back**. The mission
detail view even maps `failed → 'rejected'` for display (`routes.ts:874`). So:

- **Standalone Approval** → reject/revise is a graceful, recoverable loop (§2.1).
- **Mission gate** → reject is a one-way termination (§2.3).

The two disagree. A reviewer who only wants "please tighten the headline" at the
creative gate has **no non-destructive option** — the only reject verb wired to the
gate is `mission.fail()`. A single tweak can terminate the whole mission. This is
**Book A gap B-3** (../../book-a/BOOK_A_WALKTHROUGH.md,
../../book-a/CREATIVE_WORKFLOW.md), and it is the central problem this document exists
to solve.

### 2.4 ❌ ROADMAP — there is no AI revision path at all

Independent of *which* approval model runs, **no AI re-generation or rewrite path
exists** anywhere in the codebase. The five generators each run **once** and stop; the
creative generator emits all six copy fields in a single `creative.set` task and never
revisits them (`domains/creative-studio/.../creative/service.ts:42-55`, see
../2-creative-factory/COPY_GENERATOR.md). There is:

- No prompt that takes "reviewer feedback" as an input variable.
- No component that regenerates a *targeted subset* of fields.
- No writer that emits a revised draft into `Asset.addVersion`.

So the AI **cannot** turn feedback into a new draft today. Human revision is real; AI
revision is roadmap.

| Fact | Tier | Evidence |
|---|---|---|
| Gate REJECT is destructive (`mission.fail()`) | ❌ problem | `mission.ts:209-216`, `routes.ts:744-754`, `:885-889` |
| No documented path out of `failed` | ❌ problem | `mission.ts:209-216` |
| No AI re-generation / rewrite | ❌ ROADMAP | grep: no revision task; `creative/service.ts:42-55` single-shot |
| No targeted field regeneration | ❌ ROADMAP | no field-diff code |
| Revised drafts not written to Asset versions | ❌ ROADMAP | generators never call `asset.addVersion` |

---

## 3. To build

Three build streams, from lowest to highest risk. Streams A and B reuse code that
already exists (✅ substrate); Stream C is a clean design spec (❌).

### 3.1 Stream A — reconcile the mission gate with the Approval revision loop

**Goal:** a gate reviewer who wants changes should get `revision_requested`, not
`mission.fail()`. Reserve `fail()` for true termination.

Introduce a **`requestGateRevision`** verb on the mission gate path that:

1. Does **not** call `mission.fail()`.
2. Moves the mission into a non-terminal `revision_requested` posture for that gate
   (mirroring `Approval.requestRevision`, `approval.ts:182-185`).
3. Records the reviewer feedback on the mission timeline and emits a
   `mission.revision_requested` event (new, modeled on `ApprovalRevisionRequested`,
   `approval.ts:63-65`).

The existing hard `gateReject`/`mission.fail()` path (`routes.ts:885-889`) stays, but is
re-labeled as **terminate** — used only for an executive kill or a customer cancellation
(`cancelMission`, `routes.ts:891-895`), never as the default reviewer response to a
tweak.

| Reviewer intent | Verb | Result | Tier |
|---|---|---|---|
| "Change the headline, keep going" | `requestGateRevision` | non-terminal, re-enters generation | ❌ TO BUILD |
| "Kill this mission" | `terminate` (`fail`) | `status: 'failed'` (terminal) | ✅ exists (`mission.ts:209`) |

### 3.2 Stream B — non-destructive version preservation

**Goal:** every revised draft is a new `AssetVersion`; every prior draft is kept.

The substrate is ✅ SHIPPED (`asset.ts:157-163`). The build work is the **wiring**:

1. On each generation and revision, persist the artifact through the Asset aggregate so
   `addVersion` records it. Version 1 = the original draft; version N+1 = each revision.
2. Attach the reviewer's note to the `AssetVersion.note` field (already supported,
   `asset.ts:157-161`) so the history reads as a revision log.
3. Expose version history + rollback in the Asset Library UI
   (`routes.ts:485-500`) so a reviewer can compare and restore any prior draft.

Because content is never overwritten (`asset.ts:59-60`), this stream is **inherently
non-destructive** — it closes the storage half of B-3 with code that already exists.

### 3.3 Stream C — AI-assisted targeted regeneration (❌ ROADMAP)

**Goal:** turn reviewer feedback into a new draft, changing only the named fields.

**Revision Orchestrator** — a new component that, on `requestGateRevision` (Stream A):

1. **Collects the delta:** the reviewer's free-text feedback plus the set of targeted
   fields (e.g. `['headline','cta']` from the six CreativeSet copy fields — see
   ../2-creative-factory/COPY_GENERATOR.md).
2. **Assembles revision context** via the Context Engine
   (../1-ai-foundations/CONTEXT_ENGINE.md): the current draft, the reviewer feedback,
   brand voice/rules/banned words (../1-ai-foundations/BRAND_INJECTION.md), and campaign
   memory read-back (../3-learning-engine/, Book A gap B-2). This makes revision
   *grounded*, not a blind rewrite.
3. **Regenerates only the targeted fields** through a new `creative.revise` task,
   calling `ai.submit` on the wired path (the same single self-repair retry applies,
   ../1-ai-foundations/RETRY_ENGINE.md). Approved fields carry forward verbatim.
4. **Writes the result as `Asset.addVersion`** (Stream B) — the new draft, prior draft
   preserved.
5. **Resubmits** the Approval / mission gate (`Approval.submit`, `approval.ts:165-170`),
   returning the artifact to `in_review`.

**Prompt shape (spec):**

```
You are revising an existing {artifact}. Change ONLY these fields: {targetedFields}.
Reviewer feedback: {feedback}
Current draft: {currentDraft}
Brand voice / rules / banned words: {brandContext}
Return the full artifact with the targeted fields revised and all other fields unchanged.
```

**Non-goals (out of scope here):** quality scoring of the revision, tone/readability
checks, and compliance analysis are separate ❌ ROADMAP capabilities and are not part of
the Revision Engine.

### 3.4 Build ledger

| Item | Tier | Depends on |
|---|---|---|
| `requestGateRevision` (non-destructive gate verb) | ❌ TO BUILD | `approval.ts:182-185` pattern |
| `mission.revision_requested` event + timeline | ❌ TO BUILD | `approval.ts:63-65` pattern |
| Wire generation/revision through `Asset.addVersion` | ❌ TO BUILD (substrate ✅) | `asset.ts:157-163` |
| Version history + rollback UI | ❌ TO BUILD | Asset Library `routes.ts:485-500` |
| Revision Orchestrator | ❌ ROADMAP | Context Engine, `ai.submit` |
| Targeted field-diff selector | ❌ ROADMAP | CreativeSet fields |
| `creative.revise` task + prompt | ❌ ROADMAP | Prompt Orchestrator |

---

## 4. Reconciling the two approval models

The end state unifies both models on a single principle: **rejection-for-revision is
never destructive; only explicit termination is.**

| Dimension | Approval aggregate (today) | Mission gate (today) | Target (both) |
|---|---|---|---|
| Reject-for-revision | `revision_requested` (graceful) | `mission.fail()` (destructive) | `revision_requested` (graceful) |
| Path back to review | `submit` resubmit | none | resubmit after new draft |
| Prior drafts | n/a | lost | preserved as Asset versions |
| Feedback captured | timeline note | failure reason (terminal) | timeline note + regeneration input |
| AI regeneration | none | none | targeted, grounded regeneration |
| True termination | `rejected` | `failed` | `failed` (reserved) |

After the build, a mission gate behaves like the Approval loop it should always have
mirrored (../../book-a/APPROVAL_ENGINE.md): a tweak triggers a revision, not a funeral.

---

## 5. Value contribution

**Production-time ↓.** Today a reviewer tweak at a mission gate forces `mission.fail()`
(`mission.ts:209-216`, `routes.ts:744-754`) — the only recovery is to restart the
mission from the brief. AI-assisted targeted revision replaces a **full restart** with
an **instant, field-scoped regeneration**: change the headline, keep the approved copy,
resubmit. The agency turns a multi-stage rerun into a single targeted pass.

**Revenue ↑.** A mission is a client engagement. Losing it to a one-word tweak is lost
billable work and a damaged client relationship. The non-destructive revision loop
means **the agency never loses a mission to a revision** — every draft is preserved,
every tweak is recoverable, and the reviewer always has a graceful path from feedback to
approved final draft.

---

## 6. Cross-references

| Topic | Reference |
|---|---|
| Source of truth | ../../PRODUCT_TRUTH.md |
| Governing AI reference | ../1-ai-foundations/AI_CONSTITUTION.md |
| Book A gap B-3 (non-destructive revision) | ../../book-a/BOOK_A_WALKTHROUGH.md |
| Human approval / revision loop | ../../book-a/APPROVAL_ENGINE.md |
| Creative gate & reviewer flow | ../../book-a/CREATIVE_WORKFLOW.md |
| Copy fields regenerated on revision | ../2-creative-factory/COPY_GENERATOR.md |
| Revision context assembly | ../1-ai-foundations/CONTEXT_ENGINE.md |
| Brand rules in the revision prompt | ../1-ai-foundations/BRAND_INJECTION.md |
| Self-repair retry on regeneration | ../1-ai-foundations/RETRY_ENGINE.md |
| Memory read-back (gap B-2) | ../3-learning-engine/ |

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
