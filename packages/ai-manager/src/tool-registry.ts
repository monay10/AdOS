import type {
  ToolDefinition,
  ToolInvocation,
  ToolRegistryPort,
  ToolResult,
} from '@ados/contracts';
import { NotFoundError } from '@ados/kernel';

/**
 * In-memory Tool Registry. Tools are engine-independent functions; invocation is
 * timed and errors are captured into the ToolResult rather than thrown, so a
 * failing tool never crashes the orchestrating capability.
 *
 * `now` is injected for deterministic tests (no ambient Date.now dependency).
 */
export class InMemoryToolRegistry implements ToolRegistryPort {
  private readonly tools = new Map<string, ToolDefinition>();

  constructor(
    seed: ToolDefinition[] = [],
    private readonly now: () => number = () => Date.now(),
  ) {
    for (const tool of seed) this.tools.set(tool.id, tool);
  }

  register(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  list(filter: { ids?: string[] } = {}): ToolDefinition[] {
    const all = [...this.tools.values()];
    return filter.ids ? all.filter((t) => filter.ids!.includes(t.id)) : all;
  }

  get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  async invoke<T = unknown>(invocation: ToolInvocation): Promise<ToolResult<T>> {
    const tool = this.tools.get(invocation.tool);
    if (!tool) {
      throw new NotFoundError(`Tool "${invocation.tool}" is not registered`, {
        details: { tool: invocation.tool },
      });
    }
    const start = this.now();
    try {
      const output = (await tool.handler(invocation.args)) as T;
      return { tool: tool.id, ok: true, output, durationMs: this.now() - start };
    } catch (e) {
      return {
        tool: tool.id,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        durationMs: this.now() - start,
      };
    }
  }
}
