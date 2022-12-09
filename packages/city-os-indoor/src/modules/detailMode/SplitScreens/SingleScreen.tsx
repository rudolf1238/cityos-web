import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';

import React, { VoidFunctionComponent, useCallback, useState } from 'react';

import clsx from 'clsx';

import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import useHiddenStyles from 'city-os-common/styles/hidden';

import AspectRatio from 'city-os-common/modules/AspectRatio';
import LiveStreamPlayer from 'city-os-common/modules/videoPlayer/LiveStreamPlayer';

import {
  GET_DEVICES_ON_SURVEILLANCE,
  GetDevicesOnSurveillancePayload,
  GetDevicesOnSurveillanceResponse,
} from '../../../api/getDevicesOnSurveillance';
import useIndoorTranslation from '../../../hooks/useIndoorTranslation';

const fadeOutTime = 10_000;

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    border: '4px solid transparent',
    borderRadius: theme.shape.borderRadius * 1.5,
    width: '100%',
  },

  highlight: {
    animation: `$fadeOut ${fadeOutTime}ms ${theme.transitions.easing.easeInOut}`,
  },

  warning: {
    borderColor: theme.palette.gadget.alarm,
  },

  label: {
    display: 'flex',
    gap: theme.spacing(1),
  },

  avatar: {
    backgroundColor: theme.palette.primary.main,
    width: 24,
    height: 24,
  },

  biggerAvatar: {
    width: 48,
    height: 48,
  },

  biggerLabel: {
    fontSize: 30,
  },

  name: {
    textOverflow: 'ellipsis',
    color: theme.palette.primary.contrastText,
  },

  biggerName: {
    fontSize: 30,
  },

  noVideo: {
    border: 0,
    backgroundColor: theme.palette.background.miniTab,
  },

  noDataRoot: {
    display: 'flex',
    alignItems: 'flex-end',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.miniTab,
    padding: theme.spacing(0, 0, 1.5, 1.5),
  },

  noDataLabel: {
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

interface SingleScreenProps {
  deviceId?: string;
  selectedLabel: string;
  isActive?: boolean;
  isFixed?: boolean;
  detectedType?: 'highlight' | 'warning';
  onToggleFix: () => void;
}

const SingleScreen: VoidFunctionComponent<SingleScreenProps> = ({
  deviceId,
  selectedLabel,
  isActive = false,
  detectedType = 'highlight',
  ...props
}: SingleScreenProps) => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const { t } = useIndoorTranslation(['indoor']);

  const [showFullPage, setShowFullPage] = useState(false);

  const { data } = useQuery<GetDevicesOnSurveillanceResponse, GetDevicesOnSurveillancePayload>(
    GET_DEVICES_ON_SURVEILLANCE,
    {
      variables: {
        deviceIds: deviceId ? [deviceId] : [],
      },
      skip: !deviceId,
    },
  );

  const handleToggleScreen = useCallback((isFullPage: boolean) => {
    setShowFullPage(isFullPage);
  }, []);

  const getDevices = data?.getDevices?.[0];

  return (
    <div
      className={clsx(classes.root, {
        [classes.highlight]: getDevices && isActive && detectedType === 'highlight',
        [classes.warning]: getDevices && detectedType === 'warning',
      })}
    >
      {getDevices ? (
        <LiveStreamPlayer
          device={{ deviceId: getDevices.deviceId }}
          roundedCorner
          isControllable
          enableFullPage
          onToggleScreen={handleToggleScreen}
          classes={{ noVideo: classes.noVideo }}
          header={
            <div className={classes.label}>
              <Avatar className={clsx(classes.avatar, { [classes.biggerAvatar]: showFullPage })}>
                <Typography
                  variant="subtitle2"
                  className={clsx({ [classes.biggerLabel]: showFullPage })}
                >
                  {selectedLabel}
                </Typography>
              </Avatar>
              <Typography
                variant="body1"
                noWrap
                className={clsx(classes.name, {
                  [classes.biggerName]: showFullPage,
                  [hiddenClasses.mdDownHidden]: !showFullPage,
                })}
              >
                {getDevices.name}
              </Typography>
            </div>
          }
        />
      ) : (
        <AspectRatio ratio={16 / 9}>
          <div className={classes.noDataRoot}>
            <div className={classes.noDataLabel}>
              <Avatar className={classes.avatar}>
                <Typography variant="subtitle2">{selectedLabel}</Typography>
              </Avatar>
              <Typography
                variant="body1"
                noWrap
                className={clsx(classes.name, hiddenClasses.mdDownHidden)}
              >
                {t('indoor:No Data')}
              </Typography>
            </div>
          </div>
        </AspectRatio>
      )}
    </div>
  );
};

export default SingleScreen;
