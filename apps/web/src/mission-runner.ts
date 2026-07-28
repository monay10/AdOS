/**
 * Mission runner — the shared, governed brief-generation step.
 *
 * The exact same governed path is used from two entry points, so both stop at the
 * same human approval gate (Book F Law 5):
 *   • the interactive `/missions/:id/brief` route, and
 *   • the {@link QueueWorker}, which runs an applied recommendation out of band.
 *
 * Reading the tenant from the ambient TenantContext (which both the HTTP request
 * and the worker establish) means neither entry point has to thread a Session in,
 * and all data access stays tenant-isolated. Generation is idempotent: if a prior
 * (possibly crashed) run already produced the brief and/or advanced the mission,
 * a re-run neither double-generates nor errors — it converges on the gate.
 */
import { ClientId, MissionId } from '@ados/agency-os';
import type { AppError } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import type { App } from './app.js';
import { t } from './i18n.js';
import type { JobOutcome } from './queue-worker.js';
import type { QueuedMission } from './mission-queue.js';

function tenantId(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}

/**
 * Generate the brief for a loaded mission (Company-Brain-grounded) and advance it
 * to the human approval gate. Idempotent — skips generation when a brief already
 * exists and only advances the mission when it is not already at the gate.
 */
export async function briefGenerateAndAdvance(
  app: App,
  id: string,
  mission: { clientId: string; brief: string; status: string; budget?: { amountMinor: number; currency: string; period: string } | undefined },
  client: { name: string; industry: string },
  brand: { profile: { voice: string; values: readonly string[] } },
  product: { name: string; description: string },
): Promise<{ isErr: false } | { isErr: true; error: AppError }> {
  // Idempotency: never produce a second brief for the same mission.
  const existing = (await app.briefs.list(id))[0];
  if (!existing) {
    // Performance Memory read-back: pull this vertical's aggregated past performance
    // from the Company Brain and inject it as descriptive context for the new brief.
    const past = await app.brain.marketing(client.industry);
    const historicalPerformance =
      past && past.sampleSize > 0
        ? t('brief.historicalContext', { n: past.sampleSize, vertical: client.industry, roas: past.roas.toFixed(1), ctr: past.ctr.toFixed(1) })
        : undefined;

    const generated = await app.briefs.generate({
      tenantId: tenantId(),
      missionId: id,
      clientId: mission.clientId,
      clientName: client.name,
      industry: client.industry,
      brandVoice: brand.profile.voice,
      brandValues: [...brand.profile.values],
      productName: product.name,
      productDescription: product.description,
      missionBrief: mission.brief,
      ...(mission.budget ? { budget: { amountMinor: mission.budget.amountMinor, currency: mission.budget.currency, period: mission.budget.period } } : {}),
      ...(historicalPerformance ? { historicalPerformance } : {}),
    });
    if (generated.isErr) return { isErr: true, error: generated.error };
  }

  // Advance the mission into the executive approval gate (idempotent by status).
  if (mission.status === 'submitted') await app.missions.plan(MissionId.of(id));
  if (mission.status !== 'awaiting_approval') await app.missions.requestApproval(MissionId.of(id), 'strategy_and_budget');
  return { isErr: false };
}

/**
 * The queue handler for an applied recommendation. Loads the mission and its
 * prereqs, then runs the governed brief step to the human gate. A missing mission
 * or missing brand/product is a non-retryable failure (retrying won't fix it); a
 * generation error carries its own retryable flag (transient AI unavailability is
 * retryable). Idempotent: a mission already at the gate is treated as done.
 */
export async function runApplyJob(app: App, job: QueuedMission): Promise<JobOutcome> {
  const found = await app.missions.get(MissionId.of(job.missionId));
  if (found.isErr) return { isErr: true, error: { retryable: false, message: found.error.message } };
  const mission = found.value;

  // Already at the gate with a brief → nothing to do (idempotent re-run).
  if (mission.status === 'awaiting_approval' && (await app.briefs.list(job.missionId)).length > 0) {
    return { isErr: false };
  }

  const clientRes = await app.clients.get(ClientId.of(mission.clientId));
  const brand = (await app.brands.list(mission.clientId))[0];
  const product = (await app.products.list(mission.clientId))[0];
  if (clientRes.isErr || !brand || !product) {
    return { isErr: true, error: { retryable: false, message: t('err.brandProductForBrief') } };
  }

  const outcome = await briefGenerateAndAdvance(app, job.missionId, mission, clientRes.value, brand, product);
  if (outcome.isErr) return { isErr: true, error: { retryable: outcome.error.retryable, message: outcome.error.message } };
  return { isErr: false };
}
