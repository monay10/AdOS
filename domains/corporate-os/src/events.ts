/**
 * Corporate Operating System — event contract.
 * The COS integrates with the rest of AdOS exclusively through these events.
 */
export const CORPORATE_OS_EVENTS = {
  SOP_STARTED: 'cos.sop.started.v1',
  SOP_STEP_COMPLETED: 'cos.sop.step.completed.v1',
  SOP_COMPLETED: 'cos.sop.completed.v1',
  QUALITY_FAILED: 'cos.quality.failed.v1',
  COMPLIANCE_REJECTED: 'cos.compliance.rejected.v1',
  APPROVAL_REQUIRED: 'cos.approval.required.v1',
  RISK_ESCALATED: 'cos.risk.escalated.v1',
  DECISION_LOGGED: 'cos.decision.logged.v1',
  SOP_IMPROVED: 'cos.sop.improved.v1',
} as const;

export const CORPORATE_OS_SUBSCRIPTIONS = [
  'mission.*',
  'campaign.*',
  'creative.*',
  'analytics.*',
  'exec.*',
] as const;
