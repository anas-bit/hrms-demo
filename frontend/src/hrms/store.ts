import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type * as T from './types';
import { buildSeed } from './seed';

export interface TaxSlab { upTo: number | null; fixed: number; rate: number; over: number }

export interface HrmsSettings {
    currency: string;
    locale: string;
    timezone: string;
    dateFormat: string;
    fiscalYearStartMonth: number; // 1-12
    workingDaysPerMonth: number;
    overtimeMultiplier: number;
    latesPerDeductionDay: number;
    taxSlabs: TaxSlab[];
    sessionTimeoutMinutes: number;
    mfaRequired: boolean;
    ssoEnabled: boolean;
    passwordMinLength: number;
    dataRetentionYears: number;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    lastBackupAt?: string;
    notifyEmail: boolean;
    notifySms: boolean;
    notifyPush: boolean;
    languages: string[];
}

export interface HrmsData {
    companies: T.Company[];
    branches: T.Branch[];
    departments: T.Department[];
    teams: T.Team[];
    designations: T.Designation[];
    grades: T.Grade[];
    costCenters: T.CostCenter[];
    policies: T.Policy[];
    holidays: T.Holiday[];

    employees: T.Employee[];
    employeeEvents: T.EmployeeEvent[];
    employeeDocuments: T.EmployeeDocument[];
    customFields: T.CustomFieldDef[];

    shifts: T.Shift[];
    roster: T.RosterEntry[];
    shiftSwaps: T.ShiftSwapRequest[];
    attendance: T.AttendanceRecord[];
    attendanceCorrections: T.AttendanceCorrection[];
    leaveTypes: T.LeaveType[];
    leaveRequests: T.LeaveRequest[];
    leaveAdjustments: T.LeaveAdjustment[];

    salaryComponents: T.SalaryComponent[];
    salaryRevisions: T.SalaryRevision[];
    payrollRuns: T.PayrollRun[];
    payrollAdjustments: T.PayrollAdjustment[];

    roles: T.Role[];
    workflows: T.WorkflowRule[];
    delegations: T.Delegation[];
    audit: T.AuditEntry[];
    notifications: T.AppNotification[];

    settings: HrmsSettings;
}

export type CollectionKey = {
    [K in keyof HrmsData]: HrmsData[K] extends Array<{ id: string }> ? K : never
}[keyof HrmsData];

export type Entity<K extends CollectionKey> = HrmsData[K][number];

interface HrmsActions {
    insert: <K extends CollectionKey>(key: K, item: Entity<K>) => void;
    insertMany: <K extends CollectionKey>(key: K, items: Entity<K>[]) => void;
    patch: <K extends CollectionKey>(key: K, id: string, patch: Partial<Entity<K>>) => void;
    destroy: <K extends CollectionKey>(key: K, id: string) => void;
    destroyMany: <K extends CollectionKey>(key: K, ids: string[]) => void;
    replace: <K extends CollectionKey>(key: K, items: Entity<K>[]) => void;
    setSettings: (patch: Partial<HrmsSettings>) => void;
    resetDemoData: () => void;
}

export type HrmsStore = HrmsData & HrmsActions;

// Bump when the data shape changes; older persisted data is replaced with a fresh seed.
const STORE_VERSION = 1;

type AnyList = { id: string }[];

export const useHrms = create<HrmsStore>()(
    persist(
        (set) => ({
            ...buildSeed(),

            insert: (key, item) => set(s => ({ [key]: [item, ...(s[key] as AnyList)] } as Partial<HrmsStore>)),
            insertMany: (key, items) => set(s => ({ [key]: [...items, ...(s[key] as AnyList)] } as Partial<HrmsStore>)),
            patch: (key, id, patch) => set(s => ({
                [key]: (s[key] as AnyList).map(item => item.id === id ? { ...item, ...patch } : item),
            } as Partial<HrmsStore>)),
            destroy: (key, id) => set(s => ({
                [key]: (s[key] as AnyList).filter(item => item.id !== id),
            } as Partial<HrmsStore>)),
            destroyMany: (key, ids) => set(s => ({
                [key]: (s[key] as AnyList).filter(item => !ids.includes(item.id)),
            } as Partial<HrmsStore>)),
            replace: (key, items) => set(() => ({ [key]: items } as Partial<HrmsStore>)),
            setSettings: (patch) => set(s => ({ settings: { ...s.settings, ...patch } })),
            resetDemoData: () => set(() => ({ ...buildSeed() })),
        }),
        {
            name: 'strateaxis-hrms',
            version: STORE_VERSION,
            storage: createJSONStorage(() => localStorage),
            migrate: () => buildSeed() as HrmsStore,
        }
    )
);

export const hrms = () => useHrms.getState();
