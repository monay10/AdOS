import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { Client, ClientId } from './client.js';
import { InMemoryClientRepository } from './repository.js';
import { ClientService } from './service.js';

// ── Unit tests: domain model ──────────────────────────────────────────────────
describe('Client (domain)', () => {
  it('creates a valid client with defaults and a creation event', () => {
    const r = Client.create({
      tenantId: 'acme',
      workspaceId: 'ws1',
      name: '  Dental Co  ',
      contact: { email: '  hi@dental.co ' },
    });
    expect(r.isOk).toBe(true);
    if (r.isOk) {
      expect(r.value.name).toBe('Dental Co');
      expect(r.value.industry).toBe('general');
      expect(r.value.contact.email).toBe('hi@dental.co');
      expect(r.value.status).toBe('active');
      expect(r.value.pullDomainEvents()[0]!.eventName).toBe('client.created.v1');
    }
  });

  it('rejects missing tenant, workspace, name or email', () => {
    expect(Client.create({ tenantId: '', workspaceId: 'ws1', name: 'x', contact: { email: 'a@b.c' } }).isErr).toBe(true);
    expect(Client.create({ tenantId: 'acme', workspaceId: '', name: 'x', contact: { email: 'a@b.c' } }).isErr).toBe(true);
    expect(Client.create({ tenantId: 'acme', workspaceId: 'ws1', name: '', contact: { email: 'a@b.c' } }).isErr).toBe(true);
    expect(Client.create({ tenantId: 'acme', workspaceId: 'ws1', name: 'x', contact: { email: '' } }).isErr).toBe(true);
  });

  it('updates fields and emits an update event', () => {
    const c = Client.create({ tenantId: 'acme', workspaceId: 'ws1', name: 'Old', contact: { email: 'a@b.c' } }).unwrap();
    c.pullDomainEvents();
    const r = c.update({ name: 'New', industry: 'dental', contact: { phone: '555' } });
    expect(r.isOk).toBe(true);
    expect(c.name).toBe('New');
    expect(c.industry).toBe('dental');
    expect(c.contact.phone).toBe('555');
    expect(c.contact.email).toBe('a@b.c');
    expect(c.pullDomainEvents().map((e) => e.eventName)).toEqual(['client.updated.v1']);
  });

  it('refuses mutation after archiving', () => {
    const c = Client.create({ tenantId: 'acme', workspaceId: 'ws1', name: 'X', contact: { email: 'a@b.c' } }).unwrap();
    c.archive();
    expect(c.status).toBe('archived');
    expect(() => c.update({ name: 'Y' })).toThrow();
  });
});

// ── Integration tests: service + repository + event bus ───────────────────────
describe('ClientService (integration)', () => {
  const ctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

  function wire() {
    const bus = new InMemoryEventBus();
    const repo = new InMemoryClientRepository();
    const service = new ClientService(repo, bus);
    return { bus, repo, service };
  }

  it('creates, lists, updates, and archives a client end to end', async () => {
    await TenantContext.run(ctx, async () => {
      const { bus, service } = wire();
      const seen: string[] = [];
      await bus.subscribe('client.>', async (e) => { seen.push(e.eventName); });

      const created = await service.create({
        tenantId: 'acme',
        workspaceId: 'ws1',
        name: 'Dental Co',
        contact: { email: 'hi@dental.co' },
      });
      expect(created.isOk).toBe(true);
      const id = created.unwrap().id;

      expect(await service.list('ws1')).toHaveLength(1);

      const updated = await service.update(id, { industry: 'dental' });
      expect(updated.unwrap().industry).toBe('dental');

      const archived = await service.archive(id);
      expect(archived.isOk).toBe(true);
      expect(await service.list('ws1')).toHaveLength(0); // archived, excluded from list

      expect(seen).toEqual(['client.created.v1', 'client.updated.v1', 'client.archived.v1']);
    });
  });

  it('scopes listing by workspace and isolates tenants', async () => {
    const { service } = wire();
    await TenantContext.run(ctx, async () => {
      await service.create({ tenantId: 'acme', workspaceId: 'ws1', name: 'A', contact: { email: 'a@x.co' } });
      await service.create({ tenantId: 'acme', workspaceId: 'ws2', name: 'B', contact: { email: 'b@x.co' } });
      expect((await service.list('ws1')).map((c) => c.name)).toEqual(['A']);
      expect((await service.list()).map((c) => c.name).sort()).toEqual(['A', 'B']);
    });
    await TenantContext.run({ ...ctx, tenantId: 'other' }, async () => {
      expect(await service.list()).toHaveLength(0);
    });
  });

  it('returns NotFound for a missing client', async () => {
    await TenantContext.run(ctx, async () => {
      const { service } = wire();
      const r = await service.get(ClientId.of('missing'));
      expect(r.isErr).toBe(true);
    });
  });
});
