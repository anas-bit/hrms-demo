import type { ApprovalStep, Employee, WorkflowRule } from '../types';

/** Builds the approval chain for a request from its workflow rule and request size. */
export function buildApprovalChain(
    rule: WorkflowRule | undefined,
    employee: Pick<Employee, 'managerId'>,
    metric: { days?: number; amount?: number } = {},
): ApprovalStep[] {
    const levels = [...(rule?.active === false ? [] : rule?.levels ?? ['manager' as const])];
    if (rule?.condition) {
        const v = metric[rule.condition.field];
        const hit = v !== undefined && (rule.condition.op === '>' ? v > rule.condition.value : v >= rule.condition.value);
        if (hit && !levels.includes(rule.condition.extraLevel)) levels.push(rule.condition.extraLevel);
    }
    const chain = levels
        .filter(role => role !== 'manager' || !!employee.managerId)
        .map((role, i): ApprovalStep => ({
            level: i + 1,
            role,
            approverId: role === 'manager' ? employee.managerId : undefined,
            status: 'pending',
        }));
    // Nobody to approve (e.g. CEO with no manager) — fall back to HR
    return chain.length ? chain : [{ level: 1, role: 'hr', status: 'pending' }];
}

export const currentStep = (steps: ApprovalStep[]) => steps.find(s => s.status === 'pending');

export function approvedChain(steps: ApprovalStep[], at: string, approverId?: string): ApprovalStep[] {
    return steps.map(s => ({ ...s, status: 'approved', actedAt: at, approverId: s.approverId ?? approverId }));
}
