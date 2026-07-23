import { describe, expect, it } from 'vitest';
import { ok, err, combine } from './result/result.js';
import { Guard } from './guards/guard.js';
import { Identifier } from './identifiers/identifier.js';
import { AggregateRoot } from './domain/aggregate-root.js';
import { DomainEvent } from './domain/domain-event.js';
import { ValidationError } from './errors/domain-error.js';

describe('Result', () => {
  it('maps and chains ok values', () => {
    const r = ok<number>(2)
      .map((x) => x * 3)
      .andThen((x) => ok(x + 1));
    expect(r.isOk && r.value).toBe(7);
  });

  it('short-circuits on err', () => {
    const r = err<ValidationError, number>(new ValidationError('bad')).map((x) => x * 2);
    expect(r.isErr).toBe(true);
  });

  it('combine fails fast', () => {
    const combined = combine([ok(1), err<ValidationError, number>(new ValidationError('x')), ok(3)]);
    expect(combined.isErr).toBe(true);
  });
});

describe('Guard', () => {
  it('composes checks and fails on first error', () => {
    const result = Guard.all(
      Guard.againstEmptyString('name', 'name'),
      Guard.inRange(150, 0, 100, 'score'),
    );
    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error.details?.field).toBe('score');
  });
});

describe('AggregateRoot', () => {
  class Opened extends DomainEvent<{ label: string }> {
    readonly eventName = 'account.opened.v1';
  }
  class Account extends AggregateRoot {
    static open(label: string): Account {
      const a = new Account(Identifier.create());
      a.addDomainEvent(new Opened(a.id.toString(), { label }, { tenantId: 'public' }));
      return a;
    }
  }

  it('records events and bumps version, then drains them', () => {
    const account = Account.open('main');
    expect(account.version).toBe(1);
    const events = account.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.eventName).toBe('account.opened.v1');
    expect(account.domainEvents).toHaveLength(0);
  });
});
