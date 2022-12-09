import { LatLngBounds, LatLngBoundsLiteral, Map } from 'leaflet';
import { Pane, useMap } from 'react-leaflet';
import { useQuery } from '@apollo/client';
import { useTheme } from '@material-ui/core/styles';
import React, {
  Dispatch,
  SetStateAction,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

import { DeviceType, DevicesCluster } from 'city-os-common/libs/schema';
import {
  SEARCH_CLUSTERS_ON_MAP,
  SearchClustersOnMapPayload,
  SearchClustersOnMapResponse,
} from 'city-os-common/api/searchClustersOnMap';
import {
  SEARCH_DEVICES_ON_MAP,
  SearchDevicesOnMapPayload,
  SearchDevicesOnMapResponse,
} from 'city-os-common/api/searchDevicesOnMap';
import { useStore } from 'city-os-common/reducers';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';
import type { GPSPoint, GPSRectInput, IDevice } from 'city-os-common/libs/schema';

import ClusterMarker from 'city-os-common/modules/map/ClusterMarker';

import { DeviceOnLayers, MarkerLayer, PopupLayer } from './type';
import { useSurveillanceContext } from '../../SurveillanceProvider';

import CameraMarker from './CameraMarker';

const getCurrentBounds = (map: Map) => {
  const bounds = map.getBounds();
  if (!bounds) return null;
  return {
    ne: {
      lat: bounds.getNorthEast().wrap().lat,
      lng: bounds.getNorthEast().wrap().lng,
    },
    sw: {
      lat: bounds.getSouthWest().wrap().lat,
      lng: bounds.getSouthWest().wrap().lng,
    },
  };
};

const clusterThreshold = 15;

interface DeviceMarkerLayersProps {
  mapDevices: IDevice[];
  minZoom: number;
  defaultBounds?: LatLngBoundsLiteral;
  showCluster: boolean;
  setMapDevices: Dispatch<SetStateAction<IDevice[]>>;
  setDisableClick: Dispatch<SetStateAction<boolean>>;
  setShowCluster: Dispatch<SetStateAction<boolean>>;
}

const DeviceMarkerLayers: VoidFunctionComponent<DeviceMarkerLayersProps> = ({
  mapDevices,
  minZoom,
  defaultBounds,
  showCluster,
  setMapDevices,
  setDisableClick,
  setShowCluster,
}: DeviceMarkerLayersProps) => {
  const {
    userProfile: { divisionGroup },
  } = useStore();
  const {
    keyword,
    selectedDevices,
    pageDeviceIds,
    setSelectedDevices,
    setIsUpdating,
    eventDeviceIds,
  } = useSurveillanceContext();
  const map = useMap();
  const theme = useTheme();

  const [mapBounds, setMapBounds] = useState<GPSRectInput | null>(null);
  const [level, setLevel] = useState<number>(minZoom);
  const [previewMarkerId, setPreviewMarkerId] = useState<string>();
  const [clusterList, setClusterList] = useState<DevicesCluster[]>([]);
  const isMountedRef = useIsMountedRef();
  const boundsChangeRef = useRef(false);
  const isMapBoundsInvalid =
    !!mapBounds &&
    (mapBounds.ne?.lat === mapBounds.sw?.lat || mapBounds.ne?.lng === mapBounds.sw?.lng);

  const markerLayerToZIndex = [
    { type: MarkerLayer.NOT_SELECTED, zIndex: theme.zIndex.leaflet.markerDefault },
    { type: MarkerLayer.NOT_ON_PAGE, zIndex: theme.zIndex.leaflet.markerNotOnPage },
    { type: MarkerLayer.ON_PAGE, zIndex: theme.zIndex.leaflet.markerOnPage },
  ];

  const updateLevel = useCallback(() => {
    const currentLevel = map.getZoom();
    if (currentLevel && currentLevel !== level) {
      setLevel(currentLevel);
    }
  }, [level, map]);

  useQuery<SearchDevicesOnMapResponse, SearchDevicesOnMapPayload>(SEARCH_DEVICES_ON_MAP, {
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        type: DeviceType.CAMERA,
        gpsRectInput: isMapBoundsInvalid ? null : mapBounds,
        keyword,
      },
    },
    skip: !divisionGroup?.id || !map || level < clusterThreshold,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    onCompleted: ({ searchDevicesOnMap: { devices } }) => {
      setMapDevices(devices);
      setClusterList([]);
      setShowCluster(false);
      setDisableClick(false);
      updateLevel();
    },
    onError: () => {
      setMapDevices([]);
      setClusterList([]);
      setShowCluster(false);
      setDisableClick(false);
    },
  });

  useQuery<SearchClustersOnMapResponse, SearchClustersOnMapPayload>(SEARCH_CLUSTERS_ON_MAP, {
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        type: DeviceType.CAMERA,
        gpsRectInput: mapBounds,
        keyword,
      },
      level,
    },
    skip: !divisionGroup?.id || !map || isMapBoundsInvalid || level >= clusterThreshold,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    onCompleted: ({ searchClustersOnMap: { gpsRect, cluster } }) => {
      setClusterList(cluster);
      setMapDevices([]);
      setShowCluster(true);
      setDisableClick(false);
      if (gpsRect?.ne && gpsRect.sw) {
        const { ne, sw } = gpsRect;
        const bounds = new LatLngBounds([ne.lat, ne.lng], [sw.lat, sw.lng]);
        map.fitBounds(bounds);
        setMapBounds({
          sw: { lat: sw.lat, lng: sw.lng },
          ne: { lat: ne.lat, lng: ne.lng },
        });
      } else if (!mapBounds) {
        if (!defaultBounds) return;
        map.fitBounds(defaultBounds);
        setMapBounds({
          sw: { lat: defaultBounds?.[0]?.[0], lng: defaultBounds?.[0]?.[1] },
          ne: { lat: defaultBounds?.[1]?.[0], lng: defaultBounds?.[1]?.[1] },
        });
      }
      updateLevel();
    },
    onError: () => {
      setClusterList([]);
      setMapDevices([]);
      setShowCluster(true);
      setDisableClick(false);
    },
  });

  const clusterOnClick = useCallback(
    (location: GPSPoint) => {
      if (map) {
        map.setView(location, level + 3);
      }
    },
    [level, map],
  );

  const onPreviewOpen = useCallback((device: IDevice) => {
    setPreviewMarkerId(device.deviceId);
  }, []);

  const onPreviewClose = useCallback(() => {
    setPreviewMarkerId(undefined);
  }, []);

  const onAddClick = useCallback(
    (device: IDevice) => {
      if (selectedDevices.some(({ deviceId }) => deviceId === device.deviceId)) return;
      const currSelectedDevices = cloneDeep(selectedDevices);
      currSelectedDevices.push({ deviceId: device.deviceId, fixedIndex: null });
      setSelectedDevices(currSelectedDevices);
      setIsUpdating(true);
    },
    [selectedDevices, setSelectedDevices, setIsUpdating],
  );

  const deviceOnLayers = useMemo(() => {
    const result: DeviceOnLayers = {
      [MarkerLayer.NOT_SELECTED]: [],
      [MarkerLayer.NOT_ON_PAGE]: [],
      [MarkerLayer.ON_PAGE]: [],
    };

    mapDevices.forEach((device) => {
      if (!device.location) return;

      const isSelected = selectedDevices.some(({ deviceId }) => deviceId === device.deviceId);
      if (!isSelected) {
        result[MarkerLayer.NOT_SELECTED].push({ device, screenIndex: -1 });
        return;
      }

      const screenIndex = pageDeviceIds.findIndex((deviceId) => deviceId === device.deviceId);
      result[screenIndex < 0 ? MarkerLayer.NOT_ON_PAGE : MarkerLayer.ON_PAGE].push({
        device,
        screenIndex,
      });
    });
    return result;
  }, [mapDevices, pageDeviceIds, selectedDevices]);

  useEffect(() => {
    // avoid setMapBounds with uninitialized map
    if (!map) return () => {};
    let timer: number;
    const handleMove = () => {
      const bounds = getCurrentBounds(map);
      clearTimeout(timer);
      setDisableClick(true);
      timer = window.setTimeout(() => {
        if (boundsChangeRef.current && isMountedRef.current) {
          setMapBounds((prevBounds) => (isEqual(bounds, prevBounds) ? prevBounds : bounds));
          setLevel(map.getZoom());
        }
        boundsChangeRef.current = true;
      }, 1000);
    };
    map.addEventListener('move', handleMove);
    return () => {
      map.removeEventListener('move', handleMove);
      clearTimeout(timer);
    };
  }, [isMountedRef, map, setDisableClick]);

  useEffect(() => {
    setMapBounds(null);
    setLevel(minZoom);
  }, [divisionGroup?.id, minZoom]);

  useEffect(() => {
    if (divisionGroup?.id && map) return;
    setMapDevices([]);
    setClusterList([]);
  }, [divisionGroup?.id, map, setMapDevices]);

  if (showCluster) {
    return (
      <>
        {clusterList.map(({ location, count }, idx) => (
          <ClusterMarker
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            location={location}
            count={count}
            onClick={() => {
              clusterOnClick(location);
            }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {markerLayerToZIndex.map(({ type, zIndex }) => (
        <Pane key={type} name={type} style={{ zIndex }}>
          {deviceOnLayers[type].map(({ device, screenIndex }) => (
            <CameraMarker
              key={device.deviceId}
              device={device}
              detectedType={eventDeviceIds.includes(device.deviceId) ? 'highlight' : undefined}
              showPreview={device.deviceId === previewMarkerId}
              isSelected={type !== MarkerLayer.NOT_SELECTED}
              onPreviewOpen={onPreviewOpen}
              onPreviewClose={onPreviewClose}
              onAddClick={onAddClick}
              selectedLabel={
                type === MarkerLayer.ON_PAGE ? (screenIndex + 1).toString() : undefined
              }
              zIndexOffset={type === MarkerLayer.ON_PAGE ? screenIndex : undefined}
            />
          ))}
        </Pane>
      ))}
      <Pane
        name={PopupLayer.PREVIEW_ICON}
        style={{ zIndex: theme.zIndex.leaflet.popupPreviewIcon }}
      />
    </>
  );
};

export default memo(DeviceMarkerLayers);
