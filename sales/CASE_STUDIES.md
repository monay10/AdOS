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

Every case below uses the same transparent, buyer-controllable model (per Constitution §10). Figures are illustrative defaults, not quotes. Product terms stay in English in both languages.

Aşağıdaki her vaka aynı şeffaf, alıcının kontrol edebileceği modeli kullanır (Anayasa §10). Rakamlar temsili varsayılanlardır, teklif değildir.

- **Currency / Para birimi:** ₺ (illustrative loaded knowledge-worker cost assumption / temsili yüklü bilgi-çalışanı maliyet varsayımı).
- **Payback (months) / Geri ödeme (ay)** = Year-1 investment ÷ (Annual savings ÷ 12).
- **First-year ROI % / İlk yıl ROI %** = (Annual savings − Year-1 investment) ÷ Year-1 investment × 100.
- **Efficiency gain / Verimlilik kazancı** = reduction in time-to-answer and approval-cycle time.
- All investment figures are **placeholders** (platform license + support + local hardware). Real numbers come from Deal Desk (Constitution §16–17).

Every claim traces to the Canonical Brief: **Local AI** (on the customer's own hardware, no cloud, no API keys, no internet), **data sovereignty** (data never leaves the premises), **on-premise / air-gap capable**, **permission-aware citations** (the AI only cites what a user is entitled to see), and **immutable audit trails**.

---
---

# 1. Manufacturing — NovaMak Endüstri A.Ş.

## English

**Customer profile.** NovaMak Endüstri A.Ş. is an illustrative discrete manufacturer: ~1,400 employees across 6 production sites and 4 business units in Turkey. Highly regulated shop-floor processes, deep tacit knowledge held by senior operators, and approval-heavy maintenance and procurement operations. Owns its own server room; strict rule that engineering drawings and process data must not leave the premises.

**Problem.** Line engineers spent hours hunting for the right revision of a work instruction, quality procedure, or machine manual across shared drives and binders. When a senior operator retired, years of tacit troubleshooting knowledge left with them. Maintenance and CAPEX approvals sat in email, stalling lines. Cloud AI was off the table — drawings and process IP could not leave the building.

**Implementation.** AdOS deployed on-premise into NovaMak's existing server room via standard Docker, one-command bring-up. Local AI ran through a local inference engine (Ollama) on NovaMak's own GPU server — no external API, no internet dependency. The Company Brain was seeded with work instructions, quality procedures, machine manuals, and maintenance history, all permission-scoped per site and unit.

**AI usage.**
- **Company Brain** — line engineers ask "What is the torque spec for line 3 press revision C?" and get a permission-aware, **cited** answer pointing to the exact procedure. Operators only see documents for their site/unit.
- **Digital Employees** — a Maintenance Digital Employee drafts work-order summaries and prepares CAPEX approval packets; a Quality Digital Employee answers procedure questions and flags outdated revisions.
- **Workflows & Approvals** — maintenance and procurement approvals run through tiered, deterministic routing with a full audit trail.

**Business results.**
- Document/procedure retrieval time cut ~65% (minutes, not a shift-long hunt).
- Maintenance approval cycle reduced from ~5 days to ~1.5 days.
- Retiring-operator knowledge captured and queryable, reducing single-person dependency.
- Zero engineering data left the premises — verifiable, air-gap capable.

**ROI (illustrative).**
- Annual savings: **₺8,400,000** — retrieval time savings ₺4,800,000 · reduced approval delay & rework ₺2,400,000 · onboarding/training reduction ₺1,200,000.
- Year-1 investment (placeholder): **₺2,800,000**.
- **Payback: 4.0 months** · **First-year ROI: 200%** · **Efficiency gain: ~65% faster answers.**

**Lessons learned.** Seed the Company Brain with the revision-controlled document set first — citation trust depends on the AI pointing to the *current* revision. Sovereignty was the unlock: the deal only became possible because drawings never leave the building.

**Quote.** *"I stopped worrying about our drawings leaving the building — the AI runs on our own server and cites the exact procedure. That's the difference."* — **illustrative persona:** Plant Operations Director, NovaMak Endüstri A.Ş. (fictional)

## Türkçe

**Müşteri profili.** NovaMak Endüstri A.Ş., temsili bir seri üretim imalatçısıdır: Türkiye'de 6 üretim tesisi ve 4 iş biriminde ~1.400 çalışan. Yoğun düzenlemeye tabi saha süreçleri, kıdemli operatörlerdeki derin örtük bilgi ve onay yoğun bakım/satın alma operasyonları. Kendi sunucu odasına sahip; mühendislik çizimleri ve süreç verilerinin tesisten çıkmaması katı bir kural.

**Problem.** Hat mühendisleri, bir iş talimatının, kalite prosedürünün veya makine kılavuzunun doğru revizyonunu paylaşımlı sürücülerde ve klasörlerde ararken saatler harcıyordu. Kıdemli bir operatör emekli olduğunda, yılların örtük arıza-giderme bilgisi de onunla gidiyordu. Bakım ve CAPEX onayları e-postada bekleyip hatları durduruyordu. Bulut AI mümkün değildi — çizimler ve süreç IP'si binadan çıkamazdı.

**Uygulama.** AdOS, NovaMak'ın mevcut sunucu odasına standart Docker ile, tek komutla, on-premise kuruldu. Local AI, NovaMak'ın kendi GPU sunucusunda yerel çıkarım motoru (Ollama) üzerinden çalıştı — harici API yok, internet bağımlılığı yok. Company Brain; iş talimatları, kalite prosedürleri, makine kılavuzları ve bakım geçmişiyle, tesis ve birim bazında yetki kapsamlı olarak beslendi.

**AI kullanımı.**
- **Company Brain** — hat mühendisleri "Hat 3 pres revizyon C için tork değeri nedir?" diye sorar ve tam prosedüre işaret eden, yetki-farkında, **kaynak gösteren** bir yanıt alır. Operatörler yalnızca kendi tesis/biriminin belgelerini görür.
- **Digital Employees** — bir Bakım Digital Employee iş emri özetlerini hazırlar ve CAPEX onay paketlerini derler; bir Kalite Digital Employee prosedür sorularını yanıtlar ve güncel olmayan revizyonları işaretler.
- **Workflows & Approvals** — bakım ve satın alma onayları, tam denetim iziyle kademeli, deterministik yönlendirmeyle ilerler.

**İş sonuçları.**
- Belge/prosedür erişim süresi ~%65 azaldı (vardiya boyu arama değil, dakikalar).
- Bakım onay döngüsü ~5 günden ~1,5 güne indi.
- Emekli olan operatörün bilgisi yakalanıp sorgulanabilir hale geldi; tek-kişiye bağımlılık azaldı.
- Hiçbir mühendislik verisi tesisten çıkmadı — doğrulanabilir, air-gap uyumlu.

**ROI (temsili).**
- Yıllık tasarruf: **₺8.400.000** — erişim süresi tasarrufu ₺4.800.000 · azalan onay gecikmesi ve yeniden iş ₺2.400.000 · işe alıştırma/eğitim azalışı ₺1.200.000.
- 1. yıl yatırımı (yer tutucu): **₺2.800.000**.
- **Geri ödeme: 4,0 ay** · **İlk yıl ROI: %200** · **Verimlilik kazancı: yanıtlar ~%65 daha hızlı.**

**Çıkarılan dersler.** Company Brain'i önce revizyon kontrollü belge setiyle besleyin — kaynak güveni, AI'nın *güncel* revizyona işaret etmesine bağlıdır. Kilit açan şey egemenlikti: anlaşma ancak çizimler binadan çıkmadığı için mümkün oldu.

**Alıntı.** *"Çizimlerimizin binadan çıkması derdinden kurtuldum — AI kendi sunucumuzda çalışıyor ve tam prosedürü kaynak gösteriyor. Fark bu."* — **temsili persona:** Fabrika Operasyon Direktörü, NovaMak Endüstri A.Ş. (kurgusal)

---

# 2. Organized Industrial Zone (OSB) — Marmara Vadi OSB

## English

**Customer profile.** Marmara Vadi OSB is an illustrative organized industrial zone hosting ~180 member firms with a central shared-services team of ~90 staff. The zone provides permits, utilities coordination, environmental compliance, and member support. Data-residency expectations are high: member firms share sensitive operational data with the zone and expect it to stay in the zone's own data center.

**Problem.** The shared-services team answered the same member-firm questions repeatedly — permit steps, environmental rules, utility procedures — by digging through regulations and precedent. Permit and approval routing was manual and opaque; member firms could not tell where a request stood. Duplicate work spread across departments. A cloud AI service was unacceptable given member-firm data sensitivity.

**Implementation.** AdOS deployed on-premise in the OSB's own data center. Multi-tenant isolation kept each member firm's data segregated. Local AI ran offline through a local engine. The Company Brain was seeded with zone regulations, permit procedures, environmental guidelines, and precedent decisions — permission-scoped so each member firm sees only its own records plus shared public rules.

**AI usage.**
- **Company Brain** — member-firm staff and OSB officers get cited answers on permit steps and environmental rules, scoped to what each tenant may see.
- **Digital Employees** — a Member-Support Digital Employee triages and drafts responses to member queries; a Compliance Digital Employee prepares environmental filing summaries.
- **Workflows & Approvals** — permit and utility-connection approvals run through deterministic, tiered routing with an audit trail members can rely on.

**Business results.**
- Member-query resolution time cut ~60%; repeat questions deflected to self-service.
- Permit routing made transparent and faster; fewer stalled approvals.
- Duplicate effort across departments reduced through a single grounded source.
- Strict tenant isolation preserved member-firm data confidentiality on-premise.

**ROI (illustrative).**
- Annual savings: **₺6,600,000** — shared-services query handling ₺3,600,000 · faster permit/approval routing ₺1,800,000 · reduced duplicate work ₺1,200,000.
- Year-1 investment (placeholder): **₺2,750,000**.
- **Payback: 5.0 months** · **First-year ROI: 140%** · **Efficiency gain: ~60% faster member support.**

**Lessons learned.** Multi-tenant isolation is the trust anchor for a shared-services buyer — demonstrate that Firm A can never see Firm B's documents or citations before anything else. The zone's neutrality depends on it.

**Quote.** *"Our members trust us with sensitive data. AdOS lets us give them fast answers without that data ever leaving our zone."* — **illustrative persona:** Shared Services Coordinator, Marmara Vadi OSB (fictional)

## Türkçe

**Müşteri profili.** Marmara Vadi OSB, ~180 üye firmaya ev sahipliği yapan ve ~90 kişilik merkezi paylaşımlı hizmetler ekibi olan temsili bir organize sanayi bölgesidir. Bölge; ruhsat, altyapı koordinasyonu, çevre uyumu ve üye desteği sağlar. Veri-yerleşimi beklentisi yüksektir: üye firmalar hassas operasyonel verilerini bölgeyle paylaşır ve bunun bölgenin kendi veri merkezinde kalmasını bekler.

**Problem.** Paylaşımlı hizmetler ekibi aynı üye-firma sorularını (ruhsat adımları, çevre kuralları, altyapı prosedürleri) mevzuatı ve emsalleri karıştırarak defalarca yanıtlıyordu. Ruhsat ve onay yönlendirmesi manuel ve belirsizdi; üye firmalar taleplerinin durumunu göremiyordu. Departmanlar arası tekrarlı iş yayılıyordu. Üye-firma veri hassasiyeti nedeniyle bulut AI hizmeti kabul edilemezdi.

**Uygulama.** AdOS, OSB'nin kendi veri merkezine on-premise kuruldu. Multi-tenant izolasyon her üye firmanın verisini ayrı tuttu. Local AI yerel motor üzerinden çevrimdışı çalıştı. Company Brain; bölge mevzuatı, ruhsat prosedürleri, çevre kılavuzları ve emsal kararlarla beslendi — yetki kapsamlı olarak, her üye firma yalnızca kendi kayıtlarını artı paylaşılan kamuya açık kuralları görür.

**AI kullanımı.**
- **Company Brain** — üye-firma personeli ve OSB görevlileri, her kiracının görebileceğiyle sınırlı, kaynak gösterilen ruhsat ve çevre yanıtları alır.
- **Digital Employees** — bir Üye-Destek Digital Employee üye sorularını önceliklendirir ve yanıt taslakları hazırlar; bir Uyum Digital Employee çevre bildirim özetlerini hazırlar.
- **Workflows & Approvals** — ruhsat ve altyapı-bağlantı onayları, üyelerin güvenebileceği bir denetim iziyle deterministik, kademeli yönlendirmeyle ilerler.

**İş sonuçları.**
- Üye-sorusu çözüm süresi ~%60 azaldı; tekrar eden sorular self-servise yönlendirildi.
- Ruhsat yönlendirmesi şeffaf ve hızlı hale geldi; takılan onaylar azaldı.
- Tek bir temellendirilmiş kaynakla departmanlar arası tekrarlı iş azaldı.
- Katı kiracı izolasyonu üye-firma veri gizliliğini on-premise korudu.

**ROI (temsili).**
- Yıllık tasarruf: **₺6.600.000** — paylaşımlı hizmet soru yönetimi ₺3.600.000 · hızlı ruhsat/onay yönlendirmesi ₺1.800.000 · azalan tekrarlı iş ₺1.200.000.
- 1. yıl yatırımı (yer tutucu): **₺2.750.000**.
- **Geri ödeme: 5,0 ay** · **İlk yıl ROI: %140** · **Verimlilik kazancı: üye desteği ~%60 daha hızlı.**

**Çıkarılan dersler.** Multi-tenant izolasyon, paylaşımlı-hizmet alıcısı için güven çıpasıdır — her şeyden önce A Firması'nın B Firması'nın belgelerini veya kaynaklarını asla göremeyeceğini gösterin. Bölgenin tarafsızlığı buna bağlıdır.

**Alıntı.** *"Üyelerimiz hassas verilerini bize emanet ediyor. AdOS, o veri bölgemizden hiç çıkmadan onlara hızlı yanıt vermemizi sağlıyor."* — **temsili persona:** Paylaşımlı Hizmetler Koordinatörü, Marmara Vadi OSB (kurgusal)

---

# 3. Municipality — Yeşilkent Belediyesi

## English

**Customer profile.** Yeşilkent Belediyesi is an illustrative municipality of ~2,300 staff serving a mid-size city. Public-sector data-residency mandates make on-prem a legal requirement, not a preference. High document volume: regulations, council decisions, procurement files, and citizen requests.

**Problem.** Citizen-facing staff spent too long locating the right regulation or precedent to answer a request. Council and procurement approvals moved slowly through manual channels. Frequent staff rotation meant constant re-training. By law, citizen and administrative data could not be sent to a public cloud AI.

**Implementation.** AdOS deployed on-premise in the municipality's data center, fully offline-capable to satisfy data-residency mandates. The Company Brain was seeded with regulations, council decisions, procurement procedures, and service catalogs — permission-scoped by department and role.

**AI usage.**
- **Company Brain** — front-desk and case staff get cited answers grounded in the current regulation, never guessing.
- **Digital Employees** — a Citizen-Request Digital Employee drafts standard responses and routes cases; a Procurement Digital Employee assembles tender-approval packets.
- **Workflows & Approvals** — council and procurement approvals run through tiered, auditable routing that satisfies public-sector accountability requirements.

**Business results.**
- Citizen-request handling time cut ~55%.
- Procurement approval cycle shortened and made fully auditable.
- New and rotating staff productive faster via the Company Brain.
- Data-residency mandate satisfied by design — nothing leaves the municipality.

**ROI (illustrative).**
- Annual savings: **₺5,400,000** — citizen-request & document retrieval ₺3,000,000 · council/procurement approval routing ₺1,500,000 · onboarding for rotating staff ₺900,000.
- Year-1 investment (placeholder): **₺2,700,000**.
- **Payback: 6.0 months** · **First-year ROI: 100%** · **Efficiency gain: ~55% faster request handling.**

**Lessons learned.** In the public sector, the audit trail is as valuable as the speed — accountable, auditable approvals are what let procurement leaders adopt AI at all. Lead the demo with the immutable audit trail.

**Quote.** *"On-prem isn't a nice-to-have for us — it's the law. AdOS meets it and still gives our staff cited answers in seconds."* — **illustrative persona:** IT Director, Yeşilkent Belediyesi (fictional)

## Türkçe

**Müşteri profili.** Yeşilkent Belediyesi, orta ölçekli bir kente hizmet veren ~2.300 personelli temsili bir belediyedir. Kamu-sektörü veri-yerleşimi zorunlulukları, on-prem'i tercih değil yasal gereklilik yapar. Yüksek belge hacmi: mevzuat, meclis kararları, satın alma dosyaları ve vatandaş talepleri.

**Problem.** Vatandaşa dönük personel, bir talebi yanıtlamak için doğru mevzuatı veya emsali bulmakta çok zaman harcıyordu. Meclis ve satın alma onayları manuel kanallarda yavaş ilerliyordu. Sık personel rotasyonu sürekli yeniden eğitim demekti. Yasa gereği vatandaş ve idari veri bir bulut AI'ya gönderilemezdi.

**Uygulama.** AdOS, belediyenin veri merkezine on-premise, veri-yerleşimi zorunluluklarını karşılayacak şekilde tamamen çevrimdışı çalışabilir olarak kuruldu. Company Brain; mevzuat, meclis kararları, satın alma prosedürleri ve hizmet kataloglarıyla — departman ve rol bazında yetki kapsamlı — beslendi.

**AI kullanımı.**
- **Company Brain** — danışma ve dosya personeli, güncel mevzuata dayalı, kaynak gösterilen yanıtlar alır; tahmin yürütmez.
- **Digital Employees** — bir Vatandaş-Talebi Digital Employee standart yanıt taslakları hazırlar ve dosyaları yönlendirir; bir Satın Alma Digital Employee ihale-onay paketlerini derler.
- **Workflows & Approvals** — meclis ve satın alma onayları, kamu-sektörü hesap verebilirliğini karşılayan kademeli, denetlenebilir yönlendirmeyle ilerler.

**İş sonuçları.**
- Vatandaş-talebi işleme süresi ~%55 azaldı.
- Satın alma onay döngüsü kısaldı ve tamamen denetlenebilir hale geldi.
- Yeni ve rotasyondaki personel Company Brain ile daha hızlı verimli oldu.
- Veri-yerleşimi zorunluluğu tasarımdan karşılandı — hiçbir şey belediyeden çıkmıyor.

**ROI (temsili).**
- Yıllık tasarruf: **₺5.400.000** — vatandaş-talebi ve belge erişimi ₺3.000.000 · meclis/satın alma onay yönlendirmesi ₺1.500.000 · rotasyondaki personel için işe alıştırma ₺900.000.
- 1. yıl yatırımı (yer tutucu): **₺2.700.000**.
- **Geri ödeme: 6,0 ay** · **İlk yıl ROI: %100** · **Verimlilik kazancı: talep işleme ~%55 daha hızlı.**

**Çıkarılan dersler.** Kamuda denetim izi, hız kadar değerlidir — hesap verebilir, denetlenebilir onaylar, satın alma yöneticilerinin AI'yı benimsemesini mümkün kılan şeydir. Demoya değişmez denetim iziyle başlayın.

**Alıntı.** *"On-prem bizim için tercih değil — yasa. AdOS bunu karşılıyor ve yine de personelimize saniyeler içinde kaynak gösterilen yanıtlar veriyor."* — **temsili persona:** Bilgi İşlem Müdürü, Yeşilkent Belediyesi (kurgusal)

---

# 4. Healthcare — Anadolu Şifa Hastanesi

## English

**Customer profile.** Anadolu Şifa Hastanesi is an illustrative private hospital group: ~2,600 clinical and administrative staff across 3 hospitals. Patient and clinical confidentiality is paramount; strict access control is mandatory. Large body of clinical protocols, administrative procedures, and supplier contracts.

**Problem.** Clinicians and administrators struggled to find the current protocol or policy quickly; outdated versions circulated. Supply purchasing approvals were slow, risking stockouts. Compliance training consumed staff time. Patient-adjacent data absolutely could not go to a cloud AI service.

**Implementation.** AdOS deployed on-premise within the hospital group's data center, air-gap capable. Permission-aware access ensured clinical content was visible only to authorized roles. The Company Brain was seeded with clinical protocols, administrative procedures, and supplier documentation, strictly permission-scoped.

**AI usage.**
- **Company Brain** — staff ask protocol and policy questions and receive permission-aware, cited answers pointing to the current, approved version; unauthorized users never see restricted clinical content.
- **Digital Employees** — a Procurement Digital Employee prepares supply-purchase approval packets; an Admin Digital Employee answers policy questions and drafts routine correspondence.
- **Workflows & Approvals** — purchasing and administrative approvals run through tiered routing with a complete audit trail.

**Business results.**
- Protocol/policy retrieval time cut ~60%; outdated-version risk reduced via citations to the approved copy.
- Supply purchasing approvals accelerated, reducing stockout risk.
- Compliance and onboarding time reduced.
- Confidential clinical data never left the premises; access strictly permission-scoped.

**ROI (illustrative).**
- Annual savings: **₺7,200,000** — protocol/procedure retrieval ₺3,600,000 · faster purchasing/approval ₺2,400,000 · reduced training/compliance time ₺1,200,000.
- Year-1 investment (placeholder): **₺3,000,000**.
- **Payback: 5.0 months** · **First-year ROI: 140%** · **Efficiency gain: ~60% faster protocol access.**

**Lessons learned.** Permission-aware citations are non-negotiable in healthcare — the proof moment that closed the room was showing a restricted clinical document remain invisible to an unauthorized user. Sovereignty plus access control is the whole story.

**Quote.** *"The AI only ever cites what a person is allowed to see. In a hospital, that's not a feature — it's the entry ticket."* — **illustrative persona:** Chief Medical Information Officer, Anadolu Şifa Hastanesi (fictional)

## Türkçe

**Müşteri profili.** Anadolu Şifa Hastanesi, temsili bir özel hastane grubudur: 3 hastanede ~2.600 klinik ve idari personel. Hasta ve klinik gizliliği en önceliklidir; katı erişim kontrolü zorunludur. Geniş bir klinik protokol, idari prosedür ve tedarikçi sözleşmesi bütünü.

**Problem.** Klinisyenler ve idareciler güncel protokolü veya politikayı hızla bulmakta zorlanıyordu; eski sürümler dolaşıyordu. Tedarik satın alma onayları yavaştı, stok tükenmesi riski vardı. Uyum eğitimleri personel zamanını tüketiyordu. Hastaya yakın veri kesinlikle bir bulut AI hizmetine gidemezdi.

**Uygulama.** AdOS, hastane grubunun veri merkezine on-premise, air-gap uyumlu olarak kuruldu. Yetki-farkında erişim, klinik içeriğin yalnızca yetkili rollere görünmesini sağladı. Company Brain; klinik protokoller, idari prosedürler ve tedarikçi dokümantasyonuyla, katı yetki kapsamıyla beslendi.

**AI kullanımı.**
- **Company Brain** — personel protokol ve politika sorar; güncel, onaylı sürüme işaret eden yetki-farkında, kaynak gösterilen yanıtlar alır; yetkisiz kullanıcılar kısıtlı klinik içeriği asla görmez.
- **Digital Employees** — bir Satın Alma Digital Employee tedarik satın-alma onay paketlerini hazırlar; bir İdari Digital Employee politika sorularını yanıtlar ve rutin yazışma taslakları hazırlar.
- **Workflows & Approvals** — satın alma ve idari onaylar, eksiksiz denetim iziyle kademeli yönlendirmeyle ilerler.

**İş sonuçları.**
- Protokol/politika erişim süresi ~%60 azaldı; onaylı kopyaya kaynak göstererek eski-sürüm riski düştü.
- Tedarik satın alma onayları hızlandı, stok tükenme riski azaldı.
- Uyum ve işe alıştırma süresi azaldı.
- Gizli klinik veri tesisten hiç çıkmadı; erişim katı biçimde yetki kapsamlı kaldı.

**ROI (temsili).**
- Yıllık tasarruf: **₺7.200.000** — protokol/prosedür erişimi ₺3.600.000 · hızlı satın alma/onay ₺2.400.000 · azalan eğitim/uyum süresi ₺1.200.000.
- 1. yıl yatırımı (yer tutucu): **₺3.000.000**.
- **Geri ödeme: 5,0 ay** · **İlk yıl ROI: %140** · **Verimlilik kazancı: protokol erişimi ~%60 daha hızlı.**

**Çıkarılan dersler.** Sağlıkta yetki-farkında kaynak gösterimi pazarlık konusu değildir — odayı kapatan kanıt anı, kısıtlı bir klinik belgenin yetkisiz kullanıcıya görünmez kaldığını göstermekti. Egemenlik artı erişim kontrolü hikâyenin tamamıdır.

**Alıntı.** *"AI yalnızca bir kişinin görmeye yetkili olduğu şeyi kaynak gösteriyor. Bir hastanede bu bir özellik değil — giriş biletidir."* — **temsili persona:** Baş Tıbbi Bilgi Sorumlusu, Anadolu Şifa Hastanesi (kurgusal)

---

# 5. Logistics — Rotalojistik A.Ş.

## English

**Customer profile.** Rotalojistik A.Ş. is an illustrative freight and logistics operator: ~1,900 staff across a head office and multiple terminals. Time-critical routing and approvals; enormous document volume (customs papers, dispatch orders, claims). Owns its own infrastructure.

**Problem.** Staff drowned in documents — finding the right customs procedure or dispatch rule under time pressure was slow and error-prone. Exception and claims approvals stalled, delaying shipments. When experienced dispatchers left, hard-won routing knowledge went with them. Sensitive client shipment data could not go to a cloud service.

**Implementation.** AdOS deployed on-premise across the head office, connected to terminals over the private network, offline-capable at each site. The Company Brain was seeded with customs procedures, dispatch rules, carrier contracts, and claims precedent — permission-scoped by role and terminal.

**AI usage.**
- **Company Brain** — dispatchers get cited answers on customs and routing rules in seconds, under time pressure.
- **Digital Employees** — a Documentation Digital Employee summarizes and checks dispatch/customs paperwork; a Claims Digital Employee prepares claims-approval packets.
- **Workflows & Approvals** — exception and claims approvals run through fast, deterministic, tiered routing with a full audit trail.

**Business results.**
- Document processing time cut ~65%; fewer paperwork errors.
- Exception/claims approval cycle shortened, reducing shipment delays.
- Dispatcher knowledge retained and queryable, cutting single-person dependency.
- Client shipment data stayed on-premise throughout.

**ROI (illustrative).**
- Annual savings: **₺9,000,000** — document processing ₺4,800,000 · exception/claims approval routing ₺2,400,000 · reduced knowledge loss/onboarding ₺1,800,000.
- Year-1 investment (placeholder): **₺3,000,000**.
- **Payback: 4.0 months** · **First-year ROI: 200%** · **Efficiency gain: ~65% faster document processing.**

**Lessons learned.** In logistics, speed-to-answer directly moves freight — but the honest local-inference trade-off matters: on modest CPU the answer takes seconds. Sizing the local hardware to the query load kept latency low enough that dispatchers trusted it.

**Quote.** *"Seconds matter when a truck is waiting. AdOS gives our dispatchers a cited answer fast, and none of our clients' data leaves our network."* — **illustrative persona:** Head of Terminal Operations, Rotalojistik A.Ş. (fictional)

## Türkçe

**Müşteri profili.** Rotalojistik A.Ş., temsili bir taşımacılık ve lojistik operatörüdür: bir genel merkez ve birden çok terminalde ~1.900 personel. Zamana duyarlı yönlendirme ve onaylar; devasa belge hacmi (gümrük evrakı, sevk emirleri, hasar talepleri). Kendi altyapısına sahip.

**Problem.** Personel belgelerde boğuluyordu — zaman baskısı altında doğru gümrük prosedürünü veya sevk kuralını bulmak yavaş ve hataya açıktı. İstisna ve hasar-talebi onayları takılıp sevkiyatları geciktiriyordu. Deneyimli sevk görevlileri ayrıldığında, zorlukla kazanılmış yönlendirme bilgisi de gidiyordu. Hassas müşteri sevkiyat verisi bir bulut hizmetine gidemezdi.

**Uygulama.** AdOS, genel merkeze on-premise kuruldu, terminallere özel ağ üzerinden bağlandı, her sahada çevrimdışı çalışabilir. Company Brain; gümrük prosedürleri, sevk kuralları, taşıyıcı sözleşmeleri ve hasar-talebi emsalleriyle — rol ve terminal bazında yetki kapsamlı — beslendi.

**AI kullanımı.**
- **Company Brain** — sevk görevlileri, zaman baskısı altında saniyeler içinde gümrük ve yönlendirme kurallarında kaynak gösterilen yanıtlar alır.
- **Digital Employees** — bir Dokümantasyon Digital Employee sevk/gümrük evrakını özetler ve kontrol eder; bir Hasar-Talebi Digital Employee hasar-talebi onay paketlerini hazırlar.
- **Workflows & Approvals** — istisna ve hasar-talebi onayları, tam denetim iziyle hızlı, deterministik, kademeli yönlendirmeyle ilerler.

**İş sonuçları.**
- Belge işleme süresi ~%65 azaldı; evrak hataları düştü.
- İstisna/hasar-talebi onay döngüsü kısaldı, sevkiyat gecikmeleri azaldı.
- Sevk görevlisi bilgisi korunup sorgulanabilir hale geldi, tek-kişiye bağımlılık azaldı.
- Müşteri sevkiyat verisi tümüyle on-premise kaldı.

**ROI (temsili).**
- Yıllık tasarruf: **₺9.000.000** — belge işleme ₺4.800.000 · istisna/hasar-talebi onay yönlendirmesi ₺2.400.000 · azalan bilgi kaybı/işe alıştırma ₺1.800.000.
- 1. yıl yatırımı (yer tutucu): **₺3.000.000**.
- **Geri ödeme: 4,0 ay** · **İlk yıl ROI: %200** · **Verimlilik kazancı: belge işleme ~%65 daha hızlı.**

**Çıkarılan dersler.** Lojistikte yanıt hızı doğrudan yükü hareket ettirir — ama dürüst yerel-çıkarım ödünleşimi önemlidir: mütevazı CPU'da yanıt saniyeler alır. Yerel donanımı sorgu yüküne göre boyutlandırmak, gecikmeyi sevk görevlilerinin güvenebileceği kadar düşük tuttu.

**Alıntı.** *"Bir kamyon beklerken saniyeler önemlidir. AdOS sevk görevlilerimize hızlıca kaynak gösterilen yanıt veriyor ve müşterilerimizin hiçbir verisi ağımızdan çıkmıyor."* — **temsili persona:** Terminal Operasyonları Başkanı, Rotalojistik A.Ş. (kurgusal)

---

# 6. Retail — Marketim Perakende A.Ş.

## English

**Customer profile.** Marketim Perakende A.Ş. is an illustrative retail chain: ~5,200 staff across ~140 stores plus head office. Distributed, high-turnover workforce; high query volume; heavy training load. Owns central IT infrastructure.

**Problem.** Store staff repeatedly asked head office the same questions — pricing rules, return policy, promotions, HR procedures. High turnover meant constant re-training. HR and operations approvals across many stores were slow and inconsistent. Customer and commercial data could not be exposed to a public cloud AI.

**Implementation.** AdOS deployed on-premise at central IT, serving all stores over the private network with offline resilience. The Company Brain was seeded with policies, promotions, product data, and HR procedures — permission-scoped by role and store.

**AI usage.**
- **Company Brain** — store staff self-serve cited answers on policy, returns, and promotions instead of calling head office.
- **Digital Employees** — an HR Digital Employee answers procedure questions and drafts standard responses; an Operations Digital Employee prepares store-level approval requests.
- **Workflows & Approvals** — HR and operations approvals run consistently through tiered, auditable routing across all stores.

**Business results.**
- Store-staff query resolution time cut ~60%; head-office call volume down.
- Training load reduced despite high turnover — new hires ramp via the Company Brain.
- HR/ops approvals faster and consistent across the estate.
- Customer and commercial data stayed on-premise.

**ROI (illustrative).**
- Annual savings: **₺7,800,000** — store-staff query resolution ₺4,200,000 · faster HR/ops approvals ₺2,100,000 · training load reduction ₺1,500,000.
- Year-1 investment (placeholder): **₺3,250,000**.
- **Payback: 5.0 months** · **First-year ROI: 140%** · **Efficiency gain: ~60% faster in-store answers.**

**Lessons learned.** With high turnover, the Company Brain's real payoff is faster ramp for new hires — measure onboarding time, not just query speed. Bilingual UX mattered for a distributed frontline workforce.

**Quote.** *"New staff get answers on day one instead of week three, and it all runs on our own servers."* — **illustrative persona:** Retail Operations Manager, Marketim Perakende A.Ş. (fictional)

## Türkçe

**Müşteri profili.** Marketim Perakende A.Ş., temsili bir perakende zinciridir: ~140 mağaza artı genel merkezde ~5.200 personel. Dağıtık, yüksek devir hızlı iş gücü; yüksek soru hacmi; ağır eğitim yükü. Merkezi BT altyapısına sahip.

**Problem.** Mağaza personeli genel merkeze aynı soruları defalarca soruyordu — fiyatlandırma kuralları, iade politikası, kampanyalar, İK prosedürleri. Yüksek devir sürekli yeniden eğitim demekti. Birçok mağazadaki İK ve operasyon onayları yavaş ve tutarsızdı. Müşteri ve ticari veri bir kamu bulut AI'ya açılamazdı.

**Uygulama.** AdOS, merkezi BT'ye on-premise kuruldu, tüm mağazalara özel ağ üzerinden çevrimdışı dayanıklılıkla hizmet verdi. Company Brain; politikalar, kampanyalar, ürün verisi ve İK prosedürleriyle — rol ve mağaza bazında yetki kapsamlı — beslendi.

**AI kullanımı.**
- **Company Brain** — mağaza personeli, genel merkezi aramak yerine politika, iade ve kampanyalarda kaynak gösterilen yanıtlara self-servis erişir.
- **Digital Employees** — bir İK Digital Employee prosedür sorularını yanıtlar ve standart yanıt taslakları hazırlar; bir Operasyon Digital Employee mağaza-düzeyi onay taleplerini hazırlar.
- **Workflows & Approvals** — İK ve operasyon onayları, tüm mağazalarda kademeli, denetlenebilir yönlendirmeyle tutarlı biçimde ilerler.

**İş sonuçları.**
- Mağaza-personeli soru çözüm süresi ~%60 azaldı; genel merkez arama hacmi düştü.
- Yüksek devre rağmen eğitim yükü azaldı — yeni işe alınanlar Company Brain ile hızlanır.
- İK/operasyon onayları tüm ağda daha hızlı ve tutarlı.
- Müşteri ve ticari veri on-premise kaldı.

**ROI (temsili).**
- Yıllık tasarruf: **₺7.800.000** — mağaza-personeli soru çözümü ₺4.200.000 · hızlı İK/operasyon onayları ₺2.100.000 · eğitim yükü azalışı ₺1.500.000.
- 1. yıl yatırımı (yer tutucu): **₺3.250.000**.
- **Geri ödeme: 5,0 ay** · **İlk yıl ROI: %140** · **Verimlilik kazancı: mağaza-içi yanıtlar ~%60 daha hızlı.**

**Çıkarılan dersler.** Yüksek devir hızında Company Brain'in asıl getirisi, yeni işe alınanların daha hızlı hazır olmasıdır — yalnızca sorgu hızını değil, işe alıştırma süresini ölçün. Dağıtık ön-saf iş gücü için çift dilli deneyim önemliydi.

**Alıntı.** *"Yeni personel üçüncü hafta yerine ilk gün yanıt alıyor ve hepsi kendi sunucularımızda çalışıyor."* — **temsili persona:** Perakende Operasyon Müdürü, Marketim Perakende A.Ş. (kurgusal)

---

# 7. Education — Marmara Bilim Üniversitesi

## English

**Customer profile.** Marmara Bilim Üniversitesi is an illustrative private university: ~1,700 academic and administrative staff serving a large student body. Very large knowledge base (regulations, curricula, research procedures); budget-sensitive; owns on-prem labs and compute.

**Problem.** Staff and students struggled to find the right regulation, form, or procedure across scattered systems. Administrative approvals (procurement, academic requests) were slow. Onboarding new staff and retaining departing experts' knowledge was hard. Budget ruled out ongoing per-query cloud AI costs; on-prem labs made local deployment natural.

**Implementation.** AdOS deployed on-premise using the university's existing lab compute, with no per-token billing — inference cost is the university's own electricity and hardware. The Company Brain was seeded with regulations, curricula, forms, and administrative procedures — permission-scoped by role and department.

**AI usage.**
- **Company Brain** — staff and authorized students get cited answers on regulations and procedures instead of email chains.
- **Digital Employees** — a Student-Services Digital Employee drafts standard responses and routes requests; an Administration Digital Employee prepares procurement and academic-request packets.
- **Workflows & Approvals** — procurement and academic approvals run through tiered, auditable routing.

**Business results.**
- Administrative query handling time cut ~55%.
- Approval routing faster and transparent.
- New-staff onboarding shortened; departing experts' knowledge retained.
- No per-query AI cost — predictable budget on owned hardware.

**ROI (illustrative).**
- Annual savings: **₺4,600,000** — student/staff query handling ₺2,400,000 · approval routing ₺1,200,000 · knowledge retention/onboarding ₺1,000,000.
- Year-1 investment (placeholder): **₺2,300,000**.
- **Payback: 6.0 months** · **First-year ROI: 100%** · **Efficiency gain: ~55% faster administrative answers.**

**Lessons learned.** The no-per-token cost model was decisive for a budget-sensitive institution — reusing existing lab hardware turned AI from a recurring bill into a fixed asset. Scope student access carefully with permission-aware citations.

**Quote.** *"We run it on the lab hardware we already own, with no metered AI bill. For a university budget, that changes the math."* — **illustrative persona:** Director of Information Systems, Marmara Bilim Üniversitesi (fictional)

## Türkçe

**Müşteri profili.** Marmara Bilim Üniversitesi, temsili bir vakıf üniversitesidir: geniş bir öğrenci kitlesine hizmet veren ~1.700 akademik ve idari personel. Çok büyük bir bilgi tabanı (yönetmelikler, müfredatlar, araştırma prosedürleri); bütçeye duyarlı; on-prem laboratuvarlara ve işlem gücüne sahip.

**Problem.** Personel ve öğrenciler, dağınık sistemlerde doğru yönetmeliği, formu veya prosedürü bulmakta zorlanıyordu. İdari onaylar (satın alma, akademik talepler) yavaştı. Yeni personelin işe alıştırılması ve ayrılan uzmanların bilgisini korumak zordu. Bütçe, sürekli sorgu-başı bulut AI maliyetlerini elemine ediyordu; on-prem laboratuvarlar yerel kurulumu doğal kılıyordu.

**Uygulama.** AdOS, üniversitenin mevcut laboratuvar işlem gücü kullanılarak on-premise kuruldu; token-başı ücretlendirme yok — çıkarım maliyeti üniversitenin kendi elektriği ve donanımı. Company Brain; yönetmelikler, müfredatlar, formlar ve idari prosedürlerle — rol ve departman bazında yetki kapsamlı — beslendi.

**AI kullanımı.**
- **Company Brain** — personel ve yetkili öğrenciler, e-posta zincirleri yerine yönetmelik ve prosedürlerde kaynak gösterilen yanıtlar alır.
- **Digital Employees** — bir Öğrenci-Hizmetleri Digital Employee standart yanıt taslakları hazırlar ve talepleri yönlendirir; bir İdari Digital Employee satın alma ve akademik-talep paketlerini hazırlar.
- **Workflows & Approvals** — satın alma ve akademik onaylar, kademeli, denetlenebilir yönlendirmeyle ilerler.

**İş sonuçları.**
- İdari soru işleme süresi ~%55 azaldı.
- Onay yönlendirmesi daha hızlı ve şeffaf.
- Yeni personel işe alıştırması kısaldı; ayrılan uzmanların bilgisi korundu.
- Sorgu-başı AI maliyeti yok — sahip olunan donanımda öngörülebilir bütçe.

**ROI (temsili).**
- Yıllık tasarruf: **₺4.600.000** — öğrenci/personel soru işleme ₺2.400.000 · onay yönlendirmesi ₺1.200.000 · bilgi koruma/işe alıştırma ₺1.000.000.
- 1. yıl yatırımı (yer tutucu): **₺2.300.000**.
- **Geri ödeme: 6,0 ay** · **İlk yıl ROI: %100** · **Verimlilik kazancı: idari yanıtlar ~%55 daha hızlı.**

**Çıkarılan dersler.** Token-başı olmayan maliyet modeli, bütçeye duyarlı bir kurum için belirleyiciydi — mevcut laboratuvar donanımını yeniden kullanmak, AI'yı tekrarlayan bir faturadan sabit bir varlığa dönüştürdü. Öğrenci erişimini yetki-farkında kaynak gösterimiyle dikkatle kapsamlayın.

**Alıntı.** *"Zaten sahip olduğumuz laboratuvar donanımında, sayaçlı bir AI faturası olmadan çalıştırıyoruz. Bir üniversite bütçesi için bu, matematiği değiştiriyor."* — **temsili persona:** Bilgi Sistemleri Direktörü, Marmara Bilim Üniversitesi (kurgusal)

---

# 8. Finance — Anadolu Katılım Finans A.Ş.

## English

**Customer profile.** Anadolu Katılım Finans A.Ş. is an illustrative financial institution: ~2,100 staff. Regulatory data-residency and auditability requirements; zero tolerance for data leakage. Large body of policies, regulatory guidance, and compliance procedures.

**Problem.** Staff spent significant time locating current policy and regulatory guidance; using the wrong version carried real risk. Compliance approvals and audit preparation were labor-intensive. Onboarding into a heavily regulated environment was slow. A cloud AI service was categorically unacceptable — no customer or regulatory data could leave the premises.

**Implementation.** AdOS deployed on-premise, air-gap capable, satisfying data-residency mandates by design. Every consequential action recorded in an immutable audit trail — directly supporting the institution's auditability obligations. The Company Brain was seeded with policies, regulatory guidance, and compliance procedures — strictly permission-scoped.

**AI usage.**
- **Company Brain** — staff get permission-aware, cited answers grounded in the current, approved policy version; the AI never surfaces content a user is not entitled to see.
- **Digital Employees** — a Compliance Digital Employee assembles audit-preparation packets and flags policy gaps; a Policy Digital Employee answers guidance questions with citations.
- **Workflows & Approvals** — compliance approvals run through tiered routing, each step captured in the immutable audit trail.

**Business results.**
- Policy/regulatory retrieval time cut ~55%; wrong-version risk reduced via citations.
- Compliance approval and audit-prep effort reduced.
- Onboarding into the regulated environment accelerated.
- Data-residency mandate met; full audit trail supports examinations.

**ROI (illustrative).**
- Annual savings: **₺8,000,000** — policy/regulatory retrieval ₺4,000,000 · compliance approval & audit prep ₺2,800,000 · onboarding/training ₺1,200,000.
- Year-1 investment (placeholder): **₺4,000,000**.
- **Payback: 6.0 months** · **First-year ROI: 100%** · **Efficiency gain: ~55% faster policy access.**

**Lessons learned.** In finance, the immutable audit trail and permission-aware citations are what make AI defensible to a regulator — lead with accountability, not speed. We claim the architecture and controls honestly; we do not claim certifications AdOS has not earned.

**Quote.** *"Every answer is cited, every action is logged, and nothing leaves our data center. That's what makes AI usable in a regulated business."* — **illustrative persona:** Chief Compliance Officer, Anadolu Katılım Finans A.Ş. (fictional)

## Türkçe

**Müşteri profili.** Anadolu Katılım Finans A.Ş., temsili bir finans kuruluşudur: ~2.100 personel. Düzenleyici veri-yerleşimi ve denetlenebilirlik gereklilikleri; veri sızıntısına sıfır tolerans. Geniş bir politika, düzenleyici rehber ve uyum prosedürü bütünü.

**Problem.** Personel, güncel politika ve düzenleyici rehberi bulmakta ciddi zaman harcıyordu; yanlış sürümü kullanmak gerçek risk taşıyordu. Uyum onayları ve denetim hazırlığı emek-yoğundu. Yoğun düzenlemeye tabi bir ortama işe alıştırma yavaştı. Bulut AI hizmeti kategorik olarak kabul edilemezdi — hiçbir müşteri veya düzenleyici veri tesisten çıkamazdı.

**Uygulama.** AdOS, on-premise, air-gap uyumlu olarak kuruldu; veri-yerleşimi zorunluluklarını tasarımdan karşıladı. Her önemli eylem değişmez bir denetim izine kaydedildi — kurumun denetlenebilirlik yükümlülüklerini doğrudan destekledi. Company Brain; politikalar, düzenleyici rehber ve uyum prosedürleriyle — katı yetki kapsamlı — beslendi.

**AI kullanımı.**
- **Company Brain** — personel, güncel ve onaylı politika sürümüne dayalı yetki-farkında, kaynak gösterilen yanıtlar alır; AI, kullanıcının görmeye yetkili olmadığı içeriği asla açığa çıkarmaz.
- **Digital Employees** — bir Uyum Digital Employee denetim-hazırlık paketlerini derler ve politika boşluklarını işaretler; bir Politika Digital Employee rehber sorularını kaynak göstererek yanıtlar.
- **Workflows & Approvals** — uyum onayları kademeli yönlendirmeyle ilerler; her adım değişmez denetim izinde kaydedilir.

**İş sonuçları.**
- Politika/düzenleyici erişim süresi ~%55 azaldı; kaynak gösterimiyle yanlış-sürüm riski düştü.
- Uyum onayı ve denetim-hazırlığı eforu azaldı.
- Düzenlemeye tabi ortama işe alıştırma hızlandı.
- Veri-yerleşimi zorunluluğu karşılandı; tam denetim izi incelemeleri destekliyor.

**ROI (temsili).**
- Yıllık tasarruf: **₺8.000.000** — politika/düzenleyici erişim ₺4.000.000 · uyum onayı ve denetim hazırlığı ₺2.800.000 · işe alıştırma/eğitim ₺1.200.000.
- 1. yıl yatırımı (yer tutucu): **₺4.000.000**.
- **Geri ödeme: 6,0 ay** · **İlk yıl ROI: %100** · **Verimlilik kazancı: politika erişimi ~%55 daha hızlı.**

**Çıkarılan dersler.** Finansta, değişmez denetim izi ve yetki-farkında kaynak gösterimi, AI'yı bir düzenleyici karşısında savunulabilir kılan şeydir — hızla değil, hesap verebilirlikle başlayın. Mimariyi ve kontrolleri dürüstçe iddia ederiz; AdOS'un kazanmadığı sertifikaları iddia etmeyiz.

**Alıntı.** *"Her yanıt kaynak gösteriliyor, her eylem kaydediliyor ve hiçbir şey veri merkezimizden çıkmıyor. Düzenlemeye tabi bir işte AI'yı kullanılabilir kılan budur."* — **temsili persona:** Baş Uyum Sorumlusu, Anadolu Katılım Finans A.Ş. (kurgusal)

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

**Reminder / Hatırlatma:** All figures are illustrative model assumptions, not quotes or audited results. Real numbers come from the buyer's own discovery inputs and Deal Desk. Tüm rakamlar temsili model varsayımlarıdır; teklif veya denetlenmiş sonuç değildir. Gerçek rakamlar alıcının kendi keşif girdilerinden ve Deal Desk'ten gelir.
