import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DevicesDurationLayout from '../../Configures/ConfigTemplates/DevicesDurationLayout';

type HumanFlowsConfigProps = ConfigComponentProps<ConfigFormType.DEVICES_DURATION_LAYOUT>;

const HumanFlowsConfig: VoidFunctionComponent<HumanFlowsConfigProps> = ({
  onSave,
  saveType,
  config,
}: HumanFlowsConfigProps) => (
  <DevicesDurationLayout
    gadgetType={GadgetType.HUMAN_FLOWS}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default HumanFlowsConfig;
