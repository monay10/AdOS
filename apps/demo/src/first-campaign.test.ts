import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { DemoAIManager } from './demo-ai-manager.js';
import { runFirstCampaign } from './first-campaign.js';

describe('AdOS first-campaign acceptance flow', () => {
  it('runs the whole company end to end, fully offline, and delivers a CEO dashboard', async () => {
    const bus = new InMemoryEventBus();
    const result = await runFirstCampaign(
      { tenantId: 'bright-smiles', actor: 'owner@brightsmiles.example', clientName: 'Bright Smiles Dental' },
      new DemoAIManager(),
      bus,
    );

    // Every artifact in the chain was produced.
    expect(result.workspaceId).toBeTruthy();
    expect(result.clientId).toBeTruthy();
    expect(result.brandId).toBeTruthy();
    expect(result.productId).toBeTruthy();
    expect(result.missionId).toBeTruthy();
    expect(result.briefId).toBeTruthy();
    expect(result.creativeSetId).toBeTruthy();
    expect(result.campaignDraftId).toBeTruthy();
    expect(result.reportId).toBeTruthy();
    expect(result.executiveReportId).toBeTruthy();

    // The final deliverable: the CEO's verdict.
    expect(result.verdict).toBe('exceeded');

    // The choreography fired every key domain event, in flow order.
    const flowMarkers = [
      'workspace.created.v1',
      'client.created.v1',
      'brand.created.v1',
      'product.created.v1',
      'mission.submitted.v1',
      'intel.brief.generated.v1',
      'creative.generated.v1',
      'campaign.created.v1',
      'analytics.report.generated.v1',
      'exec.dashboard.generated.v1',
      'mission.completed.v1',
    ];
    const seenInOrder = result.events.filter((e) => flowMarkers.includes(e));
    expect(seenInOrder).toEqual(flowMarkers);
  });

  it('is deterministic — the same customer yields the same verdict', async () => {
    const run = () =>
      runFirstCampaign(
        { tenantId: 't', actor: 'a@example.com', clientName: 'Repeatable Co' },
        new DemoAIManager(),
      );
    const [a, b] = await Promise.all([run(), run()]);
    expect(a.verdict).toBe(b.verdict);
    expect(a.events).toEqual(b.events);
  });
});
