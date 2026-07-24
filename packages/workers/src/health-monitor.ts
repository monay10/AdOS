import type { JobStatus } from './job.js';
import type { JobStore } from './job-store.js';

export interface WorkerHealth {
  readonly workerId: string;
  readonly lastBeatAt: number;
  readonly healthy: boolean;
}

export interface HealthReport {
  readonly healthy: boolean;
  readonly workers: WorkerHealth[];
  readonly queue: Record<JobStatus, number>;
  readonly checkedAt: number;
}

/**
 * HealthMonitor — tracks worker heartbeats and queue depth. A worker that has
 * not beaten within `staleMs` is unhealthy (crashed / hung); the platform can
 * alert on it and its in-flight jobs will be recovered by the store's lease
 * expiry.
 */
export class HealthMonitor {
  private readonly beats = new Map<string, number>();

  constructor(
    private readonly store: JobStore,
    private readonly staleMs = 30_000,
  ) {}

  beat(workerId: string, now: number): void {
    this.beats.set(workerId, now);
  }

  forget(workerId: string): void {
    this.beats.delete(workerId);
  }

  async report(now: number): Promise<HealthReport> {
    const workers: WorkerHealth[] = [...this.beats.entries()].map(([workerId, lastBeatAt]) => ({
      workerId,
      lastBeatAt,
      healthy: now - lastBeatAt <= this.staleMs,
    }));
    const queue = await this.store.countByStatus();
    const healthy = workers.length > 0 && workers.every((w) => w.healthy);
    return { healthy, workers, queue, checkedAt: now };
  }
}
