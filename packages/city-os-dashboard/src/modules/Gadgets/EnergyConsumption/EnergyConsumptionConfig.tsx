import { useTheme } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, useMemo } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DevicesTitle from '../../Configures/ConfigTemplates/DevicesTitle';

type EnergyConsumptionConfigProps = ConfigComponentProps<ConfigFormType.DEVICES_TITLE>;

const EnergyConsumptionConfig: VoidFunctionComponent<EnergyConsumptionConfigProps> = ({
  config,
  saveType,
  onSave,
}: EnergyConsumptionConfigProps) => {
  const theme = useTheme();

  const colorList = useMemo(
    () =>
      theme.palette.type === 'dark'
        ? ['#29cb97', '#25b2ff', 'rgba(255, 255, 255, 0.26)', '#fb7181', '#2176c5', '#5c61f4']
        : ['#29cb97', '#25b2ff', 'rgba(0, 0, 0, 0.26)', '#fb7181', '#748aa1', '#5c61f4'],
    [theme.palette.type],
  );

  return (
    <DevicesTitle
      gadgetType={GadgetType.ENERGY_CONSUMPTION}
      saveType={saveType}
      onUpdateGadget={onSave}
      config={config}
      deviceLimit={6}
      colorList={colorList}
    />
  );
};

export default EnergyConsumptionConfig;
