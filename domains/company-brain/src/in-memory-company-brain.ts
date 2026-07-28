import type {
  BrainEnrichment,
  BrandProfile,
  CompanyBrainPort,
  CompanyDNA,
  CreativeInsight,
  MarketingInsight,
  SalesInsight,
  SopPerformance,
} from '@ados/contracts';
import { InMemoryExperienceEngine } from './experience-engine.js';
import { InMemoryPatternLibrary } from './pattern-library.js';
import { InMemoryKnowledgeGraph } from './knowledge-graph.js';

/**
 * In-memory Company Brain — the unified knowledge API the whole system queries
 * and enriches. Sub-brains that accumulate metrics (Marketing/Creative/Sales/
 * SOP) merge new samples with a sample-weighted average so knowledge grows and
 * stabilizes over time rather than being overwritten by the latest data point.
 *
 * This is a real, tested facade; a production adapter swaps the stores for
 * durable ones (LanceDB/FAISS + Postgres + a graph store) behind the same port.
 */
export class InMemoryCompanyBrain implements CompanyBrainPort {
  // Concrete types (still satisfy the port) so a persistence decorator can reach
  // the snapshot/restore seams the ports do not expose (Sprint 6).
  readonly graph: InMemoryKnowledgeGraph = new InMemoryKnowledgeGraph();
  readonly experience: InMemoryExperienceEngine;
  readonly patterns: InMemoryPatternLibrary = new InMemoryPatternLibrary();

  private dnaStore = new Map<string, CompanyDNA>();
  private brandStore = new Map<string, BrandProfile>();
  private marketingStore = new Map<string, MarketingInsight>();
  private creativeStore = new Map<string, CreativeInsight>();
  private salesStore: SalesInsight | null = null;
  private sopStore = new Map<string, SopPerformance>();

  constructor(now: () => string = () => new Date().toISOString()) {
    this.experience = new InMemoryExperienceEngine(now);
  }

  // ── read side ───────────────────────────────────────────────────────────────
  async dna(brandId?: string): Promise<CompanyDNA | null> {
    return this.dnaStore.get(brandId ?? '__company__') ?? null;
  }
  async brand(brandId: string): Promise<BrandProfile | null> {
    return this.brandStore.get(brandId) ?? null;
  }
  async marketing(vertical: string): Promise<MarketingInsight | null> {
    return this.marketingStore.get(vertical) ?? null;
  }

  // ── restore side (Sprint 6 persistence) ──────────────────────────────────────
  // Seed already-merged/settled values directly, WITHOUT re-merging — used to
  // restore a persisted brain at startup. Persisted values are the accumulated
  // long-run averages (or the settled DNA/brand), so merging again would
  // double-count sample weight.
  restoreMarketing(insights: readonly MarketingInsight[]): void {
    for (const insight of insights) this.marketingStore.set(insight.vertical, insight);
  }
  restoreCreative(insights: readonly CreativeInsight[]): void {
    for (const insight of insights) this.creativeStore.set(insight.format, insight);
  }
  restoreSop(perfs: readonly SopPerformance[]): void {
    for (const perf of perfs) this.sopStore.set(perf.sopKey, perf);
  }
  restoreSales(insight: SalesInsight | null): void {
    this.salesStore = insight;
  }
  restoreDna(dnas: readonly CompanyDNA[]): void {
    for (const dna of dnas) this.dnaStore.set(dna.brandId ?? '__company__', dna);
  }
  restoreBrand(brands: readonly BrandProfile[]): void {
    for (const brand of brands) this.brandStore.set(brand.brandId, brand);
  }
  async creative(format: string): Promise<CreativeInsight | null> {
    return this.creativeStore.get(format) ?? null;
  }
  async sales(): Promise<SalesInsight | null> {
    return this.salesStore;
  }
  async sop(sopKey: string): Promise<SopPerformance | null> {
    return this.sopStore.get(sopKey) ?? null;
  }

  // ── write side (Constitution: every completed task enriches the brain) ───────
  async setDna(dna: CompanyDNA): Promise<void> {
    this.dnaStore.set(dna.brandId ?? '__company__', dna);
  }
  async setBrand(brand: BrandProfile): Promise<void> {
    this.brandStore.set(brand.brandId, brand);
  }

  async enrich(enrichment: BrainEnrichment): Promise<void> {
    switch (enrichment.kind) {
      case 'marketing': {
        const prev = this.marketingStore.get(enrichment.insight.vertical);
        this.marketingStore.set(enrichment.insight.vertical, mergeMarketing(prev, enrichment.insight));
        break;
      }
      case 'creative': {
        const prev = this.creativeStore.get(enrichment.insight.format);
        this.creativeStore.set(
          enrichment.insight.format,
          prev && prev.sampleSize >= enrichment.insight.sampleSize ? prev : enrichment.insight,
        );
        break;
      }
      case 'sales':
        this.salesStore = enrichment.insight;
        break;
      case 'sop':
        this.sopStore.set(enrichment.perf.sopKey, mergeSop(this.sopStore.get(enrichment.perf.sopKey), enrichment.perf));
        break;
      case 'experience':
        await this.experience.record(enrichment.experience);
        break;
    }
  }
}

/** Sample-weighted merge so long-run averages dominate single data points. */
function mergeMarketing(prev: MarketingInsight | undefined, next: MarketingInsight): MarketingInsight {
  if (!prev) return next;
  const total = prev.sampleSize + next.sampleSize || 1;
  const wavg = (a: number, b: number) => (a * prev.sampleSize + b * next.sampleSize) / total;
  return {
    ...next,
    ctr: wavg(prev.ctr, next.ctr),
    cpa: wavg(prev.cpa, next.cpa),
    roas: wavg(prev.roas, next.roas),
    sampleSize: total,
    // Keep the better-performing qualitative winners from the larger sample.
    bestHook: next.sampleSize >= prev.sampleSize ? next.bestHook : prev.bestHook,
    bestHeadline: next.sampleSize >= prev.sampleSize ? next.bestHeadline : prev.bestHeadline,
  };
}

function mergeSop(prev: SopPerformance | undefined, next: SopPerformance): SopPerformance {
  if (!prev || prev.version !== next.version) return next;
  const total = prev.sampleSize + next.sampleSize || 1;
  return {
    ...next,
    successRate: (prev.successRate * prev.sampleSize + next.successRate * next.sampleSize) / total,
    sampleSize: total,
  };
}
