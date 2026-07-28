import { describe, expect, it } from 'vitest';
import { resilienceFromEnv } from './ai-factory.js';

describe('resilienceFromEnv', () => {
  it('returns undefined when no resilience env var is set', () => {
    expect(resilienceFromEnv({})).toBeUndefined();
  });

  it('reads each threshold from its env var', () => {
    const cfg = resilienceFromEnv({
      AI_MAX_RETRIES: '4',
      AI_TIMEOUT_MS: '90000',
      AI_BREAKER_THRESHOLD: '5',
      AI_BREAKER_COOLDOWN_MS: '15000',
    });
    expect(cfg).toEqual({ maxRetries: 4, timeoutMs: 90000, breakerThreshold: 5, breakerCooldownMs: 15000 });
  });

  it('includes only the thresholds that are set', () => {
    expect(resilienceFromEnv({ AI_MAX_RETRIES: '0' })).toEqual({ maxRetries: 0 });
  });

  it('ignores empty and non-numeric values', () => {
    expect(resilienceFromEnv({ AI_MAX_RETRIES: '', AI_TIMEOUT_MS: 'abc' })).toBeUndefined();
  });
});
