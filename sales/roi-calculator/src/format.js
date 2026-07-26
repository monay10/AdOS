// Number/currency formatting — SPEC §7. Deterministic, offline, no Intl locale
// data required (we implement grouping ourselves so output is identical on every
// machine regardless of installed locales).

const SYMBOLS = { TRY: '₺', USD: '$', EUR: '€' };

/** Round-half-up at the given decimals (SPEC §7.3), applied at display only. */
export function roundHalfUp(value, decimals = 0) {
  if (value == null || Number.isNaN(value)) return value;
  const f = Math.pow(10, decimals);
  // Nudge to avoid binary float half-representation errors, then floor(+0.5).
  return Math.floor(Math.abs(value) * f + 0.5) / f * Math.sign(value || 1);
}

/**
 * Group a non-negative integer string with a separator every 3 digits.
 */
function groupInt(intStr, sep) {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/**
 * Format a plain number with grouping per UI language.
 * @param {number} value
 * @param {'tr'|'en'} lang
 * @param {number} decimals
 */
export function formatNumber(value, lang = 'en', decimals = 0) {
  if (value == null || Number.isNaN(value)) return '—';
  const thousands = lang === 'tr' ? '.' : ',';
  const decimal = lang === 'tr' ? ',' : '.';
  const rounded = roundHalfUp(value, decimals);
  const neg = rounded < 0;
  const abs = Math.abs(rounded);
  const [intPart, fracPart = ''] = abs.toFixed(decimals).split('.');
  let out = groupInt(intPart, thousands);
  if (decimals > 0) out += decimal + fracPart;
  return (neg ? '-' : '') + out;
}

/**
 * Format a currency amount. Symbol/code follow `currency`; grouping follows
 * `lang` (SPEC §7.3). Null -> "—".
 */
export function formatCurrency(value, currency = 'TRY', lang = 'en', decimals = 0) {
  if (value == null || Number.isNaN(value)) return '—';
  const sym = SYMBOLS[currency] || '';
  return sym + formatNumber(value, lang, decimals);
}

/** Percent with 1 decimal (SPEC §7.3). Null -> "—". */
export function formatPercent(value, lang = 'en') {
  if (value == null || Number.isNaN(value)) return '—';
  return formatNumber(value, lang, 1) + '%';
}

/** Payback months with 1 decimal + unit (SPEC §7.3). Null -> "—". */
export function formatMonths(value, lang = 'en') {
  if (value == null || Number.isNaN(value)) return '—';
  const unit = lang === 'tr' ? ' ay' : ' months';
  return formatNumber(value, lang, 1) + unit;
}

export { SYMBOLS };
