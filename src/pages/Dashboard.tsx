import {useEffect,useState} from 'react';
import {Sparkles} from 'lucide-react';
import {dataSource} from '../data/adapter';import type {Category} from '../data/types';
import {useAsync} from '../hooks/useAsync';import {useMarkets} from '../hooks/useMarkets';
import {StatRow,Hero,Distribution,Activity,Radar,MarketList} from '../components/panels';
import {Btn} from '../components/kit';
export default function Dashboard({trade,go}:{trade:(id:string)=>void;go:(r:string)=>void}){
 const[cat,setCat]=useState<Category>('elon'),[sel,setSel]=useState('m1'),[busy,setBusy]=useState(false);
 const markets=useMarkets(),radar=useAsync(()=>dataSource.getRadar(),[]),activity=useAsync(()=>dataSource.getActivity(sel),[sel]);
 const m=markets?.find(x=>x.id===sel);
 const analyze=(id=sel)=>{setSel(id);setBusy(true);setTimeout(()=>setBusy(false),650)};
 useEffect(()=>{if(markets)analyze()},[!!markets]);
 return <><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-mute">Market intelligence</p><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Dashboard</h1><p className="text-sm text-mute">Independent forecasts. Live market perspective.</p></div>
  <div className="flex gap-2"><Btn variant="ghost" onClick={()=>go('markets')}>All markets</Btn><Btn variant="ghost" disabled={!m} onClick={()=>trade(sel)}>Trade this market</Btn><button onClick={()=>analyze()} className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-blue px-5 text-sm font-bold text-white transition hover:brightness-110 active:scale-95 lg:flex"><Sparkles size={16}/>Run analysis</button></div></div>
  <StatRow m={m} busy={busy||!m}/>
  <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"><div className="min-w-0 space-y-6"><Hero m={m} busy={busy||!m}/><Distribution m={m} busy={busy||!m}/><Activity data={busy?undefined:activity}/></div>
   <div className="min-w-0 space-y-6"><MarketList markets={markets} cat={cat} setCat={setCat} sel={sel} pick={analyze}/><Radar items={radar}/></div></div>
  <button onClick={()=>analyze()} className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-blue px-6 py-3 text-sm font-bold text-white shadow-xl shadow-accent/30 transition active:scale-95 lg:hidden"><Sparkles size={16}/>Run analysis</button></>}
