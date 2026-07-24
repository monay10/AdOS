import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { SqliteDatabase } from '@ados/persistence';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { LocalFileStorage } from './adapters/local-storage.js';
import { StorageError } from './object.js';
import { SqlStorageRepository, storageObjectsMigration, InMemoryStorageRepository } from './storage-repository.js';
import { StorageEvents, StorageEventName } from './storage-events.js';
import { StorageApplicationService } from './storage-service.js';
import type { VirusScannerPort, ThumbnailGeneratorPort } from './storage.port.js';

let root: string;

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'ados-storage-'));
});
afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

function ctx(tenantId: string, actor = 'user@acme'): RequestContext {
  return { tenantId, correlationId: 'corr-1', actor, roles: [] };
}
function asTenant<T>(tenantId: string, fn: () => Promise<T>, actor?: string): Promise<T> {
  return TenantContext.run(ctx(tenantId, actor), fn);
}
function body(text: string): Readable {
  return Readable.from([Buffer.from(text, 'utf8')]);
}
async function collect(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

function service(dir: string, overrides: Partial<ConstructorParameters<typeof StorageApplicationService>[0]> = {}): StorageApplicationService {
  return new StorageApplicationService({
    adapter: new LocalFileStorage(dir),
    repository: new InMemoryStorageRepository(),
    ...overrides,
  });
}

describe('LocalFileStorage (streaming adapter)', () => {
  it('streams bytes, computing size + sha256, and round-trips them', async () => {
    const adapter = new LocalFileStorage(join(root, 'adapter'));
    const text = 'hello streaming world';
    const res = await adapter.put('t/o/v1/file.txt', body(text));
    expect(res.size).toBe(Buffer.byteLength(text));
    expect(res.sha256).toBe(createHash('sha256').update(text).digest('hex'));
    expect(await collect(await adapter.get('t/o/v1/file.txt'))).toBe(text);
    expect(await adapter.exists('t/o/v1/file.txt')).toBe(true);
  });

  it('rejects keys that escape the storage root', async () => {
    const adapter = new LocalFileStorage(join(root, 'adapter'));
    await expect(adapter.get('../../etc/passwd')).rejects.toBeInstanceOf(StorageError);
  });

  it('leaves no object behind when the write fails', async () => {
    const adapter = new LocalFileStorage(join(root, 'fail'));
    const failing = new Readable({ read() { this.destroy(new Error('boom')); } });
    await expect(adapter.put('t/o/v1/x.txt', failing)).rejects.toThrow('boom');
    expect(await adapter.list('t')).toEqual([]); // no partial / tmp file
  });
});

describe('StorageApplicationService — upload / validation / metadata', () => {
  it('uploads, populates every required metadata field, and downloads the same bytes', async () => {
    const svc = service(join(root, 's1'));
    const obj = await asTenant('acme', () =>
      svc.upload({ workspaceId: 'ws-1', originalName: 'brief.txt', mimeType: 'text/plain', body: body('the brief'), createdBy: 'ceo@acme' }),
    );
    expect(obj).toMatchObject({
      tenantId: 'acme',
      workspaceId: 'ws-1',
      originalName: 'brief.txt',
      mimeType: 'text/plain',
      extension: 'txt',
      size: Buffer.byteLength('the brief'),
      createdBy: 'ceo@acme',
      version: 1,
      deletedAt: null,
    });
    expect(obj.objectId).toBeTruthy();
    expect(obj.storedName).toBe(`${obj.objectId}.txt`);
    expect(obj.sha256).toBe(createHash('sha256').update('the brief').digest('hex'));

    const dl = await asTenant('acme', () => svc.download(obj.objectId));
    expect(await collect(dl.stream)).toBe('the brief');
  });

  it('rejects an unsupported MIME type', async () => {
    const svc = service(join(root, 's2'));
    await expect(
      asTenant('acme', () => svc.upload({ workspaceId: 'ws', originalName: 'x.bin', mimeType: 'application/x-evil', body: body('x') })),
    ).rejects.toMatchObject({ code: 'unsupported_mime' });
  });

  it('rejects an object over the size limit mid-stream', async () => {
    const svc = service(join(root, 's3'), { policy: { allowedMimeTypes: new Set(['text/plain']), maxSizeBytes: 8 } });
    await expect(
      asTenant('acme', () => svc.upload({ workspaceId: 'ws', originalName: 'big.txt', mimeType: 'text/plain', body: body('way too many bytes') })),
    ).rejects.toMatchObject({ code: 'too_large' });
  });
});

describe('StorageApplicationService — versioning / copy / move / rename', () => {
  it('adds immutable versions and lists history', async () => {
    const svc = service(join(root, 's4'));
    const v1 = await asTenant('acme', () => svc.upload({ workspaceId: 'ws', originalName: 'logo.txt', mimeType: 'text/plain', body: body('v1') }));
    const v2 = await asTenant('acme', () => svc.addVersion(v1.objectId, { originalName: 'logo.txt', mimeType: 'text/plain', body: body('v2 content') }));
    expect(v2.version).toBe(2);
    const versions = await asTenant('acme', () => svc.listVersions(v1.objectId));
    expect(versions.map((v) => v.version)).toEqual([1, 2]);
    expect(await collect((await asTenant('acme', () => svc.download(v1.objectId, 1))).stream)).toBe('v1');
    expect(await collect((await asTenant('acme', () => svc.download(v1.objectId))).stream)).toBe('v2 content');
  });

  it('copies bytes into a new object, moves between workspaces, and renames', async () => {
    const svc = service(join(root, 's5'));
    const src = await asTenant('acme', () => svc.upload({ workspaceId: 'ws-a', originalName: 'src.txt', mimeType: 'text/plain', body: body('payload') }));

    const copy = await asTenant('acme', () => svc.copy(src.objectId, { toWorkspaceId: 'ws-b' }));
    expect(copy.objectId).not.toBe(src.objectId);
    expect(copy.workspaceId).toBe('ws-b');
    expect(copy.sha256).toBe(src.sha256);
    expect(await collect((await asTenant('acme', () => svc.download(copy.objectId))).stream)).toBe('payload');

    const moved = await asTenant('acme', () => svc.move(src.objectId, 'ws-z'));
    expect(moved.workspaceId).toBe('ws-z');
    const renamed = await asTenant('acme', () => svc.rename(src.objectId, 'renamed.txt'));
    expect(renamed.originalName).toBe('renamed.txt');
  });
});

describe('StorageApplicationService — soft delete / purge / cleanup', () => {
  it('soft-deletes (retaining bytes) then purges', async () => {
    const svc = service(join(root, 's6'));
    const obj = await asTenant('acme', () => svc.upload({ workspaceId: 'ws', originalName: 'doc.txt', mimeType: 'text/plain', body: body('data') }));

    await asTenant('acme', () => svc.softDelete(obj.objectId));
    await expect(asTenant('acme', () => svc.download(obj.objectId))).rejects.toMatchObject({ code: 'not_found' });
    expect((await asTenant('acme', () => svc.getMetadata(obj.objectId))).deletedAt).toBeTruthy(); // metadata + bytes retained

    await asTenant('acme', () => svc.purge(obj.objectId));
    await expect(asTenant('acme', () => svc.getMetadata(obj.objectId))).rejects.toMatchObject({ code: 'not_found' });
  });

  it('garbage-collects objects soft-deleted before the cutoff', async () => {
    const svc = service(join(root, 's7'));
    const obj = await asTenant('acme', () => svc.upload({ workspaceId: 'ws', originalName: 'old.txt', mimeType: 'text/plain', body: body('old') }));
    await asTenant('acme', () => svc.softDelete(obj.objectId));
    const purged = await asTenant('acme', () => svc.cleanup(0)); // everything soft-deleted before now
    expect(purged).toBe(1);
    await expect(asTenant('acme', () => svc.getMetadata(obj.objectId))).rejects.toMatchObject({ code: 'not_found' });
  });
});

describe('StorageApplicationService — tenant isolation', () => {
  it('never exposes one tenant\'s objects to another', async () => {
    const svc = service(join(root, 's8'));
    const obj = await asTenant('acme', () => svc.upload({ workspaceId: 'ws', originalName: 'secret.txt', mimeType: 'text/plain', body: body('secret') }));
    await expect(asTenant('globex', () => svc.getMetadata(obj.objectId))).rejects.toMatchObject({ code: 'not_found' });
    await expect(asTenant('globex', () => svc.download(obj.objectId))).rejects.toMatchObject({ code: 'not_found' });
    // Still visible to its owner.
    expect((await asTenant('acme', () => svc.getMetadata(obj.objectId))).objectId).toBe(obj.objectId);
  });
});

describe('StorageApplicationService — hooks', () => {
  it('quarantines an object the virus scanner flags', async () => {
    const dir = join(root, 's9');
    const scanner: VirusScannerPort = { async scan(_key, stream) { return (await collect(stream)).includes('virus') ? { clean: false, signature: 'EICAR' } : { clean: true }; } };
    const svc = service(dir, { hooks: { scanner } });
    await expect(
      asTenant('acme', () => svc.upload({ workspaceId: 'ws', originalName: 'bad.txt', mimeType: 'text/plain', body: body('this has a virus') })),
    ).rejects.toMatchObject({ code: 'infected' });
    // Nothing persisted, and the quarantined bytes were removed.
    expect(await new LocalFileStorage(dir).list('acme')).toEqual([]);
  });

  it('generates a derivative via the thumbnail hook (ports only — hook injected)', async () => {
    const thumbnailer: ThumbnailGeneratorPort = { async generate() { return Readable.from([Buffer.from('THUMB')]); } };
    const svc = service(join(root, 's10'), { hooks: { thumbnailer } });
    const obj = await asTenant('acme', () => svc.upload({ workspaceId: 'ws', originalName: 'pic.png', mimeType: 'image/png', body: body('PNGDATA') }));
    const derived = await asTenant('acme', () => svc.generatePreviews(obj.objectId));
    expect(derived).toHaveLength(1);
    expect(derived[0]).toContain('/derived/thumb.png');
  });
});

describe('StorageApplicationService — events + health', () => {
  it('publishes storage events onto the EventBus', async () => {
    const bus = new InMemoryEventBus();
    const seen: string[] = [];
    await bus.subscribe('storage.>', async (env) => { seen.push(env.eventName); });
    const svc = service(join(root, 's11'), { events: new StorageEvents(bus) });
    const obj = await asTenant('acme', () => svc.upload({ workspaceId: 'ws', originalName: 'e.txt', mimeType: 'text/plain', body: body('e') }));
    await asTenant('acme', () => svc.download(obj.objectId));
    await asTenant('acme', () => svc.softDelete(obj.objectId));
    expect(seen).toContain(StorageEventName.Uploaded);
    expect(seen).toContain(StorageEventName.Downloaded);
    expect(seen).toContain(StorageEventName.SoftDeleted);
  });

  it('reports health', async () => {
    const svc = service(join(root, 's12'));
    await asTenant('acme', () => svc.upload({ workspaceId: 'ws', originalName: 'h.txt', mimeType: 'text/plain', body: body('h') }));
    const report = await asTenant('acme', () => svc.health());
    expect(report.healthy).toBe(true);
    expect(report.adapter).toBe('up');
    expect(report.objects).toBe(1);
  });
});

describe('SqlStorageRepository (embedded SQL)', () => {
  it('round-trips versioned, tenant-scoped metadata through SQL', async () => {
    const db = new SqliteDatabase(':memory:');
    await storageObjectsMigration().up(db);
    const repo = new SqlStorageRepository(db);

    await asTenant('acme', async () => {
      await repo.save({ tenantId: 'acme', workspaceId: 'ws', objectId: 'o1', originalName: 'a.txt', storedName: 'o1.txt', mimeType: 'text/plain', extension: 'txt', size: 3, sha256: 'h1', createdAt: '2026-01-01T00:00:00.000Z', createdBy: 'u', version: 1, deletedAt: null });
      await repo.save({ tenantId: 'acme', workspaceId: 'ws', objectId: 'o1', originalName: 'a.txt', storedName: 'o1.v2.txt', mimeType: 'text/plain', extension: 'txt', size: 6, sha256: 'h2', createdAt: '2026-01-02T00:00:00.000Z', createdBy: 'u', version: 2, deletedAt: null });
      expect((await repo.findLatest('o1'))?.version).toBe(2);
      expect((await repo.listVersions('o1')).map((v) => v.version)).toEqual([1, 2]);
      expect((await repo.listByWorkspace('ws')).map((o) => o.objectId)).toEqual(['o1']);
      expect(await repo.count()).toBe(1);
      await repo.softDelete('o1', '2026-02-01T00:00:00.000Z');
      expect((await repo.findSoftDeletedBefore('2026-03-01T00:00:00.000Z')).length).toBe(1);
    });
    // Another tenant sees nothing.
    await asTenant('globex', async () => {
      expect(await repo.findLatest('o1')).toBeNull();
      expect(await repo.count()).toBe(0);
    });
    await db.close();
  });
});
