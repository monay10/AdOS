import { NotFoundError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import {
  Product,
  type ProductFeature,
  type ProductId,
  type ProductPricing,
} from './product.js';
import type { ProductRepository } from './repository.js';

export interface CreateProductInput {
  tenantId: string;
  clientId: string;
  name: string;
  description?: string;
  categories?: string[];
  pricing?: ProductPricing;
}

/**
 * Product Application Service — transactional entry point for product use cases.
 * Manages categories, features and pricing, publishing domain events to the bus.
 * Every operation is traced, logged and metered.
 */
export class ProductService {
  private readonly tele: Telemetry = telemetry('agency-os.product');

  constructor(private readonly repo: ProductRepository, private readonly bus: EventBus) {}

  async create(input: CreateProductInput): Promise<Result<Product, AppError>> {
    return this.tele.span('create', async () => {
      const created = Product.create(input);
      if (created.isErr) return created;
      const saved = await this.repo.save(created.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(created.value);
      this.tele.count('created');
      this.tele.logger.info(
        { productId: created.value.id.toString(), clientId: input.clientId, name: input.name },
        'product created',
      );
      return ok(created.value);
    });
  }

  async update(
    id: ProductId,
    changes: { name?: string; description?: string; categories?: string[] },
  ): Promise<Result<Product, AppError>> {
    return this.mutate('update', id, (p) => p.update(changes));
  }

  async addFeature(id: ProductId, feature: ProductFeature): Promise<Result<Product, AppError>> {
    return this.mutate('add_feature', id, (p) => p.addFeature(feature));
  }

  async changePricing(id: ProductId, pricing: ProductPricing): Promise<Result<Product, AppError>> {
    return this.mutate('change_pricing', id, (p) => p.changePricing(pricing));
  }

  async archive(id: ProductId): Promise<Result<void, AppError>> {
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

  async list(clientId?: string): Promise<Product[]> {
    return this.tele.span('list', async () => this.repo.list(clientId));
  }

  async get(id: ProductId): Promise<Result<Product, AppError>> {
    return this.load(id);
  }

  private async mutate(
    op: string,
    id: ProductId,
    change: (p: Product) => Result<void, AppError>,
  ): Promise<Result<Product, AppError>> {
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

  private async load(id: ProductId): Promise<Result<Product, AppError>> {
    const found = await this.repo.findById(id);
    if (found.isErr) return err(found.error);
    if (!found.value) {
      return err(new NotFoundError(`Product "${id.toString()}" not found`, { details: { id: id.toString() } }));
    }
    return ok(found.value);
  }

  private async publish(product: Product): Promise<void> {
    const events: DomainEvent[] = product.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}
