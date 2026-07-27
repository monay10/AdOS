# Human Review — The Final Quality Gate Every AI Output Must Pass

| | |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ✅ **SHIPPED** — human review is real and runs on the live
> app path today. The `Approval` aggregate and the mission gates are wired, tested, and
> block every AI artifact until a person decides. The **AI augmentation** described here —
> surfacing Part 4 quality signals into the reviewer's view — is **ROADMAP**; today the
> reviewer sees the raw output, unaugmented by any automated QA signal. AdOS never
> auto-approves.

---

## 1. Why this document exists

Every other document in Book B describes something the AI *produces* or *judges*: a brief,
a creative set, a brand-safety scan, a readability score, a learning signal. This document
describes the one thing the AI is **never** allowed to do: **approve its own work.**

AdOS is an offline-first, 100% local-AI advertising-agency platform. A client states an
objective as a Mission, and AdOS runs it through a linear, human-gated pipeline — marketing
brief → creative (ad copy) → campaign **draft** → performance report → executive dashboard
(`apps/web/src/routes.ts`). At no point does an AI output advance to the client, to a
budget decision, or to the next pipeline stage on its own authority. A **human being clicks
approve**, or nothing moves.

This is not a limitation to be engineered away. It is the **product principle**: AdOS has
**no autonomous agents**, no "Digital Employees," and no self-approving pipeline
(`PRODUCT_TRUTH.md` §2.3, §6.2). The AI drafts; the human decides. Book B's entire agent
architecture — generation, memory, brand safety, scoring — exists to make that human
decision **faster and better-informed**, never to replace it.

The human review gate is therefore the **anchor** of Part 4 (Optimization): every quality
signal this part specifies (brand safety, tone, readability, compliance, scoring) is
optimization *in service of the reviewer*, not optimization that bypasses them.

It is worth naming why this is the one Part 4 topic marked ✅ **SHIPPED** rather than 🔶 or
❌. Most of Book B's agent architecture is coded-but-dormant or purely specified; the human
review gate is the exception — it is wired, exercised on the live path, and covered by the
approval and mission-processing tests (`PRODUCT_TRUTH.md` §3). It is, in short, the **solid,
real control** the rest of the intelligence layer will be built to support. Documenting it
accurately means describing shipped behavior in the present tense (§3) and keeping the
augmentation strictly in the future tense (§4).

---

## 2. Target design — human review as the final gate, *augmented* not replaced

### 2.1 The principle: augmentation, never automation

The target design keeps the human as the **sole approving authority** and adds a layer of
**AI-surfaced decision support** around them. The distinction is absolute:

| | **Augmentation (AdOS target)** | **Automation (explicitly rejected)** |
|---|---|---|
| Who decides | The human reviewer | The AI |
| What the AI does | Surfaces signals: flags, scores, evidence | Approves / rejects on its own |
| Gate behavior | Blocks until a person clicks | Advances automatically on a threshold |
| Accountability | Named `actor` on every decision | None / diffuse |
| AdOS status | ✅ gate shipped, 🔶/❌ signals to add | ❌ **never built, never will be** |

The reviewer never loses authority. The AI's job at the gate is to **reduce the cost of a
good decision** — to put the right information in front of the human so a sound approval
takes seconds instead of minutes, and so a subtle problem (an off-brand phrase, a banned
word, an unreadable sentence) is *caught before* it reaches the client rather than after.

### 2.2 The augmented review surface (target)

In the target design, when a reviewer opens an AI artifact at a gate, they see the raw
output **plus** a panel of automated signals produced by the other Part 4 / Part 2 engines:

| Signal | Source engine (spec) | What it tells the reviewer | Tier |
|---|---|---|---|
| **Brand Safety** | [`BRAND_SAFETY.md`](BRAND_SAFETY.md) | Does the copy contain a banned word or violate a brand rule? | 🔶 BUILT (UNWIRED) |
| **Scoring** | [`SCORING.md`](SCORING.md) | Relative quality / readability / on-brief score for this draft | ❌ ROADMAP |
| **Tone** | [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md) | Does the copy match the brand voice? | ❌ ROADMAP |
| **Readability** | [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md) | Is the copy clear and appropriately leveled? | ❌ ROADMAP |
| **Compliance** | [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md) | Any regulated-claim / disclosure risk? | ❌ ROADMAP |

Each signal is **advisory**. A red brand-safety flag does not reject the artifact — it
tells the human *where to look*. A low readability score does not block approval — it tells
the human *what to weigh*. The human reads the signals, reads the output, and decides. The
gate stays exactly where it is; only the **quality of the information at the gate** improves.

This is the whole design in one sentence: **the AI QA checks surface signals so the human
decides faster and better — the click stays human.**

### 2.3 A worked example — the same gate, before and after augmentation

Consider a reviewer opening a generated `CreativeSet` at the `creative_assets` gate. The
artifact is the six copy fields — `headline`, `adCopy`, `cta`, `socialPost`, `landingPage`,
`email` (`domains/creative-studio/src/creative/creative-set.ts:43-50`).

**Today (unaugmented).** The reviewer sees six blocks of text. To decide, they must:

- recall the brand's banned words and eyeball every field for a match;
- judge whether the tone matches the brand voice from memory;
- gauge readability by feel;
- decide whether the copy is on-brief by re-reading the brief in another tab.

Every one of those is manual, and a missed banned word is only caught if a human happens to
notice it. The decision is sound only to the degree the reviewer is fresh and thorough.

**Target (augmented).** The same six fields render **with an advisory panel**:

```
CreativeSet · Mission #4821 · gate: creative_assets
┌───────────────────────────────────────────────────────────┐
│ Brand Safety   ⚠ 1 flag   "guaranteed" in adCopy (rule)   │  ← BRAND_SAFETY.md
│ Readability    ✓ Grade 7  (target 6–8)                     │  ← CREATIVE_QA.md
│ Tone           ✓ on-voice (confident, warm)                │  ← CREATIVE_QA.md
│ Compliance     ⚠ review   unqualified claim in headline    │  ← CREATIVE_QA.md
│ Score          72 / 100   (band: revise-or-approve)        │  ← SCORING.md
└───────────────────────────────────────────────────────────┘
  [ Approve ]   [ Request revision ]   [ Reject ]
```

The reviewer's eye goes straight to the two ⚠ flags. They read the flagged `adCopy` and
`headline`, judge the risk, and either **approve with a note** ("claim substantiated by
client's Q2 data") or **request a revision** naming the fix. The gate did not move. No
signal approved anything. The human decided — in seconds, and with the two real problems
already in front of them rather than left to chance.

The panel is illustrative, not shipped: none of those signals render today (§3.4). It shows
what "augmented, not replaced" means concretely — **more information at the gate, the same
authority behind it.**

### 2.4 The gate lives on the Approval aggregate

The target surface is built *on top of* an approval workflow that already exists and
already works (§3). Nothing in the augmentation design replaces the state machine; the
signals are rendered into the review view that the `Approval` aggregate and the mission
gates already drive. That existing machinery — append-only timeline, named actor,
explicit transitions — is what makes the human decision **accountable**, and it is the
foundation the augmentation layer is added to.

---

## 3. Today — ✅ SHIPPED: the human approval workflow

Everything in this section is **live on the app path today**, tenant-scoped, and tested.
There are two real, wired approval mechanisms, and every AI artifact passes through one of
them before it advances.

### 3.1 The `Approval` aggregate (✅ SHIPPED)

A first-class review request with an explicit state machine and an **append-only timeline**
lives at `domains/agency-os/src/approval/approval.ts`:

| Element | Detail | Cite |
|---|---|---|
| States | `draft → in_review → approved \| rejected \| revision_requested` | `approval.ts:25` |
| Transitions | `submit`, `approve`, `reject`, `requestRevision` | `approval.ts:165-185` |
| Guard | each transition validates the current state; illegal moves error | `approval.ts:166,173,178,183` |
| Timeline | every transition appends an immutable `ApprovalTimelineEntry` | `approval.ts:187-196` |
| Actor | each entry records `actor`, `at`, `note`, `from`, `to` | `approval.ts:31-38` |
| Events | each transition emits a domain event (`approval.approved.v1`, …) | `approval.ts:54-65,198-212` |

The timeline is **append-only** — a transition never mutates a prior entry, it pushes a new
one (`approval.ts:193`: `timeline: [...this.props.timeline, entry]`). Every decision is
therefore a **permanent, attributed record** of who decided what, when, and why. A
`revision_requested` request returns to `in_review` when resubmitted (`approval.ts:22-23`,
`166`), so a human-requested revision is a **non-destructive round trip**, not a rewrite.

> **Note:** this per-approval timeline is an accountable decision record — it is **not** the
> product's (absent) immutable, tamper-evident audit log (`PRODUCT_TRUTH.md` §2.7). It
> records approval decisions faithfully; it does not claim system-wide audit guarantees.

**A walk through the states.** An approval is born in `draft` with a single `created`
timeline entry (`approval.ts:101-116`). A human `submit` moves it to `in_review`
(`approval.ts:165-170`) — and *only* `draft` or a prior `revision_requested` may be
submitted, so the workflow cannot skip review. From `in_review` exactly three human actions
are legal:

- `approve` → `approved` (terminal for this request) — `approval.ts:172-175`;
- `reject` → `rejected` (terminal) — `approval.ts:177-180`;
- `requestRevision` → `revision_requested`, which a resubmit sends back to `in_review` —
  `approval.ts:182-185`, `22-23`.

Each of the three is guarded to require the `in_review` state; calling `approve` on a `draft`
returns a `ValidationError` (`approval.ts:214-218`), never a silent pass. There is **no
transition that an AI can trigger** — every method takes a `TransitionInput` carrying a human
`actor` (`approval.ts:67-72`), and the aggregate emits a distinct domain event per action so
downstream contexts observe a *human* decision, not a machine one (`approval.ts:198-212`).

### 3.2 The wired routes (✅ SHIPPED)

The aggregate is driven by real HTTP routes at `apps/web/src/routes.ts:478-481`:

| Route | Action | Cite |
|---|---|---|
| `POST /approvals/:id/submit` | `app.approvals.submit(aid, input)` | `routes.ts:478` |
| `POST /approvals/:id/approve` | `app.approvals.approve(aid, input)` | `routes.ts:479` |
| `POST /approvals/:id/reject` | `app.approvals.reject(aid, input)` | `routes.ts:480` |
| `POST /approvals/:id/revise` | `app.approvals.requestRevision(aid, input)` | `routes.ts:481` |

The `input` is assembled from the live session — `{ actor: session.actor, at: <now>, note }`
(`routes.ts:477`) — so the person who clicked is the person recorded. There is **no path
that transitions an approval without a human request**.

### 3.3 The mission gates (✅ SHIPPED)

The pipeline itself is gated. A Mission cannot flow from one AI stage to the next until a
human approves at the corresponding gate (`apps/web/src/routes.ts`):

| Gate | Guards advancement of | Route | Cite |
|---|---|---|---|
| `strategy_and_budget` | the marketing brief → creative | `POST …/approve` | `routes.ts:743` |
| `creative_assets` | the creative set → campaign draft | `POST …/creative/approve` | `routes.ts:748` |
| `campaign_launch` | the campaign draft → report | `POST …/campaign/approve` | `routes.ts:753` |

Each calls `gateApprove(...)`, which invokes `app.missions.approve(MissionId, gate)` and
only then redirects the mission forward (`routes.ts:879-883`). The mission's default gate
set is `['strategy_and_budget','campaign_launch']` (`mission.ts:110`), with `creative_assets`
gating the creative stage in the route layer. Book A specifies these three gates in full;
this document reuses them exactly (see [`../../book-a/APPROVAL_ENGINE.md`](../../book-a/APPROVAL_ENGINE.md)).

The consequence is the product's defining behavior: **every AI artifact is human-gated
before it advances.** The brief does not become creative until a human approves strategy.
The creative does not become a campaign until a human approves the assets. The draft is
**never** launched — it stops at the `campaign_launch` gate and, in AdOS, there is no ad
platform beyond it (`PRODUCT_TRUTH.md` §2.4). The human is the last authority at every step.

This gating holds **regardless of which AI produced the artifact**. AdOS's default AI is the
deterministic `OfflineAIManager` (`apps/web/src/ai.ts:13`), which emits template output with
zero token usage; genuine model prose requires a locally-run engine (`ai-live.ts:26`). Either
way — canned or genuine — the output stops at the gate. The review discipline is **independent
of AI quality**: a deterministic stub and a large local model face the identical human click.
That is by design. The gate is not a fallback for weak AI; it is the permanent control.

### 3.4 What is *not* here today (the honest gap)

Today the reviewer sees the **raw AI output** and nothing more. When an approver opens a
brief, a creative set, or a campaign draft, there is:

- **No brand-safety flag** next to the copy — bannedWords enforcement exists only as unwired
  code (`BRAND_SAFETY.md`; canon gap **B-1**).
- **No quality / readability / tone / compliance score** — no such engine runs on the live
  path (`SCORING.md`, [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md); all ❌ ROADMAP).
- **No AI-drafted revision** if the reviewer requests changes — `requestRevision` is
  **human-only**; the AI does not propose a fix (canon gap **B-3**).

So today's human review is **real but unaugmented**. The gate is solid; the decision support
around it is the build work below. This is exactly the honest line Book B draws: the control
is shipped, the intelligence layer on top of it is not.

---

## 4. To build — surface the QA signals into the review UI

The build goal is narrow and safe: **give the reviewer better information at the exact same
gate.** No new authority is granted to the AI. No gate is moved. No approval is automated.

### 4.1 Wiring plan

| Step | Work | Depends on | Tier today |
|---|---|---|---|
| 1 | Run Brand Safety scan on the artifact at review time; render pass/flag + the offending term | wire `BRAND_SAFETY.md` engine into the review view | 🔶 BUILT (UNWIRED) |
| 2 | Compute Scoring (quality / readability) for the artifact; render score + band | build `SCORING.md` engine | ❌ ROADMAP |
| 3 | Run Tone / Readability / Compliance checks; render advisory flags | build [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md) engines | ❌ ROADMAP |
| 4 | Render all signals into the approval detail view as an **advisory panel** — never as a gate | steps 1–3; existing review view | design |
| 5 | (Optional, later) AI-*drafted* revision suggestion on `requestRevision`, presented for the human to accept or discard | closes gap **B-3**; still human-approved | ❌ ROADMAP |

### 4.2 Design invariants (non-negotiable)

Every step above must preserve these, or it violates the product principle:

1. **The click stays human.** No signal, no score, no threshold ever calls `approve`. The
   only caller of `app.approvals.approve` / `gateApprove` is a human POST
   (`routes.ts:479,743`). No autonomous path is added.
2. **Signals are advisory, not gating.** A red flag informs; it does not block or auto-reject.
   The human may approve *over* a warning (with the reason captured in the timeline `note`).
3. **The timeline still records the human.** The `actor` on every entry remains the person,
   never "system" or "AI" (`approval.ts:192`).
4. **Revision stays non-destructive.** Any AI revision suggestion (step 5) is a *proposal*
   the human accepts or discards; it never overwrites the original (respects gap **B-3**).
5. **No auto-approve, ever.** There is no threshold, no confidence score, and no "green means
   go" that advances an artifact without a person. This is a product guarantee, not a config.

### 4.3 Why this ordering

Brand Safety is first because its engine **already exists** in the codebase (unwired) — it is
the cheapest, highest-value signal to surface and closes the most concrete gap (**B-1**).
Scoring and the CREATIVE_QA checks follow because they must be built. The AI revision
suggestion is last and optional because it is the closest to the automation line and must be
designed with the most care to stay a *proposal*.

### 4.4 Explicitly out of scope for this build

To keep the augmentation honest, the following are named as **non-goals**, so no future
reader mistakes them for planned behavior:

| Non-goal | Why excluded |
|---|---|
| Auto-approve on a passing score | Violates the product principle; there is no threshold that advances an artifact. |
| Auto-reject on a failing flag | A flag informs; only a human rejects. The reviewer may approve over a warning. |
| Removing or shortening a gate when signals are "all green" | The gate is permanent; green signals speed the *human*, they do not skip them. |
| An AI that overwrites the artifact on revision | Revision is a human-owned, non-destructive round trip (gap **B-3**). |
| Blocking approval until every flag is cleared | The human is the authority; they weigh flags, they are not overruled by them. |

Each non-goal is the same rule stated from a different angle: **the AI advises, the human
decides, and the gate never disappears.**

---

## 5. What the gate guarantees — and what it does not

Being precise about the boundary of the shipped control matters as much as describing it,
so a reader never over-claims on AdOS's behalf.

**The gate guarantees, today (✅):**

| Guarantee | Mechanism | Cite |
|---|---|---|
| No AI artifact advances without a human action | every forward transition is a human POST | `routes.ts:478-481,743,748,753` |
| The deciding person is recorded | `actor` is taken from the session, stamped on the timeline | `routes.ts:477`, `approval.ts:192` |
| A decision cannot be silently overwritten | timeline is append-only; revision is a new round trip | `approval.ts:193`, `22-23` |
| Illegal transitions are refused, not ignored | state guards return `ValidationError` | `approval.ts:166,173,178,183,214-218` |
| The draft is never launched to a real ad platform | pipeline ends at `campaign_launch`; no connector exists | `PRODUCT_TRUTH.md` §2.4, §2.5 |

**The gate does *not* provide, today (honest limits):**

- It is **not** a system-wide immutable audit trail — the timeline is a faithful per-approval
  record, but the product has no tamper-evident global log (`PRODUCT_TRUTH.md` §2.7).
- It does **not** enforce *who* may approve. Roles are defined but RBAC is never called on
  route code, so the gate records the actor without restricting them by permission
  (`PRODUCT_TRUTH.md` §2.6). Enforced review authority is roadmap, not shipped.
- It does **not** yet carry any AI quality signal (§3.4) — that is the §4 build.
- It has **no tiered T0–T4 approval authority** — the gates are boolean human checks, not a
  graduated authority model (`PRODUCT_TRUTH.md` §6.2).

Stating these plainly is the point: the human-review *control* is real and shipped; the
*intelligence around it* and the *authority model on top of it* are design work. Book B keeps
those apart on purpose.

---

## 6. Relationship to the rest of Book B

| Document | Relationship |
|---|---|
| [`../../book-a/APPROVAL_ENGINE.md`](../../book-a/APPROVAL_ENGINE.md) | Book A's canonical model of the two approval mechanisms and the three gates. This doc is its Book B / AI-facing companion — same aggregate, same gates, adds the AI-augmentation layer. |
| [`BRAND_SAFETY.md`](BRAND_SAFETY.md) | Produces the banned-word / brand-rule signal surfaced at review (step 1). |
| [`SCORING.md`](SCORING.md) | Produces the quality / readability score surfaced at review (step 2). |
| [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md) | Produces the tone / readability / compliance signals surfaced at review (step 3). |
| [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) | Governing reference: the human-in-the-loop mandate this document operationalizes. |

Book B never contradicts Book A: the gate names, states, and actors are identical. This
document's only addition is the **advisory signal layer**, and that layer never touches the
authority Book A defines.

---

## 7. Value contribution

**Production-time ↓.** The gate is the pipeline's rate-limiter — every artifact waits here.
Today the reviewer reconstructs quality judgments by hand (reading every field, checking the
brand's banned words from memory, gauging readability by feel). Surfacing the Part 4 / Part 2
signals into the review view turns that manual scan into a glance: a green brand-safety flag
and a readability band let a clean draft be approved in seconds, and a red flag points the
eye straight to the problem instead of hoping it is noticed. **The AI-surfaced signals speed
the human decision** — the same gate, cleared faster, is a direct cut in production time.

**Revenue ↑.** A better-informed approval is a better approval. Catching an off-brand phrase,
a banned word, or an unreadable CTA *before* the human signs off — rather than after it has
gone to the client — means fewer costly revision cycles, fewer client-trust hits, and
stronger creative leaving the door. **Better-informed approvals raise the quality of what
ships**, and higher-quality, on-brand, compliant output is what the agency is paid for.

Crucially, both gains come **without removing the human** — which is itself the value: the
agency can trust every output because a named person approved it, and that trust is the
product. Augmentation compounds the reviewer; it never replaces them.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
