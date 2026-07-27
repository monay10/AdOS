# AdOS — Administrator Training / Yönetici Eğitimi

**Course:** Official Administrator Training — AdOS (Enterprise AI Operating System for Advertising)
**Ders:** Resmî Yönetici Eğitimi — AdOS (Reklam için Kurumsal Yapay Zekâ İşletim Sistemi)

| Field | Value |
| --- | --- |
| **Owner** | Enablement / Training |
| **Status** | Official — aligned to PRODUCT_TRUTH.md |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Source of truth** | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) |
| **Language** | Bilingual — English + Türkçe (full parity) |
| **Maps to certification** | **Administrator** level (see [CERTIFICATION_PROGRAM.md](CERTIFICATION_PROGRAM.md)) |

> **About this course / Bu ders hakkında.** This is the official curriculum for the
> **Administrator** certification. It is bilingual: every module is presented first
> in English (**### EN**) and then in Turkish (**### TR**) with full parity. It
> references only capabilities that exist in the product today, per
> `PRODUCT_TRUTH.md`. Future capabilities appear **only** in the clearly labeled
> **Roadmap** section at the end.
>
> Bu, **Yönetici (Administrator)** sertifikasyonunun resmî müfredatıdır. İki dillidir:
> her modül önce İngilizce (**### EN**), ardından Türkçe (**### TR**) olarak, tam
> içerik eşitliğiyle sunulur. Yalnızca ürünün bugün sahip olduğu yetenekleri,
> `PRODUCT_TRUTH.md` belgesine bağlı kalarak anlatır. Gelecekteki yetenekler **yalnızca**
> sonundaki açıkça etiketlenmiş **Yol Haritası (Roadmap)** bölümünde yer alır.

---

## What AdOS is (grounding for administrators) / AdOS nedir (yöneticiler için temel)

### EN

**AdOS is the Enterprise AI Operating System for Advertising** — an offline-first,
**100% local-AI** platform. A client states an advertising objective (a **Mission**)
in natural language, and AdOS runs it through a **human-approved pipeline**:
marketing brief → creative (ad copy) → campaign **draft** → performance report →
executive dashboard. It **drafts**; it never launches live ads. It remembers what
works in a marketing-performance **Company Brain**.

As an administrator you own the parts that make this trustworthy and durable:
installation, configuration, the **local** AI engine, security, backups,
monitoring, troubleshooting, reporting, and day-2 operations. Core truths you must
internalize:

- **AI is 100% local.** The default is a deterministic **OfflineAIManager** that
  needs **no** model server, no network, no cloud, no API key, no per-token
  billing. For genuine model prose you attach a **local** engine — Ollama or any
  OpenAI-compatible local server (vLLM / LM Studio / llama.cpp / SGLang).
- **Persistence is optional/opt-in.** In-memory by default; durable storage
  (SQLite or Postgres) engages only when `DATABASE_URL` is set.
- **Isolation is application-level multi-tenant** (ambient `TenantContext`, every
  query scoped by `tenant_id`) — not database-level RLS.
- **Security is real and built in** — Argon2id, HMAC HttpOnly sessions, per-session
  CSRF, brute-force lockout, CSP/HSTS.
- **Monitoring is an activity log + per-approval timeline + structured logs /
  metrics** — not an immutable audit trail.
- **Roles exist but RBAC is not enforced.** Do not teach users that permissions
  restrict what the AI surfaces; they do not (see Module 4).

### TR

**AdOS, Reklam için Kurumsal Yapay Zekâ İşletim Sistemi'dir** — çevrimdışı öncelikli,
**%100 yerel yapay zekâ** çalışan bir platform. Bir müşteri, doğal dilde bir reklam
hedefi (bir **Mission / Görev**) belirtir ve AdOS bunu **insan onaylı bir hat** üzerinden
işler: pazarlama brifi → yaratıcı içerik (reklam metni) → kampanya **taslağı** →
performans raporu → yönetici panosu. AdOS **taslak üretir**; canlı reklam asla
başlatmaz. Neyin işe yaradığını, pazarlama performansı odaklı bir **Company Brain
(Şirket Beyni)** içinde hatırlar.

Yönetici olarak, bunu güvenilir ve kalıcı kılan parçaların sahibisiniz: kurulum,
yapılandırma, **yerel** yapay zekâ motoru, güvenlik, yedekleme, izleme, sorun giderme,
raporlama ve gün-2 operasyonları. İçselleştirmeniz gereken temel gerçekler:

- **Yapay zekâ %100 yereldir.** Varsayılan, **hiçbir** model sunucusu, ağ, bulut, API
  anahtarı veya jeton başına ücretlendirme gerektirmeyen, belirlenimci (deterministic)
  bir **OfflineAIManager**'dır. Gerçek model metni için **yerel** bir motor
  bağlarsınız — Ollama veya herhangi bir OpenAI uyumlu yerel sunucu (vLLM / LM Studio
  / llama.cpp / SGLang).
- **Kalıcılık isteğe bağlıdır / opt-in'dir.** Varsayılan olarak bellek içidir; kalıcı
  depolama (SQLite veya Postgres) yalnızca `DATABASE_URL` ayarlandığında devreye girer.
- **İzolasyon uygulama düzeyinde çok kiracılıdır (multi-tenant)** (ortam `TenantContext`,
  her sorgu `tenant_id` ile kapsanır) — veritabanı düzeyinde RLS değildir.
- **Güvenlik gerçektir ve yerleşiktir** — Argon2id, HMAC HttpOnly oturumlar, oturum başına
  CSRF, kaba kuvvet (brute-force) kilitleme, CSP/HSTS.
- **İzleme; bir etkinlik günlüğü + onay başına zaman çizelgesi + yapılandırılmış
  günlükler / metriklerdir** — değiştirilemez (immutable) bir denetim izi değildir.
- **Roller vardır ama RBAC uygulanmaz (enforce edilmez).** Kullanıcılara izinlerin,
  yapay zekânın neyi göstereceğini kısıtladığını öğretmeyin; kısıtlamaz (bkz. Modül 4).

---

## Course map / Ders haritası

| # | Module (EN) | Modül (TR) |
| --- | --- | --- |
| 1 | Installation & Deployment | Kurulum ve Dağıtım |
| 2 | Configuration (workspace/tenancy, env) | Yapılandırma (çalışma alanı/kiracılık, ortam değişkenleri) |
| 3 | AI (local engines) | Yapay Zekâ (yerel motorlar) |
| 4 | Security | Güvenlik |
| 5 | Backup | Yedekleme |
| 6 | Monitoring | İzleme |
| 7 | Troubleshooting | Sorun Giderme |
| 8 | Reporting | Raporlama |
| 9 | Operations | Operasyonlar |
| — | Assessment & Certification | Değerlendirme ve Sertifikasyon |
| — | Roadmap | Yol Haritası |

---

## Module 1 — Installation & Deployment / Modül 1 — Kurulum ve Dağıtım

### EN

**Learning objectives**

- List the runtime requirements and the three deployment modes (Dev / Staging /
  Production).
- Install, build, and run AdOS offline with in-memory data.
- Promote a deployment to production hardening (password auth, HTTPS/HSTS,
  persistence, local model).
- Identify the three runnable processes: Web, Worker, Ops.

**Key steps**

1. **Requirements:** Node.js ≥ 20 (built-in `node:sqlite`), pnpm 9. Optional:
   Docker (production stack), a local inference engine (Ollama or OpenAI-compatible),
   PostgreSQL (durable persistence).
2. **Install & build:**
   ```bash
   pnpm install
   pnpm turbo run build      # builds all workspaces
   pnpm turbo run test       # optional: full suite (~64 test files)
   ```
3. **Run (dev — offline AI, in-memory data):**
   ```bash
   PORT=4000 AUTH_SECURE_COOKIES=false node apps/web/dist/main.js
   # → http://localhost:4000
   ```
   In dev, log in with any work email + a company name (passwordless). The company
   name becomes an isolated tenant.
4. **Deployment modes:** Dev (passwordless, in-memory, offline stub) → Staging
   (`AUTH_MODE=password`, Postgres, local model) → Production (password + HTTPS,
   Postgres + backups, local model).
5. **Production hardening (first-time setup):**
   ```bash
   AUTH_MODE=password AUTH_SECURE_COOKIES=true \
   SESSION_SECRET=$(openssl rand -hex 32) \
   DATABASE_URL=postgres://…  DATABASE_MAX_CONNECTIONS=20 \
   AI_ENGINE=ollama AI_MODEL=qwen2.5:7b \
   node apps/web/dist/main.js
   ```
   Run `worker.js` as a separate replica for background jobs; front with an HTTPS
   (TLS-terminating) proxy. For the full container stack (web + workers + Postgres +
   observability) use `docker compose up -d` (see `DEPLOYMENT_REPORT.md`).
6. **Processes:** Web (`main.js` — HTTP UI/API, session auth), Worker (`worker.js` —
   drains the durable job queue), Ops (`ops.js` — backup/restore/recovery).

**Knowledge check**

1. What is the default data store when `DATABASE_URL` is unset? *(In-memory.)*
2. Which env var must you set to enable durable persistence? *(`DATABASE_URL`.)*
3. Name the three runnable processes. *(Web, Worker, Ops.)*
4. Is passwordless login safe for production? *(No — dev only; use `AUTH_MODE=password`.)*

### TR

**Öğrenme hedefleri**

- Çalışma zamanı gereksinimlerini ve üç dağıtım modunu (Dev / Staging / Production)
  listelemek.
- AdOS'u çevrimdışı ve bellek içi veriyle kurmak, derlemek ve çalıştırmak.
- Bir dağıtımı üretim sıkılaştırmasına yükseltmek (parola kimlik doğrulama,
  HTTPS/HSTS, kalıcılık, yerel model).
- Çalıştırılabilir üç süreci tanımlamak: Web, Worker, Ops.

**Temel adımlar**

1. **Gereksinimler:** Node.js ≥ 20 (yerleşik `node:sqlite`), pnpm 9. İsteğe bağlı:
   Docker (üretim yığını), yerel bir çıkarım motoru (Ollama veya OpenAI uyumlu),
   PostgreSQL (kalıcı depolama).
2. **Kurulum ve derleme:**
   ```bash
   pnpm install
   pnpm turbo run build      # tüm çalışma alanlarını derler
   pnpm turbo run test       # isteğe bağlı: tam test paketi (~64 test dosyası)
   ```
3. **Çalıştırma (dev — çevrimdışı yapay zekâ, bellek içi veri):**
   ```bash
   PORT=4000 AUTH_SECURE_COOKIES=false node apps/web/dist/main.js
   # → http://localhost:4000
   ```
   Dev modunda, herhangi bir iş e-postası + bir şirket adıyla giriş yapın (parolasız).
   Şirket adı, izole edilmiş bir kiracıya (tenant) dönüşür.
4. **Dağıtım modları:** Dev (parolasız, bellek içi, çevrimdışı taslak) → Staging
   (`AUTH_MODE=password`, Postgres, yerel model) → Production (parola + HTTPS,
   Postgres + yedekler, yerel model).
5. **Üretim sıkılaştırması (ilk kurulum):**
   ```bash
   AUTH_MODE=password AUTH_SECURE_COOKIES=true \
   SESSION_SECRET=$(openssl rand -hex 32) \
   DATABASE_URL=postgres://…  DATABASE_MAX_CONNECTIONS=20 \
   AI_ENGINE=ollama AI_MODEL=qwen2.5:7b \
   node apps/web/dist/main.js
   ```
   Arka plan işleri için `worker.js`'yi ayrı bir kopya (replica) olarak çalıştırın;
   önüne HTTPS (TLS sonlandıran) bir proxy koyun. Tam konteyner yığını için (web +
   worker + Postgres + gözlemlenebilirlik) `docker compose up -d` kullanın (bkz.
   `DEPLOYMENT_REPORT.md`).
6. **Süreçler:** Web (`main.js` — HTTP arayüz/API, oturum kimlik doğrulama), Worker
   (`worker.js` — kalıcı iş kuyruğunu boşaltır), Ops (`ops.js` — yedekleme/geri
   yükleme/kurtarma).

**Bilgi kontrolü**

1. `DATABASE_URL` ayarlanmadığında varsayılan veri deposu nedir? *(Bellek içi.)*
2. Kalıcı depolamayı etkinleştirmek için hangi ortam değişkenini ayarlamalısınız?
   *(`DATABASE_URL`.)*
3. Çalıştırılabilir üç süreci sayın. *(Web, Worker, Ops.)*
4. Parolasız giriş üretim için güvenli midir? *(Hayır — yalnızca dev; `AUTH_MODE=password`
   kullanın.)*

---

## Module 2 — Configuration (workspace/tenancy, env) / Modül 2 — Yapılandırma (çalışma alanı/kiracılık, ortam)

### EN

**Learning objectives**

- Explain the tenancy model and why unique company names matter.
- Configure AdOS entirely through validated environment variables.
- Understand the onboarding wizard order and the domain model it creates.

**Key steps**

1. **Tenancy:** A **tenant** is a company (slugified name). Data is isolated per
   tenant by ambient `TenantContext` on every operation, event, job, and storage
   key. Isolation is **application-level** (not DB-level RLS). **Enforce unique
   company names** at signup so two organizations cannot collide on the same slug.
2. **Domain model** (created by the onboarding wizard, in order):
   **Workspace → Client → Brand → Product → Mission.** Brands carry voice/rules/
   banned words; Products carry pricing.
3. **Configuration is env-only and validated at startup.** An invalid or missing
   required value stops the process before it reports ready (fail-fast). Key
   variables:

   | Var | Default | Purpose |
   | --- | --- | --- |
   | `PORT` | `4000` | HTTP listen port |
   | `SESSION_SECRET` | random | Session cookie HMAC (set a stable value in prod) |
   | `DATABASE_URL` | — | Postgres DSN; unset ⇒ in-memory (dev only) |
   | `DATABASE_MAX_CONNECTIONS` | `20` | Postgres pool size |
   | `AUTH_MODE` | dev | `password` for production auth |
   | `AUTH_SECURE_COOKIES` | `true` | `false` for local HTTP only |
   | `AI_ENGINE` | `offline` | `ollama\|vllm\|lmstudio\|llamacpp\|sglang` |
   | `AI_BASE_URL` | per engine | Local engine URL |
   | `AI_MODEL` | `qwen2.5:7b` | Default local model |
   | `AI_TEMPERATURE` | `0.2` | Sampling temperature |
   | `LOG_LEVEL` / `LOG_PRETTY` | `info` / `false` | Logging |

4. **Pool sizing:** ensure `(web + worker replicas) × DATABASE_MAX_CONNECTIONS ≤
   Postgres max_connections`.
5. **Roles note (important):** roles are resolved into the session principal, but
   **RBAC is not enforced** — configuring roles does not restrict routes or what the
   AI produces (see Module 4).

**Knowledge check**

1. What is a tenant, and why enforce unique company names? *(A company/slug;
   prevents slug collisions between orgs.)*
2. Is tenant isolation DB-level or application-level? *(Application-level.)*
3. What happens on an invalid required config value? *(Startup fails fast; process
   never reports ready.)*
4. Give the onboarding wizard order. *(Workspace → Client → Brand → Product →
   Mission.)*

### TR

**Öğrenme hedefleri**

- Kiracılık modelini ve benzersiz şirket adlarının neden önemli olduğunu açıklamak.
- AdOS'u tümüyle doğrulanmış ortam değişkenleriyle yapılandırmak.
- Kullanıma alma (onboarding) sihirbazının sırasını ve oluşturduğu alan modelini
  anlamak.

**Temel adımlar**

1. **Kiracılık:** Bir **kiracı (tenant)**, bir şirkettir (slug'a dönüştürülmüş ad).
   Veri, her işlem, olay, iş ve depolama anahtarında ortam `TenantContext` ile kiracı
   bazında izole edilir. İzolasyon **uygulama düzeyindedir** (veritabanı düzeyinde RLS
   değil). İki kuruluşun aynı slug'da çakışmaması için kayıtta **benzersiz şirket
   adlarını zorunlu kılın**.
2. **Alan modeli** (onboarding sihirbazının sırayla oluşturduğu):
   **Workspace (Çalışma Alanı) → Client (Müşteri) → Brand (Marka) → Product (Ürün) →
   Mission (Görev).** Markalar ses tonu/kurallar/yasaklı kelimeler taşır; Ürünler
   fiyatlandırma taşır.
3. **Yapılandırma yalnızca ortam değişkenleriyle yapılır ve başlangıçta doğrulanır.**
   Geçersiz veya eksik zorunlu bir değer, süreç hazır olduğunu bildirmeden önce onu
   durdurur (fail-fast). Temel değişkenler:

   | Değişken | Varsayılan | Amaç |
   | --- | --- | --- |
   | `PORT` | `4000` | HTTP dinleme portu |
   | `SESSION_SECRET` | rastgele | Oturum çerezi HMAC (üretimde sabit değer verin) |
   | `DATABASE_URL` | — | Postgres DSN; ayarsız ⇒ bellek içi (yalnızca dev) |
   | `DATABASE_MAX_CONNECTIONS` | `20` | Postgres havuz boyutu |
   | `AUTH_MODE` | dev | Üretim kimlik doğrulama için `password` |
   | `AUTH_SECURE_COOKIES` | `true` | Yalnızca yerel HTTP için `false` |
   | `AI_ENGINE` | `offline` | `ollama\|vllm\|lmstudio\|llamacpp\|sglang` |
   | `AI_BASE_URL` | motora göre | Yerel motor URL'si |
   | `AI_MODEL` | `qwen2.5:7b` | Varsayılan yerel model |
   | `AI_TEMPERATURE` | `0.2` | Örnekleme sıcaklığı |
   | `LOG_LEVEL` / `LOG_PRETTY` | `info` / `false` | Günlükleme |

4. **Havuz boyutlandırma:** `(web + worker kopyaları) × DATABASE_MAX_CONNECTIONS ≤
   Postgres max_connections` olduğundan emin olun.
5. **Roller notu (önemli):** roller oturum ilkesine (principal) çözümlenir, ancak
   **RBAC uygulanmaz** — rolleri yapılandırmak, rotaları veya yapay zekânın ürettiğini
   kısıtlamaz (bkz. Modül 4).

**Bilgi kontrolü**

1. Kiracı nedir ve benzersiz şirket adları neden zorunlu kılınır? *(Bir şirket/slug;
   kuruluşlar arası slug çakışmasını önler.)*
2. Kiracı izolasyonu veritabanı düzeyinde mi yoksa uygulama düzeyinde mi? *(Uygulama
   düzeyinde.)*
3. Geçersiz zorunlu bir yapılandırma değerinde ne olur? *(Başlangıç fail-fast; süreç
   asla hazır olduğunu bildirmez.)*
4. Onboarding sihirbazının sırasını verin. *(Workspace → Client → Brand → Product →
   Mission.)*

---

## Module 3 — AI (local engines) / Modül 3 — Yapay Zekâ (yerel motorlar)

### EN

**Learning objectives**

- Distinguish the `OfflineAIManager` (default) from the `LiveAIManager` (local
  engine) and choose correctly.
- Configure a local inference engine with no cloud, no API key, no per-token billing.
- Control AI output language (TR/EN) and set realistic performance expectations.

**Key steps**

1. **The Constitution:** one rule governs all AI — **no code talks to an inference
   engine directly.** Every AI task goes through the **AI Manager** (`AIManagerPort`),
   the only code that reaches a model. Models are fully replaceable without touching
   business logic.
2. **Two managers, one contract:**

   | Manager | Engine | When |
   | --- | --- | --- |
   | `OfflineAIManager` | none — deterministic, schema-valid stub | **default**: tests, demos, no model server, air-gap |
   | `LiveAIManager` | a **local** inference engine | when `AI_ENGINE` is set |

   Both implement the same `AIManagerPort`, so switching changes nothing downstream.
3. **Run a real local model (all local — no cloud, no API key):**
   ```bash
   ollama pull qwen2.5:7b
   AI_ENGINE=ollama AI_MODEL=qwen2.5:7b node apps/web/dist/main.js
   ```
   Supported local engines: `ollama` (default `http://localhost:11434`) and the
   OpenAI-compatible local servers `vllm`, `lmstudio`, `llamacpp`, `sglang`
   (`AI_BASE_URL`, default `http://localhost:8000`). None require an API key — they
   run on your machine/network. Tune with `AI_MODEL` and `AI_TEMPERATURE` (default
   `0.2`).
4. **How LiveAIManager works:** builds a chat prompt from the service role +
   variables + response schema, instructs the model to answer in the visitor's
   language and return **only JSON**, calls the local engine, extracts the JSON
   (strips fences/prose), **self-repairs once** if invalid, and returns a validated
   result with real model/engine/tokens/latency. If still no JSON, the calling
   service surfaces its normal `UnavailableError`.
5. **Language:** AI output follows the request locale (browser/OS `Accept-Language`)
   — Turkish or English. JSON keys stay in English; text values are localized.
6. **Performance & limits:** a 7B model on CPU takes ~40–50 s for a full
   brief→creative→campaign chain; use a GPU or a smaller model to speed up. The
   offline manager is sub-millisecond. Small models can mix languages in long prose;
   structured fields and ad copy are reliable (see `KNOWN_LIMITATIONS.md`).
7. **Security note:** bind the local engine to localhost / a private network only.

**Knowledge check**

1. Which manager is the default, and does it need a model server? *(`OfflineAIManager`;
   no.)*
2. Which env var switches to a live local engine? *(`AI_ENGINE`.)*
3. Does any engine require a cloud API key or per-token billing? *(No — all local.)*
4. How is AI output language chosen? *(From request locale / `Accept-Language`.)*

### TR

**Öğrenme hedefleri**

- `OfflineAIManager`'ı (varsayılan) `LiveAIManager`'dan (yerel motor) ayırt etmek ve
  doğru seçim yapmak.
- Bulutsuz, API anahtarsız ve jeton başına ücretsiz bir yerel çıkarım motoru
  yapılandırmak.
- Yapay zekâ çıktı dilini (TR/EN) kontrol etmek ve gerçekçi performans beklentileri
  belirlemek.

**Temel adımlar**

1. **Anayasa:** tüm yapay zekâyı tek bir kural yönetir — **hiçbir kod çıkarım motoruyla
   doğrudan konuşmaz.** Her yapay zekâ görevi, bir modele erişen tek kod olan **AI
   Manager** (`AIManagerPort`) üzerinden geçer. Modeller, iş mantığına dokunmadan
   tümüyle değiştirilebilir.
2. **İki yönetici, tek sözleşme:**

   | Yönetici | Motor | Ne zaman |
   | --- | --- | --- |
   | `OfflineAIManager` | yok — belirlenimci, şema-geçerli taslak | **varsayılan**: testler, demolar, model sunucusu yok, hava boşluğu (air-gap) |
   | `LiveAIManager` | bir **yerel** çıkarım motoru | `AI_ENGINE` ayarlandığında |

   İkisi de aynı `AIManagerPort`'u uygular; bu nedenle geçiş, aşağı akışta hiçbir şeyi
   değiştirmez.
3. **Gerçek bir yerel model çalıştırma (tümü yerel — bulut yok, API anahtarı yok):**
   ```bash
   ollama pull qwen2.5:7b
   AI_ENGINE=ollama AI_MODEL=qwen2.5:7b node apps/web/dist/main.js
   ```
   Desteklenen yerel motorlar: `ollama` (varsayılan `http://localhost:11434`) ve
   OpenAI uyumlu yerel sunucular `vllm`, `lmstudio`, `llamacpp`, `sglang` (`AI_BASE_URL`,
   varsayılan `http://localhost:8000`). Hiçbiri API anahtarı gerektirmez — kendi
   makinenizde/ağınızda çalışırlar. `AI_MODEL` ve `AI_TEMPERATURE` (varsayılan `0.2`)
   ile ayarlayın.
4. **LiveAIManager nasıl çalışır:** servis rolü + değişkenler + yanıt şemasından bir
   sohbet istemi (prompt) oluşturur, modele ziyaretçinin dilinde yanıt vermesini ve
   **yalnızca JSON** döndürmesini söyler, yerel motoru çağırır, JSON'u ayıklar (kod
   çitlerini/metni temizler), geçersizse **bir kez kendini onarır** ve gerçek
   model/motor/jeton/gecikme değerleriyle doğrulanmış bir sonuç döndürür. Hâlâ JSON
   yoksa, çağıran servis normal `UnavailableError`'ını gösterir.
5. **Dil:** Yapay zekâ çıktısı istek yereline (tarayıcı/OS `Accept-Language`) uyar —
   Türkçe veya İngilizce. JSON anahtarları İngilizce kalır; metin değerleri
   yerelleştirilir.
6. **Performans ve sınırlar:** CPU'da 7B'lik bir model, tam bir brif→yaratıcı→kampanya
   zinciri için ~40–50 sn sürer; hızlandırmak için GPU veya daha küçük bir model
   kullanın. Çevrimdışı yönetici milisaniyenin altındadır. Küçük modeller uzun metinlerde
   dilleri karıştırabilir; yapılandırılmış alanlar ve reklam metni güvenilirdir (bkz.
   `KNOWN_LIMITATIONS.md`).
7. **Güvenlik notu:** yerel motoru yalnızca localhost / özel bir ağa bağlayın.

**Bilgi kontrolü**

1. Hangi yönetici varsayılandır ve bir model sunucusuna ihtiyaç duyar mı?
   *(`OfflineAIManager`; hayır.)*
2. Canlı yerel motora hangi ortam değişkeni geçiş yapar? *(`AI_ENGINE`.)*
3. Herhangi bir motor bulut API anahtarı veya jeton başına ücret gerektirir mi?
   *(Hayır — tümü yerel.)*
4. Yapay zekâ çıktı dili nasıl seçilir? *(İstek yerelinden / `Accept-Language`.)*

---

## Module 4 — Security / Modül 4 — Güvenlik

### EN

**Learning objectives**

- Enumerate the built-in security controls (all on by default) and how to operate
  them.
- Complete the production hardening checklist.
- State honestly what RBAC does and does **not** do in this product.

**Key steps**

1. **Authentication:** production `AUTH_MODE=password` uses **Argon2id**
   (`@node-rs/argon2`) with constant-time verification. Never run the dev passwordless
   login in production.
2. **Sessions:** HMAC-signed, HttpOnly cookies. Set a stable `SESSION_SECRET`
   (rotating it invalidates all sessions). Keep `AUTH_SECURE_COOKIES=true` (HTTPS).
3. **CSRF:** state-changing forms carry a **per-session CSRF token**.
4. **Brute-force lockout:** an `(ip, email)` pair locks after **5 failures / 15 min**
   (429 + Retry-After); a success resets it. No configuration needed.
5. **Security headers on every response:** CSP (`default-src 'self'`,
   `frame-ancestors 'none'`), `X-Content-Type-Options`, `X-Frame-Options: DENY`,
   `Referrer-Policy`, `Permissions-Policy`, COOP/CORP, and **HSTS** over HTTPS.
6. **Tenant isolation:** `TenantContext` scopes every query, event, job, and storage
   key — application-level (not DB RLS).
7. **Data & privacy:** AdOS is offline-first — the AI Manager only talks to a **local**
   engine. No prompts, content, or customer data leave your infrastructure; there is
   no cloud provider and no API key anywhere.
8. **Hardening checklist:** `AUTH_MODE=password` + `AUTH_SECURE_COOKIES=true` +
   HTTPS/HSTS; strong random `SESSION_SECRET` from a secrets manager; Postgres reachable
   only from app hosts with a least-privilege user; backup encryption key stored
   separately from archives; enforce unique company names; keep `/metrics` and internal
   endpoints off the public internet; bind the local inference engine to localhost/private
   network; keep dependencies patched.
9. **Incident response:** on suspected compromise, rotate `SESSION_SECRET` (invalidates
   sessions), rotate DB and backup keys, and review the activity event stream (every
   domain action is recorded with `tenantId` + actor). See `RUNBOOK.md` and
   `DISASTER_RECOVERY.md`.

> **RBAC — teach this honestly.** Roles are **defined** and resolved into the session
> principal, but **RBAC is not enforced**: no route or AI output is permission-gated.
> Do **not** tell users that "setting permissions restricts what the AI surfaces" — it
> does not. Access control today is: authentication + application-level tenant
> isolation + human approval at every pipeline stage. Enforced RBAC is **Roadmap**
> (see the Roadmap section).

**Knowledge check**

1. Which algorithm hashes passwords? *(Argon2id.)*
2. When does brute-force lockout trigger? *(5 failures / 15 min per (ip, email).)*
3. What does rotating `SESSION_SECRET` do? *(Invalidates all existing sessions.)*
4. Does configuring a user's role restrict what the AI can surface? *(No — RBAC is
   not enforced.)*

### TR

**Öğrenme hedefleri**

- Yerleşik güvenlik denetimlerini (tümü varsayılan olarak açık) ve nasıl işletileceğini
  sıralamak.
- Üretim sıkılaştırma kontrol listesini tamamlamak.
- Bu üründe RBAC'ın ne yaptığını ve ne **yapmadığını** dürüstçe belirtmek.

**Temel adımlar**

1. **Kimlik doğrulama:** üretimde `AUTH_MODE=password`, sabit-zamanlı doğrulamayla
   **Argon2id** (`@node-rs/argon2`) kullanır. Dev parolasız girişini üretimde asla
   çalıştırmayın.
2. **Oturumlar:** HMAC ile imzalı, HttpOnly çerezler. Sabit bir `SESSION_SECRET`
   ayarlayın (döndürmek tüm oturumları geçersiz kılar). `AUTH_SECURE_COOKIES=true`
   (HTTPS) tutun.
3. **CSRF:** durum değiştiren formlar **oturum başına bir CSRF jetonu** taşır.
4. **Kaba kuvvet kilitlemesi:** bir `(ip, email)` çifti **5 başarısızlık / 15 dakika**
   sonrası kilitlenir (429 + Retry-After); bir başarı bunu sıfırlar. Yapılandırma
   gerekmez.
5. **Her yanıtta güvenlik başlıkları:** CSP (`default-src 'self'`,
   `frame-ancestors 'none'`), `X-Content-Type-Options`, `X-Frame-Options: DENY`,
   `Referrer-Policy`, `Permissions-Policy`, COOP/CORP ve HTTPS üzerinde **HSTS**.
6. **Kiracı izolasyonu:** `TenantContext` her sorguyu, olayı, işi ve depolama anahtarını
   kapsar — uygulama düzeyinde (veritabanı RLS değil).
7. **Veri ve gizlilik:** AdOS çevrimdışı önceliklidir — AI Manager yalnızca **yerel**
   bir motorla konuşur. Hiçbir istem, içerik veya müşteri verisi altyapınızdan çıkmaz;
   hiçbir yerde bulut sağlayıcı veya API anahtarı yoktur.
8. **Sıkılaştırma kontrol listesi:** `AUTH_MODE=password` + `AUTH_SECURE_COOKIES=true` +
   HTTPS/HSTS; bir sır yöneticisinden güçlü rastgele `SESSION_SECRET`; Postgres'e yalnızca
   uygulama ana bilgisayarlarından, en az ayrıcalıklı bir kullanıcıyla erişim; yedek
   şifreleme anahtarını arşivlerden ayrı saklamak; benzersiz şirket adlarını zorunlu
   kılmak; `/metrics` ve iç uç noktaları herkese açık internette tutmamak; yerel çıkarım
   motorunu localhost/özel ağa bağlamak; bağımlılıkları yamalı tutmak.
9. **Olay müdahalesi:** şüpheli bir ihlalde `SESSION_SECRET`'i döndürün (oturumları
   geçersiz kılar), DB ve yedek anahtarlarını döndürün ve etkinlik olay akışını inceleyin
   (her alan eylemi `tenantId` + aktör ile kaydedilir). Bkz. `RUNBOOK.md` ve
   `DISASTER_RECOVERY.md`.

> **RBAC — bunu dürüstçe öğretin.** Roller **tanımlıdır** ve oturum ilkesine çözümlenir,
> ancak **RBAC uygulanmaz**: hiçbir rota veya yapay zekâ çıktısı izinle kapılanmaz.
> Kullanıcılara "izinleri ayarlamak yapay zekânın neyi göstereceğini kısıtlar"
> **demeyin** — kısıtlamaz. Bugün erişim kontrolü şudur: kimlik doğrulama + uygulama
> düzeyinde kiracı izolasyonu + her hat aşamasında insan onayı. Zorunlu (enforced) RBAC
> **Yol Haritası**ndadır (bkz. Yol Haritası bölümü).

**Bilgi kontrolü**

1. Parolaları hangi algoritma karma (hash) yapar? *(Argon2id.)*
2. Kaba kuvvet kilitlemesi ne zaman tetiklenir? *((ip, email) başına 5 başarısızlık /
   15 dakika.)*
3. `SESSION_SECRET`'i döndürmek ne yapar? *(Mevcut tüm oturumları geçersiz kılar.)*
4. Bir kullanıcının rolünü yapılandırmak, yapay zekânın gösterebileceğini kısıtlar mı?
   *(Hayır — RBAC uygulanmaz.)*

---

## Module 5 — Backup / Modül 5 — Yedekleme

### EN

**Learning objectives**

- Describe what a backup contains and the difference between full and incremental.
- Take, verify, and restore backups via the Ops process.
- Apply the recommended backup policy.

**Key steps**

1. **What a backup contains:** tenant-scoped database tables (via
   `DatabaseBackupSource`). Each archive is **gzip-compressed, AES-256-GCM encrypted,
   and SHA-256 checksummed**, and recorded in a repository with metadata.
2. **Full vs incremental:** a **full** backup is a complete snapshot; an
   **incremental** stores only changes since a parent, linked by a **parent chain** —
   a restore walks the chain and applies it in order.
3. **Take a backup (via `ops.js` / `BackupService`):**
   ```bash
   node apps/web/dist/ops.js backup --tenant <tenantId>                # full
   node apps/web/dist/ops.js backup --tenant <tenantId> --incremental  # incremental
   ```
   Backups **auto-validate** on creation (checksum + structure), so a stored backup
   is known-good.
4. **Restore:**
   ```bash
   node apps/web/dist/ops.js restore --backup <backupId>
   ```
   Restore **verifies then applies** (integrity checked before any write).
5. **Recommended policy:** full daily, incremental hourly (or per significant change),
   retain ≥ 30 days of fulls + chains, keep the encryption key in your secrets manager
   (not with the archives), run restore drills monthly to a scratch env, replicate
   archives offsite. Alert if the newest backup is older than your RPO.

**Knowledge check**

1. How is each backup archive protected? *(gzip + AES-256-GCM + SHA-256 checksum.)*
2. What does a restore do before writing? *(Verifies integrity/checksum first.)*
3. How does an incremental restore reassemble data? *(Walks the parent chain in order.)*
4. What proves recoverability? *(A successful restore drill to a scratch environment.)*

### TR

**Öğrenme hedefleri**

- Bir yedeğin ne içerdiğini ve tam ile artımlı (incremental) arasındaki farkı
  açıklamak.
- Ops süreci aracılığıyla yedek almak, doğrulamak ve geri yüklemek.
- Önerilen yedekleme politikasını uygulamak.

**Temel adımlar**

1. **Bir yedek ne içerir:** kiracı kapsamlı veritabanı tabloları (`DatabaseBackupSource`
   aracılığıyla). Her arşiv **gzip ile sıkıştırılır, AES-256-GCM ile şifrelenir ve
   SHA-256 sağlama toplamına (checksum) sahiptir** ve meta verisiyle bir depoya kaydedilir.
2. **Tam ile artımlı:** bir **tam** yedek eksiksiz bir anlık görüntüdür; bir **artımlı**
   yedek, bir ebeveynden bu yana yalnızca değişiklikleri **ebeveyn zinciri** ile bağlı
   olarak saklar — geri yükleme zinciri sırayla yürür ve uygular.
3. **Yedek alma (`ops.js` / `BackupService` aracılığıyla):**
   ```bash
   node apps/web/dist/ops.js backup --tenant <tenantId>                # tam
   node apps/web/dist/ops.js backup --tenant <tenantId> --incremental  # artımlı
   ```
   Yedekler oluşturulurken **kendini otomatik doğrular** (sağlama toplamı + yapı); bu
   nedenle saklanan bir yedek bilinen-iyi durumdadır.
4. **Geri yükleme:**
   ```bash
   node apps/web/dist/ops.js restore --backup <backupId>
   ```
   Geri yükleme **önce doğrular sonra uygular** (herhangi bir yazma öncesi bütünlük
   kontrol edilir).
5. **Önerilen politika:** günlük tam, saatlik artımlı (veya her önemli değişiklikte),
   ≥ 30 gün tam + zincir saklama, şifreleme anahtarını sır yöneticinizde tutma (arşivlerle
   birlikte değil), aylık geri yükleme tatbikatlarını bir deneme (scratch) ortamına
   yapma, arşivleri saha dışına kopyalama. En yeni yedek RPO'nuzdan eskiyse uyarı verin.

**Bilgi kontrolü**

1. Her yedek arşivi nasıl korunur? *(gzip + AES-256-GCM + SHA-256 sağlama toplamı.)*
2. Bir geri yükleme, yazmadan önce ne yapar? *(Önce bütünlüğü/sağlama toplamını doğrular.)*
3. Artımlı bir geri yükleme veriyi nasıl yeniden birleştirir? *(Ebeveyn zincirini sırayla
   yürür.)*
4. Kurtarılabilirliği ne kanıtlar? *(Bir deneme ortamına başarılı bir geri yükleme
   tatbikatı.)*

---

## Module 6 — Monitoring / Modül 6 — İzleme

### EN

**Learning objectives**

- Describe the observability spine and the signals AdOS emits.
- Read the activity log + per-approval timeline, and know its bounds.
- Set up health/readiness checks and useful alerts.

**Key steps**

1. **Observability spine:** `@ados/observability` — `telemetry(component)` bundles
   **structured logging** (pino), **tracing** (OpenTelemetry spans, exported to Jaeger
   when `OTEL_EXPORTER_OTLP_ENDPOINT` is set, otherwise a no-op offline), and **metrics**
   (prom-client on a shared registry scraped at `/metrics`).
2. **Activity log + per-approval timeline (not an immutable audit trail):** the web
   activity feed is a **bounded in-memory ring of 50** most-recent domain events;
   each approval has its own timeline. Structured logs carry `requestId`, `tenantId`,
   and `correlationId`. This is monitoring, **not** a tamper-evident/append-only audit
   log.
3. **Health & readiness:** liveness/readiness is gated by dependency verification at
   startup (config → DB → migrations). A failed dependency prevents the process from
   reporting ready. `RecoveryHealthCheck` can gate the container readiness probe so a
   node that cannot prove recoverability never accepts traffic.
4. **Metrics you can scrape at `/metrics`:** HTTP (`web_http_requests_total`,
   `web_http_errors_total`, `web_http_request_duration_ms`), system (CPU/memory/heap/
   event-loop lag), workers, backup, auth, config, storage. Ten provisioned Grafana
   dashboards ship: System, Application, AI, Workers, Storage, Database, Events,
   Authentication, Backup, Business KPIs.
5. **Recommended alerts:** error rate > 0, queue/DLQ growth, failed readiness, backup
   age older than RPO.
6. **Boundary signals:** some AI/DB/event-bus counters are "boundary-wired" — the
   helper and dashboard panel exist, and they populate once the real engine/DB/bus
   adapter is attached (offline/in-memory builds show them idle).

> **No vendor telemetry.** AdOS is self-hosted and offline with **no phone-home
> telemetry**. All of the above is visible **only inside the customer's own
> deployment**. Nothing is reported back to the vendor. Adoption/health metrics for CS
> check-ins come from what the admin **exports/shares** (activity log, KPI reports,
> mission counts, Company Brain growth) — never from vendor-side collection.

**Knowledge check**

1. Where are metrics exposed? *(`/metrics`, Prometheus format.)*
2. How large is the web activity ring? *(50 most-recent events, in memory.)*
3. Is the activity log an immutable audit trail? *(No — it is a bounded ring + logs.)*
4. Does AdOS phone home usage to the vendor? *(No — no telemetry leaves the deployment.)*

### TR

**Öğrenme hedefleri**

- Gözlemlenebilirlik omurgasını ve AdOS'un yaydığı sinyalleri açıklamak.
- Etkinlik günlüğünü + onay başına zaman çizelgesini okumak ve sınırlarını bilmek.
- Sağlık/hazırlık kontrolleri ve faydalı uyarılar kurmak.

**Temel adımlar**

1. **Gözlemlenebilirlik omurgası:** `@ados/observability` — `telemetry(component)`,
   **yapılandırılmış günlükleme** (pino), **izleme (tracing)** (OpenTelemetry span'ları,
   `OTEL_EXPORTER_OTLP_ENDPOINT` ayarlandığında Jaeger'a aktarılır, aksi hâlde çevrimdışı
   no-op) ve **metrikleri** (paylaşılan bir kayıt defterinde prom-client, `/metrics`'ten
   toplanır) bir araya getirir.
2. **Etkinlik günlüğü + onay başına zaman çizelgesi (değiştirilemez bir denetim izi
   değil):** web etkinlik akışı, en son alan olaylarından oluşan **50'lik sınırlı bir
   bellek içi halkadır (ring)**; her onayın kendi zaman çizelgesi vardır. Yapılandırılmış
   günlükler `requestId`, `tenantId` ve `correlationId` taşır. Bu izlemedir; kurcalamaya
   dayanıklı/yalnızca-ekle (append-only) bir denetim günlüğü **değildir**.
3. **Sağlık ve hazırlık:** canlılık/hazırlık, başlangıçta bağımlılık doğrulamasıyla
   (config → DB → geçişler) kapılanır. Başarısız bir bağımlılık, sürecin hazır olduğunu
   bildirmesini engeller. `RecoveryHealthCheck`, konteyner hazırlık yoklamasını
   kapılayabilir; böylece kurtarılabilirliğini kanıtlayamayan bir düğüm asla trafik kabul
   etmez.
4. **`/metrics`'ten toplayabileceğiniz metrikler:** HTTP (`web_http_requests_total`,
   `web_http_errors_total`, `web_http_request_duration_ms`), sistem (CPU/bellek/heap/olay
   döngüsü gecikmesi), worker'lar, yedekleme, kimlik doğrulama, config, depolama. On
   hazır Grafana panosu gelir: System, Application, AI, Workers, Storage, Database,
   Events, Authentication, Backup, Business KPIs.
5. **Önerilen uyarılar:** hata oranı > 0, kuyruk/DLQ büyümesi, başarısız hazırlık, RPO'dan
   eski yedek yaşı.
6. **Sınır (boundary) sinyalleri:** bazı AI/DB/olay-veri yolu sayaçları "sınırda
   bağlıdır" — yardımcı ve pano paneli mevcuttur ve gerçek motor/DB/veri yolu bağdaştırıcısı
   eklendiğinde dolar (çevrimdışı/bellek içi derlemelerde boşta görünürler).

> **Satıcı telemetrisi yok.** AdOS, **eve-arama (phone-home) telemetrisi olmadan**
> kendi kendine barındırılan ve çevrimdışı bir sistemdir. Yukarıdakilerin tümü
> **yalnızca müşterinin kendi dağıtımı içinde** görünürdür. Hiçbir şey satıcıya geri
> bildirilmez. CS görüşmeleri için benimseme/sağlık metrikleri, yöneticinin
> **dışa aktardığı/paylaştığı** şeylerden gelir (etkinlik günlüğü, KPI raporları, görev
> sayıları, Company Brain büyümesi) — asla satıcı tarafı toplamadan değil.

**Bilgi kontrolü**

1. Metrikler nerede sunulur? *(`/metrics`, Prometheus biçimi.)*
2. Web etkinlik halkası ne kadar büyüktür? *(En son 50 olay, bellek içinde.)*
3. Etkinlik günlüğü değiştirilemez bir denetim izi midir? *(Hayır — sınırlı bir halka +
   günlükler.)*
4. AdOS kullanım verisini satıcıya geri bildirir mi? *(Hayır — dağıtımdan hiçbir telemetri
   çıkmaz.)*

---

## Module 7 — Troubleshooting / Modül 7 — Sorun Giderme

### EN

**Learning objectives**

- Diagnose the most common startup, auth, AI, and queue issues.
- Use logs, metrics, and health gates to localize faults.

**Key steps / common issues**

1. **Process won't report ready:** config validation failed. AdOS fails fast on an
   invalid/missing required value (e.g. a missing/short `SESSION_SECRET`, a bad
   `DATABASE_URL`). Read the startup log; fix the env var; restart.
2. **Cannot log in / 429 Retry-After:** brute-force lockout (5 failures / 15 min per
   `(ip, email)`). Wait for the window or resolve the credential issue; a success
   resets the counter. In production ensure `AUTH_MODE=password`.
3. **Sessions dropped after restart:** `SESSION_SECRET` was not stable (random per
   boot). Set a fixed secret from your secrets manager.
4. **AI returns `UnavailableError` / no output:** with a live engine the model may not
   have returned valid JSON even after one self-repair. Check the local engine is
   running and reachable (`AI_BASE_URL`), the model is pulled (`AI_MODEL`), and consider
   a smaller/faster model. Falling back to `AI_ENGINE=offline` restores deterministic
   output.
5. **AI output mixes languages:** small models can drift in long prose; structured
   fields/ad copy are reliable. Use a larger model or lower `AI_TEMPERATURE`. See
   `KNOWN_LIMITATIONS.md`.
6. **Slow generation:** a 7B model on CPU is ~40–50 s for a full chain — expected. Use
   a GPU or a smaller model; the offline manager is sub-millisecond.
7. **Growing DLQ / stuck jobs:** a handler is failing repeatedly. Inspect the dead-letter
   queue, fix the handler, and re-drive. A crashed worker's in-flight jobs are re-driven
   on lease expiry.
8. **DB connection errors:** verify Postgres reachability and that
   `(web + worker replicas) × DATABASE_MAX_CONNECTIONS ≤ Postgres max_connections`.
9. **Where to look:** structured logs (`LOG_PRETTY=true` for humans), `/metrics`
   (error rate, queue depth, latency), the activity feed, and `RUNBOOK.md` playbooks.

**Knowledge check**

1. Sessions vanish after every restart — likely cause? *(Non-stable `SESSION_SECRET`.)*
2. A user is locked out with 429 — why? *(Brute-force lockout: 5 fails / 15 min.)*
3. Live AI returns no output — first checks? *(Engine running/reachable, model pulled;
   consider offline fallback.)*
4. A growing DLQ indicates what? *(A repeatedly failing handler; inspect, fix, re-drive.)*

### TR

**Öğrenme hedefleri**

- En yaygın başlangıç, kimlik doğrulama, yapay zekâ ve kuyruk sorunlarını teşhis etmek.
- Arızaları konumlandırmak için günlükleri, metrikleri ve sağlık kapılarını kullanmak.

**Temel adımlar / yaygın sorunlar**

1. **Süreç hazır olduğunu bildirmiyor:** yapılandırma doğrulaması başarısız. AdOS,
   geçersiz/eksik zorunlu bir değerde (ör. eksik/kısa `SESSION_SECRET`, hatalı
   `DATABASE_URL`) fail-fast yapar. Başlangıç günlüğünü okuyun; ortam değişkenini düzeltin;
   yeniden başlatın.
2. **Giriş yapılamıyor / 429 Retry-After:** kaba kuvvet kilitlemesi (`(ip, email)` başına
   5 başarısızlık / 15 dakika). Pencerenin geçmesini bekleyin veya kimlik bilgisi sorununu
   çözün; bir başarı sayacı sıfırlar. Üretimde `AUTH_MODE=password` olduğundan emin olun.
3. **Yeniden başlatmadan sonra oturumlar düşüyor:** `SESSION_SECRET` sabit değildi (her
   açılışta rastgele). Sır yöneticinizden sabit bir gizli değer ayarlayın.
4. **Yapay zekâ `UnavailableError` döndürüyor / çıktı yok:** canlı bir motorda, bir kez
   kendini onardıktan sonra bile model geçerli JSON döndürmemiş olabilir. Yerel motorun
   çalıştığını ve erişilebilir olduğunu (`AI_BASE_URL`), modelin çekildiğini (`AI_MODEL`)
   kontrol edin ve daha küçük/hızlı bir modeli değerlendirin. `AI_ENGINE=offline`'a geri
   dönmek belirlenimci çıktıyı geri getirir.
5. **Yapay zekâ çıktısı dilleri karıştırıyor:** küçük modeller uzun metinde sapabilir;
   yapılandırılmış alanlar/reklam metni güvenilirdir. Daha büyük bir model kullanın veya
   `AI_TEMPERATURE`'ı düşürün. Bkz. `KNOWN_LIMITATIONS.md`.
6. **Yavaş üretim:** CPU'da 7B'lik bir model tam bir zincir için ~40–50 sn — beklenendir.
   GPU veya daha küçük bir model kullanın; çevrimdışı yönetici milisaniyenin altındadır.
7. **Büyüyen DLQ / takılan işler:** bir işleyici tekrar tekrar başarısız oluyor. Ölü mektup
   kuyruğunu (DLQ) inceleyin, işleyiciyi düzeltin ve yeniden sürün. Çöken bir worker'ın
   uçuştaki işleri, kira (lease) süresi dolduğunda yeniden sürülür.
8. **DB bağlantı hataları:** Postgres erişilebilirliğini ve
   `(web + worker kopyaları) × DATABASE_MAX_CONNECTIONS ≤ Postgres max_connections`
   olduğunu doğrulayın.
9. **Nereye bakılır:** yapılandırılmış günlükler (insanlar için `LOG_PRETTY=true`),
   `/metrics` (hata oranı, kuyruk derinliği, gecikme), etkinlik akışı ve `RUNBOOK.md`
   senaryoları.

**Bilgi kontrolü**

1. Her yeniden başlatmadan sonra oturumlar kayboluyor — olası neden? *(Sabit olmayan
   `SESSION_SECRET`.)*
2. Bir kullanıcı 429 ile kilitlendi — neden? *(Kaba kuvvet kilitlemesi: 5 başarısızlık /
   15 dakika.)*
3. Canlı yapay zekâ çıktı vermiyor — ilk kontroller? *(Motor çalışıyor/erişilebilir mi,
   model çekildi mi; çevrimdışı geri dönüşü değerlendirin.)*
4. Büyüyen bir DLQ neyi gösterir? *(Tekrar tekrar başarısız olan bir işleyici; inceleyin,
   düzeltin, yeniden sürün.)*

---

## Module 8 — Reporting / Modül 8 — Raporlama

### EN

**Learning objectives**

- Explain how performance data enters AdOS and what KPIs are computed.
- Read the CampaignReport and Executive/CEO dashboard.
- Export/share reports for KPIs, health, and EBRs (given no vendor telemetry).

**Key steps**

1. **How data enters:** campaign performance metrics are **hand-entered via a form**
   (AdOS has no external ad-platform connectors; nothing is auto-ingested).
2. **Deterministic ad KPIs:** from entered metrics AdOS computes **CTR, CPC, CPA, CPL,
   ROAS, ROI** with pure, deterministic math — reproducible for the same inputs.
3. **CampaignReport → Executive/CEO dashboard:** the analytics engine produces a
   CampaignReport; the executive-AI produces an executive/CEO dashboard synthesis (a
   single AI call). These are the KPI/performance outputs an admin surfaces to
   stakeholders.
4. **Company Brain growth as a reporting signal:** the marketing-performance Company
   Brain accumulates CompanyDNA, Brand/Marketing/Creative/Sales insights, a
   campaign→ad→lead→ROI knowledge graph, and a winning-ad pattern library. Its growth
   is a legitimate maturity/value metric to report.
5. **Exportable / shareable for CS:** because there is **no vendor telemetry**, KPI
   reports, mission counts, activity-log summaries, and Company Brain growth are what
   the **admin exports/shares** during check-ins and quarterly EBRs. Business-KPI
   Grafana dashboards and `/metrics` provide operational reporting; the app's reports
   provide advertising KPIs. See `CUSTOMER_HEALTH.md` for how CS combines these.

**Knowledge check**

1. How do performance metrics get into AdOS? *(Hand-entered via a form; no connectors.)*
2. Name the six deterministic ad KPIs. *(CTR, CPC, CPA, CPL, ROAS, ROI.)*
3. Is the executive dashboard an autonomous agent? *(No — a single AI synthesis call.)*
4. Where do CS health/adoption numbers come from? *(Admin exports/shares — no vendor
   telemetry.)*

### TR

**Öğrenme hedefleri**

- Performans verisinin AdOS'a nasıl girdiğini ve hangi KPI'ların hesaplandığını
  açıklamak.
- CampaignReport ve Yönetici/CEO panosunu okumak.
- KPI, sağlık ve EBR'ler için raporları dışa aktarmak/paylaşmak (satıcı telemetrisi yok).

**Temel adımlar**

1. **Veri nasıl girer:** kampanya performans metrikleri **bir form aracılığıyla elle
   girilir** (AdOS'un harici reklam platformu bağlayıcıları yoktur; hiçbir şey otomatik
   alınmaz).
2. **Belirlenimci reklam KPI'ları:** girilen metriklerden AdOS, saf ve belirlenimci
   matematikle **CTR, CPC, CPA, CPL, ROAS, ROI** hesaplar — aynı girdiler için yeniden
   üretilebilir.
3. **CampaignReport → Yönetici/CEO panosu:** analitik motoru bir CampaignReport üretir;
   executive-AI bir yönetici/CEO panosu sentezi üretir (tek bir yapay zekâ çağrısı). Bunlar,
   bir yöneticinin paydaşlara sunduğu KPI/performans çıktılarıdır.
4. **Raporlama sinyali olarak Company Brain büyümesi:** pazarlama-performansı odaklı
   Company Brain; CompanyDNA, Marka/Pazarlama/Yaratıcı/Satış içgörüleri, bir
   kampanya→reklam→müşteri adayı→ROI bilgi grafiği ve kazanan-reklam desen kütüphanesi
   biriktirir. Büyümesi, raporlanacak meşru bir olgunluk/değer metriğidir.
5. **CS için dışa aktarılabilir / paylaşılabilir:** **satıcı telemetrisi olmadığından**,
   KPI raporları, görev sayıları, etkinlik günlüğü özetleri ve Company Brain büyümesi,
   **yöneticinin dışa aktardığı/paylaştığı** şeylerdir — görüşmeler ve üç aylık EBR'ler
   sırasında. Business-KPI Grafana panoları ve `/metrics` operasyonel raporlama sağlar;
   uygulamanın raporları reklam KPI'ları sağlar. CS'in bunları nasıl birleştirdiği için
   bkz. `CUSTOMER_HEALTH.md`.

**Bilgi kontrolü**

1. Performans metrikleri AdOS'a nasıl girer? *(Bir form aracılığıyla elle; bağlayıcı yok.)*
2. Altı belirlenimci reklam KPI'sını sayın. *(CTR, CPC, CPA, CPL, ROAS, ROI.)*
3. Yönetici panosu otonom bir ajan mıdır? *(Hayır — tek bir yapay zekâ sentez çağrısı.)*
4. CS sağlık/benimseme sayıları nereden gelir? *(Yönetici dışa aktarır/paylaşır — satıcı
   telemetrisi yok.)*

---

## Module 9 — Operations (day-to-day) / Modül 9 — Operasyonlar (günlük)

### EN

**Learning objectives**

- Run the web/worker/ops processes reliably and scale them.
- Perform routine day-2 tasks and understand recovery behavior.

**Key steps**

1. **Processes & scaling:** Web is stateless (session in a signed cookie) — scale
   horizontally. Workers claim jobs with a guarded atomic update — scale horizontally;
   a crashed worker's in-flight jobs are re-driven on lease expiry. Raise
   `DATABASE_MAX_CONNECTIONS` with Postgres capacity, respecting the pool-sizing rule.
2. **Routine tasks:** schedule full + incremental backups (`ops.js`, `BackupService`)
   and verify restores periodically; monitor DLQ depth (growth ⇒ a failing handler —
   inspect, fix, re-drive); keep a stable `SESSION_SECRET` so sessions survive restarts.
3. **Health & readiness:** dependency verification at startup (config → DB →
   migrations) gates readiness; a failed dependency prevents "ready". Scrape `/metrics`
   and alert on error rate > 0 and queue-depth growth.
4. **Security operations:** `AUTH_MODE=password` (Argon2id), `AUTH_SECURE_COOKIES=true`,
   HTTPS in front; brute-force lockout is automatic; security headers/CSP apply to every
   response.
5. **Disaster recovery:** recovery is an ordered sequence of steps (config → dependency →
   migration → backup-restore → queue-recovery → consistency) run by the
   `RecoveryManager`, producing a report with measured **RTO** and **RPO**. Restart
   modes: cold start, warm restart, rolling restart, graceful shutdown/startup. Migrations
   are forward-only and idempotent (re-running is a no-op). See `DISASTER_RECOVERY.md` and
   `RUNBOOK.md`.

**Knowledge check**

1. Why can the web process scale horizontally? *(It is stateless — session in a signed
   cookie.)*
2. What happens to a crashed worker's in-flight jobs? *(Re-driven on lease expiry.)*
3. Are migrations safe to re-run? *(Yes — forward-only and idempotent.)*
4. What two measures does a recovery report produce? *(RTO and RPO.)*

### TR

**Öğrenme hedefleri**

- Web/worker/ops süreçlerini güvenilir biçimde çalıştırmak ve ölçeklemek.
- Rutin gün-2 görevlerini yapmak ve kurtarma davranışını anlamak.

**Temel adımlar**

1. **Süreçler ve ölçekleme:** Web durumsuzdur (oturum imzalı bir çerezde) — yatay
   ölçekleyin. Worker'lar işleri korumalı bir atomik güncellemeyle alır — yatay
   ölçekleyin; çöken bir worker'ın uçuştaki işleri kira süresi dolduğunda yeniden sürülür.
   Havuz-boyutlandırma kuralına uyarak `DATABASE_MAX_CONNECTIONS`'ı Postgres kapasitesiyle
   artırın.
2. **Rutin görevler:** tam + artımlı yedekleri zamanlayın (`ops.js`, `BackupService`) ve
   geri yüklemeleri periyodik olarak doğrulayın; DLQ derinliğini izleyin (büyüme ⇒ başarısız
   bir işleyici — inceleyin, düzeltin, yeniden sürün); oturumların yeniden başlatmalarda
   hayatta kalması için sabit bir `SESSION_SECRET` tutun.
3. **Sağlık ve hazırlık:** başlangıçta bağımlılık doğrulaması (config → DB → geçişler)
   hazırlığı kapılar; başarısız bir bağımlılık "hazır" olmayı engeller. `/metrics` toplayın
   ve hata oranı > 0 ile kuyruk derinliği büyümesinde uyarı verin.
4. **Güvenlik operasyonları:** `AUTH_MODE=password` (Argon2id), `AUTH_SECURE_COOKIES=true`,
   önde HTTPS; kaba kuvvet kilitlemesi otomatiktir; güvenlik başlıkları/CSP her yanıta
   uygulanır.
5. **Felaket kurtarma:** kurtarma, `RecoveryManager` tarafından çalıştırılan sıralı bir
   adımlar dizisidir (config → bağımlılık → geçiş → yedek-geri yükleme → kuyruk-kurtarma →
   tutarlılık) ve ölçülen **RTO** ve **RPO** ile bir rapor üretir. Yeniden başlatma modları:
   soğuk başlatma, sıcak yeniden başlatma, aşamalı (rolling) yeniden başlatma, düzgün
   kapatma/başlatma. Geçişler yalnızca-ileri ve idempotenttir (yeniden çalıştırma bir
   no-op'tur). Bkz. `DISASTER_RECOVERY.md` ve `RUNBOOK.md`.

**Bilgi kontrolü**

1. Web süreci neden yatay ölçeklenebilir? *(Durumsuzdur — oturum imzalı bir çerezde.)*
2. Çöken bir worker'ın uçuştaki işlerine ne olur? *(Kira süresi dolduğunda yeniden sürülür.)*
3. Geçişleri yeniden çalıştırmak güvenli mi? *(Evet — yalnızca-ileri ve idempotent.)*
4. Bir kurtarma raporu hangi iki ölçüyü üretir? *(RTO ve RPO.)*

---

## Assessment / Değerlendirme

### EN

**Format.** 20 questions drawn from the bank below (multiple-choice + short answer),
covering all nine modules. **Passing score: 80%** (16/20). Two modules are weighted
"must-pass": you must answer **all** AI-locality questions (Module 3) and **all** RBAC
/ security-honesty questions (Module 4) correctly, because misstating these creates
customer risk. Open-book against this document and `PRODUCT_TRUTH.md`. Retake allowed
after review.

**Question bank (representative)**

1. What is AdOS's correct category label? *(Enterprise AI Operating System for
   Advertising — never "Advertising Operating System".)*
2. Does the default AI need a model server, cloud, or API key? *(No — deterministic
   `OfflineAIManager`.)*
3. Name the supported local engines. *(Ollama; OpenAI-compatible: vLLM, LM Studio,
   llama.cpp, SGLang.)*
4. Is there per-token billing? *(No — inference is 100% local.)*
5. How is persistence enabled and what is the default? *(`DATABASE_URL`; default is
   in-memory.)*
6. Is tenant isolation DB-level RLS? *(No — application-level `TenantContext`.)*
7. Which password algorithm is used? *(Argon2id.)*
8. State the brute-force lockout rule. *(5 failures / 15 min per (ip, email) → 429.)*
9. List the security headers applied to every response. *(CSP, X-Content-Type-Options,
   X-Frame-Options: DENY, Referrer-Policy, Permissions-Policy, COOP/CORP, HSTS.)*
10. Is RBAC enforced? *(No — roles defined but not enforced; Roadmap.)*
11. How is each backup protected? *(gzip + AES-256-GCM + SHA-256.)*
12. Full vs incremental restore — how does incremental reassemble? *(Parent chain, in
    order.)*
13. How big is the web activity ring, and is it an audit trail? *(50, in memory; not an
    immutable audit trail.)*
14. Where are metrics exposed? *(`/metrics`.)*
15. Does AdOS send usage telemetry to the vendor? *(No.)*
16. How do campaign metrics enter the system? *(Hand-entered via a form; no connectors.)*
17. Name the six ad KPIs. *(CTR, CPC, CPA, CPL, ROAS, ROI.)*
18. What are the three runnable processes? *(Web, Worker, Ops.)*
19. Why can web scale horizontally? *(Stateless; session in a signed cookie.)*
20. What does a recovery report measure? *(RTO and RPO.)*
21. Does AdOS launch live ads? *(No — drafts only.)*
22. What language does AI output follow? *(Request locale / `Accept-Language`, TR or EN.)*
23. What happens on invalid required config? *(Fail-fast; never reports ready.)*
24. Which is the must-not-say Turkish label? *("Reklam İşletim Sistemi".)*

### TR

**Biçim.** Aşağıdaki bankadan çekilen 20 soru (çoktan seçmeli + kısa yanıt), dokuz
modülün tümünü kapsar. **Geçme notu: %80** (20 üzerinden 16). İki modül "mutlaka geçilmeli"
ağırlığındadır: **tüm** yapay zekâ-yerellik sorularını (Modül 3) ve **tüm** RBAC /
güvenlik-dürüstlüğü sorularını (Modül 4) doğru yanıtlamalısınız; çünkü bunları yanlış
ifade etmek müşteri riski yaratır. Bu belge ve `PRODUCT_TRUTH.md` ile açık kitap. İnceleme
sonrası yeniden sınav hakkı vardır.

**Soru bankası (temsilî)**

1. AdOS'un doğru kategori etiketi nedir? *(Reklam için Kurumsal Yapay Zekâ İşletim
   Sistemi — asla "Reklam İşletim Sistemi" değil.)*
2. Varsayılan yapay zekâ bir model sunucusu, bulut veya API anahtarı gerektirir mi?
   *(Hayır — belirlenimci `OfflineAIManager`.)*
3. Desteklenen yerel motorları sayın. *(Ollama; OpenAI uyumlu: vLLM, LM Studio, llama.cpp,
   SGLang.)*
4. Jeton başına ücretlendirme var mı? *(Hayır — çıkarım %100 yerel.)*
5. Kalıcılık nasıl etkinleştirilir ve varsayılan nedir? *(`DATABASE_URL`; varsayılan
   bellek içi.)*
6. Kiracı izolasyonu veritabanı düzeyinde RLS mi? *(Hayır — uygulama düzeyinde
   `TenantContext`.)*
7. Hangi parola algoritması kullanılır? *(Argon2id.)*
8. Kaba kuvvet kilitleme kuralını belirtin. *((ip, email) başına 5 başarısızlık / 15
   dakika → 429.)*
9. Her yanıta uygulanan güvenlik başlıklarını listeleyin. *(CSP, X-Content-Type-Options,
   X-Frame-Options: DENY, Referrer-Policy, Permissions-Policy, COOP/CORP, HSTS.)*
10. RBAC uygulanıyor mu? *(Hayır — roller tanımlı ama uygulanmıyor; Yol Haritası.)*
11. Her yedek nasıl korunur? *(gzip + AES-256-GCM + SHA-256.)*
12. Tam ile artımlı geri yükleme — artımlı nasıl yeniden birleşir? *(Ebeveyn zinciri,
    sırayla.)*
13. Web etkinlik halkası ne kadar büyük ve bir denetim izi mi? *(50, bellek içinde;
    değiştirilemez bir denetim izi değil.)*
14. Metrikler nerede sunulur? *(`/metrics`.)*
15. AdOS satıcıya kullanım telemetrisi gönderir mi? *(Hayır.)*
16. Kampanya metrikleri sisteme nasıl girer? *(Bir form aracılığıyla elle; bağlayıcı yok.)*
17. Altı reklam KPI'sını sayın. *(CTR, CPC, CPA, CPL, ROAS, ROI.)*
18. Çalıştırılabilir üç süreç nedir? *(Web, Worker, Ops.)*
19. Web neden yatay ölçeklenebilir? *(Durumsuz; oturum imzalı çerezde.)*
20. Bir kurtarma raporu neyi ölçer? *(RTO ve RPO.)*
21. AdOS canlı reklam başlatır mı? *(Hayır — yalnızca taslak.)*
22. Yapay zekâ çıktısı hangi dili izler? *(İstek yereli / `Accept-Language`, TR veya EN.)*
23. Geçersiz zorunlu yapılandırmada ne olur? *(Fail-fast; asla hazır olduğunu bildirmez.)*
24. Söylenmemesi gereken Türkçe etiket hangisidir? *("Reklam İşletim Sistemi".)*

---

## Certification pathway / Sertifikasyon yolu

### EN

This course prepares you for the **Administrator** certification — the third of six
levels: **Associate → Professional → Administrator → Architect → Partner → Trainer**
(see `CERTIFICATION_PROGRAM.md`).

- **Prerequisite:** Professional-level familiarity with the AdOS pipeline (Mission →
  brief → creative → draft → report → dashboard) and human-approval gates.
- **This course:** the nine modules above (install, configure, AI, security, backup,
  monitoring, troubleshooting, reporting, operations).
- **To certify:** pass the Assessment at **≥ 80%** with all Module 3 (AI-locality) and
  Module 4 (RBAC/security-honesty) must-pass items correct, plus a practical: stand up a
  hardened instance (password auth, HTTPS/HSTS, Postgres, a local model, a verified
  backup restore) and demonstrate reading the activity log and `/metrics`.
- **Next step:** the **Architect** track (technical adoption at scale — local model
  sizing, persistence, multi-brand tenancy, DR rehearsal), aligned with the
  **Solution Architect** CS role.

### TR

Bu ders sizi **Yönetici (Administrator)** sertifikasyonuna hazırlar — altı seviyeden
üçüncüsü: **Associate → Professional → Administrator → Architect → Partner → Trainer**
(bkz. `CERTIFICATION_PROGRAM.md`).

- **Ön koşul:** AdOS hattına (Mission → brif → yaratıcı → taslak → rapor → pano) ve
  insan-onay kapılarına Professional düzeyinde aşinalık.
- **Bu ders:** yukarıdaki dokuz modül (kurulum, yapılandırma, yapay zekâ, güvenlik,
  yedekleme, izleme, sorun giderme, raporlama, operasyonlar).
- **Sertifika için:** Değerlendirmeyi **≥ %80** ile geçin; Modül 3 (yapay zekâ-yerellik)
  ve Modül 4 (RBAC/güvenlik-dürüstlüğü) mutlaka-geç maddelerinin tümü doğru olmalı; ayrıca
  bir uygulama sınavı: sıkılaştırılmış bir örnek ayağa kaldırın (parola kimlik doğrulama,
  HTTPS/HSTS, Postgres, yerel bir model, doğrulanmış bir yedek geri yükleme) ve etkinlik
  günlüğü ile `/metrics` okumayı gösterin.
- **Sonraki adım:** **Architect** izi (ölçekte teknik benimseme — yerel model
  boyutlandırma, kalıcılık, çok-markalı kiracılık, DR tatbikatı), **Solution Architect**
  CS rolüyle uyumlu.

---

## Roadmap (future admin capabilities) / Yol Haritası (gelecekteki yönetici yetenekleri)

### EN

> **Roadmap — not available today.** The items below are **future** directions, **not**
> current product capabilities. Never present them to a customer as something AdOS does
> now. They are listed here so administrators can plan and set expectations honestly.

- **Enforced RBAC / permission-aware AI** — roles today are defined but **not enforced**;
  future enforcement would gate routes and scope what the AI surfaces.
- **Immutable / tamper-evident audit trail** — today there is an activity log
  (bounded ring) + per-approval timeline + structured logs; a future append-only audit
  store is planned.
- **Database-level Row-Level Security (RLS)** — isolation today is application-level;
  DB-level RLS is future.
- **External connectors / syncs** to ad platforms, CRMs, and data warehouses — today
  metrics are hand-entered; connector-hub is an unwired scaffold.
- **Live ad launch & optimization** — today AdOS produces **drafts** only; publishing/
  optimizing live campaigns is future.
- **Autonomous agents / "Digital Employees"** doing real work — today the pipeline is
  human-gated and AI-assisted; agent/autonomy layers are stubs.
- **Cloud / hosted inference** — today inference is 100% local; a cloud-inference flag
  exists but is never read.
- **Vision / speech / image / video AI** — declared in a capability enum with no engine;
  future.
- **Tiered approval authority (T0–T4 spend limits)** — today only approval **gates**
  exist (`strategy_and_budget`, `creative_assets`, `campaign_launch`); no tiered
  authority model.
- **Document knowledge base / document Q&A with cited answers** — today the Company
  Brain stores marketing-performance data only; no document ingestion, no citations.

### TR

> **Yol Haritası — bugün mevcut değil.** Aşağıdaki maddeler **gelecekteki** yönlerdir,
> mevcut ürün yetenekleri **değildir**. Bunları bir müşteriye AdOS'un şu anda yaptığı bir
> şey olarak asla sunmayın. Yöneticiler dürüstçe planlama yapıp beklenti belirleyebilsin
> diye burada listelenmiştir.

- **Zorunlu (enforced) RBAC / izin-farkında yapay zekâ** — roller bugün tanımlıdır ama
  **uygulanmaz**; gelecekteki uygulama, rotaları kapılar ve yapay zekânın gösterdiğini
  kapsardı.
- **Değiştirilemez / kurcalamaya dayanıklı denetim izi** — bugün bir etkinlik günlüğü
  (sınırlı halka) + onay başına zaman çizelgesi + yapılandırılmış günlükler vardır;
  gelecekte yalnızca-ekle bir denetim deposu planlanıyor.
- **Veritabanı düzeyinde Satır Düzeyi Güvenlik (RLS)** — izolasyon bugün uygulama
  düzeyindedir; DB düzeyinde RLS gelecektedir.
- **Harici bağlayıcılar / senkronizasyonlar** (reklam platformları, CRM'ler, veri
  ambarları) — bugün metrikler elle girilir; connector-hub bağlanmamış bir iskelettir.
- **Canlı reklam başlatma ve optimizasyon** — bugün AdOS yalnızca **taslak** üretir;
  canlı kampanyaları yayımlamak/optimize etmek gelecektedir.
- **Otonom ajanlar / "Dijital Çalışanlar"** gerçek iş yapan — bugün hat insan-kapılı ve
  yapay zekâ-desteklidir; ajan/otonomi katmanları taslaktır.
- **Bulut / barındırılan çıkarım** — bugün çıkarım %100 yereldir; bir bulut-çıkarım
  bayrağı vardır ama asla okunmaz.
- **Görüntü / konuşma / imge / video yapay zekâsı** — motoru olmayan bir yetenek enum'unda
  bildirilmiştir; gelecektedir.
- **Kademeli onay yetkisi (T0–T4 harcama limitleri)** — bugün yalnızca onay **kapıları**
  vardır (`strategy_and_budget`, `creative_assets`, `campaign_launch`); kademeli yetki
  modeli yoktur.
- **Belge bilgi tabanı / alıntılı yanıtlarla belge Soru-Cevap** — bugün Company Brain
  yalnızca pazarlama-performansı verisi saklar; belge alımı yok, alıntı yok.

---

## Footer / Alt Bilgi

**EN —** Documentation only. No application code, packages, domains, or tests were
modified. Aligned to PRODUCT_TRUTH.md.

**TR —** Yalnızca belgelendirme. Hiçbir uygulama kodu, paket, alan (domain) veya test
değiştirilmedi. PRODUCT_TRUTH.md ile uyumludur.
