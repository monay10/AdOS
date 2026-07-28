import type { AITaskRequest } from '@ados/contracts';
import type {
  CreativeContent,
  CreativeSafetyGate,
  CreativeSafetyInput,
  CreativeSafetyResult,
} from '@ados/creative-studio';
import { RegexSafetyEngine } from '@ados/ai-manager';

/**
 * Brand-safety gate for generated creative copy — the live wiring of the
 * governed pipeline's safety step into the app's simplified generation path.
 *
 * It reuses the deterministic, offline `RegexSafetyEngine` for PII / secret
 * leakage detection, and enforces the brand's operator-defined banned words on
 * top. Runs before any creative is persisted; a violation blocks the save.
 */
export class RegexCreativeSafetyGate implements CreativeSafetyGate {
  private readonly engine = new RegexSafetyEngine();

  async inspect(content: CreativeContent, input: CreativeSafetyInput): Promise<CreativeSafetyResult> {
    // The engine scans the JSON-serialised copy for PII and leaked secrets.
    const request = { capability: 'chat', submittedBy: 'creative-studio.safety' } as AITaskRequest;
    const verdict = await this.engine.inspectOutput(content, request);
    const issues = verdict.issues.map((i) => `${i.kind}: ${i.detail}`);

    // Brand-forbidden words come from the brand the mission belongs to.
    const haystack = JSON.stringify(content).toLowerCase();
    for (const word of input.bannedWords ?? []) {
      const w = word.trim();
      if (w && haystack.includes(w.toLowerCase())) {
        issues.push(`brand-forbidden word: "${w}"`);
      }
    }

    return { safe: issues.length === 0, issues };
  }
}
