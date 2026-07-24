import { newJob, systemClock, type Clock, type EnqueueInput, type Job } from './job.js';
import type { JobStore } from './job-store.js';
import type { WorkerEvents } from './worker-events.js';
import type { JobMetrics } from './worker-observability.js';

/**
 * WorkerScheduler — the enqueue façade for every timing shape a job can have:
 * immediate, delayed, scheduled for an absolute time, and recurring. It is also
 * where idempotency lives: enqueueing with a key that already has a live job
 * returns that job instead of creating a duplicate.
 */
export class WorkerScheduler {
  constructor(
    private readonly store: JobStore,
    private readonly clock: Clock = systemClock,
    private readonly events?: WorkerEvents,
    private readonly metrics?: JobMetrics,
  ) {}

  /** Enqueue a job (immediate unless `delayMs`/`runAt` say otherwise). */
  async enqueue(input: EnqueueInput): Promise<Job> {
    if (input.idempotencyKey) {
      const existing = await this.store.findActiveByIdempotencyKey(input.idempotencyKey);
      if (existing) return existing; // idempotent: do not create a duplicate
    }
    const job = newJob(input, this.clock());
    await this.store.enqueue(job);
    await this.events?.enqueued(job);
    this.metrics?.enqueued(job);
    return job;
  }

  /** Run once at an absolute epoch-ms time. */
  scheduleAt(input: EnqueueInput, runAt: number): Promise<Job> {
    return this.enqueue({ ...input, runAt });
  }

  /** Run once after a delay. */
  delay(input: EnqueueInput, delayMs: number): Promise<Job> {
    return this.enqueue({ ...input, delayMs });
  }

  /**
   * Ensure a single recurring job of `type` exists, firing every `everyMs`.
   * Keyed by `recurring:<type>` so re-registration on restart is idempotent —
   * the recurrence itself continues via the dispatcher re-queuing on success.
   */
  recurring(type: string, everyMs: number, input: Omit<EnqueueInput, 'type' | 'recurEveryMs'> = {}): Promise<Job> {
    return this.enqueue({ ...input, type, recurEveryMs: everyMs, idempotencyKey: input.idempotencyKey ?? `recurring:${type}` });
  }
}
