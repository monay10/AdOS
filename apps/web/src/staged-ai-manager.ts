import type { AIManagerPort, AIStreamChunk, AITaskRequest, AITaskResult } from '@ados/contracts';
import { TraceBuilder, createJob, systemClock, type Clock } from '@ados/ai-manager';
import { TenantContext } from '@ados/tenancy';
import type { InMemoryExecutionTraceStore } from './execution-trace-store.js';
import { StageEngine, defaultStageEngine } from './stage-engine.js';
import { NOOP_RECORDER, type MetricsRecorderPort } from './metrics-recorder.js';

/**
 * StagedAIManager — runs a real, observable Stage Engine around every AI task
 * and seals the run into an ExecutionTrace, WITHOUT changing generation.
 *
 * Sprint 4.1 recorded the trace; Sprint 4.2 makes the orchestration visible and
 * real. `submit()` runs the pre-generation stages (plan → safety.input → route),
 * delegates generation verbatim to the wrapped manager (LiveAIManager or the
 * offline stub — same prompt, same model, same output), then runs the
 * post-generation stage (safety.output). Every stage records its own trace step.
 *
 * The stages are observe-only: they inspect and record, they never block or
 * replace generation. Enforcement, and swapping generation for the governed
 * `execute()` engine, are Sprint 4.3. This is the same TraceBuilder the governed
 * pipeline uses, so the shape stays forward-compatible.
 */
export class StagedAIManager implements AIManagerPort {
  constructor(
    private readonly inner: AIManagerPort,
    private readonly store: InMemoryExecutionTraceStore,
    private readonly engine: StageEngine = defaultStageEngine(),
    private readonly clock: Clock = systemClock,
    // Records the two latencies a staged task incurs — the governance stage
    // pipeline (pre+post) and the planner/generation itself. No-op by default; the
    // App wires a real recorder. Wall-clock (Date.now) is the honest measure here.
    private readonly metrics: MetricsRecorderPort = NOOP_RECORDER,
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

    // Pre-generation stages (observe-only — never abort the request).
    const preStart = Date.now();
    await this.engine.runPre(request, trace);
    const preMs = Date.now() - preStart;

    let result: AITaskResult<T>;
    const genStart = Date.now();
    try {
      result = await this.inner.submit<T>(request);
    } catch (e) {
      trace.step('failed', { error: e instanceof Error ? e.message : String(e) });
      this.store.record(tenantId, trace.seal());
      throw e;
    }
    // Planner latency = the generation itself (the wrapped manager producing the plan).
    this.metrics.observe('planner_latency', Date.now() - genStart);

    trace.step('inference', { model: result.model, engine: result.engine, attempts: result.attempts });
    trace.set({ model: result.model, engine: result.engine, usage: result.usage, latencyMs: result.latencyMs, cached: result.cached });

    // Post-generation stages (observe-only).
    const postStart = Date.now();
    await this.engine.runPost(request, result, trace);
    // Governance latency = the observe/safety stage pipeline around generation.
    this.metrics.observe('governance_latency', preMs + (Date.now() - postStart));

    trace.step('completed');
    this.store.record(tenantId, trace.seal());
    return result;
  }

  // Streaming is not used by the web app; pass through untraced (nothing runs).
  stream(request: AITaskRequest): AsyncIterable<AIStreamChunk> {
    return this.inner.stream(request);
  }
}
