// Contract the UI depends on. Swap the adapter, keep the components.
export type Category='elon'|'weather'|'negrisk'|'crypto'|'esports';
export type Kind='updown'|'overunder'|'versus'|'bracket'|'multi';
export interface Outcome{label:string;market:number;lowcell:number}
export interface Market{id:string;title:string;range:string;subject:string;category:Category;endsAt:number;vol24h:number;verified:number;perHour:number;outcomes:Outcome[];history:{lowcell:number;market:number}[];
 // Catalogue fields. In production map from the Polymarket API (image, liquidity, oneDayPriceChange, createdAt…).
 image?:string;liq?:number;move24?:number|null;created?:number;kind?:Kind;modeled?:boolean;priced?:boolean}
export interface HourBucket{hour:string;count:number}
export interface RadarItem{id:string;label:string;gap:number;note:string}
export interface DataSource{listMarkets():Promise<Market[]>;getActivity(id:string):Promise<HourBucket[]>;getRadar():Promise<RadarItem[]>}
export interface Trader{id:string;handle:string;pnl30:number;win:number;avg:number;followers:number;style:string;curve:number[]}
export interface Station{id:string;city:string;code:string;unit:string;obs:number;labels:string[];ens:number[];mkt:number[];hours:number}
export interface Calib{p:number;obs:number}
export interface Leader{name:string;ret:number;trades:number;win:number}
export interface ExtraSource{traders():Promise<Trader[]>;stations():Promise<Station[]>;accuracy():Promise<{brier:number;hit:number;n:number;calib:Calib[];byCat:{cat:string;hit:number}[]}>;leaders():Promise<Leader[]>}
