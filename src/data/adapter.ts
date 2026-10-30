import type {DataSource,Market,Category,Kind} from './types';
import {IMG} from '../assets/images';
const rnd=(s:number)=>()=>(s=(s*16807)%2147483647)/2147483647;
const g=(x:number,c:number,w:number)=>Math.exp(-((x-c)**2)/(2*w*w));
const norm=(a:number[])=>{const t=a.reduce((p,c)=>p+c,0);return a.map(v=>v/t)};
const brackets=(s:number,st:number,n:number,plus=false)=>Array.from({length:n},(_,i)=>plus&&i===n-1?`${s+st*i}+`:`${s+st*i}-${s+st*i+st-1}`);
function mk(id:string,range:string,labels:string[],mf:number,lf:number,vol:number,hrs:number,verified:number,seed:number,category:Category='elon',subject='Elon Musk # of tweets',image?:string):Market{
 const r=rnd(seed),n=labels.length,w=n<=10?.8:n<=20?1.6:2.6;
 const m=norm(labels.map((_,i)=>g(i,mf,w)+.004)),l=norm(labels.map((_,i)=>g(i,lf,w*1.1)+.004+r()*.004));
 let a=m[Math.round(lf)]*.75,b=m[Math.round(lf)]*.9;
 const history=Array.from({length:48},()=>({lowcell:a+=(l[Math.round(lf)]-a)*.07+(r()-.5)*.012,market:b+=(m[Math.round(lf)]-b)*.06+(r()-.5)*.01}));
 return{id,title:`${subject} - ${range}`,range,subject,category,endsAt:Date.now()+hrs*36e5,vol24h:vol,verified,perHour:Math.round(2+r()*5),outcomes:labels.map((label,i)=>({label,market:m[i],lowcell:l[i]})),history,image,liq:Math.round(vol*.12),move24:Math.round((r()-.5)*90)/10,created:Date.now()-r()*96*36e5,kind:(category==='negrisk'?'multi':'bracket') as Kind,modeled:true,priced:true};
}
const ET=(ms:number,o:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',...o}).format(ms);
const hm=(ms:number)=>ET(ms,{hour:'numeric',minute:'2-digit',hour12:true}).replace(' ','');
function bin(id:string,subject:string,range:string,category:Category,kind:Kind,labels:[string,string],p:number,liq:number,vol:number,hrs:number,seed:number,image:string,priced=true,end?:number):Market{
 const r=rnd(seed);let a=p;
 const history=Array.from({length:48},()=>{a+=(p-a)*.08+(r()-.5)*.02;return{lowcell:a,market:a}});
 return{id,title:`${subject}${range?' - '+range:''}`,subject,range,category,kind,endsAt:end??Date.now()+hrs*36e5,vol24h:vol,liq,verified:0,perHour:0,image,history,move24:priced&&r()>.6?Math.round((r()-.5)*40)/10:null,created:Date.now()-r()*20*36e5,modeled:false,priced,
  outcomes:[{label:labels[0],market:priced?p:0,lowcell:priced?p:0},{label:labels[1],market:priced?+(1.01-p).toFixed(2):0,lowcell:priced?+(1.01-p).toFixed(2):0}]};
}
const slot=(hrs:number,mins=5)=>{const end=Math.ceil((Date.now()+hrs*36e5)/3e5)*3e5;return{end,range:`${ET(end,{month:'long',day:'numeric'})}, ${hm(end-mins*6e4)}-${hm(end)} ET`}};
const ud=(id:string,name:string,img:string,hrs:number,liq:number,seed:number,p=.51,mins=5)=>{const s=slot(hrs,mins);return bin(id,`${name} Up or Down`,s.range,'crypto','updown',['Up','Down'],p,liq,0,hrs,seed,IMG[img],true,s.end)};
const interleave=<T,>(...ls:T[][])=>{const out:T[]=[];for(let i=0;ls.some(l=>i<l.length);i++)ls.forEach(l=>l[i]&&out.push(l[i]));return out};
const ELON:Market[]=[
 mk('m1','Oct 26 – 28',brackets(15,25,8),3,3,171900,21,69,11,'elon','Elon Musk # of tweets',IMG.elon),
 mk('m2','Oct 23 – 30',brackets(120,20,20),10,11,234100,67,214,22,'elon','Elon Musk # of tweets',IMG.elon),
 mk('m3','Oct 29 – 31',brackets(15,25,10),2,2,12200,45,0,33,'elon','Elon Musk # of tweets',IMG.elon),
 mk('m4','Oct 27 – Nov 3',brackets(40,20,30),13,13,104600,142,69,44,'elon','Elon Musk # of tweets',IMG.elon),
 mk('m5','Oct 30 – Nov 6',brackets(60,20,30),13,14,37500,190,0,55,'elon','Elon Musk # of tweets',IMG.elon),
 mk('m6','in November',brackets(0,25,41,true),40,39,3800,880,0,66,'elon','Elon Musk # of tweets',IMG.elon),
];
const OTHER:Market[]=[
 mk('w1','Oct 29',['≤66','67','68','69','70','71','72+'],3,3.4,41200,32,0,71,'weather','NYC daily high (KLGA)',IMG.nyc),
 mk('w2','Oct 29',['≤13','14','15','16','17','18+'],3,3,18700,32,0,72,'weather','London daily high (EGLC)',IMG.lon),
 mk('w3','Oct 30',['≤13','14','15','16','17','18+'],3,3.4,9400,56,0,73,'weather','London daily high (EGLC)',IMG.lon),
 mk('n1','November meeting',['No change','25 bps cut','50+ bps cut','25 bps hike'],0,0,812000,120,0,81,'negrisk','Fed decision',IMG.fed),
 mk('n2','end of November',['Google','Anthropic','OpenAI','xAI'],0,0,430000,700,0,82,'negrisk','Best AI model',IMG.ai),
 mk('n3','next government',['Dejan Šoškić','Radomir Saičić','Other'],0,0,24000,3000,0,83,'negrisk','Next Prime Minister of Serbia',IMG.rs),
];
const WEATHER=OTHER.filter(m=>m.category==='weather'),NEG=OTHER.filter(m=>m.category==='negrisk');
const CRYPTO:Market[]=[
 ud('c1','Bitcoin','btc',23.7,5000,101),ud('c2','Ethereum','eth',23.8,3400,102),ud('c3','Solana','sol',23.8,1700,103),ud('c4','XRP','xrp',23.8,1700,104),
 ud('c5','Dogecoin','doge',23.8,1200,105,.5),ud('c6','Hyperliquid','hype',23.8,347,106),ud('c7','ZCash','zec',23.7,143,107,.5),
 ud('c8','Bitcoin','btc',23.62,5000,108),ud('c9','Hyperliquid','hype',23.62,347,109),ud('c10','Gold','gold',24.04,1900,110,.5,15)];
const ESPORTS:Market[]=[
 bin('e1','Map 1 Rounds Handicap: KRÜ Blaze (-4.5) vs Team Liquid Brazil','','esports','versus',['KRÜ Blaze','Team Liquid Brazil'],.5,0,0,5.05,91,IMG.valorant,false),
 bin('e2','Total Kills Over/Under 39.5 in Game 1?','','esports','overunder',['Over','Under'],.5,0,0,5.4,92,IMG.lol,false),
 bin('e3','Total Kills Over/Under 55.5 in Game 1?','','esports','overunder',['Over','Under'],.5,0,0,5.95,93,IMG.dota,false)];
const MARKETS:Market[]=interleave(ESPORTS,CRYPTO,ELON,WEATHER,NEG);
const TITLES:Record<string,string>={m1:'Elon Musk # of tweets October 26 - October 28?',m2:'Elon Musk # of tweets October 23 - October 30?',m3:'Elon Musk # of tweets October 29 - October 31?',m4:'Elon Musk # of tweets October 27 - November 3?',m5:'Elon Musk # of tweets October 30 - November 6?',m6:'Elon Musk # of tweets in November?',
 w1:'Highest temperature in New York City on October 29?',w2:'Highest temperature in London on October 29?',w3:'Highest temperature in London on October 30?',n1:'Fed decision in November?',n2:'Which company has the best AI model end of November?',n3:'Next Prime Minister of Serbia?'};
MARKETS.forEach(m=>{if(TITLES[m.id])m.title=TITLES[m.id]});
const wait=<T,>(v:T,ms=450)=>new Promise<T>(r=>setTimeout(()=>r(v),ms));
export const dataSource:DataSource={
 listMarkets:()=>wait(MARKETS),
 getActivity:async id=>{const r=rnd([...id].reduce((a,c)=>a+c.charCodeAt(0),7));const h=new Date().getHours();
  return wait(Array.from({length:24},(_,i)=>({hour:String((h+i+1)%24).padStart(2,'0'),count:Math.round(r()*14+(i>8&&i<20?10:2))})),350)},
 getRadar:()=>wait([
  {id:'r1',label:'Oct 26 – 28 → Oct 27 – Nov 3',gap:.042,note:'Weekly bracket lags the daily by ~4 pts'},
  {id:'r2',label:'Oct 29 – 31 → Oct 30 – Nov 6',gap:-.027,note:'Daily bracket priced rich vs weekly'},
  {id:'r3',label:'Oct 23 – 30 → November',gap:.011,note:'Within normal spread — no signal'}],600)};
