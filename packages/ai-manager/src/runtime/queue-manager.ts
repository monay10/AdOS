import { randomUUID } from 'node:crypto';
import type { AITaskGraph, AITaskGraphPort } from '@ados/contracts';
import type { AITaskRequest, QueueManagerPort } from '../ports.js';

/**
 * Workflow Runtime — Queue Manager. A simple, fair FIFO queue for AI tasks with
 * a bounded concurrency drain. Backpressure is observable via depth(); the
 * Resource Scheduler enforces actual concurrency during execution.
 */
export class InMemoryQueueManager implements QueueManagerPort {
  private readonly queue: Array<{ taskId: string; request: AITaskRequest }> = [];

  async enqueue(request: AITaskRequest): Promise<{ taskId: string; position: number }> {
    const taskId = request.idempotencyKey ?? randomUUID();
    this.queue.push({ taskId, request });
    return { taskId, position: this.queue.length };
  }

  async depth(): Promise<number> {
    return this.queue.length;
  }

  /** Pull the next task (FIFO), or undefined when empty. */
  dequeue(): { taskId: string; request: AITaskRequest } | undefined {
    return this.queue.shift();
  }
}

/**
 * Workflow Runtime — Task Graph. A mission is a DAG of capability invocations;
 * this validates acyclicity and returns a topological execution order (Kahn's
 * algorithm), which the AI Pipeline / Workflow Engine executes respecting
 * dependencies.
 */
export class TopologicalTaskGraph implements AITaskGraphPort {
  validate(graph: AITaskGraph): { ok: true; order: string[] } | { ok: false; error: string } {
    const ids = new Set(graph.nodes.map((n) => n.id));
    const indegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const node of graph.nodes) {
      indegree.set(node.id, indegree.get(node.id) ?? 0);
      for (const dep of node.dependsOn) {
        if (!ids.has(dep)) return { ok: false, error: `node "${node.id}" depends on unknown node "${dep}"` };
        adj.set(dep, [...(adj.get(dep) ?? []), node.id]);
        indegree.set(node.id, (indegree.get(node.id) ?? 0) + 1);
      }
    }

    const ready = [...indegree.entries()].filter(([, d]) => d === 0).map(([id]) => id);
    const order: string[] = [];
    while (ready.length > 0) {
      const id = ready.shift()!;
      order.push(id);
      for (const next of adj.get(id) ?? []) {
        const d = (indegree.get(next) ?? 0) - 1;
        indegree.set(next, d);
        if (d === 0) ready.push(next);
      }
    }

    if (order.length !== graph.nodes.length) return { ok: false, error: 'cycle detected in task graph' };
    return { ok: true, order };
  }
}
