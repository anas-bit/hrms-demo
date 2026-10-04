import { format, parseISO, formatDistanceToNowStrict, differenceInYears, differenceInMonths } from 'date-fns';
import type { Employee } from '../types';

const moneyFmt = new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 });
const numFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const compactFmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export const money = (n: number | undefined | null) => moneyFmt.format(Math.round(n ?? 0)).replace('PKR', 'Rs');
export const moneyCompact = (n: number) => `Rs ${compactFmt.format(n)}`;
export const num = (n: number) => numFmt.format(n);
export const pct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`;

export const fmtDate = (iso?: string | null, pattern = 'dd MMM yyyy') => {
    if (!iso) return '—';
    try { return format(parseISO(iso), pattern); } catch { return iso; }
};
export const fmtDateShort = (iso?: string | null) => fmtDate(iso, 'dd MMM');
export const fmtDateTime = (iso?: string | null) => fmtDate(iso, 'dd MMM yyyy, HH:mm');
export const fmtMonth = (period?: string | null) => (period ? fmtDate(`${period}-01`, 'MMMM yyyy') : '—');
export const fromNow = (iso: string) => {
    try { return `${formatDistanceToNowStrict(parseISO(iso))} ago`; } catch { return iso; }
};

export const fmtTime = (hhmm?: string) => {
    if (!hhmm) return '—';
    const [h, m] = hhmm.split(':').map(Number);
    const suffix = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const fmtMinutes = (mins: number) => {
    if (!mins) return '0h';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return m ? `${h}h ${m}m` : `${h}h`;
};

export const fullName = (e?: Pick<Employee, 'firstName' | 'lastName'> | null) =>
    e ? `${e.firstName} ${e.lastName}` : 'Unknown';

export const initials = (name: string) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

export const tenure = (joinDate: string, until: Date = new Date()) => {
    const start = parseISO(joinDate);
    const y = differenceInYears(until, start);
    const m = differenceInMonths(until, start) % 12;
    if (y <= 0) return `${m} mo`;
    return m ? `${y} yr ${m} mo` : `${y} yr`;
};

export const age = (dob: string) => differenceInYears(new Date(), parseISO(dob));

export const titleCase = (s: string) =>
    s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export const fileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// Muted, theme-friendly avatar tints (bg/fg pairs work in light and dark)
const AVATAR_TINTS = [
    'bg-[hsl(164_30%_88%)] text-[hsl(164_45%_22%)] dark:bg-[hsl(164_20%_20%)] dark:text-[hsl(164_40%_75%)]',
    'bg-[hsl(28_60%_88%)] text-[hsl(28_55%_30%)] dark:bg-[hsl(28_25%_20%)] dark:text-[hsl(28_60%_75%)]',
    'bg-[hsl(212_50%_90%)] text-[hsl(212_50%_32%)] dark:bg-[hsl(212_25%_20%)] dark:text-[hsl(212_60%_78%)]',
    'bg-[hsl(340_40%_91%)] text-[hsl(340_40%_34%)] dark:bg-[hsl(340_20%_20%)] dark:text-[hsl(340_50%_78%)]',
    'bg-[hsl(262_30%_91%)] text-[hsl(262_30%_36%)] dark:bg-[hsl(262_18%_21%)] dark:text-[hsl(262_40%_80%)]',
    'bg-[hsl(46_60%_86%)] text-[hsl(40_60%_26%)] dark:bg-[hsl(46_25%_18%)] dark:text-[hsl(46_60%_72%)]',
    'bg-[hsl(190_35%_88%)] text-[hsl(190_45%_24%)] dark:bg-[hsl(190_20%_19%)] dark:text-[hsl(190_45%_75%)]',
];

export const tintFor = (key: string) => {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return AVATAR_TINTS[h % AVATAR_TINTS.length];
};
