# AdOS Sales FAQ

**Owner:** Office of the Chief Revenue Officer
**Status:** Official — conforms to `SALES_KIT_CONSTITUTION.md` and the canonical brief
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Audience:** Account Executives, Solution Engineers, Partners, and buyers

> This FAQ contains **107 questions** with substantive answers, presented first in
> English, then in Turkish with identical questions, order, and numbering. Both
> languages carry the same claims and numbers. Product terms — **AdOS**, **Company
> Brain**, **Workflows & Approvals** — stay in English in both languages. AdOS is
> positioned as an **Enterprise AI Operating System for Advertising** (an AI
> advertising-agency OS, "Agency OS"). Where an answer references a not-yet-built
> capability, it is marked explicitly as **Roadmap**.

---

# English

## General

**Q1. What is AdOS in one sentence?**
AdOS is an Enterprise AI Operating System for Advertising that runs 100% on your own infrastructure — your data never leaves your building, and it works with no internet at all. It is an AI advertising-agency OS ("Agency OS") that takes a client's advertising objective through a human-approved pipeline: marketing brief → creative copy → campaign draft → performance report → executive dashboard. Its pillars are the Company Brain (a marketing-performance memory), the human-approved campaign pipeline, and Workflows & Approvals.

**Q2. What are the three pillars of AdOS?**
Company Brain is your private marketing-performance memory: it records which campaigns, creatives, and channels worked and surfaces those patterns to inform the next brief. The human-approved campaign pipeline turns an advertising objective into a marketing brief, creative copy, and a campaign draft, with AI assisting each stage and a person approving before it advances. Workflows & Approvals are structured processes with explicit human approval gates, deterministic routing, and an activity log plus a per-approval timeline of every step.

**Q3. How is AdOS different from a public cloud AI assistant?**
A public cloud assistant sends your data to a third party's servers and meters you per token forever. AdOS runs entirely on hardware you own, so your data, prompts, and answers never leave your premises and there is no per-token bill. You own the whole stack: the application, the data, and the AI model.

**Q4. Is AdOS just a chatbot?**
No. A chatbot answers questions in a box; AdOS is an operating system for advertising that runs a human-approved campaign pipeline — brief, creative, campaign draft, performance report, and executive dashboard. Every stage is AI-assisted and human-approved, and the Company Brain remembers what worked, so the system moves real advertising work forward, not just conversation.

**Q5. Who is AdOS built for?**
Organizations of roughly 250–10,000 employees that run significant advertising and marketing and control their own infrastructure. Priority verticals include Manufacturing, Organized Industrial Zones (OSB), Municipalities and public institutions, Healthcare, Logistics, Retail, Education, and Finance. It is Turkey-first with native Turkish and English, and extensible to any data-sovereign market.

**Q6. What are the three headline value pillars?**
Sovereign, Capable, and Accountable, always in that order. Sovereign means it runs 100% on your infrastructure and your data never leaves. Capable means it is a real AI operating system for advertising, not a chatbot. Accountable means every stage is human-approved and recorded in an activity log and per-approval timeline.

**Q7. Is AdOS bilingual?**
Yes. AdOS ships a full Turkish and English user interface, auto-detected from the user's environment. Both languages are first-class, so a mixed workforce can each work in their preferred language against the same Company Brain.

**Q8. What version of AdOS is available today?**
AdOS is at version 1.0.0, a complete platform covering the Company Brain, the human-approved campaign pipeline, and Workflows & Approvals. It deploys with standard Docker and ships with documented backup, restore, upgrade, and disaster-recovery runbooks. It is designed for production on-premise use, not a preview.

**Q9. Can I see AdOS before buying?**
Yes. We demonstrate on NovaMak Endüstri A.Ş., a complete, internally consistent, deterministic demo environment representing a fictional manufacturer. The demo maps to the specific problems you name in discovery, and every major claim is something you can see live — including pulling the network cable to show it still works offline.

## Licensing

**Q10. How is AdOS licensed?**
AdOS is licensed as a platform: a platform license plus support and success, structured per deployment or per-seat band. There is no per-token or per-query metering because local inference has no marginal API cost. Exact terms are scoped per deployment and confirmed by Deal Desk.

**Q11. Is the license perpetual or subscription?**
Licensing terms are scoped per deployment and agreed in the proposal; we support the structure that fits your procurement model, whether term-based or otherwise. What is constant across every option is that there is no usage metering and no per-token billing. Deal Desk confirms the precise term, renewal, and support structure for your case.

**Q12. Does the license limit how many questions or tokens we can use?**
No. Because inference runs on your own hardware, your only marginal cost is electricity, not a metered bill. You can run the AI pipeline and query the Company Brain as often as your hardware allows, without any per-query or per-token charge.

**Q13. Is the AI pipeline licensed separately?**
No. The AI-assisted pipeline stages are part of the AdOS platform, and how the platform is packaged is defined in your specific deployment scope. There is no per-message or per-token charge for AI work, since it runs on your local inference engine. Deal Desk scopes any seat or deployment bands that apply.

**Q14. What happens to our access if the contract ends?**
Because AdOS runs on your infrastructure and your data is yours, you retain your data and can export everything. There is no vendor lock-in: AdOS uses open engines and an OpenAI-compatible interface, and your data and configuration are portable. Post-contract operational specifics are defined in your agreement.

**Q15. Do we need internet or a license server to keep running?**
No. AdOS is offline-first and air-gap capable, so it does not phone home to validate a license in order to operate. The platform is designed to run fully disconnected from the internet.

**Q16. Can one license cover multiple business units or sites?**
Yes. AdOS provides application-level multi-tenant isolation, so one deployment can serve multiple business units with data scoped and segregated per tenant. How units and sites map to your commercial terms is scoped per deployment. This is a natural fit for multi-site manufacturers and Organized Industrial Zones serving many member firms.

**Q17. Is there a trial or pilot option?**
Yes. Our recommended path to evaluation is a pilot on your own hardware, so you validate AdOS on your terms with your data staying on your premises. The pilot has defined acceptance criteria agreed up front so that "success" is objective. Scope and duration are set with your team during evaluation.

## Security

**Q18. Where does our data go when we use AdOS?**
Nowhere outside your premises. Customer data — campaign data, prompts, drafts, and workflows — never leaves your infrastructure, and there is no telemetry of business content. This is the primary security claim, and everything else supports it.

**Q19. Does AdOS send anything to external AI providers like OpenAI or Anthropic?**
No. AdOS is not a wrapper around a hosted AI API and does not depend on OpenAI, Anthropic, Google, or any external model provider. All inference runs locally on your hardware, so there is no external data path to any AI vendor.

**Q20. Can AdOS run fully air-gapped?**
Yes. AdOS is offline-first and designed to run fully air-gapped, with no external API, no API keys, and no internet connection required to operate. This directly satisfies environments where the network is intentionally isolated, such as certain public-sector, healthcare, and finance settings.

**Q21. How does AdOS keep users from seeing data they shouldn't?**
Today AdOS provides application-level multi-tenant isolation: data is scoped and segregated by tenant, so one business unit's records are not visible to another. Enforced per-user, role-based access control and permission-aware AI — where the model itself is constrained to what an individual user may see — are on the **Roadmap**, not shipped today. We describe this honestly, and in the demo we show tenant separation rather than claiming per-user permission enforcement the platform does not yet have.

**Q22. Is there an audit trail?**
Yes, in the form of an activity log and a per-approval timeline: consequential actions such as approvals and workflow steps are recorded, giving Security and Compliance a record of what happened and when. Today this is structured logging and a bounded activity feed, not a tamper-evident store. A fully **immutable, append-only audit trail is on the Roadmap**; we do not claim it as shipped.

**Q23. What is the attack surface of AdOS?**
Because AdOS makes no external API calls, there is no third-party data path to breach, which materially reduces the attack surface compared to cloud AI. It is air-gap capable, and you control the entire perimeter because the whole stack runs on infrastructure you own. You apply your own network, identity, and hardening controls around it.

**Q24. Does AdOS train on our data or share it with anyone?**
No. AdOS does not monetize, transmit, or train on customer data. Your content stays yours; there is no telemetry of business content and no external model to send it to.

**Q25. How does AdOS support data-residency and compliance mandates?**
On-premise and air-gap operation directly satisfy data-residency mandates, because the data physically never leaves your premises. This is why on-prem is a requirement, not merely a preference, for many municipalities, healthcare providers, and financial institutions. We describe our architecture and controls honestly and do not claim certifications AdOS has not earned.

**Q26. Does AdOS claim specific security certifications?**
We describe what is true about our architecture and controls rather than claiming certifications the platform has not earned. Where your procurement requires specific certifications or attestations, we address that honestly against the current state during evaluation. The durable claim is architectural: your data never leaves your premises.

## AI

**Q27. What AI models does AdOS use?**
AdOS runs open, local models through a local inference engine such as Ollama, or any OpenAI-compatible local server like vLLM, LM Studio, llama.cpp, or SGLang. By default it also ships a deterministic offline generator that needs no model server at all. You choose and own the model, and models can be swapped without re-architecting the platform, with no dependency on any external provider.

**Q28. Do we need API keys or accounts with an AI company?**
No. AdOS requires no external API, no API keys, and no internet connection to run its AI. All inference happens on your own hardware, so there are no third-party AI accounts to manage or pay.

**Q29. How does the AI avoid making things up?**
AdOS constrains the AI to structured advertising inputs — the marketing brief, brand voice and rules, product data, and the Company Brain's past-campaign performance patterns — and the ad-KPI math (CTR, CPC, CPA, CPL, ROAS, ROI) is deterministic rather than generated. Every draft is human-reviewed and approved before it advances, so a person validates it in context. Document-level answers that cite a source passage are a **Roadmap** item, not a capability today.

**Q30. Can we choose or change the AI model later?**
Yes. You choose and own the model, and models can be swapped without re-architecting AdOS because the platform speaks an OpenAI-compatible interface. As better local models become available, you can adopt them on your own timeline. This flexibility is part of avoiding vendor lock-in.

**Q31. Is the local AI as fast as ChatGPT or other cloud services?**
We are honest about this: local inference on modest CPU hardware is slower than a hosted frontier API — think seconds, not milliseconds. Better hardware, such as GPUs, closes the gap significantly. The trade-off buys you sovereignty, no per-token cost, and full control, which for our buyers outweighs raw latency.

**Q32. Is the local model as capable as the biggest cloud models?**
Frontier hosted models can lead on some tasks, and we say so plainly. For drafting marketing briefs, ad copy, and campaign plans grounded in your brand and past-campaign performance, well-chosen local models are highly effective, and you can upgrade the model as the open ecosystem advances. If a task genuinely requires a frontier-scale model with no tolerance for on-prem trade-offs, we tell you honestly during discovery.

**Q33. What are "Digital Employees" — do you have AI agents?**
Today AdOS is a human-in-the-loop pipeline: the AI assists each stage — drafting the brief, the creative copy, the campaign draft, and the executive summary — and a person approves before anything advances. Fully autonomous "Digital Employees" or AI agents that carry out multi-step work on their own are on the **Roadmap**; they are not shipped today, and we do not present the pipeline as an autonomous agent workforce.

**Q34. Does the AI respect user permissions when generating answers?**
Today AdOS enforces application-level tenant isolation, so the AI operates within a tenant's data rather than across tenants. It does not yet enforce per-user, role-based scoping of what the AI can surface; permission-aware AI — the model constrained to an individual user's entitlements — is on the **Roadmap**. We state this plainly rather than overclaim.

**Q35. What hardware do we need to run the AI well?**
AdOS runs on hardware you provision, from CPU-only servers up to GPU-accelerated machines, and performance scales with what you provide. Modest CPU hardware works but is slower; GPUs meaningfully improve response times. During evaluation we size hardware to your expected user load and latency targets so expectations are set honestly.

## Deployment

**Q36. How is AdOS deployed?**
AdOS deploys with standard Docker and a one-command bring-up, on-premise or in your private cloud/VPC. Because it uses standard, documented tooling, your existing IT/BT team can operate it without exotic skills. The customer owns the entire stack after deployment.

**Q37. Can we deploy AdOS in our own data center?**
Yes. On-premise deployment in your own data center is the core model, and you can equally deploy into a private cloud or VPC you control. Either way, the whole stack — application, data, and model — runs on infrastructure you own or control.

**Q38. Does deployment require internet access?**
No. AdOS is offline-first and can be deployed and operated fully air-gapped, with no internet connection required. Where you have connectivity you may use it for convenience, but it is never a dependency for the platform to run.

**Q39. How long does a typical deployment take?**
The platform itself brings up with standard Docker in a single command, so the core install is fast. The realistic timeline is driven by seeding the Company Brain with your brand, product, and past-campaign data, and configuring Workflows & Approvals, which we plan with you. The proposal defines the deployment timeline and acceptance criteria explicitly.

**Q40. Do we need special skills to operate AdOS day to day?**
No exotic skills are required. AdOS uses standard Docker and ships documented runbooks for backup, restore, upgrade, and disaster recovery, so a normal IT/BT function can run day-2 operations. Support and success services back your team where needed.

**Q41. Can AdOS serve multiple sites from one deployment?**
Yes. AdOS provides application-level multi-tenant isolation, so a single deployment can serve multiple business units and sites with data scoped and segregated per tenant. This suits multi-site manufacturers and Organized Industrial Zones that provide shared services across many member firms.

**Q42. How do upgrades work?**
Upgrades follow a documented upgrade runbook that ships with the platform, so day-2 maintenance is planned, not improvised. Because you own the stack, you control when upgrades happen and can validate them in your environment first. There is no forced update pushed from a vendor cloud.

**Q43. What are the infrastructure prerequisites?**
You provide the compute — servers with CPU, optionally GPU acceleration — plus standard Docker hosting and storage for your campaign data, Company Brain, and activity log. Sizing depends on your user count, data volume, and latency targets, which we scope during evaluation. Because everything is local, there are no external API or connectivity prerequisites.

## Support

**Q44. What support comes with AdOS?**
AdOS is sold as a platform license plus support and success, so ongoing support is part of the commercial model. This covers helping your team operate, maintain, and get value from the platform. The exact support tiers and response terms are scoped in your agreement.

**Q45. Can a salesperson answer our questions without an engineer?**
Yes, by design. The Sales Kit exists so any qualified salesperson can introduce, explain, qualify, demonstrate, and sell AdOS without engineering support. For routine buyer questions, this FAQ and the wider kit are intended to be sufficient, with deeper technical deep-dives available for evaluation.

**Q46. What runbooks ship with AdOS?**
AdOS ships documented runbooks for backup, restore, upgrade, and disaster recovery. These make day-2 operations repeatable and reduce reliance on tribal knowledge. Your IT/BT team can follow them directly, with support available to assist.

**Q47. How do you handle problems in an air-gapped deployment?**
Because AdOS is designed to run air-gapped, support processes account for environments with no outbound connectivity, using documented runbooks and your team as the hands on site. Diagnostic and update procedures are defined so they can be executed without the platform phoning home. Specific support logistics for air-gapped sites are agreed in your plan.

**Q48. Is training part of support?**
Enablement is part of the support and success relationship, so your operators and users can become productive quickly. This spans operating the platform, seeding the Company Brain with your marketing data, and configuring the campaign pipeline and Workflows & Approvals. Specific training scope is agreed with your team.

**Q49. Who owns day-2 operations, us or AdOS?**
Because you own the stack, your IT/BT team runs day-2 operations, backed by documented runbooks and our support and success services. The division of responsibilities is defined explicitly in the proposal so there is no ambiguity. Many customers operate independently after enablement, calling on support as needed.

**Q50. Do you offer help seeding the Company Brain?**
Yes. Getting value depends on seeding the Company Brain with your brand, product, and past-campaign performance data, and this is part of onboarding. We work with your team to load that data, structure your workspace, and validate that the pipeline produces useful drafts. The onboarding scope is defined in your engagement.

**Q51. What happens when a new AdOS version is released?**
New versions ship with a documented upgrade runbook, and because you control the stack you decide when to apply them. Support and success help you plan and validate upgrades in your environment. There is never a forced push from a vendor cloud that changes your system without your control.

## Backup

**Q52. Does AdOS support backups?**
Yes. AdOS ships a documented backup runbook so you can protect your Company Brain, configuration, and activity log on a schedule you control. Because everything lives on your infrastructure, backups stay on your premises too.

**Q53. Where are backups stored?**
Backups are stored wherever you choose within your own infrastructure, because AdOS runs entirely on-premise and data never leaves your building. You apply your existing backup targets, retention policies, and encryption. Nothing is shipped to a vendor cloud.

**Q54. How do we restore from a backup?**
AdOS ships a documented restore runbook that pairs with the backup process, so recovery is a defined procedure rather than an improvisation. Your IT/BT team can execute it, with support available to assist. We recommend validating restores periodically as part of good practice.

**Q55. Is there a disaster-recovery plan?**
Yes. AdOS ships a documented disaster-recovery runbook alongside backup, restore, and upgrade procedures. This gives you a defined path to bring the platform back after a serious failure. Because you own the stack, your DR plan integrates with your existing infrastructure strategy.

**Q56. How often should we back up?**
Backup frequency is your decision, aligned to how often your Company Brain and configuration change and to your recovery objectives. The documented runbook supports scheduled backups so you can match your existing policies. We help you set a sensible cadence during onboarding.

**Q57. Do backups include the activity log?**
Your backup strategy can cover the full platform state, including the activity log and per-approval timeline, so your record of consequential actions is preserved. This matters for regulated verticals where a defensible record must survive a recovery event. The runbook documents what to include for a complete restore. (A fully immutable audit trail remains a **Roadmap** item.)

**Q58. Are backups portable if we move hardware?**
Yes. Because AdOS uses standard tooling and your data is portable and exportable, backups are not locked to a single vendor environment. This supports hardware refreshes and site moves without lock-in. Migration specifics are covered by the documented procedures.

**Q59. Does backup require any internet or cloud service?**
No. Backup and restore operate entirely within your infrastructure, consistent with AdOS being offline-first and air-gap capable. There is no dependency on a cloud backup service. You keep full control of where your backups live.

## Performance

**Q60. How fast are AdOS answers?**
Speed depends on the hardware you provide. On modest CPU-only hardware, local inference is slower than a hosted frontier API — seconds rather than milliseconds — and better hardware such as GPUs closes the gap significantly. We are deliberately honest about this trade-off and size hardware to your latency targets during evaluation.

**Q61. Why is local AI slower than cloud AI?**
Hosted frontier APIs run on very large, specialized data-center hardware, while local inference runs on the hardware you provision. That is the honest trade-off: you gain sovereignty, no per-token cost, and full control, at the cost of some latency on modest hardware. Investing in better local hardware, especially GPUs, materially improves response times.

**Q62. Can we improve performance?**
Yes. Performance scales with hardware, so adding GPU acceleration or stronger servers meaningfully reduces response times. You can also choose a local model sized to your latency and quality needs. Because you own the stack, these are your levers to pull whenever you choose.

**Q63. Does performance degrade with more users?**
Concurrent load is handled by the capacity you provision, and AdOS keeps tenants isolated at the application level. We size your deployment to your expected concurrent user count during evaluation so throughput meets your needs. As usage grows, you scale hardware on your own terms without any per-query cost.

**Q64. Are there per-query costs that grow with usage?**
No. There is no per-token or per-query metering; your only marginal cost is electricity and hardware. This means heavy usage does not create a runaway API bill, which is a core cost advantage over metered cloud AI. Cost predictability improves as usage scales.

**Q65. How much data can Company Brain hold?**
Company Brain is a marketing-performance memory: it stores brand profiles, creative and campaign records, a campaign→ad→lead→ROI knowledge graph, and a winning-ad pattern library. Practical capacity depends on the hardware and storage you provision, which we size with you during evaluation. Note it is a performance memory, not a general document repository — ingesting large arbitrary document bases is a **Roadmap** item.

**Q66. Does running offline hurt performance?**
No. Running offline or air-gapped does not slow AdOS, because inference is local either way; there is no round trip to the internet in normal operation. Performance is governed by your hardware, not by connectivity. This is why the platform runs identically with the network cable pulled.

**Q67. How do you set realistic performance expectations?**
During evaluation we size hardware to your expected user load and latency targets and state the trade-offs plainly. We would rather set honest expectations than oversell speed, because honesty protects the relationship at renewal. The pilot on your hardware validates real performance before you commit.

## Customization

**Q68. Can we tailor AdOS to our organization?**
Yes. Company Brain is seeded with your brand, product, and past-campaign data, the pipeline is configured to your workspace and clients, and Workflows & Approvals are set to your processes and approval gates. The platform is meant to reflect how your advertising actually works, not a generic template.

**Q69. Can we define our own Workflows & Approvals?**
Yes. Workflows & Approvals support structured business processes with explicit human approval gates (for example, strategy-and-budget and campaign-launch gates) and deterministic routing, configured to your rules. This is how approval-heavy operations are kept human-controlled. Every step is captured in the activity log and per-approval timeline. Tiered spend-authority levels (delegated T0–T4 limits) are a **Roadmap** item, not shipped today.

**Q70. Can we create AI roles for specific functions?**
Today you configure the pipeline to your own functions — the brief, creative, campaign, analytics, and executive stages — each AI-assisted and human-approved. In the NovaMak demo we illustrate roles across the organization, but these are AI-assisted stages, not autonomous workers. Fully autonomous "Digital Employees" that act on their own are on the **Roadmap**.

**Q71. Can we control who sees what?**
Today AdOS scopes and segregates data by tenant, so business units do not see each other's records. Fine-grained, per-user role-based access control — mapping every role and access rule so the AI itself is constrained to a user's entitlements — is on the **Roadmap**, not enforced today. We are explicit about this distinction so you can plan around the current state.

**Q72. Can we choose the AI model per our needs?**
Yes. You choose and own the model and can swap models without re-architecting, because AdOS speaks an OpenAI-compatible interface. This lets you balance latency, quality, and hardware for your specific use. As the open model ecosystem advances, you adopt improvements on your timeline.

**Q73. Is the user interface customizable to Turkish or English?**
Yes. AdOS provides a full Turkish and English UI, auto-detected from the user's environment, so each user works in their preferred language. Both languages are first-class against the same Company Brain. This suits mixed-language workforces common in Turkey-first organizations.

**Q74. Can AdOS reflect our multi-unit structure?**
Yes. AdOS provides application-level multi-tenant isolation, so it can mirror multiple business units and sites with data scoped and segregated per tenant from one deployment. The NovaMak demo models six sites, four business units, and sixteen departments to show this. Your structure is mapped during onboarding.

**Q75. How much customization is configuration versus custom code?**
The core tailoring — seeding the Company Brain, configuring the campaign pipeline, and setting Workflows & Approvals and gates — is configuration, not bespoke engineering. This keeps deployments repeatable and supportable by your IT/BT team. Where deeper extension is needed, the OpenAI-compatible, open-engine architecture avoids a black box.

## Integrations

**Q76. Does AdOS integrate with our existing systems?**
AdOS is built on open engines and an OpenAI-compatible interface, and your data is portable and exportable, which avoids a closed black box. Today it does not ship live connectors to ad platforms, CRMs, or data warehouses; performance metrics are entered through a form, and you export a campaign draft to run in your own tools. Direct external connectors are on the **Roadmap**, and integration scope is defined during evaluation.

**Q77. What inference engines does AdOS work with?**
AdOS works with Ollama and any OpenAI-compatible local server, including vLLM, LM Studio, llama.cpp, and SGLang. This gives you a choice of engine and lets you pick what suits your hardware and operations. You are never tied to a single proprietary engine.

**Q78. Do integrations require internet or external APIs?**
No. AdOS itself requires no external API, no API keys, and no internet to run, and it is air-gap capable. Any future integration is designed to respect that on-premise, offline-first posture. Nothing about the platform depends on a third-party cloud to function.

**Q79. Can we export our data out of AdOS?**
Yes. Your data is portable and exportable — campaign drafts and configuration included — which is central to our no-lock-in principle. You are never trapped: because you own the stack, you can take your content elsewhere if you choose. This protects you commercially and technically.

**Q80. Is there an OpenAI-compatible interface we can build against?**
Yes. AdOS uses an OpenAI-compatible interface to its local inference layer, which is a familiar, well-documented standard. This makes it straightforward for your team to work with, and it is a key reason models can be swapped without re-architecting. It also keeps the architecture from being a black box.

**Q81. Will integrating AdOS create vendor lock-in?**
No. The whole design resists lock-in: open engines, an OpenAI-compatible interface, and portable, exportable data. You own the application, the data, and the model, so you retain leverage and independence. This is a deliberate contrast to metered cloud AI.

**Q82. Can the AI act across our processes on its own?**
Today the AI assists defined pipeline stages — drafting briefs, creative, and campaign plans — and every consequential step waits for a human approval before it advances; nothing is launched to an ad platform automatically. Autonomous agents that route, act, and complete multi-step work without a human are on the **Roadmap**. We position the platform honestly as human-in-the-loop, not an autonomous actor.

**Q83. How do integrations respect permissions?**
Today access is scoped at the tenant level, so integrated access stays within a tenant's data rather than across tenants. Per-user, permission-aware enforcement — where the AI is constrained to what an individual user may see — is a **Roadmap** item. Any future integration is designed to operate within that model, and we describe the current state rather than overclaim.

## Pricing

**Q84. How much does AdOS cost?**
Pricing is value-based and scoped per deployment, so a specific figure is set for your situation rather than a published rate card. The structure is a platform license plus support and success, with no per-token or per-query metering. We quantify value with you first, then Deal Desk confirms the numbers.

**Q85. Why won't you quote a price up front?**
Because we anchor price to quantified value, not feature count, and we do not open a pricing conversation before the problem is quantified. The ROI model — built with your own discovery numbers — opens the commercial door. This protects you from paying for anything the value does not justify.

**Q86. Is pricing per token or per query?**
No. There is explicitly no per-token or per-query metering, because local inference has no marginal API cost. Your inference cost is your electricity and hardware, not a metered vendor bill. This makes cost predictable even at heavy usage.

**Q87. What is included in the price?**
The commercial model is a platform license plus support and success, structured per deployment or per-seat band. The exact inclusions are defined in your proposal, which is a consulting deliverable rather than a bare quote. There are no hidden usage charges layered on top.

**Q88. How do we justify the investment internally?**
We build an ROI model you control, with visible inputs and assumptions, leading with payback period and annual savings. It anchors on your own discovery numbers — campaign turnaround, creative throughput, wasted ad spend — and shows efficiency gains. The assumptions panel stays visible, so the case is honest and defensible at renewal.

**Q89. Is there a per-seat option?**
Pricing can be structured per deployment or per-seat band, depending on what fits your organization. The right structure is scoped with you, and Deal Desk confirms it. Whatever the structure, there is never per-token or per-query metering.

**Q90. Will costs spike if usage grows?**
No. Because there is no per-token or per-query billing, heavy usage does not create a runaway bill; your marginal cost is electricity and hardware. As you scale hardware, cost stays predictable and under your control. This is a core advantage over metered cloud AI.

**Q91. How is discounting handled?**
Discounting is principled and governed by Deal Desk, never improvised in the room. Commercial figures in the proposal are placeholders until Deal Desk fills them, and the template never ships with invented prices. This keeps pricing consistent and fair across deals.

## Training

**Q92. How hard is AdOS to learn for end users?**
AdOS is built to be usable in each person's own language, with a full Turkish and English UI auto-detected from their environment. Because the pipeline produces drafts that a person reviews and approves, users work with clear, structured outputs rather than learning prompt tricks. Enablement during onboarding gets users productive quickly.

**Q93. Do you provide training for our operators?**
Yes. Enablement is part of the support and success relationship and covers operating the platform, using the documented runbooks, and configuring the system. Your IT/BT team learns backup, restore, upgrade, and disaster-recovery procedures. Specific training scope is agreed with your team.

**Q94. How does AdOS reduce our ongoing training burden?**
Company Brain retains marketing-performance knowledge — which campaigns and creatives worked — so teams can build on proven patterns instead of starting each brief from scratch. This is especially valuable in high-turnover, distributed marketing functions. It also preserves what worked when an expert leaves.

**Q95. Does AdOS help retain knowledge when experts leave?**
Yes. Company Brain captures your marketing-performance knowledge — brand profiles, winning-ad patterns, and past-campaign outcomes — so that hard-won know-how does not walk out the door with a departing employee. New staff can build on proven patterns from day one. Marketing and HR teams value this for continuity and onboarding.

**Q96. Is training available in Turkish?**
Yes. AdOS is Turkey-first with native Turkish and English, so both the product and enablement serve Turkish-speaking teams natively. Turkish is first-class, not a literal afterthought. This suits Turkey-first organizations and mixed-language workforces.

**Q97. How long until users are productive?**
Because the interface is bilingual and the pipeline produces clear, reviewable drafts, users typically become productive quickly after content is seeded and the workspace is configured. The realistic path depends on onboarding your marketing data and configuring the pipeline, which we plan with you. Enablement is structured to shorten time to value.

**Q98. Do you configure the AI pipeline or do we?**
The pipeline is configured to your workspace, clients, and approval gates during onboarding, and we work with your team to define it. Because it runs on your local foundation, its scope is set by your configuration, not by an external service. You retain control of what each stage does and what must be human-approved. (Autonomous agents are a **Roadmap** direction, not today's model.)

**Q99. What onboarding is involved to get value?**
The path to value is seeding the Company Brain with your brand, product, and past-campaign data, configuring the campaign pipeline, and setting Workflows & Approvals. We support this as part of onboarding and define the scope in your engagement. Getting these right is what turns the platform into measurable outcomes.

## Migration

**Q100. Can we migrate our existing marketing data into Company Brain?**
Yes. Onboarding includes seeding the Company Brain with your brand, product, and past-campaign performance data so the pipeline's drafts are grounded in what worked for you. We work with your team to load that data and validate the output. Bulk ingestion of arbitrary document libraries with document-level Q&A is a **Roadmap** item, and the scope of the migration is defined in your engagement.

**Q101. Will migration send our data anywhere external?**
No. Migration happens entirely within your own infrastructure, consistent with AdOS being on-premise, offline-first, and air-gap capable. Your data never leaves your premises during onboarding. There is no external service in the loop.

**Q102. Can we migrate away from AdOS later if we choose?**
Yes. Your data is portable and exportable, and AdOS uses open engines and an OpenAI-compatible interface, so there is no vendor lock-in. You own the application, data, and model and can move your content elsewhere. This independence is a deliberate part of the design.

**Q103. How do we move AdOS to new hardware?**
Because AdOS uses standard Docker and portable data, moving to new hardware follows the documented backup and restore procedures. You own the stack, so hardware refreshes and site moves are under your control. Support and success assist where needed.

**Q104. Can we migrate from a cloud AI tool to AdOS?**
Yes, and this is a common motivation: teams move off metered cloud AI to keep data on-premise and eliminate per-token cost. Migration focuses on seeding your Company Brain with marketing-performance data and configuring the pipeline and Workflows & Approvals in AdOS. We scope the transition with you during evaluation.

**Q105. Does migration require downtime of our other systems?**
Migration into AdOS is scoped to your environment and planned to fit your operational constraints, and because AdOS runs on your own infrastructure you control the schedule. The proposal defines the timeline and acceptance criteria explicitly. We plan the sequence to minimize disruption.

**Q106. How do we preserve access boundaries during migration?**
During onboarding we map your workspace and business units so data lands in the right tenant and business units stay separated at the application level. Fine-grained per-user role-based access control that constrains the AI to each user's entitlements is a **Roadmap** capability, so we set expectations for the current state and plan for it explicitly rather than implying it is enforced today.

**Q107. What is the first step to get started?**
The first step is a discovery conversation to quantify your problem — campaign turnaround time, creative throughput, wasted or unmeasured ad spend, and where data cannot leave the building. From there we build an ROI model with your numbers, demonstrate on NovaMak against your named pains, and propose a pilot on your own hardware with defined acceptance criteria. Contact your AdOS account team to begin.

---

# Türkçe

## Genel

**S1. AdOS'u tek cümleyle nasıl tanımlarsınız?**
AdOS, tamamen kendi altyapınızda çalışan, Reklam için Kurumsal Yapay Zekâ İşletim Sistemidir — verileriniz binanızdan asla çıkmaz ve internet olmadan da çalışır. Bir yapay zekâ reklam ajansı işletim sistemi ("Agency OS") olarak, bir müşterinin reklam hedefini insan onaylı bir hattan geçirir: pazarlama özeti → reklam metni → kampanya taslağı → performans raporu → yönetici panosu. Sütunları; Company Brain (bir pazarlama-performansı hafızası), insan onaylı kampanya hattı ve Workflows & Approvals'tır.

**S2. AdOS'un üç sütunu nedir?**
Company Brain, özel pazarlama-performansı hafızanızdır: hangi kampanyaların, kreatiflerin ve kanalların işe yaradığını kaydeder ve bir sonraki özeti bilgilendirmek için bu örüntüleri yüzeye çıkarır. İnsan onaylı kampanya hattı, bir reklam hedefini pazarlama özetine, reklam metnine ve kampanya taslağına dönüştürür; her aşamada yapay zekâ yardımcı olur ve ilerlemeden önce bir kişi onaylar. Workflows & Approvals ise açık insan onay geçitleri, deterministik yönlendirme ve her adımın etkinlik günlüğü ile onay bazlı zaman çizelgesini içeren yapılandırılmış süreçlerdir.

**S3. AdOS, genel bulut yapay zekâ asistanından nasıl farklıdır?**
Genel bir bulut asistanı verilerinizi üçüncü tarafın sunucularına gönderir ve sizi sonsuza dek jeton başına ücretlendirir. AdOS ise tamamen sizin sahip olduğunuz donanımda çalışır; verileriniz, komutlarınız ve yanıtlarınız binanızdan asla çıkmaz ve jeton başına fatura yoktur. Tüm yığına siz sahip olursunuz: uygulama, veri ve yapay zekâ modeli.

**S4. AdOS sadece bir sohbet botu mu?**
Hayır. Bir sohbet botu kutu içinde soru yanıtlar; AdOS ise insan onaylı bir kampanya hattı çalıştıran reklam için bir işletim sistemidir — özet, kreatif, kampanya taslağı, performans raporu ve yönetici panosu. Her aşama yapay zekâ destekli ve insan onaylıdır ve Company Brain neyin işe yaradığını hatırlar; böylece sistem yalnızca konuşmayı değil, gerçek reklam işini ileri taşır.

**S5. AdOS kimler için tasarlandı?**
Kayda değer reklam ve pazarlama yürüten, kendi altyapısını kontrol eden, yaklaşık 250–10.000 çalışanı olan kurumlar için. Öncelikli sektörler arasında Üretim, Organize Sanayi Bölgeleri (OSB), Belediyeler ve kamu kurumları, Sağlık, Lojistik, Perakende, Eğitim ve Finans yer alır. Türkiye öncelikli olup yerel Türkçe ve İngilizce sunar ve veri egemenliği gerektiren her pazara uyarlanabilir.

**S6. Üç ana değer sütunu nedir?**
Sovereign, Capable ve Accountable — her zaman bu sırayla. Sovereign, %100 kendi altyapınızda çalışması ve verilerinizin asla dışarı çıkmaması demektir. Capable, bunun bir sohbet botu değil, reklam için gerçek bir yapay zekâ işletim sistemi olması demektir. Accountable ise her aşamanın insan onaylı olması ve bir etkinlik günlüğü ile onay bazlı zaman çizelgesinde kaydedilmesi demektir.

**S7. AdOS iki dilli mi?**
Evet. AdOS, kullanıcının ortamından otomatik algılanan tam bir Türkçe ve İngilizce kullanıcı arayüzü sunar. Her iki dil de birinci sınıftır; böylece karma bir iş gücü, aynı Company Brain üzerinde herkes tercih ettiği dilde çalışabilir.

**S8. Bugün AdOS'un hangi sürümü mevcut?**
AdOS, Company Brain'i, insan onaylı kampanya hattını ve Workflows & Approvals'ı kapsayan eksiksiz bir platform olarak 1.0.0 sürümündedir. Standart Docker ile kurulur ve belgelenmiş yedekleme, geri yükleme, yükseltme ve felaket kurtarma kılavuzlarıyla gelir. Bir önizleme değil, kurum içi üretim kullanımı için tasarlanmıştır.

**S9. Satın almadan önce AdOS'u görebilir miyim?**
Evet. Kurgusal bir üreticiyi temsil eden, eksiksiz, kendi içinde tutarlı ve deterministik bir demo ortamı olan NovaMak Endüstri A.Ş. üzerinden gösterim yaparız. Demo, keşif aşamasında adını koyduğunuz sorunlara eşlenir ve her önemli iddia canlı görebileceğiniz bir şeydir — ağ kablosunu çekip çevrimdışı da çalıştığını göstermek dahil.

## Lisanslama

**S10. AdOS nasıl lisanslanır?**
AdOS bir platform olarak lisanslanır: dağıtım başına veya koltuk bandı başına yapılandırılan bir platform lisansı ile destek ve başarı hizmeti. Jeton başına veya sorgu başına ölçümleme yoktur çünkü yerel çıkarımın marjinal API maliyeti yoktur. Kesin koşullar her dağıtıma göre belirlenir ve Deal Desk tarafından onaylanır.

**S11. Lisans süresiz mi yoksa abonelik mi?**
Lisans koşulları her dağıtıma göre belirlenir ve teklifte anlaşılır; süreli olsun ya da olmasın, tedarik modelinize uyan yapıyı destekleriz. Her seçenekte değişmeyen şey, kullanım ölçümlemesi ve jeton başına faturalandırma olmamasıdır. Deal Desk, sizin durumunuz için kesin süreyi, yenilemeyi ve destek yapısını onaylar.

**S12. Lisans, kaç soru veya jeton kullanabileceğimizi sınırlar mı?**
Hayır. Çıkarım kendi donanımınızda çalıştığı için tek marjinal maliyetiniz elektriktir, ölçümlü bir fatura değil. Yapay zekâ hattını çalıştırabilir ve Company Brain'i donanımınızın izin verdiği kadar sorgulayabilirsiniz; sorgu başına veya jeton başına hiçbir ücret yoktur.

**S13. Yapay zekâ hattı ayrı mı lisanslanır?**
Hayır. Yapay zekâ destekli hat aşamaları AdOS platformunun bir parçasıdır ve platformun nasıl paketlendiği, özel dağıtım kapsamınızda tanımlanır. Yerel çıkarım motorunuzda çalıştığı için yapay zekâ işi için mesaj başına veya jeton başına ücret yoktur. Geçerli olan koltuk veya dağıtım bantlarını Deal Desk belirler.

**S14. Sözleşme sona ererse erişimimize ne olur?**
AdOS altyapınızda çalıştığı ve veriler size ait olduğu için verilerinizi elinizde tutar ve her şeyi dışa aktarabilirsiniz. Tedarikçi kilitlenmesi yoktur: AdOS açık motorlar ve OpenAI uyumlu bir arayüz kullanır; verileriniz ve yapılandırmanız taşınabilirdir. Sözleşme sonrası operasyonel ayrıntılar anlaşmanızda tanımlanır.

**S15. Çalışmaya devam etmek için internete veya lisans sunucusuna ihtiyacımız var mı?**
Hayır. AdOS çevrimdışı önceliklidir ve hava boşluklu (air-gap) çalışabilir; dolayısıyla çalışmak için lisans doğrulamak amacıyla bir yere bağlanmaz. Platform, internetten tamamen kopuk çalışacak şekilde tasarlanmıştır.

**S16. Tek bir lisans birden fazla iş birimini veya tesisi kapsayabilir mi?**
Evet. AdOS, uygulama düzeyinde çok kiracılı yalıtım sağlar; böylece tek bir dağıtım, kiracı bazında kapsanmış ve ayrılmış verilerle birden fazla iş birimine hizmet verebilir. Birimlerin ve tesislerin ticari koşullarınıza nasıl eşleneceği her dağıtıma göre belirlenir. Bu, çok tesisli üreticiler ve birçok üye firmaya hizmet veren Organize Sanayi Bölgeleri için doğal bir uyumdur.

**S17. Deneme veya pilot seçeneği var mı?**
Evet. Önerdiğimiz değerlendirme yolu, kendi donanımınızda bir pilottur; böylece verileriniz binanızda kalırken AdOS'u kendi koşullarınızda doğrularsınız. Pilotun, "başarı"nın nesnel olması için baştan üzerinde anlaşılan kabul kriterleri vardır. Kapsam ve süre, değerlendirme sırasında ekibinizle belirlenir.

## Güvenlik

**S18. AdOS'u kullandığımızda verilerimiz nereye gider?**
Binanızın dışına hiçbir yere. Müşteri verileri — kampanya verileri, komutlar, taslaklar ve iş akışları — altyapınızdan asla çıkmaz ve iş içeriğine dair telemetri yoktur. Bu, birincil güvenlik iddiasıdır ve diğer her şey bunu destekler.

**S19. AdOS, OpenAI veya Anthropic gibi harici yapay zekâ sağlayıcılarına bir şey gönderir mi?**
Hayır. AdOS, barındırılan bir yapay zekâ API'sinin sarmalayıcısı değildir ve OpenAI, Anthropic, Google veya herhangi bir harici model sağlayıcısına bağımlı değildir. Tüm çıkarım yerel olarak donanımınızda çalışır; dolayısıyla herhangi bir yapay zekâ tedarikçisine giden harici bir veri yolu yoktur.

**S20. AdOS tamamen hava boşluklu (air-gap) çalışabilir mi?**
Evet. AdOS çevrimdışı önceliklidir ve çalışmak için harici API, API anahtarı ve internet bağlantısı gerektirmeden tamamen hava boşluklu çalışacak şekilde tasarlanmıştır. Bu, belirli kamu, sağlık ve finans ortamları gibi ağın kasıtlı olarak yalıtıldığı durumları doğrudan karşılar.

**S21. AdOS, kullanıcıların görmemesi gereken verileri görmesini nasıl engeller?**
Bugün AdOS, uygulama düzeyinde çok kiracılı yalıtım sağlar: veriler kiracı bazında kapsanır ve ayrılır; böylece bir iş biriminin kayıtları başka bir birime görünmez. Kullanıcı bazında, rol tabanlı erişim denetiminin zorunlu kılınması ve iznin farkında olan yapay zekâ — modelin yalnızca bir kullanıcının görebileceğiyle sınırlandığı — bugün gönderilmiş değil, **Yol Haritası** üzerindedir. Bunu dürüstçe anlatırız ve demoda, platformun henüz sahip olmadığı kullanıcı bazlı izin zorunluluğunu iddia etmek yerine kiracı ayrımını gösteririz.

**S22. Denetim izi var mı?**
Evet, bir etkinlik günlüğü ve onay bazlı zaman çizelgesi biçiminde: onaylar ve iş akışı adımları gibi önemli eylemler kaydedilir; bu da Güvenlik ve Uyum ekiplerine ne olduğuna ve ne zaman olduğuna dair bir kayıt sağlar. Bugün bu, kurcalamaya dayanıklı bir depo değil, yapılandırılmış günlükleme ve sınırlı bir etkinlik akışıdır. Tamamen **değiştirilemez, yalnızca-ekleme (append-only) bir denetim izi Yol Haritası üzerindedir**; bunu gönderilmiş olarak iddia etmeyiz.

**S23. AdOS'un saldırı yüzeyi nedir?**
AdOS harici API çağrısı yapmadığı için ihlal edilecek üçüncü taraf veri yolu yoktur; bu, bulut yapay zekâsına kıyasla saldırı yüzeyini önemli ölçüde azaltır. Hava boşluklu çalışabilir ve tüm yığın sahip olduğunuz altyapıda çalıştığı için tüm çevreyi siz kontrol edersiniz. Kendi ağ, kimlik ve sıkılaştırma denetimlerinizi bunun etrafında uygularsınız.

**S24. AdOS verilerimizle eğitim yapar mı veya kimseyle paylaşır mı?**
Hayır. AdOS müşteri verisini paraya çevirmez, iletmez veya bunun üzerinde eğitim yapmaz. İçeriğiniz size ait kalır; iş içeriğine dair telemetri ve gönderilecek harici bir model yoktur.

**S25. AdOS, veri yerleşimi ve uyum zorunluluklarını nasıl destekler?**
Kurum içi ve hava boşluklu çalışma, veri fiziksel olarak binanızdan asla çıkmadığı için veri yerleşimi zorunluluklarını doğrudan karşılar. Bu yüzden birçok belediye, sağlık kuruluşu ve finans kurumu için kurum içi çalışma bir tercih değil, gerekliliktir. Mimarimizi ve denetimlerimizi dürüstçe anlatırız ve AdOS'un kazanmadığı sertifikaları iddia etmeyiz.

**S26. AdOS belirli güvenlik sertifikaları iddia ediyor mu?**
Platformun kazanmadığı sertifikaları iddia etmek yerine mimarimiz ve denetimlerimiz hakkında doğru olanı anlatırız. Tedarikinizin belirli sertifikalar veya beyanlar gerektirdiği yerlerde, bunu değerlendirme sırasında mevcut duruma karşı dürüstçe ele alırız. Kalıcı iddia mimaridir: verileriniz binanızdan asla çıkmaz.

## AI

**S27. AdOS hangi yapay zekâ modellerini kullanır?**
AdOS, açık ve yerel modelleri Ollama gibi bir yerel çıkarım motoru veya vLLM, LM Studio, llama.cpp ya da SGLang gibi OpenAI uyumlu herhangi bir yerel sunucu üzerinden çalıştırır. Varsayılan olarak, hiçbir model sunucusu gerektirmeyen deterministik bir çevrimdışı üreticiyle de gelir. Modeli siz seçer ve sahip olursunuz; modeller platformu yeniden mimarilemeden değiştirilebilir ve herhangi bir harici sağlayıcıya bağımlılık yoktur.

**S28. Bir yapay zekâ şirketiyle API anahtarına veya hesaba ihtiyacımız var mı?**
Hayır. AdOS'un yapay zekâsını çalıştırmak için harici API, API anahtarı veya internet bağlantısı gerekmez. Tüm çıkarım kendi donanımınızda gerçekleşir; dolayısıyla yönetilecek veya ödenecek üçüncü taraf yapay zekâ hesabı yoktur.

**S29. Yapay zekâ uydurma yapmayı nasıl önler?**
AdOS, yapay zekâyı yapılandırılmış reklam girdileriyle sınırlar — pazarlama özeti, marka sesi ve kuralları, ürün verisi ve Company Brain'in geçmiş-kampanya performans örüntüleri — ve reklam KPI matematiği (CTR, CPC, CPA, CPL, ROAS, ROI) üretilen değil, deterministiktir. Her taslak, ilerlemeden önce bir kişi tarafından incelenir ve onaylanır; böylece bir insan onu bağlamında doğrular. Bir kaynak pasajını alıntılayan belge düzeyinde yanıtlar bugünkü bir yetenek değil, bir **Yol Haritası** öğesidir.

**S30. Modeli daha sonra seçebilir veya değiştirebilir miyiz?**
Evet. Modeli siz seçer ve sahip olursunuz; platform OpenAI uyumlu bir arayüz konuştuğu için modeller AdOS'u yeniden mimarilemeden değiştirilebilir. Daha iyi yerel modeller çıktıkça bunları kendi takviminizde benimseyebilirsiniz. Bu esneklik, tedarikçi kilitlenmesini önlemenin bir parçasıdır.

**S31. Yerel yapay zekâ, ChatGPT veya diğer bulut hizmetleri kadar hızlı mı?**
Bu konuda dürüstüz: mütevazı CPU donanımında yerel çıkarım, barındırılan öncü bir API'den daha yavaştır — milisaniye değil, saniye. GPU gibi daha iyi donanım bu farkı önemli ölçüde kapatır. Bu ödünleşim size egemenlik, jeton başına maliyet olmaması ve tam kontrol kazandırır ve bizim alıcılarımız için bu, ham gecikmeden daha ağır basar.

**S32. Yerel model, en büyük bulut modelleri kadar yetenekli mi?**
Barındırılan öncü modeller bazı görevlerde önde olabilir ve bunu açıkça söyleriz. Markanıza ve geçmiş-kampanya performansınıza dayalı pazarlama özetleri, reklam metinleri ve kampanya planları hazırlamak için iyi seçilmiş yerel modeller son derece etkilidir ve açık ekosistem ilerledikçe modeli yükseltebilirsiniz. Bir görev gerçekten öncü ölçekli bir modeli gerektiriyor ve kurum içi ödünleşimlere tolerans yoksa, bunu keşif sırasında dürüstçe söyleriz.

**S33. "Digital Employees" nedir — yapay zekâ ajanlarınız var mı?**
Bugün AdOS, döngüde insanın olduğu bir hattır: yapay zekâ her aşamaya yardımcı olur — özeti, reklam metnini, kampanya taslağını ve yönetici özetini taslaklar — ve bir şey ilerlemeden önce bir kişi onaylar. Tamamen özerk "Digital Employees" veya çok adımlı işi kendi başına yürüten yapay zekâ ajanları **Yol Haritası** üzerindedir; bugün gönderilmiş değildir ve hattı özerk bir ajan iş gücü olarak sunmayız.

**S34. Yapay zekâ yanıt üretirken kullanıcı izinlerine uyar mı?**
Bugün AdOS uygulama düzeyinde kiracı yalıtımı uygular; böylece yapay zekâ, kiracılar arasında değil, bir kiracının verisi içinde çalışır. Yapay zekânın yüzeye çıkarabileceği şeyin kullanıcı bazında, rol tabanlı kapsamını henüz zorunlu kılmaz; iznin farkında olan yapay zekâ — modelin bireysel bir kullanıcının yetkileriyle sınırlandığı — **Yol Haritası** üzerindedir. Bunu abartmak yerine açıkça belirtiriz.

**S35. Yapay zekâyı iyi çalıştırmak için hangi donanıma ihtiyacımız var?**
AdOS, yalnızca CPU'lu sunuculardan GPU hızlandırmalı makinelere kadar sizin sağladığınız donanımda çalışır ve performans, sağladığınızla ölçeklenir. Mütevazı CPU donanımı çalışır ama daha yavaştır; GPU'lar yanıt sürelerini anlamlı biçimde iyileştirir. Değerlendirme sırasında donanımı beklenen kullanıcı yüküne ve gecikme hedeflerinize göre boyutlandırırız; böylece beklentiler dürüstçe belirlenir.

## Dağıtım

**S36. AdOS nasıl dağıtılır?**
AdOS, standart Docker ve tek komutla ayağa kaldırma ile kurum içine veya özel bulut/VPC'nize dağıtılır. Standart, belgelenmiş araçlar kullandığı için mevcut IT/BT ekibiniz bunu egzotik beceriler olmadan işletebilir. Dağıtımdan sonra tüm yığına müşteri sahip olur.

**S37. AdOS'u kendi veri merkezimizde dağıtabilir miyiz?**
Evet. Kendi veri merkezinizde kurum içi dağıtım temel modeldir ve aynı şekilde kontrol ettiğiniz bir özel bulut veya VPC'ye de dağıtabilirsiniz. Her iki durumda da tüm yığın — uygulama, veri ve model — sahip olduğunuz veya kontrol ettiğiniz altyapıda çalışır.

**S38. Dağıtım internet erişimi gerektirir mi?**
Hayır. AdOS çevrimdışı önceliklidir ve internet bağlantısı gerekmeden tamamen hava boşluklu dağıtılabilir ve işletilebilir. Bağlantınız olduğu yerde kolaylık için kullanabilirsiniz, ancak bu, platformun çalışması için asla bir bağımlılık değildir.

**S39. Tipik bir dağıtım ne kadar sürer?**
Platformun kendisi standart Docker ile tek komutta ayağa kalkar; dolayısıyla çekirdek kurulum hızlıdır. Gerçekçi zaman çizelgesi; Company Brain'i marka, ürün ve geçmiş-kampanya verilerinizle beslemek ve Workflows & Approvals'ı yapılandırmakla belirlenir ve bunu sizinle planlarız. Teklif, dağıtım zaman çizelgesini ve kabul kriterlerini açıkça tanımlar.

**S40. AdOS'u günlük işletmek için özel becerilere ihtiyacımız var mı?**
Egzotik beceri gerekmez. AdOS standart Docker kullanır ve yedekleme, geri yükleme, yükseltme ve felaket kurtarma için belgelenmiş kılavuzlarla gelir; böylece normal bir IT/BT işlevi 2. gün operasyonlarını yürütebilir. Gerektiğinde destek ve başarı hizmetleri ekibinizi destekler.

**S41. AdOS tek bir dağıtımdan birden fazla tesise hizmet verebilir mi?**
Evet. AdOS, uygulama düzeyinde çok kiracılı yalıtım sağlar; böylece tek bir dağıtım, kiracı bazında kapsanmış ve ayrılmış verilerle birden fazla iş birimine ve tesise hizmet verebilir. Bu, çok tesisli üreticilere ve birçok üye firmaya paylaşımlı hizmetler sunan Organize Sanayi Bölgelerine uygundur.

**S42. Yükseltmeler nasıl çalışır?**
Yükseltmeler, platformla gelen belgelenmiş bir yükseltme kılavuzunu izler; böylece 2. gün bakımı doğaçlama değil, planlıdır. Yığına siz sahip olduğunuz için yükseltmelerin ne zaman yapılacağını siz kontrol eder ve önce kendi ortamınızda doğrulayabilirsiniz. Bir tedarikçi bulutundan zorla gönderilen bir güncelleme yoktur.

**S43. Altyapı önkoşulları nelerdir?**
Hesaplama gücünü — CPU'lu, isteğe bağlı GPU hızlandırmalı sunucular — ve kampanya verileriniz, Company Brain'iniz ile etkinlik günlüğünüz için standart Docker barındırma ve depolamayı siz sağlarsınız. Boyutlandırma; kullanıcı sayınıza, veri hacminize ve gecikme hedeflerinize bağlıdır ve bunları değerlendirme sırasında belirleriz. Her şey yerel olduğu için harici API veya bağlantı önkoşulu yoktur.

## Destek

**S44. AdOS ile birlikte hangi destek gelir?**
AdOS, platform lisansı ile destek ve başarı hizmeti olarak satılır; dolayısıyla sürekli destek ticari modelin bir parçasıdır. Bu, ekibinizin platformu işletmesine, sürdürmesine ve değer elde etmesine yardımcı olmayı kapsar. Kesin destek kademeleri ve yanıt koşulları anlaşmanızda belirlenir.

**S45. Bir satış temsilcisi mühendis olmadan sorularımızı yanıtlayabilir mi?**
Evet, tasarım gereği. Satış Kiti, herhangi bir nitelikli satış temsilcisinin mühendislik desteği olmadan AdOS'u tanıtabilmesi, açıklayabilmesi, niteleyebilmesi, gösterebilmesi ve satabilmesi için vardır. Rutin alıcı soruları için bu SSS ve daha geniş kit yeterli olacak şekilde tasarlanmıştır; değerlendirme için daha derin teknik incelemeler de mevcuttur.

**S46. AdOS ile hangi kılavuzlar gelir?**
AdOS; yedekleme, geri yükleme, yükseltme ve felaket kurtarma için belgelenmiş kılavuzlarla gelir. Bunlar 2. gün operasyonlarını tekrarlanabilir kılar ve kişiye bağlı bilgiye olan bağımlılığı azaltır. IT/BT ekibiniz bunları doğrudan izleyebilir; yardımcı olmak için destek mevcuttur.

**S47. Hava boşluklu bir dağıtımdaki sorunları nasıl ele alırsınız?**
AdOS hava boşluklu çalışacak şekilde tasarlandığı için destek süreçleri, dışa bağlantısı olmayan ortamları hesaba katar; belgelenmiş kılavuzları ve sahadaki ekibinizi kullanır. Tanılama ve güncelleme prosedürleri, platform bir yere bağlanmadan yürütülebilecek şekilde tanımlanmıştır. Hava boşluklu tesisler için özel destek lojistiği planınızda kararlaştırılır.

**S48. Eğitim desteğin bir parçası mı?**
Etkinleştirme (enablement), destek ve başarı ilişkisinin bir parçasıdır; böylece operatörleriniz ve kullanıcılarınız hızla üretken olabilir. Bu; platformu işletmeyi, Company Brain'i pazarlama verilerinizle beslemeyi ve kampanya hattı ile Workflows & Approvals'ı yapılandırmayı kapsar. Özel eğitim kapsamı ekibinizle kararlaştırılır.

**S49. 2. gün operasyonlarının sahibi biz miyiz yoksa AdOS mu?**
Yığına siz sahip olduğunuz için 2. gün operasyonlarını, belgelenmiş kılavuzlar ile destek ve başarı hizmetlerimizin desteğiyle IT/BT ekibiniz yürütür. Sorumlulukların paylaşımı, belirsizlik olmaması için teklifte açıkça tanımlanır. Birçok müşteri etkinleştirmeden sonra bağımsız çalışır ve gerektiğinde desteğe başvurur.

**S50. Company Brain'i beslemede yardım sunuyor musunuz?**
Evet. Değer elde etmek, Company Brain'i marka, ürün ve geçmiş-kampanya performans verilerinizle beslemeye bağlıdır ve bu, ilk kurulumun bir parçasıdır. Bu veriyi yüklemek, çalışma alanınızı yapılandırmak ve hattın kullanışlı taslaklar ürettiğini doğrulamak için ekibinizle çalışırız. İlk kurulum kapsamı taahhüdünüzde tanımlanır.

**S51. Yeni bir AdOS sürümü yayınlandığında ne olur?**
Yeni sürümler belgelenmiş bir yükseltme kılavuzuyla gelir ve yığını siz kontrol ettiğiniz için bunları ne zaman uygulayacağınıza siz karar verirsiniz. Destek ve başarı, yükseltmeleri kendi ortamınızda planlamanıza ve doğrulamanıza yardımcı olur. Sisteminizi kontrolünüz dışında değiştiren, bir tedarikçi bulutundan gelen zorla bir gönderim asla yoktur.

## Yedekleme

**S52. AdOS yedeklemeyi destekliyor mu?**
Evet. AdOS, Company Brain'inizi, yapılandırmanızı ve etkinlik günlüğünüzü kontrol ettiğiniz bir programda korumanız için belgelenmiş bir yedekleme kılavuzuyla gelir. Her şey altyapınızda bulunduğu için yedekler de binanızda kalır.

**S53. Yedekler nerede saklanır?**
Yedekler, kendi altyapınızda seçtiğiniz yerde saklanır çünkü AdOS tamamen kurum içinde çalışır ve veriler binanızdan çıkmaz. Mevcut yedekleme hedeflerinizi, saklama politikalarınızı ve şifrelemenizi uygularsınız. Hiçbir şey bir tedarikçi bulutuna gönderilmez.

**S54. Bir yedekten nasıl geri yükleriz?**
AdOS, yedekleme süreciyle eşleşen belgelenmiş bir geri yükleme kılavuzuyla gelir; böylece kurtarma doğaçlama değil, tanımlı bir prosedürdür. IT/BT ekibiniz bunu yürütebilir; yardımcı olmak için destek mevcuttur. İyi uygulamanın parçası olarak geri yüklemeleri düzenli olarak doğrulamanızı öneririz.

**S55. Bir felaket kurtarma planı var mı?**
Evet. AdOS; yedekleme, geri yükleme ve yükseltme prosedürlerinin yanında belgelenmiş bir felaket kurtarma kılavuzuyla gelir. Bu, ciddi bir arızadan sonra platformu geri getirmeniz için tanımlı bir yol sağlar. Yığına siz sahip olduğunuz için felaket kurtarma planınız mevcut altyapı stratejinizle bütünleşir.

**S56. Ne sıklıkta yedeklemeliyiz?**
Yedekleme sıklığı sizin kararınızdır; Company Brain'inizin ve yapılandırmanızın ne sıklıkta değiştiğine ve kurtarma hedeflerinize göre ayarlanır. Belgelenmiş kılavuz, mevcut politikalarınıza uyacak şekilde programlı yedeklemeleri destekler. İlk kurulum sırasında makul bir sıklık belirlemenize yardımcı oluruz.

**S57. Yedekler etkinlik günlüğünü içerir mi?**
Yedekleme stratejiniz, etkinlik günlüğü ve onay bazlı zaman çizelgesi dahil tüm platform durumunu kapsayabilir; böylece önemli eylemlere dair kaydınız korunur. Bu, savunulabilir bir kaydın bir kurtarma olayından sağ çıkması gereken düzenlemeye tabi sektörler için önemlidir. Kılavuz, eksiksiz bir geri yükleme için nelerin dahil edileceğini belgeler. (Tamamen değiştirilemez bir denetim izi **Yol Haritası** öğesi olmaya devam eder.)

**S58. Donanım değiştirirsek yedekler taşınabilir mi?**
Evet. AdOS standart araçlar kullandığı ve verileriniz taşınabilir ve dışa aktarılabilir olduğu için yedekler tek bir tedarikçi ortamına kilitli değildir. Bu, kilitlenme olmadan donanım yenilemelerini ve tesis taşımalarını destekler. Taşıma ayrıntıları belgelenmiş prosedürlerle kapsanır.

**S59. Yedekleme herhangi bir internet veya bulut hizmeti gerektirir mi?**
Hayır. Yedekleme ve geri yükleme tamamen altyapınızda çalışır; bu, AdOS'un çevrimdışı öncelikli ve hava boşluklu çalışabilir olmasıyla tutarlıdır. Bir bulut yedekleme hizmetine bağımlılık yoktur. Yedeklerinizin nerede bulunacağının tam kontrolü sizde kalır.

## Performans

**S60. AdOS yanıtları ne kadar hızlı?**
Hız, sağladığınız donanıma bağlıdır. Mütevazı, yalnızca CPU'lu donanımda yerel çıkarım, barındırılan öncü bir API'den daha yavaştır — milisaniye değil, saniye — ve GPU gibi daha iyi donanım farkı önemli ölçüde kapatır. Bu ödünleşim konusunda bilinçli olarak dürüstüz ve değerlendirme sırasında donanımı gecikme hedeflerinize göre boyutlandırırız.

**S61. Yerel yapay zekâ neden bulut yapay zekâdan daha yavaş?**
Barındırılan öncü API'ler çok büyük, özel veri merkezi donanımında çalışırken yerel çıkarım sizin sağladığınız donanımda çalışır. Dürüst ödünleşim budur: mütevazı donanımda biraz gecikme karşılığında egemenlik, jeton başına maliyet olmaması ve tam kontrol kazanırsınız. Daha iyi yerel donanıma, özellikle GPU'lara yatırım yapmak yanıt sürelerini anlamlı biçimde iyileştirir.

**S62. Performansı iyileştirebilir miyiz?**
Evet. Performans donanımla ölçeklenir; dolayısıyla GPU hızlandırma veya daha güçlü sunucular eklemek yanıt sürelerini anlamlı biçimde azaltır. Ayrıca gecikme ve kalite ihtiyaçlarınıza göre boyutlandırılmış bir yerel model seçebilirsiniz. Yığına siz sahip olduğunuz için bunlar istediğiniz zaman çekebileceğiniz kaldıraçlardır.

**S63. Daha fazla kullanıcıyla performans düşer mi?**
Eşzamanlı yük, sağladığınız kapasiteyle karşılanır ve AdOS, kiracıları uygulama düzeyinde yalıtılmış tutar. Dağıtımınızı, değerlendirme sırasında beklenen eşzamanlı kullanıcı sayınıza göre boyutlandırırız; böylece verim ihtiyaçlarınızı karşılar. Kullanım büyüdükçe, sorgu başına herhangi bir maliyet olmadan donanımı kendi koşullarınızda ölçeklersiniz.

**S64. Kullanımla birlikte artan sorgu başına maliyetler var mı?**
Hayır. Jeton başına veya sorgu başına ölçümleme yoktur; tek marjinal maliyetiniz elektrik ve donanımdır. Bu, yoğun kullanımın kontrolden çıkan bir API faturası oluşturmayacağı anlamına gelir; ki bu, ölçümlü bulut yapay zekâsına göre temel bir maliyet avantajıdır. Kullanım ölçeklendikçe maliyet öngörülebilirliği artar.

**S65. Company Brain ne kadar veri tutabilir?**
Company Brain bir pazarlama-performansı hafızasıdır: marka profillerini, kreatif ve kampanya kayıtlarını, bir kampanya→reklam→müşteri adayı→ROI bilgi grafiğini ve bir kazanan-reklam örüntü kütüphanesini saklar. Pratik kapasite, sağladığınız donanıma ve depolamaya bağlıdır ve bunu değerlendirme sırasında sizinle boyutlandırırız. Bunun genel bir belge deposu değil, bir performans hafızası olduğunu unutmayın — büyük, keyfi belge tabanlarını almak (ingest) bir **Yol Haritası** öğesidir.

**S66. Çevrimdışı çalışmak performansa zarar verir mi?**
Hayır. Çevrimdışı veya hava boşluklu çalışmak AdOS'u yavaşlatmaz çünkü çıkarım her durumda yereldir; normal çalışmada internete gidiş-dönüş yoktur. Performans, bağlantı tarafından değil, donanımınız tarafından belirlenir. Platformun ağ kablosu çekildiğinde de aynı şekilde çalışmasının nedeni budur.

**S67. Gerçekçi performans beklentilerini nasıl belirlersiniz?**
Değerlendirme sırasında donanımı beklenen kullanıcı yükünüze ve gecikme hedeflerinize göre boyutlandırır ve ödünleşimleri açıkça belirtiriz. Hızı abartmaktansa dürüst beklentiler belirlemeyi tercih ederiz çünkü dürüstlük ilişkiyi yenilemede korur. Kendi donanımınızdaki pilot, taahhütte bulunmadan önce gerçek performansı doğrular.

## Özelleştirme

**S68. AdOS'u kurumumuza göre uyarlayabilir miyiz?**
Evet. Company Brain marka, ürün ve geçmiş-kampanya verilerinizle beslenir, hat çalışma alanınıza ve müşterilerinize göre yapılandırılır ve Workflows & Approvals süreçlerinize ve onay geçitlerinize göre ayarlanır. Platform, genel bir şablonu değil, reklamınızın gerçekte nasıl çalıştığını yansıtacak şekilde tasarlanmıştır.

**S69. Kendi Workflows & Approvals'ımızı tanımlayabilir miyiz?**
Evet. Workflows & Approvals; kurallarınıza göre yapılandırılan, açık insan onay geçitleri (örneğin, strateji-ve-bütçe ile kampanya-başlatma geçitleri) ve deterministik yönlendirme içeren yapılandırılmış iş süreçlerini destekler. Onay yoğun operasyonlar bu şekilde insan kontrolünde tutulur. Her adım, etkinlik günlüğü ve onay bazlı zaman çizelgesinde yakalanır. Kademeli harcama-yetkisi seviyeleri (devredilen T0–T4 limitleri) bugün gönderilmiş değil, bir **Yol Haritası** öğesidir.

**S70. Belirli işlevler için yapay zekâ rolleri oluşturabilir miyiz?**
Bugün hattı kendi işlevlerinize göre yapılandırırsınız — özet, kreatif, kampanya, analitik ve yönetici aşamaları — her biri yapay zekâ destekli ve insan onaylı. NovaMak demosunda kuruluş genelinde rolleri gösteririz, ancak bunlar özerk çalışanlar değil, yapay zekâ destekli aşamalardır. Kendi başına eylemde bulunan tamamen özerk "Digital Employees" **Yol Haritası** üzerindedir.

**S71. Kimin neyi göreceğini kontrol edebilir miyiz?**
Bugün AdOS veriyi kiracı bazında kapsar ve ayırır; böylece iş birimleri birbirinin kayıtlarını görmez. İnce taneli, kullanıcı bazında rol tabanlı erişim denetimi — her rolü ve erişim kuralını eşleyerek yapay zekânın kendisini bir kullanıcının yetkileriyle sınırlamak — bugün zorunlu kılınmış değil, **Yol Haritası** üzerindedir. Mevcut duruma göre planlama yapabilmeniz için bu ayrımı açıkça belirtiriz.

**S72. İhtiyaçlarımıza göre yapay zekâ modelini seçebilir miyiz?**
Evet. Modeli siz seçer ve sahip olursunuz ve AdOS OpenAI uyumlu bir arayüz konuştuğu için modelleri yeniden mimarilemeden değiştirebilirsiniz. Bu, özel kullanımınız için gecikme, kalite ve donanımı dengelemenizi sağlar. Açık model ekosistemi ilerledikçe, iyileştirmeleri kendi takviminizde benimsersiniz.

**S73. Kullanıcı arayüzü Türkçe veya İngilizce'ye özelleştirilebilir mi?**
Evet. AdOS, kullanıcının ortamından otomatik algılanan tam bir Türkçe ve İngilizce arayüz sunar; böylece her kullanıcı tercih ettiği dilde çalışır. Her iki dil de aynı Company Brain karşısında birinci sınıftır. Bu, Türkiye öncelikli kurumlarda yaygın olan karma dilli iş güçlerine uygundur.

**S74. AdOS çok birimli yapımızı yansıtabilir mi?**
Evet. AdOS, uygulama düzeyinde çok kiracılı yalıtım sağlar; böylece tek bir dağıtımdan kiracı bazında kapsanmış ve ayrılmış verilerle birden fazla iş birimini ve tesisi yansıtabilir. NovaMak demosu bunu göstermek için altı tesis, dört iş birimi ve on altı departmanı modeller. Yapınız ilk kurulum sırasında eşlenir.

**S75. Özelleştirmenin ne kadarı yapılandırma, ne kadarı özel kod?**
Temel uyarlama — Company Brain'i beslemek, kampanya hattını yapılandırmak ve Workflows & Approvals ile geçitleri ayarlamak — özel mühendislik değil, yapılandırmadır. Bu, dağıtımları tekrarlanabilir ve IT/BT ekibinizce desteklenebilir kılar. Daha derin genişletme gerektiğinde, OpenAI uyumlu ve açık motorlu mimari kara kutudan kaçınır.

## Entegrasyonlar

**S76. AdOS mevcut sistemlerimizle entegre olur mu?**
AdOS, açık motorlar ve OpenAI uyumlu bir arayüz üzerine kuruludur ve verileriniz taşınabilir ve dışa aktarılabilirdir; bu da kapalı bir kara kutudan kaçınır. Bugün reklam platformlarına, CRM'lere veya veri ambarlarına canlı bağlayıcılarla gelmez; performans metrikleri bir form aracılığıyla girilir ve kendi araçlarınızda çalıştırmak için bir kampanya taslağını dışa aktarırsınız. Doğrudan harici bağlayıcılar **Yol Haritası** üzerindedir ve entegrasyon kapsamı değerlendirme sırasında tanımlanır.

**S77. AdOS hangi çıkarım motorlarıyla çalışır?**
AdOS; Ollama ve vLLM, LM Studio, llama.cpp ve SGLang dahil OpenAI uyumlu herhangi bir yerel sunucuyla çalışır. Bu size motor seçme özgürlüğü verir ve donanımınıza ve operasyonlarınıza uyanı seçmenizi sağlar. Tek bir tescilli motora asla bağlı kalmazsınız.

**S78. Entegrasyonlar internet veya harici API gerektirir mi?**
Hayır. AdOS'un kendisi çalışmak için harici API, API anahtarı veya internet gerektirmez ve hava boşluklu çalışabilir. Gelecekteki her entegrasyon, bu kurum içi, çevrimdışı öncelikli duruşa saygı gösterecek şekilde tasarlanır. Platformla ilgili hiçbir şey çalışmak için üçüncü taraf bir buluta bağlı değildir.

**S79. Verilerimizi AdOS'tan dışa aktarabilir miyiz?**
Evet. Verileriniz — kampanya taslakları ve yapılandırma dahil — taşınabilir ve dışa aktarılabilirdir; bu da kilitlenme yok ilkemizin merkezindedir. Asla mahsur kalmazsınız: yığına siz sahip olduğunuz için isterseniz içeriğinizi başka bir yere taşıyabilirsiniz. Bu sizi ticari ve teknik olarak korur.

**S80. Üzerine geliştirebileceğimiz OpenAI uyumlu bir arayüz var mı?**
Evet. AdOS, yerel çıkarım katmanına tanıdık ve iyi belgelenmiş bir standart olan OpenAI uyumlu bir arayüz kullanır. Bu, ekibinizin çalışmasını kolaylaştırır ve modellerin yeniden mimarilemeden değiştirilebilmesinin temel bir nedenidir. Ayrıca mimarinin kara kutu olmasını da engeller.

**S81. AdOS'u entegre etmek tedarikçi kilitlenmesi oluşturur mu?**
Hayır. Tüm tasarım kilitlenmeye karşı direnir: açık motorlar, OpenAI uyumlu bir arayüz ve taşınabilir, dışa aktarılabilir veri. Uygulamaya, veriye ve modele siz sahip olursunuz; böylece kaldıracınızı ve bağımsızlığınızı korursunuz. Bu, ölçümlü bulut yapay zekâsına kasıtlı bir karşıtlıktır.

**S82. Yapay zekâ süreçlerimiz boyunca kendi başına eylemde bulunabilir mi?**
Bugün yapay zekâ, tanımlı hat aşamalarına yardımcı olur — özet, kreatif ve kampanya planlarını taslaklar — ve her önemli adım ilerlemeden önce bir insan onayını bekler; hiçbir şey bir reklam platformuna otomatik olarak gönderilmez. Bir insan olmadan yönlendirme yapan, eylemde bulunan ve çok adımlı işi tamamlayan özerk ajanlar **Yol Haritası** üzerindedir. Platformu özerk bir aktör olarak değil, döngüde insanın olduğu bir sistem olarak dürüstçe konumlandırırız.

**S83. Entegrasyonlar izinlere nasıl uyar?**
Bugün erişim kiracı düzeyinde kapsanır; böylece entegre erişim, kiracılar arasında değil, bir kiracının verisi içinde kalır. Kullanıcı bazında, iznin farkında olan zorlama — yapay zekânın bireysel bir kullanıcının görebileceğiyle sınırlandığı — bir **Yol Haritası** öğesidir. Gelecekteki her entegrasyon bu model içinde çalışacak şekilde tasarlanır ve abartmak yerine mevcut durumu anlatırız.

## Fiyatlandırma

**S84. AdOS'un maliyeti nedir?**
Fiyatlandırma değer temellidir ve her dağıtıma göre belirlenir; dolayısıyla yayınlanmış bir fiyat listesi yerine durumunuza özel bir rakam belirlenir. Yapı, jeton başına veya sorgu başına ölçümleme olmadan bir platform lisansı ile destek ve başarı hizmetidir. Önce sizinle değeri ölçeriz, ardından Deal Desk rakamları onaylar.

**S85. Neden baştan fiyat vermiyorsunuz?**
Çünkü fiyatı özellik sayısına değil, ölçülen değere göre belirleriz ve sorun ölçülmeden fiyat konuşması açmayız. Kendi keşif rakamlarınızla oluşturulan ROI modeli ticari kapıyı açar. Bu, değerin haklı çıkarmadığı hiçbir şey için ödeme yapmanızı önler.

**S86. Fiyatlandırma jeton başına mı yoksa sorgu başına mı?**
Hayır. Açıkça jeton başına veya sorgu başına ölçümleme yoktur çünkü yerel çıkarımın marjinal API maliyeti yoktur. Çıkarım maliyetiniz elektriğiniz ve donanımınızdır, ölçümlü bir tedarikçi faturası değil. Bu, yoğun kullanımda bile maliyeti öngörülebilir kılar.

**S87. Fiyata neler dahildir?**
Ticari model; dağıtım başına veya koltuk bandı başına yapılandırılan bir platform lisansı ile destek ve başarı hizmetidir. Kesin kapsam, çıplak bir teklif yerine bir danışmanlık teslimatı olan teklifinizde tanımlanır. Üzerine eklenen gizli kullanım ücretleri yoktur.

**S88. Yatırımı kurum içinde nasıl gerekçelendiririz?**
Görünür girdiler ve varsayımlarla, geri ödeme süresi ve yıllık tasarrufu öne çıkaran, sizin kontrol ettiğiniz bir ROI modeli oluştururuz. Kendi keşif rakamlarınıza — kampanya hazırlama süresi, kreatif üretim hızı, boşa giden reklam harcaması — dayanır ve verimlilik kazanımlarını gösterir. Varsayımlar paneli görünür kalır; böylece gerekçe dürüst ve yenilemede savunulabilirdir.

**S89. Koltuk başına bir seçenek var mı?**
Fiyatlandırma, kurumunuza uyana göre dağıtım başına veya koltuk bandı başına yapılandırılabilir. Doğru yapı sizinle belirlenir ve Deal Desk onaylar. Yapı ne olursa olsun, jeton başına veya sorgu başına ölçümleme asla yoktur.

**S90. Kullanım büyürse maliyetler fırlar mı?**
Hayır. Jeton başına veya sorgu başına faturalandırma olmadığı için yoğun kullanım kontrolden çıkan bir fatura oluşturmaz; marjinal maliyetiniz elektrik ve donanımdır. Donanımı ölçeklendirdikçe maliyet öngörülebilir ve kontrolünüzde kalır. Bu, ölçümlü bulut yapay zekâsına göre temel bir avantajdır.

**S91. İndirimler nasıl yönetilir?**
İndirim ilkelidir ve Deal Desk tarafından yönetilir, odada asla doğaçlama yapılmaz. Teklifteki ticari rakamlar Deal Desk doldurana kadar yer tutucudur ve şablon asla uydurma fiyatlarla gönderilmez. Bu, fiyatlandırmayı anlaşmalar arasında tutarlı ve adil tutar.

## Eğitim

**S92. AdOS son kullanıcılar için öğrenmesi ne kadar zor?**
AdOS, ortamından otomatik algılanan tam bir Türkçe ve İngilizce arayüzle, herkesin kendi dilinde kullanılabilir olacak şekilde tasarlanmıştır. Hat, bir kişinin incelediği ve onayladığı taslaklar ürettiği için kullanıcılar komut hileleri öğrenmek yerine açık, yapılandırılmış çıktılarla çalışır. İlk kurulum sırasındaki etkinleştirme, kullanıcıları hızla üretken kılar.

**S93. Operatörlerimiz için eğitim sağlıyor musunuz?**
Evet. Etkinleştirme, destek ve başarı ilişkisinin bir parçasıdır ve platformu işletmeyi, belgelenmiş kılavuzları kullanmayı ve sistemi yapılandırmayı kapsar. IT/BT ekibiniz yedekleme, geri yükleme, yükseltme ve felaket kurtarma prosedürlerini öğrenir. Özel eğitim kapsamı ekibinizle kararlaştırılır.

**S94. AdOS sürekli eğitim yükümüzü nasıl azaltır?**
Company Brain pazarlama-performansı bilgisini — hangi kampanyaların ve kreatiflerin işe yaradığını — saklar; böylece ekipler her özete sıfırdan başlamak yerine kanıtlanmış örüntülerin üzerine inşa edebilir. Bu, özellikle yüksek devirli, dağıtık pazarlama işlevlerinde değerlidir. Ayrıca bir uzman ayrıldığında neyin işe yaradığını korur.

**S95. AdOS uzmanlar ayrıldığında bilgiyi korumaya yardımcı olur mu?**
Evet. Company Brain, pazarlama-performansı bilginizi — marka profilleri, kazanan-reklam örüntüleri ve geçmiş-kampanya sonuçları — yakalar; böylece zorlukla kazanılmış bilgi birikimi, ayrılan bir çalışanla birlikte kapıdan çıkıp gitmez. Yeni personel ilk günden kanıtlanmış örüntülerin üzerine inşa edebilir. Pazarlama ve İK ekipleri bunu süreklilik ve işe alıştırma için değerli bulur.

**S96. Eğitim Türkçe olarak mevcut mu?**
Evet. AdOS, yerel Türkçe ve İngilizce ile Türkiye önceliklidir; böylece hem ürün hem de etkinleştirme, Türkçe konuşan ekiplere yerel olarak hizmet eder. Türkçe birinci sınıftır, sonradan eklenen bir çeviri değil. Bu, Türkiye öncelikli kurumlara ve karma dilli iş güçlerine uygundur.

**S97. Kullanıcılar ne kadar sürede üretken olur?**
Arayüz iki dilli ve hat açık, incelenebilir taslaklar ürettiği için kullanıcılar, içerik beslendikten ve çalışma alanı yapılandırıldıktan sonra genellikle hızla üretken olur. Gerçekçi yol, pazarlama verilerinizin ilk kurulumuna ve hattın yapılandırılmasına bağlıdır ve bunu sizinle planlarız. Etkinleştirme, değere ulaşma süresini kısaltacak şekilde yapılandırılmıştır.

**S98. Yapay zekâ hattını siz mi yapılandırıyorsunuz yoksa biz mi?**
Hat, ilk kurulum sırasında çalışma alanınıza, müşterilerinize ve onay geçitlerinize göre yapılandırılır ve bunu tanımlamak için ekibinizle çalışırız. Yerel temelinizde çalıştığı için kapsamı harici bir hizmetle değil, sizin yapılandırmanızla belirlenir. Her aşamanın ne yaptığının ve neyin insan onayı gerektirdiğinin kontrolünü elinizde tutarsınız. (Özerk ajanlar bugünkü model değil, bir **Yol Haritası** yönüdür.)

**S99. Değer elde etmek için hangi ilk kurulum gerekir?**
Değere giden yol; Company Brain'i marka, ürün ve geçmiş-kampanya verilerinizle beslemek, kampanya hattını yapılandırmak ve Workflows & Approvals'ı ayarlamaktır. Bunu ilk kurulumun bir parçası olarak destekler ve kapsamı taahhüdünüzde tanımlarız. Bunları doğru yapmak, platformu ölçülebilir sonuçlara dönüştüren şeydir.

## Geçiş

**S100. Mevcut pazarlama verilerimizi Company Brain'e taşıyabilir miyiz?**
Evet. İlk kurulum; hattın taslaklarının sizin için işe yarayan şeye dayanması için Company Brain'i marka, ürün ve geçmiş-kampanya performans verilerinizle beslemeyi içerir. Bu veriyi yüklemek ve çıktıyı doğrulamak için ekibinizle çalışırız. Belge düzeyinde soru-yanıtla keyfi belge kütüphanelerinin toplu alımı bir **Yol Haritası** öğesidir ve geçişin kapsamı taahhüdünüzde tanımlanır.

**S101. Geçiş verilerimizi harici bir yere gönderir mi?**
Hayır. Geçiş, AdOS'un kurum içi, çevrimdışı öncelikli ve hava boşluklu çalışabilir olmasıyla tutarlı olarak tamamen kendi altyapınızda gerçekleşir. Verileriniz ilk kurulum sırasında binanızdan asla çıkmaz. Döngüde harici bir hizmet yoktur.

**S102. İstersek daha sonra AdOS'tan geçiş yapabilir miyiz?**
Evet. Verileriniz taşınabilir ve dışa aktarılabilirdir ve AdOS açık motorlar ile OpenAI uyumlu bir arayüz kullanır; dolayısıyla tedarikçi kilitlenmesi yoktur. Uygulamaya, veriye ve modele siz sahip olursunuz ve içeriğinizi başka bir yere taşıyabilirsiniz. Bu bağımsızlık, tasarımın kasıtlı bir parçasıdır.

**S103. AdOS'u yeni donanıma nasıl taşırız?**
AdOS standart Docker ve taşınabilir veri kullandığı için yeni donanıma taşımak, belgelenmiş yedekleme ve geri yükleme prosedürlerini izler. Yığına siz sahip olduğunuz için donanım yenilemeleri ve tesis taşımaları kontrolünüzdedir. Gerektiğinde destek ve başarı yardımcı olur.

**S104. Bir bulut yapay zekâ aracından AdOS'a geçebilir miyiz?**
Evet ve bu yaygın bir gerekçedir: ekipler verileri kurum içinde tutmak ve jeton başına maliyeti ortadan kaldırmak için ölçümlü bulut yapay zekâsından ayrılır. Geçiş; Company Brain'inizi pazarlama-performansı verileriyle beslemeye ve AdOS'ta hattı ve Workflows & Approvals'ı yapılandırmaya odaklanır. Geçişi değerlendirme sırasında sizinle belirleriz.

**S105. Geçiş, diğer sistemlerimizin kesintiye uğramasını gerektirir mi?**
AdOS'a geçiş ortamınıza göre belirlenir ve operasyonel kısıtlarınıza uyacak şekilde planlanır ve AdOS kendi altyapınızda çalıştığı için takvimi siz kontrol edersiniz. Teklif, zaman çizelgesini ve kabul kriterlerini açıkça tanımlar. Kesintiyi en aza indirmek için sırayı planlarız.

**S106. Geçiş sırasında erişim sınırlarını nasıl koruruz?**
İlk kurulum sırasında çalışma alanınızı ve iş birimlerinizi eşleriz; böylece veriler doğru kiracıya iner ve iş birimleri uygulama düzeyinde ayrı kalır. Yapay zekâyı her kullanıcının yetkileriyle sınırlayan ince taneli, kullanıcı bazında rol tabanlı erişim denetimi bir **Yol Haritası** yeteneğidir; bu yüzden mevcut durum için beklentileri belirler ve bugün zorunlu kılınıyormuş gibi ima etmek yerine bunu açıkça planlarız.

**S107. Başlamak için ilk adım nedir?**
İlk adım, sorununuzu ölçmek için bir keşif görüşmesidir — kampanya hazırlama süresi, kreatif üretim hızı, boşa giden veya ölçülemeyen reklam harcaması ve verilerin binadan çıkamayacağı yerler. Buradan rakamlarınızla bir ROI modeli oluşturur, adını koyduğunuz sorunlara karşı NovaMak üzerinde gösterim yapar ve tanımlı kabul kriterleriyle kendi donanımınızda bir pilot öneririz. Başlamak için AdOS hesap ekibinizle iletişime geçin.
