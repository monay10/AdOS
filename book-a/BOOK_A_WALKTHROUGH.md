# BOOK A — Agency Core — Paper Walkthrough

> **Owner:** Office of the Chief Product Architect
> **Status:** Official — aligned to PRODUCT_TRUTH.md
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

**Purpose.** Before we build **Book B — AI Campaign Factory**, we walk three realistic
agency engagements *on paper* through the Book A lifecycles — using only the state
machines, entities, gates, and artifacts documented in A001–A008. The goal is to catch
**lifecycle gaps and friction without writing code**, so Book B is designed on a
hardened foundation. Every step cites the real state or artifact; every scenario ends
with **Gaps surfaced**, scored against the AdOS v2 value rule (**revenue ↑ / production
time ↓**).

Nothing here changes the product. Where a step relies on something not in the code, it
is flagged **[GAP]** or **[Roadmap]** — never presented as shipped.

---

## Legend

- **State** = a `Mission` status (`submitted → planning → awaiting_approval → planning →
  executing → completed` / `failed`).
- **Gate** = a Mission approval gate (`strategy_and_budget`, `creative_assets`,
  `campaign_launch`).
- **Artifact** = `MarketingBrief` · `CreativeSet` · `CampaignDraft` · `CampaignReport` ·
  `ExecutiveReport`.
- **[GAP]** = friction/absence in today's lifecycle worth resolving in Book B.
- **[Roadmap]** = deliberately-absent capability already documented as future.

---

## Scenario 1 — New client, happy path (SaaS product launch)

**Setup.** A B2B SaaS company, "Northwind Analytics", engages the agency to launch a new
plan tier. The agency admin sets up the account.

| # | Action | Real mechanism | Resulting state/artifact |
|---|---|---|---|
| 1 | Create `Workspace` (agency tenant) | `agency-os` workspace, status `active` | Workspace ready |
| 2 | Create `Client` "Northwind", industry `software` | `Client.create`, requires `contact.email` | Client `active` |
| 3 | Create `Brand` (voice, values, dos/donts) | `Brand.create`; rules incl. `bannedWords` | Brand `active` |
| 4 | Create `Product` "Northwind Pro", subscription $49/mo | `Product`; **`subscription` requires `period`** | Product `active` |
| 5 | Create `Project` + `Mission` "Launch Pro tier, target 200 signups" | Mission `brief` (≥10 chars), `targetMetric` | Mission `submitted` |
| 6 | Generate brief (Phase 2) | `plan()` → then `requestApproval('strategy_and_budget')` | State `planning → awaiting_approval`; `MarketingBrief` created |
| 7 | Human approves strategy & budget | `approve('strategy_and_budget')` | State **back to `planning`** |
| 8 | Generate creative (Phase 3) | `requestApproval('creative_assets')` | State `awaiting_approval`; `CreativeSet` (6 copy fields) |
| 9 | Human approves creative | `approve('creative_assets')` | State `planning` |
| 10 | Generate campaign draft (Phase 4) | `requestApproval('campaign_launch')` | State `awaiting_approval`; `CampaignDraft` (status `draft`) |
| 11 | Human approves launch gate | `approve('campaign_launch')` | State `planning`; **draft is NOT launched** — human takes it to the ad platform manually |
| 12 | Enter real metrics after the flight, generate report (Phase 5) | `computeKpis()` on hand-entered `impressions/clicks/…/spend/revenue` | `CampaignReport` (CTR/CPC/CPA/CPL/ROAS/ROI) |
| 13 | Generate executive dashboard (Phase 10) | single AI synthesis | `ExecutiveReport`, verdict e.g. `on_track` |
| 14 | Record learning (Phase 6) | writes Company Brain + Executive Memory, then `startExecuting()` + `complete()` | State `executing → completed` |

**Reads cleanly.** The core value path — brief → creative → draft in one gated, AI-assisted
flow — works and is a genuine **production-time ↓** win.

### Gaps surfaced (Scenario 1)

1. **[GAP] `approve()` returns the mission to `planning`, not forward.** Steps 7/9/11
   each land back in `planning`, and it is the *next generator* that advances the flow.
   On paper this is counter-intuitive ("I approved — why is it 'planning' again?") and
   makes the state, on its own, a poor signal of "how far along are we". *Book B should
   introduce an explicit phase/progress concept distinct from the mission status.*
2. **[GAP] The `campaign_launch` gate approves a draft that is then launched by hand.**
   The gate name implies launch, but the product **never launches** (correct, by
   design). The last mile — export/handoff to the ad platform and getting real metrics
   back — is entirely manual and undocumented as a step. *Revenue ↑ opportunity for Book
   B: a structured export/handoff + metric-return checklist (still no live connector).*
3. **[GAP] Metrics are hand-entered (step 12).** Nothing validates them; a fat-fingered
   `spend` silently corrupts every KPI and the executive verdict. *Book B needs input
   validation / sanity bounds on the analytics form.*
4. **[GAP] Completion is coupled to "record learning".** `complete()` only happens
   inside Phase 6; a mission that reports but skips learning never reaches `completed`.
   *Book B should decouple "done" from "learned", or make learning unskippable.*

---

## Scenario 2 — Revision loop & brand-safety (regulated client)

**Setup.** A financial-services client with strict compliance language. The brand's
`bannedWords` include "guaranteed" and "risk-free". First creative round uses
"guaranteed returns".

| # | Action | Real mechanism | Result |
|---|---|---|---|
| 1 | Brief approved as in Scenario 1 | `strategy_and_budget` | State `planning` |
| 2 | Generate creative | `CreativeSet` incl. `adCopy` = "…guaranteed returns…" | State `awaiting_approval` (`creative_assets`) |
| 3 | Compliance reviewer spots the banned term | **Human review only** — see gap 1 | — |
| 4 | Reviewer opens an `Approval`, requests revision | `Approval.requestRevision()` → `revision_requested`; timeline entry appended | Revision tracked |
| 5 | Reviewer rejects the gate | On the mission side, a reject calls `mission.fail(reason)` | State `failed` — see gap 2 |
| 6 | Re-generate compliant creative | new `CreativeSet` | — |
| 7 | Re-submit for approval | `Approval.submit()` (`revision_requested → in_review`) | back in review |
| 8 | Approve | `approve('creative_assets')` + `Approval.approve()` | State `planning`; timeline shows full history |

### Gaps surfaced (Scenario 2)

1. **[GAP — highest value] `bannedWords` are stored but never enforced.** Brand safety
   depends entirely on a human catching the term at step 3. For a regulated client this
   is a real **revenue-and-liability risk**. This is the single most valuable Book B
   candidate: a pre-approval lint that checks `CreativeSet` copy against Brand
   `bannedWords` (and Company Brain forbidden words) and flags violations before a human
   ever sees them — pure **production-time ↓** *and* risk reduction. (Enforcement is
   currently [Roadmap]; the walkthrough shows *why it should be early in Book B*.)
2. **[GAP] Rejection is destructive: a gate reject calls `mission.fail()`.** A single
   "please tweak the headline" can terminate the mission (`failed`), and there is **no
   documented transition from `failed` back into the flow**. The generic `Approval`
   aggregate has a graceful `revision_requested` loop, but the *mission* does not — the
   two approval mechanisms disagree on how a revision behaves. *Book B must reconcile
   them: a revision should be a loop, not a death.*
3. **[GAP] Two parallel approval models with no defined binding.** `Approval`
   (draft/in_review/approved/rejected/revision_requested + timeline) and the Mission
   gates are documented as separate; on paper a reviewer isn't told which one is
   authoritative for a given decision. *Book B should define exactly one canonical
   approval path per decision, and how the timeline attaches to a mission gate.*
4. **[GAP] The default gate array omits `creative_assets`.** The mission's default
   `approvalGates` is `['strategy_and_budget','campaign_launch']`, yet creative *is*
   gated by the pipeline. Because the array is advisory this "works", but a reader
   auditing which gates a mission enforces would be misled. *Book B: make the gate set
   authoritative and self-describing.*

---

## Scenario 3 — Under-performing campaign & the learning loop (e-commerce)

**Setup.** A returning e-commerce client. A previous mission is `completed`. A new
seasonal campaign under-delivers: ROAS comes back at `0.8x`.

| # | Action | Real mechanism | Result |
|---|---|---|---|
| 1 | Flow runs to `CampaignDraft` as before | gates as usual | State `planning` |
| 2 | Post-flight, enter metrics: spend 10,000 / revenue 8,000 | `computeKpis()` | `ROAS = 0.8x`, `ROI = −20%` |
| 3 | Generate executive dashboard | AI synthesis | `ExecutiveReport` verdict **`at_risk`** |
| 4 | Record learning | Company Brain `enrich()` (sample-weighted), Executive Memory, Decision Journal | Mission `completed`; brain updated |
| 5 | Next mission for same brand should benefit from step 4 | Company Brain patterns/experience | — see gaps |

### Gaps surfaced (Scenario 3)

1. **[GAP] Learning is in-memory only.** Company Brain and Executive Memory are real but
   not durably stored; **on restart, every prior campaign's learning is lost**. The
   compounding-advantage promise ("remembers what works" → **revenue ↑**) silently
   evaporates between sessions. *Book B / infra: the durable store ([Roadmap]) is a
   prerequisite for the learning loop to deliver its value; the walkthrough shows the
   feature is hollow without it.*
2. **[GAP] The learning is written but its *read-back* into the next mission is
   undefined.** Step 5 assumes the next brief/creative uses the enriched brain, but no
   documented step feeds Company Brain patterns into `MarketingBrief`/`CreativeSet`
   generation. On paper, the loop writes but doesn't visibly close. *Book B core thesis:
   define exactly how prior insights condition the next generation.*
3. **[GAP] No priority, no retry, no comparison.** A mission has no priority field and no
   retry policy; an `at_risk` result triggers no structured "iterate / try variant B"
   path. The agency's natural next move (spin a corrective mission) is unmodeled.
   *Book B: a variant/optimization mission type ([Roadmap] taxonomy) with an explicit
   link to the mission it improves.*
4. **[GAP] `at_risk` is a dead end.** The `ExecutiveReport` renders a verdict and
   `nextActions[]`, but nothing consumes them — there is no mechanism to turn a
   recommended next action into a new mission. *Book B: close verdict → action → new
   mission.*

---

## Consolidated findings (Book B input backlog)

Ranked by value-rule impact. Each is a candidate for Book B; none require reopening
Book A's faithful description of today's code.

| # | Finding | Type | Value-rule impact |
|---|---|---|---|
| B-1 | Enforce Brand `bannedWords` / forbidden words as a pre-approval creative lint | brand-safety | **Revenue ↑** (risk) + **Time ↓** (fewer human catches) |
| B-2 | Close the learning loop: feed Company Brain insights into the next brief/creative | learning | **Revenue ↑** (win-rate compounding) |
| B-3 | Reconcile the two approval models; make revision a loop, not `fail()` | approvals | **Time ↓** (no restart on tweak) |
| B-4 | Introduce explicit phase/progress separate from mission status | lifecycle clarity | **Time ↓** (less confusion, fewer errors) |
| B-5 | Durable store for Company Brain / Executive Memory | infra ([Roadmap]) | **Revenue ↑** (learning survives restart) |
| B-6 | Validate hand-entered analytics inputs | data quality | **Revenue ↑** (correct decisions) |
| B-7 | Verdict → `nextActions` → new (variant/optimization) mission | closed loop | **Revenue ↑** + **Time ↓** |
| B-8 | Structured draft → ad-platform handoff & metric-return checklist (still no connector) | last mile | **Time ↓** |
| B-9 | Make the mission gate set authoritative & self-describing | correctness | (integrity) |
| B-10 | Decouple `complete()` from Phase-6 learning (or make learning unskippable) | lifecycle | (integrity) |

**Top three to seed Book B:** **B-1** (bannedWords enforcement), **B-2** (close the
learning loop), **B-3** (non-destructive revision). Each is directly justified by a
scenario above and each passes the value test cleanly.

---

## Conclusion

The three walkthroughs confirm Book A's lifecycles are **coherent and faithful**, and
that the happy path already delivers a real production-time win. They also expose ten
concrete gaps — most importantly that **brand-safety enforcement, the learning read-back,
and non-destructive revision** are the highest-value work for **Book B — AI Campaign
Factory**. Resolving them there means Book B is built on a foundation whose rough edges
are already known and prioritized, exactly as intended by doing this on paper first.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
