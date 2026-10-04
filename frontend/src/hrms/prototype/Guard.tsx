import type { ReactNode } from 'react';
import { usePrototype, can } from './state';
import { Empty } from './Records';
export function Guard({module,children}:{module:string;children:ReactNode}) {usePrototype(s=>s.session);usePrototype(s=>s.data.roles);return can(module,'view')?<>{children}</>:<Empty title="Access restricted" description="Select a permitted demo role to view this page."/>;}
