import { useTheme } from '@material-ui/core/styles';
import React, { ComponentProps, VoidFunctionComponent } from 'react';

import useMediaQuery from '@material-ui/core/useMediaQuery';

import BuildingCardDesktop from './Desktop';
import BuildingCardMobile from './Mobile';

const BuildingCard: VoidFunctionComponent<ComponentProps<typeof BuildingCardMobile>> = (
  props: ComponentProps<typeof BuildingCardMobile>,
) => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  return smUp ? <BuildingCardDesktop {...props} /> : <BuildingCardMobile {...props} />;
};

export default BuildingCard;
