import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';

import Avatar from '@material-ui/core/Avatar';
import CloseIcon from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import { DeviceType } from 'city-os-common/libs/schema';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import ExtendablePanel from 'city-os-common/modules/ExtendablePanel';

import {
  GET_DEVICES_ON_SURVEILLANCE,
  GetDevicesOnSurveillancePayload,
  GetDevicesOnSurveillanceResponse,
} from '../../api/getDevicesOnSurveillance';
import { SplitMode } from '../../libs/type';
import { splitModeColumnCount } from '../../libs/constants';
import { useSurveillanceContext } from '../SurveillanceProvider';
import useAnimationStyles from '../../styles/animation';
import useSurveillanceTranslation from '../../hooks/useSurveillanceTranslation';
import type { LiveViewDevice } from '../../libs/type';

import PinIcon from '../../assets/icon/pin.svg';
import PlaybackTimePicker from './PlaybackTimePicker';

const useStyles = makeStyles((theme) => ({
  selectedMenu: {
    zIndex: theme.zIndex.speedDial,
    boxShadow: theme.shadows[10],
    backgroundColor: theme.palette.background.paper,
  },

  selectedMenuTablet: {
    [theme.breakpoints.down('sm')]: {
      position: 'absolute',
      right: 0,
      height: '100%',
    },
  },

  paper: {
    display: 'flex',
    flexDirection: 'column',
  },

  extendablePanel: {
    height: '100%',
  },

  toggle: {
    top: theme.spacing(14),
  },

  infoBar: {
    display: 'flex',
    borderTop: `1px solid ${theme.palette.grey[100]}`,
    borderBottom: `1px solid ${theme.palette.grey[100]}`,
    backgroundColor: theme.palette.background.oddRow,
    padding: theme.spacing(1, 2, 1, 1),
    width: '100%',
  },

  infoDivider: {
    alignSelf: 'center',
    margin: theme.spacing(0, 1),
    height: 32,
  },

  infoCount: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 90,
  },

  list: {
    paddingTop: 0,
    paddingBottom: 0,
    overflowY: 'auto',
  },

  listItem: {
    gap: theme.spacing(1),
    border: '2px solid transparent',
    cursor: 'pointer',
    paddingLeft: theme.spacing(1.5),
    height: theme.spacing(7),

    '&::after': {
      display: 'none',
    },

    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.evenRow,
    },

    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.oddRow,
    },

    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },

  selected: {
    borderTop: `1px solid ${theme.palette.background.default}`,
    borderBottom: `1px solid ${theme.palette.background.default}`,

    '&:last-child': {
      borderBottom: '1px solid transparent',
    },
  },

  listItemIcon: {
    minWidth: 24,
    color: theme.palette.info.contrastText,
  },

  pinIcon: {
    flexShrink: 0,
    width: 12,
    color: theme.palette.text.disabled,
  },

  pinIconSelected: {
    color: theme.palette.primary.main,
  },

  avatar: {
    backgroundColor: theme.palette.primary.main,
    width: 24,
    height: 24,
  },

  cameraIcon: {
    borderRadius: '50%',
    backgroundColor: theme.palette.secondary.main,
    padding: theme.spacing(0.5),
  },
}));

interface SelectedMenuProps {
  open: boolean;
  mode: 'map' | 'splitScreen';
  onToggle: (isOpen: boolean) => void;
  onChangeFixed: (deviceId: string, screenIdx: number | null) => void;
}

const SelectedMenu: VoidFunctionComponent<SelectedMenuProps> = ({
  open,
  mode,
  onToggle,
  onChangeFixed,
}: SelectedMenuProps) => {
  const classes = useStyles();
  const animationClasses = useAnimationStyles();
  const { t } = useSurveillanceTranslation('surveillance');
  const {
    selectedDevices,
    pageDeviceIds,
    splitMode,
    cursorIndex,
    eventDeviceIds,
    setSelectedDevices,
    setFixSelectingDevice,
    setIsUpdating,
    setCursorIndex,
  } = useSurveillanceContext();

  const gridsPerPage = splitModeColumnCount[splitMode] ** 2;

  const [devicesData, setDevicesData] = useState<GetDevicesOnSurveillanceResponse['getDevices']>(
    [],
  );

  useQuery<GetDevicesOnSurveillanceResponse, GetDevicesOnSurveillancePayload>(
    GET_DEVICES_ON_SURVEILLANCE,
    {
      variables: {
        deviceIds: selectedDevices.map(({ deviceId }) => deviceId),
      },
      skip: selectedDevices.length === 0,
      fetchPolicy: 'cache-and-network',
      onCompleted: ({ getDevices }) => {
        setDevicesData(getDevices);
      },
      onError: () => {
        setDevicesData(null);
      },
    },
  );

  const handleSelect = useCallback(
    (device: LiveViewDevice) => {
      if (splitMode === SplitMode.SINGLE) {
        onChangeFixed(device.deviceId, device.fixedIndex === null ? 0 : null);
      } else {
        setFixSelectingDevice(device);
      }
    },
    [splitMode, onChangeFixed, setFixSelectingDevice],
  );

  const handleDeleteSelected = useCallback(
    (device: LiveViewDevice) => {
      const currSelectedDevices = selectedDevices.filter(
        (selectedDevice) => selectedDevice.deviceId !== device.deviceId,
      );
      if (cursorIndex > currSelectedDevices.length - 1) setCursorIndex(0);
      setSelectedDevices(currSelectedDevices);
      setIsUpdating(true);
    },
    [cursorIndex, selectedDevices, setCursorIndex, setIsUpdating, setSelectedDevices],
  );

  const selectedCameraList = useMemo(
    () =>
      selectedDevices.reduce<{ device: LiveViewDevice; name: string; label: string | null }[]>(
        (cameraList, selectedDevice) => {
          const deviceInfo = devicesData?.find(
            (device) => device.deviceId === selectedDevice.deviceId,
          );
          if (deviceInfo) {
            const playingIndex = pageDeviceIds.findIndex(
              (deviceId) => deviceId === selectedDevice.deviceId,
            );
            cameraList.push({
              device: selectedDevice,
              name: deviceInfo.name,
              label: playingIndex >= 0 ? (playingIndex + 1).toString() : null,
            });
          }
          return cameraList;
        },
        [],
      ),
    [pageDeviceIds, devicesData, selectedDevices],
  );

  const listAriaLabel = t('Selected Camera List');

  return (
    <div
      className={clsx(classes.selectedMenu, {
        [classes.selectedMenuTablet]: mode === 'splitScreen',
      })}
    >
      <ExtendablePanel
        size={330}
        open={open}
        onToggle={onToggle}
        direction="right"
        PaperProps={{
          className: classes.paper,
        }}
        classes={{ root: classes.extendablePanel, toggle: classes.toggle }}
      >
        <div className={classes.infoBar}>
          <PlaybackTimePicker />
          <Divider orientation="vertical" className={classes.infoDivider} />
          <Typography variant="body2" className={classes.infoCount}>
            {t('{{count}} device', { count: selectedDevices.length })}
          </Typography>
        </div>
        <List aria-label={listAriaLabel} className={classes.list}>
          {selectedCameraList.map(({ device, name, label }) => (
            <ListItem
              key={device.deviceId}
              classes={{
                root: clsx(classes.listItem, {
                  [animationClasses.highlight]: eventDeviceIds.includes(device.deviceId),
                }),
                selected: classes.selected,
              }}
              onClick={() => {
                handleSelect(device);
              }}
            >
              <PinIcon
                className={clsx(classes.pinIcon, {
                  [classes.pinIconSelected]:
                    device.fixedIndex !== null && device.fixedIndex < gridsPerPage,
                })}
              />
              <ListItemIcon className={classes.listItemIcon}>
                {label ? (
                  <Avatar className={classes.avatar}>
                    <Typography variant="subtitle2">{label}</Typography>
                  </Avatar>
                ) : (
                  <DeviceIcon type={DeviceType.CAMERA} className={classes.cameraIcon} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" color="textPrimary">
                    {name}
                  </Typography>
                }
              />
              <ListItemIcon
                className={classes.listItemIcon}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteSelected(device);
                }}
              >
                <CloseIcon color="primary" fontSize="small" />
              </ListItemIcon>
            </ListItem>
          ))}
        </List>
      </ExtendablePanel>
    </div>
  );
};

export default memo(SelectedMenu);
