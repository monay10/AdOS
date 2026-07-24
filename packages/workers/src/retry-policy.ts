/**
 * Decides how long to wait before re-attempting a failed job. Exponential
 * backoff is the production default; a fixed policy exists for tests.
 */
export interface RetryPolicy {
  /** Delay (ms) before the next attempt, given how many attempts have been made. */
  nextDelayMs(attemptsMade: number): number;
}

export interface ExponentialBackoffOptions {
  readonly baseMs?: number;
  readonly factor?: number;
  readonly maxMs?: number;
  /** Fractional jitter (0..1) added to spread retries; 0 = deterministic. */
  readonly jitter?: number;
  /** Randomness source, injectable for deterministic tests (default Math.random). */
  readonly random?: () => number;
}

/** Exponential backoff with optional jitter: base * factor^(n-1), capped at maxMs. */
export class ExponentialBackoff implements RetryPolicy {
  private readonly baseMs: number;
  private readonly factor: number;
  private readonly maxMs: number;
  private readonly jitter: number;
  private readonly random: () => number;

  constructor(opts: ExponentialBackoffOptions = {}) {
    this.baseMs = opts.baseMs ?? 1_000;
    this.factor = opts.factor ?? 2;
    this.maxMs = opts.maxMs ?? 60_000;
    this.jitter = opts.jitter ?? 0;
    this.random = opts.random ?? Math.random;
  }

  nextDelayMs(attemptsMade: number): number {
    const exp = this.baseMs * this.factor ** Math.max(0, attemptsMade - 1);
    const capped = Math.min(this.maxMs, exp);
    if (this.jitter <= 0) return Math.round(capped);
    const spread = capped * this.jitter;
    return Math.round(capped - spread + this.random() * spread * 2);
  }
}

/** Constant delay — handy for deterministic tests. */
export class FixedBackoff implements RetryPolicy {
  constructor(private readonly delayMs: number) {}
  nextDelayMs(): number {
    return this.delayMs;
  }
}
