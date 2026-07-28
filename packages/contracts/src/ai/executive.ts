import type { AIMessage } from './ai-task.js';

/**
 * Executive Memory System (EMS) — per-executive memory + the reasoning
 * governance that makes every AI decision evidenced, confident, and lawful.
 *
 * Company Brain holds what the COMPANY knows; EMS holds what each EXECUTIVE
 * knows (as in a real company, not everyone knows the same things) and enforces:
 *   • no decision without EVIDENCE,
 *   • no output without a CONFIDENCE score + basis,
 *   • no action that violates the Constitution (SOP / DNA / brand / risk / law).
 */

export type ExecutiveRole =
  | 'ceo'
  | 'cmo'
  | 'coo'
  | 'creative_director'
  | 'sales_director'
  | 'finance_director'
  | 'legal_director'
  | 'pmo';

// ── Executive Memory ──────────────────────────────────────────────────────────
export interface ExecutiveMemoryEntry {
  id: string;
  tenantId: string;
  role: ExecutiveRole;
  /** e.g. objective, risk, strategy, decision, budget, customer, campaign,
   * offer, audience, trend, hook, video, image, brand_exception, review_note. */
  category: string;
  content: string;
  importance: number; // 0..1 — drives recall ranking + retention
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ExecutiveMemoryPort {
  remember(entry: Omit<ExecutiveMemoryEntry, 'id' | 'createdAt'>): Promise<void>;
  recall(query: {
    tenantId: string;
    role: ExecutiveRole;
    category?: string;
    query?: string;
    k: number;
  }): Promise<ExecutiveMemoryEntry[]>;
}

// ── Evidence Engine — every recommendation must be grounded ───────────────────
export interface EvidenceRef {
  source: 'campaign' | 'pattern' | 'marketing_brain' | 'creative_brain' | 'experience' | 'metric' | 'decision';
  ref: string;
  detail?: string;
  weight: number; // 0..1 — strength of this evidence
}

export interface EvidenceEnginePort {
  /** Gather grounding for a claim from the Company Brain + history. */
  gather(input: { claim: string; vertical?: string; context?: Record<string, unknown> }): Promise<EvidenceRef[]>;
}

// ── Confidence Engine — never "I think", always a % + basis ───────────────────
export interface ConfidenceAssessment {
  /** 0..100. */
  score: number;
  reason: string;
  basis: { sampleSize: number; roas?: number; successRate?: number };
}

export interface ConfidenceEnginePort {
  assess(input: {
    evidence: EvidenceRef[];
    priorSuccessRate?: number;
    sampleSize?: number;
    roas?: number;
  }): ConfidenceAssessment;
}

// ── Decision Journal — why each executive decided what they decided ───────────
export interface DecisionJournalEntry {
  id: string;
  tenantId: string;
  role: ExecutiveRole;
  subjectId: string;
  decision: string;
  evidence: EvidenceRef[];
  alternatives: string[];
  chosen: string;
  rejected: string[];
  confidence: ConfidenceAssessment;
  outcome?: Record<string, unknown>;
  at: string;
}

export interface DecisionJournalPort {
  record(entry: Omit<DecisionJournalEntry, 'id'>): Promise<string>;
  history(query: { tenantId?: string; role?: ExecutiveRole; subjectId?: string; k: number }): Promise<DecisionJournalEntry[]>;
  attachOutcome(id: string, outcome: Record<string, unknown>): Promise<void>;
}

// ── AI Constitution Checker — the gate every AI output passes through ──────────
export interface ConstitutionCheckInput {
  tenantId: string;
  role: ExecutiveRole;
  action: string;
  content?: string;
  brandId?: string;
  confidence?: ConfidenceAssessment;
  evidence?: EvidenceRef[];
}

export interface ConstitutionVerdict {
  passed: boolean;
  violations: string[]; // e.g. "no_evidence", "insufficient_confidence", "brand_rule", "risk_policy"
  requiresApproval: boolean;
  approver?: string;
}

export interface AIConstitutionCheckerPort {
  check(input: ConstitutionCheckInput): Promise<ConstitutionVerdict>;
}

// ── Executive Context Builder — the enriched context assembly order ───────────
export interface ExecutiveContextRequest {
  tenantId: string;
  role: ExecutiveRole;
  missionId?: string;
  promptKey?: string;
  variables?: Record<string, unknown>;
  vertical?: string;
  brandId?: string;
}

/**
 * Assembles context in the order:
 *   Prompt → Mission → Company Brain → Executive Memory → Decision Memory →
 *   Experience Engine → Prompt Registry → messages for the AI Manager.
 */
export interface ExecutiveContextBuilderPort {
  build(request: ExecutiveContextRequest): Promise<AIMessage[]>;
}

// ── Board Meeting Engine — automated corporate meeting, not agent chat ────────
export interface BoardContribution {
  role: ExecutiveRole;
  summary: string;
  decisions: string[];
  concerns: string[];
}
export interface ActionItem {
  owner: ExecutiveRole;
  task: string;
  due?: string;
}
export interface BoardMinutes {
  id: string;
  tenantId: string;
  heldAt: string;
  contributions: BoardContribution[];
  decisions: string[];
  actionItems: ActionItem[];
}
export interface BoardMeetingEnginePort {
  convene(input: { tenantId: string; heldAt: string; contributions: BoardContribution[] }): Promise<BoardMinutes>;
}

export const EXECUTIVE_MEMORY = Symbol.for('ados.ExecutiveMemory');
export const AI_CONSTITUTION_CHECKER = Symbol.for('ados.AIConstitutionChecker');
