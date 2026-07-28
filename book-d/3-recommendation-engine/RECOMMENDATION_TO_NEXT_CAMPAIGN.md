# From Recommendation to the Next Campaign

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*
>
> **✅ SHIPPED (Series 2 · 2026-07-28) — the Raw → Aggregate → *Context* half is live; the
> Company Brain is no longer write-only.** A completed campaign's KPIs are written and
> sample-weighted-merged per vertical (`apps/web/src/routes.ts:1215`,
> `domains/company-brain/src/in-memory-company-brain.ts:100`), and a **new** campaign's brief
> reads that aggregate back (`routes.ts:946`) and injects it as **descriptive context** —
> "across N past campaigns in {vertical}, average ROAS was Xx at Y% CTR" — into generation
> (`performance-memory.test.ts`). What ships is **context, not a recommendation**: no ranking,
> no similarity, no "do this next," no confidence scoring. The *Recommendation* step this
> document specifies (turning the aggregate into a ranked, sample-sized suggestion) remains
> **❌ ROADMAP** — honestly, per *Raw → Aggregate → Recommendation*, only the first two arrows
> are live.

---

## 1. What this document closes

Every prior part of Performance Memory has moved in one direction. Part 1 **records** a
finished campaign as facts. Part 2 **aggregates** those facts into per-dimension summaries.
Part 3 **forms** an evidence-based recommendation from the aggregate. This document closes the
last hop of the pipeline — the hop that turns a recommendation into a starting point for the
*next* campaign, and the hop that makes the whole system worth building:

```
Campaign → Performance Record → Pattern → Evidence → Recommendation → Human → Next Campaign
```

Read that arc left to right and notice where it ends. It does not end at "Recommendation." It
ends at **Next Campaign**, and the only thing standing between the two is **Human**. That
single word is the subject of this document. A recommendation that no one ever acts on is a
report. A recommendation that a machine silently applies is an autopilot. Performance Memory
is neither: it is an advisory that a person reviews, and only a person's decision moves
proven direction into the brief that starts the next campaign.

This is the **compounding mechanism** — the reason the memory is called "memory" at all. When
the human accepts an evidence-backed direction, the next campaign does not start from a blank
page; it starts from what the last N campaigns actually did. Each finished campaign's evidence
becomes an input to the next campaign's starting point, so the organization's advantage
accrues rather than resets. That is the promise printed on the product: a system that
*continuously improves future campaigns* using organizational performance memory.

And it is exactly the part that is **not wired yet**. Be precise about which is which. This
document specifies the closing arc as a design, tags every capability honestly, and refuses to
claim the loop is closed when it is not.

---

## 2. The three states of the closing arc — tiered up front

| Stage | Capability | Tier |
| --- | --- | --- |
| Recommendation exists | An aggregate is interpreted into an evidence-backed direction | 🔶 BUILT (UNWIRED) |
| Human sees history on a live page | Decision history renders on the mission-detail page, display-only | ✅ SHIPPED |
| Human approval gate | A person reviews and accepts/edits/rejects a proposed direction | ✅ SHIPPED (Books A/B) |
| Recommendation → brief seeding | Accepted direction pre-fills the next campaign's brief | ❌ ROADMAP |
| Read-back into a new generation | Accumulated memory flows into a live generation path | ❌ ROADMAP |

Two things in that table are real today and easy to confuse with the one thing that is not:

1. **The human approval gate is a shipped mechanism.** AdOS already routes generated work
   through a person who accepts, edits, or rejects it before anything proceeds. That gate is
   documented in Books A and B and is referenced — not redesigned — here.
2. **The only live read-back of accumulated memory is display-only.** The mission-detail page
   reads the recorded decision history and shows it to the human. It is a window, not a wire.

The thing that does **not** exist: nothing flows from accumulated Performance Memory into a
new brief. No recommendation seeds a next campaign today. "Recommendation feeds next campaign"
is **❌ ROADMAP**, end to end. The human gate it would feed into is **✅ shipped**; the memory
read-back it would draw from is **❌ ROADMAP**. Keeping those three facts apart is the whole
job of honest documentation here.

---

## 3. Law 1 governs this hop: evidence offered, decision reserved

> **LAW 1 — Memory is Evidence, not Knowledge.** Performance Memory stores facts, not
> conclusions. It offers evidence-based options; the human makes the decision.

This law is usually invoked at the recording layer, to insist that `CTR`, `ROAS`, `Hook`, and
`Day` are facts while *"video is always better"* is an interpretation. At the closing hop the
same law has a sharper edge. Here the memory is at its most persuasive — it is holding out a
concrete direction ("start the next finance campaign from a 15-second UGC video") — and this is
exactly the moment where a system could overstep by *acting*.

Law 1 forbids that overstep. The memory may **offer** an evidence-based option. It may not
**decide**. Knowledge and judgment live with the human, never in the store. The store knows
what happened; only a person knows whether it should happen again, given the client in front
of them, the brief they were handed, the market this week, and a hundred things the aggregate
never recorded. The recommendation is an input to judgment, not a substitute for it.

Concretely, this means the system's vocabulary at this hop is invitational, never assertive.
It never says "the next campaign will use video." It says **"Based on the results of the last
N campaigns, video outperformed static in this vertical — do you want to start here?"** The
verb belongs to the human.

---

## 4. The human-sovereign boundary (central)

The recommendation is **advisory**. This is the load-bearing rule of the entire document, so
state it without hedging:

> **AdOS never auto-applies a recommendation to a brief.** A proposed direction becomes part of
> the next campaign only after a person reviews it and chooses to accept it — possibly after
> editing it, and with the standing option to reject it outright.

### 4.1 What "advisory" rules out

- **No silent pre-fill.** A recommendation may be *shown*; it is never *committed* on the
  human's behalf.
- **No default-accept.** Doing nothing does not accept a direction. Absence of a decision is
  not consent.
- **No irreversible seeding.** Anything a recommendation contributes to a brief remains fully
  editable and removable by the human before the brief is used.
- **No hidden influence.** If accumulated evidence shaped a proposed direction, that
  influence is visible and labeled, not folded invisibly into a generated draft.

### 4.2 Reuse the shipped gate — do not reinvent it

AdOS already has a human approval mechanism, and this document deliberately **does not**
design a new one. The closing hop routes its proposed direction *into the gate that already
exists*:

- **Book A — Approval Engine:** [`../../book-a/APPROVAL_ENGINE.md`](../../book-a/APPROVAL_ENGINE.md).
  The general principle and machinery by which a human is the authority that lets work proceed.
- **Book B, Part 4 — Human Review:** [`../../book-b/4-optimization/HUMAN_REVIEW.md`](../../book-b/4-optimization/HUMAN_REVIEW.md).
  The optimization-side review surface where a person accepts, edits, or rejects.

Those documents own the gate. Book D's contribution is narrow and additive: it defines a
**new kind of item** that flows *through* that gate — a proposed, evidence-backed direction for
the next campaign — carrying the evidence a reviewer needs to judge it. The reviewer's powers
(accept / edit / reject) are unchanged; only the payload is new.

### 4.3 Why the boundary is non-negotiable

Human sovereignty is not a UX nicety here — it is the difference between a tool that compounds
an agency's judgment and a tool that launders its own guesses back into production. The
aggregate can be wrong: it can be thin (one lucky campaign), stale (a tactic that stopped
working), or mismatched (the right pattern for the wrong client). A person catches those
failures; an autopilot ships them. Reserving the decision for the human is what makes it safe
to let memory get *more* persuasive over time.

---

## 5. Today's reality: the one live read-back, and why it is only a window

The only place accumulated memory is read back into a live path today is the mission-detail
page, which renders the recorded decision history for a completed mission:

- **`apps/web/src/routes.ts:832`** — the mission-detail route reads
  `journal.history({ subjectId: id })` for the mission and returns it for display.

This is a genuine, shipped read-back, and it matters — it is proof that recorded evidence can
surface to a human on a real page. But it is **display-only**. It shows the human what was
decided and what resulted for *this* mission. It is not fed into any new generation, it does
not seed any new brief, and it does not propose a direction for a next campaign. It informs the
person; it does not steer the machine.

The history it shows is the same record the recording action wrote. When a mission completes,
the recording action (`recordLearning`, defined at `apps/web/src/routes.ts:1092`, wired live at
`apps/web/src/routes.ts:763`) writes a decision-journal entry stamped with a timestamp
(`apps/web/src/routes.ts:1116`). The journal returns its history sorted most-recent-first
(`domains/executive-memory/src/memory.ts:71`). So the closing hop's *display* is real and
ordered; its *action* — turning that display into next-campaign input — is not built.

Everything else in the read direction is **🔶 BUILT (UNWIRED)**: the evidence-gathering and
confidence-scoring that would assemble a recommendation exist as code with no live caller
(`domains/executive-memory/src/reasoning.ts:14`, `:62`; pattern ranking at
`domains/company-brain/src/pattern-library.ts:18,35`), and the context assembler that would
carry recalled memory into a generation
(`domains/executive-memory/src/context-builder.ts:37`) is consumed only by a manager that is
never instantiated in production. There is no wire from any of it into a new brief.

---

## 6. The Sample Size Rule travels with the recommendation

> **LAW 3 — Sample Size Rule.** Every recommendation carries an evidence stamp:
> `Sample Size: N campaigns · Confidence: <level> · Evidence Age: <window>`.

A recommendation that reaches a human without its evidence stamp is a rumor. The whole point of
routing memory through a person is that the person can weigh it — and they can only weigh what
they can see. So the Sample Size stamp is **not** left behind at the Recommendation Engine; it
**travels with the recommendation into the human's review**. When a proposed direction appears
in the gate, it appears with:

- **Sample Size** — how many campaigns stand behind this direction (`N campaigns`).
- **Confidence** — the qualitative strength the confidence assessment assigned.
- **Evidence Age** — the recency window the evidence is drawn from.

The reviewer therefore decides with all three visible at once. A direction backed by 214
campaigns over the last 90 days reads very differently from one backed by 3 campaigns from two
years ago — and the human must never have to *ask* which they are looking at. The stamp makes
the difference legible at the moment of decision.

This is the same contract the Recommendation Engine document specifies for the forming side.
Here it is a *hand-off* contract: whatever the aggregate stamped, the human sees. Nothing may
strip, round away, or bury the stamp between the aggregate and the person.

> **Tier check.** The stamp's underlying inputs are partially real (recording captures
> timestamps and the aggregates track sample counts) but the *assembled, stamped
> recommendation delivered into the gate* is **❌ ROADMAP**, because the recommendation is not
> wired to any human-review surface today.

---

## 7. Law 4 as a guardrail at the point of decision

> **LAW 4 — Freshness Before Frequency.** More recent evidence is not automatically worth less
> than a larger pile of old evidence.

At the closing hop, Law 4 becomes a **guardrail on what the human is warned about**. Because a
recommendation is about to influence real, future spend, a thin or stale direction is more
dangerous here than anywhere else in the pipeline. So the review surface must flag, plainly:

- **Low-sample directions** — a recommendation resting on too few campaigns is marked as
  provisional, never dressed up as settled. A single lucky campaign must be unmistakable as a
  single lucky campaign.
- **Stale directions** — a recommendation whose supporting evidence is old is marked as
  possibly out of date, so a tactic that stopped working two years ago cannot quietly seed a
  brief today. `2019: 500 campaigns` does not automatically outrank `Last 90 days: 43
  campaigns`; the human is shown both and decides.

These guardrails do not block the human — sovereignty means the person may still choose a
thinly-supported direction with eyes open. They ensure the eyes are open. The flag is a
warning label, not a lock.

> **Tier check.** Freshness *data* is captured (timestamps are stored on records); freshness
> *scoring* that would drive these flags is **❌ ROADMAP** — recency is not yet an input to how
> evidence is ranked. So the guardrails described here are design, not shipped behavior.

---

## 8. The design: a brief-seeding step (❌ ROADMAP)

Here is the shape of the hop when it is built. It is one new step, bolted onto machinery that
already exists on both ends — the aggregate/recommendation on the input side, the human gate on
the output side.

### 8.1 The step

**Brief seeding** is a proposal step that sits at the start of a new campaign. When a brief is
being prepared, brief seeding queries Performance Memory for evidence-backed directions
relevant to the new campaign's context (its vertical, and — once those grouping keys exist —
its format and similar prior campaigns), and *proposes* them to the human as optional starting
points. It proposes; it never pre-commits.

```
New campaign context ─┐
                      ├─▶ Brief Seeding ─▶ proposed directions (each stamped) ─▶ Human Gate
Performance Memory ───┘        (query)                                              │
                                                                                    ├─ accept → seeds brief
                                                                                    ├─ edit   → seeds brief (as edited)
                                                                                    └─ reject → brief unchanged
```

### 8.2 What each proposed direction carries

Every proposed direction is an **advisory bundle**, not a command:

1. **The direction** — a concrete, evidence-backed suggestion ("finance → 15s → UGC video").
2. **The Sample Size stamp** (Law 3) — `N campaigns · confidence · evidence age`, inline.
3. **The freshness/low-sample flags** (Law 4) — warnings where the evidence is thin or old.
4. **A path back to the evidence** — enough attribution that the human can see *why* this was
   proposed before deciding whether to trust it. (The forming and explaining of that evidence
   are owned by the Recommendation Engine document and by Book C respectively; brief seeding
   only *carries* the result to the gate.)

### 8.3 Where it plugs in

- **Input side:** the aggregate and the evidence-gathering/confidence-scoring code that would
  form the recommendation (`domains/executive-memory/src/reasoning.ts:14,62`;
  `domains/company-brain/src/pattern-library.ts:18,35`) — all 🔶 today.
- **Output side:** the shipped human gate (Book A Approval Engine; Book B Human Review). Brief
  seeding does not add a second approval concept — it feeds the one that already exists.
- **The missing wire:** the connection from input to output. This is what makes the whole hop
  ❌ ROADMAP. Building it means (a) giving the recommendation a live caller, (b) delivering its
  stamped output into the review surface, and (c) letting an accepted direction pre-fill an
  editable brief field. None of the three exists today.

### 8.4 Guardrails restated as build requirements

The seeding step is only safe if these hold, so they are requirements, not options:

- **Advisory-only:** an unaccepted proposal never touches the brief.
- **Stamp-preserving:** the Law 3 stamp reaches the human intact.
- **Flag-raising:** Law 4 low-sample and stale flags are shown, not suppressed.
- **Fully reversible:** an accepted seed remains editable and removable before the brief is
  used.
- **Attributable:** the human can always trace a proposal back to its evidence.

---

## 9. How this makes memory compound

Compounding is a specific, mechanical claim, and it is worth spelling out so it is not mistaken
for a slogan.

Without this hop, each campaign is an island. It is recorded, it is aggregated, and the
aggregate sits in a store that no new campaign reads from. The organization *has* memory but
never *spends* it. Nothing carries forward; every brief starts from zero.

With this hop, the aggregate becomes the **starting point** for the next brief — subject to the
human's decision. Campaign 200's evidence, added to the pile, changes what campaign 201 is
proposed to start from. The advantage is cumulative: the more campaigns the organization
finishes and records, the richer the evidence the human reviews before starting the next one.
That is what "continuously improves future campaigns" means in mechanical terms — not that the
AI got smarter, but that the **company's accumulated evidence keeps raising the floor** the
next campaign starts from.

Two honest qualifiers keep this from becoming a claim we cannot back:

- The improvement is **human-gated**, not automatic. Memory raises the floor only when a person
  accepts a direction. The compounding runs through judgment, by design.
- The mechanism is **❌ ROADMAP** end to end. Today the pile grows (recording is shipped) and a
  human can *view* one mission's history (display-only, `apps/web/src/routes.ts:832`), but no
  accumulated evidence seeds any next brief. The compounding is specified, not shipped.

---

## 10. Boundaries

The closing hop inherits and does not weaken any product boundary:

- **100% local, offline-first.** Seeding queries only the organization's own Performance
  Memory. No cloud, no API, no external benchmarks, no vendor telemetry ever informs a proposed
  direction.
- **Copy-only.** A seeded brief is text and structured fields for a human to work with — never
  an automated action taken on an ad account.
- **Own-data only.** Directions are proposed from this organization's recorded campaigns and
  nothing else. There is no cross-tenant or external "industry best practice" injected here.
- **Human-sovereign — never auto-approves.** This is the hop's defining boundary, restated:
  no proposal becomes brief input without an explicit human accept. Doing nothing accepts
  nothing.
- **No new AI.** Brief seeding is a query-and-propose step over stored evidence plus the
  existing recommendation code. It creates no new model and asserts no conclusion of its own; at
  most, local phrasing may present facts it is given.

---

## 11. Invariant laws (as they bind this hop)

- **Law 1 — Memory is Evidence, not Knowledge.** The hop offers options; the human decides.
  Judgment never migrates into the store.
- **Law 2 — Raw → Aggregate → Recommendation.** The direction handed to the human is the
  *output* of that chain, never a jump from a single campaign to a next-campaign instruction.
  This hop consumes a recommendation; it does not manufacture one from raw records.
- **Law 3 — Sample Size Rule.** The evidence stamp travels with the recommendation into the
  human's view. The person decides with sample size, confidence, and evidence age visible.
- **Law 4 — Freshness Before Frequency.** Thin and stale directions are flagged at the point of
  decision; recency is weighed, not discounted by default.

---

## 12. Value contribution

Starting the next campaign from proven evidence instead of a blank page pays off on both axes
the agency cares about:

- **Reduces production time.** A brief seeded with an evidence-backed direction the human
  accepts skips the cold-start — the team begins from what has worked in this vertical rather
  than reconstructing it each time. Less time spent rediscovering; more spent executing.
- **Raises win rate and retains accounts.** Beginning from directions the last N campaigns
  actually validated makes each new campaign likelier to perform, and it lets the agency show a
  client a *compounding* edge — "your account gets better as we run it" — that a blank-page
  competitor cannot claim. Attributable, accumulating evidence is what turns a one-off result
  into a retained account.

Both benefits are contingent on the hop being built and, at every use, on a human choosing to
accept a proposed direction. The value is real and it is **❌ ROADMAP** — reality first, then
the marketing.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
