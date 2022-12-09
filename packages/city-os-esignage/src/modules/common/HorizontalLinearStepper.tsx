import * as React from 'react';
import { VoidFunctionComponent, memo, useCallback } from 'react';
import { useTheme } from '@material-ui/core/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import useESignageTranslation from '../../hooks/useESignageTranslation';

interface StepperProps {
  steps: string[];
  action?: string | undefined | 'NEXT' | 'BACK' | 'RESET';
  parentStep: number;
  optionalStep: number | undefined;
  displayStepHint?: boolean | undefined;
  displayStepNavi?: boolean | undefined;
  onChangeStep?: (activeStep: number) => void | null | undefined;
}

const HorizontalLinearStepper: VoidFunctionComponent<StepperProps> = (
  StepperPropsObject: StepperProps,
) => {
  const {
    steps,
    action,
    parentStep,
    optionalStep,
    displayStepHint,
    displayStepNavi,
    onChangeStep,
  } = StepperPropsObject;
  const { t } = useESignageTranslation(['esignage']);
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const isStepOptional = useCallback(
    (step: number) =>
      step ===
      (optionalStep !== undefined && optionalStep > -1 && optionalStep < steps.length
        ? optionalStep
        : -1),
    [optionalStep, steps.length],
  );
  const isStepSkipped = useCallback((step: number) => skipped.has(step), [skipped]);
  const theme = useTheme();

  const handleNext = useCallback(() => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    if (activeStep >= 0 && activeStep < steps.length) {
      const activeStepLocal = activeStep + 1;
      setActiveStep(activeStepLocal);
      if (onChangeStep !== undefined) onChangeStep(activeStepLocal);
    }
    setSkipped(newSkipped);
  }, [activeStep, isStepSkipped, onChangeStep, skipped, steps.length]);

  const handleParentNext = useCallback(() => {
    let newSkipped = skipped;
    if (isStepSkipped(parentStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(parentStep);
    }
    setActiveStep(() => parentStep);
    setSkipped(newSkipped);
  }, [isStepSkipped, parentStep, skipped]);

  const handleBack = () => {
    if (activeStep > 0 && activeStep <= steps.length) {
      const activeStepLocal = activeStep - 1;
      setActiveStep(activeStepLocal);
      if (onChangeStep !== undefined) onChangeStep(activeStepLocal);
    }
  };

  const handleParentBack = useCallback(() => {
    setActiveStep(parentStep);
  }, [parentStep]);

  const handleSkip = useCallback(() => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    if (activeStep >= 0 && activeStep < steps.length) {
      const activeStepLocal = activeStep + 1;
      setActiveStep(activeStepLocal);
      setSkipped((prevSkipped) => {
        const newSkipped = new Set(prevSkipped.values());
        newSkipped.add(activeStep);
        return newSkipped;
      });
      if (onChangeStep !== undefined) onChangeStep(activeStepLocal);
    }
  }, [activeStep, isStepOptional, onChangeStep, steps.length]);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    if (onChangeStep !== undefined) onChangeStep(0);
  }, [onChangeStep]);

  React.useEffect(() => {
    if (action !== undefined) {
      switch (action) {
        case 'NEXT':
          handleParentNext();
          break;
        case 'BACK':
          handleParentBack();
          break;
        case 'RESET':
          handleReset();
          break;
        default:
          break;
      }
    }
  }, [action, handleNext, handleParentBack, handleParentNext, handleReset]);

  return (
    <Box
      sx={{
        width: '100%',
        // width:
        // {
        //   xs: 200, // theme.breakpoints.up('xs')
        //   sm: 640, // theme.breakpoints.up('sm')
        //   md: 720, // theme.breakpoints.up('md')
        //   lg: 1080, // theme.breakpoints.up('lg')
        //   xl: 1920, // theme.breakpoints.up('xl')
        // },
      }}
    >
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = <Typography variant="caption">({t('Optional')})</Typography>;
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>
                <div style={{ color: theme.palette.type === 'dark' ? '#fff' : '#182245' }}>
                  {' '}
                  {label}{' '}
                </div>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>
            {' '}
            {t("Completed! You're finished all steps.")}
          </Typography>
          {displayStepNavi && (
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleReset}>{t('Reset')}</Button>
            </Box>
          )}
        </>
      ) : (
        <>
          {!displayStepHint && !displayStepNavi && (
            <div style={{ marginTop: 15, marginBottom: 15 }} />
          )}
          <div
            style={{
              color: 'gray',
              textAlign: 'center',
              display: displayStepHint !== undefined && displayStepHint ? 'block' : 'none',
            }}
          >
            <Typography sx={{ mt: 2, mb: 1 }}>
              {t('Step')} {activeStep + 1}
            </Typography>
          </div>
          <div
            style={{
              color: 'gray',
              textAlign: 'center',
              display: displayStepNavi !== undefined && displayStepNavi ? 'block' : 'none',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                {t('Back')}
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {isStepOptional(activeStep) && (
                <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                  {t('Skip')}
                </Button>
              )}
              <Button onClick={handleNext}>
                {activeStep === steps.length - 1 ? t('Finish') : t('Next')}
              </Button>
            </Box>
          </div>
        </>
      )}
    </Box>
  );
};

export default memo(HorizontalLinearStepper);
