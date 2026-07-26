// Tests for the AdOS demo environment. No external deps (node:test).
// Verifies determinism, internal consistency, and the validation contract.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld, checksum, canSee } from '../src/seed.mjs';
import { validate } from '../src/validate.mjs';
import { SEED } from '../src/data-model.mjs';

const FIXED = '2026-07-26T00:00:00.000Z';
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
  assert.equal(world.employees.length, 42);
  assert.equal(world.departments.length, 16);
  assert.equal(world.sites.length, 6);
  assert.equal(world.workflow_defs.length, 25);
  assert.equal(world.agents.length, 12);
  assert.equal(world.workflow_items.length, 180);
  assert.equal(world.ai_conversations.length, 80);
  assert.ok(world.documents.length >= 100 && world.documents.length <= 140);
  assert.ok(world.audit.length >= 3000);
  assert.ok(world.history.length >= 1500);
});

test('referential integrity: every workflow actor exists', () => {
  const emp = new Set(world.employees.map((e) => e.id));
  for (const s of world.workflow_steps) assert.ok(emp.has(s.actor_emp_id));
  for (const a of world.approvals) assert.ok(emp.has(a.approver_emp_id));
});

test('every AI citation resolves and is permission-visible', () => {
  const docById = Object.fromEntries(world.documents.map((d) => [d.id, d]));
  const empById = Object.fromEntries(world.employees.map((e) => [e.id, e]));
  for (const c of world.ai_conversations) {
    for (const id of c.cited_doc_ids) {
      const d = docById[id];
      assert.ok(d, `citation ${id} missing`);
      assert.ok(canSee(empById[c.user_emp_id], d), `citation ${id} not visible to ${c.user_emp_id}`);
    }
  }
});

test('approval authority respects tier limits', () => {
  for (const a of world.approvals) {
    if (a.amount != null) assert.ok(a.amount <= a.limit_applied || a.escalated);
  }
});

test('KPIs reconcile with underlying records', () => {
  const m = Object.fromEntries(world.metrics.map((x) => [x.id, x.value]));
  assert.equal(m['m-docs-total'], world.documents.length);
  assert.equal(m['m-approvals'], world.approvals.length);
  assert.equal(m['m-convos'], world.ai_conversations.length);
  assert.equal(
    m['m-wf-open'],
    world.workflow_items.filter((w) => ['open', 'pending'].includes(w.status)).length,
  );
});

test('permission model: restricted docs hidden from unentitled users', () => {
  const staff = world.employees.find((e) => e.permission_tier === 'T4');
  const restricted = world.documents.find((d) => d.visibility.startsWith('restricted:executives'));
  assert.ok(restricted);
  assert.equal(canSee(staff, restricted), false);
});
