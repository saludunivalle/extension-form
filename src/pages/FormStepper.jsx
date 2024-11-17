import React from 'react';
import { Stepper, Step, StepLabel, Box, useMediaQuery } from '@mui/material';

const FormStepper = ({ activeStep, steps, setCurrentSection, highestStepReached, isMainStepper }) => {
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
      justifyContent: 'center',
    }}>
      <Stepper
        activeStep={activeStep}
        orientation={isSmallScreen ? 'horizontal' : 'horizontal'}
        sx={{
          '& .MuiStepLabel-label': {
            color: '#4F4F4F', // Estilo estándar
            fontWeight: 'normal', // Normal para no activos
          },
          '& .MuiStepLabel-label.Mui-active': {
            color: '#4B0082',// Azul intenso para activo
            fontWeight: 'bold', // Negrilla para activo
          },
          '& .MuiStepIcon-root': {
            fontSize: '24px', // Tamaño estándar
            color: '#4F4F4F', // Íconos no activos
          },
          '& .MuiStepIcon-root.Mui-active': {
            fontSize: '30px', // Tamaño más grande para activo
            color: '#4B0082',
          },
        }}
         
      > 
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
