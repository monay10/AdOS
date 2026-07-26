# AdOS — Corporate Website Constitution

**Document type:** Specification (design + brand + content system). No code.
**Scope:** The official AdOS marketing website. This is **not** the AdOS
application. Nothing in this document authorizes changes to application code,
packages, business logic, APIs, or tests. All website work is isolated to
`website/`.
**Owner:** Lead Product Designer & Staff Frontend Engineer.
**Status:** v1.0 — canonical source of truth for the corporate site.
**Product baseline:** AdOS 1.0.0 — offline-first, multi-tenant AI advertising
platform that runs 100% on the customer's own infrastructure.

---

## 0. How to read this document

This is the constitution: every page, component, color, word and interaction on
the marketing site must be traceable to a rule here. When a future decision is
ambiguous, this document wins. Sections are numbered 1–33 per the mandate.
Implementation (framework, hosting, CMS) is deliberately out of scope — this
specifies **what** and **why**, not the build.

---

## 1. Brand positioning

**One-line positioning**
> AdOS is the Enterprise AI Operating System that runs an autonomous AI ad agency
> entirely on your own infrastructure — no cloud, no API keys, no data leaving
> your walls.

**Positioning statement (long form)**
For enterprises and regulated organizations that need modern AI advertising but
cannot send their customer data to third-party clouds, AdOS is an on-premise,
offline-first enterprise AI operating system that plans and runs campaigns end to
end — brief, creative, campaign, analytics, executive review — using local AI
models the customer controls. Unlike cloud martech suites and API-dependent AI
tools, AdOS keeps every prompt, asset and result inside the customer's own
network, with enterprise-grade security, multi-tenancy and disaster recovery
built in.

**Category:** Enterprise AI Operating System (a new category — not "another
martech point tool," not "a ChatGPT wrapper").

**Brand character:** Precise, calm, credible, sovereign. We sound like
infrastructure, not hype. Closer to Linear/OpenAI restraint than to loud
growth-marketing. Confidence through specificity, never through adjectives.

**Brand promise:** *Enterprise AI advertising that never leaves your building.*

**Brand pillars (every message ladders to one):**
1. **Sovereign** — your data, your models, your hardware.
2. **Autonomous** — an AI company that does the work, with you approving.
3. **Enterprise-ready** — security, multi-tenancy, backup/DR from day one.
4. **Open & local** — Ollama/vLLM/LM Studio; no vendor lock, no API bill.

---

## 2. Product messaging

**Message architecture (pyramid):**

- **Tagline (hero):** *The Enterprise AI Operating System.*
- **Sub-tagline:** *Run an autonomous AI ad agency — 100% on your own
  infrastructure.*
- **Three proof messages (below the fold):**
  1. **Local AI, zero cloud.** Every model runs on your hardware. No API keys,
     no data egress.
  2. **From objective to campaign, autonomously.** State a goal; AdOS produces
     brief → creative → campaign → analytics → executive report, with your
     approval at each step.
  3. **Enterprise from the first commit.** Multi-tenant isolation, Argon2id auth,
     encrypted backups, disaster recovery, monitoring.

**Messaging rules:**
- Lead with sovereignty and control, not "AI magic."
- Every capability claim is backed by a concrete mechanism (e.g. "AES-256-GCM
  encrypted backups," "runs on Ollama/vLLM").
- Never imply a cloud dependency. Never imply data is sent anywhere.
- Bilingual by design: all core messaging exists in **English and Turkish**,
  with parity of meaning, not literal translation.

**Do-not-say list:** "powered by OpenAI/GPT," "cloud-native AI," "send your data
to our servers," "unlimited scale in the cloud," "magic," "revolutionary,"
"10x," growth-hack language.

---

## 3. Target audience

**Primary markets:**
- Regulated & data-sensitive enterprises (finance, healthcare, public sector,
  defense-adjacent, legal).
- Organizations under data-residency / sovereignty mandates (EU/GDPR, KVKK in
  Türkiye, sector regulators).
- Enterprises with in-house marketing + IT that want AI leverage without cloud
  risk.
- Agencies and holding groups serving regulated clients (multi-tenant fit).

**Firmographics:** 200–50,000 employees; existing data-governance function;
on-prem or private-cloud posture; a security/compliance gate on new software.

**Geographic priority:** Türkiye first (bilingual TR/EN, KVKK-aware messaging),
then EU (GDPR/data-residency), then global regulated verticals.

**Who we are NOT for (state it internally):** solo marketers wanting a quick
cloud SaaS; teams happy to send data to third-party AI APIs; buyers optimizing
purely on lowest sticker price with no security requirement.

---

## 4. Customer personas

Each persona has a name, a job, a fear, a win, and the page/section that serves
them.

**P1 — "Selin," CMO / VP Marketing (Economic buyer)**
- Wants: pipeline and campaign output without growing headcount.
- Fears: brand risk, opaque AI, another tool nobody adopts.
- Win: an autonomous agency she still controls via approvals.
- Served by: Home hero, Product overview, ROI/outcomes, Customer stories.

**P2 — "Emre," CISO / Head of Security (Veto power)**
- Wants: proof data never leaves the perimeter; auditable controls.
- Fears: shadow AI, data egress, unvetted dependencies.
- Win: a platform he can approve — local models, tenant isolation, headers/CSP,
  Argon2id, backups.
- Served by: Security page, Local-AI page, On-Prem page, Trust Center.

**P3 — "Deniz," Head of IT / Platform (Technical evaluator)**
- Wants: clean deployment, Docker, migrations, monitoring, DR.
- Fears: operational burden, lock-in, fragile ops.
- Win: config-gated, self-hosted, observable, documented.
- Served by: Deployment, Docs, Architecture, Operations content.

**P4 — "Aylin," Marketing Ops / Campaign Manager (Daily user & champion)**
- Wants: to run more campaigns with less grunt work.
- Fears: losing creative control; low-quality AI output.
- Win: guided pipeline with human approval gates and versioned assets.
- Served by: Product deep-dives, How-it-works, Demo.

**P5 — "Mr. Öztürk," Group/Agency Executive (Portfolio buyer)**
- Wants: one platform serving many clients, isolated.
- Fears: cross-client data leakage.
- Win: strict multi-tenancy.
- Served by: For Agencies, Security, Pricing/Contact.

---

## 5. Core value proposition

**The single sentence:**
> Modern AI advertising with zero data egress — an autonomous ad agency that runs
> entirely inside your own infrastructure.

**The value stack:**
- **Control** — you own the models, the data, and the hardware.
- **Capability** — a full agency pipeline, not a chatbot.
- **Confidence** — enterprise security, isolation, backup and recovery.
- **Cost posture** — no per-token API bills; runs on hardware you already have.
- **Compliance** — data-residency and sovereignty by architecture, not policy.

**Value proof map (claim → evidence surfaced on site):**
| Claim | On-site evidence |
| --- | --- |
| No data leaves your walls | "Local AI" + "On-Prem" pages; architecture diagram |
| Autonomous, still controlled | Pipeline animation with approval gates |
| Enterprise-ready | Security page + Trust Center + DR/backup docs |
| Open, no lock-in | "Runs on Ollama/vLLM/LM Studio" logos + docs |
| Bilingual | Full TR/EN site parity |

---

## 6. Competitive differentiation

**Reference bar (design & credibility):** Microsoft, Atlassian, Notion, Linear,
OpenAI. We match their restraint, clarity, and enterprise trust cues.

**Competitive frame (how we position against categories, not named vendors on
the public site):**

| They offer | We offer instead |
| --- | --- |
| Cloud martech suites | On-prem, offline-first — data never egresses |
| AI tools on third-party APIs | Local models you own; no API keys, no egress |
| Point AI generators (copy/image) | A full agency pipeline with governance |
| DIY LLM stacks | A finished, hardened, multi-tenant product |
| "Trust us with your data" | "Keep your data — we never see it" |

**The wedge:** *Sovereignty is the feature.* Everyone can generate an ad; only
AdOS generates it without your data ever leaving the building.

**Rules of engagement:** Never disparage named competitors on the public site.
Differentiate on architecture and outcomes. Comparison content lives in a factual
"Why AdOS" page and gated battlecards for sales — never as public mudslinging.

---

## 7. Navigation structure

**Primary nav (persistent, top):**
- **Product** (mega-menu: Overview, How it works, The AI Pipeline, Multi-tenancy,
  Assets & Approvals, Analytics & Executive)
- **Solutions** (Local AI, On-Prem & Offline, For Regulated Industries, For
  Agencies)
- **Security** (Security overview, Trust Center, Compliance)
- **Docs** (link to product documentation)
- **Company** (About, Careers, Contact)
- **Pricing / Contact Sales**
- Utility: **Language switch (TR/EN)**, **Sign in** (to app), **Book a demo**
  (primary CTA button).

**Mega-menu rules:** max 6 links per column, each with a one-line descriptor;
one "featured" card per menu (e.g. "New: Local AI on your GPUs"). Keyboard and
screen-reader navigable (see §15).

**Mobile nav:** full-screen overlay, accordion sections, sticky "Book a demo"
CTA at the bottom, language switch pinned top-right.

**Secondary/contextual nav:** in-page anchor rail on long pages (Product,
Security), sticky on desktop.

---

## 8. Sitemap

```
/
├── /product
│   ├── /product/overview
│   ├── /product/how-it-works
│   ├── /product/ai-pipeline            (brief→creative→campaign→analytics→executive)
│   ├── /product/multi-tenancy
│   ├── /product/assets-approvals
│   └── /product/analytics-executive
├── /solutions
│   ├── /solutions/local-ai
│   ├── /solutions/on-prem-offline
│   ├── /solutions/regulated-industries
│   └── /solutions/agencies
├── /security
│   ├── /security                       (overview)
│   ├── /security/trust-center
│   └── /security/compliance            (KVKK, GDPR posture)
├── /why-ados                           (factual differentiation)
├── /pricing                            (or /contact-sales if pricing is gated)
├── /customers                          (stories, when available)
├── /company
│   ├── /company/about
│   ├── /company/careers
│   └── /company/contact
├── /demo                               (demo request flow)
├── /docs                               (external link to product docs)
├── /blog                               (thought leadership; future)
├── /legal
│   ├── /legal/terms
│   ├── /legal/privacy
│   ├── /legal/cookies
│   ├── /legal/dpa                      (data processing addendum)
│   └── /legal/sla
├── /status                             (link; system/marketing uptime)
├── /sitemap.xml
└── /robots.txt
```

**Language:** every route exists in TR and EN (`/tr/...`, `/en/...` or
`hreflang`-paired equivalents — see §17).

---

## 9. Design language

**Design ethos:** *Sovereign minimalism.* Generous whitespace, strong
typographic hierarchy, restrained motion, one confident accent color, and
diagrams that explain the architecture. The site should feel like enterprise
infrastructure you can trust — quiet, precise, and fast.

**Principles:**
1. **Clarity over decoration.** Every element earns its place.
2. **Evidence over adjectives.** Show diagrams, numbers, and mechanisms.
3. **Calm confidence.** No loud gradients, no stock-photo hype.
4. **Consistency.** One grid, one type scale, one spacing scale, one motion
   language.
5. **Dark-first, light-parity.** A premium dark aesthetic (matching the product)
   with a fully-supported light theme.

**Grid:** 12-column, 1280px max content width (1440px for full-bleed sections),
80px desktop gutters, 24px mobile. 4pt baseline grid governs vertical rhythm.

**Imagery:** product UI captures, architecture diagrams, and abstract "local
compute" motifs (nodes, on-prem racks, perimeter lines). No generic stock people.
Diagrams are first-class assets, not afterthoughts.

**Iconography:** single-weight line icons, 1.5px stroke, 24px grid, rounded
joins; consistent with the product's glyph style.

---

## 10. Typography

**Typefaces:**
- **Display / Headings:** a modern grotesque with strong presence — primary:
  *Inter Display* (or *Söhne* / *Neue Haas Grotesk* if licensed). Fallback:
  system sans.
- **Body / UI:** *Inter* (variable). Fallback:
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
  sans-serif` — matching the product app.
- **Mono (code, metrics, technical):** *JetBrains Mono* / `ui-monospace,
  SFMono-Regular, Menlo, monospace`.
- Must fully support **Turkish glyphs** (ı, İ, ş, ğ, ç, ö, ü) — verify dotted/
  dotless i rendering.

**Type scale (desktop, 1.2–1.25 modular, rem @ 16px base):**
| Token | Size / line-height | Weight | Use |
| --- | --- | --- | --- |
| `display-1` | 72 / 1.05 | 700 | Home hero |
| `display-2` | 56 / 1.08 | 700 | Page heroes |
| `h1` | 40 / 1.15 | 700 | Section titles |
| `h2` | 32 / 1.2 | 600 | Sub-sections |
| `h3` | 24 / 1.3 | 600 | Cards |
| `h4` | 20 / 1.4 | 600 | Small headers |
| `body-lg` | 18 / 1.6 | 400 | Lead paragraphs |
| `body` | 16 / 1.6 | 400 | Default |
| `body-sm` | 14 / 1.5 | 400 | Captions, meta |
| `overline` | 12 / 1.4, +0.08em, uppercase | 600 | Eyebrows/labels |
| `mono` | 14 / 1.5 | 400–500 | Code, metrics |

**Rules:** headings tighten tracking (−0.01 to −0.02em); body never below 16px;
measure 60–75ch for body; fluid `clamp()` scaling between mobile and desktop; max
two weights per view.

---

## 11. Color system

Aligned with the AdOS product palette for brand continuity (product uses
`--brand:#5b8cff`, violet `#9d7bff`, ink `#0e1116`).

**Core tokens (dark-first):**
| Token | Hex | Use |
| --- | --- | --- |
| `--ink-900` (bg) | `#0E1116` | Primary background |
| `--ink-800` (panel) | `#161B22` | Cards, panels |
| `--ink-700` | `#1C2230` | Raised surfaces |
| `--line` | `#2A3140` | Borders, dividers |
| `--text` | `#E6EDF3` | Primary text |
| `--muted` | `#8B98A9` | Secondary text |
| `--brand` | `#5B8CFF` | Primary accent, CTAs |
| `--brand-2` | `#7AA2FF` | Hover/links |
| `--violet` | `#9D7BFF` | Secondary accent, gradients |
| `--ok` | `#3FB950` | Success, security-positive |
| `--warn` | `#D29922` | Caution |
| `--err` | `#F85149` | Error |

**Light theme (parity):** `--bg #FFFFFF`, `--panel #F6F8FA`, `--line #D8DEE6`,
`--text #0E1116`, `--muted #5A6675`, brand hues unchanged (verify AA contrast on
white; darken brand text to `#3A6BEA` where needed).

**Gradient (used sparingly):** `linear-gradient(135deg, #5B8CFF, #9D7BFF)` — hero
accents, the logo mark, and one key diagram highlight only. Never on body text.

**Usage rules:**
- One accent per view; the gradient is a garnish, not a background.
- Security-positive states use `--ok`; never use red/`--err` decoratively.
- All text/background pairs meet WCAG 2.2 AA (≥4.5:1 body, ≥3:1 large). Validate
  every token pair in both themes.
- Color is never the sole carrier of meaning (icons/labels accompany).

---

## 12. Spacing system

**Base unit: 4px.** All spacing is a multiple. Named scale:
| Token | px | Typical use |
| --- | --- | --- |
| `space-1` | 4 | icon/text gap |
| `space-2` | 8 | tight |
| `space-3` | 12 | control padding |
| `space-4` | 16 | default gap |
| `space-5` | 24 | card padding |
| `space-6` | 32 | between elements |
| `space-8` | 48 | sub-section |
| `space-10` | 64 | section padding (mobile) |
| `space-12` | 96 | section padding (desktop) |
| `space-16` | 128 | hero / major section |

**Rules:** vertical section rhythm uses `space-12`/`space-16` on desktop,
`space-10` on mobile; card internal padding `space-5`; radius scale 8/12/16px
(`--radius:12px` default, matching product); consistent 4pt baseline for text
blocks.

---

## 13. Component library

Design-system components (spec only — no implementation). Each has states:
default, hover, focus-visible, active, disabled, loading, error.

**Foundational**
- Buttons: `primary` (brand fill), `secondary` (ghost/outline), `tertiary`
  (text), `danger` (rare). Sizes sm/md/lg. Icon-leading/trailing variants.
- Links (inline, standalone-with-arrow), Badge/Pill, Tag, Tooltip, Avatar,
  Divider, Icon.

**Navigation**
- Top nav bar (transparent-on-hero → solid on scroll), Mega-menu, Mobile overlay
  nav, Anchor rail, Breadcrumbs, Footer, Language switcher, Theme toggle.

**Content**
- Hero (headline + sub + dual CTA + visual), Section header (eyebrow + title +
  intro), Feature card, Feature row (alternating media/text), Stat/metric tile,
  Logo wall ("Runs on" engines), Diagram frame, Code/terminal block, Comparison
  table, FAQ accordion, Testimonial/quote card, Callout/banner, Steps/timeline
  (the AI pipeline), Tab group, Pricing card (or "Contact" card).

**Trust**
- Security control card (icon + control + mechanism), Compliance badge row, Trust
  Center summary block, "No data egress" diagram, Uptime/status chip.

**Conversion**
- CTA band (full-width), Demo request form, Contact form, Newsletter opt-in
  (double opt-in), Cookie consent banner + preferences modal, Lead-gen modal.

**States & feedback**
- Form field (label, help, error, success), Inline validation, Toast, Skeleton
  loader, Empty state, 404/500 pages.

**Component rules:** every interactive component has a visible `:focus-visible`
ring (brand, 2px, 2px offset); minimum hit target 44×44px; content components are
theme-aware; no component depends on color alone for meaning.

---

## 14. Animation principles

**Philosophy:** motion clarifies, never decorates. Enterprise calm — nothing
bounces, nothing loops distractingly.

**Tokens:**
- Durations: `fast 120ms`, `base 200ms`, `slow 320ms`, `page 400ms`.
- Easing: `standard cubic-bezier(0.2, 0, 0, 1)`, `entrance
  cubic-bezier(0, 0, 0, 1)`, `exit cubic-bezier(0.4, 0, 1, 1)`.
- Distance: entrance translate ≤ 12px; opacity 0→1.

**Patterns:**
- Scroll-reveal: subtle fade + 8–12px rise, once, staggered ≤ 60ms.
- Nav: transparent→solid on scroll (200ms); mega-menu fade+rise (160ms).
- Hover: 120ms color/elevation only; no scale on text.
- Hero/pipeline: one signature animated diagram (the mission pipeline flowing
  through approval gates), paused off-screen, ≤ 6s loop, pausable.
- Numbers: count-up on first view (respect reduced motion).

**Hard rules:**
- **`prefers-reduced-motion: reduce` disables all non-essential motion** (reveals
  become instant, loops stop).
- No parallax that harms readability; no autoplaying video with sound; no motion
  that blocks interaction; 60fps or don't ship it.

---

## 15. Accessibility rules

**Standard: WCAG 2.2 Level AA, minimum. Target AAA for text contrast where
feasible.**

- **Contrast:** ≥4.5:1 body, ≥3:1 large text & UI/graphics, in both themes.
- **Keyboard:** every interactive element reachable and operable; logical tab
  order; visible `:focus-visible`; skip-to-content link; no keyboard traps;
  mega-menu and mobile nav fully keyboard-navigable; Esc closes overlays.
- **Screen readers:** semantic landmarks (`header/nav/main/footer`), one `h1`
  per page, ordered headings, descriptive `alt` (empty for decorative),
  ARIA only where semantics fall short, form labels + `aria-describedby` for
  errors, live regions for async feedback.
- **Motion:** honor `prefers-reduced-motion` (§14).
- **Forms:** labels always visible (no placeholder-as-label), inline + summarized
  errors, error text not color-only, 44px targets.
- **Language:** correct `lang` attribute per locale (`lang="tr"` / `lang="en"`),
  set on `<html>` and on any inline language switches.
- **Zoom/reflow:** usable at 200% zoom and 320px width with no loss of content.
- **Testing gate:** automated (axe) + manual keyboard + screen-reader (NVDA/
  VoiceOver) pass required before any page ships. Accessibility statement page
  published.

---

## 16. Responsive behavior

**Breakpoints:**
| Token | Range | Layout |
| --- | --- | --- |
| `xs` | < 480 | 1 column, stacked |
| `sm` | 480–767 | 1 column, larger type |
| `md` | 768–1023 | 2 columns where sensible; nav collapses to overlay |
| `lg` | 1024–1279 | full multi-column, mega-menu |
| `xl` | ≥ 1280 | max content 1280; full-bleed sections to 1440 |

**Rules:** mobile-first authoring; fluid type via `clamp()`; touch targets ≥44px;
tables scroll horizontally inside a bounded container (never break the page
width); diagrams have a mobile-simplified variant; images `max-width:100%` +
responsive `srcset`; the body never scrolls horizontally at any width.

---

## 17. SEO strategy

**Goals:** rank for sovereignty/on-prem/local-AI advertising intent in EN and TR;
establish the "Enterprise AI Operating System" category.

- **Information architecture:** one clear H1 per page; descriptive, keyword-aware
  titles (≤60 chars) and meta descriptions (≤155 chars); clean, human-readable
  URLs (§8).
- **Priority keyword themes:** "on-prem AI advertising," "local AI marketing,"
  "offline AI ad platform," "self-hosted AI advertising," "KVKK/GDPR advertising
  AI," "data-sovereign marketing AI," plus Turkish equivalents ("yerel yapay zekâ
  reklam," "kurum içi reklam yapay zekâsı," "veri egemenliği").
- **Bilingual SEO:** `hreflang` pairs for every TR/EN route; `x-default`;
  self-referencing canonicals; no auto-redirect that hides a locale from crawlers.
- **Structured data (JSON-LD):** `Organization`, `SoftwareApplication`,
  `BreadcrumbList`, `FAQPage`, `Article` (blog). 
- **Technical SEO:** `sitemap.xml`, `robots.txt`, semantic HTML, fast Core Web
  Vitals (§18), OpenGraph + Twitter cards with branded share images, descriptive
  image alt.
- **Content SEO:** pillar pages (Local AI, On-Prem, Security) + supporting
  articles; internal linking to pillars; no thin/duplicate pages; no keyword
  stuffing.
- **Governance:** no cloaking, no doorway pages; accessibility and SEO share the
  same semantic foundation.

---

## 18. Performance budget

**Targets (Core Web Vitals, 75th percentile, mobile):**
| Metric | Budget |
| --- | --- |
| LCP | ≤ 2.0s (target 1.5s) |
| INP | ≤ 200ms |
| CLS | ≤ 0.05 |
| TTFB | ≤ 0.5s |
| First-load JS (per route) | ≤ 130KB gzip |
| Total page weight (initial) | ≤ 1.0MB |
| Fonts | ≤ 2 families, ≤ 4 files, `font-display: swap`, subset (incl. Turkish) |
| Requests (initial) | ≤ 40 |
| Lighthouse (Perf/A11y/Best/SEO) | ≥ 95 each |

**Rules:** images in AVIF/WebP with responsive `srcset` and explicit dimensions
(no CLS); lazy-load below-the-fold; preload the hero font + LCP image; no
render-blocking third-party scripts; defer analytics; self-host fonts; motion
must not regress INP. Performance is a release gate, not a nice-to-have.

---

## 19. Copywriting principles

**Voice:** expert, calm, precise. We are the trusted infrastructure vendor, not
the hype merchant. Sentences are short. Claims are specific. Benefits precede
features.

**Rules:**
1. **Lead with the outcome**, then the mechanism ("Campaigns run without your
   data leaving the building — because every model is local").
2. **Specificity is credibility.** Prefer "AES-256-GCM encrypted backups" over
   "bank-grade security."
3. **No hype words** (see §2 do-not-say). No exclamation marks in body.
4. **Active voice, second person** ("you own the models").
5. **One idea per section.** Scannable: eyebrow → headline → one paragraph → proof.
6. **Numbers earn trust** — cite real product facts (multi-tenant isolation,
   approval gates, 100% local).
7. **Bilingual parity:** Turkish copy is authored, not machine-translated;
   idiomatic and correct (dotted/dotless i, terminology consistency). A bilingual
   glossary governs key terms (e.g. "on-prem" → "kurum içi," "local AI" → "yerel
   yapay zekâ").
8. **Accessibility of language:** plain language, expand acronyms on first use,
   reading level ~ grade 9 for marketing copy.

**Headline formulas:** [Outcome] without [fear]. / [Capability], entirely
[on your terms]. / The [category] for [audience].

---

## 20. CTA strategy

**Primary CTA (whole site):** **"Book a demo"** → demo request flow (§27).
**Secondary CTA:** **"Talk to sales"** / **"Read the security overview"**
(for CISO persona) / **"View docs"** (for IT persona).

**Placement:**
- Sticky primary CTA in the top nav (always visible).
- Hero: dual CTA (primary "Book a demo" + secondary "How it works").
- End of every major page: full-width CTA band.
- Security/Local-AI pages: persona-tuned secondary CTA ("Request a security
  briefing").
- Mobile: sticky bottom "Book a demo."

**Rules:** one primary CTA per view; verbs, not "Submit"; never more than two CTAs
competing; CTA copy states the value ("Book a demo," "Get the security overview")
not the mechanic. Track each CTA distinctly (§21).

---

## 21. Conversion funnel

**Stages & site mechanics:**
1. **Awareness** — SEO pillar pages, thought-leadership, share cards. KPI: organic
   sessions, category impressions.
2. **Interest** — Product/How-it-works, pipeline diagram, Local-AI page. KPI:
   scroll depth, time on page, docs clicks.
3. **Consideration** — Security page, Trust Center, Why-AdOS, comparison facts.
   KPI: security-page reach, resource downloads.
4. **Intent** — Demo request, Contact sales, Pricing/Contact. KPI: form starts.
5. **Action** — completed demo request / qualified lead. KPI: MQL→SQL, demo
   booked.
6. **Advocacy** — customer stories, referrals (post-sale).

**Funnel design rules:** every page offers a next step matched to persona and
stage; the CISO path (Security → Trust Center → security briefing) is a
first-class parallel funnel to the CMO path (Product → Demo). Minimize form
friction (§27). Instrument each stage; no dead-end pages.

---

## 22. Enterprise trust signals

Surface throughout, concentrated in a **Trust Center**:
- **Architecture proof:** the "no data egress" diagram; "runs on your hardware."
- **Security controls:** tenant isolation, Argon2id auth, CSP/security headers,
  rate limiting/brute-force protection, encrypted backups, disaster recovery —
  each as a control card with its mechanism.
- **Compliance posture:** KVKK & GDPR data-residency-by-architecture; DPA
  available; roadmap to formal attestations (SOC 2 / ISO 27001) stated honestly
  as "in progress" if not yet held — never claim uncertified.
- **Operational maturity:** monitoring, `/metrics`, documented runbooks, DR/RTO-
  RPO, versioned releases (v1.0.0).
- **Transparency:** public documentation, changelog, status page, security
  contact / responsible-disclosure policy.
- **Human proof:** named leadership, real company address, customer logos/quotes
  when available (only real ones).

**Rule:** never fabricate a badge, certification, customer, or metric. Trust is
lost once. If a certification is pending, say "in progress."

---

## 23. Footer structure

**Columns:**
1. **Product** — Overview, How it works, AI Pipeline, Multi-tenancy, Security.
2. **Solutions** — Local AI, On-Prem & Offline, Regulated Industries, Agencies.
3. **Resources** — Docs, Trust Center, Changelog, Status, Blog.
4. **Company** — About, Careers, Contact, Press.
5. **Legal** — Terms, Privacy, Cookies, DPA, SLA, Accessibility statement.

**Footer utility row:** logo, one-line positioning, language switch (TR/EN),
theme toggle, security/responsible-disclosure contact, social links (real ones
only), copyright, company legal entity + address.

**Rules:** footer is consistent site-wide; cookie-preferences link always present
here (§25); no orphan legal pages — all reachable from the footer.

---

## 24. Legal pages

Required, each its own route under `/legal` (§8):
- **Terms of Service** — use, IP, disclaimers, governing law (Türkiye + relevant
  jurisdictions).
- **Privacy Policy** — what the *marketing site* collects (forms, analytics,
  cookies); explicitly states the **product** processes customer data on the
  customer's own infrastructure (AdOS does not receive it).
- **Cookie Policy** — categories, purposes, durations, consent management (§25).
- **Data Processing Addendum (DPA)** — for prospects/customers; KVKK & GDPR terms.
- **SLA** — for the marketing site/status and product support tiers.
- **Accessibility Statement** — conformance target (WCAG 2.2 AA), contact for
  issues.
- **Responsible Disclosure / Security policy** — how to report vulnerabilities.

**Rules:** plain-language summaries atop each policy; last-updated date;
versioned; legal-reviewed before publish; bilingual (TR governing where required
by KVKK).

---

## 25. Cookie policy placement

- **Consent banner** on first visit: non-blocking but prominent; **reject-all is
  as easy as accept-all** (equal weight buttons); granular categories
  (Strictly-necessary [always on], Analytics, Preferences, Marketing).
- **No non-essential cookies fire before consent** (GDPR/KVKK compliant); default
  is opt-out for non-essential.
- **Preferences modal** reachable from the banner and permanently from the footer
  ("Cookie preferences").
- **Cookie Policy page** (`/legal/cookies`) lists every cookie: name, provider,
  purpose, category, duration.
- **Records of consent** retained per regulation; consent re-prompted on policy
  change or expiry.
- **Analytics** loads only after consent and is privacy-respecting (IP
  anonymization; prefer a cookieless/first-party analytics posture consistent
  with the sovereignty brand).

---

## 26. Contact strategy

**Channels:**
- **Book a demo** (primary conversion, §27).
- **Contact sales** — form + direct email; enterprise/RFP path.
- **Security briefing** — CISO-oriented; routes to security/solutions engineering.
- **Support** — for customers (link to docs + support portal/email).
- **Responsible disclosure** — dedicated security contact.
- **General/Press/Careers** — clearly separated inboxes.

**Rules:** every contact route states expected response time; forms are minimal
(§27); a real company address and legal entity appear in the footer and contact
page; bilingual forms; no dark patterns; spam protection that is accessible (no
image-only CAPTCHA — use privacy-respecting, accessible verification).

---

## 27. Demo request flow

**Design goal:** maximum qualified conversions, minimum friction, enterprise-
appropriate.

**Flow:**
1. **Entry:** "Book a demo" CTA (nav, hero, CTA bands, mobile sticky).
2. **Form (single screen, short):**
   - Work email (required, business-domain validated)
   - Full name (required)
   - Company (required)
   - Role (optional select — routes to persona-tuned demo)
   - Company size (optional)
   - Country / data-residency need (optional — flags regulated buyers)
   - "What do you want to protect / achieve?" (optional free text)
   - Consent checkbox (privacy) — unticked by default
3. **Progressive disclosure:** ask the minimum up front; enrich later. No phone
   required to book.
4. **Confirmation:** immediate on-screen success + what happens next + expected
   response time; calendar-booking option (self-serve slot) where possible.
5. **Routing:** CISO-signalled leads → security briefing track; agency leads →
   multi-tenant track.
6. **Follow-up:** double opt-in for any newsletter; no unsolicited marketing.

**Rules:** WCAG-conformant form (§15); inline validation; no more than ~6 visible
fields; clear privacy statement inline; success and error states designed; the
form never blocks on non-essential fields.

---

## 28. Security messaging

**Thesis:** *Security is architecture, not a policy page.* We prove it.

**Message spine:**
- **Data never leaves your perimeter** — the platform runs on-prem; the AI is
  local; there is no cloud endpoint to leak to.
- **Isolation by design** — strict multi-tenancy (`TenantContext` scopes every
  query, event, job, storage key).
- **Hardened by default** — Argon2id credentials, CSP + full security-header set,
  brute-force lockout + rate limiting, CSRF protection, HTTPS/HSTS.
- **Recoverable** — encrypted (AES-256-GCM + SHA-256) incremental backups,
  documented disaster recovery with RTO/RPO.
- **Observable & auditable** — every domain action emits a tenant-scoped audit
  event; monitoring and `/metrics` built in.

**Rules:** every security claim links to a mechanism (Trust Center control card).
Compliance stated honestly (§22). Never overclaim certifications.

---

## 29. AI messaging

**Thesis:** *An AI company, governed by you.*

- **Autonomous, not unaccountable:** AdOS runs the full pipeline (brief →
  creative → campaign → analytics → executive → learning) but **stops for your
  approval at every stage.**
- **Governed AI:** one interface (`AIManagerPort`) mediates all AI; nothing talks
  to a model directly — safety, validation and structure are enforced.
- **Explainable output:** structured, schema-valid results with provenance
  (which model, when).
- **Model-agnostic:** swap models without changing anything downstream.

**Rules:** never anthropomorphize beyond "AI company / autonomous agency"; never
imply human-level guarantees; always foreground human approval; show real
pipeline output, not fabricated demos.

---

## 30. Local AI messaging

**Thesis:** *The models run on your machines. Full stop.*

- **No cloud, no API keys, no egress.** Inference happens on your hardware.
- **Open engines:** runs on **Ollama, vLLM, LM Studio, llama.cpp, SGLang** — a
  "Runs on" logo wall.
- **You choose the model** (e.g. Qwen and other open local models); swap freely;
  no per-token bill.
- **Bilingual generation:** output follows the user's language automatically
  (TR/EN).

**Proof surfaces:** a `/solutions/local-ai` page with an architecture diagram
(request → local AI Manager → local engine, perimeter line showing nothing
leaves), the engines logo wall, and an honest note on local-model performance
(hardware-dependent).

**Rules:** never show a cloud logo in the AI path; be honest that local model
quality/latency depends on the customer's hardware.

---

## 31. Offline deployment messaging

**Thesis:** *Built offline-first — it works with no internet at all.*

- Runs in **air-gapped** environments; no outbound calls required for core
  operation.
- Ships with a deterministic offline AI manager so it functions even before a
  model server is attached.
- All dependencies are self-hostable; no runtime SaaS dependency.

**Audience:** defense-adjacent, critical infrastructure, high-security
government/finance. Surface on `/solutions/on-prem-offline`.

**Rules:** distinguish clearly between "offline-capable" (true) and any
optional online conveniences; never imply an online requirement.

---

## 32. On-Prem messaging

**Thesis:** *Your infrastructure. Your rules.*

- **Deploys where you are:** your data center, private cloud, or bare metal —
  Docker stack (web + workers + Postgres + observability).
- **You operate it:** documented installation, upgrade (forward-only idempotent
  migrations), operations, backup and DR guides.
- **No lock-in:** open engines, standard Postgres, portable data, exportable
  backups.
- **Scales on your terms:** stateless web tier, horizontally-scalable workers,
  tunable DB pool.

**Audience:** Head of IT / Platform (P3), CISO (P2). Surface on
`/solutions/on-prem-offline` with a deployment topology diagram and a link to
docs.

**Rules:** be concrete about requirements (Node ≥ 20, pnpm, Docker, optional
GPU); set honest operational expectations; link real documentation.

---

## 33. Future extensibility

**The site must scale without redesign.**

- **Content model:** page = composable sections from the §13 component library;
  new pages assemble existing blocks. A future CMS maps cleanly to these tokens
  and components.
- **New sections planned for:** Customers/Case studies, Blog/Insights, Events/
  Webinars, Partners/Marketplace (future connector ecosystem), Careers growth,
  Pricing (when public), Regional landing pages, Trust Center expansion
  (certifications as they are earned).
- **Internationalization:** the TR/EN system generalizes to more locales
  (`hreflang` + translation workflow already assumed).
- **Design tokens as contract:** color, type, spacing, motion tokens (§10–14) are
  the single source of truth; a future implementation (any framework) consumes
  the same tokens, so a re-platform never re-designs.
- **Governance:** this constitution is versioned; changes are proposed as
  amendments with rationale. New components must declare states, a11y, responsive
  and motion behavior before adoption.
- **Analytics & experimentation:** structure supports privacy-respecting A/B
  testing of headlines/CTAs without violating §25.

**Non-goals (protect focus):** no consumer/self-serve signup funnel at launch
(enterprise demo-led); no public pricing until validated; no feature bloat that
dilutes the sovereignty message.

---

## Appendix A — Guardrails (non-negotiable)

- This is the **marketing website only**. It never modifies the AdOS application,
  packages, business logic, APIs, or tests. All artifacts live under `website/`.
- **No fabricated trust** (badges, certs, customers, metrics).
- **No cloud/egress claims** that contradict the product's local-first reality.
- **Accessibility (WCAG 2.2 AA) and performance budgets are release gates**, not
  aspirations.
- **Bilingual parity (TR/EN)** is mandatory for all core pages.
- Every message ladders to a brand pillar (§1) and is backed by a real mechanism.

## Appendix B — Definition of done (per page)

A page ships only when: it maps to a persona + funnel stage; has one H1 and
ordered headings; passes axe + manual keyboard + screen-reader checks; meets the
performance budget; has TR + EN parity; has SEO metadata + JSON-LD; offers a
persona-appropriate next step (CTA); uses only §13 components and §10–14 tokens;
and has been reviewed against this constitution.
```
```
