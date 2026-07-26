// AdOS ROI Calculator — deterministic engine.
// Implements sales/ROI_CALCULATOR_SPEC.md §1–§3 exactly (1:1).
// Pure function: f(inputs, assumptions) -> outputs. No randomness, no Date,
// no network, no locale-dependent arithmetic. Same args => same result.

/** Illustrative placeholder defaults (SPEC §1). NOT benchmarks or promises. */
export const DEFAULT_INPUTS = Object.freeze({
  employee_count: 500,
  avg_annual_salary: 600000,
  search_minutes_per_day: 30,
  manual_process_count: 25,
  avg_approval_delay_hours: 24,
  monthly_document_volume: 5000,
  meetings_per_week: 5,
  annual_training_cost: 2000000,
  ai_adoption_rate: 60,
  annual_investment: 3000000,
  currency: 'TRY',
});

/** Adjustable model assumptions (SPEC §2). Editable; never guarantees. */
export const DEFAULT_ASSUMPTIONS = Object.freeze({
  WORKING_DAYS_PER_YEAR: 220,
  WORKING_HOURS_PER_DAY: 8,
  WORKING_WEEKS_PER_YEAR: 44,
  SEARCH_TIME_RECOVERABLE: 0.5,
  APPROVAL_DELAY_REDUCTION: 0.6,
  MANUAL_PROCESS_TIME_SAVED: 0.4,
  HOURS_PER_MANUAL_PROCESS_PER_YEAR: 200,
  MINUTES_PER_DOCUMENT: 5,
  DOCUMENT_TIME_SAVED: 0.4,
  MEETING_DURATION_HOURS: 1.0,
  MEETING_TIME_SAVED: 0.2,
  TRAINING_COST_REDUCTION: 0.3,
  EFFICIENCY_BASELINE_HOURS_PCT: 1.0,
  RAMP_MONTHS: 12,
  RAMP_CURVE: 'linear',
});

/** Input bounds (SPEC §1) for validation. */
export const INPUT_BOUNDS = Object.freeze({
  employee_count: { min: 1, max: 100000, integer: true, required: true },
  avg_annual_salary: { min: 1, max: 100000000, required: true },
  search_minutes_per_day: { min: 0, max: 480 },
  manual_process_count: { min: 0, max: 10000, integer: true },
  avg_approval_delay_hours: { min: 0, max: 2000 },
  monthly_document_volume: { min: 0, max: 100000000, integer: true },
  meetings_per_week: { min: 0, max: 100 },
  annual_training_cost: { min: 0, max: 10000000000 },
  ai_adoption_rate: { min: 0, max: 100 },
  annual_investment: { min: 0, max: 10000000000 },
});

export const CURRENCIES = Object.freeze(['TRY', 'USD', 'EUR']);

/**
 * Linear adoption ramp factor for month m (1-indexed) in [0,1]. SPEC §2.
 */
export function ramp(m, a = DEFAULT_ASSUMPTIONS) {
  return Math.min(1, m / a.RAMP_MONTHS);
}

/**
 * The pure ROI engine. SPEC §3.
 * @param {object} inputs   values matching DEFAULT_INPUTS keys
 * @param {object} assumptions  values matching DEFAULT_ASSUMPTIONS keys
 * @returns {object} the output summary object (SPEC §3.7)
 */
export function calculate(inputs = {}, assumptions = {}) {
  const i = { ...DEFAULT_INPUTS, ...inputs };
  const a = { ...DEFAULT_ASSUMPTIONS, ...assumptions };

  // Derived base quantities (SPEC §3).
  const hourly_cost =
    i.avg_annual_salary / (a.WORKING_DAYS_PER_YEAR * a.WORKING_HOURS_PER_DAY);
  const adoption = i.ai_adoption_rate / 100;

  // §3.1 gross annual hours (before adoption scaling).
  const search_hours_gross =
    (i.employee_count * i.search_minutes_per_day * a.WORKING_DAYS_PER_YEAR) /
    60 *
    a.SEARCH_TIME_RECOVERABLE;

  const process_hours_gross =
    i.manual_process_count *
    a.HOURS_PER_MANUAL_PROCESS_PER_YEAR *
    a.MANUAL_PROCESS_TIME_SAVED;

  const approval_hours_gross =
    i.manual_process_count *
    i.avg_approval_delay_hours *
    a.APPROVAL_DELAY_REDUCTION;

  const document_hours_gross =
    (i.monthly_document_volume * 12 * a.MINUTES_PER_DOCUMENT) / 60 *
    a.DOCUMENT_TIME_SAVED;

  const meeting_hours_gross =
    i.employee_count *
    i.meetings_per_week *
    a.WORKING_WEEKS_PER_YEAR *
    a.MEETING_DURATION_HOURS *
    a.MEETING_TIME_SAVED;

  const sum_gross =
    search_hours_gross +
    process_hours_gross +
    approval_hours_gross +
    document_hours_gross +
    meeting_hours_gross;

  const time_savings_hours = adoption * sum_gross;

  // §3.2 annual savings.
  const labor_savings = adoption * hourly_cost * sum_gross;
  const training_savings =
    adoption * i.annual_training_cost * a.TRAINING_COST_REDUCTION;
  const annual_savings = labor_savings + training_savings;

  // §3.7 per-source breakdown (sums to annual_savings).
  const scale = adoption * hourly_cost;
  const savings_breakdown = {
    company_brain_search: scale * search_hours_gross,
    digital_employees_process: scale * process_hours_gross,
    workflows_approvals: scale * approval_hours_gross,
    digital_employees_docs: scale * document_hours_gross,
    company_brain_meetings: scale * meeting_hours_gross,
    training: training_savings,
  };

  // §3.3 net benefit.
  const net_annual_benefit = annual_savings - i.annual_investment;

  // §3.4 ROI %.
  const roi_percent =
    i.annual_investment > 0
      ? ((annual_savings - i.annual_investment) / i.annual_investment) * 100
      : null;

  // §3.5 payback months.
  const monthly_savings = annual_savings / 12;
  let payback_months;
  if (i.annual_investment === 0) payback_months = 0;
  else if (monthly_savings > 0) payback_months = i.annual_investment / monthly_savings;
  else payback_months = null;

  // §3.6 efficiency gain %.
  const total_available_hours =
    i.employee_count *
    a.WORKING_DAYS_PER_YEAR *
    a.WORKING_HOURS_PER_DAY *
    a.EFFICIENCY_BASELINE_HOURS_PCT;
  const efficiency_gain_percent =
    total_available_hours > 0
      ? (time_savings_hours / total_available_hours) * 100
      : null;

  return {
    time_savings_hours,
    annual_savings,
    labor_savings,
    training_savings,
    savings_breakdown,
    net_annual_benefit,
    roi_percent,
    payback_months,
    efficiency_gain_percent,
    monthly_savings,
    hourly_cost,
    adoption,
    currency: i.currency,
  };
}

/**
 * 36-month cumulative series for the line chart (SPEC §4.2).
 * @returns {{months:number[], savings:number[], investment:number[], payback_month:(number|null)}}
 */
export function cumulativeSeries(inputs = {}, assumptions = {}) {
  const a = { ...DEFAULT_ASSUMPTIONS, ...assumptions };
  const out = calculate(inputs, assumptions);
  const monthly_savings = out.monthly_savings;
  const monthly_investment = ({ ...DEFAULT_INPUTS, ...inputs }).annual_investment / 12;
  const months = [];
  const savings = [];
  const investment = [];
  let cumS = 0;
  let cumI = 0;
  let payback_month = null;
  for (let m = 1; m <= 36; m++) {
    cumS += monthly_savings * ramp(m, a);
    cumI += monthly_investment;
    months.push(m);
    savings.push(cumS);
    investment.push(cumI);
    if (payback_month === null && cumS >= cumI && monthly_investment > 0) {
      payback_month = m;
    }
  }
  return { months, savings, investment, payback_month };
}

/**
 * Validate inputs against SPEC §5. Returns { errors:{field:msg}, warnings:[msg-keys] }.
 * Messages are returned as i18n keys so the UI can localize (CANON bilingual rule).
 */
export function validateInputs(inputs, out) {
  const i = { ...DEFAULT_INPUTS, ...inputs };
  const errors = {};
  for (const [field, b] of Object.entries(INPUT_BOUNDS)) {
    const v = i[field];
    if (b.required && (v === '' || v === null || v === undefined || Number.isNaN(v))) {
      errors[field] = 'err_required';
      continue;
    }
    if (v === '' || v === null || v === undefined) continue;
    if (Number.isNaN(Number(v))) { errors[field] = 'err_number'; continue; }
    if (b.integer && !Number.isInteger(Number(v))) { errors[field] = 'err_integer'; continue; }
    if (Number(v) < b.min || Number(v) > b.max) { errors[field] = 'err_range'; }
  }
  if (!CURRENCIES.includes(i.currency)) errors.currency = 'err_currency';

  const warnings = [];
  if (out) {
    if (i.search_minutes_per_day > 120) warnings.push('warn_search_high');
    if (i.avg_approval_delay_hours > 720) warnings.push('warn_approval_high');
    if (out.efficiency_gain_percent != null && out.efficiency_gain_percent > 40)
      warnings.push('warn_efficiency_high');
    if (i.annual_investment === 0) warnings.push('warn_roi_undefined');
    if (out.roi_percent != null && out.roi_percent < 0) warnings.push('warn_roi_negative');
    if (out.annual_savings > 0 && i.annual_investment > 3 * out.annual_savings)
      warnings.push('warn_investment_high');
  }
  return { errors, warnings };
}
