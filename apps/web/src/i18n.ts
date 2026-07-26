import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Bilingual UI + AI. The active locale is resolved from the visitor's browser
 * (the `Accept-Language` header, which reflects the operating-system language):
 * Turkish when the top preference is Turkish, English otherwise. It is held in
 * an ambient AsyncLocalStorage for the duration of the request so pages, the
 * layout chrome, and the AI Manager all render/answer in the same language
 * without threading a `locale` argument through every call.
 *
 * Default is English, so tests (which send no Accept-Language) and existing
 * behaviour are unchanged.
 */
export type Locale = 'en' | 'tr';

const store = new AsyncLocalStorage<Locale>();

/** Run `fn` with `locale` as the ambient request locale. */
export function withLocale<T>(locale: Locale, fn: () => T): T {
  return store.run(locale, fn);
}

/** The current request's locale, or 'en' outside a request. */
export function currentLocale(): Locale {
  return store.getStore() ?? 'en';
}

/**
 * Resolve a locale from an `Accept-Language` header. Turkish only when it is the
 * highest-priority language the browser advertises; everything else is English.
 */
export function resolveLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return 'en';
  const top = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: (tag ?? '').toLowerCase(), q: q ? Number.parseFloat(q) : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q)[0];
  return top && top.tag.startsWith('tr') ? 'tr' : 'en';
}

/** The human-readable name of the language the AI should answer in. */
export function languageName(locale: Locale): string {
  return locale === 'tr' ? 'Turkish' : 'English';
}

type Dict = Record<string, { en: string; tr: string }>;

// UI strings, keyed. English is the source of truth; add `tr` for each.
const DICT: Dict = {
  // ── App chrome / navigation ──
  'app.tagline': { en: 'Advertising Operating System', tr: 'Reklam İşletim Sistemi' },
  'nav.dashboard': { en: 'Dashboard', tr: 'Panel' },
  'nav.clients': { en: 'Clients', tr: 'Müşteriler' },
  'nav.brands': { en: 'Brands', tr: 'Markalar' },
  'nav.products': { en: 'Products', tr: 'Ürünler' },
  'nav.projects': { en: 'Projects', tr: 'Projeler' },
  'nav.missions': { en: 'Missions', tr: 'Görevler' },
  'nav.brief': { en: 'Marketing Brief', tr: 'Pazarlama Brifi' },
  'nav.creative': { en: 'Creative Studio', tr: 'Kreatif Stüdyo' },
  'nav.campaigns': { en: 'Campaigns', tr: 'Kampanyalar' },
  'nav.analytics': { en: 'Analytics', tr: 'Analitik' },
  'nav.approvals': { en: 'Approvals', tr: 'Onaylar' },
  'nav.assets': { en: 'Assets', tr: 'Varlıklar' },
  'nav.executive': { en: 'Executive', tr: 'Yönetim' },
  'nav.reports': { en: 'Reports', tr: 'Raporlar' },
  'nav.settings': { en: 'Settings', tr: 'Ayarlar' },
  'chrome.tenant': { en: 'Tenant', tr: 'Kiracı' },
  'chrome.signOut': { en: 'Sign out', tr: 'Çıkış yap' },
  'chrome.soon': { en: 'soon', tr: 'yakında' },

  // ── Login ──
  'login.title': { en: 'Sign in', tr: 'Giriş yap' },
  'login.welcome': { en: 'Welcome back', tr: 'Tekrar hoş geldiniz' },
  'login.subtitle': { en: 'Sign in to your advertising operating system.', tr: 'Reklam işletim sisteminize giriş yapın.' },
  'login.email': { en: 'Work email', tr: 'İş e-postası' },
  'login.company': { en: 'Company', tr: 'Şirket' },
  'login.submit': { en: 'Sign in', tr: 'Giriş yap' },
  'login.tenantNote': { en: 'Your company name becomes your isolated tenant.', tr: 'Şirket adınız izole kiracınız olur.' },
  'login.missingFields': { en: 'Please provide both your email and company.', tr: 'Lütfen hem e-posta hem şirket bilgisini girin.' },

  // ── Dashboard ──
  'dash.title': { en: 'Dashboard', tr: 'Panel' },
  'dash.welcome': { en: 'Welcome, {name}.', tr: 'Hoş geldiniz, {name}.' },
  'dash.viewMissions': { en: 'View missions', tr: 'Görevleri gör' },
  'dash.onboardingDone': { en: '🎉 Onboarding complete — your first Mission is in the system.', tr: '🎉 Kurulum tamam — ilk göreviniz sistemde.' },
  'dash.pendingTitle': { en: 'Pending executive approvals', tr: 'Bekleyen yönetici onayları' },
  'dash.pendingSub': { en: 'Marketing briefs awaiting your sign-off before work continues.', tr: 'İşe devam etmeden önce onayınızı bekleyen pazarlama brifleri.' },
  'dash.review': { en: 'review', tr: 'incele' },
  'dash.feedTitle': { en: 'Activity feed', tr: 'Etkinlik akışı' },
  'dash.feedSub': { en: 'Domain events emitted by the system, newest first.', tr: 'Sistemin yaydığı alan olayları, en yeni önce.' },
  'dash.feedEmpty': { en: 'No activity yet. Complete your first Mission to see events here.', tr: 'Henüz etkinlik yok. Olayları görmek için ilk görevinizi tamamlayın.' },
  'dash.stat.workspaces': { en: 'Workspaces', tr: 'Çalışma Alanları' },
  'dash.stat.clients': { en: 'Clients', tr: 'Müşteriler' },
  'dash.stat.brands': { en: 'Brands', tr: 'Markalar' },
  'dash.stat.products': { en: 'Products', tr: 'Ürünler' },
  'dash.stat.missions': { en: 'Missions', tr: 'Görevler' },
  'dash.stat.briefs': { en: 'Marketing Briefs', tr: 'Pazarlama Brifleri' },
  'dash.stat.creatives': { en: 'Creatives', tr: 'Kreatifler' },
  'dash.stat.campaigns': { en: 'Campaigns', tr: 'Kampanyalar' },
  'dash.stat.reports': { en: 'Reports', tr: 'Raporlar' },
  'dash.stat.learnings': { en: 'Brain Learnings', tr: 'Beyin Öğrenimleri' },
  'dash.stat.approvals': { en: 'Approvals', tr: 'Onaylar' },
  'dash.stat.assets': { en: 'Assets', tr: 'Varlıklar' },
  'dash.stat.executives': { en: 'CEO Dashboards', tr: 'CEO Panoları' },
};

/** Translate `key` into the current request locale, interpolating `{var}` values. */
export function t(key: string, vars?: Record<string, string | number>): string {
  const entry = DICT[key];
  let text = entry ? entry[currentLocale()] : key;
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
  return text;
}
