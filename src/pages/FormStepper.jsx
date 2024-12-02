import React from 'react';
import { Stepper, Step, StepLabel, Box, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';

// Componente personalizado para el ícono del paso
const CustomStepIconRoot = styled('div')(({ ownerState }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: ownerState.active
    ? '#0056b3' // Fondo azul para el paso activo
    : ownerState.completed
    ? '#0056b3' // Fondo morado para los pasos completados
    : '#E0E0E0', // Fondo gris si no está activo ni completado
  color: ownerState.active || ownerState.completed
    ? '#ffffff' // Letra blanca si es activo o completado
    : '#4F4F4F', // Letra gris oscuro si no está activo ni completado
  fontSize: 18,
}));

// Componente personalizado para el ícono del paso
const CustomStepIcon = (props) => {
  const { active, completed, className } = props;

  return (
    <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? <span>&#10003;</span> : props.icon}
    </CustomStepIconRoot>
  );
};

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
            color: '#4F4F4F', // Estilo estándar para etiquetas
            fontWeight: 'normal', // Normal para no activos
          },
          '& .MuiStepLabel-label.Mui-active': {
            color: '#FFFFFF', // Letra en blanco para el paso activo
            fontWeight: 'bold', // Negrilla para el paso activo
            backgroundColor: '#0056b3', // Fondo del paso activo
            borderRadius: '10px', // Redondear los bordes para que luzca mejor
            padding: '5px 10px', // Agregar padding para destacar el paso activo
          },
          '& .MuiStep-root.Mui-active': {
            '& .MuiStepIcon-root': {
              color: '#ffffff', // Asegurar que el ícono activo tenga letra blanca
              backgroundColor: '#0056b3', // Fondo azul para el ícono activo
              borderRadius: '50%', // Redondear el fondo del ícono activo
            },
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label} onClick={() => handleStepClick(index)}>
            <StepLabel StepIconComponent={(props) => (
              <CustomStepIcon {...props} active={index === activeStep} completed={index < activeStep} />
            )}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default FormStepper;
