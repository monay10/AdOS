# AdOS ROI Calculator — Specification

**Product:** AdOS — Enterprise AI Operating System for Advertising (an AI
advertising-agency OS). AdOS **drafts** human-approved advertising work — marketing
briefs, ad copy, campaign plans, and performance reports — on **100% local AI**
(no cloud, no per-token billing, data stays on your infrastructure). It does not
launch or optimize live campaigns; the ROI below is built only on that reality.
**Owner:** Office of the Chief Revenue Officer (with Solution Engineering)
**Status:** Official — binding on the implemented calculator
**Version:** 1.0.0 · Aligned to AdOS v1.0.0 and `SALES_KIT_CONSTITUTION.md` §10
**Audience:** Solution Engineers (build), Account Executives (use with buyer)
**Deliverable governed:** `sales/roi-calculator/` (offline static web app, built later)

---

## 0. What this document is

This is the exact, unambiguous specification for the AdOS ROI calculator. It is
**documentation only**. The calculator itself is a separate, offline, static web
app to be implemented from this spec **1:1**. Every input, constant, formula,
chart, and rule below is normative: an engineer implements exactly what is
written here, and no more.

Where this spec and the Sales Kit Constitution appear to conflict, the
Constitution wins (§10 ROI communication, §17 pricing). This spec conforms to it.

### 0.1 The honest frame (mandatory, non-removable)

The calculator produces a **model the buyer controls**, not a guarantee. This is
not a disclaimer to bury — it is the product.

- Every output is a **projection** derived from **buyer-supplied inputs** and
  **clearly labeled, adjustable assumptions**.
- The UI **must** show the assumptions panel whenever it shows any output. An
  output can never be displayed with the assumptions hidden.
- The default assumption values are **illustrative**, not benchmarks or promises.
  The buyer is expected to overwrite them with their own discovery numbers.
- Required standing text, shown near the outputs in both languages:
  > **EN:** "This is a planning model, not a guaranteed result. Every number
  > below is calculated from the inputs and assumptions you can see and change.
  > AdOS does not guarantee any specific financial outcome."
  > **TR:** "Bu bir planlama modelidir, garanti edilen bir sonuç değildir.
  > Aşağıdaki her değer, görebildiğiniz ve değiştirebildiğiniz girdi ve
  > varsayımlardan hesaplanır. AdOS herhangi bir finansal sonucu garanti etmez."

### 0.2 Alignment to CANON

- **No per-token / per-query cost** anywhere in the model. Local inference has no
  marginal API bill — unlike per-token/per-query cloud SaaS — so scaling AI usage
  does not scale the bill (CANON, Constitution §12, §17). Investment is
  **value-based**: platform license + support/success only. See `annual_investment`.
- Outputs headline in the Constitution §10 order: **Annual Savings, ROI %,
  Payback Period, Efficiency Gain**, with **payback period led** in narration.
- Savings map to what AdOS actually does — drafting human-approved advertising
  work on 100% local AI:
  - **Company Brain** (a marketing-performance memory): less time hunting for past
    campaign results and creative references; fewer status/review meetings.
  - **AI-assisted drafting** (human-in-the-loop): AI drafts marketing briefs, ad
    copy, campaign plans, and performance reports for human review, cutting manual
    agency / creative / reporting effort.
  - **Human-approved pipeline**: the gated Mission → Brief → Creative → Campaign
    Draft → Report → Executive-dashboard stages remove idle wait between approvals.

  Every AdOS stage produces a **draft for human approval** — nothing is launched,
  optimized live, or pushed to an ad platform (see §0.3).

### 0.3 Not included in this ROI model (Roadmap)

This model counts only savings from capabilities AdOS ships **today**: AI-assisted
drafting of human-approved advertising work on 100% local inference, plus the
marketing-performance Company Brain. It deliberately does **not** credit savings
that depend on capabilities the product does not have. The following are
**excluded from this ROI** and belong to the Roadmap:

- Revenue or media savings from **launching or optimizing live ad campaigns** —
  AdOS produces drafts only; nothing is launched or optimized on an ad platform.
- Labor savings from **connector / integration automation** (ad platforms, CRMs,
  data warehouses) — performance metrics are entered by hand today.
- Savings from **document Q&A / a document knowledge base** — Company Brain is a
  marketing-performance memory, not a document-answering system.
- Headcount savings from **autonomous "digital employees" replacing staff** — the
  pipeline is human-in-the-loop and every stage requires a human approval click.
- Savings attributed to **enforced role-based permissions, an immutable audit
  trail, or cloud inference** — the model relies on none of these.

If and when these ship, they may be added later as clearly labeled, separate lines.

---

## 1. Inputs

Each input has: variable name (implementation identifier), EN label, TR label,
type, unit, default, min, max, and validation rule. Defaults are **illustrative
placeholders**, not benchmarks.

| # | Variable | EN label | TR label | Type | Unit | Default | Min | Max | Validation |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `employee_count` | Employee count | Çalışan sayısı | integer | people | 500 | 1 | 100000 | required; integer; `min ≤ x ≤ max` |
| 2 | `avg_annual_salary` | Average annual salary (fully loaded) | Ortalama yıllık maaş (tüm maliyetler dahil) | number | currency/year | 600000 | 1 | 100000000 | required; `> 0`; loaded cost (salary + employer burden) |
| 3 | `search_minutes_per_day` | Campaign & creative research time | Kampanya ve kreatif araştırma süresi | number | minutes/employee/day | 30 | 0 | 480 | `0 ≤ x ≤ 480` (≤ one 8h day) |
| 4 | `manual_process_count` | Recurring marketing production tasks | Yinelenen pazarlama üretim görevi sayısı | integer | tasks | 25 | 0 | 10000 | integer; `≥ 0` |
| 5 | `avg_approval_delay_hours` | Average approval delay | Ortalama onay gecikmesi | number | hours/approval | 24 | 0 | 2000 | `≥ 0` |
| 6 | `monthly_document_volume` | Monthly report & asset volume | Aylık rapor ve kreatif varlık hacmi | integer | items/month | 5000 | 0 | 100000000 | integer; `≥ 0` |
| 7 | `meetings_per_week` | Meetings per week per employee | Çalışan başına haftalık toplantı | number | meetings/employee/week | 5 | 0 | 100 | `≥ 0` |
| 8 | `annual_training_cost` | Annual training cost | Yıllık eğitim maliyeti | number | currency/year | 2000000 | 0 | 10000000000 | `≥ 0` |
| 9 | `ai_adoption_rate` | Expected AI adoption rate | Beklenen AI benimseme oranı | number | percent | 60 | 0 | 100 | `0 ≤ x ≤ 100` |
| 10 | `annual_investment` | Annual AdOS investment (license + support) | Yıllık AdOS yatırımı (lisans + destek) | number | currency/year | 3000000 | 0 | 10000000000 | `≥ 0`; value-based; **no per-token cost** |
| 11 | `currency` | Currency | Para birimi | enum | — | `TRY` | — | — | one of `TRY`, `USD`, `EUR` |

Notes:
- `annual_investment` is a **placeholder input**, not a quote. The rate card lives
  elsewhere (Constitution §17). It is entered by the SE for modeling only and
  drives ROI% and payback. Label it as an estimate in the UI.
- All currency inputs are in the **same selected `currency`**. The calculator does
  **not** convert between currencies (see §7).
- Two derived, non-editable quantities used throughout (shown read-only if
  displayed):
  - `hourly_cost = avg_annual_salary / (WORKING_DAYS_PER_YEAR × WORKING_HOURS_PER_DAY)`
  - `adoption = ai_adoption_rate / 100` (a fraction in `[0, 1]`)

---

## 2. Assumptions (named model constants)

These are **adjustable model assumptions, not guarantees**. Each is editable in
the assumptions panel and must be visible whenever outputs are shown (§0.1). All
percentages are stored internally as fractions in `[0, 1]`; the UI may present
them as percent.

| Constant | EN label | TR label | Default | Unit | Rationale (illustrative) |
|---|---|---|---|---|---|
| `WORKING_DAYS_PER_YEAR` | Working days per year | Yıllık çalışma günü | 220 | days | ~260 weekdays minus leave/holidays. |
| `WORKING_HOURS_PER_DAY` | Working hours per day | Günlük çalışma saati | 8 | hours | Standard full workday. |
| `WORKING_WEEKS_PER_YEAR` | Working weeks per year | Yıllık çalışma haftası | 44 | weeks | `220 / 5`; keeps weekly inputs consistent with annual days. |
| `SEARCH_TIME_RECOVERABLE` | Campaign-research time recovered by Company Brain | Company Brain ile geri kazanılan kampanya araştırma süresi | 0.50 | fraction | Company Brain surfaces past winning campaigns and creative patterns, cutting repeated hunting; not all research is removable. |
| `APPROVAL_DELAY_REDUCTION` | Approval delay reduction (human-approved pipeline) | Onay gecikmesi azalması | 0.60 | fraction | Human-approved pipeline gates remove idle wait between stages, not decision time. |
| `MANUAL_PROCESS_TIME_SAVED` | Production-task time saved by AI-assisted drafting | Yapay zekâ destekli taslak hazırlama ile azalan üretim görevi süresi | 0.40 | fraction | AI drafts briefs / creative / campaign plans; humans keep judgment and approval steps. |
| `HOURS_PER_MANUAL_PROCESS_PER_YEAR` | Labor hours per production task per year | Üretim görevi başına yıllık iş gücü saati | 200 | hours/task/year | Illustrative annual human effort per recurring marketing production task. |
| `MINUTES_PER_DOCUMENT` | Human time to draft/prepare per report or asset | Rapor/varlık başına insan hazırlama süresi | 5 | minutes/item | Draft / assemble / format per report or creative asset. |
| `DOCUMENT_TIME_SAVED` | Report & asset drafting time saved | Rapor ve varlık hazırlama süresinden tasarruf | 0.40 | fraction | AI drafts reports and creative assets; humans review and approve. |
| `MEETING_DURATION_HOURS` | Average meeting duration | Ortalama toplantı süresi | 1.0 | hours/meeting | Illustrative mean. |
| `MEETING_TIME_SAVED` | Meeting time saved (fewer/shorter, better prepared) | Toplantı süresinden tasarruf | 0.20 | fraction | Auto-drafted performance reports and the executive dashboard reduce status/review meetings; most meetings remain. |
| `TRAINING_COST_REDUCTION` | Training-cost reduction (campaign-learning retention) | Eğitim maliyeti azalması | 0.30 | fraction | Company Brain retains which campaigns and creative worked, shortening ramp-up on past-campaign learnings. |
| `EFFICIENCY_BASELINE_HOURS_PCT` | Denominator basis for efficiency gain | Verimlilik payda temeli | 1.0 | fraction | Efficiency measured against total available productive hours (§3.6). |

**Adoption ramp** (used only for the 36-month cumulative chart, §4.2). Adoption is
not instantaneous; benefits phase in. The steady-state annual figures in §3 use
full `adoption`; the ramp scales the monthly cumulative curve.

| Constant | EN label | TR label | Default | Unit | Rationale |
|---|---|---|---|---|---|
| `RAMP_MONTHS` | Adoption ramp length | Benimseme rampası süresi | 12 | months | Linear ramp from deploy to steady-state adoption. |
| `RAMP_CURVE` | Ramp shape | Rampa şekli | `linear` | enum | `linear` only in v1.0.0 (deterministic, simple). |

Ramp factor for month `m` (1-indexed), a fraction in `[0, 1]`:

```
ramp(m) = min(1, m / RAMP_MONTHS)      // linear
```

---

## 3. Formulas (deterministic outputs)

All arithmetic is deterministic real-number arithmetic. No randomness, no
rounding inside intermediate steps (round only for display, §7.3). All monetary
values are in the selected `currency`. Every benefit term is scaled by `adoption`
so the model reflects the buyer's expected uptake.

Derived base quantities (from §1):

```
hourly_cost = avg_annual_salary / (WORKING_DAYS_PER_YEAR * WORKING_HOURS_PER_DAY)
adoption    = ai_adoption_rate / 100
```

### 3.1 Time savings (hours/year)

Five independent components, each an annual gross-hours figure before adoption
scaling. Company Brain, AI-assisted drafting, and the human-approved pipeline each
map to named components.

**(a) Campaign & creative research — Company Brain**
```
search_hours_gross =
    employee_count
  * search_minutes_per_day
  * WORKING_DAYS_PER_YEAR
  / 60
  * SEARCH_TIME_RECOVERABLE
```

**(b) Marketing production tasks — AI-assisted drafting**
```
process_hours_gross =
    manual_process_count
  * HOURS_PER_MANUAL_PROCESS_PER_YEAR
  * MANUAL_PROCESS_TIME_SAVED
```

**(c) Approval delay — human-approved pipeline**
Approval delay reduces *elapsed wait*, not necessarily labor hours. To keep one
consistent hours-based model, delay hours saved are counted as recovered process
throughput time, scaled by the number of manual processes that carry approvals.
```
approval_hours_gross =
    manual_process_count
  * avg_approval_delay_hours
  * APPROVAL_DELAY_REDUCTION
```
> Modeling note (must appear as a tooltip): approval-delay savings represent
> recovered cycle time, valued at `hourly_cost` as a proxy. This is the most
> assumption-sensitive term; buyers should tune `APPROVAL_DELAY_REDUCTION`.

**(d) Report & asset drafting — AI-assisted drafting**
```
document_hours_gross =
    monthly_document_volume
  * 12
  * MINUTES_PER_DOCUMENT
  / 60
  * DOCUMENT_TIME_SAVED
```

**(e) Review meetings — Company Brain (auto-drafted reports, fewer status meetings)**
```
meeting_hours_gross =
    employee_count
  * meetings_per_week
  * WORKING_WEEKS_PER_YEAR
  * MEETING_DURATION_HOURS
  * MEETING_TIME_SAVED
```

**Total time savings (hours/year), adoption-scaled:**
```
time_savings_hours =
  adoption * (
      search_hours_gross
    + process_hours_gross
    + approval_hours_gross
    + document_hours_gross
    + meeting_hours_gross
  )
```

### 3.2 Annual savings (currency)

Labor-time components are valued at `hourly_cost`. Training savings are a direct
cost reduction (already a currency amount), also adoption-scaled.

```
labor_savings =
    adoption
  * hourly_cost
  * (
      search_hours_gross
    + process_hours_gross
    + approval_hours_gross
    + document_hours_gross
    + meeting_hours_gross
    )
// equivalently: labor_savings = hourly_cost * time_savings_hours

training_savings =
    adoption
  * annual_training_cost
  * TRAINING_COST_REDUCTION

annual_savings = labor_savings + training_savings
```

### 3.3 Net annual benefit

```
net_annual_benefit = annual_savings - annual_investment
```

### 3.4 ROI (%)

Return on the annual investment, expressed as a percentage.
```
if annual_investment > 0:
    roi_percent = (annual_savings - annual_investment) / annual_investment * 100
else:
    roi_percent = null   // undefined; display "—" and a note (see §5.4)
```

### 3.5 Payback period (months)

Time for cumulative savings to repay one year of investment. Uses the **steady-
state** monthly savings (ramp is applied only to the cumulative chart, §4.2; the
headline payback uses full-adoption monthly savings for a single clear number).
```
monthly_savings = annual_savings / 12

if monthly_savings > 0:
    payback_months = annual_investment / monthly_savings
else:
    payback_months = null   // no positive savings; display "—" (see §5.4)
```
> If `annual_investment = 0`, `payback_months = 0` (nothing to pay back). Display
> "0" with a note that no investment was entered.

### 3.6 Efficiency gains (%)

Reclaimed productive hours as a share of total available productive hours across
the workforce.
```
total_available_hours =
    employee_count
  * WORKING_DAYS_PER_YEAR
  * WORKING_HOURS_PER_DAY
  * EFFICIENCY_BASELINE_HOURS_PCT

if total_available_hours > 0:
    efficiency_gain_percent = time_savings_hours / total_available_hours * 100
else:
    efficiency_gain_percent = null
```
`efficiency_gain_percent` is **not** capped by construction; if inputs produce a
value above a sane threshold (e.g. > 40%), show the caution note in §5.4 prompting
the buyer to revisit assumptions. Do not silently clamp.

### 3.7 Output summary object (for implementers)

The engine returns exactly:
```
{
  time_savings_hours,          // number, hours/year
  annual_savings,              // number, currency/year
  labor_savings,               // number (breakdown)
  training_savings,            // number (breakdown)
  savings_breakdown: {         // currency, per pillar/source (adoption-scaled, * hourly_cost)
     company_brain_search,     // adoption * hourly_cost * search_hours_gross
     digital_employees_process,// adoption * hourly_cost * process_hours_gross
     workflows_approvals,      // adoption * hourly_cost * approval_hours_gross
     digital_employees_docs,   // adoption * hourly_cost * document_hours_gross
     company_brain_meetings,   // adoption * hourly_cost * meeting_hours_gross
     training                  // training_savings
  },
  net_annual_benefit,          // number
  roi_percent,                 // number | null
  payback_months,              // number | null
  efficiency_gain_percent,     // number | null
  currency                     // "TRY" | "USD" | "EUR"
}
```
The six `savings_breakdown` entries sum to `annual_savings`.

---

## 4. Charts

All charts are rendered from the output object only. No animation is required for
correctness. Colors, axis titles, and legends are bilingual (TR/EN) per the active
UI language. Currency axes use the formatting in §7.

### 4.1 Savings breakdown — horizontal bar

- **Type:** horizontal bar chart (one bar per source).
- **Purpose:** show where annual savings come from, tied to Company Brain,
  AI-assisted drafting, and the human-approved pipeline.
- **Y axis (categories):** the six `savings_breakdown` sources, labeled:
  Company Brain – Research, AI Drafting – Production, Human-Approved Pipeline,
  AI Drafting – Reports & Assets, Company Brain – Review Meetings, Training.
- **X axis:** currency/year, formatted per §7; starts at 0.
- **Series:** one series = the currency value of each source.
- **Annotations:** each bar labeled with its value and its % of `annual_savings`.

### 4.2 Cumulative savings vs investment over 36 months — line

- **Type:** line chart, two series, 36 monthly points (`m = 1..36`).
- **Purpose:** show when cumulative value overtakes cumulative investment.
- **X axis:** months, `1..36` (label every 6).
- **Y axis:** cumulative currency, formatted per §7; starts at 0.
- **Series A — Cumulative savings (ramp-adjusted):**
  ```
  cumulative_savings(m) = Σ_{k=1..m} ( monthly_savings * ramp(k) )
  // monthly_savings = annual_savings / 12 ; ramp(k) per §2
  ```
- **Series B — Cumulative investment:**
  ```
  cumulative_investment(m) = annual_investment / 12 * m
  ```
- **Payback marker:** vertical marker at the first month `m*` where
  `cumulative_savings(m) ≥ cumulative_investment(m)`. Label it "Payback / Geri
  ödeme: month m*". If no crossover within 36 months, show a note "No payback
  within 36 months at current inputs" and omit the marker.
  > Note: this ramp-based crossover month may differ from the headline
  > `payback_months` (§3.5), which uses steady-state savings. Both are legitimate;
  > the headline is the simple single number, the chart shows the phased reality.
  > Show both; do not hide the difference.

### 4.3 Efficiency gain — gauge

- **Type:** radial gauge (single value).
- **Purpose:** at-a-glance workforce efficiency reclaimed.
- **Value:** `efficiency_gain_percent` (%).
- **Scale:** 0% to 40% (chosen sane display ceiling). If the value exceeds 40%,
  peg the needle at 40% **for display only** and show the true value as text plus
  the §5.4 caution note. Never alter the computed number.
- **Bands (visual only, not claims):** 0–10% modest, 10–25% strong, 25–40% high.

### 4.4 Headline output tiles (not a chart, but specified here)

Four tiles in Constitution §10 order, payback narrated first:
1. **Annual Savings / Yıllık Tasarruf** — `annual_savings` (currency).
2. **ROI %** — `roi_percent` (or "—").
3. **Payback Period / Geri Ödeme Süresi** — `payback_months` months (or "—").
4. **Efficiency Gain / Verimlilik Artışı** — `efficiency_gain_percent` %.

Each tile carries a one-line "based on your inputs and assumptions" subtext.

---

## 5. Validation rules

### 5.1 Per-input bounds

Enforce every `min`/`max`/type rule in §1 on input (reject or clamp with a visible
message; prefer inline validation that blocks calculation until corrected).
Integers must be whole numbers. Percent inputs (`ai_adoption_rate`) are `0–100`.

### 5.2 Required fields

Required: `employee_count`, `avg_annual_salary`, `currency`. If any required field
is empty or invalid, do **not** compute outputs; show which field needs a value.
All other inputs default to `0` if left blank (a zero input simply zeroes its
component — see §5.3).

### 5.3 Zero / empty inputs

- Any single benefit input at `0` contributes `0` to its component; the model
  still runs. Example: `meetings_per_week = 0` removes the meeting term only.
- `ai_adoption_rate = 0` ⇒ all benefits are `0` ⇒ `annual_savings = 0`,
  `efficiency_gain_percent = 0`, `roi_percent = -100%` (if investment > 0),
  `payback_months = null`. Show the §5.4 note explaining that zero adoption yields
  zero modeled benefit.
- `annual_investment = 0` ⇒ `roi_percent = null` (division by zero; §3.4) and
  `payback_months = 0`. Display "—" for ROI with the §5.4 note.
- All benefit inputs empty/zero ⇒ all outputs zero/null; show the empty-state
  message: "Enter your numbers to model savings / Tasarrufu modellemek için
  değerlerinizi girin."

### 5.4 Cross-field / sanity checks (warnings, non-blocking)

Warnings inform; they do **not** block calculation. Show them near the outputs.
- **Search time high:** `search_minutes_per_day > 120` ⇒ "Over 2h/day per person
  spent searching — confirm this figure."
- **Approval delay extreme:** `avg_approval_delay_hours > 720` (30 days) ⇒ confirm.
- **Efficiency implausible:** `efficiency_gain_percent > 40` ⇒ "This efficiency
  gain is unusually high; revisit your assumptions — the model is only as honest
  as its inputs."
- **ROI undefined:** `annual_investment = 0` ⇒ "Enter an annual investment to see
  ROI % and payback."
- **Negative ROI:** `roi_percent < 0` ⇒ "At these inputs the model does not pay
  back in year one; adjust adoption, scope, or timeframe." (Neutral, honest tone.)
- **Investment ≫ savings:** `annual_investment > 3 × annual_savings` ⇒ "Investment
  is well above modeled first-year savings; check scope and assumptions."

All warning copy ships in TR and EN with identical meaning (CANON bilingual rule).

---

## 6. Determinism & offline guarantee

- **Deterministic:** identical inputs + identical assumptions **always** produce
  identical outputs. No randomness, no time-dependence (no `Date.now()` in the
  math), no locale-dependent arithmetic, no network calls of any kind.
- **Pure function:** the engine is a pure function
  `f(inputs, assumptions) → outputs`. Same arguments ⇒ same result, every time,
  on every machine.
- **Offline / air-gapped:** the app is a static bundle. **No** external API, CDN,
  font fetch, analytics, or telemetry at runtime. It must run fully with no
  internet — consistent with AdOS itself (CANON: offline-first, no telemetry).
- **No per-token or usage cost** enters the math anywhere (CANON §12/§17).
- **Floating point:** use IEEE-754 double precision; round only at display (§7.3).
  Intermediate values are never rounded. Comparisons for the payback marker use
  `≥` on unrounded cumulative sums.
- **Reproducibility:** given the same inputs, the exported/printed summary is
  byte-identical in its numbers across sessions and devices.

---

## 7. Currency handling

### 7.1 Selection

- `currency` ∈ `{TRY, USD, EUR}`. **Default `TRY`.**
- The selected currency is **cosmetic + labeling only**. It sets the symbol,
  formatting, and axis labels. It does **not** convert values. All currency inputs
  are assumed to already be in the selected currency.
- **No FX conversion** is performed and **no FX rate** is fetched (offline rule,
  §6). If the buyer switches currency, values are **not** recalculated — only the
  symbol/format changes. Show a one-time note: "Currency changes labels only;
  re-enter amounts in the chosen currency. / Para birimi yalnızca etiketleri
  değiştirir; tutarları seçilen para biriminde yeniden girin."

### 7.2 Symbols and codes

| Currency | Symbol | Code | Example (1 234 567.5) |
|---|---|---|---|
| TRY | ₺ | TRY | ₺1.234.567,50 (TR) · ₺1,234,567.50 (EN) |
| USD | $ | USD | $1,234,567.50 |
| EUR | € | EUR | €1.234.567,50 (TR) · €1,234,567.50 (EN) |

### 7.3 Formatting rules

- **Currency values:** 0 decimal places for large headline figures (e.g. Annual
  Savings) is acceptable, but the summary/export shows 2 decimals. Group thousands.
- **Locale of grouping/decimal separators follows the active UI language**, not the
  currency: TR UI ⇒ `.` thousands / `,` decimal; EN UI ⇒ `,` thousands / `.`
  decimal. The currency symbol/code follows `currency`.
- **Percentages** (`roi_percent`, `efficiency_gain_percent`): 1 decimal place,
  suffix `%`.
- **Payback months:** 1 decimal place, suffix "months / ay". If `> 36`, still show
  the number and note it exceeds the 36-month chart window.
- **Null outputs:** render as "—" with the relevant §5.4 note. Never render `NaN`,
  `Infinity`, or a blank.
- Rounding is **round-half-up** at the specified display precision, applied only at
  display time.

---

## 8. Worked example (verification vector for implementers)

Using **all defaults** from §1 and §2 (`currency = TRY`, TR/EN identical numbers):

```
hourly_cost = 600000 / (220 * 8) = 340.909090...  ₺/hour
adoption    = 60 / 100 = 0.60

search_hours_gross   = 500 * 30 * 220 / 60 * 0.50           = 27,500
process_hours_gross  = 25 * 200 * 0.40                      = 2,000
approval_hours_gross = 25 * 24 * 0.60                       = 360
document_hours_gross = 5000 * 12 * 5 / 60 * 0.40            = 2,000
meeting_hours_gross  = 500 * 5 * 44 * 1.0 * 0.20            = 22,000
sum_gross            = 53,860

time_savings_hours   = 0.60 * 53,860                        = 32,316 hours/year

labor_savings        = 340.909090... * 32,316              ≈ 11,016,818.18 ₺
training_savings     = 0.60 * 2,000,000 * 0.30             = 360,000 ₺
annual_savings       ≈ 11,376,818.18 ₺

net_annual_benefit   ≈ 11,376,818.18 - 3,000,000           ≈ 8,376,818.18 ₺
roi_percent          ≈ 8,376,818.18 / 3,000,000 * 100      ≈ 279.2 %
monthly_savings      ≈ 948,068.18 ₺
payback_months       ≈ 3,000,000 / 948,068.18              ≈ 3.2 months

total_available_hours = 500 * 220 * 8 * 1.0                 = 880,000
efficiency_gain_%    = 32,316 / 880,000 * 100              ≈ 3.7 %
```

Implementers: unit tests must reproduce these numbers (within display rounding)
from the default input/assumption set. Any deviation indicates a formula
transcription error.

> These figures are an **illustrative model output on placeholder defaults**, not
> an AdOS performance claim. Replace with the buyer's discovery numbers.

---

## 9. Turkish label glossary (UI)

Product names stay in English in both languages (CANON §20.3): **AdOS**,
**Company Brain**.

### Inputs
| EN | TR |
|---|---|
| Employee count | Çalışan sayısı |
| Average annual salary (fully loaded) | Ortalama yıllık maaş (tüm maliyetler dahil) |
| Campaign & creative research time (min/employee/day) | Kampanya ve kreatif araştırma süresi (dk/çalışan/gün) |
| Recurring marketing production tasks | Yinelenen pazarlama üretim görevi sayısı |
| Average approval delay (hours) | Ortalama onay gecikmesi (saat) |
| Monthly report & asset volume | Aylık rapor ve kreatif varlık hacmi |
| Meetings per week per employee | Çalışan başına haftalık toplantı |
| Annual training cost | Yıllık eğitim maliyeti |
| Expected AI adoption rate (%) | Beklenen AI benimseme oranı (%) |
| Annual AdOS investment (license + support) | Yıllık AdOS yatırımı (lisans + destek) |
| Currency | Para birimi |

### Assumptions
| EN | TR |
|---|---|
| Working days per year | Yıllık çalışma günü |
| Working hours per day | Günlük çalışma saati |
| Working weeks per year | Yıllık çalışma haftası |
| Campaign-research time recovered by Company Brain | Company Brain ile geri kazanılan kampanya araştırma süresi |
| Approval delay reduction | Onay gecikmesi azalması |
| Production-task time saved by AI-assisted drafting | Yapay zekâ destekli taslak hazırlama ile azalan üretim görevi süresi |
| Report & asset drafting time saved | Rapor ve varlık hazırlama süresinden tasarruf |
| Meeting time saved | Toplantı süresinden tasarruf |
| Training-cost reduction | Eğitim maliyeti azalması |
| Adoption ramp length | Benimseme rampası süresi |

### Outputs & UI
| EN | TR |
|---|---|
| Annual Savings | Yıllık Tasarruf |
| ROI % | Yatırım Getirisi (%) |
| Payback Period | Geri Ödeme Süresi |
| Efficiency Gain | Verimlilik Artışı |
| Time savings (hours/year) | Zaman Tasarrufu (saat/yıl) |
| Net annual benefit | Net Yıllık Fayda |
| Savings breakdown | Tasarruf Dağılımı |
| Cumulative savings vs investment | Kümülatif Tasarruf vs Yatırım |
| Payback point | Geri ödeme noktası |
| Assumptions panel | Varsayımlar Paneli |
| months | ay |
| Reset to defaults | Varsayılanlara sıfırla |
| This is a planning model, not a guarantee. | Bu bir planlama modelidir, garanti değildir. |

---

*This specification governs `sales/roi-calculator/`. It conforms to
`SALES_KIT_CONSTITUTION.md` (§10, §17) and the Canonical Brief. ROI is a model the
buyer controls, shown with its assumptions, and is never presented as a guarantee.*
