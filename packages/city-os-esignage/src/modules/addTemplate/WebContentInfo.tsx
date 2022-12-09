import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import React, { VoidFunctionComponent, memo, useCallback, useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';

import Typography from '@material-ui/core/Typography';

import { BaseProvider, LightTheme } from 'baseui';

import {
  ContentCommon,
  DnDListDataSource,
  ESignageTemplateType,
  TemplateContent,
  WebPageContent,
  WebPageContentDetail,
  WebPageInfo,
} from '../../libs/type';

import I18nProvider from '../I18nESignageProvider';

import useESignageTranslation from '../../hooks/useESignageTranslation';

import ESignageTemplateContentImage from './ESignageTemplateContentImage';

import DnDListV2 from '../common/DnDListV2';

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
  webUrlField: {
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
  dropList: {
    '& ul': {
      maxHeight: 160,
      overflowY: 'auto',
    },
  },
}));

interface TemplateProps {
  templateIndex: number;
  templateTitle?: string | undefined;
  rectId: string;
  webPageContent?: WebPageContent | undefined;
  onChangeType?: (contentType: string, selectedRectId: string) => void | null | undefined;
  onWebPageContentChanged?: (
    newWebPageContentInfo: WebPageContent,
    rectId: string,
  ) => void | null | undefined;
}

const WebContentInfo: VoidFunctionComponent<TemplateProps> = (props: TemplateProps) => {
  const {
    templateIndex,
    templateTitle,
    rectId,
    webPageContent,
    onChangeType,
    onWebPageContentChanged,
  } = props;
  const [index, setIndex] = useState(templateIndex);
  const [title, setTitle] = useState(templateTitle || '');
  const classes = useStyles();
  const { t } = useESignageTranslation(['esignage']);

  const [isInit, setIsInit] = useState<boolean>(true);
  const [webPageContentInfo, setWebPageContentInfo] = useState<WebPageContent>(() => {
    if (webPageContent !== undefined) {
      return webPageContent;
    }
    const contentCommonLocal: ContentCommon = {
      contentTypeId: '',
      contentName: t('Web Content'),
    };
    const webPageContentDetailLocal: WebPageContentDetail = { webpage: [] };
    const webPageContentInfoLocal: WebPageContent = {
      contentCommon: contentCommonLocal,
      contentDetail: webPageContentDetailLocal,
    };
    return webPageContentInfoLocal;
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const engine = new Styletron();

  const [tempList, setTempList] = useState<DnDListDataSource[]>(() => {
    if (
      webPageContentInfo !== undefined &&
      webPageContentInfo.contentDetail.webpage !== undefined &&
      webPageContentInfo.contentDetail.webpage.length > 0
    ) {
      const tempListLocal: DnDListDataSource[] = [];
      webPageContentInfo.contentDetail.webpage.forEach((value, _index, _array) => {
        tempListLocal.push({ id: value.id, text: value.webUrl, tag: value.playTime.toString() });
      });
      return tempListLocal;
    }
    return [];
  });

  const [webUrl, setWebUrl] = useState<string>('');
  const [playTime, setPlayTime] = useState<string>('30');
  const [disabledAddtoListButton, setDisabledAddtoListButton] = useState<boolean>(true);
  const maxLengthLimit = 5;

  const handleContentNameChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const contentCommonLocal: ContentCommon = {
        ...webPageContentInfo?.contentCommon,
        contentName: e.target.value,
      };
      setWebPageContentInfo({
        ...webPageContentInfo,
        contentCommon: contentCommonLocal,
      });
    },
    [webPageContentInfo],
  );

  const isValidUrl = useCallback((urlString: string) => {
    const urlPattern = new RegExp(
      '^(http[s]?:\\/\\/)' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // validate fragment locator
    return !!urlPattern.test(urlString);
  }, []);

  const handleWebUrlChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (isValidUrl(e.target.value)) setDisabledAddtoListButton(false);
      else setDisabledAddtoListButton(true);

      setWebUrl(e.target.value);
    },
    [isValidUrl],
  );

  const handlePlayTimeChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (e.target.value !== undefined && e.target.value.trim() !== '') {
        try {
          const parsedPlayTime = parseInt(e.target.value.trim(), 10);
          if (!Number.isNaN(parsedPlayTime)) {
            if (parsedPlayTime >= 100000) return;
            setPlayTime(parsedPlayTime.toString());
          }
        } catch (ex) {
          // console.info(ex);
        }
      }
    },
    [],
  );

  const handleAddClick = useCallback(() => {
    if (
      webUrl !== undefined &&
      webUrl.trim() !== '' &&
      playTime !== undefined &&
      !Number.isNaN(playTime) &&
      parseInt(playTime, 10) > 0
    ) {
      const tempListLocal = [...tempList];
      const webUrlItem: {
        id: string | '';
        text: string;
        tag: string;
      } = {
        id: '',
        text: webUrl,
        tag: playTime,
      };

      tempListLocal.push(webUrlItem);
      setTempList(tempListLocal);

      const webpageInfo: WebPageInfo[] = [];

      tempListLocal.forEach((value, _index, _array) => {
        if (value !== undefined && !Number.isNaN(value?.tag)) {
          const playTimeLocal: number =
            value.tag !== undefined && parseInt(value.tag, 10) > -1 ? parseInt(value.tag, 10) : 0;
          if (playTimeLocal > 0)
            webpageInfo.push({ id: value.id, webUrl: value.text, playTime: playTimeLocal });
        }
      });

      const contentDetailLocal: WebPageContentDetail = {
        ...webPageContentInfo?.contentDetail,
        webpage: webpageInfo,
      };
      setWebPageContentInfo({
        ...webPageContentInfo,
        contentDetail: contentDetailLocal,
      });
    }
  }, [playTime, tempList, webPageContentInfo, webUrl]);

  const handleMoveContentInfo = useCallback(
    (startIndex: number, endIndex: number) => {
      let contentDetailLocal: WebPageContentDetail = { webpage: [] };
      const webPageList = [...webPageContentInfo.contentDetail.webpage];

      if (webPageList) {
        const [removed] = webPageList.splice(startIndex, 1);
        webPageList.splice(endIndex, 0, removed);

        if (webPageContentInfo !== undefined && webPageContentInfo?.contentDetail !== undefined)
          contentDetailLocal = { ...webPageContentInfo?.contentDetail };
        contentDetailLocal.webpage = webPageList;
      }
      const webPageContentInfoLocal: WebPageContent = {
        ...webPageContentInfo,
        contentDetail: contentDetailLocal,
      };
      if (onWebPageContentChanged !== undefined) {
        onWebPageContentChanged(webPageContentInfoLocal, rectId);
      }
    },
    [onWebPageContentChanged, rectId, webPageContentInfo],
  );

  const handleRemoveContentInfo = useCallback(
    (oldIndex: number | undefined | null) => {
      if (oldIndex !== undefined && oldIndex !== null) {
        if (oldIndex > -1 && oldIndex < webPageContentInfo.contentDetail.webpage.length) {
          let contentDetailLocal: WebPageContentDetail = { webpage: [] };
          if (webPageContentInfo !== undefined && webPageContentInfo?.contentDetail !== undefined)
            contentDetailLocal = { ...webPageContentInfo?.contentDetail };
          contentDetailLocal.webpage.splice(oldIndex, 1);
          setWebPageContentInfo({
            ...webPageContentInfo,
            contentDetail: contentDetailLocal,
          });
        }
      }
    },
    [webPageContentInfo],
  );

  const handleOnChange = useCallback((dndlist: DnDListDataSource[] | [] | null | undefined) => {
    if (dndlist !== undefined && dndlist !== null) {
      // console.log(dndlist);
      // dndlist.forEach((element) => {
      //   console.log(String().concat('id=', element?.id, ',text=', element?.text));
      // });
    }
  }, []);

  const handleOnChangeType = useCallback(
    (contentType: string, selectedRectId: string) => {
      if (onChangeType !== undefined) onChangeType(contentType, selectedRectId);
    },
    [onChangeType],
  );

  const ESignageTemplateContentImageComponent = useCallback(
    (indexLocal: number) => {
      const templateContentLocal: TemplateContent = { content: webPageContentInfo, rectId };

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
    [handleOnChangeType, rectId, webPageContentInfo],
  );

  useEffect(() => {
    if (isInit) {
      setIndex(templateIndex);
      setTitle(templateTitle || '');

      setIsInit(false);
    }
  }, [isInit, t, templateIndex, templateTitle]);

  useEffect(() => {
    if (onWebPageContentChanged !== undefined) onWebPageContentChanged(webPageContentInfo, rectId);
  }, [onChangeType, onWebPageContentChanged, rectId, webPageContentInfo]);

  useEffect(() => {
    if (webPageContentInfo !== undefined) {
      setWebPageContentInfo(webPageContentInfo);
    }
  }, [webPageContentInfo]);

  const DnDListV2Com = React.useMemo(
    () => (
      <DnDListV2
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
                  value={webPageContentInfo && webPageContentInfo?.contentCommon.contentName}
                  fullWidth
                  onChange={handleContentNameChanged}
                  error={webPageContentInfo && webPageContentInfo.contentCommon.contentName === ''}
                  helperText={
                    webPageContentInfo && webPageContentInfo.contentCommon.contentName === ''
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
                  id="webPageUrl"
                  label={t('Web Page Url')}
                  className={clsx(classes.webUrlField)}
                  value={webUrl && webUrl}
                  fullWidth
                  onChange={handleWebUrlChanged}
                />
              </Paper>
              <Paper
                elevation={1}
                className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
              >
                <TextField
                  // required
                  id="playTime"
                  label={t('Play Time')}
                  className={classes.textFieldMarginBottom}
                  value={playTime && playTime}
                  fullWidth
                  onChange={handlePlayTimeChanged}
                  type="number"
                  inputProps={{ maxLength: maxLengthLimit }}
                />
              </Paper>
              <Button onClick={handleAddClick} disabled={disabledAddtoListButton}>
                {' '}
                {t('Add to List')}
              </Button>
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
                  <BaseProvider theme={LightTheme}>{DnDListV2Com}</BaseProvider>
                </StyletronProvider>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </I18nProvider>
  );
};

export default memo(WebContentInfo);
