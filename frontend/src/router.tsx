import { LoginPage } from './pages/LoginPage';
import { UserGuide } from './hrms/prototype/UserGuide';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Guard } from './hrms/prototype/Guard';
import { Shell } from './hrms/prototype/Shell';
import { ModulePage } from './hrms/prototype/Records';
import { Dashboard, Approvals, Workspace, Reports, Settings } from './hrms/prototype/Pages';
export const router=createBrowserRouter([
 {path:'/',element:<Navigate to="/app" replace/>},
 {path:'/login',element:<LoginPage/>},
 {path:'/app',element:<Shell/>,children:[
  {index:true,element:<Dashboard/>},
  {path:'user-guide',element:<UserGuide/>},
  {path:'hr',element:<Navigate to="/app/employees" replace/>},
  {path:'hr/payroll',element:<Navigate to="/app/payroll" replace/>},
  {path:'hr/payment',element:<Navigate to="/app/payroll" replace/>},
  {path:'hr/add',element:<Navigate to="/app/employees?new=1" replace/>},
  {path:'hr/employees/:id',element:<Navigate to="/app/employees" replace/>},
  {path:'self',element:<Guard module="self"><Workspace/></Guard>},
  {path:'team',element:<Guard module="team"><Workspace team/></Guard>},
  {path:'approvals',element:<Guard module="approvals"><Approvals/></Guard>},
  {path:'reports',element:<Guard module="reports"><Reports/></Guard>},
  {path:'settings',element:<Guard module="settings"><Settings/></Guard>},
  {path:':module',element:<ModulePage/>}
 ]},
 {path:'*',element:<Navigate to="/app" replace/>}
]);

