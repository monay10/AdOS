# AdOS ROI Calculator

An **offline, static, deterministic** ROI calculator that implements
[`../ROI_CALCULATOR_SPEC.md`](../ROI_CALCULATOR_SPEC.md) 1:1. It produces a
**planning model the buyer controls — never a guaranteed result** (spec §0.1).

- **Offline / air-gapped** — no backend, no external API, no CDN, no fonts to
  fetch, no analytics. Open `index.html` and it works with no internet, exactly
  like AdOS itself.
- **Deterministic** — the engine is a pure function `f(inputs, assumptions) →
  outputs`; identical inputs always yield identical outputs.
- **Bilingual TR/EN** — auto-detected, toggleable. Product terms (AdOS, Company
  Brain, Digital Employees) stay in English in both languages.
- **Responsive · dark/light** — system font stack; theme follows the OS and a
  manual toggle.
- **Exports** — downloadable **PDF** (self-contained writer), **Excel**
  (SpreadsheetML `.xls`), and a **print report** (`window.print()` → Save as PDF
  for pixel-perfect Turkish).

## Run

```bash
cd sales/roi-calculator
npm test          # run the engine + format + export tests (node:test)
npm run serve     # optional preview server → http://localhost:4310
# or simply open index.html in a browser (no server needed)
```

## Layout

```
roi-calculator/
  index.html        static entry (loads src/app.js as a module)
  styles.css        theme-aware, responsive, print stylesheet
  serve.js          optional zero-dep preview server
  src/
    calc.js         the deterministic engine (SPEC §1–§3) + validation (§5)
    format.js       currency/number/percent formatting (SPEC §7)
    i18n.js         TR/EN strings + field ordering (SPEC §9)
    charts.js       inline-SVG bar / line / gauge (SPEC §4) — no chart library
    pdf.js          minimal self-contained PDF writer (Export PDF)
    xls.js          SpreadsheetML workbook writer (Export Excel)
    app.js          UI controller (browser only)
  test/
    calc.test.js    reproduces the SPEC §8 verification vector + determinism
    format.test.js  formatting + PDF/Excel export smoke tests
```

## Honesty by design

Every output is displayed with the **assumptions panel visible** and the standing
note that this is a planning model, not a guarantee (spec §0.1). Default inputs
are **illustrative placeholders** — replace them with the buyer's discovery
numbers. There is **no per-token / per-query cost** anywhere in the model: local
inference has no marginal API bill (spec §0.2, aligned to the Sales Kit
Constitution §12/§17).

## Note on the PDF export & Turkish glyphs

The self-contained PDF writer uses the standard Helvetica (WinAnsi) encoding.
Four Turkish-specific letters outside WinAnsi (`ğ ş ı İ`) are transliterated in
the downloadable PDF. For pixel-perfect Turkish, use **Print report** — the
browser renders full Unicode and you can Save as PDF.
