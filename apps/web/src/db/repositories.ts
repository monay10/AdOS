/**
 * SQL-backed repository adapters + the repository bundle the App composes.
 *
 * Each adapter implements the SAME domain repository port as its in-memory
 * counterpart, delegating to the generic {@link SqlAggregateStore}. The list
 * filters replicate the in-memory adapters' filters exactly (verified by
 * `db/repositories.test.ts` against an embedded SQLite engine), so switching
 * persistence changes durability, never behaviour.
 *
 * The in-memory bundle is the default (see App); the SQL bundle is wired only
 * when DATABASE_URL is set (see main.ts).
 */
import { ok, type AppError, type Result } from '@ados/kernel';
import { SqlAggregateStore, type AggregateCondition } from '@ados/persistence';
import {
  Approval,
  Asset,
  Brand,
  Client,
  InMemoryApprovalRepository,
  InMemoryAssetRepository,
  InMemoryBrandRepository,
  InMemoryClientRepository,
  InMemoryMissionRepository,
  InMemoryPerformanceReportRepository,
  InMemoryProductRepository,
  InMemoryProjectRepository,
  InMemoryWorkspaceRepository,
  Mission,
  PerformanceReport,
  Product,
  Project,
  Workspace,
  type ApprovalRepository,
  type AssetFilter,
  type AssetRepository,
  type BrandRepository,
  type ClientRepository,
  type MissionRepository,
  type PerformanceReportRepository,
  type ProductRepository,
  type ProjectRepository,
  type WorkspaceRepository,
} from '@ados/agency-os';
import { InMemoryMarketingBriefRepository, MarketingBrief, type MarketingBriefRepository } from '@ados/marketing-intelligence';
import { CreativeSet, InMemoryCreativeSetRepository, type CreativeSetRepository } from '@ados/creative-studio';
import { CampaignDraft, InMemoryCampaignDraftRepository, type CampaignDraftRepository } from '@ados/campaign-engine';
import { CampaignReport, InMemoryCampaignReportRepository, type CampaignReportRepository } from '@ados/analytics-engine';
import { ExecutiveReport, InMemoryExecutiveReportRepository, type ExecutiveReportRepository } from '@ados/executive-ai';

/** Everything the App needs to construct its application services. */
export interface RepositoryBundle {
  workspaces: WorkspaceRepository;
  clients: ClientRepository;
  brands: BrandRepository;
  products: ProductRepository;
  projects: ProjectRepository;
  approvals: ApprovalRepository;
  assets: AssetRepository;
  performance: PerformanceReportRepository;
  missions: MissionRepository;
  briefs: MarketingBriefRepository;
  creative: CreativeSetRepository;
  campaigns: CampaignDraftRepository;
  reports: CampaignReportRepository;
  executive: ExecutiveReportRepository;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Restore<A> = (id: string, props: any) => A;

/** Generic CRUD shared by every SQL adapter; concrete adapters add `list`. */
class SqlRepo<A extends { id: { toString(): string }; snapshot(): { tenantId: string } }> {
  constructor(protected readonly store: SqlAggregateStore, protected readonly kind: string, protected readonly restore: Restore<A>) {}

  async findById(id: { toString(): string }): Promise<Result<A | null, AppError>> {
    const row = await this.store.findById(this.kind, id.toString());
    return ok(row ? this.restore(row.id, row.data) : null);
  }

  async save(aggregate: A): Promise<Result<void, AppError>> {
    const snapshot = aggregate.snapshot();
    await this.store.upsert(this.kind, aggregate.id.toString(), snapshot.tenantId, snapshot);
    return ok(undefined);
  }

  async delete(id: { toString(): string }): Promise<Result<void, AppError>> {
    await this.store.delete(this.kind, id.toString());
    return ok(undefined);
  }

  async exists(id: { toString(): string }): Promise<boolean> {
    return this.store.exists(this.kind, id.toString());
  }

  protected async find(conditions: AggregateCondition[]): Promise<A[]> {
    return (await this.store.list(this.kind, conditions)).map((r) => this.restore(r.id, r.data));
  }
}

const eq = (key: string, value: string): AggregateCondition => ({ key, op: '=', value });
const ne = (key: string, value: string): AggregateCondition => ({ key, op: '<>', value });

class SqlWorkspaceRepository extends SqlRepo<Workspace> implements WorkspaceRepository {
  constructor(store: SqlAggregateStore) { super(store, 'workspace', (id, p) => Workspace.restore(id, p)); }
  list(): Promise<Workspace[]> { return this.find([eq('status', 'active')]); }
}

class SqlClientRepository extends SqlRepo<Client> implements ClientRepository {
  constructor(store: SqlAggregateStore) { super(store, 'client', (id, p) => Client.restore(id, p)); }
  list(workspaceId?: string): Promise<Client[]> {
    const conds = [eq('status', 'active')];
    if (workspaceId !== undefined) conds.push(eq('workspaceId', workspaceId));
    return this.find(conds);
  }
}

class SqlBrandRepository extends SqlRepo<Brand> implements BrandRepository {
  constructor(store: SqlAggregateStore) { super(store, 'brand', (id, p) => Brand.restore(id, p)); }
  list(clientId?: string): Promise<Brand[]> {
    const conds = [eq('status', 'active')];
    if (clientId !== undefined) conds.push(eq('clientId', clientId));
    return this.find(conds);
  }
}

class SqlProductRepository extends SqlRepo<Product> implements ProductRepository {
  constructor(store: SqlAggregateStore) { super(store, 'product', (id, p) => Product.restore(id, p)); }
  list(clientId?: string): Promise<Product[]> {
    const conds = [eq('status', 'active')];
    if (clientId !== undefined) conds.push(eq('clientId', clientId));
    return this.find(conds);
  }
}

class SqlProjectRepository extends SqlRepo<Project> implements ProjectRepository {
  constructor(store: SqlAggregateStore) { super(store, 'project', (id, p) => Project.restore(id, p)); }
  list(clientId?: string): Promise<Project[]> {
    const conds = [ne('status', 'archived')];
    if (clientId !== undefined) conds.push(eq('clientId', clientId));
    return this.find(conds);
  }
}

class SqlApprovalRepository extends SqlRepo<Approval> implements ApprovalRepository {
  constructor(store: SqlAggregateStore) { super(store, 'approval', (id, p) => Approval.restore(id, p)); }
  list(projectId?: string): Promise<Approval[]> {
    return this.find(projectId === undefined ? [] : [eq('projectId', projectId)]);
  }
}

class SqlAssetRepository extends SqlRepo<Asset> implements AssetRepository {
  constructor(store: SqlAggregateStore) { super(store, 'asset', (id, p) => Asset.restore(id, p)); }
  list(filter: AssetFilter = {}): Promise<Asset[]> {
    const conds: AggregateCondition[] = [];
    if (filter.clientId !== undefined) conds.push(eq('clientId', filter.clientId));
    if (filter.brandId !== undefined) conds.push(eq('brandId', filter.brandId));
    if (filter.projectId !== undefined) conds.push(eq('projectId', filter.projectId));
    return this.find(conds);
  }
}

class SqlPerformanceReportRepository extends SqlRepo<PerformanceReport> implements PerformanceReportRepository {
  constructor(store: SqlAggregateStore) { super(store, 'performance-report', (id, p) => PerformanceReport.restore(id, p)); }
  list(clientId?: string): Promise<PerformanceReport[]> {
    return this.find(clientId === undefined ? [] : [eq('clientId', clientId)]);
  }
}

class SqlMissionRepository extends SqlRepo<Mission> implements MissionRepository {
  constructor(store: SqlAggregateStore) { super(store, 'mission', (id, p) => Mission.restore(id, p)); }
  list(clientId?: string): Promise<Mission[]> {
    return this.find(clientId === undefined ? [] : [eq('clientId', clientId)]);
  }
}

/** The five AI-artifact repositories all list by optional missionId. */
class SqlMissionScopedRepo<A extends { id: { toString(): string }; snapshot(): { tenantId: string } }> extends SqlRepo<A> {
  list(missionId?: string): Promise<A[]> {
    return this.find(missionId === undefined ? [] : [eq('missionId', missionId)]);
  }
}

class SqlMarketingBriefRepository extends SqlMissionScopedRepo<MarketingBrief> implements MarketingBriefRepository {
  constructor(store: SqlAggregateStore) { super(store, 'marketing-brief', (id, p) => MarketingBrief.restore(id, p)); }
}
class SqlCreativeSetRepository extends SqlMissionScopedRepo<CreativeSet> implements CreativeSetRepository {
  constructor(store: SqlAggregateStore) { super(store, 'creative-set', (id, p) => CreativeSet.restore(id, p)); }
}
class SqlCampaignDraftRepository extends SqlMissionScopedRepo<CampaignDraft> implements CampaignDraftRepository {
  constructor(store: SqlAggregateStore) { super(store, 'campaign-draft', (id, p) => CampaignDraft.restore(id, p)); }
}
class SqlCampaignReportRepository extends SqlMissionScopedRepo<CampaignReport> implements CampaignReportRepository {
  constructor(store: SqlAggregateStore) { super(store, 'campaign-report', (id, p) => CampaignReport.restore(id, p)); }
}
class SqlExecutiveReportRepository extends SqlMissionScopedRepo<ExecutiveReport> implements ExecutiveReportRepository {
  constructor(store: SqlAggregateStore) { super(store, 'executive-report', (id, p) => ExecutiveReport.restore(id, p)); }
}

/** The in-memory bundle — the default; identical to the original App wiring. */
export function inMemoryRepositories(): RepositoryBundle {
  return {
    workspaces: new InMemoryWorkspaceRepository(),
    clients: new InMemoryClientRepository(),
    brands: new InMemoryBrandRepository(),
    products: new InMemoryProductRepository(),
    projects: new InMemoryProjectRepository(),
    approvals: new InMemoryApprovalRepository(),
    assets: new InMemoryAssetRepository(),
    performance: new InMemoryPerformanceReportRepository(),
    missions: new InMemoryMissionRepository(),
    briefs: new InMemoryMarketingBriefRepository(),
    creative: new InMemoryCreativeSetRepository(),
    campaigns: new InMemoryCampaignDraftRepository(),
    reports: new InMemoryCampaignReportRepository(),
    executive: new InMemoryExecutiveReportRepository(),
  };
}

/** The SQL bundle over a shared aggregate store (Postgres in production, SQLite in tests). */
export function sqlRepositories(store: SqlAggregateStore): RepositoryBundle {
  return {
    workspaces: new SqlWorkspaceRepository(store),
    clients: new SqlClientRepository(store),
    brands: new SqlBrandRepository(store),
    products: new SqlProductRepository(store),
    projects: new SqlProjectRepository(store),
    approvals: new SqlApprovalRepository(store),
    assets: new SqlAssetRepository(store),
    performance: new SqlPerformanceReportRepository(store),
    missions: new SqlMissionRepository(store),
    briefs: new SqlMarketingBriefRepository(store),
    creative: new SqlCreativeSetRepository(store),
    campaigns: new SqlCampaignDraftRepository(store),
    reports: new SqlCampaignReportRepository(store),
    executive: new SqlExecutiveReportRepository(store),
  };
}
