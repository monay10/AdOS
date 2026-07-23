import { NotFoundError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import { Client, type ClientContact, type ClientId } from './client.js';
import type { ClientRepository } from './repository.js';

export interface CreateClientInput {
  tenantId: string;
  workspaceId: string;
  name: string;
  industry?: string;
  contact: ClientContact;
}

export interface UpdateClientInput {
  name?: string;
  industry?: string;
  contact?: Partial<ClientContact>;
}

/**
 * Client Application Service — the transactional entry point for client use
 * cases. Loads/saves aggregates through the repository and publishes their
 * domain events to the bus. Every operation is traced, logged and metered.
 */
export class ClientService {
  private readonly tele: Telemetry = telemetry('agency-os.client');

  constructor(private readonly repo: ClientRepository, private readonly bus: EventBus) {}

  async create(input: CreateClientInput): Promise<Result<Client, AppError>> {
    return this.tele.span('create', async () => {
      const created = Client.create(input);
      if (created.isErr) return created;
      const saved = await this.repo.save(created.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(created.value);
      this.tele.count('created');
      this.tele.logger.info(
        { clientId: created.value.id.toString(), workspaceId: input.workspaceId, name: input.name },
        'client created',
      );
      return ok(created.value);
    });
  }

  async update(id: ClientId, changes: UpdateClientInput): Promise<Result<Client, AppError>> {
    return this.tele.span('update', async () => {
      const found = await this.load(id);
      if (found.isErr) return err(found.error);
      const changed = found.value.update(changes);
      if (changed.isErr) return err(changed.error);
      const saved = await this.repo.save(found.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(found.value);
      this.tele.count('updated');
      return ok(found.value);
    });
  }

  async archive(id: ClientId): Promise<Result<void, AppError>> {
    return this.tele.span('archive', async () => {
      const found = await this.load(id);
      if (found.isErr) return err(found.error);
      found.value.archive();
      const saved = await this.repo.save(found.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(found.value);
      this.tele.count('archived');
      return ok(undefined);
    });
  }

  async list(workspaceId?: string): Promise<Client[]> {
    return this.tele.span('list', async () => this.repo.list(workspaceId));
  }

  async get(id: ClientId): Promise<Result<Client, AppError>> {
    return this.load(id);
  }

  private async load(id: ClientId): Promise<Result<Client, AppError>> {
    const found = await this.repo.findById(id);
    if (found.isErr) return err(found.error);
    if (!found.value) {
      return err(new NotFoundError(`Client "${id.toString()}" not found`, { details: { id: id.toString() } }));
    }
    return ok(found.value);
  }

  private async publish(client: Client): Promise<void> {
    const events: DomainEvent[] = client.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}
