import { makeStyles } from '@material-ui/core/styles';
import BaseDialog from 'city-os-common/modules/BaseDialog';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';

import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Color } from 'material-ui-color';
import { useQuery } from '@apollo/client';
import { useStore } from 'city-os-common/reducers';
import Button from '@material-ui/core/Button';
import FormControl from '@mui/material/FormControl';
import TransferList from '../common/TransferList';

import {
  ContentCommon,
  ESignageTemplateType,
  ImageDataSource,
  ListItemDataSource,
  TemplateContent,
  WeatherContent,
  WeatherContentDetail,
  WeatherLayoutSize,
  WeatherLayoutType,
} from '../../libs/type';

import {
  GET_LANGUAGE,
  GetLanguagePayload,
  GetLanguageResponse,
  LanguageOutput,
} from '../../api/getLanguage';

import { CityOutput, GET_CITY, GetCityPayload, GetCityResponse } from '../../api/getCity';

import I18nProvider from '../I18nESignageProvider';
import ImageViewer from '../common/ImageViewer';

import useESignageTranslation from '../../hooks/useESignageTranslation';

import ColorPickerComponent from '../common/ColorPicker';

import ESignageTemplateContentImage from './ESignageTemplateContentImage';
import WeatherLayoutImage from './WeatherLayoutImage';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '82%',
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    overflow: 'overflow-y',
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    alignItems: 'center',
    width: 'min(800px, 550vw)',
    overflow: 'hidden',
  },
  kanbanBox: {
    width: 296,
    marginLeft: 'auto',
    padding: theme.spacing(1),
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
  textFiledPaperPaddingBottom: {
    paddingBottom: 15,
  },
  btnSettingBox: {
    marginTop: theme.spacing(3),
    marginBottom: 20,
  },
}));

interface TemplateProps {
  templateIndex: number;
  templateTitle?: string | undefined;
  rectId: string;
  weatherContent?: WeatherContent | undefined;
  onChangeType?: (contentType: string, selectedRectId: string) => void | null | undefined;
  onWeatherContentChanged?: (
    newWeatherContentInfo: WeatherContent,
    rectId: string,
  ) => void | null | undefined;
}

const WeatherContentInfo: VoidFunctionComponent<TemplateProps> = (props: TemplateProps) => {
  const {
    templateIndex,
    templateTitle,
    rectId,
    weatherContent,
    onChangeType,
    onWeatherContentChanged,
  } = props;
  const [index, setIndex] = useState(templateIndex);
  const [title, setTitle] = useState(templateTitle || '');
  const classes = useStyles();
  const { t } = useESignageTranslation(['esignage']);
  const [weatherLayoutDataSource] = useState<ImageDataSource[]>([
    { id: 'w_temp1.jpg', title: 'layout1', description: '', key: '628dd82d1df620dbe862924d' },
    { id: 'w_temp2.jpg', title: 'layout2', description: '', key: '628dd82d1df620dbe862924e' },
    { id: 'w_temp3.jpg', title: 'layout3', description: '', key: '628dd82d1df620dbe862924f' },
  ]);
  const [resetViewerUI, setResetViewerUI] = useState<boolean>(true);
  const [displayAvailableList] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const [languageDataSource, setLanguageDataSource] = useState<LanguageOutput[]>();
  const [cityDataSource, setCityDataSource] = useState<CityOutput[]>();
  const [availableList, setAvailableList] = useState<ListItemDataSource[]>([]);
  const [selectedList, setSelectedList] = useState<ListItemDataSource[]>([]);
  const [availableListBeforeSetting, setAvailableListBeforeSetting] = useState<
    ListItemDataSource[]
  >([]);
  const [selectedListBeforeSetting, setSelectedListBeforeSetting] = useState<ListItemDataSource[]>(
    [],
  );
  const availableListRef = useRef<ListItemDataSource[] | []>([]);
  const selectedListRef = useRef<ListItemDataSource[] | []>([]);
  const [isInit, setIsInit] = useState<boolean>(true);
  const [page /* setPage */] = useState(1);
  const [pageSize /* setPageSize */] = useState(0);
  const [weatherContentInfo, setWeatherContentInfo] = useState<WeatherContent>(() => {
    if (weatherContent !== undefined) {
      return weatherContent;
    }
    const contentCommonLocal: ContentCommon = {
      contentTypeId: '',
      contentName: t('Weather Content'),
    };
    const weatherContentDetailLocal: WeatherContentDetail = {
      weatherStyleId: '628dd82d1df620dbe862924d',
      temperatureUnit: 'C',
      windSpeedUnit: 'K',
      languageId: '',
      backgroundColor: 'FF0000',
      durations: 5,
      citys: [],
    };
    const weatherContentInfoLocal: WeatherContent = {
      contentCommon: contentCommonLocal,
      contentDetail: weatherContentDetailLocal,
    };
    return weatherContentInfoLocal;
  });

  const [layoutImgSelectedIndex, setLayoutImgSelectedIndex] = useState<number>(() => {
    let layoutImgSelectedIndexLocal = -1;
    if (
      weatherLayoutDataSource !== undefined &&
      weatherLayoutDataSource.length > 0 &&
      weatherContentInfo !== undefined
    ) {
      for (let i = 0; i < weatherLayoutDataSource.length; i += 1) {
        if (weatherLayoutDataSource[i].key === weatherContentInfo.contentDetail.weatherStyleId) {
          layoutImgSelectedIndexLocal = i;
          break;
        }
      }
      return layoutImgSelectedIndexLocal;
    }
    return 0;
  });

  const {
    userProfile: { permissionGroup },
  } = useStore();

  useQuery<GetLanguageResponse, GetLanguagePayload>(GET_LANGUAGE, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      page,
      pageSize,
      // filter: {},
    },
    onCompleted: (languageDataObject) => {
      // console.log(languageDataObject?.getLanguage?.totalCount);
      if (languageDataObject !== undefined) {
        setLanguageDataSource(languageDataObject.getLanguage.languageOutput);
      }
    },
    onError: (/* error */) => {
      // if (D_DEBUG) console.error(error.graphQLErrors);
    },
    skip: !permissionGroup?.group.id,
  });

  /* const { refetch: refetchCitys } = */
  useQuery<GetCityResponse, GetCityPayload>(GET_CITY, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      page,
      pageSize,
      // filter: {},
    },
    onCompleted: (cityDataObject) => {
      // console.log(cityDataObject?.getCity?.totalCount);
      if (cityDataObject !== undefined) {
        setCityDataSource(cityDataObject.getCity.cityOutput);
      }
    },
    onError: (/* error */) => {
      // if (D_DEBUG) console.error(error.graphQLErrors);
    },
    skip: !permissionGroup?.group.id,
  });

  const handleContentNameChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const contentCommonLocal: ContentCommon = {
        ...weatherContentInfo?.contentCommon,
        contentName: e.target.value,
      };
      setWeatherContentInfo({
        ...weatherContentInfo,
        contentCommon: contentCommonLocal,
      });
    },
    [weatherContentInfo],
  );

  const handleTeamperatureUnitChanged = useCallback(
    // (e: SelectChangeEvent<string>, _child: ReactNode) => {
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const contentDetailLocal: WeatherContentDetail = {
        ...weatherContentInfo?.contentDetail,
        temperatureUnit: e.target.value,
      };
      setWeatherContentInfo({ ...weatherContentInfo, contentDetail: contentDetailLocal });
    },
    [weatherContentInfo],
  );

  const handleWindSpeedUnitChanged = useCallback(
    // (e: SelectChangeEvent<string>, _child: ReactNode) => {
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const contentDetailLocal: WeatherContentDetail = {
        ...weatherContentInfo?.contentDetail,
        windSpeedUnit: e.target.value,
      };
      setWeatherContentInfo({ ...weatherContentInfo, contentDetail: contentDetailLocal });
    },
    [weatherContentInfo],
  );

  const handleLanguageChanged = useCallback(
    // (e: SelectChangeEvent<string>, _child: ReactNode) => {
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const contentDetailLocal: WeatherContentDetail = {
        ...weatherContentInfo?.contentDetail,
        languageId: e.target.value,
      };
      setWeatherContentInfo({ ...weatherContentInfo, contentDetail: contentDetailLocal });
    },
    [weatherContentInfo],
  );

  const handleDisplayDurationChanged = useCallback(
    // (e: SelectChangeEvent<string>, _child: ReactNode) => {
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const contentDetailLocal: WeatherContentDetail = {
        ...weatherContentInfo?.contentDetail,
        durations: e.target.value ? parseInt(e.target.value, 10) : 5,
      };
      setWeatherContentInfo({ ...weatherContentInfo, contentDetail: contentDetailLocal });
    },
    [weatherContentInfo],
  );

  const getCitysTranslation = useCallback(
    (cityName: string): string => {
      switch (cityName) {
        case 'Hsinchu (Taiwan)':
          return t('Hsinchu (Taiwan)');
        case 'Nantou (Taiwan)':
          return t('Nantou (Taiwan)');
        case 'Changhua (Taiwan)':
          return t('Changhua (Taiwan)');
        case 'Hualien (Taiwan)':
          return t('Hualien (Taiwan)');
        case 'Taitung (Taiwan)':
          return t('Taitung (Taiwan)');
        case 'Yunlin (Taiwan)':
          return t('Yunlin (Taiwan)');
        case 'Penghu (Taiwan)':
          return t('Penghu (Taiwan)');
        case 'Taichung (Taiwan)':
          return t('Taichung (Taiwan)');
        case 'Chiayi (Taiwan)':
          return t('Chiayi (Taiwan)');
        case 'Tainan (Taiwan)':
          return t('Tainan (Taiwan)');
        case 'Yilan (Taiwan)':
          return t('Yilan (Taiwan)');
        case 'Kaohsiung (Taiwan)':
          return t('Kaohsiung (Taiwan)');
        case 'Pingtung (Taiwan)':
          return t('Pingtung (Taiwan)');
        case 'Kinmen (Taiwan)':
          return t('Kinmen (Taiwan)');
        case 'Matsu (Taiwan)':
          return t('Matsu (Taiwan)');
        case 'Keelung (Taiwan)':
          return t('Keelung (Taiwan)');
        case 'Taipei (Taiwan)':
          return t('Taipei (Taiwan)');
        case 'New Taipei City (Taiwan)':
          return t('New Taipei City (Taiwan)');
        case 'Miaoli (Taiwan)':
          return t('Miaoli (Taiwan)');
        case 'Taoyuan (Taiwan)':
          return t('Taoyuan (Taiwan)');
        case 'Fuzhou (China)':
          return t('Fuzhou (China)');
        case 'Shenyang (China)':
          return t('Shenyang (China)');
        case 'Guangzhou (China)':
          return t('Guangzhou (China)');
        case 'Hong Kong (China)':
          return t('Hong Kong (China)');
        case 'Nanchang (China)':
          return t('Nanchang (China)');
        case 'Qingdao (China)':
          return t('Qingdao (China)');
        case 'Xian (China)':
          return t('Xian (China)');
        case 'Lanzho (China)':
          return t('Lanzho (China)');
        case 'Shanghai (China)':
          return t('Shanghai (China)');
        case 'Kunming (China)':
          return t('Kunming (China)');
        case 'Beijing (China)':
          return t('Beijing (China)');
        case 'Chongqing (China)':
          return t('Chongqing (China)');
        case 'Wuhan (China)':
          return t('Wuhan (China)');
        case 'Hangzhou (China)':
          return t('Hangzhou (China)');
        case 'Nanjing (China)':
          return t('Nanjing (China)');
        case 'Kaifeng (China)':
          return t('Kaifeng (China)');
        case 'Haikou (China)':
          return t('Haikou (China)');
        case 'Seoul (Asia)':
          return t('Seoul (Asia)');
        case 'Kuala Lumpur (Asia)':
          return t('Kuala Lumpur (Asia)');
        case 'Osaka (Asia)':
          return t('Osaka (Asia)');
        case 'Jakarta (Asia)':
          return t('Jakarta (Asia)');
        case 'Manila (Asia)':
          return t('Manila (Asia)');
        case 'Ho Chi Minh City (Asia)':
          return t('Ho Chi Minh City (Asia)');
        case 'New Delhi (Asia)':
          return t('New Delhi (Asia)');
        case 'Tokyo (Asia)':
          return t('Tokyo (Asia)');
        case 'Bangkok (Asia)':
          return t('Bangkok (Asia)');
        case 'Dubai (Asia)':
          return t('Dubai (Asia)');
        case 'Abu Dhabi (Asia)':
          return t('Abu Dhabi (Asia)');
        case 'Hanoi (Asia)':
          return t('Hanoi (Asia)');
        case 'Istanbul (Asia)':
          return t('Istanbul (Asia)');
        case 'Guam (Asia)':
          return t('Guam (Asia)');
        case 'Singapore (Asia)':
          return t('Singapore (Asia)');
        case 'Kathmandu (Asia)':
          return t('Kathmandu (Asia)');
        case 'Madrid (Europe)':
          return t('Madrid (Europe)');
        case 'Venice (Europe)':
          return t('Venice (Europe)');
        case 'Budapest (Europe)':
          return t('Budapest (Europe)');
        case 'Athens (Europe)':
          return t('Athens (Europe)');
        case 'London (Europe)':
          return t('London (Europe)');
        case 'Paris (Europe)':
          return t('Paris (Europe)');
        case 'Berlin (Europe)':
          return t('Berlin (Europe)');
        case 'Amsterdam (Europe)':
          return t('Amsterdam (Europe)');
        case 'Roma (Europe)':
          return t('Roma (Europe)');
        case 'Stockholm (Europe)':
          return t('Stockholm (Europe)');
        case 'Copenhagen (Europe)':
          return t('Copenhagen (Europe)');
        case 'Geneva (Europe)':
          return t('Geneva (Europe)');
        case 'Vienna (Europe)':
          return t('Vienna (Europe)');
        case 'Moscow (Europe)':
          return t('Moscow (Europe)');
        case 'Frankfurt (Europe)':
          return t('Frankfurt (Europe)');
        case 'Canberra (Africa)':
          return t('Canberra (Africa)');
        case 'Nairobi (Africa)':
          return t('Nairobi (Africa)');
        case 'Johannesburg (Africa)':
          return t('Johannesburg (Africa)');
        case 'Algiers (Africa)':
          return t('Algiers (Africa)');
        case 'Tripoli (Africa)':
          return t('Tripoli (Africa)');
        case 'Cairo (Africa)':
          return t('Cairo (Africa)');
        case 'San Francisco (North America)':
          return t('San Francisco (North America)');
        case 'Vancouver (North America)':
          return t('Vancouver (North America)');
        case 'Los Angeles (North America)':
          return t('Los Angeles (North America)');
        case 'New York (North America)':
          return t('New York (North America)');
        case 'Toronto (North America)':
          return t('Toronto (North America)');
        case 'Seattle (North America)':
          return t('Seattle (North America)');
        case 'Buenos Aires (South America)':
          return t('Buenos Aires (South America)');
        case 'Panama (South America)':
          return t('Panama (South America)');
        case 'Rio De Janeiro (South America)':
          return t('Rio De Janeiro (South America)');
        case 'Havana (South America)':
          return t('Havana (South America)');
        case 'San Diego (South America)':
          return t('San Diego (South America)');
        case 'Lima (South America)':
          return t('Lima (South America)');
        case 'Brisbane (Oceania)':
          return t('Brisbane (Oceania)');
        case 'Perth (Oceania)':
          return t('Perth (Oceania)');
        case 'Melbourne (Oceania)':
          return t('Melbourne (Oceania)');
        case 'Sydney (Oceania)':
          return t('Sydney (Oceania)');
        case 'Auckland (Oceania)':
          return t('Auckland (Oceania)');
        case 'Wellington (Oceania)':
          return t('Wellington (Oceania)');
        default:
          return cityName;
      }
    },
    [t],
  );

  const getAvailableCitys = useCallback(() => {
    const availableListLocal: ListItemDataSource[] = [];
    if (cityDataSource !== undefined && cityDataSource.length > 0) {
      for (let i = 0; i < cityDataSource.length; i += 1) {
        availableListLocal.push({
          value: cityDataSource[i].id,
          text: getCitysTranslation(
            String().concat(cityDataSource[i].cityName, ' (', cityDataSource[i].region, ')'),
          ),
          tag: cityDataSource[i].region,
        });
      }
    }
    setAvailableList(availableListLocal);
    availableListRef.current = availableListLocal;
  }, [cityDataSource, getCitysTranslation]);

  const handleSettingButtonClick = useCallback(() => {
    if (availableList !== undefined && selectedList !== undefined) {
      if (availableList.length === 0) {
        getAvailableCitys();
      }
      let availableListtemp: ListItemDataSource[] = availableList;
      if (typeof selectedList.forEach === 'function') {
        selectedList.forEach((selectedItem, _index, _array) => {
          availableListtemp = availableListtemp.filter(
            (availableItem) => availableItem.value !== selectedItem.value,
          );
          setSelectedList([...selectedList]);
          setAvailableList([...availableListtemp]);
          setSelectedListBeforeSetting([...selectedList]);
          setAvailableListBeforeSetting([...availableListtemp]);
        });
      }
    }

    setOpen(true);
  }, [availableList, getAvailableCitys, selectedList]);

  const handleOnChangeSelectedItems = useCallback(
    (selectedListLocal: ListItemDataSource[]) => {
      // console.log(String().concat('selectedList count:', selectedListLocal.length.toString()));

      if (selectedListLocal !== undefined && availableList !== undefined) {
        selectedListRef.current = selectedListLocal;
        getAvailableCitys();
        if (typeof selectedListLocal.forEach === 'function') {
          let availableListtemp: ListItemDataSource[] = availableList;

          selectedListLocal.forEach((selectedItem, _index, _array) => {
            availableListtemp = availableListtemp.filter(
              (availableItem) => availableItem.value !== selectedItem.value,
            );
            setAvailableList([...availableListtemp]);
            // return null;
          });
        }
      }
    },
    [availableList, getAvailableCitys],
  );

  const handleOnColorChanged = useCallback(
    (newColorVaule: Color) => {
      const contentDetailLocal: WeatherContentDetail = {
        ...weatherContentInfo?.contentDetail,
        backgroundColor: newColorVaule.hex,
      };
      setWeatherContentInfo({ ...weatherContentInfo, contentDetail: contentDetailLocal });
    },
    [weatherContentInfo],
  );

  const handleOnChangeIndex = useCallback(
    (selectedIndex: number) => {
      setLayoutImgSelectedIndex(selectedIndex);
      if (resetViewerUI !== undefined && resetViewerUI) setResetViewerUI(false);

      const contentDetailLocal: WeatherContentDetail = {
        ...weatherContentInfo?.contentDetail,
        weatherStyleId:
          weatherLayoutDataSource !== undefined &&
          weatherLayoutDataSource.length > 0 &&
          selectedIndex > -1
            ? weatherLayoutDataSource[selectedIndex].key
            : '',
      };
      setWeatherContentInfo({ ...weatherContentInfo, contentDetail: contentDetailLocal });
      // console.log(String().concat('selectedIndex:', selectedIndex.toString()));
    },
    [resetViewerUI, weatherContentInfo, weatherLayoutDataSource],
  );

  const handleOnChangeType = useCallback(
    (contentType: string, selectedRectId: string) => {
      if (onChangeType !== undefined) onChangeType(contentType, selectedRectId);
    },
    [onChangeType],
  );

  const handleOnClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleBaseDialogClose = useCallback(() => {
    if (selectedListBeforeSetting !== undefined) setSelectedList([...selectedListBeforeSetting]);
    if (availableListBeforeSetting !== undefined) setAvailableList([...availableListBeforeSetting]);
    void handleOnClose();
  }, [availableListBeforeSetting, handleOnClose, selectedListBeforeSetting]);

  const handleBaseDialogOK = useCallback(() => {
    if (availableListRef !== undefined && selectedListRef !== undefined) {
      getAvailableCitys();

      setSelectedList(selectedListRef.current);

      const citysLocal: string[] = [];
      for (let i = 0; i < selectedListRef.current.length; i += 1) {
        citysLocal.push(selectedListRef.current[i].value);
      }
      const contentDetailLocal: WeatherContentDetail = {
        ...weatherContentInfo?.contentDetail,
        citys: citysLocal,
      };
      setWeatherContentInfo({ ...weatherContentInfo, contentDetail: contentDetailLocal });
      if (typeof selectedListRef.current.forEach === 'function') {
        let availableListtemp: ListItemDataSource[] = availableListRef.current;
        selectedListRef.current.forEach((selectedItem, _index, _array) => {
          availableListtemp = availableListtemp.filter(
            (availableItem) => availableItem.value !== selectedItem.value,
          );
          setAvailableList(availableListtemp);
        });
      }
    }
    // setOpen(false);
    void handleOnClose();
  }, [getAvailableCitys, handleOnClose, weatherContentInfo]);

  const ESignageTemplateContentImageComponent = useCallback(
    (indexLocal: number) => {
      const templateContentLocal: TemplateContent = { content: weatherContentInfo, rectId };

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
    [handleOnChangeType, rectId, weatherContentInfo],
  );

  const WeatherLayoutImageComponent = useCallback((indexLocal: number) => {
    switch (indexLocal) {
      case 0:
        return (
          <WeatherLayoutImage
            type={WeatherLayoutType.TYPE_1_640X360}
            size={WeatherLayoutSize.DEFAULT}
          />
        );
      case 1:
        return (
          <WeatherLayoutImage
            type={WeatherLayoutType.TYPE_2_640X360}
            size={WeatherLayoutSize.DEFAULT}
          />
        );
      case 2:
        return (
          <WeatherLayoutImage
            type={WeatherLayoutType.TYPE_3_640X360}
            size={WeatherLayoutSize.DEFAULT}
          />
        );
      default:
        return null;
    }
  }, []);

  useMemo(() => {
    if (isInit) {
      if (layoutImgSelectedIndex < 0) setLayoutImgSelectedIndex(0);
    }
  }, [isInit, layoutImgSelectedIndex]);

  useEffect(() => {
    if (isInit) {
      setIndex(templateIndex);
      setTitle(templateTitle || '');
      getAvailableCitys();
      if (cityDataSource !== undefined && cityDataSource.length > 0) {
        if (weatherContentInfo !== undefined) {
          if (
            weatherContentInfo.contentDetail.citys !== undefined &&
            weatherContentInfo.contentDetail.citys.length > 0
          ) {
            const selectedListLocal: ListItemDataSource[] = [];
            for (let i = 0; i < weatherContentInfo.contentDetail.citys.length; i += 1) {
              let citysLocal: CityOutput[] = [];
              citysLocal = cityDataSource.filter(
                (cityItem) => cityItem.id === weatherContentInfo.contentDetail.citys[i],
              );
              if (citysLocal !== undefined && citysLocal.length > 0) {
                selectedListLocal.push({
                  value: citysLocal[0].id,
                  text: getCitysTranslation(
                    String().concat(citysLocal[0].cityName, ' (', citysLocal[0].region, ')'),
                  ),
                  tag: citysLocal[0].region,
                });
              }
            }
            setSelectedList(selectedListLocal);
          }
        }
      }

      if (languageDataSource !== undefined && languageDataSource.length > 0) {
        if (
          weatherContent === undefined ||
          (weatherContentInfo !== undefined && weatherContentInfo?.contentDetail.languageId === '')
        ) {
          const contentDetailLocal: WeatherContentDetail = {
            ...weatherContentInfo?.contentDetail,
            languageId: languageDataSource[0].id,
          };
          setWeatherContentInfo({
            ...weatherContentInfo,
            contentDetail: contentDetailLocal,
          });
          setIsInit(false);
        }
      }
    }
  }, [
    cityDataSource,
    getAvailableCitys,
    getCitysTranslation,
    isInit,
    languageDataSource,
    t,
    templateIndex,
    templateTitle,
    weatherContent,
    weatherContentInfo,
  ]);

  useEffect(() => {
    if (onWeatherContentChanged !== undefined) onWeatherContentChanged(weatherContentInfo, rectId);
  }, [onWeatherContentChanged, rectId, weatherContentInfo]);

  useEffect(() => {
    if (weatherContentInfo !== undefined) setWeatherContentInfo(weatherContentInfo);
  }, [weatherContentInfo]);

  return (
    <I18nProvider>
      <div className={classes.root}>
        <Grid container item>
          <Grid xs={12} sm={4}>
            <Paper elevation={1} className={clsx(classes.kanbanBox)}>
              <Typography variant="subtitle2" gutterBottom>
                {title}
              </Typography>
              {index > -1 ? ESignageTemplateContentImageComponent(index) : <div />}
            </Paper>
          </Grid>
          <Grid xs={12} sm={4}>
            <Paper
              elevation={1}
              className={clsx(classes.paperPadding, classes.textFiledPaperPaddingBottom)}
            >
              <Paper
                elevation={1}
                className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
              >
                <TextField
                  required
                  id="contentName"
                  label={t('Content Name')}
                  value={weatherContentInfo?.contentCommon.contentName}
                  fullWidth
                  onChange={handleContentNameChanged}
                  error={weatherContentInfo && weatherContentInfo.contentCommon.contentName === ''}
                  helperText={
                    weatherContentInfo && weatherContentInfo.contentCommon.contentName === ''
                      ? t("Content name can't be empty.")
                      : ' '
                  }
                />
              </Paper>
              <FormControl fullWidth>
                <Paper
                  elevation={1}
                  className={clsx(
                    classes.paperPadding,
                    classes.textFieldMarginBottom,
                    classes.textLeft,
                  )}
                >
                  <TextField
                    select
                    required
                    fullWidth
                    id="teamperatureSelect"
                    value={weatherContentInfo && weatherContentInfo?.contentDetail.temperatureUnit}
                    label={t('Teamperature Unit')}
                    onChange={handleTeamperatureUnitChanged}
                  >
                    <MenuItem value="C">{t('Celsius (°C)')}</MenuItem>
                    <MenuItem value="F">{t('Fahrenheit (°F)')}</MenuItem>
                  </TextField>
                </Paper>
              </FormControl>
              <FormControl fullWidth>
                <Paper
                  elevation={1}
                  className={clsx(
                    classes.paperPadding,
                    classes.textFieldMarginBottom,
                    classes.textLeft,
                  )}
                >
                  <TextField
                    select
                    required
                    fullWidth
                    id="windSpeedSelect"
                    value={weatherContentInfo && weatherContentInfo?.contentDetail.windSpeedUnit}
                    label={t('Wind Speed Unit')}
                    onChange={handleWindSpeedUnitChanged}
                  >
                    <MenuItem value="K">{t('km/h')}</MenuItem>
                    <MenuItem value="M">{t('mp/h')}</MenuItem>
                  </TextField>
                </Paper>
              </FormControl>
              <FormControl fullWidth>
                <Paper
                  elevation={1}
                  className={clsx(
                    classes.paperPadding,
                    classes.textFieldMarginBottom,
                    classes.textLeft,
                  )}
                >
                  <TextField
                    select
                    required
                    fullWidth
                    id="languageSelect"
                    value={
                      weatherContentInfo && weatherContentInfo.contentDetail.languageId
                        ? weatherContentInfo.contentDetail.languageId.trim()
                        : '628c7b973722a78e25c70f38'
                    }
                    label={t('Language')}
                    onChange={handleLanguageChanged}
                  >
                    {languageDataSource &&
                      languageDataSource?.map((language: LanguageOutput) => (
                        <MenuItem key={language.id} value={language.id}>
                          {/* {t(`${language.languageName}`)} */}
                          {/* {t(`${language.languageName}` as const)} */}
                          {language.languageName === 'English' && t('English')}
                          {language.languageName === 'Traditional Chinese' &&
                            t('Traditional Chinese')}
                          {language.languageName === 'Japanese' && t('Japanese')}
                          {language.languageName === 'Simplified Chinese' &&
                            t('Simplified Chinese')}
                        </MenuItem>
                      ))}
                  </TextField>
                </Paper>
              </FormControl>
              <FormControl fullWidth>
                <Paper
                  elevation={1}
                  className={clsx(
                    classes.paperPadding,
                    classes.textFieldMarginBottom,
                    classes.textLeft,
                  )}
                >
                  <TextField
                    select
                    required
                    fullWidth
                    id="displaySelect"
                    value={
                      weatherContentInfo &&
                      weatherContentInfo.contentDetail.durations &&
                      weatherContentInfo.contentDetail.durations.toString()
                    }
                    label={t('Display Duration (sec)')}
                    onChange={handleDisplayDurationChanged}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={30}>30</MenuItem>
                    <MenuItem value={60}>60</MenuItem>
                    <MenuItem value={300}>300</MenuItem>
                    <MenuItem value={900}>900</MenuItem>
                    <MenuItem value={1800}>1800</MenuItem>
                    <MenuItem value={3600}>3600</MenuItem>
                  </TextField>
                </Paper>
              </FormControl>
              <Paper elevation={1} className={clsx(classes.paperPadding, classes.textLeft)}>
                <ColorPickerComponent
                  displayName={t('Background Color')}
                  selectedColor={
                    weatherContentInfo && weatherContentInfo.contentDetail.backgroundColor
                  }
                  onChangeColor={handleOnColorChanged}
                />
              </Paper>
            </Paper>
          </Grid>
          <Grid xs={12} sm={4}>
            <Paper>
              <Typography variant="subtitle2">{t('Weather Layout')} *</Typography>
              <Box mt={2} pl={2} pr={2}>
                <ImageViewer
                  resetUI
                  dataSource={weatherLayoutDataSource}
                  selectedIndex={layoutImgSelectedIndex}
                  RWDCtrlInfo={{ sm: 4, md: 4, lg: 4, width: 55, height: 55 }}
                  bindImageComponent={WeatherLayoutImageComponent}
                  onChangeIndex={handleOnChangeIndex}
                />
              </Box>
              <Box p={2}>
                <TransferList
                  customListBoxHeight={218}
                  availableListTitle={t('Available Citys')}
                  selectedListTitle={t('Selected Citys')}
                  displayAvailableList={displayAvailableList}
                  selectedListDataSource={selectedList}
                  canUpdateDataSource
                />
                <div className={classes.btnSettingBox}>
                  {displayAvailableList ? null : (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleSettingButtonClick}
                    >
                      {t('esignage:Setting')}
                    </Button>
                  )}
                </div>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </div>
      <BaseDialog
        open={open}
        onClose={handleOnClose}
        title={t('Select Citys')}
        content={
          <div className={classes.content}>
            <TransferList
              availableListTitle={t('Available Citys')}
              selectedListTitle={t('Selected Citys')}
              availableListDataSource={availableList}
              selectedListDataSource={selectedList}
              onChangeSelectedItems={handleOnChangeSelectedItems}
            />
            <div>
              <Button
                variant="contained"
                size="large"
                color="primary"
                onClick={handleBaseDialogClose}
                style={{ marginRight: 30 }}
              >
                {t('Close')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleBaseDialogOK}
                style={{ marginRight: 30 }}
              >
                {t('OK')}
              </Button>
            </div>
          </div>
        }
      />
    </I18nProvider>
  );
};

export default memo(WeatherContentInfo);
