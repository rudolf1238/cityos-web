import { AdSortField, AreaSortField, WifiSortField } from './schema';

export const isWifiSortField = (value: unknown): value is WifiSortField =>
  Object.values<unknown>(WifiSortField).includes(value);

export const isAreaSortField = (value: unknown): value is AreaSortField =>
  Object.values<unknown>(AreaSortField).includes(value);

export const isAdSortField = (value: unknown): value is AdSortField =>
  Object.values<unknown>(AdSortField).includes(value);
