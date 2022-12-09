import 'date-fns';
import {
  KeyboardDatePicker,
  KeyboardDateTimePicker,
  KeyboardTimePicker,
  DateTimePicker as MuiDateTimePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
// import Grid from '@material-ui/core/Grid';
import React, { memo } from 'react';

import { isDate } from 'city-os-common/src/libs/validators';

import { DateTimePickerType } from '../../libs/type';

import useESignageTranslation from '../../hooks/useESignageTranslation';

interface DateTimePickerProps {
  pickerType: DateTimePickerType;
  inputDate?: Date | null;
  labelName?: string | null | undefined;
  clearable?: boolean | undefined;
  ampm?: boolean | undefined;
  margin?: 'normal' | undefined;
  showTodayButton?: boolean | undefined;
  minDate?: Date | null | undefined;
  maxDate?: Date | null | undefined;
  disablePast?: boolean | undefined;
  error?: boolean | undefined;
  helperText?: string | null | undefined;
  onDateChange?: (date: Date | null) => void | null | undefined;
}

const DateTimePicker: React.VoidFunctionComponent<DateTimePickerProps> = (
  props: DateTimePickerProps,
): JSX.Element | null => {
  const {
    pickerType,
    inputDate,
    labelName,
    clearable,
    ampm,
    margin,
    showTodayButton,
    minDate,
    maxDate,
    disablePast,
    error,
    helperText,
    onDateChange,
  } = props;
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(() => {
    if (inputDate !== undefined && inputDate !== null && isDate(inputDate)) return inputDate;
    return new Date();
  });
  const dateFormat = 'yyyy-MM-dd';
  const datetimeFormat = 'yyyy/MM/dd HH:mm';
  const { t } = useESignageTranslation(['esignage']);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (onDateChange !== undefined) onDateChange(date);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      {/* <Grid container component="form"> */}
      <div style={{ display: 'flex' }}>
        {pickerType === DateTimePickerType.DATE_PICKER_INLINE && (
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format={dateFormat}
            margin={margin}
            id="date-picker-inline"
            label={labelName !== undefined && labelName !== null ? labelName : t('Date Picker')}
            value={selectedDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
            clearable={clearable || false}
            showTodayButton={showTodayButton || false}
            minDate={minDate}
            maxDate={maxDate}
            disablePast={disablePast}
            error={error}
            helperText={helperText}
          />
        )}
        {pickerType === DateTimePickerType.DATE_PICKER_DIALOG && (
          <KeyboardDatePicker
            margin="normal"
            id="date-picker-dialog"
            label={labelName !== undefined && labelName !== null ? labelName : t('Date Picker')}
            format={dateFormat}
            value={selectedDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
            clearable={clearable || false}
            showTodayButton={showTodayButton || false}
            minDate={minDate}
            maxDate={maxDate}
            disablePast={disablePast}
            error={error}
            helperText={helperText}
          />
        )}
        {pickerType === DateTimePickerType.TIME_PICKER && (
          <KeyboardTimePicker
            margin={margin}
            id="time-picker"
            label={labelName !== undefined && labelName !== null ? labelName : t('Time Picker')}
            value={selectedDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change time',
            }}
            clearable={clearable || false}
            ampm={ampm || false}
            showTodayButton={showTodayButton || false}
            error={error}
            helperText={helperText}
          />
        )}
        {pickerType === DateTimePickerType.DATETIME_PICKER_INLINE && (
          <KeyboardDateTimePicker
            margin={margin}
            variant="inline"
            ampm={ampm || false}
            label={labelName !== undefined && labelName !== null ? labelName : t('DateTime Picker')}
            value={selectedDate}
            onChange={handleDateChange}
            // onError={console.log}
            disablePast={disablePast}
            format={datetimeFormat}
            showTodayButton={showTodayButton || false}
            minDate={minDate}
            maxDate={maxDate}
            error={error}
            helperText={helperText}
          />
        )}
        {pickerType === DateTimePickerType.DATETIME_PICKER_DIALOG && (
          <MuiDateTimePicker
            ampm={false}
            value={selectedDate}
            disablePast={disablePast}
            onChange={handleDateChange}
            label={labelName !== undefined && labelName !== null ? labelName : t('DateTime Picker')}
            format={datetimeFormat}
            showTodayButton={showTodayButton || false}
            minDate={minDate}
            maxDate={maxDate}
            error={error}
            helperText={helperText}
          />
        )}
        {/* </Grid> */}
      </div>
    </MuiPickersUtilsProvider>
  );
};

export default memo(DateTimePicker);
