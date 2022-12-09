import { Action, Permission, Subject } from 'city-os-common/libs/schema';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import { useStore } from 'city-os-common/reducers';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import Grid from '@mui/material/Grid';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';

import React, {
  ReactNode,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import Button from '@material-ui/core/Button';

import ReducerActionType from 'city-os-common/reducers/actions';

import { TemplateProvider } from '../contexts/TemplateContext';

import {
  UPDATE_TEMPLATE_CONTENT_AND_ADD_SCHEDULE,
  UpdateTemplateContentAndAddSchedulePayload,
  UpdateTemplateContentAndAddScheduleResponse,
} from '../api/updateTemplateContentAndAddSchedule';

import {
  GET_TEMPLATEATE_SCHEDULE,
  GetTemplateSchedule,
  GetTemplateSchedulePayload,
  GetTemplateScheduleResponse,
} from '../api/getTemplateSchedule';

import {
  UPDATE_TEMPLATE_SCHEDULE,
  UpdateTemplateSchedulePayload,
  UpdateTemplateScheduleResponse,
} from '../api/updateTemplateSchedule';

import TabPanelSet from './common/TabPanelSet';

import MediaUploadService, { UploadMultipleFilesType } from '../api/mediaUpload';

// import BasicIcon from '../assets/svg/button_icon/basic.svg';
import DetailsIcon from '../assets/svg/button_icon/details.svg';
import ExitIcon from '../assets/svg/button_icon/exit.svg';

import AlertDialogSlide from './common/AlertDialogSlide';
import HorizontalLinearStepper from './common/HorizontalLinearStepper';
import I18nProvider from './I18nESignageProvider';
import ImageViewer from './common/ImageViewer';
import TemplateInfo from './addTemplate/TemplateInfo';

import IPCamContentInfo from './addTemplate/IPCamContentInfo';
import MediaContentInfo from './addTemplate/MediaContentInfo';
import WeatherContentInfo from './addTemplate/WeatherContentInfo';
import WebContentInfo from './addTemplate/WebContentInfo';

import ESignagePlayerSelector from './publishTemplateContent/ESignagePlayerSelector';

import {
  ContentCommon,
  IPCamContent,
  IPCamContentDetail,
  IPCamInfo,
  ImageDataSource,
  ListItemDataSource,
  MediaContent,
  MediaContentDetail,
  MediaInfo,
  TemplateBasic,
  TemplateContent,
  TemplateSchedule,
  WeatherContent,
  WeatherContentDetail,
  WebPageContent,
  WebPageContentDetail,
  WebPageInfo,
} from '../libs/type';

import {
  GET_TEMPLATEATE_CONTENT,
  GetTemplateContent,
  GetTemplateContentPayload,
  GetTemplateContentResponse,
} from '../api/getTemplateContent';

import useESignageTranslation from '../hooks/useESignageTranslation';

import {
  GET_TEMPLATEATE_TYPE,
  GetTemplateType,
  GetTemplateTypePayload,
  GetTemplateTypeResponse,
} from '../api/getTemplateType';

import {
  GET_TEMPLATEATE,
  GetTemplate,
  GetTemplatePayload,
  GetTemplateResponse,
} from '../api/getTemplate';

import {
  DELETE_TEMPLATE,
  DeleteTemplatePayload,
  DeleteTemplateResponse,
} from '../api/deleteTemplate';

import {
  ADD_TEMPLATE,
  AddTemplateContentPayload,
  AddTemplateContentResponse,
  ContentDetail,
  IpCam,
  Media,
  TemplateContent as TemplateContents,
  TemplateInput,
  Weather,
  Webpage,
} from '../api/addTemplate';

import {
  UPDATE_TEMPLATE,
  UpdateTemplateInput,
  UpdateTemplatePayload,
  UpdateTemplateResponse,
} from '../api/updateTemplate';

import {
  UPDATE_TEMPLATE_CONTENT,
  UpdateTemplateContent,
  UpdateTemplateContentInput,
  UpdateTemplateContentPayload,
  UpdateTemplateContentResponse,
} from '../api/updateTemplateContent';

import {
  ADD_TEMPLATE_SCHEDULE,
  AddTemplateSchedulePayload,
  AddTemplateScheduleResponse,
  TemplateScheduleInput,
} from '../api/addTemplateSchedule';

import ScheduleAndPublish from './publishTemplateContent/ScheduleAndPublish';

import {
  UPDATE_TEMPLATE_CONTENT_AND_UPDATE_SCHEDULE,
  UpdateTemplateContentAndUpdateSchedulePayload,
  UpdateTemplateContentAndUpdateScheduleResponse,
} from '../api/updateTemplateContentAndUpdateSchedule';

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-between',
    marginLeft: 'auto',

    '& > :first-child > .MuiDivider-vertical, & > :last-child > .MuiDivider-vertical': {
      display: 'none',
    },
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    // justifyContent: 'center',
    // marginTop: theme.spacing(5),
    // height: 660,
  },
  schedulePanel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    width: '75%',
    margin: 'auto',
  },

  tab: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-around',
    overflow: 'overflow-y',
    backgroundColor: theme.palette.background.paper,
    flexDirection: 'column',
  },
  emptyPanel: {
    width: 1200,
    height: 430,
  },
  templateInfoPanel: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    overflow: 'overflow-y',
  },
  fullWidth: {
    width: '100%',
    justifyContent: 'space-between',
  },

  tabPanelBox: {
    position: 'static',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

enum TabPanelType {
  Content,
  Publish,
}

interface ESignageTemplate {
  id: string;
  name: string;
  disabled: boolean;
  permission: Permission | null;
}

interface TemplateContentPayload extends ESignageTemplate {
  type: Action.ADD | Action.MODIFY;
}

const ESignage: VoidFunctionComponent = () => {
  const [action, setAction] = useState<string>('');
  const classes = useStyles();
  const { t } = useESignageTranslation(['esignage']);
  const [initial, setInitial] = useState<boolean>(true);
  const [initTab, setInitTab] = useState<boolean>(true);
  const [templates, setTemplates] = useState<TemplateContentPayload[]>([]);
  const [resetViewerUI, setResetViewerUI] = useState<boolean>(true);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const {
    user,
    dispatch,
    userProfile: { permissionGroup },
  } = useStore();
  const AccessToken = `Bearer ${user.accessToken || ''}`;
  const changeContentTypeRef = useRef(false);
  const contentTypeRef = useRef('');

  const [page /* setPage */] = useState(1);
  const [pageSize /* setPageSize */] = useState(0);
  const [templateList, setTemplateList] = useState<GetTemplate | undefined>(undefined);
  const [templateListDataSource, setTemplateListDataSource] = useState<
    ImageDataSource[] | undefined
  >(undefined);

  const [contentTabText, setContentTabText] = useState<string>('');
  const [templateType, setTemplateType] = useState<GetTemplateType | undefined>(undefined);
  const [imageDataSource, setImageDataSource] = useState<ImageDataSource[] | undefined>(undefined);
  const templateTypeCode = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const [templateTypeId, setTemplateTypeId] = useState<string[]>([]);
  const [tabContent, setTabContent] = useState<ReactNode>(() => <ImageViewer />); // 版型管理TabContent
  const [tabContent2, setTabContent2] = useState<ReactNode>(() => <div />); // 排成管理TabContent
  const [previousImgSelectedIndex, setPreviousImgSelectedIndex] = useState<number>(-1);
  const [imgSelectedIndex, setImgSelectedIndex] = useState<number>(-1);
  const [displayStepper, setDisplayStepper] = useState<boolean>(false);
  const [displayNextButton, setDisplayNextButton] = useState<boolean>(false);
  const [modifyDetails, setModifyDetails] = useState<boolean>(false);
  const [displayTemplateBasicSaveButton, setDisplayTemplateBasicSaveButton] = useState(false);
  const [stepAction, setStepAction] = useState<string | undefined | 'NEXT' | 'BACK' | 'RESET'>('');
  const [step, setStep] = useState<number>(0);
  const stepRef = useRef(0);
  const steps = useMemo(
    () => [
      t('Select a template'),
      t('Edit a template'),
      t('Edit contents'),
      t('Select the devices that you want to publish'),
      t('Schedule and Publish'),
    ],
    [t],
  );
  const updateSteps = useMemo(
    () => [
      t('Edit contents'),
      t('Select the devices that you want to publish'),
      t('Schedule and Publish'),
    ],
    [t],
  );
  const scheduleSteps = useMemo(
    () => [t('Select the devices that you want to publish'), t('Schedule and Publish')],
    [t],
  );
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openDialog2, setOpenDialog2] = useState<boolean>(false);
  const [openDialog3, setOpenDialog3] = useState<boolean>(false);
  const [openDialog4, setOpenDialog4] = useState<boolean>(false);
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);
  const [openSaveDialog2, setOpenSaveDialog2] = useState<boolean>(false);
  const [openPublishDialog, setOpenPublishDialog] = useState<boolean>(false);
  const [openPublishDialog2, setOpenPublishDialog2] = useState<boolean>(false);
  const [openPublishDialog3, setOpenPublishDialog3] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);
  const displayStyle: { marginRight: number; display: string } = useMemo(
    () => ({
      marginRight: 30,
      display: 'inline',
    }),
    [],
  );
  const hideStyle: { marginRight: number; display: string } = useMemo(
    () => ({
      marginRight: 30,
      display: 'none',
    }),
    [],
  );
  const saveButtonDisplayStyle: {
    marginLeft: number;
    display: string;
  } = useMemo(
    () => ({
      marginLeft: 0,
      display: 'inline',
    }),
    [],
  );
  const saveButtonHideStyle: { marginLeft: number; display: string } = useMemo(
    () => ({
      marginLeft: 60,
      display: 'none',
    }),
    [],
  );
  const publishButtonDisplayStyle: {
    marginLeft: number;
    display: string;
  } = useMemo(
    () => ({
      marginLeft: 60,
      display: 'inline',
    }),
    [],
  );
  const publishButtonHideStyle: { marginLeft: number; display: string } = useMemo(
    () => ({
      marginLeft: 60,
      display: 'none',
    }),
    [],
  );
  const [addButtonStyle, setAddButtonStyle] = useState({ display: 'inline' });
  const [modifyButtonStyle, setModifyButtonStyle] = useState({ display: 'none' });
  const [dividerStyle, setDividerStyle] = useState({ display: 'none' });
  const [deleteButtonStyle, setDeleteButtonStyle] = useState({ display: 'none' });
  const [exitButtonStyle, setExitButtonStyle] = useState({ display: 'none' });
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
  const [cancelButtonStyle, setCancelButtonStyle] = useState<{
    marginRight: number;
    display: string;
  }>(displayStyle);
  const [backButtonStyle, setBackButtonStyle] = useState<{ marginRight: number; display: string }>(
    hideStyle,
  );
  const [nextButtonStyle, setNextButtonStyle] = useState<{ marginRight: number; display: string }>(
    displayStyle,
  );
  const [saveButtonStyle, setSaveButtonStyle] = useState<{ marginLeft: number; display: string }>(
    saveButtonDisplayStyle,
  );
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const [publishButtonDisabled, setPublishButtonDisabled] = useState(false);
  const [publishButtonStyle, setPublishButtonStyle] = useState<{
    marginLeft: number;
    display: string;
  }>(publishButtonHideStyle);
  const [templateBasicInfo, setTemplateBasicInfo] = useState<TemplateBasic | undefined>({
    groupId: permissionGroup && permissionGroup !== null ? permissionGroup?.group.id : '',
    templateName: '',
    templateType: '',
    description: '',
    backgroundColor: '',
  });
  const [templateContents, setTemplateContents] = useState<TemplateContent[]>([]);
  const handleInitTemplateSchedule = useCallback((): TemplateSchedule => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const timeZone = new Date().getTimezoneOffset() / -60;

    return {
      templateId: '',
      scheduleId: '',
      scheduleName: t('Schedule'),
      playStartDate: startDate,
      playEndDate: endDate,
      playStartTime: startDate.toLocaleString(
        typeof window !== 'undefined' && window.navigator !== undefined && navigator !== null
          ? navigator.language
          : 'zh-TW',
        {
          hour12: false,
        },
      ), // startDate.toTimeString(),
      playEndTime: endDate.toLocaleString(
        typeof window !== 'undefined' && window.navigator !== undefined && navigator !== null
          ? navigator.language
          : 'zh-TW',
        {
          hour12: false,
        },
      ), // endDate.toTimeString(),
      loopMode: 'D',
      dailyFrequency: 1,
      weeklyFrequency: null,
      monthlyFrequency_Month: null,
      monthlyFrequency_Day: null,
      audioSetting: 100,
      downloadDirectly: true,
      scheduledDownloadTime: null,
      players: [],
      publishedTimeZone:
        timeZone >= 0 ? String().concat('+', timeZone.toString()) : timeZone.toString(),
    };
  }, [t]);
  const [templateSchedule, setTemplateSchedule] = useState<TemplateSchedule | undefined>(() =>
    handleInitTemplateSchedule(),
  );
  const [selectedESignagePlayers, setSelectedESignagePlayers] = useState<ListItemDataSource[]>([]);
  const [publishMode, setPublishMode] = useState('I');
  const [execPublish, setExecPublish] = useState('');
  const [templateIdforAddTemplate, setTemplateIdforAddTemplate] = useState<string>('');
  const [updateTemplateContentInputforPublish, setUpdateTemplateContentInputforPublish] =
    useState<UpdateTemplateContentInput>({ updateTemplateContent: [] });
  const scheduleId = useRef('');
  const currentAction = useRef('');
  const groupIdRef = useRef('');
  const imageDataSourceTmpRef = useRef<ImageDataSource[]>([]);

  const handleOnChangeIndex = useCallback(
    (selectedIndex: number) => {
      // console.info('selectedIndex: ', selectedIndex);
      // console.info('currentAction: ', currentAction);

      if (selectedIndex > -1) {
        setAddButtonStyle({ display: 'none' });

        if (currentAction.current === '') {
          setModifyButtonStyle({ display: 'inline' });
          setDividerStyle({ display: 'inline' });
          setDeleteButtonStyle({ display: 'inline' });
          // setExitButtonStyle({ display: 'inline' });
        }
      } else {
        if (currentAction.current !== '') setAddButtonStyle({ display: 'none' });
        else setAddButtonStyle({ display: 'inline' });

        setModifyButtonStyle({ display: 'none' });
        setDividerStyle({ display: 'none' });
        setDeleteButtonStyle({ display: 'none' });
        // setExitButtonStyle({ display: 'none' });
      }

      setImgSelectedIndex(selectedIndex);
      if (resetViewerUI !== undefined && resetViewerUI) setResetViewerUI(false);
      if (selectedIndex > -1 && selectedIndex !== imgSelectedIndex) setTemplateBasicInfo(undefined);

      setInitial(true);
    },
    [imgSelectedIndex, resetViewerUI],
  );

  const changeDivision = useCallback(() => {
    setTabIndex(0);
    setAction('');
    currentAction.current = '';

    setAddButtonStyle({ display: 'inline' });
    setModifyButtonStyle({ display: 'none' }); // default: inline
    setDividerStyle({ display: 'none' }); // default: inline
    setDeleteButtonStyle({ display: 'none' }); // default: inline
    setExitButtonStyle({ display: 'none' });

    setResetViewerUI(true);

    let tabContentLocal;
    if (imageDataSourceTmpRef.current.length > 0) {
      tabContentLocal = (
        <div className={classes.tab}>
          <ImageViewer
            resetUI
            dataSource={imageDataSourceTmpRef.current}
            idMappingReference={templateTypeId}
            onChangeIndex={handleOnChangeIndex}
          />
        </div>
      );
    } else {
      tabContentLocal = (
        <div className={classes.tab}>
          <ImageViewer resetUI />
        </div>
      );
    }

    setDisplayStepper(false);
    setDisplayNextButton(false);

    setTabContent(tabContentLocal);
    setTabContent2(null);

    setCancelButtonStyle(hideStyle);
    setBackButtonStyle(hideStyle);
    setNextButtonStyle(hideStyle);
    setNextButtonDisabled(false);
    setSaveButtonStyle(saveButtonHideStyle);
    setPublishButtonStyle(publishButtonHideStyle);
  }, [
    classes.tab,
    handleOnChangeIndex,
    hideStyle,
    publishButtonHideStyle,
    saveButtonHideStyle,
    templateTypeId,
  ]);

  const getTemplateIndex = useCallback(
    (templateTypeIdLocal: string): number => {
      let templateIndex = -1;
      if (
        templateTypeId !== undefined &&
        templateTypeId.length > 0 &&
        templateTypeIdLocal !== undefined &&
        templateTypeIdLocal.trim() !== ''
      ) {
        templateIndex = templateTypeId.indexOf(templateTypeIdLocal);
      }
      return templateIndex;
    },
    [templateTypeId],
  );

  const getUploadMediabyId = useCallback(
    async (mediaId: string) => {
      let result: Blob | undefined;
      if (permissionGroup !== undefined && permissionGroup !== null) {
        const groupId = permissionGroup?.group.id;
        try {
          result = await MediaUploadService.getUploadMediabyId(AccessToken, groupId, mediaId);
        } catch (e) {
          // console.info(e);
        }
      }
      return result;
    },
    [AccessToken, permissionGroup],
  );

  // loading, error, data, refetch, networkStatus
  /* const { refetch: refetchTemplateType } = */
  useQuery<GetTemplateTypeResponse, GetTemplateTypePayload>(GET_TEMPLATEATE_TYPE, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      page,
      pageSize,
      filter: {},
    },
    onCompleted: (templateTypeDataObject) => {
      if (templateTypeDataObject !== undefined) {
        const templateTypeIdLocal: string[] = new Array<string>(
          templateTypeDataObject.getTemplateType.esignageTemplateTypeOutput.length,
        );
        const imageDataSourceTmp = new Array<ImageDataSource>(
          templateTypeDataObject.getTemplateType.esignageTemplateTypeOutput.length,
        );

        templateTypeDataObject.getTemplateType.esignageTemplateTypeOutput.forEach(
          (value, index, _array) => {
            if (imageDataSourceTmp !== undefined) {
              if (templateTypeIdLocal !== undefined) templateTypeIdLocal[index] = value.id;
              const imageDataSourcelocal: ImageDataSource = {
                id: value.id,
                title: String().concat(
                  templateTypeCode[index],
                  '. ',
                  '(',
                  value.resolution || '',
                  ')',
                ),
                key: value.id,
                description: value.description || '',
              };
              imageDataSourceTmp[index] = imageDataSourcelocal;
            }
          },
        );
        setTemplateTypeId(templateTypeIdLocal);
        setImageDataSource(imageDataSourceTmp);
        setTemplateType(templateTypeDataObject.getTemplateType);
      }
    },
    onError: (/* error */) => {
      // if (D_DEBUG) console.error(error.graphQLErrors);
    },
    skip: !permissionGroup?.group.id,
  });

  const { refetch: refetchTemplateList } = useQuery<GetTemplateResponse, GetTemplatePayload>(
    GET_TEMPLATEATE,
    {
      variables: {
        groupId: permissionGroup?.group.id || '',
        page,
        pageSize,
        filter: {},
      },
      onCompleted: (templateDataObject) => {
        if (templateDataObject !== undefined) {
          const imageDataSourceTmp = new Array<ImageDataSource>(
            templateDataObject.getTemplate.templateOutput.length,
          );
          templateDataObject.getTemplate.templateOutput.forEach((value, index, _array) => {
            if (imageDataSourceTmp !== undefined) {
              const imageDataSourcelocal: ImageDataSource = {
                id: value.templateTypeId,
                tag: value.id,
                title: String().concat(value.typeName, '. ', '(', value.typeResolution || '', ')'),
                key: value.id,
                description: String().concat(value.name, '- ', value.description || ''),
              };
              imageDataSourceTmp[index] = imageDataSourcelocal;
            }
          });

          if (imageDataSourceTmp !== undefined && imageDataSourceTmp.length > 0) {
            setTemplateListDataSource(imageDataSourceTmp);
          } else setTemplateListDataSource([]);

          imageDataSourceTmpRef.current = imageDataSourceTmp;

          if (templateDataObject !== undefined && templateDataObject.getTemplate.totalCount > 0) {
            setTemplateList(templateDataObject.getTemplate);
          } else setTemplateList({ templateOutput: [], totalCount: 0 });

          if (imageDataSourceTmp !== undefined) {
            setContentTabText(
              imageDataSourceTmp !== undefined
                ? String().concat(t('Content'), ' (', imageDataSourceTmp.length.toString(), ')')
                : t('Content'),
            );

            if (
              !initTab &&
              imageDataSourceTmpRef.current &&
              permissionGroup !== undefined &&
              permissionGroup !== null
            ) {
              if (groupIdRef.current !== permissionGroup.group.id) {
                changeDivision();
              }
              if (groupIdRef.current !== permissionGroup.group.id)
                groupIdRef.current = permissionGroup.group.id;
            }
          }
        }
      },
      onError: (/* error */) => {
        // if (D_DEBUG) console.error(error.graphQLErrors);
      },
      skip: !permissionGroup?.group.id,
    },
  );

  const { refetch: refetchTemplateContent } = useQuery<
    GetTemplateContentResponse,
    GetTemplateContentPayload
  >(GET_TEMPLATEATE_CONTENT, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      templateId:
        templateListDataSource !== undefined &&
        templateListDataSource[imgSelectedIndex]?.key !== undefined
          ? templateListDataSource[imgSelectedIndex].key
          : '',
    },
    // onCompleted: async (templateContentObject: GetTemplateContentResponse) => {
    onCompleted: (templateContentObject: GetTemplateContentResponse) => {
      if (templateContentObject !== undefined) {
        const templateContentFromAPI: GetTemplateContent = {
          ...templateContentObject.getTemplateContent,
        };
        const templateContentsLocal: TemplateContent[] = [];

        if (
          templateContentFromAPI !== undefined &&
          templateContentFromAPI.templateContent !== undefined &&
          templateContentFromAPI.templateContent.length > 0
        ) {
          for (let c = 0; c < templateContentFromAPI.templateContent.length; c += 1) {
            const templateContent = templateContentFromAPI.templateContent[c];

            if (templateContent.contentTypeId === '628dd0b71df620dbe8629247') {
              const media: MediaInfo[] = [];

              if (templateContent.templateContentDetail.media !== null) {
                void (async () => {
                  for (let i = 0; i < templateContent.templateContentDetail.media.length; i += 1) {
                    const { mediaId } = templateContent.templateContentDetail.media[i];
                    let mediaContent: Blob | undefined;

                    if (mediaId !== undefined && mediaId !== '') {
                      // eslint-disable-next-line no-await-in-loop
                      mediaContent = await getUploadMediabyId(mediaId);
                    }
                    media.push({
                      mediaId: templateContent.templateContentDetail.media[i].mediaId,
                      imagePlayDurations:
                        templateContent.templateContentDetail.media[i].imagePlayDurations,
                      content: mediaContent,
                      name: templateContent.templateContentDetail.media[i].originalname,
                      size: templateContent.templateContentDetail.media[i].size,
                    });
                  }
                })();
              }
              const mediaContent: MediaContent = {
                contentCommon: {
                  contentTypeId: templateContent.contentTypeId,
                  contentName: templateContent.contentName,
                  tag: templateContent.tag,
                  x: templateContent.x,
                  y: templateContent.y,
                  width: templateContent.width,
                  height: templateContent.height,
                },
                contentDetail: { media },
              };
              templateContentsLocal.push({
                contentId: templateContent.contentId,
                content: mediaContent,
                rectId: templateContent.rectId,
              });
            }

            if (templateContent.contentTypeId === '628dd0b71df620dbe862924a') {
              const ipcam: IPCamInfo[] = [];

              if (templateContent.templateContentDetail.cam !== null) {
                for (let i = 0; i < templateContent.templateContentDetail.cam.length; i += 1) {
                  ipcam.push({
                    id: templateContent.templateContentDetail.cam[i].id,
                    camName: templateContent.templateContentDetail.cam[i].camName,
                    rtspUrl: templateContent.templateContentDetail.cam[i].rtspUrl,
                    durations: templateContent.templateContentDetail.cam[i].durations,
                  });
                }
              }
              const ipcamContent: IPCamContent = {
                contentCommon: {
                  contentTypeId: templateContent.contentTypeId,
                  contentName: templateContent.contentName,
                  tag: templateContent.tag,
                  x: templateContent.x,
                  y: templateContent.y,
                  width: templateContent.width,
                  height: templateContent.height,
                },
                contentDetail: { ipcam },
              };

              templateContentsLocal.push({
                contentId: templateContent.contentId,
                content: ipcamContent,
                rectId: templateContent.rectId,
              });
            }

            if (templateContent.contentTypeId === '628dd0b71df620dbe8629248') {
              const citys: string[] = templateContent.templateContentDetail.weather.citys
                ? [...templateContent.templateContentDetail.weather.citys]
                : [];
              const weatherContent: WeatherContent = {
                contentCommon: {
                  contentTypeId: templateContent.contentTypeId,
                  contentName: templateContent.contentName,
                  tag: templateContent.tag,
                  x: templateContent.x,
                  y: templateContent.y,
                  width: templateContent.width,
                  height: templateContent.height,
                },
                contentDetail: {
                  weatherStyleId: templateContent.templateContentDetail.weather.weatherStyleId,
                  temperatureUnit: templateContent.templateContentDetail.weather.temperatureUnit,
                  windSpeedUnit: templateContent.templateContentDetail.weather.windSpeedUnit,
                  languageId: templateContent.templateContentDetail.weather.languageId,
                  backgroundColor: templateContent.templateContentDetail.weather.backgroundColor,
                  durations: templateContent.templateContentDetail.weather.durations,
                  citys,
                },
              };

              templateContentsLocal.push({
                contentId: templateContent.contentId,
                content: weatherContent,
                rectId: templateContent.rectId,
              });
            }

            if (templateContent.contentTypeId === '628dd0b71df620dbe8629249') {
              const webpage: WebPageInfo[] = templateContent.templateContentDetail.webpage
                ? [...templateContent.templateContentDetail.webpage]
                : [];
              const webPageContent: WebPageContent = {
                contentCommon: {
                  contentTypeId: templateContent.contentTypeId,
                  contentName: templateContent.contentName,
                  tag: templateContent.tag,
                  x: templateContent.x,
                  y: templateContent.y,
                  width: templateContent.width,
                  height: templateContent.height,
                },
                contentDetail: {
                  webpage,
                },
              };

              templateContentsLocal.push({
                contentId: templateContent.contentId,
                content: webPageContent,
                rectId: templateContent.rectId,
              });
            }
          }

          setTemplateContents(templateContentsLocal);
        }
      }
    },
    onError: (/* error */) => {
      // if (D_DEBUG) console.error(error.graphQLErrors);
    },
    skip:
      !permissionGroup?.group.id ||
      !templateListDataSource ||
      imgSelectedIndex < 0 ||
      templateListDataSource[imgSelectedIndex]?.key === undefined,
  });

  const { refetch: refetchTemplateSchedule } = useQuery<
    GetTemplateScheduleResponse,
    GetTemplateSchedulePayload
  >(GET_TEMPLATEATE_SCHEDULE, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      templateId:
        templateListDataSource !== undefined &&
        templateListDataSource[imgSelectedIndex]?.key !== undefined
          ? templateListDataSource[imgSelectedIndex].key
          : '',
      page,
      pageSize,
      filter: {},
    },
    onCompleted: (templateScheduleDataObject: GetTemplateScheduleResponse) => {
      if (templateScheduleDataObject !== undefined) {
        const templateScheduleFromAPI: GetTemplateSchedule = {
          ...templateScheduleDataObject.getTemplateSchedule,
        };
        const now = new Date();
        const timeZone = now.getTimezoneOffset() / -60;
        const templateScheduleLocal: TemplateSchedule = {
          templateId: '',
          scheduleId: '',
          scheduleName: '',
          playStartDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
          playEndDate: null,
          playStartTime: '',
          playEndTime: '',
          loopMode: '',
          dailyFrequency: null,
          weeklyFrequency: null,
          monthlyFrequency_Month: null,
          monthlyFrequency_Day: null,
          audioSetting: 0,
          downloadDirectly: false,
          scheduledDownloadTime: null,
          players: null,
          publishedTimeZone:
            timeZone >= 0 ? String().concat('+', timeZone.toString()) : timeZone.toString(),
        };

        if (templateScheduleFromAPI !== undefined && templateScheduleFromAPI.totalCount > 0) {
          const playStartDate: Date = new Date(
            templateScheduleFromAPI.templateScheduleOutput &&
              templateScheduleFromAPI.templateScheduleOutput[0].playStartDate,
          );
          const playEndDate: Date | null =
            templateScheduleFromAPI.templateScheduleOutput !== undefined &&
            templateScheduleFromAPI.templateScheduleOutput[0].playEndDate !== null &&
            templateScheduleFromAPI.templateScheduleOutput[0].playEndDate !== ''
              ? new Date(templateScheduleFromAPI.templateScheduleOutput[0].playEndDate)
              : null;
          const scheduledDownloadTime: Date = new Date(
            templateScheduleFromAPI.templateScheduleOutput &&
              templateScheduleFromAPI.templateScheduleOutput[0].scheduledDownloadTime,
          );

          const [playStartDateText] = playStartDate.toLocaleString().split(' ');
          templateScheduleLocal.audioSetting =
            templateScheduleFromAPI.templateScheduleOutput[0].audioSetting;
          templateScheduleLocal.dailyFrequency =
            templateScheduleFromAPI.templateScheduleOutput[0].dailyFrequency;
          templateScheduleLocal.downloadDirectly =
            templateScheduleFromAPI.templateScheduleOutput[0].downloadDirectly;
          templateScheduleLocal.loopMode =
            templateScheduleFromAPI.templateScheduleOutput[0].loopMode;

          const monthlyFrequencyDay: string[] = [];
          if (
            templateScheduleFromAPI.templateScheduleOutput[0].monthlyFrequency_Day !== null &&
            templateScheduleFromAPI.templateScheduleOutput[0].monthlyFrequency_Day?.length > 0
          ) {
            for (
              let i = 0;
              i < templateScheduleFromAPI.templateScheduleOutput[0].monthlyFrequency_Day?.length;
              i += 1
            ) {
              monthlyFrequencyDay.push(
                templateScheduleFromAPI.templateScheduleOutput[0].monthlyFrequency_Day[
                  i
                ].toString(),
              );
            }
          }
          templateScheduleLocal.monthlyFrequency_Day =
            monthlyFrequencyDay.length > 0 ? monthlyFrequencyDay : null;

          templateScheduleLocal.monthlyFrequency_Month = templateScheduleFromAPI
            .templateScheduleOutput[0].monthlyFrequency_Month as unknown as string[];
          templateScheduleLocal.playEndDate = playEndDate;
          templateScheduleLocal.playEndTime = templateScheduleFromAPI.templateScheduleOutput[0]
            .playEndTime
            ? String().concat(
                playStartDateText,
                ' ',
                templateScheduleFromAPI.templateScheduleOutput[0].playEndTime,
              )
            : String().concat(playStartDateText, ' ', '23:59:59');
          templateScheduleLocal.playStartDate = playStartDate;
          templateScheduleLocal.playStartTime = templateScheduleFromAPI.templateScheduleOutput[0]
            .playStartTime
            ? String().concat(
                playStartDateText,
                ' ',
                templateScheduleFromAPI.templateScheduleOutput[0].playStartTime,
              )
            : String().concat(playStartDateText, ' ', '00:00:00');
          templateScheduleLocal.players = [];
          templateScheduleLocal.publishedTimeZone =
            timeZone >= 0 ? String().concat('+', timeZone.toString()) : timeZone.toString();
          templateScheduleLocal.scheduleId =
            templateScheduleFromAPI.templateScheduleOutput[0].scheduleId;
          templateScheduleLocal.scheduleName =
            templateScheduleFromAPI.templateScheduleOutput[0].scheduleName;
          templateScheduleLocal.scheduledDownloadTime = scheduledDownloadTime;
          templateScheduleLocal.templateId =
            templateScheduleFromAPI.templateScheduleOutput[0].templateId;
          templateScheduleLocal.weeklyFrequency =
            templateScheduleFromAPI.templateScheduleOutput[0].weeklyFrequency;

          scheduleId.current = templateScheduleFromAPI.templateScheduleOutput[0].scheduleId;
          setTemplateSchedule(templateScheduleLocal);
        }
      }
    },
    onError: (/* error */) => {
      // if (D_DEBUG) console.error(error.graphQLErrors);
    },
    skip:
      !permissionGroup?.group.id ||
      !templateListDataSource ||
      imgSelectedIndex < 0 ||
      templateListDataSource[imgSelectedIndex]?.key === undefined ||
      templateListDataSource[imgSelectedIndex]?.key === '' ||
      action === 'ADD', // ||
    // action === '',
  });

  const [addTemplate] = useMutation<AddTemplateContentResponse, AddTemplateContentPayload>(
    ADD_TEMPLATE,
    {
      onCompleted: ({ addTemplate: templateId }) => {
        try {
          void refetchTemplateList();
          if (templateId !== undefined) {
            setTemplateIdforAddTemplate(templateId);
          }
          setSaveSuccess(true);
          setOpenSaveDialog(true);
          setNextButtonDisabled(false);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('The information has been saved successfully'),
            },
          });
        } catch (_e) {
          // console.error(_e);
          setSaveSuccess(false);
          setOpenSaveDialog(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('Save failed. Please try again.'),
            },
          });
        }
      },
      onError: (error) => {
        if (error !== undefined && error.message.indexOf("reading 'id'") !== -1) {
          // console.log('Incorrect template content information.');
        }
        setSaveSuccess(false);
        setOpenSaveDialog(true);

        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('Save failed. Please try again.'),
          },
        });
      },
    },
  );

  const [updateTemplate] = useMutation<UpdateTemplateResponse, UpdateTemplatePayload>(
    UPDATE_TEMPLATE,
    {
      onCompleted: ({ updateTemplate: updateTemplateReturnValue }) => {
        try {
          if (updateTemplateReturnValue) {
            void refetchTemplateList();
            setSaveSuccess(true);
            setOpenSaveDialog2(true);
            dispatch({
              type: ReducerActionType.ShowSnackbar,
              payload: {
                severity: 'success',
                message: t('The information has been saved successfully'),
              },
            });
          } else {
            setSaveSuccess(false);
            setOpenSaveDialog2(true);
            dispatch({
              type: ReducerActionType.ShowSnackbar,
              payload: {
                severity: 'error',
                message: t('Save failed. Please try again.'),
              },
            });
          }
        } catch (_e) {
          // console.error(_e);
          setSaveSuccess(false);
          setOpenSaveDialog2(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('Save failed. Please try again.'),
            },
          });
        }
      },
      onError: (error) => {
        if (error !== undefined && error.message.indexOf("reading 'id'") !== -1) {
          // console.log('Incorrect template information.');
        }
        setSaveSuccess(false);
        setOpenSaveDialog2(true);

        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('Save failed. Please try again.'),
          },
        });
      },
    },
  );

  const [updateTemplateContent] = useMutation<
    UpdateTemplateContentResponse,
    UpdateTemplateContentPayload
  >(UPDATE_TEMPLATE_CONTENT, {
    onCompleted: ({ updateTemplateContent: updateTemplateContentReturnValue }) => {
      try {
        if (updateTemplateContentReturnValue) {
          void refetchTemplateContent();
          setSaveSuccess(true);
          setOpenSaveDialog2(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('The information has been saved successfully'),
            },
          });
        } else {
          setSaveSuccess(false);
          setOpenSaveDialog2(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('Save failed. Please try again.'),
            },
          });
        }
      } catch (_e) {
        // console.error(_e);
        setSaveSuccess(false);
        setOpenSaveDialog2(true);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('Save failed. Please try again.'),
          },
        });
      }
    },
    onError: (error) => {
      if (error !== undefined && error.message.indexOf("reading 'id'") !== -1) {
        // console.log('Incorrect template information.');
      }
      setSaveSuccess(false);
      setOpenSaveDialog2(true);

      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('Save failed. Please try again.'),
        },
      });
    },
  });

  const [deleteTemplate] = useMutation<DeleteTemplateResponse, DeleteTemplatePayload>(
    DELETE_TEMPLATE,
    {
      onCompleted: ({ deleteTemplate: success }) => {
        try {
          if (success) {
            setInitial(true);
            void refetchTemplateList();
            setDeleteSuccess(true);
            setTimeout(() => {
              setOpenDeleteDialog(true);
              dispatch({
                type: ReducerActionType.ShowSnackbar,
                payload: {
                  severity: 'success',
                  message: t('The template has been deleted successfully'),
                },
              });
            }, 100);
          } else {
            setDeleteSuccess(false);
            setOpenDeleteDialog(true);
            dispatch({
              type: ReducerActionType.ShowSnackbar,
              payload: {
                severity: 'error',
                message: t('Delete failed. Please try again.'),
              },
            });
          }
        } catch (_e) {
          // console.error(_e);
          setDeleteSuccess(false);
          setOpenDeleteDialog(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('Delete failed. Please try again.'),
            },
          });
        }
      },
      onError: (error) => {
        if (error !== undefined && error.message.indexOf("reading 'id'") !== -1) {
          // console.log('Incorrect template content information.');
        }
        setDeleteSuccess(false);
        setOpenDeleteDialog(true);

        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('Delete failed. Please try again.'),
          },
        });
      },
    },
  );

  const [addTemplateSchedule] = useMutation<
    AddTemplateScheduleResponse,
    AddTemplateSchedulePayload
  >(ADD_TEMPLATE_SCHEDULE, {
    onCompleted: ({ addTemplateSchedule: result }) => {
      try {
        if (result) {
          void refetchTemplateList();
          if (execPublish === 'Publish3-AddSchdule') {
            setPublishSuccess(true);
            setOpenPublishDialog3(true);
          } else {
            setPublishSuccess(true);
            setOpenPublishDialog(true);
          }
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('The template contents have been published successfully'),
            },
          });
        } else {
          setPublishSuccess(false);
          setOpenPublishDialog(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('Publish failed. Please try again.'),
            },
          });
        }
      } catch (_e) {
        // console.error(_e);
        setPublishSuccess(false);
        setOpenPublishDialog(true);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('Publish failed. Please try again.'),
          },
        });
      }
    },
    onError: (error) => {
      if (error !== undefined && error.message.indexOf("reading 'id'") !== -1) {
        // console.log('Incorrect template content information.');
      }
      setPublishSuccess(false);
      setOpenPublishDialog(true);

      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('Publish failed. Please try again.'),
        },
      });
    },
  });

  const [updateTemplateSchedule] = useMutation<
    UpdateTemplateScheduleResponse,
    UpdateTemplateSchedulePayload
  >(UPDATE_TEMPLATE_SCHEDULE, {
    onCompleted: ({ updateTemplateSchedule: result }) => {
      try {
        if (result) {
          void refetchTemplateList();
          setPublishSuccess(true);
          setOpenPublishDialog3(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('The template contents have been published successfully'),
            },
          });
        } else {
          setPublishSuccess(false);
          setOpenPublishDialog3(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('Publish failed. Please try again.'),
            },
          });
        }
      } catch (_e) {
        // console.error(_e);
        setPublishSuccess(false);
        setOpenPublishDialog3(true);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('Publish failed. Please try again.'),
          },
        });
      }
    },
    onError: (error) => {
      if (error !== undefined && error.message.indexOf("reading 'id'") !== -1) {
        // console.log('Incorrect template information.');
      }
      setPublishSuccess(false);
      setOpenPublishDialog3(true);

      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('Publish failed. Please try again.'),
        },
      });
    },
  });

  const [updateTemplateContentAndAddSchedule] = useMutation<
    UpdateTemplateContentAndAddScheduleResponse,
    UpdateTemplateContentAndAddSchedulePayload
  >(UPDATE_TEMPLATE_CONTENT_AND_ADD_SCHEDULE, {
    onCompleted: ({ updateTemplateContentAndAddSchedule: result }) => {
      try {
        if (result) {
          void refetchTemplateList();
          setPublishSuccess(true);
          setOpenPublishDialog2(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('The template contents have been published successfully'),
            },
          });
        } else {
          setPublishSuccess(false);
          setOpenPublishDialog2(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('Publish failed. Please try again.'),
            },
          });
        }
      } catch (_e) {
        // console.error(_e);
        setPublishSuccess(false);
        setOpenPublishDialog2(true);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('Publish failed. Please try again.'),
          },
        });
      }
    },
    onError: (error) => {
      if (error !== undefined && error.message.indexOf("reading 'id'") !== -1) {
        // console.log('Incorrect template information.');
      }
      setPublishSuccess(false);
      setOpenPublishDialog2(true);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('Publish failed. Please try again.'),
        },
      });
    },
  });

  const [updateTemplateContentAndUpdateSchedule] = useMutation<
    UpdateTemplateContentAndUpdateScheduleResponse,
    UpdateTemplateContentAndUpdateSchedulePayload
  >(UPDATE_TEMPLATE_CONTENT_AND_UPDATE_SCHEDULE, {
    onCompleted: ({ updateTemplateContentAndUpdateSchedule: result }) => {
      try {
        if (result) {
          void refetchTemplateList();
          void refetchTemplateContent();
          setPublishSuccess(true);
          setOpenPublishDialog2(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('The template contents have been published successfully'),
            },
          });
        } else {
          setPublishSuccess(false);
          setOpenPublishDialog2(true);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('Publish failed. Please try again.'),
            },
          });
        }
      } catch (_e) {
        // console.error(_e);
        setPublishSuccess(false);
        setOpenPublishDialog2(true);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('Publish failed. Please try again.'),
          },
        });
      }
    },
    onError: (error) => {
      if (error !== undefined && error.message.indexOf("reading 'id'") !== -1) {
        // console.log('Incorrect template information.');
      }
      setPublishSuccess(false);
      setOpenPublishDialog2(true);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('Publish failed. Please try again.'),
        },
      });
    },
  });

  const getInitWeatherContent = useCallback((): WeatherContent => {
    const contentCommonLocal: ContentCommon = {
      contentTypeId: '628dd0b71df620dbe8629248',
      contentName: t('Weather Content'),
    };
    const weatherContentDetailLocal: WeatherContentDetail = {
      weatherStyleId: '628dd82d1df620dbe862924d',
      temperatureUnit: 'C',
      windSpeedUnit: 'K',
      languageId: '628c7cc23722a78e25c70f3b',
      backgroundColor: 'FF0000',
      durations: 5,
      citys: [],
    };
    const weatherContentInfoLocal: WeatherContent = {
      contentCommon: contentCommonLocal,
      contentDetail: weatherContentDetailLocal,
    };
    return weatherContentInfoLocal;
  }, [t]);

  const getInitMediaContent = useCallback((): MediaContent => {
    const contentCommonLocal: ContentCommon = {
      contentTypeId: '628dd0b71df620dbe8629247',
      contentName: t('Media Content'),
    };
    const mediaContentDetailLocal: MediaContentDetail = { media: [] };
    const mediaContentInfoLocal: MediaContent = {
      contentCommon: contentCommonLocal,
      contentDetail: mediaContentDetailLocal,
    };
    return mediaContentInfoLocal;
  }, [t]);

  const getInitWebPageContent = useCallback((): WebPageContent => {
    const contentCommonLocal: ContentCommon = {
      contentTypeId: '628dd0b71df620dbe8629249',
      contentName: t('Web Content'),
    };
    const webPageContentDetailLocal: WebPageContentDetail = { webpage: [] };
    const webPageContentInfoLocal: WebPageContent = {
      contentCommon: contentCommonLocal,
      contentDetail: webPageContentDetailLocal,
    };
    return webPageContentInfoLocal;
  }, [t]);

  const getInitIPCamContent = useCallback((): IPCamContent => {
    const contentCommonLocal: ContentCommon = {
      contentTypeId: '628dd0b71df620dbe862924a',
      contentName: t('IPCam Content'),
    };
    const ipcamContentDetailLocal: IPCamContentDetail = { ipcam: [] };
    const ipcamContentInfoLocal: IPCamContent = {
      contentCommon: contentCommonLocal,
      contentDetail: ipcamContentDetailLocal,
    };
    return ipcamContentInfoLocal;
  }, [t]);

  const getInitTemplateContents = useCallback(
    (imgSelectedIndexLocal: number) => {
      const templateContentsLocal: TemplateContent[] = [];
      switch (imgSelectedIndexLocal) {
        case 0: // A
          templateContentsLocal.push({
            content: getInitWeatherContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect2',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect3',
          });
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect4',
          });
          break;
        case 1: // B
          templateContentsLocal.push({
            content: getInitWeatherContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect2',
          });
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect3',
          });
          break;
        case 2: // C
          templateContentsLocal.push({
            content: getInitWeatherContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect2',
          });
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect3',
          });
          break;
        case 3: // D
          templateContentsLocal.push({
            content: getInitWeatherContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect2',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect3',
          });
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect4',
          });
          templateContentsLocal.push({
            content: getInitIPCamContent(),
            rectId: 'rect5',
          });
          break;
        case 4: // E
          templateContentsLocal.push({
            content: getInitWeatherContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect2',
          });
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect3',
          });
          templateContentsLocal.push({
            content: getInitIPCamContent(),
            rectId: 'rect4',
          });
          break;
        case 5: // F
          templateContentsLocal.push({
            content: getInitWeatherContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect2',
          });
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect3',
          });
          templateContentsLocal.push({
            content: getInitIPCamContent(),
            rectId: 'rect4',
          });
          templateContentsLocal.push({
            content: getInitIPCamContent(),
            rectId: 'rect5',
          });
          break;
        case 6: // G
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitWeatherContent(),
            rectId: 'rect2',
          });
          break;
        case 7: // H
          templateContentsLocal.push({
            content: getInitWeatherContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect2',
          });
          break;
        case 8: // I
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect2',
          });
          break;
        case 9: // J
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitWeatherContent(),
            rectId: 'rect2',
          });
          templateContentsLocal.push({
            content: getInitIPCamContent(),
            rectId: 'rect3',
          });
          break;
        case 10: // K
          templateContentsLocal.push({
            content: getInitWeatherContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitIPCamContent(),
            rectId: 'rect2',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect3',
          });
          break;
        case 11: // L
          templateContentsLocal.push({
            content: getInitWebPageContent(),
            rectId: 'rect1',
          });
          templateContentsLocal.push({
            content: getInitMediaContent(),
            rectId: 'rect2',
          });
          templateContentsLocal.push({
            content: getInitIPCamContent(),
            rectId: 'rect3',
          });
          break;
        default:
          break;
      }
      return templateContentsLocal;
    },
    [getInitIPCamContent, getInitMediaContent, getInitWeatherContent, getInitWebPageContent],
  );

  const getTemplateContentsIndex = useCallback((selectedRectIdLocal: string) => {
    let rectIndex = -1;
    if (
      selectedRectIdLocal !== undefined &&
      selectedRectIdLocal.replace('rect', '').trim() !== ''
    ) {
      rectIndex = parseInt(selectedRectIdLocal.replace('rect', '').trim(), 10) - 1;
    }
    return rectIndex;
  }, []);

  const handleCheckContentFieldsData = useCallback((templateContentsLocal: TemplateContent[]) => {
    let isValid = false;
    if (templateContentsLocal !== undefined && templateContentsLocal.length > 0) {
      for (let i = 0; i < templateContentsLocal.length; i += 1) {
        if (
          templateContentsLocal[i].content.contentCommon.contentName !== undefined &&
          templateContentsLocal[i].content.contentCommon.contentName.trim() !== ''
        )
          isValid = true;
        else {
          isValid = false;
          break;
        }
      }
    }
    return isValid;
  }, []);

  const updateWeatherContent = useCallback(
    (templateContent: TemplateContent, rectId: string) => {
      if (templateContents && templateContents.length > 0) {
        templateContents[getTemplateContentsIndex(rectId)].content =
          templateContent.content as WeatherContent;
        if (handleCheckContentFieldsData(templateContents)) {
          setNextButtonDisabled(false);
          setSaveButtonDisabled(false);
        } else {
          setNextButtonDisabled(true);
          setSaveButtonDisabled(true);
        }
        setTemplateContents(templateContents);
      }
    },
    [getTemplateContentsIndex, handleCheckContentFieldsData, templateContents],
  );

  const updateMediaContent = useCallback(
    (templateContent: TemplateContent, rectId: string) => {
      if (templateContents && templateContents.length > 0) {
        templateContents[getTemplateContentsIndex(rectId)].content =
          templateContent.content as MediaContent;
        if (handleCheckContentFieldsData(templateContents)) {
          setNextButtonDisabled(false);
          setSaveButtonDisabled(false);
        } else {
          setNextButtonDisabled(true);
          setSaveButtonDisabled(true);
        }
        setTemplateContents(templateContents);
      }
    },
    [getTemplateContentsIndex, handleCheckContentFieldsData, templateContents],
  );

  const updateWebPageContent = useCallback(
    (templateContent: TemplateContent, rectId: string) => {
      if (templateContents && templateContents.length > 0) {
        templateContents[getTemplateContentsIndex(rectId)].content =
          templateContent.content as WebPageContent;
        if (handleCheckContentFieldsData(templateContents)) {
          setNextButtonDisabled(false);
          setSaveButtonDisabled(false);
        } else {
          setNextButtonDisabled(true);
          setSaveButtonDisabled(true);
        }
        setTemplateContents(templateContents);
      }
    },
    [getTemplateContentsIndex, handleCheckContentFieldsData, templateContents],
  );

  const updateIPCamContent = useCallback(
    (templateContent: TemplateContent, rectId: string) => {
      if (templateContents && templateContents.length > 0) {
        templateContents[getTemplateContentsIndex(rectId)].content =
          templateContent.content as IPCamContent;
        if (handleCheckContentFieldsData(templateContents)) {
          setNextButtonDisabled(false);
          setSaveButtonDisabled(false);
        } else {
          setNextButtonDisabled(true);
          setSaveButtonDisabled(true);
        }
        setTemplateContents(templateContents);
      }
    },
    [getTemplateContentsIndex, handleCheckContentFieldsData, templateContents],
  );

  const handleOnChangeStep = useCallback((activeStep: number) => {
    stepRef.current = activeStep;
    setStep(stepRef.current);
    setStepAction('NEXT');
  }, []);

  const handleOnChangeSelectedESignagePlayers = useCallback(
    (selectedESignagePlayersLocal: ListItemDataSource[]) => {
      const players: string[] = [];

      for (let i = 0; i < selectedESignagePlayersLocal.length; i += 1) {
        players.push(selectedESignagePlayersLocal[i].value);
      }

      if (templateSchedule !== undefined) setTemplateSchedule({ ...templateSchedule, players });

      if (selectedESignagePlayersLocal !== undefined && selectedESignagePlayersLocal.length > 0) {
        setNextButtonDisabled(false);
      } else {
        setNextButtonDisabled(true);
      }
    },
    [templateSchedule],
  );

  const handleTempleteTabContent = useCallback(() => {
    setAddButtonStyle({ display: 'inline' });
    setModifyButtonStyle({ display: 'none' }); // default: inline
    setDividerStyle({ display: 'none' }); // default: inline
    setDeleteButtonStyle({ display: 'none' }); // default: inline
    setExitButtonStyle({ display: 'none' });

    setResetViewerUI(true);
    void refetchTemplateList();
    const tabContentLocal = (
      <div className={classes.tab}>
        <ImageViewer
          resetUI
          dataSource={templateListDataSource}
          idMappingReference={templateTypeId}
          onChangeIndex={handleOnChangeIndex}
        />
      </div>
    );
    setDisplayStepper(false);
    setDisplayNextButton(false);

    setTabContent(tabContentLocal);
    setTabContent2(null);

    setCancelButtonStyle(hideStyle);
    setBackButtonStyle(hideStyle);
    setNextButtonStyle(hideStyle);
    setNextButtonDisabled(false);
    setSaveButtonStyle(saveButtonHideStyle);
    setPublishButtonStyle(publishButtonHideStyle);
  }, [
    classes.tab,
    handleOnChangeIndex,
    hideStyle,
    publishButtonHideStyle,
    refetchTemplateList,
    saveButtonHideStyle,
    templateListDataSource,
    templateTypeId,
  ]);

  const handleScheduleTabContent = useCallback(() => {
    setAddButtonStyle({ display: 'none' });
    setModifyButtonStyle({ display: 'none' });
    setDividerStyle({ display: 'none' });
    setDeleteButtonStyle({ display: 'none' });
    setExitButtonStyle({ display: 'inline' });

    stepRef.current = 0;
    if (imgSelectedIndex !== undefined && imgSelectedIndex >= 0) {
      if (stepRef.current < scheduleSteps.length) {
        void refetchTemplateSchedule();
        setStep(stepRef.current);
        setStepAction('RESET');

        // const templateId =
        //   templateListDataSource !== undefined &&
        //   templateListDataSource[imgSelectedIndex]?.key !== undefined
        //     ? templateListDataSource[imgSelectedIndex].key
        //     : '';
        // console.info('templateId: ', templateId);
        // console.info('scheduleId: ', scheduleId.current);

        if (scheduleId !== undefined && scheduleId.current !== '') {
          setExecPublish('Publish3-UpdateSchdule');
        } else {
          setExecPublish('Publish3-AddSchdule');
        }
        const tabContentLocal = (
          <div className={classes.templateInfoPanel}>
            <ESignagePlayerSelector
              selectedESignagePlayers={selectedESignagePlayers}
              setSelectedESignagePlayers={setSelectedESignagePlayers}
              onChangeSelectedItems={handleOnChangeSelectedESignagePlayers}
            />
          </div>
        );

        setTabContent(null);
        setTabContent2(tabContentLocal);
        setDisplayStepper(true);
        setCancelButtonStyle(displayStyle);
        setBackButtonStyle(hideStyle);
        setNextButtonStyle(displayStyle);

        if (selectedESignagePlayers.length > 0) setNextButtonDisabled(false);
        else setNextButtonDisabled(true);

        setSaveButtonStyle(saveButtonHideStyle);
        setPublishButtonStyle(publishButtonHideStyle);
      }
    }
  }, [
    classes.templateInfoPanel,
    displayStyle,
    handleOnChangeSelectedESignagePlayers,
    hideStyle,
    imgSelectedIndex,
    publishButtonHideStyle,
    refetchTemplateSchedule,
    saveButtonHideStyle,
    scheduleSteps.length,
    selectedESignagePlayers,
  ]);

  const handleSelectTab = useCallback(
    (currentIndex: number) => {
      setTabIndex(currentIndex);

      switch (currentIndex) {
        case 0:
          setAction('');
          currentAction.current = '';
          handleTempleteTabContent();
          break;
        case 1:
          setAction('SCHEDULE');
          currentAction.current = 'SCHEDULE';
          handleScheduleTabContent();
          break;
        default:
      }
      setAction('');
      currentAction.current = '';
    },
    [handleScheduleTabContent, handleTempleteTabContent],
  );

  const handleCancel = useCallback(() => {
    setExecPublish('');
    setSaveSuccess(false);
    setDeleteSuccess(false);
    setPublishSuccess(false);
    setOpenPublishDialog(false);
    setResetViewerUI(true);
    setSelectedESignagePlayers([]);
    void refetchTemplateSchedule();
    const tabContentLocal = () => (
      <ImageViewer resetUI={resetViewerUI} dataSource={[]} onChangeIndex={undefined} />
    );
    setTabContent(tabContentLocal);
    setDisplayStepper(false);
    setDisplayNextButton(false);
    setDisplayTemplateBasicSaveButton(false);
    setTemplateContents([]);
    setTemplateSchedule(handleInitTemplateSchedule());

    setImgSelectedIndex(-1);
    stepRef.current = 0;
    setStep(stepRef.current);
    setStepAction('RESET');
    handleSelectTab(0);
    setAddButtonStyle({ display: 'inline' });
    setModifyButtonStyle({ display: 'none' }); // default: inline
    setDividerStyle({ display: 'none' }); // default: inline
    setDeleteButtonStyle({ display: 'none' }); // default: inline
    setExitButtonStyle({ display: 'none' });
    setAction('');
    currentAction.current = '';
    setModifyDetails(false);
  }, [handleInitTemplateSchedule, handleSelectTab, refetchTemplateSchedule, resetViewerUI]);

  const handleAlertDialogOnChangeState = useCallback((dialogState: boolean) => {
    setOpenDialog(dialogState);
  }, []);

  const handleAlertDialog2OnChangeState = useCallback((dialogState: boolean) => {
    setOpenDialog2(dialogState);
    setAction('');
    currentAction.current = '';
    setInitial(true);
  }, []);

  const handleAlertDialog3OnChangeState = useCallback(
    (dialogState: boolean, returnValue: string | undefined | 'YES' | 'NO') => {
      if (returnValue !== undefined && returnValue === 'YES') {
        if (imgSelectedIndex !== undefined && imgSelectedIndex >= 0) {
          if (
            permissionGroup !== undefined &&
            permissionGroup !== null &&
            templateListDataSource !== undefined
          ) {
            const groupId = permissionGroup?.group.id;
            const templateId =
              templateListDataSource && templateListDataSource[imgSelectedIndex].key;

            void deleteTemplate({
              variables: { groupId, templateId },
            });
          }
        }
      } else {
        setAction('');
        currentAction.current = '';
        setInitial(true);
      }
      setOpenDialog3(dialogState);
    },
    [deleteTemplate, imgSelectedIndex, permissionGroup, templateListDataSource],
  );

  const handleAlertDialog4OnChangeState = useCallback((dialogState: boolean) => {
    setOpenDialog4(dialogState);
    setAction('');
    currentAction.current = '';
    setInitial(true);
  }, []);

  const handleAlertDialogOnDelete = useCallback(
    (_dialogState: boolean) => {
      setOpenDeleteDialog(false);
      if (deleteSuccess) {
        setInitial(true); //
        handleCancel();
      }
    },
    [handleCancel, deleteSuccess],
  );

  const handleAdd = useCallback(
    (imgSelectedIndexTmp?: number | undefined) => {
      setTemplateContents(
        getInitTemplateContents(imgSelectedIndexTmp !== undefined ? imgSelectedIndexTmp : -1),
      );
      setTemplateSchedule(handleInitTemplateSchedule());
      setSelectedESignagePlayers([]);

      setResetViewerUI(true);
      const tabContentLocal = (
        <div className={classes.tab}>
          <ImageViewer
            resetUI
            dataSource={imageDataSource}
            selectedIndex={imgSelectedIndexTmp}
            onChangeIndex={handleOnChangeIndex}
          />
        </div>
      );
      setTabContent(tabContentLocal);
      setDisplayStepper(true);
      setDisplayNextButton(true);
      setImgSelectedIndex(imgSelectedIndexTmp !== undefined ? imgSelectedIndexTmp : -1);
      stepRef.current = 0;
      setStep(stepRef.current);
      setStepAction('RESET');
      setCancelButtonStyle(displayStyle);
      setBackButtonStyle(hideStyle);
      setNextButtonStyle(displayStyle);
      setSaveButtonStyle(saveButtonHideStyle);
      setPublishButtonStyle(publishButtonHideStyle);

      setAddButtonStyle({ display: 'none' });
      setModifyButtonStyle({ display: 'none' });
      setDividerStyle({ display: 'none' });
      setDeleteButtonStyle({ display: 'none' });
      setExitButtonStyle({ display: 'inline' });
      setAction('ADD');
      currentAction.current = 'ADD';
      setInitial(true);
      setNextButtonDisabled(false);
      // setTemplateContents(getInitTemplateContents(imgSelectedIndex));
      setPreviousImgSelectedIndex(imgSelectedIndex);
      // setSelectedESignagePlayers([]);
    },
    [
      classes.tab,
      displayStyle,
      getInitTemplateContents,
      handleInitTemplateSchedule,
      handleOnChangeIndex,
      hideStyle,
      imageDataSource,
      imgSelectedIndex,
      publishButtonHideStyle,
      saveButtonHideStyle,
    ],
  );

  const handleDelete = useCallback(() => {
    if (imgSelectedIndex !== undefined && imgSelectedIndex >= 0) {
      setOpenDialog3(true);
    } else setOpenDialog2(true);
    setAction('DELETE');
    currentAction.current = 'DELETE';
    setInitial(true);
  }, [imgSelectedIndex]);

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

  const handleOnTemplateBasicChanged = useCallback(
    (newTemplateBasicInfo: TemplateBasic) => {
      if (newTemplateBasicInfo !== undefined && permissionGroup !== null) {
        if (
          newTemplateBasicInfo.groupId !== undefined &&
          newTemplateBasicInfo.groupId !== '' &&
          newTemplateBasicInfo.templateName !== undefined &&
          newTemplateBasicInfo.templateName !== ''
        ) {
          setNextButtonDisabled(false);
          setSaveButtonDisabled(false);
        } else {
          setNextButtonDisabled(true);
          setSaveButtonDisabled(true);
        }
        setTemplateBasicInfo(newTemplateBasicInfo);
      }
    },
    [permissionGroup],
  );

  const handleOnWeatherContentChanged = useCallback(
    (newWeatherContentInfo: WeatherContent, rectId: string) => {
      if (
        newWeatherContentInfo !== undefined &&
        newWeatherContentInfo.contentCommon.contentName !== undefined &&
        newWeatherContentInfo.contentCommon.contentName !== ''
        // && !changeContentTypeRef.current
      ) {
        if (rectId !== undefined && rectId.indexOf('rect') > -1) {
          const templateContent: TemplateContent = {
            content: newWeatherContentInfo,
            rectId,
          };
          updateWeatherContent(templateContent, rectId);
        }
      } else {
        setNextButtonDisabled(true);
        setSaveButtonDisabled(true);
      }
      if (changeContentTypeRef) {
        changeContentTypeRef.current = false;
      }
    },
    [updateWeatherContent],
  );

  const handleOnMediaContentChanged = useCallback(
    (newMediaContentInfo: MediaContent, rectId: string) => {
      // todo
      // !changeContentTypeRef.current 第一次拖拉是 false，之後都是 true
      // 但是這裡似乎不需要這個邏輯判斷
      // 先把這個邏輯註解
      // 之後有 redmine 之後，就可以把整個註解刪掉
      // if (newMediaContentInfo !== undefined && !changeContentTypeRef.current) {
      //   if (rectId !== undefined && rectId.indexOf('rect') > -1) {
      //     const templateContent: TemplateContent = {
      //       content: newMediaContentInfo,
      //       rectId,
      //     };
      //     updateMediaContent(templateContent, rectId);
      //   }
      // }
      if (
        newMediaContentInfo &&
        newMediaContentInfo.contentCommon.contentName !== undefined &&
        newMediaContentInfo.contentCommon.contentName !== '' &&
        rectId &&
        rectId.indexOf('rect') > -1
      ) {
        const templateContent: TemplateContent = {
          content: newMediaContentInfo,
          rectId,
        };
        updateMediaContent(templateContent, rectId);
      } else {
        setNextButtonDisabled(true);
        setSaveButtonDisabled(true);
      }

      if (changeContentTypeRef.current) {
        changeContentTypeRef.current = false;
      }
    },
    [updateMediaContent],
  );

  const handleOnWebPageContentChanged = useCallback(
    (newWebPageContentInfo: WebPageContent, rectId: string) => {
      if (
        newWebPageContentInfo !== undefined &&
        newWebPageContentInfo.contentCommon.contentName !== undefined &&
        newWebPageContentInfo.contentCommon.contentName !== ''
        // && !changeContentTypeRef.current
      ) {
        if (rectId !== undefined && rectId.indexOf('rect') > -1) {
          const templateContent: TemplateContent = {
            content: newWebPageContentInfo,
            rectId,
          };
          updateWebPageContent(templateContent, rectId);
        }
      } else {
        setNextButtonDisabled(true);
        setSaveButtonDisabled(true);
      }
      if (changeContentTypeRef.current) {
        changeContentTypeRef.current = false;
      }
    },
    [updateWebPageContent],
  );

  const handleOnIPCamContentChanged = useCallback(
    (newIPCamContentInfo: IPCamContent, rectId: string) => {
      if (
        newIPCamContentInfo !== undefined &&
        newIPCamContentInfo.contentCommon.contentName !== undefined &&
        newIPCamContentInfo.contentCommon.contentName !== '' &&
        // && !changeContentTypeRef.current
        newIPCamContentInfo.contentDetail.ipcam !== undefined &&
        (newIPCamContentInfo.contentDetail.ipcam.length === 0 ||
          (newIPCamContentInfo.contentDetail.ipcam.length > 0 &&
            newIPCamContentInfo.contentDetail.ipcam[0].camName.trim() !== '' &&
            newIPCamContentInfo.contentDetail.ipcam[0].rtspUrl.trim() !== '' &&
            isValidUrl(newIPCamContentInfo.contentDetail.ipcam[0].rtspUrl.trim())))
      ) {
        if (rectId !== undefined && rectId.indexOf('rect') > -1) {
          const templateContent: TemplateContent = {
            content: newIPCamContentInfo,
            rectId,
          };

          // console.info('handleOnIPCamContentChanged esignage-Event:', newIPCamContentInfo);()
          updateIPCamContent(templateContent, rectId);
        }
      } else {
        setNextButtonDisabled(true);
        setSaveButtonDisabled(true);
      }
      if (changeContentTypeRef.current) {
        changeContentTypeRef.current = false;
      }
    },
    [isValidUrl, updateIPCamContent],
  );

  const handleOnTemplateScheduleChanged = useCallback(
    (newTemplateScheduleInfo: TemplateSchedule) => {
      const newTemplateScheduleInfoCopy: TemplateSchedule = { ...newTemplateScheduleInfo };

      if (newTemplateScheduleInfoCopy !== undefined) {
        if (
          newTemplateScheduleInfoCopy.downloadDirectly !== undefined &&
          newTemplateScheduleInfoCopy.downloadDirectly
        )
          setPublishMode('I');
        else setPublishMode('S');

        // console.info(
        //   'playStartTime: ',
        //   newTemplateScheduleInfoCopy.playStartTime,
        //   'playEndTime: ',
        //   newTemplateScheduleInfoCopy.playEndTime,
        // );

        if (
          newTemplateScheduleInfoCopy.templateId &&
          newTemplateScheduleInfoCopy.templateId.trim() === ''
        ) {
          newTemplateScheduleInfoCopy.templateId =
            templateListDataSource !== undefined &&
            templateListDataSource[imgSelectedIndex]?.key !== undefined
              ? templateListDataSource[imgSelectedIndex].key
              : '';
          // console.info('templateId: ', newTemplateScheduleInfoCopy.templateId);
        }

        if (
          newTemplateScheduleInfoCopy.players !== null &&
          newTemplateScheduleInfoCopy.players?.length === 0
        ) {
          const players: string[] = [];
          for (let i = 0; i < selectedESignagePlayers.length; i += 1) {
            players.push(selectedESignagePlayers[i].value);
          }
          newTemplateScheduleInfoCopy.players = players;
        }
        // console.info('newTemplateScheduleInfoCopy:', newTemplateScheduleInfoCopy);
        if (
          newTemplateScheduleInfoCopy.scheduleName &&
          newTemplateScheduleInfoCopy.scheduleName.trim() !== '' &&
          (newTemplateScheduleInfoCopy.scheduledDownloadTime === null ||
            (newTemplateScheduleInfoCopy.scheduledDownloadTime &&
              !Number.isNaN(
                Date.parse(newTemplateScheduleInfoCopy.scheduledDownloadTime.toString()),
              ))) &&
          newTemplateScheduleInfoCopy.playStartDate &&
          !Number.isNaN(Date.parse(newTemplateScheduleInfoCopy.playStartDate.toString())) &&
          newTemplateScheduleInfoCopy.playEndDate &&
          !Number.isNaN(Date.parse(newTemplateScheduleInfoCopy.playEndDate.toString())) &&
          newTemplateScheduleInfoCopy.playEndDate >= newTemplateScheduleInfoCopy.playStartDate &&
          newTemplateScheduleInfoCopy.playStartTime &&
          !Number.isNaN(Date.parse(newTemplateScheduleInfoCopy.playStartTime)) &&
          newTemplateScheduleInfoCopy.playEndTime &&
          !Number.isNaN(Date.parse(newTemplateScheduleInfoCopy.playEndTime)) &&
          new Date(newTemplateScheduleInfoCopy.playEndTime) >
            new Date(newTemplateScheduleInfoCopy.playStartTime)
        ) {
          // console.info(newTemplateScheduleInfoCopy);
          if (
            newTemplateScheduleInfoCopy.loopMode === 'W' &&
            (newTemplateScheduleInfoCopy.weeklyFrequency === null ||
              newTemplateScheduleInfoCopy.weeklyFrequency?.length === 0)
          )
            setPublishButtonDisabled(true);
          else if (
            newTemplateScheduleInfoCopy.loopMode === 'M' &&
            (newTemplateScheduleInfoCopy.monthlyFrequency_Month === null ||
              newTemplateScheduleInfoCopy.monthlyFrequency_Month.length === 0 ||
              newTemplateScheduleInfoCopy.monthlyFrequency_Day === null ||
              newTemplateScheduleInfoCopy.monthlyFrequency_Day.length === 0)
          )
            setPublishButtonDisabled(true);
          else setPublishButtonDisabled(false);
        } else {
          setPublishButtonDisabled(true);
        }

        setTemplateSchedule(newTemplateScheduleInfoCopy);
      }
    },
    [imgSelectedIndex, selectedESignagePlayers, templateListDataSource],
  );

  const handleOnChangeType = useCallback(
    (contentType: string, selectedRectId: string) => {
      let tabContentLocal;
      const templateContentsIndex: number = getTemplateContentsIndex(selectedRectId);

      if (
        contentType !== undefined &&
        contentType.trim() !== '' // && contentTypeRef.current !== contentType
      ) {
        contentTypeRef.current = contentType;
        changeContentTypeRef.current = false;
      } else changeContentTypeRef.current = true;

      let templateIndexLocal = -1;

      if (action !== 'ADD') {
        templateIndexLocal =
          templateListDataSource !== undefined && templateListDataSource.length > 0
            ? getTemplateIndex(templateListDataSource[imgSelectedIndex].id)
            : -1;
      }
      switch (contentType) {
        case 'Weather Content':
        case 'Weather Content2':
          if (action !== undefined && action === 'ADD') {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <WeatherContentInfo
                  templateIndex={
                    imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                  }
                  rectId={selectedRectId}
                  weatherContent={
                    templateContents &&
                    templateContents[templateContentsIndex] &&
                    templateContents[templateContentsIndex].content &&
                    (templateContents[templateContentsIndex].content as WeatherContent)
                  }
                  onWeatherContentChanged={handleOnWeatherContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          } else {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <WeatherContentInfo
                  templateIndex={
                    templateIndexLocal !== undefined && templateIndexLocal > -1
                      ? templateIndexLocal
                      : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[templateIndexLocal].title : undefined
                  }
                  rectId={selectedRectId}
                  weatherContent={
                    templateContents &&
                    templateContents[templateContentsIndex] &&
                    templateContents[templateContentsIndex].content &&
                    (templateContents[templateContentsIndex].content as WeatherContent)
                  }
                  onWeatherContentChanged={handleOnWeatherContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          }
          break;
        case 'Media Content':
        case 'Media Content2':
          if (action !== undefined && action === 'ADD') {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <MediaContentInfo
                  templateIndex={
                    imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                  }
                  rectId={selectedRectId}
                  mediaContent={
                    templateContents &&
                    templateContents[templateContentsIndex] &&
                    templateContents[templateContentsIndex].content &&
                    (templateContents[templateContentsIndex].content as MediaContent)
                  }
                  onMediaContentChanged={handleOnMediaContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          } else {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <MediaContentInfo
                  templateIndex={
                    templateIndexLocal !== undefined && templateIndexLocal > -1
                      ? templateIndexLocal
                      : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[templateIndexLocal].title : undefined
                  }
                  rectId={selectedRectId}
                  mediaContent={
                    templateContents &&
                    templateContents[templateContentsIndex] &&
                    templateContents[templateContentsIndex].content &&
                    (templateContents[templateContentsIndex].content as MediaContent)
                  }
                  onMediaContentChanged={handleOnMediaContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          }

          break;
        case 'Web Content':
        case 'Web Content2':
          if (action !== undefined && action === 'ADD') {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <WebContentInfo
                  templateIndex={
                    imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                  }
                  rectId={selectedRectId}
                  webPageContent={
                    templateContents &&
                    templateContents[templateContentsIndex] &&
                    templateContents[templateContentsIndex].content &&
                    (templateContents[templateContentsIndex].content as WebPageContent)
                  }
                  onWebPageContentChanged={handleOnWebPageContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          } else {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <WebContentInfo
                  templateIndex={
                    templateIndexLocal !== undefined && templateIndexLocal > -1
                      ? templateIndexLocal
                      : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[templateIndexLocal].title : undefined
                  }
                  rectId={selectedRectId}
                  webPageContent={
                    templateContents &&
                    templateContents[templateContentsIndex] &&
                    templateContents[templateContentsIndex].content &&
                    (templateContents[templateContentsIndex].content as WebPageContent)
                  }
                  onWebPageContentChanged={handleOnWebPageContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          }
          break;
        case 'IPCam Content':
        case 'IPCam Content2':
          if (action !== undefined && action === 'ADD') {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <IPCamContentInfo
                  templateIndex={
                    imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                  }
                  rectId={selectedRectId}
                  ipcamContent={
                    templateContents &&
                    templateContents[templateContentsIndex] &&
                    templateContents[templateContentsIndex].content &&
                    (templateContents[templateContentsIndex].content as IPCamContent)
                  }
                  onIPCamContentChanged={handleOnIPCamContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          } else {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <IPCamContentInfo
                  templateIndex={
                    templateIndexLocal !== undefined && templateIndexLocal > -1
                      ? templateIndexLocal
                      : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[templateIndexLocal].title : undefined
                  }
                  rectId={selectedRectId}
                  ipcamContent={
                    templateContents &&
                    templateContents[templateContentsIndex] &&
                    templateContents[templateContentsIndex].content &&
                    (templateContents[templateContentsIndex].content as IPCamContent)
                  }
                  onIPCamContentChanged={handleOnIPCamContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          }

          break;
        default:
          if (contentType === '') return;
          break;
      }
      setTabContent(tabContentLocal);
      if (action === 'ADD') {
        setCancelButtonStyle(hideStyle);
        setBackButtonStyle(displayStyle);
        // setNextButtonStyle(displayStyle);
        setNextButtonStyle(hideStyle);
      } else {
        setCancelButtonStyle(displayStyle);
        setBackButtonStyle(hideStyle);
        setNextButtonStyle(displayStyle);
      }
    },
    [
      action,
      classes.templateInfoPanel,
      displayStyle,
      getTemplateContentsIndex,
      getTemplateIndex,
      handleOnIPCamContentChanged,
      handleOnMediaContentChanged,
      handleOnWeatherContentChanged,
      handleOnWebPageContentChanged,
      hideStyle,
      imageDataSource,
      imgSelectedIndex,
      templateContents,
      templateListDataSource,
    ],
  );

  const handleBack = useCallback(() => {
    let tabContentLocal;
    const selectedRectId = 'rect1';
    if (imgSelectedIndex !== undefined && imgSelectedIndex >= 0) {
      if (stepRef.current < steps.length) {
        stepRef.current -= 1;
        setStep(stepRef.current);
        setStepAction('BACK');
        tabContentLocal = (
          <div className={classes.emptyPanel}>
            <div>{steps[stepRef.current]}</div>
          </div>
        );
      }
      // console.log(String().concat('imgSelectedIndex:', imgSelectedIndex.toString()));
      // console.log(String().concat('stepRef:', stepRef.current.toString()));
      switch (stepRef.current) {
        case 0:
          // console.log(String().concat('imgSelectedIndex:', imgSelectedIndex.toString()));
          handleAdd(
            imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1,
          );
          setCancelButtonStyle(displayStyle);
          setBackButtonStyle(hideStyle);
          setNextButtonStyle(displayStyle);
          setNextButtonDisabled(false);
          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 1:
          // console.log(String().concat('imgSelectedIndex:', imgSelectedIndex.toString()));
          if (imgSelectedIndex !== previousImgSelectedIndex) {
            setTemplateContents(getInitTemplateContents(imgSelectedIndex));
            setPreviousImgSelectedIndex(imgSelectedIndex);
          }
          tabContentLocal = (
            <div className={classes.templateInfoPanel}>
              <TemplateInfo
                templateIndex={
                  imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                }
                templateTypeId={templateTypeId[imgSelectedIndex]}
                templateTitle={
                  imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                }
                templateBasic={templateBasicInfo}
                onTemplateBasicChanged={handleOnTemplateBasicChanged}
              />
            </div>
          );
          setTabContent(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(displayStyle);
          setNextButtonDisabled(true);
          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 2:
          // console.log(String().concat('imgSelectedIndex:', imgSelectedIndex.toString()));
          if (
            imgSelectedIndex === 6 ||
            imgSelectedIndex === 8 ||
            imgSelectedIndex === 9 ||
            imgSelectedIndex === 11
          ) {
            contentTypeRef.current = 'Web Content';

            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <WebContentInfo
                  templateIndex={
                    imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                  }
                  rectId={selectedRectId}
                  webPageContent={templateContents[0].content as WebPageContent}
                  onWebPageContentChanged={handleOnWebPageContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          } else {
            contentTypeRef.current = 'Weather Content';

            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <WeatherContentInfo
                  templateIndex={
                    imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                  }
                  rectId={selectedRectId}
                  weatherContent={templateContents[0].content as WeatherContent}
                  onWeatherContentChanged={handleOnWeatherContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          }
          setTabContent(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(hideStyle);
          if (handleCheckContentFieldsData(templateContents)) {
            setNextButtonDisabled(false);
            setSaveButtonDisabled(false);
          } else {
            setNextButtonDisabled(true);
            setSaveButtonDisabled(true);
          }
          setSaveButtonStyle(saveButtonDisplayStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 3:
          tabContentLocal = (
            <div className={classes.templateInfoPanel}>
              <ESignagePlayerSelector
                selectedESignagePlayers={selectedESignagePlayers}
                setSelectedESignagePlayers={setSelectedESignagePlayers}
                onChangeSelectedItems={handleOnChangeSelectedESignagePlayers}
              />
            </div>
          );
          setTabContent(tabContentLocal);
          setCancelButtonStyle(displayStyle);
          setBackButtonStyle(hideStyle);
          setNextButtonStyle(displayStyle);

          if (selectedESignagePlayers.length > 0) setNextButtonDisabled(false);
          else setNextButtonDisabled(true);

          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 4:
          if (imgSelectedIndex !== previousImgSelectedIndex) {
            setTemplateContents(getInitTemplateContents(imgSelectedIndex));
            setPreviousImgSelectedIndex(imgSelectedIndex);
          }

          if (templateSchedule !== undefined) {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <ScheduleAndPublish
                  templateIndex={
                    imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                  }
                  templateId=""
                  templateTypeId={templateTypeId[imgSelectedIndex]}
                  templateTitle={
                    imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                  }
                  selectedESignagePlayers={selectedESignagePlayers}
                  templateSchedule={templateSchedule}
                  onTemplateScheduleChanged={handleOnTemplateScheduleChanged}
                />
              </div>
            );
          }

          setTabContent(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(hideStyle);
          setNextButtonDisabled(false);
          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonDisplayStyle);
          break;
        default:
      }
    }
  }, [
    classes.emptyPanel,
    classes.templateInfoPanel,
    displayStyle,
    getInitTemplateContents,
    handleAdd,
    handleCheckContentFieldsData,
    handleOnChangeSelectedESignagePlayers,
    handleOnChangeType,
    handleOnTemplateBasicChanged,
    handleOnTemplateScheduleChanged,
    handleOnWeatherContentChanged,
    handleOnWebPageContentChanged,
    hideStyle,
    imageDataSource,
    imgSelectedIndex,
    previousImgSelectedIndex,
    publishButtonDisplayStyle,
    publishButtonHideStyle,
    saveButtonDisplayStyle,
    saveButtonHideStyle,
    selectedESignagePlayers,
    steps,
    templateBasicInfo,
    templateContents,
    templateSchedule,
    templateTypeId,
  ]);

  const handleBack2 = useCallback(() => {
    let tabContentLocal;
    const selectedRectId = 'rect1';
    if (imgSelectedIndex !== undefined && imgSelectedIndex >= 0) {
      const templateIndexLocal =
        templateListDataSource !== undefined && templateListDataSource.length > 0
          ? getTemplateIndex(templateListDataSource[imgSelectedIndex].id)
          : -1;

      if (stepRef.current < updateSteps.length) {
        stepRef.current -= 1;
        setStep(stepRef.current);
        setStepAction('BACK');
        tabContentLocal = (
          <div className={classes.emptyPanel}>
            <div>{updateSteps[stepRef.current]}</div>
          </div>
        );
      }
      // console.log(String().concat('imgSelectedIndex:', imgSelectedIndex.toString()));
      // console.log(String().concat('stepRef:', stepRef.current.toString()));
      switch (stepRef.current) {
        case 0:
          contentTypeRef.current = 'Web Content';
          if (templateIndexLocal > -1 && templateContents.length > 0) {
            setResetViewerUI(true);
            if (
              templateIndexLocal === 6 ||
              templateIndexLocal === 8 ||
              templateIndexLocal === 9 ||
              templateIndexLocal === 11
            ) {
              contentTypeRef.current = 'Web Content';
              tabContentLocal = (
                <div className={classes.templateInfoPanel}>
                  <WebContentInfo
                    templateIndex={
                      templateIndexLocal !== undefined && templateIndexLocal > -1
                        ? templateIndexLocal
                        : -1
                    }
                    templateTitle={
                      imageDataSource ? imageDataSource[templateIndexLocal].title : undefined
                    }
                    rectId={selectedRectId}
                    webPageContent={templateContents[0].content as WebPageContent}
                    onWebPageContentChanged={handleOnWebPageContentChanged}
                    onChangeType={handleOnChangeType}
                  />
                </div>
              );
            } else {
              contentTypeRef.current = 'Weather Content';
              tabContentLocal = (
                <div className={classes.templateInfoPanel}>
                  <WeatherContentInfo
                    templateIndex={
                      templateIndexLocal !== undefined && templateIndexLocal > -1
                        ? templateIndexLocal
                        : -1
                    }
                    templateTitle={
                      imageDataSource ? imageDataSource[templateIndexLocal].title : undefined
                    }
                    rectId={selectedRectId}
                    weatherContent={templateContents[0].content as WeatherContent}
                    onWeatherContentChanged={handleOnWeatherContentChanged}
                    onChangeType={handleOnChangeType}
                  />
                </div>
              );
            }
            setTabContent(tabContentLocal);
            setDisplayStepper(true);
            setDisplayTemplateBasicSaveButton(true);
            setImgSelectedIndex(imgSelectedIndex);
            stepRef.current = 0;
            setStep(stepRef.current);
            setStepAction('RESET');
            setCancelButtonStyle(displayStyle);
            setBackButtonStyle(hideStyle);
            setNextButtonStyle(displayStyle);
            // setNextButtonDisabled(false);
            if (handleCheckContentFieldsData(templateContents)) {
              setNextButtonDisabled(false);
              setSaveButtonDisabled(false);
            } else {
              setNextButtonDisabled(true);
              setSaveButtonDisabled(true);
            }
            setSaveButtonStyle(saveButtonDisplayStyle);
            setPublishButtonStyle(publishButtonHideStyle);

            setAddButtonStyle({ display: 'none' });
            setModifyButtonStyle({ display: 'none' });
            setDividerStyle({ display: 'none' });
            setDeleteButtonStyle({ display: 'none' });
            setExitButtonStyle({ display: 'inline' });
          }
          break;
        case 1:
          tabContentLocal = (
            <div className={classes.templateInfoPanel}>
              <ESignagePlayerSelector
                selectedESignagePlayers={selectedESignagePlayers}
                setSelectedESignagePlayers={setSelectedESignagePlayers}
                onChangeSelectedItems={handleOnChangeSelectedESignagePlayers}
              />
            </div>
          );
          setTabContent(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(displayStyle);

          if (selectedESignagePlayers.length > 0) setNextButtonDisabled(false);
          else setNextButtonDisabled(true);

          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 2:
          if (imgSelectedIndex !== previousImgSelectedIndex) {
            setTemplateContents(getInitTemplateContents(imgSelectedIndex));
            setPreviousImgSelectedIndex(imgSelectedIndex);
          }

          if (
            templateListDataSource !== undefined &&
            templateListDataSource.length > 0 &&
            templateSchedule !== undefined &&
            templateListDataSource !== undefined
          ) {
            let templateIdLocal: string | undefined;
            const templateTypeIdLocal = templateListDataSource[imgSelectedIndex].id;

            if (templateListDataSource[imgSelectedIndex].tag !== undefined) {
              templateIdLocal = templateListDataSource[imgSelectedIndex]?.tag;
            }
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <ScheduleAndPublish
                  templateIndex={templateIndexLocal}
                  templateId={templateIdLocal || ''}
                  templateTypeId={templateTypeIdLocal}
                  templateTitle={
                    templateListDataSource
                      ? templateListDataSource[imgSelectedIndex].title
                      : undefined
                  }
                  selectedESignagePlayers={selectedESignagePlayers}
                  templateSchedule={templateSchedule}
                  onTemplateScheduleChanged={handleOnTemplateScheduleChanged}
                />
              </div>
            );
          }

          setTabContent(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(hideStyle);
          setNextButtonDisabled(false);
          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonDisplayStyle);
          break;
        default:
      }
    }
  }, [
    classes.emptyPanel,
    classes.templateInfoPanel,
    displayStyle,
    getInitTemplateContents,
    getTemplateIndex,
    handleCheckContentFieldsData,
    handleOnChangeSelectedESignagePlayers,
    handleOnChangeType,
    handleOnTemplateScheduleChanged,
    handleOnWeatherContentChanged,
    handleOnWebPageContentChanged,
    hideStyle,
    imageDataSource,
    imgSelectedIndex,
    previousImgSelectedIndex,
    publishButtonDisplayStyle,
    publishButtonHideStyle,
    saveButtonDisplayStyle,
    saveButtonHideStyle,
    selectedESignagePlayers,
    templateContents,
    templateListDataSource,
    templateSchedule,
    updateSteps,
  ]);

  const handleBack3 = useCallback(() => {
    let tabContentLocal;
    if (
      imgSelectedIndex !== undefined &&
      templateListDataSource !== undefined &&
      imgSelectedIndex >= 0 &&
      templateListDataSource.length > 0
    ) {
      const templateIndexLocal = getTemplateIndex(templateListDataSource[imgSelectedIndex].id);
      const templateTypeIdLocal = templateListDataSource[imgSelectedIndex].id;
      const templateBasicInfoLocal: TemplateBasic = {
        groupId: (templateList && templateList.templateOutput[imgSelectedIndex].group) || '',
        templateName: (templateList && templateList.templateOutput[imgSelectedIndex].name) || '',
        templateType:
          (templateList && templateList.templateOutput[imgSelectedIndex].templateTypeId) || '',
        description:
          (templateList && templateList.templateOutput[imgSelectedIndex].description) || '',
        backgroundColor:
          (templateList && templateList.templateOutput[imgSelectedIndex].backgroundColor) || '',
      };

      setTemplateBasicInfo(templateBasicInfoLocal);

      if (stepRef.current < scheduleSteps.length) {
        stepRef.current -= 1;
        setStep(stepRef.current);
        setStepAction('BACK');
        tabContentLocal = (
          <div className={classes.emptyPanel}>
            <div>{scheduleSteps[stepRef.current]}</div>
          </div>
        );
      }

      switch (stepRef.current) {
        case 0:
          tabContentLocal = (
            <div className={classes.templateInfoPanel}>
              <ESignagePlayerSelector
                selectedESignagePlayers={selectedESignagePlayers}
                setSelectedESignagePlayers={setSelectedESignagePlayers}
                onChangeSelectedItems={handleOnChangeSelectedESignagePlayers}
              />
            </div>
          );
          setTabContent2(tabContentLocal);
          setCancelButtonStyle(displayStyle);
          setBackButtonStyle(hideStyle);
          setNextButtonStyle(displayStyle);

          if (selectedESignagePlayers.length > 0) setNextButtonDisabled(false);
          else setNextButtonDisabled(true);

          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonHideStyle);

          break;
        case 1:
          if (imgSelectedIndex !== previousImgSelectedIndex) {
            setTemplateContents(getInitTemplateContents(imgSelectedIndex));
            setPreviousImgSelectedIndex(imgSelectedIndex);
          }

          if (
            templateListDataSource !== undefined &&
            templateListDataSource.length > 0 &&
            templateSchedule !== undefined &&
            templateListDataSource !== undefined
          ) {
            let templateIdLocal: string | undefined;

            if (templateListDataSource[imgSelectedIndex].tag !== undefined) {
              templateIdLocal = templateListDataSource[imgSelectedIndex]?.tag;
            }

            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <ScheduleAndPublish
                  templateIndex={templateIndexLocal}
                  templateId={templateIdLocal || ''}
                  templateTypeId={templateTypeIdLocal}
                  templateTitle={
                    templateListDataSource
                      ? templateListDataSource[imgSelectedIndex].title
                      : undefined
                  }
                  selectedESignagePlayers={selectedESignagePlayers}
                  templateSchedule={templateSchedule}
                  onTemplateScheduleChanged={handleOnTemplateScheduleChanged}
                />
              </div>
            );
          }

          setTabContent2(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(hideStyle);
          setNextButtonDisabled(false);
          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonDisplayStyle);
          break;
        default:
      }
    }
  }, [
    classes.emptyPanel,
    classes.templateInfoPanel,
    displayStyle,
    getInitTemplateContents,
    getTemplateIndex,
    handleOnChangeSelectedESignagePlayers,
    handleOnTemplateScheduleChanged,
    hideStyle,
    imgSelectedIndex,
    previousImgSelectedIndex,
    publishButtonDisplayStyle,
    publishButtonHideStyle,
    saveButtonHideStyle,
    scheduleSteps,
    selectedESignagePlayers,
    templateList,
    templateListDataSource,
    templateSchedule,
  ]);

  const handleNext = useCallback(() => {
    let tabContentLocal;
    const selectedRectId = 'rect1';
    if (imgSelectedIndex !== undefined && imgSelectedIndex >= 0) {
      if (stepRef.current < steps.length) {
        stepRef.current += 1;
        setStep(stepRef.current);
        setStepAction('NEXT');
        tabContentLocal = (
          <div className={classes.emptyPanel}>
            <div>{steps[stepRef.current]}</div>
          </div>
        );
      }
      // console.log(String().concat('imgSelectedIndex:', imgSelectedIndex.toString()));
      // console.log(String().concat('stepRef:', stepRef.current.toString()));
      switch (stepRef.current) {
        case 0:
          handleAdd(
            imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1,
          );
          setCancelButtonStyle(displayStyle);
          setBackButtonStyle(hideStyle);
          setNextButtonStyle(displayStyle);
          setNextButtonDisabled(false);
          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 1:
          //  if (imgSelectedIndex !== previousImgSelectedIndex) {
          setTemplateContents(getInitTemplateContents(imgSelectedIndex));
          setPreviousImgSelectedIndex(imgSelectedIndex);
          //  }

          tabContentLocal = (
            <div className={classes.templateInfoPanel}>
              <TemplateInfo
                templateIndex={
                  imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                }
                templateTypeId={templateTypeId[imgSelectedIndex]}
                templateTitle={
                  imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                }
                templateBasic={templateBasicInfo}
                onTemplateBasicChanged={handleOnTemplateBasicChanged}
              />
            </div>
          );
          setTabContent(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(displayStyle);
          setNextButtonDisabled(true);
          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 2:
          contentTypeRef.current = 'Web Content';
          if (
            imgSelectedIndex === 6 ||
            imgSelectedIndex === 8 ||
            imgSelectedIndex === 9 ||
            imgSelectedIndex === 11
          ) {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <WebContentInfo
                  templateIndex={
                    imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                  }
                  templateTitle={
                    imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                  }
                  rectId={selectedRectId}
                  webPageContent={
                    templateContents[0] && (templateContents[0].content as WebPageContent)
                  }
                  onWebPageContentChanged={handleOnWebPageContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          } else {
            contentTypeRef.current = 'Weather Content';

            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <WeatherContentInfo
                  templateIndex={
                    imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                  }
                  templateTitle={
                    imageDataSource &&
                    imgSelectedIndex > -1 &&
                    imgSelectedIndex < imageDataSource.length
                      ? imageDataSource[imgSelectedIndex].title
                      : undefined
                  }
                  rectId={selectedRectId}
                  weatherContent={
                    templateContents[0] && (templateContents[0].content as WeatherContent)
                  }
                  onWeatherContentChanged={handleOnWeatherContentChanged}
                  onChangeType={handleOnChangeType}
                />
              </div>
            );
          }
          setTabContent(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(hideStyle);
          if (handleCheckContentFieldsData(templateContents)) {
            setNextButtonDisabled(false);
            setSaveButtonDisabled(false);
          } else {
            setNextButtonDisabled(true);
            setSaveButtonDisabled(true);
          }
          setSaveButtonStyle(saveButtonDisplayStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 3:
          // setSelectedESignagePlayers([]);
          // setTemplateSchedule(handleInitTemplateSchedule());

          tabContentLocal = (
            <div className={classes.templateInfoPanel}>
              <ESignagePlayerSelector
                selectedESignagePlayers={selectedESignagePlayers}
                setSelectedESignagePlayers={setSelectedESignagePlayers}
                onChangeSelectedItems={handleOnChangeSelectedESignagePlayers}
              />
            </div>
          );
          setTabContent(tabContentLocal);
          setCancelButtonStyle(displayStyle);
          setBackButtonStyle(hideStyle);
          setNextButtonStyle(displayStyle);

          if (selectedESignagePlayers.length > 0) setNextButtonDisabled(false);
          else setNextButtonDisabled(true);

          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 4:
          if (imgSelectedIndex !== previousImgSelectedIndex) {
            setTemplateContents(getInitTemplateContents(imgSelectedIndex));
            setPreviousImgSelectedIndex(imgSelectedIndex);
            setTemplateSchedule(handleInitTemplateSchedule());
          }

          if (templateSchedule !== undefined) {
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <ScheduleAndPublish
                  templateIndex={
                    imgSelectedIndex !== undefined && imgSelectedIndex > -1 ? imgSelectedIndex : -1
                  }
                  templateId=""
                  templateTypeId={templateTypeId[imgSelectedIndex]}
                  templateTitle={
                    imageDataSource ? imageDataSource[imgSelectedIndex].title : undefined
                  }
                  selectedESignagePlayers={selectedESignagePlayers}
                  templateSchedule={templateSchedule}
                  onTemplateScheduleChanged={handleOnTemplateScheduleChanged}
                />
              </div>
            );
          }
          setTabContent(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(hideStyle);
          setNextButtonDisabled(false);
          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonDisplayStyle);
          break;
        default:
      }
    } else {
      setOpenDialog(true);
    }
  }, [
    classes.emptyPanel,
    classes.templateInfoPanel,
    displayStyle,
    getInitTemplateContents,
    handleAdd,
    handleCheckContentFieldsData,
    handleInitTemplateSchedule,
    handleOnChangeSelectedESignagePlayers,
    handleOnChangeType,
    handleOnTemplateBasicChanged,
    handleOnTemplateScheduleChanged,
    handleOnWeatherContentChanged,
    handleOnWebPageContentChanged,
    hideStyle,
    imageDataSource,
    imgSelectedIndex,
    previousImgSelectedIndex,
    publishButtonDisplayStyle,
    publishButtonHideStyle,
    saveButtonDisplayStyle,
    saveButtonHideStyle,
    selectedESignagePlayers,
    steps,
    templateBasicInfo,
    templateContents,
    templateSchedule,
    templateTypeId,
  ]);

  const handleNext2 = useCallback(() => {
    let tabContentLocal;
    const selectedRectId = 'rect1';
    if (imgSelectedIndex !== undefined && imgSelectedIndex >= 0) {
      const templateIndexLocal =
        templateListDataSource !== undefined && templateListDataSource.length > 0
          ? getTemplateIndex(templateListDataSource[imgSelectedIndex].id)
          : -1;

      if (stepRef.current < updateSteps.length) {
        stepRef.current += 1;
        setStep(stepRef.current);
        setStepAction('NEXT');
        tabContentLocal = (
          <div className={classes.emptyPanel}>
            <div>{updateSteps[stepRef.current]}</div>
          </div>
        );
      }
      // console.log(String().concat('imgSelectedIndex:', imgSelectedIndex.toString()));
      // console.log(String().concat('stepRef:', stepRef.current.toString()));
      switch (stepRef.current) {
        case 0:
          contentTypeRef.current = 'Web Content';
          if (templateIndexLocal > -1 && templateContents.length > 0) {
            setResetViewerUI(true);
            if (
              templateIndexLocal === 6 ||
              templateIndexLocal === 8 ||
              templateIndexLocal === 9 ||
              templateIndexLocal === 11
            ) {
              contentTypeRef.current = 'Web Content';
              tabContentLocal = (
                <div className={classes.templateInfoPanel}>
                  <WebContentInfo
                    templateIndex={
                      templateIndexLocal !== undefined && templateIndexLocal > -1
                        ? templateIndexLocal
                        : -1
                    }
                    templateTitle={
                      imageDataSource ? imageDataSource[templateIndexLocal].title : undefined
                    }
                    rectId={selectedRectId}
                    webPageContent={templateContents[0].content as WebPageContent}
                    onWebPageContentChanged={handleOnWebPageContentChanged}
                    onChangeType={handleOnChangeType}
                  />
                </div>
              );
            } else {
              contentTypeRef.current = 'Weather Content';
              tabContentLocal = (
                <div className={classes.templateInfoPanel}>
                  <WeatherContentInfo
                    templateIndex={
                      templateIndexLocal !== undefined && templateIndexLocal > -1
                        ? templateIndexLocal
                        : -1
                    }
                    templateTitle={
                      imageDataSource ? imageDataSource[templateIndexLocal].title : undefined
                    }
                    rectId={selectedRectId}
                    weatherContent={templateContents[0].content as WeatherContent}
                    onWeatherContentChanged={handleOnWeatherContentChanged}
                    onChangeType={handleOnChangeType}
                  />
                </div>
              );
            }
            setTabContent(tabContentLocal);
            setDisplayStepper(true);
            setDisplayTemplateBasicSaveButton(true);
            setImgSelectedIndex(imgSelectedIndex);
            stepRef.current = 0;
            setStep(stepRef.current);
            setStepAction('RESET');
            setCancelButtonStyle(displayStyle);
            setBackButtonStyle(hideStyle);
            setNextButtonStyle(displayStyle);
            // setNextButtonDisabled(false);
            if (handleCheckContentFieldsData(templateContents)) {
              setNextButtonDisabled(false);
              setSaveButtonDisabled(false);
            } else {
              setNextButtonDisabled(true);
              setSaveButtonDisabled(true);
            }
            setSaveButtonStyle(saveButtonDisplayStyle);
            setPublishButtonStyle(publishButtonHideStyle);

            setAddButtonStyle({ display: 'none' });
            setModifyButtonStyle({ display: 'none' });
            setDividerStyle({ display: 'none' });
            setDeleteButtonStyle({ display: 'none' });
            setExitButtonStyle({ display: 'inline' });
          }
          break;
        case 1:
          // setSelectedESignagePlayers([]);
          // setTemplateSchedule(handleInitTemplateSchedule());

          tabContentLocal = (
            <div className={classes.templateInfoPanel}>
              <ESignagePlayerSelector
                selectedESignagePlayers={selectedESignagePlayers}
                setSelectedESignagePlayers={setSelectedESignagePlayers}
                onChangeSelectedItems={handleOnChangeSelectedESignagePlayers}
              />
            </div>
          );
          setTabContent(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(displayStyle);

          if (selectedESignagePlayers.length > 0) setNextButtonDisabled(false);
          else setNextButtonDisabled(true);

          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 2:
          if (imgSelectedIndex !== previousImgSelectedIndex) {
            // setTemplateContents(getInitTemplateContents(imgSelectedIndex));
            setPreviousImgSelectedIndex(imgSelectedIndex);
          }

          if (
            templateListDataSource !== undefined &&
            templateListDataSource.length > 0 &&
            templateSchedule !== undefined &&
            templateListDataSource !== undefined
          ) {
            let templateIdLocal: string | undefined;
            const templateTypeIdLocal = templateListDataSource[imgSelectedIndex].id;

            if (templateListDataSource[imgSelectedIndex].tag !== undefined) {
              templateIdLocal = templateListDataSource[imgSelectedIndex]?.tag;
            }
            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <ScheduleAndPublish
                  templateIndex={templateIndexLocal}
                  templateId={templateIdLocal || ''}
                  templateTypeId={templateTypeIdLocal}
                  templateTitle={
                    templateListDataSource
                      ? templateListDataSource[imgSelectedIndex].title
                      : undefined
                  }
                  selectedESignagePlayers={selectedESignagePlayers}
                  templateSchedule={templateSchedule}
                  onTemplateScheduleChanged={handleOnTemplateScheduleChanged}
                />
              </div>
            );
          }

          setTabContent(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(hideStyle);
          setNextButtonDisabled(false);
          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonDisplayStyle);
          break;
        default:
      }
    } else {
      setOpenDialog(true);
    }
  }, [
    classes.emptyPanel,
    classes.templateInfoPanel,
    displayStyle,
    getTemplateIndex,
    handleCheckContentFieldsData,
    handleOnChangeSelectedESignagePlayers,
    handleOnChangeType,
    handleOnTemplateScheduleChanged,
    handleOnWeatherContentChanged,
    handleOnWebPageContentChanged,
    hideStyle,
    imageDataSource,
    imgSelectedIndex,
    previousImgSelectedIndex,
    publishButtonDisplayStyle,
    publishButtonHideStyle,
    saveButtonDisplayStyle,
    saveButtonHideStyle,
    selectedESignagePlayers,
    templateContents,
    templateListDataSource,
    templateSchedule,
    updateSteps,
  ]);

  const handleNext3 = useCallback(() => {
    let tabContentLocal;
    if (
      imgSelectedIndex !== undefined &&
      templateListDataSource !== undefined &&
      imgSelectedIndex >= 0 &&
      templateListDataSource.length > 0
    ) {
      const templateIndexLocal = getTemplateIndex(templateListDataSource[imgSelectedIndex].id);
      const templateTypeIdLocal = templateListDataSource[imgSelectedIndex].id;
      const templateBasicInfoLocal: TemplateBasic = {
        groupId: (templateList && templateList.templateOutput[imgSelectedIndex].group) || '',
        templateName: (templateList && templateList.templateOutput[imgSelectedIndex].name) || '',
        templateType:
          (templateList && templateList.templateOutput[imgSelectedIndex].templateTypeId) || '',
        description:
          (templateList && templateList.templateOutput[imgSelectedIndex].description) || '',
        backgroundColor:
          (templateList && templateList.templateOutput[imgSelectedIndex].backgroundColor) || '',
      };

      setTemplateBasicInfo(templateBasicInfoLocal);

      if (stepRef.current < scheduleSteps.length) {
        stepRef.current += 1;
        setStep(stepRef.current);
        setStepAction('NEXT');
        tabContentLocal = (
          <div className={classes.emptyPanel}>
            <div>{scheduleSteps[stepRef.current]}</div>
          </div>
        );
      }

      switch (stepRef.current) {
        case 0:
          tabContentLocal = (
            <div className={classes.templateInfoPanel}>
              <ESignagePlayerSelector
                selectedESignagePlayers={selectedESignagePlayers}
                setSelectedESignagePlayers={setSelectedESignagePlayers}
                onChangeSelectedItems={handleOnChangeSelectedESignagePlayers}
              />
            </div>
          );
          setTabContent2(tabContentLocal);
          setCancelButtonStyle(displayStyle);
          setBackButtonStyle(hideStyle);
          setNextButtonStyle(displayStyle);

          if (selectedESignagePlayers.length > 0) setNextButtonDisabled(false);
          else setNextButtonDisabled(true);

          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonHideStyle);
          break;
        case 1:
          if (imgSelectedIndex !== previousImgSelectedIndex) {
            setTemplateContents(getInitTemplateContents(imgSelectedIndex));
            setPreviousImgSelectedIndex(imgSelectedIndex);
          }

          if (
            templateListDataSource !== undefined &&
            templateListDataSource.length > 0 &&
            templateSchedule !== undefined &&
            templateListDataSource !== undefined
          ) {
            let templateIdLocal: string | undefined;

            if (templateListDataSource[imgSelectedIndex].tag !== undefined) {
              templateIdLocal = templateListDataSource[imgSelectedIndex]?.tag;
            }

            tabContentLocal = (
              <div className={classes.templateInfoPanel}>
                <ScheduleAndPublish
                  templateIndex={templateIndexLocal}
                  templateId={templateIdLocal || ''}
                  templateTypeId={templateTypeIdLocal}
                  templateTitle={
                    templateListDataSource
                      ? templateListDataSource[imgSelectedIndex].title
                      : undefined
                  }
                  selectedESignagePlayers={selectedESignagePlayers}
                  templateSchedule={templateSchedule}
                  onTemplateScheduleChanged={handleOnTemplateScheduleChanged}
                />
              </div>
            );
          }
          setTabContent2(tabContentLocal);
          setCancelButtonStyle(hideStyle);
          setBackButtonStyle(displayStyle);
          setNextButtonStyle(hideStyle);
          setNextButtonDisabled(false);
          setSaveButtonStyle(saveButtonHideStyle);
          setPublishButtonStyle(publishButtonDisplayStyle);
          break;
        default:
      }
    } else {
      setOpenDialog(true);
    }
  }, [
    classes.emptyPanel,
    classes.templateInfoPanel,
    displayStyle,
    getInitTemplateContents,
    getTemplateIndex,
    handleOnChangeSelectedESignagePlayers,
    handleOnTemplateScheduleChanged,
    hideStyle,
    imgSelectedIndex,
    previousImgSelectedIndex,
    publishButtonDisplayStyle,
    publishButtonHideStyle,
    saveButtonHideStyle,
    scheduleSteps,
    selectedESignagePlayers,
    templateList,
    templateListDataSource,
    templateSchedule,
  ]);

  const handleAlertDialogOnSave = useCallback(
    (dialogState: boolean) => {
      setOpenSaveDialog(dialogState);
      if (saveSuccess) {
        setInitial(true); //
        // handleCancel();

        setSaveButtonStyle(saveButtonHideStyle);
        setPublishButtonStyle(publishButtonHideStyle);
        setBackButtonStyle(hideStyle);
        setCancelButtonStyle(displayStyle);
        setNextButtonDisabled(false);
        setSaveSuccess(false);
        setDeleteSuccess(false);
        void refetchTemplateList();
        void handleNext();
      }
    },
    [
      displayStyle,
      handleNext,
      hideStyle,
      publishButtonHideStyle,
      refetchTemplateList,
      saveButtonHideStyle,
      saveSuccess,
    ],
  );

  const handleAlertDialog2OnSave = useCallback(
    (dialogState: boolean) => {
      setOpenSaveDialog2(dialogState);
      if (saveSuccess) {
        setInitial(true); //
        handleCancel();
      }
    },
    [handleCancel, saveSuccess],
  );

  const handleAlertDialogOnPublish = useCallback(
    (dialogState: boolean) => {
      setOpenPublishDialog(dialogState);
      if (publishSuccess) {
        setInitial(true);

        setSaveButtonStyle(saveButtonHideStyle);
        setPublishButtonStyle(publishButtonHideStyle);
        setBackButtonStyle(hideStyle);
        setSaveSuccess(false);
        setDeleteSuccess(false);
        setPublishSuccess(false);
        void refetchTemplateList();
        void handleNext();
        handleCancel();
      }
    },
    [
      handleCancel,
      handleNext,
      hideStyle,
      publishButtonHideStyle,
      publishSuccess,
      refetchTemplateList,
      saveButtonHideStyle,
    ],
  );

  const handleAlertDialog2OnPublish = useCallback(
    (dialogState: boolean) => {
      setOpenPublishDialog2(dialogState);
      if (publishSuccess) {
        setInitial(true);

        setSaveButtonStyle(saveButtonHideStyle);
        setPublishButtonStyle(publishButtonHideStyle);
        setBackButtonStyle(hideStyle);
        setSaveSuccess(false);
        setDeleteSuccess(false);
        setPublishSuccess(false);
        void refetchTemplateList();
        void handleNext();
        handleCancel();
      }
    },
    [
      handleCancel,
      handleNext,
      hideStyle,
      publishButtonHideStyle,
      publishSuccess,
      refetchTemplateList,
      saveButtonHideStyle,
    ],
  );

  const handleAlertDialog3OnPublish = useCallback(
    (dialogState: boolean) => {
      setOpenPublishDialog3(dialogState);
      if (publishSuccess) {
        setInitial(true);

        setSaveButtonStyle(saveButtonHideStyle);
        setPublishButtonStyle(publishButtonHideStyle);
        setBackButtonStyle(hideStyle);
        setSaveSuccess(false);
        setDeleteSuccess(false);
        setPublishSuccess(false);
        void refetchTemplateList();
        void handleNext();
        handleCancel();
      }
    },
    [
      handleCancel,
      handleNext,
      hideStyle,
      publishButtonHideStyle,
      publishSuccess,
      refetchTemplateList,
      saveButtonHideStyle,
    ],
  );

  const handleMediaUpload = useCallback(
    async (files: File[]) => {
      let result: UploadMultipleFilesType | null = null;
      if (permissionGroup !== undefined && permissionGroup !== null) {
        const groupId = permissionGroup?.group.id;
        try {
          result = await MediaUploadService.multiple(
            files,
            (_event: ProgressEvent) => {},
            AccessToken,
            groupId,
          );
        } catch (e) {
          // console.info(e);
        }
      }
      return result;
    },
    [AccessToken, permissionGroup],
  );

  const handleSave = useCallback(async () => {
    let groupId = permissionGroup && permissionGroup?.group.id;
    const templateInput: TemplateInput = {
      name: '',
      templateTypeId: '',
      description: '',
      backgroundColor: '',
      group: '',
      templateContent: [],
    };

    if (templateBasicInfo !== undefined) {
      if (templateBasicInfo.groupId === null || templateBasicInfo.groupId.trim() === '') {
        if (groupId !== null && groupId.trim() !== '')
          setTemplateBasicInfo({ ...templateBasicInfo, groupId });
      } else groupId = templateBasicInfo.groupId.trim();

      templateInput.name = templateBasicInfo.templateName;
      templateInput.templateTypeId = templateBasicInfo.templateType;
      templateInput.description = templateBasicInfo.description;
      templateInput.backgroundColor = templateBasicInfo.backgroundColor;
      templateInput.group = templateBasicInfo.groupId;
    }

    if (templateContents !== null && templateContents.length > 0) {
      for (let i = 0; i < templateContents.length; i += 1) {
        const contentDetailLocal: ContentDetail = {};
        const templateContentsLocal: TemplateContents = {
          contentTypeId: templateContents[i].content.contentCommon.contentTypeId,
          contentName: templateContents[i].content.contentCommon.contentName,
          tag: templateContents[i].content.contentCommon.tag || '',
          x: templateContents[i].content.contentCommon.x || 0,
          y: templateContents[i].content.contentCommon.y || 0,
          width: templateContents[i].content.contentCommon.width || 0,
          height: templateContents[i].content.contentCommon.height || 0,
          rectId: templateContents[i].rectId || '',
          contentDeatail: contentDetailLocal,
        };
        templateInput.templateContent.push(templateContentsLocal);

        if (
          templateContents[i].content.contentCommon.contentTypeId === '628dd0b71df620dbe8629247'
        ) {
          /*
          const media: Media[] = JSON.parse(
            JSON.stringify(
              (templateContents[i].content as unknown as MediaContent).contentDetail.media,
            ),
          ) as Media[];

          templateInput.templateContent[i].contentDeatail.media = media;
          */
          const mediaContentDetail: MediaContentDetail = templateContents[i].content
            .contentDetail as MediaContentDetail;
          const media: Media[] = [];

          for (let k = 0; k < mediaContentDetail.media.length; k += 1) {
            media.push({
              mediaId: mediaContentDetail.media[k].mediaId,
              imagePlayDurations: mediaContentDetail.media[k].imagePlayDurations,
            });
          }

          if (
            mediaContentDetail !== undefined &&
            mediaContentDetail.media !== undefined &&
            mediaContentDetail.media.length > 0
          ) {
            // void (async () => {
            let result: UploadMultipleFilesType | null = null;
            const files: File[] = [];
            const filesIndex: number[] = [];

            for (let x = 0; x < mediaContentDetail.media.length; x += 1) {
              if (mediaContentDetail.media[x].mediaId.trim() === '') {
                if (mediaContentDetail.media[x].content !== undefined) {
                  files.push(mediaContentDetail.media[x].content as File);
                  filesIndex.push(x);
                }
              }
            }
            if (files.length > 0) {
              // eslint-disable-next-line no-await-in-loop
              result = await handleMediaUpload(files);

              if (result !== undefined && result !== null) {
                if (result.returnCode === '200') {
                  if (
                    result.fileInfoList !== undefined &&
                    result.fileInfoList !== null &&
                    result.fileInfoList.length > 0
                  ) {
                    for (let y = 0; y < filesIndex.length; y += 1) {
                      mediaContentDetail.media[filesIndex[y]].mediaId =
                        // eslint-disable-next-line no-underscore-dangle
                        result.fileInfoList[y]._id;
                      // eslint-disable-next-line no-underscore-dangle
                      media[filesIndex[y]].mediaId = result.fileInfoList[y]._id;
                    }
                  }
                }
              }
            }
            //  })();
          }

          templateInput.templateContent[i].contentDeatail.media = media;
        }

        if (
          templateContents[i].content.contentCommon.contentTypeId === '628dd0b71df620dbe862924a'
        ) {
          /*
          const ipcam: IpCam[] = JSON.parse(
            JSON.stringify(
              ((templateContents[i].content as unknown) as IPCamContent).contentDetail.ipcam,
            ),
          ) as IpCam[];
           */
          const ipcam: IpCam[] = [];
          const ipcamContentDetail: IPCamContentDetail = templateContents[i].content
            .contentDetail as IPCamContentDetail;

          if (ipcamContentDetail !== undefined && ipcamContentDetail.ipcam.length > 0) {
            for (let j = 0; j < ipcamContentDetail.ipcam?.length; j += 1) {
              ipcam.push({
                camName: ipcamContentDetail.ipcam[j].camName,
                rtspUrl: ipcamContentDetail.ipcam[j].rtspUrl,
                durations: ipcamContentDetail.ipcam[j].durations,
              });
            }
          }

          templateInput.templateContent[i].contentDeatail.ipCam = ipcam;
        }

        if (
          templateContents[i].content.contentCommon.contentTypeId === '628dd0b71df620dbe8629248'
        ) {
          const weatherContentDetail = templateContents[i].content
            .contentDetail as unknown as WeatherContentDetail;
          const weather: Weather = {
            weatherStyleId: weatherContentDetail.weatherStyleId,
            temperatureUnit: weatherContentDetail.temperatureUnit,
            windSpeedUnit: weatherContentDetail.windSpeedUnit,
            languageId: weatherContentDetail.languageId,
            backgroundColor: weatherContentDetail.backgroundColor,
            durations: weatherContentDetail.durations,
            citys: weatherContentDetail.citys,
          };

          templateInput.templateContent[i].contentDeatail.weather = weather;
        }

        if (
          templateContents[i].content.contentCommon.contentTypeId === '628dd0b71df620dbe8629249'
        ) {
          /*
              const webPage: Webpage[] = JSON.parse(
              JSON.stringify((templateContents[i].content as WebPageContent).contentDetail.webpage),
              ) as Webpage[];
            */
          const webPage: Webpage[] = [];
          const webPageContentDetail: WebPageContentDetail = templateContents[i].content
            .contentDetail as WebPageContentDetail;

          if (webPageContentDetail !== undefined && webPageContentDetail.webpage.length > 0) {
            for (let j = 0; j < webPageContentDetail.webpage?.length; j += 1) {
              webPage.push({
                webUrl: webPageContentDetail.webpage[j].webUrl,
                playTime: webPageContentDetail.webpage[j].playTime,
              });
            }
          }
          templateInput.templateContent[i].contentDeatail.webpage = webPage;
        }
      }
    }

    if (groupId !== undefined && groupId !== null) {
      void addTemplate({
        variables: { groupId, templateInput },
      });
    }
  }, [addTemplate, handleMediaUpload, permissionGroup, templateBasicInfo, templateContents]);

  const handlePackTemplateScheduleInput = useCallback((): TemplateScheduleInput => {
    const templateScheduleInput: TemplateScheduleInput = {
      templateId: '',
      scheduleName: '',
      playStartDate: '',
      playEndDate: '',
      playStartTime: '',
      playEndTime: '',
      loopMode: 'D',
      dailyFrequency: 1,
      weeklyFrequency: null,
      monthlyFrequency_Month: null,
      monthlyFrequency_Day: null,
      audioSetting: 100,
      downloadDirectly: true,
      scheduledDownloadTime: '',
      players: [],
    };
    if (templateSchedule !== undefined) {
      if (templateSchedule.scheduledDownloadTime !== null) {
        if (templateSchedule.downloadDirectly) templateSchedule.scheduledDownloadTime = new Date();
        else if (new Date(templateSchedule.scheduledDownloadTime).getTime() < new Date().getTime())
          templateSchedule.scheduledDownloadTime = new Date();
      } else {
        templateSchedule.scheduledDownloadTime = new Date();
      }
      templateScheduleInput.audioSetting = templateSchedule.audioSetting;
      templateScheduleInput.dailyFrequency = templateSchedule.dailyFrequency;
      templateScheduleInput.downloadDirectly = templateSchedule.downloadDirectly;
      templateScheduleInput.loopMode = templateSchedule.loopMode;

      const monthlyFrequencyDay: number[] = [];
      if (
        templateSchedule.monthlyFrequency_Day !== null &&
        templateSchedule.monthlyFrequency_Day?.length > 0
      ) {
        for (let i = 0; i < templateSchedule.monthlyFrequency_Day?.length; i += 1) {
          monthlyFrequencyDay.push(parseInt(templateSchedule.monthlyFrequency_Day[i], 10));
        }
      }

      templateScheduleInput.monthlyFrequency_Day =
        monthlyFrequencyDay.length > 0 ? monthlyFrequencyDay : null;
      templateScheduleInput.monthlyFrequency_Month = templateSchedule
        ? templateSchedule.monthlyFrequency_Month
        : null;
      templateScheduleInput.playEndDate = templateSchedule.playEndDate?.toISOString();
      [, templateScheduleInput.playEndTime] = templateSchedule.playEndTime.split(' ');
      templateScheduleInput.playStartDate =
        templateSchedule.playStartDate?.toISOString() || new Date().toISOString();
      [, templateScheduleInput.playStartTime] = templateSchedule.playStartTime.split(' ');
      templateScheduleInput.players = templateSchedule.players;
      templateScheduleInput.scheduleName = templateSchedule.scheduleName;
      templateScheduleInput.scheduledDownloadTime = templateSchedule.scheduledDownloadTime
        ? templateSchedule.scheduledDownloadTime?.toISOString()
        : new Date().toISOString();
      templateScheduleInput.templateId = templateSchedule.templateId;
      templateScheduleInput.weeklyFrequency = templateSchedule.weeklyFrequency;

      if (templateSchedule.loopMode === 'D') {
        templateScheduleInput.weeklyFrequency = null;
        templateScheduleInput.monthlyFrequency_Month = null;
        templateScheduleInput.monthlyFrequency_Day = null;
        if (templateSchedule !== undefined)
          setTemplateSchedule({
            ...templateSchedule,
            weeklyFrequency: null,
            monthlyFrequency_Month: null,
            monthlyFrequency_Day: null,
          });
      }

      if (templateScheduleInput.playStartTime === '24:00:00')
        templateScheduleInput.playStartTime = '00:00:00';

      if (templateScheduleInput.playEndTime === '24:00:00')
        templateScheduleInput.playEndTime = '00:00:00';
    }
    return templateScheduleInput;
  }, [templateSchedule]);

  const handlePublish = useCallback(async () => {
    const groupId = permissionGroup && permissionGroup?.group.id;
    const token = `${user.accessToken || ''}`;
    const templateScheduleInput: TemplateScheduleInput = handlePackTemplateScheduleInput();

    if (templateScheduleInput !== undefined) {
      if (
        templateScheduleInput.monthlyFrequency_Day !== null &&
        templateScheduleInput.monthlyFrequency_Day?.length === 0
      )
        templateScheduleInput.monthlyFrequency_Day = null;

      if (
        templateScheduleInput.monthlyFrequency_Month !== null &&
        templateScheduleInput.monthlyFrequency_Month?.length === 0
      )
        templateScheduleInput.monthlyFrequency_Month = null;

      if (templateScheduleInput.players !== null && templateScheduleInput.players?.length === 0) {
        const players: string[] = [];

        for (let i = 0; i < selectedESignagePlayers.length; i += 1) {
          players.push(selectedESignagePlayers[i].value);
        }

        templateScheduleInput.players = players;
      }

      if (
        templateScheduleInput.templateId === undefined ||
        templateScheduleInput.templateId === ''
      ) {
        if (templateIdforAddTemplate !== undefined && templateIdforAddTemplate !== '')
          templateScheduleInput.templateId = templateIdforAddTemplate;
        else {
          templateScheduleInput.templateId =
            templateListDataSource !== undefined &&
            templateListDataSource[imgSelectedIndex]?.key !== undefined
              ? templateListDataSource[imgSelectedIndex].key
              : '';
        }
      }
    }

    if (
      groupId !== undefined &&
      groupId !== null &&
      templateScheduleInput !== undefined &&
      templateScheduleInput.templateId !== '' &&
      templateScheduleInput.players !== null &&
      templateScheduleInput.players?.length > 0
    ) {
      void addTemplateSchedule({
        variables: { groupId, token, templateScheduleInput },
      });
    }
  }, [
    addTemplateSchedule,
    handlePackTemplateScheduleInput,
    imgSelectedIndex,
    permissionGroup,
    selectedESignagePlayers,
    templateIdforAddTemplate,
    templateListDataSource,
    user.accessToken,
  ]);

  const handlePackUpdateTemplateContentInput = useCallback(async () => {
    const updateTemplateContentInput: UpdateTemplateContentInput = { updateTemplateContent: [] };
    if (templateContents !== null && templateContents.length > 0) {
      for (let i = 0; i < templateContents.length; i += 1) {
        const contentDetailLocal: ContentDetail = {};
        const templateContentsLocal: UpdateTemplateContent = {
          contentTypeId: templateContents[i].content.contentCommon.contentTypeId,
          contentName: templateContents[i].content.contentCommon.contentName,
          tag: templateContents[i].content.contentCommon.tag || '',
          x: templateContents[i].content.contentCommon.x || 0,
          y: templateContents[i].content.contentCommon.y || 0,
          width: templateContents[i].content.contentCommon.width || 0,
          height: templateContents[i].content.contentCommon.height || 0,
          rectId: templateContents[i].rectId || '',
          contentDeatail: contentDetailLocal,
          contentId: templateContents[i].contentId || '',
        };

        updateTemplateContentInput.updateTemplateContent.push(templateContentsLocal);
        if (
          templateContents[i].content.contentCommon.contentTypeId === '628dd0b71df620dbe8629247'
        ) {
          const mediaContentDetail: MediaContentDetail = templateContents[i].content
            .contentDetail as MediaContentDetail;
          const media: Media[] = [];

          for (let k = 0; k < mediaContentDetail.media.length; k += 1) {
            media.push({
              mediaId: mediaContentDetail.media[k].mediaId,
              imagePlayDurations: mediaContentDetail.media[k].imagePlayDurations,
            });
          }

          if (mediaContentDetail !== undefined && mediaContentDetail.media.length > 0) {
            let result: UploadMultipleFilesType | null = null;
            const files: File[] = [];
            const filesIndex: number[] = [];

            for (let x = 0; x < mediaContentDetail.media.length; x += 1) {
              if (mediaContentDetail.media[x].mediaId.trim() === '') {
                if (mediaContentDetail.media[x].content !== undefined) {
                  files.push(mediaContentDetail.media[x].content as File);
                  filesIndex.push(x);
                }
              }
            }
            if (files.length > 0) {
              // eslint-disable-next-line no-await-in-loop
              result = await handleMediaUpload(files);

              if (result !== undefined && result !== null) {
                if (result.returnCode === '200') {
                  if (
                    result.fileInfoList !== undefined &&
                    result.fileInfoList !== null &&
                    result.fileInfoList.length > 0
                  ) {
                    for (let y = 0; y < filesIndex.length; y += 1) {
                      mediaContentDetail.media[filesIndex[y]].mediaId =
                        // eslint-disable-next-line no-underscore-dangle
                        result.fileInfoList[y]._id;
                      // eslint-disable-next-line no-underscore-dangle
                      media[filesIndex[y]].mediaId = result.fileInfoList[y]._id;
                    }
                  }
                }
              }
            }
          }

          if (media !== undefined && media.length === 0) {
            media.push({ mediaId: '', imagePlayDurations: -1 });
          }
          updateTemplateContentInput.updateTemplateContent[i].contentDeatail.media = media;
        }
        if (
          templateContents[i].content.contentCommon.contentTypeId === '628dd0b71df620dbe862924a'
        ) {
          const ipcam: IpCam[] = [];
          const ipcamContentDetail: IPCamContentDetail = templateContents[i].content
            .contentDetail as IPCamContentDetail;

          if (ipcamContentDetail !== undefined && ipcamContentDetail.ipcam.length > 0) {
            for (let j = 0; j < ipcamContentDetail.ipcam?.length; j += 1) {
              ipcam.push({
                camName: ipcamContentDetail.ipcam[j].camName,
                rtspUrl: ipcamContentDetail.ipcam[j].rtspUrl,
                durations: ipcamContentDetail.ipcam[j].durations,
              });
            }
          }
          if (ipcam !== undefined && ipcam.length === 0) {
            ipcam.push({ camName: '', rtspUrl: '', durations: -1 });
          }
          updateTemplateContentInput.updateTemplateContent[i].contentDeatail.ipCam = ipcam;
        }
        if (
          templateContents[i].content.contentCommon.contentTypeId === '628dd0b71df620dbe8629248'
        ) {
          const weatherContentDetail = templateContents[i].content
            .contentDetail as unknown as WeatherContentDetail;
          const weather: Weather = {
            weatherStyleId: weatherContentDetail.weatherStyleId,
            temperatureUnit: weatherContentDetail.temperatureUnit,
            windSpeedUnit: weatherContentDetail.windSpeedUnit,
            languageId: weatherContentDetail.languageId,
            backgroundColor: weatherContentDetail.backgroundColor,
            durations: weatherContentDetail.durations,
            citys: weatherContentDetail.citys,
          };

          updateTemplateContentInput.updateTemplateContent[i].contentDeatail.weather = weather;
        }

        if (
          templateContents[i].content.contentCommon.contentTypeId === '628dd0b71df620dbe8629249'
        ) {
          const webPage: Webpage[] = [];
          const webPageContentDetail: WebPageContentDetail = templateContents[i].content
            .contentDetail as WebPageContentDetail;

          if (webPageContentDetail !== undefined && webPageContentDetail.webpage.length > 0) {
            for (let j = 0; j < webPageContentDetail.webpage?.length; j += 1) {
              webPage.push({
                webUrl: webPageContentDetail.webpage[j].webUrl,
                playTime: webPageContentDetail.webpage[j].playTime,
              });
            }
          }
          if (webPage !== undefined && webPage.length === 0) {
            webPage.push({ webUrl: '', playTime: -1 });
          }
          updateTemplateContentInput.updateTemplateContent[i].contentDeatail.webpage = webPage;
        }
      }
      if (updateTemplateContentInput !== undefined)
        setUpdateTemplateContentInputforPublish(updateTemplateContentInput);
    }
    return updateTemplateContentInput;
  }, [handleMediaUpload, templateContents]);

  const handlePublish2AddSchedule = useCallback(async () => {
    if (templateSchedule !== undefined) {
      const groupId = permissionGroup && permissionGroup?.group.id;
      const token = `${user.accessToken || ''}`;
      let updateTemplateContentInput = await handlePackUpdateTemplateContentInput();
      const templateScheduleInput: TemplateScheduleInput = handlePackTemplateScheduleInput();

      if (
        templateScheduleInput !== undefined &&
        templateListDataSource !== undefined &&
        templateListDataSource.length > 0 &&
        imgSelectedIndex >= 0 &&
        imgSelectedIndex < templateListDataSource.length
      ) {
        templateScheduleInput.templateId =
          templateListDataSource[imgSelectedIndex]?.key !== undefined
            ? templateListDataSource[imgSelectedIndex].key
            : '';
      }

      if (templateScheduleInput.players !== null && templateScheduleInput.players?.length === 0) {
        const players: string[] = [];

        for (let i = 0; i < selectedESignagePlayers.length; i += 1) {
          players.push(selectedESignagePlayers[i].value);
        }
        templateScheduleInput.players = players;
      }

      if (
        groupId !== undefined &&
        groupId !== null &&
        updateTemplateContentInput !== undefined &&
        updateTemplateContentInput.updateTemplateContent.length > 0
      ) {
        if (updateTemplateContentInput.updateTemplateContent[0].contentId === '')
          updateTemplateContentInput = { ...updateTemplateContentInputforPublish };

        void updateTemplateContentAndAddSchedule({
          variables: {
            groupId,
            token,
            updateTemplateContentInput,
            templateScheduleInput,
          },
        });
      }
    }
  }, [
    handlePackTemplateScheduleInput,
    handlePackUpdateTemplateContentInput,
    imgSelectedIndex,
    permissionGroup,
    selectedESignagePlayers,
    templateListDataSource,
    templateSchedule,
    updateTemplateContentAndAddSchedule,
    updateTemplateContentInputforPublish,
    user.accessToken,
  ]);

  const handlePublish2UpdateSchedule = useCallback(async () => {
    if (templateSchedule !== undefined) {
      const groupId = permissionGroup && permissionGroup?.group.id;
      const token = `${user.accessToken || ''}`;
      const templateScheduleId = templateSchedule && templateSchedule?.scheduleId;
      let updateTemplateContentInput = await handlePackUpdateTemplateContentInput();
      const templateScheduleInput: TemplateScheduleInput = handlePackTemplateScheduleInput();
      if (templateScheduleId !== '') {
        if (templateScheduleInput.templateId && templateScheduleInput.templateId.trim() === '') {
          templateScheduleInput.templateId =
            templateListDataSource !== undefined &&
            templateListDataSource[imgSelectedIndex]?.key !== undefined
              ? templateListDataSource[imgSelectedIndex].key
              : '';
        }

        if (templateScheduleInput.players !== null && templateScheduleInput.players?.length === 0) {
          const players: string[] = [];
          for (let i = 0; i < selectedESignagePlayers.length; i += 1) {
            players.push(selectedESignagePlayers[i].value);
          }
          templateScheduleInput.players = players;
        }

        if (
          groupId !== undefined &&
          groupId !== null &&
          templateScheduleId !== undefined &&
          updateTemplateContentInput !== undefined &&
          updateTemplateContentInput.updateTemplateContent.length > 0
        ) {
          if (updateTemplateContentInput.updateTemplateContent[0].contentId === '')
            updateTemplateContentInput = { ...updateTemplateContentInputforPublish };

          void updateTemplateContentAndUpdateSchedule({
            variables: {
              groupId,
              token,
              templateScheduleId,
              updateTemplateContentInput,
              templateScheduleInput,
            },
          });
        }
      } else {
        await handlePublish2AddSchedule();
      }
    }
  }, [
    handlePackTemplateScheduleInput,
    handlePackUpdateTemplateContentInput,
    handlePublish2AddSchedule,
    imgSelectedIndex,
    permissionGroup,
    selectedESignagePlayers,
    templateListDataSource,
    templateSchedule,
    updateTemplateContentAndUpdateSchedule,
    updateTemplateContentInputforPublish,
    user.accessToken,
  ]);

  const handlePublish3AddSchedule = useCallback(async () => {
    if (templateSchedule !== undefined) {
      const groupId = permissionGroup && permissionGroup?.group.id;
      const token = `${user.accessToken || ''}`;
      const templateScheduleInput: TemplateScheduleInput = handlePackTemplateScheduleInput();

      if (templateScheduleInput !== undefined && templateIdforAddTemplate !== undefined) {
        if (templateIdforAddTemplate !== '')
          templateScheduleInput.templateId = templateIdforAddTemplate;
        else {
          templateScheduleInput.templateId =
            templateListDataSource !== undefined &&
            templateListDataSource[imgSelectedIndex]?.key !== undefined
              ? templateListDataSource[imgSelectedIndex].key
              : '';
        }
      }
      if (templateScheduleInput.players !== null && templateScheduleInput.players?.length === 0) {
        const players: string[] = [];
        for (let i = 0; i < selectedESignagePlayers.length; i += 1) {
          players.push(selectedESignagePlayers[i].value);
        }
        templateScheduleInput.players = players;
      }
      if (groupId !== undefined && groupId !== null && templateScheduleInput !== undefined) {
        void addTemplateSchedule({
          variables: { groupId, token, templateScheduleInput },
        });
      }
    }
  }, [
    addTemplateSchedule,
    handlePackTemplateScheduleInput,
    imgSelectedIndex,
    permissionGroup,
    selectedESignagePlayers,
    templateIdforAddTemplate,
    templateListDataSource,
    templateSchedule,
    user.accessToken,
  ]);

  const handlePublish3UpdateSchedule = useCallback(async () => {
    if (templateSchedule !== undefined) {
      const groupId = permissionGroup && permissionGroup?.group.id;
      const token = `${user.accessToken || ''}`;
      const templateScheduleId = templateSchedule && templateSchedule?.scheduleId;
      const templateScheduleInput: TemplateScheduleInput = handlePackTemplateScheduleInput();

      if (templateScheduleInput.templateId && templateScheduleInput.templateId.trim() === '') {
        templateScheduleInput.templateId =
          templateListDataSource !== undefined &&
          templateListDataSource[imgSelectedIndex]?.key !== undefined
            ? templateListDataSource[imgSelectedIndex].key
            : '';
      }

      if (templateScheduleInput.players !== null && templateScheduleInput.players?.length === 0) {
        const players: string[] = [];
        for (let i = 0; i < selectedESignagePlayers.length; i += 1) {
          players.push(selectedESignagePlayers[i].value);
        }
        templateScheduleInput.players = players;
      }

      if (templateScheduleId !== '') {
        if (groupId !== undefined && groupId !== null) {
          void updateTemplateSchedule({
            variables: {
              groupId,
              token,
              templateScheduleInput,
              templateScheduleId: templateScheduleId || '',
            },
          });
        }
      } else {
        await handlePublish3AddSchedule();
      }
    }
  }, [
    handlePackTemplateScheduleInput,
    handlePublish3AddSchedule,
    imgSelectedIndex,
    permissionGroup,
    selectedESignagePlayers,
    templateListDataSource,
    templateSchedule,
    updateTemplateSchedule,
    user.accessToken,
  ]);

  const handleTemplateBasicSave = useCallback(() => {
    let groupId = permissionGroup && permissionGroup?.group.id;
    const templateId = templateListDataSource ? templateListDataSource[imgSelectedIndex].key : '';
    const templateInput: UpdateTemplateInput = {
      name: '',
      description: '',
      templateTypeId: '',
      backgroundColor: '',
      group: '',
    };

    if (templateBasicInfo !== undefined) {
      if (templateBasicInfo.groupId === null || templateBasicInfo.groupId.trim() === '') {
        if (groupId !== null && groupId.trim() !== '')
          setTemplateBasicInfo({ ...templateBasicInfo, groupId });
      } else groupId = templateBasicInfo.groupId.trim();

      templateInput.name = templateBasicInfo.templateName;
      templateInput.templateTypeId = templateBasicInfo.templateType;
      templateInput.description = templateBasicInfo.description;
      templateInput.backgroundColor = templateBasicInfo.backgroundColor;
      templateInput.group = templateBasicInfo.groupId;
    }

    if (groupId !== undefined && groupId !== null && templateInput !== undefined) {
      void updateTemplate({
        variables: { groupId, templateId, updateTemplateInput: templateInput },
      });
    }
  }, [
    imgSelectedIndex,
    permissionGroup,
    templateBasicInfo,
    templateListDataSource,
    updateTemplate,
  ]);

  const handleTemplateDetailsSave = useCallback(async () => {
    const groupId = permissionGroup && permissionGroup?.group.id;
    const templateId =
      templateListDataSource !== undefined &&
      imgSelectedIndex !== undefined &&
      imgSelectedIndex > -1 &&
      templateListDataSource[imgSelectedIndex]?.key !== undefined
        ? templateListDataSource[imgSelectedIndex].key
        : '';
    let updateTemplateContentInput: UpdateTemplateContentInput = { updateTemplateContent: [] };

    if (templateContents !== null && templateContents.length > 0) {
      updateTemplateContentInput = await handlePackUpdateTemplateContentInput();
    }

    if (groupId !== undefined && groupId !== null) {
      void updateTemplateContent({
        variables: { groupId, templateId, updateTemplateContentInput },
      });
    }
  }, [
    imgSelectedIndex,
    handlePackUpdateTemplateContentInput,
    permissionGroup,
    templateContents,
    templateListDataSource,
    updateTemplateContent,
  ]);

  const handleModifyBasic = useCallback(() => {
    if (imgSelectedIndex !== undefined && imgSelectedIndex < 0) {
      setOpenDialog4(true);
    } else if (templateListDataSource !== undefined && templateListDataSource.length > 0) {
      const templateIndexLocal = getTemplateIndex(templateListDataSource[imgSelectedIndex].id);
      const templateTypeIdLocal = templateListDataSource[imgSelectedIndex].id;
      const templateBasicInfoLocal: TemplateBasic = {
        groupId: (templateList && templateList.templateOutput[imgSelectedIndex].group) || '',
        templateName: (templateList && templateList.templateOutput[imgSelectedIndex].name) || '',
        templateType:
          (templateList && templateList.templateOutput[imgSelectedIndex].templateTypeId) || '',
        description:
          (templateList && templateList.templateOutput[imgSelectedIndex].description) || '',
        backgroundColor:
          (templateList && templateList.templateOutput[imgSelectedIndex].backgroundColor) || '',
      };

      setSaveButtonDisabled(true);

      setTemplateBasicInfo(templateBasicInfoLocal);

      const tabContentLocal = (
        <div className={classes.templateInfoPanel}>
          <TemplateInfo
            templateIndex={templateIndexLocal}
            templateTypeId={templateTypeIdLocal}
            templateTitle={
              templateListDataSource ? templateListDataSource[imgSelectedIndex].title : undefined
            }
            templateBasic={templateBasicInfoLocal}
            onTemplateBasicChanged={handleOnTemplateBasicChanged}
          />
        </div>
      );
      setTabContent(tabContentLocal);
      setDisplayTemplateBasicSaveButton(true);
      setCancelButtonStyle(displayStyle);
      setBackButtonStyle(hideStyle);
      setNextButtonStyle(hideStyle);
      setSaveButtonStyle(saveButtonDisplayStyle);
      setSaveButtonDisabled(true);

      setPublishButtonStyle(publishButtonHideStyle);
      setAddButtonStyle({ display: 'none' });
      setModifyButtonStyle({ display: 'none' });
      setDividerStyle({ display: 'none' });
      setDeleteButtonStyle({ display: 'none' });
      setExitButtonStyle({ display: 'inline' });
    }
    setAction('MODIFY-BASIC');
    currentAction.current = 'MODIFY-BASIC';
    setInitial(true);
  }, [
    classes.templateInfoPanel,
    displayStyle,
    getTemplateIndex,
    handleOnTemplateBasicChanged,
    hideStyle,
    imgSelectedIndex,
    publishButtonHideStyle,
    saveButtonDisplayStyle,
    templateList,
    templateListDataSource,
  ]);

  const handleModifyDetails = useCallback(() => {
    if (imgSelectedIndex !== undefined && imgSelectedIndex < 0) {
      setOpenDialog4(true);
    } else {
      let tabContentLocal;
      const selectedRectId = 'rect1';
      const templateIndexLocal =
        templateListDataSource !== undefined && templateListDataSource.length > 0
          ? getTemplateIndex(templateListDataSource[imgSelectedIndex].id)
          : -1;

      void refetchTemplateContent();
      void refetchTemplateSchedule();
      setModifyDetails(true);

      if (templateIndexLocal > -1 && templateContents.length > 0) {
        setResetViewerUI(true);
        if (
          templateIndexLocal === 6 ||
          templateIndexLocal === 8 ||
          templateIndexLocal === 9 ||
          templateIndexLocal === 11
        ) {
          contentTypeRef.current = 'Web Content';
          tabContentLocal = (
            <div className={classes.templateInfoPanel}>
              <WebContentInfo
                templateIndex={
                  templateIndexLocal !== undefined && templateIndexLocal > -1
                    ? templateIndexLocal
                    : -1
                }
                templateTitle={
                  imageDataSource ? imageDataSource[templateIndexLocal].title : undefined
                }
                rectId={selectedRectId}
                webPageContent={templateContents[0].content as WebPageContent}
                onWebPageContentChanged={handleOnWebPageContentChanged}
                onChangeType={handleOnChangeType}
              />
            </div>
          );
        } else {
          contentTypeRef.current = 'Weather Content';
          tabContentLocal = (
            <div className={classes.templateInfoPanel}>
              <WeatherContentInfo
                templateIndex={
                  templateIndexLocal !== undefined && templateIndexLocal > -1
                    ? templateIndexLocal
                    : -1
                }
                templateTitle={
                  imageDataSource ? imageDataSource[templateIndexLocal].title : undefined
                }
                rectId={selectedRectId}
                weatherContent={templateContents[0].content as WeatherContent}
                onWeatherContentChanged={handleOnWeatherContentChanged}
                onChangeType={handleOnChangeType}
              />
            </div>
          );
        }
        setTabContent(tabContentLocal);
        setDisplayStepper(true);
        setDisplayTemplateBasicSaveButton(true);
        setImgSelectedIndex(imgSelectedIndex);
        stepRef.current = 0;
        setStep(stepRef.current);
        setStepAction('RESET');
        setCancelButtonStyle(displayStyle);

        setBackButtonStyle(hideStyle);
        setNextButtonStyle(displayStyle);
        setNextButtonDisabled(false);
        setSaveButtonStyle(saveButtonDisplayStyle);
        setPublishButtonStyle(publishButtonHideStyle);

        setAddButtonStyle({ display: 'none' });
        setModifyButtonStyle({ display: 'none' });
        setDividerStyle({ display: 'none' });
        setDeleteButtonStyle({ display: 'none' });
        setExitButtonStyle({ display: 'inline' });
      }
    }
    setAction('MODIFY-DETAILS');
    currentAction.current = 'MODIFY-DETAILS';
    setInitial(true);
    setSelectedESignagePlayers([]);

    // console.info('handleModifyDetails');
    // void refetchTemplateSchedule();

    if (scheduleId !== undefined && scheduleId.current !== '') {
      setExecPublish('Publish2-UpdateSchdule');
    } else {
      setExecPublish('Publish2-AddSchdule');
    }
  }, [
    classes.templateInfoPanel,
    displayStyle,
    getTemplateIndex,
    handleOnChangeType,
    handleOnWeatherContentChanged,
    handleOnWebPageContentChanged,
    hideStyle,
    imageDataSource,
    imgSelectedIndex,
    publishButtonHideStyle,
    refetchTemplateContent,
    refetchTemplateSchedule,
    saveButtonDisplayStyle,
    templateContents,
    templateListDataSource,
  ]);

  const tabTitles = useMemo(
    () =>
      templates.map((template, index) => ({
        //  title: template.name ,
        title:
          index === 0
            ? (templateListDataSource !== undefined &&
                String().concat(
                  t('Content'),
                  ' (',
                  templateListDataSource.length.toString(),
                  ')',
                )) ||
              String().concat(t('Content'), '')
            : String().concat(t('Publish'), '') || '',
        tabId: template.id,
        disabled: template.disabled /* index !== 0 */,
      })),
    [templateListDataSource, t, templates],
  );

  useEffect(() => {
    if (initial) {
      if (contentTabText !== undefined && contentTabText.trim() !== '') setInitial(false);
      if (templateListDataSource === undefined || templateListDataSource.length === 0)
        setInitial(false);

      const contentTab: TemplateContentPayload = {
        id: 'newESignageTemplate',
        name: `${contentTabText || t('Content')}`,
        permission: {
          rules: [],
        },
        type: Action.ADD,
        disabled: false,
      };

      const scheduleTab: TemplateContentPayload = {
        id: 'newESignageTemplate',
        name: t('Publish'),
        permission: {
          rules: [],
        },
        type: Action.ADD,
        disabled: true,
      };

      const scheduleTab2: TemplateContentPayload = {
        id: 'newESignageTemplate',
        name: t('Publish'),
        permission: {
          rules: [],
        },
        type: Action.ADD,
        disabled: false,
      };

      setTemplates((): TemplateContentPayload[] => {
        let templatesLocal: TemplateContentPayload[];
        templates.length = 0;

        if (action === '' && imgSelectedIndex > -1)
          templatesLocal = templates.concat(contentTab).concat(scheduleTab2);
        else templatesLocal = templates.concat(contentTab).concat(scheduleTab);

        return templatesLocal;
      });
    }

    if (templateList !== undefined) {
      if (initTab) {
        setInitTab(false);
        handleSelectTab(0);
      }
    }
  }, [
    action,
    contentTabText,
    handleSelectTab,
    imgSelectedIndex,
    initTab,
    initial,
    t,
    tabIndex,
    templateList,
    templateListDataSource,
    templateType,
    templates,
  ]);

  return (
    <I18nProvider>
      <TemplateProvider>
        <MainLayout>
          <Guard subject={Subject.ESIGNAGE} action={Action.VIEW}>
            <PageContainer>
              <Header
                title={t('esignage:eSignage Management')}
                description={undefined}
                classes={{ root: classes.fullWidth }}
              >
                <Grid>
                  <Grid container className={classes.buttons}>
                    <Guard subject={Subject.ESIGNAGE} action={Action.REMOVE} fallback={null}>
                      <Grid item>
                        <ThemeIconButton
                          tooltip={t('common:Delete')}
                          color="primary"
                          onClick={() => handleDelete()}
                          style={deleteButtonStyle}
                        >
                          <DeleteIcon />
                        </ThemeIconButton>
                      </Grid>
                    </Guard>
                    <Grid item>
                      <Divider orientation="vertical" style={dividerStyle} />
                    </Grid>
                    <Guard subject={Subject.ESIGNAGE} action={Action.MODIFY} fallback={null}>
                      <Grid item>
                        <ThemeIconButton
                          tooltip={t('Modify Template Basic')}
                          color="primary"
                          variant="contained"
                          onClick={() => handleModifyBasic()}
                          disabled={false}
                          style={modifyButtonStyle}
                        >
                          {/* <BasicIcon /> */}
                          <EditIcon />
                        </ThemeIconButton>
                      </Grid>
                    </Guard>
                    <Grid item>
                      <Divider orientation="vertical" style={dividerStyle} />
                    </Grid>
                    <Guard subject={Subject.ESIGNAGE} action={Action.MODIFY} fallback={null}>
                      <Grid item>
                        <ThemeIconButton
                          tooltip={t('Modify Template Details')}
                          color="primary"
                          variant="contained"
                          onClick={() => handleModifyDetails()}
                          disabled={false}
                          style={modifyButtonStyle}
                        >
                          <DetailsIcon />
                        </ThemeIconButton>
                      </Grid>
                    </Guard>
                    <Grid item>
                      <Divider orientation="vertical" style={dividerStyle} />
                    </Grid>
                    <Guard subject={Subject.ESIGNAGE} action={Action.ADD} fallback={null}>
                      <Grid item>
                        <ThemeIconButton
                          tooltip={t('common:Add')}
                          color="primary"
                          variant="contained"
                          onClick={() => handleAdd()}
                          disabled={false}
                          style={addButtonStyle}
                        >
                          <AddIcon />
                        </ThemeIconButton>
                      </Grid>
                    </Guard>
                    <Grid item>
                      <Divider orientation="vertical" style={dividerStyle} />
                    </Grid>
                    <Guard subject={Subject.ESIGNAGE} action={Action.ADD} fallback={null}>
                      <Grid item>
                        <ThemeIconButton
                          tooltip={t('Exit')}
                          color="primary"
                          variant="contained"
                          onClick={() => handleCancel()}
                          disabled={false}
                          style={exitButtonStyle}
                        >
                          <ExitIcon />
                        </ThemeIconButton>
                      </Grid>
                    </Guard>
                  </Grid>
                </Grid>
              </Header>
              <div className={classes.panel}>
                <TabPanelSet
                  customTabPanelClass={classes.tabPanelBox}
                  tabsColor="transparent"
                  tabSize="small"
                  rounded={false}
                  tabTitles={tabTitles}
                  index={tabIndex}
                  onSelect={handleSelectTab}
                >
                  {tabIndex !== undefined &&
                    tabIndex === TabPanelType.Content &&
                    displayStepper !== undefined &&
                    displayStepper && (
                      <div
                        style={{
                          color: 'gray',
                          marginTop: 5,
                          marginBottom: 5,
                          textAlign: 'center',
                          display: displayNextButton || modifyDetails === true ? 'block' : 'none',
                        }}
                      >
                        <HorizontalLinearStepper
                          steps={action && action === 'ADD' ? steps : updateSteps}
                          action={stepAction}
                          parentStep={step}
                          optionalStep={-1}
                          displayStepHint={false}
                          displayStepNavi={false}
                          onChangeStep={handleOnChangeStep}
                        />
                      </div>
                    )}
                  {tabIndex !== undefined && tabIndex === 0 && tabContent}
                  {tabIndex !== undefined &&
                    tabIndex === 0 &&
                    displayNextButton !== undefined &&
                    displayNextButton && (
                      <div
                        style={{
                          marginTop: 30,
                          textAlign: 'center',
                          display: displayNextButton ? 'block' : 'none',
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handleCancel}
                          style={cancelButtonStyle}
                        >
                          {t('esignage:Cancel')}
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handleBack}
                          style={backButtonStyle}
                        >
                          {t('esignage:Back')}
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handleNext}
                          style={nextButtonStyle}
                          disabled={nextButtonDisabled}
                        >
                          {t('esignage:Next')}
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={() => {
                            void (async () => {
                              await handleSave();
                            })();
                          }}
                          style={saveButtonStyle}
                          disabled={saveButtonDisabled}
                        >
                          {t('esignage:Save')}
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={() => {
                            void (async () => {
                              await handlePublish();
                            })();
                          }}
                          style={publishButtonStyle}
                          disabled={publishButtonDisabled}
                        >
                          {publishMode !== undefined && publishMode === 'S'
                            ? t('Scheduled Publish')
                            : t('Publish Immediately')}
                        </Button>
                        <AlertDialogSlide
                          openDialog={openDialog}
                          dialogTitle={t('Information')}
                          dialogContentText={t('Please select a template first.')}
                          yesButtonName={t('OK')}
                          noButtonName=""
                          onChangeState={handleAlertDialogOnChangeState}
                        />
                        <AlertDialogSlide
                          openDialog={openSaveDialog}
                          dialogTitle={t('Information')}
                          dialogContentText={
                            saveSuccess
                              ? t('The information has been saved successfully')
                              : t('Save failed. Please try again.')
                          }
                          yesButtonName={t('OK')}
                          noButtonName=""
                          onChangeState={handleAlertDialogOnSave}
                        />
                        <AlertDialogSlide
                          openDialog={openPublishDialog}
                          dialogTitle={t('Information')}
                          dialogContentText={
                            publishSuccess
                              ? t('The template contents have been published successfully')
                              : t('Publish failed. Please try again.')
                          }
                          yesButtonName={t('OK')}
                          noButtonName=""
                          onChangeState={handleAlertDialogOnPublish}
                        />
                      </div>
                    )}
                  {tabIndex !== undefined &&
                    tabIndex === TabPanelType.Content &&
                    displayTemplateBasicSaveButton !== undefined &&
                    displayTemplateBasicSaveButton && (
                      <div
                        style={{
                          marginTop: 30,
                          textAlign: 'center',
                          display: displayTemplateBasicSaveButton ? 'block' : 'none',
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handleCancel}
                          style={cancelButtonStyle}
                        >
                          {t('esignage:Cancel')}
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handleBack2}
                          style={backButtonStyle}
                        >
                          {t('esignage:Back')}
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handleNext2}
                          style={nextButtonStyle}
                          disabled={nextButtonDisabled}
                        >
                          {t('esignage:Next')}
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={
                            action === 'MODIFY-BASIC'
                              ? handleTemplateBasicSave
                              : handleTemplateDetailsSave
                          }
                          style={saveButtonStyle}
                          disabled={saveButtonDisabled}
                        >
                          {t('esignage:Save')}
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={() => {
                            void (async () => {
                              if (execPublish === 'Publish2-UpdateSchdule') {
                                await handlePublish2UpdateSchedule();
                              } else if (execPublish === 'Publish2-AddSchdule') {
                                await handlePublish2AddSchedule();
                              }
                            })();
                          }}
                          style={publishButtonStyle}
                          disabled={publishButtonDisabled}
                        >
                          {publishMode !== undefined && publishMode === 'S'
                            ? t('Scheduled Publish')
                            : t('Publish Immediately')}
                        </Button>
                        <AlertDialogSlide
                          openDialog={openSaveDialog2}
                          dialogTitle={t('Information')}
                          dialogContentText={
                            saveSuccess
                              ? t('The information has been saved successfully')
                              : t('Save failed. Please try again.')
                          }
                          yesButtonName={t('OK')}
                          noButtonName=""
                          onChangeState={handleAlertDialog2OnSave}
                        />
                        <AlertDialogSlide
                          openDialog={openPublishDialog2}
                          dialogTitle={t('Information')}
                          dialogContentText={
                            publishSuccess
                              ? t('The template contents have been published successfully')
                              : t('Publish failed. Please try again.')
                          }
                          yesButtonName={t('OK')}
                          noButtonName=""
                          onChangeState={handleAlertDialog2OnPublish}
                        />
                      </div>
                    )}

                  {tabIndex !== undefined &&
                    tabIndex === TabPanelType.Publish &&
                    displayStepper !== undefined &&
                    displayStepper && (
                      <div className={classes.schedulePanel}>
                        <div
                          style={{
                            color: 'gray',
                            marginTop: 1,
                            marginBottom: 1,
                            textAlign: 'center',
                          }}
                        >
                          <HorizontalLinearStepper
                            steps={scheduleSteps}
                            action={stepAction}
                            parentStep={step}
                            optionalStep={-1}
                            displayStepHint={false}
                            displayStepNavi={false}
                            onChangeStep={handleOnChangeStep}
                          />
                        </div>
                      </div>
                    )}
                  {tabIndex !== undefined && tabIndex === 1 && tabContent2}
                  {tabIndex !== undefined && tabIndex === 1 && (
                    <div
                      style={{
                        marginTop: 25,
                        textAlign: 'center',
                        display: 'inline',
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleCancel}
                        style={cancelButtonStyle}
                      >
                        {t('esignage:Cancel')}
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleBack3}
                        style={backButtonStyle}
                      >
                        {t('esignage:Back')}
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleNext3}
                        style={nextButtonStyle}
                        disabled={nextButtonDisabled}
                      >
                        {t('esignage:Next')}
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => {
                          void (async () => {
                            if (execPublish === 'Publish3-UpdateSchdule')
                              await handlePublish3UpdateSchedule();
                            else if (execPublish === 'Publish3-AddSchdule')
                              await handlePublish3AddSchedule();
                          })();
                        }}
                        style={publishButtonStyle}
                        disabled={publishButtonDisabled}
                      >
                        {publishMode !== undefined && publishMode === 'S'
                          ? t('Scheduled Publish')
                          : t('Publish Immediately')}
                      </Button>
                    </div>
                  )}
                </TabPanelSet>
                <div />
              </div>
              <AlertDialogSlide
                openDialog={openDialog2}
                dialogTitle={t('Information')}
                dialogContentText={t('Please select a template to delete first.')}
                yesButtonName={t('OK')}
                noButtonName=""
                onChangeState={handleAlertDialog2OnChangeState}
              />
              <AlertDialogSlide
                openDialog={openDialog3}
                dialogTitle={t('Information')}
                dialogContentText={String().concat(
                  t('Do you want to delete this template content?'),
                  ' (',
                  templateListDataSource
                    ? templateListDataSource[imgSelectedIndex]?.description &&
                        templateListDataSource[imgSelectedIndex]?.description
                    : '',
                  ') ',
                )}
                yesButtonName={t('YES')}
                noButtonName={t('NO')}
                onChangeState={handleAlertDialog3OnChangeState}
              />
              <AlertDialogSlide
                openDialog={openDialog4}
                dialogTitle={t('Information')}
                dialogContentText={t('Please select a template to modify first.')}
                yesButtonName={t('OK')}
                noButtonName=""
                onChangeState={handleAlertDialog4OnChangeState}
              />
              <AlertDialogSlide
                openDialog={openDeleteDialog}
                dialogTitle={t('Information')}
                dialogContentText={
                  deleteSuccess
                    ? t('The template has been deleted successfully')
                    : t('Delete failed. Please try again.')
                }
                yesButtonName={t('OK')}
                noButtonName=""
                onChangeState={handleAlertDialogOnDelete}
              />
              <AlertDialogSlide
                openDialog={openPublishDialog3}
                dialogTitle={t('Information')}
                dialogContentText={
                  publishSuccess
                    ? t('The template contents have been published successfully')
                    : t('Publish failed. Please try again.')
                }
                yesButtonName={t('OK')}
                noButtonName=""
                onChangeState={handleAlertDialog3OnPublish}
              />
            </PageContainer>
          </Guard>
        </MainLayout>
      </TemplateProvider>
    </I18nProvider>
  );
};

export default memo(ESignage);
