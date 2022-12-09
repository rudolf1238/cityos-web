import { SelectProps as SelectPropsType } from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import clsx from 'clsx';
import type { TextFieldProps } from '@material-ui/core/TextField';

import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import type { DeviceType, Sensor, SensorType } from 'city-os-common/libs/schema';

import {
  GET_GROUP_ON_SENSOR_ID_SELECTOR,
  GetGroupOnSensorIdSelectorPayload,
  GetGroupOnSensorIdSelectorResponse,
} from '../api/getGroupOnSensorIdSelector';
import useAutomationTranslation from '../hooks/useAutomationTranslation';

const useStyles = makeStyles(() => ({
  paper: {
    display: 'flex',
  },

  list: {
    flex: 1,
    width: 0,
    maxHeight: 280,
  },

  option: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,

    '& > *': {
      width: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
}));

interface SensorIdSelectorProps
  extends Omit<TextFieldProps, 'select' | 'type' | 'children' | 'value' | 'SelectProps'> {
  value?: string;
  deviceType?: DeviceType;
  deviceIds?: string[];
  SelectProps?: Omit<SelectPropsType, 'displayEmpty' | 'onChange' | 'renderValue'>;
  excludeType?: SensorType;
  onSelectChange: (sensor?: Pick<Sensor, 'sensorId' | 'type' | 'unit'>) => void;
}

const SensorIdSelector: VoidFunctionComponent<SensorIdSelectorProps> = ({
  value,
  deviceType,
  deviceIds,
  disabled,
  SelectProps,
  InputLabelProps,
  excludeType,
  onSelectChange,
  ...props
}: SensorIdSelectorProps) => {
  const { t } = useAutomationTranslation('common');
  const classes = useStyles();
  const {
    userProfile: { divisionGroup },
  } = useStore();

  const { data: getGroupData } = useQuery<
    GetGroupOnSensorIdSelectorResponse,
    GetGroupOnSensorIdSelectorPayload
  >(GET_GROUP_ON_SENSOR_ID_SELECTOR, {
    skip: !divisionGroup?.id || !deviceType || disabled,
    variables: {
      groupId: divisionGroup?.id || '',
      deviceIds,
      deviceType,
    },
    fetchPolicy: 'network-only',
  });

  const onSensorIdChange = useCallback(
    (
      event: ChangeEvent<{
        name?: string | undefined;
        value: unknown;
      }>,
    ) => {
      const newValue = event.target.value;
      if (!isString(newValue) || !getGroupData) {
        onSelectChange(undefined);
        return;
      }

      const targetSensor = getGroupData.getGroup.sensors.find(
        ({ sensorId }) => sensorId === newValue,
      );
      onSelectChange(targetSensor);
    },
    [getGroupData, onSelectChange],
  );

  const sensorOptions = useMemo(() => {
    if (!getGroupData) return value ? [{ sensorId: value }] : [];

    const sensors = getGroupData.getGroup.sensors.reduce<{ sensorId: string; name?: string }[]>(
      (acc, { type, sensorId, name }) => {
        if (type !== excludeType) acc.push({ sensorId, name });
        return acc;
      },
      [],
    );
    return sensors;
  }, [getGroupData, excludeType, value]);

  useEffect(() => {
    if (getGroupData && value && !sensorOptions.some(({ sensorId }) => sensorId === value))
      onSelectChange(undefined);
  }, [value, getGroupData, sensorOptions, onSelectChange]);

  return (
    <TextField
      type="text"
      variant="outlined"
      label={t('Sensor ID')}
      value={value || ''}
      select
      fullWidth
      {...props}
      disabled={disabled}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      SelectProps={{
        displayEmpty: true,
        onChange: onSensorIdChange,
        renderValue: () => value || '---',
        IconComponent: ExpandMoreRoundedIcon,
        ...SelectProps,
        MenuProps: {
          getContentAnchorEl: null,
          ...SelectProps?.MenuProps,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
            ...SelectProps?.MenuProps?.anchorOrigin,
          },
          PaperProps: {
            variant: 'outlined',
            ...SelectProps?.MenuProps?.PaperProps,
            className: clsx(classes.paper, SelectProps?.MenuProps?.PaperProps?.className),
          },
          MenuListProps: {
            ...SelectProps?.MenuProps?.MenuListProps,
            className: clsx(classes.list, SelectProps?.MenuProps?.MenuListProps?.className),
          },
        },
      }}
    >
      {sensorOptions.length ? (
        sensorOptions.map(({ sensorId, name }) => (
          <MenuItem key={sensorId} value={sensorId} className={classes.option}>
            <Typography variant="body1">{sensorId}</Typography>
            <Typography variant="caption">{name}</Typography>
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>---</MenuItem>
      )}
    </TextField>
  );
};

export default memo(SensorIdSelector);
