import {useEffect,useState} from 'react';
import {AppProvider,useApp} from './state/store';import {ROUTES} from './routes';
import {Sidebar,TopBar,BottomNav,ProfileSheet,PracticeBanner,Toast,Footer} from './components/Shell';
import {AuthModal} from './components/AuthModal';
import Dashboard from './pages/Dashboard';import MarketsHome from './pages/home';import MarketPage from './pages/market';
import {Practice,CopyTrade,Wallet,Portfolio,MyCopies} from './pages/trade';
import {RadarPage,Analytics,Weather,Risk,DegenElon,Leaderboard,Rewards} from './pages/research';
import {Settings,Methodology} from './pages/account';
// Routes are plain hash tokens (#markets, #portfolio, #market-m1) so links work anywhere, including static hosts.
const read=()=>{try{const h=location.hash.slice(1);if(h.startsWith('market-'))return h;if(h==='transactions')return'portfolio';return ROUTES.some(r=>r.id===h)?h:'markets'}catch{return'markets'}};
function Shell(){
 const{msg}=useApp(),[view,setView]=useState(read),[prof,setProf]=useState(false),[q,setQ]=useState(''),[banner,setBanner]=useState(()=>{try{return localStorage.getItem('lowcell.banner')!=='0'}catch{return true}});
 const[collapsed,setCollapsed]=useState(()=>{try{return localStorage.getItem('lowcell.sidebar')==='1'}catch{return false}});
 const toggleSidebar=()=>{setCollapsed(c=>{try{localStorage.setItem('lowcell.sidebar',c?'0':'1')}catch{};return !c})};
 const closeBanner=()=>{setBanner(false);try{localStorage.setItem('lowcell.banner','0')}catch{}};
 const go=(r:string)=>{setView(r);if(r!=='markets')setQ('');try{location.hash=r}catch{};scrollTo({top:0})};
 const open=(id:string)=>go('market-'+id);
 useEffect(()=>{const h=()=>{setView(read());setProf(false)};addEventListener('hashchange',h);const k=(e:KeyboardEvent)=>e.key==='Escape'&&setProf(false);addEventListener('keydown',k);return()=>{removeEventListener('hashchange',h);removeEventListener('keydown',k)}},[]);
 const page:Record<string,JSX.Element>={markets:<MarketsHome open={open} q={q} setQ={setQ} go={go}/>,dash:<Dashboard trade={open} go={go}/>,practice:<Practice/>,copy:<CopyTrade go={go}/>,wallet:<Wallet/>,portfolio:<Portfolio go={go}/>,'my-copies':<MyCopies go={go}/>,strategy:<RadarPage/>,accuracy:<Analytics/>,weather:<Weather/>,risk:<Risk/>,'degen-elon':<DegenElon buy={open}/>,leaderboard:<Leaderboard/>,rewards:<Rewards go={go}/>,methodology:<Methodology go={go}/>,account:<Settings go={go}/>};
 const nav=view.startsWith('market-')?'markets':view;
 return <div className="min-h-screen"><button className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white" onClick={()=>document.getElementById('main')?.focus()}>Skip to content</button>
  <div className="flex"><Sidebar view={nav} go={go} collapsed={collapsed} toggle={toggleSidebar}/>
   <div className="min-w-0 flex-1"><TopBar view={nav} go={go} onProfile={()=>setProf(true)} q={q} setQ={setQ}/>
    <main id="main" tabIndex={-1} key={view} className="rise mx-auto w-full max-w-[1320px] space-y-6 px-4 pb-32 pt-4 outline-none lg:px-8 lg:pb-12 lg:pt-6">{banner&&<PracticeBanner go={go} onClose={closeBanner}/>}{view.startsWith('market-')?<MarketPage id={view.slice(7)} go={go}/>:page[view]}<Footer go={go}/></main></div></div>
  <BottomNav view={nav} go={go}/><ProfileSheet open={prof} close={()=>setProf(false)} go={go}/><AuthModal/><Toast msg={msg}/></div>}
export default function App(){return <AppProvider><Shell/></AppProvider>}
