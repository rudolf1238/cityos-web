import { Action, Subject } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';

import ErrorPage from 'city-os-common/modules/ErrorPage';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import NoPermissionImg from 'city-os-common/assets/img/no-permission.svg';
import PageContainer from 'city-os-common/modules/PageContainer';
import React, { VoidFunctionComponent, useCallback, useMemo, useState } from 'react';
import TabPanelSet from 'city-os-common/modules/TabPanelSet';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useWifiTranslation from '../hooks/useWifiTranslation';

import Advertisement from './Advertisement';
import Area from './Area';
import I18nWifiProvider from './I18nWifiProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: 950,
    weight: 950,
  },

  scrollButtons: {
    backgroundColor: theme.palette.background.container,
  },
}));

const CompanyDetail: VoidFunctionComponent = () => {
  const { t } = useWifiTranslation(['wifi']);
  const router = useRouter();
  const classes = useStyles();
  const companyId = isString(router.query.companyId) ? router.query.companyId : '';
  const name = isString(router.query.name) ? router.query.name : '';
  const backLink = isString(router.query.back) ? router.query.back : undefined;
  const [tabIndex, setTabIndex] = useState(0);
  const tabTitles = useMemo(
    () => [{ title: t('wifi:Area') }, { title: t('wifi:Advertisement') }],
    [t],
  );

  const handleSelectTab = useCallback((index: number): boolean => {
    setTabIndex(index);
    return true;
  }, []);

  return (
    <I18nWifiProvider>
      <MainLayout>
        <Guard subject={Subject.WIFI} action={Action.VIEW}>
          {companyId && companyId.length === 0 && (
            <ErrorPage text={t('wifi:Company Datails')} img={<NoPermissionImg />} />
          )}
          {companyId && companyId.length > 0 && (
            <PageContainer className={classes.root}>
              <Header
                title={name || ''}
                backLinkText={t('wifi:Wifi Company Management')}
                backLinkHref={backLink || subjectRoutes[Subject.WIFI]}
              />
              <TabPanelSet
                tabsColor="transparent"
                tabTitles={tabTitles}
                classes={{
                  scrollButtons: classes.scrollButtons,
                }}
                onSelect={handleSelectTab}
              >
                <div hidden={tabIndex !== 0}>
                  <Area companyId={companyId} companyName={name} />
                </div>
                <div hidden={tabIndex !== 1}>
                  <Advertisement companyId={companyId} companyName={name} />
                </div>
              </TabPanelSet>
            </PageContainer>
          )}
        </Guard>
      </MainLayout>
    </I18nWifiProvider>
  );
};

export default CompanyDetail;
