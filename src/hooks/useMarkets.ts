import {useAsync} from './useAsync';import {dataSource} from '../data/adapter';
export const useMarkets=()=>useAsync(()=>dataSource.listMarkets(),[]);
