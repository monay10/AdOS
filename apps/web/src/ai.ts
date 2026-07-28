import type { AIManagerPort, AIStreamChunk, AITaskRequest, AITaskResult } from '@ados/contracts';

/**
 * Offline AI Manager for the web app.
 *
 * The Product Constitution says only the AI Manager talks to models. In
 * production you inject the real @ados/ai-manager (which routes to a local
 * Ollama / vLLM engine). For the pilot to run with no model server attached —
 * and for deterministic tests — this implementation produces a well-formed,
 * schema-valid response from the task variables. It is a drop-in AIManagerPort,
 * so nothing downstream changes when the real manager is swapped in.
 */
export class OfflineAIManager implements AIManagerPort {
  private counter = 0;

  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    this.counter += 1;
    const output = this.respond(request);
    return {
      taskId: `offline-${this.counter}`,
      capability: request.capability,
      model: 'offline-deterministic',
      engine: 'ollama',
      output: output as T,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs: 1,
      cached: false,
      attempts: [{ model: 'offline-deterministic', ok: true }],
    };
  }

  async *stream(): AsyncIterable<AIStreamChunk> {
    // streaming is not used by the web app
  }

  private respond(request: AITaskRequest): unknown {
    const v = request.variables ?? {};
    if (request.promptRef?.key === 'marketing.brief') {
      return this.marketingBrief(v);
    }
    if (request.promptRef?.key === 'creative.set') {
      return this.creativeSet(v);
    }
    if (request.promptRef?.key === 'campaign.draft') {
      return this.campaignDraft(v);
    }
    if (request.promptRef?.key === 'analytics.report') {
      return this.analyticsReport(v);
    }
    if (request.promptRef?.key === 'executive.dashboard') {
      return this.executiveDashboard(v);
    }
    return {};
  }

  private marketingBrief(v: Record<string, unknown>): unknown {
    const product = str(v['productName'], 'the product');
    const client = str(v['clientName'], 'the client');
    const voice = str(v['brandVoice'], 'professional');
    const audience = str(v['brandValues'] && Array.isArray(v['brandValues']) ? '' : '', '');
    const objective = str(v['missionBrief'], `Grow demand for ${product}`);
    const values = Array.isArray(v['brandValues']) ? (v['brandValues'] as unknown[]).map(String) : [];

    const keyMessages = [
      `Why ${product} is the right choice`,
      `The ${voice} promise of ${client}`,
      values.length ? `Grounded in ${values[0]}` : 'Proven results',
    ];
    // Performance Memory context, when present, flows into the brief so the
    // generation is grounded in the organization's own past results.
    const historical = str(v['historicalPerformance'], '');
    if (historical) keyMessages.push(historical);

    return {
      objective: `Deliver on: ${objective}`,
      targetAudience: audience || `People who would buy ${product} from ${client}`,
      positioning: `${product} — ${voice} and built on ${values.length ? values.join(', ') : 'trust and quality'}.`,
      keyMessages,
      recommendedChannels: ['meta', 'google_ads'],
      budgetAllocation: [
        { channel: 'meta', percentage: 60 },
        { channel: 'google_ads', percentage: 40 },
      ],
      kpis: [
        { name: 'leads', target: 100, unit: 'count' },
        { name: 'cpl', target: 50, unit: 'currency_minor' },
      ],
    };
  }

  private creativeSet(v: Record<string, unknown>): unknown {
    const product = str(v['productName'], 'the product');
    const voice = str(v['brandVoice'], 'professional');
    const messages = Array.isArray(v['keyMessages']) ? (v['keyMessages'] as unknown[]).map(String) : [];
    const lead = messages[0] ?? `Discover ${product}`;

    return {
      headline: `${product}: ${lead}`,
      adCopy: `${lead}. A ${voice} choice you can trust — ${messages[1] ?? 'made for you'}.`,
      cta: 'Get started',
      socialPost: `✨ ${lead}! ${product} is here. ${messages[1] ?? ''}`.trim(),
      landingPage: {
        headline: `${product}, done right`,
        body: `${lead}. Our ${voice} team delivers ${messages.length ? messages.join(', ') : 'real results'}.`,
        cta: 'Book your spot',
      },
      email: {
        subject: `Meet ${product}`,
        body: `${lead}. Reply to get started with ${product} today.`,
      },
    };
  }

  private campaignDraft(v: Record<string, unknown>): unknown {
    const objective = str(v['objective'], 'Grow demand');
    const audience = str(v['targetAudience'], 'the target audience');
    const headline = str(v['headline'], 'Discover more');
    const adCopy = str(v['adCopy'], 'A choice you can trust.');
    const cta = str(v['cta'], 'Get started');

    const allocation = Array.isArray(v['budgetAllocation'])
      ? (v['budgetAllocation'] as Array<{ channel?: unknown; percentage?: unknown }>)
      : [];
    const channelsSource = allocation.length
      ? allocation.map((a) => ({ channel: String(a.channel ?? 'meta'), percentage: Number(a.percentage ?? 100) }))
      : [{ channel: 'meta', percentage: 100 }];

    return {
      name: `${objective.slice(0, 40)} — launch`,
      objective,
      channels: channelsSource.map((ch) => ({
        channel: ch.channel,
        budgetPercentage: ch.percentage,
        adSets: [
          {
            name: `${ch.channel} — primary`,
            audience,
            headline,
            primaryText: adCopy,
            cta,
          },
        ],
      })),
      schedule: { startHint: 'launch week', durationDays: 30 },
    };
  }

  private analyticsReport(v: Record<string, unknown>): unknown {
    const kpis = Array.isArray(v['kpis'])
      ? (v['kpis'] as Array<{ name?: unknown; value?: unknown; unit?: unknown }>)
      : [];
    const byName = (n: string): number => Number(kpis.find((k) => String(k.name) === n)?.value ?? 0);
    const roas = byName('roas');
    const roi = byName('roi');
    const ctr = byName('ctr');
    const leads = Number(v['leads'] ?? 0);

    const verdict = roas >= 1 ? 'delivered a positive return' : 'is below break-even';
    return {
      summary: `The campaign ${verdict}: ${roas}x ROAS, ${roi}% ROI, ${ctr}% CTR, ${leads} leads.`,
      highlights: [
        `ROAS of ${roas}x`,
        `Click-through rate of ${ctr}%`,
        `${leads} leads generated`,
      ],
      recommendations:
        roas >= 1
          ? ['Scale the best-performing channel by 20%', 'Reallocate budget away from the weakest ad set', 'Test new creative variants against the current winner']
          : ['Pause the weakest channel', 'Tighten targeting to the highest-intent audience', 'Revise the offer and creative before scaling'],
    };
  }

  private executiveDashboard(v: Record<string, unknown>): unknown {
    const client = str(v['clientName'], 'the client');
    const objective = str(v['objective'], 'the mission objective');
    const kpis = Array.isArray(v['kpis'])
      ? (v['kpis'] as Array<{ name?: unknown; value?: unknown; unit?: unknown }>)
      : [];
    const byName = (n: string): number => Number(kpis.find((k) => String(k.name) === n)?.value ?? 0);
    const roas = byName('roas');
    const roi = byName('roi');
    const verdict = roas >= 2 ? 'exceeded' : roas >= 1 ? 'on_track' : 'at_risk';
    const verdictLabel = verdict === 'exceeded' ? 'target exceeded' : verdict === 'on_track' ? 'on track' : 'at risk';
    const summary = str(v['reportSummary'], `The mission returned ${roas}x ROAS and ${roi}% ROI.`);
    const recs = Array.isArray(v['reportRecommendations']) ? (v['reportRecommendations'] as unknown[]).map(String) : [];
    const won = roas >= 1;

    return {
      headline: `${client}: ${objective} — ${verdictLabel} at ${roas}x ROAS`,
      executiveSummary: summary,
      verdict,
      keyResults: kpis.map((k) => ({
        metric: String(k.name),
        value: Number(k.value ?? 0),
        unit: String(k.unit ?? ''),
        verdict: String(k.name) === 'roas' ? verdictLabel : 'measured',
      })),
      decisions: [
        won ? 'Continue investing in the winning channel mix' : 'Hold spend until the offer is reworked',
        'Record the outcome to the Company Brain so the company compounds what it learns',
      ],
      nextActions: recs.length ? recs : ['Review the analytics report with the client'],
    };
  }
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
