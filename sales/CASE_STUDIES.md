# AdOS — Vertical Case Studies (Illustrative)

**Owner:** Office of the Chief Revenue Officer · **Audience:** Buyer / Buying committee
**Version:** 1.0.0 · Aligned to AdOS v1.0.0 and the Sales Kit Constitution (§20.4, Claim discipline)

---

> ## ⚠️ ILLUSTRATIVE / FICTIONAL — READ FIRST
>
> **EN — All companies, people, names, roles, quotes, and figures in this document are ILLUSTRATIVE COMPOSITES.** They are invented to show *how AdOS applies* in each vertical. They are **not** real customers, not real deployments, and not real customer records. No quote was said by a real person. All financials are illustrative model assumptions, not audited results or guarantees. AdOS claims no certifications, awards, or named customers here.
>
> **TR — Bu belgedeki tüm şirketler, kişiler, isimler, roller, alıntılar ve rakamlar TEMSİLİ (KURGUSAL) BİLEŞİK örneklerdir.** AdOS'un her sektörde *nasıl uygulandığını* göstermek için üretilmiştir. Gerçek müşteri, gerçek kurulum veya gerçek müşteri kaydı **değildir**. Hiçbir alıntı gerçek bir kişiye ait değildir. Tüm finansal veriler temsili model varsayımlarıdır; denetlenmiş sonuç veya garanti değildir. AdOS burada hiçbir sertifika, ödül veya gerçek müşteri adı iddia etmez.

---

## Shared ROI model / Ortak ROI modeli (illustrative — temsili)

Every case below shows AdOS — the **Enterprise AI Operating System for Advertising** — used the same way: it **drafts** a human-approved advertising campaign (objective → marketing brief → creative copy → campaign draft → performance report → executive dashboard) on 100% local AI, and remembers what worked in a marketing-performance **Company Brain**. Every case uses the same transparent, buyer-controllable ROI model (per Constitution §10). Figures are illustrative defaults, not quotes. Product terms stay in English in both languages.

Aşağıdaki her vaka AdOS'u — **Reklam için Kurumsal Yapay Zekâ İşletim Sistemi'ni** — aynı şekilde gösterir: %100 yerel yapay zekâ üzerinde insan onaylı bir reklam kampanyasını (hedef → pazarlama özeti → yaratıcı metin → kampanya taslağı → performans raporu → yönetici panosu) **taslaklar** ve neyin işe yaradığını bir pazarlama-performansı **Company Brain**'inde hatırlar. Her vaka aynı şeffaf, alıcının kontrol edebileceği ROI modelini kullanır (Anayasa §10). Rakamlar temsili varsayılanlardır, teklif değildir.

- **Currency / Para birimi:** ₺ (illustrative loaded marketing/creative-team cost assumption / temsili yüklü pazarlama/yaratıcı-ekip maliyet varsayımı).
- **Payback (months) / Geri ödeme (ay)** = Year-1 investment ÷ (Annual savings ÷ 12).
- **First-year ROI % / İlk yıl ROI %** = (Annual savings − Year-1 investment) ÷ Year-1 investment × 100.
- **Efficiency gain / Verimlilik kazancı** = reduction in campaign production time and approval-cycle time / kampanya üretim süresi ve onay-döngüsü süresindeki azalma.
- All investment figures are **placeholders** (platform license + support + local hardware). Real numbers come from Deal Desk (Constitution §16–17).

Every claim traces to the Canonical Brief: **Local AI** (on the customer's own hardware, no cloud, no API keys, no internet, no per-token billing), **data sovereignty** (data never leaves the premises), **on-premise / air-gap capable**, a **human-approved campaign pipeline** (marketing brief → creative copy → campaign draft → report → executive dashboard, with an explicit human approval at every stage), and a **marketing-performance Company Brain** that learns which campaigns and ads worked. AdOS **drafts** campaigns for human approval; it does not launch live ads — a person exports the approved plan to their own ad platform.

---
---

# 1. Manufacturing — NovaMak Endüstri A.Ş.

## English

**Customer profile.** NovaMak Endüstri A.Ş. is an illustrative discrete manufacturer: ~1,400 employees across 6 production sites and 4 business units in Turkey. A lean central marketing team supports distributor lead-generation and product-launch campaigns for all four units. Owns its own server room; strict rule that product data, pricing, and commercial strategy must not leave the premises.

**Problem.** Producing distributor and product-launch campaigns was slow and agency-dependent. Each business unit briefed outside agencies separately, so brand voice drifted and launches waited weeks for creative. Cloud AI copy tools were off the table — product specs, pricing, and go-to-market plans could not leave the building.

**Implementation.** AdOS deployed on-premise into NovaMak's existing server room via standard Docker, one-command bring-up. Local AI ran through a local inference engine (Ollama) on NovaMak's own GPU server — no external API, no internet dependency. The Company Brain was seeded with each unit's brand voice, product catalog and pricing, and the results of past campaigns; application-level tenant isolation kept each business unit's workspace separate.

**AI usage.**
- **Company Brain** — a marketing-performance memory that learns which campaign angles and ad sets drove distributor leads (campaign→ad→lead→ROI), and surfaces winning patterns for the next brief. Brand voice and banned words are applied from each unit's BrandProfile.
- **AI-assisted pipeline** — from a stated objective, AdOS drafts a marketing brief, then ad copy (headlines, CTAs, social posts, landing copy), then a campaign draft (channels, ad sets, budget split) for each product launch — every stage presented for human approval.
- **Human approval gates** — each stage (strategy_and_budget, creative_assets, campaign_launch) requires an explicit approval click; an activity log and per-approval timeline record every decision. The marketing team exports the approved draft to launch in its own ad platform.

**Business results.**
- Campaign production time cut ~65% (days, not a weeks-long agency cycle).
- Campaign approval cycle reduced from ~5 days to ~1.5 days.
- Consistent brand voice across all 4 business units; less agency dependence.
- Zero product/pricing data left the premises — verifiable, air-gap capable.

**ROI (illustrative).**
- Annual savings: **₺8,400,000** — in-house campaign production vs agency ₺4,800,000 · faster approval & fewer rework cycles ₺2,400,000 · reduced creative onboarding/ramp ₺1,200,000.
- Year-1 investment (placeholder): **₺2,800,000**.
- **Payback: 4.0 months** · **First-year ROI: 200%** · **Efficiency gain: ~65% faster campaign production.**

**Lessons learned.** Seed the Company Brain with brand voice and past-campaign results first — draft quality and on-brand consistency depend on it. Sovereignty was the unlock: the deal only became possible because pricing and product strategy never leave the building.

**Quote.** *"I stopped worrying about our product data leaving the building — the AI drafts our campaigns on our own server, and my team approves every step before anything goes to our ad platform."* — **illustrative persona:** Marketing Director, NovaMak Endüstri A.Ş. (fictional)

## Türkçe

**Müşteri profili.** NovaMak Endüstri A.Ş., temsili bir seri üretim imalatçısıdır: Türkiye'de 6 üretim tesisi ve 4 iş biriminde ~1.400 çalışan. Yalın bir merkezi pazarlama ekibi, dört birimin tamamı için bayi müşteri-adayı ve ürün-lansmanı kampanyalarını yürütür. Kendi sunucu odasına sahip; ürün verisi, fiyatlandırma ve ticari stratejinin tesisten çıkmaması katı bir kural.

**Problem.** Bayi ve ürün-lansmanı kampanyalarını üretmek yavaş ve ajansa bağımlıydı. Her iş birimi dış ajanslara ayrı ayrı brief veriyordu; böylece marka sesi kayıyor ve lansmanlar yaratıcı için haftalarca bekliyordu. Bulut AI metin araçları mümkün değildi — ürün özellikleri, fiyatlandırma ve pazara-çıkış planları binadan çıkamazdı.

**Uygulama.** AdOS, NovaMak'ın mevcut sunucu odasına standart Docker ile, tek komutla, on-premise kuruldu. Local AI, NovaMak'ın kendi GPU sunucusunda yerel çıkarım motoru (Ollama) üzerinden çalıştı — harici API yok, internet bağımlılığı yok. Company Brain; her birimin marka sesi, ürün kataloğu ve fiyatlandırması ile geçmiş kampanyaların sonuçlarıyla beslendi; uygulama-düzeyi kiracı izolasyonu her iş biriminin çalışma alanını ayrı tuttu.

**AI kullanımı.**
- **Company Brain** — hangi kampanya yaklaşımlarının ve ad set'lerin bayi müşteri-adayı getirdiğini öğrenen (kampanya→reklam→aday→ROI) ve sonraki brief için kazanan kalıpları öne çıkaran bir pazarlama-performansı belleği. Marka sesi ve yasaklı kelimeler her birimin BrandProfile'ından uygulanır.
- **AI destekli hat** — belirtilen bir hedeften yola çıkarak AdOS her ürün lansmanı için bir pazarlama özeti, ardından reklam metni (başlıklar, CTA'lar, sosyal gönderiler, açılış metni), ardından bir kampanya taslağı (kanallar, ad set'ler, bütçe dağılımı) taslaklar — her aşama insan onayına sunulur.
- **İnsan onay kapıları** — her aşama (strategy_and_budget, creative_assets, campaign_launch) açık bir onay tıklaması gerektirir; bir etkinlik günlüğü ve onay-başına zaman çizelgesi her kararı kaydeder. Pazarlama ekibi onaylanan taslağı kendi reklam platformunda yayınlamak üzere dışa aktarır.

**İş sonuçları.**
- Kampanya üretim süresi ~%65 azaldı (haftalar süren ajans döngüsü değil, günler).
- Kampanya onay döngüsü ~5 günden ~1,5 güne indi.
- 4 iş biriminin tamamında tutarlı marka sesi; azalan ajans bağımlılığı.
- Hiçbir ürün/fiyat verisi tesisten çıkmadı — doğrulanabilir, air-gap uyumlu.

**ROI (temsili).**
- Yıllık tasarruf: **₺8.400.000** — ajans yerine kurum-içi kampanya üretimi ₺4.800.000 · hızlı onay ve azalan yeniden iş ₺2.400.000 · yaratıcı işe alıştırma/hazırlık azalışı ₺1.200.000.
- 1. yıl yatırımı (yer tutucu): **₺2.800.000**.
- **Geri ödeme: 4,0 ay** · **İlk yıl ROI: %200** · **Verimlilik kazancı: kampanya üretimi ~%65 daha hızlı.**

**Çıkarılan dersler.** Company Brain'i önce marka sesi ve geçmiş-kampanya sonuçlarıyla besleyin — taslak kalitesi ve markaya-uygun tutarlılık buna bağlıdır. Kilit açan şey egemenlikti: anlaşma ancak fiyatlandırma ve ürün stratejisi binadan çıkmadığı için mümkün oldu.

**Alıntı.** *"Ürün verimizin binadan çıkması derdinden kurtuldum — AI kampanyalarımızı kendi sunucumuzda taslaklıyor ve ekibim, reklam platformumuza bir şey gitmeden önce her adımı onaylıyor."* — **temsili persona:** Pazarlama Direktörü, NovaMak Endüstri A.Ş. (kurgusal)

---

# 2. Organized Industrial Zone (OSB) — Marmara Vadi OSB

## English

**Customer profile.** Marmara Vadi OSB is an illustrative organized industrial zone hosting ~180 member firms with a central shared-services team of ~90 staff. Among its services, the zone runs a shared marketing function: investment-promotion campaigns for the zone itself and promotional campaigns drafted on behalf of member firms. Member firms share commercial plans and brand assets and expect them to stay in the zone's own data center.

**Problem.** The shared-services team drafted promotional and investment-attraction campaigns by hand — briefs, copy, and channel plans — which was slow and inconsistent. Member firms could not tell where a campaign request stood. Duplicate creative work spread across departments. A cloud AI service was unacceptable given member-firm commercial sensitivity.

**Implementation.** AdOS deployed on-premise in the OSB's own data center. Application-level multi-tenant isolation kept each member firm's brand and campaign data segregated. Local AI ran offline through a local engine. The Company Brain was seeded with the zone's brand voice, member-firm brand profiles, and the performance of past promotional campaigns.

**AI usage.**
- **Company Brain** — learns which investment-promotion and member campaigns drew leads and inquiries, and surfaces the patterns that worked, per tenant.
- **AI-assisted pipeline** — drafts marketing briefs, ad copy, and campaign plans (channels/budget) for zone investment campaigns and member-firm promotions; each stage is human-approved.
- **Human approval gates + tenant isolation** — every stage requires an explicit approval; an activity log and per-approval timeline give members a reliable record. Application-level isolation keeps Firm A's campaigns and brand data invisible to Firm B. Approved drafts are exported to run in each firm's own ad platform.

**Business results.**
- Campaign turnaround time cut ~60%; repeat brief work reduced.
- Campaign request status made transparent and faster; fewer stalled jobs.
- Duplicate creative effort across departments reduced through a single brand memory.
- Application-level tenant isolation preserved member-firm confidentiality on-premise.

**ROI (illustrative).**
- Annual savings: **₺6,600,000** — in-house member-campaign production ₺3,600,000 · faster campaign/approval turnaround ₺1,800,000 · reduced duplicate creative work ₺1,200,000.
- Year-1 investment (placeholder): **₺2,750,000**.
- **Payback: 5.0 months** · **First-year ROI: 140%** · **Efficiency gain: ~60% faster campaign turnaround.**

**Lessons learned.** Multi-tenant isolation is the trust anchor for a shared-services buyer — demonstrate that Firm A can never see Firm B's campaigns or brand data before anything else. The zone's neutrality depends on it.

**Quote.** *"Our members trust us with their commercial plans. AdOS lets us draft their campaigns fast without that data ever leaving our zone."* — **illustrative persona:** Shared Services Coordinator, Marmara Vadi OSB (fictional)

## Türkçe

**Müşteri profili.** Marmara Vadi OSB, ~180 üye firmaya ev sahipliği yapan ve ~90 kişilik merkezi paylaşımlı hizmetler ekibi olan temsili bir organize sanayi bölgesidir. Hizmetleri arasında paylaşımlı bir pazarlama işlevi de vardır: bölgenin kendisi için yatırım-tanıtım kampanyaları ve üye firmalar adına taslaklanan tanıtım kampanyaları. Üye firmalar ticari planlarını ve marka varlıklarını paylaşır ve bunların bölgenin kendi veri merkezinde kalmasını bekler.

**Problem.** Paylaşımlı hizmetler ekibi tanıtım ve yatırım-çekme kampanyalarını (brief'ler, metin ve kanal planları) elle hazırlıyordu; bu yavaş ve tutarsızdı. Üye firmalar bir kampanya talebinin durumunu göremiyordu. Departmanlar arası tekrarlı yaratıcı iş yayılıyordu. Üye-firma ticari hassasiyeti nedeniyle bulut AI hizmeti kabul edilemezdi.

**Uygulama.** AdOS, OSB'nin kendi veri merkezine on-premise kuruldu. Uygulama-düzeyi multi-tenant izolasyon her üye firmanın marka ve kampanya verisini ayrı tuttu. Local AI yerel motor üzerinden çevrimdışı çalıştı. Company Brain; bölgenin marka sesi, üye-firma marka profilleri ve geçmiş tanıtım kampanyalarının performansıyla beslendi.

**AI kullanımı.**
- **Company Brain** — hangi yatırım-tanıtım ve üye kampanyalarının müşteri-adayı ve talep getirdiğini öğrenir ve işe yarayan kalıpları kiracı bazında öne çıkarır.
- **AI destekli hat** — bölge yatırım kampanyaları ve üye-firma tanıtımları için pazarlama özetleri, reklam metni ve kampanya planları (kanal/bütçe) taslaklar; her aşama insan onaylıdır.
- **İnsan onay kapıları + kiracı izolasyonu** — her aşama açık bir onay gerektirir; bir etkinlik günlüğü ve onay-başına zaman çizelgesi üyelere güvenilir bir kayıt sunar. Uygulama-düzeyi izolasyon, A Firması'nın kampanyalarını ve marka verisini B Firması'na görünmez kılar. Onaylanan taslaklar her firmanın kendi reklam platformunda yayınlanmak üzere dışa aktarılır.

**İş sonuçları.**
- Kampanya hazırlık süresi ~%60 azaldı; tekrarlı brief işi azaldı.
- Kampanya talebi durumu şeffaf ve hızlı hale geldi; takılan işler azaldı.
- Tek bir marka belleğiyle departmanlar arası tekrarlı yaratıcı iş azaldı.
- Uygulama-düzeyi kiracı izolasyonu üye-firma gizliliğini on-premise korudu.

**ROI (temsili).**
- Yıllık tasarruf: **₺6.600.000** — kurum-içi üye-kampanyası üretimi ₺3.600.000 · hızlı kampanya/onay hazırlığı ₺1.800.000 · azalan tekrarlı yaratıcı iş ₺1.200.000.
- 1. yıl yatırımı (yer tutucu): **₺2.750.000**.
- **Geri ödeme: 5,0 ay** · **İlk yıl ROI: %140** · **Verimlilik kazancı: kampanya hazırlığı ~%60 daha hızlı.**

**Çıkarılan dersler.** Multi-tenant izolasyon, paylaşımlı-hizmet alıcısı için güven çıpasıdır — her şeyden önce A Firması'nın B Firması'nın kampanyalarını veya marka verisini asla göremeyeceğini gösterin. Bölgenin tarafsızlığı buna bağlıdır.

**Alıntı.** *"Üyelerimiz ticari planlarını bize emanet ediyor. AdOS, o veri bölgemizden hiç çıkmadan onların kampanyalarını hızlıca taslaklamamızı sağlıyor."* — **temsili persona:** Paylaşımlı Hizmetler Koordinatörü, Marmara Vadi OSB (kurgusal)

---

# 3. Municipality — Yeşilkent Belediyesi

## English

**Customer profile.** Yeşilkent Belediyesi is an illustrative municipality of ~2,300 staff serving a mid-size city. Public-sector data-residency mandates make on-prem a legal requirement, not a preference. Its communications team runs a steady stream of public-awareness campaigns: recycling, public health, civic events, and municipal services.

**Problem.** The communications team was slow to produce public-awareness campaigns — briefs, copy, and channel plans were built by hand for each initiative. Approvals moved slowly through manual channels. Frequent staff rotation meant constant re-training on brand and tone. By law, citizen and administrative data could not be sent to a public cloud AI.

**Implementation.** AdOS deployed on-premise in the municipality's data center, fully offline-capable to satisfy data-residency mandates. The Company Brain was seeded with the municipality's brand voice, communication guidelines, and the performance of past public campaigns.

**AI usage.**
- **Company Brain** — learns which public-awareness campaigns drove engagement, and surfaces the messaging and channel mixes that worked for the next brief.
- **AI-assisted pipeline** — drafts marketing briefs, campaign copy, and channel/budget plans for public-communication campaigns; each stage is presented for human approval.
- **Human approval gates** — council and communications approvals each require an explicit approval click; an activity log and per-approval timeline record every decision for public-sector accountability. The comms team runs approved campaigns through the municipality's own channels and ad accounts.

**Business results.**
- Public-campaign production time cut ~55%.
- Approval cycle shortened and fully recorded.
- New and rotating comms staff productive faster via the Company Brain's brand voice.
- Data-residency mandate satisfied by design — nothing leaves the municipality.

**ROI (illustrative).**
- Annual savings: **₺5,400,000** — in-house public-campaign production ₺3,000,000 · council/comms approval routing ₺1,500,000 · onboarding for rotating comms staff ₺900,000.
- Year-1 investment (placeholder): **₺2,700,000**.
- **Payback: 6.0 months** · **First-year ROI: 100%** · **Efficiency gain: ~55% faster campaign production.**

**Lessons learned.** In the public sector, a recorded, accountable approval timeline is what lets leaders adopt AI at all — lead the demo with the per-approval timeline. *(Roadmap: a tamper-evident, immutable audit trail is planned; today AdOS provides an activity log and per-approval timeline.)*

**Quote.** *"On-prem isn't a nice-to-have for us — it's the law. AdOS drafts our public campaigns on our own servers, and every message is approved before it runs."* — **illustrative persona:** Director of Communications, Yeşilkent Belediyesi (fictional)

## Türkçe

**Müşteri profili.** Yeşilkent Belediyesi, orta ölçekli bir kente hizmet veren ~2.300 personelli temsili bir belediyedir. Kamu-sektörü veri-yerleşimi zorunlulukları, on-prem'i tercih değil yasal gereklilik yapar. İletişim ekibi düzenli bir kamu-farkındalığı kampanyası akışı yürütür: geri dönüşüm, halk sağlığı, kentsel etkinlikler ve belediye hizmetleri.

**Problem.** İletişim ekibi kamu-farkındalığı kampanyalarını üretmekte yavaştı — her girişim için brief'ler, metin ve kanal planları elle hazırlanıyordu. Onaylar manuel kanallarda yavaş ilerliyordu. Sık personel rotasyonu, marka ve tonda sürekli yeniden eğitim demekti. Yasa gereği vatandaş ve idari veri bir bulut AI'ya gönderilemezdi.

**Uygulama.** AdOS, belediyenin veri merkezine on-premise, veri-yerleşimi zorunluluklarını karşılayacak şekilde tamamen çevrimdışı çalışabilir olarak kuruldu. Company Brain; belediyenin marka sesi, iletişim kılavuzları ve geçmiş kamu kampanyalarının performansıyla beslendi.

**AI kullanımı.**
- **Company Brain** — hangi kamu-farkındalığı kampanyalarının etkileşim getirdiğini öğrenir ve sonraki brief için işe yarayan mesaj ve kanal karışımlarını öne çıkarır.
- **AI destekli hat** — kamu-iletişimi kampanyaları için pazarlama özetleri, kampanya metni ve kanal/bütçe planları taslaklar; her aşama insan onayına sunulur.
- **İnsan onay kapıları** — meclis ve iletişim onaylarının her biri açık bir onay tıklaması gerektirir; bir etkinlik günlüğü ve onay-başına zaman çizelgesi, kamu-sektörü hesap verebilirliği için her kararı kaydeder. İletişim ekibi onaylanan kampanyaları belediyenin kendi kanalları ve reklam hesapları üzerinden yürütür.

**İş sonuçları.**
- Kamu-kampanyası üretim süresi ~%55 azaldı.
- Onay döngüsü kısaldı ve tamamen kayıt altına alındı.
- Yeni ve rotasyondaki iletişim personeli Company Brain'in marka sesiyle daha hızlı verimli oldu.
- Veri-yerleşimi zorunluluğu tasarımdan karşılandı — hiçbir şey belediyeden çıkmıyor.

**ROI (temsili).**
- Yıllık tasarruf: **₺5.400.000** — kurum-içi kamu-kampanyası üretimi ₺3.000.000 · meclis/iletişim onay yönlendirmesi ₺1.500.000 · rotasyondaki iletişim personeli için işe alıştırma ₺900.000.
- 1. yıl yatırımı (yer tutucu): **₺2.700.000**.
- **Geri ödeme: 6,0 ay** · **İlk yıl ROI: %100** · **Verimlilik kazancı: kampanya üretimi ~%55 daha hızlı.**

**Çıkarılan dersler.** Kamuda, kayıt altına alınmış, hesap verebilir bir onay zaman çizelgesi, yöneticilerin AI'yı benimsemesini mümkün kılan şeydir — demoya onay-başına zaman çizelgesiyle başlayın. *(Yol haritası: kurcalamaya-dayanıklı, değişmez bir denetim izi planlanıyor; bugün AdOS bir etkinlik günlüğü ve onay-başına zaman çizelgesi sunuyor.)*

**Alıntı.** *"On-prem bizim için tercih değil — yasa. AdOS kamu kampanyalarımızı kendi sunucularımızda taslaklıyor ve her mesaj yayınlanmadan önce onaylanıyor."* — **temsili persona:** İletişim Direktörü, Yeşilkent Belediyesi (kurgusal)

---

# 4. Healthcare — Anadolu Şifa Hastanesi

## English

**Customer profile.** Anadolu Şifa Hastanesi is an illustrative private hospital group: ~2,600 clinical and administrative staff across 3 hospitals. Its marketing team promotes service lines, check-up packages, and new clinics. Health advertising is tightly rule-bound, and patient-adjacent and commercial data is confidential.

**Problem.** Producing compliant service-line campaigns was slow. Health-advertising rules and brand tone were applied inconsistently across agencies and staff, creating claim risk. Approvals — including compliance sign-off — dragged. Patient-adjacent and commercial data absolutely could not go to a cloud AI service.

**Implementation.** AdOS deployed on-premise within the hospital group's data center, air-gap capable. The Company Brain was seeded with the group's brand voice, banned-words/claim rules for health advertising, and the performance of past service-line campaigns.

**AI usage.**
- **Company Brain** — learns which service-line campaigns drove appointments, and applies brand voice and banned-words (health-advertising guardrails) from the BrandProfile so drafts avoid restricted claims.
- **AI-assisted pipeline** — drafts marketing briefs, ad copy, and campaign plans for service-line and check-up promotions; each stage is approved by marketing and compliance.
- **Human approval gates** — purchasing of media and each creative stage require explicit approval; an activity log and per-approval timeline record every decision. Marketing launches approved campaigns in its own ad accounts.

**Business results.**
- Campaign production time cut ~60%; brand and advertising-claim rules applied consistently via banned-words.
- Approval cycle accelerated, with compliance sign-off recorded.
- Marketing onboarding and brand-training time reduced.
- Confidential commercial and patient-adjacent data never left the premises.

**ROI (illustrative).**
- Annual savings: **₺7,200,000** — in-house campaign production ₺3,600,000 · faster approval & compliance sign-off ₺2,400,000 · reduced marketing training/onboarding ₺1,200,000.
- Year-1 investment (placeholder): **₺3,000,000**.
- **Payback: 5.0 months** · **First-year ROI: 140%** · **Efficiency gain: ~60% faster campaign production.**

**Lessons learned.** Banned-words and brand voice in the BrandProfile are the compliance unlock for health advertising — the proof moment that closed the room was showing a draft automatically avoid a restricted claim. Sovereignty plus brand-safe drafting is the whole story.

**Quote.** *"The AI drafts campaigns that respect our brand and advertising rules, and nothing leaves our data center. In a hospital, that's not a feature — it's the entry ticket."* — **illustrative persona:** Marketing & Communications Director, Anadolu Şifa Hastanesi (fictional)

## Türkçe

**Müşteri profili.** Anadolu Şifa Hastanesi, temsili bir özel hastane grubudur: 3 hastanede ~2.600 klinik ve idari personel. Pazarlama ekibi hizmet hatlarını, check-up paketlerini ve yeni klinikleri tanıtır. Sağlık reklamı sıkı kurallara bağlıdır ve hastaya-yakın ve ticari veri gizlidir.

**Problem.** Uyumlu hizmet-hattı kampanyaları üretmek yavaştı. Sağlık-reklamı kuralları ve marka tonu ajanslar ve personel arasında tutarsız uygulanıyor, iddia riski yaratıyordu. Onaylar — uyum onayı dahil — uzuyordu. Hastaya-yakın ve ticari veri kesinlikle bir bulut AI hizmetine gidemezdi.

**Uygulama.** AdOS, hastane grubunun veri merkezine on-premise, air-gap uyumlu olarak kuruldu. Company Brain; grubun marka sesi, sağlık reklamı için yasaklı-kelime/iddia kuralları ve geçmiş hizmet-hattı kampanyalarının performansıyla beslendi.

**AI kullanımı.**
- **Company Brain** — hangi hizmet-hattı kampanyalarının randevu getirdiğini öğrenir ve BrandProfile'dan marka sesini ve yasaklı-kelimeleri (sağlık-reklamı korkulukları) uygular; böylece taslaklar kısıtlı iddialardan kaçınır.
- **AI destekli hat** — hizmet-hattı ve check-up tanıtımları için pazarlama özetleri, reklam metni ve kampanya planları taslaklar; her aşama pazarlama ve uyum tarafından onaylanır.
- **İnsan onay kapıları** — medya alımı ve her yaratıcı aşama açık onay gerektirir; bir etkinlik günlüğü ve onay-başına zaman çizelgesi her kararı kaydeder. Pazarlama, onaylanan kampanyaları kendi reklam hesaplarında yayınlar.

**İş sonuçları.**
- Kampanya üretim süresi ~%60 azaldı; marka ve reklam-iddiası kuralları yasaklı-kelimelerle tutarlı uygulandı.
- Onay döngüsü hızlandı, uyum onayı kayıt altına alındı.
- Pazarlama işe alıştırma ve marka-eğitimi süresi azaldı.
- Gizli ticari ve hastaya-yakın veri tesisten hiç çıkmadı.

**ROI (temsili).**
- Yıllık tasarruf: **₺7.200.000** — kurum-içi kampanya üretimi ₺3.600.000 · hızlı onay ve uyum onayı ₺2.400.000 · azalan pazarlama eğitim/işe alıştırma ₺1.200.000.
- 1. yıl yatırımı (yer tutucu): **₺3.000.000**.
- **Geri ödeme: 5,0 ay** · **İlk yıl ROI: %140** · **Verimlilik kazancı: kampanya üretimi ~%60 daha hızlı.**

**Çıkarılan dersler.** BrandProfile'daki yasaklı-kelimeler ve marka sesi, sağlık reklamı için uyum kilidini açar — odayı kapatan kanıt anı, bir taslağın kısıtlı bir iddiadan otomatik kaçındığını göstermekti. Egemenlik artı marka-güvenli taslaklama hikâyenin tamamıdır.

**Alıntı.** *"AI, markamıza ve reklam kurallarımıza uyan kampanyalar taslaklıyor ve hiçbir şey veri merkezimizden çıkmıyor. Bir hastanede bu bir özellik değil — giriş biletidir."* — **temsili persona:** Pazarlama ve İletişim Direktörü, Anadolu Şifa Hastanesi (kurgusal)

---

# 5. Logistics — Rotalojistik A.Ş.

## English

**Customer profile.** Rotalojistik A.Ş. is an illustrative freight and logistics operator: ~1,900 staff across a head office and multiple terminals. Its commercial marketing team promotes new routes, capacity, and service offerings. Owns its own infrastructure; client and commercial data is sensitive.

**Problem.** Marketing was slow to produce campaigns for new routes and service offers, and leaned heavily on outside agencies. When experienced marketers left, knowledge of which campaigns and offers worked went with them. Sensitive client and commercial data could not go to a cloud service.

**Implementation.** AdOS deployed on-premise across the head office, connected to terminals over the private network, offline-capable at each site. The Company Brain was seeded with the company's brand voice, service/offer catalog, and the performance history of past promotional campaigns.

**AI usage.**
- **Company Brain** — retains which service-promotion campaigns and offers worked (campaign→ad→lead→ROI) and surfaces those patterns even after staff turnover.
- **AI-assisted pipeline** — quickly drafts marketing briefs, ad copy, and channel/budget campaign plans for new-route and service promotions; each stage is human-approved.
- **Human approval gates** — each stage requires an explicit approval click; an activity log and per-approval timeline record every decision. Marketing runs the approved plan in its own ad platform.

**Business results.**
- Campaign production time cut ~65%; fewer inconsistent, off-brand drafts.
- Approval cycle shortened, speeding go-to-market for new services.
- Campaign know-how retained and queryable in the Company Brain despite turnover.
- Client and commercial data stayed on-premise throughout.

**ROI (illustrative).**
- Annual savings: **₺9,000,000** — in-house campaign production ₺4,800,000 · faster approval & go-to-market ₺2,400,000 · reduced know-how loss/onboarding ₺1,800,000.
- Year-1 investment (placeholder): **₺3,000,000**.
- **Payback: 4.0 months** · **First-year ROI: 200%** · **Efficiency gain: ~65% faster campaign production.**

**Lessons learned.** Speed-to-market wins new-route revenue — but the honest local-inference trade-off matters: on modest CPU a full draft takes a little longer. Sizing the local hardware to the drafting load kept turnaround fast enough that marketing trusted it.

**Quote.** *"When we open a new route, we need a campaign fast. AdOS drafts it on our own network, my team approves it, and none of our clients' data leaves the building."* — **illustrative persona:** Head of Commercial Marketing, Rotalojistik A.Ş. (fictional)

## Türkçe

**Müşteri profili.** Rotalojistik A.Ş., temsili bir taşımacılık ve lojistik operatörüdür: bir genel merkez ve birden çok terminalde ~1.900 personel. Ticari pazarlama ekibi yeni hatları, kapasiteyi ve hizmet tekliflerini tanıtır. Kendi altyapısına sahip; müşteri ve ticari veri hassastır.

**Problem.** Pazarlama, yeni hatlar ve hizmet teklifleri için kampanya üretmekte yavaştı ve büyük ölçüde dış ajanslara dayanıyordu. Deneyimli pazarlamacılar ayrıldığında, hangi kampanya ve tekliflerin işe yaradığı bilgisi de onlarla gidiyordu. Hassas müşteri ve ticari veri bir bulut hizmetine gidemezdi.

**Uygulama.** AdOS, genel merkeze on-premise kuruldu, terminallere özel ağ üzerinden bağlandı, her sahada çevrimdışı çalışabilir. Company Brain; şirketin marka sesi, hizmet/teklif kataloğu ve geçmiş tanıtım kampanyalarının performans geçmişiyle beslendi.

**AI kullanımı.**
- **Company Brain** — hangi hizmet-tanıtımı kampanyalarının ve tekliflerinin işe yaradığını (kampanya→reklam→aday→ROI) saklar ve personel değişiminden sonra bile bu kalıpları öne çıkarır.
- **AI destekli hat** — yeni-hat ve hizmet tanıtımları için pazarlama özetleri, reklam metni ve kanal/bütçe kampanya planlarını hızla taslaklar; her aşama insan onaylıdır.
- **İnsan onay kapıları** — her aşama açık bir onay tıklaması gerektirir; bir etkinlik günlüğü ve onay-başına zaman çizelgesi her kararı kaydeder. Pazarlama onaylanan planı kendi reklam platformunda yürütür.

**İş sonuçları.**
- Kampanya üretim süresi ~%65 azaldı; tutarsız, marka-dışı taslaklar azaldı.
- Onay döngüsü kısaldı, yeni hizmetlerin pazara çıkışı hızlandı.
- Kampanya birikimi, personel değişimine rağmen Company Brain'de korunup sorgulanabilir hale geldi.
- Müşteri ve ticari veri tümüyle on-premise kaldı.

**ROI (temsili).**
- Yıllık tasarruf: **₺9.000.000** — kurum-içi kampanya üretimi ₺4.800.000 · hızlı onay ve pazara çıkış ₺2.400.000 · azalan bilgi kaybı/işe alıştırma ₺1.800.000.
- 1. yıl yatırımı (yer tutucu): **₺3.000.000**.
- **Geri ödeme: 4,0 ay** · **İlk yıl ROI: %200** · **Verimlilik kazancı: kampanya üretimi ~%65 daha hızlı.**

**Çıkarılan dersler.** Pazara-çıkış hızı yeni-hat gelirini kazandırır — ama dürüst yerel-çıkarım ödünleşimi önemlidir: mütevazı CPU'da tam bir taslak biraz daha uzun sürer. Yerel donanımı taslaklama yüküne göre boyutlandırmak, hazırlık süresini pazarlamanın güvenebileceği kadar hızlı tuttu.

**Alıntı.** *"Yeni bir hat açtığımızda hızlı bir kampanya gerekir. AdOS onu kendi ağımızda taslaklıyor, ekibim onaylıyor ve müşterilerimizin hiçbir verisi binadan çıkmıyor."* — **temsili persona:** Ticari Pazarlama Başkanı, Rotalojistik A.Ş. (kurgusal)

---

# 6. Retail — Marketim Perakende A.Ş.

## English

**Customer profile.** Marketim Perakende A.Ş. is an illustrative retail chain: ~5,200 staff across ~140 stores plus head office. Head-office marketing produces a constant stream of seasonal promotions, store-opening campaigns, and local offers. Distributed, high-turnover workforce; owns central IT infrastructure.

**Problem.** Head-office marketing was a bottleneck for store and seasonal promo campaigns — briefs, copy, and channel plans were built by hand and inconsistently on-brand. Approvals across many stores were slow and uneven. Customer and commercial data could not be exposed to a public cloud AI.

**Implementation.** AdOS deployed on-premise at central IT, serving all stores over the private network with offline resilience. The Company Brain was seeded with brand voice, product and promotion data, and the performance of past campaigns; application-level tenant isolation kept store-level workspaces separate.

**AI usage.**
- **Company Brain** — learns which promotions and creatives drove footfall and sales, and reuses winning-ad patterns across the estate.
- **AI-assisted pipeline** — drafts marketing briefs, ad copy, and channel/budget plans for seasonal and store-level promotions at scale; each stage is human-approved.
- **Human approval gates** — approvals run consistently across all stores; each stage requires an explicit approval click, recorded in an activity log and per-approval timeline. Marketing runs approved campaigns in its own ad accounts.

**Business results.**
- Campaign production time cut ~60%; head-office bottleneck reduced.
- Consistent, on-brand promotions across the estate despite high turnover.
- Approval cycle faster and consistent across all stores.
- Customer and commercial data stayed on-premise.

**ROI (illustrative).**
- Annual savings: **₺7,800,000** — in-house promo-campaign production ₺4,200,000 · faster, consistent campaign approvals ₺2,100,000 · creative onboarding/training reduction ₺1,500,000.
- Year-1 investment (placeholder): **₺3,250,000**.
- **Payback: 5.0 months** · **First-year ROI: 140%** · **Efficiency gain: ~60% faster campaign production.**

**Lessons learned.** Across many stores, the Company Brain's real payoff is reusing winning campaign patterns estate-wide — measure repeat-campaign lift, not just draft speed. Bilingual UX mattered for a distributed frontline marketing workforce.

**Quote.** *"We spin up on-brand promotions for every store in hours, not days, and it all runs on our own servers."* — **illustrative persona:** Retail Marketing Manager, Marketim Perakende A.Ş. (fictional)

## Türkçe

**Müşteri profili.** Marketim Perakende A.Ş., temsili bir perakende zinciridir: ~140 mağaza artı genel merkezde ~5.200 personel. Genel merkez pazarlaması sürekli bir sezonluk kampanya, mağaza-açılışı kampanyası ve yerel teklif akışı üretir. Dağıtık, yüksek devir hızlı iş gücü; merkezi BT altyapısına sahip.

**Problem.** Genel merkez pazarlaması, mağaza ve sezonluk promosyon kampanyaları için bir darboğazdı — brief'ler, metin ve kanal planları elle hazırlanıyor ve markaya-uygunlukta tutarsız oluyordu. Birçok mağazadaki onaylar yavaş ve eşitsizdi. Müşteri ve ticari veri bir kamu bulut AI'ya açılamazdı.

**Uygulama.** AdOS, merkezi BT'ye on-premise kuruldu, tüm mağazalara özel ağ üzerinden çevrimdışı dayanıklılıkla hizmet verdi. Company Brain; marka sesi, ürün ve promosyon verisi ve geçmiş kampanyaların performansıyla beslendi; uygulama-düzeyi kiracı izolasyonu mağaza-düzeyi çalışma alanlarını ayrı tuttu.

**AI kullanımı.**
- **Company Brain** — hangi promosyonların ve yaratıcıların ayak trafiği ve satış getirdiğini öğrenir ve kazanan reklam kalıplarını tüm ağda yeniden kullanır.
- **AI destekli hat** — sezonluk ve mağaza-düzeyi promosyonlar için pazarlama özetleri, reklam metni ve kanal/bütçe planlarını ölçekte taslaklar; her aşama insan onaylıdır.
- **İnsan onay kapıları** — onaylar tüm mağazalarda tutarlı ilerler; her aşama açık bir onay tıklaması gerektirir ve bir etkinlik günlüğü ile onay-başına zaman çizelgesine kaydedilir. Pazarlama, onaylanan kampanyaları kendi reklam hesaplarında yürütür.

**İş sonuçları.**
- Kampanya üretim süresi ~%60 azaldı; genel merkez darboğazı azaldı.
- Yüksek devre rağmen tüm ağda tutarlı, markaya-uygun promosyonlar.
- Onay döngüsü tüm mağazalarda daha hızlı ve tutarlı.
- Müşteri ve ticari veri on-premise kaldı.

**ROI (temsili).**
- Yıllık tasarruf: **₺7.800.000** — kurum-içi promosyon-kampanyası üretimi ₺4.200.000 · hızlı, tutarlı kampanya onayları ₺2.100.000 · yaratıcı işe alıştırma/eğitim azalışı ₺1.500.000.
- 1. yıl yatırımı (yer tutucu): **₺3.250.000**.
- **Geri ödeme: 5,0 ay** · **İlk yıl ROI: %140** · **Verimlilik kazancı: kampanya üretimi ~%60 daha hızlı.**

**Çıkarılan dersler.** Birçok mağazada Company Brain'in asıl getirisi, kazanan kampanya kalıplarını ağ genelinde yeniden kullanmaktır — yalnızca taslak hızını değil, tekrar-kampanya artışını ölçün. Dağıtık ön-saf pazarlama iş gücü için çift dilli deneyim önemliydi.

**Alıntı.** *"Her mağaza için markaya-uygun promosyonları günlerle değil saatlerle ayağa kaldırıyoruz ve hepsi kendi sunucularımızda çalışıyor."* — **temsili persona:** Perakende Pazarlama Müdürü, Marketim Perakende A.Ş. (kurgusal)

---

# 7. Education — Marmara Bilim Üniversitesi

## English

**Customer profile.** Marmara Bilim Üniversitesi is an illustrative private university: ~1,700 academic and administrative staff serving a large student body. Its admissions and marketing team runs student-recruitment and program-promotion campaigns. Budget-sensitive; owns on-prem labs and compute.

**Problem.** Admissions and marketing were slow and costly to produce recruitment campaigns — briefs, copy, and channel plans were built by hand or outsourced. Per-query cloud AI costs ruled out an always-on tool; the university's on-prem labs made local deployment natural.

**Implementation.** AdOS deployed on-premise using the university's existing lab compute, with no per-token billing — inference cost is the university's own electricity and hardware. The Company Brain was seeded with the university's brand voice, program catalog, and the performance of past recruitment campaigns.

**AI usage.**
- **Company Brain** — learns which recruitment campaigns and creatives drove applications, and surfaces the winning patterns for the next intake's brief.
- **AI-assisted pipeline** — drafts marketing briefs, ad copy, and channel/budget plans for enrollment and program campaigns; each stage is human-approved.
- **Human approval gates** — each stage requires an explicit approval click, recorded in an activity log and per-approval timeline. Marketing runs approved campaigns in its own ad accounts.

**Business results.**
- Campaign production time cut ~55%.
- Approval routing faster and transparent.
- Marketing onboarding shortened; campaign know-how retained across intakes.
- No per-query AI cost — predictable budget on owned hardware.

**ROI (illustrative).**
- Annual savings: **₺4,600,000** — in-house campaign production ₺2,400,000 · approval routing ₺1,200,000 · know-how retention/onboarding ₺1,000,000.
- Year-1 investment (placeholder): **₺2,300,000**.
- **Payback: 6.0 months** · **First-year ROI: 100%** · **Efficiency gain: ~55% faster campaign production.**

**Lessons learned.** The no-per-token cost model was decisive for a budget-sensitive institution — reusing existing lab hardware turned AI from a recurring bill into a fixed asset. Seed the Company Brain with your best past intake campaigns before the recruitment season.

**Quote.** *"We draft our enrollment campaigns on the lab hardware we already own, with no metered AI bill. For a university budget, that changes the math."* — **illustrative persona:** Director of Admissions & Marketing, Marmara Bilim Üniversitesi (fictional)

## Türkçe

**Müşteri profili.** Marmara Bilim Üniversitesi, temsili bir vakıf üniversitesidir: geniş bir öğrenci kitlesine hizmet veren ~1.700 akademik ve idari personel. Kayıt ve pazarlama ekibi öğrenci-kazanımı ve program-tanıtımı kampanyaları yürütür. Bütçeye duyarlı; on-prem laboratuvarlara ve işlem gücüne sahip.

**Problem.** Kayıt ve pazarlama, öğrenci-kazanımı kampanyalarını üretmekte yavaş ve maliyetliydi — brief'ler, metin ve kanal planları elle hazırlanıyor veya dışarıya veriliyordu. Sorgu-başı bulut AI maliyetleri her-zaman-açık bir aracı elemine ediyordu; üniversitenin on-prem laboratuvarları yerel kurulumu doğal kılıyordu.

**Uygulama.** AdOS, üniversitenin mevcut laboratuvar işlem gücü kullanılarak on-premise kuruldu; token-başı ücretlendirme yok — çıkarım maliyeti üniversitenin kendi elektriği ve donanımı. Company Brain; üniversitenin marka sesi, program kataloğu ve geçmiş öğrenci-kazanımı kampanyalarının performansıyla beslendi.

**AI kullanımı.**
- **Company Brain** — hangi kazanım kampanyalarının ve yaratıcıların başvuru getirdiğini öğrenir ve sonraki dönem brief'i için kazanan kalıpları öne çıkarır.
- **AI destekli hat** — kayıt ve program kampanyaları için pazarlama özetleri, reklam metni ve kanal/bütçe planları taslaklar; her aşama insan onaylıdır.
- **İnsan onay kapıları** — her aşama açık bir onay tıklaması gerektirir ve bir etkinlik günlüğü ile onay-başına zaman çizelgesine kaydedilir. Pazarlama, onaylanan kampanyaları kendi reklam hesaplarında yürütür.

**İş sonuçları.**
- Kampanya üretim süresi ~%55 azaldı.
- Onay yönlendirmesi daha hızlı ve şeffaf.
- Pazarlama işe alıştırması kısaldı; kampanya birikimi dönemler arasında korundu.
- Sorgu-başı AI maliyeti yok — sahip olunan donanımda öngörülebilir bütçe.

**ROI (temsili).**
- Yıllık tasarruf: **₺4.600.000** — kurum-içi kampanya üretimi ₺2.400.000 · onay yönlendirmesi ₺1.200.000 · birikim koruma/işe alıştırma ₺1.000.000.
- 1. yıl yatırımı (yer tutucu): **₺2.300.000**.
- **Geri ödeme: 6,0 ay** · **İlk yıl ROI: %100** · **Verimlilik kazancı: kampanya üretimi ~%55 daha hızlı.**

**Çıkarılan dersler.** Token-başı olmayan maliyet modeli, bütçeye duyarlı bir kurum için belirleyiciydi — mevcut laboratuvar donanımını yeniden kullanmak, AI'yı tekrarlayan bir faturadan sabit bir varlığa dönüştürdü. Kayıt sezonundan önce Company Brain'i en iyi geçmiş dönem kampanyalarınızla besleyin.

**Alıntı.** *"Kayıt kampanyalarımızı zaten sahip olduğumuz laboratuvar donanımında, sayaçlı bir AI faturası olmadan taslaklıyoruz. Bir üniversite bütçesi için bu, matematiği değiştiriyor."* — **temsili persona:** Kayıt ve Pazarlama Direktörü, Marmara Bilim Üniversitesi (kurgusal)

---

# 8. Finance — Anadolu Katılım Finans A.Ş.

## English

**Customer profile.** Anadolu Katılım Finans A.Ş. is an illustrative financial institution: ~2,100 staff. Its marketing team promotes participation-finance products under strict advertising and disclosure rules. Regulatory data-residency and auditability requirements; zero tolerance for data leakage.

**Problem.** Producing compliant product campaigns was slow, and using an unapproved claim or wording carried real regulatory risk. Compliance sign-off on marketing was labor-intensive. Onboarding marketers into a heavily regulated environment was slow. A cloud AI service was categorically unacceptable — no customer or commercial data could leave the premises.

**Implementation.** AdOS deployed on-premise, air-gap capable, satisfying data-residency mandates by design. Every approval was recorded in an activity log and per-approval timeline — supporting the institution's internal review obligations. The Company Brain was seeded with brand voice, product information, banned-claim/disclosure rules, and the performance of past product campaigns.

**AI usage.**
- **Company Brain** — learns which product campaigns performed, and applies brand voice and banned-words (regulatory-claim guardrails) from the BrandProfile so drafts avoid non-compliant claims.
- **AI-assisted pipeline** — drafts marketing briefs, compliant ad copy, and campaign plans for product promotions; each stage is approved by marketing and compliance.
- **Human approval gates** — compliance and creative approvals each require an explicit approval click, recorded in the activity log and per-approval timeline. Marketing runs the approved campaign in its own ad accounts.

**Business results.**
- Campaign production time cut ~55%; non-compliant-claim risk reduced via banned-words.
- Compliance sign-off effort reduced; every approval recorded.
- Marketing onboarding into the regulated environment accelerated.
- Data-residency mandate met; the approval timeline supports internal examinations.

**ROI (illustrative).**
- Annual savings: **₺8,000,000** — in-house campaign production ₺4,000,000 · compliance sign-off & approval ₺2,800,000 · onboarding/training ₺1,200,000.
- Year-1 investment (placeholder): **₺4,000,000**.
- **Payback: 6.0 months** · **First-year ROI: 100%** · **Efficiency gain: ~55% faster campaign production.**

**Lessons learned.** In finance, banned-words guardrails plus a recorded approval timeline are what make AI-drafted advertising defensible in internal review — lead with accountability and brand-safety, not speed. We claim the architecture and controls honestly; we do not claim certifications AdOS has not earned. *(Roadmap: a tamper-evident, immutable audit trail is planned; today AdOS provides an activity log and per-approval timeline.)*

**Quote.** *"Every campaign is drafted on our own servers, every approval is recorded, and nothing leaves our data center. That's what makes AI usable for marketing in a regulated business."* — **illustrative persona:** Marketing & Compliance Director, Anadolu Katılım Finans A.Ş. (fictional)

## Türkçe

**Müşteri profili.** Anadolu Katılım Finans A.Ş., temsili bir finans kuruluşudur: ~2.100 personel. Pazarlama ekibi katılım-finansı ürünlerini sıkı reklam ve açıklama kuralları altında tanıtır. Düzenleyici veri-yerleşimi ve denetlenebilirlik gereklilikleri; veri sızıntısına sıfır tolerans.

**Problem.** Uyumlu ürün kampanyaları üretmek yavaştı ve onaysız bir iddia veya ifade kullanmak gerçek düzenleyici risk taşıyordu. Pazarlamada uyum onayı emek-yoğundu. Yoğun düzenlemeye tabi bir ortama pazarlamacı işe alıştırmak yavaştı. Bulut AI hizmeti kategorik olarak kabul edilemezdi — hiçbir müşteri veya ticari veri tesisten çıkamazdı.

**Uygulama.** AdOS, on-premise, air-gap uyumlu olarak kuruldu; veri-yerleşimi zorunluluklarını tasarımdan karşıladı. Her onay bir etkinlik günlüğü ve onay-başına zaman çizelgesine kaydedildi — kurumun iç inceleme yükümlülüklerini destekledi. Company Brain; marka sesi, ürün bilgisi, yasaklı-iddia/açıklama kuralları ve geçmiş ürün kampanyalarının performansıyla beslendi.

**AI kullanımı.**
- **Company Brain** — hangi ürün kampanyalarının performans gösterdiğini öğrenir ve BrandProfile'dan marka sesini ve yasaklı-kelimeleri (düzenleyici-iddia korkulukları) uygular; böylece taslaklar uyumsuz iddialardan kaçınır.
- **AI destekli hat** — ürün tanıtımları için pazarlama özetleri, uyumlu reklam metni ve kampanya planları taslaklar; her aşama pazarlama ve uyum tarafından onaylanır.
- **İnsan onay kapıları** — uyum ve yaratıcı onaylarının her biri açık bir onay tıklaması gerektirir ve etkinlik günlüğü ile onay-başına zaman çizelgesine kaydedilir. Pazarlama, onaylanan kampanyayı kendi reklam hesaplarında yürütür.

**İş sonuçları.**
- Kampanya üretim süresi ~%55 azaldı; yasaklı-kelimelerle uyumsuz-iddia riski düştü.
- Uyum onayı eforu azaldı; her onay kayıt altına alındı.
- Düzenlemeye tabi ortama pazarlama işe alıştırması hızlandı.
- Veri-yerleşimi zorunluluğu karşılandı; onay zaman çizelgesi iç incelemeleri destekliyor.

**ROI (temsili).**
- Yıllık tasarruf: **₺8.000.000** — kurum-içi kampanya üretimi ₺4.000.000 · uyum onayı ve onay ₺2.800.000 · işe alıştırma/eğitim ₺1.200.000.
- 1. yıl yatırımı (yer tutucu): **₺4.000.000**.
- **Geri ödeme: 6,0 ay** · **İlk yıl ROI: %100** · **Verimlilik kazancı: kampanya üretimi ~%55 daha hızlı.**

**Çıkarılan dersler.** Finansta, yasaklı-kelime korkulukları artı kayıt altına alınmış bir onay zaman çizelgesi, AI ile taslaklanmış reklamı iç incelemede savunulabilir kılan şeydir — hızla değil, hesap verebilirlik ve marka-güvenliğiyle başlayın. Mimariyi ve kontrolleri dürüstçe iddia ederiz; AdOS'un kazanmadığı sertifikaları iddia etmeyiz. *(Yol haritası: kurcalamaya-dayanıklı, değişmez bir denetim izi planlanıyor; bugün AdOS bir etkinlik günlüğü ve onay-başına zaman çizelgesi sunuyor.)*

**Alıntı.** *"Her kampanya kendi sunucularımızda taslaklanıyor, her onay kaydediliyor ve hiçbir şey veri merkezimizden çıkmıyor. Düzenlemeye tabi bir işte pazarlamada AI'yı kullanılabilir kılan budur."* — **temsili persona:** Pazarlama ve Uyum Direktörü, Anadolu Katılım Finans A.Ş. (kurgusal)

---
---

## Summary table / Özet tablo (illustrative — temsili)

| # | Vertical / Sektör | Illustrative company / Temsili şirket | Annual savings / Yıllık tasarruf | Year-1 investment / 1. yıl yatırımı | Payback / Geri ödeme | First-year ROI / İlk yıl ROI |
|---|---|---|---|---|---|---|
| 1 | Manufacturing / İmalat | NovaMak Endüstri A.Ş. | ₺8,400,000 | ₺2,800,000 | 4.0 mo / ay | 200% |
| 2 | OSB | Marmara Vadi OSB | ₺6,600,000 | ₺2,750,000 | 5.0 mo / ay | 140% |
| 3 | Municipality / Belediye | Yeşilkent Belediyesi | ₺5,400,000 | ₺2,700,000 | 6.0 mo / ay | 100% |
| 4 | Healthcare / Sağlık | Anadolu Şifa Hastanesi | ₺7,200,000 | ₺3,000,000 | 5.0 mo / ay | 140% |
| 5 | Logistics / Lojistik | Rotalojistik A.Ş. | ₺9,000,000 | ₺3,000,000 | 4.0 mo / ay | 200% |
| 6 | Retail / Perakende | Marketim Perakende A.Ş. | ₺7,800,000 | ₺3,250,000 | 5.0 mo / ay | 140% |
| 7 | Education / Eğitim | Marmara Bilim Üniversitesi | ₺4,600,000 | ₺2,300,000 | 6.0 mo / ay | 100% |
| 8 | Finance / Finans | Anadolu Katılım Finans A.Ş. | ₺8,000,000 | ₺4,000,000 | 6.0 mo / ay | 100% |

**Reminder / Hatırlatma:** All figures are illustrative model assumptions, not quotes or audited results. AdOS **drafts** human-approved advertising campaigns on 100% local AI; it does not launch live ads — a person exports the approved plan to their own ad platform. Real numbers come from the buyer's own discovery inputs and Deal Desk. Tüm rakamlar temsili model varsayımlarıdır; teklif veya denetlenmiş sonuç değildir. AdOS, %100 yerel yapay zekâ üzerinde insan onaylı reklam kampanyalarını **taslaklar**; canlı reklam yayınlamaz — onaylanan planı bir kişi kendi reklam platformuna aktarır. Gerçek rakamlar alıcının kendi keşif girdilerinden ve Deal Desk'ten gelir.
