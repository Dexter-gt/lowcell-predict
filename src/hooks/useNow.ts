import {useSyncExternalStore} from 'react';
// One shared 1s ticker for every live countdown on the page.
const subs=new Set<()=>void>();let now=Date.now(),t:ReturnType<typeof setInterval>|null=null;
const sub=(f:()=>void)=>{subs.add(f);if(!t){now=Date.now();t=setInterval(()=>{now=Date.now();subs.forEach(s=>s())},1000)}return()=>{subs.delete(f);if(!subs.size&&t){clearInterval(t);t=null}}};
export const useNow=()=>useSyncExternalStore(sub,()=>now);
const p2=(n:number)=>String(n).padStart(2,'0');
export function countdown(ms:number){if(ms<=0)return'Closed';const s=Math.floor(ms/1e3),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),x=s%60;return d?`${d}d ${h}h ${p2(m)}m ${p2(x)}s`:h?`${h}h ${p2(m)}m ${p2(x)}s`:`${m}m ${p2(x)}s`}
