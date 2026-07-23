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
    ? `<div class="ok">🎉 Onboarding complete — your first Mission is in the system.</div>`
    : `<a class="btn" href="${opts.next.href}">${esc(opts.next.label)} →</a>`;

  return layout({
    title: 'Dashboard',
    active: '/dashboard',
    session: opts.session,
    body: `<div class="head"><div><h1>Dashboard</h1><p>Welcome, ${esc(opts.session.actor)}.</p></div>${cta}</div>
      <div class="grid" style="margin-bottom:26px">
        ${stat(s.workspaces, 'Workspaces')}${stat(s.clients, 'Clients')}${stat(s.brands, 'Brands')}
        ${stat(s.products, 'Products')}${stat(s.missions, 'Missions')}
      </div>
      <div class="panel"><h2>Activity feed</h2><p class="sub">Domain events emitted by the system, newest first.</p>${feed}</div>`,
  });
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
