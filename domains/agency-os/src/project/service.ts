import { NotFoundError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import {
  Project,
  type ProjectGoal,
  type ProjectId,
  type ProjectMember,
  type ProjectStatus,
} from './project.js';
import type { ProjectRepository } from './repository.js';

export interface CreateProjectInput {
  tenantId: string;
  clientId: string;
  brandId: string;
  name: string;
  description?: string;
}

/**
 * Project Application Service — transactional entry point for the project
 * lifecycle: create, update, status, goals, members, archive. Publishes domain
 * events to the bus. Every operation is traced, logged and metered.
 */
export class ProjectService {
  private readonly tele: Telemetry = telemetry('agency-os.project');

  constructor(private readonly repo: ProjectRepository, private readonly bus: EventBus) {}

  async create(input: CreateProjectInput): Promise<Result<Project, AppError>> {
    return this.tele.span('create', async () => {
      const created = Project.create(input);
      if (created.isErr) return created;
      const saved = await this.repo.save(created.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(created.value);
      this.tele.count('created');
      this.tele.logger.info(
        { projectId: created.value.id.toString(), clientId: input.clientId, brandId: input.brandId },
        'project created',
      );
      return ok(created.value);
    });
  }

  async update(id: ProjectId, changes: { name?: string; description?: string }): Promise<Result<Project, AppError>> {
    return this.mutate('update', id, (p) => p.update(changes));
  }

  async changeStatus(id: ProjectId, status: ProjectStatus): Promise<Result<Project, AppError>> {
    return this.mutate('change_status', id, (p) => p.changeStatus(status));
  }

  async addGoal(id: ProjectId, goal: ProjectGoal): Promise<Result<Project, AppError>> {
    return this.mutate('add_goal', id, (p) => p.addGoal(goal));
  }

  async addMember(id: ProjectId, member: ProjectMember): Promise<Result<Project, AppError>> {
    return this.mutate('add_member', id, (p) => p.addMember(member));
  }

  async archive(id: ProjectId): Promise<Result<void, AppError>> {
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

  async list(clientId?: string): Promise<Project[]> {
    return this.tele.span('list', async () => this.repo.list(clientId));
  }

  async get(id: ProjectId): Promise<Result<Project, AppError>> {
    return this.load(id);
  }

  private async mutate(
    op: string,
    id: ProjectId,
    change: (p: Project) => Result<void, AppError>,
  ): Promise<Result<Project, AppError>> {
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

  private async load(id: ProjectId): Promise<Result<Project, AppError>> {
    const found = await this.repo.findById(id);
    if (found.isErr) return err(found.error);
    if (!found.value) {
      return err(new NotFoundError(`Project "${id.toString()}" not found`, { details: { id: id.toString() } }));
    }
    return ok(found.value);
  }

  private async publish(project: Project): Promise<void> {
    const events: DomainEvent[] = project.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}
