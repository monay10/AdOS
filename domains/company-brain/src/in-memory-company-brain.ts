import type {
  BrainEnrichment,
  BrandProfile,
  CompanyBrainPort,
  CompanyDNA,
  CreativeInsight,
  Experience,
  GraphEdge,
  GraphNode,
  MarketingInsight,
  Pattern,
  SalesInsight,
  SopPerformance,
} from '@ados/contracts';
import { TenantContext } from '@ados/tenancy';
import { InMemoryExperienceEngine } from './experience-engine.js';
import { InMemoryPatternLibrary } from './pattern-library.js';
import { InMemoryKnowledgeGraph } from './knowledge-graph.js';

/** One tenant's private Company Brain — its own sub-brains and stores. */
class TenantBrain {
  readonly graph = new InMemoryKnowledgeGraph();
  readonly experience: InMemoryExperienceEngine;
  readonly patterns = new InMemoryPatternLibrary();
  readonly dna = new Map<string, CompanyDNA>();
  readonly brand = new Map<string, BrandProfile>();
  readonly marketing = new Map<string, MarketingInsight>();
  readonly creative = new Map<string, CreativeInsight>();
  sales: SalesInsight | null = null;
  readonly sop = new Map<string, SopPerformance>();
  constructor(now: () => string) {
    this.experience = new InMemoryExperienceEngine(now);
  }
}

/** One tenant's full brain state, for durable snapshot/restore. */
export interface TenantBrainSnapshot {
  marketing: MarketingInsight[];
  creative: CreativeInsight[];
  sop: SopPerformance[];
  sales: SalesInsight | null;
  dna: CompanyDNA[];
  brand: BrandProfile[];
  experiences: Experience[];
  patterns: Pattern[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
}

/** The whole brain, keyed by tenant. */
export type BrainSnapshot = Record<string, TenantBrainSnapshot>;

const COMPANY_DNA_KEY = '__company__';

/**
 * In-memory Company Brain — the unified knowledge API the whole system queries
 * and enriches. **Tenant-isolated:** every read and write is scoped to the
 * ambient `TenantContext` (like the repositories), so one tenant's accumulated
 * memory — marketing/creative/sales/SOP/DNA/brand plus the experience, pattern,
 * and knowledge-graph sub-brains — is never visible to another. Sub-brains that
 * accumulate metrics merge new samples with a sample-weighted average so
 * knowledge grows and stabilizes over time rather than being overwritten.
 *
 * This is a real, tested facade; a production adapter swaps the stores for
 * durable ones (LanceDB/FAISS + Postgres + a graph store) behind the same port.
 */
export class InMemoryCompanyBrain implements CompanyBrainPort {
  private readonly byTenant = new Map<string, TenantBrain>();

  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  private tenantId(): string {
    return TenantContext.current()?.tenantId ?? 'public';
  }
  /** The current tenant's brain (created on first use). */
  private mine(): TenantBrain {
    return this.forTenant(this.tenantId());
  }
  private forTenant(tenantId: string): TenantBrain {
    let b = this.byTenant.get(tenantId);
    if (!b) {
      b = new TenantBrain(this.now);
      this.byTenant.set(tenantId, b);
    }
    return b;
  }

  // Sub-brains resolve to the CURRENT tenant's instances.
  get graph(): InMemoryKnowledgeGraph {
    return this.mine().graph;
  }
  get experience(): InMemoryExperienceEngine {
    return this.mine().experience;
  }
  get patterns(): InMemoryPatternLibrary {
    return this.mine().patterns;
  }

  // ── read side (tenant-scoped) ────────────────────────────────────────────────
  async dna(brandId?: string): Promise<CompanyDNA | null> {
    return this.mine().dna.get(brandId ?? COMPANY_DNA_KEY) ?? null;
  }
  async brand(brandId: string): Promise<BrandProfile | null> {
    return this.mine().brand.get(brandId) ?? null;
  }
  async marketing(vertical: string): Promise<MarketingInsight | null> {
    return this.mine().marketing.get(vertical) ?? null;
  }
  async creative(format: string): Promise<CreativeInsight | null> {
    return this.mine().creative.get(format) ?? null;
  }
  async sales(): Promise<SalesInsight | null> {
    return this.mine().sales;
  }
  async sop(sopKey: string): Promise<SopPerformance | null> {
    return this.mine().sop.get(sopKey) ?? null;
  }

  // ── write side (Constitution: every completed task enriches the brain) ───────
  async setDna(dna: CompanyDNA): Promise<void> {
    this.mine().dna.set(dna.brandId ?? COMPANY_DNA_KEY, dna);
  }
  async setBrand(brand: BrandProfile): Promise<void> {
    this.mine().brand.set(brand.brandId, brand);
  }

  async enrich(enrichment: BrainEnrichment): Promise<void> {
    const b = this.mine();
    switch (enrichment.kind) {
      case 'marketing': {
        const prev = b.marketing.get(enrichment.insight.vertical);
        b.marketing.set(enrichment.insight.vertical, mergeMarketing(prev, enrichment.insight));
        break;
      }
      case 'creative': {
        const prev = b.creative.get(enrichment.insight.format);
        b.creative.set(
          enrichment.insight.format,
          prev && prev.sampleSize >= enrichment.insight.sampleSize ? prev : enrichment.insight,
        );
        break;
      }
      case 'sales':
        b.sales = enrichment.insight;
        break;
      case 'sop':
        b.sop.set(enrichment.perf.sopKey, mergeSop(b.sop.get(enrichment.perf.sopKey), enrichment.perf));
        break;
      case 'experience':
        await b.experience.record(enrichment.experience);
        break;
    }
  }

  // ── snapshot / restore (Sprint 6 persistence, tenant-keyed) ──────────────────
  snapshot(): BrainSnapshot {
    const out: BrainSnapshot = {};
    for (const [tenantId, b] of this.byTenant) {
      out[tenantId] = {
        marketing: [...b.marketing.values()],
        creative: [...b.creative.values()],
        sop: [...b.sop.values()],
        sales: b.sales,
        dna: [...b.dna.values()],
        brand: [...b.brand.values()],
        experiences: b.experience.snapshot(),
        patterns: b.patterns.snapshot(),
        graph: b.graph.snapshot(),
      };
    }
    return out;
  }

  /**
   * Replace all state from a durable snapshot. Seeds already-merged values (no
   * re-merge). Named `hydrate` (not `restore`) so it never collides with a
   * persistence decorator's parameterless `restore()` under a duck-typed check.
   */
  hydrate(snapshot: BrainSnapshot): void {
    for (const [tenantId, s] of Object.entries(snapshot)) {
      const b = this.forTenant(tenantId);
      for (const m of s.marketing) b.marketing.set(m.vertical, m);
      for (const c of s.creative) b.creative.set(c.format, c);
      for (const p of s.sop) b.sop.set(p.sopKey, p);
      b.sales = s.sales;
      for (const d of s.dna) b.dna.set(d.brandId ?? COMPANY_DNA_KEY, d);
      for (const br of s.brand) b.brand.set(br.brandId, br);
      b.experience.restore(s.experiences);
      b.patterns.restore(s.patterns);
      b.graph.restore(s.graph);
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
