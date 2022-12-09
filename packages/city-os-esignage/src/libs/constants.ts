import {
  ESignageTemplateSize,
  ESignageTemplateType,
  WeatherLayoutSize,
  WeatherLayoutType,
} from './type';

export const esignageTemplateSize: Record<ESignageTemplateSize, { width: number; height: number }> =
  {
    [ESignageTemplateSize.DEFAULT]: { width: 1, height: 1 },
    [ESignageTemplateSize.SQUARE]: { width: 1, height: 2 },
    [ESignageTemplateSize.RECTANGLE]: { width: 2, height: 1 },
  };

export const esignageSizeSet = {
  [ESignageTemplateType.TYPE_A_1080X1920]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_B_1080X1920]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_C_1080X1920]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_D_1080X1920]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_E_1080X1920]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_F_1080X1920]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_G_1920X1080]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_H_1920X1080]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_I_1920X1080]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_J_1920X1080]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_K_1920X1080]: [ESignageTemplateSize.DEFAULT],
  [ESignageTemplateType.TYPE_L_1920X1080]: [ESignageTemplateSize.DEFAULT],
} as const;

export const weatherLayoutSize: Record<WeatherLayoutSize, { width: number; height: number }> = {
  [WeatherLayoutSize.DEFAULT]: { width: 1, height: 1 },
  [WeatherLayoutSize.SQUARE]: { width: 1, height: 2 },
  [WeatherLayoutSize.RECTANGLE]: { width: 2, height: 1 },
};

export const weatherLayoutSizeSet = {
  [WeatherLayoutType.TYPE_1_640X360]: [WeatherLayoutSize.DEFAULT],
  [WeatherLayoutType.TYPE_2_640X360]: [WeatherLayoutSize.DEFAULT],
  [WeatherLayoutType.TYPE_3_640X360]: [WeatherLayoutSize.DEFAULT],
  [WeatherLayoutType.TYPE_4_640X720]: [WeatherLayoutSize.DEFAULT],
  [WeatherLayoutType.TYPE_5_1080X1750]: [WeatherLayoutSize.DEFAULT],
} as const;
