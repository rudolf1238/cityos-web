import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { JSXElementConstructor, memo, useEffect } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

interface AlertDialogSlideProps {
  openDialog: boolean;
  dialogTitle?: string | null | undefined;
  dialogContentText?: string | null | undefined;
  yesButtonName: string | null | undefined;
  noButtonName: string | null | undefined;
  onChangeState?: (
    dialogState: boolean,
    returnValue?: string | undefined | 'YES' | 'NO',
  ) => void | null | undefined;
}

const Transition = React.forwardRef(
  (
    props: TransitionProps & {
      children: React.ReactElement<unknown, string | JSXElementConstructor<unknown>>;
    },
    ref: React.Ref<unknown>,
  ) => <Slide direction="up" ref={ref} {...props} />,
);

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiPaper-root': {
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.default : theme.palette.primary,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor:  theme.palette.type === 'dark'
        ? theme.palette.text.primary
        : theme.palette.info.main,
    },
    '& h2': {
      color: theme.palette.type === 'dark' ? theme.palette.text.primary : theme.palette.info.main,
    },
    '& p': {
      color: theme.palette.type === 'dark' ? theme.palette.text.primary : theme.palette.info.main,
    }
  },
}));

const AlertDialogSlide: React.VoidFunctionComponent<AlertDialogSlideProps> = (
  props: AlertDialogSlideProps,
): JSX.Element => {
  const classes = useStyles();
  const { openDialog, dialogTitle, dialogContentText, noButtonName, yesButtonName, onChangeState } =
    props;
  const [open, setOpen] = React.useState(openDialog);

  const handleClose = () => {
    setOpen(false);
    if (onChangeState !== undefined) onChangeState(false, 'YES');
  };

  const handleNoButtonClose = () => {
    setOpen(false);
    if (onChangeState !== undefined) onChangeState(false, 'NO');
  };

  useEffect(() => {
    setOpen(openDialog);
  }, [openDialog]);

  return (
    <div >
      <Dialog
        className={classes.root}
        open={open} 
        TransitionComponent={Transition}
        keepMounted 
        onClose={handleClose}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {dialogContentText}
          </DialogContentText>
        </DialogContent>
        {/* <DialogActions> */}
        <div style={{ textAlign: 'center' }}>
          {noButtonName !== undefined && noButtonName?.trim() !== '' && (
            <Button onClick={handleNoButtonClose}>{noButtonName}</Button>
          )}
          {yesButtonName !== undefined && yesButtonName?.trim() !== '' && (
            <Button onClick={handleClose}>{yesButtonName}</Button>
          )}
        </div>
        {/* </DialogActions> */}
      </Dialog>
    </div>
  );
};

export default memo(AlertDialogSlide);
