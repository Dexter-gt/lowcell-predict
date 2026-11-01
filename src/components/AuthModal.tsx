import {useEffect,useRef,useState} from 'react';
import {Check,Mail,X} from 'lucide-react';
import {auth,short} from '../integrations/providers';import {useApp} from '../state/store';
import {Logo} from './Logo';import {Btn} from './kit';import {cx} from './ui';
type Step='email'|'code'|'wallet'|'done';
// Privy-style flow: email -> confirmation code -> embedded wallet created automatically.
export function AuthModal(){
 const{authOpen,closeAuth,a,toast}=useApp();
 const[step,setStep]=useState<Step>('email'),[email,setEmail]=useState(''),[code,setCode]=useState(['','','','','','']),[err,setErr]=useState(''),[busy,setBusy]=useState(false),[wait,setWait]=useState(0),[addr,setAddr]=useState('');
 const refs=useRef<(HTMLInputElement|null)[]>([]);
 useEffect(()=>{if(authOpen){setStep('email');setEmail('');setCode(['','','','','','']);setErr('');setBusy(false)}},[authOpen]);
 useEffect(()=>{if(wait<=0)return;const t=setTimeout(()=>setWait(wait-1),1000);return()=>clearTimeout(t)},[wait]);
 useEffect(()=>{const k=(e:KeyboardEvent)=>e.key==='Escape'&&closeAuth();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
 const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 const send=async()=>{setBusy(true);setErr('');await auth.sendCode(email);setBusy(false);setStep('code');setWait(30);setTimeout(()=>refs.current[0]?.focus(),50)};
 const verify=async(c:string)=>{setBusy(true);setErr('');try{setStep('wallet');const r=await auth.verifyCode(email,c);await new Promise(r=>setTimeout(r,900));await a.completeAuth(r);setAddr(r.address);setStep('done');setTimeout(()=>{closeAuth();toast(`Welcome, ${r.user.name}`)},1500)}catch{setStep('code');setErr('That code didn’t work. Try again.');setCode(['','','','','','']);refs.current[0]?.focus()}setBusy(false)};
 const put=(i:number,v:string)=>{const d=v.replace(/\D/g,'');if(!d&&v!=='')return;const n=[...code];if(d.length>1){d.slice(0,6).split('').forEach((x,j)=>n[j]=x)}else n[i]=d;setCode(n);const nxt=d.length>1?Math.min(5,d.length):i+(d?1:0);refs.current[nxt]?.focus();if(n.every(Boolean))verify(n.join(''))};
 if(!authOpen)return null;
 return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={e=>e.target===e.currentTarget&&closeAuth()}>
  <div role="dialog" aria-modal="true" aria-label="Log in or sign up" className="rise relative w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-2xl">
   <button aria-label="Close" onClick={closeAuth} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-mute hover:bg-fg/5 hover:text-ink"><X size={18}/></button>
   <div className="flex justify-center text-ink"><Logo className="h-6"/></div>
   {step==='email'&&<form className="mt-7 space-y-4" onSubmit={e=>{e.preventDefault();valid&&send()}}><h2 className="text-center text-lg font-extrabold">Log in or sign up</h2>
    <label className="flex h-12 items-center gap-3 rounded-xl border border-line bg-raised px-4 text-mute focus-within:border-accent"><Mail size={18}/><input autoFocus type="email" autoComplete="email" aria-label="Email address" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-mute"/></label>
    <Btn className="h-12 w-full" disabled={!valid} busy={busy} onClick={send}>Submit</Btn>
    <p className="text-center text-xs text-mute">A wallet is created for you automatically when you sign up.</p></form>}
   {step==='code'&&<div className="mt-7 space-y-4 text-center"><h2 className="text-lg font-extrabold">Enter confirmation code</h2><p className="text-sm text-mute">Please check <b className="text-ink">{email}</b> for an email from LOWCELL and enter your code below.</p>
    <div className="flex justify-center gap-2">{code.map((c,i)=><input key={i} ref={el=>{refs.current[i]=el}} aria-label={`Digit ${i+1}`} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={c} onChange={e=>put(i,e.target.value)} onKeyDown={e=>e.key==='Backspace'&&!c&&i>0&&refs.current[i-1]?.focus()} className={cx('h-12 w-11 rounded-xl border bg-raised text-center text-lg font-bold outline-none focus:border-accent',err?'border-down':'border-line')}/>)}</div>
    {err&&<p role="alert" className="text-sm text-down">{err}</p>}
    <p className="text-xs text-mute">Prototype: any 6 digits will work.</p>
    <p className="text-sm text-mute">Didn’t get an email? <button disabled={wait>0} onClick={async()=>{await auth.sendCode(email);setWait(30);toast('Code sent again')}} className="font-semibold text-accent disabled:text-mute">{wait>0?`Resend code in ${wait}s`:'Resend code'}</button></p>
    <button onClick={()=>setStep('email')} className="text-xs font-semibold text-mute hover:text-ink">Use a different email</button></div>}
   {(step==='wallet'||step==='done')&&<div className="mt-7 space-y-5 text-center"><h2 className="text-lg font-extrabold">{step==='done'?'You’re in':'Setting up your wallet'}</h2>
    <ul className="space-y-3 text-left text-sm">{[['Email verified',true],['Wallet created',step==='done'],['$10,000 practice cash added',step==='done']].map(([t,d],i)=><li key={i} className="flex items-center gap-3"><span className={cx('grid h-6 w-6 place-items-center rounded-full',d?'bg-up/20 text-up':'bg-fg/10')}>{d?<Check size={14}/>:<i className="h-3 w-3 animate-spin rounded-full border-2 border-mute border-t-transparent"/>}</span><span className={d?'text-ink':'text-mute'}>{t as string}</span></li>)}</ul>
    {step==='done'&&<p className="rounded-xl bg-raised p-3 font-mono text-xs text-mute">{short(addr)}</p>}</div>}
  </div></div>}
