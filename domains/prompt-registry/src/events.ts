/**
 * Prompt Registry — event contract.
 */
export const PROMPT_REGISTRY_EVENTS = {
  PUBLISHED: 'prompt.published.v1',
  ACTIVATED: 'prompt.activated.v1',
  SCORED: 'prompt.scored.v1',
} as const;

export const PROMPT_REGISTRY_SUBSCRIPTIONS = [
  'analytics.*', // performance outcomes feed prompt scoring / A/B
  'creative.reviewed.v1',
] as const;
