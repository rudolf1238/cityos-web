import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';

import React, { VoidFunctionComponent, memo, useEffect, useState } from 'react';

import { TransitionProps } from '@material-ui/core/transitions';
import AppBar from '@material-ui/core/AppBar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { SensorId, SensorType } from 'city-os-common/libs/schema';
import { subscribeSensorIds } from 'city-os-common/libs/sensorIdsMap';
import useSensorIdTranslation from 'city-os-common/hooks/useSensorIdTranslation';
import useSubscribeSensors, { PartialDevice } from 'city-os-common/hooks/useSubscribeSensors';

import CHTSnapshot from 'city-os-common/modules/CHTSnapshot';

import { Building } from '../../../libs/type';
import {
  GET_DEVICE_ON_INDOOR_MOBILE,
  GetDevicePayload,
  GetDeviceResponse,
} from '../api/getDeviceOnIndoorMobile';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export const isSensorId = (value: unknown): value is SensorId =>
  Object.values<unknown>(SensorId).includes(value);

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    height: '100%',
  },

  header: {},

  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },

  toolbar: {
    paddingLeft: theme.spacing(2),
    gap: theme.spacing(2),
    height: theme.spacing(7),
  },

  body: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'auto',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
  },

  listItem: {
    minHeight: theme.spacing(7),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(0, 2),

    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.evenRow,
    },

    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.oddRow,
    },

    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },

  snapshot: {
    maxWidth: '100%',
    height: theme.spacing(12),
    objectFit: 'contain',
  },
}));

interface DeviceDetailDialogProps {
  open: boolean;
  deviceId: Building['deviceId'];
  onClose: () => void;
}

const DeviceDetailDialog: VoidFunctionComponent<DeviceDetailDialogProps> = (
  props: DeviceDetailDialogProps,
) => {
  const { open, deviceId, onClose: handleClose } = props;
  const classes = useStyles();
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { tSensorId } = useSensorIdTranslation();

  const [partialDeviceList, setPartialDeviceList] = useState<PartialDevice[]>([]);
  const [sensorIdSet, setSensorIdSet] = useState<Set<SensorId>>(new Set());
  const [sensorList, setSensorList] = useState<GetDeviceResponse['getDevices'][0]['sensors']>([]);
  const [sensorValueMap, setSensorValueMap] = useState<Map<string, string | number | boolean>>(
    new Map(),
  );
  const [projectKey, setProjectKey] = useState<string | null>(null);

  const { loading } = useQuery<GetDeviceResponse, GetDevicePayload>(GET_DEVICE_ON_INDOOR_MOBILE, {
    variables: {
      deviceId,
    },
    onCompleted: ({ getDevices }) => {
      if (getDevices.length > 0) {
        const currentDevice = getDevices[0];
        const { sensors } = currentDevice;
        const ownSensorIds = new Set(sensors ? sensors.map(({ sensorId }) => sensorId) : []);
        const subscribeSensorsList = subscribeSensorIds[getDevices[0].type].filter((id) =>
          ownSensorIds.has(id),
        );

        setPartialDeviceList([
          {
            deviceId: currentDevice.deviceId,
            sensors: currentDevice.sensors.map((sensor) => ({
              sensorId: sensor.sensorId,
              type: sensor.type,
            })),
          },
        ]);
        setSensorIdSet(new Set(subscribeSensorsList));
        setSensorList(
          currentDevice.sensors.filter(
            (sensor) =>
              isSensorId(sensor.sensorId) && subscribeSensorsList.includes(sensor.sensorId),
          ),
        );
        setProjectKey(currentDevice.groups[0].projectKey);
      } else {
        setPartialDeviceList([]);
        setSensorIdSet(new Set());
        setSensorList([]);
        setProjectKey(null);
      }
    },
    onError: (error) => {
      if (D_DEBUG) console.error(error.graphQLErrors);
    },
  });

  const sensorValues = useSubscribeSensors(partialDeviceList, sensorIdSet);

  useEffect(() => {
    if (!sensorValues) return;
    if (Object.keys(sensorValues).indexOf(deviceId) === -1) return;
    Object.entries(sensorValues[deviceId]).forEach(([sensorId, value]) => {
      if (value.value !== undefined) {
        sensorValueMap.set(`${deviceId}-${sensorId}`, value.value);
      }
    });

    setSensorValueMap(sensorValueMap);
  }, [deviceId, sensorValueMap, sensorValues]);

  return (
    <Dialog
      open={open}
      fullScreen={smDown}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Transition}
    >
      <div className={classes.root}>
        <div className={classes.header}>
          <AppBar position="static" color="inherit" className={classes.appBar}>
            <Toolbar disableGutters variant="dense" className={classes.toolbar}>
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <ArrowBackIcon
                  style={{
                    color:
                      theme.palette.type === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                    fontSize: 24,
                  }}
                />
              </IconButton>
              <Typography variant="subtitle1" noWrap>
                {deviceId}
              </Typography>
            </Toolbar>
          </AppBar>
        </div>
        <div className={classes.body}>
          {!loading && (
            <div className={classes.list}>
              {sensorList.map((sensor) => (
                <Grid
                  container
                  className={classes.listItem}
                  key={`DeviceDetailDialog-${sensor.sensorId}`}
                >
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">
                      {isSensorId(sensor.sensorId) ? tSensorId(sensor.sensorId) : sensor.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{ display: 'flex', gap: 4 }}>
                    {sensor.type === SensorType.SNAPSHOT ? (
                      projectKey && (
                        <CHTSnapshot
                          projectKey={projectKey}
                          url={sensorValueMap.get(`${deviceId}-${sensor.sensorId}`) as string}
                          className={classes.snapshot}
                        />
                      )
                    ) : (
                      <>
                        <Typography variant="body2">
                          {sensorValueMap.get(`${deviceId}-${sensor.sensorId}`)}
                        </Typography>
                        <Typography variant="body2">{sensor.unit}</Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default memo(DeviceDetailDialog);
