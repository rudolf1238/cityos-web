import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { FunctionComponent, memo, useCallback } from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { LOGOUT, LogoutPayload, LogoutResponse } from 'city-os-common/api/logout';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import useCommonTranslation from 'city-os-common/hooks/useCommonTranslation';

const useStyles = makeStyles(() => ({
  menuPaper: {
    marginTop: 0,
  },
}));

interface ProfileMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const ProfileMenu: FunctionComponent<ProfileMenuProps> = ({
  anchorEl,
  onClose,
}: ProfileMenuProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation(['profileMenu', 'mainLayout']);
  const router = useRouter();
  const { dispatch, user } = useStore();

  const [logout] = useMutation<LogoutResponse, LogoutPayload>(LOGOUT);

  const handleLogout = useCallback(async () => {
    await router.push('/');
    try {
      await logout({
        variables: {
          refreshToken: user?.refreshToken || '',
        },
      });
    } catch (error) {
      if (D_DEBUG) console.error(error);
    }
    dispatch({
      type: ReducerActionType.UserLogout,
    });
  }, [router, dispatch, logout, user?.refreshToken]);

  return (
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      getContentAnchorEl={null}
      PaperProps={{
        elevation: 0,
      }}
      classes={{
        paper: classes.menuPaper,
      }}
    >
      <MenuItem
        onClick={() => {
          void handleLogout();
        }}
      >
        {t('mainLayout:Logout')}
      </MenuItem>
    </Menu>
  );
};

export default memo(ProfileMenu);
