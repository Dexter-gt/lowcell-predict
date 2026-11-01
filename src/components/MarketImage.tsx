import {useEffect,useState} from 'react';
import type {Market} from '../data/types';
import {fallbackFor,focusFor} from '../assets/photos';
// Picture with graceful fallback: real photo -> bundled illustration -> initial tile.
function useSrc(image?:string){
 const[src,setSrc]=useState(image),[bad,setBad]=useState(false);
 useEffect(()=>{setSrc(image);setBad(false)},[image]);
 const onError=()=>{const f=fallbackFor(src);if(f&&f!==src)setSrc(f);else setBad(true)};
 return{src:bad?undefined:src,onError,pos:focusFor(src)};
}
export function MarketImage({m,size=56}:{m:Market;size?:number}){
 const{src,onError,pos}=useSrc(m.image),st={width:size,height:size};
 return src?<img src={src} alt="" loading="lazy" onError={onError} style={{...st,objectPosition:pos}} className="shrink-0 rounded-xl bg-raised object-cover ring-1 ring-line"/>
  :<span style={st} className="grid shrink-0 place-items-center rounded-xl bg-accent/10 font-bold text-accent">{m.subject[0]}</span>}
// Plain picture for rows that only store the image URL (positions, orders, closed trades).
export function Thumb({src:image,name,size=36}:{src?:string;name:string;size?:number}){
 const{src,onError,pos}=useSrc(image),st={width:size,height:size};
 return src?<img src={src} alt="" loading="lazy" onError={onError} style={{...st,objectPosition:pos}} className="shrink-0 rounded-lg bg-raised object-cover ring-1 ring-line"/>
  :<span style={st} className="grid shrink-0 place-items-center rounded-lg bg-accent/10 text-sm font-bold text-accent">{name[0]}</span>}
