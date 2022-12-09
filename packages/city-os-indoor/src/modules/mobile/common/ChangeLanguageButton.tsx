import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useCallback } from 'react';

import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';

import { Language } from 'city-os-common/libs/schema';
import {
  UPDATE_PROFILE,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from 'city-os-common/api/updateProfile';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import useCommonTranslation from 'city-os-common/hooks/useCommonTranslation';

const useStyles = makeStyles((theme) => ({
  button: {
    height: theme.spacing(4.5),
    width: theme.spacing(4.5),
  },

  icon: {
    height: theme.spacing(2.75),
    width: theme.spacing(2.75),
    color: theme.palette.info.main,
    background: '#00000000',
    fontWeight: 500,
    fontSize: 15,
    marginTop: 2,
  },
}));

const ChangeLanguageButton: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useCommonTranslation(['common', 'profileMenu']);
  const { dispatch, userProfile } = useStore();

  const [updateProfile] = useMutation<UpdateProfileResponse, UpdateProfilePayload>(UPDATE_PROFILE, {
    onCompleted: (profileData) => {
      dispatch({
        type: ReducerActionType.SetProfile,
        payload: {
          profile: profileData.updateProfile,
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
  });

  const handleLanguageTrigger = useCallback(
    async (newLanguage: Language) => {
      if (userProfile.profile) {
        await updateProfile({
          variables: {
            updateProfileInput: {
              language: newLanguage,
            },
          },
        });
      }
    },
    [updateProfile, userProfile.profile],
  );

  return userProfile.profile?.language === Language.en_US ? (
    <IconButton
      aria-label={t('profileMenu:Light')}
      className={classes.button}
      onClick={() => {
        void handleLanguageTrigger(Language.zh_Hant_TW);
      }}
    >
      <Avatar className={classes.icon}>EN</Avatar>
    </IconButton>
  ) : (
    <IconButton
      aria-label={t('profileMenu:Dark')}
      className={classes.button}
      onClick={() => {
        void handleLanguageTrigger(Language.en_US);
      }}
    >
      <Avatar className={classes.icon}>ZH</Avatar>
    </IconButton>
  );
};

export default memo(ChangeLanguageButton);
