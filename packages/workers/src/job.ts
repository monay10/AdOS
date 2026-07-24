import { randomUUID } from 'node:crypto';

/**
 * A persistent background job. Everything about a unit of deferred work lives in
 * this record so it survives a process crash — nothing important is ever held
 * only in memory. Jobs are tenant-scoped and carry a correlation id so their
 * execution is traceable back to the request that queued them.
 */
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'dead' | 'cancelled';

export interface Job {
  readonly id: string;
  readonly type: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly actor: string | null;
  readonly payload: Record<string, unknown>;
  readonly status: JobStatus;
  /** Times this job has been claimed for execution. */
  readonly attempts: number;
  readonly maxAttempts: number;
  /** Epoch ms at/after which the job is eligible to run (delay + scheduling). */
  readonly runAt: number;
  readonly timeoutMs: number;
  /** De-duplication key: a second enqueue with a live key returns the first job. */
  readonly idempotencyKey: string | null;
  /** When set, the job re-queues this many ms after each success (recurring). */
  readonly recurEveryMs: number | null;
  /** Heartbeat lease: while running, the deadline by which it must finish or be
   * considered crashed and recovered. Null when not running. */
  readonly leaseUntil: number | null;
  readonly lastError: string | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/** What a caller supplies to enqueue work. Everything else is defaulted. */
export interface EnqueueInput {
  readonly type: string;
  readonly payload?: Record<string, unknown>;
  readonly tenantId?: string;
  readonly correlationId?: string;
  readonly actor?: string | null;
  readonly maxAttempts?: number;
  readonly timeoutMs?: number;
  /** Delay before first eligibility (ms). Mutually informs `runAt`. */
  readonly delayMs?: number;
  /** Absolute first-run time (epoch ms). Overrides `delayMs` when both given. */
  readonly runAt?: number;
  readonly idempotencyKey?: string;
  readonly recurEveryMs?: number;
}

export const DEFAULT_MAX_ATTEMPTS = 5;
export const DEFAULT_TIMEOUT_MS = 30_000;
/** How long a claimed job may run before the heartbeat lease is presumed dead. */
export const DEFAULT_LEASE_MS = 60_000;

/** A monotonic-enough clock, injectable so tests are deterministic. */
export type Clock = () => number;
export const systemClock: Clock = () => Date.now();

/** Build a fresh queued job from caller input, applying all defaults. */
export function newJob(input: EnqueueInput, now: number): Job {
  return {
    id: randomUUID(),
    type: input.type,
    tenantId: input.tenantId ?? 'public',
    correlationId: input.correlationId ?? randomUUID(),
    actor: input.actor ?? null,
    payload: input.payload ?? {},
    status: 'queued',
    attempts: 0,
    maxAttempts: input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    runAt: input.runAt ?? now + (input.delayMs ?? 0),
    timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    idempotencyKey: input.idempotencyKey ?? null,
    recurEveryMs: input.recurEveryMs ?? null,
    leaseUntil: null,
    lastError: null,
    createdAt: now,
    updatedAt: now,
  };
}

export class JobTimeoutError extends Error {
  constructor(ms: number) {
    super(`Job exceeded its ${ms}ms timeout.`);
    this.name = 'JobTimeoutError';
  }
}

export class JobCancelledError extends Error {
  constructor() {
    super('Job was cancelled.');
    this.name = 'JobCancelledError';
  }
}
