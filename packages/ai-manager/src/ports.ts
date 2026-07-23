import type {
  AICapability,
  AIMessage,
  AITaskRequest,
  AITaskResult,
  AIStreamChunk,
  CapabilityRegistryPort,
  ToolRegistryPort,
  PromptRegistryPort,
  AISessionPort,
  AITaskGraphPort,
  DecisionMemoryPort,
} from '@ados/contracts';

/**
 * AI Manager internal ports (BOOK 2), aligned to the revised structure:
 *
 *   Model Registry · Capability Registry · Tool Registry · Prompt Registry ·
 *   Memory Registry · Context Builder · Resource Scheduler · Queue Manager ·
 *   Inference Engine · Validation Engine · Safety Engine · Response Formatter ·
 *   Learning Engine · Monitoring · Metrics · Cost Analyzer · Cache · Retry ·
 *   Event Publisher
 *
 * Each is modular, replaceable and independently testable. Only the AI Manager
 * (through these ports) may reach an inference engine. Capabilities and Tools
 * are shared contracts (@ados/contracts) so agents depend on them without
 * importing the AI Manager.
 */

// ── Model Registry ────────────────────────────────────────────────────────────
export interface ModelDescriptor {
  id: string; // "qwen3:32b"
  engine: InferenceEngineId;
  capabilities: AICapability[];
  /** Approx VRAM needed to serve, in GB (0 for CPU-only / API models). */
  vramGb: number;
  quantization?: string;
  contextWindow: number;
  priority: number;
  enabled: boolean;
}

export type InferenceEngineId =
  | 'ollama'
  | 'vllm'
  | 'llamacpp'
  | 'sglang'
  | 'lmstudio'
  | 'comfyui';

export interface ModelRegistryPort {
  register(model: ModelDescriptor): void;
  list(filter?: { capability?: AICapability; enabledOnly?: boolean }): ModelDescriptor[];
  get(id: string): ModelDescriptor | undefined;
  setEnabled(id: string, enabled: boolean): void;
  detectInstalled(): Promise<ModelDescriptor[]>;
}

// ── Model Router ──────────────────────────────────────────────────────────────
export interface RoutingDecision {
  primary: ModelDescriptor;
  fallbacks: ModelDescriptor[];
}
export interface ModelRouterPort {
  route(request: AITaskRequest): RoutingDecision;
}

// ── Resource Scheduler (hardware-profile aware) ───────────────────────────────
export interface HardwareProfile {
  gpu: boolean;
  vramTotalGb: number;
  ramTotalGb: number;
  cpuCores: number;
  /** Which model tiers this machine may run (e.g. exclude 32B on an M4 Air). */
  maxModelVramGb: number;
}
export interface ResourceSnapshot {
  gpuUtil: number;
  vramUsedGb: number;
  vramTotalGb: number;
  cpuUtil: number;
  ramUsedGb: number;
  loadedModels: string[];
  queueDepth: number;
  runningInferences: number;
}
/**
 * Chooses a runnable model for the machine and manages load/unload. Agents never
 * know the hardware — the Scheduler downgrades (e.g. Qwen 32B → 14B) transparently.
 */
export interface ResourceSchedulerPort {
  profile(): Promise<HardwareProfile>;
  snapshot(): Promise<ResourceSnapshot>;
  canFit(model: ModelDescriptor): Promise<boolean>;
  /** Pick the best fallback that fits the machine from a routing decision. */
  select(decision: RoutingDecision): Promise<ModelDescriptor>;
  acquire(model: ModelDescriptor): Promise<ResourceLease>;
}
export interface ResourceLease {
  release(): Promise<void>;
}

// ── Queue Manager ─────────────────────────────────────────────────────────────
export interface QueueManagerPort {
  enqueue(request: AITaskRequest): Promise<{ taskId: string; position: number }>;
  depth(): Promise<number>;
}

// ── Prompt Registry ──────────────────────────────────────────────────────────
// The port + PromptTemplate live in @ados/contracts (it is a separate bounded
// context); the adapter is provided by domains/prompt-registry. Re-exported here
// for convenience so AI Manager wiring has one import surface.
export type { PromptRegistryPort } from '@ados/contracts';

// ── Context Builder (merges memory + RAG + history + brand + campaign) ─────────
export interface ContextBuilderPort {
  build(request: AITaskRequest): Promise<AIMessage[]>;
}

// ── Memory Registry ───────────────────────────────────────────────────────────
export type MemoryScope =
  | 'short_term' | 'long_term' | 'semantic' | 'brand' | 'campaign' | 'agent' | 'shared';
export interface MemoryRecord {
  id: string;
  scope: MemoryScope;
  ownerId: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}
export interface MemoryRegistryPort {
  remember(record: Omit<MemoryRecord, 'id' | 'createdAt'>): Promise<void>;
  recall(query: { scope: MemoryScope; ownerId: string; query: string; k: number }): Promise<MemoryRecord[]>;
  forget(id: string): Promise<void>;
}

// ── Safety Engine ─────────────────────────────────────────────────────────────
export interface SafetyVerdict {
  safe: boolean;
  issues: Array<{ kind: 'prompt_injection' | 'pii' | 'secret' | 'permission' | 'file_access'; detail: string }>;
}
export interface SafetyEnginePort {
  inspectInput(request: AITaskRequest): Promise<SafetyVerdict>;
  inspectOutput(output: unknown, request: AITaskRequest): Promise<SafetyVerdict>;
}

// ── Validation Engine ─────────────────────────────────────────────────────────
export interface ValidationEnginePort {
  validate<T>(output: unknown, request: AITaskRequest): { ok: true; value: T } | { ok: false; error: string };
}

// ── Response Formatter ────────────────────────────────────────────────────────
export interface ResponseFormatterPort {
  /** Coerce raw model text into the capability's declared output shape. */
  format<T>(raw: string, request: AITaskRequest): { ok: true; value: T } | { ok: false; error: string };
}

// ── Monitoring + Metrics ──────────────────────────────────────────────────────
export interface MonitoringPort {
  recordInference(sample: {
    model: string;
    engine: InferenceEngineId;
    capability: AICapability;
    latencyMs: number;
    promptTokens: number;
    completionTokens: number;
    cached: boolean;
    ok: boolean;
  }): void;
}

// ── Cost Analyzer (offline: compute + energy, not $ per API call) ─────────────
export interface CostAnalyzerPort {
  /** Estimate local cost (GPU-seconds, energy, queue time) for a task. */
  estimate(request: AITaskRequest, model: ModelDescriptor): Promise<{ gpuSeconds: number; energyWh: number }>;
  record(actual: { taskId: string; gpuSeconds: number; energyWh: number }): void;
}

// ── Learning Engine ───────────────────────────────────────────────────────────
export interface LearningEnginePort {
  observe(signal: { promptKey: string; model: string; reward: number; metadata?: Record<string, unknown> }): Promise<void>;
  suggest(promptKey: string): Promise<{ model?: string; promptVersion?: number } | null>;
}

// ── Event Publisher (emits ai.* lifecycle events to the bus) ──────────────────
export interface AiEventPublisherPort {
  taskSubmitted(taskId: string, request: AITaskRequest): Promise<void>;
  taskCompleted(result: AITaskResult): Promise<void>;
  taskFailed(taskId: string, error: string): Promise<void>;
}

// ── Inference Engine adapter (the ONLY thing that talks to a model) ───────────
export interface InferenceEnginePort {
  readonly id: InferenceEngineId;
  health(): Promise<{ ok: boolean; detail?: string }>;
  complete(input: {
    model: string;
    messages: AIMessage[];
    maxTokens?: number;
    temperature?: number;
    signal?: AbortSignal;
  }): Promise<{ text: string; promptTokens: number; completionTokens: number }>;
  stream(input: {
    model: string;
    messages: AIMessage[];
    maxTokens?: number;
    temperature?: number;
    signal?: AbortSignal;
  }): AsyncIterable<AIStreamChunk>;
  embed?(input: { model: string; texts: string[] }): Promise<number[][]>;
}

/** Everything the AI Manager wires together (the revised Book 2 structure). */
export interface AIManagerModules {
  models: ModelRegistryPort;
  capabilities: CapabilityRegistryPort; // shared contract
  tools: ToolRegistryPort; // shared contract
  prompts: PromptRegistryPort;
  memory: MemoryRegistryPort;
  context: ContextBuilderPort;
  scheduler: ResourceSchedulerPort;
  queue: QueueManagerPort;
  router: ModelRouterPort;
  safety: SafetyEnginePort;
  validation: ValidationEnginePort;
  formatter: ResponseFormatterPort;
  monitoring: MonitoringPort;
  cost: CostAnalyzerPort;
  learning: LearningEnginePort;
  events: AiEventPublisherPort;
  sessions: AISessionPort; // shared contract
  graphs: AITaskGraphPort; // shared contract
  decisions: DecisionMemoryPort; // shared contract
  engines: Map<InferenceEngineId, InferenceEnginePort>;
}

export type { AITaskRequest, AITaskResult, AIStreamChunk };
