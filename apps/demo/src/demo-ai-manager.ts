import type { AIManagerPort, AIStreamChunk, AITaskRequest, AITaskResult } from '@ados/contracts';

/**
 * Deterministic, fully-offline AI Manager for the acceptance demo. Keyed by the
 * prompt reference each service submits, it returns a canned-but-realistic
 * structured response so the whole company flow can run end to end with no
 * model, no network and no paid cloud service — proving the offline-first
 * constitution. In production this is the real @ados/ai-manager; the contract
 * (AIManagerPort) is identical, so nothing downstream changes.
 */
export class DemoAIManager implements AIManagerPort {
  private counter = 0;

  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    const output = this.respond(request);
    this.counter += 1;
    return {
      taskId: `demo-task-${this.counter}`,
      capability: request.capability,
      model: 'qwen3:32b',
      engine: 'ollama',
      output: output as T,
      usage: { promptTokens: 128, completionTokens: 256, totalTokens: 384 },
      latencyMs: 10,
      cached: false,
      attempts: [{ model: 'qwen3:32b', ok: true }],
    };
  }

  async *stream(): AsyncIterable<AIStreamChunk> {
    // streaming is not exercised by the demo
  }

  private respond(request: AITaskRequest): unknown {
    switch (request.promptRef?.key) {
      case 'marketing.brief':
        return {
          objective: 'Generate 120 qualified patient leads in the first month',
          targetAudience: 'Adults 25-45 within 10km who value appearance and health',
          positioning: 'The trusted neighborhood clinic for a confident smile',
          keyMessages: ['Painless whitening', 'Same-day results', 'Board-certified dentists'],
          recommendedChannels: ['meta', 'google_ads'],
          budgetAllocation: [
            { channel: 'meta', percentage: 60 },
            { channel: 'google_ads', percentage: 40 },
          ],
          kpis: [{ name: 'leads', target: 120, unit: 'count' }],
        };
      case 'creative.set':
        return {
          headline: 'A Brighter Smile in One Visit',
          adCopy: 'Professional whitening from dentists you can trust. Book today.',
          cta: 'Book your appointment',
          socialPost: 'Say hello to your brightest smile ✨ Same-day whitening now available!',
          landingPage: {
            headline: 'Confident Smiles, Same Day',
            body: 'Our board-certified dentists deliver painless, professional whitening.',
            cta: 'Reserve your slot',
          },
          email: { subject: 'Your brighter smile is one visit away', body: 'Book your same-day whitening today.' },
        };
      case 'campaign.draft':
        return {
          name: 'Bright Smiles — Launch',
          objective: 'Lead generation',
          channels: [
            {
              channel: 'meta',
              budgetPercentage: 60,
              adSets: [
                {
                  name: 'Meta — Local Adults',
                  audience: 'Adults 25-45 within 10km',
                  headline: 'A Brighter Smile in One Visit',
                  primaryText: 'Professional whitening from dentists you can trust.',
                  cta: 'Book your appointment',
                },
              ],
            },
            {
              channel: 'google_ads',
              budgetPercentage: 40,
              adSets: [
                {
                  name: 'Search — Whitening Intent',
                  audience: 'People searching teeth whitening near me',
                  headline: 'Same-Day Teeth Whitening',
                  primaryText: 'Board-certified dentists. Book today.',
                  cta: 'Book now',
                },
              ],
            },
          ],
          schedule: { startHint: 'clinic opening week', durationDays: 30 },
        };
      case 'analytics.report':
        return {
          summary: 'The campaign beat its lead goal and returned 3x on spend.',
          highlights: ['ROAS of 3x', 'CTR above 2%', '130 leads vs 120 target'],
          recommendations: ['Scale Meta budget by 20%', 'Test new search keywords'],
        };
      case 'executive.dashboard':
        return {
          headline: 'Mission exceeded target: 3x ROAS, 130 leads',
          executiveSummary: 'The launch campaign beat its lead goal and returned 3x on spend.',
          verdict: 'exceeded',
          keyResults: [
            { metric: 'ROAS', value: 3, unit: 'x', verdict: 'exceeded' },
            { metric: 'Leads', value: 130, unit: 'count', verdict: 'exceeded' },
          ],
          decisions: ['Approve a 20% budget increase for month two'],
          nextActions: ['Brief the Creative Studio on a retention email series'],
        };
      default:
        return {};
    }
  }
}
