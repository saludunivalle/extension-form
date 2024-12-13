import React, { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, Box, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';
import CheckIcon from '@mui/icons-material/Check'; // Icono para los pasos completados

// Componente personalizado para el ícono del paso
const CustomStepIconRoot = styled('div')(({ ownerState }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: ownerState.completed
    ? '#0056b3' // Fondo azul para los pasos completados
    : ownerState.active
    ? '#0056b3' // Fondo azul para el paso activo
    : '#E0E0E0', // Fondo gris si no está activo ni completado
  color: ownerState.completed || ownerState.active
    ? '#ffffff' // Letra blanca si es activo o completado
    : '#4F4F4F', // Letra gris oscuro si no está activo ni completado
  fontSize: 18,
}));

const CustomStepIcon = ({ active, completed, index }) => (
  <CustomStepIconRoot ownerState={{ active, completed }}>
    {completed ? <CheckIcon /> : index + 1}
  </CustomStepIconRoot>
);

const FormStepper = ({ activeStep, steps, setCurrentSection }) => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [highestStepReached, setHighestStepReached] = useState(activeStep);
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  // Actualizar pasos completados y el paso más alto alcanzado
  useEffect(() => {
    setCompletedSteps((prev) => {
      if (!prev.includes(activeStep)) {
        return [...prev, activeStep];
      }
      return prev;
    });

    setHighestStepReached((prev) => Math.max(prev, activeStep));
  }, [activeStep]);

  const handleStepClick = (index) => {
    if (index <= highestStepReached) {
      setCurrentSection(index + 1); // Permitir navegación solo hasta el paso más alto alcanzado
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        marginBottom: isSmallScreen ? '20px' : '0',
        paddingRight: '20px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <Stepper
        activeStep={activeStep}
        orientation={isSmallScreen ? 'horizontal' : 'horizontal'}
        sx={{
          '& .MuiStepLabel-label': {
            color: '#4F4F4F',
            fontWeight: 'normal',
          },
          '& .MuiStepLabel-label.Mui-active': {
            color: '#FFFFFF',
            fontWeight: 'bold',
            backgroundColor: '#0056b3',
            borderRadius: '10px',
            padding: '5px 10px',
          },
          '& .MuiStep-root': {
            cursor: 'pointer',
          },
          '& .MuiStep-root.Mui-active': {
            '& .MuiStepIcon-root': {
              color: '#ffffff',
              backgroundColor: '#0056b3',
              borderRadius: '50%',
            },
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={index} onClick={() => handleStepClick(index)}>
            <StepLabel
              StepIconComponent={(props) => (
                <CustomStepIcon
                  {...props}
                  index={index}
                  active={index === activeStep}
                  completed={completedSteps.includes(index)}
                />
              )}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default FormStepper;
