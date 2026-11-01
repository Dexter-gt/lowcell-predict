import {useMemo,useState} from 'react';
import {Check} from 'lucide-react';
import {useMarkets} from '../hooks/useMarkets';import {useAsync} from '../hooks/useAsync';
import {dataSource} from '../data/adapter';import {extra} from '../data/extra';import {useApp,equity} from '../state/store';
import {Card,Chip,Skel,Title,cx,pct,left} from '../components/ui';
import {Btn,PageHead,Select,Pills,Table,Stat,Field,Input,DualBars,Empty} from '../components/kit';
import {LineChart} from '../components/charts';import {PHOTO,photo,PhotoKey} from '../assets/photos';import {Thumb} from '../components/MarketImage';
type Go=(r:string)=>void;

export function RadarPage(){
 const items=useAsync(()=>dataSource.getRadar(),[]),[min,setMin]=useState(0),[sel,setSel]=useState('r1');
 const rows=(items??[]).filter(r=>Math.abs(r.gap)*100>=min),cur=items?.find(r=>r.id===sel);
 const series=useMemo(()=>{let v=0,x=cur?.gap??0;return Array.from({length:40},(_,i)=>(v+=(x-v)*.12+Math.sin(i*1.3)*.004))},[sel,items]);
 return <><PageHead title="Multi-Market Radar" sub="Compares prices across overlapping windows to spot delayed reactions. It compares market prices only and is not a settlement forecast."/>
  <div className="grid gap-4 xl:grid-cols-[360px_1fr]"><Card><Title right={<Chip tone="accent">Experimental</Chip>}>Signals</Title><Field label={`Minimum gap: ${min.toFixed(1)} pts`}><input type="range" min={0} max={4} step={.5} value={min} onChange={e=>setMin(+e.target.value)} className="h-10 w-full cursor-pointer accent-accent"/></Field>
   <ul className="mt-4 space-y-2">{!items?<Skel className="h-40"/>:rows.length===0?<Empty text="No gaps above this threshold."/>:rows.map(r=><li key={r.id}><button onClick={()=>setSel(r.id)} className={cx('w-full rounded-xl p-3 text-left transition-colors',sel===r.id?'bg-accent/10 ring-1 ring-accent/50':'bg-raised hover:bg-fg/5')}><div className="flex justify-between text-sm font-semibold"><span className="truncate pr-2">{r.label}</span><span className={r.gap>0?'text-up':'text-down'}>{r.gap>0?'+':''}{(r.gap*100).toFixed(1)}</span></div><p className="mt-1 text-xs text-mute">{r.note}</p></button></li>)}</ul></Card>
   <Card>{cur?<><Title>Gap over the last 40 intervals</Title><p className="mb-2 text-sm text-mute">{cur.label}</p><LineChart h={220} series={[{color:'#7047FF',values:series}]}/><p className="mt-3 border-t border-dashed border-line pt-3 text-sm text-mute">A persistent gap can mean one market has not yet repriced. Confirm with order-book depth before acting; this view does not account for fees or liquidity.</p></>:<Skel className="h-64"/>}</Card></div></>}

export function Analytics(){
 const d=useAsync(()=>extra.accuracy(),[]),S=300,pad=28;
 return <><PageHead title="Analytics" sub="How well LOWCELL's probabilities match what actually happened."/>
  <div className="rounded-xl border border-orange/30 bg-orange/10 px-4 py-3 text-sm text-orange">Illustrative figures. Walk-forward backtesting and calibration curves are still on the roadmap, so treat these as placeholders.</div>
  {!d?<Skel className="h-72"/>:<><div className="grid grid-cols-3 gap-2"><Stat l="Brier score" v={d.brier.toFixed(3)} sub="lower is better"/><Stat l="Top-pick hit rate" v={pct(d.hit,0)}/><Stat l="Windows scored" v={d.n}/></div>
  <div className="grid gap-4 lg:grid-cols-2"><Card><Title>Calibration</Title><svg viewBox={`0 0 ${S} ${S}`} className="mx-auto w-full max-w-sm" role="img" aria-label="Calibration curve">
   <line x1={pad} y1={S-pad} x2={S-pad} y2={pad} className="stroke-line" strokeDasharray="4 4"/>{[0,.5,1].map(t=><g key={t}><text x={pad-6} y={S-pad-t*(S-2*pad)+4} textAnchor="end" fontSize="9" className="fill-mute">{t*100}</text><text x={pad+t*(S-2*pad)} y={S-8} textAnchor="middle" fontSize="9" className="fill-mute">{t*100}</text></g>)}
   <polyline fill="none" stroke="#7047FF" strokeWidth="2.2" pathLength={1} className="draw" points={d.calib.map(c=>`${pad+c.p*(S-2*pad)},${S-pad-c.obs*(S-2*pad)}`).join(' ')}/>{d.calib.map(c=><circle key={c.p} cx={pad+c.p*(S-2*pad)} cy={S-pad-c.obs*(S-2*pad)} r="3.5" fill="#7047FF"/>)}</svg>
   <p className="text-center text-xs text-mute">Predicted probability (x) vs observed frequency (y). The dashed line is perfect calibration.</p></Card>
  <Card><Title>Hit rate by category</Title><DualBars a="Top-pick hit rate" b="Chance baseline" rows={d.byCat.map(c=>({label:c.cat.split(' ')[0],a:c.hit,b:.2}))}/></Card></div></>}</>}

function CityCard({k,city,code,unit}:{k:string;city:string;code:string;unit:string}){
 const p=PHOTO[k as PhotoKey];
 return <Card className="flex items-center gap-4 sm:gap-6"><div className="shrink-0"><Thumb src={p?photo(k as PhotoKey,500):undefined} name={city} size={128}/></div>
  <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-mute">{code} · {unit}</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight">{city}</h2>{p&&<p className="mt-1 text-sm text-mute">{p.landmark}</p>}{p&&<p className="mt-3 text-xs text-mute">Photo: {p.credit}</p>}</div></Card>}
export function Weather(){
 const st=useAsync(()=>extra.stations(),[]),[id,setId]=useState('nyc'),s=st?.find(x=>x.id===id);
 const best=s?s.ens.indexOf(Math.max(...s.ens)):0;
 return <><PageHead title="Weather" sub="Ensemble forecasts at each market's settlement station, compared with market prices. Observations floor or cap the result."/>
  {!s?<Skel className="h-72"/>:<><Pills v={id} set={setId} opts={st!.map(x=>[x.id,x.city] as [string,string])}/>
  <CityCard k={s.id} city={s.city} code={s.code} unit={s.unit}/>
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Stat l="Station" v={s.code}/><Stat l="Observed high so far" v={`${s.obs}${s.unit}`}/><Stat l="Most likely bracket" v={s.labels[best]} sub={`${pct(s.ens[best],0)} ensemble`}/><Stat l="Market prices end in" v={`${s.hours}h`}/></div>
  <Card><Title>Daily high · ensemble vs market</Title><DualBars a="Ensemble (ECMWF + GFS)" rows={s.labels.map((l,i)=>({label:l,a:s.ens[i],b:s.mkt[i]}))}/></Card>
  <p className="text-xs text-mute">Forecasts remove recent model-vs-station bias. Data: NOAA/METAR observations and Open-Meteo ensembles (mock values in this prototype).</p></>}</>}

export function Risk(){
 const ms=useMarkets(),[id,setId]=useState('m1'),[stake,setStake]=useState(100),[price,setPrice]=useState(40),m=ms?.find(x=>x.id===id);
 const asks=m?.outcomes.map(o=>Math.min(.99,o.market+.005))??[],sum=asks.reduce((a,b)=>a+b,0),worst=1-sum;
 const shares=stake/(price/100);
 return <><PageHead title="Risk" sub="Check NegRisk structure and size a position before you trade."/>
  <div className="grid gap-4 lg:grid-cols-2"><Card className="space-y-3"><Title>NegRisk buy-all check</Title><Select value={id} onChange={e=>setId(e.target.value)}>{ms?.filter(x=>x.modeled!==false).map(x=><option key={x.id} value={x.id}>{x.subject} · {x.range}</option>)}</Select>
   {m&&<><div className="grid grid-cols-2 gap-2"><Stat l="Sum of best asks" v={sum.toFixed(3)}/><Stat l="Buy-all worst case" v={`${worst>=0?'+':''}${worst.toFixed(3)}`} tone={worst>=0?'up':'down'}/></div>
   <p className="rounded-xl bg-raised p-3 text-sm text-mute">{worst>=0?'Buying every outcome would lock in a profit at top of book.':`Buying every outcome costs ${(sum*100).toFixed(1)}¢ for a $1 payout, so there's no free lunch here.`} Top of book only, no fees or depth.</p></>}</Card>
  <Card className="space-y-3"><Title>Position sizer</Title><div className="grid grid-cols-2 gap-3"><Field label="Stake (USD)"><Input type="number" min={1} value={stake} onChange={e=>setStake(+e.target.value)}/></Field><Field label="Entry price (¢)"><Input type="number" min={1} max={99} value={price} onChange={e=>setPrice(Math.min(99,Math.max(1,+e.target.value)))}/></Field></div>
   <div className="grid grid-cols-3 gap-2"><Stat l="Max loss" v={`$${stake}`} tone="down"/><Stat l="Payout" v={`$${shares.toFixed(0)}`} tone="up"/><Stat l="Break-even" v={`${price}%`}/></div></Card></div></>}

export function DegenElon({buy}:{buy?:(id:string)=>void}){
 const ms=useMarkets(),{s,a}=useApp(),[id,setId]=useState('m4'),[max,setMax]=useState(12),m=ms?.find(x=>x.id===id);
 const rows=(m?.outcomes??[]).filter(o=>o.market*100<=max&&o.market>.005).sort((x,y)=>y.lowcell/y.market-x.lowcell/x.market).slice(0,8);
 return <><PageHead title="Degen Elon" sub="Longshot tweet brackets where LOWCELL's estimate is richest relative to the market price."/>
  <div className="rounded-xl border border-orange/30 bg-orange/10 px-4 py-3 text-sm text-orange">Longshots lose most of the time. Practice with small sizes and expect long losing streaks.</div>
  <div className="grid gap-4 sm:grid-cols-2"><Field label="Market"><Select aria-label="Market" value={id} onChange={e=>setId(e.target.value)}>{ms?.filter(x=>x.category==='elon').map(x=><option key={x.id} value={x.id}>{x.range}</option>)}</Select></Field><Field label={`Max market probability: ${max}%`}><input type="range" min={2} max={30} value={max} onChange={e=>setMax(+e.target.value)} className="h-10 w-full cursor-pointer accent-accent"/></Field></div>
  <Card className="!p-0">{rows.length===0?<Empty text="No brackets under that probability."/>:<Table head={['Bracket','Market','LOWCELL','Payout','Edge ×','']} rows={rows.map(o=>[<b>{o.label}</b>,pct(o.market),pct(o.lowcell),`${(1/o.market).toFixed(1)}×`,<span className="text-up">{(o.lowcell/o.market).toFixed(2)}×</span>,<Btn variant="ghost" className="!h-8" disabled={!!s.user&&s.cash<10} onClick={()=>m&&a.buy(m,o.label,'Yes',10)}>Buy $10</Btn>])}/>}</Card></>}

export function Leaderboard(){
 const{s}=useApp(),ls=useAsync(()=>extra.leaders(),[]),[p,setP]=useState('month'),k={week:.4,month:1,all:2.2}[p];
 const you=(equity(s)/10000-1)*100;
 const rows=[...(ls??[]).map(l=>({name:l.name,ret:l.ret*k,trades:l.trades,me:false})),{name:s.user?.name??'You',ret:you,trades:s.txs.filter(t=>t.type==='trade').length,me:true}].sort((a,b)=>b.ret-a.ret);
 return <><PageHead title="Leaderboard" sub="Practice-account returns. Nobody wins real money here." right={<Pills v={p} set={setP} opts={[['week','Week'],['month','Month'],['all','All time']]}/>}/>
  <Card className="!p-0">{!ls?<Skel className="m-4 h-64"/>:<Table left={2} head={['#','Trader','Return','Trades']} rows={rows.map((r,i)=>[i+1,<span className={cx('font-semibold',r.me&&'text-accent')}>{r.name}{r.me&&' (you)'}</span>,<b className={r.ret>=0?'text-up':'text-down'}>{r.ret>=0?'+':''}{r.ret.toFixed(1)}%</b>,r.trades])}/>}</Card></>}

export function Rewards({go}:{go:Go}){
 const{s,a}=useApp(),tiers=[['Bronze',0],['Silver',500],['Gold',1500]] as const,tier=[...tiers].reverse().find(t=>s.points>=t[1])!,next=tiers.find(t=>t[1]>s.points);
 const tasks=[['x','Connect X',50,!!s.xHandle,'x'],['trade','Place a practice trade',30,s.txs.some(t=>t.type==='trade'),'markets'],['copy','Copy a trader',40,s.copies.length>0,'copy'],['read','Read how LOWCELL works',20,s.read,'methodology']] as const;
 return <><PageHead title="Rewards" sub="Earn points for exploring the product. Points have no cash value."/>
  <Card><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-mute">{tier[0]} tier</p><p className="text-4xl font-extrabold">{s.points} <span className="text-base font-semibold text-mute">pts</span></p></div>{next&&<p className="text-xs text-mute">{next[1]-s.points} to {next[0]}</p>}</div><div className="mt-4 h-2 rounded-full bg-fg/10"><div className="h-2 rounded-full bg-gradient-to-r from-accent to-blue transition-all" style={{width:`${next?Math.min(100,(s.points-tier[1])/(next[1]-tier[1])*100):100}%`}}/></div></Card>
  <div className="space-y-2">{tasks.map(([id,l,pts,done,to])=>{const got=s.claimed.includes(id);return <Card key={id} className="flex items-center gap-3 !py-3.5"><span className={cx('grid h-8 w-8 place-items-center rounded-full',done?'bg-up/15 text-up':'bg-fg/5 text-mute')}><Check size={16}/></span><div className="flex-1"><p className="text-sm font-semibold">{l}</p><p className="text-xs text-mute">+{pts} points</p></div>
   {got?<Btn variant="ghost" className="min-w-[104px]" disabled>Claimed</Btn>:done?<Btn className="min-w-[104px]" onClick={()=>a.claim(id,pts)}>Claim</Btn>:<Btn variant="ghost" className="min-w-[104px]" onClick={()=>to==='x'?a.connectX():go(to)}>Do it</Btn>}</Card>})}</div></>}
