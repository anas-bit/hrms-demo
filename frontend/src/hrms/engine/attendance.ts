import type { AttendanceSession, AttendanceStatus, Shift } from '../types';
import { toMin } from '../lib/dates';

export const shiftLengthMinutes = (shift: Pick<Shift, 'start' | 'end'>) => {
    const len = toMin(shift.end) - toMin(shift.start);
    return len <= 0 ? len + 1440 : len;
};

export const scheduledWorkMinutes = (shift: Pick<Shift, 'start' | 'end' | 'breakMinutes'>) =>
    shiftLengthMinutes(shift) - shift.breakMinutes;

const span = (s: AttendanceSession) => {
    if (!s.out) return 0;
    const d = toMin(s.out) - toMin(s.in);
    return d < 0 ? d + 1440 : d;
};

export interface DayMetrics {
    workMinutes: number;
    lateMinutes: number;
    earlyLeaveMinutes: number;
    overtimeMinutes: number;
    breakMinutes: number;
    status: AttendanceStatus;
}

/** Derives work, late, early-leave and overtime minutes for one day from its punch sessions. */
export function evaluateDay(sessions: AttendanceSession[], shift: Shift | undefined, now?: string): DayMetrics {
    if (!sessions.length) {
        return { workMinutes: 0, lateMinutes: 0, earlyLeaveMinutes: 0, overtimeMinutes: 0, breakMinutes: 0, status: 'absent' };
    }
    const sorted = [...sessions].sort((a, b) => toMin(a.in) - toMin(b.in));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    // Time between sessions counts as break; a single long session gets the standard break deducted.
    let gaps = 0;
    for (let i = 1; i < sorted.length; i++) {
        const prevOut = sorted[i - 1].out;
        if (prevOut) gaps += Math.max(0, toMin(sorted[i].in) - toMin(prevOut));
    }
    let raw = sorted.reduce((sum, s) => sum + span(s), 0);
    // Live session: count time until "now" so the dashboard shows hours in progress
    if (!last.out && now) {
        const d = toMin(now) - toMin(last.in);
        raw += d < 0 ? d + 1440 : d;
    }
    const standardBreak = shift && sorted.length === 1 && raw > 5 * 60 ? shift.breakMinutes : 0;
    const breakMinutes = gaps + standardBreak;
    const workMinutes = Math.max(0, raw - standardBreak);

    if (!shift) {
        return { workMinutes, lateMinutes: 0, earlyLeaveMinutes: 0, overtimeMinutes: 0, breakMinutes, status: 'present' };
    }

    const flexible = shift.type === 'flexible';
    const start = toMin(shift.start);
    let inDelta = toMin(first.in) - start;
    if (inDelta < -720) inDelta += 1440; // night shift checked in after midnight
    const lateMinutes = !flexible && inDelta > shift.graceMinutes ? inDelta : 0;

    let earlyLeaveMinutes = 0;
    if (last.out && !flexible) {
        let outDelta = toMin(shift.end) - toMin(last.out);
        if (outDelta < -720) outDelta += 1440;
        if (outDelta > 720) outDelta -= 1440;
        earlyLeaveMinutes = Math.max(0, outDelta);
    }

    const scheduled = flexible ? shift.minHours * 60 : scheduledWorkMinutes(shift);
    const extra = workMinutes - scheduled;
    const overtimeMinutes = last.out && extra >= shift.overtimeAfterMinutes ? extra : 0;

    let status: AttendanceStatus = 'present';
    if (last.out && workMinutes < scheduled / 2) status = 'half_day';
    else if (lateMinutes > 0) status = 'late';

    return { workMinutes, lateMinutes, earlyLeaveMinutes, overtimeMinutes, breakMinutes, status };
}
