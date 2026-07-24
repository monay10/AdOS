import { describe, expect, it } from 'vitest';
import { SqliteDatabase } from '@ados/persistence';
import { DeploymentVerifier } from '@ados/deploy';
import { InMemoryJobStore, newJob } from '@ados/workers';
import {
  BackupService,
  DatabaseBackupSource,
  InMemoryBackupArchiveStore,
  InMemoryBackupRepository,
  JsonSnapshotSource,
  RestoreService,
  type BackupSource,
} from '@ados/backup';
import { RecoveryManager, renderRecoveryReport } from './recovery-manager.js';
import { backupRestoreStep, configStep, consistencyStep, dependencyStep, migrationStep, queueRecoveryStep } from './steps.js';
import { RecoveryValidation } from './recovery-validation.js';
import { RecoveryHealthCheck } from './recovery-health.js';

const okVerifier = new DeploymentVerifier([
  { name: 'postgres', verify: () => ({ name: 'postgres', state: 'pass' }) },
  { name: 'minio', verify: () => ({ name: 'minio', state: 'pass' }) },
  { name: 'nats', verify: () => ({ name: 'nats', state: 'pass' }) },
]);

async function seededBackup(): Promise<{
  db: SqliteDatabase;
  brain: { box: { data: Record<string, unknown> } };
  restore: RestoreService;
  backupId: string;
  createdAt: string;
}> {
  const db = new SqliteDatabase(':memory:');
  await db.execute('CREATE TABLE widgets (id text PRIMARY KEY, name text NOT NULL)');
  await db.execute("INSERT INTO widgets (id, name) VALUES ('w1','Alpha'), ('w2','Beta')");
  const brain = { box: { data: { facts: ['learned x', 'learned y'] } as Record<string, unknown> } };
  const sources: BackupSource[] = [
    new DatabaseBackupSource('postgres', db, ['widgets']),
    new JsonSnapshotSource('company_brain', { snapshot: () => brain.box.data, load: (_c, d) => { brain.box.data = d; } }),
  ];
  const repo = new InMemoryBackupRepository();
  const archives = new InMemoryBackupArchiveStore();
  const record = await new BackupService({ sources, repository: repo, archives }).backup({ tenantId: 'acme' });
  const restore = new RestoreService({ sources, repository: repo, archives });
  return { db, brain, restore, backupId: record.id, createdAt: record.createdAt };
}

describe('RecoveryManager — full disaster recovery', () => {
  it('recovers database + knowledge from backup, recovers the queue, and validates consistency', async () => {
    const { db, brain, restore, backupId, createdAt } = await seededBackup();

    // Disaster: database wiped + knowledge lost + a worker crashed mid-job.
    await db.execute('DELETE FROM widgets');
    brain.box.data = {};
    const jobStore = new InMemoryJobStore();
    await jobStore.enqueue(newJob({ type: 'x' }, 1_000));
    await jobStore.claimDue(1_000, 500); // running, lease until 1500

    const manager = new RecoveryManager(
      [
        configStep(() => ({ ok: true, errors: [] })),
        dependencyStep(okVerifier),
        migrationStep(async () => { await db.execute('CREATE TABLE IF NOT EXISTS widgets (id text PRIMARY KEY, name text NOT NULL)'); return { applied: [] }; }),
        backupRestoreStep(restore, { backupId, createdAt, now: () => Date.parse(createdAt) + 5_000 }),
        queueRecoveryStep(jobStore, () => 10_000), // well past the lease
        consistencyStep('consistency', [
          { name: 'widgets', check: async () => (await db.query('SELECT * FROM widgets')).length === 2 },
          { name: 'knowledge', check: () => Array.isArray(brain.box.data['facts']) },
        ]),
      ],
      { now: (() => { let t = 0; return () => (t += 100); })() },
    );

    const report = await manager.recover();
    // eslint-disable-next-line no-console
    console.log(renderRecoveryReport(report));

    expect(report.recovered).toBe(true);
    expect(report.rtoMs).toBeGreaterThan(0);
    expect(report.rpoMs).toBe(5_000); // recovered from a 5s-old backup
    expect(report.steps.every((s) => s.ok)).toBe(true);

    expect((await db.query('SELECT * FROM widgets')).length).toBe(2); // data restored
    expect(brain.box.data['facts']).toEqual(['learned x', 'learned y']); // knowledge restored
    expect((await jobStore.countByStatus()).queued).toBe(1); // crashed job re-queued
    await db.close();
  });
});

describe('RecoveryManager — individual scenarios', () => {
  it('fails recovery on configuration corruption (critical step)', async () => {
    const manager = new RecoveryManager([
      configStep(() => ({ ok: false, errors: ['DATABASE_URL missing', 'SESSION_SECRET missing'] })),
      queueRecoveryStep(new InMemoryJobStore()),
    ]);
    const report = await manager.recover();
    expect(report.recovered).toBe(false);
    expect(report.steps.find((s) => s.name === 'config')?.ok).toBe(false);
    // Non-critical steps still ran, so the report is complete.
    expect(report.steps.find((s) => s.name === 'queue-recovery')).toBeTruthy();
  });

  it('treats interrupted migrations as idempotent (re-run is a no-op)', async () => {
    const db = new SqliteDatabase(':memory:');
    let calls = 0;
    const step = migrationStep(async () => { calls++; await db.execute('CREATE TABLE IF NOT EXISTS t (id text PRIMARY KEY)'); return { applied: calls === 1 ? ['0001_t'] : [] }; });
    expect((await step.run()).ok).toBe(true);
    const second = await step.run();
    expect(second.ok).toBe(true);
    expect(second.detail).toContain('idempotent');
    await db.close();
  });

  it('recovers a corrupted queue by re-queuing stale jobs', async () => {
    const store = new InMemoryJobStore();
    await store.enqueue(newJob({ type: 'y' }, 1_000));
    await store.claimDue(1_000, 500);
    const step = queueRecoveryStep(store, () => 5_000);
    const outcome = await step.run();
    expect(outcome.ok).toBe(true);
    expect(outcome.detail).toContain('re-queued 1');
    expect((await store.countByStatus()).queued).toBe(1);
  });

  it('reports a failing dependency (e.g. storage loss) as not ready', async () => {
    const verifier = new DeploymentVerifier([
      { name: 'postgres', verify: () => ({ name: 'postgres', state: 'pass' }) },
      { name: 'minio', verify: () => ({ name: 'minio', state: 'fail' }) },
    ]);
    const outcome = await dependencyStep(verifier).run();
    expect(outcome.ok).toBe(false);
    expect(outcome.detail).toContain('minio');
  });
});

describe('RecoveryValidation + RecoveryHealthCheck', () => {
  it('validates tenant + knowledge consistency', async () => {
    const validation = new RecoveryValidation()
      .tenant(() => true)
      .knowledge(() => true)
      .add('custom', async () => true);
    expect((await validation.run()).ok).toBe(true);
    expect(validation.build().name).toBe('consistency');

    const failing = new RecoveryValidation().tenant(() => false);
    expect((await failing.run())).toEqual({ ok: false, failed: ['tenant-consistency'] });
  });

  it('automatic startup verification is healthy when the system can recover', async () => {
    const { restore, backupId, createdAt, db } = await seededBackup();
    const verifyManager = new RecoveryManager([
      configStep(() => ({ ok: true, errors: [] })),
      dependencyStep(okVerifier),
      backupRestoreStep(restore, { backupId, createdAt, dryRun: true }), // verify only, no mutation
    ]);
    const health = await new RecoveryHealthCheck(verifyManager).check();
    expect(health.healthy).toBe(true);
    expect(health.steps.map((s) => s.name)).toContain('backup-verify');
    await db.close();
  });
});
