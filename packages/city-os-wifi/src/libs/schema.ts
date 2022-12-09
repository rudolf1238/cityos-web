export enum SortOrder {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}

export enum AreaSortField {
  ID = 'ID',
  NAME = 'NAME',
  SERVICESTARTDATE = 'SERVICESTARTDATE',
  SERVICEENDDATE = 'SERVICEENDDATE',
}
export interface AreaFilter {
  keyword?: string;
  sortField?: AreaSortField;
  sortOrder?: SortOrder;
}

export interface IArea {
  id: string;
  name: string;
  serviceStartDate: string;
  serviceEndDate?: string;
}
export interface ICompany {
  id: string;
  companyId?: string | null;
  name: string;
  logo?: string;
  line?: string;
  url?: string;

  ssid: string;
  serviceIntroduction: string;
  serviceIntroductionEn: string;
  accessTime: number;
  dailyAccess: number;
  accessLimit: number;
  idleTimeout: number;
  terms: string;
  termsEn: string;
  privacyTerms: string;
  privacyTermsEn: string;
  downloadSpeed: number;
  uploadSpeed: number;
  passShowTime: number;
}

export interface WifiFilter {
  keyword?: string;
  sortField?: WifiSortField;
  sortOrder?: SortOrder;
}

export enum WifiSortField {
  ID = 'ID',
  COMPANYID = 'COMPANYID',
  NAME = 'NAME',
}

export interface AdFilter {
  keyword?: string;
  sortField?: AdSortField;
  sortOrder?: SortOrder;
}

export enum AdSortField {
  ID = 'ID',
  NAME = 'NAME',
}

export interface IAd {
  id: string;
  name: string;
  company_name: string;
  company_vat: string;
  type: number;
  pricing_type: number;
  image: string;
  youtube_video_id: string;
  min_view_time: number;
  weight: number;
  click_qty: number;
  click_count: number;
  cost_per_click: number;
  placement_count: number;
  costs: number;
  daily_click_qty: number;
  link_type: number;
  url: string | null;
  copywriting: string;
  comment: string;
  start_datetime: string;
  end_datetime: string;
  start_timeslot: string;
  end_timeslot: string;
  area_list: number[];
}

export interface EditWifiAdInput {
  id: string;
  editWifiAdInput: AddWifiAdInput;
}

export interface AddWifiAdInput {
  name: string;
  company_name: string;
  company_vat: string;
  type: number;
  pricing_type: number;
  image: string | null;
  youtube_video_id: string;
  min_view_time: number;
  weight: number;
  click_qty: number;
  click_count: number;
  cost_per_click: GLfloat;
  placement_count: number;
  costs: number;
  daily_click_qty: number;
  link_type: number;
  url: string | null;
  copywriting: string;
  comment: string;
  start_datetime: string;
  end_datetime: string;
  start_timeslot: string;
  end_timeslot: string;
  area_list: number[];
}
