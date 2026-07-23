import type { Money } from '@ados/contracts';

/**
 * Raw campaign performance the Analytics Engine ingests. A plain DTO — this
 * context never imports another context's aggregates. Monetary values are in
 * minor units to avoid float drift.
 */
export interface CampaignMetrics {
  tenantId: string;
  missionId: string;
  clientId: string;
  campaignDraftId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
  spend: Money;
  revenue: Money;
}

export interface ComputedKpi {
  name: string;
  value: number;
  unit: string;
}

const round = (n: number, dp = 2): number => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

/** Safe divide — returns 0 when the denominator is 0 (no division by zero). */
const safeDiv = (a: number, b: number): number => (b === 0 ? 0 : a / b);

/**
 * Compute the standard advertising KPIs from raw metrics. Pure, deterministic
 * domain math — the same inputs always produce the same KPIs.
 */
export function computeKpis(m: CampaignMetrics): ComputedKpi[] {
  const spend = m.spend.amountMinor;
  const revenue = m.revenue.amountMinor;
  return [
    { name: 'ctr', value: round(safeDiv(m.clicks, m.impressions) * 100), unit: '%' },
    { name: 'cpc', value: round(safeDiv(spend, m.clicks)), unit: `${m.spend.currency}_minor` },
    { name: 'cpa', value: round(safeDiv(spend, m.conversions)), unit: `${m.spend.currency}_minor` },
    { name: 'cpl', value: round(safeDiv(spend, m.leads)), unit: `${m.spend.currency}_minor` },
    { name: 'roas', value: round(safeDiv(revenue, spend)), unit: 'x' },
    { name: 'roi', value: round(safeDiv(revenue - spend, spend) * 100), unit: '%' },
  ];
}
