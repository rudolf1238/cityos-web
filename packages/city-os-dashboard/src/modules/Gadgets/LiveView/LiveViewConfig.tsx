import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DeviceOnly from '../../Configures/ConfigTemplates/DeviceOnly';

type LiveViewConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_ONLY>;

const LiveViewConfig: VoidFunctionComponent<LiveViewConfigProps> = ({
  config,
  saveType,
  onSave,
}: LiveViewConfigProps) => (
  <DeviceOnly
    gadgetType={GadgetType.LIVE_VIEW}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default LiveViewConfig;
