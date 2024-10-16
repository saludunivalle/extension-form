import React from 'react';
import { Stepper, Step, StepLabel, Box, useMediaQuery } from '@mui/material';

const FormStepper = ({ activeStep, steps, setCurrentSection, highestStepReached }) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const handleStepClick = (index) => {
    if (index <= highestStepReached - 1) {
      setCurrentSection(index + 1);
    }
  };

  return (
    <Box sx={{
      width: '100%',
      marginBottom: isSmallScreen ? '20px' : '0',
      paddingRight: '20px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center'
    }}>
      <Stepper activeStep={activeStep} orientation={isSmallScreen ? 'horizontal' : 'horizontal'}>
        {steps.map((label, index) => (
          <Step key={label} onClick={() => handleStepClick(index)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default FormStepper;
