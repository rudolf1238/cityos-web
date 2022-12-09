import type { esignageSizeSet, weatherLayoutSizeSet } from './constants';

export enum ESignageTemplateSize {
  DEFAULT = 'DEFAULT',
  SQUARE = 'SQUARE',
  RECTANGLE = 'RECTANGLE',
}

export enum ESignageTemplateType {
  TYPE_A_1080X1920 = 'TYPE_A_1080X1920',
  TYPE_B_1080X1920 = 'TYPE_B_1080X1920',
  TYPE_C_1080X1920 = 'TYPE_C_1080X1920',
  TYPE_D_1080X1920 = 'TYPE_D_1080X1920',
  TYPE_E_1080X1920 = 'TYPE_E_1080X1920',
  TYPE_F_1080X1920 = 'TYPE_F_1080X1920',
  TYPE_G_1920X1080 = 'TYPE_G_1920X1080',
  TYPE_H_1920X1080 = 'TYPE_H_1920X1080',
  TYPE_I_1920X1080 = 'TYPE_I_1920X1080',
  TYPE_J_1920X1080 = 'TYPE_J_1920X1080',
  TYPE_K_1920X1080 = 'TYPE_K_1920X1080',
  TYPE_L_1920X1080 = 'TYPE_L_1920X1080',
}

export type ESignageTemplateSizeType<T extends ESignageTemplateType> =
  typeof esignageSizeSet[T][number];

export enum WeatherLayoutSize {
  DEFAULT = 'DEFAULT',
  SQUARE = 'SQUARE',
  RECTANGLE = 'RECTANGLE',
}

export enum WeatherLayoutType {
  TYPE_1_640X360 = 'TYPE_1_640X360',
  TYPE_2_640X360 = 'TYPE_2_640X360',
  TYPE_3_640X360 = 'TYPE_3_640X360',
  TYPE_4_640X720 = 'TYPE_4_640X720',
  TYPE_5_1080X1750 = 'TYPE_5_1080X1750',
}

export type WeatherLayoutSizeType<T extends WeatherLayoutType> =
  typeof weatherLayoutSizeSet[T][number];

export enum DateTimePickerType {
  DATETIME_PICKER_INLINE = 'DATETIME_PICKER_INLINE',
  DATETIME_PICKER_DIALOG = 'DATETIME_PICKER_DIALOG',
  DATE_PICKER_INLINE = 'DATE_PICKER_INLINE',
  DATE_PICKER_DIALOG = 'DATE_PICKER_DIALOG',
  TIME_PICKER = 'TIME_PICKER',
}

export enum MultipleSelectType {
  DROPDOWN_LIST_TAG = 'DROPDOWN_LIST_TAG',
  DROPDOWN_CHECKBOX_TAG = 'DROPDOWN_CHECKBOX_TAG',
  DROPDOWN_LIST_CHIP = 'DROPDOWN_LIST_CHIP',
  NATIVE = 'NATIVE',
}

export interface ImageDataSource {
  id: string;
  title: string;
  key: string | '';
  description: string;
  tag?: string | undefined;
}

export interface ListItemDataSource {
  value: string;
  text: string;
  tag?: string | undefined;
}

export interface PlayerListItemDataSource extends ListItemDataSource {
  id: string;
  deviceId: string;
  desc: string;
  serviceStartDate: Date;
  serviceEndDate: Date;
}

export interface RWDCtrl {
  sm: number;
  md: number;
  lg: number;
  width: number;
  height: number;
}

export const ItemTypes = {
  CARD: 'card',
};

export interface DnDListDataSource {
  id: string;
  text: string;
  tag?: string | undefined;
}

export interface DnDListMediaDataSource extends DnDListDataSource {
  content?: Blob | undefined;
}

export interface ContentCommon {
  contentTypeId: string;
  contentName: string;
  tag?: string | undefined;
  x?: number | undefined;
  y?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
}

export interface WeatherContentDetail {
  weatherStyleId: string;
  temperatureUnit: string;
  windSpeedUnit: string;
  languageId: string;
  backgroundColor: string;
  durations: number;
  citys: string[];
}

export interface WeatherContent {
  contentCommon: ContentCommon;
  contentDetail: WeatherContentDetail;
}

export interface MediaInfo {
  mediaId: string;
  imagePlayDurations: number;
  name?: string | undefined;
  content?: Blob | undefined;
  size?: number;
}

export interface MediaContentDetail {
  media: MediaInfo[];
}

export interface MediaContent {
  contentCommon: ContentCommon;
  contentDetail: MediaContentDetail;
}

export type IPCamInfo = {
  id: string;
  camName: string;
  rtspUrl: string;
  durations: number;
};

export interface IPCamContentDetail {
  ipcam: IPCamInfo[];
}

export interface IPCamContent {
  contentCommon: ContentCommon;
  contentDetail: IPCamContentDetail;
}

export type WebPageInfo = {
  id: string;
  webUrl: string;
  playTime: number;
};

export interface WebPageContentDetail {
  webpage: WebPageInfo[];
}

export interface WebPageContent {
  contentCommon: ContentCommon;
  contentDetail: WebPageContentDetail;
}

export interface TemplateBasic {
  groupId: string;
  templateName: string;
  templateType: string;
  description: string;
  backgroundColor: string;
}

export interface TemplateContent {
  contentId?: string | undefined;
  content: WeatherContent | MediaContent | WebPageContent | IPCamContent;
  rectId?: string | undefined;
}

export interface TemplateInput {
  templateBasicInfo: TemplateBasic;
  templateContents: TemplateContent[];
}
export interface AddTemplate {
  templateInput: TemplateInput;
}

export interface TemplateSchedule {
  templateId: string;
  scheduleId: string;
  scheduleName: string;
  playStartDate: Date | null;
  playEndDate: Date | null;
  playStartTime: string;
  playEndTime: string;
  loopMode: string;
  dailyFrequency: number | null;
  weeklyFrequency: string[] | null;
  monthlyFrequency_Month: string[] | null;
  monthlyFrequency_Day: string[] | null;
  audioSetting: number;
  downloadDirectly: boolean;
  scheduledDownloadTime: Date | null;
  players: string[] | null;
  publishedTimeZone: string | null;
}
