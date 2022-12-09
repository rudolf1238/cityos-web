import { makeStyles } from '@material-ui/core/styles';

import React, { FunctionComponent, PropsWithChildren, memo, useCallback } from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';

import useIndoorTranslation from '../../../hooks/useIndoorTranslation';
import useRedirect from '../hooks/useRedirect';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  backLink: {
    marginLeft: theme.spacing(-2.5),
    fontSize: theme.typography.body1.fontSize,
  },
}));

interface RedirectButtonProps {
  link?: {
    label: string;
    pathname: string;
    query?: Record<string, string>;
  };
  classes?: {
    root?: string;
    backLink?: string;
  };
  children?: React.ReactNode;
}

const RedirectButton: FunctionComponent<RedirectButtonProps> = (
  props: PropsWithChildren<RedirectButtonProps>,
) => {
  const { link, classes: customClasses, children } = props;
  const classes = useStyles();
  const { t: tIndoor } = useIndoorTranslation('common');
  const { to, back } = useRedirect();

  const handleClick = useCallback(() => {
    if (link) {
      void to(link?.pathname || '/', link?.query);
    } else {
      void back();
    }
  }, [back, link, to]);

  return (
    <div className={clsx(classes.root, customClasses?.root)}>
      <Button
        disableRipple
        className={clsx(classes.backLink, customClasses?.backLink)}
        onClick={() => {
          void handleClick();
        }}
      >
        {'< '}
        {link ? link.label : tIndoor('common:Back to previous page')}
      </Button>
      {children}
    </div>
  );
};

export default memo(RedirectButton);
