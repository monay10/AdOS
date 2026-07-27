# Provenance & Lineage — Can We Trace an AI Output Back to What Produced It?

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. The governing
> document is
> [`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. The question this document answers

Campaign Intelligence — the Trust Layer of AdOS — answers exactly one question:

> **"Why did the AI recommend this?"**

An explanation is only as trustworthy as its ability to name the *actual* inputs that produced
the output it is explaining. That is what provenance is: the record that lets a reviewer, an
auditor, or a client take a specific artifact — a headline, a creative set, a campaign report —
and trace it back to what made it. Not "the AI generated this," but "*this* task, run by *this*
capability, on *this* model and engine, from *this* brief, shaped by *these* rules and *this*
memory, under *this* version of the prompt."

This document is scrupulously honest about how far AdOS can answer that today. The short
version: **an output can be traced to the model and engine that produced it, and to the brief
and campaign it belongs to — but not yet to the brand, mission, company DNA, memory, or
prompt-version context that shaped it.** The first two are shipped. The last is roadmap. A
trust surface that overstates its own provenance is worse than useless, so this document draws
the line exactly where it actually sits.

**Value contribution.** Provenance is what converts a plausible-looking output into a
*defensible* one. An agency that can trace a recommendation to its real inputs can stand behind
it in front of a client, and a reviewer who can see where an artifact came from approves it
without re-litigating its origin. That directly **wins and retains accounts** (a generic LLM
tool cannot show the client the lineage of a headline; AdOS can show the model, the brief, and
the campaign it belongs to) and directly **cuts reviewer decision time** (tracing beats
guessing). The deeper the provenance record grows, the wider that moat gets — which is exactly
why the gaps in §4 are worth naming precisely rather than papering over.

---

## 2. What ships today: model & engine provenance (✅ SHIPPED, but shallow)

Every generated artifact in AdOS carries a provenance stamp. The `AIProvenance` record is
attached to creative output at `domains/creative-studio/src/creative/creative-set.ts:53-59`,
and its shape is:

```
AIProvenance = { taskId, capability, model, engine, latencyMs }
```

Each field answers a distinct "which" about the *act of generation*:

| Field | Answers | What it lets you trace |
| --- | --- | --- |
| `taskId` | Which task run produced this? | The specific invocation, not just the type. |
| `capability` | Which capability was asked to do it? | The named ability that was exercised. |
| `model` | Which model answered? | The generative model behind the output. |
| `engine` | Which execution engine ran it? | The runtime that carried the task. |
| `latencyMs` | How long did it take? | The cost/latency profile of that run. |

This is real, shipped, and reachable from the live app. The provenance is surfaced to the
human as a **model badge** in the UI at `apps/web/src/routes.ts:572`,
`apps/web/src/routes.ts:594`, `apps/web/src/routes.ts:617`, and `apps/web/src/routes.ts:724`.
A reviewer looking at a generated artifact sees, attached to it, which model and engine
produced it. That is genuine provenance: the output is not anonymous.

### 2.1 What "shallow" means, precisely

The word *shallow* is doing honest work here, not hedging. `AIProvenance` answers the
**machine** question completely — *what mechanism produced this bytes-on-screen output?* — and
it answers the **meaning** question not at all — *what campaign knowledge shaped what the output
actually said?*

Put concretely: the model badge tells you a headline was written by a given model through a
given engine in a given number of milliseconds. It does **not** tell you which brief the
headline was answering, which brand rules constrained its tone, which prior campaigns in memory
informed it, or which version of the prompt template framed the request. Those are the inputs
that determine *what the headline says*, and none of them live in `AIProvenance` today.

So the shipped record traces an output to its **producer** (model + engine) but not to its
**influences** (brief + brand + mission + memory + prompt version). Both are provenance; only
the first is stamped. Holding that distinction is the whole point of this document.

### 2.2 Why even the shallow stamp earns its place

It would be a mistake to read *shallow* as *worthless*. Producer-level provenance already does
real work that a generic tool cannot. When two artifacts differ, the badge tells a reviewer
whether they came from different models or the same one — a question that matters the moment an
agency runs a comparison or a fallback. When latency spikes, `latencyMs` on the record localizes
it to a specific task run rather than a vague "the AI was slow." And when a client asks the
irreducible question — "is this actually machine-generated, and by what?" — the answer is on the
artifact, not in someone's memory of the session. The stamp is the floor of provenance, and a
floor you can stand on is worth more than a ceiling you only describe. The rest of this document
is about raising the ceiling without ever pretending the floor is higher than it is.

> **Global architectural truth (stated honestly).** The live app builds its AI through the
> offline/live AI managers, not through the rich runtime reasoning pipeline that exists
> elsewhere in the codebase. `AIProvenance` is populated on the shipped generation path, which
> is why it is ✅ SHIPPED — but its shallowness is not an accident of wiring; the richer
> influence-level provenance described in §4 is genuinely unbuilt, not merely unwired.

---

## 3. Structural lineage: brief → campaign → report (✅ SHIPPED, but thin)

Beyond the per-artifact model stamp, AdOS ships a second, coarser kind of provenance:
**structural lineage** — the record of how the major campaign objects relate to each other.

### 3.1 The creative set remembers its brief and its context (✅ SHIPPED)

A generated `CreativeSet` does not float free of its origin. It stores both the `briefId` it
was generated from and the full `context` object it was generated under, at
`domains/creative-studio/src/creative/creative-set.ts:65-66`. So from any creative set, you can
recover the brief that requested it — the first real "trace this output back to its input" link
in the product.

Two things are worth drawing out about this pairing:

- **`briefId` is a durable back-pointer.** It ties a creative artifact to the brief that
  commissioned it, so "which brief produced this creative set?" is answerable from the artifact
  alone, without a second lookup.
- **`context` is the raw material for deeper provenance.** The full context under which the set
  was generated is stored alongside the brief pointer. This matters enormously for §4: the
  context that *shaped* the output is being *retained* even though it is not yet being
  *surfaced* as provenance. The material for richer lineage is already on the record; what is
  missing is the structured provenance schema that reads from it.

### 3.2 The knowledge graph links mission → brief → campaign → report (✅ SHIPPED, thin)

At the campaign level, the learning route builds a small **knowledge graph** that connects the
major objects of a campaign's life. At `apps/web/src/routes.ts:1165-1170`, the app constructs
relations linking mission → brief → campaign → report, using the relation labels
`planned_by`, `ran`, and `produced`. In plain terms:

- a mission is **planned_by** a brief,
- a campaign **ran** under that plan,
- and a report was **produced** by that campaign.

Walk those edges and you have end-to-end structural lineage: from the report a client is
reading, back through the campaign that generated it, to the brief that planned it, to the
mission it served. That is a real, shipped chain of custody at the object level.

### 3.3 Why "thin"

This lineage is honest but coarse. It links *objects* (this report came from this campaign came
from this brief) but not *influences* (this report's specific recommendation was shaped by these
three prior finance campaigns in memory and this brand tone rule). It tells you the boxes and the
arrows between them; it does not tell you the reasoning that flowed along the arrows. It is the
skeleton of provenance — accurate as far as it reaches — with the connective tissue of
context-level lineage still to be added. That connective tissue is §4.

---

## 4. The honest gap: prompt version & shaping context are not traced (❌ ROADMAP)

This is the single most important honesty note in this document, and it must not be softened.

The provenance that ships today can trace an output to its **model** and its **brief**. It
cannot trace an output to two of the things that most determine *what the output actually says*:

1. **The prompt version** that framed the request, and
2. **The brand / mission / company-DNA / memory context** that shaped the substance.

### 4.1 The prompt version is not captured (❌, with a 🔶 registry waiting)

The generation services pass `promptRef` **hardcoded to v1** at
`domains/creative-studio/src/creative/service.ts:45`. Every output is stamped, in effect, "made
with prompt v1" — regardless of what prompt actually ran — because the reference is a constant,
not a real version pointer. So the provenance record cannot answer "which version of the prompt
produced this headline?", because the value is fixed rather than tracked.

This is not for lack of a mechanism. A **Prompt Registry** exists that versions prompt
templates, scores them, and selects the best one:

- versioned templates live at `domains/prompt-registry/src/in-memory-prompt-registry.ts:18`,
- each version accrues a score via an exponential moving average —
  `score = prior * 0.8 + reward * 0.2` — at
  `domains/prompt-registry/src/in-memory-prompt-registry.ts:73`,
- and `selectActive` picks the highest-scoring version at
  `domains/prompt-registry/src/in-memory-prompt-registry.ts:79`.

But the registry is **🔶 BUILT (UNWIRED)**: it is not instantiated in the live app, and because
services pass a hardcoded `promptRef`, the version that actually governs an output is neither
selected by the registry nor recorded on the artifact. The capability to version and identify
prompts is built; the wire that would let provenance record *which* version produced *which*
output is not connected. Until it is, prompt-version provenance is honestly ❌ ROADMAP on the
shipped path.

### 4.2 The shaping context is retained but not traced as provenance (❌ ROADMAP)

The context that shapes an output — the brand rules that constrained its tone, the mission it
served, the company DNA it expressed, the campaign memory it drew on — is **retained** on the
creative set's `context` field (`creative-set.ts:65-66`, §3.1). But it is not *structured into a
provenance record*. `AIProvenance` (§2) has no field for it. So while the raw context survives
on the artifact, there is no provenance schema that says "this headline consulted these memories
and checked against these brand rules." The data is present; the traceability is absent.

### 4.3 The gap, stated as one sentence

> **Trace this headline back to the brief + brand + memory + prompt-version that produced it:
> brief and model, yes; brand, mission, memory, and prompt-version, not yet.**

That is the exact boundary. Everything above the line is shipped provenance you can rely on in
front of a client. Everything below it is roadmap you must not claim. This document exists to
make that line unmissable.

---

## 5. Why provenance is load-bearing for the Trust Layer

Provenance is not a nice-to-have adjacent to explainability — it is a *precondition* of it. The
governing law of this book is the Evidence First Law: nothing may be presented as a
recommendation unless it can show its evidence. But evidence you cannot trace is evidence you
cannot trust. An explanation that says "this recommendation is grounded in your campaign memory"
is only trustworthy if you can point to *which* memory, under *which* prompt, filtered by *which*
brand rules. Provenance is the mechanism that makes that pointing possible.

This is where provenance connects directly to the eight-field Explainability Contract — the
minimum every AI output must one day support. Two of those fields are, at bottom, provenance
questions:

- **Field 6 — Brand rules checked.** To fill this field truthfully, the system must record
  *which* brand rules were evaluated when the output was shaped. That is a provenance record of
  the brand context — precisely the context retained on `context` (§4.2) but not yet structured
  as provenance.
- **Field 7 — Memory consulted.** To fill this field truthfully, the system must record *which*
  memories informed the output. That, too, is a provenance record — of the memory context that
  shaped generation.

Neither field can be honestly populated from `AIProvenance` as it ships today, because today's
record stops at model and engine. **Completing those two contract fields is the same
engineering task as deepening provenance from producer-level to influence-level.** The full
definition of the contract, its role as the future UI standard, and the honest tier of each of
its eight fields are owned by the Why Contract part of this book; see
[`../1-why-contract/EXPLAINABILITY_MODEL.md`](../1-why-contract/EXPLAINABILITY_MODEL.md). This
document's job is to name the provenance record those fields depend on, and to be exact about
which parts of it are real.

Because provenance underwrites evidence, it also inherits the invariant that governs the whole
book:

> **Evidence is descriptive, not prescriptive.**

A provenance record *describes* the inputs that shaped an output — the brief, the model, one day
the memory and the brand rules. It never *prescribes* that the same inputs must force the same
output next time. Tracing a headline to the three prior finance campaigns that informed it
explains where it came from; it does not command that the next headline copy it. Provenance
makes the past *legible*, never *binding*.

---

## 6. Designing the richer provenance record (❌ ROADMAP)

What follows is **specification, not shipped behavior**. None of this section carries a code
citation for the new fields, because none of the influence-level provenance is implemented —
that is the honest tier discipline of this book. The existing shipped pieces it would build on
are cited; the new record is design.

The target is a provenance record that traces an output to both its **producer** and its
**influences**. Building on the shipped `AIProvenance` shape (`creative-set.ts:53-59`) and the
retained `context` (`creative-set.ts:65-66`), the richer record would add:

1. **A real prompt-version reference.** Replace the hardcoded `promptRef` at
   `service.ts:45` with the version actually selected by the Prompt Registry —
   `selectActive` at `in-memory-prompt-registry.ts:79` — and record *that* version on the
   artifact. This requires wiring the registry (🔶 → ✅) so the version pointer is real rather
   than constant. Once recorded, "which prompt produced this?" becomes answerable, and the
   registry's version scores (`in-memory-prompt-registry.ts:73`) become traceable to specific
   outputs.
2. **Structured context references, not just retained context.** Read the retained `context`
   into named provenance fields: which brand rules were in force, which mission the output
   served, which company-DNA elements it expressed, which memories it consulted. The raw
   material already survives on `context`; what is missing is the schema that lifts it into a
   queryable provenance record.
3. **The two contract fields, filled from that record.** With structured context refs in place,
   contract field 6 (Brand rules checked) and field 7 (Memory consulted) draw their values
   directly from the provenance record rather than being left blank. Provenance and contract
   completion become one deliverable, as argued in §5.
4. **Lineage edges enriched, not replaced.** The knowledge-graph relations
   (`routes.ts:1165-1170`) stay as the object-level skeleton; the richer provenance record hangs
   the influence-level detail on those same edges. A report still `produced` by a campaign — but
   now each recommendation in it carries the memory and brand-rule refs that shaped it.

The design principle is that **the record deepens; the shipped shapes do not break.**
`AIProvenance` gains fields, it is not replaced. The knowledge graph gains detail, it is not
rebuilt. The creative set already retains the context, so no new data has to be captured — only
structured. Provenance grows by reading more from what is already stored, not by instrumenting
new collection.

### 6.1 The ordering of the work, and why it matters

These four moves are not independent, and stating their order keeps the tier discipline honest.
Wiring the Prompt Registry (move 1) is the prerequisite that turns a hardcoded constant into a
real version pointer; until that lands, prompt-version provenance stays ❌ no matter what else is
built. Structuring the retained context (move 2) is the prerequisite for the two contract fields
(move 3), because a field cannot be filled from a record that does not yet name its parts. And
enriching the lineage edges (move 4) is meaningful only once moves 1 and 2 give the edges
something richer to carry. So the honest sequence is: wire the version pointer, structure the
context, fill the contract fields from it, then hang the detail on the graph. Each step promotes
a specific capability from 🔶 or ❌ toward ✅, and none of them can be truthfully claimed as
shipped before the step beneath it is done.

The reason to spell this out is that provenance is exactly the kind of feature that invites
overclaiming. "We trace outputs to their inputs" is easy to say and hard to earn. The sequence
above is what earning it actually looks like — and every intermediate state on that path has an
honest tier, which this book insists on naming rather than blurring into a single aspirational
"traceable."

---

## 7. Boundaries this document holds

Provenance is a place where it would be tempting to reach outside the product's boundaries — to
enrich lineage with external data, to phone home with usage telemetry, to cross-reference other
tenants. AdOS does none of that, and the richer record in §6 must not either.

- **100% local, own-data only.** Every provenance record — the model stamp, the brief pointer,
  the knowledge-graph edges, and the influence-level refs designed in §6 — describes the
  agency's own artifacts, produced from the agency's own briefs, on the agency's own machine.
  **No external data** enters the lineage: no connectors, no crawlers, no ingestion of anyone
  else's campaigns. Provenance traces what AdOS produced from what the agency gave it, and
  nothing beyond that.
- **No vendor telemetry.** The provenance record exists to be shown to the *agency and its
  client*, never reported to a vendor. `latencyMs` and model identity are local diagnostics on a
  local artifact, not a metrics feed leaving the machine. Deepening provenance adds detail the
  reviewer can see; it never adds a channel out.
- **Copy-only.** The artifacts being traced are copy — briefs, headlines, reports, narratives.
  Provenance records the lineage of text, not of image, vision, or speech generation, because
  those are not what the product produces.
- **Human-sovereign.** Provenance informs the reviewer; it never auto-approves on the strength
  of a clean lineage. A fully-traced output still goes to a human for the decision. Richer
  provenance makes the human's judgment better-informed; it never substitutes for it.

Restating the invariant in the language of this boundary: because **evidence is descriptive, not
prescriptive**, a provenance record — however deep — describes the inputs behind an output and
leaves the decision with the human. Traceability is there to make judgment auditable, not to
make it automatic.

---

## 8. Tier summary

| Capability | Citation | Tier |
| --- | --- | --- |
| `AIProvenance` = {taskId, capability, model, engine, latencyMs} on artifacts | `domains/creative-studio/src/creative/creative-set.ts:53-59` | ✅ SHIPPED (shallow) |
| Model badge rendered in the UI | `apps/web/src/routes.ts:572`, `:594`, `:617`, `:724` | ✅ SHIPPED |
| Creative set stores `briefId` + full `context` | `domains/creative-studio/src/creative/creative-set.ts:65-66` | ✅ SHIPPED |
| Knowledge graph: mission → brief → campaign → report (`planned_by`/`ran`/`produced`) | `apps/web/src/routes.ts:1165-1170` | ✅ SHIPPED (thin) |
| Prompt version recorded on output | `promptRef` hardcoded — `domains/creative-studio/src/creative/service.ts:45` | ❌ ROADMAP |
| Prompt Registry: versioned templates | `domains/prompt-registry/src/in-memory-prompt-registry.ts:18` | 🔶 BUILT (UNWIRED) |
| Prompt Registry: EMA score `prior*0.8 + reward*0.2` | `domains/prompt-registry/src/in-memory-prompt-registry.ts:73` | 🔶 BUILT (UNWIRED) |
| Prompt Registry: `selectActive` = highest score | `domains/prompt-registry/src/in-memory-prompt-registry.ts:79` | 🔶 BUILT (UNWIRED) |
| Brand / mission / company-DNA / memory context traced as provenance | — | ❌ ROADMAP |
| Contract fields 6 & 7 (brand rules checked / memory consulted) filled from provenance | see [`../1-why-contract/EXPLAINABILITY_MODEL.md`](../1-why-contract/EXPLAINABILITY_MODEL.md) | ❌ ROADMAP |

---

## 9. What this document does and does not claim

**Claims (✅):** AdOS stamps every generated artifact with an `AIProvenance` record naming the
task, capability, model, engine, and latency, and surfaces the model as a badge in the live UI.
Creative sets retain the brief they came from and the full context they were generated under.
The app builds an object-level knowledge graph linking mission, brief, campaign, and report. So
an output *can* be traced to the model and engine that produced it, and to the brief and campaign
it belongs to.

**Does not claim:** that provenance captures the prompt version (it is hardcoded — 🔶 registry
waiting, ❌ on the shipped path), that it captures the brand, mission, company-DNA, or memory
context that shaped the output (that context is retained but not structured as provenance — ❌),
or that the eight-field contract's "Brand rules checked" and "Memory consulted" fields can be
filled from today's record (they cannot — ❌). The honest one-line boundary stands: **brief and
model, yes; brand, mission, memory, and prompt-version, not yet.**

Provenance is the Trust Layer's foundation because an explanation is only as trustworthy as its
traceable inputs. AdOS ships the producer-level half of that foundation today and specifies the
influence-level half honestly. The richer record deepens what is already stored rather than
collecting anything new, completes two contract fields as it lands, and holds every boundary —
local, own-data, copy-only, human-sovereign — while doing so. Through all of it, the invariant
governs: evidence is descriptive, not prescriptive.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
