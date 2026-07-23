import { NotFoundError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import { Workspace, type WorkspaceId, type WorkspaceSettings } from './workspace.js';
import type { WorkspaceRepository } from './repository.js';

export interface CreateWorkspaceInput {
  tenantId: string;
  name: string;
  settings?: Partial<WorkspaceSettings>;
  configuration?: { features: Record<string, boolean> };
}

/**
 * Workspace Application Service — the transactional entry point for workspace
 * use cases. Loads/saves aggregates through the repository and publishes their
 * domain events to the bus. Every operation is traced, logged and metered.
 */
export class WorkspaceService {
  private readonly tele: Telemetry = telemetry('agency-os.workspace');

  constructor(private readonly repo: WorkspaceRepository, private readonly bus: EventBus) {}

  async create(input: CreateWorkspaceInput): Promise<Result<Workspace, AppError>> {
    return this.tele.span('create', async () => {
      const created = Workspace.create(input);
      if (created.isErr) return created;
      const saved = await this.repo.save(created.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(created.value);
      this.tele.count('created');
      this.tele.logger.info({ workspaceId: created.value.id.toString(), name: input.name }, 'workspace created');
      return ok(created.value);
    });
  }

  async rename(id: WorkspaceId, name: string): Promise<Result<Workspace, AppError>> {
    return this.mutate('rename', id, (w) => w.rename(name));
  }

  async updateSettings(id: WorkspaceId, settings: Partial<WorkspaceSettings>): Promise<Result<Workspace, AppError>> {
    return this.mutate('update_settings', id, (w) => {
      w.updateSettings(settings);
      return ok(undefined);
    });
  }

  async configure(id: WorkspaceId, features: Record<string, boolean>): Promise<Result<Workspace, AppError>> {
    return this.mutate('configure', id, (w) => {
      w.configure(features);
      return ok(undefined);
    });
  }

  async delete(id: WorkspaceId): Promise<Result<void, AppError>> {
    return this.tele.span('delete', async () => {
      const found = await this.load(id);
      if (found.isErr) return err(found.error);
      found.value.markDeleted();
      const saved = await this.repo.save(found.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(found.value);
      this.tele.count('deleted');
      return ok(undefined);
    });
  }

  async list(): Promise<Workspace[]> {
    return this.tele.span('list', async () => this.repo.list());
  }

  async get(id: WorkspaceId): Promise<Result<Workspace, AppError>> {
    return this.load(id);
  }

  private async mutate(
    op: string,
    id: WorkspaceId,
    change: (w: Workspace) => Result<void, AppError>,
  ): Promise<Result<Workspace, AppError>> {
    return this.tele.span(op, async () => {
      const found = await this.load(id);
      if (found.isErr) return err(found.error);
      const changed = change(found.value);
      if (changed.isErr) return err(changed.error);
      const saved = await this.repo.save(found.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(found.value);
      this.tele.count(op);
      return ok(found.value);
    });
  }

  private async load(id: WorkspaceId): Promise<Result<Workspace, AppError>> {
    const found = await this.repo.findById(id);
    if (found.isErr) return err(found.error);
    if (!found.value) return err(new NotFoundError(`Workspace "${id.toString()}" not found`, { details: { id: id.toString() } }));
    return ok(found.value);
  }

  private async publish(workspace: Workspace): Promise<void> {
    const events: DomainEvent[] = workspace.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}
