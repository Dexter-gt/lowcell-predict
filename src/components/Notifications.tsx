import {useEffect,useMemo,useRef,useState} from 'react';
import {Bell,CheckCheck,Clock,Gift,Info,ListChecks,Settings,TrendingUp,Users,Zap} from 'lucide-react';
import {useApp} from '../state/store';import type {Notif} from '../state/store';
import {useMarkets} from '../hooks/useMarkets';import {countdown} from '../hooks/useNow';
import {lead} from './panels';import {cx} from './ui';import {Btn,Empty} from './kit';
const ICON={trade:TrendingUp,order:ListChecks,reward:Gift,copy:Users,system:Info,alert:Zap};
const TONE={trade:'bg-up/15 text-up',order:'bg-accent/15 text-accent',reward:'bg-orange/15 text-orange',copy:'bg-blue/15 text-blue',system:'bg-fg/10 text-mute',alert:'bg-accent/15 text-accent'};
const ago=(n:Notif)=>{if(n.kind==='alert')return'Live';const s=Math.floor((Date.now()-n.t)/1000);return s<60?'just now':s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:`${Math.floor(s/86400)}d ago`};
// Activity (fills, orders, rewards…) is stored in state; alerts (closing soon, big edge) are computed live from market data.
// TODO(polymarket): drive order fills / resolutions from the user's websocket feed.
export function Notifications({go}:{go:(r:string)=>void}){
 const{s,a}=useApp(),ms=useMarkets(),[open,setOpen]=useState(false),box=useRef<HTMLDivElement>(null),minute=Math.floor(Date.now()/6e4);
 const live=useMemo(()=>{const out:Notif[]=[],now=Date.now();
  (ms??[]).forEach(m=>{const left=m.endsAt-now;if(m.priced===false)return;
   if(s.settings.close&&left>0&&left<6*36e5)out.push({id:'close-'+m.id,t:now,kind:'alert',title:'Closing soon',body:`${m.title} ends in ${countdown(left)}`,to:'market-'+m.id});
   if(s.settings.edge&&m.modeled!==false){const l=lead(m),e=l.lowcell-l.market;if(Math.abs(e)>=.05)out.push({id:'edge-'+m.id,t:now-1,kind:'alert',title:`${e>0?'+':''}${(e*100).toFixed(1)} pts edge`,body:`LOWCELL leans ${l.label} on ${m.title}`,to:'market-'+m.id})}});
  return out},[ms,minute,s.settings.edge,s.settings.close]);
 const all=[...live,...s.notifs].sort((x,y)=>y.t-x.t),unread=all.filter(n=>!s.notifRead.includes(n.id));
 useEffect(()=>{if(!open)return;const d=(e:MouseEvent)=>{if(box.current&&!box.current.contains(e.target as Node))setOpen(false)},k=(e:KeyboardEvent)=>e.key==='Escape'&&setOpen(false);addEventListener('mousedown',d);addEventListener('keydown',k);return()=>{removeEventListener('mousedown',d);removeEventListener('keydown',k)}},[open]);
 const pick=(n:Notif)=>{a.readNotifs([n.id]);setOpen(false);if(n.to)go(n.to)};
 return <div ref={box} className="relative">
  <button aria-label={`Notifications, ${unread.length} unread`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(!open)} className={cx('relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-mute transition-colors hover:bg-fg/5 hover:text-ink',open&&'bg-fg/10 text-ink')}>
   <Bell size={18}/>{unread.length>0&&<span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-down px-1 text-[11px] font-bold leading-none text-white">{unread.length>9?'9+':unread.length}</span>}</button>
  {open&&<div role="dialog" aria-label="Notifications" className="rise fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[24rem]">
   <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3"><h2 className="text-sm font-bold">Notifications{unread.length>0&&<span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">{unread.length} new</span>}</h2>
    <button disabled={unread.length===0} onClick={()=>a.readNotifs(all.map(n=>n.id))} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/10 disabled:text-mute disabled:hover:bg-transparent"><CheckCheck size={14}/>Mark all read</button></div>
   <div className="max-h-[min(26rem,60vh)] overflow-y-auto">{all.length===0?<Empty text="You’re all caught up."/>:<ul>{all.map(n=>{const I=n.id.startsWith('close')?Clock:ICON[n.kind],isNew=!s.notifRead.includes(n.id);return <li key={n.id} className="border-b border-line/60 last:border-0"><button onClick={()=>pick(n)} className={cx('flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-fg/5',isNew&&'bg-accent/[.04]')}>
     <span className={cx('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full',TONE[n.kind])}><I size={16}/></span>
     <span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-3"><span className="truncate text-sm font-semibold">{n.title}</span><span className="shrink-0 text-xs text-mute">{ago(n)}</span></span><span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-mute">{n.body}</span></span>
     {isNew&&<i aria-label="Unread" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent"/>}</button></li>})}</ul>}</div>
   <div className="border-t border-line p-2"><button onClick={()=>{setOpen(false);go('account')}} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold text-mute transition-colors hover:bg-fg/5 hover:text-ink"><Settings size={14}/>Notification settings</button></div></div>}</div>}
