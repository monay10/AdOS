import { describe, expect, it } from 'vitest';
import type { AIMessage, AITaskRequest, ToolDefinition } from '@ados/contracts';
import { InMemoryModelRegistry } from '../model-registry.js';
import { CapabilityRouter } from '../capability-router.js';
import { InMemoryCapabilityRegistry } from '../capability-registry.js';
import { InMemoryToolRegistry } from '../tool-registry.js';
import { FakeInferenceEngine } from './engines/fake-engine.js';
import { InMemoryResourceScheduler } from './resource-scheduler.js';
import { InferencePipeline } from './inference-pipeline.js';
import { JsonResponseFormatter, SchemaValidationEngine } from './validation-engine.js';
import { RegexSafetyEngine } from './safety-engine.js';
import { InMemoryMonitoring } from './monitoring.js';
import { InMemoryQueueManager } from './queue-manager.js';
import { InMemoryAISession, InMemoryDecisionMemory } from './memory-runtime.js';
import { AIManager, type AIManagerDeps } from './manager.js';
import { makeCapabilityExecutor } from './capability-executor.js';
import type { ContextBuilderPort, InferenceEngineId, InferenceEnginePort } from '../ports.js';

const echoTool: ToolDefinition = { id: 'markdown', title: 'md', description: '', argsSchema: {}, sideEffects: 'none', handler: async () => ({}) };

function wire(reply = 'hello', extra: Partial<AIManagerDeps> = {}): { manager: AIManager; monitoring: InMemoryMonitoring } {
  const registry = new InMemoryModelRegistry();
  const engines = new Map<InferenceEngineId, InferenceEnginePort>([['ollama', new FakeInferenceEngine('ollama', () => reply)]]);
  const scheduler = new InMemoryResourceScheduler({ gpu: true, vramTotalGb: 48, ramTotalGb: 64, cpuCores: 8, maxModelVramGb: 48 }, 4);
  const context: ContextBuilderPort = { build: async (r: AITaskRequest) => (r.messages ?? []) as AIMessage[] };
  const monitoring = new InMemoryMonitoring();
  const manager = new AIManager({
    router: new CapabilityRouter(registry),
    pipeline: new InferencePipeline(engines, scheduler, { sleep: async () => {}, now: () => 0 }),
    context,
    formatter: new JsonResponseFormatter(),
    validation: new SchemaValidationEngine(),
    safety: new RegexSafetyEngine(),
    monitoring,
    tools: new InMemoryToolRegistry([echoTool]),
    ...extra,
  });
  return { manager, monitoring };
}

const base: AITaskRequest = { capability: 'chat', submittedBy: 'agent', messages: [{ role: 'user', content: 'hi' }] };

describe('AI Session lifecycle', () => {
  it('starts active, ends completed, and reports not-found', async () => {
    const sessions = new InMemoryAISession(() => 't0');
    const s = await sessions.start({ tenantId: 'acme', missionId: 'm1', startedBy: 'user' });
    expect(s.status).toBe('active');
    await sessions.end(s.id, 'completed');
    expect((await sessions.get(s.id))!.status).toBe('completed');
    await expect(sessions.end('nope', 'aborted')).rejects.toThrow();
  });

  it('openSession/closeSession are exposed on the manager', async () => {
    const { manager } = wire('x', { sessions: new InMemoryAISession(() => 't0') });
    const s = await manager.openSession({ tenantId: 'acme', startedBy: 'user' });
    await expect(manager.closeSession(s.id, 'completed')).resolves.toBeUndefined();
  });
});

describe('Capability Registry → AI Manager', () => {
  it('runs a capability through the pipeline (agent never names a model)', async () => {
    const { manager, monitoring } = wire('{"headline":"hi"}');
    const caps = new InMemoryCapabilityRegistry(makeCapabilityExecutor(manager));
    const result = await caps.invoke({ capability: 'copywriting', submittedBy: 'cmo', input: { brief: 'x' } });
    expect(result.output).toBe('{"headline":"hi"}');
    expect(monitoring.snapshot().totalInferences).toBe(1);
  });
});

describe('Tool Registry integration', () => {
  it('records declared tools in the execution trace', async () => {
    const { manager } = wire('ok');
    const exec = await manager.execute({ ...base, variables: { tools: ['markdown'], capabilityId: 'copywriting' } });
    expect(exec.trace.tools).toEqual(['markdown']);
    expect(exec.trace.capability).toBe('copywriting');
  });

  it('rejects a capability that declares an unknown tool', async () => {
    const { manager } = wire('ok');
    await expect(manager.execute({ ...base, variables: { tools: ['ghost'] } })).rejects.toThrow();
  });
});

describe('Queue Manager integration', () => {
  it('enqueues and drains tasks through the pipeline', async () => {
    const queue = new InMemoryQueueManager();
    const { manager, monitoring } = wire('done', { queue });
    await manager.enqueue({ ...base, idempotencyKey: 'a' });
    await manager.enqueue({ ...base, idempotencyKey: 'b' });
    const executions = await manager.drain(() => queue.dequeue());
    expect(executions).toHaveLength(2);
    expect(monitoring.snapshot().totalInferences).toBe(2);
  });
});

describe('Cancellation', () => {
  it('rejects when the signal is already aborted (no successful inference)', async () => {
    const { manager, monitoring } = wire('never');
    const ac = new AbortController();
    ac.abort();
    await expect(manager.execute(base, { signal: ac.signal })).rejects.toThrow();
    expect(monitoring.snapshot().totalInferences).toBe(0);
  });
});
