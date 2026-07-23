import { randomUUID } from 'node:crypto';
import {
  AggregateRoot,
  DomainEvent,
  Guard,
  Identifier,
  type Result,
  ValidationError,
  err,
  ok,
} from '@ados/kernel';
import type { Money } from '@ados/contracts';

/** Strongly-typed Product identifier. */
export class ProductId extends Identifier {
  static of(value?: string): ProductId {
    return new ProductId(value ?? randomUUID());
  }
}

/** A single selling feature / benefit of the product. */
export interface ProductFeature {
  name: string;
  description: string;
}

/** How the product is priced. */
export type PricingModel = 'one_time' | 'subscription' | 'usage' | 'free';

export interface ProductPricing {
  model: PricingModel;
  /** Headline price. Minor units to avoid float drift. */
  amount: Money;
  /** For subscriptions: billing period. */
  period?: 'monthly' | 'yearly';
}

export type ProductStatus = 'active' | 'archived';

export interface ProductProps {
  tenantId: string;
  clientId: string;
  name: string;
  description: string;
  categories: string[];
  features: ProductFeature[];
  pricing: ProductPricing;
  status: ProductStatus;
}

const DEFAULT_PRICING: ProductPricing = { model: 'free', amount: { amountMinor: 0, currency: 'USD' } };

// ── Domain events ─────────────────────────────────────────────────────────────
export class ProductCreated extends DomainEvent<{ clientId: string; name: string; tenantId: string }> {
  readonly eventName = 'product.created.v1';
}
export class ProductUpdated extends DomainEvent<{ changes: Partial<Pick<ProductProps, 'name' | 'description' | 'categories'>> }> {
  readonly eventName = 'product.updated.v1';
}
export class ProductFeatureAdded extends DomainEvent<{ feature: ProductFeature }> {
  readonly eventName = 'product.feature_added.v1';
}
export class ProductPricingChanged extends DomainEvent<{ pricing: ProductPricing }> {
  readonly eventName = 'product.pricing_changed.v1';
}
export class ProductArchived extends DomainEvent<Record<string, never>> {
  readonly eventName = 'product.archived.v1';
}

/**
 * Product — something a client sells, that the AI Company markets. Owns its
 * categories, selling features and pricing. Input to Marketing Intelligence and
 * the Creative Studio.
 */
export class Product extends AggregateRoot<ProductId> {
  private constructor(id: ProductId, private props: ProductProps) {
    super(id);
  }

  static create(input: {
    tenantId: string;
    clientId: string;
    name: string;
    description?: string;
    categories?: string[];
    pricing?: ProductPricing;
    id?: string;
  }): Result<Product, ValidationError> {
    const check = Guard.all(
      Guard.againstEmptyString(input.tenantId, 'tenantId'),
      Guard.againstEmptyString(input.clientId, 'clientId'),
      Guard.againstEmptyString(input.name, 'name'),
    );
    if (check.isErr) return err(check.error);
    if (input.pricing) {
      const priceCheck = validatePricing(input.pricing);
      if (priceCheck.isErr) return err(priceCheck.error);
    }

    const product = new Product(ProductId.of(input.id), {
      tenantId: input.tenantId,
      clientId: input.clientId,
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      categories: dedupe(input.categories ?? []),
      features: [],
      pricing: input.pricing ?? DEFAULT_PRICING,
      status: 'active',
    });
    product.addDomainEvent(
      new ProductCreated(
        product.id.toString(),
        { clientId: input.clientId, name: product.props.name, tenantId: input.tenantId },
        { tenantId: input.tenantId },
      ),
    );
    return ok(product);
  }

  /** Rehydrate from persistence without emitting events. */
  static restore(id: string, props: ProductProps): Product {
    return new Product(ProductId.of(id), props);
  }

  get tenantId(): string {
    return this.props.tenantId;
  }
  get clientId(): string {
    return this.props.clientId;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string {
    return this.props.description;
  }
  get categories(): readonly string[] {
    return this.props.categories;
  }
  get features(): readonly ProductFeature[] {
    return this.props.features;
  }
  get pricing(): ProductPricing {
    return this.props.pricing;
  }
  get status(): ProductStatus {
    return this.props.status;
  }

  snapshot(): ProductProps {
    return {
      ...this.props,
      categories: [...this.props.categories],
      features: this.props.features.map((f) => ({ ...f })),
      pricing: { ...this.props.pricing, amount: { ...this.props.pricing.amount } },
    };
  }

  update(changes: { name?: string; description?: string; categories?: string[] }): Result<void, ValidationError> {
    this.guardActive();
    if (changes.name !== undefined) {
      const check = Guard.againstEmptyString(changes.name, 'name');
      if (check.isErr) return check;
    }
    const applied: Partial<Pick<ProductProps, 'name' | 'description' | 'categories'>> = {};
    if (changes.name !== undefined) applied.name = changes.name.trim();
    if (changes.description !== undefined) applied.description = changes.description.trim();
    if (changes.categories !== undefined) applied.categories = dedupe(changes.categories);
    this.props = { ...this.props, ...applied };
    this.addDomainEvent(new ProductUpdated(this.id.toString(), { changes: applied }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  addFeature(feature: ProductFeature): Result<void, ValidationError> {
    this.guardActive();
    const check = Guard.againstEmptyString(feature.name, 'feature.name');
    if (check.isErr) return check;
    const created: ProductFeature = { name: feature.name.trim(), description: feature.description.trim() };
    this.props = { ...this.props, features: [...this.props.features, created] };
    this.addDomainEvent(new ProductFeatureAdded(this.id.toString(), { feature: created }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  changePricing(pricing: ProductPricing): Result<void, ValidationError> {
    this.guardActive();
    const check = validatePricing(pricing);
    if (check.isErr) return check;
    this.props = { ...this.props, pricing };
    this.addDomainEvent(new ProductPricingChanged(this.id.toString(), { pricing }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  archive(): void {
    if (this.props.status === 'archived') return;
    this.props = { ...this.props, status: 'archived' };
    this.addDomainEvent(new ProductArchived(this.id.toString(), {}, { tenantId: this.props.tenantId }));
  }

  private guardActive(): void {
    if (this.props.status === 'archived') {
      throw new ValidationError('Product is archived', { details: { id: this.id.toString() } });
    }
  }
}

function validatePricing(pricing: ProductPricing): Result<void, ValidationError> {
  const check = Guard.all(
    Guard.oneOf(pricing.model, ['one_time', 'subscription', 'usage', 'free'] as const, 'pricing.model'),
    Guard.inRange(pricing.amount.amountMinor, 0, Number.MAX_SAFE_INTEGER, 'pricing.amount'),
    Guard.againstEmptyString(pricing.amount.currency, 'pricing.currency'),
  );
  if (check.isErr) return check;
  if (pricing.model === 'subscription' && pricing.period === undefined) {
    return err(new ValidationError('subscription pricing requires a period', { details: { field: 'pricing.period' } }));
  }
  return ok(undefined);
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter((v) => v.length > 0))];
}
