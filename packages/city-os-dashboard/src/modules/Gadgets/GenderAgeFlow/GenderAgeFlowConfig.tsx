import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DeviceDurationLayout from '../../Configures/ConfigTemplates/DeviceDurationLayout';

type GenderAgeFlowConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_DURATION_LAYOUT>;

const GenderAgeFlowConfig: VoidFunctionComponent<GenderAgeFlowConfigProps> = ({
  config,
  saveType,
  onSave,
}: GenderAgeFlowConfigProps) => (
  <DeviceDurationLayout
    gadgetType={GadgetType.GENDER_AGE_FLOW}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default GenderAgeFlowConfig;
