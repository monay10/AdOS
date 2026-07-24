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
  learnings: number;
  approvals: number;
  assets: number;
  executives: number;
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
        ${stat(s.products, 'Products')}${stat(s.missions, 'Missions')}${stat(s.briefs, 'Marketing Briefs')}${stat(s.creatives, 'Creatives')}${stat(s.campaigns, 'Campaigns')}${stat(s.reports, 'Reports')}${stat(s.learnings, 'Brain Learnings')}${stat(s.approvals, 'Approvals')}${stat(s.assets, 'Assets')}${stat(s.executives, 'CEO Dashboards')}
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

export interface LearningView {
  decision: string;
  chosen: string;
  confidence: number;
  outcome: Array<{ label: string; value: string }>;
  learned: string;
}

export interface ExecutiveView {
  headline: string;
  executiveSummary: string;
  verdict: string;
  keyResults: Array<{ metric: string; value: number; unit: string; verdict: string }>;
  decisions: string[];
  nextActions: string[];
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
  learning?: LearningView;
  executive?: ExecutiveView;
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

  // The CEO Dashboard unlocks once the analytics report exists.
  const executiveBlock = !opts.report
    ? ''
    : opts.executive
      ? renderExecutive(opts.executive)
      : `<div class="panel" style="margin-top:20px">
          <h2>CEO Dashboard</h2>
          <p class="sub">Synthesize this mission into an executive view — a headline verdict, key results, decisions and next actions, generated by the AI Manager.</p>
          <form method="post" action="/missions/${esc(m.id)}/executive"><button class="btn">Generate CEO Dashboard</button></form>
        </div>`;

  // Company Brain learning unlocks once the analytics report exists.
  const learningBlock = !opts.report
    ? ''
    : opts.learning
      ? renderLearning(opts.learning)
      : `<div class="panel" style="margin-top:20px">
          <h2>Company Brain — Learning</h2>
          <p class="sub">Record this campaign's outcome so the company compounds what it knows — Decision Journal, Executive Memory, Company Brain, Pattern Library and Knowledge Graph.</p>
          <form method="post" action="/missions/${esc(m.id)}/learn"><button class="btn">Record learning to Company Brain</button></form>
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
      ${analyticsBlock}
      ${executiveBlock}
      ${learningBlock}`,
  });
}

/** The CEO Dashboard — headline verdict, key results, decisions, next actions. */
function renderExecutive(e: ExecutiveView): string {
  const verdictClass = e.verdict === 'exceeded' ? 'active' : '';
  const verdictLabel = e.verdict.replace('_', ' ');
  const fmt = (k: { value: number; unit: string }): string => {
    if (k.unit === '%') return `${k.value}%`;
    if (k.unit === 'x') return `${k.value}x`;
    return `${k.value} ${k.unit}`.trim();
  };
  const cards = e.keyResults
    .map((k) => `<div class="card stat"><div class="n">${esc(fmt(k))}</div><div class="l">${esc(k.metric.toUpperCase())} · ${esc(k.verdict)}</div></div>`)
    .join('');
  return `<div class="panel" style="margin-top:20px">
    <h2>CEO Dashboard <span class="badge ${verdictClass}">${esc(verdictLabel)}</span> <span class="badge">${esc(e.model)}</span></h2>
    <p class="sub">The executive synthesis of this mission, generated by the AI Manager.</p>
    <label>Headline</label><div><b>${esc(e.headline)}</b></div>
    <label>Executive summary</label><div>${esc(e.executiveSummary)}</div>
    ${cards ? `<label>Key results</label><div class="grid" style="margin-bottom:6px">${cards}</div>` : ''}
    <label>Decisions</label><ul class="recs">${e.decisions.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
    <label>Next actions</label><ul class="recs">${e.nextActions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
  </div>`;
}

function renderLearning(l: LearningView): string {
  const stores = ['Decision Journal', 'Executive Memory', 'Company Brain', 'Pattern Library', 'Knowledge Graph'];
  return `<div class="panel" style="margin-top:20px">
    <h2>Company Brain — Learning <span class="badge active">recorded</span></h2>
    <p class="sub">This mission's outcome now compounds across the company's knowledge.</p>
    <label>Decision</label><div>${esc(l.decision)}</div>
    <label>Chosen</label><div>${esc(l.chosen)}</div>
    <label>Confidence</label><div><span class="badge">${l.confidence}/100</span></div>
    <label>Outcome</label><div>${l.outcome.map((o) => `<span class="badge">${esc(o.label)}: ${esc(o.value)}</span>`).join(' ')}</div>
    <label>Learned</label><div>${esc(l.learned)}</div>
    <label>Written to</label><div>${stores.map((s) => `<span class="badge active">${esc(s)}</span>`).join(' ')}</div>
  </div>`;
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
  projects?: Array<{ id: string; name: string }>;
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
  const projects = opts.projects ?? [];
  const projField = projects.length
    ? `<label>Project (optional)</label><select name="projectId"><option value="">— none —</option>${projects
        .map((p) => `<option value="${esc(p.id)}" ${v['projectId'] === p.id ? 'selected' : ''}>${esc(p.name)}</option>`)
        .join('')}</select>`
    : '';
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
        ${projField}
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

// ── Create Project (Phase 7) ────────────────────────────────────────────────────
export function projectForm(opts: {
  session: Session;
  brands: Array<{ id: string; name: string; clientName: string }>;
  error?: string;
  values?: Vals;
}): string {
  const v = opts.values ?? {};
  const brandOpts = opts.brands
    .map((b) => `<option value="${esc(b.id)}" ${v['brandId'] === b.id ? 'selected' : ''}>${esc(b.name)} · ${esc(b.clientName)}</option>`)
    .join('');
  return layout({
    title: 'Create Project',
    active: '/projects',
    session: opts.session,
    body: `<div class="panel">
      <h2>Create a project</h2><p class="sub">A project runs a brand's work — its missions, briefs, creatives, campaigns and reports.</p>
      ${banner(opts.error)}
      <form method="post" action="/projects">
        <label>Brand</label><select name="brandId" required>${brandOpts}</select>
        <label>Project name</label><input name="name" placeholder="Spring Launch" value="${esc(v['name'])}" required>
        <label>Description</label><textarea name="description" rows="2" placeholder="Acquire new patients in Q2">${esc(v['description'])}</textarea>
        <div class="actions"><button class="btn">Create project</button></div>
      </form></div>`,
  });
}

// ── Project Dashboard (Phase 7) ──────────────────────────────────────────────────
export interface ProjectDashboardData {
  project: { id: string; name: string; description: string; status: string; clientName: string; brandName: string };
  goals: Array<{ description: string; metric: string; target: number }>;
  members: Array<{ name: string; email: string; role: string }>;
  timeline: Array<{ label: string; detail: string }>;
  missions: Array<{ id: string; objective: string; status: string }>;
  rollup: { briefs: number; creatives: number; campaigns: number; reports: number };
}

export function projectDashboardPage(opts: { session: Session; data: ProjectDashboardData; error?: string }): string {
  const p = opts.data.project;
  const archived = p.status === 'archived';
  const statusOpt = (val: string): string => `<option value="${val}" ${p.status === val ? 'selected' : ''}>${val}</option>`;

  const goals = opts.data.goals.length
    ? `<table><thead><tr><th>Goal</th><th>Metric</th><th>Target</th></tr></thead><tbody>${opts.data.goals
        .map((g) => `<tr><td>${esc(g.description)}</td><td>${esc(g.metric)}</td><td>${g.target}</td></tr>`)
        .join('')}</tbody></table>`
    : `<div class="empty">No goals yet.</div>`;

  const members = opts.data.members.length
    ? `<table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>${opts.data.members
        .map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td><span class="badge">${esc(m.role)}</span></td></tr>`)
        .join('')}</tbody></table>`
    : `<div class="empty">No members yet.</div>`;

  const timeline = opts.data.timeline.length
    ? `<ul class="feed">${opts.data.timeline
        .map((t) => `<li><span>${esc(t.label)}</span><span class="t">${esc(t.detail)}</span></li>`)
        .join('')}</ul>`
    : `<div class="empty">No activity yet.</div>`;

  const missions = opts.data.missions.length
    ? `<table><thead><tr><th>Objective</th><th>Status</th></tr></thead><tbody>${opts.data.missions
        .map((m) => `<tr><td><a href="/missions/${esc(m.id)}">${esc(m.objective)}</a></td><td><span class="badge active">${esc(m.status)}</span></td></tr>`)
        .join('')}</tbody></table>`
    : `<div class="empty">No missions in this project yet. <a href="/missions/new">Create one</a> and assign it here.</div>`;

  const r = opts.data.rollup;
  const stat = (n: number, l: string): string => `<div class="card stat"><div class="n">${n}</div><div class="l">${l}</div></div>`;

  const controls = archived
    ? `<span class="badge">archived</span>`
    : `<form method="post" action="/projects/${esc(p.id)}/status" style="display:flex;gap:8px;align-items:center">
         <select name="status">${statusOpt('active')}${statusOpt('paused')}${statusOpt('completed')}</select>
         <button class="btn ghost" style="padding:8px 12px">Set status</button>
       </form>
       <form method="post" action="/projects/${esc(p.id)}/archive"><button class="btn ghost" style="padding:8px 12px">Archive</button></form>`;

  return layout({
    title: p.name,
    active: '/projects',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(p.name)}</h1>
        <p><a href="/projects">← All projects</a> · ${esc(p.clientName)} · ${esc(p.brandName)}</p></div>
        <div style="display:flex;gap:10px;align-items:center">${controls}</div></div>
      ${opts.error ? `<div class="err">${esc(opts.error)}</div>` : ''}
      <div class="panel">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><span class="badge ${archived ? '' : 'active'}">${esc(p.status)}</span></div>
        <label>Description</label><div>${esc(p.description) || '—'}</div>
      </div>

      <div class="grid" style="margin-top:20px">
        ${stat(opts.data.missions.length, 'Missions')}${stat(r.briefs, 'Briefs')}${stat(r.creatives, 'Creatives')}${stat(r.campaigns, 'Campaigns')}${stat(r.reports, 'Reports')}
      </div>

      <div class="panel" style="margin-top:20px"><h2>Goals</h2>${goals}
        ${archived ? '' : `<form method="post" action="/projects/${esc(p.id)}/goal" style="margin-top:14px">
          <div class="row-3">
            <div><label>Goal</label><input name="description" placeholder="Book consultations" required></div>
            <div><label>Metric</label><input name="metric" placeholder="leads" required></div>
            <div><label>Target</label><input name="target" type="number" min="0" value="0"></div>
          </div>
          <div class="actions"><button class="btn">Add goal</button></div></form>`}
      </div>

      <div class="panel" style="margin-top:20px"><h2>Members</h2>${members}
        ${archived ? '' : `<form method="post" action="/projects/${esc(p.id)}/member" style="margin-top:14px">
          <div class="row-3">
            <div><label>Name</label><input name="name" placeholder="Ada Lovelace" required></div>
            <div><label>Email</label><input name="email" type="email" placeholder="ada@acme.com" required></div>
            <div><label>Role</label><input name="role" placeholder="manager"></div>
          </div>
          <div class="actions"><button class="btn">Add member</button></div></form>`}
      </div>

      <div class="panel" style="margin-top:20px"><h2>Missions</h2>${missions}</div>
      <div class="panel" style="margin-top:20px"><h2>Timeline</h2><p class="sub">What has happened across this project's work.</p>${timeline}</div>`,
  });
}

// ── Approval Workflow (Phase 8) ─────────────────────────────────────────────────
/** Human labels + badge classes for each workflow state. */
const APPROVAL_LABEL: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  revision_requested: 'Revision Requested',
};

export function approvalStatusLabel(status: string): string {
  return APPROVAL_LABEL[status] ?? status;
}

function approvalBadgeClass(status: string): string {
  if (status === 'approved') return 'active';
  return '';
}

export function approvalForm(opts: {
  session: Session;
  projects?: Array<{ id: string; name: string }>;
  error?: string;
  values?: Vals;
}): string {
  const v = opts.values ?? {};
  const projects = opts.projects ?? [];
  const projField = projects.length
    ? `<label>Project (optional)</label><select name="projectId"><option value="">— none —</option>${projects
        .map((p) => `<option value="${esc(p.id)}" ${v['projectId'] === p.id ? 'selected' : ''}>${esc(p.name)}</option>`)
        .join('')}</select>`
    : '';
  return layout({
    title: 'New Approval',
    active: '/approvals',
    session: opts.session,
    body: `<div class="panel">
      <h2>Request an approval</h2><p class="sub">Route a decision through Draft → In Review → Approved / Rejected / Revision Requested. Every step is recorded on a timeline.</p>
      ${banner(opts.error)}
      <form method="post" action="/approvals">
        <label>Title</label><input name="title" placeholder="Q2 launch budget sign-off" value="${esc(v['title'])}" required autofocus>
        <label>Description</label><textarea name="description" rows="3" placeholder="What needs a decision, and why.">${esc(v['description'])}</textarea>
        ${projField}
        <div class="actions"><button class="btn">Create draft</button></div>
      </form></div>`,
  });
}

export interface ApprovalDetailData {
  id: string;
  title: string;
  description: string;
  status: string;
  requestedBy: string;
  projectName?: string;
  timeline: Array<{ action: string; from: string; to: string; note: string; actor: string; at: string }>;
}

export function approvalDetailPage(opts: { session: Session; data: ApprovalDetailData; error?: string }): string {
  const a = opts.data;
  const post = (action: string): string => `/approvals/${esc(a.id)}/${action}`;

  // Controls depend on the current state.
  let controls = '';
  if (a.status === 'draft') {
    controls = `<form method="post" action="${post('submit')}"><button class="btn">Submit for review</button></form>`;
  } else if (a.status === 'in_review') {
    controls = `<form method="post">
        <label>Decision note (optional)</label>
        <textarea name="note" rows="2" placeholder="Reasoning for your decision."></textarea>
        <div class="actions">
          <button class="btn" formaction="${post('approve')}">Approve</button>
          <button class="btn ghost" formaction="${post('revise')}">Request revision</button>
          <button class="btn ghost" formaction="${post('reject')}">Reject</button>
        </div>
      </form>`;
  } else if (a.status === 'revision_requested') {
    const lastNote = [...a.timeline].reverse().find((t) => t.action === 'revision_requested')?.note;
    controls = `${lastNote ? `<div class="err" style="margin-bottom:14px">Revision requested: ${esc(lastNote)}</div>` : ''}
      <form method="post" action="${post('submit')}"><button class="btn">Resubmit for review</button></form>`;
  } else if (a.status === 'approved') {
    controls = `<div class="ok">✓ Approved — this request is closed.</div>`;
  } else if (a.status === 'rejected') {
    controls = `<div class="err">✕ Rejected — this request is closed.</div>`;
  }

  const timeline = a.timeline.length
    ? `<ul class="feed">${a.timeline
        .map((t) => {
          const flow = t.action === 'created' ? 'created' : `${approvalStatusLabel(t.from)} → ${approvalStatusLabel(t.to)}`;
          const note = t.note ? ` — ${esc(t.note)}` : '';
          return `<li><span><span class="ev">${esc(flow)}</span>${note} · ${esc(t.actor)}</span><span class="t">${esc(t.at.replace('T', ' ').slice(0, 19))}</span></li>`;
        })
        .join('')}</ul>`
    : `<div class="empty">No activity yet.</div>`;

  return layout({
    title: a.title,
    active: '/approvals',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(a.title)}</h1>
        <p><a href="/approvals">← All approvals</a> · requested by ${esc(a.requestedBy)}${a.projectName ? ` · ${esc(a.projectName)}` : ''}</p></div>
        <span class="badge ${approvalBadgeClass(a.status)}">${esc(approvalStatusLabel(a.status))}</span></div>
      ${opts.error ? `<div class="err">${esc(opts.error)}</div>` : ''}
      <div class="panel">
        <label>Description</label><div>${esc(a.description) || '—'}</div>
      </div>
      <div class="panel" style="margin-top:20px"><h2>Decision</h2>
        <p class="sub">Current state: <b>${esc(approvalStatusLabel(a.status))}</b>.</p>
        ${controls}
      </div>
      <div class="panel" style="margin-top:20px"><h2>Timeline</h2>
        <p class="sub">Every transition on this request, newest last.</p>${timeline}</div>`,
  });
}

// ── Asset Library (Phase 9) ─────────────────────────────────────────────────────
const ASSET_KIND_LABEL: Record<string, string> = { image: 'Image', copy: 'Copy', document: 'Document', link: 'Link' };

export function assetKindLabel(kind: string): string {
  return ASSET_KIND_LABEL[kind] ?? kind;
}

/** Only render URLs we trust as a src/href — keeps a pasted javascript: URL inert. */
function safeUrl(value: string): string {
  return /^(https?:|data:)/i.test(value.trim()) ? value.trim() : '';
}

/** Render an asset's current content according to its kind. */
function assetPreview(kind: string, content: string): string {
  if (kind === 'image') {
    const src = safeUrl(content);
    return src
      ? `<img src="${esc(src)}" alt="asset preview" style="max-width:100%;border-radius:9px;border:1px solid var(--line)">`
      : `<div class="empty">Preview unavailable — image content must be an http(s) or data: URL.</div>`;
  }
  if (kind === 'link') {
    const href = safeUrl(content);
    return href
      ? `<a href="${esc(href)}" target="_blank" rel="noreferrer noopener">${esc(content)}</a>`
      : `<div>${esc(content)}</div>`;
  }
  // copy / document → show the text.
  return `<div style="white-space:pre-wrap;background:var(--panel-2);border:1px solid var(--line);border-radius:9px;padding:12px">${esc(content)}</div>`;
}

export function assetLibraryPage(opts: {
  session: Session;
  assets: Array<{ id: string; name: string; kind: string; clientName: string; tags: string[]; version: number }>;
  query: string;
  tag: string;
}): string {
  const rows = opts.assets.length
    ? `<table><thead><tr><th>Name</th><th>Kind</th><th>Client</th><th>Tags</th><th>Version</th></tr></thead>
       <tbody>${opts.assets
         .map(
           (a) =>
             `<tr><td><a href="/assets/${esc(a.id)}">${esc(a.name)}</a></td>
              <td><span class="badge">${esc(assetKindLabel(a.kind))}</span></td>
              <td>${esc(a.clientName)}</td>
              <td>${a.tags.map((t) => `<a class="badge" href="/assets?tag=${encodeURIComponent(t)}">${esc(t)}</a>`).join(' ') || '—'}</td>
              <td><span class="badge active">v${a.version}</span></td></tr>`,
         )
         .join('')}</tbody></table>`
    : `<div class="empty">${opts.query || opts.tag ? 'No assets match your search.' : 'No assets yet. Add your first asset to the library.'}</div>`;

  return layout({
    title: 'Assets',
    active: '/assets',
    session: opts.session,
    body: `<div class="head"><div><h1>Asset Library</h1><p>Reusable creative — images, copy, documents and links — organized by client, brand and project.</p></div>
      <a class="btn" href="/assets/new">+ New asset</a></div>
      <div class="panel" style="margin-bottom:20px">
        <form method="get" action="/assets" style="display:flex;gap:10px;align-items:flex-end">
          <div style="flex:1"><label>Search</label><input name="q" placeholder="Search by name or tag" value="${esc(opts.query)}"></div>
          ${opts.tag ? `<input type="hidden" name="tag" value="${esc(opts.tag)}">` : ''}
          <button class="btn" style="margin-top:0">Search</button>
          ${opts.query || opts.tag ? `<a class="btn ghost" href="/assets" style="margin-top:0">Clear</a>` : ''}
        </form>
        ${opts.tag ? `<p class="sub" style="margin-top:12px">Filtered by tag <span class="badge">${esc(opts.tag)}</span></p>` : ''}
      </div>
      <div class="panel">${rows}</div>`,
  });
}

export function assetForm(opts: {
  session: Session;
  clients: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
  error?: string;
  values?: Vals;
}): string {
  const v = opts.values ?? {};
  const clOpts = opts.clients
    .map((c) => `<option value="${esc(c.id)}" ${v['clientId'] === c.id ? 'selected' : ''}>${esc(c.name)}</option>`)
    .join('');
  const optional = (
    items: Array<{ id: string; name: string }>,
    field: string,
    label: string,
  ): string =>
    items.length
      ? `<div><label>${esc(label)} (optional)</label><select name="${field}"><option value="">— none —</option>${items
          .map((i) => `<option value="${esc(i.id)}" ${v[field] === i.id ? 'selected' : ''}>${esc(i.name)}</option>`)
          .join('')}</select></div>`
      : '';
  const kind = v['kind'] || 'image';
  const kindOpt = (val: string, label: string): string => `<option value="${val}" ${kind === val ? 'selected' : ''}>${label}</option>`;
  return layout({
    title: 'New Asset',
    active: '/assets',
    session: opts.session,
    body: `<div class="panel">
      <h2>Add an asset</h2><p class="sub">Paste content directly — text for copy/documents, or an http(s)/data: URL for images and links. New versions never overwrite the old ones.</p>
      ${banner(opts.error)}
      <form method="post" action="/assets">
        <label>Client</label><select name="clientId" required>${clOpts}</select>
        <div class="row">${optional(opts.brands, 'brandId', 'Brand')}${optional(opts.projects, 'projectId', 'Project')}</div>
        <div class="row">
          <div><label>Name</label><input name="name" placeholder="Spring hero banner" value="${esc(v['name'])}" required></div>
          <div><label>Kind</label><select name="kind">${kindOpt('image', 'Image')}${kindOpt('copy', 'Copy')}${kindOpt('document', 'Document')}${kindOpt('link', 'Link')}</select></div>
        </div>
        <label>Content</label><textarea name="content" rows="4" placeholder="Paste text, an image URL, or a link" required>${esc(v['content'])}</textarea>
        <label>Tags (comma separated)</label><input name="tags" placeholder="hero, spring, q2" value="${esc(v['tags'])}">
        <div class="actions"><button class="btn">Add to library</button></div>
      </form></div>`,
  });
}

export interface AssetDetailData {
  id: string;
  name: string;
  kind: string;
  clientName: string;
  brandName?: string;
  projectName?: string;
  tags: string[];
  currentContent: string;
  currentVersion: number;
  versions: Array<{ version: number; note: string; by: string; at: string }>;
}

export function assetDetailPage(opts: { session: Session; data: AssetDetailData; error?: string }): string {
  const a = opts.data;
  const scope = [a.clientName, a.brandName, a.projectName].filter(Boolean).map((s) => esc(s!)).join(' · ');

  const tags = a.tags.length
    ? a.tags.map((t) => `<a class="badge" href="/assets?tag=${encodeURIComponent(t)}">${esc(t)}</a>`).join(' ')
    : '<span class="sub">No tags yet.</span>';

  const history = a.versions.length
    ? `<ul class="feed">${[...a.versions]
        .reverse()
        .map(
          (v) =>
            `<li><span><span class="ev">v${v.version}</span>${v.version === a.currentVersion ? ' <span class="badge active">current</span>' : ''}${v.note ? ` — ${esc(v.note)}` : ''} · ${esc(v.by)}</span><span class="t">${esc(v.at.replace('T', ' ').slice(0, 19))}</span></li>`,
        )
        .join('')}</ul>`
    : `<div class="empty">No versions.</div>`;

  return layout({
    title: a.name,
    active: '/assets',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(a.name)}</h1>
        <p><a href="/assets">← Asset library</a> · ${scope}</p></div>
        <div style="display:flex;gap:8px;align-items:center"><span class="badge">${esc(assetKindLabel(a.kind))}</span><span class="badge active">v${a.currentVersion}</span></div></div>
      ${opts.error ? `<div class="err">${esc(opts.error)}</div>` : ''}
      <div class="panel"><h2>Preview <span class="sub">— version ${a.currentVersion}</span></h2>${assetPreview(a.kind, a.currentContent)}</div>

      <div class="panel" style="margin-top:20px"><h2>Tags</h2>
        <div style="margin-bottom:14px">${tags}</div>
        <form method="post" action="/assets/${esc(a.id)}/tag" style="display:flex;gap:10px;align-items:flex-end">
          <div style="flex:1"><label>Add tag</label><input name="tag" placeholder="evergreen" required></div>
          <button class="btn" style="margin-top:0">Add tag</button>
        </form>
      </div>

      <div class="panel" style="margin-top:20px"><h2>Versions</h2>
        <p class="sub">Each new version is kept — nothing is overwritten.</p>${history}
        <form method="post" action="/assets/${esc(a.id)}/version" style="margin-top:14px">
          <label>New version content</label><textarea name="content" rows="3" placeholder="Paste the updated text or URL" required></textarea>
          <label>Note</label><input name="note" placeholder="What changed">
          <div class="actions"><button class="btn">Add version</button></div>
        </form>
      </div>`,
  });
}

// ── Settings (Phase 11) ─────────────────────────────────────────────────────────
export function settingsPage(opts: {
  session: Session;
  workspaces: Array<{ id: string; name: string }>;
  selectedId: string;
  values: { name: string; currency: string; timezone: string; locale: string };
  saved?: boolean;
  error?: string;
}): string {
  const v = opts.values;
  const selector =
    opts.workspaces.length > 1
      ? `<form method="get" action="/settings" style="margin-bottom:18px">
           <label>Workspace</label>
           <div style="display:flex;gap:10px">
             <select name="workspaceId">${opts.workspaces
               .map((w) => `<option value="${esc(w.id)}" ${w.id === opts.selectedId ? 'selected' : ''}>${esc(w.name)}</option>`)
               .join('')}</select>
             <button class="btn ghost" style="white-space:nowrap">Switch</button>
           </div>
         </form>`
      : '';

  return layout({
    title: 'Settings',
    active: '/settings',
    session: opts.session,
    body: `<div class="head"><div><h1>Settings</h1><p>Your workspace configuration — currency, timezone and locale used across the app.</p></div></div>
      ${opts.saved ? `<div class="ok">✓ Settings saved.</div>` : ''}
      ${banner(opts.error)}
      <div class="panel" style="margin-bottom:20px">
        <label>Account</label>
        <div><span class="badge">Signed in as ${esc(opts.session.actor)}</span> <span class="badge">Tenant: ${esc(opts.session.tenantId)}</span></div>
      </div>
      <div class="panel">
        <h2>Workspace</h2><p class="sub">These values are persisted on your workspace and drive defaults across AdOS.</p>
        ${selector}
        <form method="post" action="/settings">
          <input type="hidden" name="workspaceId" value="${esc(opts.selectedId)}">
          <label>Workspace name</label><input name="name" value="${esc(v.name)}" required>
          <div class="row-3">
            <div><label>Currency</label><input name="currency" value="${esc(v.currency)}" required></div>
            <div><label>Timezone</label><input name="timezone" value="${esc(v.timezone)}" required></div>
            <div><label>Locale</label><input name="locale" value="${esc(v.locale)}" required></div>
          </div>
          <div class="actions"><button class="btn">Save settings</button></div>
        </form>
      </div>`,
  });
}

// ── Reports (Phase 13 — client performance reports) ──────────────────────────────
export function reportForm(opts: {
  session: Session;
  clients: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
  error?: string;
  values?: Vals;
}): string {
  const v = opts.values ?? {};
  const clOpts = opts.clients
    .map((c) => `<option value="${esc(c.id)}" ${v['clientId'] === c.id ? 'selected' : ''}>${esc(c.name)}</option>`)
    .join('');
  const projField = opts.projects.length
    ? `<label>Project (optional)</label><select name="projectId"><option value="">— whole client —</option>${opts.projects
        .map((p) => `<option value="${esc(p.id)}" ${v['projectId'] === p.id ? 'selected' : ''}>${esc(p.name)}</option>`)
        .join('')}</select>`
    : '';
  return layout({
    title: 'New Report',
    active: '/reports',
    session: opts.session,
    body: `<div class="panel">
      <h2>Generate a performance report</h2><p class="sub">A saved snapshot of how a client's work performed — missions, campaigns, budget and blended results — that you can show the client.</p>
      ${banner(opts.error)}
      <form method="post" action="/reports">
        <label>Client</label><select name="clientId" required>${clOpts}</select>
        ${projField}
        <div class="row">
          <div><label>Title</label><input name="title" placeholder="Q3 performance review" value="${esc(v['title'])}" required></div>
          <div><label>Period</label><input name="period" placeholder="Q3 2026" value="${esc(v['period'])}"></div>
        </div>
        <div class="actions"><button class="btn">Generate report</button></div>
      </form></div>`,
  });
}

export interface ReportDetailData {
  id: string;
  title: string;
  clientName: string;
  projectName?: string;
  period: string;
  generatedBy: string;
  generatedAt: string;
  metrics: Array<{ label: string; value: string }>;
  summary: string;
}

export function reportDetailPage(opts: { session: Session; data: ReportDetailData }): string {
  const d = opts.data;
  const cards = d.metrics
    .map((m) => `<div class="card stat"><div class="n">${esc(m.value)}</div><div class="l">${esc(m.label)}</div></div>`)
    .join('');
  return layout({
    title: d.title,
    active: '/reports',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(d.title)}</h1>
        <p><a href="/reports">← All reports</a> · ${esc(d.clientName)}${d.projectName ? ` · ${esc(d.projectName)}` : ''} · ${esc(d.period)}</p></div>
        <span class="badge">${esc(d.generatedAt.replace('T', ' ').slice(0, 16))}</span></div>
      <div class="panel"><h2>Summary</h2><p class="sub">Generated by ${esc(d.generatedBy)}.</p><div>${esc(d.summary)}</div></div>
      <div class="grid" style="margin-top:20px">${cards}</div>`,
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
