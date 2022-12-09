import type { Theme } from '@material-ui/core/styles';

import { Color } from './type';

export const defaultColors: Record<Color, keyof Theme['palette']['gadget']> = {
  [Color.WHITE]: 'paper',
  [Color.BLACK]: 'dark',
  [Color.SILVER]: 'reserved',
  [Color.RED]: 'alarm',
  [Color.GREEN]: 'default',
  [Color.YELLOW]: 'energyStop',
  [Color.BLUE]: 'available',
  [Color.PURPLE]: 'charging',
};

export const minPerClip = 10;
