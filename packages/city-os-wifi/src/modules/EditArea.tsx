import { KeyboardDatePicker } from '@material-ui/pickers';

import { FetchResult, useMutation, useQuery } from '@apollo/client';
import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useStore } from 'city-os-common/reducers';
import BaseDialog from 'city-os-common/modules/BaseDialog';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import React, { FunctionComponent, useCallback, useState } from 'react';
import ReducerActionType from 'city-os-common/reducers/actions';
import TextField from '@material-ui/core/TextField';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import { ADD_AREA, AddAreaPayload, AddAreaResponse } from '../api/addArea';
import { EDIT_AREA, EditAreaPayload, EditAreaResponse } from '../api/editArea';
import { GET_AREA_ON_WIFI, GetAreaPayload, GetAreaResponse } from '../api/getAreaOnWifi';
import { IArea } from '../libs/schema';
import useWifiTranslation from '../hooks/useWifiTranslation';

const useStyles = makeStyles((theme) => ({
  form: {
    // width: '80vw',
    // minWidth: 550,
    margin: 0,
    width: '100%',
  },

  paper: {
    padding: theme.spacing(4, 11),
    width: 900,
  },

  button: {
    margin: 'auto',
    marginTop: theme.spacing(4.5),
  },
}));

interface InputProps {
  type: string;
  open: boolean;
  companyId: string;
  areaId?: string | undefined;
  onClose: () => void;
}

const EditArea: FunctionComponent<InputProps> = ({
  type,
  companyId,
  areaId,
  open,
  onClose,
}: InputProps) => {
  const { t } = useWifiTranslation(['wifi', 'common']);
  const classes = useStyles();
  const {
    dispatch,
    userProfile: { permissionGroup },
  } = useStore();

  const [editArea] = useMutation<EditAreaResponse, EditAreaPayload>(EDIT_AREA);

  const [addArea] = useMutation<AddAreaResponse, AddAreaPayload>(ADD_AREA);

  const isMountedRef = useIsMountedRef();
  const [selectedStartDate, handleStartDateChange] = useState<Date | null>(null);
  const [selectedEndDate, handleEndDateChange] = useState<Date | null>(null);

  const {
    reset,
    watch,
    handleSubmit,
    register,
    setValue,
    formState: { dirtyFields, isValid, errors },
  } = useForm<IArea>({
    defaultValues: {
      // data from parent form
      id: areaId,
      name: '',
      serviceStartDate: '',
      serviceEndDate: undefined,
    },
    mode: 'onChange',
  });

  useQuery<GetAreaResponse, GetAreaPayload>(GET_AREA_ON_WIFI, {
    variables: {
      groupId: permissionGroup?.group.id,
      companyId,
      areaId: areaId || '',
    },
    skip: !areaId,
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ getArea }) => {
      const area = getArea.node;
      // setCompanyUI(currentCompany);

      reset({
        id: area.id,
        name: area.name,
        serviceStartDate: area.serviceStartDate,
        serviceEndDate: area.serviceEndDate === '' ? undefined : area.serviceEndDate,
      });
      handleStartDateChange(new Date(area.serviceStartDate));
      handleEndDateChange(
        area.serviceEndDate === ''
          ? null
          : new Date(area.serviceEndDate ? area.serviceEndDate : ''),
      );
    },
  });

  const handleAddArea = useCallback(
    ({
      id,
      name,
      serviceStartDate,
      serviceEndDate,
    }: IArea): Promise<FetchResult<AddAreaResponse> | void> => {
      if (!id && !companyId) return Promise.resolve();
      // if (serviceEndDate === '') {
      //   serviceEndDate = undefined;
      // }
      return addArea({
        variables: {
          groupId: permissionGroup?.group.id || '',
          companyId,
          areaName: name,
          serviceStartDate,
          serviceEndDate,
        },
      });
    },
    [addArea, companyId, permissionGroup?.group.id],
  );

  const handleEditArea = useCallback(
    ({
      id,
      name,
      serviceStartDate,
      serviceEndDate,
    }: IArea): Promise<FetchResult<EditAreaResponse> | void> => {
      if (!id && !companyId) return Promise.resolve();
      return editArea({
        variables: {
          groupId: permissionGroup?.group.id || '',
          companyId,
          areaId: id,
          areaName: name,
          serviceStartDate,
          serviceEndDate,
        },
      });
    },
    [companyId, editArea, permissionGroup?.group.id],
  );

  const handleOnClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);
  const requireFieldEmpty = t('wifi:This field cannot allow empty.');

  const onSubmit = useCallback<SubmitHandler<IArea>>(
    async (currentData: IArea) => {
      let isSaveSuccess = false;
      if (type === 'E' && !currentData.id) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('common:Save failed_ Please try again_'),
          },
        });
      } else {
        if (type === 'E') {
          const updateResult = await Promise.allSettled([handleEditArea(currentData)]);

          const rejectedResults = updateResult.filter((res) => res.status === 'rejected');

          if (rejectedResults.length === 0) {
            isSaveSuccess = true;
          } else {
            if (D_DEBUG) console.log(rejectedResults);
            isSaveSuccess = false;
          }
          if (isMountedRef.current) onClose();
        } else {
          const updateResult = await Promise.allSettled([handleAddArea(currentData)]);
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
          handleStartDateChange(null);
          handleEndDateChange(null);
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
    [dispatch, handleAddArea, handleEditArea, isMountedRef, onClose, reset, t, type],
  );

  return (
    <BaseDialog
      open={open}
      onClose={handleOnClose}
      title={type === 'E' ? t('wifi:Edit Area Information') : t('wifi:Add Area Information')}
      titleAlign="center"
      titleVariant="h4"
      classes={{ dialog: classes.paper }}
      content={
        <Grid container spacing={2} className={classes.form} component="form">
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              type="text"
              label={t('wifi:Company ID')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={companyId}
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              type="text"
              label={t('wifi:Area Name')}
              value={watch('name') || ''}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                ...register('name', {
                  maxLength: {
                    value: 255,
                    message: t('common:Max_ {{count}} character', { count: 255 }),
                  },
                  required: requireFieldEmpty,
                  validate: (value) => value.trim().length > 0,
                }),
              }}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>

          <Grid item xs={6}>
            <KeyboardDatePicker
              clearable
              // showTodayButton
              fullWidth
              label={t('wifi:Service Start Date')}
              inputVariant="outlined"
              InputLabelProps={{ shrink: true }}
              // value={selectedStartDate}
              value={selectedStartDate || null}
              onChange={(date: Date | null, value) => {
                handleStartDateChange(date);
                setValue('serviceStartDate', value || '', {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              defaultValue=""
              InputProps={{
                readOnly: true,
                ...register('serviceStartDate', {
                  //     // minLength: {
                  //     //   value: 2,
                  //     //   message: t('Invalid URL format'),
                  //     // },
                  //     // pattern: {
                  //     //   value: /\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])*/,
                  //     //   message: t('Invalid URL format'),
                  //     // },
                  required: requireFieldEmpty,
                }),
              }}
              format="yyyy-MM-dd"
              error={!!errors.serviceStartDate}
              helperText={errors.serviceStartDate?.message}
            />
          </Grid>
          <Grid item xs={6}>
            <KeyboardDatePicker
              clearable
              fullWidth
              defaultValue=""
              label={t('wifi:Service End Date')}
              inputVariant="outlined"
              InputLabelProps={{ shrink: true }}
              minDate={selectedStartDate}
              value={selectedEndDate || null}
              onChange={(date: Date | null, value) => {
                handleEndDateChange(date);
                setValue('serviceEndDate', value || undefined, {
                  shouldDirty: true,
                });
              }}
              format="yyyy-MM-dd"
              InputProps={{
                readOnly: true,
              }}
            />
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
  );
};

export default EditArea;
