/**
 * Company Brain — what the company KNOWS (distinct from the Cognitive Core,
 * which is HOW it thinks).
 *
 * PRODUCT CONSTITUTION (Compounding Company):
 *   Every completed task enriches the Company Brain. The platform's value comes
 *   from accumulated knowledge and experience, not from the underlying model.
 *
 * Agents know nothing on their own — they ASK the Company Brain, which returns
 * data the Cognitive Core reasons over and the AI Manager acts on.
 */

// ── Company DNA — the character of a brand/company (the "soul") ────────────────
export interface CompanyDNA {
  tenantId: string;
  brandId?: string;
  mission: string;
  vision: string;
  culture: string;
  values: string[];
  tone: string;
  brandRules: string[];
  writingStyle: string;
  approvalRules: string[];
  qualityStandards: string[];
  namingStandards: string[];
  designLanguage: string;
  riskAppetite: 'low' | 'medium' | 'high';
  decisionStyle: string;
}

// ── Brand Brain ───────────────────────────────────────────────────────────────
export interface BrandProfile {
  brandId: string;
  name: string;
  logoRef?: string;
  toneOfVoice: string;
  forbiddenWords: string[];
  targetAudience: string;
  colors: string[];
  products: string[];
  campaignHistoryRefs: string[];
  approvedCreativeRefs: string[];
}

// ── Marketing Brain — sector performance that grows for years ─────────────────
export interface MarketingInsight {
  vertical: string; // "dental", "restaurant", ...
  ctr: number;
  cpa: number;
  roas: number;
  bestHook: string;
  bestHeadline: string;
  bestOffer: string;
  bestFunnel: string;
  bestCreativeRef?: string;
  sampleSize: number;
}

// ── Creative Brain — design memory ────────────────────────────────────────────
export interface CreativeInsight {
  format: string; // "carousel", "video", "banner", ...
  sampleSize: number;
  bestColor: string;
  bestFont: string;
  bestCta: string;
  bestThumbnailRef?: string;
}

// ── Sales Brain ───────────────────────────────────────────────────────────────
export interface SalesInsight {
  conversionRate: number;
  price?: number;
  objections: string[];
  bestResponses: string[];
}

// ── SOP Brain — SOPs learn too ────────────────────────────────────────────────
export interface SopPerformance {
  sopKey: string;
  version: number;
  successRate: number; // 0..1
  sampleSize: number;
}

// ── Knowledge Graph — everything is connected ─────────────────────────────────
export interface GraphNode {
  id: string;
  type: string; // Customer, Brand, Product, Campaign, Ad, Lead, Sale, ROI, Department, Employee, Task, Workflow
  props: Record<string, unknown>;
}
export interface GraphEdge {
  from: string;
  to: string;
  relation: string; // "owns", "ran", "produced", "converted_to", ...
}
export interface KnowledgeGraphPort {
  upsertNode(node: GraphNode): Promise<void>;
  relate(edge: GraphEdge): Promise<void>;
  neighbors(nodeId: string, relation?: string): Promise<GraphNode[]>;
  query(input: { type?: string; where?: Record<string, unknown> }): Promise<GraphNode[]>;
}

// ── Experience Engine — the most valuable module long-term ────────────────────
export interface Experience {
  id: string;
  tenantId: string;
  vertical: string;
  context: Record<string, unknown>; // e.g. { format: "video", length: 15 }
  action: string; // what was tried
  result: Record<string, number>; // e.g. { ctr: 6 }
  reason: string; // why it worked / failed
  learned: string;
  reusableAs?: string; // pattern id it became
  at: string;
}
export interface ExperienceEnginePort {
  record(exp: Omit<Experience, 'id'>): Promise<void>;
  /** Retrieve experiences most similar to a context (for reuse, not from scratch). */
  findSimilar(query: { vertical: string; context?: Record<string, unknown>; k: number }): Promise<Experience[]>;
}

// ── Pattern Library — reuse winning structures instead of generating anew ─────
export interface Pattern {
  id: string;
  domain: string; // vertical
  name: string;
  structure: string[]; // ordered steps, e.g. ["15s video", "first 3s food", "CTA reservation"]
  evidence: { sampleSize: number; metric: string; value: number };
  reuseCount: number;
}
export interface PatternLibraryPort {
  capture(pattern: Omit<Pattern, 'id' | 'reuseCount'>): Promise<string>;
  bestFor(domain: string): Promise<Pattern[]>;
  get(id: string): Promise<Pattern | null>;
  markReused(id: string): Promise<void>;
}

// ── Enrichment — the write side (every task enriches the brain) ───────────────
export type BrainEnrichment =
  | { kind: 'marketing'; insight: MarketingInsight }
  | { kind: 'creative'; insight: CreativeInsight }
  | { kind: 'sales'; insight: SalesInsight }
  | { kind: 'sop'; perf: SopPerformance }
  | { kind: 'experience'; experience: Omit<Experience, 'id'> };

/**
 * The unified Company Brain API. The whole system requests knowledge from here
 * (GetBrand / GetCampaignHistory / GetBestHeadline / GetBestCTR / GetCompetitor
 * / GetSOP / GetPolicy) and enriches it after every task.
 */
export interface CompanyBrainPort {
  // read side
  dna(brandId?: string): Promise<CompanyDNA | null>;
  brand(brandId: string): Promise<BrandProfile | null>;
  marketing(vertical: string): Promise<MarketingInsight | null>;
  creative(format: string): Promise<CreativeInsight | null>;
  sales(): Promise<SalesInsight | null>;
  sop(sopKey: string): Promise<SopPerformance | null>;
  readonly graph: KnowledgeGraphPort;
  readonly experience: ExperienceEnginePort;
  readonly patterns: PatternLibraryPort;
  // write side — Constitution: every completed task enriches the brain
  enrich(enrichment: BrainEnrichment): Promise<void>;
  setDna(dna: CompanyDNA): Promise<void>;
  setBrand(brand: BrandProfile): Promise<void>;
}

export const COMPANY_BRAIN = Symbol.for('ados.CompanyBrain');
