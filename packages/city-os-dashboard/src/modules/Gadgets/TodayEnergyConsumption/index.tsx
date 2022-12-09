import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';

import { ConfigFormType, GadgetConfig, GadgetDeviceInfo, GadgetSize } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import BarStackChart, { Unit } from './BarStackChart';
import GadgetBase from '../GadgetBase';
import TodayEnergyConsumptionConfig from './TodayEnergyConsumptionConfig';

// TODO: 塞滿三個裝置的假資料，先註解掉，確定不會會刪除（Fishcan @ 2022.08.12）

// const nowMockDataList: { deviceName: string; value: number; color: string }[] = [
//   {
//     deviceName: 'Device A',
//     value: Math.round(Math.random() * 100),
//     color: '#ff9800',
//   },
//   {
//     deviceName: 'Device B',
//     value: Math.round(Math.random() * 100),
//     color: '#25b2ff',
//   },
//   {
//     deviceName: 'Device C',
//     value: Math.round(Math.random() * 100),
//     color: '#9eadbd',
//   },
// ];

// const historyMockDataList: Unit[] = Array.from(Array(new Date().getHours()).keys()).map((i) => ({
//   hour: i,
//   label: `${i}:00 - ${i}:59`,
//   content: [
//     {
//       label: 'Device A',
//       value: Math.round(Math.random() * 100),
//       color: '#ff9800',
//     },
//     {
//       label: 'Device B',
//       value: Math.round(Math.random() * 100),
//       color: '#25b2ff',
//     },
//     {
//       label: 'Device C',
//       value: Math.round(Math.random() * 100),
//       color: '#9eadbd',
//     },
//   ],
// }));

// const deviceValueSum = nowMockDataList.reduce((acc, cur) => acc + cur.value, 0);

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    minHeight: 0,
  },

  gridContainer: {
    margin: 0,
    width: '100%',
    overflow: 'hidden',
  },

  item: {
    width: '100%',
    minWidth: 0,
  },

  squareItem: {
    height: '50%',
  },

  rectangleItem: {
    height: '100%',
  },

  loading: {
    padding: theme.spacing(1, 1, 0, 0),
  },
}));

interface TodayEnergyConsumptionProps {
  config: GadgetConfig<ConfigFormType.DEVICES_TITLE_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICES_TITLE_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICES_TITLE_LAYOUT>) => void;
}

const TodayEnergyConsumption: VoidFunctionComponent<TodayEnergyConsumptionProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: TodayEnergyConsumptionProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useDashboardTranslation(['mainLayout', 'dashboard']);
  const {
    setting: { deviceIds, title, size },
  } = config;
  const [updateTime, setUpdateTime] = useState<Date>(new Date());

  const mockColorList = useMemo(
    () =>
      theme.palette.type === 'dark'
        ? ['#ff9800', '#25b2ff', '#13579f']
        : ['#ff9800', '#25b2ff', '#9eadbd'],
    [theme.palette.type],
  );

  const {
    data: getDevicesData,
    loading: getDevicesLoading,
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
      getDevicesData?.getDevices?.map(({ deviceId: getDeviceId, name, sensors, groups }) => ({
        deviceId: getDeviceId,
        name,
        sensors,
        groups,
      })) || [],
    [getDevicesData?.getDevices],
  );

  useEffect(() => {
    setUpdateTime(new Date());
  }, [devices]);

  const isForbidden = useMemo(
    () => [getDevicesError].some((err) => isGqlError(err, ErrorCode.FORBIDDEN)),
    [getDevicesError],
  );

  const historyMockDataList: Unit[] = useMemo(
    () =>
      Array.from(Array(new Date().getHours() + 1).keys()).map((i, _, a) => ({
        hour: i,
        label: `${i}:00 - ${i}:59`,
        content: devices.map((device, index) => ({
          label: device.name,
          value: Math.round(
            Math.random() * 100 * (i !== a.length - 1 ? 1 : new Date().getMinutes() / 60),
          ),
          color: mockColorList[index],
        })),
      })),
    [devices, mockColorList],
  );

  const nowMockDataList: { deviceName: string; value: number; color: string }[] = useMemo(
    () =>
      historyMockDataList[historyMockDataList.length - 1].content.map(
        ({ label, value, color }) => ({ deviceName: label, value, color }),
      ),
    [historyMockDataList],
  );

  const deviceValueSum = useMemo(
    () => nowMockDataList.reduce((acc, cur) => acc + cur.value, 0),
    [nowMockDataList],
  );

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('dashboard:You don_t have permission to access this device_')}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      ConfigComponent={TodayEnergyConsumptionConfig}
    >
      {getDevicesLoading ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '46px',
          }}
        >
          <CircularProgress className={classes.loading} />
        </div>
      ) : (
        <Grid
          container
          spacing={2}
          wrap="nowrap"
          direction={size === GadgetSize.SQUARE ? 'column' : 'row'}
          className={classes.root}
        >
          <Grid
            item
            xs={size === GadgetSize.SQUARE ? 12 : 6}
            className={clsx(
              classes.gridContainer,
              size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
            )}
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: theme.spacing(2.5),
                height: '75%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '40%',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: theme.spacing(0.5),
                }}
              >
                <span style={{ fontSize: 56, fontWeight: 500, color: theme.palette.primary.main }}>
                  {deviceValueSum}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: theme.palette.primary.main,
                    marginTop: 24,
                  }}
                >
                  kWh
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  width: '60%',
                  height: '100%',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: theme.spacing(0.5),
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color:
                      theme.palette.type === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                  }}
                >
                  {title || '---'}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    color:
                      theme.palette.type === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                  }}
                >
                  {t('dashboard:Today Energy Consumption')}
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: theme.spacing(4),
              }}
            >
              {nowMockDataList.map(({ deviceName, value, color }) => (
                <div
                  style={{
                    display: 'flex',
                    gap: theme.spacing(0.75),
                    alignItems: 'center',
                    maxWidth: `calc((100%  - ${
                      theme.spacing(4) * nowMockDataList.length - 1
                    }px) / ${nowMockDataList.length || 1})`,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: color,
                      marginBottom: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    style={{
                      color: theme.palette.pageContainer.title,
                      fontSize: 14,
                      flexShrink: 1,
                    }}
                    noWrap
                  >
                    {deviceName}
                  </Typography>
                  <div
                    style={{
                      color: theme.palette.pageContainer.title,
                      fontSize: 14,
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </Grid>
          <Grid
            item
            xs={size === GadgetSize.SQUARE ? 12 : 6}
            className={clsx(
              classes.item,
              size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
            )}
          >
            <BarStackChart data={historyMockDataList} />
          </Grid>
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(TodayEnergyConsumption);
