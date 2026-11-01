import {useEffect,useMemo,useState} from 'react';
import {Activity as Pulse,ArrowRight,ArrowUpRight,ChevronDown,ChevronLeft,ChevronRight,Clock,LayoutGrid,List,RefreshCw,RotateCcw,Search,X} from 'lucide-react';
import {useMarkets} from '../hooks/useMarkets';import {useNow,countdown} from '../hooks/useNow';import {useApp} from '../state/store';
import type {Market} from '../data/types';
import {Card,Chip,Skel,cx,pct,usd} from '../components/ui';
import {Btn,Empty} from '../components/kit';import {LineChart} from '../components/charts';
import {MarketImage} from '../components/MarketImage';import {lead} from '../components/panels';

const CAT:[string,string][]=[['all','All categories'],['crypto','Crypto'],['esports','Esports'],['elon','Elon Tweets'],['weather','Weather'],['negrisk','NegRisk']];
const STAT:[string,string][]=[['open','Active / open'],['soon','Closing in 24h'],['all','All statuses']];
const KIND:[string,string][]=[['all','All Markets'],['updown','Up / Down'],['overunder','Over / Under'],['versus','Head-to-head'],['bracket','Brackets & multi']];
const TABS:[string,string][]=[['all','All Markets'],['trending','Trending'],['new','New Markets'],['volume','Highest Volume'],['liquid','Most Liquid'],['soon','Closing Soon'],['edge','LOWCELL Edge']];
const PAGE=12,dash=(n?:number)=>n&&n>0?usd(n):'—';
const edgeOf=(m:Market)=>{const l=lead(m);return l.lowcell-l.market};
const trend=(m:Market)=>m.vol24h*(1+Math.abs(m.move24??0)/10)+(m.liq??0)*.1;
const SORT:Record<string,(a:Market,b:Market)=>number>={all:()=>0,trending:(a,b)=>trend(b)-trend(a),new:(a,b)=>(b.created??0)-(a.created??0),volume:(a,b)=>b.vol24h-a.vol24h,liquid:(a,b)=>(b.liq??0)-(a.liq??0),soon:(a,b)=>a.endsAt-b.endsAt,edge:(a,b)=>Math.abs(edgeOf(b))-Math.abs(edgeOf(a))};
const ordered=(m:Market)=>m.kind==='bracket'||m.kind==='multi'?[...m.outcomes].sort((a,b)=>b.market-a.market):m.outcomes;
const status=(m:Market,now:number):[string,string,string]=>{const ms=m.endsAt-now;return ms<=0?['Closed','text-down','Market ended']:m.priced===false?['Open','text-up','Prices unavailable']:ms<36e5?['Closing soon','text-orange','Provider accepting orders']:['Open','text-up','Provider accepting orders']};
const cardCls='group flex flex-col rounded-2xl border border-line bg-surface p-5 text-left transition duration-200 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5';

function Sel({label,v,set,opts}:{label:string;v:string;set:(v:string)=>void;opts:[string,string][]}){
 return <div className="relative"><select aria-label={label} value={v} onChange={e=>set(e.target.value)} className="h-11 w-full appearance-none rounded-xl border border-line bg-surface pl-4 pr-10 text-sm font-semibold outline-none transition-colors hover:border-mute/40 focus:border-accent">{opts.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-3.5 text-mute"/></div>}

function CatalogCard({m,now,open}:{m:Market;now:number;open:(id:string)=>void}){
 const priced=m.priced!==false,mod=m.modeled!==false,rows=ordered(m),shown=rows.slice(0,3),more=rows.length-shown.length;
 const best=priced?m.outcomes.reduce((a,b)=>b.market>a.market?b:a):null,[st,tone,note]=status(m,now),e=edgeOf(m);
 return <article className={cardCls}>
  <header className="flex items-start gap-3.5"><MarketImage m={m} size={56}/><div className="min-w-0"><h3 className="line-clamp-3 min-h-[62px] text-[15px] font-bold leading-snug">{m.title}</h3><p className="mt-1.5 flex items-center gap-1.5 font-mono text-xs text-mute"><Clock size={13}/>{countdown(m.endsAt-now)}</p></div></header>
  <ul className="mb-5 mt-5 min-h-[148px] space-y-3.5">{shown.map(o=>{const top=o===best;return <li key={o.label}>
   <div className="flex items-baseline justify-between gap-3 text-sm"><span className={cx('truncate',top?'font-semibold text-ink':'text-mute')}>{o.label}</span><span className={cx('font-mono font-semibold tabular-nums',top?'text-accent':'text-ink')}>{priced?pct(o.market,0):'—'}</span></div>
   <div className="relative mt-1.5 h-1.5 rounded-full bg-fg/10"><div className={cx('h-full rounded-full transition-all duration-700',top?'bg-accent':'bg-fg/30')} style={{width:`${priced?o.market*100:0}%`}}/>{priced&&mod&&<i title={`LOWCELL ${pct(o.lowcell,0)}`} className="absolute -top-1 h-3.5 w-0.5 rounded bg-blue" style={{left:`${Math.min(98.5,o.lowcell*100)}%`}}/>}</div></li>})}
   {more>0&&<li className="text-xs text-mute">+{more} more outcomes</li>}
   {!priced?<li className="grid h-20 place-items-center rounded-xl bg-fg/5 text-xs text-mute">Prices unavailable right now</li>:shown.length<3&&<li className="pt-1"><LineChart h={60} series={[{color:'#ff6b2c',values:m.history.map(h=>h.market)}]}/></li>}
   {priced&&mod&&<li className="flex items-center gap-1.5 text-xs text-mute"><i className="h-3 w-0.5 rounded bg-blue"/>Blue tick = LOWCELL estimate</li>}</ul>
  <dl className="mt-auto space-y-3 border-t border-line pt-4 text-sm">
   <div className="flex items-center justify-between"><dt className="text-mute">24h move</dt><dd className={cx('font-mono',m.move24==null?'text-mute':m.move24>=0?'text-up':'text-down')}>{m.move24==null?'—':`${m.move24>0?'+':''}${m.move24.toFixed(1)} pts`}</dd></div>
   <div className="flex items-center justify-between"><dt className="text-mute">LOWCELL edge</dt><dd>{mod&&priced?<Chip tone={e>=0?'up':'down'}>{e>=0?'+':''}{(e*100).toFixed(1)} pts</Chip>:<span className="text-xs text-mute">Not modelled</span>}</dd></div>
   <div className="flex items-center justify-between font-mono text-xs"><span><span className="font-sans text-mute">Vol</span> {dash(m.vol24h)}</span><span><span className="font-sans text-mute">Liq</span> {dash(m.liq)}</span></div>
   <div className="flex items-center gap-2 text-xs"><i className={cx('h-1.5 w-1.5 rounded-full bg-current',tone)}/><span className={cx('font-semibold',tone)}>{st}</span><span className="text-mute">{note}</span></div></dl>
  <button onClick={()=>open(m.id)} className="mt-4 flex h-11 items-center justify-between rounded-xl border border-line px-4 text-sm font-semibold transition-colors hover:bg-fg/5">View chart<ArrowRight size={16}/></button></article>}

function ListRow({m,now,open}:{m:Market;now:number;open:(id:string)=>void}){
 const priced=m.priced!==false,[st,tone]=status(m,now);
 return <article className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-accent/40">
  <MarketImage m={m} size={48}/>
  <div className="min-w-0 flex-1 basis-56"><h3 className="line-clamp-2 text-sm font-bold leading-snug">{m.title}</h3><p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-mute"><Clock size={12}/>{countdown(m.endsAt-now)}<span className={cx('ml-2 font-sans font-semibold',tone)}>{st}</span></p></div>
  <div className="flex gap-5 font-mono text-sm">{ordered(m).slice(0,2).map(o=><span key={o.label} className="whitespace-nowrap"><span className="font-sans text-mute">{o.label}</span> <b>{priced?pct(o.market,0):'—'}</b></span>)}</div>
  <p className="hidden w-44 font-mono text-xs text-mute lg:block">Vol {dash(m.vol24h)} · Liq {dash(m.liq)}</p>
  <Btn variant="ghost" onClick={()=>open(m.id)}>View chart<ArrowRight size={16}/></Btn></article>}

function Spot({m,now,open}:{m:Market;now:number;open:(id:string)=>void}){
 const e=edgeOf(m),l=lead(m);
 return <button onClick={()=>open(m.id)} className={cx(cardCls,'min-w-[86%] snap-start sm:min-w-0')}>
  <div className="flex items-start gap-3.5"><MarketImage m={m} size={48}/><div className="min-w-0 flex-1"><h3 className="line-clamp-2 min-h-[38px] text-sm font-bold leading-snug">{m.title}</h3><p className="mt-1 font-mono text-xs text-mute">{countdown(m.endsAt-now)}</p></div></div>
  <div className="my-4"><LineChart h={80} series={[{color:'#137FFA',values:m.history.map(h=>h.lowcell)},{color:'#ff6b2c',values:m.history.map(h=>h.market)}]}/></div>
  <div className="mt-auto flex items-center justify-between gap-2 text-sm"><span className="truncate text-mute">LOWCELL leans <b className="text-ink">{l.label}</b></span><Chip tone={e>=0?'up':'down'}>{e>=0?'+':''}{(e*100).toFixed(1)} pts</Chip></div></button>}

export default function MarketsHome({open,q,setQ,go}:{open:(id:string)=>void;q:string;setQ:(v:string)=>void;go:(r:string)=>void}){
 const ms=useMarkets(),now=useNow(),{toast}=useApp(),minute=Math.floor(now/6e4);
 const[tab,setTab]=useState('all'),[cat,setCat]=useState('all'),[stat,setStat]=useState('open'),[kind,setKind]=useState('all'),[view,setView]=useState<'grid'|'list'>('grid'),[page,setPage]=useState(0),[upd,setUpd]=useState(Date.now()),[spin,setSpin]=useState(false);
 const dirty=tab!=='all'||cat!=='all'||stat!=='open'||kind!=='all'||!!q;
 const list=useMemo(()=>{const t=q.trim().toLowerCase();return(ms??[]).filter(m=>(cat==='all'||m.category===cat)&&(kind==='all'||(kind==='bracket'?m.kind==='bracket'||m.kind==='multi':m.kind===kind))
  &&(stat==='all'||(m.endsAt>Date.now()&&(stat==='open'||m.endsAt-Date.now()<864e5)))&&(tab!=='edge'||(m.modeled!==false&&m.priced!==false))&&(tab!=='soon'||m.endsAt>Date.now())
  &&(!t||(m.title+' '+m.category+' '+(CAT.find(c=>c[0]===m.category)?.[1]??'')).toLowerCase().includes(t))).sort(SORT[tab])},[ms,tab,cat,stat,kind,q,minute]);
 useEffect(()=>setPage(0),[tab,cat,stat,kind,q]);
 const pages=Math.max(1,Math.ceil(list.length/PAGE)),cur=Math.min(page,pages-1),slice=list.slice(cur*PAGE,cur*PAGE+PAGE);
 const goPage=(n:number)=>{setPage(n);document.getElementById('catalogue')?.scrollIntoView({behavior:'smooth',block:'start'})};
 const reset=()=>{setTab('all');setCat('all');setStat('open');setKind('all');setQ('')};
 const refresh=()=>{setSpin(true);setTimeout(()=>{setSpin(false);setUpd(Date.now());toast('Markets refreshed')},800)};
 const secs=Math.max(0,Math.floor((now-upd)/1000)),ago=secs<10?'just now':secs<60?`${secs}s ago`:`${Math.floor(secs/60)}m ago`;
 const spot=!dirty&&cur===0?[...(ms??[])].filter(m=>m.modeled!==false&&m.priced!==false&&m.category!=='negrisk').sort(SORT.edge).slice(0,3):[];
 return <>
  <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-accent/15 via-surface to-blue/10 p-5 sm:p-7">
   <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-fg/5 px-3 py-1 text-xs font-semibold tracking-wider text-mute"><Pulse size={13} className="text-accent"/>LIVE FROM POLYMARKET</p>
    <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Market Floor</h1><p className="mt-2 max-w-md text-sm text-mute sm:text-base">Every live market, with LOWCELL’s edge beside the crowd’s price.</p></div>
    <Btn variant="ghost" className="shrink-0 self-start bg-surface/60 sm:self-auto" onClick={()=>go('practice')}>Practice Trading<ArrowUpRight size={16}/></Btn></div>
   <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line/70 pt-4 text-sm"><p className="text-mute"><b className="text-ink">{slice.length}</b> markets on this page · {list.length} in catalogue{cur<pages-1&&' · More results available'}</p>
    <div className="flex items-center gap-3"><span className="flex items-center gap-2 font-semibold"><i className="h-2 w-2 animate-pulse rounded-full bg-up"/>Polymarket<span className="font-normal text-mute">· updated {ago}</span></span>
     <button aria-label="Refresh markets" onClick={refresh} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface/60 text-mute transition-colors hover:text-ink"><RefreshCw size={16} className={spin?'animate-spin':''}/></button></div></div></section>
  <div className="sticky top-14 z-20 -mx-4 border-b border-line bg-bg/90 px-4 backdrop-blur lg:-mx-8 lg:px-8"><div className="no-scrollbar flex gap-7 overflow-x-auto overflow-y-hidden pr-6" role="tablist">{TABS.map(([k,l])=><button key={k} role="tab" aria-selected={tab===k} onClick={()=>setTab(k)} className={cx('shrink-0 whitespace-nowrap border-b-2 py-3.5 text-sm font-semibold transition-colors',tab===k?'border-accent text-ink':'border-transparent text-mute hover:text-ink')}>{l}</button>)}</div></div>
  <div className="flex flex-wrap items-center gap-3">
   <label className="flex h-11 min-w-[240px] flex-1 items-center gap-2.5 rounded-xl border border-line bg-surface px-4 text-mute focus-within:border-accent"><Search size={16}/><input aria-label="Search all markets" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search all Polymarket markets…" className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-mute"/>{q&&<button aria-label="Clear search" onClick={()=>setQ('')} className="text-mute hover:text-ink"><X size={15}/></button>}</label>
   <button aria-label="Reset filters" title="Reset filters" disabled={!dirty} onClick={reset} className="grid h-11 w-11 place-items-center rounded-xl border border-line text-mute transition-colors hover:text-ink disabled:opacity-40"><RotateCcw size={16}/></button>
   <Sel label="Category" v={cat} set={setCat} opts={CAT}/><Sel label="Status" v={stat} set={setStat} opts={STAT}/><Sel label="Market type" v={kind} set={setKind} opts={KIND}/>
   <div role="group" aria-label="View" className="ml-auto flex rounded-xl border border-line bg-surface p-1">{([['grid',LayoutGrid],['list',List]] as const).map(([k,I])=><button key={k} aria-label={`${k} view`} aria-pressed={view===k} onClick={()=>setView(k)} className={cx('grid h-9 w-10 place-items-center rounded-lg transition-colors',view===k?'bg-accent/15 text-accent':'text-mute hover:text-ink')}><I size={18}/></button>)}</div></div>
  {spot.length>0&&<section><div className="mb-4 flex items-baseline justify-between"><h2 className="text-lg font-extrabold">LOWCELL spotlight</h2><span className="text-xs text-mute">Biggest gaps between our estimate and the market</span></div>
   <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto overflow-y-hidden px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">{spot.map(m=><Spot key={m.id} m={m} now={now} open={open}/>)}</div></section>}
  <section id="catalogue" className="scroll-mt-32"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold">Market catalogue</h2><span className="font-mono text-xs text-mute">Page {cur+1} of {pages}</span></div>
   {!ms?<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array(6).fill(0).map((_,i)=><Skel key={i} className="h-[430px]"/>)}</div>:list.length===0?<Card><Empty text="No markets match these filters." action={<Btn variant="ghost" onClick={reset}>Reset filters</Btn>}/></Card>:
   view==='grid'?<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{slice.map(m=><CatalogCard key={m.id} m={m} now={now} open={open}/>)}</div>:<div className="space-y-3">{slice.map(m=><ListRow key={m.id} m={m} now={now} open={open}/>)}</div>}</section>
  {list.length>PAGE&&<nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-3"><Btn variant="ghost" disabled={cur===0} onClick={()=>goPage(cur-1)}><ChevronLeft size={16}/>Previous</Btn><Btn variant="ghost" disabled={cur===0} onClick={()=>goPage(0)}>First page</Btn><Btn variant="ghost" disabled={cur>=pages-1} onClick={()=>goPage(cur+1)}>Next markets<ChevronRight size={16}/></Btn></nav>}
  <p className="text-center text-xs text-mute">Live source: Polymarket · — means unavailable · availability is not trading authorization · real-money trading disabled</p></>}
