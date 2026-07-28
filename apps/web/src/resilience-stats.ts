import type { ExecutionTrace } from '@ados/ai-manager';

/**
 * Inference resilience stats (Sprint 7, slice 1).
 *
 * The governed runtime's InferencePipeline is resilient: it retries transient
 * failures, trips a per-model circuit breaker, and falls back through the routed
 * model chain so a sick model does not fail the mission. Every sealed
 * ExecutionTrace records, in its `inference` step, the ordered `attempts` — one
 * entry per MODEL tried (the fallback chain); a task that failed outright leaves
 * a `failed` step instead. This reads those signals back so the resilience is
 * measured, not merely asserted.
 *
 * Each attempt now also carries `tries` — the engine-call count for that model
 * (1 = no retry, >1 = retried transient failures) — so this surfaces FALLBACK,
 * per-model RETRY, and FAILURE, plus per-model health. On the offline/deterministic
 * path nothing fails, so this reads clean — truthfully.
 */

interface Attempt {
  model: string;
  ok: boolean;
  error?: string;
  tries?: number;
}

export interface ModelHealth {
  model: string;
  attempts: number;
  failures: number;
}

export interface ResilienceStats {
  /** AI tasks that reached inference (succeeded) or failed outright. */
  aiTasks: number;
  /** Succeeded on the first routed model. */
  cleanFirstTry: number;
  /** Succeeded only after falling back to a later model in the chain. */
  recoveredViaFallback: number;
  /** Failed outright — every routed model failed. */
  failed: number;
  /** Tasks where at least one model was retried (a model with tries > 1). */
  retriedTasks: number;
  /** Total extra engine calls beyond the first, across all models/tasks. */
  totalRetries: number;
  /** recoveredViaFallback / successful inferences, %. */
  fallbackRatePct: number;
  /** retriedTasks / aiTasks, %. */
  retryRatePct: number;
  /** failed / aiTasks, %. */
  failureRatePct: number;
  /** Per-model attempt/failure tally, least healthy first. */
  modelHealth: ModelHealth[];
}

function attemptsOf(trace: ExecutionTrace): Attempt[] | undefined {
  const step = trace.steps.find((s) => s.name === 'inference');
  const raw = step?.detail?.['attempts'];
  return Array.isArray(raw) ? (raw as Attempt[]) : undefined;
}

export function resilienceStats(traces: readonly ExecutionTrace[]): ResilienceStats {
  let aiTasks = 0;
  let cleanFirstTry = 0;
  let recoveredViaFallback = 0;
  let failed = 0;
  let retriedTasks = 0;
  let totalRetries = 0;
  const health = new Map<string, ModelHealth>();
  const bump = (model: string, ok: boolean): void => {
    const h = health.get(model) ?? { model, attempts: 0, failures: 0 };
    h.attempts += 1;
    if (!ok) h.failures += 1;
    health.set(model, h);
  };

  for (const trace of traces) {
    const attempts = attemptsOf(trace);
    if (attempts && attempts.length > 0) {
      aiTasks += 1;
      let taskRetried = false;
      for (const a of attempts) {
        bump(a.model, a.ok);
        const extra = Math.max(0, (a.tries ?? 1) - 1); // engine calls beyond the first
        totalRetries += extra;
        if (extra > 0) taskRetried = true;
      }
      if (taskRetried) retriedTasks += 1;
      if (attempts.length === 1) cleanFirstTry += 1;
      else recoveredViaFallback += 1;
    } else if (trace.steps.some((s) => s.name === 'failed')) {
      aiTasks += 1;
      failed += 1;
    }
  }

  const successful = cleanFirstTry + recoveredViaFallback;
  const pct = (n: number, d: number): number => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10);
  const modelHealth = [...health.values()].sort(
    (a, b) => b.failures - a.failures || b.attempts - a.attempts || a.model.localeCompare(b.model),
  );

  return {
    aiTasks,
    cleanFirstTry,
    recoveredViaFallback,
    failed,
    retriedTasks,
    totalRetries,
    fallbackRatePct: pct(recoveredViaFallback, successful),
    retryRatePct: pct(retriedTasks, aiTasks),
    failureRatePct: pct(failed, aiTasks),
    modelHealth,
  };
}
