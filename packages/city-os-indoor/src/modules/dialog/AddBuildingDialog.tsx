import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';

import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback, useMemo, useState } from 'react';

import Button from '@material-ui/core/Button';

import { Map as LeafletMapClass } from 'leaflet';
import clsx from 'clsx';

import { DeviceType, IDevice, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';

import { Building, Floor, Query } from '../../libs/type';
import {
  CREATE_BUILDING,
  CreateBuildingPayload,
  CreateBuildingResponse,
  GPSPointInput,
} from '../../api/createBuilding';
import { getAttrByKey } from '../../libs/utils';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';

import DialogProvider, { DialogContextValue, Uploading } from './DialogProvider';
import FixBaseDialog from '../custom/FixBaseDialog';
import Hr from '../common/Hr';
import SetBuildingInfoTab from './tab/SetBuildingInfoTab';
import SetLocationTab from './tab/SetLocationTab';
import ThemeStepper, { IStep } from '../custom/ThemeStepper';
import UploadFloorplanFilesTab from './tab/UploadFloorplanFilesTab';

const useStyles = makeStyles((theme) => ({
  stepper: {
    marginTop: -theme.spacing(1.5),
    width: '70%',
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },

  container: {
    width: '100%',
    display: 'flex',
    flex: 1,
    minHeight: theme.spacing(60),
  },

  footer: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: 55,
    marginTop: theme.spacing(2),
  },

  footerButton: {
    position: 'absolute',
    height: 55,
  },

  previousButton: {
    left: 0,
    width: theme.spacing(18),
  },

  nextButton: {
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: theme.spacing(34.375),
  },
}));

interface AddBuildingDialogProps {
  open: boolean;
  styles?: { root?: string; content?: string };
  onClose: (flag?: boolean) => void;
}

const emptyBuilding: Building = {
  id: '',
  deviceId: '',
  name: '',
  desc: null,
  uri: '',
  type: DeviceType.BUILDING,
  location: { lat: 25.032347285245212, lng: 121.52486085957209 },
  sensors: null,
  groups: [],
  status: null,
  attributes: [{ key: 'building_type', value: 'office' }],
  floors: [],
  timezone: null,
};

const AddBuildingDialog: VoidFunctionComponent<AddBuildingDialogProps> = ({
  open,
  styles,
  onClose,
}: AddBuildingDialogProps) => {
  const classes = useStyles();

  const { t } = useIndoorTranslation(['indoor']);

  const router = useRouter();
  const routerQuery: Query = useMemo(() => router.query, [router.query]);
  const {
    dispatch,
    userProfile: { permissionGroup, joinedGroups },
  } = useStore();

  const [building, setBuilding] = useState<Building | null>(emptyBuilding);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [map, setMap] = useState<LeafletMapClass | null>(null);
  const [address, setAddress] = useState<string>('');
  const [uploadingList, setUploadingList] = useState<Uploading[]>([]);

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      building,
      setBuilding,
      activeStep,
      setActiveStep,
      map,
      setMap,
      address,
      setAddress,
      uploadingList,
      setUploadingList,
    }),
    [building, activeStep, map, address, uploadingList],
  );

  const stepList: IStep[] = [
    {
      key: '1',
      label: t('indoor:Set Location'),
      content: <SetLocationTab />,
    },
    {
      key: '2',
      label: t('indoor:Upload Floorplan Files'),
      content: <UploadFloorplanFilesTab />,
    },
    {
      key: '3',
      label: t('indoor:Set Building Info'),
      content: <SetBuildingInfoTab />,
    },
  ];

  const [createBuilding] = useMutation<CreateBuildingResponse, CreateBuildingPayload>(
    CREATE_BUILDING,
    {
      onCompleted: (data) => {
        if (data.createBuilding) {
          void router.push({
            pathname: `${subjectRoutes[Subject.INDOOR]}/detail/editor`,
            query: {
              deviceId: data.createBuilding,
            },
          });
        } else {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('indoor:Create building failed_'),
            },
          });
        }
      },
      onError: (error) => {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('indoor:Create building failed_'),
          },
        });
        if (D_DEBUG) {
          console.error(error);
        }
      },
    },
  );

  const setTabOffset = useCallback(
    (offset: number) => {
      setActiveStep(activeStep + offset < 0 ? 0 : activeStep + offset);
    },
    [activeStep],
  );

  const handleCreateBuilding = useCallback(async () => {
    const floorInput = (building?.floors || []).map((f: Floor) => ({
      id: f.id,
      name: f.name,
      floorNum: f.floorNum,
      imageLeftTop: f.imageLeftTop,
      imageRightBottom: f.imageRightBottom,
      devices: f.devices.map((d: IDevice) => d.id),
    }));

    // 從建築屬性中取出建築型別
    const currentBuildingType = getAttrByKey(building?.attributes || [], 'building_type');

    // 檢查是否有樓層沒有名稱或是樓層名稱重複
    const floorNumHasEmpty = floorInput.filter((item) => item.floorNum === '').length > 0;
    const floorNumHasDuplicate =
      floorInput.filter(
        (item, index, self) => self.findIndex((s) => s.floorNum === item.floorNum) !== index,
      ).length > 0;

    if (floorNumHasEmpty || floorNumHasDuplicate) {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: `${t('indoor:Floor number is empty or duplicated_')}, ${
            floorNumHasEmpty ? 1 : 0
          }/${floorNumHasDuplicate ? 1 : 0}`,
        },
      });
      return;
    }

    const createTo = routerQuery.gid || permissionGroup?.group.id || routerQuery.pid || '';

    const groupObject = joinedGroups?.find((group) => group.id === createTo);
    if (!groupObject?.projectKey) {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t(`indoor:Can't create a building at this division_`),
        },
      });
      return;
    }

    await createBuilding({
      variables: {
        groupId: createTo,
        buildingInput: {
          name: building?.name || '',
          desc: building?.desc || '',
          floors: floorInput || [],
          location: {
            lat: building?.location?.lat || 0,
            lng: building?.location?.lng || 0,
          } as GPSPointInput,
          buildingType: currentBuildingType?.value || 'office',
        },
      },
    });
  }, [
    building?.attributes,
    building?.desc,
    building?.floors,
    building?.location?.lat,
    building?.location?.lng,
    building?.name,
    createBuilding,
    dispatch,
    permissionGroup?.group.id,
    routerQuery.gid,
    routerQuery.pid,
    t,
    joinedGroups,
  ]);

  return (
    <DialogProvider value={contextValue}>
      <FixBaseDialog
        open={open}
        onClose={() => onClose(false)}
        title={t('indoor:Add a Building')}
        classes={{ dialog: styles?.root, content: styles?.content }}
        titleAlign="center"
        content={
          <div className={classes.content}>
            <div className={classes.stepper}>
              <ThemeStepper stepList={stepList} activeStep={activeStep} />
            </div>
            <div style={{ width: 800, marginTop: 14 }}>
              <Hr />
            </div>

            <div className={classes.container}>{stepList[activeStep].content}</div>

            <div className={classes.footer}>
              {activeStep > 0 && (
                <Button
                  variant="text"
                  color="primary"
                  size="medium"
                  className={clsx(classes.footerButton, classes.previousButton)}
                  onClick={() => setTabOffset(-1)}
                >
                  {t('indoor:Previous')}
                </Button>
              )}
              {!(activeStep >= stepList.length - 1) ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  className={clsx(classes.footerButton, classes.nextButton)}
                  onClick={() => setTabOffset(1)}
                >
                  {t('indoor:Next')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  className={clsx(classes.footerButton, classes.nextButton)}
                  onClick={() => {
                    void handleCreateBuilding();
                  }}
                  disabled={!building?.name || building.floors.length === 0}
                >
                  {t('indoor:Create')}
                </Button>
              )}
            </div>
          </div>
        }
      />
    </DialogProvider>
  );
};

export default AddBuildingDialog;
