import { NotFoundError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import {
  Brand,
  type BrandAsset,
  type BrandId,
  type BrandIdentity,
  type BrandProfile,
  type BrandRules,
} from './brand.js';
import type { BrandRepository } from './repository.js';

export interface CreateBrandInput {
  tenantId: string;
  clientId: string;
  name: string;
  profile?: Partial<BrandProfile>;
  identity?: Partial<BrandIdentity>;
  rules?: Partial<BrandRules>;
}

/**
 * Brand Application Service — transactional entry point for brand use cases.
 * Manages the brand profile, identity, rules and assets, publishing domain
 * events to the bus. Every operation is traced, logged and metered.
 */
export class BrandService {
  private readonly tele: Telemetry = telemetry('agency-os.brand');

  constructor(private readonly repo: BrandRepository, private readonly bus: EventBus) {}

  async create(input: CreateBrandInput): Promise<Result<Brand, AppError>> {
    return this.tele.span('create', async () => {
      const created = Brand.create(input);
      if (created.isErr) return created;
      const saved = await this.repo.save(created.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(created.value);
      this.tele.count('created');
      this.tele.logger.info(
        { brandId: created.value.id.toString(), clientId: input.clientId, name: input.name },
        'brand created',
      );
      return ok(created.value);
    });
  }

  async updateProfile(id: BrandId, profile: Partial<BrandProfile>): Promise<Result<Brand, AppError>> {
    return this.mutate('update_profile', id, (b) => b.updateProfile(profile));
  }

  async updateIdentity(id: BrandId, identity: Partial<BrandIdentity>): Promise<Result<Brand, AppError>> {
    return this.mutate('update_identity', id, (b) => b.updateIdentity(identity));
  }

  async updateRules(id: BrandId, rules: Partial<BrandRules>): Promise<Result<Brand, AppError>> {
    return this.mutate('update_rules', id, (b) => b.updateRules(rules));
  }

  async addAsset(
    id: BrandId,
    asset: { kind: BrandAsset['kind']; name: string; url: string },
  ): Promise<Result<Brand, AppError>> {
    return this.tele.span('add_asset', async () => {
      const found = await this.load(id);
      if (found.isErr) return err(found.error);
      const added = found.value.addAsset(asset);
      if (added.isErr) return err(added.error);
      const saved = await this.repo.save(found.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(found.value);
      this.tele.count('asset_added');
      return ok(found.value);
    });
  }

  async archive(id: BrandId): Promise<Result<void, AppError>> {
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

  async list(clientId?: string): Promise<Brand[]> {
    return this.tele.span('list', async () => this.repo.list(clientId));
  }

  async get(id: BrandId): Promise<Result<Brand, AppError>> {
    return this.load(id);
  }

  private async mutate(op: string, id: BrandId, change: (b: Brand) => void): Promise<Result<Brand, AppError>> {
    return this.tele.span(op, async () => {
      const found = await this.load(id);
      if (found.isErr) return err(found.error);
      change(found.value);
      const saved = await this.repo.save(found.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(found.value);
      this.tele.count(op);
      return ok(found.value);
    });
  }

  private async load(id: BrandId): Promise<Result<Brand, AppError>> {
    const found = await this.repo.findById(id);
    if (found.isErr) return err(found.error);
    if (!found.value) {
      return err(new NotFoundError(`Brand "${id.toString()}" not found`, { details: { id: id.toString() } }));
    }
    return ok(found.value);
  }

  private async publish(brand: Brand): Promise<void> {
    const events: DomainEvent[] = brand.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}
