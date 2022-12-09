import { makeStyles } from '@material-ui/core/styles';

import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import update from 'immutability-helper';

import { Subject } from 'city-os-common/libs/schema';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';

import DivisionSelector from 'city-os-common/modules/DivisionSelector';

import { Floor, Query } from '../../../libs/type';
import { getAttrByKey } from '../../../libs/utils';
import useIndoorTranslation from '../../../hooks/useIndoorTranslation';

import { useDialogContext } from '../DialogProvider';
import SelectField from '../../common/SelectField';
import UploadedFloorCard from '../../common/UploadedFloorCard';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    padding: theme.spacing(3, 5.5, 0, 5.5),
    gap: theme.spacing(3),
  },

  halfContainer: {
    width: '50%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  halfContainerTitle: {
    height: theme.spacing(4),
    borderBottom:
      theme.palette.type === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.12)'
        : '1px solid rgba(0, 0, 0, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    color: theme.palette.info.main,
    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
    paddingLeft: 14,
    flexShrink: 0,
  },

  halfContainerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    overflowY: 'auto',
    paddingTop: theme.spacing(3),
  },

  cardContainer: {
    gap: theme.spacing(1),
    backgroundColor: theme.palette.type === 'dark' ? '#121a38' : 'rgba(0, 0, 0, 0.05)',
    borderBottom: `1px solid ${
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
    }`,
    padding: theme.spacing(3, 1, 3, 1),
    overflowX: 'hidden',
    height: '100%',
  },

  shortInput: {
    width: '50%',
  },
}));

const SetBuildingInfoTab: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useIndoorTranslation(['indoor', 'common']);
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.INDOOR]);

  const { address, building, setBuilding } = useDialogContext();

  const [buildingType, setBuildingType] = useState<string | null>(null);

  useEffect(() => {
    if (building?.attributes) {
      const currentBuildingType = getAttrByKey(building.attributes, 'building_type');
      if (currentBuildingType) {
        setBuildingType(currentBuildingType.value);
      } else {
        setBuildingType('office');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGroupChange = useCallback(
    (selectedId: string) => {
      changeRoute({ gid: selectedId });
    },
    [changeRoute],
  );

  const debounceSetBuildingName = useMemo(
    () =>
      debounce((name: string) => {
        setBuilding(update(building, { name: { $set: name } }));
      }, 500),
    [building, setBuilding],
  );

  const debounceSetBuildingDescription = useMemo(
    () =>
      debounce((desc: string) => {
        setBuilding(update(building, { desc: { $set: desc } }));
      }, 500),
    [building, setBuilding],
  );

  const debounceSetBuildingType = useMemo(
    () =>
      debounce((ibuildingType: string) => {
        if (building?.attributes) {
          const currentAttributesIndex = building?.attributes.findIndex(
            (attribute) => attribute.key === 'building_type',
          );
          if (currentAttributesIndex > -1) {
            setBuilding(
              update(building, {
                attributes: {
                  [currentAttributesIndex]: {
                    value: { $set: ibuildingType },
                  },
                },
              }),
            );
          } else {
            setBuilding(
              update(building, {
                attributes: {
                  $push: [
                    {
                      key: 'building_type',
                      value: ibuildingType,
                    },
                  ],
                },
              }),
            );
          }
        } else {
          setBuilding(
            update(building, {
              attributes: { $set: [{ key: 'building_type', value: ibuildingType }] },
            }),
          );
        }
      }, 500),
    [building, setBuilding],
  );

  const debounceSetFloorNum = useMemo(
    () =>
      debounce((index: number, floorNum: string) => {
        setBuilding(update(building, { floors: { [index]: { floorNum: { $set: floorNum } } } }));
      }, 16),
    [building, setBuilding],
  );

  const debounceSetFloorName = useMemo(
    () =>
      debounce((index: number, floorName: string) => {
        setBuilding(update(building, { floors: { [index]: { name: { $set: floorName } } } }));
      }, 16),
    [building, setBuilding],
  );

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setBuilding(
        update(building, {
          floors: {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, building?.floors[dragIndex] as Floor],
            ],
          },
        }),
      );
    },
    [building, setBuilding],
  );

  return (
    <div className={classes.root}>
      <div className={classes.halfContainer}>
        <div className={classes.halfContainerTitle}>{t('indoor:Basic info')}</div>
        <div className={classes.halfContainerBody}>
          <DivisionSelector label={t('common:Division')} onChange={handleGroupChange} />
          <TextField
            label={t('indoor:Building Name')}
            placeholder={t('indoor:Insert building name')}
            variant="outlined"
            defaultValue={building?.name}
            onChange={(e) => debounceSetBuildingName(e.target.value)}
            required
          />
          <TextField
            label={t('indoor:Description')}
            placeholder={t('indoor:Insert description')}
            variant="outlined"
            defaultValue={building?.desc}
            onChange={(e) => debounceSetBuildingDescription(e.target.value)}
          />
          {buildingType && (
            <SelectField
              label={t('indoor:Building Type')}
              styles={classes.shortInput}
              defaultValue={buildingType}
              onChange={(e) => debounceSetBuildingType(e.target.value)}
            >
              <MenuItem key="office" value="office">
                {t('indoor:Office')}
              </MenuItem>
              <MenuItem key="hotel" value="hotel">
                {t('indoor:Hotel')}
              </MenuItem>
              <MenuItem key="business" value="business">
                {t('indoor:Business')}
              </MenuItem>
            </SelectField>
          )}
          <TextField
            label={t('indoor:Address')}
            variant="outlined"
            defaultValue={address || ' '}
            disabled
          />
        </div>
      </div>
      <div className={classes.halfContainer}>
        <div className={classes.halfContainerTitle}>{t('indoor:Floor_plural')}</div>
        <div className={clsx(classes.halfContainerBody, classes.cardContainer)}>
          <DndProvider backend={HTML5Backend}>
            {building &&
              building.floors.map((floor: Floor, index: number) => (
                <UploadedFloorCard
                  key={floor.id}
                  floor={floor}
                  index={index}
                  debounceSetFloorNum={debounceSetFloorNum}
                  debounceSetFloorName={debounceSetFloorName}
                  moveCard={moveCard}
                />
              ))}
          </DndProvider>
        </div>
      </div>
    </div>
  );
};

export default memo(SetBuildingInfoTab);
