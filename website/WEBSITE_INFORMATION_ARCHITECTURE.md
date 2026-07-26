# AdOS — Website Information Architecture

**Companion to:** `WEBSITE_CONSTITUTION.md` (source of truth). This document
operationalizes the constitution into a navigable structure. Documentation only;
no implementation. All artifacts isolated to `website/`.

---

## 1. Complete sitemap

Every route exists in **EN and TR** (`/en/...`, `/tr/...`) with `hreflang`
pairing. Depth ≤ 3. `L#` = link priority for internal linking and SEO.

```
/ (Home)                                        L0
├── /product                                    L1
│   ├── /product/overview                        L1
│   ├── /product/how-it-works                     L1
│   ├── /product/ai-pipeline                       L1
│   ├── /product/multi-tenancy                     L2
│   ├── /product/assets-approvals                  L2
│   └── /product/analytics-executive               L2
├── /solutions                                   L1
│   ├── /solutions/local-ai                         L1  ← pillar
│   ├── /solutions/on-prem-offline                  L1  ← pillar
│   ├── /solutions/regulated-industries             L2
│   └── /solutions/agencies                         L2
├── /security                                    L1  ← pillar
│   ├── /security/trust-center                       L1
│   └── /security/compliance                         L2
├── /why-ados                                    L2
├── /pricing (or /contact-sales if gated)        L1
├── /customers                                   L2  (future-populated)
├── /company                                     L2
│   ├── /company/about                              L2
│   ├── /company/careers                            L3
│   └── /company/contact                            L1
├── /demo                                        L0  (conversion)
├── /docs → external product documentation        L1  (outbound)
├── /blog                                        L3  (future)
├── /legal
│   ├── /legal/terms                                L3
│   ├── /legal/privacy                              L3
│   ├── /legal/cookies                              L3
│   ├── /legal/dpa                                  L3
│   ├── /legal/sla                                  L3
│   └── /legal/accessibility                        L3
├── /security/responsible-disclosure             L3
├── /status → external                           L3
├── /404, /500                                   system
├── /sitemap.xml, /robots.txt                    system
```

**Page taxonomy:**
- **Conversion pages:** Home, Demo, Contact, Pricing.
- **Pillar pages (SEO + persona anchors):** Local AI, On-Prem & Offline,
  Security.
- **Product pages:** the `/product/*` set.
- **Trust pages:** Trust Center, Compliance, Security overview.
- **Company/legal:** About, Careers, Contact, all `/legal/*`.

---

## 2. Navigation tree

**Global header (persistent):**
```
[AdOS logo] ─ Product ▾ ─ Solutions ▾ ─ Security ▾ ─ Docs ─ Company ▾ ─ Pricing │ [TR/EN] [☾/☀] [Sign in] [Book a demo ●]
```

**Mega-menu content:**
```
Product ▾
  Overview            How it works        The AI Pipeline
  Multi-tenancy       Assets & Approvals  Analytics & Executive
  ── Featured: "See the pipeline" (link to /product/ai-pipeline)

Solutions ▾
  Local AI            On-Prem & Offline
  Regulated Industries  For Agencies
  ── Featured: "Runs on your GPUs — Local AI"

Security ▾
  Security overview   Trust Center        Compliance (KVKK/GDPR)
  ── Featured: "Request a security briefing"

Company ▾
  About   Careers   Contact
```

**Footer nav:** five columns per `WEBSITE_CONSTITUTION.md §23` (Product,
Solutions, Resources, Company, Legal) + utility row (language, theme, security
contact, cookie preferences, copyright, legal entity + address).

**Mobile nav:** full-screen overlay, accordion for each ▾ group, language + theme
pinned, sticky "Book a demo" at the bottom.

**Nav rules:** primary CTA "Book a demo" is always visible; max 6 items per
mega-menu column; every menu has exactly one featured link; Docs and Status are
outbound (icon indicator); active section is indicated in both nav and anchor rail.

---

## 3. User journeys

Journeys map personas (`Constitution §4`) → entry → path → conversion. Each ends
at a checkpoint (§14).

**J1 — CMO "Selin" (economic buyer): outcome-led**
```
Ad/organic → / (Home hero: outcome)
  → /product/how-it-works (pipeline + approval gates)
  → /product/analytics-executive (proof of results)
  → /why-ados (differentiation)
  → /demo  ✅ CP-Demo
```

**J2 — CISO "Emre" (veto): trust-led (parallel primary funnel)**
```
Search "on-prem AI advertising security" → /security
  → /solutions/local-ai (no egress diagram)
  → /security/trust-center (control cards)
  → /security/compliance (KVKK/GDPR)
  → /demo?track=security ("Request a security briefing")  ✅ CP-Security-Briefing
```

**J3 — Head of IT "Deniz" (technical evaluator)**
```
Search "self-hosted AI advertising docs" → /solutions/on-prem-offline
  → /product/multi-tenancy
  → /docs (outbound) + /security
  → /company/contact or /demo  ✅ CP-Demo
```

**J4 — Marketing Ops "Aylin" (champion/daily user)**
```
Referral → /product/overview
  → /product/ai-pipeline (how work gets made)
  → /product/assets-approvals
  → /demo  ✅ CP-Demo (often forwards to Selin/Emre)
```

**J5 — Agency/Group exec "Mr. Öztürk"**
```
/solutions/agencies → /product/multi-tenancy → /security → /contact-sales ✅ CP-Sales
```

**Cross-journey rule:** every product page offers both an outcome next-step
(Demo) and a trust next-step (Security), because deals need both buyers.

---

## 4. Landing page flow (Home)

Home is the hub; it seeds all five journeys. Ordered sections (top → bottom):

```
1. Hero            Positioning + dual CTA (Book a demo / How it works)   [CP-CTA-Hero]
2. Trust strip     "100% local · no cloud · no API keys" + engine logos
3. Problem         Why cloud AI is a non-starter for regulated orgs
4. The pipeline    Animated brief→creative→campaign→analytics→executive (approval gates)
5. Sovereignty     "No data egress" architecture diagram (perimeter line)
6. Security proof  3–4 control cards → link to /security
7. Local AI        "Runs on your hardware" → link to /solutions/local-ai
8. Personas/Use    Cards: Regulated Industries / Agencies / IT
9. Outcomes        Concrete capability proof (multi-tenant, approvals, DR)
10. Bilingual note Available in Türkçe & English
11. FAQ            Top 5 objections (security, cloud, models, deployment, price)
12. CTA band       Full-width "Book a demo" + "Talk to sales"           [CP-CTA-Footer]
13. Footer
```

**Rule:** the fold shows positioning + primary CTA + one trust signal without
scrolling, at all breakpoints.

---

## 5. Scroll flow

Applies to Home and long pillar/product pages.

- **Narrative arc:** Hook (hero) → Tension (problem) → Mechanism (how) → Proof
  (security/local) → Fit (personas) → Objection handling (FAQ) → Action (CTA).
- **Rhythm:** one idea per viewport; alternating media/text rows; a "breather"
  (quote, stat, or diagram) every 3 sections.
- **Sticky elements:** header (transparent→solid on scroll); anchor rail on
  desktop for long pages; mobile sticky "Book a demo."
- **Reveal:** subtle fade+rise on entry, once, staggered ≤60ms; disabled under
  `prefers-reduced-motion` (`Constitution §14`).
- **Re-CTA cadence:** a CTA (primary or contextual) appears at least every ~3
  viewports so intent is never stranded.
- **Scroll depth is measured** (§12) at 25/50/75/90%.

---

## 6. CTA locations (map)

| Location | CTA | Type | Checkpoint |
| --- | --- | --- | --- |
| Header (all pages) | Book a demo | Primary | CP-CTA-Nav |
| Home hero | Book a demo / How it works | Primary + Secondary | CP-CTA-Hero |
| After pipeline section | See how it works | Secondary | — |
| Security sections | Request a security briefing | Contextual | CP-Security-Briefing |
| Local-AI page | View docs / Book a demo | Secondary + Primary | — |
| On-Prem page | View deployment docs / Talk to sales | Secondary + Primary | CP-Sales |
| End of every major page | Book a demo + Talk to sales | Primary + Secondary | CP-CTA-Footer |
| Mobile (persistent) | Book a demo | Primary sticky | CP-CTA-Mobile |
| Pricing/Contact | Contact sales | Primary | CP-Sales |
| 404 | Back to home / Book a demo | Secondary | — |

**Rules:** one primary CTA per viewport; value-stating verbs; CISO pages lead with
the security-briefing CTA; each CTA is a distinct tracked event (§12).

---

## 7. Internal linking

**Model:** hub-and-spoke around three pillars (Local AI, On-Prem & Offline,
Security), with Home as super-hub and Demo as the universal sink.

**Rules:**
- Every product page links to ≥1 pillar and to Demo.
- Every pillar links laterally to the other two pillars and up to its parent
  (`/solutions`, `/security`).
- Trust Center links to each control's evidence and to Compliance.
- Contextual in-body links use descriptive anchor text (SEO + a11y), never "click
  here."
- Related-content block (2–3 links) at the foot of every non-conversion page.
- No orphan pages — everything reachable from header, footer, or a parent within
  2 clicks of Home.
- External links (Docs, Status) marked with an icon and `rel="noopener"`.

**Link priority (from §1):** L0/L1 pages get the most inbound internal links; L3
legal/blog get fewer (footer + contextual).

---

## 8. SEO hierarchy

**Category ambition:** own "Advertising Operating System" + "on-prem / local AI
advertising" in EN and TR.

**Page-level hierarchy:**
- **One `<h1>` per page** = the page's primary keyword-bearing promise.
- `h2` = section themes; `h3` = supporting points. Never skip levels.
- **Title tag** ≤ 60 chars, front-loaded keyword + brand suffix ("… | AdOS").
- **Meta description** ≤ 155 chars, benefit + differentiator, one per page.

**Keyword-to-page map (primary intent):**
| Page | Primary keyword theme (EN) | TR |
| --- | --- | --- |
| /solutions/local-ai | local AI advertising, no cloud | yerel yapay zekâ reklam |
| /solutions/on-prem-offline | self-hosted / on-prem AI marketing | kurum içi reklam yapay zekâsı |
| /security | secure AI advertising, data residency | veri egemenliği reklam yapay zekâsı |
| /product/ai-pipeline | AI campaign automation pipeline | yapay zekâ kampanya otomasyonu |
| / | Advertising Operating System | reklam işletim sistemi |

**Structured data:** `Organization`, `SoftwareApplication`, `BreadcrumbList` on
all pages; `FAQPage` on Home/FAQ; `Article` on blog.

**Bilingual:** self-referencing canonical per page; `hreflang` EN↔TR + `x-default`;
no locale auto-redirect that hides content from crawlers.

---

## 9. Breadcrumb rules

- Shown on all pages **except** Home and top-level conversion pages (Demo).
- Format: `Home / Section / Page` — mirrors the URL hierarchy exactly.
- The current page is the last crumb, not a link, and carries `aria-current="page"`.
- Emitted as `BreadcrumbList` JSON-LD (§8).
- Truncate the middle on mobile (`Home / … / Page`) but keep the full trail in
  markup for SEO/a11y.
- Breadcrumb labels equal the page's nav label (consistent terminology).

---

## 10. URL naming

**Conventions:**
- Lowercase, hyphen-separated, no trailing slash, no file extensions, no query
  params for content (`?track=security` allowed for routing/analytics only).
- Short, human-readable, keyword-bearing; nouns, not verbs.
- Stable — URLs are contracts; changes require a 301 and a redirect map.
- Locale prefix (`/en/`, `/tr/`) or content-negotiated equivalents, consistently.
- Hierarchy in the path mirrors the sitemap (`/solutions/local-ai`, not
  `/local-ai`).
- No dates, no IDs, no session tokens in content URLs.

**Redirect policy:** any renamed/removed page 301s to its closest equivalent;
maintain a redirect map; never 404 a previously-indexed URL silently.

---

## 11. Content ownership

RACI per content domain (roles, not named people).

| Content area | Responsible (drafts) | Accountable (approves) | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Positioning / messaging | Product Marketing | Head of Marketing | Product, CEO | Sales |
| Product pages | Product Marketing | Product Lead | Design, Eng | Sales |
| Security / Trust Center | Security/Product Marketing | CISO | Legal, Eng | Sales |
| Local-AI / On-Prem | Product Marketing | Product Lead | Eng, Solutions | Sales |
| Legal pages | Legal | General Counsel | Marketing | All |
| Copy (TR) | Turkish Copywriter | Head of Marketing | Product Marketing | — |
| Design / components | Design Lead | Design Lead | Eng | Marketing |
| SEO/metadata | SEO Owner | Head of Marketing | Content | — |
| Analytics/measurement | Growth/Analytics | Head of Marketing | Eng | Leadership |

**Rules:** no page publishes without its Accountable sign-off; **security claims
require CISO approval; every claim requires a real mechanism** (`Constitution
§22`); TR and EN reach parity before launch; last-updated + owner recorded per
page.

---

## 12. Analytics events

Privacy-respecting, consent-gated (`Constitution §25`) — events fire only after
consent for the relevant category. Naming: `object_action`, snake_case.

**Page/engagement**
| Event | Trigger | Key properties |
| --- | --- | --- |
| `page_view` | route load | path, locale, theme, referrer |
| `scroll_depth` | 25/50/75/90% | path, percent |
| `section_view` | section enters viewport | section_id, path |
| `time_on_page` | on unload | path, seconds (bucketed) |
| `lang_switch` | TR/EN toggle | from, to |
| `theme_toggle` | dark/light | to |

**Navigation**
| `nav_open` | mega-menu opened | menu |
| `nav_link_click` | header/footer link | label, href |
| `breadcrumb_click` | crumb click | label |
| `outbound_click` | Docs/Status/external | href |

**Conversion**
| `cta_click` | any CTA | cta_id, location, label, variant |
| `demo_start` | demo form focus/first field | source, track |
| `demo_field_error` | validation fail | field |
| `demo_submit` | successful submit | track, role, company_size, country |
| `contact_submit` | contact form | reason |
| `security_briefing_request` | CISO CTA submit | source |
| `newsletter_optin` | double opt-in confirmed | — |
| `doc_click` | docs link | from_page |

**Consent**
| `consent_shown` | banner shown | — |
| `consent_update` | accept/reject/save | categories |

**Rules:** no PII in event properties; email captured only in the form payload,
not analytics; every CTA has a stable `cta_id`; events map to funnel stages (§14)
so each stage is measurable.

---

## 13. Heatmap strategy

- **Tools:** privacy-respecting, consent-gated heatmapping; no session recording
  of form field contents (mask all inputs); IP anonymized.
- **What to capture:** click maps, scroll maps, and attention/hover maps on
  **Home, Local-AI, Security, On-Prem, Demo**.
- **Questions each map answers:**
  - Home: does the fold's primary CTA get the clicks? where do users drop before
    the pipeline section?
  - Security/Local-AI: do CISO visitors reach the control cards / no-egress
    diagram? do they click "security briefing"?
  - Demo: which field causes hesitation/abandonment? (field-level drop, not
    contents).
- **Cadence:** review monthly; pair with §12 funnels; feed findings into A/B tests
  of headlines/CTA copy/placement.
- **Guardrails:** masking on by default; exclude legal pages from recording;
  respect DNT and reduced-motion users; delete raw data per retention policy.

---

## 14. Conversion checkpoints

Ordered gates from first touch to qualified lead. Each has an event (§12) and an
owner metric.

| ID | Checkpoint | Where | Success event | Stage |
| --- | --- | --- | --- | --- |
| CP-Land | Landed on a key page | Home/pillar | `page_view` | Awareness |
| CP-Engage | Reached the mechanism | pipeline/security section | `section_view` (≥50% scroll) | Interest |
| CP-Trust | Reached trust proof | Trust Center / no-egress diagram | `section_view` security | Consideration |
| CP-CTA-* | Clicked a CTA | nav/hero/band/mobile | `cta_click` | Intent |
| CP-Demo | Started demo form | /demo | `demo_start` | Intent |
| CP-Security-Briefing | Requested security briefing | security path | `security_briefing_request` | Intent |
| CP-Convert | Completed demo/contact | /demo, /contact | `demo_submit` / `contact_submit` | Action |
| CP-Sales | Contacted sales | /pricing, /contact-sales | `contact_submit` | Action |
| CP-Qualified | Lead qualifies (MQL→SQL) | CRM (post-site) | (offline) | Action |

**Funnel math (site-owned):** Land → Engage → Trust → CTA → Convert. Two parallel
primary paths — **CMO/outcome** and **CISO/trust** — are measured separately;
both must be healthy because enterprise deals need both.

**Optimization loop:** heatmaps (§13) + funnel drop-off (§12) → hypothesis →
A/B test (headline/CTA/placement) → ship if it lifts CP-Convert without harming
accessibility or performance budgets (`Constitution §15, §18`).

---

## Appendix — IA guardrails

- Depth ≤ 3 clicks from Home to any page.
- No orphan pages; every page has a parent, breadcrumbs (except Home/Demo), and a
  next-step CTA.
- EN/TR parity for every route with correct `hreflang`.
- URLs are stable contracts; renames require 301s.
- Measurement is consent-gated and PII-free.
- Every structural decision traces to `WEBSITE_CONSTITUTION.md`.
