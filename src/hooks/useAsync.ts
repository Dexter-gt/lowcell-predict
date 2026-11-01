import {useEffect,useState} from 'react';
export function useAsync<T>(fn:()=>Promise<T>,deps:unknown[]){const[d,setD]=useState<T>();useEffect(()=>{let ok=true;setD(undefined);fn().then(v=>ok&&setD(v));return()=>{ok=false}},deps);return d}
