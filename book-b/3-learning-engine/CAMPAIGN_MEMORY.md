# Campaign Memory — What AdOS Records From Every Campaign

> **Owner:** Office of the Chief AI Architect
> **Status:** Official — aligned to PRODUCT_TRUTH.md
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** `../../PRODUCT_TRUTH.md`
> **Governing reference:** `../1-ai-foundations/AI_CONSTITUTION.md`

**Implementation status:** ✅ SHIPPED — every completed mission is recorded into
the in-memory Company Brain, Executive Memory, and Decision Journal
(`apps/web/src/routes.ts:1118-1177`). ❌ ROADMAP — durable persistence of that
memory, and the read-back of it into generation, are not built. The stores are
**write-only relative to generation**: no generator reads them (the **B-2** gap).

---

## 1. Why this document exists

Campaign Memory is the **recording foundation** of the AdOS learning engine. It
is the substrate on which every later capability in this part of Book B —
pattern detection, learning/reward, memory injection — is built. If the memory
is not written, nothing downstream can learn; if it is written but never read,
the agency records lessons it never uses.

Today AdOS is squarely in the second state. It **records** a rich, structured
account of every campaign it completes, into real, tested stores. It does **not**
yet keep that account across a restart, and — the headline gap — it does **not**
feed that account back into the next campaign's generation. The differentiator
AdOS is designed around ("the agency improves each campaign by learning from the
last") depends entirely on closing that loop.

This document draws the line precisely: what is recorded today (with code
cites), what is *not* (durability, read-back), and the design for both. The
read-back side is specified in the sibling `../1-ai-foundations/MEMORY_INJECTION.md`;
this document owns the **write** side and the campaign-memory data model.

**The differentiator (from the AI Constitution).**

> Competitors do **Prompt → LLM → Output**. AdOS is designed as an agent
> pipeline whose distinguishing stages are **Memory → … → Learning**. Campaign
> Memory is the stage that makes the pipeline *stateful* — the reason a second
> campaign can be better than the first.

---

## 2. Target design — the campaign-memory model

The target is a single conceptual **Campaign Memory**: everything AdOS knows,
after a mission completes, about *what was tried, what happened, and what it
learned*. It is written once per mission (at completion) and — in the target
design — read at the start of the next mission of the same kind.

Physically, Campaign Memory is not one store; it is a **layered set of stores**,
each answering a different question. All six exist in code today as in-memory
adapters behind stable ports (`@ados/contracts`), so a durable adapter can be
swapped in without changing business logic.

| Layer | Question it answers | Port (contract) | In-memory adapter |
|---|---|---|---|
| Experience Engine | "What did we try in this vertical, and how did it do?" | `ExperienceEnginePort` | `domains/company-brain/src/experience-engine.ts` |
| Pattern Library | "What winning *structure* can we reuse?" | `PatternLibraryPort` | `domains/company-brain/src/pattern-library.ts` |
| Knowledge Graph | "How do mission → campaign → report connect?" | `KnowledgeGraphPort` | `domains/company-brain/src/knowledge-graph.ts` |
| Marketing / Creative / Sales / SOP sub-brains | "What are the running averages for this vertical / format / SOP?" | `CompanyBrainPort.enrich` | `domains/company-brain/src/in-memory-company-brain.ts:71-96` |
| Executive Memory | "What should the CMO remember about this campaign?" | `ExecutiveMemoryPort` | `domains/executive-memory/src/memory.ts:15-40` |
| Decision Journal | "Why did the executive decide what they decided?" | `DecisionJournalPort` | `domains/executive-memory/src/memory.ts:54-80` |

### 2.1 The four write shapes

Every layer stores a different shape. The four that carry the campaign outcome:

**Experience** — the atomic record of one attempt
(`packages/contracts/src/ai/company-brain.ts:105-116`):

| Field | Meaning |
|---|---|
| `vertical` | client industry — the hard retrieval key |
| `context` | what was tried, as key=value pairs (e.g. `{ channels }`) |
| `action` | the campaign name |
| `result` | numeric outcome — `{ roas, ctr, roi }` |
| `reason` | why it worked or failed |
| `learned` | the human-readable lesson |
| `reusableAs?` | pattern id it became (target: set when promoted) |

**Pattern** — a reusable winning structure
(`packages/contracts/src/ai/company-brain.ts:124-131`): `domain` (vertical),
ordered `structure` steps, and `evidence { sampleSize, metric, value }`. Ranked
by evidence strength nudged by proven reuse (`pattern-library.ts:35-38`).

**Executive Memory entry** — private CMO recall
(`packages/contracts/src/ai/executive.ts:25-36`): `role`, `category`,
free-text `content`, and an `importance` score (0..1) that drives recall
ranking and retention.

**Decision Journal entry** — the auditable "why"
(`packages/contracts/src/ai/executive.ts:80-93`): `decision`, `evidence[]`,
`alternatives`, `chosen`, `rejected[]`, a `confidence` assessment, and the
realized `outcome`.

### 2.2 Where the write happens (target = today)

The target design keeps the write at a single, well-defined seam: **mission
completion**. When a mission has a campaign draft and an analytics report, the
learning flow records the outcome across all stores, then transitions the
mission `planning → executing → completed`. This is exactly what ships today
(§3), and the target design does not move the seam — it makes the stores durable
and adds a *read* seam at the start of the next mission (§4).

### 2.3 The retrieval contract (the seam the read side will call)

Campaign Memory's target value is defined by what can be *retrieved*, not only
what is stored. Each port already exposes a read method with a stable signature;
the target design commits to these signatures so the read side
(`../1-ai-foundations/MEMORY_INJECTION.md`) can be built against them without
churn:

| Retrieval | Signature (contract) | Returns | Ranking |
|---|---|---|---|
| Similar experiences | `experience.findSimilar({ vertical, context, k })` | past attempts in the same vertical | Jaccard overlap of context pairs (`experience-engine.ts:28-33`) |
| Best patterns | `patterns.bestFor(domain)` | reusable structures for a vertical | evidence × confidence + reuse nudge (`pattern-library.ts:18-22`) |
| Executive recall | `execMemory.recall({ tenantId, role, category, query, k })` | a role's most relevant memories | `importance + keyword relevance` (`memory.ts:32-38`) |
| Decision history | `journal.history({ role, subjectId, k })` | prior decisions & outcomes | most-recent first (`memory.ts:63-73`) |
| Graph neighbors | `graph.neighbors(nodeId, relation)` / `graph.query({ type, where })` | connected entities | relation/type filter (`knowledge-graph.ts:25-42`) |

The contract is deliberately store-agnostic: whether the backing is an in-memory
`Map` (today) or Postgres + a vector index (target), a caller writes the same
line. That is what makes Track A (§4.1) a swap rather than a rewrite.

### 2.4 Design invariants

The model holds to a small number of invariants, each already reflected in code:

1. **Write once, at completion.** Memory is recorded at exactly one seam
   (`routes.ts:1086-1184`); it is never written mid-generation. This keeps the
   record a *settled outcome*, not a speculative intermediate.
2. **Idempotent.** Re-running the learning flow on a completed mission is a
   no-op (`routes.ts:1096`) — memory is never double-counted.
3. **Evidence-weighted, not last-write-wins.** Aggregates merge by sample size
   (`in-memory-company-brain.ts:99-124`); a single lucky campaign cannot
   overwrite a stable long-run average.
4. **Role- and tenant-partitioned recall** (where scoped): the CMO's memory and
   the Creative Director's memory never mix (`memory.ts:32-33`). Track A extends
   this partition to the Company Brain stores that lack it today.
5. **Ports before adapters.** Every store is reached through a `@ados/contracts`
   port, so durability and vector search are additive.

---

## 3. Today — what is recorded, where (✅ SHIPPED, in-memory)

**Tier: ✅ SHIPPED (write) / in-memory (non-durable).** The recording path is
live in the app. It runs in `recordLearning(...)`
(`apps/web/src/routes.ts:1086-1184`), Phase 6 of the pipeline, after the
analytics report exists. The Constitution's rule — *"every completed task
enriches the brain"* — is honored on the write side
(`in-memory-company-brain.ts:63`).

### 3.1 The write sequence

The handler derives the outcome from the report and campaign, then writes to
four stores in order (`routes.ts:1107-1170`):

| # | Store | Call | What is written |
|---|---|---|---|
| 1 | Decision Journal | `app.journal.record({...})` `routes.ts:1118-1133` | CMO post-campaign review: evidence (campaign + metric), alternatives Scale/Hold/Rework, chosen action, confidence from ROAS, outcome |
| 2 | Executive Memory | `app.execMemory.remember({...})` `routes.ts:1136-1143` | CMO `campaign` memory: brief → ROAS on channels, `importance = roas/5` clamped 0..1 |
| 3a | Experience Engine | `app.brain.experience.record({...})` `routes.ts:1146-1155` | vertical, `context {channels}`, action = campaign name, result `{roas, ctr, roi}`, reason, learned lesson |
| 3b | Pattern Library | `app.brain.patterns.capture({...})` `routes.ts:1156-1161` | `domain = vertical`, `structure` = ad sets + `measure` + `reallocate`, evidence `{sampleSize:1, metric:'roas', value:roas}` |
| 3c | Knowledge Graph | `app.brain.graph.upsertNode/relate(...)` `routes.ts:1162-1170` | `Mission`/`Campaign`/`Report` nodes and `planned_by` / `ran` / `produced` edges |

It then emits the learning events
(`DECISION_JOURNALED`, `MEMORY_UPDATED`, `EXPERIENCE_RECORDED`,
`PATTERN_CAPTURED`, `BRAIN_ENRICHED` — `routes.ts:1173-1177`) and completes the
mission (`routes.ts:1180-1181`). The handler is **idempotent**: a completed
mission short-circuits (`routes.ts:1096`).

### 3.2 A worked example — one completed campaign

Take a restaurant client (vertical `restaurant`) whose mission ran a campaign
"Summer Reservations" across `instagram + tiktok`, and whose report came back at
`roas 3.2`, `ctr 5.1`, `roi 220`. At completion `recordLearning` writes, in one
pass (`routes.ts:1107-1170`):

- **Decision Journal** — a `cmo` review of "Summer Reservations" with evidence
  `[{campaign, 0.6}, {metric, roas 3.2x, 0.9}]`, alternatives Scale/Hold/Rework,
  `chosen = Scale` (because `roas >= 1`), `rejected = [Rework]`, and confidence
  `round(clamp(3.2 × 25, 10, 95)) = 80` with basis `{ sampleSize: 1, roas: 3.2 }`.
- **Executive Memory** — a `campaign`-category CMO memory: *"Mission …: <brief>
  → 3.2x ROAS on instagram, tiktok. …"*, `importance = clamp(3.2/5) = 0.64`.
- **Experience** — `{ vertical: 'restaurant', context: { channels:
  ['instagram','tiktok'] }, action: 'Summer Reservations', result: { roas: 3.2,
  ctr: 5.1, roi: 220 }, reason: 'Positive return …', learned: '…' }`.
- **Pattern** — `{ domain: 'restaurant', structure: ['instagram ad set', 'tiktok
  ad set', 'measure', 'reallocate'], evidence: { sampleSize: 1, metric: 'roas',
  value: 3.2 } }`.
- **Knowledge Graph** — nodes `mission:…`, `campaign:…`, `report:…` and edges
  `ran`, `produced`, plus `planned_by` to the brief.

The very next restaurant mission *could* call
`experience.findSimilar({ vertical: 'restaurant', context: { channels }, k })`
and `patterns.bestFor('restaurant')` and receive this record ranked first —
except no generator makes that call (§3.4). The lesson is fully recorded and
fully unused. That is B-2 in one example.

### 3.3 The stores hold and merge, correctly

These are real, tested stores — not stubs. Notable behavior:

- **Experience** appends every attempt and retrieves the most similar past ones
  by vertical + Jaccard overlap of context pairs
  (`experience-engine.ts:18-34`). The retrieval method (`findSimilar`) is
  **implemented and correct** — it is simply *never called by any generator*
  (§3.4).
- **Pattern Library** captures once and ranks by evidence × confidence, nudged
  by `reuseCount` (`pattern-library.ts:12-38`). `markReused` exists to record
  proven reuse — also uncalled at generation time.
- **Company Brain sub-brains** (Marketing/Creative/Sales/SOP) merge new samples
  with a **sample-weighted average** so long-run knowledge dominates a single
  data point (`in-memory-company-brain.ts:99-124`). Note: `recordLearning`
  currently writes Experience/Pattern/Graph directly; the sub-brain `enrich`
  path (`in-memory-company-brain.ts:71-96`) is exercised by tests but not driven
  from the live learning flow — an easy wiring add.
- **Executive Memory** ranks recall by `importance + keyword relevance` and is
  **tenant-scoped and role-scoped** (`memory.ts:24-39`) — the CEO and Creative
  Director never see each other's memory.
- **Decision Journal** stores the full evidence/alternatives/confidence record
  and can `attachOutcome` later (`memory.ts:75-79`).

### 3.4 ❌ Not durable

**Tier: ❌ ROADMAP.** All six stores are plain in-process JavaScript
collections — `Map`s and arrays — held on the singleton `App`:

- `this.brain = new InMemoryCompanyBrain()`, `this.execMemory = new
  InMemoryExecutiveMemory()`, `this.journal = new InMemoryDecisionJournal()`
  (`apps/web/src/app.ts:89-91`).
- Backing fields are `Map`/array literals: `experiences: Experience[]`
  (`experience-engine.ts:14`), `patterns = new Map(...)`
  (`pattern-library.ts:10`), `nodes`/`edges` (`knowledge-graph.ts:12-13`),
  `dnaStore … sopStore` (`in-memory-company-brain.ts:32-37`),
  `entries: ExecutiveMemoryEntry[]` (`memory.ts:16`),
  `journal = new Map(...)` (`memory.ts:55`).

Consequences, stated plainly:

- **A process restart erases all learned memory.** Nothing is written to SQLite
  or Postgres — the persistence adapters (`packages/persistence`) back the
  *agency-os* aggregates, not the brain. PRODUCT_TRUTH.md §2.6 records that the
  Company Brain has no durable/tenant-scoped store.

> **Series 2 · Sprint 6 (persistence, slice 1) update (2026-07-28) — the marketing
> sub-brain is now durable.** The claim above is now **narrowed**: the per-vertical
> `MarketingInsight` store — deliberately chosen first because it is the exact store
> the governance observe chain (`BrainEvidenceEngine`) reads to ground evidence /
> confidence / constitution — is **written through to a local SQLite file on every
> enrichment** (as the already-merged long-run average) and **restored at startup**,
> so it moves **❌→✅ (marketing store only)**. It uses the existing `SqliteDatabase`
> adapter (`packages/persistence`, `node:sqlite`) behind a new `SqlBrainStore`, and a
> transparent `PersistentCompanyBrain` decorator (`apps/web/src/brain-persistence.ts`)
> that leaves reads, sub-brains, and the §3.3 sample-weighted merge unchanged. Opt-in
> via `BRAIN_DB` (a file path); a default `new App()` stays pure in-memory. 100% local,
> no server or API. **Still ❌:** the other five stores + the three sub-brains
> (experience / patterns / graph), archive/compaction, and per-tenant brain scoping
> (the pre-existing global-`Map` gap below is unchanged) — all later slices.
- **No tenant scoping in the Company Brain.** The DNA/brand/marketing/creative/
  sales/SOP/experience/pattern/graph stores are global `Map`s — one tenant's
  patterns are visible to the whole process. (Executive Memory and Decision
  Journal *do* carry `tenantId` and filter on it — `memory.ts:33`.) The class
  docstrings already anticipate the swap to durable, scoped adapters
  (`in-memory-company-brain.ts:23-26`, `experience-engine.ts:10-12`).

### 3.5 ❌ Not read back into generation — the B-2 gap

**Tier: ❌ ROADMAP.** This is the defining limitation of Campaign Memory today,
and the reason Book A walkthrough gap **B-2** exists.

The five generators — brief, creative, campaign, report, executive — each make a
single `ai.submit(...)` call built only from **mission fields** (mission
injection, `domains/marketing-intelligence/.../brief/service.ts:47-62`). **None
of them takes a `CompanyBrainPort`, `ExperienceEnginePort`, or memory port.** No
generator calls `experience.findSimilar`, `patterns.bestFor`, or
`execMemory.recall`. The memory is written at completion and then sits inert.

So the memory is **write-only relative to generation**:

```
Mission → Brief → Creative → Campaign → Report → [Executive] → recordLearning(WRITE)
   ↑                                                                      │
   └──────────── read-back into next mission's generation ───────────────┘
                         ❌ this arrow does not exist today
```

Every retrieval method needed to close the loop already exists and is tested
(`findSimilar`, `bestFor`, `recall`, `history`, `graph.neighbors/query`). What
is missing is the **wiring**: a context step that, before generation, pulls the
most similar prior experiences and best patterns for the vertical and injects
them into the prompt. That wiring is specified in
`../1-ai-foundations/MEMORY_INJECTION.md` (the read side) and
`../1-ai-foundations/CONTEXT_ENGINE.md` (the assembly). This document is its
prerequisite: the read side can only surface what the write side records.

---

## 4. To build — durable store + the read-back path

Two independent build tracks close the two gaps above. Neither claims to exist
today; both are design.

### 4.1 Track A — durable Campaign Memory (❌ ROADMAP)

Make the six stores survive a restart and respect tenancy, **without changing
any port**. The adapters are already isolated behind `@ados/contracts`
interfaces, so this is an adapter swap plus wiring.

| Step | Work | Notes |
|---|---|---|
| A1 | Postgres-backed `ExperienceEngine` + `DecisionJournal` + `ExecutiveMemory` | rows keyed by `tenant_id` + `vertical`/`role`; reuse `packages/persistence` patterns |
| A2 | Durable `PatternLibrary` + `KnowledgeGraph` | patterns as rows; graph as node/edge tables or a graph store |
| A3 | Vector-backed similarity for Experience | replace Jaccard (`experience-engine.ts:42-47`) with embeddings behind the *same* `findSimilar` signature; docstring already anticipates this |
| A4 | Tenant-scope the Company Brain | add `tenantId` to the DNA/brand/marketing/creative/sales/SOP/pattern/graph keys, matching Executive Memory's existing scoping |
| A5 | Route brain enrichment through `enrich(...)` | wire the sub-brain merge path (`in-memory-company-brain.ts:71-96`) into `recordLearning` so vertical/format averages compound, not just Experience/Pattern/Graph |

**Acceptance:** complete a mission, restart the process, and confirm the
experience, pattern, executive memory, and decision are all still retrievable
for the same tenant — and invisible to another tenant.

### 4.2 Track B — the read-back path (❌ ROADMAP; owned by MEMORY_INJECTION)

Turn the recorded memory into an *input* to the next campaign. This is the B-2
fix and the payoff of the whole learning engine.

| Step | Work | Where specified |
|---|---|---|
| B1 | Give each generator a `CompanyBrainPort` (+ memory ports) | `../1-ai-foundations/MEMORY_INJECTION.md` |
| B2 | Pre-generation context step: `findSimilar` + `bestFor` + `recall` for the vertical | `../1-ai-foundations/CONTEXT_ENGINE.md` |
| B3 | Inject retrieved experiences/patterns as prompt context | assembled by the Prompt Orchestrator (`../1-ai-foundations/PROMPT_ORCHESTRATOR.md`) |
| B4 | On reuse, set `Experience.reusableAs` and call `patterns.markReused` | closes the reuse accounting loop (`pattern-library.ts:28-31`) |

Because every method in B2/B4 already exists and is tested, Track B is
**wiring, not new algorithms** — the honest reason Book B can promise the
learning loop credibly while stating clearly that it is not closed today.

### 4.3 Migration & backfill considerations

Durability is not only a forward concern. Two design notes for Track A:

- **No backfill exists or is owed.** Because today's memory is in-memory, there
  is no historical corpus to migrate — the first durable deploy simply begins
  accumulating. This makes Track A lower-risk than a typical persistence
  migration: there is no legacy schema to reconcile.
- **Importance and retention are already design levers.** Executive Memory's
  `importance` (0..1, `roas/5` clamped — `routes.ts:1141`) is documented as
  driving "recall ranking + retention"
  (`packages/contracts/src/ai/executive.ts:33`). A durable store should honor it
  as a retention/eviction signal so high-ROAS lessons persist while low-signal
  entries age out — memory that curates itself rather than growing without
  bound.
- **Confidence scales with evidence, by design.** Decision confidence today is a
  function of a single campaign's ROAS (`sampleSize: 1` — `routes.ts:1130`). As
  the durable store accumulates repeats of the same vertical/channel mix, the
  sample-weighted merge (§3.3) and the confidence basis should rise together —
  the honest mechanism by which "the agency gets more sure as it does more."

### 4.4 Non-goals

Durability (Track A) alone does **not** close B-2 — a memory that survives
restarts but is still never read changes nothing at generation time. Conversely,
read-back (Track B) on volatile stores would "forget" every restart. The value
is the intersection; neither track is sufficient alone. This document claims
neither as done.

### 4.5 Sequencing

Track B can be prototyped against the in-memory stores *before* Track A ships —
proving read-back on a single running process — but the differentiator is only
real once **both** land: durable memory (survives restarts, per tenant) *and*
read-back (each campaign informed by the last). Until then, PRODUCT_TRUTH.md's
framing holds: automation, not compounding autonomy.

---

## 5. Status ledger

| Capability | Tier | Evidence |
|---|---|---|
| Record experience at mission completion | ✅ SHIPPED (in-memory) | `routes.ts:1146-1155` |
| Capture reusable pattern | ✅ SHIPPED (in-memory) | `routes.ts:1156-1161`; `pattern-library.ts:12-16` |
| Knowledge-graph facts (mission/campaign/report) | ✅ SHIPPED (in-memory) | `routes.ts:1162-1170` |
| Executive Memory (CMO, tenant+role scoped) | ✅ SHIPPED (in-memory) | `routes.ts:1136-1143`; `memory.ts:15-40` |
| Decision Journal (evidence + confidence) | ✅ SHIPPED (in-memory) | `routes.ts:1118-1133`; `memory.ts:54-80` |
| Sample-weighted sub-brain merge | ✅ SHIPPED (in-memory) | `in-memory-company-brain.ts:99-124` |
| Similar-experience retrieval method | ✅ SHIPPED (exists, uncalled at gen) | `experience-engine.ts:22-34` |
| Durable persistence of memory | ❌ ROADMAP | in-memory `Map`/array only (`app.ts:89-91`) |
| Company-Brain tenant scoping | ❌ ROADMAP | global `Map`s (`in-memory-company-brain.ts:32-37`) |
| Read-back into generation (B-2) | ❌ ROADMAP | generators take no brain port (`brief/service.ts:47-62`) |
| Vector similarity | ❌ ROADMAP | Jaccard today (`experience-engine.ts:42-47`) |

---

## 6. Consistency with Book A

Campaign Memory is written in **Phase 6** of the mission pipeline, after the
analytics report and executive dashboard that Book A walks through. It reuses
Book A vocabulary exactly: Mission states (`planning → executing → completed`),
the six KPIs (`roas`, `roi`, `ctr` are the ones recorded here), and the
provenance model. The verdict language ("scale" vs "rework") derives from
`roas >= 1` (`routes.ts:1111-1113`), consistent with the report verdict Book A
describes. This document does not contradict Book A; it explains where the
walkthrough's Phase 6 write actually lands — and why gap **B-2** persists.
See `../../book-a/BOOK_A_AGENCY_CONSTITUTION.md`.

---

## 7. Value contribution

**Revenue ↑ (the compounding-learning differentiator — the substrate for it).**

Campaign Memory is the *recording foundation* on which the entire revenue case
for the learning engine rests. On its own, the write side does not yet raise
revenue — memory that is never read back cannot improve a draft. Its value is
**latent and enabling**: it is the only place the agency's hard-won campaign
outcomes are captured in a structured, retrievable form.

- **Today (✅):** every completed campaign leaves a durable-*shaped* record —
  experience, winning pattern, executive memory, decisioned rationale. This is
  the raw material of institutional memory and the audit trail an agency can
  show a client.
- **Once read back (❌ → the B-2 fix):** each campaign starts from the best
  prior experience and proven pattern for its vertical instead of from scratch.
  That is the mechanism behind the product promise — *"improves each campaign by
  learning from the last"* — converting recorded lessons into **higher ROAS on
  the next campaign** and **less rework** (fewer human revision cycles because
  the first draft already reflects what won before). Production time ↓ follows
  directly: reuse replaces regeneration.

The strategic point: **no other Book B capability can compound without this
one.** Pattern detection, learning/reward, and optimization all read from
Campaign Memory. Getting the write side right — and durable — is the
prerequisite investment that makes every later revenue lever possible.

---

*Documentation only. No application code, packages, domains, or tests were
modified. Aligned to PRODUCT_TRUTH.md.*
