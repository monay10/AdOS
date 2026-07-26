# AdOS Objection Handling Playbook

**Owner:** Office of the Chief Revenue Officer
**Status:** Official — binding on every objection conversation
**Audience:** Account Executives, Solution Engineers, Partners, Channel
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Governed by:** `SALES_KIT_CONSTITUTION.md` (§9 objection framework) and the Canonical Brief

---

## How to use this playbook

Every objection is answered in the five mandatory beats from Constitution §9:

1. **Acknowledge** the concern as legitimate.
2. **Reframe** to the underlying interest.
3. **Answer** with a canonical fact.
4. **Prove** with evidence or a demo moment.
5. **Advance** with a concrete next action.

**Rules:** Never argue. Never disparage a competitor by name. Convert every
objection into a demonstration. Concede honest trade-offs to keep trust — honesty
is our competitive weapon.

The NovaMak Endüstri A.Ş. demo world (a client workspace with 4 brands, 12
products, 25 campaign missions, and human-approval gates across 6 markets) is the
proving ground. Every "Demo recommendation" below maps to a specific, repeatable
NovaMak moment.

**Bilingual note:** Every key answer is available in Turkish and English; both
languages carry the same claims and numbers. The three highest-leverage answers —
**Security**, **Cloud vs Local**, and **Price** — are provided in full in BOTH
languages at the end of this playbook (see *Bilingual key answers / İki dilli
temel yanıtlar*). Product terms (AdOS, Company Brain) stay in English in both
languages.

---

## Price

- **Customer concern:** "This looks expensive. Cloud AI tools charge me a few
  cents per query — why would I pay for a whole platform and the hardware to run
  it?"

- **Recommended answer:**
  - *Acknowledge:* "Budget discipline is exactly right — you should not spend a
    lira before the value is quantified."
  - *Reframe:* "The real question isn't sticker price, it's total cost of
    ownership and what the spend returns. A per-query meter feels cheap until you
    multiply it by every employee, every day, forever — and it never stops
    growing."
  - *Answer (canonical fact):* "AdOS has **no per-token and no per-query
    billing**. Inference cost is your own electricity and hardware, not a metered
    API bill. Pricing is value-based: a platform license plus support/success, per
    deployment or per-seat band — a predictable number you own."
  - *Prove:* "We build the ROI model with you, using your discovery numbers —
    search time, stalled approvals, training load — and lead with payback period
    and annual savings, with the assumptions panel visible so you can challenge
    every input."
  - *Advance:* "Let's spend 30 minutes filling in the ROI calculator with your
    real numbers and see the payback period together."

- **Evidence:** CANON — "No per-token billing: inference cost is the customer's
  electricity/hardware." Pricing principle: value-based; platform license +
  support/success; per deployment or per-seat band; NO per-token/per-query
  metering. Constitution §10 (ROI: payback + annual savings, visible assumptions)
  and §17 (value-based, one number at a time).

- **Demo recommendation:** Open the offline ROI calculator
  (`sales/roi-calculator/`) and enter the buyer's discovered numbers live. Show
  the four output headlines — Annual Savings, ROI %, Payback Period, Efficiency
  Gain — with the assumptions panel open. Contrast the flat, owned cost against
  an ever-growing per-query meter (as a model, never naming a competitor).

- **Follow-up action:** Schedule the joint ROI working session; send the recap
  within 24 hours with the payback figure and the agreed next date.

---

## Security

- **Customer concern:** "If we put our documents into an AI, how do we know they
  won't leak? One breach of our IP or our customer data and we're finished."

- **Recommended answer:**
  - *Acknowledge:* "A data leak is an existential risk — treating it that
    seriously is correct."
  - *Reframe:* "So the question behind the question is: where does my data
    physically go, and who can touch it? With most AI, the honest answer is 'it
    leaves the building.' That's the risk we designed out."
  - *Answer (canonical fact):* "With AdOS your data **never leaves your
    premises**. All inference runs on your own hardware — **no external API, no API
    keys, no internet required**. There is no third-party data path to breach.
    Client workspaces are kept apart by **application-level multi-tenant
    isolation**, and access is protected by **real authentication** — Argon2id
    password hashing, HMAC HttpOnly sessions, per-session CSRF, brute-force
    lockout, and CSP/HSTS security headers. Every approval and consequential
    action is recorded in the **activity log and per-approval timeline**."
  - *Prove:* "In the demo I'll pull the network cable and it keeps working —
    because there's nowhere for your data to go. Then I'll show two separate client
    workspaces and prove one tenant's campaign data is simply invisible to the
    other."
  - *Advance:* "Let's bring your CISO to a technical security review and, when
    you're ready, run a pilot air-gapped on your own hardware."

- **Evidence:** CANON — data sovereignty (data never leaves premises, no
  telemetry of business content); Local AI (no cloud, no API keys, no internet);
  application-level multi-tenant isolation; real auth (Argon2id, HMAC sessions,
  CSRF, brute-force lockout, CSP/HSTS); offline-first / air-gap capable.
  Constitution §11 (security messaging) — attack surface, access control,
  auditability. Discipline: describe architecture and controls; claim no
  certifications AdOS has not earned. **Roadmap:** enforced RBAC / permission-aware
  AI and an immutable audit trail are planned, not shipped today — do not present
  them as current controls.

- **Demo recommendation:** The air-gap moment — pull the network cable (or show
  the air-gapped environment) and run a Company Brain query on campaign
  performance; it still answers. Then the isolation moment — a user in one NovaMak
  client workspace cannot see another tenant's data. Finish on the activity-log
  and per-approval-timeline entry for the action.

- **Follow-up action:** Book the CISO/Security technical deep-dive; propose an
  air-gapped pilot on customer hardware with defined acceptance criteria.

---

## Cloud vs Local

- **Customer concern:** "Everyone's moving to the cloud. Isn't running AI
  on-premise a step backwards — more hardware for us to babysit?"

- **Recommended answer:**
  - *Acknowledge:* "The cloud won a lot of arguments for good reasons —
    convenience is real."
  - *Reframe:* "But convenience and control are different questions. For the data
    that defines your business, the question is who holds it and who meters your
    access to it. 'On your infrastructure' is not backwards — it's sovereignty."
  - *Answer (canonical fact):* "AdOS runs **100% on your own infrastructure** —
    on-premise or in your private cloud/VPC. You own the entire stack: application,
    data, and model. It's **offline-first and air-gap capable**, with **no
    external API and no internet dependency**. Your data never leaves the building
    and you're never metered for using your own AI."
  - *Prove:* "Deployment is standard Docker with a one-command bring-up, and day-2
    is covered — documented backup, restore, upgrade, and disaster-recovery
    runbooks ship with the platform. In the demo, it runs with the network
    unplugged."
  - *Advance:* "Let's have your IT/BT team join a deployment walkthrough so they
    can see the day-2 runbooks and the one-command bring-up firsthand."

- **Evidence:** CANON — On-Prem (deploys on-premise or private cloud/VPC; customer
  owns the entire stack); offline-first / air-gap capable; no cloud / no internet.
  Deployment: standard Docker, one-command bring-up; documented
  backup/restore/upgrade/disaster-recovery runbooks. Constitution §13 (On-Prem
  messaging).

- **Demo recommendation:** Show the one-command Docker bring-up (or a
  pre-provisioned NovaMak stack), then run the air-gap moment — unplug the network
  and keep working. Point to the documented runbooks for backup/restore/upgrade/DR.

- **Follow-up action:** Schedule the IT/BT deployment walkthrough; share the
  runbook index and infrastructure sizing guidance.

---

## AI hallucination

- **Customer concern:** "AI makes things up. If it confidently gives my people a
  wrong answer about a procedure or a contract, that's dangerous. How can I trust
  it?"

- **Recommended answer:**
  - *Acknowledge:* "You're right to distrust a confident guess — in your business,
    a made-up answer is worse than no answer."
  - *Reframe:* "The problem with generic AI is that it answers from a vast,
    anonymous internet with no receipts. The fix isn't a smarter guess — it's
    making the system deterministic, grounding it in *your* marketing performance,
    and putting a human sign-off on every output."
  - *Answer (canonical fact):* "AdOS is built to be **deterministic, not a guessing
    machine**. The default offline engine produces **deterministic, templated
    output** — the same inputs give the same result — and all ad-KPI math (CTR,
    CPC, CPA, CPL, ROAS, ROI) is **pure deterministic calculation**, not a model's
    opinion. Generation is constrained by each **Brand's voice, rules, and
    banned-word list**, and the **Company Brain** grounds recommendations in **your
    own campaign-performance history** — what actually worked across past
    campaigns. And **every stage is human-approved**: a person signs off on the
    brief, the creative, and the campaign draft before anything moves."
  - *Prove:* "In the demo I'll run the same brief twice and show identical
    deterministic output, then show the KPI report math you can recompute by hand,
    and the human approval gate that sits on every stage."
  - *Advance:* "Let's pick three real campaign briefs your team is working on and
    run them through the pipeline in a pilot, so you can judge the drafts and the
    KPIs yourself."

- **Evidence:** CANON — deterministic offline generation + deterministic ad-KPI
  math; generation constrained by Brand voice/rules/banned words; Company Brain =
  a marketing-performance memory grounded in your own campaign history; every
  pipeline stage requires an explicit human approval click. Constitution §1.1, §8,
  §15. **Roadmap:** free-text document Q&A and cited answers over your documents
  are planned, not shipped today — do not promise a citation the product cannot
  produce.

- **Demo recommendation:** Run the same brief through the pipeline twice and show
  the deterministic output is identical, then open a CampaignReport and recompute a
  KPI by hand to prove the math. Follow with the human approval gate — no brief,
  creative, or campaign draft advances without a sign-off.

- **Follow-up action:** Agree on three real campaign briefs for a pilot; define
  what a "trustworthy draft" looks like as acceptance criteria.

---

## Integration

- **Customer concern:** "We have existing systems — ERP, file shares, HR tools.
  Will this actually connect to what we already run, or is it another island?"

- **Recommended answer:**
  - *Acknowledge:* "Fair concern — a tool that can't reach your existing systems
    just adds work."
  - *Reframe:* "The goal isn't another app to log into; it's an operating layer
    over the advertising work — briefs, creative, campaigns, and approvals — you
    already run."
  - *Answer (canonical fact):* "AdOS is an **Enterprise AI Operating System for
    Advertising**, not a chatbot bolted on. Its AI layer runs on an
    **OpenAI-compatible interface** to local engines, and it deploys with standard,
    documented Docker tooling, so it fits alongside your stack. Today it runs a
    self-contained agency pipeline: analytics metrics are **entered through its
    forms** and a finished campaign draft is **exported** for you to run in your own
    ad platform."
  - *Prove:* "In NovaMak you'll see the full pipeline across 4 client brands and 25
    campaign missions — brief → creative → campaign draft → report → executive
    dashboard — with a human approval gate at every stage, a full advertising shape,
    not a toy."
  - *Advance:* "Let's map your top two integration points with your CTO in a
    technical deep-dive and scope what the export path covers today."

- **Evidence:** CANON — Enterprise AI Operating System for Advertising;
  OpenAI-compatible interface to local engines; human-approved pipeline; standard
  Docker tooling; analytics metrics entered by form; campaign drafts exportable.
  Constitution §14 (a search box isn't an operating system; AdOS unifies the
  pipeline, Company Brain, and approvals). **Roadmap:** real connectors/syncs to
  external systems (ERP, ad platforms, CRMs, data warehouses) are planned, not
  shipped — today integration is via export and manual metric entry.

- **Demo recommendation:** Walk the NovaMak pipeline — show an AI-assisted stage
  producing a draft (brief or creative), a human approval moving it forward, and
  the campaign draft being exported, demonstrating the platform operating over the
  advertising process end to end.

- **Follow-up action:** Book the CTO technical deep-dive; document the buyer's
  top integration points and set honest expectations on export vs. roadmap
  connectors.

---

## Migration

- **Customer concern:** "Getting all our knowledge into a new system sounds like a
  massive, risky project. We don't have a year to spend migrating."

- **Recommended answer:**
  - *Acknowledge:* "Big-bang migrations do fail — the caution is earned."
  - *Reframe:* "So let's not do a big bang. The right question is: what's the
    smallest seed that proves value, and how do we grow from there safely?"
  - *Answer (canonical fact):* "AdOS deploys with **standard Docker and a
    one-command bring-up**, and onboarding is a guided path: deploy, create the
    client workspace, add brands and products, then run your first campaign
    missions and expand to more brands and markets. The Company Brain builds up a
    **marketing-performance memory** as your campaigns run. You own an
    **exportable/portable** system throughout — nothing is trapped."
  - *Prove:* "Documented backup, restore, upgrade, and disaster-recovery runbooks
    ship with the platform, so every step of the rollout is reversible and
    supported. The NovaMak world is exactly this shape, fully set up."
  - *Advance:* "Let's scope a pilot around one client brand's campaigns, prove it,
    then plan the phased expansion."

- **Evidence:** CANON — standard Docker, one-command bring-up; documented
  backup/restore/upgrade/DR runbooks; portable/exportable data; onboarding wizard
  (workspace → client → brand → product → mission); Company Brain =
  marketing-performance memory. Constitution §5 (buyer journey: Onboarding &
  Expansion — deploy, set up, run missions, expand) and §13 (day-2 covered).

- **Demo recommendation:** Show the set-up NovaMak workspace and its accumulating
  marketing-performance Company Brain as the after-state, then frame the phased
  path — one brand first. Point to the backup/restore/DR runbooks to prove
  reversibility.

- **Follow-up action:** Define a single-brand pilot scope with a starting brand/
  product setup and a phased expansion outline.

---

## Training

- **Customer concern:** "My people are busy and not all technical. If this needs
  weeks of training, adoption will die on day one."

- **Recommended answer:**
  - *Acknowledge:* "Adoption is where most software quietly fails — you're right
    to lead with it."
  - *Reframe:* "The best training is not needing much. If people can state a
    campaign objective in their own language and the pipeline drafts the work, the
    learning curve is a conversation."
  - *Answer (canonical fact):* "AdOS ships a **full Turkish and English UI,
    auto-detected** from the user's environment, and AI output follows the same
    language, so your people work in their own language from minute one. The
    pipeline guides each step — brief, creative, campaign draft, report — in plain
    language, and the Company Brain **retains marketing-performance knowledge**, so
    the system carries what worked rather than demanding expertise."
  - *Prove:* "In NovaMak, a user states a campaign objective in natural language and
    the pipeline produces a draft brief and creative for approval — no query syntax,
    no manual. That's the whole interaction."
  - *Advance:* "Let's run a small group of your actual end users through a hands-on
    session in the pilot and measure time-to-first-useful-draft."

- **Evidence:** CANON — Bilingual: full Turkish + English UI, auto-detected, plus
  AI output-language injection; Company Brain = marketing-performance memory;
  natural-language mission → pipeline drafts. Constitution §4 (HR: Company Brain
  retains marketing-performance knowledge; bilingual UX) and §8 (Outcome: lower
  training cost).

- **Demo recommendation:** Show the bilingual UI auto-detecting language, then a
  non-technical NovaMak user stating a campaign objective in plain language and
  receiving a draft brief and creative to approve, with no special training.

- **Follow-up action:** Arrange a hands-on end-user session in the pilot; capture
  adoption and training-time metrics for the ROI model.

---

## Support

- **Customer concern:** "If it's running on our hardware and something breaks at 2
  a.m., are we on our own? Who do we call?"

- **Recommended answer:**
  - *Acknowledge:* "Owning the stack should never mean being abandoned on day two
    — that's a real fear."
  - *Reframe:* "Ownership and support aren't a trade-off. You get control *and* a
    supported operating model, with the runbooks to handle the routine yourself and
    a partner for the rest."
  - *Answer (canonical fact):* "AdOS ships with **documented backup, restore,
    upgrade, and disaster-recovery runbooks**, and pricing includes a
    **support/success** component — support is part of the model, not an
    afterthought. Deployment is standard Docker, so your IT/BT team operates on
    familiar ground."
  - *Prove:* "Your IT/BT team can walk the runbooks with us in a deployment
    session and see exactly what day-2 looks like before you commit."
  - *Advance:* "Let's schedule that day-2 operations walkthrough with your
    operators and review the support terms together."

- **Evidence:** CANON — documented backup/restore/upgrade/disaster-recovery
  runbooks; pricing = platform license + support/success. Constitution §4 (IT/BT:
  one-command deploy, standard Docker, documented runbooks), §13 (day-2 covered),
  §17 (support/success in the pricing structure).

- **Demo recommendation:** Walk the day-2 runbook set (backup/restore/upgrade/DR)
  against the NovaMak deployment; show a restore or upgrade step so operators see
  the real mechanics.

- **Follow-up action:** Book the IT/BT day-2 operations walkthrough; share the
  runbook index and the support/success terms for review.

---

## Competition

- **Customer concern:** "We're already looking at other AI solutions. What makes
  you different — aren't you all doing the same thing?"

- **Recommended answer:**
  - *Acknowledge:* "You should compare — a serious decision deserves options."
  - *Reframe:* "The useful comparison isn't feature-by-feature, it's by category.
    Ask each option one question: *does my data leave the building, and am I
    metered to use it?* That single question sorts the field."
  - *Answer (canonical fact):* "AdOS is a **sovereign, capable, accountable**
    Enterprise AI Operating System for Advertising: **100% on your
    infrastructure**, data never leaves; a real operating system unifying the
    **human-approved campaign pipeline, the marketing-performance Company Brain, and
    deterministic ad-KPIs** — not a search box or a chatbot; and **every stage
    human-approved**, with an activity log and per-approval timeline. And **no
    vendor lock-in** — open engines, OpenAI-compatible, portable data."
  - *Prove:* "I'll demonstrate all three pillars live in NovaMak — the deterministic
    KPI report you can recompute, an AI-assisted stage drafting creative, the human
    approval gate — and the air-gap moment no hosted service can show you."
  - *Advance:* "Put us in a pilot on your own hardware against your real criteria
    — the honest way to compare is on your terms."

- **Evidence:** CANON — three headline pillars (Sovereign · Capable · Accountable):
  100% local/offline AI; human-approved advertising pipeline + marketing Company
  Brain + deterministic KPIs; human approval gate at every stage plus activity log;
  no vendor lock-in. Constitution §14 (competitive positioning by category; rules
  of engagement — never name-and-shame; compete on sovereignty, the pipeline, and
  accountability; concede honest trade-offs).

- **Demo recommendation:** Run the differentiator montage — deterministic KPI
  recompute, application-level tenant isolation, human approval gate, an AI-assisted
  pipeline stage drafting creative, and the air-gap moment. The air-gap moment is
  the one no hosted competitor can reproduce.

- **Follow-up action:** Propose a side-by-side pilot on customer hardware with the
  buyer's own evaluation criteria and acceptance thresholds. Never disparage a
  named competitor in the recap.

---

## Data privacy

- **Customer concern:** "How do I know you're not collecting our data, training on
  it, or sending telemetry home? Regulators and our legal team will ask."

- **Recommended answer:**
  - *Acknowledge:* "Given data-residency law and your legal team's exposure, that
    scrutiny is exactly right."
  - *Reframe:* "This isn't a policy promise to trust — it's an architecture to
    verify. The safest data path is the one that doesn't exist."
  - *Answer (canonical fact):* "AdOS is **not a data collector**. Customer data —
    briefs, creative, campaigns, reports — **never leaves your premises**, and
    there is **no telemetry of business content**. We do not monetize, transmit, or
    train on your data. Because there's **no external API and no internet
    requirement**, there is no channel for data to leave. **Application-level
    multi-tenant isolation** keeps client workspaces segregated, and every approval
    is recorded in the activity log and per-approval timeline."
  - *Prove:* "Air-gap the demo and it still works — proof there's no home for data
    to phone. Your team can inspect the deployment and confirm there's no outbound
    business-content path."
  - *Advance:* "Let's give your legal/compliance and CISO teams a technical review
    of the data-flow architecture and the activity log."

- **Evidence:** CANON — data sovereignty (never leaves premises; no telemetry of
  business content); "Not a data collector"; application-level multi-tenant
  isolation; offline / air-gap; activity log + per-approval timeline. Constitution
  §1.3, §11 (compliance posture: on-prem/air-gap satisfies data-residency
  mandates). **Roadmap:** enforced RBAC / permission-aware AI and an immutable
  audit trail are planned, not shipped — do not present them as current controls.

- **Demo recommendation:** Air-gap moment to prove no outbound path, plus the
  tenant-isolation view showing NovaMak's separate client workspaces with
  segregated data, closing on an activity-log entry.

- **Follow-up action:** Schedule the legal/compliance + CISO data-flow architecture
  review; provide the audit-trail and tenant-isolation documentation.

---

## Performance

- **Customer concern:** "Won't a model running on our own hardware be slow? Cloud
  AI answers instantly — I don't want my people waiting."

- **Recommended answer:**
  - *Acknowledge:* "That's a fair and honest concern, and I'll give you an honest
    answer."
  - *Reframe:* "The real question is whether the response time is worth the
    control — and whether 'instant' is worth your data leaving the building and a
    meter running forever."
  - *Answer (canonical fact):* "Here's the honest trade-off: local CPU inference is
    **seconds, not milliseconds** — slower than a hosted frontier API. We state
    that plainly. **Better hardware closes the gap** — the model runs as fast as
    the machine you give it, and you choose and own that model. In return you get
    **sovereignty, no per-token cost, and full control** — and for grounded work
    over your own campaign data, seconds is the right unit."
  - *Prove:* "In the demo you'll see real response times on representative
    hardware — not a hidden benchmark. And you'll see there's no meter counting
    while you think."
  - *Advance:* "Let's size hardware to your latency target and prove it on your own
    machines in the pilot."

- **Evidence:** CANON — Honest trade-off: local CPU inference is slower (seconds,
  not milliseconds); better hardware closes the gap; state plainly. No per-token
  billing. Customer chooses and owns the model. Constitution §12 (Local AI
  messaging — concede the trade-off, show sovereignty/cost/control outweigh it).

- **Demo recommendation:** Show a live Company Brain query on representative
  hardware with the real response time visible — no cutaway, no hidden benchmark.
  Note the swappable model and that better hardware speeds it up, with zero
  metering throughout.

- **Follow-up action:** Run a hardware-sizing exercise against the buyer's latency
  target; validate on customer hardware in the pilot with agreed performance
  acceptance criteria.

---

## Vendor lock-in

- **Customer concern:** "If we build our operations around AdOS, aren't we just
  trading one dependency for another? What happens if we want out, or you raise
  prices?"

- **Recommended answer:**
  - *Acknowledge:* "Independence is the whole point of going on-premise — being
    locked into your 'freedom' vendor would be a contradiction."
  - *Reframe:* "So the test is: can you leave with your data and keep running?
    Lock-in is about exits, not intentions."
  - *Answer (canonical fact):* "AdOS is built for **no vendor lock-in**. It runs
    **open engines** through an **OpenAI-compatible interface** — Ollama, vLLM, LM
    Studio, llama.cpp, SGLang — so you **choose and own the model** and can swap it
    without re-architecting. Your data is **portable and exportable** — everything
    comes out. You own the entire stack: application, data, and model."
  - *Prove:* "Because the interface is OpenAI-compatible and the engines are open,
    nothing about your deployment is a black box. In the demo we can point to the
    model being swapped and the data being exported."
  - *Advance:* "Let's have your CTO review the open-engine architecture and the
    export path in a technical deep-dive."

- **Evidence:** CANON — No vendor lock-in: open engines, OpenAI-compatible
  interface, portable/exportable data. Local AI engine options (Ollama, vLLM, LM
  Studio, llama.cpp, SGLang). Customer owns the entire stack. Constitution §13
  (no lock-in; exportable everything) and §14 (no black box).

- **Demo recommendation:** Show the OpenAI-compatible configuration and a model
  swap (or the ability to point at a different local engine), then demonstrate a
  data export — proving the exit is real, not theoretical.

- **Follow-up action:** Book the CTO architecture review covering engine
  portability and the full data-export path; provide the export documentation.

---

## Bilingual key answers / İki dilli temel yanıtlar

The three highest-leverage objection answers are provided below in full in English
and Turkish. Both versions carry the same claims and numbers. Product terms
(AdOS, Company Brain) remain in English.

### Security / Güvenlik

**EN —** "A data leak is an existential risk, so treating it that seriously is
right. The real question is: where does your data physically go, and who can touch
it? With AdOS, your data never leaves your premises. All inference runs on your own
hardware — no external API, no API keys, no internet required — so there is no
third-party data path to breach. Client workspaces are kept apart by
application-level multi-tenant isolation, and access is protected by real
authentication — Argon2id password hashing, HMAC HttpOnly sessions, per-session
CSRF, and brute-force lockout. Every approval and consequential action is recorded
in the activity log and per-approval timeline. In the demo, we pull the network
cable and it keeps working, because there is nowhere for your data to go. The next
step is a technical security review with your CISO and an air-gapped pilot on your
own hardware."

**TR —** "Bir veri sızıntısı varoluşsal bir risktir; bu konuyu bu kadar ciddiye
almanız yerinde. Asıl soru şudur: verileriniz fiziksel olarak nereye gidiyor ve
ona kim dokunabiliyor? AdOS ile verileriniz kurumunuzun dışına asla çıkmaz. Tüm
çıkarım kendi donanımınızda çalışır — harici API yok, API anahtarı yok, internet
gerekmez — dolayısıyla ihlal edilebilecek üçüncü taraf bir veri yolu yoktur.
Müşteri çalışma alanları, uygulama düzeyinde çok kiracılı yalıtımla (application-
level multi-tenant isolation) birbirinden ayrılır ve erişim gerçek kimlik
doğrulamayla korunur — Argon2id parola özetleme, HMAC imzalı HttpOnly oturumlar,
oturum başına CSRF ve kaba kuvvet kilidi (brute-force lockout). Her onay ve sonuç
doğuran işlem, etkinlik günlüğüne ve onay bazlı zaman çizelgesine kaydedilir.
Demoda ağ kablosunu çekeriz ve sistem çalışmaya devam eder; çünkü verilerinizin
gidebileceği bir yer yoktur. Sonraki adım, CISO'nuzla teknik bir güvenlik
incelemesi ve kendi donanımınızda hava boşluklu (air-gapped) bir pilot
çalışmadır."

### Cloud vs Local / Bulut mu, Yerel mi

**EN —** "The cloud won a lot of arguments on convenience, and that's real. But
convenience and control are different questions. For the data that defines your
business, what matters is who holds it and who meters your access to it. AdOS runs
100% on your own infrastructure — on-premise or in your private cloud/VPC — and you
own the entire stack: application, data, and model. It is offline-first and
air-gap capable, with no external API and no internet dependency, so your data
never leaves the building and you are never metered for using your own AI.
Deployment is standard Docker with a one-command bring-up, and documented backup,
restore, upgrade, and disaster-recovery runbooks ship with the platform. Running AI
on your infrastructure isn't backwards — it's sovereignty. Let's have your IT/BT
team join a deployment walkthrough."

**TR —** "Bulut, kolaylık konusunda pek çok tartışmayı kazandı; bu gerçek. Ama
kolaylık ile kontrol farklı sorulardır. İşinizi tanımlayan veriler söz konusu
olduğunda önemli olan, onu kimin tuttuğu ve erişiminizi kimin ölçüp
ücretlendirdiğidir. AdOS %100 kendi altyapınızda çalışır — yerinde (on-premise) ya
da kendi özel bulutunuzda/VPC'nizde — ve tüm yığının sahibi sizsiniz: uygulama,
veri ve model. Çevrimdışı öncelikli (offline-first) ve hava boşluğuna (air-gap)
uygundur; harici API ve internet bağımlılığı yoktur; böylece verileriniz binanızdan
asla çıkmaz ve kendi AI'nızı kullandığınız için asla ücret sayacına takılmazsınız.
Kurulum standart Docker ile tek komutla yapılır; yedekleme, geri yükleme, yükseltme
ve felaket kurtarma (disaster-recovery) için belgelenmiş çalışma kılavuzları
platformla birlikte gelir. AI'yı kendi altyapınızda çalıştırmak geriye bir adım
değil, egemenliktir (sovereignty). BT ekibinizi bir kurulum turuna davet edelim."

### Price / Fiyat

**EN —** "Budget discipline is exactly right — you shouldn't spend a lira before
the value is quantified. But the real question isn't sticker price; it's total cost
of ownership and what the spend returns. A per-query meter feels cheap until you
multiply it by every employee, every day, forever. AdOS has no per-token and no
per-query billing — inference cost is your own electricity and hardware, not a
metered API bill. Pricing is value-based: a platform license plus support/success,
per deployment or per-seat band — a predictable number you own. We build the ROI
model with you using your own numbers, and lead with payback period and annual
savings, with every assumption visible. Let's spend 30 minutes on the ROI
calculator with your real figures."

**TR —** "Bütçe disiplini tam olarak doğru — değer ölçülmeden bir lira bile
harcamamalısınız. Ama asıl soru etiket fiyatı değil; toplam sahip olma maliyeti ve
harcamanın ne getirdiğidir. Sorgu başına bir sayaç, onu her çalışanla, her gün,
sonsuza dek çarpana kadar ucuz görünür. AdOS'ta token başına ve sorgu başına
faturalandırma yoktur — çıkarım maliyeti, ölçülen bir API faturası değil, kendi
elektriğiniz ve donanımınızdır. Fiyatlandırma değer temellidir: platform lisansı
artı destek/başarı (support/success), dağıtım başına veya koltuk başına bant —
sahibi olduğunuz, öngörülebilir bir rakam. ROI modelini sizin kendi
rakamlarınızla birlikte kurarız; geri ödeme süresi (payback) ve yıllık tasarrufla
başlarız ve her varsayım görünür olur. Kendi gerçek rakamlarınızla ROI hesaplayıcı
üzerinde 30 dakika geçirelim."

---

*This playbook governs objection handling for AdOS. It conforms to
`SALES_KIT_CONSTITUTION.md` and the Canonical Brief, and references — but never
modifies — the AdOS application, its packages, or its tests.*
