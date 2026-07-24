import { describe, expect, it } from 'vitest';
import { BruteForceGuard, RateLimiter } from './rate-limit.js';

describe('RateLimiter', () => {
  it('allows up to max per window then denies with a retry-after', () => {
    let t = 1_000;
    const rl = new RateLimiter(2, 1_000, () => t);
    expect(rl.check('k').allowed).toBe(true);
    expect(rl.check('k').allowed).toBe(true);
    const third = rl.check('k');
    expect(third.allowed).toBe(false);
    expect(third.retryAfterMs).toBeGreaterThan(0);
    t += 1_001; // window elapsed
    expect(rl.check('k').allowed).toBe(true);
  });

  it('isolates keys', () => {
    const rl = new RateLimiter(1, 1_000, () => 0);
    expect(rl.check('a').allowed).toBe(true);
    expect(rl.check('b').allowed).toBe(true);
    expect(rl.check('a').allowed).toBe(false);
  });
});

describe('BruteForceGuard', () => {
  it('locks after maxFailures and unlocks after lockMs; success resets', () => {
    let t = 0;
    const guard = new BruteForceGuard(3, 10_000, 5_000, () => t);
    expect(guard.status('u').locked).toBe(false);
    guard.fail('u');
    guard.fail('u');
    expect(guard.fail('u').locked).toBe(true); // 3rd failure locks
    expect(guard.status('u').retryAfterMs).toBeGreaterThan(0);

    t += 5_001; // lock elapsed
    expect(guard.status('u').locked).toBe(false);

    guard.fail('u');
    guard.reset('u'); // e.g. a successful login
    expect(guard.status('u').failures).toBe(0);
  });
});
