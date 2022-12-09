import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, useMemo, useRef } from 'react';

import Box from '@material-ui/core/Box';

import { LatLng, Marker as LeafletMarker } from 'leaflet';
import clsx from 'clsx';

import { IDevice } from 'city-os-common/libs/schema';

import { getAttrByKey } from '../../libs/utils';

import CameraIcon from '../common/CameraIcon';
import CursorRotateIcon from '../../assets/icon/cursor-rotate.svg';
import DivIconMarker from './DivIconMarker';

const getDirection = (device: IDevice) =>
  Number(getAttrByKey(device.attributes || [], 'direction')?.value || -1);

const useStyles = makeStyles((theme) => ({
  markerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(15),
    height: theme.spacing(15),
    marginTop: -52,
    marginLeft: -52,
    position: 'relative',
  },

  editMode: {
    pointerEvents: 'none', // 點擊穿透，在編輯圖層模式下要能操控底圖
    opacity: 0.3,
  },

  removeBtn: {
    opacity: 0,
    width: 15,
    height: 15,
    borderRadius: '100%',
    top: 38,
    right: 36,
  },

  onMarkerBtn: {
    position: 'absolute',
    zIndex: 300,
  },

  degree45: {
    right: 4,
    transform: 'rotate(90deg)',
  },

  degree135: {
    bottom: 0,
    transform: 'rotate(180deg)',
  },

  degree225: {
    left: 4,
    transform: 'rotate(270deg)',
  },

  degree315: {
    top: 0,
  },
}));

export interface ActiveCameraMarkerLayerProps {
  deviceList: IDevice[];
  handleMarkerClick?: (e: React.MouseEvent<HTMLDivElement>, device?: IDevice) => void;
  editMode?: boolean;
  handleMarkerLocationChange?: (x: number, y: number) => void;
  handleMarkerDegreeChange?: (degree: number) => void;
  handleMarkerRemove?: (device: IDevice) => void;
}

const ActiveCameraMarkerLayer: VoidFunctionComponent<ActiveCameraMarkerLayerProps> = (
  props: ActiveCameraMarkerLayerProps,
) => {
  const {
    deviceList,
    handleMarkerClick = () => {},
    editMode = false,
    handleMarkerLocationChange = () => {},
    handleMarkerDegreeChange = () => {},
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

  const handleMarkerDegreeButton = (
    _e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>,
    degree: number,
  ) => {
    handleMarkerDegreeChange(degree);
  };

  return (
    <>
      {deviceList.map((device: IDevice, _index: number) => (
        <DivIconMarker
          key={`active-camera-marker-${device.deviceId}`}
          markerKey={`active-camera-marker-${device.deviceId}`}
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
            />

            {getDirection(device) !== -1 && (
              <>
                <div
                  className={clsx(classes.onMarkerBtn, classes.degree45)}
                  onClick={(e) => {
                    handleMarkerDegreeButton(e, 2);
                  }}
                  onKeyDown={(e) => {
                    handleMarkerDegreeButton(e, 2);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <CursorRotateIcon />
                </div>
                <div
                  className={clsx(classes.onMarkerBtn, classes.degree135)}
                  onClick={(e) => {
                    handleMarkerDegreeButton(e, 4);
                  }}
                  onKeyDown={(e) => {
                    handleMarkerDegreeButton(e, 4);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <CursorRotateIcon />
                </div>
                <div
                  className={clsx(classes.onMarkerBtn, classes.degree225)}
                  onClick={(e) => {
                    handleMarkerDegreeButton(e, 6);
                  }}
                  onKeyDown={(e) => {
                    handleMarkerDegreeButton(e, 6);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <CursorRotateIcon />
                </div>
                <div
                  className={clsx(classes.onMarkerBtn, classes.degree315)}
                  onClick={(e) => {
                    handleMarkerDegreeButton(e, 0);
                  }}
                  onKeyDown={(e) => {
                    handleMarkerDegreeButton(e, 0);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <CursorRotateIcon />
                </div>
              </>
            )}

            <CameraIcon
              direction={Number(getAttrByKey(device.attributes || [], 'direction')?.value || -1)}
              removed
            />
          </Box>
        </DivIconMarker>
      ))}
    </>
  );
};

export default ActiveCameraMarkerLayer;
