import { useCallback } from 'react';

import { weekDay } from '../libs/type';
import useAutomationTranslation from './useAutomationTranslation';
import type { WeekDay, WeekDayFormat } from '../libs/type';

interface UseWeekDayTranslationResponse
  extends Omit<ReturnType<typeof useAutomationTranslation>, 't'> {
  tWeekDay: (weekDay: WeekDay, format: WeekDayFormat) => string;
}

const useWeekDayTranslation = (): UseWeekDayTranslationResponse => {
  const { t, ...methods } = useAutomationTranslation('automation');

  const tWeekDay = useCallback(
    (dayNumber: WeekDay, format?: WeekDayFormat) => {
      const context = format ? { context: format } : undefined;
      const weekDays: string[] = t('weekDays', { returnObjects: true, ...context });
      return dayNumber === weekDay.SUNDAY ? weekDays[0] : weekDays[dayNumber];
    },
    [t],
  );

  return {
    ...methods,
    tWeekDay,
  };
};

export default useWeekDayTranslation;
