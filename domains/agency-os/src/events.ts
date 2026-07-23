/**
 * Agency Operating System — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const AGENCY_OS_EVENTS = {
  AGENCY_CLIENT_ONBOARDED_V1: 'agency.client.onboarded.v1',
  AGENCY_PROPOSAL_SENT_V1: 'agency.proposal.sent.v1',
  AGENCY_INVOICE_ISSUED_V1: 'agency.invoice.issued.v1',
  AGENCY_TICKET_OPENED_V1: 'agency.ticket.opened.v1',
} as const;

/** Event patterns this context subscribes to. */
export const AGENCY_OS_SUBSCRIPTIONS = [
  'exec.*',
  'analytics.report.generated.v1',
  'campaign.*',
] as const;
