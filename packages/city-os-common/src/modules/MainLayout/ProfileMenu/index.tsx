import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { FunctionComponent, memo, useCallback, useState } from 'react';

import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PhotoCameraOutlined from '@material-ui/icons/PhotoCameraOutlined';
import Typography from '@material-ui/core/Typography';

import { LOGOUT, LogoutPayload, LogoutResponse } from '../../../api/logout';
import { useStore } from '../../../reducers';
import ReducerActionType from '../../../reducers/actions';
import useCommonTranslation from '../../../hooks/useCommonTranslation';

import ChangeAvatar from './ChangeAvatar';
import ChangePassword from './ChangePassword';
import ProfileAvatar from '../../ProfileAvatar';
import UserProfile from './UserProfile';

const useStyles = makeStyles((theme) => ({
  menuPaper: {
    marginTop: 0,
  },

  profile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
  },

  user: {
    textTransform: 'none',
    align: 'center',
    color: theme.palette.info.main,
  },

  avatar: {
    margin: theme.spacing(1),
    height: 56,
    width: 56,
  },

  addAvatar: {
    position: 'absolute',
    borderRadius: '50%',
    margin: theme.spacing(1),
    height: 56,
    width: 56,
    color: theme.palette.info.main,
    opacity: 0,

    '&:hover': {
      opacity: 0.5,
      backgroundColor: theme.palette.common.black,
    },
  },
}));

interface ProfileMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

type ProfileMenuItem = 'profile' | 'changePassword' | 'changeAvatar';

const ProfileMenu: FunctionComponent<ProfileMenuProps> = ({
  anchorEl,
  onClose,
}: ProfileMenuProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation(['profileMenu', 'mainLayout']);
  const router = useRouter();
  const {
    dispatch,
    user,
    userProfile: { profile },
  } = useStore();

  const [openItem, setOpenItem] = useState<ProfileMenuItem>();

  const [logout] = useMutation<LogoutResponse, LogoutPayload>(LOGOUT);

  const handleOpenItem = useCallback(
    (item: ProfileMenuItem) => () => {
      setOpenItem(item);
      onClose();
    },
    [onClose],
  );

  const handleCloseItem = useCallback(() => {
    setOpenItem(undefined);
    onClose();
  }, [onClose]);

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
    <>
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
        <div className={classes.profile}>
          <ProfileAvatar
            username={profile?.name}
            photoId={profile?.photo}
            className={classes.avatar}
          />
          <IconButton aria-label={t('profileMenu:Change Avatar')} className={classes.addAvatar}>
            <PhotoCameraOutlined onClick={handleOpenItem('changeAvatar')} />
          </IconButton>
          <Typography variant="subtitle2" className={classes.user}>
            {profile?.name || t('mainLayout:User')}
          </Typography>
          <Typography variant="subtitle2" className={classes.user}>
            {profile?.email || ''}
          </Typography>
        </div>
        <Divider />
        <MenuItem onClick={handleOpenItem('profile')}>{t('profileMenu:User Profile')}</MenuItem>
        <MenuItem onClick={handleOpenItem('changePassword')}>
          {t('profileMenu:Change Password')}
        </MenuItem>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <MenuItem onClick={handleLogout}>{t('mainLayout:Logout')}</MenuItem>
      </Menu>
      <UserProfile open={openItem === 'profile'} onClose={handleCloseItem} />
      <ChangeAvatar open={openItem === 'changeAvatar'} onClose={handleCloseItem} />
      <ChangePassword open={openItem === 'changePassword'} onClose={handleCloseItem} />
    </>
  );
};

export default memo(ProfileMenu);
