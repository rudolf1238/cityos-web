import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DivisionLayout from '../../Configures/ConfigTemplates/DivisionLayout';

type MalfunctionFlowConfigProps = ConfigComponentProps<ConfigFormType.DIVISION_LAYOUT>;

const MalfunctionFlowConfig: VoidFunctionComponent<MalfunctionFlowConfigProps> = ({
  config,
  saveType,
  onSave,
}: MalfunctionFlowConfigProps) => (
  <DivisionLayout
    gadgetType={GadgetType.MALFUNCTION_FLOW}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default MalfunctionFlowConfig;
