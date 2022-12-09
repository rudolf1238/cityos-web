import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useMemo, useRef } from 'react';

import Box from '@material-ui/core/Box';

import { LatLng, Marker as LeafletMarker } from 'leaflet';
import clsx from 'clsx';

import { IDevice } from 'city-os-common/libs/schema';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';

import { getAttrByKey } from '../../libs/utils';

import DivIconMarker from './DivIconMarker';

const useStyles = makeStyles((theme) => ({
  markerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(5),
    height: theme.spacing(5),
    marginTop: -12,
    marginLeft: -12,
    position: 'relative',
    backgroundColor: '#25b2ff',
    borderRadius: '100%',
    color: '#fff',
  },

  editMode: {
    pointerEvents: 'none',
    opacity: 0.3,
  },

  removeBtn: {
    width: 16,
    height: 16,
    borderRadius: '100%',
    top: -3,
    right: -1,
    backgroundColor: '#fff',
    border: '1.25px solid #FB7181',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#FB7181',
  },

  onMarkerBtn: {
    position: 'absolute',
    zIndex: 300,
  },
}));

export interface ActiveDeviceMarkerLayerProps {
  deviceList: IDevice[];
  handleMarkerClick?: (e: React.MouseEvent<HTMLDivElement>, device?: IDevice) => void;
  editMode?: boolean;
  handleMarkerLocationChange?: (x: number, y: number) => void;
  handleMarkerRemove?: (device: IDevice) => void;
}

const ActiveDeviceMarkerLayer: VoidFunctionComponent<ActiveDeviceMarkerLayerProps> = (
  props: ActiveDeviceMarkerLayerProps,
) => {
  const {
    deviceList,
    handleMarkerClick = () => {},
    editMode = false,
    handleMarkerLocationChange = () => {},
    handleMarkerRemove = () => {},
  } = props;

  const classes = useStyles();
  const markerRef = useRef<LeafletMarker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          handleMarkerLocationChange(marker.getLatLng().lng, marker.getLatLng().lat);
        }
      },
    }),
    [handleMarkerLocationChange],
  );

  const handleRemoveButton = (
    _e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>,
    device: IDevice,
  ) => {
    handleMarkerRemove(device);
  };

  return (
    <>
      {deviceList.map((device: IDevice, _index: number) => (
        <DivIconMarker
          key={`active-device-marker-${device.deviceId}`}
          markerKey={`active-device-marker-${device.deviceId}`}
          markerProps={{
            position: new LatLng(
              Number(getAttrByKey(device.attributes || [], 'y')?.value || 0),
              Number(getAttrByKey(device.attributes || [], 'x')?.value || 0),
            ),
            draggable: true,
            eventHandlers,
          }}
          markerRef={markerRef}
          container={{ tagName: 'span' }}
        >
          <Box
            component="div"
            className={clsx(classes.markerContainer, { [classes.editMode]: editMode })}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              handleMarkerClick(e, device);
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <div
              className={clsx(classes.onMarkerBtn, classes.removeBtn)}
              onClick={(e) => {
                handleRemoveButton(e, device);
              }}
              onKeyDown={(e) => {
                handleRemoveButton(e, device);
              }}
              role="button"
              tabIndex={0}
            >
              <div style={{ height: '1.25px', backgroundColor: '#FB7181', width: '8px' }} />
            </div>

            <DeviceIcon type={device.type} />
          </Box>
        </DivIconMarker>
      ))}
    </>
  );
};

export default memo(ActiveDeviceMarkerLayer);
