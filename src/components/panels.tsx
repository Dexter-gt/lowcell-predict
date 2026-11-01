import type {Market,HourBucket,RadarItem,Category} from '../data/types';
import {Card,Chip,Skel,Title,cx,pct,usd,left} from './ui';
import {LineChart,Bars} from './charts';
import {MarketImage} from './MarketImage';
import {ArrowUpRight,ArrowDownRight,Radio} from 'lucide-react';
export const lead=(m:Market)=>m.outcomes.reduce((a,b)=>b.lowcell>a.lowcell?b:a);
const idx=(m:Market)=>m.outcomes.indexOf(lead(m));

export function StatRow({m,busy}:{m?:Market;busy:boolean}){
 const items=m&&!busy?[['Verified count',m.verified?String(m.verified):'—'],['Time left',left(m.endsAt)],['Activity',`${m.perHour}/hr`],['Updated','just now']]:null;
 return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(items??Array(4).fill(null)).map((s:string[]|null,i:number)=>
  <div key={i} className="rounded-xl border border-line bg-surface px-4 py-3">{s?<><p className="text-xs font-semibold uppercase tracking-wider text-mute">{s[0]}</p><p className="mt-1 text-xl font-bold">{s[1]}</p></>:<><Skel className="h-3 w-16"/><Skel className="mt-2 h-6 w-12"/></>}</div>)}</div>}

export function Hero({m,busy}:{m?:Market;busy:boolean}){
 if(!m||busy)return <Card className="space-y-4"><Skel className="h-4 w-40"/><Skel className="h-12 w-52"/><Skel className="h-40 w-full"/></Card>;
 const o=lead(m),edge=o.lowcell-o.market;
 return <Card key={m.id}>
  <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-3"><MarketImage m={m} size={44}/><p className="min-w-0 text-sm font-semibold text-mute">{m.subject}{m.range&&' · '+m.range}</p></div>
   <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-mute">{m.modeled===false?'Market leader':'Leading outcome'}</p>
   <p className="text-5xl font-extrabold tracking-tight">{o.label}{m.category==='elon'&&<span className="ml-2 text-lg font-semibold text-mute">tweets</span>}</p></div>
   {m.modeled===false?<Chip>Market data only</Chip>:<Chip tone={edge>=0?'up':'down'}>{edge>=0?'+':''}{(edge*100).toFixed(1)} pts vs market</Chip>}</div>
  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">{m.modeled!==false&&<span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-blue"/>LOWCELL <b>{pct(o.lowcell)}</b></span>}<span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-orange"/>Market <b>{pct(o.market)}</b></span></div>
  <div className="mt-3"><LineChart series={[...(m.modeled===false?[]:[{color:'#137FFA',values:m.history.map(h=>h.lowcell)}]),{color:'#ff6b2c',values:m.history.map(h=>h.market)}]}/></div>
  <div className="mt-3 flex items-center gap-2 border-t border-dashed border-line pt-3 text-xs text-mute"><span>{m.vol24h>0?usd(m.vol24h):'—'} vol 24h</span>·<span>{m.outcomes.length} outcomes</span></div>
  {m.modeled!==false&&<p className="mt-3 text-sm text-mute">A single bracket is only featured when the rule has held up on past windows it wasn’t tuned on.</p>}</Card>}

export function Distribution({m,busy}:{m?:Market;busy:boolean}){
 const mod=m?.modeled!==false,rows=m?[...m.outcomes].sort((a,b)=>b.lowcell-a.lowcell).slice(0,6):[],max=Math.max(...rows.map(r=>Math.max(r.lowcell,r.market)),.01);
 return <Card delay={80}><Title right={<span className="flex gap-3 text-xs text-mute"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-accent"/>{mod?'LOWCELL':'Market price'}</span>{mod&&<span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-fg/25"/>Market</span>}</span>}>Outcome distribution</Title>
  {busy||!m?<div className="space-y-3">{Array(5).fill(0).map((_,i)=><Skel key={i} className="h-7"/>)}</div>:
  <ul className="space-y-3">{rows.map(r=><li key={r.label} className="grid grid-cols-[64px_1fr_48px] items-center gap-3 text-sm"><span className="font-semibold tabular-nums">{r.label}</span>
   <div className="space-y-1"><div className="h-2 rounded-full bg-fg/5"><div className="h-2 rounded-full bg-accent transition-all duration-700" style={{width:`${r.lowcell/max*100}%`}}/></div>{mod&&<div className="h-1.5 rounded-full bg-fg/5"><div className="h-1.5 rounded-full bg-fg/25 transition-all duration-700" style={{width:`${r.market/max*100}%`}}/></div>}</div>
   <span className="text-right tabular-nums text-mute">{pct(r.lowcell,0)}</span></li>)}</ul>}</Card>}

export function Activity({data}:{data?:HourBucket[]}){
 return <Card delay={160}><Title right={<span className="text-xs text-mute">Past 24 complete hours · local</span>}>Posting activity</Title>
  {data?<><Bars data={data.map(d=>({label:d.hour,value:d.count}))}/><div className="mt-2 flex justify-between text-xs text-mute"><span>{data[0].hour}:00</span><span>{data[12].hour}:00</span><span>{data[23].hour}:00</span></div></>:<Skel className="h-32"/>}</Card>}

export function Radar({items}:{items?:RadarItem[]}){
 return <Card delay={120}><Title right={<Chip tone="accent">Experimental</Chip>}>Multi-Market Radar</Title>
  <p className="mb-3 text-xs text-mute">Compares prices across windows to spot delayed reactions. Not a settlement forecast.</p>
  {!items?<div className="space-y-2">{Array(3).fill(0).map((_,i)=><Skel key={i} className="h-14"/>)}</div>:
  <ul className="space-y-2">{items.map(r=>{const up=r.gap>0;return <li key={r.id} className="flex items-center gap-3 rounded-xl bg-raised p-3">
   <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-full',up?'bg-up/10 text-up':'bg-down/10 text-down')}>{up?<ArrowUpRight size={18}/>:<ArrowDownRight size={18}/>}</span>
   <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{r.label}</p><p className="truncate text-xs text-mute">{r.note}</p></div>
   <b className={cx('tabular-nums text-sm',up?'text-up':'text-down')}>{up?'+':''}{(r.gap*100).toFixed(1)}</b></li>})}</ul>}</Card>}

const TABS:[Category,string][]=[['elon','Elon Tweets'],['weather','Weather'],['negrisk','NegRisk']];
export function MarketList({markets,cat,setCat,sel,pick}:{markets?:Market[];cat:Category;setCat:(c:Category)=>void;sel?:string;pick:(id:string)=>void}){
 const rows=markets?.filter(m=>m.category===cat);
 return <Card delay={60} className="!p-0"><div className="flex gap-5 border-b border-line px-4 pt-3 sm:px-5" role="tablist">{TABS.map(([k,l])=>
  <button key={k} role="tab" aria-selected={cat===k} onClick={()=>setCat(k)} className={cx('-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors',cat===k?'border-accent text-ink':'border-transparent text-mute hover:text-ink')}>{l}</button>)}</div>
  <div className="p-2">{!rows?Array(4).fill(0).map((_,i)=><Skel key={i} className="m-2 h-16"/>):rows.length===0?
   <div className="grid place-items-center gap-2 px-4 py-10 text-center text-sm text-mute"><Radio size={22}/>No active {TABS.find(t=>t[0]===cat)![1]} markets yet.</div>:
   rows.map(m=>{const o=lead(m),edge=o.lowcell-o.market;return <button key={m.id} onClick={()=>pick(m.id)} className={cx('flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',sel===m.id?'bg-accent/10 ring-1 ring-accent/50':'hover:bg-fg/5')}>
    <MarketImage m={m} size={40}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{m.range}</p><p className="mt-0.5 truncate text-xs text-mute">{m.outcomes.length} outcomes · {usd(m.vol24h)} vol · market fav {m.outcomes.reduce((a,b)=>b.market>a.market?b:a).label}</p></div>
    <div className="text-right"><p className="text-sm font-bold tabular-nums">{o.label}</p><span className={cx('text-xs font-semibold',edge>=0?'text-up':'text-down')}>{edge>=0?'+':''}{(edge*100).toFixed(1)} pts</span></div></button>})}</div></Card>}
