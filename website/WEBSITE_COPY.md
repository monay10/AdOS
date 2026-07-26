# AdOS — Website Copy (Bilingual EN / TR)

**Companion to:** `WEBSITE_CONSTITUTION.md`, `WEBSITE_INFORMATION_ARCHITECTURE.md`.
Every string is provided **side by side in English and Turkish**. Turkish is
authored, not machine-translated. Voice: precise, calm, credible — no buzzwords
(`Constitution §19`). Documentation only; isolated to `website/`.

**Bilingual glossary (consistent terms):**
| EN | TR |
| --- | --- |
| Advertising Operating System | Reklam İşletim Sistemi |
| on-prem / on-premise | kurum içi |
| local AI | yerel yapay zekâ |
| offline-first | çevrimdışı öncelikli |
| data egress | veri çıkışı |
| multi-tenant | çok kiracılı |
| approval gate | onay adımı |
| Book a demo | Demo talep edin |
| Talk to sales | Satışa danışın |

---

## 1. Global — buttons & shared UI

| Element | English | Türkçe |
| --- | --- | --- |
| Primary CTA | Book a demo | Demo talep edin |
| Secondary CTA | Talk to sales | Satışa danışın |
| Tertiary CTA | How it works | Nasıl çalışır |
| Nav: Sign in | Sign in | Giriş yap |
| Nav: Docs | Docs | Dokümanlar |
| Security CTA | Request a security briefing | Güvenlik brifingi isteyin |
| IT CTA | View deployment docs | Kurulum dokümanlarını görün |
| Back to home | Back to home | Ana sayfaya dön |
| Read more | Read more | Daha fazlası |
| Language | English / Türkçe | English / Türkçe |
| Theme | Dark / Light | Koyu / Açık |

---

## 2. Home

**Hero**
| Element | English | Türkçe |
| --- | --- | --- |
| Eyebrow | The Advertising Operating System | Reklam İşletim Sistemi |
| Headline | Run an AI ad agency inside your own walls. | Yapay zekâ reklam ajansını kendi duvarlarınızın içinde çalıştırın. |
| Subhero | AdOS plans and runs your campaigns end to end — using AI models that stay entirely on your own infrastructure. No cloud. No API keys. No data leaving the building. | AdOS kampanyalarınızı baştan sona planlayıp yürütür — tamamen kendi altyapınızda kalan yapay zekâ modelleriyle. Bulut yok. API anahtarı yok. Verileriniz binadan çıkmaz. |
| Primary button | Book a demo | Demo talep edin |
| Secondary button | See how it works | Nasıl çalıştığını görün |

**Trust strip**
| Element | English | Türkçe |
| --- | --- | --- |
| Line | 100% local models · No cloud · No API keys · Your data never leaves your network | %100 yerel modeller · Bulut yok · API anahtarı yok · Verileriniz ağınızdan çıkmaz |
| Logo wall label | Runs on the local engines you already use | Zaten kullandığınız yerel motorlarla çalışır |

**Problem section**
| Element | English | Türkçe |
| --- | --- | --- |
| Section title | Cloud AI asks you to hand over your data. That is a non-starter. | Bulut yapay zekâsı verilerinizi teslim etmenizi ister. Bu, en baştan kabul edilemez. |
| Body | For regulated and data-sensitive organizations, sending customer data to a third-party AI service is not an option. AdOS was built the other way around: the models come to your data, not the reverse. | Regüle ve veriye duyarlı kurumlar için müşteri verisini üçüncü taraf bir yapay zekâ servisine göndermek bir seçenek değildir. AdOS tam tersi kuruldu: modeller verinize gelir, veriniz modele gitmez. |

**The pipeline**
| Element | English | Türkçe |
| --- | --- | --- |
| Section title | From a single objective to a finished campaign. | Tek bir hedeften tamamlanmış bir kampanyaya. |
| Body | State a business objective. AdOS produces the marketing brief, the creative, the campaign plan, the analytics, and the executive summary — pausing for your approval at every step. | Bir iş hedefi belirtin. AdOS pazarlama brifini, kreatifi, kampanya planını, analitiği ve yönetici özetini üretir — her adımda onayınızı bekleyerek. |
| Step 1 | Brief — strategy, audience, channels, KPIs | Brif — strateji, hedef kitle, kanallar, KPI’lar |
| Step 2 | Creative — headline, copy, social, landing, email | Kreatif — başlık, metin, sosyal, açılış sayfası, e-posta |
| Step 3 | Campaign — channels, budget, ad sets, schedule | Kampanya — kanallar, bütçe, reklam setleri, takvim |
| Step 4 | Analytics — real results, KPIs, recommendations | Analitik — gerçek sonuçlar, KPI’lar, öneriler |
| Step 5 | Executive — verdict, key results, next actions | Yönetim — karar, ana sonuçlar, sonraki adımlar |
| Approval note | You approve every stage before the next begins. | Bir sonraki adım başlamadan önce her aşamayı siz onaylarsınız. |

**Sovereignty section**
| Element | English | Türkçe |
| --- | --- | --- |
| Section title | Your data never leaves your perimeter. | Verileriniz sınırlarınızın dışına çıkmaz. |
| Body | Every prompt, asset and result stays inside your network. The AI Manager only ever talks to a model running on your own hardware — there is no external endpoint to leak to. | Her istem, her varlık ve her sonuç ağınızın içinde kalır. Yapay zekâ yöneticisi yalnızca kendi donanımınızda çalışan bir modelle konuşur — dışarıya sızabileceği bir uç nokta yoktur. |
| Diagram caption | Request → local AI Manager → local model. Nothing crosses the line. | İstek → yerel yapay zekâ yöneticisi → yerel model. Hiçbir şey sınırı geçmez. |

**Security proof**
| Element | English | Türkçe |
| --- | --- | --- |
| Section title | Enterprise security, built in from the first line. | Kurumsal güvenlik, ilk satırdan itibaren yerleşik. |
| Card 1 | Strict multi-tenancy — every query, event and file is scoped to one tenant. | Sıkı çok kiracılılık — her sorgu, olay ve dosya tek bir kiracıya sınırlıdır. |
| Card 2 | Argon2id credentials, security headers, CSP, rate limiting. | Argon2id kimlik bilgileri, güvenlik başlıkları, CSP, hız sınırlama. |
| Card 3 | Encrypted, verifiable backups and a documented recovery path. | Şifreli, doğrulanabilir yedekler ve belgelenmiş bir kurtarma yolu. |
| Link | Explore security | Güvenliği inceleyin |

**Local AI teaser**
| Element | English | Türkçe |
| --- | --- | --- |
| Section title | The models run on your machines. | Modeller sizin makinelerinizde çalışır. |
| Body | AdOS runs on the local inference engines you already know — Ollama, vLLM, LM Studio and more. Choose your model, keep your data, pay no per-token bill. | AdOS zaten bildiğiniz yerel çıkarım motorlarıyla çalışır — Ollama, vLLM, LM Studio ve daha fazlası. Modelinizi seçin, verinizi koruyun, token başına ücret ödemeyin. |
| Link | Local AI | Yerel yapay zekâ |

**Use-case cards**
| Element | English | Türkçe |
| --- | --- | --- |
| Card A title | Regulated industries | Regüle sektörler |
| Card A body | Finance, healthcare, public sector — meet data-residency requirements by architecture. | Finans, sağlık, kamu — veri yerleşimi gereksinimlerini mimariyle karşılayın. |
| Card B title | Agencies & groups | Ajanslar ve gruplar |
| Card B body | Serve many clients on one platform, each fully isolated. | Tek platformda birçok müşteriye hizmet verin, her biri tam izole. |
| Card C title | IT & platform teams | BT ve platform ekipleri |
| Card C body | Deploy with Docker, run it yourself, keep full control. | Docker ile kurun, kendiniz çalıştırın, tüm kontrolü elde tutun. |

**Bilingual note**
| Element | English | Türkçe |
| --- | --- | --- |
| Line | Available in Turkish and English — the interface and the AI output follow each user’s language automatically. | Türkçe ve İngilizce mevcut — arayüz ve yapay zekâ çıktısı her kullanıcının diline otomatik uyar. |

**Home CTA band**
| Element | English | Türkçe |
| --- | --- | --- |
| Title | See AdOS run on your own infrastructure. | AdOS’u kendi altyapınızda çalışırken görün. |
| Body | Book a walkthrough with our team, or talk to sales about an on-prem deployment. | Ekibimizle bir tanıtım planlayın ya da kurum içi kurulum için satışa danışın. |
| Primary | Book a demo | Demo talep edin |
| Secondary | Talk to sales | Satışa danışın |

---

## 3. Product — Overview & How it works

| Element | English | Türkçe |
| --- | --- | --- |
| Overview H1 | One platform for the whole advertising workflow. | Tüm reklam iş akışı için tek platform. |
| Overview subhero | From onboarding a client to an executive report, AdOS runs the agency workflow as a governed, multi-tenant system you host yourself. | Bir müşteriyi tanımlamaktan yönetici raporuna kadar, AdOS ajans iş akışını kendi barındırdığınız, yönetişimli ve çok kiracılı bir sistem olarak yürütür. |
| How-it-works H1 | How AdOS turns an objective into a campaign. | AdOS bir hedefi nasıl kampanyaya dönüştürür. |
| How-it-works subhero | A clear, staged pipeline with a human decision at every gate. Nothing publishes or advances without you. | Her adımda insan kararı olan, net ve aşamalı bir hat. Siz olmadan hiçbir şey yayımlanmaz ya da ilerlemez. |
| Feature: Missions | State the goal, the budget and the target metric. AdOS plans the rest. | Hedefi, bütçeyi ve hedef metriği belirtin. Gerisini AdOS planlar. |
| Feature: Approvals | Review and approve each stage — brief, creative, campaign — before it advances. | Her aşamayı — brif, kreatif, kampanya — ilerlemeden önce inceleyip onaylayın. |
| Feature: Assets | A versioned library of creative — nothing is overwritten. | Sürümlenmiş bir kreatif kütüphanesi — hiçbir şeyin üzerine yazılmaz. |
| Feature: Analytics | Enter real results; AdOS computes KPIs and writes the executive summary. | Gerçek sonuçları girin; AdOS KPI’ları hesaplar ve yönetici özetini yazar. |
| Feature: Learning | Every campaign’s outcome is recorded so the system improves over time. | Her kampanyanın sonucu kaydedilir, böylece sistem zamanla gelişir. |

---

## 4. Security

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | Security is our architecture, not a paragraph. | Güvenlik bizim mimarimizdir, bir paragraf değil. |
| Subhero | Because AdOS runs on your infrastructure with local models, there is no cloud endpoint and no data egress. The rest is defense in depth. | AdOS altyapınızda yerel modellerle çalıştığı için bulut uç noktası ve veri çıkışı yoktur. Gerisi katmanlı savunmadır. |
| Control: Isolation | Every query, event, background job and stored file is scoped to a single tenant. Tenants cannot see each other. | Her sorgu, olay, arka plan işi ve saklanan dosya tek bir kiracıya sınırlıdır. Kiracılar birbirini göremez. |
| Control: Auth | Production authentication uses Argon2id password hashing with constant-time verification. | Üretim kimlik doğrulaması sabit zamanlı doğrulamayla Argon2id parola özetlemesi kullanır. |
| Control: Hardening | A full set of security headers and a strict content security policy on every response; brute-force lockout and rate limiting on sign-in. | Her yanıtta eksiksiz güvenlik başlıkları ve sıkı bir içerik güvenlik politikası; girişte kaba kuvvet kilidi ve hız sınırlama. |
| Control: Backups | Backups are compressed, AES-256-GCM encrypted and checksum-verified, with incremental chains. | Yedekler sıkıştırılır, AES-256-GCM ile şifrelenir ve sağlama ile doğrulanır; artımlı zincirlerle. |
| Control: Recovery | A documented disaster-recovery path with measured recovery objectives. | Ölçülmüş kurtarma hedefleriyle belgelenmiş bir felaket kurtarma yolu. |
| Control: Audit | Every action emits a tenant-scoped audit event you can monitor. | Her eylem, izleyebileceğiniz kiracıya özel bir denetim olayı üretir. |
| Compliance line | Data residency and sovereignty are met by architecture. We support KVKK and GDPR obligations and provide a Data Processing Addendum. Certifications in progress are stated honestly — we never claim what we do not hold. | Veri yerleşimi ve egemenliği mimariyle sağlanır. KVKK ve GDPR yükümlülüklerini destekler ve bir Veri İşleme Ek Sözleşmesi sunarız. Süren sertifikalar dürüstçe belirtilir — sahip olmadığımızı asla iddia etmeyiz. |
| CTA | Request a security briefing | Güvenlik brifingi isteyin |

---

## 5. Local AI

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | The models run on your hardware. Full stop. | Modeller sizin donanımınızda çalışır. Nokta. |
| Subhero | AdOS drives a local inference engine on your own machines. There is no cloud call, no API key, and no per-token bill. | AdOS kendi makinelerinizdeki bir yerel çıkarım motorunu sürer. Bulut çağrısı, API anahtarı ve token başına ücret yoktur. |
| Feature: Engines | Runs on Ollama, vLLM, LM Studio, llama.cpp and SGLang — the engines you already run. | Ollama, vLLM, LM Studio, llama.cpp ve SGLang ile çalışır — zaten çalıştırdığınız motorlar. |
| Feature: Your model | Choose any open local model and swap it freely; nothing downstream changes. | Herhangi bir açık yerel modeli seçin ve serbestçe değiştirin; sonraki hiçbir şey değişmez. |
| Feature: Governed | One internal interface mediates all AI, so output is structured and validated — no agent talks to a model directly. | Tek bir dahili arayüz tüm yapay zekâyı yönetir, böylece çıktı yapılandırılmış ve doğrulanmıştır — hiçbir ajan modelle doğrudan konuşmaz. |
| Feature: Bilingual | Output follows the user’s language automatically, Turkish or English. | Çıktı, kullanıcının diline otomatik uyar; Türkçe ya da İngilizce. |
| Honest note | Local model quality and speed depend on your hardware. A deterministic offline mode also lets AdOS run before any model server is attached. | Yerel model kalitesi ve hızı donanımınıza bağlıdır. Belirlenimci bir çevrimdışı mod, henüz bir model sunucusu bağlı değilken bile AdOS’un çalışmasını sağlar. |

---

## 6. Offline AI

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | Built to work with no internet at all. | Hiç internet olmadan çalışacak şekilde kuruldu. |
| Subhero | AdOS is offline-first. It runs in air-gapped environments and needs no outbound connection for its core operation. | AdOS çevrimdışı önceliklidir. İzole (air-gapped) ortamlarda çalışır ve temel işleyişi için dışa bağlantıya ihtiyaç duymaz. |
| Feature: Air-gapped | Deploy in fully isolated networks; core operation makes no external calls. | Tamamen izole ağlarda kurun; temel işleyiş dış çağrı yapmaz. |
| Feature: Self-contained | Every dependency is self-hostable. There is no runtime dependency on an external service. | Her bağımlılık kendi barındırılabilir. Dış bir servise çalışma zamanı bağımlılığı yoktur. |
| Feature: Ready before models | A deterministic offline manager means AdOS is functional even before a model server is connected. | Belirlenimci bir çevrimdışı yönetici, model sunucusu bağlanmadan önce bile AdOS’un işlevsel olması demektir. |

---

## 7. On-Prem

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | Your infrastructure. Your rules. | Sizin altyapınız. Sizin kurallarınız. |
| Subhero | AdOS deploys where you already run software — your data center, private cloud or bare metal — as a container stack you operate. | AdOS zaten yazılım çalıştırdığınız yere kurulur — veri merkeziniz, özel bulutunuz ya da fiziksel sunucularınız — sizin işlettiğiniz bir konteyner yığını olarak. |
| Feature: Deploy | A Docker stack: web, workers, database and observability. | Bir Docker yığını: web, işçiler, veritabanı ve gözlemlenebilirlik. |
| Feature: Operate | Documented installation, upgrades, backups and recovery. Upgrades are forward-only and safe to re-run. | Belgelenmiş kurulum, yükseltme, yedekleme ve kurtarma. Yükseltmeler yalnızca ileriye dönüktür ve yeniden çalıştırmaya güvenlidir. |
| Feature: No lock-in | Open engines, standard PostgreSQL, portable data and exportable backups. | Açık motorlar, standart PostgreSQL, taşınabilir veri ve dışa aktarılabilir yedekler. |
| Feature: Scale | A stateless web tier, horizontally-scalable workers and a tunable database pool. | Durumsuz bir web katmanı, yatay ölçeklenebilir işçiler ve ayarlanabilir bir veritabanı havuzu. |
| Requirements note | Requires Node 20 or later, a container runtime, and — for real models — a local inference engine and suitable hardware. | Node 20 veya üzeri, bir konteyner çalışma zamanı ve — gerçek modeller için — bir yerel çıkarım motoru ile uygun donanım gerektirir. |

---

## 8. FAQ

| # | English (Q / A) | Türkçe (S / C) |
| --- | --- | --- |
| 1 | **Does any of our data go to the cloud?** No. AdOS runs on your infrastructure and the AI models run locally. There is no cloud endpoint and no API key. | **Verilerimizin herhangi biri buluta gider mi?** Hayır. AdOS altyapınızda çalışır ve yapay zekâ modelleri yerelde çalışır. Bulut uç noktası ya da API anahtarı yoktur. |
| 2 | **Which AI models can we use?** Any open local model served by Ollama, vLLM, LM Studio, llama.cpp or SGLang. You can swap models without changing anything else. | **Hangi yapay zekâ modellerini kullanabiliriz?** Ollama, vLLM, LM Studio, llama.cpp ya da SGLang üzerinden sunulan herhangi bir açık yerel model. Başka hiçbir şeyi değiştirmeden model değiştirebilirsiniz. |
| 3 | **Is it truly multi-tenant?** Yes. Every query, event, job and file is scoped to a single tenant; tenants cannot see one another’s data. | **Gerçekten çok kiracılı mı?** Evet. Her sorgu, olay, iş ve dosya tek bir kiracıya sınırlıdır; kiracılar birbirinin verisini göremez. |
| 4 | **How is it deployed?** As a self-hosted Docker stack in your own environment, with documented install, upgrade, backup and recovery. | **Nasıl kurulur?** Kendi ortamınızda, belgelenmiş kurulum, yükseltme, yedekleme ve kurtarma ile kendi barındırdığınız bir Docker yığını olarak. |
| 5 | **Does it work offline?** Yes. AdOS is offline-first and runs in air-gapped networks. | **Çevrimdışı çalışır mı?** Evet. AdOS çevrimdışı önceliklidir ve izole ağlarda çalışır. |
| 6 | **What does it cost?** Pricing is tailored to deployment size and support level. Talk to sales for a quote. | **Maliyeti nedir?** Fiyatlandırma kurulum büyüklüğüne ve destek seviyesine göre belirlenir. Teklif için satışa danışın. |
| 7 | **Is it available in Turkish?** Yes. The interface and the AI output are fully bilingual, Turkish and English. | **Türkçe mevcut mu?** Evet. Arayüz ve yapay zekâ çıktısı tam iki dillidir; Türkçe ve İngilizce. |

---

## 9. Pricing (placeholders)

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | Pricing that fits your deployment. | Kurulumunuza uygun fiyatlandırma. |
| Subhero | AdOS is licensed for on-prem deployment. Pricing depends on scale, tenants and support level. | AdOS kurum içi kurulum için lisanslanır. Fiyatlandırma; ölçek, kiracı sayısı ve destek seviyesine bağlıdır. |
| Tier 1 | **Team** — a single deployment for one organization. | **Takım** — tek bir kurum için tek kurulum. |
| Tier 2 | **Enterprise** — multi-tenant, priority support, DR assistance. | **Kurumsal** — çok kiracılı, öncelikli destek, felaket kurtarma desteği. |
| Tier 3 | **Sovereign** — air-gapped deployment with hands-on onboarding. | **Egemen** — uygulamalı kurulum desteğiyle izole (air-gapped) kurulum. |
| Placeholder value | Custom | Size özel |
| CTA | Talk to sales | Satışa danışın |
| Note | Public pricing will be published as it is finalized. | Genel fiyatlandırma kesinleştikçe yayımlanacaktır. |

---

## 10. About

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | We build advertising infrastructure that respects your data. | Verinize saygı duyan reklam altyapısı geliştiriyoruz. |
| Subhero | AdOS exists for organizations that need modern AI advertising but cannot — and should not — send their data to someone else’s cloud. | AdOS, modern yapay zekâ reklamına ihtiyaç duyan ancak verisini bir başkasının bulutuna gönderemeyen — ve göndermemesi gereken — kurumlar için vardır. |
| Mission | Our mission is simple: bring the AI to your data, never the other way around. | Misyonumuz basit: yapay zekâyı verinize getirmek, asla tersi değil. |
| Principles title | What we stand for | Neyi savunuyoruz |
| Principle 1 | Sovereignty — you own the models, the data and the hardware. | Egemenlik — modellere, veriye ve donanıma siz sahipsiniz. |
| Principle 2 | Honesty — every claim is backed by a real mechanism. | Dürüstlük — her iddia gerçek bir mekanizmayla desteklenir. |
| Principle 3 | Control — the AI works for you, and you approve every step. | Kontrol — yapay zekâ sizin için çalışır ve her adımı siz onaylarsınız. |

---

## 11. Contact

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | Talk to the AdOS team. | AdOS ekibiyle konuşun. |
| Subhero | Tell us what you need to protect and what you want to achieve. We will match you to the right person. | Neyi korumanız ve neyi başarmanız gerektiğini söyleyin. Sizi doğru kişiyle buluşturalım. |
| Option: Sales | Sales & pricing | Satış ve fiyatlandırma |
| Option: Security | Security briefing | Güvenlik brifingi |
| Option: Support | Customer support | Müşteri desteği |
| Option: Disclosure | Report a vulnerability | Güvenlik açığı bildirin |
| Response note | We reply to enterprise enquiries within two business days. | Kurumsal taleplere iki iş günü içinde yanıt veririz. |
| Field: Name | Full name | Ad soyad |
| Field: Email | Work email | İş e-postası |
| Field: Company | Company | Şirket |
| Field: Message | How can we help? | Nasıl yardımcı olabiliriz? |
| Submit | Send message | Mesajı gönder |

---

## 12. Demo request

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | See AdOS run on your terms. | AdOS’u kendi koşullarınızda görün. |
| Subhero | A short, focused walkthrough with our team — tailored to your industry and your security requirements. | Ekibimizle kısa ve odaklı bir tanıtım — sektörünüze ve güvenlik gereksinimlerinize göre uyarlanmış. |
| Field: Email | Work email | İş e-postası |
| Field: Name | Full name | Ad soyad |
| Field: Company | Company | Şirket |
| Field: Role | Your role | Göreviniz |
| Field: Size | Company size | Şirket büyüklüğü |
| Field: Country | Country / data-residency need | Ülke / veri yerleşimi ihtiyacı |
| Field: Goal | What do you want to protect or achieve? | Neyi korumak ya da başarmak istiyorsunuz? |
| Consent | I agree to the privacy policy. | Gizlilik politikasını kabul ediyorum. |
| Submit | Book my demo | Demomu planla |
| Success title | Your request is in. | Talebiniz alındı. |
| Success body | Thank you. A member of our team will reach out within two business days to arrange your walkthrough. | Teşekkürler. Ekibimizden biri, tanıtımınızı planlamak için iki iş günü içinde sizinle iletişime geçecek. |
| Error | Please check the highlighted fields and try again. | Lütfen işaretli alanları kontrol edip tekrar deneyin. |

---

## 13. Footer

| Element | English | Türkçe |
| --- | --- | --- |
| Positioning line | The Advertising Operating System — enterprise AI advertising that never leaves your building. | Reklam İşletim Sistemi — binanızdan hiç çıkmayan kurumsal yapay zekâ reklamı. |
| Col: Product | Product | Ürün |
| Col: Solutions | Solutions | Çözümler |
| Col: Resources | Resources | Kaynaklar |
| Col: Company | Company | Şirket |
| Col: Legal | Legal | Yasal |
| Cookie prefs | Cookie preferences | Çerez tercihleri |
| Security contact | Report a vulnerability | Güvenlik açığı bildirin |
| Copyright | © [year] AdOS. All rights reserved. | © [yıl] AdOS. Tüm hakları saklıdır. |
| Legal entity | [Legal entity name], [registered address]. | [Yasal tüzel kişi adı], [tescilli adres]. |

---

## 14. 404 & 500

| Element | English | Türkçe |
| --- | --- | --- |
| 404 title | That page isn’t here. | Bu sayfa burada değil. |
| 404 body | The page you’re looking for may have moved. Let’s get you back on track. | Aradığınız sayfa taşınmış olabilir. Sizi yeniden yola koyalım. |
| 404 primary | Back to home | Ana sayfaya dön |
| 404 secondary | Book a demo | Demo talep edin |
| 500 title | Something went wrong. | Bir şeyler ters gitti. |
| 500 body | An unexpected error occurred. Please try again shortly. | Beklenmeyen bir hata oluştu. Lütfen kısa süre sonra tekrar deneyin. |

---

## 15. Legal — Privacy (marketing site)

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | Privacy Policy | Gizlilik Politikası |
| Summary | This policy covers the AdOS marketing website. It explains what we collect when you browse or contact us. The AdOS product runs on your own infrastructure and processes your customer data there — we do not receive it. | Bu politika AdOS pazarlama web sitesini kapsar. Siteyi gezerken ya da bize ulaşırken neleri topladığımızı açıklar. AdOS ürünü kendi altyapınızda çalışır ve müşteri verinizi orada işler — biz onu almayız. |
| Section: What we collect | Contact and demo forms (name, work email, company, message) and consented analytics. | İletişim ve demo formları (ad, iş e-postası, şirket, mesaj) ve onay verilen analitik. |
| Section: Why | To respond to your enquiry and to improve the website. We do not sell your data. | Talebinize yanıt vermek ve web sitesini iyileştirmek için. Verinizi satmayız. |
| Section: Your rights | You may request access, correction or deletion of your data at any time. | Verinize erişim, düzeltme ya da silme talebini istediğiniz zaman iletebilirsiniz. |
| Last updated | Last updated: [date] | Son güncelleme: [tarih] |

---

## 16. Legal — Cookie Policy

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | Cookie Policy | Çerez Politikası |
| Summary | We use strictly-necessary cookies to run the site, and — only with your consent — analytics and preference cookies. You can change your choices at any time. | Siteyi çalıştırmak için kesinlikle gerekli çerezleri, yalnızca onayınızla da analitik ve tercih çerezlerini kullanırız. Seçimlerinizi istediğiniz zaman değiştirebilirsiniz. |
| Category: Necessary | Required for the site to function. Always on. | Sitenin çalışması için gereklidir. Her zaman açıktır. |
| Category: Analytics | Help us understand usage. Off until you accept. | Kullanımı anlamamıza yardımcı olur. Siz kabul edene dek kapalıdır. |
| Category: Preferences | Remember your language and theme. Off until you accept. | Dilinizi ve temanızı hatırlar. Siz kabul edene dek kapalıdır. |
| Banner: title | We respect your choices. | Seçimlerinize saygı duyarız. |
| Banner: body | We use only necessary cookies unless you allow more. | Siz daha fazlasına izin vermedikçe yalnızca gerekli çerezleri kullanırız. |
| Banner: accept | Accept all | Tümünü kabul et |
| Banner: reject | Reject non-essential | Gerekli olmayanları reddet |
| Banner: settings | Manage preferences | Tercihleri yönet |

---

## 17. Legal — Terms of Service

| Element | English | Türkçe |
| --- | --- | --- |
| H1 | Terms of Service | Kullanım Koşulları |
| Summary | These terms govern your use of the AdOS website. Product use is governed by your separate license agreement. | Bu koşullar AdOS web sitesini kullanımınızı düzenler. Ürün kullanımı ayrı lisans sözleşmenizle düzenlenir. |
| Section: Use | Use the site lawfully and do not attempt to disrupt it. | Siteyi hukuka uygun kullanın ve işleyişini bozmaya çalışmayın. |
| Section: IP | All content and marks are the property of AdOS unless stated otherwise. | Aksi belirtilmedikçe tüm içerik ve markalar AdOS’a aittir. |
| Section: Disclaimer | The site is provided “as is,” without warranties, to the extent permitted by law. | Site, yasaların izin verdiği ölçüde, garanti olmaksızın “olduğu gibi” sunulur. |
| Section: Law | These terms are governed by the laws of [jurisdiction]. | Bu koşullar [yargı yeri] yasalarına tabidir. |
| Last updated | Last updated: [date] | Son güncelleme: [tarih] |

---

## Copy guardrails

- No buzzwords, no exclamation marks in body, no unverifiable claims
  (`Constitution §19, §22`).
- Turkish and English carry the same meaning and the same restraint — parity, not
  literal translation.
- Bracketed `[…]` values are placeholders for Legal/Marketing to finalize before
  publish.
- Every security/AI claim maps to a real product mechanism.
