import type { Session } from '../session.js';
import { bare, esc, layout, steps } from './layout.js';

type Vals = Record<string, string>;

function banner(error?: string, ok?: string): string {
  if (error) return `<div class="err">${esc(error)}</div>`;
  if (ok) return `<div class="ok">${esc(ok)}</div>`;
  return '';
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function loginPage(error?: string, values: Vals = {}): string {
  return bare({
    title: 'Sign in',
    body: `<div class="login-wrap"><div class="panel login-card">
      <div class="login-brand"><span class="mark" style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#5b8cff,#9d7bff);display:grid;place-items:center;color:#fff">▲</span> AdOS</div>
      <h2 style="text-align:center;margin:0 0 4px">Welcome back</h2>
      <p class="sub" style="text-align:center">Sign in to your advertising operating system.</p>
      ${banner(error)}
      <form method="post" action="/login">
        <label>Work email</label>
        <input name="email" type="email" placeholder="you@company.com" value="${esc(values['email'])}" required>
        <label>Company</label>
        <input name="company" placeholder="Bright Smiles Dental" value="${esc(values['company'])}" required>
        <div class="actions"><button class="btn" style="width:100%">Sign in</button></div>
      </form>
      <p class="sub" style="text-align:center;margin-top:16px">Your company name becomes your isolated tenant.</p>
    </div></div>`,
  });
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export interface DashStats {
  workspaces: number;
  clients: number;
  brands: number;
  products: number;
  missions: number;
  briefs: number;
  creatives: number;
  campaigns: number;
  reports: number;
}

export interface NextStep {
  label: string;
  href: string;
  done: boolean;
}

export function dashboardPage(opts: {
  session: Session;
  stats: DashStats;
  next: NextStep;
  pending: Array<{ id: string; objective: string }>;
  feed: Array<{ eventName: string; occurredAt: string }>;
}): string {
  const s = opts.stats;
  const stat = (n: number, l: string): string => `<div class="card stat"><div class="n">${n}</div><div class="l">${l}</div></div>`;
  const feed = opts.feed.length
    ? `<ul class="feed">${opts.feed
        .map((e) => `<li><span class="ev">${esc(e.eventName)}</span><span class="t">${esc(e.occurredAt.replace('T', ' ').slice(0, 19))}</span></li>`)
        .join('')}</ul>`
    : `<div class="empty">No activity yet. Complete your first Mission to see events here.</div>`;

  const cta = opts.next.done
    ? `<a class="btn" href="/missions">View missions →</a>`
    : `<a class="btn" href="${opts.next.href}">${esc(opts.next.label)} →</a>`;

  const doneNote = opts.next.done
    ? `<div class="ok" style="margin-bottom:20px">🎉 Onboarding complete — your first Mission is in the system.</div>`
    : '';

  const pending = opts.pending.length
    ? `<div class="panel" style="margin-bottom:20px"><h2>Pending executive approvals</h2>
       <p class="sub">Marketing briefs awaiting your sign-off before work continues.</p>
       <ul class="feed">${opts.pending
         .map((m) => `<li><a href="/missions/${esc(m.id)}">${esc(m.objective)}</a><a class="badge" href="/missions/${esc(m.id)}">review →</a></li>`)
         .join('')}</ul></div>`
    : '';

  return layout({
    title: 'Dashboard',
    active: '/dashboard',
    session: opts.session,
    body: `<div class="head"><div><h1>Dashboard</h1><p>Welcome, ${esc(opts.session.actor)}.</p></div>${cta}</div>
      <div class="grid" style="margin-bottom:26px">
        ${stat(s.workspaces, 'Workspaces')}${stat(s.clients, 'Clients')}${stat(s.brands, 'Brands')}
        ${stat(s.products, 'Products')}${stat(s.missions, 'Missions')}${stat(s.briefs, 'Marketing Briefs')}${stat(s.creatives, 'Creatives')}${stat(s.campaigns, 'Campaigns')}${stat(s.reports, 'Reports')}
      </div>
      ${doneNote}
      ${pending}
      <div class="panel"><h2>Activity feed</h2><p class="sub">Domain events emitted by the system, newest first.</p>${feed}</div>`,
  });
}

// ── Mission detail + Marketing Brief (Phase 2) ─────────────────────────────────
export interface BriefView {
  objective: string;
  targetAudience: string;
  positioning: string;
  keyMessages: string[];
  recommendedChannels: string[];
  budgetAllocation: Array<{ channel: string; percentage: number }>;
  kpis: Array<{ name: string; target: number; unit: string }>;
  model: string;
}

export interface CreativeView {
  headline: string;
  adCopy: string;
  cta: string;
  socialPost: string;
  landingPage: { headline: string; body: string; cta: string };
  email: { subject: string; body: string };
  model: string;
}

export interface CampaignView {
  name: string;
  objective: string;
  totalBudget: { amount: number; currency: string };
  channels: Array<{
    channel: string;
    budgetPercentage: number;
    adSets: Array<{ name: string; audience: string; headline: string; primaryText: string; cta: string }>;
  }>;
  schedule: { startHint: string; durationDays: number };
  model: string;
}

export interface ReportView {
  kpis: Array<{ name: string; value: number; unit: string }>;
  summary: string;
  highlights: string[];
  recommendations: string[];
  model: string;
}

export type Approval = 'none' | 'pending' | 'approved' | 'rejected';

export function missionDetailPage(opts: {
  session: Session;
  mission: { id: string; objective: string; status: string; budget?: { amount: number; currency: string; period: string } };
  brief?: BriefView;
  briefApproval: Approval;
  creative?: CreativeView;
  creativeApproval: Approval;
  campaign?: CampaignView;
  campaignApproval: Approval;
  report?: ReportView;
  reportDefaults?: { spend: number; revenue: number; currency: string };
  prereqMissing?: string;
  error?: string;
}): string {
  const m = opts.mission;
  const budget = m.budget ? `${m.budget.amount.toLocaleString()} ${m.budget.currency} / ${m.budget.period}` : '—';

  const briefBlock = opts.brief
    ? `<div class="panel" style="margin-top:20px">
        <h2>Marketing Brief <span class="badge">${esc(opts.brief.model)}</span></h2>
        <p class="sub">Generated by Marketing Intelligence via the AI Manager.</p>
        <label>Objective</label><div>${esc(opts.brief.objective)}</div>
        <label>Target audience</label><div>${esc(opts.brief.targetAudience)}</div>
        <label>Positioning</label><div>${esc(opts.brief.positioning)}</div>
        <label>Key messages</label><ul>${opts.brief.keyMessages.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>
        <div class="row">
          <div><label>Recommended channels</label><div>${opts.brief.recommendedChannels.map((c) => `<span class="badge">${esc(c)}</span>`).join(' ')}</div></div>
          <div><label>Budget split</label><div>${opts.brief.budgetAllocation.map((b) => `<span class="badge">${esc(b.channel)} ${b.percentage}%</span>`).join(' ')}</div></div>
        </div>
        <label>KPIs</label><div>${opts.brief.kpis.map((k) => `<span class="badge">${esc(k.name)}: ${k.target} ${esc(k.unit)}</span>`).join(' ')}</div>
        ${reviewControls(`/missions/${esc(m.id)}/approve`, `/missions/${esc(m.id)}/reject`, opts.briefApproval, 'brief', 'ready for the Creative phase')}
      </div>`
    : opts.prereqMissing
      ? `<div class="panel" style="margin-top:20px"><div class="err">${esc(opts.prereqMissing)}</div></div>`
      : `<div class="panel" style="margin-top:20px">
          <h2>Marketing Intelligence</h2>
          <p class="sub">Generate the Marketing Brief — the AI Company's strategy for this Mission.</p>
          <form method="post" action="/missions/${esc(m.id)}/brief"><button class="btn">Generate Marketing Brief</button></form>
        </div>`;

  // Creative Studio unlocks only once the brief is approved.
  const creativeBlock =
    opts.briefApproval !== 'approved'
      ? ''
      : opts.creative
        ? `<div class="panel" style="margin-top:20px">
            <h2>Creative Studio <span class="badge">${esc(opts.creative.model)}</span></h2>
            <p class="sub">Publish-ready copy generated from the approved brief.</p>
            <label>Headline</label><div>${esc(opts.creative.headline)}</div>
            <label>Ad copy</label><div>${esc(opts.creative.adCopy)}</div>
            <label>Call to action</label><div><span class="badge">${esc(opts.creative.cta)}</span></div>
            <label>Social post</label><div>${esc(opts.creative.socialPost)}</div>
            <label>Landing page</label><div><b>${esc(opts.creative.landingPage.headline)}</b><br>${esc(opts.creative.landingPage.body)}<br><span class="badge">${esc(opts.creative.landingPage.cta)}</span></div>
            <label>Email</label><div><b>${esc(opts.creative.email.subject)}</b><br>${esc(opts.creative.email.body)}</div>
            ${reviewControls(`/missions/${esc(m.id)}/creative/approve`, `/missions/${esc(m.id)}/creative/reject`, opts.creativeApproval, 'creative', 'ready to build the Campaign')}
          </div>`
        : `<div class="panel" style="margin-top:20px">
            <h2>Creative Studio</h2>
            <p class="sub">Generate ad copy, headline, CTA, social post, landing page and email from the approved brief.</p>
            <form method="post" action="/missions/${esc(m.id)}/creative"><button class="btn">Generate Creative</button></form>
          </div>`;

  // Campaign builder unlocks only once the creative is approved.
  const campaignBlock =
    opts.creativeApproval !== 'approved'
      ? ''
      : opts.campaign
        ? renderCampaign(m.id, opts.campaign, opts.campaignApproval)
        : `<div class="panel" style="margin-top:20px">
            <h2>Campaign Builder</h2>
            <p class="sub">Turn the approved creative into a structured campaign draft — budget, audience and schedule.</p>
            <form method="post" action="/missions/${esc(m.id)}/campaign"><button class="btn">Generate Campaign Draft</button></form>
          </div>`;

  // Analytics unlocks only once the campaign is approved.
  const d = opts.reportDefaults ?? { spend: 0, revenue: 0, currency: 'TRY' };
  const analyticsBlock =
    opts.campaignApproval !== 'approved'
      ? ''
      : opts.report
        ? renderReport(opts.report)
        : `<div class="panel" style="margin-top:20px">
            <h2>Analytics</h2>
            <p class="sub">Enter the campaign's results to compute KPIs and get an executive summary.</p>
            <form method="post" action="/missions/${esc(m.id)}/analytics">
              <div class="row-3">
                <div><label>Impressions</label><input name="impressions" type="number" min="0" value="100000"></div>
                <div><label>Clicks</label><input name="clicks" type="number" min="0" value="2000"></div>
                <div><label>Conversions</label><input name="conversions" type="number" min="0" value="100"></div>
              </div>
              <div class="row-3">
                <div><label>Leads</label><input name="leads" type="number" min="0" value="130"></div>
                <div><label>Spend (major)</label><input name="spend" type="number" min="0" step="0.01" value="${esc(String(d.spend))}"></div>
                <div><label>Revenue (major)</label><input name="revenue" type="number" min="0" step="0.01" value="${esc(String(d.revenue))}"></div>
              </div>
              <input type="hidden" name="currency" value="${esc(d.currency)}">
              <div class="actions"><button class="btn">Generate Analytics Report</button></div>
            </form>
          </div>`;

  return layout({
    title: 'Mission',
    active: '/missions',
    session: opts.session,
    body: `<div class="head"><div><h1>Mission</h1><p><a href="/missions">← All missions</a></p></div>
        <span class="badge ${m.status === 'failed' ? '' : 'active'}">${esc(m.status)}</span></div>
      ${opts.error ? `<div class="err">${esc(opts.error)}</div>` : ''}
      <div class="panel">
        <label>Objective</label><div>${esc(m.objective)}</div>
        <label>Budget</label><div>${esc(budget)}</div>
      </div>
      ${briefBlock}
      ${creativeBlock}
      ${campaignBlock}
      ${analyticsBlock}`,
  });
}

/** KPI cards + bar charts + executive summary + recommendations. */
function renderReport(r: ReportView): string {
  const fmt = (k: { name: string; value: number; unit: string }): string => {
    if (k.unit === '%') return `${k.value}%`;
    if (k.unit === 'x') return `${k.value}x`;
    if (k.unit.endsWith('_minor')) return `${(k.value / 100).toLocaleString()} ${k.unit.replace('_minor', '')}`;
    return `${k.value} ${k.unit}`;
  };
  const cards = r.kpis
    .map((k) => `<div class="card stat"><div class="n">${esc(fmt(k))}</div><div class="l">${esc(k.name.toUpperCase())}</div></div>`)
    .join('');

  // Bars for the headline ratio KPIs, each scaled to a sensible ceiling.
  const scale: Record<string, number> = { roas: 5, roi: 300, ctr: 10 };
  const bars = r.kpis
    .filter((k) => k.name in scale)
    .map((k) => {
      const pct = Math.max(0, Math.min(100, (k.value / (scale[k.name] ?? 1)) * 100));
      return `<div class="bar"><span>${esc(k.name.toUpperCase())}</span><span class="track"><span class="fill" style="width:${pct.toFixed(0)}%"></span></span><span class="v">${esc(fmt(k))}</span></div>`;
    })
    .join('');

  return `<div class="panel" style="margin-top:20px">
    <h2>Analytics Report <span class="badge">${esc(r.model)}</span></h2>
    <p class="sub">Deterministic KPIs with an AI-generated executive summary and recommendations.</p>
    <div class="grid" style="margin-bottom:6px">${cards}</div>
    <div class="bars">${bars}</div>
    <label style="margin-top:20px">Executive summary</label><div>${esc(r.summary)}</div>
    ${r.highlights.length ? `<label>Highlights</label><div>${r.highlights.map((h) => `<span class="badge">${esc(h)}</span>`).join(' ')}</div>` : ''}
    <label>Recommendations</label><ul class="recs">${r.recommendations.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  </div>`;
}

function renderCampaign(missionId: string, c: CampaignView, approval: Approval): string {
  const budgetRows = c.channels
    .map((ch) => `<tr><td>${esc(ch.channel)}</td><td>${ch.budgetPercentage}%</td><td>${esc(ch.adSets.map((a) => a.audience).join('; '))}</td></tr>`)
    .join('');
  const adSets = c.channels
    .flatMap((ch) => ch.adSets.map((a) => `<li><b>${esc(a.name)}</b> — ${esc(a.headline)} · <span class="badge">${esc(a.cta)}</span></li>`))
    .join('');
  return `<div class="panel" style="margin-top:20px">
    <h2>Campaign Draft <span class="badge">${esc(c.model)}</span> <span class="badge">draft</span></h2>
    <p class="sub">${esc(c.name)} — total budget ${c.totalBudget.amount.toLocaleString()} ${esc(c.totalBudget.currency)}.</p>
    <label>Budget &amp; Audience</label>
    <table><thead><tr><th>Channel</th><th>Budget</th><th>Audience</th></tr></thead><tbody>${budgetRows}</tbody></table>
    <label style="margin-top:16px">Ad sets</label><ul>${adSets}</ul>
    <label>Schedule</label><div><span class="badge">start: ${esc(c.schedule.startHint)}</span> <span class="badge">${c.schedule.durationDays} days</span></div>
    ${reviewControls(`/missions/${esc(missionId)}/campaign/approve`, `/missions/${esc(missionId)}/campaign/reject`, approval, 'campaign', 'ready for Analytics')}
  </div>`;
}

function reviewControls(approveHref: string, rejectHref: string, approval: Approval, noun: string, nextHint: string): string {
  if (approval === 'approved') return `<div class="ok" style="margin-top:18px">✓ ${noun[0]!.toUpperCase() + noun.slice(1)} approved by executive — ${nextHint}.</div>`;
  if (approval === 'rejected') return `<div class="err" style="margin-top:18px">✕ ${noun[0]!.toUpperCase() + noun.slice(1)} rejected by executive.</div>`;
  if (approval === 'pending') {
    return `<div class="actions" style="margin-top:20px">
      <form method="post" action="${approveHref}"><button class="btn">Approve ${esc(noun)}</button></form>
      <form method="post" action="${rejectHref}"><button class="btn ghost">Reject</button></form>
    </div>`;
  }
  return '';
}

// ── Create Workspace ─────────────────────────────────────────────────────────
export function workspaceForm(session: Session, error?: string, values: Vals = {}): string {
  return layout({
    title: 'Create Workspace',
    active: '/dashboard',
    session,
    body: `${steps('workspace')}<div class="panel">
      <h2>Create your workspace</h2><p class="sub">A workspace is the top-level home for this company's clients, brands and missions.</p>
      ${banner(error)}
      <form method="post" action="/workspaces">
        <label>Workspace name</label>
        <input name="name" placeholder="Bright Smiles Workspace" value="${esc(values['name'])}" required autofocus>
        <div class="row">
          <div><label>Currency</label><input name="currency" placeholder="TRY" value="${esc(values['currency'] || 'TRY')}"></div>
          <div><label>Timezone</label><input name="timezone" placeholder="Europe/Istanbul" value="${esc(values['timezone'] || 'Europe/Istanbul')}"></div>
        </div>
        <div class="actions"><button class="btn">Create workspace</button></div>
      </form></div>`,
  });
}

// ── Create Client ─────────────────────────────────────────────────────────────
export function clientForm(opts: {
  session: Session;
  workspaces: Array<{ id: string; name: string }>;
  error?: string;
  values?: Vals;
}): string {
  const v = opts.values ?? {};
  const options = opts.workspaces
    .map((w) => `<option value="${esc(w.id)}" ${v['workspaceId'] === w.id ? 'selected' : ''}>${esc(w.name)}</option>`)
    .join('');
  return layout({
    title: 'Create Client',
    active: '/clients',
    session: opts.session,
    body: `${steps('client')}<div class="panel">
      <h2>Add a client</h2><p class="sub">The customer whose brands and products the AI Company will market.</p>
      ${banner(opts.error)}
      <form method="post" action="/clients">
        <label>Workspace</label><select name="workspaceId" required>${options}</select>
        <label>Client name</label><input name="name" placeholder="Bright Smiles Dental" value="${esc(v['name'])}" required>
        <div class="row">
          <div><label>Industry</label><input name="industry" placeholder="healthcare" value="${esc(v['industry'])}"></div>
          <div><label>Contact email</label><input name="email" type="email" placeholder="owner@brightsmiles.com" value="${esc(v['email'])}" required></div>
        </div>
        <div class="actions"><button class="btn">Create client</button></div>
      </form></div>`,
  });
}

// ── Create Brand ───────────────────────────────────────────────────────────────
export function brandForm(opts: {
  session: Session;
  clients: Array<{ id: string; name: string }>;
  error?: string;
  values?: Vals;
}): string {
  const v = opts.values ?? {};
  const options = opts.clients
    .map((c) => `<option value="${esc(c.id)}" ${v['clientId'] === c.id ? 'selected' : ''}>${esc(c.name)}</option>`)
    .join('');
  return layout({
    title: 'Create Brand',
    active: '/brands',
    session: opts.session,
    body: `${steps('brand')}<div class="panel">
      <h2>Define a brand</h2><p class="sub">Voice, values and rules the Creative Studio must respect.</p>
      ${banner(opts.error)}
      <form method="post" action="/brands">
        <label>Client</label><select name="clientId" required>${options}</select>
        <label>Brand name</label><input name="name" placeholder="Bright Smiles" value="${esc(v['name'])}" required>
        <div class="row">
          <div><label>Voice</label><input name="voice" placeholder="warm and trustworthy" value="${esc(v['voice'] || 'professional')}"></div>
          <div><label>Target audience</label><input name="targetAudience" placeholder="local families" value="${esc(v['targetAudience'])}"></div>
        </div>
        <label>Values (comma separated)</label><input name="values" placeholder="care, expertise" value="${esc(v['values'])}">
        <div class="actions"><button class="btn">Create brand</button></div>
      </form></div>`,
  });
}

// ── Create Product ─────────────────────────────────────────────────────────────
export function productForm(opts: {
  session: Session;
  clients: Array<{ id: string; name: string }>;
  error?: string;
  values?: Vals;
}): string {
  const v = opts.values ?? {};
  const options = opts.clients
    .map((c) => `<option value="${esc(c.id)}" ${v['clientId'] === c.id ? 'selected' : ''}>${esc(c.name)}</option>`)
    .join('');
  const model = v['pricingModel'] || 'one_time';
  const modelOpt = (val: string, label: string): string => `<option value="${val}" ${model === val ? 'selected' : ''}>${label}</option>`;
  return layout({
    title: 'Create Product',
    active: '/products',
    session: opts.session,
    body: `${steps('product')}<div class="panel">
      <h2>Add a product</h2><p class="sub">What the client sells — the thing the AI Company markets.</p>
      ${banner(opts.error)}
      <form method="post" action="/products">
        <label>Client</label><select name="clientId" required>${options}</select>
        <label>Product name</label><input name="name" placeholder="Whitening Treatment" value="${esc(v['name'])}" required>
        <label>Description</label><textarea name="description" rows="2" placeholder="Professional in-clinic teeth whitening">${esc(v['description'])}</textarea>
        <label>Categories (comma separated)</label><input name="categories" placeholder="dental, cosmetic" value="${esc(v['categories'])}">
        <div class="row-3">
          <div><label>Pricing model</label><select name="pricingModel">${modelOpt('one_time', 'One-time')}${modelOpt('subscription', 'Subscription')}${modelOpt('usage', 'Usage')}${modelOpt('free', 'Free')}</select></div>
          <div><label>Price (major units)</label><input name="price" type="number" min="0" step="0.01" placeholder="129" value="${esc(v['price'])}"></div>
          <div><label>Currency</label><input name="currency" placeholder="TRY" value="${esc(v['currency'] || 'TRY')}"></div>
        </div>
        <div class="actions"><button class="btn">Create product</button></div>
      </form></div>`,
  });
}

// ── Create Mission ─────────────────────────────────────────────────────────────
export function missionForm(opts: {
  session: Session;
  workspaces: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  error?: string;
  values?: Vals;
}): string {
  const v = opts.values ?? {};
  const wsOpts = opts.workspaces
    .map((w) => `<option value="${esc(w.id)}" ${v['workspaceId'] === w.id ? 'selected' : ''}>${esc(w.name)}</option>`)
    .join('');
  const clOpts = opts.clients
    .map((c) => `<option value="${esc(c.id)}" ${v['clientId'] === c.id ? 'selected' : ''}>${esc(c.name)}</option>`)
    .join('');
  const period = v['period'] || 'monthly';
  const pOpt = (val: string, label: string): string => `<option value="${val}" ${period === val ? 'selected' : ''}>${label}</option>`;
  return layout({
    title: 'Create Mission',
    active: '/missions',
    session: opts.session,
    body: `${steps('mission')}<div class="panel">
      <h2>State your first Mission</h2><p class="sub">Describe the business objective in plain words. The AI Company plans and runs it.</p>
      ${banner(opts.error)}
      <form method="post" action="/missions">
        <div class="row">
          <div><label>Workspace</label><select name="workspaceId" required>${wsOpts}</select></div>
          <div><label>Client</label><select name="clientId" required>${clOpts}</select></div>
        </div>
        <label>Objective</label>
        <textarea name="objective" rows="3" placeholder="Acquire new patients for a dental clinic opening next month" required>${esc(v['objective'])}</textarea>
        <div class="row-3">
          <div><label>Budget (major units)</label><input name="budget" type="number" min="1" step="0.01" placeholder="80000" value="${esc(v['budget'])}" required></div>
          <div><label>Currency</label><input name="currency" placeholder="TRY" value="${esc(v['currency'] || 'TRY')}"></div>
          <div><label>Period</label><select name="period">${pOpt('daily', 'Daily')}${pOpt('weekly', 'Weekly')}${pOpt('monthly', 'Monthly')}${pOpt('total', 'Total')}</select></div>
        </div>
        <div class="row-3">
          <div><label>Target metric</label><input name="metricName" placeholder="leads" value="${esc(v['metricName'] || 'leads')}"></div>
          <div><label>Target value</label><input name="metricTarget" type="number" min="1" placeholder="120" value="${esc(v['metricTarget'])}"></div>
          <div><label>Unit</label><input name="metricUnit" placeholder="count" value="${esc(v['metricUnit'] || 'count')}"></div>
        </div>
        <div class="actions"><button class="btn">Submit Mission</button></div>
      </form></div>`,
  });
}

// ── Generic list page ──────────────────────────────────────────────────────────
export function listPage(opts: {
  session: Session;
  active: string;
  title: string;
  subtitle: string;
  newHref: string;
  newLabel: string;
  columns: string[];
  rows: string[][];
  empty: string;
}): string {
  const body =
    opts.rows.length === 0
      ? `<div class="panel"><div class="empty">${esc(opts.empty)}</div></div>`
      : `<div class="panel"><table><thead><tr>${opts.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
         <tbody>${opts.rows
           .map((r) => `<tr>${r.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
           .join('')}</tbody></table></div>`;
  return layout({
    title: opts.title,
    active: opts.active,
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(opts.title)}</h1><p>${esc(opts.subtitle)}</p></div>
      <a class="btn" href="${opts.newHref}">${esc(opts.newLabel)}</a></div>${body}`,
  });
}
