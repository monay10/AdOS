// Formatting + export tests (node:test, no external deps).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber, formatCurrency, formatPercent, formatMonths, roundHalfUp } from '../src/format.js';
import { buildReportPDF } from '../src/pdf.js';
import { buildWorkbookXML } from '../src/xls.js';
import { calculate, DEFAULT_INPUTS } from '../src/calc.js';

test('grouping follows UI language', () => {
  assert.equal(formatNumber(1234567.5, 'en', 2), '1,234,567.50');
  assert.equal(formatNumber(1234567.5, 'tr', 2), '1.234.567,50');
});

test('currency symbol follows currency, grouping follows language', () => {
  assert.equal(formatCurrency(1234567, 'TRY', 'tr', 0), '₺1.234.567');
  assert.equal(formatCurrency(1234567, 'USD', 'en', 0), '$1,234,567');
  assert.equal(formatCurrency(1234567.5, 'EUR', 'tr', 2), '€1.234.567,50');
});

test('null / NaN render as em dash', () => {
  assert.equal(formatCurrency(null, 'TRY', 'en'), '—');
  assert.equal(formatPercent(null, 'en'), '—');
  assert.equal(formatMonths(null, 'tr'), '—');
});

test('percent and months formatting', () => {
  assert.equal(formatPercent(279.23, 'en'), '279.2%');
  assert.equal(formatMonths(3.16, 'en'), '3.2 months');
  assert.equal(formatMonths(3.16, 'tr'), '3,2 ay');
});

test('round-half-up at display precision', () => {
  assert.equal(roundHalfUp(2.5, 0), 3);
  assert.equal(roundHalfUp(1.25, 1), 1.3); // 1.25 is exactly representable
  assert.equal(roundHalfUp(-2.5, 0), -3);
});

test('PDF export produces a valid PDF byte stream', () => {
  const out = calculate(DEFAULT_INPUTS);
  const bytes = buildReportPDF({
    title: 'AdOS ROI',
    subtitle: 'test',
    tilesHeading: 'Results',
    tiles: [{ label: 'Annual Savings', value: '₺11.376.818' }],
    breakdownHeading: 'Breakdown',
    breakdown: [{ label: 'Company Brain – Search', value: out.savings_breakdown.company_brain_search, valueStr: '₺5.625.000', pctStr: '49.4%' }],
    inputsHeading: 'Inputs',
    inputs: [{ label: 'Employee count', value: '500' }],
    honestFrame: 'This is a planning model, not a guaranteed result. Türkçe: şğıİ.',
  });
  const head = String.fromCharCode(...bytes.slice(0, 5));
  assert.equal(head, '%PDF-');
  const tail = String.fromCharCode(...bytes.slice(-5));
  assert.equal(tail, '%%EOF');
  assert.ok(bytes.length > 400);
});

test('Excel (SpreadsheetML) export is well-formed and numeric', () => {
  const xml = buildWorkbookXML({
    title: 'AdOS ROI', subtitle: 's',
    inputsHeading: 'Inputs', inputsRaw: [{ label: 'Employee count', value: 500 }],
    assumptionsHeading: 'Assumptions', assumptionsRaw: [{ label: 'Days', value: 220 }],
    tilesHeading: 'Results', tilesRaw: [{ label: 'ROI %', value: 279.2 }],
    breakdownHeading: 'Breakdown', breakdownRaw: [{ label: 'Search', value: 5625000, pct: 49.4 }],
    honestFrame: 'Not a guarantee.',
  });
  assert.ok(xml.startsWith('<?xml'));
  assert.ok(xml.includes('progid="Excel.Sheet"'));
  assert.ok(xml.includes('ss:Type="Number">500'));
  assert.ok(xml.includes('Workbook'));
});
