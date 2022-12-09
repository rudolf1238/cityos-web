import { ReactNode } from 'react';

export enum ErrorType {
  NO_CAMERA_ID = 'NO_CAMERA_ID',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export type GetVideoPlayerHeaderFunc = (classes: { showOnHover: string }) => ReactNode;
