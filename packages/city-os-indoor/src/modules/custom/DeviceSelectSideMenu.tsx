import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';

import { useRouter } from 'next/router';
import React, {
  RefObject,
  UIEventHandler,
  VoidFunctionComponent,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import clsx from 'clsx';

import AddIcon from '@material-ui/icons/Add';

import { IDevice } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import ExtendablePanel from 'city-os-common/modules/ExtendablePanel';
import Img from 'city-os-common/modules/Img';
import SearchFieldLite from 'city-os-common/modules/SearchFieldLite';

import { Building, Query } from '../../libs/type';
import {
  GET_DEVICES_FOR_BUILDING,
  GetDevicesForBuildingOnIndoorPayload,
  GetDevicesForBuildingOnIndoorResponse,
  PartialNode,
} from '../../api/getDevicesForBuildingOnIndoor';
import {
  GET_FULL_BUILDINGS,
  GetFullBuildingsPayload,
  GetFullBuildingsResponse,
} from '../../api/getFullBuildings';
import { useEditorPageContext } from '../EditorPageProvider';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';

const useStyles = makeStyles((theme) => ({
  selectedMenu: {
    zIndex: theme.zIndex.speedDial,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[10],
  },

  paper: {
    display: 'flex',
    flexDirection: 'column',
  },

  extendablePanel: {
    height: '100%',
    position: 'relative',
  },

  toggle: {
    top: theme.spacing(14),
  },

  openMenu: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  menuHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 2, 2, 2),
  },

  menuBody: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing(0, 2.5, 2, 2.5),
    gap: theme.spacing(1),
    overflow: 'overlay',
  },

  cameraBox: {
    width: 141,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing(1),
  },

  cameraBoxImage: {
    borderRadius: theme.spacing(1),
    width: 141,
    height: 79,
    position: 'relative',
  },

  cameraBoxImageFallback: {
    border: `2px solid ${theme.palette.primary.main}`,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraBoxImageFallbackIcon: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    width: theme.spacing(5),
    height: theme.spacing(5),
    padding: theme.spacing(1),
    color: '#fff',
  },

  cameraBoxLabel: {
    width: '100%',
    color: theme.palette.text.primary,
    fontSize: 12,
    textAlign: 'center',
  },

  cameraHoverBox: {
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: theme.spacing(1),
    opacity: 0,
    cursor: 'pointer',

    '&:hover': {
      opacity: 1,
    },
  },

  cameraHoverBoxIcon: {
    color: theme.palette.primary.main,
  },

  loadingMusk: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: theme.zIndex.speedDial,
  },

  searchFieldLite: {
    width: 'unset',
  },
}));

const isBottom = (scrollRef: RefObject<HTMLDivElement>) =>
  scrollRef.current &&
  scrollRef.current.scrollTop + scrollRef.current.clientHeight + 200 >=
    scrollRef.current.scrollHeight;

interface DeviceSelectSideMenuProps {
  open: boolean;
  onToggle: (isOpen: boolean) => void;
}

const DeviceSelectSideMenu: VoidFunctionComponent<DeviceSelectSideMenuProps> = ({
  open,
  onToggle,
}: DeviceSelectSideMenuProps) => {
  const classes = useStyles();
  const { t: tIndoor } = useIndoorTranslation();
  const { isMapEdit, building, setBuilding, floor, map, setActiveId } = useEditorPageContext();

  const menuScrollRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const routerQuery: Query = useMemo(() => router.query, [router.query]);

  const {
    userProfile: { permissionGroup },
  } = useStore();

  const [keyword, setKeyword] = useState<string | null>(null);

  const handleSearch = useCallback((currentKeyword: string | null) => {
    setKeyword(currentKeyword);
  }, []);

  const handleClearSearch = useCallback(() => {
    setKeyword(null);
  }, []);

  const checkIsSelected = useCallback(
    (deviceId: string) =>
      (
        building?.floors
          .flatMap((item) => item.devices)
          .filter((device) => device.deviceId === deviceId) || []
      ).length > 0,
    [building],
  );

  // ? 計算列表的值會需要取得建築原始的建築列表

  const [initDeviceList, setInitDeviceList] = useState<IDevice[]>([]);

  void useQuery<GetFullBuildingsResponse, GetFullBuildingsPayload>(GET_FULL_BUILDINGS, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      filter: { deviceId: routerQuery.deviceId || '' },
    },
    onCompleted: ({ getBuildings }) => {
      setInitDeviceList(getBuildings.edges[0].node.floors.flatMap((item) => item.devices));
    },
    onError: (error) => {
      if (D_DEBUG) console.error(error.graphQLErrors);
    },
    skip: !permissionGroup?.group.id,
  });

  const mergeSearchDevices = (
    previousQueryResult: GetDevicesForBuildingOnIndoorResponse,
    fetchMoreResult: GetDevicesForBuildingOnIndoorResponse | undefined,
  ) => {
    if (!fetchMoreResult) return previousQueryResult;
    if (!previousQueryResult.searchDevicesForBuilding) return fetchMoreResult;
    return {
      searchDevicesForBuilding: {
        ...fetchMoreResult.searchDevicesForBuilding,
        edges: [
          ...previousQueryResult.searchDevicesForBuilding.edges,
          ...fetchMoreResult.searchDevicesForBuilding.edges,
        ],
      },
    };
  };

  const {
    data: getDevicesData,
    refetch,
    fetchMore,
    loading,
  } = useQuery<GetDevicesForBuildingOnIndoorResponse, GetDevicesForBuildingOnIndoorPayload>(
    GET_DEVICES_FOR_BUILDING,
    {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
      variables: {
        groupId: routerQuery?.groupId || permissionGroup?.group.id || '',
        deviceId: routerQuery?.deviceId || '',
        keyword,
      },
      onError: (error) => {
        if (D_DEBUG) console.error(error.graphQLErrors);
      },
      onCompleted: ({ searchDevicesForBuilding: { pageInfo } }) => {
        if (pageInfo.hasNextPage) {
          void fetchMore({
            variables: { after: pageInfo.endCursor },
            updateQuery: (previousQueryResult, { fetchMoreResult }) => {
              return mergeSearchDevices(previousQueryResult, fetchMoreResult);
            },
          });
        }
      },
    },
  );

  React.useEffect(() => {
    void refetch();
  }, [refetch]);

  const currentDeviceList = React.useMemo(
    () =>
      [
        ...(getDevicesData?.searchDevicesForBuilding.edges || []),
        ...initDeviceList.map((device) => ({
          node: device,
        })),
      ].filter((device) => !checkIsSelected(device.node.deviceId)),
    [checkIsSelected, initDeviceList, getDevicesData?.searchDevicesForBuilding.edges],
  );

  const handleAddCamera = useCallback(
    (
      _e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>,
      camera: {
        node: PartialNode;
      },
    ) => {
      const buildingClone = JSON.parse(JSON.stringify(building)) as Building;
      if (floor && buildingClone.floors) {
        const floorIndex = buildingClone.floors.findIndex((f) => f.id === floor.id);

        // TODO: 需要改成 update 語法，編解 JSON 雖然能解決問題，但太麻煩了
        const newDevice = JSON.parse(JSON.stringify(camera.node)) as IDevice;

        const newDeviceAttributes = [...(newDevice.attributes || [])];

        if (newDeviceAttributes !== null) {
          const xIndex = newDeviceAttributes.findIndex((a) => a.key === 'x');
          const yIndex = newDeviceAttributes.findIndex((a) => a.key === 'y');

          const x =
            (map?.getBounds().getSouthEast().lng || 0) * 0.95 +
            (map?.getBounds().getSouthWest().lng || 0) * 0.05;

          if (xIndex >= 0) {
            newDeviceAttributes[xIndex] = {
              key: 'x',
              value: String(x),
            };
          } else {
            newDeviceAttributes.push({
              key: 'x',
              value: String(x),
            });
          }

          const y =
            (map?.getBounds().getSouthEast().lat || 0) * 0.9 +
            (map?.getBounds().getNorthEast().lat || 0) * 0.1;

          if (yIndex >= 0) {
            newDeviceAttributes[yIndex] = {
              key: 'y',
              value: String(y),
            };
          } else {
            newDeviceAttributes.push({
              key: 'y',
              value: String(y),
            });
          }
          newDevice.attributes = newDeviceAttributes;
          buildingClone.floors[floorIndex].devices.push(newDevice);
          if (buildingClone) {
            setBuilding(buildingClone);
            setActiveId(newDevice.deviceId);
          }
        }
      }
    },
    [building, floor, map, setActiveId, setBuilding],
  );

  const fetchNextPage = useCallback(
    async (after?: string) => {
      let updatedRes: GetDevicesForBuildingOnIndoorResponse | undefined;
      await fetchMore({
        variables: { after: after || getDevicesData?.searchDevicesForBuilding.pageInfo.endCursor },
        updateQuery: (previousQueryResult, { fetchMoreResult }) => {
          const newResult = mergeSearchDevices(previousQueryResult, fetchMoreResult);
          updatedRes = newResult;
          return newResult;
        },
      });
      return updatedRes;
    },
    [fetchMore, getDevicesData?.searchDevicesForBuilding.pageInfo.endCursor],
  );

  const handleScroll: UIEventHandler = useCallback(() => {
    const pageInfo = getDevicesData?.searchDevicesForBuilding.pageInfo;
    if (!loading && pageInfo?.hasNextPage && isBottom(menuScrollRef)) {
      void fetchNextPage(pageInfo.endCursor);
    }
  }, [fetchNextPage, getDevicesData?.searchDevicesForBuilding.pageInfo, loading]);

  return (
    <div className={classes.selectedMenu}>
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
        {isMapEdit && <div className={classes.loadingMusk} />}
        <div className={classes.openMenu}>
          <div className={classes.menuHeader}>
            <SearchFieldLite
              className={classes.searchFieldLite}
              placeholder={tIndoor('common:Please enter the keyword_')}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          </div>
          <div className={classes.menuBody} ref={menuScrollRef} onScroll={handleScroll}>
            {currentDeviceList.map((device, index) => (
              <div className={classes.cameraBox} key={device.node.id}>
                <div
                  onClick={(e) => {
                    handleAddCamera(e, device);
                  }}
                  onKeyDown={(e) => {
                    handleAddCamera(e, device);
                  }}
                  role="button"
                  tabIndex={index}
                >
                  <Img
                    id={device.node?.imageIds ? device.node?.imageIds[0] : ''}
                    className={classes.cameraBoxImage}
                    style={{
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                    fallback={
                      <div className={clsx(classes.cameraBoxImage, classes.cameraBoxImageFallback)}>
                        <DeviceIcon
                          type={device.node?.type}
                          className={classes.cameraBoxImageFallbackIcon}
                          style={{ position: 'absolute' }}
                        />
                        <div className={classes.cameraHoverBox} style={{ position: 'absolute' }}>
                          <AddIcon className={classes.cameraHoverBoxIcon} />
                        </div>
                      </div>
                    }
                  >
                    <div className={classes.cameraHoverBox}>
                      <AddIcon className={classes.cameraHoverBoxIcon} />
                    </div>
                  </Img>
                </div>
                <span className={classes.cameraBoxLabel}>{device.node.name}</span>
              </div>
            ))}
          </div>
        </div>
      </ExtendablePanel>
    </div>
  );
};

export default memo(DeviceSelectSideMenu);
