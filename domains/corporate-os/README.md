# Corporate Operating System (COS)

> **Layer:** Governance (above Organization) · **Build:** BOOK 5 · **Status:** 🟡 scaffolded (ports + event contract defined, engines pending — see `/ROADMAP.md`)

The rule engine of the AI Company. **No department works without SOPs.** Every operation follows a documented, versioned, testable procedure that produces measurable outputs — this is what separates AdOS from a mere collection of agents.

## Sub-modules
- **SOP Engine + SOP Library** — hundreds of versioned procedures (Create Campaign, Weekly Review, Lead Qualification, Image/Video/Copy, KVKK, Invoice…)
- **Quality Engine** — QA gates on every artifact (brand fit, spelling, logo, CTA, dimensions)
- **Compliance Engine** — approve / mask / reject against channel + legal rules (banned words, trademark, KVKK/GDPR PII)
- **Policy Engine** — `if CTR < 2 → regenerate creative`, `if ROAS < 3 → pause campaign`
- **Approval Engine** — budget > 100k → CEO; new brand → Creative Director
- **Risk Engine** — competitor outspend / critical CTR → escalate to CEO
- **Audit Engine + Decision Log** — every action and every *why* is recorded and traceable
- **Continuous Improvement Engine** — analyzes recent SOP runs and proposes improved SOP versions
- **Best Practice Engine** — captures winning work as reusable templates
- **Corporate Knowledge** — vertical experience (best CTA/color/headline for "dental", etc.)
- **AI Academy** — trains & certifies new agents on SOPs, brand rules, and past campaigns before they reach production

## Published events
`cos.sop.started.v1` · `cos.sop.step.completed.v1` · `cos.sop.completed.v1` · `cos.quality.failed.v1` · `cos.compliance.rejected.v1` · `cos.approval.required.v1` · `cos.risk.escalated.v1` · `cos.decision.logged.v1` · `cos.sop.improved.v1`

## Consumed events
`mission.*` · `campaign.*` · `creative.*` · `analytics.*` · `exec.*`
