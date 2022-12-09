import { makeStyles /* , useTheme */ } from '@material-ui/core/styles';

import { useQuery } from '@apollo/client';
import { useStore } from 'city-os-common/reducers';

import React, { VoidFunctionComponent, memo, useCallback, useEffect, useState } from 'react';

import TransferList from '../common/TransferList';

import I18nProvider from '../I18nESignageProvider';

import useESignageTranslation from '../../hooks/useESignageTranslation';

import { ListItemDataSource, PlayerListItemDataSource } from '../../libs/type';

import {
  GET_PLAYER_DATA,
  GetPlayerDataPayload,
  GetPlayerDataResponse,
} from '../../api/getPlayerData';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    overflow: 'overflow-y',
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
  },
}));

interface PublishTemplateContentProps {
  customListBoxHeight?: number | string;
  selectedESignagePlayers?: ListItemDataSource[] | undefined;
  displayAvailableList?: boolean | undefined;
  width?: number | undefined;
  height?: number | undefined;
  emptyWidth?: number | undefined;
  emptyHeight?: number | undefined;
  setSelectedESignagePlayers?:
    | React.Dispatch<React.SetStateAction<ListItemDataSource[]>>
    | undefined;
  onChangeSelectedItems?: (
    selectedESignagePlayers: ListItemDataSource[],
  ) => void | null | undefined;
}

const ESignagePlayerSelector: VoidFunctionComponent<PublishTemplateContentProps> = (
  props: PublishTemplateContentProps,
) => {
  const {
    customListBoxHeight,
    selectedESignagePlayers,
    displayAvailableList = true,
    width = 330,
    height = 330,
    emptyWidth = 250,
    emptyHeight = 290,
    setSelectedESignagePlayers,
    onChangeSelectedItems,
  } = props;

  const [init, setInit] = useState<boolean>(true);
  const [availablePlayersDataSource, setAvailablePlayersDataSource] = useState<
    ListItemDataSource[] | undefined
  >([]);
  const [selectedPlayersDataSource /* , setSelectedPlayersDataSource */] = useState<
    ListItemDataSource[] | undefined
  >(() => {
    if (selectedESignagePlayers !== undefined) {
      return selectedESignagePlayers;
    }
    return [];
  });

  const classes = useStyles();
  // const theme = useTheme();

  const { t } = useESignageTranslation(['esignage']);

  const {
    userProfile: { permissionGroup },
  } = useStore();

  /* const { refetch: refetchAvailableESignagePlayers } = */ useQuery<
    GetPlayerDataResponse,
    GetPlayerDataPayload
  >(GET_PLAYER_DATA, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      size: 100,
      after: '',
      before: '',
    },
    onCompleted: (playerDataObject) => {
      if (playerDataObject !== undefined) {
        const playerListItemDataSourceTmp = new Array<PlayerListItemDataSource>(
          playerDataObject.getPlayerData.playerDataOutput.length,
        );
        playerDataObject.getPlayerData.playerDataOutput.forEach((value, index, _array) => {
          if (playerListItemDataSourceTmp !== undefined) {
            const playerListItemDataSourceLocal: PlayerListItemDataSource = {
              value: value.playerName,
              text: String().concat(value.name, ' ', '(', value.playerName || '', ')'),
              tag: value.deviceId,
              id: value.id,
              deviceId: value.deviceId,
              desc: value.desc,
              serviceStartDate: value.serviceStartDate,
              serviceEndDate: value.serviceEndDate,
            };
            playerListItemDataSourceTmp[index] = playerListItemDataSourceLocal;
          }
        });

        if (playerListItemDataSourceTmp !== undefined && playerListItemDataSourceTmp.length > 0) {
          let playerListItemDataSourceLocal: ListItemDataSource[] = [];

          for (let i = 0; i < playerListItemDataSourceTmp.length; i += 1) {
            playerListItemDataSourceLocal.push({
              value: playerListItemDataSourceTmp[i].value,
              text: playerListItemDataSourceTmp[i].text,
              tag: playerListItemDataSourceTmp[i].tag,
            });
          }

          if (selectedESignagePlayers !== undefined && selectedESignagePlayers.length > 0) {
            selectedESignagePlayers.forEach((selectedItem, _index, _array) => {
              playerListItemDataSourceLocal = playerListItemDataSourceLocal.filter(
                (availableItem) => availableItem.value !== selectedItem.value,
              );
              setAvailablePlayersDataSource([...playerListItemDataSourceLocal]);
            });
          } else {
            setAvailablePlayersDataSource(playerListItemDataSourceLocal);
          }
        } else setAvailablePlayersDataSource([]);
      }
    },
    onError: (/* error */) => {
      // if (D_DEBUG) console.error(error.graphQLErrors);
    },
    skip: !permissionGroup?.group.id,
  });

  const handleOnChangeSelectedItems = useCallback(
    (selectedListLocal: ListItemDataSource[]) => {
      if (selectedListLocal !== undefined && availablePlayersDataSource !== undefined) {
        if (typeof selectedListLocal.forEach === 'function') {
          let availableListtemp: ListItemDataSource[] = availablePlayersDataSource;

          if (setSelectedESignagePlayers !== undefined)
            setSelectedESignagePlayers([...selectedListLocal]);

          if (onChangeSelectedItems !== undefined) onChangeSelectedItems(selectedListLocal);

          selectedListLocal.forEach((selectedItem, _index, _array) => {
            availableListtemp = availableListtemp.filter(
              (availableItem) => availableItem.value !== selectedItem.value,
            );

            setAvailablePlayersDataSource([...availableListtemp]);
          });
        }
      }
    },
    [availablePlayersDataSource, onChangeSelectedItems, setSelectedESignagePlayers],
  );

  useEffect(() => {
    if (init) {
      if (availablePlayersDataSource !== undefined && availablePlayersDataSource.length > 0) {
        setInit(false);
      }
    }
  }, [availablePlayersDataSource, init]);

  return (
    <I18nProvider>
      <div className={classes.root}>
        <TransferList
          customListBoxHeight={customListBoxHeight}
          availableListTitle={t('Available Devices')}
          selectedListTitle={t('Selected Devices')}
          availableListDataSource={availablePlayersDataSource}
          selectedListDataSource={selectedPlayersDataSource}
          onChangeSelectedItems={handleOnChangeSelectedItems}
          canUpdateDataSource={init}
          width={width}
          height={height}
          emptyWidth={emptyWidth}
          emptyHeight={emptyHeight}
          displayAvailableList={displayAvailableList}
        />
      </div>
    </I18nProvider>
  );
};

export default memo(ESignagePlayerSelector);
