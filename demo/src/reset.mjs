// One-command deterministic reset: rebuild the whole demo world from the spec,
// validate the staged build, then atomically swap it in. Never corrupts the live
// state (previous is kept). Only ever writes under demo/data/.

import { mkdir, writeFile, rename, rm, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { buildWorld } from './seed.mjs';
import { validate } from './validate.mjs';
import { SEED } from './data-model.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', 'data');
const WORLD = join(DATA, 'world.json');
const STAGING = join(DATA, '.staging');
const PREVIOUS = join(DATA, '.previous.json');

function demoTodayISO() {
  // Fixed to midnight UTC so a same-day reset is fully reproducible.
  return new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
}

export async function runReset({ silent = false } = {}) {
  const t0 = performance.now();
  const demoToday = demoTodayISO();

  // 1-4. Build fresh world (records + computed metrics) deterministically.
  const world = buildWorld(SEED, demoToday);

  // 5. Validate the staged build BEFORE swapping it in.
  const report = validate(world);
  if (!report.pass) {
    const failed = report.checks.filter((c) => !c.ok).map((c) => c.name).join(', ');
    throw new Error(`Reset aborted — validation FAILED: ${failed}. Live demo untouched.`);
  }

  // 6. Atomic swap: stage → verify readable → keep previous → move into place.
  await mkdir(STAGING, { recursive: true });
  const stagedFile = join(STAGING, 'world.json');
  await writeFile(stagedFile, JSON.stringify(world));
  JSON.parse(await readFile(stagedFile, 'utf8')); // verify it parses
  if (await exists(WORLD)) await rename(WORLD, PREVIOUS).catch(() => {});
  await rename(stagedFile, WORLD);
  await rm(STAGING, { recursive: true, force: true });

  const secs = ((performance.now() - t0) / 1000).toFixed(2);
  const summary = { pass: true, checksum: report.checksum.slice(0, 12), counts: report.counts, seconds: Number(secs) };
  if (!silent) {
    for (const c of report.checks) console.log(`  ✓ ${c.name}`);
    console.log(`\nDemo reset OK — ${world.meta.generated_records} records — checksum ${summary.checksum} — ${secs}s`);
  }
  return summary;
}

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

if (import.meta.url === `file://${process.argv[1]}`) {
  runReset().catch((e) => { console.error(e.message); process.exit(1); });
}
