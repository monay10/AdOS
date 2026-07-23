import type { AICapability } from '@ados/contracts';
import type { InferenceEngineId, ModelDescriptor, ModelRegistryPort } from './ports.js';

/**
 * The locally-installed model inventory, expressed as data (never hardcoded
 * business logic). Operators edit this seed or the registry at runtime; the
 * Router consults it purely by capability, so swapping a model requires zero
 * agent changes.
 */
export const INSTALLED_MODELS: ModelDescriptor[] = [
  m('qwen3:32b', 'ollama', ['chat', 'reasoning', 'code', 'classification', 'extraction'], 24, 40_960, 90, 'Q4_K_M'),
  m('deepseek-r1:32b', 'ollama', ['reasoning', 'chat', 'extraction'], 24, 65_536, 88, 'Q4_K_M'),
  m('gemma3:27b', 'ollama', ['chat', 'vision', 'classification'], 20, 128_000, 80, 'Q4_K_M'),
  m('phi4', 'ollama', ['chat', 'classification', 'extraction'], 10, 16_384, 70, 'Q4_K_M'),
  m('llama3', 'ollama', ['chat'], 8, 8_192, 65, 'Q4_K_M'),
  m('mistral', 'ollama', ['chat'], 8, 32_768, 60, 'Q4_K_M'),
  m('qwen2.5-coder:32b', 'ollama', ['code'], 24, 32_768, 92, 'Q4_K_M'),
  m('deepseek-coder:33b', 'ollama', ['code'], 24, 16_384, 85, 'Q4_K_M'),
  m('bge-m3', 'ollama', ['embedding'], 2, 8_192, 85),
  m('nomic-embed-text', 'ollama', ['embedding'], 1, 8_192, 80),
  m('flux', 'comfyui', ['image_generation'], 12, 0, 90),
  m('stable-diffusion', 'comfyui', ['image_generation'], 6, 0, 75),
];

function m(
  id: string,
  engine: InferenceEngineId,
  capabilities: AICapability[],
  vramGb: number,
  contextWindow: number,
  priority: number,
  quantization?: string,
): ModelDescriptor {
  return {
    id,
    engine,
    capabilities,
    vramGb,
    contextWindow,
    priority,
    enabled: true,
    ...(quantization ? { quantization } : {}),
  };
}

/**
 * In-memory Model Registry. Swap for a Postgres/SQLite-backed adapter in
 * production; the port stays identical.
 */
export class InMemoryModelRegistry implements ModelRegistryPort {
  private readonly models = new Map<string, ModelDescriptor>();

  constructor(seed: ModelDescriptor[] = INSTALLED_MODELS) {
    for (const model of seed) this.models.set(model.id, model);
  }

  register(model: ModelDescriptor): void {
    this.models.set(model.id, model);
  }

  list(filter: { capability?: AICapability; enabledOnly?: boolean } = {}): ModelDescriptor[] {
    let out = [...this.models.values()];
    if (filter.enabledOnly) out = out.filter((x) => x.enabled);
    if (filter.capability) out = out.filter((x) => x.capabilities.includes(filter.capability!));
    return out.sort((a, b) => b.priority - a.priority);
  }

  get(id: string): ModelDescriptor | undefined {
    return this.models.get(id);
  }

  setEnabled(id: string, enabled: boolean): void {
    const model = this.models.get(id);
    if (model) this.models.set(id, { ...model, enabled });
  }

  async detectInstalled(): Promise<ModelDescriptor[]> {
    // A production adapter probes each engine (e.g. GET /api/tags on Ollama) and
    // reconciles. The in-memory registry returns its current enabled inventory.
    return this.list({ enabledOnly: true });
  }
}
