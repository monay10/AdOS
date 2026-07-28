import type { ExecutionTrace } from '@ados/ai-manager';
import type { GovernanceMetrics } from '../governance-metrics.js';
import type { ApprovalFunnel, ReviewStats } from '../governance-decisions.js';
import type { StageTiming } from '../stage-latency.js';
import type { RevisionFunnel } from '../revision-funnel.js';
import type { ResilienceStats } from '../resilience-stats.js';
import type { Session } from '../session.js';
import { t } from '../i18n.js';
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
    title: t('login.title'),
    body: `<div class="login-wrap"><div class="panel login-card">
      <div class="login-brand"><span class="mark" style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#5b8cff,#9d7bff);display:grid;place-items:center;color:#fff">▲</span> AdOS</div>
      <h2 style="text-align:center;margin:0 0 4px">${esc(t('login.welcome'))}</h2>
      <p class="sub" style="text-align:center">${esc(t('login.subtitle'))}</p>
      ${banner(error)}
      <form method="post" action="/login">
        <label>${esc(t('login.email'))}</label>
        <input name="email" type="email" placeholder="${esc(t('ph.email'))}" value="${esc(values['email'])}" required>
        <label>${esc(t('login.company'))}</label>
        <input name="company" placeholder="${esc(t('ph.company'))}" value="${esc(values['company'])}" required>
        <div class="actions"><button class="btn" style="width:100%">${esc(t('login.submit'))}</button></div>
      </form>
      <p class="sub" style="text-align:center;margin-top:16px">${esc(t('login.tenantNote'))}</p>
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
    : `<div class="empty">${esc(t('dash.feedEmpty'))}</div>`;

  const cta = opts.next.done
    ? `<a class="btn" href="/missions">${esc(t('dash.viewMissions'))} →</a>`
    : `<a class="btn" href="${opts.next.href}">${esc(opts.next.label)} →</a>`;

  const doneNote = opts.next.done
    ? `<div class="ok" style="margin-bottom:20px">${esc(t('dash.onboardingDone'))}</div>`
    : '';

  const pending = opts.pending.length
    ? `<div class="panel" style="margin-bottom:20px"><h2>${esc(t('dash.pendingTitle'))}</h2>
       <p class="sub">${esc(t('dash.pendingSub'))}</p>
       <ul class="feed">${opts.pending
         .map((m) => `<li><a href="/missions/${esc(m.id)}">${esc(m.objective)}</a><a class="badge" href="/missions/${esc(m.id)}">${esc(t('dash.review'))} →</a></li>`)
         .join('')}</ul></div>`
    : '';

  return layout({
    title: t('dash.title'),
    active: '/dashboard',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(t('dash.title'))}</h1><p>${esc(t('dash.welcome', { name: opts.session.actor }))}</p></div>${cta}</div>
      <div class="grid" style="margin-bottom:26px">
        ${stat(s.workspaces, t('dash.stat.workspaces'))}${stat(s.clients, t('dash.stat.clients'))}${stat(s.brands, t('dash.stat.brands'))}
        ${stat(s.products, t('dash.stat.products'))}${stat(s.missions, t('dash.stat.missions'))}${stat(s.briefs, t('dash.stat.briefs'))}${stat(s.creatives, t('dash.stat.creatives'))}${stat(s.campaigns, t('dash.stat.campaigns'))}${stat(s.reports, t('dash.stat.reports'))}${stat(s.learnings, t('dash.stat.learnings'))}${stat(s.approvals, t('dash.stat.approvals'))}${stat(s.assets, t('dash.stat.assets'))}${stat(s.executives, t('dash.stat.executives'))}
      </div>
      ${doneNote}
      ${pending}
      <div class="panel"><h2>${esc(t('dash.feedTitle'))}</h2><p class="sub">${esc(t('dash.feedSub'))}</p>${feed}</div>`,
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

/**
 * Governance readout for the artifact currently in the human approval gate
 * (Sprint 4.3A — constitution observe→advisory). The verdict is recorded by the
 * stage engine's governance.observe stage; surfacing it here gives it a real
 * consequence — it informs the human's approve/reject decision — without
 * auto-blocking. It is advisory, never enforcing.
 */
export interface GovernanceView {
  passed: boolean;
  confidence: number;
  violations: string[];
}

/** The advisory banner shown above the approve/reject controls at the gate. */
function governanceAdvisory(g?: GovernanceView): string {
  if (!g) return '';
  const amber = 'background:rgba(210,153,34,.12);border:1px solid rgba(210,153,34,.4);color:#e2c08d';
  const green = 'background:rgba(63,185,80,.10);border:1px solid rgba(63,185,80,.35);color:#9be6a6';
  const style = `${g.passed ? green : amber};padding:11px 14px;border-radius:9px;margin-top:18px;font-size:14px`;
  const head = g.passed ? t('gov.pass') : t('gov.warn');
  const vio = g.violations.length ? ` — ${g.violations.map((v) => esc(v)).join(', ')}` : '';
  return `<div style="${style}">${esc(head)} · ${esc(t('gov.confidence'))}: ${esc(g.confidence)}${vio}<br><span style="opacity:.8">${esc(t('gov.advisoryNote'))}</span></div>`;
}

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
  governance?: GovernanceView;
  failureReason?: string;
  canCancel?: boolean;
  prereqMissing?: string;
  error?: string;
}): string {
  // The governance verdict belongs to the latest AI artifact — i.e. the one now
  // in the gate. reviewControls renders it (advisory + required-ack) once, at
  // whichever gate is pending.
  const gov = opts.governance;
  const m = opts.mission;
  const budget = m.budget ? `${m.budget.amount.toLocaleString()} ${m.budget.currency} / ${m.budget.period}` : '—';

  const failureBanner =
    m.status === 'failed'
      ? `<div class="err" style="margin-bottom:16px">${esc(t('mission.failed'))}${opts.failureReason ? ` — ${esc(opts.failureReason)}` : ''}</div>`
      : '';

  const cancelControl = opts.canCancel
    ? `<form method="post" action="/missions/${esc(m.id)}/cancel" style="margin-top:16px;display:flex;gap:10px;align-items:flex-end">
         <div style="flex:1"><label>${esc(t('mission.cancelLabel'))}</label><input name="reason" placeholder="${esc(t('mission.cancelReason'))}"></div>
         <button class="btn ghost" style="margin-top:0;white-space:nowrap">${esc(t('mission.cancelBtn'))}</button>
       </form>`
    : '';

  const briefBlock = opts.brief
    ? `<div class="panel" style="margin-top:20px">
        <h2>${esc(t('mission.briefTitle'))} <span class="badge">${esc(opts.brief.model)}</span></h2>
        <p class="sub">${esc(t('mission.briefGenSub'))}</p>
        <label>${esc(t('mission.objective'))}</label><div>${esc(opts.brief.objective)}</div>
        <label>${esc(t('mission.targetAudience'))}</label><div>${esc(opts.brief.targetAudience)}</div>
        <label>${esc(t('mission.positioning'))}</label><div>${esc(opts.brief.positioning)}</div>
        <label>${esc(t('mission.keyMessages'))}</label><ul>${opts.brief.keyMessages.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>
        <div class="row">
          <div><label>${esc(t('mission.recommendedChannels'))}</label><div>${opts.brief.recommendedChannels.map((c) => `<span class="badge">${esc(c)}</span>`).join(' ')}</div></div>
          <div><label>${esc(t('mission.budgetSplit'))}</label><div>${opts.brief.budgetAllocation.map((b) => `<span class="badge">${esc(b.channel)} ${b.percentage}%</span>`).join(' ')}</div></div>
        </div>
        <label>${esc(t('mission.kpis'))}</label><div>${opts.brief.kpis.map((k) => `<span class="badge">${esc(k.name)}: ${k.target} ${esc(k.unit)}</span>`).join(' ')}</div>
        ${reviewControls(`/missions/${esc(m.id)}/approve`, `/missions/${esc(m.id)}/reject`, opts.briefApproval, 'brief', t('review.next.brief'), gov)}
      </div>`
    : opts.prereqMissing
      ? `<div class="panel" style="margin-top:20px"><div class="err">${esc(opts.prereqMissing)}</div></div>`
      : `<div class="panel" style="margin-top:20px">
          <h2>${esc(t('mission.miTitle'))}</h2>
          <p class="sub">${esc(t('mission.miSub'))}</p>
          <form method="post" action="/missions/${esc(m.id)}/brief"><button class="btn">${esc(t('mission.genBrief'))}</button></form>
        </div>`;

  // Creative Studio unlocks only once the brief is approved.
  const creativeBlock =
    opts.briefApproval !== 'approved'
      ? ''
      : opts.creative
        ? `<div class="panel" style="margin-top:20px">
            <h2>${esc(t('mission.creativeTitle'))} <span class="badge">${esc(opts.creative.model)}</span></h2>
            <p class="sub">${esc(t('mission.creativeReadySub'))}</p>
            <label>${esc(t('mission.headline'))}</label><div>${esc(opts.creative.headline)}</div>
            <label>${esc(t('mission.adCopy'))}</label><div>${esc(opts.creative.adCopy)}</div>
            <label>${esc(t('mission.cta'))}</label><div><span class="badge">${esc(opts.creative.cta)}</span></div>
            <label>${esc(t('mission.socialPost'))}</label><div>${esc(opts.creative.socialPost)}</div>
            <label>${esc(t('mission.landingPage'))}</label><div><b>${esc(opts.creative.landingPage.headline)}</b><br>${esc(opts.creative.landingPage.body)}<br><span class="badge">${esc(opts.creative.landingPage.cta)}</span></div>
            <label>${esc(t('mission.emailLabel'))}</label><div><b>${esc(opts.creative.email.subject)}</b><br>${esc(opts.creative.email.body)}</div>
            ${reviewControls(`/missions/${esc(m.id)}/creative/approve`, `/missions/${esc(m.id)}/creative/reject`, opts.creativeApproval, 'creative', t('review.next.creative'), gov)}
          </div>`
        : `<div class="panel" style="margin-top:20px">
            <h2>${esc(t('mission.creativeTitle'))}</h2>
            <p class="sub">${esc(t('mission.creativeGenSub'))}</p>
            <form method="post" action="/missions/${esc(m.id)}/creative"><button class="btn">${esc(t('mission.genCreative'))}</button></form>
          </div>`;

  // Campaign builder unlocks only once the creative is approved.
  const campaignBlock =
    opts.creativeApproval !== 'approved'
      ? ''
      : opts.campaign
        ? renderCampaign(m.id, opts.campaign, opts.campaignApproval, gov)
        : `<div class="panel" style="margin-top:20px">
            <h2>${esc(t('mission.campaignTitle'))}</h2>
            <p class="sub">${esc(t('mission.campaignGenSub'))}</p>
            <form method="post" action="/missions/${esc(m.id)}/campaign"><button class="btn">${esc(t('mission.genCampaign'))}</button></form>
          </div>`;

  // Analytics unlocks only once the campaign is approved.
  const d = opts.reportDefaults ?? { spend: 0, revenue: 0, currency: 'TRY' };
  const analyticsBlock =
    opts.campaignApproval !== 'approved'
      ? ''
      : opts.report
        ? renderReport(opts.report)
        : `<div class="panel" style="margin-top:20px">
            <h2>${esc(t('mission.analyticsTitle'))}</h2>
            <p class="sub">${esc(t('mission.analyticsSub'))}</p>
            <form method="post" action="/missions/${esc(m.id)}/analytics">
              <div class="row-3">
                <div><label>${esc(t('mission.impressions'))}</label><input name="impressions" type="number" min="0" value="100000"></div>
                <div><label>${esc(t('mission.clicks'))}</label><input name="clicks" type="number" min="0" value="2000"></div>
                <div><label>${esc(t('mission.conversions'))}</label><input name="conversions" type="number" min="0" value="100"></div>
              </div>
              <div class="row-3">
                <div><label>${esc(t('mission.leads'))}</label><input name="leads" type="number" min="0" value="130"></div>
                <div><label>${esc(t('mission.spend'))}</label><input name="spend" type="number" min="0" step="0.01" value="${esc(String(d.spend))}"></div>
                <div><label>${esc(t('mission.revenue'))}</label><input name="revenue" type="number" min="0" step="0.01" value="${esc(String(d.revenue))}"></div>
              </div>
              <input type="hidden" name="currency" value="${esc(d.currency)}">
              <div class="actions"><button class="btn">${esc(t('mission.genReport'))}</button></div>
            </form>
          </div>`;

  // The CEO Dashboard unlocks once the analytics report exists.
  const executiveBlock = !opts.report
    ? ''
    : opts.executive
      ? renderExecutive(opts.executive)
      : `<div class="panel" style="margin-top:20px">
          <h2>${esc(t('mission.ceoTitle'))}</h2>
          <p class="sub">${esc(t('mission.ceoSub'))}</p>
          <form method="post" action="/missions/${esc(m.id)}/executive"><button class="btn">${esc(t('mission.genCeo'))}</button></form>
        </div>`;

  // Company Brain learning unlocks once the analytics report exists.
  const learningBlock = !opts.report
    ? ''
    : opts.learning
      ? renderLearning(opts.learning)
      : `<div class="panel" style="margin-top:20px">
          <h2>${esc(t('mission.brainTitle'))}</h2>
          <p class="sub">${esc(t('mission.brainSub'))}</p>
          <form method="post" action="/missions/${esc(m.id)}/learn"><button class="btn">${esc(t('mission.recordLearning'))}</button></form>
        </div>`;

  return layout({
    title: t('mission.title'),
    active: '/missions',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(t('mission.title'))}</h1><p><a href="/missions">${esc(t('mission.allMissions'))}</a></p></div>
        <span class="badge ${m.status === 'failed' ? '' : 'active'}">${esc(m.status)}</span></div>
      ${opts.error ? `<div class="err">${esc(opts.error)}</div>` : ''}
      ${failureBanner}
      <div class="panel">
        <label>${esc(t('mission.objective'))}</label><div>${esc(m.objective)}</div>
        <label>${esc(t('mission.budget'))}</label><div>${esc(budget)}</div>
        ${cancelControl}
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
    <h2>${esc(t('exec.title'))} <span class="badge ${verdictClass}">${esc(verdictLabel)}</span> <span class="badge">${esc(e.model)}</span></h2>
    <p class="sub">${esc(t('exec.sub'))}</p>
    <label>${esc(t('mission.headline'))}</label><div><b>${esc(e.headline)}</b></div>
    <label>${esc(t('exec.execSummary'))}</label><div>${esc(e.executiveSummary)}</div>
    ${cards ? `<label>${esc(t('exec.keyResults'))}</label><div class="grid" style="margin-bottom:6px">${cards}</div>` : ''}
    <label>${esc(t('exec.decisions'))}</label><ul class="recs">${e.decisions.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
    <label>${esc(t('exec.nextActions'))}</label><ul class="recs">${e.nextActions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
  </div>`;
}

function renderLearning(l: LearningView): string {
  const stores = ['Decision Journal', 'Executive Memory', 'Company Brain', 'Pattern Library', 'Knowledge Graph'];
  return `<div class="panel" style="margin-top:20px">
    <h2>${esc(t('mission.brainTitle'))} <span class="badge active">${esc(t('learn.recorded'))}</span></h2>
    <p class="sub">${esc(t('learn.sub'))}</p>
    <label>${esc(t('learn.decision'))}</label><div>${esc(l.decision)}</div>
    <label>${esc(t('learn.chosen'))}</label><div>${esc(l.chosen)}</div>
    <label>${esc(t('learn.confidence'))}</label><div><span class="badge">${l.confidence}/100</span></div>
    <label>${esc(t('learn.outcome'))}</label><div>${l.outcome.map((o) => `<span class="badge">${esc(o.label)}: ${esc(o.value)}</span>`).join(' ')}</div>
    <label>${esc(t('learn.learned'))}</label><div>${esc(l.learned)}</div>
    <label>${esc(t('learn.writtenTo'))}</label><div>${stores.map((s) => `<span class="badge active">${esc(s)}</span>`).join(' ')}</div>
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
    <h2>${esc(t('report.title'))} <span class="badge">${esc(r.model)}</span></h2>
    <p class="sub">${esc(t('report.sub'))}</p>
    <div class="grid" style="margin-bottom:6px">${cards}</div>
    <div class="bars">${bars}</div>
    <label style="margin-top:20px">${esc(t('exec.execSummary'))}</label><div>${esc(r.summary)}</div>
    ${r.highlights.length ? `<label>${esc(t('report.highlights'))}</label><div>${r.highlights.map((h) => `<span class="badge">${esc(h)}</span>`).join(' ')}</div>` : ''}
    <label>${esc(t('report.recommendations'))}</label><ul class="recs">${r.recommendations.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  </div>`;
}

function renderCampaign(missionId: string, c: CampaignView, approval: Approval, governance?: GovernanceView): string {
  const budgetRows = c.channels
    .map((ch) => `<tr><td>${esc(ch.channel)}</td><td>${ch.budgetPercentage}%</td><td>${esc(ch.adSets.map((a) => a.audience).join('; '))}</td></tr>`)
    .join('');
  const adSets = c.channels
    .flatMap((ch) => ch.adSets.map((a) => `<li><b>${esc(a.name)}</b> — ${esc(a.headline)} · <span class="badge">${esc(a.cta)}</span></li>`))
    .join('');
  return `<div class="panel" style="margin-top:20px">
    <h2>${esc(t('campaign.draftTitle'))} <span class="badge">${esc(c.model)}</span> <span class="badge">${esc(t('campaign.draftBadge'))}</span></h2>
    <p class="sub">${esc(c.name)} — ${esc(t('campaign.totalBudget'))} ${c.totalBudget.amount.toLocaleString()} ${esc(c.totalBudget.currency)}.</p>
    <label>${esc(t('campaign.budgetAudience'))}</label>
    <table><thead><tr><th>${esc(t('campaign.channel'))}</th><th>${esc(t('mission.budget'))}</th><th>${esc(t('campaign.audience'))}</th></tr></thead><tbody>${budgetRows}</tbody></table>
    <label style="margin-top:16px">${esc(t('campaign.adSets'))}</label><ul>${adSets}</ul>
    <label>${esc(t('campaign.schedule'))}</label><div><span class="badge">${esc(t('campaign.start'))}: ${esc(c.schedule.startHint)}</span> <span class="badge">${c.schedule.durationDays} ${esc(t('campaign.days'))}</span></div>
    ${reviewControls(`/missions/${esc(missionId)}/campaign/approve`, `/missions/${esc(missionId)}/campaign/reject`, approval, 'campaign', t('review.next.campaign'), governance)}
  </div>`;
}

function reviewControls(approveHref: string, rejectHref: string, approval: Approval, noun: string, nextHint: string, governance?: GovernanceView): string {
  const subject = t(`noun.${noun}`); // capitalized subject in the active locale
  const lc = t(`noun.${noun}.lc`); // lower/accusative form for the button
  if (approval === 'approved') return `<div class="ok" style="margin-top:18px">${esc(t('review.approvedMsg', { noun: subject, next: nextHint }))}</div>`;
  if (approval === 'rejected') return `<div class="err" style="margin-top:18px">${esc(t('review.rejectedMsg', { noun: subject }))}</div>`;
  if (approval === 'pending') {
    // Governance advisory (if any) sits directly above the decision at the gate.
    // When the verdict did not pass, approving REQUIRES an explicit operator
    // acknowledgment (Sprint 4.3B) — enforced client-side (required checkbox)
    // and server-side (the /approve handler rejects without it). Override is
    // still possible once acknowledged; it is not a hard block.
    const advisory = governanceAdvisory(governance);
    const needsAck = !!governance && !governance.passed;
    const ack = needsAck
      ? `<label style="display:flex;align-items:center;gap:8px;margin:0 0 12px;font-weight:500;color:var(--text)"><input type="checkbox" name="acknowledge" value="governance" required style="width:auto"> ${esc(t('gov.ackLabel'))}</label>`
      : '';
    return `${advisory}<div class="actions" style="margin-top:20px">
      <form method="post" action="${approveHref}" style="display:flex;flex-direction:column;gap:0">${ack}<button class="btn">${esc(t('review.approveBtn', { noun: lc }))}</button></form>
      <form method="post" action="${rejectHref}"><button class="btn ghost">${esc(t('common.reject'))}</button></form>
    </div>`;
  }
  return '';
}

// ── Create Workspace ─────────────────────────────────────────────────────────
export function workspaceForm(session: Session, error?: string, values: Vals = {}): string {
  return layout({
    title: t('form.workspace.title'),
    active: '/dashboard',
    session,
    body: `${steps('workspace')}<div class="panel">
      <h2>${esc(t('form.workspace.h'))}</h2><p class="sub">${esc(t('form.workspace.sub'))}</p>
      ${banner(error)}
      <form method="post" action="/workspaces">
        <label>${esc(t('form.workspace.nameLabel'))}</label>
        <input name="name" placeholder="${esc(t('ph.workspaceName'))}" value="${esc(values['name'])}" required autofocus>
        <div class="row">
          <div><label>${esc(t('common.currency'))}</label><input name="currency" placeholder="TRY" value="${esc(values['currency'] || 'TRY')}"></div>
          <div><label>${esc(t('common.timezone'))}</label><input name="timezone" placeholder="Europe/Istanbul" value="${esc(values['timezone'] || 'Europe/Istanbul')}"></div>
        </div>
        <div class="actions"><button class="btn">${esc(t('form.workspace.submit'))}</button></div>
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
    title: t('form.client.title'),
    active: '/clients',
    session: opts.session,
    body: `${steps('client')}<div class="panel">
      <h2>${esc(t('form.client.h'))}</h2><p class="sub">${esc(t('form.client.sub'))}</p>
      ${banner(opts.error)}
      <form method="post" action="/clients">
        <label>${esc(t('common.workspace'))}</label><select name="workspaceId" required>${options}</select>
        <label>${esc(t('form.client.nameLabel'))}</label><input name="name" placeholder="${esc(t('ph.company'))}" value="${esc(v['name'])}" required>
        <div class="row">
          <div><label>${esc(t('form.client.industry'))}</label><input name="industry" placeholder="${esc(t('ph.industry'))}" value="${esc(v['industry'])}"></div>
          <div><label>${esc(t('form.client.contactEmail'))}</label><input name="email" type="email" placeholder="${esc(t('ph.contactEmail'))}" value="${esc(v['email'])}" required></div>
        </div>
        <div class="actions"><button class="btn">${esc(t('form.client.submit'))}</button></div>
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
    title: t('form.brand.title'),
    active: '/brands',
    session: opts.session,
    body: `${steps('brand')}<div class="panel">
      <h2>${esc(t('form.brand.h'))}</h2><p class="sub">${esc(t('form.brand.sub'))}</p>
      ${banner(opts.error)}
      <form method="post" action="/brands">
        <label>${esc(t('common.client'))}</label><select name="clientId" required>${options}</select>
        <label>${esc(t('form.brand.nameLabel'))}</label><input name="name" placeholder="${esc(t('ph.brandName'))}" value="${esc(v['name'])}" required>
        <div class="row">
          <div><label>${esc(t('form.brand.voice'))}</label><input name="voice" placeholder="${esc(t('ph.voice'))}" value="${esc(v['voice'] || 'professional')}"></div>
          <div><label>${esc(t('form.brand.targetAudience'))}</label><input name="targetAudience" placeholder="${esc(t('ph.audience'))}" value="${esc(v['targetAudience'])}"></div>
        </div>
        <label>${esc(t('form.brand.values'))}</label><input name="values" placeholder="${esc(t('ph.values'))}" value="${esc(v['values'])}">
        <label>${esc(t('form.brand.bannedWords'))}</label><input name="bannedWords" placeholder="${esc(t('ph.bannedWords'))}" value="${esc(v['bannedWords'])}">
        <div class="actions"><button class="btn">${esc(t('form.brand.submit'))}</button></div>
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
    title: t('form.product.title'),
    active: '/products',
    session: opts.session,
    body: `${steps('product')}<div class="panel">
      <h2>${esc(t('form.product.h'))}</h2><p class="sub">${esc(t('form.product.sub'))}</p>
      ${banner(opts.error)}
      <form method="post" action="/products">
        <label>${esc(t('common.client'))}</label><select name="clientId" required>${options}</select>
        <label>${esc(t('form.product.nameLabel'))}</label><input name="name" placeholder="${esc(t('ph.productName'))}" value="${esc(v['name'])}" required>
        <label>${esc(t('common.description'))}</label><textarea name="description" rows="2" placeholder="${esc(t('ph.productDesc'))}">${esc(v['description'])}</textarea>
        <label>${esc(t('form.product.categories'))}</label><input name="categories" placeholder="${esc(t('ph.categories'))}" value="${esc(v['categories'])}">
        <div class="row-3">
          <div><label>${esc(t('form.product.pricingModel'))}</label><select name="pricingModel">${modelOpt('one_time', t('form.product.oneTime'))}${modelOpt('subscription', t('form.product.subscription'))}${modelOpt('usage', t('form.product.usage'))}${modelOpt('free', t('form.product.free'))}</select></div>
          <div><label>${esc(t('form.product.price'))}</label><input name="price" type="number" min="0" step="0.01" placeholder="129" value="${esc(v['price'])}"></div>
          <div><label>${esc(t('common.currency'))}</label><input name="currency" placeholder="TRY" value="${esc(v['currency'] || 'TRY')}"></div>
        </div>
        <div class="actions"><button class="btn">${esc(t('form.product.submit'))}</button></div>
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
    ? `<label>${esc(t('common.project'))} (${esc(t('common.optional'))})</label><select name="projectId"><option value="">${esc(t('common.none'))}</option>${projects
        .map((p) => `<option value="${esc(p.id)}" ${v['projectId'] === p.id ? 'selected' : ''}>${esc(p.name)}</option>`)
        .join('')}</select>`
    : '';
  const period = v['period'] || 'monthly';
  const pOpt = (val: string, label: string): string => `<option value="${val}" ${period === val ? 'selected' : ''}>${label}</option>`;
  return layout({
    title: t('form.mission.title'),
    active: '/missions',
    session: opts.session,
    body: `${steps('mission')}<div class="panel">
      <h2>${esc(t('form.mission.h'))}</h2><p class="sub">${esc(t('form.mission.sub'))}</p>
      ${banner(opts.error)}
      <form method="post" action="/missions">
        <div class="row">
          <div><label>${esc(t('common.workspace'))}</label><select name="workspaceId" required>${wsOpts}</select></div>
          <div><label>${esc(t('common.client'))}</label><select name="clientId" required>${clOpts}</select></div>
        </div>
        ${projField}
        <label>${esc(t('form.mission.objective'))}</label>
        <textarea name="objective" rows="3" placeholder="${esc(t('ph.missionObjective'))}" required>${esc(v['objective'])}</textarea>
        <div class="row-3">
          <div><label>${esc(t('form.mission.budget'))}</label><input name="budget" type="number" min="1" step="0.01" placeholder="80000" value="${esc(v['budget'])}" required></div>
          <div><label>${esc(t('common.currency'))}</label><input name="currency" placeholder="TRY" value="${esc(v['currency'] || 'TRY')}"></div>
          <div><label>${esc(t('common.period'))}</label><select name="period">${pOpt('daily', t('form.period.daily'))}${pOpt('weekly', t('form.period.weekly'))}${pOpt('monthly', t('form.period.monthly'))}${pOpt('total', t('form.period.total'))}</select></div>
        </div>
        <div class="row-3">
          <div><label>${esc(t('form.mission.targetMetric'))}</label><input name="metricName" placeholder="${esc(t('ph.metricName'))}" value="${esc(v['metricName'] || 'leads')}"></div>
          <div><label>${esc(t('form.mission.targetValue'))}</label><input name="metricTarget" type="number" min="1" placeholder="120" value="${esc(v['metricTarget'])}"></div>
          <div><label>${esc(t('form.mission.unit'))}</label><input name="metricUnit" placeholder="${esc(t('ph.metricUnit'))}" value="${esc(v['metricUnit'] || 'count')}"></div>
        </div>
        <div class="actions"><button class="btn">${esc(t('form.mission.submit'))}</button></div>
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
    title: t('form.project.title'),
    active: '/projects',
    session: opts.session,
    body: `<div class="panel">
      <h2>${esc(t('form.project.h'))}</h2><p class="sub">${esc(t('form.project.sub'))}</p>
      ${banner(opts.error)}
      <form method="post" action="/projects">
        <label>${esc(t('common.brand'))}</label><select name="brandId" required>${brandOpts}</select>
        <label>${esc(t('form.project.nameLabel'))}</label><input name="name" placeholder="${esc(t('ph.projectName'))}" value="${esc(v['name'])}" required>
        <label>${esc(t('common.description'))}</label><textarea name="description" rows="2" placeholder="${esc(t('ph.projectDesc'))}">${esc(v['description'])}</textarea>
        <div class="actions"><button class="btn">${esc(t('form.project.submit'))}</button></div>
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
    ? `<table><thead><tr><th>${esc(t('proj.goal'))}</th><th>${esc(t('proj.metric'))}</th><th>${esc(t('proj.target'))}</th></tr></thead><tbody>${opts.data.goals
        .map((g) => `<tr><td>${esc(g.description)}</td><td>${esc(g.metric)}</td><td>${g.target}</td></tr>`)
        .join('')}</tbody></table>`
    : `<div class="empty">${esc(t('proj.noGoals'))}</div>`;

  const members = opts.data.members.length
    ? `<table><thead><tr><th>${esc(t('common.name'))}</th><th>${esc(t('common.email'))}</th><th>${esc(t('common.role'))}</th></tr></thead><tbody>${opts.data.members
        .map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td><span class="badge">${esc(m.role)}</span></td></tr>`)
        .join('')}</tbody></table>`
    : `<div class="empty">${esc(t('proj.noMembers'))}</div>`;

  const timeline = opts.data.timeline.length
    ? `<ul class="feed">${opts.data.timeline
        .map((tl) => `<li><span>${esc(tl.label)}</span><span class="t">${esc(tl.detail)}</span></li>`)
        .join('')}</ul>`
    : `<div class="empty">${esc(t('proj.noActivity'))}</div>`;

  const missions = opts.data.missions.length
    ? `<table><thead><tr><th>${esc(t('list.col.objective'))}</th><th>${esc(t('common.status'))}</th></tr></thead><tbody>${opts.data.missions
        .map((m) => `<tr><td><a href="/missions/${esc(m.id)}">${esc(m.objective)}</a></td><td><span class="badge active">${esc(m.status)}</span></td></tr>`)
        .join('')}</tbody></table>`
    : `<div class="empty">${esc(t('proj.noMissions'))} <a href="/missions/new">${esc(t('proj.createOneAssign'))}</a> ${esc(t('proj.andAssign'))}</div>`;

  const r = opts.data.rollup;
  const stat = (n: number, l: string): string => `<div class="card stat"><div class="n">${n}</div><div class="l">${l}</div></div>`;

  const controls = archived
    ? `<span class="badge">${esc(t('proj.archived'))}</span>`
    : `<form method="post" action="/projects/${esc(p.id)}/status" style="display:flex;gap:8px;align-items:center">
         <select name="status">${statusOpt('active')}${statusOpt('paused')}${statusOpt('completed')}</select>
         <button class="btn ghost" style="padding:8px 12px">${esc(t('proj.setStatus'))}</button>
       </form>
       <form method="post" action="/projects/${esc(p.id)}/archive"><button class="btn ghost" style="padding:8px 12px">${esc(t('proj.archive'))}</button></form>`;

  return layout({
    title: p.name,
    active: '/projects',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(p.name)}</h1>
        <p><a href="/projects">${esc(t('proj.allProjects'))}</a> · ${esc(p.clientName)} · ${esc(p.brandName)}</p></div>
        <div style="display:flex;gap:10px;align-items:center">${controls}</div></div>
      ${opts.error ? `<div class="err">${esc(opts.error)}</div>` : ''}
      <div class="panel">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><span class="badge ${archived ? '' : 'active'}">${esc(p.status)}</span></div>
        <label>${esc(t('common.description'))}</label><div>${esc(p.description) || '—'}</div>
      </div>

      <div class="grid" style="margin-top:20px">
        ${stat(opts.data.missions.length, t('proj.stat.missions'))}${stat(r.briefs, t('proj.stat.briefs'))}${stat(r.creatives, t('proj.stat.creatives'))}${stat(r.campaigns, t('proj.stat.campaigns'))}${stat(r.reports, t('proj.stat.reports'))}
      </div>

      <div class="panel" style="margin-top:20px"><h2>${esc(t('proj.goals'))}</h2>${goals}
        ${archived ? '' : `<form method="post" action="/projects/${esc(p.id)}/goal" style="margin-top:14px">
          <div class="row-3">
            <div><label>${esc(t('proj.goal'))}</label><input name="description" placeholder="${esc(t('ph.goalDesc'))}" required></div>
            <div><label>${esc(t('proj.metric'))}</label><input name="metric" placeholder="${esc(t('ph.metricName'))}" required></div>
            <div><label>${esc(t('proj.target'))}</label><input name="target" type="number" min="0" value="0"></div>
          </div>
          <div class="actions"><button class="btn">${esc(t('proj.addGoal'))}</button></div></form>`}
      </div>

      <div class="panel" style="margin-top:20px"><h2>${esc(t('proj.members'))}</h2>${members}
        ${archived ? '' : `<form method="post" action="/projects/${esc(p.id)}/member" style="margin-top:14px">
          <div class="row-3">
            <div><label>${esc(t('common.name'))}</label><input name="name" placeholder="Ada Lovelace" required></div>
            <div><label>${esc(t('common.email'))}</label><input name="email" type="email" placeholder="ada@acme.com" required></div>
            <div><label>${esc(t('common.role'))}</label><input name="role" placeholder="${esc(t('ph.memberRole'))}"></div>
          </div>
          <div class="actions"><button class="btn">${esc(t('proj.addMember'))}</button></div></form>`}
      </div>

      <div class="panel" style="margin-top:20px"><h2>${esc(t('proj.missions'))}</h2>${missions}</div>
      <div class="panel" style="margin-top:20px"><h2>${esc(t('proj.timeline'))}</h2><p class="sub">${esc(t('proj.timelineSub'))}</p>${timeline}</div>`,
  });
}

// ── Approval Workflow (Phase 8) ─────────────────────────────────────────────────
/** Human labels for each workflow state, in the active locale. */
export function approvalStatusLabel(status: string): string {
  const key = `appr.status.${status}`;
  const label = t(key);
  return label === key ? status : label;
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
    ? `<label>${esc(t('common.project'))} (${esc(t('common.optional'))})</label><select name="projectId"><option value="">${esc(t('common.none'))}</option>${projects
        .map((p) => `<option value="${esc(p.id)}" ${v['projectId'] === p.id ? 'selected' : ''}>${esc(p.name)}</option>`)
        .join('')}</select>`
    : '';
  return layout({
    title: t('appr.newTitle'),
    active: '/approvals',
    session: opts.session,
    body: `<div class="panel">
      <h2>${esc(t('appr.requestH'))}</h2><p class="sub">${esc(t('appr.requestSub'))}</p>
      ${banner(opts.error)}
      <form method="post" action="/approvals">
        <label>${esc(t('common.title'))}</label><input name="title" placeholder="${esc(t('ph.approvalTitle'))}" value="${esc(v['title'])}" required autofocus>
        <label>${esc(t('common.description'))}</label><textarea name="description" rows="3" placeholder="${esc(t('appr.descPlaceholder'))}">${esc(v['description'])}</textarea>
        ${projField}
        <div class="actions"><button class="btn">${esc(t('appr.createDraft'))}</button></div>
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
    controls = `<form method="post" action="${post('submit')}"><button class="btn">${esc(t('appr.submitReview'))}</button></form>`;
  } else if (a.status === 'in_review') {
    controls = `<form method="post">
        <label>${esc(t('appr.decisionNote'))}</label>
        <textarea name="note" rows="2" placeholder="${esc(t('appr.decisionNotePh'))}"></textarea>
        <div class="actions">
          <button class="btn" formaction="${post('approve')}">${esc(t('common.approve'))}</button>
          <button class="btn ghost" formaction="${post('revise')}">${esc(t('appr.requestRevision'))}</button>
          <button class="btn ghost" formaction="${post('reject')}">${esc(t('common.reject'))}</button>
        </div>
      </form>`;
  } else if (a.status === 'revision_requested') {
    const lastNote = [...a.timeline].reverse().find((tl) => tl.action === 'revision_requested')?.note;
    controls = `${lastNote ? `<div class="err" style="margin-bottom:14px">${esc(t('appr.revisionRequested'))} ${esc(lastNote)}</div>` : ''}
      <form method="post" action="${post('submit')}"><button class="btn">${esc(t('appr.resubmit'))}</button></form>`;
  } else if (a.status === 'approved') {
    controls = `<div class="ok">${esc(t('appr.approvedClosed'))}</div>`;
  } else if (a.status === 'rejected') {
    controls = `<div class="err">${esc(t('appr.rejectedClosed'))}</div>`;
  }

  const timeline = a.timeline.length
    ? `<ul class="feed">${a.timeline
        .map((tl) => {
          const flow = tl.action === 'created' ? t('appr.created') : `${approvalStatusLabel(tl.from)} → ${approvalStatusLabel(tl.to)}`;
          const note = tl.note ? ` — ${esc(tl.note)}` : '';
          return `<li><span><span class="ev">${esc(flow)}</span>${note} · ${esc(tl.actor)}</span><span class="t">${esc(tl.at.replace('T', ' ').slice(0, 19))}</span></li>`;
        })
        .join('')}</ul>`
    : `<div class="empty">${esc(t('proj.noActivity'))}</div>`;

  return layout({
    title: a.title,
    active: '/approvals',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(a.title)}</h1>
        <p><a href="/approvals">${esc(t('appr.allApprovals'))}</a> · ${esc(t('appr.requestedBy'))} ${esc(a.requestedBy)}${a.projectName ? ` · ${esc(a.projectName)}` : ''}</p></div>
        <span class="badge ${approvalBadgeClass(a.status)}">${esc(approvalStatusLabel(a.status))}</span></div>
      ${opts.error ? `<div class="err">${esc(opts.error)}</div>` : ''}
      <div class="panel">
        <label>${esc(t('common.description'))}</label><div>${esc(a.description) || '—'}</div>
      </div>
      <div class="panel" style="margin-top:20px"><h2>${esc(t('appr.decision'))}</h2>
        <p class="sub">${esc(t('appr.currentState'))} <b>${esc(approvalStatusLabel(a.status))}</b>.</p>
        ${controls}
      </div>
      <div class="panel" style="margin-top:20px"><h2>${esc(t('appr.timeline'))}</h2>
        <p class="sub">${esc(t('appr.timelineSub'))}</p>${timeline}</div>`,
  });
}

// ── Asset Library (Phase 9) ─────────────────────────────────────────────────────
export function assetKindLabel(kind: string): string {
  const key = `asset.kind.${kind}`;
  const label = t(key);
  return label === key ? kind : label;
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
      : `<div class="empty">${esc(t('asset.previewUnavailable'))}</div>`;
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
    ? `<table><thead><tr><th>${esc(t('common.name'))}</th><th>${esc(t('asset.kindCol'))}</th><th>${esc(t('common.client'))}</th><th>${esc(t('asset.tags'))}</th><th>${esc(t('asset.version'))}</th></tr></thead>
       <tbody>${opts.assets
         .map(
           (a) =>
             `<tr><td><a href="/assets/${esc(a.id)}">${esc(a.name)}</a></td>
              <td><span class="badge">${esc(assetKindLabel(a.kind))}</span></td>
              <td>${esc(a.clientName)}</td>
              <td>${a.tags.map((tag) => `<a class="badge" href="/assets?tag=${encodeURIComponent(tag)}">${esc(tag)}</a>`).join(' ') || '—'}</td>
              <td><span class="badge active">v${a.version}</span></td></tr>`,
         )
         .join('')}</tbody></table>`
    : `<div class="empty">${opts.query || opts.tag ? esc(t('asset.noMatch')) : esc(t('asset.empty'))}</div>`;

  return layout({
    title: t('nav.assets'),
    active: '/assets',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(t('asset.libTitle'))}</h1><p>${esc(t('asset.libSub'))}</p></div>
      <a class="btn" href="/assets/new">${esc(t('asset.new'))}</a></div>
      <div class="panel" style="margin-bottom:20px">
        <form method="get" action="/assets" style="display:flex;gap:10px;align-items:flex-end">
          <div style="flex:1"><label>${esc(t('common.search'))}</label><input name="q" placeholder="${esc(t('asset.searchPh'))}" value="${esc(opts.query)}"></div>
          ${opts.tag ? `<input type="hidden" name="tag" value="${esc(opts.tag)}">` : ''}
          <button class="btn" style="margin-top:0">${esc(t('common.search'))}</button>
          ${opts.query || opts.tag ? `<a class="btn ghost" href="/assets" style="margin-top:0">${esc(t('common.clear'))}</a>` : ''}
        </form>
        ${opts.tag ? `<p class="sub" style="margin-top:12px">${esc(t('asset.filteredByTag'))} <span class="badge">${esc(opts.tag)}</span></p>` : ''}
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
      ? `<div><label>${esc(label)} (${esc(t('common.optional'))})</label><select name="${field}"><option value="">${esc(t('common.none'))}</option>${items
          .map((i) => `<option value="${esc(i.id)}" ${v[field] === i.id ? 'selected' : ''}>${esc(i.name)}</option>`)
          .join('')}</select></div>`
      : '';
  const kind = v['kind'] || 'image';
  const kindOpt = (val: string, label: string): string => `<option value="${val}" ${kind === val ? 'selected' : ''}>${label}</option>`;
  return layout({
    title: t('asset.newTitle'),
    active: '/assets',
    session: opts.session,
    body: `<div class="panel">
      <h2>${esc(t('asset.addH'))}</h2><p class="sub">${esc(t('asset.addSub'))}</p>
      ${banner(opts.error)}
      <form method="post" action="/assets">
        <label>${esc(t('common.client'))}</label><select name="clientId" required>${clOpts}</select>
        <div class="row">${optional(opts.brands, 'brandId', t('common.brand'))}${optional(opts.projects, 'projectId', t('common.project'))}</div>
        <div class="row">
          <div><label>${esc(t('common.name'))}</label><input name="name" placeholder="${esc(t('ph.assetName'))}" value="${esc(v['name'])}" required></div>
          <div><label>${esc(t('asset.kindCol'))}</label><select name="kind">${kindOpt('image', t('asset.kind.image'))}${kindOpt('copy', t('asset.kind.copy'))}${kindOpt('document', t('asset.kind.document'))}${kindOpt('link', t('asset.kind.link'))}</select></div>
        </div>
        <label>${esc(t('asset.content'))}</label><textarea name="content" rows="4" placeholder="${esc(t('asset.contentPh'))}" required>${esc(v['content'])}</textarea>
        <label>${esc(t('asset.tagsLabel'))}</label><input name="tags" placeholder="${esc(t('ph.assetTags'))}" value="${esc(v['tags'])}">
        <div class="actions"><button class="btn">${esc(t('asset.addToLibrary'))}</button></div>
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
    ? a.tags.map((tag) => `<a class="badge" href="/assets?tag=${encodeURIComponent(tag)}">${esc(tag)}</a>`).join(' ')
    : `<span class="sub">${esc(t('asset.noTags'))}</span>`;

  const history = a.versions.length
    ? `<ul class="feed">${[...a.versions]
        .reverse()
        .map(
          (v) =>
            `<li><span><span class="ev">v${v.version}</span>${v.version === a.currentVersion ? ` <span class="badge active">${esc(t('asset.current'))}</span>` : ''}${v.note ? ` — ${esc(v.note)}` : ''} · ${esc(v.by)}</span><span class="t">${esc(v.at.replace('T', ' ').slice(0, 19))}</span></li>`,
        )
        .join('')}</ul>`
    : `<div class="empty">${esc(t('asset.noVersions'))}</div>`;

  return layout({
    title: a.name,
    active: '/assets',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(a.name)}</h1>
        <p><a href="/assets">${esc(t('asset.libraryLink'))}</a> · ${scope}</p></div>
        <div style="display:flex;gap:8px;align-items:center"><span class="badge">${esc(assetKindLabel(a.kind))}</span><span class="badge active">v${a.currentVersion}</span></div></div>
      ${opts.error ? `<div class="err">${esc(opts.error)}</div>` : ''}
      <div class="panel"><h2>${esc(t('asset.preview'))} <span class="sub">— ${esc(t('asset.versionWord'))} ${a.currentVersion}</span></h2>${assetPreview(a.kind, a.currentContent)}</div>

      <div class="panel" style="margin-top:20px"><h2>${esc(t('asset.tags'))}</h2>
        <div style="margin-bottom:14px">${tags}</div>
        <form method="post" action="/assets/${esc(a.id)}/tag" style="display:flex;gap:10px;align-items:flex-end">
          <div style="flex:1"><label>${esc(t('asset.addTag'))}</label><input name="tag" placeholder="${esc(t('ph.tag'))}" required></div>
          <button class="btn" style="margin-top:0">${esc(t('asset.addTag'))}</button>
        </form>
      </div>

      <div class="panel" style="margin-top:20px"><h2>${esc(t('asset.versions'))}</h2>
        <p class="sub">${esc(t('asset.versionsSub'))}</p>${history}
        <form method="post" action="/assets/${esc(a.id)}/version" style="margin-top:14px">
          <label>${esc(t('asset.newVersionContent'))}</label><textarea name="content" rows="3" placeholder="${esc(t('asset.newVersionPh'))}" required></textarea>
          <label>${esc(t('asset.note'))}</label><input name="note" placeholder="${esc(t('asset.notePh'))}">
          <div class="actions"><button class="btn">${esc(t('asset.addVersion'))}</button></div>
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
           <label>${esc(t('common.workspace'))}</label>
           <div style="display:flex;gap:10px">
             <select name="workspaceId">${opts.workspaces
               .map((w) => `<option value="${esc(w.id)}" ${w.id === opts.selectedId ? 'selected' : ''}>${esc(w.name)}</option>`)
               .join('')}</select>
             <button class="btn ghost" style="white-space:nowrap">${esc(t('set.switch'))}</button>
           </div>
         </form>`
      : '';

  return layout({
    title: t('set.title'),
    active: '/settings',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(t('set.title'))}</h1><p>${esc(t('set.sub'))}</p></div></div>
      ${opts.saved ? `<div class="ok">${esc(t('set.saved'))}</div>` : ''}
      ${banner(opts.error)}
      <div class="panel" style="margin-bottom:20px">
        <label>${esc(t('set.account'))}</label>
        <div><span class="badge">${esc(t('set.signedInAs'))} ${esc(opts.session.actor)}</span> <span class="badge">${esc(t('chrome.tenant'))}: ${esc(opts.session.tenantId)}</span></div>
      </div>
      <div class="panel">
        <h2>${esc(t('set.wsH'))}</h2><p class="sub">${esc(t('set.wsSub'))}</p>
        ${selector}
        <form method="post" action="/settings">
          <input type="hidden" name="workspaceId" value="${esc(opts.selectedId)}">
          <label>${esc(t('form.workspace.nameLabel'))}</label><input name="name" value="${esc(v.name)}" required>
          <div class="row-3">
            <div><label>${esc(t('common.currency'))}</label><input name="currency" value="${esc(v.currency)}" required></div>
            <div><label>${esc(t('common.timezone'))}</label><input name="timezone" value="${esc(v.timezone)}" required></div>
            <div><label>${esc(t('set.locale'))}</label><input name="locale" value="${esc(v.locale)}" required></div>
          </div>
          <div class="actions"><button class="btn">${esc(t('set.save'))}</button></div>
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
    ? `<label>${esc(t('common.project'))} (${esc(t('common.optional'))})</label><select name="projectId"><option value="">${esc(t('rep.wholeClient'))}</option>${opts.projects
        .map((p) => `<option value="${esc(p.id)}" ${v['projectId'] === p.id ? 'selected' : ''}>${esc(p.name)}</option>`)
        .join('')}</select>`
    : '';
  return layout({
    title: t('rep.newTitle'),
    active: '/reports',
    session: opts.session,
    body: `<div class="panel">
      <h2>${esc(t('rep.genH'))}</h2><p class="sub">${esc(t('rep.genSub'))}</p>
      ${banner(opts.error)}
      <form method="post" action="/reports">
        <label>${esc(t('common.client'))}</label><select name="clientId" required>${clOpts}</select>
        ${projField}
        <div class="row">
          <div><label>${esc(t('common.title'))}</label><input name="title" placeholder="${esc(t('ph.reportTitle'))}" value="${esc(v['title'])}" required></div>
          <div><label>${esc(t('common.period'))}</label><input name="period" placeholder="${esc(t('rep.periodPh'))}" value="${esc(v['period'])}"></div>
        </div>
        <div class="actions"><button class="btn">${esc(t('rep.generate'))}</button></div>
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
        <p><a href="/reports">${esc(t('rep.allReports'))}</a> · ${esc(d.clientName)}${d.projectName ? ` · ${esc(d.projectName)}` : ''} · ${esc(d.period)}</p></div>
        <span class="badge">${esc(d.generatedAt.replace('T', ' ').slice(0, 16))}</span></div>
      <div class="panel"><h2>${esc(t('rep.summary'))}</h2><p class="sub">${esc(t('rep.generatedBy'))} ${esc(d.generatedBy)}.</p><div>${esc(d.summary)}</div></div>
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

/**
 * AI Execution Traces — the live audit trail (Sprint 4.1). Each row is one AI
 * task that actually ran; the step chips show the honest pipeline that executed
 * (received → inference → completed/failed). Governed stages are not shown
 * because they are not wired yet — the trace never claims what didn't run.
 */
export function tracesPage(opts: {
  session: Session;
  traces: ExecutionTrace[];
  metrics?: GovernanceMetrics;
  funnel?: ApprovalFunnel;
  review?: ReviewStats;
  latency?: StageTiming[];
  revisions?: RevisionFunnel;
  resilience?: ResilienceStats;
}): string {
  const time = (iso?: string): string => (iso ? esc(iso.slice(11, 19)) : '—');
  const metricsPanel = opts.metrics && opts.metrics.total > 0 ? governanceMetricsPanel(opts.metrics) : '';
  const funnelPanel = opts.funnel && opts.funnel.approvals > 0 ? approvalFunnelPanel(opts.funnel) : '';
  const reviewPanel = opts.review && opts.review.count > 0 ? reviewStatsPanel(opts.review) : '';
  const revisionPanel = opts.revisions && opts.revisions.created > 0 ? revisionFunnelPanel(opts.revisions) : '';
  const latencyPanel = opts.latency && opts.latency.length > 0 ? stageLatencyPanel(opts.latency) : '';
  const resiliencePanel = opts.resilience && opts.resilience.aiTasks > 0 ? resiliencePanelHtml(opts.resilience) : '';
  const body =
    opts.traces.length === 0
      ? `<div class="panel"><div class="empty">${esc(t('traces.empty'))}</div></div>`
      : `<div class="panel"><table><thead><tr>
          <th>${esc(t('traces.col.capability'))}</th>
          <th>${esc(t('traces.col.model'))}</th>
          <th>${esc(t('traces.col.prompt'))}</th>
          <th>${esc(t('traces.col.mission'))}</th>
          <th>${esc(t('traces.col.latency'))}</th>
          <th>${esc(t('traces.col.steps'))}</th>
          <th>${esc(t('traces.col.started'))}</th>
         </tr></thead><tbody>${opts.traces
           .map((tr) => {
             const chips = tr.steps
               .map((s) => `<span class="step">${esc(s.name)}</span>`)
               .join(' ');
             const model = tr.model ? `${esc(tr.model)}${tr.engine ? ` <span class="badge">${esc(tr.engine)}</span>` : ''}` : '—';
             const prompt = tr.promptKey
               ? `${esc(tr.promptKey)}${tr.promptVersion !== undefined ? ` v${esc(tr.promptVersion)}` : ''}`
               : '—';
             return `<tr>
               <td>${esc(tr.capability ?? '—')}</td>
               <td>${model}</td>
               <td>${prompt}</td>
               <td>${tr.missionId ? esc(tr.missionId) : '—'}</td>
               <td>${tr.latencyMs !== undefined ? `${esc(tr.latencyMs)} ms` : '—'}</td>
               <td><div class="steps" style="margin:0">${chips}</div></td>
               <td class="t">${time(tr.startedAt)}</td>
             </tr>`;
           })
           .join('')}</tbody></table></div>`;
  return layout({
    title: t('traces.title'),
    active: '/traces',
    session: opts.session,
    body: `<div class="head"><div><h1>${esc(t('traces.title'))}</h1><p>${esc(t('traces.subtitle'))}</p></div>
      <span class="badge active">${esc(t('traces.summary', { n: String(opts.traces.length) }))}</span></div>${metricsPanel}${funnelPanel}${reviewPanel}${revisionPanel}${latencyPanel}${resiliencePanel}${body}`,
  });
}

/** Inference resilience — fallback / failure / model health over live traces (Sprint 7). */
function resiliencePanelHtml(r: ResilienceStats): string {
  const stat = (label: string, value: string): string =>
    `<div class="card stat"><div class="n">${esc(value)}</div><div class="l">${esc(label)}</div></div>`;
  const healthRows = r.modelHealth
    .map((m) => `<tr><td>${esc(m.model)}</td><td>${m.attempts}</td><td>${m.failures}</td></tr>`)
    .join('');
  return `<div class="panel" style="margin-bottom:16px">
    <h2>${esc(t('res.title'))}</h2><p class="sub">${esc(t('res.sub'))}</p>
    <div class="grid" style="margin-bottom:18px">
      ${stat(t('res.tasks'), String(r.aiTasks))}
      ${stat(t('res.clean'), String(r.cleanFirstTry))}
      ${stat(t('res.recovered'), String(r.recoveredViaFallback))}
      ${stat(t('res.failed'), String(r.failed))}
      ${stat(t('res.fallbackRate'), `${r.fallbackRatePct}%`)}
      ${stat(t('res.failureRate'), `${r.failureRatePct}%`)}
    </div>
    ${healthRows ? `<div><label>${esc(t('res.modelHealth'))}</label><table><thead><tr><th>${esc(t('common.model'))}</th><th>${esc(t('res.attempts'))}</th><th>${esc(t('res.failures'))}</th></tr></thead><tbody>${healthRows}</tbody></table></div>` : ''}
  </div>`;
}

/** Review-duration statistics — how long human review actually takes (Sprint 5). */
function reviewStatsPanel(r: ReviewStats): string {
  const stat = (label: string, value: string): string =>
    `<div class="card stat"><div class="n">${esc(value)}</div><div class="l">${esc(label)}</div></div>`;
  const ms = (n: number): string => `${n} ms`;
  const capRows = r.byCapability
    .map((c) => `<tr><td>${esc(c.capability)}</td><td>${c.count}</td><td>${ms(c.meanMs)}</td></tr>`)
    .join('');
  return `<div class="panel" style="margin-bottom:16px">
    <h2>${esc(t('rd.title'))}</h2><p class="sub">${esc(t('rd.sub'))}</p>
    <div class="grid" style="margin-bottom:18px">
      ${stat(t('rd.count'), String(r.count))}
      ${stat(t('rd.mean'), ms(r.meanMs))}
      ${stat(t('rd.p50'), ms(r.p50Ms))}
      ${stat(t('rd.p95'), ms(r.p95Ms))}
    </div>
    ${capRows ? `<div><label>${esc(t('gm.byCapability'))}</label><table><tbody>${capRows}</tbody></table></div>` : ''}
  </div>`;
}

/** Revision funnel — created → revised → completed across the tenant (Sprint 5). */
function revisionFunnelPanel(f: RevisionFunnel): string {
  const stat = (label: string, value: string): string =>
    `<div class="card stat"><div class="n">${esc(value)}</div><div class="l">${esc(label)}</div></div>`;
  return `<div class="panel" style="margin-bottom:16px">
    <h2>${esc(t('rf.title'))}</h2><p class="sub">${esc(t('rf.sub'))}</p>
    <div class="grid">
      ${stat(t('rf.created'), String(f.created))}
      ${stat(t('rf.withRevisions'), String(f.withRevisions))}
      ${stat(t('rf.totalRevisions'), String(f.totalRevisions))}
      ${stat(t('rf.completed'), String(f.completed))}
      ${stat(t('rf.revisionRate'), `${f.revisionRatePct}%`)}
    </div>
  </div>`;
}

/** Stage latency + execution timeline — per-stage mean, in execution order (Sprint 5). */
function stageLatencyPanel(timings: StageTiming[]): string {
  const maxMs = Math.max(1, ...timings.map((s) => s.meanMs));
  const bars = timings
    .map(
      (s) =>
        `<div class="bar"><span>${esc(s.name)}</span><div class="track"><div class="fill" style="width:${Math.round((s.meanMs / maxMs) * 100)}%"></div></div><span class="v">${s.meanMs} ms</span></div>`,
    )
    .join('');
  return `<div class="panel" style="margin-bottom:16px">
    <h2>${esc(t('sl.title'))}</h2><p class="sub">${esc(t('sl.sub'))}</p>
    <div class="bars">${bars}</div>
  </div>`;
}

/** Approval/override funnel — the signal for hard-enforcement (Sprint 5). */
function approvalFunnelPanel(f: ApprovalFunnel): string {
  const stat = (label: string, value: string): string =>
    `<div class="card stat"><div class="n">${esc(value)}</div><div class="l">${esc(label)}</div></div>`;
  return `<div class="panel" style="margin-bottom:16px">
    <h2>${esc(t('gm.funnelTitle'))}</h2><p class="sub">${esc(t('gm.funnelSub'))}</p>
    <div class="grid">
      ${stat(t('gm.approvals'), String(f.approvals))}
      ${stat(t('gm.flagged'), String(f.flagged))}
      ${stat(t('gm.overrides'), String(f.overrides))}
      ${stat(t('gm.overrideRate'), `${f.overrideRatePct}%`)}
    </div>
  </div>`;
}

/** Governance analytics summary — measurement before enforcement (Sprint 5). */
function governanceMetricsPanel(m: GovernanceMetrics): string {
  const stat = (label: string, value: string): string =>
    `<div class="card stat"><div class="n">${esc(value)}</div><div class="l">${esc(label)}</div></div>`;
  const maxBucket = Math.max(1, ...m.confidenceBuckets.map((b) => b.count));
  const bars = m.confidenceBuckets
    .map((b) => `<div class="bar"><span>${esc(b.label)}</span><div class="track"><div class="fill" style="width:${Math.round((b.count / maxBucket) * 100)}%"></div></div><span class="v">${b.count}</span></div>`)
    .join('');
  const capRows = m.byCapability
    .map((c) => `<tr><td>${esc(c.capability)}</td><td>${c.count}</td><td>${c.warnings} ${esc(t('gm.warnings'))}</td></tr>`)
    .join('');
  return `<div class="panel" style="margin-bottom:16px">
    <h2>${esc(t('gm.title'))}</h2><p class="sub">${esc(t('gm.sub'))}</p>
    <div class="grid" style="margin-bottom:18px">
      ${stat(t('gm.evidenceCoverage'), `${m.evidenceCoveragePct}%`)}
      ${stat(t('gm.noEvidence'), `${m.noEvidenceRatePct}%`)}
      ${stat(t('gm.passRate'), `${m.constitutionPassRatePct}%`)}
      ${stat(t('gm.confidenceAvg'), String(m.confidenceAvg))}
      ${stat(t('gm.avgLatency'), `${m.avgLatencyMs} ms`)}
    </div>
    <div class="row">
      <div><label>${esc(t('gm.confidenceDist'))}</label><div class="bars">${bars}</div></div>
      <div><label>${esc(t('gm.byCapability'))}</label><table><tbody>${capRows}</tbody></table></div>
    </div>
  </div>`;
}
