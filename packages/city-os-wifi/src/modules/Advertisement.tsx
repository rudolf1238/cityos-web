import React, { ChangeEvent, FunctionComponent, useCallback, useMemo, useState } from 'react';

import { Pagination } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';

import { Action, Subject } from 'city-os-common/libs/schema';
import { isNumberString, isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import BasicSearchField from 'city-os-common/src/modules/BasicSearchField';
import ErrorCode from 'city-os-common/libs/errorCode';
import Guard from 'city-os-common/modules/Guard';
import ReducerActionType from 'city-os-common/reducers/actions';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import isGqlError from 'city-os-common/libs/isGqlError';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';
import useIsMountedRef from 'city-os-common/src/hooks/useIsMountedRef';

import { AreaSortField, SortOrder } from '../libs/schema';
import { DELETE_AD, DeleteAdPayload, DeleteAdResponse } from '../api/deleteAd';
import {
  PartialAdNode,
  SEARCH_ADS_ON_WIFI,
  SearchAdsPayload,
  SearchAdsResponse,
} from '../api/searchAdsOnWifi';
import AdDetail from './AdDetail';
import DeleteAdDialog from './DeleteAdDialog';
import DetailsIcon from '../assets/icon/details.svg';
import EditAdvertisement from './EditAdvertisement';
import I18nWifiProvider from './I18nWifiProvider';
import useWifiTranslation from '../hooks/useWifiTranslation';

const useStyles = makeStyles((theme) => ({
  filedWrapper: {
    maxWidth: 280,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.up('lg')]: {
      maxWidth: 'none',
    },
  },

  search: {
    width: '100%',
  },

  nestedTable: {
    display: 'flex',
    width: '100',
    marginLeft: 'auto',
  },
  nestedTable1: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  nestedTable2: {
    margin: 'auto',
    display: 'flex',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'flex-end',
    },
  },

  loading: {
    marginTop: theme.spacing(10),
  },

  buttons: {
    display: 'flex',
    marginTop: theme.spacing(3),
    gap: theme.spacing(2),
    marginLeft: 'auto',
    marginBottom: theme.spacing(3),
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'flex-end',
    },

    // '& > .MuiDivider-vertical:last-child': {
    //   display: 'none',
    // },
  },

  dialog: {
    width: 600,
    height: 270,
  },

  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 0,
    height: '100%',
  },

  dialogButton: {
    alignSelf: 'center',
    marginTop: 'auto',
  },
}));

interface Query {
  gid?: string;
  q?: string;
  areaSortBy?: AreaSortField;
  areaOrder?: SortOrder;
  n?: number; // pagesize
  p?: number; // currentpage
  keyword?: string;
  page?: number;
  num?: number;
}

interface RowData extends PartialAdNode {
  key: string;
  isLoading?: boolean;
}

interface InputProps {
  companyId: string;
  companyName: string;
}

const Advertisement: FunctionComponent<InputProps> = ({ companyId, companyName }: InputProps) => {
  const { t } = useWifiTranslation(['wifi']);
  const classes = useStyles();
  const router = useRouter();
  const isMountedRef = useIsMountedRef();
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<RowData[]>([]);
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.WIFI_COMPANYDETAIL]);
  const {
    dispatch,
    userProfile: { permissionGroup, divisionGroup },
  } = useStore();
  const keyword = isString(router.query.keyword) ? router.query.keyword : undefined;
  const paramPage = isNumberString(router.query.page) ? parseInt(router.query.page, 10) : 1;
  const rowsPerPage = isNumberString(router.query.num) ? parseInt(router.query.num, 10) : 12;
  const [startCursorList, setStartCursorList] = useState<(undefined | string)[]>([undefined]);
  const [searchData, setSearchData] = useState<SearchAdsResponse['getAdList']>();
  const [openAddAd, setOpenAddAd] = useState(false);
  const [openEditAd, setOpenEditAd] = useState(false);
  const [openDetailAd, setOpenDetailAd] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);

  const requestPage = useMemo(
    () => (startCursorList.length - 1 >= paramPage ? paramPage - 1 : startCursorList.length - 1),
    [startCursorList, paramPage],
  );
  const { refetch } = useQuery<SearchAdsResponse, SearchAdsPayload>(SEARCH_ADS_ON_WIFI, {
    variables: {
      groupId: divisionGroup?.id || '',
      companyId,
      filter: {
        keyword,
      },
      currentPage: requestPage + 1,
      pageCount: rowsPerPage,
    },
    skip:
      !router.isReady ||
      !divisionGroup?.id ||
      !permissionGroup?.group.id ||
      !!(router.query.gid && router.query.gid !== divisionGroup.id),
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ getAdList }) => {
      setStartCursorList((prev) => {
        const newCursorList = [...prev];
        newCursorList[requestPage + 1] = getAdList.pageInfo.endCursor;
        return newCursorList;
      });
      if (requestPage === paramPage - 1) {
        setSearchData(getAdList);
      }
      if ((paramPage - 1) * rowsPerPage >= getAdList.totalCount || paramPage < 1) {
        changeRoute({ page: 1 });
      }
    },
    onError: (err) => {
      isGqlError(err, ErrorCode.USER_ALREADY_EXISTED);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('wifi:Not found, Please try again_'),
        },
      });
    },
  });

  const [deleteAd] = useMutation<DeleteAdResponse, DeleteAdPayload>(DELETE_AD, {
    onCompleted: ({ deleteAd: removedList }) => {
      if (removedList.length === selectedRows.length) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('wifi:The company has been removed successfully_', {
              count: removedList.length,
            }),
          },
        });
        setSelectedRows([]);
      }
      if (removedList.length < selectedRows.length) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'warning',
            message: t('wifi:Company was not able to be removed successfully_'),
          },
        });
        setSelectedRows((prev) =>
          prev.filter(({ id }) => removedList.every((removedId) => removedId !== id)),
        );
      }
      setStartCursorList([undefined]);
      // void refetchCompany();
      void refetch();
    },
  });

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value),
    [],
  );
  const resetOnPageInit = useCallback(() => {
    setSelectedRows([]);
  }, []);

  const handleSearch = useCallback(
    (newKeyword: string | null) => {
      if (newKeyword !== null) {
        changeRoute({ keyword: newKeyword, page: 1 });
        resetOnPageInit();
      }
    },
    [changeRoute, resetOnPageInit],
  );

  const handleClearSearch = useCallback(() => {
    changeRoute({ page: 1 }, ['keyword']);
    setSearchValue('');
    resetOnPageInit();
  }, [changeRoute, resetOnPageInit]);

  const tableData = useMemo<RowData[]>(
    () =>
      searchData
        ? searchData.ads.map(({ node }) => ({
            ...node,
            key: node.id,
          }))
        : [],
    [searchData],
  );

  const handleOpenAddAd = useCallback(() => {
    setOpenAddAd(true);
  }, []);

  const handleCloseAddAd = useCallback(() => {
    void refetch();
    setOpenAddAd(false);
  }, [refetch]);

  const handleCloseEditAd = useCallback(() => {
    void refetch();
    setOpenEditAd(false);
    setSelectedRows([]);
  }, [refetch]);

  const handleOpenEditAd = useCallback((currentSelected: RowData) => {
    setOpenEditAd(true);
    setSelectedRows([currentSelected]);
  }, []);

  const handleCloseDetailAd = useCallback(() => {
    void refetch();
    setOpenDetailAd(false);
    setSelectedRows([]);
  }, [refetch]);

  const handleOpenDetailAd = useCallback((currentSelected: RowData) => {
    setOpenDetailAd(true);
    setSelectedRows([currentSelected]);
  }, []);

  const handleCloseRemoveDialog = useCallback(
    async (isDeleted) => {
      if (isDeleted && divisionGroup?.id) {
        const adId = selectedRows.map(({ id }) => id);
        await deleteAd({
          variables: {
            groupId: divisionGroup.id,
            companyId,
            adId: adId[0],
          },
        });
      }
      if (isMountedRef.current) setOpenRemoveDialog(false);
    },
    [divisionGroup?.id, isMountedRef, selectedRows, deleteAd, companyId],
  );

  const handleClickRemoveIcon = useCallback(
    (currentSelected: RowData) => {
      setSelectedRows([currentSelected]);
      const canRemove = !(currentSelected.id === null || currentSelected.id === '');
      if (canRemove) {
        setOpenRemoveDialog(true);
      } else {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'warning',
            message: t('wifi:This is not a Ad, you cannot remove the ad from here_'),
          },
        });
      }
      // return;
    },
    [dispatch, t],
  );

  const handleCountChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      changeRoute({
        num: parseInt(event.target.value as string, 10),
        page: 1,
      });
      setSearchData(undefined);
    },
    [changeRoute],
  );

  const handleChange = useCallback(
    (_event: React.ChangeEvent<unknown>, newPage: number) => {
      changeRoute({ page: 0 });
      changeRoute({ page: newPage });
      setSearchData(undefined);
    },
    [changeRoute],
  );

  return (
    <I18nWifiProvider>
      <Guard subject={Subject.WIFI} action={Action.VIEW}>
        <Container>
          <Grid className={classes.nestedTable}>
            <Typography className={classes.nestedTable1}>{t('wifi:Results Per Page')}</Typography>
            <FormControl>
              <Select value={rowsPerPage} onChange={(e) => handleCountChange(e)}>
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={18}>18</MenuItem>
              </Select>
            </FormControl>
            <Typography className={classes.nestedTable1}>
              {t('wifi:Total Advertisement_ {{count}}', {
                count: searchData?.totalCount || 0,
              })}
            </Typography>
            <Typography className={classes.nestedTable1}>
              {searchData?.totalCount === 0 && t('wifi:No Data')}
            </Typography>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6} lg={3} className={classes.filedWrapper}>
              <BasicSearchField
                value={searchValue}
                placeholder={t('wifi:Search')}
                className={classes.search}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                onClear={handleClearSearch}
              />
            </Grid>

            <Grid item xs={12} lg={3} className={classes.buttons}>
              <Guard subject={Subject.WIFI} action={Action.ADD} fallback={null}>
                <ThemeIconButton
                  tooltip={t('wifi:Add Ad')}
                  color="primary"
                  variant="contained"
                  onClick={handleOpenAddAd}
                >
                  <AddIcon />
                </ThemeIconButton>
                <EditAdvertisement
                  adType="A"
                  companyId={companyId}
                  open={openAddAd}
                  onClose={handleCloseAddAd}
                />
              </Guard>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {tableData &&
              tableData.map((card) => (
                <Grid item xs={12} sm={6} md={4} key={card.id}>
                  <Card variant="outlined">
                    <CardHeader
                      action={
                        // <IconButton aria-label="settings">
                        <ThemeIconButton
                          tooltip={t('common:Details')}
                          variant="contained"
                          color="primary"
                          onClick={() => handleOpenDetailAd(card)}
                        >
                          <DetailsIcon />
                        </ThemeIconButton>
                        // </IconButton>
                      }
                      title={card.name}
                      subheader={`${card.company_name}`}
                    />

                    <CardContent>
                      {card.type === 1 && (
                        <CardMedia height="160" component="img" image={card.image} alt="random" />
                      )}
                      {card.type === 4 && (
                        <iframe
                          height="155"
                          src={`https://www.youtube.com/embed/${card.youtube_video_id}`}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleClickRemoveIcon(card)}>
                        <DeleteIcon />
                      </Button>

                      <Button size="small" onClick={() => handleOpenEditAd(card)}>
                        <EditIcon />
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            <Guard subject={Subject.WIFI} action={Action.REMOVE} fallback={null}>
              <DeleteAdDialog
                open={openRemoveDialog}
                companyName={companyName}
                classes={{
                  root: classes.dialog,
                  content: classes.dialogContent,
                  button: classes.dialogButton,
                }}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClose={handleCloseRemoveDialog}
              />
            </Guard>
            {selectedRows.length > 0 && (
              <>
                <Guard subject={Subject.WIFI} action={Action.MODIFY} fallback={null}>
                  <EditAdvertisement
                    adType="E"
                    companyId={companyId}
                    adId={selectedRows[0].id}
                    open={openEditAd}
                    onClose={handleCloseEditAd}
                  />
                </Guard>
                <Guard subject={Subject.WIFI} action={Action.VIEW} fallback={null}>
                  <AdDetail
                    companyId={companyId}
                    adId={selectedRows[0].id}
                    open={openDetailAd}
                    onClose={handleCloseDetailAd}
                  />
                </Guard>
              </>
            )}
          </Grid>
          {!searchData && <CircularProgress className={classes.loading} />}
          {searchData && searchData.totalCount > 0 && (
            <Pagination
              className={classes.nestedTable2}
              count={Math.ceil(searchData.totalCount / rowsPerPage)}
              page={paramPage}
              size="large"
              onChange={handleChange}
            />
          )}
        </Container>
      </Guard>
    </I18nWifiProvider>
  );
};

export default Advertisement;
