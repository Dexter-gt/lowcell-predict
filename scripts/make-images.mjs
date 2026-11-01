// Dev-only: generates src/assets/images.ts (market pictures as data URIs).
// Needs: npm i --no-save simple-icons cryptocurrency-icons   (run: node scripts/make-images.mjs)
// In production, markets get their picture from the Polymarket API `image` URL instead.
import fs from 'fs';import * as si from 'simple-icons';
const enc=s=>'data:image/svg+xml,'+encodeURIComponent(s.replace(/\s+/g,' ').trim());
const svg=(inner,defs='')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>${defs}<clipPath id="c"><rect width="64" height="64" rx="14"/></clipPath></defs><g clip-path="url(#c)">${inner}</g></svg>`;
const tile=(bg,inner)=>svg(`<rect width="64" height="64" fill="${bg}"/>${inner}`);
const glyph=(i,fill='#fff',s=1.5)=>`<g transform="translate(${32-12*s} ${32-12*s}) scale(${s})"><path d="${i.path}" fill="${fill}"/></g>`;
const color=n=>fs.readFileSync(`node_modules/cryptocurrency-icons/svg/color/${n}.svg`,'utf8').replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
const coin=(bg,n)=>tile(bg,`<svg x="10" y="10" width="44" height="44" viewBox="0 0 32 32">${color(n)}</svg>`);
const grad=(id,a,b,v=false)=>`<linearGradient id="${id}" x1="0" y1="0" x2="${v?0:1}" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const sky=(a,b)=>[`<rect width="64" height="64" fill="url(#s)"/>`,grad('s',a,b,true)];
const I={};
I.btc=enc(tile('#F7931A',glyph(si.siBitcoin)));
I.eth=enc(tile('#627EEA',glyph(si.siEthereum)));
I.sol=enc(coin('#0d0d12','sol'));I.doge=enc(coin('#17140c','doge'));I.zec=enc(coin('#17140c','zec'));
I.xrp=enc(tile('#0B84F3',glyph(si.siXrp,'#fff',1.6)));
I.hype=enc(tile('#0B2A27',`<path d="M6 32c0-7 4.5-11 11-11 5 0 7.5 3 9.5 5.5h11C39.500 24 42 21 47 21c6.500 0 11 4 11 11s-4.500 11-11 11c-5 0-7.500-3-9.500-5.500h-11C24.500 40 22 43 17 43 10.500 43 6 39 6 32z" fill="#97FCE4"/><circle cx="17" cy="32" r="4.500" fill="#0B2A27"/><circle cx="47" cy="32" r="4.500" fill="#0B2A27"/>`));
I.gold=enc(tile('#D9A406',`<path d="M10 44l5-10h16l5 10z" fill="#FFF3B0"/><path d="M30 44l5-10h16l5 10z" fill="#FFE27A"/><path d="M20 34l5-10h16l5 10z" fill="#FFFBE0"/>`));
I.valorant=enc(tile('#0F1923',glyph(si.siValorant,'#FA4454',1.7)));
I.lol=enc(tile('#FFFFFF',glyph(si.siLeagueoflegends,'#C28F2C',1.7)));
I.dota=enc(tile('#15100F',glyph(si.siDota2,'#E2402B',1.7)));
I.x=enc(tile('#000000',glyph(si.siX,'#fff',1.35)));
const [r1,d1]=sky('#1E3A8A','#F59E0B');
I.nyc=enc(svg(`${r1}<circle cx="46" cy="38" r="9" fill="#FDE68A"/><g fill="#0b1220"><rect x="4" y="34" width="9" height="30"/><rect x="14" y="26" width="8" height="38"/><rect x="23" y="38" width="10" height="26"/><rect x="34" y="22" width="7" height="42"/><path d="M34 22l3.500-9 3.500 9z"/><rect x="42" y="36" width="9" height="28"/><rect x="52" y="30" width="10" height="34"/></g><g fill="#FDE68A" opacity=".8"><rect x="16" y="30" width="2" height="2"/><rect x="36" y="28" width="2" height="2"/><rect x="54" y="36" width="2" height="2"/></g>`,d1));
const [r2,d2]=sky('#64748B','#CBD5E1');
I.lon=enc(svg(`${r2}<g fill="#fff" opacity=".9"><circle cx="16" cy="18" r="7"/><circle cx="24" cy="20" r="6"/><circle cx="46" cy="14" r="6"/><circle cx="53" cy="17" r="5"/></g><g fill="#334155"><rect x="26" y="26" width="10" height="38"/><path d="M26 26l5-12 5 12z"/><rect x="4" y="46" width="18" height="18"/><rect x="40" y="42" width="20" height="22"/></g><circle cx="31" cy="34" r="3" fill="#E2E8F0"/>`,d2));
const [r3,d3]=sky('#0EA5E9','#FDE68A');
I.lag=enc(svg(`${r3}<circle cx="44" cy="22" r="11" fill="#FEF08A"/><g fill="#065F46"><path d="M16 64V34h3v30z"/><path d="M17 34c-8-1-12 3-14 7 5-3 9-4 14-3zM17 34c8-1 12 3 14 7-5-3-9-4-14-3zM17 34c-2-7 1-11 5-13-1 5-3 9-5 13zM17 34c2-7-1-11-5-13 1 5 3 9 5 13z"/></g><g fill="#0F172A" opacity=".85"><rect x="34" y="42" width="9" height="22"/><rect x="44" y="36" width="8" height="28"/><rect x="53" y="44" width="9" height="20"/></g>`,d3));
I.fed=enc(svg(`<rect width="64" height="64" fill="url(#g)"/><path d="M32 12L12 24h40z" fill="#fff"/><g fill="#fff"><rect x="15" y="27" width="5" height="19"/><rect x="24" y="27" width="5" height="19"/><rect x="35" y="27" width="5" height="19"/><rect x="44" y="27" width="5" height="19"/><rect x="10" y="48" width="44" height="4"/><rect x="7" y="54" width="50" height="4"/></g>`,grad('g','#0F5132','#2BA36B',true)));
I.ai=enc(svg(`<rect width="64" height="64" fill="url(#g)"/><g stroke="#fff" stroke-width="2.500" stroke-linecap="round" fill="none"><rect x="18" y="18" width="28" height="28" rx="6"/><path d="M26 10v8M38 10v8M26 46v8M38 46v8M10 26h8M10 38h8M46 26h8M46 38h8"/></g><path d="M32 24l2.200 5.800L40 32l-5.800 2.200L32 40l-2.200-5.800L24 32l5.800-2.200z" fill="#fff"/>`,grad('g','#7047FF','#137FFA')));
I.rs=enc(svg(`<rect width="64" height="22" fill="#C6363C"/><rect y="21" width="64" height="22" fill="#0C4076"/><rect y="42" width="64" height="22" fill="#fff"/>`));
I.elon='data:image/jpeg;base64,'+fs.readFileSync('scripts/elon-dp.jpg').toString('base64');
fs.writeFileSync('src/assets/images.ts',`// Generated by scripts/make-images.mjs. Market pictures bundled as data URIs.\nexport const IMG:Record<string,string>=${JSON.stringify(I)};\n`);
console.log(Object.keys(I).join(' '),(fs.statSync('src/assets/images.ts').size/1024).toFixed(1)+'KB');
