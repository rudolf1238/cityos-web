import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DivisionLayout from '../../Configures/ConfigTemplates/DivisionLayout';

type EVStatsConfigProps = ConfigComponentProps<ConfigFormType.DIVISION_LAYOUT>;

const EVStatsConfig: VoidFunctionComponent<EVStatsConfigProps> = ({
  config,
  saveType,
  onSave,
}: EVStatsConfigProps) => (
  <DivisionLayout
    gadgetType={GadgetType.EV_STATS}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default EVStatsConfig;
