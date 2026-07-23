/**
 * Cross-domain shared value types. These are the lingua franca every bounded
 * context speaks in its published events — kept intentionally small and stable.
 */

export interface Money {
  /** Minor units (e.g. kuruş, cents) to avoid floating-point drift. */
  amountMinor: number;
  currency: string; // ISO-4217, e.g. "TRY", "USD"
}

export interface DateRange {
  from: string; // ISO-8601
  to: string; // ISO-8601
}

/** Advertising channels the platform can operate. */
export type Channel =
  | 'google_ads'
  | 'meta'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'email'
  | 'whatsapp'
  | 'organic_seo';

/** Canonical KPI identifiers used across Analytics, Campaign and Executive AI. */
export type Kpi =
  | 'roi'
  | 'roas'
  | 'ctr'
  | 'cpa'
  | 'cac'
  | 'ltv'
  | 'conversions'
  | 'impressions'
  | 'clicks'
  | 'spend';

/** Standard envelope pattern helper for event names: `${context}.${event}.v${n}`. */
export function eventName(context: string, event: string, version = 1): string {
  return `${context}.${event}.v${version}`;
}
