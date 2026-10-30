import {useSyncExternalStore} from 'react';
export type Mode='light'|'dark'|'system';
const KEY='lowcell.theme',subs=new Set<()=>void>();
const read=():Mode=>{try{const v=localStorage.getItem(KEY);return v==='light'||v==='system'?v:'dark'}catch{return'dark'}};
let mode:Mode=read();
const mq=typeof matchMedia!=='undefined'?matchMedia('(prefers-color-scheme: light)'):null;
export const resolved=(m:Mode=mode)=>m==='system'?(mq?.matches?'light':'dark'):m;
const apply=()=>{document.documentElement.dataset.theme=resolved();document.querySelector('meta[name=theme-color]')?.setAttribute('content',resolved()==='light'?'#F6F6F7':'#09090B');subs.forEach(f=>f())};
mq?.addEventListener('change',()=>mode==='system'&&apply());
apply();
export const setMode=(m:Mode)=>{mode=m;try{localStorage.setItem(KEY,m)}catch{};apply()};
export function useTheme(){
 const m=useSyncExternalStore(f=>(subs.add(f),()=>{subs.delete(f)}),()=>mode+'|'+resolved());
 const[mo,res]=m.split('|') as [Mode,'light'|'dark'];
 return{mode:mo,theme:res,setMode,toggle:()=>setMode(res==='dark'?'light':'dark')};
}
