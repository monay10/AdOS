import type {
  BrainEnrichment,
  BrandProfile,
  CompanyBrainPort,
  CompanyDNA,
  CreativeInsight,
  ExperienceEnginePort,
  KnowledgeGraphPort,
  MarketingInsight,
  PatternLibraryPort,
  SalesInsight,
  SopPerformance,
} from '@ados/contracts';
import type { InMemoryCompanyBrain } from '@ados/company-brain';
import type { QueryExecutor } from '@ados/persistence';

/**
 * Company Brain persistence (Sprint 6, slice 1 — durable marketing memory).
 *
 * The Company Brain is the platform's compounding asset, yet it has lived
 * entirely in RAM: every restart wiped everything it had learned. That most
 * damages the **marketing** sub-brain, because the governance observe chain
 * (`BrainEvidenceEngine`) reads exactly it to ground evidence/confidence/
 * constitution — a wiped brain silently drops every brief back to `no_evidence`.
 *
 * This slice makes the marketing store durable: it is written through on every
 * enrichment (as the already-merged long-run average) and restored on startup.
 * The store is deliberately narrow now; later slices extend it to the other
 * sub-brains behind the same {@link BrainStore} port.
 *
 * Honest scope: the in-memory brain is a single, process-global instance (NOT
 * tenant-scoped — the marketing store is keyed by vertical only), so persistence
 * faithfully mirrors that global shape. Per-tenant brain isolation is a separate,
 * pre-existing gap tracked in PRODUCT_TRUTH — this slice does not change it.
 */
export interface BrainStore {
  /** Create the schema if absent. Idempotent. */
  init(): Promise<void>;
  /** Upsert one already-merged marketing insight, keyed by vertical. */
  saveMarketing(insight: MarketingInsight): Promise<void>;
  /** Load every persisted marketing insight. */
  loadMarketing(): Promise<MarketingInsight[]>;
}

/** {@link BrainStore} over the SQLite/Postgres {@link QueryExecutor} port. */
export class SqlBrainStore implements BrainStore {
  constructor(private readonly db: QueryExecutor) {}

  async init(): Promise<void> {
    await this.db.execute(
      'CREATE TABLE IF NOT EXISTS brain_marketing (vertical TEXT PRIMARY KEY, data TEXT NOT NULL)',
    );
  }

  async saveMarketing(insight: MarketingInsight): Promise<void> {
    // The value column is JSON; the SQLite adapter JSON-serialises object params,
    // so pass the object through and read it back parsed below.
    // `excluded.data` references the attempted-insert row, so the JSON param is
    // bound once — the SQLite adapter rewrites `$n`→`?` positionally and does not
    // dedupe a repeated placeholder, so reusing `$2` would leave a `?` unbound.
    await this.db.execute(
      'INSERT INTO brain_marketing (vertical, data) VALUES ($1, $2) ' +
        'ON CONFLICT (vertical) DO UPDATE SET data = excluded.data',
      [insight.vertical, insight],
    );
  }

  async loadMarketing(): Promise<MarketingInsight[]> {
    const rows = await this.db.query<{ data: string }>('SELECT data FROM brain_marketing');
    return rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data) as MarketingInsight);
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
 * unchanged), with marketing enrichments written through to a {@link BrainStore}
 * and restored on {@link restore}. Everything else delegates verbatim, so this
 * is a transparent decorator — behaviour is identical, it just also survives a
 * restart.
 */
export class PersistentCompanyBrain implements CompanyBrainPort, RestorableBrain {
  constructor(
    private readonly inner: InMemoryCompanyBrain,
    private readonly store: BrainStore,
  ) {}

  // Sub-brains + read side delegate verbatim.
  get graph(): KnowledgeGraphPort {
    return this.inner.graph;
  }
  get experience(): ExperienceEnginePort {
    return this.inner.experience;
  }
  get patterns(): PatternLibraryPort {
    return this.inner.patterns;
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
  setDna(dna: CompanyDNA): Promise<void> {
    return this.inner.setDna(dna);
  }
  setBrand(brand: BrandProfile): Promise<void> {
    return this.inner.setBrand(brand);
  }

  /**
   * Enrich in RAM (same merge as before), then persist the merged marketing
   * result so what survives a restart is the accumulated average, not the raw
   * last sample. Other enrichment kinds are not yet durable (later slices).
   */
  async enrich(enrichment: BrainEnrichment): Promise<void> {
    await this.inner.enrich(enrichment);
    if (enrichment.kind === 'marketing') {
      const merged = await this.inner.marketing(enrichment.insight.vertical);
      if (merged) await this.store.saveMarketing(merged);
    }
  }

  /** Rehydrate the marketing store from durable storage. Call once at startup. */
  async restore(): Promise<void> {
    await this.store.init();
    this.inner.restoreMarketing(await this.store.loadMarketing());
  }
}
