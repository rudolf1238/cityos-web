import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

import React, { VoidFunctionComponent, memo, useCallback, useEffect, useState } from 'react';

import Typography from '@material-ui/core/Typography';

import {
  ContentCommon,
  ESignageTemplateType,
  IPCamContent,
  IPCamContentDetail,
  IPCamInfo,
  TemplateContent,
} from '../../libs/type';

import I18nProvider from '../I18nESignageProvider';

import useESignageTranslation from '../../hooks/useESignageTranslation';

import ESignageTemplateContentImage from './ESignageTemplateContentImage';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '56%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    display: 'flex',
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
  fixedZindex: {
    '& label': {
      zIndex: 1,
    },
  },
  paperPadding: {
    padding: theme.spacing(1),
  },
  fieldBox: {
    height: 504,
  },
}));

interface TemplateProps {
  templateIndex: number;
  templateTitle?: string | undefined;
  rectId: string;
  ipcamContent?: IPCamContent | undefined;
  onChangeType?: (
    contentType: string,
    selectedRectId: string,
    /* templateContent: TemplateContent | undefined, */
  ) => void | null | undefined;
  onIPCamContentChanged?: (
    newIPCamContentInfo: IPCamContent,
    rectId: string,
  ) => void | null | undefined;
}

const IPCamContentInfo: VoidFunctionComponent<TemplateProps> = (props: TemplateProps) => {
  const {
    templateIndex,
    templateTitle,
    rectId,
    ipcamContent,
    onChangeType,
    onIPCamContentChanged,
  } = props;
  const [index, setIndex] = useState(templateIndex);
  const [title, setTitle] = useState(templateTitle || '');
  const classes = useStyles();
  const { t } = useESignageTranslation(['esignage']);

  const [isInit, setIsInit] = useState<boolean>(true);
  const [ipcamContentInfo, setIPCamContentInfo] = useState<IPCamContent>(() => {
    if (ipcamContent !== undefined) {
      return ipcamContent;
    }
    const contentCommonLocal: ContentCommon = {
      contentTypeId: '',
      contentName: t('IPCam Content'),
    };
    const ipcamContentDetailLocal: IPCamContentDetail = {
      ipcam: [{ id: '', camName: '', rtspUrl: '', durations: 0 }],
    };
    const ipcamContentInfoLocal: IPCamContent = {
      contentCommon: contentCommonLocal,
      contentDetail: ipcamContentDetailLocal,
    };
    return ipcamContentInfoLocal;
  });
  const handleContentNameChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const contentCommonLocal: ContentCommon = {
        ...ipcamContentInfo?.contentCommon,
        contentName: e.target.value,
      };
      setIPCamContentInfo({
        ...ipcamContentInfo,
        contentCommon: contentCommonLocal,
      });
    },
    [ipcamContentInfo],
  );

  const handleCameraNameChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      // setCameraName(e.target.value);
      if (ipcamContentInfo !== undefined) {
        const ipcamInfo: IPCamInfo[] = [];
        if (ipcamContentInfo.contentDetail.ipcam.length > 0) {
          ipcamInfo.push({ ...ipcamContentInfo.contentDetail.ipcam[0], camName: e.target.value });
        } else {
          ipcamInfo.push({ id: '', camName: e.target.value, rtspUrl: '', durations: 0 });
        }
        const contentDetailLocal: IPCamContentDetail = {
          ...ipcamContentInfo?.contentDetail,
          ipcam: ipcamInfo,
        };
        setIPCamContentInfo({
          ...ipcamContentInfo,
          contentDetail: contentDetailLocal,
        });
      }
    },
    [ipcamContentInfo],
  );

  const handleRTSPUrlChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      // setRTSPUrl(e.target.value);
      if (ipcamContentInfo !== undefined) {
        const ipcamInfo: IPCamInfo[] = [];
        if (ipcamContentInfo.contentDetail.ipcam.length > 0) {
          ipcamInfo.push({ ...ipcamContentInfo.contentDetail.ipcam[0], rtspUrl: e.target.value });
        } else {
          ipcamInfo.push({ id: '', camName: e.target.value, rtspUrl: '', durations: 0 });
        }
        const contentDetailLocal: IPCamContentDetail = {
          ...ipcamContentInfo?.contentDetail,
          ipcam: ipcamInfo,
        };
        setIPCamContentInfo({
          ...ipcamContentInfo,
          contentDetail: contentDetailLocal,
        });
      }
    },
    [ipcamContentInfo],
  );

  const handleOnChangeType = useCallback(
    (contentType: string, selectedRectId: string) => {
      if (onChangeType !== undefined) onChangeType(contentType, selectedRectId);
    },
    [onChangeType],
  );

  const ESignageTemplateContentImageComponent = useCallback(
    (indexLocal: number) => {
      const templateContentLocal: TemplateContent = { content: ipcamContentInfo, rectId };

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
    [handleOnChangeType, ipcamContentInfo, rectId],
  );

  useEffect(() => {
    if (isInit) {
      setIndex(templateIndex);
      setTitle(templateTitle || '');

      setIsInit(false);
    }
  }, [isInit, t, templateIndex, templateTitle]);

  useEffect(() => {
    if (onIPCamContentChanged !== undefined) onIPCamContentChanged(ipcamContentInfo, rectId);
  }, [onIPCamContentChanged, ipcamContentInfo, rectId]);

  useEffect(() => {
    if (ipcamContent !== undefined) setIPCamContentInfo(ipcamContent);
  }, [ipcamContent]);

  return (
    <I18nProvider>
      <div className={classes.root}>
        <Grid container item>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">{title}</Typography>
            <Paper elevation={1} className={clsx(classes.paperPadding, classes.kanbanBox)}>
              {index > -1 ? ESignageTemplateContentImageComponent(index) : <div />}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={1} className={clsx(classes.fieldBox)}>
              <Paper
                elevation={1}
                className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
              >
                <TextField
                  required
                  id="contentName"
                  label={t('Content Name')}
                  value={
                    ipcamContentInfo && ipcamContentInfo?.contentCommon.contentName
                      ? ipcamContentInfo?.contentCommon.contentName
                      : ''
                  }
                  fullWidth
                  onChange={handleContentNameChanged}
                  error={ipcamContentInfo && ipcamContentInfo.contentCommon.contentName === ''}
                  helperText={
                    ipcamContentInfo && ipcamContentInfo.contentCommon.contentName === ''
                      ? t("Content name can't be empty.")
                      : ' '
                  }
                />
              </Paper>
              <Paper
                elevation={1}
                className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
              >
                <TextField
                  // required
                  id="cameraName"
                  label={t('Camera Name')}
                  className={clsx(classes.fixedZindex)}
                  value={
                    ipcamContentInfo &&
                    ipcamContentInfo?.contentDetail.ipcam &&
                    ipcamContentInfo?.contentDetail.ipcam.length > 0 &&
                    ipcamContentInfo?.contentDetail.ipcam[0]
                      ? ipcamContentInfo?.contentDetail.ipcam[0].camName
                      : ''
                  }
                  fullWidth
                  onChange={handleCameraNameChanged}
                />
              </Paper>
              <Paper
                elevation={1}
                className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
              >
                <TextField
                  // required
                  id="hlsUrl"
                  label={t('HLS Url')}
                  className={clsx(classes.fixedZindex)}
                  value={
                    ipcamContentInfo &&
                    ipcamContentInfo?.contentDetail.ipcam &&
                    ipcamContentInfo?.contentDetail.ipcam.length > 0 &&
                    ipcamContentInfo?.contentDetail.ipcam[0]
                      ? ipcamContentInfo?.contentDetail.ipcam[0].rtspUrl
                      : ''
                  }
                  fullWidth
                  onChange={handleRTSPUrlChanged}
                />
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </I18nProvider>
  );
};

export default memo(IPCamContentInfo);
