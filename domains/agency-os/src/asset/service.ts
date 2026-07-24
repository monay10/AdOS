import { NotFoundError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import { Asset, type AssetId, type AssetKind } from './asset.js';
import type { AssetFilter, AssetRepository } from './repository.js';

export interface CreateAssetInput {
  tenantId: string;
  clientId: string;
  brandId?: string;
  projectId?: string;
  name: string;
  kind: AssetKind;
  content: string;
  tags?: string[];
  by: string;
  at: string;
}

/**
 * Asset Application Service — the transactional entry point for the asset
 * library: add an asset, add a new version, tag it. Persists the aggregate and
 * publishes the matching domain event on every change. Traced, logged, metered.
 */
export class AssetService {
  private readonly tele: Telemetry = telemetry('agency-os.asset');

  constructor(private readonly repo: AssetRepository, private readonly bus: EventBus) {}

  async create(input: CreateAssetInput): Promise<Result<Asset, AppError>> {
    return this.tele.span('create', async () => {
      const created = Asset.create(input);
      if (created.isErr) return created;
      const saved = await this.repo.save(created.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(created.value);
      this.tele.count('created');
      this.tele.logger.info(
        { assetId: created.value.id.toString(), clientId: input.clientId, kind: input.kind },
        'asset created',
      );
      return ok(created.value);
    });
  }

  async addVersion(
    id: AssetId,
    input: { content: string; note?: string; by: string; at: string },
  ): Promise<Result<Asset, AppError>> {
    return this.mutate('add_version', id, (a) => a.addVersion(input));
  }

  async addTag(id: AssetId, tag: string): Promise<Result<Asset, AppError>> {
    return this.mutate('add_tag', id, (a) => a.addTag(tag));
  }

  async list(filter?: AssetFilter): Promise<Asset[]> {
    return this.tele.span('list', async () => this.repo.list(filter));
  }

  async get(id: AssetId): Promise<Result<Asset, AppError>> {
    return this.load(id);
  }

  private async mutate(
    op: string,
    id: AssetId,
    change: (a: Asset) => Result<void, AppError>,
  ): Promise<Result<Asset, AppError>> {
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

  private async load(id: AssetId): Promise<Result<Asset, AppError>> {
    const found = await this.repo.findById(id);
    if (found.isErr) return err(found.error);
    if (!found.value) {
      return err(new NotFoundError(`Asset "${id.toString()}" not found`, { details: { id: id.toString() } }));
    }
    return ok(found.value);
  }

  private async publish(asset: Asset): Promise<void> {
    const events: DomainEvent[] = asset.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}
