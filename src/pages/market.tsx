import {useEffect,useState} from 'react';
import {ChevronLeft,Link2} from 'lucide-react';
import {useMarkets} from '../hooks/useMarkets';import {useNow,countdown} from '../hooks/useNow';import {useApp} from '../state/store';
import type {Market} from '../data/types';
import {Card,Chip,Skel,cx,pct,usd} from '../components/ui';
import {Btn,Empty} from '../components/kit';import {LineChart} from '../components/charts';
import {MarketImage} from '../components/MarketImage';import {lead} from '../components/panels';
import {TradeWidget,Pick,binary,defaultPick,cents} from '../components/TradeWidget';
const CAT:Record<string,string>={crypto:'Crypto',esports:'Esports',elon:'Elon Tweets',weather:'Weather',negrisk:'NegRisk'};
const RANGES:[string,number][]=[['1H',6],['6H',12],['1D',20],['1W',30],['1M',40],['ALL',48]];
// TODO(polymarket): use the market's `description` field for rules and the CLOB /book endpoint for the order book.
const rules=(m:Market)=>m.category==='elon'?'This market resolves to the bracket that contains the total number of posts Elon Musk makes on X during the stated period (Eastern Time), as counted by the market’s listed source. Replies and quote posts count; deleted posts may not.'
 :m.category==='weather'?'This market resolves to the temperature bracket containing the highest temperature recorded at the named station for the stated date, per the source listed in the market rules, using whole degrees as published at resolution.'
 :m.category==='crypto'?'This market resolves to “Up” if the price at the end of the window is greater than or equal to the price at the start, and to “Down” otherwise, according to the exchange price feed named in the market rules.'
 :m.category==='esports'?'This market resolves according to the official result of the match as published by the tournament organizer. If the match is cancelled or not completed, the market may resolve 50-50.'
 :'This market resolves to the outcome that occurs as confirmed by the primary source named in the market rules. If the event does not occur by the end date, the market resolves according to the fallback rule listed there.';
function Book({price,seed}:{price:number;seed:number}){
 const lv=(d:1|-1)=>Array.from({length:5},(_,i)=>{const p=Math.min(.99,Math.max(.01,price+d*(i+1)*.005)),sz=60+((seed*(i+3)*7919)%900);return{p,sz,t:p*sz}});
 const asks=lv(1).reverse(),bids=lv(-1),cell='px-3 py-2 tabular-nums';
 const R=({r,c}:{r:{p:number;sz:number;t:number};c:string})=><tr className="border-b border-line/50 last:border-0"><td className={cx(cell,'font-semibold',c)}>{cents(r.p)}</td><td className={cx(cell,'text-right')}>{r.sz.toLocaleString()}</td><td className={cx(cell,'text-right text-mute')}>${r.t.toFixed(0)}</td></tr>;
 return <div className="overflow-x-auto"><table className="w-full min-w-[320px] text-sm"><thead><tr className="border-b border-line text-xs text-mute"><th className="px-3 py-2 text-left font-semibold">Price</th><th className="px-3 py-2 text-right font-semibold">Shares</th><th className="px-3 py-2 text-right font-semibold">Total</th></tr></thead>
  <tbody>{asks.map((r,i)=><R key={'a'+i} r={r} c="text-down"/>)}<tr><td colSpan={3} className="bg-fg/5 px-3 py-1.5 text-center text-xs text-mute">Spread 1¢ · Last {cents(price)}</td></tr>{bids.map((r,i)=><R key={'b'+i} r={r} c="text-up"/>)}</tbody></table></div>}
export default function MarketPage({id,go}:{id:string;go:(r:string)=>void}){
 const ms=useMarkets(),now=useNow(),{toast}=useApp(),m=ms?.find(x=>x.id===id);
 const[pick,setPick]=useState<Pick|null>(null),[range,setRange]=useState('ALL'),[tab,setTab]=useState('book'),[all,setAll]=useState(false);
 useEffect(()=>{if(m)setPick(defaultPick(m))},[m?.id]);
 const back=<button onClick={()=>go('markets')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-mute transition-colors hover:text-ink"><ChevronLeft size={16}/>Market Floor</button>;
 if(!ms)return <><Skel className="h-6 w-32"/><Skel className="h-24"/><Skel className="h-80"/></>;
 if(!m)return <>{back}<Card><Empty text="This market isn’t available." action={<Btn onClick={()=>go('markets')}>Browse markets</Btn>}/></Card></>;
 const p=pick??defaultPick(m),priced=m.priced!==false,mod=m.modeled!==false,bin=binary(m),l=lead(m);
 const rows=bin?m.outcomes:[...m.outcomes].sort((a,b)=>b.market-a.market),shown=all||bin?rows:rows.slice(0,6);
 const n=RANGES.find(r=>r[0]===range)![1],hist=m.history.slice(-n),delta=(hist[hist.length-1].market-hist[0].market)*100;
 const seed=[...m.id].reduce((a,c)=>a+c.charCodeAt(0),3),sel=(x:Pick)=>x.outcome===p.outcome&&x.side===p.side;
 const buy=(o:string,side?:'Yes'|'No')=>{setPick({outcome:o,side});if(innerWidth<1280)document.getElementById('trade')?.scrollIntoView({behavior:'smooth',block:'start'})};
 const btn='h-10 rounded-lg px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40';
 return <>{back}
  <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
   <div className="min-w-0 space-y-6">
    <div className="flex items-start gap-4"><MarketImage m={m} size={64}/><div className="min-w-0 flex-1"><h1 className="text-xl font-extrabold leading-tight sm:text-2xl">{m.title}</h1>
     <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-mute"><Chip>{CAT[m.category]}</Chip><span>{m.vol24h>0?usd(m.vol24h):'—'} Vol.</span><span className="font-mono">{m.endsAt>now?`Ends in ${countdown(m.endsAt-now)}`:'Closed'}</span></div></div>
     <button aria-label="Copy link" title="Copy link" onClick={()=>{try{navigator.clipboard.writeText(location.href)}catch{};toast('Link copied')}} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-mute transition-colors hover:text-ink"><Link2 size={16}/></button></div>
    <Card>{priced?<><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-mute">{l.label}</p><p className="mt-1 flex items-baseline gap-2"><span className="text-4xl font-extrabold tabular-nums">{pct(l.market,0)}</span><span className="text-sm font-semibold text-mute">chance</span><span className={cx('text-sm font-semibold tabular-nums',delta>=0?'text-up':'text-down')}>{delta>=0?'▲':'▼'} {Math.abs(delta).toFixed(1)}</span></p></div>
     <div className="flex rounded-lg bg-fg/5 p-1" role="tablist">{RANGES.map(([k])=><button key={k} role="tab" aria-selected={range===k} onClick={()=>setRange(k)} className={cx('rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',range===k?'bg-ink text-bg':'text-mute hover:text-ink')}>{k}</button>)}</div></div>
     <div className="mt-4"><LineChart h={200} series={[...(mod?[{color:'#137FFA',values:hist.map(h=>h.lowcell)}]:[]),{color:'#ff6b2c',values:hist.map(h=>h.market)}]}/></div>
     <div className="mt-2 flex gap-5 text-xs text-mute"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-orange"/>Market</span>{mod&&<span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-blue"/>LOWCELL estimate</span>}</div></>
     :<Empty text="Prices for this market aren’t available right now."/>}</Card>
    <Card className="!p-3 sm:!p-4"><h2 className="mb-3 px-2 text-sm font-semibold text-mute">{bin?'Pick a side':'Outcomes'}</h2>
     {bin?<div className="grid gap-2 sm:grid-cols-2">{rows.map((o,i)=><button key={o.label} disabled={!priced} onClick={()=>buy(o.label)} className={cx(btn,'!h-14 text-base',i===0?'bg-up/15 text-up hover:bg-up/25':'bg-down/15 text-down hover:bg-down/25',priced&&sel({outcome:o.label})&&'ring-2 ring-current')}>Buy {o.label} {priced?cents(o.market):'—'}</button>)}</div>
     :<div className="space-y-1">{shown.map(o=>{const ys=priced&&sel({outcome:o.label,side:'Yes'}),ns=priced&&sel({outcome:o.label,side:'No'});return <div key={o.label} className={cx('flex flex-wrap items-center gap-3 rounded-xl p-3 sm:flex-nowrap',p.outcome===o.label?'bg-accent/10 ring-1 ring-accent/40':'hover:bg-fg/5')}>
      <div className="min-w-0 flex-1 basis-32"><p className="truncate text-sm font-bold">{o.label}</p>{mod&&priced&&<p className="text-xs font-semibold text-accent">LOWCELL {pct(o.lowcell,0)}</p>}</div>
      <p className="w-14 text-right text-xl font-extrabold tabular-nums">{priced?pct(o.market,0):'—'}</p>
      <button disabled={!priced} onClick={()=>buy(o.label,'Yes')} className={cx(btn,'bg-up/15 text-up hover:bg-up/25',ys&&'ring-2 ring-up')}>Buy Yes {priced?cents(o.market):''}</button>
      <button disabled={!priced} onClick={()=>buy(o.label,'No')} className={cx(btn,'bg-down/15 text-down hover:bg-down/25',ns&&'ring-2 ring-down')}>Buy No {priced?cents(1-o.market):''}</button></div>})}
      {rows.length>6&&<button onClick={()=>setAll(!all)} className="w-full rounded-xl py-3 text-sm font-semibold text-mute transition-colors hover:text-ink">{all?'Show fewer':`Show all ${rows.length} outcomes`}</button>}</div>}</Card>
    <Card className="!p-0"><div className="flex gap-6 border-b border-line px-5 pt-3" role="tablist">{[['book','Order book'],['rules','Rules']].map(([k,t])=><button key={k} role="tab" aria-selected={tab===k} onClick={()=>setTab(k)} className={cx('-mb-px border-b-2 pb-3 text-sm font-bold transition-colors',tab===k?'border-ink text-ink':'border-transparent text-mute hover:text-ink')}>{t}</button>)}</div>
     <div className="p-5">{tab==='book'?(priced?<><p className="mb-3 text-xs text-mute">Showing {p.outcome}{p.side&&` · ${p.side}`}. Sample depth, not live.</p><Book price={priced?(p.side==='No'?1-m.outcomes.find(o=>o.label===p.outcome)!.market:m.outcomes.find(o=>o.label===p.outcome)!.market):.5} seed={seed}/></>:<Empty text="No order book yet."/>):<p className="text-sm leading-relaxed text-mute">{rules(m)}</p>}</div></Card></div>
   <div id="trade" className="scroll-mt-20 xl:sticky xl:top-20">{priced?<TradeWidget m={m} pick={p} setPick={setPick}/>:<Card><Empty text="Trading opens once prices are available for this market."/></Card>}</div></div></>}
