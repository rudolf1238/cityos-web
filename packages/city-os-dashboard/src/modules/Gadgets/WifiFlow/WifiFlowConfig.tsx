import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DeviceDurationLayout from '../../Configures/ConfigTemplates/DeviceDurationLayout';

type WifiFlowConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_DURATION_LAYOUT>;

const WifiFlowConfig: VoidFunctionComponent<WifiFlowConfigProps> = ({
  config,
  saveType,
  onSave,
}: WifiFlowConfigProps) => (
  <DeviceDurationLayout
    gadgetType={GadgetType.WIFI}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default WifiFlowConfig;
