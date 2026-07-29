/**
 * Governance enforcement policy (Sprint 8 — the Enforced maturity tier).
 *
 * The governance chain has climbed the honest maturity ladder: Observed →
 * Advisory → Required review (operator must acknowledge a failing verdict, but
 * can override). This is the final rung: **Enforced** — a failing governance
 * verdict HARD-BLOCKS approval at a gate, with no override, enforced server-side.
 *
 * It ships OFF for every gate, deliberately. The Sprint 5 approval/override funnel
 * shows the override rate is ~100% today — every ungrounded first campaign is
 * flagged (`no_evidence`) — so blanket enforcement would block the legitimate
 * cold-start happy path and fight operators. Enforcement is therefore an explicit,
 * per-gate operator opt-in (`GOVERNANCE_ENFORCED_GATES`), to be turned on only
 * where a gate's measured data supports it. Measurement before enforcement.
 */
export type MissionGate = 'strategy_and_budget' | 'creative_assets' | 'campaign_launch';

/** Every human approval gate, in pipeline order — the calibration engine iterates these. */
export const MISSION_GATES: readonly MissionGate[] = ['strategy_and_budget', 'creative_assets', 'campaign_launch'];

export interface GovernancePolicy {
  /**
   * Gates where a failing governance verdict hard-blocks approval (no override).
   * Empty by default — every gate stays in Required-review mode.
   */
  enforcedGates: ReadonlySet<string>;
}

/** The default: no gate is enforced — the current overridable review behaviour. */
export const REVIEW_ONLY: GovernancePolicy = { enforcedGates: new Set() };

/** True when a failing verdict at this gate must hard-block (no override). */
export function isEnforced(policy: GovernancePolicy, gate: string): boolean {
  return policy.enforcedGates.has(gate);
}

const KNOWN_GATES: ReadonlySet<string> = new Set<MissionGate>([
  'strategy_and_budget',
  'creative_assets',
  'campaign_launch',
]);

/**
 * Build the policy from `GOVERNANCE_ENFORCED_GATES` — a comma-separated list of
 * gate names to hard-enforce (e.g. "campaign_launch"). Unknown names are ignored
 * (returned in `ignored` so the caller can warn). Unset → review-only.
 */
export function policyFromEnv(env: NodeJS.ProcessEnv = process.env): { policy: GovernancePolicy; ignored: string[] } {
  const raw = env['GOVERNANCE_ENFORCED_GATES'] ?? '';
  const names = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const enforcedGates = new Set<string>();
  const ignored: string[] = [];
  for (const name of names) {
    if (KNOWN_GATES.has(name)) enforcedGates.add(name);
    else ignored.push(name);
  }
  return { policy: { enforcedGates }, ignored };
}
