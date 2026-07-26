# AdOS Sales FAQ

**Owner:** Office of the Chief Revenue Officer
**Status:** Official — conforms to `SALES_KIT_CONSTITUTION.md` and the canonical brief
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Audience:** Account Executives, Solution Engineers, Partners, and buyers

> This FAQ contains **107 questions** with substantive answers, presented first in
> English, then in Turkish with identical questions, order, and numbering. Both
> languages carry the same claims and numbers. Product terms — **AdOS**, **Company
> Brain**, **Digital Employees**, **Workflows & Approvals** — stay in English in
> both languages.

---

# English

## General

**Q1. What is AdOS in one sentence?**
AdOS is an enterprise AI operating system that runs 100% on your own infrastructure — your data never leaves your building, and it works with no internet at all. It unifies your organization's knowledge, your people, and your day-to-day work under one system. The three pillars are Company Brain, Digital Employees, and Workflows & Approvals.

**Q2. What are the three pillars of AdOS?**
Company Brain is your private, permission-aware knowledge base where every AI answer is grounded in your own documents and cites its sources. Digital Employees are AI agents that perform real knowledge work — answering, drafting, routing, and preparing approvals — within defined roles and permissions. Workflows & Approvals are structured business processes with tiered approval authority, deterministic routing, and full audit trails.

**Q3. How is AdOS different from a public cloud AI assistant?**
A public cloud assistant sends your data to a third party's servers and meters you per token forever. AdOS runs entirely on hardware you own, so your documents, prompts, and answers never leave your premises and there is no per-token bill. You own the whole stack: the application, the data, and the AI model.

**Q4. Is AdOS just a chatbot?**
No. A chatbot answers questions in a box; AdOS is an operating layer for the business that also runs Digital Employees and Workflows & Approvals. Every answer is permission-aware, cited, and auditable, and the system moves real work forward, not just conversation.

**Q5. Who is AdOS built for?**
Organizations of roughly 250–10,000 employees that are multi-site or multi-unit and control their own infrastructure. Priority verticals include Manufacturing, Organized Industrial Zones (OSB), Municipalities and public institutions, Healthcare, Logistics, Retail, Education, and Finance. It is Turkey-first with native Turkish and English, and extensible to any data-sovereign market.

**Q6. What are the three headline value pillars?**
Sovereign, Capable, and Accountable, always in that order. Sovereign means it runs 100% on your infrastructure and your data never leaves. Capable means it is a real AI operating system, not a chatbot. Accountable means it is permission-aware, cited, and fully audited.

**Q7. Is AdOS bilingual?**
Yes. AdOS ships a full Turkish and English user interface, auto-detected from the user's environment. Both languages are first-class, so a mixed workforce can each work in their preferred language against the same Company Brain.

**Q8. What version of AdOS is available today?**
AdOS is at version 1.0.0, a complete platform covering Company Brain, Digital Employees, and Workflows & Approvals. It deploys with standard Docker and ships with documented backup, restore, upgrade, and disaster-recovery runbooks. It is designed for production on-premise use, not a preview.

**Q9. Can I see AdOS before buying?**
Yes. We demonstrate on NovaMak Endüstri A.Ş., a complete, internally consistent, deterministic demo environment representing a fictional manufacturer. The demo maps to the specific problems you name in discovery, and every major claim is something you can see live — including pulling the network cable to show it still works offline.

## Licensing

**Q10. How is AdOS licensed?**
AdOS is licensed as a platform: a platform license plus support and success, structured per deployment or per-seat band. There is no per-token or per-query metering because local inference has no marginal API cost. Exact terms are scoped per deployment and confirmed by Deal Desk.

**Q11. Is the license perpetual or subscription?**
Licensing terms are scoped per deployment and agreed in the proposal; we support the structure that fits your procurement model, whether term-based or otherwise. What is constant across every option is that there is no usage metering and no per-token billing. Deal Desk confirms the precise term, renewal, and support structure for your case.

**Q12. Does the license limit how many questions or tokens we can use?**
No. Because inference runs on your own hardware, your only marginal cost is electricity, not a metered bill. You can ask the Company Brain as many questions and run Digital Employees as often as your hardware allows, without any per-query or per-token charge.

**Q13. Are Digital Employees licensed separately?**
Digital Employees are part of the AdOS platform, and how they are packaged is defined in your specific deployment scope. There is no per-message or per-token charge for their work, since they run on your local inference engine. Deal Desk scopes any seat or deployment bands that apply.

**Q14. What happens to our access if the contract ends?**
Because AdOS runs on your infrastructure and your data is yours, you retain your data and can export everything. There is no vendor lock-in: AdOS uses open engines and an OpenAI-compatible interface, and your documents and configuration are portable. Post-contract operational specifics are defined in your agreement.

**Q15. Do we need internet or a license server to keep running?**
No. AdOS is offline-first and air-gap capable, so it does not phone home to validate a license in order to operate. The platform is designed to run fully disconnected from the internet.

**Q16. Can one license cover multiple business units or sites?**
Yes. AdOS is multi-tenant with strict tenant isolation, so one deployment can serve multiple business units with segregated data. How units and sites map to your commercial terms is scoped per deployment. This is a natural fit for multi-site manufacturers and Organized Industrial Zones serving many member firms.

**Q17. Is there a trial or pilot option?**
Yes. Our recommended path to evaluation is a pilot on your own hardware, so you validate AdOS on your terms with your data staying on your premises. The pilot has defined acceptance criteria agreed up front so that "success" is objective. Scope and duration are set with your team during evaluation.

## Security

**Q18. Where does our data go when we use AdOS?**
Nowhere outside your premises. Customer data — documents, prompts, answers, and workflows — never leaves your infrastructure, and there is no telemetry of business content. This is the primary security claim, and everything else supports it.

**Q19. Does AdOS send anything to external AI providers like OpenAI or Anthropic?**
No. AdOS is not a wrapper around a hosted AI API and does not depend on OpenAI, Anthropic, Google, or any external model provider. All inference runs locally on your hardware, so there is no external data path to any AI vendor.

**Q20. Can AdOS run fully air-gapped?**
Yes. AdOS is offline-first and designed to run fully air-gapped, with no external API, no API keys, and no internet connection required to operate. This directly satisfies environments where the network is intentionally isolated, such as certain public-sector, healthcare, and finance settings.

**Q21. How does AdOS keep users from seeing documents they shouldn't?**
AdOS is permission-aware end to end. A user only ever sees, and the AI only ever cites, documents that user is entitled to; the model can never surface or cite content outside a user's permissions. In the demo we prove this by showing that a restricted document is invisible to an unentitled user.

**Q22. Is there an audit trail?**
Yes. Every consequential action is recorded in an immutable audit trail, from answers and approvals to workflow steps. This gives Security and Compliance teams a defensible record of who did what and when, which is essential in regulated verticals.

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
AdOS runs open, local models through a local inference engine such as Ollama, or any OpenAI-compatible local server like vLLM, LM Studio, llama.cpp, or SGLang. You choose and own the model, and models can be swapped without re-architecting the platform. There is no dependency on any external model provider.

**Q28. Do we need API keys or accounts with an AI company?**
No. AdOS requires no external API, no API keys, and no internet connection to run its AI. All inference happens on your own hardware, so there are no third-party AI accounts to manage or pay.

**Q29. How does the AI avoid making things up?**
Every AI answer in Company Brain is grounded in your own documents and cites its sources, so answers are traceable back to the underlying content. Rather than "trust the answer," you can open the citation and verify it. Citations are also permission-scoped, so the AI only cites what the user is entitled to see.

**Q30. Can we choose or change the AI model later?**
Yes. You choose and own the model, and models can be swapped without re-architecting AdOS because the platform speaks an OpenAI-compatible interface. As better local models become available, you can adopt them on your own timeline. This flexibility is part of avoiding vendor lock-in.

**Q31. Is the local AI as fast as ChatGPT or other cloud services?**
We are honest about this: local inference on modest CPU hardware is slower than a hosted frontier API — think seconds, not milliseconds. Better hardware, such as GPUs, closes the gap significantly. The trade-off buys you sovereignty, no per-token cost, and full control, which for our buyers outweighs raw latency.

**Q32. Is the local model as capable as the biggest cloud models?**
Frontier hosted models can lead on some tasks, and we say so plainly. For grounded, cited answers over your own documents and for running defined Digital Employee tasks, well-chosen local models are highly effective, and you can upgrade the model as the open ecosystem advances. If a task genuinely requires a frontier-scale model with no tolerance for on-prem trade-offs, we tell you honestly during discovery.

**Q33. What are Digital Employees, technically?**
Digital Employees are AI agents that perform real knowledge work — answering questions, drafting content, routing requests, preparing approvals, and moving workflows forward — all within defined roles and permissions. They operate on the same local, permission-aware, auditable foundation as the rest of AdOS. Their actions are recorded in the audit trail like any consequential action.

**Q34. Does the AI respect user permissions when generating answers?**
Yes, this is fundamental. The AI can never surface content a user is not authorized to see, and it only cites documents within that user's entitlements. Permission-awareness is enforced at the AI layer, not just the UI, so answers themselves stay within bounds.

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
The platform itself brings up with standard Docker in a single command, so the core install is fast. The realistic timeline is driven by seeding the Company Brain with your documents, mapping permissions, and configuring Workflows & Approvals, which we plan with you. The proposal defines the deployment timeline and acceptance criteria explicitly.

**Q40. Do we need special skills to operate AdOS day to day?**
No exotic skills are required. AdOS uses standard Docker and ships documented runbooks for backup, restore, upgrade, and disaster recovery, so a normal IT/BT function can run day-2 operations. Support and success services back your team where needed.

**Q41. Can AdOS serve multiple sites from one deployment?**
Yes. AdOS is multi-tenant with strict tenant isolation, so a single deployment can serve multiple business units and sites with segregated data. This suits multi-site manufacturers and Organized Industrial Zones that provide shared services across many member firms.

**Q42. How do upgrades work?**
Upgrades follow a documented upgrade runbook that ships with the platform, so day-2 maintenance is planned, not improvised. Because you own the stack, you control when upgrades happen and can validate them in your environment first. There is no forced update pushed from a vendor cloud.

**Q43. What are the infrastructure prerequisites?**
You provide the compute — servers with CPU, optionally GPU acceleration — plus standard Docker hosting and storage for your documents and audit trail. Sizing depends on your user count, document volume, and latency targets, which we scope during evaluation. Because everything is local, there are no external API or connectivity prerequisites.

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
Enablement is part of the support and success relationship, so your operators and users can become productive quickly. This spans operating the platform, seeding the Company Brain, and configuring Digital Employees and Workflows & Approvals. Specific training scope is agreed with your team.

**Q49. Who owns day-2 operations, us or AdOS?**
Because you own the stack, your IT/BT team runs day-2 operations, backed by documented runbooks and our support and success services. The division of responsibilities is defined explicitly in the proposal so there is no ambiguity. Many customers operate independently after enablement, calling on support as needed.

**Q50. Do you offer help seeding the Company Brain?**
Yes. Getting value depends on seeding the Company Brain with your documents and mapping permissions correctly, and this is part of onboarding. We work with your team to load content, structure entitlements, and validate cited answers. The onboarding scope is defined in your engagement.

**Q51. What happens when a new AdOS version is released?**
New versions ship with a documented upgrade runbook, and because you control the stack you decide when to apply them. Support and success help you plan and validate upgrades in your environment. There is never a forced push from a vendor cloud that changes your system without your control.

## Backup

**Q52. Does AdOS support backups?**
Yes. AdOS ships a documented backup runbook so you can protect your Company Brain, configuration, and audit trail on a schedule you control. Because everything lives on your infrastructure, backups stay on your premises too.

**Q53. Where are backups stored?**
Backups are stored wherever you choose within your own infrastructure, because AdOS runs entirely on-premise and data never leaves your building. You apply your existing backup targets, retention policies, and encryption. Nothing is shipped to a vendor cloud.

**Q54. How do we restore from a backup?**
AdOS ships a documented restore runbook that pairs with the backup process, so recovery is a defined procedure rather than an improvisation. Your IT/BT team can execute it, with support available to assist. We recommend validating restores periodically as part of good practice.

**Q55. Is there a disaster-recovery plan?**
Yes. AdOS ships a documented disaster-recovery runbook alongside backup, restore, and upgrade procedures. This gives you a defined path to bring the platform back after a serious failure. Because you own the stack, your DR plan integrates with your existing infrastructure strategy.

**Q56. How often should we back up?**
Backup frequency is your decision, aligned to how often your Company Brain and configuration change and to your recovery objectives. The documented runbook supports scheduled backups so you can match your existing policies. We help you set a sensible cadence during onboarding.

**Q57. Do backups include the audit trail?**
Your backup strategy can cover the full platform state, including the immutable audit trail, so your record of consequential actions is preserved. This matters for regulated verticals where auditability must survive a recovery event. The runbook documents what to include for a complete restore.

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
Concurrent load is handled by the capacity you provision, and AdOS is multi-tenant with isolated tenants. We size your deployment to your expected concurrent user count during evaluation so throughput meets your needs. As usage grows, you scale hardware on your own terms without any per-query cost.

**Q64. Are there per-query costs that grow with usage?**
No. There is no per-token or per-query metering; your only marginal cost is electricity and hardware. This means heavy usage does not create a runaway API bill, which is a core cost advantage over metered cloud AI. Cost predictability improves as usage scales.

**Q65. How large a document base can Company Brain handle?**
Company Brain is designed for large enterprise knowledge bases, which is a natural fit for document-heavy verticals such as Logistics, Education, and Finance. Practical capacity depends on the hardware and storage you provision. We size this with you during evaluation based on your document volume.

**Q66. Does running offline hurt performance?**
No. Running offline or air-gapped does not slow AdOS, because inference is local either way; there is no round trip to the internet in normal operation. Performance is governed by your hardware, not by connectivity. This is why the platform runs identically with the network cable pulled.

**Q67. How do you set realistic performance expectations?**
During evaluation we size hardware to your expected user load and latency targets and state the trade-offs plainly. We would rather set honest expectations than oversell speed, because honesty protects the relationship at renewal. The pilot on your hardware validates real performance before you commit.

## Customization

**Q68. Can we tailor AdOS to our organization?**
Yes. Company Brain is seeded with your documents, Digital Employees are defined for your roles, and Workflows & Approvals are configured to your processes and approval tiers. The platform is meant to reflect how your organization actually works, not a generic template.

**Q69. Can we define our own Workflows & Approvals?**
Yes. Workflows & Approvals support structured business processes with tiered approval authority and deterministic routing, configured to your rules. This is how approval-heavy operations, common in Manufacturing and public institutions, are automated. Every step is captured in the audit trail.

**Q70. Can we create Digital Employees for specific roles?**
Yes. Digital Employees are defined for specific roles and permissions and perform the real work of those roles — answering, drafting, routing, and preparing approvals. In the NovaMak demo, for example, there are twelve Digital Employees across the organization. You configure them to your own functions and entitlements.

**Q71. Can we control who sees what?**
Yes, precisely. Permissions are central: users see only what they are entitled to, and the AI cites only within those entitlements. You map your organization's roles and access rules, and AdOS enforces them consistently across search, answers, and Digital Employees.

**Q72. Can we choose the AI model per our needs?**
Yes. You choose and own the model and can swap models without re-architecting, because AdOS speaks an OpenAI-compatible interface. This lets you balance latency, quality, and hardware for your specific use. As the open model ecosystem advances, you adopt improvements on your timeline.

**Q73. Is the user interface customizable to Turkish or English?**
Yes. AdOS provides a full Turkish and English UI, auto-detected from the user's environment, so each user works in their preferred language. Both languages are first-class against the same Company Brain. This suits mixed-language workforces common in Turkey-first organizations.

**Q74. Can AdOS reflect our multi-unit structure?**
Yes. AdOS is multi-tenant with strict tenant isolation, so it can mirror multiple business units and sites with segregated data from one deployment. The NovaMak demo models six sites, four business units, and sixteen departments to show this. Your structure is mapped during onboarding.

**Q75. How much customization is configuration versus custom code?**
The core tailoring — seeding Company Brain, defining Digital Employees, and configuring Workflows & Approvals and permissions — is configuration, not bespoke engineering. This keeps deployments repeatable and supportable by your IT/BT team. Where deeper extension is needed, the OpenAI-compatible, open-engine architecture avoids a black box.

## Integrations

**Q76. Does AdOS integrate with our existing systems?**
AdOS is built on open engines and an OpenAI-compatible interface, and your data is portable and exportable, which avoids a closed black box. Integration scope with your specific systems is defined during evaluation and the proposal. The goal is to fit your environment without creating lock-in.

**Q77. What inference engines does AdOS work with?**
AdOS works with Ollama and any OpenAI-compatible local server, including vLLM, LM Studio, llama.cpp, and SGLang. This gives you a choice of engine and lets you pick what suits your hardware and operations. You are never tied to a single proprietary engine.

**Q78. Do integrations require internet or external APIs?**
No. AdOS itself requires no external API, no API keys, and no internet to run, and it is air-gap capable. Any integration is designed to respect that on-premise, offline-first posture. Nothing about the platform depends on a third-party cloud to function.

**Q79. Can we export our data out of AdOS?**
Yes. Your data is portable and exportable — documents and configuration included — which is central to our no-lock-in principle. You are never trapped: because you own the stack, you can take your content elsewhere if you choose. This protects you commercially and technically.

**Q80. Is there an OpenAI-compatible interface we can build against?**
Yes. AdOS uses an OpenAI-compatible interface to its local inference layer, which is a familiar, well-documented standard. This makes it straightforward for your team to work with, and it is a key reason models can be swapped without re-architecting. It also keeps the architecture from being a black box.

**Q81. Will integrating AdOS create vendor lock-in?**
No. The whole design resists lock-in: open engines, an OpenAI-compatible interface, and portable, exportable data. You own the application, the data, and the model, so you retain leverage and independence. This is a deliberate contrast to metered cloud AI.

**Q82. Can Digital Employees act across our processes?**
Yes. Digital Employees move workflows forward — routing requests, preparing approvals, and completing defined tasks — within your Workflows & Approvals and permission model. They operate inside your processes rather than as a disconnected chatbot. Every consequential action they take is auditable.

**Q83. How do integrations respect permissions?**
Permission-awareness is enforced across AdOS, so any integrated access still honors user entitlements — the AI never surfaces or cites what a user may not see. Integrations are designed to operate within that same permission model, not around it. This keeps access control consistent everywhere.

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
We build an ROI model you control, with visible inputs and assumptions, leading with payback period and annual savings. It anchors on your own discovery numbers — search time, approval delays, training cost — and shows efficiency gains. The assumptions panel stays visible, so the case is honest and defensible at renewal.

**Q89. Is there a per-seat option?**
Pricing can be structured per deployment or per-seat band, depending on what fits your organization. The right structure is scoped with you, and Deal Desk confirms it. Whatever the structure, there is never per-token or per-query metering.

**Q90. Will costs spike if usage grows?**
No. Because there is no per-token or per-query billing, heavy usage does not create a runaway bill; your marginal cost is electricity and hardware. As you scale hardware, cost stays predictable and under your control. This is a core advantage over metered cloud AI.

**Q91. How is discounting handled?**
Discounting is principled and governed by Deal Desk, never improvised in the room. Commercial figures in the proposal are placeholders until Deal Desk fills them, and the template never ships with invented prices. This keeps pricing consistent and fair across deals.

## Training

**Q92. How hard is AdOS to learn for end users?**
AdOS is built to be usable in each person's own language, with a full Turkish and English UI auto-detected from their environment. Because answers are grounded and cited, users can trust and verify what they get rather than learning prompt tricks. Enablement during onboarding gets users productive quickly.

**Q93. Do you provide training for our operators?**
Yes. Enablement is part of the support and success relationship and covers operating the platform, using the documented runbooks, and configuring the system. Your IT/BT team learns backup, restore, upgrade, and disaster-recovery procedures. Specific training scope is agreed with your team.

**Q94. How does AdOS reduce our ongoing training burden?**
Company Brain retains institutional knowledge and answers questions with cited sources, so staff can self-serve answers instead of repeatedly asking experts. This directly reduces repeated training, which is especially valuable in high-turnover, distributed workforces like Retail. It also protects knowledge when an expert leaves.

**Q95. Does AdOS help retain knowledge when experts leave?**
Yes. Company Brain captures the organization's knowledge in a permission-aware, cited form, so expertise does not walk out the door with a departing employee. New staff can find grounded answers from day one. HR teams value this for knowledge retention and onboarding.

**Q96. Is training available in Turkish?**
Yes. AdOS is Turkey-first with native Turkish and English, so both the product and enablement serve Turkish-speaking teams natively. Turkish is first-class, not a literal afterthought. This suits Turkey-first organizations and mixed-language workforces.

**Q97. How long until users are productive?**
Because the interface is bilingual and answers are cited, users typically become productive quickly after content is seeded and permissions are mapped. The realistic path depends on onboarding your documents and configuring roles, which we plan with you. Enablement is structured to shorten time to value.

**Q98. Do you train Digital Employees or do we?**
Digital Employees are configured to your roles and permissions during onboarding, and we work with your team to define them. Because they run on your local, permission-aware foundation, their scope is set by your configuration, not by an external service. You retain control of what each Digital Employee does.

**Q99. What onboarding is involved to get value?**
The path to value is seeding the Company Brain with your documents, mapping permissions, and configuring Digital Employees and Workflows & Approvals. We support this as part of onboarding and define the scope in your engagement. Getting these right is what turns the platform into measurable outcomes.

## Migration

**Q100. Can we migrate our existing documents into Company Brain?**
Yes. Onboarding includes seeding the Company Brain with your documents and mapping permissions so answers are grounded and correctly scoped. We work with your team to load content and validate cited answers. The scope of the migration is defined in your engagement.

**Q101. Will migration send our data anywhere external?**
No. Migration happens entirely within your own infrastructure, consistent with AdOS being on-premise, offline-first, and air-gap capable. Your documents never leave your premises during onboarding. There is no external service in the loop.

**Q102. Can we migrate away from AdOS later if we choose?**
Yes. Your data is portable and exportable, and AdOS uses open engines and an OpenAI-compatible interface, so there is no vendor lock-in. You own the application, data, and model and can move your content elsewhere. This independence is a deliberate part of the design.

**Q103. How do we move AdOS to new hardware?**
Because AdOS uses standard Docker and portable data, moving to new hardware follows the documented backup and restore procedures. You own the stack, so hardware refreshes and site moves are under your control. Support and success assist where needed.

**Q104. Can we migrate from a cloud AI tool to AdOS?**
Yes, and this is a common motivation: teams move off metered cloud AI to keep data on-premise and eliminate per-token cost. Migration focuses on seeding your Company Brain and configuring roles and workflows in AdOS. We scope the transition with you during evaluation.

**Q105. Does migration require downtime of our other systems?**
Migration into AdOS is scoped to your environment and planned to fit your operational constraints, and because AdOS runs on your own infrastructure you control the schedule. The proposal defines the timeline and acceptance criteria explicitly. We plan the sequence to minimize disruption.

**Q106. How do we preserve permissions during migration?**
Mapping permissions is a core part of onboarding, so that from day one users see only what they are entitled to and the AI cites within those entitlements. We work with your team to translate your existing roles and access rules into AdOS. Validation confirms that restricted content is correctly invisible to unentitled users.

**Q107. What is the first step to get started?**
The first step is a discovery conversation to quantify your problem — search time, approval delays, knowledge loss, and where data cannot leave the building. From there we build an ROI model with your numbers, demonstrate on NovaMak against your named pains, and propose a pilot on your own hardware with defined acceptance criteria. Contact your AdOS account team to begin.

---

# Türkçe

## Genel

**S1. AdOS'u tek cümleyle nasıl tanımlarsınız?**
AdOS, tamamen kendi altyapınızda çalışan bir kurumsal yapay zeka işletim sistemidir — verileriniz binanızdan asla çıkmaz ve internet olmadan da çalışır. Kurumunuzun bilgisini, insanlarını ve günlük işlerini tek bir sistemde birleştirir. Üç sütunu Company Brain, Digital Employees ve Workflows & Approvals'tır.

**S2. AdOS'un üç sütunu nedir?**
Company Brain, her yapay zeka yanıtının kendi belgelerinize dayandığı ve kaynaklarını gösterdiği, izin farkındalıklı özel bilgi tabanınızdır. Digital Employees, tanımlı rol ve izinler çerçevesinde gerçek bilgi işi yapan — yanıtlayan, taslak hazırlayan, yönlendiren ve onayları hazırlayan — yapay zeka ajanlarıdır. Workflows & Approvals ise kademeli onay yetkisi, deterministik yönlendirme ve tam denetim izi içeren yapılandırılmış iş süreçleridir.

**S3. AdOS, genel bulut yapay zeka asistanından nasıl farklıdır?**
Genel bir bulut asistanı verilerinizi üçüncü tarafın sunucularına gönderir ve sizi sonsuza dek jeton başına ücretlendirir. AdOS ise tamamen sizin sahip olduğunuz donanımda çalışır; belgeleriniz, komutlarınız ve yanıtlarınız binanızdan asla çıkmaz ve jeton başına fatura yoktur. Tüm yığına siz sahip olursunuz: uygulama, veri ve yapay zeka modeli.

**S4. AdOS sadece bir sohbet botu mu?**
Hayır. Bir sohbet botu kutu içinde soru yanıtlar; AdOS ise Digital Employees ve Workflows & Approvals da çalıştıran, iş için bir işletim katmanıdır. Her yanıt izin farkındalıklı, kaynak gösterimli ve denetlenebilirdir ve sistem yalnızca konuşmayı değil, gerçek işi ileri taşır.

**S5. AdOS kimler için tasarlandı?**
Yaklaşık 250–10.000 çalışanı olan, çok tesisli veya çok birimli ve kendi altyapısını kontrol eden kurumlar için. Öncelikli sektörler arasında Üretim, Organize Sanayi Bölgeleri (OSB), Belediyeler ve kamu kurumları, Sağlık, Lojistik, Perakende, Eğitim ve Finans yer alır. Türkiye öncelikli olup yerel Türkçe ve İngilizce sunar ve veri egemenliği gerektiren her pazara uyarlanabilir.

**S6. Üç ana değer sütunu nedir?**
Sovereign, Capable ve Accountable — her zaman bu sırayla. Sovereign, %100 kendi altyapınızda çalışması ve verilerinizin asla dışarı çıkmaması demektir. Capable, bunun bir sohbet botu değil gerçek bir yapay zeka işletim sistemi olması demektir. Accountable ise izin farkındalıklı, kaynak gösterimli ve tam denetlenebilir olması demektir.

**S7. AdOS iki dilli mi?**
Evet. AdOS, kullanıcının ortamından otomatik algılanan tam bir Türkçe ve İngilizce kullanıcı arayüzü sunar. Her iki dil de birinci sınıftır; böylece karma bir iş gücü, aynı Company Brain üzerinde herkes tercih ettiği dilde çalışabilir.

**S8. Bugün AdOS'un hangi sürümü mevcut?**
AdOS, Company Brain, Digital Employees ve Workflows & Approvals'ı kapsayan eksiksiz bir platform olarak 1.0.0 sürümündedir. Standart Docker ile kurulur ve belgelenmiş yedekleme, geri yükleme, yükseltme ve felaket kurtarma kılavuzlarıyla gelir. Bir önizleme değil, kurum içi üretim kullanımı için tasarlanmıştır.

**S9. Satın almadan önce AdOS'u görebilir miyim?**
Evet. Kurgusal bir üreticiyi temsil eden, eksiksiz, kendi içinde tutarlı ve deterministik bir demo ortamı olan NovaMak Endüstri A.Ş. üzerinden gösterim yaparız. Demo, keşif aşamasında adını koyduğunuz sorunlara eşlenir ve her önemli iddia canlı görebileceğiniz bir şeydir — ağ kablosunu çekip çevrimdışı da çalıştığını göstermek dahil.

## Lisanslama

**S10. AdOS nasıl lisanslanır?**
AdOS bir platform olarak lisanslanır: dağıtım başına veya koltuk bandı başına yapılandırılan bir platform lisansı ile destek ve başarı hizmeti. Jeton başına veya sorgu başına ölçümleme yoktur çünkü yerel çıkarımın marjinal API maliyeti yoktur. Kesin koşullar her dağıtıma göre belirlenir ve Deal Desk tarafından onaylanır.

**S11. Lisans süresiz mi yoksa abonelik mi?**
Lisans koşulları her dağıtıma göre belirlenir ve teklifte anlaşılır; süreli olsun ya da olmasın, tedarik modelinize uyan yapıyı destekleriz. Her seçenekte değişmeyen şey, kullanım ölçümlemesi ve jeton başına faturalandırma olmamasıdır. Deal Desk, sizin durumunuz için kesin süreyi, yenilemeyi ve destek yapısını onaylar.

**S12. Lisans, kaç soru veya jeton kullanabileceğimizi sınırlar mı?**
Hayır. Çıkarım kendi donanımınızda çalıştığı için tek marjinal maliyetiniz elektriktir, ölçümlü bir fatura değil. Company Brain'e donanımınızın izin verdiği kadar soru sorabilir ve Digital Employees'i istediğiniz sıklıkta çalıştırabilirsiniz; sorgu başına veya jeton başına hiçbir ücret yoktur.

**S13. Digital Employees ayrı mı lisanslanır?**
Digital Employees, AdOS platformunun bir parçasıdır ve nasıl paketlendiği, özel dağıtım kapsamınızda tanımlanır. Yerel çıkarım motorunuzda çalıştıkları için yaptıkları iş için mesaj başına veya jeton başına ücret yoktur. Geçerli olan koltuk veya dağıtım bantlarını Deal Desk belirler.

**S14. Sözleşme sona ererse erişimimize ne olur?**
AdOS altyapınızda çalıştığı ve veriler size ait olduğu için verilerinizi elinizde tutar ve her şeyi dışa aktarabilirsiniz. Tedarikçi kilitlenmesi yoktur: AdOS açık motorlar ve OpenAI uyumlu bir arayüz kullanır; belgeleriniz ve yapılandırmanız taşınabilirdir. Sözleşme sonrası operasyonel ayrıntılar anlaşmanızda tanımlanır.

**S15. Çalışmaya devam etmek için internete veya lisans sunucusuna ihtiyacımız var mı?**
Hayır. AdOS çevrimdışı önceliklidir ve hava boşluklu (air-gap) çalışabilir; dolayısıyla çalışmak için lisans doğrulamak amacıyla bir yere bağlanmaz. Platform, internetten tamamen kopuk çalışacak şekilde tasarlanmıştır.

**S16. Tek bir lisans birden fazla iş birimini veya tesisi kapsayabilir mi?**
Evet. AdOS, sıkı kiracı yalıtımıyla çok kiracılıdır; böylece tek bir dağıtım, ayrılmış verilerle birden fazla iş birimine hizmet verebilir. Birimlerin ve tesislerin ticari koşullarınıza nasıl eşleneceği her dağıtıma göre belirlenir. Bu, çok tesisli üreticiler ve birçok üye firmaya hizmet veren Organize Sanayi Bölgeleri için doğal bir uyumdur.

**S17. Deneme veya pilot seçeneği var mı?**
Evet. Önerdiğimiz değerlendirme yolu, kendi donanımınızda bir pilottur; böylece verileriniz binanızda kalırken AdOS'u kendi koşullarınızda doğrularsınız. Pilotun, "başarı"nın nesnel olması için baştan üzerinde anlaşılan kabul kriterleri vardır. Kapsam ve süre, değerlendirme sırasında ekibinizle belirlenir.

## Güvenlik

**S18. AdOS'u kullandığımızda verilerimiz nereye gider?**
Binanızın dışına hiçbir yere. Müşteri verileri — belgeler, komutlar, yanıtlar ve iş akışları — altyapınızdan asla çıkmaz ve iş içeriğine dair telemetri yoktur. Bu, birincil güvenlik iddiasıdır ve diğer her şey bunu destekler.

**S19. AdOS, OpenAI veya Anthropic gibi harici yapay zeka sağlayıcılarına bir şey gönderir mi?**
Hayır. AdOS, barındırılan bir yapay zeka API'sinin sarmalayıcısı değildir ve OpenAI, Anthropic, Google veya herhangi bir harici model sağlayıcısına bağımlı değildir. Tüm çıkarım yerel olarak donanımınızda çalışır; dolayısıyla herhangi bir yapay zeka tedarikçisine giden harici bir veri yolu yoktur.

**S20. AdOS tamamen hava boşluklu (air-gap) çalışabilir mi?**
Evet. AdOS çevrimdışı önceliklidir ve çalışmak için harici API, API anahtarı ve internet bağlantısı gerektirmeden tamamen hava boşluklu çalışacak şekilde tasarlanmıştır. Bu, belirli kamu, sağlık ve finans ortamları gibi ağın kasıtlı olarak yalıtıldığı durumları doğrudan karşılar.

**S21. AdOS, kullanıcıların görmemesi gereken belgeleri görmesini nasıl engeller?**
AdOS uçtan uca izin farkındalıklıdır. Bir kullanıcı yalnızca yetkili olduğu belgeleri görür ve yapay zeka yalnızca onları kaynak gösterir; model, kullanıcının izinleri dışındaki içeriği asla ortaya çıkaramaz veya kaynak gösteremez. Demoda bunu, kısıtlı bir belgenin yetkisiz bir kullanıcıya görünmez olduğunu göstererek kanıtlarız.

**S22. Denetim izi var mı?**
Evet. Yanıtlardan ve onaylardan iş akışı adımlarına kadar her önemli eylem, değiştirilemez bir denetim izinde kaydedilir. Bu, Güvenlik ve Uyum ekiplerine kimin ne zaman ne yaptığına dair savunulabilir bir kayıt sağlar ve düzenlemeye tabi sektörlerde şarttır.

**S23. AdOS'un saldırı yüzeyi nedir?**
AdOS harici API çağrısı yapmadığı için ihlal edilecek üçüncü taraf veri yolu yoktur; bu, bulut yapay zekasına kıyasla saldırı yüzeyini önemli ölçüde azaltır. Hava boşluklu çalışabilir ve tüm yığın sahip olduğunuz altyapıda çalıştığı için tüm çevreyi siz kontrol edersiniz. Kendi ağ, kimlik ve sıkılaştırma denetimlerinizi bunun etrafında uygularsınız.

**S24. AdOS verilerimizle eğitim yapar mı veya kimseyle paylaşır mı?**
Hayır. AdOS müşteri verisini paraya çevirmez, iletmez veya bunun üzerinde eğitim yapmaz. İçeriğiniz size ait kalır; iş içeriğine dair telemetri ve gönderilecek harici bir model yoktur.

**S25. AdOS, veri yerleşimi ve uyum zorunluluklarını nasıl destekler?**
Kurum içi ve hava boşluklu çalışma, veri fiziksel olarak binanızdan asla çıkmadığı için veri yerleşimi zorunluluklarını doğrudan karşılar. Bu yüzden birçok belediye, sağlık kuruluşu ve finans kurumu için kurum içi çalışma bir tercih değil, gerekliliktir. Mimarimizi ve denetimlerimizi dürüstçe anlatırız ve AdOS'un kazanmadığı sertifikaları iddia etmeyiz.

**S26. AdOS belirli güvenlik sertifikaları iddia ediyor mu?**
Platformun kazanmadığı sertifikaları iddia etmek yerine mimarimiz ve denetimlerimiz hakkında doğru olanı anlatırız. Tedarikinizin belirli sertifikalar veya beyanlar gerektirdiği yerlerde, bunu değerlendirme sırasında mevcut duruma karşı dürüstçe ele alırız. Kalıcı iddia mimaridir: verileriniz binanızdan asla çıkmaz.

## AI

**S27. AdOS hangi yapay zeka modellerini kullanır?**
AdOS, açık ve yerel modelleri Ollama gibi bir yerel çıkarım motoru veya vLLM, LM Studio, llama.cpp ya da SGLang gibi OpenAI uyumlu herhangi bir yerel sunucu üzerinden çalıştırır. Modeli siz seçer ve sahip olursunuz ve modeller platformu yeniden mimarilemeden değiştirilebilir. Herhangi bir harici model sağlayıcısına bağımlılık yoktur.

**S28. Bir yapay zeka şirketiyle API anahtarına veya hesaba ihtiyacımız var mı?**
Hayır. AdOS'un yapay zekasını çalıştırmak için harici API, API anahtarı veya internet bağlantısı gerekmez. Tüm çıkarım kendi donanımınızda gerçekleşir; dolayısıyla yönetilecek veya ödenecek üçüncü taraf yapay zeka hesabı yoktur.

**S29. Yapay zeka uydurma yapmayı nasıl önler?**
Company Brain'deki her yapay zeka yanıtı kendi belgelerinize dayanır ve kaynaklarını gösterir; böylece yanıtlar altta yatan içeriğe kadar izlenebilir. "Yanıta güven" yerine kaynağı açıp doğrulayabilirsiniz. Kaynaklar ayrıca izne göre kapsanır; yani yapay zeka yalnızca kullanıcının görmeye yetkili olduğu şeyi kaynak gösterir.

**S30. Modeli daha sonra seçebilir veya değiştirebilir miyiz?**
Evet. Modeli siz seçer ve sahip olursunuz; platform OpenAI uyumlu bir arayüz konuştuğu için modeller AdOS'u yeniden mimarilemeden değiştirilebilir. Daha iyi yerel modeller çıktıkça bunları kendi takviminizde benimseyebilirsiniz. Bu esneklik, tedarikçi kilitlenmesini önlemenin bir parçasıdır.

**S31. Yerel yapay zeka, ChatGPT veya diğer bulut hizmetleri kadar hızlı mı?**
Bu konuda dürüstüz: mütevazı CPU donanımında yerel çıkarım, barındırılan öncü bir API'den daha yavaştır — milisaniye değil, saniye. GPU gibi daha iyi donanım bu farkı önemli ölçüde kapatır. Bu ödünleşim size egemenlik, jeton başına maliyet olmaması ve tam kontrol kazandırır ve bizim alıcılarımız için bu, ham gecikmeden daha ağır basar.

**S32. Yerel model, en büyük bulut modelleri kadar yetenekli mi?**
Barındırılan öncü modeller bazı görevlerde önde olabilir ve bunu açıkça söyleriz. Kendi belgeleriniz üzerinden dayanaklı ve kaynak gösterimli yanıtlar ve tanımlı Digital Employee görevlerini çalıştırmak için iyi seçilmiş yerel modeller son derece etkilidir ve açık ekosistem ilerledikçe modeli yükseltebilirsiniz. Bir görev gerçekten öncü ölçekli bir modeli gerektiriyor ve kurum içi ödünleşimlere tolerans yoksa, bunu keşif sırasında dürüstçe söyleriz.

**S33. Digital Employees teknik olarak nedir?**
Digital Employees, tanımlı rol ve izinler çerçevesinde gerçek bilgi işi yapan — soruları yanıtlayan, içerik taslağı hazırlayan, talepleri yönlendiren, onayları hazırlayan ve iş akışlarını ileri taşıyan — yapay zeka ajanlarıdır. AdOS'un geri kalanıyla aynı yerel, izin farkındalıklı ve denetlenebilir temelde çalışırlar. Eylemleri, herhangi bir önemli eylem gibi denetim izine kaydedilir.

**S34. Yapay zeka yanıt üretirken kullanıcı izinlerine uyar mı?**
Evet, bu temeldir. Yapay zeka, bir kullanıcının görmeye yetkili olmadığı içeriği asla ortaya çıkaramaz ve yalnızca o kullanıcının yetkileri dahilindeki belgeleri kaynak gösterir. İzin farkındalığı yalnızca arayüzde değil, yapay zeka katmanında da uygulanır; böylece yanıtların kendisi sınırlar içinde kalır.

**S35. Yapay zekayı iyi çalıştırmak için hangi donanıma ihtiyacımız var?**
AdOS, yalnızca CPU'lu sunuculardan GPU hızlandırmalı makinelere kadar sizin sağladığınız donanımda çalışır ve performans, sağladığınızla ölçeklenir. Mütevazı CPU donanımı çalışır ama daha yavaştır; GPU'lar yanıt sürelerini anlamlı biçimde iyileştirir. Değerlendirme sırasında donanımı beklenen kullanıcı yüküne ve gecikme hedeflerinize göre boyutlandırırız; böylece beklentiler dürüstçe belirlenir.

## Dağıtım

**S36. AdOS nasıl dağıtılır?**
AdOS, standart Docker ve tek komutla ayağa kaldırma ile kurum içine veya özel bulut/VPC'nize dağıtılır. Standart, belgelenmiş araçlar kullandığı için mevcut IT/BT ekibiniz bunu egzotik beceriler olmadan işletebilir. Dağıtımdan sonra tüm yığına müşteri sahip olur.

**S37. AdOS'u kendi veri merkezimizde dağıtabilir miyiz?**
Evet. Kendi veri merkezinizde kurum içi dağıtım temel modeldir ve aynı şekilde kontrol ettiğiniz bir özel bulut veya VPC'ye de dağıtabilirsiniz. Her iki durumda da tüm yığın — uygulama, veri ve model — sahip olduğunuz veya kontrol ettiğiniz altyapıda çalışır.

**S38. Dağıtım internet erişimi gerektirir mi?**
Hayır. AdOS çevrimdışı önceliklidir ve internet bağlantısı gerekmeden tamamen hava boşluklu dağıtılabilir ve işletilebilir. Bağlantınız olduğu yerde kolaylık için kullanabilirsiniz, ancak bu, platformun çalışması için asla bir bağımlılık değildir.

**S39. Tipik bir dağıtım ne kadar sürer?**
Platformun kendisi standart Docker ile tek komutta ayağa kalkar; dolayısıyla çekirdek kurulum hızlıdır. Gerçekçi zaman çizelgesi; Company Brain'i belgelerinizle beslemek, izinleri eşlemek ve Workflows & Approvals'ı yapılandırmakla belirlenir ve bunu sizinle planlarız. Teklif, dağıtım zaman çizelgesini ve kabul kriterlerini açıkça tanımlar.

**S40. AdOS'u günlük işletmek için özel becerilere ihtiyacımız var mı?**
Egzotik beceri gerekmez. AdOS standart Docker kullanır ve yedekleme, geri yükleme, yükseltme ve felaket kurtarma için belgelenmiş kılavuzlarla gelir; böylece normal bir IT/BT işlevi 2. gün operasyonlarını yürütebilir. Gerektiğinde destek ve başarı hizmetleri ekibinizi destekler.

**S41. AdOS tek bir dağıtımdan birden fazla tesise hizmet verebilir mi?**
Evet. AdOS, sıkı kiracı yalıtımıyla çok kiracılıdır; böylece tek bir dağıtım, ayrılmış verilerle birden fazla iş birimine ve tesise hizmet verebilir. Bu, çok tesisli üreticilere ve birçok üye firmaya paylaşımlı hizmetler sunan Organize Sanayi Bölgelerine uygundur.

**S42. Yükseltmeler nasıl çalışır?**
Yükseltmeler, platformla gelen belgelenmiş bir yükseltme kılavuzunu izler; böylece 2. gün bakımı doğaçlama değil, planlıdır. Yığına siz sahip olduğunuz için yükseltmelerin ne zaman yapılacağını siz kontrol eder ve önce kendi ortamınızda doğrulayabilirsiniz. Bir tedarikçi bulutundan zorla gönderilen bir güncelleme yoktur.

**S43. Altyapı önkoşulları nelerdir?**
Hesaplama gücünü — CPU'lu, isteğe bağlı GPU hızlandırmalı sunucular — ve belgeleriniz ile denetim iziniz için standart Docker barındırma ve depolamayı siz sağlarsınız. Boyutlandırma; kullanıcı sayınıza, belge hacminize ve gecikme hedeflerinize bağlıdır ve bunları değerlendirme sırasında belirleriz. Her şey yerel olduğu için harici API veya bağlantı önkoşulu yoktur.

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
Etkinleştirme (enablement), destek ve başarı ilişkisinin bir parçasıdır; böylece operatörleriniz ve kullanıcılarınız hızla üretken olabilir. Bu; platformu işletmeyi, Company Brain'i beslemeyi ve Digital Employees ile Workflows & Approvals'ı yapılandırmayı kapsar. Özel eğitim kapsamı ekibinizle kararlaştırılır.

**S49. 2. gün operasyonlarının sahibi biz miyiz yoksa AdOS mu?**
Yığına siz sahip olduğunuz için 2. gün operasyonlarını, belgelenmiş kılavuzlar ile destek ve başarı hizmetlerimizin desteğiyle IT/BT ekibiniz yürütür. Sorumlulukların paylaşımı, belirsizlik olmaması için teklifte açıkça tanımlanır. Birçok müşteri etkinleştirmeden sonra bağımsız çalışır ve gerektiğinde desteğe başvurur.

**S50. Company Brain'i beslemede yardım sunuyor musunuz?**
Evet. Değer elde etmek, Company Brain'i belgelerinizle beslemeye ve izinleri doğru eşlemeye bağlıdır ve bu, ilk kurulumun bir parçasıdır. İçeriği yüklemek, yetkileri yapılandırmak ve kaynak gösterimli yanıtları doğrulamak için ekibinizle çalışırız. İlk kurulum kapsamı taahhüdünüzde tanımlanır.

**S51. Yeni bir AdOS sürümü yayınlandığında ne olur?**
Yeni sürümler belgelenmiş bir yükseltme kılavuzuyla gelir ve yığını siz kontrol ettiğiniz için bunları ne zaman uygulayacağınıza siz karar verirsiniz. Destek ve başarı, yükseltmeleri kendi ortamınızda planlamanıza ve doğrulamanıza yardımcı olur. Sisteminizi kontrolünüz dışında değiştiren, bir tedarikçi bulutundan gelen zorla bir gönderim asla yoktur.

## Yedekleme

**S52. AdOS yedeklemeyi destekliyor mu?**
Evet. AdOS, Company Brain'inizi, yapılandırmanızı ve denetim izinizi kontrol ettiğiniz bir programda korumanız için belgelenmiş bir yedekleme kılavuzuyla gelir. Her şey altyapınızda bulunduğu için yedekler de binanızda kalır.

**S53. Yedekler nerede saklanır?**
Yedekler, kendi altyapınızda seçtiğiniz yerde saklanır çünkü AdOS tamamen kurum içinde çalışır ve veriler binanızdan çıkmaz. Mevcut yedekleme hedeflerinizi, saklama politikalarınızı ve şifrelemenizi uygularsınız. Hiçbir şey bir tedarikçi bulutuna gönderilmez.

**S54. Bir yedekten nasıl geri yükleriz?**
AdOS, yedekleme süreciyle eşleşen belgelenmiş bir geri yükleme kılavuzuyla gelir; böylece kurtarma doğaçlama değil, tanımlı bir prosedürdür. IT/BT ekibiniz bunu yürütebilir; yardımcı olmak için destek mevcuttur. İyi uygulamanın parçası olarak geri yüklemeleri düzenli olarak doğrulamanızı öneririz.

**S55. Bir felaket kurtarma planı var mı?**
Evet. AdOS; yedekleme, geri yükleme ve yükseltme prosedürlerinin yanında belgelenmiş bir felaket kurtarma kılavuzuyla gelir. Bu, ciddi bir arızadan sonra platformu geri getirmeniz için tanımlı bir yol sağlar. Yığına siz sahip olduğunuz için felaket kurtarma planınız mevcut altyapı stratejinizle bütünleşir.

**S56. Ne sıklıkta yedeklemeliyiz?**
Yedekleme sıklığı sizin kararınızdır; Company Brain'inizin ve yapılandırmanızın ne sıklıkta değiştiğine ve kurtarma hedeflerinize göre ayarlanır. Belgelenmiş kılavuz, mevcut politikalarınıza uyacak şekilde programlı yedeklemeleri destekler. İlk kurulum sırasında makul bir sıklık belirlemenize yardımcı oluruz.

**S57. Yedekler denetim izini içerir mi?**
Yedekleme stratejiniz, değiştirilemez denetim izi dahil tüm platform durumunu kapsayabilir; böylece önemli eylemlere dair kaydınız korunur. Bu, denetlenebilirliğin bir kurtarma olayından sağ çıkması gereken düzenlemeye tabi sektörler için önemlidir. Kılavuz, eksiksiz bir geri yükleme için nelerin dahil edileceğini belgeler.

**S58. Donanım değiştirirsek yedekler taşınabilir mi?**
Evet. AdOS standart araçlar kullandığı ve verileriniz taşınabilir ve dışa aktarılabilir olduğu için yedekler tek bir tedarikçi ortamına kilitli değildir. Bu, kilitlenme olmadan donanım yenilemelerini ve tesis taşımalarını destekler. Taşıma ayrıntıları belgelenmiş prosedürlerle kapsanır.

**S59. Yedekleme herhangi bir internet veya bulut hizmeti gerektirir mi?**
Hayır. Yedekleme ve geri yükleme tamamen altyapınızda çalışır; bu, AdOS'un çevrimdışı öncelikli ve hava boşluklu çalışabilir olmasıyla tutarlıdır. Bir bulut yedekleme hizmetine bağımlılık yoktur. Yedeklerinizin nerede bulunacağının tam kontrolü sizde kalır.

## Performans

**S60. AdOS yanıtları ne kadar hızlı?**
Hız, sağladığınız donanıma bağlıdır. Mütevazı, yalnızca CPU'lu donanımda yerel çıkarım, barındırılan öncü bir API'den daha yavaştır — milisaniye değil, saniye — ve GPU gibi daha iyi donanım farkı önemli ölçüde kapatır. Bu ödünleşim konusunda bilinçli olarak dürüstüz ve değerlendirme sırasında donanımı gecikme hedeflerinize göre boyutlandırırız.

**S61. Yerel yapay zeka neden bulut yapay zekadan daha yavaş?**
Barındırılan öncü API'ler çok büyük, özel veri merkezi donanımında çalışırken yerel çıkarım sizin sağladığınız donanımda çalışır. Dürüst ödünleşim budur: mütevazı donanımda biraz gecikme karşılığında egemenlik, jeton başına maliyet olmaması ve tam kontrol kazanırsınız. Daha iyi yerel donanıma, özellikle GPU'lara yatırım yapmak yanıt sürelerini anlamlı biçimde iyileştirir.

**S62. Performansı iyileştirebilir miyiz?**
Evet. Performans donanımla ölçeklenir; dolayısıyla GPU hızlandırma veya daha güçlü sunucular eklemek yanıt sürelerini anlamlı biçimde azaltır. Ayrıca gecikme ve kalite ihtiyaçlarınıza göre boyutlandırılmış bir yerel model seçebilirsiniz. Yığına siz sahip olduğunuz için bunlar istediğiniz zaman çekebileceğiniz kaldıraçlardır.

**S63. Daha fazla kullanıcıyla performans düşer mi?**
Eşzamanlı yük, sağladığınız kapasiteyle karşılanır ve AdOS, yalıtılmış kiracılarla çok kiracılıdır. Dağıtımınızı, değerlendirme sırasında beklenen eşzamanlı kullanıcı sayınıza göre boyutlandırırız; böylece verim ihtiyaçlarınızı karşılar. Kullanım büyüdükçe, sorgu başına herhangi bir maliyet olmadan donanımı kendi koşullarınızda ölçeklersiniz.

**S64. Kullanımla birlikte artan sorgu başına maliyetler var mı?**
Hayır. Jeton başına veya sorgu başına ölçümleme yoktur; tek marjinal maliyetiniz elektrik ve donanımdır. Bu, yoğun kullanımın kontrolden çıkan bir API faturası oluşturmayacağı anlamına gelir; ki bu, ölçümlü bulut yapay zekasına göre temel bir maliyet avantajıdır. Kullanım ölçeklendikçe maliyet öngörülebilirliği artar.

**S65. Company Brain ne kadar büyük bir belge tabanını işleyebilir?**
Company Brain, büyük kurumsal bilgi tabanları için tasarlanmıştır; bu da Lojistik, Eğitim ve Finans gibi belge yoğun sektörlere doğal bir uyumdur. Pratik kapasite, sağladığınız donanıma ve depolamaya bağlıdır. Bunu değerlendirme sırasında belge hacminize göre sizinle birlikte boyutlandırırız.

**S66. Çevrimdışı çalışmak performansa zarar verir mi?**
Hayır. Çevrimdışı veya hava boşluklu çalışmak AdOS'u yavaşlatmaz çünkü çıkarım her durumda yereldir; normal çalışmada internete gidiş-dönüş yoktur. Performans, bağlantı tarafından değil, donanımınız tarafından belirlenir. Platformun ağ kablosu çekildiğinde de aynı şekilde çalışmasının nedeni budur.

**S67. Gerçekçi performans beklentilerini nasıl belirlersiniz?**
Değerlendirme sırasında donanımı beklenen kullanıcı yükünüze ve gecikme hedeflerinize göre boyutlandırır ve ödünleşimleri açıkça belirtiriz. Hızı abartmaktansa dürüst beklentiler belirlemeyi tercih ederiz çünkü dürüstlük ilişkiyi yenilemede korur. Kendi donanımınızdaki pilot, taahhütte bulunmadan önce gerçek performansı doğrular.

## Özelleştirme

**S68. AdOS'u kurumumuza göre uyarlayabilir miyiz?**
Evet. Company Brain belgelerinizle beslenir, Digital Employees rollerinize göre tanımlanır ve Workflows & Approvals süreçlerinize ve onay kademelerinize göre yapılandırılır. Platform, genel bir şablonu değil, kurumunuzun gerçekte nasıl çalıştığını yansıtacak şekilde tasarlanmıştır.

**S69. Kendi Workflows & Approvals'ımızı tanımlayabilir miyiz?**
Evet. Workflows & Approvals; kurallarınıza göre yapılandırılan, kademeli onay yetkisi ve deterministik yönlendirme içeren yapılandırılmış iş süreçlerini destekler. Üretimde ve kamu kurumlarında yaygın olan onay yoğun operasyonlar bu şekilde otomatikleştirilir. Her adım denetim izinde yakalanır.

**S70. Belirli roller için Digital Employees oluşturabilir miyiz?**
Evet. Digital Employees, belirli rol ve izinler için tanımlanır ve o rollerin gerçek işini yapar — yanıtlar, taslak hazırlar, yönlendirir ve onayları hazırlar. Örneğin NovaMak demosunda kuruluş genelinde on iki Digital Employee vardır. Bunları kendi işlevlerinize ve yetkilerinize göre yapılandırırsınız.

**S71. Kimin neyi göreceğini kontrol edebilir miyiz?**
Evet, tam olarak. İzinler merkezidir: kullanıcılar yalnızca yetkili oldukları şeyi görür ve yapay zeka yalnızca o yetkiler dahilinde kaynak gösterir. Kurumunuzun rollerini ve erişim kurallarını eşlersiniz ve AdOS bunları arama, yanıtlar ve Digital Employees genelinde tutarlı biçimde uygular.

**S72. İhtiyaçlarımıza göre yapay zeka modelini seçebilir miyiz?**
Evet. Modeli siz seçer ve sahip olursunuz ve AdOS OpenAI uyumlu bir arayüz konuştuğu için modelleri yeniden mimarilemeden değiştirebilirsiniz. Bu, özel kullanımınız için gecikme, kalite ve donanımı dengelemenizi sağlar. Açık model ekosistemi ilerledikçe, iyileştirmeleri kendi takviminizde benimsersiniz.

**S73. Kullanıcı arayüzü Türkçe veya İngilizce'ye özelleştirilebilir mi?**
Evet. AdOS, kullanıcının ortamından otomatik algılanan tam bir Türkçe ve İngilizce arayüz sunar; böylece her kullanıcı tercih ettiği dilde çalışır. Her iki dil de aynı Company Brain karşısında birinci sınıftır. Bu, Türkiye öncelikli kurumlarda yaygın olan karma dilli iş güçlerine uygundur.

**S74. AdOS çok birimli yapımızı yansıtabilir mi?**
Evet. AdOS, sıkı kiracı yalıtımıyla çok kiracılıdır; böylece tek bir dağıtımdan ayrılmış verilerle birden fazla iş birimini ve tesisi yansıtabilir. NovaMak demosu bunu göstermek için altı tesis, dört iş birimi ve on altı departmanı modeller. Yapınız ilk kurulum sırasında eşlenir.

**S75. Özelleştirmenin ne kadarı yapılandırma, ne kadarı özel kod?**
Temel uyarlama — Company Brain'i beslemek, Digital Employees'i tanımlamak ve Workflows & Approvals ile izinleri yapılandırmak — özel mühendislik değil, yapılandırmadır. Bu, dağıtımları tekrarlanabilir ve IT/BT ekibinizce desteklenebilir kılar. Daha derin genişletme gerektiğinde, OpenAI uyumlu ve açık motorlu mimari kara kutudan kaçınır.

## Entegrasyonlar

**S76. AdOS mevcut sistemlerimizle entegre olur mu?**
AdOS, açık motorlar ve OpenAI uyumlu bir arayüz üzerine kuruludur ve verileriniz taşınabilir ve dışa aktarılabilirdir; bu da kapalı bir kara kutudan kaçınır. Özel sistemlerinizle entegrasyon kapsamı, değerlendirme ve teklif sırasında tanımlanır. Amaç, kilitlenme oluşturmadan ortamınıza uyum sağlamaktır.

**S77. AdOS hangi çıkarım motorlarıyla çalışır?**
AdOS; Ollama ve vLLM, LM Studio, llama.cpp ve SGLang dahil OpenAI uyumlu herhangi bir yerel sunucuyla çalışır. Bu size motor seçme özgürlüğü verir ve donanımınıza ve operasyonlarınıza uyanı seçmenizi sağlar. Tek bir tescilli motora asla bağlı kalmazsınız.

**S78. Entegrasyonlar internet veya harici API gerektirir mi?**
Hayır. AdOS'un kendisi çalışmak için harici API, API anahtarı veya internet gerektirmez ve hava boşluklu çalışabilir. Her entegrasyon, bu kurum içi, çevrimdışı öncelikli duruşa saygı gösterecek şekilde tasarlanır. Platformla ilgili hiçbir şey çalışmak için üçüncü taraf bir buluta bağlı değildir.

**S79. Verilerimizi AdOS'tan dışa aktarabilir miyiz?**
Evet. Verileriniz — belgeler ve yapılandırma dahil — taşınabilir ve dışa aktarılabilirdir; bu da kilitlenme yok ilkemizin merkezindedir. Asla mahsur kalmazsınız: yığına siz sahip olduğunuz için isterseniz içeriğinizi başka bir yere taşıyabilirsiniz. Bu sizi ticari ve teknik olarak korur.

**S80. Üzerine geliştirebileceğimiz OpenAI uyumlu bir arayüz var mı?**
Evet. AdOS, yerel çıkarım katmanına tanıdık ve iyi belgelenmiş bir standart olan OpenAI uyumlu bir arayüz kullanır. Bu, ekibinizin çalışmasını kolaylaştırır ve modellerin yeniden mimarilemeden değiştirilebilmesinin temel bir nedenidir. Ayrıca mimarinin kara kutu olmasını da engeller.

**S81. AdOS'u entegre etmek tedarikçi kilitlenmesi oluşturur mu?**
Hayır. Tüm tasarım kilitlenmeye karşı direnir: açık motorlar, OpenAI uyumlu bir arayüz ve taşınabilir, dışa aktarılabilir veri. Uygulamaya, veriye ve modele siz sahip olursunuz; böylece kaldıracınızı ve bağımsızlığınızı korursunuz. Bu, ölçümlü bulut yapay zekasına kasıtlı bir karşıtlıktır.

**S82. Digital Employees süreçlerimiz boyunca eylemde bulunabilir mi?**
Evet. Digital Employees iş akışlarını ileri taşır — talepleri yönlendirir, onayları hazırlar ve tanımlı görevleri tamamlar — Workflows & Approvals ve izin modeliniz çerçevesinde. Kopuk bir sohbet botu olarak değil, süreçlerinizin içinde çalışırlar. Yaptıkları her önemli eylem denetlenebilirdir.

**S83. Entegrasyonlar izinlere nasıl uyar?**
İzin farkındalığı AdOS genelinde uygulanır; böylece entegre edilmiş herhangi bir erişim de kullanıcı yetkilerine uyar — yapay zeka bir kullanıcının göremeyeceği şeyi asla ortaya çıkarmaz veya kaynak göstermez. Entegrasyonlar, bu izin modelinin etrafında değil, içinde çalışacak şekilde tasarlanır. Bu, erişim kontrolünü her yerde tutarlı tutar.

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
Görünür girdiler ve varsayımlarla, geri ödeme süresi ve yıllık tasarrufu öne çıkaran, sizin kontrol ettiğiniz bir ROI modeli oluştururuz. Kendi keşif rakamlarınıza — arama süresi, onay gecikmeleri, eğitim maliyeti — dayanır ve verimlilik kazanımlarını gösterir. Varsayımlar paneli görünür kalır; böylece gerekçe dürüst ve yenilemede savunulabilirdir.

**S89. Koltuk başına bir seçenek var mı?**
Fiyatlandırma, kurumunuza uyana göre dağıtım başına veya koltuk bandı başına yapılandırılabilir. Doğru yapı sizinle belirlenir ve Deal Desk onaylar. Yapı ne olursa olsun, jeton başına veya sorgu başına ölçümleme asla yoktur.

**S90. Kullanım büyürse maliyetler fırlar mı?**
Hayır. Jeton başına veya sorgu başına faturalandırma olmadığı için yoğun kullanım kontrolden çıkan bir fatura oluşturmaz; marjinal maliyetiniz elektrik ve donanımdır. Donanımı ölçeklendirdikçe maliyet öngörülebilir ve kontrolünüzde kalır. Bu, ölçümlü bulut yapay zekasına göre temel bir avantajdır.

**S91. İndirimler nasıl yönetilir?**
İndirim ilkelidir ve Deal Desk tarafından yönetilir, odada asla doğaçlama yapılmaz. Teklifteki ticari rakamlar Deal Desk doldurana kadar yer tutucudur ve şablon asla uydurma fiyatlarla gönderilmez. Bu, fiyatlandırmayı anlaşmalar arasında tutarlı ve adil tutar.

## Eğitim

**S92. AdOS son kullanıcılar için öğrenmesi ne kadar zor?**
AdOS, ortamından otomatik algılanan tam bir Türkçe ve İngilizce arayüzle, herkesin kendi dilinde kullanılabilir olacak şekilde tasarlanmıştır. Yanıtlar dayanaklı ve kaynak gösterimli olduğu için kullanıcılar komut hileleri öğrenmek yerine aldıklarına güvenip doğrulayabilir. İlk kurulum sırasındaki etkinleştirme, kullanıcıları hızla üretken kılar.

**S93. Operatörlerimiz için eğitim sağlıyor musunuz?**
Evet. Etkinleştirme, destek ve başarı ilişkisinin bir parçasıdır ve platformu işletmeyi, belgelenmiş kılavuzları kullanmayı ve sistemi yapılandırmayı kapsar. IT/BT ekibiniz yedekleme, geri yükleme, yükseltme ve felaket kurtarma prosedürlerini öğrenir. Özel eğitim kapsamı ekibinizle kararlaştırılır.

**S94. AdOS sürekli eğitim yükümüzü nasıl azaltır?**
Company Brain kurumsal bilgiyi saklar ve soruları kaynak gösterimli yanıtlar; böylece personel sürekli uzmanlara sormak yerine yanıtları kendi kendine bulabilir. Bu, özellikle Perakende gibi yüksek devirli, dağıtık iş güçlerinde değerli olan tekrarlanan eğitimi doğrudan azaltır. Ayrıca bir uzman ayrıldığında bilgiyi korur.

**S95. AdOS uzmanlar ayrıldığında bilgiyi korumaya yardımcı olur mu?**
Evet. Company Brain, kurumun bilgisini izin farkındalıklı, kaynak gösterimli bir biçimde yakalar; böylece uzmanlık, ayrılan bir çalışanla birlikte kapıdan çıkıp gitmez. Yeni personel ilk günden dayanaklı yanıtlar bulabilir. İK ekipleri bunu bilgi saklama ve işe alıştırma için değerli bulur.

**S96. Eğitim Türkçe olarak mevcut mu?**
Evet. AdOS, yerel Türkçe ve İngilizce ile Türkiye önceliklidir; böylece hem ürün hem de etkinleştirme, Türkçe konuşan ekiplere yerel olarak hizmet eder. Türkçe birinci sınıftır, sonradan eklenen bir çeviri değil. Bu, Türkiye öncelikli kurumlara ve karma dilli iş güçlerine uygundur.

**S97. Kullanıcılar ne kadar sürede üretken olur?**
Arayüz iki dilli ve yanıtlar kaynak gösterimli olduğu için kullanıcılar, içerik beslendikten ve izinler eşlendikten sonra genellikle hızla üretken olur. Gerçekçi yol, belgelerinizin ilk kurulumuna ve rollerin yapılandırılmasına bağlıdır ve bunu sizinle planlarız. Etkinleştirme, değere ulaşma süresini kısaltacak şekilde yapılandırılmıştır.

**S98. Digital Employees'i siz mi eğitiyorsunuz yoksa biz mi?**
Digital Employees, ilk kurulum sırasında rollerinize ve izinlerinize göre yapılandırılır ve bunları tanımlamak için ekibinizle çalışırız. Yerel, izin farkındalıklı temelinizde çalıştıkları için kapsamları harici bir hizmetle değil, sizin yapılandırmanızla belirlenir. Her Digital Employee'nin ne yapacağının kontrolünü elinizde tutarsınız.

**S99. Değer elde etmek için hangi ilk kurulum gerekir?**
Değere giden yol; Company Brain'i belgelerinizle beslemek, izinleri eşlemek ve Digital Employees ile Workflows & Approvals'ı yapılandırmaktır. Bunu ilk kurulumun bir parçası olarak destekler ve kapsamı taahhüdünüzde tanımlarız. Bunları doğru yapmak, platformu ölçülebilir sonuçlara dönüştüren şeydir.

## Geçiş

**S100. Mevcut belgelerimizi Company Brain'e taşıyabilir miyiz?**
Evet. İlk kurulum; yanıtların dayanaklı ve doğru kapsanmış olması için Company Brain'i belgelerinizle beslemeyi ve izinleri eşlemeyi içerir. İçeriği yüklemek ve kaynak gösterimli yanıtları doğrulamak için ekibinizle çalışırız. Geçişin kapsamı taahhüdünüzde tanımlanır.

**S101. Geçiş verilerimizi harici bir yere gönderir mi?**
Hayır. Geçiş, AdOS'un kurum içi, çevrimdışı öncelikli ve hava boşluklu çalışabilir olmasıyla tutarlı olarak tamamen kendi altyapınızda gerçekleşir. Belgeleriniz ilk kurulum sırasında binanızdan asla çıkmaz. Döngüde harici bir hizmet yoktur.

**S102. İstersek daha sonra AdOS'tan geçiş yapabilir miyiz?**
Evet. Verileriniz taşınabilir ve dışa aktarılabilirdir ve AdOS açık motorlar ile OpenAI uyumlu bir arayüz kullanır; dolayısıyla tedarikçi kilitlenmesi yoktur. Uygulamaya, veriye ve modele siz sahip olursunuz ve içeriğinizi başka bir yere taşıyabilirsiniz. Bu bağımsızlık, tasarımın kasıtlı bir parçasıdır.

**S103. AdOS'u yeni donanıma nasıl taşırız?**
AdOS standart Docker ve taşınabilir veri kullandığı için yeni donanıma taşımak, belgelenmiş yedekleme ve geri yükleme prosedürlerini izler. Yığına siz sahip olduğunuz için donanım yenilemeleri ve tesis taşımaları kontrolünüzdedir. Gerektiğinde destek ve başarı yardımcı olur.

**S104. Bir bulut yapay zeka aracından AdOS'a geçebilir miyiz?**
Evet ve bu yaygın bir gerekçedir: ekipler verileri kurum içinde tutmak ve jeton başına maliyeti ortadan kaldırmak için ölçümlü bulut yapay zekasından ayrılır. Geçiş; Company Brain'inizi beslemeye ve AdOS'ta rolleri ve iş akışlarını yapılandırmaya odaklanır. Geçişi değerlendirme sırasında sizinle belirleriz.

**S105. Geçiş, diğer sistemlerimizin kesintiye uğramasını gerektirir mi?**
AdOS'a geçiş ortamınıza göre belirlenir ve operasyonel kısıtlarınıza uyacak şekilde planlanır ve AdOS kendi altyapınızda çalıştığı için takvimi siz kontrol edersiniz. Teklif, zaman çizelgesini ve kabul kriterlerini açıkça tanımlar. Kesintiyi en aza indirmek için sırayı planlarız.

**S106. Geçiş sırasında izinleri nasıl koruruz?**
İzinleri eşlemek ilk kurulumun temel bir parçasıdır; böylece ilk günden itibaren kullanıcılar yalnızca yetkili oldukları şeyi görür ve yapay zeka o yetkiler dahilinde kaynak gösterir. Mevcut rollerinizi ve erişim kurallarınızı AdOS'a çevirmek için ekibinizle çalışırız. Doğrulama, kısıtlı içeriğin yetkisiz kullanıcılara doğru şekilde görünmez olduğunu teyit eder.

**S107. Başlamak için ilk adım nedir?**
İlk adım, sorununuzu ölçmek için bir keşif görüşmesidir — arama süresi, onay gecikmeleri, bilgi kaybı ve verilerin binadan çıkamayacağı yerler. Buradan rakamlarınızla bir ROI modeli oluşturur, adını koyduğunuz sorunlara karşı NovaMak üzerinde gösterim yapar ve tanımlı kabul kriterleriyle kendi donanımınızda bir pilot öneririz. Başlamak için AdOS hesap ekibinizle iletişime geçin.
