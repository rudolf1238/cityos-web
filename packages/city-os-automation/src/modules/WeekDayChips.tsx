import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { weekDay } from '../libs/type';
import useWeekDayTranslation from '../hooks/useWeekDayTranslation';
import type { WeekDay, WeekDayFormat } from '../libs/type';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },

  chip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${theme.palette.grey[100]}`,
    borderRadius: '50%',
    backgroundColor: theme.palette.grey[50],
    width: 22,
    height: 22,
    color: theme.palette.grey[300],
  },

  effectiveChip: {
    color: theme.palette.grey[700],
    fontWeight: theme.typography.subtitle2.fontWeight,
  },

  clickableChip: {
    borderRadius: theme.shape.borderRadius * 0.5,
    padding: 0,
    width: 30,
    minWidth: 0,
    height: 30,
    color: theme.palette.text.subtitle,
  },

  effectiveClickableChip: {
    color: theme.palette.primary.contrastText,
  },
}));

interface WeekDayChipsProps {
  effectiveWeekday: WeekDay[] | null;
  format?: WeekDayFormat;
  onClick?: (dayNumber: WeekDay) => void;
  className?: string;
}

const WeekDayChips: VoidFunctionComponent<WeekDayChipsProps> = ({
  effectiveWeekday,
  format = '1-digit',
  onClick,
  className,
}: WeekDayChipsProps) => {
  const classes = useStyles();
  const { tWeekDay } = useWeekDayTranslation();

  return (
    <div className={clsx(classes.root, className)}>
      {Object.values(weekDay).map((dayNumber) => {
        const isEffective = effectiveWeekday?.includes(dayNumber);
        return onClick ? (
          <Button
            key={dayNumber.toString()}
            className={clsx(classes.clickableChip, {
              [classes.effectiveClickableChip]: isEffective,
            })}
            onClick={() => {
              onClick(dayNumber);
            }}
            variant={isEffective ? 'contained' : 'outlined'}
            color={isEffective ? 'primary' : undefined}
          >
            {tWeekDay(dayNumber, format)}
          </Button>
        ) : (
          <Typography
            key={dayNumber.toString()}
            className={clsx(classes.chip, {
              [classes.effectiveChip]: isEffective,
            })}
            variant="body2"
          >
            {tWeekDay(dayNumber, format)}
          </Typography>
        );
      })}
    </div>
  );
};

export default memo(WeekDayChips);
