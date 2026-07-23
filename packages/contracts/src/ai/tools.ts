/**
 * Tool Registry — engine-independent capabilities-as-code.
 *
 * Tools (PDF Reader, Crawler, OCR, Markdown, Excel/CSV, Filesystem, Git, SQLite,
 * ComfyUI, Whisper, Browser…) are deterministic side-effecting functions the
 * company can call. They are decoupled from the AI Manager: a Capability
 * orchestrates Tools, and the AI Manager (or a Cognitive Core plan) decides when
 * to invoke them. Tools are replaceable; business logic references them only by
 * stable id.
 */
export interface ToolDefinition {
  id: string; // "pdf_reader", "crawler", "ocr", ...
  title: string;
  description: string;
  /** JSON schema for the tool's arguments. */
  argsSchema: Record<string, unknown>;
  /** Coarse permission required to invoke (checked by the sandbox). */
  requiredPermission?: string;
  /** Whether the tool performs external I/O (affects offline gating + sandbox). */
  sideEffects: 'none' | 'read' | 'write' | 'network';
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface ToolInvocation {
  tool: string;
  args: Record<string, unknown>;
  invokedBy: string;
  sessionId?: string;
}

export interface ToolResult<T = unknown> {
  tool: string;
  ok: boolean;
  output?: T;
  error?: string;
  durationMs: number;
}

export interface ToolRegistryPort {
  register(tool: ToolDefinition): void;
  list(filter?: { ids?: string[] }): ToolDefinition[];
  get(id: string): ToolDefinition | undefined;
  invoke<T = unknown>(invocation: ToolInvocation): Promise<ToolResult<T>>;
}

export const TOOL_REGISTRY = Symbol.for('ados.ToolRegistry');
