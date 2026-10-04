import type { PermissionAction, Role, RoleKey } from './types';

export interface ModuleDef { key: string; label: string; actions: PermissionAction[] }

const CRUD: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'export'];
const CRUDA: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

export const PERMISSION_MODULES: ModuleDef[] = [
    { key: 'dashboard', label: 'Dashboard', actions: ['view'] },
    { key: 'self_service', label: 'My workspace', actions: ['view', 'create'] },
    { key: 'team', label: 'My team', actions: ['view', 'edit', 'approve'] },
    { key: 'approvals', label: 'Approvals', actions: ['view', 'approve'] },
    { key: 'organization', label: 'Organization', actions: CRUD },
    { key: 'employees', label: 'Employees', actions: CRUD },
    { key: 'attendance', label: 'Attendance', actions: CRUDA },
    { key: 'shifts', label: 'Shifts & rosters', actions: CRUDA },
    { key: 'leave', label: 'Leave', actions: CRUDA },
    { key: 'payroll', label: 'Payroll', actions: CRUDA },
    { key: 'reports', label: 'Reports', actions: ['view', 'export'] },
    { key: 'settings', label: 'Settings & security', actions: ['view', 'edit'] },
];

const all = (actions: PermissionAction[] = CRUDA) =>
    Object.fromEntries(PERMISSION_MODULES.map(m => [m.key, m.actions.filter(a => actions.includes(a))]));

const pick = (map: Record<string, PermissionAction[]>) =>
    Object.fromEntries(PERMISSION_MODULES.map(m => [m.key, (map[m.key] ?? []).filter(a => m.actions.includes(a))]));

export const DEFAULT_ROLES: Role[] = [
    {
        id: 'super_admin', name: 'Super Admin', system: true, scope: 'all', canViewSalary: true,
        description: 'Full access to every module, setting and record.',
        permissions: all(),
    },
    {
        id: 'hr', name: 'HR', system: true, scope: 'all', canViewSalary: true,
        description: 'Manages people data, time, leave and HR operations.',
        permissions: pick({
            dashboard: ['view'], self_service: ['view', 'create'], team: ['view', 'edit', 'approve'], approvals: ['view', 'approve'],
            organization: CRUD, employees: CRUD, attendance: CRUDA, shifts: CRUDA, leave: CRUDA,
            payroll: ['view', 'create', 'export'], reports: ['view', 'export'], settings: ['view'],
        }),
    },
    {
        id: 'finance', name: 'Finance', system: true, scope: 'all', canViewSalary: true,
        description: 'Runs payroll, approves pay-related requests and exports.',
        permissions: pick({
            dashboard: ['view'], self_service: ['view', 'create'], approvals: ['view', 'approve'],
            organization: ['view'], employees: ['view', 'export'], attendance: ['view', 'export'], leave: ['view'],
            payroll: CRUDA, reports: ['view', 'export'],
        }),
    },
    {
        id: 'manager', name: 'Manager', system: true, scope: 'team', canViewSalary: false,
        description: 'Sees and approves requests for their own team.',
        permissions: pick({
            dashboard: ['view'], self_service: ['view', 'create'], team: ['view', 'edit', 'approve'], approvals: ['view', 'approve'],
            organization: ['view'], employees: ['view'], attendance: ['view', 'approve'], shifts: ['view', 'edit', 'approve'],
            leave: ['view', 'approve'], reports: ['view'],
        }),
    },
    {
        id: 'employee', name: 'Employee', system: true, scope: 'self', canViewSalary: false,
        description: 'Self-service access to their own records and requests.',
        permissions: pick({ dashboard: ['view'], self_service: ['view', 'create'], organization: ['view'] }),
    },
];

export const ROLE_LABEL: Record<RoleKey, string> = {
    super_admin: 'Super Admin',
    hr: 'HR',
    finance: 'Finance',
    manager: 'Manager',
    employee: 'Employee',
};
