/**
 * Executive Memory System — event contract.
 * The Reflection Loop: after each task, analytics + decision flow back into the
 * relevant executive memory and the Company Brain.
 */
export const EXECUTIVE_MEMORY_EVENTS = {
  MEMORY_UPDATED: 'exec.memory.updated.v1',
  DECISION_JOURNALED: 'exec.decision.journaled.v1',
  CONSTITUTION_REJECTED: 'exec.constitution.rejected.v1',
  BOARD_MINUTES_PUBLISHED: 'exec.board.minutes.v1',
} as const;

export const EXECUTIVE_MEMORY_SUBSCRIPTIONS = [
  'campaign.*',
  'analytics.*',
  'cos.decision.logged.v1',
  'mission.*',
] as const;
