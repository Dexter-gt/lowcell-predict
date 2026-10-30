import type {ExtraSource,Station} from './types';
const rnd=(s:number)=>()=>(s=(s*16807)%2147483647)/2147483647;
const wait=<T,>(v:T,ms=350)=>new Promise<T>(r=>setTimeout(()=>r(v),ms));
const norm=(a:number[])=>{const t=a.reduce((p,c)=>p+c,0);return a.map(v=>v/t)};
const bell=(n:number,c:number,w:number)=>norm(Array.from({length:n},(_,i)=>Math.exp(-((i-c)**2)/(2*w*w))+.01));
const st=(id:string,city:string,code:string,unit:string,obs:number,labels:string[],ec:number,mc:number,hours:number):Station=>({id,city,code,unit,obs,labels,ens:bell(labels.length,ec,1.1),mkt:bell(labels.length,mc,1.3),hours});
const T=['Ava_K','MarketMonk','delta9','Nori','kasa.eth','0xBera'];
export const extra:ExtraSource={
 traders:()=>wait(T.map((h,i)=>{const r=rnd(i*97+13);let v=0;return{id:'t'+i,handle:h,pnl30:Math.round((r()*60-8)*10)/10,win:Math.round(48+r()*26),avg:Math.round(20+r()*180),followers:Math.round(80+r()*2400),style:['Tweet brackets','Weather','NegRisk','Tweet brackets','Weather','Mixed'][i],curve:Array.from({length:30},()=>v+=r()*5-1.6)}})),
 stations:()=>wait([
  st('nyc','New York','KLGA','°F',71,['≤66','67','68','69','70','71','72','73+'],4,3,9),
  st('lon','London','EGLC','°C',16,['≤13','14','15','16','17','18','19+'],3,3,14),
  st('sel','Seoul','RKSI','°C',19,['≤16','17','18','19','20','21','22+'],4,3,20)]),
 accuracy:()=>wait({brier:.187,hit:.41,n:312,calib:[.05,.15,.25,.35,.45,.55,.65,.75,.85].map((p,i)=>({p,obs:Math.max(0,Math.min(1,p+[.02,-.03,.04,-.05,.03,-.04,-.06,-.03,-.07][i]))})),byCat:[{cat:'Elon tweets',hit:.44},{cat:'Weather',hit:.52},{cat:'NegRisk',hit:.37}]}),
 leaders:()=>wait([['Nori',38.4,212,61],['kasa.eth',31.2,187,58],['Ava_K',22.9,143,55],['delta9',17.5,96,57],['MarketMonk',12.1,251,52],['0xBera',8.3,64,50],['moonlit',4.4,38,49],['quietfox',-2.1,77,46]].map(([name,ret,trades,win])=>({name:name as string,ret:ret as number,trades:trades as number,win:win as number})))};
