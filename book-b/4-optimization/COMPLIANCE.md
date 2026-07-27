# Compliance Checker — Advertising & Regulatory Copy Screening

**Owner:** Office of the Chief AI Architect
**Source of truth:** [../../PRODUCT_TRUTH.md](../../PRODUCT_TRUTH.md)
**Governing reference:** [../1-ai-foundations/AI_CONSTITUTION.md](../1-ai-foundations/AI_CONSTITUTION.md)
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Status:** Official

> **Implementation status:** ❌ **ROADMAP** — no compliance analysis of generated
> copy exists today. The compliance checker is specified as **advisory decision
> support, not legal advice**: it flags copy for human/legal review and never
> auto-approves. The only related code is an **unwired** keyword-routing line in the
> board engine (`domains/executive-memory/src/board.ts:49`) that routes a concern
> string containing `compliance`/`gdpr`/`kvkk` to a legal owner — a string match, not
> copy analysis.

---

## 0. What this document is

This is a **design specification** for a Compliance Checker: a subsystem that would
screen AI-generated advertising copy against configurable advertising and regulatory
rulesets, and **flag** risky claims for a human or the agency's legal function to
review before the copy proceeds through the approval pipeline.

It is written under the AdOS three-tier honesty model. Read the tier label on every
capability. Nothing in the **To build** sections runs today. The single **Today**
fact is the absence of any such analysis, plus one unwired keyword-routing line.

### 0.1 The non-negotiable framing — advisory, not legal advice

Before any design detail, the boundary that governs this entire document:

- A compliance checker is **decision support**. It raises a flag; a **human decides**.
- It is **not legal advice** and must never be presented, in UI or in output, as a
  legal determination, clearance, or sign-off.
- It **never auto-approves** copy and never removes a human from the loop. A "no flags
  raised" result means *"nothing our configured rules caught"* — not *"this is
  compliant."*
- It runs on **rules the agency configures** plus **local AI** (the same offline-first
  inference stack every AdOS AI feature uses). There is **no external regulatory
  database, no legal-content connector, and no cloud call** — consistent with the
  product's 100%-local posture (`apps/web/src/ai-factory.ts:23-57`).
- Its output is an input to the existing **Human Review / Approval** control
  ([../../book-a/APPROVAL_ENGINE.md](../../book-a/APPROVAL_ENGINE.md)), never a
  replacement for it.

Any wording that blurs "flagged risky claim" into "legally cleared" is a defect, not a
feature.

---

## 1. Target design

### 1.1 Position in the pipeline

The compliance checker is an **advisory QA gate** that sits alongside the other
output-screening stages, after copy is generated and before a human approves it:

```
CreativeSet (generated copy)
      │
      ▼
  Creative QA ──────────►  quality / structural checks   (../2-creative-factory/CREATIVE_QA.md)
      │
      ▼
  Brand Safety ─────────►  brand rules / banned words     (BRAND_SAFETY.md)
      │
      ▼
  Compliance Checker ───►  advertising & regulatory rules  ◄── THIS DOC (advisory flags only)
      │
      ▼
  Human Review / Approval  (../../book-a/APPROVAL_ENGINE.md, HUMAN_REVIEW.md)  ◄── the decision
```

It shares a philosophy with Brand Safety — deterministic rule checks plus local-AI
judgment over generated text — but a different **rulebook**: Brand Safety enforces the
*brand's* voice and banned words; Compliance screens against *advertising-law and
regulatory* risk patterns.

### 1.2 The six copy fields it screens

The checker screens the same six `CreativeSet` copy fields Book A defines
(`domains/creative-studio/src/creative/creative-set.ts:43-50`), because each carries a
different compliance surface:

| Copy field | Typical compliance surface |
|---|---|
| `headline` | superlatives, unqualified guarantees |
| `adCopy` | health / financial / earnings claims, comparative claims |
| `cta` | urgency/pressure phrasing, "act now" pressure |
| `socialPost` | disclosure obligations, testimonial/endorsement rules |
| `landingPage` | substantiation, fine-print and disclaimer needs |
| `email` | consent/opt-out framing, subject-line claims |

### 1.3 Configurable rulesets per industry and region

The rulebook is **agency-configured**, not shipped with legal content. The agency
composes rulesets from:

| Ruleset dimension | Example configuration |
|---|---|
| Industry | health, finance, food & beverage, gambling, cosmetics |
| Region / regime | e.g. TR advertising rules, EU/GDPR framing, KVKK framing |
| Claim category | absolute claims, comparative claims, endorsement/testimonial |
| Severity | `info` · `warn` · `block-for-review` |

Regions such as **KVKK** (Turkish data protection) and **GDPR** appear here because the
existing keyword-routing line already recognises those two tokens as legal concerns
(`domains/executive-memory/src/board.ts:49`) — the checker would generalise that idea
from a single hard-coded string match into configurable, copy-aware rules.

> **Honesty note:** these rulesets are **authored/curated by the agency**. AdOS
> supplies the *engine*, not the *law*. No ruleset ships as authoritative legal content,
> and none is fetched from an external regulatory source.

### 1.4 Two checking layers

Mirroring the unwired Brand-Safety design, the checker combines two layers so results
are explainable:

1. **Deterministic checks** — pattern/keyword rules over the copy fields. Fast,
   auditable, zero AI. Example risky patterns:

   | Category | Example trigger phrases | Default action |
   |---|---|---|
   | Absolute guarantee | `guaranteed`, `100% risk-free`, `no risk` | `block-for-review` |
   | Health claim | `cures`, `clinically proven`, `treats` | `block-for-review` |
   | Financial claim | `guaranteed returns`, `double your money` | `block-for-review` |
   | Superlative | `best`, `#1`, `unbeatable` (unqualified) | `warn` |
   | Urgency/pressure | `act now or lose`, `last chance ever` | `warn` |

2. **Local-AI screening** — the same local inference stack
   (`apps/web/src/ai-live.ts:26`, local engines only) reads a copy field and returns a
   structured judgement: *does this field contain a claim category that a human should
   review, and why?* This catches paraphrases a keyword rule misses (e.g. "your money
   can only grow" as an implied guarantee). Because AdOS AI is local and can run the
   deterministic OfflineAIManager default (`apps/web/src/ai.ts:13`), this layer adds no
   cloud dependency and no per-token cost.

Both layers feed **flags**, not verdicts.

### 1.5 Output contract — a flag set, never a clearance

The checker emits a structured, provenance-carrying result (consistent with the AdOS
provenance convention `{taskId,capability,model,engine,latencyMs}`):

```
ComplianceReview {
  field:      'headline' | 'adCopy' | 'cta' | 'socialPost' | 'landingPage' | 'email'
  ruleId:     string          // which configured rule fired
  category:   'absolute' | 'health' | 'financial' | 'endorsement' | 'urgency' | ...
  severity:   'info' | 'warn' | 'block-for-review'
  excerpt:    string          // the exact span that triggered the flag
  rationale:  string          // human-readable "why", for the reviewer
  advisory:   true            // CONSTANT — this is never a legal determination
  route_to:   'legal_director' // suggested human owner (see §1.6)
}
```

The result set is attached to the artifact and surfaced in the review UI. A
`block-for-review` severity **does not block programmatically on its own**; it raises
the flag prominently so the human approver cannot miss it. The gate remains the human.

### 1.6 Routing to a human owner

When a flag needs a specialist, the checker routes it to the **legal owner** — reusing
the executive-role vocabulary already in the codebase. This is the natural home for the
existing (unwired) routing idea: today `board.ts:47-52` maps a concern string to an
`ExecutiveRole`, sending anything matching `legal`/`compliance`/`kvkk`/`gdpr` to
`legal_director` (`domains/executive-memory/src/board.ts:49`). The checker would carry
that mapping forward as the default routing for compliance flags — but applied to
*analysed copy*, with an excerpt and rationale, rather than to a free-text concern
string in a board meeting.

### 1.7 Worked example (design illustration — not a live behavior)

To make the advisory boundary concrete, here is how a single generated `adCopy` field
would flow through the *proposed* checker. Nothing below runs today.

Generated copy (illustrative):

```
"Our supplement cures fatigue in 7 days — guaranteed results or your money back."
```

Proposed checker output:

| # | Layer | Trigger | Category | Severity | Rationale surfaced to reviewer |
|---|---|---|---|---|---|
| 1 | Deterministic | `cures` | health | `block-for-review` | Absolute health claim; likely requires substantiation |
| 2 | Deterministic | `guaranteed` | absolute | `block-for-review` | Unqualified guarantee; typically disallowed |
| 3 | Local-AI | "in 7 days" | health/timing | `warn` | Specific efficacy timeframe implies a substantiated study |

Resulting `ComplianceReview` set: three flags, all `advisory:true`, `route_to:
legal_director`. The artifact is **annotated, not blocked**; it proceeds to Human
Review with these three items highlighted. The legal reviewer decides whether to
approve, request a human revision, or reject. The checker **states nothing** about
whether the copy is lawful — it states only that a human should look, and where.

Contrast with a "no flags" result: had the copy read *"Our supplement supports your
daily routine,"* the checker would raise nothing. That is **not** a clearance — it means
only that the agency's configured rules found no known-risky pattern. A human still
approves.

---

## 2. Today

**Tier: ❌ ROADMAP.** No compliance analysis of generated copy exists anywhere in the
codebase. There is no compliance checker, no ruleset engine, no claim detector, and no
compliance scoring. PRODUCT_TRUTH.md's concept audit lists **tone checker / readability
/ compliance analysis** among capabilities with **no code** (`PRODUCT_TRUTH.md` §4, §6).

### 2.1 The only related code — one unwired keyword-routing line

The single artefact in the repo that touches the word "compliance" in a functional way
is a string match inside the **Board Meeting Engine**:

```ts
// domains/executive-memory/src/board.ts:46-52
function ownerForConcern(concern: string, raisedBy: ExecutiveRole): ExecutiveRole {
  const c = concern.toLowerCase();
  if (c.includes('budget') || c.includes('cost') || c.includes('cash')) return 'finance_director';
  if (c.includes('legal') || c.includes('compliance') || c.includes('kvkk') || c.includes('gdpr')) return 'legal_director';
  if (c.includes('creative') || c.includes('brand')) return 'creative_director';
  if (c.includes('roas') || c.includes('campaign') || c.includes('ctr')) return 'cmo';
  return raisedBy;
}
```

What this is, precisely:

| Property | Reality |
|---|---|
| What it does | Lowercases a concern string and routes it to an `ExecutiveRole` by substring match |
| What it operates on | A free-text `concern` raised in a board meeting — **not** generated ad copy |
| Does it analyse copy? | **No.** It never sees `headline`/`adCopy`/`cta`/`socialPost`/`landingPage`/`email` |
| Does it check rules? | **No.** No ruleset, no severity, no claim categories, no substantiation logic |
| Is it wired into the app? | **No.** `BoardMeetingEngine` lives in the UNWIRED executive-memory stack; `apps/web` never instantiates it |
| Relationship to compliance | It recognises the *tokens* `compliance`/`gdpr`/`kvkk` and picks a legal owner — nothing more |

So the honest statement is: AdOS today has **a string that knows the word "compliance"
should go to legal**, and nothing that analyses whether a piece of copy is compliant.

### 2.2 The only control that exists today — human legal review via Approval

The genuine compliance control shipping in AdOS today is **human review**. Every stage
of the pipeline requires an explicit human approval click, and the approval workflow is
real and tested (`domains/agency-os/src/approval/approval.ts`, `apps/web/src/routes.ts:478-481`;
gates default to `strategy_and_budget`, `creative_assets`, `campaign_launch`). A human
approver — who may be or may consult the agency's legal function — reads the generated
copy and decides. See [../../book-a/APPROVAL_ENGINE.md](../../book-a/APPROVAL_ENGINE.md)
and sibling [HUMAN_REVIEW.md](HUMAN_REVIEW.md).

That human path is **the only compliance safeguard today**. There is no automated
pre-screen feeding it. The checker's entire purpose is to make that human review faster
and less likely to miss a risky claim — not to replace it.

### 2.3 Today ledger

| Capability | Tier | Evidence |
|---|---|---|
| Compliance analysis of generated copy | ❌ ROADMAP | no code (`PRODUCT_TRUTH.md` §4) |
| Configurable compliance rulesets | ❌ ROADMAP | no code |
| Claim detection (guarantee/health/financial) | ❌ ROADMAP | no code |
| Compliance flag/severity output | ❌ ROADMAP | no code |
| Keyword routing of a *concern* to legal | ❌ ROADMAP (unwired string match) | `domains/executive-memory/src/board.ts:49` |
| Human legal review via Approval | ✅ SHIPPED | `approval.ts`, `routes.ts:478-481` |

---

## 3. To build

All items below are design work. Tier ❌ unless the item reuses existing unwired code,
noted as 🔶.

### 3.1 Build sequence

| # | Build item | Tier | Notes |
|---|---|---|---|
| 1 | **Ruleset model** — industry × region × category × severity, agency-authored | ❌ ROADMAP | new config surface; ships empty of legal content |
| 2 | **Deterministic claim detector** — pattern rules over the six copy fields | ❌ ROADMAP | mirror the unwired Brand-Safety regex approach (`packages/ai-manager/src/runtime/safety-engine.ts:57-64`) |
| 3 | **Local-AI screening capability** — structured "review-worthy?" judgement per field | ❌ ROADMAP | new `ai.submit` capability on the local stack (`ai-live.ts:26`) |
| 4 | **`ComplianceReview` output contract** — flags with excerpt + rationale + `advisory:true` + provenance | ❌ ROADMAP | attaches to the artifact |
| 5 | **Legal-owner routing** — reuse the concern→role mapping as flag routing | 🔶 → reuse `board.ts:47-52` pattern | generalise the string match into copy-aware routing |
| 6 | **Review-UI surfacing** — flags rendered in the approval screen, `block-for-review` made unmissable | ❌ ROADMAP | feeds, never replaces, Human Review |
| 7 | **No-auto-approve guard** — assert the checker can only annotate, never advance a gate | ❌ ROADMAP | enforced invariant, tested |

### 3.2 How it ties to the sibling QA stages

The compliance checker is deliberately the **advisory** member of the output-QA family.
It must interoperate with, not duplicate, the others:

| Stage | Rulebook | Enforces or advises? | Reference |
|---|---|---|---|
| Creative QA | quality/structure of output | advises (❌ roadmap) | [../2-creative-factory/CREATIVE_QA.md](../2-creative-factory/CREATIVE_QA.md) |
| Brand Safety | brand voice + banned words | designed to **enforce** (🔶 unwired) | [BRAND_SAFETY.md](BRAND_SAFETY.md) |
| **Compliance Checker** | advertising/regulatory rules | **advises only — flags for human/legal** | this doc |
| Human Review / Approval | human judgement | **decides** (✅ shipped) | [HUMAN_REVIEW.md](HUMAN_REVIEW.md), [../../book-a/APPROVAL_ENGINE.md](../../book-a/APPROVAL_ENGINE.md) |

Brand Safety may be designed to hard-block on a banned word; Compliance, by contrast, is
constrained by design to **advise**. Regulatory judgement is context-dependent and
jurisdiction-specific — a machine flag is a prompt for human/legal attention, not a
ruling. This asymmetry is intentional and must survive implementation.

### 3.3 Design invariants (must hold in any implementation)

1. **Advisory-only.** The checker may annotate an artifact; it may never advance,
   satisfy, or bypass an approval gate. The human decision in
   [../../book-a/APPROVAL_ENGINE.md](../../book-a/APPROVAL_ENGINE.md) remains mandatory.
2. **Not legal advice.** No output string, label, or UI element may present a flag (or
   the absence of flags) as legal clearance. `advisory:true` is a constant.
3. **Local-only.** Rulesets are agency-authored; AI screening runs on the local stack.
   No external regulatory database, no connector, no cloud call
   (`apps/web/src/ai-factory.ts:23-57`).
4. **Explainable.** Every flag carries the triggering `excerpt` and a `rationale` a
   human reviewer can act on. No opaque "compliance score" that hides its reasoning.
5. **Fail-open to human review, never fail-open to publish.** If the checker errors or
   is unconfigured, copy still goes to human approval — it is never treated as cleared.

---

## 4. Consistency with Book A and Book B

- Reuses the six `CreativeSet` copy fields and the approval gate vocabulary
  (`strategy_and_budget` / `creative_assets` / `campaign_launch`) exactly as Book A
  defines them ([../../book-a/APPROVAL_ENGINE.md](../../book-a/APPROVAL_ENGINE.md),
  [../../book-a/CREATIVE_WORKFLOW.md](../../book-a/CREATIVE_WORKFLOW.md)).
- Sits in the same output-QA family as [BRAND_SAFETY.md](BRAND_SAFETY.md),
  [HUMAN_REVIEW.md](HUMAN_REVIEW.md), and
  [../2-creative-factory/CREATIVE_QA.md](../2-creative-factory/CREATIVE_QA.md).
- Governed by [../1-ai-foundations/AI_CONSTITUTION.md](../1-ai-foundations/AI_CONSTITUTION.md);
  aligned to [../../PRODUCT_TRUTH.md](../../PRODUCT_TRUTH.md). Roadmap items are tracked
  against [../../ROADMAP.md](../../ROADMAP.md); the absence is recorded in
  [../../KNOWN_LIMITATIONS.md](../../KNOWN_LIMITATIONS.md).

---

## 5. Value contribution

**Revenue ↑ — avoid costly compliance violations.** Advertising and regulatory
violations carry direct financial exposure: fines, forced take-downs, ad-account
suspensions, and reputational damage that costs the agency clients. An advisory
pre-screen that catches "guaranteed returns," unsubstantiated health claims, or missing
disclosures **before** copy reaches a client — or the public — protects revenue that a
single violation could erase. It also protects the agency's own standing as a trusted
operator.

**Production time ↓ — pre-screen before legal.** Today, the only control is a human
reading everything cold. An advisory checker triages: it hands the human/legal reviewer
a short, ranked list of *what to look at and why*, with the exact excerpt, instead of a
blank page of copy. Reviewers spend their time adjudicating real risks rather than
scanning for them, shortening the loop between generation and approval — without ever
removing the human from the decision.

Because the checker is advisory, its value is realised precisely by making human/legal
review **faster and sharper**, not by replacing it.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
