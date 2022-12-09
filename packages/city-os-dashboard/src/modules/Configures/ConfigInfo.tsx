import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import Typography from '@material-ui/core/Typography';

import { GadgetSize } from '../../libs/type';
import useGetGadgetBasicInfo from '../../hooks/useGetGadgetBasicInfo';
import type { GadgetSizeType, GadgetType } from '../../libs/type';

import GadgetImage from '../GadgetImage';

const useStyles = makeStyles((theme) => ({
  gadgetCard: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    border: `1px solid ${theme.palette.gadget.frame}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.container,
    height: 215,
  },

  imgWrapper: {
    padding: theme.spacing(1, 8),

    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(1, 15),
    },
  },

  description: {
    margin: theme.spacing(3, 0),

    [theme.breakpoints.up('xs')]: {
      margin: theme.spacing(2, 0, 0),
    },
  },
}));

interface ConfigInfoProps<T extends GadgetType> {
  type: T;
  size?: GadgetSizeType<T>;
}

const ConfigInfo = <Type extends GadgetType>({
  type: selectedType,
  size: selectedSize,
}: ConfigInfoProps<Type>): ReturnType<VoidFunctionComponent<ConfigInfoProps<Type>>> => {
  const classes = useStyles();

  const gadget = useGetGadgetBasicInfo(selectedType);

  if (!gadget) return null;

  const { description, size: defaultSize } = gadget;
  const size = selectedSize || defaultSize;

  return (
    <div>
      <div className={classes.gadgetCard}>
        {size === GadgetSize.DEFAULT ? (
          <div className={classes.imgWrapper}>
            <GadgetImage type={selectedType} size={size} />
          </div>
        ) : (
          <GadgetImage type={selectedType} size={size} />
        )}
      </div>
      <Typography variant="body1" className={classes.description}>
        {description}
      </Typography>
    </div>
  );
};

export default memo(ConfigInfo);
