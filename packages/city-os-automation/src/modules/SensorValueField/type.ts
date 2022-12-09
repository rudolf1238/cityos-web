import type { TextFieldProps } from '@material-ui/core/TextField';

export interface BaseSensorValueFieldProps
  extends Omit<
    TextFieldProps,
    'type' | 'children' | 'value' | 'variant' | 'autoComplete' | 'multiline' | 'rows' | 'rowsMax'
  > {
  value?: string;
}
