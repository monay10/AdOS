// Deterministic seeder: builds the entire NovaMak demo world from the canonical
// model + a fixed seed. Same (seed, demoToday) -> identical world. No randomness
// or wall-clock outside the seed and the passed demoToday.

import { createHash } from 'node:crypto';
import { makeRng, makeHelpers } from './prng.mjs';
import {
  SEED, SITES, UNITS, DEPARTMENTS, EMPLOYEES, AGENTS, WORKFLOWS, DOC_CATEGORIES, APPROVAL_LIMITS,
} from './data-model.mjs';

const PLANTS = SITES.filter((s) => s.type === 'plant').map((s) => s.id);
const TIER_FOR_AMOUNT = (amt) => (amt <= 100000 ? 'T2' : amt <= 500000 ? 'T1' : 'T0');

export function canSee(user, doc) {
  const v = doc.visibility;
  if (v === 'company') return true;
  if (v.startsWith('dep:')) {
    const dep = v.slice(4);
    return user.department_id === dep || user.permission_tier === 'T0' || user.permission_tier === 'T1';
  }
  if (v.startsWith('restricted:')) {
    const g = v.slice(11);
    const t = user.permission_tier;
    if (g === 'executives') return t === 'T0' || t === 'T1';
    if (g === 'security') return user.department_id === 'dep-sec' || user.department_id === 'dep-it';
    if (g === 'hse') return user.department_id === 'dep-hse' || t === 'T0' || t === 'T1';
    if (g === 'procurement') return user.department_id === 'dep-proc' || user.department_id === 'dep-fin' || t === 'T0' || t === 'T1';
    return false;
  }
  return false;
}

export function buildWorld(seed = SEED, demoTodayISO) {
  const rng = makeRng(seed);
  const { int, pick, pickN, bool } = makeHelpers(rng);
  const today = new Date(demoTodayISO ?? '2026-07-26T00:00:00.000Z').getTime();
  const back = (days) => new Date(today - days * 86400000).toISOString();

  // ── Employees with manager links ──
  const gm = EMPLOYEES[0];
  const deptHead = {};
  for (const e of EMPLOYEES) {
    if (!deptHead[e.department_id] && (e.permission_tier === 'T1' || e.permission_tier === 'T2')) {
      deptHead[e.department_id] = e.id;
    }
  }
  const employees = EMPLOYEES.map((e) => ({
    ...e, hired_on: back(int(200, 3000)),
    manager_id: e.id === gm.id ? null : (['T1'].includes(e.permission_tier) ? gm.id : (deptHead[e.department_id] ?? gm.id)),
  }));
  const empIds = employees.map((e) => e.id);
  const byId = Object.fromEntries(employees.map((e) => [e.id, e]));

  // ── Documents ──
  const documents = [];
  for (const [code, label, count, vis, group] of DOC_CATEGORIES) {
    for (let i = 1; i <= count; i++) {
      const visibility = vis === 'company' ? 'company' : vis === 'dep' ? `dep:${group}` : `restricted:${group}`;
      documents.push({
        id: `KB-${code}-${String(i).padStart(3, '0')}`,
        title_en: `${label} document ${i}`,
        title_tr: `${label} belgesi ${i}`,
        category: label, type: typeFor(code), owner: group ?? 'company',
        visibility, version: `v1.${int(0, 4)}`, status: 'approved',
        effective: back(int(90, 900)), review_due: back(-int(30, 400)),
        language: bool(0.5) ? 'tr+en' : 'tr', tags: tagsFor(code), related: [],
      });
    }
  }
  const docIds = documents.map((d) => d.id);
  const docById = Object.fromEntries(documents.map((d) => [d.id, d]));
  const manuals = documents.filter((d) => d.id.startsWith('KB-MAN'));
  const mtgDocs = documents.filter((d) => d.id.startsWith('KB-MTG'));

  // ── Document relationship edges (~200) ──
  const docEdges = [];
  const seenEdge = new Set();
  while (docEdges.length < 200) {
    const a = pick(docIds); const b = pick(docIds);
    if (a === b) continue;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seenEdge.has(key)) continue;
    seenEdge.add(key);
    docEdges.push({ from_doc_id: a, to_doc_id: b, relation: pick(['references', 'evidence-for', 'form-of', 'part-of']) });
    docById[a].related.push(b);
  }

  // ── Assets (40) ──
  const assets = [];
  for (let i = 1; i <= 40; i++) {
    assets.push({
      id: `asset-${String(i).padStart(3, '0')}`,
      name: `${pick(['HMC-500 Machining Center', 'Robotic Welding Cell', 'CNC Lathe', 'Overhead Crane', 'Air Compressor', 'PLC Automation Line'])} #${i}`,
      type: pick(['machining', 'welding', 'automation', 'crane', 'utility']),
      site_id: pick(PLANTS), criticality: pick(['high', 'medium', 'low']),
      manual_doc_id: pick(manuals).id, install_date: back(int(400, 3000)), status: pick(['running', 'running', 'running', 'maintenance']),
    });
  }

  // ── Workflow instances (~180) + steps ──
  const wfItems = [];
  const wfSteps = [];
  const approvals = [];
  const financialWf = new Set(['wf-01', 'wf-03', 'wf-12', 'wf-13']);
  for (let i = 1; i <= 180; i++) {
    const def = pick(WORKFLOWS);
    const status = pick(['open', 'pending', 'approved', 'approved', 'closed', 'closed', 'rejected']);
    const initiator = pick(employees);
    const created = int(1, 88);
    const id = `wf-item-${String(i).padStart(4, '0')}`;
    const terminal = ['approved', 'rejected', 'closed'].includes(status);
    const item = {
      id, wf_def_id: def.id, initiator_emp_id: initiator.id, status,
      created_at: back(created), sla_due: back(created - def.sla_days),
      closed_at: terminal ? back(Math.max(0, created - int(0, def.sla_days))) : null,
      linked_docs: bool(0.5) ? [pick(docIds)] : [], current_step: 1,
    };
    wfItems.push(item);
    // steps
    const nSteps = int(2, 4);
    for (let s = 1; s <= nSteps; s++) {
      wfSteps.push({
        wf_item_id: id, seq: s, actor_emp_id: pick(empIds),
        action: s === 1 ? 'created' : s === nSteps ? (terminal ? status : 'review') : 'review',
        note: '', at: back(Math.max(0, created - (s - 1))),
      });
    }
    // approval (for items that reached a decision)
    if (['approved', 'rejected', 'pending'].includes(status)) {
      const amount = financialWf.has(def.id) ? int(1000, 450000) : null;
      const tier = amount == null ? 'T2' : TIER_FOR_AMOUNT(amount);
      const approver = pick(employees.filter((e) => rank(e.permission_tier) >= rank(tier))) ?? gm;
      approvals.push({
        id: `apr-${String(approvals.length + 1).padStart(4, '0')}`, wf_item_id: id,
        approver_emp_id: approver.id, level: approver.permission_tier,
        limit_applied: APPROVAL_LIMITS[approver.permission_tier], amount,
        escalated: amount != null && amount > APPROVAL_LIMITS.T2,
        decision: status === 'pending' ? 'pending' : status, at: back(created - 1),
        assistant_check: def.assistant_id,
      });
    }
  }

  // ── Tickets (60) ──
  const tickets = [];
  const itUsers = employees.filter((e) => e.department_id === 'dep-it').map((e) => e.id);
  const supUsers = employees.filter((e) => e.department_id === 'dep-sup').map((e) => e.id);
  for (let i = 1; i <= 60; i++) {
    const type = pick(['it', 'it', 'support', 'complaint']);
    const created = int(1, 60);
    const status = pick(['open', 'in_progress', 'resolved', 'resolved', 'closed']);
    tickets.push({
      id: `tkt-${String(i).padStart(4, '0')}`, type,
      requester_emp_id: pick(empIds), assignee_emp_id: pick(type === 'support' || type === 'complaint' ? supUsers : itUsers),
      priority: pick(['low', 'medium', 'high']), status,
      created_at: back(created), resolved_at: ['resolved', 'closed'].includes(status) ? back(Math.max(0, created - int(0, 5))) : null,
    });
  }

  // ── Tasks (150) ──
  const tasks = [];
  for (let i = 1; i <= 150; i++) {
    const owner = pick(employees);
    tasks.push({
      id: `task-${String(i).padStart(4, '0')}`, title: `Task ${i}`, owner_emp_id: owner.id,
      department_id: owner.department_id, type: pick(['review', 'action', 'followup']),
      status: pick(['todo', 'doing', 'done', 'done']), due: back(-int(1, 20)),
    });
  }

  // ── Meetings (20) ──
  const meetings = [];
  for (let i = 1; i <= 20; i++) {
    meetings.push({
      id: `mtg-${String(i).padStart(3, '0')}`, title: `Meeting ${i}`,
      type: pick(['management-review', 'planning', 'quality-council', 'safety']),
      date: back(int(1, 80)), attendee_emp_ids: pickN(empIds, int(3, 8)),
      minutes_doc_id: pick(mtgDocs).id, visibility: pick(['dep', 'restricted']),
    });
  }

  // ── AI conversations (80), citations respect visibility ──
  const convos = [];
  const scripted = [
    ['emp-09', 'agent-maintenance', 'HMC-500 spindle overheat — ne yapmalıyım?', 'KB-MNT-001'],
    ['emp-11', 'agent-quality', 'Batch 5583 uygunsuzluğu için CAPA nedir?', 'KB-QUA-001'],
    ['emp-03', 'agent-finance', '40.000 TL satın almayı onaylayabilir miyim?', 'KB-POL-001'],
    ['emp-16', 'agent-hr', 'Yıllık izin hakkım ve başvuru?', 'KB-HR-001'],
    ['emp-36', 'agent-knowledge', 'Yeni kampanya için brief üret.', 'KB-PRD-001'],
  ];
  for (let i = 0; i < 80; i++) {
    let user, agent, q, citeId;
    if (i < scripted.length) {
      [user, agent, q, citeId] = [byId[scripted[i][0]], scripted[i][1], scripted[i][2], scripted[i][3]];
    } else {
      user = pick(employees); agent = pick(AGENTS).id; q = `Question ${i}`;
      citeId = null;
    }
    // pick citations the user can see
    const visible = documents.filter((d) => canSee(user, d));
    const cites = citeId && docById[citeId] && canSee(user, docById[citeId])
      ? [citeId, ...pickN(visible.map((d) => d.id), 1)]
      : pickN(visible.map((d) => d.id), int(1, 2));
    const escalated = bool(0.25);
    convos.push({
      id: `convo-${String(i + 1).padStart(4, '0')}`, assistant_id: agent, user_emp_id: user.id,
      locale: user.locale, message: q, cited_doc_ids: cites,
      escalated_to_emp_id: escalated ? deptHead[user.department_id] ?? gm.id : null,
      outcome: escalated ? 'escalated' : 'answered', at: back(int(1, 60)),
    });
  }

  // ── Metrics (computed from records) ──
  const metrics = [
    metric('m-users-active', 'Active users', 'count', employees.filter((e) => e.active).length),
    metric('m-docs-total', 'Documents', 'count', documents.length),
    metric('m-wf-open', 'Open workflows', 'count', wfItems.filter((w) => ['open', 'pending'].includes(w.status)).length),
    metric('m-wf-closed', 'Closed workflows', 'count', wfItems.filter((w) => ['approved', 'rejected', 'closed'].includes(w.status)).length),
    metric('m-approvals', 'Approvals', 'count', approvals.length),
    metric('m-tickets-open', 'Open tickets', 'count', tickets.filter((t) => ['open', 'in_progress'].includes(t.status)).length),
    metric('m-convos', 'AI conversations', 'count', convos.length),
    metric('m-escalation-rate', 'AI escalation rate', 'pct', pct(convos.filter((c) => c.outcome === 'escalated').length, convos.length)),
  ];

  // ── History (~1500) ──
  const history = [];
  for (let i = 0; i < 1500; i++) {
    history.push({
      entity_type: pick(['wf_item', 'doc', 'ticket', 'task']), entity_id: pick(['x']),
      field: 'status', old: 'a', new: 'b', at: back(int(1, 90)), actor_emp_id: pick(empIds),
    });
  }

  // ── Audit (~3000): every state-changing action + view filler ──
  const audit = [];
  const addAudit = (action, object_type, object_id, actor, at) => audit.push({
    id: `aud-${String(audit.length + 1).padStart(5, '0')}`, at, actor_emp_id: actor,
    action, object_type, object_id, tenant_id: 'novamak', result: 'ok', visibility: 'security',
  });
  for (const s of wfSteps) addAudit('workflow.' + s.action, 'wf_item', s.wf_item_id, s.actor_emp_id, s.at);
  for (const a of approvals) addAudit('approval.' + a.decision, 'approval', a.id, a.approver_emp_id, a.at);
  for (const c of convos) addAudit('ai.conversation', 'convo', c.id, c.user_emp_id, c.at);
  while (audit.length < 3000) {
    addAudit('document.view', 'doc', pick(docIds), pick(empIds), back(int(1, 90)));
  }

  const generated_records = employees.length + documents.length + wfItems.length + wfSteps.length +
    approvals.length + tickets.length + tasks.length + meetings.length + convos.length +
    history.length + audit.length;
  return {
    meta: { seed, demo_today: new Date(today).toISOString(), generated_records },
    sites: SITES, units: UNITS, departments: DEPARTMENTS,
    employees, assets, documents, doc_edges: docEdges,
    workflow_defs: WORKFLOWS, workflow_items: wfItems, workflow_steps: wfSteps,
    approvals, tickets, tasks, meetings, agents: AGENTS, ai_conversations: convos,
    metrics, history, audit,
  };
}

function rank(t) { return { T4: 0, T3: 1, T2: 2, T1: 3, T0: 4 }[t]; }
function metric(id, name, unit, value) { return { id, name, unit, value }; }
function pct(a, b) { return b ? Math.round((a / b) * 1000) / 10 : 0; }
function typeFor(code) {
  return { POL: 'policy', PRC: 'procedure', MAN: 'manual', WI: 'work-instruction', ORG: 'reference',
    FRM: 'form', STD: 'standard', MTG: 'note', INC: 'record', MNT: 'manual', PUR: 'procedure',
    HR: 'policy', IT: 'policy', SEC: 'policy', QUA: 'procedure', PRD: 'procedure', ENV: 'procedure', EMG: 'procedure' }[code];
}
function tagsFor(code) {
  return { POL: ['policy'], PRC: ['procedure'], MAN: ['manual'], WI: ['work-instruction'], ORG: ['org'],
    FRM: ['form'], STD: ['standard'], MTG: ['management'], INC: ['incident'], MNT: ['maintenance'],
    PUR: ['procurement'], HR: ['hr'], IT: ['it'], SEC: ['security'], QUA: ['quality'], PRD: ['production'],
    ENV: ['environment'], EMG: ['emergency'] }[code];
}

// Stable, deterministic checksum of the world (sorted keys).
export function checksum(world) {
  return createHash('sha256').update(stable(world)).digest('hex');
}
function stable(v) {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}
