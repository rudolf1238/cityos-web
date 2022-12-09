import React, { VoidFunctionComponent } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import BaseDialog from 'city-os-common/modules/BaseDialog';

// import { RowData } from './types';
// import useWebTranslation from '../../hooks/useWebTranslation';
import { useTranslation } from 'react-i18next';

interface DeleteAdDialogProps {
  open: boolean;
  companyName: string;
  classes?: { root?: string; content?: string; button: string };
  onClose: (isDeleted?: boolean) => void;
}

const DeleteAdDialog: VoidFunctionComponent<DeleteAdDialogProps> = ({
  open,
  companyName,
  classes,
  onClose,
}: DeleteAdDialogProps) => {
  // const { t } = useWebTranslation(['common']);
  const { t } = useTranslation(['wifi']);

  return (
    <BaseDialog
      open={open}
      onClose={() => onClose(false)}
      title={t('wifi:Are you sure you want to remove the ad?')}
      classes={{ dialog: classes?.root, content: classes?.content }}
      content={
        <>
          <Typography variant="body1">
            {t(
              'wifi:This advertisement will be removed from the company {{companyName}}_ You can add it again later if desired_',
              { companyName },
            )}
          </Typography>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => onClose(true)}
            className={classes?.button}
          >
            {t('wifi:Remove')}
          </Button>
        </>
      }
    />
  );
};

export default DeleteAdDialog;
