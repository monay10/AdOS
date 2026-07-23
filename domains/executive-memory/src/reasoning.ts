import type {
  CompanyBrainPort,
  ConfidenceAssessment,
  ConfidenceEnginePort,
  EvidenceEnginePort,
  EvidenceRef,
} from '@ados/contracts';

/**
 * Evidence Engine — grounds every claim in the Company Brain. No recommendation
 * is ever "the LLM said so": it cites marketing insight, proven patterns, and
 * similar past experiences with weights.
 */
export class BrainEvidenceEngine implements EvidenceEnginePort {
  constructor(private readonly brain: CompanyBrainPort) {}

  async gather(input: {
    claim: string;
    vertical?: string;
    context?: Record<string, unknown>;
  }): Promise<EvidenceRef[]> {
    const evidence: EvidenceRef[] = [];
    if (!input.vertical) return evidence;

    const marketing = await this.brain.marketing(input.vertical);
    if (marketing) {
      evidence.push({
        source: 'marketing_brain',
        ref: input.vertical,
        detail: `ROAS ${marketing.roas.toFixed(1)}, CTR ${marketing.ctr.toFixed(1)} over ${marketing.sampleSize} campaigns`,
        weight: confidenceFromSample(marketing.sampleSize),
      });
    }

    const patterns = await this.brain.patterns.bestFor(input.vertical);
    for (const p of patterns.slice(0, 3)) {
      evidence.push({
        source: 'pattern',
        ref: p.id,
        detail: `${p.name}: ${p.evidence.metric} ${p.evidence.value} (${p.evidence.sampleSize} samples)`,
        weight: confidenceFromSample(p.evidence.sampleSize),
      });
    }

    const experiences = await this.brain.experience.findSimilar({
      vertical: input.vertical,
      ...(input.context ? { context: input.context } : {}),
      k: 3,
    });
    for (const e of experiences) {
      evidence.push({ source: 'experience', ref: e.id, detail: e.learned, weight: 0.5 });
    }

    return evidence;
  }
}

/**
 * Confidence Engine — turns evidence into a score + human-readable basis.
 * AdOS never says "I think"; it says "94% — based on 382 campaigns, ROAS 5.8".
 */
export class HeuristicConfidenceEngine implements ConfidenceEnginePort {
  assess(input: {
    evidence: EvidenceRef[];
    priorSuccessRate?: number;
    sampleSize?: number;
    roas?: number;
  }): ConfidenceAssessment {
    if (input.evidence.length === 0) {
      return {
        score: 15,
        reason: 'No supporting evidence found; confidence is minimal.',
        basis: { sampleSize: input.sampleSize ?? 0 },
      };
    }

    const avgWeight = input.evidence.reduce((s, e) => s + e.weight, 0) / input.evidence.length;
    const breadth = Math.min(1, input.evidence.length / 5); // more independent sources → higher
    const success = input.priorSuccessRate ?? avgWeight;

    // Blend: evidence strength, breadth of sources, and prior success rate.
    const score = Math.round(clamp01(0.5 * avgWeight + 0.2 * breadth + 0.3 * success) * 100);

    const parts = [`${input.evidence.length} evidence sources`];
    if (input.sampleSize) parts.push(`${input.sampleSize} campaigns`);
    if (input.roas !== undefined) parts.push(`ROAS ${input.roas.toFixed(1)}`);
    if (input.priorSuccessRate !== undefined) parts.push(`success rate ${Math.round(input.priorSuccessRate * 100)}%`);

    return {
      score,
      reason: `Based on ${parts.join(', ')}.`,
      basis: {
        sampleSize: input.sampleSize ?? 0,
        ...(input.roas !== undefined ? { roas: input.roas } : {}),
        ...(input.priorSuccessRate !== undefined ? { successRate: input.priorSuccessRate } : {}),
      },
    };
  }
}

function confidenceFromSample(n: number): number {
  return Math.min(1, n / 100);
}
function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
