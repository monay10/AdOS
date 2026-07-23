import type { AppError, Result } from '@ados/kernel';
import type { AIManagerPort } from '@ados/contracts';
import { InMemoryEventBus, type EventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import {
  BrandService,
  ClientService,
  InMemoryBrandRepository,
  InMemoryClientRepository,
  InMemoryMissionRepository,
  InMemoryProductRepository,
  InMemoryWorkspaceRepository,
  MissionService,
  MissionWizard,
  ProductService,
  WorkspaceService,
} from '@ados/agency-os';
import { InMemoryMarketingBriefRepository, MarketingBriefService } from '@ados/marketing-intelligence';
import { CreativeStudioService, InMemoryCreativeSetRepository } from '@ados/creative-studio';
import { CampaignDraftService, InMemoryCampaignDraftRepository } from '@ados/campaign-engine';
import { CampaignReportService, InMemoryCampaignReportRepository } from '@ados/analytics-engine';
import { ExecutiveReportService, InMemoryExecutiveReportRepository } from '@ados/executive-ai';

/** Unwrap a Result or throw a labelled error — fail fast in the demo harness. */
function must<T>(step: string, r: Result<T, AppError>): T {
  if (r.isErr) throw new Error(`[${step}] ${r.error.message}`);
  return r.value;
}

export interface FirstCampaignResult {
  workspaceId: string;
  clientId: string;
  brandId: string;
  productId: string;
  missionId: string;
  briefId: string;
  creativeSetId: string;
  campaignDraftId: string;
  reportId: string;
  executiveReportId: string;
  verdict: string;
  /** Every event that crossed the bus, in order — the choreography audit. */
  events: string[];
}

export interface FirstCampaignInput {
  tenantId: string;
  actor: string;
  clientName: string;
}

/**
 * The AdOS acceptance flow: a brand-new customer enters the system and the AI
 * Company produces their first campaign, entirely offline. Every step goes
 * through a bounded context's public application service; the contexts talk to
 * each other only through the shared event bus, and every AI step goes through
 * the AI Manager port. If this runs error-free, the first version is ready.
 *
 *   Workspace → Client → Brand → Product → Mission → Marketing Brief →
 *   Creative → Campaign Draft → Analytics → Executive Report
 */
export async function runFirstCampaign(
  input: FirstCampaignInput,
  ai: AIManagerPort,
  bus: EventBus = new InMemoryEventBus(),
): Promise<FirstCampaignResult> {
  const events: string[] = [];
  await bus.subscribe('>', async (e) => {
    events.push(e.eventName);
  });

  // Compose every context's service over the shared bus + AI Manager.
  const workspaces = new WorkspaceService(new InMemoryWorkspaceRepository(), bus);
  const clients = new ClientService(new InMemoryClientRepository(), bus);
  const brands = new BrandService(new InMemoryBrandRepository(), bus);
  const products = new ProductService(new InMemoryProductRepository(), bus);
  const missions = new MissionService(new InMemoryMissionRepository(), bus);
  const briefs = new MarketingBriefService(new InMemoryMarketingBriefRepository(), bus, ai);
  const creative = new CreativeStudioService(new InMemoryCreativeSetRepository(), bus, ai);
  const campaigns = new CampaignDraftService(new InMemoryCampaignDraftRepository(), bus, ai);
  const reports = new CampaignReportService(new InMemoryCampaignReportRepository(), bus, ai);
  const executive = new ExecutiveReportService(new InMemoryExecutiveReportRepository(), bus, ai);

  const ctx = { tenantId: input.tenantId, correlationId: 'first-campaign', actor: input.actor, roles: [] as string[] };

  return TenantContext.run(ctx, async () => {
    // 1) Workspace
    const workspace = must(
      'workspace',
      await workspaces.create({ tenantId: input.tenantId, name: `${input.clientName} Workspace` }),
    );

    // 2) Client
    const client = must(
      'client',
      await clients.create({
        tenantId: input.tenantId,
        workspaceId: workspace.id.toString(),
        name: input.clientName,
        industry: 'healthcare',
        contact: { email: 'owner@brightsmiles.example' },
      }),
    );

    // 3) Brand
    const brand = must(
      'brand',
      await brands.create({
        tenantId: input.tenantId,
        clientId: client.id.toString(),
        name: 'Bright Smiles',
        profile: { voice: 'warm and trustworthy', values: ['care', 'expertise'], targetAudience: 'local families' },
        rules: { bannedWords: ['cheap'] },
      }),
    );

    // 4) Product
    const product = must(
      'product',
      await products.create({
        tenantId: input.tenantId,
        clientId: client.id.toString(),
        name: 'Whitening Treatment',
        description: 'Professional in-clinic teeth whitening',
        categories: ['dental', 'cosmetic'],
        pricing: { model: 'one_time', amount: { amountMinor: 12_900_00, currency: 'TRY' } },
      }),
    );

    // 5) Mission (via the Mission Wizard)
    const wizard = MissionWizard.start({
      tenantId: input.tenantId,
      workspaceId: workspace.id.toString(),
      clientId: client.id.toString(),
      createdBy: input.actor,
    })
      .withObjective('Acquire new patients for a dental clinic opening next month')
      .withBudget({ amountMinor: 8_000_000, currency: 'TRY', period: 'monthly' })
      .withTarget({ name: 'leads', target: 120, unit: 'count' });
    const mission = must('mission', await missions.submit(wizard));
    must('mission.plan', await missions.plan(mission.id));

    // 6) Marketing Brief — the system starts to think
    const brief = must(
      'brief',
      await briefs.generate({
        tenantId: input.tenantId,
        missionId: mission.id.toString(),
        clientId: client.id.toString(),
        clientName: client.name,
        industry: client.industry,
        brandVoice: brand.profile.voice,
        brandValues: [...brand.profile.values],
        productName: product.name,
        productDescription: product.description,
        missionBrief: mission.brief,
        budget: { amountMinor: 8_000_000, currency: 'TRY', period: 'monthly' },
      }),
    );

    // Strategy & budget approval gate before creative production.
    must('mission.request_strategy', await missions.requestApproval(mission.id, 'strategy_and_budget'));
    must('mission.approve_strategy', await missions.approve(mission.id, 'strategy_and_budget'));

    // 7) Creative Studio
    const creativeSet = must(
      'creative',
      await creative.generate({
        tenantId: input.tenantId,
        missionId: mission.id.toString(),
        clientId: client.id.toString(),
        briefId: brief.id.toString(),
        productName: product.name,
        brandVoice: brand.profile.voice,
        objective: brief.content.objective,
        targetAudience: brief.content.targetAudience,
        positioning: brief.content.positioning,
        keyMessages: [...brief.content.keyMessages],
      }),
    );

    // 8) Campaign Draft
    const draft = must(
      'campaign',
      await campaigns.draft({
        tenantId: input.tenantId,
        missionId: mission.id.toString(),
        clientId: client.id.toString(),
        briefId: brief.id.toString(),
        creativeSetId: creativeSet.id.toString(),
        objective: brief.content.objective,
        targetAudience: brief.content.targetAudience,
        recommendedChannels: [...brief.content.recommendedChannels],
        budgetAllocation: brief.content.budgetAllocation.map((b) => ({ ...b })),
        totalBudget: { amountMinor: 8_000_000, currency: 'TRY' },
        headline: creativeSet.content.headline,
        adCopy: creativeSet.content.adCopy,
        cta: creativeSet.content.cta,
      }),
    );

    // Launch approval gate, then the mission executes.
    must('mission.request_launch', await missions.requestApproval(mission.id, 'campaign_launch'));
    must('mission.approve_launch', await missions.approve(mission.id, 'campaign_launch'));
    must('mission.execute', await missions.startExecuting(mission.id));

    // 9) Analytics — deterministic KPIs + AI narrative over simulated results.
    const report = must(
      'report',
      await reports.generate({
        tenantId: input.tenantId,
        missionId: mission.id.toString(),
        clientId: client.id.toString(),
        campaignDraftId: draft.id.toString(),
        impressions: 100_000,
        clicks: 2_000,
        conversions: 100,
        leads: 130,
        spend: { amountMinor: 8_000_000, currency: 'TRY' },
        revenue: { amountMinor: 24_000_000, currency: 'TRY' },
      }),
    );

    // 10) Executive Report — the CEO's synthesis and the final deliverable.
    const executiveReport = must(
      'executive',
      await executive.generate({
        tenantId: input.tenantId,
        missionId: mission.id.toString(),
        clientId: client.id.toString(),
        clientName: client.name,
        missionBrief: mission.brief,
        objective: brief.content.objective,
        reportId: report.id.toString(),
        kpis: report.kpis.map((k) => ({ ...k })),
        reportSummary: report.narrative.summary,
        reportRecommendations: [...report.narrative.recommendations],
      }),
    );

    must('mission.complete', await missions.complete(mission.id));

    return {
      workspaceId: workspace.id.toString(),
      clientId: client.id.toString(),
      brandId: brand.id.toString(),
      productId: product.id.toString(),
      missionId: mission.id.toString(),
      briefId: brief.id.toString(),
      creativeSetId: creativeSet.id.toString(),
      campaignDraftId: draft.id.toString(),
      reportId: report.id.toString(),
      executiveReportId: executiveReport.id.toString(),
      verdict: executiveReport.verdict,
      events,
    };
  });
}
