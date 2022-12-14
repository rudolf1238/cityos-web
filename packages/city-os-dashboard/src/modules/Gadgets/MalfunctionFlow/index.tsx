import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';
import type { Theme } from '@material-ui/core/styles';

import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import { Point } from 'city-os-common/libs/schema';
import { msOfWeek } from 'city-os-common/libs/constants';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';

import DeviceIcon from 'city-os-common/assets/icon/devices.svg';

import { Duration } from '../../../libs/type';
import {
  PROPER_RATE_HISTORY,
  ProperRateHistoryPayload,
  ProperRateHistoryResponse,
} from '../../../api/properRateHistory';
import {
  SUBSCRIBE_PROPER_RATE,
  SubscribeProperRatePayload,
  SubscribeProperRateResponse,
} from '../../../api/properRateChanged';
import { resubscribeInterval } from '../../../libs/constants';
import { roundUpNow } from '../../../libs/utils';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useResubscribeableSubscription from '../../../hooks/useResubscribeableSubscription';
import type { ConfigFormType, Curve, GadgetConfig } from '../../../libs/type';

import GadgetBase from '../GadgetBase';
import MalfunctionFlowConfig from './MalfunctionFlowConfig';
import SingleFlowLineChart from '../SingleFlowLineChart';

const useStyles = makeStyles((theme) => ({
  loading: {
    margin: 'auto',
  },

  totalWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(2.5),

    '& > hr': {
      margin: theme.spacing(1, 0),
      width: '100%',
    },
  },
}));

const getErrorsCurve = (
  id: string,
  sensorData: ProperRateHistoryResponse['properRateHistory'],
  color: keyof Theme['palette']['gadget'],
): Curve => ({
  key: id,
  points: sensorData.reduce<Point[]>((acc, { time, errors }) => {
    acc.push({ time, value: Math.round(errors) });
    return acc;
  }, []),
  variant: 'areaClosed',
  color,
});

const updateInterval = 3600_000;
const duration = Duration.WEEK;
const timeInRange = msOfWeek;

interface MalfunctionFlowProps {
  config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
}

const MalfunctionFlow: VoidFunctionComponent<MalfunctionFlowProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: MalfunctionFlowProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation(['mainLayout', 'dashboard']);
  const {
    id,
    setting: { groupId, size },
  } = config;
  const {
    userProfile: { joinedGroups },
  } = useStore();
  const [endTime, setEndTime] = useState<number>(roundUpNow(duration));
  const [curve, setCurve] = useState<Curve>();
  const [pastCurve, setPastCurve] = useState<Curve>();
  const [updateTime, setUpdateTime] = useState(new Date());
  const { loading, error: currentError } = useQuery<
    ProperRateHistoryResponse,
    ProperRateHistoryPayload
  >(PROPER_RATE_HISTORY, {
    variables: {
      groupId,
      start: new Date(endTime - timeInRange),
      end: new Date(endTime - 1), // query to end of the period
    },
    onCompleted: ({ properRateHistory }) => {
      setCurve(getErrorsCurve(id, properRateHistory, 'alarm'));
      setUpdateTime(new Date());
    },
    onError: () => {
      setCurve({
        key: id,
        points: [],
      });
    },
  });

  const { loading: pastLoading, error: pastError } = useQuery<
    ProperRateHistoryResponse,
    ProperRateHistoryPayload
  >(PROPER_RATE_HISTORY, {
    variables: {
      groupId,
      start: new Date(endTime - timeInRange - timeInRange),
      end: new Date(endTime - timeInRange - 1), // query to end of the period
    },
    onCompleted: (data) => {
      setPastCurve(getErrorsCurve(`past-${id}`, data.properRateHistory, 'alarm'));
    },
    onError: () => {
      setPastCurve({
        key: `past-${id}`,
        points: [],
      });
    },
  });

  // resubscribe on division-related gadget in case of devices change
  const { data: subscribeProperRateData, resubscribe } = useResubscribeableSubscription<
    SubscribeProperRateResponse,
    SubscribeProperRatePayload
  >(SUBSCRIBE_PROPER_RATE, {
    variables: { groupId },
  });

  const currentValue =
    subscribeProperRateData?.properRateChanged.errors !== undefined
      ? subscribeProperRateData.properRateChanged.errors.toString()
      : '---';

  const currentTotal =
    subscribeProperRateData?.properRateChanged.total !== undefined
      ? subscribeProperRateData.properRateChanged.total
      : '---';

  const isForbidden = useMemo(
    () => [currentError, pastError].some((err) => isGqlError(err, ErrorCode.FORBIDDEN)),
    [currentError, pastError],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setEndTime(roundUpNow(duration));
    }, updateInterval);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      resubscribe();
    }, resubscribeInterval);
    return () => {
      window.clearInterval(timer);
    };
  }, [resubscribe]);

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('dashboard:You don_t have permission to access this division_')}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      ConfigComponent={MalfunctionFlowConfig}
    >
      {!curve && (loading || pastLoading) ? (
        <CircularProgress className={classes.loading} />
      ) : (
        <SingleFlowLineChart
          setting={{
            duration,
            size,
            title: `${t('dashboard:Malfunctions')} (${t('dashboard:Now')})`,
            subTitle: joinedGroups?.find((group) => group.id === groupId)?.name || '',
            unit: t('dashboard:DEVICE', {
              count: currentValue !== '---' ? parseInt(currentValue, 10) : 0,
            }),
            icon: <DeviceIcon />,
            colorKey: 'alarm',
          }}
          start={endTime - timeInRange}
          curve={curve}
          secondCurve={pastCurve}
          currentValue={currentValue}
          chartsOptions={{
            labelType: 'time',
          }}
          additionalContent={
            <div className={classes.totalWrapper}>
              <Divider />
              <Typography variant="caption" noWrap>
                {t('dashboard:Total')}
              </Typography>
              <Typography variant="h5" noWrap>
                {currentTotal}
              </Typography>
            </div>
          }
        />
      )}
    </GadgetBase>
  );
};

export default memo(MalfunctionFlow);
