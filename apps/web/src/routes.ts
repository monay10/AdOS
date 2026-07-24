import { TenantContext, type RequestContext } from '@ados/tenancy';
import { ClientId, MissionId, MissionWizard, type ProductPricing } from '@ados/agency-os';
import type { App } from './app.js';
import type { Req, Res } from './http.js';
import {
  newSession,
  readSessionCookie,
  sessionClearCookie,
  sessionSetCookie,
  slugifyTenant,
  type Session,
} from './session.js';
import {
  brandForm,
  clientForm,
  dashboardPage,
  listPage,
  loginPage,
  missionDetailPage,
  missionForm,
  productForm,
  workspaceForm,
  type Approval,
  type BriefView,
  type CampaignView,
  type CreativeView,
  type DashStats,
  type NextStep,
  type ReportView,
} from './views/pages.js';
import { esc } from './views/layout.js';

function ctxOf(session: Session): RequestContext {
  return { tenantId: session.tenantId, correlationId: session.correlationId, actor: session.actor, roles: [] };
}

function toMinor(major: string): number {
  const n = Number.parseFloat(major);
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}

function parseList(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Compute onboarding progress + the single next action. */
function nextStep(stats: DashStats): NextStep {
  if (stats.workspaces === 0) return { label: 'Create your workspace', href: '/workspaces/new', done: false };
  if (stats.clients === 0) return { label: 'Add your first client', href: '/clients/new', done: false };
  if (stats.brands === 0) return { label: 'Define a brand', href: '/brands/new', done: false };
  if (stats.products === 0) return { label: 'Add a product', href: '/products/new', done: false };
  if (stats.missions === 0) return { label: 'Create your first Mission', href: '/missions/new', done: false };
  return { label: 'Onboarding complete', href: '/dashboard', done: true };
}

/**
 * The entire HTTP surface for Phase 1. Public routes: /login, /logout. Every
 * other route requires a session and runs inside its TenantContext so all data
 * access is tenant-isolated.
 */
export async function handle(app: App, secret: string, req: Req, res: Res): Promise<void> {
  const session = readSessionCookie(req.headers.cookie, secret);

  // ── Public routes ──
  if (req.path === '/login' && req.method === 'GET') {
    if (session) return res.redirect('/dashboard');
    return res.html(loginPage());
  }
  if (req.path === '/login' && req.method === 'POST') {
    const email = (req.body['email'] ?? '').trim();
    const company = (req.body['company'] ?? '').trim();
    if (!email || !company) {
      return res.html(loginPage('Please provide both your email and company.', req.body), 400);
    }
    const created = newSession(slugifyTenant(company), email);
    return res.redirect('/dashboard', sessionSetCookie(created, secret));
  }
  if (req.path === '/logout' && req.method === 'POST') {
    return res.redirect('/login', sessionClearCookie());
  }

  // ── Auth gate ──
  if (!session) return res.redirect('/login');

  await TenantContext.run(ctxOf(session), async () => {
    await route(app, secret, session, req, res);
  });
}

async function route(app: App, secret: string, session: Session, req: Req, res: Res): Promise<void> {
  const { path, method } = req;

  if (path === '/' && method === 'GET') return res.redirect('/dashboard');

  // ── Dashboard ──
  if (path === '/dashboard' && method === 'GET') {
    const stats = await collectStats(app);
    const feed = app.recentEvents(session.tenantId, 10);
    const pending = (await app.missions.list())
      .filter((m) => m.status === 'awaiting_approval')
      .map((m) => ({ id: m.id.toString(), objective: m.brief }));
    return res.html(dashboardPage({ session, stats, next: nextStep(stats), pending, feed }));
  }

  // ── Workspace ──
  if (path === '/workspaces/new' && method === 'GET') return res.html(workspaceForm(session));
  if (path === '/workspaces' && method === 'POST') {
    const name = (req.body['name'] ?? '').trim();
    const settings = { currency: req.body['currency'] || 'TRY', timezone: req.body['timezone'] || 'UTC', locale: 'en' };
    const r = await app.workspaces.create({ tenantId: session.tenantId, name, settings });
    if (r.isErr) return res.html(workspaceForm(session, r.error.message, req.body), 400);
    const next = { ...session, workspaceId: r.value.id.toString() };
    return res.redirect('/clients/new', sessionSetCookie(next, secret));
  }

  // ── Clients ──
  if (path === '/clients' && method === 'GET') {
    const clients = await app.clients.list();
    return res.html(
      listPage({
        session,
        active: '/clients',
        title: 'Clients',
        subtitle: 'Customers whose brands and products the AI Company markets.',
        newHref: '/clients/new',
        newLabel: '+ New client',
        columns: ['Name', 'Industry', 'Email', 'Status'],
        rows: clients.map((c) => [c.name, c.industry, c.contact.email, `<span class="badge active">${c.status}</span>`]),
        empty: 'No clients yet. Add your first client to begin.',
      }),
    );
  }
  if (path === '/clients/new' && method === 'GET') {
    const workspaces = await app.workspaces.list();
    if (workspaces.length === 0) return res.redirect('/workspaces/new');
    const values = session.workspaceId ? { workspaceId: session.workspaceId } : {};
    return res.html(clientForm({ session, workspaces: idName(workspaces), values }));
  }
  if (path === '/clients' && method === 'POST') {
    const workspaces = await app.workspaces.list();
    const r = await app.clients.create({
      tenantId: session.tenantId,
      workspaceId: req.body['workspaceId'] ?? '',
      name: (req.body['name'] ?? '').trim(),
      industry: (req.body['industry'] ?? '').trim() || 'general',
      contact: { email: (req.body['email'] ?? '').trim() },
    });
    if (r.isErr) return res.html(clientForm({ session, workspaces: idName(workspaces), error: r.error.message, values: req.body }), 400);
    const next = { ...session, clientId: r.value.id.toString() };
    return res.redirect('/brands/new', sessionSetCookie(next, secret));
  }

  // ── Brands ──
  if (path === '/brands' && method === 'GET') {
    const brands = await app.brands.list();
    return res.html(
      listPage({
        session,
        active: '/brands',
        title: 'Brands',
        subtitle: 'Voice, values and rules the Creative Studio must respect.',
        newHref: '/brands/new',
        newLabel: '+ New brand',
        columns: ['Name', 'Voice', 'Audience', 'Status'],
        rows: brands.map((b) => [b.name, b.profile.voice, b.profile.targetAudience || '—', `<span class="badge active">${b.status}</span>`]),
        empty: 'No brands yet. Define your first brand.',
      }),
    );
  }
  if (path === '/brands/new' && method === 'GET') {
    const clients = await app.clients.list();
    if (clients.length === 0) return res.redirect('/clients/new');
    const values = session.clientId ? { clientId: session.clientId } : {};
    return res.html(brandForm({ session, clients: idName(clients), values }));
  }
  if (path === '/brands' && method === 'POST') {
    const clients = await app.clients.list();
    const r = await app.brands.create({
      tenantId: session.tenantId,
      clientId: req.body['clientId'] ?? '',
      name: (req.body['name'] ?? '').trim(),
      profile: {
        voice: (req.body['voice'] ?? '').trim() || 'professional',
        targetAudience: (req.body['targetAudience'] ?? '').trim(),
        values: parseList(req.body['values']),
      },
    });
    if (r.isErr) return res.html(brandForm({ session, clients: idName(clients), error: r.error.message, values: req.body }), 400);
    return res.redirect('/products/new');
  }

  // ── Products ──
  if (path === '/products' && method === 'GET') {
    const products = await app.products.list();
    return res.html(
      listPage({
        session,
        active: '/products',
        title: 'Products',
        subtitle: 'What each client sells — the thing the AI Company markets.',
        newHref: '/products/new',
        newLabel: '+ New product',
        columns: ['Name', 'Categories', 'Pricing', 'Status'],
        rows: products.map((p) => [
          p.name,
          p.categories.join(', ') || '—',
          `${p.pricing.model} · ${(p.pricing.amount.amountMinor / 100).toFixed(2)} ${p.pricing.amount.currency}`,
          `<span class="badge active">${p.status}</span>`,
        ]),
        empty: 'No products yet. Add your first product.',
      }),
    );
  }
  if (path === '/products/new' && method === 'GET') {
    const clients = await app.clients.list();
    if (clients.length === 0) return res.redirect('/clients/new');
    const values = session.clientId ? { clientId: session.clientId } : {};
    return res.html(productForm({ session, clients: idName(clients), values }));
  }
  if (path === '/products' && method === 'POST') {
    const clients = await app.clients.list();
    const model = (req.body['pricingModel'] ?? 'one_time') as ProductPricing['model'];
    const currency = req.body['currency'] || 'TRY';
    const amountMinor = model === 'free' ? 0 : toMinor(req.body['price'] ?? '0');
    if (Number.isNaN(amountMinor)) {
      return res.html(productForm({ session, clients: idName(clients), error: 'Price must be a number.', values: req.body }), 400);
    }
    const pricing: ProductPricing = { model, amount: { amountMinor, currency }, ...(model === 'subscription' ? { period: 'monthly' } : {}) };
    const r = await app.products.create({
      tenantId: session.tenantId,
      clientId: req.body['clientId'] ?? '',
      name: (req.body['name'] ?? '').trim(),
      description: (req.body['description'] ?? '').trim(),
      categories: parseList(req.body['categories']),
      pricing,
    });
    if (r.isErr) return res.html(productForm({ session, clients: idName(clients), error: r.error.message, values: req.body }), 400);
    return res.redirect('/missions/new');
  }

  // ── Missions ──
  if (path === '/missions' && method === 'GET') {
    const missions = await app.missions.list();
    return res.html(
      listPage({
        session,
        active: '/missions',
        title: 'Missions',
        subtitle: 'Business objectives the AI Company plans and runs.',
        newHref: '/missions/new',
        newLabel: '+ New mission',
        columns: ['Objective', 'Budget', 'Status'],
        rows: missions.map((m) => [
          `<a href="/missions/${m.id.toString()}">${esc(m.brief)}</a>`,
          m.budget ? `${(m.budget.amountMinor / 100).toFixed(0)} ${m.budget.currency}/${m.budget.period}` : '—',
          `<span class="badge active">${m.status}</span>`,
        ]),
        empty: 'No missions yet. State your first objective.',
      }),
    );
  }
  if (path === '/missions/new' && method === 'GET') {
    const [workspaces, clients] = [await app.workspaces.list(), await app.clients.list()];
    if (workspaces.length === 0) return res.redirect('/workspaces/new');
    if (clients.length === 0) return res.redirect('/clients/new');
    const values: Record<string, string> = {};
    if (session.workspaceId) values['workspaceId'] = session.workspaceId;
    if (session.clientId) values['clientId'] = session.clientId;
    return res.html(missionForm({ session, workspaces: idName(workspaces), clients: idName(clients), values }));
  }
  if (path === '/missions' && method === 'POST') {
    const [workspaces, clients] = [await app.workspaces.list(), await app.clients.list()];
    const budgetMinor = toMinor(req.body['budget'] ?? '0');
    const target = Number.parseInt(req.body['metricTarget'] ?? '', 10);
    const rerender = (msg: string): void =>
      res.html(missionForm({ session, workspaces: idName(workspaces), clients: idName(clients), error: msg, values: req.body }), 400);
    if (Number.isNaN(budgetMinor) || budgetMinor <= 0) return rerender('Budget must be a positive number.');

    const wizard = MissionWizard.start({
      tenantId: session.tenantId,
      workspaceId: req.body['workspaceId'] ?? '',
      clientId: req.body['clientId'] ?? '',
      createdBy: session.actor,
    })
      .withObjective((req.body['objective'] ?? '').trim())
      .withBudget({
        amountMinor: budgetMinor,
        currency: req.body['currency'] || 'TRY',
        period: (req.body['period'] ?? 'monthly') as 'daily' | 'weekly' | 'monthly' | 'total',
      });
    const ready = Number.isFinite(target) && target > 0
      ? wizard.withTarget({ name: req.body['metricName'] || 'leads', target, unit: req.body['metricUnit'] || 'count' })
      : wizard;

    const r = await app.missions.submit(ready);
    if (r.isErr) return rerender(r.error.message);
    return res.redirect('/dashboard');
  }

  // ── Marketing Brief list ──
  if (path === '/brief' && method === 'GET') {
    const briefs = await app.briefs.list();
    return res.html(
      listPage({
        session,
        active: '/brief',
        title: 'Marketing Briefs',
        subtitle: 'AI-generated strategy for each Mission, produced by Marketing Intelligence.',
        newHref: '/missions',
        newLabel: 'Go to Missions',
        columns: ['Objective', 'Channels', 'Model'],
        rows: briefs.map((b) => [
          `<a href="/missions/${esc(b.missionId)}">${esc(b.content.objective)}</a>`,
          b.content.recommendedChannels.map((c) => `<span class="badge">${esc(c)}</span>`).join(' '),
          `<span class="badge">${esc(b.provenance.model)}</span>`,
        ]),
        empty: 'No briefs yet. Open a Mission and generate its Marketing Brief.',
      }),
    );
  }

  // ── Creative Studio list ──
  if (path === '/creative' && method === 'GET') {
    const sets = await app.creative.list();
    return res.html(
      listPage({
        session,
        active: '/creative',
        title: 'Creative Studio',
        subtitle: 'Publish-ready copy generated from approved Marketing Briefs.',
        newHref: '/missions',
        newLabel: 'Go to Missions',
        columns: ['Headline', 'CTA', 'Model'],
        rows: sets.map((s) => [
          `<a href="/missions/${esc(s.missionId)}">${esc(s.content.headline)}</a>`,
          `<span class="badge">${esc(s.content.cta)}</span>`,
          `<span class="badge">${esc(s.provenance.model)}</span>`,
        ]),
        empty: 'No creatives yet. Approve a brief and generate its creative set.',
      }),
    );
  }

  // ── Campaigns list ──
  if (path === '/campaigns' && method === 'GET') {
    const drafts = await app.campaigns.list();
    return res.html(
      listPage({
        session,
        active: '/campaigns',
        title: 'Campaigns',
        subtitle: 'Approval-ready campaign drafts built from approved creative.',
        newHref: '/missions',
        newLabel: 'Go to Missions',
        columns: ['Name', 'Budget', 'Channels', 'Model'],
        rows: drafts.map((d) => [
          `<a href="/missions/${esc(d.missionId)}">${esc(d.content.name)}</a>`,
          `${(d.totalBudget.amountMinor / 100).toLocaleString()} ${esc(d.totalBudget.currency)}`,
          d.content.channels.map((c) => `<span class="badge">${esc(c.channel)} ${c.budgetPercentage}%</span>`).join(' '),
          `<span class="badge">${esc(d.provenance.model)}</span>`,
        ]),
        empty: 'No campaigns yet. Approve a creative and generate its campaign draft.',
      }),
    );
  }

  // ── Analytics list ──
  if (path === '/analytics' && method === 'GET') {
    const reports = await app.reports.list();
    return res.html(
      listPage({
        session,
        active: '/analytics',
        title: 'Analytics',
        subtitle: 'Campaign KPI reports with AI-generated executive summaries.',
        newHref: '/missions',
        newLabel: 'Go to Missions',
        columns: ['ROAS', 'ROI', 'CTR', 'Summary'],
        rows: reports.map((rep) => [
          `<a href="/missions/${esc(rep.missionId)}">${rep.kpi('roas') ?? 0}x</a>`,
          `${rep.kpi('roi') ?? 0}%`,
          `${rep.kpi('ctr') ?? 0}%`,
          esc(rep.narrative.summary),
        ]),
        empty: 'No reports yet. Approve a campaign and generate its analytics report.',
      }),
    );
  }

  // ── Mission detail + processing (Phases 2–5) ──
  if (path.startsWith('/missions/') && path !== '/missions/new') {
    const seg = path.slice('/missions/'.length).split('/');
    const id = seg[0] ?? '';
    const action = seg[1];
    const sub = seg[2];
    if (!id) return res.html(notFound(session), 404);

    if (!action && method === 'GET') return renderMissionDetail(app, session, res, id);

    // Phase 2 — brief approval gate.
    if (action === 'brief' && method === 'POST') return generateBrief(app, session, res, id);
    if (action === 'approve' && method === 'POST') return gateApprove(app, session, res, id, 'strategy_and_budget');
    if (action === 'reject' && method === 'POST') return gateReject(app, session, res, id, 'Rejected by executive');

    // Phase 3 — creative + creative-review gate.
    if (action === 'creative' && !sub && method === 'POST') return generateCreative(app, session, res, id);
    if (action === 'creative' && sub === 'approve' && method === 'POST') return gateApprove(app, session, res, id, 'creative_assets');
    if (action === 'creative' && sub === 'reject' && method === 'POST') return gateReject(app, session, res, id, 'Creative rejected by executive');

    // Phase 4 — campaign + launch-approval gate.
    if (action === 'campaign' && !sub && method === 'POST') return generateCampaign(app, session, res, id);
    if (action === 'campaign' && sub === 'approve' && method === 'POST') return gateApprove(app, session, res, id, 'campaign_launch');
    if (action === 'campaign' && sub === 'reject' && method === 'POST') return gateReject(app, session, res, id, 'Campaign rejected by executive');

    // Phase 5 — analytics report (no approval gate; produces KPIs + summary).
    if (action === 'analytics' && method === 'POST') return generateReport(app, session, res, id, req);

    return res.html(notFound(session), 404);
  }

  // ── Fallback ──
  return res.html(notFound(session), 404);
}

/** Load a mission, its brief + creative and their review states, and render. */
async function renderMissionDetail(app: App, session: Session, res: Res, id: string, error?: string): Promise<void> {
  const found = await app.missions.get(MissionId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const mission = found.value;
  const brief = (await app.briefs.list(id))[0];
  const creative = (await app.creative.list(id))[0];
  const campaign = (await app.campaigns.list(id))[0];
  const report = (await app.reports.list(id))[0];

  // Each earlier stage is implicitly approved once the next artifact exists.
  const briefApproval: Approval = !brief ? 'none' : creative ? 'approved' : statusApproval(mission.status);
  const creativeApproval: Approval = !creative ? 'none' : campaign ? 'approved' : statusApproval(mission.status);
  const campaignApproval: Approval = !campaign ? 'none' : report ? 'approved' : statusApproval(mission.status);

  const spend = mission.budget ? mission.budget.amountMinor / 100 : 1000;
  const currency = mission.budget?.currency ?? 'TRY';

  return res.html(
    missionDetailPage({
      session,
      mission: {
        id,
        objective: mission.brief,
        status: mission.status,
        ...(mission.budget
          ? { budget: { amount: mission.budget.amountMinor / 100, currency: mission.budget.currency, period: mission.budget.period } }
          : {}),
      },
      briefApproval,
      creativeApproval,
      campaignApproval,
      reportDefaults: { spend, revenue: spend * 3, currency },
      ...(brief ? { brief: toBriefView(brief) } : {}),
      ...(creative ? { creative: toCreativeView(creative) } : {}),
      ...(campaign ? { campaign: toCampaignView(campaign) } : {}),
      ...(report ? { report: toReportView(report) } : {}),
      ...(error ? { error } : {}),
    }),
  );
}

/** Map a mission status to a review state for whichever artifact is in the gate. */
function statusApproval(status: string): Approval {
  if (status === 'awaiting_approval') return 'pending';
  if (status === 'failed') return 'rejected';
  if (status === 'planning' || status === 'executing' || status === 'completed') return 'approved';
  return 'none';
}

async function gateApprove(app: App, session: Session, res: Res, id: string, gate: 'strategy_and_budget' | 'creative_assets' | 'campaign_launch'): Promise<void> {
  const r = await app.missions.approve(MissionId.of(id), gate);
  if (r.isErr) return renderMissionDetail(app, session, res, id, r.error.message);
  return res.redirect(`/missions/${id}`);
}

async function gateReject(app: App, session: Session, res: Res, id: string, reason: string): Promise<void> {
  const r = await app.missions.fail(MissionId.of(id), reason);
  if (r.isErr) return renderMissionDetail(app, session, res, id, r.error.message);
  return res.redirect(`/missions/${id}`);
}

/** Marketing Intelligence: generate the brief, then move the mission to approval. */
async function generateBrief(app: App, session: Session, res: Res, id: string): Promise<void> {
  const found = await app.missions.get(MissionId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const mission = found.value;

  const clientRes = await app.clients.get(ClientId.of(mission.clientId));
  const brand = (await app.brands.list(mission.clientId))[0];
  const product = (await app.products.list(mission.clientId))[0];
  if (clientRes.isErr || !brand || !product) {
    return res.html(
      missionDetailPage({
        session,
        mission: { id, objective: mission.brief, status: mission.status },
        briefApproval: 'none',
        creativeApproval: 'none',
        campaignApproval: 'none',
        prereqMissing: 'Add a brand and a product for this client before generating a brief.',
      }),
    );
  }
  const client = clientRes.value;

  const generated = await app.briefs.generate({
    tenantId: session.tenantId,
    missionId: id,
    clientId: mission.clientId,
    clientName: client.name,
    industry: client.industry,
    brandVoice: brand.profile.voice,
    brandValues: [...brand.profile.values],
    productName: product.name,
    productDescription: product.description,
    missionBrief: mission.brief,
    ...(mission.budget
      ? { budget: { amountMinor: mission.budget.amountMinor, currency: mission.budget.currency, period: mission.budget.period } }
      : {}),
  });
  if (generated.isErr) return renderMissionDetail(app, session, res, id, generated.error.message);

  // Advance the mission into the executive approval gate.
  if (mission.status === 'submitted') await app.missions.plan(MissionId.of(id));
  await app.missions.requestApproval(MissionId.of(id), 'strategy_and_budget');
  return res.redirect(`/missions/${id}`);
}

/** Creative Studio: generate the creative set from the approved brief, then move
 * the mission into the creative-review gate. */
async function generateCreative(app: App, session: Session, res: Res, id: string): Promise<void> {
  const found = await app.missions.get(MissionId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const mission = found.value;

  const brief = (await app.briefs.list(id))[0];
  if (!brief || mission.status !== 'planning') {
    return renderMissionDetail(app, session, res, id, 'Approve the Marketing Brief before generating creative.');
  }
  const brand = (await app.brands.list(mission.clientId))[0];
  const product = (await app.products.list(mission.clientId))[0];
  if (!brand || !product) {
    return renderMissionDetail(app, session, res, id, 'A brand and product are required to generate creative.');
  }

  const generated = await app.creative.generate({
    tenantId: session.tenantId,
    missionId: id,
    clientId: mission.clientId,
    briefId: brief.id.toString(),
    productName: product.name,
    brandVoice: brand.profile.voice,
    objective: brief.content.objective,
    targetAudience: brief.content.targetAudience,
    positioning: brief.content.positioning,
    keyMessages: [...brief.content.keyMessages],
  });
  if (generated.isErr) return renderMissionDetail(app, session, res, id, generated.error.message);

  await app.missions.requestApproval(MissionId.of(id), 'creative_assets');
  return res.redirect(`/missions/${id}`);
}

/** Campaign Builder: turn the approved creative into a campaign draft, then move
 * the mission into the launch-approval gate. */
async function generateCampaign(app: App, session: Session, res: Res, id: string): Promise<void> {
  const found = await app.missions.get(MissionId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const mission = found.value;

  const brief = (await app.briefs.list(id))[0];
  const creative = (await app.creative.list(id))[0];
  if (!brief || !creative || mission.status !== 'planning') {
    return renderMissionDetail(app, session, res, id, 'Approve the creative before building the campaign.');
  }

  const generated = await app.campaigns.draft({
    tenantId: session.tenantId,
    missionId: id,
    clientId: mission.clientId,
    briefId: brief.id.toString(),
    creativeSetId: creative.id.toString(),
    objective: brief.content.objective,
    targetAudience: brief.content.targetAudience,
    recommendedChannels: [...brief.content.recommendedChannels],
    budgetAllocation: brief.content.budgetAllocation.map((b) => ({ ...b })),
    totalBudget: mission.budget
      ? { amountMinor: mission.budget.amountMinor, currency: mission.budget.currency }
      : { amountMinor: 0, currency: 'USD' },
    headline: creative.content.headline,
    adCopy: creative.content.adCopy,
    cta: creative.content.cta,
  });
  if (generated.isErr) return renderMissionDetail(app, session, res, id, generated.error.message);

  await app.missions.requestApproval(MissionId.of(id), 'campaign_launch');
  return res.redirect(`/missions/${id}`);
}

/** Analytics: compute KPIs from the entered results + an AI executive summary. */
async function generateReport(app: App, session: Session, res: Res, id: string, req: Req): Promise<void> {
  const found = await app.missions.get(MissionId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const mission = found.value;

  const campaign = (await app.campaigns.list(id))[0];
  if (!campaign || statusApproval(mission.status) !== 'approved') {
    return renderMissionDetail(app, session, res, id, 'Approve the campaign before generating analytics.');
  }

  const intOf = (v: string | undefined): number => {
    const n = Number.parseInt(v ?? '', 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const currency = req.body['currency'] || 'TRY';
  const spendMinor = toMinor(req.body['spend'] ?? '0');
  const revenueMinor = toMinor(req.body['revenue'] ?? '0');
  if (Number.isNaN(spendMinor) || Number.isNaN(revenueMinor)) {
    return renderMissionDetail(app, session, res, id, 'Spend and revenue must be numbers.');
  }

  const generated = await app.reports.generate({
    tenantId: session.tenantId,
    missionId: id,
    clientId: mission.clientId,
    campaignDraftId: campaign.id.toString(),
    impressions: intOf(req.body['impressions']),
    clicks: intOf(req.body['clicks']),
    conversions: intOf(req.body['conversions']),
    leads: intOf(req.body['leads']),
    spend: { amountMinor: spendMinor, currency },
    revenue: { amountMinor: revenueMinor, currency },
  });
  if (generated.isErr) return renderMissionDetail(app, session, res, id, generated.error.message);
  return res.redirect(`/missions/${id}`);
}

function toBriefView(brief: {
  content: {
    objective: string;
    targetAudience: string;
    positioning: string;
    keyMessages: string[];
    recommendedChannels: string[];
    budgetAllocation: Array<{ channel: string; percentage: number }>;
    kpis: Array<{ name: string; target: number; unit: string }>;
  };
  provenance: { model: string };
}): BriefView {
  return {
    objective: brief.content.objective,
    targetAudience: brief.content.targetAudience,
    positioning: brief.content.positioning,
    keyMessages: [...brief.content.keyMessages],
    recommendedChannels: [...brief.content.recommendedChannels],
    budgetAllocation: brief.content.budgetAllocation.map((b) => ({ ...b })),
    kpis: brief.content.kpis.map((k) => ({ ...k })),
    model: brief.provenance.model,
  };
}

function toCreativeView(set: {
  content: {
    headline: string;
    adCopy: string;
    cta: string;
    socialPost: string;
    landingPage: { headline: string; body: string; cta: string };
    email: { subject: string; body: string };
  };
  provenance: { model: string };
}): CreativeView {
  return {
    headline: set.content.headline,
    adCopy: set.content.adCopy,
    cta: set.content.cta,
    socialPost: set.content.socialPost,
    landingPage: { ...set.content.landingPage },
    email: { ...set.content.email },
    model: set.provenance.model,
  };
}

function toCampaignView(draft: {
  content: {
    name: string;
    objective: string;
    channels: Array<{
      channel: string;
      budgetPercentage: number;
      adSets: Array<{ name: string; audience: string; headline: string; primaryText: string; cta: string }>;
    }>;
    schedule: { startHint: string; durationDays: number };
  };
  totalBudget: { amountMinor: number; currency: string };
  provenance: { model: string };
}): CampaignView {
  return {
    name: draft.content.name,
    objective: draft.content.objective,
    totalBudget: { amount: draft.totalBudget.amountMinor / 100, currency: draft.totalBudget.currency },
    channels: draft.content.channels.map((c) => ({
      channel: c.channel,
      budgetPercentage: c.budgetPercentage,
      adSets: c.adSets.map((a) => ({ ...a })),
    })),
    schedule: { ...draft.content.schedule },
    model: draft.provenance.model,
  };
}

function toReportView(report: {
  kpis: ReadonlyArray<{ name: string; value: number; unit: string }>;
  narrative: { summary: string; highlights: string[]; recommendations: string[] };
  provenance: { model: string };
}): ReportView {
  return {
    kpis: report.kpis.map((k) => ({ ...k })),
    summary: report.narrative.summary,
    highlights: [...report.narrative.highlights],
    recommendations: [...report.narrative.recommendations],
    model: report.provenance.model,
  };
}

async function collectStats(app: App): Promise<DashStats> {
  const [workspaces, clients, brands, products, missions, briefs, creatives, campaigns, reports] = await Promise.all([
    app.workspaces.list(),
    app.clients.list(),
    app.brands.list(),
    app.products.list(),
    app.missions.list(),
    app.briefs.list(),
    app.creative.list(),
    app.campaigns.list(),
    app.reports.list(),
  ]);
  return {
    workspaces: workspaces.length,
    clients: clients.length,
    brands: brands.length,
    products: products.length,
    missions: missions.length,
    briefs: briefs.length,
    creatives: creatives.length,
    campaigns: campaigns.length,
    reports: reports.length,
  };
}

function idName(items: Array<{ id: { toString(): string }; name: string }>): Array<{ id: string; name: string }> {
  return items.map((i) => ({ id: i.id.toString(), name: i.name }));
}

function notFound(session: Session): string {
  return listPage({
    session,
    active: '/dashboard',
    title: 'Not found',
    subtitle: 'That screen does not exist yet.',
    newHref: '/dashboard',
    newLabel: '← Back to dashboard',
    columns: [],
    rows: [],
    empty: 'This part of AdOS is coming in a later phase.',
  });
}
