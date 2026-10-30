// ── INTEGRATION SEAMS ─────────────────────────────────────────────
// The UI only talks to these interfaces. To go live: implement them with Polymarket (CLOB) and
// Privy, then swap the exports below. Nothing else in the app needs to change.
export interface OrderRequest{marketId:string;outcome:string;side?:'Yes'|'No';action:'Buy'|'Sell';type:'market'|'limit';usd:number;price:number}
export interface Fill{id:string;shares:number;price:number;practice:boolean}
export interface TradingProvider{mode:'practice'|'live';placeOrder(o:OrderRequest):Promise<Fill>}
export interface WalletProvider{deposit(usd:number):Promise<void>;withdraw(usd:number):Promise<void>}
// Privy-style: email -> one-time code -> embedded wallet is created and assigned automatically.
export interface AuthProvider{
 sendCode(email:string):Promise<void>;
 verifyCode(email:string,code:string):Promise<{user:{name:string;email:string};address:string}>;
 linkX(name:string):Promise<{handle:string}>;
 logout():Promise<void>}
const wait=(ms=500)=>new Promise(r=>setTimeout(r,ms));
const fakeAddress=(seed:string)=>{let h=2166136261;let o='';for(let i=0;i<40;i++){h=Math.imul(h^(seed.charCodeAt(i%seed.length)+i),16777619)>>>0;o+=(h&15).toString(16)}return'0x'+o};
export const short=(a:string)=>a.slice(0,6)+'…'+a.slice(-4);
export const trading:TradingProvider={mode:'practice',async placeOrder(o){await wait(350);/* TODO(polymarket): sign + post order to the CLOB */return{id:Math.random().toString(36).slice(2),shares:o.usd/o.price,price:o.price,practice:true}}};
export const wallet:WalletProvider={async deposit(){await wait(500)},async withdraw(){await wait(500)}};
export const auth:AuthProvider={
 async sendCode(){await wait(700);/* TODO(privy): useLoginWithEmail().sendCode */},
 async verifyCode(email,code){await wait(900);/* TODO(privy): loginWithCode, embedded wallet created on first login */
  if(!/^\d{6}$/.test(code))throw new Error('Invalid code');
  return{user:{name:email.split('@')[0],email},address:fakeAddress(email.toLowerCase())}},
 async linkX(name){await wait(900);/* TODO(privy): useLinkAccount().linkTwitter */return{handle:'@'+name}},
 async logout(){await wait(100)}};
