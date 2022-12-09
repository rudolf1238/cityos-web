import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';

import { useRouter } from 'next/router';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';

import AppsIcon from '@material-ui/icons/Apps';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import ButtonBase from '@material-ui/core/ButtonBase';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Menu from '@material-ui/core/Menu';
import Paper from '@material-ui/core/Paper';
import Skeleton from '@material-ui/lab/Skeleton';
import SubjectIcon from '@material-ui/icons/Subject';
import TextField from '@material-ui/core/TextField';

import { Action, DeviceType, IDevice, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import Guard from 'city-os-common/modules/Guard';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { Building, Query } from '../../libs/type';
import {
  GET_FULL_BUILDINGS,
  GetFullBuildingsPayload,
  GetFullBuildingsResponse,
} from '../../api/getFullBuildings';
import { getAttrByKey, getDeviceAddress } from '../../libs/utils';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';
import usePreviousRoute from './hooks/usePreviousRoute';

import DeviceCard from './custom/DeviceCard';
import DeviceDetailDialog from './custom/DeviceDetailDialog';
import I18nIndoorProvider from '../I18nIndoorProvider';
import IndoorLampCard from './custom/DeviceTypeCard/IndoorLampCard';
import LampCard from './custom/DeviceTypeCard/LampCard';
import RedirectButton from './common/RedirectButton';
import ResponsiveMainLayout from './common/ResponsiveMainLayout';

const smallDeviceTypeList = [DeviceType.INDOOR_LAMP];
const mediumDeviceTypeList = [DeviceType.LAMP];

const PAGE_SIZE = 5;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
  },

  redirectButton: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing(3),
    },
    marginBottom: theme.spacing(1.5),
  },

  buildingInfo: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },

  menuPaper: {
    backgroundColor: theme.palette.background.container,
    padding: theme.spacing(1),
  },

  menuList: {
    paddingBottom: 0,
    maxHeight: '75vh',
    maxWidth: theme.spacing(31),
    display: 'flex',
    gap: theme.spacing(0.5),
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  chipLabel: {
    color: theme.palette.grey[700],
    fontWeight: 500,
    fontSize: 14,
  },

  chip: {
    '&:hover': {
      backgroundColor: `${theme.palette.themeIconButton.hoverStandard} !important`,
    },
  },
}));

const MobileIndoorDetailPage: VoidFunctionComponent = () => {
  const classes = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const routerQuery: Query = useMemo(() => router.query, [router.query]);
  const { t: tIndoor } = useIndoorTranslation(['common', 'indoor']);
  const {
    userProfile: { permissionGroup, profile: userProfile },
  } = useStore();
  const previousRoute = usePreviousRoute();
  const { tDevice } = useDeviceTranslation();

  const [building, setBuilding] = useState<Building | null>(null);
  const [deviceList, setDeviceList] = useState<IDevice[]>([]);
  const [detailMode, setDetailMode] = useState<boolean>(false);
  const [targetDeviceType, setTargetDeviceType] = useState<IDevice['type'] | null>(null);
  const [targetFloorNumber, setTargetFloorNumber] = useState<
    Building['floors'][0]['floorNum'] | null
  >(null);
  const [page, setPage] = useState<number>(0);

  const filteredDeviceList = useMemo(
    () =>
      building?.floors
        .filter((floor) => floor.floorNum === targetFloorNumber || targetFloorNumber === null)
        .flatMap((floor) => floor.devices)
        .filter(({ type }) => type === targetDeviceType || targetDeviceType === null) || [],
    [building?.floors, targetDeviceType, targetFloorNumber],
  );

  const showableDeviceList = useMemo(
    () => filteredDeviceList.slice(PAGE_SIZE * page, PAGE_SIZE * (page + 1)),
    [filteredDeviceList, page],
  );

  const maxPage = useMemo(
    () => Math.ceil(filteredDeviceList.length / PAGE_SIZE),
    [filteredDeviceList],
  );

  const [smallDeviceList, mediumDeviceList] = useMemo(() => {
    const currentSmallDeviceList = deviceList.filter(({ type }) =>
      smallDeviceTypeList.includes(type),
    );
    const currentMediumDeviceList = deviceList.filter(({ type }) =>
      mediumDeviceTypeList.includes(type),
    );

    return [currentSmallDeviceList, currentMediumDeviceList];
  }, [deviceList]);

  const [selectedDeviceId, setSelectedDeviceId] = useState<IDevice['deviceId'] | null>(null);

  const { refetch } = useQuery<GetFullBuildingsResponse, GetFullBuildingsPayload>(
    GET_FULL_BUILDINGS,
    {
      variables: {
        groupId: permissionGroup?.group.id || '',
        filter: { deviceId: routerQuery.deviceId || '' },
      },
      onCompleted: (data) => {
        if (data && data.getBuildings.edges.length > 0) {
          const newBuilding = data.getBuildings.edges[0].node;
          setBuilding(newBuilding);
          setDeviceList(newBuilding.floors.flatMap((floor) => floor.devices));
        } else {
          setBuilding(null);
          setDeviceList([]);
        }
      },
      onError: (error) => {
        if (D_DEBUG) console.error(error.graphQLErrors);
      },
      skip: !permissionGroup?.group.id,
    },
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const ReadOnlyMapLoading = useMemo(
    () => <Skeleton variant="rect" style={{ width: '100%', height: '100%' }} />,
    [],
  );

  const ReadOnlyMap = useMemo(
    () =>
      dynamic(() => import('./custom/ReadOnlyMap'), {
        loading: () => ReadOnlyMapLoading,
        ssr: false,
      }),
    [ReadOnlyMapLoading],
  );

  const handleSelectDevice = useCallback((deviceId: IDevice['deviceId']) => {
    setSelectedDeviceId(deviceId);
  }, []);

  // 選取設備類型

  const [deviceTypeSelectorAnchorEl, setDeviceTypeSelectorAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isDeviceTypeSelectorOpen = useMemo(
    () => deviceTypeSelectorAnchorEl !== null,
    [deviceTypeSelectorAnchorEl],
  );

  const handleDeviceTypeSelectorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDeviceTypeSelectorAnchorEl(event.currentTarget);
  };

  const handleDeviceTypeSelectorClose = () => {
    setDeviceTypeSelectorAnchorEl(null);
  };

  const handleDeviceTypeChange = (type: DeviceType | null) => {
    setTargetDeviceType(type);
  };

  // 選取樓層

  const [floorNumberSelectorAnchorEl, setFloorNumberSelectorAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isFloorNumberSelectorOpen = useMemo(
    () => floorNumberSelectorAnchorEl !== null,
    [floorNumberSelectorAnchorEl],
  );

  const handleFloorNumberSelectorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFloorNumberSelectorAnchorEl(event.currentTarget);
  };

  const handleFloorNumberSelectorClose = () => {
    setFloorNumberSelectorAnchorEl(null);
  };

  const handleFloorNumberChange = (floorNumber: Building['floors'][0]['floorNum'] | null) => {
    setTargetFloorNumber(floorNumber);
  };

  return (
    <I18nIndoorProvider>
      <ResponsiveMainLayout>
        <Guard subject={Subject.INDOOR} action={Action.VIEW}>
          <Container>
            <Box className={classes.root}>
              <RedirectButton
                classes={{ root: classes.redirectButton }}
                link={
                  previousRoute
                    ? { label: tIndoor('common:List'), pathname: '/mobile/indoor/list' }
                    : undefined
                }
              >
                <div style={{ display: 'flex', gap: theme.spacing(1), marginLeft: 'auto' }}>
                  {detailMode || (
                    <div>
                      <ButtonBase
                        style={{ borderRadius: 32 }}
                        onClick={handleFloorNumberSelectorClick}
                      >
                        <Chip
                          label={targetFloorNumber ?? 'ALL'}
                          style={{
                            backgroundColor: theme.palette.themeIconButton.outlined,
                            cursor: 'pointer',
                          }}
                          classes={{
                            label: classes.chipLabel,
                            root: classes.chip,
                          }}
                        />
                      </ButtonBase>
                      <Menu
                        style={{ marginTop: 32 }}
                        keepMounted
                        anchorEl={floorNumberSelectorAnchorEl}
                        open={isFloorNumberSelectorOpen}
                        onClose={handleFloorNumberSelectorClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}
                        classes={{
                          paper: classes.menuPaper,
                          list: classes.menuList,
                        }}
                      >
                        <ButtonBase
                          style={{ borderRadius: 32 }}
                          onClick={() => {
                            void handleFloorNumberChange(null);
                          }}
                        >
                          <Chip
                            label="ALL"
                            style={{
                              backgroundColor: theme.palette.themeIconButton.outlined,
                              cursor: 'pointer',
                            }}
                            classes={{
                              label: classes.chipLabel,
                              root: classes.chip,
                            }}
                          />
                        </ButtonBase>
                        {building?.floors.map((floor) => (
                          <ButtonBase
                            style={{ borderRadius: 32 }}
                            onClick={() => {
                              void handleFloorNumberChange(floor.floorNum);
                            }}
                          >
                            <Chip
                              label={floor.floorNum}
                              style={{
                                backgroundColor: theme.palette.themeIconButton.outlined,
                                cursor: 'pointer',
                              }}
                              classes={{
                                label: classes.chipLabel,
                                root: classes.chip,
                              }}
                            />
                          </ButtonBase>
                        ))}
                      </Menu>
                    </div>
                  )}
                  {detailMode || (
                    <div>
                      <ThemeIconButton
                        size="small"
                        style={{ width: 32, height: 32 }}
                        onClick={handleDeviceTypeSelectorClick}
                      >
                        {targetDeviceType ? (
                          <DeviceIcon
                            type={targetDeviceType}
                            style={{ color: theme.palette.primary.main, width: 18 }}
                          />
                        ) : (
                          <Avatar
                            style={{
                              width: 32,
                              height: 32,
                              fontSize: 18,
                              fontWeight: 500,
                              color: theme.palette.grey[700],
                              backgroundColor: theme.palette.themeIconButton.outlined,
                            }}
                          >
                            A
                          </Avatar>
                        )}
                      </ThemeIconButton>
                      <Menu
                        keepMounted
                        anchorEl={deviceTypeSelectorAnchorEl}
                        open={isDeviceTypeSelectorOpen}
                        onClose={handleDeviceTypeSelectorClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}
                        classes={{
                          paper: classes.menuPaper,
                          list: classes.menuList,
                        }}
                      >
                        <Chip
                          style={{
                            height: 32,
                            fontSize: 14,
                            fontWeight: 500,
                            color:
                              targetDeviceType === null
                                ? theme.palette.primary.main
                                : theme.palette.grey[700],
                            backgroundColor: theme.palette.themeIconButton.outlined,
                          }}
                          label={tIndoor('common:All')}
                          onClick={() => {
                            void handleDeviceTypeChange(null);
                          }}
                        />
                        {(Object.keys(DeviceType) as DeviceType[]).map((key) => (
                          <Chip
                            style={{
                              paddingLeft: 8,
                              paddingRight: 4,
                              height: 32,
                              fontSize: 14,
                              fontWeight: 500,
                              color:
                                targetDeviceType === null
                                  ? theme.palette.primary.main
                                  : theme.palette.grey[700],
                              backgroundColor: theme.palette.themeIconButton.outlined,
                            }}
                            avatar={
                              <DeviceIcon
                                type={key}
                                style={{
                                  color:
                                    targetDeviceType === key
                                      ? theme.palette.primary.main
                                      : theme.palette.grey[700],
                                  width: 18,
                                }}
                              />
                            }
                            label={tDevice(key)}
                            onClick={() => {
                              void handleDeviceTypeChange(key);
                            }}
                          />
                        ))}
                      </Menu>
                    </div>
                  )}
                  <ThemeIconButton
                    size="small"
                    style={{ width: 32, height: 32 }}
                    onClick={() => {
                      setDetailMode(!detailMode);
                    }}
                  >
                    {detailMode ? (
                      <AppsIcon
                        style={{
                          color: theme.palette.primary.main,
                          fontSize: 20,
                        }}
                      />
                    ) : (
                      <SubjectIcon
                        style={{
                          color:
                            theme.palette.type === 'dark'
                              ? 'rgba(255, 255, 255, 0.7)'
                              : 'rgba(0, 0, 0, 0.7)',
                          fontSize: 20,
                        }}
                      />
                    )}
                  </ThemeIconButton>
                </div>
              </RedirectButton>
              {building && (
                <Paper style={{ borderRadius: 16 }}>
                  <div className={classes.buildingInfo}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: theme.spacing(1.5),
                      }}
                    >
                      <div
                        style={{
                          width: 'calc(100% - 119px)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: theme.spacing(2),
                        }}
                      >
                        <TextField
                          label={tIndoor('indoor:Building Name')}
                          variant="outlined"
                          inputProps={{
                            readOnly: true,
                          }}
                          value={building.name}
                        />
                        <TextField
                          label={tIndoor('indoor:Building Type')}
                          variant="outlined"
                          inputProps={{
                            readOnly: true,
                          }}
                          value={
                            building.attributes
                              ? getAttrByKey(building.attributes, 'building_type').value
                              : ''
                          }
                        />
                      </div>
                      <div style={{ width: 128, height: 128, borderRadius: 8 }}>
                        <ReadOnlyMap
                          lat={building.location?.lat || 0}
                          lng={building.location?.lng || 0}
                          styles={{ borderRadius: 8 }}
                        />
                      </div>
                    </div>
                    <TextField
                      label={tIndoor('indoor:Address')}
                      fullWidth
                      variant="outlined"
                      inputProps={{
                        readOnly: true,
                      }}
                      value={
                        building.address
                          ? getDeviceAddress(building.address, userProfile?.language)
                          : ''
                      }
                    />
                    <TextField
                      label={tIndoor('indoor:Description')}
                      fullWidth
                      multiline
                      rows={2}
                      variant="outlined"
                      inputProps={{
                        readOnly: true,
                      }}
                      value={building.desc}
                    />
                  </div>
                </Paper>
              )}
              {building && (
                <Grid
                  container
                  style={{
                    marginTop: theme.spacing(2),
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: theme.spacing(1.5),
                  }}
                >
                  {detailMode &&
                    smallDeviceList.map((device) => (
                      <Grid
                        item
                        key={`small-block-${device.id}`}
                        style={{ width: 'calc(50% - 6px)' }}
                      >
                        <IndoorLampCard
                          label={device.name}
                          type={device.type}
                          deviceId={device.deviceId}
                          onClick={handleSelectDevice}
                        />
                      </Grid>
                    ))}
                  {detailMode &&
                    mediumDeviceList.map((device) => (
                      <Grid item key={`medium-block-${device.id}`} xs={12}>
                        <LampCard
                          label={device.name}
                          type={device.type}
                          deviceId={device.deviceId}
                          onClick={handleSelectDevice}
                        />
                      </Grid>
                    ))}
                  {detailMode ||
                    showableDeviceList.map((device) => (
                      <Grid item xs={12} key={`otherDeviceList-${device.id}`}>
                        <DeviceCard
                          label={device.name}
                          type={device.type}
                          deviceId={device.deviceId}
                          onClick={handleSelectDevice}
                        />
                      </Grid>
                    ))}
                </Grid>
              )}
              <div
                style={{
                  marginTop: 18,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 12,
                }}
              >
                <ThemeIconButton
                  size="small"
                  style={{ height: 44, width: 44 }}
                  variant="contained"
                  disabled={page <= 0}
                  onClick={() => {
                    setPage(page - 1);
                  }}
                >
                  <KeyboardArrowLeftIcon />
                </ThemeIconButton>
                <ThemeIconButton
                  size="small"
                  style={{ height: 44, width: 44 }}
                  disabled={page >= maxPage - 1}
                  variant="contained"
                  onClick={() => {
                    setPage(page + 1);
                  }}
                >
                  <KeyboardArrowRightIcon />
                </ThemeIconButton>
              </div>
            </Box>
          </Container>
          <DeviceDetailDialog
            open={!!selectedDeviceId}
            deviceId={selectedDeviceId || ''}
            onClose={() => {
              setSelectedDeviceId(null);
            }}
          />
        </Guard>
      </ResponsiveMainLayout>
    </I18nIndoorProvider>
  );
};

export default memo(MobileIndoorDetailPage);
