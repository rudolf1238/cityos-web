import { makeStyles, useTheme } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useMemo } from 'react';

import Grid from '@material-ui/core/Grid';
import Skeleton from '@material-ui/lab/Skeleton';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme) => ({
  root: {
    height: theme.spacing(12),
    [theme.breakpoints.up('sm')]: {
      height: theme.spacing(27.74),
    },
    [theme.breakpoints.up('md')]: {
      height: theme.spacing(31.75),
    },
  },

  skeleton: {
    height: '100%',
    borderRadius: 5,
  },
}));

const BuildingCardSkeleton: VoidFunctionComponent = () => {
  const classes = useStyles();
  const theme = useTheme();

  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const Template = useMemo(
    () => (
      <Grid item lg={4} md={4} sm={6} xs={12} className={classes.root}>
        <Skeleton variant="rect" className={classes.skeleton} />
      </Grid>
    ),
    [classes.root, classes.skeleton],
  );

  return (
    <>
      {Array.from(Array(3).keys()).map(() => (
        <>
          {Template}
          {smUp && Template}
          {mdUp && Template}
        </>
      ))}
    </>
  );
};

export default memo(BuildingCardSkeleton);
