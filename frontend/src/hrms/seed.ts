// Deterministic demo data for a mid-sized Pakistani company. Everything is
// generated relative to "today" so dashboards always look current.
import { format, subMonths } from 'date-fns';
import type * as T from './types';
import type { HrmsData, HrmsSettings } from './store';
import { DEFAULT_ROLES } from './permissions';
import { evaluateDay } from './engine/attendance';
import { countLeaveDays } from './engine/leave';
import { computePayslip } from './engine/payroll';
import { approvedChain, buildApprovalChain } from './engine/approvals';
import { fromMin, isWorkingDay, toISO, toMin, shiftISO } from './lib/dates';

// ─── Seeded RNG ─────────────────────────────────────────────────
function mulberry32(seed: number) {
    return () => {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export const DEFAULT_SETTINGS: HrmsSettings = {
    currency: 'PKR',
    locale: 'en-PK',
    timezone: 'Asia/Karachi',
    dateFormat: 'dd MMM yyyy',
    fiscalYearStartMonth: 7,
    workingDaysPerMonth: 30,
    overtimeMultiplier: 1.5,
    latesPerDeductionDay: 3,
    taxSlabs: [
        { upTo: 600000, fixed: 0, rate: 0, over: 0 },
        { upTo: 1200000, fixed: 0, rate: 0.01, over: 600000 },
        { upTo: 2200000, fixed: 6000, rate: 0.11, over: 1200000 },
        { upTo: 3200000, fixed: 116000, rate: 0.23, over: 2200000 },
        { upTo: 4100000, fixed: 346000, rate: 0.3, over: 3200000 },
        { upTo: null, fixed: 616000, rate: 0.35, over: 4100000 },
    ],
    sessionTimeoutMinutes: 30,
    mfaRequired: false,
    ssoEnabled: false,
    passwordMinLength: 10,
    dataRetentionYears: 7,
    backupFrequency: 'daily',
    notifyEmail: true,
    notifySms: false,
    notifyPush: true,
    languages: ['English', 'Urdu'],
};

const MALE = ['Ali', 'Ahmed', 'Hassan', 'Hussain', 'Omar', 'Faisal', 'Imran', 'Saad', 'Danish', 'Fahad', 'Junaid', 'Asad', 'Haris', 'Shoaib', 'Waqas', 'Adeel', 'Talha', 'Rizwan', 'Naveed', 'Zeeshan', 'Arsalan', 'Noman', 'Salman', 'Taimoor'];
const FEMALE = ['Hira', 'Maryam', 'Amna', 'Sara', 'Iqra', 'Mahnoor', 'Rabia', 'Kiran', 'Nida', 'Sadia', 'Aiman', 'Bushra', 'Laiba', 'Areeba', 'Komal', 'Saba', 'Anum', 'Javeria'];
const LAST = ['Khan', 'Ahmed', 'Malik', 'Sheikh', 'Qureshi', 'Butt', 'Chaudhry', 'Siddiqui', 'Abbasi', 'Hashmi', 'Mirza', 'Baig', 'Rana', 'Jamil', 'Zafar', 'Aslam', 'Rehman', 'Farooq', 'Shah', 'Bhatti', 'Kazmi', 'Javed', 'Saleem', 'Anwar'];
const BANKS = ['HBL', 'Meezan Bank', 'UBL', 'MCB Bank', 'Allied Bank', 'Bank Alfalah', 'Standard Chartered'];
const UNIS = ['LUMS', 'NUST', 'FAST-NUCES', 'IBA Karachi', 'UET Lahore', 'COMSATS', 'NED University', 'GIKI', 'Punjab University', 'Habib University'];
const PREV_COS = ['Systems Ltd', 'NetSol Technologies', 'Arbisoft', 'Careem', 'Jazz', 'Engro', 'Unilever Pakistan', 'Daraz', '10Pearls', 'TPS Pakistan', 'K-Electric', 'Telenor'];
const RELATIONS = ['Father', 'Mother', 'Spouse', 'Brother', 'Sister'];

export function buildSeed(): HrmsData {
    const rnd = mulberry32(20261004);
    const pick = <X,>(arr: readonly X[]): X => arr[Math.floor(rnd() * arr.length)];
    const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
    const chance = (p: number) => rnd() < p;
    const round = (n: number, step = 1000) => Math.round(n / step) * step;

    const today = new Date();
    const todayIso = toISO(today);
    const year = today.getFullYear();
    const at = (daysAgo: number, time = '10:00') => `${shiftISO(todayIso, -daysAgo)}T${time}:00`;

    // ─── Organization ──────────────────────────────────────────
    const companies: T.Company[] = [
        { id: 'co_indus', name: 'Indus Digital', legalName: 'Indus Digital (Pvt) Ltd', registrationNo: '0123456', taxId: 'NTN 4512398-7', country: 'Pakistan', currency: 'PKR', email: 'hello@indusdigital.pk', phone: '+92 21 3456 7800' },
        { id: 'co_logistics', name: 'Indus Logistics', legalName: 'Indus Logistics (Pvt) Ltd', registrationNo: '0198765', taxId: 'NTN 7788123-4', country: 'Pakistan', currency: 'PKR', email: 'ops@induslogistics.pk', phone: '+92 21 3456 9900' },
    ];

    const branches: T.Branch[] = [
        { id: 'br_khi', companyId: 'co_indus', name: 'Karachi HQ', code: 'KHI', city: 'Karachi', address: 'Plot 12, Shahrah-e-Faisal, PECHS', timezone: 'Asia/Karachi', workStart: '09:00', workEnd: '18:00', weekendDays: [0, 6], latitude: 24.8607, longitude: 67.0011, geofenceRadius: 200, payrollDay: 28 },
        { id: 'br_lhe', companyId: 'co_indus', name: 'Lahore Tech Center', code: 'LHE', city: 'Lahore', address: '3rd Floor, Arfa Software Technology Park', timezone: 'Asia/Karachi', workStart: '09:00', workEnd: '18:00', weekendDays: [0, 6], latitude: 31.4697, longitude: 74.2728, geofenceRadius: 150, payrollDay: 28 },
        { id: 'br_isb', companyId: 'co_indus', name: 'Islamabad Office', code: 'ISB', city: 'Islamabad', address: 'Office 7, Blue Area, Jinnah Avenue', timezone: 'Asia/Karachi', workStart: '09:00', workEnd: '17:30', weekendDays: [0, 6], latitude: 33.7104, longitude: 73.0599, geofenceRadius: 150, payrollDay: 28 },
        { id: 'br_whs', companyId: 'co_logistics', name: 'Port Qasim Warehouse', code: 'PQW', city: 'Karachi', address: 'Sector 21, Port Qasim Industrial Area', timezone: 'Asia/Karachi', workStart: '08:00', workEnd: '17:00', weekendDays: [0], geofenceRadius: 400, payrollDay: 26 },
    ];

    const costCenters: T.CostCenter[] = [
        { id: 'cc_corp', code: 'CC-100', name: 'Corporate', budget: 18_000_000 },
        { id: 'cc_tech', code: 'CC-200', name: 'Technology', budget: 42_000_000 },
        { id: 'cc_rev', code: 'CC-300', name: 'Revenue', budget: 26_000_000 },
        { id: 'cc_ops', code: 'CC-400', name: 'Operations', budget: 21_000_000 },
    ];

    const departments: T.Department[] = [
        { id: 'dp_exe', name: 'Executive', code: 'EXE', costCenterId: 'cc_corp', description: 'Leadership and strategy.' },
        { id: 'dp_hr', name: 'Human Resources', code: 'HR', costCenterId: 'cc_corp', parentId: 'dp_exe', description: 'People operations, talent and culture.' },
        { id: 'dp_fin', name: 'Finance', code: 'FIN', costCenterId: 'cc_corp', parentId: 'dp_exe', description: 'Accounting, payroll and treasury.' },
        { id: 'dp_eng', name: 'Engineering', code: 'ENG', costCenterId: 'cc_tech', parentId: 'dp_exe', description: 'Product engineering, QA and infrastructure.' },
        { id: 'dp_sal', name: 'Sales', code: 'SAL', costCenterId: 'cc_rev', parentId: 'dp_exe', description: 'New business and account management.' },
        { id: 'dp_mkt', name: 'Marketing', code: 'MKT', costCenterId: 'cc_rev', parentId: 'dp_exe', description: 'Brand, content and growth.' },
        { id: 'dp_ops', name: 'Operations', code: 'OPS', costCenterId: 'cc_ops', parentId: 'dp_exe', description: 'Facilities, admin and logistics.' },
        { id: 'dp_cs', name: 'Customer Support', code: 'CS', costCenterId: 'cc_ops', parentId: 'dp_ops', description: '24/7 customer care.' },
    ];

    const grades: T.Grade[] = [
        { id: 'gr_1', name: 'Grade 1', code: 'G1', minSalary: 40000, maxSalary: 70000 },
        { id: 'gr_2', name: 'Grade 2', code: 'G2', minSalary: 70000, maxSalary: 120000 },
        { id: 'gr_3', name: 'Grade 3', code: 'G3', minSalary: 110000, maxSalary: 200000 },
        { id: 'gr_4', name: 'Grade 4', code: 'G4', minSalary: 180000, maxSalary: 320000 },
        { id: 'gr_5', name: 'Grade 5', code: 'G5', minSalary: 280000, maxSalary: 450000 },
        { id: 'gr_6', name: 'Grade 6', code: 'G6', minSalary: 400000, maxSalary: 650000 },
        { id: 'gr_7', name: 'Grade 7', code: 'G7', minSalary: 600000, maxSalary: 1200000 },
    ];

    const D = (id: string, title: string, departmentId: string, g: number): T.Designation =>
        ({ id, title, departmentId, gradeId: `gr_${g}`, level: g });
    const designations: T.Designation[] = [
        D('ds_ceo', 'Chief Executive Officer', 'dp_exe', 7),
        D('ds_hrm', 'HR Manager', 'dp_hr', 5), D('ds_hrbp', 'HR Business Partner', 'dp_hr', 4), D('ds_hre', 'HR Executive', 'dp_hr', 3), D('ds_ta', 'Talent Acquisition Specialist', 'dp_hr', 3),
        D('ds_fm', 'Finance Manager', 'dp_fin', 5), D('ds_sacc', 'Senior Accountant', 'dp_fin', 4), D('ds_acc', 'Accountant', 'dp_fin', 3), D('ds_po', 'Payroll Officer', 'dp_fin', 3),
        D('ds_em', 'Engineering Manager', 'dp_eng', 6), D('ds_sse', 'Senior Software Engineer', 'dp_eng', 4), D('ds_se', 'Software Engineer', 'dp_eng', 3), D('ds_ase', 'Associate Software Engineer', 'dp_eng', 2), D('ds_qa', 'QA Engineer', 'dp_eng', 3), D('ds_devops', 'DevOps Engineer', 'dp_eng', 4), D('ds_int', 'Engineering Intern', 'dp_eng', 1),
        D('ds_sd', 'Sales Director', 'dp_sal', 6), D('ds_bdm', 'Business Development Manager', 'dp_sal', 4), D('ds_ae', 'Account Executive', 'dp_sal', 3), D('ds_sa', 'Sales Associate', 'dp_sal', 2),
        D('ds_mm', 'Marketing Manager', 'dp_mkt', 5), D('ds_cs', 'Content Strategist', 'dp_mkt', 3), D('ds_gd', 'Graphic Designer', 'dp_mkt', 3), D('ds_dme', 'Digital Marketing Executive', 'dp_mkt', 2),
        D('ds_om', 'Operations Manager', 'dp_ops', 5), D('ds_oe', 'Operations Executive', 'dp_ops', 3), D('ds_ao', 'Admin Officer', 'dp_ops', 2), D('ds_oa', 'Office Assistant', 'dp_ops', 1),
        D('ds_sl', 'Support Lead', 'dp_cs', 4), D('ds_sss', 'Senior Support Specialist', 'dp_cs', 3), D('ds_ss', 'Support Specialist', 'dp_cs', 2),
    ];

    const teams: T.Team[] = [
        { id: 'tm_platform', name: 'Platform', departmentId: 'dp_eng' },
        { id: 'tm_mobile', name: 'Mobile', departmentId: 'dp_eng' },
        { id: 'tm_qa', name: 'Quality', departmentId: 'dp_eng' },
        { id: 'tm_ent', name: 'Enterprise Sales', departmentId: 'dp_sal' },
        { id: 'tm_smb', name: 'SMB Sales', departmentId: 'dp_sal' },
        { id: 'tm_t1', name: 'Tier 1 Support', departmentId: 'dp_cs' },
    ];

    const shifts: T.Shift[] = [
        { id: 'sh_gen', name: 'General', code: 'GEN', type: 'fixed', start: '09:00', end: '18:00', graceMinutes: 15, breakMinutes: 60, minHours: 8, overtimeAfterMinutes: 30, allowance: 0, color: '#2f6f5e' },
        { id: 'sh_flex', name: 'Flexible', code: 'FLX', type: 'flexible', start: '10:00', end: '19:00', graceMinutes: 60, breakMinutes: 60, minHours: 8, overtimeAfterMinutes: 60, allowance: 0, color: '#4b6cb7' },
        { id: 'sh_early', name: 'Early', code: 'ERL', type: 'rotating', start: '07:00', end: '16:00', graceMinutes: 10, breakMinutes: 60, minHours: 8, overtimeAfterMinutes: 30, allowance: 3000, color: '#c47f1a' },
        { id: 'sh_eve', name: 'Evening', code: 'EVE', type: 'rotating', start: '14:00', end: '23:00', graceMinutes: 10, breakMinutes: 60, minHours: 8, overtimeAfterMinutes: 30, allowance: 5000, color: '#8a4fa8' },
        { id: 'sh_night', name: 'Night', code: 'NGT', type: 'night', start: '22:00', end: '07:00', graceMinutes: 10, breakMinutes: 60, minHours: 8, overtimeAfterMinutes: 30, allowance: 9000, color: '#33415c' },
    ];

    // ─── Holidays ──────────────────────────────────────────────
    const fixedHolidays: [string, string][] = [
        ['02-05', 'Kashmir Solidarity Day'], ['03-23', 'Pakistan Day'], ['05-01', 'Labour Day'],
        ['05-28', 'Youm-e-Takbeer'], ['08-14', 'Independence Day'], ['11-09', 'Iqbal Day'], ['12-25', 'Quaid-e-Azam Day'],
    ];
    const islamic: Record<number, [string, string][]> = {
        2026: [['2026-03-20', 'Eid ul Fitr'], ['2026-03-21', 'Eid ul Fitr'], ['2026-03-22', 'Eid ul Fitr'], ['2026-05-27', 'Eid ul Adha'], ['2026-05-28', 'Eid ul Adha'], ['2026-06-25', 'Ashura'], ['2026-06-26', 'Ashura'], ['2026-08-25', 'Eid Milad un Nabi']],
        2027: [['2027-03-10', 'Eid ul Fitr'], ['2027-03-11', 'Eid ul Fitr'], ['2027-03-12', 'Eid ul Fitr'], ['2027-05-17', 'Eid ul Adha'], ['2027-05-18', 'Eid ul Adha'], ['2027-06-15', 'Ashura'], ['2027-06-16', 'Ashura'], ['2027-08-15', 'Eid Milad un Nabi']],
    };
    const holidays: T.Holiday[] = [];
    for (const y of [year, year + 1]) {
        fixedHolidays.forEach(([md, name]) => holidays.push({ id: `hd_${y}_${md}`, name, date: `${y}-${md}`, branchId: 'all', type: 'public' }));
        (islamic[y] ?? []).forEach(([date, name]) => holidays.push({ id: `hd_${date}`, name, date, branchId: 'all', type: 'public' }));
        holidays.push({ id: `hd_${y}_founders`, name: 'Founders Day', date: `${y}-10-17`, branchId: 'all', type: 'company' });
        holidays.push({ id: `hd_${y}_lhe`, name: 'Basant (Lahore office)', date: `${y}-02-14`, branchId: 'br_lhe', type: 'optional' });
    }
    holidays.sort((a, b) => a.date.localeCompare(b.date));

    // ─── Employees ─────────────────────────────────────────────
    const employees: T.Employee[] = [];
    const usedEmails = new Set<string>();
    let seq = 0;

    const makeEmployee = (p: {
        id?: string; first?: string; last?: string; gender?: T.Employee['gender'];
        departmentId: string; designationId: string; branchId: string; managerId?: string; teamId?: string;
        salary?: number; joinDaysAgo?: number; type?: T.EmploymentType; status?: T.EmployeeStatus; shiftId?: string;
    }): T.Employee => {
        seq += 1;
        const gender = p.gender ?? (chance(0.6) ? 'male' : 'female');
        const first = p.first ?? pick(gender === 'male' ? MALE : FEMALE);
        const last = p.last ?? pick(LAST);
        let email = `${first}.${last}`.toLowerCase();
        while (usedEmails.has(email)) email = `${first}.${last}${int(1, 99)}`.toLowerCase();
        usedEmails.add(email);
        const desig = designations.find(d => d.id === p.designationId)!;
        const grade = grades.find(g => g.id === desig.gradeId)!;
        const salary = p.salary ?? round(grade.minSalary + rnd() * (grade.maxSalary - grade.minSalary));
        const joinDaysAgo = p.joinDaysAgo ?? int(120, 2600);
        const joinDate = shiftISO(todayIso, -joinDaysAgo);
        const type = p.type ?? (desig.level === 1 ? 'intern' : chance(0.08) ? 'contract' : 'permanent');
        const probationEnd = shiftISO(joinDate, type === 'intern' ? 90 : 180);
        const status: T.EmployeeStatus = p.status ?? (probationEnd > todayIso && type !== 'contract' ? 'probation' : 'active');
        const dobYear = year - int(type === 'intern' ? 20 : 24, desig.level >= 5 ? 50 : 38);
        const branch = branches.find(b => b.id === p.branchId)!;
        return {
            id: p.id ?? `emp_${String(seq).padStart(3, '0')}`,
            code: `ID-${String(1000 + seq)}`,
            firstName: first,
            lastName: last,
            email: `${email}@indusdigital.pk`,
            personalEmail: `${email}${int(1, 9)}@gmail.com`,
            phone: `+92 3${int(0, 4)}${int(0, 9)} ${int(1000000, 9999999)}`,
            gender,
            dob: `${dobYear}-${String(int(1, 12)).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`,
            maritalStatus: chance(0.55) ? 'married' : 'single',
            nationality: 'Pakistani',
            cnic: `${int(35201, 42301)}-${int(1000000, 9999999)}-${int(1, 9)}`,
            passportNo: chance(0.5) ? `A${int(1000000, 9999999)}` : undefined,
            address: `House ${int(1, 300)}, Street ${int(1, 40)}, ${pick(['DHA Phase 6', 'Gulshan-e-Iqbal', 'Model Town', 'Johar Town', 'F-10/2', 'Bahria Town', 'Clifton Block 5', 'G-11/3'])}`,
            city: branch.city,
            emergencyName: `${pick(MALE)} ${last}`,
            emergencyRelation: pick(RELATIONS),
            emergencyPhone: `+92 3${int(0, 4)}${int(0, 9)} ${int(1000000, 9999999)}`,
            companyId: branch.companyId,
            branchId: p.branchId,
            departmentId: p.departmentId,
            teamId: p.teamId,
            designationId: p.designationId,
            gradeId: grade.id,
            managerId: p.managerId,
            costCenterId: departments.find(d => d.id === p.departmentId)?.costCenterId,
            shiftId: p.shiftId ?? 'sh_gen',
            employmentType: type,
            status,
            joinDate,
            probationEndDate: probationEnd,
            confirmationDate: status === 'active' && type !== 'contract' ? probationEnd : undefined,
            basicSalary: salary,
            bankName: pick(BANKS),
            bankAccount: `PK${int(10, 99)}${pick(['HABB', 'MEZN', 'UNIL', 'MUCB', 'ABPA', 'ALFH'])}${String(int(1e9, 9.99e9))}${int(100000, 999999)}`,
            taxNumber: `${int(1000000, 9999999)}-${int(0, 9)}`,
            education: [{ degree: pick(['BS Computer Science', 'BBA', 'MBA', 'BS Accounting & Finance', 'BS Software Engineering', 'BS Electrical Engineering', 'MS Data Science', 'BA Mass Communication']), institute: pick(UNIS), year: String(dobYear + 22), grade: `${(2.8 + rnd() * 1.1).toFixed(2)} CGPA` }],
            experience: joinDaysAgo > 400 && desig.level > 2 ? [{ company: pick(PREV_COS), title: desig.title.replace('Senior ', ''), from: String(dobYear + 22), to: joinDate.slice(0, 4) }] : [],
            customFields: { blood_group: pick(['A+', 'B+', 'O+', 'AB+', 'A-', 'O-']), tshirt: pick(['S', 'M', 'L', 'XL']) },
        };
    };

    // Key personas used by the demo logins
    const ceo = makeEmployee({ id: 'emp_ceo', first: 'Ayesha', last: 'Siddiqui', gender: 'female', departmentId: 'dp_exe', designationId: 'ds_ceo', branchId: 'br_khi', salary: 950000, joinDaysAgo: 2900 });
    const hrm = makeEmployee({ id: 'emp_hrm', first: 'Bilal', last: 'Ahmed', gender: 'male', departmentId: 'dp_hr', designationId: 'ds_hrm', branchId: 'br_khi', managerId: ceo.id, salary: 380000, joinDaysAgo: 2200 });
    const fin = makeEmployee({ id: 'emp_fin', first: 'Sana', last: 'Malik', gender: 'female', departmentId: 'dp_fin', designationId: 'ds_fm', branchId: 'br_khi', managerId: ceo.id, salary: 400000, joinDaysAgo: 1900 });
    const eng = makeEmployee({ id: 'emp_eng', first: 'Usman', last: 'Tariq', gender: 'male', departmentId: 'dp_eng', designationId: 'ds_em', branchId: 'br_lhe', managerId: ceo.id, salary: 520000, joinDaysAgo: 1700 });
    const sal = makeEmployee({ id: 'emp_sal', first: 'Fatima', last: 'Noor', gender: 'female', departmentId: 'dp_sal', designationId: 'ds_sd', branchId: 'br_khi', managerId: ceo.id, salary: 450000, joinDaysAgo: 1500 });
    const ops = makeEmployee({ id: 'emp_ops', first: 'Kamran', last: 'Akhtar', gender: 'male', departmentId: 'dp_ops', designationId: 'ds_om', branchId: 'br_isb', managerId: ceo.id, salary: 330000, joinDaysAgo: 1400 });
    const mkt = makeEmployee({ id: 'emp_mkt', first: 'Zainab', last: 'Hussain', gender: 'female', departmentId: 'dp_mkt', designationId: 'ds_mm', branchId: 'br_lhe', managerId: ceo.id, salary: 300000, joinDaysAgo: 1100 });
    const csl = makeEmployee({ id: 'emp_csl', first: 'Mehwish', last: 'Iqbal', gender: 'female', departmentId: 'dp_cs', designationId: 'ds_sl', branchId: 'br_khi', managerId: ops.id, teamId: 'tm_t1', salary: 210000, joinDaysAgo: 1300 });
    const dev = makeEmployee({ id: 'emp_dev', first: 'Hamza', last: 'Raza', gender: 'male', departmentId: 'dp_eng', designationId: 'ds_sse', branchId: 'br_lhe', managerId: eng.id, teamId: 'tm_platform', salary: 260000, joinDaysAgo: 980, shiftId: 'sh_flex' });
    employees.push(ceo, hrm, fin, eng, sal, ops, mkt, csl, dev);

    const plan: [string, string, string, string | undefined, number, string?][] = [
        // [department, designation, branch, team, count, shift]
        ['dp_hr', 'ds_hrbp', 'br_khi', undefined, 1], ['dp_hr', 'ds_hre', 'br_lhe', undefined, 1], ['dp_hr', 'ds_ta', 'br_khi', undefined, 1],
        ['dp_fin', 'ds_sacc', 'br_khi', undefined, 1], ['dp_fin', 'ds_acc', 'br_khi', undefined, 1], ['dp_fin', 'ds_po', 'br_isb', undefined, 1],
        ['dp_eng', 'ds_sse', 'br_lhe', 'tm_mobile', 1, 'sh_flex'], ['dp_eng', 'ds_se', 'br_lhe', 'tm_platform', 3, 'sh_flex'], ['dp_eng', 'ds_se', 'br_lhe', 'tm_mobile', 2],
        ['dp_eng', 'ds_ase', 'br_lhe', 'tm_platform', 2], ['dp_eng', 'ds_qa', 'br_lhe', 'tm_qa', 2], ['dp_eng', 'ds_devops', 'br_isb', 'tm_platform', 1], ['dp_eng', 'ds_int', 'br_lhe', 'tm_mobile', 1],
        ['dp_sal', 'ds_bdm', 'br_khi', 'tm_ent', 1], ['dp_sal', 'ds_ae', 'br_khi', 'tm_ent', 2], ['dp_sal', 'ds_ae', 'br_isb', 'tm_smb', 1], ['dp_sal', 'ds_sa', 'br_khi', 'tm_smb', 2],
        ['dp_mkt', 'ds_cs', 'br_lhe', undefined, 1], ['dp_mkt', 'ds_gd', 'br_lhe', undefined, 1], ['dp_mkt', 'ds_dme', 'br_khi', undefined, 1],
        ['dp_ops', 'ds_oe', 'br_isb', undefined, 1], ['dp_ops', 'ds_ao', 'br_khi', undefined, 1], ['dp_ops', 'ds_oa', 'br_khi', undefined, 1], ['dp_ops', 'ds_oe', 'br_whs', undefined, 2],
        ['dp_cs', 'ds_sss', 'br_khi', 'tm_t1', 2, 'sh_early'], ['dp_cs', 'ds_ss', 'br_khi', 'tm_t1', 3, 'sh_early'], ['dp_cs', 'ds_ss', 'br_khi', 'tm_t1', 2, 'sh_eve'], ['dp_cs', 'ds_ss', 'br_khi', 'tm_t1', 1, 'sh_night'],
    ];
    const heads: Record<string, string> = { dp_hr: hrm.id, dp_fin: fin.id, dp_eng: eng.id, dp_sal: sal.id, dp_mkt: mkt.id, dp_ops: ops.id, dp_cs: csl.id, dp_exe: ceo.id };
    for (const [dep, des, br, team, count, shift] of plan) {
        for (let i = 0; i < count; i++) {
            const recent = chance(0.14);
            employees.push(makeEmployee({
                departmentId: dep, designationId: des, branchId: br, teamId: team, managerId: heads[dep],
                shiftId: shift, joinDaysAgo: recent ? int(10, 85) : undefined,
                type: des === 'ds_oa' ? 'part_time' : undefined,
            }));
        }
    }
    // A few lifecycle edge cases
    employees[employees.length - 4].status = 'notice';
    employees[employees.length - 4].exitDate = shiftISO(todayIso, 21);
    employees[14].status = 'notice';
    employees[14].exitDate = shiftISO(todayIso, 9);
    const leaver = makeEmployee({ departmentId: 'dp_sal', designationId: 'ds_sa', branchId: 'br_khi', managerId: sal.id, teamId: 'tm_smb', joinDaysAgo: 700, status: 'resigned' });
    leaver.exitDate = shiftISO(todayIso, -40);
    employees.push(leaver);
    departments.forEach(d => { d.headId = heads[d.id]; });
    teams.forEach(t => {
        t.leadId = employees.find(e => e.teamId === t.id && (e.designationId === 'ds_sse' || e.designationId === 'ds_sl' || e.designationId === 'ds_bdm'))?.id
            ?? employees.find(e => e.teamId === t.id)?.id;
    });

    const isActive = (e: T.Employee, date: string) => e.joinDate <= date && (!e.exitDate || e.exitDate >= date);
    const branchOf = (e: T.Employee) => branches.find(b => b.id === e.branchId);

    // ─── Leave ─────────────────────────────────────────────────
    const leaveTypes: T.LeaveType[] = [
        { id: 'lt_annual', name: 'Annual leave', code: 'AL', annualQuota: 14, accrual: 'monthly', carryForwardMax: 7, encashable: true, paid: true, allowHalfDay: true, allowHourly: false, allowNegative: false, requiresDocumentAfterDays: 0, countWeekends: false, color: '#2f6f5e' },
        { id: 'lt_casual', name: 'Casual leave', code: 'CL', annualQuota: 10, accrual: 'annual', carryForwardMax: 0, encashable: false, paid: true, allowHalfDay: true, allowHourly: true, allowNegative: false, requiresDocumentAfterDays: 0, countWeekends: false, color: '#4b6cb7' },
        { id: 'lt_sick', name: 'Sick leave', code: 'SL', annualQuota: 8, accrual: 'annual', carryForwardMax: 0, encashable: false, paid: true, allowHalfDay: true, allowHourly: false, allowNegative: true, requiresDocumentAfterDays: 2, countWeekends: false, color: '#c0573e' },
        { id: 'lt_unpaid', name: 'Unpaid leave', code: 'UL', annualQuota: 0, accrual: 'annual', carryForwardMax: 0, encashable: false, paid: false, allowHalfDay: true, allowHourly: false, allowNegative: true, requiresDocumentAfterDays: 0, countWeekends: false, color: '#7a7368' },
        { id: 'lt_maternity', name: 'Maternity leave', code: 'ML', annualQuota: 90, accrual: 'annual', carryForwardMax: 0, encashable: false, paid: true, allowHalfDay: false, allowHourly: false, allowNegative: false, requiresDocumentAfterDays: 1, countWeekends: true, color: '#a2557f' },
        { id: 'lt_paternity', name: 'Paternity leave', code: 'PL', annualQuota: 7, accrual: 'annual', carryForwardMax: 0, encashable: false, paid: true, allowHalfDay: false, allowHourly: false, allowNegative: false, requiresDocumentAfterDays: 0, countWeekends: false, color: '#c47f1a' },
    ];

    const workflows: T.WorkflowRule[] = [
        { id: 'wf_leave', name: 'Leave requests', requestType: 'leave', levels: ['manager'], condition: { field: 'days', op: '>=', value: 5, extraLevel: 'hr' }, reminderHours: 24, escalateAfterHours: 72, active: true },
        { id: 'wf_corr', name: 'Attendance corrections', requestType: 'attendance_correction', levels: ['manager'], reminderHours: 24, escalateAfterHours: 48, active: true },
        { id: 'wf_swap', name: 'Shift swaps', requestType: 'shift_swap', levels: ['manager'], reminderHours: 12, escalateAfterHours: 24, active: true },
        { id: 'wf_expense', name: 'Expense claims', requestType: 'expense', levels: ['manager', 'finance'], condition: { field: 'amount', op: '>', value: 50000, extraLevel: 'super_admin' }, reminderHours: 24, escalateAfterHours: 96, active: true },
        { id: 'wf_loan', name: 'Loans & advances', requestType: 'loan', levels: ['hr', 'finance'], reminderHours: 24, escalateAfterHours: 96, active: true },
        { id: 'wf_travel', name: 'Business travel', requestType: 'travel', levels: ['manager', 'finance'], reminderHours: 24, escalateAfterHours: 72, active: true },
        { id: 'wf_resign', name: 'Resignations', requestType: 'resignation', levels: ['manager', 'hr'], reminderHours: 24, escalateAfterHours: 72, active: true },
        { id: 'wf_req', name: 'Hiring requisitions', requestType: 'requisition', levels: ['hr', 'super_admin'], reminderHours: 48, escalateAfterHours: 120, active: true },
    ];
    const leaveRule = workflows[0];

    const leaveRequests: T.LeaveRequest[] = [];
    const reasons = ['Family function', 'Personal errand', 'Feeling unwell', 'Travelling to hometown', 'Medical appointment', 'Child’s school event', 'Wedding in the family', 'Rest and recharge'];
    let lrSeq = 0;
    const addLeave = (e: T.Employee, typeId: string, startOffset: number, len: number, status: T.ApprovalStatus, duration: T.LeaveRequest['duration'] = 'full') => {
        const type = leaveTypes.find(t => t.id === typeId)!;
        let from = shiftISO(todayIso, startOffset);
        while (!isWorkingDay(from, branchOf(e), holidays)) from = shiftISO(from, 1);
        const to = duration === 'full' ? shiftISO(from, len - 1) : from;
        const days = countLeaveDays(from, to, duration, duration === 'hourly' ? 2 : undefined, type, branchOf(e), holidays);
        if (days <= 0) return;
        const createdAt = `${shiftISO(from, -int(2, 10))}T${String(int(9, 17)).padStart(2, '0')}:${String(int(0, 59)).padStart(2, '0')}:00`;
        const chain = buildApprovalChain(leaveRule, e, { days });
        lrSeq += 1;
        leaveRequests.push({
            id: `lr_${String(lrSeq).padStart(3, '0')}`,
            employeeId: e.id, leaveTypeId: typeId, from, to, duration, hours: duration === 'hourly' ? 2 : undefined, days,
            reason: pick(reasons),
            attachment: type.requiresDocumentAfterDays && days > type.requiresDocumentAfterDays ? 'medical-certificate.pdf' : undefined,
            status, createdAt,
            approvals: status === 'approved' ? approvedChain(chain, createdAt.replace(/T.*/, 'T16:00:00'))
                : status === 'rejected' ? chain.map((s, i) => i === 0 ? { ...s, status: 'rejected' as const, actedAt: createdAt, comment: 'Team coverage is thin that week.' } : s)
                    : chain,
        });
    };
    for (const e of employees) {
        if (e.status === 'resigned') continue;
        const past = int(0, 3);
        for (let i = 0; i < past; i++) {
            const offset = -int(3, 150);
            if (shiftISO(todayIso, offset) < e.joinDate) continue;
            addLeave(e, pick(['lt_annual', 'lt_annual', 'lt_casual', 'lt_casual', 'lt_sick']), offset, int(1, 3), chance(0.9) ? 'approved' : 'rejected', chance(0.15) ? 'half' : 'full');
        }
        if (chance(0.22)) addLeave(e, pick(['lt_annual', 'lt_casual']), int(3, 30), int(1, 5), 'pending');
        else if (chance(0.12)) addLeave(e, 'lt_annual', int(2, 25), int(1, 4), 'approved');
    }
    addLeave(employees[22], 'lt_unpaid', -int(20, 30), 2, 'approved');
    addLeave(dev, 'lt_casual', 6, 1, 'pending', 'hourly');
    addLeave(employees[11], 'lt_sick', 0, 2, 'approved');
    const maternity = employees.find(e => e.gender === 'female' && e.status === 'active' && e.id.startsWith('emp_0') && !Object.values(heads).includes(e.id));
    if (maternity) {
        addLeave(maternity, 'lt_maternity', -30, 90, 'approved');
        maternity.status = 'on_leave';
    }
    leaveRequests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const leaveAdjustments: T.LeaveAdjustment[] = employees
        .filter(e => e.joinDate < `${year}-01-01` && chance(0.5))
        .map((e, i) => ({ id: `la_${i}`, employeeId: e.id, leaveTypeId: 'lt_annual', days: int(1, 7), reason: `Carry forward from ${year - 1}`, date: `${year}-01-01`, kind: 'carry_forward' as const }));

    const onLeave = (e: T.Employee, date: string) =>
        leaveRequests.find(l => l.employeeId === e.id && l.status === 'approved' && l.from <= date && l.to >= date);

    // ─── Roster (rotating support shifts) ──────────────────────
    const roster: T.RosterEntry[] = [];
    const support = employees.filter(e => e.departmentId === 'dp_cs' && e.id !== csl.id);
    const weekStart = shiftISO(todayIso, -((today.getDay() + 6) % 7)); // Monday
    for (let w = -1; w <= 2; w++) {
        support.forEach((e, idx) => {
            const rotation = ['sh_early', 'sh_eve', 'sh_night'];
            const shiftId = e.shiftId === 'sh_night' ? 'sh_night' : rotation[(idx + w + 3) % 2];
            for (let d = 0; d < 7; d++) {
                const date = shiftISO(weekStart, w * 7 + d);
                const off = d >= 5;
                roster.push({ id: `ro_${e.id}_${date}`, employeeId: e.id, date, shiftId: off ? 'off' : shiftId });
            }
        });
    }
    const shiftFor = (e: T.Employee, date: string) => {
        const r = roster.find(x => x.employeeId === e.id && x.date === date);
        if (r && r.shiftId !== 'off') return shifts.find(s => s.id === r.shiftId);
        return shifts.find(s => s.id === (e.shiftId ?? 'sh_gen'));
    };

    // ─── Attendance (last ~75 days) ────────────────────────────
    const attendance: T.AttendanceRecord[] = [];
    const nowMin = today.getHours() * 60 + today.getMinutes();
    const personaIds = new Set([ceo.id, hrm.id, fin.id, eng.id, dev.id]);
    for (let back = 75; back >= 0; back--) {
        const date = shiftISO(todayIso, -back);
        for (const e of employees) {
            if (!isActive(e, date)) continue;
            const branch = branchOf(e);
            if (!isWorkingDay(date, branch, holidays)) continue;
            const rosterEntry = roster.find(x => x.employeeId === e.id && x.date === date);
            if (rosterEntry?.shiftId === 'off') continue;
            const shift = shiftFor(e, date)!;
            const leave = onLeave(e, date);
            const base = { employeeId: e.id, date, mode: 'office' as const, source: 'biometric' as const };
            if (leave && leave.duration === 'full') {
                attendance.push({ id: `at_${e.id}_${date}`, ...base, sessions: [], status: 'on_leave', workMinutes: 0, lateMinutes: 0, earlyLeaveMinutes: 0, overtimeMinutes: 0, breakMinutes: 0, note: 'Approved leave' });
                continue;
            }
            const isToday = back === 0;
            if (isToday && (personaIds.has(e.id) || nowMin < toMin(shift.start) - 30 || chance(0.12))) continue;

            if (!isToday && chance(0.035)) {
                attendance.push({ id: `at_${e.id}_${date}`, ...base, sessions: [], status: 'absent', workMinutes: 0, lateMinutes: 0, earlyLeaveMinutes: 0, overtimeMinutes: 0, breakMinutes: 0 });
                continue;
            }
            const late = chance(0.13);
            const inMin = toMin(shift.start) + (late ? int(shift.graceMinutes + 1, 75) : int(-25, shift.graceMinutes));
            const ot = chance(0.12) ? int(40, 150) : 0;
            const halfDay = leave && leave.duration !== 'full';
            let outMin = toMin(shift.end) + (halfDay ? -240 : ot || int(-10, 25));
            if (!halfDay && chance(0.05)) outMin -= int(30, 90); // early leave
            const sessions: T.AttendanceSession[] = isToday
                ? [{ in: fromMin(inMin) }]
                : chance(0.15)
                    ? [{ in: fromMin(inMin), out: fromMin(inMin + 240) }, { in: fromMin(inMin + 290), out: fromMin(outMin) }]
                    : [{ in: fromMin(inMin), out: fromMin(outMin) }];
            const missedPunch = !isToday && chance(0.02);
            if (missedPunch) delete sessions[sessions.length - 1].out;
            const metrics = evaluateDay(sessions, shift, isToday ? fromMin(nowMin) : undefined);
            const mode = e.shiftId === 'sh_flex' && chance(0.35) ? 'remote' : e.departmentId === 'dp_sal' && chance(0.25) ? 'field' : 'office';
            attendance.push({
                id: `at_${e.id}_${date}`, ...base,
                mode, source: mode === 'office' ? (chance(0.8) ? 'biometric' : 'web') : mode === 'remote' ? 'web' : 'mobile',
                sessions, ...metrics,
                status: halfDay ? 'half_day' : metrics.status,
                location: mode === 'field' ? pick(['Client site — Clifton', 'Client site — Gulberg', 'Expo Centre']) : mode === 'remote' ? 'Home' : branch?.name,
                note: missedPunch ? 'Missed check-out' : undefined,
            });
        }
    }

    // ─── Corrections & swaps ───────────────────────────────────
    const corrWorkflow = workflows[1];
    const missed = attendance.filter(a => a.note === 'Missed check-out').slice(0, 6);
    const attendanceCorrections: T.AttendanceCorrection[] = missed.map((a, i) => {
        const e = employees.find(x => x.id === a.employeeId)!;
        const shift = shiftFor(e, a.date)!;
        const pending = i < 4;
        const chain = buildApprovalChain(corrWorkflow, e);
        return {
            id: `ac_${i}`, employeeId: e.id, date: a.date, checkIn: a.sessions[0].in, checkOut: shift.end,
            reason: pick(['Forgot to punch out', 'Biometric device was offline', 'Left with client, phone battery died']),
            status: pending ? 'pending' : 'approved', createdAt: `${shiftISO(a.date, 1)}T10:15:00`,
            approvals: pending ? chain : approvedChain(chain, `${shiftISO(a.date, 1)}T15:00:00`),
        };
    });

    const shiftSwaps: T.ShiftSwapRequest[] = support.length >= 4 ? [
        { id: 'sw_1', requesterId: support[0].id, targetId: support[3].id, date: shiftISO(weekStart, 9), reason: 'Family wedding in the evening', status: 'pending', createdAt: at(1), approvals: buildApprovalChain(workflows[2], support[0]) },
        { id: 'sw_2', requesterId: support[2].id, targetId: support[1].id, date: shiftISO(weekStart, 10), reason: 'University exam', status: 'pending', createdAt: at(0, '09:20'), approvals: buildApprovalChain(workflows[2], support[2]) },
    ] : [];

    // ─── Payroll ───────────────────────────────────────────────
    const salaryComponents: T.SalaryComponent[] = [
        { id: 'sc_hra', name: 'House rent allowance', code: 'HRA', kind: 'earning', calc: 'percent_basic', value: 45, taxable: true, active: true },
        { id: 'sc_util', name: 'Utilities allowance', code: 'UTIL', kind: 'earning', calc: 'percent_basic', value: 10, taxable: true, active: true },
        { id: 'sc_med', name: 'Medical allowance', code: 'MED', kind: 'earning', calc: 'percent_basic', value: 10, taxable: false, active: true },
        { id: 'sc_conv', name: 'Conveyance', code: 'CONV', kind: 'earning', calc: 'fixed', value: 6000, taxable: true, active: true },
        { id: 'sc_pf', name: 'Provident fund (employee)', code: 'PF', kind: 'deduction', calc: 'percent_basic', value: 8.33, taxable: false, active: true },
        { id: 'sc_eobi', name: 'EOBI contribution', code: 'EOBI', kind: 'deduction', calc: 'fixed', value: 370, taxable: false, active: true },
    ];

    const payrollAdjustments: T.PayrollAdjustment[] = [];
    const lastPeriod = format(subMonths(today, 1), 'yyyy-MM');
    employees.filter(e => e.departmentId === 'dp_sal' && e.status !== 'resigned').forEach((e, i) => {
        payrollAdjustments.push({ id: `pa_c${i}`, employeeId: e.id, period: lastPeriod, kind: 'commission', amount: round(int(15000, 90000)), note: 'Sales commission' });
    });
    payrollAdjustments.push({ id: 'pa_b1', employeeId: dev.id, period: lastPeriod, kind: 'bonus', amount: 50000, note: 'Spot award — platform migration' });

    const settings = DEFAULT_SETTINGS;
    const payrollRuns: T.PayrollRun[] = [3, 2, 1].map(m => {
        const period = format(subMonths(today, m), 'yyyy-MM');
        const runId = `pr_${period}`;
        const status: T.PayrollRun['status'] = m === 1 ? 'approved' : 'paid';
        const payslips = employees
            .filter(e => e.joinDate <= `${period}-28` && (!e.exitDate || e.exitDate >= `${period}-01`))
            .map(e => {
                const slip = computePayslip({
                    employee: e, period, runId, components: salaryComponents, attendance, leaveRequests, leaveTypes,
                    adjustments: payrollAdjustments, branch: branchOf(e), holidays, shift: shifts.find(s => s.id === e.shiftId), settings,
                });
                return { ...slip, paymentStatus: status === 'paid' ? 'paid' as const : 'unpaid' as const };
            });
        const created = `${period}-25T11:00:00`;
        return {
            id: runId, period, cycle: 'monthly', branchId: 'all', status, createdAt: created,
            approvedAt: `${period}-26T16:30:00`, lockedAt: status === 'paid' ? `${period}-27T10:00:00` : undefined,
            paidAt: status === 'paid' ? `${period}-28T12:00:00` : undefined, payslips,
        };
    });

    const salaryRevisions: T.SalaryRevision[] = employees
        .filter(e => e.joinDate < shiftISO(todayIso, -400))
        .slice(0, 18)
        .map((e, i) => {
            const date = shiftISO(todayIso, -int(60, 380));
            const previous = round(e.basicSalary / (1 + int(8, 20) / 100));
            return { id: `sr_${i}`, employeeId: e.id, effectiveDate: date, previous, amount: e.basicSalary, reason: pick(['Annual increment', 'Performance increment', 'Promotion', 'Market adjustment']) };
        });

    // ─── Timeline, documents, policies ─────────────────────────
    const employeeEvents: T.EmployeeEvent[] = [];
    employees.forEach(e => {
        const desig = designations.find(d => d.id === e.designationId)!.title;
        employeeEvents.push({ id: `ev_join_${e.id}`, employeeId: e.id, type: 'joined', date: e.joinDate, title: `Joined as ${desig}`, details: `${branchOf(e)?.name} · ${departments.find(d => d.id === e.departmentId)?.name}` });
        if (e.confirmationDate) employeeEvents.push({ id: `ev_conf_${e.id}`, employeeId: e.id, type: 'confirmed', date: e.confirmationDate, title: 'Confirmed after probation' });
        if (e.status === 'notice' || e.status === 'resigned') employeeEvents.push({ id: `ev_exit_${e.id}`, employeeId: e.id, type: 'status_change', date: shiftISO(e.exitDate!, -30), title: 'Resignation accepted', details: `Last working day ${e.exitDate}`, to: e.status });
    });
    salaryRevisions.forEach(r => employeeEvents.push({ id: `ev_${r.id}`, employeeId: r.employeeId, type: 'salary_revision', date: r.effectiveDate, title: r.reason, from: String(r.previous), to: String(r.amount) }));
    employeeEvents.push({ id: 'ev_promo_dev', employeeId: dev.id, type: 'promotion', date: shiftISO(todayIso, -210), title: 'Promoted to Senior Software Engineer', from: 'Software Engineer', to: 'Senior Software Engineer' });
    employeeEvents.push({ id: 'ev_tr_1', employeeId: employees[20].id, type: 'transfer', date: shiftISO(todayIso, -150), title: 'Transferred to Lahore Tech Center', from: 'Karachi HQ', to: 'Lahore Tech Center' });

    const employeeDocuments: T.EmployeeDocument[] = [];
    employees.forEach((e, i) => {
        employeeDocuments.push({ id: `doc_cnic_${e.id}`, employeeId: e.id, name: 'CNIC (front & back)', category: 'Identity', fileName: `cnic-${e.code}.pdf`, size: int(180, 900) * 1024, uploadedAt: e.joinDate, expiryDate: shiftISO(todayIso, i % 9 === 0 ? int(5, 40) : int(200, 2500)) });
        employeeDocuments.push({ id: `doc_ctr_${e.id}`, employeeId: e.id, name: 'Employment contract', category: 'Contract', fileName: `contract-${e.code}.pdf`, size: int(300, 1200) * 1024, uploadedAt: e.joinDate, expiryDate: e.employmentType === 'contract' ? shiftISO(todayIso, int(10, 120)) : undefined });
        employeeDocuments.push({ id: `doc_deg_${e.id}`, employeeId: e.id, name: 'Highest degree', category: 'Education', fileName: `degree-${e.code}.pdf`, size: int(400, 2400) * 1024, uploadedAt: e.joinDate });
        if (e.passportNo) employeeDocuments.push({ id: `doc_pp_${e.id}`, employeeId: e.id, name: 'Passport', category: 'Identity', fileName: `passport-${e.code}.pdf`, size: int(300, 900) * 1024, uploadedAt: e.joinDate, expiryDate: shiftISO(todayIso, i % 7 === 0 ? -int(5, 60) : int(100, 1800)) });
    });

    const ackSome = (p: number) => employees.filter(() => chance(p)).map(e => e.id);
    const policies: T.Policy[] = [
        { id: 'po_handbook', title: 'Employee handbook', category: 'Handbook', version: '4.2', effectiveDate: `${year}-01-01`, requiresAck: true, acknowledgedBy: ackSome(0.8), summary: 'How we work: values, benefits, conduct and everyday practicalities.', content: 'Welcome to Indus Digital. This handbook explains our values, the benefits you are entitled to, how we expect colleagues to treat one another, and the practical details of working here — from office hours to expense claims.\n\nIf anything here is unclear, speak to your HR business partner.' },
        { id: 'po_conduct', title: 'Code of conduct', category: 'Conduct', version: '2.0', effectiveDate: `${year - 1}-07-01`, requiresAck: true, acknowledgedBy: ackSome(0.9), summary: 'Standards of professional behaviour, conflicts of interest and anti-harassment.', content: 'Every employee is expected to act with integrity, respect and professionalism. Harassment, discrimination and retaliation are not tolerated. Conflicts of interest must be declared to HR.' },
        { id: 'po_leave', title: 'Leave policy', category: 'Leave', version: '3.1', effectiveDate: `${year}-01-01`, requiresAck: false, acknowledgedBy: [], summary: 'Leave types, entitlements, accrual, carry-forward and approval rules.', content: 'Annual leave accrues monthly at 14 days per year. Up to 7 unused days carry forward. Sick leave above 2 consecutive days requires a medical certificate. Requests of 5 days or more need HR approval in addition to the line manager.' },
        { id: 'po_attendance', title: 'Attendance & punctuality', category: 'Attendance', version: '1.4', effectiveDate: `${year}-03-01`, requiresAck: true, acknowledgedBy: ackSome(0.7), summary: 'Working hours, grace periods, late arrivals and attendance corrections.', content: 'Standard hours are 9:00 am to 6:00 pm with a 15-minute grace period. Every 3 late arrivals in a month result in a half-day deduction. Missed punches must be corrected within 3 working days.' },
        { id: 'po_it', title: 'IT acceptable use', category: 'IT', version: '1.0', effectiveDate: `${year - 1}-01-15`, requiresAck: true, acknowledgedBy: ackSome(0.6), summary: 'Use of company devices, accounts, data and networks.', content: 'Company devices and accounts are for business use. Do not share passwords, install unlicensed software, or move company data to personal storage.' },
        { id: 'po_remote', title: 'Remote work policy', category: 'Other', version: '1.2', effectiveDate: `${year}-02-01`, requiresAck: false, acknowledgedBy: [], summary: 'Eligibility and expectations for remote and hybrid work.', content: 'Engineering and marketing staff may work remotely up to 2 days a week with manager approval. Remote attendance must be marked through the web portal.' },
    ];

    const customFields: T.CustomFieldDef[] = [
        { id: 'cf_blood', key: 'blood_group', label: 'Blood group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
        { id: 'cf_tshirt', key: 'tshirt', label: 'T-shirt size', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL'] },
        { id: 'cf_linkedin', key: 'linkedin', label: 'LinkedIn profile', type: 'text' },
    ];

    const audit: T.AuditEntry[] = [
        { id: 'au_1', at: at(0, '09:12'), actor: 'Bilal Ahmed', action: 'update', entity: 'Employee', entityId: dev.id, summary: 'Updated emergency contact for Hamza Raza' },
        { id: 'au_2', at: at(1, '16:40'), actor: 'Sana Malik', action: 'approve', entity: 'Payroll run', entityId: `pr_${lastPeriod}`, summary: `Approved payroll for ${lastPeriod}` },
        { id: 'au_3', at: at(1, '11:05'), actor: 'Usman Tariq', action: 'approve', entity: 'Leave request', summary: 'Approved annual leave' },
        { id: 'au_4', at: at(2, '14:22'), actor: 'Sana Malik', action: 'export', entity: 'Payroll run', summary: 'Exported bank payment file' },
        { id: 'au_5', at: at(3, '10:01'), actor: 'Ayesha Siddiqui', action: 'login', entity: 'Session', summary: 'Signed in from Karachi' },
        { id: 'au_6', at: at(4, '12:30'), actor: 'Bilal Ahmed', action: 'create', entity: 'Policy', entityId: 'po_remote', summary: 'Published Remote work policy v1.2' },
    ];

    const notifications: T.AppNotification[] = [
        { id: 'nt_1', at: at(0, '09:30'), title: 'Leave requests waiting', body: `${leaveRequests.filter(l => l.status === 'pending').length} leave requests need a decision.`, link: '/app/approvals', read: false, tone: 'warning' },
        { id: 'nt_2', at: at(0, '08:05'), title: 'Documents expiring soon', body: 'Some employee CNICs and contracts expire within 30 days.', link: '/app/employees', read: false, tone: 'danger' },
        { id: 'nt_3', at: at(1, '16:40'), title: 'Payroll approved', body: `Payroll for ${lastPeriod} is approved and ready for payment.`, link: '/app/payroll', read: false, tone: 'success' },
        { id: 'nt_4', at: at(3, '10:00'), title: 'New policy published', body: 'Remote work policy v1.2 is now in effect.', link: '/app/organization?tab=policies', read: true, tone: 'info' },
    ];

    const delegations: T.Delegation[] = [];

    return {
        companies, branches, departments, teams, designations, grades, costCenters, policies, holidays,
        employees, employeeEvents, employeeDocuments, customFields,
        shifts, roster, shiftSwaps, attendance, attendanceCorrections, leaveTypes, leaveRequests, leaveAdjustments,
        salaryComponents, salaryRevisions, payrollRuns, payrollAdjustments,
        roles: DEFAULT_ROLES, workflows, delegations, audit, notifications,
        settings,
    };
}
