// Bilingual content for the AdOS corporate website.
// Source of truth for copy: website/WEBSITE_COPY.md. Static, no backend.

export type Locale = 'en' | 'tr';

export interface Feature {
  title: string;
  body: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface PageMeta {
  title: string;
  description: string;
}

export interface Content {
  meta: Record<string, PageMeta>;
  nav: {
    product: string;
    solutions: string;
    security: string;
    pricing: string;
    company: string;
    docs: string;
    signIn: string;
    bookDemo: string;
    localAi: string;
    onPrem: string;
    offline: string;
    about: string;
    contact: string;
  };
  cta: {
    bookDemo: string;
    talkToSales: string;
    howItWorks: string;
    exploreSecurity: string;
    securityBriefing: string;
    backHome: string;
    readMore: string;
  };
  home: {
    eyebrow: string;
    headline: string;
    subhero: string;
    trustStrip: string;
    logoLabel: string;
    problemTitle: string;
    problemBody: string;
    pipelineTitle: string;
    pipelineBody: string;
    pipelineSteps: Feature[];
    approvalNote: string;
    sovTitle: string;
    sovBody: string;
    sovCaption: string;
    secTitle: string;
    secCards: string[];
    localTitle: string;
    localBody: string;
    useTitle: string;
    useCards: Feature[];
    bilingual: string;
    ctaTitle: string;
    ctaBody: string;
  };
  security: {
    h1: string;
    subhero: string;
    controls: Feature[];
    compliance: string;
  };
  local: {
    h1: string;
    subhero: string;
    features: Feature[];
    note: string;
    engines: string[];
  };
  offline: {
    h1: string;
    subhero: string;
    features: Feature[];
  };
  onprem: {
    h1: string;
    subhero: string;
    features: Feature[];
    requirements: string;
  };
  product: {
    h1: string;
    subhero: string;
    features: Feature[];
  };
  pricing: {
    h1: string;
    subhero: string;
    tiers: Feature[];
    custom: string;
    note: string;
  };
  about: {
    h1: string;
    subhero: string;
    mission: string;
    principlesTitle: string;
    principles: string[];
  };
  contact: {
    h1: string;
    subhero: string;
    fields: { name: string; email: string; company: string; message: string };
    submit: string;
    response: string;
  };
  demo: {
    h1: string;
    subhero: string;
    fields: {
      email: string;
      name: string;
      company: string;
      role: string;
      size: string;
      country: string;
      goal: string;
      consent: string;
    };
    submit: string;
    successTitle: string;
    successBody: string;
  };
  faq: { title: string; items: FaqItem[] };
  footer: {
    positioning: string;
    cols: { product: string; solutions: string; resources: string; company: string; legal: string };
    cookiePrefs: string;
    security: string;
    copyright: string;
    entity: string;
  };
  legal: {
    privacy: { h1: string; summary: string; sections: Feature[]; updated: string };
    cookies: { h1: string; summary: string; categories: Feature[] };
    terms: { h1: string; summary: string; sections: Feature[]; updated: string };
  };
  notFound: { title: string; body: string };
}

const en: Content = {
  meta: {
    home: { title: 'AdOS — The Enterprise AI Operating System', description: 'Run an autonomous AI ad agency entirely on your own infrastructure. Local AI, no cloud, no API keys, no data egress.' },
    security: { title: 'Security — AdOS', description: 'Enterprise security by architecture: multi-tenant isolation, Argon2id, encrypted backups, disaster recovery. No cloud, no data egress.' },
    local: { title: 'Local AI — AdOS', description: 'The models run on your hardware. Runs on Ollama, vLLM, LM Studio and more. No cloud call, no API key.' },
    offline: { title: 'Offline AI — AdOS', description: 'Offline-first. Runs in air-gapped environments with no outbound connection required.' },
    onprem: { title: 'On-Prem — AdOS', description: 'Deploy AdOS in your own data center, private cloud or bare metal. A Docker stack you operate.' },
    product: { title: 'Product — AdOS', description: 'One platform for the whole advertising workflow, with a human approval gate at every stage.' },
    pricing: { title: 'Pricing — AdOS', description: 'Pricing tailored to your on-prem deployment, tenants and support level.' },
    about: { title: 'About — AdOS', description: 'We build advertising infrastructure that respects your data.' },
    contact: { title: 'Contact — AdOS', description: 'Talk to the AdOS team about sales, security or support.' },
    demo: { title: 'Book a demo — AdOS', description: 'See AdOS run on your terms — tailored to your industry and security requirements.' },
    privacy: { title: 'Privacy Policy — AdOS', description: 'How the AdOS marketing website handles your data.' },
    cookies: { title: 'Cookie Policy — AdOS', description: 'How AdOS uses cookies and how to manage your preferences.' },
    terms: { title: 'Terms of Service — AdOS', description: 'Terms governing use of the AdOS website.' },
    notFound: { title: 'Not found — AdOS', description: 'The page you are looking for is not here.' },
  },
  nav: {
    product: 'Product', solutions: 'Solutions', security: 'Security', pricing: 'Pricing',
    company: 'Company', docs: 'Docs', signIn: 'Sign in', bookDemo: 'Book a demo',
    localAi: 'Local AI', onPrem: 'On-Prem', offline: 'Offline AI', about: 'About', contact: 'Contact',
  },
  cta: {
    bookDemo: 'Book a demo', talkToSales: 'Talk to sales', howItWorks: 'See how it works',
    exploreSecurity: 'Explore security', securityBriefing: 'Request a security briefing',
    backHome: 'Back to home', readMore: 'Read more',
  },
  home: {
    eyebrow: 'The Enterprise AI Operating System',
    headline: 'Run an AI ad agency inside your own walls.',
    subhero: 'AdOS plans and runs your campaigns end to end — using AI models that stay entirely on your own infrastructure. No cloud. No API keys. No data leaving the building.',
    trustStrip: '100% local models · No cloud · No API keys · Your data never leaves your network',
    logoLabel: 'Runs on the local engines you already use',
    problemTitle: 'Cloud AI asks you to hand over your data. That is a non-starter.',
    problemBody: 'For regulated and data-sensitive organizations, sending customer data to a third-party AI service is not an option. AdOS was built the other way around: the models come to your data, not the reverse.',
    pipelineTitle: 'From a single objective to a finished campaign.',
    pipelineBody: 'State a business objective. AdOS produces the marketing brief, the creative, the campaign plan, the analytics, and the executive summary — pausing for your approval at every step.',
    pipelineSteps: [
      { title: 'Brief', body: 'Strategy, audience, channels, KPIs.' },
      { title: 'Creative', body: 'Headline, copy, social, landing, email.' },
      { title: 'Campaign', body: 'Channels, budget, ad sets, schedule.' },
      { title: 'Analytics', body: 'Real results, KPIs, recommendations.' },
      { title: 'Executive', body: 'Verdict, key results, next actions.' },
    ],
    approvalNote: 'You approve every stage before the next begins.',
    sovTitle: 'Your data never leaves your perimeter.',
    sovBody: 'Every prompt, asset and result stays inside your network. The AI Manager only ever talks to a model running on your own hardware — there is no external endpoint to leak to.',
    sovCaption: 'Request → local AI Manager → local model. Nothing crosses the line.',
    secTitle: 'Enterprise security, built in from the first line.',
    secCards: [
      'Strict multi-tenancy — every query, event and file is scoped to one tenant.',
      'Argon2id credentials, security headers, CSP, rate limiting.',
      'Encrypted, verifiable backups and a documented recovery path.',
    ],
    localTitle: 'The models run on your machines.',
    localBody: 'AdOS runs on the local inference engines you already know — Ollama, vLLM, LM Studio and more. Choose your model, keep your data, pay no per-token bill.',
    useTitle: 'Built for organizations that cannot compromise on data.',
    useCards: [
      { title: 'Regulated industries', body: 'Finance, healthcare, public sector — meet data-residency requirements by architecture.' },
      { title: 'Agencies & groups', body: 'Serve many clients on one platform, each fully isolated.' },
      { title: 'IT & platform teams', body: 'Deploy with Docker, run it yourself, keep full control.' },
    ],
    bilingual: 'Available in Turkish and English — the interface and the AI output follow each user’s language automatically.',
    ctaTitle: 'See AdOS run on your own infrastructure.',
    ctaBody: 'Book a walkthrough with our team, or talk to sales about an on-prem deployment.',
  },
  security: {
    h1: 'Security is our architecture, not a paragraph.',
    subhero: 'Because AdOS runs on your infrastructure with local models, there is no cloud endpoint and no data egress. The rest is defense in depth.',
    controls: [
      { title: 'Tenant isolation', body: 'Every query, event, background job and stored file is scoped to a single tenant. Tenants cannot see each other.' },
      { title: 'Authentication', body: 'Production authentication uses Argon2id password hashing with constant-time verification.' },
      { title: 'Hardening', body: 'A full set of security headers and a strict content security policy on every response; brute-force lockout and rate limiting on sign-in.' },
      { title: 'Backups', body: 'Backups are compressed, AES-256-GCM encrypted and checksum-verified, with incremental chains.' },
      { title: 'Recovery', body: 'A documented disaster-recovery path with measured recovery objectives.' },
      { title: 'Audit', body: 'Every action emits a tenant-scoped audit event you can monitor.' },
    ],
    compliance: 'Data residency and sovereignty are met by architecture. We support KVKK and GDPR obligations and provide a Data Processing Addendum. Certifications in progress are stated honestly — we never claim what we do not hold.',
  },
  local: {
    h1: 'The models run on your hardware. Full stop.',
    subhero: 'AdOS drives a local inference engine on your own machines. There is no cloud call, no API key, and no per-token bill.',
    features: [
      { title: 'Open engines', body: 'Runs on Ollama, vLLM, LM Studio, llama.cpp and SGLang — the engines you already run.' },
      { title: 'Your model', body: 'Choose any open local model and swap it freely; nothing downstream changes.' },
      { title: 'Governed', body: 'One internal interface mediates all AI, so output is structured and validated — no agent talks to a model directly.' },
      { title: 'Bilingual', body: 'Output follows the user’s language automatically, Turkish or English.' },
    ],
    note: 'Local model quality and speed depend on your hardware. A deterministic offline mode also lets AdOS run before any model server is attached.',
    engines: ['Ollama', 'vLLM', 'LM Studio', 'llama.cpp', 'SGLang'],
  },
  offline: {
    h1: 'Built to work with no internet at all.',
    subhero: 'AdOS is offline-first. It runs in air-gapped environments and needs no outbound connection for its core operation.',
    features: [
      { title: 'Air-gapped', body: 'Deploy in fully isolated networks; core operation makes no external calls.' },
      { title: 'Self-contained', body: 'Every dependency is self-hostable. There is no runtime dependency on an external service.' },
      { title: 'Ready before models', body: 'A deterministic offline manager means AdOS is functional even before a model server is connected.' },
    ],
  },
  onprem: {
    h1: 'Your infrastructure. Your rules.',
    subhero: 'AdOS deploys where you already run software — your data center, private cloud or bare metal — as a container stack you operate.',
    features: [
      { title: 'Deploy', body: 'A Docker stack: web, workers, database and observability.' },
      { title: 'Operate', body: 'Documented installation, upgrades, backups and recovery. Upgrades are forward-only and safe to re-run.' },
      { title: 'No lock-in', body: 'Open engines, standard PostgreSQL, portable data and exportable backups.' },
      { title: 'Scale', body: 'A stateless web tier, horizontally-scalable workers and a tunable database pool.' },
    ],
    requirements: 'Requires Node 20 or later, a container runtime, and — for real models — a local inference engine and suitable hardware.',
  },
  product: {
    h1: 'One platform for the whole advertising workflow.',
    subhero: 'From onboarding a client to an executive report, AdOS runs the agency workflow as a governed, multi-tenant system you host yourself.',
    features: [
      { title: 'Missions', body: 'State the goal, the budget and the target metric. AdOS plans the rest.' },
      { title: 'Approvals', body: 'Review and approve each stage — brief, creative, campaign — before it advances.' },
      { title: 'Assets', body: 'A versioned library of creative — nothing is overwritten.' },
      { title: 'Analytics', body: 'Enter real results; AdOS computes KPIs and writes the executive summary.' },
      { title: 'Learning', body: 'Every campaign’s outcome is recorded so the system improves over time.' },
    ],
  },
  pricing: {
    h1: 'Pricing that fits your deployment.',
    subhero: 'AdOS is licensed for on-prem deployment. Pricing depends on scale, tenants and support level.',
    tiers: [
      { title: 'Team', body: 'A single deployment for one organization.' },
      { title: 'Enterprise', body: 'Multi-tenant, priority support, disaster-recovery assistance.' },
      { title: 'Sovereign', body: 'Air-gapped deployment with hands-on onboarding.' },
    ],
    custom: 'Custom',
    note: 'Public pricing will be published as it is finalized.',
  },
  about: {
    h1: 'We build advertising infrastructure that respects your data.',
    subhero: 'AdOS exists for organizations that need modern AI advertising but cannot — and should not — send their data to someone else’s cloud.',
    mission: 'Our mission is simple: bring the AI to your data, never the other way around.',
    principlesTitle: 'What we stand for',
    principles: [
      'Sovereignty — you own the models, the data and the hardware.',
      'Honesty — every claim is backed by a real mechanism.',
      'Control — the AI works for you, and you approve every step.',
    ],
  },
  contact: {
    h1: 'Talk to the AdOS team.',
    subhero: 'Tell us what you need to protect and what you want to achieve. We will match you to the right person.',
    fields: { name: 'Full name', email: 'Work email', company: 'Company', message: 'How can we help?' },
    submit: 'Send message',
    response: 'We reply to enterprise enquiries within two business days.',
  },
  demo: {
    h1: 'See AdOS run on your terms.',
    subhero: 'A short, focused walkthrough with our team — tailored to your industry and your security requirements.',
    fields: {
      email: 'Work email', name: 'Full name', company: 'Company', role: 'Your role',
      size: 'Company size', country: 'Country / data-residency need', goal: 'What do you want to protect or achieve?',
      consent: 'I agree to the privacy policy.',
    },
    submit: 'Book my demo',
    successTitle: 'Your request is in.',
    successBody: 'Thank you. A member of our team will reach out within two business days to arrange your walkthrough.',
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      { q: 'Does any of our data go to the cloud?', a: 'No. AdOS runs on your infrastructure and the AI models run locally. There is no cloud endpoint and no API key.' },
      { q: 'Which AI models can we use?', a: 'Any open local model served by Ollama, vLLM, LM Studio, llama.cpp or SGLang. You can swap models without changing anything else.' },
      { q: 'Is it truly multi-tenant?', a: 'Yes. Every query, event, job and file is scoped to a single tenant; tenants cannot see one another’s data.' },
      { q: 'How is it deployed?', a: 'As a self-hosted Docker stack in your own environment, with documented install, upgrade, backup and recovery.' },
      { q: 'Does it work offline?', a: 'Yes. AdOS is offline-first and runs in air-gapped networks.' },
      { q: 'Is it available in Turkish?', a: 'Yes. The interface and the AI output are fully bilingual, Turkish and English.' },
    ],
  },
  footer: {
    positioning: 'The Enterprise AI Operating System — enterprise AI advertising that never leaves your building.',
    cols: { product: 'Product', solutions: 'Solutions', resources: 'Resources', company: 'Company', legal: 'Legal' },
    cookiePrefs: 'Cookie preferences',
    security: 'Report a vulnerability',
    copyright: 'All rights reserved.',
    entity: 'AdOS. Registered address available on request.',
  },
  legal: {
    privacy: {
      h1: 'Privacy Policy',
      summary: 'This policy covers the AdOS marketing website. It explains what we collect when you browse or contact us. The AdOS product runs on your own infrastructure and processes your customer data there — we do not receive it.',
      sections: [
        { title: 'What we collect', body: 'Contact and demo forms (name, work email, company, message) and consented analytics.' },
        { title: 'Why', body: 'To respond to your enquiry and to improve the website. We do not sell your data.' },
        { title: 'Your rights', body: 'You may request access, correction or deletion of your data at any time.' },
      ],
      updated: 'Last updated: 2026-07-26',
    },
    cookies: {
      h1: 'Cookie Policy',
      summary: 'We use strictly-necessary cookies to run the site, and — only with your consent — analytics and preference cookies. You can change your choices at any time.',
      categories: [
        { title: 'Necessary', body: 'Required for the site to function. Always on.' },
        { title: 'Analytics', body: 'Help us understand usage. Off until you accept.' },
        { title: 'Preferences', body: 'Remember your language and theme. Off until you accept.' },
      ],
    },
    terms: {
      h1: 'Terms of Service',
      summary: 'These terms govern your use of the AdOS website. Product use is governed by your separate license agreement.',
      sections: [
        { title: 'Use', body: 'Use the site lawfully and do not attempt to disrupt it.' },
        { title: 'Intellectual property', body: 'All content and marks are the property of AdOS unless stated otherwise.' },
        { title: 'Disclaimer', body: 'The site is provided “as is,” without warranties, to the extent permitted by law.' },
      ],
      updated: 'Last updated: 2026-07-26',
    },
  },
  notFound: { title: 'That page isn’t here.', body: 'The page you’re looking for may have moved. Let’s get you back on track.' },
};

const tr: Content = {
  meta: {
    home: { title: 'AdOS — Kurumsal Yapay Zekâ İşletim Sistemi', description: 'Otonom bir yapay zekâ reklam ajansını tamamen kendi altyapınızda çalıştırın. Yerel yapay zekâ, bulut yok, API anahtarı yok, veri çıkışı yok.' },
    security: { title: 'Güvenlik — AdOS', description: 'Mimariyle kurumsal güvenlik: çok kiracılı izolasyon, Argon2id, şifreli yedekler, felaket kurtarma. Bulut yok, veri çıkışı yok.' },
    local: { title: 'Yerel Yapay Zekâ — AdOS', description: 'Modeller sizin donanımınızda çalışır. Ollama, vLLM, LM Studio ve daha fazlasıyla çalışır. Bulut çağrısı yok, API anahtarı yok.' },
    offline: { title: 'Çevrimdışı Yapay Zekâ — AdOS', description: 'Çevrimdışı öncelikli. Dışa bağlantı gerektirmeden izole (air-gapped) ortamlarda çalışır.' },
    onprem: { title: 'Kurum İçi — AdOS', description: 'AdOS’u kendi veri merkezinizde, özel bulutunuzda ya da fiziksel sunucularınızda kurun. İşlettiğiniz bir Docker yığını.' },
    product: { title: 'Ürün — AdOS', description: 'Her aşamada insan onay adımıyla, tüm reklam iş akışı için tek platform.' },
    pricing: { title: 'Fiyatlandırma — AdOS', description: 'Kurum içi kurulumunuza, kiracı sayınıza ve destek seviyenize göre fiyatlandırma.' },
    about: { title: 'Hakkında — AdOS', description: 'Verinize saygı duyan reklam altyapısı geliştiriyoruz.' },
    contact: { title: 'İletişim — AdOS', description: 'Satış, güvenlik ya da destek için AdOS ekibiyle konuşun.' },
    demo: { title: 'Demo talep edin — AdOS', description: 'AdOS’u kendi koşullarınızda görün — sektörünüze ve güvenlik gereksinimlerinize göre uyarlanmış.' },
    privacy: { title: 'Gizlilik Politikası — AdOS', description: 'AdOS pazarlama web sitesi verilerinizi nasıl işler.' },
    cookies: { title: 'Çerez Politikası — AdOS', description: 'AdOS çerezleri nasıl kullanır ve tercihlerinizi nasıl yönetirsiniz.' },
    terms: { title: 'Kullanım Koşulları — AdOS', description: 'AdOS web sitesinin kullanımını düzenleyen koşullar.' },
    notFound: { title: 'Bulunamadı — AdOS', description: 'Aradığınız sayfa burada değil.' },
  },
  nav: {
    product: 'Ürün', solutions: 'Çözümler', security: 'Güvenlik', pricing: 'Fiyatlandırma',
    company: 'Şirket', docs: 'Dokümanlar', signIn: 'Giriş yap', bookDemo: 'Demo talep edin',
    localAi: 'Yerel Yapay Zekâ', onPrem: 'Kurum İçi', offline: 'Çevrimdışı Yapay Zekâ', about: 'Hakkında', contact: 'İletişim',
  },
  cta: {
    bookDemo: 'Demo talep edin', talkToSales: 'Satışa danışın', howItWorks: 'Nasıl çalıştığını görün',
    exploreSecurity: 'Güvenliği inceleyin', securityBriefing: 'Güvenlik brifingi isteyin',
    backHome: 'Ana sayfaya dön', readMore: 'Daha fazlası',
  },
  home: {
    eyebrow: 'Kurumsal Yapay Zekâ İşletim Sistemi',
    headline: 'Yapay zekâ reklam ajansını kendi duvarlarınızın içinde çalıştırın.',
    subhero: 'AdOS kampanyalarınızı baştan sona planlayıp yürütür — tamamen kendi altyapınızda kalan yapay zekâ modelleriyle. Bulut yok. API anahtarı yok. Verileriniz binadan çıkmaz.',
    trustStrip: '%100 yerel modeller · Bulut yok · API anahtarı yok · Verileriniz ağınızdan çıkmaz',
    logoLabel: 'Zaten kullandığınız yerel motorlarla çalışır',
    problemTitle: 'Bulut yapay zekâsı verilerinizi teslim etmenizi ister. Bu, en baştan kabul edilemez.',
    problemBody: 'Regüle ve veriye duyarlı kurumlar için müşteri verisini üçüncü taraf bir yapay zekâ servisine göndermek bir seçenek değildir. AdOS tam tersi kuruldu: modeller verinize gelir, veriniz modele gitmez.',
    pipelineTitle: 'Tek bir hedeften tamamlanmış bir kampanyaya.',
    pipelineBody: 'Bir iş hedefi belirtin. AdOS pazarlama brifini, kreatifi, kampanya planını, analitiği ve yönetici özetini üretir — her adımda onayınızı bekleyerek.',
    pipelineSteps: [
      { title: 'Brif', body: 'Strateji, hedef kitle, kanallar, KPI’lar.' },
      { title: 'Kreatif', body: 'Başlık, metin, sosyal, açılış sayfası, e-posta.' },
      { title: 'Kampanya', body: 'Kanallar, bütçe, reklam setleri, takvim.' },
      { title: 'Analitik', body: 'Gerçek sonuçlar, KPI’lar, öneriler.' },
      { title: 'Yönetim', body: 'Karar, ana sonuçlar, sonraki adımlar.' },
    ],
    approvalNote: 'Bir sonraki adım başlamadan önce her aşamayı siz onaylarsınız.',
    sovTitle: 'Verileriniz sınırlarınızın dışına çıkmaz.',
    sovBody: 'Her istem, her varlık ve her sonuç ağınızın içinde kalır. Yapay zekâ yöneticisi yalnızca kendi donanımınızda çalışan bir modelle konuşur — dışarıya sızabileceği bir uç nokta yoktur.',
    sovCaption: 'İstek → yerel yapay zekâ yöneticisi → yerel model. Hiçbir şey sınırı geçmez.',
    secTitle: 'Kurumsal güvenlik, ilk satırdan itibaren yerleşik.',
    secCards: [
      'Sıkı çok kiracılılık — her sorgu, olay ve dosya tek bir kiracıya sınırlıdır.',
      'Argon2id kimlik bilgileri, güvenlik başlıkları, CSP, hız sınırlama.',
      'Şifreli, doğrulanabilir yedekler ve belgelenmiş bir kurtarma yolu.',
    ],
    localTitle: 'Modeller sizin makinelerinizde çalışır.',
    localBody: 'AdOS zaten bildiğiniz yerel çıkarım motorlarıyla çalışır — Ollama, vLLM, LM Studio ve daha fazlası. Modelinizi seçin, verinizi koruyun, token başına ücret ödemeyin.',
    useTitle: 'Veriden ödün veremeyen kurumlar için kuruldu.',
    useCards: [
      { title: 'Regüle sektörler', body: 'Finans, sağlık, kamu — veri yerleşimi gereksinimlerini mimariyle karşılayın.' },
      { title: 'Ajanslar ve gruplar', body: 'Tek platformda birçok müşteriye hizmet verin, her biri tam izole.' },
      { title: 'BT ve platform ekipleri', body: 'Docker ile kurun, kendiniz çalıştırın, tüm kontrolü elde tutun.' },
    ],
    bilingual: 'Türkçe ve İngilizce mevcut — arayüz ve yapay zekâ çıktısı her kullanıcının diline otomatik uyar.',
    ctaTitle: 'AdOS’u kendi altyapınızda çalışırken görün.',
    ctaBody: 'Ekibimizle bir tanıtım planlayın ya da kurum içi kurulum için satışa danışın.',
  },
  security: {
    h1: 'Güvenlik bizim mimarimizdir, bir paragraf değil.',
    subhero: 'AdOS altyapınızda yerel modellerle çalıştığı için bulut uç noktası ve veri çıkışı yoktur. Gerisi katmanlı savunmadır.',
    controls: [
      { title: 'Kiracı izolasyonu', body: 'Her sorgu, olay, arka plan işi ve saklanan dosya tek bir kiracıya sınırlıdır. Kiracılar birbirini göremez.' },
      { title: 'Kimlik doğrulama', body: 'Üretim kimlik doğrulaması sabit zamanlı doğrulamayla Argon2id parola özetlemesi kullanır.' },
      { title: 'Sıkılaştırma', body: 'Her yanıtta eksiksiz güvenlik başlıkları ve sıkı bir içerik güvenlik politikası; girişte kaba kuvvet kilidi ve hız sınırlama.' },
      { title: 'Yedekler', body: 'Yedekler sıkıştırılır, AES-256-GCM ile şifrelenir ve sağlama ile doğrulanır; artımlı zincirlerle.' },
      { title: 'Kurtarma', body: 'Ölçülmüş kurtarma hedefleriyle belgelenmiş bir felaket kurtarma yolu.' },
      { title: 'Denetim', body: 'Her eylem, izleyebileceğiniz kiracıya özel bir denetim olayı üretir.' },
    ],
    compliance: 'Veri yerleşimi ve egemenliği mimariyle sağlanır. KVKK ve GDPR yükümlülüklerini destekler ve bir Veri İşleme Ek Sözleşmesi sunarız. Süren sertifikalar dürüstçe belirtilir — sahip olmadığımızı asla iddia etmeyiz.',
  },
  local: {
    h1: 'Modeller sizin donanımınızda çalışır. Nokta.',
    subhero: 'AdOS kendi makinelerinizdeki bir yerel çıkarım motorunu sürer. Bulut çağrısı, API anahtarı ve token başına ücret yoktur.',
    features: [
      { title: 'Açık motorlar', body: 'Ollama, vLLM, LM Studio, llama.cpp ve SGLang ile çalışır — zaten çalıştırdığınız motorlar.' },
      { title: 'Sizin modeliniz', body: 'Herhangi bir açık yerel modeli seçin ve serbestçe değiştirin; sonraki hiçbir şey değişmez.' },
      { title: 'Yönetişimli', body: 'Tek bir dahili arayüz tüm yapay zekâyı yönetir, böylece çıktı yapılandırılmış ve doğrulanmıştır — hiçbir ajan modelle doğrudan konuşmaz.' },
      { title: 'İki dilli', body: 'Çıktı, kullanıcının diline otomatik uyar; Türkçe ya da İngilizce.' },
    ],
    note: 'Yerel model kalitesi ve hızı donanımınıza bağlıdır. Belirlenimci bir çevrimdışı mod, henüz bir model sunucusu bağlı değilken bile AdOS’un çalışmasını sağlar.',
    engines: ['Ollama', 'vLLM', 'LM Studio', 'llama.cpp', 'SGLang'],
  },
  offline: {
    h1: 'Hiç internet olmadan çalışacak şekilde kuruldu.',
    subhero: 'AdOS çevrimdışı önceliklidir. İzole (air-gapped) ortamlarda çalışır ve temel işleyişi için dışa bağlantıya ihtiyaç duymaz.',
    features: [
      { title: 'İzole ağ', body: 'Tamamen izole ağlarda kurun; temel işleyiş dış çağrı yapmaz.' },
      { title: 'Kendine yeten', body: 'Her bağımlılık kendi barındırılabilir. Dış bir servise çalışma zamanı bağımlılığı yoktur.' },
      { title: 'Modelden önce hazır', body: 'Belirlenimci bir çevrimdışı yönetici, model sunucusu bağlanmadan önce bile AdOS’un işlevsel olması demektir.' },
    ],
  },
  onprem: {
    h1: 'Sizin altyapınız. Sizin kurallarınız.',
    subhero: 'AdOS zaten yazılım çalıştırdığınız yere kurulur — veri merkeziniz, özel bulutunuz ya da fiziksel sunucularınız — sizin işlettiğiniz bir konteyner yığını olarak.',
    features: [
      { title: 'Kurun', body: 'Bir Docker yığını: web, işçiler, veritabanı ve gözlemlenebilirlik.' },
      { title: 'İşletin', body: 'Belgelenmiş kurulum, yükseltme, yedekleme ve kurtarma. Yükseltmeler yalnızca ileriye dönüktür ve yeniden çalıştırmaya güvenlidir.' },
      { title: 'Bağımlılık yok', body: 'Açık motorlar, standart PostgreSQL, taşınabilir veri ve dışa aktarılabilir yedekler.' },
      { title: 'Ölçeklenin', body: 'Durumsuz bir web katmanı, yatay ölçeklenebilir işçiler ve ayarlanabilir bir veritabanı havuzu.' },
    ],
    requirements: 'Node 20 veya üzeri, bir konteyner çalışma zamanı ve — gerçek modeller için — bir yerel çıkarım motoru ile uygun donanım gerektirir.',
  },
  product: {
    h1: 'Tüm reklam iş akışı için tek platform.',
    subhero: 'Bir müşteriyi tanımlamaktan yönetici raporuna kadar, AdOS ajans iş akışını kendi barındırdığınız, yönetişimli ve çok kiracılı bir sistem olarak yürütür.',
    features: [
      { title: 'Görevler', body: 'Hedefi, bütçeyi ve hedef metriği belirtin. Gerisini AdOS planlar.' },
      { title: 'Onaylar', body: 'Her aşamayı — brif, kreatif, kampanya — ilerlemeden önce inceleyip onaylayın.' },
      { title: 'Varlıklar', body: 'Sürümlenmiş bir kreatif kütüphanesi — hiçbir şeyin üzerine yazılmaz.' },
      { title: 'Analitik', body: 'Gerçek sonuçları girin; AdOS KPI’ları hesaplar ve yönetici özetini yazar.' },
      { title: 'Öğrenme', body: 'Her kampanyanın sonucu kaydedilir, böylece sistem zamanla gelişir.' },
    ],
  },
  pricing: {
    h1: 'Kurulumunuza uygun fiyatlandırma.',
    subhero: 'AdOS kurum içi kurulum için lisanslanır. Fiyatlandırma; ölçek, kiracı sayısı ve destek seviyesine bağlıdır.',
    tiers: [
      { title: 'Takım', body: 'Tek bir kurum için tek kurulum.' },
      { title: 'Kurumsal', body: 'Çok kiracılı, öncelikli destek, felaket kurtarma desteği.' },
      { title: 'Egemen', body: 'Uygulamalı kurulum desteğiyle izole (air-gapped) kurulum.' },
    ],
    custom: 'Size özel',
    note: 'Genel fiyatlandırma kesinleştikçe yayımlanacaktır.',
  },
  about: {
    h1: 'Verinize saygı duyan reklam altyapısı geliştiriyoruz.',
    subhero: 'AdOS, modern yapay zekâ reklamına ihtiyaç duyan ancak verisini bir başkasının bulutuna gönderemeyen — ve göndermemesi gereken — kurumlar için vardır.',
    mission: 'Misyonumuz basit: yapay zekâyı verinize getirmek, asla tersi değil.',
    principlesTitle: 'Neyi savunuyoruz',
    principles: [
      'Egemenlik — modellere, veriye ve donanıma siz sahipsiniz.',
      'Dürüstlük — her iddia gerçek bir mekanizmayla desteklenir.',
      'Kontrol — yapay zekâ sizin için çalışır ve her adımı siz onaylarsınız.',
    ],
  },
  contact: {
    h1: 'AdOS ekibiyle konuşun.',
    subhero: 'Neyi korumanız ve neyi başarmanız gerektiğini söyleyin. Sizi doğru kişiyle buluşturalım.',
    fields: { name: 'Ad soyad', email: 'İş e-postası', company: 'Şirket', message: 'Nasıl yardımcı olabiliriz?' },
    submit: 'Mesajı gönder',
    response: 'Kurumsal taleplere iki iş günü içinde yanıt veririz.',
  },
  demo: {
    h1: 'AdOS’u kendi koşullarınızda görün.',
    subhero: 'Ekibimizle kısa ve odaklı bir tanıtım — sektörünüze ve güvenlik gereksinimlerinize göre uyarlanmış.',
    fields: {
      email: 'İş e-postası', name: 'Ad soyad', company: 'Şirket', role: 'Göreviniz',
      size: 'Şirket büyüklüğü', country: 'Ülke / veri yerleşimi ihtiyacı', goal: 'Neyi korumak ya da başarmak istiyorsunuz?',
      consent: 'Gizlilik politikasını kabul ediyorum.',
    },
    submit: 'Demomu planla',
    successTitle: 'Talebiniz alındı.',
    successBody: 'Teşekkürler. Ekibimizden biri, tanıtımınızı planlamak için iki iş günü içinde sizinle iletişime geçecek.',
  },
  faq: {
    title: 'Sıkça sorulan sorular',
    items: [
      { q: 'Verilerimizin herhangi biri buluta gider mi?', a: 'Hayır. AdOS altyapınızda çalışır ve yapay zekâ modelleri yerelde çalışır. Bulut uç noktası ya da API anahtarı yoktur.' },
      { q: 'Hangi yapay zekâ modellerini kullanabiliriz?', a: 'Ollama, vLLM, LM Studio, llama.cpp ya da SGLang üzerinden sunulan herhangi bir açık yerel model. Başka hiçbir şeyi değiştirmeden model değiştirebilirsiniz.' },
      { q: 'Gerçekten çok kiracılı mı?', a: 'Evet. Her sorgu, olay, iş ve dosya tek bir kiracıya sınırlıdır; kiracılar birbirinin verisini göremez.' },
      { q: 'Nasıl kurulur?', a: 'Kendi ortamınızda, belgelenmiş kurulum, yükseltme, yedekleme ve kurtarma ile kendi barındırdığınız bir Docker yığını olarak.' },
      { q: 'Çevrimdışı çalışır mı?', a: 'Evet. AdOS çevrimdışı önceliklidir ve izole ağlarda çalışır.' },
      { q: 'Türkçe mevcut mu?', a: 'Evet. Arayüz ve yapay zekâ çıktısı tam iki dillidir; Türkçe ve İngilizce.' },
    ],
  },
  footer: {
    positioning: 'Kurumsal Yapay Zekâ İşletim Sistemi — binanızdan hiç çıkmayan kurumsal yapay zekâ reklamı.',
    cols: { product: 'Ürün', solutions: 'Çözümler', resources: 'Kaynaklar', company: 'Şirket', legal: 'Yasal' },
    cookiePrefs: 'Çerez tercihleri',
    security: 'Güvenlik açığı bildirin',
    copyright: 'Tüm hakları saklıdır.',
    entity: 'AdOS. Tescilli adres talep üzerine verilir.',
  },
  legal: {
    privacy: {
      h1: 'Gizlilik Politikası',
      summary: 'Bu politika AdOS pazarlama web sitesini kapsar. Siteyi gezerken ya da bize ulaşırken neleri topladığımızı açıklar. AdOS ürünü kendi altyapınızda çalışır ve müşteri verinizi orada işler — biz onu almayız.',
      sections: [
        { title: 'Neleri topluyoruz', body: 'İletişim ve demo formları (ad, iş e-postası, şirket, mesaj) ve onay verilen analitik.' },
        { title: 'Neden', body: 'Talebinize yanıt vermek ve web sitesini iyileştirmek için. Verinizi satmayız.' },
        { title: 'Haklarınız', body: 'Verinize erişim, düzeltme ya da silme talebini istediğiniz zaman iletebilirsiniz.' },
      ],
      updated: 'Son güncelleme: 2026-07-26',
    },
    cookies: {
      h1: 'Çerez Politikası',
      summary: 'Siteyi çalıştırmak için kesinlikle gerekli çerezleri, yalnızca onayınızla da analitik ve tercih çerezlerini kullanırız. Seçimlerinizi istediğiniz zaman değiştirebilirsiniz.',
      categories: [
        { title: 'Gerekli', body: 'Sitenin çalışması için gereklidir. Her zaman açıktır.' },
        { title: 'Analitik', body: 'Kullanımı anlamamıza yardımcı olur. Siz kabul edene dek kapalıdır.' },
        { title: 'Tercihler', body: 'Dilinizi ve temanızı hatırlar. Siz kabul edene dek kapalıdır.' },
      ],
    },
    terms: {
      h1: 'Kullanım Koşulları',
      summary: 'Bu koşullar AdOS web sitesini kullanımınızı düzenler. Ürün kullanımı ayrı lisans sözleşmenizle düzenlenir.',
      sections: [
        { title: 'Kullanım', body: 'Siteyi hukuka uygun kullanın ve işleyişini bozmaya çalışmayın.' },
        { title: 'Fikri mülkiyet', body: 'Aksi belirtilmedikçe tüm içerik ve markalar AdOS’a aittir.' },
        { title: 'Sorumluluk reddi', body: 'Site, yasaların izin verdiği ölçüde, garanti olmaksızın “olduğu gibi” sunulur.' },
      ],
      updated: 'Son güncelleme: 2026-07-26',
    },
  },
  notFound: { title: 'Bu sayfa burada değil.', body: 'Aradığınız sayfa taşınmış olabilir. Sizi yeniden yola koyalım.' },
};

export const content: Record<Locale, Content> = { en, tr };
