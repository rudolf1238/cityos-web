import { useQuery } from '@apollo/client';

import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, memo, useMemo } from 'react';
import dynamic from 'next/dynamic';

import Skeleton from '@material-ui/lab/Skeleton';

import { Action, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import Guard from 'city-os-common/modules/Guard';

import {
  BuildingEdge,
  GET_BUILDINGS_ON_MOBILE,
  GetBuildingsOnMobilePayload,
  GetBuildingsOnMobileResponse,
} from '../../api/getBuildingsOnMobile';
import type { Query } from '../../libs/type';

import I18nIndoorProvider from '../I18nIndoorProvider';
import ResponsiveMainLayout from './common/ResponsiveMainLayout';

const MobileIndoorMapPage: VoidFunctionComponent = () => {
  const router = useRouter();
  const routerQuery: Query = useMemo(() => router.query, [router.query]);
  const {
    userProfile: { permissionGroup },
  } = useStore();

  const groupId = useMemo(
    () => routerQuery.groupId || routerQuery.pid || permissionGroup?.group.id,
    [permissionGroup?.group.id, routerQuery.groupId, routerQuery.pid],
  );

  const { data: getBuildingsData, refetch: refetchGetBuildings } = useQuery<
    GetBuildingsOnMobileResponse,
    GetBuildingsOnMobilePayload
  >(GET_BUILDINGS_ON_MOBILE, {
    variables: { groupId: groupId || '' },
    onError: (error) => {
      if (D_DEBUG) console.error(error.graphQLErrors);
      void refetchGetBuildings();
    },
    skip: !groupId,
  });

  React.useEffect(() => {
    void refetchGetBuildings();
  }, [refetchGetBuildings, groupId]);

  const buildingEdgeList: BuildingEdge[] = useMemo(() => {
    return getBuildingsData?.getBuildings?.edges || [];
  }, [getBuildingsData?.getBuildings]);

  const BuildingMapLoading = useMemo(
    () => <Skeleton variant="rect" style={{ width: '100%', height: '100%' }} />,
    [],
  );

  const BuildingMap = useMemo(
    () =>
      dynamic(() => import('./custom/BuildingMap'), {
        loading: () => BuildingMapLoading,
        ssr: false,
      }),
    [BuildingMapLoading],
  );

  return (
    <I18nIndoorProvider>
      <ResponsiveMainLayout>
        <Guard subject={Subject.INDOOR} action={Action.VIEW}>
          <BuildingMap buildingEdgeList={buildingEdgeList} />
        </Guard>
      </ResponsiveMainLayout>
    </I18nIndoorProvider>
  );
};

export default memo(MobileIndoorMapPage);
