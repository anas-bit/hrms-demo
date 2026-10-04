import { validateCredentials } from './auth';
import { useMemo } from 'react';
import { companyData, activeCompanyId, sharedCollections, separateCompanyPayroll } from './company';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildSeed } from '../seed';
import type { HrmsData, HrmsSettings } from '../store';
import type { Employee, Shift, AttendanceSession, ApprovalStep } from '../types';
import { buildApprovalChain } from '../engine/approvals';
import { countLeaveDays, leaveBalance, validateLeave } from '../engine/leave';
import { evaluateDay } from '../engine/attendance';
import { computePayslip } from '../engine/payroll';
import { modules, resources, resourceByKey, type Row } from './schema';
export const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const clockTime = () => new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
export const uid = () => crypto.randomUUID();
export const money = (n: unknown) => new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR',maximumFractionDigits:0}).format(Number(n)||0);
export const pause = () => new Promise(resolve => setTimeout(resolve,280));
export const nameOf = (row?: Row) => row ? String(row.name || row.title || (row.firstName ? `${row.firstName} ${row.lastName}` : row.code || row.period || row.id)) : '—';
export function defaults(key: string, data: Record<string,Row[]>): Row {
 const cfg = resourceByKey(key)!; const row: Row = {id:uid(),createdAt:new Date().toISOString(),...cfg.defaults};
 for (const field of cfg.fields) {
  if (row[field.key] !== undefined) continue;
  row[field.key] = field.relation ? (field.required ? data[field.relation]?.[0]?.id || '' : '') : field.options ? field.options[0] : field.type === 'checkbox' ? false : field.type === 'number' ? 0 : ['sessions','education','experience','list','levels','weekdays'].includes(field.type || '') ? [] : field.type === 'permissions' ? {} : field.type === 'date' ? today() : field.type === 'month' ? today().slice(0,7) : field.type === 'time' ? '09:00' : '';
 }
 if(key==='employees') row.code=`EMP-${Date.now().toString().slice(-6)}`;
 return row;
}
function initial() {
 const seed=buildSeed(); const {settings,...rest}=seed;
 const data=rest as unknown as Record<string,Row[]>;
 for(const cfg of resources) if(!data[cfg.key]) data[cfg.key]=[];
 const emps=data.employees, deps=data.departments;
 const put=(key:string, items:Record<string,unknown>[]) => {data[key]=items.map(item=>({...defaults(key,data),...item}));};
 put('jobs',[{title:'Senior Product Designer',departmentId:deps[3]?.id || deps[0].id,description:'Shape accessible employee experiences with our product team.',positions:2,budget:240000,status:'open'},{title:'People Operations Associate',departmentId:deps[1].id,positions:1,budget:85000,status:'open'}]);
 put('candidates',[{name:'Ayesha Siddiqui',email:'ayesha@example.com',jobId:data.jobs[0].id,stage:'interview',score:86,source:'Referral'},{name:'Bilal Khan',email:'bilal@example.com',jobId:data.jobs[0].id,stage:'shortlisted',score:78,source:'Careers page'},{name:'Zoya Ahmed',email:'zoya@example.com',jobId:data.jobs[1].id,stage:'offer',score:91,source:'LinkedIn'}]);
 put('interviews',[{candidateId:data.candidates[0].id,interviewerId:emps[0].id,time:'14:00',status:'scheduled'}]);
 put('offers',[{candidateId:data.candidates[2].id,amount:85000,joiningDate:today(),status:'sent',content:'We are pleased to offer you a position in People Operations.'}]);
 put('requisitions',[{title:'Expand product team',employeeId:emps[3].id,amount:240000,positions:2,reason:'Support the upcoming product launch',status:'pending'}]);
 put('onboarding',emps.slice(5,8).flatMap(e=>['Collect joining documents','Prepare laptop and accounts','Schedule orientation'].map((title,i)=>({employeeId:e.id,title,ownerId:emps[i].id,dueDate:today(),category:['HR','IT','Orientation'][i],status:i===0?'completed':'pending'}))));
 put('loans',[{employeeId:emps[6].id,type:'loan',amount:120000,installments:6,repaid:20000,startPeriod:today().slice(0,7),reason:'Home renovation',status:'approved'},{employeeId:emps[8].id,type:'advance',amount:30000,installments:1,repaid:0,startPeriod:today().slice(0,7),reason:'Family expenses',status:'pending'}]);
 put('expenses',[{employeeId:emps[4].id,title:'Client visit transport',category:'Travel',amount:4500,reason:'Visit to Lahore client office',status:'pending',paymentStatus:'unpaid'},{employeeId:emps[7].id,title:'Team workshop meals',category:'Meals',amount:8200,reason:'Product planning workshop',status:'approved',paymentStatus:'unpaid'}]);
 put('goals',emps.slice(0,8).map((e,i)=>({employeeId:e.id,title:['Improve customer response time','Deliver quarterly roadmap','Complete compliance training'][i%3],dueDate:today(),progress:25+i*8,weight:30,status:'in_progress'})));
 put('reviews',[{employeeId:emps[5].id,reviewerId:emps[0].id,cycle:'Quarterly',period:today().slice(0,7),rating:4,feedback:'Strong delivery and collaboration; develop mentoring skills.',status:'submitted'}]);
 put('improvementPlans',[{employeeId:emps[8].id,title:'Customer communication',actions:'Weekly coaching and review of response quality.',status:'active'}]);
 put('courses',[{title:'Information security essentials',type:'Mandatory',provider:'Internal IT',budget:25000,capacity:100,description:'Practical security habits for every employee.'},{title:'Manager coaching workshop',type:'External',provider:'People Academy',budget:150000,capacity:20}]);
 put('enrollments',emps.slice(0,8).map((e,i)=>({employeeId:e.id,courseId:data.courses[i%2].id,status:i%3===0?'completed':'enrolled',score:i%3===0?92:0})));
 put('certifications',[{employeeId:emps[4].id,title:'Project management certificate',issuedDate:today(),expiryDate:`${Number(today().slice(0,4))+1}-10-01`}]);
 put('skills',emps.slice(0,6).map(e=>({employeeId:e.id,name:'Communication',level:3,target:4})));
 put('tickets',[{employeeId:emps[5].id,title:'Update bank account',category:'Payroll',priority:'medium',assigneeId:emps[1].id,status:'open',description:'Please help update my salary account.'},{employeeId:emps[7].id,title:'Policy clarification',category:'Policy',priority:'low',assigneeId:emps[1].id,status:'in_progress',description:'Clarification on remote working policy.'}]);
 put('cases',[{employeeId:emps[9].id,title:'Attendance review',details:'Review repeated missed punches.',status:'investigating'}]);
 put('assets',emps.slice(0,10).map((e,i)=>({name:`ThinkPad T14 · ${i+1}`,category:'Laptop',serial:`LEN-2026-${100+i}`,employeeId:e.id,condition:'good',status:'assigned',assignedDate:today(),acknowledged:i%2===0})));
 put('templates',[{title:'Employment certificate',type:'Experience',version:'1.0',content:'This certifies that {{name}} ({{code}}) is employed with our organization. Monthly basic salary: {{salary}}.'},{title:'Appointment letter',type:'Appointment',version:'1.0',content:'Dear {{name}}, welcome to our team. Your employee reference is {{code}}.'}]);
 put('letters',[{employeeId:emps[3].id,templateId:data.templates[0].id,status:'draft'}]);
 put('benefitPlans',[{name:'Family medical cover',type:'Medical',provider:'Jubilee',employeeContribution:1500,employerContribution:4500,renewalDate:today()},{name:'Provident fund',type:'Provident fund',provider:'Company trust',employeeContribution:5000,employerContribution:5000}]);
 put('benefitEnrollments',emps.slice(0,6).map(e=>({employeeId:e.id,planId:data.benefitPlans[0].id,dependents:'Spouse and two children',status:'active'})));
 put('benefitClaims',[{employeeId:emps[4].id,planId:data.benefitPlans[0].id,amount:12500,reason:'Outpatient consultation',status:'pending'}]);
 put('travel',[{employeeId:emps[6].id,destination:'Lahore',reason:'Client workshop',amount:45000,advance:15000,status:'pending',itinerary:'Karachi → Lahore · 2 day client visit'}]);
 put('resignations',[{employeeId:emps[10].id,lastDay:today(),noticeDays:30,reason:'Career progression',status:'pending'}]);
 put('clearance',['Return assigned equipment','Complete knowledge handover','Close salary account reconciliation'].map((title,i)=>({employeeId:emps[10].id,title,department:['IT','Manager','Finance'][i],status:'pending'})));
 put('settlements',[{employeeId:emps[10].id,pendingSalary:85000,leaveEncashment:12000,deductions:5000,status:'draft'}]);
 put('announcements',[{title:'Welcome to the new quarter',content:'Our quarterly town hall takes place this Friday. Bring your ideas and questions.',date:today(),requiresAck:true,acknowledgedBy:[]},{title:'Annual health check',content:'Book your complimentary health screening through People Operations.',date:today()}]);
 put('surveys',[{title:'Workplace pulse',question:'How is your workload this week?',options:['Comfortable','Manageable','Need support'],status:'open',votes:{}}]);
 put('recognition',[{employeeId:emps[3].id,title:'Above and beyond',message:'Thank you for supporting the team through the release.'}]);
 put('suggestions',[{employeeId:emps[5].id,title:'Quiet focus hours',content:'Reserve two meeting-free hours every morning.',status:'reviewing'}]);
 put('scheduledReports',[{title:'Monthly headcount',source:'employees',frequency:'monthly',recipient:'hr@example.com',nextRun:today()}]);
 put('delegations',[{fromId:emps[0].id,toId:emps[1].id,from:today(),to:today(),reason:'Cover approvals during absence'}]);
 put('integrations',[{name:'Office attendance device',type:'Biometric',endpoint:'https://device.example.com',enabled:false,notes:'Demo configuration. No external connection.'},{name:'Payroll bank export',type:'Banking',enabled:false,notes:'Use payroll CSV bank export.'}]);
 for(const role of data.roles) { const permissions=role.permissions as Record<string,string[]>;if(role.id==='super_admin') Object.assign(permissions,demoPermissions());if(role.id==='hr') for(const m of modules.filter(m=>['People','Growth','Operations'].includes(m.group))) permissions[m.key]=['view','create','edit','delete','approve','export'];if(role.id==='finance') for(const key of ['loans','expenses','benefits']) permissions[key]=['view','create','edit','approve','export']; } return {data:separateCompanyPayroll(data),settings};
}
interface Session { roleId:string; employeeId:string; search:string; companyId?:string; signedIn?:boolean }
interface State { data:Record<string,Row[]>;settings:HrmsSettings;session:Session; save:(key:string,row:Row)=>void; remove:(key:string,id:string)=>void; act:(key:string,id:string,action:string)=>void; setSession:(patch:Partial<Session>)=>void; switchCompany:(id:string)=>void; signIn:()=>void; login:(email:string,password:string)=>void; signOut:()=>void; configure:(patch:Partial<HrmsSettings>)=>void; reset:()=>void; restore:(data:Record<string,Row[]>,settings:HrmsSettings)=>void }
function domain(data:Record<string,Row[]>,settings:HrmsSettings) { return {...data,settings} as unknown as HrmsData; }
function audit(data:Record<string,Row[]>,role:string,action:string,key:string,row:Row) { const entry={id:uid(),at:new Date().toISOString(),actor:role,action,entity:key,entityId:row.id,summary:`${action}: ${nameOf(row)}`}; return {...data,audit:[entry,...(data.audit||[])].slice(0,1000)}; }
export const usePrototype=create<State>()(persist((set,get)=>({
 ...initial(),session:{roleId:'super_admin',employeeId:'',search:'',signedIn:false},
 setSession:patch=>set(s=>({session:{...s.session,...patch}})),
 switchCompany:id=>set(s=>{
  if(!s.data.companies.some(c=>c.id===id))throw new Error('Company not found.');
  const employees=s.data.employees.filter(e=>e.companyId===id);
  return {session:{...s.session,companyId:id,employeeId:employees.some(e=>e.id===s.session.employeeId)?s.session.employeeId:employees[0]?.id||'',search:''}};
 }),
 signIn:()=>set(s=>{const companyId=activeCompanyId(s.data,s.session.companyId);return {session:{...s.session,signedIn:true,companyId,roleId:'super_admin',employeeId:s.data.employees.find(e=>e.companyId===companyId)?.id||'',search:''}}}),
 login:(email,password)=>{validateCredentials(email,password);get().signIn();},
 signOut:()=>set(s=>({session:{companyId:s.session.companyId,signedIn:false,employeeId:'',roleId:'',search:''}})),
 configure:patch=>set(s=>({settings:{...s.settings,...patch},data:audit(s.data,s.session.roleId,'update','settings',{id:'settings',name:'Workspace preferences'})})),
 reset:()=>set({...initial()}),restore:(data,settings)=>set({data:separateCompanyPayroll(data),settings}),
 save:(key,input)=>{
  const state=get(); const data=state.data; const d=domain(data,state.settings); const row={...input}; const old=data[key]?.find(x=>x.id===row.id); const cfg=resourceByKey(key)!;
  const companyId=activeCompanyId(data,state.session.companyId);
  if(!old&&!sharedCollections.has(key)&&!row.companyId)row.companyId=companyId;
  for(const field of cfg.fields) { const value=row[field.key]; if(field.required && (value===undefined || value===null || value==='')) throw new Error(`${field.label} is required.`); if(field.type==='number' && value!==undefined && value!=='' && (!Number.isFinite(Number(value)) || (field.min!==undefined && Number(value)<field.min))) throw new Error(`${field.label} must be ${field.min ?? 'a valid number'} or more.`); }
  if(row.from && row.to && String(row.to)<String(row.from)) throw new Error('End date must follow the start date.');
  if(key==='employees' && data.employees.some(e=>e.id!==row.id && (e.code===row.code || e.email===row.email))) throw new Error('Employee code and work email must be unique.');
  if(key==='branches' && (Number(row.payrollDay)>31 || Number(row.payrollDay)<1)) throw new Error('Payroll day must be between 1 and 31.');
  if(key==='grades' && Number(row.maxSalary)<Number(row.minSalary)) throw new Error('Maximum salary must be greater than minimum salary.');
  if(['goals'].includes(key) && Number(row.progress)>100) throw new Error('Progress cannot exceed 100%.');
  if(['reviews','skills'].includes(key) && [row.rating,row.level,row.target].some(v=>v!==undefined && Number(v)>5)) throw new Error('Rating and skill levels cannot exceed 5.');
  if(key==='loans' && (Number(row.installments)<1 || Number(row.repaid)>Number(row.amount))) throw new Error('Check installment count and repayment amount.');
  if(key==='roster' && data.roster.some(x=>x.id!==row.id && x.employeeId===row.employeeId && x.date===row.date)) throw new Error('This employee already has a shift assigned on that date.');
  if(key==='attendance' && data.attendance.some(x=>x.id!==row.id && x.employeeId===row.employeeId && x.date===row.date)) throw new Error('Attendance already exists for this employee and date. Edit the existing record.');
  const emp=d.employees.find(e=>e.id===(row.employeeId||row.requesterId));
  if(key==='attendance') Object.assign(row,evaluateDay(row.sessions as AttendanceSession[],d.shifts.find(s=>s.id===emp?.shiftId),clockTime()));
  if(key==='leaveRequests') {
   const type=d.leaveTypes.find(t=>t.id===row.leaveTypeId)!; const branch=d.branches.find(b=>b.id===emp?.branchId); if(!emp||!type) throw new Error('Select an employee and leave type.');
   const days=countLeaveDays(String(row.from),String(row.to),row.duration as 'full'|'half'|'hourly',Number(row.hours),type,branch,d.holidays);
   if(row.duration==='half'&&!type.allowHalfDay) throw new Error('This leave type does not allow half days.');
   if(row.duration==='hourly'&&(!type.allowHourly||Number(row.hours)<=0||Number(row.hours)>8)) throw new Error('Hourly leave must be allowed and between 0 and 8 hours.');
   const validation=validateLeave({employeeId:emp.id,leaveType:type,from:String(row.from),to:String(row.to),days,attachment:row.attachment as string,balance:leaveBalance(emp,type,d.leaveRequests.filter(r=>r.id!==row.id),d.leaveAdjustments),existing:d.leaveRequests,ignoreId:row.id});
   if(!validation.ok) throw new Error(validation.errors.join(' ')); row.days=days;
  }
  if(cfg.approval && (!old || old.status!==row.status) && row.status==='pending') row.approvals=buildApprovalChain(d.workflows.find(w=>w.requestType===cfg.approval),emp||{}, {days:Number(row.days),amount:Number(row.amount)});
  if(key==='payrollRuns') {
   if(old && old.status!=='draft') throw new Error('Approved payroll cannot be edited.');
   if(companyData(data,companyId).payrollRuns.some(x=>x.id!==row.id && x.period===row.period && (x.branchId===row.branchId || x.branchId==='all' || row.branchId==='all'))) throw new Error('A payroll run already covers this branch and period.');
   const id=row.id; row.payslips=d.employees.filter(e=>e.companyId===companyId && ['active','probation','notice','on_leave'].includes(e.status) && (row.branchId==='all'||!row.branchId||e.branchId===row.branchId)).map(employee=>computePayslip({employee:{...employee,basicSalary:Number([...data.salaryRevisions].filter(r=>r.employeeId===employee.id&&String(r.effectiveDate)<=String(row.period)+'-31').sort((a,b)=>String(b.effectiveDate).localeCompare(String(a.effectiveDate)))[0]?.amount ?? employee.basicSalary)},period:String(row.period),runId:id,components:d.salaryComponents,attendance:d.attendance,leaveRequests:d.leaveRequests,leaveTypes:d.leaveTypes,adjustments:d.payrollAdjustments,branch:d.branches.find(b=>b.id===employee.branchId),holidays:d.holidays,shift:d.shifts.find(s=>s.id===employee.shiftId),settings:state.settings,loanDeduction:data.loans.filter(l=>l.employeeId===employee.id && l.status==='approved' && String(l.startPeriod)<=String(row.period)).reduce((sum,l)=>sum+Math.min(Number(l.amount)-Number(l.repaid),Number(l.amount)/Number(l.installments)),0)})); row.status='draft';
  }
  if(key==='salaryRevisions') row.previous=old?.previous ?? emp?.basicSalary ?? 0;
  if(key==='letters' && !row.content) {const t=data.templates.find(x=>x.id===row.templateId);row.content=String(t?.content||'').replaceAll('{{name}}',nameOf(emp as unknown as Row)).replaceAll('{{code}}',emp?.code||'').replaceAll('{{salary}}',money(emp?.basicSalary));}
  let next={...data,[key]:old?data[key].map(x=>x.id===row.id?row:x):[row,...(data[key]||[])]};
  if(key==='salaryRevisions' && String(row.effectiveDate)<=today()) next={...next,employees:next.employees.map(e=>e.id===row.employeeId?{...e,basicSalary:row.amount}:e)};
  if(key==='employees') next.employeeEvents=[{id:uid(),employeeId:row.id,type:old?'note':'joined',date:today(),title:old?'Profile updated':'Employee joined'},...next.employeeEvents];
  set({data:audit(next,state.session.roleId,old?'update':'create',key,row)});
 },
 remove:(key,id)=>{
  const s=get(),row=s.data[key].find(r=>r.id===id)!; if(key==='roles' && row.system) throw new Error('System roles cannot be deleted.');
  if(key==='payrollRuns' && row.status!=='draft') throw new Error('Only draft payroll can be deleted.');
  for(const cfg of resources) for(const f of cfg.fields) if(cfg.key!=='employeeEvents' && f.relation===key && s.data[cfg.key]?.some(r=>r[f.key]===id)) throw new Error(`This record is used in ${cfg.label}. Reassign or remove those references first.`);
  set({data:audit({...s.data,[key]:s.data[key].filter(r=>r.id!==id),...(key==='employees'?{employeeEvents:s.data.employeeEvents.filter(e=>e.employeeId!==id)}:{})},s.session.roleId,'delete',key,row)});
 },
 act:(key,id,action)=>{
  const s=get(),row=s.data[key].find(r=>r.id===id)!;let changed={...row};let data=s.data;
  if(action==='approve'||action==='reject') {
   if(row.status!=='pending') throw new Error('This request is no longer pending.');
   const steps=(row.approvals as ApprovalStep[]||[{level:1,role:'hr',status:'pending'}]); const step=steps.find(x=>x.status==='pending');
   if(s.session.roleId!=='super_admin' && step?.role!==s.session.roleId) throw new Error(`Waiting for ${step?.role || 'HR'} approval.`);
   const chain=steps.map(x=>x===step?{...x,status:action==='approve'?'approved':'rejected',actedAt:new Date().toISOString()}:x);
   changed={...row,approvals:chain,status:action==='reject'?'rejected':chain.some(x=>x.status==='pending')?'pending':'approved'};
   if(changed.status==='approved' && key==='attendanceCorrections') {
    const emp=data.employees.find(e=>e.id===row.employeeId) as unknown as Employee;const sessions=[{in:String(row.checkIn),out:String(row.checkOut)}];const shift=data.shifts.find(x=>x.id===emp.shiftId) as unknown as Shift;
    const existing=data.attendance.find(x=>x.employeeId===emp.id&&x.date===row.date);const a={id:existing?.id||uid(),employeeId:emp.id,date:row.date,sessions,mode:'office',source:'manual',...evaluateDay(sessions,shift)};
    data={...data,attendance:existing?data.attendance.map(x=>x.id===existing.id?a:x):[a,...data.attendance]};
   }
   if(changed.status==='approved' && key==='shiftSwaps') {
    const a=data.roster.find(x=>x.employeeId===row.requesterId&&x.date===row.date),b=data.roster.find(x=>x.employeeId===row.targetId&&x.date===row.date);if(!a||!b) throw new Error('Both employees need a roster assignment for this date.');
    data={...data,roster:data.roster.map(x=>x.id===a.id?{...x,shiftId:b.shiftId}:x.id===b.id?{...x,shiftId:a.shiftId}:x)};
   }
   if(changed.status==='approved'&&key==='resignations') data={...data,employees:data.employees.map(e=>e.id===row.employeeId?{...e,status:'notice',exitDate:row.lastDay}:e)};
  } else if(key==='payrollRuns') {
   const target:Record<string,string>={approveRun:'approved',lock:'locked',pay:'paid'};const before:Record<string,string>={approveRun:'draft',lock:'approved',pay:'locked'};
   if(row.status!==before[action]) throw new Error('Payroll must be approved, locked, then paid in order.');
   changed.status=target[action];changed[`${target[action]}At`]=new Date().toISOString();
   if(action==='pay') {changed.payslips=(row.payslips as Row[]).map(p=>({...p,paymentStatus:'paid'}));data={...data,loans:data.loans.map(l=>l.status==='approved' && String(l.startPeriod)<=String(row.period) && (row.payslips as Row[]).some(p=>p.employeeId===l.employeeId)?{...l,repaid:Math.min(Number(l.amount),Number(l.repaid)+Number(l.amount)/Number(l.installments))}:l)};}
  } else if(action==='acknowledge') changed.acknowledgedBy=[...new Set([...(row.acknowledgedBy as string[]||[]),s.session.employeeId])];
  else if(action==='complete') changed.status='completed';
  else if(action==='paid') {if(row.status!=='approved') throw new Error('Approve before recording payment.');changed.paymentStatus='paid';}
  else if(action==='convert') {
   if(row.stage!=='hired' && row.stage!=='offer') throw new Error('Candidate must be at offer or hired stage.');
   if(row.convertedEmployeeId) throw new Error('This candidate already has an employee record.');
   const employee=defaults('employees',companyData(data,activeCompanyId(data,s.session.companyId))),parts=String(row.name).split(' '); const job=data.jobs.find(j=>j.id===row.jobId);Object.assign(employee,{firstName:parts[0],lastName:parts.slice(1).join(' ')||'—',email:row.email,phone:row.phone,companyId:activeCompanyId(data,s.session.companyId),departmentId:job?.departmentId||employee.departmentId,status:'probation',basicSalary:job?.budget||0,joinDate:today()});data={...data,employees:[employee,...data.employees]};changed={...row,stage:'hired',convertedEmployeeId:employee.id};
  }
  set({data:audit({...data,[key]:data[key].map(r=>r.id===id?changed:r)},s.session.roleId,action,key,row)});
 }
}),{name:'hrms-prototype-v1',version:2,migrate:stored=>{
 const old=stored as Partial<State>;
 return {...old,data:separateCompanyPayroll(old.data||initial().data),session:{roleId:'super_admin',employeeId:'',search:'',signedIn:true,...old.session}} as State;
 },partialize:s=>({data:s.data,settings:s.settings,session:s.session})}));
export function can(module:string,action:string) {const {data,session}=usePrototype.getState();const role=data.roles.find(r=>r.id===session.roleId);if(!role || session.signedIn===false)return false;if(session.roleId==='super_admin')return true;const map:Record<string,string>={self:'self_service',team:'team',roles:'settings',workflows:'settings'};const allowed=(role.permissions as Record<string,string[]>)[module]||(role.permissions as Record<string,string[]>)[map[module]||module]||[];return allowed.includes(action);}
export function visibleRows(key:string) {const {data,session}=usePrototype.getState();const role=data.roles.find(r=>r.id===session.roleId);const all=companyData(data,session.companyId)[key]||[];if(!role || role.scope==='all')return all;const me=data.employees.find(e=>e.id===session.employeeId);const ids=role.scope==='self'?[me?.id]:data.employees.filter(e=>role.scope==='team'?e.managerId===me?.id:role.scope==='department'?e.departmentId===me?.departmentId:e.branchId===me?.branchId).map(e=>e.id);return all.filter(r=>key==='employees'?ids.includes(r.id):r.employeeId?ids.includes(String(r.employeeId)):r.requesterId?ids.includes(String(r.requesterId)):true);}
export function addAuditExport(key:string) {const s=usePrototype.getState();usePrototype.setState({data:audit(s.data,s.session.roleId,'export',key,{id:uid(),name:key})});}
export function download(name:string,content:string,type='text/csv') {const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csv(rows:Row[],columns:string[],format:(r:Row,key:string)=>string) {const esc=(v:string)=>`"${(/^[=+\-@]/.test(v)?"'":'')+v.replaceAll('"','""')}"`;return '\uFEFF'+[columns.map(esc).join(','),...rows.map(r=>columns.map(k=>esc(format(r,k))).join(','))].join('\r\n');}
export function demoPermissions() {return Object.fromEntries(modules.filter(m=>m.resources.length).map(m=>[m.key,['view','create','edit','delete','approve','export']]));}








export function useWorkspace() {
 const state=usePrototype();
 const data=useMemo(()=>companyData(state.data,state.session.companyId),[state.data,state.session.companyId]);
 return {...state,data};
}
export function useWorkspaceData() { return useWorkspace().data; }