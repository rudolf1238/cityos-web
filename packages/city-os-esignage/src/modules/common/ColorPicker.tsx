// import './styles.css';
import { Color, ColorPicker, createColor } from 'material-ui-color';
import { ThemeProvider, createMuiTheme, useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import React, { memo, useEffect, useState } from 'react';

import { blueGrey, deepOrange } from '@mui/material/colors';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: deepOrange,
    secondary: blueGrey,
    background: { default: '#080808', paper: '#121212' },
  },
});

interface ColorPickerComponentProps {
  displayName?: string | undefined;
  selectedColor?: string | undefined | '';
  onChangeColor?: (newColorVaule: Color) => void | null | undefined;
}

const ColorPickerComponent: React.VoidFunctionComponent<ColorPickerComponentProps> = (
  props: ColorPickerComponentProps,
): JSX.Element | null => {
  const { displayName, selectedColor, onChangeColor } = props;

  // setColor(`#${newValue.hex}`);
  const [color, setColor] = useState(() =>
    selectedColor !== undefined && selectedColor !== ''
      ? createColor(`#${selectedColor}`)
      : createColor('red'),
  );
  const [title, setTitle] = useState(displayName || '');
  const handleChange = (newValue: Color) => {
    if (onChangeColor !== undefined) onChangeColor(newValue);
    setColor(newValue);
  };

  const theme2 = useTheme();

  useEffect(() => setTitle(displayName || ''), [displayName]);

  return (
    <Container maxWidth="lg">
      <Box>
        {/* <Typography gutterBottom>Color Picker</Typography> */}
        <div
          style={{
            textAlign: 'left',
            color: theme2.palette.type === 'dark' ? '#fff' : '#1A2027',
          }}
        >
          {title}
          <ColorPicker value={color} onChange={handleChange} />
        </div>
      </Box>
      <Box>
        {/* <a href="https://github.com/mikbry/material-ui-color">made using material-ui-color</a> */}
      </Box>
    </Container>
  );
};

export default memo(ColorPickerComponent);
