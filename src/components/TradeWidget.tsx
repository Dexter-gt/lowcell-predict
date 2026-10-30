import {useEffect,useState} from 'react';
import {Minus,Plus} from 'lucide-react';
import type {Market} from '../data/types';
import {useApp,priceOf,mark,label} from '../state/store';
import {cx} from './ui';import {Btn} from './kit';import {MarketImage} from './MarketImage';
export interface Pick{outcome:string;side?:'Yes'|'No'}
export const binary=(m:Market)=>m.kind==='updown'||m.kind==='overunder'||m.kind==='versus';
export const defaultPick=(m:Market):Pick=>binary(m)?{outcome:m.outcomes[0].label}:{outcome:m.outcomes.reduce((a,b)=>b.market>a.market?b:a).label,side:'Yes'};
export const cents=(p:number)=>`${Math.round(p*1000)/10}¢`;
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
function Stepper({label:l,value,set,step,unit}:{label:string;value:number;set:(v:number)=>void;step:number;unit?:string}){
 return <div><p className="mb-1.5 text-xs font-semibold text-mute">{l}</p><div className="flex h-12 items-center rounded-xl border border-line bg-raised focus-within:border-accent">
  <button aria-label={`Decrease ${l}`} onClick={()=>set(value-step)} className="grid h-full w-12 place-items-center text-mute hover:text-ink"><Minus size={16}/></button>
  <input aria-label={l} inputMode="decimal" value={value} onChange={e=>set(+e.target.value||0)} className="min-w-0 flex-1 bg-transparent text-center text-base font-bold tabular-nums outline-none"/>{unit&&<span className="pr-1 text-sm font-semibold text-mute">{unit}</span>}
  <button aria-label={`Increase ${l}`} onClick={()=>set(value+step)} className="grid h-full w-12 place-items-center text-mute hover:text-ink"><Plus size={16}/></button></div></div>}
export function TradeWidget({m,pick,setPick}:{m:Market;pick:Pick;setPick:(p:Pick)=>void}){
 const{s,a,openAuth}=useApp();
 const[tab,setTab]=useState<'Buy'|'Sell'>('Buy'),[type,setType]=useState('Market'),[amt,setAmt]=useState(0),[lim,setLim]=useState(50),[sh,setSh]=useState(20),[sellId,setSellId]=useState(''),[ss,setSs]=useState(0),[busy,setBusy]=useState(false);
 const bin=binary(m),price=priceOf(m,pick.outcome,pick.side),mkt=type==='Market';
 useEffect(()=>setLim(Math.round(price*100)),[pick.outcome,pick.side,m.id]);
 const held=s.positions.filter(p=>p.marketId===m.id),pos=held.find(p=>p.id===sellId)??held[0];
 useEffect(()=>{if(pos)setSs(Math.floor(pos.shares*100)/100)},[pos?.id,pos?.shares]);
 const sides=bin?m.outcomes.map(o=>({p:{outcome:o.label} as Pick,name:o.label,v:o.market})):(['Yes','No'] as const).map(sd=>({p:{outcome:pick.outcome,side:sd} as Pick,name:sd,v:priceOf(m,pick.outcome,sd)}));
 const on=(x:Pick)=>x.outcome===pick.outcome&&x.side===pick.side;
 const shares=mkt?amt/price:sh,cost=mkt?amt:sh*lim/100,sellPx=pos?mark(pos):0;
 const can=!s.user||(tab==='Buy'?(mkt?amt>0&&amt<=s.cash:sh>0&&lim>=1&&lim<=99&&cost<=s.cash):!!pos&&ss>0&&ss<=pos.shares+1e-9);
 const submit=async()=>{if(!s.user)return openAuth();setBusy(true);try{
  if(tab==='Buy'){if(mkt){if(await a.buy(m,pick.outcome,pick.side,amt))setAmt(0)}else await a.limit(m,pick.outcome,pick.side,lim,sh)}else if(pos)a.sell(pos,ss,sellPx)}finally{setBusy(false)}};
 const row=(k:string,v:string,c?:string)=><div className="flex justify-between"><dt className="text-mute">{k}</dt><dd className={cx('font-semibold tabular-nums',c)}>{v}</dd></div>;
 return <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
  <div className="flex items-center gap-3"><MarketImage m={m} size={40}/><div className="min-w-0"><p className="truncate text-sm font-bold">{pick.outcome}</p><p className="truncate text-xs text-mute">{m.title}</p></div></div>
  <div className="flex items-center justify-between border-b border-line"><div role="tablist" className="flex gap-6">{(['Buy','Sell'] as const).map(t=><button key={t} role="tab" aria-selected={tab===t} onClick={()=>setTab(t)} className={cx('-mb-px border-b-2 pb-3 text-sm font-bold transition-colors',tab===t?'border-ink text-ink':'border-transparent text-mute hover:text-ink')}>{t}</button>)}</div>
   {tab==='Buy'&&<select aria-label="Order type" value={type} onChange={e=>setType(e.target.value)} className="mb-2 h-8 rounded-lg border border-line bg-raised px-2 text-xs font-semibold outline-none focus:border-accent"><option>Market</option><option>Limit</option></select>}</div>
  {tab==='Buy'?<>
   <div className="grid grid-cols-2 gap-2">{sides.map((x,i)=><button key={x.name} aria-pressed={on(x.p)} onClick={()=>setPick(x.p)} className={cx('h-12 rounded-xl text-sm font-bold transition-colors',on(x.p)?(i===0?'bg-up text-bg':'bg-down text-bg'):'bg-fg/5 text-mute hover:text-ink')}>{x.name} {cents(x.v)}</button>)}</div>
   {mkt?<div><p className="mb-1.5 text-xs font-semibold text-mute">Amount</p><div className="flex h-14 items-center rounded-xl border border-line bg-raised px-4 focus-within:border-accent"><span className="text-2xl font-bold text-mute">$</span><input aria-label="Amount in dollars" inputMode="decimal" placeholder="0" value={amt||''} onChange={e=>setAmt(Math.max(0,+e.target.value||0))} className="min-w-0 flex-1 bg-transparent text-right text-2xl font-bold outline-none"/></div>
    <div className="mt-2 grid grid-cols-4 gap-2">{[1,20,100].map(n=><button key={n} onClick={()=>setAmt(Math.min(Math.floor(s.cash),amt+n))} className="h-9 rounded-lg bg-fg/5 text-xs font-semibold hover:bg-fg/10">+${n}</button>)}<button onClick={()=>setAmt(Math.floor(s.cash))} className="h-9 rounded-lg bg-fg/5 text-xs font-semibold hover:bg-fg/10">Max</button></div></div>
   :<div className="space-y-3"><Stepper label="Limit price" value={lim} set={v=>setLim(clamp(Math.round(v),1,99))} step={1} unit="¢"/><Stepper label="Shares" value={sh} set={v=>setSh(Math.max(0,Math.round(v)))} step={10}/></div>}
   <dl className="space-y-2 border-t border-line pt-4 text-sm">{mkt?<>{row('Avg price',cents(price))}{row('Shares',shares.toFixed(2))}</>:<>{row('Total',`$${cost.toFixed(2)}`)}{row('Fills at',`${lim}¢ or better`)}</>}{row('To win',`$${shares.toFixed(2)}`,'text-up')}</dl></>
  :<>{held.length===0?<p className="rounded-xl bg-raised p-4 text-sm text-mute">You don't hold shares in this market yet.</p>:<>
   <div className="space-y-2">{held.map(p=><button key={p.id} onClick={()=>setSellId(p.id)} className={cx('flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',pos?.id===p.id?'border-accent bg-accent/10':'border-line hover:bg-fg/5')}><span className="font-semibold">{label(p)}</span><span className="text-xs text-mute">{p.shares.toFixed(1)} shares</span></button>)}</div>
   <Stepper label="Shares to sell" value={ss} set={v=>setSs(clamp(Math.round(v*100)/100,0,pos?.shares??0))} step={5}/>
   <dl className="space-y-2 border-t border-line pt-4 text-sm">{row('Price',cents(sellPx))}{row('You receive',`$${(ss*sellPx).toFixed(2)}`,'text-up')}</dl></>}</>}
  <Btn className="h-12 w-full text-base" disabled={!can} busy={busy} onClick={submit}>{!s.user?'Log in to trade':tab==='Buy'?`Buy ${pick.side??pick.outcome}`:'Sell'}</Btn>
  <p className="text-center text-xs text-mute">Practice trade · no real orders · not financial advice</p></div>}
