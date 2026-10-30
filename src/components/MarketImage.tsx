import {useState} from 'react';
import type {Market} from '../data/types';
// Shows the market's real picture; falls back to an initial tile if the image fails to load.
export function MarketImage({m,size=56}:{m:Market;size?:number}){
 const[bad,setBad]=useState(false);const st={width:size,height:size};
 return m.image&&!bad?<img src={m.image} alt="" loading="lazy" onError={()=>setBad(true)} style={st} className="shrink-0 rounded-xl bg-raised object-cover ring-1 ring-line"/>
  :<span style={st} className="grid shrink-0 place-items-center rounded-xl bg-accent/10 font-bold text-accent">{m.subject[0]}</span>}
// Plain picture for rows that only store the image URL (positions, orders, closed trades).
export function Thumb({src,name,size=36}:{src?:string;name:string;size?:number}){
 const[bad,setBad]=useState(false);const st={width:size,height:size};
 return src&&!bad?<img src={src} alt="" loading="lazy" onError={()=>setBad(true)} style={st} className="shrink-0 rounded-lg bg-raised object-cover ring-1 ring-line"/>
  :<span style={st} className="grid shrink-0 place-items-center rounded-lg bg-accent/10 text-sm font-bold text-accent">{name[0]}</span>}
