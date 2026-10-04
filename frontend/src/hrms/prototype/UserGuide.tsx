import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, ArrowUpRight, Printer } from 'lucide-react';
import { Header, Empty } from './Records';
import { Button } from '../../components/ui/button';
import { inputClass } from './Forms';
import { can } from './state';
interface Topic { id:string; title:string; intro:string; steps:string[]; tip?:string; module?:string }
const guideTopics:Topic[]=[
 {id:'start',title:'Start here: your first five minutes',intro:'HRMS brings employee information, attendance, time off, payroll and HR requests together. First choose the right company and identity.',steps:[
 'Open the organization name at the top of the sidebar and select a company. The selected name, employee list, dashboard and operational records change together. Your choice is remembered after a reload.',
 'Use the DEMO WORKSPACE toolbar to choose a role and employee. Super Admin manages everything; HR manages people; Finance handles payroll; Manager has team tools; Employee uses My workspace. Menus and actions depend on the role permissions.',
 'Open Overview to review employee counts, today’s attendance, pending approvals, company updates and upcoming dates. Follow summary links to their modules.',
 'Use the sidebar to open a module. On small screens, open the header menu icon to reveal navigation.',
 'Start with Organization and Employees for setup, or My workspace for daily employee tasks. Read the relevant section below before making changes.'
 ],tip:'This is a local prototype with sample data. Demo role switching is for trying different screens; it does not provide production authentication.'},
 {id:'navigation',title:'Navigation, organizations & logout',intro:'These controls are available throughout the workspace.',steps:[
 'The header’s User Guide text opens this page. Search a task above or jump to a section using Contents.',
 'Press Ctrl K on Windows or Cmd K on Mac, or select Search anything. Search for a module or employee, then choose a result. Employee results open profile details.',
 'Use the bell icon for notifications and Mark all read to clear unread indicators. Some demo reminder links open Overview.',
 'Open your name at the bottom of the sidebar for My workspace, User Guide and Log out. The adjacent sun/moon icon changes the color theme.',
 'Log out opens the logged-out page. Reloading or opening an /app link keeps you logged out. Enter the demo email admin@hrms.demo and password HRMS@2026, then select Sign in to return as Super Admin in the last company. Use Demo sign-in details to fill the sample account. Logging out preserves saved HRMS records.',
 'Select a different organization using the company name above the sidebar menu. Its employee identity updates to a valid member of that company. A company without employees stays empty until you add one.'
 ]},
 {id:'records',title:'Create, view, edit and delete records',intro:'Most modules use tabs for related record types, followed by a searchable table.',steps:[
 'Choose a tab, for example Employees → Directory. Search the table or use All statuses to narrow the results.',
 'Select a column heading to sort; select it again to reverse the order. Use the footer arrows to move between pages.',
 'Select a record’s name or first column to read all its details and approval history. Close the dialog with the cross or Escape.',
 'Select Add followed by the record type. Complete fields marked with *. Choose related records from the dropdowns and select Create. A success message confirms that the record was saved in this browser.',
 'Use the pencil icon to edit and Save changes to update. Form errors explain what needs correcting. Cancel closes without saving.',
 'Use the trash icon and confirm Delete record. Referenced records are protected until their dependent records are reassigned or removed. System roles and approved/locked/paid payroll are also protected.',
 'Choose a local file up to 2 MB for file fields. Open details to download a saved attachment. Remove file clears it before saving. Many large attachments can fill browser storage.',
 'Export downloads the currently filtered table as CSV. Candidate, onboarding, helpdesk and goal tables also offer a list/board view toggle.'
 ],tip:'Missing buttons usually mean the selected role lacks that permission. Clear filters if a newly added record does not appear.'},
 {id:'dashboard',title:'1. Dashboard & analytics',module:'dashboard',intro:'Overview summarizes the selected company and role scope.',steps:[
 'Review total, active and probation employees and today’s present, late and absent counts. These come from employee and attendance records.',
 'Review the departmental distribution and branch count. Follow Directory to inspect the employees behind the numbers.',
 'Open pending requests or Approval inbox for reviews. Latest payroll totals are shown only to roles with salary access.',
 'Read company updates and upcoming holidays/birthdays. Select another organization to inspect its workspace.'
 ]},
 {id:'organization',title:'2. Company & organization',module:'organization',intro:'Create the structure that employee and operational records refer to.',steps:[
 'Use Companies to add/update company details. These companies appear in the organization switcher. Select the intended company before entering operational records.',
 'Add Branches with company, location, timezone, working hours, weekend days and payroll day. Payroll day must be between 1 and 31.',
 'Create Departments, Teams, Designations and Grades. Choose heads, leads, reporting structure and cost centers. Maximum grade salary must be at least the minimum.',
 'Create Cost centers for budgets, Holidays for branch-specific dates, and Policies with summary, full content, version and effective date.',
 'Review the department reporting structure. Employee reporting managers come from their profiles, not simply from the selected demo role.'
 ],tip:'Legacy organization structures and common rules can be shared between companies. Employees, branches and operational records use the selected company context.'},
 {id:'employees',title:'3. Employee management',module:'employees',intro:'The Directory holds each person’s full employment profile.',steps:[
 'Select Add employee. Enter a unique employee code/work email, names and joining date. Choose company, branch, department, designation and reporting manager.',
 'Complete contact, emergency, identity, address, employment type, status and probation information. Salary-authorized roles can maintain salary, bank and tax details.',
 'Use Add entry in Education and Employment history for multiple records. Remove incorrect entries with their trash controls before saving.',
 'Create definitions in Custom fields, then fill them in an employee’s Custom profile fields section.',
 'Open a profile to inspect it. Use Employment timeline for joining, confirmation, promotion, transfer, salary revision or notes. Profile creation/updates also add timeline entries.',
 'Use Offboarding for departures and update employee status/exit date as needed. Avoid deleting employment history when an employee leaves.'
 ]},
 {id:'recruitment',title:'4. Recruitment & applicant tracking',module:'recruitment',intro:'Track a hiring request through opening, interviews and offer.',steps:[
 'Create a Requisition with department, positions, budget and reason, then review its pending approval.',
 'Create Job openings with title, department, branch, description, positions and budget. Set Open to start hiring.',
 'Add Candidates with contact information, related opening, source and CV. Edit stages through Applied, Shortlisted, Interview, Offer and Hired. Use the board to inspect the pipeline.',
 'Schedule Interviews with candidate, interviewer, date, time and meeting link. Update feedback, score and completion status afterwards.',
 'Create Offers with amount, joining date and terms. Maintain draft/sent/accepted/declined status.',
 'For an Offer/Hired candidate, select Hire in the candidate table. This creates an employee profile and marks the candidate Hired. Complete the new profile in Employees. Duplicate conversion is blocked.'
 ],tip:'Application records and stages are functional demo records. Public careers applications, email delivery and electronic signing require external services.'},
 {id:'onboarding',title:'5. Employee onboarding',module:'onboarding',intro:'Use owned checklist tasks to prepare a new employee’s first days.',steps:[
 'Add a task for each requirement, such as joining documents, laptop, access setup, policy acknowledgment or orientation.',
 'Choose employee, owner, category and due date. Add notes describing the required outcome.',
 'Edit status to In progress while work is underway. Use Complete when finished. Review summary counts or the board for remaining tasks.'
 ]},
 {id:'attendance',title:'6. Attendance management',module:'attendance',intro:'One employee/date record can contain several punch sessions.',steps:[
 'Employees use My workspace → Check in / Check out for today’s web attendance. The button changes when a session is open.',
 'HR can add an Attendance sheet record with employee, date, one or more In/Out sessions, work mode and source.',
 'Save to calculate working hours, lateness, early departure, breaks and overtime using the assigned shift rules. An open session can show time worked so far.',
 'Only one attendance record is allowed per person/date. Edit that record to add sessions rather than creating a duplicate.',
 'Use Corrections for the requested check-in/out times and reason. Final correction approval updates the attendance record.'
 ],tip:'Mobile/Biometric source labels do not connect to devices. Offline synchronization and GPS/geofence enforcement are not active in this demo.'},
 {id:'shifts',title:'7. Shifts & rosters',module:'shifts',intro:'Define working patterns and assign coverage by day.',steps:[
 'Add Shift rules with start/end, type, grace, break, minimum hours, overtime threshold and allowance. Night shifts can end after midnight.',
 'Select a default shift on each employee profile. Use Roster assignments for a specific person/date.',
 'Use Weekly roster arrows to change weeks. Select Assign or an existing shift cell to create/edit. The calendar previews up to 12 employees; use the table for all assignments.',
 'Duplicate person/date assignments are blocked. Edit the original to change its shift.',
 'Submit a Swap request with requester, target employee, date and reason. Both need assignments for that day; final approval exchanges their shifts.'
 ]},
 {id:'leave',title:'8. Leave management',module:'leave',intro:'Balances and validation keep time-off requests consistent.',steps:[
 'Configure Entitlements: quota, annual/monthly accrual, paid status, half-day/hourly support, negative balance, weekend counting and document threshold.',
 'Choose an employee in Leave balances to review available, used and pending days. Pending requests reserve balance.',
 'Add a Request with employee, leave type, From/To dates, duration, reason and supporting document. Enter hours for hourly leave.',
 'The form rejects reversed dates, zero working days, overlaps, insufficient balance, unsupported duration and missing required documents. Correct the error before submitting.',
 'Review through approval controls or Approval inbox. Each approval advances one configured level; the last makes the request Approved.',
 'Use the team calendar for upcoming leave and Balance adjustments for manual positive/negative adjustments, carry-forward or encashment records.'
 ],tip:'Carry-forward and encashment records are manual. Automated annual processing is not a background service in this prototype.'},
 {id:'payroll',title:'9. Payroll management',module:'payroll',intro:'Payroll moves through Draft → Approved → Locked → Paid.',steps:[
 'Verify employee salary, bank details, joining/exit dates and shifts. Review attendance, approved leave and loans before generating payroll.',
 'Add Salary structures as earnings/deductions with fixed amounts or percentages of basic salary. Mark taxable components and enable Active.',
 'Use Salary revisions for effective-date changes and Pay adjustments for period-specific bonuses, commissions, arrears or deductions.',
 'Add a Pay run with a pay period and branch. All branches covers the selected company. Saving a draft calculates payslips with salary, demo tax, attendance, leave, overtime and loan deductions. Overlapping company/branch/period runs are rejected.',
 'Open the period to review totals and individual payslips. Select an employee for detailed earnings/deductions. Download the bank CSV or individual text payslip.',
 'Select Approve after review. Approved runs cannot be edited/deleted. Select Lock, then Mark paid to record the simulated payment. This marks slips paid and updates loan repayments; duplicate payment is blocked.',
 'Employees access non-draft payslips in My workspace. Draft payroll remains with the payroll team.'
 ],tip:'Calculation uses the selected calendar month even when Weekly/Custom is chosen as a label. Tax slabs are sample settings. Mark paid records status and does not transfer money.'},
 {id:'loans',title:'10. Loans & advances',module:'loans',intro:'Track a request and repayments through payroll.',steps:[
 'Add a loan/advance with employee, amount, installment count, first deduction period and reason. Installments must be at least one; repaid cannot exceed the amount.',
 'Review the approval request. Approved loans enter payroll deductions from the starting period.',
 'Outstanding is original amount minus repaid for approved loans. Paid payroll updates repayment balances. Authorized users can edit repaid for a manual settlement.'
 ]},
 {id:'expenses',title:'11. Expenses & reimbursements',module:'expenses',intro:'Keep a claim, receipt and payment status together.',steps:[
 'Add a claim with employee, title, category, amount, date, cost center, reason and receipt. Employees submit their own claims in My workspace.',
 'Approve/reject through the workflow. Record details show the approval trail.',
 'After approval, select Mark paid to record reimbursement. Pending/rejected claims cannot be paid. Review Awaiting reimbursement and payment status for unpaid approved claims.'
 ]},
 {id:'performance',title:'12. Performance management',module:'performance',intro:'Maintain measurable goals, reviews and improvement actions.',steps:[
 'Add Goals & OKRs with employee, criteria, due date, progress and weight. Progress must be 0–100. Update progress and status as work advances.',
 'Create a Review with employee, reviewer, cycle and period. Record self-assessment, manager/peer feedback and rating up to 5.',
 'Maintain Draft, Submitted, Approved and Acknowledged review statuses by editing. These review statuses are tracked manually.',
 'Use Improvement plans for actions and date ranges; mark completed when agreed actions finish.'
 ]},
 {id:'learning',title:'13. Learning & development',module:'learning',intro:'Track training opportunities, participation, certificates and skills.',steps:[
 'Add Training catalog courses with provider, type, date, budget, capacity and description.',
 'Add an Enrollment for an employee/course. Maintain enrollment, attendance, completion, score and feedback.',
 'Record Certifications with issued/expiry dates and an attachment.',
 'Use Skill matrix for employee current/target levels up to 5. Review course and completed-enrollment summaries for progress.'
 ]},
 {id:'self',title:'14. Employee self-service: My workspace',module:'self',intro:'Review daily records and submit your own requests.',steps:[
 'Choose Employee as the demo role and the correct person in the toolbar. Open My workspace from the sidebar/user menu.',
 'Select My profile to read your details. Authorized HR users edit profiles in Employees; an employee profile-change approval form is not implemented yet.',
 'Use Check in/out for today’s attendance. Review leave balances and choose a published payslip period to inspect/download.',
 'Use the attendance, leave, claims, loans, document, checklist, ticket and asset tabs for your records. Submit requests wherever Add is available. Self-service request employee identity is fixed to you.',
 'Read company updates and select Read to acknowledge required announcements. Select an answer in an open poll; choosing another answer updates your vote.'
 ]},
 {id:'team',title:'15. Manager self-service: My team',module:'team',intro:'Your team is defined by reporting-manager relationships.',steps:[
 'Choose Manager and select an employee who manages other employees. Open My team for their direct reports.',
 'Review counts, attendance, pending leave and completed goals. Use team tabs for profiles, attendance, leave, expenses, goals, reviews and rosters.',
 'Approve requests where your permissions allow it and the current step requires Manager. Later levels must be reviewed by the next required role.',
 'If the team is empty, verify Reporting manager in employee profiles. Selecting a manager identity does not create a team relationship by itself.'
 ]},
 {id:'helpdesk',title:'16. HR helpdesk & employee relations',module:'helpdesk',intro:'Give every question or case an owner and resolution.',steps:[
 'Add a Ticket with employee, title, category, priority, description, assignee and response deadline. Mark sensitive issues Confidential.',
 'Set In progress while investigating, enter response/resolution, then set Resolved or Closed. Record feedback where appropriate.',
 'Use Disciplinary cases for investigation notes, outcome, date and case status. Confidentiality labels in this prototype do not provide real server-side access security.'
 ]},
 {id:'assets',title:'17. Assets management',module:'assets',intro:'Maintain inventory, assignments and returns.',steps:[
 'Add an asset with name, category, serial, condition and warranty date. Leave Assigned employee empty for available inventory.',
 'Choose an employee and assignment date/status for assigned equipment. Record acknowledgment when received.',
 'Edit the employee for a transfer, or condition/status for repair, loss or damage. Enter return date and Returned when it comes back.',
 'Review Assigned, Available and Need repair summaries. During offboarding, inspect the employee’s assets and record all returns.'
 ]},
 {id:'documents',title:'18. Documents & letters',module:'documents',intro:'Store attachments and generate letters from templates.',steps:[
 'Add a Repository document with employee, name, category, file and optional expiry. Open details to download it.',
 'Create a Letter template with type, version and text. Supported placeholders are {{name}}, {{code}} and {{salary}}.',
 'Create an Issued letter with employee and template. Leave content empty to generate text from the template, or enter manual text.',
 'Review generated content in details. Maintain Draft, Issued, Signed and Acknowledged status. Signed is a tracked demo status, not an electronic-signature service.'
 ]},
 {id:'benefits',title:'19. Benefits management',module:'benefits',intro:'Maintain plans, enrollment and benefit claims.',steps:[
 'Add a Plan with type, provider, employee/employer contributions and renewal date.',
 'Create Enrollment with employee, plan, dependent details, date and active/expired/cancelled status.',
 'Add Claims with employee, plan, amount, reason and receipt. Use approval controls for review. External insurance processing and automatic contribution deductions are not connected.'
 ]},
 {id:'travel',title:'20. Travel management',module:'travel',intro:'Keep approval, budget and itinerary together.',steps:[
 'Add a trip with employee, destination, dates, purpose/reason, estimated amount and advance.',
 'Review through the approval chain. Enter booking reference and itinerary as arrangements become available.',
 'Record actual expenses after the trip and compare them with the advance. Submit receipts through Expenses for reimbursement. Booking and account reconciliation are not automatic.'
 ]},
 {id:'offboarding',title:'21. Offboarding & final settlement',module:'offboarding',intro:'Track resignation, handover, clearance and settlement.',steps:[
 'Add a Resignation with employee, submitted date, last working day, notice days and reason. Record exit interview notes.',
 'Final resignation approval updates employee status to Notice with the exit date.',
 'Add Clearance tasks for HR, IT, Finance and Manager with owners/deadlines. Select Complete as each finishes. Update asset returns separately and handle account removal outside the demo.',
 'Create a Final settlement with pending salary, leave encashment, deductions, date and status. Maintain approval/payment status manually; automatic final-settlement calculation and archival are not implemented.'
 ]},
 {id:'engagement',title:'22. Announcements & engagement',module:'engagement',intro:'Share updates, collect feedback and recognize contributions.',steps:[
 'Add Announcements with title, content, branch/date and acknowledgment requirement. Employees read/acknowledge them in My workspace.',
 'Create Surveys/polls with question, comma-separated options, closing date and Open status. Employees vote in My workspace. Set Closed when voting ends.',
 'Add Recognition for employee appreciation. Record Suggestions and move them through New, Reviewing, Implemented or Closed.'
 ]},
 {id:'reports',title:'23. Reports & exports',module:'reports',intro:'Reports shows live company data within your role scope.',steps:[
 'Choose source, branch, From/To dates and search text. Clear filters to restore the full permitted data. Matching-record count updates with filters.',
 'Export CSV downloads filtered rows for a spreadsheet app. The table previews up to 500 rows; export includes all matches.',
 'Print / PDF opens your browser print dialog. Choose Save as PDF and adjust paper size/orientation for wide tables.',
 'Authorized users can configure saved schedules with source, frequency, recipient and next run. Delivery is configuration only; the demo does not send scheduled emails.'
 ]},
 {id:'roles',title:'24. Roles, permissions & security',module:'roles',intro:'Control module visibility, actions and record scope.',steps:[
 'As Super Admin, open Roles & permissions. Add/edit name, description, scope and salary access.',
 'Choose View, Create, Edit, Delete, Approve and Export for each module. View enables the module; the other actions enable its controls.',
 'Choose All, Branch, Department, Team or Self. Team uses direct reports and Self uses your own records. Selected-company filtering applies before role scope.',
 'Choose the role in the toolbar to try its access. System roles cannot be deleted. SSO/MFA/session preferences are demonstration settings, not real authentication.'
 ]},
 {id:'workflows',title:'25. Workflows, notifications & integrations',module:'workflows',intro:'Rules determine the approval chain for new pending requests.',steps:[
 'Add/edit an Approval rule for the request type. Select roles in the desired order and enable Active.',
 'Enable a threshold to add an extra approval level for larger requests. Choose Days/Amount, comparison, threshold and extra role.',
 'Submit a new pending request after configuring the rule. Inspect its chain in details. Approve advances one level; Reject ends the request. Super Admin can act at any step; other roles must match the pending step.',
 'Delegation records store coverage dates and people. Reminder/escalation timings are configurable; automatic delegation, reminders and escalations are not enforced by a background service.',
 'Integration records store type, endpoint, notes and demo enabled flag. No real device, accounting, banking, calendar, video, webhook, email, SMS or SSO connection is created.'
 ]},
 {id:'settings',title:'Settings, backup & recovery',module:'settings',intro:'Back up data before a reset, restore or browser change.',steps:[
 'Edit regional/payroll/notification/security preferences where your role permits, then Save preferences. Payroll settings affect later calculations.',
 'Download backup saves all companies’ records, settings and attachments as JSON. Keep this file for recovery.',
 'Restore backup accepts an HRMS JSON backup and replaces current records/settings. Download your current backup first if you need to preserve edits.',
 'Reset demo replaces all edits with original sample data. Read the confirmation: reset affects the entire demo, not only the selected company.',
 'Review Audit log for record changes, approvals, payroll actions and exports. Data persists across reload/logout, but clearing browser site data removes it.'
 ]},
 {id:'troubleshooting',title:'Common problems & solutions',intro:'Check permissions, company, filters, master data and validation rules first.',steps:[
 'Missing module/button: check company, role and employee identity. Ask a Super Admin demo user to review View/action permissions. Salary records require salary access.',
 'New record not visible: clear search/status filters, choose the right resource tab, and verify which company was selected when creating it.',
 'Empty dropdown: create the required branch, department, job opening or course first. A new company needs an employee before its employee selector can be used.',
 'Waiting for another approval role: inspect the chain in record details, select the required demo role and review again. Requests may need multiple approvals.',
 'Leave form error: check working dates, available balance, overlaps, supported duration and document requirements.',
 'Payroll cannot be edited/deleted: only Draft is editable/deletable. Review thoroughly before Approve → Lock → Mark paid.',
 'Cannot delete master record: reassign/remove the dependencies named in the error. The system protects linked records.',
 'My team is empty: set Reporting manager on employee profiles to the selected manager.',
 'Upload/save fails: choose a smaller file (2 MB maximum per upload). If browser storage fills, back up and remove unnecessary attachments.',
 'No external notification/device/payment: these are demo configurations. Real authentication, synchronization, signatures, scheduling and payments need backend services.'
 ]}
];
export function UserGuide() {
 const [query,setQuery]=useState('');
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const topics=guideTopics.filter(t=>terms.every(term=>`${t.title} ${t.intro} ${t.steps.join(' ')} ${t.tip||''}`.toLowerCase().includes(term)));
 return <><Header eyebrow="Help & documentation" title="HRMS User Guide" description="A practical guide to every module, from setup to payroll and reporting. Search a task or use the contents to get started."><Button variant="secondary" onClick={()=>window.print()}><Printer/>Print guide</Button></Header><div className="relative mb-7 max-w-xl"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><input className={`${inputClass} pl-9`} aria-label="Search user guide" placeholder="Search a task, e.g. leave, payroll, logout..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="grid lg:grid-cols-[230px_minmax(0,1fr)] gap-7 items-start"><aside className="lg:sticky lg:top-20 bg-surface rounded-lg p-5 max-h-[75vh] overflow-auto print:hidden"><p className="eyebrow mb-3">Contents</p><nav aria-label="User guide contents" className="space-y-1">{topics.map(t=><a href={`#guide-${t.id}`} key={t.id} className="block rounded px-2 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-sunken transition-colors">{t.title}</a>)}</nav><p className="text-[10px] text-muted-foreground mt-4">{topics.length} sections · All 25 HRMS modules</p></aside><div className="space-y-5">{topics.map(topic=><article key={topic.id} id={`guide-${topic.id}`} className="panel scroll-mt-20"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-medium tracking-tight">{topic.title}</h2>{topic.module&&(topic.module==='dashboard'||can(topic.module,'view'))&&<Link className="text-xs text-primary inline-flex gap-1 items-center hover:underline" to={topic.module==='dashboard'?'/app':`/app/${topic.module}`}>Open module<ArrowUpRight className="size-3.5"/></Link>}</div><p className="text-muted-foreground leading-relaxed mt-3 mb-5">{topic.intro}</p><ol className="space-y-4 list-decimal pl-5 marker:text-primary marker:font-medium">{topic.steps.map((step,i)=><li key={i} className="leading-7 text-sm pl-1">{step}</li>)}</ol>{topic.tip&&<p className="mt-6 bg-sunken/60 rounded-md p-4 text-xs text-muted-foreground leading-relaxed"><BookOpen className="inline size-3.5 mr-2 text-primary"/>{topic.tip}</p>}</article>)}{!topics.length&&<Empty title="No guide sections match" description="Try fewer words, a module name or a task such as export."/>}</div></div></>;
}
