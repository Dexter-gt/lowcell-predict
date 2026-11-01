import {IMG} from './images';
// Real landmark photographs, hot-linked from Wikimedia Commons (free licenses, attribution shown in the UI).
// If one fails to load, the UI falls back to the bundled illustration (or an initial tile).
// For production reliability, download these into /public/photos and point `file` at your own host.
export const PHOTO={
 nyc:{file:'New York City (New York, USA), Brooklyn Bridge -- 2012 -- 6630.jpg',landmark:'Brooklyn Bridge',credit:'Dietmar Rabich / Wikimedia Commons / CC BY-SA 4.0',focus:'50% 50%',fallback:IMG.nyc},
 lon:{file:'London, Elizabeth Tower -- 2016 -- 4624.jpg',landmark:'Elizabeth Tower (Big Ben)',credit:'Dietmar Rabich / Wikimedia Commons / CC BY-SA 4.0',focus:'50% 16%',fallback:IMG.lon},
 sel:{file:'Seoul Gyeongbok-gung-3.jpg',landmark:'Gyeongbokgung Palace',credit:'Wikimedia Commons / CC BY-SA 3.0',focus:'50% 50%',fallback:undefined as string|undefined}};
export type PhotoKey=keyof typeof PHOTO;
const slug=(f:string)=>encodeURI(f.replace(/ /g,'_'));
export const photo=(k:PhotoKey,w=250)=>`https://commons.wikimedia.org/wiki/Special:FilePath/${slug(PHOTO[k].file)}?width=${w}`;
const find=(src?:string)=>src?Object.values(PHOTO).find(p=>src.includes(slug(p.file))):undefined;
export const fallbackFor=(src?:string)=>find(src)?.fallback;
export const focusFor=(src?:string)=>find(src)?.focus;
