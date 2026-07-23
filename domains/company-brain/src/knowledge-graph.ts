import type { GraphEdge, GraphNode, KnowledgeGraphPort } from '@ados/contracts';

/**
 * In-memory Knowledge Graph connecting the company's world:
 * Customer → Brand → Product → Campaign → Ad → Lead → Sale → ROI →
 * Department → Employee → Task → Workflow.
 *
 * A production adapter can back this with a real graph store; the port is the
 * same so business logic never changes.
 */
export class InMemoryKnowledgeGraph implements KnowledgeGraphPort {
  private readonly nodes = new Map<string, GraphNode>();
  private readonly edges: GraphEdge[] = [];

  async upsertNode(node: GraphNode): Promise<void> {
    const existing = this.nodes.get(node.id);
    this.nodes.set(node.id, existing ? { ...existing, ...node, props: { ...existing.props, ...node.props } } : node);
  }

  async relate(edge: GraphEdge): Promise<void> {
    const dup = this.edges.some((e) => e.from === edge.from && e.to === edge.to && e.relation === edge.relation);
    if (!dup) this.edges.push(edge);
  }

  async neighbors(nodeId: string, relation?: string): Promise<GraphNode[]> {
    const ids = this.edges
      .filter((e) => e.from === nodeId && (relation === undefined || e.relation === relation))
      .map((e) => e.to);
    return ids.map((id) => this.nodes.get(id)).filter((n): n is GraphNode => n !== undefined);
  }

  async query(input: { type?: string; where?: Record<string, unknown> }): Promise<GraphNode[]> {
    return [...this.nodes.values()].filter((n) => {
      if (input.type && n.type !== input.type) return false;
      if (input.where) {
        for (const [k, v] of Object.entries(input.where)) {
          if (n.props[k] !== v) return false;
        }
      }
      return true;
    });
  }
}
