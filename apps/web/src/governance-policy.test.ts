import { describe, expect, it } from 'vitest';
import { REVIEW_ONLY, isEnforced, policyFromEnv } from './governance-policy.js';

describe('governance policy', () => {
  it('REVIEW_ONLY enforces no gate', () => {
    expect(isEnforced(REVIEW_ONLY, 'strategy_and_budget')).toBe(false);
    expect(isEnforced(REVIEW_ONLY, 'campaign_launch')).toBe(false);
  });

  it('policyFromEnv is review-only when the env var is unset', () => {
    const { policy, ignored } = policyFromEnv({});
    expect(policy.enforcedGates.size).toBe(0);
    expect(ignored).toEqual([]);
  });

  it('enforces the listed known gates and reports unknown ones', () => {
    const { policy, ignored } = policyFromEnv({ GOVERNANCE_ENFORCED_GATES: 'campaign_launch, bogus , creative_assets' });
    expect(isEnforced(policy, 'campaign_launch')).toBe(true);
    expect(isEnforced(policy, 'creative_assets')).toBe(true);
    expect(isEnforced(policy, 'strategy_and_budget')).toBe(false);
    expect(ignored).toEqual(['bogus']);
  });
});
