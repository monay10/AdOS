import { systemClock, type Clock, type Job } from './job.js';
import type { JobStore } from './job-store.js';

/**
 * DeadLetterQueue — a view over jobs that exhausted their retries. Nothing is
 * lost: dead jobs stay in the store for inspection and can be re-queued once the
 * underlying cause is fixed.
 */
export class DeadLetterQueue {
  constructor(
    private readonly store: JobStore,
    private readonly clock: Clock = systemClock,
  ) {}

  list(tenantId?: string): Promise<Job[]> {
    return this.store.listByStatus('dead', tenantId);
  }

  async size(): Promise<number> {
    return (await this.store.countByStatus()).dead;
  }

  /** Return a dead job to the queue with a clean attempt count. */
  requeue(id: string): Promise<boolean> {
    return this.store.requeueDead(id, this.clock());
  }
}
