import { randomUUID } from 'node:crypto';
import type { DomainEventEnvelope } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import type { AiEventPublisherPort, AITaskRequest, AITaskResult } from '../ports.js';

/**
 * Event Runtime — emits the AI task lifecycle onto the event bus so the rest of
 * the company can react (Constitution: nothing happens silently). Durability,
 * replay, dead-letter and redelivery are provided by the NATS JetStream adapter
 * behind the EventBus port; this publisher only produces the envelopes.
 */
export class BusEventPublisher implements AiEventPublisherPort {
  constructor(private readonly bus: EventBus, private readonly now: () => string = () => new Date().toISOString()) {}

  async taskSubmitted(taskId: string, request: AITaskRequest): Promise<void> {
    await this.bus.publish(this.envelope('ai.task.submitted.v1', taskId, { capability: request.capability, submittedBy: request.submittedBy }));
  }

  async taskCompleted(result: AITaskResult): Promise<void> {
    await this.bus.publish(
      this.envelope('ai.task.completed.v1', result.taskId, {
        model: result.model,
        engine: result.engine,
        capability: result.capability,
        usage: result.usage,
        latencyMs: result.latencyMs,
        cached: result.cached,
      }),
    );
  }

  async taskFailed(taskId: string, error: string): Promise<void> {
    await this.bus.publish(this.envelope('ai.task.failed.v1', taskId, { error }));
  }

  private envelope(eventName: string, aggregateId: string, payload: Record<string, unknown>): DomainEventEnvelope {
    const ctx = TenantContext.current();
    const eventId = randomUUID();
    return {
      eventName,
      aggregateId,
      payload,
      metadata: {
        eventId,
        occurredAt: this.now(),
        tenantId: ctx?.tenantId ?? 'public',
        correlationId: ctx?.correlationId ?? eventId,
        causationId: aggregateId,
        actor: ctx?.actor,
      },
    };
  }
}
