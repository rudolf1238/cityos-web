import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DivisionLayout from '../../Configures/ConfigTemplates/DivisionLayout';

type ProperRateConfigProps = ConfigComponentProps<ConfigFormType.DIVISION_LAYOUT>;

const ProperRateConfig: VoidFunctionComponent<ProperRateConfigProps> = ({
  config,
  saveType,
  onSave,
}: ProperRateConfigProps) => (
  <DivisionLayout
    gadgetType={GadgetType.PROPER_RATE}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default ProperRateConfig;
