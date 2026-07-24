import { describe, expect, it } from 'vitest';
import {
  benchEventBus,
  benchJson,
  benchRepository,
  benchSqliteStatementCache,
  benchStorage,
  benchWorkerThroughput,
  memorySnapshot,
} from './scenarios.js';
import { renderTable } from './timer.js';

// A small benchmark suite that doubles as a regression guard: every scenario
// must complete and clear a loose throughput floor (loose so CI never flakes).
describe('benchmark suite', () => {
  it('prepared-statement cache is faster than re-preparing', async () => {
    const { cached, uncached, speedup } = await benchSqliteStatementCache(5_000);
    // eslint-disable-next-line no-console
    console.log(renderTable([uncached, cached]), `\nspeedup: ${speedup}x`);
    expect(cached.meanMs).toBeLessThanOrEqual(uncached.meanMs);
    expect(speedup).toBeGreaterThan(1);
  });

  it('repository, worker, storage, event-bus, json scenarios all run', async () => {
    const repo = await benchRepository(2_000);
    const workers = await benchWorkerThroughput(2_000);
    const storage = await benchStorage(500);
    const events = await benchEventBus(5_000);
    const json = await benchJson(20_000);
    // eslint-disable-next-line no-console
    console.log(renderTable([repo.write, repo.read, workers, storage.upload, storage.download, events, json.stringify, json.parse]));
    // eslint-disable-next-line no-console
    console.log('memory:', memorySnapshot());

    expect(repo.write.opsPerSec).toBeGreaterThan(500);
    expect(workers.opsPerSec).toBeGreaterThan(1_000);
    expect(storage.upload.opsPerSec).toBeGreaterThan(100);
    expect(events.opsPerSec).toBeGreaterThan(5_000);
    expect(json.parse.opsPerSec).toBeGreaterThan(10_000);
  });
});
