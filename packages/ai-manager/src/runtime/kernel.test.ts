import { describe, expect, it } from 'vitest';
import { ValidationError } from '@ados/kernel';
import type { AITaskRequest } from '@ados/contracts';
import {
  type Clock,
  TraceBuilder,
  canTransition,
  createJob,
  isTerminal,
  makeEvent,
  normalizeError,
  transition,
} from './kernel.js';

/** Deterministic clock — reproducibility is a Rule #8 requirement, incl. in tests. */
function fixedClock(): Clock {
  let t = 0;
  return { now: () => `t${t}`, monotonic: () => (t += 1) };
}

const request: AITaskRequest = { capability: 'reasoning', submittedBy: 'ceo-agent' };

describe('normalizeError', () => {
  it('normalizes an AppError preserving code/category/retryable', () => {
    const e = normalizeError(new ValidationError('bad', { details: { field: 'x' } }));
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.category).toBe('validation');
    expect(e.details).toEqual({ field: 'x' });
  });
  it('normalizes a plain Error and a non-error', () => {
    expect(normalizeError(new Error('boom')).code).toBe('INTERNAL');
    expect(normalizeError('weird').message).toBe('weird');
  });
});

describe('AIJob lifecycle', () => {
  it('creates a job in the created state', () => {
    const job = createJob({ request, kind: 'task' }, fixedClock());
    expect(job.state).toBe('created');
    expect(job.attempts).toBe(0);
  });

  it('walks the happy path and increments attempts entering running', () => {
    const clock = fixedClock();
    let job = createJob({ request, kind: 'task', sessionId: 's1' }, clock);
    for (const to of ['queued', 'planning', 'context', 'running', 'validating', 'checking', 'completed'] as const) {
      job = transition(job, to, clock);
    }
    expect(job.state).toBe('completed');
    expect(job.attempts).toBe(1);
    expect(isTerminal(job.state)).toBe(true);
  });

  it('allows failure from any live state but not from a terminal one', () => {
    expect(canTransition('running', 'failed')).toBe(true);
    expect(canTransition('created', 'failed')).toBe(true);
    expect(canTransition('completed', 'failed')).toBe(false);
  });

  it('throws on an illegal transition', () => {
    const job = createJob({ request, kind: 'task' }, fixedClock());
    expect(() => transition(job, 'completed')).toThrow(/Illegal AIJob transition/);
  });
});

describe('ExecutionTrace (Rule #8)', () => {
  it('records steps + determinism fields and seals an immutable trace', () => {
    const clock = fixedClock();
    const job = createJob({ request, kind: 'task', sessionId: 's1' }, clock);
    const trace = new TraceBuilder(job, clock)
      .step('plan')
      .set({ capability: 'seo.analysis', model: 'qwen3:32b', engine: 'ollama', promptKey: 'seo.system', promptVersion: 3, temperature: 0.2 })
      .step('infer', { tokens: 128 })
      .addEvent('ai.task.completed.v1')
      .addEnrichment('marketing:dental')
      .seal();

    expect(trace.jobId).toBe(job.id);
    expect(trace.model).toBe('qwen3:32b');
    expect(trace.promptVersion).toBe(3);
    expect(trace.steps.map((s) => s.name)).toEqual(['plan', 'infer']);
    expect(trace.eventsProduced).toContain('ai.task.completed.v1');
    expect(trace.knowledgeEnriched).toContain('marketing:dental');
    expect(trace.finishedAt).toBeDefined();
    // sealed trace is frozen — no silent post-hoc mutation
    expect(Object.isFrozen(trace)).toBe(true);
    expect(() => {
      (trace as { model?: string }).model = 'tampered';
    }).toThrow();
  });
});

describe('makeEvent', () => {
  it('stamps a lifecycle event with the injected clock', () => {
    const ev = makeEvent('job.completed', 'job-1', fixedClock(), { ok: true });
    expect(ev).toMatchObject({ type: 'job.completed', jobId: 'job-1', at: 't0', data: { ok: true } });
  });
});
