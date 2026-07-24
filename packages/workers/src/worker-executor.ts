import { TenantContext } from '@ados/tenancy';
import { JobTimeoutError, type Job } from './job.js';
import type { WorkerRegistry } from './worker-registry.js';

/** Reject if `p` has not settled within `ms`; fire `onTimeout` to abort the work. */
export function withTimeout<T>(p: Promise<T>, ms: number, onTimeout: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      onTimeout();
      reject(new JobTimeoutError(ms));
    }, ms);
    timer.unref?.();
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/**
 * WorkerExecutor — runs exactly one job's handler with the guarantees a
 * background job needs: the ambient TenantContext is bound (tenant isolation +
 * correlation id propagation), a timeout aborts a hung handler, and an
 * AbortSignal lets a cooperative handler stop early. It does not decide retries
 * or emit telemetry — the dispatcher owns that.
 */
export class WorkerExecutor {
  constructor(private readonly registry: WorkerRegistry) {}

  async execute(job: Job): Promise<void> {
    const def = this.registry.get(job.type);
    if (!def) throw new Error(`No worker registered for job type "${job.type}".`);

    const controller = new AbortController();
    await TenantContext.run(
      { tenantId: job.tenantId, correlationId: job.correlationId, actor: job.actor ?? undefined, roles: [] },
      () =>
        withTimeout(
          def.handle({ job, tenantId: job.tenantId, correlationId: job.correlationId, payload: job.payload, signal: controller.signal }),
          job.timeoutMs,
          () => controller.abort(),
        ),
    );
  }
}
