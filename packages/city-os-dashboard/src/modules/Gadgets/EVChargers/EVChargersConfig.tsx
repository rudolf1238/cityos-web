import React, { VoidFunctionComponent } from 'react';

import { GadgetType } from '../../../libs/type';
import type { ConfigComponentProps } from '../GadgetBase';
import type { ConfigFormType } from '../../../libs/type';

import DivisionLayout from '../../Configures/ConfigTemplates/DivisionLayout';

type EVChargersConfigProps = ConfigComponentProps<ConfigFormType.DIVISION_LAYOUT>;

const EVChargersConfig: VoidFunctionComponent<EVChargersConfigProps> = ({
  config,
  saveType,
  onSave,
}: EVChargersConfigProps) => (
  <DivisionLayout
    gadgetType={GadgetType.EV_CHARGERS}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default EVChargersConfig;
