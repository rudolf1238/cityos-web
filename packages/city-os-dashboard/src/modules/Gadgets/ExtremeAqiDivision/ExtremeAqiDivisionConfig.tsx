import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DivisionOnly from '../../Configures/ConfigTemplates/DivisionOnly';

type ExtremeAqiDivisionConfigProps = ConfigComponentProps<ConfigFormType.DIVISION_ONLY>;

const ExtremeAqiDivisionConfig: VoidFunctionComponent<ExtremeAqiDivisionConfigProps> = ({
  config,
  saveType,
  onSave,
}: ExtremeAqiDivisionConfigProps) => (
  <DivisionOnly
    gadgetType={GadgetType.AQI_IN_DIVISION}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default ExtremeAqiDivisionConfig;
