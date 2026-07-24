import { DEFAULT_LEASE_MS, systemClock, type Clock, type Job } from './job.js';
import type { JobStore } from './job-store.js';
import type { RetryPolicy } from './retry-policy.js';
import type { WorkerExecutor } from './worker-executor.js';
import type { WorkerEvents } from './worker-events.js';
import type { JobAudit, JobMetrics } from './worker-observability.js';

export interface DispatcherOptions {
  readonly store: JobStore;
  readonly executor: WorkerExecutor;
  readonly retry: RetryPolicy;
  readonly clock?: Clock;
  readonly events?: WorkerEvents;
  readonly metrics?: JobMetrics;
  readonly audit?: JobAudit;
  readonly concurrency?: number;
  readonly leaseMs?: number;
}

/**
 * WorkerDispatcher — the run loop's core. It claims due jobs (up to a
 * concurrency limit), runs each through the executor, and applies the outcome
 * policy: success completes (or re-queues a recurring job), failure retries with
 * backoff until attempts are exhausted, then routes to the dead-letter queue.
 * Every transition is persisted first, then announced via events/metrics/audit.
 */
export class WorkerDispatcher {
  private readonly store: JobStore;
  private readonly executor: WorkerExecutor;
  private readonly retry: RetryPolicy;
  private readonly clock: Clock;
  private readonly events: WorkerEvents | undefined;
  private readonly metrics: JobMetrics | undefined;
  private readonly audit: JobAudit | undefined;
  private readonly concurrency: number;
  private readonly leaseMs: number;
  private readonly inflight = new Set<Promise<void>>();

  constructor(opts: DispatcherOptions) {
    this.store = opts.store;
    this.executor = opts.executor;
    this.retry = opts.retry;
    this.clock = opts.clock ?? systemClock;
    this.events = opts.events;
    this.metrics = opts.metrics;
    this.audit = opts.audit;
    this.concurrency = opts.concurrency ?? 4;
    this.leaseMs = opts.leaseMs ?? DEFAULT_LEASE_MS;
  }

  /** Claim and start as many due jobs as free slots allow. Returns how many started. */
  async pollOnce(): Promise<number> {
    let started = 0;
    while (this.inflight.size < this.concurrency) {
      const job = await this.store.claimDue(this.clock(), this.leaseMs);
      if (!job) break;
      started++;
      const promise = this.process(job).finally(() => this.inflight.delete(promise));
      this.inflight.add(promise);
    }
    return started;
  }

  /** Wait for all in-flight jobs to finish (used by graceful shutdown + tests). */
  async drain(): Promise<void> {
    await Promise.all([...this.inflight]);
  }

  get activeCount(): number {
    return this.inflight.size;
  }

  private async process(job: Job): Promise<void> {
    const startedAt = this.clock();
    await this.events?.started(job);
    this.metrics?.started();
    this.audit?.record('started', { jobId: job.id, type: job.type, tenantId: job.tenantId, attempts: job.attempts });

    try {
      await this.executor.execute(job);
      const now = this.clock();
      if (job.recurEveryMs !== null) {
        const runAt = now + job.recurEveryMs;
        await this.store.reschedule(job.id, runAt, now);
        await this.events?.rescheduled(job, runAt);
      } else {
        await this.store.markSucceeded(job.id, now);
      }
      const duration = now - startedAt;
      await this.events?.succeeded(job, duration);
      this.metrics?.succeeded(duration);
      this.audit?.record('succeeded', { jobId: job.id, type: job.type, tenantId: job.tenantId, attempts: job.attempts });
    } catch (e) {
      await this.onFailure(job, e instanceof Error ? e.message : String(e));
    }
  }

  private async onFailure(job: Job, error: string): Promise<void> {
    const now = this.clock();
    if (job.attempts < job.maxAttempts) {
      const delay = this.retry.nextDelayMs(job.attempts);
      await this.store.markForRetry(job.id, now + delay, error, now);
      await this.events?.retried(job, delay, error);
      this.metrics?.retried();
      this.audit?.record('retried', { jobId: job.id, type: job.type, tenantId: job.tenantId, attempts: job.attempts, reason: error });
    } else {
      await this.store.markDead(job.id, error, now);
      await this.events?.dead(job, error);
      this.metrics?.dead();
      this.audit?.record('dead', { jobId: job.id, type: job.type, tenantId: job.tenantId, attempts: job.attempts, reason: error });
    }
  }
}
