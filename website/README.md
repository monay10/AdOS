# AdOS Corporate Website

The official AdOS **marketing website**. This is **not** the AdOS application.

- Fully isolated in `website/`. It does not import, modify, or depend on the AdOS
  application, packages, business logic, APIs, or tests.
- Static site — **no backend, no API dependency**. Forms acknowledge locally.
- Stack: **React 19 + TypeScript + Vite**. Plain CSS with design tokens (no CSS
  framework).
- **Bilingual (TR/EN)** with automatic language detection, **dark/light** themes,
  **WCAG 2.2 AA** intent, SEO metadata per page.

## Specification

The site is built to these documents (also in `website/`):

- `WEBSITE_CONSTITUTION.md` — brand, design and content constitution (33 sections)
- `WEBSITE_INFORMATION_ARCHITECTURE.md` — sitemap, journeys, funnels, analytics
- `WEBSITE_COPY.md` — bilingual copy (EN/TR, side by side)
- `WEBSITE_DESIGN_SYSTEM.md` — tokens, components, motion, accessibility

## Develop

```bash
cd website
npm install
npm run dev      # local dev server
npm run build    # tsc -b && vite build → dist/
npm run lint     # eslint
npm run preview  # preview the production build
```

## Notes

- `src/config.ts` holds placeholder external URLs (`APP_URL`, `DOCS_URL`) — set
  these to the real application and docs URLs at deploy time.
- It is a client-routed SPA; a static host should serve `index.html` for unknown
  paths (SPA fallback).
- Content copy lives in `src/i18n/content.ts` (mirrors `WEBSITE_COPY.md`).
