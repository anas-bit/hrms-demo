import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { usePrototype, pause } from '../hrms/prototype/state';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../hrms/prototype/auth';
import { Button } from '../components/ui/button';
import { inputClass } from '../hrms/prototype/Forms';
export function LoginPage() {
 const signedIn=usePrototype(s=>s.session.signedIn);
 const login=usePrototype(s=>s.login);
 if(signedIn===true)return <Navigate to="/app" replace/>;
 return <SignedOutPage onSignIn={login}/>;
}
export function SignedOutPage({onSignIn}:{onSignIn:(email:string,password:string)=>void}) {
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 return <main className="min-h-dvh bg-background grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
  <section className="hidden lg:flex flex-col justify-between bg-[#192e28] text-[#edf2ee] p-12 xl:p-16">
   <div className="flex items-center gap-3"><span className="brand-mark"><Users className="size-5"/></span><span className="text-xl font-semibold tracking-tight">HRMS</span></div>
   <div className="max-w-md my-16"><p className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-6">People operations</p><h1 className="text-5xl xl:text-6xl font-medium tracking-[-0.05em] leading-[1.08]">A clearer way<br/>to manage<br/><span className="text-[#c8dbb8]">your people.</span></h1><p className="mt-7 text-white/60 text-base leading-relaxed max-w-sm">Employee records, time off and payroll. One workspace for the work behind your workforce.</p><div className="mt-12 space-y-5">{[['01','People','From the first day to the next chapter.'],['02','Time','Attendance, shifts and leave together.'],['03','Pay','Review, approve and close payroll.']].map(([number,title,description])=><div key={number} className="flex gap-4 items-start"><span className="text-xs text-white/35 pt-1">{number}</span><div><p className="text-sm font-medium">{title}</p><p className="text-xs text-white/45 mt-1">{description}</p></div></div>)}</div></div>
   <p className="text-[11px] text-white/35">HRMS · People operations</p>
  </section>
  <section className="min-h-dvh flex flex-col px-6 py-7 sm:px-12 lg:px-16">
   <div className="flex justify-between items-center"><div className="flex items-center gap-2 lg:invisible"><Users className="size-5 text-primary"/><span className="font-semibold">HRMS</span></div><span className="text-xs text-muted-foreground">HRMS workspace</span></div>
   <div className="flex-1 flex items-center justify-center py-12"><div className="w-full max-w-sm">
    <span className="inline-flex items-center justify-center size-10 rounded-lg bg-primary-soft text-primary mb-6"><LockKeyhole className="size-5"/></span>
    <h2 className="text-[32px] font-medium tracking-[-0.04em]">Welcome back</h2><p className="mt-2 mb-8 text-muted-foreground leading-relaxed">Sign in to your HRMS workspace.</p>
    <form onSubmit={async event=>{event.preventDefault();if(busy)return;setError('');setBusy(true);try{await pause();onSignIn(email,password);}catch(err){setError((err as Error).message);}finally{setBusy(false);}}} className="space-y-5">
     <div><label htmlFor="login-email" className="block text-xs font-medium mb-2">Email address</label><input id="login-email" name="email" type="email" autoComplete="username" required disabled={busy} className={`${inputClass} !py-3`} placeholder="you@company.com" value={email} aria-invalid={!!error} aria-describedby={error?'login-error':undefined} onChange={e=>{setEmail(e.target.value);setError('')}}/></div>
     <div><label htmlFor="login-password" className="block text-xs font-medium mb-2">Password</label><div className="relative"><input id="login-password" name="password" type={showPassword?'text':'password'} autoComplete="current-password" required disabled={busy} className={`${inputClass} !py-3 pr-12`} placeholder="Enter your password" value={password} aria-invalid={!!error} aria-describedby={error?'login-error':undefined} onChange={e=>{setPassword(e.target.value);setError('')}}/><button type="button" aria-label={showPassword?'Hide password':'Show password'} aria-pressed={showPassword} disabled={busy} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground rounded" onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff className="size-4"/>:<Eye className="size-4"/>}</button></div></div>
     {error&&<p id="login-error" role="alert" className="text-xs bg-danger-soft text-danger rounded-md p-3 leading-relaxed">{error}</p>}
     <Button type="submit" loading={busy} size="lg" className="w-full !h-11">Sign in<ArrowRight/></Button>
    </form>
    <details className="mt-7 bg-sunken/50 rounded-lg p-4"><summary className="cursor-pointer text-xs font-medium text-muted-foreground">Demo sign-in details</summary><p className="text-xs text-muted-foreground leading-relaxed mt-3">Use this sample account to explore the prototype.</p><dl className="text-xs mt-3 space-y-2"><div className="flex justify-between gap-2"><dt className="text-muted-foreground">Email</dt><dd className="font-mono">{DEMO_EMAIL}</dd></div><div className="flex justify-between gap-2"><dt className="text-muted-foreground">Password</dt><dd className="font-mono">{DEMO_PASSWORD}</dd></div></dl><Button type="button" variant="link" size="xs" className="!px-0 mt-3" disabled={busy} onClick={()=>{setEmail(DEMO_EMAIL);setPassword(DEMO_PASSWORD);setError('')}}>Use demo credentials</Button><p className="text-[10px] text-muted-foreground mt-2">Local demo authentication.</p></details>
   </div></div>
   <p className="text-[11px] text-muted-foreground text-center">HRMS · People operations</p>
  </section>
 </main>;
}
