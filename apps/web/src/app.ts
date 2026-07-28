import { randomUUID } from 'node:crypto';
import type { AIManagerPort } from '@ados/contracts';
import { InMemoryEventBus, type EventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { telemetry, type Telemetry } from '@ados/observability';
import {
  ApprovalService,
  AssetService,
  BrandService,
  ClientService,
  MissionService,
  PerformanceReportService,
  ProductService,
  ProjectService,
  WorkspaceService,
} from '@ados/agency-os';
import { MarketingBriefService } from '@ados/marketing-intelligence';
import { CreativeStudioService } from '@ados/creative-studio';
import { CampaignDraftService } from '@ados/campaign-engine';
import { CampaignReportService } from '@ados/analytics-engine';
import { InMemoryCompanyBrain } from '@ados/company-brain';
import { InMemoryDecisionJournal, InMemoryExecutiveMemory } from '@ados/executive-memory';
import { ExecutiveReportService } from '@ados/executive-ai';
import { RegexCreativeSafetyGate } from './safety.js';
import { createOfflineGovernedManager } from './governed-inference.js';
import { StagedAIManager } from './staged-ai-manager.js';
import { defaultStageEngine } from './stage-engine.js';
import { InMemoryExecutionTraceStore } from './execution-trace-store.js';
import { inMemoryRepositories, type RepositoryBundle } from './db/repositories.js';

/** A single event as surfaced on the dashboard activity feed. */
export interface FeedEntry {
  eventName: string;
  tenantId: string;
  occurredAt: string;
}

/**
 * The composition root for the AdOS web app. Wires every onboarding application
 * service over one shared event bus and one repository bundle, and keeps a
 * bounded activity feed so the UI can show that events really fire.
 *
 * The repository bundle defaults to in-memory; production injects the SQL
 * (Postgres) bundle via `main.ts`. Either way repositories are tenant-scoped
 * internally (they read the ambient TenantContext), so sharing a single
 * instance per type across all requests is safe: tenant A never sees tenant B's
 * data.
 */
export class App {
  readonly bus: EventBus;
  readonly workspaces: WorkspaceService;
  readonly clients: ClientService;
  readonly brands: BrandService;
  readonly products: ProductService;
  readonly projects: ProjectService;
  readonly approvals: ApprovalService;
  readonly assets: AssetService;
  readonly performance: PerformanceReportService;
  readonly missions: MissionService;
  readonly briefs: MarketingBriefService;
  readonly creative: CreativeStudioService;
  readonly campaigns: CampaignDraftService;
  readonly reports: CampaignReportService;
  readonly executive: ExecutiveReportService;
  readonly brain: InMemoryCompanyBrain;
  readonly execMemory: InMemoryExecutiveMemory;
  readonly journal: InMemoryDecisionJournal;
  /** Every AI task leaves an auditable ExecutionTrace here (Sprint 4.1). */
  readonly traces: InMemoryExecutionTraceStore;

  private readonly tele: Telemetry = telemetry('web');
  private readonly feed: FeedEntry[] = [];
  private readonly maxFeed = 50;

  constructor(
    bus: EventBus = new InMemoryEventBus(),
    ai: AIManagerPort = createOfflineGovernedManager(),
    repos: RepositoryBundle = inMemoryRepositories(),
  ) {
    this.bus = bus;
    // The Company Brain must exist before the AI wrap: the Stage Engine's
    // governance.observe stage reads its per-vertical marketing memory to ground
    // evidence/confidence/constitution (Sprint 4.3 observe ladder).
    this.brain = new InMemoryCompanyBrain();
    // Run a real Stage Engine around every AI task and seal an ExecutionTrace,
    // without changing generation. Covers the default offline manager and any
    // injected live manager alike (Sprint 4.1 — trace goes live; Sprint 4.2 —
    // orchestration stages run observably around generation; Sprint 4.3 — real
    // governance stages run in observe mode, recorded but never enforced).
    this.traces = new InMemoryExecutionTraceStore();
    ai = new StagedAIManager(ai, this.traces, defaultStageEngine(this.brain));
    this.workspaces = new WorkspaceService(repos.workspaces, bus);
    this.clients = new ClientService(repos.clients, bus);
    this.brands = new BrandService(repos.brands, bus);
    this.products = new ProductService(repos.products, bus);
    this.projects = new ProjectService(repos.projects, bus);
    this.approvals = new ApprovalService(repos.approvals, bus);
    this.assets = new AssetService(repos.assets, bus);
    this.performance = new PerformanceReportService(repos.performance, bus);
    this.missions = new MissionService(repos.missions, bus);
    this.briefs = new MarketingBriefService(repos.briefs, bus, ai);
    this.creative = new CreativeStudioService(repos.creative, bus, ai, new RegexCreativeSafetyGate());
    this.campaigns = new CampaignDraftService(repos.campaigns, bus, ai);
    this.reports = new CampaignReportService(repos.reports, bus, ai);
    this.executive = new ExecutiveReportService(repos.executive, bus, ai);
    this.execMemory = new InMemoryExecutiveMemory();
    this.journal = new InMemoryDecisionJournal();
  }

  /**
   * Publish an integration event for a subsystem that has no service of its own
   * (the Company Brain + Executive Memory stores). Uses the ambient
   * TenantContext for metadata so the event is tenant-scoped and correlated.
   */
  async emit(eventName: string, aggregateId: string, payload: Record<string, unknown> = {}): Promise<void> {
    const ctx = TenantContext.current();
    await this.bus.publish([
      {
        eventName,
        aggregateId,
        payload,
        metadata: {
          eventId: randomUUID(),
          occurredAt: new Date().toISOString(),
          tenantId: ctx?.tenantId ?? 'public',
          correlationId: ctx?.correlationId ?? randomUUID(),
          causationId: undefined,
          actor: ctx?.actor,
        },
      },
    ]);
  }

  /** Subscribe the activity feed + audit log to every domain event. */
  async start(): Promise<void> {
    await this.bus.subscribe('>', async (envelope) => {
      const entry: FeedEntry = {
        eventName: envelope.eventName,
        tenantId: envelope.metadata.tenantId,
        occurredAt: envelope.metadata.occurredAt,
      };
      this.feed.unshift(entry);
      if (this.feed.length > this.maxFeed) this.feed.length = this.maxFeed;
      this.tele.logger.info({ event: entry.eventName, tenantId: entry.tenantId }, 'domain event');
    });
  }

  /** Most recent events for the current tenant, newest first. */
  recentEvents(tenantId: string, limit = 10): FeedEntry[] {
    return this.feed.filter((e) => e.tenantId === tenantId).slice(0, limit);
  }
}
