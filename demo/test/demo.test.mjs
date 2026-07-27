// Tests for the AdOS agency demo environment. No external deps (node:test).
// Verifies determinism, internal consistency, and the validation contract for
// the human-approved campaign pipeline (PRODUCT_TRUTH.md §1).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld, checksum } from '../src/seed.mjs';
import { validate } from '../src/validate.mjs';
import { SEED } from '../src/data-model.mjs';

const FIXED = '2026-07-27T00:00:00.000Z';
const world = buildWorld(SEED, FIXED);

test('deterministic: same seed + date → identical checksum', () => {
  const a = buildWorld(SEED, FIXED);
  const b = buildWorld(SEED, FIXED);
  assert.equal(checksum(a), checksum(b));
});

test('validation passes on the seeded world', () => {
  const r = validate(world);
  const failed = r.checks.filter((c) => !c.ok);
  assert.equal(failed.length, 0, 'failing: ' + failed.map((c) => `${c.name} (${c.detail})`).join('; '));
  assert.equal(r.pass, true);
});

test('volumes match the dataset spec', () => {
  assert.equal(world.clients.length, 6);
  assert.equal(world.brands.length, 12);
  assert.equal(world.products.length, 24);
  assert.equal(world.missions.length, 40);
  assert.ok(world.campaign_drafts.length >= 20);
  assert.ok(world.campaign_reports.length >= 15);
  assert.ok(world.approvals.length >= 40);
});

test('referential integrity: every approval approver exists', () => {
  const users = new Set(world.team.map((u) => u.id));
  for (const a of world.approvals) assert.ok(users.has(a.approver_user_id));
});

test('pipeline is contiguous: a report implies brief + creative + draft', () => {
  const has = (arr, mid) => arr.some((x) => x.mission_id === mid);
  for (const m of world.missions) {
    if (has(world.campaign_reports, m.id)) {
      assert.ok(has(world.briefs, m.id), `${m.id} report without brief`);
      assert.ok(has(world.creative_sets, m.id), `${m.id} report without creative`);
      assert.ok(has(world.campaign_drafts, m.id), `${m.id} report without draft`);
    }
  }
});

test('every campaign draft is a draft — never launched', () => {
  for (const d of world.campaign_drafts) assert.equal(d.status, 'draft');
});

test('every reached approval gate has a human approval', () => {
  const has = (arr, mid) => arr.some((x) => x.mission_id === mid);
  for (const m of world.missions) {
    if (has(world.creative_sets, m.id)) {
      assert.ok(world.approvals.some((a) => a.mission_id === m.id && a.gate === 'strategy_and_budget' && a.human));
    }
  }
});

test('ad-KPIs reconcile with raw performance numbers', () => {
  const r2 = (x) => Math.round(x * 100) / 100;
  for (const rp of world.campaign_reports) {
    assert.equal(rp.ctr, r2((rp.clicks / rp.impressions) * 100));
    assert.equal(rp.roas, r2(rp.revenue_try / rp.spend_try));
    assert.equal(rp.roi, r2(((rp.revenue_try - rp.spend_try) / rp.spend_try) * 100));
  }
});

test('Company Brain is a marketing-performance memory (no documents/citations)', () => {
  const cb = world.company_brain;
  assert.ok(cb.company_dna && cb.brand_profiles.length === world.brands.length);
  assert.ok(Array.isArray(cb.pattern_library) && cb.pattern_library.length > 0);
  assert.ok(Array.isArray(cb.experience_engine));
  // knowledge graph edges resolve to nodes
  const nodes = new Set(cb.knowledge_graph.nodes.map((n) => n.id));
  for (const e of cb.knowledge_graph.edges) {
    assert.ok(nodes.has(e.from) && nodes.has(e.to));
  }
});

test('world models no absent capabilities (no citations/RBAC/tiers/immutable)', () => {
  const s = JSON.stringify(world);
  assert.ok(!/"cited_doc_ids"|"citation"|"permission_tier"|"visibility"|"immutable"/i.test(s));
});
