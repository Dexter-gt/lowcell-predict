import {useEffect,useState} from 'react';
import {Copy as CopyIcon,Check,Wallet as W,ShieldCheck} from 'lucide-react';
import {useMarkets} from '../hooks/useMarkets';import {useAsync} from '../hooks/useAsync';
import {extra} from '../data/extra';import {useApp,mark,equity,label} from '../state/store';import {short} from '../integrations/providers';
import {Card,Chip,Skel,Title} from '../components/ui';import {cx} from '../components/ui';
import {ConfirmBtn,Btn,PageHead,Input,Select,Pills,Table,Stat,Empty,Field,Drawer} from '../components/kit';
import {LineChart} from '../components/charts';import {Thumb} from '../components/MarketImage';
import {TradeWidget,Pick,defaultPick,cents} from '../components/TradeWidget';
type Go=(r:string)=>void;
const money=(n:number)=>`${n<0?'-':''}$${Math.abs(n).toLocaleString(undefined,{maximumFractionDigits:2})}`;
const tone=(n:number)=>n>=0?'text-up':'text-down';
const when=(t:number)=>new Date(t).toLocaleString([],{dateStyle:'medium',timeStyle:'short'});
const copyText=(t:string,toast:(m:string)=>void)=>{try{navigator.clipboard.writeText(t)}catch{};toast('Copied')};

export function Practice(){
 const{s,a}=useApp(),ms=useMarkets(),[id,setId]=useState('m1'),[pick,setPick]=useState<Pick|null>(null),list=ms?.filter(x=>x.priced!==false),m=list?.find(x=>x.id===id),eq=equity(s);
 useEffect(()=>{if(m)setPick(defaultPick(m))},[m?.id]);
 return <><PageHead title="Practice" sub="Trade any market with practice cash. Orders use live-style prices and have no cash value." right={<ConfirmBtn label="Reset account" onConfirm={a.reset}/>}/>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat l="Practice cash" v={money(s.cash)}/><Stat l="Portfolio value" v={money(eq)}/><Stat l="Return" v={s.user?`${((eq/10000-1)*100).toFixed(1)}%`:'—'} tone={eq>=10000?'up':'down'}/><Stat l="Open positions" v={s.positions.length}/></div>
  <div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4"><Select aria-label="Market" value={id} onChange={e=>setId(e.target.value)}>{list?.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</Select>{m&&pick?<TradeWidget m={m} pick={pick} setPick={setPick}/>:<Skel className="h-96"/>}</div>
   <Card><Title>Recent practice trades</Title>{s.txs.filter(t=>t.type==='trade'||t.type==='close').slice(0,8).map(t=><div key={t.id} className="flex justify-between gap-4 border-b border-line/60 py-3 text-sm last:border-0"><span className="min-w-0 truncate">{t.label}</span><b className="shrink-0 tabular-nums">{money(t.amount)}</b></div>)}{!s.txs.some(t=>t.type==='trade'||t.type==='close')&&<Empty text="No trades yet. Place your first practice order."/>}</Card></div></>}

export function CopyTrade({go}:{go:Go}){
 const{s,a}=useApp(),ts=useAsync(()=>extra.traders(),[]),[pick,setPick]=useState<any>(null),[alloc,setAlloc]=useState(500);
 return <><PageHead title="Copy Trade" sub="Follow public reference traders with practice cash. Their results are historical and not a promise of future returns."/>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{!ts?Array(6).fill(0).map((_,i)=><Skel key={i} className="h-56"/>):ts.map(t=>{const on=s.copies.some(c=>c.traderId===t.id);return <Card key={t.id}>
   <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent to-blue font-bold text-white">{t.handle[0]}</span><div><p className="font-bold">{t.handle}</p><p className="text-xs text-mute">{t.style}</p></div></div><Chip tone={t.pnl30>=0?'up':'down'}>{t.pnl30>=0?'+':''}{t.pnl30}% 30d</Chip></div>
   <div className="my-4"><LineChart h={60} series={[{color:t.pnl30>=0?'#2fd685':'#ff3d5a',values:t.curve}]}/></div>
   <div className="grid grid-cols-3 gap-2 text-center text-xs"><div><p className="text-mute">Win rate</p><b>{t.win}%</b></div><div><p className="text-mute">Avg size</p><b>${t.avg}</b></div><div><p className="text-mute">Followers</p><b>{t.followers.toLocaleString()}</b></div></div>
   <Btn className="mt-4 w-full" variant={on?'ghost':'solid'} onClick={()=>on?go('my-copies'):setPick(t)}>{on?'Copying · manage':'Copy trader'}</Btn></Card>})}</div>
  <Drawer open={!!pick} close={()=>setPick(null)} title={`Copy ${pick?.handle??''}`}>{pick&&<><Field label={`Allocation: $${alloc}`} hint={`Practice cash available: ${money(s.cash)}`}><input type="range" min={100} max={Math.max(100,Math.min(5000,Math.floor(s.cash)))} step={50} value={alloc} onChange={e=>setAlloc(+e.target.value)} className="h-10 w-full cursor-pointer accent-accent"/></Field>
   <p className="rounded-xl bg-raised p-3 text-xs text-mute">You copy {pick.handle}'s entries proportionally to your allocation. You can pause or stop any time and unused funds return to your practice cash.</p>
   <Btn className="w-full" disabled={!!s.user&&alloc>s.cash} onClick={()=>{a.follow(pick,alloc);setPick(null)}}>{s.user?'Start copying':'Log in to copy'}</Btn></>}</Drawer></>}

export function Wallet(){
 const{s,a,openAuth,toast}=useApp(),[amt,setAmt]=useState(500),[busy,setBusy]=useState(false);
 const run=async(f:()=>Promise<void>)=>{setBusy(true);await f();setBusy(false)};
 if(!s.user)return <><PageHead title="Wallet"/><Card><Empty text="Log in with your email and a wallet is created for you automatically." action={<Btn onClick={openAuth}>Log in</Btn>}/></Card></>;
 return <><PageHead title="Wallet" sub="Your wallet was created when you signed up with your email. Real-money deposits are not enabled yet, so deposits add practice cash."/>
  <div className="grid gap-6 lg:grid-cols-2"><Card className="space-y-4"><Title right={<Chip tone="up">Active</Chip>}>Your wallet</Title>
   <div className="flex items-center gap-3 rounded-xl bg-raised p-4"><W size={18} className="shrink-0 text-accent"/><div className="min-w-0 flex-1"><p className="break-all font-mono text-sm">{s.address}</p><p className="mt-1 text-xs text-mute">Polygon · created for {s.user.email}</p></div>
    <button aria-label="Copy address" onClick={()=>copyText(s.address!,toast)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-mute hover:bg-fg/10 hover:text-ink"><CopyIcon size={16}/></button></div>
   <p className="flex gap-2 text-xs text-mute"><ShieldCheck size={14} className="mt-0.5 shrink-0"/>Your wallet is tied to your email login. LOWCELL never asks for your private key.</p></Card>
  <Card className="space-y-4"><Title>Practice balance</Title><p className="text-4xl font-extrabold tabular-nums">{money(s.cash)}</p>
   <Field label="Amount (USD)"><Input type="number" min={1} value={amt} onChange={e=>setAmt(+e.target.value)}/></Field>
   <div className="flex gap-2"><Btn className="flex-1" disabled={amt<=0} busy={busy} onClick={()=>run(()=>a.deposit(amt))}>Deposit</Btn><Btn className="flex-1" variant="ghost" disabled={amt<=0||amt>s.cash} busy={busy} onClick={()=>run(()=>a.withdraw(amt))}>Withdraw</Btn></div></Card></div></>}

function MCell({image,title,sub,id,go}:{image?:string;title:string;sub?:string;id?:string;go:Go}){
 return <button onClick={()=>id&&go('market-'+id)} className="flex min-w-[240px] items-center gap-3 text-left"><Thumb src={image} name={title}/><span className="min-w-0"><span className="line-clamp-2 block text-sm font-semibold leading-snug">{title}</span>{sub&&<span className="block text-xs text-mute">{sub}</span>}</span></button>}

export function Portfolio({go}:{go:Go}){
 const{s,a,openAuth}=useApp(),[tab,setTab]=useState('positions'),[of,setOf]=useState('open'),[hf,setHf]=useState('all');
 const eq=equity(s),un=s.positions.reduce((t,p)=>t+(mark(p)-p.avg)*p.shares,0),real=s.closed.reduce((t,c)=>t+c.pnl,0),openOrders=s.orders.filter(o=>o.status==='open');
 const hist=s.txs.filter(t=>hf==='all'||t.type===hf),orders=s.orders.filter(o=>of==='all'||o.status==='open');
 const csv=()=>{const b=new Blob(['date,type,label,amount\n'+hist.map(t=>`${new Date(t.t).toISOString()},${t.type},"${t.label}",${t.amount.toFixed(2)}`).join('\n')],{type:'text/csv'});const l=document.createElement('a');l.href=URL.createObjectURL(b);l.download='lowcell-history.csv';l.click()};
 const none=(t:string)=><Empty text={t} action={<Btn onClick={()=>go('markets')}>Browse markets</Btn>}/>;
 if(!s.user)return <><PageHead title="Portfolio"/><Card><Empty text="Log in to see your positions, orders and trade history." action={<Btn onClick={openAuth}>Log in</Btn>}/></Card></>;
 const tabs:[string,string][]=[['positions',`Positions${s.positions.length?` (${s.positions.length})`:''}`],['orders',`Orders${openOrders.length?` (${openOrders.length})`:''}`],['closed','Closed trades'],['history','History']];
 return <><PageHead title="Portfolio" sub="Your positions, limit orders, closed trades and full activity history."/>
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat l="Portfolio value" v={money(eq)}/><Stat l="Cash" v={money(s.cash)}/><Stat l="Unrealized P&L" v={money(un)} tone={un>=0?'up':'down'}/><Stat l="Realized P&L" v={money(real)} tone={real>=0?'up':'down'}/></div>
  <div className="border-b border-line"><div className="no-scrollbar flex gap-7 overflow-x-auto overflow-y-hidden pr-6" role="tablist">{tabs.map(([k,l])=><button key={k} role="tab" aria-selected={tab===k} onClick={()=>setTab(k)} className={cx('shrink-0 whitespace-nowrap border-b-2 py-3.5 text-sm font-semibold transition-colors',tab===k?'border-accent text-ink':'border-transparent text-mute hover:text-ink')}>{l}</button>)}</div></div>
  {tab==='positions'&&<Card className="!p-0">{s.positions.length===0?none('You have no open positions.'):<Table head={['Market','Avg','Current','Value','P&L','']} rows={s.positions.map(p=>{const m=mark(p),pl=(m-p.avg)*p.shares;return[<MCell image={p.image} title={p.market} sub={`${label(p)} · ${p.shares.toFixed(1)} shares`} id={p.marketId} go={go}/>,cents(p.avg),cents(m),money(p.shares*m),<span className={tone(pl)}>{money(pl)} ({((m/p.avg-1)*100).toFixed(1)}%)</span>,<div className="flex justify-end gap-2"><Btn variant="ghost" className="!h-9" onClick={()=>go('market-'+p.marketId)}>Trade</Btn><ConfirmBtn className="!h-9" label="Sell all" onConfirm={()=>a.sell(p,p.shares,m)}/></div>]})}/>}</Card>}
  {tab==='orders'&&<><Pills v={of} set={setOf} opts={[['open','Open orders'],['all','Order history']]}/><Card className="!p-0">{orders.length===0?none(of==='open'?'No open limit orders.':'No limit orders yet.'):<Table head={['Market','Order','Price','Shares','Total','Status','']} rows={orders.map(o=>[<MCell image={o.image} title={o.market} sub={when(o.createdAt)} id={o.marketId} go={go}/>,`Limit ${o.action} ${label(o)}`,cents(o.price),o.shares,money(o.price*o.shares),<Chip tone={o.status==='open'?'accent':o.status==='filled'?'up':'mute'}>{o.status}</Chip>,o.status==='open'?<Btn variant="ghost" className="!h-9" onClick={()=>a.cancelOrder(o.id)}>Cancel</Btn>:null])}/>}</Card></>}
  {tab==='closed'&&<Card className="!p-0">{s.closed.length===0?none('No closed trades yet. Sell a position to see it here.'):<Table head={['Market','Entry','Exit','Shares','P&L','Closed']} rows={s.closed.map(c=>[<MCell image={c.image} title={c.market} sub={label(c)} go={go}/>,cents(c.entry),cents(c.exit),c.shares.toFixed(1),<span className={tone(c.pnl)}>{money(c.pnl)} ({((c.exit/c.entry-1)*100).toFixed(1)}%)</span>,<span className="whitespace-nowrap text-mute">{when(c.closedAt)}</span>])}/>}</Card>}
  {tab==='history'&&<><div className="flex flex-wrap items-center justify-between gap-3"><Pills v={hf} set={setHf} opts={[['all','All'],['trade','Buys'],['close','Sells'],['order','Orders'],['deposit','Deposits'],['withdraw','Withdrawals'],['copy','Copies'],['reward','Rewards']]}/><Btn variant="ghost" onClick={csv}>Export CSV</Btn></div>
   <Card className="!p-0">{hist.length===0?<Empty text="Nothing here yet."/>:<Table left={3} head={['Date','Type','Details','Amount']} rows={hist.map(t=>[<span className="whitespace-nowrap">{when(t.t)}</span>,<Chip>{t.type}</Chip>,t.label,<b className={tone(t.amount)}>{t.amount?money(t.amount):'—'}</b>])}/>}</Card></>}</>}

export function MyCopies({go}:{go:Go}){
 const{s,a}=useApp();
 return <><PageHead title="My Copies" sub="Traders you follow with practice cash."/>
  {s.copies.length===0?<Card><Empty text="You aren't copying anyone yet." action={<Btn onClick={()=>go('copy')}><CopyIcon size={16}/>Find traders</Btn>}/></Card>:
  <div className="grid gap-4 md:grid-cols-2">{s.copies.map(c=><Card key={c.traderId}><div className="flex items-center justify-between"><p className="font-bold">{c.handle}</p><Chip tone={c.active?'up':'mute'}>{c.active?'Active':'Paused'}</Chip></div>
   <div className="my-4 grid grid-cols-3 text-center text-sm"><div><p className="text-xs text-mute">Allocated</p><b>{money(c.alloc)}</b></div><div><p className="text-xs text-mute">P&L</p><b className={tone(c.pnl)}>{money(c.pnl)}</b></div><div><p className="text-xs text-mute">Since</p><b>{new Date(c.since).toLocaleDateString()}</b></div></div>
   <div className="flex gap-2"><Btn variant="ghost" className="flex-1" onClick={()=>a.pause(c.traderId)}>{c.active?'Pause':'Resume'}</Btn><ConfirmBtn className="flex-1" label="Stop & return funds" onConfirm={()=>a.stop(c.traderId)}/></div></Card>)}</div>}</>}
