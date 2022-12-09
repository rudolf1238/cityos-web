import { VoidFunctionComponent, useEffect } from 'react';
import { useRouter } from 'next/router';

import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

const MobileIndoorPage: VoidFunctionComponent = () => {
  const router = useRouter();
  const isMountedRef = useIsMountedRef();

  useEffect(() => {
    if (isMountedRef.current && router.isReady) {
      void router.replace(`${router.pathname}/list`);
    }
  }, [isMountedRef, router]);

  return null;
};

export default MobileIndoorPage;
