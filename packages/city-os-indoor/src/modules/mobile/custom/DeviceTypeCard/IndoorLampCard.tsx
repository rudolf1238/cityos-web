import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';

import React, { VoidFunctionComponent, memo, useCallback, useEffect, useState } from 'react';

import clsx from 'clsx';

import IconButton from '@material-ui/core/IconButton';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import Typography from '@material-ui/core/Typography';

import { IDevice, SensorId, SensorType } from 'city-os-common/libs/schema';
import {
  UPDATE_SENSOR,
  UpdateSensorPayload,
  UpdateSensorResponse,
} from 'city-os-common/api/updateSensor';
import useSubscribeSensors from 'city-os-common/hooks/useSubscribeSensors';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: theme.spacing(12),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing(0, 1.75, 0.5, 1.75),
  },
}));

export interface IndoorLampCardProps {
  label: IDevice['name'];
  type: IDevice['type'];
  deviceId: IDevice['deviceId'];
  classes?: {
    root?: string;
  };
  onClick: (deviceId: IDevice['deviceId']) => void;
}

const IndoorLampCard: VoidFunctionComponent<IndoorLampCardProps> = (props: IndoorLampCardProps) => {
  const { label, type, deviceId, classes: customClasses, onClick: handleCardClick } = props;
  const classes = useStyles();
  const theme = useTheme();

  const [brightnessPercent, setBrightnessPercent] = useState<number | null>(null);

  const sensorValues = useSubscribeSensors(
    [{ deviceId, sensors: [{ sensorId: 'brightnessPercent', type: SensorType.GAUGE }] }],
    new Set([SensorId.LAMP_BRIGHTNESS_PERCENT]),
  );

  useEffect(() => {
    if (sensorValues) {
      const { value } = sensorValues[deviceId].brightnessPercent;
      if (typeof value === 'number') {
        setBrightnessPercent(value);
      } else {
        setBrightnessPercent(null);
      }
    } else {
      setBrightnessPercent(null);
    }
  }, [deviceId, sensorValues]);

  const [updateSensor] = useMutation<UpdateSensorResponse, UpdateSensorPayload>(UPDATE_SENSOR);

  const handleTriggerSwitch = useCallback(async () => {
    const newValue = brightnessPercent ? 0 : 100;
    setBrightnessPercent(newValue);
    await updateSensor({
      variables: {
        deviceId,
        sensorId: 'setBrightnessPercent',
        value: newValue,
      },
    });
  }, [brightnessPercent, deviceId, updateSensor]);

  return (
    <div className={clsx(classes?.root, customClasses?.root)}>
      <div style={{ display: 'flex', width: '100%' }}>
        <ThemeIconButton
          color="default"
          variant="outlined"
          size="small"
          onClick={() => {
            void handleCardClick(deviceId);
          }}
          style={{
            width: theme.spacing(4.5),
            height: theme.spacing(4.5),
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
        </ThemeIconButton>
        <IconButton
          style={{
            marginLeft: 'auto',
            width: theme.spacing(4),
            height: theme.spacing(4),
          }}
          color={brightnessPercent ? 'default' : 'inherit'}
          onClick={() => {
            void handleTriggerSwitch();
          }}
          disabled={brightnessPercent === null}
        >
          <PowerSettingsNewIcon
            style={{
              fontSize: 26,
            }}
          />
        </IconButton>
      </div>
      <Typography variant="subtitle2" noWrap style={{ maxWidth: '100%' }}>
        {label}
      </Typography>
    </div>
  );
};

export default memo(IndoorLampCard);
