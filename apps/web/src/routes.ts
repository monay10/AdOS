import { TenantContext, type RequestContext } from '@ados/tenancy';
import type { AppError } from '@ados/kernel';
import { ApprovalId, AssetId, ClientId, MissionId, MissionWizard, PerformanceReportId, ProjectId, WorkspaceId, type AssetKind, type ProductPricing, type ProjectStatus, type ReportMetric } from '@ados/agency-os';
import { COMPANY_BRAIN_EVENTS } from '@ados/company-brain';
import { EXECUTIVE_MEMORY_EVENTS } from '@ados/executive-memory';
import type { App } from './app.js';
import type { Req, Res } from './http.js';
import { resolveLocale, t, withLocale } from './i18n.js';
import {
  newSession,
  readSessionCookie,
  sessionClearCookie,
  sessionSetCookie,
  slugifyTenant,
  type Session,
} from './session.js';
import {
  approvalDetailPage,
  approvalForm,
  approvalStatusLabel,
  assetDetailPage,
  assetForm,
  assetLibraryPage,
  brandForm,
  clientForm,
  dashboardPage,
  backupsPage,
  healthPage,
  listPage,
  loginPage,
  maintenancePage,
  missionDetailPage,
  missionForm,
  productForm,
  projectDashboardPage,
  projectForm,
  recommendationsPage,
  reportDetailPage,
  reportForm,
  settingsPage,
  tracesPage,
  workspaceForm,
  type ApprovalDetailData,
  type AssetDetailData,
  type ProjectDashboardData,
  type ReportDetailData,
  type Approval,
  type BriefView,
  type CampaignView,
  type CreativeView,
  type DashStats,
  type ExecutiveView,
  type GovernanceView,
  type LearningView,
  type NextStep,
  type ReportView,
} from './views/pages.js';
import type { ExecutionTrace } from '@ados/ai-manager';
import { governanceMetrics } from './governance-metrics.js';
import { approvalFunnel, reviewStats } from './governance-decisions.js';
import { stageLatency } from './stage-latency.js';
import { revisionFunnel, type MissionSummary } from './revision-funnel.js';
import { resilienceStats } from './resilience-stats.js';
import { type MissionGate } from './governance-policy.js';
import { planMission } from './mission-planner.js';
import { briefGenerateAndAdvance } from './mission-runner.js';
import { recommend, type VerticalStat } from './recommendation-engine.js';
import { esc } from './views/layout.js';
import { handleAuth, type AuthGateway } from './auth/routes.js';

function ctxOf(session: Session): RequestContext {
  // Roles are resolved at login (RBAC); empty in open/dev mode. Preserves the
  // existing tenant-scoped authorization — no new permission gate is added.
  return { tenantId: session.tenantId, correlationId: session.correlationId, actor: session.actor, roles: session.roles ?? [] };
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
 * The entire HTTP surface. The authentication surface (login/logout, plus
 * register/reset/change-password in password mode) is handled first; every
 * other route requires a session and runs inside its TenantContext so all data
 * access is tenant-isolated.
 *
 * `auth` selects the mode: when present, production email/password
 * authentication; when absent (default), the open/dev passwordless login. The
 * authenticated application routes are identical in both modes.
 */
export async function handle(app: App, secret: string, req: Req, res: Res, auth?: AuthGateway): Promise<void> {
  // Resolve the request locale from the browser/OS language and make it ambient
  // so every page, the layout chrome, and the AI Manager render in that language.
  const locale = resolveLocale(req.headers['accept-language']);
  await withLocale(locale, async () => {
    const session = readSessionCookie(req.headers.cookie, secret);

    // ── Authentication surface ──
    if (auth) {
      if (await handleAuth(secret, auth, session, req, res)) return;
    } else if (handleOpenPublic(secret, session, req, res)) {
      return;
    }

    // ── Auth gate ──
    if (!session) return res.redirect('/login');

    await TenantContext.run(ctxOf(session), async () => {
      await route(app, secret, session, req, res);
    });
  });
}

/** Open/dev-mode public routes: passwordless login + logout. Returns true when
 * it handled the request. This is the original, unchanged behavior. */
function handleOpenPublic(secret: string, session: Session | null, req: Req, res: Res): boolean {
  if (req.path === '/login' && req.method === 'GET') {
    if (session) res.redirect('/dashboard');
    else res.html(loginPage());
    return true;
  }
  if (req.path === '/login' && req.method === 'POST') {
    const email = (req.body['email'] ?? '').trim();
    const company = (req.body['company'] ?? '').trim();
    if (!email || !company) {
      res.html(loginPage(t('login.missingFields'), req.body), 400);
      return true;
    }
    const created = newSession(slugifyTenant(company), email);
    res.redirect('/dashboard', sessionSetCookie(created, secret));
    return true;
  }
  if (req.path === '/logout' && req.method === 'POST') {
    res.redirect('/login', sessionClearCookie());
    return true;
  }
  return false;
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
        title: t('nav.clients'),
        subtitle: t('list.clients.sub'),
        newHref: '/clients/new',
        newLabel: t('list.clients.new'),
        columns: [t('common.name'), t('list.col.industry'), t('common.email'), t('common.status')],
        rows: clients.map((c) => [c.name, c.industry, c.contact.email, `<span class="badge active">${c.status}</span>`]),
        empty: t('list.clients.empty'),
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
        title: t('nav.brands'),
        subtitle: t('list.brands.sub'),
        newHref: '/brands/new',
        newLabel: t('list.brands.new'),
        columns: [t('common.name'), t('list.col.voice'), t('list.col.audience'), t('common.status')],
        rows: brands.map((b) => [b.name, b.profile.voice, b.profile.targetAudience || '—', `<span class="badge active">${b.status}</span>`]),
        empty: t('list.brands.empty'),
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
      rules: { bannedWords: parseList(req.body['bannedWords']) },
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
        title: t('nav.products'),
        subtitle: t('list.products.sub'),
        newHref: '/products/new',
        newLabel: t('list.products.new'),
        columns: [t('common.name'), t('list.col.categories'), t('list.col.pricing'), t('common.status')],
        rows: products.map((p) => [
          p.name,
          p.categories.join(', ') || '—',
          `${p.pricing.model} · ${(p.pricing.amount.amountMinor / 100).toFixed(2)} ${p.pricing.amount.currency}`,
          `<span class="badge active">${p.status}</span>`,
        ]),
        empty: t('list.products.empty'),
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
      return res.html(productForm({ session, clients: idName(clients), error: t('err.priceNumber'), values: req.body }), 400);
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
        title: t('nav.missions'),
        subtitle: t('list.missions.sub'),
        newHref: '/missions/new',
        newLabel: t('list.missions.new'),
        columns: [t('list.col.objective'), t('list.col.budget'), t('common.status')],
        rows: missions.map((m) => [
          `<a href="/missions/${m.id.toString()}">${esc(m.brief)}</a>`,
          m.budget ? `${(m.budget.amountMinor / 100).toFixed(0)} ${m.budget.currency}/${m.budget.period}` : '—',
          `<span class="badge active">${m.status}</span>`,
        ]),
        empty: t('list.missions.empty'),
      }),
    );
  }
  if (path === '/missions/new' && method === 'GET') {
    const [workspaces, clients, projects] = [await app.workspaces.list(), await app.clients.list(), await app.projects.list()];
    if (workspaces.length === 0) return res.redirect('/workspaces/new');
    if (clients.length === 0) return res.redirect('/clients/new');
    const values: Record<string, string> = {};
    if (session.workspaceId) values['workspaceId'] = session.workspaceId;
    if (session.clientId) values['clientId'] = session.clientId;
    if (req.query.get('projectId')) values['projectId'] = req.query.get('projectId')!;
    return res.html(missionForm({ session, workspaces: idName(workspaces), clients: idName(clients), projects: idName(projects), values }));
  }
  if (path === '/missions' && method === 'POST') {
    const [workspaces, clients, projects] = [await app.workspaces.list(), await app.clients.list(), await app.projects.list()];
    const budgetMinor = toMinor(req.body['budget'] ?? '0');
    const target = Number.parseInt(req.body['metricTarget'] ?? '', 10);
    const rerender = (msg: string): void =>
      res.html(missionForm({ session, workspaces: idName(workspaces), clients: idName(clients), projects: idName(projects), error: msg, values: req.body }), 400);
    if (Number.isNaN(budgetMinor) || budgetMinor <= 0) return rerender(t('err.budgetPositive'));

    let wizard = MissionWizard.start({
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
    if (req.body['projectId']) wizard = wizard.withProject(req.body['projectId']);
    const ready = Number.isFinite(target) && target > 0
      ? wizard.withTarget({ name: req.body['metricName'] || 'leads', target, unit: req.body['metricUnit'] || 'count' })
      : wizard;

    const r = await app.missions.submit(ready);
    if (r.isErr) return rerender(r.error.message);
    return res.redirect(req.body['projectId'] ? `/projects/${req.body['projectId']}` : '/dashboard');
  }

  // ── Projects (Phase 7) ──
  if (path === '/projects' && method === 'GET') {
    const [projects, clients, brands] = [await app.projects.list(), await app.clients.list(), await app.brands.list()];
    const brandName = (bid: string): string => brands.find((b) => b.id.toString() === bid)?.name ?? '—';
    const clientName = (cid: string): string => clients.find((c) => c.id.toString() === cid)?.name ?? '—';
    return res.html(
      listPage({
        session,
        active: '/projects',
        title: t('nav.projects'),
        subtitle: t('list.projects.sub'),
        newHref: '/projects/new',
        newLabel: t('list.projects.new'),
        columns: [t('common.name'), t('common.client'), t('common.brand'), t('common.status')],
        rows: projects.map((p) => [
          `<a href="/projects/${p.id.toString()}">${esc(p.name)}</a>`,
          esc(clientName(p.clientId)),
          esc(brandName(p.brandId)),
          `<span class="badge active">${esc(p.status)}</span>`,
        ]),
        empty: t('list.projects.empty'),
      }),
    );
  }
  if (path === '/projects/new' && method === 'GET') {
    const [brands, clients] = [await app.brands.list(), await app.clients.list()];
    if (brands.length === 0) return res.redirect('/brands/new');
    const clientName = (cid: string): string => clients.find((c) => c.id.toString() === cid)?.name ?? '—';
    return res.html(projectForm({ session, brands: brands.map((b) => ({ id: b.id.toString(), name: b.name, clientName: clientName(b.clientId) })) }));
  }
  if (path === '/projects' && method === 'POST') {
    const [brands, clients] = [await app.brands.list(), await app.clients.list()];
    const clientName = (cid: string): string => clients.find((c) => c.id.toString() === cid)?.name ?? '—';
    const rerender = (msg: string): void =>
      res.html(projectForm({ session, brands: brands.map((b) => ({ id: b.id.toString(), name: b.name, clientName: clientName(b.clientId) })), error: msg, values: req.body }), 400);
    const brand = brands.find((b) => b.id.toString() === (req.body['brandId'] ?? ''));
    if (!brand) return rerender(t('err.selectBrand'));
    const r = await app.projects.create({
      tenantId: session.tenantId,
      clientId: brand.clientId,
      brandId: brand.id.toString(),
      name: (req.body['name'] ?? '').trim(),
      description: (req.body['description'] ?? '').trim(),
    });
    if (r.isErr) return rerender(r.error.message);
    return res.redirect(`/projects/${r.value.id.toString()}`);
  }
  if (path.startsWith('/projects/') && path !== '/projects/new') {
    const seg = path.slice('/projects/'.length).split('/');
    const id = seg[0] ?? '';
    const action = seg[1];
    if (!id) return res.html(notFound(session), 404);

    if (!action && method === 'GET') return renderProjectDashboard(app, session, res, id);
    if (action === 'update' && method === 'POST') return mutateProject(app, session, res, id, (pid) => app.projects.update(pid, { name: (req.body['name'] ?? '').trim(), description: req.body['description'] ?? '' }));
    if (action === 'status' && method === 'POST') return mutateProject(app, session, res, id, (pid) => app.projects.changeStatus(pid, (req.body['status'] ?? 'active') as ProjectStatus));
    if (action === 'goal' && method === 'POST') {
      const target = Number.parseInt(req.body['target'] ?? '0', 10);
      return mutateProject(app, session, res, id, (pid) => app.projects.addGoal(pid, { description: (req.body['description'] ?? '').trim(), metric: (req.body['metric'] ?? '').trim(), target: Number.isFinite(target) ? target : 0 }));
    }
    if (action === 'member' && method === 'POST') {
      return mutateProject(app, session, res, id, (pid) => app.projects.addMember(pid, { name: (req.body['name'] ?? '').trim(), email: (req.body['email'] ?? '').trim(), role: (req.body['role'] ?? '').trim() }));
    }
    if (action === 'archive' && method === 'POST') {
      const r = await app.projects.archive(ProjectId.of(id));
      if (r.isErr) return renderProjectDashboard(app, session, res, id, r.error.message);
      return res.redirect('/projects');
    }
    return res.html(notFound(session), 404);
  }

  // ── Approvals (Phase 8) ──
  if (path === '/approvals' && method === 'GET') {
    const [approvals, projects] = [await app.approvals.list(), await app.projects.list()];
    const projectName = (pid: string | undefined): string => (pid ? projects.find((p) => p.id.toString() === pid)?.name ?? '—' : '—');
    return res.html(
      listPage({
        session,
        active: '/approvals',
        title: t('nav.approvals'),
        subtitle: t('list.approvals.sub'),
        newHref: '/approvals/new',
        newLabel: t('list.approvals.new'),
        columns: [t('common.title'), t('common.project'), t('list.col.requestedBy'), t('common.status')],
        rows: approvals.map((a) => [
          `<a href="/approvals/${a.id.toString()}">${esc(a.title)}</a>`,
          esc(projectName(a.projectId)),
          esc(a.requestedBy),
          `<span class="badge ${a.status === 'approved' ? 'active' : ''}">${esc(approvalStatusLabel(a.status))}</span>`,
        ]),
        empty: t('list.approvals.empty'),
      }),
    );
  }
  if (path === '/approvals/new' && method === 'GET') {
    const projects = await app.projects.list();
    return res.html(approvalForm({ session, projects: idName(projects) }));
  }
  if (path === '/approvals' && method === 'POST') {
    const projects = await app.projects.list();
    const rerender = (msg: string): void => res.html(approvalForm({ session, projects: idName(projects), error: msg, values: req.body }), 400);
    const title = (req.body['title'] ?? '').trim();
    if (!title) return rerender(t('err.titleRequired'));
    const projectId = (req.body['projectId'] ?? '').trim();
    const r = await app.approvals.create({
      tenantId: session.tenantId,
      title,
      description: (req.body['description'] ?? '').trim(),
      requestedBy: session.actor,
      ...(projectId ? { projectId } : {}),
      at: new Date().toISOString(),
    });
    if (r.isErr) return rerender(r.error.message);
    return res.redirect(`/approvals/${r.value.id.toString()}`);
  }
  if (path.startsWith('/approvals/') && path !== '/approvals/new') {
    const seg = path.slice('/approvals/'.length).split('/');
    const id = seg[0] ?? '';
    const action = seg[1];
    if (!id) return res.html(notFound(session), 404);

    if (!action && method === 'GET') return renderApprovalDetail(app, session, res, id);

    const input = { actor: session.actor, at: new Date().toISOString(), note: (req.body['note'] ?? '').trim() };
    if (action === 'submit' && method === 'POST') return mutateApproval(app, session, res, id, (aid) => app.approvals.submit(aid, input));
    if (action === 'approve' && method === 'POST') return mutateApproval(app, session, res, id, (aid) => app.approvals.approve(aid, input));
    if (action === 'reject' && method === 'POST') return mutateApproval(app, session, res, id, (aid) => app.approvals.reject(aid, input));
    if (action === 'revise' && method === 'POST') return mutateApproval(app, session, res, id, (aid) => app.approvals.requestRevision(aid, input));
    return res.html(notFound(session), 404);
  }

  // ── Asset Library (Phase 9) ──
  if (path === '/assets' && method === 'GET') {
    const [assets, clients] = [await app.assets.list(), await app.clients.list()];
    const clientName = (cid: string): string => clients.find((c) => c.id.toString() === cid)?.name ?? '—';
    const q = (req.query.get('q') ?? '').trim().toLowerCase();
    const tag = (req.query.get('tag') ?? '').trim().toLowerCase();
    const matches = assets.filter((a) => {
      if (tag && !a.tags.includes(tag)) return false;
      if (q && !(a.name.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q)))) return false;
      return true;
    });
    return res.html(
      assetLibraryPage({
        session,
        assets: matches.map((a) => ({
          id: a.id.toString(),
          name: a.name,
          kind: a.kind,
          clientName: clientName(a.clientId),
          tags: [...a.tags],
          version: a.currentVersion,
        })),
        query: req.query.get('q') ?? '',
        tag: req.query.get('tag') ?? '',
      }),
    );
  }
  if (path === '/assets/new' && method === 'GET') {
    const [clients, brands, projects] = [await app.clients.list(), await app.brands.list(), await app.projects.list()];
    if (clients.length === 0) return res.redirect('/clients/new');
    const values = session.clientId ? { clientId: session.clientId } : {};
    return res.html(assetForm({ session, clients: idName(clients), brands: idName(brands), projects: idName(projects), values }));
  }
  if (path === '/assets' && method === 'POST') {
    const [clients, brands, projects] = [await app.clients.list(), await app.brands.list(), await app.projects.list()];
    const rerender = (msg: string): void =>
      res.html(assetForm({ session, clients: idName(clients), brands: idName(brands), projects: idName(projects), error: msg, values: req.body }), 400);
    const brandId = (req.body['brandId'] ?? '').trim();
    const projectId = (req.body['projectId'] ?? '').trim();
    const r = await app.assets.create({
      tenantId: session.tenantId,
      clientId: (req.body['clientId'] ?? '').trim(),
      ...(brandId ? { brandId } : {}),
      ...(projectId ? { projectId } : {}),
      name: (req.body['name'] ?? '').trim(),
      kind: (req.body['kind'] ?? 'image') as AssetKind,
      content: (req.body['content'] ?? '').trim(),
      tags: parseList(req.body['tags']),
      by: session.actor,
      at: new Date().toISOString(),
    });
    if (r.isErr) return rerender(r.error.message);
    return res.redirect(`/assets/${r.value.id.toString()}`);
  }
  if (path.startsWith('/assets/') && path !== '/assets/new') {
    const seg = path.slice('/assets/'.length).split('/');
    const id = seg[0] ?? '';
    const action = seg[1];
    if (!id) return res.html(notFound(session), 404);

    if (!action && method === 'GET') return renderAssetDetail(app, session, res, id);
    if (action === 'version' && method === 'POST') {
      return mutateAsset(app, session, res, id, (aid) =>
        app.assets.addVersion(aid, { content: (req.body['content'] ?? '').trim(), note: (req.body['note'] ?? '').trim(), by: session.actor, at: new Date().toISOString() }),
      );
    }
    if (action === 'tag' && method === 'POST') {
      return mutateAsset(app, session, res, id, (aid) => app.assets.addTag(aid, req.body['tag'] ?? ''));
    }
    return res.html(notFound(session), 404);
  }

  // ── Marketing Brief list ──
  if (path === '/brief' && method === 'GET') {
    const briefs = await app.briefs.list();
    return res.html(
      listPage({
        session,
        active: '/brief',
        title: t('dash.stat.briefs'),
        subtitle: t('list.briefs.sub'),
        newHref: '/missions',
        newLabel: t('list.goToMissions'),
        columns: [t('list.col.objective'), t('list.col.channels'), t('common.model')],
        rows: briefs.map((b) => [
          `<a href="/missions/${esc(b.missionId)}">${esc(b.content.objective)}</a>`,
          b.content.recommendedChannels.map((c) => `<span class="badge">${esc(c)}</span>`).join(' '),
          `<span class="badge">${esc(b.provenance.model)}</span>`,
        ]),
        empty: t('list.briefs.empty'),
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
        title: t('nav.creative'),
        subtitle: t('list.creative.sub'),
        newHref: '/missions',
        newLabel: t('list.goToMissions'),
        columns: [t('mission.headline'), t('mission.cta'), t('common.model')],
        rows: sets.map((s) => [
          `<a href="/missions/${esc(s.missionId)}">${esc(s.content.headline)}</a>`,
          `<span class="badge">${esc(s.content.cta)}</span>`,
          `<span class="badge">${esc(s.provenance.model)}</span>`,
        ]),
        empty: t('list.creative.empty'),
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
        title: t('nav.campaigns'),
        subtitle: t('list.campaigns.sub'),
        newHref: '/missions',
        newLabel: t('list.goToMissions'),
        columns: [t('common.name'), t('list.col.budget'), t('list.col.channels'), t('common.model')],
        rows: drafts.map((d) => [
          `<a href="/missions/${esc(d.missionId)}">${esc(d.content.name)}</a>`,
          `${(d.totalBudget.amountMinor / 100).toLocaleString()} ${esc(d.totalBudget.currency)}`,
          d.content.channels.map((c) => `<span class="badge">${esc(c.channel)} ${c.budgetPercentage}%</span>`).join(' '),
          `<span class="badge">${esc(d.provenance.model)}</span>`,
        ]),
        empty: t('list.campaigns.empty'),
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
        title: t('nav.analytics'),
        subtitle: t('list.analytics.sub'),
        newHref: '/missions',
        newLabel: t('list.goToMissions'),
        columns: ['ROAS', 'ROI', 'CTR', t('list.col.summary')],
        rows: reports.map((rep) => [
          `<a href="/missions/${esc(rep.missionId)}">${rep.kpi('roas') ?? 0}x</a>`,
          `${rep.kpi('roi') ?? 0}%`,
          `${rep.kpi('ctr') ?? 0}%`,
          esc(rep.narrative.summary),
        ]),
        empty: t('list.analytics.empty'),
      }),
    );
  }

  // ── Reports (client performance reports) ──
  if (path === '/reports' && method === 'GET') {
    const [reports, clients] = [await app.performance.list(), await app.clients.list()];
    const clientName = (cid: string): string => clients.find((c) => c.id.toString() === cid)?.name ?? '—';
    return res.html(
      listPage({
        session,
        active: '/reports',
        title: t('nav.reports'),
        subtitle: t('list.reports.sub'),
        newHref: '/reports/new',
        newLabel: t('list.reports.new'),
        columns: [t('common.title'), t('common.client'), t('list.col.period'), t('list.col.generated')],
        rows: reports.map((r) => [
          `<a href="/reports/${r.id.toString()}">${esc(r.title)}</a>`,
          esc(clientName(r.clientId)),
          esc(r.period),
          esc(r.generatedAt.replace('T', ' ').slice(0, 16)),
        ]),
        empty: t('list.reports.empty'),
      }),
    );
  }
  if (path === '/reports/new' && method === 'GET') {
    const [clients, projects] = [await app.clients.list(), await app.projects.list()];
    if (clients.length === 0) return res.redirect('/clients/new');
    return res.html(reportForm({ session, clients: idName(clients), projects: idName(projects) }));
  }
  if (path === '/reports' && method === 'POST') {
    const [clients, projects] = [await app.clients.list(), await app.projects.list()];
    const rerender = (msg: string): void => res.html(reportForm({ session, clients: idName(clients), projects: idName(projects), error: msg, values: req.body }), 400);
    const clientId = (req.body['clientId'] ?? '').trim();
    const client = clients.find((c) => c.id.toString() === clientId);
    if (!client) return rerender(t('err.selectClientReport'));
    const title = (req.body['title'] ?? '').trim();
    if (!title) return rerender(t('err.titleRequired'));
    const projectId = (req.body['projectId'] ?? '').trim();

    const snapshot = await buildReportSnapshot(app, clientId, client.name, projectId || undefined);
    const r = await app.performance.generate({
      tenantId: session.tenantId,
      clientId,
      ...(projectId ? { projectId } : {}),
      title,
      period: (req.body['period'] ?? '').trim(),
      metrics: snapshot.metrics,
      summary: snapshot.summary,
      generatedBy: session.actor,
      generatedAt: new Date().toISOString(),
    });
    if (r.isErr) return rerender(r.error.message);
    return res.redirect(`/reports/${r.value.id.toString()}`);
  }
  if (path.startsWith('/reports/') && path !== '/reports/new') {
    const id = path.slice('/reports/'.length).split('/')[0] ?? '';
    if (id && method === 'GET') return renderReportDetail(app, session, res, id);
    return res.html(notFound(session), 404);
  }

  // ── AI Execution Traces (Sprint 4.1) + governance metrics/funnel (Sprint 5) ──
  if (path === '/traces' && method === 'GET') {
    const traces = app.traces.list(session.tenantId, 50);
    const decisions = await app.governanceDecisions.list(session.tenantId);
    const metrics = governanceMetrics(app.traces.list(session.tenantId, 100));
    const funnel = approvalFunnel(decisions);
    const review = reviewStats(decisions);
    const latency = stageLatency(app.traces.list(session.tenantId, 100));
    const resilience = resilienceStats(app.traces.list(session.tenantId, 100));
    const missionRows: MissionSummary[] = (await app.missions.list())
      .filter((m) => m.tenantId === session.tenantId)
      .map((m) => ({ revisionCount: m.revisionCount, status: m.status }));
    const revisions = revisionFunnel(missionRows);
    // Auto-Calibration: recompute gate states from the durable decision history
    // (applies any automatic Observe/Candidate/relax transitions) and surface them.
    const calibration = await app.calibration.recompute(Date.now());
    return res.html(tracesPage({ session, traces, metrics, funnel, review, latency, revisions, resilience, calibration }));
  }

  // Governance Auto-Calibration operator actions (data-calibration sprint).
  if (path === '/governance/calibration/promote' && method === 'POST') {
    await app.calibration.promote((req.body['gate'] ?? '').trim());
    return res.redirect('/traces');
  }
  if (path === '/governance/calibration/demote' && method === 'POST') {
    await app.calibration.demote((req.body['gate'] ?? '').trim());
    return res.redirect('/traces');
  }

  // ── Maintenance (data-lifecycle — storage metrics, journal compaction, VACUUM) ──
  if (path === '/maintenance' && method === 'GET') {
    const stats = app.maintenance ? await app.maintenance.stats() : undefined;
    return res.html(maintenancePage({ session, ...(stats ? { stats } : {}) }));
  }
  if (path === '/maintenance/vacuum' && method === 'POST') {
    if (app.maintenance) await app.maintenance.vacuum();
    return res.redirect('/maintenance');
  }
  if (path === '/maintenance/compact' && method === 'POST') {
    if (app.maintenance) {
      const parsed = Number.parseInt(req.body['retain'] ?? '', 10);
      const retain = Number.isFinite(parsed) && parsed >= 0 ? parsed : 500;
      await app.maintenance.compactJournal(retain);
    }
    return res.redirect('/maintenance');
  }

  // ── Runtime Health (Series 3 · Observability — is the system healthy now?) ──
  if (path === '/health' && method === 'GET') {
    return res.html(healthPage({ session, health: await app.health() }));
  }

  // ── Backups (Series 3 · Deployment — app-integrated backup & restore) ──
  if (path === '/backups' && method === 'GET') {
    const backups = app.backups ? await app.backups.listBackups() : undefined;
    return res.html(backupsPage({ session, ...(backups ? { backups } : {}) }));
  }
  if (path === '/backups/create' && method === 'POST') {
    if (app.backups) await app.backups.createBackup();
    return res.redirect('/backups');
  }
  if (path === '/backups/verify' && method === 'POST') {
    const id = (req.body['id'] ?? '').trim();
    if (!app.backups || !id) return res.redirect('/backups');
    const report = await app.backups.verify(id);
    const backups = await app.backups.listBackups();
    return res.html(backupsPage({ session, backups, report }));
  }
  if (path === '/backups/restore' && method === 'POST') {
    const id = (req.body['id'] ?? '').trim();
    if (!app.backups || !id) return res.redirect('/backups');
    // Restore replaces live data — require an explicit confirmation (operator gate).
    if (req.body['confirm'] !== 'yes') {
      const report = await app.backups.verify(id); // re-show the dry-run to confirm against
      const backups = await app.backups.listBackups();
      return res.html(backupsPage({ session, backups, report }));
    }
    const report = await app.backups.restore(id);
    const backups = await app.backups.listBackups();
    return res.html(backupsPage({ session, backups, report, restored: report.ok }));
  }

  // ── Recommendations (Sprint 10 — ranked, brain-grounded next actions) ──
  if (path === '/recommendations' && method === 'GET') {
    const clients = await app.clients.list();
    const missions = (await app.missions.list()).filter((m) => m.tenantId === session.tenantId);
    const industryOf = new Map(clients.map((c) => [c.id.toString(), c.industry]));
    // Aggregate the tenant's mission history per vertical (client industry).
    const agg = new Map<string, { missions: number; completed: number; revisions: number }>();
    for (const c of clients) if (!agg.has(c.industry)) agg.set(c.industry, { missions: 0, completed: 0, revisions: 0 });
    for (const m of missions) {
      const vertical = industryOf.get(m.clientId) ?? 'general';
      const a = agg.get(vertical) ?? { missions: 0, completed: 0, revisions: 0 };
      a.missions += 1;
      if (m.status === 'completed') a.completed += 1;
      a.revisions += m.revisionCount;
      agg.set(vertical, a);
    }
    const stats: VerticalStat[] = [];
    for (const [vertical, a] of agg) {
      stats.push({ vertical, insight: await app.brain.marketing(vertical), missions: a.missions, completed: a.completed, revisions: a.revisions });
    }
    return res.html(recommendationsPage({ session, recommendations: recommend(stats), queue: await app.missionQueue.list(session.tenantId) }));
  }
  // Recommendation → Apply: the agent turns a recommendation into a queued, governed mission.
  if (path === '/recommendations/apply' && method === 'POST') return applyRecommendation(app, session, res, req);

  // ── Executive (CEO Dashboards, Phase 10) ──
  if (path === '/executive' && method === 'GET') {
    const [reports, missions] = [await app.executive.list(), await app.missions.list()];
    const objective = (mid: string): string => missions.find((m) => m.id.toString() === mid)?.brief ?? '—';
    const verdictBadge = (v: string): string => `<span class="badge ${v === 'exceeded' ? 'active' : ''}">${esc(v.replace('_', ' '))}</span>`;
    return res.html(
      listPage({
        session,
        active: '/executive',
        title: t('nav.executive'),
        subtitle: t('list.executive.sub'),
        newHref: '/missions',
        newLabel: t('list.goToMissions'),
        columns: [t('list.col.mission'), t('list.col.verdict'), t('mission.headline'), t('common.model')],
        rows: reports.map((r) => [
          `<a href="/missions/${esc(r.missionId)}">${esc(objective(r.missionId))}</a>`,
          verdictBadge(r.verdict),
          esc(r.content.headline),
          `<span class="badge">${esc(r.provenance.model)}</span>`,
        ]),
        empty: t('list.executive.empty'),
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
    if (action === 'approve' && method === 'POST') return gateApprove(app, session, res, id, 'strategy_and_budget', acknowledged(req));
    if (action === 'reject' && method === 'POST') return gateReject(app, session, res, id, 'strategy_and_budget', 'Rejected by executive');

    // Phase 3 — creative + creative-review gate.
    if (action === 'creative' && !sub && method === 'POST') return generateCreative(app, session, res, id);
    if (action === 'creative' && sub === 'approve' && method === 'POST') return gateApprove(app, session, res, id, 'creative_assets', acknowledged(req));
    if (action === 'creative' && sub === 'reject' && method === 'POST') return gateReject(app, session, res, id, 'creative_assets', 'Creative rejected by executive');

    // Phase 4 — campaign + launch-approval gate.
    if (action === 'campaign' && !sub && method === 'POST') return generateCampaign(app, session, res, id);
    if (action === 'campaign' && sub === 'approve' && method === 'POST') return gateApprove(app, session, res, id, 'campaign_launch', acknowledged(req));
    if (action === 'campaign' && sub === 'reject' && method === 'POST') return gateReject(app, session, res, id, 'campaign_launch', 'Campaign rejected by executive');

    // Phase 5 — analytics report (no approval gate; produces KPIs + summary).
    if (action === 'analytics' && method === 'POST') return generateReport(app, session, res, id, req);

    // Phase 10 — CEO Dashboard: the executive synthesis of the mission.
    if (action === 'executive' && method === 'POST') return generateExecutive(app, session, res, id);

    // Phase 6 — record the outcome into the Company Brain (learning flow).
    if (action === 'learn' && method === 'POST') return recordLearning(app, session, res, id);

    // Customer-initiated cancellation — fail the mission with a reason.
    if (action === 'cancel' && method === 'POST') return cancelMission(app, session, res, id, (req.body['reason'] ?? '').trim());

    return res.html(notFound(session), 404);
  }

  // ── Settings (Phase 11) ──
  if (path === '/settings' && method === 'GET') {
    const workspaces = await app.workspaces.list();
    if (workspaces.length === 0) return res.redirect('/workspaces/new');
    const wanted = req.query.get('workspaceId') || session.workspaceId || workspaces[0]!.id.toString();
    const ws = workspaces.find((w) => w.id.toString() === wanted) ?? workspaces[0]!;
    return res.html(
      settingsPage({
        session,
        workspaces: idName(workspaces),
        selectedId: ws.id.toString(),
        values: { name: ws.name, currency: ws.settings.currency, timezone: ws.settings.timezone, locale: ws.settings.locale },
        saved: req.query.get('saved') === '1',
      }),
    );
  }
  if (path === '/settings' && method === 'POST') {
    const workspaces = await app.workspaces.list();
    const id = (req.body['workspaceId'] ?? '').trim();
    const name = (req.body['name'] ?? '').trim();
    const currency = (req.body['currency'] ?? '').trim();
    const timezone = (req.body['timezone'] ?? '').trim();
    const locale = (req.body['locale'] ?? '').trim();
    const rerender = (msg: string): void =>
      res.html(settingsPage({ session, workspaces: idName(workspaces), selectedId: id, values: { name, currency, timezone, locale }, error: msg }), 400);
    const ws = workspaces.find((w) => w.id.toString() === id);
    if (!ws) return rerender(t('err.selectWorkspace'));
    if (!name || !currency || !timezone || !locale) return rerender(t('err.settingsRequired'));
    if (name !== ws.name) {
      const renamed = await app.workspaces.rename(WorkspaceId.of(id), name);
      if (renamed.isErr) return rerender(renamed.error.message);
    }
    const saved = await app.workspaces.updateSettings(WorkspaceId.of(id), { currency, timezone, locale });
    if (saved.isErr) return rerender(saved.error.message);
    return res.redirect(`/settings?workspaceId=${encodeURIComponent(id)}&saved=1`);
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
  const executive = (await app.executive.list(id))[0];

  // Mission plan (Sprint 9): a deterministic, brain-grounded plan of the mission,
  // shown up front. Grounded in the vertical's accumulated performance when the
  // Company Brain has history for it.
  const planClient = await app.clients.get(ClientId.of(mission.clientId));
  const vertical = planClient.isErr ? 'general' : planClient.value.industry;
  const plan = planMission({
    objective: mission.brief,
    vertical,
    budgetAmount: mission.budget ? mission.budget.amountMinor / 100 : 0,
    currency: mission.budget?.currency ?? 'TRY',
    insight: await app.brain.marketing(vertical),
  });

  // Each earlier stage is implicitly approved once the next artifact exists.
  const briefApproval: Approval = !brief ? 'none' : creative ? 'approved' : statusApproval(mission.status);
  const creativeApproval: Approval = !creative ? 'none' : campaign ? 'approved' : statusApproval(mission.status);
  const campaignApproval: Approval = !campaign ? 'none' : report ? 'approved' : statusApproval(mission.status);

  // The gate the mission is currently awaiting (for governance enforcement, Sprint 8).
  const activeGate: MissionGate | undefined =
    briefApproval === 'pending' ? 'strategy_and_budget'
    : creativeApproval === 'pending' ? 'creative_assets'
    : campaignApproval === 'pending' ? 'campaign_launch'
    : undefined;

  const spend = mission.budget ? mission.budget.amountMinor / 100 : 1000;
  const currency = mission.budget?.currency ?? 'TRY';

  // Learning is recorded once the mission is completed (Phase 6).
  const journalEntry = mission.status === 'completed' ? (await app.journal.history({ tenantId: session.tenantId, subjectId: id, k: 1 }))[0] : undefined;
  const learning: LearningView | undefined = journalEntry
    ? {
        decision: journalEntry.decision,
        chosen: journalEntry.chosen,
        confidence: journalEntry.confidence.score,
        outcome: Object.entries(journalEntry.outcome ?? {}).map(([label, value]) => ({ label, value: String(value) })),
        learned: String((journalEntry.outcome as Record<string, unknown> | undefined)?.['learned'] ?? journalEntry.decision),
      }
    : undefined;

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
      ...(learning ? { learning } : {}),
      ...(executive ? { executive: toExecutiveView(executive) } : {}),
      plan,
      ...(mission.status === 'awaiting_approval' ? spreadGovernance(app, session.tenantId, id, activeGate) : {}),
      canCancel: mission.status !== 'completed' && mission.status !== 'failed',
      ...(mission.failureReason ? { failureReason: mission.failureReason } : {}),
      ...(error ? { error } : {}),
    }),
  );
}

/**
 * The governance readout for the artifact in the gate (Sprint 4.3A). Reads the
 * latest ExecutionTrace for the mission that carries a constitution verdict and
 * surfaces it as advisory — it informs the human decision, it never blocks.
 */
function spreadGovernance(app: App, tenantId: string, missionId: string, activeGate?: MissionGate): { governance?: GovernanceView } {
  const trace = latestGovernanceTrace(app, tenantId, missionId);
  if (!trace) return {};
  const detail = trace.steps.find((s) => s.name === 'constitution')?.detail ?? {};
  const violations = Array.isArray(detail['violations']) ? (detail['violations'] as string[]) : [];
  // Sprint 8: mark the view as enforced when this gate hard-blocks a failing
  // verdict, so the UI shows a block (no ack/approve) instead of the ack path.
  const enforced = !!activeGate && app.enforcedAt(activeGate);
  return { governance: { passed: Boolean(detail['passed']), confidence: trace.confidence?.score ?? 0, violations, enforced } };
}

/** The latest ExecutionTrace for the mission that carries a constitution verdict. */
function latestGovernanceTrace(app: App, tenantId: string, missionId: string): ExecutionTrace | undefined {
  return app.traces
    .list(tenantId, 50)
    .find((tr) => tr.missionId === missionId && tr.steps.some((s) => s.name === 'constitution'));
}

/** Map a mission status to a review state for whichever artifact is in the gate. */
function statusApproval(status: string): Approval {
  if (status === 'awaiting_approval') return 'pending';
  if (status === 'failed') return 'rejected';
  if (status === 'planning' || status === 'executing' || status === 'completed') return 'approved';
  return 'none';
}

async function gateApprove(app: App, session: Session, res: Res, id: string, gate: 'strategy_and_budget' | 'creative_assets' | 'campaign_launch', acknowledged: boolean): Promise<void> {
  // Sprint 4.3B (Required Review, phase 1): when governance flagged this
  // artifact, approving REQUIRES an explicit operator acknowledgment — but the
  // approval is still possible once acknowledged (override, not a hard block).
  const trace = latestGovernanceTrace(app, session.tenantId, id);
  const flagged = !!trace && !constitutionPassed(trace);
  // Sprint 8 — Enforced tier: when this gate is hard-enforced and governance
  // flagged the artifact, approval is BLOCKED server-side with no override.
  if (flagged && app.enforcedAt(gate)) {
    return renderMissionDetail(app, session, res, id, t('gov.enforcedBlock'));
  }
  if (!acknowledged && flagged) {
    return renderMissionDetail(app, session, res, id, t('gov.reviewRequiredError'));
  }
  const r = await app.missions.approve(MissionId.of(id), gate);
  if (r.isErr) return renderMissionDetail(app, session, res, id, r.error.message);
  // Sprint 5: record the gate decision for the approval/override funnel + review
  // duration. `reviewMs` is the real wall-clock gap from the reviewed artifact's
  // trace finishing (it became ready for review) to this approval; recorded only
  // when the trace could be matched, so review-duration stats stay honest.
  const finishedAt = trace?.finishedAt ? Date.parse(trace.finishedAt) : NaN;
  const reviewMs = Number.isNaN(finishedAt) ? undefined : Math.max(0, Date.now() - finishedAt);
  await app.governanceDecisions.record(session.tenantId, {
    gate,
    flagged,
    acknowledged,
    at: new Date().toISOString(),
    ...(trace?.capability ? { capability: trace.capability } : {}),
    ...(reviewMs !== undefined ? { reviewMs } : {}),
  });
  // Recompute this metric's calibration so a rising override rate auto-relaxes an
  // Enforced gate before the next approval (the only automatic enforcement change).
  await app.calibration.recompute(Date.now());
  return res.redirect(`/missions/${id}`);
}

/** Did the operator explicitly acknowledge the governance flags on this POST? */
function acknowledged(req: Req): boolean {
  return req.body['acknowledge'] === 'governance';
}

/** True when a trace's recorded constitution verdict passed. */
function constitutionPassed(trace: ExecutionTrace): boolean {
  const detail = trace.steps.find((s) => s.name === 'constitution')?.detail ?? {};
  return Boolean(detail['passed']);
}

/**
 * Human rejection at a gate — NON-DESTRUCTIVE (Book F, Law 5). The mission is
 * sent back for revision (returned to `planning`, rejection recorded in its
 * revision history) rather than terminally failed, and the rejected draft is
 * discarded so the stage can be regenerated. Approving a later stage is never
 * possible on a rejected one because its artifact is gone.
 */
async function gateReject(
  app: App,
  session: Session,
  res: Res,
  id: string,
  gate: 'strategy_and_budget' | 'creative_assets' | 'campaign_launch',
  reason: string,
): Promise<void> {
  const r = await app.missions.requestRevision(MissionId.of(id), gate, reason);
  if (r.isErr) return renderMissionDetail(app, session, res, id, r.error.message);
  await discardRejectedDraft(app, id, gate);
  return res.redirect(`/missions/${id}`);
}

/** Remove the rejected stage's draft so it is regenerated fresh on rework. */
async function discardRejectedDraft(app: App, id: string, gate: 'strategy_and_budget' | 'creative_assets' | 'campaign_launch'): Promise<void> {
  if (gate === 'strategy_and_budget') return app.briefs.discardForMission(id);
  if (gate === 'creative_assets') return app.creative.discardForMission(id);
  if (gate === 'campaign_launch') return app.campaigns.discardForMission(id);
}

/** Customer-initiated cancellation: fail the mission with the given reason. */
async function cancelMission(app: App, session: Session, res: Res, id: string, reason: string): Promise<void> {
  const r = await app.missions.fail(MissionId.of(id), reason || 'Cancelled by the customer');
  if (r.isErr) return renderMissionDetail(app, session, res, id, r.error.message);
  return res.redirect(`/missions/${id}`);
}

/**
 * Map a generation failure to an operator-facing message (Sprint 7 — graceful
 * degrade). When the AI is transiently unavailable — the resilient pipeline
 * exhausted every routed model — the error is `retryable`; we show a clear
 * "temporarily unavailable, mission unchanged, retry" banner rather than a raw
 * technical string. The mission is never corrupted: no artifact was created, so
 * clicking generate again simply retries. Non-retryable errors keep their
 * specific message.
 */
function generationErrorMessage(error: AppError): string {
  return error.retryable ? t('ai.unavailable') : error.message;
}

/** The mission objective an applied recommendation becomes. */
function recommendationObjective(kind: string, vertical: string): string {
  if (kind === 'scale') return t('rec.obj.scale', { vertical });
  if (kind === 'improve') return t('rec.obj.improve', { vertical });
  return t('rec.obj.explore', { vertical });
}

/**
 * Recommendation → Apply (safe application). The operator applies a
 * recommendation; the system creates a mission from it and ENQUEUES a job — it
 * does not run the generation inline. A background {@link QueueWorker} later
 * claims the job, runs the mechanical generation (the brief, through the full
 * governed pipeline — routing, evidence/confidence/constitution observe) and the
 * mission STOPS at the human approval gate (Book F Law 5 — the human gate is
 * never skipped). Because the queue is durable, an applied recommendation is not
 * lost if the process restarts before the worker gets to it — the worker resumes
 * it. The human picks up the decision, with the governance verdict (and any
 * enforced hard-block) applied at the gate exactly as for a hand-run mission. So
 * the platform turns advice into governed, queued work — never into an
 * autonomous, ungoverned launch.
 */
async function applyRecommendation(app: App, session: Session, res: Res, req: Req): Promise<void> {
  const vertical = (req.body['vertical'] ?? '').trim();
  const kind = (req.body['kind'] ?? '').trim();
  if (!vertical) return res.redirect('/recommendations');

  // Fail fast: an applicable client (with a brand + product) must exist in the
  // vertical before we create a mission the worker could never complete.
  const clients = (await app.clients.list()).filter((c) => c.industry === vertical);
  let chosen: (typeof clients)[number] | undefined;
  for (const c of clients) {
    const b = (await app.brands.list(c.id.toString()))[0];
    const p = (await app.products.list(c.id.toString()))[0];
    if (b && p) {
      chosen = c;
      break;
    }
  }
  if (!chosen) {
    const queue = await app.missionQueue.list(session.tenantId); // keep the queue visible
    return res.html(recommendationsPage({ session, recommendations: [], queue, error: t('rec.applyNoClient', { vertical }) }), 400);
  }

  // Create the mission from the recommendation (a sensible default budget).
  const objective = recommendationObjective(kind, vertical);
  const wizard = MissionWizard.start({
    tenantId: session.tenantId,
    workspaceId: chosen.workspaceId,
    clientId: chosen.id.toString(),
    createdBy: session.actor,
  })
    .withObjective(objective)
    .withBudget({ amountMinor: 500000, currency: 'TRY', period: 'monthly' });
  const created = await app.missions.submit(wizard);
  if (created.isErr) {
    const queue = await app.missionQueue.list(session.tenantId);
    return res.html(recommendationsPage({ session, recommendations: [], queue, error: created.error.message }), 400);
  }
  const missionId = created.value.id.toString();

  // Enqueue the job; the background worker generates the brief and stops at the
  // human gate. The queue records what the recommendation turned into.
  await app.missionQueue.enqueue({ missionId, tenantId: session.tenantId, vertical, kind, objective });
  return res.redirect(`/missions/${missionId}`);
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
        prereqMissing: t('err.brandProductForBrief'),
      }),
    );
  }
  const outcome = await briefGenerateAndAdvance(app, id, mission, clientRes.value, brand, product);
  if (outcome.isErr) return renderMissionDetail(app, session, res, id, generationErrorMessage(outcome.error));
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
    return renderMissionDetail(app, session, res, id, t('err.approveBriefFirst'));
  }
  const brand = (await app.brands.list(mission.clientId))[0];
  const product = (await app.products.list(mission.clientId))[0];
  if (!brand || !product) {
    return renderMissionDetail(app, session, res, id, t('err.brandProductForCreative'));
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
    brandId: brand.id.toString(),
    bannedWords: [...brand.rules.bannedWords],
  });
  if (generated.isErr) return renderMissionDetail(app, session, res, id, generationErrorMessage(generated.error));

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
    return renderMissionDetail(app, session, res, id, t('err.approveCreativeFirst'));
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
  if (generated.isErr) return renderMissionDetail(app, session, res, id, generationErrorMessage(generated.error));

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
    return renderMissionDetail(app, session, res, id, t('err.approveCampaignFirst'));
  }

  const intOf = (v: string | undefined): number => {
    const n = Number.parseInt(v ?? '', 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const currency = req.body['currency'] || 'TRY';
  const spendMinor = toMinor(req.body['spend'] ?? '0');
  const revenueMinor = toMinor(req.body['revenue'] ?? '0');
  if (Number.isNaN(spendMinor) || Number.isNaN(revenueMinor)) {
    return renderMissionDetail(app, session, res, id, t('err.spendRevenueNumbers'));
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
  if (generated.isErr) return renderMissionDetail(app, session, res, id, generationErrorMessage(generated.error));
  return res.redirect(`/missions/${id}`);
}

/** Phase 10 — the CEO Dashboard. Synthesize the mission (objective + report KPIs)
 * into an executive view via the AI Manager. Requires an analytics report. */
async function generateExecutive(app: App, session: Session, res: Res, id: string): Promise<void> {
  const found = await app.missions.get(MissionId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const mission = found.value;

  const report = (await app.reports.list(id))[0];
  if (!report) {
    return renderMissionDetail(app, session, res, id, t('err.reportBeforeCeo'));
  }
  if ((await app.executive.list(id)).length > 0) return res.redirect(`/missions/${id}`); // idempotent

  const brief = (await app.briefs.list(id))[0];
  const clientRes = await app.clients.get(ClientId.of(mission.clientId));
  const clientName = clientRes.isOk ? clientRes.value.name : 'the client';

  const generated = await app.executive.generate({
    tenantId: session.tenantId,
    missionId: id,
    clientId: mission.clientId,
    clientName,
    missionBrief: mission.brief,
    objective: brief?.content.objective ?? mission.brief,
    reportId: report.id.toString(),
    kpis: report.kpis.map((k) => ({ name: k.name, value: k.value, unit: k.unit })),
    reportSummary: report.narrative.summary,
    reportRecommendations: [...report.narrative.recommendations],
  });
  if (generated.isErr) return renderMissionDetail(app, session, res, id, generationErrorMessage(generated.error));
  return res.redirect(`/missions/${id}`);
}

/**
 * Phase 6 — the learning flow. Once a mission has an analytics report, record its
 * outcome across the company's knowledge stores so the company compounds what it
 * learns: Decision Journal → Executive Memory → Company Brain (Experience →
 * Pattern Library → Knowledge Graph). Completes the mission.
 */
async function recordLearning(app: App, session: Session, res: Res, id: string): Promise<void> {
  const found = await app.missions.get(MissionId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const mission = found.value;
  if (mission.status === 'completed') return res.redirect(`/missions/${id}`); // idempotent

  const brief = (await app.briefs.list(id))[0];
  const campaign = (await app.campaigns.list(id))[0];
  const report = (await app.reports.list(id))[0];
  if (!campaign || !report) {
    return renderMissionDetail(app, session, res, id, t('err.reportBeforeLearning'));
  }
  const clientRes = await app.clients.get(ClientId.of(mission.clientId));
  const vertical = clientRes.isOk ? clientRes.value.industry : 'general';

  const roas = report.kpi('roas') ?? 0;
  const roi = report.kpi('roi') ?? 0;
  const ctr = report.kpi('ctr') ?? 0;
  const channels = campaign.content.channels.map((c) => c.channel);
  const won = roas >= 1;
  const chosen = won ? t('learn.chosen.scale') : t('learn.chosen.rework');
  const learned = t('learn.insight', { vertical, name: campaign.content.name, channels: channels.join(' + '), roas, verdict: won ? t('learn.reuse') : t('learn.avoid') });
  const now = new Date().toISOString();
  const at = now;

  // 1) Decision Journal — why the CMO decided what they did, with evidence.
  await app.journal.record({
    tenantId: session.tenantId,
    role: 'cmo',
    subjectId: id,
    decision: `Post-campaign review for "${campaign.content.name}"`,
    evidence: [
      { source: 'campaign', ref: campaign.id.toString(), weight: 0.6 },
      { source: 'metric', ref: report.id.toString(), detail: `roas ${roas}x`, weight: 0.9 },
    ],
    alternatives: ['Scale', 'Hold', 'Rework'],
    chosen,
    rejected: won ? ['Rework'] : ['Scale'],
    confidence: { score: Math.round(Math.max(10, Math.min(95, roas * 25))), reason: `Based on ${roas}x ROAS`, basis: { sampleSize: 1, roas } },
    outcome: { roas, roi, ctr, learned },
    at,
  });

  // 2) Executive Memory — durable CMO memory of this campaign.
  await app.execMemory.remember({
    tenantId: session.tenantId,
    role: 'cmo',
    category: 'campaign',
    content: `Mission ${id}: ${mission.brief} → ${roas}x ROAS on ${channels.join(', ')}. ${learned}`,
    importance: Math.max(0, Math.min(1, roas / 5)),
    metadata: { missionId: id, roas },
  });

  // 3) Company Brain — experience, reusable pattern, knowledge graph facts.
  await app.brain.experience.record({
    tenantId: session.tenantId,
    vertical,
    context: { channels },
    action: campaign.content.name,
    result: { roas, ctr, roi },
    reason: won ? 'Positive return on the chosen channel mix' : 'Below break-even',
    learned,
    at,
  });
  await app.brain.patterns.capture({
    domain: vertical,
    name: `${vertical}: ${channels.join('+')} launch`,
    structure: [...channels.map((ch) => `${ch} ad set`), 'measure', 'reallocate'],
    evidence: { sampleSize: 1, metric: 'roas', value: roas },
  });
  const campaignNode = `campaign:${campaign.id.toString()}`;
  const reportNode = `report:${report.id.toString()}`;
  const missionNode = `mission:${id}`;
  await app.brain.graph.upsertNode({ id: missionNode, type: 'Mission', props: { objective: mission.brief } });
  await app.brain.graph.upsertNode({ id: campaignNode, type: 'Campaign', props: { name: campaign.content.name } });
  await app.brain.graph.upsertNode({ id: reportNode, type: 'Report', props: { roas, roi } });
  if (brief) await app.brain.graph.relate({ from: missionNode, to: `brief:${brief.id.toString()}`, relation: 'planned_by' });
  await app.brain.graph.relate({ from: missionNode, to: campaignNode, relation: 'ran' });
  await app.brain.graph.relate({ from: campaignNode, to: reportNode, relation: 'produced' });

  // 3b) Per-vertical Marketing memory — the aggregate a NEW campaign reads back for
  // context. enrich() sample-weight-merges KPIs so N campaigns become one running
  // average (ctr/cpa/roas + sampleSize). Descriptive history only; not a ranking.
  const cpa = report.kpi('cpa') ?? 0;
  await app.brain.enrich({
    kind: 'marketing',
    insight: {
      vertical,
      ctr,
      cpa,
      roas,
      // Qualitative fields are carried, not ranked — the read-back summary uses only the KPIs.
      bestHook: campaign.content.name,
      bestHeadline: brief?.content.objective ?? campaign.content.name,
      bestOffer: channels[0] ?? 'meta',
      bestFunnel: channels.join(' + '),
      sampleSize: 1,
    },
  });

  // 4) Announce the learning + complete the mission.
  await app.emit(EXECUTIVE_MEMORY_EVENTS.DECISION_JOURNALED, id, { role: 'cmo', roas });
  await app.emit(EXECUTIVE_MEMORY_EVENTS.MEMORY_UPDATED, id, { role: 'cmo' });
  await app.emit(COMPANY_BRAIN_EVENTS.EXPERIENCE_RECORDED, id, { vertical, roas });
  await app.emit(COMPANY_BRAIN_EVENTS.PATTERN_CAPTURED, id, { vertical });
  await app.emit(COMPANY_BRAIN_EVENTS.BRAIN_ENRICHED, id, { vertical, roas });

  // Close out the mission: planning → executing → completed.
  await app.missions.startExecuting(MissionId.of(id));
  await app.missions.complete(MissionId.of(id));

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

function toExecutiveView(exec: {
  content: {
    headline: string;
    executiveSummary: string;
    verdict: string;
    keyResults: Array<{ metric: string; value: number; unit: string; verdict: string }>;
    decisions: string[];
    nextActions: string[];
  };
  provenance: { model: string };
}): ExecutiveView {
  return {
    headline: exec.content.headline,
    executiveSummary: exec.content.executiveSummary,
    verdict: exec.content.verdict,
    keyResults: exec.content.keyResults.map((k) => ({ ...k })),
    decisions: [...exec.content.decisions],
    nextActions: [...exec.content.nextActions],
    model: exec.provenance.model,
  };
}

/** Assemble and render the Project Dashboard: details, status, goals, members,
 * owned missions (+ artifact rollup) and a timeline. */
async function renderProjectDashboard(app: App, session: Session, res: Res, id: string, error?: string): Promise<void> {
  const found = await app.projects.get(ProjectId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const project = found.value;

  const clientRes = await app.clients.get(ClientId.of(project.clientId));
  const clientName = clientRes.isOk ? clientRes.value.name : '—';
  const brandName = (await app.brands.list()).find((b) => b.id.toString() === project.brandId)?.name ?? '—';

  const missions = (await app.missions.list()).filter((m) => m.projectId === id);
  const rollup = { briefs: 0, creatives: 0, campaigns: 0, reports: 0 };
  const timeline: Array<{ label: string; detail: string }> = [{ label: 'Project created', detail: project.name }];

  for (const m of missions) {
    const mid = m.id.toString();
    const [briefs, creatives, campaigns, reports] = await Promise.all([
      app.briefs.list(mid),
      app.creative.list(mid),
      app.campaigns.list(mid),
      app.reports.list(mid),
    ]);
    rollup.briefs += briefs.length;
    rollup.creatives += creatives.length;
    rollup.campaigns += campaigns.length;
    rollup.reports += reports.length;
    timeline.push({ label: 'Mission started', detail: m.brief });
    if (briefs.length) timeline.push({ label: 'Marketing brief generated', detail: m.brief });
    if (creatives.length) timeline.push({ label: 'Creative produced', detail: m.brief });
    if (campaigns.length) timeline.push({ label: 'Campaign drafted', detail: m.brief });
    if (reports.length) timeline.push({ label: 'Analytics report generated', detail: m.brief });
    if (m.status === 'completed') timeline.push({ label: 'Learning recorded · mission completed', detail: m.brief });
  }

  const data: ProjectDashboardData = {
    project: {
      id,
      name: project.name,
      description: project.description,
      status: project.status,
      clientName,
      brandName,
    },
    goals: project.goals.map((g) => ({ ...g })),
    members: project.members.map((m) => ({ ...m })),
    timeline,
    missions: missions.map((m) => ({ id: m.id.toString(), objective: m.brief, status: m.status })),
    rollup,
  };
  return res.html(projectDashboardPage({ session, data, ...(error ? { error } : {}) }));
}

async function mutateProject(
  app: App,
  session: Session,
  res: Res,
  id: string,
  change: (pid: ProjectId) => Promise<{ isErr: boolean; error?: { message: string } }>,
): Promise<void> {
  const r = await change(ProjectId.of(id));
  if (r.isErr) return renderProjectDashboard(app, session, res, id, r.error?.message ?? 'Update failed');
  return res.redirect(`/projects/${id}`);
}

/** Load an approval and render its detail page (details, decision controls, timeline). */
async function renderApprovalDetail(app: App, session: Session, res: Res, id: string, error?: string): Promise<void> {
  const found = await app.approvals.get(ApprovalId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const approval = found.value;
  const projectName = approval.projectId
    ? (await app.projects.list()).find((p) => p.id.toString() === approval.projectId)?.name
    : undefined;

  const data: ApprovalDetailData = {
    id,
    title: approval.title,
    description: approval.description,
    status: approval.status,
    requestedBy: approval.requestedBy,
    ...(projectName ? { projectName } : {}),
    timeline: approval.timeline.map((t) => ({ action: t.action, from: t.from, to: t.to, note: t.note, actor: t.actor, at: t.at })),
  };
  return res.html(approvalDetailPage({ session, data, ...(error ? { error } : {}) }));
}

async function mutateApproval(
  app: App,
  session: Session,
  res: Res,
  id: string,
  change: (aid: ApprovalId) => Promise<{ isErr: boolean; error?: { message: string } }>,
): Promise<void> {
  const r = await change(ApprovalId.of(id));
  if (r.isErr) return renderApprovalDetail(app, session, res, id, r.error?.message ?? 'Transition failed');
  return res.redirect(`/approvals/${id}`);
}

/** Load an asset and render its preview + tags + version history. */
async function renderAssetDetail(app: App, session: Session, res: Res, id: string, error?: string): Promise<void> {
  const found = await app.assets.get(AssetId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const asset = found.value;

  const clientRes = await app.clients.get(ClientId.of(asset.clientId));
  const clientName = clientRes.isOk ? clientRes.value.name : '—';
  const brandName = asset.brandId ? (await app.brands.list()).find((b) => b.id.toString() === asset.brandId)?.name : undefined;
  const projectName = asset.projectId ? (await app.projects.list()).find((p) => p.id.toString() === asset.projectId)?.name : undefined;

  const data: AssetDetailData = {
    id,
    name: asset.name,
    kind: asset.kind,
    clientName,
    ...(brandName ? { brandName } : {}),
    ...(projectName ? { projectName } : {}),
    tags: [...asset.tags],
    currentContent: asset.currentContent,
    currentVersion: asset.currentVersion,
    versions: asset.versions.map((v) => ({ version: v.version, note: v.note, by: v.by, at: v.at })),
  };
  return res.html(assetDetailPage({ session, data, ...(error ? { error } : {}) }));
}

async function mutateAsset(
  app: App,
  session: Session,
  res: Res,
  id: string,
  change: (aid: AssetId) => Promise<{ isErr: boolean; error?: { message: string } }>,
): Promise<void> {
  const r = await change(AssetId.of(id));
  if (r.isErr) return renderAssetDetail(app, session, res, id, r.error?.message ?? 'Update failed');
  return res.redirect(`/assets/${id}`);
}

/** Aggregate a client's work into a deterministic performance snapshot. */
async function buildReportSnapshot(
  app: App,
  clientId: string,
  clientName: string,
  projectId?: string,
): Promise<{ metrics: ReportMetric[]; summary: string }> {
  const missions = (await app.missions.list()).filter(
    (m) => m.clientId === clientId && (projectId === undefined || m.projectId === projectId),
  );
  const completed = missions.filter((m) => m.status === 'completed').length;

  let campaignCount = 0;
  let totalBudgetMinor = 0;
  let currency = 'TRY';
  const roasValues: number[] = [];
  const verdicts = { exceeded: 0, on_track: 0, at_risk: 0 };

  for (const m of missions) {
    if (m.budget) {
      totalBudgetMinor += m.budget.amountMinor;
      currency = m.budget.currency;
    }
    const mid = m.id.toString();
    const [campaigns, reports, execs] = await Promise.all([
      app.campaigns.list(mid),
      app.reports.list(mid),
      app.executive.list(mid),
    ]);
    campaignCount += campaigns.length;
    for (const rep of reports) roasValues.push(rep.kpi('roas') ?? 0);
    for (const ex of execs) {
      if (ex.verdict === 'exceeded') verdicts.exceeded += 1;
      else if (ex.verdict === 'on_track') verdicts.on_track += 1;
      else verdicts.at_risk += 1;
    }
  }

  const avgRoas = roasValues.length ? Math.round((roasValues.reduce((a, b) => a + b, 0) / roasValues.length) * 100) / 100 : 0;
  const totalBudget = `${(totalBudgetMinor / 100).toLocaleString()} ${currency}`;

  const metrics: ReportMetric[] = [
    { label: 'Missions', value: String(missions.length) },
    { label: 'Completed', value: String(completed) },
    { label: 'Campaigns', value: String(campaignCount) },
    { label: 'Total budget', value: totalBudget },
    { label: 'Avg ROAS', value: `${avgRoas}x` },
    { label: 'CEO verdicts', value: verdicts.exceeded + verdicts.on_track + verdicts.at_risk ? `${verdicts.exceeded} exceeded · ${verdicts.on_track} on track · ${verdicts.at_risk} at risk` : '—' },
  ];

  const summary =
    missions.length === 0
      ? `${clientName} has no missions in this scope yet.`
      : `${clientName} ran ${missions.length} mission${missions.length === 1 ? '' : 's'} (${completed} completed) across ${campaignCount} campaign${campaignCount === 1 ? '' : 's'} on a total budget of ${totalBudget}${roasValues.length ? `, averaging ${avgRoas}x ROAS` : ''}.`;

  return { metrics, summary };
}

/** Load a performance report and render its detail page. */
async function renderReportDetail(app: App, session: Session, res: Res, id: string): Promise<void> {
  const found = await app.performance.get(PerformanceReportId.of(id));
  if (found.isErr) return res.html(notFound(session), 404);
  const report = found.value;

  const clientRes = await app.clients.get(ClientId.of(report.clientId));
  const clientName = clientRes.isOk ? clientRes.value.name : '—';
  const projectName = report.projectId
    ? (await app.projects.list()).find((p) => p.id.toString() === report.projectId)?.name
    : undefined;

  const data: ReportDetailData = {
    id,
    title: report.title,
    clientName,
    ...(projectName ? { projectName } : {}),
    period: report.period,
    generatedBy: report.generatedBy,
    generatedAt: report.generatedAt,
    metrics: report.metrics.map((m) => ({ ...m })),
    summary: report.summary,
  };
  return res.html(reportDetailPage({ session, data }));
}

async function collectStats(app: App): Promise<DashStats> {
  const [workspaces, clients, brands, products, missions, briefs, creatives, campaigns, reports, approvals, assets, executives] = await Promise.all([
    app.workspaces.list(),
    app.clients.list(),
    app.brands.list(),
    app.products.list(),
    app.missions.list(),
    app.briefs.list(),
    app.creative.list(),
    app.campaigns.list(),
    app.reports.list(),
    app.approvals.list(),
    app.assets.list(),
    app.executive.list(),
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
    learnings: missions.filter((m) => m.status === 'completed').length,
    approvals: approvals.length,
    assets: assets.length,
    executives: executives.length,
  };
}

function idName(items: Array<{ id: { toString(): string }; name: string }>): Array<{ id: string; name: string }> {
  return items.map((i) => ({ id: i.id.toString(), name: i.name }));
}

function notFound(session: Session): string {
  return listPage({
    session,
    active: '/dashboard',
    title: t('list.notFound.title'),
    subtitle: t('list.notFound.sub'),
    newHref: '/dashboard',
    newLabel: t('list.notFound.back'),
    columns: [],
    rows: [],
    empty: t('list.notFound.sub'),
  });
}
