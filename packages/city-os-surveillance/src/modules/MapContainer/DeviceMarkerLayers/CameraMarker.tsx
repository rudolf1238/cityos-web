import { icon, point } from 'leaflet';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';

import { Marker, Popup } from 'react-leaflet';
import Typography from '@material-ui/core/Typography';

import type { IDevice } from 'city-os-common/libs/schema';

import LiveStreamPlayer from 'city-os-common/modules/videoPlayer/LiveStreamPlayer';

import { PopupLayer } from './type';
import { highlightDuration } from '../../../libs/constants';
import { useSurveillanceContext } from '../../SurveillanceProvider';
import useAnimationStyles from '../../../styles/animation';

import VideoPlayer from '../../SplitScreens/VideoPlayer';

const useStyles = makeStyles((theme) => ({
  previewPopup: {
    marginBottom: theme.spacing(1),
    width: 340,

    '& .leaflet-popup-tip-container': {
      display: 'none',
    },

    '& .leaflet-popup-content-wrapper': {
      borderRadius: theme.shape.borderRadius,
      padding: 0,
      overflow: 'hidden',
    },

    '& .leaflet-popup-content': {
      margin: 0,
      width: 'auto !important',
    },

    '&.leaflet-popup > a.leaflet-popup-close-button': {
      top: theme.spacing(2),
      right: theme.spacing(2),
      zIndex: theme.zIndex.modal,
      borderRadius: theme.shape.borderRadius,
      paddingRight: 0,
      width: 24,
      height: 24,
      color: theme.palette.primary.main,
      fontSize: 24,
      fontWeight: 400,
    },

    '&.leaflet-popup > a.leaflet-popup-close-button:hover': {
      backgroundColor: theme.palette.themeIconButton.hoverStandard,
      color: theme.palette.primary.main,
    },
  },

  deviceName: {
    position: 'absolute',
    top: 0,
    left: theme.spacing(5),
    zIndex: theme.zIndex.modal,
    color: theme.palette.primary.contrastText,
  },

  videoPlayer: {
    border: '2px solid transparent',
  },
}));

const customIcon = ({
  svgString,
  anchor: { x, y },
}: {
  svgString: string;
  anchor: { x: number; y: number };
}) =>
  icon({
    iconAnchor: point(x, y),
    iconUrl: `data:image/svg+xml;utf-8, ${window.encodeURIComponent(svgString)}`,
  });

export interface CameraMarkerProps {
  device: IDevice;
  zIndexOffset?: number;
  showPreview?: boolean;
  isSelected?: boolean;
  selectedLabel?: string;
  detectedType?: 'highlight' | 'warning';
  onPreviewOpen: (device: IDevice) => void;
  onPreviewClose: () => void;
  onAddClick: (device: IDevice) => void;
}

const CameraMarker: VoidFunctionComponent<CameraMarkerProps> = ({
  device,
  zIndexOffset = 0,
  showPreview,
  isSelected = false,
  selectedLabel,
  detectedType,
  onPreviewOpen,
  onPreviewClose,
  onAddClick,
}: CameraMarkerProps) => {
  const theme = useTheme();
  const classes = useStyles();
  const animationClasses = useAnimationStyles();

  const { playbackRange, playbackTime } = useSurveillanceContext();

  const [openPreview, setOpenPreview] = useState(false);

  const handleOpenPreview = useCallback(() => {
    setOpenPreview(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setOpenPreview(false);
    onPreviewClose();
  }, [onPreviewClose]);

  const markerOnClick = useCallback(() => {
    if (showPreview) {
      onAddClick(device);
    } else {
      onPreviewOpen(device);
    }
  }, [showPreview, onAddClick, device, onPreviewOpen]);

  const backgroundFill = useMemo(() => {
    if (isSelected && selectedLabel) return theme.palette.primary.main;
    if (isSelected) return theme.palette.secondary.main;
    return theme.palette.gadget.offline;
  }, [isSelected, selectedLabel, theme]);

  const cameraSvgSize = detectedType ? 80 : 40;

  const cameraIcon = useMemo(
    () =>
      customIcon({
        anchor: detectedType ? { x: 40, y: 40 } : { x: 20, y: 20 },
        svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="${cameraSvgSize}px" height="${cameraSvgSize}px" viewBox="${
          detectedType ? '-20 -20 80 80' : '0 0 40 40'
        }">
  ${
    detectedType
      ? `<circle fill="${
          detectedType === 'warning' ? theme.palette.error.main : theme.palette.secondary.main
        }" fill-opacity="0.5" cx="20" cy="20" r="40">
          <animate attributeName="opacity" from="0.5" to="0" dur="${highlightDuration}s" />
        </circle>`
      : ''
  }
  <circle fill="${backgroundFill}" cx="20" cy="20" r="20"/>
  ${
    isSelected && selectedLabel
      ? `<text x="20" y="20" text-anchor="middle" dominant-baseline="central" fill="#FFF" font-weight="700" font-size="24px">
        ${selectedLabel}
      </text>`
      : `<path
        d="M23.0625 27.75H11.375C11.0103 27.75 10.6606 27.6051 10.4027 27.3473C10.1449 27.0894 10 26.7397 10 26.375V15.375C10 15.0103 10.1449 14.6606 10.4027 14.4027C10.6606 14.1449 11.0103 14 11.375 14H23.0625C23.4272 14 23.7769 14.1449 24.0348 14.4027C24.2926 14.6606 24.4375 15.0103 24.4375 15.375V18.1663L28.1637 15.5056C28.2664 15.4326 28.3871 15.3891 28.5127 15.38C28.6383 15.3708 28.7641 15.3964 28.8761 15.4539C28.9882 15.5113 29.0824 15.5985 29.1483 15.7058C29.2142 15.8132 29.2494 15.9365 29.25 16.0625V25.6875C29.2494 25.8135 29.2142 25.9368 29.1483 26.0442C29.0824 26.1515 28.9882 26.2387 28.8761 26.2961C28.7641 26.3536 28.6383 26.3792 28.5127 26.37C28.3871 26.3609 28.2664 26.3174 28.1637 26.2444L24.4375 23.5838V26.375C24.4375 26.7397 24.2926 27.0894 24.0348 27.3473C23.7769 27.6051 23.4272 27.75 23.0625 27.75Z"
        fill="white"
      />`
  }
</svg>`,
      }),
    [cameraSvgSize, theme, backgroundFill, detectedType, isSelected, selectedLabel],
  );

  const addIcon = useMemo(
    () =>
      customIcon({
        anchor: { x: 20, y: 20 },
        svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 40 40">
    <circle fill="${
      isSelected ? theme.palette.text.disabled : theme.palette.primary.main
    }" cx="20" cy="20" r="20"/>
    <path d="M13.5 20H26.5M20 13.5V26.5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
      }),
    [isSelected, theme],
  );

  if (!device.location) return null;

  return (
    <>
      <Marker
        icon={cameraIcon}
        position={device.location}
        eventHandlers={
          showPreview
            ? undefined
            : {
                click: markerOnClick,
              }
        }
        zIndexOffset={zIndexOffset}
        opacity={showPreview ? 0 : 1}
      >
        <Popup
          pane="popupPane"
          className={classes.previewPopup}
          autoPan={false}
          // NOTE: Leaflet popup would remove DOM element directly but not unmount React virtual DOM, so update 'openPreview' state to make sure children of popup unmount.
          // see https://react-leaflet.js.org/docs/start-introduction/
          onOpen={handleOpenPreview}
          onClose={handleClosePreview}
        >
          {openPreview &&
            (playbackRange && playbackTime !== null ? (
              <VideoPlayer
                device={device}
                from={playbackRange.from}
                to={playbackRange.to}
                playbackTime={playbackTime}
                className={clsx(classes.videoPlayer, {
                  [animationClasses.highlight]: detectedType === 'highlight',
                })}
              />
            ) : (
              <LiveStreamPlayer device={device} />
            ))}
          <Typography variant="body1" className={classes.deviceName}>
            {device.name}
          </Typography>
        </Popup>
      </Marker>
      {showPreview && (
        <Marker
          pane={PopupLayer.PREVIEW_ICON}
          icon={addIcon}
          position={device.location}
          eventHandlers={{
            click: markerOnClick,
          }}
        />
      )}
    </>
  );
};

export default memo(CameraMarker);
