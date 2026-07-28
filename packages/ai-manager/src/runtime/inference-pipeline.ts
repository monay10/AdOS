import { TimeoutError, UnavailableError } from '@ados/kernel';
import type { AIMessage, AIStreamChunk } from '@ados/contracts';
import type {
  InferenceEngineId,
  InferenceEnginePort,
  ModelDescriptor,
  ResourceSchedulerPort,
  RoutingDecision,
} from '../ports.js';
import { normalizeError, type AIError } from './kernel.js';

export interface InferenceAttempt {
  model: string;
  ok: boolean;
  error?: string;
  /** Engine calls made for this model: 1 = no retry, >1 = retried transient
   * failures. 0 = the model was skipped before any call (didn't fit / circuit
   * open / no engine). */
  tries: number;
}

export interface InferenceOutcome {
  model: string;
  engine: InferenceEngineId;
  text: string;
  promptTokens: number;
  completionTokens: number;
  attempts: InferenceAttempt[];
}

export interface PipelineOptions {
  maxRetries?: number;
  timeoutMs?: number;
  breakerThreshold?: number;
  breakerCooldownMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

/**
 * Per-model circuit breaker: after N consecutive failures the model is skipped
 * until a cooldown elapses, so a sick model doesn't repeatedly waste the request
 * budget. The rest of the fallback chain keeps the platform working.
 */
class CircuitBreaker {
  private failures = 0;
  private openUntil = 0;
  constructor(private readonly threshold: number, private readonly cooldownMs: number, private readonly now: () => number) {}
  allow(): boolean {
    return this.now() >= this.openUntil;
  }
  onSuccess(): void {
    this.failures = 0;
    this.openUntil = 0;
  }
  onFailure(): void {
    this.failures++;
    if (this.failures >= this.threshold) this.openUntil = this.now() + this.cooldownMs;
  }
}

/**
 * Inference Runtime — turns a routing decision into a completed inference,
 * resiliently: it selects a model that fits the machine, applies a timeout and
 * bounded retries for transient failures, trips a circuit breaker on a bad
 * model, and falls back through the chain. The platform keeps working even if
 * the primary model fails (resilience mandate).
 */
export class InferencePipeline {
  private readonly breakers = new Map<string, CircuitBreaker>();
  private readonly maxRetries: number;
  private readonly timeoutMs: number;
  private readonly breakerThreshold: number;
  private readonly breakerCooldownMs: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;

  constructor(
    private readonly engines: Map<InferenceEngineId, InferenceEnginePort>,
    private readonly scheduler: ResourceSchedulerPort,
    opts: PipelineOptions = {},
  ) {
    this.maxRetries = opts.maxRetries ?? 2;
    this.timeoutMs = opts.timeoutMs ?? 60_000;
    this.breakerThreshold = opts.breakerThreshold ?? 3;
    this.breakerCooldownMs = opts.breakerCooldownMs ?? 30_000;
    this.sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.now = opts.now ?? (() => Date.now());
  }

  async run(
    decision: RoutingDecision,
    messages: AIMessage[],
    params: { maxTokens?: number; temperature?: number; timeoutMs?: number; signal?: AbortSignal } = {},
  ): Promise<InferenceOutcome> {
    const attempts: InferenceAttempt[] = [];

    for (const model of [decision.primary, ...decision.fallbacks]) {
      if (!(await this.scheduler.canFit(model))) {
        attempts.push({ model: model.id, ok: false, error: 'does_not_fit', tries: 0 });
        continue;
      }
      const breaker = this.breakerFor(model.id);
      if (!breaker.allow()) {
        attempts.push({ model: model.id, ok: false, error: 'circuit_open', tries: 0 });
        continue;
      }
      const engine = this.engines.get(model.engine);
      if (!engine) {
        attempts.push({ model: model.id, ok: false, error: `no_engine:${model.engine}`, tries: 0 });
        continue;
      }

      const result = await this.tryModel(engine, model, messages, params);
      if (result.ok) {
        breaker.onSuccess();
        attempts.push({ model: model.id, ok: true, tries: result.tries });
        return {
          model: model.id,
          engine: model.engine,
          text: result.text,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          attempts,
        };
      }
      breaker.onFailure();
      attempts.push({ model: model.id, ok: false, error: result.error.message, tries: result.tries });
    }

    throw new UnavailableError('All routed models failed', { details: { attempts } });
  }

  /** Streaming has no mid-stream fallback (would duplicate output); it selects the
   * first model that fits + is healthy, then streams from it. */
  async *stream(
    decision: RoutingDecision,
    messages: AIMessage[],
    params: { maxTokens?: number; temperature?: number; signal?: AbortSignal } = {},
  ): AsyncIterable<AIStreamChunk> {
    const model = await this.scheduler.select(decision);
    const engine = this.engines.get(model.engine);
    if (!engine) throw new UnavailableError(`No engine for ${model.engine}`);
    const lease = await this.scheduler.acquire(model);
    try {
      yield* engine.stream({ model: model.id, messages, ...params });
    } finally {
      await lease.release();
    }
  }

  private async tryModel(
    engine: InferenceEnginePort,
    model: ModelDescriptor,
    messages: AIMessage[],
    params: { maxTokens?: number; temperature?: number; timeoutMs?: number; signal?: AbortSignal },
  ): Promise<
    | { ok: true; text: string; promptTokens: number; completionTokens: number; tries: number }
    | { ok: false; error: AIError; tries: number }
  > {
    const lease = await this.scheduler.acquire(model);
    try {
      let lastError: AIError | undefined;
      let tries = 0;
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        tries += 1;
        try {
          const out = await this.withTimeout(
            (signal) =>
              engine.complete({
                model: model.id,
                messages,
                signal,
                ...(params.maxTokens !== undefined ? { maxTokens: params.maxTokens } : {}),
                ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
              }),
            params.timeoutMs ?? this.timeoutMs,
            params.signal,
          );
          return { ok: true, ...out, tries };
        } catch (e) {
          lastError = normalizeError(e);
          if (!lastError.retryable || attempt === this.maxRetries) break;
          await this.sleep(2 ** attempt * 100); // exponential backoff
        }
      }
      return { ok: false, error: lastError ?? { code: 'INTERNAL', category: 'internal', message: 'unknown', retryable: false }, tries };
    } finally {
      await lease.release();
    }
  }

  private async withTimeout<T>(op: (signal: AbortSignal) => Promise<T>, timeoutMs: number, external?: AbortSignal): Promise<T> {
    const ac = new AbortController();
    const onAbort = () => ac.abort();
    if (external?.aborted) ac.abort(); // already-aborted signals never re-fire 'abort'
    else external?.addEventListener('abort', onAbort, { once: true });
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      return await op(ac.signal);
    } catch (e) {
      if (ac.signal.aborted && !(external?.aborted)) throw new TimeoutError(`Inference exceeded ${timeoutMs}ms`);
      throw e;
    } finally {
      clearTimeout(timer);
      external?.removeEventListener('abort', onAbort);
    }
  }

  private breakerFor(modelId: string): CircuitBreaker {
    let b = this.breakers.get(modelId);
    if (!b) {
      b = new CircuitBreaker(this.breakerThreshold, this.breakerCooldownMs, this.now);
      this.breakers.set(modelId, b);
    }
    return b;
  }
}
