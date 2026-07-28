import type { MarketingInsight } from '@ados/contracts';

/**
 * Recommendation Engine (Sprint 10) — the culmination of the compounding-company
 * arc. It turns the accumulated Company Brain performance + the tenant's mission
 * history into a ranked list of concrete next actions that grow agency revenue:
 * scale what works, revise what does not, tighten briefs that churn, and open
 * verticals that have clients but no campaigns yet.
 *
 * It is deterministic and 100% local: every recommendation is derived from real
 * recorded outcomes (the brain's per-vertical ROAS/CTR from actual analytics the
 * operator entered) and honestly labelled `grounded` when it rests on history.
 * It recommends; it never acts.
 */

export interface VerticalStat {
  vertical: string;
  /** The Company Brain's accumulated marketing insight for the vertical, if any. */
  insight?: MarketingInsight | null;
  /** Missions the tenant has run in this vertical. */
  missions: number;
  completed: number;
  /** Total revisions requested across those missions. */
  revisions: number;
}

export type RecommendationKind = 'scale' | 'improve' | 'revision' | 'explore';

export interface Recommendation {
  kind: RecommendationKind;
  vertical: string;
  title: string;
  detail: string;
  /** Higher = more important; used for ranking. */
  priority: number;
  /** True when the recommendation rests on real brain history. */
  grounded: boolean;
}

const STRONG_ROAS = 2.5;
const WEAK_ROAS = 2.0;
const MIN_SAMPLES = 3;
const HIGH_REVISION_RATE = 0.5;
const round1 = (n: number): number => Math.round(n * 10) / 10;

export function recommend(stats: readonly VerticalStat[]): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const s of stats) {
    const g = s.insight && s.insight.sampleSize > 0 ? s.insight : undefined;

    // Scale a proven winner.
    if (g && g.sampleSize >= MIN_SAMPLES && g.roas >= STRONG_ROAS) {
      recs.push({
        kind: 'scale',
        vertical: s.vertical,
        title: `Scale ${s.vertical}`,
        detail: `${g.sampleSize} campaigns averaging ${round1(g.roas)}× ROAS — increase budget and replicate the “${g.bestHook}” hook.`,
        priority: 100 + g.roas * g.sampleSize,
        grounded: true,
      });
    }

    // Fix an underperformer.
    if (g && g.sampleSize >= MIN_SAMPLES && g.roas < WEAK_ROAS) {
      recs.push({
        kind: 'improve',
        vertical: s.vertical,
        title: `Revise ${s.vertical}`,
        detail: `Underperforming at ${round1(g.roas)}× ROAS across ${g.sampleSize} campaigns — test a new angle; the current best hook is “${g.bestHook}”.`,
        priority: 80 + (WEAK_ROAS - g.roas) * g.sampleSize,
        grounded: true,
      });
    }

    // Briefs that churn (only meaningful once there are missions).
    if (s.missions > 0 && s.revisions / s.missions >= HIGH_REVISION_RATE) {
      recs.push({
        kind: 'revision',
        vertical: s.vertical,
        title: `Tighten briefs in ${s.vertical}`,
        detail: `${s.revisions} revisions across ${s.missions} mission(s) — sharpen the brief up front to cut rework.`,
        priority: 60 + s.revisions,
        grounded: false,
      });
    }

    // A vertical with clients but no campaigns run yet.
    if (s.missions === 0) {
      recs.push({
        kind: 'explore',
        vertical: s.vertical,
        title: `Launch a first campaign in ${s.vertical}`,
        detail: `You have clients in ${s.vertical} but no campaigns yet — the first one starts the compounding for this vertical.`,
        priority: 20,
        grounded: false,
      });
    }
  }

  return recs.sort((a, b) => b.priority - a.priority || a.vertical.localeCompare(b.vertical));
}
