import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useCallback } from 'react';

import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import IconButton from '@material-ui/core/IconButton';

import { Theme } from 'city-os-common/libs/schema';
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
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    color: theme.palette.info.main,
  },
}));

const ChangeThemeTypeButton: VoidFunctionComponent = () => {
  const classes = useStyles();
  const theme = useTheme();
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

  const handleThemeTrigger = useCallback(
    async (newTheme: Theme) => {
      if (userProfile.profile) {
        await updateProfile({
          variables: {
            updateProfileInput: {
              theme: newTheme,
            },
          },
        });
      }
    },
    [updateProfile, userProfile.profile],
  );

  return theme.palette.type === 'dark' ? (
    <IconButton
      aria-label={t('profileMenu:Light')}
      className={classes.button}
      onClick={() => {
        void handleThemeTrigger(Theme.LIGHT);
      }}
    >
      <Brightness7Icon className={classes.icon} />
    </IconButton>
  ) : (
    <IconButton
      aria-label={t('profileMenu:Dark')}
      className={classes.button}
      onClick={() => {
        void handleThemeTrigger(Theme.DARK);
      }}
    >
      <Brightness4Icon className={classes.icon} />
    </IconButton>
  );
};

export default memo(ChangeThemeTypeButton);
