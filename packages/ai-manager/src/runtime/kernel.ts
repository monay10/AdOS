import { randomUUID } from 'node:crypto';
import { isAppError, type SerializedError } from '@ados/kernel';
import type {
  AITaskRequest,
  AITaskResult,
  AITokenUsage,
  CapabilityInvocation,
  ConfidenceAssessment,
  EvidenceRef,
} from '@ados/contracts';

/**
 * Sprint 2.1 — AI Runtime Kernel.
 *
 * Pure runtime primitives with ZERO inference: the job lifecycle, the
 * normalized error shape, lifecycle events, and — central to Constitution Rule
 * #8 (AI Determinism) — the ExecutionTrace that makes every AI task reproducible,
 * replayable, and explainable. Later sprints (2.6+) plug real execution into
 * these primitives without changing them.
 */

// ── AIError — one normalized error shape across the runtime ────────────────────
export interface AIError {
  code: string;
  category: SerializedError['category'];
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export function normalizeError(err: unknown): AIError {
  if (isAppError(err)) {
    const j = err.toJSON();
    return { code: j.code, category: j.category, message: j.message, retryable: j.retryable, ...(j.details ? { details: j.details } : {}) };
  }
  if (err instanceof Error) {
    return { code: 'INTERNAL', category: 'internal', message: err.message, retryable: false };
  }
  return { code: 'INTERNAL', category: 'internal', message: String(err), retryable: false };
}

// ── AIJob — a unit of AI work with an explicit lifecycle ──────────────────────
export type AIJobState =
  | 'created'
  | 'queued'
  | 'planning'
  | 'context'
  | 'running'
  | 'validating'
  | 'checking'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** Allowed forward transitions. `failed`/`cancelled` are reachable from any live state. */
const TRANSITIONS: Record<AIJobState, AIJobState[]> = {
  created: ['queued', 'cancelled'],
  queued: ['planning', 'cancelled'],
  planning: ['context', 'cancelled'],
  context: ['running', 'cancelled'],
  running: ['validating', 'cancelled'],
  validating: ['checking', 'cancelled'],
  checking: ['completed', 'cancelled'],
  completed: [],
  failed: [],
  cancelled: [],
};

const TERMINAL: ReadonlySet<AIJobState> = new Set<AIJobState>(['completed', 'failed', 'cancelled']);

export function isTerminal(state: AIJobState): boolean {
  return TERMINAL.has(state);
}

/** Any live (non-terminal) job may transition to failed. */
export function canTransition(from: AIJobState, to: AIJobState): boolean {
  if (isTerminal(from)) return false;
  if (to === 'failed') return true;
  return TRANSITIONS[from].includes(to);
}

export interface AIJob {
  id: string;
  sessionId: string | undefined;
  kind: 'task' | 'capability';
  request: AITaskRequest | CapabilityInvocation;
  state: AIJobState;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  error: AIError | undefined;
}

// ── AIEvent — nothing happens silently (Rule #8) ──────────────────────────────
export type AIEventType =
  | 'job.created'
  | 'job.queued'
  | 'job.planning'
  | 'job.context_built'
  | 'job.model_selected'
  | 'job.inference_started'
  | 'job.token'
  | 'job.validated'
  | 'job.constitution_checked'
  | 'job.completed'
  | 'job.failed'
  | 'job.cancelled';

export interface AIEvent {
  type: AIEventType;
  jobId: string;
  at: string;
  data?: Record<string, unknown>;
}

// ── ExecutionTrace — the complete, replayable record (Rule #8) ────────────────
export interface TraceStep {
  name: string;
  at: string;
  durationMs?: number;
  detail?: Record<string, unknown>;
}

export interface ExecutionTrace {
  jobId: string;
  sessionId?: string;
  missionId?: string;
  capability?: string;
  tools: string[];
  model?: string;
  engine?: string;
  promptKey?: string;
  promptVersion?: number;
  temperature?: number;
  parameters?: Record<string, unknown>;
  contextRefs: string[];
  evidence: EvidenceRef[];
  confidence?: ConfidenceAssessment;
  decisionJournalId?: string;
  eventsProduced: string[];
  knowledgeEnriched: string[];
  usage?: AITokenUsage;
  latencyMs?: number;
  cached?: boolean;
  steps: TraceStep[];
  startedAt: string;
  finishedAt?: string;
}

export interface AIExecution {
  job: AIJob;
  trace: ExecutionTrace;
  response?: AITaskResult;
}

// ── Factories & builders (injectable clock ⇒ reproducible, testable) ──────────
export interface Clock {
  now(): string;
  monotonic(): number;
}

export const systemClock: Clock = {
  now: () => new Date().toISOString(),
  monotonic: () => Date.now(),
};

export function createJob(
  input: { request: AITaskRequest | CapabilityInvocation; kind: 'task' | 'capability'; sessionId?: string },
  clock: Clock = systemClock,
): AIJob {
  const at = clock.now();
  return {
    id: randomUUID(),
    sessionId: input.sessionId,
    kind: input.kind,
    request: input.request,
    state: 'created',
    attempts: 0,
    createdAt: at,
    updatedAt: at,
    error: undefined,
  };
}

/** Immutably transition a job; throws on an illegal transition (fail-loud). */
export function transition(job: AIJob, to: AIJobState, clock: Clock = systemClock, error?: AIError): AIJob {
  if (!canTransition(job.state, to)) {
    throw new Error(`Illegal AIJob transition: ${job.state} → ${to}`);
  }
  return {
    ...job,
    state: to,
    updatedAt: clock.now(),
    attempts: to === 'running' ? job.attempts + 1 : job.attempts,
    error: error ?? job.error,
  };
}

/**
 * Accumulates an ExecutionTrace step-by-step during a run and seals it at the
 * end. Every field required by Rule #8 has a setter; the sealed trace is the
 * artifact that makes the execution replayable and explainable.
 */
export class TraceBuilder {
  private readonly trace: ExecutionTrace;

  constructor(job: AIJob, private readonly clock: Clock = systemClock) {
    this.trace = {
      jobId: job.id,
      ...(job.sessionId ? { sessionId: job.sessionId } : {}),
      tools: [],
      contextRefs: [],
      evidence: [],
      eventsProduced: [],
      knowledgeEnriched: [],
      steps: [],
      startedAt: this.clock.now(),
    };
  }

  step(name: string, detail?: Record<string, unknown>): this {
    this.trace.steps.push({ name, at: this.clock.now(), ...(detail ? { detail } : {}) });
    return this;
  }

  set(patch: Partial<Omit<ExecutionTrace, 'jobId' | 'steps' | 'startedAt'>>): this {
    Object.assign(this.trace, patch);
    return this;
  }

  addEvent(name: string): this {
    this.trace.eventsProduced.push(name);
    return this;
  }

  addEnrichment(name: string): this {
    this.trace.knowledgeEnriched.push(name);
    return this;
  }

  seal(): ExecutionTrace {
    this.trace.finishedAt = this.clock.now();
    // Return a frozen snapshot so a sealed trace can never be mutated post-hoc.
    return Object.freeze({
      ...this.trace,
      tools: [...this.trace.tools],
      contextRefs: [...this.trace.contextRefs],
      evidence: [...this.trace.evidence],
      eventsProduced: [...this.trace.eventsProduced],
      knowledgeEnriched: [...this.trace.knowledgeEnriched],
      steps: [...this.trace.steps],
    });
  }
}

export function makeEvent(type: AIEventType, jobId: string, clock: Clock = systemClock, data?: Record<string, unknown>): AIEvent {
  return { type, jobId, at: clock.now(), ...(data ? { data } : {}) };
}
