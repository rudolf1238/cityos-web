import { makeStyles } from '@material-ui/core/styles';
import React, { CSSProperties, FunctionComponent, PropsWithChildren } from 'react';

import getContrastTextColor from '../../libs/getContrastTextColor';

const useStyles = makeStyles((theme) => ({
  styledText: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    border: '1px solid transparent',
    borderRadius: 30,
    backgroundColor: 'transparent',
    padding: theme.spacing(1.75, 2.75),
    width: '100%',
    maxWidth: theme.spacing(200),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.group.leaf,
  },
}));

interface StyledTextProps {
  backgroundColor?: CSSProperties['backgroundColor'];
  borderColor?: CSSProperties['borderColor'];
}

const StyledText: FunctionComponent<StyledTextProps> = ({
  backgroundColor,
  borderColor,
  children,
}: PropsWithChildren<StyledTextProps>) => {
  const classes = useStyles();

  return (
    <span
      className={classes.styledText}
      style={{
        backgroundColor,
        borderColor,
        color: backgroundColor ? getContrastTextColor(backgroundColor) : borderColor,
      }}
    >
      {children}
    </span>
  );
};

export default StyledText;
