/**
 * Knowledge Engine — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const KNOWLEDGE_ENGINE_EVENTS = {
  KNOWLEDGE_INGESTED_V1: 'knowledge.ingested.v1',
  KNOWLEDGE_INDEXED_V1: 'knowledge.indexed.v1',
  KNOWLEDGE_UPDATED_V1: 'knowledge.updated.v1',
} as const;

/** Event patterns this context subscribes to. */
export const KNOWLEDGE_ENGINE_SUBSCRIPTIONS = [
  'connector.*',
  'campaign.*',
  'creative.*',
] as const;
