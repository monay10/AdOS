# AdOS — Executive One-Pager

*Bilingual executive summary — English first, then Türkçe. Both versions carry identical claims and numbers.*

---

## English

### What is AdOS?
AdOS is an enterprise AI operating system that runs 100% on your own infrastructure. Your data never leaves your building, and it works with no internet at all. It unifies your knowledge, your people, and your daily work under one system built on three pillars: **Company Brain**, **Digital Employees**, and Workflows & Approvals.

**Sovereign · Capable · Accountable.**

### Problems solved
- Answers are buried in documents and take too long to find.
- Approvals stall waiting on a person instead of a rule.
- Institutional knowledge walks out the door when an expert leaves.
- Cloud AI means your confidential data leaves the building — and is metered forever.

### Key capabilities
- **Company Brain** — a private, permission-aware knowledge base. Every AI answer is grounded in your own documents and **cites its sources**, scoped so users and the AI only ever see documents they are entitled to.
- **Digital Employees** — AI agents that answer, draft, route, prepare approvals, and move workflows forward within defined roles and permissions.
- **Workflows & Approvals** — structured processes with tiered approval authority, deterministic routing, and full audit trails.

### Local AI
All inference runs on your own hardware through a local engine (Ollama, or any OpenAI-compatible server such as vLLM, LM Studio, llama.cpp, SGLang). No external API, no API keys, no per-token billing — inference cost is your electricity and hardware. You choose and own the model, and can swap it without re-architecting. Honest trade-off: local CPU inference is slower than a hosted frontier API (seconds, not milliseconds); better hardware closes the gap.

### Offline
Offline-first and fully air-gap capable. AdOS operates with no internet connection at all.

### On-Prem
Deploys on-premise or in your private cloud/VPC. You own the entire stack — application, data, and model. No vendor lock-in: open engines, an OpenAI-compatible interface, and portable, exportable data.

### Security
Your data never leaves your premises, so there is no third-party data path to breach. **Permission-aware AI** can never surface or cite content a user is not authorized to see. Every consequential action is recorded in an immutable audit trail. On-prem and air-gap operation directly satisfies data-residency mandates. We describe our architecture and controls honestly and claim no certifications AdOS has not earned.

### Business outcomes
Faster answers, fewer stalled approvals, retained institutional knowledge, and lower training cost — with no per-token AI bill. ROI is presented as a model you control, led by payback period and annual savings, anchored on your own numbers.

### Deployment model
Standard Docker with a one-command bring-up. Documented backup, restore, upgrade, and disaster-recovery runbooks ship with the platform. Multi-tenant with strict isolation; full Turkish and English UI. Version 1.0.0. Value-based pricing — platform license plus support, per deployment or per-seat band, never per-token.

### Contact
*(placeholder — to be replaced)*
sales@ados.example · +90 XXX XXX XX XX · ados.example

---

## Türkçe

### AdOS nedir?
AdOS, tamamen kendi altyapınız üzerinde çalışan bir kurumsal yapay zeka işletim sistemidir. Verileriniz binanızdan asla çıkmaz ve internet olmadan da çalışır. Kurumunuzun bilgisini, insanını ve günlük işini üç sütun üzerine kurulu tek bir sistemde birleştirir: **Company Brain**, **Digital Employees** ve Workflows & Approvals.

**Egemen · Yetkin · Hesap verebilir.**

### Çözülen sorunlar
- Cevaplar belgelerin içinde kaybolur; bulmak çok uzun sürer.
- Onaylar bir kuralı değil, bir kişiyi bekleyerek tıkanır.
- Bir uzman ayrıldığında kurumsal bilgi de birlikte gider.
- Bulut yapay zeka, gizli verilerinizin binadan çıkması ve sonsuza dek sayaçla ücretlendirilmesi demektir.

### Temel yetenekler
- **Company Brain** — özel, yetki-farkında bir bilgi tabanı. Her yapay zeka cevabı kendi belgelerinize dayanır ve **kaynaklarını gösterir**; kullanıcı ve yapay zeka yalnızca yetkili olunan belgeleri görür.
- **Digital Employees** — tanımlı rol ve yetkiler içinde cevaplayan, taslak hazırlayan, yönlendiren, onayları hazırlayan ve iş akışlarını ilerleten yapay zeka ajanları.
- **Workflows & Approvals** — kademeli onay yetkisi, kurala dayalı yönlendirme ve eksiksiz denetim izi ile yapılandırılmış süreçler.

### Local AI
Tüm çıkarım, yerel bir motor (Ollama veya vLLM, LM Studio, llama.cpp, SGLang gibi OpenAI-uyumlu herhangi bir sunucu) aracılığıyla kendi donanımınızda çalışır. Dış API yok, API anahtarı yok, token başına ücret yok — çıkarımın maliyeti elektriğiniz ve donanımınızdır. Modeli siz seçer ve sahiplenirsiniz; mimariyi değiştirmeden değiştirebilirsiniz. Dürüst ödünleşim: yerel CPU çıkarımı, barındırılan uç yapay zekadan daha yavaştır (milisaniye değil, saniye); daha iyi donanım bu farkı kapatır.

### Offline (Çevrimdışı)
Önce-çevrimdışı ve tam air-gap uyumludur. AdOS hiçbir internet bağlantısı olmadan çalışır.

### On-Prem (Yerinde)
Yerinde ya da özel bulutunuzda/VPC üzerinde kurulur. Tüm yığının sahibi sizsiniz — uygulama, veri ve model. Tedarikçiye bağımlılık yok: açık motorlar, OpenAI-uyumlu arayüz ve taşınabilir, dışa aktarılabilir veri.

### Güvenlik
Verileriniz binanızdan çıkmadığı için ihlal edilebilecek bir üçüncü taraf veri yolu yoktur. **Yetki-farkında yapay zeka**, kullanıcının görmeye yetkili olmadığı içeriği asla açığa çıkaramaz veya kaynak gösteremez. Sonuç doğuran her işlem değiştirilemez bir denetim izine kaydedilir. Yerinde ve air-gap çalışma, veri ikametgahı zorunluluklarını doğrudan karşılar. Mimarimizi ve kontrollerimizi dürüstçe anlatırız; AdOS'un kazanmadığı hiçbir sertifikayı iddia etmeyiz.

### İş sonuçları
Daha hızlı cevaplar, daha az tıkanan onay, korunan kurumsal bilgi ve daha düşük eğitim maliyeti — token başına yapay zeka faturası olmadan. ROI, kendi kontrolünüzdeki bir model olarak sunulur; geri ödeme süresi ve yıllık tasarrufla öncülük eder ve kendi rakamlarınıza dayanır.

### Dağıtım modeli
Standart Docker ile tek komutla kurulum. Yedekleme, geri yükleme, yükseltme ve felaket kurtarma için belgelenmiş kılavuzlar platformla birlikte gelir. Katı izolasyonlu çok kiracılı yapı; tam Türkçe ve İngilizce arayüz. Sürüm 1.0.0. Değere dayalı fiyatlandırma — platform lisansı artı destek, dağıtım başına veya koltuk bandı başına, asla token başına değil.

### İletişim
*(yer tutucu — değiştirilecek)*
sales@ados.example · +90 XXX XXX XX XX · ados.example
