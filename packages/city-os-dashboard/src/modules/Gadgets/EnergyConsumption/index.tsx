import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';

import { ConfigFormType, GadgetConfig, GadgetDeviceInfo } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import EnergyConsumptionConfig from './EnergyConsumptionConfig';
import EnergyConsumptionPieChart from './EnergyConsumptionPieChart';
import GadgetBase from '../GadgetBase';
import PowerConsumptionIcon from '../../../assets/icon/gadget-power-consumption.svg';

const useStyles = makeStyles((_theme) => ({
  container: {
    margin: 0,
    width: '100%',
    height: '100%',

    '& > .MuiGrid-item': {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },

  pieWrapper: {
    position: 'relative',
    flex: 1,
    maxWidth: '100%',

    '& > div': {
      position: 'absolute',
    },

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface EnergyConsumptionProps {
  config: GadgetConfig<ConfigFormType.DEVICES_TITLE>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICES_TITLE>) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICES_TITLE>) => void;
}

const EnergyConsumption: VoidFunctionComponent<EnergyConsumptionProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onDuplicate,
  onUpdate,
}: EnergyConsumptionProps) => {
  const { t } = useDashboardTranslation(['column', 'dashboard', 'mainLayout']);
  const classes = useStyles();
  const theme = useTheme();
  const {
    setting: { deviceIds, title },
  } = config;
  const [updateTime, setUpdateTime] = useState<Date>();

  const colorList = useMemo(
    () =>
      theme.palette.type === 'dark'
        ? ['#29cb97', '#25b2ff', 'rgba(255, 255, 255, 0.26)', '#fb7181', '#2176c5', '#5c61f4']
        : ['#29cb97', '#25b2ff', 'rgba(0, 0, 0, 0.26)', '#fb7181', '#748aa1', '#5c61f4'],
    [theme.palette.type],
  );

  const {
    data,
    loading,
    error: getDevicesError,
  } = useQuery<GetDevicesOnDashboardResponse, GetDevicesOnDashboardPayload>(
    GET_DEVICES_ON_DASHBOARD,
    {
      variables: {
        deviceIds,
      },
    },
  );

  const devices = useMemo<GadgetDeviceInfo[]>(
    () =>
      data?.getDevices?.map(({ deviceId: getDeviceId, name, sensors, groups }) => ({
        deviceId: getDeviceId,
        name,
        sensors,
        groups,
      })) || [],
    [data?.getDevices],
  );

  useEffect(() => {
    setUpdateTime(new Date());
  }, [devices]);

  const isForbidden = useMemo(
    () => [getDevicesError].some((err) => isGqlError(err, ErrorCode.FORBIDDEN)),
    [getDevicesError],
  );

  const mockData = useMemo(
    () =>
      devices.map((device, index, list) => ({
        label: device.name,
        value: Math.round(((index + 1) / (((1 + list.length) * list.length) / 2)) * 100),
      })),
    [devices],
  );

  const random = useMemo(() => Math.random() * 10, []);

  const pieChartData = useMemo(
    () =>
      mockData.map((item, index) => ({
        key: item.label,
        value: item.value * random,
        color: colorList[index % colorList.length],
      })),
    [colorList, mockData, random],
  );

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('dashboard:You don_t have permission to access this device_')}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onUpdate={onUpdate}
      ConfigComponent={EnergyConsumptionConfig}
    >
      {loading ? (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <Grid container className={classes.container} spacing={2}>
          <Grid
            item
            xs={9}
            style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1.5) }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: 60,
                alignItems: 'center',
                flexWrap: 'nowrap',
                gap: theme.spacing(1.5),
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.background.light,
                  color: theme.palette.text.subtitle,
                  flexShrink: 0,
                }}
              >
                <PowerConsumptionIcon />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing(0.25),
                  maxWidth: 'calc(75% - 16px)',
                }}
              >
                <Typography
                  style={{
                    color:
                      theme.palette.type === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                    fontSize: 16,
                    fontWeight: 'bold',
                    flexShrink: 1,
                  }}
                  noWrap
                >
                  {title || '---'}
                </Typography>
                <span
                  style={{
                    color:
                      theme.palette.type === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                    fontSize: 15,
                    flexShrink: 1,
                  }}
                >
                  {t('dashboard:Energy Consumption')}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: 66 }}>
              {mockData.map((item, index) => (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    gap: theme.spacing(0.75),
                    height: '33.3%',
                    maxWidth: `calc(${devices.length < 4 ? '100%' : '50%'} - 4px)`,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: colorList[index % colorList.length],
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      color:
                        theme.palette.type === 'dark'
                          ? 'rgba(255, 255, 255, 0.7)'
                          : 'rgba(0, 0, 0, 0.7)',
                      minWidth: 26,
                      flexShrink: 0,
                      textAlign: 'center',
                    }}
                  >
                    {item.value}%
                  </span>
                  <Typography
                    style={{
                      fontSize: 12,
                      color:
                        theme.palette.type === 'dark'
                          ? 'rgba(255, 255, 255, 0.49)'
                          : 'rgba(0, 0, 0, 0.49)',
                    }}
                    noWrap
                  >
                    {item.label}
                  </Typography>
                </div>
              ))}
            </div>
          </Grid>
          <Grid
            item
            xs={3}
            className={classes.pieWrapper}
            style={{ marginLeft: -theme.spacing(1), marginRight: theme.spacing(0.5) }}
          >
            <EnergyConsumptionPieChart data={pieChartData} />
          </Grid>
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(EnergyConsumption);
