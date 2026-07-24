import { randomUUID } from 'node:crypto';
import type { DomainEventEnvelope } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import type { Job } from './job.js';

export const JobEventName = {
  Enqueued: 'job.enqueued.v1',
  Started: 'job.started.v1',
  Succeeded: 'job.succeeded.v1',
  Retried: 'job.retried.v1',
  Dead: 'job.dead.v1',
  Cancelled: 'job.cancelled.v1',
  Rescheduled: 'job.rescheduled.v1',
} as const;

export type JobEventName = (typeof JobEventName)[keyof typeof JobEventName];

function envelope(eventName: string, job: Job, extra: Record<string, unknown>): DomainEventEnvelope {
  return {
    eventName,
    aggregateId: job.id,
    payload: { jobId: job.id, type: job.type, tenantId: job.tenantId, attempts: job.attempts, ...extra },
    metadata: {
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      tenantId: job.tenantId,
      correlationId: job.correlationId, // propagated from the request that queued the job
      causationId: undefined,
      actor: job.actor ?? undefined,
    },
  };
}

/** Publishes job lifecycle events onto the existing EventBus. No-op without a bus. */
export class WorkerEvents {
  constructor(private readonly bus?: EventBus) {}

  private emit(eventName: string, job: Job, extra: Record<string, unknown> = {}): Promise<void> {
    if (!this.bus) return Promise.resolve();
    return this.bus.publish(envelope(eventName, job, extra));
  }

  enqueued(job: Job): Promise<void> {
    return this.emit(JobEventName.Enqueued, job);
  }
  started(job: Job): Promise<void> {
    return this.emit(JobEventName.Started, job);
  }
  succeeded(job: Job, durationMs: number): Promise<void> {
    return this.emit(JobEventName.Succeeded, job, { durationMs });
  }
  retried(job: Job, delayMs: number, error: string): Promise<void> {
    return this.emit(JobEventName.Retried, job, { delayMs, error });
  }
  dead(job: Job, error: string): Promise<void> {
    return this.emit(JobEventName.Dead, job, { error });
  }
  cancelled(job: Job): Promise<void> {
    return this.emit(JobEventName.Cancelled, job);
  }
  rescheduled(job: Job, runAt: number): Promise<void> {
    return this.emit(JobEventName.Rescheduled, job, { runAt });
  }
}
