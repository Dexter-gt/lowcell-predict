import {ReactNode} from 'react';
export const cx=(...a:(string|false|undefined)[])=>a.filter(Boolean).join(' ');
export const pct=(n:number,d=1)=>(n*100).toFixed(d)+'%';
export const usd=(n:number)=>n>=1e3?`$${(n/1e3).toFixed(1)}K`:`$${n}`;
export const left=(ms:number)=>{const h=Math.max(0,Math.round((ms-Date.now())/36e5));return h>=48?`${Math.round(h/24)}d`:`${h}h`};
export const Card=({children,className,delay=0}:{children:ReactNode;className?:string;delay?:number})=>
 <section style={{animationDelay:`${delay}ms`}} className={cx('rise rounded-2xl border border-line bg-surface p-4 sm:p-5',className)}>{children}</section>;
export const Skel=({className}:{className?:string})=><div className={cx('skel',className)}/>;
export const Chip=({children,tone='mute'}:{children:ReactNode;tone?:'mute'|'up'|'down'|'accent'})=>
 <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',{mute:'bg-fg/5 text-mute',up:'bg-up/10 text-up',down:'bg-down/10 text-down',accent:'bg-accent/15 text-accent'}[tone])}>{children}</span>;
export const Title=({children,right}:{children:ReactNode;right?:ReactNode})=>
 <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold tracking-wide text-mute">{children}</h2>{right}</div>;
