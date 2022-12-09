import { Action, Subject } from 'city-os-common/libs/schema';
import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import { isNumberString, isSortOrder, isString } from 'city-os-common/libs/validators';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useStore } from 'city-os-common/reducers';
import AddIcon from '@material-ui/icons/Add';
import BasicSearchField from 'city-os-common/src/modules/BasicSearchField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ErrorCode from 'city-os-common/libs/errorCode';
import Grid from '@material-ui/core/Grid';
import Guard from 'city-os-common/modules/Guard';
import NestedTable from 'city-os-common/modules/NestedTable';
import React, {
  ChangeEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ReducerActionType from 'city-os-common/reducers/actions';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';
import isGqlError from 'city-os-common/libs/isGqlError';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';
import useIsMountedRef from 'city-os-common/src/hooks/useIsMountedRef';

import { AreaSortField, SortOrder } from '../libs/schema';
import {
  PartialAreaNode,
  SEARCH_AREAS_ON_WIFI,
  SearchAreasPayload,
  SearchAreasResponse,
} from '../api/searchAreasOnWifi';
import { isAreaSortField } from '../libs/validators';
import EditArea from './EditArea';
import useWifiTranslation from '../hooks/useWifiTranslation';

import { DELETE_AREA, DeleteAreaPayload, DeleteAreaResponse } from '../api/deleteArea';
import DeleteAreaDialog from './DeleteAreaDialog';
import I18nWifiProvider from './I18nWifiProvider';

const useStyles = makeStyles((theme) => ({
  filedWrapper: {
    maxWidth: 280,
    marginTop: theme.spacing(3),
    [theme.breakpoints.up('lg')]: {
      maxWidth: 'none',
    },
  },

  search: {
    width: '100%',
  },

  tableWrapper: {
    width: 0,
    textAlign: 'center',
  },

  nestedTable: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  },

  loading: {
    marginTop: theme.spacing(10),
  },

  buttons: {
    display: 'flex',
    marginTop: theme.spacing(3),
    gap: theme.spacing(2),
    justifyContent: 'flex-start',
    marginLeft: 'auto',

    [theme.breakpoints.up('lg')]: {
      justifyContent: 'flex-end',
    },

    '& > .MuiDivider-vertical:last-child': {
      display: 'none',
    },
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
}

interface RowData extends PartialAreaNode {
  key: string;
  isLoading?: boolean;
}

interface InputProps {
  companyId: string;
  companyName: string;
}

interface CustomColumn<T extends RowData> extends Omit<Column<T>, 'field'> {
  field: string;
}

const Area: FunctionComponent<InputProps> = ({ companyId, companyName }: InputProps) => {
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
  const keyword = isString(router.query.q) ? router.query.q : undefined;
  const sortField = isAreaSortField(router.query.areaSortBy) ? router.query.areaSortBy : undefined;
  const sortOrder = isSortOrder(router.query.areaOrder) ? router.query.areaOrder : undefined;
  const paramPage = isNumberString(router.query.p) ? parseInt(router.query.p, 10) : 1;
  const rowsPerPage = isNumberString(router.query.n) ? parseInt(router.query.n, 10) : 10;
  const [startCursorList, setStartCursorList] = useState<(undefined | string)[]>([undefined]);
  const [searchData, setSearchData] = useState<SearchAreasResponse['getAreaList']>();
  const [openAddArea, setOpenAddArea] = useState(false);
  const [openEditArea, setOpenEditArea] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);

  const requestPage = useMemo(
    () => (startCursorList.length - 1 >= paramPage ? paramPage - 1 : startCursorList.length - 1),
    [startCursorList, paramPage],
  );
  const { refetch } = useQuery<SearchAreasResponse, SearchAreasPayload>(SEARCH_AREAS_ON_WIFI, {
    variables: {
      groupId: divisionGroup?.id || '',
      companyId,
      filter: {
        sortField: sortField && sortOrder ? sortField : undefined,
        sortOrder: sortField && sortOrder ? sortOrder : undefined,
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
    onCompleted: ({ getAreaList }) => {
      setStartCursorList((prev) => {
        const newCursorList = [...prev];
        newCursorList[requestPage + 1] = getAreaList.pageInfo.endCursor;
        return newCursorList;
      });
      if (requestPage === paramPage - 1) setSearchData(getAreaList);
      if ((paramPage - 1) * rowsPerPage >= getAreaList.totalCount || paramPage < 1) {
        changeRoute({ p: 1 });
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

  const [deleteArea] = useMutation<DeleteAreaResponse, DeleteAreaPayload>(DELETE_AREA, {
    onCompleted: ({ deleteArea: removedList }) => {
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
        console.log('handleSearch, newKeyword', newKeyword);
        changeRoute({ q: newKeyword, p: 1 });
        resetOnPageInit();
      }
    },
    [changeRoute, resetOnPageInit],
  );

  const handleClearSearch = useCallback(() => {
    console.log('handleClearSearch');
    changeRoute({ p: 1 }, ['q']);
    setSearchValue('');
    resetOnPageInit();
  }, [changeRoute, resetOnPageInit]);

  const getHandleSort = useCallback(
    (newSortField: AreaSortField, newSortOrder: SortOrder) => {
      changeRoute({
        areaSortBy: newSortField,
        areaOrder: newSortOrder,
        p: 1,
      });
      resetOnPageInit();
    },
    [changeRoute, resetOnPageInit],
  );
  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      changeRoute({
        n: parseInt(event.target.value, 10),
        p: 1,
      });
      setStartCursorList([undefined]);
    },
    [changeRoute],
  );

  const handleChangePage = useCallback(
    (_event: unknown, newPage: number) => {
      changeRoute({ p: newPage + 1 });
      setSearchData(undefined);
    },
    [changeRoute],
  );
  const tableData = useMemo<RowData[]>(
    () =>
      searchData
        ? searchData.areas.map(({ node }) => ({
            ...node,
            key: node.id,
          }))
        : [],
    [searchData],
  );

  const handleOpenAddArea = useCallback(() => {
    setOpenAddArea(true);
  }, []);

  const handleCloseAddArea = useCallback(() => {
    void refetch();
    setOpenAddArea(false);
  }, [refetch]);

  const handleCloseEditArea = useCallback(() => {
    void refetch();
    setOpenEditArea(false);
    setSelectedRows([]);
  }, [refetch]);

  const handleOpenEditArea = useCallback((currentSelected: RowData) => {
    setSelectedRows([currentSelected]);
    setOpenEditArea(true);
  }, []);

  const renderEdit = useCallback(
    (rowData: RowData) => (
      <ThemeIconButton
        color="primary"
        size="small"
        variant="standard"
        tooltip={t('common:Edit')}
        onClick={() => handleOpenEditArea(rowData)}
      >
        <EditIcon />
      </ThemeIconButton>
    ),
    [handleOpenEditArea, t],
  );

  const handleCloseRemoveDialog = useCallback(
    async (isDeleted) => {
      if (isDeleted && divisionGroup?.id) {
        const areaId = selectedRows.map(({ id }) => id);
        await deleteArea({
          variables: {
            groupId: divisionGroup.id,
            companyId,
            areaId: areaId[0],
          },
        });
      }
      if (isMountedRef.current) setOpenRemoveDialog(false);
    },
    [divisionGroup?.id, isMountedRef, selectedRows, deleteArea, companyId],
  );

  const handleClickRemoveArea = useCallback(
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
            message: t('wifi:This is not a Area, you cannot remove the area from here_'),
          },
        });
      }
      // return;
    },
    [dispatch, t],
  );

  const renderDelete = useCallback(
    (rowData: RowData) => (
      <ThemeIconButton
        color="primary"
        size="small"
        variant="standard"
        tooltip={t('wifi:Remove')}
        onClick={() => handleClickRemoveArea(rowData)}
      >
        <DeleteIcon />
      </ThemeIconButton>
    ),
    [handleClickRemoveArea, t],
  );
  const [areaID, setAreaID] = useState('');

  const columns = useMemo<CustomColumn<RowData>[]>(
    () => [
      {
        title: ' ',
        field: '',
      },
      {
        title: areaID,
        field: 'id',
        textWrap: 'nowrap',
        sortOrder: sortField === AreaSortField.ID ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(AreaSortField.ID, newSortOrder),
      },
      {
        title: t('wifi:Area Name'),
        field: 'name',
        textWrap: 'nowrap',
        sortOrder: sortField === AreaSortField.NAME ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(AreaSortField.NAME, newSortOrder),
      },
      {
        title: t('wifi:Service Start Date'),
        field: 'serviceStartDate',
        textWrap: 'nowrap',
        sortOrder: sortField === AreaSortField.SERVICESTARTDATE ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(AreaSortField.SERVICESTARTDATE, newSortOrder),
      },
      {
        title: t('wifi:Service End Date'),
        field: 'serviceEndDate',
        textWrap: 'nowrap',
        sortOrder: sortField === AreaSortField.SERVICEENDDATE ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(AreaSortField.SERVICEENDDATE, newSortOrder),
      },
      {
        title: '',
        field: 'edit',
        render: renderEdit,
      },
      {
        title: '',
        field: 'delete',
        render: renderDelete,
      },
    ],
    [areaID, getHandleSort, renderDelete, renderEdit, sortField, sortOrder, t],
  );

  useEffect(() => {
    setAreaID(t('wifi:Area ID'));
  }, [t]);

  return (
    <I18nWifiProvider>
      <Guard subject={Subject.WIFI} action={Action.VIEW}>
        {/* {searchData && searchData?.totalCount === 0 && (
          <ErrorPage
            text={t(
              'wifi:There are no functions available_ Please contact the person who invited you for access_',
            )}
            img={<NoPermissionImg />}
          />
        )} */}
        <Container>
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
                  tooltip={t('wifi:Add Area')}
                  color="primary"
                  variant="contained"
                  onClick={handleOpenAddArea}
                >
                  <AddIcon />
                </ThemeIconButton>
                <EditArea
                  type="A"
                  companyId={companyId}
                  open={openAddArea}
                  onClose={handleCloseAddArea}
                />
              </Guard>
            </Grid>

            <Grid item xs={12} className={classes.tableWrapper}>
              <NestedTable
                disabledSelection
                stickyHeader
                columns={columns}
                data={tableData}
                classes={{
                  container:
                    searchData && searchData.totalCount > 0 ? classes.nestedTable : undefined,
                }}
                disableNoDataMessage={!searchData}
              />
              {!searchData && <CircularProgress className={classes.loading} />}
              {searchData && searchData.totalCount > 0 && (
                <ThemeTablePagination
                  rowsPerPageOptions={[5, 10, 15]}
                  count={searchData.totalCount}
                  rowsPerPage={rowsPerPage}
                  page={paramPage - 1}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              )}
            </Grid>
          </Grid>
          {selectedRows.length > 0 && (
            <>
              <Guard subject={Subject.WIFI} action={Action.MODIFY} fallback={null}>
                <EditArea
                  type="E"
                  companyId={companyId}
                  areaId={selectedRows[0].id}
                  open={openEditArea}
                  onClose={handleCloseEditArea}
                />
              </Guard>

              <Guard subject={Subject.WIFI} action={Action.REMOVE} fallback={null}>
                <DeleteAreaDialog
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
            </>
          )}
        </Container>
      </Guard>
    </I18nWifiProvider>
  );
};

export default Area;
