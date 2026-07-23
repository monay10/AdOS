/**
 * Cognitive Core (AI Brain) contract — the reasoning layer agents delegate
 * thinking to.
 *
 * LAYERING (Product Constitution):
 *   Agents  ->  Cognitive Core (how to THINK)  ->  AI Manager (how to RUN)  ->  engines
 *
 * The Cognitive Core NEVER calls an inference engine directly; it composes
 * AITasks and submits them through the AI Manager. Agents never plan or reason
 * by hand — they ask the Brain.
 */

export interface Goal {
  id: string;
  /** e.g. "generate 100 qualified leads", "reach ROAS 5", "CTR >= 4%". */
  objective: string;
  metric: { name: string; target: number; unit: string };
  deadline?: string;
  parentGoalId?: string;
  priority: number; // 0 = lowest
}

export interface PlanStep {
  id: string;
  description: string;
  /** Capability or department/agent role responsible for the step. */
  assignedTo: string;
  dependsOn: string[];
  order: number;
}

export interface Plan {
  id: string;
  goalId: string;
  steps: PlanStep[];
  rationale: string;
}

export interface Decision {
  id: string;
  situation: string;
  options: Array<{ label: string; expectedImpact: string; confidence: number }>;
  chosen: string;
  rationale: string;
}

export interface Reflection {
  subjectId: string; // task/campaign/agent the reflection is about
  whatWentWell: string[];
  whatWentWrong: string[];
  lessons: string[];
  nextTimeChanges: string[];
}

export interface Evaluation {
  subjectId: string;
  score: number; // 0..100
  breakdown: Record<string, number>;
  passed: boolean;
  improvementActions: string[];
}

export interface PolicyDecision {
  allowed: boolean;
  violatedPolicies: string[];
  reason?: string;
}

/**
 * The Brain's public port. Each method maps to one of the Cognitive Core
 * engines (Planning, Decision, Reflection, Evaluation, Goal, Policy, Strategy,
 * Reasoning, Execution Planner, Learning) and is independently replaceable.
 */
export interface CognitiveCorePort {
  /** Planning Engine — decompose an objective into an executable plan. */
  plan(input: { goal: Goal; context?: Record<string, unknown> }): Promise<Plan>;

  /** Reasoning Engine — analyze a situation and produce grounded conclusions. */
  reason(input: { question: string; evidence?: unknown[] }): Promise<{ conclusion: string; steps: string[] }>;

  /** Decision Engine — choose among options for a situation. */
  decide(input: { situation: string; options?: string[]; context?: Record<string, unknown> }): Promise<Decision>;

  /** Reflection Engine — post-mortem that feeds Memory. */
  reflect(input: { subjectId: string; outcome: Record<string, unknown> }): Promise<Reflection>;

  /** Evaluation Engine — score an agent output; low scores trigger auto-fix. */
  evaluate(input: { subjectId: string; output: unknown; criteria?: string[] }): Promise<Evaluation>;

  /** Policy Engine — enforce global rules (legal, brand-safety, compliance). */
  checkPolicy(input: { action: string; content?: string; tenantId: string }): Promise<PolicyDecision>;

  /** Execution Planner — order steps into an executable sequence. */
  sequence(input: { steps: PlanStep[] }): Promise<PlanStep[]>;
}

export const COGNITIVE_CORE = Symbol.for('ados.CognitiveCore');
