import { fade, makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import AddIcon from '@material-ui/icons/Add';
import Avatar from '@material-ui/core/Avatar';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { splitModeColumnCount } from '../libs/constants';
import { useSurveillanceContext } from './SurveillanceProvider';
import type { LiveViewDevice } from '../libs/type';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },

  root: {
    display: 'grid',
    position: 'relative',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    width: 'min(1024px, var(--vh) * 100 / 9 * 16, 100vw)',
    height: `min(${(1024 / 16) * 9}px, 100vw / 16 * 9, var(--vh) * 100)`,
  },

  close: {
    position: 'absolute',
    right: 0,
    transform: 'translateY(-100%)',
  },

  item: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.disabled,

    '&:hover': {
      backgroundColor: theme.palette.background.disabled,
    },
  },

  avatar: {
    position: 'absolute',
    top: theme.spacing(1),
    left: theme.spacing(1),
    backgroundColor: fade(theme.palette.background.dark, 0.12),
    width: 24,
    height: 24,
  },
}));

interface FixSelectingModeProps {
  device?: LiveViewDevice;
  onChangeFixed: (deviceId: string, screenIdx: number | null) => void;
  onClose: () => void;
}

const FixSelectingMode: VoidFunctionComponent<FixSelectingModeProps> = ({
  device,
  onChangeFixed,
  onClose,
}: FixSelectingModeProps) => {
  const classes = useStyles();
  const { splitMode } = useSurveillanceContext();

  const columnCount = splitModeColumnCount[splitMode];

  return (
    <Backdrop open={!!device} className={classes.backdrop}>
      <div className={classes.root} style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
        {Array.from({ length: columnCount ** 2 }, (_, i) => (
          <Button
            key={i.toString()}
            className={classes.item}
            onClick={() => {
              if (device) onChangeFixed(device.deviceId, i);
              onClose();
            }}
          >
            <Avatar className={classes.avatar}>
              <Typography variant="subtitle2">{i + 1}</Typography>
            </Avatar>
            <AddIcon color="primary" />
          </Button>
        ))}
        <ThemeIconButton
          size="small"
          color="primary"
          variant="miner"
          className={classes.close}
          onClick={onClose}
        >
          <CloseIcon />
        </ThemeIconButton>
      </div>
    </Backdrop>
  );
};

export default memo(FixSelectingMode);
