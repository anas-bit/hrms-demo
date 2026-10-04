import { build } from 'esbuild';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { mkdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const out=resolve('.hrms-test-tmp/state.mjs');await mkdir(resolve('.hrms-test-tmp'),{recursive:true});
await build({entryPoints:['src/hrms/prototype/state.ts'],outfile:out,bundle:true,platform:'node',format:'esm'});
const {usePrototype,defaults,today,can,visibleRows}=await import(pathToFileURL(out).href);
const {resources}=await import(pathToFileURL(resolve('.hrms-test-tmp/schema.mjs')).href).catch(async()=>{await build({entryPoints:['src/hrms/prototype/schema.ts'],outfile:resolve('.hrms-test-tmp/schema.mjs'),bundle:true,platform:'node',format:'esm'});return import(pathToFileURL(resolve('.hrms-test-tmp/schema.mjs')).href)});
after(()=>rm(resolve('.hrms-test-tmp'),{recursive:true,force:true}));
const state=()=>usePrototype.getState();
function reset(){state().reset();state().setSession({roleId:'super_admin',employeeId:state().data.employees[0].id,companyId:state().data.companies[0].id,signedIn:true});}
test('every resource has seeded, serializable data and CRUD actions',()=>{reset();assert.ok(resources.length>55);for(const resource of resources){assert.ok(Array.isArray(state().data[resource.key]),resource.key);assert.ok(state().data[resource.key].length>0,`seed missing: ${resource.key}`);}assert.doesNotThrow(()=>JSON.stringify(state().data));});
test('CRUD persists a record and audit trail',()=>{reset();const row={...defaults('assets',state().data),name:'Test laptop',serial:'CRUD-123',status:'available',employeeId:''};state().save('assets',row);assert.ok(state().data.assets.some(r=>r.id===row.id));state().save('assets',{...row,name:'Updated laptop'});assert.equal(state().data.assets.find(r=>r.id===row.id).name,'Updated laptop');assert.ok(memory.get('hrms-prototype-v1').includes('Updated laptop'));state().remove('assets',row.id);assert.ok(!state().data.assets.some(r=>r.id===row.id));assert.equal(state().data.audit[0].action,'delete');});
test('employee create edit delete and duplicate guard',()=>{reset();const row={...defaults('employees',state().data),firstName:'Demo',lastName:'Tester',email:'test@example.com',code:'TEST-999',joinDate:today()};state().save('employees',row);state().save('employees',{...row,phone:'123'});assert.equal(state().data.employees.find(r=>r.id===row.id).phone,'123');assert.throws(()=>state().save('employees',{...row,id:crypto.randomUUID()}),/unique/);state().remove('employees',row.id);assert.ok(!state().data.employees.find(r=>r.id===row.id));assert.ok(!state().data.employeeEvents.find(r=>r.employeeId===row.id));});
test('related records and system roles cannot be deleted',()=>{reset();assert.throws(()=>state().remove('departments',state().data.employees[0].departmentId),/used/);assert.throws(()=>state().remove('roles','super_admin'),/System/);});
test('attendance derives minutes and prevents duplicate days',()=>{reset();const employee=state().data.employees[0];const row={...defaults('attendance',state().data),employeeId:employee.id,date:'2030-01-07',sessions:[{in:'09:00',out:'18:00'}],mode:'office',source:'manual'};state().save('attendance',row);const saved=state().data.attendance.find(r=>r.id===row.id);assert.ok(saved.workMinutes>0);assert.ok(['present','late','half_day'].includes(saved.status));assert.throws(()=>state().save('attendance',{...row,id:crypto.randomUUID()}),/already exists/);});
test('leave dates, overlap and approval levels are validated',()=>{reset();const emp=state().data.employees[3];const type=state().data.leaveTypes.find(t=>!t.paid)||state().data.leaveTypes[0];const row={...defaults('leaveRequests',state().data),employeeId:emp.id,leaveTypeId:type.id,from:'2026-12-07',to:'2026-12-08',reason:'Testing',duration:'full',status:'pending',attachment:'proof.pdf'};state().save('leaveRequests',row);assert.equal(state().data.leaveRequests.find(r=>r.id===row.id).days,2);assert.throws(()=>state().save('leaveRequests',{...row,id:crypto.randomUUID()}),/Overlaps/);assert.throws(()=>state().save('leaveRequests',{...row,from:'2026-12-09',to:'2026-12-08'}),/End date/);let saved=state().data.leaveRequests.find(r=>r.id===row.id);const count=saved.approvals.length;for(let i=0;i<count;i++)state().act('leaveRequests',row.id,'approve');saved=state().data.leaveRequests.find(r=>r.id===row.id);assert.equal(saved.status,'approved');assert.ok(saved.approvals.every(a=>a.status==='approved'));});
test('payroll calculates, protects locks, and records payments once',()=>{reset();const row={...defaults('payrollRuns',state().data),period:'2030-01',branchId:'all',cycle:'monthly'};state().save('payrollRuns',row);const run=state().data.payrollRuns.find(r=>r.id===row.id);assert.ok(run.payslips.length>0);for(const p of run.payslips)assert.equal(p.net,Math.max(0,p.gross-p.totalDeductions));assert.throws(()=>state().act('payrollRuns',row.id,'pay'),/order/);state().act('payrollRuns',row.id,'approveRun');assert.throws(()=>state().save('payrollRuns',row),/cannot be edited/);state().act('payrollRuns',row.id,'lock');assert.throws(()=>state().remove('payrollRuns',row.id),/Only draft/);state().act('payrollRuns',row.id,'pay');assert.equal(state().data.payrollRuns.find(r=>r.id===row.id).status,'paid');assert.ok(state().data.payrollRuns.find(r=>r.id===row.id).payslips.every(p=>p.paymentStatus==='paid'));assert.throws(()=>state().act('payrollRuns',row.id,'pay'),/order/);});
test('candidate converts once into an employee',()=>{reset();const c=state().data.candidates.find(c=>c.stage==='offer');state().act('candidates',c.id,'convert');const updated=state().data.candidates.find(r=>r.id===c.id);assert.equal(updated.stage,'hired');assert.ok(state().data.employees.some(e=>e.id===updated.convertedEmployeeId));assert.throws(()=>state().act('candidates',c.id,'convert'),/already/);});
test('roster conflicts and loan validation',()=>{reset();const row={...defaults('roster',state().data),date:'2030-02-01'};state().save('roster',row);assert.throws(()=>state().save('roster',{...row,id:crypto.randomUUID()}),/already has/);assert.throws(()=>state().save('loans',{...defaults('loans',state().data),amount:100,repaid:200,installments:1,reason:'test'}),/repayment/);});
test('employee role can only see its own employee record',()=>{reset();const emp=state().data.employees[3];state().setSession({roleId:'employee',employeeId:emp.id});assert.equal(can('payroll','view'),false);assert.equal(can('self','create'),true);assert.equal(visibleRows('employees').length,1);assert.equal(visibleRows('employees')[0].id,emp.id);});
test('restore restores edits and reset rebuilds sample data',()=>{reset();const data=structuredClone(state().data),settings=structuredClone(state().settings);state().configure({overtimeMultiplier:2});assert.equal(state().settings.overtimeMultiplier,2);state().restore(data,settings);assert.equal(state().settings.overtimeMultiplier,settings.overtimeMultiplier);state().reset();assert.ok(state().data.employees.length>0);});
test('create update delete works across every module resource',()=>{
 for(const cfg of resources){
  reset();const sample=structuredClone(state().data[cfg.key][0]);const row={...defaults(cfg.key,state().data),...sample,id:crypto.randomUUID(),system:false};
  if(cfg.key==='employees'){row.code='CRUD-UNIQUE';row.email='crud-unique@example.com';}
  if(cfg.key==='attendance'||cfg.key==='roster')row.date='2031-01-06';
  if(cfg.key==='leaveRequests'){row.from='2026-12-14';row.to='2026-12-14';row.duration='full';row.leaveTypeId=state().data.leaveTypes.find(t=>!t.paid).id;row.attachment='proof.pdf';}
  if(cfg.key==='payrollRuns'){row.period='2031-01';row.status='draft';row.branchId='all';}
  if(cfg.approval)row.status='pending';
  for(const f of cfg.fields)if(f.required&&!row[f.key])row[f.key]=f.relation?state().data[f.relation][0].id:f.options?f.options[0]:f.type==='date'?today():f.type==='time'?'09:00':f.type==='month'?'2031-01':'Demo record';
  try{state().save(cfg.key,row);const saved=state().data[cfg.key].find(r=>r.id===row.id);assert.ok(saved);state().save(cfg.key,{...saved,prototypeNote:'CRUD edited'});assert.equal(state().data[cfg.key].find(r=>r.id===row.id).prototypeNote,'CRUD edited');state().remove(cfg.key,row.id);assert.ok(!state().data[cfg.key].find(r=>r.id===row.id));}catch(e){throw new Error(`${cfg.key}: ${e.message}`);}
 }
});
test('organization switching scopes employees, attendance and payroll and persists selection',()=>{
 reset();const company=state().data.companies[1];state().switchCompany(company.id);
 assert.equal(state().session.companyId,company.id);
 assert.ok(state().data.employees.some(e=>e.id===state().session.employeeId&&e.companyId===company.id));
 const employees=visibleRows('employees');assert.ok(employees.length>0);assert.ok(employees.every(e=>e.companyId===company.id));
 const ids=new Set(employees.map(e=>e.id));assert.ok(visibleRows('attendance').every(a=>ids.has(a.employeeId)));
 assert.ok(visibleRows('payrollRuns').every(run=>run.companyId===company.id&&run.payslips.every(p=>ids.has(p.employeeId))));
 assert.equal(JSON.parse(memory.get('hrms-prototype-v1')).state.session.companyId,company.id);
 assert.throws(()=>state().switchCompany('missing-company'),/not found/);
});
test('new records and payroll stay with the selected organization',()=>{
 reset();const company=state().data.companies[1];state().switchCompany(company.id);
 const row={...defaults('assets',state().data),id:crypto.randomUUID(),name:'Logistics scanner',serial:'LOG-TEST',employeeId:'',status:'available'};
 state().save('assets',row);assert.equal(state().data.assets.find(r=>r.id===row.id).companyId,company.id);assert.ok(visibleRows('assets').some(r=>r.id===row.id));
 const run={...defaults('payrollRuns',state().data),period:'2032-01',branchId:'all',cycle:'monthly'};state().save('payrollRuns',run);
 const saved=state().data.payrollRuns.find(r=>r.id===run.id);assert.ok(saved.payslips.length>0);
 assert.ok(saved.payslips.every(p=>state().data.employees.some(e=>e.id===p.employeeId&&e.companyId===company.id)));
 state().switchCompany(state().data.companies[0].id);assert.ok(!visibleRows('assets').some(r=>r.id===row.id));assert.ok(!visibleRows('payrollRuns').some(r=>r.id===run.id));
});
test('empty company does not inherit another company employee',()=>{
 reset();const company={...defaults('companies',state().data),name:'New company',id:crypto.randomUUID()};state().save('companies',company);state().switchCompany(company.id);
 assert.equal(state().session.employeeId,'');assert.equal(visibleRows('employees').length,0);assert.equal(visibleRows('attendance').length,0);assert.equal(visibleRows('payrollRuns').length,0);
});
test('logout persists, clears identity and leaves records intact',async()=>{
 reset();state().switchCompany(state().data.companies[1].id);const companyId=state().session.companyId,employeeCount=state().data.employees.length;
 state().signOut();assert.equal(state().session.signedIn,false);assert.equal(state().session.employeeId,'');assert.equal(state().session.roleId,'');assert.equal(can('employees','view'),false);assert.equal(state().data.employees.length,employeeCount);
 await usePrototype.persist.rehydrate();assert.equal(state().session.signedIn,false);
 state().signIn();assert.equal(state().session.signedIn,true);assert.equal(state().session.companyId,companyId);assert.equal(state().session.roleId,'super_admin');assert.equal(state().data.employees.length,employeeCount);
});
test('user guide covers all modules and the shell links to it',async()=>{
 await build({stdin:{contents:"export {UserGuide} from './src/hrms/prototype/UserGuide'; export {WorkspaceShell as Shell} from './src/hrms/prototype/Shell'; export {SignedOutPage} from './src/pages/LoginPage'; export {usePrototype} from './src/hrms/prototype/state';",resolveDir:process.cwd(),loader:'tsx'},outfile:resolve('.hrms-test-tmp/ui.mjs'),bundle:true,platform:'node',format:'esm',jsx:'automatic',packages:'external'});
 const {createElement}=await import('react');const {renderToStaticMarkup}=await import('react-dom/server');const {MemoryRouter}=await import('react-router-dom');const ui=await import(pathToFileURL(resolve('.hrms-test-tmp/ui.mjs')).href);
 ui.usePrototype.getState().signIn();const guide=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(ui.UserGuide)));
 assert.match(guide,/HRMS User Guide/);assert.match(guide,/Search user guide/);assert.equal((guide.match(/<article /g)||[]).length,30);assert.match(guide,/25\. Workflows/);assert.match(guide,/Common problems/);
 globalThis.document={documentElement:{classList:{contains:()=>false}}};
 const shell=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(ui.Shell)));
 assert.match(shell,/href="\/app\/user-guide"/);assert.match(shell,/Switch organization/);assert.match(shell,/Open user menu/);
 ui.usePrototype.getState().signOut();
 const login=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(ui.SignedOutPage,{onSignIn:ui.usePrototype.getState().signIn})));assert.match(login,/Sign in/);assert.match(login,/type="email"/);assert.match(login,/type="password"/);assert.match(login,/Show password/);assert.match(login,/Demo sign-in details/);
});
test('login validates demo credentials and only then starts a session',()=>{
 reset();state().signOut();assert.throws(()=>state().login('',''),/Enter your email/);assert.throws(()=>state().login('wrong@example.com','wrong'),/incorrect/);assert.equal(state().session.signedIn,false);
 state().login(' ADMIN@HRMS.DEMO ','HRMS@2026');assert.equal(state().session.signedIn,true);assert.equal(state().session.roleId,'super_admin');
});
