/**
 * Company Brain — event contract. The brain listens broadly (every completed
 * task is a chance to learn) and announces when knowledge materially changes.
 */
export const COMPANY_BRAIN_EVENTS = {
  BRAIN_ENRICHED: 'brain.enriched.v1',
  EXPERIENCE_RECORDED: 'brain.experience.recorded.v1',
  PATTERN_CAPTURED: 'brain.pattern.captured.v1',
  DNA_UPDATED: 'brain.dna.updated.v1',
} as const;

export const COMPANY_BRAIN_SUBSCRIPTIONS = [
  'campaign.*',
  'creative.*',
  'analytics.*',
  'cos.sop.completed.v1',
  'cos.decision.logged.v1',
  'exec.*',
] as const;
