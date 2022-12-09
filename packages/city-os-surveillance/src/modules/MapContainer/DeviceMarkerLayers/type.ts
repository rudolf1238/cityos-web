import type { IDevice } from 'city-os-common/libs/schema';

export enum MarkerLayer {
  NOT_SELECTED = 'NOT_SELECTED',
  NOT_ON_PAGE = 'NOT_ON_PAGE',
  ON_PAGE = 'ON_PAGE',
}

export enum PopupLayer {
  PREVIEW_VIDEO = 'PREVIEW_VIDEO',
  PREVIEW_ICON = 'PREVIEW_ICON',
}

export type DeviceOnLayers = Record<
  MarkerLayer,
  {
    device: IDevice;
    screenIndex: number;
  }[]
>;
