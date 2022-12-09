import { Theme, createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import React, { VoidFunctionComponent, memo, useEffect } from 'react';
import Select from '@material-ui/core/Select';

import { isNumber } from 'city-os-common/src/libs/validators';

import { ListItemDataSource, MultipleSelectType } from '../../libs/type';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      maxWidth: 700,
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
  }),
);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(item: ListItemDataSource, selectedItems: ListItemDataSource[], theme: Theme) {
  return {
    fontWeight:
      selectedItems.indexOf(item) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

interface MultipleSelectProps {
  selectType: MultipleSelectType;
  listTitle?: string | undefined;
  dataSource?: ListItemDataSource[] | undefined;
  selectedItemsTextInput?: string[] | undefined;
  disabledItems?: boolean[] | undefined;
  canUpdateSelectedItemsValueInput?: boolean | undefined;
  // selectedItemsValueInput?: string[] | undefined;
  onChangeSelectedItems?: (selectedList: ListItemDataSource[]) => void | null | undefined;
}

const MultipleSelect: VoidFunctionComponent<MultipleSelectProps> = (props: MultipleSelectProps) => {
  const {
    selectType,
    listTitle,
    dataSource,
    selectedItemsTextInput,
    disabledItems,
    canUpdateSelectedItemsValueInput,
    onChangeSelectedItems,
  } = props;

  const classes = useStyles();
  const theme = useTheme();
  const [selectedItems, setSelectedItems] = React.useState<ListItemDataSource[]>(() => {
    if (selectedItemsTextInput !== undefined && selectedItemsTextInput.length > 0)
      return selectedItemsTextInput as unknown as ListItemDataSource[];
    return [];
  });

  const [canUpdateSelectedItemsValueInputLocal] = React.useState<boolean>(() => {
    if (canUpdateSelectedItemsValueInput !== undefined) return canUpdateSelectedItemsValueInput;
    return true;
  });

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    try {
      setSelectedItems(event.target.value as ListItemDataSource[]);
      if (onChangeSelectedItems !== undefined) {
        if (selectType === MultipleSelectType.DROPDOWN_CHECKBOX_TAG) {
          if (dataSource !== undefined && dataSource.length > 0) {
            let selectedItemsLocal: ListItemDataSource[] = [];
            (event.target.value as ListItemDataSource[]).forEach((selectedItem) => {
              selectedItemsLocal = selectedItemsLocal.concat(
                dataSource.filter((item) => item.text === (selectedItem as unknown as string)),
              );
            });
            onChangeSelectedItems(selectedItemsLocal);
          }
        } else onChangeSelectedItems(event.target.value as ListItemDataSource[]);
      }
    } catch (e) {
      // console.info(e);
    }
  };

  const handleChangeMultiple = (event: React.ChangeEvent<{ value: unknown }>) => {
    const { options } = event.target as HTMLSelectElement;
    const value: ListItemDataSource[] = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push({ value: options[i].value, text: options[i].text, tag: options[i].value });
      }
    }
    setSelectedItems(value);
    if (onChangeSelectedItems !== undefined) onChangeSelectedItems(value);
  };

  useEffect(() => {
    if (canUpdateSelectedItemsValueInputLocal) {
      if (
        selectedItemsTextInput !== undefined &&
        selectedItemsTextInput !== undefined &&
        selectedItemsTextInput.length > 0
      ) {
        setSelectedItems(selectedItemsTextInput as unknown as ListItemDataSource[]);
      } else setSelectedItems([]);
    }
  }, [canUpdateSelectedItemsValueInputLocal, selectedItemsTextInput]);

  return (
    <div>
      {selectType === MultipleSelectType.DROPDOWN_LIST_TAG && (
        <FormControl className={classes.formControl}>
          <InputLabel id={`$("demo-multiple-select-label")`}>{listTitle}</InputLabel>
          <Select
            labelId={`$("demo-multiple-select-label")`}
            id="demo-multiple-select"
            multiple
            value={selectedItems}
            onChange={handleChange}
            input={<Input />}
            MenuProps={MenuProps}
          >
            {dataSource &&
              dataSource.map((item, index) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                  style={getStyles(item, selectedItems, theme)}
                  disabled={
                    disabledItems && disabledItems.length > 0 ? disabledItems[index] : false
                  }
                >
                  {item.text}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      )}
      {selectType === MultipleSelectType.DROPDOWN_CHECKBOX_TAG && (
        <FormControl className={classes.formControl}>
          <InputLabel id={`$("demo-mutiple-checkbox-label")`}>{listTitle}</InputLabel>
          <Select
            labelId={`$("demo-mutiple-checkbox-label")`}
            id="demo-mutiple-checkbox"
            multiple
            value={selectedItems}
            onChange={handleChange}
            input={<Input />}
            renderValue={(selected) => (selected as string[]).join(', ')}
            MenuProps={MenuProps}
          >
            {dataSource &&
              dataSource.map((item, index) => (
                <MenuItem
                  key={item.value}
                  value={item.text}
                  disabled={
                    disabledItems && disabledItems.length > 0 ? disabledItems[index] : false
                  }
                >
                  <Checkbox
                    checked={selectedItems.indexOf(item.text as unknown as ListItemDataSource) > -1}
                    disabled={
                      disabledItems && disabledItems.length > 0 ? disabledItems[index] : false
                    }
                  />
                  <ListItemText primary={item.text} />
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      )}
      {selectType === MultipleSelectType.DROPDOWN_LIST_CHIP && (
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-mutiple-chip-label">{listTitle}</InputLabel>
          <Select
            labelId={`$("demo-mutiple-chip-label")`}
            id="demo-mutiple-chip"
            multiple
            value={selectedItems}
            onChange={handleChange}
            input={<Input id="select-multiple-chip" />}
            renderValue={(selected) =>
              dataSource && dataSource.length >= selectedItems.length ? (
                <div className={classes.chips}>
                  {(selected as string[]).map((value) =>
                    isNumber(parseInt(value, 10)) && parseInt(value, 10) <= dataSource.length ? (
                      <Chip
                        key={value}
                        label={dataSource[parseInt(value, 10)].text}
                        className={classes.chip}
                      />
                    ) : (
                      <div />
                    ),
                  )}
                </div>
              ) : (
                <div className={classes.chips} />
              )
            }
            MenuProps={MenuProps}
          >
            {dataSource &&
              dataSource.map((item, index) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                  style={getStyles(item, selectedItems, theme)}
                  disabled={
                    disabledItems && disabledItems.length > 0 ? disabledItems[index] : false
                  }
                >
                  {item.text}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      )}
      {selectType === MultipleSelectType.NATIVE && (
        <FormControl className={classes.formControl}>
          <InputLabel shrink htmlFor={`$("select-multiple-native")`}>
            {listTitle}
          </InputLabel>
          <Select
            multiple
            native
            value={selectedItems}
            onChange={handleChangeMultiple}
            inputProps={{
              id: 'select-multiple-native',
            }}
          >
            {dataSource &&
              dataSource.map((item, index) => (
                <option
                  key={item.value}
                  value={item.value}
                  disabled={
                    disabledItems && disabledItems.length > 0 ? disabledItems[index] : false
                  }
                >
                  {item.text}
                </option>
              ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
};

export default memo(MultipleSelect);
