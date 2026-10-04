import { addDays, format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, isAfter } from 'date-fns';
import type { Branch, Holiday } from '../types';

export const toISO = (d: Date) => format(d, 'yyyy-MM-dd');
export const todayISO = () => toISO(new Date());
export const nowTime = () => format(new Date(), 'HH:mm');
export const currentPeriod = () => format(new Date(), 'yyyy-MM');
export const shiftISO = (iso: string, days: number) => toISO(addDays(parseISO(iso), days));

export const toMin = (hhmm?: string) => {
    if (!hhmm) return 0;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + (m || 0);
};

export const fromMin = (mins: number) => {
    const m = ((Math.round(mins) % 1440) + 1440) % 1440;
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export const daysBetween = (from: string, to: string) =>
    isAfter(parseISO(from), parseISO(to)) ? [] : eachDayOfInterval({ start: parseISO(from), end: parseISO(to) }).map(toISO);

export const monthDays = (period: string) => {
    const start = parseISO(`${period}-01`);
    return eachDayOfInterval({ start: startOfMonth(start), end: endOfMonth(start) }).map(toISO);
};

export const weekday = (iso: string) => parseISO(iso).getDay();

export const isWeekend = (iso: string, branch?: Pick<Branch, 'weekendDays'>) =>
    (branch?.weekendDays ?? [0, 6]).includes(weekday(iso));

export const holidayOn = (iso: string, holidays: Holiday[], branchId?: string) =>
    holidays.find(h => h.date === iso && (h.branchId === 'all' || h.branchId === branchId));

export const isWorkingDay = (iso: string, branch: Pick<Branch, 'id' | 'weekendDays'> | undefined, holidays: Holiday[]) =>
    !isWeekend(iso, branch) && !holidayOn(iso, holidays, branch?.id);

export const workingDaysIn = (from: string, to: string, branch: Pick<Branch, 'id' | 'weekendDays'> | undefined, holidays: Holiday[]) =>
    daysBetween(from, to).filter(d => isWorkingDay(d, branch, holidays));

export const overlaps = (aFrom: string, aTo: string, bFrom: string, bTo: string) => aFrom <= bTo && bFrom <= aTo;
