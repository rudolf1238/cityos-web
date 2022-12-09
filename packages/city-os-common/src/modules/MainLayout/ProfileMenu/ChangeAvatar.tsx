import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import React, {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import dynamic from 'next/dynamic';

import { isString } from 'lodash';

import Button from '@material-ui/core/Button';

import { StorageKey, getItem, getValue } from '../../../libs/storage';
import {
  UPDATE_PROFILE,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from '../../../api/updateProfile';
import { getImgBase64 } from '../../../api/getImg';
import { useStore } from '../../../reducers';
import BaseDialog from '../../BaseDialog';
import ReducerActionType from '../../../reducers/actions';
import deleteImg from '../../../api/deleteImg';
import uploadImg from '../../../api/uploadImg';
import useCommonTranslation from '../../../hooks/useCommonTranslation';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(6, 16, 10),
    width: 750,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    alignItems: 'center',
    marginTop: theme.spacing(4),
  },
}));

interface ChangeAvatarProps {
  open: boolean;
  onClose: () => void;
}

const ChangeAvatar: FunctionComponent<ChangeAvatarProps> = ({
  open,
  onClose,
}: PropsWithChildren<ChangeAvatarProps>) => {
  const { t } = useCommonTranslation(['common', 'profileMenu']);
  const classes = useStyles();
  const [url, setUrl] = React.useState('');
  const [preview, setPreview] = React.useState('');
  const { handleSubmit, reset, setValue } = useForm({
    mode: 'onChange',
  });
  const {
    user,
    dispatch,
    userProfile: { divisionGroup, permissionGroup, profile },
  } = useStore();

  const groupId = divisionGroup?.id;
  const refreshToken = getValue(getItem(StorageKey.ACCESS), isString);
  const authorization = `Bearer ${refreshToken || ''}`;

  const asyncGetImg = useCallback(async () => {
    if (profile?.photo) {
      try {
        const base64Image = await getImgBase64(
          profile.photo,
          `Bearer ${user.accessToken || ''}`,
          permissionGroup?.group?.id || '',
        );

        if (typeof base64Image === 'string') {
          setUrl(base64Image);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [profile?.photo, permissionGroup?.group?.id, user.accessToken]);

  useEffect(() => {
    void asyncGetImg();
  }, [asyncGetImg]);

  const handleOnClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const [updateProfile, { loading }] = useMutation<UpdateProfileResponse, UpdateProfilePayload>(
    UPDATE_PROFILE,
    {
      onCompleted: (profileData) => {
        dispatch({
          type: ReducerActionType.SetProfile,
          payload: {
            profile: profileData.updateProfile,
          },
        });
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('common:The information has been saved successfully_'),
          },
        });
      },
      onError: () => {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('common:Failed to save_ Please try again_'),
          },
        });
      },
    },
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const upload = await uploadImg({ file, authorization, groupId });
      const fileID = upload.fileInfo._id;
      setValue('file', fileID, { shouldDirty: true });
      return fileID;
    },
    [authorization, groupId, setValue],
  );

  const onSubmit = useCallback(async () => {
    if (profile) {
      const res = await fetch(preview);
      const buf = await res.arrayBuffer();
      const fileId = await uploadFile(new File([buf], 'avatar.png', { type: 'image/png' }));

      if (profile?.photo) {
        await deleteImg({ imageId: profile.photo, authorization, groupId });
      }

      await updateProfile({
        variables: {
          updateProfileInput: {
            photo: fileId,
          },
        },
      });
    }
    onClose();
  }, [profile, onClose, updateProfile, uploadFile, authorization, groupId, preview]);

  const Avatar = useMemo(
    () =>
      dynamic(() => import('react-avatar-edit'), {
        ssr: false,
      }),
    [],
  );

  const onCrop = (view: string) => {
    setPreview(view);
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleOnClose}
      title={t('profileMenu:Change Avatar')}
      titleAlign="center"
      titleVariant="h4"
      classes={{ dialog: classes.paper }}
      content={
        <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
          <Avatar
            width={400}
            height={300}
            onCrop={onCrop}
            src={url}
            label={t('profileMenu:Upload a photo')}
          />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {t('common:Save')}
          </Button>
        </form>
      }
    />
  );
};

export default ChangeAvatar;
