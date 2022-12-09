import { makeStyles, useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import clsx from 'clsx';

import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { BaseProvider, LightTheme } from 'baseui';

import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import Typography from '@material-ui/core/Typography';

import {
  ContentCommon,
  DnDListMediaDataSource,
  ESignageTemplateType,
  MediaContent,
  MediaContentDetail,
  MediaInfo,
  TemplateContent,
} from '../../libs/type';

import I18nProvider from '../I18nESignageProvider';

import useESignageTranslation from '../../hooks/useESignageTranslation';

import ESignageTemplateContentImage from './ESignageTemplateContentImage';

import DnDListV3 from '../common/DnDListV3';

import { Modal, ModalOpenButton } from '../common/Dialog/Dialog';
import RecapDialog from './RecapDialog/RecapDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '56%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    overflow: 'overflow-y',
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
  },
  kanbanBox: {
    width: 296,
    marginLeft: 'auto',
  },
  textFieldMarginBottom: {
    marginBottom: theme.spacing(2),
  },
  textLeft: {
    textAlign: 'left',
  },
  paperPadding: {
    padding: theme.spacing(1),
  },
  fieldBox: {
    height: 504,
  },
  dropList: {
    '& ul': {
      // maxHeight: 160,
      maxHeight: 244,
      overflowY: 'auto',
    },
  },
}));

interface TemplateProps {
  templateIndex: number;
  templateTitle?: string | undefined;
  rectId: string;
  mediaContent?: MediaContent | undefined;
  onChangeType?: (contentType: string, selectedRectId: string) => void | null | undefined;
  onMediaContentChanged?: (
    newMediaContentInfo: MediaContent,
    rectId: string,
  ) => void | null | undefined;
}

const MediaContentInfo: VoidFunctionComponent<TemplateProps> = (props: TemplateProps) => {
  const {
    templateIndex,
    templateTitle,
    rectId,
    mediaContent,
    onChangeType,
    onMediaContentChanged,
  } = props;
  const [index, setIndex] = useState(templateIndex);
  const [title, setTitle] = useState(templateTitle || '');
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const classes = useStyles();
  const { t } = useESignageTranslation(['esignage']);

  const [isInit, setIsInit] = useState<boolean>(true);
  const [mediaContentInfo, setMediaContentInfo] = useState<MediaContent>(() => {
    if (mediaContent !== undefined) {
      return mediaContent;
    }
    const contentCommonLocal: ContentCommon = {
      contentTypeId: '',
      contentName: t('Media Content'),
    };
    const mediaContentDetailLocal: MediaContentDetail = { media: [] };
    const mediaContentInfoLocal: MediaContent = {
      contentCommon: contentCommonLocal,
      contentDetail: mediaContentDetailLocal,
    };
    return mediaContentInfoLocal;
  });

  const contentTypeRef = useRef('');
  const [acceptMediaType] = useState<string>('image/jpg, image/jpeg, image/png, video/mp4');
  const handleRefetchTempList = useCallback((): DnDListMediaDataSource[] => {
    if (
      mediaContentInfo !== undefined &&
      mediaContentInfo.contentDetail.media !== undefined &&
      mediaContentInfo.contentDetail.media.length > 0
    ) {
      const tempListLocal: DnDListMediaDataSource[] = [];
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      mediaContentInfo.contentDetail.media.forEach(async (value, _index, _array) => {
        tempListLocal.push({
          id: value !== undefined && value.mediaId !== undefined ? value.mediaId : '',
          text: value !== undefined && value.name !== undefined ? value.name : '',
          tag:
            value !== undefined && value.imagePlayDurations !== undefined
              ? value.imagePlayDurations.toString()
              : '',
          content: value !== undefined && value.content !== undefined ? value.content : undefined,
        });
      });
      return tempListLocal;
    }
    return [];
  }, [mediaContentInfo]);

  const [tempList, setTempList] = useState<DnDListMediaDataSource[]>(() => {
    return handleRefetchTempList();
  });

  const handleContentNameChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const contentCommonLocal: ContentCommon = {
        ...mediaContentInfo?.contentCommon,
        contentName: e.target.value,
      };
      const mediaContentInfoLocal: MediaContent = {
        ...mediaContentInfo,
        contentCommon: contentCommonLocal,
      };

      setMediaContentInfo(mediaContentInfoLocal);

      if (onMediaContentChanged !== undefined) {
        onMediaContentChanged(mediaContentInfoLocal, rectId);
      }
    },
    [mediaContentInfo, onMediaContentChanged, rectId],
  );

  const handleMoveContentInfo = useCallback(
    (startIndex: number, endIndex: number) => {
      let contentDetailLocal: MediaContentDetail = { media: [] };
      const mediaList = [...mediaContentInfo.contentDetail.media];
      if (mediaList) {
        const [removed] = mediaList.splice(startIndex, 1);
        mediaList.splice(endIndex, 0, removed);

        if (mediaContentInfo !== undefined && mediaContentInfo?.contentDetail !== undefined)
          contentDetailLocal = { ...mediaContentInfo?.contentDetail };
        contentDetailLocal.media = mediaList;
      }
      const mediaContentInfoLocal: MediaContent = {
        ...mediaContentInfo,
        contentDetail: contentDetailLocal,
      };
      // console.log('mediaContentInfoLocal', mediaContentInfoLocal);
      if (onMediaContentChanged !== undefined) {
        onMediaContentChanged(mediaContentInfoLocal, rectId);
      }
    },
    [mediaContentInfo, onMediaContentChanged, rectId],
  );

  const handleRemoveContentInfo = useCallback(
    (oldIndex: number | undefined | null) => {
      if (oldIndex !== undefined && oldIndex !== null) {
        if (oldIndex > -1 && oldIndex < mediaContentInfo.contentDetail.media.length) {
          let contentDetailLocal: MediaContentDetail = { media: [] };
          if (mediaContentInfo !== undefined && mediaContentInfo?.contentDetail !== undefined)
            contentDetailLocal = { ...mediaContentInfo?.contentDetail };
          contentDetailLocal.media.splice(oldIndex, 1);

          const mediaContentInfoLocal: MediaContent = {
            ...mediaContentInfo,
            contentDetail: contentDetailLocal,
          };
          if (onMediaContentChanged !== undefined) {
            onMediaContentChanged(mediaContentInfoLocal, rectId);
          }
          setMediaContentInfo(mediaContentInfoLocal);
        }
      }
    },
    [mediaContentInfo, onMediaContentChanged, rectId],
  );

  const handleOnChange = useCallback(
    (dndlist: DnDListMediaDataSource[] | [] | null | undefined) => {
      if (dndlist !== undefined && dndlist !== null) {
        // console.log(dndlist);
        // dndlist.forEach((element) => {
        //   console.log(String().concat('id=', element?.id, ',text=', element?.text));
        // });
      }
    },
    [],
  );

  const handleOnChangeType = useCallback(
    (contentType: string, selectedRectId: string) => {
      if (onChangeType !== undefined) {
        onChangeType(contentType, selectedRectId);
      }

      if (
        contentType !== undefined &&
        contentType.trim() !== '' // && contentTypeRef.current !== contentType
      ) {
        contentTypeRef.current = contentType;
      }
    },
    [onChangeType],
  );

  const ESignageTemplateContentImageComponent = useCallback(
    (indexLocal: number) => {
      const templateContentLocal: TemplateContent = {
        content: mediaContentInfo /* mediaContent as MediaContent */,
        rectId,
      };

      switch (indexLocal) {
        case 0:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_A_1080X1920}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 1:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_B_1080X1920}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 2:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_C_1080X1920}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 3:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_D_1080X1920}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 4:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_E_1080X1920}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 5:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_F_1080X1920}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 6:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_G_1920X1080}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 7:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_H_1920X1080}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 8:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_I_1920X1080}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 9:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_J_1920X1080}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 10:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_K_1920X1080}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        case 11:
          return (
            <ESignageTemplateContentImage
              type={ESignageTemplateType.TYPE_L_1920X1080}
              rectId={rectId}
              content={templateContentLocal}
              onChangeType={handleOnChangeType}
            />
          );
        default:
          return null;
      }
    },
    [handleOnChangeType, mediaContentInfo, rectId],
  );

  // const handleChoseMediaFiles = useCallback(() => {}, []);

  const handleChangedMedia: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.currentTarget.files !== null) {
        if (e.currentTarget.files.length > 0) {
          const tempListLocal = [...tempList];
          const mediaInfo: MediaInfo[] = [];
          let contentDetailLocal: MediaContentDetail = { media: [] };

          if (mediaContentInfo !== undefined && mediaContentInfo?.contentDetail !== undefined)
            contentDetailLocal = { ...mediaContentInfo?.contentDetail };

          for (let i = 0; i < e.currentTarget.files.length; i += 1) {
            const file = e.currentTarget.files[i];
            if (file !== undefined) {
              const mediaItem: { id: string | ''; text: string; tag?: string; content?: Blob } = {
                id: '',
                text: file.name,
                tag:
                  file.type === 'image/png' || file.type === 'mage/jpeg' || file.type === 'mage/jpg'
                    ? '5'
                    : '0',
                content: file,
              };

              const imagePlayDurationsLocal: number =
                mediaItem.tag !== undefined && parseInt(mediaItem.tag, 10) > -1
                  ? parseInt(mediaItem.tag, 10)
                  : 0;

              tempListLocal.push(mediaItem);
              mediaInfo.push({
                mediaId: mediaItem.id,
                name: mediaItem.text,
                imagePlayDurations: imagePlayDurationsLocal,
                content: mediaItem.content,
              });
            }
          }

          if (mediaInfo.length > 0)
            contentDetailLocal.media = contentDetailLocal.media.concat(mediaInfo);

          setTempList(tempListLocal);
          const mediaContentInfoLocal: MediaContent = {
            ...mediaContentInfo,
            contentDetail: contentDetailLocal,
          };
          if (onMediaContentChanged !== undefined) {
            onMediaContentChanged(mediaContentInfoLocal, rectId);
          }

          setMediaContentInfo({
            ...mediaContentInfo,
            contentDetail: contentDetailLocal,
          });
        }
      }
    },
    [mediaContentInfo, onMediaContentChanged, rectId, tempList],
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const engine = new Styletron();

  useEffect(() => {
    if (isInit) {
      setIndex(templateIndex);
      setTitle(templateTitle || '');

      setIsInit(false);
    }
  }, [isInit, t, templateIndex, templateTitle]);

  useEffect(() => {
    // if (mediaContentInfo !== undefined) setMediaContentInfo(mediaContentInfo);
    if (mediaContent !== undefined) {
      setMediaContentInfo(mediaContent);
    }
  }, [mediaContent]);

  useEffect(() => {
    if (mediaContentInfo !== undefined) setTempList(handleRefetchTempList());
  }, [handleRefetchTempList, mediaContentInfo]);

  const theme2 = useTheme();

  // const DnDListV2Com = React.useMemo(
  //   () => <DnDListV2 dataSource={[...tempList]} onChange={handleOnChange} />,
  //   [handleOnChange, tempList],
  // );

  const DnDListV3Com = React.useMemo(
    () => (
      <DnDListV3
        dataSource={[...tempList]}
        setDataSource={setTempList}
        removeContentInfo={handleRemoveContentInfo}
        moveContentInfo={handleMoveContentInfo}
        onChange={handleOnChange}
      />
    ),
    [handleMoveContentInfo, handleOnChange, handleRemoveContentInfo, tempList],
  );

  return (
    <I18nProvider>
      <Modal>
        <div className={classes.root}>
          <Grid container item>
            <Grid item xs={12} sm={6}>
              <Paper elevation={1} className={clsx(classes.paperPadding, classes.kanbanBox)}>
                <Typography variant="subtitle2">{title}</Typography>
                {index > -1 ? ESignageTemplateContentImageComponent(index) : <div />}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={1} className={clsx(classes.fieldBox)}>
                <Box p={1}>
                  <Paper
                    elevation={1}
                    className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
                  >
                    <TextField
                      required
                      id="contentName"
                      label={t('Content Name')}
                      value={mediaContentInfo && mediaContentInfo?.contentCommon.contentName}
                      fullWidth
                      onChange={handleContentNameChanged}
                      error={mediaContentInfo && mediaContentInfo.contentCommon.contentName === ''}
                      helperText={
                        mediaContentInfo && mediaContentInfo.contentCommon.contentName === ''
                          ? t("Content name can't be empty.")
                          : ' '
                      }
                    />
                  </Paper>
                  <Paper
                    elevation={1}
                    className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
                  >
                    <Box className={classes.textLeft} borderBottom={1} pb={2} mb={1}>
                      <div style={{ color: theme2.palette.type === 'dark' ? '#fff' : '#1A2027' }}>
                        {t('esignage:Chose Media Files')}
                      </div>
                      <input
                        id="mediaFilesText"
                        accept={acceptMediaType}
                        type="file"
                        multiple
                        name={t('esignage:Chose Media Files')}
                        style={{ color: theme2.palette.type === 'dark' ? '#fff' : '#1A2027' }}
                        onChange={handleChangedMedia}
                      />
                    </Box>
                  </Paper>
                  <Paper
                    elevation={1}
                    className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
                    style={{ display: 'none' }}
                  >
                    <Box borderBottom={1} pb={2} mb={1}>
                      <Typography
                        style={{ color: theme2.palette.type === 'dark' ? '#fff' : '#1A2027' }}
                        className={clsx(classes.textLeft)}
                      >
                        {t('template.noun.upload')}
                        <ModalOpenButton>
                          <Button onClick={() => setIsOpenDialog(true)}>{t('open')}</Button>
                        </ModalOpenButton>
                      </Typography>
                    </Box>
                  </Paper>
                  <Paper
                    elevation={1}
                    className={clsx(
                      classes.paperPadding,
                      classes.textFieldMarginBottom,
                      classes.dropList,
                    )}
                  >
                    <StyletronProvider
                      value={
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        engine
                      }
                    >
                      <BaseProvider theme={LightTheme}>{DnDListV3Com}</BaseProvider>
                    </StyletronProvider>
                  </Paper>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </div>
        {isOpenDialog && <RecapDialog onHandleShowDialog={setIsOpenDialog} />}
      </Modal>
    </I18nProvider>
  );
};

export default memo(MediaContentInfo);
