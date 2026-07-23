import type {
  AIMessage,
  CompanyBrainPort,
  DecisionMemoryPort,
  ExecutiveContextBuilderPort,
  ExecutiveContextRequest,
  ExecutiveMemoryPort,
  Mission,
  PromptRegistryPort,
} from '@ados/contracts';

export interface MissionProvider {
  get(id: string): Promise<Mission | null>;
}

/**
 * Executive Context Builder — assembles the strongest possible context in the
 * mandated order:
 *
 *   Prompt → Mission → Company Brain → Executive Memory → Decision Memory →
 *   Experience Engine → (Prompt Registry rendered) → messages for the AI Manager.
 *
 * Each source contributes a labelled system message so the model sees a clean,
 * auditable context stack rather than an opaque blob.
 */
export class ExecutiveContextBuilder implements ExecutiveContextBuilderPort {
  constructor(
    private readonly deps: {
      prompts: PromptRegistryPort;
      brain: CompanyBrainPort;
      executiveMemory: ExecutiveMemoryPort;
      decisions: DecisionMemoryPort;
      missions?: MissionProvider;
    },
  ) {}

  async build(request: ExecutiveContextRequest): Promise<AIMessage[]> {
    const messages: AIMessage[] = [];

    // 1. Prompt (versioned, from the Prompt Registry) — the base instruction.
    if (request.promptKey) {
      const rendered = await this.deps.prompts.render(request.promptKey, request.variables ?? {});
      messages.push(...rendered);
    }

    // 2. Mission — the objective in the user's words.
    if (request.missionId && this.deps.missions) {
      const mission = await this.deps.missions.get(request.missionId);
      if (mission) messages.push(sys('MISSION', mission.brief));
    }

    // 3. Company Brain — DNA + brand + vertical marketing knowledge.
    const dna = await this.deps.brain.dna(request.brandId);
    if (dna) messages.push(sys('COMPANY DNA', `Tone: ${dna.tone}. Values: ${dna.values.join(', ')}. Writing style: ${dna.writingStyle}. Risk appetite: ${dna.riskAppetite}.`));
    if (request.brandId) {
      const brand = await this.deps.brain.brand(request.brandId);
      if (brand) messages.push(sys('BRAND', `${brand.name} — audience: ${brand.targetAudience}. Forbidden words: ${brand.forbiddenWords.join(', ') || 'none'}.`));
    }
    if (request.vertical) {
      const m = await this.deps.brain.marketing(request.vertical);
      if (m) messages.push(sys('MARKETING KNOWLEDGE', `${request.vertical}: best hook "${m.bestHook}", best headline "${m.bestHeadline}", ROAS ${m.roas.toFixed(1)} over ${m.sampleSize} campaigns.`));
    }

    // 4. Executive Memory — what THIS executive knows.
    const memories = await this.deps.executiveMemory.recall({
      tenantId: request.tenantId,
      role: request.role,
      ...(request.variables?.['topic'] ? { query: String(request.variables['topic']) } : {}),
      k: 5,
    });
    if (memories.length) messages.push(sys(`${request.role.toUpperCase()} MEMORY`, memories.map((m) => `• ${m.content}`).join('\n')));

    // 5. Decision Memory — recent decisions on this mission/subject and their reasons.
    if (request.missionId) {
      const decisions = await this.deps.decisions.recall({ sessionId: request.missionId, k: 5 });
      if (decisions.length) messages.push(sys('RECENT DECISIONS', decisions.map((d) => `• ${d.decision} — ${d.reason}`).join('\n')));
    }

    // 6. Experience Engine — proven approaches to reuse.
    if (request.vertical) {
      const experiences = await this.deps.brain.experience.findSimilar({ vertical: request.vertical, k: 3 });
      if (experiences.length) messages.push(sys('PROVEN EXPERIENCE', experiences.map((e) => `• ${e.learned}`).join('\n')));
    }

    return messages;
  }
}

function sys(label: string, body: string): AIMessage {
  return { role: 'system', content: `[${label}]\n${body}` };
}
