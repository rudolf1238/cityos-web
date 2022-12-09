import { useCallback } from 'react';

import { useSurveillanceContext } from '../modules/SurveillanceProvider';
import useUpdateAllVideosStartTime from './useUpdateAllVideosStartTime';

const useTogglePause = () => {
  const {
    isPlaybackPaused,
    playbackRange,
    playbackTime,
    videoStatusRecord,
    setPlaybackTime,
    setIsPlaybackPaused,
  } = useSurveillanceContext();
  const updateAllVideosStartTime = useUpdateAllVideosStartTime();

  const togglePause = useCallback(() => {
    if (
      isPlaybackPaused &&
      playbackTime !== null &&
      playbackRange !== undefined &&
      (playbackTime >= playbackRange.to.getTime() ||
        Object.values(videoStatusRecord).every(
          ({ errorType, nextClipStartTime }) => !!errorType && nextClipStartTime === null,
        ))
    ) {
      setPlaybackTime(playbackRange.from.getTime());
      updateAllVideosStartTime(playbackRange.from.getTime());
    }
    setIsPlaybackPaused((prev) => !prev);
  }, [
    isPlaybackPaused,
    playbackRange,
    playbackTime,
    setIsPlaybackPaused,
    setPlaybackTime,
    updateAllVideosStartTime,
    videoStatusRecord,
  ]);

  return togglePause;
};

export default useTogglePause;
