import {
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  InputLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

import clsx from 'clsx';

import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Box from '@material-ui/core/Box';

import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

import { isArray, isNumber } from 'city-os-common/src/libs/validators';

import moment from 'moment';

import DateTimePicker from '../common/DateTimePicker';
import I18nProvider from '../I18nESignageProvider';
import MultipleSelect from '../common/MultipleSelect';

import TemplateInfo from '../addTemplate/TemplateInfo';

import useESignageTranslation from '../../hooks/useESignageTranslation';

import {
  DateTimePickerType,
  ListItemDataSource,
  MultipleSelectType,
  TemplateSchedule,
} from '../../libs/type';

import ESignagePlayerSelector from './ESignagePlayerSelector';

import NumberInput from '../common/NumberInput';

enum LoopMode {
  Daily,
  Weekly,
  Monthly,
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: `80%`,
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    overflow: 'overflow-y',
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
  },
  adjustTemplateInfoRoot: {
    width: `78%`,
    marginLeft: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginRight: 'auto',
    },
  },
  adjustKanbanBoxHeight: {
    height: 300,
  },
  playerSelectorBox: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(10),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2),
    },
  },
  textFieldMarginBottom: {
    marginBottom: theme.spacing(2),
  },
  textFieldPaddingTop: {
    paddingTop: theme.spacing(2),
  },
  textLeft: {
    textAlign: 'left',
  },
  paperPadding: {
    padding: theme.spacing(1),
  },
  loopModeBox: {
    display: 'flex',
    marginTop: theme.spacing(1),
    width: `100%`,
  },
  loopModeWrapBox: {
    '& label': {
      color: theme.palette.type === 'dark' ? theme.palette.text.primary : theme.palette.info.main,
    },
  },
  loopModeRightBox: {
    width: `70%`,
    height: 152,
    '& label': {
      marginRight: theme.spacing(1),
    },
  },
  frequencyField: {
    paddingTop: theme.spacing(2),
    '& > div': {
      marginRight: theme.spacing(1),
    },
  },
  loopModeMonthlyField: {
    '& label': {
      zIndex: 1,
    },
  },
  publishModeBox: {
    width: `100%`,
    color: theme.palette.type === 'dark' ? theme.palette.text.primary : theme.palette.info.main,
    '& label': {
      color: theme.palette.type === 'dark' ? theme.palette.text.primary : theme.palette.info.main,
    },
  },
  publishModeRadioGroup: {
    width: `33%`,
  },
}));

interface PublishTemplateContentProps {
  templateIndex: number;
  templateId: string;
  templateTypeId: string;
  templateTitle?: string | undefined;
  selectedESignagePlayers?: ListItemDataSource[];
  templateSchedule: TemplateSchedule;
  onTemplateScheduleChanged?: (
    newTemplateScheduleInfo: TemplateSchedule,
  ) => void | null | undefined;
}

const ScheduleAndPublish: VoidFunctionComponent<PublishTemplateContentProps> = (
  props: PublishTemplateContentProps,
) => {
  const {
    templateIndex,
    templateId,
    templateTypeId,
    templateTitle,
    selectedESignagePlayers,
    templateSchedule,
    onTemplateScheduleChanged,
  } = props;

  const { t } = useESignageTranslation(['esignage']);
  const classes = useStyles();
  const [displayLoopModePanel, setDisplayLoopModePanel] = useState<boolean[]>([true, false, false]);
  const [displayPublishModePanel, setDisplayPublishModePanel] = useState<boolean[]>([true, false]);
  const handleInitTemplateSchedule = useCallback(
    (templateIdLocal: string | null | undefined): TemplateSchedule => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const timeZone = new Date().getTimezoneOffset() / -60;

      return {
        templateId: templateIdLocal || '',
        scheduleId: '',
        scheduleName: t('Schedule'),
        playStartDate: startDate,
        playEndDate: endDate,
        playStartTime: startDate.toLocaleString(
          typeof window !== 'undefined' && window.navigator !== undefined && navigator !== null
            ? navigator.language
            : 'zh-TW',
          { hour12: false },
        ), // startDate.toTimeString(),
        playEndTime: endDate.toLocaleString(
          typeof window !== 'undefined' && navigator !== undefined && navigator !== null
            ? navigator.language
            : 'zh-TW',
          { hour12: false },
        ), // endDate.toTimeString(),
        loopMode: 'D',
        dailyFrequency: 1,
        weeklyFrequency: null,
        monthlyFrequency_Month: null,
        monthlyFrequency_Day: null,
        audioSetting: 100,
        downloadDirectly: true,
        scheduledDownloadTime: null,
        players: [],
        publishedTimeZone:
          timeZone >= 0 ? String().concat('+', timeZone.toString()) : timeZone.toString(),
      };
    },
    [t],
  );
  const templateScheduleInfoCopy = useRef<TemplateSchedule | undefined>(templateSchedule);
  const [templateScheduleInfo, setTemplateScheduleInfo] = useState<TemplateSchedule>(
    (): TemplateSchedule => {
      if (
        templateSchedule !== undefined &&
        templateSchedule.players !== undefined &&
        templateSchedule.players?.length !== undefined &&
        templateSchedule.players?.length > 0
      ) {
        switch (templateSchedule.loopMode) {
          case 'D':
            setDisplayLoopModePanel([true, false, false]);
            break;
          case 'W':
            setDisplayLoopModePanel([false, true, false]);
            break;
          case 'M':
            setDisplayLoopModePanel([false, false, true]);
            break;
          default:
            setDisplayLoopModePanel([true, false, false]);
            break;
        }

        switch (templateSchedule.downloadDirectly) {
          case true:
            setDisplayPublishModePanel([true, false]);
            break;
          case false:
            setDisplayPublishModePanel([false, true]);
            break;
          default:
            setDisplayPublishModePanel([true, false]);
            break;
        }

        return templateSchedule;
      }

      const templateScheduleInfoLocal: TemplateSchedule = handleInitTemplateSchedule(templateId);
      return templateScheduleInfoLocal;
    },
  );
  const [publishMode, setPublishMode] = useState<string>(() => {
    if (templateScheduleInfo !== undefined) {
      if (templateScheduleInfo.downloadDirectly === true) return 'I';
      return 'S';
    }
    return 'I';
  });
  const monthsDataSource = useMemo<ListItemDataSource[]>(
    () => [
      { value: '0', text: t('January'), tag: '0' },
      { value: '1', text: t('February'), tag: '1' },
      { value: '2', text: t('March'), tag: '2' },
      { value: '3', text: t('April'), tag: '3' },
      { value: '4', text: t('May'), tag: '4' },
      { value: '5', text: t('June'), tag: '5' },
      { value: '6', text: t('July'), tag: '6' },
      { value: '7', text: t('August'), tag: '7' },
      { value: '8', text: t('September'), tag: '8' },
      { value: '9', text: t('October'), tag: '9' },
      { value: '10', text: t('November'), tag: '10' },
      { value: '11', text: t('December'), tag: '11' },
    ],
    [t],
  );
  const [weekDaysState, setWeekDaysState] = useState<boolean[]>(() => {
    const weekDaysStateLocal = [false, false, false, false, false, false, false];
    if (
      templateScheduleInfo !== undefined &&
      templateScheduleInfo.weeklyFrequency !== null &&
      templateScheduleInfo.weeklyFrequency.length > 0
    ) {
      for (let i = 0; i < templateScheduleInfo.weeklyFrequency.length; i += 1) {
        const index = parseInt(templateScheduleInfo.weeklyFrequency[i], 10);
        weekDaysStateLocal[index] = true;
      }
    }
    return weekDaysStateLocal;
  });

  const daysDataSource = useMemo<ListItemDataSource[]>(() => {
    const days: ListItemDataSource[] = [];
    for (let i = 1; i <= 31; i += 1) {
      days.push({ value: i.toString(), text: i.toString(), tag: i.toString() });
    }
    return days;
  }, []);

  const [monthlyFrequencyMonthTextInput, setMonthlyFrequencyMonthTextInput] = useState<
    string[] /* ListItemDataSource[] */
  >(() => {
    if (
      templateScheduleInfo !== undefined &&
      templateScheduleInfo.monthlyFrequency_Month !== null &&
      templateScheduleInfo.monthlyFrequency_Month.length > 0
    ) {
      if (monthsDataSource !== undefined && monthsDataSource.length > 0) {
        const selectedItemsTextInput: string[] /* ListItemDataSource[] */ = [];
        for (let i = 0; i < templateScheduleInfo.monthlyFrequency_Month.length; i += 1) {
          const itemData: string /* ListItemDataSource */ | undefined = monthsDataSource.find(
            (item) => {
              if (templateScheduleInfo.monthlyFrequency_Month !== null) {
                return item.value === templateScheduleInfo.monthlyFrequency_Month[i];
              }
              return false;
            },
          )?.text;

          // selectedItemsInput.push({
          //   value: i.toString(),
          //   text: itemData ? itemData.text : '',
          //   tag: i.toString(),
          // });
          if (itemData) selectedItemsTextInput.push(itemData || '');
        }
        return selectedItemsTextInput;
      }
    }
    return [];
  });

  const [monthlyFrequencyDayTextInput, setMonthlyFrequencyDayTextInput] = useState<
    string[] /* ListItemDataSource[] */
  >(() => {
    if (
      templateScheduleInfo !== undefined &&
      templateScheduleInfo.monthlyFrequency_Day !== null &&
      templateScheduleInfo.monthlyFrequency_Day.length > 0
    ) {
      if (daysDataSource !== undefined && daysDataSource.length > 0) {
        const selectedItemsDayTextInput: string[] /* ListItemDataSource[] */ = [];
        for (let i = 0; i < templateScheduleInfo.monthlyFrequency_Day.length; i += 1) {
          const itemData: string /* ListItemDataSource */ | undefined = daysDataSource.find(
            (item) => {
              if (templateScheduleInfo.monthlyFrequency_Day !== null) {
                return item.value === templateScheduleInfo.monthlyFrequency_Day[i];
              }
              return false;
            },
          )?.text;

          // selectedItemsInput.push({
          //   value: i.toString(),
          //   text: itemData ? itemData.text : '',
          //   tag: i.toString(),
          // });
          if (itemData) selectedItemsDayTextInput.push(itemData || '');
        }
        return selectedItemsDayTextInput;
      }
    }
    return [];
  });

  const checkWeekDaysCheckBoxDisabled = (
    startDateInput: moment.Moment,
    endDateInput: moment.Moment,
  ): boolean[] => {
    let weekDaysCheckBoxDisabledLocal: boolean[] = [true, true, true, true, true, true, true];
    if (
      startDateInput !== undefined &&
      startDateInput !== null &&
      endDateInput !== undefined &&
      endDateInput !== null
    ) {
      const daysDiff = endDateInput?.diff(startDateInput, 'days');
      if (daysDiff !== undefined && daysDiff !== null) {
        if (daysDiff >= 6) {
          weekDaysCheckBoxDisabledLocal = [false, false, false, false, false, false, false];
          return weekDaysCheckBoxDisabledLocal;
        }
        if (daysDiff >= 0 && daysDiff < 6) {
          const weekDaysStateLocal: boolean[] = [...weekDaysState];
          for (let i = 0; i < daysDiff + 1; i += 1) {
            const startDateInputLocal = startDateInput.clone();
            const index = startDateInputLocal.add(i, 'days').weekday();
            weekDaysCheckBoxDisabledLocal[index] = false;
          }
          ///
          for (let i = 0; i <= 6; i += 1) {
            if (weekDaysCheckBoxDisabledLocal[i] === false) {
              weekDaysStateLocal[i] = true;
            } else {
              weekDaysStateLocal[i] = false;
            }
          }
          setWeekDaysState(weekDaysStateLocal);
          ///
        }
      }
    }
    return weekDaysCheckBoxDisabledLocal;
  };

  const [weekDaysCheckBoxDisabled, setWeekDaysCheckBoxDisabled] = useState<boolean[]>(() => {
    if (
      templateScheduleInfo !== undefined &&
      templateScheduleInfo.playStartDate !== null &&
      templateScheduleInfo.playEndDate !== null
    ) {
      const startDateLocal = moment(templateScheduleInfo.playStartDate);
      const endDateLocal = moment(templateScheduleInfo.playEndDate);
      return checkWeekDaysCheckBoxDisabled(startDateLocal, endDateLocal);
    }

    return [true, true, true, true, true, true, true];
  });

  const checkMonthlyFrequencyMonthCheckBoxDisabled = (
    startDateInput: moment.Moment,
    endDateInput: moment.Moment,
  ): boolean[] => {
    let monthlyFrequencyMonthCheckBoxDisabledLocal: boolean[] = [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ];

    if (
      startDateInput !== undefined &&
      startDateInput !== null &&
      endDateInput !== undefined &&
      endDateInput !== null
    ) {
      const daysDiff = endDateInput?.diff(startDateInput, 'months');
      if (daysDiff !== undefined && daysDiff !== null) {
        if (daysDiff >= 11) {
          monthlyFrequencyMonthCheckBoxDisabledLocal = [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
          ];
          return monthlyFrequencyMonthCheckBoxDisabledLocal;
        }
        if (daysDiff >= 0 && daysDiff < 11) {
          for (let i = 0; i < daysDiff + 1; i += 1) {
            const startDateInputLocal = startDateInput.clone();
            const index = startDateInputLocal.add(i, 'months').month();
            monthlyFrequencyMonthCheckBoxDisabledLocal[index] = false;
          }
          ///
          const startDateInputLocal = startDateInput.clone();
          const startMonth = startDateInput.month();
          const endMonth = endDateInput.month();
          if (endMonth - startMonth === daysDiff + 1) {
            const index = startDateInputLocal.add(1, 'months').month();
            monthlyFrequencyMonthCheckBoxDisabledLocal[index] = false;
          }
          ///
        }
      }
    }

    return monthlyFrequencyMonthCheckBoxDisabledLocal;
  };

  const [monthlyFrequencyMonthCheckBoxDisabled, setMonthlyFrequencyMonthCheckBoxDisabled] =
    useState<boolean[]>(() => {
      if (
        templateScheduleInfo !== undefined &&
        templateScheduleInfo.playStartDate !== null &&
        templateScheduleInfo.playEndDate !== null
      ) {
        const startDateLocal = moment(templateScheduleInfo.playStartDate);
        const endDateLocal = moment(templateScheduleInfo.playEndDate);
        return checkMonthlyFrequencyMonthCheckBoxDisabled(startDateLocal, endDateLocal);
      }

      return [true, true, true, true, true, true, true, true, true, true, true, true];
    });

  const getMaxDaysInMonth = (startDateInput: moment.Moment, endDateInput: moment.Moment) => {
    const monthsDiff = endDateInput?.diff(startDateInput, 'months');
    if (monthsDiff === 0) return startDateInput.daysInMonth();

    let maxDaysInMonth = 0;
    if (monthsDiff > 0) {
      for (let i = 0; i <= monthsDiff; i += 1) {
        const tempMaxDaysInMonth = startDateInput.add(i, 'months').daysInMonth();
        if (tempMaxDaysInMonth > maxDaysInMonth) maxDaysInMonth = tempMaxDaysInMonth;
        if (maxDaysInMonth === 31) break;
      }
    }
    return maxDaysInMonth;
  };

  const checkMonthlyFrequencyDayCheckBoxDisabled = (
    startDateInput: moment.Moment,
    endDateInput: moment.Moment,
  ): boolean[] => {
    let monthlyFrequencyDayCheckBoxDisabledLocal: boolean[] = [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ];

    if (
      startDateInput !== undefined &&
      startDateInput !== null &&
      endDateInput !== undefined &&
      endDateInput !== null
    ) {
      const daysDiff = endDateInput?.diff(startDateInput, 'days');
      const daysDiff2 = endDateInput?.diff(startDateInput, 'months');
      if (
        daysDiff !== undefined &&
        daysDiff !== null &&
        daysDiff2 !== undefined &&
        daysDiff2 !== null
      ) {
        if (daysDiff2 > 0 /* && daysDiff >= 30 */) {
          monthlyFrequencyDayCheckBoxDisabledLocal = [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
          ];

          const maxMaxDaysInMonth = getMaxDaysInMonth(startDateInput, endDateInput);
          if (maxMaxDaysInMonth > 0) {
            for (let x = 31; x > maxMaxDaysInMonth; x -= 1) {
              monthlyFrequencyDayCheckBoxDisabledLocal[x - 1] = true;
            }
          }
          return monthlyFrequencyDayCheckBoxDisabledLocal;
        }
        // console.info('daysDiff:', daysDiff);
        // console.info('daysDiff2:', daysDiff2);
        if (daysDiff >= 0 && daysDiff < 31) {
          for (let i = 0; i <= daysDiff; i += 1) {
            const startDateInputLocal = startDateInput.clone();
            // console.info('i:', i);
            // console.info('date:', startDateInputLocal.add(i, 'days').date());
            const index = startDateInputLocal.add(i, 'days').date() - 1;
            // console.info('index:', index);
            if (index > -1 && index < monthlyFrequencyDayCheckBoxDisabledLocal.length)
              monthlyFrequencyDayCheckBoxDisabledLocal[index] = false;
          }
        }
      }
    }

    return monthlyFrequencyDayCheckBoxDisabledLocal;
  };

  const [monthlyFrequencyDayCheckBoxDisabled, setMonthlyFrequencyDayCheckBoxDisabled] = useState<
    boolean[]
  >(() => {
    if (
      templateScheduleInfo !== undefined &&
      templateScheduleInfo.playStartDate !== null &&
      templateScheduleInfo.playEndDate !== null
    ) {
      const startDateLocal = moment(templateScheduleInfo.playStartDate);
      const endDateLocal = moment(templateScheduleInfo.playEndDate);
      return checkMonthlyFrequencyDayCheckBoxDisabled(startDateLocal, endDateLocal);
    }

    return [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ];
  });

  const theme2 = useTheme();

  const handleScheduleNameChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setTemplateScheduleInfo({ ...templateScheduleInfo, scheduleName: e.target.value });
    },
    [templateScheduleInfo],
  );

  const handleOnScheduledPublishDateTimeChange = (newValue: Date | null) => {
    if (newValue !== undefined) {
      setTemplateScheduleInfo({ ...templateScheduleInfo, scheduledDownloadTime: newValue });
    }
  };

  const handleSetMonthlyFrequencyMonthTextInput = (
    monthlyFrequencyMonthCheckBoxDisabledLocal: boolean[],
  ): string[] => {
    const monthlyFrequencyMonthLocal: string[] = [];

    if (
      templateScheduleInfo !== undefined &&
      templateScheduleInfo.monthlyFrequency_Month !== null &&
      templateScheduleInfo.monthlyFrequency_Month.length > 0
    ) {
      if (monthsDataSource !== undefined && monthsDataSource.length > 0) {
        const selectedItemsTextInput: string[] /* ListItemDataSource[] */ = [];

        for (let i = 0; i < templateScheduleInfo.monthlyFrequency_Month.length; i += 1) {
          const itemData: string /* ListItemDataSource */ | undefined = monthsDataSource.find(
            (item) => {
              if (templateScheduleInfo.monthlyFrequency_Month !== null) {
                if (
                  monthlyFrequencyMonthCheckBoxDisabledLocal[
                    parseInt(templateScheduleInfo.monthlyFrequency_Month[i], 10)
                  ] === false
                ) {
                  if (
                    !monthlyFrequencyMonthLocal.includes(
                      templateScheduleInfo.monthlyFrequency_Month[i],
                    )
                  )
                    monthlyFrequencyMonthLocal.push(templateScheduleInfo.monthlyFrequency_Month[i]);
                  ///
                  return item.value === templateScheduleInfo.monthlyFrequency_Month[i];
                }
              }
              return false;
            },
          )?.text;
          if (itemData) selectedItemsTextInput.push(itemData || '');
        }
        setMonthlyFrequencyMonthTextInput(selectedItemsTextInput);

        if (
          templateScheduleInfoCopy !== undefined &&
          templateScheduleInfoCopy.current !== undefined
        ) {
          templateScheduleInfoCopy.current = {
            ...templateScheduleInfo,
            monthlyFrequency_Month: monthlyFrequencyMonthLocal,
          };
        }
      }
    }

    return monthlyFrequencyMonthLocal;
  };

  const handleSetMonthlyFrequencyDayTextInput = (
    monthlyFrequencyDayCheckBoxDisabledLocal: boolean[],
  ): string[] => {
    const monthlyFrequencyDayLocal: string[] = [];

    if (
      templateScheduleInfo !== undefined &&
      templateScheduleInfo.monthlyFrequency_Day !== null &&
      templateScheduleInfo.monthlyFrequency_Day.length > 0
    ) {
      if (daysDataSource !== undefined && daysDataSource.length > 0) {
        const selectedItemsDayTextInput: string[] /* ListItemDataSource[] */ = [];
        for (let i = 0; i < templateScheduleInfo.monthlyFrequency_Day.length; i += 1) {
          const itemData: string /* ListItemDataSource */ | undefined = daysDataSource.find(
            (item) => {
              if (templateScheduleInfo.monthlyFrequency_Day !== null) {
                if (
                  monthlyFrequencyDayCheckBoxDisabledLocal[
                    parseInt(templateScheduleInfo.monthlyFrequency_Day[i], 10) - 1
                  ] === false
                ) {
                  if (
                    !monthlyFrequencyDayLocal.includes(templateScheduleInfo.monthlyFrequency_Day[i])
                  )
                    monthlyFrequencyDayLocal.push(templateScheduleInfo.monthlyFrequency_Day[i]);
                  ///
                  return item.value === templateScheduleInfo.monthlyFrequency_Day[i];
                }
              }
              return false;
            },
          )?.text;

          if (itemData) selectedItemsDayTextInput.push(itemData || '');
        }
        setMonthlyFrequencyDayTextInput(selectedItemsDayTextInput);

        // if (templateScheduleInfo !== undefined) {
        //   setTemplateScheduleInfo({
        //     ...templateScheduleInfo,
        //     monthlyFrequency_Day: monthlyFrequencyDayLocal,
        //   });
        // }

        if (
          templateScheduleInfoCopy !== undefined &&
          templateScheduleInfoCopy.current !== undefined
        ) {
          templateScheduleInfoCopy.current = {
            ...templateScheduleInfo,
            monthlyFrequency_Day: monthlyFrequencyDayLocal,
          };
        }
      }
    }

    return monthlyFrequencyDayLocal;
  };

  const handleOnStartDateChange = (newValue: Date | null) => {
    const startDateLocal = moment(newValue);
    const endDateLocal = moment(templateScheduleInfo.playEndDate);
    const weekDaysCheckBoxDisabledLocal: boolean[] = checkWeekDaysCheckBoxDisabled(
      startDateLocal,
      endDateLocal,
    );
    const monthlyFrequencyMonthCheckBoxDisabledLocal: boolean[] =
      checkMonthlyFrequencyMonthCheckBoxDisabled(startDateLocal, endDateLocal);
    const monthlyFrequencyDayCheckBoxDisabledLocal: boolean[] =
      checkMonthlyFrequencyDayCheckBoxDisabled(startDateLocal, endDateLocal);

    setWeekDaysCheckBoxDisabled(weekDaysCheckBoxDisabledLocal);
    setMonthlyFrequencyMonthCheckBoxDisabled(monthlyFrequencyMonthCheckBoxDisabledLocal);
    setMonthlyFrequencyDayCheckBoxDisabled(monthlyFrequencyDayCheckBoxDisabledLocal);

    const monthlyFrequencyMonthLocal: string[] = handleSetMonthlyFrequencyMonthTextInput(
      monthlyFrequencyMonthCheckBoxDisabledLocal,
    );
    const monthlyFrequencyDayLocal: string[] = handleSetMonthlyFrequencyDayTextInput(
      monthlyFrequencyDayCheckBoxDisabledLocal,
    );

    if (newValue !== undefined && monthlyFrequencyMonthLocal !== null /* && newValue !== null */) {
      if (templateScheduleInfo !== undefined) {
        setTemplateScheduleInfo({
          ...templateScheduleInfo,
          monthlyFrequency_Month: monthlyFrequencyMonthLocal,
          monthlyFrequency_Day: monthlyFrequencyDayLocal,
          playStartDate: newValue,
        });
      }
    }
  };

  const handleOnEndDateChange = (newValue: Date | null) => {
    const startDateLocal = moment(templateScheduleInfo.playStartDate);
    const endDateLocal = moment(newValue);
    const weekDaysCheckBoxDisabledLocal: boolean[] = checkWeekDaysCheckBoxDisabled(
      startDateLocal,
      endDateLocal,
    );
    const monthlyFrequencyMonthCheckBoxDisabledLocal: boolean[] =
      checkMonthlyFrequencyMonthCheckBoxDisabled(startDateLocal, endDateLocal);
    const monthlyFrequencyDayCheckBoxDisabledLocal: boolean[] =
      checkMonthlyFrequencyDayCheckBoxDisabled(startDateLocal, endDateLocal);

    setWeekDaysCheckBoxDisabled(weekDaysCheckBoxDisabledLocal);
    setMonthlyFrequencyMonthCheckBoxDisabled(monthlyFrequencyMonthCheckBoxDisabledLocal);
    setMonthlyFrequencyDayCheckBoxDisabled(monthlyFrequencyDayCheckBoxDisabledLocal);

    // handleSetMonthlyFrequencyMonthTextInput(monthlyFrequencyMonthCheckBoxDisabledLocal);

    const monthlyFrequencyMonthLocal: string[] = handleSetMonthlyFrequencyMonthTextInput(
      monthlyFrequencyMonthCheckBoxDisabledLocal,
    );

    // handleSetMonthlyFrequencyDayTextInput(monthlyFrequencyDayCheckBoxDisabledLocal);

    const monthlyFrequencyDayLocal: string[] = handleSetMonthlyFrequencyDayTextInput(
      monthlyFrequencyDayCheckBoxDisabledLocal,
    );

    // if (newValue !== undefined) {
    //   setTemplateScheduleInfo({ ...templateScheduleInfo, playEndDate: newValue });
    // }

    if (newValue !== undefined && monthlyFrequencyMonthLocal !== null /* && newValue !== null */) {
      if (templateScheduleInfo !== undefined) {
        setTemplateScheduleInfo({
          ...templateScheduleInfo,
          monthlyFrequency_Month: monthlyFrequencyMonthLocal,
          monthlyFrequency_Day: monthlyFrequencyDayLocal,
          playEndDate: newValue,
        });
      }
    }
  };

  const handleOnStartTimeChange = (newValue: Date | null) => {
    if (newValue !== undefined && newValue !== null) {
      const playStartDateLocal =
        templateScheduleInfo.playStartDate
          ?.toLocaleString(navigator && navigator.language, { hour12: false })
          .split(' ')[0] || templateScheduleInfo.playStartTime.split(' ')[0];
      const playStartTimeLocal = newValue
        .toLocaleString(navigator && navigator.language, { hour12: false })
        .split(' ')[1];

      const playStartTime = String()
        .concat(playStartDateLocal, ' ', playStartTimeLocal)
        .replace(' 24:', ' 00:');

      //  console.info('ScheduleAndPublish: playStartTime =>', playStartTime);

      setTemplateScheduleInfo({
        ...templateScheduleInfo,
        playStartTime,
      });
    }
  };

  const handleOnEndTimeChange = (newValue: Date | null) => {
    if (newValue !== undefined && newValue !== null) {
      const playEndDateLocal =
        templateScheduleInfo.playStartDate
          ?.toLocaleString(navigator && navigator.language, { hour12: false })
          .split(' ')[0] || templateScheduleInfo.playStartTime.split(' ')[0];
      const playEndTimeLocal = newValue
        .toLocaleString(navigator && navigator.language, { hour12: false })
        .split(' ')[1];

      const playEndTime = String()
        .concat(playEndDateLocal, ' ', playEndTimeLocal)
        .replace(' 24:', ' 00:');

      // console.info('ScheduleAndPublish: playEndTime =>', playEndTime);

      setTemplateScheduleInfo({
        ...templateScheduleInfo,
        playEndTime,
      });
    }
  };

  const handleAudioChanged = (event: Event, newValue: number | number[], _activeThumb: number) => {
    if (newValue !== undefined && newValue !== null) {
      setTemplateScheduleInfo({
        ...templateScheduleInfo,
        audioSetting: isArray(newValue) ? newValue[0] : newValue,
      });
    }
  };

  const handleChangeLoopMode = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (templateScheduleInfo !== undefined && value !== undefined && value !== null) {
      switch (value) {
        case 'D':
          if (
            templateScheduleInfoCopy !== undefined &&
            templateScheduleInfoCopy.current !== undefined &&
            value === templateScheduleInfoCopy.current.loopMode &&
            templateId !== ''
          ) {
            setTemplateScheduleInfo({
              ...templateScheduleInfo,
              loopMode: value,
              dailyFrequency: templateScheduleInfoCopy.current.dailyFrequency,
              weeklyFrequency: null,
              monthlyFrequency_Month: null,
              monthlyFrequency_Day: null,
            });
          } else {
            setTemplateScheduleInfo({
              ...templateScheduleInfo,
              loopMode: value,
              dailyFrequency: 1,
              weeklyFrequency: null,
              monthlyFrequency_Month: null,
              monthlyFrequency_Day: null,
            });
          }

          setDisplayLoopModePanel([true, false, false]);
          break;
        case 'W':
          if (
            templateScheduleInfoCopy !== undefined &&
            templateScheduleInfoCopy.current !== undefined &&
            value === templateScheduleInfoCopy.current.loopMode &&
            templateId !== ''
          ) {
            setTemplateScheduleInfo({
              ...templateScheduleInfo,
              loopMode: value,
              dailyFrequency: null,
              weeklyFrequency: templateScheduleInfoCopy.current.weeklyFrequency,
              monthlyFrequency_Month: null,
              monthlyFrequency_Day: null,
            });
          } else {
            setWeekDaysState([false, false, false, false, false, false, false]);
            setTemplateScheduleInfo({
              ...templateScheduleInfo,
              loopMode: value,
              dailyFrequency: null,
              weeklyFrequency: null,
              monthlyFrequency_Month: null,
              monthlyFrequency_Day: null,
            });
          }

          setDisplayLoopModePanel([false, true, false]);
          break;
        case 'M':
          if (
            templateScheduleInfoCopy !== undefined &&
            templateScheduleInfoCopy.current !== undefined &&
            value === templateScheduleInfoCopy.current.loopMode &&
            templateId !== ''
          ) {
            setTemplateScheduleInfo({
              ...templateScheduleInfo,
              loopMode: value,
              dailyFrequency: null,
              weeklyFrequency: null,
              monthlyFrequency_Month: templateScheduleInfoCopy.current.monthlyFrequency_Month,
              monthlyFrequency_Day: templateScheduleInfoCopy.current.monthlyFrequency_Day,
            });
          } else {
            setMonthlyFrequencyMonthTextInput([]);
            setMonthlyFrequencyDayTextInput([]);
            setTemplateScheduleInfo({
              ...templateScheduleInfo,
              loopMode: value,
              dailyFrequency: null,
              weeklyFrequency: null,
              monthlyFrequency_Month: null,
              monthlyFrequency_Day: null,
            });
          }
          setDisplayLoopModePanel([false, false, true]);
          break;

        default:
          break;
      }
    } else {
      switch (value) {
        case 'D':
          setDisplayLoopModePanel([true, false, false]);
          break;
        case 'W':
          setDisplayLoopModePanel([false, true, false]);
          break;
        case 'M':
          setDisplayLoopModePanel([false, false, true]);
          break;
        default:
          setDisplayLoopModePanel([true, false, false]);
          break;
      }
    }
  };

  const handleChangePublishMode = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value !== undefined && value !== null) {
      setPublishMode(value);

      switch (value) {
        case 'I':
          if (templateScheduleInfo !== undefined) {
            setTemplateScheduleInfo({ ...templateScheduleInfo, downloadDirectly: true });
          }
          setDisplayPublishModePanel([true, false]);
          break;
        case 'S':
          if (templateScheduleInfo !== undefined) {
            setTemplateScheduleInfo({ ...templateScheduleInfo, downloadDirectly: false });
          }
          setDisplayPublishModePanel([false, true]);
          break;
        default:
          if (templateScheduleInfo !== undefined) {
            setTemplateScheduleInfo({ ...templateScheduleInfo, downloadDirectly: true });
          }
          setDisplayPublishModePanel([true, false]);
          break;
      }
    }

    if (onTemplateScheduleChanged !== undefined) {
      if (templateScheduleInfo.playStartTime === '24:00:00')
        templateScheduleInfo.playStartTime = '00:00:00';

      if (templateScheduleInfo.playEndTime === '24:00:00')
        templateScheduleInfo.playEndTime = '00:00:00';

      const tempPlayStartTime: string[] = templateScheduleInfo.playStartTime
        .split(' ')[1]
        .split(':');
      if (tempPlayStartTime[0] === '24')
        templateScheduleInfo.playStartTime = String().concat(
          templateScheduleInfo.playStartTime.split(' ')[0],
          ' ',
          '00',
          ':',
          tempPlayStartTime[1],
          ':',
          tempPlayStartTime[2],
        );

      const tempPlayEndTime: string[] = templateScheduleInfo.playEndTime.split(' ')[1].split(':');
      if (tempPlayEndTime[0] === '24')
        templateScheduleInfo.playEndTime = String().concat(
          // templateScheduleInfo.playEndTime.split(' ')[0],
          templateScheduleInfo.playStartTime.split(' ')[0],
          ' ',
          '00',
          ':',
          tempPlayEndTime[1],
          ':',
          tempPlayEndTime[2],
        );

      onTemplateScheduleChanged(templateScheduleInfo);
    }
  };

  const handleChangeWeekDay = useCallback(
    (index: number, checked: boolean) => {
      if (index !== undefined && index >= 0 && checked !== undefined) {
        if (templateScheduleInfo !== undefined) {
          let weeklyFrequencyLocal: string[] | null = [];
          if (
            templateScheduleInfo.weeklyFrequency !== undefined &&
            templateScheduleInfo.weeklyFrequency !== null
          ) {
            if (templateScheduleInfo.weeklyFrequency.length > 0) {
              for (let i = 0; i < templateScheduleInfo.weeklyFrequency.length; i += 1) {
                weeklyFrequencyLocal.push(templateScheduleInfo.weeklyFrequency[i]);
              }
            }
            if (checked === true) {
              if (!weeklyFrequencyLocal.includes(index.toString()))
                weeklyFrequencyLocal.push(index.toString());
            } else if (checked === false) {
              if (weeklyFrequencyLocal.includes(index.toString()))
                weeklyFrequencyLocal.splice(weeklyFrequencyLocal.indexOf(index.toString()), 1);
              if (weeklyFrequencyLocal.length === 0) weeklyFrequencyLocal = null;
            }
          } else if (checked === true) {
            weeklyFrequencyLocal.push(index.toString());
          }
          if (weekDaysState !== undefined) {
            const weekDaysStateLocal = [...weekDaysState];
            weekDaysStateLocal[index] = checked;
            setWeekDaysState(weekDaysStateLocal);
          }
          setTemplateScheduleInfo({
            ...templateScheduleInfo,
            weeklyFrequency: weeklyFrequencyLocal,
          });

          if (
            templateScheduleInfoCopy !== undefined &&
            templateScheduleInfoCopy.current !== undefined
          ) {
            templateScheduleInfoCopy.current = {
              ...templateScheduleInfo,
              weeklyFrequency: weeklyFrequencyLocal,
            };
          }
        }
      }
    },
    [templateScheduleInfo, weekDaysState],
  );

  const handleChangeWeekDay0 = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleChangeWeekDay(0, checked);
    },
    [handleChangeWeekDay],
  );

  const handleChangeWeekDay1 = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleChangeWeekDay(1, checked);
    },
    [handleChangeWeekDay],
  );

  const handleChangeWeekDay2 = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleChangeWeekDay(2, checked);
    },
    [handleChangeWeekDay],
  );

  const handleChangeWeekDay3 = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleChangeWeekDay(3, checked);
    },
    [handleChangeWeekDay],
  );

  const handleChangeWeekDay4 = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleChangeWeekDay(4, checked);
    },
    [handleChangeWeekDay],
  );

  const handleChangeWeekDay5 = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleChangeWeekDay(5, checked);
    },
    [handleChangeWeekDay],
  );

  const handleChangeWeekDay6 = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleChangeWeekDay(6, checked);
    },
    [handleChangeWeekDay],
  );

  const handleCheckWeekDay = useCallback((): boolean => {
    let result = false;
    if (weekDaysState !== undefined && weekDaysState.length > 0) {
      for (let i = 0; i < weekDaysState.length; i += 1) {
        if (weekDaysState[i] === true) {
          result = weekDaysState[i];
          break;
        }
      }
    }
    return result;
  }, [weekDaysState]);

  const handleCheckMonthAndDay = useCallback((): boolean => {
    let result = false;

    if (
      templateScheduleInfo !== undefined &&
      templateScheduleInfo.monthlyFrequency_Month !== null &&
      templateScheduleInfo.monthlyFrequency_Month?.length > 0
    )
      result = true;

    if (
      result &&
      templateScheduleInfo !== undefined &&
      templateScheduleInfo.monthlyFrequency_Day !== null &&
      templateScheduleInfo.monthlyFrequency_Day?.length > 0
    )
      result = true;
    else result = false;

    return result;
  }, [templateScheduleInfo]);

  const handleOnChangeValue = (newValue: number) => {
    if (newValue !== undefined) {
      // setFrequency(newValue);
      if (templateScheduleInfo !== undefined) {
        setTemplateScheduleInfo({ ...templateScheduleInfo, dailyFrequency: newValue });
      }
      if (
        templateScheduleInfoCopy !== undefined &&
        templateScheduleInfoCopy.current !== undefined
      ) {
        templateScheduleInfoCopy.current = {
          ...templateScheduleInfo,
          dailyFrequency: newValue,
        };
      }
    }
  };

  const handleOnChangeSelectedMonthItems = (selectedList: ListItemDataSource[]) => {
    // console.info(selectedList);
    let monthlyFrequencyMonth: string[] | null = null;
    if (selectedList !== undefined && selectedList.length > 0) {
      if (selectedList.length > 0) monthlyFrequencyMonth = [];
      for (let i = 0; i < selectedList.length; i += 1) {
        monthlyFrequencyMonth?.push(selectedList[i].value);
      }
    }
    if (templateScheduleInfo !== undefined) {
      setTemplateScheduleInfo({
        ...templateScheduleInfo,
        monthlyFrequency_Month: monthlyFrequencyMonth,
      });
    }
    if (templateScheduleInfoCopy !== undefined && templateScheduleInfoCopy.current !== undefined) {
      templateScheduleInfoCopy.current = {
        ...templateScheduleInfo,
        monthlyFrequency_Month: monthlyFrequencyMonth,
      };
    }
  };

  const handleOnChangeSelectedDayItems = (selectedList: ListItemDataSource[]) => {
    // console.info(selectedList);
    let monthlyFrequencyDay: string[] | null = null;
    if (selectedList !== undefined && selectedList.length > 0) {
      if (selectedList.length > 0) monthlyFrequencyDay = [];
      for (let i = 0; i < selectedList.length; i += 1) {
        monthlyFrequencyDay?.push(selectedList[i].value);
      }
    }
    if (templateScheduleInfo !== undefined) {
      setTemplateScheduleInfo({
        ...templateScheduleInfo,
        monthlyFrequency_Day: monthlyFrequencyDay,
      });
    }
    if (templateScheduleInfoCopy !== undefined && templateScheduleInfoCopy.current !== undefined) {
      templateScheduleInfoCopy.current = {
        ...templateScheduleInfo,
        monthlyFrequency_Day: monthlyFrequencyDay,
      };
    }
  };

  // console.info('templateScheduleInfo:', templateScheduleInfo);

  useEffect(() => {
    if (onTemplateScheduleChanged !== undefined) {
      const templateScheduleInfoCopy2 = { ...templateScheduleInfo };

      if (templateScheduleInfoCopy2.playStartTime === '24:00:00')
        templateScheduleInfoCopy2.playStartTime = '00:00:00';

      if (templateScheduleInfoCopy2.playStartTime.includes('24:00:00'))
        templateScheduleInfoCopy2.playStartTime.replace('24:00:00', '00:00:00');

      if (templateScheduleInfoCopy2.playEndTime === '24:00:00')
        templateScheduleInfoCopy2.playEndTime = '00:00:00';

      if (templateScheduleInfoCopy2.playEndTime.includes('24:00:00'))
        templateScheduleInfoCopy2.playEndTime.replace('24:00:00', '00:00:00');

      const tempPlayStartTime: string[] = templateScheduleInfoCopy2.playStartTime
        .split(' ')[1]
        .split(':');
      if (tempPlayStartTime[0] === '24')
        templateScheduleInfoCopy2.playStartTime = String().concat(
          // templateScheduleInfoCopy2.playStartDate?.toString().split(' ')[0] ||
          templateScheduleInfoCopy2.playStartTime.split(' ')[0],
          ' ',
          '00',
          ':',
          tempPlayStartTime[1],
          ':',
          tempPlayStartTime[2],
        );

      const tempPlayEndTime: string[] = templateScheduleInfoCopy2.playEndTime
        .split(' ')[1]
        .split(':');
      if (tempPlayEndTime[0] === '24')
        templateScheduleInfoCopy2.playEndTime = String().concat(
          // templateScheduleInfoCopy2.playEndTime.split(' ')[0],
          // templateScheduleInfoCopy2.playStartDate?.toString().split(' ')[0] ||
          templateScheduleInfoCopy2.playStartTime.split(' ')[0],
          ' ',
          '00',
          ':',
          tempPlayEndTime[1],
          ':',
          tempPlayEndTime[2],
        );

      onTemplateScheduleChanged(templateScheduleInfoCopy2);
    }

    // if (templateSchedule !== undefined) setTemplateScheduleInfo(templateSchedule);
  }, [onTemplateScheduleChanged, templateScheduleInfo]);

  useEffect(() => {
    if (templateSchedule !== undefined) setTemplateScheduleInfo(templateSchedule);
  }, [templateSchedule]);

  return (
    <I18nProvider>
      <Grid className={classes.root}>
        <Grid container item>
          <Grid xs={12} sm={4}>
            <TemplateInfo
              adjustTemplateInfoRoot={classes.adjustTemplateInfoRoot}
              adjustKanbanBoxHeight={classes.adjustKanbanBoxHeight}
              setGridSMSize={12}
              templateIndex={templateIndex}
              templateTypeId={templateTypeId}
              templateTitle={templateTitle}
              displayBasicInfo={false}
              imageButtonWidth={180}
              imageButtonHeight={200}
            />
            <Box className={classes.playerSelectorBox}>
              <ESignagePlayerSelector
                selectedESignagePlayers={selectedESignagePlayers}
                displayAvailableList={false}
                width={180}
                height={800}
                emptyHeight={305}
                customListBoxHeight={345}
              />
            </Box>
          </Grid>
          <Grid xs={12} sm={8}>
            <Box p={2}>
              <Paper
                elevation={1}
                className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
              >
                <TextField
                  required
                  id="scheduleName"
                  label={t('Schedule Name')}
                  value={templateScheduleInfo && templateScheduleInfo.scheduleName}
                  fullWidth
                  onChange={handleScheduleNameChanged}
                  error={templateScheduleInfo && templateScheduleInfo.scheduleName === ''}
                  helperText={
                    templateScheduleInfo && templateScheduleInfo.scheduleName === ''
                      ? t("Schedule name can't be empty.")
                      : ' '
                  }
                />
              </Paper>
              <Paper
                elevation={1}
                className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
              >
                <Grid container item>
                  <Grid item xs={6} sm={6}>
                    <DateTimePicker
                      pickerType={DateTimePickerType.DATE_PICKER_INLINE}
                      inputDate={templateScheduleInfo && templateScheduleInfo.playStartDate}
                      labelName={String().concat(t('Play Start Date'), '*')}
                      onDateChange={handleOnStartDateChange}
                      maxDate={templateScheduleInfo && templateScheduleInfo.playEndDate}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <DateTimePicker
                      pickerType={DateTimePickerType.DATE_PICKER_INLINE}
                      inputDate={templateScheduleInfo && templateScheduleInfo.playEndDate}
                      labelName={String().concat(t('Play Expiration Date'), '*')}
                      onDateChange={handleOnEndDateChange}
                      minDate={templateScheduleInfo && templateScheduleInfo.playStartDate}
                    />
                  </Grid>
                </Grid>
              </Paper>
              <Paper
                elevation={1}
                className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
              >
                <Grid container item>
                  <Grid item xs={6} sm={6}>
                    <DateTimePicker
                      pickerType={DateTimePickerType.TIME_PICKER}
                      inputDate={
                        templateScheduleInfo && new Date(templateScheduleInfo.playStartTime)
                      }
                      labelName={String().concat(t('Play Start Time'), '*')}
                      onDateChange={handleOnStartTimeChange}
                      maxDate={templateScheduleInfo && new Date(templateScheduleInfo.playEndTime)}
                      error={
                        new Date(templateScheduleInfo.playEndTime.replace(' 24:', ' 00:')) <=
                        new Date(templateScheduleInfo.playStartTime.replace(' 24:', ' 00:'))
                      }
                      helperText={
                        new Date(templateScheduleInfo.playEndTime.replace(' 24:', ' 00:')) <=
                        new Date(templateScheduleInfo.playStartTime.replace(' 24:', ' 00:'))
                          ? t("The play start time can't be later than the play end time.")
                          : ' '
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <DateTimePicker
                      pickerType={DateTimePickerType.TIME_PICKER}
                      inputDate={templateScheduleInfo && new Date(templateScheduleInfo.playEndTime)}
                      labelName={String().concat(t('Play End Time'), '*')}
                      onDateChange={handleOnEndTimeChange}
                      minDate={templateScheduleInfo && new Date(templateScheduleInfo.playStartTime)}
                    />
                  </Grid>
                </Grid>
              </Paper>
              <Paper
                elevation={1}
                className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
              >
                <div
                  className={clsx(
                    classes.textFieldMarginBottom,
                    classes.textFieldPaddingTop,
                    classes.textLeft,
                  )}
                >
                  <InputLabel
                    style={{ color: theme2.palette.type === 'dark' ? '#fff' : '#1A2027' }}
                    id="Volume"
                  >
                    {t('Volume')}
                  </InputLabel>
                  <Stack
                    style={{ color: theme2.palette.type === 'dark' ? '#fff' : '#1A2027' }}
                    spacing={2}
                    direction="row"
                    sx={{ mb: 1 }}
                    alignItems="center"
                  >
                    <VolumeDown />
                    <Slider
                      aria-label={`$("Volume")`}
                      value={templateScheduleInfo && templateScheduleInfo.audioSetting}
                      onChange={handleAudioChanged}
                    />
                    <VolumeUp />
                  </Stack>
                </div>
                <Divider />
                {/* 循環模式 UI 起始位置 */}
                <div
                  className={clsx(
                    classes.textLeft,
                    classes.textFieldPaddingTop,
                    classes.loopModeWrapBox,
                  )}
                >
                  <FormControl fullWidth>
                    <FormLabel id="demo-radio-buttons-group-label">
                      {String().concat(t('Loop Mode'), '*')}
                    </FormLabel>
                    <div className={classes.loopModeBox}>
                      <div style={{ width: '30%' }}>
                        <RadioGroup
                          aria-labelledby={`$("demo-radio-buttons-group-label")`}
                          defaultValue="D"
                          name="radio-buttons-group"
                          value={templateScheduleInfo && templateScheduleInfo.loopMode}
                          onChange={handleChangeLoopMode}
                        >
                          <FormControlLabel value="D" control={<Radio />} label={t('Daily')} />
                          <FormControlLabel value="W" control={<Radio />} label={t('Weekly')} />
                          <FormControlLabel value="M" control={<Radio />} label={t('Monthly')} />
                        </RadioGroup>
                      </div>
                      <div className={classes.loopModeRightBox}>
                        {displayLoopModePanel[LoopMode.Daily] ? (
                          <Box
                            display="flex"
                            justifyContent="start"
                            alignItems="center"
                            className={classes.frequencyField}
                          >
                            <div>{t('Every')}</div>
                            <NumberInput
                              inputProps={{
                                label: t('Frequency'),
                                required: true,
                                min: 1,
                                max: 1000,
                                defaultValue:
                                  // dailyFrequencyTemp !== undefined && isNumber(dailyFrequencyTemp)
                                  //   ? dailyFrequencyTemp
                                  //   : 1,
                                  templateScheduleInfo !== undefined &&
                                  templateScheduleInfo.dailyFrequency !== undefined &&
                                  templateScheduleInfo.dailyFrequency !== null &&
                                  isNumber(templateScheduleInfo.dailyFrequency)
                                    ? templateScheduleInfo.dailyFrequency
                                    : 1,
                              }}
                              onChangeValue={handleOnChangeValue}
                            />
                            <div>{t('Day(s)')}</div>
                          </Box>
                        ) : null}
                        {displayLoopModePanel[LoopMode.Weekly] ? (
                          <div>
                            <FormGroup>
                              <div>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={weekDaysState && weekDaysState[0]}
                                      onChange={(event, checked) =>
                                        handleChangeWeekDay0(event, checked)
                                      }
                                      disabled={weekDaysCheckBoxDisabled[0]}
                                    />
                                  }
                                  label={t('Sunday')}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={weekDaysState && weekDaysState[1]}
                                      onChange={(event, checked) =>
                                        handleChangeWeekDay1(event, checked)
                                      }
                                      disabled={weekDaysCheckBoxDisabled[1]}
                                    />
                                  }
                                  label={t('Monday')}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={weekDaysState && weekDaysState[2]}
                                      onChange={(event, checked) =>
                                        handleChangeWeekDay2(event, checked)
                                      }
                                      disabled={weekDaysCheckBoxDisabled[2]}
                                    />
                                  }
                                  label={t('Tuesday')}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={weekDaysState && weekDaysState[3]}
                                      onChange={(event, checked) =>
                                        handleChangeWeekDay3(event, checked)
                                      }
                                      disabled={weekDaysCheckBoxDisabled[3]}
                                    />
                                  }
                                  label={t('Wednesday')}
                                />
                              </div>
                              <div>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={weekDaysState && weekDaysState[4]}
                                      onChange={(event, checked) =>
                                        handleChangeWeekDay4(event, checked)
                                      }
                                      disabled={weekDaysCheckBoxDisabled[4]}
                                    />
                                  }
                                  label={t('Thursday')}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={weekDaysState && weekDaysState[5]}
                                      onChange={(event, checked) =>
                                        handleChangeWeekDay5(event, checked)
                                      }
                                      disabled={weekDaysCheckBoxDisabled[5]}
                                    />
                                  }
                                  label={t('Friday')}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={weekDaysState && weekDaysState[6]}
                                      onChange={(event, checked) =>
                                        handleChangeWeekDay6(event, checked)
                                      }
                                      disabled={weekDaysCheckBoxDisabled[6]}
                                    />
                                  }
                                  label={t('Saturday')}
                                />
                              </div>
                              <div>
                                <FormHelperText
                                  error={!handleCheckWeekDay()}
                                  style={{ height: 20, marginLeft: 0 }}
                                >
                                  {!handleCheckWeekDay()
                                    ? t('At least one item is checked.')
                                    : null}
                                </FormHelperText>
                              </div>
                            </FormGroup>
                          </div>
                        ) : null}
                        {displayLoopModePanel[LoopMode.Monthly] ? (
                          <div className={classes.loopModeMonthlyField}>
                            <div>
                              <MultipleSelect
                                selectType={MultipleSelectType.DROPDOWN_CHECKBOX_TAG}
                                listTitle={t('Month')}
                                dataSource={monthsDataSource && monthsDataSource}
                                selectedItemsTextInput={
                                  monthlyFrequencyMonthTextInput && monthlyFrequencyMonthTextInput
                                }
                                disabledItems={
                                  monthlyFrequencyMonthCheckBoxDisabled &&
                                  monthlyFrequencyMonthCheckBoxDisabled
                                }
                                onChangeSelectedItems={handleOnChangeSelectedMonthItems}
                              />
                              <MultipleSelect
                                selectType={MultipleSelectType.DROPDOWN_CHECKBOX_TAG}
                                listTitle={t('Day')}
                                dataSource={daysDataSource && daysDataSource}
                                selectedItemsTextInput={
                                  monthlyFrequencyDayTextInput && monthlyFrequencyDayTextInput
                                }
                                disabledItems={
                                  monthlyFrequencyDayCheckBoxDisabled &&
                                  monthlyFrequencyDayCheckBoxDisabled
                                }
                                onChangeSelectedItems={handleOnChangeSelectedDayItems}
                              />
                            </div>
                            <div>
                              <FormHelperText
                                error={!handleCheckMonthAndDay()}
                                style={{ height: 20, marginLeft: 0 }}
                              >
                                {!handleCheckMonthAndDay()
                                  ? t("Month and Day fields can't be empty.")
                                  : null}
                              </FormHelperText>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </FormControl>
                </div>
                <Divider style={{ width: '100%' }} />
                {/* 發佈模式 UI 起始位置 */}
                <div
                  className={clsx(
                    classes.textLeft,
                    classes.textFieldPaddingTop,
                    classes.publishModeBox,
                  )}
                >
                  <FormControl fullWidth>
                    <FormLabel id="demo-radio-buttons-group-label">
                      {String().concat(t('Publish Mode'), '*')}
                    </FormLabel>
                    <Box display="flex">
                      <RadioGroup
                        aria-labelledby={`$("demo-radio-buttons-group-label")`}
                        defaultValue="I"
                        name="radio-buttons-group"
                        value={publishMode}
                        onChange={handleChangePublishMode}
                        className={classes.publishModeRadioGroup}
                      >
                        <FormControlLabel
                          value="I"
                          control={<Radio />}
                          label={t('Publish Immediately')}
                        />
                        <FormControlLabel
                          value="S"
                          control={<Radio />}
                          label={t('Scheduled Publish')}
                        />
                      </RadioGroup>
                      {displayPublishModePanel[1] ? (
                        <DateTimePicker
                          pickerType={DateTimePickerType.DATETIME_PICKER_INLINE}
                          inputDate={
                            templateScheduleInfo && templateScheduleInfo.scheduledDownloadTime
                          }
                          labelName={String().concat(t('Scheduled Publish DateTime'), '*')}
                          onDateChange={handleOnScheduledPublishDateTimeChange}
                          disablePast
                        />
                      ) : null}
                    </Box>
                  </FormControl>
                </div>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </I18nProvider>
  );
};

export default memo(ScheduleAndPublish);
