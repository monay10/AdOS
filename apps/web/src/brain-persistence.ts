import type {
  BrainEnrichment,
  BrandProfile,
  CompanyBrainPort,
  CompanyDNA,
  CreativeInsight,
  Experience,
  ExperienceEnginePort,
  GraphEdge,
  GraphNode,
  KnowledgeGraphPort,
  MarketingInsight,
  Pattern,
  PatternLibraryPort,
  SalesInsight,
  SopPerformance,
} from '@ados/contracts';
import type { InMemoryCompanyBrain, InMemoryExperienceEngine, InMemoryKnowledgeGraph, InMemoryPatternLibrary } from '@ados/company-brain';
import type { QueryExecutor } from '@ados/persistence';

/** A knowledge-graph snapshot (nodes + edges) as one durable blob. */
export interface GraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Company Brain persistence (Sprint 6 — durable knowledge).
 *
 * The Company Brain is the platform's compounding asset, yet it has lived
 * entirely in RAM: every restart wiped everything it had learned. Slice 1 made
 * the **marketing** store durable (it grounds the governance observe chain);
 * slice 2 extends the same {@link BrainStore} port to the rest of the scalar
 * sub-brains — **creative, SOP, sales, DNA, brand** — so a restart no longer
 * erases them either. The three sub-brains behind their own ports (experience,
 * patterns, graph) remain RAM-only for a later slice.
 *
 * Honest scope: the in-memory brain is a single, process-global instance (NOT
 * tenant-scoped — its stores are keyed by vertical / format / brandId, never by
 * tenant), so persistence faithfully mirrors that global shape. Per-tenant brain
 * isolation is a separate, pre-existing gap tracked in PRODUCT_TRUTH — this slice
 * does not change it.
 */
export interface BrainStore {
  /** Create the schema if absent. Idempotent. */
  init(): Promise<void>;
  saveMarketing(insight: MarketingInsight): Promise<void>;
  loadMarketing(): Promise<MarketingInsight[]>;
  saveCreative(insight: CreativeInsight): Promise<void>;
  loadCreative(): Promise<CreativeInsight[]>;
  saveSop(perf: SopPerformance): Promise<void>;
  loadSop(): Promise<SopPerformance[]>;
  saveSales(insight: SalesInsight): Promise<void>;
  loadSales(): Promise<SalesInsight | null>;
  saveDna(dna: CompanyDNA): Promise<void>;
  loadDna(): Promise<CompanyDNA[]>;
  saveBrand(brand: BrandProfile): Promise<void>;
  loadBrand(): Promise<BrandProfile[]>;
  // Sub-brains are persisted as one JSON blob each (their internal shape is a
  // list / keyed map / node+edge graph, not a flat key-value store).
  saveExperiences(exps: readonly Experience[]): Promise<void>;
  loadExperiences(): Promise<Experience[]>;
  savePatterns(patterns: readonly Pattern[]): Promise<void>;
  loadPatterns(): Promise<Pattern[]>;
  saveGraph(snapshot: GraphSnapshot): Promise<void>;
  loadGraph(): Promise<GraphSnapshot | null>;
}

/** The single global row key for the one-of-a-kind sales sub-brain. */
const SALES_KEY = '__sales__';
/** DNA is keyed by brandId, or this sentinel for company-wide DNA. */
const COMPANY_DNA_KEY = '__company__';
/** Single-row key for a whole-collection sub-brain blob. */
const BLOB_KEY = '__all__';

/** Every brain store is a uniform `(k, data)` key-value table. */
const TABLES = [
  'brain_marketing',
  'brain_creative',
  'brain_sop',
  'brain_sales',
  'brain_dna',
  'brain_brand',
  'brain_experience',
  'brain_pattern',
  'brain_graph',
] as const;

/** {@link BrainStore} over the SQLite/Postgres {@link QueryExecutor} port. */
export class SqlBrainStore implements BrainStore {
  constructor(private readonly db: QueryExecutor) {}

  async init(): Promise<void> {
    for (const table of TABLES) {
      await this.db.execute(`CREATE TABLE IF NOT EXISTS ${table} (k TEXT PRIMARY KEY, data TEXT NOT NULL)`);
    }
  }

  saveMarketing(insight: MarketingInsight): Promise<void> {
    return this.upsert('brain_marketing', insight.vertical, insight);
  }
  loadMarketing(): Promise<MarketingInsight[]> {
    return this.loadAll('brain_marketing');
  }
  saveCreative(insight: CreativeInsight): Promise<void> {
    return this.upsert('brain_creative', insight.format, insight);
  }
  loadCreative(): Promise<CreativeInsight[]> {
    return this.loadAll('brain_creative');
  }
  saveSop(perf: SopPerformance): Promise<void> {
    return this.upsert('brain_sop', perf.sopKey, perf);
  }
  loadSop(): Promise<SopPerformance[]> {
    return this.loadAll('brain_sop');
  }
  saveSales(insight: SalesInsight): Promise<void> {
    return this.upsert('brain_sales', SALES_KEY, insight);
  }
  async loadSales(): Promise<SalesInsight | null> {
    return (await this.loadAll<SalesInsight>('brain_sales'))[0] ?? null;
  }
  saveDna(dna: CompanyDNA): Promise<void> {
    return this.upsert('brain_dna', dna.brandId ?? COMPANY_DNA_KEY, dna);
  }
  loadDna(): Promise<CompanyDNA[]> {
    return this.loadAll('brain_dna');
  }
  saveBrand(brand: BrandProfile): Promise<void> {
    return this.upsert('brain_brand', brand.brandId, brand);
  }
  loadBrand(): Promise<BrandProfile[]> {
    return this.loadAll('brain_brand');
  }
  saveExperiences(exps: readonly Experience[]): Promise<void> {
    return this.upsert('brain_experience', BLOB_KEY, exps);
  }
  async loadExperiences(): Promise<Experience[]> {
    return (await this.loadAll<Experience[]>('brain_experience'))[0] ?? [];
  }
  savePatterns(patterns: readonly Pattern[]): Promise<void> {
    return this.upsert('brain_pattern', BLOB_KEY, patterns);
  }
  async loadPatterns(): Promise<Pattern[]> {
    return (await this.loadAll<Pattern[]>('brain_pattern'))[0] ?? [];
  }
  saveGraph(snapshot: GraphSnapshot): Promise<void> {
    return this.upsert('brain_graph', BLOB_KEY, snapshot);
  }
  async loadGraph(): Promise<GraphSnapshot | null> {
    return (await this.loadAll<GraphSnapshot>('brain_graph'))[0] ?? null;
  }

  /** Upsert one JSON value by key. `excluded.data` binds the JSON param once —
   * the SQLite adapter rewrites `$n`→`?` positionally and does not dedupe a
   * repeated placeholder, so reusing `$2` would leave a `?` unbound. */
  private upsert(table: string, key: string, value: unknown): Promise<void> {
    return this.db
      .execute(
        `INSERT INTO ${table} (k, data) VALUES ($1, $2) ON CONFLICT (k) DO UPDATE SET data = excluded.data`,
        [key, value],
      )
      .then(() => undefined);
  }

  private async loadAll<T>(table: string): Promise<T[]> {
    const rows = await this.db.query<{ data: string }>(`SELECT data FROM ${table}`);
    return rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data) as T);
  }
}

// ── Persistent sub-brain decorators ───────────────────────────────────────────
// Each wraps the concrete in-memory sub-brain and, after any mutation, writes the
// whole collection back as one JSON blob (reads delegate verbatim). Whole-blob
// writes are simple and correct at local scale; incremental rows are a later
// optimization if a brain ever grows large.

class PersistentExperienceEngine implements ExperienceEnginePort {
  constructor(
    private readonly inner: InMemoryExperienceEngine,
    private readonly store: BrainStore,
  ) {}
  async record(exp: Omit<Experience, 'id'>): Promise<void> {
    await this.inner.record(exp);
    await this.store.saveExperiences(this.inner.snapshot());
  }
  findSimilar(query: { vertical: string; context?: Record<string, unknown>; k: number }): Promise<Experience[]> {
    return this.inner.findSimilar(query);
  }
}

class PersistentPatternLibrary implements PatternLibraryPort {
  constructor(
    private readonly inner: InMemoryPatternLibrary,
    private readonly store: BrainStore,
  ) {}
  async capture(pattern: Omit<Pattern, 'id' | 'reuseCount'>): Promise<string> {
    const id = await this.inner.capture(pattern);
    await this.store.savePatterns(this.inner.snapshot());
    return id;
  }
  bestFor(domain: string): Promise<Pattern[]> {
    return this.inner.bestFor(domain);
  }
  get(id: string): Promise<Pattern | null> {
    return this.inner.get(id);
  }
  async markReused(id: string): Promise<void> {
    await this.inner.markReused(id);
    await this.store.savePatterns(this.inner.snapshot());
  }
}

class PersistentKnowledgeGraph implements KnowledgeGraphPort {
  constructor(
    private readonly inner: InMemoryKnowledgeGraph,
    private readonly store: BrainStore,
  ) {}
  async upsertNode(node: GraphNode): Promise<void> {
    await this.inner.upsertNode(node);
    await this.store.saveGraph(this.inner.snapshot());
  }
  async relate(edge: GraphEdge): Promise<void> {
    await this.inner.relate(edge);
    await this.store.saveGraph(this.inner.snapshot());
  }
  neighbors(nodeId: string, relation?: string): Promise<GraphNode[]> {
    return this.inner.neighbors(nodeId, relation);
  }
  query(input: { type?: string; where?: Record<string, unknown> }): Promise<GraphNode[]> {
    return this.inner.query(input);
  }
}

/** A brain that can rehydrate itself from durable storage at startup. */
export interface RestorableBrain {
  restore(): Promise<void>;
}

export function isRestorableBrain(brain: CompanyBrainPort): brain is CompanyBrainPort & RestorableBrain {
  return typeof (brain as Partial<RestorableBrain>).restore === 'function';
}

/**
 * A durable Company Brain: an {@link InMemoryCompanyBrain} kept as the fast
 * in-RAM working set (all reads + the sample-weighted merge stay there,
 * unchanged), with each scalar-store write written through to a {@link BrainStore}
 * and restored on {@link restore}. The three port-backed sub-brains (graph,
 * experience, patterns) delegate verbatim and are not yet durable. Everything
 * else is a transparent decorator — behaviour is identical, it just also
 * survives a restart.
 */
export class PersistentCompanyBrain implements CompanyBrainPort, RestorableBrain {
  private readonly _graph: PersistentKnowledgeGraph;
  private readonly _experience: PersistentExperienceEngine;
  private readonly _patterns: PersistentPatternLibrary;

  constructor(
    private readonly inner: InMemoryCompanyBrain,
    private readonly store: BrainStore,
  ) {
    this._graph = new PersistentKnowledgeGraph(inner.graph, store);
    this._experience = new PersistentExperienceEngine(inner.experience, store);
    this._patterns = new PersistentPatternLibrary(inner.patterns, store);
  }

  // Sub-brains route through their persistent decorators; the read side delegates.
  get graph(): KnowledgeGraphPort {
    return this._graph;
  }
  get experience(): ExperienceEnginePort {
    return this._experience;
  }
  get patterns(): PatternLibraryPort {
    return this._patterns;
  }
  dna(brandId?: string): Promise<CompanyDNA | null> {
    return this.inner.dna(brandId);
  }
  brand(brandId: string): Promise<BrandProfile | null> {
    return this.inner.brand(brandId);
  }
  marketing(vertical: string): Promise<MarketingInsight | null> {
    return this.inner.marketing(vertical);
  }
  creative(format: string): Promise<CreativeInsight | null> {
    return this.inner.creative(format);
  }
  sales(): Promise<SalesInsight | null> {
    return this.inner.sales();
  }
  sop(sopKey: string): Promise<SopPerformance | null> {
    return this.inner.sop(sopKey);
  }

  async setDna(dna: CompanyDNA): Promise<void> {
    await this.inner.setDna(dna);
    await this.store.saveDna(dna);
  }
  async setBrand(brand: BrandProfile): Promise<void> {
    await this.inner.setBrand(brand);
    await this.store.saveBrand(brand);
  }

  /**
   * Enrich in RAM (same merge as before), then persist the merged result so what
   * survives a restart is the accumulated value, not the raw last sample. The
   * `experience` kind is a sub-brain and not yet durable (later slice).
   */
  async enrich(enrichment: BrainEnrichment): Promise<void> {
    await this.inner.enrich(enrichment);
    switch (enrichment.kind) {
      case 'marketing': {
        const merged = await this.inner.marketing(enrichment.insight.vertical);
        if (merged) await this.store.saveMarketing(merged);
        break;
      }
      case 'creative': {
        const merged = await this.inner.creative(enrichment.insight.format);
        if (merged) await this.store.saveCreative(merged);
        break;
      }
      case 'sop': {
        const merged = await this.inner.sop(enrichment.perf.sopKey);
        if (merged) await this.store.saveSop(merged);
        break;
      }
      case 'sales': {
        const settled = await this.inner.sales();
        if (settled) await this.store.saveSales(settled);
        break;
      }
      case 'experience':
        break; // sub-brain — not yet durable
    }
  }

  /** Rehydrate every durable store from storage. Call once at startup. */
  async restore(): Promise<void> {
    await this.store.init();
    const [marketing, creative, sop, sales, dna, brand, experiences, patterns, graph] = await Promise.all([
      this.store.loadMarketing(),
      this.store.loadCreative(),
      this.store.loadSop(),
      this.store.loadSales(),
      this.store.loadDna(),
      this.store.loadBrand(),
      this.store.loadExperiences(),
      this.store.loadPatterns(),
      this.store.loadGraph(),
    ]);
    this.inner.restoreMarketing(marketing);
    this.inner.restoreCreative(creative);
    this.inner.restoreSop(sop);
    this.inner.restoreSales(sales);
    this.inner.restoreDna(dna);
    this.inner.restoreBrand(brand);
    this.inner.experience.restore(experiences);
    this.inner.patterns.restore(patterns);
    if (graph) this.inner.graph.restore(graph);
  }
}
