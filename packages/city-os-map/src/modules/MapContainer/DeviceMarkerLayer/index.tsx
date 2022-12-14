import { LatLngBounds, LatLngBoundsLiteral, Map } from 'leaflet';
import { useMap } from 'react-leaflet';
import { useQuery } from '@apollo/client';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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

import { FilterType, useMapContext } from '../../MapProvider';

import PoleMarker from './PoleMarker';

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

interface DeviceMarkerLayerProps {
  minZoom: number;
  defaultBounds?: LatLngBoundsLiteral;
}

const DeviceMarkerLayer: VoidFunctionComponent<DeviceMarkerLayerProps> = ({
  minZoom,
  defaultBounds,
}: DeviceMarkerLayerProps) => {
  const {
    userProfile: { divisionGroup },
  } = useStore();
  const {
    keyword,
    selectedIdList,
    filterType,
    deviceList,
    showCluster,
    setSelectedIdList,
    setDeviceList,
    setShowCluster,
    setDisableClick,
  } = useMapContext();
  const map = useMap();

  const [mapBounds, setMapBounds] = useState<GPSRectInput | null>(null);
  const [level, setLevel] = useState<number>(minZoom);
  const [clusterList, setClusterList] = useState<DevicesCluster[]>([]);
  const isMountedRef = useIsMountedRef();
  const boundsChangeRef = useRef(false);
  const isMapBoundsInvalid =
    !!mapBounds &&
    (mapBounds.ne?.lat === mapBounds.sw?.lat || mapBounds.ne?.lng === mapBounds.sw?.lng);

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
        type: DeviceType.LAMP,
        gpsRectInput: isMapBoundsInvalid ? null : mapBounds,
        enableSchedule: filterType === FilterType.NO_SCHEDULE ? false : undefined, // undefined would include enable and disable schedule
        keyword,
      },
    },
    skip: !divisionGroup?.id || !map || level < clusterThreshold,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    onCompleted: ({ searchDevicesOnMap: { devices } }) => {
      setDeviceList(devices);
      setClusterList([]);
      setShowCluster(false);
      setDisableClick(false);
      updateLevel();
    },
    onError: () => {
      setDeviceList([]);
      setClusterList([]);
      setShowCluster(false);
      setDisableClick(false);
    },
  });

  useQuery<SearchClustersOnMapResponse, SearchClustersOnMapPayload>(SEARCH_CLUSTERS_ON_MAP, {
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        type: DeviceType.LAMP,
        gpsRectInput: mapBounds,
        enableSchedule: filterType === FilterType.NO_SCHEDULE ? false : undefined, // undefined would include enable and disable schedule
        keyword,
        isDevicesUnderLampActive: filterType === FilterType.ERROR ? false : undefined, // undefined would include active and error devices on lamp
      },
      level,
    },
    skip: !divisionGroup?.id || !map || isMapBoundsInvalid || level >= clusterThreshold,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    onCompleted: ({ searchClustersOnMap: { cluster, gpsRect } }) => {
      setClusterList(cluster);
      setDeviceList([]);
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
      setDeviceList([]);
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

  const markerOnClick = useCallback(
    (device: IDevice) => {
      if (selectedIdList.size === 1 && selectedIdList.has(device.deviceId)) {
        setSelectedIdList(new Set());
      } else {
        setSelectedIdList(new Set([device.deviceId]));
      }
    },
    [selectedIdList, setSelectedIdList],
  );

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
    setDeviceList([]);
    setClusterList([]);
  }, [divisionGroup?.id, map, setDeviceList]);

  if (showCluster)
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

  return (
    <>
      {deviceList.map((device) =>
        device.location ? (
          <PoleMarker
            key={device.deviceId}
            device={device}
            location={device.location}
            isSelected={selectedIdList.has(device.deviceId)}
            onClick={() => {
              markerOnClick(device);
            }}
          />
        ) : null,
      )}
    </>
  );
};

export default memo(DeviceMarkerLayer);
