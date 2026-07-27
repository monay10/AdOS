// Validator for the AdOS agency demo world. Returns a report; the CLI loads
// demo/data/world.json and prints PASS/FAIL. A demo is only "ready" on PASS.
//
// The checks enforce PRODUCT_TRUTH.md: the pipeline is ordered and human-gated,
// campaign drafts are never launched, KPIs reconcile from raw numbers, and the
// world contains NO citations, NO permission tiers, and NO immutable-audit claim.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildWorld, checksum } from './seed.mjs';
import { PIPELINE_STAGES } from './data-model.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', 'data', 'world.json');
const STAGE_ORDER = PIPELINE_STAGES.map((s) => s.key);
const r2 = (x) => Math.round(x * 100) / 100;

export function validate(w) {
  const checks = [];
  const ok = (name, cond, detail = '') => checks.push({ name, ok: !!cond, detail });

  const clientSet = new Set(w.clients.map((c) => c.id));
  const brandSet = new Set(w.brands.map((b) => b.id));
  const productSet = new Set(w.products.map((p) => p.id));
  const projectSet = new Set(w.projects.map((p) => p.id));
  const missionSet = new Set(w.missions.map((m) => m.id));
  const userSet = new Set(w.team.map((u) => u.id));
  const missionById = Object.fromEntries(w.missions.map((m) => [m.id, m]));

  // 1. Referential integrity
  let refOk = true; let refDetail = '';
  const need = (cond, msg) => { if (!cond && refOk) { refOk = false; refDetail = msg; } };
  for (const b of w.brands) need(clientSet.has(b.client_id), `brand ${b.id} client`);
  for (const p of w.products) need(brandSet.has(p.brand_id), `product ${p.id} brand`);
  for (const p of w.projects) { need(brandSet.has(p.brand_id), `project ${p.id} brand`); need(clientSet.has(p.client_id), `project ${p.id} client`); }
  for (const m of w.missions) {
    need(clientSet.has(m.client_id), `mission ${m.id} client`);
    need(brandSet.has(m.brand_id), `mission ${m.id} brand`);
    need(productSet.has(m.product_id), `mission ${m.id} product`);
    need(projectSet.has(m.project_id), `mission ${m.id} project`);
  }
  const linkArtifacts = [w.briefs, w.creative_sets, w.campaign_drafts, w.campaign_reports, w.executive_reports, w.approvals, w.ai_drafts];
  for (const arr of linkArtifacts) for (const a of arr) need(missionSet.has(a.mission_id), `artifact ${a.id} mission`);
  for (const a of w.approvals) need(userSet.has(a.approver_user_id), `approval ${a.id} approver`);
  ok('Referential integrity', refOk, refDetail);

  // 2. Pipeline order — artifacts exist only for a contiguous prefix of stages
  const has = (arr, mid) => arr.some((x) => x.mission_id === mid);
  let orderBad = 0;
  for (const m of w.missions) {
    const present = [
      has(w.briefs, m.id), has(w.creative_sets, m.id), has(w.campaign_drafts, m.id),
      has(w.campaign_reports, m.id), has(w.executive_reports, m.id),
    ];
    // must be a prefix of trues: once false, all later false
    let seenFalse = false;
    for (const p of present) { if (!p) seenFalse = true; else if (seenFalse) orderBad++; }
  }
  ok('Pipeline order (contiguous, brief→executive)', orderBad === 0, orderBad ? `${orderBad} out-of-order` : '');

  // 3. Human approval gates — every gate stage reached has a human approval
  let gateBad = 0;
  for (const m of w.missions) {
    if (has(w.creative_sets, m.id) && !w.approvals.some((a) => a.mission_id === m.id && a.gate === 'strategy_and_budget')) gateBad++;
    if (has(w.campaign_drafts, m.id) && !w.approvals.some((a) => a.mission_id === m.id && a.gate === 'creative_assets')) gateBad++;
  }
  const allHuman = w.approvals.every((a) => a.human === true);
  ok('Human approval at every reached gate', gateBad === 0 && allHuman, gateBad ? `${gateBad} missing gate` : (allHuman ? '' : 'non-human approval'));

  // 4. Drafts are NEVER launched (campaign-draft.ts:48-49)
  const launched = w.campaign_drafts.filter((d) => d.status !== 'draft');
  ok('Campaign drafts never launched (status=draft)', launched.length === 0, launched.length ? `${launched.length} launched` : '');

  // 5. KPI reconciliation — every report's KPIs recompute from raw numbers
  const kpiBad = [];
  for (const rp of w.campaign_reports) {
    const exp = {
      ctr: r2((rp.clicks / rp.impressions) * 100),
      cpc: r2(rp.spend_try / rp.clicks),
      cpa: r2(rp.spend_try / Math.max(1, rp.conversions)),
      cpl: r2(rp.spend_try / Math.max(1, rp.leads)),
      roas: r2(rp.revenue_try / rp.spend_try),
      roi: r2(((rp.revenue_try - rp.spend_try) / rp.spend_try) * 100),
    };
    for (const k of Object.keys(exp)) if (rp[k] !== exp[k]) kpiBad.push(`${rp.id}.${k}`);
  }
  ok('Ad-KPI reconciliation (CTR/CPC/CPA/CPL/ROAS/ROI)', kpiBad.length === 0, kpiBad.slice(0, 3).join(','));

  // 6. Company Brain integrity
  const cb = w.company_brain;
  const nodeSet = new Set(cb.knowledge_graph.nodes.map((n) => n.id));
  const kgOk = cb.knowledge_graph.edges.every((e) => nodeSet.has(e.from) && nodeSet.has(e.to));
  const profilesCoverBrands = cb.brand_profiles.length === w.brands.length;
  const expOk = cb.experience_engine.every((e) => missionSet.has(e.mission_id));
  ok('Company Brain integrity (graph + profiles + experience)', kgOk && profilesCoverBrands && expOk, '');

  // 7. Temporal window (activity within [today-91d, today])
  const today = new Date(w.meta.demo_today).getTime();
  const lo = today - 91 * 86400000;
  const inWindow = (iso) => { const t = new Date(iso).getTime(); return t >= lo && t <= today + 86400000; };
  let tempBad = 0;
  for (const m of w.missions) if (!inWindow(m.created_at)) tempBad++;
  for (const a of w.approvals) if (!inWindow(a.at)) tempBad++;
  for (const d of w.ai_drafts) if (!inWindow(d.at)) tempBad++;
  for (const l of w.activity_log) if (!inWindow(l.at)) tempBad++;
  ok('Temporal window (activity ≤ 90d)', tempBad === 0, tempBad ? `${tempBad} out of window` : '');

  // 8. Determinism (rebuild from meta → same checksum)
  const rebuilt = buildWorld(w.meta.seed, w.meta.demo_today);
  ok('Determinism (rebuild checksum)', checksum(rebuilt) === checksum(w), '');

  // 9. Activity-log completeness (every approval + mission is logged)
  const logObj = new Set(w.activity_log.map((l) => l.object_id));
  const aprCovered = w.approvals.every((a) => logObj.has(a.id));
  const msnCovered = w.missions.every((m) => logObj.has(m.id));
  ok('Activity-log completeness', aprCovered && msnCovered, '');

  // 10. PRODUCT-TRUTH guardrail — the world must NOT model absent capabilities
  const s = JSON.stringify(w);
  const forbiddenKeys = /"cited_doc_ids"|"citation"|"permission_tier"|"visibility"|"rbac"|"immutable"/i;
  const noForbidden = !forbiddenKeys.test(s);
  ok('No absent-capability data (citations/RBAC/tiers/immutable)', noForbidden, noForbidden ? '' : 'forbidden key present');

  // 11. Volumes match spec
  const volumes = w.clients.length === 6 && w.brands.length === 12 && w.products.length === 24 &&
    w.missions.length === 40 && w.campaign_drafts.length >= 20 && w.campaign_reports.length >= 15 &&
    w.approvals.length >= 40 && w.activity_log.length >= 100;
  ok('Volumes match spec', volumes,
    `clients=${w.clients.length} brands=${w.brands.length} missions=${w.missions.length} drafts=${w.campaign_drafts.length} reports=${w.campaign_reports.length}`);

  const pass = checks.every((c) => c.ok);
  return { pass, checks, checksum: checksum(w), counts: countOf(w) };
}

function countOf(w) {
  return {
    clients: w.clients.length, brands: w.brands.length, products: w.products.length,
    missions: w.missions.length, campaign_drafts: w.campaign_drafts.length,
    campaign_reports: w.campaign_reports.length, approvals: w.approvals.length,
    activity_log: w.activity_log.length,
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
