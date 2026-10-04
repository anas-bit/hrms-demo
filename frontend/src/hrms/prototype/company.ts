import type { Row } from './schema';
export const sharedCollections = new Set(['companies','roles','workflows','delegations','integrations','customFields','leaveTypes','shifts','salaryComponents','templates','policies']);
const sharedLegacy = new Set(['departments','teams','designations','grades','costCenters']);
export function activeCompanyId(data: Record<string, Row[]>, requested?: string) {
 return data.companies.some(c=>c.id===requested)?requested!:data.companies[0]?.id || '';
}
// Resolve legacy demo ownership through branch/employee/related records. Shared
// rules remain global; new operational rows receive an explicit company ID.
export function companyData(data: Record<string, Row[]>, requested?: string): Record<string, Row[]> {
 const companyId=activeCompanyId(data,requested),cache=new Map<string,boolean>();
 const belongs=(key:string,row:Row,seen=new Set<string>()):boolean=>{
  if(sharedCollections.has(key))return true;
  const token=`${key}:${row.id}`;
  if(cache.has(token))return cache.get(token)!;
  if(seen.has(token))return false;
  const next=new Set(seen).add(token);let result:boolean;
  if(row.companyId)result=row.companyId===companyId;
  else if(sharedLegacy.has(key))result=true;
  else if(row.branchId && row.branchId!=='all')result=data.branches.some(b=>b.id===row.branchId&&b.companyId===companyId);
  else if(row.employeeId || row.requesterId)result=data.employees.some(e=>e.id===(row.employeeId||row.requesterId)&&e.companyId===companyId);
  else if(key==='payrollRuns')result=(row.payslips as Row[]||[]).some(p=>data.employees.some(e=>e.id===p.employeeId&&e.companyId===companyId));
  else {
   const relation = row.candidateId?['candidates',row.candidateId]:row.jobId?['jobs',row.jobId]:row.courseId?['courses',row.courseId]:undefined;
   const parent=relation&&data[String(relation[0])]?.find(r=>r.id===relation[1]);
   result=parent?belongs(String(relation![0]),parent,next):companyId===data.companies[0]?.id;
  }
  cache.set(token,result);return result;
 };
 const scoped=Object.fromEntries(Object.entries(data).map(([key,rows])=>[key,rows.filter(row=>belongs(key,row))]));
 const employees=new Set(scoped.employees.map(e=>e.id));
 scoped.payrollRuns=scoped.payrollRuns.map(run=>({...run,payslips:(run.payslips as Row[]||[]).filter(p=>employees.has(String(p.employeeId)))}));
 return scoped;
}

export function separateCompanyPayroll(data: Record<string,Row[]>): Record<string,Row[]> {
 return {...data,payrollRuns:data.payrollRuns.flatMap(run=>{
  if(run.companyId)return [run];
  const slips=run.payslips as Row[]||[];
  return data.companies.flatMap(company=>{
   const owned=slips.filter(p=>data.employees.some(e=>e.id===p.employeeId&&e.companyId===company.id));
   if(!owned.length)return [];
   const id=`${run.id}-${company.id}`;
   return [{...run,id,companyId:company.id,payslips:owned.map(p=>({...p,id:`${id}-${p.employeeId}`,runId:id}))}];
  });
 })};
}
