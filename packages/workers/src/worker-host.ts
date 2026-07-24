import { randomUUID } from 'node:crypto';
import { DEFAULT_LEASE_MS, systemClock, type Clock, type EnqueueInput, type Job } from './job.js';
import type { JobStore } from './job-store.js';
import { ExponentialBackoff, type RetryPolicy } from './retry-policy.js';
import { WorkerRegistry } from './worker-registry.js';
import { WorkerExecutor } from './worker-executor.js';
import { WorkerDispatcher } from './worker-dispatcher.js';
import { WorkerScheduler } from './worker-scheduler.js';
import { DeadLetterQueue } from './dead-letter-queue.js';
import { HealthMonitor, type HealthReport } from './health-monitor.js';
import { WorkerEvents } from './worker-events.js';
import { JobMetrics, loggerJobAudit, type JobAudit } from './worker-observability.js';

export interface WorkerHostOptions {
  readonly store: JobStore;
  readonly registry?: WorkerRegistry;
  readonly retry?: RetryPolicy;
  readonly clock?: Clock;
  readonly events?: WorkerEvents;
  readonly metrics?: JobMetrics;
  readonly audit?: JobAudit;
  readonly concurrency?: number;
  readonly leaseMs?: number;
  /** Poll cadence of the background loop (ms). Ignored when driving via tick(). */
  readonly pollIntervalMs?: number;
  /** How often crash-recovery sweeps for expired leases (ms). */
  readonly recoverIntervalMs?: number;
  readonly workerId?: string;
  readonly staleWorkerMs?: number;
}

/**
 * WorkerHost — the process-level background worker. Composes the registry,
 * scheduler, dispatcher, dead-letter queue and health monitor, and runs the poll
 * loop that drives them. Start it to process jobs on a timer, or drive it
 * deterministically with tick(). Stopping is graceful: the loop halts and
 * in-flight jobs drain; anything still queued is picked up on the next start.
 */
export class WorkerHost {
  readonly id: string;
  readonly registry: WorkerRegistry;
  readonly scheduler: WorkerScheduler;
  readonly deadLetters: DeadLetterQueue;
  readonly monitor: HealthMonitor;

  private readonly store: JobStore;
  private readonly dispatcher: WorkerDispatcher;
  private readonly clock: Clock;
  private readonly events: WorkerEvents | undefined;
  private readonly metrics: JobMetrics | undefined;
  private readonly audit: JobAudit;
  private readonly pollIntervalMs: number;
  private readonly recoverIntervalMs: number;
  private timer: NodeJS.Timeout | undefined;
  private stopping = false;
  private lastRecoverAt = 0;

  constructor(opts: WorkerHostOptions) {
    this.id = opts.workerId ?? `worker-${randomUUID().slice(0, 8)}`;
    this.store = opts.store;
    this.registry = opts.registry ?? new WorkerRegistry();
    this.clock = opts.clock ?? systemClock;
    this.events = opts.events;
    this.metrics = opts.metrics;
    this.audit = opts.audit ?? loggerJobAudit();
    this.pollIntervalMs = opts.pollIntervalMs ?? 250;
    this.recoverIntervalMs = opts.recoverIntervalMs ?? 10_000;

    this.scheduler = new WorkerScheduler(this.store, this.clock, this.events, this.metrics);
    this.deadLetters = new DeadLetterQueue(this.store, this.clock);
    this.monitor = new HealthMonitor(this.store, opts.staleWorkerMs ?? 30_000);
    this.dispatcher = new WorkerDispatcher({
      store: this.store,
      executor: new WorkerExecutor(this.registry),
      retry: opts.retry ?? new ExponentialBackoff(),
      clock: this.clock,
      ...(this.events ? { events: this.events } : {}),
      ...(this.metrics ? { metrics: this.metrics } : {}),
      audit: this.audit,
      ...(opts.concurrency !== undefined ? { concurrency: opts.concurrency } : {}),
      leaseMs: opts.leaseMs ?? DEFAULT_LEASE_MS,
    });
  }

  // --- enqueue façade ----------------------------------------------------
  enqueue(input: EnqueueInput): Promise<Job> {
    return this.scheduler.enqueue(input);
  }
  scheduleAt(input: EnqueueInput, runAt: number): Promise<Job> {
    return this.scheduler.scheduleAt(input, runAt);
  }
  delay(input: EnqueueInput, delayMs: number): Promise<Job> {
    return this.scheduler.delay(input, delayMs);
  }
  recurring(type: string, everyMs: number, input?: Omit<EnqueueInput, 'type' | 'recurEveryMs'>): Promise<Job> {
    return this.scheduler.recurring(type, everyMs, input);
  }

  /** Cancel a job that has not finished. */
  async cancel(id: string): Promise<boolean> {
    const ok = await this.store.cancel(id, this.clock());
    if (ok) {
      const job = await this.store.findById(id);
      if (job) {
        await this.events?.cancelled(job);
        this.metrics?.cancelled();
        this.audit.record('cancelled', { jobId: id, type: job.type, tenantId: job.tenantId });
      }
    }
    return ok;
  }

  /** Crash recovery: re-queue jobs whose running lease has expired. */
  async recover(): Promise<number> {
    const recovered = await this.store.recoverStale(this.clock());
    this.metrics?.recovered(recovered);
    if (recovered > 0) this.audit.record('recovered', { reason: `${recovered} stale job(s) re-queued` });
    return recovered;
  }

  /** One deterministic iteration: recover, heartbeat, dispatch, and drain. */
  async tick(): Promise<number> {
    await this.recover();
    this.monitor.beat(this.id, this.clock());
    const started = await this.dispatcher.pollOnce();
    await this.dispatcher.drain();
    return started;
  }

  /** Begin the background poll loop. */
  start(): void {
    if (this.timer) return;
    this.stopping = false;
    this.timer = setInterval(() => void this.loop(), this.pollIntervalMs);
    this.timer.unref?.();
  }

  private async loop(): Promise<void> {
    if (this.stopping) return;
    const now = this.clock();
    if (now - this.lastRecoverAt >= this.recoverIntervalMs) {
      await this.recover();
      this.lastRecoverAt = now;
    }
    this.monitor.beat(this.id, now);
    await this.dispatcher.pollOnce();
  }

  /** Stop the loop and let in-flight jobs drain (graceful). */
  async stop(): Promise<void> {
    this.stopping = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    await this.dispatcher.drain();
    this.monitor.forget(this.id);
  }

  get activeCount(): number {
    return this.dispatcher.activeCount;
  }

  health(): Promise<HealthReport> {
    return this.monitor.report(this.clock());
  }
}
