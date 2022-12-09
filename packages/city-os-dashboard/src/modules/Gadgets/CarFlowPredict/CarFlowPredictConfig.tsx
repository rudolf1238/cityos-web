import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DeviceDurationLayout from '../../Configures/ConfigTemplates/DeviceDurationLayout';

type CarFlowPredictConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_DURATION_LAYOUT>;

const CarFlowPredictConfig: VoidFunctionComponent<CarFlowPredictConfigProps> = ({
  config,
  saveType,
  onSave,
}: CarFlowPredictConfigProps) => (
  <DeviceDurationLayout
    gadgetType={GadgetType.CAR_FLOW_PREDICT}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default CarFlowPredictConfig;
