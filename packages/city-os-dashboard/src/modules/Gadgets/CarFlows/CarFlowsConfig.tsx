import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DevicesDurationLayout from '../../Configures/ConfigTemplates/DevicesDurationLayout';

type CarFlowsConfigProps = ConfigComponentProps<ConfigFormType.DEVICES_DURATION_LAYOUT>;

const CarFlowsConfig: VoidFunctionComponent<CarFlowsConfigProps> = ({
  saveType,
  onSave,
  config,
}: CarFlowsConfigProps) => (
  <DevicesDurationLayout
    gadgetType={GadgetType.CAR_FLOWS}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default CarFlowsConfig;
