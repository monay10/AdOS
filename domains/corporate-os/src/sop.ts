/**
 * Corporate Operating System (COS) — the SOP / rule contracts.
 *
 * The COS is what separates AdOS from a "collection of agents": no department
 * acts without a documented, versioned, testable Standard Operating Procedure.
 * The company follows procedures, not ad-hoc decisions.
 *
 * These are the ports/types; engine implementations land in BOOK 5's pass.
 */

// ── SOP Engine ────────────────────────────────────────────────────────────────
export interface SopStep {
  id: string;
  name: string;
  /** Department/role or capability responsible. */
  owner: string;
  /** Gate that must pass before advancing (references a Quality/Approval check). */
  gate?: string;
  dependsOn: string[];
  /** Measurable output the step must produce (measurability mandate). */
  output: { name: string; schema?: Record<string, unknown> };
}

export interface Sop {
  key: string; // e.g. "marketing.create_campaign"
  version: number; // every SOP is versioned
  title: string;
  department: string;
  steps: SopStep[];
  /** Metrics the SOP is scored on, feeding Continuous Improvement. */
  successMetrics: string[];
  active: boolean;
}

export interface SopEnginePort {
  get(key: string, version?: number): Promise<Sop>;
  list(department?: string): Promise<Sop[]>;
  publish(sop: Omit<Sop, 'active'>): Promise<void>;
  /** Start an SOP run for a subject (mission/client/campaign). */
  start(input: { key: string; subjectId: string; variables?: Record<string, unknown> }): Promise<{ runId: string }>;
}

// ── Quality Engine ────────────────────────────────────────────────────────────
export interface QualityCheck {
  name: string;
  passed: boolean;
  score: number; // 0..100
  notes?: string;
}
export interface QualityEnginePort {
  review(input: { subjectId: string; artifact: unknown; standard: string }): Promise<{
    passed: boolean;
    checks: QualityCheck[];
  }>;
}

// ── Compliance Engine ─────────────────────────────────────────────────────────
export interface ComplianceEnginePort {
  check(input: { channel?: string; content: string; tenantId: string }): Promise<{
    verdict: 'approve' | 'mask' | 'reject';
    violations: string[];
    maskedContent?: string;
  }>;
}

// ── Policy Engine (if-CTR<2 → regenerate creative, if-ROAS<3 → pause) ─────────
export interface PolicyRule {
  id: string;
  when: string; // expression, e.g. "ctr < 2"
  then: string; // action, e.g. "creative.regenerate"
  department: string;
  version: number;
}
export interface PolicyEnginePort {
  evaluate(input: { facts: Record<string, number | string>; department?: string }): Promise<
    Array<{ ruleId: string; action: string }>
  >;
  upsert(rule: PolicyRule): Promise<void>;
}

// ── Approval Engine (budget > 100k → CEO, new brand → Creative Director) ──────
export interface ApprovalEnginePort {
  required(input: { action: string; context: Record<string, unknown> }): Promise<
    { required: false } | { required: true; approver: string; reason: string }
  >;
}

// ── Risk Engine ───────────────────────────────────────────────────────────────
export interface RiskEnginePort {
  assess(input: { subjectId: string; signals: Record<string, number> }): Promise<{
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    escalateTo?: string;
  }>;
}

// ── Audit Engine + Decision Log ───────────────────────────────────────────────
export interface AuditRecord {
  id: string;
  tenantId: string;
  subjectId: string;
  action: string;
  actor: string;
  promptVersion?: number;
  model?: string;
  approvedBy?: string;
  at: string;
}
export interface DecisionLogRecord {
  id: string;
  subjectId: string;
  decision: string;
  reason: string;
  evidence: Record<string, unknown>;
  at: string;
}
export interface AuditEnginePort {
  record(entry: Omit<AuditRecord, 'id'>): Promise<void>;
  logDecision(entry: Omit<DecisionLogRecord, 'id'>): Promise<void>;
  trail(subjectId: string): Promise<{ audit: AuditRecord[]; decisions: DecisionLogRecord[] }>;
}

// ── Continuous Improvement + Best Practice + Corporate Knowledge + Academy ────
export interface ContinuousImprovementPort {
  /** Analyze recent SOP runs and propose an improved SOP version. */
  proposeImprovement(sopKey: string): Promise<{ from: number; to: number; changes: string[] } | null>;
}
export interface BestPracticePort {
  capture(input: { domain: string; subjectId: string; asTemplate: string }): Promise<void>;
  bestFor(domain: string): Promise<Array<{ templateKey: string; score: number }>>;
}
export interface CorporateKnowledgePort {
  /** Vertical-specific accumulated experience (e.g. best CTA/color for "dental"). */
  insights(vertical: string): Promise<Record<string, unknown>>;
}
export interface AiAcademyPort {
  /** Onboard a new agent against SOPs, brand rules and past campaigns, then certify. */
  train(input: { agentId: string; role: string }): Promise<{ certified: boolean; score: number }>;
}

export interface CorporateOperatingSystem {
  sop: SopEnginePort;
  quality: QualityEnginePort;
  compliance: ComplianceEnginePort;
  policy: PolicyEnginePort;
  approval: ApprovalEnginePort;
  risk: RiskEnginePort;
  audit: AuditEnginePort;
  improvement: ContinuousImprovementPort;
  bestPractice: BestPracticePort;
  knowledge: CorporateKnowledgePort;
  academy: AiAcademyPort;
}
