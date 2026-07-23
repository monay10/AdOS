import type {
  Decision,
  Evaluation,
  Goal,
  Plan,
  PlanStep,
  PolicyDecision,
  Reflection,
} from '@ados/contracts';

/**
 * Cognitive Core internal engine ports (BOOK 3). The Core composes these; each
 * engine is modular, replaceable and independently testable, and delegates ALL
 * inference to the AI Manager (never an engine directly).
 */

export interface PlanningEnginePort {
  decompose(goal: Goal, context?: Record<string, unknown>): Promise<Plan>;
}

export interface ReasoningEnginePort {
  analyze(question: string, evidence?: unknown[]): Promise<{ conclusion: string; steps: string[] }>;
}

export interface DecisionEnginePort {
  choose(situation: string, options?: string[], context?: Record<string, unknown>): Promise<Decision>;
}

export interface StrategyEnginePort {
  /** e.g. split a budget across channels toward a goal. */
  formulate(input: { goal: Goal; constraints?: Record<string, unknown> }): Promise<{
    allocations: Array<{ target: string; weight: number }>;
    rationale: string;
  }>;
}

export interface ReflectionEnginePort {
  reflect(subjectId: string, outcome: Record<string, unknown>): Promise<Reflection>;
}

export interface EvaluationEnginePort {
  score(subjectId: string, output: unknown, criteria?: string[]): Promise<Evaluation>;
}

export interface GoalManagerPort {
  create(goal: Omit<Goal, 'id'>): Promise<Goal>;
  get(id: string): Promise<Goal | null>;
  children(goalId: string): Promise<Goal[]>;
  progress(id: string): Promise<{ goal: Goal; attainment: number }>;
}

export interface PolicyEnginePort {
  /** Global guardrails: legal (e.g. KVKK/GDPR), brand-safety, honesty rules. */
  evaluate(input: { action: string; content?: string; tenantId: string }): Promise<PolicyDecision>;
}

export interface ExecutionPlannerPort {
  sequence(steps: PlanStep[]): Promise<PlanStep[]>;
}

export interface LearningEnginePort {
  learn(signal: { subject: string; reward: number; features: Record<string, unknown> }): Promise<void>;
  bestPractices(subject: string): Promise<Record<string, unknown>>;
}

/** Everything the Cognitive Core wires together. */
export interface CognitiveCoreEngines {
  planning: PlanningEnginePort;
  reasoning: ReasoningEnginePort;
  decision: DecisionEnginePort;
  strategy: StrategyEnginePort;
  reflection: ReflectionEnginePort;
  evaluation: EvaluationEnginePort;
  goals: GoalManagerPort;
  policy: PolicyEnginePort;
  execution: ExecutionPlannerPort;
  learning: LearningEnginePort;
}
