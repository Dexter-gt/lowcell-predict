import {Compass,BarChart3,FlaskConical,Copy,Wallet,Radio,LineChart as Chart,Briefcase,Users,Receipt,Settings,Trophy,CloudSun,ShieldAlert,Gift,Flame,BookOpen} from 'lucide-react';
export const ROUTES=[
 {id:'markets',label:'Market Floor',icon:BarChart3,group:'Trade'},{id:'dash',label:'Dashboard',icon:Compass,group:'Trade'},{id:'practice',label:'Practice',icon:FlaskConical,group:'Trade'},{id:'copy',label:'Copy Trade',icon:Copy,group:'Trade'},
 {id:'portfolio',label:'Portfolio',icon:Briefcase,group:'Account'},{id:'my-copies',label:'My Copies',icon:Users,group:'Account'},{id:'wallet',label:'Wallet',icon:Wallet,group:'Account'},
 {id:'strategy',label:'Multi-Market Radar',icon:Radio,group:'Research'},{id:'accuracy',label:'Analytics',icon:Chart,group:'Research'},{id:'weather',label:'Weather',icon:CloudSun,group:'Research'},{id:'risk',label:'Risk',icon:ShieldAlert,group:'Research'},{id:'degen-elon',label:'Degen Elon',icon:Flame,group:'Research'},
 {id:'leaderboard',label:'Leaderboard',icon:Trophy,group:'Community'},{id:'rewards',label:'Rewards',icon:Gift,group:'Community'},{id:'methodology',label:'How it works',icon:BookOpen,group:'Community'},{id:'account',label:'Settings',icon:Settings,group:'Community'}] as const;
export const GROUPS=['Trade','Account','Research','Community'];
