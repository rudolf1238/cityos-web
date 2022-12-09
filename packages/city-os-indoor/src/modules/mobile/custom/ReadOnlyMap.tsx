import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';

import { LatLng, Map as LeafletMapClass } from 'leaflet';

import BaseMapContainer from 'city-os-common/modules/map/BaseMapContainer';

const useStyles = makeStyles((_theme) => ({
  root: {
    width: '100%',
    height: '100%',
  },
}));

interface BuildingMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  styles?: {
    borderRadius?: number;
  };
}

const BuildingMap: VoidFunctionComponent<BuildingMapProps> = (props: BuildingMapProps) => {
  const { lat, lng, zoom = 16, styles } = props;
  const classes = useStyles();

  const [map, setMap] = useState<LeafletMapClass | null>(null);
  const mapCenter = useMemo(() => new LatLng(lat, lng), [lat, lng]);

  useEffect(() => {
    map?.setView(mapCenter);
  }, [map, mapCenter]);

  return (
    <BaseMapContainer
      whenCreated={setMap}
      center={mapCenter}
      zoom={zoom}
      className={classes.root}
      disableDraw
      doubleClickZoom={false}
      closePopupOnClick={false}
      dragging={false}
      trackResize={false}
      touchZoom={false}
      scrollWheelZoom={false}
      attributionControl={false}
      zoomControl={false}
      style={{ zIndex: 0, ...styles }}
    >
      {null}
    </BaseMapContainer>
  );
};

export default memo(BuildingMap);
