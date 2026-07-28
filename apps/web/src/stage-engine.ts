import type { AITaskRequest, AITaskResult } from '@ados/contracts';
import {
  CapabilityRouter,
  InMemoryModelRegistry,
  RegexSafetyEngine,
  type ModelRouterPort,
  type SafetyEnginePort,
  type TraceBuilder,
} from '@ados/ai-manager';

/**
 * Stage Engine (Sprint 4.2 — orchestration becomes visible and real).
 *
 * The governed AIManager (`ai-manager/.../runtime/manager.ts`) already runs a
 * full ordered pipeline. Sprint 4.2 lifts a REAL subset of those stages onto the
 * live path around generation, so operators can see the orchestration that
 * actually runs — WITHOUT changing generation. Every stage here is:
 *   • real       — it performs the genuine offline, deterministic operation
 *                  (safety inspection, model routing) the governed pipeline uses;
 *   • observe-only — it records its outcome into the ExecutionTrace but never
 *                  alters, blocks or replaces the generation the LiveAIManager
 *                  performs. Enforcement (blocking on an unsafe verdict) and the
 *                  governed manager becoming the engine are Sprint 4.3.
 *
 * A stage that throws is caught and recorded as `{ ok:false, error }`; it can
 * never break the request. That is deliberate: an inspection stage failing must
 * degrade to "unobserved", not to "generation failed".
 */

/** A stage that runs before generation, seeing only the request. */
export interface PreStage {
  readonly name: string;
  run(request: AITaskRequest): Promise<Record<string, unknown>>;
}

/** A stage that runs after generation, seeing the request and the result. */
export interface PostStage {
  readonly name: string;
  run(request: AITaskRequest, result: AITaskResult): Promise<Record<string, unknown>>;
}

export class StageEngine {
  constructor(
    private readonly pre: readonly PreStage[],
    private readonly post: readonly PostStage[],
  ) {}

  /** Run every pre-generation stage, each recorded as its own trace step. */
  async runPre(request: AITaskRequest, trace: TraceBuilder): Promise<void> {
    for (const stage of this.pre) {
      try {
        trace.step(stage.name, await stage.run(request));
      } catch (e) {
        trace.step(stage.name, { ok: false, error: e instanceof Error ? e.message : String(e) });
      }
    }
  }

  /** Run every post-generation stage, each recorded as its own trace step. */
  async runPost(request: AITaskRequest, result: AITaskResult, trace: TraceBuilder): Promise<void> {
    for (const stage of this.post) {
      try {
        trace.step(stage.name, await stage.run(request, result));
      } catch (e) {
        trace.step(stage.name, { ok: false, error: e instanceof Error ? e.message : String(e) });
      }
    }
  }
}

/** Placeholder planner — records the task's intent. No effect on generation. */
function planStage(): PreStage {
  return {
    name: 'plan',
    async run(request) {
      const v = { ...(request.variables ?? {}), ...(request.input ?? {}) };
      return {
        placeholder: true,
        capability: request.capability,
        ...(request.promptRef?.key ? { prompt: request.promptRef.key } : {}),
        ...(v['missionId'] ? { missionId: String(v['missionId']) } : {}),
      };
    },
  };
}

/** Real, offline input-safety inspection. Observe-only: never blocks. */
function safetyInputStage(safety: SafetyEnginePort): PreStage {
  return {
    name: 'safety.input',
    async run(request) {
      const verdict = await safety.inspectInput(request);
      return { ok: verdict.safe, ...(verdict.issues.length ? { issues: verdict.issues } : {}) };
    },
  };
}

/**
 * Real, offline model-routing decision. Records which local model the governed
 * router WOULD select (and the fallback chain). Observe-only: the request is
 * still served by the wrapped manager, recorded separately as the trace's model.
 */
function routeStage(router: ModelRouterPort): PreStage {
  return {
    name: 'route',
    async run(request) {
      const decision = router.route(request);
      return {
        decidedModel: decision.primary.id,
        decidedEngine: decision.primary.engine,
        fallbacks: decision.fallbacks.map((m) => m.id),
      };
    },
  };
}

/** Real, offline output-safety inspection. Observe-only: never blocks. */
function safetyOutputStage(safety: SafetyEnginePort): PostStage {
  return {
    name: 'safety.output',
    async run(request, result) {
      const verdict = await safety.inspectOutput(result.output, request);
      return { ok: verdict.safe, ...(verdict.issues.length ? { issues: verdict.issues } : {}) };
    },
  };
}

/**
 * The default live stage engine: plan → safety.input → route (pre), and
 * safety.output (post). All offline and deterministic — no model server needed.
 */
export function defaultStageEngine(): StageEngine {
  const safety = new RegexSafetyEngine();
  const router = new CapabilityRouter(new InMemoryModelRegistry());
  return new StageEngine([planStage(), safetyInputStage(safety), routeStage(router)], [safetyOutputStage(safety)]);
}
