import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useEffect, useState } from 'react';
import UAParser from 'ua-parser-js';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useStore } from '../reducers';
import useCommonTranslation from '../hooks/useCommonTranslation';

import BaseDialog from './BaseDialog';

// HACK: UAParser cannot recognize iPad in Safari as 'tablet' because iPadOS User Agent in Safari is same as on MacOS
// see https://github.com/faisalman/ua-parser-js/issues/387 for UAParser discussions.
// see https://developer.apple.com/forums/thread/119186 for Apple developer discussions.
const { device, ua } = UAParser();
const isIPad = ua.includes('Mac') && 'ontouchend' in document;
const isMobile = device.type === 'mobile' || device.type === 'tablet' || isIPad;

const useStyles = makeStyles((theme) => ({
  dialog: {
    maxWidth: 600,
    textAlign: 'center',
  },

  dialogButton: {
    marginTop: theme.spacing(1.5),
  },

  dialogButtons: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    whiteSpace: 'nowrap',
  },
}));

interface DownloadCheckerProps {
  open: boolean;
  onClose: (enableDownload: boolean) => void;
}

const DownloadChecker: VoidFunctionComponent<DownloadCheckerProps> = ({
  open,
  onClose,
}: DownloadCheckerProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('common');

  const { download } = useStore();

  const [warningType, setWarningType] = useState<'multi' | 'mobile'>();

  const onCloseMultiDownloadWarning = useCallback(() => {
    setWarningType(undefined);
    onClose(false);
  }, [onClose]);

  const onCloseMobileDownloadWarning = useCallback(() => {
    setWarningType(undefined);
    onClose(false);
  }, [onClose]);

  const handleDownload = useCallback(() => {
    onCloseMobileDownloadWarning();
    onClose(true);
  }, [onCloseMobileDownloadWarning, onClose]);

  useEffect(() => {
    if (!open || warningType) return;
    if (Object.keys(download).length) {
      setWarningType('multi');
    } else if (isMobile) {
      setWarningType('mobile');
    } else {
      handleDownload();
    }
  }, [open, download, warningType, handleDownload]);

  return (
    <>
      <BaseDialog
        open={warningType === 'multi'}
        onClose={onCloseMultiDownloadWarning}
        classes={{ dialog: classes.dialog }}
        title={t('You can not enable a new download processing')}
        content={
          <>
            <Typography variant="body1" align="left">
              {t(
                'Due to another download process existing, you can not initiate a new download right now_ Please wait for the download complete, or delete the process and try again_',
              )}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={onCloseMultiDownloadWarning}
              className={classes.dialogButton}
            >
              {t('OK')}
            </Button>
          </>
        }
      />
      <BaseDialog
        open={warningType === 'mobile'}
        onClose={onCloseMobileDownloadWarning}
        classes={{ dialog: classes.dialog }}
        title={t('Are you sure you want to download it?')}
        content={
          <>
            <Typography variant="body1" align="left">
              {t(
                "Mobile devices' video download size is limited_ A personal computer or laptop is recommended to download videos_",
              )}
            </Typography>
            <div className={classes.dialogButtons}>
              <Button
                variant="outlined"
                color="primary"
                onClick={onCloseMobileDownloadWarning}
                className={classes.dialogButton}
              >
                {t('No, cancel it_')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownload}
                className={classes.dialogButton}
              >
                {t('Yes, download it_')}
              </Button>
            </div>
          </>
        }
      />
    </>
  );
};

export default memo(DownloadChecker);
