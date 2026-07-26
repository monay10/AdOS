# AdOS — Website Design System

**Companion to:** `WEBSITE_CONSTITUTION.md` (tokens originate there). This is the
enterprise-grade design system for the AdOS corporate website. Documentation
only; isolated to `website/`. Tokens are the contract — any implementation
consumes these exact values.

---

## 1. Design tokens (source of truth)

All values below are **design tokens**. They are referenced by name everywhere;
raw values never appear ad hoc in a page.

### Color (dark-first; light parity)
| Token | Dark | Light |
| --- | --- | --- |
| `--bg` | `#0E1116` | `#FFFFFF` |
| `--panel` | `#161B22` | `#F6F8FA` |
| `--panel-2` | `#1C2230` | `#EEF2F6` |
| `--line` | `#2A3140` | `#D8DEE6` |
| `--text` | `#E6EDF3` | `#0E1116` |
| `--muted` | `#8B98A9` | `#5A6675` |
| `--brand` | `#5B8CFF` | `#3A6BEA` (text-on-white) / `#5B8CFF` (fills) |
| `--brand-2` | `#7AA2FF` | `#5B8CFF` |
| `--violet` | `#9D7BFF` | `#7E5BE0` |
| `--ok` | `#3FB950` | `#1A7F37` |
| `--warn` | `#D29922` | `#9A6700` |
| `--err` | `#F85149` | `#CF222E` |
| `--gradient` | `linear-gradient(135deg,#5B8CFF,#9D7BFF)` | same |

### Typography
Families: **Inter** (body/UI, variable), **Inter Display** (headings), monospace
`JetBrains Mono / ui-monospace`. Full Turkish glyph support required. Scale and
weights per `Constitution §10`.

### Spacing (4px base)
`4, 8, 12, 16, 24, 32, 48, 64, 96, 128` → `space-1 … space-16`
(`Constitution §12`).

### Radius
`--radius-sm 8px`, `--radius 12px` (default), `--radius-lg 16px`, `--radius-pill
999px`.

### Elevation (shadows — used sparingly, dark-tuned)
| Token | Value |
| --- | --- |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,.4)` |
| `--shadow` | `0 1px 3px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.25)` |
| `--shadow-lg` | `0 8px 40px rgba(0,0,0,.35)` |

Light mode uses softer shadows (`rgba(16,24,40,.06/.10)`).

### Z-index scale
`base 0`, `raised 10`, `sticky-nav 100`, `dropdown 200`, `overlay 900`,
`modal 1000`, `toast 1100`.

### Motion tokens
Durations `120/200/320/400ms`; easings per `Constitution §14`.

---

## 2. Grid

- **12 columns.** Gutters: 24px (mobile) → 32px (tablet) → 40px (desktop).
- **Baseline:** 4px vertical rhythm; type and spacing snap to it.
- **Column spans:** content blocks use 12/8/6/4-col spans; body text max 8 cols
  (≈ 60–75ch measure).
- **Alignment:** left-aligned by default; centered only for hero eyebrow/headline
  and section intros ≤ 2 lines.
- **Asymmetry allowed** for feature rows (7/5 media-text splits) to avoid a rigid
  brochure feel.

---

## 3. Layout

- **Page skeleton:** sticky header → main (section stack) → footer.
- **Section = full-bleed band** (optional tinted `--panel` background) containing
  a centered **container** (§11) with a grid.
- **Vertical rhythm:** sections use `space-12`/`space-16` padding on desktop,
  `space-10` on mobile.
- **Feature rows:** alternate media/left ↔ media/right; never more than 3 in a row
  without a breather (stat, quote, diagram).
- **Anchor rail:** long pages (Product, Security) get a sticky left/side rail of
  section anchors on `lg+`.
- **Fold discipline:** hero must show positioning + primary CTA + one trust signal
  above the fold at every breakpoint (`IA §4`).

---

## 4. Container widths

| Token | Max width | Use |
| --- | --- | --- |
| `--container-prose` | 720px | legal/blog reading width |
| `--container` | 1120px | default content |
| `--container-wide` | 1280px | product/marketing sections |
| `--container-bleed` | 1440px | full-bleed visuals, hero backdrops |
| Page gutter | 24 / 32 / 40px | mobile / tablet / desktop |

Content never exceeds `--container-wide`; only backgrounds/visuals bleed to 1440.

---

## 5. Breakpoints & responsive

| Name | Range | Behavior |
| --- | --- | --- |
| **Mobile** | < 480 | 1 column; stacked; overlay nav; sticky CTA; simplified diagrams |
| **Mobile-L** | 480–767 | 1 column; larger type |
| **Tablet** | 768–1023 | 2-column where sensible; nav still overlay; feature rows stack |
| **Desktop** | 1024–1279 | full multi-column; mega-menu; anchor rail; feature rows side-by-side |
| **Large desktop** | ≥ 1280 | content capped at 1280; visuals bleed to 1440; more whitespace, not bigger text |

**Rules:** mobile-first; fluid type via `clamp()`; touch targets ≥ 44px; tables
and code scroll inside bounded containers; images `srcset`; **no horizontal body
scroll at any width**; test at 320px and 200% zoom.

---

## 6. Hero design

- **Structure:** eyebrow (overline) → headline (`display-1/2`) → subhero
  (`body-lg`, ≤ 2 lines) → dual CTA (primary + secondary) → visual (product
  capture or the animated pipeline diagram) → trust strip directly below.
- **Layout:** desktop = text left (7 cols) / visual right (5 cols); mobile =
  stacked, text first, CTA before visual.
- **Background:** `--bg` with a subtle `--gradient` glow (low opacity, top-right),
  never a busy image behind text.
- **Contrast:** headline meets AAA where possible; CTA is the only saturated
  element in the fold.
- **Motion:** one signature animated diagram, paused off-screen, ≤ 6s,
  reduced-motion → static (`Constitution §14`).

---

## 7. Cards

- **Anatomy:** container (`--panel`, `1px --line`, `--radius`, `--shadow`,
  `space-5` padding) → optional icon/media → title (`h3`) → body (`body`) →
  optional link/CTA.
- **Variants:** feature card, security control card (icon + control + mechanism),
  use-case card, stat/metric tile, quote card, pricing card.
- **States:** default; hover (border → `--brand`, subtle lift 2px, 120ms); focus-
  visible (2px brand ring). No hover scale on text.
- **Grid:** `repeat(auto-fill, minmax(280px, 1fr))`, `space-4` gap.
- **Rule:** a card is a link target as a whole where it represents one
  destination (entire card clickable, with a visible affordance).

---

## 8. Buttons

| Variant | Look | Use |
| --- | --- | --- |
| **Primary** | `--brand` fill, white text, `--radius`, `space-3`×`space-5` | Book a demo (one per view) |
| **Secondary** | transparent, `1px --line`, `--text` | How it works, Talk to sales |
| **Tertiary** | text + arrow, `--brand-2` | inline links |
| **Danger** | `--err` fill | rare (destructive) |

- **Sizes:** sm (32px), md (40px, default), lg (48px, hero).
- **States:** hover (`--brand-2` / border brighten, 120ms); active (slight
  darken); focus-visible (2px ring, 2px offset); disabled (50% opacity, no
  pointer); loading (spinner + `aria-busy`, label retained).
- **Rules:** min target 44×44; label is a value-verb (`CTA §20`); icon optional,
  never icon-only for primary CTAs; never two primaries in one viewport.

---

## 9. Icons

- **Style:** single-weight line icons, **1.5px stroke**, 24px grid, rounded
  joins/caps, no fills — consistent with the product glyph language.
- **Sizes:** 16 / 20 / 24 / 32px. Inherit `currentColor`.
- **Usage:** always paired with a text label in nav/CTAs (never icon-only for
  meaning); decorative icons get `aria-hidden`; meaningful icons get an
  accessible name.
- **Set:** navigation, security (shield, lock, key), infrastructure (server,
  node, perimeter), pipeline (brief, spark, target, chart, star), status
  (check, alert). Consistent metaphors across the site.

---

## 10. Illustrations & illustration style

- **Role:** illustrations explain architecture; they are diagrams, not decoration.
- **Signature motif:** the **perimeter line** — a boundary showing data staying
  inside; the "no data egress" diagram is the hero of the system.
- **Style:** geometric, line-led, two-tone (`--brand` + `--violet`) on `--bg`,
  thin strokes, generous space, subtle gradient accents only on key nodes.
- **Recurring diagrams:** (a) request → local AI Manager → local model with
  perimeter; (b) the mission pipeline with approval gates; (c) on-prem deployment
  topology; (d) multi-tenant isolation.
- **Rules:** every diagram has a text caption and an accessible description; a
  simplified mobile variant; consistent node/edge language; never purely
  aesthetic 3D renders.

---

## 11. Photography style

- **Default: no stock people.** We are infrastructure; we show product and
  architecture, not smiling models.
- **Allowed:** authentic team/office photography (About/Careers) — real, muted,
  documentary tone; data-center/hardware imagery treated with the brand duotone.
- **Treatment:** desaturated base + subtle brand-tint; dark-friendly; consistent
  grain-free finish.
- **Product imagery:** clean UI captures on `--panel`, real screens (TR and EN
  variants), never faked dashboards.
- **Rules:** no hype stock, no generic "AI brain" clip art, no misrepresented UI.

---

## 12. Empty states

For any dynamic/list surface (e.g. Customers before stories exist, search):
- **Anatomy:** a small line illustration/icon → a plain-language line → one
  next-step CTA.
- **Tone:** matter-of-fact, never cute. E.g. "Customer stories are coming soon —
  in the meantime, book a demo."
- **Rule:** empty ≠ broken; always offer a path forward; bilingual; accessible
  (not color-only).

---

## 13. Animations & motion rules

Per `Constitution §14`, restated as system rules:
- **Purpose:** clarify, never decorate. Enterprise calm.
- **Durations/easing:** tokens in §1; entrances ≤ 12px translate + opacity.
- **Patterns:** scroll-reveal (once, stagger ≤ 60ms); nav transparent→solid on
  scroll; hover = color/elevation only (120ms); one signature pipeline animation;
  count-up numbers on first view.
- **Hard limits:** `prefers-reduced-motion: reduce` disables all non-essential
  motion; no autoplay sound; no parallax that harms reading; 60fps or cut it;
  motion must not regress INP (`Constitution §18`).

---

## 14. Accessibility (design-level)

WCAG 2.2 AA minimum (`Constitution §15`). Design responsibilities:
- **Contrast** verified for every token pair in both themes (≥4.5:1 body, ≥3:1
  large/UI).
- **Focus-visible** ring designed for every interactive element (2px `--brand`,
  2px offset) — visible in both themes.
- **Targets** ≥ 44×44px with adequate spacing.
- **Never color-only:** pair with icon/label/text (status, links, errors).
- **Typography:** body ≥ 16px, line-height ≥ 1.5, measure ≤ 75ch.
- **Forms:** persistent visible labels, inline + summary errors, described-by
  hints.
- **Motion & language:** reduced-motion honored; correct `lang` per locale;
  bilingual parity.
- **Deliverable:** a published Accessibility Statement; a11y is a ship gate.

---

## 15. Dark mode & light mode

- **Dark is primary** (matches the product); **light is full parity**, not an
  afterthought.
- **Mechanism:** a `data-theme` attribute on the root switches token values;
  default follows `prefers-color-scheme`, with a persisted user toggle.
- **Rules:** both themes pass AA; brand hues adjust for contrast on white
  (`--brand` text → `#3A6BEA`); shadows soften in light; illustrations and product
  captures ship in both themes; no theme-only content.
- **Toggle:** in header + footer; icon + accessible label; remembers choice.

---

## 16. Brand rules

- **Name:** always "AdOS" (capital A, capital OS). Never "Ados," "ADOS," "adOS."
- **Tagline:** "The Advertising Operating System" (EN) / "Reklam İşletim Sistemi"
  (TR). Use verbatim.
- **Voice:** precise, calm, credible (`Constitution §19`). No buzzwords, no
  exclamation marks in body.
- **One accent per view;** the gradient is a garnish, never a background for text.
- **Trust integrity:** never display a badge, certification, customer or metric
  that is not real (`Constitution §22`).
- **Do-not:** cloud imagery in the AI/data path; hype adjectives; competitor
  disparagement on public pages.

---

## 17. Logo usage

- **Primary lockup:** the AdOS mark (gradient rounded-square with the ▲ glyph) +
  "AdOS" wordmark, matching the product logo.
- **Clear space:** minimum padding around the logo = the height of the mark (1×)
  on all sides.
- **Minimum size:** 24px mark height (digital); wordmark legible ≥ 96px wide.
- **Color:** on `--bg`/dark → full-color mark + `--text` wordmark; on light →
  same mark + ink wordmark; monochrome permitted where color can't reproduce.
- **Backgrounds:** place on `--bg`, `--panel`, or brand gradient only; ensure
  contrast; never on busy photography.
- **Don'ts:** don't recolor the mark arbitrarily, distort, rotate, add effects,
  outline the wordmark, or reconstruct the lockup. Favicon uses the mark only.

---

## 18. Component states matrix (reference)

Every interactive component defines: **default, hover, focus-visible, active,
disabled, loading, error/success** (where applicable). A component isn't "done"
until all applicable states, plus responsive, a11y, dark/light and reduced-motion
behavior, are specified (`Constitution Appendix B`).

---

## 19. Enterprise-quality checklist (per screen)

- [ ] Uses only tokens (color/type/space/radius/motion) — no ad-hoc values.
- [ ] AA contrast, focus-visible, 44px targets, labels, no color-only meaning.
- [ ] Dark + light parity; reduced-motion honored.
- [ ] Responsive at 320px → 1440px+, no horizontal scroll.
- [ ] One primary CTA per view; brand voice; no buzzwords.
- [ ] Diagrams captioned + described; no fake UI or unverifiable claims.
- [ ] Meets the performance budget (`Constitution §18`).
- [ ] TR + EN parity.
