// Domain model for HRMS. All dates are ISO strings (YYYY-MM-DD) and
// times are HH:mm, so the whole store serialises cleanly to localStorage.

export type ID = string;

export type RoleKey = 'super_admin' | 'hr' | 'finance' | 'manager' | 'employee';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ApprovalStep {
    level: number;
    role: RoleKey;
    approverId?: ID;
    status: 'pending' | 'approved' | 'rejected' | 'skipped';
    actedAt?: string;
    comment?: string;
}

// ─── Organization ───────────────────────────────────────────────
export interface Company {
    id: ID;
    name: string;
    legalName: string;
    registrationNo: string;
    taxId: string;
    country: string;
    currency: string;
    email: string;
    phone: string;
}

export interface Branch {
    id: ID;
    companyId: ID;
    name: string;
    code: string;
    city: string;
    address: string;
    timezone: string;
    workStart: string;
    workEnd: string;
    weekendDays: number[]; // 0 = Sunday
    latitude?: number;
    longitude?: number;
    geofenceRadius: number; // meters
    payrollDay: number;
}

export interface Department {
    id: ID;
    name: string;
    code: string;
    headId?: ID;
    parentId?: ID;
    costCenterId?: ID;
    description?: string;
}

export interface Team {
    id: ID;
    name: string;
    departmentId: ID;
    leadId?: ID;
}

export interface Designation {
    id: ID;
    title: string;
    departmentId?: ID;
    gradeId?: ID;
    level: number;
}

export interface Grade {
    id: ID;
    name: string;
    code: string;
    minSalary: number;
    maxSalary: number;
}

export interface CostCenter {
    id: ID;
    code: string;
    name: string;
    budget: number;
}

export interface Policy {
    id: ID;
    title: string;
    category: 'Handbook' | 'Conduct' | 'Leave' | 'Attendance' | 'Payroll' | 'IT' | 'Health & Safety' | 'Other';
    version: string;
    effectiveDate: string;
    summary: string;
    content: string;
    requiresAck: boolean;
    acknowledgedBy: ID[];
}

export interface Holiday {
    id: ID;
    name: string;
    date: string;
    branchId: ID | 'all';
    type: 'public' | 'company' | 'optional';
}

// ─── Employees ──────────────────────────────────────────────────
export type EmploymentType = 'permanent' | 'contract' | 'intern' | 'part_time';
export type EmployeeStatus = 'active' | 'probation' | 'notice' | 'on_leave' | 'resigned' | 'terminated';

export interface Education { degree: string; institute: string; year: string; grade?: string }
export interface Experience { company: string; title: string; from: string; to: string }

export interface Employee {
    id: ID;
    code: string;
    firstName: string;
    lastName: string;
    email: string;
    personalEmail?: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    dob: string;
    maritalStatus: 'single' | 'married' | 'other';
    nationality: string;
    cnic: string;
    passportNo?: string;
    address: string;
    city: string;
    emergencyName: string;
    emergencyRelation: string;
    emergencyPhone: string;

    companyId: ID;
    branchId: ID;
    departmentId: ID;
    teamId?: ID;
    designationId: ID;
    gradeId?: ID;
    managerId?: ID;
    costCenterId?: ID;
    shiftId?: ID;
    employmentType: EmploymentType;
    status: EmployeeStatus;
    joinDate: string;
    probationEndDate?: string;
    confirmationDate?: string;
    exitDate?: string;

    basicSalary: number;
    bankName: string;
    bankAccount: string;
    taxNumber: string;

    education: Education[];
    experience: Experience[];
    customFields: Record<string, string>;
}

export interface EmployeeEvent {
    id: ID;
    employeeId: ID;
    type: 'joined' | 'confirmed' | 'promotion' | 'transfer' | 'salary_revision' | 'status_change' | 'note';
    date: string;
    title: string;
    details?: string;
    from?: string;
    to?: string;
}

export interface EmployeeDocument {
    id: ID;
    employeeId: ID;
    name: string;
    category: 'Identity' | 'Education' | 'Contract' | 'Medical' | 'Letter' | 'Other';
    fileName: string;
    size: number;
    uploadedAt: string;
    expiryDate?: string;
}

export interface CustomFieldDef {
    id: ID;
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
    options?: string[];
}

// ─── Time ───────────────────────────────────────────────────────
export interface Shift {
    id: ID;
    name: string;
    code: string;
    type: 'fixed' | 'flexible' | 'rotating' | 'night';
    start: string;
    end: string;
    graceMinutes: number;
    breakMinutes: number;
    minHours: number;
    overtimeAfterMinutes: number;
    allowance: number;
    color: string;
}

export interface RosterEntry {
    id: ID;
    employeeId: ID;
    date: string;
    shiftId: ID | 'off';
}

export interface ShiftSwapRequest {
    id: ID;
    requesterId: ID;
    targetId: ID;
    date: string;
    reason: string;
    status: ApprovalStatus;
    createdAt: string;
    approvals: ApprovalStep[];
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'half_day' | 'on_leave' | 'holiday' | 'weekend';

export interface AttendanceSession { in: string; out?: string }

export interface AttendanceRecord {
    id: ID;
    employeeId: ID;
    date: string;
    sessions: AttendanceSession[];
    mode: 'office' | 'remote' | 'field';
    source: 'web' | 'mobile' | 'biometric' | 'manual';
    status: AttendanceStatus;
    workMinutes: number;
    lateMinutes: number;
    earlyLeaveMinutes: number;
    overtimeMinutes: number;
    breakMinutes: number;
    location?: string;
    note?: string;
}

export interface AttendanceCorrection {
    id: ID;
    employeeId: ID;
    date: string;
    checkIn: string;
    checkOut: string;
    reason: string;
    status: ApprovalStatus;
    createdAt: string;
    approvals: ApprovalStep[];
}

export interface LeaveType {
    id: ID;
    name: string;
    code: string;
    annualQuota: number;
    accrual: 'annual' | 'monthly';
    carryForwardMax: number;
    encashable: boolean;
    paid: boolean;
    allowHalfDay: boolean;
    allowHourly: boolean;
    allowNegative: boolean;
    requiresDocumentAfterDays: number; // 0 = never
    countWeekends: boolean;
    color: string;
}

export interface LeaveRequest {
    id: ID;
    employeeId: ID;
    leaveTypeId: ID;
    from: string;
    to: string;
    duration: 'full' | 'half' | 'hourly';
    hours?: number;
    days: number;
    reason: string;
    attachment?: string;
    status: ApprovalStatus;
    createdAt: string;
    approvals: ApprovalStep[];
}

export interface LeaveAdjustment {
    id: ID;
    employeeId: ID;
    leaveTypeId: ID;
    days: number; // positive adds, negative deducts
    reason: string;
    date: string;
    kind: 'adjustment' | 'carry_forward' | 'encashment';
}

// ─── Payroll ────────────────────────────────────────────────────
export interface SalaryComponent {
    id: ID;
    name: string;
    code: string;
    kind: 'earning' | 'deduction';
    calc: 'fixed' | 'percent_basic';
    value: number;
    taxable: boolean;
    active: boolean;
}

export interface SalaryRevision {
    id: ID;
    employeeId: ID;
    effectiveDate: string;
    previous: number;
    amount: number;
    reason: string;
}

export interface PayLine { code: string; name: string; amount: number }

export interface Payslip {
    id: ID;
    runId: ID;
    employeeId: ID;
    period: string; // YYYY-MM
    basic: number;
    earnings: PayLine[];
    deductions: PayLine[];
    workingDays: number;
    paidDays: number;
    unpaidLeaveDays: number;
    overtimeHours: number;
    gross: number;
    totalDeductions: number;
    net: number;
    paymentStatus: 'unpaid' | 'paid';
}

export interface PayrollRun {
    id: ID;
    period: string; // YYYY-MM
    cycle: 'monthly' | 'weekly' | 'custom';
    branchId: ID | 'all';
    status: 'draft' | 'approved' | 'locked' | 'paid';
    createdAt: string;
    approvedAt?: string;
    lockedAt?: string;
    paidAt?: string;
    payslips: Payslip[];
    notes?: string;
}

export interface PayrollAdjustment {
    id: ID;
    employeeId: ID;
    period: string;
    kind: 'bonus' | 'commission' | 'arrears' | 'deduction';
    amount: number;
    note: string;
}

// ─── Platform ───────────────────────────────────────────────────
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

export interface Role {
    id: RoleKey | string;
    name: string;
    description: string;
    system: boolean;
    permissions: Record<string, PermissionAction[]>;
    scope: 'all' | 'branch' | 'department' | 'team' | 'self';
    canViewSalary: boolean;
}

export interface WorkflowRule {
    id: ID;
    name: string;
    requestType: 'leave' | 'attendance_correction' | 'shift_swap' | 'expense' | 'loan' | 'travel' | 'resignation' | 'requisition';
    levels: RoleKey[];
    condition?: { field: 'days' | 'amount'; op: '>' | '>='; value: number; extraLevel: RoleKey };
    reminderHours: number;
    escalateAfterHours: number;
    active: boolean;
}

export interface Delegation {
    id: ID;
    fromId: ID;
    toId: ID;
    from: string;
    to: string;
    reason: string;
}

export interface AuditEntry {
    id: ID;
    at: string; // ISO datetime
    actor: string;
    action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'export' | 'login' | 'run';
    entity: string;
    entityId?: ID;
    summary: string;
}

export interface AppNotification {
    id: ID;
    at: string;
    title: string;
    body: string;
    link?: string;
    read: boolean;
    tone: 'info' | 'success' | 'warning' | 'danger';
}

