// UI controller — wires inputs → engine → results/charts/exports. Browser only.
// No framework, no bundler, no network. ES module loaded directly by index.html.

import {
  calculate, cumulativeSeries, validateInputs,
  DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS, CURRENCIES,
} from './calc.js';
import { STR, INPUT_ORDER, ASSUMPTION_ORDER, BREAKDOWN_ORDER } from './i18n.js';
import { formatCurrency, formatPercent, formatMonths, formatNumber, SYMBOLS } from './format.js';
import { savingsBarChart, cumulativeLineChart, efficiencyGauge } from './charts.js';
import { buildReportPDF } from './pdf.js';
import { buildWorkbookXML } from './xls.js';

const state = {
  lang: (navigator.language || 'en').toLowerCase().startsWith('tr') ? 'tr' : 'en',
  theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
  inputs: { ...DEFAULT_INPUTS },
  assumptions: { ...DEFAULT_ASSUMPTIONS },
};

const $ = (sel) => document.querySelector(sel);
const t = (k) => STR[state.lang][k] ?? k;

function numberField(key, value, order) {
  return `<label class="field">
    <span>${t(key)}</span>
    <input type="number" step="any" data-group="${order}" data-key="${key}" value="${value}" />
    <em class="err" data-err="${key}"></em>
  </label>`;
}

function renderInputs() {
  const inputs = INPUT_ORDER.map((k) => numberField(k, state.inputs[k], 'inputs')).join('');
  const currency = `<label class="field">
    <span>${t('currency')}</span>
    <select data-key="currency">
      ${CURRENCIES.map((c) => `<option value="${c}" ${state.inputs.currency === c ? 'selected' : ''}>${c} ${SYMBOLS[c]}</option>`).join('')}
    </select>
  </label>`;
  $('#inputs').innerHTML = inputs + currency;

  $('#assumptions').innerHTML = ASSUMPTION_ORDER
    .map((k) => numberField(k, state.assumptions[k], 'assumptions')).join('');
}

function collect() {
  document.querySelectorAll('[data-key]').forEach((el) => {
    const key = el.dataset.key;
    if (key === 'currency') { state.inputs.currency = el.value; return; }
    const val = el.value === '' ? '' : Number(el.value);
    if (el.dataset.group === 'assumptions') state.assumptions[key] = val;
    else state.inputs[key] = val;
  });
}

function currentReport() {
  const out = calculate(state.inputs, state.assumptions);
  const cur = state.inputs.currency;
  const lang = state.lang;
  const tiles = [
    { label: t('annual_savings'), value: formatCurrency(out.annual_savings, cur, lang), raw: out.annual_savings },
    { label: t('roi_percent'), value: formatPercent(out.roi_percent, lang), raw: out.roi_percent },
    { label: t('payback_months'), value: formatMonths(out.payback_months, lang), raw: out.payback_months },
    { label: t('efficiency_gain'), value: formatPercent(out.efficiency_gain_percent, lang), raw: out.efficiency_gain_percent },
  ];
  const breakdown = BREAKDOWN_ORDER.map((k) => {
    const value = out.savings_breakdown[k];
    const pct = out.annual_savings > 0 ? (value / out.annual_savings) * 100 : 0;
    return { key: k, label: t(k), value, pct };
  });
  return { out, cur, lang, tiles, breakdown };
}

function render() {
  collect();
  const { out, cur, lang, tiles, breakdown } = currentReport();
  const { errors, warnings } = validateInputs(state.inputs, out);

  // errors
  document.querySelectorAll('[data-err]').forEach((el) => {
    const key = el.dataset.err;
    el.textContent = errors[key] ? t(errors[key]) : '';
  });

  const hasBlockingError = ['employee_count', 'avg_annual_salary'].some((k) => errors[k]);

  // tiles
  $('#tiles').innerHTML = tiles.map((tl) => `
    <div class="tile">
      <div class="tile-label">${tl.label}</div>
      <div class="tile-value">${hasBlockingError ? '—' : tl.value}</div>
      <div class="tile-sub">${t('tile_subtext')}</div>
    </div>`).join('');

  // warnings
  $('#warnings').innerHTML = warnings.length
    ? warnings.map((w) => `<div class="warn">${t(w)}</div>`).join('')
    : '';

  // charts
  if (hasBlockingError || out.annual_savings <= 0) {
    $('#chart-bar').innerHTML = `<p class="empty">${t('empty_state')}</p>`;
    $('#chart-line').innerHTML = '';
    $('#chart-gauge').innerHTML = '';
  } else {
    $('#chart-bar').innerHTML = savingsBarChart(
      breakdown.map((b) => ({ label: b.label, value: b.value })),
      { currency: cur, lang, total: out.annual_savings },
    );
    const series = cumulativeSeries(state.inputs, state.assumptions);
    $('#chart-line').innerHTML = cumulativeLineChart(series, { currency: cur, lang, paybackLabel: t('payback_point') })
      + (series.payback_month == null ? `<p class="note">${t('no_payback_36')}</p>` : '');
    $('#chart-gauge').innerHTML = efficiencyGauge(out.efficiency_gain_percent, { lang });
  }

  $('#honest-frame').textContent = t('honest_frame');
}

function buildExportReport() {
  const { out, cur, lang, tiles, breakdown } = currentReport();
  return {
    title: `${t('app_title')}`,
    subtitle: t('app_subtitle'),
    tilesHeading: t('section_results'),
    tiles: tiles.map((tl) => ({ label: tl.label, value: tl.raw == null ? '—' : tl.value })),
    tilesRaw: tiles.map((tl) => ({ label: tl.label, value: tl.raw })),
    breakdownHeading: t('savings_breakdown'),
    breakdown: breakdown.map((b) => ({
      label: b.label, value: b.value,
      valueStr: formatCurrency(b.value, cur, lang),
      pctStr: formatPercent(b.pct, lang),
    })),
    breakdownRaw: breakdown.map((b) => ({ label: b.label, value: Math.round(b.value), pct: Number(b.pct.toFixed(1)) })),
    inputsHeading: t('section_inputs'),
    inputs: INPUT_ORDER.map((k) => ({ label: t(k), value: formatNumber(state.inputs[k], lang, 0) }))
      .concat([{ label: t('currency'), value: cur }]),
    inputsRaw: INPUT_ORDER.map((k) => ({ label: t(k), value: state.inputs[k] }))
      .concat([{ label: t('currency'), value: cur }]),
    assumptionsHeading: t('section_assumptions'),
    assumptionsRaw: ASSUMPTION_ORDER.map((k) => ({ label: t(k), value: state.assumptions[k] })),
    honestFrame: t('honest_frame'),
    currencySymbol: SYMBOLS[cur],
  };
}

function download(filename, data, mime) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportPDF() {
  const bytes = buildReportPDF(buildExportReport());
  download('AdOS-ROI-Report.pdf', bytes, 'application/pdf');
}

function exportExcel() {
  const xml = buildWorkbookXML(buildExportReport());
  download('AdOS-ROI-Report.xls', xml, 'application/vnd.ms-excel');
}

function applyChrome() {
  document.documentElement.setAttribute('data-theme', state.theme);
  document.documentElement.setAttribute('lang', state.lang);
  $('#app-title').textContent = t('app_title');
  $('#app-subtitle').textContent = t('app_subtitle');
  $('#lang-toggle').textContent = t('lang_toggle');
  $('#reset-btn').textContent = t('reset');
  $('#pdf-btn').textContent = t('export_pdf');
  $('#excel-btn').textContent = t('export_excel');
  $('#print-btn').textContent = t('print');
  $('#h-inputs').textContent = t('section_inputs');
  $('#h-assumptions').textContent = t('section_assumptions');
  $('#h-results').textContent = t('section_results');
  $('#h-charts').textContent = t('section_charts');
  $('#h-breakdown').textContent = t('savings_breakdown');
  $('#h-cumulative').textContent = t('cumulative');
  $('#h-gauge').textContent = t('efficiency_gauge');
}

function mount() {
  applyChrome();
  renderInputs();
  render();

  document.body.addEventListener('input', (e) => {
    if (e.target.matches('[data-key]')) render();
  });
  document.body.addEventListener('change', (e) => {
    if (e.target.matches('[data-key="currency"]')) { render(); flashCurrencyNote(); }
  });
  $('#lang-toggle').addEventListener('click', () => {
    state.lang = state.lang === 'tr' ? 'en' : 'tr';
    applyChrome(); renderInputs(); render();
  });
  $('#theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
  });
  $('#reset-btn').addEventListener('click', () => {
    state.inputs = { ...DEFAULT_INPUTS };
    state.assumptions = { ...DEFAULT_ASSUMPTIONS };
    renderInputs(); render();
  });
  $('#pdf-btn').addEventListener('click', exportPDF);
  $('#excel-btn').addEventListener('click', exportExcel);
  $('#print-btn').addEventListener('click', () => window.print());
}

function flashCurrencyNote() {
  const el = $('#currency-note');
  el.textContent = t('currency_note');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
}
