// One-command setup (first run). No external dependencies to install — it seeds
// the deterministic demo world and validates it. Idempotent: safe to re-run.

import { runReset } from './reset.mjs';

console.log('AdOS demo environment — setup');
console.log('Seeding NovaMak demo world (deterministic, isolated, offline)...\n');
const summary = await runReset();
console.log('\nSetup complete. Data at demo/data/world.json.');
console.log('Commands: npm run reset · npm run validate · npm test');
void summary;
