import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DeviceOnly from '../../Configures/ConfigTemplates/DeviceOnly';

type HumanShapeConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_ONLY>;

const HumanShapeConfig: VoidFunctionComponent<HumanShapeConfigProps> = ({
  config,
  saveType,
  onSave,
}: HumanShapeConfigProps) => (
  <DeviceOnly
    gadgetType={GadgetType.HUMAN_SHAPE}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default HumanShapeConfig;
