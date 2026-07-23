import { InMemoryEventBus, type EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import {
  BrandService,
  ClientService,
  InMemoryBrandRepository,
  InMemoryClientRepository,
  InMemoryMissionRepository,
  InMemoryProductRepository,
  InMemoryWorkspaceRepository,
  MissionService,
  ProductService,
  WorkspaceService,
} from '@ados/agency-os';

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
  readonly missions: MissionService;

  private readonly tele: Telemetry = telemetry('web');
  private readonly feed: FeedEntry[] = [];
  private readonly maxFeed = 50;

  constructor(bus: EventBus = new InMemoryEventBus()) {
    this.bus = bus;
    this.workspaces = new WorkspaceService(new InMemoryWorkspaceRepository(), bus);
    this.clients = new ClientService(new InMemoryClientRepository(), bus);
    this.brands = new BrandService(new InMemoryBrandRepository(), bus);
    this.products = new ProductService(new InMemoryProductRepository(), bus);
    this.missions = new MissionService(new InMemoryMissionRepository(), bus);
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
