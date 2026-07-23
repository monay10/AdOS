import { describe, expect, it, vi } from 'vitest';
import type { AITaskResult, ToolDefinition } from '@ados/contracts';
import { InMemoryModelRegistry } from './model-registry.js';
import { CapabilityRouter } from './capability-router.js';
import { InMemoryCapabilityRegistry } from './capability-registry.js';
import { InMemoryToolRegistry } from './tool-registry.js';

describe('CapabilityRouter', () => {
  const registry = new InMemoryModelRegistry();
  const router = new CapabilityRouter(registry);

  it('routes reasoning to the highest-priority reasoning model with fallbacks', () => {
    const decision = router.route({ capability: 'reasoning', submittedBy: 'ceo-agent' });
    expect(decision.primary.capabilities).toContain('reasoning');
    expect(decision.fallbacks.length).toBeGreaterThan(0);
    // primary priority >= any fallback priority
    for (const f of decision.fallbacks) {
      expect(decision.primary.priority).toBeGreaterThanOrEqual(f.priority);
    }
  });

  it('honors a preferModel hint', () => {
    const decision = router.route({
      capability: 'code',
      submittedBy: 'dev-agent',
      hints: { preferModel: 'deepseek-coder:33b' },
    });
    expect(decision.primary.id).toBe('deepseek-coder:33b');
  });

  it('throws when no local model serves the capability', () => {
    const empty = new InMemoryModelRegistry([]);
    const r = new CapabilityRouter(empty);
    expect(() => r.route({ capability: 'chat', submittedBy: 'x' })).toThrow();
  });

  it('disabling a model removes it from routing', () => {
    const reg = new InMemoryModelRegistry();
    reg.setEnabled('flux', false);
    const r = new CapabilityRouter(reg);
    const decision = r.route({ capability: 'image_generation', submittedBy: 'creative' });
    expect(decision.primary.id).toBe('stable-diffusion');
  });
});

describe('InMemoryToolRegistry', () => {
  const clock = (() => {
    let t = 0;
    return () => (t += 5);
  })();
  const echo: ToolDefinition = {
    id: 'echo',
    title: 'Echo',
    description: 'returns its args',
    argsSchema: {},
    sideEffects: 'none',
    handler: async (args) => args,
  };

  it('invokes a tool and times it', async () => {
    const tools = new InMemoryToolRegistry([echo], clock);
    const res = await tools.invoke({ tool: 'echo', args: { a: 1 }, invokedBy: 'seo' });
    expect(res.ok).toBe(true);
    expect(res.output).toEqual({ a: 1 });
    expect(res.durationMs).toBeGreaterThan(0);
  });

  it('captures a failing tool instead of throwing', async () => {
    const tools = new InMemoryToolRegistry(
      [{ ...echo, id: 'boom', handler: async () => { throw new Error('nope'); } }],
      clock,
    );
    const res = await tools.invoke({ tool: 'boom', args: {}, invokedBy: 'x' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('nope');
  });

  it('throws NotFoundError for an unknown tool', async () => {
    const tools = new InMemoryToolRegistry([], clock);
    await expect(tools.invoke({ tool: 'ghost', args: {}, invokedBy: 'x' })).rejects.toThrow();
  });
});

describe('InMemoryCapabilityRegistry', () => {
  const fakeResult = { taskId: 't1', model: 'qwen3:32b' } as unknown as AITaskResult;

  it('seeds core capabilities and invokes via the injected executor (no model named by caller)', async () => {
    const executor = vi.fn(async () => fakeResult);
    const caps = new InMemoryCapabilityRegistry(executor);
    expect(caps.get('seo.analysis')).toBeDefined();

    const result = await caps.invoke({ capability: 'copywriting', submittedBy: 'cmo', input: { brief: 'x' } });
    expect(result).toBe(fakeResult);
    expect(executor).toHaveBeenCalledOnce();
    // The caller passed a capability, never a model.
    expect(executor.mock.calls[0]![0].id).toBe('copywriting');
  });

  it('refuses a disabled capability', async () => {
    const caps = new InMemoryCapabilityRegistry(async () => fakeResult);
    caps.setEnabled('creative.image', false);
    await expect(
      caps.invoke({ capability: 'creative.image', submittedBy: 'creative', input: {} }),
    ).rejects.toThrow();
  });
});
