import {createContext,useContext,useEffect,useRef,useState,ReactNode} from 'react';
import {auth,trading,wallet} from '../integrations/providers';
import type {Market,Trader} from '../data/types';
export type Side='Yes'|'No';
export interface Position{id:string;marketId:string;market:string;image?:string;outcome:string;side?:Side;shares:number;avg:number}
export interface Order{id:string;marketId:string;market:string;image?:string;outcome:string;side?:Side;action:'Buy'|'Sell';price:number;shares:number;status:'open'|'filled'|'cancelled';createdAt:number}
export interface Closed{id:string;market:string;image?:string;outcome:string;side?:Side;shares:number;entry:number;exit:number;pnl:number;closedAt:number}
export interface Tx{id:string;t:number;type:'trade'|'close'|'order'|'deposit'|'withdraw'|'copy'|'reward';label:string;amount:number}
export interface Copy{traderId:string;handle:string;alloc:number;active:boolean;since:number;pnl:number}
export interface S{user:{name:string;email:string}|null;cash:number;positions:Position[];orders:Order[];closed:Closed[];txs:Tx[];copies:Copy[];address:string|null;xHandle:string|null;points:number;claimed:string[];read:boolean;settings:{edge:boolean;close:boolean;digest:boolean}}
const hash=(s:string)=>[...s].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7);
// TODO(polymarket): replace the synthetic mark with the live best bid for the position's outcome.
export const mark=(p:Position)=>Math.min(.99,Math.max(.01,p.avg*(1+((hash(p.id)%23)-9)/100)));
export const equity=(s:S)=>s.cash+s.positions.reduce((a,p)=>a+p.shares*mark(p),0);
export const priceOf=(m:Market,outcome:string,side?:Side)=>{const o=m.outcomes.find(x=>x.label===outcome),p=o?o.market:.5;return Math.min(.99,Math.max(.01,side==='No'?1-p:p))};
export const label=(p:{outcome:string;side?:Side})=>p.side?`${p.outcome} · ${p.side}`:p.outcome;
const CREDIT=10000,KEY='lowcell.v2',uid=()=>Math.random().toString(36).slice(2,8);
const INIT:S={user:null,cash:0,positions:[],orders:[],closed:[],txs:[],copies:[],address:null,xHandle:null,points:120,claimed:[],read:false,settings:{edge:true,close:true,digest:false}};
const credit=():Tx=>({id:uid(),t:Date.now(),type:'deposit',label:'Practice credit',amount:CREDIT});
function actions(setS:(f:(s:S)=>S)=>void,toast:(m:string)=>void,get:()=>S,openAuth:()=>void){
 const tx=(s:S,type:Tx['type'],text:string,amount:number):S=>({...s,txs:[{id:uid(),t:Date.now(),type,label:text,amount},...s.txs]});
 const ok=()=>{if(get().user)return true;openAuth();return false};
 const buy=async(m:Market,outcome:string,side:Side|undefined,usd:number)=>{
  if(!ok())return false;if(usd>get().cash){toast('Not enough practice cash');return false}
  const price=priceOf(m,outcome,side),f=await trading.placeOrder({marketId:m.id,outcome,side,action:'Buy',type:'market',usd,price});
  setS(p=>{const ex=p.positions.find(x=>x.marketId===m.id&&x.outcome===outcome&&x.side===side);
   const positions=ex?p.positions.map(x=>x===ex?{...x,shares:x.shares+f.shares,avg:(x.avg*x.shares+f.price*f.shares)/(x.shares+f.shares)}:x):[{id:f.id,marketId:m.id,market:m.title,image:m.image,outcome,side,shares:f.shares,avg:f.price},...p.positions];
   return tx({...p,cash:p.cash-usd,positions,points:p.points+10},'trade',`Buy ${label({outcome,side})} · ${m.title}`,-usd)});
  toast(`Bought ${f.shares.toFixed(1)} shares of ${label({outcome,side})}`);return true};
 return{
  buy,
  async limit(m:Market,outcome:string,side:Side|undefined,cents:number,shares:number){
   if(!ok())return false;const mkt=priceOf(m,outcome,side),price=cents/100;
   if(price*shares>get().cash){toast('Not enough practice cash');return false}
   if(price>=mkt)return buy(m,outcome,side,shares*mkt);
   setS(p=>tx({...p,orders:[{id:uid(),marketId:m.id,market:m.title,image:m.image,outcome,side,action:'Buy',price,shares,status:'open',createdAt:Date.now()},...p.orders]},'order',`Limit buy ${label({outcome,side})} @ ${cents}¢`,0));
   toast('Limit order placed');return true},
  cancelOrder(id:string){setS(p=>({...p,orders:p.orders.map(o=>o.id===id?{...o,status:'cancelled' as const}:o)}));toast('Order cancelled')},
  sell(pos:Position,shares:number,price:number){
   if(!ok())return false;const sh=Math.min(shares,pos.shares),v=sh*price;
   setS(p=>{const rem=pos.shares-sh,positions=rem<1e-6?p.positions.filter(x=>x.id!==pos.id):p.positions.map(x=>x.id===pos.id?{...x,shares:rem}:x);
    return tx({...p,cash:p.cash+v,positions,closed:[{id:uid(),market:pos.market,image:pos.image,outcome:pos.outcome,side:pos.side,shares:sh,entry:pos.avg,exit:price,pnl:(price-pos.avg)*sh,closedAt:Date.now()},...p.closed]},'close',`Sell ${label(pos)} · ${pos.market}`,v)});
   toast(`Sold ${sh.toFixed(1)} shares`);return true},
  async completeAuth(r:{user:{name:string;email:string};address:string}){setS(p=>({...p,user:r.user,address:r.address,cash:p.txs.length?p.cash:CREDIT,txs:p.txs.length?p.txs:[credit()]}))},
  async signOut(){await auth.logout();setS(p=>({...p,user:null}));toast('Logged out')},
  async connectX(){if(!ok())return;const r=await auth.linkX(get().user!.name);setS(p=>({...p,xHandle:r.handle}));toast(`X connected · ${r.handle}`)},
  disconnectX(){setS(p=>({...p,xHandle:null}))},
  async deposit(n:number){if(!ok())return;await wallet.deposit(n);setS(p=>tx({...p,cash:p.cash+n},'deposit','Practice deposit',n));toast(`+$${n} practice credit`)},
  async withdraw(n:number){if(!ok())return;await wallet.withdraw(n);setS(p=>tx({...p,cash:p.cash-n},'withdraw','Practice withdrawal',-n));toast('Withdrawn to practice wallet')},
  follow(t:Trader,alloc:number){if(!ok())return;setS(p=>tx({...p,cash:p.cash-alloc,copies:[...p.copies.filter(c=>c.traderId!==t.id),{traderId:t.id,handle:t.handle,alloc,active:true,since:Date.now(),pnl:alloc*t.pnl30/100*.35}],points:p.points+25},'copy',`Copy ${t.handle}`,-alloc));toast(`Now copying ${t.handle}`)},
  pause(id:string){setS(p=>({...p,copies:p.copies.map(c=>c.traderId===id?{...c,active:!c.active}:c)}))},
  stop(id:string){setS(p=>{const c=p.copies.find(x=>x.traderId===id)!;return tx({...p,cash:p.cash+c.alloc+c.pnl,copies:p.copies.filter(x=>x!==c)},'copy',`Stop copying ${c.handle}`,c.alloc+c.pnl)});toast('Copy stopped, funds returned')},
  claim(id:string,pts:number){setS(p=>p.claimed.includes(id)?p:{...p,claimed:[...p.claimed,id],points:p.points+pts});toast(`+${pts} points`)},
  markRead(){setS(p=>({...p,read:true}))},
  setting(k:keyof S['settings'],v:boolean){setS(p=>({...p,settings:{...p.settings,[k]:v}}))},
  setName(name:string){setS(p=>p.user?{...p,user:{...p.user,name}}:p)},
  reset(){setS(p=>({...INIT,user:p.user,address:p.address,xHandle:p.xHandle,cash:CREDIT,txs:[credit()]}));toast('Practice account reset')}}}
export type Actions=ReturnType<typeof actions>;
const Ctx=createContext<any>(null);
export const useApp=():{s:S;msg:string;toast:(m:string)=>void;a:Actions;authOpen:boolean;openAuth:()=>void;closeAuth:()=>void}=>useContext(Ctx);
export function AppProvider({children}:{children:ReactNode}){
 const[s,setS]=useState<S>(()=>{try{return{...INIT,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return INIT}});
 const[msg,setMsg]=useState(''),[authOpen,setAuth]=useState(false),ref=useRef(s);ref.current=s;
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}},[s]);
 const toast=(m:string)=>{setMsg(m);setTimeout(()=>setMsg(''),2600)};
 const a=useRef(actions(setS,toast,()=>ref.current,()=>setAuth(true))).current;
 return <Ctx.Provider value={{s,msg,toast,a,authOpen,openAuth:()=>setAuth(true),closeAuth:()=>setAuth(false)}}>{children}</Ctx.Provider>}
