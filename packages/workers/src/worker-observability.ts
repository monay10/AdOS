import { telemetry, type Telemetry } from '@ados/observability';
import type { Job } from './job.js';

export type JobAuditEvent = 'enqueued' | 'started' | 'succeeded' | 'retried' | 'dead' | 'cancelled' | 'recovered';

export interface JobAuditDetail {
  readonly jobId?: string;
  readonly type?: string;
  readonly tenantId?: string;
  readonly attempts?: number;
  readonly reason?: string;
}

/** Sink for tamper-evident job audit records. */
export interface JobAudit {
  record(event: JobAuditEvent, detail: JobAuditDetail): void;
}

/** Default audit sink — one structured log line per lifecycle event. */
export function loggerJobAudit(tele: Telemetry = telemetry('workers')): JobAudit {
  return {
    record(event, detail) {
      tele.logger.info({ jobEvent: event, ...detail }, 'job audit');
    },
  };
}

/** Named counters + histograms for the queue (Prometheus-safe names). */
export class JobMetrics {
  constructor(private readonly tele: Telemetry = telemetry('workers')) {}

  enqueued(job: Job): void {
    this.tele.count(`enqueued_${sanitize(job.type)}`);
    this.tele.count('enqueued');
  }
  started(): void {
    this.tele.count('started');
  }
  succeeded(durationMs: number): void {
    this.tele.count('succeeded');
    this.tele.observe('duration_ms', durationMs);
  }
  retried(): void {
    this.tele.count('retried');
  }
  dead(): void {
    this.tele.count('dead');
  }
  cancelled(): void {
    this.tele.count('cancelled');
  }
  recovered(n: number): void {
    if (n > 0) this.tele.count('recovered', n);
  }
}

function sanitize(type: string): string {
  return type.replace(/[^a-z0-9]+/gi, '_');
}

/** Thin wrapper over the shared tracer so every job runs inside a span. */
export class JobTracing {
  constructor(private readonly tele: Telemetry = telemetry('workers')) {}

  span<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return this.tele.span(name, () => fn());
  }
}
