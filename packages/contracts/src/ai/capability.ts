import type { AICapability, AITaskResult } from './ai-task.js';

/**
 * Capability — the permanent unit of "what the company can do".
 *
 * PRODUCT CONSTITUTION (Capability Primacy):
 *   Every intelligence capability is represented as a Capability, never as a
 *   specific model, engine, or tool. Models are replaceable. Tools are
 *   replaceable. Capabilities are PERMANENT. Agents request Capabilities;
 *   Capabilities orchestrate Tools; the AI Manager selects the implementation.
 *   Business logic must never depend on a specific model, engine, or tool.
 *
 * Two tiers:
 *   • Business Capability (this file): "seo.analysis", "copywriting",
 *     "competitor.analysis", "proposal.writing" — stable, domain-level.
 *   • Model capability (AICapability in ai-task.ts): "chat", "reasoning",
 *     "image_generation" — the low-level trait the Router maps to a model.
 *
 * A business Capability declares which model capability(ies) it needs, which
 * tools it may use, and which versioned prompt drives it. Swapping the model or
 * a tool behind a Capability requires ZERO changes to any agent.
 */

/** Stable dotted id, e.g. "seo.analysis", "creative.image", "sales.proposal". */
export type CapabilityId = string;

export interface CapabilityDefinition {
  id: CapabilityId;
  title: string;
  description: string;
  /** Low-level model capability this maps to (drives model routing). */
  modelCapability: AICapability;
  /** Tool ids this capability is permitted to orchestrate. */
  tools: string[];
  /** Versioned prompt (owned by the Prompt Registry) that drives it. */
  promptKey?: string;
  /** JSON schema the output must satisfy (enforced by Validation Engine). */
  outputSchema?: Record<string, unknown>;
  /** Coarse permission gate; the caller must hold this to invoke. */
  requiredPermission?: string;
  enabled: boolean;
}

export interface CapabilityInvocation {
  capability: CapabilityId;
  submittedBy: string;
  input: Record<string, unknown>;
  /** Correlates all tasks of one mission/session (see AISession). */
  sessionId?: string;
  timeoutMs?: number;
}

/**
 * The registry agents actually talk to. `invoke` resolves the Capability to an
 * implementation and executes it through the AI Manager (model + tools + prompt
 * + context + validation). Agents never name a model.
 */
export interface CapabilityRegistryPort {
  register(def: CapabilityDefinition): void;
  list(filter?: { enabledOnly?: boolean }): CapabilityDefinition[];
  get(id: CapabilityId): CapabilityDefinition | undefined;
  setEnabled(id: CapabilityId, enabled: boolean): void;
  invoke<T = unknown>(invocation: CapabilityInvocation): Promise<AITaskResult<T>>;
}

export const CAPABILITY_REGISTRY = Symbol.for('ados.CapabilityRegistry');

/**
 * The canonical seed of business Capabilities the company exposes. This is data
 * (never hardcoded logic); operators add/disable capabilities at runtime.
 */
export const CORE_CAPABILITIES: ReadonlyArray<Omit<CapabilityDefinition, 'enabled'>> = [
  { id: 'seo.analysis', title: 'SEO Analysis', description: 'Audit and analyze SEO for a site/keyword set.', modelCapability: 'reasoning', tools: ['crawler', 'markdown', 'browser'] },
  { id: 'ads.google', title: 'Google Ads Ops', description: 'Plan and optimize Google Ads campaigns.', modelCapability: 'reasoning', tools: ['google_ads'] },
  { id: 'ads.meta', title: 'Meta Ads Ops', description: 'Plan and optimize Meta/Instagram/Facebook campaigns.', modelCapability: 'reasoning', tools: ['meta_ads'] },
  { id: 'copywriting', title: 'Copywriting', description: 'Write headlines, CTAs, body copy.', modelCapability: 'chat', tools: [] },
  { id: 'creative.image', title: 'Image Generation', description: 'Generate images/banners/logos.', modelCapability: 'image_generation', tools: ['comfyui'] },
  { id: 'creative.video', title: 'Video Generation', description: 'Generate short-form video assets.', modelCapability: 'image_generation', tools: ['comfyui'] },
  { id: 'doc.ocr', title: 'OCR', description: 'Extract text from images/scans.', modelCapability: 'vision', tools: ['ocr'] },
  { id: 'audio.stt', title: 'Speech To Text', description: 'Transcribe audio.', modelCapability: 'transcription', tools: ['whisper'] },
  { id: 'audio.tts', title: 'Text To Speech', description: 'Synthesize narration/voice.', modelCapability: 'speech', tools: ['piper'] },
  { id: 'brand.analysis', title: 'Brand Analysis', description: 'Analyze brand positioning and voice.', modelCapability: 'reasoning', tools: ['crawler', 'pdf_reader'] },
  { id: 'competitor.analysis', title: 'Competitor Analysis', description: 'Analyze competitors and market position.', modelCapability: 'reasoning', tools: ['crawler', 'browser'] },
  { id: 'sales.proposal', title: 'Proposal Writing', description: 'Draft client proposals.', modelCapability: 'chat', tools: ['pdf_reader'] },
  { id: 'ops.meeting_summary', title: 'Meeting Summary', description: 'Summarize meetings/notes.', modelCapability: 'chat', tools: [] },
];
