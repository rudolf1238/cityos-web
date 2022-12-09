import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import useMediaQuery from '@material-ui/core/useMediaQuery';

import MainLayout from 'city-os-common/modules/MainLayout';
import MobileMainLayout from './MobileMainLayout';

interface ResponsiveMainLayoutProps {
  children: React.ReactElement;
}

const ResponsiveMainLayout: VoidFunctionComponent<ResponsiveMainLayoutProps> = (
  props: ResponsiveMainLayoutProps,
) => {
  const { children } = props;
  const theme = useTheme();

  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  return smUp ? (
    <MainLayout>{children}</MainLayout>
  ) : (
    <MobileMainLayout>{children}</MobileMainLayout>
  );
};

export default memo(ResponsiveMainLayout);
