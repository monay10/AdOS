import type { CapabilityId } from './capability.js';

/**
 * AI Session, AI Task Graph, and Decision Memory — the coherence layer that
 * keeps a whole mission's reasoning connected.
 */

/**
 * AISession — every mission runs as one session so context does not scatter
 * across independent calls. Planning, research, creative, campaign and analytics
 * tasks all share the session's accumulated context and memory scope.
 */
export interface AISession {
  id: string;
  tenantId: string;
  missionId?: string;
  startedBy: string;
  startedAt: string;
  status: 'active' | 'completed' | 'aborted';
  /** Rolling, compressed context shared by all tasks in the session. */
  contextRef: string;
}

export interface AISessionPort {
  start(input: { tenantId: string; missionId?: string; startedBy: string }): Promise<AISession>;
  get(id: string): Promise<AISession | null>;
  end(id: string, status: 'completed' | 'aborted'): Promise<void>;
}

/**
 * AITaskGraph — a mission is a DAG of capability invocations, not a flat list.
 * The Workflow Engine executes graphs; the Cognitive Core Planning Engine
 * produces them.
 */
export interface AITaskNode {
  id: string;
  capability: CapabilityId;
  input: Record<string, unknown>;
  dependsOn: string[]; // node ids — must be acyclic
}

export interface AITaskGraph {
  id: string;
  sessionId: string;
  nodes: AITaskNode[];
}

/** Validate acyclicity and return a topological execution order. */
export interface AITaskGraphPort {
  validate(graph: AITaskGraph): { ok: true; order: string[] } | { ok: false; error: string };
}

/**
 * Decision Memory — records WHY the company acted, not just what it did.
 * e.g. "CTR dropped → replaced creative → because the hook underperformed".
 * Feeds the Cognitive Core Reasoning/Learning engines and the COS Decision Log.
 */
export interface DecisionMemoryRecord {
  id: string;
  tenantId: string;
  sessionId?: string;
  subjectId: string; // campaign/creative/etc.
  decision: string;
  reason: string;
  evidence: Record<string, unknown>;
  outcome?: Record<string, unknown>;
  at: string;
}

export interface DecisionMemoryPort {
  record(entry: Omit<DecisionMemoryRecord, 'id'>): Promise<void>;
  recall(query: { subjectId?: string; sessionId?: string; k: number }): Promise<DecisionMemoryRecord[]>;
}
