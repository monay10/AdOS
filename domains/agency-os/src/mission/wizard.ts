import { type Result, ValidationError, err } from '@ados/kernel';
import type { MissionApprovalGate } from '@ados/contracts';
import {
  Mission,
  type MissionBudget,
  type MissionTargetMetric,
  validateMission,
} from './mission.js';

/** The ordered steps a client walks through to state a Mission. */
export type MissionWizardStep = 'context' | 'objective' | 'budget' | 'target' | 'review';

export const MISSION_WIZARD_STEPS: readonly MissionWizardStep[] = [
  'context',
  'objective',
  'budget',
  'target',
  'review',
];

interface WizardState {
  tenantId?: string;
  workspaceId?: string;
  clientId?: string;
  createdBy?: string;
  projectId?: string;
  brief?: string;
  budget?: MissionBudget;
  targetMetric?: MissionTargetMetric;
  deadline?: string;
  approvalGates?: MissionApprovalGate[];
}

/**
 * Mission Wizard — a step-by-step builder that guides a client from raw context
 * to a validated Mission. The user never sees agents or channels; they answer a
 * few questions and the wizard assembles a Mission the AI Company can run.
 *
 * Immutable: every step returns a new wizard, so a UI can navigate steps freely.
 */
export class MissionWizard {
  private constructor(private readonly state: WizardState) {}

  static start(context: { tenantId: string; workspaceId: string; clientId: string; createdBy: string }): MissionWizard {
    return new MissionWizard({ ...context });
  }

  /** Step: the business objective in the user's own words. */
  withObjective(brief: string): MissionWizard {
    return new MissionWizard({ ...this.state, brief });
  }

  /** Step: how much the client is willing to spend. */
  withBudget(budget: MissionBudget): MissionWizard {
    return new MissionWizard({ ...this.state, budget });
  }

  /** Step: the metric the mission is trying to move. */
  withTarget(targetMetric: MissionTargetMetric): MissionWizard {
    return new MissionWizard({ ...this.state, targetMetric });
  }

  withDeadline(deadline: string): MissionWizard {
    return new MissionWizard({ ...this.state, deadline });
  }

  withApprovalGates(gates: MissionApprovalGate[]): MissionWizard {
    return new MissionWizard({ ...this.state, approvalGates: gates });
  }

  /** Optional: associate the mission with an owning Project. */
  withProject(projectId: string): MissionWizard {
    return new MissionWizard({ ...this.state, projectId });
  }

  /** Which step the user is currently on (first incomplete step). */
  currentStep(): MissionWizardStep {
    if (!this.state.tenantId || !this.state.workspaceId || !this.state.clientId || !this.state.createdBy) return 'context';
    if (!this.state.brief || this.state.brief.trim().length < 10) return 'objective';
    if (!this.state.budget) return 'budget';
    if (!this.state.targetMetric) return 'target';
    return 'review';
  }

  /** Validate everything collected so far without building the aggregate. */
  validate(): Result<void, ValidationError> {
    if (!this.state.tenantId || !this.state.workspaceId || !this.state.clientId || !this.state.createdBy) {
      return err(new ValidationError('wizard context is incomplete', { details: { step: 'context' } }));
    }
    if (this.state.brief === undefined) {
      return err(new ValidationError('objective is required', { details: { step: 'objective' } }));
    }
    return validateMission({
      tenantId: this.state.tenantId,
      workspaceId: this.state.workspaceId,
      clientId: this.state.clientId,
      createdBy: this.state.createdBy,
      brief: this.state.brief,
      ...(this.state.budget ? { budget: this.state.budget } : {}),
      ...(this.state.targetMetric ? { targetMetric: this.state.targetMetric } : {}),
    });
  }

  /** Finalize the wizard into a submitted Mission aggregate. */
  build(): Result<Mission, ValidationError> {
    const valid = this.validate();
    if (valid.isErr) return err(valid.error);
    return Mission.submit({
      tenantId: this.state.tenantId!,
      workspaceId: this.state.workspaceId!,
      clientId: this.state.clientId!,
      createdBy: this.state.createdBy!,
      ...(this.state.projectId ? { projectId: this.state.projectId } : {}),
      brief: this.state.brief!,
      ...(this.state.budget ? { budget: this.state.budget } : {}),
      ...(this.state.targetMetric ? { targetMetric: this.state.targetMetric } : {}),
      ...(this.state.deadline ? { deadline: this.state.deadline } : {}),
      ...(this.state.approvalGates ? { approvalGates: this.state.approvalGates } : {}),
    });
  }
}
