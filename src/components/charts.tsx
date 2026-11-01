import {cx} from './ui';
export interface Series{color:string;values:number[]}
export function LineChart({series,h=170}:{series:Series[];h?:number}){
 const W=400,p=10,all=series.flatMap(s=>s.values),lo=Math.min(...all),hi=Math.max(...all);
 const x=(i:number,n:number)=>p+(i/(n-1))*(W-2*p),y=(v:number)=>p+(1-(v-lo)/((hi-lo)||1))*(h-2*p);
 return <svg viewBox={`0 0 ${W} ${h}`} className="w-full" role="img" aria-label="Estimate versus market price over time">
  {[0,.5,1].map(t=><line key={t} x1={p} x2={W-p} y1={p+t*(h-2*p)} y2={p+t*(h-2*p)} className="stroke-line" strokeDasharray="3 5"/>)}
  {series.map((s,k)=>{const n=s.values.length,d=s.values.map((v,i)=>`${i?'L':'M'}${x(i,n).toFixed(1)} ${y(v).toFixed(1)}`).join('');
   return <g key={k+s.color}><path d={d} pathLength={1} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" className="draw"/>
    <circle cx={x(n-1,n)} cy={y(s.values[n-1])} r="9" fill={s.color} opacity=".18" className="rise" style={{animationDelay:'1s'}}/>
    <circle cx={x(n-1,n)} cy={y(s.values[n-1])} r="4.5" fill={s.color} className="rise" style={{animationDelay:'1s'}}/></g>})}
 </svg>}
export function Bars({data,h=120}:{data:{label:string;value:number}[];h?:number}){
 const max=Math.max(...data.map(d=>d.value),1);
 return <div className="flex items-end gap-[3px]" style={{height:h}} role="img" aria-label="Posts per hour">
  {data.map((d,i)=><div key={i} title={`${d.label}:00 — ${d.value}`} className="group relative flex-1">
   <div className={cx('grow w-full rounded-t-[4px] transition-colors',i===data.length-1?'bg-accent':'bg-fg/15 group-hover:bg-accent/70')} style={{height:Math.max(4,(d.value/max)*h),animationDelay:`${i*20}ms`}}/></div>)}</div>}
