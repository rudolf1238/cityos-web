/* eslint-disable i18next/no-literal-string */
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import ImageList from '@mui/material/ImageList';
import React, {
  Dispatch,
  DragEvent,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Typography from '@mui/material/Typography';

import { StorageKey, getItem, getValue } from 'city-os-common/libs/storage';
import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';

import { GET_MEDIA_POOL, GetMediaPool } from '../../../api/getMediaPool';
import { ModalCloseButton, ModalContent } from '../../common/Dialog/Dialog';
import { updateMediaList, useTemplateStore } from '../../../contexts/TemplateContext';
import MediaCard, { MediaType } from '../../common/MediaCard/MediaCard';

type RecapDialogType = {
  onHandleShowDialog: Dispatch<SetStateAction<boolean>>;
};
const DOMAIN = process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT || 'http://localhost:4000/image-mgmt';
const TRANSFER_TYPE = 'text/plain';

const combinedUrl = (mediaId: string) => `${DOMAIN}${mediaId}`;

const RecapDialog: FC<RecapDialogType> = ({ onHandleShowDialog }) => {
  const { t } = useTranslation(['esignage']);
  const [medias, setMedias] = useState<MediaType[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaType[]>([]);
  const { dispatch } = useTemplateStore();
  const {
    userProfile: { permissionGroup },
  } = useStore();
  const [mediaData] = useState(() => ({
    page: 1,
    pageSize: 100,
  }));
  const groupId = permissionGroup?.group.id || '';
  const { data } = useQuery<GetMediaPool>(GET_MEDIA_POOL, {
    variables: {
      groupId,
      filter: {},
      ...mediaData,
    },
  });
  const mediaIds = useMemo(
    () => data?.getMediaPool?.mediaPoolOutput.map((media) => media.mediaId) ?? [],
    [data],
  );

  useEffect(() => {
    const getPhotos = async () => {
      const REFRESH_TOKEN = getValue(getItem(StorageKey.ACCESS), isString);
      const options = {
        method: 'GET',
        headers: {
          authorization: `Bearer ${REFRESH_TOKEN || ''}`,
          'group-id': groupId,
        },
      };

      const mediaList = await Promise.all(
        mediaIds.map((mediaId) =>
          fetch(combinedUrl(mediaId), options)
            .then((media) => media.blob())
            .then((blob) => ({
              id: mediaId,
              type: blob.type,
              url: URL.createObjectURL(blob),
            })),
        ),
      );
      setMedias(mediaList);
    };

    if (groupId && mediaIds.length > 0) {
      void getPhotos();
    }

    return () => {
      medias.forEach((media) => URL.revokeObjectURL(media.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, mediaIds]);

  const handleUpdateSelectMedia = useCallback(
    (newMedia: MediaType) => () => {
      setSelectedMedia((prevMedia) => {
        const isExited = prevMedia.findIndex((media) => media.id === newMedia.id) !== -1;
        return isExited ? prevMedia : [...prevMedia, newMedia];
      });
    },
    [],
  );

  // This function is trigger func for onDrop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleOnDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    const formattedData = e.dataTransfer.getData(TRANSFER_TYPE);
    const parsedMedia = JSON.parse(formattedData) as MediaType;
    setSelectedMedia((prevMedias: MediaType[]) => [...prevMedias, parsedMedia]);
  }, []);

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, media: MediaType) => {
    e.dataTransfer.setData(TRANSFER_TYPE, JSON.stringify(media));
  }, []);

  const handleUpdateMediaList = () => {
    const hasData = selectedMedia.length > 0;

    if (hasData) {
      updateMediaList(dispatch, selectedMedia);
    }
  };

  return (
    <ModalContent>
      <Box display="flex" justifyContent="flex-end">
        <ModalCloseButton>
          <Button onClick={() => onHandleShowDialog(false)}>
            <CloseIcon color="inherit" />
          </Button>
        </ModalCloseButton>
      </Box>
      <Box width="550px" height="400px" display="flex" flexDirection="column">
        <Box height="50%" display="flex" flexDirection="column">
          <Box height={1} width={1} draggable onDragOver={handleDragOver} onDrop={handleOnDrop}>
            <Typography variant="subtitle1">{t('template.noun.selectedUpload')}</Typography>
            <Box px={1} border="1px solid #000" minHeight="80%" maxHeight="90%" overflow="auto">
              <ImageList cols={5}>
                {selectedMedia.length > 0 &&
                  selectedMedia.map((media: MediaType) => (
                    <MediaCard cardInfo={media} styles={{ height: '80px' }} />
                  ))}
              </ImageList>
            </Box>
          </Box>
        </Box>
        <Box height="50%" py={1} display="flex" flexDirection="column" gridGap={1}>
          <Typography variant="subtitle1">{t('template.noun.chooseUpload')}</Typography>
          <Box overflow="auto">
            <ImageList cols={5}>
              {medias.length > 0 &&
                medias.map((media: MediaType) => (
                  <Box
                    draggable
                    onDragStart={(evt: DragEvent<HTMLDivElement>) => handleDragStart(evt, media)}
                  >
                    <MediaCard
                      styles={{ height: '80px' }}
                      cardInfo={media}
                      onUpdateSelectMedia={handleUpdateSelectMedia(media)}
                    />
                  </Box>
                ))}
            </ImageList>
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="flex-end" pr={2} mt={1}>
        <ModalCloseButton>
          <Button
            style={{ padding: '10px 20px' }}
            variant="outlined"
            onClick={handleUpdateMediaList}
          >
            {t(`Submit`)}
          </Button>
        </ModalCloseButton>
      </Box>
    </ModalContent>
  );
};

export default RecapDialog;
