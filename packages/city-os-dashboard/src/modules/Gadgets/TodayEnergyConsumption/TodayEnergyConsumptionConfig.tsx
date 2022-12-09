import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DevicesTitleLayout from '../../Configures/ConfigTemplates/DevicesTitleLayout';

type TodayEnergyConsumptionConfigProps = ConfigComponentProps<ConfigFormType.DEVICES_TITLE_LAYOUT>;

const TodayEnergyConsumptionConfig: VoidFunctionComponent<TodayEnergyConsumptionConfigProps> = ({
  config,
  saveType,
  onSave,
}: TodayEnergyConsumptionConfigProps) => (
  <DevicesTitleLayout
    gadgetType={GadgetType.TODAY_ENERGY_CONSUMPTION}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default TodayEnergyConsumptionConfig;
