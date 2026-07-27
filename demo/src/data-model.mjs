// Canonical entities for the AdOS demo world. The demo tenant is an advertising
// agency ("Vega Reklam Ajansı") that runs AdOS to take client advertising
// objectives through the human-approved campaign pipeline. These fixed entities
// mirror the real product's domain model (PRODUCT_TRUTH.md §1):
//   Workspace → Client → Brand → Product → Project → Mission → Approval
//   → Asset (brief / creative set / campaign draft / report / executive report).
// Bulk instances are generated deterministically in seed.mjs.
//
// IMPORTANT (aligned to PRODUCT_TRUTH.md): AdOS DRAFTS campaigns; it never
// launches or optimizes live ads, has no document knowledge base, no cited
// answers, no autonomous "Digital Employees", and no enforced RBAC. The demo
// models only what the product actually does.

export const SEED = 20260727;

// ── The demo tenant: an advertising agency running AdOS ──
export const WORKSPACE = {
  id: 'ws-vega', name: 'Vega Reklam Ajansı', type: 'agency',
  city: 'İstanbul', locale: 'tr',
};

// ── Clients the agency runs advertising for ──
export const CLIENTS = [
  { id: 'cl-novamak', name: 'NovaMak Endüstri', sector: 'manufacturing' },
  { id: 'cl-derma', name: 'Derma Cosmetics', sector: 'beauty' },
  { id: 'cl-fresh', name: 'Fresh Foods', sector: 'fmcg' },
  { id: 'cl-fintr', name: 'FinTR Katılım', sector: 'finance' },
  { id: 'cl-evim', name: 'Evim Home', sector: 'retail' },
  { id: 'cl-getaway', name: 'Getaway Travel', sector: 'travel' },
];

// ── Brands per client (voice, rules, banned words — brand/brand.ts:20-42) ──
// [id, client_id, name, voice, banned_words]
export const BRANDS = [
  ['br-novamak-pro', 'cl-novamak', 'NovaMak Pro', 'professional, precise, industrial', ['ucuz', 'bedava', 'garanti']],
  ['br-novamak-parts', 'cl-novamak', 'NovaMak Parts', 'technical, reliable, B2B', ['ucuz', 'kesin sonuç']],
  ['br-derma-glow', 'cl-derma', 'Derma Glow', 'warm, confident, dermatological', ['mucize', 'kalıcı tedavi', 'şifa']],
  ['br-derma-men', 'cl-derma', 'Derma Men', 'bold, direct, modern', ['mucize', 'anında']],
  ['br-fresh-daily', 'cl-fresh', 'Fresh Daily', 'friendly, fresh, everyday', ['en iyi', 'birebir']],
  ['br-fresh-kids', 'cl-fresh', 'Fresh Kids', 'playful, caring, wholesome', ['bağımlılık', 'sınırsız']],
  ['br-fintr-invest', 'cl-fintr', 'FinTR Invest', 'trustworthy, clear, compliant', ['garanti getiri', 'risksiz', 'kesin kazanç']],
  ['br-fintr-pay', 'cl-fintr', 'FinTR Pay', 'simple, secure, fast', ['risksiz', 'sınırsız kredi']],
  ['br-evim-living', 'cl-evim', 'Evim Living', 'cozy, aspirational, accessible', ['en ucuz', 'tükeniyor']],
  ['br-evim-garden', 'cl-evim', 'Evim Garden', 'natural, calm, seasonal', ['sınırsız', 'birebir']],
  ['br-getaway-sun', 'cl-getaway', 'Getaway Sun', 'vivid, inviting, escape', ['garanti tatil', 'kesinlikle']],
  ['br-getaway-city', 'cl-getaway', 'Getaway City', 'smart, curated, urban', ['en ucuz', 'birebir']],
].map(([id, client_id, name, voice, banned_words]) => ({ id, client_id, name, voice, banned_words }));

// ── Products per brand (carry pricing — product/product.ts:30) ──
// [id, brand_id, name, price_try]
export const PRODUCTS = [
  ['pr-nm-hmc', 'br-novamak-pro', 'HMC-500 Machining Center', 2450000],
  ['pr-nm-weld', 'br-novamak-pro', 'Robotic Welding Cell', 1780000],
  ['pr-nm-spindle', 'br-novamak-parts', 'Precision Spindle Kit', 42000],
  ['pr-nm-service', 'br-novamak-parts', 'Aftermarket Service Plan', 96000],
  ['pr-dg-serum', 'br-derma-glow', 'Glow Repair Serum', 640],
  ['pr-dg-cream', 'br-derma-glow', 'Barrier Day Cream', 520],
  ['pr-dm-wash', 'br-derma-men', 'Charcoal Face Wash', 280],
  ['pr-dm-balm', 'br-derma-men', 'Post-Shave Balm', 340],
  ['pr-fd-yogurt', 'br-fresh-daily', 'Süzme Yoğurt 1kg', 78],
  ['pr-fd-milk', 'br-fresh-daily', 'Günlük Süt 1L', 42],
  ['pr-fk-juice', 'br-fresh-kids', 'Meyve Suyu 200ml', 24],
  ['pr-fk-snack', 'br-fresh-kids', 'Tam Tahıl Atıştırmalık', 36],
  ['pr-fi-fund', 'br-fintr-invest', 'Katılım Emeklilik Fonu', 0],
  ['pr-fi-gold', 'br-fintr-invest', 'Altın Katılım Hesabı', 0],
  ['pr-fp-wallet', 'br-fintr-pay', 'FinTR Pay Cüzdan', 0],
  ['pr-fp-pos', 'br-fintr-pay', 'Esnaf POS Çözümü', 0],
  ['pr-el-sofa', 'br-evim-living', 'Nordic 3+2 Koltuk Takımı', 34900],
  ['pr-el-table', 'br-evim-living', 'Meşe Yemek Masası', 12900],
  ['pr-eg-set', 'br-evim-garden', 'Bahçe Mobilya Seti', 18900],
  ['pr-eg-grill', 'br-evim-garden', 'Mangal & Barbekü İstasyonu', 6400],
  ['pr-gs-antalya', 'br-getaway-sun', 'Antalya Ultra Her Şey Dahil', 42000],
  ['pr-gs-bodrum', 'br-getaway-sun', 'Bodrum Butik Tatil', 38000],
  ['pr-gc-paris', 'br-getaway-city', 'Paris Şehir Kaçamağı', 54000],
  ['pr-gc-rome', 'br-getaway-city', 'Roma Kültür Turu', 46000],
].map(([id, brand_id, name, price_try]) => ({ id, brand_id, name, price_try }));

// ── Team members (roles are LABELS ONLY — RBAC is defined but not enforced;
//    the demo does not simulate permission enforcement, only human approval). ──
// [id, name, role, kind]  kind: 'internal' (agency) | 'client' (approver)
export const TEAM = [
  ['u-01', 'Elif Demir', 'Agency Director', 'internal'],
  ['u-02', 'Hakan Çelik', 'Account Director', 'internal'],
  ['u-03', 'Zeynep Şahin', 'Account Manager', 'internal'],
  ['u-04', 'Kerem Yılmaz', 'Account Manager', 'internal'],
  ['u-05', 'Aslı Yıldırım', 'Strategy Lead', 'internal'],
  ['u-06', 'Efe Demir', 'Strategist', 'internal'],
  ['u-07', 'Sibel Kaya', 'Creative Director', 'internal'],
  ['u-08', 'Onur Kaplan', 'Art Director', 'internal'],
  ['u-09', 'Deniz Acar', 'Copywriter', 'internal'],
  ['u-10', 'Ceren Işık', 'Copywriter', 'internal'],
  ['u-11', 'Murat Şahin', 'Media Planner', 'internal'],
  ['u-12', 'İpek Kara', 'Media Planner', 'internal'],
  ['u-13', 'Berk Aydın', 'Performance Analyst', 'internal'],
  ['u-14', 'Gizem Ünal', 'Performance Analyst', 'internal'],
  ['u-15', 'Serkan Aydın', 'Data Analyst', 'internal'],
  ['u-16', 'Pelin Ay', 'Project Coordinator', 'internal'],
  // Client-side approvers (sign off on their own brand's campaigns)
  ['u-cl-novamak', 'Levent Bozkurt', 'Client Marketing Lead — NovaMak', 'client'],
  ['u-cl-derma', 'Nalan Er', 'Client Marketing Lead — Derma', 'client'],
  ['u-cl-fresh', 'Tuğçe Al', 'Client Marketing Lead — Fresh Foods', 'client'],
  ['u-cl-fintr', 'Canan Arslan', 'Client Marketing Lead — FinTR', 'client'],
  ['u-cl-evim', 'Ozan Kurt', 'Client Marketing Lead — Evim', 'client'],
  ['u-cl-getaway', 'Derya Kılıç', 'Client Marketing Lead — Getaway', 'client'],
].map(([id, name, role, kind]) => ({
  id, name, role, kind,
  email: `${slug(name)}@vega.ajans.tr`, active: true, locale: 'tr',
}));

// map each client to its client-side approver
export const CLIENT_APPROVER = {
  'cl-novamak': 'u-cl-novamak', 'cl-derma': 'u-cl-derma', 'cl-fresh': 'u-cl-fresh',
  'cl-fintr': 'u-cl-fintr', 'cl-evim': 'u-cl-evim', 'cl-getaway': 'u-cl-getaway',
};

function slug(name) {
  return name.toLowerCase()
    .replaceAll('ı', 'i').replaceAll('İ', 'i').replaceAll('ş', 's').replaceAll('ğ', 'g')
    .replaceAll('ç', 'c').replaceAll('ö', 'o').replaceAll('ü', 'u')
    .replace(/[^a-z ]/g, '').trim().replace(/ +/g, '.');
}

// ── The campaign pipeline: fixed, ordered, human-gated (mission.ts, routes.ts) ──
// Each stage produces one artifact and is gated by a human approval before the
// next stage may begin. Gates match the product: strategy_and_budget /
// creative_assets / campaign_launch (routes.ts:743-753).
export const PIPELINE_STAGES = [
  { key: 'brief', artifact: 'MarketingBrief', gate: 'strategy_and_budget' },
  { key: 'creative', artifact: 'CreativeSet', gate: 'creative_assets' },
  { key: 'campaign_draft', artifact: 'CampaignDraft', gate: 'campaign_launch' },
  { key: 'report', artifact: 'CampaignReport', gate: null },
  { key: 'executive', artifact: 'ExecutiveReport', gate: null },
];

// ── Advertising channels a campaign draft can allocate budget across.
//    (AdOS drafts the split; a human exports it to run in their own ad platform —
//    AdOS never pushes to these platforms. connector-hub is a stub.) ──
export const CHANNELS = ['Meta', 'Google Ads', 'YouTube', 'TikTok', 'LinkedIn', 'Display'];

// ── Mission objective templates (natural-language client objectives) ──
export const OBJECTIVES = [
  'yeni ürün lansmanı için farkındalık kampanyası',
  'çeyrek sonu satış artışı için performans kampanyası',
  'marka bilinirliğini yükselten sosyal medya kampanyası',
  'potansiyel müşteri toplama (lead generation) kampanyası',
  'sezonluk kampanya ve indirim dönemi tanıtımı',
  'yeniden hedefleme (retargeting) ile dönüşüm kampanyası',
  'B2B talep yaratma kampanyası',
  'mağaza açılışı için yerel kampanya',
];

// ── Company Brain seed facts (marketing-performance memory, not documents) ──
// CompanyDNA is a single record; the rest are learned insights & patterns.
export const COMPANY_DNA = {
  id: 'dna-vega',
  mission: 'Yerel ve çevrimdışı yapay zekâ ile insan onaylı reklam kampanyaları üretmek.',
  positioning: 'Sovereign creative performance agency',
  tone: 'confident, precise, honest',
  north_star: 'ROAS-positive campaigns approved by humans',
};

// Winning-ad pattern library seeds (pattern-library.ts). [id, pattern, lift_pct]
export const PATTERN_SEEDS = [
  ['pat-ugc-hook', 'UGC-style opening hook in first 2 seconds', 18],
  ['pat-price-anchor', 'Price anchoring against premium tier', 12],
  ['pat-local-proof', 'Local social proof / Turkish testimonial', 22],
  ['pat-scarcity-honest', 'Honest limited-time seasonal framing', 9],
  ['pat-benefit-first', 'Benefit-first headline over feature list', 15],
  ['pat-question-open', 'Question-based ad copy opening', 11],
];
