import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';

import React, { VoidFunctionComponent, memo, useCallback, useEffect, useState } from 'react';

import clsx from 'clsx';

import Slider from '@material-ui/core/Slider';
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
    height: theme.spacing(14),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing(0, 1.75, 0, 1.75),
  },

  sliderDisabled: {
    '& > .Mui-disabled': {
      width: 24,
      height: 24,
      marginLeft: -12,
      marginTop: -8,
      backgroundColor: '#BDBDBD',
      borderColor: theme.palette.background.paper,
    },
  },
}));

export interface LampCardProps {
  label: IDevice['name'];
  type: IDevice['type'];
  deviceId: IDevice['deviceId'];
  classes?: {
    root?: string;
  };
  onClick: (deviceId: IDevice['deviceId']) => void;
}

const LampCard: VoidFunctionComponent<LampCardProps> = (props: LampCardProps) => {
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

  const handleSliderCommitted = useCallback(
    async (newValue: number) => {
      setBrightnessPercent(newValue);
      await updateSensor({
        variables: {
          deviceId,
          sensorId: 'setBrightnessPercent',
          value: newValue,
        },
      });
    },
    [deviceId, updateSensor],
  );

  return (
    <div className={clsx(classes?.root, customClasses?.root)}>
      <div
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing(1.5),
          // marginTop: theme.spacing(1.75),
        }}
      >
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
        <Typography variant="subtitle2" noWrap style={{ maxWidth: '100%' }}>
          {label}
        </Typography>
      </div>
      <div
        style={{
          width: '100%',
          paddingLeft: theme.spacing(1.5),
          paddingRight: theme.spacing(1.5),
          height: theme.spacing(4),
        }}
      >
        <Slider
          // add key to solve "Material-UI: A component is changing the default value state of an uncontrolled Slider after being initialized. To suppress this warning opt to use a controlled Slider."
          key={`slider-${brightnessPercent || ''}`}
          marks={[{ value: 20 }, { value: 40 }, { value: 60 }, { value: 80 }]}
          defaultValue={brightnessPercent || 0}
          valueLabelDisplay="auto"
          disabled={brightnessPercent === null}
          onChangeCommitted={(_, newValue) => {
            if (typeof newValue === 'number') {
              void handleSliderCommitted(newValue);
            }
          }}
          classes={{
            disabled: classes.sliderDisabled,
          }}
        />
      </div>
    </div>
  );
};

export default memo(LampCard);
