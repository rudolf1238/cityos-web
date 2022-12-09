import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';

import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, memo, useCallback, useMemo, useState } from 'react';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

import { Action, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import Guard from 'city-os-common/modules/Guard';

import {
  BuildingEdge,
  GET_BUILDINGS_ON_MOBILE,
  GetBuildingsOnMobilePayload,
  GetBuildingsOnMobileResponse,
} from '../../api/getBuildingsOnMobile';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';
import type { Query } from '../../libs/type';

import BuildingCard from './custom/BuildingCard';
import BuildingCardSkeleton from './custom/BuildingCard/Skeleton';
import CustomSearchField from './custom/CustomSearchField';
import I18nIndoorProvider from '../I18nIndoorProvider';
import ResponsiveMainLayout from './common/ResponsiveMainLayout';
import useRedirect from './hooks/useRedirect';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(9),
  },

  fullWidth: {
    width: '100%',
  },
}));

const MobileIndoorListPage: VoidFunctionComponent = () => {
  const { t: tIndoor } = useIndoorTranslation(['indoor', 'common']);
  const classes = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const routerQuery: Query = useMemo(() => router.query, [router.query]);
  const {
    userProfile: { permissionGroup },
  } = useStore();
  const { to } = useRedirect();

  const [keyword, setKeyword] = useState<string | null>(null);

  const handleSearch = useCallback((currentKeyword: string | null) => {
    setKeyword(currentKeyword);
  }, []);

  const handleClearSearch = useCallback(() => {
    setKeyword(null);
  }, []);

  const handleCardClick = React.useCallback(
    (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      building: BuildingEdge['node'],
    ): void => {
      void to(
        '/mobile/indoor/building',
        {
          deviceId: building.deviceId,
        },
        !building?.deviceId,
      );
    },
    [to],
  );

  const groupId = useMemo(
    () => routerQuery.groupId || routerQuery.pid || permissionGroup?.group.id,
    [permissionGroup?.group.id, routerQuery.groupId, routerQuery.pid],
  );

  // TODO: 待後端改善權限問題後，改用 device 的 API，以利提升性能
  const {
    data: getBuildingsData,
    refetch: refetchGetBuildings,
    loading,
  } = useQuery<GetBuildingsOnMobileResponse, GetBuildingsOnMobilePayload>(GET_BUILDINGS_ON_MOBILE, {
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

  const currentBuildingList: BuildingEdge[] = useMemo(() => {
    const buildingEdgeList = getBuildingsData?.getBuildings?.edges || [];
    return buildingEdgeList.filter((buildingEdge) =>
      keyword ? buildingEdge.node.name.includes(keyword) : true,
    );
  }, [getBuildingsData?.getBuildings, keyword]);

  return (
    <I18nIndoorProvider>
      <ResponsiveMainLayout>
        <Guard subject={Subject.INDOOR} action={Action.VIEW}>
          <Container>
            <Box my={3} className={classes.root}>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="center"
                marginBottom={theme.spacing(0.5)}
                width="100%"
                maxWidth={theme.spacing(120)}
              >
                <CustomSearchField
                  className={classes.fullWidth}
                  placeholder={tIndoor('common:Please enter the keyword_')}
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                />
              </Box>
              <Grid container spacing={2}>
                {loading ? (
                  <BuildingCardSkeleton />
                ) : (
                  currentBuildingList.map((building) => (
                    <BuildingCard
                      key={`building-list-${building.node.deviceId}`}
                      building={building.node}
                      handleCardClick={handleCardClick}
                    />
                  ))
                )}
              </Grid>
            </Box>
          </Container>
        </Guard>
      </ResponsiveMainLayout>
    </I18nIndoorProvider>
  );
};

export default memo(MobileIndoorListPage);
