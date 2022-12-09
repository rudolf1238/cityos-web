import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { ChangeHandler, RefCallBack, SubmitHandler, useForm } from 'react-hook-form';
import { FetchResult, useMutation, useQuery } from '@apollo/client';
import { KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers';
import { StorageKey, getItem, getValue } from 'city-os-common/libs/storage';
import { isString } from 'city-os-common/libs/validators';
import { makeStyles, styled } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import { useStore } from 'city-os-common/reducers';
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import Alert from '@material-ui/lab/Alert';
import BaseDialog from 'city-os-common/modules/BaseDialog';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/InputBase';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import PreviewIcon from '@mui/icons-material/Preview';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import ReducerActionType from 'city-os-common/reducers/actions';
import SearchIcon from '@material-ui/icons/Search';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import { ADD_AD, AddAdPayload, AddAdResponse } from '../api/addAd';
import { AddWifiAdInput, EditWifiAdInput, IAd } from '../libs/schema';
import { EDIT_AD, EditAdPayload, EditAdResponse } from '../api/editAd';
import { GET_AD_ON_WIFI, GetAdPayload, GetAdResponse } from '../api/getAdOnWifi';
import {
  SEARCH_AREAS_ON_WIFI,
  SearchAreasPayload,
  SearchAreasResponse,
} from '../api/searchAreasOnWifi';

import { PartialAdNode } from '../api/searchAdsOnWifi';
import uploadImg from '../api/uploadImg';
import useWifiTranslation from '../hooks/useWifiTranslation';

interface InputProps {
  adType: string;
  open: boolean;
  companyId: string;
  adId?: string | undefined;
  onClose: () => void;
}

interface AreaNode {
  id: string;
  name: string;
  isChecked: boolean;
}

const Input = styled('input')({
  display: 'none',
});
const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(4, 11),
    width: 900,
  },
  form: {
    // width: '80vw',
    // minWidth: 550,
    margin: 0,
    width: '100%',
  },

  ad: {
    display: 'flex',
    justifyContent: 'center',
  },

  button: {
    margin: 'auto',
    marginTop: theme.spacing(4.5),
  },

  basicInfo: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  toggle: {
    paddingTop: theme.spacing(0.5),
  },

  imgErr: {
    borderColor: `${theme.palette.error.main}`,
  },
  imgNullCenter: {
    display: 'flex',
    justifyContent: 'center',
    color: `${theme.palette.error.main}`,
  },

  imgcenter: {
    display: 'flex',
    justifyContent: 'center',
  },

  videocenter: {
    display: 'flex',
    margin: 'auto',
    align: 'center',
  },

  loading: {
    marginTop: theme.spacing(2),
    display: 'flex',
    // justifyContent: 'center',
    margin: 'auto',
  },

  uploadingCardIconBtn: {
    backgroundColor: 'unset',
    color: theme.palette.primary.main,
    border: 'unset',
    width: theme.spacing(5),
    height: theme.spacing(5),
    '&:hover': {
      backgroundColor: `${theme.palette.action.selected}80`,
      border: 'unset',
    },
    boxShadow: 'unset',
    float: 'right',
  },

  uploadingCardImage: {
    width: '70%',
    height: '70%',
    display: 'flex',
    borderRadius: theme.spacing(1),
    // boxShadow: `${theme.spacing(0, 0.125, 0.5, 0)} rgba(184, 197, 211, 0.25)`,
    paddingTop: theme.spacing(1),
    margin: 'auto',
  },

  box: {
    flexDirection: 'row',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    height: '300',
  },

  boxErr: {
    flexDirection: 'row',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    height: '300',
    borderColor: `${theme.palette.error.main}`,
  },
  search: {
    display: 'flex',
    paddingLeft: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: '100%',
  },

  tooltip: {
    display: 'flex',
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
  },
}));

const EditAdvertisement: FunctionComponent<InputProps> = ({
  adType,
  companyId,
  adId,
  open,
  onClose,
}: InputProps) => {
  const {
    reset,
    watch,
    handleSubmit,
    register,
    setValue,
    getValues,
    formState: { dirtyFields, isValid, errors },
  } = useForm<IAd>({
    defaultValues: {
      // data from parent form
      id: adId,
      name: '',
      company_name: '',
      company_vat: '',
      type: 1,
      pricing_type: 0,
      image: '',
      youtube_video_id: '',
      min_view_time: parseInt('', 10),
      weight: 0,
      click_qty: parseInt('', 10),
      cost_per_click: 0,
      daily_click_qty: parseInt('', 10),
      link_type: 0,
      url: null,
      copywriting: '',
      comment: '',
      start_datetime: undefined,
      end_datetime: undefined,
      start_timeslot: undefined,
      end_timeslot: undefined,
      area_list: [],
    },
    mode: 'onChange',
  });
  const { t } = useWifiTranslation(['wifi', 'common']);
  const classes = useStyles();
  const {
    dispatch,
    userProfile: { permissionGroup, divisionGroup },
  } = useStore();
  const [toggle, setToggle] = useState<boolean>(false);
  const [isPay, setisPay] = useState<boolean>(false);
  const [flag, setFlag] = useState<boolean>(adType === 'E');
  const [isImage, setisImage] = useState<boolean>(true);
  const [adImage, setAdImage] = useState<string>('');
  const refreshToken = getValue(getItem(StorageKey.ACCESS), isString);
  const authorization = `Bearer ${refreshToken || ''}`;
  const groupId = permissionGroup?.group.id;
  const [areaNodes, setAreaNodes] = useState<AreaNode[]>([]);
  const [noAreaCheck, setNoAreaCheck] = useState<boolean>(false);
  // const [existArea, setExistArea] = useState<number[]>([]);
  const router = useRouter();

  let imageRegist: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: ChangeHandler;
    ref?: RefCallBack;
    min?: string | number | undefined;
    max?: string | number | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    pattern?: string | undefined;
    required?: boolean | undefined;
    disabled?: boolean | undefined;
  };
  if (isImage) {
    imageRegist = register('image', { required: true });
  } else {
    imageRegist = register('image', { required: false });
  }
  const arealistRegist = register('area_list', { required: true });

  const isMountedRef = useIsMountedRef();
  const [addAd] = useMutation<AddAdResponse, AddAdPayload>(ADD_AD);
  const [editAd] = useMutation<EditAdResponse, EditAdPayload>(EDIT_AD);
  const [state, setState] = useState<boolean>(true);
  const [preview, setPreview] = useState<boolean>(false);
  const [editData, setEditData] = useState<PartialAdNode>(Object);
  const [selectedStartDate, handleStartDateChange] = useState<Date | null>(null);
  const [selectedEndDate, handleEndDateChange] = useState<Date | null>(null);
  const [selectedStartTimeSlot, handleStartTimeSlotChange] = useState<Date | null>(null);
  const [selectedEndTimeSlot, handleEndTimeSlotChange] = useState<Date | null>(null);

  const { refetch } = useQuery<SearchAreasResponse, SearchAreasPayload>(SEARCH_AREAS_ON_WIFI, {
    variables: {
      groupId: divisionGroup?.id || '',
      companyId,
      filter: {},
    },
    skip:
      !router.isReady ||
      !divisionGroup?.id ||
      !permissionGroup?.group.id ||
      !!(router.query.gid && router.query.gid !== divisionGroup.id),
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ getAreaList }) => {
      const areaNode: AreaNode[] = getAreaList.areas.map((area) => ({
        id: area.node.id,
        name: area.node.name,
        isChecked: false,
      }));
      // const areaIds = ['1234', '5648'];
      // for (const areaId of areaIds) {
      //   const node = areaNodes.find((areaNode) => areaNode.id == areaId);
      //   if (node) {
      //     node.isChecked = true;
      //   }
      // }
      setAreaNodes(areaNode);
      if (!getAreaList || (getAreaList && getAreaList.areas.length === 0)) {
        setNoAreaCheck(true);
      }
      // getAreaList.areas.map(({ node }) => {
      //   setMyMap(myMap.set(node.id, false));
      // });
    },
  });

  // if (noArea) {
  //   const compayIdArr: number[] = [];
  //   compayIdArr.push(parseInt(companyId, 10));
  //   setValue('area_list', compayIdArr, {
  //     shouldDirty: true,
  //   });
  // }

  useQuery<GetAdResponse, GetAdPayload>(GET_AD_ON_WIFI, {
    variables: {
      groupId: permissionGroup?.group.id,
      companyId,
      id: adId || '',
    },
    skip: !adId,
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ getAd }) => {
      const ad = getAd.node;

      const areadata = areaNodes.map((node) => {
        const result = { ...node };
        if (ad.area_list.toString().indexOf(companyId) >= 0) {
          result.isChecked = true;
        } else if (ad.area_list.toString().indexOf(node.id) >= 0) {
          result.isChecked = true;
        }
        return result;
      });

      const areaCheck: number[] = [];
      areadata.forEach((area) => {
        if (area.isChecked === true) areaCheck.push(parseInt(area.id, 10));
      });

      reset({
        id: ad.id,
        name: ad.name,
        company_name: ad.company_name,
        company_vat: ad.company_vat,
        type: ad.type,
        pricing_type: ad.pricing_type,
        image: ad.image,
        youtube_video_id: ad.youtube_video_id,
        min_view_time: ad.min_view_time,
        weight: ad.weight,
        click_qty: ad.pricing_type !== 0 ? ad.click_qty : parseInt('', 10),
        cost_per_click: ad.cost_per_click,
        daily_click_qty: ad.pricing_type !== 0 ? ad.daily_click_qty : parseInt('', 10),
        link_type: ad.link_type,
        url: ad.url,
        copywriting: ad.copywriting,
        comment: ad.comment,
        // area_list: ad.area_list,
        // area_list: areaCheck.sort(),
        area_list:
          ad.area_list.length === 1 && ad.area_list[0].toString() === companyId
            ? ad.area_list
            : Object.values(
                areadata
                  .filter((area) => area.isChecked === true)
                  .map((item) => parseInt(item.id, 10)),
              ).sort(),
        start_datetime: ad.start_datetime,
        end_datetime: ad.end_datetime,
        start_timeslot: ad.start_timeslot,
        end_timeslot: ad.end_timeslot,
      });
      if (ad.image) {
        setAdImage(ad.image);
      }
      if (ad.url) {
        setToggle(true);
      }
      if (ad.type === 4) {
        setisImage(false);
      }
      if (ad.pricing_type === 1) {
        setisPay(true);
      }
      if (ad.pricing_type === 0) {
        setisPay(false);
      }
      setEditData(getAd.node);
      const today = new Date();
      setAreaNodes(areadata);
      // setExistArea(areaCheck);
      handleStartDateChange(new Date(ad.start_datetime));
      handleEndDateChange(new Date(ad.end_datetime));
      handleStartTimeSlotChange(new Date(`${today.toLocaleDateString()} ${ad.start_timeslot}`));
      handleEndTimeSlotChange(new Date(`${today.toLocaleDateString()} ${ad.end_timeslot}`));

      if (getValues('area_list').length === 0 && noAreaCheck) {
        const compayIdArr: number[] = [];
        compayIdArr.push(parseInt(companyId, 10));
        setValue('area_list', compayIdArr, {
          shouldDirty: true,
        });
      }
    },
  });

  const handleOnClose = useCallback(() => {
    // reset();
    onClose();
  }, [onClose]);

  const handleChangeIsPayAd = (event: React.ChangeEvent<HTMLInputElement>) => {
    setisPay(event.target.value === '1');
    setValue('pricing_type', parseInt(event.target.value, 10), {
      shouldDirty: true,
      shouldValidate: true,
    });
    // if (event.target.value === '0' && adType === 'E') {
    //   resetFi({
    //     click_qty: editData.pricing_type !== 0 ? editData.click_qty : parseInt('', 10),
    //     daily_click_qty: editData.pricing_type !== 0 ? editData.daily_click_qty : parseInt('', 10),
    //   });
    // }
  };

  const handleChangeAdType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setisImage(event.target.value === '1');
    setValue('type', parseInt(event.target.value, 10), {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (event.target.value === '1') {
      setValue('youtube_video_id', editData.youtube_video_id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (event.target.value !== '1') {
      setValue('image', editData.image, {
        shouldDirty: true,
        shouldValidate: true,
      });

      setAdImage(editData.image);
    }
  };

  const handleChangeWeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('weight', parseInt(event.target.value, 10), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSwitchChange = useCallback(
    (to: boolean) => {
      if (to) {
        setValue('link_type', 0, { shouldDirty: true });
      } else {
        setValue('link_type', 1, { shouldDirty: true });
      }
      setToggle(!to);
    },
    [setValue],
  );

  const handleClearImg = useCallback(() => {
    setAdImage('');
    setValue('image', '', { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  const handleEditAd = useCallback(
    ({
      id,
      name,
      company_name,
      company_vat,
      type,
      pricing_type,
      image,
      youtube_video_id,
      min_view_time,
      weight,
      click_qty,
      click_count,
      cost_per_click,
      placement_count,
      costs,
      daily_click_qty,
      link_type,
      url,
      copywriting,
      comment,
      start_datetime,
      end_datetime,
      start_timeslot,
      end_timeslot,
      area_list,
    }: IAd): Promise<FetchResult<EditAdResponse> | void> => {
      if (!id && !companyId) return Promise.resolve();
      const addAddData: AddWifiAdInput = {
        name,
        company_name,
        company_vat,
        type,
        pricing_type,
        image: image && image.trim().length === 0 ? null : image,
        youtube_video_id,
        min_view_time: parseInt(min_view_time.toString(), 10),
        weight,
        click_qty: parseInt(click_qty.toString(), 10),
        click_count,
        cost_per_click: parseInt(cost_per_click.toString(), 10),
        placement_count,
        costs,
        daily_click_qty: parseInt(daily_click_qty.toString(), 10),
        link_type,
        url,
        copywriting,
        comment,
        start_datetime,
        end_datetime,
        start_timeslot,
        end_timeslot,
        area_list,
      };
      const editAddData: EditWifiAdInput = {
        id,
        editWifiAdInput: addAddData,
      };
      return editAd({
        variables: {
          groupId: permissionGroup?.group.id || '',
          companyId,
          wifiAdInput: editAddData,
        },
      });
    },
    [companyId, editAd, permissionGroup?.group.id],
  );

  const handleAddAd = useCallback(
    ({
      id,
      name,
      company_name,
      company_vat,
      type,
      pricing_type,
      image,
      youtube_video_id,
      min_view_time,
      weight,
      click_qty,
      click_count,
      cost_per_click,
      placement_count,
      costs,
      daily_click_qty,
      link_type,
      url,
      copywriting,
      comment,
      start_datetime,
      end_datetime,
      start_timeslot,
      end_timeslot,
      area_list,
    }: IAd): Promise<FetchResult<AddAdResponse> | void> => {
      if (!id && !companyId) return Promise.resolve();
      const addAddData: AddWifiAdInput = {
        name,
        company_name,
        company_vat,
        type,
        pricing_type,
        image: image && image.trim().length === 0 ? null : image,
        youtube_video_id,
        min_view_time: parseInt(min_view_time.toString(), 10),
        weight,
        click_qty: parseInt(click_qty.toString(), 10),
        click_count,
        cost_per_click: parseInt(cost_per_click.toString(), 10),
        placement_count,
        costs,
        daily_click_qty: parseInt(daily_click_qty.toString(), 10),
        link_type,
        url,
        copywriting,
        comment,
        start_datetime,
        end_datetime,
        start_timeslot,
        end_timeslot,
        area_list,
      };
      return addAd({
        variables: {
          groupId: permissionGroup?.group.id || '',
          companyId,
          wifiAdInput: addAddData,
        },
      });
    },
    [addAd, companyId, permissionGroup?.group.id],
  );

  const handleOnChangeImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files != null) {
      if (event.currentTarget.files.length > 0) {
        const file = event.currentTarget.files[0];
        if (
          !file.type.includes('image/jpg') &&
          !file.type.includes('image/jpeg') &&
          !file.type.includes('image/png') &&
          !file.type.includes('image/gif') &&
          !file.type.includes('image/JPG') &&
          !file.type.includes('image/JPEG') &&
          !file.type.includes('image/PNG') &&
          !file.type.includes('image/GIF') &&
          !file.type.includes('image/gif')
        ) {
          // event.target.value = '';
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'warning',
              message: t(
                'wifi:Image Type is error. Only image files are allowed! (ex: *.jpg, *png, and *gif)',
              ),
            },
          });
          return;
        }

        const upload = await uploadImg({ file, authorization, groupId });
        if (!upload) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'warning',
              message: t('wifi:Upload File Fail'),
            },
          });
        } else {
          setValue('image', upload, { shouldDirty: true, shouldValidate: true });
          setAdImage(URL.createObjectURL(file));
        }
      }
    }
  };

  const hideSpinner = useCallback(() => {
    setState(false);
  }, []);

  const handlePreview = useCallback(() => {
    setPreview(true);
    setState(true);
  }, []);

  useMemo(() => {
    if (noAreaCheck) {
      const compayIdArr: number[] = [];
      compayIdArr.push(parseInt(companyId, 10));
      setValue('area_list', compayIdArr, {
        shouldDirty: true,
      });
      // setNoAreaCheck(false);
    }
  }, [companyId, noAreaCheck, setValue]);

  const onSubmit = useCallback<SubmitHandler<IAd>>(
    async (currentData: IAd) => {
      console.log(currentData);
      let isSaveSuccess = false;
      if (adType === 'E' && !currentData.id) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('common:Save failed_ Please try again_'),
          },
        });
      } else {
        if (adType === 'E') {
          const updateResult = await Promise.allSettled([handleEditAd(currentData)]);

          const rejectedResults = updateResult.filter((res) => res.status === 'rejected');

          if (rejectedResults.length === 0) {
            isSaveSuccess = true;
          } else {
            if (D_DEBUG) console.log(rejectedResults);
            isSaveSuccess = false;
          }
          if (isMountedRef.current) onClose();
        } else {
          const updateResult = await Promise.allSettled([handleAddAd(currentData)]);
          const rejectedResults = updateResult.filter((res) => res.status === 'rejected');
          if (rejectedResults.length === 0) {
            isSaveSuccess = true;
          } else {
            if (D_DEBUG) console.log(rejectedResults);
            isSaveSuccess = false;
          }
          if (isMountedRef.current) onClose();
        }
        if (isSaveSuccess) {
          // await refetch();
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('wifi:The value has been saved successfully_', {
                count: 0, // always show plural here
              }),
            },
          });
          reset();
          setValue('type', 1, {
            shouldDirty: true,
          });
          setFlag(adType === 'E');
          setisImage(true);
          setAdImage('');
          setisPay(false);
          setToggle(false);
          // setAreaNodes(areaData);
          void refetch();
          handleStartDateChange(null);
          handleEndDateChange(null);
          handleStartTimeSlotChange(null);
          handleEndTimeSlotChange(null);
        } else {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('common:Save failed_ Please try again_'),
            },
          });
        }
      }
      if (isMountedRef.current) onClose();
    },
    [
      adType,
      dispatch,
      handleAddAd,
      handleEditAd,
      isMountedRef,
      onClose,
      refetch,
      reset,
      setValue,
      t,
    ],
  );

  const requireFieldEmpty = t('wifi:This field cannot allow empty.');
  const costPerClickError = t('wifi:the value must grater then 0');
  const dailyClickError = t('wifi:Daily Click Limit value must less than Click Limit value');
  const endTimeslotError = t('wifi:end_timeslot cannot less than start_timeslot');
  const startTimeslotError = t('wifi:start_timeslot cannot grater then end_timeslot');
  const [keyword, setKeyword] = useState<string>('');
  const handleChange7 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const getIndeterminate = () => {
    for (let i = 1; i < areaNodes.length; i += 1) {
      if (areaNodes[i - 1].isChecked !== areaNodes[i].isChecked) {
        return true;
      }
    }
    return false;
  };

  const getAllCheck = () => {
    return areaNodes.reduce((acc, cur) => {
      return acc && cur.isChecked;
    }, true);
  };

  // const handleAllArea = () => {
  //   setValue('area_list', [parseInt(companyId, 10)], { shouldDirty: true, shouldValidate: true });
  // };

  const handleOnChangeAreaList = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setFlag(true);
    const result = areaNodes.map((areaNode) => ({ ...areaNode, isChecked }));
    setAreaNodes([...result]);
  };

  // useEffect(() => {
  //   if (areaNodes) {
  //     const areas: number[] = [];

  //     if (areaNodes.every((node) => node.isChecked === true)) {
  //       areas.push(parseInt(companyId, 10));
  //     } else {
  //       areaNodes.forEach((areaNode) => {
  //         if (areaNode.isChecked === true) {
  //           areas.push(parseInt(areaNode.id, 10));
  //         }
  //       });
  //     }
  //     // if (flag) {
  //     setValue('area_list', areas, {
  //       shouldValidate: true,
  //       // shouldDirty: true,
  //     });
  //     //  }
  //   }
  // }, [areaNodes, companyId, setValue]);

  useEffect(() => {
    void refetch();
  }, [open, refetch]);

  useEffect(() => {
    setFlag(adType === 'E');
  }, [adType]);

  const handleClearPreview = useCallback(() => {
    setPreview(false);
    setValue('youtube_video_id', '', { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  return (
    <div>
      {((watch('name') && watch('area_list') && adType === 'E') || adType === 'A') && (
        <div>
          <BaseDialog
            open={open}
            onClose={handleOnClose}
            title={adType === 'E' ? t('wifi:Edit Ad Information') : t('wifi:Add Ad Information')}
            titleAlign="center"
            titleVariant="h4"
            classes={{ dialog: classes.paper }}
            content={
              <Grid container spacing={2} className={classes.form} component="form">
                <Grid item xs={6}>
                  <Card variant="outlined" className={classes.ad}>
                    <RadioGroup
                      row
                      value={isPay ? '1' : '0'}
                      // defaultValue={watch('pricing_type') === 1 ? '1' : '0'}
                      onChange={handleChangeIsPayAd}
                    >
                      <FormControlLabel
                        value="0"
                        control={<Radio />}
                        label={t('wifi:Free Advertising')}
                      />
                      <FormControlLabel
                        value="1"
                        control={<Radio />}
                        label={t('wifi:Paid Advertising')}
                      />
                    </RadioGroup>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" className={classes.ad}>
                    <RadioGroup row value={isImage ? '1' : '4'} onChange={handleChangeAdType}>
                      <FormControlLabel value="1" control={<Radio />} label={t('wifi:Image Ad')} />
                      <FormControlLabel
                        value="4"
                        control={<Radio />}
                        label={t('wifi:Youtube Ad')}
                      />
                    </RadioGroup>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    variant="outlined"
                    type="text"
                    label={t('wifi:Advertisement Name')}
                    value={watch('name') || ''}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      ...register('name', {
                        maxLength: {
                          value: 255,
                          message: t('common:Max_ {{count}} character', { count: 255 }),
                        },
                        validate: (value) => value.trim().length > 0,
                        required: requireFieldEmpty,
                      }),
                    }}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    variant="outlined"
                    type="text"
                    label={t('wifi:Company Name')}
                    value={watch('company_name') || ''}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      ...register('company_name', {
                        maxLength: {
                          value: 255,
                          message: t('common:Max_ {{count}} character', { count: 255 }),
                        },
                        validate: (value) => value.trim().length > 0,
                        required: requireFieldEmpty,
                      }),
                    }}
                    error={!!errors.company_name}
                    helperText={errors.company_name?.message}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    variant="outlined"
                    type="text"
                    label={t('wifi:Company Vat Number')}
                    value={watch('company_vat') || ''}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      ...register('company_vat', {
                        maxLength: {
                          value: 8,
                          message: t('wifi:Company Vat Number must be {{count}} characters long', {
                            count: 8,
                          }),
                        },
                        minLength: {
                          value: 8,
                          message: t('wifi:Company Vat Number must be {{count}} characters long', {
                            count: 8,
                          }),
                        },
                        validate: (value) => value.trim().length > 0,
                        required: requireFieldEmpty,
                      }),
                    }}
                    error={!!errors.company_vat}
                    helperText={errors.company_vat?.message}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    variant="outlined"
                    type="number"
                    label={t('wifi:Minimum Views(Seconds)')}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={watch('min_view_time')}
                    inputProps={{
                      ...register('min_view_time', {
                        maxLength: {
                          value: 125,
                          message: t('common:Max_ {{count}} character', { count: 125 }),
                        },
                        required: requireFieldEmpty,
                        min: 1,
                        validate: (value) => value.toString().trim().length > 0,
                      }),
                    }}
                    error={!!errors.min_view_time}
                    helperText={errors.min_view_time?.message}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={watch('weight')}
                    select
                    InputLabelProps={{ shrink: true }}
                    label={t('wifi:Weight')}
                    onChange={handleChangeWeight}
                    // helperText="Please select your currency"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {isPay && (
                  <>
                    <Grid item xs={3}>
                      <TextField
                        variant="outlined"
                        type="number"
                        label={t('wifi:Click Limit')}
                        value={watch('click_qty')}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          ...register('click_qty', {
                            maxLength: {
                              value: 125,
                              message: t('common:Max_ {{count}} character', { count: 125 }),
                            },
                            required: requireFieldEmpty,
                            min: 1,
                            validate: (value) => value.toString() !== 'NaN',
                          }),
                        }}
                        error={!!errors.click_qty}
                        helperText={errors.click_qty?.message}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        variant="outlined"
                        type="number"
                        label={t('wifi:Daily Click Limit')}
                        value={watch('daily_click_qty')}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          ...register('daily_click_qty', {
                            maxLength: {
                              value: 125,
                              message: t('common:Max_ {{count}} character', { count: 125 }),
                            },
                            required: requireFieldEmpty,
                            min: 1,
                            max: watch('click_qty'),
                            validate: (value) => value.toString() !== 'NaN',
                          }),

                          // validate: (value: string) => parseInt(value, 10) < 2,
                        }}
                        error={!!errors.daily_click_qty}
                        // helperText={errors.daily_click_qty?.message}
                        helperText={
                          errors.daily_click_qty?.type === 'max'
                            ? dailyClickError
                            : errors.daily_click_qty?.message
                        }
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={6}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    placeholder={t('wifi:Is direct link url?')}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <section className={classes.basicInfo}>
                          <Switch
                            color="primary"
                            checked={toggle}
                            onChange={() => {
                              handleSwitchChange(toggle);
                            }}
                            name="checked"
                          />
                          <span className={classes.toggle}>
                            {toggle ? t('wifi:Yes') : t('wifi:No')}
                          </span>
                        </section>
                      ),
                    }}
                  />
                </Grid>
                {toggle && (
                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      type="text"
                      label={t('wifi:Url')}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={watch('url') || null}
                      inputProps={{
                        ...register('url', {
                          maxLength: {
                            value: 255,
                            message: t('common:Max_ {{count}} character', { count: 255 }),
                          },
                          pattern: {
                            value:
                              // eslint-disable-next-line no-useless-escape
                              /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                            message: t('Invalid URL format'),
                          },
                          required: requireFieldEmpty,
                        }),
                      }}
                      error={!!errors.url}
                      helperText={errors.url?.message}
                    />
                  </Grid>
                )}
                {isPay && (
                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      label={t('wifi:Cost per Click')}
                      type="number"
                      InputProps={{
                        ...register('cost_per_click', {
                          maxLength: {
                            value: 255,
                            message: t('common:Max_ {{count}} character', { count: 255 }),
                          },
                          required: requireFieldEmpty,
                          min: 0,
                        }),

                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      error={!!errors.cost_per_click}
                      helperText={
                        errors.cost_per_click?.type === 'min'
                          ? costPerClickError
                          : errors.cost_per_click?.message
                      }
                    />
                    {/* <TextField
                variant="outlined"
                type="number"
                label={t('wifi:Cost per Click')}
                value={watch('cost_per_click')}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  ...register('cost_per_click', {
                    maxLength: {
                      value: 255,
                      message: t('common:Max_ {{count}} character', { count: 255 }),
                    },
                    required: requireFieldEmpty,
                  }),
                  // startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  min: 1,
                }}
                error={!!errors.cost_per_click}
                helperText={errors.cost_per_click?.message}
              /> */}
                  </Grid>
                )}
                {isImage ? (
                  <Grid item xs={12}>
                    <Card
                      variant="outlined"
                      className={
                        errors.image && errors.image.type === 'required' ? classes.imgErr : ''
                      }
                    >
                      <Button
                        color="primary"
                        aria-label="upload picture"
                        component="label"
                        endIcon={<AddPhotoAlternateIcon />}
                        className={
                          errors.image && errors.image.type === 'required'
                            ? classes.imgNullCenter
                            : classes.imgcenter
                        }
                      >
                        {t('wifi:Upload Ad Image')}
                        <Input
                          id="Image"
                          accept="image/gif, image/jpeg, image/png"
                          type="file"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            imageRegist.onChange(e); // method from hook form register
                            void handleOnChangeImage(e); // your method
                            e.target.value = '';
                          }}
                          hidden={false}
                          // {...register('image', {
                          //   onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          //     handleOnChangeImage(e);
                          //   },
                          //   required: true,
                          // })}
                        />
                      </Button>

                      <Divider
                        orientation="horizontal"
                        className={
                          errors.image && errors.image.type === 'required' ? classes.imgErr : ''
                        }
                      />
                      {adImage && (
                        <ThemeIconButton
                          aria-label="deleteImage"
                          classes={{
                            root: classes.uploadingCardIconBtn,
                          }}
                          onClick={handleClearImg}
                        >
                          <HighlightOffIcon />
                        </ThemeIconButton>
                      )}
                      {adImage && (
                        <img src={adImage} alt="" className={classes.uploadingCardImage} />
                      )}
                      {/* {logoRequired && (
                <p className={classes.imgNullCenter}> {t('wifi:Please select the logo image')}</p>
              )} */}
                    </Card>
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        label={t('wifi:Youtube Id')}
                        type="text"
                        variant="outlined"
                        value={watch('youtube_video_id') || ''}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          readOnly: preview,
                          ...register('youtube_video_id', {
                            maxLength: {
                              value: 255,
                              message: t('common:Max_ {{count}} character', { count: 255 }),
                            },
                            required: requireFieldEmpty,
                          }),
                          endAdornment: (
                            <div>
                              {preview && watch('youtube_video_id') && (
                                <ThemeIconButton
                                  tooltip={t('wifi:close')}
                                  aria-label="deletepreview"
                                  classes={{
                                    root: classes.uploadingCardIconBtn,
                                  }}
                                  // onClick={handleClearFile}
                                  onClick={() => {
                                    handleClearPreview();
                                  }}
                                >
                                  <HighlightOffIcon />
                                </ThemeIconButton>
                              )}
                              {!preview && watch('youtube_video_id') && (
                                <Tooltip
                                  title={t('wifi:preview') as React.ReactChild}
                                  classes={{
                                    tooltipPlacementBottom: classes.tooltip,
                                    tooltipPlacementTop: classes.tooltip,
                                  }}
                                >
                                  <Button onClick={handlePreview}>
                                    <PreviewIcon fontSize="large" />
                                  </Button>
                                </Tooltip>
                              )}
                            </div>
                          ),
                        }}
                        error={!!errors.youtube_video_id}
                        helperText={errors.youtube_video_id?.message}
                      />
                      {preview && (
                        <Grid item xs={12}>
                          <Card variant="outlined">
                            {state ? <CircularProgress className={classes.loading} /> : null}

                            <iframe
                              className={classes.videocenter}
                              height="155"
                              src={`https://www.youtube.com/embed/${watch('youtube_video_id')}`}
                              title="YouTube video player"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              onLoad={hideSpinner}
                              frameBorder="0"
                            />
                          </Card>
                        </Grid>
                      )}
                    </Grid>

                    {/* <Grid item xs={12}>
                      <TextField
                        label={t('wifi:Youtube Id')}
                        type="text"
                        variant="outlined"
                        value={watch('youtube_video_id') || ''}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          ...register('youtube_video_id', {
                            maxLength: {
                              value: 255,
                              message: t('common:Max_ {{count}} character', { count: 255 }),
                            },
                            required: requireFieldEmpty,
                          }),
                          endAdornment: (
                            <Tooltip
                              title="preview"
                              classes={{
                                tooltipPlacementBottom: classes.tooltip,
                                tooltipPlacementTop: classes.tooltip,
                              }}
                            >
                              <Link
                                href={`https://www.youtube.com/embed/${watch('youtube_video_id')}`}
                                target="_blank"
                              >
                                <PreviewIcon fontSize="large" />
                              </Link>
                            </Tooltip>
                          ),
                        }}
                        error={!!errors.youtube_video_id}
                        helperText={errors.youtube_video_id?.message}
                      />
                    </Grid> */}
                  </>
                )}

                <Grid item xs={6}>
                  <KeyboardDatePicker
                    // showTodayButton
                    fullWidth
                    label={t('wifi:Service Start Date')}
                    inputVariant="outlined"
                    InputLabelProps={{ shrink: true }}
                    maxDate={selectedEndDate}
                    // shouldDisableDate={(date) => date.getHours() < 6}
                    value={selectedStartDate || null}
                    onChange={(date: Date | null, value) => {
                      handleStartDateChange(date);
                      setValue('start_datetime', value || '', {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    defaultValue=""
                    inputProps={{
                      readOnly: true,
                      ...register('start_datetime', {
                        required: requireFieldEmpty,
                      }),
                    }}
                    format="yyyy-MM-dd"
                    error={!!errors.start_datetime}
                    helperText={errors.start_datetime?.message}
                  />
                </Grid>
                <Grid item xs={6}>
                  <KeyboardDatePicker
                    // showTodayButton
                    fullWidth
                    label={t('wifi:Service End Date')}
                    inputVariant="outlined"
                    InputLabelProps={{ shrink: true }}
                    minDate={selectedStartDate}
                    value={selectedEndDate || null}
                    onChange={(date: Date | null, value) => {
                      handleEndDateChange(date);
                      setValue('end_datetime', value || '', {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    defaultValue=""
                    inputProps={{
                      readOnly: true,
                      ...register('end_datetime', {
                        required: requireFieldEmpty,
                      }),
                    }}
                    format="yyyy-MM-dd"
                    error={!!errors.end_datetime}
                    helperText={errors.end_datetime?.message}
                  />
                </Grid>

                <Grid item xs={6}>
                  <KeyboardTimePicker
                    fullWidth
                    label={t('wifi:Start Time Slot')}
                    format="HH:mm"
                    // mask="__:__ _M"
                    value={selectedStartTimeSlot || null}
                    onChange={(date: Date | null, value) => {
                      handleStartTimeSlotChange(date);
                      setValue('start_timeslot', `${value || ''}:00` || '', {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    inputVariant="outlined"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      readOnly: true,
                      ...register('start_timeslot', {
                        required: requireFieldEmpty,
                        validate: (value) => {
                          if (selectedEndTimeSlot && value) {
                            const [hour, min] = value.split(':');
                            const v = parseInt(hour, 10) * 60 + parseInt(min, 10);
                            const hour1 = selectedEndTimeSlot.getHours();
                            const min1 = selectedEndTimeSlot.getMinutes();
                            const v2 = hour1 * 60 + min1;
                            return v < v2;
                          }
                          return true;
                        },
                      }),
                    }}
                    error={!!errors.start_timeslot}
                    helperText={
                      errors.start_timeslot?.type === 'validate'
                        ? startTimeslotError
                        : errors.start_timeslot?.message
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <KeyboardTimePicker
                    format="HH:mm"
                    fullWidth
                    label={t('wifi:End Time Slot')}
                    value={selectedEndTimeSlot || null}
                    onChange={(date: Date | null, value) => {
                      handleEndTimeSlotChange(date);
                      setValue('end_timeslot', `${value || ''}:59` || '', {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    inputVariant="outlined"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      readOnly: true,
                      ...register('end_timeslot', {
                        required: requireFieldEmpty,
                        validate: (value) => {
                          if (selectedStartTimeSlot && value) {
                            const [hour, min] = value.split(':');
                            const v = parseInt(hour, 10) * 60 + parseInt(min, 10);
                            const hour1 = selectedStartTimeSlot.getHours();
                            const min1 = selectedStartTimeSlot.getMinutes();
                            const v2 = hour1 * 60 + min1;
                            return v > v2;
                          }
                          return true;
                        },
                      }),
                    }}
                    error={!!errors.end_timeslot}
                    helperText={
                      errors.end_timeslot?.type === 'validate'
                        ? endTimeslotError
                        : errors.end_timeslot?.message
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  {areaNodes && areaNodes.length > 0 ? (
                    <div>
                      <Card
                        variant="outlined"
                        className={
                          flag && areaNodes.filter((area) => area.isChecked === true).length === 0
                            ? // errors.area_list !== undefined
                              // errors.area_list[0] &&
                              // errors.area_list[0].type
                              // errors.area_list[0] &&
                              // errors.area_list.map((area) => {
                              //   return area.type === 'required';
                              // }).length > 0
                              classes.boxErr
                            : classes.box
                        }
                      >
                        <Typography variant="h6" align="center">
                          {t('wifi:Please select areas to play the Ad')}
                          <Divider orientation="horizontal" />
                        </Typography>
                        <Paper className={classes.search} variant="outlined">
                          <InputBase
                            fullWidth
                            placeholder={t('wifi:Search')}
                            inputProps={{ 'aria-label': 'search' }}
                            onChange={handleChange7}
                          />
                          <IconButton aria-label="search">
                            <SearchIcon />
                          </IconButton>
                        </Paper>

                        {/* <div></div> */}

                        {/* <div>
                          <TextField
                            variant="standard"
                            placeholder={t('wifi:Please select areas to play the ad.')}
                          />
                        </div> */}

                        <FormControlLabel
                          label={t('wifi:All Area')}
                          control={
                            <Checkbox
                              // checked={areaNodes.reduce((acc, cur) => {
                              //   return acc && cur.isChecked;
                              // }, true)}
                              // key={companyId}
                              checked={getAllCheck()}
                              indeterminate={getIndeterminate()}
                              // onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                              //   const isChecked = event.target.checked;
                              //   const result = areaNodes.map((areaNode) => ({ ...areaNode, isChecked }));
                              //   setAreaNodes([...result]);
                              // }}
                              // onChange={handleOnChangeAreaList}
                              onChange={(event, checked) => {
                                handleOnChangeAreaList(event);
                                const checkKey: number[] = [];
                                checkKey.push(parseInt(companyId, 10));
                                // void arealistRegist.onChange(event);
                                if (checked) {
                                  setValue('area_list', checkKey, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                } else {
                                  setValue('area_list', [], {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                }
                              }}
                            />
                          }
                        />

                        <Card>
                          {areaNodes.map(
                            (areaNode) =>
                              areaNode.name.match(keyword) && (
                                <FormControlLabel
                                  label={areaNode.name}
                                  control={
                                    <Checkbox
                                      key={areaNode.id}
                                      checked={areaNode.isChecked}
                                      onChange={(event, checked) => {
                                        setFlag(true);
                                        void arealistRegist.onChange(event);
                                        const i = areaNodes.findIndex(
                                          (node) => node.id === areaNode.id,
                                        );
                                        if (i !== -1) {
                                          let area = getValues('area_list');
                                          if (
                                            area.length === 1 &&
                                            area[0].toString() === companyId
                                          ) {
                                            area = Object.values(
                                              areaNodes
                                                .filter((node) => node.isChecked === true)
                                                .map((item) => parseInt(item.id, 10)),
                                            ).sort();
                                          }
                                          areaNodes[i].isChecked = checked;
                                          setAreaNodes([...areaNodes]);
                                          if (checked) {
                                            area.push(parseInt(areaNode.id, 10));
                                          } else {
                                            area = area.filter(
                                              (a) => a !== parseInt(areaNode.id, 10),
                                            );
                                          }

                                          if (area.length === areaNodes.length) {
                                            const allArea: number[] = [];
                                            allArea.push(parseInt(companyId, 10));
                                            area = allArea;
                                          }
                                          setValue('area_list', area, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          });
                                        }
                                        // handleOnChange(parseInt(areaNode.id), myMap.get(node.id))
                                      }}
                                    />
                                  }
                                />
                              ),
                          )}
                        </Card>
                      </Card>
                    </div>
                  ) : (
                    // <FormControlLabel
                    //   value="start"
                    //   control={<Checkbox checked onChange={handleAllArea} />}
                    //   label="Start"
                    //   labelPlacement="start"
                    // />

                    <Alert
                      variant="outlined"
                      iconMapping={{
                        success: <CheckCircleOutlineIcon fontSize="inherit" />,
                      }}
                    >
                      Play in all areas
                    </Alert>
                  )}
                </Grid>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={Object.keys(dirtyFields).length === 0 || !isValid}
                  className={classes.button}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={handleSubmit(onSubmit)}
                >
                  {t('wifi:Save')}
                </Button>
              </Grid>
            }
          />
        </div>
      )}
    </div>
  );
};
export default EditAdvertisement;
