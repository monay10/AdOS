import { describe, expect, it } from 'vitest';
import type { DomainEventEnvelope } from '@ados/kernel';
import { InMemoryEventBus, matches } from './adapters/in-memory-event-bus.js';

function envelope(eventName: string): DomainEventEnvelope {
  return {
    eventName,
    aggregateId: 'agg-1',
    payload: { ok: true },
    metadata: {
      eventId: 'e1',
      occurredAt: '2026-01-01T00:00:00.000Z',
      tenantId: 'public',
      correlationId: 'c1',
      causationId: undefined,
      actor: undefined,
    },
  };
}

describe('subject matching', () => {
  it('matches exact, single-token *, and multi-token >', () => {
    expect(matches('campaign.launched.v1', 'campaign.launched.v1')).toBe(true);
    expect(matches('campaign.*.v1', 'campaign.launched.v1')).toBe(true);
    expect(matches('campaign.>', 'campaign.launched.v1')).toBe(true);
    expect(matches('campaign.*', 'campaign.launched.v1')).toBe(false);
    expect(matches('creative.>', 'campaign.launched.v1')).toBe(false);
  });
});

describe('InMemoryEventBus', () => {
  it('delivers matching events and respects unsubscribe', async () => {
    const bus = new InMemoryEventBus();
    const received: string[] = [];
    const sub = await bus.subscribe('campaign.>', async (e) => {
      received.push(e.eventName);
    });

    await bus.publish(envelope('campaign.launched.v1'));
    await bus.publish(envelope('creative.generated.v1'));
    expect(received).toEqual(['campaign.launched.v1']);

    await sub.unsubscribe();
    await bus.publish(envelope('campaign.paused.v1'));
    expect(received).toEqual(['campaign.launched.v1']);
  });
});
