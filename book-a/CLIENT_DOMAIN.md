# A002 — Client Domain

> **Owner:** Office of the Chief Product Architect
> **Status:** Official — aligned to PRODUCT_TRUTH.md
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** ../PRODUCT_TRUTH.md
> **Governing charter:** BOOK_A_AGENCY_CONSTITUTION.md

---

## 0. Purpose and scope

This document models the **Client** domain of AdOS — the advertising-agency
operating system ("Agency OS") — exactly as the code implements it. The Client is
the customer account the AI Company works on: it lives inside a `Workspace`, and it
owns the `Brand`s, `Product`s, `Project`s and `Mission`s that drive the human-gated
campaign pipeline.

Everything below is split into two clearly separated tiers:

- **Implemented** — present in domain code today, with a source path cited as
  evidence.
- **⚠️ Roadmap / proposed v2** — requested here but **not in code**. It is designed,
  labelled, and kept out of the "shipped" story. Nothing in this tier should be read
  as a current capability.

Primary evidence for this domain:
`domains/agency-os/src/client/client.ts`,
`domains/agency-os/src/client/service.ts`,
`domains/agency-os/src/client/repository.ts`,
`domains/agency-os/src/client/client.test.ts`.

Related domains cited for relationships:
`domains/agency-os/src/brand/brand.ts`,
`domains/agency-os/src/product/product.ts`,
`domains/agency-os/src/project/project.ts`,
`domains/agency-os/src/mission/mission.ts`,
`domains/agency-os/src/workspace/workspace.ts`.

---

## 1. The Client aggregate (Implemented)

The `Client` is a DDD `AggregateRoot` with a strongly-typed `ClientId`, private
props, a `create()` factory returning `Result<Client, ValidationError>`, a
`restore()` rehydrator, a `snapshot()` serializer, and domain events. It is the
consistency boundary for a customer's identity and contact details.

Evidence: `domains/agency-os/src/client/client.ts:53-150`.

### 1.1 Fields

| Field | Type | Rules / notes | Evidence |
|---|---|---|---|
| `tenantId` | `string` | Required, non-empty. Multi-tenant isolation key. | `client.ts:29,67` |
| `workspaceId` | `string` | Required, non-empty. The owning `Workspace`. | `client.ts:30,68` |
| `name` | `string` | Required, non-empty; trimmed on create/update. | `client.ts:31,69,77` |
| `industry` | `string` | Optional on input; defaults to `'general'`; trimmed. Free-text string — **no industry enum/taxonomy exists**. | `client.ts:32,78` |
| `contact` | `ClientContact` | Object `{ email, phone?, website? }`. `contact.email` required. | `client.ts:20-24,33` |
| `status` | `ClientStatus` | `'active' | 'archived'`. Starts `active` on create. | `client.ts:26,34,80` |

There are **no other stored fields** on the Client. Anything a downstream section
labels ⚠️ Roadmap (billing balance, health score, retention stage, activity log,
communication history, CRM notes) is **not** a Client prop and is not persisted.

### 1.2 The `contact` value (Implemented — "Contacts")

| Sub-field | Type | Required | Evidence |
|---|---|---|---|
| `email` | `string` | **Yes** — validated non-empty, trimmed | `client.ts:21,70,79` |
| `phone` | `string` | Optional | `client.ts:22` |
| `website` | `string` | Optional | `client.ts:23` |

Note the real shape of "Contacts": AdOS stores **one** contact block per client —
a single `email`, optional `phone`, optional `website`. There is **no** collection
of named contact persons, roles, or a contacts sub-table. A multi-contact address
book is ⚠️ Roadmap (see §8).

### 1.3 Industries (Implemented — as a plain string)

`industry` is a free-text `string` defaulting to `'general'`. It is stored and
trimmed, nothing more. There is **no** validated industry list, no segmentation
engine, and no behavior keyed off industry in the pipeline.

Evidence: `domains/agency-os/src/client/client.ts:32,78,106-108`.

Value of the field today: it travels into brief/creative context assembly as
plain metadata that sharpens AI positioning — see §9.

---

## 2. Domain events (Implemented)

The Client emits three events. All carry `{ tenantId }` metadata for tenant-scoped
routing.

| Event | `eventName` | Emitted by | Payload | Evidence |
|---|---|---|---|---|
| `ClientCreated` | `client.created.v1` | `create()` | `{ workspaceId, name, tenantId }` | `client.ts:38-40,82-88` |
| `ClientUpdated` | `client.updated.v1` | `update()` | `{ changes }` (partial `name`/`industry`/`contact`) | `client.ts:41-43,135` |
| `ClientArchived` | `client.archived.v1` | `archive()` | `{}` (empty) | `client.ts:44-46,142` |

Events are pulled and published by `ClientService` after each successful
persistence write.
Evidence: `domains/agency-os/src/client/service.ts:92-95`.

---

## 3. Behaviors and the application service (Implemented)

### 3.1 Aggregate methods

| Method | Effect | Guard | Evidence |
|---|---|---|---|
| `Client.create(input)` | Validates and builds an `active` client; emits `ClientCreated`. Returns `Result`. | Guards `tenantId`, `workspaceId`, `name`, `contact.email` non-empty. | `client.ts:58-90` |
| `update(changes)` | Applies partial `name`/`industry`/`contact`; emits `ClientUpdated`. | Calls `guardActive()`; re-validates `name` and `contact.email` if present. | `client.ts:120-137` |
| `archive()` | Sets `status='archived'`; emits `ClientArchived`. **Idempotent** — returns early if already archived. | none (safe on any status) | `client.ts:139-143` |
| `restore(id, props)` | Rehydrates from persistence **without** emitting events. | none | `client.ts:92-95` |
| `snapshot()` | Returns a deep-copied `ClientProps` for persistence. | none | `client.ts:116-118` |
| `guardActive()` | Throws `ValidationError` if `status==='archived'`. Private; gates mutation. | — | `client.ts:145-149` |

### 3.2 `ClientService` use cases

| Operation | Behavior | Evidence |
|---|---|---|
| `create(input)` | Builds aggregate, saves via repo, publishes events, meters + logs. | `service.ts:32-46` |
| `update(id, changes)` | Loads, applies `update()`, saves, publishes. | `service.ts:48-60` |
| `archive(id)` | Loads, calls `archive()`, saves, publishes. | `service.ts:62-73` |
| `list(workspaceId?)` | Lists clients, optionally scoped to a workspace. | `service.ts:75-77` |
| `get(id)` | Loads one client or `NotFoundError`. | `service.ts:79-90` |

Every operation is wrapped in a telemetry span and traced/logged/metered.
Evidence: `domains/agency-os/src/client/service.ts:27-96`.

---

## 4. Status transitions (Implemented)

The Client status is a two-state lifecycle: `active` ↔ `archived`.

| From | Trigger | To | Notes |
|---|---|---|---|
| _(none)_ | `create()` | `active` | Every client starts `active`. `client.ts:80` |
| `active` | `update()` | `active` | Mutations allowed only while active (via `guardActive()`). `client.ts:120-121` |
| `active` | `archive()` | `archived` | Emits `ClientArchived`. `client.ts:139-143` |
| `archived` | `archive()` | `archived` | **Idempotent** no-op; no duplicate event. `client.ts:140` |
| `archived` | `update()` | — | **Rejected** — `guardActive()` throws `ValidationError`. `client.ts:145-149` |

```
         create()
            │
            ▼
        ┌────────┐   update()  (re-entrant, guardActive passes)
        │ active │◀─────────────┐
        └────────┘──────────────┘
            │
            │ archive()
            ▼
       ┌──────────┐   archive()  (idempotent no-op)
       │ archived │◀──────────────┐
       └──────────┘───────────────┘
            │
            │ update()  →  ValidationError (guardActive throws)
            ✗
```

Note: there is **no** un-archive / reactivate transition in code. `archived` is a
terminal state for the Client's writable lifecycle; a "reactivate" flow is ⚠️
Roadmap (§8).

---

## 5. Relationships (Implemented)

The Client sits between the `Workspace` (its parent) and the operational entities it
owns. AdOS wires these as separate aggregates that reference the Client by id; the
routes layer (`apps/web/src/routes.ts`) assembles cross-aggregate context.

```
Tenant
 └─ Workspace (agency-os)                        workspace/workspace.ts
     └─ Client  ── belongs to Workspace          client/client.ts
         ├─ Brand    (→ clientId)                 brand/brand.ts
         ├─ Product  (→ clientId)                 product/product.ts
         ├─ Project  (→ clientId, brandId)        project/project.ts
         └─ Mission  (→ workspaceId, clientId,    mission/mission.ts
                        projectId?)   ── PRIMARY SURFACE
```

| Relationship | Direction | Cardinality | Evidence |
|---|---|---|---|
| Client → Workspace | belongs-to | many Clients per Workspace | `client.ts:30,100-102` |
| Client → Brand | owns | 0..n | `domains/agency-os/src/brand/brand.ts` |
| Client → Product | owns | 0..n | `domains/agency-os/src/product/product.ts` |
| Client → Project | owns | 0..n (Project → `clientId`,`brandId`) | `domains/agency-os/src/project/project.ts` |
| Client → Mission | owns (via workspace+client) | 0..n | `domains/agency-os/src/mission/mission.ts` |

The Client aggregate itself stores **only** `workspaceId`; child entities hold the
back-reference to the client. The Client does not embed child collections.

---

## 6. Brands and Goals (Implemented — real relationships)

### 6.1 Brands (real relationship)

A `Brand` is a separate aggregate owned by the Client. It carries the profile,
identity, and rules the AI uses when generating copy:
`profile{mission,values[],voice,targetAudience}`,
`identity{primaryColor,secondaryColor,logoUrl?,typography}`,
`rules{dos[],donts[],bannedWords[]}`, `assets[]`, `status active|archived`.

Evidence: `domains/agency-os/src/brand/brand.ts`.

> **Honest note:** `bannedWords[]` is **stored but NOT enforced** against generated
> copy anywhere in the pipeline. Enforcement is ⚠️ Roadmap (fully covered in
> A003 BRAND_DOMAIN.md).

The Client → Brand link is what gives AI generation a consistent voice per customer.
See the value note in §9. Brand modeling in depth is A003's scope; here it is
documented only as a Client relationship.

### 6.2 Goals (real — via Project goals)

The Client does not itself store campaign goals. Goals live on the owned `Project`:
`goals[{ description, metric, target }]`.

| Goal sub-field | Type | Evidence |
|---|---|---|
| `description` | `string` | `domains/agency-os/src/project/project.ts` |
| `metric` | `string` | `domains/agency-os/src/project/project.ts` |
| `target` | `string`/number target | `domains/agency-os/src/project/project.ts` |

So "client goals" in AdOS = the goals of the client's Projects. There is no
separate account-level objective object on the Client. Mission-level intent is
captured instead in the Mission `brief` (raw natural language) and optional
`targetMetric{name,target,unit}` — `domains/agency-os/src/mission/mission.ts`.

---

## 7. Validation and business rules (Implemented)

### 7.1 Validation rules (creation)

| Rule | Where | Evidence |
|---|---|---|
| `tenantId` must be non-empty | `create()` guard | `client.ts:67` |
| `workspaceId` must be non-empty | `create()` guard | `client.ts:68` |
| `name` must be non-empty | `create()` guard | `client.ts:69` |
| `contact.email` must be non-empty | `create()` guard | `client.ts:70` |
| Any guard failure → `err(ValidationError)`, no client built | `create()` | `client.ts:71-72` |
| `industry` defaults to `'general'` when omitted | `create()` | `client.ts:78` |
| `name` and `contact.email` are trimmed | `create()` | `client.ts:77,79` |
| New client status is `active` | `create()` | `client.ts:80` |

### 7.2 Validation rules (update)

| Rule | Where | Evidence |
|---|---|---|
| Mutation blocked when `archived` | `guardActive()` in `update()` | `client.ts:121,145-149` |
| If `name` provided, must be non-empty | `update()` | `client.ts:122-125` |
| If `contact.email` provided, must be non-empty | `update()` | `client.ts:126-129` |
| Only `name`/`industry`/`contact` are updatable | `update()` signature | `client.ts:120,130-134` |
| `contact` update is a **shallow merge** over existing contact | `update()` | `client.ts:133` |

### 7.3 Business rules (invariants)

1. A Client cannot exist without `tenantId`, `workspaceId`, `name`, and
   `contact.email`. (`client.ts:66-72`)
2. A Client always belongs to exactly one Workspace. (`client.ts:30`)
3. `archive()` is idempotent and safe to call repeatedly. (`client.ts:140`)
4. Archived clients are read-only: no field mutation is permitted.
   (`client.ts:145-149`)
5. `restore()` never emits events — rehydration is side-effect free.
   (`client.ts:92-95`)
6. Every state-changing use case publishes its domain events after a successful
   save. (`service.ts:38,56,68,92-95`)

---

## 8. ⚠️ Roadmap / proposed v2 design (NOT in code)

Everything in this section is **not implemented**. It is presented as a proposed
future design so the domain vision is captured, but it must never be described as a
current AdOS capability. Cross-references: ../ROADMAP.md, ../KNOWN_LIMITATIONS.md.

### 8.1 ⚠️ Billing (Roadmap)

**What exists today:** `Product.pricing` — a descriptive pricing shape only:
`{ model: one_time|subscription|usage|free, amount: Money, period?: monthly|yearly }`,
where Money is minor units `{ amountMinor, currency }`. Evidence:
`domains/agency-os/src/product/product.ts`.

**What does NOT exist:**

- There is **no invoicing or billing engine** — no invoice entity, no charges, no
  ledger, no payment integration.
- There is **no usage / consumption / per-token billing** — the product has **no
  metering** of AI usage. Inference is 100% local; no metered API is ever called.
  Evidence (truth): ../PRODUCT_TRUTH.md §6.1 ("No per-token billing"; local `fetch`
  only) and §6.2.

So `pricing.model = usage` is a **descriptive label on a Product**, not a working
metered-billing capability. A client-level billing account, balance, invoices, and
dunning are all ⚠️ Roadmap.

| Proposed v2 concept | Status | Notes |
|---|---|---|
| Client billing account / balance | ⚠️ Roadmap | No entity in code |
| Invoice / line items / statements | ⚠️ Roadmap | No invoicing engine |
| Usage metering (per-token / per-mission) | ⚠️ Roadmap | No metering exists; local AI |
| Payment / dunning integration | ⚠️ Roadmap | No external integrations |

### 8.2 ⚠️ Communication log (Roadmap)

No CRM, no communications/messaging log, no email/call/meeting history is stored on
or near the Client. There is no comms entity in any domain. A per-client
communication timeline is proposed v2 only.

### 8.3 ⚠️ Retention (Roadmap)

No retention stage, churn signal, renewal, or lifecycle-stage field exists on the
Client. A retention/lifecycle model is proposed v2 only.

### 8.4 ⚠️ Health (Roadmap)

No client health score, risk indicator, or scoring engine exists in code. A
health-scoring model is proposed v2 only.

### 8.5 ⚠️ History / activity (Roadmap)

There is no activity-history engine and no immutable client audit trail. The web
app's activity feed is a bounded in-memory ring of 50 entries (truth §2.7,
`apps/web/src/app.ts`), not a durable per-client history. Note also that Client
domain **events** (`client.created.v1` etc.) exist and are published to the bus, but
that event stream is **not** an immutable audit store and is not a client history
feature. A durable, queryable client history is proposed v2 only.

### 8.6 ⚠️ Multi-contact address book & reactivation (Roadmap)

- Multiple named contact persons with roles: ⚠️ Roadmap. Code stores a single
  `contact{email,phone?,website?}`.
- Industry taxonomy / segmentation: ⚠️ Roadmap. `industry` is a free-text string.
- Client reactivation / un-archive: ⚠️ Roadmap. No transition out of `archived`.

### 8.7 Roadmap separation summary

| Requested capability | Real anchor in code | Verdict |
|---|---|---|
| Contacts | `contact{email,phone?,website?}` (single block) | **Real** (single-contact) |
| Industries | `industry` string, default `'general'` | **Real** (plain string) |
| Brands | `Brand` aggregate owned by Client | **Real** relationship |
| Goals | `Project.goals[{description,metric,target}]` | **Real** (Project-level) |
| Billing | `Product.pricing{model,amount,period}` (descriptive) | ⚠️ Roadmap — no invoicing engine |
| Usage / per-token billing | none | ⚠️ Roadmap — no metering |
| Communication | none | ⚠️ Roadmap — no comms log / CRM |
| Retention | none | ⚠️ Roadmap — no lifecycle stage |
| Health | none | ⚠️ Roadmap — no scoring |
| History / activity | events + bounded in-memory ring | ⚠️ Roadmap — no history engine |

---

## 9. Value contribution

**Primary axis: production-time ↓ (with a downstream revenue ↑).**

The Client aggregate is where a customer's stable context lives —
`name`, `industry`, `contact`, and the owned `Brand` (voice, values, dos/donts) and
`Project` goals. When the human-gated pipeline assembles brief/creative context, it
draws on this clean, structured client-and-brand context rather than
re-establishing "who is this client and what do they sound like" every mission.

- **Production time ↓:** Consistent per-client brand context reduces creative
  **rework** — AI-generated headlines, ad copy, and campaign drafts land closer to
  on-brand on the first pass, so approvers at the `strategy_and_budget`,
  `creative_assets`, and `campaign_launch` gates spend less time correcting tone and
  positioning. Fewer regeneration loops per mission means faster brief → creative →
  draft → report cycles.
- **Revenue ↑ (downstream):** Faster, more on-brand output lets the agency run more
  missions per client and present tighter work, improving retained-client output
  quality — the value the Client/Brand context ultimately protects.

Because AdOS is offline-first and local-AI, this value is captured **without** any
per-token/usage cost — reinforcing that "Billing" here is descriptive pricing
metadata, not a metered cost driver (§8.1).

---

## 10. Cross-references

- **BOOK_A_AGENCY_CONSTITUTION.md** — governing charter; aggregate hierarchy, all
  state machines, terminology.
- **A003 BRAND_DOMAIN.md** — Brand identity/voice/rules; `bannedWords` enforcement
  gap.
- **../PRODUCT_TRUTH.md** — source-of-code audit (billing/metering, audit trail,
  integrations reality).
- **../ROADMAP.md**, **../KNOWN_LIMITATIONS.md** — forward-looking items and honest
  gaps.
- **../ARCHITECTURE.md** — aggregate/persistence architecture.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
