import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DeviceDurationLayout from '../../Configures/ConfigTemplates/DeviceDurationLayout';

type CarFlowConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_DURATION_LAYOUT>;

const CarFlowConfig: VoidFunctionComponent<CarFlowConfigProps> = ({
  config,
  saveType,
  onSave,
}: CarFlowConfigProps) => (
  <DeviceDurationLayout
    gadgetType={GadgetType.CAR_FLOW}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default CarFlowConfig;
