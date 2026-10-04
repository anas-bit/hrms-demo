import { parseISO, differenceInCalendarMonths } from 'date-fns';
import type { Branch, Employee, Holiday, LeaveAdjustment, LeaveRequest, LeaveType } from '../types';
import { daysBetween, isWorkingDay, overlaps } from '../lib/dates';

const roundHalf = (n: number) => Math.round(n * 2) / 2;

/** Leave a person is entitled to in a calendar year, prorated by join date and accrual rule. */
export function leaveEntitlement(type: LeaveType, employee: Pick<Employee, 'joinDate'>, year: number, today = new Date()): number {
    if (type.annualQuota <= 0) return 0;
    const join = parseISO(employee.joinDate);
    const yearStart = new Date(year, 0, 1);
    const startMonth = join > yearStart ? join.getMonth() : 0;
    if (join.getFullYear() > year) return 0;

    if (type.accrual === 'monthly') {
        const end = today.getFullYear() === year ? today.getMonth() + 1 : 12;
        const months = Math.max(0, end - startMonth);
        return roundHalf((type.annualQuota / 12) * months);
    }
    return roundHalf((type.annualQuota * (12 - startMonth)) / 12);
}

export interface LeaveBalance {
    entitled: number;
    adjusted: number;
    used: number;
    pending: number;
    available: number;
}

export function leaveBalance(
    employee: Pick<Employee, 'id' | 'joinDate'>,
    type: LeaveType,
    requests: LeaveRequest[],
    adjustments: LeaveAdjustment[],
    year = new Date().getFullYear(),
): LeaveBalance {
    const entitled = leaveEntitlement(type, employee, year);
    const inYear = (iso: string) => parseISO(iso).getFullYear() === year;
    const mine = requests.filter(r => r.employeeId === employee.id && r.leaveTypeId === type.id && inYear(r.from));
    const used = mine.filter(r => r.status === 'approved').reduce((s, r) => s + r.days, 0);
    const pending = mine.filter(r => r.status === 'pending').reduce((s, r) => s + r.days, 0);
    const adjusted = adjustments
        .filter(a => a.employeeId === employee.id && a.leaveTypeId === type.id && inYear(a.date))
        .reduce((s, a) => s + a.days, 0);
    return { entitled, adjusted, used, pending, available: entitled + adjusted - used - pending };
}

/** Number of leave days a request consumes, honouring weekend/holiday counting rules. */
export function countLeaveDays(
    from: string,
    to: string,
    duration: LeaveRequest['duration'],
    hours: number | undefined,
    type: Pick<LeaveType, 'countWeekends'>,
    branch: Pick<Branch, 'id' | 'weekendDays'> | undefined,
    holidays: Holiday[],
): number {
    if (duration === 'half') return 0.5;
    if (duration === 'hourly') return Math.round(((hours ?? 1) / 8) * 100) / 100;
    const days = daysBetween(from, to);
    return type.countWeekends ? days.length : days.filter(d => isWorkingDay(d, branch, holidays)).length;
}

export interface LeaveValidation { ok: boolean; errors: string[]; warnings: string[] }

export function validateLeave(input: {
    employeeId: string;
    leaveType: LeaveType;
    from: string;
    to: string;
    days: number;
    attachment?: string;
    balance: LeaveBalance;
    existing: LeaveRequest[];
    ignoreId?: string;
}): LeaveValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (input.to < input.from) errors.push('End date must be on or after the start date.');
    if (input.days <= 0) errors.push('The selected dates contain no working days.');
    const clash = input.existing.find(r =>
        r.id !== input.ignoreId &&
        r.employeeId === input.employeeId &&
        (r.status === 'pending' || r.status === 'approved') &&
        overlaps(r.from, r.to, input.from, input.to)
    );
    if (clash) errors.push(`Overlaps an existing ${clash.status} request (${clash.from} → ${clash.to}).`);
    if (input.leaveType.annualQuota > 0 && input.days > input.balance.available) {
        if (input.leaveType.allowNegative) warnings.push('This request will take the balance negative.');
        else errors.push(`Insufficient balance: ${input.balance.available} day(s) available.`);
    }
    if (input.leaveType.requiresDocumentAfterDays > 0 && input.days > input.leaveType.requiresDocumentAfterDays && !input.attachment) {
        errors.push(`A supporting document is required for more than ${input.leaveType.requiresDocumentAfterDays} day(s).`);
    }
    return { ok: errors.length === 0, errors, warnings };
}

export const monthsOfService = (joinDate: string, at = new Date()) => differenceInCalendarMonths(at, parseISO(joinDate));
