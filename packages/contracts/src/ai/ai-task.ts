/**
 * AI Task contract — the ONLY way any agent asks for AI work.
 *
 * PRODUCT CONSTITUTION (golden rule):
 *   No agent may talk to Ollama, vLLM, llama.cpp, SGLang, LM Studio, ComfyUI,
 *   Whisper, Piper or any inference engine directly. Agents submit an AITask to
 *   the AI Manager, which selects the model, builds context, enforces safety,
 *   validates the response, records memory, and emits metrics.
 *
 * This decoupling means models are fully replaceable without touching agents.
 */

/** What the task needs done — drives model routing, not a specific model. */
export type AICapability =
  | 'chat' // conversational / instruction following
  | 'reasoning' // long chain-of-thought planning/analysis
  | 'code' // code generation
  | 'embedding' // vectorization for RAG / semantic search
  | 'vision' // image understanding
  | 'image_generation' // text -> image (Flux / SD via ComfyUI)
  | 'transcription' // speech -> text (Whisper)
  | 'speech' // text -> speech (Piper / XTTS)
  | 'classification'
  | 'extraction'; // structured data extraction

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

/**
 * Request the caller submits. `promptRef` points at a versioned prompt owned by
 * the Prompt Manager (prompts are never hardcoded); `context` is assembled by
 * the Context Manager. Callers may pass raw messages for ad-hoc tasks.
 */
export interface AITaskRequest {
  /** Capability required. The Router maps this to a concrete local model. */
  capability: AICapability;
  /** Which agent/component submitted this (for metrics, permissions, learning). */
  submittedBy: string;
  /** Versioned prompt reference, e.g. { key: "ceo.system", version: 8 }. */
  promptRef?: { key: string; version?: number };
  /** Variables interpolated into the referenced prompt template. */
  variables?: Record<string, unknown>;
  /** Explicit messages (used when no promptRef, or appended after it). */
  messages?: AIMessage[];
  /** Free-form inputs for non-chat capabilities (image prompt, audio bytes ref). */
  input?: Record<string, unknown>;
  /** JSON schema the response MUST satisfy; enforced by the Validation Manager. */
  responseSchema?: Record<string, unknown>;
  /** Hints the Router MAY honor. Never a hard dependency on a specific model. */
  hints?: { preferModel?: string; maxTokens?: number; temperature?: number };
  /** Deadline for the whole task including retries/failover. */
  timeoutMs?: number;
  /** Idempotency + prompt-cache key. */
  idempotencyKey?: string;
}

export interface AITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AITaskResult<T = unknown> {
  taskId: string;
  capability: AICapability;
  /** Concrete local model that served the request (e.g. "qwen3:32b"). */
  model: string;
  engine: 'ollama' | 'vllm' | 'llamacpp' | 'sglang' | 'lmstudio' | 'comfyui';
  /** Validated output. Shape depends on capability / responseSchema. */
  output: T;
  usage: AITokenUsage;
  latencyMs: number;
  /** True when served from the prompt/token cache. */
  cached: boolean;
  /** Models tried (the fallback chain audit). `tries` is the engine-call count
   * for that model — 1 = no retry, >1 = retried transient failures, 0 = skipped
   * before any call. Optional so non-pipeline managers need not set it. */
  attempts: Array<{ model: string; ok: boolean; error?: string; tries?: number }>;
}

export interface AIStreamChunk {
  taskId: string;
  delta: string;
  done: boolean;
}

/**
 * The AI Manager's public port — the "clean internal API" agents depend on.
 * Implementation lives in @ados/ai-manager and is the only code that reaches an
 * inference engine.
 */
export interface AIManagerPort {
  submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>>;
  stream(request: AITaskRequest): AsyncIterable<AIStreamChunk>;
}

export const AI_MANAGER = Symbol.for('ados.AIManager');
