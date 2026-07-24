import { randomUUID } from 'node:crypto';
import type { AIManagerPort } from '@ados/contracts';
import { InMemoryEventBus, type EventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { telemetry, type Telemetry } from '@ados/observability';
import {
  BrandService,
  ClientService,
  InMemoryBrandRepository,
  InMemoryClientRepository,
  InMemoryMissionRepository,
  InMemoryProductRepository,
  InMemoryWorkspaceRepository,
  InMemoryProjectRepository,
  MissionService,
  ProductService,
  ProjectService,
  WorkspaceService,
} from '@ados/agency-os';
import { InMemoryMarketingBriefRepository, MarketingBriefService } from '@ados/marketing-intelligence';
import { CreativeStudioService, InMemoryCreativeSetRepository } from '@ados/creative-studio';
import { CampaignDraftService, InMemoryCampaignDraftRepository } from '@ados/campaign-engine';
import { CampaignReportService, InMemoryCampaignReportRepository } from '@ados/analytics-engine';
import { InMemoryCompanyBrain } from '@ados/company-brain';
import { InMemoryDecisionJournal, InMemoryExecutiveMemory } from '@ados/executive-memory';
import { OfflineAIManager } from './ai.js';

/** A single event as surfaced on the dashboard activity feed. */
export interface FeedEntry {
  eventName: string;
  tenantId: string;
  occurredAt: string;
}

/**
 * The composition root for the AdOS web app. Wires every onboarding application
 * service over one shared event bus and one set of in-memory repositories, and
 * keeps a bounded activity feed so the UI can show that events really fire.
 *
 * Repositories are tenant-scoped internally (they read the ambient
 * TenantContext), so sharing a single instance per type across all requests is
 * safe: tenant A never sees tenant B's data.
 */
export class App {
  readonly bus: EventBus;
  readonly workspaces: WorkspaceService;
  readonly clients: ClientService;
  readonly brands: BrandService;
  readonly products: ProductService;
  readonly projects: ProjectService;
  readonly missions: MissionService;
  readonly briefs: MarketingBriefService;
  readonly creative: CreativeStudioService;
  readonly campaigns: CampaignDraftService;
  readonly reports: CampaignReportService;
  readonly brain: InMemoryCompanyBrain;
  readonly execMemory: InMemoryExecutiveMemory;
  readonly journal: InMemoryDecisionJournal;

  private readonly tele: Telemetry = telemetry('web');
  private readonly feed: FeedEntry[] = [];
  private readonly maxFeed = 50;

  constructor(bus: EventBus = new InMemoryEventBus(), ai: AIManagerPort = new OfflineAIManager()) {
    this.bus = bus;
    this.workspaces = new WorkspaceService(new InMemoryWorkspaceRepository(), bus);
    this.clients = new ClientService(new InMemoryClientRepository(), bus);
    this.brands = new BrandService(new InMemoryBrandRepository(), bus);
    this.products = new ProductService(new InMemoryProductRepository(), bus);
    this.projects = new ProjectService(new InMemoryProjectRepository(), bus);
    this.missions = new MissionService(new InMemoryMissionRepository(), bus);
    this.briefs = new MarketingBriefService(new InMemoryMarketingBriefRepository(), bus, ai);
    this.creative = new CreativeStudioService(new InMemoryCreativeSetRepository(), bus, ai);
    this.campaigns = new CampaignDraftService(new InMemoryCampaignDraftRepository(), bus, ai);
    this.reports = new CampaignReportService(new InMemoryCampaignReportRepository(), bus, ai);
    this.brain = new InMemoryCompanyBrain();
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
