# Decision Journal — The Live "Why Did It Decide This?" Surface

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. The governing
> document is
> [`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. Why this document is the anchor

Campaign Intelligence — the Trust Layer of AdOS — answers exactly one question:

> **"Why did the AI recommend this?"**

Most of the machinery that will one day answer that question in full is still specification
or unwired code. This document is different. The **Decision Journal is the one real
explainability surface shipping in the live web app today.** When a mission produces a
recommendation, the app writes a structured record of *what* it decided, *why*, *what it
considered instead*, and *how confident it was* — and then reads that record back and renders
it on the mission detail page for a human reviewer to inspect.

Everything else in this part of the book — richer evidence, calibrated confidence, surfaced
trade-offs — is an *upgrade path* that flows through this surface. So we describe the
Decision Journal honestly and in full: what ships, what is hand-rolled, and what is roadmap.
No embellishment. The value of a trust surface collapses the moment it overstates itself.

**Value contribution.** A recommendation that carries its own written justification is a
recommendation a reviewer can approve without re-deriving it from scratch. The Decision
Journal is where "do I believe this?" becomes "here is the evidence, the confidence, and the
alternative that was rejected — approve or reject." That directly **cuts reviewer decision
time** (the reviewer reads a record instead of reconstructing the reasoning) and directly
**wins and retains accounts** (an agency that can show a client *why* every recommendation
was made is trusted in a way a generic LLM tool never is). Explainability is not a feature
bolted onto the product; it is the product's commercial moat.

---

## 2. The end-to-end path (✅ SHIPPED)

The Decision Journal is a complete round trip in the live application: a store, a write, a
read, a mapping, and a render. All five links are wired and reachable from the running app.

### 2.1 The store — `InMemoryDecisionJournal` (✅ SHIPPED)

The journal itself is `InMemoryDecisionJournal`
(`domains/executive-memory/src/memory.ts:54-80`). It exposes three methods that together
form the whole explainability contract at the storage layer:

- **`record(entry)`** — appends a decision record.
- **`history({subjectId, k})`** — returns the most recent `k` records for a subject (a
  mission, a client, any keyed entity).
- **`attachOutcome(id, outcome)`** — later binds a real-world result back onto a decision
  that was already recorded.

The store is instantiated live during application boot at `apps/web/src/app.ts:91`, alongside
the other executive-memory stores. From that moment every route in the app can write to it and
read from it.

> **Honest caveat — in-memory only.** The journal is exactly what its name says: in-memory.
> The live app wires all of its memory stores in-process at `apps/web/src/app.ts:89-91`, so
> the Decision Journal lives for the lifetime of the running process and no longer. Restart
> the app and the recorded decisions are gone. This is a deliberately honest limitation, not
> a hidden one — durable persistence is roadmap (§7), and it must never be described as
> shipped. Note the contrast: campaign *artifacts* do persist, through
> `apps/web/src/db/repositories.ts`; the *decision records that explain them* do not, yet.

### 2.2 The write — recording a decision (✅ SHIPPED)

When a mission produces a recommendation, the app writes a decision record at
`apps/web/src/routes.ts:1118`. The recorded shape is:

```
{ decision, evidence, alternatives, chosen, rejected, confidence, outcome }
```

Each field is a first-class part of the explanation, not decoration:

| Field | Meaning |
| --- | --- |
| `decision` | The recommendation itself — the thing being justified. |
| `evidence` | The `evidence[]` list that supports the decision. |
| `alternatives` | The options that were on the table. |
| `chosen` | The option that was selected. |
| `rejected` | The option(s) that were considered and set aside. |
| `confidence` | The system's confidence in the decision: `{score, reason, basis}`. |
| `outcome` | Reserved for the real-world result, filled in later by `attachOutcome`. |

This is the storage-level expression of the Evidence First Law: a recommendation is never
recorded bare. It is recorded *with* the evidence and *with* the alternatives it beat, so
that "why this?" and "why not that?" are both answerable from the record alone.

Two properties of this shape are worth drawing out, because they are what make the record an
*explanation* rather than a *log entry*:

- **Alternatives travel with the decision.** Storing `alternatives`, `chosen`, and `rejected`
  together means the record answers the counterfactual question — "what else was on the table,
  and why was it set aside?" — without any second lookup. A reviewer never has to trust that an
  alternative was considered; the rejected option is written down next to the chosen one. This
  is the raw material for the richer trade-off surface, which is designed in the sibling
  document on alternatives and trade-offs; the storage for it is already shipped here.
- **Outcome is reserved, not required, at write time.** The `outcome` field is part of the
  record from the moment it is written, but it is empty until reality arrives. That empty slot
  is deliberate: it is the promise that this decision will be checked against what actually
  happened, kept open by the record itself rather than tracked in some separate ledger.

### 2.3 The read — pulling the decision back (✅ SHIPPED)

The mission detail flow reads the decision back at `apps/web/src/routes.ts:832` via
`journal.history({ subjectId, k: 1 })` — the single most recent decision recorded against
that mission. The confidence score is pulled out for display at `apps/web/src/routes.ts:837`.

### 2.4 The mapping — into a `LearningView` (✅ SHIPPED)

The raw record is mapped into a view model for the page at
`apps/web/src/routes.ts:833-841`. This `LearningView` is the shape the template consumes: the
decision, its evidence, its confidence score and reason, and the chosen-versus-rejected pair.

### 2.5 The render — on the mission detail page (✅ SHIPPED)

Finally the view is rendered on the mission detail page by `renderLearning` at
`apps/web/src/views/pages.ts:294-297`. This is the human-facing surface: a reviewer opening a
mission sees the recorded justification for the recommendation attached to it. This is the
clearest real "why did it decide this?" surface AdOS ships today.

> **The round trip, in one line:** store (`memory.ts:54`) → write (`routes.ts:1118`) → read
> (`routes.ts:832`) → map (`routes.ts:833-841`) → render (`pages.ts:294-297`). All ✅
> SHIPPED, all in-memory.

---

## 3. What each recorded field means, and how it maps to the explanation chain

The Evidence First Law mandates a specific shape for anything presented as a recommendation:

> **Recommendation → Evidence → Confidence → Alternatives → Decision**

The Decision Journal extends that chain by one link — **Outcome** — because it is the surface
that later learns whether the decision was right:

> **Recommendation → Evidence → Confidence → Alternatives → Decision → Outcome**

The recorded fields map onto that chain directly:

| Explanation chain link | Journal field(s) | Tier |
| --- | --- | --- |
| Recommendation / Decision | `decision`, `chosen` | ✅ SHIPPED |
| Evidence | `evidence[]` | ✅ SHIPPED (shape) |
| Confidence | `confidence{score, reason, basis}` | ✅ SHIPPED (shape) |
| Alternatives | `alternatives`, `rejected` | ✅ SHIPPED |
| Outcome | `outcome` (via `attachOutcome`) | ✅ SHIPPED (mechanism) |

Because the store holds all of these together in one record, the journal is not merely a log
of *what* was decided — it is a log of *why*, structured so that a machine can render it and a
human can audit it.

### 3.1 Mapping to the 8-field Explainability Contract

The Explainability Contract is the eight-field minimum every AI output must one day support —
the future UI standard. The Decision Journal already carries data for a majority of those
fields today; the remainder are the honest gaps this book is here to name.

| # | Contract field | Journal today | Tier |
| --- | --- | --- | --- |
| 1 | Recommendation | `decision` / `chosen` | ✅ SHIPPED |
| 2 | Why? | `confidence.reason` (today, a literal string) | ✅ shape / 🔶 real reason |
| 3 | Evidence | `evidence[]` (today, hand-rolled literals) | ✅ shape / 🔶 real evidence |
| 4 | Confidence | `confidence.score` | ✅ shape / 🔶 real score |
| 5 | Alternative considered | `alternatives` + `rejected` | ✅ SHIPPED |
| 6 | Brand rules checked | not stored on the record | ❌ ROADMAP |
| 7 | Memory consulted | not stored on the record | ❌ ROADMAP |
| 8 | Human action required | reviewer approves/rejects at the page | ✅ (implicit, via the surface) |

The full definition of the contract and its role as the UI standard is owned by the Why
Contract part of this book; this document's job is to show that the *shipped* journal is
already a partial implementation of it — and to be exact about which fields are real data and
which are still placeholders.

Read that table carefully, because it is the honest map of where AdOS actually stands. Five of
the eight contract fields have a home on the shipped record; three of those five carry real
data today and two carry placeholder substance behind a real shape. The remaining three fields
split cleanly: field 8 (human action required) is satisfied by the surface itself — the
reviewer is the one who approves or rejects at the mission detail page, so the human action is
not a stored value but the very interaction the page exists to enable — while fields 6 and 7
(brand rules checked, memory consulted) have no place on the record yet and are honestly
roadmap. A future record would extend the stored shape to capture which brand rules were
evaluated and which memories were consulted, so that a reviewer can see not just *what* the
system concluded but *what it checked against* before concluding it. That extension is
specified, not shipped.

The point of the map is not that the journal is finished. It is that the journal is the
**correct partial** — the fields that ship are the fields that matter most, and the fields that
are missing are named rather than faked.

---

## 4. The honest caveat: today's evidence and confidence are hand-rolled

This is the single most important honesty note in the entire document, and it must not be
softened.

The `evidence[]` list and the `confidence{score, reason, basis}` object recorded at
`routes.ts:1118` are **not** produced by a reasoning engine. They are built inline as
literals at `apps/web/src/routes.ts:1123-1130`. The confidence reason is a template string —
`reason: "Based on ${roas}x ROAS"` — derived from a single readily-available number. The
*shape* is correct and shipped; the *substance* is a placeholder.

Concretely:

- **What is real (✅ SHIPPED):** the record exists, has the right seven fields, is written on
  every recommendation, is read back, and is rendered to a reviewer. The plumbing is complete.
- **What is a placeholder (✅ shape, not real reasoning):** the `evidence[]` entries and the
  `confidence` object are hand-authored literals at `routes.ts:1123-1130`, keyed off one
  metric. They are not the output of weighing multiple sources against each other.

The upgrade — replacing those literals with genuine, weighted, multi-source reasoning — is
**🔶 BUILT (UNWIRED)** work. The code to do it already exists and is unit-tested; it simply
is not yet wired into the live write path. Two engines are waiting:

- The **`BrainEvidenceEngine`** gathers real `EvidenceRef` lists — weighted references drawn
  from marketing rollups, learned patterns, and prior experience, rather than a single ROAS
  literal. Its design, its `gather()` contract, and how it is to be wired in are documented in
  [`../1-why-contract/EVIDENCE_ENGINE.md`](../1-why-contract/EVIDENCE_ENGINE.md).
- The **`HeuristicConfidenceEngine`** computes a confidence score and a reason string by
  blending evidence strength, breadth, and prior success — not by echoing one number. Its
  model, and why a computed score is still not "truth," are documented in
  [`../1-why-contract/CONFIDENCE_MODEL.md`](../1-why-contract/CONFIDENCE_MODEL.md).

When those engines are wired into `routes.ts:1118`, the Decision Journal does not change
shape at all. The same seven-field record, the same read-back, the same render — but now the
`evidence[]` and `confidence` fields carry engine output instead of literals. **The journal
is the socket; the engines are the upgrade that plugs into it.** That is why this surface is
the anchor: it is already load-bearing, and it is ready to hold real reasoning the moment the
wiring lands.

> **Global architectural truth (stated honestly).** The live app builds its AI through the
> offline/live AI managers, not through the rich runtime reasoning pipeline that exists in the
> codebase. That pipeline — where the evidence and confidence engines are actually consumed —
> is instantiated only in test harnesses today. This is precisely why the evidence and
> confidence engines are 🔶 BUILT (UNWIRED) rather than ✅ SHIPPED: the code is real and
> tested, but no live route reaches it yet.

---

## 5. `attachOutcome` — closing the loop from decision to reality

The journal's third method, `attachOutcome` (`domains/executive-memory/src/memory.ts:54-80`),
is what makes the Decision Journal more than a write-once log. It binds a real-world
**outcome** back onto a decision that was recorded earlier.

This is the mechanical bridge between a *decision* and its *truth*. And that distinction is a
governing law of this book:

> - **Confidence** is the system's confidence in the recommendation, recorded at decision
>   time in the `confidence` field.
> - **Truth** is whether the recommendation actually turned out right, recorded after the
>   fact via `attachOutcome`.

**These are not the same thing.** A recommendation recorded with 95% confidence can attach a
failed outcome; a recommendation recorded with 40% confidence can attach the best outcome of
the quarter. The Decision Journal is the surface that lets AdOS *notice* that gap, because it
holds both the confidence-at-decision-time and the outcome-in-reality on the same record.

The mechanism to attach outcomes is ✅ SHIPPED. But noticing the gap is not the same as
closing it. **Narrowing the distance between confidence and truth over time — calibration — is
not Book C's job.** Learning from the accumulated decision-plus-outcome history is the work of
the learning book; Campaign Intelligence is the read-and-explain side, and it deliberately
stops at *recording* the loop rather than *closing* it. This document names the boundary and
holds it: `attachOutcome` opens the door; the calibration behind that door is out of scope
here.

This is also the deepest reason for the invariant that governs the whole book. Because
confidence is not truth, and because the past does not dictate the future:

> **Evidence is descriptive, not prescriptive.**

The evidence in a decision record *describes* what campaign memory has seen — it never
*prescribes* that the same decision must be made again. A high-confidence record grounded in
strong past evidence still records an alternative, still leaves the human the final call, and
still waits for a real outcome before anything is treated as true. The journal is built to
inform judgment, never to replace it.

---

## 6. Designing for durability (❌ ROADMAP)

The in-memory limitation (§2.1) is the most obvious thing to fix, and the most important not
to overclaim. What follows is **specification, not shipped behavior**. None of this section
carries a code citation, because none of it is implemented — that is the honest tier
discipline of this book.

A durable Decision Journal (❌ ROADMAP) would need:

1. **Persistence behind the same interface.** The three-method contract — `record`,
   `history`, `attachOutcome` — is the right abstraction and would not change. A durable
   implementation would satisfy the exact same interface as `InMemoryDecisionJournal`, so that
   the write path at `routes.ts:1118` and the read path at `routes.ts:832` are untouched.
   Persistence rides underneath the interface, next to the existing artifact repositories
   rather than replacing them.
2. **Durable outcome attachment.** `attachOutcome` only earns its keep across process restarts
   if the decision it targets still exists after a restart. Durability and the confidence-vs-
   truth loop are the same requirement viewed twice: you cannot compare confidence to a truth
   that arrives weeks later if the decision was lost at the last deploy.
3. **Local-first, and only local.** Any persistence stays inside the 100% local, offline-first
   boundary: on-device storage, no cloud, no external API, no per-token billing, no vendor
   telemetry. The Decision Journal records the agency's own decisions about the agency's own
   campaigns; that data never leaves the machine. Durability must not become a backdoor for
   any of that.
4. **Copy-only, human-sovereign, unchanged.** Durability changes *where* records live, not
   *what* they are or *who decides*. The record still holds copy-only campaign reasoning, and
   the human still approves or rejects at the mission detail page. Persistence adds memory; it
   removes no sovereignty.

Stated plainly so no reader can mistake the tier: **the Decision Journal is not durably
persisted today.** Designing durability is roadmap; claiming it as shipped would be exactly
the kind of overstatement a trust surface cannot afford.

---

## 7. How a reviewer actually uses the surface (✅ SHIPPED)

The abstract chain and the field table matter only if they add up to a faster, more confident
human decision. Here is the concrete flow the shipped surface enables.

A reviewer opens a mission. `renderLearning` (`apps/web/src/views/pages.ts:294-297`) has
already pulled the most recent decision back from the journal (`routes.ts:832`) and mapped it
into the view the page shows (`routes.ts:833-841`), with the confidence score surfaced
(`routes.ts:837`). So without navigating anywhere else, the reviewer sees, on one page:

1. the recommendation the system made,
2. the evidence offered for it,
3. how confident the system was, expressed as a score and a reason, and
4. the alternative that was considered and rejected.

The reviewer's job is then a comparison, not a reconstruction. Instead of asking "do I believe
this recommendation, and can I reconstruct the reasoning that would justify it?", the reviewer
asks "does the written evidence and the stated confidence support this, and do I agree with the
rejected alternative being rejected?" The second question is faster to answer than the first,
and it is auditable — another reviewer, or the client, can be shown the same record.

This is the mechanism behind the value contribution. The surface does not approve anything;
the human does. It never auto-approves, and it is not designed to — the human-sovereign
boundary means the journal *informs* the reviewer's decision and never *makes* it. What the
surface removes is the re-derivation tax, and that is where reviewer decision time is actually
cut.

It is also, quietly, the difference between AdOS and a generic language-model tool. A generic
tool hands the reviewer a recommendation and asks for trust. The Decision Journal hands the
reviewer a recommendation *and its justification* and asks for judgment. The first is a leap;
the second is a review. Agencies win and keep accounts on the strength of being able to show a
client the second thing.

---

## 8. Tier summary

| Capability | Citation | Tier |
| --- | --- | --- |
| `InMemoryDecisionJournal` store (`record`/`history`/`attachOutcome`) | `domains/executive-memory/src/memory.ts:54-80` | ✅ SHIPPED (in-memory) |
| Journal instantiated live | `apps/web/src/app.ts:91` | ✅ SHIPPED |
| Write decision record (7 fields) | `apps/web/src/routes.ts:1118` | ✅ SHIPPED |
| Read decision back (`history k:1`) | `apps/web/src/routes.ts:832` | ✅ SHIPPED |
| Map to `LearningView` | `apps/web/src/routes.ts:833-841` | ✅ SHIPPED |
| Confidence score displayed | `apps/web/src/routes.ts:837` | ✅ SHIPPED |
| Render on mission detail (`renderLearning`) | `apps/web/src/views/pages.ts:294-297` | ✅ SHIPPED |
| Inline evidence/confidence literals (placeholder substance) | `apps/web/src/routes.ts:1123-1130` | ✅ shape only |
| Real evidence via `BrainEvidenceEngine` | see [`EVIDENCE_ENGINE.md`](../1-why-contract/EVIDENCE_ENGINE.md) | 🔶 BUILT (UNWIRED) |
| Real confidence via `HeuristicConfidenceEngine` | see [`CONFIDENCE_MODEL.md`](../1-why-contract/CONFIDENCE_MODEL.md) | 🔶 BUILT (UNWIRED) |
| Contract fields 6 & 7 (brand rules / memory consulted) stored on record | — | ❌ ROADMAP |
| Durable persistence of decisions & outcomes | — | ❌ ROADMAP |

---

## 9. What this document does and does not claim

**Claims (✅):** AdOS ships a live, round-trip Decision Journal. Every recommendation on a
mission is recorded with its decision, evidence, alternatives, chosen/rejected pair, and
confidence; that record is read back and rendered to a human reviewer on the mission detail
page; and outcomes can be attached to it after the fact. This is a genuine, reachable "why did
it decide this?" surface.

**Does not claim:** that the recorded evidence and confidence are the product of real reasoning
(they are hand-rolled literals today — 🔶 to upgrade), that decisions survive a restart (they
do not — ❌ to durability), that the confidence figure is truth (it is not — that is the
learning book's calibration work), or that all eight contract fields are stored (fields 6 and
7 are not yet — ❌).

The Decision Journal is the anchor of Campaign Intelligence precisely because it is real *and*
honestly bounded. It is the socket that real evidence and real confidence will plug into
without changing shape, the surface that lets a reviewer approve faster because the reasoning
is already written down, and the ledger that will one day hold both a decision's confidence and
its outcome side by side — so the system can learn the difference. It does all of that while
holding the invariant that keeps it trustworthy: evidence is descriptive, not prescriptive.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
