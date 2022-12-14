import React, { VoidFunctionComponent, memo } from 'react';

import { SensorType } from 'city-os-common/libs/schema';

import type { GaugeTypeFieldProps } from './GaugeTypeField';
import type { SwitchTypeFieldProps } from './SwitchTypeField';
import type { TextTypeFieldProps } from './TextTypeField';

import GaugeTypeField from './GaugeTypeField';
import SwitchTypeField from './SwitchTypeField';
import TextTypeField from './TextTypeField';

type SensorValueFieldProps =
  | (GaugeTypeFieldProps & { sensorType: SensorType.GAUGE })
  | (SwitchTypeFieldProps & { sensorType: SensorType.SWITCH })
  | (TextTypeFieldProps & { sensorType: SensorType.TEXT })
  | { sensorType: SensorType.SNAPSHOT };

const SensorValueField: VoidFunctionComponent<SensorValueFieldProps> = ({
  sensorType,
  ...props
}: SensorValueFieldProps) => {
  switch (sensorType) {
    case SensorType.SNAPSHOT:
      return null;
    case SensorType.TEXT:
      return <TextTypeField {...props} />;
    case SensorType.SWITCH:
      return <SwitchTypeField {...props} />;
    default:
      return <GaugeTypeField {...props} />;
  }
};

export default memo(SensorValueField);
