// Validator — enforces DEMO_DATASET_SPEC.md §16. Returns a report; the CLI loads
// demo/data/world.json and prints PASS/FAIL. A demo is only "ready" on PASS.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildWorld, checksum, canSee } from './seed.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', 'data', 'world.json');

export function validate(w) {
  const checks = [];
  const ok = (name, cond, detail = '') => checks.push({ name, ok: !!cond, detail });

  const empSet = new Set(w.employees.map((e) => e.id));
  const deptSet = new Set(w.departments.map((d) => d.id));
  const siteSet = new Set(w.sites.map((s) => s.id));
  const docSet = new Set(w.documents.map((d) => d.id));
  const wfDefSet = new Set(w.workflow_defs.map((d) => d.id));
  const wfItemSet = new Set(w.workflow_items.map((i) => i.id));
  const docById = Object.fromEntries(w.documents.map((d) => [d.id, d]));
  const empById = Object.fromEntries(w.employees.map((e) => [e.id, e]));

  // 1. Referential integrity
  let refOk = true; let refDetail = '';
  const need = (cond, msg) => { if (!cond && refOk) { refOk = false; refDetail = msg; } };
  for (const e of w.employees) {
    need(deptSet.has(e.department_id), `emp ${e.id} dept`);
    need(siteSet.has(e.site_id), `emp ${e.id} site`);
    need(e.manager_id === null || empSet.has(e.manager_id), `emp ${e.id} manager`);
  }
  for (const a of w.assets) { need(siteSet.has(a.site_id), `asset ${a.id} site`); need(docSet.has(a.manual_doc_id), `asset ${a.id} manual`); }
  for (const ed of w.doc_edges) { need(docSet.has(ed.from_doc_id) && docSet.has(ed.to_doc_id), 'doc edge'); }
  for (const i of w.workflow_items) { need(wfDefSet.has(i.wf_def_id), `wf ${i.id} def`); need(empSet.has(i.initiator_emp_id), `wf ${i.id} initiator`); for (const d of i.linked_docs) need(docSet.has(d), `wf ${i.id} doc`); }
  for (const s of w.workflow_steps) { need(wfItemSet.has(s.wf_item_id), 'step item'); need(empSet.has(s.actor_emp_id), 'step actor'); }
  for (const a of w.approvals) { need(wfItemSet.has(a.wf_item_id), 'apr item'); need(empSet.has(a.approver_emp_id), 'apr approver'); }
  for (const t of w.tickets) { need(empSet.has(t.requester_emp_id), 'tkt req'); need(empSet.has(t.assignee_emp_id), 'tkt asg'); }
  for (const t of w.tasks) { need(empSet.has(t.owner_emp_id), 'task owner'); need(deptSet.has(t.department_id), 'task dept'); }
  for (const m of w.meetings) { need(docSet.has(m.minutes_doc_id), 'mtg doc'); for (const a of m.attendee_emp_ids) need(empSet.has(a), 'mtg attendee'); }
  for (const c of w.ai_conversations) { need(empSet.has(c.user_emp_id), 'convo user'); need(c.escalated_to_emp_id === null || empSet.has(c.escalated_to_emp_id), 'convo esc'); }
  for (const a of w.audit) { need(empSet.has(a.actor_emp_id), 'audit actor'); }
  ok('Referential integrity', refOk, refDetail);

  // 2. Authority
  const authBad = w.approvals.filter((a) => a.amount != null && a.amount > a.limit_applied && !a.escalated);
  ok('Approval authority (KB-POL-004)', authBad.length === 0, authBad.length ? `${authBad.length} over-limit` : '');

  // 3 & 5. Citations exist + visible
  let citeBad = 0;
  for (const c of w.ai_conversations) for (const id of c.cited_doc_ids) {
    const d = docById[id]; if (!d || !canSee(empById[c.user_emp_id], d)) citeBad++;
  }
  ok('AI citations exist + permission-visible', citeBad === 0, citeBad ? `${citeBad} bad citations` : '');

  // 4. KPI reconciliation
  const recompute = {
    'm-users-active': w.employees.filter((e) => e.active).length,
    'm-docs-total': w.documents.length,
    'm-wf-open': w.workflow_items.filter((x) => ['open', 'pending'].includes(x.status)).length,
    'm-wf-closed': w.workflow_items.filter((x) => ['approved', 'rejected', 'closed'].includes(x.status)).length,
    'm-approvals': w.approvals.length,
    'm-tickets-open': w.tickets.filter((t) => ['open', 'in_progress'].includes(t.status)).length,
    'm-convos': w.ai_conversations.length,
  };
  const kpiBad = w.metrics.filter((m) => m.id in recompute && m.value !== recompute[m.id]);
  ok('KPI reconciliation', kpiBad.length === 0, kpiBad.length ? kpiBad.map((m) => m.id).join(',') : '');

  // 6. Temporal (activity records within [today-90d, today])
  const today = new Date(w.meta.demo_today).getTime();
  const lo = today - 91 * 86400000;
  const inWindow = (iso) => { const t = new Date(iso).getTime(); return t >= lo && t <= today + 86400000; };
  let tempBad = 0;
  for (const i of w.workflow_items) if (!inWindow(i.created_at)) tempBad++;
  for (const s of w.workflow_steps) if (!inWindow(s.at)) tempBad++;
  for (const a of w.approvals) if (!inWindow(a.at)) tempBad++;
  for (const c of w.ai_conversations) if (!inWindow(c.at)) tempBad++;
  for (const a of w.audit) if (!inWindow(a.at)) tempBad++;
  ok('Temporal window (activity ≤ 90d)', tempBad === 0, tempBad ? `${tempBad} out of window` : '');

  // 7. Determinism (rebuild from meta → same checksum)
  const rebuilt = buildWorld(w.meta.seed, w.meta.demo_today);
  ok('Determinism (rebuild checksum)', checksum(rebuilt) === checksum(w), '');

  // 8. Audit completeness
  const auditObj = new Set(w.audit.map((a) => a.object_id));
  const aprCovered = w.approvals.every((a) => auditObj.has(a.id));
  const convoCovered = w.ai_conversations.every((c) => auditObj.has(c.id));
  const wfCovered = w.workflow_items.every((i) => auditObj.has(i.id));
  ok('Audit completeness', aprCovered && convoCovered && wfCovered, '');

  // 9. Volumes
  const volumes = w.employees.length === 42 && w.departments.length === 16 && w.sites.length === 6 &&
    w.workflow_defs.length === 25 && w.agents.length === 12 && w.workflow_items.length === 180 &&
    w.ai_conversations.length === 80 && w.documents.length >= 100 && w.documents.length <= 140 &&
    w.audit.length >= 3000 && w.history.length >= 1500;
  ok('Volumes match spec', volumes, `emp=${w.employees.length} docs=${w.documents.length} wf=${w.workflow_items.length} audit=${w.audit.length}`);

  const pass = checks.every((c) => c.ok);
  return { pass, checks, checksum: checksum(w), counts: countOf(w) };
}

function countOf(w) {
  return {
    employees: w.employees.length, documents: w.documents.length, workflow_items: w.workflow_items.length,
    approvals: w.approvals.length, tickets: w.tickets.length, tasks: w.tasks.length,
    ai_conversations: w.ai_conversations.length, audit: w.audit.length, history: w.history.length,
  };
}

async function main() {
  const w = JSON.parse(await readFile(DATA, 'utf8'));
  const r = validate(w);
  for (const c of r.checks) console.log(`  ${c.ok ? '✓' : '✗'} ${c.name}${c.detail ? ' — ' + c.detail : ''}`);
  console.log(`\n${r.pass ? 'PASS' : 'FAIL'} — checksum ${r.checksum.slice(0, 12)} — ${JSON.stringify(r.counts)}`);
  if (!r.pass) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
