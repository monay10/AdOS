// Pure SVG chart builders — no external chart library, no network (CANON/offline).
// Each returns an SVG string. Colors come from CSS custom properties via
// `currentColor`/var() so charts follow the active theme.

import { formatCurrency, formatPercent } from './format.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Horizontal bar chart of the savings breakdown (SPEC §4.1).
 * @param {{label:string, value:number}[]} rows
 */
export function savingsBarChart(rows, { currency, lang, total }) {
  const W = 720;
  const rowH = 46;
  const padL = 210;
  const padR = 140;
  const padT = 16;
  const H = padT * 2 + rows.length * rowH;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const barW = W - padL - padR;
  let bars = '';
  rows.forEach((r, idx) => {
    const y = padT + idx * rowH + 8;
    const w = Math.max(0, (r.value / max) * barW);
    const pct = total > 0 ? (r.value / total) * 100 : 0;
    bars += `
      <text x="${padL - 12}" y="${y + 18}" text-anchor="end" class="c-label">${esc(r.label)}</text>
      <rect x="${padL}" y="${y}" width="${w.toFixed(1)}" height="26" rx="4" class="c-bar" fill="var(--accent)"></rect>
      <text x="${padL + w + 8}" y="${y + 18}" class="c-value">${esc(formatCurrency(r.value, currency, lang))} · ${esc(formatPercent(pct, lang))}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" class="chart" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
}

/**
 * Cumulative savings vs investment line chart over 36 months (SPEC §4.2).
 */
export function cumulativeLineChart(series, { currency, lang, paybackLabel }) {
  const W = 720;
  const H = 320;
  const padL = 96;
  const padR = 24;
  const padT = 20;
  const padB = 40;
  const n = series.months.length;
  const maxY = Math.max(1, ...series.savings, ...series.investment);
  const x = (m) => padL + ((m - 1) / (n - 1)) * (W - padL - padR);
  const y = (v) => H - padB - (v / maxY) * (H - padT - padB);
  const path = (arr) =>
    arr.map((v, idx) => `${idx === 0 ? 'M' : 'L'}${x(idx + 1).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  // gridlines / axis labels
  let grid = '';
  for (let g = 0; g <= 4; g++) {
    const val = (maxY / 4) * g;
    const gy = y(val);
    grid += `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${W - padR}" y2="${gy.toFixed(1)}" class="c-grid"></line>
      <text x="${padL - 8}" y="${(gy + 4).toFixed(1)}" text-anchor="end" class="c-axis">${esc(formatCurrency(val, currency, lang))}</text>`;
  }
  let xlabels = '';
  for (let m = 6; m <= 36; m += 6) {
    xlabels += `<text x="${x(m).toFixed(1)}" y="${H - padB + 22}" text-anchor="middle" class="c-axis">${m}</text>`;
  }

  let marker = '';
  if (series.payback_month != null) {
    const mx = x(series.payback_month);
    marker = `<line x1="${mx.toFixed(1)}" y1="${padT}" x2="${mx.toFixed(1)}" y2="${H - padB}" class="c-marker"></line>
      <text x="${mx.toFixed(1)}" y="${padT + 2}" text-anchor="middle" class="c-marker-t">${esc(paybackLabel)}: ${series.payback_month}</text>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" role="img" class="chart" xmlns="http://www.w3.org/2000/svg">
    ${grid}${xlabels}${marker}
    <path d="${path(series.investment)}" fill="none" class="c-inv" stroke="var(--muted-strong)" stroke-width="2.5"></path>
    <path d="${path(series.savings)}" fill="none" class="c-sav" stroke="var(--accent)" stroke-width="2.5"></path>
  </svg>`;
}

/**
 * Radial gauge for efficiency gain (SPEC §4.3). Scale 0–40%; needle pegged at 40
 * for display if higher, true value shown as text.
 */
export function efficiencyGauge(valuePercent, { lang }) {
  const W = 300;
  const H = 190;
  const cx = W / 2;
  const cy = 160;
  const r = 120;
  const ceiling = 40;
  const v = valuePercent == null ? 0 : Math.max(0, Math.min(ceiling, valuePercent));
  const a0 = Math.PI; // 180deg (left)
  const a1 = 0; // 0deg (right)
  const ang = a0 + (v / ceiling) * (a1 - a0);
  const arcPt = (a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  const [sx, sy] = arcPt(a0);
  const [ex, ey] = arcPt(a1);
  const [nx, ny] = arcPt(ang);
  const disp = valuePercent == null ? '—' : formatPercent(valuePercent, lang);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" class="chart gauge" xmlns="http://www.w3.org/2000/svg">
    <path d="M${sx.toFixed(1)},${sy.toFixed(1)} A${r},${r} 0 0 1 ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" class="c-grid" stroke-width="14"></path>
    <path d="M${sx.toFixed(1)},${sy.toFixed(1)} A${r},${r} 0 0 1 ${nx.toFixed(1)},${ny.toFixed(1)}" fill="none" stroke="var(--accent)" stroke-width="14"></path>
    <line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" class="c-marker" stroke-width="3"></line>
    <circle cx="${cx}" cy="${cy}" r="6" fill="var(--accent)"></circle>
    <text x="${cx}" y="${cy - 28}" text-anchor="middle" class="gauge-val">${esc(disp)}</text>
    <text x="${cx - r}" y="${cy + 22}" text-anchor="middle" class="c-axis">0%</text>
    <text x="${cx + r}" y="${cy + 22}" text-anchor="middle" class="c-axis">${ceiling}%</text>
  </svg>`;
}
