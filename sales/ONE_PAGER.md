# AdOS — Executive One-Pager

*Bilingual executive summary — English first, then Türkçe. Both versions carry identical claims and numbers.*

---

## English

### What is AdOS?
AdOS is an **Enterprise AI Operating System for Advertising** that runs 100% on your own infrastructure. Your data never leaves your building, and it works with no internet at all. It takes a client's advertising objective through a human-approved pipeline and remembers what works, on three pillars: **Company Brain**, **AI-Assisted Campaign Pipeline**, and **Human-Approved Workflows**.

**Sovereign · Capable · Accountable.**

### Problems solved
- Campaign briefs, creative, and budget plans take too long to produce by hand.
- Approvals stall waiting on a person instead of a clear gate.
- What worked in past campaigns is forgotten when a team member leaves.
- Cloud AI means your confidential client data leaves the building — and is metered forever.

### Key capabilities
- **Company Brain** — a private marketing-performance memory. It records CompanyDNA, brand profiles, and campaign→ad→lead→ROI results, then surfaces winning-ad patterns and past-campaign experience so the next draft builds on what actually worked. It learns from your campaign performance, not from a document pile.
- **AI-Assisted Campaign Pipeline** — each stage (marketing brief → creative copy → campaign draft with channels, ad sets, and budget split → performance report → executive dashboard) is drafted by 100% local AI for a human to review. It drafts and plans budgets; it never launches live ads.
- **Human-Approved Workflows** — every stage advances only on an explicit human approval click, with approval gates (strategy & budget, creative assets, campaign launch), an activity log, and a per-approval timeline.

### Local AI
All inference runs on your own hardware through a local engine (Ollama, or any OpenAI-compatible server such as vLLM, LM Studio, llama.cpp, SGLang). Out of the box AdOS runs a deterministic offline generator that needs no model server; connect a local engine for full generative output. No external API, no API keys, no per-token billing — inference cost is your electricity and hardware. You choose and own the model, and can swap it without re-architecting. Honest trade-off: local CPU inference is slower than a hosted frontier API (seconds, not milliseconds); better hardware closes the gap.

### Offline
Offline-first and fully air-gap capable. AdOS operates with no internet connection at all.

### On-Prem
Deploys on-premise or in your private cloud/VPC. You own the entire stack — application, data, and model. No vendor lock-in: open engines, an OpenAI-compatible interface, and portable, exportable data.

### Security
Your data never leaves your premises, so there is no third-party data path to breach. Every stage is human-approved, so no campaign step advances without a person. Real authentication ships in — Argon2id password hashing, HMAC HttpOnly sessions, per-session CSRF, brute-force lockout, and CSP/HSTS headers — and consequential actions are recorded in an activity log with a per-approval timeline. On-prem and air-gap operation directly satisfies data-residency mandates. We describe our architecture and controls honestly and claim no certifications AdOS has not earned.

### Business outcomes
Faster campaign drafts, fewer stalled approvals, retained campaign know-how, and lower cost — with no per-token AI bill. ROI is presented as a model you control, led by payback period and annual savings, anchored on your own numbers.

### Deployment model
Standard Docker with a one-command bring-up. Documented backup, restore, upgrade, and disaster-recovery runbooks ship with the platform. Application-level multi-tenant isolation; full Turkish and English UI. Version 1.0.0. Value-based pricing — platform license plus support, per deployment or per-seat band, never per-token.

### Roadmap (planned — not shipped today)
Document knowledge base with cited answers; autonomous AI agents; live ad launch, optimization, and ad-platform connectors (Meta / Google / TikTok / LinkedIn); enforced role-based permissions and permission-aware AI; immutable audit trail; database-level row-level security; a cloud-inference option; and vision/speech AI. These are future directions, not present capabilities.

### Contact
*(placeholder — to be replaced)*
sales@ados.example · +90 XXX XXX XX XX · ados.example

---

## Türkçe

### AdOS nedir?
AdOS, tamamen kendi altyapınız üzerinde çalışan bir **Reklam için Kurumsal Yapay Zekâ İşletim Sistemi**dir. Verileriniz binanızdan asla çıkmaz ve internet olmadan da çalışır. Bir müşterinin reklam hedefini insan onaylı bir hat boyunca işler ve neyin işe yaradığını hatırlar; üç sütun üzerine kuruludur: **Company Brain**, **Yapay Zekâ Destekli Kampanya Hattı** ve **İnsan Onaylı İş Akışları**.

**Egemen · Yetkin · Hesap verebilir.**

### Çözülen sorunlar
- Kampanya brief'leri, kreatif ve bütçe planları elle üretilince çok uzun sürer.
- Onaylar net bir kapıyı değil, bir kişiyi bekleyerek tıkanır.
- Geçmiş kampanyalarda neyin işe yaradığı, bir ekip üyesi ayrıldığında unutulur.
- Bulut yapay zeka, gizli müşteri verilerinizin binadan çıkması ve sonsuza dek sayaçla ücretlendirilmesi demektir.

### Temel yetenekler
- **Company Brain** — özel bir pazarlama-performansı belleği. CompanyDNA'yı, marka profillerini ve kampanya→reklam→müşteri adayı→ROI sonuçlarını kaydeder; ardından kazanan reklam örüntülerini ve geçmiş kampanya deneyimini öne çıkarır, böylece bir sonraki taslak gerçekten işe yaramış olanın üzerine kurulur. Bir belge yığınından değil, kampanya performansınızdan öğrenir.
- **Yapay Zekâ Destekli Kampanya Hattı** — her aşama (pazarlama brief'i → kreatif metin → kanallar, reklam setleri ve bütçe dağılımı içeren kampanya taslağı → performans raporu → yönetici panosu) %100 yerel yapay zeka tarafından, bir insanın incelemesi için taslak olarak hazırlanır. Taslak üretir ve bütçe planlar; canlı reklam asla yayına almaz.
- **İnsan Onaylı İş Akışları** — her aşama yalnızca açık bir insan onayı tıklamasıyla ilerler; onay kapıları (strateji ve bütçe, kreatif varlıklar, kampanya yayını), bir etkinlik günlüğü ve onay bazında zaman çizelgesi ile.

### Local AI
Tüm çıkarım, yerel bir motor (Ollama veya vLLM, LM Studio, llama.cpp, SGLang gibi OpenAI-uyumlu herhangi bir sunucu) aracılığıyla kendi donanımınızda çalışır. AdOS kutudan çıktığında model sunucusu gerektirmeyen deterministik bir çevrimdışı üretici çalıştırır; tam üretken çıktı için yerel bir motor bağlayın. Dış API yok, API anahtarı yok, token başına ücret yok — çıkarımın maliyeti elektriğiniz ve donanımınızdır. Modeli siz seçer ve sahiplenirsiniz; mimariyi değiştirmeden değiştirebilirsiniz. Dürüst ödünleşim: yerel CPU çıkarımı, barındırılan uç yapay zekadan daha yavaştır (milisaniye değil, saniye); daha iyi donanım bu farkı kapatır.

### Offline (Çevrimdışı)
Önce-çevrimdışı ve tam air-gap uyumludur. AdOS hiçbir internet bağlantısı olmadan çalışır.

### On-Prem (Yerinde)
Yerinde ya da özel bulutunuzda/VPC üzerinde kurulur. Tüm yığının sahibi sizsiniz — uygulama, veri ve model. Tedarikçiye bağımlılık yok: açık motorlar, OpenAI-uyumlu arayüz ve taşınabilir, dışa aktarılabilir veri.

### Güvenlik
Verileriniz binanızdan çıkmadığı için ihlal edilebilecek bir üçüncü taraf veri yolu yoktur. Her aşama insan onaylıdır; hiçbir kampanya adımı bir kişi olmadan ilerlemez. Gerçek kimlik doğrulama gelir — Argon2id parola özetleme, HMAC HttpOnly oturumlar, oturum bazında CSRF, kaba-kuvvet kilidi ve CSP/HSTS başlıkları — ve sonuç doğuran işlemler, onay bazında zaman çizelgesiyle bir etkinlik günlüğüne kaydedilir. Yerinde ve air-gap çalışma, veri ikametgahı zorunluluklarını doğrudan karşılar. Mimarimizi ve kontrollerimizi dürüstçe anlatırız; AdOS'un kazanmadığı hiçbir sertifikayı iddia etmeyiz.

### İş sonuçları
Daha hızlı kampanya taslakları, daha az tıkanan onay, korunan kampanya bilgisi ve daha düşük maliyet — token başına yapay zeka faturası olmadan. ROI, kendi kontrolünüzdeki bir model olarak sunulur; geri ödeme süresi ve yıllık tasarrufla öncülük eder ve kendi rakamlarınıza dayanır.

### Dağıtım modeli
Standart Docker ile tek komutla kurulum. Yedekleme, geri yükleme, yükseltme ve felaket kurtarma için belgelenmiş kılavuzlar platformla birlikte gelir. Uygulama düzeyinde çok kiracılı izolasyon; tam Türkçe ve İngilizce arayüz. Sürüm 1.0.0. Değere dayalı fiyatlandırma — platform lisansı artı destek, dağıtım başına veya koltuk bandı başına, asla token başına değil.

### Yol Haritası (planlanan — bugün mevcut değil)
Kaynak gösteren belge bilgi tabanı; otonom yapay zeka ajanları; canlı reklam yayını, optimizasyonu ve reklam platformu bağlayıcıları (Meta / Google / TikTok / LinkedIn); zorunlu rol tabanlı yetkiler ve yetki-farkında yapay zeka; değiştirilemez denetim izi; veritabanı düzeyinde satır seviyesi güvenlik; bir bulut çıkarımı seçeneği; ve görüntü/konuşma yapay zekası. Bunlar gelecekteki yönlerdir, mevcut yetenekler değildir.

### İletişim
*(yer tutucu — değiştirilecek)*
sales@ados.example · +90 XXX XXX XX XX · ados.example
