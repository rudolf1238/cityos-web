import { makeStyles, useTheme } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo } from 'react';

import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Typography from '@material-ui/core/Typography';

import { IDevice } from 'city-os-common/libs/schema';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: theme.spacing(6),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(3.5),
    justifyContent: 'flex-start',
    color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  },
}));

export interface DeviceCardProps {
  label: IDevice['name'];
  type: IDevice['type'];
  deviceId: IDevice['deviceId'];
  classes?: {
    root?: string;
  };
  onClick: (deviceId: IDevice['deviceId']) => void;
}

const DeviceCard: VoidFunctionComponent<DeviceCardProps> = (props: DeviceCardProps) => {
  const { label, type, deviceId, classes: customClasses, onClick: handleCardClick } = props;
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Button
      className={clsx(classes?.root, customClasses?.root)}
      onClick={() => {
        void handleCardClick(deviceId);
      }}
    >
      <div
        style={{
          width: theme.spacing(4),
          height: theme.spacing(4),
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.palette.secondary.main,
          flexShrink: 0,
        }}
      >
        <DeviceIcon
          type={type}
          style={{
            color: '#fff',
            width: 18,
            height: 18,
          }}
        />
      </div>
      <Typography
        variant="subtitle2"
        noWrap
        style={{
          marginLeft: theme.spacing(1.5),
        }}
      >
        {label}
      </Typography>
      <ChevronRightIcon
        style={{
          marginLeft: 'auto',
          fontSize: 26,
        }}
      />
    </Button>
  );
};

export default memo(DeviceCard);
