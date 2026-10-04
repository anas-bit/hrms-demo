# HRMS prototype

A frontend HRMS workspace on the `hrms` branch, following the 25 modules in [HRMS_FEATURES.md](HRMS_FEATURES.md).

## Run

From `frontend`: `npm install`, then `npm run dev`. Open the Vite URL, normally http://localhost:5173. The root opens sign-in for a new session and the dashboard for an active session. The demo toolbar switches role and employee identity; it is intentionally not a production login.

## Design

Warm paper surfaces, pine navigation, compact typography, flat panels and tables without box shadows or decorative borders. Responsive mobile navigation, keyboard search (Ctrl/Cmd K), focus states, dark mode, skeleton tables, submit/action loading, empty states, confirmation dialogs and toast feedback.

## Working prototype coverage

- Dashboard: scoped headcount, departmental distribution, current attendance, pending requests, payroll totals, noticeboard and upcoming dates.
- Organization: companies, branches, departments, teams, grades, designations, cost centers, holidays and policies; department reporting structure.
- Employees: full profile, emergency/identity/bank information, education and experience, employment timeline and custom field definitions.
- Recruitment: openings, requisitions, candidates, board stages, interviews and offers; candidate-to-employee conversion with duplicate protection.
- Onboarding: assigned checklist tasks, due dates and completion.
- Attendance: punch sessions, computed hours/lateness/overtime, web check-in/out, correction requests; approved corrections update attendance.
- Shifts: shift rules, assignments, interactive weekly roster, conflict protection; approved swaps update both assignments.
- Leave: entitlement/accrual balances, adjustments, requests, team calendar, date/overlap/balance/document checks and multi-level approvals.
- Payroll: salary components/revisions/adjustments, monthly calculation using configured demo tax rules, attendance/leave/overtime and loan deductions, approval/locking/payment, per-person payslips and bank CSV export.
- Loans and expenses: requests, approvals, repayments/deductions, receipt attachments and reimbursement status.
- Performance and learning: goals/progress, reviews/ratings, improvement plans, training catalog/enrollments, certifications and skill records.
- Employee/manager workspaces: own/team records, requests, punch actions, leave balances, payslips, announcement acknowledgment and polls.
- Helpdesk, assets and documents: assigned tickets, cases, inventory, acknowledgments, uploaded documents, templates and generated letters.
- Benefits, travel and offboarding: plans/enrollment/claims, itinerary/budget/advance records, resignations, clearance and settlement records.
- Engagement: announcements, surveys/polls, recognition and suggestions.
- Reports: live filters, CSV export, browser print/PDF and saved schedule configurations.
- Roles/workflows: customizable action permissions and scope, configurable approval chains and delegation records, integration settings.
- Settings: preferences, JSON backup/restore/reset and audit history.

All configured module resources have create, read, update and delete flows, subject to permissions and references. Deleting referenced master records is blocked; system roles and closed payroll are protected. Data and small uploaded files persist in browser localStorage. Uploads are limited to 2 MB each.

## Prototype boundaries

This is a local dummy-data prototype. Biometric/device synchronization, GPS/geofencing enforcement, e-signatures, bank transfers, SSO/MFA, external notifications, scheduled deliveries and third-party connections need real services. Their settings/records do not connect to external systems. Role switching and access rules demonstrate UI behavior, not backend security. Confidential HR records should not be entered into this demo.

Weekly/custom cycle labels are stored, but payroll calculation currently uses the selected calendar month. Tax slabs are sample configuration, not validated current statutory guidance. PDF is the browser print flow; spreadsheet export is CSV. Automated reminders/delegation/escalation enforcement, automated carry-forward/encashment, record versioning, automatic offboarding settlement and some advanced feature-list automation remain to be implemented. The feature-list checkboxes intentionally remain the broader product backlog rather than being marked fully shipped.

## Validation

`npm run build` verifies TypeScript and production bundling. `npm test` runs domain/store regressions, including create/update/delete for every resource, persistence, references, attendance, leave approval, payroll transitions, candidate conversion and role scope. `npx eslint src/hrms/prototype src/router.tsx` checks the new implementation. Full-repository lint has existing issues in inactive ERP pages.

Browser visual/interaction verification could not be completed because browser access to the local preview was declined. Build and store tests do not replace that verification.


## Organization switching, logout and in-app help

The organization name in the sidebar opens a company menu. Switching updates the active company, employee identity, operational tables, dashboard and payroll. Legacy pay runs are migrated into independent company runs so actions affect the selected company. Shared rules and legacy organizational master data remain reusable. Selecting a company is persisted; records created in that workspace retain company ownership.

The sidebar user menu includes Log out. Logout clears the active role/employee session, preserves data, and redirects to `/login`. Direct app links stay protected after logout. The login page accepts admin@hrms.demo / HRMS@2026 for the sample account. Email/password validation is local prototype authentication. New sessions begin on the login page.

The header links to `/app/user-guide`. This searchable guide contains instructions for all 25 modules, common CRUD controls, organization selection, logout, backup/recovery and troubleshooting. It also explains which integrations and automation are simulated. Contents links, module links and print are available.
