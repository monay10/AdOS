# Recording Pipeline — How a Finished Campaign Enters Performance Memory

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`PERFORMANCE_MEMORY_CONSTITUTION.md`](PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. What this document covers

This is the **write side of the raw layer**. When a campaign finishes, AdOS runs one
synchronous action that fans a Performance Record out into the company's memory stores. That
action is real, wired, and running in the live web application today. This document describes
exactly what it does, exactly what it writes, and — with equal care — what it does **not** do.

The recording machinery is the first mandatory hop of the full pipeline:

```
Campaign → Performance Record → Pattern → Evidence → Recommendation → Human → Next Campaign
             ▲
             └── this document owns THIS hop only (Campaign → Performance Record)
```

Everything downstream of the record — summarizing many records into per-dimension
aggregates, forming recommendations from those aggregates, and maintaining the memory over
time — belongs to later parts of Book D. Here we are concerned solely with the moment a
finished campaign becomes durable(-ish) evidence in the raw stores.

Two things must be true at once, and this document holds both without flinching:

1. **The write fan-out is genuinely shipped.** A completed campaign really does produce
   journal entries, an executive-memory entry, an experience record, a pattern capture, and
   a set of knowledge-graph nodes and relations. This is not a mock.
2. **What lands there is not yet memory the company can trust across time.** The stores are
   in-memory and volatile, the aggregation layer that would turn raw records into evidence is
   never invoked at record time, and the record is written only when a human manually presses
   a button. These are not bugs to hide; they are the honest edges of a first shipped layer.

---

## 2. The recording action

### 2.1 What it is — ✅ SHIPPED

The recording action is a single function, `recordLearning`, defined at
`apps/web/src/routes.ts:1092`. Despite the code identifier, it does not make the AI "learn"
anything — it is a **write fan-out**. It takes a finished mission and its campaign report and
copies the salient facts of that campaign into the company's memory stores. It asserts no
conclusions; it records what happened.

We name `recordLearning` throughout this document as **the recording action**, because that
is what it is: a recorder, not a teacher. The AI never says it learned; the company's memory
simply grew by one campaign.

### 2.2 Where it is wired — ✅ SHIPPED

The recording action is reachable in the live application. It is invoked when a POST request
carries the `'learn'` route action against a mission
(`action === 'learn' && method === 'POST'`, `apps/web/src/routes.ts:763`). That route handler
is the only live caller, and it calls the recording action directly. There is no background
job, no queue, and no scheduler between the request and the write — the fan-out runs inline,
synchronously, on the request that triggers it.

### 2.3 Idempotency — ✅ SHIPPED

The action is idempotent by mission completion state. Before it writes anything, it checks
whether the mission is already completed and **returns early if so**
(`apps/web/src/routes.ts:1096`). Recording the same finished campaign twice does not double
its footprint in memory: the second call is a no-op. This matters because the trigger is a
plain POST (see §5.3) — without the guard, a double-submit or a browser retry would inflate
the raw stores with duplicate evidence and silently corrupt any future sample-size counting.

The guard is deliberately coarse: it keys on the mission's own completion flag, not on a
content hash of the record. That is sufficient for the one-record-per-campaign contract this
layer promises, and no more.

---

## 3. The write fan-out

When the recording action runs to completion, it performs **one synchronous flow** of writes.
Every write listed below is **✅ SHIPPED** and reachable from the live `'learn'` POST path.
They are enumerated here exactly, with their live citations, so that nothing is implied to do
more than it does.

### 3.1 Decision Journal — ✅ SHIPPED

`journal.record` (`apps/web/src/routes.ts:1118`) writes a decision-journal entry for the
campaign. This is the record of *what was decided and what came of it* — the same journal
Book C reads from on the explanation side. On the write side, it is one entry per completed
campaign.

### 3.2 Executive Memory — ✅ SHIPPED

`execMemory.remember` (`apps/web/src/routes.ts:1136`) writes an executive-memory entry. This
is the store an executive-context assembler *would* recall from when priming a future
generation — though, as §4.3 notes, no live generation path reads it back today.

### 3.3 Experience Engine — ✅ SHIPPED

`brain.experience.record` (`apps/web/src/routes.ts:1146`) writes an experience record into the
company brain. An experience is the campaign framed as a reusable episode: the vertical it ran
in, the channels it used, and the KPI outcome it produced.

### 3.4 Pattern Library — ✅ SHIPPED

`brain.patterns.capture` (`apps/web/src/routes.ts:1156`) captures a pattern into the pattern
library. Capture is an *aggregation* write, not a winner-selection: it deposits the campaign's
contribution so that many captures can later be summarized. It never decides that anything is
"best" — that judgement, if it ever exists, belongs to the recommendation layer.

### 3.5 Knowledge Graph — ✅ SHIPPED

The recording action writes to the knowledge graph in two shapes:

- **Three node upserts** — `brain.graph.upsertNode` ×3 (`apps/web/src/routes.ts:1165-1167`).
  These insert-or-merge the entities the campaign touched (for example the campaign itself and
  its neighbours) as graph nodes.
- **Three relations** — `brain.graph.relate` ×3 (`apps/web/src/routes.ts:1168-1170`), forming
  the edges `planned_by`, `ran`, and `produced`. These connect the campaign node to the
  actors and outputs it involved.

The upsert is a genuine live merge of node properties, not a blind overwrite — a repeated
upsert of the same node folds its properties together rather than clobbering them. Within the
raw layer, this is the one place a real merge happens at write time.

### 3.6 Emitted events — ✅ SHIPPED, but display-only

After the writes, the recording action emits **five events**
(`apps/web/src/routes.ts:1173-1177`):

| Event | Marks |
| --- | --- |
| `DECISION_JOURNALED` | a journal entry was written |
| `MEMORY_UPDATED` | an executive-memory entry was written |
| `EXPERIENCE_RECORDED` | an experience was recorded |
| `PATTERN_CAPTURED` | a pattern was captured |
| `BRAIN_ENRICHED` | the graph was updated |

**These events feed exactly one consumer: the dashboard activity feed**
(`apps/web/src/app.ts:120`). They are notifications for a human watching the screen — nothing
more. **No subscriber writes to any store in response to them.** They do not trigger
aggregation, they do not persist anything, and they do not fan out further. It would be easy
to read the event names as "and then the system reacts"; it does not. The events are the
system telling a person *"this just happened"*, and the story ends there.

### 3.7 Fields derived at record time — ✅ SHIPPED

The record the action builds is deliberately narrow. It is derived at record time
(`apps/web/src/routes.ts:1106-1116`) and contains:

- **KPI facts** — `roas`, `roi`, and `ctr`, each computed from the campaign report via
  `report.kpi(...)` (`apps/web/src/routes.ts:1108-1110`).
- **Channels** — the list of channel strings, from
  `campaign.content.channels.map(c => c.channel)` (`apps/web/src/routes.ts:1111`).
- **Vertical** — the client's industry, `client.industry`
  (`apps/web/src/routes.ts:1106`), falling back to `'general'` when absent.
- **Descriptive strings** — the campaign name, the mission brief (`mission.brief`), and the
  won / chosen / recorded-outcome strings that summarize the campaign.
- **A timestamp** — `at` (`apps/web/src/routes.ts:1116`), stamping when the record was made.

That is the whole of what is captured. Three KPI numbers, a vertical, a set of channel
strings, some human-readable text, and a time. The much larger field set a Performance Record
*should* eventually hold — creative, audience, offer, hook, headline, CTA, budget, season, day,
hour, and more — is **❌ ROADMAP** on the write side and is treated field-by-field in the
sibling [`PERFORMANCE_RECORD.md`](PERFORMANCE_RECORD.md). This document does not restate that
field ledger; it only marks that the recorder writes the short list above and no more.

---

## 4. Critical honest caveats

The fan-out above is real. Three properties of it are equally real and must be stated plainly,
because each one bounds how much the recorded data can be trusted today.

### 4.1 The aggregation rollup is never invoked here — 🔶 BUILT (UNWIRED)

The company brain has a rollup layer: `enrich({ kind: 'marketing' })` routes into
`mergeMarketing` (`domains/company-brain/src/in-memory-company-brain.ts:100`), which folds a
new campaign's KPIs into a sample-weighted running average per vertical. This is the
machinery that would turn a heap of raw records into an *aggregate* — the middle layer of
Law 2.

**The recording action never calls it.** `enrich` has no non-test caller anywhere in the
system. The recorder writes into the raw stores — journal, executive memory, experience,
patterns, graph — and stops. Nothing rolls those raw writes up into per-dimension aggregates
at record time.

The consequence is precise: **records land in the raw stores but are never aggregated.** The
experience engine accumulates episodes; the pattern library accumulates captures; the graph
accumulates nodes and edges. But the sample-weighted marketing aggregate that a recommendation
would read from is never advanced by a completed campaign. The raw pile grows; the summary
does not. Turning that summary on at record time is the central design item of this part
(see §6.1), and the aggregation layer itself is documented in Part 2's
[`PERFORMANCE_AGGREGATIONS.md`](../2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md).

### 4.2 Durability — the derived memory is volatile — ✅ SHIPPED reality

The stores the recording action writes to are **in-memory and volatile, even in production**:

- the company brain (`apps/web/src/app.ts:89`),
- executive memory (`apps/web/src/app.ts:90`), and
- the decision journal (`apps/web/src/app.ts:91`).

These are process-lifetime objects. They are not swappable for a durable backend and they hold
their contents only for as long as the server process lives. On restart, everything the
recording action wrote is gone.

There is exactly one exception, and it is not the derived memory. **Campaign Reports persist.**
When `DATABASE_URL` is set (`apps/web/src/main.ts:52`), reports are written through
`SqlCampaignReportRepository` (`apps/web/src/db/repositories.ts:193`) to Postgres. The report —
the raw campaign result — survives. The *memory derived from it* — the journal entry, the
experience, the pattern, the graph nodes — does not.

Stated bluntly: **the "memory" this pipeline builds is lost on restart today.** The reports
that would let it be rebuilt persist, but nothing rebuilds it from them. Making the derived
memory durable is a design item (see §6.2); the archive-and-durability problem in full is
Part 4's
[`ARCHIVE_AND_DURABILITY.md`](../4-memory-maintenance/ARCHIVE_AND_DURABILITY.md).

### 4.3 Recording is a manual action, not a completion trigger — ✅ SHIPPED reality

Nothing records a campaign automatically. The recording action fires only when a human sends
the `'learn'` POST against a mission (`apps/web/src/routes.ts:763`). There is no completion
webhook, no lifecycle hook on the campaign finishing, and no reconciliation job that scans for
finished-but-unrecorded campaigns. A campaign can complete and simply never enter memory
because no one pressed the button.

This makes **recording coverage a function of human diligence**, not of system guarantee. Any
downstream sample size — "based on N campaigns" — is therefore a count of *recorded* campaigns,
which may be fewer than the campaigns that actually ran. A completion trigger is a design item
(see §6.3).

### 4.4 What the caveats add up to

None of the three caveats contradicts §3. The writes happen. But taken together they mean the
raw layer today is **a real recorder feeding volatile, un-aggregated, manually-populated
stores**. That is an honest first rung: the machinery to record exists and runs; the machinery
to make the recording *last*, *summarize*, and *fire on its own* is design. Saying so is the
point — reality first, then the roadmap.

---

## 5. The pipeline, end to end

Putting §2–§4 together, one completed campaign flows like this:

```
Human presses "record" on a completed mission
        │  POST  action='learn'                         routes.ts:763
        ▼
recordLearning( mission, report, ... )                 routes.ts:1092
        │
        ├─ mission already completed?  ── yes ─▶ return early (no-op)   routes.ts:1096
        │        no
        ▼
Derive record fields (roas/roi/ctr, channels, vertical, at, text)   routes.ts:1106-1116
        │
        ▼   one synchronous flow of writes — all ✅ SHIPPED
        ├─ journal.record ..................... routes.ts:1118   (raw store, volatile)
        ├─ execMemory.remember ................ routes.ts:1136   (raw store, volatile)
        ├─ brain.experience.record ............ routes.ts:1146   (raw store, volatile)
        ├─ brain.patterns.capture ............. routes.ts:1156   (raw store, volatile)
        ├─ brain.graph.upsertNode ×3 .......... routes.ts:1165-1167 (raw store, volatile)
        └─ brain.graph.relate ×3 (planned_by/ran/produced)  routes.ts:1168-1170
        │
        ▼   five events — display only
        DECISION_JOURNALED · MEMORY_UPDATED · EXPERIENCE_RECORDED ·
        PATTERN_CAPTURED · BRAIN_ENRICHED                  routes.ts:1173-1177
        │
        └─▶ dashboard activity feed ONLY        app.ts:120   (no store subscriber)

── boundary of this document ──────────────────────────────────────────────
        ✗ no enrich() / mergeMarketing at record time     (🔶, §4.1)
        ✗ raw stores volatile on restart                  (§4.2)
        ✗ only the Report persisted to Postgres           repositories.ts:193
```

Read the diagram as a boundary marker. Above the line: shipped, synchronous, real. Below the
line: the three edges of §4.

---

## 6. The design — honestly tiered

The following are the intended next steps for the raw layer. They are design, not shipped
capability, and each is tagged. None of them is claimed to exist.

### 6.1 Trigger the rollup at record time — 🔶 BUILT (UNWIRED)

The rollup code already exists — `enrich({ kind: 'marketing' })` → `mergeMarketing`
(`domains/company-brain/src/in-memory-company-brain.ts:100`). The design is to **call it from
the recording action**, so that each completed campaign advances the sample-weighted per-vertical
aggregate at the same moment it lands in the raw stores. Because the merge is already written
and tested, this is a *wiring* task, not a *build* task — which is exactly why it is tagged
🔶 rather than ❌. Wiring it is what would make Law 2's middle layer live.

### 6.2 Make the derived memory durable — ❌ ROADMAP

Today the reports persist and the derived memory does not. The design is a durable backing for
the brain, executive memory, and journal — either a persistence adapter behind the same
interfaces, or a rebuild-on-boot step that replays the persisted reports back through the
recording action to reconstitute the volatile stores. No such durability exists for the derived
memory; it is **❌ ROADMAP**. The retention and durability design in full is Part 4's
[`ARCHIVE_AND_DURABILITY.md`](../4-memory-maintenance/ARCHIVE_AND_DURABILITY.md).

### 6.3 A completion trigger — ❌ ROADMAP

The design is to fire the recording action from the campaign-completion lifecycle rather than
from a human's button press — a completion hook, plus a reconciliation pass that finds
finished-but-unrecorded campaigns and records them. This would turn recording coverage from a
matter of diligence into a system guarantee. No such trigger exists; it is **❌ ROADMAP**. The
manual POST of §4.3 remains the only path today.

### 6.4 Capture the missing fields — ❌ ROADMAP

The recorder writes three KPIs, a vertical, and channel strings (§3.7). The design is to widen
the derived record toward the full Performance Record field set. That widening is specified,
field by field, in [`PERFORMANCE_RECORD.md`](PERFORMANCE_RECORD.md) and is **❌ ROADMAP** on
the write side; it is noted here only so the recording action's narrowness is understood as a
known gap, not an oversight.

### 6.5 Tier summary

| Design item | Tier |
| --- | --- |
| Roll up the marketing aggregate at record time (§6.1) | 🔶 BUILT (UNWIRED) |
| Durable derived memory (§6.2) | ❌ ROADMAP |
| Completion trigger + reconciliation (§6.3) | ❌ ROADMAP |
| Widen captured fields (§6.4) | ❌ ROADMAP |

---

## 7. Where this sits in the laws

### 7.1 Law 2 — this is the raw layer, and only the raw layer

Law 2 mandates three layers and forbids skipping the middle one:

```
Campaign Records  →  Aggregations  →  Recommendations
   (this doc)          (Part 2)          (Part 3)
```

The recording pipeline owns **the first arrow only** — `Campaign → Campaign Records`. It
deposits raw facts. It must never be read as producing an aggregate or a recommendation: it
does not summarize, it does not rank, and it does not conclude. The aggregation layer is
Part 2's subject
([`PERFORMANCE_AGGREGATIONS.md`](../2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md)); forming
recommendations from aggregates is Part 3's. Keeping recording strictly at the raw layer is
what preserves the ban on going `Campaign → Recommendation` directly — you cannot short-circuit
a middle layer the recorder was never allowed to touch.

### 7.2 Law 1 — memory is evidence, not knowledge

Everything the recording action writes is a **fact**: a ROAS number, a CTR, a vertical, the
channels used, the time it ran. None of it is a conclusion. The recorder never writes "video
wins" or "this vertical is strong" — those are interpretations that a later layer may form, and
only ever with an attached sample size. The raw store is a ledger of what happened, not a
verdict on what it means. This is why the fan-out captures numbers and strings, and emits only
notifications: a recorder that asserted conclusions would already be breaking Law 1 at write
time.

### 7.3 Laws 3 and 4 — set up here, enforced later

The recorder stamps every record with a timestamp (`at`, `apps/web/src/routes.ts:1116`) and
contributes one campaign toward a future sample count. It does not itself compute a
sample-size stamp (Law 3) or rank by freshness (Law 4) — those are downstream. But it is the
source of the raw material both laws depend on: no honest sample size and no freshness ranking
are possible unless the raw records, with their timestamps, are being written first. Recording
is the precondition for the evidence stamp, not the stamp itself.

---

## 8. Boundaries

The recording pipeline operates entirely within AdOS's sovereignty guarantees, and nothing in
it weakens them:

- **100% local.** The fan-out runs inline on the server process. It writes to in-process
  stores and, for reports, to the local/self-hosted Postgres selected by `DATABASE_URL`. No
  write leaves the deployment.
- **Own data only.** Every field recorded is derived from the agency's own campaign — its
  report, its client's industry, its channels. Nothing is drawn from an external benchmark,
  a vendor dataset, or another tenant.
- **No telemetry.** The five emitted events go to the local dashboard feed and nowhere else
  (`apps/web/src/app.ts:120`). Nothing is phoned home. There is no analytics beacon on
  recording.
- **Human-sovereign.** Recording is triggered by a human action and records only what the
  human's campaign produced. The recorder never approves, applies, or acts on what it writes —
  it stores facts for a person to consult later. Nothing downstream may auto-apply them.
- **Copy-only.** The recorder captures results after the fact; it does not reach back into a
  live system to change anything. It reads a finished campaign and writes a record of it.

---

## 9. Value contribution

Accumulated, attributable memory is how the agency turns delivered work into a durable
advantage — but only once the recorder feeds a memory that lasts and aggregates. When it does:

- **It increases agency revenue.** A recorded, attributable history lets the agency prove a
  compounding edge to clients — "here is what our own campaigns in your sector have produced" —
  which wins and retains accounts on evidence rather than on promises.
- **It reduces production time.** Every recorded campaign is one more starting point. Instead
  of opening the next brief on a blank page, the team starts from what the company has already
  done and seen. The recording pipeline is the first step that makes that possible: nothing can
  be reused that was never written down.

Today the pipeline delivers the *writing down*. The compounding value arrives when §6.1–§6.3
close — when what is written is aggregated, durable, and captured automatically. Stated in the
book's order: reality first (the recorder ships), then the value (memory that compounds).

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
