import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback } from 'react';

import { ErrorType } from 'city-os-common/modules/videoPlayer/type';
import { msOfSec } from 'city-os-common/libs/constants';

import PlayerController from 'city-os-common/modules/PlayerController';

import useTogglePause from '../hooks/useTogglePause';

import { useSurveillanceContext } from './SurveillanceProvider';
import type { PlaybackRange, VideoStatusRecord } from '../libs/type';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: theme.palette.background.playbackVideoToolbar,
    padding: theme.spacing(1),
    minHeight: 56,
  },
}));

interface PlaybackMapToolbarProps {
  playbackRange: PlaybackRange;
}

const PlaybackMapToolbar: VoidFunctionComponent<PlaybackMapToolbarProps> = ({
  playbackRange: { from, to },
}: PlaybackMapToolbarProps) => {
  const classes = useStyles();
  const {
    isPlaybackPaused: isPaused,
    playbackTime,
    selectedDevices,
    setVideoStatusRecord,
  } = useSurveillanceContext();
  const togglePause = useTogglePause();

  const onSkip = useCallback(
    (skipTime: number) => {
      if (!playbackTime) return;
      const newStartTime = playbackTime + skipTime * msOfSec;
      setVideoStatusRecord((prevRecord) =>
        Object.entries(prevRecord).reduce<VideoStatusRecord>(
          (prev, [deviceId, videoStatus]) => ({
            ...prev,
            [deviceId]: {
              ...videoStatus,
              changingStartTime:
                videoStatus.errorType === ErrorType.NO_CAMERA_ID ? undefined : newStartTime,
            },
          }),
          prevRecord,
        ),
      );
    },
    [playbackTime, setVideoStatusRecord],
  );

  return (
    <div className={classes.root}>
      <PlayerController
        isPaused={isPaused}
        currentTime={playbackTime}
        from={from}
        to={to}
        disabled={selectedDevices.length === 0}
        togglePause={togglePause}
        onSkip={onSkip}
      />
    </div>
  );
};

export default memo(PlaybackMapToolbar);
