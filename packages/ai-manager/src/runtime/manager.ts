import { ForbiddenError, ValidationError } from '@ados/kernel';
import type {
  AICapability,
  AIConstitutionCheckerPort,
  AIManagerPort,
  AIMessage,
  AIStreamChunk,
  AITaskRequest,
  AITaskResult,
  CompanyBrainPort,
  ConfidenceAssessment,
  ConfidenceEnginePort,
  DecisionMemoryPort,
  EvidenceEnginePort,
  EvidenceRef,
  ExecutiveRole,
} from '@ados/contracts';
import { TenantContext } from '@ados/tenancy';
import type {
  ContextBuilderPort,
  ModelRouterPort,
  SafetyEnginePort,
  ResponseFormatterPort,
  ValidationEnginePort,
  MonitoringPort,
  LearningEnginePort,
  AiEventPublisherPort,
} from '../ports.js';
import type { InferencePipeline } from './inference-pipeline.js';
import { repairInstruction } from './validation-engine.js';
import {
  type AIExecution,
  type Clock,
  TraceBuilder,
  createJob,
  normalizeError,
  systemClock,
  transition,
} from './kernel.js';

export interface AIManagerDeps {
  // ── core inference (required) ──
  router: ModelRouterPort;
  pipeline: InferencePipeline;
  context: ContextBuilderPort;
  formatter: ResponseFormatterPort;
  validation: ValidationEnginePort;
  safety: SafetyEnginePort;
  monitoring: MonitoringPort;
  // ── governance (optional; when present the pipeline is fully governed) ──
  events?: AiEventPublisherPort;
  evidence?: EvidenceEnginePort;
  confidence?: ConfidenceEnginePort;
  constitution?: AIConstitutionCheckerPort;
  decisions?: DecisionMemoryPort;
  brain?: CompanyBrainPort;
  learning?: LearningEnginePort;
  clock?: Clock;
  options?: { maxValidationRetries?: number; temperature?: number; defaultRole?: ExecutiveRole };
}

/**
 * AI Manager — Sprint 2.17's single AI Pipeline.
 *
 * One governed path for every AI task:
 *   safety(in) → context → evidence → confidence → route → inference
 *   → format → validate(+repair) → safety(out) → constitution → decision journal
 *   → events → monitoring/learning → enrich → sealed ExecutionTrace.
 *
 * `submit()` honors the AIManagerPort contract; `execute()` additionally returns
 * the full AIExecution (job + trace + response) so every task is reproducible,
 * replayable and explainable (Constitution Rule #8).
 */
export class AIManager implements AIManagerPort {
  private readonly clock: Clock;
  private readonly maxValidationRetries: number;

  constructor(private readonly deps: AIManagerDeps) {
    this.clock = deps.clock ?? systemClock;
    this.maxValidationRetries = deps.options?.maxValidationRetries ?? 1;
  }

  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    const execution = await this.execute(request);
    return execution.response as AITaskResult<T>;
  }

  async *stream(request: AITaskRequest): AsyncIterable<AIStreamChunk> {
    const safe = await this.deps.safety.inspectInput(request);
    if (!safe.safe) throw new ForbiddenError('Unsafe input rejected', { details: { issues: safe.issues } });
    const messages = await this.deps.context.build(request);
    const decision = this.deps.router.route(request);
    yield* this.deps.pipeline.stream(decision, messages, this.inferenceParams(request));
  }

  /** The full pipeline. Returns the job, sealed trace, and response. */
  async execute(request: AITaskRequest): Promise<AIExecution> {
    const v = { ...(request.variables ?? {}), ...(request.input ?? {}) };
    const ctx = TenantContext.current();
    const tenantId = ctx?.tenantId ?? (v['tenantId'] as string | undefined) ?? 'public';
    const role = (v['role'] as ExecutiveRole | undefined) ?? this.deps.options?.defaultRole ?? 'ceo';
    const brandId = v['brandId'] as string | undefined;
    const vertical = v['vertical'] as string | undefined;
    const sessionId = request.idempotencyKey ?? (v['sessionId'] as string | undefined);

    let job = createJob({ request, kind: 'task', ...(sessionId ? { sessionId } : {}) }, this.clock);
    const trace = new TraceBuilder(job, this.clock);
    const startMono = this.clock.monotonic();
    await this.deps.events?.taskSubmitted(job.id, request);

    try {
      // 1) safety(in)
      job = transition(job, 'queued', this.clock);
      job = transition(job, 'planning', this.clock);
      trace.step('safety.input');
      const safeIn = await this.deps.safety.inspectInput(request);
      if (!safeIn.safe) throw new ForbiddenError('Unsafe input rejected', { details: { issues: safeIn.issues } });

      // 2) context
      job = transition(job, 'context', this.clock);
      trace.step('context.build');
      const messages = await this.deps.context.build(request);
      trace.set({
        contextRefs: extractLabels(messages),
        ...(request.promptRef?.key ? { promptKey: request.promptRef.key } : {}),
        ...(request.promptRef?.version !== undefined ? { promptVersion: request.promptRef.version } : {}),
        temperature: this.deps.options?.temperature ?? request.hints?.temperature ?? 0.2,
        ...(sessionId ? { sessionId } : {}),
        ...(v['missionId'] ? { missionId: String(v['missionId']) } : {}),
        capability: request.capability,
      });

      // 3) evidence + 4) confidence (grounding — Constitution rules #7/#8)
      let evidence: EvidenceRef[] = [];
      if (this.deps.evidence) {
        const claim = (v['claim'] as string | undefined) ?? request.messages?.at(-1)?.content ?? request.capability;
        evidence = await this.deps.evidence.gather({ claim, ...(vertical ? { vertical } : {}) });
        trace.set({ evidence });
      }
      let confidence: ConfidenceAssessment | undefined;
      if (this.deps.confidence) {
        confidence = this.deps.confidence.assess({ evidence });
        trace.set({ confidence });
      }

      // 5) route → 6) inference with validate/repair loop
      job = transition(job, 'running', this.clock);
      const decision = this.deps.router.route(request);
      trace.step('route', { primary: decision.primary.id, fallbacks: decision.fallbacks.map((m) => m.id) });

      let messagesForRun: AIMessage[] = messages;
      let value: unknown;
      let lastAttempts: AITaskResult['attempts'] = [];
      let model = decision.primary.id;
      let engine = decision.primary.engine;
      let promptTokens = 0;
      let completionTokens = 0;

      job = transition(job, 'validating', this.clock);
      for (let attempt = 0; attempt <= this.maxValidationRetries; attempt++) {
        const outcome = await this.deps.pipeline.run(decision, messagesForRun, this.inferenceParams(request));
        model = outcome.model;
        engine = outcome.engine;
        promptTokens = outcome.promptTokens;
        completionTokens = outcome.completionTokens;
        lastAttempts = outcome.attempts;
        trace.step('inference', { model: outcome.model, attempts: outcome.attempts });

        const formatted = this.deps.formatter.format(outcome.text, request);
        if (!formatted.ok) {
          if (attempt === this.maxValidationRetries) throw new ValidationError(formatted.error);
          messagesForRun = [...messages, this.repair(formatted.error, request)];
          continue;
        }
        const validated = this.deps.validation.validate(formatted.value, request);
        if (validated.ok) {
          value = validated.value;
          trace.step('validate.ok');
          break;
        }
        if (attempt === this.maxValidationRetries) throw new ValidationError(validated.error);
        trace.step('validate.repair', { error: validated.error });
        messagesForRun = [...messages, this.repair(validated.error, request)];
      }

      // 7) safety(out)
      const safeOut = await this.deps.safety.inspectOutput(value, request);
      if (!safeOut.safe) throw new ForbiddenError('Unsafe output rejected', { details: { issues: safeOut.issues } });

      // 8) constitution check
      job = transition(job, 'checking', this.clock);
      if (this.deps.constitution) {
        const verdict = await this.deps.constitution.check({
          tenantId,
          role,
          action: (v['action'] as string | undefined) ?? `ai.${request.capability}`,
          ...(typeof value === 'string' ? { content: value } : {}),
          ...(brandId ? { brandId } : {}),
          ...(confidence ? { confidence } : {}),
          evidence,
        });
        trace.step('constitution', { passed: verdict.passed, violations: verdict.violations });
        if (!verdict.passed) throw new ForbiddenError('Constitution check failed', { details: { violations: verdict.violations } });
      }

      // 9) build response
      const latencyMs = this.clock.monotonic() - startMono;
      const response: AITaskResult = {
        taskId: job.id,
        capability: request.capability,
        model,
        engine,
        output: value,
        usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
        latencyMs,
        cached: false,
        attempts: lastAttempts,
      };

      // 10) decision journal
      if (this.deps.decisions) {
        await this.deps.decisions.record({
          tenantId,
          ...(sessionId ? { sessionId } : {}),
          subjectId: job.id,
          decision: `served capability ${request.capability} with ${model}`,
          reason: confidence?.reason ?? 'no confidence engine configured',
          evidence: { count: evidence.length, sources: evidence.map((e) => e.source) },
          at: this.clock.now(),
        });
        trace.set({ decisionJournalId: job.id });
      }

      // 11) monitoring + events + learning
      this.deps.monitoring.recordInference({
        model, engine, capability: request.capability, latencyMs,
        promptTokens, completionTokens, cached: false, ok: true,
      });
      await this.deps.events?.taskCompleted(response);
      trace.addEvent('ai.task.completed.v1');
      if (this.deps.learning && request.promptRef?.key) {
        await this.deps.learning.observe({
          promptKey: request.promptRef.key,
          model,
          reward: (confidence?.score ?? 50) / 100,
          ...(request.promptRef.version !== undefined ? { metadata: { promptVersion: request.promptRef.version } } : {}),
        });
      }

      // 12) enrich (Company Brain) — every completed task enriches (Rule #7)
      if (this.deps.brain && vertical) {
        await this.deps.brain.experience.record({
          tenantId, vertical,
          context: { capability: request.capability, model },
          action: `served ${request.capability}`,
          result: {},
          reason: confidence?.reason ?? '',
          learned: `capability ${request.capability} handled by ${model}`,
          at: this.clock.now(),
        });
        trace.addEnrichment(`experience:${vertical}`);
      }

      job = transition(job, 'completed', this.clock);
      return { job, trace: trace.seal(), response };
    } catch (e) {
      const error = normalizeError(e);
      trace.step('failed', { error: error.message });
      await this.deps.events?.taskFailed(job.id, error.message);
      job = transition(job, 'failed', this.clock, error);
      trace.seal();
      throw e;
    }
  }

  private inferenceParams(request: AITaskRequest): { maxTokens?: number; temperature?: number; timeoutMs?: number } {
    return {
      temperature: this.deps.options?.temperature ?? request.hints?.temperature ?? 0.2,
      ...(request.hints?.maxTokens !== undefined ? { maxTokens: request.hints.maxTokens } : {}),
      ...(request.timeoutMs !== undefined ? { timeoutMs: request.timeoutMs } : {}),
    };
  }

  private repair(error: string, request: AITaskRequest): AIMessage {
    return { role: 'user', content: repairInstruction(error, request.responseSchema ?? {}) };
  }
}

/** Pull [LABEL] tags from context system messages for the trace's contextRefs. */
function extractLabels(messages: AIMessage[]): string[] {
  const labels: string[] = [];
  for (const m of messages) {
    const match = m.content.match(/^\[([A-Z][A-Z ]+)\]/);
    if (match) labels.push(match[1]!.trim());
  }
  return labels;
}

export type { AICapability };
