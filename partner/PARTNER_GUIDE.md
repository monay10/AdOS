# AdOS Partner Guide / AdOS İş Ortağı Rehberi

> **Enterprise AI Operating System for Advertising**
> **Reklam için Kurumsal Yapay Zekâ İşletim Sistemi**

| Field | Value |
|---|---|
| **Owner / Sahip** | Partner Enablement / İş Ortağı Etkinleştirme |
| **Status / Durum** | Official — aligned to PRODUCT_TRUTH.md / Resmî — PRODUCT_TRUTH.md ile hizalı |
| **Version / Sürüm** | 1.0.0 · Aligned to AdOS v1.0.0 / AdOS v1.0.0 ile hizalı |
| **Source of truth / Doğruluk kaynağı** | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) |

**Governing references / Yönetici referanslar:**
[PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md) ·
[IMPLEMENTATION_METHODOLOGY.md](IMPLEMENTATION_METHODOLOGY.md) ·
[PARTNER_CERTIFICATION.md](PARTNER_CERTIFICATION.md) ·
[PARTNER_PORTAL_SPEC.md](PARTNER_PORTAL_SPEC.md) ·
[PARTNER_AGREEMENT_TEMPLATE.md](PARTNER_AGREEMENT_TEMPLATE.md)

---

## 0. What AdOS is (and is not) / AdOS nedir (ve ne değildir)

### EN

AdOS is the **Enterprise AI Operating System for Advertising** — an offline-first,
100% local-AI platform. It takes a client's advertising objective (a **Mission**)
through a **human-approved pipeline**: marketing brief → creative (ad copy) →
campaign **draft** → performance report → executive dashboard. It remembers what
works in a marketing-performance **Company Brain**.

Two facts define every honest partner conversation:

1. **AdOS drafts; it never launches live ads.** The campaign draft carries channels,
   ad sets, and budget split, and it never leaves `draft` status. Your customer
   exports the approved draft and runs it in their own ad platform.
2. **AdOS runs on the customer's own infrastructure.** It is self-hosted, offline /
   air-gap capable, with no cloud, no API keys, no per-token billing, no vendor
   telemetry, and no standing vendor access.

Everything you sell, implement, and support flows from those two facts. The full,
code-audited capability list is [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md); it is the
only source for product claims. Anything not in it is either omitted or placed under
an explicit **Roadmap** heading (see §12).

### TR

AdOS, **Reklam için Kurumsal Yapay Zekâ İşletim Sistemi**'dir — önce çevrimdışı
çalışan, %100 yerel yapay zekâ tabanlı bir platformdur. Bir müşterinin reklam
hedefini (bir **Görev / Mission**) **insan onaylı bir hattan** geçirir: pazarlama
brifi → yaratıcı içerik (reklam metni) → kampanya **taslağı** → performans raporu →
yönetici panosu. Neyin işe yaradığını bir pazarlama-performans **Company Brain**
(Şirket Beyni) içinde hatırlar.

Her dürüst iş ortağı görüşmesini iki gerçek tanımlar:

1. **AdOS taslak hazırlar; canlı reklam asla yayınlamaz.** Kampanya taslağı
   kanalları, reklam setlerini ve bütçe dağılımını taşır ve asla `draft` (taslak)
   durumundan çıkmaz. Müşteriniz onaylanan taslağı dışa aktarır ve kendi reklam
   platformunda yürütür.
2. **AdOS müşterinin kendi altyapısında çalışır.** Kendi sunucusunda barındırılır,
   çevrimdışı / hava boşluğu (air-gap) uyumludur; bulut yok, API anahtarı yok,
   jeton başına ücretlendirme yok, tedarikçi telemetrisi yok ve tedarikçinin kalıcı
   erişimi yoktur.

Sattığınız, kurduğunuz ve desteklediğiniz her şey bu iki gerçekten doğar. Kodla
denetlenmiş tam yetenek listesi [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)
belgesindedir; ürün iddiaları için tek kaynak budur. Orada yer almayan her şey ya
belgeden çıkarılır ya da açıkça **Yol Haritası (Roadmap)** başlığı altına konur
(bkz. §12).

---

## 1. Partner onboarding / İş ortağı başlangıcı (onboarding)

### EN

Onboarding brings a new partner from signed agreement to first delivery. It mirrors,
at the partner-organization level, the customer onboarding rigor in
[../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md).

| Step | What happens | Owner | Exit criteria |
|---|---|---|---|
| 1. Agreement | Execute the partner agreement (see [PARTNER_AGREEMENT_TEMPLATE.md](PARTNER_AGREEMENT_TEMPLATE.md)) | Partner + AdOS | Countersigned agreement |
| 2. Enrollment | Register the partner in the program; assign Partner Manager | AdOS | Partner record created |
| 3. Enablement | Certify staff via [PARTNER_CERTIFICATION.md](PARTNER_CERTIFICATION.md) and [../customer-success/CERTIFICATION_PROGRAM.md](../customer-success/CERTIFICATION_PROGRAM.md) | Partner | ≥1 Associate certified |
| 4. Sandbox | Self-host a test instance ([../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md), [../DEPLOYMENT.md](../DEPLOYMENT.md)) | Partner | Working local instance |
| 5. Joint plan | Agree tier goals, pipeline, co-marketing | Partner + AdOS | Signed joint plan |
| 6. Go-live | Partner is production-ready | Both | Registered tier confirmed |

Partner certifications reuse the individual certification levels **Associate →
Professional → Administrator → Architect → Partner → Trainer** defined in the
customer-success program; partner-specific exam content lives in
[PARTNER_CERTIFICATION.md](PARTNER_CERTIFICATION.md).

### TR

Başlangıç süreci, yeni bir iş ortağını imzalı sözleşmeden ilk teslimata taşır.
İş ortağı-kuruluş düzeyinde,
[../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md)
belgesindeki müşteri başlangıç titizliğini yansıtır.

| Adım | Ne olur | Sahip | Çıkış ölçütü |
|---|---|---|---|
| 1. Sözleşme | İş ortağı sözleşmesini imzalayın (bkz. [PARTNER_AGREEMENT_TEMPLATE.md](PARTNER_AGREEMENT_TEMPLATE.md)) | İş ortağı + AdOS | Karşılıklı imzalı sözleşme |
| 2. Kayıt | İş ortağını programa kaydedin; İş Ortağı Yöneticisi atayın | AdOS | İş ortağı kaydı oluşturuldu |
| 3. Etkinleştirme | Personeli [PARTNER_CERTIFICATION.md](PARTNER_CERTIFICATION.md) ve [../customer-success/CERTIFICATION_PROGRAM.md](../customer-success/CERTIFICATION_PROGRAM.md) ile belgelendirin | İş ortağı | ≥1 Associate belgeli |
| 4. Test ortamı | Yerel bir test örneği kurun ([../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md), [../DEPLOYMENT.md](../DEPLOYMENT.md)) | İş ortağı | Çalışan yerel örnek |
| 5. Ortak plan | Kademe hedefleri, satış hattı ve ortak pazarlama üzerinde anlaşın | İş ortağı + AdOS | İmzalı ortak plan |
| 6. Yayına alma | İş ortağı üretime hazır | Her ikisi | Registered kademesi onaylandı |

İş ortağı belgelendirmeleri, müşteri başarısı programında tanımlanan bireysel
belgelendirme düzeylerini yeniden kullanır: **Associate → Professional →
Administrator → Architect → Partner → Trainer**; iş ortağına özel sınav içeriği
[PARTNER_CERTIFICATION.md](PARTNER_CERTIFICATION.md) belgesindedir.

---

## 2. Partner types and responsibilities / İş ortağı türleri ve sorumlulukları

### EN

**Partner types**

| Type | What they do | How they earn |
|---|---|---|
| **Referral Partner** | Refers qualified leads | Referral fee (e.g. 10% of first-year license — illustrative) |
| **Reseller Partner** | Resells licenses / subscriptions at a tier discount | Resale margin |
| **Implementation (Delivery) Partner** | Installs, configures, migrates, trains, and supports on the customer's infrastructure | Services + support revenue (100% retained) |
| **(Roadmap) Technology / ISV Partner** | Builds integrations | Gated on connector APIs — Roadmap only (§12) |

**Partner revenue** comes from four honest sources only: (a) license/subscription
**resale margin**, (b) **implementation & services** revenue the partner keeps in
full, (c) **support / managed-services**, and (d) **referral fees**. AdOS has no
per-token, usage, or cloud-consumption billing, so there is never a cloud markup or
metering line to resell. Services revenue is **100% retained by the partner**.

**Responsibilities by tier** (organizational tiers **Registered → Silver → Gold →
Platinum**; illustrative baselines):

| Tier | Certified staff | References | Commercial standing | Cadence |
|---|---|---|---|---|
| **Registered** | ≥1 Associate | — | Signed agreement; code of conduct accepted | Onboarding complete |
| **Silver** | ≥2 incl. ≥1 Administrator | 1 reference | Meets CSAT baseline | Annual joint plan |
| **Gold** | ≥4 incl. ≥1 Architect + ≥2 Administrator | 3 references | Deal-registration in good standing; active co-marketing | Monthly pipeline sync |
| **Platinum** | ≥8 incl. ≥2 Architect | 6 references | Top CSAT; dedicated AdOS practice | Joint business plan + QBRs |

All numbers above are **illustrative baselines**; the binding requirements live in
[PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md).

### TR

**İş ortağı türleri**

| Tür | Ne yapar | Nasıl kazanır |
|---|---|---|
| **Referral Partner (Yönlendiren)** | Nitelikli müşteri adayları yönlendirir | Yönlendirme ücreti (ör. ilk yıl lisansının %10'u — örnek amaçlı) |
| **Reseller Partner (Bayi)** | Lisans / abonelikleri kademe indirimiyle yeniden satar | Yeniden satış marjı |
| **Implementation (Uygulama/Teslimat) Partner** | Müşterinin altyapısında kurar, yapılandırır, taşır, eğitir ve destekler | Hizmet + destek geliri (%100 elde tutulur) |
| **(Yol Haritası) Technology / ISV Partner** | Entegrasyonlar geliştirir | Konnektör API'lerine bağlıdır — yalnızca Yol Haritası (§12) |

**İş ortağı geliri** yalnızca dört dürüst kaynaktan gelir: (a) lisans/abonelik
**yeniden satış marjı**, (b) iş ortağının tamamını elde tuttuğu **uygulama ve
hizmet** geliri, (c) **destek / yönetilen hizmetler** ve (d) **yönlendirme
ücretleri**. AdOS'ta jeton başına, kullanım veya bulut tüketimi ücretlendirmesi
yoktur; dolayısıyla yeniden satılacak bir bulut kâr payı veya sayaç kalemi asla
yoktur. Hizmet geliri **%100 iş ortağında kalır**.

**Kademeye göre sorumluluklar** (kurumsal kademeler **Registered → Silver → Gold →
Platinum**; örnek amaçlı temel değerler):

| Kademe | Belgeli personel | Referanslar | Ticari durum | Ritim |
|---|---|---|---|---|
| **Registered** | ≥1 Associate | — | İmzalı sözleşme; davranış kuralları kabul | Başlangıç tamamlandı |
| **Silver** | ≥2 (≥1 Administrator dahil) | 1 referans | CSAT temel değerini karşılar | Yıllık ortak plan |
| **Gold** | ≥4 (≥1 Architect + ≥2 Administrator dahil) | 3 referans | Anlaşma kaydı iyi durumda; aktif ortak pazarlama | Aylık satış hattı senkronu |
| **Platinum** | ≥8 (≥2 Architect dahil) | 6 referans | En yüksek CSAT; özel AdOS uygulama ekibi | Ortak iş planı + QBR'ler |

Yukarıdaki tüm sayılar **örnek amaçlı temel değerlerdir**; bağlayıcı gereksinimler
[PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md) belgesindedir.

---

## 3. Sales process / Satış süreci

### EN

The sales motion is **qualify → deal register → propose → close**, and the value
story stays truthful at every step.

1. **Qualify.** Confirm the customer wants an **AI-assisted, human-in-the-loop**
   advertising workflow they run on **their own infrastructure**. Good fit:
   agencies and in-house marketing teams that want AI to draft briefs, ad copy, and
   campaign plans for human approval, with a marketing-performance memory. Poor fit:
   buyers expecting a generic document Q&A system, autonomous "digital employees",
   or a tool that launches and optimizes live ads — none of those exist (§12).
2. **Deal register.** Register the opportunity to earn protection (e.g. a 90-day,
   renewable window — illustrative) per
   [PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md). Registration
   also unlocks tier pricing.
3. **Propose.** Build the proposal per §7. Scope license/subscription, services
   (implementation, training, support), and the self-hosting footprint.
4. **Close.** Execute the order and the agreement
   ([PARTNER_AGREEMENT_TEMPLATE.md](PARTNER_AGREEMENT_TEMPLATE.md)); confirm
   licensing is commercial/contractual (there is no in-product license-enforcement
   server). Hand off to delivery (§4).

**The truthful value story.** Sell what the code does: local/offline AI, no cloud
and no API keys, no per-token billing, a human-approved brief → creative → campaign
**draft** → report → executive-dashboard pipeline, deterministic ad KPIs
(CTR/CPC/CPA/CPL/ROAS/ROI), a marketing-performance Company Brain, application-level
multi-tenant isolation, real auth, and bilingual TR/EN. Never promise live ad
launch, document Q&A with citations, autonomous agents, external connectors,
enforced RBAC, or an immutable audit trail — those are §12 Roadmap.

### TR

Satış hareketi **niteleme → anlaşma kaydı → teklif → kapanış** şeklindedir ve değer
hikâyesi her adımda dürüst kalır.

1. **Niteleme.** Müşterinin, **kendi altyapısında** çalıştıracağı **yapay zekâ
   destekli, döngüde insan bulunan** bir reklam iş akışı istediğini doğrulayın.
   İyi uyum: yapay zekânın brif, reklam metni ve kampanya planlarını insan onayına
   sunmak üzere taslak hazırlamasını isteyen, pazarlama-performans hafızası arayan
   ajanslar ve şirket içi pazarlama ekipleri. Zayıf uyum: genel bir belge soru-yanıt
   sistemi, otonom "dijital çalışanlar" veya canlı reklam yayınlayıp optimize eden
   bir araç bekleyen alıcılar — bunların hiçbiri mevcut değildir (§12).
2. **Anlaşma kaydı.** Koruma kazanmak için fırsatı kaydedin (ör. 90 günlük,
   yenilenebilir pencere — örnek amaçlı),
   [PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md) uyarınca.
   Kayıt ayrıca kademe fiyatlandırmasını açar.
3. **Teklif.** Teklifi §7'ye göre hazırlayın. Lisans/aboneliği, hizmetleri
   (uygulama, eğitim, destek) ve kendi sunucuda barındırma kapsamını belirleyin.
4. **Kapanış.** Siparişi ve sözleşmeyi imzalayın
   ([PARTNER_AGREEMENT_TEMPLATE.md](PARTNER_AGREEMENT_TEMPLATE.md)); lisanslamanın
   ticari/sözleşmesel olduğunu doğrulayın (ürün içi bir lisans-uygulama sunucusu
   yoktur). Teslimata devredin (§4).

**Dürüst değer hikâyesi.** Kodun yaptığını satın: yerel/çevrimdışı yapay zekâ,
bulut ve API anahtarı yok, jeton başına ücret yok, insan onaylı brif → yaratıcı →
kampanya **taslağı** → rapor → yönetici panosu hattı, deterministik reklam KPI'ları
(CTR/CPC/CPA/CPL/ROAS/ROI), pazarlama-performans Company Brain, uygulama düzeyinde
çok kiracılı yalıtım, gerçek kimlik doğrulama ve iki dilli TR/EN. Canlı reklam
yayını, alıntılı belge soru-yanıt, otonom ajanlar, harici konnektörler, uygulanan
RBAC veya değiştirilemez denetim kaydı asla vaat etmeyin — bunlar §12 Yol
Haritası'dır.

---

## 4. Implementation process / Uygulama süreci

### EN

Delivery follows the fixed **10-phase methodology**. This is a summary; the full
objectives, deliverables, roles, and entry/exit criteria per phase are in
[IMPLEMENTATION_METHODOLOGY.md](IMPLEMENTATION_METHODOLOGY.md).

| # | Phase | Focus | Key references |
|---|---|---|---|
| 1 | **Discovery** | Objectives, stakeholders, environment | — |
| 2 | **Planning** | Scope, schedule, roles, risks | — |
| 3 | **Installation** | Self-hosted install on customer infra | [../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md), [../DEPLOYMENT.md](../DEPLOYMENT.md) |
| 4 | **Configuration** | Tenancy, auth, optional persistence, local AI engine | [../DEPLOYMENT.md](../DEPLOYMENT.md) |
| 5 | **Migration** | Import existing brand/product/client data | — |
| 6 | **Training** | Admin + end-user enablement | [../customer-success/ADMINISTRATOR_TRAINING.md](../customer-success/ADMINISTRATOR_TRAINING.md), [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md) |
| 7 | **Go-live** | First real Missions in production | [../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md) |
| 8 | **Hypercare** | Heightened support just after go-live | [../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md) |
| 9 | **Acceptance** | Sign-off against agreed criteria | [../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md) |
| 10 | **Closure** | Handover to run/support; lessons learned | [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md) |

**Delivery roles:** Engagement Lead (partner PM/owner), Solution Architect,
Implementation Consultant, Trainer, Support Engineer; on the customer side an
Executive Sponsor and an Admin/Champion. Installation and Configuration map to the
real self-hosted setup — there is no vendor cloud to provision.

### TR

Teslimat, sabit **10 fazlı metodolojiyi** izler. Bu bir özettir; her fazın tam
amaçları, çıktıları, rolleri ve giriş/çıkış ölçütleri
[IMPLEMENTATION_METHODOLOGY.md](IMPLEMENTATION_METHODOLOGY.md) belgesindedir.

| # | Faz | Odak | Temel referanslar |
|---|---|---|---|
| 1 | **Discovery (Keşif)** | Hedefler, paydaşlar, ortam | — |
| 2 | **Planning (Planlama)** | Kapsam, takvim, roller, riskler | — |
| 3 | **Installation (Kurulum)** | Müşteri altyapısında kendi sunucuda kurulum | [../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md), [../DEPLOYMENT.md](../DEPLOYMENT.md) |
| 4 | **Configuration (Yapılandırma)** | Kiracılık, kimlik doğrulama, opsiyonel kalıcılık, yerel YZ motoru | [../DEPLOYMENT.md](../DEPLOYMENT.md) |
| 5 | **Migration (Taşıma)** | Mevcut marka/ürün/müşteri verisini içe aktarma | — |
| 6 | **Training (Eğitim)** | Yönetici + son kullanıcı etkinleştirme | [../customer-success/ADMINISTRATOR_TRAINING.md](../customer-success/ADMINISTRATOR_TRAINING.md), [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md) |
| 7 | **Go-live (Yayına alma)** | Üretimde ilk gerçek Görevler | [../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md) |
| 8 | **Hypercare (Yoğun bakım)** | Yayın sonrası yükseltilmiş destek | [../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md) |
| 9 | **Acceptance (Kabul)** | Anlaşılan ölçütlere göre onay | [../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md) |
| 10 | **Closure (Kapanış)** | İşletme/desteğe devir; öğrenilen dersler | [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md) |

**Teslimat rolleri:** Engagement Lead (iş ortağı proje yöneticisi/sahibi), Solution
Architect, Implementation Consultant, Trainer, Support Engineer; müşteri tarafında
bir Executive Sponsor ve bir Admin/Champion. Installation ve Configuration, gerçek
kendi-sunucuda kuruluma karşılık gelir — sağlanacak bir tedarikçi bulutu yoktur.

---

## 5. Support model / Destek modeli

### EN

AdOS is self-hosted, so support is a partnership: the **partner fronts Tier-1**
support to the customer, and escalates to the **vendor for Tier-2** and product
defects. The vendor SLA is a **response** target, not a remote fix — **the vendor
has no standing access** to customer instances. Severity levels reuse
[../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md).

| Severity | Meaning | Fronted by |
|---|---|---|
| **Sev 1** | Production down / no viable workaround | Partner Tier-1 → vendor Tier-2 |
| **Sev 2** | Major function impaired; workaround exists | Partner Tier-1 → vendor Tier-2 |
| **Sev 3** | Minor / limited impact | Partner Tier-1 |
| **Sev 4** | Question, cosmetic, or enhancement request | Partner Tier-1 |

Because there is no vendor telemetry and no phone-home, the partner gathers logs and
reproduction details from the self-hosted instance before escalating. Support and
managed-services revenue is retained by the partner.

### TR

AdOS kendi sunucuda barındırılır; bu nedenle destek bir ortaklıktır: **iş ortağı
müşteriye Tier-1** desteği sağlar ve **Tier-2 ile ürün kusurları için tedarikçiye**
yükseltir. Tedarikçi SLA'sı bir **yanıt** hedefidir, uzaktan onarım değildir —
**tedarikçinin müşteri örneklerine kalıcı erişimi yoktur**. Önem düzeyleri
[../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md)
belgesinden yeniden kullanılır.

| Önem | Anlamı | Sağlayan |
|---|---|---|
| **Sev 1** | Üretim durdu / uygulanabilir geçici çözüm yok | İş ortağı Tier-1 → tedarikçi Tier-2 |
| **Sev 2** | Önemli işlev bozuk; geçici çözüm var | İş ortağı Tier-1 → tedarikçi Tier-2 |
| **Sev 3** | Küçük / sınırlı etki | İş ortağı Tier-1 |
| **Sev 4** | Soru, kozmetik veya geliştirme talebi | İş ortağı Tier-1 |

Tedarikçi telemetrisi ve eve-arama olmadığı için, iş ortağı yükseltmeden önce
kendi-sunucuda barındırılan örnekten günlükleri ve yeniden üretim ayrıntılarını
toplar. Destek ve yönetilen hizmet geliri iş ortağında kalır.

---

## 6. Escalation / Yükseltme

### EN

Escalation moves an issue from partner Tier-1 to vendor Tier-2 when it is a product
defect, a Sev 1/Sev 2 with no partner-side workaround, or a security matter.

1. **Reproduce and package.** Confirm the issue, capture logs, version, environment,
   and steps. (No vendor telemetry exists — the partner supplies the evidence.)
2. **Set severity** per §5 and the shared
   [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md).
3. **Escalate to vendor Tier-2** through the program channel described in
   [PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md); the vendor
   responds within the SLA target and advises — it does not gain standing access.
4. **Disaster / data-loss events** follow
   [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md) and the customer's own backups
   ([../BACKUP_GUIDE.md](../BACKUP_GUIDE.md)).
5. **Commercial or relationship escalations** go to the Partner Manager and, if
   needed, the joint QBR.

### TR

Yükseltme, bir sorun ürün kusuru, iş ortağı tarafında geçici çözümü olmayan bir
Sev 1/Sev 2 veya bir güvenlik meselesi olduğunda konuyu iş ortağı Tier-1'den
tedarikçi Tier-2'ye taşır.

1. **Yeniden üret ve paketle.** Sorunu doğrulayın; günlükleri, sürümü, ortamı ve
   adımları yakalayın. (Tedarikçi telemetrisi yoktur — kanıtı iş ortağı sağlar.)
2. **Önem düzeyini belirleyin**, §5 ve ortak
   [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md)
   uyarınca.
3. **Tedarikçi Tier-2'ye yükseltin**,
   [PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md) belgesindeki
   program kanalı üzerinden; tedarikçi SLA hedefi içinde yanıt verir ve yol gösterir
   — kalıcı erişim kazanmaz.
4. **Felaket / veri kaybı olayları**
   [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md) belgesini ve müşterinin kendi
   yedeklerini ([../BACKUP_GUIDE.md](../BACKUP_GUIDE.md)) izler.
5. **Ticari veya ilişki yükseltmeleri** İş Ortağı Yöneticisine ve gerekirse ortak
   QBR'ye gider.

---

## 7. Proposal process / Teklif süreci

### EN

A proposal packages the truthful value story into a scoped, priced offer.

| Element | Content |
|---|---|
| **Solution scope** | The human-approved pipeline the customer will use; explicitly note it produces campaign **drafts**, self-hosted |
| **Licensing** | License/subscription at tier pricing (commercial/contractual; no in-product entitlement server) |
| **Services** | Implementation (10-phase, §4), migration, training, support — priced and 100% retained by the partner |
| **Infrastructure** | Customer's self-hosted footprint; local AI engine choice ([../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md)) |
| **Commercials** | Resale margin / referral fee / services; **no** cloud, usage, or per-token line |
| **Assumptions & Roadmap** | Any Roadmap-dependent request is labeled Roadmap (§12), never sold as shipped |

Keep every capability claim traceable to [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md).
If a prospect asks for something in §12, propose the shipped equivalent (e.g.
"export the approved draft to run in your ad platform" instead of "AdOS launches
your ads") and mark the rest Roadmap.

### TR

Bir teklif, dürüst değer hikâyesini kapsamı ve fiyatı belirlenmiş bir öneriye
dönüştürür.

| Öğe | İçerik |
|---|---|
| **Çözüm kapsamı** | Müşterinin kullanacağı insan onaylı hat; kampanya **taslakları** ürettiğini ve kendi sunucuda barındırıldığını açıkça belirtin |
| **Lisanslama** | Kademe fiyatıyla lisans/abonelik (ticari/sözleşmesel; ürün içi yetkilendirme sunucusu yok) |
| **Hizmetler** | Uygulama (10 fazlı, §4), taşıma, eğitim, destek — fiyatlanır ve %100 iş ortağında kalır |
| **Altyapı** | Müşterinin kendi-sunucuda kapsamı; yerel YZ motoru seçimi ([../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md)) |
| **Ticari koşullar** | Yeniden satış marjı / yönlendirme ücreti / hizmetler; bulut, kullanım veya jeton kalemi **yok** |
| **Varsayımlar & Yol Haritası** | Yol Haritasına bağlı her talep Yol Haritası olarak etiketlenir (§12), asla mevcut gibi satılmaz |

Her yetenek iddiasını [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) ile izlenebilir
tutun. Aday müşteri §12'deki bir şeyi isterse, mevcut karşılığını önerin (ör.
"AdOS reklamlarınızı yayınlar" yerine "onaylanan taslağı reklam platformunuzda
yürütmek üzere dışa aktarın") ve gerisini Yol Haritası olarak işaretleyin.

---

## 8. Customer success / Müşteri başarısı

### EN

After go-live, the partner owns the customer relationship: hand-off, adoption, and
health. All health metrics are **customer-shared / partner-reported** — AdOS emits
no vendor telemetry and the vendor has no standing access, so nothing is
auto-collected from the customer's instance.

- **Hand-off.** Move cleanly from delivery to run using the closure checklist (§4)
  and [../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md).
- **Adoption.** Drive real usage: repeated Missions through the human-approved
  pipeline, exported drafts run in the customer's ad platform, and a growing
  Company Brain of marketing-performance memory. Reinforce with
  [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md).
- **Health.** Track customer-shared adoption and CSAT signals per
  [../customer-success/CUSTOMER_HEALTH.md](../customer-success/CUSTOMER_HEALTH.md);
  review in the QBR cadence (monthly pipeline sync → quarterly business review →
  annual tier review).

### TR

Yayına alma sonrasında müşteri ilişkisinin sahibi iş ortağıdır: devir, benimseme ve
sağlık. Tüm sağlık metrikleri **müşteri-paylaşımlı / iş ortağı-raporlu**'dur — AdOS
tedarikçi telemetrisi yaymaz ve tedarikçinin kalıcı erişimi yoktur; dolayısıyla
müşterinin örneğinden hiçbir şey otomatik toplanmaz.

- **Devir.** Kapanış kontrol listesini (§4) ve
  [../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md)
  belgesini kullanarak teslimattan işletmeye temiz geçin.
- **Benimseme.** Gerçek kullanımı teşvik edin: insan onaylı hattan tekrarlanan
  Görevler, müşterinin reklam platformunda yürütülen dışa aktarılmış taslaklar ve
  giderek büyüyen bir pazarlama-performans Company Brain hafızası.
  [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md)
  ile pekiştirin.
- **Sağlık.** Müşteri-paylaşımlı benimseme ve CSAT sinyallerini
  [../customer-success/CUSTOMER_HEALTH.md](../customer-success/CUSTOMER_HEALTH.md)
  uyarınca izleyin; QBR ritminde gözden geçirin (aylık satış hattı senkronu →
  üç aylık iş değerlendirmesi → yıllık kademe değerlendirmesi).

---

## 9. Renewal / Yenileme

### EN

Renewal is earned through delivered value and healthy adoption, reviewed at the
**annual tier review + renewal**.

1. **Renewal readiness.** 90+ days out, review customer-shared health, open Sev
   items, and outstanding services.
2. **Value recap.** Summarize Missions completed, drafts produced and exported, and
   Company Brain growth — customer-shared numbers only.
3. **Commercials.** Renew the license/subscription at the appropriate tier discount;
   confirm support terms. There is no usage true-up because there is no usage
   metering.
4. **Execute.** Renew per the agreement
   ([PARTNER_AGREEMENT_TEMPLATE.md](PARTNER_AGREEMENT_TEMPLATE.md)); log it in deal
   registration and the QBR.

### TR

Yenileme, teslim edilen değer ve sağlıklı benimseme yoluyla kazanılır ve **yıllık
kademe değerlendirmesi + yenileme**'de gözden geçirilir.

1. **Yenileme hazırlığı.** 90+ gün önce müşteri-paylaşımlı sağlığı, açık Sev
   kalemlerini ve bekleyen hizmetleri inceleyin.
2. **Değer özeti.** Tamamlanan Görevleri, üretilen ve dışa aktarılan taslakları ve
   Company Brain büyümesini özetleyin — yalnızca müşteri-paylaşımlı sayılar.
3. **Ticari koşullar.** Lisans/aboneliği uygun kademe indirimiyle yenileyin; destek
   şartlarını onaylayın. Kullanım sayacı olmadığından kullanım denkleştirmesi yoktur.
4. **İmzalama.** Sözleşme uyarınca yenileyin
   ([PARTNER_AGREEMENT_TEMPLATE.md](PARTNER_AGREEMENT_TEMPLATE.md)); anlaşma kaydına
   ve QBR'ye işleyin.

---

## 10. Expansion / Genişleme

### EN

Expansion grows the account within what the product truthfully does today.

- **More workspaces / clients / brands.** The domain model (Workspace → Client →
  Brand → Product → Project → Mission) scales to more teams and brands under the
  same self-hosted instance.
- **More seats and enablement.** Additional users and admins, backed by
  [../customer-success/ADMINISTRATOR_TRAINING.md](../customer-success/ADMINISTRATOR_TRAINING.md)
  and [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md).
- **More services.** Deeper implementation, managed support, and Company-Brain
  maturation as marketing-performance memory accumulates.
- **Higher partner tier.** Successful expansion builds the references and CSAT that
  move the partner Registered → Silver → Gold → Platinum (§2).

Expansion never relies on a Roadmap capability (§12). If a growth idea needs live ad
launch, connectors, or document Q&A, position it as future direction, not a
committed upsell.

### TR

Genişleme, ürünün bugün dürüstçe yaptığı şeyler içinde hesabı büyütür.

- **Daha fazla çalışma alanı / müşteri / marka.** Alan modeli (Workspace → Client →
  Brand → Product → Project → Mission) aynı kendi-sunucuda örnek altında daha fazla
  ekibe ve markaya ölçeklenir.
- **Daha fazla koltuk ve etkinleştirme.** Ek kullanıcılar ve yöneticiler,
  [../customer-success/ADMINISTRATOR_TRAINING.md](../customer-success/ADMINISTRATOR_TRAINING.md)
  ve [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md)
  ile desteklenir.
- **Daha fazla hizmet.** Daha derin uygulama, yönetilen destek ve pazarlama-performans
  hafızası biriktikçe Company Brain olgunlaşması.
- **Daha yüksek iş ortağı kademesi.** Başarılı genişleme, iş ortağını Registered →
  Silver → Gold → Platinum'a taşıyan referansları ve CSAT'ı oluşturur (§2).

Genişleme asla bir Yol Haritası yeteneğine dayanmaz (§12). Bir büyüme fikri canlı
reklam yayını, konnektörler veya belge soru-yanıt gerektiriyorsa, bunu taahhüt
edilmiş bir ek satış değil, gelecekteki yön olarak konumlandırın.

---

## 11. Brand usage / Marka kullanımı

### EN

- **Product name.** The product is **AdOS**. Its category is **"Enterprise AI
  Operating System for Advertising."** Never rename it and **never** use the
  forbidden label **"Advertising Operating System."**
- **Turkish name.** Use **"Reklam için Kurumsal Yapay Zekâ İşletim Sistemi."**
  **Never** use **"Reklam İşletim Sistemi."** Keep correct Turkish diacritics
  (İ/ı/ş/ğ/ç/ö/ü).
- **Logo & marks.** Use approved logos and marks unmodified, with clear space and
  correct color; do not alter, recolor, or combine them into a partner lockup
  without written approval per
  [PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md).
- **Partner identity.** Describe yourself as an AdOS partner at your tier (e.g.
  "Gold Implementation Partner"). Do not imply you are AdOS or the vendor.
- **Truthful claims only.** Marketing and proposals must match
  [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md): no live ad launch, no document Q&A with
  citations, no autonomous "digital employees", no immutable audit trail — such
  items appear only under Roadmap (§12).

### TR

- **Ürün adı.** Ürün **AdOS**'tur. Kategorisi **"Reklam için Kurumsal Yapay Zekâ
  İşletim Sistemi"**'dir. Adını asla değiştirmeyin ve yasak etiketi **"Reklam
  İşletim Sistemi"**'ni **asla** kullanmayın. (İngilizce yasak etiket: "Advertising
  Operating System".)
- **Türkçe ad.** **"Reklam için Kurumsal Yapay Zekâ İşletim Sistemi"** kullanın.
  **"Reklam İşletim Sistemi"**'ni **asla** kullanmayın. Türkçe diakritikleri doğru
  koruyun (İ/ı/ş/ğ/ç/ö/ü).
- **Logo & işaretler.** Onaylı logo ve işaretleri değiştirmeden, yeterli boşluk ve
  doğru renkle kullanın; yazılı onay olmadan değiştirmeyin, yeniden
  renklendirmeyin veya bir iş ortağı kilidine birleştirmeyin,
  [PARTNER_PROGRAM_CONSTITUTION.md](PARTNER_PROGRAM_CONSTITUTION.md) uyarınca.
- **İş ortağı kimliği.** Kendinizi kademenizde bir AdOS iş ortağı olarak tanımlayın
  (ör. "Gold Implementation Partner"). AdOS veya tedarikçi olduğunuzu ima etmeyin.
- **Yalnızca dürüst iddialar.** Pazarlama ve teklifler
  [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) ile eşleşmelidir: canlı reklam yayını
  yok, alıntılı belge soru-yanıt yok, otonom "dijital çalışanlar" yok, değiştirilemez
  denetim kaydı yok — bu tür öğeler yalnızca Yol Haritası altında görünür (§12).

---

## 12. Roadmap / Yol Haritası

> ⚠️ **Roadmap — not available today. Do NOT sell, propose, or imply these as
> shipped.** They are directional only and may change. Ship-state is defined solely
> by [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md); planned direction is tracked in
> [../ROADMAP.md](../ROADMAP.md).
>
> ⚠️ **Yol Haritası — bugün mevcut değil. Bunları mevcutmuş gibi SATMAYIN, teklif
> etmeyin veya ima etmeyin.** Yalnızca yönseldir ve değişebilir. Mevcut durum
> yalnızca [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) ile tanımlanır; planlanan yön
> [../ROADMAP.md](../ROADMAP.md) belgesinde izlenir.

### EN

The following are **Roadmap / Planned / Future** and must never be presented as
present-tense capability:

- Document knowledge base / document Q&A / cited answers over documents.
- "Digital Employees" / autonomous AI agents that do knowledge work.
- Live ad launch, publishing, or optimization to ad platforms (Meta/Google/TikTok/
  LinkedIn). Today AdOS produces **drafts** the customer exports and runs themselves.
- External integrations / connectors / syncs (ad platforms, CRMs, data warehouses);
  the (Roadmap) Technology/ISV partner track is gated on these.
- Enforced RBAC / permission-aware AI (roles exist but are not enforced).
- Immutable / tamper-proof audit trail.
- DB-level Row-Level Security.
- Cloud / SaaS / hosted AI inference.
- Vision / speech / image / video AI.
- Tiered T0–T4 approval authority (only approval gates exist today).
- In-product license-enforcement / entitlement server (licensing is contractual).

### TR

Aşağıdakiler **Yol Haritası / Planlanan / Gelecek** kapsamındadır ve asla mevcut
yetenek olarak sunulmamalıdır:

- Belge bilgi tabanı / belge soru-yanıt / belgeler üzerinde alıntılı yanıtlar.
- Bilgi işi yapan "Dijital Çalışanlar" / otonom yapay zekâ ajanları.
- Reklam platformlarına (Meta/Google/TikTok/LinkedIn) canlı reklam yayını,
  yayımlama veya optimizasyon. Bugün AdOS, müşterinin dışa aktarıp kendisinin
  yürüttüğü **taslaklar** üretir.
- Harici entegrasyonlar / konnektörler / senkronlar (reklam platformları, CRM'ler,
  veri ambarları); (Yol Haritası) Technology/ISV iş ortağı yolu bunlara bağlıdır.
- Uygulanan RBAC / izin duyarlı yapay zekâ (roller vardır ancak uygulanmaz).
- Değiştirilemez / kurcalamaya dayanıklı denetim kaydı.
- Veritabanı düzeyinde Satır Düzeyi Güvenlik (RLS).
- Bulut / SaaS / barındırılan yapay zekâ çıkarımı.
- Görüntü / konuşma / imge / video yapay zekâsı.
- Kademeli T0–T4 onay yetkisi (bugün yalnızca onay kapıları vardır).
- Ürün içi lisans-uygulama / yetkilendirme sunucusu (lisanslama sözleşmeseldir).

---

## Footer / Alt bilgi

**EN —** Documentation only. No application code, packages, domains, or tests were
modified. Aligned to PRODUCT_TRUTH.md.

**TR —** Yalnızca dokümantasyon. Hiçbir uygulama kodu, paket, alan (domain) veya
test değiştirilmemiştir. PRODUCT_TRUTH.md ile hizalıdır.
