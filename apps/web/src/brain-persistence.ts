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
import type { BrainSnapshot, InMemoryCompanyBrain } from '@ados/company-brain';
import type { QueryExecutor } from '@ados/persistence';

/**
 * Company Brain persistence (Sprint 6 — durable knowledge; tenant-aware).
 *
 * The Company Brain is the platform's compounding asset, yet it lived in RAM and
 * was wiped on restart. This makes it durable and — since the brain is now
 * tenant-isolated — the persisted snapshot is tenant-keyed, so restoring keeps
 * each tenant's memory separate. The whole brain is stored as ONE JSON blob
 * (`BrainSnapshot`, keyed by tenant), rewritten on every mutation and restored at
 * startup. Simple and correct at local scale; incremental writes are a later
 * optimization. 100% local (`node:sqlite`, a file) — no server, no API.
 */
export interface BrainStore {
  init(): Promise<void>;
  save(snapshot: BrainSnapshot): Promise<void>;
  load(): Promise<BrainSnapshot | null>;
}

const BLOB_KEY = '__all__';

/** {@link BrainStore} over the SQLite/Postgres {@link QueryExecutor} port. */
export class SqlBrainStore implements BrainStore {
  constructor(private readonly db: QueryExecutor) {}

  async init(): Promise<void> {
    await this.db.execute('CREATE TABLE IF NOT EXISTS brain_state (k TEXT PRIMARY KEY, data TEXT NOT NULL)');
  }

  async save(snapshot: BrainSnapshot): Promise<void> {
    await this.db.execute(
      'INSERT INTO brain_state (k, data) VALUES ($1, $2) ON CONFLICT (k) DO UPDATE SET data = excluded.data',
      [BLOB_KEY, snapshot],
    );
  }

  async load(): Promise<BrainSnapshot | null> {
    const rows = await this.db.query<{ data: string }>('SELECT data FROM brain_state');
    const row = rows[0];
    if (!row) return null;
    return (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as BrainSnapshot;
  }
}

/** A brain that can rehydrate itself from durable storage at startup. */
export interface RestorableBrain {
  restore(): Promise<void>;
}

export function isRestorableBrain(brain: CompanyBrainPort): brain is CompanyBrainPort & RestorableBrain {
  return typeof (brain as Partial<RestorableBrain>).restore === 'function';
}

// ── Persistent sub-brain decorators ───────────────────────────────────────────
// Each delegates reads/writes to the CURRENT tenant's sub-brain (resolved through
// the inner brain's tenant-scoped getters) and persists the whole snapshot after
// any mutation.

class PersistentExperienceEngine implements ExperienceEnginePort {
  constructor(
    private readonly inner: InMemoryCompanyBrain,
    private readonly persist: () => Promise<void>,
  ) {}
  async record(exp: Omit<Experience, 'id'>): Promise<void> {
    await this.inner.experience.record(exp);
    await this.persist();
  }
  findSimilar(query: { vertical: string; context?: Record<string, unknown>; k: number }): Promise<Experience[]> {
    return this.inner.experience.findSimilar(query);
  }
}

class PersistentPatternLibrary implements PatternLibraryPort {
  constructor(
    private readonly inner: InMemoryCompanyBrain,
    private readonly persist: () => Promise<void>,
  ) {}
  async capture(pattern: Omit<Pattern, 'id' | 'reuseCount'>): Promise<string> {
    const id = await this.inner.patterns.capture(pattern);
    await this.persist();
    return id;
  }
  bestFor(domain: string): Promise<Pattern[]> {
    return this.inner.patterns.bestFor(domain);
  }
  get(id: string): Promise<Pattern | null> {
    return this.inner.patterns.get(id);
  }
  async markReused(id: string): Promise<void> {
    await this.inner.patterns.markReused(id);
    await this.persist();
  }
}

class PersistentKnowledgeGraph implements KnowledgeGraphPort {
  constructor(
    private readonly inner: InMemoryCompanyBrain,
    private readonly persist: () => Promise<void>,
  ) {}
  async upsertNode(node: GraphNode): Promise<void> {
    await this.inner.graph.upsertNode(node);
    await this.persist();
  }
  async relate(edge: GraphEdge): Promise<void> {
    await this.inner.graph.relate(edge);
    await this.persist();
  }
  neighbors(nodeId: string, relation?: string): Promise<GraphNode[]> {
    return this.inner.graph.neighbors(nodeId, relation);
  }
  query(input: { type?: string; where?: Record<string, unknown> }): Promise<GraphNode[]> {
    return this.inner.graph.query(input);
  }
}

/**
 * A durable Company Brain: a transparent decorator over the tenant-isolated
 * {@link InMemoryCompanyBrain} that writes the whole (tenant-keyed) snapshot
 * through on every mutation and restores it at startup. Reads and the
 * sample-weighted merge are unchanged — it just also survives a restart.
 */
export class PersistentCompanyBrain implements CompanyBrainPort, RestorableBrain {
  private readonly _graph: PersistentKnowledgeGraph;
  private readonly _experience: PersistentExperienceEngine;
  private readonly _patterns: PersistentPatternLibrary;

  constructor(
    private readonly inner: InMemoryCompanyBrain,
    private readonly store: BrainStore,
  ) {
    const persist = () => this.persist();
    this._graph = new PersistentKnowledgeGraph(inner, persist);
    this._experience = new PersistentExperienceEngine(inner, persist);
    this._patterns = new PersistentPatternLibrary(inner, persist);
  }

  private persist(): Promise<void> {
    return this.store.save(this.inner.snapshot());
  }

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
    await this.persist();
  }
  async setBrand(brand: BrandProfile): Promise<void> {
    await this.inner.setBrand(brand);
    await this.persist();
  }
  async enrich(enrichment: BrainEnrichment): Promise<void> {
    await this.inner.enrich(enrichment);
    await this.persist();
  }

  /** Rehydrate the whole tenant-keyed brain from storage. Call once at startup. */
  async restore(): Promise<void> {
    await this.store.init();
    const snapshot = await this.store.load();
    if (snapshot) this.inner.hydrate(snapshot);
  }
}
