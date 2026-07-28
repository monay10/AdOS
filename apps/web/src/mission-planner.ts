import type { MarketingInsight } from '@ados/contracts';

/**
 * Mission Planner (Sprint 9).
 *
 * Before a mission runs, the planner turns the objective + the Company Brain's
 * accumulated performance for the vertical into an explicit, ordered plan — so
 * the operator sees the strategy and the expected numbers up front, not just a
 * fixed pipeline. It is deterministic and 100% local: every recommendation is
 * derived from real inputs (the objective, the budget, and the brain insight),
 * and it is honest about grounding — when the brain has no history for the
 * vertical yet, the plan says so and offers no fabricated expectations.
 *
 * This is a planning aid, not an autonomous actor: it recommends, the human
 * pipeline still executes stage by stage behind the existing approval gates.
 */

export interface PlanStep {
  stage: string;
  action: string;
  rationale: string;
  /** True when this step's recommendation is grounded in real brain history. */
  grounded: boolean;
}

export interface MissionPlan {
  steps: PlanStep[];
  /** Whether the Company Brain had history for this vertical to ground the plan. */
  grounded: boolean;
  /** Expected performance carried from the brain's accumulated averages, if grounded. */
  expected?: { roas: number; ctr: number; basisSampleSize: number };
}

export interface PlanInput {
  objective: string;
  vertical: string;
  budgetAmount: number;
  currency: string;
  /** The Company Brain's marketing insight for the vertical, if any. */
  insight?: MarketingInsight | null;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

export function planMission(input: PlanInput): MissionPlan {
  const grounded = !!input.insight && input.insight.sampleSize > 0;
  const g = grounded ? input.insight! : undefined;
  const budget = `${input.budgetAmount.toLocaleString('en-US')} ${input.currency}`;

  const steps: PlanStep[] = [
    {
      stage: 'strategy',
      action: 'Draft the marketing brief and set the strategy',
      rationale: g
        ? `Ground the brief in ${g.sampleSize} past ${input.vertical} campaign(s): lead with the proven hook “${g.bestHook}”.`
        : `First ${input.vertical} campaign — no history yet; the brief establishes the baseline this vertical will learn from.`,
      grounded,
    },
    {
      stage: 'creative',
      action: 'Produce the ad creative set',
      rationale: g
        ? `Reuse the winning angle “${g.bestHeadline}” and the offer “${g.bestOffer}” that performed best in this vertical.`
        : 'Generate a spread of angles to discover what resonates, since none is proven yet.',
      grounded,
    },
    {
      stage: 'campaign',
      action: `Draft the campaign and allocate the ${budget} budget`,
      rationale: g
        ? `Weight spend toward the “${g.bestFunnel}” funnel (the best performer at ${round1(g.roas)}× ROAS across ${g.sampleSize} campaign(s)).`
        : `Split the ${budget} across channels evenly to gather first-campaign signal before concentrating spend.`,
      grounded,
    },
    {
      stage: 'measure',
      action: 'Run the analytics report on the results',
      rationale: g
        ? `Compare against the vertical baseline (${round1(g.ctr)}% CTR, ${round1(g.roas)}× ROAS) to judge over/under-performance.`
        : 'Establish the first data points; every later plan in this vertical will be measured against them.',
      grounded,
    },
    {
      stage: 'learn',
      action: 'Record the outcome into the Company Brain',
      rationale: grounded
        ? 'Merge the result into the vertical’s running averages so the next plan is even better grounded.'
        : 'Seed the Company Brain for this vertical — this is the campaign that starts the compounding.',
      grounded,
    },
  ];

  return {
    steps,
    grounded,
    ...(g ? { expected: { roas: round1(g.roas), ctr: round1(g.ctr), basisSampleSize: g.sampleSize } } : {}),
  };
}
