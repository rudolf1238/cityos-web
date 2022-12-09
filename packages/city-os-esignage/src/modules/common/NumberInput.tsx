import React, { memo, useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';

const minLocal = 0;
const maxLocal = 10;
const requiredLocal = true;
const labelLocal = '';

type InputPropsType = {
  label?: string | undefined;
  required?: boolean | undefined;
  min?: number | undefined;
  max?: number | undefined;
  defaultValue?: number | undefined;
  canUpdateDefaultValue?: boolean | undefined;
};

interface NumberInputProps {
  inputProps?: InputPropsType | undefined;
  onChangeValue?: (newValue: number) => void | null | undefined;
}

const NumberInput: React.VoidFunctionComponent<NumberInputProps> = (props: NumberInputProps) => {
  const { inputProps, onChangeValue } = props;
  const [value, setValue] = useState<number>(() => {
    if (inputProps !== undefined) {
      if (inputProps.defaultValue !== undefined) {
        if (
          inputProps.min !== undefined &&
          inputProps.max !== undefined &&
          inputProps.defaultValue >= inputProps.min &&
          inputProps.defaultValue <= inputProps.max
        )
          return inputProps.defaultValue;

        if (inputProps.min !== undefined && inputProps.defaultValue < inputProps.min)
          return inputProps.min;

        if (inputProps.max !== undefined && inputProps.defaultValue > inputProps.max)
          return inputProps.max;

        return inputProps.defaultValue;
      }

      if (inputProps.min !== undefined) return inputProps.min;
      return 0;
    }
    return 0;
  });

  const [canUpdateDefaultValueLocal] = useState<boolean>(() => {
    if (inputProps !== undefined && inputProps.canUpdateDefaultValue !== undefined) {
      return inputProps.canUpdateDefaultValue;
    }
    return true;
  });

  useEffect(() => {
    if (canUpdateDefaultValueLocal) {
      if (inputProps !== undefined) {
        if (inputProps.defaultValue !== undefined) {
          if (
            inputProps.min !== undefined &&
            inputProps.max !== undefined &&
            inputProps.defaultValue >= inputProps.min &&
            inputProps.defaultValue <= inputProps.max
          ) {
            setValue(inputProps.defaultValue);
          } else if (inputProps.min !== undefined && inputProps.defaultValue < inputProps.min)
            setValue(inputProps.min);
          else if (inputProps.max !== undefined && inputProps.defaultValue > inputProps.max)
            setValue(inputProps.max);
          else setValue(inputProps.defaultValue);
        } else if (inputProps.min !== undefined) setValue(inputProps.min);
        else setValue(0);
      } else setValue(0);
    }
  }, [canUpdateDefaultValueLocal, inputProps]);

  return (
    <div>
      <TextField
        label={
          inputProps !== undefined && inputProps?.label !== undefined
            ? inputProps?.label
            : labelLocal
        }
        required={
          inputProps !== undefined && inputProps?.required !== undefined
            ? inputProps?.required
            : requiredLocal
        }
        fullWidth
        type="number"
        inputProps={
          inputProps !== undefined && inputProps?.min !== undefined && inputProps?.max !== undefined
            ? { min: inputProps?.min, max: inputProps?.max }
            : { min: minLocal, max: maxLocal }
        }
        value={value}
        onChange={(e) => {
          let valueLocal = parseInt(e.target.value, 10);

          if (
            inputProps !== undefined &&
            inputProps?.max !== undefined &&
            inputProps?.min !== undefined
          ) {
            if (valueLocal > inputProps?.max) valueLocal = inputProps?.max;
            if (valueLocal < inputProps?.min) valueLocal = inputProps?.min;
          } else {
            if (valueLocal > maxLocal) valueLocal = maxLocal;
            if (valueLocal < minLocal) valueLocal = minLocal;
          }

          setValue(valueLocal);
          if (onChangeValue !== undefined) onChangeValue(valueLocal);
        }}
        variant="outlined"
      />
    </div>
  );
};

export default memo(NumberInput);
