# AdOS Sales Kit Constitution

**Owner:** Office of the Chief Revenue Officer
**Status:** Official — binding on every Sales Kit artifact
**Audience:** Account Executives, Solution Engineers, Partners, Channel
**Version:** 1.0.0 · Aligned to AdOS v1.0.0

---

## 0. Purpose

This Constitution is the single source of truth for the AdOS Sales Kit. Every
other artifact in `sales/` — the one-pager, brochure, ROI calculator, case
studies, objection playbook, FAQ, and proposal template — **must** conform to
the terminology, claims, brand, and messaging defined here. Where a downstream
document appears to contradict this Constitution, the Constitution wins and the
document is defective.

The Sales Kit exists so that **any qualified salesperson can introduce, explain,
qualify, demonstrate, and sell AdOS consistently — without requiring engineering
support.** If a salesperson needs to phone an engineer to answer a routine
buyer question, the Kit has failed and must be extended.

---

## 1. Canonical facts (the single source of truth)

These facts are **binding**. Never contradict them. Never soften them. Never
embellish beyond them.

### 1.1 What AdOS is

AdOS is an **AI-powered enterprise operating system** that runs **entirely on the
customer's own infrastructure**. It unifies an organization's knowledge, its
people, and its day-to-day work under one system with three pillars:

- **Company Brain** — the organization's private, permission-aware knowledge
  base. Every AI answer is grounded in the company's own documents and **cites
  its sources**. Citations are permission-scoped: a user only ever sees, and the
  AI only ever cites, documents that user is entitled to.
- **Digital Employees** — AI agents that perform real knowledge work: answering
  questions, drafting content, routing requests, preparing approvals, and moving
  workflows forward. They act within defined roles and permissions.
- **Workflows & Approvals** — structured business processes with tiered approval
  authority, full audit trails, and deterministic routing.

### 1.2 The non-negotiable technical truths

| Fact | Statement |
|---|---|
| **Local AI** | All AI inference runs on the customer's own hardware via a local engine (Ollama, or any OpenAI-compatible local server such as vLLM, LM Studio, llama.cpp, SGLang). |
| **No cloud dependency** | AdOS requires **no external API, no API keys, and no internet connection** to operate. |
| **Data sovereignty** | Customer data — documents, prompts, answers, workflows — **never leaves the customer's premises**. There is no telemetry of business content. |
| **On-Prem** | AdOS deploys on-premise (or in the customer's private cloud/VPC). The customer owns the entire stack. |
| **Offline-first** | The platform is designed to run fully air-gapped. |
| **Multi-tenant** | Strict tenant isolation; one deployment can serve multiple business units with segregated data. |
| **Bilingual** | Full Turkish and English UI, auto-detected from the user's environment. |
| **Auditable** | Every consequential action is recorded in an immutable audit trail. |
| **Permission-aware AI** | The AI can never surface content a user is not authorized to see. |

### 1.3 What AdOS is **not**

- Not a public cloud SaaS. Not a wrapper around a hosted AI API.
- Not dependent on OpenAI, Anthropic, Google, or any external model provider.
- Not a chatbot bolted onto a website. It is an operating layer for the business.
- Not a data collector. AdOS does not monetize, transmit, or train on customer data.

> **The one sentence every salesperson must be able to say:**
> *"AdOS is an enterprise AI operating system that runs 100% on your own
> infrastructure — your data never leaves your building, and it works with no
> internet at all."*

---

## 2. Sales philosophy

1. **Sell sovereignty, not features.** The category-defining value of AdOS is
   that the customer keeps total control of their data and their AI. Lead with
   control, trust, and independence; features are proof, not the pitch.
2. **Truth over hype.** We never overstate. A claim we cannot demonstrate in the
   demo or defend with evidence does not get made. Honesty is a competitive
   weapon against cloud-AI incumbents who cannot say "your data stays here."
3. **Value before price.** No pricing conversation before the buyer has quantified
   the problem. The ROI calculator, not the rate card, opens the commercial door.
4. **Demonstrate, don't describe.** Every major claim maps to something the buyer
   can *see* in the demo environment (NovaMak). "Show the citation" beats "trust
   the answer."
5. **Consultative, not transactional.** We diagnose before we prescribe. A
   discovery call that ends in "AdOS isn't right for you yet" builds more pipeline
   than a forced close.
6. **The champion sells internally.** Our job is to arm an internal champion to
   win the room we're not in. Every artifact is built to be forwarded.

---

## 3. Target customer profiles (ICP)

### 3.1 Firmographic fit

- **Size:** 250–10,000 employees; multi-site or multi-unit organizations.
- **Geography:** Turkey-first (TR/EN native), extensible to any data-sovereign market.
- **IT posture:** Owns or controls its infrastructure; has an IT/BT function.
- **Data sensitivity:** Handles information that must not leave the premises.

### 3.2 Priority verticals

| Vertical | Why AdOS fits |
|---|---|
| **Manufacturing** | Distributed sites, tacit process knowledge, approval-heavy operations. |
| **Organized Industrial Zones (OSB)** | Shared services across many member firms; data-residency expectations. |
| **Municipalities & public institutions** | Legal data-residency mandates; on-prem is required, not preferred. |
| **Healthcare** | Patient/clinical confidentiality; strict access control. |
| **Logistics** | High document volume, time-critical routing and approvals. |
| **Retail** | Distributed workforce, high query volume, training load. |
| **Education** | Large knowledge bases; budget-sensitive; on-prem labs. |
| **Finance** | Regulatory data-residency and auditability; zero tolerance for leakage. |

### 3.3 Disqualifiers (be honest early)

- Wants a fully managed public-cloud SaaS with no infrastructure of its own.
- Has no local compute and no willingness to provision any.
- Needs a frontier-scale model for a task a local model cannot serve, with no
  tolerance for the honest latency/quality trade-offs of on-prem inference.

---

## 4. The buying committee

| Role | What they care about | What we lead with |
|---|---|---|
| **CEO / General Manager** | Strategic edge, risk, outcomes, ROI | Sovereign AI as competitive advantage; measurable business outcomes |
| **CIO** | Fit with IT strategy, TCO, supportability | On-prem control, no vendor lock-in, predictable cost |
| **CTO** | Architecture, model choice, extensibility | Open local engines, OpenAI-compatible, no black box |
| **CISO / Security** | Data leakage, attack surface, compliance | Data never leaves premises; air-gap capable; full audit trail |
| **HR / People** | Adoption, training load, knowledge retention | Company Brain retains institutional knowledge; bilingual UX |
| **Operations** | Process efficiency, approvals, throughput | Workflow & approval automation; Digital Employees |
| **IT / BT (operators)** | Deployment, backup, day-2 ops | One-command deploy, standard Docker, documented runbooks |
| **Finance / Procurement** | Cost model, payback, contract terms | Value-based pricing, no per-token cost, clear payback period |

**Rule:** Identify the **economic buyer** (usually CEO/GM or CIO), the
**technical evaluator** (CTO/CISO), and the **champion** (often Operations or HR)
in every deal. Map a message to each before advancing.

---

## 5. Buyer journey

1. **Awareness** — "Cloud AI means our data leaves the building. Is there another
   way?" → One-pager, brochure.
2. **Interest** — "Could this work for us?" → Discovery call, vertical case study.
3. **Consideration** — "What's the return?" → ROI calculator, live NovaMak demo.
4. **Evaluation** — "Prove it on our terms." → Technical deep-dive, security review,
   pilot on customer hardware.
5. **Decision** — "What does it cost and how do we start?" → Proposal, commercial
   terms, acceptance criteria.
6. **Onboarding & Expansion** — deploy, seed the Company Brain, add Digital
   Employees, expand to more units/sites.

Each stage has a **primary artifact** (above) and an **exit criterion** (below,
§6). Never advance a stage whose exit criterion is unmet.

---

## 6. Qualification criteria

Qualify with **MEDDIC-L** (MEDDIC + Local-fit):

- **M**etrics — the buyer can name the numbers a win moves (search time, approval
  delay, training cost).
- **E**conomic buyer — identified and engaged.
- **D**ecision criteria — data sovereignty and on-prem are on the list.
- **D**ecision process — steps, approvers, and timeline are known.
- **I**dentify pain — a real, funded, top-3 problem (not curiosity).
- **C**hampion — an internal advocate who will sell when we're not in the room.
- **L**ocal-fit — the customer has (or will provision) local compute, and accepts
  the on-prem operating model.

A deal is **qualified** only when all seven are satisfied. Track them in the CRM.

---

## 7. Discovery process

Discovery precedes every demo. Run it in four movements:

1. **Situation** — org shape, sites/units, existing IT, current AI stance.
2. **Problem** — where knowledge is lost, where approvals stall, where training
   repeats, where data-residency worries live.
3. **Impact** — quantify it (feeds the ROI calculator inputs directly).
4. **Vision** — paint the after-state in the buyer's own words, then map it to a
   NovaMak demo scene.

**Discovery question bank (starter):**
- "When someone needs an answer buried in your documents, how long does it take?"
- "How many approvals a week wait on a person rather than a rule?"
- "What happens to knowledge when an expert leaves?"
- "Where is it unacceptable for your data to leave the building?"
- "What has stopped you from adopting AI so far?"

The output of discovery is a filled-in ROI input set and a mapped demo agenda.

---

## 8. Value proposition framework

Every value statement follows **Sovereignty → Capability → Outcome**:

- **Sovereignty (the differentiator):** Your data and your AI stay entirely
  under your control, on your hardware, offline-capable.
- **Capability (the how):** Company Brain, Digital Employees, Workflows &
  Approvals — permission-aware and auditable.
- **Outcome (the why-it-matters):** Faster answers, fewer stalled approvals,
  retained knowledge, lower training cost, quantifiable ROI.

**The three headline value pillars (use everywhere, in this order):**
1. **Sovereign** — 100% on your infrastructure; data never leaves.
2. **Capable** — a real AI operating system, not a chatbot.
3. **Accountable** — permission-aware, cited, and fully audited.

---

## 9. Objection handling framework

For **every** objection, answer in five beats (this structure is mandatory and is
the schema used by `OBJECTION_HANDLING.md`):

1. **Acknowledge** the concern as legitimate.
2. **Reframe** to the underlying interest.
3. **Answer** with the canonical fact (§1).
4. **Prove** with evidence or a demo moment.
5. **Advance** with a concrete next action.

Never argue. Never disparage a competitor by name. Convert every objection into
a demonstration.

---

## 10. ROI communication

- ROI is always presented as a **model the buyer controls**, with visible inputs
  and assumptions — never as a guaranteed number.
- Lead with **payback period** (months) and **annual savings**; support with
  time-savings and efficiency gains.
- Anchor on the customer's own discovery numbers. Our defaults are illustrative
  and clearly labeled as such.
- The four output headlines: **Annual Savings, ROI %, Payback Period,
  Efficiency Gain**.
- Never present ROI without the **assumptions panel** visible. Honesty protects
  the deal at renewal.

---

## 11. Security messaging

- **Primary claim:** "Your data never leaves your premises." Everything else
  supports this.
- **Attack surface:** no external API calls means no third-party data path to
  breach; air-gap capable.
- **Access control:** permission-aware AI — the model cannot cite or reveal what a
  user may not see.
- **Auditability:** every consequential action is in an immutable audit trail.
- **Compliance posture:** on-prem/air-gap directly satisfies data-residency
  mandates (public sector, healthcare, finance).
- **Discipline:** we describe our architecture and controls; we do not claim
  specific certifications AdOS has not earned. State what is true.

---

## 12. Local AI messaging

- AdOS runs open, local models through a local inference engine. **No API. No keys.
  No internet required.**
- The customer **chooses and owns the model**; models can be swapped without
  re-architecting.
- **Honest trade-off:** local inference on modest CPU hardware is slower than a
  hosted frontier API (seconds, not milliseconds). We state this plainly and show
  how sovereignty, cost, and control outweigh it — and how better hardware closes
  the gap.
- Cost model advantage: **no per-token billing**. Inference cost is your
  electricity and hardware, not a metered API bill.

---

## 13. On-Prem messaging

- The customer owns the **entire** stack — application, data, and model.
- Deploys with standard, documented tooling (Docker; one-command bring-up).
- **No lock-in:** open engines, OpenAI-compatible interface, portable data,
  exportable everything.
- Day-2 is covered: documented backup, restore, upgrade, and disaster-recovery
  runbooks ship with the platform.

---

## 14. Competitive positioning

We position **by category**, not by feature-war. Three archetypes:

| Competitor archetype | Their pitch | Our reframe |
|---|---|---|
| **Public cloud AI (hosted assistants/APIs)** | "Best models, zero infra" | "…and your data leaves the building, metered forever. AdOS keeps it home, unmetered." |
| **On-prem point tools (search, chatbots)** | "We're local too" | "A search box isn't an operating system. AdOS unifies knowledge, agents, and approvals — permission-aware and audited." |
| **Build-it-yourself** | "We'll assemble our own" | "You'd rebuild permissions, citations, audit, workflows, bilingual UX, and day-2 ops. AdOS is that, done and supported." |

**Rules of engagement:** never name-and-shame; compete on sovereignty,
integration, and accountability; concede honest trade-offs (§12) to keep trust.

---

## 15. Demo strategy

- The demo is the **NovaMak Endüstri A.Ş.** environment — a complete, internally
  consistent, deterministic enterprise world (see `demo/`).
- Demo to the **discovered pain**, not a fixed tour. Map each scene to a problem
  the buyer named.
- **Mandatory proof moments:**
  1. Ask the Company Brain a question → show the **cited** answer.
  2. Show that a restricted document is **invisible** to an unentitled user.
  3. Run a workflow through a **tiered approval**.
  4. Show a **Digital Employee** completing a real task.
  5. Pull the network cable (or show air-gap) → **it still works**.
- Always reset the demo to a known-good state before each session (deterministic
  reset; identical every time).

---

## 16. Proposal strategy

- The proposal is a **consulting deliverable**, not a quote. It restates the
  customer's challenge in their words, then maps solution → architecture →
  timeline → deliverables → responsibilities → support → commercials → acceptance.
- Commercial figures are **placeholders** until Deal Desk fills them; the template
  never ships with invented prices.
- Every proposal defines **acceptance criteria** up front, so "done" is objective.

---

## 17. Pricing presentation principles

- **Value-based, not cost-plus.** Anchor price to quantified value (ROI output),
  never to feature count.
- **Transparent structure:** platform license + support/success, per deployment
  or per-seat band — **no per-token or per-query metering** (local inference has
  no marginal API cost).
- **Present price only after value is quantified** and the champion is aligned.
- **One number at a time:** payback first, then annual investment, then terms.
- Discounting is principled and Deal-Desk-governed; never improvised in the room.

---

## 18. Follow-up strategy

- Every meeting ends with a **scheduled** next step and an owner.
- Recap within 24 hours: decisions, open items, the artifact that answers the top
  open question, and the agreed date.
- Advance the **exit criterion** (§5–6), not just "keep in touch."
- Multi-thread: never let a deal rest on a single contact.

---

## 19. Success metrics

**Leading:** discovery calls held, qualified opportunities (MEDDIC-L complete),
demos delivered, ROI models built with the buyer, pilots started.
**Lagging:** win rate, average deal cycle, average contract value, payback period
sold, expansion rate (units/sites/seats added), reference customers created.
**Health:** every advancing deal has a named economic buyer, technical evaluator,
and champion.

---

## 20. Brand, terminology & style (binding on all artifacts)

### 20.1 Canonical terminology — use these exact terms

| Use | Never use |
|---|---|
| **AdOS** (always this capitalization) | ADOS, Ados, adOS, "the AdOS platform" as a name |
| **Company Brain** | knowledge base (as the product name), "the brain" |
| **Digital Employees** | bots, chatbots, assistants (as the product name) |
| **Workflows & Approvals** | "the workflow thing" |
| **Local AI** / **on-premise** | "on-prem cloud", "private cloud AI" (unless VPC) |
| **data sovereignty** | "data safety" (weaker, imprecise) |
| **permission-aware** | "secure AI" (vague) |
| **enterprise AI operating system** | "AI tool", "AI app" |

### 20.2 Voice

Confident, precise, and honest. Executive-readable. No hype adjectives
("revolutionary", "magic"). Prefer verbs and numbers. Short sentences.

### 20.3 Bilingual rule (TR/EN)

- Every buyer-facing artifact ships **Turkish and English**, presented
  side-by-side or in clearly labeled sections.
- Product terms **stay in English** in both languages: *Company Brain*, *Digital
  Employees*, *AdOS*. Do not translate product names.
- Turkish copy is native and idiomatic, not a literal translation. Both languages
  carry the same claims and numbers — **no claim exists in one language only.**

### 20.4 Claim discipline

- Every claim traces to §1 (canonical facts) or to a labeled model assumption
  (ROI) or a labeled illustrative case study.
- Case studies are **explicitly fictional/illustrative** and say so.
- No certification, customer name, or metric is presented as real unless it is.

---

## 21. Sales Kit inventory & governance

| Artifact | Purpose | Audience |
|---|---|---|
| `SALES_KIT_CONSTITUTION.md` | This document — the frame | Internal |
| `ONE_PAGER.md` | Executive summary, 1 page | CEO/GM/Board |
| `BROCHURE.md` | Premium overview, ~12 pages | Buying committee |
| `ROI_CALCULATOR_SPEC.md` | ROI model definition | Internal / SE |
| `roi-calculator/` | The working offline calculator | SE + buyer |
| `CASE_STUDIES.md` | Vertical proof (illustrative) | Buyer |
| `OBJECTION_HANDLING.md` | Objection playbook | AE / SE |
| `SALES_FAQ.md` | 100+ Q&A | AE / SE / buyer |
| `PROPOSAL_TEMPLATE.md` | Customer proposal | AE / Deal Desk |
| `SALES_KIT_VALIDATION_REPORT.md` | Consistency audit | Internal |

**Governance:** the CRO office owns this Kit. Any change to a canonical fact
(§1), term (§20.1), or claim propagates to **every** artifact in the same change.
The validation report (`SALES_KIT_VALIDATION_REPORT.md`) is the gate: the Kit is
"official" only when validation passes with zero contradictions.

---

*This Constitution governs all AdOS sales materials. It is isolated in `sales/`
and references — but never modifies — the AdOS application, its packages, or its
tests.*
