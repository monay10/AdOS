import { randomUUID } from 'node:crypto';
import { AggregateRoot, DomainEvent, Identifier } from '@ados/kernel';
import { ANALYTICS_ENGINE_EVENTS } from '../events.js';
import type { CampaignMetrics, ComputedKpi } from './kpi.js';

/** Strongly-typed Campaign Report identifier. */
export class CampaignReportId extends Identifier {
  static of(value?: string): CampaignReportId {
    return new CampaignReportId(value ?? randomUUID());
  }
}

/** The AI-generated narrative layered on top of the deterministic KPIs. */
export interface ReportNarrative {
  summary: string;
  highlights: string[];
  recommendations: string[];
}

/** Provenance for AI Determinism — reproducible/auditable generation. */
export interface AIProvenance {
  taskId: string;
  capability: string;
  model: string;
  engine: string;
  latencyMs: number;
}

export interface CampaignReportProps {
  tenantId: string;
  missionId: string;
  clientId: string;
  campaignDraftId: string;
  metrics: CampaignMetrics;
  kpis: ComputedKpi[];
  narrative: ReportNarrative;
  provenance: AIProvenance;
}

export class ReportGenerated extends DomainEvent<{
  missionId: string;
  clientId: string;
  campaignDraftId: string;
  roas: number;
  tenantId: string;
}> {
  readonly eventName = ANALYTICS_ENGINE_EVENTS.ANALYTICS_REPORT_GENERATED_V1;
}

/**
 * Campaign Report — the single output of the Analytics sprint. Deterministic
 * KPIs (CTR/CPC/CPA/CPL/ROAS/ROI) plus an AI-generated narrative and
 * recommendations, with provenance so the narrative is reproducible.
 */
export class CampaignReport extends AggregateRoot<CampaignReportId> {
  private constructor(id: CampaignReportId, private readonly props: CampaignReportProps) {
    super(id);
  }

  static generate(input: {
    metrics: CampaignMetrics;
    kpis: ComputedKpi[];
    narrative: ReportNarrative;
    provenance: AIProvenance;
    id?: string;
  }): CampaignReport {
    const report = new CampaignReport(CampaignReportId.of(input.id), {
      tenantId: input.metrics.tenantId,
      missionId: input.metrics.missionId,
      clientId: input.metrics.clientId,
      campaignDraftId: input.metrics.campaignDraftId,
      metrics: input.metrics,
      kpis: input.kpis,
      narrative: input.narrative,
      provenance: input.provenance,
    });
    const roas = input.kpis.find((k) => k.name === 'roas')?.value ?? 0;
    report.addDomainEvent(
      new ReportGenerated(
        report.id.toString(),
        {
          missionId: input.metrics.missionId,
          clientId: input.metrics.clientId,
          campaignDraftId: input.metrics.campaignDraftId,
          roas,
          tenantId: input.metrics.tenantId,
        },
        { tenantId: input.metrics.tenantId },
      ),
    );
    return report;
  }

  /** Rehydrate from persistence without emitting events. */
  static restore(id: string, props: CampaignReportProps): CampaignReport {
    return new CampaignReport(CampaignReportId.of(id), props);
  }

  get tenantId(): string {
    return this.props.tenantId;
  }
  get missionId(): string {
    return this.props.missionId;
  }
  get campaignDraftId(): string {
    return this.props.campaignDraftId;
  }
  get kpis(): readonly ComputedKpi[] {
    return this.props.kpis;
  }
  get narrative(): ReportNarrative {
    return this.props.narrative;
  }
  get provenance(): AIProvenance {
    return this.props.provenance;
  }

  kpi(name: string): number | undefined {
    return this.props.kpis.find((k) => k.name === name)?.value;
  }

  snapshot(): CampaignReportProps {
    return {
      ...this.props,
      metrics: { ...this.props.metrics, spend: { ...this.props.metrics.spend }, revenue: { ...this.props.metrics.revenue } },
      kpis: this.props.kpis.map((k) => ({ ...k })),
      narrative: {
        summary: this.props.narrative.summary,
        highlights: [...this.props.narrative.highlights],
        recommendations: [...this.props.narrative.recommendations],
      },
      provenance: { ...this.props.provenance },
    };
  }
}
