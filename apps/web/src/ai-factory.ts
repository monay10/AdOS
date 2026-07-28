import type { AIManagerPort } from '@ados/contracts';
import { OllamaEngine, OpenAICompatibleEngine, type InferenceEnginePort, type InferenceEngineId } from '@ados/ai-manager';
import { type LiveAIConfig } from './ai-live.js';
import { createOfflineGovernedManager, createLiveGovernedManager } from './governed-inference.js';
import { currentLocale, languageName } from './i18n.js';

/**
 * Choose the AI Manager from the environment. Everything is 100% local — a
 * local inference engine on the operator's own machine or the offline
 * deterministic stub. There is NO cloud provider and NO API key anywhere.
 *
 * Env:
 *   AI_ENGINE     — "offline" (default), or a LOCAL engine: "ollama" | "vllm" |
 *                   "lmstudio" | "llamacpp" | "sglang".
 *   AI_BASE_URL   — local engine URL (default: ollama http://localhost:11434,
 *                   OpenAI-compatible http://localhost:8000).
 *   AI_MODEL      — default local model (default "qwen2.5:7b").
 *   AI_TEMPERATURE — sampling temperature (default 0.2 for structured output).
 *
 * Unset / "offline" keeps the deterministic OfflineAIManager, so tests and
 * no-model-server dev runs are unchanged.
 */
export function createAIManager(log: (msg: string) => void = () => {}): AIManagerPort {
  const kind = (process.env['AI_ENGINE'] ?? 'offline').toLowerCase();
  if (kind === 'offline' || kind === '') {
    log('AI_ENGINE offline — governed runtime over the deterministic engine (no model server)');
    return createOfflineGovernedManager();
  }

  const engine = buildLocalEngine(kind);
  const config: LiveAIConfig = {
    defaultModel: process.env['AI_MODEL'] ?? 'qwen2.5:7b',
    temperature: process.env['AI_TEMPERATURE'] ? Number.parseFloat(process.env['AI_TEMPERATURE']) : 0.2,
    // AI answers in the visitor's language (resolved from the browser/OS), so
    // the generated ads match the UI language.
    resolveLanguage: () => languageName(currentLocale()),
  };
  log(`AI_ENGINE ${engine.id} (local, governed runtime) — model ${config.defaultModel}`);
  return createLiveGovernedManager(engine, config);
}

/** Build a LOCAL inference engine. Ollama or any OpenAI-compatible local server. */
function buildLocalEngine(kind: string): InferenceEnginePort {
  const baseUrl = process.env['AI_BASE_URL'];
  switch (kind) {
    case 'ollama':
      return new OllamaEngine(baseUrl ?? 'http://localhost:11434');
    case 'vllm':
    case 'lmstudio':
    case 'llamacpp':
    case 'sglang':
      // Local OpenAI-compatible HTTP servers. No API key — these run on localhost.
      return new OpenAICompatibleEngine(kind as InferenceEngineId, baseUrl ?? 'http://localhost:8000');
    default:
      throw new Error(`unknown AI_ENGINE "${kind}" (expected: offline | ollama | vllm | lmstudio | llamacpp | sglang)`);
  }
}
