import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DeviceOnly from '../../Configures/ConfigTemplates/DeviceOnly';

type CarIdentifyConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_ONLY>;

const CarIdentifyConfig: VoidFunctionComponent<CarIdentifyConfigProps> = ({
  config,
  saveType,
  onSave,
}: CarIdentifyConfigProps) => (
  <DeviceOnly
    gadgetType={GadgetType.CAR_IDENTIFY}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default CarIdentifyConfig;
