// Tests for the AdOS ROI engine. No external deps (node:test).
// The default-input vector reproduces sales/ROI_CALCULATOR_SPEC.md §8 exactly.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculate,
  cumulativeSeries,
  validateInputs,
  ramp,
  DEFAULT_INPUTS,
  DEFAULT_ASSUMPTIONS,
} from '../src/calc.js';

const approx = (a, b, tol = 0.5) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} ≈ ${b} (±${tol})`);

test('SPEC §8 verification vector reproduces on defaults', () => {
  const o = calculate(DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS);
  approx(o.hourly_cost, 340.90909, 0.001);
  approx(o.time_savings_hours, 32316, 0.001);
  approx(o.labor_savings, 11016818.18, 1);
  approx(o.training_savings, 360000, 0.001);
  approx(o.annual_savings, 11376818.18, 1);
  approx(o.net_annual_benefit, 8376818.18, 1);
  approx(o.roi_percent, 279.2, 0.1);
  approx(o.monthly_savings, 948068.18, 1);
  approx(o.payback_months, 3.16, 0.05);
  approx(o.efficiency_gain_percent, 3.67, 0.02);
});

test('savings_breakdown sums to annual_savings', () => {
  const o = calculate(DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS);
  const sum = Object.values(o.savings_breakdown).reduce((a, b) => a + b, 0);
  approx(sum, o.annual_savings, 0.0001);
});

test('deterministic: identical args → identical output', () => {
  const a = JSON.stringify(calculate(DEFAULT_INPUTS));
  const b = JSON.stringify(calculate(DEFAULT_INPUTS));
  assert.equal(a, b);
});

test('deterministic across many randomized-but-fixed inputs', () => {
  // Fixed vectors (no RNG) — determinism means same-in same-out.
  const vecs = [
    { employee_count: 1200, ai_adoption_rate: 45, annual_investment: 8000000 },
    { employee_count: 50, ai_adoption_rate: 100, annual_investment: 0 },
    { employee_count: 9000, search_minutes_per_day: 90, meetings_per_week: 12 },
  ];
  for (const v of vecs) {
    assert.equal(JSON.stringify(calculate(v)), JSON.stringify(calculate(v)));
  }
});

test('§3.4 ROI null when investment is zero', () => {
  const o = calculate({ annual_investment: 0 });
  assert.equal(o.roi_percent, null);
  assert.equal(o.payback_months, 0);
});

test('§5.3 zero adoption zeroes benefits', () => {
  const o = calculate({ ai_adoption_rate: 0 });
  assert.equal(o.annual_savings, 0);
  assert.equal(o.efficiency_gain_percent, 0);
  approx(o.roi_percent, -100, 0.0001); // investment>0
  assert.equal(o.payback_months, null);
});

test('§5.3 a single zero input only zeroes its own component', () => {
  const base = calculate(DEFAULT_INPUTS);
  const noMeetings = calculate({ ...DEFAULT_INPUTS, meetings_per_week: 0 });
  assert.ok(noMeetings.annual_savings < base.annual_savings);
  assert.ok(noMeetings.annual_savings > 0);
  assert.equal(noMeetings.savings_breakdown.company_brain_meetings, 0);
});

test('ramp is linear and clamps to 1', () => {
  assert.equal(ramp(6, DEFAULT_ASSUMPTIONS), 0.5);
  assert.equal(ramp(12, DEFAULT_ASSUMPTIONS), 1);
  assert.equal(ramp(24, DEFAULT_ASSUMPTIONS), 1);
});

test('cumulative series: 36 points, monotonic, payback within window on defaults', () => {
  const s = cumulativeSeries(DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS);
  assert.equal(s.months.length, 36);
  assert.equal(s.savings.length, 36);
  assert.equal(s.investment.length, 36);
  for (let m = 1; m < 36; m++) {
    assert.ok(s.savings[m] >= s.savings[m - 1]);
    assert.ok(s.investment[m] >= s.investment[m - 1]);
  }
  assert.ok(s.payback_month != null && s.payback_month >= 1 && s.payback_month <= 36);
});

test('§5 validation: required fields and ranges', () => {
  const bad = { employee_count: '', avg_annual_salary: -5, ai_adoption_rate: 150 };
  const { errors } = validateInputs(bad, calculate(bad));
  assert.equal(errors.employee_count, 'err_required');
  assert.equal(errors.avg_annual_salary, 'err_range');
  assert.equal(errors.ai_adoption_rate, 'err_range');
});

test('§5.4 warnings surface without blocking', () => {
  const inp = { ...DEFAULT_INPUTS, search_minutes_per_day: 200, annual_investment: 0 };
  const out = calculate(inp);
  const { warnings } = validateInputs(inp, out);
  assert.ok(warnings.includes('warn_search_high'));
  assert.ok(warnings.includes('warn_roi_undefined'));
});

test('integer inputs reject fractional values', () => {
  const inp = { ...DEFAULT_INPUTS, employee_count: 10.5 };
  const { errors } = validateInputs(inp, calculate(inp));
  assert.equal(errors.employee_count, 'err_integer');
});
