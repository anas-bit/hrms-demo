import type {
    AttendanceRecord, Branch, Employee, Holiday, LeaveRequest, LeaveType, PayLine,
    PayrollAdjustment, Payslip, SalaryComponent, Shift,
} from '../types';
import type { HrmsSettings, TaxSlab } from '../store';
import { monthDays, isWorkingDay } from '../lib/dates';

/** Annual income tax from progressive slabs (`fixed + rate × (income − over)`). */
export function annualTax(income: number, slabs: TaxSlab[]): number {
    for (const slab of slabs) {
        if (slab.upTo === null || income <= slab.upTo) {
            return Math.max(0, slab.fixed + slab.rate * (income - slab.over));
        }
    }
    return 0;
}

export interface PayslipContext {
    employee: Employee;
    period: string;
    runId: string;
    components: SalaryComponent[];
    attendance: AttendanceRecord[];
    leaveRequests: LeaveRequest[];
    leaveTypes: LeaveType[];
    adjustments: PayrollAdjustment[];
    branch?: Branch;
    holidays: Holiday[];
    shift?: Shift;
    settings: Pick<HrmsSettings, 'overtimeMultiplier' | 'latesPerDeductionDay' | 'taxSlabs' | 'workingDaysPerMonth'>;
    loanDeduction?: number;
}

const r = (n: number) => Math.round(n);

export function computePayslip(ctx: PayslipContext): Payslip {
    const { employee: e, period, settings } = ctx;
    const days = monthDays(period);
    const working = days.filter(d => isWorkingDay(d, ctx.branch, ctx.holidays));
    const employed = working.filter(d => d >= e.joinDate && (!e.exitDate || d <= e.exitDate));
    const notEmployedDays = working.length - employed.length;

    const att = ctx.attendance.filter(a => a.employeeId === e.id && a.date.startsWith(period));
    const absentDays = att.filter(a => a.status === 'absent').length;
    const lateCount = att.filter(a => a.status === 'late').length;
    const lateDeductionDays = settings.latesPerDeductionDay > 0 ? Math.floor(lateCount / settings.latesPerDeductionDay) * 0.5 : 0;
    const overtimeMinutes = att.reduce((s, a) => s + a.overtimeMinutes, 0);

    const unpaidTypes = new Set(ctx.leaveTypes.filter(t => !t.paid).map(t => t.id));
    const unpaidLeaveDays = ctx.leaveRequests
        .filter(l => l.employeeId === e.id && l.status === 'approved' && unpaidTypes.has(l.leaveTypeId))
        .reduce((sum, l) => {
            if (l.duration !== 'full') return l.from.startsWith(period) ? sum + l.days : sum;
            return sum + employed.filter(d => d >= l.from && d <= l.to).length;
        }, 0);

    const basic = e.basicSalary;
    const earnings: PayLine[] = [{ code: 'BASIC', name: 'Basic salary', amount: basic }];
    const deductions: PayLine[] = [];
    let taxable = basic;

    for (const c of ctx.components.filter(c => c.active)) {
        const amount = r(c.calc === 'fixed' ? c.value : (basic * c.value) / 100);
        if (!amount) continue;
        if (c.kind === 'earning') {
            earnings.push({ code: c.code, name: c.name, amount });
            if (c.taxable) taxable += amount;
        } else {
            deductions.push({ code: c.code, name: c.name, amount });
        }
    }

    if (ctx.shift?.allowance) {
        earnings.push({ code: 'SHIFT', name: `${ctx.shift.name} allowance`, amount: ctx.shift.allowance });
        taxable += ctx.shift.allowance;
    }

    const hourly = basic / (settings.workingDaysPerMonth * 8);
    const overtimeHours = Math.round((overtimeMinutes / 60) * 10) / 10;
    if (overtimeHours > 0) {
        const ot = r(overtimeHours * hourly * settings.overtimeMultiplier);
        earnings.push({ code: 'OT', name: `Overtime (${overtimeHours}h)`, amount: ot });
        taxable += ot;
    }

    for (const adj of ctx.adjustments.filter(a => a.employeeId === e.id && a.period === period)) {
        if (adj.kind === 'deduction') {
            deductions.push({ code: 'ADJ', name: adj.note || 'Adjustment', amount: adj.amount });
        } else {
            earnings.push({ code: adj.kind.toUpperCase(), name: adj.note || adj.kind, amount: adj.amount });
            taxable += adj.amount;
        }
    }

    const grossFixed = earnings.filter(l => l.code !== 'OT').reduce((s, l) => s + l.amount, 0);
    const dailyRate = grossFixed / settings.workingDaysPerMonth;
    const lossDays = unpaidLeaveDays + absentDays + lateDeductionDays + notEmployedDays;
    if (lossDays > 0) {
        deductions.push({ code: 'LOP', name: `Loss of pay (${lossDays} day${lossDays === 1 ? '' : 's'})`, amount: r(dailyRate * lossDays) });
        taxable = Math.max(0, taxable - dailyRate * lossDays);
    }

    if (ctx.loanDeduction) deductions.push({ code: 'LOAN', name: 'Loan / advance installment', amount: r(ctx.loanDeduction) });

    const tax = r(annualTax(taxable * 12, settings.taxSlabs) / 12);
    if (tax > 0) deductions.push({ code: 'TAX', name: 'Income tax', amount: tax });

    const gross = earnings.reduce((s, l) => s + l.amount, 0);
    const totalDeductions = deductions.reduce((s, l) => s + l.amount, 0);

    return {
        id: `${ctx.runId}-${e.id}`,
        runId: ctx.runId,
        employeeId: e.id,
        period,
        basic,
        earnings,
        deductions,
        workingDays: working.length,
        paidDays: Math.max(0, working.length - lossDays),
        unpaidLeaveDays,
        overtimeHours,
        gross,
        totalDeductions,
        net: Math.max(0, gross - totalDeductions),
        paymentStatus: 'unpaid',
    };
}
