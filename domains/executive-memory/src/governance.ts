import type {
  AIConstitutionCheckerPort,
  CompanyBrainPort,
  ConstitutionCheckInput,
  ConstitutionVerdict,
} from '@ados/contracts';

export interface ConstitutionCheckerOptions {
  /** Minimum confidence (0..100) an AI output must carry to pass. */
  minConfidence?: number;
  /** Actions that always require human approval regardless of DNA. */
  approvalActions?: string[];
  /** Actions considered high-risk (blocked when DNA risk appetite is low). */
  highRiskActions?: string[];
}

/**
 * AI Constitution Checker — the mandatory gate every AI output passes before it
 * becomes an action. Enforces the Product Constitution at runtime: evidence
 * present, confidence sufficient, Company DNA + brand rules respected, risk and
 * approval policy applied. A failing output is rejected, not executed.
 */
export class ConstitutionChecker implements AIConstitutionCheckerPort {
  private readonly minConfidence: number;
  private readonly approvalActions: Set<string>;
  private readonly highRiskActions: Set<string>;

  constructor(
    private readonly brain: CompanyBrainPort,
    options: ConstitutionCheckerOptions = {},
  ) {
    this.minConfidence = options.minConfidence ?? 70;
    this.approvalActions = new Set(options.approvalActions ?? ['campaign.launch', 'budget.increase', 'contract.sign']);
    this.highRiskActions = new Set(options.highRiskActions ?? ['budget.increase', 'brand.new_direction']);
  }

  async check(input: ConstitutionCheckInput): Promise<ConstitutionVerdict> {
    const violations: string[] = [];

    // 1. Evidence mandate.
    if (!input.evidence || input.evidence.length === 0) violations.push('no_evidence');

    // 2. Confidence mandate.
    if (!input.confidence || input.confidence.score < this.minConfidence) {
      violations.push('insufficient_confidence');
    }

    // 3. Brand rules — forbidden words.
    if (input.content && input.brandId) {
      const brand = await this.brain.brand(input.brandId);
      const text = input.content.toLowerCase();
      const hit = brand?.forbiddenWords.find((w) => text.includes(w.toLowerCase()));
      if (hit) violations.push(`brand_rule:${hit}`);
    }

    // 4. Risk policy vs Company DNA appetite.
    const dna = await this.brain.dna(input.brandId);
    if (this.highRiskActions.has(input.action) && dna?.riskAppetite === 'low') {
      violations.push('risk_policy');
    }

    // 5. Approval gates.
    const requiresApproval =
      this.approvalActions.has(input.action) || (dna?.approvalRules ?? []).includes(input.action);

    return {
      passed: violations.length === 0,
      violations,
      requiresApproval,
      ...(requiresApproval ? { approver: approverFor(input.action) } : {}),
    };
  }
}

function approverFor(action: string): string {
  if (action.startsWith('budget') || action.startsWith('contract')) return 'ceo';
  if (action.startsWith('brand') || action.startsWith('creative')) return 'creative_director';
  return 'ceo';
}
