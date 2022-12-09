import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback } from 'react';

import ErrorPage from 'city-os-common/modules/ErrorPage';

import useWebTranslation from '../hooks/useWebTranslation';

import OfflineImg from '../assets/img/offline.svg';

const OfflinePage: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['error', 'common']);
  const router = useRouter();

  const handleOnClick = useCallback(() => {
    void router.back();
  }, [router]);

  return (
    <ErrorPage
      text={t('error:No internet connection_ please check your internet settings_')}
      img={<OfflineImg />}
      button={{
        text: t('common:Back to previous page'),
        onClick: handleOnClick,
      }}
    />
  );
};

export default OfflinePage;
