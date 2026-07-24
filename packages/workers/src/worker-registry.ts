import type { Job } from './job.js';

/** The context a worker handler receives — tenant-scoped, correlated, cancellable. */
export interface JobContext {
  readonly job: Job;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly payload: Record<string, unknown>;
  /** Aborted when the job is cancelled or times out; handlers should honour it. */
  readonly signal: AbortSignal;
}

/** A registered handler for one job type. */
export interface WorkerDefinition {
  readonly type: string;
  handle(ctx: JobContext): Promise<void>;
  /** Overrides applied when this type is enqueued without explicit values. */
  readonly maxAttempts?: number;
  readonly timeoutMs?: number;
}

/** Maps job type → handler. The dispatcher looks a job's worker up here. */
export class WorkerRegistry {
  private readonly defs = new Map<string, WorkerDefinition>();

  register(def: WorkerDefinition): this {
    this.defs.set(def.type, def);
    return this;
  }

  get(type: string): WorkerDefinition | undefined {
    return this.defs.get(type);
  }

  has(type: string): boolean {
    return this.defs.has(type);
  }

  types(): string[] {
    return [...this.defs.keys()];
  }
}
