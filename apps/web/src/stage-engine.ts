import type {
  AITaskRequest,
  AITaskResult,
  CompanyBrainPort,
  ConfidenceAssessment,
  EvidenceRef,
  ExecutiveRole,
} from '@ados/contracts';
import {
  CapabilityRouter,
  InMemoryModelRegistry,
  RegexSafetyEngine,
  type ModelRouterPort,
  type SafetyEnginePort,
  type TraceBuilder,
} from '@ados/ai-manager';
import { BrainEvidenceEngine, ConstitutionChecker, HeuristicConfidenceEngine } from '@ados/executive-memory';
import { TenantContext } from '@ados/tenancy';

/**
 * Stage Engine (Sprint 4.2 — orchestration becomes visible; Sprint 4.3 observe
 * ladder — real governance stages run and record, still without deciding).
 *
 * Every stage here runs a REAL, offline, deterministic operation the governed
 * pipeline uses (safety inspection, model routing, evidence/confidence/
 * constitution) and records it into the ExecutionTrace. Every stage is
 * OBSERVE-ONLY: it inspects and records, it never alters, blocks or replaces the
 * generation the wrapped LiveAIManager/offline manager performs. Turning a stage
 * from observe → enforce (e.g. constitution actually rejecting an output) is a
 * separate, later mini-sprint per the observe→enforce ladder.
 *
 * A stage that throws is caught and recorded as `{ ok:false, error }`; it can
 * never break the request. An inspection stage failing must degrade to
 * "unobserved", not to "generation failed".
 */

/** A stage that runs before generation, seeing only the request. */
export interface PreStage {
  readonly name: string;
  run(request: AITaskRequest, trace: TraceBuilder): Promise<void>;
}

/** A stage that runs after generation, seeing the request and the result. */
export interface PostStage {
  readonly name: string;
  run(request: AITaskRequest, result: AITaskResult, trace: TraceBuilder): Promise<void>;
}

export class StageEngine {
  constructor(
    private readonly pre: readonly PreStage[],
    private readonly post: readonly PostStage[],
  ) {}

  /** Run every pre-generation stage; a throwing stage is recorded, never fatal. */
  async runPre(request: AITaskRequest, trace: TraceBuilder): Promise<void> {
    for (const stage of this.pre) {
      try {
        await stage.run(request, trace);
      } catch (e) {
        trace.step(stage.name, { ok: false, error: e instanceof Error ? e.message : String(e) });
      }
    }
  }

  /** Run every post-generation stage; a throwing stage is recorded, never fatal. */
  async runPost(request: AITaskRequest, result: AITaskResult, trace: TraceBuilder): Promise<void> {
    for (const stage of this.post) {
      try {
        await stage.run(request, result, trace);
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
    async run(request, trace) {
      const v = { ...(request.variables ?? {}), ...(request.input ?? {}) };
      trace.step('plan', {
        placeholder: true,
        capability: request.capability,
        ...(request.promptRef?.key ? { prompt: request.promptRef.key } : {}),
        ...(v['missionId'] ? { missionId: String(v['missionId']) } : {}),
      });
    },
  };
}

/** Real, offline input-safety inspection. Observe-only: never blocks. */
function safetyInputStage(safety: SafetyEnginePort): PreStage {
  return {
    name: 'safety.input',
    async run(request, trace) {
      const verdict = await safety.inspectInput(request);
      trace.step('safety.input', { ok: verdict.safe, ...(verdict.issues.length ? { issues: verdict.issues } : {}) });
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
    async run(request, trace) {
      const decision = router.route(request);
      trace.step('route', {
        decidedModel: decision.primary.id,
        decidedEngine: decision.primary.engine,
        fallbacks: decision.fallbacks.map((m) => m.id),
      });
    },
  };
}

/** Real, offline output-safety inspection. Observe-only: never blocks. */
function safetyOutputStage(safety: SafetyEnginePort): PostStage {
  return {
    name: 'safety.output',
    async run(request, result, trace) {
      const verdict = await safety.inspectOutput(result.output, request);
      trace.step('safety.output', { ok: verdict.safe, ...(verdict.issues.length ? { issues: verdict.issues } : {}) });
    },
  };
}

/**
 * Governance, OBSERVED (Sprint 4.3 observe ladder). Runs the real grounding +
 * governance chain the governed pipeline uses — evidence → confidence →
 * constitution — and records the genuine findings into the trace. It NEVER
 * blocks: a failing constitution verdict is recorded (`passed:false`,
 * `enforced:false`), not enforced. Enforcement is a later mini-sprint.
 *
 * The evidence engine reads the Company Brain's per-vertical marketing memory —
 * the same store Sprint 3 writes — so a campaign in a vertical with history is
 * genuinely grounded, while a first, ungrounded campaign honestly records
 * `no_evidence`. Nothing here is fabricated.
 */
function governanceObserveStage(brain: CompanyBrainPort): PostStage {
  const evidenceEngine = new BrainEvidenceEngine(brain);
  const confidenceEngine = new HeuristicConfidenceEngine();
  const constitution = new ConstitutionChecker(brain, { minConfidence: 70 });
  return {
    name: 'governance.observe',
    async run(request, result, trace) {
      const v = { ...(request.variables ?? {}), ...(request.input ?? {}) };
      const vertical = (v['vertical'] ?? v['industry']) as string | undefined;
      const claim = String(v['claim'] ?? request.capability);

      // evidence
      const evidence: EvidenceRef[] = await evidenceEngine.gather({ claim, ...(vertical ? { vertical } : {}) });
      trace.set({ evidence });
      trace.step('evidence', { ok: true, count: evidence.length, ...(vertical ? { vertical } : {}), observed: true });

      // confidence
      const confidence: ConfidenceAssessment = confidenceEngine.assess({ evidence });
      trace.set({ confidence });
      trace.step('confidence', { ok: true, score: confidence.score, observed: true });

      // constitution (observe-only — recorded, never enforced)
      const tenantId = TenantContext.current()?.tenantId ?? 'public';
      const role = (v['role'] as ExecutiveRole | undefined) ?? 'ceo';
      const action = String(v['action'] ?? `ai.${request.capability}`);
      const content = typeof result.output === 'string' ? result.output : undefined;
      const brandId = v['brandId'] as string | undefined;
      const verdict = await constitution.check({
        tenantId,
        role,
        action,
        ...(content ? { content } : {}),
        ...(brandId ? { brandId } : {}),
        confidence,
        evidence,
      });
      trace.step('constitution', {
        ok: verdict.passed,
        passed: verdict.passed,
        ...(verdict.violations.length ? { violations: verdict.violations } : {}),
        requiresApproval: verdict.requiresApproval,
        observed: true,
        enforced: false,
      });
    },
  };
}

/**
 * The default live stage engine. Pre: plan → safety.input → route. Post:
 * safety.output, and — when a Company Brain is available — governance.observe
 * (evidence → confidence → constitution, all observe-only). All offline and
 * deterministic; no model server needed.
 */
export function defaultStageEngine(brain?: CompanyBrainPort): StageEngine {
  const safety = new RegexSafetyEngine();
  const router = new CapabilityRouter(new InMemoryModelRegistry());
  const post: PostStage[] = [safetyOutputStage(safety)];
  if (brain) post.push(governanceObserveStage(brain));
  return new StageEngine([planStage(), safetyInputStage(safety), routeStage(router)], post);
}
