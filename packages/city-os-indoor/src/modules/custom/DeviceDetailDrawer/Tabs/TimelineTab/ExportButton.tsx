import React, { VoidFunctionComponent, memo } from 'react';

import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { CSVLink } from 'react-csv';
import { CommonPropTypes } from 'react-csv/components/CommonPropTypes';

import useIndoorTranslation from '../../../../../hooks/useIndoorTranslation';

import ExportIcon from '../../../../../assets/icon/export.svg';

interface ExportButtonProps {
  headers: CommonPropTypes['headers'];
  data: CommonPropTypes['data'];
  style?: React.CSSProperties;
  disabled?: boolean;
  filename?: string;
}

const ExportButton: VoidFunctionComponent<ExportButtonProps> = (props: ExportButtonProps) => {
  const { headers, data, style, disabled, filename = 'export.csv' } = props;

  const { t } = useIndoorTranslation(['common']);

  return (
    <CSVLink
      headers={headers}
      data={data}
      style={style}
      onClick={() => !disabled}
      filename={filename}
    >
      <ThemeIconButton
        tooltip={t('common:Export')}
        color="primary"
        variant="contained"
        disabled={disabled}
      >
        <ExportIcon style={{ fill: 'none' }} />
      </ThemeIconButton>
    </CSVLink>
  );
};

export default memo(ExportButton);
