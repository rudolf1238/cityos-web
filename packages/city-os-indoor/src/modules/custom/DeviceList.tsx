import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useCallback, useMemo } from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import clsx from 'clsx';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import ExtendablePanel from 'city-os-common/modules/ExtendablePanel';

import { useViewerPageContext } from '../ViewerPageProvider';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';

import PinIcon from '../../assets/icon/pin.svg';

const useStyles = makeStyles((theme) => ({
  selectedMenu: {
    zIndex: theme.zIndex.speedDial,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[10],
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

  counter: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    padding: theme.spacing(2.5),
    backgroundColor: theme.palette.background.oddRow,
    borderTop: `1px solid ${theme.palette.background.miniTab}`,
    borderBottom: `1px solid ${theme.palette.background.miniTab}`,
  },

  list: {
    paddingTop: 0,
    paddingBottom: 0,
    overflowY: 'auto',
    flexGrow: 1,
  },

  listItem: {
    gap: theme.spacing(1),
    height: theme.spacing(7),
    paddingLeft: theme.spacing(4),
    cursor: 'pointer',

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

  listItemIcon: {
    minWidth: 24,
    color: theme.palette.info.contrastText,
  },

  cameraIcon: {
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '50%',
  },

  pinedCameraIcon: {
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
  },

  listItemIconSmall: {
    position: 'absolute',
    left: 12,
  },

  pushPinIcon: {
    color: 'rgba(0, 0, 0, 0.12)',
    height: 13,
  },

  pushPinIconActive: {
    color: theme.palette.primary.main,
    opacity: 0.4,
    transform: 'scaleX(-1)',
  },

  selectedItem: {},

  activeItem: {
    backgroundColor: `${theme.palette.action.selected} !important`,
  },
}));

interface DeviceListProps {
  open: boolean;
  mode: 'map' | 'splitScreen';
  onToggle: (isOpen: boolean) => void;
  handleClick?: (deviceId: string) => void;
}

const DeviceList: VoidFunctionComponent<DeviceListProps> = ({
  open,
  mode,
  onToggle,
  handleClick = () => {},
}: DeviceListProps) => {
  const classes = useStyles();
  const { t: tIndoor } = useIndoorTranslation('indoor');
  const { deviceList, activeId, selectedIdList, setSelectedIdList, setActiveId } =
    useViewerPageContext();

  const initSelectedAnimation = useCallback(() => {
    setActiveId(null);
  }, [setActiveId]);

  const handleActive = useCallback(
    (deviceId: string) => {
      if (activeId === deviceId) {
        setActiveId(null);
      } else {
        setActiveId(deviceId);
        handleClick(deviceId);
      }
    },
    [activeId, handleClick, setActiveId],
  );

  const handleSelect = useCallback(
    (deviceId: string) => {
      const isSelected = selectedIdList.includes(deviceId);
      if (isSelected) {
        setSelectedIdList(selectedIdList.filter((id) => id !== deviceId));
      } else {
        setSelectedIdList([...selectedIdList, deviceId]);
      }
    },
    [selectedIdList, setSelectedIdList],
  );

  const selectedCameraList = useMemo(
    () => deviceList?.filter(({ deviceId }) => selectedIdList.includes(deviceId)),
    [deviceList, selectedIdList],
  );

  const unSelectedCameraList = useMemo(
    () => deviceList?.filter(({ deviceId }) => !selectedIdList.includes(deviceId)),
    [deviceList, selectedIdList],
  );

  // TODO: ??????????????????????????????
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
        <div className={classes.counter}>
          <Typography variant="body2">
            {tIndoor('{{count}} device', { count: deviceList.length })}
          </Typography>
        </div>
        <List aria-label={tIndoor('indoor:Selected Device List')} className={classes.list}>
          {selectedCameraList?.map(({ deviceId, name, type }, _index: number) => (
            <ListItem
              key={deviceId}
              classes={{
                root: clsx(classes.listItem, classes.selectedItem, {
                  [classes.activeItem]: activeId === deviceId,
                }),
              }}
              onAnimationEnd={initSelectedAnimation}
              onClick={() => {
                handleActive(deviceId);
              }}
            >
              <ListItemIcon className={classes.listItemIconSmall}>
                <PinIcon
                  className={classes.pushPinIconActive}
                  fontSize="small"
                  onClick={() => {
                    handleSelect(deviceId);
                  }}
                />
              </ListItemIcon>
              <ListItemIcon className={classes.listItemIcon}>
                <DeviceIcon type={type} className={classes.pinedCameraIcon} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" color="textPrimary">
                    {name}
                  </Typography>
                }
              />
            </ListItem>
          ))}
          {unSelectedCameraList?.map(({ deviceId, name, type }) => (
            <ListItem
              key={deviceId}
              classes={{
                root: clsx(classes.listItem, {
                  [classes.activeItem]: activeId === deviceId,
                }),
              }}
              onClick={() => {
                handleActive(deviceId);
              }}
              onAnimationEnd={initSelectedAnimation}
            >
              <ListItemIcon className={classes.listItemIconSmall}>
                <PinIcon
                  className={classes.pushPinIcon}
                  fontSize="small"
                  onClick={() => {
                    handleSelect(deviceId);
                  }}
                />
              </ListItemIcon>
              <ListItemIcon className={classes.listItemIcon}>
                <DeviceIcon type={type} className={classes.cameraIcon} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" color="textPrimary">
                    {name}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </ExtendablePanel>
    </div>
  );
};

export default memo(DeviceList);
