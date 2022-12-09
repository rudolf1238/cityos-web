import * as React from 'react';
import { memo } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useTheme } from '@material-ui/core/styles';
import useESignageTranslation from '../../hooks/useESignageTranslation';

import { ListItemDataSource } from '../../libs/type';

function not(a: ListItemDataSource[], b: ListItemDataSource[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: ListItemDataSource[], b: ListItemDataSource[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a: ListItemDataSource[], b: ListItemDataSource[]) {
  return [...a, ...not(b, a)];
}

interface TransferListProps {
  customListBoxHeight?: number | string;
  availableListTitle?: string | undefined;
  selectedListTitle?: string | undefined;
  displayAvailableList?: boolean | undefined;
  availableListDataSource?: ListItemDataSource[] | undefined;
  selectedListDataSource?: ListItemDataSource[] | undefined;
  width?: number | undefined;
  height?: number | undefined;
  emptyWidth?: number | undefined;
  emptyHeight?: number | undefined;
  canUpdateDataSource?: boolean | undefined;
  onChangeSelectedItems?: (selectedList: ListItemDataSource[]) => void | null | undefined;
}

const TransferList: React.VoidFunctionComponent<TransferListProps> = (props: TransferListProps) => {
  const {
    customListBoxHeight = 305,
    availableListTitle,
    selectedListTitle,
    displayAvailableList = true,
    availableListDataSource,
    selectedListDataSource,
    width,
    height,
    emptyWidth,
    emptyHeight,
    canUpdateDataSource = false,
    onChangeSelectedItems,
  } = props;

  const [checked, setChecked] = React.useState<ListItemDataSource[]>([]);
  const { t } = useESignageTranslation(['esignage']);
  const [listWidth] = React.useState<number>(() => {
    const listWidthLocal = 330;
    if (width !== undefined) {
      return width;
    }
    return listWidthLocal;
  });

  const [listHeight] = React.useState<number>(() => {
    const listHeightLocal = 220;
    if (height !== undefined) {
      return height;
    }
    return listHeightLocal;
  });

  const [emptyListWidth] = React.useState<number>(() => {
    const emptyWidthLocal = 250;
    if (emptyWidth !== undefined) {
      return emptyWidth;
    }
    return emptyWidthLocal;
  });

  const [emptyListHeight] = React.useState<number>(() => {
    const emptyHeightLocal = 220;
    if (emptyHeight !== undefined) {
      return emptyHeight;
    }
    return emptyHeightLocal;
  });

  const [availableListTemp] = React.useState<ListItemDataSource[]>([]);

  const [selectedListTemp] = React.useState<ListItemDataSource[]>([]);

  const [availableList, setAvailableList] = React.useState<ListItemDataSource[]>(
    availableListDataSource || availableListTemp,
  );

  const [selectedList, setSelectedList] = React.useState<ListItemDataSource[]>(
    selectedListDataSource || selectedListTemp,
  );

  const availableListChecked = intersection(checked, availableList);
  const selectedListChecked = intersection(checked, selectedList);
  const listRole = 'list';
  const listitemRole = 'listitem';
  const theme = useTheme();

  const handleToggle = (value: ListItemDataSource) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const numberOfChecked = (items: ListItemDataSource[]) => intersection(checked, items).length;

  const handleToggleAll = (items: ListItemDataSource[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedSelectedList = () => {
    setSelectedList(selectedList.concat(availableListChecked));
    setAvailableList(not(availableList, availableListChecked));
    setChecked(not(checked, availableListChecked));

    if (onChangeSelectedItems !== undefined)
      onChangeSelectedItems(selectedList.concat(availableListChecked));
  };

  const handleCheckedAvailableList = () => {
    setAvailableList(availableList.concat(selectedListChecked));
    setSelectedList(not(selectedList, selectedListChecked));
    setChecked(not(checked, selectedListChecked));
    if (onChangeSelectedItems !== undefined)
      onChangeSelectedItems(not(selectedList, selectedListChecked));
  };

  const customList = (title: React.ReactNode, items: ListItemDataSource[]) => (
    <Card /* style={{ textAlign: 'center' }} */>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={
              (!displayAvailableList && items.length !== 0) ||
              (numberOfChecked(items) === items.length && items.length !== 0)
            }
            indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
            disabled={items.length === 0 || !displayAvailableList}
            inputProps={{
              'aria-label': 'all items selected',
            }}
            style={{
              backgroundColor: theme.palette.type === 'dark' ? '#182245' : '#fff',
              color: theme.palette.type === 'dark' ? '#fff' : undefined,
            }}
          />
        }
        title={title}
        subheader={
          displayAvailableList
            ? `${numberOfChecked(items)}/${items.length} selected`
            : `${items.length}/${items.length} selected`
        }
        subheaderTypographyProps={{ color: theme.palette.type === 'dark' ? '#fff' : undefined }}
        style={{
          backgroundColor: theme.palette.type === 'dark' ? '#182245' : '#fff',
          color: theme.palette.type === 'dark' ? '#fff' : '#182245',

        }}
      />
      <Divider />
      <List
        sx={{
          width: displayAvailableList ? listWidth : emptyListWidth,
          height: displayAvailableList ? listHeight : emptyListHeight,
          bgcolor: 'background.paper',
          overflow: 'auto',
        }}
        dense
        component="div"
        role={listRole}
        style={{
          backgroundColor: theme.palette.type === 'dark' ? '#182245' : '#fff',
          color: theme.palette.type === 'dark' ? '#fff' : undefined,
          height: customListBoxHeight
        }}
      >
        {items.map((item: ListItemDataSource) => {
          const labelId = `transfer-list-all-item-${item.value}-label`;

          return (
            <ListItem
              disabled={!displayAvailableList}
              key={item.value}
              role={listitemRole}
              button
              onClick={handleToggle(item)}
            >
              <ListItemIcon>
                <Checkbox
                  disabled={!displayAvailableList}
                  checked={checked.indexOf(item) !== -1 || !displayAvailableList}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                  style={{
                    backgroundColor: theme.palette.type === 'dark' ? '#182245' : '#fff',
                    color: theme.palette.type === 'dark' ? '#fff' : undefined,
                  }}
                />
              </ListItemIcon>
              {/* <ListItemText id={labelId} primary={`List item ${item.value}`} /> */}
              <ListItemText id={item.value} primary={`${item.text}`} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  React.useEffect(() => {
    // When displayAvailableList === true, the component can only accept the initial incoming dataSource.
    // When displayAvailableList === false or canUpdateDataSource===true, the component can accept external incoming updated dataSource.
    // The displayAvailableList param of component default value is true.

    if (!displayAvailableList || canUpdateDataSource) {
      if (availableListDataSource !== undefined) setAvailableList(availableListDataSource);
      if (selectedListDataSource !== undefined) setSelectedList(selectedListDataSource);
    }
  }, [availableListDataSource, canUpdateDataSource, displayAvailableList, selectedListDataSource]);

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <div
        style={{
          marginTop: displayAvailableList ? '5vh' : 10,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {displayAvailableList && (
          <>
            <Grid item>{customList(availableListTitle || t('Choices'), availableList)}</Grid>
            <Grid item>
              <Grid container direction="column" alignItems="center">
                <Button
                  sx={{ my: 0.5 }}
                  variant="outlined"
                  size="small"
                  onClick={handleCheckedSelectedList}
                  disabled={availableListChecked.length === 0}
                >
                  &gt;
                </Button>
                <Button
                  sx={{ my: 0.5 }}
                  variant="outlined"
                  size="small"
                  onClick={handleCheckedAvailableList}
                  disabled={selectedListChecked.length === 0}
                >
                  &lt;
                </Button>
              </Grid>
            </Grid>
          </>
        )}
        <Grid item>{customList(selectedListTitle || t('Chosen'), selectedList)}</Grid>
      </div>
    </Grid>
  );
};

export default memo(TransferList);
