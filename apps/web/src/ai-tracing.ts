import type { AIManagerPort, AIStreamChunk, AITaskRequest, AITaskResult } from '@ados/contracts';
import { TraceBuilder, createJob, systemClock, type Clock } from '@ados/ai-manager';
import { TenantContext } from '@ados/tenancy';
import type { InMemoryExecutionTraceStore } from './execution-trace-store.js';

/**
 * TracingAIManager — a decorator that records an ExecutionTrace around every AI
 * task WITHOUT changing generation.
 *
 * Sprint 4.1 (Governed Pipeline Unification, slice 1). `submit()` delegates
 * verbatim to the wrapped manager (offline or live) and returns its result
 * byte-for-byte. Around that call it seals an honest ExecutionTrace holding
 * ONLY the steps that truly ran — received → inference → completed/failed — plus
 * the real capability, prompt reference, model/engine, token usage, latency,
 * tenant and mission. Governed stages (evidence, confidence, constitution,
 * decision journal) are deliberately left empty here: they are not wired yet and
 * arrive in slices 4.2/4.3. This is the same TraceBuilder the governed pipeline
 * uses, so the shape is forward-compatible when the real engine goes live.
 */
export class TracingAIManager implements AIManagerPort {
  constructor(
    private readonly inner: AIManagerPort,
    private readonly store: InMemoryExecutionTraceStore,
    private readonly clock: Clock = systemClock,
  ) {}

  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    const tenantId = TenantContext.current()?.tenantId ?? 'public';
    const v = { ...(request.variables ?? {}), ...(request.input ?? {}) };
    const job = createJob(
      { request, kind: 'task', ...(request.idempotencyKey ? { sessionId: request.idempotencyKey } : {}) },
      this.clock,
    );
    const trace = new TraceBuilder(job, this.clock);
    trace.set({
      capability: request.capability,
      ...(request.promptRef?.key ? { promptKey: request.promptRef.key } : {}),
      ...(request.promptRef?.version !== undefined ? { promptVersion: request.promptRef.version } : {}),
      ...(v['missionId'] ? { missionId: String(v['missionId']) } : {}),
    });
    trace.step('received', { submittedBy: request.submittedBy });

    try {
      const result = await this.inner.submit<T>(request);
      trace.step('inference', { model: result.model, engine: result.engine, attempts: result.attempts });
      trace.set({ model: result.model, engine: result.engine, usage: result.usage, latencyMs: result.latencyMs, cached: result.cached });
      trace.step('completed');
      this.store.record(tenantId, trace.seal());
      return result;
    } catch (e) {
      trace.step('failed', { error: e instanceof Error ? e.message : String(e) });
      this.store.record(tenantId, trace.seal());
      throw e;
    }
  }

  // Streaming is not used by the web app; pass through untraced (nothing runs).
  stream(request: AITaskRequest): AsyncIterable<AIStreamChunk> {
    return this.inner.stream(request);
  }
}
