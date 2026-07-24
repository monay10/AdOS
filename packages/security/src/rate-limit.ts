/**
 * Rate limiting + brute-force protection. Both are in-memory and deterministic
 * (clock injectable for tests). For a single-process deployment this is exact;
 * behind multiple replicas it is per-instance defence-in-depth (a shared store
 * can back the same interface later without changing callers).
 */

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterMs: number;
}

/** Fixed-window rate limiter: at most `max` hits per `windowMs` per key. */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
    private readonly now: () => number = () => Date.now(),
  ) {}

  check(key: string): RateLimitResult {
    const t = this.now();
    const cutoff = t - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((ts) => ts > cutoff);
    if (recent.length >= this.max) {
      const retryAfterMs = Math.max(0, recent[0]! + this.windowMs - t);
      this.hits.set(key, recent);
      return { allowed: false, remaining: 0, retryAfterMs };
    }
    recent.push(t);
    this.hits.set(key, recent);
    return { allowed: true, remaining: this.max - recent.length, retryAfterMs: 0 };
  }

  reset(key: string): void {
    this.hits.delete(key);
  }
}

export interface BruteForceStatus {
  readonly locked: boolean;
  readonly retryAfterMs: number;
  readonly failures: number;
}

/**
 * Brute-force guard: after `maxFailures` failures within `windowMs`, a key is
 * locked out for `lockMs`. A success resets it. Use it to protect credential
 * endpoints (login, password reset) from online guessing.
 */
export class BruteForceGuard {
  private readonly state = new Map<string, { failures: number[]; lockedUntil: number }>();

  constructor(
    private readonly maxFailures = 5,
    private readonly windowMs = 15 * 60_000,
    private readonly lockMs = 15 * 60_000,
    private readonly now: () => number = () => Date.now(),
  ) {}

  status(key: string): BruteForceStatus {
    const t = this.now();
    const entry = this.state.get(key);
    if (entry && entry.lockedUntil > t) return { locked: true, retryAfterMs: entry.lockedUntil - t, failures: entry.failures.length };
    const failures = (entry?.failures ?? []).filter((ts) => ts > t - this.windowMs);
    return { locked: false, retryAfterMs: 0, failures: failures.length };
  }

  /** Record a failure; locks the key when the threshold is crossed. */
  fail(key: string): BruteForceStatus {
    const t = this.now();
    const entry = this.state.get(key) ?? { failures: [], lockedUntil: 0 };
    const failures = entry.failures.filter((ts) => ts > t - this.windowMs);
    failures.push(t);
    const lockedUntil = failures.length >= this.maxFailures ? t + this.lockMs : entry.lockedUntil;
    this.state.set(key, { failures, lockedUntil });
    return this.status(key);
  }

  reset(key: string): void {
    this.state.delete(key);
  }
}
