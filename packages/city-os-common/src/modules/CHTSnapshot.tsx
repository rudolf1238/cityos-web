import React, { ComponentProps, FunctionComponent, PropsWithChildren, memo } from 'react';

import { SensorId } from '../libs/schema';
import useCHTSnapshot from '../hooks/useCHTSnapshot';
import useSensorIdTranslation from '../hooks/useSensorIdTranslation';

export interface CHTSnapshotProps extends ComponentProps<'img'> {
  url: string;
  projectKey: string;
}

const CHTSnapshot: FunctionComponent<PropsWithChildren<CHTSnapshotProps>> = (
  props: PropsWithChildren<CHTSnapshotProps>,
) => {
  const { url, projectKey } = props;
  const { tSensorId } = useSensorIdTranslation();
  const imgSrc = useCHTSnapshot(projectKey, url);

  return <img src={imgSrc} alt={tSensorId(SensorId.DISPLAY_PLAYER_SNAPSHOT)} {...props} />;
};

export default memo(CHTSnapshot);
