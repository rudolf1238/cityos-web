import { makeStyles } from '@material-ui/core/styles';

import React, { FunctionComponent, memo } from 'react';
import clsx from 'clsx';

import Zoom from '@material-ui/core/Zoom';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';

import GoUpIcon from 'city-os-common/assets/icon/go-up.svg';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import useIndoorTranslation from '../../../hooks/useIndoorTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    right: theme.spacing(2),
    bottom: theme.spacing(3),
  },

  haveFab: {
    bottom: theme.spacing(10),
  },

  sizeIcon: {
    width: theme.spacing(2.25),
  },
}));

interface ScrollTopProps {
  window?: () => Window;
  haveFab?: boolean;
  size?: 'small' | 'medium';
  threshold?: number;
}

const ScrollTop: FunctionComponent<ScrollTopProps> = (props: ScrollTopProps) => {
  const { window, haveFab, size, threshold = 100 } = props;
  const classes = useStyles();
  const { t: tIndoor } = useIndoorTranslation();

  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold,
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const anchor = ((event.target as HTMLButtonElement).ownerDocument || document).querySelector(
      '#back-to-top-anchor',
    );

    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Zoom in={trigger}>
      <ThemeIconButton
        aria-label={tIndoor('common:Scroll to top')}
        disableRipple
        color="primary"
        className={clsx(classes.root, { [classes.haveFab]: haveFab })}
        onClick={handleClick}
        size={size || 'medium'}
      >
        <GoUpIcon className={clsx({ [classes.sizeIcon]: size === 'small' })} />
      </ThemeIconButton>
    </Zoom>
  );
};

export default memo(ScrollTop);
