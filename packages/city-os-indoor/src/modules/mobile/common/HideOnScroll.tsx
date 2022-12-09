import React, { FunctionComponent, PropsWithChildren, memo, useEffect } from 'react';

import Slide, { SlideProps } from '@material-ui/core/Slide';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';

interface HideOnScrollProps {
  window?: () => Window;
  children: React.ReactElement;
  direction?: SlideProps['direction'];
  onTrigger?: (trigger: boolean) => void;
}

const HideOnScroll: FunctionComponent<HideOnScrollProps> = (
  props: PropsWithChildren<HideOnScrollProps>,
) => {
  const { children, window, direction = 'down', onTrigger = () => {} } = props;
  const trigger = useScrollTrigger({ target: window ? window() : undefined });

  useEffect(() => {
    void onTrigger(trigger);
  }, [onTrigger, trigger]);

  return (
    <Slide appear={false} direction={direction} in={!trigger}>
      {children}
    </Slide>
  );
};

export default memo(HideOnScroll);
