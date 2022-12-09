import { makeStyles } from '@material-ui/core/styles';

import { useRouter } from 'next/router';
import React, {
  FunctionComponent,
  PropsWithChildren,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AppBar from '@material-ui/core/AppBar';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Button from '@material-ui/core/Button';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import MapIcon from '@material-ui/icons/Map';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useCommonTranslation from 'city-os-common/hooks/useCommonTranslation';
import useSubjectTranslation from 'city-os-common/hooks/useSubjectTranslation';

import Auth from 'city-os-common/modules/Auth';
import CityOSLogoNoWord from 'city-os-common/assets/logo/city-os-no-word.svg';
import DashboardIcon from 'city-os-common/assets/icon/dashboard.svg';
import PermissionSelector from 'city-os-common/modules/MainLayout/PermissionSelector';
import type {
  BaseMenuItemProps,
  RequireOnlyOne,
} from 'city-os-common/modules/MainLayout/NestedList';

import ChangeLanguageButton from './ChangeLanguageButton';
import ChangeThemeTypeButton from './ChangeThemeTypeButton';
import HideOnScroll from './HideOnScroll';
import ProfileMenu from './MobileProfileMenu';
import ScrollTop from './ScrollTop';
import useRedirect from '../hooks/useRedirect';

interface BaseMenuItemWithSubjectProps extends Omit<BaseMenuItemProps, 'subItems'> {
  subItems?: MenuItemWithSubject[];
  subjects?: Subject[];
}

type MenuItemWithSubject = RequireOnlyOne<BaseMenuItemWithSubjectProps, 'link' | 'subItems'>;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    height: '100%',
  },

  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },

  toolbar: {
    paddingLeft: theme.spacing(2),
    gap: theme.spacing(2),
  },

  brand: {
    width: 'auto',
    height: theme.spacing(3.75),
    cursor: 'pointer',
  },

  rightMenu: {
    marginLeft: 'auto',
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
  },

  profile: {
    margin: theme.spacing(0, 2, 0, 1),
    padding: theme.spacing(2),
  },

  username: {
    textTransform: 'none',
    color: theme.palette.info.main,
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'auto',
  },

  container: {
    position: 'relative',
    flexGrow: 1,
    backgroundColor: theme.palette.background.container,
    overflow: 'auto',
  },

  header: {},

  footer: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
  },

  bottomNavigationActionLabel: {
    fontSize: '13px !important',
  },
}));

interface MobileMainLayoutProps {
  children: React.ReactElement;
}

const MobileMainLayout: FunctionComponent<MobileMainLayoutProps> = ({
  children,
}: PropsWithChildren<MobileMainLayoutProps>) => {
  const classes = useStyles();
  const { t } = useCommonTranslation(['common', 'mainLayout', 'indoor']);
  const { tSubject } = useSubjectTranslation();
  const {
    userProfile: { profile },
  } = useStore();
  const router = useRouter();
  const { to } = useRedirect();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleProfileClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const [value, setValue] = React.useState<number>(0);

  const [isBottomNavigationHidden, setIsBottomNavigationHidden] = useState<boolean>(false);

  const navigationList = useMemo(
    () => [
      {
        label: t('common:List'),
        icon: <FormatListBulletedIcon style={{ width: 23, height: 23 }} />,
        link: `/mobile/indoor/list`,
      },
      {
        label: t('common:Map'),
        icon: <MapIcon style={{ width: 23, height: 23 }} />,
        link: `/mobile/indoor/map`,
      },
      {
        label: tSubject(Subject.DASHBOARD),
        icon: <DashboardIcon style={{ width: 23, height: 23 }} />,
        link: subjectRoutes[Subject.DASHBOARD],
      },
    ],
    [t, tSubject],
  );

  useEffect(() => {
    setValue(-1);
    navigationList.forEach((navigation, index) => {
      if (router.asPath.startsWith(navigation.link)) {
        setValue(index);
      }
    });
  }, [navigationList, router.asPath]);

  const handleNavigationChick = useCallback(
    (link: string) => {
      void to(link);
    },
    [to],
  );

  const handleLogoClick = useCallback(() => {
    void to('/mobile/indoor/list');
  }, [to]);

  return (
    <Auth>
      <div className={classes.root}>
        <div className={classes.header}>
          <HideOnScroll>
            <AppBar color="inherit" className={classes.appBar} elevation={8}>
              <Toolbar disableGutters variant="dense" className={classes.toolbar}>
                <CityOSLogoNoWord className={classes.brand} onClick={handleLogoClick} />
                <PermissionSelector />
                <div className={classes.rightMenu}>
                  <ChangeLanguageButton />
                  <ChangeThemeTypeButton />
                  <Button
                    variant="text"
                    size="small"
                    className={classes.profile}
                    onClick={handleProfileClick}
                  >
                    <Typography variant="body2" className={classes.username}>
                      {profile?.name || t('mainLayout:User')}
                    </Typography>
                  </Button>
                </div>
                <ProfileMenu anchorEl={anchorEl} onClose={handleProfileClose} />
              </Toolbar>
            </AppBar>
          </HideOnScroll>
        </div>
        <div className={classes.content}>
          <Toolbar id="back-to-top-anchor" />
          <div className={classes.container}>{children}</div>
        </div>
        {value >= 0 && (
          <div className={classes.footer}>
            <HideOnScroll
              direction="up"
              onTrigger={(trigger) => {
                setIsBottomNavigationHidden(!trigger);
              }}
            >
              <BottomNavigation
                value={value}
                onChange={(_event, newValue: number) => {
                  setValue(newValue);
                }}
              >
                {navigationList.map((navigation) => (
                  <BottomNavigationAction
                    classes={{
                      label: classes.bottomNavigationActionLabel,
                    }}
                    label={navigation.label}
                    icon={navigation.icon}
                    key={`BottomNavigation-${navigation.link}`}
                    onClick={() => {
                      void handleNavigationChick(navigation.link);
                    }}
                  />
                ))}
              </BottomNavigation>
            </HideOnScroll>
          </div>
        )}
        <ScrollTop size="small" haveFab={isBottomNavigationHidden} />
      </div>
    </Auth>
  );
};

export default memo(MobileMainLayout);
