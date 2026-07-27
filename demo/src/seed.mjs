// Deterministic seeder: builds the entire AdOS agency demo world from the
// canonical model + a fixed seed. Same (seed, demoToday) -> identical world.
// No randomness or wall-clock outside the seed and the passed demoToday.
//
// The world mirrors the real product (PRODUCT_TRUTH.md §1): an agency workspace
// runs client advertising objectives through the human-approved pipeline
// (brief → creative → campaign draft → report → executive report). Campaign
// drafts are NEVER launched; there are no document citations, no permission
// tiers, and no immutable audit store — only an activity log.

import { createHash } from 'node:crypto';
import { makeRng, makeHelpers } from './prng.mjs';
import {
  SEED, WORKSPACE, CLIENTS, BRANDS, PRODUCTS, TEAM, CLIENT_APPROVER,
  PIPELINE_STAGES, CHANNELS, OBJECTIVES, COMPANY_DNA, PATTERN_SEEDS,
} from './data-model.mjs';

const GATE_STAGES = PIPELINE_STAGES.filter((s) => s.gate);
const INTERNAL = TEAM.filter((u) => u.kind === 'internal');
const DIRECTOR = TEAM.find((u) => u.role === 'Agency Director');

// Deterministic KPI math (mirrors analytics-engine kpi.ts:39-50). Pure.
function computeKpis({ impressions, clicks, spend, conversions, leads, revenue }) {
  const r2 = (x) => Math.round(x * 100) / 100;
  return {
    ctr: r2((clicks / impressions) * 100),          // %
    cpc: r2(spend / clicks),                          // ₺ per click
    cpa: r2(spend / Math.max(1, conversions)),        // ₺ per conversion
    cpl: r2(spend / Math.max(1, leads)),              // ₺ per lead
    roas: r2(revenue / spend),                        // x
    roi: r2(((revenue - spend) / spend) * 100),       // %
  };
}

export function buildWorld(seed = SEED, demoTodayISO) {
  const rng = makeRng(seed);
  const { int, pick, pickN, bool } = makeHelpers(rng);
  const today = new Date(demoTodayISO ?? '2026-07-27T00:00:00.000Z').getTime();
  const back = (days) => new Date(today - days * 86400000).toISOString();

  const brandsByClient = {};
  for (const b of BRANDS) (brandsByClient[b.client_id] ??= []).push(b);
  const productsByBrand = {};
  for (const p of PRODUCTS) (productsByBrand[p.brand_id] ??= []).push(p);

  // ── Projects (1-2 per brand) ──
  const projects = [];
  for (const b of BRANDS) {
    const n = 1 + (bool(0.5) ? 1 : 0);
    for (let i = 1; i <= n; i++) {
      projects.push({
        id: `prj-${b.id}-${i}`, brand_id: b.id, client_id: b.client_id,
        name: `${b.name} ${['Yıllık Plan', 'Lansman', 'Performans', 'Sezon'][int(0, 3)]}`,
        created_at: back(int(120, 400)),
      });
    }
  }

  // ── Missions: each runs the pipeline to some stage, human-gated ──
  const missions = [];
  const briefs = [];
  const creativeSets = [];
  const campaignDrafts = [];
  const campaignReports = [];
  const executiveReports = [];
  const approvals = [];
  const aiDrafts = [];
  const knowledgeNodes = [];
  const knowledgeEdges = [];
  const experience = [];

  const MISSION_COUNT = 40;
  for (let i = 1; i <= MISSION_COUNT; i++) {
    const project = pick(projects);
    const brand = BRANDS.find((b) => b.id === project.brand_id);
    const product = pick(productsByBrand[brand.id]);
    const objective = pick(OBJECTIVES);
    const created = int(2, 88);
    const mid = `msn-${String(i).padStart(4, '0')}`;

    // How far did this mission advance (0..5)? Bias toward completed so the demo
    // shows full pipelines, but keep some at the frontier awaiting approval.
    const progress = pick([2, 3, 4, 5, 5, 5, 5, 4, 3, 5]); // index into PIPELINE_STAGES (inclusive count)
    const reached = PIPELINE_STAGES.slice(0, progress).map((s) => s.key);
    const closed = progress >= PIPELINE_STAGES.length;
    const clientApprover = CLIENT_APPROVER[brand.client_id];

    const budget = 50000 + int(0, 40) * 12500; // ₺
    const mission = {
      id: mid, workspace_id: WORKSPACE.id, client_id: brand.client_id,
      brand_id: brand.id, product_id: product.id, project_id: project.id,
      objective: `${brand.name}: ${objective}`,
      stage: closed ? 'closed' : PIPELINE_STAGES[progress - 1].key,
      status: closed ? 'closed' : 'in_progress',
      created_at: back(created), budget_try: budget,
    };
    missions.push(mission);

    // Per reached stage: artifact + AI draft event + (if gated) an approval.
    let stageDay = created;
    for (let sIdx = 0; sIdx < reached.length; sIdx++) {
      const stage = PIPELINE_STAGES[sIdx];
      stageDay = Math.max(0, stageDay - int(1, 4));
      const at = back(stageDay);

      // AI-assisted draft event (offline deterministic engine; NO citations).
      aiDrafts.push({
        id: `draft-${mid}-${stage.key}`, mission_id: mid, stage: stage.key,
        engine: 'offline-deterministic', assistant: 'AdOS pipeline',
        outcome: 'drafted', human_reviewed: true, at,
      });

      if (stage.key === 'brief') {
        briefs.push({
          id: `brf-${mid}`, mission_id: mid, objective: mission.objective,
          audience: pick(['18-34 ilgi bazlı', '25-45 satın alma niyeti', 'B2B karar vericiler', 'yerel/şehir bazlı']),
          key_message: 'Marka sesine uygun, insan onaylı ana mesaj', budget_try: budget,
          channels_suggested: pickN(CHANNELS, int(2, 4)), provenance: 'ai-offline', at,
        });
      } else if (stage.key === 'creative') {
        creativeSets.push({
          id: `crv-${mid}`, mission_id: mid, brand_id: brand.id,
          headline: `${product.name} — ${['Şimdi Keşfet', 'Fark Yarat', 'Yeni Sezon', 'Sana Özel'][int(0, 3)]}`,
          ad_copy: 'Marka kurallarına ve yasaklı kelime listesine uygun reklam metni (taslak).',
          cta: pick(['Hemen İncele', 'Teklif Al', 'Alışverişe Başla', 'Randevu Al']),
          social_post: 'Sosyal medya gönderi taslağı.', landing_page: 'Açılış sayfası metni (taslak).',
          email: 'E-posta metni (taslak).', banned_words_respected: true,
          copy_only: true, // creative-set.ts:16-17 — never touches ad platforms
          at,
        });
      } else if (stage.key === 'campaign_draft') {
        const splits = pickN(CHANNELS, int(2, 4));
        const per = Math.floor(budget / splits.length);
        campaignDrafts.push({
          id: `cmp-${mid}`, mission_id: mid, status: 'draft', // NEVER launched (campaign-draft.ts:48-49)
          total_budget_try: budget,
          channels: splits.map((c) => ({ channel: c, budget_try: per, ad_sets: int(2, 5) })),
          at,
        });
      } else if (stage.key === 'report') {
        // Deterministic performance numbers, then derived KPIs.
        const impressions = int(80, 600) * 1000;
        const clicks = Math.round(impressions * (int(60, 240) / 10000)); // 0.6%–2.4% CTR
        const spend = budget;
        const conversions = Math.round(clicks * (int(150, 600) / 10000));
        const leads = conversions + int(10, 80);
        const revenue = Math.round(spend * (int(70, 380) / 100)); // 0.7x–3.8x ROAS
        const kpis = computeKpis({ impressions, clicks, spend, conversions, leads, revenue });
        campaignReports.push({
          id: `rpt-${mid}`, mission_id: mid, impressions, clicks, spend_try: spend,
          conversions, leads, revenue_try: revenue, ...kpis, at,
        });
        // knowledge graph: campaign → ad → lead → roi
        const campNode = `kg-camp-${mid}`; const adNode = `kg-ad-${mid}`;
        const leadNode = `kg-lead-${mid}`; const roiNode = `kg-roi-${mid}`;
        knowledgeNodes.push(
          { id: campNode, type: 'campaign', ref: `cmp-${mid}`, label: mission.objective },
          { id: adNode, type: 'ad', ref: `crv-${mid}`, label: 'creative set' },
          { id: leadNode, type: 'lead', value: leads },
          { id: roiNode, type: 'roi', value: kpis.roi },
        );
        knowledgeEdges.push(
          { from: campNode, to: adNode, rel: 'uses' },
          { from: adNode, to: leadNode, rel: 'generated' },
          { from: leadNode, to: roiNode, rel: 'contributed' },
        );
        experience.push({
          mission_id: mid, brand_id: brand.id, objective, roas: kpis.roas, roi: kpis.roi,
          outcome: kpis.roas >= 1 ? 'positive' : 'negative',
        });
      } else if (stage.key === 'executive') {
        const rpt = campaignReports.find((r) => r.mission_id === mid);
        executiveReports.push({
          id: `exec-${mid}`, mission_id: mid,
          summary: 'Yönetici özeti: kampanya sonuçları ve öneri (tek AI sentez çağrısı).',
          roas: rpt ? rpt.roas : null,
          recommendation: rpt && rpt.roas >= 1.5 ? 'scale' : rpt && rpt.roas >= 1 ? 'iterate' : 'revise',
          at,
        });
      }

      // Human approval at gate stages (approver = client lead, or agency director).
      if (stage.gate) {
        const isFrontier = !closed && sIdx === reached.length - 1;
        const approver = stage.gate === 'campaign_launch' ? clientApprover : pick(INTERNAL).id;
        approvals.push({
          id: `apr-${mid}-${stage.gate}`, mission_id: mid, gate: stage.gate,
          approver_user_id: approver ?? DIRECTOR.id,
          decision: isFrontier && bool(0.3) ? 'pending' : 'approved',
          human: true, at,
        });
      }
    }
  }

  // ── Company Brain: marketing-performance memory (in-memory-company-brain.ts) ──
  const brandProfiles = BRANDS.map((b) => {
    const exps = experience.filter((e) => e.brand_id === b.id);
    const avgRoas = exps.length ? round2(exps.reduce((s, e) => s + e.roas, 0) / exps.length) : null;
    return {
      brand_id: b.id, voice: b.voice, banned_words: b.banned_words,
      top_channel: pick(CHANNELS), campaigns_run: exps.length, avg_roas: avgRoas,
    };
  });
  const marketingInsights = topBrands(experience, brandProfiles).map((bp, i) => ({
    id: `mi-${i + 1}`, brand_id: bp.brand_id, kind: 'marketing',
    detail: `ROAS ${bp.avg_roas ?? 'n/a'}x over ${bp.campaigns_run} campaigns`,
  }));
  const creativeInsights = PATTERN_SEEDS.slice(0, 4).map(([id, pattern, lift], i) => ({
    id: `ci-${i + 1}`, kind: 'creative', detail: `${pattern} (+${lift}% engagement)`,
  }));
  const salesInsights = experience.filter((e) => e.outcome === 'positive').slice(0, 4).map((e, i) => ({
    id: `si-${i + 1}`, kind: 'sales', detail: `${e.objective} → ROI ${e.roi}%`,
  }));
  const sopPerformance = PIPELINE_STAGES.map((s) => {
    const drafts = aiDrafts.filter((d) => d.stage === s.key);
    const gate = approvals.filter((a) => a.gate === s.gate);
    const approved = gate.filter((a) => a.decision === 'approved').length;
    return {
      stage: s.key, artifact: s.artifact, runs: drafts.length,
      approval_rate: gate.length ? round2(approved / gate.length) : null,
    };
  });
  const patternLibrary = PATTERN_SEEDS.map(([id, pattern, lift]) => ({
    id, pattern, avg_lift_pct: lift, uses: experience.length ? int1(rng, 3, 18) : 0,
  }));

  const companyBrain = {
    company_dna: COMPANY_DNA,
    brand_profiles: brandProfiles,
    marketing_insights: marketingInsights,
    creative_insights: creativeInsights,
    sales_insights: salesInsights,
    sop_performance: sopPerformance,
    knowledge_graph: { nodes: knowledgeNodes, edges: knowledgeEdges },
    pattern_library: patternLibrary,
    experience_engine: experience,
  };

  // ── Metrics (computed from records; KPIs reconcile in validate.mjs) ──
  const positive = experience.filter((e) => e.outcome === 'positive').length;
  const avgRoasAll = experience.length
    ? round2(experience.reduce((s, e) => s + e.roas, 0) / experience.length) : 0;
  const metrics = [
    metric('m-clients', 'Clients', 'count', CLIENTS.length),
    metric('m-brands', 'Brands', 'count', BRANDS.length),
    metric('m-products', 'Products', 'count', PRODUCTS.length),
    metric('m-missions', 'Missions', 'count', missions.length),
    metric('m-missions-closed', 'Closed missions', 'count', missions.filter((m) => m.status === 'closed').length),
    metric('m-drafts', 'Campaign drafts', 'count', campaignDrafts.length),
    metric('m-reports', 'Campaign reports', 'count', campaignReports.length),
    metric('m-approvals', 'Human approvals', 'count', approvals.length),
    metric('m-approvals-pending', 'Pending approvals', 'count', approvals.filter((a) => a.decision === 'pending').length),
    metric('m-avg-roas', 'Average ROAS', 'x', avgRoasAll),
    metric('m-roas-positive', 'ROAS-positive campaigns', 'count', positive),
  ];

  // ── History (~1200 change records) ──
  const history = [];
  for (let i = 0; i < 1200; i++) {
    history.push({
      entity_type: pick(['mission', 'campaign_draft', 'creative_set', 'approval']),
      entity_id: pick(missions).id, field: 'stage', old: 'a', new: 'b',
      at: back(int(1, 90)), actor_user_id: pick(INTERNAL).id,
    });
  }

  // ── Activity log (consequential actions). NOT an immutable audit trail —
  //    just an ordered, tenant-scoped log (app.ts:66-67). ──
  const activity = [];
  const addLog = (action, object_type, object_id, actor, at) => activity.push({
    id: `log-${String(activity.length + 1).padStart(5, '0')}`, at, actor_user_id: actor,
    action, object_type, object_id, workspace_id: WORKSPACE.id, result: 'ok',
  });
  for (const d of aiDrafts) addLog('pipeline.' + d.stage + '.drafted', 'mission', d.mission_id, DIRECTOR.id, d.at);
  for (const a of approvals) addLog('approval.' + a.decision, 'approval', a.id, a.approver_user_id, a.at);
  for (const m of missions) addLog('mission.created', 'mission', m.id, pick(INTERNAL).id, m.created_at);

  const generated_records = CLIENTS.length + BRANDS.length + PRODUCTS.length + TEAM.length +
    projects.length + missions.length + briefs.length + creativeSets.length +
    campaignDrafts.length + campaignReports.length + executiveReports.length +
    approvals.length + aiDrafts.length + history.length + activity.length;

  return {
    meta: { seed, demo_today: new Date(today).toISOString(), generated_records },
    workspace: WORKSPACE, clients: CLIENTS, brands: BRANDS, products: PRODUCTS,
    team: TEAM, projects, missions,
    briefs, creative_sets: creativeSets, campaign_drafts: campaignDrafts,
    campaign_reports: campaignReports, executive_reports: executiveReports,
    approvals, ai_drafts: aiDrafts, pipeline_stages: PIPELINE_STAGES,
    company_brain: companyBrain, metrics, history, activity_log: activity,
  };
}

// ── helpers ──
function metric(id, name, unit, value) { return { id, name, unit, value }; }
function round2(x) { return Math.round(x * 100) / 100; }
function int1(rng, min, max) { return min + Math.floor(rng() * (max - min + 1)); }
function topBrands(experience, brandProfiles) {
  return [...brandProfiles].filter((b) => b.avg_roas != null)
    .sort((a, b) => b.avg_roas - a.avg_roas).slice(0, 5);
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
