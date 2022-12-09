import { makeStyles } from '@material-ui/core/styles';
import { useQuery, useSubscription } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';

import {
  SENSOR_VALUES_HISTORY,
  SensorValuesHistoryPayload,
  SensorValuesHistoryResponse,
} from 'city-os-common/api/sensorValuesHistory';
import { SensorId, SensorType } from 'city-os-common/libs/schema';
import { minOfDay, minOfHour, msOfDay, msOfWeek } from 'city-os-common/libs/constants';
import ErrorCode from 'city-os-common/libs/errorCode';
import getSensorValueChanged, {
  SubscribeValueChangedPayload,
  SubscribeValueChangedResponse,
} from 'city-os-common/api/getSensorValueChanged';
import isGqlError from 'city-os-common/libs/isGqlError';

import {
  ConfigFormType,
  Curve,
  Duration,
  ExtremeOperation,
  GadgetConfig,
} from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import {
  SENSOR_VALUES_PREDICT,
  SensorValuesPredictPayload,
  SensorValuesPredictResponse,
} from '../../../api/sensorValuesPredict';

import { getCurve, roundUpNow } from '../../../libs/utils';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import CarFlowPredictConfig from './CarFlowPredictConfig';
import CarIcon from '../../../assets/icon/car.svg';
import GadgetBase from '../GadgetBase';
import SingleFlowLineChart from '../SingleFlowLineChart';

const useStyles = makeStyles(() => ({
  loading: {
    margin: 'auto',
  },
}));

const updateInterval = 60_000;

interface CarFlowPredictProps {
  config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>) => void;
}

const CarFlowPredict: VoidFunctionComponent<CarFlowPredictProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: CarFlowPredictProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation(['mainLayout', 'dashboard']);
  const {
    id,
    setting: { deviceId, duration, size },
  } = config;
  const [endTime, setEndTime] = useState<number>(roundUpNow(duration));
  const [curve, setCurve] = useState<Curve>();
  const [predictCurve, setPredictCurve] = useState<Curve>();
  const [updateTime, setUpdateTime] = useState(new Date());

  const timeInRange = duration === Duration.WEEK ? msOfWeek : msOfDay;
  const interval = duration === Duration.DAY ? minOfHour : minOfDay;

  const {
    data: getDevicesData,
    loading: getDevicesLoading,
    error: getDevicesError,
  } = useQuery<GetDevicesOnDashboardResponse, GetDevicesOnDashboardPayload>(
    GET_DEVICES_ON_DASHBOARD,
    {
      variables: {
        deviceIds: [deviceId],
      },
    },
  );

  const { loading, error: currentError } = useQuery<
    SensorValuesHistoryResponse,
    SensorValuesHistoryPayload
  >(SENSOR_VALUES_HISTORY, {
    variables: {
      deviceId,
      sensorId: SensorId.CAMERA_CAR_FLOW_STRAIGHT_COUNT,
      start: new Date(endTime - timeInRange),
      end: new Date(endTime - 1), // query to end of the period
      interval,
    },
    onCompleted: (data) => {
      setCurve(getCurve(id, data.sensorValuesHistory, 'charging', 'curve'));
      setUpdateTime(new Date());
    },
    onError: () => {
      setCurve({
        key: id,
        points: [],
      });
    },
  });

  const { loading: predictLoading, error: predictError } = useQuery<
    SensorValuesPredictResponse,
    SensorValuesPredictPayload
  >(SENSOR_VALUES_PREDICT, {
    variables: {
      deviceId,
      sensorId: SensorId.CAMERA_CAR_FLOW_STRAIGHT_COUNT,
      seasonalityPeriod: 24 * (duration === Duration.WEEK ? 7 : 1),
      mode: ExtremeOperation.SUM,
      start: new Date(endTime),
      end: new Date(endTime + timeInRange - 1),
      interval,
      pastInterval: timeInRange,
      lowerBound: 0,
      upperBound: null,
    },
    onCompleted: (data) => {
      setPredictCurve(getCurve(`predict-${id}`, data.sensorValuesPredict, 'charging'));
    },
    onError: () => {
      setPredictCurve({
        key: `predict-${id}`,
        points: [],
      });
    },
  });

  const { data: subscribeData } = useSubscription<
    SubscribeValueChangedResponse<SensorType.GAUGE>,
    SubscribeValueChangedPayload
  >(getSensorValueChanged(SensorType.GAUGE), {
    variables: { deviceId, sensorId: SensorId.CAMERA_CAR_FLOW_STRAIGHT_COUNT },
  });

  const deviceName = getDevicesData?.getDevices?.[0]?.name;

  const currentValue =
    subscribeData?.sensorValueChanged.data.value !== undefined
      ? subscribeData.sensorValueChanged.data.value.toLocaleString('en-US')
      : '---';

  const isForbidden = useMemo(
    () =>
      [getDevicesError, currentError, predictError].some((err) =>
        isGqlError(err, ErrorCode.FORBIDDEN),
      ),
    [currentError, getDevicesError, predictError],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setEndTime(roundUpNow(duration));
    }, updateInterval);
    return () => clearInterval(intervalId);
  }, [duration]);

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
      ConfigComponent={CarFlowPredictConfig}
    >
      {!curve && (loading || predictLoading || getDevicesLoading) ? (
        <CircularProgress className={classes.loading} />
      ) : (
        <SingleFlowLineChart
          setting={{
            duration,
            size,
            title: `${t('dashboard:Traffic Flow')} (${t('dashboard:Predict')})`,
            subTitle: deviceName || deviceId,
            unit: t('dashboard:CAR', {
              count: currentValue !== '---' ? parseInt(currentValue, 10) : 0,
            }),
            icon: <CarIcon />,
            colorKey: 'charging',
          }}
          start={endTime - timeInRange}
          curve={curve}
          secondCurve={predictCurve}
          currentValue={currentValue}
        />
      )}
    </GadgetBase>
  );
};

export default memo(CarFlowPredict);
